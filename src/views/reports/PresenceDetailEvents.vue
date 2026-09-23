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

    <!-- 查詢條件 -->
    <CRow class="align-items-end mb-3 ml-0">
      <div class="mr-3">
        <label class="d-block mb-1">{{ disp_startTime }}</label>
        <CSelect
          class="mb-0"
          size="lg"
          :value.sync="value_startHour"
          :options="value_startHourOptions"
        />
      </div>
      <div class="mr-3">
        <label class="d-block mb-1">{{ disp_endTime }}</label>
        <CSelect
          class="mb-0"
          size="lg"
          :value.sync="value_endHour"
          :options="value_endHourOptions"
        />
      </div>
      <div class="mr-3">
        <label class="d-block mb-1">{{ disp_outOfficeTime }}</label>
        <CSelect
          class="mb-0"
          size="lg"
          :value.sync="value_awayThresholdMinutes"
          :options="value_awayThresholdOptions"
        />
      </div>
      <CButton class="btn btn-primary btn-w-normal" size="lg" @click="clickOnSubmit()">
        {{ disp_submit }}
      </CButton>
    </CRow>

    <div class="d-flex mb-3">
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

    <!-- 時間軸 -->
    <CCard>
      <CCardBody>
        <div class="h5 mb-4">
          {{ disp_timeline }}
        </div>
        <div class="d-flex align-items-start">
          <div class="timeline-label">
            {{ disp_segment }}
          </div>
          <div class="flex-grow-1">
            <div class="timeline-track">
              <div
                v-for="(seg, idx) in value_timelineSegments"
                :key="`${seg.start}-${idx}`"
                :class="['timeline-seg', `timeline-seg-${seg.state}`,
                         seg.tiny ? 'timeline-seg-tiny' : '',
                         value_selectedSegmentIndex === idx ? 'timeline-seg-active' : '']"
                :style="{ left: seg.left, width: seg.width }"
                :title="seg.tooltip"
                @click="clickOnSegment(seg, idx)"
              />
            </div>
            <div class="timeline-axis">
              <span
                v-for="tick in value_axisTicks"
                :key="tick.label"
                class="timeline-tick"
                :style="{ left: tick.left }"
              >{{ tick.label }}</span>
            </div>
            <div v-if="!value_selectedRange" class="text-muted mt-2">
              {{ disp_selectSegmentForDetail }}
            </div>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <!-- 事件列表：點了非上班時間以外的區段才出現 -->
    <CCard v-if="value_selectedRange">
      <CCardBody>
        <CRow class="justify-content-between align-items-center mb-3">
          <div>
            <span class="h5">{{ disp_eventList }}</span>
            <span class="text-muted ml-2">
              {{ value_selectedRangeText }}
            </span>
            <span class="text-muted ml-2"
              >{{ disp_totalRecords }}{{ value_tablePage.totalResult }}{{ disp_records }}</span
            >
          </div>
          <div>
            <CButton
              class="btn btn-primary btn-w-normal mr-2"
              size="lg"
              :disabled="!value_canHandleException"
              @click="clickOnExceptionHandling()"
            >
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
          >
            <vxe-table-column
              field="timeFormatted"
              :title="disp_time"
              :show-overflow="ellipsisMode"
              sortable
              width="15%"
              align="center"
            />
            <vxe-table-column
              field="employeeInfo"
              :title="disp_employee"
              :show-overflow="ellipsisMode"
              sortable
              width="18%"
              align="center"
            />
            <vxe-table-column
              field="source_name"
              :title="disp_camera"
              :show-overflow="ellipsisMode"
              sortable
              width="22%"
              align="center"
            />
            <vxe-table-column
              field="presence_direction"
              :title="disp_direction"
              sortable
              width="12%"
              align="center"
            >
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
            <vxe-table-column :title="disp_remarks" width="13%" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'manual'" class="d-flex align-items-center justify-content-center">
                  <span class="manual-remark">{{ disp_exceptionHandling }}</span>
                  <button
                    type="button"
                    class="manual-remark-delete ml-2"
                    :title="$t('Delete')"
                    @click="clickOnDeleteException(row)"
                  >
                    <CIcon name="cil-trash" size="lg" />
                  </button>
                </div>
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

    <!-- 例外處理 Modal：手動補一筆 IN 紀錄，時間必須落在所選區段內 -->
    <CModal
      :show.sync="flag_showExceptionModal"
      :centered="true"
      :close-on-backdrop="false"
      size="lg"
    >
      <template #header>
        <h5 class="mb-0">
          {{ disp_exceptionHandling }}
        </h5>
      </template>

      <CRow class="align-items-end">
        <CCol col="3">
          <label class="d-block mb-1">{{ disp_direction }}</label>
          <div class="form-control form-control-lg exc-readonly">
            <span class="direction-badge direction-in">IN</span>
          </div>
        </CCol>
        <CCol col="4">
          <label class="d-block mb-1">{{ disp_date }}</label>
          <div class="form-control form-control-lg exc-readonly">
            {{ value_personDate }}
          </div>
        </CCol>
        <CCol col="5">
          <label class="d-block mb-1">{{ disp_time }}</label>
          <date-picker
            v-model="exc_timeValue"
            type="time"
            format="HH:mm:ss"
            :show-second="true"
            :lang="$globalDatePickerLanguage"
            :clearable="false"
            style="width: 100%;"
          />
        </CCol>
      </CRow>
      <div class="text-muted mt-2">
        {{ disp_timeMustBeInSegment }}{{ value_selectedRangeText }}
      </div>

      <template #footer>
        <CButton color="secondary" @click="flag_showExceptionModal = false">
          {{ $t('Cancel') }}
        </CButton>
        <CButton color="primary" @click="clickOnAddException()">
          {{ disp_addRecord }}
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

