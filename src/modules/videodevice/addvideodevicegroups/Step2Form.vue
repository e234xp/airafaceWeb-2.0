<template>
  <div>
    <CRow>
      <CCol sm="1" />
      <!-- 左欄 -->
      <CCol sm="4">
        <CRow class="mt-4">
          <CCol sm="6">
            <div class="h3" style="font-weight: 800">
              {{ disp_allDevice }}
            </div>
          </CCol>

          <!-- 設備列表 攝影機、平板切換 -->
          <CCol sm="6">
            <segmented-control :options="segmentedOptions" :default-selected-option-idx="0" label="name"
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
          :checkbox-config="{ labelField: 'uuid', checkRowKeys: value_selectedLeftItems }" ref="allTable"
          show-header-overflow empty-text=" ">
          <vxe-table-column type="checkbox" min-width="20%" align="center" />
          <vxe-table-column show-overflow field="id" :title="$t('DeviceId')" min-width="40%" align="left" />
          <vxe-table-column show-overflow field="name" :title="$t('DeviceName')" min-width="40%" align="left" />
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
          :checkbox-config="{ labelField: 'uuid', checkRowKeys: value_selectedRightItems }" ref="selectedTable"
          empty-text=" ">
          <vxe-table-column type="checkbox" min-width="20%" align="center" />
          <vxe-table-column min-width="40%" show-overflow field="id" :title="$t('DeviceId')" align="left" />
          <vxe-table-column show-overflow min-width="40%" field="name" :title="$t('DeviceName')" align="left" />
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
  </div>
</template>

<script>
import TableObserver from '@/utils/TableObserver.vue';
import SegmentedControl from 'vue-segmented-control';

export default {
  name: 'AddVideoDeviceGroupStep2Form',
  props: {
    step2form: Object,
  },
  mixins: [TableObserver],
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
      segmentedOptions: [
        { name: this.$t('Cameras'), value: 'CameraList' },
        { name: this.$t('Tablets'), value: 'TabletList' },
      ],

      disp_addmark: '>',
      disp_removemark: '<',
      disp_allDevice: this.$t('Cameras'),

      flag_currentSelection: 0,

      value_searchingFilterForAll: '',
      value_searchingFilterForSelected: '',
      value_selectedCameraList: [],
      value_selectedTabletList: [],
      value_selectedItems: [],
      value_allItemsToShow: [],
      value_selectedItemsToShow: [],
      value_selectedLeftItems: [],
      value_selectedRightItems: [],

      flag_keepingDownload: false,
      value_allCameraList: [],
      value_allTabletList: [],
    };
  },
  created() { },
  mounted() {
    this.loadDeviceData();
    this.observeTableSize(false);
  },
  watch: {
    value_searchingFilterForAll() {
      this.updateData();
    },
    value_searchingFilterForSelected() {
      this.updateData();
    },
    step2form: {
      handler(newValue) {
        if (newValue) {
          this.value_selectedCameraList = [...(newValue.selectedCameras || [])];
          this.value_selectedTabletList = [...(newValue.selectedTablets || [])];
          this.updateData();
        }
      },
      deep: true,
    },
  },
  methods: {
    async loadDeviceData() {
      this.flag_keepingDownload = true;
      let cameraDownloadOk = false;
      let tabletDownloadOk = false;

      this.downloadCameraAsync(20000, (error, reset, more, tableItems) => {
        if (!error) {
          if (reset) {
            this.value_allCameraList = [];
          }
          if (tableItems) {
            this.value_allCameraList = this.value_allCameraList.concat(tableItems);
          }
          if (!more) {
            cameraDownloadOk = true;
            if (tabletDownloadOk) this.updateData();
          }
        } else {
          this.updateData();
        }
      });

      this.downloadTabletAsync(1000, (error, reset, more, tableItems) => {
        if (!error) {
          if (reset) {
            this.value_allTabletList = [];
          }
          if (tableItems) {
            this.value_allTabletList = this.value_allTabletList.concat(tableItems);
          }
          if (!more) {
            tabletDownloadOk = true;
            if (cameraDownloadOk) this.updateData();
          }
        } else {
          this.updateData();
        }
      });
    },

    async downloadCameraAsync(sliceSize, cb) {
      let shift = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (this.flag_keepingDownload && thereIsMoreData) {
        const ret = await this.$globalFindCameras('', shift, sliceSize);
        const { data, error } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shift) {
            thereIsMoreData = true;
            shift += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.camera_list);
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

    async downloadTabletAsync(sliceSize, cb) {
      let shift = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (this.flag_keepingDownload && thereIsMoreData) {
        const ret = await this.$globalGetTabletList('', shift, sliceSize);
        const { data, error } = ret;
        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shift) {
            thereIsMoreData = true;
            shift += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.tablet_list);
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
      if (optionsSelected[0].value === 'TabletList') {
        this.flag_currentSelection = 1;
        this.disp_allDevice = this.$t('Tablets');
      } else {
        this.flag_currentSelection = 0;
        this.disp_allDevice = this.$t('Cameras');
      }
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

      const selectedItems = this.value_selectedCameraList.concat(this.value_selectedTabletList);

      if (this.flag_currentSelection === 0) {
        allItemsToShow = this.value_allCameraList;
        selectedItems.forEach((selectedItem) => {
          allItemsToShow = allItemsToShow.filter((item) => item.uuid !== selectedItem.uuid);
        });
      } else {
        allItemsToShow = this.value_allTabletList;
        selectedItems.forEach((selectedItem) => {
          allItemsToShow = allItemsToShow.filter((item) => item.uuid !== selectedItem.uuid);
        });
      }

      allItemsToShow.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      this.value_allItemsToShow = this.generateAllFilteredData(
        allItemsToShow,
        this.value_searchingFilterForAll,
      );

      this.value_selectedItems = selectedItems;
      selectedItems.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      this.value_selectedItemsToShow = this.generateSelectedFilteredData(
        selectedItems,
        this.value_searchingFilterForSelected,
      );

      this.$emit('updateStep2form', {
        selectedCameras: this.value_selectedCameraList,
        selectedTablets: this.value_selectedTabletList,
      });
    },

    clickOnInsert() {
      const allRecords = this.$refs.allTable.getCheckboxRecords();
      if (this.flag_currentSelection === 0) {
        this.value_selectedCameraList = this.value_selectedCameraList.concat(allRecords);
      } else {
        this.value_selectedTabletList = this.value_selectedTabletList.concat(allRecords);
      }

      this.updateData();
    },

    clickOnRemove() {
      const selectedRecords = this.$refs.selectedTable.getCheckboxRecords();
      selectedRecords.forEach((selectedItem) => {
        this.value_selectedCameraList = this.value_selectedCameraList.filter((item) => item.uuid !== selectedItem.uuid);
        this.value_selectedTabletList = this.value_selectedTabletList.filter((item) => item.uuid !== selectedItem.uuid);
      });
      this.updateData();
    },

    generateAllFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
        (item.id || '').toLowerCase().indexOf(filter.toLowerCase()) > -1
        || (item.name || '').toLowerCase().indexOf(filter.toLowerCase()) > -1
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
        (item.id || '').toLowerCase().indexOf(filter.toLowerCase()) > -1
        || (item.name || '').toLowerCase().indexOf(filter.toLowerCase()) > -1
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
    SegmentedControl,
  },
};
</script>