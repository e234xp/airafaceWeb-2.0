<template>
  <div class="PresenceDetail">
    <div>
      <CCol sm="12">
        <div class="d-flex justify-content-between align-items-center">
          <div class="h1 mb-0">
            {{ disp_header }}
          </div>
          <CButton class="btn btn-primary" size="lg" @click="clickOnDeviceManagement()">
            {{ disp_deviceManagement }}
          </CButton>
        </div>
      </CCol>
      <div style="height: 35px" />
    </div>

    <!-- 影像設備管理 Modal -->
    <CModal :show.sync="flag_showDeviceModal" :centered="true" :close-on-backdrop="false" size="lg">
      <template #header>
        <h5 class="mb-0">
          {{ disp_deviceManagement }}
        </h5>
      </template>

      <div v-if="value_deviceList.length > 0">
        <div
          v-for="(device, idx) in value_deviceList"
          :key="device.uuid"
          class="d-flex align-items-center justify-content-between py-2"
          :class="{ 'border-top': idx > 0 }"
        >
          <div class="h6 mb-0" style="min-width: 200px">
            {{ device.name }}
          </div>
          <CSelect
            :value.sync="device.direction"
            :options="directionOptions"
            size="lg"
            style="min-width: 150px; margin-bottom: 0"
          />
        </div>
      </div>
      <div v-else class="text-center py-3 text-muted">Loading...</div>

      <template #footer>
        <CButton color="secondary" @click="flag_showDeviceModal = false">
          {{ $t('Cancel') }}
        </CButton>
        <CButton color="primary" @click="clickOnSaveDeviceDirection()">
          {{ $t('Save') }}
        </CButton>
      </template>
    </CModal>
    <div>
      <CCol sm="12">
        <CRow class="justify-content-between">
          <div class="d-flex align-items-center h-100 mb-3 mr-3">
            <date-picker
              style="width: 400px"
              :lang="this.$globalDatePickerLanguage"
              v-model="value_specifiedDatetimeRange"
              type="date"
              range
              :placeholder="disp_selectDatetimeRange"
              :disabled-date="disabledDateRange"
              @change="datePickerDatachange()"
            />
            <CButton
              class="btn btn-primary btn-w-normal ml-3"
              size="lg"
              @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton"
            >
              {{ disp_search }}
            </CButton>
            <CDropdown
              :toggler-text="toggleText()"
              class="btn btn-primary btn-w-normal ml-3 p-0 dropdown-theme"
              size="lg"
              :disabled="!flag_enableSearchButton"
            >
              <CDropdownItem @click="exportExcel(true)"> {{ disp_exportExcel }} ({{ disp_withPhoto }}) </CDropdownItem>
              <CDropdownItem @click="exportExcel(false)">
                {{ disp_exportExcel }} ({{ disp_withoutPhoto }})
              </CDropdownItem>
            </CDropdown>
          </div>

          <div class="d-flex align-items-center">
            <CInput v-model.lazy="value_searchingFilter" style="width: 400px" size="lg" :placeholder="disp_search">
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
            <span class="badge-summary badge-abnormal ml-3"> {{ disp_abnormal }}{{ value_abnormalCount }} </span>
            <span class="badge-summary badge-total ml-2"> {{ disp_person }}{{ value_totalCount }} </span>
          </div>
        </CRow>
      </CCol>
      <div style="height: 12px" />
    </div>
    <CCard>
      <CCardBody>
        <div>
          <vxe-table
            :data="value_dataItemsToShow"
            stripe
            align="center"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            ref="mainTable"
          >
            <vxe-table-column
              field="date"
              :title="disp_date"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="id"
              :title="disp_personId"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="name"
              :title="disp_name"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="department"
              :title="disp_department"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="groups"
              :title="disp_group"
              :show-overflow="ellipsisMode"
              width="8%"
              align="center"
            />
            <vxe-table-column
              field="imgRegisterPhoto"
              :title="disp_registerPhoto"
              width="10%"
              align="center"
              type="html"
            />
            <vxe-table-column :title="disp_abnormalStatus" width="10%" align="center">
              <template #default="{ row }">
                <span :class="['status-badge', row.isAbnormal ? 'status-abnormal' : 'status-normal']">
                  {{ row.isAbnormal ? disp_abnormalLabel : disp_normalLabel }}
                </span>
              </template>
            </vxe-table-column>
            <vxe-table-column
              field="inTotal"
              :title="disp_inTotal"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="outTotal"
              :title="disp_outTotal"
              :show-overflow="ellipsisMode"
              width="10%"
              align="center"
            />
            <vxe-table-column :title="disp_detailRecord" min-width="14%" align="center">
              <template #default="{ row }">
                <vxe-button class="btn btn-in-cell-primary btn-in-cell" @click="clickOnViewDetail(row)">
                  <CIcon name="cil-search" class="mr-1" />
                  {{ disp_viewDetail }}
                </vxe-button>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>
        <vxe-pager
          :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
          :current-page="value_tablePage.currentPage"
          :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult"
          @page-change="handlePageChange"
        />
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';

