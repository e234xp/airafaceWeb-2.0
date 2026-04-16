<template>
  <div class="PresenceDetailEvents">
    <div>
      <CCol sm="12">
        <CRow class="align-items-center">
          <CButton class="btn btn-outline-primary btn-w-normal mr-3" size="lg" @click="clickOnReturn()">
            {{ disp_return }}
          </CButton>
          <div class="h1 mb-0">
            {{ disp_header }}
          </div>
        </CRow>
      </CCol>
      <div style="height: 35px" />
    </div>

    <!-- 時間軸 -->
    <CCard>
      <CCardBody>
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 mr-4">
            <div class="h5 mb-2">
              {{ disp_timeline }}
            </div>
            <div ref="timelineChart" style="width: 100%; height: 160px;" />
          </div>
          <div class="d-flex align-items-center">
            <div class="presence-stat-box mr-2">
              <div class="presence-stat-title">
                {{ disp_inOfficeTime }}
              </div>
              <div class="presence-stat-value">
                {{ value_inTotalFormatted }}
              </div>
            </div>
            <div class="presence-stat-box">
              <div class="presence-stat-title">
                {{ disp_outOfficeTime }}
              </div>
              <div class="presence-stat-value">
                {{ value_outTotalFormatted }}
              </div>
            </div>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <!-- 事件列表 -->
    <CCard>
      <CCardBody>
        <CRow class="justify-content-between align-items-center mb-3">
          <div>
            <span class="h5">{{ disp_eventList }}</span>
            <span class="text-muted ml-2"
              >{{ disp_totalRecords }}{{ value_tablePage.totalResult }}{{ disp_records }}</span
            >
          </div>
          <div>
            <CButton
              class="btn btn-danger btn-w-normal mr-2"
              size="lg"
              :disabled="value_selectedRows.length === 0"
              @click="clickOnBatchDelete()"
            >
              {{ $t('Delete') }}
            </CButton>
            <CButton class="btn btn-primary btn-w-normal mr-2" size="lg" @click="clickOnExceptionHandling()">
              {{ disp_exceptionHandling }}
            </CButton>
            <CDropdown
              :toggler-text="disp_exportExcel"
              class="btn btn-primary btn-w-normal p-0 dropdown-theme"
              size="lg"
            >
              <CDropdownItem @click="exportExcel(true)">
                {{ disp_exportExcel }} ({{ disp_withPhoto }})
              </CDropdownItem>
              <CDropdownItem @click="exportExcel(false)">
                {{ disp_exportExcel }} ({{ disp_withoutPhoto }})
              </CDropdownItem>
            </CDropdown>
          </div>
        </CRow>
        <div>
          <vxe-table
            :data="value_dataItemsToShow"
            stripe
            align="center"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            :row-class-name="rowClassName"
            ref="mainTable"
            @checkbox-all="mainSelectAllEvent"
            @checkbox-change="mainSelectChangeEvent"
          >
            <vxe-table-column type="checkbox" width="5%" align="center" />
            <vxe-table-column
              field="timeFormatted"
              :title="disp_time"
              :show-overflow="ellipsisMode"
              width="12%"
              align="center"
            />
            <vxe-table-column
              field="employeeInfo"
              :title="disp_employee"
              :show-overflow="ellipsisMode"
              width="15%"
              align="center"
            />
            <vxe-table-column
              field="source_name"
              :title="disp_camera"
              :show-overflow="ellipsisMode"
              width="18%"
              align="center"
            />
            <vxe-table-column :title="disp_direction" width="10%" align="center">
              <template #default="{ row }">
                <span :class="['direction-badge', row.presence_direction === 'IN' ? 'direction-in' : 'direction-out']">
                  {{ row.presence_direction }}
                </span>
              </template>
            </vxe-table-column>
            <vxe-table-column :title="disp_snapshot" width="20%" align="center">
              <template #default="{ row }">
                <div style="width:80px;height:80px;display:inline-block;">
                  <img
                    v-if="row.snapshotSrc"
                    :src="row.snapshotSrc"
                    width="80"
                    height="80"
                  />
                </div>
              </template>
            </vxe-table-column>
            <vxe-table-column :title="$t('Delete')" min-width="10%" align="center">
              <template #default="{ row }">
                <vxe-button class="btn btn-in-cell-danger btn-in-cell" @click="clickOnDelete(row)">
                  {{ $t('Delete') }}
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

    <!-- 例外處理 Modal -->
    <CModal
      :show.sync="flag_showExceptionModal"
      :centered="true"
      :close-on-backdrop="false"
      size="xl"
    >
      <template #header>
        <h5 class="mb-0">{{ disp_exceptionHandling }}</h5>
      </template>

      <div>
        <div class="h6 mb-3">{{ disp_filter }}</div>
        <CRow class="align-items-end mb-3">
          <CCol col="2">
            <label class="d-block mb-1">{{ disp_date }}</label>
            <div class="form-control form-control-lg" style="background-color: #e4e7ea;">
              {{ value_personDate }}
            </div>
          </CCol>
          <CCol col="2">
            <label class="d-block mb-1">{{ disp_startTime }}</label>
            <date-picker
              v-model="exc_startTimeValue"
              type="time"
              format="HH:mm"
              :lang="this.$globalDatePickerLanguage"
              style="width: 100%;"
            />
          </CCol>
          <CCol col="2">
            <label class="d-block mb-1">{{ disp_endTime }}</label>
            <date-picker
              v-model="exc_endTimeValue"
              type="time"
              format="HH:mm"
              :lang="this.$globalDatePickerLanguage"
              style="width: 100%;"
            />
          </CCol>
          <CCol col="4">
            <label class="d-block mb-1">{{ disp_camera }}</label>
            <multiselect
              v-model="exc_selectedDevices"
              :options="exc_deviceOptions"
              :multiple="true"
              :taggable="true"
              :hide-selected="true"
              label="name"
              track-by="uuid"
              placeholder=""
              :show-no-options="false"
            />
          </CCol>
          <CCol col="2">
            <CButton
              class="btn btn-primary btn-w-normal"
              size="lg"
              @click="clickOnExcSearch()"
            >
              {{ disp_search }}
            </CButton>
          </CCol>
        </CRow>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="h6">{{ disp_captureList }}</span>
            <span class="text-muted ml-2">{{ disp_totalRecords }}{{ exc_totalLength }}{{ disp_records }}</span>
          </div>
          <CButton
            color="primary"
            variant="outline"
            size="lg"
            @click="clickOnBatchAdd()"
            :disabled="exc_selectedRows.length === 0"
          >
            {{ disp_batchAdd }}
          </CButton>
        </div>

        <vxe-table
          :data="exc_dataItemsToShow"
          stripe
          align="center"
          :cell-style="cellStyle"
          :header-cell-style="headerCellStyle"
          ref="excTable"
          @checkbox-all="excSelectAllEvent"
          @checkbox-change="excSelectChangeEvent"
        >
          <vxe-table-column type="checkbox" width="5%" align="center" />
          <vxe-table-column
            field="timeFormatted"
            :title="disp_time"
            width="20%"
            align="center"
          />
          <vxe-table-column
            field="source_name"
            :title="disp_camera"
            width="25%"
            align="center"
          />
          <vxe-table-column :title="disp_snapshot" width="20%" align="center">
            <template #default="{ row }">
              <div style="width:60px;height:60px;display:inline-block;">
                <img
                  v-if="row.snapshotSrc"
                  :src="row.snapshotSrc"
                  width="60"
                  height="60"
                />
              </div>
            </template>
          </vxe-table-column>
          <vxe-table-column :title="disp_operation" min-width="20%" align="center">
            <template #default="{ row }">
              <CButton
                class="btn btn-primary"
                size="sm"
                @click="clickOnAddSingle(row)"
              >
                + {{ disp_addRecord }}
              </CButton>
            </template>
          </vxe-table-column>
        </vxe-table>

        <vxe-pager
          :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
          :current-page="exc_tablePage.currentPage"
          :page-size="exc_tablePage.pageSize"
          :total="exc_tablePage.totalResult"
          @page-change="excHandlePageChange"
        />
      </div>

      <template #footer>
        <CButton color="secondary" @click="flag_showExceptionModal = false">
          {{ $t('Cancel') }}
        </CButton>
        <CButton color="primary" @click="flag_showExceptionModal = false">
          {{ disp_close }}
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';
import * as echarts from 'echarts';
import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

