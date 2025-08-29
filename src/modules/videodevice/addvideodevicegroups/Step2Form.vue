<template>
  <div>
    <CRow>
      <CCol sm="1" />
      <!-- 左欄 -->
      <CCol sm="4">
        <div
          class="h3 mt-4"
          style="font-weight: 800"
        >
          {{ $t('DeviceList') }}
        </div>

        <div class="mt-4">
          <CInput
            v-model.lazy="value_searchingFilterForAll"
            class="w-100"
            size="lg"
            :placeholder="$t('Search')"
          >
            <template #prepend-content>
              <CIcon name="cil-search" />
            </template>
          </CInput>
        </div>

        <vxe-table
          id="AllTable"
          :data="value_allItemsToShow"
          stripe
          :cell-style="cellStyle"
          :header-cell-style="headerCellStyle"
          :checkbox-config="{ checkRowKeys: value_selectedLeftItems }"
          ref="allTable"
          show-header-overflow
          empty-text=" "
        >
          <vxe-table-column
            type="checkbox"
            min-width="20%"
            align="center"
          />
          <vxe-table-column
            show-overflow
            field="deviceType"
            :title="$t('DeviceType')"
            min-width="40%"
            align="left"
          />
          <vxe-table-column
            show-overflow
            field="name"
            :title="$t('DeviceName')"
            min-width="40%"
            align="left"
          />
        </vxe-table>

        <vxe-pager
          class="h-theme-pager"
          :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
          :current-page="value_allTablePage.currentPage"
          :page-size="value_allTablePage.pageSize"
          :total="value_allTablePage.totalResult"
          @page-change="handleAllPageChange"
        />
      </CCol>

      <!-- 中間欄 -->
      <CCol
        sm="2"
        class="d-flex flex-column justify-content-center"
      >
        <CButton
          class="btn btn-outline-primary w-100 mb-4"
          @click="clickOnInsert()"
        >
          <span class="mr-3">{{ $t('Insert') }}</span>
          <span>{{ disp_addmark }}</span>
        </CButton>

        <CButton
          class="btn btn-outline-danger w-100"
          @click="clickOnRemove()"
        >
          <span class="mr-3">{{ disp_removemark }}</span>
          <span>{{ $t('Remove') }}</span>
        </CButton>
      </CCol>

      <!-- 右欄 -->
      <CCol sm="4">
        <div
          class="h3 mt-4 mb-3"
          style="font-weight: 800"
        >
          {{ $t('Selected') }}
        </div>
        <div style="height: 23px" />
        <div style="margin-left: auto">
          <CInput
            v-model.lazy="value_searchingFilterForSelected"
            style="width: 100%"
            size="lg"
            :placeholder="$t('Search')"
          >
            <template #prepend-content>
              <CIcon name="cil-search" />
            </template>
          </CInput>
        </div>

        <vxe-table
          :data="value_selectedItemsToShow"
          stripe
          show-header-overflow
          :cell-style="cellStyle"
          :header-cell-style="headerCellStyle"
          :checkbox-config="{ checkRowKeys: value_selectedRightItems }"
          ref="selectedTable"
          empty-text=" "
        >
          <vxe-table-column
            type="checkbox"
            min-width="20%"
            align="center"
          />
          <vxe-table-column
            min-width="40%"
            show-overflow
            field="deviceType"
            :title="$t('DeviceType')"
            align="left"
          />
          <vxe-table-column
            show-overflow
            min-width="40%"
            field="name"
            :title="$t('DeviceName')"
            align="left"
          />
        </vxe-table>

        <vxe-pager
          class="h-theme-pager"
          :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
          :current-page="value_selectedTablePage.currentPage"
          :page-size="value_selectedTablePage.pageSize"
          :total="value_selectedTablePage.totalResult"
          @page-change="handleSelectedPageChange"
        />
      </CCol>
      <CCol sm="1" />
    </CRow>
  </div>
</template>

<script>
import TableObserver from '@/utils/TableObserver.vue';

