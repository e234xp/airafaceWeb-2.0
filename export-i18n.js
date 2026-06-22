const ExcelJS = require('exceljs');
const path = require('path');

const langFiles = {
  en: require('./src/i18n/en.json'),
  zh: require('./src/i18n/zh.json'),
  ja: require('./src/i18n/jp.json'),
  es: require('./src/i18n/es.json'),
  fr: require('./src/i18n/fr.json'),
  th: require('./src/i18n/th.json'),
  vi: require('./src/i18n/vi.json'),
  id: require('./src/i18n/id.json'),
  tr: require('./src/i18n/tr.json'),
  ko: require('./src/i18n/ko.json'),
  pt: require('./src/i18n/pt.json'),
};

const langs = Object.keys(langFiles);

// Collect all unique keys
const allKeys = new Set();
for (const lang of langs) {
  for (const key of Object.keys(langFiles[lang])) {
    if (key) allKeys.add(key); // skip empty key
  }
}
const sortedKeys = [...allKeys].sort((a, b) => a.localeCompare(b));

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('i18n');

  // Header row
  sheet.columns = [
    { header: 'Key', key: 'key', width: 45 },
    ...langs.map(lang => ({ header: lang, key: lang, width: 40 })),
  ];

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' },
  };

  // Data rows
  for (const key of sortedKeys) {
    const row = { key };
    for (const lang of langs) {
      row[lang] = langFiles[lang][key] ?? '';
    }
    sheet.addRow(row);
  }

  // Auto filter
  sheet.autoFilter = {
    from: 'A1',
    to: String.fromCharCode(65 + langs.length) + '1',
  };

  const outputPath = path.join(__dirname, 'i18n-translations.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel exported to: ${outputPath}`);
  console.log(`Total keys: ${sortedKeys.length}, Languages: ${langs.join(', ')}`);
}

main().catch(console.error);
