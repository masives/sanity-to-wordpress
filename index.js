const { Command } = require('commander');
const { getWordpressData } = require('./lib/resources');
const { saveDataAsNdJson } = require('./lib/ndjson');

const startsWithHttpRegex = /^https?:\/\//;
const program = new Command();

program.option('-u, --url <api-url>', 'base url without endpoint ').parse(process.argv);

if (!program.url) {
  console.error('Please provide --url <wordpress-site-url>');
  process.exit(1);
}

if (!startsWithHttpRegex.test(program.url)) {
  console.error('Url has to start with protocol http:// or https://');
  process.exit(1);
}

const baseUrl = program.url;

(async () => {
  const mappedWordpressData = await getWordpressData(baseUrl);
  saveDataAsNdJson(mappedWordpressData);
})();
