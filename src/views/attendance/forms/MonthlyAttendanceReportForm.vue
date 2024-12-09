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
                    :pressed="value === value_selectedMonth ? true : false"
                    @click="selectMonthType(value)"
                  >
                    {{ value_selectedMonthName[value] }}
                  </CButton>
                </CButtonGroup>
              </div>
              <date-picker
                :lang="this.$globalDatePickerLanguage"
                style="visibility: hidden; width: 0px"
                type="month"
                ref="datePicker"
                @change="datePickerDatachange()"
                v-model="value_monthPicked"
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
          <div id="monthlyAttendanceReportForm">
            <vxe-table
              :data="value_dataItemsToShow"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              ref="attMainTable"
            >
              <!-- <vxe-table-column type="checkbox" width="6%" align="center"></vxe-table-column> -->
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="person"
                :title="$t('Person')"
                width="10%"
                align="left"
                type="html"
                style="font: 10px"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="groups"
                :title="$t('Group')"
                align="left"
                type="html"
                width="10%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="clockDate"
                :title="$t('Date')"
                width="10%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="workingTimeToShow"
                :title="$t('WorkingTime')"
                align="left"
                type="html"
                width="15%"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="attendanceStatusText"
                :title="$t('MonthlyAttendanceStatus')"
                align="left"
                type="html"
                width="15%"
              />
              <vxe-table-column
                field="attendanceStatus"
                :title="$t('MonthlyAttendanceStatus')"
                min-width="400"
                type="html"
              />
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="details"
                title=""
                min-width="5%"
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
      <!-- <CRow>
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
            :disabled="value_fileType != '.xlsx'"
            :options="[$t('Excluded'), $t('Embedded'), $t('Files')]"
          />
        </CCol>
      </CRow> -->

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
              > {{ value_masterfieldsforExport.find((field) => {return field.key == item}).value }}
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
            :disabled="value_fileType != '.xlsx'"
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
// import * as coreui from '@coreui/coreui';
import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';

import JsZip from 'jszip';

const dayjs = require('dayjs');

