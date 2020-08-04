const ndjson = require('ndjson');
const fs = require('fs');

const serialize = ndjson.serialize();

const chunk = (arr, chunkSize) => {
  var R = [];
  for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
  return R;
};

module.exports.saveDataAsNdJson = (dataArray, chunkSize) => {
  const chunkedData = chunk(dataArray, 50);

  chunkedData.forEach((data, index) => {
    const fileName = `wordpress-data-${index}.ndjson`;

    // clean file if it's not the first run
    fs.writeFileSync(fileName, '');
    const stream = fs.createWriteStream(fileName, { flags: 'a' });
    const serialize = ndjson.serialize();

    serialize.on('data', function (line) {
      stream.write(line);
    });
    data.forEach((element) => {
      serialize.write(element);
    });
    serialize.end();
  });
};
