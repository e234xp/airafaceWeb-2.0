import {
  STATUS,
  buildRules,
  filterByDay,
  pickInOut,
  fillNoShow,
  isHoliday,
  calcWorkingMs,
  isOvertime,
  calcOvertimeMs,
  formatDuration,
} from '@/utils/attendanceCalc';

const MIN = 60 * 1000;
const H = 60 * MIN;

// 2026-10-16 是週五、2026-10-17 是週六（皆為本地時間 00:00）
const FRI = new Date(2026, 9, 16).getTime();
const SAT = new Date(2026, 9, 17).getTime();
const at = (dayStart, hh, mm = 0, ss = 0) => dayStart + hh * H + mm * MIN + ss * 1000;

// 預設規則：09:00–18:00、休息 60 分、加班關、調整關
const base = () => buildRules({});

describe('buildRules', () => {
  test('沒有設定時使用預設值（09:00–18:00、休息 60 分、加班預設啟用）', () => {
    const r = buildRules({});
    expect(r.clockIn).toBe(9 * H);
    expect(r.clockOut).toBe(18 * H);
    expect(r.breakMs).toBe(60 * MIN);
    expect(r.overtimeEnabled).toBe(true);
    expect(r.clockInAdjust).toBe(false);
    expect(r.clockOutAdjust).toBe(false);
  });

  test('依出勤設定換算成距當天 00:00 的毫秒', () => {
    const r = buildRules({
      defined_clockin_time_hour: 8,
      defined_clockin_time_min: 30,
      defined_clockout_time_hour: 17,
      defined_clockout_time_min: 45,
      defined_break_time_mins: 30,
      defined_overtime_enabled: false,
      defined_overtime_time_hour: 19,
      defined_overtime_time_min: 15,
      defined_overtime_minimum_min: 30,
      defined_clockin_adjustment_enabled: true,
      defined_clockout_adjustment_enabled: true,
    });
    expect(r.clockIn).toBe(8 * H + 30 * MIN);
    expect(r.clockOut).toBe(17 * H + 45 * MIN);
    expect(r.breakMs).toBe(30 * MIN);
    expect(r.overtimeEnabled).toBe(false);
    expect(r.overtimeStart).toBe(19 * H + 15 * MIN);
    expect(r.overtimeMinMs).toBe(30 * MIN);
    expect(r.clockInAdjust).toBe(true);
    expect(r.clockOutAdjust).toBe(true);
  });
});

describe('filterByDay', () => {
  const records = [
    { id: 'before', timestamp: FRI - 1 },
    { id: 'start', timestamp: FRI },
    { id: 'noon', timestamp: at(FRI, 12) },
    { id: 'last', timestamp: SAT - 1 },
    { id: 'next', timestamp: SAT },
  ];

  test('包含當天 00:00:00.000 到 23:59:59.999，不含前後一天', () => {
    expect(filterByDay(records, FRI).map((r) => r.id)).toEqual(['start', 'noon', 'last']);
  });

  test('不修改傳入陣列', () => {
    const copy = records.slice();
    filterByDay(records, FRI);
    expect(records).toEqual(copy);
  });
});

describe('pickInOut', () => {
  const inRec = { timestamp: at(FRI, 9, 5), clockInStatus: STATUS.SHOW_ON_TIME };
  const outRec = { timestamp: at(FRI, 18, 2), clockOutStatus: STATUS.LEAVE_ON_TIME };

  test('有 clockInStatus 的是上班，有 clockOutStatus 的是下班', () => {
    expect(pickInOut([outRec, inRec])).toEqual({ inRec, outRec });
  });

  test('只有上班或只有下班時，另一邊為 null', () => {
    expect(pickInOut([inRec])).toEqual({ inRec, outRec: null });
    expect(pickInOut([outRec])).toEqual({ inRec: null, outRec });
  });

  test('沒有任何狀態的紀錄不會被當成上班或下班', () => {
    expect(pickInOut([{ timestamp: at(FRI, 10), verify_mode: 5 }])).toEqual({ inRec: null, outRec: null });
    expect(pickInOut([])).toEqual({ inRec: null, outRec: null });
  });
});

