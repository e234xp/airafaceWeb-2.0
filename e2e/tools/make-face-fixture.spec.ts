import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openAddPerson, fillPersonForm } from '../../helpers/persons';

// 一次性工具（非測項）：以 canvas 合成一張人臉照片 → e2e/fixtures/face.jpg，並用產品的人臉偵測驗證是否被接受。
test('make face fixture', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('about:blank');
  const dataUrl = await page.evaluate(() => {
    const W = 640;
    const H = 640;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d') as CanvasRenderingContext2D;
    // 背景
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#9fb4c7');
    bg.addColorStop(1, '#6c8197');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // 肩膀與衣服
    g.fillStyle = '#2f3b4c';
    g.beginPath();
    g.ellipse(320, 700, 300, 170, 0, Math.PI, 2 * Math.PI);
    g.fill();
    // 脖子
    g.fillStyle = '#d9a67f';
    g.fillRect(270, 440, 100, 110);
    // 頭髮（後層）
    g.fillStyle = '#2a1d15';
    g.beginPath();
    g.ellipse(320, 270, 170, 190, 0, 0, 2 * Math.PI);
    g.fill();
    // 耳朵
    g.fillStyle = '#e0ad86';
    g.beginPath();
    g.ellipse(160, 320, 24, 42, 0, 0, 2 * Math.PI);
    g.ellipse(480, 320, 24, 42, 0, 0, 2 * Math.PI);
    g.fill();
    // 臉
    const face = g.createRadialGradient(300, 290, 40, 320, 320, 200);
    face.addColorStop(0, '#f1c7a3');
    face.addColorStop(1, '#dba67e');
    g.fillStyle = face;
    g.beginPath();
    g.ellipse(320, 320, 150, 190, 0, 0, 2 * Math.PI);
    g.fill();
    // 瀏海
    g.fillStyle = '#2a1d15';
    g.beginPath();
    g.ellipse(320, 175, 150, 62, 0, Math.PI, 2 * Math.PI);
    g.fill();
    // 眉毛
    g.strokeStyle = '#2a1d15';
    g.lineWidth = 9;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(236, 262);
    g.quadraticCurveTo(262, 248, 292, 260);
    g.moveTo(348, 260);
    g.quadraticCurveTo(378, 248, 404, 262);
    g.stroke();
    // 眼睛
    for (const x of [265, 375]) {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.ellipse(x, 296, 28, 14, 0, 0, 2 * Math.PI);
      g.fill();
      g.fillStyle = '#4a3326';
      g.beginPath();
      g.arc(x, 296, 12, 0, 2 * Math.PI);
      g.fill();
      g.fillStyle = '#000000';
      g.beginPath();
      g.arc(x, 296, 6, 0, 2 * Math.PI);
      g.fill();
      g.strokeStyle = '#4b3022';
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(x, 296, 28, 14, 0, Math.PI, 2 * Math.PI);
      g.stroke();
    }
    // 鼻子
    g.strokeStyle = '#b97f5c';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(320, 300);
    g.quadraticCurveTo(306, 365, 296, 380);
    g.quadraticCurveTo(320, 395, 344, 380);
    g.stroke();
    // 嘴巴
    g.fillStyle = '#b5524f';
    g.beginPath();
    g.moveTo(268, 430);
    g.quadraticCurveTo(320, 462, 372, 430);
    g.quadraticCurveTo(320, 444, 268, 430);
    g.fill();
    g.strokeStyle = '#8c3a38';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(268, 430);
    g.quadraticCurveTo(320, 438, 372, 430);
    g.stroke();
    return c.toDataURL('image/jpeg', 0.95);
  });
  mkdirSync('e2e/fixtures', { recursive: true });
  writeFileSync('e2e/fixtures/face.jpg', Buffer.from(dataUrl.split(',')[1], 'base64'));

  // 用產品的註冊流程驗證：選擇註冊照片後預覽應改變（偵測到人臉且尺寸足夠）
  await openAddPerson(page);
  await fillPersonForm(page, { id: 'e2e-facechk', name: 'e2e-face' });
  await page.getByRole('button', { name: '下一步' }).click();
  const imgs = page.locator('.card.d-block img');
  const before = (await imgs.nth(0).getAttribute('src')) ?? '';
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: '選擇照片' }).nth(0).click()]);
  await fc.setFiles('e2e/fixtures/face.jpg');
  await page.waitForTimeout(4000);
  const after = (await imgs.nth(0).getAttribute('src')) ?? '';
  console.log('FACE-ACCEPTED', before !== after, after.slice(0, 20));
  console.log('HINTS', JSON.stringify(await page.locator('.card.d-block .invalid-feedback').allInnerTexts()));
});
