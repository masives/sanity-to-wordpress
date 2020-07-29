const ndjson = require('ndjson');
const fs = require('fs');

const serialize = ndjson.serialize();

module.exports.saveDataAsNdJson = (dataArray) => {
  const fileName = 'wordpress-data.ndjson';

  // clean file if it's not the first run
  fs.writeFileSync(fileName, '');

  const stream = fs.createWriteStream(fileName, { flags: 'a' });
  const serialize = ndjson.serialize();

  serialize.on('data', function(line) {
    stream.write(line);
  });
  dataArray.forEach((element) => {
    serialize.write(element);
  });
  serialize.end();
};
