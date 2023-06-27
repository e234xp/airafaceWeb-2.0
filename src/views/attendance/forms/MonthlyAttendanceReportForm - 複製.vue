<template>
  <div>
    <div>
      <CCol sm="12">
        <div class="h1 mb-5">{{ disp_header }}</div>
      </CCol>
    </div>
    <div>
      <CCol sm="12">
        <CCol sm="12">
          <CRow class="flex-row-reverse">
            <CInput v-model.lazy="value_searchingFilter" style="width: 300px" size="lg" :placeholder="disp_search">
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </CRow>
          <!-- 上方按鈕群組 -->
          <CRow class="justify-content-between buttons-group">
            <!-- 左邊按鈕群組 -->
            <div class="d-flex">
              <div v-if="showDetailData()">
                <CButton class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0" @click="clickOnReturnToAll()">
                  <!-- <i class="fa fa-arrow-left"></i> -->
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip"
                    title="back to all records">
                    <i class="bi bi-reply"></i>
                  </div>
                  <div class="btn-rwd-text btn-p-md">{{ disp_return }}</div>
                </CButton>
              </div>
              <div v-if="showAllData()">
                <CButton class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0" @click="clickOnReturnToAll()">
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip" title="show all records">
                    <CIcon size="sm" name="cilPeople" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">{{ value_showAllPerson }}</div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton class="btn btn-outline-success fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowGoodRecordsPerson()">
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip" title="show good records">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showGoodRecordsPerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0" @click="clickOnShowLatePerson()">
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip" title="show late records">
                    <i class="bi bi-alarm-fill"></i>
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showLatePerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowLeaveEarlyPerson()">
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip"
                    title="show leave early records">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="btn-rwd-text btn-p-md">
                    {{ value_showLeaveEarlyPerson }}
                  </div>
                </CButton>
              </div>

              <div v-if="showAllData()">
                <CButton class="btn btn-outline-secondary fz-md mr-2 mb-3 btn-rwd p-0"
                  @click="clickOnShowNoRecordPerson()">
                  <div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip"
                    title="show people with no records">
                    <CIcon size="sm" name="cilUserX" />
                  </div>
                  <div class="btn-rwd-text btn-p-md">{{ value_showNoRecordPerson }}</div>
                </CButton>
              </div>
            </div>
            <!-- 右邊按鈕群組 -->
            <div class="d-flex">
              <!-- 本月 上月 選擇 -->
              <div>
                <CButtonGroup v-if="showAllData()">
                  <CButton class="btn btn-outline-primary fz-md nowrap-hidden" v-for="(value, key) in [0, 1, 2]"
                    :key="key" :pressed="value === value_selectedMonth ? true : false" @click="selectMonthType(value)">
                    {{ value_selectedMonthName[value] }}
                  </CButton>
                </CButtonGroup>
              </div>
              <date-picker :lang="this.$globalDatePickerLanguage" style="visibility: hidden; width: 0px" type="month"
                ref="datePicker" @change="datePickerDatachange()" v-model="value_monthPicked"></date-picker>

              <!-- 匯出 -->
              <div>
                <CButton class="btn btn-outline-primary fz-md ml-2 nowrap-hidden" @click="clickOnExport()">
                  {{ disp_export }}
                </CButton>
              </div>
            </div>
          </CRow>
        </CCol>
      </CCol>
    </div>
    <CCard v-if="showAllData()" class="mt-3">
      <CCardBody>
        <div>
          <div id="monthlyAttendanceReportForm">
            <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
              :header-cell-style="headerCellStyle" ref="attMainTable" @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent">
              <vxe-table-column type="checkbox" width="6%" align="center"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="person" :title="disp_person" width="10%"
                align="left" type="html" style="font: 10px"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="groups" :title="disp_group_list" align="left"
                type="html" width="8%"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="clockDate" :title="disp_clockDate"
                width="8%"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="workingTimeToShow" :title="disp_working_time"
                align="left" type="html" width="10%"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="attendanceStatusText"
                :title="disp_attendanceStatus" align="left" type="html" width="10%"></vxe-table-column>
              <vxe-table-column field="attendanceStatus" :title="disp_monthlyAttendanceStatus" min-width="400"
                type="html" />
              <vxe-table-column :show-overflow="ellipsisMode" field="details" title="" min-width="5%"
                type="html"></vxe-table-column>
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
        </div>
      </CCardBody>
    </CCard>

    <CCard v-if="showDetailData()">
      <CCardBody>
        <div>
          <div>
            <vxe-table :data="value_dataItemsToShowDetailData" stripe align="center" :cell-style="cellStyle"
              :header-cell-style="headerCellStyle">
              <vxe-table-column show-overflow field="id" :title="disp_id" width="12%"></vxe-table-column>
              <vxe-table-column show-overflow field="nameToShow" :title="disp_name" width="12%"></vxe-table-column>
              <vxe-table-column show-overflow field="groups" :title="disp_group_list" width="15%"></vxe-table-column>
              <vxe-table-column show-overflow field="clockMode" :title="disp_clockingMode"
                width="12%"></vxe-table-column>
              <vxe-table-column show-overflow field="clockTime" :title="disp_clockTime" width="12%"></vxe-table-column>
              <vxe-table-column show-overflow field="temperature" :title="disp_temperature"
                width="12%"></vxe-table-column>
              <vxe-table-column field="showimage" :title="disp_face_image" type="html"></vxe-table-column>
              <vxe-table-column show-overflow field="card_number" :title="disp_cardnumber"
                width="12%"></vxe-table-column>
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
            ]" :current-page="value_tablePageForDetailData.currentPage"
            :page-size="value_tablePageForDetailData.pageSize" :total="value_tablePageForDetailData.totalResult"
            @page-change="handlePageChangeForDetailData">
          </vxe-pager>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import * as coreui from "@coreui/coreui";
  import i18n from "@/i18n";
  import FileSaver from "file-saver";
  import Excel from "exceljs/dist/exceljs.min.js";

  import JsZip from "jszip";

  Date.prototype.yyyy_mm = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm
    ].join("");
  };

  Date.prototype.mmyyyy = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    return [
      (mm > 9 ? "" : "0") + mm + "/",
      this.getFullYear()
    ].join("");
  };


  Date.prototype.yyyy_mm_dd_HHMMSS = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var HH = this.getHours();
    var MM = this.getMinutes();
    var SS = this.getSeconds();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd + " ",
      (HH > 9 ? "" : "0") + HH + ":",
      (MM > 9 ? "" : "0") + MM + ":",
      (SS > 9 ? "" : "0") + SS,
    ].join("");
  };

  Date.prototype.yyyy_mm_dd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd,
    ].join("");
  };

  Date.prototype.MMdd = function () {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();

    return [
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd
    ].join("");
  };

  Date.prototype.HHMMSS = function () {
    var HH = this.getHours();
    var MM = this.getMinutes();
    var SS = this.getSeconds();

    return [
      (HH > 9 ? "" : "0") + HH + ":",
      (MM > 9 ? "" : "0") + MM + ":",
      (SS > 9 ? "" : "0") + SS,
    ].join("");
  };

  Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join(
      ""
    );
  };

  const defaultlState = () => {
    return {
      obj_loading: null,

      flag_downloadingExecl: false,
      excelExecutionAmounts: 0,
      excelCounter: 0,
      exportNo: 0,

      value_emptyPhoto:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==",
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 7,
        totalResult: 0,
      },
      value_tablePageForDetailData: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      value_searchingFilter: "",

      disp_id: i18n.formatter.format("PersonId"),
      disp_name: i18n.formatter.format("PersonName"),
      disp_person: i18n.formatter.format("Person"),

      disp_department: i18n.formatter.format("Department"),
      disp_clockDate: i18n.formatter.format("Date"),
      disp_clockin: i18n.formatter.format("ClockInTime"),
      disp_clockin_temperature: i18n.formatter.format("Temperature"),
      disp_clockout: i18n.formatter.format("ClockOutTime"),
      disp_clockout_temperature: i18n.formatter.format("Temperature"),
      disp_working_time: i18n.formatter.format("WorkingTime"),
      disp_over_time: i18n.formatter.format("Overtime"),
      disp_cardnumber: i18n.formatter.format("CardNumber"),
      disp_group_list: i18n.formatter.format("Group"),
      disp_face_image: i18n.formatter.format("CapturedPhoto"),
      disp_attendanceStatus: i18n.formatter.format("MonthlyAttendanceStatus"),

      disp_search: i18n.formatter.format("Search"),
      disp_export: i18n.formatter.format("Export"),
      disp_clockTime: i18n.formatter.format("ClockTime"),
      disp_clockingMode: i18n.formatter.format("ClockingMode"),
      disp_temperature: i18n.formatter.format("Temperature"),
      disp_return: i18n.formatter.format("ReturnToAll"),
      disp_header: "none", //i18n.formatter.format("None"),
      disp_monthlyAttendanceStatus: i18n.formatter.format("MonthlyAttendanceStatus"),

      // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6 : no entry, 7: no leave, 8: overtime
      value_attendanceStatusColor: [
        "#fff",
        "#57bd37",
        "#57bd37",
        "#ee7447",
        "#ee7447",
        "#d8cde3"
      ],
      //value_specifiedMonth : new Date( Date.now() - 86400000 * 3 ),
      value_specifiedMonth: new Date(),
      value_attendanceDataListToReview: null,
      value_dataItemsToShowDetailData: [],
      value_selectedMonth: 0,
      value_selectedMonthNameType2: i18n.formatter.format("Select"),
      value_selectedMonthName: [
        i18n.formatter.format("ThisMonth"),
        i18n.formatter.format("LastMonth"),
        i18n.formatter.format("Select"),
      ],
      value_monthPicked: null,
      value_showAllPerson: "",
      value_showLatePerson: "",
      value_showLeaveEarlyPerson: "",
      value_showNoRecordPerson: "",
      value_showGoodRecordsPerson: "",
      value_workingHourSettings: {
        defined_clockin_time_hour: 9,
        defined_clockin_time_min: 0,
        defined_clockin_time_late_enabled: true,          //
        defined_clockin_time_buffer_mins: 15,
        defined_clockin_adjustment_enabled: true,         //
        defined_clockout_time_hour: 18,
        defined_clockout_time_min: 0,
        defined_clockout_time_early_leave_enabled: true,  //
        defined_clockout_time_buffer_mins: 15,
        defined_clockout_adjustment_enabled: true,        //
        defined_overtime_enabled: true,                   //
        defined_overtime_time_hour: 18,                   //
        defined_overtime_time_min: 30,                    //
        defined_overtime_minimum_min: 30,                 //
        defined_break_time_mins: 60,                      //
        specified_holidays: [{ date_time: 0 }],
        specified_non_holidays: [{ date_time: 0 }],
      },
    };
  };
  export default {
    name: "MonthlyAttendanceReportForm",
    props: {
      formData: Object,
      onFetchPersonDataCallback: { type: Function },
      onFetchPersonAttendanceDataCallback: { type: Function },
    },
    data() {
      return Object.assign({}, defaultlState(), this.formData);
    },
    created() { },
    mixins: [TableObserver],
    mounted() {
      const self = this;
      self.$globalGetAttendanceSettings(function (err, data) {
        if (!err) {
          self.value_workingHourSettings = data; //Object.assign( {},  data );
          self.refreshTableItems();
        }
      });
      this.observeTableSize();
      this.initToggles();
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },

    updated() {
      const self = this;
      if (self.showAllData()) {
        self.value_dataItemsToShow.forEach((item) => {
          const detailsButtonId = "actionOnDetails_" + item.uuid;
          document.getElementById(detailsButtonId).addEventListener("click", function () {
            self.clickOnDetails(item);
          });

          for (let i = 0; i < 31; i++) {
            const dayDetailsButtonId = "actionOnDayDetails_" + item.uuid + "_" + i;
            // console.log( dayDetailsButtonId )
            const ele = document.getElementById(dayDetailsButtonId);
            if (ele) {
              ele.addEventListener("click", function () {
                self.clickOnDatDetails(item, i);
              });
            }
          }
        });
      }
    },

    watch: {
      value_searchingFilter: function (value) {
        const self = this;
        self.value_tablePage.currentPage = 1;
        self.value_tablePageForDetailData.currentPage = 1;
        if (this.showAllData())
          this.value_dataItemsToShow = this.generateFilteredData(
            this.value_allTableItems,
            this.value_searchingFilter
          );
        else
          this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
            this.value_attendanceDataListToReview,
            this.value_searchingFilter
          );
      },
    },
    methods: {
      datePickerDatachange() {
        const self = this;
        //console.log( self.value_monthPicked )
        self.value_specifiedMonth = self.value_monthPicked;
        self.value_selectedMonthName[2] = self.value_specifiedMonth.yyyy_mm();
        self.refreshTableItems();
      },
      selectMonthType(type) {
        const self = this;
        self.value_selectedMonth = type;

        switch (type) {
          case 0:
            {
              let m = new Date();
              m.setDate(1); // 1 will result in the first day of the month
              self.value_specifiedMonth = m;
              self.value_selectedMonthName[2] = self.value_selectedMonthNameType2;
              self.refreshTableItems();
            }
            break;
          case 1:
            {
              let m = new Date();
              m.setDate(0); // 0 will result in the last day of the previous month
              m.setDate(1); // 1 will result in the first day of the month
              self.value_specifiedMonth = m;
              self.value_selectedMonthName[2] = self.value_selectedMonthNameType2;
              self.refreshTableItems();
            }
            break;
          case 2:
            {
              self.$refs.datePicker.openPopup();
            }
            break;
        }
      },
      showAllData() {
        return null == this.value_attendanceDataListToReview; // ? "d-block" : "d-none";
      },
      showDetailData() {
        //return true;//null != this.value_attendanceDataListToReview ? "d-block" : "d-none";
        return null != this.value_attendanceDataListToReview;
      },
      clickOnReturnToAll() {
        const self = this;
        self.value_searchingFilter = "";
        self.value_attendanceDataListToReview = null;
        self.value_dataItemsToShowDetailData = [];
        self.value_tablePage = {
          currentPage: 1,
          pageSize: 7,
          totalResult: 0,
        };
        self.value_dataItemsToShow = self.generateFilteredData(
          self.value_allTableItems,
          self.value_searchingFilter
        );
      },
      clickOnShowLatePerson() {
        const self = this;
        self.value_searchingFilter = "";
        self.value_tablePage = {
          currentPage: 1,
          pageSize: 7,
          totalResult: 0,
        };
        if (self.value_allTableItems.length > 0) {
          let ss = self.value_allTableItems.filter((a) => {
            return a.late > 0;
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            ss,
            self.value_searchingFilter
          );
        }
      },
      clickOnShowLeaveEarlyPerson() {
        const self = this;
        self.value_searchingFilter = "";
        self.value_tablePage = {
          currentPage: 1,
          pageSize: 7,
          totalResult: 0,
        };
        if (self.value_allTableItems.length > 0) {
          let ss = self.value_allTableItems.filter((a) => {
            return a.early > 0;
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            ss,
            self.value_searchingFilter
          );
        }
      },
      clickOnShowNoRecordPerson() {
        const self = this;
        self.value_searchingFilter = "";
        self.value_tablePage = {
          currentPage: 1,
          pageSize: 7,
          totalResult: 0,
        };
        if (self.value_allTableItems.length > 0) {
          let ss = self.value_allTableItems.filter((a) => {
            return a.no_record > 0;
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            ss,
            self.value_searchingFilter
          );
        }
      },
      clickOnShowGoodRecordsPerson() {
        const self = this;
        self.value_searchingFilter = "";
        self.value_tablePage = {
          currentPage: 1,
          pageSize: 7,
          totalResult: 0,
        };
        if (self.value_allTableItems.length > 0) {
          let ss = self.value_allTableItems.filter((a) => {
            return a.late == 0 && a.early == 0 && a.no_record == 0;
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            ss,
            self.value_searchingFilter
          );
        }
      },
      clickOnDetails(item) {
        this.value_searchingFilter = "";
        this.value_tablePageForDetailData = {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        };
        if (item.attendance_data_list && item.attendance_data_list.length > 0) {
          this.value_attendanceDataListToReview = item.attendance_data_list;
          this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
            this.value_attendanceDataListToReview,
            this.value_searchingFilter
          );
        }
      },
      clickOnDatDetails(item, dayIdx) {
        const self = this;
        const startTimeOfMonth = new Date(
          self.value_specifiedMonth.getFullYear(),
          self.value_specifiedMonth.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        const startTimeOfSelectedDay = startTimeOfMonth.getTime() + dayIdx * 86400000;
        const endTimeOfSelectedDay = startTimeOfSelectedDay + 86399999;
        this.value_searchingFilter = "";
        this.value_tablePageForDetailData = {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        };
        if (item.attendance_data_list && item.attendance_data_list.length > 0) {
          const l = item.attendance_data_list.filter((data) => {
            return (
              data.timestamp >= startTimeOfSelectedDay &&
              data.timestamp <= endTimeOfSelectedDay
            );
          });
          if (l.length > 0) {
            this.value_attendanceDataListToReview = l;
            this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
              this.value_attendanceDataListToReview,
              this.value_searchingFilter
            );
          }
        }
      },
      async clickOnExport() {
        let self = this;

        if (self.showDetailData()) {
          self.clickOnExportDetail();
          return;
        }
        self.flag_downloadingExecl = true;
        var snapshotFolder = null;

        var zip = new JsZip();

        snapshotFolder = zip.folder("snapshot");
        var workbook = new Excel.Workbook();
        var worksheet = null;

        self.exportNo = 0;
        self.excelCounter = 0;

        ////  Summary
        worksheet = workbook.addWorksheet("Summary");

        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: self.disp_working_time, key: 'working_time', width: 10 },
          { header: self.disp_over_time, key: 'over_time', width: 10 },
          { header: i18n.formatter.format("NoRecord"), key: "norecord", width: 10 },
          { header: i18n.formatter.format("LatePerson"), key: "lateperson", width: 10 },
          { header: i18n.formatter.format("LeaveEarly"), key: "leaveearly", width: 10 },
          { header: i18n.formatter.format("NoEntryRecord"), key: "noentryrecord", width: 10 },
          { header: i18n.formatter.format("NoLeaveRecord"), key: "noleaverecord", width: 10 }
        ];

        self.excelExecutionAmounts = self.value_allTableItems.length;

        for (let idx2 = 0; idx2 < self.value_allTableItems.length; idx2++) {
          self.exportNo++;
          self.excelCounter++;

          var item = self.value_allTableItems[idx2];

          item["nameToShow"] = item.name;
          item["late"] = 0;
          item["early"] = 0;
          item["no_record"] = 0;
          item["no_entry"] = 0;
          item["no_leave"] = 0;

          const attendanceStatusData = self.generateAttendanceStatusData_V2(self.value_workingHourSettings, item);

          item["attendanceStatusData"] = attendanceStatusData;

          worksheet.addRow({
            No: self.exportNo,
            id: item.id,
            nameToShow: item.nameToShow,
            groups: eval(item.group_list).join(", "),
            working_time: item.working_time,
            over_time: item.over_time,
            norecord: item.no_record,
            lateperson: item.late,
            leaveearly: item.early,
            noentryrecord: item.no_entry,
            noleaverecord: item.no_leave
          });
        }


        ////  WorkingTime
        worksheet = workbook.addWorksheet(i18n.formatter.format("WorkingTime"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];

        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];
          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.working_time.length; j++) {
            if (item.attendanceStatusData.attendance_data.working_time[j] > 0) {
              obj["D" + (j + 1)] = self.formatDurationTime(item.attendanceStatusData.attendance_data.working_time[j]);
            }
            total += +item.attendanceStatusData.attendance_data.working_time[j];
          }
          obj["Total"] = self.formatDurationTime(total);

          worksheet.addRow(obj);
        }

        ////  OverTime
        worksheet = workbook.addWorksheet(i18n.formatter.format("Overtime"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];

        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.over_time.length; j++) {
            if (item.attendanceStatusData.attendance_data.over_time[j] > 0) {
              obj["D" + (j + 1)] = self.formatDurationTime(item.attendanceStatusData.attendance_data.over_time[j]);
            }
            total += +item.attendanceStatusData.attendance_data.over_time[j];
          }
          obj["Total"] = self.formatDurationTime(total);

          worksheet.addRow(obj);

        }

        ////  No Record
        worksheet = workbook.addWorksheet(i18n.formatter.format("NoRecord"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];

        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_in_status.length; j++) {
            if ((item.attendanceStatusData.attendance_data.clock_in_status[j] == 5) &&
              (item.attendanceStatusData.attendance_data.clock_out_status[j] == 5)) {
              obj["D" + (j + 1)] = "X";
              total += 1;
            }
          }
          obj["Total"] = total;

          worksheet.addRow(obj);
        }

        ////  Late Person
        worksheet = workbook.addWorksheet(i18n.formatter.format("LatePerson"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_in_status.length; j++) {
            if (item.attendanceStatusData.attendance_data.clock_in_status[j] == 3) {
              let rec = item.attendanceStatusData.attendance_data.clock_in_record[j];

              if (rec.timestamp) {
                obj["D" + (j + 1)] = new Date(rec.timestamp).HHMMSS();
                total += 1;
              }
            }
          }
          obj["Total"] = total;

          worksheet.addRow(obj);
        }

        ////  Leave Early
        worksheet = workbook.addWorksheet(i18n.formatter.format("LeaveEarly"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_out_status.length; j++) {
            if (item.attendanceStatusData.attendance_data.clock_out_status[j] == 4) {
              let rec = item.attendanceStatusData.attendance_data.clock_out_record[j];

              if (rec.timestamp) {
                obj["D" + (j + 1)] = new Date(rec.timestamp).HHMMSS();
                total += 1;
              }
            }
          }
          obj["Total"] = total;

          worksheet.addRow(obj);
        }

        ////  No Entry Record
        worksheet = workbook.addWorksheet(i18n.formatter.format("NoEntryRecord"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_in_status.length; j++) {
            if (item.attendanceStatusData.attendance_data.clock_in_status[j] == 5) {
              obj["D" + (j + 1)] = "X";
              total += 1;
            }

          }
          obj["Total"] = total;

          worksheet.addRow(obj);
        }


        ////  No Leave Record
        worksheet = workbook.addWorksheet(i18n.formatter.format("NoLeaveRecord"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }, { header: "Total", key: 'Total', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_out_status.length; j++) {
            if (item.attendanceStatusData.attendance_data.clock_out_status[j] == 5) {
              obj["D" + (j + 1)] = "X";
              total += 1;
            }
          }
          obj["Total"] = total;

          worksheet.addRow(obj);
        }

        ////  ClockIn Time
        worksheet = workbook.addWorksheet(i18n.formatter.format("ClockInTime"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          // let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_in_status.length; j++) {
            let rec = item.attendanceStatusData.attendance_data.clock_in_record[j];

            if (rec.timestamp) {
              obj["D" + (j + 1)] = new Date(rec.timestamp).HHMMSS();
              // total += rec.timestamp;
            }
          }
          // obj["Total"] = self.formatDurationTime(total);

          worksheet.addRow(obj);
        }

        ////  ClockOut Time
        worksheet = workbook.addWorksheet(i18n.formatter.format("ClockOutTime"));
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: "1", key: 'D1', width: 10 }, { header: "2", key: 'D2', width: 10 }, { header: "3", key: 'D3', width: 10 },
          { header: "4", key: 'D4', width: 10 }, { header: "5", key: 'D5', width: 10 }, { header: "6", key: 'D6', width: 10 },
          { header: "7", key: 'D7', width: 10 }, { header: "8", key: 'D8', width: 10 }, { header: "9", key: 'D9', width: 10 },
          { header: "10", key: 'D10', width: 10 }, { header: "11", key: 'D11', width: 10 }, { header: "12", key: 'D12', width: 10 },
          { header: "13", key: 'D13', width: 10 }, { header: "14", key: 'D14', width: 10 }, { header: "15", key: 'D15', width: 10 },
          { header: "16", key: 'D16', width: 10 }, { header: "17", key: 'D17', width: 10 }, { header: "18", key: 'D18', width: 10 },
          { header: "19", key: 'D19', width: 10 }, { header: "20", key: 'D20', width: 10 }, { header: "21", key: 'D21', width: 10 },
          { header: "22", key: 'D22', width: 10 }, { header: "23", key: 'D23', width: 10 }, { header: "24", key: 'D24', width: 10 },
          { header: "25", key: 'D25', width: 10 }, { header: "26", key: 'D26', width: 10 }, { header: "27", key: 'D27', width: 10 },
          { header: "28", key: 'D28', width: 10 }, { header: "29", key: 'D29', width: 10 }, { header: "30", key: 'D30', width: 10 },
          { header: "31", key: 'D31', width: 10 }
        ];
        for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
          var item = self.value_allTableItems[idx];

          let obj = {
            No: idx + 1,
            id: item.id,
            nameToShow: item.nameToShow
          };

          // let total = 0;
          for (let j = 0; j < item.attendanceStatusData.attendance_data.clock_out_status.length; j++) {
            let rec = item.attendanceStatusData.attendance_data.clock_out_record[j];

            if (rec.timestamp) {
              obj["D" + (j + 1)] = new Date(rec.timestamp).HHMMSS();
              // total += rec.timestamp;
            }
          }
          // obj["Total"] = self.formatDurationTime(total);

          worksheet.addRow(obj);
        }

        if (workbook != null) {
          workbook.xlsx.writeBuffer().then((data) => {
            // var n = Math.floor(self.exportNo / 10000) + 1;

            var filename = `Monthly_Attendance_${self.value_specifiedMonth.yyyy_mm().replace("-", "")}.xlsx`;

            var blob = new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            zip.file(filename, blob);

            zip.generateAsync({ type: "blob" }).then(function (content) {
              FileSaver.saveAs(
                content,
                `Monthly_Attendance_${self.value_specifiedMonth.yyyy_mm().replace("-", "")}.zip`
              );
            });
          });
        }

        self.flag_downloadingExecl = false;
      },
      async clickOnExportDetail() {
        let self = this;

        self.flag_downloadingExecl = true;
        var snapshotFolder = null;

        var zip = new JsZip();

        snapshotFolder = zip.folder("snapshot");

        var workbook = new Excel.Workbook();
        var worksheet = null;

        self.exportNo = 0;
        self.excelCounter = 0;

        var company = "";
        var personId = "";
        var personName = "";

        if (self.value_attendanceDataListToReview.length >= 1) {
          personId = self.value_attendanceDataListToReview[0].id;
          personName = self.value_attendanceDataListToReview[0].name;
        }

        worksheet = workbook.addWorksheet(self.value_specifiedMonth.yyyy_mm());

        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: self.disp_id, key: "id", width: 10 },
          { header: self.disp_name, key: "nameToShow", width: 10 },
          { header: self.disp_group_list, key: "groups", width: 10 },
          { header: self.disp_clockingMode, key: "clockMode", width: 10 },
          { header: self.disp_clockTime, key: "clockTime", width: 10 },
          { header: self.disp_temperature, key: "temperature", width: 10 },
          { header: self.disp_face_image, key: "face_image", width: 10 },
          { header: self.disp_cardnumber, key: "card_number", width: 10 },
        ];
        self.excelExecutionAmounts = self.value_attendanceDataListToReview.length;

        for (let idx = 0; idx < self.value_attendanceDataListToReview.length; idx++) {
          self.exportNo++;
          self.excelCounter++;

          {
            self.value_attendanceDataListToReview[idx]["nameToShow"] =
              self.value_attendanceDataListToReview[idx].name;
            let d = new Date(self.value_attendanceDataListToReview[idx].timestamp);
            self.value_attendanceDataListToReview[idx]["clockTime"] = d.MMddHHMM();

            switch (self.value_attendanceDataListToReview[idx].verify_mode) {
              case 1:
                self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeCard");
                break;
              case 2:
                self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModePass");
                break;
              case 3:
                self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeClockIn");
                break;
              case 4:
                self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeClockOut");
                break;
              default:
                self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("None");
                break;
            }
            self.value_attendanceDataListToReview[idx]["groups"] = eval(
              self.value_attendanceDataListToReview[idx].group_list
            ).join(", ");
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

          if (self.value_attendanceDataListToReview[idx].face_image_id) {
            let imageRet = await self.$globalFetchVerifyPhoto(self.value_attendanceDataListToReview[idx].face_image_id);

            if (imageRet && imageRet.data) {
              var photoId = workbook.addImage({
                base64: imageRet.data.face_image,
                extension: "jpeg",
              });
              worksheet.addImage(
                photoId,
                "H" + worksheet.rowCount + ":H" + worksheet.rowCount
              );
              worksheet.lastRow.height = 60;

              let fileTime = self.value_attendanceDataListToReview[idx].clockTime
                .replace("/", "_")
                .replace(" ", "_")
                .replace(":", "_");
              snapshotFolder.file(
                self.exportNo + "_" + fileTime + ".jpeg",
                imageRet.data.face_image,
                { base64: true }
              );
            }
          }
        }

        if (workbook != null) {
          workbook.xlsx.writeBuffer().then((data) => {
            var filename = `Attendance_${self.value_specifiedMonth.yyyy_mm().replace("-", "")}_${personName}.xlsx`;

            var blob = new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            zip.file(filename, blob);

            zip.generateAsync({ type: "blob" }).then(function (content) {
              FileSaver.saveAs(
                content,
                `Attendance_${self.value_specifiedMonth.yyyy_mm().replace("-", "")}_${personName}.zip`
              );
            });
          });
        }

        self.flag_downloadingExecl = false;
      },
      headerCellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize:18px";
      },
      cellStyle(row, column, rowIndex, columnIndex) {
        return "padding: 0 0 0 0;fontSize:18px;";
      },
      formatBase64ToImgTag(desireWidth, desireHeight, base64ImageString) {
        const self = this;
        if (base64ImageString.length > 0)
          return `<img width="${desireWidth}" height="${desireHeight}" src="data:image/jpeg;base64,${base64ImageString}">`;
        return `<img width="${desireWidth}" height="${desireHeight}" src="${self.value_emptyPhoto}">`;
      },

      formatDurationTime(timestamp) {
        let ret = timestamp;

        let t = Math.floor(ret / 1000);
        let s = t - (60 * Math.floor(t / 60));
        t -= s; t = t / 60;

        let m = 0;
        if (t > 0) {
          m = t - (60 * Math.floor(t / 60));
          t -= m;
        }

        let h = 0;
        if (t > 0)
          h = Math.floor(t / 60);

        if ((h <= 0) && (m <= 0))
          ret = "";
        else {
          ret = h + ":";
          ret += (m >= 10 ? m : "0" + m);
        }

        return ret;
      },
      generateFilteredData(sourceData, filter) {
        const self = this;
        const filteredItems =
          filter.length == 0
            ? sourceData
            : sourceData.filter((item) => {
              return (
                item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.extra_info.department.toLowerCase().indexOf(filter.toLowerCase()) >
                -1
              );
            });
        self.value_tablePage.totalResult = filteredItems.length;

        filteredItems.forEach((item) => {
          item["working_time"] = "";
          item["over_time"] = "";

          item["attendanceStatusData"] = self.generateAttendanceStatusData_V2(
            self.value_workingHourSettings,
            item
          );
          item["attendanceStatus"] = self.generateAttendanceStatusTable(
            item["attendanceStatusData"],
            item.uuid
          );

          let totalWorkingTime = 0;
          for (let i = 0; i < item["attendanceStatusData"].attendance_data.working_time.length; i++) {
            totalWorkingTime += item["attendanceStatusData"].attendance_data.working_time[i];
          }

          let totalOverTime = 0;
          for (let i = 0; i < item["attendanceStatusData"].attendance_data.over_time.length; i++) {
            totalOverTime += item["attendanceStatusData"].attendance_data.over_time[i];
          }

          item["working_time"] = self.formatDurationTime(totalWorkingTime);
          item["over_time"] = self.formatDurationTime(totalOverTime);

          item["workingTimeToShow"] = "";
          if (totalWorkingTime > 0)
            item["workingTimeToShow"] += (i18n.formatter.format("WorkingTime") + " : " + self.formatDurationTime(totalWorkingTime));

          if (totalOverTime > 0)
            item["workingTimeToShow"] += ("<br>" + i18n.formatter.format("Overtime") + " : " + self.formatDurationTime(totalOverTime));
          // const detailsButtonId = "actionOnDetails_" + item.uuid;
          // item['details'] = [
          //   `<div align="left">`,
          //   `<button type="submit" style="width:30px;height:30px;background-color:Transparent;border-radius:4px;border:solid 1px;color:#20a8d8;"`,
          //   `id="${detailsButtonId}">`,
          //   `<i class="fa fa-list"/>`,
          //   `</button>`,
          //   `</div>`
          // ].join("");


          item["attendanceStatusText"] =
            i18n.formatter.format("NoRecord") + " : " + item.no_record + "<br>" +
            i18n.formatter.format("LatePerson") + " : " + item.late + "<br>" +
            i18n.formatter.format("LeaveEarly") + " : " + item.early + "<br>" +
            i18n.formatter.format("NoEntryRecord") + " : " + item.no_entry + "<br>" +
            i18n.formatter.format("NoLeaveRecord") + " : " + item.no_leave + "<br>" +
            i18n.formatter.format("OvertimeDays") + " : " + item.overtime + "<br>";

        });
        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
          self.value_tablePage.currentPage * self.value_tablePage.pageSize
        );
        sliceList.forEach((item) => {
          const detailsButtonId = "actionOnDetails_" + item.uuid;
          item["details"] = [
            `<div align="center">`,
            // `<button type="submit" style="width:28px;height:28px;background-color:Transparent;border-radius:4px;border:solid 1px;color:#20a8d8;"`,
            `<button type="submit" class="btn btn-outline-primary btn-detail"`,
            `id="${detailsButtonId}">`,
            `<i class="fa fa-list"/>`,
            `</button>`,
            `</div>`,
          ].join("");

          item["person"] = item.name + "<br>" + item.id;
          item["groups"] = eval(item.group_list).join("<br>");

          item["clockDate"] = self.value_specifiedMonth.mmyyyy();
        });
        self.value_showAllPerson = i18n.formatter.format("AllPerson") + " : " +
          self.value_allTableItems.length;
        self.value_showLatePerson = i18n.formatter.format("LatePerson") + " : " +
          self.value_allTableItems.filter((p) => { return p.late > 0; }).length;
        self.value_showLeaveEarlyPerson = i18n.formatter.format("LeaveEarly") + " : " +
          self.value_allTableItems.filter((p) => { return p.early > 0; }).length;
        self.value_showNoRecordPerson = i18n.formatter.format("NoRecord") + " : " +
          self.value_allTableItems.filter((p) => { return p.no_record > 0; }).length;
        self.value_showGoodRecordsPerson = i18n.formatter.format("GoodRecords") + " : " +
          self.value_allTableItems.filter((p) => { return p.early == 0 && p.late == 0 && p.no_record == 0; }).length;

        return Object.assign([], sliceList);
      },
      generateFilteredDataForDetailData(sourceData, filter) {
        const self = this;
        const filteredItems =
          filter.length == 0
            ? sourceData
            : sourceData.filter((item) => {
              return (
                item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
              );
            });
        self.value_tablePageForDetailData.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (self.value_tablePageForDetailData.currentPage - 1) *
          self.value_tablePageForDetailData.pageSize,
          self.value_tablePageForDetailData.currentPage *
          self.value_tablePageForDetailData.pageSize
        );
        sliceList.forEach((item) => {
          //console.log( item )
          item["nameToShow"] = item.name;
          let d = new Date(item.timestamp);
          item["clockTime"] = d.yyyy_mm_dd_HHMMSS();

          switch (item.verify_mode) {
            case 1:
              item["clockMode"] = i18n.formatter.format("ClockModeCard");
              break;
            case 2:
              item["clockMode"] = i18n.formatter.format("ClockModePass");
              break;
            case 3:
              item["clockMode"] = i18n.formatter.format("ClockModeClockIn");
              break;
            case 4:
              item["clockMode"] = i18n.formatter.format("ClockModeClockOut");
              break;
            default:
              item["clockMode"] = i18n.formatter.format("None");
              break;
          }
          item["groups"] = eval(item.group_list).join(", ");

          let showimageId = item.face_image_id
            ? item.face_image_id.f + item.face_image_id.uuid
            : "";
          if (showimageId.length > 0) {
            item[
              "showimage"
            ] = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==' width='100' height='100'>`;
            self.$globalFetchVerifyPhoto(item.face_image_id, function (error, data) {
              if (error == null && data) {
                item["imageb64"] = data.face_image;

                var ele = document.getElementById(showimageId);
                if (ele) ele.src = `data:image/jpeg;base64,${data.face_image}`;
              }
            });
          } else
            item[
              "showimage"
            ] = `<img src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==' width='100' height='100'>`;
          item["imageb64"] = "";
        });
        return Object.assign([], sliceList);
      },
      refreshTableItems(cb) {
        const self = this;

        if (self.onFetchPersonDataCallback) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          self.onFetchPersonDataCallback(function (
            errorOnPersonTable,
            resetPersonTable,
            morePersonItem,
            personTableItems
          ) {
            if (!errorOnPersonTable) {
              if (resetPersonTable) {
                self.value_allTableItems = [];
                self.value_dataItemsToShow = [];
              }
              if (personTableItems) {
                self.value_allTableItems = self.value_allTableItems.concat(
                  personTableItems
                );
              }
              if (!morePersonItem) {
                let uuidList = [];
                self.value_allTableItems.forEach((person) => {
                  uuidList.push(person.uuid);
                });

                self.onFetchPersonAttendanceDataCallback(
                  self.value_specifiedMonth,
                  uuidList,
                  function (errorOnPersonVr, resetPersonVr, morePersonVr, personVrItems) {
                    if (personVrItems && personVrItems.length > 0) {
                      //console.log(personVrItems )
                      self.value_allTableItems.forEach((person) => {
                        const dataListOnUuid = personVrItems.filter((vr) => {
                          return vr.uuid == person.uuid;
                        });
                        dataListOnUuid.forEach((d) => {
                          if (!person["attendance_data_list"])
                            person["attendance_data_list"] = [];
                          if (
                            !person.attendance_data_list.find(
                              (att) => att.verify_uuid == d.verify_uuid
                            )
                          ) {
                            person["attendance_data_list"].push({
                              id: d.id,
                              name: d.name,
                              department: person["extra_info"]["department"],
                              verify_uuid: d.verify_uuid,
                              timestamp: d.timestamp,
                              yyyymmdd: new Date(d.timestamp).yyyy_mm_dd(),
                              temperature: d.temperature == 0 ? "" : d.temperature + "°C",
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
                        self.value_searchingFilter
                      );
                      if (self.obj_loading) self.obj_loading.hide();
                      if (cb) cb();
                    }
                  }
                );
              }

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
          this.value_searchingFilter
        );
      },
      handlePageChangeForDetailData({ currentPage, pageSize }) {
        this.value_tablePageForDetailData.currentPage = currentPage;
        this.value_tablePageForDetailData.pageSize = pageSize;
        this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
          this.value_attendanceDataListToReview,
          this.value_searchingFilter
        );
      },
      selectAllEvent({ checked, records }) {
        // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
      },
      selectChangeEvent({ checked, records }) {
        // console.log(checked ? '勾选事件' : '取消事件', records)
      },
      getSelectEvent() {
        let selectRecords = this.$refs.attMainTable.getCheckboxRecords();
        //console.log(selectRecords);
      },
      generateAttendanceStatusData_V2(workingHourSettings, item) {
        //////////////////////////////////////////////////
        const defined_clockin_time_hour = workingHourSettings.defined_clockin_time_hour;
        const defined_clockin_time_min = workingHourSettings.defined_clockin_time_min || 0;
        const defined_clockin_time_buffer_mins = workingHourSettings.defined_clockin_time_buffer_mins || 30;
        const defined_clockin_time_late_enabled = workingHourSettings.defined_clockin_time_late_enabled || true;
        const defined_clockin_adjustment_enabled = workingHourSettings.defined_clockin_adjustment_enabled || false;

        const defined_clockout_time_hour = workingHourSettings.defined_clockout_time_hour;
        const defined_clockout_time_min = workingHourSettings.defined_clockout_time_min || 0;
        const defined_clockout_time_buffer_mins = workingHourSettings.defined_clockout_time_buffer_mins || 30;
        const defined_clockout_time_early_leave_enabled = workingHourSettings.defined_clockout_time_early_leave_enabled || true;
        const defined_clockout_adjustment_enabled = workingHourSettings.defined_clockout_adjustment_enabled || false;

        const defined_overtime_enabled = workingHourSettings.defined_overtime_enabled || true;
        const defined_overtime_time_hour = workingHourSettings.defined_overtime_time_hour;
        const defined_overtime_time_min = workingHourSettings.defined_overtime_time_min || 0;
        const defined_overtime_minimum_min = workingHourSettings.defined_overtime_minimum_min || 0;

        const defined_break_time_min = workingHourSettings.defined_break_time_mins || 60;

        const specified_holidays = workingHourSettings.specified_holidays;
        const specified_non_holidays = workingHourSettings.specified_non_holidays;
        //////////////////////////////////////////////////
        const self = this;
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
        //console.log("defined_clockin_time_hour",defined_clockin_time_hour )
        const clockInTime = defined_clockin_time_hour * msHour + defined_clockin_time_min * msMin;
        const clockInTimeBuffer = defined_clockin_time_buffer_mins * msMin;
        const clockOutTime = defined_clockout_time_hour * msHour + defined_clockout_time_min * msMin;
        const clockOutTimeBuffer = defined_clockout_time_buffer_mins * msMin;

        const breakTime = defined_break_time_min * msMin;
        const overTime = defined_overtime_time_hour * msHour + defined_overtime_time_min * msMin;
        const overTimeBuffer = defined_overtime_minimum_min * msMin;

        const startTimeOfMonth = new Date(
          self.value_specifiedMonth.getFullYear(),
          self.value_specifiedMonth.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        const endTimeOfMonth = new Date(
          self.value_specifiedMonth.getFullYear(),
          self.value_specifiedMonth.getMonth() + 1,
          1,
          0,
          0,
          0,
          0
        );
        const daysOnMonth = (endTimeOfMonth - startTimeOfMonth) / msDay;

        let returnData = {
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
            over_time: []
          },
        };

        for (let i = 0; i < daysOnMonth; i++) {
          const tDayStart = new Date(startTimeOfMonth.getTime() + i * msDay);
          const tDayStartTs = tDayStart.getTime();
          const tDayEndTs = tDayStartTs + msDay - 1;
          const timeToCheckClockIn = tDayStartTs + clockInTime < Date.now();
          const timeToCheckClockOut = tDayStartTs + clockOutTime < Date.now();
          const timeToCheckOverTime = tDayStartTs + overTime < Date.now();

          let holiday = false;
          for (let j = 0; j < specified_holidays.length; j++) {
            if (
              specified_holidays[j].date_time >= tDayStartTs &&
              specified_holidays[j].date_time <= tDayEndTs
            ) {
              holiday = true;
              break;
            }
          }
          if (holiday == false) {
            const dayIdx = tDayStart.getDay();
            if (dayIdx == 0 || dayIdx == 6) holiday = true;
          }
          for (let k = 0; k < specified_non_holidays.length; k++) {
            if (
              specified_non_holidays[k].date_time >= tDayStartTs &&
              specified_non_holidays[k].date_time <= tDayEndTs
            ) {
              holiday = false;
              break;
            }
          }
          if (holiday) returnData.date.monthly_holiday_index.push(1);
          else returnData.date.monthly_holiday_index.push(0);

          if (attRecList) {
            let passModeRecord = attRecList.filter((attRec) => {
              return (
                attRec.timestamp >= tDayStartTs &&
                attRec.timestamp <= tDayEndTs &&
                attRec.verify_mode != 3 &&
                attRec.verify_mode != 4
              );
            });
            let clockInModeRecord = attRecList.filter((attRec) => {
              return (
                attRec.timestamp >= tDayStartTs &&
                attRec.timestamp <= tDayEndTs &&
                attRec.verify_mode == 3
              );
            });
            let clockOutModeRecord = attRecList.filter((attRec) => {
              return (
                attRec.timestamp >= tDayStartTs &&
                attRec.timestamp <= tDayEndTs &&
                attRec.verify_mode == 4
              );
            });

            passModeRecord.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            clockInModeRecord.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            clockOutModeRecord.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });

            let clockInStatus = _STATUS_NONE;
            let clockOutStatus = _STATUS_NONE;

            let clockInTimeStamp = 0;
            let clockOutTimeStamp = 0;
            let overTimeStartStamp = 0;
            let overTimeEndStamp = 0;

            if (!item["no_record"]) item["no_record"] = 0;
            if (!item["late"]) item["late"] = 0;
            if (!item["early"]) item["early"] = 0;
            if (!item["no_entry"]) item["no_entry"] = 0;
            if (!item["no_leave"]) item["no_leave"] = 0;
            if (!item["overtime"]) item["overtime"] = 0;

            // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show

            let firstClockInRec = {};
            if (clockInModeRecord.length > 0) {
              firstClockInRec = clockInModeRecord[0];

              if (defined_clockin_time_late_enabled) {
                if (firstClockInRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
                  // show on time
                  clockInStatus = _STATUS_SHOW_ON_TIME;
                } else {
                  // too late to show
                  clockInStatus = _STATUS_LATE;
                }
              }
              else {
                // show on time
                clockInStatus = _STATUS_SHOW_ON_TIME;
              }

              clockInTimeStamp = firstClockInRec.timestamp;
              if ((defined_clockin_adjustment_enabled) && (firstClockInRec.timestamp < tDayStartTs + clockInTime)) {
                clockInTimeStamp = tDayStartTs + clockInTime;
                firstClockInRec.timestamp = clockInTimeStamp;
              }
            }

            let lastClockOutRec = {};
            if (clockOutModeRecord.length > 0) {
              lastClockOutRec = clockOutModeRecord[clockOutModeRecord.length - 1];

              if (defined_clockout_time_early_leave_enabled) {
                if (lastClockOutRec.timestamp >= tDayStartTs + clockOutTime - clockOutTimeBuffer) {
                  // leave on time
                  clockOutStatus = _STATUS_LEAVE_ON_TIME;
                } else {
                  // too early to leave
                  clockOutStatus = _STATUS_EARLY;
                }
              }
              else {
                // leave on time
                clockOutStatus = _STATUS_LEAVE_ON_TIME;
              }

              if (defined_overtime_enabled) {
                if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
                  // over time
                  // clockOutStatus = _STATUS_OVER_TIME;

                  overTimeStartStamp = tDayStartTs + overTime + overTimeBuffer;
                  overTimeEndStamp = lastClockOutRec.timestamp;

                  if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;
                }
              }

              clockOutTimeStamp = lastClockOutRec.timestamp;
              if ((defined_clockout_adjustment_enabled) && (lastClockOutRec.timestamp > tDayStartTs + clockOutTime)) {
                clockOutTimeStamp = tDayStartTs + clockOutTime;
                lastClockOutRec.timestamp = clockOutTimeStamp;
              }
            }

            // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6: overTime
            if (clockInStatus == _STATUS_NONE) {
              if (passModeRecord.length > 0) {
                // 拿第一筆當作上班打卡的資料
                firstClockInRec = passModeRecord[0];

                if (defined_clockin_time_late_enabled) {
                  if (firstClockInRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
                    // show on time
                    clockInStatus = _STATUS_SHOW_ON_TIME;
                  } else {
                    // too late to show
                    clockInStatus = _STATUS_LATE;
                  }
                }
                else {
                  // show on time
                  clockInStatus = _STATUS_SHOW_ON_TIME;
                }

                clockInTimeStamp = firstClockInRec.timestamp;
                if ((defined_clockin_adjustment_enabled) && (firstClockInRec.timestamp < tDayStartTs + clockInTime)) {
                  clockInTimeStamp = tDayStartTs + clockInTime;
                  firstClockInRec.timestamp = clockInTimeStamp;
                }
              } else if (!holiday && timeToCheckClockIn) {
                clockInStatus = _STATUS_NO_SHOW; // no show
              }
              //console.log("timeToCheckClockIn", timeToCheckClockIn )
            }

            if (timeToCheckClockOut && clockOutStatus == _STATUS_NONE) {
              // 如有剩下的資料, 當作下班打卡資料
              if (passModeRecord.length > 0) {
                lastClockOutRec = passModeRecord[passModeRecord.length - 1];

                if (defined_clockout_time_early_leave_enabled) {
                  if (lastClockOutRec.timestamp >= tDayStartTs + clockOutTime - clockOutTimeBuffer) {
                    // leave on time
                    clockOutStatus = _STATUS_LEAVE_ON_TIME;
                  } else {
                    // too early to leave
                    clockOutStatus = _STATUS_EARLY;
                  }
                }
                else {
                  // leave on time
                  clockOutStatus = _STATUS_LEAVE_ON_TIME;
                }

                if (defined_overtime_enabled) {
                  if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
                    // over time
                    // clockOutStatus = _STATUS_OVER_TIME;

                    overTimeStartStamp = tDayStartTs + overTime + overTimeBuffer;
                    overTimeEndStamp = lastClockOutRec.timestamp;

                    if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;
                  }
                }

                clockOutTimeStamp = lastClockOutRec.timestamp;
                if ((defined_clockout_adjustment_enabled) && (lastClockOutRec.timestamp > tDayStartTs + clockOutTime)) {
                  clockOutTimeStamp = tDayStartTs + clockOutTime;
                  lastClockOutRec.timestamp = clockOutTimeStamp;
                }
              } else if (!holiday) {
                clockOutStatus = _STATUS_NO_SHOW; // no show
              }
            }

            if (!holiday && clockInStatus == _STATUS_LATE) item.late++;
            if (!holiday && clockOutStatus == _STATUS_EARLY) item.early++;
            if ((!holiday && clockInStatus == _STATUS_NO_SHOW) || clockOutStatus == _STATUS_NO_SHOW) item.no_record++;

            if (!holiday && clockInStatus == _STATUS_NO_SHOW) item.no_entry++;
            if (!holiday && clockOutStatus == _STATUS_NO_SHOW) item.no_leave++;
            if (!holiday && overTimeStartStamp > 0) item.overtime++;

            returnData.attendance_data.clock_in_record.push(firstClockInRec);
            returnData.attendance_data.clock_in_status.push(clockInStatus);

            returnData.attendance_data.clock_out_record.push(lastClockOutRec);
            returnData.attendance_data.clock_out_status.push(clockOutStatus);

            let workingTime = clockOutTimeStamp - clockInTimeStamp - breakTime;
            returnData.attendance_data.working_time.push(workingTime > 0 ? workingTime : 0);

            returnData.attendance_data.over_time_record.push({ overTimeStartStamp, overTimeEndStamp });
            returnData.attendance_data.over_time.push(overTimeEndStamp - overTimeStartStamp > 0 ? overTimeEndStamp - overTimeStartStamp : 0);
          }
        }

        return returnData;
      },
      generateAttendanceStatusTable(attendanceData, personUuid) {
        const self = this;
        const tableBordderSize = "1";
        const tableBordderColor = "#9799a1";
        const cellBgColor = "#fff";
        const holidayColorOnHeader = "#e0e0e0";
        const workdayColorOnHeader = "#fff";

        // 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show
        const attendanceStatusColor = [
          "#fff",
          "#57bd37",
          "#57bd37",
          "#f7ca46",
          "#f7ca46",
          "#d8cde3",
        ];
        const attendanceNoStatusColor = cellBgColor;

        let headerDataString = "";
        let bodyDataStringClockIn = "";
        let bodyDataStringClockOut = "";
        for (let i = 0; i < attendanceData.date.days; i++) {
          let isHoliday = false;
          let colorToAppend = "";
          if (attendanceData.date.monthly_holiday_index.length > i) {
            if (attendanceData.date.monthly_holiday_index[i] == 1) {
              isHoliday = true;
            }
          }

          if (isHoliday) colorToAppend = holidayColorOnHeader;
          else colorToAppend = workdayColorOnHeader;

          let dateNum = i + 1;
          let date = i < 9 ? "0" + dateNum.toString() : dateNum.toString();
          let divIdTag = ` id="actionOnDayDetails_${personUuid}_${i}"`;
          headerDataString += `<th style="text-align:center;opacity: 1.0;width:24px;font-size: 12px;border: 1px solid ${tableBordderColor};font-family:Arial;padding: 0px 0px;color:#000;background-color:${colorToAppend}">`;
          // headerDataString += `<div style="cursor: pointer;height:25px;margin:-5px 0px; font-size: 6px;" ${divIdTag}><small style="font-size: 8px; letter-spacing: -2px;" class="text-truncate">${
          //   i + 1
          // }</small></div>`;
          headerDataString += `<div style="cursor: pointer;height:25px;margin:-5px 0px; font-size: 6px; color: #606266;" ${divIdTag}>`;
          headerDataString += `<small style="font-size: 8px; " class="text-truncate scheduler-date">${date}</small></div>`;
          headerDataString += "</th>";

          let clockInStatusColor = attendanceNoStatusColor; // no show
          if (!isHoliday) {
            clockInStatusColor =
              self.value_attendanceStatusColor[
              attendanceData.attendance_data.clock_in_status[i]
              ];
          } else if (attendanceData.attendance_data.clock_in_status[i] != 5) {
            clockInStatusColor =
              self.value_attendanceStatusColor[
              attendanceData.attendance_data.clock_in_status[i]
              ];
          }

          //bodyDataStringClockIn += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockInStatusColor};"/></td>`;
          bodyDataStringClockIn += [
            `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor}; ">`,
            `<div style="height:12px;background-color:${clockInStatusColor};"/>`,
            `</td>`,
          ].join("");

          let clockOutStatusColor = attendanceNoStatusColor; // no show
          if (!isHoliday) {
            clockOutStatusColor =
              self.value_attendanceStatusColor[
              attendanceData.attendance_data.clock_out_status[i]
              ];
          } else if (attendanceData.attendance_data.clock_out_status[i] != 5) {
            clockOutStatusColor =
              self.value_attendanceStatusColor[
              attendanceData.attendance_data.clock_out_status[i]
              ];
          }
          bodyDataStringClockOut += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockOutStatusColor};"/></td>`;
        }

        return [
          `<div class="d-flex justify-content-center w-100 my-2" style="height:58px;">`,
          `<table style="border:${tableBordderSize}px solid ${tableBordderColor};margin:10px;"  class="scheduler-table">`,
          `<thead">`,
          `<tr>${headerDataString}</tr>`,
          `</thead>`,
          `<tbody>`,
          `<tr>${bodyDataStringClockIn}</tr>`,
          `<tr>${bodyDataStringClockOut}</tr>`,
          `</tbody>`,
          `</table>`,
          `</div>`,
        ].join("");
      },
      initToggles() {
        const tooltipTriggerList = document.querySelectorAll(
          '[data-coreui-toggle="tooltip"]'
        );
        const tooltipList = [...tooltipTriggerList].map(
          (tooltipTriggerEl) => new coreui.Tooltip(tooltipTriggerEl)
        );
      },
    },
  };
</script>