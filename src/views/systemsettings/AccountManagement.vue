<template>
  <div>
    <CRow>
      <CCol sm="12">
        <td class="h1">
          {{ $t('AccountManagement') }}
        </td>
      </CCol>
    </CRow>
    <div style="height: 20px" />

    <CRow>
      <CCol sm="12" class="d-flex">
        <div>
          <CButton size="lg" class="btn btn-primary btn-w-sm mr-3 mb-3" @click="clickOnAdd()">
            {{ $t('Add') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton class="btn btn-danger btn-w-sm mr-3 mb-3" size="lg" @click="clickOnMultipleDelete()">
            {{ $t('Delete') }}
          </CButton>
        </div>
        <div style="margin-left: auto">
          <CInput v-model.lazy="value_searchingFilter" style="width: 400px" size="lg" :placeholder="$t('Search')">
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
              :edit-config="{ trigger: 'dblclick', mode: 'row', showStatus: true }" column-config-use-key="false"
              column-key="false" :checkbox-config="{ checkMethod: checkboxFixed }">
              <!-- @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" -->

              <vxe-table-column type="checkbox" width="10%" align="center" />
              <vxe-table-column :show-overflow="ellipsisMode" field="username" :title="$t('Account')" width="16%"
                align="left" />
              <vxe-table-column :show-overflow="ellipsisMode" field="maskpassword" :title="$t('Password')" width="16%"
                :edit-render="{ type: 'default' }" align="left">
                <template #edit="{ row }">
                  <vxe-input v-model="row.password" type="password" />
                </template>
              </vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="permission" :title="$t('Permission')" width="14%"
                align="left" />
              <vxe-table-column :show-overflow="ellipsisMode" field="remarks" :title="$t('Remarks')" width="18%"
                align="left" />
              <vxe-table-column width="10%">
                <template #default="{ row }">
                  <vxe-button class="btn-remove-vxe btn-in-cell" @click="onClickEdit(row)">
                    {{ $t('Modify') }}
                  </vxe-button>
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
            :total="value_tablePage.totalResult" @page-change="handlePageChange" />
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
  import { mapState } from 'vuex';
  import TableObserver from '@/utils/TableObserver.vue';

  export default {
    name: 'AccountManagement',
    data() {
      return {
        value_dataItemsToShow: [],
        value_allTableItems: [],
        value_allTableItems_lastStatus: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        },
        value_searchingFilter: '',

        ...this.formData,
      };
    },
    created() { },
    mixins: [TableObserver],
    mounted() {
      this.refreshTableItems();
      this.observeTableSize();
    },
    computed: {
      ...mapState(['ellipsisMode']),
    },
    updated() {
      this.value_dataItemsToShow.forEach((item) => {
        const localItem = item;
        localItem.maskpassword = '********';

        const modifyButtonId = `actionOnModify_${localItem.uuid}`;
        const oldModifyButton = document.getElementById(modifyButtonId);
        const newModifyButton = oldModifyButton.cloneNode(true);
        oldModifyButton.parentNode.replaceChild(newModifyButton, oldModifyButton);
        newModifyButton.addEventListener('click', () => {
          this.clickOnSave(localItem);
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
        const filteredItems = filter.length === 0
          ? sourceData
          : sourceData.filter((item) => item.username.toLowerCase().indexOf(filter.toLowerCase()) > -1);
        this.value_tablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
          this.value_tablePage.currentPage * this.value_tablePage.pageSize,
        );
        sliceList.forEach((pItem) => {
          const item = pItem;

          const modifyButtonId = `actionOnModify_${item.uuid}`;
          item.actionButton = `<input type='button' id='${modifyButtonId}'`
            + ` value='${this.$t('SaveChanges')}' class='btn btn-outline-primary btn-in-cell p-0'/>`;
        });
        return Object.assign([], sliceList);
      },
      refreshTableItems() {
        this.$globalFetchAccountList((error, data) => {
          if (data) {
            this.value_allTableItems = data.account_list;
            this.value_allTableItems_lastStatus = [];
            this.value_allTableItems.forEach((i) => {
              this.value_allTableItems_lastStatus.push({
                username: i.username,
                password: i.password,
              });
            });
            this.value_dataItemsToShow = this.generateFilteredData(
              this.value_allTableItems,
              this.value_searchingFilter,
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
        this.$router.push({
          name: 'CreateAccount',
          params: {
            value_returnRoutePath: 'AccountManagement',
            value_returnRouteName: this.$t('Return'),
            value_account_list: this.value_allTableItems,
          },
        });
      },
      clickOnAdd() {
        if (this.onAdd) this.onAdd();
      },
      deleteItem(listToDel) {
        const accountUuidListToDel = [];
        listToDel.forEach((a) => {
          accountUuidListToDel.push(a.uuid);
        });
        this.$globalRemoveAccount(
          { account_uuid_list: accountUuidListToDel },
          (err) => {
            if (!err) {
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
              accountUuidListToDel.forEach((deletedItemUuid) => {
                this.value_allTableItems = this.value_allTableItems.filter((item) => item.uuid !== deletedItemUuid);
              });
            } else {
              this.$fire({
                text: this.$t('OperationFailed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
            this.value_dataItemsToShow = this.generateFilteredData(
              this.value_allTableItems,
              this.value_searchingFilter,
            );
          },
        );
      },
      clickOnMultipleDelete() {
        this
          .$confirm('', this.$t('ConfirmToDelete'), {
            confirmButtonText: this.$t('Confirm'),
            cancelButtonText: this.$t('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          })
          .then(() => {
            const list = this.$refs.mainTable.getCheckboxRecords();
            const listToDel = list.filter((item) => !item.fixed);
            this.deleteItem(listToDel);
          })
          .catch((e) => {
            console.log('clickOnMultipleDelete', e);
          });
      },
      clickOnSave(item) {
        const row = this.$refs.mainTable.getRowById(item._XID);
        const lastAccoutInfo = this.value_allTableItems_lastStatus.filter((i) => i.username === item.username && i.password !== item.password);

        if (lastAccoutInfo.length > 0) {
          this.$globalModifyAccount(
            {
              username: item.username,
              new_password: item.password,
            },
            (err) => {
              if (!err) {
                lastAccoutInfo[0].password = item.password;
                this.$fire({
                  text: this.$t('Successful'),
                  type: 'success',
                  timer: 3000,
                });
              } else {
                this.$fire({
                  text: this.$t('OperationFailed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }

              this.$refs.mainTable.reloadRow(row, {
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