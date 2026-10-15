// 用法：node e2e/tools/gen-fixme.cjs <檔案> <模組> <已實作的編號，逗號分隔>
// 把 plan-ids.json 中該模組「未實作」的 Test ID 以 test.fixme 補到 spec 檔最後一個 "});" 之前。
const fs = require('fs');
const [file, mod, implemented] = process.argv.slice(2);
const done = new Set(implemented.split(','));
const plan = require('../plan-ids.json').filter((x) => x.id.startsWith(`${mod}-`) && !done.has(x.id.split('-')[1]));
const quote = (t) => "'" + t.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const lines = plan.map((x) => {
  const c = x.status === '暫不測' ? '  // 暫不測：使用者於 2026-10-07 同意暫不測\n' : '';
  return `${c}  test.fixme(${quote(`[${x.id}] ${x.title}`)}, async () => {});`;
});
const s = fs.readFileSync(file, 'utf8');
const i = s.lastIndexOf('});');
fs.writeFileSync(file, s.slice(0, i) + '\n  // ---- 以下維持 fixme（部分自動化／暫不測／需實體） ----\n' + lines.join('\n') + '\n' + s.slice(i));
console.log(file, '加入', lines.length, '行 fixme');
