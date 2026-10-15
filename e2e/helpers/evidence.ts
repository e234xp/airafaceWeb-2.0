import { Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// 需要人工確認畫面的測項，把截圖存到 e2e/evidence/<Test ID>/<名稱>.png，並由 Results 以相對路徑嵌入。
// 截圖只含畫面，不含密碼（密碼欄預設遮蔽）。
export const EVIDENCE_DIR = 'e2e/evidence';

export async function shot(page: Page, testId: string, name: string, fullPage = false): Promise<string> {
  const dir = `${EVIDENCE_DIR}/${testId}`;
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/${name}.png`;
  await page.screenshot({ path, fullPage });
  return path;
}
