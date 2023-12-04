<template>
  <div>
    <CCard>
      <CCardBody>
        <CCol sm="2" class="h5">{{ disp_staff }}</CCol>
        <CRow>
          <CCol sm="4">
            <!-- {{ selectedName }} -->
            <v-select v-model="selectedName" :options="finallyList" :text="'label'" :value="'value'" :filterable="true"
              :placeholder="disp_pleaseEnterName" class="font-control">
            </v-select>
          </CCol>
        </CRow>

        <div style="height: 35px"></div>

        <!-- 日期 -->
        <CCol sm="2" class="h5">{{ disp_date }}</CCol>
        <CRow>
          <CCol sm="4">
            <CInput class="mb-form-row" size="lg" type="date" :value="value_searchDate" v-model="value_searchDate"
              :invalid-feedback="disp_dateDepiction" :is-valid="handleDate"
              onfocus="this.max=new Date().toISOString().split('T')[0]" />
          </CCol>
        </CRow>
        <div style="height: 35px"></div>

      </CCardBody>
    </CCard>

    <CCol sm="2" class="h5 font-weight-bold">{{ disp_currentRecords }}</CCol>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable">

            <vxe-table-column field="userName" :title="disp_name" align="center" width="auto">
            </vxe-table-column>

            <vxe-table-column field="groupList" :title="disp_group" align="center" width="auto"></vxe-table-column>

            <vxe-table-column field="dateString" :title="disp_date" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column field="clockIn" :title="disp_clockIn" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column field="clockOut" :title="disp_clockOut" width="auto" align="center">
            </vxe-table-column>

          </vxe-table>
        </div>
      </CCardBody>
    </CCard>

    <!-- 新紀錄 -->
    <CRow>
      <!-- <CCol sm="2" class="h5 font-weight-bold">{{ disp_newRecords }}</CCol> -->
      <CCol sm="4" class="form-inline">
        <div class="form-check" style="padding-right: 40px">
          <input class="form-check-input" type="radio" name="Records" id="flexRadioDefault1" value="ClockIn"
            v-model="value_clockInRecords" />
          <label class="form-check-label h5" for="flexRadioDefault1">
            {{disp_clockIn}}</label>
        </div>
        <div class="form-check" style="padding-right: 40px">
          <input class="form-check-input" type="radio" name="Records" id="flexRadioDefault2" value="ClockOut"
            v-model="value_clockInRecords" />
          <label class="form-check-label h5" for="flexRadioDefault2">
            {{disp_clockOut}}</label>
        </div>
      </CCol>
    </CRow>

    <div style="height: 35px"></div>

    <!-- 時間 -->
    <CRow style="display: block;">
      <CCol sm="2" class="h5 font-weight-bold">{{ disp_time}}</CCol>
      <CCol sm="4" class="form-inline">
        <date-picker :lang="this.$globalDatePickerLanguage" class="w-100 gray-rounded-date-picker" type="time"
          format="HH:mm" v-model="value_clockInTime" :disabled-time="notAfterNow"></date-picker>
      </CCol>
      <!-- {{ value_clockInTime }} -->
    </CRow>

    <div style="height: 35px"></div>

    <!-- 備註 -->
    <CRow class="d-block">
      <CCol sm="2" class="h5 font-weight-bold">{{ disp_reason }}</CCol>

      <CCol sm="12" class="form-block">
        <div class="mt-2 mb-2">
          <input :class="{'is-invalid': disp_forgotClockIn.length === 0}" class="form-control col-12"
            :maxLength="maxLength" type="text" value="OtherDirections" v-model="disp_forgotClockIn" required />
          <p class="invalid-feedback" v-if="disp_forgotClockIn.length === 0">{{ disp_reasonReasonDepiction }}</p>
        </div>
      </CCol>
    </CRow>

    <!-- 儲存按鈕 -->
    <div class="d-flex ml-3 justify-content-end">
      <CButton class="btn btn-primary btn-w-normal mb-3" size="lg" @click="saveData()" :disabled="saveButtonStatus"
        ref="save">
        {{ disp_save }}
      </CButton>
    </div>

  </div>
</template>

<script>
import i18n from '@/i18n';

import VueSelect from 'vue-select';

const dayjs = require('dayjs');

