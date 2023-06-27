<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ disp_header }}
      </div>
      <div style="height: 30px"></div>
      <CCol sm="12">
        <CRow>
          <div class="mb-3 d-flex align-items-center">
            <date-picker
              style="width: 400px"
              :lang="this.$globalDatePickerLanguage"
              v-model="value_specifiedDatetimeRange"
              type="datetime"
              range
              :placeholder="disp_selectDatetimeRange"
              @change="datePickerDatachange()"
            ></date-picker>
            <CButton
              class="btn btn-secondary btn-icon p-0 ml-2 mt-0"
              @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton"
            >
              <CIcon name="cil-search" />
            </CButton>
          </div>
          <div style="margin-left: auto">
            <CInput
              v-model.lazy="value_searchingFilter"
              style="width: 400px"
              size="lg"
              :placeholder="disp_search"
            >
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </div>
        </CRow>
      </CCol>
      <CCard>
        <CCardBody>
          <div>
            <vxe-table
              :data="value_dataItemsToShow"
              height="531"
              columns-height="100"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              ref="mainTable"
            >
              <vxe-table-column
                field="dateTime"
                :title="disp_dateTime"
                width="30%"
                style="font: 10px"
                align="center"
              >
              </vxe-table-column>
              <vxe-table-column
                field="log_level"
                :title="disp_logLevel"
                width="30%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column
                field="data"
                :title="disp_info"
                width="40%"
                align="left"
              ></vxe-table-column>
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
          >
          </vxe-pager>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import i18n from "../../i18n";
import TableObserver from "@/utils/TableObserver.vue";

Date.prototype.yyyymmdd_HHMMSS = function () {
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

export default {
  name: "UpgradeSoftware",
  data() {
    return {
      obj_loading: null,
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      param_cardStyle: "height: 39rem;",
      disp_header: i18n.formatter.format("SystemLog"),
      disp_dateTime: i18n.formatter.format("Time"),
      disp_logLevel: i18n.formatter.format("Level"),
      disp_info: i18n.formatter.format("Info"),
      disp_search: i18n.formatter.format("Search"),
      disp_selectDatetimeRange: i18n.formatter.format("SelectDatetimeRange"),
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_searchingFilter: "",
      value_dataTotalLength: 0,
      value_specifiedDatetimeRange: [null, null],
      flag_enableSearchButton: false,
    };
  },

  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  mixins: [TableObserver],
  mounted() {
    this.observeTableSize();
  },
  created() {
    const self = this;
    let endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    let endTimeTimestamp = endTime.getTime();
    let startTimeTimestamp = endTimeTimestamp - 86400000 * 7 + 1;

    self.value_specifiedDatetimeRange[0] = new Date(startTimeTimestamp);
    self.value_specifiedDatetimeRange[1] = endTime;
    self.queryData(startTimeTimestamp, endTimeTimestamp);
  },

  watch: {
    value_searchingFilter: function (value) {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter
      );
    },
  },
  components: {},
  methods: {
    clickOnSearch() {
      const self = this;
      self.flag_enableSearchButton = false;
      const startTime = self.value_specifiedDatetimeRange[0];
      const endTime = self.value_specifiedDatetimeRange[1];
      if (startTime != null && endTime != null) {
        self.queryData(startTime.getTime(), endTime.getTime(), function () {});
      }
    },
    datePickerDatachange() {
      const self = this;
      self.flag_enableSearchButton = true;
    },
    queryData(startTime, endTime, cb) {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
      self.$globalQuerySystemLog(
        {
          start_time: startTime,
          end_time: endTime,
          slice_shift: 0,
          slice_length: 10000,
          level_list: ["info", "warning", "error"],
        },
        function (error, data) {
          if (self.obj_loading) self.obj_loading.hide();
          self.value_allTableItems = data.result.data;
          self.value_dataTotalLength = data.result.total_length;
          self.value_allTableItems.sort(function (a, b) {
            if (a.timestamp < b.timestamp) return 1;
            if (a.timestamp > b.timestamp) return -1;
            return 0;
          });
          self.value_allTableItems.forEach((item) => {
            item["dateTime"] = new Date(item.timestamp).yyyymmdd_HHMMSS();
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter
          );
          self.value_tablePage.currentPage = 1;
          if (cb) cb();
        }
      );
    },
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter
      );
      this.resizeOneTable();
    },
    generateFilteredData(sourceData, filter) {
      const self = this;
      const filteredItems =
        filter.length == 0
          ? sourceData
          : sourceData.filter((item) => {
              return (
                item.dateTime.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.log_level.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.data.toLowerCase().indexOf(filter.toLowerCase()) > -1
              );
            });
      self.value_tablePage.totalResult = self.value_dataTotalLength; //filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize
      );
      return Object.assign([], sliceList);
    },
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 18px";
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize:18px;overflow:hidden;white-space:nowrap;text-overflow: ellipsis;";
    },
  },
};
</script>

<style>
.mx-input {
  padding: 0.5rem 1rem;
  font-size: 1.09375rem;
  height: calc(1.5em + 1rem + 2px);
  border-color: #d8dbe0;
}
</style>
