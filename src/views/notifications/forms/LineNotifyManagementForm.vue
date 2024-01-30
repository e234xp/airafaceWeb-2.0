<template>
  <div>
    <div>
      <CCol
        sm="12"
        class="page_header"
      >
        <td class="h1">
          {{ $t('LineNotifyManagement') }}
        </td>
      </CCol>
    </div>

    <div>
      <CCol
        sm="12"
        class="page_operation"
      >
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
          <div style="width: 20px" />
          <div>
            <CButton
              class="btn btn-danger btn-w-sm mr-3 mb-3"
              size="lg"
              @click="clickOnMultipleDelete()"
            >
              {{ $t('Delete') }}
            </CButton>
          </div>
          <div
            class="d-flex"
            style="margin-left: auto"
          >
            <CInput
              v-model.lazy="value_searchingFilter"
              style="width: 280px"
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
    </div>

    <CCard>
      <CCardBody>
        <div>
          <div id="LineNotifyManagementFrom">
            <vxe-table
              stripe
              ref="mainTable"
              align="center"
              :data="value_dataItemsToShow"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              :edit-config="{ trigger: 'manual', mode: 'row' }"
            >
              <vxe-table-column
                type="checkbox"
                width="5%"
                align="center"
              />
              <!-- <vxe-table-column field="enable" width="10%" :show-overflow="ellipsisMode" :title="$t('Enable')">
                <template #default="{ row }">
                  <label class="switch">
                    <input type="checkbox" :checked="row.enable" @change="(event) => clickOnSwitch(event, row)">
                    <span class="slider round"></span>
                  </label>
                </template>
              </vxe-table-column> -->

              <vxe-table-column
                field="name"
                width="20%"
                :show-overflow="ellipsisMode"
                :title="$t('NotifyName')"
              />
              <vxe-table-column
                field="access_token"
                width="20%"
                :show-overflow="ellipsisMode"
                :title="$t('LineAccessToken')"
              />

              <vxe-table-column
                field="fields"
                width="40%"
                :show-overflow="ellipsisMode"
                :title="$t('ContentField')"
              >
                <template #default="{ row }">
                  {{ displayFields(row) }}
                </template>
              </vxe-table-column>

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
  name: 'LineNotifyManagementForm',
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

      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 4,
        totalResult: 0,
      },

      value_searchingFilter: '',

      ...this.formData,
    };
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mixins: [TableObserver],
  created() { },
  async mounted() {
    this.refreshTableItems();
  },

  updated() { },
  watch: {
    value_searchingFilter: () => {
      this.value_tablePage.currentPage = 1;
      this.generateFilteredData(
        this.value_allTableItems, this.value_searchingFilter,
      );
    },
  },
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
          || (item.access_token && item.access_token.toLowerCase().indexOf(filter.toLowerCase()) > -1)
        ));

      this.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
      );

      // sliceList.forEach((pitem) => {
      //   const item = pitem;
      //   pitem['nameToShow'] = pitem.name;
      // });
      this.value_dataItemsToShow = Object.assign([], sliceList);
    },

    displayFields(row) {
      let { fields } = row;
      if (fields) {
        // console.log('111', fields);
        fields = fields.slice(0, 3).map(
          (item) => this.$t(item),
        );
        // console.log('222', fields);

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
                this.value_allTableItems,
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

      const settingData = {
        uuid: localItem.uuid ? localItem.uuid : undefined,
        name: localItem.name,
        enable: localItem.enable,
        access_token: localItem.access_token,
        fields: localItem.fields,
        note: localItem.note,
      };

      await this.$globalModifyLineNotify(settingData);
    },

    // selectAllEvent({ checked, records }) {
    //   console.log(checked ? '所有勾选事件' : '所有取消事件', records)
    // },

    // selectChangeEvent({ checked, records }) {
    //   console.log(checked ? '勾选事件' : '取消事件', records)
    // },

    clickOnAdd() {
      if (this.onAdd) this.onAdd(this.value_allTableItems);
    },

    clickOnModify(item) {
      if (this.onModify) this.onModify(item);
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
              this.value_allTableItems,
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