const dayjs = require('dayjs');

// 時間軸刻度數量（0~24 時剛好每 3 小時一格）
const AXIS_TICK_COUNT = 8;

// 佔比低於這個值的區段一律以最小寬度呈現（時間軸約 1200px 寬，0.4% 差不多 5px）
const TINY_SEGMENT_RATIO = 0.004;

// 不在辦公室時間的門檻選項（分鐘）
const AWAY_THRESHOLD_OPTIONS = [10, 20, 30, 60];

const defaultlState = () => ({
  obj_loading: null,
  // 同時有多層查詢在跑時，遮罩只開一個、全部結束才收
  value_loadingCount: 0,

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
  disp_submit: i18n.formatter.format('Submit'),
  disp_segment: i18n.formatter.format('Segment'),
  disp_selectSegmentForDetail: i18n.formatter.format('SelectSegmentForDetail'),

  disp_time: i18n.formatter.format('Time'),
  disp_employee: i18n.formatter.format('Employee'),
  disp_camera: i18n.formatter.format('Camera'),
  disp_direction: i18n.formatter.format('Direction'),
  disp_snapshot: i18n.formatter.format('Snapshot'),
  disp_remarks: i18n.formatter.format('Remarks'),
  disp_date: i18n.formatter.format('Date'),
  disp_startTime: i18n.formatter.format('StartTime'),
  disp_endTime: i18n.formatter.format('EndTime'),
  disp_addRecord: i18n.formatter.format('AddRecord'),
  disp_timeMustBeInSegment: i18n.formatter.format('TimeMustBeInSegment'),

  value_returnRoutePath: '',
  value_returnRouteName: '',
  value_personUuid: '',
  value_personDate: '',
  value_personId: '',
  value_personName: '',
  value_listState: null,

  value_inTotalSeconds: 0,
  value_outTotalSeconds: 0,
  value_inTotalFormatted: '0s',
  value_outTotalFormatted: '0s',

  // 查詢條件（送出時才寫進 value_queried*，畫面一律依已查詢的區間渲染，
  // 避免改了下拉還沒送出，時間軸就先跟著位移）
  value_startHour: 0,
  value_endHour: 24,
  value_queriedStartHour: 0,
  value_queriedEndHour: 24,
  value_awayThresholdMinutes: AWAY_THRESHOLD_OPTIONS[0],

  // 後端回傳的原始區段，首尾相接，只涵蓋第一筆 IN 到最後一筆 OUT
  value_records: [],
  value_selectedSegmentIndex: -1,
  value_selectedRange: null,

  value_allEvents: [],
  value_dataItemsToShow: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },

  // 例外處理：只補一筆 IN 紀錄，方向與日期固定，僅時間可調
  flag_showExceptionModal: false,
  exc_timeValue: null,
});

