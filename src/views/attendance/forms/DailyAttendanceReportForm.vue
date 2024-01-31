<template>
  <div>
    <div>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ disp_header }}
        </div>
      </CCol>
    </div>
    <div>
      <CCol sm="12">
        <CCol sm="12">
          <CRow class="flex-row-reverse">
            <CInput
              v-model.lazy="value_searchingFilter"
              style="width: 300px"
              size="lg"
              :placeholder="$t('Search')"
            >
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </CRow>
          <!-- 上方按鈕群組 -->
          <CRow class="justify-content-between buttons-group">
            <div class="d-flex buttons-group-left">
              <div v-if="showDetailData()">
                <CButton
                  class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnReturnToAll()"
                >
                  <!-- <i class="fa fa-arrow-left"></i> -->
                  <div
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                    data-coreui-toggle="tooltip"
                    title="back to all records"
                  >
                    <i class="bi bi-reply" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ $t('ReturnToAll') }}
                  </div>
                </CButton>
              </div>
              <div v-if="showAllData()">
                <CButton
                  class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnReturnToAll()"
                >
                  <div
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                    data-coreui-toggle="tooltip"
                    title="show all records"
                  >
                    <CIcon
                      size="sm"
                      name="cilPeople"
                    />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showAllPerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton
                  class="btn btn-outline-success fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowGoodRecordsPerson()"
                >
                  <div
                    data-coreui-toggle="tooltip"
                    title="show good records"
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                  >
                    <i class="bi bi-person-fill" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showGoodRecordsPerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton
                  class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowLatePerson()"
                >
                  <div
                    data-coreui-toggle="tooltip"
                    title="show late records"
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                  >
                    <i class="bi bi-alarm-fill" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showLatePerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton
                  class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowLeaveEarlyPerson()"
                >
                  <div
                    data-coreui-toggle="tooltip"
                    title="show leave early records"
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                  >
                    <i class="bi bi-clock-history" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showLeaveEarlyPerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton
                  class="btn btn-outline-secondary fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowNoRecordPerson()"
                >
                  <div
                    data-coreui-toggle="tooltip"
                    title="show people with no records"
                    class="btn-rwd-icon w-100 h-100 btn-p-md"
                  >
                    <CIcon
                      size="sm"
                      name="cilUserX"
                    />
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showNoRecordPerson }}
                  </div>
                </CButton>
              </div>
            </div>
            <!-- 右邊按鈕群組 -->
            <div class="d-flex">
              <div>
                <CButtonGroup v-if="showAllData()">
                  <CButton
                    class="btn btn-outline-primary fz-md nowrap-hidden"
                    v-for="(value, key) in [0, 1, 2]"
                    :key="key"
                    :pressed="value === value_selectedDate ? true : false"
                    @click="selectMonthType(value)"
                  >
                    {{ value_selectedDateName[value] }}
                  </CButton>
                </CButtonGroup>
              </div>
              <date-picker
                :lang="this.$globalDatePickerLanguage"
                style="visibility: hidden; width: 0px"
                type="date"
                ref="datePicker"
                @change="datePickerDatachange()"
                v-model="value_datePicked"
              />

              <!-- 匯出 -->
              <div>
                <CButton
                  class="btn btn-outline-primary fz-md ml-2 nowrap-hidden"
                  @click="value_attendanceDataListToReview == null ? flag_masterCollapse = !flag_masterCollapse : flag_detailCollapse = !flag_detailCollapse"
                >
                  {{ $t('Export') }}
                </CButton>
              </div>
            </div>
          </CRow>
        </CCol>
      </CCol>
    </div>
    <CCard
      v-if="showAllData()"
      class="mt-3"
    >
      <CCardBody>
        <div>
          <div id="dailyAttendanceReportForm">
            <vxe-table
              :data="value_dataItemsToShow"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              ref="attMainTable"
            >
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="person"
                :title="$t('Person')"
                type="html"
                width="8%"
                align="left"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="groups"
                :title="$t('Group')"
                type="html"
                width="10%"
                align="left"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockDate"
                :title="$t('Date')"
                width="6%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="working_time"
                :title="$t('WorkingTime')"
                width="10%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="over_time"
                :title="$t('Overtime')"
                width="10%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockinToShow"
                :title="$t('ClockInTime')"
                type="html"
                width="12%"
                align="left"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockoutToShow"
                :title="$t('ClockOutTime')"
                type="html"
                width="12%"
                align="left"
              />
              <vxe-table-column
                field="attendanceStatus"
                :title="$t('DailyAttendanceStatus')"
                type="html"
                min-width="300"
              />
              <vxe-table-column
                field="details"
                title=""
                width="60"
                type="html"
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
        </div>
        <div>{{ $t('WorkingHousCalculatingTip') }}</div>
      </CCardBody>
    </CCard>

    <CCard v-if="showDetailData()">
      <CCardBody>
        <div>
          <div>
            <vxe-table
              :data="value_dataItemsToShowDetailData"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
            >
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="id"
                :title="$t('PersonId')"
                width="12%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="nameToShow"
                :title="$t('PersonName')"
                width="12%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="groups"
                :title="$t('Group')"
                width="15%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockMode"
                :title="$t('ClockingMode')"
                width="12%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockTime"
                :title="$t('ClockTime')"
                width="12%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="temperature"
                v-if="$deviceProfile.supportTemperature"
                :title="$t('Temperature')"
                width="12%"
              />
              <vxe-table-column
                field="showimage"
                :title="$t('CapturedPhoto')"
                type="html"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="card_number"
                :title="$t('CardNumber')"
                width="12%"
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
            :current-page="value_tablePageForDetailData.currentPage"
            :page-size="value_tablePageForDetailData.pageSize"
            :total="value_tablePageForDetailData.totalResult"
            @page-change="handlePageChangeForDetailData"
          />
        </div>
      </CCardBody>
    </CCard>

    <CModal :show.sync="flag_masterCollapse">
      <template #header>
        <div class="alertModal_Title">
          {{ $t('ExportSetting') }}
        </div>
      </template>
      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('FileType') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :value.sync="value_fileType"
            :options="[`.txt`, `.csv`, `.xlsx`]"
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('txtSeparator') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :disabled="value_fileType == '.xlsx'"
            :value.sync="value_txtSeparator"
            :options="[
              { label: `comma (,)`, value: ',' },
              { label: `space (_)`, value: 'S' },
              { label: `tab (\\t)`, value: 'T' },
              { label: `semicolon (;)`, value: ';' },
              { label: `customize (TBD)`, value: '' },
            ]"
          />
          <CInput
            v-model="value_separator"
            v-show="value_txtSeparator ==''"
            type="text"
            size="lg"
          />
        </CCol>
      </CRow>
      <CRow v-if="false">
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('CapturedPhoto') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :value.sync="value_snapshotFileType"
            disabled
            :options="[
              { label: $t('Excluded'), value: 'Excluded' },
              { label: $t('Embedded'), value: 'Embedded' },
              { label: $t('Files'), value: 'Files' }
            ]"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('FieldName') }}
        </CCol>
        <CCol col="9">
          <ul class="list-group">
            <li
              class="list-group-item"
              v-for="(item, index) in value_masterexportFields"
              :key="index"
            >
              <input
                class="form-check-input me-1"
                type="checkbox"
                value="item"
                checked
                @change="fieldChanged('MASTER', item, $event)"
              > {{ value_masterfieldsforExport.find(
                (field) =>
                {return field.key == item}).value }}
              <CButton
                style="float:right;width: 40px; min-width:unset;"
                @click="fieldMove('MASTER', item, -1)"
              >
                <CIcon name="cil-arrow-thick-top" />
              </CButton>
              <CButton
                style="float:right;width: 40px; min-width:unset;"
                @click="fieldMove('MASTER', item, 1)"
              >
                <CIcon name="cil-arrow-thick-bottom" />
              </CButton>
            </li>

            <li
              class="list-group-item"
              v-for="(item, index) in value_masternotinExportList"
              :key="index"
            >
              <input
                class="form-check-input me-1"
                type="checkbox"
                value="item"
                @change="fieldChanged('MASTER', item, $event)"
              > {{ value_masterfieldsforExport.find(
                (field) =>
                {return
                 field.key == item}).value }}
            </li>
          </ul>
        </CCol>
      </CRow>
      <template #footer-wrapper>
        <footer class="modal-footer">
          <CButton
            class="ml-1 btn-temp"
            color="secondary"
            @click="flag_masterCollapse=false"
          >
            {{ $t('Cancel') }}
          </CButton>
          <CButton
            class="ml-1 btn-temp"
            color="primary"
            @click="clickOnExport"
            style="min-width: unset;"
          >
            {{ $t('Apply') }}
          </CButton>
        </footer>
      </template>
    </CModal>

    <CModal :show.sync="flag_detailCollapse">
      <template #header>
        <div class="alertModal_Title">
          {{ $t('ExportSetting') }}
        </div>
      </template>
      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('FileType') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :value.sync="value_fileType"
            :options="[`.txt`, `.csv`, `.xlsx`]"
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('txtSeparator') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :disabled="value_fileType == '.xlsx'"
            :value.sync="value_txtSeparator"
            :options="[
              { label: `comma (,)`, value: ',' },
              { label: `space (_)`, value: 'S' },
              { label: `tab (\\t)`, value: 'T' },
              { label: `semicolon (;)`, value: ';' },
              { label: `customize (TBD)`, value: '' },
            ]"
          />
          <CInput
            v-model="value_separator"
            v-show="value_txtSeparator ==''"
            type="text"
            size="lg"
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('CapturedPhoto') }}
        </CCol>
        <CCol col="9">
          <CSelect
            size="lg"
            :value.sync="value_snapshotFileType"
            :disabled="value_fileType !== '.xlsx'"
            :options="[
              { label: $t('Excluded'), value: 'Excluded' },
              { label: $t('Embedded'), value: 'Embedded' },
              { label: $t('Files'), value: 'Files' }
            ]"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol
          col="3"
          class="pt-2 label"
        >
          {{ $t('FieldName') }}
        </CCol>
        <CCol col="9">
          <ul class="list-group">
            <li
              class="list-group-item"
              v-for="(item, index) in value_detailexportFields"
              :key="index"
            >
              <input
                class="form-check-input me-1"
                type="checkbox"
                value="item"
                checked
                @change="fieldChanged('DETAIL', item, $event)"
              > {{ value_detailfieldsforExport.find(
                (field) =>
                {return field.key == item}).value }}
              <CButton
                style="float:right;width: 40px; min-width:unset;"
                @click="fieldMove('DETAIL', item, -1)"
              >
                <CIcon name="cil-arrow-thick-top" />
              </CButton>
              <CButton
                style="float:right;width: 40px; min-width:unset;"
                @click="fieldMove('DETAIL', item, 1)"
              >
                <CIcon name="cil-arrow-thick-bottom" />
              </CButton>
            </li>

            <li
              class="list-group-item"
              v-for="(item, index) in value_detailnotinExportList"
              :key="index"
            >
              <input
                class="form-check-input me-1"
                type="checkbox"
                value="item"
                @change="fieldChanged('DETAIL', item, $event)"
              > {{ value_detailfieldsforExport.find(
                (field) =>
                {return
                 field.key == item}).value }}
            </li>
          </ul>
        </CCol>
      </CRow>
      <template #footer-wrapper>
        <footer class="modal-footer">
          <CButton
            class="ml-1 btn-temp"
            color="secondary"
            @click="flag_detailCollapse=false"
          >
            {{ $t('Cancel') }}
          </CButton>
          <CButton
            class="ml-1 btn-temp"
            color="primary"
            @click="clickOnExport"
            style="min-width: unset;"
          >
            {{ $t('Apply') }}
          </CButton>
        </footer>
      </template>
    </CModal>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';
