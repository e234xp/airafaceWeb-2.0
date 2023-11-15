<template>
  <div>
    <CRow class="flex align-items-start">
        <CButton class="mx-3 btn btn-outline-primary btn-w-normal" size="lg" @click="changeAttendance()">
          {{ disp_change }}
        </CButton>
        <div class="h1 border-left pl-3">{{ disp_header }}</div>
    </CRow>

    <div style="height: 20px"></div>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="2" class="h5">{{ disp_selectDatetimeRange }}</CCol>
          <CCol sm="4">
            <date-picker style="width: 100%" :lang="this.$globalDatePickerLanguage" v-model="value_searchDatetimeRange"
              type="datetime" range :placeholder="disp_selectDatetimeRange" @change="datePickerDataChange()">
            </date-picker>
          </CCol>
          <CCol sm="2" class="h5">{{ disp_name }}</CCol>
          <CCol sm="4">
            <CInput size="lg" v-model="value_keyword" style="width: 100%" />
          </CCol>
        </CRow>
        <Col class="d-md-flex justify-content-md-end">
        <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" :disabled="!flag_enableSearchButton"
          @click="clickOnSearch()">
          {{ disp_search }}
        </CButton>
        </Col>
      </CCardBody>
    </CCard>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div id="ChangeAttendanceClockIn">
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source highlight-current-row>

            <vxe-table-column :show-overflow="ellipsisMode" field="verify_mode_string" :title="disp_subject"
              align="center" width="auto">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="name" :title="disp_name" align="center"
              width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="timestamp" :title="disp_dateTime" width="auto"
              align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="remark" :title="disp_reason" width="auto"
              align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="modifier" :title="disp_modifier" width="auto"
              align="center">
            </vxe-table-column>

          </vxe-table>
        </div>

        <vxe-pager :layouts="[
            'PrevJump',
            'PrevPage',
            'Number',
            'NextPage',
            'NextJump',
            'FullJump',
            'Total',
          ]" :current-page="value_tablePage.currentPage" :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult" @page-change="handlePageChange">
        </vxe-pager>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from '@/i18n';

import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

const defaultlState = () => ({
  obj_loading: null,

  value_dataItemsToShow: [],
  value_allTableItems: [],

  disp_header: i18n.formatter.format('ChangeLogsTitle'),
  disp_selectDatetimeRange: i18n.formatter.format('ChangeLogsTimeRange'),
  disp_name: i18n.formatter.format('ChangeLogsTargetPerson'),
  disp_search: i18n.formatter.format('Search'),
  disp_change: i18n.formatter.format('CorrectAttendance'),

  disp_subject: i18n.formatter.format('ChangeLogsType'),
  disp_dateTime: i18n.formatter.format('ChangeLogsNewTime'),
  disp_reason: i18n.formatter.format('ChangeLogsReason'),
  disp_modifier: i18n.formatter.format('ChangeLogsModifier'),

  disp_clockIn: i18n.formatter.format('ClockIn'),
  disp_clockOut: i18n.formatter.format('ClockOut'),
  dis_manually_clock_in: i18n.formatter.format('ForgotAttendanceRecord'),

  value_searchDatetimeRange: [],
  value_keyword: '',
  flag_enableSearchButton: false,

    value_tablePage: {
      currentPage: 1,
      pageSize: 10,
      totalResult: 1,
    },
  });

