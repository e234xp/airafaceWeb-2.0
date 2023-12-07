// tslint:disable: no-var-requires
const fs = require('fs');
const csvtojson = require('csvtojson');

// * ///////////////////////////////////////////
// * Main Process
// * ///////////////////////////////////////////

const languageFolder = './src/i18n';  // source folder for language files
const outputJosnFile = {};  // output json file data structure

csvtojson().fromFile(`${languageFolder}/i18n.csv`).then((jsonObj) => {

  // ## process record
  function processJson(data) {
    let i18nKey = data.field1;
    Object.keys(data).forEach((language) => {

      if (language === 'field1') return;
      else if (i18nKey === null) return;

      if (!outputJosnFile[language]) {
        outputJosnFile[language] = {};
      }

      outputJosnFile[language][i18nKey] = data[language];
    });
  }

  // ## for loop all of records
  jsonObj.forEach(processJson);

  // ## write result to .json file
  Object.keys(outputJosnFile).forEach((language) => {
    fs.writeFileSync(
      `${languageFolder}/${language}.json`,
      JSON.stringify(outputJosnFile[language], null, 2)
    );
  });

});