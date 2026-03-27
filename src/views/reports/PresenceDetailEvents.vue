<template>
  <div class="PresenceDetailEvents">
    <div>
      <CCol sm="12">
        <CRow class="align-items-center">
          <CButton
            class="btn btn-outline-primary btn-w-normal mr-3"
            size="lg"
            @click="clickOnReturn()"
          >
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
            <div class="h5 mb-2">{{ disp_timeline }}</div>
            <div class="timeline-labels d-flex justify-content-between mb-1">
              <span class="timeline-hour">{{ timelineStartLabel }}</span>
              <span class="timeline-hour">{{ timelineEndLabel }}</span>
            </div>
            <div class="timeline-bar">
              <div
                v-for="(seg, idx) in timelineSegments"
                :key="'s' + idx"
                class="timeline-segment"
                :class="[seg.direction === 'IN' ? 'seg-in' : 'seg-out', { 'seg-anomaly': seg.isAnomaly }]"
                :style="{ left: seg.left + '%', width: seg.width + '%' }"
                :title="seg.label"
              />
            </div>
            <div class="timeline-markers">
              <div
                v-for="(mk, idx) in timelineMarkers"
                :key="'m' + idx"
                class="timeline-marker-item"
                :class="{ 'marker-anomaly': mk.isAnomaly }"
                :style="{ left: mk.left + '%' }"
              >
                <div class="marker-dir">{{ mk.direction }}</div>
                <div class="marker-time">{{ mk.time }}</div>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <div class="presence-stat-box mr-2">
              <div class="presence-stat-title">{{ disp_inOfficeTime }}</div>
              <div class="presence-stat-value">{{ value_inTotalFormatted }}</div>
            </div>
            <div class="presence-stat-box">
              <div class="presence-stat-title">{{ disp_outOfficeTime }}</div>
              <div class="presence-stat-value">{{ value_outTotalFormatted }}</div>
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
            <span class="text-muted ml-2">{{ disp_totalRecords }}{{ value_tablePage.totalResult }}{{ disp_records }}</span>
          </div>
          <div>
            <CButton
              class="btn btn-primary btn-w-normal mr-2"
              size="lg"
              @click="clickOnExceptionHandling()"
            >
              {{ disp_exceptionHandling }}
            </CButton>
            <CButton
              class="btn btn-outline-primary btn-w-normal"
              size="lg"
              @click="exportExcel()"
            >
              {{ disp_exportExcel }}
            </CButton>
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
          >
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
            <vxe-table-column
              :title="disp_direction"
              width="10%"
              align="center"
            >
              <template #default="{ row }">
                <span :class="['direction-badge', row.presence_direction === 'IN' ? 'direction-in' : 'direction-out']">
                  {{ row.presence_direction }}
                </span>
              </template>
            </vxe-table-column>
            <vxe-table-column
              :title="disp_snapshot"
              width="12%"
              align="center"
              field="imgSnapshot"
              type="html"
            />
            <vxe-table-column
              :title="$t('Delete')"
              min-width="10%"
              align="center"
            >
              <template #default="{ row }">
                <vxe-button
                  class="btn btn-in-cell-danger btn-in-cell"
                  @click="clickOnDelete(row)"
                >
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
  </div>
</template>

<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';

const dayjs = require('dayjs');

const VALUE_EMPTY_PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==';

const defaultlState = () => ({
  obj_loading: null,

  disp_return: i18n.formatter.format('Return'),
  disp_header: i18n.formatter.format('PresenceDetail'),
  disp_timeline: i18n.formatter.format('Timeline'),
  disp_eventList: i18n.formatter.format('EventList'),
  disp_totalRecords: i18n.formatter.format('TotalRecords'),
  disp_records: i18n.formatter.format('Records'),
  disp_exportExcel: i18n.formatter.format('ExportExcel'),
  disp_exceptionHandling: i18n.formatter.format('ExceptionHandling'),
  disp_inOfficeTime: i18n.formatter.format('InOfficeTime'),
  disp_outOfficeTime: i18n.formatter.format('OutOfficeTime'),

  disp_time: i18n.formatter.format('Time'),
  disp_employee: i18n.formatter.format('Employee'),
  disp_camera: i18n.formatter.format('Camera'),
  disp_direction: i18n.formatter.format('Direction'),
  disp_snapshot: i18n.formatter.format('Snapshot'),

  value_returnRoutePath: '',
  value_returnRouteName: '',
  value_personUuid: '',
  value_personDate: '',
  value_personId: '',
  value_personName: '',

  value_inTotalSeconds: 0,
  value_outTotalSeconds: 0,
  value_inTotalFormatted: '0h 00m',
  value_outTotalFormatted: '0h 00m',

  value_allEvents: [],
  value_dataItemsToShow: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },

  timelineSegments: [],
  timelineMarkers: [],
  timelineStartLabel: '',
  timelineEndLabel: '',
});