export default {
  name: 'PresenceDetailEvents',
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

    value_startHourOptions() {
      return this.hourOptions(0, 23);
    },

    value_endHourOptions() {
      return this.hourOptions(1, 24);
    },

    // 專案把 vue-i18n 的 formatter 換成只查 key 的版本（src/i18n/index.js），
    // 沒有 interpolate，$t 的參數不會生效，佔位符只能自己代入
    value_awayThresholdOptions() {
      return AWAY_THRESHOLD_OPTIONS.map((minutes) => ({
        value: minutes,
        label: i18n.formatter.format('AwayOverMinutes').replace('{minutes}', minutes),
      }));
    },

    value_windowStart() {
      return this.hourToEpoch(this.value_queriedStartHour);
    },

    value_windowEnd() {
      return this.hourToEpoch(this.value_queriedEndHour);
    },

    // 後端只給第一筆 IN 到最後一筆 OUT，兩端的非上班時間由前端補灰。
    // 整天沒資料時後端不回記錄，補出來就是一整條灰的。
    value_timelineSegments() {
      const windowStart = this.value_windowStart;
      const windowEnd = this.value_windowEnd;
      const total = windowEnd - windowStart;
      if (total <= 0) return [];

      const thresholdMs = this.value_awayThresholdMinutes * 60000;
      const records = this.value_records;
      const head = records.length ? records[0].start : windowEnd;
      const tail = records.length ? records[records.length - 1].end : windowEnd;

      const segments = [];
      if (head > windowStart) segments.push({ start: windowStart, end: head, state: 'off' });

      records.forEach((record) => {
        const duration = record.end - record.start;
        let state = 'in';
        // 紅色（超時）純粹是長度比門檻，由前端判定，改下拉不用重打 API
        if (record.isSlacking) state = duration >= thresholdMs ? 'away-over' : 'away';

        segments.push({ start: record.start, end: record.end, state });
      });

      if (tail < windowEnd) segments.push({ start: tail, end: windowEnd, state: 'off' });

      return segments.map((seg) => {
        const ratio = (seg.end - seg.start) / total;

        return {
          ...seg,
          left: `${((seg.start - windowStart) / total) * 100}%`,
          width: `${ratio * 100}%`,
          // 短到換算後不足幾個像素的區段，交給 CSS 撐到最小寬度並疊到上層，
          // 否則會被後面相鄰的區段蓋掉（區段是絕對定位、依時間排在 DOM 裡）
          tiny: ratio < TINY_SEGMENT_RATIO,
          tooltip: this.segmentTooltip(seg),
        };
      });
    },

    value_axisTicks() {
      const startMinutes = this.value_queriedStartHour * 60;
      const totalMinutes = (this.value_queriedEndHour - this.value_queriedStartHour) * 60;
      if (totalMinutes <= 0) return [];

      return Array.from({ length: AXIS_TICK_COUNT + 1 }, (unused, idx) => {
        const minutes = startMinutes + (totalMinutes * idx) / AXIS_TICK_COUNT;
        const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
        const mm = String(Math.round(minutes % 60)).padStart(2, '0');

        return { label: `${hh}:${mm}`, left: `${(idx / AXIS_TICK_COUNT) * 100}%` };
      });
    },

    value_selectedRangeText() {
      if (!this.value_selectedRange) return '';

      const { start, end } = this.value_selectedRange;
      return `${dayjs(start).format('HH:mm:ss')} — ${dayjs(end).format('HH:mm:ss')}`;
    },

    // 只有離開的區段（黃、紅）才需要補 IN 紀錄；在辦公室（綠）與非上班時間（灰）不開放例外處理
    value_canHandleException() {
      const seg = this.value_timelineSegments[this.value_selectedSegmentIndex];
      return !!seg && (seg.state === 'away' || seg.state === 'away-over');
    },
  },
  mixins: [TableObserver],
  created() {
    if (!this.value_personUuid) {
      this.$router.push({ name: 'PresenceDetail' });
      return;
    }
    this.fetchTimeline();
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

    // fetchTimeline() 內會再呼叫 fetchSegmentEvents()，兩層各自開關遮罩的話，
    // 內層會把 obj_loading 的參照蓋掉，外層那個遮罩就永遠關不掉了
    showLoading() {
      this.value_loadingCount += 1;
      if (!this.obj_loading) {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
      }
    },

    hideLoading() {
      this.value_loadingCount = Math.max(this.value_loadingCount - 1, 0);
      if (this.value_loadingCount > 0 || !this.obj_loading) return;

      this.obj_loading.hide();
      this.obj_loading = null;
    },

    // 依長度決定精度：短到只有幾秒的區段若只顯示到分鐘會變成 0h 00m，看不出差別
    formatSeconds(totalSeconds) {
      const seconds = Math.max(Math.round(totalSeconds || 0), 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const rest = seconds % 60;

      if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
      if (minutes > 0) return `${minutes}m ${String(rest).padStart(2, '0')}s`;
      return `${rest}s`;
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

    hourOptions(from, to) {
      return Array.from({ length: to - from + 1 }, (unused, idx) => {
        const hour = from + idx;
        return { value: hour, label: `${String(hour).padStart(2, '0')}:00` };
      });
    },

    // 查詢區間固定在當日之內，不跨日；24 點即隔天 00:00
    hourToEpoch(hour) {
      const date = new Date(this.value_personDate);
      date.setHours(0, 0, 0, 0);
      return date.getTime() + hour * 3600000;
    },

    segmentStateText(state) {
      switch (state) {
        case 'in':
          return this.$t('InOffice');
        case 'away':
          return this.$t('OutOffice');
        case 'away-over':
          return this.$t('AwayExceeded');
        default:
          return this.$t('OffDuty');
      }
    },

    segmentTooltip(seg) {
      const range = `${dayjs(seg.start).format('HH:mm:ss')} — ${dayjs(seg.end).format('HH:mm:ss')}`;
      const duration = this.formatSeconds(Math.round((seg.end - seg.start) / 1000));

      return `${this.segmentStateText(seg.state)}\n${range}\n${duration}`;
    },

    // summary 的 in_total_seconds / out_total_seconds 名為 seconds，實際回的是毫秒
    // （與 timeline 的 duration 同單位），後端確認維持此行為，取用時一律換算
    msToSeconds(value) {
      return Math.round((value || 0) / 1000);
    },

    clickOnSubmit() {
      if (this.value_endHour <= this.value_startHour) {
        this.$fire({
          text: i18n.formatter.format('InvalidTimeRange'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
        return;
      }

      this.fetchTimeline();
    },

    // 送出：取回整個區間的統計與時間軸區段。事件明細要點區段才查
    async fetchTimeline() {
      this.showLoading();

      this.value_queriedStartHour = this.value_startHour;
      this.value_queriedEndHour = this.value_endHour;

      const query = {
        uuid: this.value_personUuid,
        start_time: this.value_windowStart,
        end_time: this.value_windowEnd,
      };

      try {
        const retResult = await this.$globalQueryPresenceStatus(query);

        if (!retResult.error && retResult.data) {
          const { data } = retResult;

          if (data.summary) {
            this.value_inTotalSeconds = this.msToSeconds(data.summary.in_total_seconds);
            this.value_outTotalSeconds = this.msToSeconds(data.summary.out_total_seconds);
            this.value_inTotalFormatted = this.formatSeconds(this.value_inTotalSeconds);
            this.value_outTotalFormatted = this.formatSeconds(this.value_outTotalSeconds);
          }

          this.value_records = (data.timeline || []).slice().sort((a, b) => a.start - b.start);

          this.restoreSelectedSegment();
        }
      } catch (ex) {
        console.log(ex);
      }

      this.hideLoading();
    },

    // 重新載入後區段邊界可能變動，找得到原本選取的區間才留著，否則清空明細
    restoreSelectedSegment() {
      if (!this.value_selectedRange) return;

      const { start, end } = this.value_selectedRange;
      const idx = this.value_timelineSegments.findIndex((seg) => seg.start === start && seg.end === end);

      if (idx < 0) {
        this.clearSegmentSelection();
        return;
      }

      this.value_selectedSegmentIndex = idx;
      this.fetchSegmentEvents();
    },

    clearSegmentSelection() {
      this.value_selectedSegmentIndex = -1;
      this.value_selectedRange = null;
      this.value_allEvents = [];
      this.value_tablePage.currentPage = 1;
      this.value_tablePage.totalResult = 0;
      this.showPage(1);
    },

    clickOnSegment(seg, idx) {
      this.value_selectedSegmentIndex = idx;
      this.value_selectedRange = { start: seg.start, end: seg.end };
      this.value_tablePage.currentPage = 1;

      this.fetchSegmentEvents();
    },

    // 點區段：只查該區段時間範圍內的事件
    async fetchSegmentEvents() {
      if (!this.value_selectedRange) return;

      this.showLoading();

      const query = {
        uuid: this.value_personUuid,
        date: this.value_personDate,
        start_time: this.value_selectedRange.start,
        end_time: this.value_selectedRange.end,
        slice_shift: 0,
        slice_length: 99999,
      };

      try {
        const retResult = await this.$globalQueryPresenceDetail(query);

        if (!retResult.error && retResult.data) {
          this.value_allEvents = (retResult.data.events || []).map((evt) => ({
            ...evt,
            timeFormatted: dayjs(evt.timestamp).format('HH:mm:ss'),
            employeeInfo: `${evt.person_id} · ${evt.name}`,
          }));

          this.value_tablePage.totalResult = this.value_allEvents.length;

          // 刪除紀錄後筆數可能變少，當前頁要收回範圍內
          const maxPage = Math.ceil(this.value_allEvents.length / this.value_tablePage.pageSize) || 1;
          if (this.value_tablePage.currentPage > maxPage) {
            this.value_tablePage.currentPage = maxPage;
          }
          this.showPage(this.value_tablePage.currentPage);
        }
      } catch (ex) {
        console.log(ex);
      }

      this.hideLoading();
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

    // 刪除例外處理補上的那筆 IN 紀錄
    clickOnDeleteException(row) {
      this.$confirm('', i18n.formatter.format('ConfirmToDelete'), 'question', {
        confirmButtonText: i18n.formatter.format('Confirm'),
        cancelButtonText: i18n.formatter.format('Cancel'),
        confirmButtonColor: '#20a8d8',
        cancelButtonColor: '#f86c6b',
      }).then(async () => {
        this.showLoading();
        const ret = await this.$globalDeletePresenceException({
          timestamp: row.timestamp,
          uuid: this.value_personUuid,
          verify_uuid: row.verify_uuid,
        });
        this.hideLoading();

        if (ret.error) {
          this.$fire({
            text: i18n.formatter.format('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: i18n.formatter.format('OK'),
          });
          return;
        }

        this.$fire({
          text: i18n.formatter.format('OperationSuccess'),
          type: 'success',
          timer: 2000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });

        // 少了一筆 IN，區段會重新切分。原本選取的範圍若還在，
        // fetchTimeline() 內會自行還原並重抓該段明細，否則收起事件列表
        this.fetchTimeline();
      }).catch(() => {});
    },

    // 例外處理補出來的紀錄沒有抓拍照，face_image_id 是空物件 {}。
    // 空物件是 truthy，直接丟給 fetchverifyphoto 後端會回 400
    hasFaceImage(faceImageId) {
      return Boolean(faceImageId) && typeof faceImageId === 'object' && Object.keys(faceImageId).length > 0;
    },

    async loadPagePhotos() {
      for (let ii = 0; ii < this.value_dataItemsToShow.length; ii += 1) {
        const row = this.value_dataItemsToShow[ii];
        if (this.hasFaceImage(row.face_image_id)) {
          const dataImage = await this.$globalFetchVerifyPhoto(row.face_image_id);
          if (dataImage.error == null && dataImage.data && dataImage.data.face_image) {
            this.$set(this.value_dataItemsToShow[ii], 'snapshotSrc', `data:image/jpeg;base64,${dataImage.data.face_image}`);
          }
        }
      }
    },

    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.showPage(currentPage);
      this.resizeOneTable();
    },

    // 例外處理：手動補一筆 IN 紀錄。日期與方向固定，只讓使用者挑時間
    clickOnExceptionHandling() {
      if (!this.value_selectedRange || !this.value_canHandleException) return;

      this.exc_timeValue = new Date(this.value_selectedRange.start);
      this.flag_showExceptionModal = true;
    },

    async clickOnAddException() {
      if (!this.value_selectedRange || !this.exc_timeValue) return;

      // 日期固定為該人員的這一天，只取使用者調整的時分秒
      const target = new Date(this.value_personDate);
      target.setHours(
        this.exc_timeValue.getHours(),
        this.exc_timeValue.getMinutes(),
        this.exc_timeValue.getSeconds(),
        0,
      );

      const timestamp = target.getTime();
      const { start, end } = this.value_selectedRange;

      if (timestamp < start || timestamp > end) {
        this.$fire({
          text: `${this.disp_timeMustBeInSegment}${this.value_selectedRangeText}`,
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
        return;
      }

      this.showLoading();
      const ret = await this.$globalCreatePresenceException({
        uuid: this.value_personUuid,
        timestamp,
      });
      this.hideLoading();

      if (ret.error) {
        this.$fire({
          text: i18n.formatter.format('OperationFailed'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
        return;
      }

      this.$fire({
        text: i18n.formatter.format('OperationSuccess'),
        type: 'success',
        timer: 2000,
        confirmButtonColor: '#20a8d8',
        confirmButtonText: i18n.formatter.format('OK'),
      });

      this.flag_showExceptionModal = false;

      // 補了紀錄之後區段會重新切分，原本選取的範圍不一定還存在，
      // 先收起事件列表再重載時間軸與統計
      this.clearSegmentSelection();
      this.fetchTimeline();
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

        if (withPhoto && self.hasFaceImage(evt.face_image_id)) {
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

/* Timeline */
.timeline-label {
  width: 72px;
  flex: none;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  line-height: 28px;
  text-align: right;
  padding-right: 16px;
}

.timeline-track {
  position: relative;
  height: 28px;
  border-radius: 4px;
  background: #dde1e6;
  overflow: hidden;
}

.timeline-seg {
  position: absolute;
  top: 0;
  height: 100%;
  cursor: pointer;
  /* 極短的區段換算成百分比會小於 1px，補一個最小寬度才看得到也點得到。
     區段是絕對定位，加寬不會把後面的區段推走 */
  min-width: 5px;
}

/* 靠 min-width 撐出來的區段要疊在上層，否則會被後面相鄰的區段整個蓋掉。
   一般區段都比 5px 寬得多，被它多壓到的幾個像素看不出來 */
.timeline-seg-tiny {
  z-index: 2;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.timeline-seg:hover {
  filter: brightness(0.94);
}

.timeline-seg-off {
  background: #dde1e6;
}

.timeline-seg-in {
  background: #4caf50;
}

.timeline-seg-away {
  background: #ffc107;
}

.timeline-seg-away-over {
  background: #e53935;
}

/* 選取框用深色內框，四種底色上都看得出來；外框會被 track 的 overflow 裁掉 */
.timeline-seg-active {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.6);
}

.timeline-axis {
  position: relative;
  height: 20px;
  margin-top: 6px;
}

.timeline-tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* 手動補的例外紀錄，在備註欄以紅字標示 */
.manual-remark {
  color: #d32f2f;
  font-weight: 500;
  white-space: nowrap;
}

.manual-remark-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  flex: none;
  cursor: pointer;
  color: #d32f2f;
  background: #fdecea;
  border: 1px solid #d32f2f;
  border-radius: 4px;
}

.manual-remark-delete:hover {
  color: #fff;
  background: #d32f2f;
}

/* 例外處理 Modal 裡固定不可改的欄位 */
.exc-readonly {
  background-color: #e4e7ea;
  display: flex;
  align-items: center;
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