export default {
  name: 'ChangeAttendanceClockIn',
  components: {
  },
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);
    return cloneObject;
  },
  mixins: [TableObserver],
  created() {
    const self = this;
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const startTime = new Date();
    startTime.setDate(endTime.getDate() - 6);
    startTime.setHours(0, 0, 0, 0);

    self.value_searchDatetimeRange[0] = startTime;
    self.value_searchDatetimeRange[1] = endTime;

    self.flag_enableSearchButton = true;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mounted() {
    // this.clickOnSearch();
  },
  methods: {
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_tablePage.currentPage = currentPage;
      self.value_tablePage.pageSize = pageSize;
      self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems);
      self.resizeOneTable();
    },

      // 取得個人uuid
      async getPersonDetail() {
        const self = this;
        const personDatas = await self.$globalFindPersonWithoutPhoto('', 0, 3000);

        let ret = '';
        if (personDatas) {
          const personData = personDatas.data.person_list;
          const selectMatch = personData.filter((item) => item.name === self.value_keyword);
          if (selectMatch && selectMatch.length > 0) ret = selectMatch[0].uuid;
        }

        return ret;
      },

      async clickOnSearch() {
        const self = this;
        const startTime = self.value_searchDatetimeRange[0].getTime();
        const endTime = self.value_searchDatetimeRange[1].getTime();
        const uuid = await self.getPersonDetail();

        const data = {
          uuid_list: uuid !== '' ? [uuid] : [],
          start_time: startTime,
          end_time: endTime,
          slice_shift: 0,
          slice_length: 1000,
        };

        const personResult = (await self.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length));
        const sortDate = self.sortDateSourceData(personResult);
        self.value_allTableItems = self.processFields(sortDate);
        self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems);
      },

      async queryPersonResult(uuidList, startTime, endTime, sliceShift, sliceLength) {
        const self = this;

        let personResult = [];
        let ret = [];
        try {
          ret = await self.$globalManualClockinResult(uuidList, startTime, endTime, sliceShift, sliceLength);

          if (ret.data.data.length >= 1)
            personResult = personResult.concat(ret.data.data);
        } catch (err) {
          console.error(err);
        }

        return personResult;
      },
      sortDateSourceData(sourceData) {
        const sort = sourceData.sort((a, b) => b.modifier_time - a.modifier_time);
        return sort;
      },

      processFields(sourceData) {
        let modifyFieldsData = [];

        let value_handleFields = [
          'verify_mode_string',
          'name',
          'timestamp',
          'remark',
          'modifier'
        ]

        sourceData.forEach(item => {
          let verifyModeString;  //第一個變數
          switch(item[value_handleFields[0]] ) {
            case 'CLOCK_OUT_MODE':
            case 'MANUAL_CLOCK_OUT':
              verifyModeString = item[value_handleFields[0]] = this.disp_clockOut;
              break;
            case 'CLOCK_IN_MODE':
            case 'PASS_MODE':
            case 'CARD_MODE':
            case 'MANUAL_CLOCK_IN':
            default :
              verifyModeString = item[value_handleFields[0]] = this.disp_clockIn;
              break;
          }

          let userName = `${item.name}\n${item.id}`;

          let timestamp = item.timestamp;

          const date = new Date(timestamp);
          let formattedDate
          if (!isNaN(date)) {
            formattedDate = date.toLocaleString();
          } else {
            formattedDate = timestamp;
          }

          const remark = item[value_handleFields[3]] || '';

          let modifier = '';
          if (item['modifier'])
            modifier += (`${item['modifier']}\n`);

          if (item['modifier_time'])
            modifier += new Date(item['modifier_time']);

          modifyFieldsData.push({ verify_mode_string: verifyModeString, name: userName, timestamp: formattedDate, remark: remark, modifier: modifier })
        });
        return modifyFieldsData;
      },

      generateFilteredData(sourceData, filter) {
        const self = this;
        sourceData.forEach(element => {
          let modifyDate = element.modifier.split('\n');
        }
        );
        const filteredItems = self.value_keyword.length == 0 ? sourceData : sourceData.filter((item) => {
          return (
            item.name.toLowerCase().indexOf(self.value_keyword.toLowerCase()) > -1
          );
        });

        self.value_tablePage.totalResult = filteredItems.length;

        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
          self.value_tablePage.currentPage * self.value_tablePage.pageSize
        );
        return Object.assign([], sliceList);
      },

    // headerCellStyle(row, column, rowIndex, columnIndex) {
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    // cellStyle(row, column, rowIndex, columnIndex) {
    cellStyle() {
      return 'fontSize:18px;';
    },
    datePickerDataChange() {
      const self = this;
      self.flag_enableSearchButton = true;
    },
    changeAttendance() {
      this.$router.push('ChangeAttendance');
    },
  },
};
</script>
