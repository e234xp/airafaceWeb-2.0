<template>
  <div>
    <div class="h1">
      {{ disp_header }}
    </div>

    <CCard class="mt-3">
      <CCardBody>
        <div class="d-flex align-items-start">
          <table class="w-50">
            <thead>
              <tr>
                <th class="fz-xxxl w-50 px-4 py-2 align-top">{{ disp_clockIn }}</th>
                <th class="fz-xxxl w-50 px-4 py-2 align-top">{{ disp_clockOut }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fz-lg w-50 px-4 py-1 align-top">{{ disp_clockInChannel }}</td>
                <td class="fz-lg w-50 px-4 py-1 align-top">{{ disp_clockOutChannel }}</td>
              </tr>
              <tr>
                <td class="fz-lg w-50 px-4 pt-1 pb-3 align-top">
                  <multiselect placeholder="" :multiple="true" :hideSelected="true" :taggable="true"
                    :show-no-options="false" :select-label="disp_select" :selected-label="disp_selected"
                    :deselect-label="disp_deselect" v-model="default_attendance_setting.video_device_group_in"
                    :options="param_videoDeviceGroupIn">
                  </multiselect>
                </td>

                <td class="fz-lg w-50 px-4 pt-1 pb-3 align-top">
                  <multiselect placeholder="" :multiple="true" :hideSelected="true" :taggable="true"
                    :show-no-options="false" :select-label="disp_select" :selected-label="disp_selected"
                    :deselect-label="disp_deselect" v-model="default_attendance_setting.video_device_group_out"
                    :options="param_videoDeviceGroupOut">
                  </multiselect>
                </td>
              </tr>
              <tr>
                <td class="fz-lg w-50 px-4 py-1 align-top">{{ disp_definedClockInTime }}</td>
                <td class="fz-lg w-50 px-4 py-1 align-top">{{ disp_definedClockOutTime }}</td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top">
                  <date-picker :lang="this.$globalDatePickerLanguage" class="w-100 gray-rounded-date-picker" type="time"
                    format="HH:mm" v-model="value_clockInTimePicked" />
                </td>
                <td class="px-4 pt-1 pb-3 align-top">
                  <date-picker :lang="this.$globalDatePickerLanguage" class="w-100 gray-rounded-date-picker" type="time"
                    format="HH:mm" v-model="value_clockOutTimePicked" />
                </td>
              </tr>
              <tr>
                <td class="w-25 px-4 pt-1 pb-1 align-top">
                  <div class="fz-lg d-flex align-items-start mt-2">
                    <input type="checkbox" id="use-upperbound-checkbox" class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockin_time_late_enabled" />

                    <label for="use-upperbound-checkbox" class="form-check-label cursor-pointer">{{
                      disp_clockInTimeBuffer }}
                    </label>
                  </div>
                </td>
                <td class="w-25 px-4 pt-1 pb-1 align-top">
                  <div class="fz-lg d-flex align-items-start mt-2">
                    <input type="checkbox" id="use-lowerbound-checkbox" class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockout_time_early_leave_enabled" />
                    <label for="use-lowerbound-checkbox" class="form-check-label cursor-pointer">{{
                      disp_clockOutTimeBuffer }}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top">
                  <select class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_clockin_time_buffer_mins">
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
                <td class="px-4 pt-1 pb-3 align-top">
                  <select class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_clockout_time_buffer_mins">
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
                <td class="px-4 pt-1 pb-3 align-top">
                  <div class="fz-lg d-flex align-items-start mb-2">
                    <input type="checkbox" id="use-specified-colckin-checkbox" class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockin_adjustment_enabled" />
                    <label for="use-specified-colckin-checkbox" class="form-check-label cursor-pointer">{{
                      disp_adjustClockInEnabled }}</label>
                  </div>
                  <div class="h-xxxxl"></div>
                </td>
                <td class="px-4 pt-1 pb-3 align-top">
                  <div class="fz-lg d-flex align-items-start mb-2">
                    <input type="checkbox" id="use-specified-colckout-checkbox" class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockout_adjustment_enabled" />
                    <label for="use-specified-colckout-checkbox" class="form-check-label cursor-pointer">{{
                      disp_adjustClockOutEnabled }}</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="fz-xxxl px-4 pt-1 pb-3 align-top font-weight-bold">
                  <div class="border-top h-xl"></div>
                  <div>{{ disp_break_time }}</div>
                </td>
                <td class="fz-xxxl px-4 pt-1 pb-3 align-top font-weight-bold">
                  <div class="border-top h-xl"></div>
                  <div>{{ disp_overtime }}</div>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg"></td>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <input type="checkbox" id="calc-work-overtime-checkbox" class="cursor-pointer mr-2 mt-1"
                    v-model="default_attendance_setting.defined_overtime_enabled" />

                  <label for="calc-work-overtime-checkbox" class="form-check-label cursor-pointer">{{
                    disp_enableOvertime }}
                  </label>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <div class="mb-3">
                    {{ disp_breakTimeMins }}
                  </div>
                  <select class="w-100 select-secondary" v-model="default_attendance_setting.defined_break_time_mins">
                    <option>0</option>
                    <option>30</option>
                    <option selected>60</option>
                    <option>90</option>
                    <option>120</option>
                  </select>
                </td>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <div class="mb-3">
                    {{ disp_overtimeStartTime }}
                  </div>
                  <date-picker :lang="this.$globalDatePickerLanguage" class="w-100 gray-rounded-date-picker" type="time"
                    format="HH:mm" v-model="value_overtimeStartTime" />
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg"></td>
                <td class="px-4 pt-1 pb-3 align-top fz-md">
                  <ul>
                    <li>{{ disp_overtimeGuide }}</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg"></td>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  {{ disp_overtimeMinimum }}
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg"></td>

                <td class="px-4 pt-1 pb-3 align-top">
                  <select class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_overtime_minimum_min">
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
              <th class="fz-xxxl w-50 px-4 py-2 align-top">{{ disp_holidays }}</th>
              <th class="fz-xxxl w-50 px-4 py-2 align-top">{{ disp_nonHolidays }}</th>
            </tr>
            <tr>
              <td class="fz-lg w-50 px-4 py-1 align-top">
                {{ disp_sepcifiedHolidays }}
              </td>
              <td class="fz-lg w-50 px-4 py-1 align-top">
                {{ disp_sepcifiedNonHolidays }}
              </td>
            </tr>
            <tr>
              <td class="px-4 pt-1 pb-3 align-top">
                <div class="d-flex w-100 align-items-center">
                  <date-picker :lang="this.$globalDatePickerLanguage" class="w-85-important gray-rounded-date-picker"
                    type="date" :disabled-date="daysToDisable" v-model="value_holidaydatePicked" />
                  <CButton class="btn btn-outline-primary btn-add ml-2" @click="clickOnInsertHoliday()">
                    +
                  </CButton>
                </div>
              </td>
              <td class="px-4 pt-1 pb-3 align-top">
                <div class="d-flex w-100 align-items-center">
                  <date-picker class="w-85-important gray-rounded-date-picker" :lang="this.$globalDatePickerLanguage"
                    type="date" :disabled-date="daysToDisable" v-model="value_nonHolidaydatePicked" />

                  <CButton class="btn btn-outline-primary btn-add ml-2" @click="clickOnInsertNonHoliday()">
                    +
                  </CButton>
                </div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-1 w-50">
                <vxe-table id="holidayTable" :show-header="false" :data="value_holidaysDateToShow" style="height: 288px"
                  stripe :cell-style="cellStyle" empty-text=" ">
                  <vxe-table-column show-overflow width="50px">
                    <template #default="{ row }">
                      <vxe-button type="text" icon="far fa-minus-square" @click="deleteHolidayEvent(row)"></vxe-button>
                    </template>
                  </vxe-table-column>
                  <vxe-table-column style="text-align: left" show-overflow field="display_string"
                    width="auto"></vxe-table-column>
                </vxe-table>

                <vxe-pager class="h-theme-pager" :layouts="[
                    'PrevJump',
                    'PrevPage',
                    'Number',
                    'NextPage',
                    'NextJump',
                    'FullJump',
                    'Total',
                  ]" :current-page="value_holidayTablePage.currentPage" :page-size="value_holidayTablePage.pageSize"
                  :total="value_holidayTablePage.totalResult" @page-change="handleHolidayPageChange">
                </vxe-pager>
              </td>
              <td class="px-4 py-1 w-100">
                <vxe-table id="nonHolidayTable" :show-header="false" :data="value_nonHolidaysDateToShow"
                  style="height: 288px" stripe :cell-style="cellStyle" empty-text=" ">
                  <vxe-table-column show-overflow width="50px">
                    <template #default="{ row }">
                      <vxe-button type="text" icon="far fa-minus-square"
                        @click="deleteNonHolidayEvent(row)"></vxe-button>
                    </template>
                  </vxe-table-column>
                  <vxe-table-column show-overflow field="display_string" width="auto"></vxe-table-column>
                </vxe-table>

                <vxe-pager class="h-theme-pager" :layouts="[
                    'PrevJump',
                    'PrevPage',
                    'Number',
                    'NextPage',
                    'NextJump',
                    'FullJump',
                    'Total',
                  ]" :current-page="value_nonHolidayTablePage.currentPage"
                  :page-size="value_nonHolidayTablePage.pageSize" :total="value_nonHolidayTablePage.totalResult"
                  @page-change="handleNonHolidayPageChange">
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
              <CButton class="btn btn-primary" @click="ApplyAttendanceSettings">
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
import i18n from '@/i18n';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

