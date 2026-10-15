const fs = require('fs');
const plan = JSON.parse(fs.readFileSync('e2e/plan-ids.json', 'utf8'));
const res = fs.readFileSync('E2E-TEST-RESULTS_2026-10-07.md', 'utf8');
const done = new Set();
for (const line of res.split('\n')) {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(line);
  if (m) done.add(m[1]);
}
const mod = (id) => id.split('-')[0];
const groups = {};
for (const p of plan) {
  if (done.has(p.id)) continue;
  const key = `${p.status}|${p.feasibility}`;
  groups[key] = groups[key] || {};
  groups[key][mod(p.id)] = (groups[key][mod(p.id)] || 0) + 1;
}
console.log('plan', plan.length, 'done', done.size);
for (const [k, v] of Object.entries(groups)) {
  const total = Object.values(v).reduce((a, b) => a + b, 0);
  console.log(k, total, JSON.stringify(v));
}
