const { Command } = require('commander');
const { getWordpressData } = require('./lib/resources');
const { saveDataAsNdJson } = require('./lib/ndjson');

const program = new Command();

// FIXME - I would add some "--help" option with the basic description
// FIXME - there is inconsistency in names between line 10 i 13.
// FIXME - In the line below I would extend the description somehow: What is base URL and what the "endpoint" means. Also add some example.
program.option('-u, --url <api-url>', 'base url without endpoint ').parse(process.argv);

if (!program.url) {
  console.error('Please provide correct "--url" option. <wordpress-site-url>');
  process.exit(1);
}
const baseUrl = program.url;

(async () => {
  const mappedWordpressData = await getWordpressData(baseUrl);
  saveDataAsNdJson(mappedWordpressData);
})();
