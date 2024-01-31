<template>
  <div>
    <CRow class="flex align-items-start">
      <CButton
        class="mx-3 btn btn-outline-primary btn-w-normal"
        size="lg"
        @click="changeAttendance()"
      >
        {{ $t('CorrectAttendance') }}
      </CButton>
      <div class="h1 border-left pl-3">
        {{ $t('ChangeLogsTitle') }}
      </div>
    </CRow>

    <div style="height: 20px" />

    <CCard>
      <CCardBody>
        <CRow>
          <CCol
            sm="2"
            class="h5"
          >
            {{ $t('ChangeLogsTimeRange') }}
          </CCol>
          <CCol sm="4">
            <date-picker
              style="width: 100%"
              :lang="this.$globalDatePickerLanguage"
              v-model="value_searchDatetimeRange"
              type="datetime"
              range
              :placeholder="$t('ChangeLogsTimeRange')"
              @change="datePickerDataChange()"
            />
          </CCol>
          <CCol
            sm="2"
            class="h5"
          >
            {{ $t('ChangeLogsTargetPerson') }}
          </CCol>
          <CCol sm="4">
            <CInput
              size="lg"
              v-model="value_keyword"
              style="width: 100%"
            />
          </CCol>
        </CRow>
        <Col class="d-md-flex justify-content-md-end">
          <CButton
            class="btn btn-outline-primary btn-w-normal mb-3"
            size="lg"
            :disabled="!flag_enableSearchButton"
            @click="clickOnSearch()"
          >
            {{ $t('Search') }}
          </CButton>
        </Col>
      </CCardBody>
    </CCard>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div id="ChangeAttendanceClockIn">
          <vxe-table
            :data="value_dataItemsToShow"
            stripe
            align="center"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            ref="mainTable"
            :auto-resize="true"
            keep-source
            highlight-current-row
          >
            <vxe-table-column
              :show-overflow="ellipsisMode"
              field="verify_mode_string"
              :title="$t('ChangeLogsType')"
              align="center"
              width="auto"
            />

            <vxe-table-column
              :show-overflow="ellipsisMode"
              field="name"
              :title="$t('ChangeLogsTargetPerson')"
              align="center"
              width="auto"
            />

            <vxe-table-column
              :show-overflow="ellipsisMode"
              field="timestamp"
              :title="$t('ChangeLogsNewTime')"
              width="auto"
              align="center"
            />

            <vxe-table-column
              :show-overflow="ellipsisMode"
              field="remark"
              :title="$t('ChangeLogsReason')"
              width="auto"
              align="center"
            />

            <vxe-table-column
              :show-overflow="ellipsisMode"
              field="modifier"
              :title="$t('ChangeLogsModifier')"
              width="auto"
              align="center"
            />
          </vxe-table>
        </div>

        <vxe-pager
          :layouts="[
            'PrevJump',
            'PrevPage',
            'Number',
            'NextPage',
            'NextJump',
            'FullJump',
            'Total',
          ]"
          :current-page="value_tablePage.currentPage"
          :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult"
          @page-change="handlePageChange"
        />
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

export default {
  name: 'ChangeAttendanceClockIn',
  components: {
  },
  data() {
    return {
      sortDate: [],
      obj_loading: null,

      value_dataItemsToShow: [],
      value_allTableItems: [],

      value_searchDatetimeRange: [],
      value_keyword: '',
      flag_enableSearchButton: false,

      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 1,
      },

    };
  },
  mixins: [TableObserver],
  created() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const startTime = new Date();
    startTime.setDate(endTime.getDate() - 6);
    startTime.setHours(0, 0, 0, 0);

    this.value_searchDatetimeRange[0] = startTime;
    this.value_searchDatetimeRange[1] = endTime;

    this.flag_enableSearchButton = true;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mounted() {
    // this.clickOnSearch();
  },
  methods: {
    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
      this.resizeOneTable();
    },

    // 取得個人uuid
    async getPersonDetail() {
      const personDatas = await this.$globalFindPersonWithoutPhoto('', 0, 3000);

      let ret = '';
      if (personDatas) {
        const personData = personDatas.data.person_list;
        const selectMatch = personData.filter((item) => item.name === this.value_keyword);
        if (selectMatch && selectMatch.length > 0) ret = selectMatch[0].uuid;
      }

      return ret;
    },

    async clickOnSearch() {
      const startTime = this.value_searchDatetimeRange[0].getTime();
      const endTime = this.value_searchDatetimeRange[1].getTime();
      const uuid = await this.getPersonDetail();

      const data = {
        uuid_list: uuid !== '' ? [uuid] : [],
        start_time: startTime,
        end_time: endTime,
        slice_shift: 0,
        slice_length: 1000,
      };

      const personResult = (await this.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length));
      this.sortDate = this.sortDateSourceData(personResult);
      this.value_allTableItems = this.processFields(this.sortDate);
      this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
    },

    async queryPersonResult(uuidList, startTime, endTime, sliceShift, sliceLength) {
      let personResult = [];
      let ret = [];
      try {
        ret = await this.$globalManualClockinResult(uuidList, startTime, endTime, sliceShift, sliceLength);

        if (ret.data.data.length >= 1) personResult = personResult.concat(ret.data.data);
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
      const modifyFieldsData = [];

      const valueHandleFields = [
        'verify_mode_string',
        'name',
        'timestamp',
        'remark',
        'modifier',
      ];

      sourceData.forEach((item, index) => {
        let verifyModeString; // 第一個變數
        switch (item[valueHandleFields[0]]) {
          case 'CLOCK_OUT_MODE':
          case 'MANUAL_CLOCK_OUT':
            verifyModeString = this.$t('ClockOut');
            break;
          case 'CLOCK_IN_MODE':
          case 'PASS_MODE':
          case 'CARD_MODE':
          case 'MANUAL_CLOCK_IN':
          default:
            verifyModeString = this.$t('ClockIn');
            break;
        }
        this.sortDate[index][valueHandleFields[0]] = verifyModeString;

        const userName = `${item.name}\n${item.id}`;

        const { timestamp } = item;

        const date = new Date(timestamp);
        const formattedDate = Number.isNaN(date) ? timestamp : date.toLocaleString();

        const remark = item[valueHandleFields[3]] || '';

        let modifier = item.modifier ? `${item.modifier}\n` : '';
        if (item.modifier_time) modifier += new Date(item.modifier_time);

        modifyFieldsData.push({
          verify_mode_string: verifyModeString, name: userName, timestamp: formattedDate, remark, modifier,
        });
      });
      return modifyFieldsData;
    },

    generateFilteredData(sourceData) {
      sourceData.forEach((element) => {
        element.modifier.split('\n');
      });
      const filteredItems = this.value_keyword.length == 0 ? sourceData : sourceData.filter((item) => (
        item.name.toLowerCase().indexOf(this.value_keyword.toLowerCase()) > -1
      ));

      this.value_tablePage.totalResult = filteredItems.length;

      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
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
      this.flag_enableSearchButton = true;
    },
    changeAttendance() {
      this.$router.push('ChangeAttendance');
    },
  },
};
</script>
