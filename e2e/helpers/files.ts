import { deflateSync } from 'node:zlib';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// 測試用檔案產生 helper（不依賴外部素材，也不帶任何真實人臉）。

const crcTable = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) === 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = (crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/**
 * 產生 RGB PNG。noise=false：純色（壓縮後很小）；noise=true：隨機雜訊且不壓縮（檔案大小約 = 寬×高×3），
 * 用來製作「超過 10MB」的檔案。
 */
export function makePng(width: number, height: number, noise = false): Buffer {
  const rowLen = 1 + width * 3;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y += 1) {
    const off = y * rowLen;
    raw[off] = 0; // filter: None
    if (noise) randomBytes(width * 3).copy(raw, off + 1);
    else for (let x = 0; x < width; x += 1) raw.set([40, 120, 200], off + 1 + x * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: noise ? 0 : 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** 寫檔（自動建立資料夾），回傳路徑。 */
export function writeFile(path: string, data: Buffer | string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  return path;
}

export const TMP_DIR = 'e2e/reports/tmp';
export const MB = 1024 * 1024;
