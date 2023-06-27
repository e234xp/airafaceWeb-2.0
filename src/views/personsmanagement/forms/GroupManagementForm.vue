<template>
  <div>
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>
      <div style="height: 35px"></div>
    </div>
    <div>
      <CCol sm="12">
        <CCol sm="12">
          <CRow>
            <div>
              <CButton class="btn btn-primary mb-3 mr-3" size="lg" @click="clickOnAdd()">
                {{ disp_add }}
              </CButton>
            </div>

            <div>
              <CButton
                class="btn btn-danger mb-3"
                size="lg"
                @click="clickOnMultipleDelete()"
              >
                {{ disp_delete }}
              </CButton>
            </div>
            <div style="margin-left: auto">
              <CInput
                v-model.lazy="value_searchingFilter"
                style="width: 400px"
                size="lg"
                :placeholder="disp_search"
              >
                <template #prepend-content><CIcon name="cil-search" /></template>
              </CInput>
            </div>
          </CRow>
        </CCol>
      </CCol>
      <div style="height: 15px"></div>
    </div>
    <CCard>
      <CCardBody>
        <div>
          <div>
            <vxe-table
              :data="value_dataItemsToShow"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              ref="mainTable"
              :checkbox-config="{ checkMethod: checkboxFixed }"
            >
              <!-- @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" -->

              <vxe-table-column
                type="checkbox"
                width="10%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="nameToShow"
                :title="disp_name"
                width="16%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="numberOfPersonInGroup"
                :title="disp_numberOfPersonInGroup"
                width="12%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="numberOfVisitorInGroup"
                :title="disp_numberOfVisitorInGroup"
                width="12%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="remarks"
                width="14%"
                :title="disp_remarks"
                align="left"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="createDate"
                :title="disp_createDate"
                width="20%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column field="actionButton" title="" type="html" />
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
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
import { mapState } from "vuex";
import TableObserver from "@/utils/TableObserver.vue";
import i18n from "../../../i18n";

