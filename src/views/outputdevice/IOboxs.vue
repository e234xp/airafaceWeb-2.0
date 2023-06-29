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
              <CButton size="lg" class="btn btn-primary mr-3 mb-3" >
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
          <vxe-table :data="value_dataItemsToShow"  stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source
              highlight-current-row>

            <vxe-table-column type="checkbox" align="center" width="auto"></vxe-table-column>

            <vxe-table-column field="enable" :title="disp_enable" width="auto">
              <template #default="{ row }"> 
                <vxe-switch v-model="row.enable" v-on:change="activeStatusChange(row)"></vxe-switch>
              </template>
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="name" :title="disp_deviceName" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="timestamp" :title="disp_status" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="remark" :title="disp_ipAddress" width="auto" align="center">
            </vxe-table-column>
            
            <vxe-table-column :show-overflow="ellipsisMode" field="modifier" :title="disp_In" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="remark1" :title="disp_out" width="auto" align="center">
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
    name: 'IOboxs',
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

        disp_header: i18n.formatter.format("OutputDeviceRelays"),
        disp_search: i18n.formatter.format("Search"),
        disp_add: i18n.formatter.format("Add"),
        disp_delete: i18n.formatter.format("Delete"),


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
    methods: {
      //分頁處理
      handlePageChange({ currentPage, pageSize }) {
        const self = this;
        this.value_tablePage.currentPage = currentPage;
        this.value_tablePage.pageSize = pageSize;
        //this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
        this.resizeOneTable();
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
      clickOnAdd() {
        console.log("ADD")
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
  

