import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md；WEL-009、ATB-021、OCC-006（看板維持等比例 16:9）、SEC-001（保全模式不隨畫面尺寸改變）。
// 以調整瀏覽器視窗大小模擬「直接縮放瀏覽器」。全程只讀。

const SIZES: Array<[number, number]> = [
  [1280, 720],
  [1920, 1080],
  [1000, 800],
  [800, 1000],
];

async function boardBox(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector('.ratio-content') as HTMLElement | null;
    const logo = document.querySelector('.dashboard-attendance-logo, .welcome-logo') as HTMLElement | null;
    const r = el ? el.getBoundingClientRect() : null;
    const l = logo ? logo.getBoundingClientRect() : null;
    return { w: r ? r.width : 0, h: r ? r.height : 0, logoW: l ? l.width : 0 };
  });
}

async function measure(page: Page, route: string) {
  const out: Array<{ size: string; w: number; h: number; ratio: number; logoW: number }> = [];
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route);
  await page.reload();
  await page.locator('.ratio-content').first().waitFor();
  await page.waitForTimeout(3000);
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1200);
    const b = await boardBox(page);
    out.push({ size: `${w}x${h}`, w: Math.round(b.w), h: Math.round(b.h), ratio: b.h ? b.w / b.h : 0, logoW: Math.round(b.logoW) });
  }
  return out;
}

const boards: Array<{ id: string; title: string; route: string; row: number; no: string; cat: string; steps: string; expected: string }> = [
  { id: 'WEL-009', title: '迎賓看板：直接縮放瀏覽器，維持等比例 16:9', route: '/#/welcomemode', row: 120, no: '', cat: '（延續）> Welcome dashboard', steps: '調整 16:9 的比例放大/縮小\n1. 直接縮放browser', expected: '不論瀏覽器大小、迎賓看板需維持等比例16:9' },
  { id: 'OCC-006', title: '容留看板 RWD：直接縮放瀏覽器維持等比例 16:9', route: '/#/capacitymode', row: 131, no: '', cat: '（延續）> RWD', steps: 'Occupancy dashboard 須能維持 16:9 的比例放大/縮小\n1. 直接縮放browser', expected: '不論瀏覽器大小、容留看板需維持等比例16:9' },
];

test.describe('看板 RWD', () => {
  for (const b of boards) {
    test(
      `[${b.id}] ${b.title}`,
      {
        annotation: [
          ...csvAnnotations({ row: b.row, no: b.no, category: b.cat, steps: b.steps, expected: b.expected }),
          { type: '判定範圍', description: '以視窗 1280x720、1920x1080（16:9）與 1000x800、800x1000（非 16:9）量測看板主容器 .ratio-content 的寬高比，皆應為 16:9（容許 1%）且不超出視窗' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(180000);
        const m = await measure(page, b.route);
        test.info().annotations.push({ type: '觀察', description: m.map((x) => `${x.size} → ${x.w}x${x.h}（比例 ${x.ratio.toFixed(2)}）`).join('；') });
        for (const x of m) {
          expect(Math.abs(x.ratio - 16 / 9) / (16 / 9), `視窗 ${x.size} 時看板為 ${x.w}x${x.h}（比例 ${x.ratio.toFixed(2)}），不是 16:9`).toBeLessThan(0.01);
        }
      },
    );
  }

  test(
    '[SEC-001] 保全模式 RWD：此版本不支援，不隨畫面尺寸改變而變',
    {
      annotation: [
        ...csvAnnotations({ row: 134, no: '10.4', category: '保全模式 > RWD', steps: '此版本不支援保全模式RWD', expected: '不隨畫面尺寸改變而變' }),
        { type: '判定範圍', description: '以「看板上固定尺寸元件（公司商標）的寬度在不同視窗大小下是否不變」判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(180000);
      const m = await measure(page, '/#/guardmode');
      test.info().annotations.push({ type: '觀察', description: m.map((x) => `${x.size} → 容器 ${x.w}x${x.h}、商標寬 ${x.logoW}`).join('；') });
      const logos = new Set(m.map((x) => x.logoW));
      expect(logos.size, `商標寬度隨視窗大小改變：${m.map((x) => `${x.size}→${x.logoW}`).join('、')}`).toBe(1);
    },
  );
});