const defaultlState = () => {
  return {
    value_dataItemsToShow: [],
    value_allTableItems: [],
    value_tablePage: {
      currentPage: 1,
      pageSize: 9,
      totalResult: 0,
    },
    value_searchingFilter: "",

    disp_name: i18n.formatter.format("GroupName"),
    disp_numberOfPersonInGroup: i18n.formatter.format("NumberOfPersonInGroup"),
    disp_numberOfVisitorInGroup: i18n.formatter.format("NumberOfVisitorInGroup"),
    disp_createDate: i18n.formatter.format("CreateDate"),
    disp_header: i18n.formatter.format("Group"),
    disp_remarks: i18n.formatter.format("Remarks"),
    disp_search: i18n.formatter.format("Search"),
    disp_add: i18n.formatter.format("Add"),
    disp_delete: i18n.formatter.format("Delete"),
    disp_modify: i18n.formatter.format("Modify"),
    disp_checkInfo: i18n.formatter.format("CheckInfo"),
  };
};
export default {
  name: "GroupManagementForm",
  props: {
    formData: Object,
    onAdd: { type: Function },
    onImport: { type: Function },
    onExport: { type: Function },
    onDelete: { type: Function },
    onModify: { type: Function },
    onCheck: { type: Function },
    onFetchDataCallback: { type: Function },
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  mixins: [TableObserver],
  created() {},
  mounted() {
    const self = this;
    self.refreshTableItems();
    this.observeTableSize();
  },
  computed: {
    ...mapState(["ellipsisMode"]),
  },
  updated() {
    const self = this;
    // self.value_dataItemsToShow.forEach( item => {
    //   const modifyButtonId = "actionOnModify_" + item.uuid;
    //   document.getElementById( modifyButtonId ).addEventListener( "click", function() {
    //     self.clickOnModify( item );
    //   });
    // });

    // self.value_dataItemsToShow.forEach(item => {
    //   const modifyButtonId = "actionOnModify_" + item.uuid;
    //   var old_modifyButton = document.getElementById( modifyButtonId );
    //   var new_modifyButton = old_modifyButton.cloneNode(true);
    //   old_modifyButton.parentNode.replaceChild(new_modifyButton, old_modifyButton);
    //   new_modifyButton.addEventListener("click", function () {
    //     self.clickOnModify(item);
    //   });
    // });

    self.value_dataItemsToShow.forEach((item) => {
      const checkButtonId = "actionOnCheck_" + item.uuid;
      const modifyButtonId = "actionOnModify_" + item.uuid;
      var old_modifyButton = document.getElementById(modifyButtonId);
      var old_checkButton = document.getElementById(checkButtonId);
      if (old_checkButton) {
        var new_checkButton = old_checkButton.cloneNode(true);
        old_checkButton.parentNode.replaceChild(new_checkButton, old_checkButton);
        new_checkButton.addEventListener("click", function () {
          self.clickOnCheck(item);
        });
      }
      var old_modifyButton = document.getElementById(modifyButtonId);
      if (old_modifyButton) {
        var new_modifyButton = old_modifyButton.cloneNode(true);
        old_modifyButton.parentNode.replaceChild(new_modifyButton, old_modifyButton);
        new_modifyButton.addEventListener("click", function () {
          self.clickOnModify(item);
        });
      }
    });
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
  methods: {
    checkboxFixed({ row }) {
      return !row.fixed;
    },
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 18px";
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize:18px;";
    },
    generateFilteredData(sourceData, filter) {
      const self = this;

      const filteredItems =
        filter.length == 0
          ? sourceData
          : sourceData.filter((item) => {
              return (
                item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.remarks.toLowerCase().indexOf(filter.toLowerCase()) > -1
              );
            });
      self.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize
      );
      sliceList.forEach((item) => {
        item["nameToShow"] = item.name;
        if (item.no_edit !== true) {
          const modifyButtonId = "actionOnModify_" + item.uuid;
          item["actionButton"] =
            '<input type="button" id="' +
            modifyButtonId +
            '" value="' +
            self.disp_modify +
            '" class="btn btn-outline-primary btn-in-cell p-0"/>';
        } else {
          const checkButtonId = "actionOnCheck_" + item.uuid;
          item["actionButton"] =
            '<input type="button" id="' +
            checkButtonId +
            '" value="' +
            self.disp_checkInfo +
            '" class="btn btn-outline-warning btn-in-cell p-0"/>';
        }
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      const self = this;
      if (self.onFetchDataCallback) {
        self.onFetchDataCallback(function (error, reset, more, tableItems) {
          if (!error) {
            if (reset) {
              self.value_allTableItems = [];
              self.value_dataItemsToShow = [];
            }
            if (tableItems) {
              self.value_allTableItems = self.value_allTableItems.concat(tableItems);
              self.value_dataItemsToShow = self.generateFilteredData(
                self.value_allTableItems,
                self.value_searchingFilter
              );
            }
            if (!more && cb) cb();
          } else if (cb) cb();
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
      this.resizeOneTable();
    },
    // selectAllEvent ({ checked, records }) {
    //   // console.log(checked ? '選擇所有事件' : '取消所有事件', records)
    // },
    // selectChangeEvent ({ checked, records }) {
    //   // console.log(checked ? '選擇事件' : '取消事件', records)
    // },
    // getSelectEvent () {
    //   let selectRecords = this.$refs.mainTable.getCheckboxRecords()
    // },
    clickOnAdd() {
      if (this.onAdd) this.onAdd();
    },
    clickOnImport() {
      if (this.onImport) this.onImport();
    },
    clickOnExport() {
      if (this.onExport) this.onExport();
    },
    deleteItem(listToDel) {
      const self = this;
      if (self.onDelete && listToDel.length > 0) {
        self.onDelete(listToDel, function (success) {
          if (success) {
            listToDel.forEach((deletedItem) => {
              self.value_allTableItems = self.value_allTableItems.filter(function (item) {
                return item.uuid !== deletedItem.uuid;
              });
            });
            self.value_dataItemsToShow = self.generateFilteredData(
              self.value_allTableItems,
              self.value_searchingFilter
            );
          }
        });
      } else
        self.value_dataItemsToShow = self.generateFilteredData(
          self.value_allTableItems,
          self.value_searchingFilter
        );
    },
    clickOnMultipleDelete() {
      const list = this.$refs.mainTable.getCheckboxRecords();
      const listToDel = list.filter(function (item) {
        return !item.fixed;
      });
      this.deleteItem(listToDel);
    },
    clickOnModify(item) {
      if (this.onModify) this.onModify(item);
    },
    clickOnCheck(item) {
      if (this.onCheck) this.onCheck(item);
    },
  },
  components: {},
};
</script>
