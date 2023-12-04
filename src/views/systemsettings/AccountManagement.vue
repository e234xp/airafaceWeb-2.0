<template>
  <div>
    <CRow>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>
    </CRow>
    <div style="height: 20px"></div>

    <CRow>
      <CCol sm="12" class='d-flex'>
        <div>
          <CButton size="lg" class="btn btn-primary btn-w-sm mr-3 mb-3" @click="clickOnAdd()">
            {{ disp_add }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-danger btn-w-sm mr-3 mb-3" size="lg" @click="clickOnMultipleDelete()">
            {{ disp_delete }}
          </CButton>
        </div>
        <div style="margin-left: auto">
          <CInput v-model.lazy="value_searchingFilter" style="width: 400px" size="lg" :placeholder="disp_search">
            <template #prepend-content>
              <CIcon name="cil-search" />
            </template>
          </CInput>
        </div>
      </CCol>
    </CRow>

    <CCard>
      <CCardBody>
        <div>
          <div>
            <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
              :header-cell-style="headerCellStyle" ref="mainTable" @edit-closed="dataHasBeenChangedFun"
              :auto-resize="true" keep-source highlight-current-row
              :edit-config="{ trigger: 'dblclick', mode: 'row', showStatus: true }" column-config.useKey=false
              column-key=false :checkbox-config="{ checkMethod: checkboxFixed }">
              <!-- @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" -->

              <vxe-table-column type="checkbox" width="10%" align="center"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="username" :title="disp_account" width="16%"
                align="left"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="maskpassword" :title="disp_password" width="16%"
                :edit-render="{ type: 'default' }" align="left">
                <template #edit="{ row }">
                  <vxe-input v-model="row.password" type="password"></vxe-input>
                </template>
              </vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="permission" :title="disp_permission" width="14%"
                align="left"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="remarks" :title="disp_remarks" width="18%"
                align="left"></vxe-table-column>
              <vxe-table-column width="10%">
                <template #default="{ row }">
                  <vxe-button class="btn-remove-vxe btn-in-cell" @click="onClickEdit(row)">{{ disp_edit }}</vxe-button>
                </template>
              </vxe-table-column>
              <vxe-table-column field="actionButton" title="" type="html" />
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
  </div>
</template>
<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

const defaultlState = () => ({
  value_dataItemsToShow: [],
  value_allTableItems: [],
  value_allTableItems_lastStatus: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
  value_searchingFilter: '',
  disp_header: i18n.formatter.format('AccountManagement'),
  disp_account: i18n.formatter.format('Account'),
  disp_password: i18n.formatter.format('Password'),
  disp_permission: i18n.formatter.format('Permission'),
  disp_search: i18n.formatter.format('Search'),
  disp_add: i18n.formatter.format('Add'),
  disp_delete: i18n.formatter.format('Delete'),
  disp_saveChanges: i18n.formatter.format('SaveChanges'),
  disp_remarks: i18n.formatter.format('Remarks'),
  disp_edit: i18n.formatter.format('Modify'),
});
export default {
  name: 'AccountManagement',
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  created() { },
  mixins: [TableObserver],
  mounted() {
    const self = this;
    self.refreshTableItems();
    this.observeTableSize();
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  updated() {
    const self = this;

    self.value_dataItemsToShow.forEach((item) => {
      const localItem = item;
      localItem.maskpassword = '********';

      const modifyButtonId = `actionOnModify_${localItem.uuid}`;
      const oldModifyButton = document.getElementById(modifyButtonId);
      const newModifyButton = oldModifyButton.cloneNode(true);
      oldModifyButton.parentNode.replaceChild(newModifyButton, oldModifyButton);
      newModifyButton.addEventListener('click', () => {
        self.clickOnSave(localItem);
      });
    });
  },
  watch: {
    value_searchingFilter: () => {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter,
      );
    },
  },
  methods: {
    onClickEdit(row) {
      this.$refs.mainTable.setActiveRow(row);
    },

    dataHasBeenChangedFun(tableScopeValue) {
      console.log('dataHasBeenChangedFun', tableScopeValue);
    },

    checkboxFixed({ row }) {
      return !row.fixed && this.value_dataItemsToShow.length > 1;
    },
    // headerCellStyle(row, column, rowIndex, columnIndex) {
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    // cellStyle(row, column, rowIndex, columnIndex) {
    cellStyle() {
      return 'fontSize:18px;';
    },
    generateFilteredData(sourceData, filter) {
      const self = this;

      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => item.username.toLowerCase().indexOf(filter.toLowerCase()) > -1);
      self.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize,
      );
      sliceList.forEach((pItem) => {
        const item = pItem;

        const modifyButtonId = `actionOnModify_${item.uuid}`;
        item.actionButton = `<input type='button' id='${modifyButtonId}'`
          + ` value='${self.disp_saveChanges}' class='btn btn-outline-primary btn-in-cell p-0'/>`;
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems() {
      const self = this;
      self.$globalFetchAccountList((error, data) => {
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
            self.value_searchingFilter,
          );
        }
      });
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

    onAdd() {
      const self = this;
      self.$router.push({
        name: 'CreateAccount',
        params: {
          value_returnRoutePath: 'AccountManagement',
          value_returnRouteName: i18n.formatter.format('Return'),
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
        (err) => {
          if (!err) {
            self.$fire({
              text: i18n.formatter.format('Successful'),
              type: 'success',
              timer: 3000,
            });
            accountUuidListToDel.forEach((deletedItemUuid) => {
              self.value_allTableItems = self.value_allTableItems.filter((item) => item.uuid !== deletedItemUuid);
            });
          } else {
            self.$fire({
              text: i18n.formatter.format('OperationFailed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter,
          );
        },
      );
    },
    clickOnMultipleDelete() {
      const self = this;
      self
        .$confirm('', i18n.formatter.format('ConfirmToDelete'), {
          confirmButtonText: i18n.formatter.format('Confirm'),
          cancelButtonText: i18n.formatter.format('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        })
        .then(() => {
          const list = self.$refs.mainTable.getCheckboxRecords();
          const listToDel = list.filter((item) => !item.fixed);
          self.deleteItem(listToDel);
        })
        .catch((e) => {
          console.log('clickOnMultipleDelete', e);
        });
    },
    clickOnSave(item) {
      const self = this;
      const row = self.$refs.mainTable.getRowById(item._XID);
      const lastAccoutInfo = self.value_allTableItems_lastStatus.filter((i) => i.username === item.username && i.password !== item.password);

      if (lastAccoutInfo.length > 0) {
        self.$globalModifyAccount(
          {
            username: item.username,
            new_password: item.password,
          },
          (err) => {
            if (!err) {
              lastAccoutInfo[0].password = item.password;
              self.$fire({
                text: i18n.formatter.format('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else {
              self.$fire({
                text: i18n.formatter.format('OperationFailed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
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
          },
        );
      }
    },
  },
  components: {},
};
</script>
