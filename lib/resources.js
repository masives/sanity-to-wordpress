const axios = require('axios');
const fs = require('fs');
const sanitizeHTML = require('sanitize-html'); // FIXME - not used dependency ?
const he = require('he');
const blockTools = require('@sanity/block-tools').default;  // FIXME - not used dependency ?

const { parseBody, missingImagesBlocklist } = require('./parseBody');

const itemsPerPage = 100; // FIXME - maybe uppercase this constant?

errorsLogFileName = 'resources.errors.log';
// clean errors log
fs.writeFileSync(errorsLogFileName, '');
const errorsStream = fs.createWriteStream(errorsLogFileName, { flags: 'a' });

const getAllWordpressPages = async (resourceEndpoint) => {
  const count = await axios.get(resourceEndpoint).then((response) => {
    return response.headers['x-wp-totalpages'];
  });

  const promiseArray = [];

  for (let i = 0; i < count; i++) {
    const endpoint = `${resourceEndpoint}&page=${i + 1}`;
    promiseArray.push(axios.get(endpoint));
  }
  const responseArrays = await Promise.all(promiseArray);
  // flatten the array of arrays
  return [].concat.apply(
    [],
    responseArrays.map(({ data }) => data),
  );
};

const getWpMedia = async (wpApiUrl) => {
  const mediaEndpoint = `${wpApiUrl}/media?per_page=${itemsPerPage}`;

  return getAllWordpressPages(mediaEndpoint).then((data) => data.map(({ id, guid }) => ({ id, url: guid.rendered })));
};

const getUsers = (wpApiUrl) => {
  const usersEndpoint = `${wpApiUrl}/users?per_page=${itemsPerPage}`;

  // FIXME use async/await
  // FIXME - dont use data as a variable; rename to "users" or "wpUsers" - or whatever more relevant
  return getAllWordpressPages(usersEndpoint).then((data) => {
    return data.map(({ id, name, slug, description, avatar_urls }) => {
      return {
        _id: `author-${id}`,
        _type: 'author',
        name,
        slug: { current: slug },
        description: description, // FIXME - use shorthand like with "name" property
        image: avatar_urls
          ? {
            _type: 'mainImage',
            _sanityAsset: 'image@' + avatar_urls['96'],
          }
          : undefined, // FIXME - 53-58; extract as a variable or separate method; use shorthand assignment
      };
    });
  });
};

const getCategories = (wpApiUrl) => {
  const categoriesEndpoint = `${wpApiUrl}/categories?per_page=${itemsPerPage}`;
  // FIXME use async/await
  // FIXME - dont use data as a variable; rename to "categories" or "wpCategories" - or whatever more relevant
  return getAllWordpressPages(categoriesEndpoint).then((data) => {
    return data.map(({ id, name }) => {
      return {
        _id: `category-${id}`,
        _type: 'category',
        title: name,
      };
    });
  });
};

const getPosts = async (wpApiUrl, wpMedia) => {
  const postsEndpoint = `${wpApiUrl}/posts?per_page=${itemsPerPage}`;
  // FIXME use async/await
  // FIXME - dont use data as a variable; rename to "posts" - or whatever more relevant
  return getAllWordpressPages(postsEndpoint).then((data) => {
    return data.map(({ id, title, slug, categories, author, featured_media, date, content, excerpt }) => {
      const featuredMedia = wpMedia.find(({ id }) => id == featured_media);
      const isFeaturedMediaValid = featuredMedia && !missingImagesBlocklist.includes(featuredMedia.url);
      const { blocks: parsedBody, errors } = parseBody(content.rendered);
      const { blocks: parsedExcerpt } = parseBody(excerpt.rendered);

      // FIXME - I would extract below errors handling to separate method with some readable name what kind of errors do we have here
      if (errors.isUsingCdnImages) {
        const errorMessage = `cannot download media from google cdn for blogpost id:${id} title: ${title.rendered} \n`;
        errorsStream.write(errorMessage);
        console.info(errorMessage);
      }
      if (errors.hasBlocklistedImage) {
        const errorMessage = `cannot download non existing image for blogpost id:${id} title: ${title.rendered} \n`;
        errorsStream.write(errorMessage);
        console.info(errorMessage);
      }

      if (!featuredMedia) {
        const errorMessage = `missing featured media for blogpost id:${id} title: ${title.rendered} \n`;
        errorsStream.write(errorMessage);
        console.info(errorMessage);
      }

      return {
        _id: `post-${id}`,
        _type: 'post',
        title: he.decode(title.rendered),
        slug: {
          current: slug,
        },
        publishedAt: date,
        categories: categories.map((id) => {
          return {
            _type: 'reference',
            _ref: `category-${id}`,
          };
        }), // FIXME - 114-119; extract as a variable or separate method above; use shorthand assignment
        authors: [
          {
            _type: 'authorReference',
            author: {
              _type: 'reference',
              _ref: `author-${author}`,
            },
          },
        ], // FIXME - 120-128; extract as a variable or separate method above; use shorthand assignment
        mainImage: isFeaturedMediaValid
          ? {
            type: 'mainImage',
            _sanityAsset: `image@${featuredMedia.url}`,
          }
          : undefined, // FIXME - 129-134; extract as a variable or separate method above; use shorthand assignment
        excerpt: parsedExcerpt,
        body: parsedBody,
      };
    });
  });
};

module.exports.getWordpressData = async (baseUrl) => {
  const wpApiUrl = `${baseUrl}/wp-json/wp/v2`;
  const wpMedia = await getWpMedia(wpApiUrl);
  // FIXME - why do you mix asynx/await with "promise/then" syntax - I would keep the async await
  // const [users, categories, blogpost] = await Promise.all([getUsers(wpApiUrl), getCategories(wpApiUrl), getPosts(wpApiUrl, wpMedia)])
  // return [...users, ...categories, ...blogPosts];
  return Promise.all([getUsers(wpApiUrl), getCategories(wpApiUrl), getPosts(wpApiUrl, wpMedia)]).then(([users, categories, blogPosts]) => {
    return [...users, ...categories, ...blogPosts];
  });
};
