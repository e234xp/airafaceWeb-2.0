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
              <CButton size="lg" class="btn btn-primary mr-3 mb-3" @click="handleOnAdd()">
                {{ disp_add }}
              </CButton>
            </div>
            <div>
              <CButton  class="btn btn-danger mb-3" size="lg" @click="handleOnMultipleDelete()">
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
          <vxe-table 
            :data="value_dataItemsToShow"  
            stripe
            align="center"
            :cell-style="
              () => {
                return 'fontSize:18px;';
              }
            "
            :header-cell-style="
              () => {
                return 'fontSize:18px;';
              }
            "
            ref="mainTable" 
            :auto-resize="true"
            keep-source
            highlight-current-row
            :edit-config="{ trigger: 'manual', mode: 'row' }"
          >

            <vxe-table-column type="checkbox" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="group" :title="disp_group" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="videoDevices" :title="disp_videoDevices" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="outputDevices" :title="disp_outputDevices" width="auto" align="center">
            </vxe-table-column>
            
            <vxe-table-column :show-overflow="ellipsisMode" field="rules" :title="disp_rules" width="auto" align="center">
            </vxe-table-column>

            <!-- 刪除、修改按鈕 -->
            <vxe-table-column min-width="8%">
              <template #default="{ row }">
                <div class="d-flex flex-column align-items-center">
                  <vxe-button class="btn-in-cell-primary btn-in-cell" @click="handleOnModify(row)">{{ disp_modify
                    }}</vxe-button>

                  <vxe-button class="btn-in-cell-danger btn-in-cell" @click="handleOnSingleDelete(row)">{{ disp_delete
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
      name: "videoDeviceGroups",
      mixins: [TableObserver],
      props: {
        onAdd: { type: Function },
        onDelete: { type: Function },
        onModify: { type: Function },
        onGetItems: { type: Function },
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
          disp_header: i18n.formatter.format("NewVideoDeviceGroups"),
          disp_search: i18n.formatter.format("Search"),
          disp_add: i18n.formatter.format("Add"),
          disp_delete: i18n.formatter.format("Delete"),
          disp_modify: i18n.formatter.format("Modify"),
  
  
          /*data table */
          disp_group: i18n.formatter.format("VideoDevicesGroup"),
          disp_videoDevices: i18n.formatter.format("Cameras"),
          disp_outputDevices: i18n.formatter.format("Tablets"),
          disp_rules: i18n.formatter.format("Rules"),
          
        };
      },
      // updated() {
      //   const self = this;

      //   self.value_dataItemsToShow.forEach((item) => {
      //     const modifyButtonId = "actionOnModify_" + item.uuid;
      //     const deleteButtonId = "actionOnDelete_" + item.uuid;

      //     let new_deleteButton = null;
      //     let new_modifyButton = null;
      //     let old_deleteButton = document.getElementById(deleteButtonId);
      //     let old_modifyButton = document.getElementById(modifyButtonId);
      //     if (old_deleteButton && old_deleteButton.parentNode) {
      //       new_deleteButton = old_deleteButton.cloneNode(true);
      //       old_deleteButton.parentNode.replaceChild(
      //         new_deleteButton,
      //         old_deleteButton
      //       );
      //     }

      //     if (old_modifyButton && old_modifyButton.parentNode) {
      //       new_modifyButton = old_modifyButton.cloneNode(true);
      //       old_modifyButton.parentNode.replaceChild(
      //         new_modifyButton,
      //         old_modifyButton
      //       );
      //     }

      //     if (new_deleteButton)
      //       new_deleteButton.addEventListener("click", function () {
      //         self.handleOnSingleDelete(item);
      //       });
      //     if (new_modifyButton)
      //       new_modifyButton.addEventListener("click", function () {
      //         self.handleOnModify(item);
      //       });
      //   });
      // },
      computed: {
        ...mapState(["ellipsisMode"]),
      },
      watch: {
        value_searchingFilter: function () {
          const self = this;
          self.value_tablePage.currentPage = 1;
          this.value_dataItemsToShow = this.generateFilteredData(
            this.value_allTableItems,
            this.value_searchingFilter
          );
        },
      },
      async mounted() {
        const self = this;
        self.refreshTableItems();
      },
      methods: {
        //分頁處理
        handlePageChange({ currentPage, pageSize }) {
          this.value_tablePage.currentPage = currentPage;
          this.value_tablePage.pageSize = pageSize;
          this.value_dataItemsToShow = this.generateFilteredData(
            this.value_allTableItems,
            this.value_searchingFilter
          );
        },
        async refreshTableItems() {
          const self = this;
          const tableItems = await self.onGetItems();

          self.value_allTableItems = self.value_allTableItems.concat(tableItems);
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter
          );
        },
        // 表格資料處理及搜尋
        generateFilteredData(sourceData, filter) {
          const self = this;

          //關鍵字搜尋  item.name裡面看有沒有找到filter ip_address
          const filteredItems =
            filter.length == 0
              ? sourceData
              : sourceData.filter((item) => {
                  return (
                    item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                    item.ip_address.toLowerCase().indexOf(filter.toLowerCase()) > -1
                  );
                });
          self.value_tablePage.totalResult = filteredItems.length; /**總筆數 */

          const sliceList = filteredItems.slice(
            (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
            self.value_tablePage.currentPage * self.value_tablePage.pageSize
          );

          return Object.assign([], sliceList);
        },
        handleOnAdd() {
          this.onAdd(this.value_allTableItems);
        },
        handleOnModify(item) {
          this.onModify(item);
        },
        deleteItem(listToDel) {
          const self = this;

          self.onDelete(listToDel, function (success) {
            if (!success) return;

            const uuidsToDel = listToDel.map(({ uuid }) => uuid);
            self.value_allTableItems = self.value_allTableItems.filter((item) => {
              return !uuidsToDel.includes(item.uuid);
            });

            self.value_dataItemsToShow = self.generateFilteredData(
              self.value_allTableItems,
              self.value_searchingFilter
            );
          });
        },
        handleOnSingleDelete(item) {
          const self = this;

          if (!item) return;
          self.deleteItem([item]);
        },
        handleOnMultipleDelete() {
          const self = this;
          const list = this.$refs.mainTable.getCheckboxRecords();

          if (list.length === 0) return;

          self.deleteItem(list);
        },
        activeStatusChange() {
          console.log("ABC");
        },
      }
    }
  </script>
    