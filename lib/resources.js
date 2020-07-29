const axios = require('axios');
const fs = require('fs');
const sanitizeHTML = require('sanitize-html');
const he = require('he');
const { parseBody, missingImagesBlacklist } = require('./parseBody');

const itemsPerPage = 100;


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
  return [].concat.apply([], responseArrays.map(({ data }) => data));
};

const getWpMedia = async (wpApiUrl) => {
  const mediaEndpoint = `${wpApiUrl}/media?per_page=${itemsPerPage}`;

  return getAllWordpressPages(mediaEndpoint).then((data) => data.map(({ id, guid }) => ({ id, url: guid.rendered })));
};

const getUsers = (wpApiUrl) => {
  const usersEndpoint = `${wpApiUrl}/users?per_page=${itemsPerPage}`;

  return getAllWordpressPages(usersEndpoint).then((data) => {
    return data.map(({ id, name, description, avatar_urls }) => {
      return {
        _id: `employee-${id}`,
        _type: 'employee',
        name,
        description: description,
        image: {
          _type: 'image',
          _sanityAsset: 'image@' + avatar_urls['96'],
        },
      };
    });
  });
};

const getCategories = (wpApiUrl) => {
  const categoriesEndpoint = `${wpApiUrl}/categories?per_page=${itemsPerPage}`;

  return getAllWordpressPages(categoriesEndpoint).then(( data ) => {
    return data.map(({ id, name, slug }) => {
      return {
        _id: `category-${id}`,
        _type: 'blogCategory',
        title: name,
        slug: { current: slug },
        shouldDisplayInNav: true,
      };
    });
  });
};

const getPosts = async (wpApiUrl,wpMedia) => {
  const postsEndpoint = `${wpApiUrl}/posts?per_page=${itemsPerPage}`;

  return getAllWordpressPages(postsEndpoint).then((data) => {
    return data.map(({ id, title, slug, categories, author, featured_media, date, content, excerpt }) => {
      const featuredMedia = wpMedia.find(({ id }) => id == featured_media);
      const isFeaturedMediaValid = featuredMedia && !missingImagesBlacklist.includes(featuredMedia.url);
      const { blocks: parsedBody, errors } = parseBody(content.rendered);

      if (errors.isUsingCdnImages) {
        const errorMessage = `cannot download media from google cdn for blogpost id:${id} title: ${title.rendered} \n`;
        errorsStream.write(errorMessage);
        console.info(errorMessage);
      }
      if (errors.hasBlacklistedImage) {
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
        _type: 'blogPost',
        title: he.decode(title.rendered),
        slug: {
          current: slug,
        },
        categories: categories.map((id) => {
          return {
            _type: 'reference',
            _ref: `category-${id}`,
          };
        }),
        author: {
          _type: 'reference',
          _ref: `employee-${author}`,
        },
        createdAt: date,
        featuredImage: isFeaturedMediaValid
          ? {
              type: 'image',
              _sanityAsset: `image@${featuredMedia.url}`,
            }
          : undefined,
        seo: {
          type: 'seo-tools',
          focus_keyword: '',
          focus_synonyms: [],
          seo_title: title.rendered,
          meta_description: sanitizeHTML(excerpt.rendered, { allowedTags: [], allowedAttributes: {} }),
        },
        body: parsedBody,
      };
    });
  });
};



module.exports.getWordpressData =  async (baseUrl) => {
  const wpApiUrl = `${baseUrl}/wp-json/wp/v2`;
  const wpMedia = await getWpMedia(wpApiUrl);
  return Promise.all([getUsers(wpApiUrl), getCategories(wpApiUrl), getPosts(wpApiUrl,wpMedia)]).then(([users, categories, blogPosts]) => {
    return  [...users, ...categories, ...blogPosts];
  });
}
