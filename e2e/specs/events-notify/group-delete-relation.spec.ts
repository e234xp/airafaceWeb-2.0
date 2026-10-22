import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：GRP-012（刪除群組後檢查關聯項目：Email 通知，相關人員確實移除群組綁定）。
// 寄信的設定在事件管理（eventhandle），所以這裡用事件代表「Email 通知」：
// 建立測試群組 → 建立一個「停用」的 Email 事件綁定該群組（以既有 Email 事件複製，停用所以不會寄信）→ 刪除群組（走前端相同的 removegroup）→ 讀回事件，群組綁定應被移除。
// 測試群組、測試事件都以 e2e- 開頭，結束後（含失敗）一律刪除。
const tag = () => `e2e-grp012-${Date.now().toString(36).slice(-5)}`;

type Api = { evaluate: Page['evaluate'] };
const root = `Array.from(document.querySelectorAll('*')).find((x) => x.__vue__).__vue__.$root`;

test(
  '[GRP-012] 刪除群組後檢查關聯：Email 通知',
  { annotation: csvAnnotations({ row: 72, no: '5.15', category: '（延續）> 刪除後，檢查關聯項目', steps: '2. Email 通知', expected: '相關人員確實移除群組綁定' }) },
  async ({ page }) => {
    test.setTimeout(200000);
    await page.goto('/#/personsmanagement/groupmanagement');
    await page.reload();
    await page.waitForTimeout(3500);
    const name = tag();
    const out = await page.evaluate(
      async ({ name }) => {
        const r = (Array.from(document.querySelectorAll('*')).find((x: any) => x.__vue__) as any).__vue__.$root;
        const log: string[] = [];
        const events = ((await r.$globalGetEventList('', ['http', 'line', 'telegram', 'mail', 'wiegand', 'iobox'])).data || {}).list || [];
        const tpl = events.find((e: any) => e.action_type === 'mail');
        if (!tpl) return { error: '環境沒有可複製的 Email 事件' };
        const cg = await r.$globalCreateGroup({ name, person_uuid_list: [], visitor_uuid_list: [], remarks: '' });
        if (cg.error) return { error: `建立群組失敗 ${JSON.stringify(cg.error)}` };
        const g = ((await r.$globalGetGroupList()).group_list || []).find((x: any) => x.name === name);
        const copy = JSON.parse(JSON.stringify(tpl));
        delete copy.uuid;
        delete copy.created_time;
        delete copy.updated_time;
        copy.name = name;
        copy.enable = false;
        copy.group_list = [name, 'All Visitor'];
        const ce = await r.$globalCreateEventHandle(copy);
        if (ce.error) return { error: `建立事件失敗 ${JSON.stringify(ce.error)}`, groupUuid: g && g.uuid };
        const mine = () => r.$globalGetEventList('', ['http', 'line', 'telegram', 'mail', 'wiegand', 'iobox']).then((x: any) => ((x.data || {}).list || []).find((e: any) => e.name === name));
        const before = await mine();
        log.push(`刪除前事件群組：${JSON.stringify(before && before.group_list)}`);
        const gl = ((await r.$globalGetGroupList()).group_list || []).find((x: any) => x.name === name);
        return { groupUuid: (gl && gl.uuid) || (g && g.uuid), eventUuid: before && before.uuid, before: before && before.group_list, log };
      },
      { name },
    );
    console.log('OBS', JSON.stringify(out));
    test.info().annotations.push({ type: '觀察', description: JSON.stringify(out) });
    expect(out.error, String(out.error)).toBeUndefined();
    try {
      expect(out.groupUuid, '找不到剛建立的群組').toBeTruthy();
      expect(out.before, '建立後事件應綁定測試群組').toContain(name);
      const after = await page.evaluate(
        async ({ name, groupUuid }) => {
          const r = (Array.from(document.querySelectorAll('*')).find((x: any) => x.__vue__) as any).__vue__.$root;
          // 走前端「群組管理」頁刪除群組的同一個方法（刪除後會一併清理看板設定與事件裡的群組綁定）
          const findVm = (vm: any): any => (typeof vm.removeGroupAsync === 'function' ? vm : vm.$children.map(findVm).find(Boolean));
          const page = findVm(r);
          if (!page) return { removeError: '找不到群組管理頁元件' };
          await page.removeGroupAsync([groupUuid], null, [name]);
          const rm = { error: null as unknown };
          await new Promise((res) => setTimeout(res, 1500));
          const ev = ((await r.$globalGetEventList('', ['http', 'line', 'telegram', 'mail', 'wiegand', 'iobox'])).data || {}).list.find((e: any) => e.name === name);
          return { removeError: rm.error, groups: ev && ev.group_list };
        },
        { name, groupUuid: out.groupUuid },
      );
      console.log('OBS 刪除群組後', JSON.stringify(after));
      test.info().annotations.push({ type: '觀察', description: `刪除群組後事件的群組：${JSON.stringify(after)}` });
      expect(after.removeError, '刪除群組失敗').toBeFalsy();
      expect(after.groups, '刪除群組後 Email 事件仍綁定已刪除的群組').not.toContain(name);
    } finally {
      await page.evaluate(
        async ({ name, groupUuid, eventUuid }) => {
          const r = (Array.from(document.querySelectorAll('*')).find((x: any) => x.__vue__) as any).__vue__.$root;
          if (eventUuid) await r.$globalRemoveEventHandle([eventUuid]);
          if (groupUuid) await r.$globalRemoveGroup([groupUuid]).catch(() => undefined);
        },
        { name, groupUuid: out.groupUuid, eventUuid: out.eventUuid },
      );
    }
  },
);

void ({} as Api);
void root;
