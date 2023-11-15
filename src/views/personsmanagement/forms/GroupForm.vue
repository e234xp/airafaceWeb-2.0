<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">{{ disp_header }}</div>
      <stepprogress class="w-step-progress-3" :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
        :passive-color="param_passiveColor" :steps="[disp_inputGroupInfo, disp_selectGroupPerson, disp_complete]"
        :current-step="flag_currentSetp" :line-thickness="param_lineThickness" icon-class="fa fa-check">
      </stepprogress>
    </CCol>
    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <!-- <div style="height:50px;"></div> -->
          <CCol sm="12">
            <table class="table-layout">
              <tr class="table-tr">
                <th class="h5 w-25 table-th">{{ disp_groupName }}</th>
                <th class="h5 table-th" colspan="3">{{ disp_remarks }}</th>
              </tr>
              <tr class="table-tr">
                <td class="table-td">
                  <CInput size="lg" :invalid-feedback="disp_noEmptyNoSpaceNoSpecialRepeat" value=""
                    v-model="value_groupName" placeholder="" :is-valid="groupNameValidator" required
                    :disabled="flag_modifyMode" />
                </td>
                <td class="table-td" colspan="3">
                  <CInput class="mb-form-row" size="lg" v-model="value_remarks" />
                </td>
              </tr>
            </table>
          </CCol>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(1)">
        <CCardBody>
          <CRow>
            <CCol sm="1"> </CCol>
            <!-- 左欄 -->
            <CCol sm="4">
              <CRow class="mt-4">
                <CCol sm="6">
                  <div class="h3" style="font-weight: 800">
                    {{ disp_allPerson }}
                  </div>
                </CCol>

                <!-- 人員列表 人員、訪客切換 -->
                <CCol sm="6">
                  <segmented-control :options="segmetionOptions" :defaultSelectedOptionIdx="0" label="name"
                    value="value" color="#fff" active-color="#20a8d8" :multiple="false" @select="onSelectType" />
                </CCol>
              </CRow>

              <div class="mt-4">
                <CInput v-model.lazy="value_searchingFilterForAll" class="w-100" size="lg" :placeholder="disp_search">
                  <template #prepend-content>
                    <CIcon name="cil-search" />
                  </template>
                </CInput>
              </div>
              <vxe-table id="AllTable" :data="value_allItemsToShow" stripe :cell-style="cellStyle"
                :header-cell-style="headerCellStyle" ref="allTable" show-header-overflow empty-text=" ">
                <vxe-table-column type="checkbox" min-width="20%" align="center"></vxe-table-column>
                <vxe-table-column show-overflow field="id" :title="disp_id" min-width="40%"
                  align="left"></vxe-table-column>
                <vxe-table-column show-overflow field="name" :title="disp_name" min-width="40%"
                  align="left"></vxe-table-column>
              </vxe-table>
              <vxe-pager class="h-theme-pager" :layouts="[
                  'PrevJump',
                  'PrevPage',
                  'Number',
                  'NextPage',
                  'NextJump',
                  'FullJump',
                  'Total',
                ]" :current-page="value_allTablePage.currentPage" :page-size="value_allTablePage.pageSize"
                :total="value_allTablePage.totalResult" @page-change="handleAllPageChange">
              </vxe-pager>
            </CCol>
            <!-- 中間欄 -->
            <CCol sm="2" class="d-flex flex-column justify-content-center">
              <CButton class="btn btn-outline-primary w-100 mb-4" @click="clickOnInsert()">
                <span class="mr-3">{{ disp_insert }}</span>
                <span>{{ disp_addmark }}</span>
              </CButton>

              <CButton class="btn btn-outline-danger w-100" @click="clickOnRemove()">
                <span class="mr-3">{{ disp_removemark }}</span>
                <span>{{ disp_remove }}</span>
              </CButton>
            </CCol>
            <!-- 右欄 -->
            <CCol sm="4">
              <div class="h3 mt-4 mb-3" style="font-weight: 800">
                {{ disp_selectedPerson }}
              </div>
              <div style="height: 23px"></div>
              <div style="margin-left: auto">
                <CInput v-model.lazy="value_searchingFilterForSelected" style="width: 100%" size="lg"
                  :placeholder="disp_search">
                  <template #prepend-content>
                    <CIcon name="cil-search" />
                  </template>
                </CInput>
              </div>

              <vxe-table :data="value_selectedItemsToShow" stripe show-header-overflow :cell-style="cellStyle"
                :header-cell-style="headerCellStyle" ref="selectedTable" empty-text=" ">
                <vxe-table-column type="checkbox" min-width="20%" align="center"></vxe-table-column>
                <vxe-table-column min-width="40%" show-overflow field="id" :title="disp_id"
                  align="left"></vxe-table-column>
                <vxe-table-column show-overflow min-width="40%" field="name" :title="disp_name"
                  align="left"></vxe-table-column>
              </vxe-table>

              <vxe-pager class="h-theme-pager" :layouts="[
                  'PrevJump',
                  'PrevPage',
                  'Number',
                  'NextPage',
                  'NextJump',
                  'FullJump',
                  'Total',
                ]" :current-page="value_selectedTablePage.currentPage" :page-size="value_selectedTablePage.pageSize"
                :total="value_selectedTablePage.totalResult" @page-change="handleSelectedPageChange">
              </vxe-pager>
            </CCol>
            <CCol sm="1"> </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px"></div>
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">{{ disp_complete }}</p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton variant="outline" class="btn btn-outline-primary btn-w-normal fz-lg" @click="clickOnPrev">{{
            value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary btn-w-normal fz-lg" @click="clickOnPrev">{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary btn-w-normal fz-lg" @click="clickOnNext" :disabled="!flag_groupNamePass">{{
            nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import i18n from '@/i18n';
import TableObserver from '@/utils/TableObserver.vue';
import SegmentedControl from 'vue-segmented-control';
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

const defaultlState = () => ({
  obj_loading: null,
  value_allTablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
  value_selectedTablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
  segmetionOptions: [
    { name: i18n.formatter.format('Person'), value: 'PersonList' },
    { name: i18n.formatter.format('Visitor'), value: 'VisitorList' },
  ],
  param_cardStyle: 'height: 35rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,

  disp_noEmptyNoSpaceNoSpecialRepeat: i18n.formatter.format('NoEmptyNoSpaceNoSpecialRepeat'),
  disp_inputGroupInfo: i18n.formatter.format('InputGroupInfo'),
  disp_selectGroupPerson: i18n.formatter.format('SelectGroupPerson'),
  disp_create: i18n.formatter.format('Create'),
  disp_modify: i18n.formatter.format('Modify'),
  disp_saveChanges: i18n.formatter.format('SaveChanges'),
  disp_complete: i18n.formatter.format('Complete'),
  disp_registerCompleted: i18n.formatter.format('RegisterCompleted'),
  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),
  disp_select: i18n.formatter.format('Select'),
  disp_insert: i18n.formatter.format('Insert'),
  disp_remove: i18n.formatter.format('Remove'),
  disp_addmark: '>',
  disp_removemark: '<',
  disp_search: i18n.formatter.format('Search'),
  disp_allPerson: i18n.formatter.format('PersonList'),
  disp_selectedPerson: i18n.formatter.format('Selected'),

  flag_modifyMode: false,
  flag_currentSelection: 0,

  value_returnRoutePath: '',
  value_returnRouteName: '',
  value_group_list: [],

  flag_currentSetp: 0,

  value_groupUuid: '',
  disp_groupName: i18n.formatter.format('GroupName'),
  value_groupName: '',
  flag_groupNamePass: false,

  disp_remarks: i18n.formatter.format('Remarks'),
  value_remarks: '',
  disp_header: 'none',

  disp_id: i18n.formatter.format('PersonId'),
  disp_name: i18n.formatter.format('PersonName'),

  value_searchingFilterForAll: '',
  value_searchingFilterForSelected: '',
  value_selectedPersonList: [],
  value_selectedVisitorList: [],
  value_selectedItems: [],
  value_allItemsToShow: [],
  value_selectedItemsToShow: [],

  flag_keepingDownload: false,
  value_allPersonList: [],
  value_allVisitorList: [],
});

export default {
  name: 'GroupForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    // return Object.assign({}, defaultlState(), this.formData);
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  mixins: [TableObserver],
  created() { },
  mounted() {
    const self = this;
    let personDownloadOk = false;
    let visitorDownloadOk = false;
    self.flag_keepingDownload = true;
    self.downloadPersonAsync(1000, (error, reset, more, tableItems) => {
      if (!error) {
        if (reset) {
          self.value_allPersonList = [];
        }
        if (tableItems) {
          self.value_allPersonList = self.value_allPersonList.concat(tableItems);
        }
        if (!more) {
          personDownloadOk = true;
          if (visitorDownloadOk) self.updateData();
        }
      } else {
        self.updateData();
      }
    });
    self.downloadVisitorAsync(1000, (error, reset, more, tableItems) => {
      if (!error) {
        if (reset) {
          self.value_allVisitorList = [];
        }
        if (tableItems) {
          self.value_allVisitorList = self.value_allVisitorList.concat(tableItems);
        }
        if (!more) {
          visitorDownloadOk = true;
          if (personDownloadOk) self.updateData();
        }
      } else {
        self.updateData();
      }
    });
    this.observeTableSize(false);
  },
  updated() { },
  watch: {
    value_searchingFilterForAll() {
      this.updateData();
    },
    value_searchingFilterForSelected() {
      this.updateData();
    },
  },
  methods: {
    async downloadPersonAsync(sliceSize, cb) {
      const self = this;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (self.flag_keepingDownload && thereIsMoreData) {
        const ret = await self.$globalFindPersonWithoutPhoto('', shitf, sliceSize);
        const { data, error } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.person_list);
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, false, []);
          self.$fire({
            title: i18n.formatter.format('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    async downloadVisitorAsync(sliceSize, cb) {
      const self = this;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (self.flag_keepingDownload && thereIsMoreData) {
        const ret = await self.$globalFindVisitorWithoutPhoto('', shitf, sliceSize);
        const { data, error } = ret;
        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.visitor_list);
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, false, []);
          self.$fire({
            title: i18n.formatter.format('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    onSelectType(optionsSelected) {
      // console.log( optionsSelected ); 抓value if訪客列表
      this.disp_allPerson = i18n.formatter.format(optionsSelected[0].value);
      if (optionsSelected[0].value === 'VisitorList') this.flag_currentSelection = 1;
      else this.flag_currentSelection = 0;
      this.value_allTablePage.currentPage = 1;
      this.updateData();
    },
    headerCellStyle() {
      return 'fontSize: 16px';
    },
    cellStyle() {
      return 'fontSize: 16px;';
    },
    updateData() {
      const self = this;
      let allItemsToShow = [];

      const selectedItems = this.value_selectedPersonList.concat(this.value_selectedVisitorList);

      if (self.flag_currentSelection === 0) {
        allItemsToShow = self.value_allPersonList;
        selectedItems.forEach((seletedItem) => {
          allItemsToShow = allItemsToShow.filter((item) => item.uuid !== seletedItem.uuid);
        });
      } else {
        allItemsToShow = self.value_allVisitorList;
        selectedItems.forEach((seletedItem) => {
          allItemsToShow = allItemsToShow.filter((item) => item.uuid !== seletedItem.uuid);
        });
      }

      allItemsToShow.sort((a, b) => a.id.localeCompare(b.id));
      self.value_allItemsToShow = self.generateAllFilteredData(
        allItemsToShow,
        self.value_searchingFilterForAll,
      );

      self.value_selectedItems = selectedItems;
      selectedItems.sort((a, b) => a.id.localeCompare(b.id));
      self.value_selectedItemsToShow = self.generateSelectedFilteredData(
        selectedItems,
        self.value_searchingFilterForSelected,
      );
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.flag_modifyMode ? this.disp_saveChanges : this.disp_create;
        case 2:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
    clickOnInsert() {
      const allRecords = this.$refs.allTable.getCheckboxRecords();
      if (this.flag_currentSelection === 0) {
        this.value_selectedPersonList = this.value_selectedPersonList.concat(allRecords);
      } else {
        this.value_selectedVisitorList = this.value_selectedVisitorList.concat(allRecords);
      }

      this.updateData();
    },
    clickOnRemove() {
      const self = this;
      const selectedRecords = this.$refs.selectedTable.getCheckboxRecords();
      selectedRecords.forEach((seletedItem) => {
        self.value_selectedPersonList = self.value_selectedPersonList.filter((item) => item.uuid !== seletedItem.uuid);
        self.value_selectedVisitorList = self.value_selectedVisitorList.filter((item) => item.uuid !== seletedItem.uuid);
      });
      this.updateData();
    },
    clickOnPrev() {
      const self = this;
      if (self.flag_currentSetp === 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
          self.flag_keepingDownload = false;
        }
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp -= 1;
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp === 0) {
        this.observeTableSize(true);
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        self.flag_keepingDownload = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        if (self.onFinish) {
          self.onFinish(
            {
              uuid: self.value_groupUuid,
              name: self.value_groupName,
              remarks: self.value_remarks,
              person_list: self.value_selectedPersonList,
              visitor_list: self.value_selectedVisitorList,
            },
            (success, result) => {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message === 'ok') {
                self.flag_currentSetp = 2;
              } else {
                self.$fire({
                  text: i18n.formatter.format('Failed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            },
          );
        } else {
          if (self.obj_loading) self.obj_loading.hide();
          self.flag_currentSetp = 2;
        }
      } else {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },
    groupNameValidator(val) {
      const self = this;
      if (val.replace(/\s/g, '').length === 0) {
        self.flag_groupNamePass = false;
      // } else if (val.replace(/[a-zA-Z0-9\s]/g, '').length === 0) {
      // } else if (val.replace(/[^\.\+\*\?\^\$\(\)\[\]\{\}\|\'\"\/\,]/g, '').length === 0) {
      } else if (val.replace(/[^\+\_\)\(\*\&\^\%\$\#\@\!\~\|\}\{\"\:\?\>\<\,\.\/\'\;\\\]\[\=\-\`\]\]]/g, '').length === 0) {
        self.flag_groupNamePass = true;
      } else {
        self.flag_groupNamePass = false;
      }
      if (self.flag_groupNamePass) {
        self.value_group_list.forEach((group) => {
          if (group.name.toLowerCase() === val.toLowerCase()) {
            self.flag_groupNamePass = false;
          }
        });
      }
      return self.flag_groupNamePass;
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step === this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
    generateAllFilteredData(sourceData, filter) {
      const self = this;

      const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
        item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
        || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
      ));

      self.value_allTablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_allTablePage.currentPage - 1) * self.value_allTablePage.pageSize,
        self.value_allTablePage.currentPage * self.value_allTablePage.pageSize,
      );
      return Object.assign([], sliceList);
    },
    generateSelectedFilteredData(sourceData, filter) {
      const self = this;
      const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
        item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
        || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
      ));

      self.value_selectedTablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_selectedTablePage.currentPage - 1) * self.value_selectedTablePage.pageSize,
        self.value_selectedTablePage.currentPage * self.value_selectedTablePage.pageSize,
      );
      return Object.assign([], sliceList);
    },
    handleAllPageChange({ currentPage, pageSize }) {
      this.value_allTablePage.currentPage = currentPage;
      this.value_allTablePage.pageSize = pageSize;
      this.updateData();
      this.resizeOneTable();
    },
    handleSelectedPageChange({ currentPage, pageSize }) {
      this.value_selectedTablePage.currentPage = currentPage;
      this.value_selectedTablePage.pageSize = pageSize;
      this.updateData();
      this.resizeOneTable();
    },
  },
  components: {
    stepprogress: StepProgress,
    SegmentedControl,
  },
};
</script>
