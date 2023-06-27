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
              <CButton
                size="lg"
                class="btn btn-primary btn-w-sm mr-3 mb-3"
                @click="clickOnAdd()"
              >
                {{ disp_add }}
              </CButton>
            </div>
            <div style="width: 20px"></div>
            <div>
              <CButton
                class="btn btn-danger btn-w-sm mr-3 mb-3"
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
              @edit-closed="dataHasBeenChangedFun"
              :auto-resize="true"
              keep-source
              highlight-current-row
              :edit-config="{ trigger: 'dblclick', mode: 'row', showStatus: true }"
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
                field="username"
                :title="disp_account"
                width="16%"
                align="left"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="password"
                :title="disp_password"
                width="16%"
                :edit-render="{ type: 'default' }"
                align="left"
              >
                <template #edit="{ row }">
                  <vxe-input v-model="row.password" type="text"></vxe-input>
                </template>
              </vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="permission"
                :title="disp_permission"
                width="14%"
                align="left"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="remarks"
                :title="disp_remarks"
                width="18%"
                align="left"
              ></vxe-table-column>
              <vxe-table-column width="10%">
                <template #default="{ row }">
                  <vxe-button
                    class="btn-remove-vxe btn-in-cell"
                    @click="onClickEdit(row)"
                    >{{ disp_edit }}</vxe-button
                  >
                </template>
              </vxe-table-column>
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
import i18n from "../../i18n";

const defaultlState = () => {
  return {
    value_dataItemsToShow: [],
    value_allTableItems: [],
    value_allTableItems_lastStatus: [],
    value_tablePage: {
      currentPage: 1,
      pageSize: 10,
      totalResult: 0,
    },
    value_searchingFilter: "",
    disp_header: i18n.formatter.format("AccountManagement"),
    disp_account: i18n.formatter.format("Account"),
    disp_password: i18n.formatter.format("Password"),
    disp_permission: i18n.formatter.format("Permission"),
    disp_search: i18n.formatter.format("Search"),
    disp_add: i18n.formatter.format("Add"),
    disp_delete: i18n.formatter.format("Delete"),
    disp_saveChanges: i18n.formatter.format("SaveChanges"),
    disp_remarks: i18n.formatter.format("Remarks"),
    disp_edit: i18n.formatter.format("Modify"),
  };
};
export default {
  name: "AccountManagement",
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  created() {},
  mixins: [TableObserver],
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
    //   console.log("123")
    //   const modifyButtonId = "actionOnModify_" + item.uuid;
    //   document.getElementById( modifyButtonId ).addEventListener( "click", function() {
    //     console.log(item.uuid)
    //     self.clickOnSave( item );
    //   });
    // });

    self.value_dataItemsToShow.forEach((item) => {
      const modifyButtonId = "actionOnModify_" + item.uuid;
      var old_modifyButton = document.getElementById(modifyButtonId);
      var new_modifyButton = old_modifyButton.cloneNode(true);
      old_modifyButton.parentNode.replaceChild(new_modifyButton, old_modifyButton);
      new_modifyButton.addEventListener("click", function () {
        self.clickOnSave(item);
      });
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
    onClickEdit(row) {
      this.$refs.mainTable.setActiveRow(row);
    },

    dataHasBeenChangedFun(tableScopeValue) {},
    checkboxFixed({ row }) {
      return !row.fixed && this.value_dataItemsToShow.length > 1;
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
              return item.username.toLowerCase().indexOf(filter.toLowerCase()) > -1;
            });
      self.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize
      );
      sliceList.forEach((item) => {
        const modifyButtonId = "actionOnModify_" + item.uuid;
        item["actionButton"] =
          '<input type="button" id="' +
          modifyButtonId +
          '" value="' +
          self.disp_saveChanges +
          '"  class="btn btn-outline-primary btn-in-cell p-0"/>';
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      const self = this;
      self.$globalFetchAccountList(function (error, data) {
        if (data) {
          self.value_allTableItems = data.account_list;
          self.value_allTableItems_lastStatus = [];
          self.value_allTableItems.forEach((i) => {
            self.value_allTableItems_lastStatus.push({
              username: i.username,
              password: i.password,
            });
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter
          );
        }
      });
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

    onAdd() {
      const self = this;
      self.$router.push({
        name: "CreateAccount",
        params: {
          value_returnRoutePath: "AccountManagement",
          value_returnRouteName: i18n.formatter.format("Return"),
          value_account_list: self.value_allTableItems,
        },
      });
    },
    clickOnAdd() {
      if (this.onAdd) this.onAdd();
    },
    deleteItem(listToDel) {
      const self = this;
      const accountUuidListToDel = [];
      listToDel.forEach((a) => {
        accountUuidListToDel.push(a.uuid);
      });
      self.$globalRemoveAccount(
        { account_uuid_list: accountUuidListToDel },
        function (err, data) {
          if (!err) {
            self.$fire({
              text: i18n.formatter.format("Successful"),
              type: "success",
              timer: 3000,
            });
            accountUuidListToDel.forEach((deletedItemUuid) => {
              self.value_allTableItems = self.value_allTableItems.filter(function (item) {
                return item.uuid !== deletedItemUuid;
              });
            });
          } else {
            self.$fire({
              text: i18n.formatter.format("OperationFailed"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8",
            });
          }
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter
          );
        }
      );
    },
    clickOnMultipleDelete() {
      const self = this;
      self
        .$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
          confirmButtonText: i18n.formatter.format("Confirm"),
          cancelButtonText: i18n.formatter.format("Cancel"),
          confirmButtonColor: "#20a8d8",
          cancelButtonColor: "#f86c6b",
        })
        .then((v) => {
          const list = self.$refs.mainTable.getCheckboxRecords();
          const listToDel = list.filter(function (item) {
            return !item.fixed;
          });
          self.deleteItem(listToDel);
        })
        .catch((e) => {});
    },
    clickOnSave(item) {
      const self = this;
      const row = self.$refs.mainTable.getRowById(item._XID);
      const lastAccoutInfo = self.value_allTableItems_lastStatus.filter(function (i) {
        return i.username == item.username && i.password !== item.password;
      });

      if (lastAccoutInfo.length > 0) {
        self.$globalModifyAccount(
          {
            username: item.username,
            new_password: item.password,
          },
          function (err, data) {
            if (!err) {
              lastAccoutInfo[0].password = item.password;
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000,
              });
            } else {
              self.$fire({
                text: i18n.formatter.format("OperationFailed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8",
              });
            }

            self.$refs.mainTable.reloadRow(row, {
              uuid: item.uuid,
              username: item.username,
              password: lastAccoutInfo[0].password,
              permission: item.permission,
              create_date: item.create_date,
              last_modify_date: item.last_modify_date,
              actionButton: item.actionButton,
            });
          }
        );
      }
    },
  },
  components: {},
};
</script>
