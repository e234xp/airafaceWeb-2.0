
const fs = require('fs');
const path = require('path');

// * ///////////////////////////////////////////
// * Main Process
// * ///////////////////////////////////////////

const alias4Language = {};  // how many langs define in locale
let languageKeys = new Set();    // all of the languang keys
let csvFileHead = '';                         // output csv file header (ex: ,en,jp,...)
let languageCols = 0;                         // how many columns for language alias
let languageRows = 0;                         // how many rows for language key

const languageFolder = './src/i18n';        // source folder for language files
const files = fs.readdirSync(languageFolder, { withFileTypes: true });

for (const file of files) {
  // ## only support json to csv
  const item = path.parse(file.name);
  if (item.ext !== '.json') continue;

  // ## read json file from /src/locale
  const filepath = `${languageFolder}/${item.base}`;
  const json = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf8' }));

  // ## initialize structure
  csvFileHead += `,${item.name}`;
  alias4Language[item.name] = json;
  Object.keys(json).forEach((key) => languageKeys.add(key));
  languageCols += 1;
  languageRows = languageKeys.size;
}

// ## sort all of keys
const sort = Array.from(languageKeys).sort();
languageKeys = new Set(sort);

// ## initialize output csv file
const csv = [];
for (let row = 0; row < languageRows; ++row) {
  csv.push(new Array(languageCols + 1).fill(''));
  csv[row][0] = [...languageKeys][row];
}

// ## fill translate string into csv structure
const regex = /\"/ig;
Object.keys(alias4Language).forEach((alias, col) => {
  const langJson = alias4Language[alias];
  Object.keys(langJson).forEach((key) => {
    const row = [...languageKeys].indexOf(key);
    if (row === -1) {
      console.error(`<gen-i18n2csv> error:1`);
    } else {
      // col+1, because of the column 0 is i18n key string, 
      // so we alway shift 1 to fill the real string value.
      csv[row][col + 1] = `"${langJson[key].replace(regex, '""')}"`;
    }
  });
});

// ## output csv to /src/local folder
let csvFileBody = '';
for (let row = 0; row < languageRows; ++row) {
  let rowstr = csv[row].join(',');
  csvFileBody += `${rowstr}\n`;
}

const output = `${csvFileHead}\n${csvFileBody}`;
fs.writeFileSync(`${languageFolder}/i18n.csv`, output);