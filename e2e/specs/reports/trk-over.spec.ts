import { Page, expect, test } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';
import { noPresenceMessage, openPresenceDetail, scanPresence, titleSeconds } from '../../helpers/presence';

// 來源 E2E-TEST-PLAN.md：TRK-008（不在辦公室超時為紅色：OUT→IN，長度 >= N 分鐘）。
// 不寫死特定日期或人員：從後端 API 掃描環境現有進出彙總，取「離開總時間最長」的人員（helpers/presence.ts）。
// 不在辦公室的門檻選項為 10／20／30／60 分鐘（預設 10）。對每個門檻檢查同一規則：
// 離開區段長度 >= 門檻 → 紅色（超時）；否則 → 黃色。至少要有一段 >= 10 分鐘的離開，才看得到紅色。
const YELLOW = 'rgb(255, 193, 7)';
const THRESHOLDS = [10, 20, 30, 60];

const aways = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('.timeline-seg'))
      .filter((e) => /seg-away/.test(e.className.toString()))
      .map((e) => ({ cls: e.className.toString(), bg: getComputedStyle(e).backgroundColor, title: (e as HTMLElement).title })),
  );
const isRed = (bg: string) => {
  const [r, g, b] = (bg.match(/\d+/g) ?? []).map(Number);
  return r > 180 && g < 120 && b < 120;
};

test(
  '[TRK-008] 時間軸：不在辦公室超時為紅色（OUT→IN，長度 >= N 分鐘）',
  {
    annotation: [
      ...csvAnnotations({ row: 53, no: '', category: '（延續）> 時間軸顯示', steps: '4.不在辦公室，超時:紅色，設定出去攝影機並維持出超過設定時間', expected: '4..OUT 超過設定時間顯示紅色' }),
      { type: '判定範圍', description: '用環境現有資料中離開總時間最長的人員；對 10／20／30／60 分鐘各門檻：離開區段長度 >= 門檻為紅色（超時）、否則為黃色' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(300000);
    const s = await scanPresence(page);
    if (!s.longestAway || s.longestAway.outSec < 600) throw new Error(noPresenceMessage('至少有一位人員的離開總時間 >= 10 分鐘'));
    const c = s.longestAway;
    await openPresenceDetail(page, c.day, c.name);
    test.info().annotations.push({ type: '使用的資料', description: `${c.day} ${c.name}（不在辦公室合計 ${c.outSec}s）` });
    const awaySel = page.locator('select').nth(2);
    expect((await awaySel.locator('option:checked').innerText()).trim(), '預設門檻').toBe('不在 10 分鐘以上');
    let sawRed = false;
    for (const t of THRESHOLDS) {
      if (t !== 10) {
        await awaySel.selectOption({ label: `不在 ${t} 分鐘以上` });
        await page.getByRole('button', { name: '送出' }).click();
        await page.waitForTimeout(2500);
      }
      const list = await aways(page);
      console.log('OBS 門檻', t, '分鐘', JSON.stringify(list.map((x) => x.title.replace(/\n/g, ' '))));
      expect(list.length, `門檻 ${t} 分鐘：離開區段`).toBeGreaterThan(0);
      for (const x of list) {
        const over = titleSeconds(x.title) >= t * 60;
        if (over) {
          sawRed = true;
          expect(x.cls, `門檻 ${t} 分鐘：長度達標應為超時 ${x.title}`).toContain('away-over');
          expect(isRed(x.bg), `門檻 ${t} 分鐘：超時區段不是紅色：${x.bg}`).toBe(true);
          expect(x.title, '提示文字').toContain('超時');
        } else {
          expect(x.cls, `門檻 ${t} 分鐘：未達標不應為超時 ${x.title}`).not.toContain('away-over');
          expect(x.bg, `門檻 ${t} 分鐘：未達標應為黃色 ${x.title}`).toBe(YELLOW);
        }
      }
      await shot(page, 'TRK-008', `門檻${t}分鐘`);
    }
    expect(sawRed, '資料中沒有任何一段離開 >= 10 分鐘，看不到紅色（需要更長的離開區段）').toBe(true);
  },
);
