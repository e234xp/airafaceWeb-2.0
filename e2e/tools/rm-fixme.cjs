// 用法：node e2e/tools/rm-fixme.cjs <spec 檔> <Test ID,...>  移除該檔中指定 Test ID 的 test.fixme 行（含上方註解行）
const fs = require('fs');
const [file, ids] = process.argv.slice(2);
let lines = fs.readFileSync(file, 'utf8').split('\n');
let removed = 0;
for (const id of ids.split(',')) {
  const i = lines.findIndex((l) => l.includes('test.fixme') && l.includes(`[${id}]`));
  if (i < 0) continue;
  lines.splice(i, 1);
  removed += 1;
  while (i > 0 && lines[i - 1].trim().startsWith('//') && !lines[i - 1].includes('以下維持')) { lines.splice(i - 1, 1); }
}
fs.writeFileSync(file, lines.join('\n'));
console.log('removed', removed);
