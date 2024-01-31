<template>
  <div>
    <div class="h1">
      {{ $t('AttendanceSettings') }}
    </div>

    <CCard class="mt-3">
      <CCardBody>
        <div class="d-flex align-items-start">
          <table class="w-50">
            <thead>
              <tr>
                <th class="fz-xxxl w-50 px-4 py-2 align-top">
                  {{ $t('ClockIn') }}
                </th>
                <th class="fz-xxxl w-50 px-4 py-2 align-top">
                  {{ $t('ClockOut') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fz-lg w-50 px-4 py-1 align-top">
                  {{ $t('ClockInChannel') }}
                </td>
                <td class="fz-lg w-50 px-4 py-1 align-top">
                  {{ $t('ClockOutChannel') }}
                </td>
              </tr>
              <tr>
                <td class="fz-lg w-50 px-4 pt-1 pb-3 align-top">
                  <multiselect
                    placeholder=""
                    :multiple="true"
                    :hide-selected="true"
                    :taggable="true"
                    :show-no-options="false"
                    :select-label="$t('Select')"
                    :selected-label="$t('Selected')"
                    :deselect-label="$t('Deselect')"
                    v-model="default_attendance_setting.video_device_group_in"
                    :options="param_videoDeviceGroupIn"
                  />
                </td>

                <td class="fz-lg w-50 px-4 pt-1 pb-3 align-top">
                  <multiselect
                    placeholder=""
                    :multiple="true"
                    :hide-selected="true"
                    :taggable="true"
                    :show-no-options="false"
                    :select-label="$t('Select')"
                    :selected-label="$t('Selected')"
                    :deselect-label="$t('Deselect')"
                    v-model="default_attendance_setting.video_device_group_out"
                    :options="param_videoDeviceGroupOut"
                  />
                </td>
              </tr>
              <tr>
                <td class="fz-lg w-50 px-4 py-1 align-top">
                  {{ $t('DefinedClockInTime') }}
                </td>
                <td class="fz-lg w-50 px-4 py-1 align-top">
                  {{ $t('DefinedClockOutTime') }}
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top">
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    class="w-100 gray-rounded-date-picker"
                    type="time"
                    format="HH:mm"
                    v-model="value_clockInTimePicked"
                  />
                </td>
                <td class="px-4 pt-1 pb-3 align-top">
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
                <td class="w-25 px-4 pt-1 pb-1 align-top">
                  <div class="fz-lg d-flex align-items-start mt-2">
                    <input
                      type="checkbox"
                      id="use-upperbound-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockin_time_late_enabled"
                    >

                    <label
                      for="use-upperbound-checkbox"
                      class="form-check-label cursor-pointer"
                    >
                      {{ $t('ClockInTimeBuffer') }}
                    </label>
                  </div>
                </td>
                <td class="w-25 px-4 pt-1 pb-1 align-top">
                  <div class="fz-lg d-flex align-items-start mt-2">
                    <input
                      type="checkbox"
                      id="use-lowerbound-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockout_time_early_leave_enabled"
                    >
                    <label
                      for="use-lowerbound-checkbox"
                      class="form-check-label cursor-pointer"
                    >
                      {{ $t('ClockOutTimeBuffer') }}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top">
                  <select
                    class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_clockin_time_buffer_mins"
                  >
                    <option>0</option>
                    <option>15</option>
                    <option selected>
                      30
                    </option>
                    <option>45</option>
                    <option>60</option>
                    <option>75</option>
                    <option>90</option>
                    <option>105</option>
                    <option>120</option>
                  </select>
                </td>
                <td class="px-4 pt-1 pb-3 align-top">
                  <select
                    class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_clockout_time_buffer_mins"
                  >
                    <option>0</option>
                    <option>15</option>
                    <option selected>
                      30
                    </option>
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
                    <input
                      type="checkbox"
                      id="use-specified-colckin-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockin_adjustment_enabled"
                    >
                    <label
                      for="use-specified-colckin-checkbox"
                      class="form-check-label cursor-pointer"
                    >
                      {{ $t('AdjustClockInEnabled') }}
                    </label>
                  </div>
                  <div class="h-xxxxl" />
                </td>
                <td class="px-4 pt-1 pb-3 align-top">
                  <div class="fz-lg d-flex align-items-start mb-2">
                    <input
                      type="checkbox"
                      id="use-specified-colckout-checkbox"
                      class="cursor-pointer mr-2 mt-1"
                      v-model="default_attendance_setting.defined_clockout_adjustment_enabled"
                    >
                    <label
                      for="use-specified-colckout-checkbox"
                      class="form-check-label cursor-pointer"
                    >
                      {{ $t('AdjustClockOutEnabled') }}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="fz-xxxl px-4 pt-1 pb-3 align-top font-weight-bold">
                  <div class="border-top h-xl" />
                  <div>{{ $t('BreakTimeTitle') }}</div>
                </td>
                <td class="fz-xxxl px-4 pt-1 pb-3 align-top font-weight-bold">
                  <div class="border-top h-xl" />
                  <div>{{ $t('OvertimeTitle') }}</div>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg" />
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <input
                    type="checkbox"
                    id="calc-work-overtime-checkbox"
                    class="cursor-pointer mr-2 mt-1"
                    v-model="default_attendance_setting.defined_overtime_enabled"
                  >

                  <label
                    for="calc-work-overtime-checkbox"
                    class="form-check-label cursor-pointer"
                  >
                    {{ $t('EnableOvertime') }}
                  </label>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <div class="mb-3">
                    {{ $t('BreakTimeMins') }}
                  </div>
                  <select
                    class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_break_time_mins"
                  >
                    <option>0</option>
                    <option>30</option>
                    <option selected>
                      60
                    </option>
                    <option>90</option>
                    <option>120</option>
                  </select>
                </td>
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  <div class="mb-3">
                    {{ $t('OvertimeStartTime') }}
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
                <td class="px-4 pt-1 pb-3 align-top fz-lg" />
                <td class="px-4 pt-1 pb-3 align-top fz-md">
                  <ul>
                    <li>{{ $t('OvertimeGuide') }}</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg" />
                <td class="px-4 pt-1 pb-3 align-top fz-lg">
                  {{ $t('OvertimeMinimum') }}
                </td>
              </tr>
              <tr>
                <td class="px-4 pt-1 pb-3 align-top fz-lg" />

                <td class="px-4 pt-1 pb-3 align-top">
                  <select
                    class="w-100 select-secondary"
                    v-model="default_attendance_setting.defined_overtime_minimum_min"
                  >
                    <option selected>
                      0
                    </option>
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
              <th class="fz-xxxl w-50 px-4 py-2 align-top">
                {{ $t('Holidays') }}
              </th>
              <th class="fz-xxxl w-50 px-4 py-2 align-top">
                {{ $t('NonHolidays') }}
              </th>
            </tr>
            <tr>
              <td class="fz-lg w-50 px-4 py-1 align-top">
                {{ $t('SepcifiedHolidays') }}
              </td>
              <td class="fz-lg w-50 px-4 py-1 align-top">
                {{ $t('SepcifiedNonHolidays') }}
              </td>
            </tr>
            <tr>
              <td class="px-4 pt-1 pb-3 align-top">
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
              <td class="px-4 pt-1 pb-3 align-top">
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
              <td class="px-4 py-1 w-50">
                <vxe-table
                  id="holidayTable"
                  :show-header="false"
                  :data="value_holidaysDateToShow"
                  style="height: 288px"
                  stripe
                  :cell-style="cellStyle"
                  empty-text=" "
                >
                  <vxe-table-column
                    show-overflow
                    width="50px"
                  >
                    <template #default="{ row }">
                      <vxe-button
                        type="text"
                        icon="far fa-minus-square"
                        @click="deleteHolidayEvent(row)"
                      />
                    </template>
                  </vxe-table-column>
                  <vxe-table-column
                    style="text-align: left"
                    show-overflow
                    field="display_string"
                    width="auto"
                  />
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
                />
              </td>
              <td class="px-4 py-1 w-100">
                <vxe-table
                  id="nonHolidayTable"
                  :show-header="false"
                  :data="value_nonHolidaysDateToShow"
                  style="height: 288px"
                  stripe
                  :cell-style="cellStyle"
                  empty-text=" "
                >
                  <vxe-table-column
                    show-overflow
                    width="50px"
                  >
                    <template #default="{ row }">
                      <vxe-button
                        type="text"
                        icon="far fa-minus-square"
                        @click="deleteNonHolidayEvent(row)"
                      />
                    </template>
                  </vxe-table-column>
                  <vxe-table-column
                    show-overflow
                    field="display_string"
                    width="auto"
                  />
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
                />
              </td>
            </tr>
          </table>
        </div>

        <CRow class="mt-4">
          <CCol sm="3" />
          <CCol sm="3" />
        </CRow>

        <CCol sm="12">
          <CRow>
            <CCol sm="3">
              <CButton
                class="btn btn-primary"
                @click="ApplyAttendanceSettings"
              >
                <div style="font-size: 20px">
                  {{ $t('Apply') }}
                </div>
              </CButton>
            </CCol>
          </CRow>
        </CCol>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
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
    this.$globalFindVideoDeviceGroups('', 0, 3000, (err, data) => {
      this.param_videoDeviceGroupIn = [];
      this.param_videoDeviceGroupOut = [];

      if (!err) {
        if (data.result && data.result.length >= 1) {
          for (let o = 0; o < data.result.length; o += 1) {
            this.param_videoDeviceGroupIn.push(data.result[o].name);
            this.param_videoDeviceGroupOut.push(data.result[o].name);
          }
        }
      }
    });

    this.getAttendanceSettings();
  },

  watch: {},
  methods: {
    formatYYYYMMDD(date) {
      const mm = date.getMonth() + 1; // getMonth() is zero-based
      const dd = date.getDate();
      return `${date.getFullYear()}-${(mm > 9 ? '' : '0') + mm}-${(dd > 9 ? '' : '0') + dd}`;
    },

    getAttendanceSettings() {
      this.$globalGetAttendanceSettings((err, pData) => {
        if (!err) {
          // const data = { ...this.default_attendance_setting, ...pData };
          this.default_attendance_setting = { ...this.default_attendance_setting, ...pData };

          this.value_clockInTimePicked = new Date();
          this.value_clockOutTimePicked = new Date();
          this.value_overtimeStartTime = new Date();

          this.value_clockInTimePicked.setHours(this.default_attendance_setting.defined_clockin_time_hour);
          this.value_clockInTimePicked.setMinutes(this.default_attendance_setting.defined_clockin_time_min);

          this.value_clockOutTimePicked.setHours(this.default_attendance_setting.defined_clockout_time_hour);
          this.value_clockOutTimePicked.setMinutes(this.default_attendance_setting.defined_clockout_time_min);

          this.value_overtimeStartTime.setHours(this.default_attendance_setting.defined_overtime_time_hour);
          this.value_overtimeStartTime.setMinutes(this.default_attendance_setting.defined_overtime_time_min);

          this.calHoliday();
          this.calNonHoliday();
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
          r = this.$t('Sun');
          break;
        case 1:
          r = this.$t('Mon');
          break;
        case 2:
          r = this.$t('Tue');
          break;
        case 3:
          r = this.$t('Wed');
          break;
        case 4:
          r = this.$t('Thu');
          break;
        case 5:
          r = this.$t('Fri');
          break;
        case 6:
          r = this.$t('Sat');
          break;
        default:
          r = '';
          break;
      }
      return r;
    },
    calHoliday() {
      this.default_attendance_setting.specified_holidays.sort((a, b) => a.date_time - b.date_time);
      this.value_holidaysDateToShow = [];
      this.default_attendance_setting.specified_holidays.forEach((h) => {
        const t = new Date(h.date_time);
        this.value_holidaysDateToShow.push({
          display_string: `${this.formatYYYYMMDD(t)} (${this.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      this.value_holidaydatePicked = null;
      this.value_nonHolidaydatePicked = null;
      this.value_holidayTablePage.totalResult = this.default_attendance_setting.specified_holidays.length;
      if (
        this.value_holidayTablePage.totalResult < this.value_holidayTablePage.pageSize
      ) {
        this.value_holidayTablePage.currentPage = 1;
      }
      this.value_holidaysDateToShow = this.value_holidaysDateToShow.slice(
        (this.value_holidayTablePage.currentPage - 1) * this.value_holidayTablePage.pageSize,
        this.value_holidayTablePage.currentPage * this.value_holidayTablePage.pageSize,
      );
    },
    calNonHoliday() {
      this.default_attendance_setting.specified_non_holidays.sort((a, b) => a.date_time - b.date_time);
      this.value_nonHolidaysDateToShow = [];
      this.default_attendance_setting.specified_non_holidays.forEach((h) => {
        const t = new Date(h.date_time);
        this.value_nonHolidaysDateToShow.push({
          display_string: `${this.formatYYYYMMDD(t)} (${this.getWeekString(t.getDay())})`,
          date_time: t.getTime(),
        });
      });
      this.value_holidaydatePicked = null;
      this.value_nonHolidaydatePicked = null;
      this.value_nonHolidayTablePage.totalResult = this.default_attendance_setting.specified_non_holidays.length;
      if (
        this.value_nonHolidayTablePage.totalResult < this.value_nonHolidayTablePage.pageSize
      ) {
        this.value_nonHolidayTablePage.currentPage = 1;
      }
      this.value_nonHolidaysDateToShow = this.value_nonHolidaysDateToShow.slice(
        (this.value_nonHolidayTablePage.currentPage - 1) * this.value_nonHolidayTablePage.pageSize,
        this.value_nonHolidayTablePage.currentPage * this.value_nonHolidayTablePage.pageSize,
      );
    },
    clickOnInsertHoliday() {
      if (this.value_holidaydatePicked) {
        const pickedTs = this.value_holidaydatePicked.getTime();
        if (pickedTs) {
          this.default_attendance_setting.specified_holidays.push({ date_time: pickedTs });
          this.calHoliday();
        }
      }
    },
    clickOnInsertNonHoliday() {
      if (this.value_nonHolidaydatePicked) {
        const pickedTs = this.value_nonHolidaydatePicked.getTime();
        if (pickedTs) {
          this.default_attendance_setting.specified_non_holidays.push({ date_time: pickedTs });
          this.calNonHoliday();
        }
      }
    },
    deleteHolidayEvent(item) {
      this.default_attendance_setting.specified_holidays = this.default_attendance_setting.specified_holidays.filter(
        (date) => date.date_time !== item.date_time,
      );
      this.calHoliday();
    },

    deleteNonHolidayEvent(item) {
      this.default_attendance_setting.specified_non_holidays = this.default_attendance_setting.specified_non_holidays.filter(
        (date) => date.date_time !== item.date_time,
      );
      this.calNonHoliday();
    },
    handleHolidayPageChange({ currentPage }) {
      this.value_holidayTablePage.currentPage = currentPage;
      this.calHoliday();
    },
    handleNonHolidayPageChange({ currentPage }) {
      this.value_nonHolidayTablePage.currentPage = currentPage;
      this.calNonHoliday();
    },

    checkDataOnSave() {
      let errMsg = '';

      if (this.value_clockOutTimePicked - this.value_clockInTimePicked <= 0) {
        errMsg += `${this.$t('InvalidWorkDuration')}; `;
        return [false, errMsg];
      }

      if (this.value_overtimeStartTime - this.value_clockOutTimePicked <= 0) {
        errMsg += `${this.$t('InvalidOvertime')}; `;
        return [false, errMsg];
      }

      if (this.value_clockOutTimePicked - this.value_clockInTimePicked - (this.default_attendance_setting.defined_break_time_mins * 60000) <= 0) {
        errMsg += `${this.$t('InvalidBreakTime')}; `;
        return [false, errMsg];
      }

      return [true, errMsg];
    },

    async ApplyAttendanceSettings() {
      const [isValid, errMsg] = this.checkDataOnSave();

      if (!isValid) {
        this.$fire({
          text: errMsg,
          type: 'error',
          timer: 5000,
          confirmButtonColor: '#20a8d8',
        });
        return;
      }

      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

      const query = {
        defined_clockin_time_hour: this.value_clockInTimePicked.getHours(),
        defined_clockin_time_min: this.value_clockInTimePicked.getMinutes(),
        defined_clockout_time_hour: this.value_clockOutTimePicked.getHours(),
        defined_clockout_time_min: this.value_clockOutTimePicked.getMinutes(),
        defined_clockin_time_buffer_mins: this.default_attendance_setting.defined_clockin_time_buffer_mins,
        defined_clockout_time_buffer_mins: this.default_attendance_setting.defined_clockout_time_buffer_mins,
        defined_clockin_time_late_enabled: this.default_attendance_setting.defined_clockin_time_late_enabled,
        defined_clockout_time_early_leave_enabled: this.default_attendance_setting.defined_clockout_time_early_leave_enabled,
        defined_clockin_adjustment_enabled: this.default_attendance_setting.defined_clockin_adjustment_enabled,
        defined_clockout_adjustment_enabled: this.default_attendance_setting.defined_clockout_adjustment_enabled,
        defined_break_time_mins: this.default_attendance_setting.defined_break_time_mins,
        defined_overtime_enabled: this.default_attendance_setting.defined_overtime_enabled,
        defined_overtime_time_hour: this.value_overtimeStartTime.getHours(),
        defined_overtime_time_min: this.value_overtimeStartTime.getMinutes(),
        defined_overtime_minimum_min: this.default_attendance_setting.defined_overtime_minimum_min,
        specified_holidays: this.default_attendance_setting.specified_holidays,
        specified_non_holidays: this.default_attendance_setting.specified_non_holidays,
        video_device_group_in: this.default_attendance_setting.video_device_group_in,
        video_device_group_out: this.default_attendance_setting.video_device_group_out,
      };

      const applyRet = await this.$globalSetAttendanceSettings(
        query,
      );

      const pass = !applyRet.error;

      this.$fire({
        text: pass
          ? this.$t('Successful')
          : this.$t('OperationFailed'),
        type: pass ? 'success' : 'error',
        timer: 3000,
      });

      if (this.obj_loading) this.obj_loading.hide();
    },
  },
};
</script>
