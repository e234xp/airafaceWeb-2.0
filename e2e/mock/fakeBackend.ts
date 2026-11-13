import type { BrowserContext, Route } from '@playwright/test';

// 補假資料層：預設完全不介入，所有請求都送真後端。
// .env.e2e.local 設 E2E_IS_MOCK=true 時，才會攔截前端對 /airafacelite/*、/system/* 的請求：
//   先問真後端；真實回應的清單是空的（環境沒有資料），才改回傳下面的假資料，並記錄「這個測項用了假資料」。
// 真實環境有資料就一律用真的，不混假資料。
// E2E_MOCK_WRITES：預留給「對假資料的編輯／刪除由這裡處理、不送真後端」，預設 false（一律送真後端）；目前尚未實作。
type Obj = Record<string, any>;

const flag = (name: string) => /^(true|1|yes|on)$/i.test((process.env[name] ?? '').trim());
export const IS_MOCK = flag('E2E_IS_MOCK');
export const MOCK_WRITES = flag('E2E_MOCK_WRITES');

/** 本測項用到假資料的紀錄；test.ts 在每個測項結束時讀取並寫進報告。 */
export type MockUse = { endpoint: string; reason: string };
let used: MockUse[] = [];
export const takeMockUses = () => {
  const r = used;
  used = [];
  return r;
};
export const resetMockUses = () => {
  used = [];
};
const markUsed = (endpoint: string, reason: string) => {
  if (!used.some((u) => u.endpoint === endpoint)) used.push({ endpoint, reason });
};

type Fixture = {
  /** 回應裡放清單的欄位 */
  listKey: string;
  /** 清單在回應的哪一層，例如容留看板是 result.persons 就寫 ['result']；不給就是最外層 */
  parent?: string[];
  /** 判斷真實清單算不算「沒資料」；不給就是空陣列才算 */
  isEmpty?: (items: Obj[]) => boolean;
  /** 假資料；寫成函式表示每次回應時才產生（例如時間要用「現在」） */
  items: Obj[] | (() => Obj[]);
};

// 真實回應沒資料時才補的假資料。key＝API 名稱（路徑最後一段）。
const FIXTURES: Record<string, Fixture> = {
  findcamera: {
    listKey: 'list',
    items: [
      { uuid: 'mock-cam-1', name: 'mock-cam-1', ip_address: '10.0.0.1', port: 554, stream_type: 'rtsp', alive: true, roi: [], divice_groups: [], connection_info: {} },
      { uuid: 'mock-cam-2', name: 'mock-cam-2', ip_address: '10.0.0.2', port: 554, stream_type: 'rtsp', alive: false, roi: [], divice_groups: [], connection_info: {} },
    ],
  },
  findtablet: { listKey: 'list', items: [] },
  findlicense: { listKey: 'license', items: [{ channel_amount: 30, expired: false, trial_days: -1 }] },
  // 容留看板：剛過每日重設時間、還沒有人被辨識時，persons 可能有人但全是「從沒進出過」（status 1 且沒有離開時間），
  // 畫面上一張卡片都沒有，所以「沒資料」要用看板的分法判斷，不能只看陣列是不是空的。
  // 補 2 位在場（status 0，綠色卡片）、1 位今天離場（status 1 且有離開時間，藍色卡片），OCC-001 進、出兩種外框都驗得到。
  getcapacitydata: {
    parent: ['result'],
    listKey: 'persons',
    isEmpty: (persons) => !persons.some((p) => p.status === 0 || (p.status === 1 && p.last_out_time)),
    items: () => {
      const now = Date.now();
      const person = (n: number, status: number, inAgoMin: number, outAgoMin?: number) => ({
        uuid: `mock-occ-${n}`,
        id: `mock-occ-${n}`,
        name: `mock-occ-${n}`,
        group_list: ['All Person'],
        status,
        last_in_time: now - inAgoMin * 60000,
        last_out_time: outAgoMin === undefined ? 0 : now - outAgoMin * 60000,
      });
      return [person(1, 0, 5), person(2, 0, 15), person(3, 1, 30, 10)];
    },
  },
};

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

export async function installMockFallback(ctx: BrowserContext) {
  await ctx.route(/\/(airafacelite|system)\/[a-z0-9_]+$/i, async (route: Route) => {
    const req = route.request();
    const name = new URL(req.url()).pathname.split('/').pop()!.toLowerCase();
    const fx = FIXTURES[name];
    if (req.method() === 'OPTIONS' || !fx) return route.continue();
    let resp;
    try {
      resp = await route.fetch();
    } catch {
      return route.continue(); // 真後端連不上：讓瀏覽器自己顯示原本的錯誤，不用假資料掩蓋
    }
    let json: Obj | null = null;
    try {
      json = await resp.json();
    } catch {
      /* 不是 JSON，原樣放行 */
    }
    // 找到放清單的那一層（最外層，或 parent 指定的巢狀物件）
    const holder = (fx.parent ?? []).reduce<Obj | null>((o, key) => (o && typeof o[key] === 'object' ? (o[key] as Obj) : null), json);
    const real = holder && Array.isArray(holder[fx.listKey]) ? (holder[fx.listKey] as Obj[]) : null;
    const noData = real !== null && (fx.isEmpty ? fx.isEmpty(real) : real.length === 0);
    const items = typeof fx.items === 'function' ? fx.items() : fx.items;
    const where = [...(fx.parent ?? []), fx.listKey].join('.');
    if (holder && noData && items.length > 0) {
      markUsed(name, `真實回應的 ${where} 沒有資料，改用假資料 ${items.length} 筆`);
      holder[fx.listKey] = items;
      // 最外層的清單另有總筆數欄位要一起改；巢狀的（如容留看板）沒有
      const body = fx.parent ? json : { ...json, total_length: items.length, slice_length: items.length };
      return route.fulfill({ response: resp, headers: { ...resp.headers(), ...CORS }, body: JSON.stringify(body) });
    }
    if (noData) markUsed(name, `真實回應的 ${where} 沒有資料，目前沒有對應的假資料可補`);
    return route.fulfill({ response: resp });
  });
}
