// 讀取 .env.e2e.local 設定；缺少必要設定時拋錯，不使用預設猜測值。
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`缺少環境變數 ${name}（請見 .env.e2e.example）`);
  return v;
}
