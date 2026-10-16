// 出勤計算：純函式，不碰 Vue、this、Date.now()；時間一律是毫秒時間戳
export const STATUS = {
  NONE: 0,
  SHOW_ON_TIME: 1,
  LEAVE_ON_TIME: 2,
  LATE: 3,
  EARLY: 4,
  NO_SHOW: 5,
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// 出勤設定（API 的 snake_case）→ 規則；時間欄位 = 距當天 00:00 的毫秒（預設值沿用現有程式）
export function buildRules(s = {}) {
  return {
    clockIn: (s.defined_clockin_time_hour || 9) * HOUR + (s.defined_clockin_time_min || 0) * MIN,
    clockOut: (s.defined_clockout_time_hour || 18) * HOUR + (s.defined_clockout_time_min || 0) * MIN,
    breakMs: (s.defined_break_time_mins || 60) * MIN,
    overtimeEnabled: s.defined_overtime_enabled !== false,
    overtimeStart: (s.defined_overtime_time_hour || 18) * HOUR + (s.defined_overtime_time_min || 0) * MIN,
    overtimeMinMs: (s.defined_overtime_minimum_min || 0) * MIN,
    clockInAdjust: !!s.defined_clockin_adjustment_enabled,
    clockOutAdjust: !!s.defined_clockout_adjustment_enabled,
  };
}

// 只留下指定日期（dayStart = 當天 00:00 的毫秒）的紀錄
export function filterByDay(records, dayStart) {
  return records.filter((r) => r.timestamp >= dayStart && r.timestamp < dayStart + DAY);
}

// 後端每人每天只回「上班一筆、下班一筆」：有 clockInStatus 的是上班，有 clockOutStatus 的是下班
export function pickInOut(records) {
  const inRec = records.find((r) => r.clockInStatus !== undefined) || null;
  const outRec = records.find((r) => r.clockOutStatus !== undefined) || null;
  return { inRec, outRec };
}

// 缺席（紫色）：後端有給狀態就以後端為準；沒有狀態、是平日、且已過表定時間 → 缺席
// scheduledTs = 當天的表定上班（或下班）時間戳；now 由呼叫端傳入
export function fillNoShow(status, scheduledTs, now, holiday) {
  if (status !== STATUS.NONE) return status;
  return !holiday && scheduledTs < now ? STATUS.NO_SHOW : STATUS.NONE;
}

// 假日：補班日 > 指定假日 > 週末
export function isHoliday(dayStart, holidays = [], nonHolidays = []) {
  const dayEnd = dayStart + DAY - 1;
  const has = (list) => list.some((h) => h.date_time >= dayStart && h.date_time <= dayEnd);
  if (has(nonHolidays)) return false;
  if (has(holidays)) return true;
  const w = new Date(dayStart).getDay();
  return w === 0 || w === 6;
}

// 上班時數（毫秒）。調整運算式沿用現有程式：勾選時早到算表定上班、晚走算表定下班
export function calcWorkingMs(inTs, outTs, dayStart, rules) {
  if (!inTs || !outTs) return 0;
  const start = rules.clockInAdjust && inTs < dayStart + rules.clockIn ? dayStart + rules.clockIn : inTs;
  const capOut = (rules.clockOutAdjust || rules.overtimeEnabled) && outTs > dayStart + rules.clockOut;
  const end = capOut ? dayStart + rules.clockOut : outTs;
  return Math.max(end - start - rules.breakMs, 0);
}

// 是否有加班：啟用加班，且下班超過「加班起算 + 最短加班」
export function isOvertime(outTs, dayStart, rules) {
  return !!outTs && rules.overtimeEnabled && outTs >= dayStart + rules.overtimeStart + rules.overtimeMinMs;
}

// 加班時數（毫秒）：結束最多算到當天 23:59:59.999
export function calcOvertimeMs(outTs, dayStart, rules) {
  if (!isOvertime(outTs, dayStart, rules)) return 0;
  return Math.max(Math.min(outTs, dayStart + DAY - 1) - (dayStart + rules.overtimeStart), 0);
}

// 毫秒 → 'HH:mm'（100 小時以上顯示 '176:30'）；不足 1 分鐘回空字串
export function formatDuration(ms) {
  const totalMin = Math.floor(ms / MIN);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0 && m <= 0) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