export default {
  name: 'AddVideoDeviceGroupStep2Form',
  mixins: [TableObserver],
  props: {
    step2form: {
      type: Object,
      default: () => ({
        selectedCameras: [],
        selectedTablets: [],
      }),
    },
  },
  data() {
    return {
      // 設備資料
      allCameras: [],
      allTablets: [],
      allDevices: [], // 所有設備的合併列表
      localSelectedCameras: [],
      localSelectedTablets: [],
      selectedDevices: [], // 所有已選設備的合併列表

      // 載入狀態
      isLoading: false,
      flag_keepingDownload: false,

      // 分頁設定
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

      // 搜尋過濾
      value_searchingFilterForAll: '',
      value_searchingFilterForSelected: '',

      // 顯示資料
      value_allItemsToShow: [],
      value_selectedItemsToShow: [],
      value_selectedLeftItems: [],
      value_selectedRightItems: [],

      // UI文字
      disp_addmark: '>',
      disp_removemark: '<',
    };
  },
  components: {},
  computed: {},
  mounted() {
    this.loadDevices();
    // Initialize from props
    if (this.step2form) {
      this.localSelectedCameras = [...(this.step2form.selectedCameras || [])];
      this.localSelectedTablets = [...(this.step2form.selectedTablets || [])];
    }
    this.observeTableSize(false);
  },
  watch: {
    localSelectedCameras: {
      handler() {
        this.emitUpdate();
        this.updateData();
      },
      deep: true,
    },
    localSelectedTablets: {
      handler() {
        this.emitUpdate();
        this.updateData();
      },
      deep: true,
    },
    value_searchingFilterForAll() {
      this.updateData();
    },
    value_searchingFilterForSelected() {
      this.updateData();
    },
  },
  methods: {
    async loadDevices() {
      this.isLoading = true;
      this.flag_keepingDownload = true;
      try {
        // Load cameras
        const cameraResponse = await this.$globalFindCameras('', 0, 1000);
        if (cameraResponse && cameraResponse.data && cameraResponse.data.list) {
          this.allCameras = cameraResponse.data.list.map((camera) => ({
            ...camera,
            deviceType: this.$t('Camera'),
            type: 'camera',
          }));
        }

        // Load tablets
        const tabletResponse = await this.$globalGetTabletList('', 0, 1000);
        if (tabletResponse && tabletResponse.data && tabletResponse.data.data_list) {
          this.allTablets = tabletResponse.data.data_list.map((tablet) => ({
            ...tablet,
            deviceType: this.$t('Tablet'),
            type: 'tablet',
          }));
        }

        // 合併所有設備
        this.allDevices = [...this.allCameras, ...this.allTablets];
        this.updateData();
      } catch (error) {
        console.error('Error loading devices:', error);
        this.allCameras = [];
        this.allTablets = [];
        this.allDevices = [];
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      } finally {
        this.isLoading = false;
        this.flag_keepingDownload = false;
      }
    },

    headerCellStyle() {
      return 'fontSize: 16px';
    },

    cellStyle() {
      return 'fontSize: 16px;';
    },

    updateData() {
      // 合併已選設備
      const selectedItems = this.localSelectedCameras.concat(this.localSelectedTablets);
      this.selectedDevices = selectedItems;

      // 過濾掉已選擇的設備
      let allItemsToShow = this.allDevices;
      selectedItems.forEach((selectedItem) => {
        allItemsToShow = allItemsToShow.filter((item) => item.uuid !== selectedItem.uuid);
      });

      allItemsToShow.sort((a, b) => a.name.localeCompare(b.name));
      this.value_allItemsToShow = this.generateAllFilteredData(
        allItemsToShow,
        this.value_searchingFilterForAll,
      );

      selectedItems.sort((a, b) => a.name.localeCompare(b.name));
      this.value_selectedItemsToShow = this.generateSelectedFilteredData(
        selectedItems,
        this.value_searchingFilterForSelected,
      );
    },

    generateAllFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
        item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
        || item.deviceType.toLowerCase().indexOf(filter.toLowerCase()) > -1
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
        item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
        || item.deviceType.toLowerCase().indexOf(filter.toLowerCase()) > -1
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

    clickOnInsert() {
      const allRecords = this.$refs.allTable.getCheckboxRecords();
      allRecords.forEach((device) => {
        if (device.type === 'camera') {
          // 新增摄影機
          if (!this.localSelectedCameras.find((c) => c.uuid === device.uuid)) {
            this.localSelectedCameras.push(device);
          }
        } else if (device.type === 'tablet') {
          // 新增平板電腦
          if (!this.localSelectedTablets.find((t) => t.uuid === device.uuid)) {
            this.localSelectedTablets.push(device);
          }
        }
      });
      this.updateData();
    },

    clickOnRemove() {
      const selectedRecords = this.$refs.selectedTable.getCheckboxRecords();
      selectedRecords.forEach((selectedItem) => {
        this.localSelectedCameras = this.localSelectedCameras.filter((item) => item.uuid !== selectedItem.uuid);
        this.localSelectedTablets = this.localSelectedTablets.filter((item) => item.uuid !== selectedItem.uuid);
      });
      this.updateData();
    },

    emitUpdate() {
      this.$emit('updateStep2form', {
        selectedCameras: this.localSelectedCameras,
        selectedTablets: this.localSelectedTablets,
      });
    },
  },
};
</script>