describe('fillNoShow', () => {
  const sched = at(FRI, 9);

  test('後端有給狀態就以後端為準，不覆蓋', () => {
    const now = at(FRI, 23);
    expect(fillNoShow(STATUS.LATE, sched, now, false)).toBe(STATUS.LATE);
    expect(fillNoShow(STATUS.NO_SHOW, sched, now, true)).toBe(STATUS.NO_SHOW);
  });

  test('平日、沒有狀態、已過表定時間 → 缺席', () => {
    expect(fillNoShow(STATUS.NONE, sched, at(FRI, 9, 1), false)).toBe(STATUS.NO_SHOW);
  });

  test('還沒到表定時間 → 不算缺席', () => {
    expect(fillNoShow(STATUS.NONE, sched, at(FRI, 8, 59), false)).toBe(STATUS.NONE);
  });

  test('假日 → 不算缺席', () => {
    expect(fillNoShow(STATUS.NONE, sched, at(FRI, 23), true)).toBe(STATUS.NONE);
  });
});

describe('isHoliday', () => {
  test('平日不是假日、週六週日是假日', () => {
    expect(isHoliday(FRI)).toBe(false);
    expect(isHoliday(SAT)).toBe(true);
    expect(isHoliday(new Date(2026, 9, 18).getTime())).toBe(true);
  });

  test('指定假日（當天任何時間）會讓平日變成假日', () => {
    expect(isHoliday(FRI, [{ date_time: at(FRI, 15) }])).toBe(true);
    expect(isHoliday(FRI, [{ date_time: at(SAT, 0) }])).toBe(false);
  });

  test('指定非假日（補班日）優先於週末與指定假日', () => {
    expect(isHoliday(SAT, [], [{ date_time: at(SAT, 1) }])).toBe(false);
    expect(isHoliday(SAT, [{ date_time: at(SAT, 1) }], [{ date_time: at(SAT, 1) }])).toBe(false);
  });

  test('清單欄位缺值（undefined）時不會出錯', () => {
    expect(isHoliday(FRI, undefined, undefined)).toBe(false);
  });
});

describe('calcWorkingMs', () => {
  test('準時 09:00–18:00、休息 60 分 → 8 小時', () => {
    expect(calcWorkingMs(at(FRI, 9), at(FRI, 18), FRI, base())).toBe(8 * H);
  });

  test('遲到 09:40 到 → 7 小時 20 分（緩衝不影響工時）', () => {
    expect(calcWorkingMs(at(FRI, 9, 40), at(FRI, 18), FRI, base())).toBe(7 * H + 20 * MIN);
  });

  test('休息時間可設定', () => {
    const rules = buildRules({ defined_break_time_mins: 30, defined_overtime_enabled: false });
    expect(calcWorkingMs(at(FRI, 8), at(FRI, 14), FRI, rules)).toBe(5 * H + 30 * MIN);
  });

  test('沒有上班或沒有下班 → 0', () => {
    expect(calcWorkingMs(null, at(FRI, 18), FRI, base())).toBe(0);
    expect(calcWorkingMs(at(FRI, 9), null, FRI, base())).toBe(0);
    expect(calcWorkingMs(0, 0, FRI, base())).toBe(0);
  });

  test('區間比休息時間短 → 0，不會是負數', () => {
    expect(calcWorkingMs(at(FRI, 9), at(FRI, 9, 30), FRI, base())).toBe(0);
  });

  describe('時間調整', () => {
    test('沒勾上班調整：早到 08:00 的時間照算', () => {
      const rules = buildRules({ defined_overtime_enabled: false });
      expect(calcWorkingMs(at(FRI, 8), at(FRI, 18), FRI, rules)).toBe(9 * H);
    });

    test('勾上班調整：早到 08:00 以表定 09:00 計', () => {
      const rules = buildRules({ defined_overtime_enabled: false, defined_clockin_adjustment_enabled: true });
      expect(calcWorkingMs(at(FRI, 8), at(FRI, 18), FRI, rules)).toBe(8 * H);
    });

    test('勾上班調整：晚到不調整', () => {
      const rules = buildRules({ defined_overtime_enabled: false, defined_clockin_adjustment_enabled: true });
      expect(calcWorkingMs(at(FRI, 9, 40), at(FRI, 18), FRI, rules)).toBe(7 * H + 20 * MIN);
    });

    test('沒勾下班調整且加班關：晚走 19:00 的時間照算', () => {
      const rules = buildRules({ defined_overtime_enabled: false });
      expect(calcWorkingMs(at(FRI, 9), at(FRI, 19), FRI, rules)).toBe(9 * H);
    });

    test('勾下班調整：晚走 19:00 以表定 18:00 計', () => {
      const rules = buildRules({ defined_overtime_enabled: false, defined_clockout_adjustment_enabled: true });
      expect(calcWorkingMs(at(FRI, 9), at(FRI, 19), FRI, rules)).toBe(8 * H);
    });

    test('啟用加班時，晚走的工時以表定下班時間封頂（超過的部分算加班）', () => {
      const rules = buildRules({ defined_overtime_enabled: true });
      expect(calcWorkingMs(at(FRI, 9), at(FRI, 19), FRI, rules)).toBe(8 * H);
    });

    test('早走不會被調整', () => {
      const rules = buildRules({ defined_clockout_adjustment_enabled: true });
      expect(calcWorkingMs(at(FRI, 9), at(FRI, 16), FRI, rules)).toBe(6 * H);
    });
  });
});