const VALUE_EMPTY_PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==';

const defaultlState = () => ({
  obj_loading: null,

  flag_enableSearchButton: false,

  disp_date: i18n.formatter.format('Date'),
  disp_header: i18n.formatter.format('PresenceDetail'),
  disp_deviceManagement: i18n.formatter.format('DeviceDirectionManagement'),
  disp_selectDatetimeRange: i18n.formatter.format('DateTime'),
  disp_search: i18n.formatter.format('Search'),
  disp_exportExcel: i18n.formatter.format('ExportExcel'),
  disp_withPhoto: i18n.formatter.format('WithPhoto'),
  disp_withoutPhoto: i18n.formatter.format('WithoutPhoto'),

  disp_personId: i18n.formatter.format('PersonId'),
  disp_name: i18n.formatter.format('PersonName'),
  disp_department: i18n.formatter.format('Department'),
  disp_group: i18n.formatter.format('GroupName'),
  disp_registerPhoto: i18n.formatter.format('RegisterPhoto'),
  disp_abnormalStatus: i18n.formatter.format('AbnormalStatus'),
  disp_inTotal: i18n.formatter.format('InTotal'),
  disp_outTotal: i18n.formatter.format('OutTotal'),
  disp_detailRecord: i18n.formatter.format('DetailRecord'),
  disp_viewDetail: i18n.formatter.format('ViewDetail'),
  disp_normalLabel: i18n.formatter.format('Normal'),
  disp_abnormalLabel: i18n.formatter.format('Abnormal'),
  disp_abnormal: i18n.formatter.format('AbnormalCount'),
  disp_person: i18n.formatter.format('PersonCount'),

  value_searchingFilter: '',
  value_specifiedDatetimeRange: [],

  value_dataItemsToShow: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },

  value_abnormalCount: 0,
  value_totalCount: 0,

  flag_showDeviceModal: false,
  value_deviceList: [],
  directionOptions: [
    { value: 'NONE', label: 'NONE' },
    { value: 'IN', label: 'IN' },
    { value: 'OUT', label: 'OUT' },
  ],

  searchTimer: null,
});