export default {
  name: 'MonthlyAttendanceReportForm',
  props: {
    formData: Object,
    onFetchPersonDataCallback: { type: Function },
    onFetchPersonAttendanceDataCallback: { type: Function },
    onFetchSingleAttendanceDataCallback: { type: Function },
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
        { key: 'workingTime', value: this.$t('WorkingTime') },
        { key: 'overTime', value: this.$t('Overtime') },
        { key: 'norecord', value: this.$t('NoRecord') },
        { key: 'arrivallate', value: this.$t('LatePerson') },
        { key: 'leaveearly', value: this.$t('LeaveEarly') },
        { key: 'noentryrecord', value: this.$t('NoEntryRecord') },
        { key: 'noleaverecord', value: this.$t('NoLeaveRecord') },
      ],

      value_masterexportFields: [
        'id',
        'name',
        'group_list',
        'workingTime',
        'overTime',
        'norecord',
        'arrivallate',
        'leaveearly',
        'noentryrecord',
        'noleaverecord',
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

      value_specifiedMonth: new Date(),
      value_attendanceDataListToReview: null,
      value_dataItemsToShowDetailData: [],
      value_selectedMonth: 0,
      value_selectedMonthName: [
        this.$t('ThisMonth'),
        this.$t('LastMonth'),
        this.$t('Select'),
      ],
      value_monthPicked: null,
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
        videoDeviceGroupIn: [],
        videoDeviceGroupOut: [],
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

        this.value_workingHourSettings.videoDeviceGroupIn = [];
        this.value_workingHourSettings.videoDeviceGroupOut = [];

        if ((this.value_workingHourSettings.video_device_group_in.length >= 1)
            || (this.value_workingHourSettings.video_device_group_out.length >= 1)) {
          this.$globalFindVideoDeviceGroups('', 0, 2000, (err, data) => {
            if (err == null) {
              const { result } = data;

              result.forEach((r) => {
                if (r) {
                  if (this.value_workingHourSettings.video_device_group_in.indexOf(r.uuid) >= 0) {
                    this.value_workingHourSettings.videoDeviceGroupIn = this.value_workingHourSettings.videoDeviceGroupIn.concat(r.camera_uuid_list);
                    this.value_workingHourSettings.videoDeviceGroupIn = this.value_workingHourSettings.videoDeviceGroupIn.concat(r.tablet_uuid_list);
                  }

                  if (this.value_workingHourSettings.video_device_group_out.indexOf(r.uuid) >= 0) {
                    this.value_workingHourSettings.videoDeviceGroupOut = this.value_workingHourSettings.videoDeviceGroupOut.concat(r.camera_uuid_list);
                    this.value_workingHourSettings.videoDeviceGroupOut = this.value_workingHourSettings.videoDeviceGroupOut.concat(r.tablet_uuid_list);
                  }
                }
              });
            }
          });
        }
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
          videoDeviceGroupIn: [],
          videoDeviceGroupOut: [],
        };
      }
      this.refreshTableItems();
    });

    // this.initToggles();

    if (this.$deviceProfile.supportTemperature) {
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

        for (let i = 0; i < 31; i += 1) {
          const dayDetailsButtonId = `actionOnDayDetails_${item.uuid}_${i}`;
          // console.log( dayDetailsButtonId )
          const ele = document.getElementById(dayDetailsButtonId);
          if (ele) {
            ele.addEventListener('click', () => {
              this.clickOnDatDetails(item, i);
            });
          }
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
      this.value_specifiedMonth = this.value_monthPicked;
      this.value_selectedMonthName[2] = dayjs(this.value_specifiedMonth).format('YYYY-MM');
      this.refreshTableItems();
    },
    selectMonthType(type) {
      this.value_selectedMonth = type;

      const m = new Date();
      switch (type) {
        case 0:
          m.setDate(1); // 1 will result in the first day of the month
          this.value_specifiedMonth = m;
          this.value_selectedMonthName[2] = this.$t('Select');

          this.refreshTableItems();
          break;
        case 1:
          m.setDate(0); // 0 will result in the last day of the previous month
          m.setDate(1); // 1 will result in the first day of the month
          this.value_specifiedMonth = m;
          this.value_selectedMonthName[2] = this.$t('Select');

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
    // 選擇某一個人 (item) 查看整個月份的每個紀錄
    clickOnDetails(item) {
      this.value_searchingFilter = '';
      this.value_tablePageForDetailData = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      console.log(item)
      if (item.attendance_data_list && item.attendance_data_list.length > 0) {
        this.value_attendanceDataListToReview = [
          ...item.attendanceStatusData.attendance_data.clock_in_record.filter((rec) => Object.keys(rec).length > 0),
          ...item.attendanceStatusData.attendance_data.clock_out_record.filter((rec) => Object.keys(rec).length > 0),
        ];
        this.value_attendanceDataListToReview.sort((a, b) => a.timestamp - b.timestamp);
        this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
          this.value_attendanceDataListToReview,
          this.value_searchingFilter,
        );
      }
    },
    // 選擇某一個人 (item) 查看某一天 (dayIdx) 的每個紀錄
    clickOnDatDetails(item, dayIdx) {
      const startTimeOfMonth = new Date(this.value_specifiedMonth.getFullYear(), this.value_specifiedMonth.getMonth(), 1,
        0, 0, 0, 0);
      // const dateCode = dayjs(startTimeOfMonth.getTime() + dayIdx * 86400000).format('YYYY-MM-DD');
      const startTimeOfSelectedDay = startTimeOfMonth.getTime() + dayIdx * 86400000;
      const endTimeOfSelectedDay = startTimeOfSelectedDay + 86399999;

      this.value_searchingFilter = '';
      this.value_tablePageForDetailData = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      };
      if (item.attendance_data_list && item.attendance_data_list.length > 0) {
        const l = [];
        if (Object.keys(item.attendanceStatusData.attendance_data.clock_in_record[dayIdx]).length > 0) l.push(item.attendanceStatusData.attendance_data.clock_in_record[dayIdx]);
        if (Object.keys(item.attendanceStatusData.attendance_data.clock_out_record[dayIdx]).length > 0) l.push(item.attendanceStatusData.attendance_data.clock_out_record[dayIdx]);

        if (l.length > 0) {
          this.value_attendanceDataListToReview = l;
          this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
            this.value_attendanceDataListToReview,
            this.value_searchingFilter,
          );
        }
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

      // Summary
      worksheet = workbook.addWorksheet('Summary');

      const columns = [{ header: 'No', key: 'No', width: 10 }];

      for (let i = 0; i < this.value_masterexportFields.length; i += 1) {
        switch (this.value_masterexportFields[i]) {
          case 'id': columns.push({ header: this.$t('PersonId'), key: 'id', width: 10 }); break;
          case 'name': columns.push({ header: this.$t('PersonName'), key: 'nameToShow', width: 10 }); break;
          case 'group_list': columns.push({ header: this.$t('Group'), key: 'groups', width: 10 }); break;
          case 'workingTime': columns.push({ header: this.$t('WorkingTime'), key: 'working_time', width: 10 }); break;
          case 'overTime': columns.push({ header: this.$t('Overtime'), key: 'over_time', width: 10 }); break;
          case 'norecord': columns.push({ header: this.$t('NoRecord'), key: 'norecord', width: 10 }); break;
          case 'arrivallate': columns.push({ header: this.$t('LatePerson'), key: 'lateperson', width: 10 }); break;
          case 'leaveearly': columns.push({ header: this.$t('LeaveEarly'), key: 'leaveearly', width: 10 }); break;
          case 'noentryrecord': columns.push({ header: this.$t('NoEntryRecord'), key: 'noentryrecord', width: 10 }); break;
          case 'noleaverecord': columns.push({ header: this.$t('NoLeaveRecord'), key: 'noleaverecord', width: 10 }); break;
          default: break;
        }
      }

      worksheet.columns = columns;
      this.excelExecutionAmounts = this.value_allTableItems.length;

      for (let idx2 = 0; idx2 < this.value_allTableItems.length; idx2 += 1) {
        this.exportNo += 1;
        this.excelCounter += 1;

        const item = this.value_allTableItems[idx2];

        {
          item.nameToShow = item.name;
          item.late = 0;
          item.early = 0;
          item.no_record = 0;
          item.no_entry = 0;
          item.no_leave = 0;

          try {
            if (Array.isArray(item.group_list)) {
              item.groups = (item.group_list || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
            } else {
              item.groups = (JSON.parse(item.group_list) || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
            }
          } catch (ex) {
            item.groups = '';
          }

          const attendanceStatusData = this.generateAttendanceStatusData_V2(this.value_workingHourSettings, item);

          item.attendanceStatusData = attendanceStatusData;
        }

        worksheet.addRow({
          No: this.exportNo,
          id: item.id,
          nameToShow: item.nameToShow,
          groups: item.groups,
          working_time: item.working_time,
          over_time: item.over_time,
          norecord: item.no_record,
          lateperson: item.late,
          leaveearly: item.early,
          noentryrecord: item.no_entry,
          noleaverecord: item.no_leave,
        });
      }

      // WorkingTime
      worksheet = workbook.addWorksheet(this.$t('WorkingTime'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];

      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item1 = this.value_allTableItems[idx];
        const obj = {
          No: idx + 1,
          id: item1.id,
          nameToShow: item1.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item1.attendanceStatusData.attendance_data.working_time.length; j += 1) {
          if (item1.attendanceStatusData.attendance_data.working_time[j] > 0) {
            obj[`D${j + 1}`] = this.formatDurationTime(item1.attendanceStatusData.attendance_data.working_time[j]);
            total += +item1.attendanceStatusData.attendance_data.working_time[j];
          }
        }
        obj.Total = this.formatDurationTime(total);

        worksheet.addRow(obj);
      }

      // OverTime
      worksheet = workbook.addWorksheet(this.$t('Overtime'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];

      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item2 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item2.id,
          nameToShow: item2.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item2.attendanceStatusData.attendance_data.over_time.length; j += 1) {
          if (item2.attendanceStatusData.attendance_data.over_time[j] > 0) {
            obj[`D${j + 1}`] = this.formatDurationTime(item2.attendanceStatusData.attendance_data.over_time[j]);
            total += +item2.attendanceStatusData.attendance_data.over_time[j];
          }
        }
        obj.Total = this.formatDurationTime(total);

        worksheet.addRow(obj);
      }

      // No Record
      worksheet = workbook.addWorksheet(this.$t('NoRecord'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];

      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item3 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item3.id,
          nameToShow: item3.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item3.attendanceStatusData.attendance_data.clock_in_status.length; j += 1) {
          if (
            item3.attendanceStatusData.attendance_data.clock_in_status[j] === 5
            && item3.attendanceStatusData.attendance_data.clock_out_status[j] === 5
          ) {
            obj[`D${j + 1}`] = 'X';
            total += 1;
          }
        }
        obj.Total = total;

        worksheet.addRow(obj);
      }

      // Late Person
      worksheet = workbook.addWorksheet(this.$t('LatePerson'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item4 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item4.id,
          nameToShow: item4.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item4.attendanceStatusData.attendance_data.clock_in_status.length; j += 1) {
          if (item4.attendanceStatusData.attendance_data.clock_in_status[j] === 3) {
            const rec = item4.attendanceStatusData.attendance_data.clock_in_record[j];

            if (rec.timestamp) {
              obj[`D${j + 1}`] = dayjs(rec.timestamp).format('HH:mm:ss');
              total += 1;
            }
          }
        }
        obj.Total = total;

        worksheet.addRow(obj);
      }

      // Leave Early
      worksheet = workbook.addWorksheet(this.$t('LeaveEarly'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item5 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item5.id,
          nameToShow: item5.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item5.attendanceStatusData.attendance_data.clock_out_status.length; j += 1) {
          if (item5.attendanceStatusData.attendance_data.clock_out_status[j] === 4) {
            const rec = item5.attendanceStatusData.attendance_data.clock_out_record[j];

            if (rec.timestamp) {
              obj[`D${j + 1}`] = dayjs(rec.timestamp).format('HH:mm:ss');
              total += 1;
            }
          }
        }
        obj.Total = total;

        worksheet.addRow(obj);
      }

      // No Entry Record
      worksheet = workbook.addWorksheet(this.$t('NoEntryRecord'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item6 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item6.id,
          nameToShow: item6.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item6.attendanceStatusData.attendance_data.clock_in_status.length; j += 1) {
          if (item6.attendanceStatusData.attendance_data.clock_in_status[j] === 5) {
            obj[`D${j + 1}`] = 'X';
            total += 1;
          }
        }
        obj.Total = total;

        worksheet.addRow(obj);
      }

      // No Leave Record
      worksheet = workbook.addWorksheet(this.$t('NoLeaveRecord'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
        { header: 'Total', key: 'Total', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item7 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item7.id,
          nameToShow: item7.nameToShow,
        };

        let total = 0;
        for (let j = 0; j < item7.attendanceStatusData.attendance_data.clock_out_status.length; j += 1) {
          if (item7.attendanceStatusData.attendance_data.clock_out_status[j] === 5) {
            obj[`D${j + 1}`] = 'X';
            total += 1;
          }
        }
        obj.Total = total;

        worksheet.addRow(obj);
      }

      // ClockIn Time
      worksheet = workbook.addWorksheet(this.$t('ClockInTime'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item8 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item8.id,
          nameToShow: item8.nameToShow,
        };

        // let total = 0;
        for (let j = 0; j < item8.attendanceStatusData.attendance_data.clock_in_status.length; j += 1) {
          const rec = item8.attendanceStatusData.attendance_data.clock_in_record[j];

          if (rec.timestamp) {
            obj[`D${j + 1}`] = dayjs(rec.timestamp).format('HH:mm:ss');
          }
        }

        worksheet.addRow(obj);
      }

      // ClockOut Time
      worksheet = workbook.addWorksheet(this.$t('ClockOutTime'));
      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: this.$t('PersonId'), key: 'id', width: 10 },
        { header: this.$t('PersonName'), key: 'nameToShow', width: 10 },
        { header: this.$t('Group'), key: 'groups', width: 10 },
        { header: '1', key: 'D1', width: 10 },
        { header: '2', key: 'D2', width: 10 },
        { header: '3', key: 'D3', width: 10 },
        { header: '4', key: 'D4', width: 10 },
        { header: '5', key: 'D5', width: 10 },
        { header: '6', key: 'D6', width: 10 },
        { header: '7', key: 'D7', width: 10 },
        { header: '8', key: 'D8', width: 10 },
        { header: '9', key: 'D9', width: 10 },
        { header: '10', key: 'D10', width: 10 },
        { header: '11', key: 'D11', width: 10 },
        { header: '12', key: 'D12', width: 10 },
        { header: '13', key: 'D13', width: 10 },
        { header: '14', key: 'D14', width: 10 },
        { header: '15', key: 'D15', width: 10 },
        { header: '16', key: 'D16', width: 10 },
        { header: '17', key: 'D17', width: 10 },
        { header: '18', key: 'D18', width: 10 },
        { header: '19', key: 'D19', width: 10 },
        { header: '20', key: 'D20', width: 10 },
        { header: '21', key: 'D21', width: 10 },
        { header: '22', key: 'D22', width: 10 },
        { header: '23', key: 'D23', width: 10 },
        { header: '24', key: 'D24', width: 10 },
        { header: '25', key: 'D25', width: 10 },
        { header: '26', key: 'D26', width: 10 },
        { header: '27', key: 'D27', width: 10 },
        { header: '28', key: 'D28', width: 10 },
        { header: '29', key: 'D29', width: 10 },
        { header: '30', key: 'D30', width: 10 },
        { header: '31', key: 'D31', width: 10 },
      ];
      for (let idx = 0; idx < this.value_allTableItems.length; idx += 1) {
        const item9 = this.value_allTableItems[idx];

        const obj = {
          No: idx + 1,
          id: item9.id,
          nameToShow: item9.nameToShow,
        };

        // let total = 0;
        for (let j = 0; j < item9.attendanceStatusData.attendance_data.clock_out_status.length; j += 1) {
          const rec = item9.attendanceStatusData.attendance_data.clock_out_record[j];

          if (rec.timestamp) {
            obj[`D${(j + 1)}`] = dayjs(rec.timestamp).format('HH:mm:ss');
          }
        }
        worksheet.addRow(obj);
      }

      if (workbook != null) {
        workbook.xlsx.writeBuffer().then((data) => {
          const filename = `Monthly_Attendance_${dayjs(this.value_specifiedMonth).format('YYYYMM')}.xlsx`;

          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          zip.file(filename, blob);

          zip.generateAsync({ type: 'blob' }).then((content) => {
            FileSaver.saveAs(content, `Monthly_Attendance_${dayjs(this.value_specifiedMonth).format('YYYYMM')}.zip`);
          });
        });
      }

      this.flag_downloadingExecl = false;
    },

    exportMasterToTXTCSV() {
      const self = this;
      const zip = new JsZip();

      let separator = self.value_txtSeparator === '' ? self.value_separator : self.value_txtSeparator;
      if (separator === 'S') separator = ' ';
      if (separator === 'T') separator = '\t';

      let data = `"No"${separator}"${self.value_masterexportFields.join("\"" + separator + "\"")}"\r\n`;

      self.exportNo = 0;

      for (let idx2 = 0; idx2 < self.value_allTableItems.length; idx2 += 1) {
        self.exportNo += 1;

        const item = self.value_allTableItems[idx2];
        {
          item.nameToShow = item.name;
          item.late = 0;
          item.early = 0;
          item.no_record = 0;
          item.no_entry = 0;
          item.no_leave = 0;

          const attendanceStatusData = self.generateAttendanceStatusData_V2(self.value_workingHourSettings, item);

          try {
            if (Array.isArray(item.group_list)) {
              item.groups = (item.group_list || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
            } else {
              item.groups = (JSON.parse(item.group_list) || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
            }
          } catch (ex) {
            item.groups = '';
          }

          item.attendanceStatusData = attendanceStatusData;
        }

        const ln = ["\"" + self.exportNo + "\""];
        for (let i = 0; i < self.value_masterexportFields.length; i += 1) {
          switch (self.value_masterexportFields[i]) {
            case 'id': ln.push("\"" + item.id + "\""); break;
            case 'name': ln.push("\"" + item.nameToShow + "\""); break;
            case 'group_list': ln.push("\"" + item.groups + "\""); break;
            case 'workingTime': ln.push("\"" + item.working_time + "\""); break;
            case 'overTime': ln.push("\"" + item.over_time + "\""); break;
            case 'norecord': ln.push("\"" + item.no_record + "\""); break;
            case 'arrivallate': ln.push("\"" + item.late + "\""); break;
            case 'leaveearly': ln.push("\"" + item.early + "\""); break;
            case 'noentryrecord': ln.push("\"" + item.no_entry + "\""); break;
            case 'noleaverecord': ln.push("\"" + item.no_leave + "\""); break;
            default: break;
          }
        }
        data += `${ln.join(separator)}\r\n`;
      }

      let filename = '';
      let blob = null;

      if (self.value_fileType === '.txt') {
        filename = `Monthly_Attendance_${dayjs(self.value_specifiedMonth).format('YYYYMM')}.txt`;
        blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      } else if (self.value_fileType === '.csv') {
        filename = `Monthly_Attendance_${dayjs(self.value_specifiedMonth).format('MMDD')}.csv`;
        blob = new Blob([`\uFEFF${data}`], { type: 'text/csv;charset=utf-8' });
      }

      zip.file(filename, blob);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver.saveAs(
          content,
          `Monthly_Attendance_${dayjs(self.value_specifiedMonth).format('YYYYMM')}.zip`,
        );
      });
    },

    clickOnExportDetail() {
      const self = this;

      switch (self.value_fileType) {
        case '.txt': self.exportDetailToTXTCSV(); break;
        case '.csv': self.exportDetailToTXTCSV(); break;
        case '.xlsx':
        default:
          self.exportDetailToExcel(); break;
      }
    },

    async exportDetailToExcel() {
      const self = this;

      const zip = new JsZip();

      const snapshotFolder = zip.folder('snapshot');

      const workbook = new Excel.Workbook();
      let worksheet = null;

      self.exportNo = 0;
      self.excelCounter = 0;

      // const company = '';
      // let personId = '';
      let personName = '';

      if (this.value_attendanceDataListToReview.length >= 1) {
        // personId = this.value_attendanceDataListToReview[0].id;
        personName = this.value_attendanceDataListToReview[0].name;
      }

      worksheet = workbook.addWorksheet(dayjs(this.value_specifiedMonth).format('YYYY-MM'));

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
              this.value_attendanceDataListToReview[idx].groups = (this.value_attendanceDataListToReview[idx].group_list || [])
                .filter((item) => !(item == 'All Person' || item == 'All Visitor'))
                .join(', ');
            } else {
              this.value_attendanceDataListToReview[idx].groups = (JSON.parse(this.value_attendanceDataListToReview[idx].group_list) || [])
                .filter((item) => !(item == 'All Person' || item == 'All Visitor'))
                .join(', ');
            }
          } catch (ex) {
            this.value_attendanceDataListToReview[idx].groups = '';
          }
        }

        worksheet.addRow({
          No: self.exportNo,
          id: self.value_attendanceDataListToReview[idx].id,
          nameToShow: self.value_attendanceDataListToReview[idx].nameToShow,
          card_number: self.value_attendanceDataListToReview[idx].card_number,
          groups: self.value_attendanceDataListToReview[idx].groups,
          temperature: self.value_attendanceDataListToReview[idx].temperature,
          clockMode: self.value_attendanceDataListToReview[idx].clockMode,
          clockTime: self.value_attendanceDataListToReview[idx].clockTime,
        });

        const pos = self.value_detailexportFields.indexOf('face_image');
        if (pos >= 0) {
          if (self.value_snapshotFileType === 'Embedded' || self.value_snapshotFileType === 'Files') {
            if (self.value_attendanceDataListToReview[idx].face_image_id) {
              const imageRet = await self.$globalFetchVerifyPhoto(self.value_attendanceDataListToReview[idx].face_image_id);

              if (imageRet && imageRet.data) {
                if (self.value_snapshotFileType === 'Embedded') {
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

                if (self.value_snapshotFileType === 'Files') {
                  const fileTime = self.value_attendanceDataListToReview[idx].clockTime
                    .replace('/', '_')
                    .replace(' ', '_')
                    .replace(':', '_');
                  snapshotFolder.file(
                    `${self.exportNo}_${fileTime}.jpeg`,
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
          const filename = `Attendance_${dayjs(self.value_specifiedMonth).format('YYYYMM')}_${personName}.xlsx`;

          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          zip.file(filename, blob);

          zip.generateAsync({ type: 'blob' }).then((content) => {
            FileSaver.saveAs(
              content,
              `Attendance_${dayjs(self.value_specifiedMonth).format('YYYYMM')}_${personName}.zip`,
            );
          });
        });
      }

      self.flag_downloadingExecl = false;
    },

    exportDetailToTXTCSV() {
      const self = this;

      const zip = new JsZip();

      let separator = self.value_txtSeparator === '' ? self.value_separator : self.value_txtSeparator;
      if (separator === 'S') separator = ' ';
      if (separator === 'T') separator = '\t';

      // const company = '';
      // let personId = '';
      let personName = '';

      if (self.value_attendanceDataListToReview.length >= 1) {
        personName = self.value_attendanceDataListToReview[0].name;
      }

      let data = `"No"${separator}"${self.value_detailexportFields.join("\"" + separator + "\"")}"\r\n`;

      self.exportNo = 0;

      for (let idx = 0; idx < self.value_attendanceDataListToReview.length; idx += 1) {
        self.exportNo += 1;
        const item = self.value_attendanceDataListToReview[idx];

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
            item.groups = (item.group_list || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
          }
        } catch (ex) {
          item.groups = '';
        }

        const ln = ["\"" + self.exportNo + "\""];
        for (let i = 0; i < self.value_detailexportFields.length; i += 1) {
          switch (self.value_detailexportFields[i]) {
            case 'id': ln.push("\"" + item.id + "\""); break;
            case 'name': ln.push("\"" + item.nameToShow + "\""); break;
            case 'group_list': ln.push("\"" + item.groups + "\""); break;
            case 'mode': ln.push("\"" + item.clockMode + "\""); break;
            case 'clockTime': ln.push("\"" + item.clockTime + "\""); break;
            case 'temperature': ln.push("\"" + item.temperature + "\""); break;
            case 'cardno': ln.push("\"" + item.card_number + "\""); break;
            case 'face_image': ln.push(''); break;
            default: break;
          }
        }
        data += `${ln.join(separator)}\r\n`;
      }

      let filename = '';
      let blob = null;

      if (self.value_fileType === '.txt') {
        filename = `Attendance_${dayjs(self.value_specifiedMonth).format('MMDD')}_${personName}.txt`;
        blob = new Blob([data], {
          type: 'text/plain;charset=utf-8',
        });
      } else if (self.value_fileType === '.csv') {
        filename = `Attendance_${dayjs(self.value_specifiedMonth).format('MMDD')}_${personName}.csv`;
        blob = new Blob([`\uFEFF${data}`], { type: 'text/csv;charset=utf-8' });
      }

      zip.file(filename, blob);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver.saveAs(
          content,
          `Attendance_${dayjs(self.value_specifiedMonth).format('MMDD')}_${personName}.zip`,
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
      const self = this;
      let ret = '';

      if (base64ImageString.length > 0) {
        ret = `<img width='${desireWidth}' height='${desireHeight}' src='data:image/jpeg;base64,${base64ImageString}'>`;
      } else {
        ret = `<img width='${desireWidth}' height='${desireHeight}' src='${self.value_emptyPhoto}'>`;
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
      const self = this;
      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || (item.group_list && item.group_list.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1));

      self.value_tablePage.totalResult = filteredItems.length;

      filteredItems.forEach((pItem) => {
        const item = pItem;

        item.working_time = '';
        item.over_time = '';

        item.attendanceStatusData = self.generateAttendanceStatusData_V2(self.value_workingHourSettings, item);
        item.attendanceStatus = self.generateAttendanceStatusTable(item.attendanceStatusData, item.uuid);

        let totalWorkingTime = 0;
        for (let i = 0; i < item.attendanceStatusData.attendance_data.working_time.length; i += 1) {
          totalWorkingTime += item.attendanceStatusData.attendance_data.working_time[i];
        }

        let totalOverTime = 0;
        for (let i = 0; i < item.attendanceStatusData.attendance_data.over_time.length; i += 1) {
          totalOverTime += item.attendanceStatusData.attendance_data.over_time[i];
        }

        item.working_time = self.formatDurationTime(totalWorkingTime);
        item.over_time = self.formatDurationTime(totalOverTime);

        item.workingTimeToShow = '';
        if (totalWorkingTime > 0) {
          item.workingTimeToShow += `${this.$t('WorkingTime')} : ${self.formatDurationTime(totalWorkingTime)}`;
        }

        if (totalOverTime > 0) {
          item.workingTimeToShow += `<br> ${this.$t('Overtime')} : ${self.formatDurationTime(totalOverTime)}`;
        }

        item.attendanceStatusText = `${this.$t('NoRecord')} : ${item.no_record} <br>`
          + `${this.$t('LatePerson')} : ${item.late} <br>`
          + `${this.$t('LeaveEarly')} : ${item.early} <br>`
          + `${this.$t('NoEntryRecord')} : ${item.no_entry} <br>`
          + `${this.$t('NoLeaveRecord')} : ${item.no_leave} <br>`
          + `${this.$t('OvertimeDays')} : ${item.overtime} <br>`;
      });
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize,
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
            item.groups = (item.group_list || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join('<br>');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join('<br>');
          }
        } catch (ex) {
          item.groups = '';
        }

        item.clockDate = dayjs(self.value_specifiedMonth).format('MM/YYYY');
      });

      self.value_showAllPerson = `${this.$t('AllPerson')}`
        + ` : ${self.value_allTableItems.length}`;

      self.value_showLatePerson = `${this.$t('LatePerson')}`
        + ` : ${self.value_allTableItems.filter((p) => p.late > 0).length}`;

      self.value_showLeaveEarlyPerson = `${this.$t('LeaveEarly')}`
        + ` : ${self.value_allTableItems.filter((p) => p.early > 0).length}`;

      self.value_showNoRecordPerson = `${this.$t('NoRecord')}`
        + ` : ${self.value_allTableItems.filter((p) => p.no_record > 0).length}`;

      self.value_showGoodRecordsPerson = `${this.$t('GoodRecords')}`
        + ` : ${self.value_allTableItems.filter((p) => p.early === 0 && p.late === 0 && p.no_record === 0).length}`;

      return Object.assign([], sliceList);
    },

    generateFilteredDataForDetailData(sourceData, filter) {
      const self = this;
      const filteredItems = filter.length === 0
        ? sourceData : sourceData.filter(
          (item) => (item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1),
        );
      self.value_tablePageForDetailData.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePageForDetailData.currentPage - 1) * self.value_tablePageForDetailData.pageSize,
        self.value_tablePageForDetailData.currentPage * self.value_tablePageForDetailData.pageSize,
      );
      sliceList.forEach((pItem) => {
        const item = pItem;

        item.nameToShow = item.name;

        item.clockTime = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss');

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
            item.groups = (item.group_list || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
          } else {
            item.groups = (JSON.parse(item.group_list) || []).filter((groupItem) => !(groupItem == 'All Person' || groupItem == 'All Visitor')).join(', ');
          }
        } catch (ex) {
          item.groups = '';
        }

        const showimageId = item.face_image_id ? item.face_image_id.f + item.face_image_id.uuid : '';

        if (showimageId.length > 0) {
          item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs`
            + '4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQI'
            + 'HWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
          self.$globalFetchVerifyPhoto(item.face_image_id, (error, data) => {
            if (error === null && data) {
              item.imageb64 = data.face_image;

              const ele = document.getElementById(showimageId);
              if (ele) ele.src = `data:image/jpeg;base64,${data.face_image}`;
            }
          });
        } else {
          item.showimage = '<img src=\'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKg'
            + 'AAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AA'
            + 'AAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
        }
        item.imageb64 = '';
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      const self = this;

      if (self.onFetchPersonDataCallback) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.onFetchPersonDataCallback((errorOnPersonTable, resetPersonTable, morePersonItem, personTableItems) => {
          if (!errorOnPersonTable) {
            if (resetPersonTable) {
              self.value_allTableItems = [];
              self.value_dataItemsToShow = [];
            }
            if (personTableItems) {
              self.value_allTableItems = self.value_allTableItems.concat(personTableItems);
            }

            if (personTableItems.length >= 1) {
              const uuidList = [];

              self.onFetchPersonAttendanceDataCallback(
                self.value_specifiedMonth,
                uuidList,
                (errorOnPersonVr, resetPersonVr, morePersonVr, personVrItems) => {
                  if (personVrItems && personVrItems.length > 0) {
                    self.value_allTableItems.forEach((record) => {
                      const person = record;
                      const dataListOnUuid = personVrItems.filter((vr) => vr.uuid === person.uuid);
                      dataListOnUuid.forEach((d) => {
                        if (!person.attendance_data_list) {
                          person.attendance_data_list = [];
                        }
                        if (
                          !person.attendance_data_list.find(
                            (att) => att.verify_uuid === d.verify_uuid,
                          )
                        ) {
                          person.attendance_data_list.push({
                            id: d.id,
                            name: d.name,
                            department: person.extra_info.department,
                            verify_uuid: d.verify_uuid,
                            timestamp: d.timestamp,
                            source_id: d.source_id,
                            // yyyymmdd: new Date(d.timestamp).yyyy_mm_dd(),
                            yyyymmdd: dayjs(d.timestamp).format('YYYY-MM-DD'),
                            temperature: d.temperature === 0 ? '' : `${d.temperature}°C`,
                            verify_mode: d.verify_mode,
                            verify_mode_string: d.verify_mode_string,
                            verify_score: d.verify_score,
                            card_number: d.card_number,
                            group_list: d.group_list,
                            face_image_id: d.face_image_id,
                          });
                        }
                      });
                    });
                  }
                  if (!morePersonVr || errorOnPersonVr) {
                    self.value_dataItemsToShow = self.generateFilteredData(
                      self.value_allTableItems,
                      self.value_searchingFilter,
                    );
                    if (self.obj_loading) self.obj_loading.hide();
                    if (cb) cb();
                  }
                },
              );
            }
            if (self.obj_loading) self.obj_loading.hide();
            self.observeTableSize();
            // self.generateFilteredData(self.value_allTableItems, []);
          } else {
            if (self.obj_loading) self.obj_loading.hide();
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

      const videoGroupIn = workingHourSettings.videoDeviceGroupIn || [];
      const videoGroupOut = workingHourSettings.videoDeviceGroupOut || [];

      const attRecList = item.attendance_data_list ? item.attendance_data_list : [];

      const self = this;

      item.no_record = 0;
      item.late = 0;
      item.early = 0;
      item.no_entry = 0;
      item.no_leave = 0;
      item.overtime = 0;

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

      const startTimeOfMonth = new Date(self.value_specifiedMonth.getFullYear(), self.value_specifiedMonth.getMonth(), 1, 0, 0, 0, 0);
      const endTimeOfMonth = new Date(self.value_specifiedMonth.getFullYear(), self.value_specifiedMonth.getMonth() + 1, 1, 0, 0, 0, 0);
      const daysOnMonth = (endTimeOfMonth - startTimeOfMonth) / msDay;

      const returnData = {
        date: {
          days: daysOnMonth,
          monthly_holiday_index: [],
        },
        attendance_data: {
          clock_in_status: [],
          clock_out_status: [],
          clock_in_record: [],
          clock_out_record: [],
          working_time: [],
          over_time_record: [],
          over_time: [],
        },
      };

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

          if (passModeRecord.length > 0) {
            for (let index = passModeRecord.length - 1; index >= passModeRecord.length - 2; index -= 1) {
              const rec = passModeRecord[index];

              if (rec) {
                if (videoGroupIn.indexOf(rec.source_id) >= 0) {
                  clockInModeRecord.push(rec);
                  passModeRecord.splice(index, 1);
                } else if (videoGroupOut.indexOf(rec.source_id) >= 0) {
                  clockOutModeRecord.push(rec);
                  passModeRecord.splice(index, 1);
                }
              }
            }
          }

          passModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          clockInModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          clockOutModeRecord.sort((a, b) => a.timestamp - b.timestamp);
          manualClockInRecord.sort((a, b) => a.timestamp - b.timestamp);
          manualClockOutRecord.sort((a, b) => a.timestamp - b.timestamp);

          let clockInStatus = _STATUS_NONE;
          let clockOutStatus = _STATUS_NONE;
          let firstClockInRec = {};
          let lastClockOutRec = {};

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
              firstClockInRec.timestamp = clockInTimeStamp;
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
                firstClockInRec.timestamp = clockInTimeStamp;
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
            if (passModeRecord.length >= 2) {
              lastClockOutRec = passModeRecord[passModeRecord.length - 1];

              clockOutTimeStamp = lastClockOutRec.timestamp;
              if (definedClockoutAdjustmentEnabled && lastClockOutRec.timestamp > tDayStartTs + clockOutTime) {
                clockOutTimeStamp = tDayStartTs + clockOutTime;
                lastClockOutRec.timestamp = clockOutTimeStamp;
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

          if (!holiday && clockInStatus === _STATUS_LATE) item.late += 1;
          if (!holiday && clockOutStatus === _STATUS_EARLY) item.early += 1;
          if ((!holiday && clockInStatus === _STATUS_NO_SHOW) || clockOutStatus === _STATUS_NO_SHOW) item.no_record += 1;

          if (!holiday && clockInStatus === _STATUS_NO_SHOW) item.no_entry += 1;
          if (!holiday && clockOutStatus === _STATUS_NO_SHOW) item.no_leave += 1;
          if (!holiday && overTimeStartStamp > 0) item.overtime += 1;

          returnData.attendance_data.clock_in_record.push(firstClockInRec);
          returnData.attendance_data.clock_in_status.push(clockInStatus);

          returnData.attendance_data.clock_out_record.push(lastClockOutRec);
          returnData.attendance_data.clock_out_status.push(clockOutStatus);

          let workingTime = 0;
          if ((clockOutTimeStamp > 0) && (clockInTimeStamp > 0)) {
            workingTime = clockOutTimeStamp - clockInTimeStamp - breakTime;
          }

          returnData.attendance_data.working_time.push(workingTime > 0 ? workingTime : 0);

          returnData.attendance_data.over_time_record.push({ overTimeStartStamp, overTimeEndStamp });
          returnData.attendance_data.over_time.push(overTimeEndStamp - overTimeStartStamp > 0 ? overTimeEndStamp - overTimeStartStamp : 0);
        }
      }

      return returnData;
    },
    generateAttendanceStatusTable(attendanceData, personUuid) {
      const self = this;
      const tableBordderSize = '1';
      const tableBordderColor = '#9799a1';
      const cellBgColor = '#fff';
      const holidayColorOnHeader = '#e0e0e0';
      const workdayColorOnHeader = '#fff';

      const attendanceNoStatusColor = cellBgColor;

      let headerDataString = '';
      let bodyDataStringClockIn = '';
      let bodyDataStringClockOut = '';
      for (let i = 0; i < attendanceData.date.days; i += 1) {
        let isHoliday = false;
        let colorToAppend = '';
        if (attendanceData.date.monthly_holiday_index.length > i) {
          if (attendanceData.date.monthly_holiday_index[i] === 1) {
            isHoliday = true;
          }
        }

        if (isHoliday) colorToAppend = holidayColorOnHeader;
        else colorToAppend = workdayColorOnHeader;

        const dateNum = i + 1;
        const date = `00${dateNum}`.slice(-2);
        const divIdTag = ` id='actionOnDayDetails_${personUuid}_${i}'`;
        headerDataString += `<th style='text-align:center;opacity: 1.0;width:24px;font-size: 12px;border: 1px solid ${tableBordderColor};font-family:Arial;padding: 0px 0px;color:#000;background-color:${colorToAppend}'>`;
        headerDataString += `<div style='cursor: pointer;height:25px;margin:-5px 0px; font-size: 6px; color: #606266;' ${divIdTag}>`;
        headerDataString += `<small style='font-size: 8px; ' class='text-truncate scheduler-date'>${date}</small></div>`;
        headerDataString += '</th>';

        let clockInStatusColor = attendanceNoStatusColor; // no show
        if (!isHoliday) {
          clockInStatusColor = self.value_attendanceStatusColor[
            attendanceData.attendance_data.clock_in_status[i]
          ];
        } else if (attendanceData.attendance_data.clock_in_status[i] !== 5) {
          clockInStatusColor = self.value_attendanceStatusColor[
            attendanceData.attendance_data.clock_in_status[i]
          ];
        }
        bodyDataStringClockIn += `<td style='opacity: 1.0;border: 1px solid ${tableBordderColor};'><div style='height:12px;background-color:${clockInStatusColor};'/></td>`;

        let clockOutStatusColor = attendanceNoStatusColor;
        if (!isHoliday) {
          clockOutStatusColor = self.value_attendanceStatusColor[
            attendanceData.attendance_data.clock_out_status[i]
          ];
        } else if (attendanceData.attendance_data.clock_out_status[i] !== 5) {
          clockOutStatusColor = self.value_attendanceStatusColor[
            attendanceData.attendance_data.clock_out_status[i]
          ];
        }
        bodyDataStringClockOut += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockOutStatusColor};"/></td>`;
      }

      return [
        '<div class=\'d-flex justify-content-center w-100 my-2\' style=\'height:58px;\'>',
        `<table style='border:${tableBordderSize}px solid ${tableBordderColor};margin:10px;' class='scheduler-table'>`,
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
