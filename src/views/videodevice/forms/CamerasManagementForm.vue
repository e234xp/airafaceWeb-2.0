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
      <!-- <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" 
        @click="detailSetting()">
        假按鈕
      </CButton> -->
    </div>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source 
              highlight-current-row :edit-config="{ trigger: 'manual', mode: 'row' }"> 
              <!-- @cell-click="cellClickEvent" -->
            <vxe-table-column type="checkbox" align="center" width="auto"></vxe-table-column>

            <vxe-table-column field="enable" :title="disp_enable" width="auto">
              <template #default="{ row }"> 
                <vxe-switch v-model="row.enable" v-on:change="activeStatusChange(row)"></vxe-switch>
              </template>
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="deviceName" :title="disp_deviceName" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="status" :title="disp_status" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="ipAddress" :title="disp_ipAddress" width="auto" align="center">
            </vxe-table-column>
            
            <vxe-table-column :show-overflow="ellipsisMode" field="in" :title="disp_In" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="out" :title="disp_out" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column min-width="13%">
              <template #default="{ row }">
                <div class="d-flex flex-column align-items-center">
                  <vxe-button class="btn-in-cell-primary btn-in-cell" @click="clickOnModify(row)">{{ disp_modify
                    }}</vxe-button>

                  <!-- <vxe-button class="btn-in-cell-danger btn-in-cell" @click="clickOnSingleDelete(row)">{{ disp_delete
                    }}</vxe-button> -->
                </div>
              </template>
            </vxe-table-column>
            
          </vxe-table>
        </div>
        <!-- <vxe-table-column field="enable" :title="disp_enable" min-width="12%">
            <template #default="{ row }"> 
              <vxe-switch v-model="row.enable" v-on:change="activeStatusChange(row)"></vxe-switch>
            </template>
        </vxe-table-column> -->

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
    name: "CamerasManagementForm",
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

        disp_header: i18n.formatter.format("VideoDeviceCameras"),
        disp_search: i18n.formatter.format("Search"),
        disp_add: i18n.formatter.format("Add"),
        disp_delete: i18n.formatter.format("Delete"),
        disp_modify: i18n.formatter.format("Modify"),


        /*data table */
        disp_enable: i18n.formatter.format("Enable"),
        disp_deviceName: i18n.formatter.format("DeviceName"),
        disp_status: i18n.formatter.format("DeviceStatus"),
        disp_ipAddress: i18n.formatter.format("IpAddress"),
        disp_In: i18n.formatter.format("EnableIn"),
        disp_out: i18n.formatter.format("EnableOut"),

      };
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    async mounted() {
      const self = this;

      // let ret = await self.$globalGetGroupList();
      // if (!ret.error) {
      //   ret.group_list.forEach((g) => {
      //     self.value_personGroupList.push(g.name);
      //   });
      // }

      self.refreshTableItems();
    },
    methods: {
      cellClickEvent({row}) {
        console.log(row)
        this.$router.push("AddCameras");
      },
      //分頁處理
      handlePageChange({ currentPage, pageSize }) {
        const self = this;
        this.value_tablePage.currentPage = currentPage;
        this.value_tablePage.pageSize = pageSize;
        this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
        this.resizeOneTable();
      },
      updated() {
        const self = this;
        self.value_dataItemsToShow.forEach((item) => {
          if (new_modifyButton)
            new_modifyButton.addEventListener("click", function () {
              self.clickOnModify(item);
            });
        });
      },
      refreshTableItems(cb) {
        const self = this;
        if (self.onFetchDataCallback) {
          self.onFetchDataCallback(function (error, reset, more, tableItems) {
            if (!error) {
              console.log(234,"成功")
              if (reset) {
                self.value_allTableItems = [];
                self.value_dataItemsToShow = [];
              }
              if (tableItems) {
                self.value_allTableItems = self.value_allTableItems.concat(tableItems);
                self.generateFilteredData(
                  self.value_allTableItems,
                  self.value_searchingFilter
                );
                self.observeTableSize();
              }
              if (!more && cb) cb();
            } else if (cb) {
              cb()
              console.log(234,"失敗") 
            } ;
          });
        } else if (cb) {
          cb()
          console.log(234,"失敗") 
        };
      },

      // 表格資料處理及搜尋
      generateFilteredData(sourceData, filter) {
        const self = this;

        //關鍵字搜尋  item.name裡面看有沒有找到filter
        const filteredItems = self.value_keyword.length == 0 ? sourceData : sourceData.filter((item) => {
                return (
                  item.name.toLowerCase().indexOf(self.value_keyword.toLowerCase()) > -1
                );
              });

        self.value_tablePage.totalResult = filteredItems.length; /**總筆數 */

        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
          self.value_tablePage.currentPage * self.value_tablePage.pageSize
        );
        console.log(sliceList,"sliceListABCS")
        return Object.assign([], sliceList);
      },
      // 新增
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
        if (list.length > 0) this.deleteItem([item]);
      },
      clickOnMultipleDelete() {
        const list = this.$refs.mainTable.getCheckboxRecords();
        if (list.length > 0) this.deleteItem(list);
      },
      clickOnModify(item) {
        if (this.onModify) this.onModify(item);
      },
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
  