export default {
  name: 'PresenceDetailEvents',
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    // 接收路由參數
    const item = this.$route.params.item;
    if (item) {
      cloneObject.value_returnRoutePath = this.$route.params.value_returnRoutePath || '';
      cloneObject.value_returnRouteName = this.$route.params.value_returnRouteName || '';
      cloneObject.value_personUuid = item.uuid || '';
      cloneObject.value_personDate = item.date || '';
      cloneObject.value_personId = item.person_id || item.id || '';
      cloneObject.value_personName = item.name || '';
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
      if (this.value_returnRoutePath) {
        this.$router.push({ name: this.value_returnRoutePath });
      } else {
        this.$router.push({ name: 'PresenceDetail' });
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

          // 顯示第一頁
          this.showPage(1);
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
        imgSnapshot: `<img id='snap${evt.verify_uuid}' width='80' height='80' src='${VALUE_EMPTY_PHOTO}'>`,
      }));

      this.value_dataItemsToShow = Object.assign([], pageItems);

      // 非同步載入當頁照片
      this.loadPagePhotos();
    },

    async loadPagePhotos() {
      for (let ii = 0; ii < this.value_dataItemsToShow.length; ii += 1) {
        const row = this.value_dataItemsToShow[ii];
        if (row.face_image_id) {
          const dataImage = await this.$globalFetchVerifyPhoto(row.face_image_id);
          if (dataImage.error == null && dataImage.data) {
            const ele = document.getElementById(`snap${row.verify_uuid}`);
            if (ele) ele.src = `data:image/jpeg;base64,${dataImage.data.face_image}`;
          }
        }
      }
    },

    buildTimeline(events) {
      if (!events || events.length === 0) {
        this.timelineSegments = [];
        this.timelineMarkers = [];
        this.timelineStartLabel = '';
        this.timelineEndLabel = '';
        return;
      }

      const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
      const firstTs = sortedEvents[0].timestamp;
      const lastTs = sortedEvents[sortedEvents.length - 1].timestamp;

      this.timelineStartLabel = dayjs(firstTs).format('HH:mm:ss');
      this.timelineEndLabel = dayjs(lastTs).format('HH:mm:ss');

      const totalMs = lastTs - firstTs;

      // 產生每筆事件的標記
      const markers = [];
      sortedEvents.forEach((evt) => {
        const leftPct = totalMs > 0 ? ((evt.timestamp - firstTs) / totalMs) * 100 : 50;
        markers.push({
          left: leftPct,
          direction: evt.presence_direction,
          time: dayjs(evt.timestamp).format('HH:mm:ss'),
          isAnomaly: evt.is_anomaly,
        });
      });
      this.timelineMarkers = markers;

      if (totalMs <= 0) {
        this.timelineSegments = [];
        return;
      }

      // 產生區段（相鄰事件之間的色塊）
      const segments = [];
      for (let i = 0; i < sortedEvents.length - 1; i += 1) {
        const curr = sortedEvents[i];
        const next = sortedEvents[i + 1];
        const leftPct = ((curr.timestamp - firstTs) / totalMs) * 100;
        const widthPct = ((next.timestamp - curr.timestamp) / totalMs) * 100;

        segments.push({
          left: leftPct,
          width: Math.max(widthPct, 0.3),
          direction: curr.presence_direction,
          isAnomaly: curr.is_anomaly,
          label: `${dayjs(curr.timestamp).format('HH:mm:ss')} - ${dayjs(next.timestamp).format('HH:mm:ss')} (${curr.presence_direction})`,
        });
      }
      this.timelineSegments = segments;
    },

    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.showPage(currentPage);
      this.resizeOneTable();
    },

    clickOnExceptionHandling() {
      // TODO: 實作例外處理功能
      console.log('Exception handling');
    },

    clickOnDelete(row) {
      // TODO: 實作刪除事件功能
      console.log('Delete event:', row.verify_uuid);
    },

    async exportExcel() {
      const self = this;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('PresenceDetailEvents');

      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: self.disp_time, key: 'time', width: 15 },
        { header: self.disp_employee, key: 'employee', width: 20 },
        { header: self.disp_camera, key: 'camera', width: 20 },
        { header: self.disp_direction, key: 'direction', width: 10 },
      ];

      self.value_allEvents.forEach((evt, idx) => {
        worksheet.addRow({
          No: idx + 1,
          time: evt.timeFormatted,
          employee: evt.employeeInfo,
          camera: evt.source_name,
          direction: evt.presence_direction,
        });
      });

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
/* 時間軸 */
.timeline-container {
  position: relative;
}

.timeline-hour {
  font-size: 12px;
  color: #999;
}

.timeline-bar {
  position: relative;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.timeline-segment {
  position: absolute;
  top: 0;
  height: 100%;
}

.seg-in {
  background-color: #a5d6a7;
}

.seg-out {
  background-color: #ffcc80;
}

.seg-anomaly {
  background-color: #ef9a9a;
}

/* Timeline markers */
.timeline-markers {
  position: relative;
  height: 36px;
  margin-top: 4px;
}

.timeline-marker-item {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
  line-height: 1.2;
}

.timeline-marker-item .marker-dir {
  font-size: 11px;
  font-weight: 600;
  color: #555;
}

.timeline-marker-item .marker-time {
  font-size: 10px;
  color: #999;
}

.timeline-marker-item.marker-anomaly .marker-dir,
.timeline-marker-item.marker-anomaly .marker-time {
  color: #d32f2f;
  font-weight: bold;
}

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
</style>
