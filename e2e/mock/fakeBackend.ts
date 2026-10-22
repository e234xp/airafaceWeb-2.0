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

// 真實回應的清單為空時才補的假資料。key＝API 名稱（路徑最後一段），listKey＝回應裡放清單的欄位。
const FIXTURES: Record<string, { listKey: string; items: Obj[] }> = {
  findcamera: {
    listKey: 'list',
    items: [
      { uuid: 'mock-cam-1', name: 'mock-cam-1', ip_address: '10.0.0.1', port: 554, stream_type: 'rtsp', alive: true, roi: [], divice_groups: [], connection_info: {} },
      { uuid: 'mock-cam-2', name: 'mock-cam-2', ip_address: '10.0.0.2', port: 554, stream_type: 'rtsp', alive: false, roi: [], divice_groups: [], connection_info: {} },
    ],
  },
  findtablet: { listKey: 'list', items: [] },
  findlicense: { listKey: 'license', items: [{ channel_amount: 30, expired: false, trial_days: -1 }] },
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
    const real = json && Array.isArray(json[fx.listKey]) ? (json[fx.listKey] as Obj[]) : null;
    if (real && real.length === 0 && fx.items.length > 0) {
      markUsed(name, `真實回應的 ${fx.listKey} 為空，改用假資料 ${fx.items.length} 筆`);
      const body = { ...json, [fx.listKey]: fx.items, total_length: fx.items.length, slice_length: fx.items.length };
      return route.fulfill({ response: resp, headers: { ...resp.headers(), ...CORS }, body: JSON.stringify(body) });
    }
    if (real && real.length === 0) markUsed(name, `真實回應的 ${fx.listKey} 為空，目前沒有對應的假資料可補`);
    return route.fulfill({ response: resp });
  });
}