const defaultlState = () => ({
  obj_loading: null,

  disp_save: i18n.formatter.format('Save'),
  disp_date: i18n.formatter.format('ForgetPunchDate'),
  disp_staff: i18n.formatter.format('Staff'),
  disp_name: i18n.formatter.format('PersonName'),
  disp_group: i18n.formatter.format('Group'),
  disp_clockIn: i18n.formatter.format('ClockIn'),
  disp_clockOut: i18n.formatter.format('ClockOut'),
  disp_currentRecords: i18n.formatter.format('CurrentRecords'),
  disp_time: i18n.formatter.format('Time'),
  disp_reason: i18n.formatter.format('reason'),
  disp_reasonReasonDepiction: i18n.formatter.format('ReasonDepiction'),
  disp_dateDepiction: i18n.formatter.format('DateDepiction'),
  disp_forgotClockIn: i18n.formatter.format('ForgotAttendanceRecord'),
  disp_other: i18n.formatter.format('Other'),
  disp_lessThan50words: i18n.formatter.format('lessThan50words'),
  disp_pleaseEnterName: i18n.formatter.format('PleaseEnterName'),

  flag_enableSearchButton: false,

  value_searchDate: dayjs(new Date()).format('YYYY-MM-DD'),
  value_dataItemsToShow: [],
  value_allTableItems: [],
  value_clockInRecords: 'ClockIn',
  value_clockInReason: 'ForgotClockIn',
  value_clockInTime: null,

  maxLength: 50,
  value_otherDirections: '',
  saveButtonStatus: false,

  selectedName: '',

  finallyList: [],

  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
});