const dayjs = require('dayjs');

const defaultlState = () => ({
  obj_loading: null,

  disp_return: i18n.formatter.format('Return'),
  disp_header: i18n.formatter.format('PresenceDetail'),
  disp_timeline: i18n.formatter.format('Timeline'),
  disp_eventList: i18n.formatter.format('EventList'),
  disp_totalRecords: i18n.formatter.format('TotalRecords'),
  disp_records: i18n.formatter.format('Records'),
  disp_exportExcel: i18n.formatter.format('ExportExcel'),
  disp_withPhoto: i18n.formatter.format('WithPhoto'),
  disp_withoutPhoto: i18n.formatter.format('WithoutPhoto'),
  disp_exceptionHandling: i18n.formatter.format('ExceptionHandling'),
  disp_inOfficeTime: i18n.formatter.format('InOfficeTime'),
  disp_outOfficeTime: i18n.formatter.format('OutOfficeTime'),

  disp_time: i18n.formatter.format('Time'),
  disp_employee: i18n.formatter.format('Employee'),
  disp_camera: i18n.formatter.format('Camera'),
  disp_direction: i18n.formatter.format('Direction'),
  disp_snapshot: i18n.formatter.format('Snapshot'),
  disp_filter: i18n.formatter.format('Filter'),
  disp_date: i18n.formatter.format('Date'),
  disp_startTime: i18n.formatter.format('StartTime'),
  disp_endTime: i18n.formatter.format('EndTime'),
  disp_search: i18n.formatter.format('Search'),
  disp_captureList: i18n.formatter.format('CaptureList'),
  disp_batchAdd: i18n.formatter.format('BatchAdd'),
  disp_addRecord: i18n.formatter.format('AddRecord'),
  disp_operation: i18n.formatter.format('Operation'),
  disp_close: i18n.formatter.format('Close'),

  value_returnRoutePath: '',
  value_returnRouteName: '',
  value_personUuid: '',
  value_personDate: '',
  value_personId: '',
  value_personName: '',
  value_listState: null,

  value_inTotalSeconds: 0,
  value_outTotalSeconds: 0,
  value_inTotalFormatted: '0h 00m',
  value_outTotalFormatted: '0h 00m',

  value_allEvents: [],
  value_dataItemsToShow: [],
  value_selectedRows: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },

  timelineChart: null,

  // 例外處理
  flag_showExceptionModal: false,
  exc_startTimeValue: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(),
  exc_endTimeValue: (() => { const d = new Date(); d.setHours(23, 59, 0, 0); return d; })(),
  exc_selectedDevices: [],
  exc_deviceOptions: [],
  exc_dataItemsToShow: [],
  exc_selectedRows: [],
  exc_totalLength: 0,
  exc_tablePage: {
    currentPage: 1,
    pageSize: 5,
    totalResult: 0,
  },
});

