import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { appGetSettings, appSetSettings, restoreDashboard, snapshotDashboard } from '../../helpers/dashboard';
import { cleanupGroups, createGroupViaUI, deleteGroupViaUI, uniqueGroupName } from '../../helpers/groups';
import { cleanupPersons, createPersonViaUI, gotoPersons, personRowTexts, searchPersons, uniquePersonId } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：GRP-011、013、014、015（刪除群組後檢查關聯：人員、迎賓看板、點名看板、容留看板）。
// 看板設定為全系統共用：先取快照，測項結束（含失敗）以獨立 Admin 環境還原。群組名稱以 e2e 開頭，人員以 e2e- 開頭，結束後清理。

const groups: string[] = [];
const persons: string[] = [];
let board: { route: string; key: string; snap: Record<string, unknown> | null } | null = null;

test.afterEach(async ({ browser }) => {
  if (board) await restoreDashboard(browser, board.route, board.key, board.snap);
  board = null;
  await cleanupGroups(browser, groups.splice(0));
  await cleanupPersons(browser, persons.splice(0));
});

test.describe('GRP（刪除群組後檢查關聯）', () => {
  test(
    '[GRP-011] 刪除群組後檢查關聯：人員確實移除群組綁定',
    {
      annotation: csvAnnotations({ row: 72, no: '5.15', category: '（延續）> 刪除後，檢查關聯項目', steps: '1. 人員', expected: '相關人員確實移除群組綁定' }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const id = uniquePersonId('gr');
      persons.push(id);
      const gname = uniqueGroupName('rel');
      groups.push(gname);
      await createPersonViaUI(page, { id, name: 'e2e群組關聯' });
      await createGroupViaUI(page, { name: gname, personIds: [id] });
      // 綁定成立：人員列表的群組欄含該群組
      await gotoPersons(page);
      await searchPersons(page, id);
      const bound = await personRowTexts(page);
      expect(bound.join(' '), '建立群組並加入後，人員列表沒有顯示該群組').toContain(gname);
      // 刪除群組後：人員仍在，群組欄不再含該群組
      await deleteGroupViaUI(page, gname);
      await gotoPersons(page);
      await searchPersons(page, id);
      const after = await personRowTexts(page);
      expect(after.length, '刪除群組後人員不見了').toBe(1);
      expect(after[0], '刪除群組後，人員仍綁定該群組').not.toContain(gname);
    },
  );

  const boards = [
    { id: 'GRP-013', name: '迎賓看板', route: '/#/displays/modifywelcomecontrolsetting', key: 'WELCOME', stepText: '5. 迎賓看板' },
    { id: 'GRP-014', name: '點名看板', route: '/#/displays/modifyoccupancycontrolsetting', key: 'OCCUPANCY', stepText: '4. 點名看板' },
    { id: 'GRP-015', name: '容留看板', route: '/#/displays/modifycapacitycontrolsetting', key: 'CAPACITY', stepText: '5. 容留看板' },
  ];
  for (const b of boards) {
    test(
      `[${b.id}] 刪除群組後檢查關聯：${b.name}`,
      {
        annotation: [
          ...csvAnnotations({ row: 72, no: '5.15', category: '（延續）> 刪除後，檢查關聯項目', steps: b.stepText, expected: '相關人員確實移除群組綁定' }),
          { type: '判定範圍', description: `把測試群組設為${b.name}的顯示來源群組（displayGroup）後刪除群組，檢查${b.name}設定不再含該群組；看板設定先取快照、結束還原` },
        ],
      },
      async ({ page }) => {
        test.setTimeout(240000);
        const gname = uniqueGroupName('bd');
        groups.push(gname);
        await createGroupViaUI(page, { name: gname });
        const snap = await snapshotDashboard(page, b.route, b.key);
        board = { route: b.route, key: b.key, snap };
        // 以產品 API 把該群組加入顯示來源群組（等同設定頁儲存送出的資料）
        const all = await appGetSettings(page);
        const current = (all[b.key].displayGroup as string[]) ?? [];
        all[b.key] = { ...all[b.key], displayGroup: [...current, gname] };
        await appSetSettings(page, all);
        expect(((await appGetSettings(page))[b.key].displayGroup as string[]) ?? []).toContain(gname);
        // 刪除群組
        await deleteGroupViaUI(page, gname);
        // 重新載入後：看板設定不再含該群組
        await page.goto(b.route);
        await page.reload();
        await page.waitForTimeout(3000);
        const after = ((await appGetSettings(page))[b.key].displayGroup as string[]) ?? [];
        test.info().annotations.push({ type: '觀察', description: `刪除後 ${b.key}.displayGroup：${JSON.stringify(after)}` });
        expect(after, `刪除群組後，${b.name}的來源群組仍含已刪除的群組`).not.toContain(gname);
      },
    );
  }
});
