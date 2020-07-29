const { getCategories, getPosts, getUsers, getWpMedia } = require('./lib/resources');
const { saveDataAsNdJson } = require('./lib/ndjson');

(async () => {
  // download links to all wordpress_media which are referenced in posts
  const wpMedia = await getWpMedia();

  Promise.all([getUsers(), getCategories(), getPosts(wpMedia)]).then(([users, categories, blogPosts]) => {
    const totalData = [...users, ...categories, ...blogPosts];
    saveDataAsNdJson(totalData);
  });
})();