export default {
  name: 'PresenceDetail',
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);
    return cloneObject;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mixins: [TableObserver],
  async created() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    const startTimeTimestamp = endTime.getTime() - 86400000 + 1;

    this.value_specifiedDatetimeRange[0] = new Date(startTimeTimestamp);
    this.value_specifiedDatetimeRange[1] = endTime;
    this.flag_enableSearchButton = true;
    this.clickOnSearch();
  },
  mounted() {
    this.observeTableSize();
  },
  watch: {
    value_searchingFilter() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.value_tablePage.currentPage = 1;
        this.fetchPageData(1);
      }, 500);
    },
  },
  methods: {
    toggleText() {
      return i18n.formatter.format('ExportExcel');
    },
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },
    datePickerDatachange() {
      this.flag_enableSearchButton = true;
    },
    disabledDateRange(date) {
      const range = this.value_specifiedDatetimeRange;
      // 當已選了起始日期時，限制結束日期不能超過起始日 +30 天
      if (range && range[0] && !range[1]) {
        const startDate = new Date(range[0]);
        const maxDate = new Date(startDate);
        maxDate.setDate(maxDate.getDate() + 30);
        return date < startDate || date > maxDate;
      }
      return false;
    },
    clickOnSearch() {
      this.value_tablePage.currentPage = 1;
      this.fetchPageData(1);
    },

    formatBase64ToImgTag(eleId, width, height, base64Str) {
      if (base64Str && base64Str.length > 0) {
        return `<img id='${eleId}' width='${width}' height='${height}' src='data:image/jpeg;base64,${base64Str}'>`;
      }
      return `<img id='${eleId}' width='${width}' height='${height}' src='${VALUE_EMPTY_PHOTO}'>`;
    },

    formatSeconds(totalSeconds) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    },

    formatResultItem(item) {
      const groups = (item.group_list || []).filter((g) => g !== 'All Person').join(', ');
      return {
        ...item,
        id: item.person_id,
        department: item.department || '',
        groups,
        isAbnormal: item.has_anomaly,
        inTotal: this.formatSeconds(item.in_total_seconds || 0),
        outTotal: this.formatSeconds(item.out_total_seconds || 0),
        imgRegisterPhoto: this.formatBase64ToImgTag(`imgRegPhoto${item.uuid}`, 80, 80, ''),
      };
    },

    async fetchPageData(page) {
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

      const startTime = this.value_specifiedDatetimeRange[0].getTime();
      const endDate = new Date(this.value_specifiedDatetimeRange[1]);
      endDate.setHours(23, 59, 59, 999);
      const endTime = endDate.getTime();
      const shift = (page - 1) * this.value_tablePage.pageSize;

      const query = {
        keyword: this.value_searchingFilter,
        start_time: startTime,
        end_time: endTime,
        slice_shift: shift,
        slice_length: this.value_tablePage.pageSize,
      };

      try {
        const retResult = await this.$globalQueryPresenceSummary(query);

        if (!retResult.error && retResult.data) {
          const { data } = retResult;
          this.value_tablePage.totalResult = data.total_length || 0;
          this.value_abnormalCount = data.anomaly_count || 0;
          this.value_totalCount = data.person_count || 0;

          const items = (data.result || []).map((item) => this.formatResultItem(item));
          this.value_dataItemsToShow = Object.assign([], items);

          // 非同步載入註冊照片
          for (let ii = 0; ii < this.value_dataItemsToShow.length; ii += 1) {
            const row = this.value_dataItemsToShow[ii];
            if (row.uuid) {
              const photoRet = await this.$globalFetchPhoto(row.uuid);
              const oldImg = document.getElementById(`imgRegPhoto${row.uuid}`);
              if (oldImg && photoRet.data && photoRet.data.register_image && photoRet.data.register_image.length > 0) {
                oldImg.src = `data:image/jpeg;base64,${photoRet.data.register_image}`;
              }
            }
          }
        }
      } catch (ex) {
        console.log(ex);
      }

      if (this.obj_loading) this.obj_loading.hide();
    },

    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.fetchPageData(currentPage);
      this.resizeOneTable();
    },

    clickOnViewDetail(row) {
      this.$router.push({
        name: 'PresenceDetailEvents',
        params: {
          value_returnRoutePath: 'PresenceDetail',
          value_returnRouteName: this.$t('Return'),
          item: row,
        },
      });
    },

    async clickOnDeviceManagement() {
      this.value_deviceList = [];
      this.flag_showDeviceModal = true;

      const [cameraRet, tabletRet] = await Promise.all([
        this.$globalFindCameras('', 0, 3000),
        this.$globalGetTabletList('', 0, 3000),
      ]);

      const devices = [];
      if (cameraRet.data && cameraRet.data.list) {
        cameraRet.data.list.forEach((cam) => {
          devices.push({
            uuid: cam.uuid,
            name: cam.name,
            direction: cam.presence_direction || 'NONE',
          });
        });
      }
      if (tabletRet.data && tabletRet.data.data_list) {
        tabletRet.data.data_list.forEach((tab) => {
          devices.push({
            uuid: tab.uuid,
            name: tab.name,
            direction: tab.presence_direction || 'NONE',
          });
        });
      }

      this.value_deviceList = devices;
    },

    async clickOnSaveDeviceDirection() {
      // 驗證：至少一個 IN 和一個 OUT
      const hasIn = this.value_deviceList.some((d) => d.direction === 'IN');
      const hasOut = this.value_deviceList.some((d) => d.direction === 'OUT');
      if (!hasIn || !hasOut) {
        this.$fire({
          text: i18n.formatter.format('NeedAtLeastOneInAndOut'),
          type: 'warning',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
        return;
      }

      const items = this.value_deviceList.map((d) => ({
        uuid: d.uuid,
        direction: d.direction,
      }));

      const ret = await this.$globalSetPresenceDeviceDirection({ items });
      if (!ret.error) {
        this.flag_showDeviceModal = false;
        this.$fire({
          text: i18n.formatter.format('OperationSuccess'),
          type: 'success',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
      } else {
        this.$fire({
          text: i18n.formatter.format('OperationFailed'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
      }
    },

    async exportExcel(withPhoto) {
      const self = this;
      const startTime = self.value_specifiedDatetimeRange[0].getTime();
      const endDate = new Date(self.value_specifiedDatetimeRange[1]);
      endDate.setHours(23, 59, 59, 999);
      const endTime = endDate.getTime();

      // 撈取全部資料用於匯出
      let allItems = [];
      let shift = 0;
      let thereIsMoreData = true;

      while (thereIsMoreData) {
        const query = {
          keyword: self.value_searchingFilter,
          start_time: startTime,
          end_time: endTime,
          slice_shift: shift,
          slice_length: 10000,
        };
        const retResult = await self.$globalQueryPresenceSummary(query);
        if (!retResult.error && retResult.data) {
          const { data } = retResult;
          if (data.result && data.result.length > 0) {
            allItems = allItems.concat(data.result);
            if (shift + data.result.length < data.total_length) {
              shift += data.result.length;
            } else {
              thereIsMoreData = false;
            }
          } else {
            thereIsMoreData = false;
          }
        } else {
          thereIsMoreData = false;
        }
      }

      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('PresenceDetail');

      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: self.disp_personId, key: 'id', width: 15 },
        { header: self.disp_name, key: 'name', width: 15 },
        { header: self.disp_department, key: 'department', width: 15 },
        { header: self.disp_group, key: 'groups', width: 15 },
        { header: self.disp_abnormalStatus, key: 'abnormalStatus', width: 15 },
        { header: self.disp_inTotal, key: 'inTotal', width: 15 },
        { header: self.disp_outTotal, key: 'outTotal', width: 15 },
        { header: self.disp_registerPhoto, key: 'photo', width: 15 },
      ];

      for (let idx = 0; idx < allItems.length; idx += 1) {
        const raw = allItems[idx];
        const item = self.formatResultItem(raw);
        worksheet.addRow({
          No: idx + 1,
          id: item.id,
          name: item.name,
          department: item.department,
          groups: item.groups,
          abnormalStatus: item.isAbnormal ? self.disp_abnormalLabel : self.disp_normalLabel,
          inTotal: item.inTotal,
          outTotal: item.outTotal,
        });

        if (withPhoto && item.uuid) {
          const photoRet = await self.$globalFetchPhoto(item.uuid);
          if (photoRet.data && photoRet.data.register_image && photoRet.data.register_image.length > 0) {
            const photoId = workbook.addImage({
              base64: photoRet.data.register_image,
              extension: 'jpeg',
            });
            worksheet.lastRow.height = 60;
            worksheet.addImage(photoId, `I${worksheet.rowCount}:I${worksheet.rowCount}`);
          }
        }
      }

      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, 'PresenceDetail-Report.xlsx');
      });
    },
  },
};
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-normal {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-abnormal {
  background-color: #fff3e0;
  color: #e65100;
}

.badge-summary {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-abnormal {
  background-color: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}

.badge-total {
  background-color: #e8eaf6;
  color: #283593;
  border: 1px solid #9fa8da;
}
</style>

<style>
.mx-input {
  padding: 0.5rem 1rem;
  font-size: 1.09375rem;
  height: calc(1.5em + 1rem + 2px);
  border-color: #d8dbe0;
}

.PresenceDetail td,
.PresenceDetail th {
  font-size: 15px !important;
}
</style>
