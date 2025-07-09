<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ disp_header }}
      </div>
      <stepprogress class="w-step-progress-3" :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
        :passive-color="param_passiveColor" :steps="[$t('InputGroupInfo'), $t('SelectGroupPerson'), $t('Complete')]"
        :current-step="flag_currentSetp" :line-thickness="param_lineThickness" icon-class="fa fa-check" />
    </CCol>
    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <!-- <div style="height:50px;"></div> -->
          <CCol sm="12">
            <table class="table-layout">
              <tr class="table-tr">
                <th class="h5 w-25 table-th">
                  {{ $t('GroupName') }}
                </th>
                <th class="h5 table-th" colspan="3">
                  {{ $t('Remarks') }}
                </th>
              </tr>
              <tr class="table-tr">
                <td class="table-td">
                  <CInput size="lg" :invalid-feedback="$t('NoEmptyNoSpaceNoSpecialRepeat')" value=""
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
            <CCol sm="1" />
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
                  <segmented-control :options="segmetionOptions" :default-selected-option-idx="0" label="name"
                    value="value" color="#fff" active-color="#20a8d8" :multiple="false" @select="onSelectType" />
                </CCol>
              </CRow>

              <div class="mt-4">
                <CInput v-model.lazy="value_searchingFilterForAll" class="w-100" size="lg" :placeholder="$t('Search')">
                  <template #prepend-content>
                    <CIcon name="cil-search" />
                  </template>
                </CInput>
              </div>
              <vxe-table id="AllTable" :data="value_allItemsToShow" stripe :cell-style="cellStyle"
                :header-cell-style="headerCellStyle"
                :checkbox-config="{ labelField: 'id', checkRowKeys: value_selectedLeftItems }" ref="allTable"
                show-header-overflow empty-text=" ">
                <vxe-table-column type="checkbox" min-width="20%" align="center" />
                <vxe-table-column show-overflow field="id" :title="$t('PersonId')" min-width="40%" align="left" />
                <vxe-table-column show-overflow field="name" :title="$t('PersonName')" min-width="40%" align="left" />
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
                :total="value_allTablePage.totalResult" @page-change="handleAllPageChange" />
            </CCol>
            <!-- 中間欄 -->
            <CCol sm="2" class="d-flex flex-column justify-content-center">
              <CButton class="btn btn-outline-primary w-100 mb-4" @click="clickOnInsert()">
                <span class="mr-3">{{ $t('Insert') }}</span>
                <span>{{ disp_addmark }}</span>
              </CButton>

              <CButton class="btn btn-outline-danger w-100" @click="clickOnRemove()">
                <span class="mr-3">{{ disp_removemark }}</span>
                <span>{{ $t('Remove') }}</span>
              </CButton>
            </CCol>
            <!-- 右欄 -->
            <CCol sm="4">
              <div class="h3 mt-4 mb-3" style="font-weight: 800">
                {{ $t('Selected') }}
              </div>
              <div style="height: 23px" />
              <div style="margin-left: auto">
                <CInput v-model.lazy="value_searchingFilterForSelected" style="width: 100%" size="lg"
                  :placeholder="$t('Search')">
                  <template #prepend-content>
                    <CIcon name="cil-search" />
                  </template>
                </CInput>
              </div>

              <vxe-table :data="value_selectedItemsToShow" stripe show-header-overflow :cell-style="cellStyle"
                :header-cell-style="headerCellStyle"
                :checkbox-config="{ labelField: 'id', checkRowKeys: value_selectedLeftItems }" ref="selectedTable"
                empty-text=" ">
                <vxe-table-column type="checkbox" min-width="20%" align="center" />
                <vxe-table-column min-width="40%" show-overflow field="id" :title="$t('PersonId')" align="left" />
                <vxe-table-column show-overflow min-width="40%" field="name" :title="$t('PersonName')" align="left" />
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
                :total="value_selectedTablePage.totalResult" @page-change="handleSelectedPageChange" />
            </CCol>
            <CCol sm="1" />
          </CRow>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px" />
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('Complete') }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton variant="outline" class="btn btn-outline-primary btn-w-normal fz-lg" @click="clickOnPrev">
            {{
            value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary btn-w-normal fz-lg" @click="clickOnPrev">
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton class="btn btn-primary btn-w-normal fz-lg" @click="clickOnNext" :disabled="!flag_groupNamePass">
            {{
            nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
  import TableObserver from '@/utils/TableObserver.vue';
  import SegmentedControl from 'vue-segmented-control';
  import StepProgress from 'vue-step-progress';
  import '@/airacss/vue-step-progress.css';

  export default {
    name: 'GroupForm',
    props: {
      formData: Object,
      onFinish: { type: Function },
    },
    data() {
      return {
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
          { name: this.$t('Person'), value: 'PersonList' },
          { name: this.$t('Visitor'), value: 'VisitorList' },
        ],
        param_cardStyle: 'height: 35rem;',
        param_activeColor: '#6baee3',
        param_passiveColor: '#919bae',
        param_lineThickness: 3,
        param_activeThickness: 3,
        param_passiveThickness: 3,

        disp_addmark: '>',
        disp_removemark: '<',
        disp_allPerson: this.$t('PersonList'),

        flag_modifyMode: false,
        flag_currentSelection: 0,

        value_returnRoutePath: '',
        value_returnRouteName: '',
        value_group_list: [],

        flag_currentSetp: 0,

        value_groupUuid: '',
        value_groupName: '',
        flag_groupNamePass: false,

        value_remarks: '',
        disp_header: 'none',

        value_searchingFilterForAll: '',
        value_searchingFilterForSelected: '',
        value_selectedPersonList: [],
        value_selectedVisitorList: [],
        value_selectedItems: [],
        value_allItemsToShow: [],
        value_selectedItemsToShow: [],
        value_selectedLeftItems: [],
        value_selectedRightItems: [],

        flag_keepingDownload: false,
        value_allPersonList: [],
        value_allVisitorList: [],

        ...this.formData,
      };
    },
    mixins: [TableObserver],
    created() { },
    mounted() {
      let personDownloadOk = false;
      let visitorDownloadOk = false;
      this.flag_keepingDownload = true;
      this.downloadPersonAsync(20000, (error, reset, more, tableItems) => {
        if (!error) {
          if (reset) {
            this.value_allPersonList = [];
          }
          if (tableItems) {
            this.value_allPersonList = this.value_allPersonList.concat(tableItems);
          }
          if (!more) {
            personDownloadOk = true;
            if (visitorDownloadOk) this.updateData();
          }
        } else {
          this.updateData();
        }
      });
      this.downloadVisitorAsync(1000, (error, reset, more, tableItems) => {
        if (!error) {
          if (reset) {
            this.value_allVisitorList = [];
          }
          if (tableItems) {
            this.value_allVisitorList = this.value_allVisitorList.concat(tableItems);
          }
          if (!more) {
            visitorDownloadOk = true;
            if (personDownloadOk) this.updateData();
          }
        } else {
          this.updateData();
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
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;
        while (this.flag_keepingDownload && thereIsMoreData) {
          const ret = await this.$globalFindPersonWithoutPhoto('', shitf, sliceSize);
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
            this.$fire({
              title: this.$t('NetworkLoss'),
              text: '',
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
        }
      },
      async downloadVisitorAsync(sliceSize, cb) {
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;
        while (this.flag_keepingDownload && thereIsMoreData) {
          const ret = await this.$globalFindVisitorWithoutPhoto('', shitf, sliceSize);
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
            this.$fire({
              title: this.$t('NetworkLoss'),
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
        this.disp_allPerson = this.$t(optionsSelected[0].value);
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
        let allItemsToShow = [];

        const selectedItems = this.value_selectedPersonList.concat(this.value_selectedVisitorList);

        if (this.flag_currentSelection === 0) {
          allItemsToShow = this.value_allPersonList;
          selectedItems.forEach((seletedItem) => {
            allItemsToShow = allItemsToShow.filter((item) => item.uuid !== seletedItem.uuid);
          });
        } else {
          allItemsToShow = this.value_allVisitorList;
          selectedItems.forEach((seletedItem) => {
            allItemsToShow = allItemsToShow.filter((item) => item.uuid !== seletedItem.uuid);
          });
        }

        allItemsToShow.sort((a, b) => a.id.localeCompare(b.id));
        this.value_allItemsToShow = this.generateAllFilteredData(
          allItemsToShow,
          this.value_searchingFilterForAll,
        );

        this.value_selectedItems = selectedItems;
        selectedItems.sort((a, b) => a.id.localeCompare(b.id));
        this.value_selectedItemsToShow = this.generateSelectedFilteredData(
          selectedItems,
          this.value_searchingFilterForSelected,
        );
      },
      nextButtonName() {
        switch (this.flag_currentSetp) {
          case 0:
            return this.$t('Next');
          case 1:
            return this.flag_modifyMode ? this.$t('SaveChanges') : this.$t('Create');
          case 2:
            return this.$t('Complete');
          default:
            return this.$t('Next');
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
        const selectedRecords = this.$refs.selectedTable.getCheckboxRecords();
        selectedRecords.forEach((seletedItem) => {
          this.value_selectedPersonList = this.value_selectedPersonList.filter((item) => item.uuid !== seletedItem.uuid);
          this.value_selectedVisitorList = this.value_selectedVisitorList.filter((item) => item.uuid !== seletedItem.uuid);
        });
        this.updateData();
      },
      clickOnPrev() {
        if (this.flag_currentSetp === 0) {
          if (this.value_returnRoutePath.length > 0) {
            this.$router.push({ name: this.value_returnRoutePath });
            this.flag_keepingDownload = false;
          }
        } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
      },
      clickOnNext() {
        if (this.flag_currentSetp === 0) {
          this.observeTableSize(true);
          this.flag_currentSetp = 1;
        } else if (this.flag_currentSetp === 1) {
          this.flag_keepingDownload = false;
          this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
          if (this.onFinish) {
            this.onFinish(
              {
                uuid: this.value_groupUuid,
                name: this.value_groupName,
                remarks: this.value_remarks,
                person_list: this.value_selectedPersonList,
                visitor_list: this.value_selectedVisitorList,
              },
              (success, result) => {
                if (this.obj_loading) this.obj_loading.hide();
                if (result && result.message === 'ok') {
                  this.flag_currentSetp = 2;
                } else {
                  this.$fire({
                    text: this.$t('Failed'),
                    type: 'error',
                    timer: 3000,
                    confirmButtonColor: '#20a8d8',
                  });
                }
              },
            );
          } else {
            if (this.obj_loading) this.obj_loading.hide();
            this.flag_currentSetp = 2;
          }
        } else {
          this.$router.push({ name: this.value_returnRoutePath });
        }
      },
      groupNameValidator(val) {
        if (val.replace(/\s/g, '').length === 0) {
          this.flag_groupNamePass = false;
          // } else if (val.replace(/[a-zA-Z0-9\s]/g, '').length === 0) {
          // } else if (val.replace(/[^\.\+\*\?\^\$\(\)\[\]\{\}\|\'\"\/\,]/g, '').length === 0) {
        } else if (val.replace(/[^+)(*&^%$#@!~|}{":?><,./';\][=`]/g, '').length === 0) {
          this.flag_groupNamePass = true;
        } else {
          this.flag_groupNamePass = false;
        }
        if (this.flag_groupNamePass) {
          this.value_group_list.forEach((group) => {
            if (group.name.trim().toLowerCase() === val.trim().toLowerCase()) {
              this.flag_groupNamePass = false;
            }
          });
        }
        return this.flag_groupNamePass;
      },

      showOnStep(step) {
        return step === this.flag_currentSetp ? 'd-block' : 'd-none';
      },
      redrawOnStep(step) {
        return step === this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
      },
      generateAllFilteredData(sourceData, filter) {
        const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
          item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
        ));

        this.value_allTablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (this.value_allTablePage.currentPage - 1) * this.value_allTablePage.pageSize,
          this.value_allTablePage.currentPage * this.value_allTablePage.pageSize,
        );
        return Object.assign([], sliceList);
      },
      generateSelectedFilteredData(sourceData, filter) {
        const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
          item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
        ));

        this.value_selectedTablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (this.value_selectedTablePage.currentPage - 1) * this.value_selectedTablePage.pageSize,
          this.value_selectedTablePage.currentPage * this.value_selectedTablePage.pageSize,
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