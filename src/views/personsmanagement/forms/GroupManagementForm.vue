<template>
  <div>
    <div>
      <CCol sm="12">
        <td class="h1">
          {{ $t('Group') }}
        </td>
      </CCol>
      <div style="height: 35px" />
    </div>
    <div>
      <CCol sm="12">
        <CCol sm="12">
          <CRow>
            <div>
              <CButton
                class="btn btn-primary mb-3 mr-3"
                size="lg"
                @click="clickOnAdd()"
              >
                {{ $t('Add') }}
              </CButton>
            </div>

            <div>
              <CButton
                class="btn btn-danger mb-3"
                size="lg"
                @click="clickOnMultipleDelete()"
              >
                {{ $t('Delete') }}
              </CButton>
            </div>
            <div style="margin-left: auto">
              <CInput
                v-model.lazy="value_searchingFilter"
                style="width: 400px"
                size="lg"
                :placeholder="$t('Search')"
              >
                <template #prepend-content>
                  <CIcon name="cil-search" />
                </template>
              </CInput>
            </div>
          </CRow>
        </CCol>
      </CCol>
      <div style="height: 15px" />
    </div>
    <CCard>
      <CCardBody>
        <div>
          <div>
            <vxe-table
              data="value_dataItemsToShow"
              stripe
              align="center"
              cell-style="cellStyle"
              header-cell-style="headerCellStyle"
              ref="mainTable"
              checkbox-config="{ checkMethod: checkboxFixed }"
            >
              <!-- @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" -->

              <vxe-table-column
                type="checkbox"
                width="10%"
                align="center"
              />
              <vxe-table-column
                show-overflow="ellipsisMode"
                field="nameToShow"
                title="$t('GroupName')"
                width="16%"
                align="center"
              />
              <vxe-table-column
                show-overflow="ellipsisMode"
                field="numberOfPersonInGroup"
                title="$t('NumberOfPersonInGroup')"
                width="12%"
                align="center"
              />
              <vxe-table-column
                show-overflow="ellipsisMode"
                field="numberOfVisitorInGroup"
                title="$t('NumberOfVisitorInGroup')"
                width="12%"
                align="center"
              />
              <vxe-table-column
                show-overflow="ellipsisMode"
                field="remarks"
                width="14%"
                title="$t('Remarks')"
                align="left"
              />
              <vxe-table-column
                show-overflow="ellipsisMode"
                field="createDate"
                title="$t('CreateDate')"
                width="20%"
                align="center"
              />
              <vxe-table-column
                field="actionButton"
                title=""
                type="html"
              />
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
          />
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

export default {
  name: 'GroupManagementForm',
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
    return {

      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      value_searchingFilter: '',
    };
  },
  mixins: [TableObserver],
  created() { },
  mounted() {
    this.refreshTableItems();
    this.observeTableSize();
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  updated() {
    this.value_dataItemsToShow.forEach((item) => {
      const checkButtonId = `actionOnCheck_${item.uuid}`;
      const modifyButtonId = `actionOnModify_${item.uuid}`;
      const deleteButtonId = `actionOnDelete_${item.uuid}`;

      let newCheckButton = null;
      const oldCheckButton = document.getElementById(checkButtonId);
      if (oldCheckButton && oldCheckButton.parentNode) {
        newCheckButton = oldCheckButton.cloneNode(true);
        oldCheckButton.parentNode.replaceChild(newCheckButton, oldCheckButton);
        if (newCheckButton) {
          newCheckButton.addEventListener('click', () => {
            this.clickOnCheck(item);
          });
        }
      }

      let newModifyButton = null;
      const oldModifyButton = document.getElementById(modifyButtonId);
      if (oldModifyButton && oldModifyButton.parentNode) {
        newModifyButton = oldModifyButton.cloneNode(true);
        oldModifyButton.parentNode.replaceChild(newModifyButton, oldModifyButton);

        if (newModifyButton) {
          newModifyButton.addEventListener('click', () => {
            this.clickOnModify(item);
          });
        }
      }

      let newDeleteButton = null;
      const oldDeleteButton = document.getElementById(deleteButtonId);
      if (oldDeleteButton && oldDeleteButton.parentNode) {
        newDeleteButton = oldDeleteButton.cloneNode(true);
        oldDeleteButton.parentNode.replaceChild(newDeleteButton, oldDeleteButton);

        if (newDeleteButton) {
          newDeleteButton.addEventListener('click', () => {
            this.clickOnSingleDelete(item);
          });
        }
      }
    });
  },
  watch: {
    value_searchingFilter() {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter,
      );
    },
  },
  methods: {
    checkboxFixed({ row }) {
      return !row.fixed;
    },
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },
    generateFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => (
          item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.remarks.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || (item.createDate && item.createDate.toLowerCase().indexOf(filter.toLowerCase())) > -1
        ));

      this.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
      );
      sliceList.forEach((item) => {
        const localItem = item;

        localItem.nameToShow = item.name;
        if (item.no_edit !== true) {
          const modifyButtonId = `actionOnModify_${item.uuid}`;
          const deleteButtonId = `actionOnDelete_${item.uuid}`;

          localItem.actionButton = `<input type="button" id="${modifyButtonId}" value="${this.$t('Modify')}"`
            + ' class="btn btn-outline-primary btn-in-cell p-0"/>'
            + '<div style="height:15px;"></div>'
            + `<input type="button" id="${deleteButtonId}" value="${this.$t('Delete')}"`
            + ' class="btn btn-outline-danger btn-in-cell p-0"/>';
        } else {
          const checkButtonId = `actionOnCheck_${item.uuid}`;
          localItem.actionButton = `<input type="button" id="${checkButtonId}" value="${this.$t('CheckInfo')}"`
            + ' class="btn btn-outline-warning btn-in-cell p-0"/>';
        }
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      if (this.onFetchDataCallback) {
        this.onFetchDataCallback((error, reset, more, tableItems) => {
          if (!error) {
            if (reset) {
              this.value_allTableItems = [];
              this.value_dataItemsToShow = [];
            }
            if (tableItems) {
              this.value_allTableItems = this.value_allTableItems.concat(tableItems);
              this.value_dataItemsToShow = this.generateFilteredData(
                this.value_allTableItems,
                this.value_searchingFilter,
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
        this.value_searchingFilter,
      );
      this.resizeOneTable();
    },
    clickOnAdd() {
      if (this.onAdd) this.onAdd();
    },
    deleteItem(listToDel) {
      if (this.onDelete && listToDel.length > 0) {
        this.onDelete(listToDel, (success) => {
          if (success) {
            listToDel.forEach((deletedItem) => {
              this.value_allTableItems = this.value_allTableItems.filter((item) => item.uuid !== deletedItem.uuid);
            });
            this.value_dataItemsToShow = this.generateFilteredData(
              this.value_allTableItems,
              this.value_searchingFilter,
            );
          }
        });
      } else {
        this.value_dataItemsToShow = this.generateFilteredData(
          this.value_allTableItems,
          this.value_searchingFilter,
        );
      }
    },
    clickOnSingleDelete(item) {
      const list = [item];
      if (list.length > 0) {
        this.deleteItem(list);
      }
    },
    clickOnMultipleDelete() {
      const list = this.$refs.mainTable.getCheckboxRecords();
      const listToDel = list.filter((item) => !item.fixed);
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