import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';

import JsZip from 'jszip';

const dayjs = require('dayjs');

export default {
  name: 'DailyAttendanceReportForm',
  props: {
    formData: Object,
    onFetchPersonDataCallback: Function,
    onFetchPersonAttendanceDataCallback: Function,
  },
  data() {
    return {
      obj_loading: null,

      flag_downloadingExecl: false,
      flag_masterCollapse: false,
      flag_detailCollapse: false,
      excelExecutionAmounts: 0,
      excelCounter: 0,
      exportNo: 0,

      value_emptyPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAA'
    + 'QAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      value_tablePageForDetailData: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      value_searchingFilter: '',

      disp_header: 'none',

      value_fileType: '.xlsx',
      value_txtSeparator: ',',
      value_separator: '',
      value_snapshotFileType: 'Excluded',

      value_masterfieldsforExport: [
        { key: 'id', value: this.$t('PersonId') },
        { key: 'name', value: this.$t('PersonName') },
        { key: 'group_list', value: this.$t('Group') },
        { key: 'timestamp', value: this.$t('Date') },
        { key: 'workingTime', value: this.$t('WorkingTime') },
        { key: 'overTime', value: this.$t('Overtime') },
        { key: 'clockinTime', value: this.$t('ClockInTime') },
        // { key: 'clockinTemperature', value: this.$t('Temperature') },
        { key: 'clockoutTime', value: this.$t('ClockOutTime') },
        // { key: 'clockoutTemperature', value: this.$t('Temperature') }
      ],

      value_masterexportFields: [
        'id',
        'name',
        'group_list',
        'timestamp',
        'workingTime',
        'overTime',
        'clockinTime',
        // 'clockinTemperature',
        'clockoutTime',
        // 'clockoutTemperature'
      ],

      value_masternotinExportList: [

      ],

      value_detailfieldsforExport: [
        { key: 'id', value: this.$t('PersonId') },
        { key: 'name', value: this.$t('PersonName') },
        { key: 'group_list', value: this.$t('Group') },
        { key: 'mode', value: this.$t('ClockingMode') },
        { key: 'clockTime', value: this.$t('ClockTime') },
        // { key: 'temperature', value: this.$t('Temperature') },
        { key: 'face_image', value: this.$t('CapturedPhoto') },
        { key: 'cardno', value: this.$t('CardNumber') },
      ],

      value_detailexportFields: [
        'id',
        'name',
        'group_list',
        'mode',
        'clockTime',
        // 'temperature',
        'face_image',
        'cardno',
      ],

      value_detailnotinExportList: [

      ],

      // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show // e74d7c
      value_attendanceStatusColor: [
        '#fff',
        '#57bd37',
        '#57bd37',
        '#ee7447',
        '#ee7447',
        '#d8cde3',
      ],

      value_specifiedDate: new Date(),
      value_attendanceDataListToReview: null,
      value_dataItemsToShowDetailData: [],
      value_selectedDate: 0,
      value_selectedDateNameType2: this.$t('Select'),
      value_selectedDateName: [
        this.$t('Today'),
        this.$t('Yesterday'),
        this.$t('Select'),
      ],
      value_datePicked: null,
      value_showAllPerson: `${this.$t('AllPerson')}: 0`,
      value_showLatePerson: `${this.$t('LatePerson')}: 0`,
      value_showLeaveEarlyPerson: `${this.$t('LeaveEarly')}: 0`,
      value_showNoRecordPerson: `${this.$t('NoRecord')}: 0`,
      value_showGoodRecordsPerson: `${this.$t('GoodRecords')}: 0`,
      value_workingHourSettings: {
        definedClockinTimeHour: 9,
        definedClockinTimeMin: 0,
        definedClockinTimeLateEnabled: true, //
        definedClockinTimeBufferMins: 15,
        definedClockinAdjustmentEnabled: true, //
        definedClockoutTimeHour: 18,
        definedClockoutTimeMin: 0,
        definedClockoutTimeEarlyLeaveEnabled: true, //
        definedClockoutTimeBufferMins: 15,
        definedClockoutAdjustmentEnabled: true, //
        definedOvertimeEnabled: true, //
        definedOvertimeTimeHour: 18, //
        definedOvertimeTimeMin: 30, //
        definedOvertimeMinimumMin: 30, //
        definedBreakTimeMins: 60, //
        specifiedHolidays: [{ date_time: 0 }],
        specifiedNonHolidays: [{ date_time: 0 }],
      },

      ...this.formData,
    };
  },
  created() { },
  mixins: [TableObserver],
  mounted() {
    this.$globalGetAttendanceSettings((err, data) => {
      if (!err) {
        this.value_workingHourSettings = data;
      }

      if (this.value_workingHourSettings == null) {
        this.value_workingHourSettings = {
          definedClockinTimeHour: 9,
          definedClockinTimeMin: 0,
          definedClockinTimeLateEnabled: true,
          definedClockinTimeBufferMins: 15,
          definedClockinAdjustmentEnabled: false,
          definedClockoutTimeHour: 18,
          definedClockoutTimeMin: 0,
          definedClockoutTimeEarlyLeaveEnabled: true,
          definedClockoutTimeBufferMins: 15,
          definedClockoutAdjustmentEnabled: false,
          definedOvertimeEnabled: true,
          definedOvertimeTimeHour: 19,
          definedOvertimeTimeMin: 0,
          definedOvertimeMinimumMin: 0,
          definedBreakTimeMins: 60,
          specifiedHolidays: [{ date_time: 0 }],
          specifiedNonHolidays: [{ date_time: 0 }],
        };
      }
      this.refreshTableItems();
    });

    // this.initToggles();

    if (this.$deviceProfile.supportTemperature) {
      this.value_masterfieldsforExport.push({ key: 'clockinTemperature', value: this.$t('ClockinTemperature') });
      this.value_masterfieldsforExport.push({ key: 'clockoutTemperature', value: this.$t('ClockoutTemperature') });
      this.value_masterexportFields.push('clockinTemperature');
      this.value_masterexportFields.push('clockoutTemperature');

      this.value_detailfieldsforExport.push({ key: 'temperature', value: this.$t('Temperature') });
      this.value_detailexportFields.push('temperature');
    }
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },

  updated() {
    if (this.showAllData()) {
      this.value_dataItemsToShow.forEach((item) => {
        const btn = document.getElementById(`actionOnDetails_${item.uuid}`);

        if (btn) {
          btn.addEventListener('click', () => {
            this.clickOnDetails(item);
          });
        }
      });
    }
  },

  watch: {
    value_searchingFilter() {
      this.value_tablePage.currentPage = 1;
      this.value_tablePageForDetailData.currentPage = 1;
      if (this.showAllData()) {
        this.value_dataItemsToShow = this.generateFilteredData(
          this.value_allTableItems, this.value_searchingFilter,
        );
      } else {
        this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
          this.value_attendanceDataListToReview, this.value_searchingFilter,
        );
      }
    },
  },
  methods: {
    datePickerDatachange() {
      this.value_specifiedDate = this.value_datePicked;
      this.value_selectedDateName[2] = dayjs(this.value_specifiedDate).format('YYYY-MM-DD');
      this.refreshTableItems();
    },
    selectMonthType(type) {
      this.value_selectedDate = type;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      switch (type) {
        case 0:
          this.value_specifiedDate = today;
          this.value_selectedDateName[2] = this.value_selectedDateNameType2;

          this.refreshTableItems();
          break;
        case 1:
          this.value_specifiedDate = yesterday;
          this.value_selectedDateName[2] = this.value_selectedDateNameType2;

          this.refreshTableItems();
          break;
        case 2:
          this.$refs.datePicker.openPopup();
          break;
        default: break;
      }
    },
    fieldChanged(mode, item, evt) {
      if ((evt.target.checked) && (mode === 'MASTER')) {
        const idx1 = this.value_masterexportFields.indexOf(item);
        const idx2 = this.value_masternotinExportList.indexOf(item);

        if (idx1 < 0) {
          this.value_masterexportFields.push(item);
        }

        if (idx2 >= 0) {
          this.value_masternotinExportList.splice(idx2, 1);
        }

        if (this.value_masterexportFields.length >= 1) {
          const popped = this.value_masterexportFields.pop();
          this.value_masterexportFields.push(popped);
        }

        if (this.value_masternotinExportList.length >= 1) {
          const popped = this.value_masternotinExportList.pop();
          this.value_masternotinExportList.push(popped);
        }
      } else if ((evt.target.checked) && (mode === 'DETAIL')) {
        const idx1 = this.value_detailexportFields.indexOf(item);
        const idx2 = this.value_detailnotinExportList.indexOf(item);

        if (idx1 < 0) {
          this.value_detailexportFields.push(item);
        }

        if (idx2 >= 0) {
          this.value_detailnotinExportList.splice(idx2, 1);
        }

        if (this.value_detailexportFields.length >= 1) {
          const popped = this.value_detailexportFields.pop();
          this.value_detailexportFields.push(popped);
        }

        if (this.value_detailnotinExportList.length >= 1) {
          const popped = this.value_detailnotinExportList.pop();
          this.value_detailnotinExportList.push(popped);
        }
      } else if ((!evt.target.checked) && (mode === 'MASTER')) {
        const idx1 = this.value_masterexportFields.indexOf(item);
        const idx2 = this.value_masternotinExportList.indexOf(item);

        if (idx2 < 0) {
          this.value_masternotinExportList.push(item);
        }

        if (idx1 >= 0) {
          this.value_masterexportFields.splice(idx1, 1);
        }

        if (this.value_masterexportFields.length >= 1) {
          const popped = this.value_masterexportFields.pop();
          this.value_masterexportFields.push(popped);
        }

        if (this.value_masternotinExportList.length >= 1) {
          const popped = this.value_masternotinExportList.pop();
          this.value_masternotinExportList.push(popped);
        }
      } else if ((!evt.target.checked) && (mode === 'DETAIL')) {
        const idx1 = this.value_detailexportFields.indexOf(item);
        const idx2 = this.value_detailnotinExportList.indexOf(item);

        if (idx2 < 0) {
          this.value_detailnotinExportList.push(item);
        }

        if (idx1 >= 0) {
          this.value_detailexportFields.splice(idx1, 1);
        }

        if (this.value_detailexportFields.length >= 1) {
          const popped = this.value_detailexportFields.pop();
          this.value_detailexportFields.push(popped);
        }

        if (this.value_detailnotinExportList.length >= 1) {
          const popped = this.value_detailnotinExportList.pop();
          this.value_detailnotinExportList.push(popped);
        }
      }
    },

    fieldMove(mode, item, step) {
      if (mode === 'MASTER') {
        const idx = this.value_masterexportFields.indexOf(item);

        if ((step === -1) && (idx === 0)) return;
        if ((step === 1) && (idx === this.value_masterexportFields.length - 1)) return;

        const temp = this.value_masterexportFields[idx];
        this.value_masterexportFields[idx] = this.value_masterexportFields[idx + step];
        this.value_masterexportFields[idx + step] = temp;

        if (this.value_masterexportFields.length >= 1) {
          const popped = this.value_masterexportFields.pop();
          this.value_masterexportFields.push(popped);
        }
      } else if (mode === 'DETAIL') {
        const idx = this.value_detailexportFields.indexOf(item);

        if ((step === -1) && (idx === 0)) return;
        if ((step === 1) && (idx === this.value_detailexportFields.length - 1)) return;

        const temp = this.value_detailexportFields[idx];
        this.value_detailexportFields[idx] = this.value_detailexportFields[idx + step];
        this.value_detailexportFields[idx + step] = temp;

        if (this.value_detailexportFields.length >= 1) {
          const popped = this.value_detailexportFields.pop();
          this.value_detailexportFields.push(popped);
        }
      }
    },

    showAllData() {
      return this.value_attendanceDataListToReview === null;
    },
    showDetailData() {
      return this.value_attendanceDataListToReview != null;
    },
    clickOnReturnToAll() {
      this.value_searchingFilter = '';
      this.value_attendanceDataListToReview = null;
      this.value_dataItemsToShowDetailData = [];
      this.value_tablePage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems, this.value_searchingFilter);
      setTimeout(() => {
        this.observeTableSize();
      }, 500);
    },
    clickOnShowLatePerson() {
      this.value_searchingFilter = '';
      this.value_tablePage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (this.value_allTableItems.length > 0) {
        const ss = this.value_allTableItems.filter((a) => a.late > 0);
        this.value_dataItemsToShow = this.generateFilteredData(ss, this.value_searchingFilter);
      }
    },
    clickOnShowLeaveEarlyPerson() {
      this.value_searchingFilter = '';
      this.value_tablePage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (this.value_allTableItems.length > 0) {
        const ss = this.value_allTableItems.filter((a) => a.early > 0);
        this.value_dataItemsToShow = this.generateFilteredData(ss, this.value_searchingFilter);
      }
    },
    clickOnShowNoRecordPerson() {
      this.value_searchingFilter = '';
      this.value_tablePage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (this.value_allTableItems.length > 0) {
        const ss = this.value_allTableItems.filter((a) => a.no_record > 0);
        this.value_dataItemsToShow = this.generateFilteredData(ss, this.value_searchingFilter);
      }
    },
    clickOnShowGoodRecordsPerson() {
      this.value_searchingFilter = '';
      this.value_tablePage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (this.value_allTableItems.length > 0) {
        const ss = this.value_allTableItems.filter((a) => a.late === 0 && a.early === 0 && a.no_record === 0);
        this.value_dataItemsToShow = this.generateFilteredData(ss, this.value_searchingFilter);
      }
    },
    clickOnDetails(item) {
      this.value_searchingFilter = '';
      this.value_tablePageForDetailData = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (item.attendance_data_list && item.attendance_data_list.length > 0) {
        this.value_attendanceDataListToReview = item.attendance_data_list;
        this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
          this.value_attendanceDataListToReview,
          this.value_searchingFilter,
        );
      }
    },
    async clickOnExport() {
      this.flag_downloadingExecl = true;

      if (this.showDetailData()) {
        this.clickOnExportDetail();
        return;
      }

      switch (this.value_fileType) {
        case '.txt': this.exportMasterToTXTCSV(); break;
        case '.csv': this.exportMasterToTXTCSV(); break;
        case '.xlsx':
        default:
          this.exportMaterToExcel(); break;
      }

      this.flag_downloadingExecl = false;
    },

    exportMaterToExcel() {
      const zip = new JsZip();

      // const snapshotFolder = zip.folder('snapshot');

      const workbook = new Excel.Workbook();
      let worksheet = null;

      this.exportNo = 0;
      this.excelCounter = 0;

      if (this.value_attendanceDataListToReview == null) {
        worksheet = workbook.addWorksheet(dayjs(this.value_specifiedDate).format('MM-DD'));

        const columns = [{ header: 'No', key: 'No', width: 10 }];

        for (let i = 0; i < this.value_masterexportFields.length; i += 1) {
          switch (this.value_masterexportFields[i]) {
            case 'id': columns.push({ header: this.$t('PersonId'), key: 'id', width: 10 }); break;
            case 'name': columns.push({ header: this.$t('PersonName'), key: 'nameToShow', width: 10 }); break;
            case 'group_list': columns.push({ header: this.$t('Group'), key: 'groups', width: 10 }); break;
            case 'timestamp': columns.push({ header: this.$t('Date'), key: 'clockDate', width: 10 }); break;
            case 'workingTime': columns.push({ header: this.$t('WorkingTime'), key: 'working_time', width: 10 }); break;
            case 'overTime': columns.push({ header: this.$t('Overtime'), key: 'over_time', width: 10 }); break;
            case 'clockinTime': columns.push({ header: this.$t('ClockTime'), key: 'clockin', width: 10 }); break;
            case 'clockinTemperature': columns.push({ header: this.$t('Temperature'), key: 'clockin_temperature', width: 10 }); break;
            case 'clockoutTime': columns.push({ header: this.$t('ClockOutTime'), key: 'clockout', width: 10 }); break;
            case 'clockoutTemperature': columns.push({ header: this.$t('Temperature'), key: 'clockout_temperature', width: 10 }); break;
            default: break;
          }
        }

        worksheet.columns = columns;
        this.excelExecutionAmounts = this.value_allTableItems.length;

        const d = this.value_specifiedDate.getDate() - 1;
        for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
          this.exportNo += 1;
          this.excelCounter += 1;

          const item = this.value_allTableItems[idx];

          {
            item.nameToShow = item.name;

            item.clockin = '';
            item.clockin_temperature = '';
            item.clockout = '';
            item.clockout_temperature = '';

            // if (item.attendance_data_list && item.attendance_data_list.length >= 1) {
            //   let inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 3);

            //   if (inRecord.length === 0) {
            //     inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
            //   }

            //   console.log(inRecord);
            //   if (inRecord.length >= 1) {
            //     item.clockin = dayjs(new Date(item.attendance_data_list[0].timestamp)).format('HH:mm:ss');
            //     item.clockin_temperature = item.attendance_data_list[0].temperature;
            //   }

            //   let outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 4);
            //   if ((outRecord.length === 0) && (item.attendance_data_list.length >= 2)) {
            //     outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
            //   }

            //   if (outRecord.length >= 1) {
            //     item.clockout = dayjs(
            //       new Date(item.attendance_data_list[item.attendance_data_list.length - 1].timestamp),
            //     ).format('HH:mm:ss');

            //     item.clockout_temperature = item.attendance_data_list[item.attendance_data_list.length - 1].temperature;
            //   }
            // }

            if (item.attendanceStatusData.attendance_data.firstClockInRec) {
              item.clockin = item.attendanceStatusData.attendance_data.firstClockInRec.timestamp
                ? dayjs(new Date(item.attendanceStatusData.attendance_data.firstClockInRec.timestamp)).format('HH:mm:ss')
                : '';

              item.clockin_temperature = item.attendanceStatusData.attendance_data.firstClockInRec.temperature
                ? item.attendanceStatusData.attendance_data.firstClockInRec.temperature
                : '';
            }

            if (item.attendanceStatusData.attendance_data.lastClockOutRec) {
              item.clockout = item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp
                ? dayjs(new Date(item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp)).format('HH:mm:ss')
                : '';

              item.clockout_temperature = item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
                ? item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
                : '';
            }

            const attendanceStatusData = this.generateAttendanceStatusData_V2(this.value_workingHourSettings, item);

            item.working_time = this.formatDurationTime(attendanceStatusData.attendance_data.working_time[d]);
            item.over_time = this.formatDurationTime(attendanceStatusData.attendance_data.over_time[d]);

            try {
              if (Array.isArray(item.group_list)) {
                item.groups = (item.group_list || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
              } else {
                item.groups = (JSON.parse(item.group_list) || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
              }
            } catch (ex) {
              item.groups = '';
            }
          }

          worksheet.addRow({
            No: this.exportNo,
            id: item.id,
            nameToShow: item.nameToShow,
            groups: item.groups,
            clockDate: dayjs(this.value_specifiedDate).format('MM/DD'),
            working_time: item.working_time,
            over_time: item.over_time,
            clockin: item.clockin,
            clockin_temperature: item.clockin_temperature,
            clockout: item.clockout,
            clockout_temperature: item.clockout_temperature,
          });
        }

        if (workbook != null) {
          workbook.xlsx.writeBuffer().then((data) => {
            const filename = `Daily_Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}.xlsx`;

            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            zip.file(filename, blob);

            zip.generateAsync({ type: 'blob' }).then((content) => {
              FileSaver.saveAs(content, `Daily_Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}.zip`);
            });
          });
        }
      }
    },

    exportMasterToTXTCSV() {
      const zip = new JsZip();

      let separator = this.value_txtSeparator === '' ? this.value_separator : this.value_txtSeparator;
      if (separator === 'S') separator = ' ';
      if (separator === 'T') separator = '\t';

      const columns = this.value_detailexportFields.unshift('No');
      separator = `"${separator}"`;
      let data = `"${columns.join(separator)}"`;

      // let data = `"No"${separator}"${this.value_detailexportFields.join('\"' + separator + '\"')}"\r\n`;

      this.exportNo = 0;

      const d = this.value_specifiedDate.getDate() - 1;
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        this.exportNo += 1;
        const item = this.value_allTableItems[idx];

        {
          item.nameToShow = item.name;

          item.clockin = '';
          item.clockin_temperature = '';
          item.clockout = '';
          item.clockout_temperature = '';

          // if (item.attendance_data_list && item.attendance_data_list.length >= 1) {
          //   let inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 3);
          //   if (inRecord.length === 0) {
          //     inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
          //   }

          //   if (inRecord.length >= 1) {
          //     item.clockin = dayjs(new Date(item.attendance_data_list[0].timestamp)).format('HH:mm:ss');
          //     item.clockin_temperature = item.attendance_data_list[0].temperature;
          //   }

          //   let outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 4);
          //   if ((outRecord.length === 0) && (item.attendance_data_list.length >= 2)) {
          //     outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
          //   }

          //   if (outRecord.length >= 1) {
          //     item.clockout = dayjs(new Date(
          //       item.attendance_data_list[item.attendance_data_list.length - 1].timestamp,
          //     )).format('HH:mm:ss');
          //     item.clockout_temperature = item.attendance_data_list[item.attendance_data_list.length - 1].temperature;
          //   }
          // }

          if (item.attendanceStatusData.attendance_data.firstClockInRec) {
            item.clockin = item.attendanceStatusData.attendance_data.firstClockInRec.timestamp
              ? dayjs(new Date(item.attendanceStatusData.attendance_data.firstClockInRec.timestamp)).format('HH:mm:ss')
              : '';

            item.clockin_temperature = item.attendanceStatusData.attendance_data.firstClockInRec.temperature
              ? item.attendanceStatusData.attendance_data.firstClockInRec.temperature
              : '';
          }

          if (item.attendanceStatusData.attendance_data.lastClockOutRec) {
            item.clockout = item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp
              ? dayjs(new Date(item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp)).format('HH:mm:ss')
              : '';

            item.clockout_temperature = item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
              ? item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
              : '';
          }

          item.late = 0;
          item.early = 0;
          item.no_record = 0;

          const attendanceStatusData = this.generateAttendanceStatusData_V2(this.value_workingHourSettings, item);

          item.working_time = this.formatDurationTime(attendanceStatusData.attendance_data.working_time[d]);
          item.over_time = this.formatDurationTime(attendanceStatusData.attendance_data.over_time[d]);

          try {
            if (Array.isArray(item.group_list)) {
              item.groups = (item.group_list || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
            } else {
              item.groups = (JSON.parse(item.group_list) || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
            }
          } catch (ex) {
            item.groups = '';
          }
        }

        const ln = [`"${this.exportNo}"`];
        for (let i = 0; i < this.value_masterexportFields.length; i += 1) {
          switch (this.value_masterexportFields[i]) {
            case 'id': ln.push(`"${item.id}"`); break;
            case 'name': ln.push(`"${item.nameToShow}"`); break;
            case 'group_list': ln.push(`"${item.groups}"`); break;
            case 'timestamp': ln.push(`"${dayjs(this.value_specifiedDate).format('MM/DD')}"`); break;
            case 'workingTime': ln.push(`"${item.working_time}"`); break;
            case 'overTime': ln.push(`"${item.over_time}"`); break;
            case 'clockinTime': ln.push(`"${item.clockin}"`); break;
            case 'clockinTemperature': ln.push(`"${item.clockin_temperature}"`); break;
            case 'clockoutTime': ln.push(`"${item.clockout}"`); break;
            case 'clockoutTemperature': ln.push(`"${item.clockout_temperature}"`); break;
            default: break;
          }
        }
        data += `${ln.join(separator)}\r\n`;
      }

      let filename = '';
      let blob = null;

      if (this.value_fileType === '.txt') {
        filename = `Daily_Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}.txt`;
        blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      } else if (this.value_fileType === '.csv') {
        filename = `Daily_Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}.csv`;
        blob = new Blob([`\uFEFF${data}`], { type: 'text/csv;charset=utf-8' });
      }

      zip.file(filename, blob);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver.saveAs(
          content,
          `Daily_Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}.zip`,
        );
      });
    },

    clickOnExportDetail() {
      switch (this.value_fileType) {
        case '.txt': this.exportDetailToTXTCSV(); break;
        case '.csv': this.exportDetailToTXTCSV(); break;
        case '.xlsx':
        default:
          this.exportDetailToExcel(); break;
      }
    },

    async exportDetailToExcel() {
      const zip = new JsZip();

      const snapshotFolder = zip.folder('snapshot');

      const workbook = new Excel.Workbook();
      let worksheet = null;

      this.exportNo = 0;
      this.excelCounter = 0;

      // const company = '';
      // let personId = '';
      let personName = '';

      if (this.value_attendanceDataListToReview.length >= 1) {
        // personId = this.value_attendanceDataListToReview[0].id;
        personName = this.value_attendanceDataListToReview[0].name;
      }

      worksheet = workbook.addWorksheet(dayjs(this.value_specifiedDate).format('MM-DD'));

      const columns = [{ header: 'No', key: 'No', width: 10 }];

      for (let i = 0; i < this.value_detailexportFields.length; i += 1) {
        switch (this.value_detailexportFields[i]) {
          case 'id': columns.push({ header: this.$t('PersonId'), key: 'id', width: 10 }); break;
          case 'name': columns.push({ header: this.$t('PersonName'), key: 'nameToShow', width: 10 }); break;
          case 'group_list': columns.push({ header: this.$t('Group'), key: 'groups', width: 10 }); break;
          case 'mode': columns.push({ header: this.$t('ClockingMode'), key: 'clockMode', width: 10 }); break;
          case 'clockTime': columns.push({ header: this.$t('ClockTime'), key: 'clockTime', width: 10 }); break;
          case 'temperature': columns.push({ header: this.$t('Temperature'), key: 'temperature', width: 10 }); break;
          case 'face_image': columns.push({ header: this.$t('CapturedPhoto'), key: 'face_image', width: 10 }); break;
          case 'cardno': columns.push({ header: this.$t('CardNumber'), key: 'card_number', width: 10 }); break;
          default: break;
        }
      }

      worksheet.columns = columns;
      this.excelExecutionAmounts = this.value_attendanceDataListToReview.length;

      for (let idx = 0; idx < this.value_attendanceDataListToReview.length; idx += 1) {
        this.exportNo += 1;
        this.excelCounter += 1;

        {
          this.value_attendanceDataListToReview[idx].nameToShow = this.value_attendanceDataListToReview[idx].name;
          const d = new Date(this.value_attendanceDataListToReview[idx].timestamp);
          this.value_attendanceDataListToReview[idx].clockTime = dayjs(d).format('MM/DD HH:mm');

          switch (this.value_attendanceDataListToReview[idx].verify_mode) {
            case 1:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModeCard');
              break;
            case 2:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModePass');
              break;
            case 3:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModeClockIn');
              break;
            case 4:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModeClockOut');
              break;
            case 5:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModeManualClockIn');
              break;
            case 6:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('ClockModeManualClockOut');
              break;
            default:
              this.value_attendanceDataListToReview[idx].clockMode = this.$t('None');
              break;
          }

          try {
            if (Array.isArray(this.value_attendanceDataListToReview[idx].group_list)) {
              this.value_attendanceDataListToReview[idx].groups = (this.value_attendanceDataListToReview[idx].group_list || []).filter(
                (group) => !(group === 'All Person' || group === 'All Visitor'),
              ).join(', ');
            } else {
              this.value_attendanceDataListToReview[idx].groups = (JSON.parse(this.value_attendanceDataListToReview[idx].group_list) || []).filter(
                (group) => !(group === 'All Person' || group === 'All Visitor'),
              ).join(', ');
            }
          } catch (ex) {
            this.value_attendanceDataListToReview[idx].groups = '';
          }
        }

        worksheet.addRow({
          No: this.exportNo,
          id: this.value_attendanceDataListToReview[idx].id,
          nameToShow: this.value_attendanceDataListToReview[idx].nameToShow,
          card_number: this.value_attendanceDataListToReview[idx].card_number,
          groups: this.value_attendanceDataListToReview[idx].groups,
          temperature: this.value_attendanceDataListToReview[idx].temperature,
          clockMode: this.value_attendanceDataListToReview[idx].clockMode,
          clockTime: this.value_attendanceDataListToReview[idx].clockTime,
        });

        const pos = this.value_detailexportFields.indexOf('face_image');
        if (pos >= 0) {
          if (this.value_snapshotFileType === 'Embedded' || this.value_snapshotFileType === 'Files') {
            if (this.value_attendanceDataListToReview[idx].face_image_id) {
              const imageRet = await this.$globalFetchVerifyPhoto(this.value_attendanceDataListToReview[idx].face_image_id);

              if (imageRet && imageRet.data) {
                if (this.value_snapshotFileType === 'Embedded') {
                  const photoId = workbook.addImage({
                    base64: imageRet.data.face_image,
                    extension: 'jpeg',
                  });

                  worksheet.lastRow.height = 60;
                  worksheet.addImage(
                    photoId,
                    `${String.fromCharCode(66 + pos)}${worksheet.rowCount}:${String.fromCharCode(66 + pos)}${worksheet.rowCount}`,
                  );
                }

                if (this.value_snapshotFileType === 'Files') {
                  const fileTime = this.value_attendanceDataListToReview[idx].clockTime
                    .replace('/', '_')
                    .replace(' ', '_')
                    .replace(':', '_');
                  snapshotFolder.file(
                    `${this.exportNo}_${fileTime}.jpeg`,
                    imageRet.data.face_image,
                    { base64: true },
                  );
                }
              }
            }
          }
        }
      }

      if (workbook != null) {
        workbook.xlsx.writeBuffer().then((data) => {
          const filename = `Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}_${personName}.xlsx`;

          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          zip.file(filename, blob);

          zip.generateAsync({ type: 'blob' }).then((content) => {
            FileSaver.saveAs(
              content,
              `Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}_${personName}.zip`,
            );
          });
        });
      }

      this.flag_downloadingExecl = false;
    },

    exportDetailToTXTCSV() {
      const zip = new JsZip();

      let separator = this.value_txtSeparator === '' ? this.value_separator : this.value_txtSeparator;
      if (separator === 'S') separator = ' ';
      if (separator === 'T') separator = '\t';

      // const company = '';
      // let personId = '';
      let personName = '';

      if (this.value_attendanceDataListToReview.length >= 1) {
        personName = this.value_attendanceDataListToReview[0].name;
      }

      const columns = this.value_detailexportFields.unshift('No');
      separator = `"${separator}"`;
      let data = `"${columns.join(separator)}"`;

      // let data = `"No"${separator}"${this.value_detailexportFields.join('\"' + separator + '\"')}"\r\n`;

      this.exportNo = 0;

      for (let idx = 0; idx < this.value_attendanceDataListToReview.length; idx += 1) {
        this.exportNo += 1;
        const item = this.value_attendanceDataListToReview[idx];

        item.nameToShow = item.name;
        item.clockTime = dayjs(item.timestamp).format('MM/DD HH:mm');

        switch (item.verify_mode) {
          case 1:
            item.clockMode = this.$t('ClockModeCard');
            break;
          case 2:
            item.clockMode = this.$t('ClockModePass');
            break;
          case 3:
            item.clockMode = this.$t('ClockModeClockIn');
            break;
          case 4:
            item.clockMode = this.$t('ClockModeClockOut');
            break;
          case 5:
            item.clockMode = this.$t('ClockModeManualClockIn');
            break;
          case 6:
            item.clockMode = this.$t('ClockModeManualClockOut');
            break;
          default:
            item.clockMode = this.$t('None');
            break;
        }

        try {
          if (Array.isArray(item.group_list)) {
            item.groups = (item.group_list || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
          }
        } catch (ex) {
          item.groups = '';
        }

        const ln = [`"${this.exportNo}"`];
        for (let i = 0; i < this.value_detailexportFields.length; i += 1) {
          switch (this.value_detailexportFields[i]) {
            case 'id': ln.push(`"${item.id}"`); break;
            case 'name': ln.push(`"${item.nameToShow}"`); break;
            case 'group_list': ln.push(`"${item.groups}"`); break;
            case 'mode': ln.push(`"${item.clockMode}"`); break;
            case 'clockTime': ln.push(`"${item.clockTime}"`); break;
            case 'temperature': ln.push(`"${item.temperature}"`); break;
            case 'cardno': ln.push(`"${item.card_number}}"`); break;
            case 'face_image': ln.push(''); break;
            default: break;
          }
        }
        data += `${ln.join(separator)}\r\n`;
      }

      let filename = '';
      let blob = null;

      if (this.value_fileType === '.txt') {
        filename = `Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}_${personName}.txt`;
        blob = new Blob([data], {
          type: 'text/plain;charset=utf-8',
        });
      } else if (this.value_fileType === '.csv') {
        filename = `Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}_${personName}.csv`;
        blob = new Blob([`\uFEFF${data}`], { type: 'text/csv;charset=utf-8' });
      }

      zip.file(filename, blob);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver.saveAs(
          content,
          `Attendance_${dayjs(this.value_specifiedDate).format('MMDD')}_${personName}.zip`,
        );
      });
    },

    headerCellStyle() {
      return 'fontSize:18px';
    },
    cellStyle() {
      return 'padding: 0 0 0 0;fontSize:18px;';
    },
    formatBase64ToImgTag(desireWidth, desireHeight, base64ImageString) {
      let ret = '';

      if (base64ImageString.length > 0) {
        ret = `<img width='${desireWidth}' height='${desireHeight}' src='data:image/jpeg;base64,${base64ImageString}'>`;
      } else {
        ret = `<img width='${desireWidth}' height='${desireHeight}' src='${this.value_emptyPhoto}'>`;
      }

      return ret;
    },

    formatDurationTime(timestamp) {
      let ret = timestamp;

      let t = Math.floor(ret / 1000);
      const s = t - 60 * Math.floor(t / 60);
      t -= s;
      t /= 60;

      let m = 0;
      if (t > 0) {
        m = t - 60 * Math.floor(t / 60);
        t -= m;
      }

      let h = 0;
      if (t > 0) h = Math.floor(t / 60);

      if (h <= 0 && m <= 0) ret = '';
      else {
        ret = `${`00${h}`.slice(-2)}:${`00${m}`.slice(-2)}`;
      }

      return ret;
    },
    generateFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || (item.group_list && item.group_list.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1));

      this.value_tablePage.totalResult = filteredItems.length;

      const i = this.value_specifiedDate.getDate() - 1;

      filteredItems.forEach((pItem) => {
        const item = pItem;

        item.late = 0;
        item.early = 0;
        item.no_record = 0;
        item.working_time = '';
        item.over_time = '';

        item.attendanceStatusData = this.generateAttendanceStatusData_V2(this.value_workingHourSettings, item);

        item.attendanceStatus = this.generateAttendanceStatusTable(item.attendanceStatusData);
        item.working_time = this.formatDurationTime(item.attendanceStatusData.attendance_data.working_time[i]);
        item.over_time = this.formatDurationTime(item.attendanceStatusData.attendance_data.over_time[i]);
      });
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
      );
      sliceList.forEach((pItem) => {
        const item = pItem;

        const detailsButtonId = `actionOnDetails_${item.uuid}`;

        if (item.attendance_data_list && item.attendance_data_list.length > 0) {
          item.details = [
            '<div align=\'center\'>',
            `<button type='submit' class='btn btn-outline-primary btn-detail' id='${detailsButtonId}'>`,
            '<i class=\'fa fa-list\'/></button></div>',
          ].join('');
        } else {
          item.details = [
            '<div align=\'center\'></div>',
          ].join('');
        }

        item.person = `${item.name}<br>${item.id}`;

        try {
          if (Array.isArray(item.group_list)) {
            item.groups = (item.group_list || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join('<br>');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join('<br>');
          }
        } catch (ex) {
          item.groups = '';
        }

        item.clockDate = dayjs(this.value_specifiedDate).format('MM/DD');

        item.clockin = '';
        item.clockin_temperature = '';
        item.clockout = '';
        item.clockout_temperature = '';

        if (item.attendanceStatusData.attendance_data) {
          if (item.attendanceStatusData.attendance_data.firstClockInRec) {
            item.clockin = item.attendanceStatusData.attendance_data.firstClockInRec.timestamp
              ? dayjs(new Date(item.attendanceStatusData.attendance_data.firstClockInRec.timestamp)).format('HH:mm:ss')
              : '';

            item.clockin_temperature = item.attendanceStatusData.attendance_data.firstClockInRec.temperature
              ? item.attendanceStatusData.attendance_data.firstClockInRec.temperature
              : '';
          }

          if (item.attendanceStatusData.attendance_data.lastClockOutRec) {
            item.clockout = item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp
              ? dayjs(new Date(item.attendanceStatusData.attendance_data.lastClockOutRec.timestamp)).format('HH:mm:ss')
              : '';

            item.clockout_temperature = item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
              ? item.attendanceStatusData.attendance_data.lastClockOutRec.temperature
              : '';
          }
          // item.attendance_data_list.sort((a, b) => a.timestamp - b.timestamp);

          // if (item.attendance_data_list.length >= 1) {
          //   let inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 5);
          //   if (inRecord.length === 0) {
          //     inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 3);
          //   }
          //   if (inRecord.length === 0) {
          //     inRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
          //   }

          //   if (inRecord.length >= 1) {
          //     item.clockin = dayjs(new Date(item.attendance_data_list[0].timestamp)).format('HH:mm:ss');
          //     item.clockin_temperature = item.attendance_data_list[0].temperature ? item.attendance_data_list[0].temperature : '';
          //   }

          //   let outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 6);
          //   if (outRecord.length === 0) {
          //     outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 4);
          //   }
          //   if ((outRecord.length === 0) && (item.attendance_data_list.length >= 2)) {
          //     outRecord = item.attendance_data_list.filter((r) => r.verify_mode === 1 || r.verify_mode === 2);
          //   }

          //   if (outRecord.length >= 1) {
          //     item.clockout = dayjs(new Date(
          //       item.attendance_data_list[item.attendance_data_list.length - 1].timestamp,
          //     )).format('HH:mm:ss');
          //     item.clockout_temperature = item.attendance_data_list[item.attendance_data_list.length - 1].temperature
          //       ? item.attendance_data_list[item.attendance_data_list.length - 1].temperature
          //       : '';
          //   }
          // }

          // console.log(item.clockin_temperature, item.clockout_temperature);

          item.clockinToShow = `${item.clockin}<br>${item.clockin_temperature}`;
          item.clockoutToShow = `${item.clockout}<br>${item.clockout_temperature}`;
        }
      });

      this.value_showAllPerson = `${this.$t('AllPerson')}`
        + ` : ${this.value_allTableItems.length}`;

      this.value_showLatePerson = `${this.$t('LatePerson')}`
        + ` : ${this.value_allTableItems.filter((p) => p.late > 0).length}`;

      this.value_showLeaveEarlyPerson = `${this.$t('LeaveEarly')}`
        + ` : ${this.value_allTableItems.filter((p) => p.early > 0).length}`;

      this.value_showNoRecordPerson = `${this.$t('NoRecord')}`
        + ` : ${this.value_allTableItems.filter((p) => p.no_record > 0).length}`;

      this.value_showGoodRecordsPerson = `${this.$t('GoodRecords')}`
        + ` : ${this.value_allTableItems.filter((p) => p.early === 0 && p.late === 0 && p.no_record === 0).length}`;

      return Object.assign([], sliceList);
    },

    generateFilteredDataForDetailData(sourceData, filter) {
      const filteredItems = filter.length === 0
        ? sourceData : sourceData.filter(
          (item) => (item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1),
        );
      this.value_tablePageForDetailData.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePageForDetailData.currentPage - 1) * this.value_tablePageForDetailData.pageSize,
        this.value_tablePageForDetailData.currentPage * this.value_tablePageForDetailData.pageSize,
      );
      sliceList.forEach((pItem) => {
        const item = pItem;

        item.nameToShow = item.name;
        item.clockTime = dayjs(item.timestamp).format('MM/DD HH:mm');

        switch (item.verify_mode) {
          case 1:
            item.clockMode = this.$t('ClockModeCard');
            break;
          case 2:
            item.clockMode = this.$t('ClockModePass');
            break;
          case 3:
            item.clockMode = this.$t('ClockModeClockIn');
            break;
          case 4:
            item.clockMode = this.$t('ClockModeClockOut');
            break;
          case 5:
            item.clockMode = this.$t('ClockModeManualClockIn');
            break;
          case 6:
            item.clockMode = this.$t('ClockModeManualClockOut');
            break;
          default:
            item.clockMode = this.$t('None');
            break;
        }

        try {
          if (Array.isArray(item.group_list)) {
            item.groups = (item.group_list || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((group) => !(group === 'All Person' || group === 'All Visitor')).join(', ');
          }
        } catch (ex) {
          item.groups = '';
        }

        const showimageId = item.face_image_id ? item.face_image_id.f + item.face_image_id.uuid : '';

        if (showimageId.length > 0) {
          item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAA`
            + 'fFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaAD'
            + 'AAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';

          this.$globalFetchVerifyPhoto(item.face_image_id, (error, data) => {
            if (error === null && data) {
              item.imageb64 = data.face_image;

              const ele = document.getElementById(showimageId);
              if (ele) ele.src = `data:image/jpeg;base64,${data.face_image}`;
            }
          });
        } else {
          item.showimage = '<img src=\'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs'
            + '4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD'
            + '5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
          item.imageb64 = '';
        }
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      if (this.onFetchPersonDataCallback) {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.onFetchPersonDataCallback((errorOnPersonTable, resetPersonTable, morePersonItem, personTableItems) => {
          if (!errorOnPersonTable) {
            if (resetPersonTable) {
              this.value_allTableItems = [];
              this.value_dataItemsToShow = [];
            }
            if (personTableItems) {
              this.value_allTableItems = this.value_allTableItems.concat(personTableItems);
            }

            if (personTableItems.length >= 1) {
              const uuidList = [];

              personTableItems.forEach((person) => {
                uuidList.push(person.uuid);
              });

              this.onFetchPersonAttendanceDataCallback(
                this.value_specifiedDate,
                uuidList,
                (errorOnPersonVr, resetPersonVr, morePersonVr, personVrItems) => {
                  if (personVrItems && personVrItems.length > 0) {
                    this.value_allTableItems.forEach((record) => {
                      const person = record;

                      const dataListOnUuid = personVrItems.filter((vr) => vr.uuid === person.uuid);
                      dataListOnUuid.forEach((d) => {
                        if (!person.attendance_data_list) {
                          person.attendance_data_list = [];
                        }

                        if (!person.attendance_data_list.find(
                          (att) => att.verify_uuid === d.verify_uuid,
                        )) {
                          person.attendance_data_list.push({
                            id: d.id,
                            name: d.name,
                            verify_uuid: d.verify_uuid,
                            timestamp: d.timestamp,
                            temperature: (d.temperature === 0 || d.temperature === '') ? '' : `${d.temperature.toFixed(1)}°C`,
                            verify_mode: d.verify_mode,
                            verify_mode_string: d.verify_mode_string,
                            verify_score: d.verify_score,
                            card_number: d.card_number,
                            group_list: d.group_list,
                            face_image_id: d.face_image_id,
                            modifier_time: d.modifier_time,
                          });
                        }
                      });
                    });
                  }
                  if (!morePersonVr || errorOnPersonVr) {
                    this.value_dataItemsToShow = this.generateFilteredData(
                      this.value_allTableItems,
                      this.value_searchingFilter,
                    );
                    if (this.obj_loading) this.obj_loading.hide();
                    if (cb) cb();
                  }
                },
              );
            }
            if (this.obj_loading) this.obj_loading.hide();
            this.observeTableSize();
            // this.generateFilteredData(this.value_allTableItems, []);
          } else {
            if (this.obj_loading) this.obj_loading.hide();
            if (cb) cb();
          }
        });
      } else if (cb) cb();
    },
    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter,
      );
      this.resizeOneTable();
    },
    handlePageChangeForDetailData({ currentPage, pageSize }) {
      this.value_tablePageForDetailData.currentPage = currentPage;
      this.value_tablePageForDetailData.pageSize = pageSize;
      this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
        this.value_attendanceDataListToReview,
        this.value_searchingFilter,
      );
      this.resizeOneTable();
    },

    generateAttendanceStatusData_V2(workingHourSettings, pItem) {
      const item = pItem;

      // const { definedClockinTimeHour, definedClockoutTimeHour, definedOvertimeTimeHour } = workingHourSettings;
      const definedClockinTimeHour = workingHourSettings.defined_clockin_time_hour || 9;
      const definedClockoutTimeHour = workingHourSettings.defined_clockout_time_hour || 18;
      const definedOvertimeTimeHour = workingHourSettings.defined_overtime_time_hour || 18;

      const definedClockinTimeMin = workingHourSettings.defined_clockin_time_min || 0;
      const definedClockinTimeBufferMins = workingHourSettings.defined_clockin_time_buffer_mins || 30;
      const definedClockinTimeLateEnabled = workingHourSettings.defined_clockin_time_late_enabled || true;
      const definedClockinAdjustmentEnabled = workingHourSettings.defined_clockin_adjustment_enabled || false;

      const definedClockoutTimeMin = workingHourSettings.defined_clockout_time_min || 0;
      const definedClockoutTimeBufferMins = workingHourSettings.defined_clockout_time_buffer_mins || 30;
      const definedClockoutTimeEarlyLeaveEnabled = workingHourSettings.defined_clockout_time_early_leave_enabled || true;
      const definedClockoutAdjustmentEnabled = workingHourSettings.defined_clockout_adjustment_enabled || false;

      const definedOvertimeEnabled = workingHourSettings.defined_overtime_enabled || true;
      const definedOvertimeTimeMin = workingHourSettings.defined_overtime_time_min || 0;
      const definedOvertimeMinimumMin = workingHourSettings.defined_overtime_minimum_min || 0;

      const definedBreakTimeMin = workingHourSettings.defined_break_time_mins || 60;

      // const { specifiedHolidays, specifiedNonHolidays } = workingHourSettings;
      const specifiedHolidays = workingHourSettings.specified_holidays || [];
      const specifiedNonHolidays = workingHourSettings.specified_non_holidays || [];

      const attRecList = item.attendance_data_list ? item.attendance_data_list : [];

      // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6 : no entry, 7: no leave, 8: overtime
      const _STATUS_NONE = 0;
      const _STATUS_SHOW_ON_TIME = 1;
      const _STATUS_LEAVE_ON_TIME = 2;
      const _STATUS_LATE = 3;
      const _STATUS_EARLY = 4;
      const _STATUS_NO_SHOW = 5;

      const msDay = 86400000;
      const msHour = 3600000;
      const msMin = 60000;

      const clockInTime = definedClockinTimeHour * msHour + definedClockinTimeMin * msMin;
      const clockInTimeBuffer = definedClockinTimeBufferMins * msMin;
      const clockOutTime = definedClockoutTimeHour * msHour + definedClockoutTimeMin * msMin;
      const clockOutTimeBuffer = definedClockoutTimeBufferMins * msMin;

      const breakTime = definedBreakTimeMin * msMin;
      const overTime = definedOvertimeTimeHour * msHour + definedOvertimeTimeMin * msMin;
      const overTimeBuffer = definedOvertimeMinimumMin * msMin;

      const startTimeOfMonth = new Date(this.value_specifiedDate.getFullYear(), this.value_specifiedDate.getMonth(), 1, 0, 0, 0, 0);
      const endTimeOfMonth = new Date(this.value_specifiedDate.getFullYear(), this.value_specifiedDate.getMonth() + 1, 1, 0, 0, 0, 0);
      const daysOnMonth = (endTimeOfMonth - startTimeOfMonth) / msDay;

      const returnData = {
        date: {
          days: daysOnMonth,
          monthly_holiday_index: [],
        },
        attendance_data: {
          clock_in_status: [],
          clock_out_status: [],
          firstClockInRec: {},
          lastClockOutRec: {},
          working_time: [],
          over_time: [],
        },
      };
      const idxSpecifiedDateToCheck = this.value_specifiedDate.getDate() - 1;
      for (let i = 0; i < daysOnMonth; i += 1) {
        const tDayStart = new Date(startTimeOfMonth.getTime() + i * msDay);
        const tDayStartTs = tDayStart.getTime();
        const tDayEndTs = tDayStartTs + msDay - 1;
        const timeToCheckClockIn = tDayStartTs + clockInTime < Date.now();
        const timeToCheckClockOut = tDayStartTs + clockOutTime < Date.now();
        // const timeToCheckOverTime = tDayStartTs + overTime < Date.now();

        let holiday = false;
        if (specifiedHolidays) {
          for (let j = 0; j < specifiedHolidays.length; j += 1) {
            if (specifiedHolidays[j].date_time >= tDayStartTs && specifiedHolidays[j].date_time <= tDayEndTs) {
              holiday = true;
              break;
            }
          }
        }

        if (holiday === false) {
          const dayIdx = tDayStart.getDay();
          if (dayIdx === 0 || dayIdx === 6) holiday = true;
        }

        if (specifiedNonHolidays) {
          for (let k = 0; k < specifiedNonHolidays.length; k += 1) {
            if (specifiedNonHolidays[k].date_time >= tDayStartTs && specifiedNonHolidays[k].date_time <= tDayEndTs) {
              holiday = false;
              break;
            }
          }
        }

        if (holiday) {
          returnData.date.monthly_holiday_index.push(1);
        } else {
          returnData.date.monthly_holiday_index.push(0);
        }

        if (attRecList) {
          const passModeRecord = attRecList.filter(
            (attRec) => attRec.timestamp >= tDayStartTs
              && attRec.timestamp <= tDayEndTs
              && (attRec.verify_mode === 0 || attRec.verify_mode === 1 || attRec.verify_mode === 2),
          );
          const clockInModeRecord = attRecList.filter(
            (attRec) => attRec.timestamp >= tDayStartTs
              && attRec.timestamp <= tDayEndTs
              && attRec.verify_mode === 3,
          );
          const clockOutModeRecord = attRecList.filter(
            (attRec) => attRec.timestamp >= tDayStartTs
              && attRec.timestamp <= tDayEndTs
              && attRec.verify_mode === 4,
          );
          const manualClockInRecord = attRecList.filter(
            (attRec) => attRec.timestamp >= tDayStartTs
              && attRec.timestamp <= tDayEndTs
              && attRec.verify_mode === 5,
          );
          const manualClockOutRecord = attRecList.filter(
            (attRec) => attRec.timestamp >= tDayStartTs
              && attRec.timestamp <= tDayEndTs
              && attRec.verify_mode === 6,
          );

          passModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          clockInModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          clockOutModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          manualClockInRecord.sort((a, b) => a.modifier_time - b.modifier_time);
          manualClockOutRecord.sort((a, b) => a.modifier_time - b.modifier_time);

          let clockInStatus = _STATUS_NONE;
          let clockOutStatus = _STATUS_NONE;
          let firstClockInRec = null;
          let lastClockOutRec = null;

          let clockInTimeStamp = 0;
          let clockOutTimeStamp = 0;
          let overTimeStartStamp = 0;
          let overTimeEndStamp = 0;
          if (!item.late) item.late = 0;
          if (!item.early) item.early = 0;
          if (!item.no_record) item.no_record = 0;

          // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6: overTime
          if (manualClockInRecord.length > 0) {
            firstClockInRec = manualClockInRecord[manualClockInRecord.length - 1];

            clockInTimeStamp = firstClockInRec.timestamp;
            if (definedClockinAdjustmentEnabled && firstClockInRec.timestamp < tDayStartTs + clockInTime) {
              clockInTimeStamp = tDayStartTs + clockInTime;
            }

            if (definedClockinTimeLateEnabled) {
              if (firstClockInRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
                // show on time
                clockInStatus = _STATUS_SHOW_ON_TIME;
              } else {
                // too late to show
                clockInStatus = _STATUS_LATE;
              }
            } else {
              // show on time
              clockInStatus = _STATUS_SHOW_ON_TIME;
            }
          } else if (clockInModeRecord.length > 0) {
            const first = clockInModeRecord[0];
            firstClockInRec = first;

            clockInTimeStamp = firstClockInRec.timestamp;
            if (definedClockinAdjustmentEnabled && firstClockInRec.timestamp < tDayStartTs + clockInTime) {
              clockInTimeStamp = tDayStartTs + clockInTime;
            }

            if (definedClockinTimeLateEnabled) {
              if (firstClockInRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
                // show on time
                clockInStatus = _STATUS_SHOW_ON_TIME;
              } else {
                // too late to show
                clockInStatus = _STATUS_LATE;
              }
            } else {
              // show on time
              clockInStatus = _STATUS_SHOW_ON_TIME;
            }
          }

          if (manualClockOutRecord.length > 0) {
            lastClockOutRec = manualClockOutRecord[manualClockOutRecord.length - 1];

            clockOutTimeStamp = lastClockOutRec.timestamp;
            if (definedClockoutAdjustmentEnabled && lastClockOutRec.timestamp > tDayStartTs + clockOutTime) {
              clockOutTimeStamp = tDayStartTs + clockOutTime;
            }

            if (definedClockoutTimeEarlyLeaveEnabled) {
              if (lastClockOutRec.timestamp >= tDayStartTs + clockOutTime - clockOutTimeBuffer) {
                // leave on time
                clockOutStatus = _STATUS_LEAVE_ON_TIME;
              } else {
                // too early to leave
                clockOutStatus = _STATUS_EARLY;
              }
            } else {
              // leave on time
              clockOutStatus = _STATUS_LEAVE_ON_TIME;
            }

            if (definedOvertimeEnabled) {
              if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
                overTimeStartStamp = tDayStartTs + overTime;
                overTimeEndStamp = lastClockOutRec.timestamp;

                if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;
              }
            }
          } else if (clockOutModeRecord.length > 0) {
            lastClockOutRec = clockOutModeRecord[clockOutModeRecord.length - 1];

            clockOutTimeStamp = lastClockOutRec.timestamp;
            if (definedClockoutAdjustmentEnabled && lastClockOutRec.timestamp > tDayStartTs + clockOutTime) {
              clockOutTimeStamp = tDayStartTs + clockOutTime;
            }

            if (definedClockoutTimeEarlyLeaveEnabled) {
              if (lastClockOutRec.timestamp >= tDayStartTs + clockOutTime - clockOutTimeBuffer) {
                // leave on time
                clockOutStatus = _STATUS_LEAVE_ON_TIME;
              } else {
                // too early to leave
                clockOutStatus = _STATUS_EARLY;
              }
            } else {
              // leave on time
              clockOutStatus = _STATUS_LEAVE_ON_TIME;
            }

            if (definedOvertimeEnabled) {
              if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
                overTimeStartStamp = tDayStartTs + overTime;
                overTimeEndStamp = lastClockOutRec.timestamp;

                if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;

                // console.log('overtime', overTimeStartStamp, overTimeEndStamp);
              }
            }
          }

          // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6: overTime
          if (clockInStatus === _STATUS_NONE) {
            if (passModeRecord.length > 0) {
              const first = passModeRecord[0];
              firstClockInRec = first;

              clockInTimeStamp = firstClockInRec.timestamp;
              if (definedClockinAdjustmentEnabled && firstClockInRec.timestamp < tDayStartTs + clockInTime) {
                clockInTimeStamp = tDayStartTs + clockInTime;
              }

              if (definedClockinTimeLateEnabled) {
                if (firstClockInRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
                  // show on time
                  clockInStatus = _STATUS_SHOW_ON_TIME;
                } else {
                  // too late to show
                  clockInStatus = _STATUS_LATE;
                }
              } else {
                // show on time
                clockInStatus = _STATUS_SHOW_ON_TIME;
              }
            } else if (!holiday && timeToCheckClockIn) {
              clockInStatus = _STATUS_NO_SHOW;
            }
          }

          if (timeToCheckClockOut && clockOutStatus === _STATUS_NONE) {
            if (passModeRecord.length > 0) {
              lastClockOutRec = passModeRecord[passModeRecord.length - 1];

              clockOutTimeStamp = lastClockOutRec.timestamp;
              if (definedClockoutAdjustmentEnabled && lastClockOutRec.timestamp > tDayStartTs + clockOutTime) {
                clockOutTimeStamp = tDayStartTs + clockOutTime;
              }

              if (definedClockoutTimeEarlyLeaveEnabled) {
                if (lastClockOutRec.timestamp >= tDayStartTs + clockOutTime - clockOutTimeBuffer) {
                  // leave on time
                  clockOutStatus = _STATUS_LEAVE_ON_TIME;
                } else {
                  // too early to leave
                  clockOutStatus = _STATUS_EARLY;
                }
              } else {
                // leave on time
                clockOutStatus = _STATUS_LEAVE_ON_TIME;
              }

              if (definedOvertimeEnabled) {
                if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
                  overTimeStartStamp = tDayStartTs + overTime;
                  overTimeEndStamp = lastClockOutRec.timestamp;

                  if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;
                }
              }
            } else if (!holiday) {
              clockOutStatus = _STATUS_NO_SHOW;
            }
          }

          if (i === idxSpecifiedDateToCheck && clockInStatus === _STATUS_LATE) item.late += 1;
          if (i === idxSpecifiedDateToCheck && clockOutStatus === _STATUS_EARLY) item.early += 1;
          if (i === idxSpecifiedDateToCheck && (clockInStatus === _STATUS_NO_SHOW || clockOutStatus === _STATUS_NO_SHOW)) item.no_record += 1;

          returnData.attendance_data.clock_in_status.push(clockInStatus);
          returnData.attendance_data.clock_out_status.push(clockOutStatus);
          if (firstClockInRec) returnData.attendance_data.firstClockInRec = firstClockInRec;
          if (lastClockOutRec) returnData.attendance_data.lastClockOutRec = lastClockOutRec;

          let workingTime = 0;
          if ((clockOutTimeStamp > 0) && (clockInTimeStamp > 0)) {
            workingTime = clockOutTimeStamp - clockInTimeStamp - breakTime;
          }

          returnData.attendance_data.working_time.push(workingTime > 0 ? workingTime : 0);

          returnData.attendance_data.over_time.push(overTimeEndStamp - overTimeStartStamp > 0 ? overTimeEndStamp - overTimeStartStamp : 0);
        }
      }

      return returnData;
    },
    generateAttendanceStatusTable(attendanceData) {
      const tableBordderSize = '1';
      const tableBordderColor = '#979899';
      const cellBgColor = '#fff';
      const holidayColorOnHeader = '#e0e0e0';
      const workdayColorOnHeader = '#fff';

      const attendanceNoStatusColor = cellBgColor;

      let headerDataString = '';
      let bodyDataStringClockIn = '';
      let bodyDataStringClockOut = '';

      let colorToAppend = '';
      const i = this.value_specifiedDate.getDate() - 1;
      const isHoliday = attendanceData.date.monthly_holiday_index[i];
      if (isHoliday) colorToAppend = holidayColorOnHeader;
      else colorToAppend = workdayColorOnHeader;

      headerDataString += `<th style='text-align:center;opacity: 1.0;width:150px;font-size: 10px;border: 1px solid ${tableBordderColor};`
        + `text-overflow: ellipsis; overflow: hidden; font-family:Arial;padding: 0px 0px; color: #606266; background-color:${colorToAppend}'>`;
      headerDataString += `<div style='height:25px;margin:-5px 0px'>${dayjs(this.value_specifiedDate).format('YYYY-MM-DD')}</div>`;
      headerDataString += '</th>';

      let clockInStatusColor = attendanceNoStatusColor; // no show
      if (!isHoliday) {
        clockInStatusColor = this.value_attendanceStatusColor[
          attendanceData.attendance_data.clock_in_status[i]
        ];
      } else if (attendanceData.attendance_data.clock_in_status[i] !== 5) {
        clockInStatusColor = this.value_attendanceStatusColor[
          attendanceData.attendance_data.clock_in_status[i]
        ];
      }
      bodyDataStringClockIn += `<td style='opacity: 1.0;border: 1px solid ${tableBordderColor};'><div style='height:12px;background-color:${clockInStatusColor};'/></td>`;

      let clockOutStatusColor = attendanceNoStatusColor;
      if (!isHoliday) {
        clockOutStatusColor = this.value_attendanceStatusColor[
          attendanceData.attendance_data.clock_out_status[i]
        ];
      } else if (attendanceData.attendance_data.clock_out_status[i] !== 5) {
        clockOutStatusColor = this.value_attendanceStatusColor[
          attendanceData.attendance_data.clock_out_status[i]
        ];
      }
      bodyDataStringClockOut += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockOutStatusColor};"/></td>`;

      return [
        '<div align="center" style="height:58px;">',
        `<table style='border:${tableBordderSize}px solid ${tableBordderColor}; margin:10px;'> `,
        `<thead><tr>${headerDataString}</tr></thead>`,
        `<tbody><tr>${bodyDataStringClockIn}</tr><tr>${bodyDataStringClockOut}</tr></tbody>`,
        '</table>',
        '</div>',
      ].join('');
    },
  },
};
</script>

<style>
  .alertModal_Title {
    font-size: 2.4rem;
  }

  .list-group-item {
    padding-left: 30px !important;
    padding-top: 5px;
    padding-right: 30px;
    padding-bottom: 5px;
    line-height: 40px;
    font-size: 18px;
  }

  .form-check-input {
    margin-top: 0.8rem;
  }
</style>
