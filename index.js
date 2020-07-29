const {Command} = require('commander')
const { getWordpressData } = require('./lib/resources');
const { saveDataAsNdJson } = require('./lib/ndjson');

const program = new Command()

program.option('-u, --url <api-url>', 'base url without endpoint ')
.parse(process.argv);

if(!program.url) {
  console.error('Please provide --url <wordpress-site-url>')
  process.exit(1)
}
const baseUrl = program.url;

(async () => {
  // download links to all wordpress_media which are referenced in posts
const mappedWordpressData = await getWordpressData(baseUrl)
saveDataAsNdJson(mappedWordpressData);
})();
