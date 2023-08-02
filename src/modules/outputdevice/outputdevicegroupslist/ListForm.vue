<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>
      <div style="height: 35px"></div>
    </div>
     <!-- 搜尋欄跟按鈕 -->
     <div>
      <CCol sm="12">
        <CRow>
            <div>
              <CButton size="lg" class="btn btn-primary mr-3 mb-3" @click="clickOnAdd()">
                {{ disp_add }}
              </CButton>
            </div>
            <div>
              <CButton  class="btn btn-danger mb-3" size="lg" @click="clickOnMultipleDelete()">
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
                <template #prepend-content>
                  <CIcon name="cil-search" />
                </template>
              </CInput>
            </div>
        </CRow>
      </CCol>
    </div>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source
              highlight-current-row :edit-config="{ trigger: 'manual', mode: 'row' }">

            <vxe-table-column type="checkbox" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="group" :title="disp_group" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="videoDevices" :title="disp_videoDevices" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="outputDevices" :title="disp_outputDevices" width="30%" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="rules" :title="disp_rules" width="auto" align="center">
            </vxe-table-column>

            <!-- 刪除、修改按鈕 -->
            <vxe-table-column min-width="8%" >
              <template #default="{ row }">
                <div class="d-flex flex-column align-items-center">
                  <vxe-button class="btn-in-cell-primary btn-in-cell" @click="clickOnModify(row)"> {{ disp_modify
                    }}</vxe-button>

                  <vxe-button class="btn-in-cell-danger btn-in-cell" @click="clickOnSingleDelete(row)">{{ disp_delete
                    }}</vxe-button>
                </div>
              </template>
            </vxe-table-column>

            <!-- <vxe-table-column field="enable" :title="disp_enable" min-width="12%">
                <template #default="{ row }"> 
                  <vxe-switch v-model="row.enable" v-on:change="activeStatusChange(row)"></vxe-switch>
                </template>
            </vxe-table-column> -->
            
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
          ]" 
          :current-page="value_tablePage.currentPage" 
          :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult" 
          @page-change="handlePageChange">
        </vxe-pager>
      </CCardBody>
    </CCard>

  </div>
</template>
  
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  export default {
    name: "OutputDeviceGroupsForm",
    props: {
      formData: Object,
      onAdd: { type: Function },
      onDelete: { type: Function },
      onModify: { type: Function },
      onFetchDataCallback: { type: Function },
    },
    data() {
      return {
        value_dataItemsToShow: [{enable:false,name:'',timestamp:'',remark:'',modifier:'',remark1:''}],
        value_allTableItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 5,
          totalResult: 0,
        },
        value_searchingFilter: "",

        // btn
        disp_header: i18n.formatter.format("NewDeviceGroups"),
        disp_search: i18n.formatter.format("Search"),
        disp_add: i18n.formatter.format("Add"),
        disp_delete: i18n.formatter.format("Delete"),
        disp_modify: i18n.formatter.format("Modify"),


        /*data table */
        disp_group: i18n.formatter.format("VideoDevicesGroup"),
        disp_videoDevices: i18n.formatter.format("IOboxes"),
        disp_outputDevices: i18n.formatter.format("Wiegandboxs"),
        disp_rules: i18n.formatter.format("Rules"),

      };
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    methods: {
      //分頁處理
      handlePageChange({ currentPage, pageSize }) {
        const self = this;
        self.value_tablePage.currentPage = currentPage;
        self.value_tablePage.pageSize = pageSize;
        self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems,self.value_searchingFilter);
        self.resizeOneTable();
      },
      refreshTableItems(cb) {
        const self = this;
        if(self.onFetchDataCallback) {
        self.onFetchDataCallback(function (error, reset, more, tableItems) {
            // console.log("Form",error, reset, more, tableItems)
            // console.log("FormDT", tableItems)
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
                // console.log(self.value_allTableItems,"value_allTableItems")
                // console.log(self.value_dataItemsToShow,"value_dataItemsToShow")
              }
              if (!more && cb) cb();
            } else if (cb) cb();
          });
        } else if (cb) cb();
      },
      // 表格資料處理及搜尋
      generateFilteredData(sourceData, filter) {
        const self = this;

        //關鍵字搜尋  item.name裡面看有沒有找到filter
        const filteredItems = filter.length == 0 ? sourceData : sourceData.filter((item) => {
                return (
                  item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
                );
              });

        self.value_tablePage.totalResult = filteredItems.length; /**總筆數 */

        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
          self.value_tablePage.currentPage * self.value_tablePage.pageSize
        );

        return Object.assign([], sliceList);
      },
      clickOnAdd() {
        if (this.onAdd) this.onAdd(this.value_allTableItems);
      },
      deleteItem(listToDel) {
        const self = this;
        if (self.onDelete) {
          self.onDelete(listToDel, function (success) {
            if (success) {
              listToDel.forEach((deletedItem) => {
                self.value_allTableItems = self.value_allTableItems.filter(function (item) {
                  return item.uuid !== deletedItem.uuid;
                });
              });
              self.generateFilteredData(
                self.value_allTableItems,
                self.value_searchingFilter
              );
            }
          });
        }
      },
      clickOnSingleDelete(item) {
        //console.log( "clickOnSingleDelete", item.uuid )
        const list = [item];
        //console.log( "list", list )
        if (list.length > 0) this.deleteItem([item]);
      },
      clickOnMultipleDelete() {
        const self = this;
        const list = this.$refs.mainTable.getCheckboxRecords();
        if (list.length > 0) {
          self.$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
            confirmButtonText: i18n.formatter.format("Confirm"),
            cancelButtonText: i18n.formatter.format("Cancel"),
            confirmButtonColor: "#20a8d8",
            cancelButtonColor: "#f86c6b",
          })
          .then((v) => {
            //self.deleteItem(list);
          })
          .catch((e) => {
            if (cb) cb(false);
          });
        }
      },
      clickOnModify(item) {
        console.log("修改",item)
        if (this.onModify) this.onModify(item);
      },
      //切換 enable 開關
      activeStatusChange(item) {
        console.log("ABC")
      },
      headerCellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize: 18px";
      },
        cellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize:18px;";
      },
    },
  }
</script>
  