<template>
  <div id="wrapper">
    <!-- 搜尋欄跟按鈕 -->
    <div>
      <CCol sm="12">
        <CRow>
          <div style="margin-left: auto">
            <CInput v-model.lazy="value_searchingFilter" style="width: 400px" size="lg" :placeholder="disp_search">
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </div>
        </CRow>
      </CCol>
    </div>
    <!-- 表格 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source highlight-current-row
            :edit-config="{ trigger: 'manual', mode: 'row' }">

            <vxe-table-column type="checkbox" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="name" :title="disp_outputDevices" width="30%"
              align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="group" :title="disp_group" align="center"
              width="auto"></vxe-table-column>

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
            ]" :current-page="value_tablePage.currentPage" :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult" @page-change="handlePageChange">
        </vxe-pager>
      </CCardBody>
    </CCard>


  </div>
</template>

<script>
  import i18n from "@/i18n";
  import { mapState } from "vuex";

  // import VueSelect from 'vue-select';
  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";

  export default {
    name: "AddCamerasStep2Form",
    props: {
      step2form: Object
    },
    data() {
      return {
        localStep2form: { ...this.step2form },

        isChecked: true,

        value_dataItemsToShow: [{ enable: false, name: 'I/O boxes #1', group: 'Clock-in' }, { enable: false, name: 'I/O boxes #2', group: 'Entrance' }],
        value_allTableItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 5,
          totalResult: 0,
        },
        value_searchingFilter: "",

        /*btn */
        disp_search: i18n.formatter.format("Search"),

        /*data table */
        disp_outputDevices: i18n.formatter.format("IOboxes"),
        disp_group: i18n.formatter.format("VideoDevicesGroup"),

        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1, 2, 3]
      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    //預設值
    created() {

    },
    // 拿資料 寫入資料
    watch: {
      // localStep2form: {
      //   handler(newValue) {
      //     console.log('emit updateStep2form')
      //     this.$emit('updateStep2form', { ...newValue });
      //   },
      //   deep: true,
      // },
    },
    methods: {
      //分頁處理
      handlePageChange({ currentPage, pageSize }) {
        const self = this;
        self.value_tablePage.currentPage = currentPage;
        self.value_tablePage.pageSize = pageSize;
        self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems, self.value_searchingFilter);
        self.resizeOneTable();
      },
      refreshTableItems(cb) {
        const self = this;
        if (self.onFetchDataCallback) {
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
      // 判斷欄位空值
      isNotEmpty(value) {
        return value !== null && value !== undefined && value !== '';
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