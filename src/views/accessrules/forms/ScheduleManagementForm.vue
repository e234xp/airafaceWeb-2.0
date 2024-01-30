<template>
  <div>
    <div>
      <CCol sm="12">
        <td class="h1">
          {{ disp_header }}
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
                {{ disp_add }}
              </CButton>
            </div>

            <div>
              <CButton
                class="btn btn-danger btn-w-sm mr-3 mb-3"
                size="lg"
                @click="clickOnMultipleDelete()"
              >
                {{ disp_delete }}
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
                :placeholder="disp_search"
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
          <div id="LineNotifyManagementFrom">
            <vxe-table
              stripe
              ref="mainTable"
              align="left"
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
              <!-- <vxe-table-column field="enable" width="10%" :show-overflow="ellipsisMode" :title="disp_enable">
                <template #default="{ row }">
                  <label class="switch">
                    <input type="checkbox" :checked="row.enable" @change="(event) => clickOnSwitch(event, row)">
                    <span class="slider round"></span>
                  </label>
                </template>
              </vxe-table-column> -->
              <vxe-table-column
                field="name"
                width="25%"
                :show-overflow="ellipsisMode"
                :title="disp_name"
              />
              <vxe-table-column
                field="type"
                width="40%"
                :show-overflow="ellipsisMode"
                :title="disp_recurrent"
              >
                <template #default="{ row }">
                  {{ row.type == 'recurrent' ? $t('ScheduleRecurrent'): $t('ScheduleNonrecurrent') }}
                </template>
              </vxe-table-column>
              <vxe-table-column
                min-width="15%"
                align="center"
              >
                <template #default="{ row }">
                  <div class="d-flex flex-column align-items-center">
                    <vxe-button
                      class="btn-in-cell-primary btn-in-cell"
                      @click="clickOnModify(row)"
                    >
                      {{ disp_modify }}
                    </vxe-button>
                    <vxe-button
                      class="btn-in-cell"
                      :class="[usedList.indexOf(row.uuid) >= 0 ? 'btn-in-cell-disabled' : 'btn-in-cell-danger']"
                      :disabled="usedList.indexOf(row.uuid) >= 0"
                      @click="clickOnSingleDelete(row)"
                    >
                      {{ disp_delete }}
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
import i18n from '@/i18n';

const defaultlState = () => ({
  obj_loading: null,

  value_dataItemsToShow: [],
  value_allTableItems: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 4,
    totalResult: 0,
  },
  disp_header: i18n.formatter.format('ScheduleManagement'),
  disp_search: i18n.formatter.format('Search'),
  disp_add: i18n.formatter.format('Add'),
  disp_delete: i18n.formatter.format('Delete'),
  disp_modify: i18n.formatter.format('Modify'),

  disp_enable: i18n.formatter.format('Enable'),
  disp_name: i18n.formatter.format('Schedule'),
  disp_recurrent: i18n.formatter.format('ScheduleType'),
  // disp_fields: i18n.formatter.format('ContentField'),

  value_searchingFilter: '',
});

export default {
  name: 'ScheduleManagementForm',
  props: {
    formData: { type: Object, default: () => { } },
    onAdd: { type: Function, default: () => null },
    onDelete: { type: Function, default: () => null },
    onModify: { type: Function, default: () => null },
    onFetchDataCallback: { type: Function, default: () => null },
    onFetchActionCallback: { type: Function, default: () => null },
  },
  data() {
    // return Object.assign({}, defaultlState(), this.formData);
    const cloneObject = {
      usedList: [],
    };
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mixins: [TableObserver],
  created() { },
  async mounted() {
    const self = this;

    self.refreshTableItems();
    self.refreshActionItems();
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
      const self = this;
      const filteredItems = filter.length === 0
        ? sourceData
        : sourceData.filter((item) => (
          (item.name && item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
        ));

      self.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize,
      );

      // sliceList.forEach((pitem) => {
      //   const item = pitem;
      //   pitem['nameToShow'] = pitem.name;
      // });
      self.value_dataItemsToShow = Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      const self = this;
      if (self.onFetchDataCallback) {
        self.onFetchDataCallback((error, reset, more, tableItems) => {
          if (!error) {
            if (reset) {
              self.value_allTableItems = [];
              self.value_dataItemsToShow = [];
            }
            if (tableItems) {
              self.value_allTableItems = self.value_allTableItems.concat(
                tableItems,
              );
              self.generateFilteredData(
                self.value_allTableItems,
                self.value_searchingFilter,
              );
              self.observeTableSize();
            }
            if (!more && cb) cb();
          } else if (cb) cb();
        });
      } else if (cb) cb();
    },
    refreshActionItems() {
      if (this.onFetchActionCallback) {
        this.onFetchActionCallback((error, reset, more, tableItems) => {
          if (!error) this.usedList.push(...tableItems.map((item) => item.condition.schedule));
        });
      }
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
      const self = this;
      const localItem = row;

      localItem.enable = event.srcElement.checked;

      const settingData = {
        uuid: localItem.uuid ? localItem.uuid : undefined,
        name: localItem.name,
        enable: localItem.enable,
        type: localItem.type,
        start_date: localItem.start_date,
        end_date: localItem.end_date,
        times: localItem.times,
      };

      await self.$globalModifySchedule(settingData);
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
      const self = this;
      const canDelete = listToDel.every((item) => self.usedList.indexOf(item.uuid) < 0);
      if (!canDelete) {
        self.$fire({
          title: i18n.formatter.format('ScheduleUsed'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
        return;
      }
      if (self.onDelete) {
        self.onDelete(listToDel, (success) => {
          if (success) {
            listToDel.forEach((deletedItem) => {
              self.value_allTableItems = self.value_allTableItems.filter((
                item,
              ) => item.uuid !== deletedItem.uuid);
            });
            self.generateFilteredData(
              self.value_allTableItems,
              self.value_searchingFilter,
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
