<template>
  <div>
    <div class="h1">
      {{ disp_header }}
    </div>

    <CCard class="mt-5">
      <CCardBody>
        <div class="d-flex align-items-start">
          <table class="w-50">
            <thead>
              <tr>
                <th class="fz-xxxl w-50 px-4 py-4 align-top">{{ disp_clockIn }}</th>
                <th class="fz-xxxl w-50 px-4 py-4 align-top">{{ disp_clockOut }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fz-lg w-50 px-4 py-2 align-top">
                  {{ disp_definedClockInTime }}
                </td>
                <td class="fz-lg w-50 px-4 py-2 align-top">
                  {{ disp_definedClockOutTime }}
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top">
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    class="w-100 gray-rounded-date-picker"
                    type="time"
                    format="HH:mm"
                    v-model="value_clockInTimePicked"
                  />
                </td>
                <td class="px-4 py-2 align-top">
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    class="w-100 gray-rounded-date-picker"
                    type="time"
                    format="HH:mm"
                    v-model="value_clockOutTimePicked"
                  />
                </td>
              </tr>
              <tr>
                <td class="w-25 px-4 py-2 align-top td-h-max">
                  <div class="fz-lg d-flex align-items-start mt-3">
                    <input
                      type="checkbox"
                      id="use-upperbound-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="value_clockInUpperBoundEnabled"
                    />

                    <label
                      for="use-upperbound-checkbox"
                      class="form-check-label cursor-pointer break-word"
                      >{{ disp_clockInTimeBuffer }}
                    </label>
                  </div>
                </td>
                <td class="w-25 px-4 py-2 align-top td-h-max">
                  <div class="fz-lg d-flex align-items-start mt-3">
                    <input
                      type="checkbox"
                      id="use-lowerbound-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="value_clockOutLowerBoundEnabled"
                    />
                    <label
                      for="use-lowerbound-checkbox"
                      class="form-check-label cursor-pointer break-word"
                      >{{ disp_clockOutTimeBuffer }}
                    </label>
                  </div>
                </td>
              </tr>

              <tr>
                <td class="px-4 py-2 align-top">
                  <select
                    class="w-100 select-secondary"
                    v-model="value_clockInTimeBufferMin"
                  >
                    <option>0</option>
                    <option>15</option>
                    <option selected>30</option>
                    <option>45</option>
                    <option>60</option>
                    <option>75</option>
                    <option>90</option>
                    <option>105</option>
                    <option>120</option>
                  </select>
                </td>
                <td class="px-4 py-2 align-top">
                  <select
                    class="w-100 select-secondary"
                    v-model="value_clockOutTimeBufferMin"
                  >
                    <option>0</option>
                    <option>15</option>
                    <option selected>30</option>
                    <option>45</option>
                    <option>60</option>
                    <option>75</option>
                    <option>90</option>
                    <option>105</option>
                    <option>120</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top">
                  <div class="fz-lg d-flex align-items-start mb-7">
                    <input
                      type="checkbox"
                      id="use-specified-colckin-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="value_adjustClockInEnabled"
                    />
                    <label
                      for="use-specified-colckin-checkbox"
                      class="form-check-label cursor-pointer"
                      >{{ disp_adjustClockInEnabled }}</label
                    >
                  </div>
                </td>
                <td class="px-4 py-2 align-top">
                  <div class="fz-lg d-flex align-items-start mb-7">
                    <input
                      type="checkbox"
                      id="use-specified-colckout-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="value_adjustClockOutEnabled"
                    />
                    <label
                      for="use-specified-colckout-checkbox"
                      class="form-check-label cursor-pointer"
                      >{{ disp_adjustClockOutEnabled }}</label
                    >
                  </div>
                </td>
              </tr>
              <tr>
                <td class="fz-xxxl px-4 py-3 align-top font-weight-bold">
                  <div class="border-top h-xxl"></div>
                  <div>{{ disp_break_time }}</div>
                </td>
                <td class="fz-xxxl px-4 py-3 align-top font-weight-bold">
                  <div class="border-top h-xxl"></div>
                  <div>{{ disp_overtime }}</div>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top fz-lg">{{ disp_breakTimeMins }}</td>
                <td class="px-4 py-2 align-top fz-lg">
                  <input
                    type="checkbox"
                    id="calc-work-overtime-checkbox"
                    class="cursor-pointer mr-2 mt-1"
                    v-model="value_enableOvertime"
                  />

                  <label
                    for="calc-work-overtime-checkbox"
                    class="form-check-label cursor-pointer break-word"
                    >{{ disp_enableOvertime }}
                  </label>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top">
                  <select class="w-100 select-secondary" v-model="value_breakTimeMins">
                    <option>0</option>
                    <option>30</option>
                    <option selected>60</option>
                    <option>90</option>
                    <option>120</option>
                  </select>
                </td>
                <td class="px-4 py-2 align-top fz-lg">
                  <div class="mb-3">
                    {{ disp_overtimeStartTime }}
                  </div>
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    class="w-100 gray-rounded-date-picker"
                    type="time"
                    format="HH:mm"
                    v-model="value_overtimeStartTime"
                  />
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top fz-lg"></td>
                <td class="px-4 py-2 align-top fz-md">
                  <ul>
                    <li>{{ disp_overtimeGuide }}</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top fz-lg"></td>
                <td class="px-4 py-2 align-top fz-lg">
                  {{ disp_overtimeMinimum }}
                </td>
              </tr>
              <tr>
                <td class="px-4 py-2 align-top fz-lg"></td>

                <td class="px-4 py-2 align-top">
                  <select class="w-100 select-secondary" v-model="value_overtimeMinimum">
                    <option selected>0</option>
                    <option>30</option>
                    <option>60</option>
                    <option>90</option>
                    <option>120</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <table class="w-50">
            <tr>
              <th class="fz-xxxl w-50 px-4 py-4 align-top">{{ disp_holidays }}</th>
              <th class="fz-xxxl w-50 px-4 py-4 align-top">{{ disp_nonHolidays }}</th>
            </tr>
            <tr>
              <td class="fz-lg w-50 px-4 py-2 align-top">
                {{ disp_sepcifiedHolidays }}
              </td>
              <td class="fz-lg w-50 px-4 py-2 align-top">
                {{ disp_sepcifiedNonHolidays }}
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 align-top">
                <div class="d-flex w-100 align-items-center">
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    class="w-85-important gray-rounded-date-picker"
                    type="date"
                    :disabled-date="daysToDisable"
                    v-model="value_holidaydatePicked"
                  />
                  <CButton
                    class="btn btn-outline-primary btn-add ml-2"
                    @click="clickOnInsertHoliday()"
                  >
                    +
                  </CButton>
                </div>
              </td>
              <td class="px-4 py-2 align-top">
                <div class="d-flex w-100 align-items-center">
                  <date-picker
                    class="w-85-important gray-rounded-date-picker"
                    :lang="this.$globalDatePickerLanguage"
                    type="date"
                    :disabled-date="daysToDisable"
                    v-model="value_nonHolidaydatePicked"
                  />

                  <CButton
                    class="btn btn-outline-primary btn-add ml-2"
                    @click="clickOnInsertNonHoliday()"
                  >
                    +
                  </CButton>
                </div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 w-50">
                <vxe-table
                  id="holidayTable"
                  :show-header="false"
                  :data="value_holidaysDateToShow"
                  style="height: 288px"
                  stripe
                  :cell-style="cellStyle"
                  empty-text=" "
                >
                  <vxe-table-column show-overflow width="50px">
                    <template #default="{ row }">
                      <vxe-button
                        type="text"
                        icon="far fa-minus-square"
                        @click="deleteHolidayEvent(row)"
                      ></vxe-button>
                    </template>
                  </vxe-table-column>
                  <vxe-table-column
                    style="text-align: left"
                    show-overflow
                    field="display_string"
                    width="auto"
                  ></vxe-table-column>
                </vxe-table>

                <vxe-pager
                  class="h-theme-pager"
                  :layouts="[
                    'PrevJump',
                    'PrevPage',
                    'Number',
                    'NextPage',
                    'NextJump',
                    'FullJump',
                    'Total',
                  ]"
                  :current-page="value_holidayTablePage.currentPage"
                  :page-size="value_holidayTablePage.pageSize"
                  :total="value_holidayTablePage.totalResult"
                  @page-change="handleHolidayPageChange"
                >
                </vxe-pager>
              </td>
              <td class="px-4 py-2 w-100">
                <vxe-table
                  id="nonHolidayTable"
                  :show-header="false"
                  :data="value_nonHolidaysDateToShow"
                  style="height: 288px"
                  stripe
                  :cell-style="cellStyle"
                  empty-text=" "
                >
                  <vxe-table-column show-overflow width="50px">
                    <template #default="{ row }">
                      <vxe-button
                        type="text"
                        icon="far fa-minus-square"
                        @click="deleteNonHolidayEvent(row)"
                      ></vxe-button>
                    </template>
                  </vxe-table-column>
                  <vxe-table-column
                    show-overflow
                    field="display_string"
                    width="auto"
                  ></vxe-table-column>
                </vxe-table>

                <vxe-pager
                  class="h-theme-pager"
                  :layouts="[
                    'PrevJump',
                    'PrevPage',
                    'Number',
                    'NextPage',
                    'NextJump',
                    'FullJump',
                    'Total',
                  ]"
                  :current-page="value_nonHolidayTablePage.currentPage"
                  :page-size="value_nonHolidayTablePage.pageSize"
                  :total="value_nonHolidayTablePage.totalResult"
                  @page-change="handleNonHolidayPageChange"
                >
                </vxe-pager>
              </td>
            </tr>
          </table>
        </div>

        <CRow class="mt-4">
          <CCol sm="3"> </CCol>
          <CCol sm="3"> </CCol>
        </CRow>

        <CCol sm="12">
          <CRow>
            <CCol sm="3">
              <CButton class="btn btn-primary" @click="clickOnApplyAttendanceSettings">
                <div style="font-size: 20px">{{ disp_apply }}</div>
              </CButton>
            </CCol>
          </CRow>
        </CCol>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from "../../i18n";
Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();
  return [
    this.getFullYear() + "-",
    (mm > 9 ? "" : "0") + mm + "-",
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

export default {
  name: "AttendanceSettings",

  data() {
    return {
      obj_loading: null,
      value_allHolidays: [],
      value_holidaysDateToShow: [],
      value_allNonHolidays: [],
      value_nonHolidaysDateToShow: [],

      value_holidayTablePage: {
        currentPage: 1,
        pageSize: 6,
        totalResult: 0,
      },
      value_nonHolidayTablePage: {
        currentPage: 1,
        pageSize: 6,
        totalResult: 0,
      },
      param_cardStyle: "height: 26rem;",
      disp_header: i18n.formatter.format("AttendanceSettings"),
      disp_apply: i18n.formatter.format("Apply"),
      disp_clockIn: i18n.formatter.format("ClockIn"),
      disp_clockOut: i18n.formatter.format("ClockOut"),
      disp_clockInTime: i18n.formatter.format("ClockInTime"),
      disp_clockOutTime: i18n.formatter.format("ClockOutTime"),
      disp_clockInTimeBuffer: i18n.formatter.format("ClockInTimeBuffer"),
      disp_clockOutTimeBuffer: i18n.formatter.format("ClockOutTimeBuffer"),
      disp_clockInUpperBound: i18n.formatter.format("ClockInUpperBound"),

      disp_definedClockInTime: i18n.formatter.format("DefinedClockInTime"),
      disp_definedClockOutTime: i18n.formatter.format("DefinedClockOutTime"),
      disp_clockOutLowerBound: i18n.formatter.format("ClockOutLowerBound"),
      disp_adjustClockInEnabled: i18n.formatter.format("AdjustClockInEnabled"),
      disp_adjustClockOutEnabled: i18n.formatter.format("AdjustClockOutEnabled"),
      disp_sepcifiedHolidays: i18n.formatter.format("SepcifiedHolidays"),
      disp_sepcifiedNonHolidays: i18n.formatter.format("SepcifiedNonHolidays"),
      disp_holidays: i18n.formatter.format("Holidays"),
      disp_nonHolidays: i18n.formatter.format("NonHolidays"),
      disp_break_time: i18n.formatter.format("BreakTimeTitle"),
      disp_overtime: i18n.formatter.format("OvertimeTitle"),
      disp_breakTimeMins: i18n.formatter.format("BreakTimeMins"),
      disp_enableOvertime: i18n.formatter.format("EnableOvertime"),
      disp_overtimeStartTime: i18n.formatter.format("OvertimeStartTime"),
      disp_overtimeGuide: i18n.formatter.format("OvertimeGuide"),
      disp_overtimeMinimum: i18n.formatter.format("OvertimeMinimum"),

      value_clockInTimePicked: null,
      value_clockInTimeBufferMin: 30,
      value_clockOutTimePicked: null,
      value_clockOutTimeBufferMin: 30,
      value_clockInUpperBoundEnabled: false,
      value_clockOutLowerBoundEnabled: false,
      value_adjustClockInEnabled: false,
      value_adjustClockOutEnabled: false,
      value_holidaydatePicked: null,
      value_nonHolidaydatePicked: null,
      value_breakTimeMins: 60,
      value_enableOvertime: false,
      value_overtimeStartTime: new Date("01-01-2000 00:00:00"),
      value_overtimeMinimum: 0,
    };
  },
  created() {
    const self = this;
    self.$globalGetAttendanceSettings(function (err, data) {
      if (!err) {
        /*
        {
                defined_clockin_time_hour : 9,
                defined_clockin_time_buffer_mins : 15,
                defined_clockout_time_hour : 18,
                defined_clockout_time_buffer_mins : 15,
                specified_holidays : [
                    //{ date_time : 0 }
                ],
                specified_non_holidays : [
                    //{ date_time : 0 }
                ]
            }
        */
        // console.log(data);

        // 上下班
        self.value_clockInTimePicked = new Date();
        self.value_clockInTimePicked.setHours(data.defined_clockin_time_hour);
        self.value_clockInTimePicked.setMinutes(data.defined_clockin_time_min);
        self.value_clockOutTimePicked = new Date();
        self.value_clockOutTimePicked.setHours(data.defined_clockout_time_hour);
        self.value_clockOutTimePicked.setMinutes(data.defined_clockout_time_min);

        // 是否啟用遲到/早退的緩衝
        self.value_clockInUpperBoundEnabled = data.defined_clockin_time_late_enabled;
        self.value_clockOutLowerBoundEnabled =
          data.defined_clockout_time_early_leave_enabled;

        // 緩衝時間
        self.value_clockInTimeBufferMin = data.defined_clockin_time_buffer_mins;
        self.value_clockOutTimeBufferMin = data.defined_clockout_time_buffer_mins;

        // 若遲到/早退，是否以表定時間紀錄
        self.value_adjustClockInEnabled = data.defined_clockin_adjustment_enabled;
        self.value_adjustClockOutEnabled = data.defined_clockout_adjustment_enabled;

        // 加班
        self.value_enableOvertime = data.defined_overtime_enabled;
        self.value_overtimeStartTime = new Date();
        self.value_overtimeStartTime.setHours(data.defined_overtime_time_hour);
        self.value_overtimeStartTime.setMinutes(data.defined_overtime_time_min);
        self.value_overtimeMinimum = data.defined_overtime_minimum_min
          ? data.defined_overtime_minimum_min
          : 0;

        // 休息
        self.value_breakTimeMins = data.defined_break_time_mins;

        // 假日
        self.value_allHolidays = data.specified_holidays;
        self.value_allNonHolidays = data.specified_non_holidays;
        self.calHoliday();
        self.calNonHoliday();
      }
    });
  },
  watch: {},
  methods: {
    addMinutes(date, mins) {
      if (!mins) mins = 0;

      let d1 = new Date();
      d1.setHours(date.getHours());
      d1.setMinutes(date.getMinutes() + mins);

      d1 = new Date(d1);

      return d1;
    },
    makeid(length) {
      let result = "";
      let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    sleep(ms = 0) {
      return new Promise((r) => setTimeout(r, ms));
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 16px;";
    },
    daysToDisable(date) {
      let holiday = [];
      let nonholiday = [];
      if (date) {
        holiday = this.value_allHolidays.filter((h) => {
          const t = new Date(h.date_time);
          return t.getTime() == date.getTime();
        });
        nonholiday = this.value_allNonHolidays.filter((h) => {
          const t = new Date(h.date_time);
          return t.getTime() == date.getTime();
        });
      }
      return holiday.length > 0 || nonholiday.length > 0;
    },
    nonHolidaysToDisable(date) {
      let l = [];
      if (date) {
        l = this.value_allNonHolidays.filter((h) => {
          const t = new Date(h.date_time);
          return t.getTime() == date.getTime();
        });
      }
      return l.length > 0;
    },
    getWeekString(index) {
      var r = "";
      switch (index) {
        case 0:
          r = i18n.formatter.format("Sun");
          break;
        case 1:
          r = i18n.formatter.format("Mon");
          break;
        case 2:
          r = i18n.formatter.format("Tue");
          break;
        case 3:
          r = i18n.formatter.format("Wed");
          break;
        case 4:
          r = i18n.formatter.format("Thu");
          break;
        case 5:
          r = i18n.formatter.format("Fri");
          break;
        case 6:
          r = i18n.formatter.format("Sat");
          break;
      }
      // console.log("r", r);
      return r;
    },
    calHoliday() {
      const self = this;
      self.value_allHolidays.sort(function (a, b) {
        return a.date_time - b.date_time;
      });
      self.value_holidaysDateToShow = [];
      self.value_allHolidays.forEach((h) => {
        const t = new Date(h.date_time);
        self.value_holidaysDateToShow.push({
          display_string: t.yyyymmdd() + ` (${self.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      self.value_holidaydatePicked = null;
      self.value_nonHolidaydatePicked = null;
      self.value_holidayTablePage.totalResult = self.value_allHolidays.length;
      if (
        self.value_holidayTablePage.totalResult < self.value_holidayTablePage.pageSize
      ) {
        self.value_holidayTablePage.currentPage = 1;
      }
      self.value_holidaysDateToShow = self.value_holidaysDateToShow.slice(
        (self.value_holidayTablePage.currentPage - 1) *
          self.value_holidayTablePage.pageSize,
        self.value_holidayTablePage.currentPage * self.value_holidayTablePage.pageSize
      );
    },
    calNonHoliday() {
      const self = this;
      self.value_allNonHolidays.sort(function (a, b) {
        return a.date_time - b.date_time;
      });
      self.value_nonHolidaysDateToShow = [];
      self.value_allNonHolidays.forEach((h) => {
        const t = new Date(h.date_time);
        self.value_nonHolidaysDateToShow.push({
          display_string: t.yyyymmdd() + ` (${self.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      self.value_holidaydatePicked = null;
      self.value_nonHolidaydatePicked = null;
      self.value_nonHolidayTablePage.totalResult = self.value_allNonHolidays.length;
      if (
        self.value_nonHolidayTablePage.totalResult <
        self.value_nonHolidayTablePage.pageSize
      ) {
        self.value_nonHolidayTablePage.currentPage = 1;
      }
      self.value_nonHolidaysDateToShow = self.value_nonHolidaysDateToShow.slice(
        (self.value_nonHolidayTablePage.currentPage - 1) *
          self.value_nonHolidayTablePage.pageSize,
        self.value_nonHolidayTablePage.currentPage *
          self.value_nonHolidayTablePage.pageSize
      );
    },
    clickOnInsertHoliday() {
      const self = this;
      if (self.value_holidaydatePicked) {
        const pickedTs = self.value_holidaydatePicked.getTime();
        if (pickedTs) {
          self.value_allHolidays.push({ date_time: pickedTs });
          self.calHoliday();
        }
      }
    },
    clickOnInsertNonHoliday() {
      const self = this;
      if (self.value_nonHolidaydatePicked) {
        const pickedTs = self.value_nonHolidaydatePicked.getTime();
        if (pickedTs) {
          self.value_allNonHolidays.push({ date_time: pickedTs });
          self.calNonHoliday();
        }
      }
    },
    deleteHolidayEvent(item) {
      const self = this;
      self.value_allHolidays = self.value_allHolidays.filter((date) => {
        return date.date_time != item.date_time;
      });
      self.calHoliday();
    },

    deleteNonHolidayEvent(item) {
      const self = this;
      self.value_allNonHolidays = self.value_allNonHolidays.filter((date) => {
        return date.date_time != item.date_time;
      });
      self.calNonHoliday();
    },
    handleHolidayPageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_holidayTablePage.currentPage = currentPage;
      self.calHoliday();
    },
    handleNonHolidayPageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_nonHolidayTablePage.currentPage = currentPage;
      self.calNonHoliday();
    },
    checkDataOnSave() {
      const self = this;
      const workDuration = self.value_clockOutTimePicked - self.value_clockInTimePicked;
      // 表定下班時間需晚於表定上班時間
      const checkWorkDuration = workDuration > 0;

      // 加班起始時間：不可早於表定下班時間 (最早 = 表定下班時間)
      const checkOvertime =
        self.value_overtimeStartTime - self.value_clockOutTimePicked >= 0;

      // (表定下班時間 - 表定上班時間) - 休息時間，需大於等於0
      const checkBreakTime = workDuration - self.value_breakTimeMins * 60000 >= 0;

      let errMsg = "";
      if (!checkWorkDuration) {
        errMsg += this.$t("InvalidWorkDuration") + "; ";
      }
      if (!checkOvertime) {
        errMsg += this.$t("InvalidOvertime") + "; ";
      }
      if (!checkBreakTime) {
        errMsg += this.$t("InvalidBreakTime") + "; ";
      }

      return [checkWorkDuration && checkOvertime && checkBreakTime, errMsg];
    },
    async ApplyAttendanceSettings() {
      const self = this;
      let dataChange = true;
      let [isValid, errMsg] = this.checkDataOnSave();

      if (!isValid) {
        self.$fire({
          text: errMsg,
          type: "error",
          timer: 5000,
          confirmButtonColor: "#20a8d8",
        });

        return;
      }

      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

      const query = {
        defined_clockin_time_hour: self.value_clockInTimePicked.getHours(),
        defined_clockin_time_min: self.value_clockInTimePicked.getMinutes(),
        defined_clockout_time_hour: self.value_clockOutTimePicked.getHours(),
        defined_clockout_time_min: self.value_clockOutTimePicked.getMinutes(),
        defined_clockin_time_buffer_mins: self.value_clockInTimeBufferMin,
        defined_clockout_time_buffer_mins: self.value_clockOutTimeBufferMin,
        defined_clockin_time_late_enabled: self.value_clockInUpperBoundEnabled,
        defined_clockout_time_early_leave_enabled: self.value_clockOutLowerBoundEnabled,
        defined_clockin_adjustment_enabled: self.value_adjustClockInEnabled,
        defined_clockout_adjustment_enabled: self.value_adjustClockOutEnabled,
        defined_break_time_mins: self.value_breakTimeMins,
        defined_overtime_enabled: self.value_enableOvertime,
        defined_overtime_time_hour: self.value_overtimeStartTime.getHours(),
        defined_overtime_time_min: self.value_overtimeStartTime.getMinutes(),
        defined_overtime_minimum_min: self.value_overtimeMinimum,
        specified_holidays: self.value_allHolidays,
        specified_non_holidays: self.value_allNonHolidays,
      };

      if (dataChange) {
        const applyRet = await self.$globalSetAttendanceSettings(
          query,
          self.value_tabletSettings
        );
        if (!applyRet.error) {
          let counterRetry = 0;
          let retry = true;
          let pass = false;
          while (retry) {
            const ret = await self.$globalGetAttendanceSettings();
            if (!ret.error && ret.data) {
              // 上下班
              self.value_clockInTimePicked = new Date();
              self.value_clockInTimePicked.setHours(ret.data.defined_clockin_time_hour);
              self.value_clockInTimePicked.setMinutes(ret.data.defined_clockin_time_min);
              self.value_clockOutTimePicked = new Date();
              self.value_clockOutTimePicked.setHours(ret.data.defined_clockout_time_hour);
              self.value_clockOutTimePicked.setMinutes(
                ret.data.defined_clockout_time_min
              );

              // 是否啟用遲到/早退的緩衝
              self.value_clockInUpperBoundEnabled =
                ret.data.defined_clockin_time_late_enabled;
              self.value_clockOutLowerBoundEnabled =
                ret.data.defined_clockout_time_early_leave_enabled;

              // 緩衝時間
              self.value_clockInTimeBufferMin = ret.data.defined_clockin_time_buffer_mins;
              self.value_clockOutTimeBufferMin =
                ret.data.defined_clockout_time_buffer_mins;

              // 若遲到/早退，是否以表定時間紀錄
              self.value_adjustClockInEnabled =
                ret.data.defined_clockin_adjustment_enabled;
              self.value_adjustClockOutEnabled =
                ret.data.defined_clockout_adjustment_enabled;

              // 加班
              self.value_enableOvertime = ret.data.defined_overtime_enabled;
              self.value_overtimeStartTime = new Date();
              self.value_overtimeStartTime.setHours(ret.data.defined_overtime_time_hour);
              self.value_overtimeStartTime.setMinutes(ret.data.defined_overtime_time_min);
              self.value_overtimeMinimum = ret.data.defined_overtime_minimum_min
                ? ret.data.defined_overtime_minimum_min
                : 0;

              // 休息
              self.value_breakTimeMins = ret.data.defined_break_time_mins;

              // 假日
              self.value_clockOutTimePicked.value_allHolidays =
                ret.data.specified_holidays;
              self.value_clockOutTimePicked.value_allNonHolidays =
                ret.data.specified_non_holidays;
              self.calHoliday();
              self.calNonHoliday();

              retry = false;
              pass = true;
            } else if (counterRetry++ < 10) await self.sleep(2000);
          }
          self.$fire({
            text: pass
              ? i18n.formatter.format("Successful")
              : i18n.formatter.format("OperationFailed"),
            type: pass ? "success" : "error",
            timer: 3000,
          });
        }
      }
      if (self.obj_loading) self.obj_loading.hide();
    },
    clickOnApplyAttendanceSettings() {
      this.ApplyAttendanceSettings();
    },
  },
};
</script>
