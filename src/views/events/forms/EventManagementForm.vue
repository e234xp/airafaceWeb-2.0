<template>
  <div>
    <div>
      <CCol sm="12">
        <td class="h1">
          {{ $t('EventControlSettingsList') }}
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
                class="btn btn-primary btn-w-sm mr-3 mb-3"
                size="lg"
                @click="clickOnAdd()"
              >
                {{ $t('Add') }}
              </CButton>
            </div>

            <div>
              <CButton
                class="btn btn-danger btn-w-sm mr-3 mb-3"
                size="lg"
                @click="clickOnMultipleDelete()"
                :disabled="!canDelete"
              >
                {{ $t('Delete') }}
              </CButton>
            </div>
            <div
              class="d-flex"
              style="margin-left: auto"
            >
              <CInput
                style="width: 280px"
                size="lg"
                :placeholder="$t('Search')"
                v-model.lazy="value_searchingFilter"
                @input="() => refreshTableItems()"
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
          <div id="EventControlManagement">
            <vxe-table
              stripe
              ref="mainTable"
              align="center"
              :data="value_dataItemsToShow"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              :edit-config="{ trigger: 'manual', mode: 'row' }"
              @checkbox-change="checkboxChange"
              @checkbox-all="selectAllCheckboxChange"
            >
              <vxe-table-column
                type="checkbox"
                width="5%"
                align="center"
              />
              <vxe-table-column
                field="enable"
                width="10%"
                :show-overflow="ellipsisMode"
                :title="$t('Enable')"
              >
                <template #default="{ row }">
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="row.enable"
                      @change="(event) => clickOnSwitch(event, row)"
                    >
                    <span class="slider round" />
                  </label>
                </template>
              </vxe-table-column>
              <vxe-table-column
                field="name"
                width="20%"
                :show-overflow="ellipsisMode"
                :title="$t('SettingName')"
              />
              <vxe-table-column
                field="action_type"
                width="20%"
                :show-overflow="ellipsisMode"
                :title="$t('EventControlType')"
              />
              <vxe-table-column
                field="remarks"
                width="20%"
                :show-overflow="ellipsisMode"
                :title="$t('Note')"
              />

              <vxe-table-column min-width="15%">
                <template #default="{ row }">
                  <div class="d-flex flex-column align-items-center">
                    <vxe-button
                      class="btn-in-cell-primary btn-in-cell"
                      @click="clickOnModify(row)"
                    >
                      {{ $t('Modify') }}
                    </vxe-button>
                    <vxe-button
                      class="btn-in-cell-danger btn-in-cell"
                      @click="clickOnSingleDelete(row)"
                      :disabled="row.enable"
                    >
                      {{ $t('Delete') }}
                    </vxe-button>
                  </div>
                </template>
              </vxe-table-column>
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
  name: 'EventManagementForm',
  props: {
    formData: { type: Object, default: () => { } },
    onAdd: { type: Function, default: () => null },
    onDelete: { type: Function, default: () => null },
    onModify: { type: Function, default: () => null },
    onFetchDataCallback: { type: Function, default: () => null },
  },
  data() {
    return {
      obj_loading: null,
      canDelete: false,

      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },

      value_searchingFilter: '',

      ...this.formData,
    };
  },
  computed: {
    ...mapState(['ellipsisMode']),
    getFilterTableItems() {
      const regex = new RegExp(this.value_searchingFilter, 'gi');
      return this.value_allTableItems.filter(({ name = '' }) => name.match(regex));
    },
  },
  mixins: [TableObserver],
  methods: {
    headerCellStyle() {
      return 'fontSize: 18px;word-break: break-all !important; ';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },
    async generateFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => (
          (item.name && item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
          || (item.host && item.host.toLowerCase().indexOf(filter.toLowerCase()) > -1)
          || (item.sender && item.sender.toLowerCase().indexOf(filter.toLowerCase()) > -1)
          || (item.subject && item.subject.toLowerCase().indexOf(filter.toLowerCase()) > -1)
        ));

      this.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
      );

      this.value_dataItemsToShow = Object.assign([], sliceList);
    },

    displayFields(row) {
      let { fields } = row;
      if (fields) {
        fields = fields.slice(0, 3).map(
          (item) => this.$t(item),
        );

        return fields.join(', ');
      }
      return '';
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
              this.value_allTableItems = this.value_allTableItems.concat(
                tableItems,
              );
              this.generateFilteredData(
                this.getFilterTableItems,
                this.value_searchingFilter,
              );
              this.observeTableSize();
            }
            if (!more && cb) cb();
          } else if (cb) cb();
        });
      } else if (cb) cb();
    },
    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.generateFilteredData(
        this.value_allTableItems, this.value_searchingFilter,
      );
      this.resizeOneTable();
    },

    async clickOnSwitch(event, row) {
      const localItem = row;

      localItem.enable = event.srcElement.checked;

      const sendData = {
        uuid: localItem.uuid,
        data: {
          ...localItem,
        },
      };

      await this.$globalModifyEventHandle(sendData);
    },

    clickOnAdd() {
      if (this.onAdd) this.onAdd(this.value_allTableItems);
    },

    clickOnModify(item) {
      if (this.onModify) this.onModify(item, this.value_allTableItems);
    },

    deleteItem(listToDel) {
      if (this.onDelete) {
        this.onDelete(listToDel, (success) => {
          if (success) {
            listToDel.forEach((deletedItem) => {
              this.value_allTableItems = this.value_allTableItems.filter((
                item,
              ) => item.uuid !== deletedItem.uuid);
            });
            this.generateFilteredData(
              this.getFilterTableItems,
              this.value_searchingFilter,
            );
          }
        });
      }
    },
    clickOnSingleDelete(item) {
      // console.log( 'clickOnSingleDelete', item.uuid )
      const list = [item];
      if (list.length > 0) this.deleteItem([item]);
    },
    clickOnMultipleDelete() {
      const list = this.$refs.mainTable.getCheckboxRecords();
      if (list.length > 0) this.deleteItem(list);
    },
    checkboxChange() {
      this.canDelete = this.$refs.mainTable.getCheckboxRecords().filter((item) => !item.enable).length > 0;
    },
    selectAllCheckboxChange() {
      this.canDelete = this.$refs.mainTable.getCheckboxRecords().filter((item) => !item.enable).length > 0;
    },
  },
  async mounted() {
    this.refreshTableItems();
  },
};
</script>

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #83bae6;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked+.slider {
    background-color: #2196F3;
  }

  input:disabled+.slider {
    background-color: #ccc;
  }

  input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