export default {
  name: 'ChangeAttendanceForm',
  props: {
    onFinish: { type: Function, default: () => null },
  },
  components: {
    'v-select': VueSelect,
  },
  data() {
    return defaultlState();
  },
  watch: {
    selectedName(newValue) {
      if (this.selectedName === null) { this.value_dataItemsToShow = []; }
      this.selectedName = newValue;

      if (this.selectedName) {
        this.autoSearch();
      }
    },
    value_searchDate(newValue) {
      this.value_searchDate = newValue;
      this.autoSearch();
    },
  },
  async created() {
    const self = this;

    self.flag_enableSearchButton = true;

    self.value_clockInTime = new Date();
  },
  mounted() {
    this.formatNameList();
  },
  methods: {
    makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },

    notAfterNow(date) {
      date.setFullYear(
        this.value_searchDate.slice(0, 4),
        +this.value_searchDate.slice(5, 7) - 1,
        this.value_searchDate.slice(8, 10),
      );

      return date > new Date();
    },

    handleDate() {
      const selectDate = this.value_searchDate;
      const Today = dayjs(new Date()).format('YYYY-MM-DD');
      if (Today < selectDate) {
        this.saveButtonStatus = true;
        this.$refs.save.style.cursor = 'auto';
      } else {
        this.saveButtonStatus = false;
      }
    },
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },

    async formatNameList() {
      const self = this;
      const ret1 = await self.$globalFindPersonWithoutPhoto('', 0, 3000);
      const personLists = ret1.data.person_list;
      const handleData = personLists.map(({ id, name, uuid }) => ({ label: `${name}(${id})`, value: uuid }));

      this.finallyList = handleData;
    },

    async saveData(cb) {
      const self = this;
      const personDatas = await self.$globalFindPersonWithoutPhoto('', 0, 3000);
      const personData = personDatas.data.person_list;

      if (!this.selectedName) return;

      const selectMatch = personData.filter((item) => {
        const str = this.selectedName.label;
        const selectValue = str.substring(0, str.indexOf('('));
        return item.name === selectValue;
      });

      const token = self.$globalServerTokenInfo();

      if (selectMatch.length === 0) return;
      const parameter = selectMatch[0];

      let verifyMode;
      let verifyModeString = '';
      if (this.value_clockInRecords === 'ClockIn') {
        verifyMode = 5;
        verifyModeString = 'MANUAL_CLOCK_IN';
      } else if (this.value_clockInRecords === 'ClockOut') {
        verifyMode = 6;
        verifyModeString = 'MANUAL_CLOCK_OUT';
      }

      const searchDate = new Date(this.value_searchDate);
      const clockInTime = new Date(this.value_clockInTime);

      searchDate.setHours(clockInTime.getHours());
      searchDate.setMinutes(clockInTime.getMinutes());
      searchDate.setSeconds(clockInTime.getSeconds());
      searchDate.setSeconds(0);
      searchDate.setMilliseconds(0);

      const utcTimestamp = searchDate.getTime();

      const submitData = {
        verify_uuid: self.makeid(32),
        timestamp: utcTimestamp,
        verify_mode: verifyMode,
        verify_mode_string: verifyModeString,
        uuid: parameter.uuid,
        id: parameter.id,
        name: parameter.name,
        card_facility_code: parameter.card_facility_code,
        card_number: parameter.card_number,
        group_list: parameter.group_list,
        temperature: '',
        modifier: token.username,
        modifier_time: new Date().valueOf(),
        remark: this.disp_forgotClockIn,
      };

      try {
        await self.$globalManualClockin(submitData);

        await this.showNotificationAndGoBack(true);
        this.$router.back(-1);
      } catch (error) {
        await this.showNotificationAndGoBack(false);
        this.$router.back(-1);
      }
      if (cb) cb();
    },

    showNotificationAndGoBack(pass) {
      const self = this;
      return new Promise((resolve) => {
        self.$fire({
          text: pass
            ? i18n.formatter.format('Successful')
            : i18n.formatter.format('OperationFailed'),
          type: pass ? 'success' : 'error',
          timer: 3000,
          onClose: resolve,
        });
      });
    },

    autoSearch() {
      console.log(1, this.selectedName);
      if (this.selectedName === '' || this.selectedName === null) return;

      const startTime = new Date(`${this.value_searchDate} 00:00:00`).getTime();
      const endTime = new Date(`${this.value_searchDate} 23:59:59`).getTime();

      const data = {
        uuid_list: this.selectedName.value ? [this.selectedName.value] : [],
        start_time: startTime,
        end_time: endTime,
        slice_shift: 0,
        slice_length: 1000,
      };

      this.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length);
    },

    async queryPersonResult(uuidList, startTime, endTime, sliceShift, sliceLength) {
      const self = this;

      self.value_dataItemsToShow = [];
      self.value_allTableItems = [];

      let ret = await self.$globalManualClockinResult(uuidList, startTime, endTime, sliceShift, sliceLength);
      if (ret) {
        if (ret.data) {
          if (ret.data.data) {
            if (ret.data.data.length >= 1) {
              self.value_allTableItems = self.value_allTableItems.concat(ret.data.data);
            }
          }
        }
      }

      const query = {
        start_time: startTime,
        end_time: endTime,
        slice_length: sliceLength,
        slice_shift: sliceShift,
        uuid_list: uuidList,
        with_image: false,
      };
      ret = await self.$globalGetPersonResult(query);
      if (ret) {
        if (ret.data) {
          if (ret.data.result) {
            if (ret.data.result.data) {
              if (ret.data.result.data.length >= 1) {
                self.value_allTableItems = self.value_allTableItems.concat(ret.data.result.data);
              }
            }
          }
        }
      }

      self.value_dataItemsToShow = this.processFields(self.value_allTableItems);
    },

    processFields(sourceData) {
      const modifyFieldsData = [];
      for (let i = 0; i < sourceData.length; i += 1) {
        const userName = sourceData[i].name;

        let groupList = [];
        try {
          if (!Array.isArray(sourceData[i].group_list)) {
            groupList = JSON.parse(sourceData[i].group_list);
          }
        } catch (ex) {
          groupList = [];
        }
        groupList = groupList.join('\n');

        const timestamp = new Date(sourceData[i].timestamp);
        const formattedDateTime = timestamp.toLocaleString();
        const [dateString, timeString] = formattedDateTime.split(' ');

        const modifierDT = sourceData[i].modifier_time;

        let clockIn;
        let clockOut;
        const modeString = sourceData[i].verify_mode_string;

        switch (modeString) {
          case 'CLOCK_OUT_MODE':
          case 'MANUAL_CLOCK_OUT':
            clockIn = '';
            clockOut = timeString;
            break;
          case 'CLOCK_IN_MODE':
          case 'PASS_MODE':
          case 'CARD_MODE':
          case 'MANUAL_CLOCK_IN':
          default:
            clockIn = timeString;
            clockOut = '';
            break;
        }

        modifyFieldsData.push(
          {
            userName,
            groupList,
            dateString,
            clockIn,
            clockOut,
            modifierTime: modifierDT,
          },
        );
      }

      const arr = [];

      const clockInArr = modifyFieldsData.filter((item) => item.clockIn !== '');
      const clockOutArr = modifyFieldsData.filter((item) => item.clockOut !== '');

      const inArr = this.findLatestModifiedTime(clockInArr);
      const outArr = this.findLatestModifiedTime(clockOutArr);

      const inTime = clockInArr.length > 0 ? inArr[0].clockIn : '';
      const outTime = clockOutArr.length > 0 ? outArr[0].clockOut : '';

      const newData = { ...modifyFieldsData[0] };

      newData.clockIn = inTime;
      newData.clockOut = outTime;

      arr.push(newData);
      return arr;
    },

    findLatestModifiedTime(arr) {
      const result = [];
      let firstItem = arr[0];

      for (let i = 1; i < arr.length; i += 1) {
        if (arr[i].modifierTime > firstItem.modifierTime) {
          firstItem = arr[i];
        }
      }

      result.push(firstItem);
      return result;
    },

  },
};
</script>

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>