export default {
  name: 'PresenceDetailEvents',
  components: { Multiselect },
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    // 接收路由參數
    const { item } = this.$route.params;
    if (item) {
      cloneObject.value_returnRoutePath = this.$route.params.value_returnRoutePath || '';
      cloneObject.value_returnRouteName = this.$route.params.value_returnRouteName || '';
      cloneObject.value_personUuid = item.uuid || '';
      cloneObject.value_personDate = item.date || '';
      cloneObject.value_personId = item.person_id || item.id || '';
      cloneObject.value_personName = item.name || '';
      cloneObject.value_listState = this.$route.params.value_listState || null;
    }

    return cloneObject;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mixins: [TableObserver],
  created() {
    if (!this.value_personUuid) {
      this.$router.push({ name: 'PresenceDetail' });
      return;
    }
    this.fetchAllData();
  },
  mounted() {
    this.observeTableSize();
  },
  beforeDestroy() {
    if (this.timelineChart) {
      this.timelineChart.dispose();
      this.timelineChart = null;
    }
  },
  methods: {
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },

    formatSeconds(totalSeconds) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    },

    rowClassName({ row }) {
      return row.is_anomaly ? 'row-anomaly' : '';
    },

    clickOnReturn() {
      const params = {};
      if (this.value_listState) {
        params.value_listState = this.value_listState;
      }
      if (this.value_returnRoutePath) {
        this.$router.push({ name: this.value_returnRoutePath, params });
      } else {
        this.$router.push({ name: 'PresenceDetail', params });
      }
    },

    async fetchAllData() {
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

      const query = {
        uuid: this.value_personUuid,
        date: this.value_personDate,
        slice_shift: 0,
        slice_length: 99999,
      };

      try {
        const retResult = await this.$globalQueryPresenceDetail(query);

        if (!retResult.error && retResult.data) {
          const { data } = retResult;

          // 更新 summary 資訊
          if (data.summary) {
            this.value_inTotalSeconds = data.summary.in_total_seconds || 0;
            this.value_outTotalSeconds = data.summary.out_total_seconds || 0;
            this.value_inTotalFormatted = this.formatSeconds(this.value_inTotalSeconds);
            this.value_outTotalFormatted = this.formatSeconds(this.value_outTotalSeconds);
          }

          // 格式化全部事件資料
          this.value_allEvents = (data.events || []).map((evt) => ({
            ...evt,
            timeFormatted: dayjs(evt.timestamp).format('HH:mm:ss'),
            employeeInfo: `${evt.person_id} · ${evt.name}`,
          }));

          this.value_tablePage.totalResult = this.value_allEvents.length;

          // 用全部事件建立時間軸
          this.buildTimeline(this.value_allEvents);

          // 如果當前頁超出範圍，回到第一頁
          const maxPage = Math.ceil(this.value_allEvents.length / this.value_tablePage.pageSize) || 1;
          if (this.value_tablePage.currentPage > maxPage) {
            this.value_tablePage.currentPage = maxPage;
          }
          this.showPage(this.value_tablePage.currentPage);
        }
      } catch (ex) {
        console.log(ex);
      }

      if (this.obj_loading) this.obj_loading.hide();
    },

    showPage(page) {
      const start = (page - 1) * this.value_tablePage.pageSize;
      const end = page * this.value_tablePage.pageSize;
      const pageItems = this.value_allEvents.slice(start, end).map((evt) => ({
        ...evt,
        snapshotSrc: '',
      }));

      this.value_dataItemsToShow = pageItems;
      this.loadPagePhotos();
    },

    async loadPagePhotos() {
      for (let ii = 0; ii < this.value_dataItemsToShow.length; ii += 1) {
        const row = this.value_dataItemsToShow[ii];
        if (row.face_image_id) {
          const dataImage = await this.$globalFetchVerifyPhoto(row.face_image_id);
          if (dataImage.error == null && dataImage.data && dataImage.data.face_image) {
            this.$set(this.value_dataItemsToShow[ii], 'snapshotSrc', `data:image/jpeg;base64,${dataImage.data.face_image}`);
          }
        }
      }
    },

    buildTimeline(events) {
      if (this.timelineChart) {
        this.timelineChart.dispose();
        this.timelineChart = null;
      }
      if (!events || events.length === 0 || !this.$refs.timelineChart) return;

      const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
      const anomalyColor = '#d32f2f';
      const colorMap = { IN: '#81c784', OUT: '#ffb74d' };

      // 合併連續同方向事件為區段
      const segments = [];
      let segStart = sortedEvents[0];
      let segDir = segStart.presence_direction;
      let segAnomaly = segStart.is_anomaly;

      for (let i = 1; i < sortedEvents.length; i += 1) {
        const evt = sortedEvents[i];
        if (evt.presence_direction !== segDir) {
          segments.push({
            start: segStart.timestamp,
            end: evt.timestamp,
            dir: segDir,
            anomaly: segAnomaly,
          });
          segStart = evt;
          segDir = evt.presence_direction;
          segAnomaly = evt.is_anomaly;
        } else {
          segAnomaly = segAnomaly || evt.is_anomaly;
        }
      }
      const lastEnd = sortedEvents[sortedEvents.length - 1].timestamp;
      segments.push({
        start: segStart.timestamp,
        end: lastEnd < segStart.timestamp + 2000 ? segStart.timestamp + 2000 : lastEnd,
        dir: segDir,
        anomaly: segAnomaly,
      });

      // tooltip
      const tooltipFormatter = (params) => {
        const d = params.data;
        if (d && d.evt_direction !== undefined) {
          const dir = d.evt_direction;
          const flag = d.evt_anomaly ? ' <span style="color:#d32f2f;font-weight:bold">(異常)</span>' : '';
          return `<b style="color:${colorMap[dir] || '#333'}">${dir}</b>${flag}<br/>${d.evt_time}<br/>${d.evt_source}`;
        }
        const v = params.value;
        if (!v || v[3] === undefined) return '';
        const dir = v[3];
        const s = dayjs(v[1]).format('HH:mm:ss');
        const e = dayjs(v[2]).format('HH:mm:ss');
        const flag = v[4] ? ' <span style="color:#d32f2f;font-weight:bold">(異常)</span>' : '';
        return `<b style="color:${colorMap[dir]}">${dir}</b>${flag}<br/>${s} — ${e}`;
      };

      // 事件行：scatter 點標記
      const evtScatterData = sortedEvents.map((evt) => ({
        value: [evt.timestamp, '事件'],
        itemStyle: {
          color: evt.is_anomaly ? anomalyColor : (colorMap[evt.presence_direction] || '#ccc'),
        },
        evt_direction: evt.presence_direction,
        evt_time: dayjs(evt.timestamp).format('HH:mm:ss'),
        evt_source: evt.source_name || '',
        evt_anomaly: evt.is_anomaly,
      }));

      // 區段行（y=1 對應 '區段'）
      const segBarData = segments.map((seg) => ({
        value: ['區段', seg.start, seg.end, seg.dir, seg.anomaly],
        itemStyle: { color: colorMap[seg.dir] || '#ccc' },
      }));

      const chart = echarts.init(this.$refs.timelineChart);
      this.timelineChart = chart;

      chart.setOption({
        tooltip: { formatter: tooltipFormatter },
        grid: {
          left: 80, right: 20, top: 10, bottom: 30,
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter(val) {
              return dayjs(val).format('HH:mm:ss');
            },
            fontSize: 11,
          },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'category',
          data: ['事件', '區段'],
          axisLabel: { fontSize: 12, color: '#666' },
          axisTick: { show: false },
          axisLine: { show: false },
        },
        series: [
          // 區段色塊
          {
            type: 'custom',
            renderItem(params, api) {
              const startCoord = api.coord([api.value(1), api.value(0)]);
              const endCoord = api.coord([api.value(2), api.value(0)]);
              const barHeight = api.size([0, 1])[1] * 0.45;
              const hasAnomaly = api.value(4);
              const rect = echarts.graphic.clipRectByRect(
                {
                  x: startCoord[0],
                  y: startCoord[1] - barHeight / 2,
                  width: Math.max(endCoord[0] - startCoord[0], 6),
                  height: barHeight,
                },
                {
                  x: params.coordSys.x,
                  y: params.coordSys.y,
                  width: params.coordSys.width,
                  height: params.coordSys.height,
                },
              );
              if (!rect) return null;
              return {
                type: 'rect',
                shape: { ...rect, r: 4 },
                style: {
                  ...api.style(),
                  stroke: hasAnomaly ? anomalyColor : 'transparent',
                  lineWidth: hasAnomaly ? 2 : 0,
                },
              };
            },
            encode: { x: [1, 2], y: 0 },
            data: segBarData,
          },
          // 事件點標記（窄長條）
          {
            type: 'scatter',
            symbol: 'path://M-1,-4.5Q-1,-5,0,-5Q1,-5,1,-4.5L1,4.5Q1,5,0,5Q-1,5,-1,4.5Z',
            symbolSize: [8, 24],
            z: 10,
            data: evtScatterData,
          },
        ],
      });

      window.addEventListener('resize', () => {
        if (this.timelineChart) this.timelineChart.resize();
      });
    },

    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_selectedRows = [];
      this.showPage(currentPage);
      this.resizeOneTable();
    },

    mainSelectAllEvent({ records }) {
      this.value_selectedRows = records;
    },

    mainSelectChangeEvent({ records }) {
      this.value_selectedRows = records;
    },

    clickOnBatchDelete() {
      const rows = this.value_selectedRows;
      if (rows.length === 0) return;

      this.$confirm('', i18n.formatter.format('ConfirmToDelete'), 'question', {
        confirmButtonText: i18n.formatter.format('Confirm'),
        cancelButtonText: i18n.formatter.format('Cancel'),
        confirmButtonColor: '#20a8d8',
        cancelButtonColor: '#f86c6b',
      }).then(async () => {
        let successCount = 0;
        for (let i = 0; i < rows.length; i += 1) {
          const ret = await this.$globalDeletePresenceEvent({
            verify_uuid: rows[i].verify_uuid,
            date: this.value_personDate,
          });
          if (!ret.error) successCount += 1;
        }

        this.$fire({
          text: `${successCount} / ${rows.length} ${i18n.formatter.format('OperationSuccess')}`,
          type: successCount > 0 ? 'success' : 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });

        this.value_selectedRows = [];
        this.fetchAllData();
      }).catch(() => {});
    },

    async clickOnExceptionHandling() {
      this.exc_dataItemsToShow = [];
      this.exc_selectedRows = [];
      this.exc_totalLength = 0;
      this.exc_tablePage.currentPage = 1;
      this.exc_tablePage.totalResult = 0;
      const startD = new Date();
      startD.setHours(0, 0, 0, 0);
      this.exc_startTimeValue = startD;
      const endD = new Date();
      endD.setHours(23, 59, 0, 0);
      this.exc_endTimeValue = endD;
      this.exc_selectedDevices = [];

      // 抓取有設定 IN/OUT 的設備
      const [cameraRet, tabletRet] = await Promise.all([
        this.$globalFindCameras('', 0, 3000),
        this.$globalGetTabletList('', 0, 3000),
      ]);

      const devices = [];
      if (cameraRet.data && cameraRet.data.list) {
        cameraRet.data.list.forEach((cam) => {
          if (cam.presence_direction && cam.presence_direction !== 'NONE') {
            devices.push({ uuid: cam.uuid, name: cam.name });
          }
        });
      }
      if (tabletRet.data && tabletRet.data.data_list) {
        tabletRet.data.data_list.forEach((tab) => {
          if (tab.presence_direction && tab.presence_direction !== 'NONE') {
            devices.push({ uuid: tab.uuid, name: tab.name });
          }
        });
      }
      this.exc_deviceOptions = devices;
      this.flag_showExceptionModal = true;
    },

    clickOnExcSearch() {
      this.exc_tablePage.currentPage = 1;
      this.exc_selectedRows = [];
      this.excFetchPage(1);
    },

    async excFetchPage(page) {
      const dateStr = this.value_personDate;
      const startDate = new Date(dateStr);
      startDate.setHours(this.exc_startTimeValue.getHours(), this.exc_startTimeValue.getMinutes(), 0, 0);
      const endDate = new Date(dateStr);
      endDate.setHours(this.exc_endTimeValue.getHours(), this.exc_endTimeValue.getMinutes(), 59, 999);

      const sourceIds = this.exc_selectedDevices.map((d) => d.uuid);
      const shift = (page - 1) * this.exc_tablePage.pageSize;

      const query = {
        start_time: startDate.getTime(),
        end_time: endDate.getTime(),
        source_ids: sourceIds,
        uuid: this.value_personUuid,
        slice_shift: shift,
        slice_length: this.exc_tablePage.pageSize,
      };

      try {
        const ret = await this.$globalQueryPresenceCandidates(query);
        if (!ret.error && ret.data) {
          this.exc_totalLength = ret.data.total_length || 0;
          this.exc_tablePage.totalResult = ret.data.total_length || 0;

          this.exc_dataItemsToShow = (ret.data.events || ret.data.result || []).map((evt) => ({
            ...evt,
            timeFormatted: dayjs(evt.timestamp).format('HH:mm:ss'),
            snapshotSrc: '',
          }));

          // 非同步載入當頁照片
          for (let ii = 0; ii < this.exc_dataItemsToShow.length; ii += 1) {
            const row = this.exc_dataItemsToShow[ii];
            if (row.face_image_id) {
              const dataImage = await this.$globalFetchVerifyPhoto(row.face_image_id);
              if (dataImage.error == null && dataImage.data && dataImage.data.face_image) {
                this.$set(this.exc_dataItemsToShow[ii], 'snapshotSrc', `data:image/jpeg;base64,${dataImage.data.face_image}`);
              }
            }
          }
        }
      } catch (ex) {
        console.log(ex);
      }
    },

    excHandlePageChange({ currentPage, pageSize }) {
      this.exc_tablePage.currentPage = currentPage;
      this.exc_tablePage.pageSize = pageSize;
      this.exc_selectedRows = [];
      this.excFetchPage(currentPage);
    },

    excSelectAllEvent({ records }) {
      this.exc_selectedRows = records;
    },

    excSelectChangeEvent({ records }) {
      this.exc_selectedRows = records;
    },

    async clickOnAddSingle(row) {
      const ret = await this.$globalCreatePresenceException({
        verify_uuid: row.verify_uuid,
        uuid: this.value_personUuid,
        date: this.value_personDate,
      });
      if (!ret.error) {
        this.$fire({
          text: i18n.formatter.format('OperationSuccess'),
          type: 'success',
          timer: 2000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
        // 重新抓例外處理清單和事件列表
        this.excFetchPage(this.exc_tablePage.currentPage);
        this.fetchAllData();
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

    async clickOnBatchAdd() {
      const rows = this.exc_selectedRows;
      if (rows.length === 0) return;

      let successCount = 0;
      for (let i = 0; i < rows.length; i += 1) {
        const ret = await this.$globalCreatePresenceException({
          verify_uuid: rows[i].verify_uuid,
          uuid: this.value_personUuid,
          date: this.value_personDate,
        });
        if (!ret.error) successCount += 1;
      }

      this.$fire({
        text: `${successCount} / ${rows.length} ${i18n.formatter.format('OperationSuccess')}`,
        type: successCount > 0 ? 'success' : 'error',
        timer: 3000,
        confirmButtonColor: '#20a8d8',
        confirmButtonText: i18n.formatter.format('OK'),
      });

      // 重新抓例外處理清單和事件列表
      this.exc_selectedRows = [];
      this.excFetchPage(this.exc_tablePage.currentPage);
      this.fetchAllData();
    },

    clickOnDelete(row) {
      this.$confirm('', i18n.formatter.format('ConfirmToDelete'), 'question', {
        confirmButtonText: i18n.formatter.format('Confirm'),
        cancelButtonText: i18n.formatter.format('Cancel'),
        confirmButtonColor: '#20a8d8',
        cancelButtonColor: '#f86c6b',
      }).then(async () => {
        const ret = await this.$globalDeletePresenceEvent({
          verify_uuid: row.verify_uuid,
          date: this.value_personDate,
        });
        if (!ret.error) {
          this.$fire({
            text: i18n.formatter.format('OperationSuccess'),
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: i18n.formatter.format('OK'),
          });
          this.fetchAllData();
        } else {
          this.$fire({
            text: i18n.formatter.format('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: i18n.formatter.format('OK'),
          });
        }
      }).catch(() => {});
    },

    async exportExcel(withPhoto) {
      const self = this;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('PresenceDetailEvents');

      const columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: self.disp_time, key: 'time', width: 15 },
        { header: self.disp_employee, key: 'employee', width: 20 },
        { header: self.disp_camera, key: 'camera', width: 20 },
        { header: self.disp_direction, key: 'direction', width: 10 },
      ];
      if (withPhoto) {
        columns.push({ header: self.disp_snapshot, key: 'photo', width: 15 });
      }
      worksheet.columns = columns;

      for (let idx = 0; idx < self.value_allEvents.length; idx += 1) {
        const evt = self.value_allEvents[idx];
        worksheet.addRow({
          No: idx + 1,
          time: evt.timeFormatted,
          employee: evt.employeeInfo,
          camera: evt.source_name,
          direction: evt.presence_direction,
        });

        if (withPhoto && evt.face_image_id) {
          const dataImage = await self.$globalFetchVerifyPhoto(evt.face_image_id);
          if (dataImage.error == null && dataImage.data && dataImage.data.face_image) {
            const photoId = workbook.addImage({
              base64: dataImage.data.face_image,
              extension: 'jpeg',
            });
            worksheet.lastRow.height = 60;
            worksheet.addImage(photoId, `F${worksheet.rowCount}:F${worksheet.rowCount}`);
          }
        }
      }

      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, `PresenceDetail-${self.value_personId}-${self.value_personDate}.xlsx`);
      });
    },
  },
};
</script>

<style scoped>
/* Presence stat box */
.presence-stat-box {
  text-align: center;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  white-space: nowrap;
}

.presence-stat-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.presence-stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

/* Direction badge */
.direction-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.direction-in {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.direction-out {
  background-color: #fff3e0;
  color: #e65100;
}
</style>

<style>
.PresenceDetailEvents td,
.PresenceDetailEvents th {
  font-size: 15px !important;
}

.PresenceDetailEvents .row-anomaly td {
  color: #d32f2f !important;
}

.PresenceDetailEvents .btn:disabled,
.PresenceDetailEvents .btn[disabled] {
  cursor: not-allowed !important;
  pointer-events: auto !important;
  opacity: 0.65;
}
</style>