describe('加班', () => {
  const rules = (extra = {}) =>
    buildRules({
      defined_overtime_enabled: true,
      defined_overtime_time_hour: 19,
      defined_overtime_time_min: 0,
      defined_overtime_minimum_min: 30,
      ...extra,
    });

  test('沒啟用加班 → 沒有加班', () => {
    const r = rules({ defined_overtime_enabled: false });
    expect(isOvertime(at(FRI, 21), FRI, r)).toBe(false);
    expect(calcOvertimeMs(at(FRI, 21), FRI, r)).toBe(0);
  });

  test('沒有下班紀錄 → 沒有加班', () => {
    expect(isOvertime(null, FRI, rules())).toBe(false);
    expect(calcOvertimeMs(null, FRI, rules())).toBe(0);
  });

  test('下班早於「加班起算 + 最短加班」→ 0（19:29）', () => {
    expect(isOvertime(at(FRI, 19, 29), FRI, rules())).toBe(false);
    expect(calcOvertimeMs(at(FRI, 19, 29), FRI, rules())).toBe(0);
  });

  test('下班剛好等於「加班起算 + 最短加班」→ 有加班（19:30，從 19:00 起算 30 分）', () => {
    expect(isOvertime(at(FRI, 19, 30), FRI, rules())).toBe(true);
    expect(calcOvertimeMs(at(FRI, 19, 30), FRI, rules())).toBe(30 * MIN);
  });

  test('加班 = 下班時間 − 加班起算時間', () => {
    expect(calcOvertimeMs(at(FRI, 21, 15), FRI, rules())).toBe(2 * H + 15 * MIN);
  });

  test('最短加班為 0：剛好 19:00 算有加班但時數 0', () => {
    const r = rules({ defined_overtime_minimum_min: 0 });
    expect(isOvertime(at(FRI, 19), FRI, r)).toBe(true);
    expect(calcOvertimeMs(at(FRI, 19), FRI, r)).toBe(0);
  });

  test('結束最多算到當天 23:59:59.999', () => {
    const nextDayMorning = at(SAT, 1);
    expect(calcOvertimeMs(nextDayMorning, FRI, rules())).toBe(SAT - 1 - at(FRI, 19));
  });
});

describe('formatDuration', () => {
  test('不足 1 分鐘回空字串', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(59 * 1000)).toBe('');
    expect(formatDuration(-5 * MIN)).toBe('');
  });

  test('一般時數', () => {
    expect(formatDuration(8 * H)).toBe('08:00');
    expect(formatDuration(21 * MIN)).toBe('00:21');
    expect(formatDuration(7 * H + 20 * MIN)).toBe('07:20');
  });

  test('100 小時以上不會被截斷（月總時數）', () => {
    expect(formatDuration(160 * H)).toBe('160:00');
    expect(formatDuration(176 * H + 30 * MIN)).toBe('176:30');
  });
});