export default {
  name: 'AttendanceSettings',

  components: {
    multiselect: Multiselect,
  },
  data() {
    return {
      obj_loading: null,

      param_videoDeviceGroupIn: [],
      param_videoDeviceGroupOut: [],

      value_holidaysDateToShow: [],
      value_nonHolidaysDateToShow: [],

      value_holidayTablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      value_nonHolidayTablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },

      disp_header: i18n.formatter.format('AttendanceSettings'),
      disp_apply: i18n.formatter.format('Apply'),
      disp_clockInChannel: i18n.formatter.format('ClockInChannel'),
      disp_clockOutChannel: i18n.formatter.format('ClockOutChannel'),

      disp_clockIn: i18n.formatter.format('ClockIn'),
      disp_clockOut: i18n.formatter.format('ClockOut'),
      disp_clockInTime: i18n.formatter.format('ClockInTime'),
      disp_clockOutTime: i18n.formatter.format('ClockOutTime'),
      disp_clockInTimeBuffer: i18n.formatter.format('ClockInTimeBuffer'),
      disp_clockOutTimeBuffer: i18n.formatter.format('ClockOutTimeBuffer'),
      disp_clockInUpperBound: i18n.formatter.format('ClockInUpperBound'),

      disp_definedClockInTime: i18n.formatter.format('DefinedClockInTime'),
      disp_definedClockOutTime: i18n.formatter.format('DefinedClockOutTime'),
      disp_clockOutLowerBound: i18n.formatter.format('ClockOutLowerBound'),
      disp_adjustClockInEnabled: i18n.formatter.format('AdjustClockInEnabled'),
      disp_adjustClockOutEnabled: i18n.formatter.format('AdjustClockOutEnabled'),
      disp_sepcifiedHolidays: i18n.formatter.format('SepcifiedHolidays'),
      disp_sepcifiedNonHolidays: i18n.formatter.format('SepcifiedNonHolidays'),
      disp_holidays: i18n.formatter.format('Holidays'),
      disp_nonHolidays: i18n.formatter.format('NonHolidays'),
      disp_break_time: i18n.formatter.format('BreakTimeTitle'),
      disp_overtime: i18n.formatter.format('OvertimeTitle'),
      disp_breakTimeMins: i18n.formatter.format('BreakTimeMins'),
      disp_enableOvertime: i18n.formatter.format('EnableOvertime'),
      disp_overtimeStartTime: i18n.formatter.format('OvertimeStartTime'),
      disp_overtimeGuide: i18n.formatter.format('OvertimeGuide'),
      disp_overtimeMinimum: i18n.formatter.format('OvertimeMinimum'),
      disp_select: i18n.formatter.format('Select'),
      disp_selected: i18n.formatter.format('Selected'),
      disp_deselect: i18n.formatter.format('Deselect'),

      value_holidaydatePicked: null,
      value_nonHolidaydatePicked: null,
      value_clockInTimePicked: null,
      value_clockOutTimePicked: null,
      value_overtimeStartTime: null,

      default_attendance_setting: {
        defined_clockin_time_hour: 19,
        defined_clockin_time_min: 0,
        defined_clockin_time_buffer_mins: 30,
        defined_clockin_adjustment_enabled: false,
        defined_clockin_time_late_enabled: true,

        defined_clockout_time_hour: 18,
        defined_clockout_time_min: 0,
        defined_clockout_time_buffer_mins: 30,
        defined_clockout_adjustment_enabled: false,
        defined_clockout_time_early_leave_enabled: true,

        defined_break_time_mins: 60,

        defined_overtime_enabled: false,
        defined_overtime_time_hour: 19,
        defined_overtime_time_min: 0,
        defined_overtime_minimum_min: 0,

        specified_holidays: [],
        specified_non_holidays: [],

        video_device_group_in: [],
        video_device_group_out: [],
      },
    };
  },
  created() {
    const self = this;

    self.$globalFindVideoDeviceGroups('', 0, 3000, (err, data) => {
      self.param_videoDeviceGroupIn = [];
      self.param_videoDeviceGroupOut = [];

      if (!err) {
        if (data.result && data.result.length >= 1) {
          for (let o = 0; o < data.result.length; o += 1) {
            self.param_videoDeviceGroupIn.push(data.result[o].name);
            self.param_videoDeviceGroupOut.push(data.result[o].name);
          }
        }
      }
    });

    self.getAttendanceSettings();
  },

  watch: {},
  methods: {
    formatYYYYMMDD(date) {
      const mm = date.getMonth() + 1; // getMonth() is zero-based
      const dd = date.getDate();
      return `${date.getFullYear()}-${(mm > 9 ? '' : '0') + mm}-${(dd > 9 ? '' : '0') + dd}`;
    },

    getAttendanceSettings() {
      const self = this;

      self.$globalGetAttendanceSettings((err, pData) => {
        if (!err) {
          // const data = { ...self.default_attendance_setting, ...pData };
          self.default_attendance_setting = { ...self.default_attendance_setting, ...pData };

          self.value_clockInTimePicked = new Date();
          self.value_clockOutTimePicked = new Date();
          self.value_overtimeStartTime = new Date();

          self.value_clockInTimePicked.setHours(self.default_attendance_setting.defined_clockin_time_hour);
          self.value_clockInTimePicked.setMinutes(self.default_attendance_setting.defined_clockin_time_min);

          self.value_clockOutTimePicked.setHours(self.default_attendance_setting.defined_clockout_time_hour);
          self.value_clockOutTimePicked.setMinutes(self.default_attendance_setting.defined_clockout_time_min);

          self.value_overtimeStartTime.setHours(self.default_attendance_setting.defined_overtime_time_hour);
          self.value_overtimeStartTime.setMinutes(self.default_attendance_setting.defined_overtime_time_min);

          self.calHoliday();
          self.calNonHoliday();
        }
      });
    },
    cellStyle() {
      return 'fontSize: 16px;';
    },
    daysToDisable(date) {
      let holiday = [];
      let nonholiday = [];
      if (date) {
        holiday = this.default_attendance_setting.specified_holidays.filter((h) => {
          const t = new Date(h.date_time);
          return t.getTime() === date.getTime();
        });
        nonholiday = this.default_attendance_setting.specified_non_holidays.filter((h) => {
          const t = new Date(h.date_time);
          return t.getTime() === date.getTime();
        });
      }
      return holiday.length > 0 || nonholiday.length > 0;
    },
    getWeekString(index) {
      let r = '';
      switch (index) {
        case 0:
          r = i18n.formatter.format('Sun');
          break;
        case 1:
          r = i18n.formatter.format('Mon');
          break;
        case 2:
          r = i18n.formatter.format('Tue');
          break;
        case 3:
          r = i18n.formatter.format('Wed');
          break;
        case 4:
          r = i18n.formatter.format('Thu');
          break;
        case 5:
          r = i18n.formatter.format('Fri');
          break;
        case 6:
          r = i18n.formatter.format('Sat');
          break;
        default:
          r = '';
          break;
      }
      return r;
    },
    calHoliday() {
      const self = this;
      self.default_attendance_setting.specified_holidays.sort((a, b) => a.date_time - b.date_time);
      self.value_holidaysDateToShow = [];
      self.default_attendance_setting.specified_holidays.forEach((h) => {
        const t = new Date(h.date_time);
        self.value_holidaysDateToShow.push({
          display_string: `${self.formatYYYYMMDD(t)} (${self.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      self.value_holidaydatePicked = null;
      self.value_nonHolidaydatePicked = null;
      self.value_holidayTablePage.totalResult = self.default_attendance_setting.specified_holidays.length;
      if (
        self.value_holidayTablePage.totalResult < self.value_holidayTablePage.pageSize
      ) {
        self.value_holidayTablePage.currentPage = 1;
      }
      self.value_holidaysDateToShow = self.value_holidaysDateToShow.slice(
        (self.value_holidayTablePage.currentPage - 1) * self.value_holidayTablePage.pageSize,
        self.value_holidayTablePage.currentPage * self.value_holidayTablePage.pageSize,
      );
    },
    calNonHoliday() {
      const self = this;
      self.default_attendance_setting.specified_non_holidays.sort((a, b) => a.date_time - b.date_time);
      self.value_nonHolidaysDateToShow = [];
      self.default_attendance_setting.specified_non_holidays.forEach((h) => {
        const t = new Date(h.date_time);
        self.value_nonHolidaysDateToShow.push({
          display_string: `${self.formatYYYYMMDD(t)} (${self.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      self.value_holidaydatePicked = null;
      self.value_nonHolidaydatePicked = null;
      self.value_nonHolidayTablePage.totalResult = self.default_attendance_setting.specified_non_holidays.length;
      if (
        self.value_nonHolidayTablePage.totalResult < self.value_nonHolidayTablePage.pageSize
      ) {
        self.value_nonHolidayTablePage.currentPage = 1;
      }
      self.value_nonHolidaysDateToShow = self.value_nonHolidaysDateToShow.slice(
        (self.value_nonHolidayTablePage.currentPage - 1) * self.value_nonHolidayTablePage.pageSize,
        self.value_nonHolidayTablePage.currentPage * self.value_nonHolidayTablePage.pageSize,
      );
    },
    clickOnInsertHoliday() {
      const self = this;
      if (self.value_holidaydatePicked) {
        const pickedTs = self.value_holidaydatePicked.getTime();
        if (pickedTs) {
          self.default_attendance_setting.specified_holidays.push({ date_time: pickedTs });
          self.calHoliday();
        }
      }
    },
    clickOnInsertNonHoliday() {
      const self = this;
      if (self.value_nonHolidaydatePicked) {
        const pickedTs = self.value_nonHolidaydatePicked.getTime();
        if (pickedTs) {
          self.default_attendance_setting.specified_non_holidays.push({ date_time: pickedTs });
          self.calNonHoliday();
        }
      }
    },
    deleteHolidayEvent(item) {
      const self = this;
      self.default_attendance_setting.specified_holidays = self.default_attendance_setting.specified_holidays.filter(
        (date) => date.date_time !== item.date_time,
      );
      self.calHoliday();
    },

    deleteNonHolidayEvent(item) {
      const self = this;
      self.default_attendance_setting.specified_non_holidays = self.default_attendance_setting.specified_non_holidays.filter(
        (date) => date.date_time !== item.date_time,
      );
      self.calNonHoliday();
    },
    handleHolidayPageChange({ currentPage }) {
      const self = this;
      self.value_holidayTablePage.currentPage = currentPage;
      self.calHoliday();
    },
    handleNonHolidayPageChange({ currentPage }) {
      const self = this;
      self.value_nonHolidayTablePage.currentPage = currentPage;
      self.calNonHoliday();
    },

    checkDataOnSave() {
      const self = this;
      let errMsg = '';

      if (self.value_clockOutTimePicked - self.value_clockInTimePicked <= 0) {
        errMsg += `${this.$t('InvalidWorkDuration')}; `;
        return [false, errMsg];
      }

      if (self.value_overtimeStartTime - self.value_clockOutTimePicked <= 0) {
        errMsg += `${this.$t('InvalidOvertime')}; `;
        return [false, errMsg];
      }

      if (self.value_clockOutTimePicked - self.value_clockInTimePicked - (self.default_attendance_setting.defined_break_time_mins * 60000) <= 0) {
        errMsg += `${this.$t('InvalidBreakTime')}; `;
        return [false, errMsg];
      }

      return [true, errMsg];
    },

    async ApplyAttendanceSettings() {
      const self = this;
      const [isValid, errMsg] = this.checkDataOnSave();

      if (!isValid) {
        self.$fire({
          text: errMsg,
          type: 'error',
          timer: 5000,
          confirmButtonColor: '#20a8d8',
        });
        return;
      }

      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

      const query = {
        defined_clockin_time_hour: self.value_clockInTimePicked.getHours(),
        defined_clockin_time_min: self.value_clockInTimePicked.getMinutes(),
        defined_clockout_time_hour: self.value_clockOutTimePicked.getHours(),
        defined_clockout_time_min: self.value_clockOutTimePicked.getMinutes(),
        defined_clockin_time_buffer_mins: self.default_attendance_setting.defined_clockin_time_buffer_mins,
        defined_clockout_time_buffer_mins: self.default_attendance_setting.defined_clockout_time_buffer_mins,
        defined_clockin_time_late_enabled: self.default_attendance_setting.defined_clockin_time_late_enabled,
        defined_clockout_time_early_leave_enabled: self.default_attendance_setting.defined_clockout_time_early_leave_enabled,
        defined_clockin_adjustment_enabled: self.default_attendance_setting.defined_clockin_adjustment_enabled,
        defined_clockout_adjustment_enabled: self.default_attendance_setting.defined_clockout_adjustment_enabled,
        defined_break_time_mins: self.default_attendance_setting.defined_break_time_mins,
        defined_overtime_enabled: self.default_attendance_setting.defined_overtime_enabled,
        defined_overtime_time_hour: self.value_overtimeStartTime.getHours(),
        defined_overtime_time_min: self.value_overtimeStartTime.getMinutes(),
        defined_overtime_minimum_min: self.default_attendance_setting.defined_overtime_minimum_min,
        specified_holidays: self.default_attendance_setting.specified_holidays,
        specified_non_holidays: self.default_attendance_setting.specified_non_holidays,
        video_device_group_in: self.default_attendance_setting.video_device_group_in,
        video_device_group_out: self.default_attendance_setting.video_device_group_out,
      };

      const applyRet = await self.$globalSetAttendanceSettings(
        query,
      );

      const pass = !applyRet.error;

      self.$fire({
        text: pass
          ? i18n.formatter.format('Successful')
          : i18n.formatter.format('OperationFailed'),
        type: pass ? 'success' : 'error',
        timer: 3000,
      });

      if (self.obj_loading) self.obj_loading.hide();
    },
  },
};
</script>
