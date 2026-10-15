// 用法：node e2e/tools/plan-show.cjs CAM 002,005,007  → 印出 Plan 中指定 Test ID 的來源／步驟／預期／備註
const fs = require('fs');
const [mod, list] = process.argv.slice(2);
const text = fs.readFileSync('E2E-TEST-PLAN.md', 'utf8');
const blocks = text.split(/\n(?=### [A-Z0-9]+-\d+ )/);
for (const n of list.split(',')) {
  const id = `${mod}-${n}`;
  const b = blocks.find((x) => x.startsWith(`### ${id} `));
  if (!b) {
    console.log(id, '(not found)');
    continue;
  }
  const field = (k) => {
    const m = new RegExp('\\*\\*' + k + '\\*\\*：([\\s\\S]*?)(?=\\n- \\*\\*|$)').exec(b);
    return m ? m[1].replace(/```text/g, '').replace(/```/g, '').replace(/\n\s*\n/g, '\n').trim() : '';
  };
  console.log(b.split('\n')[0]);
  console.log('  來源:', field('原始規格來源'));
  console.log('  步驟:', field('測試步驟').replace(/\n/g, '\n        '));
  console.log('  預期:', field('預期結果').replace(/\n/g, '\n        '));
  console.log('  備註:', field('備註 / 待確認事項'));
}
