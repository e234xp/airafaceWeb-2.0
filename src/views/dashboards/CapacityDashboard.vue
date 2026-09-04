<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-show="!isLoadSetting">
    <div
      class="ratio-content capacity-dashboard"
      :style="{ backgroundImage: 'url(' + displaySettings.background_image + ')' }"
    >
      <div class="dashboard-header d-flex justify-content-between" style="margin-left: 20px; margin-right: 20px">
        <div class="d-flex align-items-center">
          <div
            class="dashboard-attendance-logo"
            @click="toLoginPage"
            :style="[{ backgroundImage: 'url(' + displaySettings.logo + ')' }, 'zoom: ' + zoomRatio + ' !important;']"
          />
          <div class="attendance-title" />
        </div>
        <div class="fz-super-large text-white" v-if="displaySettings.showAmount">
          {{ entryPersons.length }}
        </div>
        <div class="current-date-time text-white ff-noto-sans fw-200">
          <div class="fz-xxxl current-date">
            {{ currentDate }}
          </div>
          <div class="fz-super-large lh-6">
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-------------------  Occupancy ------------------>
      <div class="dashboard-divider" style="margin-left: 20px; margin-right: 20px" />

      <!-------------------  Attendance - BEGIN ------------------>
      <div class="attendance-top-box" v-show="displaySettings.displayChart">
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag">
            <div>{{ attendanceGroupTitle }}</div>
          </div>

          <!-- 第 2 列： 甜甜圈圖表 + 人數的數值-->
          <div class="attendance-statistics-data-box">
            <div class="doughnut-chart-canvas-wrap">
              <!-- Attendance 甜甜圈圖表 -->
              <canvas id="doughnut-chart-canvas" class="" />
            </div>
            <div class="d-flex align-items-end">
              <div class="attendance-header-present">
                {{ attendancePresent }}
              </div>
              <div class="attendance-header-total">/ {{ attendanceTotal }}</div>
            </div>
          </div>

          <!-- 第 3 列：排序選項 + 檢視模式選項 -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="d-flex align-items-center">
                <CIcon name="cilSortDescending" class="attendance-sort-icon text-white" />
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{ $t('SortByGroupName') }}</span>
              </div>
              <button class="btn-reset">
                <img
                  class="attendance-dropdown-arrow"
                  src="@/assets/img/dropdown_arrow_down.svg"
                  alt="dropdown_arrow_down"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Attendance 柱狀圖統計圖表 -->
        <div class="attendance-chart-canvas-wrap">
          <canvas id="attendance-chart-canvas" />
        </div>
      </div>

      <!-------------------  Attendance - END ------------------>

      <!-- Occupancy/Attendance 顯示人員資料列表 -->
      <div
        :style="{
          display: 'grid !important',
          gap: '0.7%',
          'grid-template-columns': displaySettings.showLeaving ? '66% 33%' : '100%',
        }"
      >
        <div style="padding-left: 10px">
          <div
            :class="[
              displaySettings.showLeaving ? 'grid-4x4' : 'grid-6x6',
              'd-flex',
              'flex-wrap',
              'person-list-container',
            ]"
          >
            <div
              v-for="person in currentEntryPersons"
              :key="person.uuid"
              :class="[
                'person-card',
                'inline-block',
                person.status === 0 ? 'normal-person-card' : '',
                person.status === 1 ? 'absent-person-card' : '',
                displaySettings.showLeaving ? 'person-card-4x4' : 'person-card-6x6',
              ]"
              :style="'zoom: ' + zoomRatio + ' !important;'"
            >
              <div class="d-flex justify-content-between align-items-center person-image-box" style="height: 100%">
                <img
                  :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                  :src="getImageSrc(person)"
                />

                <div class="person-info-box text-white d-flex flex-column justify-content-center">
                  <div v-show="displaySettings.displayCardMode == 'STANDARD'" class="fz-xxl">
                    {{ showField(person, displaySettings.line1) }} &nbsp;
                  </div>
                  <div
                    :class="[person.status === 1 ? 'absent-person-name' : 'person-name', 'fz-l', 'fw-600']"
                    :style="'zoom: ' + zoomRatio + ' !important;'"
                  >
                    {{ getDisplayName(person) }}
                  </div>
                  <div v-if="person.status !== 1" class="d-flex align-items-end temperature-info" />
                  <div v-show="displaySettings.displayCardMode == 'STANDARD'" class="fz-sm fw-300">
                    {{ formatEpochTime(person.last_in_time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="isLoadSetting" class="align-items-center" style="color: white">Loading...</div>
        </div>
        <div v-if="displaySettings.showLeaving">
          <div :class="['grid-2x4', 'd-flex', 'flex-wrap', 'person-list-container']">
            <div
              v-for="person in currentLeavePersons"
              :key="person.uuid"
              :class="[
                'person-card',
                'inline-block',
                person.status === 0 ? 'normal-person-card' : '',
                person.status === 1 ? 'absent-person-card' : '',
                'person-card-2x4',
              ]"
              :style="'zoom: ' + zoomRatio + ' !important;'"
            >
              <div class="d-flex justify-content-between align-items-center person-image-box">
                <img
                  :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                  :src="getImageSrc(person)"
                />

                <div class="person-info-box text-white">
                  <div v-show="displaySettings.displayCardMode == 'STANDARD'" class="fz-xxl">
                    {{ showField(person, displaySettings.line1) }} &nbsp;
                  </div>
                  <div
                    :class="[person.status === 1 ? 'absent-person-name' : 'person-name', 'fz-l', 'fw-600']"
                    :style="'zoom: ' + zoomRatio + ' !important;'"
                  >
                    {{ getDisplayName(person) }}
                  </div>
                  <div v-if="person.status !== 1" class="d-flex align-items-end temperature-info" />
                  <div v-show="displaySettings.displayCardMode == 'STANDARD'" class="fz-sm fw-300">
                    <span style="margin-right: 20px">{{ formatEpochTime(person.last_in_time) }}</span>
                    <span>{{ formatEpochTime(person.last_out_time) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="footer-box-wrap">
        <div class="footer-box">
          <div
            class="pager d-flex align-items-center justify-content-center"
            :style="{ width: displaySettings.showLeaving ? '66%' : '100%' }"
          >
            <button class="btn-reset" :disabled="currentPageIndex[0] === 0" @click="onClickPrev(0)">
              <img
                v-if="currentPageIndex[0] === 0"
                class="pager-left-arrow"
                src="@/assets/img/pager_left_arrow_disabled.svg"
              />
              <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg" />
            </button>
            <button
              v-for="(item, i) in range(dispPageIndexStart, currentPageIndex[0] - 1)"
              class="pager-left-dots btn-reset"
              @click="onClickPagerDot(0, i)"
              :key="i"
            />

            <div class="pager-progressbar-box">
              <div class="pager-progressbar-track" />
              <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }" />
            </div>
            <button
              v-for="(item, i) in range(currentPageIndex[0] + 1, dispPageIndexEnd)"
              class="pager-right-dots btn-reset"
              @click="onClickPagerDot(0, i + currentPageIndex[0] + 1)"
              :key="i"
            />

            <button class="btn-reset" :disabled="currentPageIndex[0] === totalPageIndex[0]" @click="onClickNext(0)">
              <img
                v-if="currentPageIndex[0] === totalPageIndex[0]"
                class="pager-right-arrow"
                src="@/assets/img/pager_right_arrow_disabled.svg"
              />
              <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg" />
            </button>
          </div>

          <div
            class="pager d-flex align-items-center justify-content-center"
            style="width: 33%"
            v-if="displaySettings.showLeaving"
          >
            <button class="btn-reset" :disabled="currentPageIndex[1] === 0" @click="onClickPrev(1)">
              <img
                v-if="currentPageIndex[1] === 0"
                class="pager-left-arrow"
                src="@/assets/img/pager_left_arrow_disabled.svg"
              />
              <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg" />
            </button>
            <button
              v-for="(item, i) in range(dispPageIndexStart, currentPageIndex[1] - 1)"
              class="pager-left-dots btn-reset"
              @click="onClickPagerDot(1, i)"
              :key="i"
            />

            <div class="pager-progressbar-box">
              <div class="pager-progressbar-track" />
              <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }" />
            </div>
            <button
              v-for="(item, i) in range(currentPageIndex[1] + 1, dispPageIndexEnd)"
              class="pager-right-dots btn-reset"
              @click="onClickPagerDot(1, i + currentPageIndex[1] + 1)"
              :key="i"
            />

            <button class="btn-reset" :disabled="currentPageIndex[1] === totalPageIndex[1]" @click="onClickNext(1)">
              <img
                v-if="currentPageIndex[1] === totalPageIndex[1]"
                class="pager-right-arrow"
                src="@/assets/img/pager_right_arrow_disabled.svg"
              />
              <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg" />
            </button>
          </div>
        </div>
      </div>

      <div class="loading" v-if="loading">
        <CSpinner color="primary" />
      </div>
    </div>
  </div>
</template>

<script>
import { airaLogoWhite as airaLogo } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';

import chartHelper from '@/utils/ChartHelper.vue';
import OccupancySocket from '@/utils/OccupancySocket';

const emptyFace =
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAAXNSR0IB2cksfwAAA' +
  'AlwSFlzAAALEwAACxMBAJqcGAAAAd1QTFRF19nZztDQtbe3vL6+wsPDsbKzubq7ycvL09XV2Nray83Nh4eIWVlaXFxdW1xdYWFiaWlqcnJzfH19hoeIkpOTnp+gq6ysubu7uLm5jI2Oa2tsWlpbWllb' +
  'Y2NkgYGCqaqq0tTUwcPDdXV2ZWVmqaurvsDAnZ6ffHx9YGBhzM7OXV1eiYqL1tjYlJWVdnZ3zc/Pk5SUcnN00NLSqKqqgoKDq6ytkZKSa2xs1dfXs7S0jY6Ppqeofn+ApKWmfX1+ra+vhoeHwMLCmJm' +
  'Z1NbWeXp6kpOU0NHRnZ6edXZ2pqiof4CAr7GxiIiJuLq6kJGRwMHCl5iZxMXFi4yMeHl6rrCwgoODXl5fgIGClJSVrK2thIWGyMrKoKKiaWpqiouMra6vhYaHz9DQqqusfn5/X19gjo+QqKmp0dPTZG' +
  'Rlt7m5bm9ww8XFhISFYmJjpaamfX5+qaqrp6ippKWlioqLa2xts7S1enp7XFxegICBf4CBe3t8z9HRc3N0W1tcwcLDiYmKZ2docHBxxMbGrq+vsrS0gYKDu7y9lZaXbGxtv8DAbW5vpKambG1tl5iYr' +
  'K6ub29wmZqabm5vkZOTjo6PyszMsrOzv8HBeXp7iYqKamprsLGxoKGikJGSmJmax8nJ/5q5qgAAAudJREFUeJzt2fdXE0EQB/AlFnLxYoJYsyLRWGKMYDeKgoDYFWsU0KgUY4u9EiP2htgLYPlbvTxE' +
  '43vZmQkz8tN9/4D5vNm9vd29U8qNGzdu3LgZSZlnwsRJk8u9yrL+H2L5pth+254aCFZMq5w+Y+ascnFi9pyQnqv/iV01rzosSMxfoIsnslDMWBQwGE4WSyFLzIaOLpUxqmMAopd5BYj4cohwUlPLR1Y' +
  'ghtYrV3GN1aih9Zo4z/ABD9bfrOUh6yiGXp/gGF5SI1pv4CAemqE3cpA6IrKJg2wmIvUcpIGIbDGXwJ+JRpuGNJlL4GvI66chDUANVLGCJMNuBGo0o61spXVSxkIqSUYAnF10vFpISAissQ1DtpOQHW' +
  'ANdL/ZSUJ2gTXQrXM3CdkDF8EmZS8J2QcXCSNIK2nJ74eLIJNy4CAJOXQYrIKslCOk0dI6ia84Y6waImJzjkVHiYif0Yk6RkRCnDtLGxFpZxiqg4gc5yDqBMmwW1lIioREWIc7dZKEnGIZ6jR4NxlNJ' +
  'w9RXQSjG9p9KaEcVHuYhlJnkpiRSrOR5rOIYZ9jGyp+HuvkAh9RFxEjwx8tpS4hyGUBQ/m6YeSKBIK8WoJhEaQDvDheFTGUugYYXcw7/J/ErxuNGwLfPH4nbVyQN8UMZd0yGLflGjG/i5PsbzcFuWNC' +
  'JFb7aO6OBzIew2X1GpAYd08sSPaeAcnd551TCtJnIJzYD8IyhlVvRnRSasAeAkjukYyRjQKIfiyDPIEMnZJBnoJIlcikPEM+Rz0XMGpfwIaOedjGy1eI4RyF63hEuoX06a6Xcb5L9EcohBN/zxh/o8T' +
  'bXhOJfKID2TEQb96WQOSTeVcik+h8XyKRT2CghC0/8QG9kxiS/PjJeVooP6D6kcMvmFz7Z8KoffnKIPJpQpHsIJNwMjQMG8MZvuFkEDIE2sCULHc2CvLNZFTIGTpjmH14byo134saP0SN4q38lDWKz4' +
  'rgpI9kqKD4L1KHptMGIb/CAAAAAElFTkSuQmCC';

const SLOT_COUNT = 24;

// 進入看板時要清掉預設 padding 的 CoreUI 外殼元素
const CONTAINER_RESETS = [
  ['.c-main', 'c-main-reset'],
  ['.c-header', 'c-header-reset'],
  ['.c-footer', 'c-footer-reset'],
  ['.container-fluid', 'container-fluid-reset'],
];

export default {
  name: 'CapacityDashboard',
  mixins: [chartHelper],

  data() {
    return {
      loading: false,
      isLoadSetting: true,
      zoomRatio: 0,

      currentDate: '',
      currentTime: '',
      currentTimeLooper: null,

      socket: null,

      // 後端回傳的資料
      persons: [],
      groups: [],
      hourly: [],

      // 圖表
      chartLabels: [],
      chartDataIn: [],
      chartDataOut: [],
      chartDataPresent: [],

      // 分頁：[0] 在場區、[1] 離場區
      currentPageIndex: [0, 0],
      totalPageIndex: [0, 0],
      displayAmount: [20, 8],
      dispPageIndexStart: 0,
      dispPageIndexEnd: 0,

      currentEntryPersons: [],
      currentLeavePersons: [],

      showPageProgressTimer: null,
      countdownStartTime: null,
      countdownCurrentTime: null,
      pageProgressPercentage: '0%',

      // 目前沒有資料來源，保留以維持左上角版面
      attendanceGroupTitle: '',

      displaySettings: {
        displayMode: 'CAPACITY',
        background_image: backgroundImage,
        logo: airaLogo,

        displayGroup: ['All Person'],
        displayCardMode: 'STANDARD',
        displayPhoto: 'REGISTER',
        line1: 'NONE',
        line2: 'NAME',

        pageLayout: 'LARGE',
        displayChart: false,
        showAmount: true,
        showLeaving: true,
        dailyResetTime: '00',
        personPatrolTime: 15,
      },

      emptyFace,
    };
  },

  computed: {
    // 在場：依最後進場時間由新到舊
    entryPersons() {
      return this.persons
        .filter((p) => p.status === 0)
        .sort((a, b) => (b.last_in_time || 0) - (a.last_in_time || 0));
    },

    // 離場：只列今天真的離開過的人，從未進出者不顯示
    leavePersons() {
      return this.persons
        .filter((p) => p.status === 1 && p.last_out_time)
        .sort((a, b) => (b.last_out_time || 0) - (a.last_out_time || 0));
    },

    attendancePresent() {
      return this.entryPersons.length;
    },

    attendanceTotal() {
      return this.persons.length;
    },
  },

  watch: {
    currentPageIndex: {
      deep: true,
      handler() {
        this.refreshCurrentPage();
      },
    },
  },

  async created() {
    const { data: display } = await this.$globalGetDisplaySetting();
    if (display && display.CAPACITY) {
      this.displaySettings = { ...this.displaySettings, ...display.CAPACITY };
    }

    this.initHourly();
    this.initViews();
    this.isLoadSetting = false;

    await this.loadDashboard('all');

    this.$nextTick(() => {
      this.zoomViews();
      this.initBarChart();
      this.initDoughnutChart();

      requestAnimationFrame(() => {
        this.refreshData();

        if (this.totalPageIndex[0] >= 1 || this.totalPageIndex[1] >= 1) {
          this.resetAutoChangePageTimer();
        }
      });
    });

    this.setupCurrentTimeLooper();
    this.connectSocket();
  },

  destroyed() {
    this.toggleContainerReset(false);
    window.removeEventListener('resize', this.zoomViews);

    if (this.showPageProgressTimer) {
      clearInterval(this.showPageProgressTimer);
      this.showPageProgressTimer = null;
    }

    if (this.currentTimeLooper) {
      clearInterval(this.currentTimeLooper);
      this.currentTimeLooper = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  methods: {
    // ---------------- 時段換算 ----------------

    // dailyResetTime 可能是 '06' 或 '06:00'
    resetHour() {
      const raw = String(this.displaySettings.dailyResetTime || '00');
      const hour = parseInt(raw.split(':')[0], 10);
      return Number.isNaN(hour) ? 0 : hour;
    },

    // 圖表以 dailyResetTime 為起點，slot 0 即重置時刻那一小時
    currentSlot() {
      return (new Date().getHours() - this.resetHour() + SLOT_COUNT) % SLOT_COUNT;
    },

    slotToHour(slot) {
      return (slot + this.resetHour()) % SLOT_COUNT;
    },

    initHourly() {
      this.hourly = Array.from({ length: SLOT_COUNT }, (_, slot) => ({
        slot,
        hour: this.slotToHour(slot),
        in: 0,
        out: 0,
        present: null,
      }));
    },

    // ---------------- 資料載入 ----------------

    // range 帶 'all' 取完整 24 筆 hourly，不帶則只更新當前時段
    async loadDashboard(range) {
      this.loading = true;

      const { error, data } = await this.$globalQueryCapacityDashboard(range);

      this.loading = false;

      if (error || !data) {
        console.error('載入 Capacity 看板資料失敗:', error);
        return;
      }

      this.applyPersons(data.persons || []);
      this.groups = data.groups || [];

      if (range === 'all') this.initHourly();
      this.applyHourly(data.hourly || []);

      this.refreshData();
    },

    // persons 依 status 拆成在場／離場兩區顯示。
    // 照片不隨此 API 回傳，翻頁時才懶載入，重載時保留已抓到的圖避免閃爍。
    applyPersons(list) {
      const cache = new Map();
      this.persons.forEach((p) => {
        if (p.lastImage) cache.set(p.uuid, p.lastImage);
      });

      this.persons = list.map((p) => ({
        ...p,
        display_image: '',
        register_image: '',
        lastImage: cache.get(p.uuid) || '',
      }));
    },

    // 依格子覆蓋，不分辨是 1 筆還是 24 筆。
    // 優先用 hour 反推位置：hour 是絕對的時鐘小時，slot 則依賴前後端對
    // dailyResetTime 的認知一致，用 hour 換算才不會整批錯位。
    applyHourly(list) {
      list.forEach((item) => {
        const slot =
          item.hour === undefined ? item.slot : (item.hour - this.resetHour() + SLOT_COUNT) % SLOT_COUNT;

        if (slot === undefined || slot < 0 || slot >= SLOT_COUNT) return;

        this.$set(this.hourly, slot, {
          slot,
          hour: item.hour === undefined ? this.slotToHour(slot) : item.hour,
          in: item.in || 0,
          out: item.out || 0,
          present: item.present === undefined ? null : item.present,
        });
      });
    },

    // ---------------- WebSocket ----------------

    connectSocket() {
      this.socket = new OccupancySocket(window.occupancySocketPath, {
        onUpdate: (payload) => this.applySocketUpdate(payload),
        // 斷線期間的事件無法補回，重連後重載完整 24 筆
        onReconnect: () => this.loadDashboard('all'),
        onStatus: (online) => {
          this.loading = !online;
        },
      });

      this.socket.connect();
    },

    // 一則推播同時帶 occupancy / capacity / guard 三個看板的判定結果，這裡只取 capacity
    applySocketUpdate(payload) {
      const update = payload && payload.capacity;
      if (!update || !update.counted) return;

      const person = this.persons.find((p) => p.uuid === update.person_uuid);
      if (person) {
        person.status = update.status;

        // 卡片要顯示進出時間，且清單依此排序；沒有這個值排序會跳動。
        // 離場目前 payload 沒有對應欄位，先以收到推播的時間近似，
        // 下一次整點重載會校正回後端的值。
        if (update.direction === 'in') {
          if (update.last_in_time) person.last_in_time = update.last_in_time;
        } else {
          person.last_out_time = update.last_out_time || update.timestamp || Date.now();
        }
      }

      const cell = this.hourly[this.currentSlot()];
      if (cell) {
        if (update.direction === 'in') cell.in += 1;
        else cell.out += 1;

        cell.present = this.attendancePresent;
      }

      this.refreshData();
    },

    // ---------------- 圖表 ----------------

    initBarChart() {
      this.syncChartData();
      const ctx = document.getElementById('attendance-chart-canvas');
      this.setupDashboardChart(
        ctx,
        this.chartLabels,
        this.chartDataIn,
        this.chartDataOut,
        this.chartDataPresent,
        this.currentSlot(),
      );
    },

    initDoughnutChart() {
      const ctx = document.getElementById('doughnut-chart-canvas');
      this.setupAttendanceDoughnutChart(ctx, [0, 0], true);
    },

    syncChartData() {
      this.chartLabels = this.hourly.map((h) => h.hour);
      this.chartDataIn = this.hourly.map((h) => h.in);
      this.chartDataOut = this.hourly.map((h) => -h.out);
      this.chartDataPresent = this.hourly.map((h) => h.present);
    },

    refreshCharts() {
      // 設定頁沒有「顯示圖表」欄位，CAPACITY 一律存 false，圖表區塊不會顯示。
      // 隱藏時 canvas 沒有尺寸，畫了也是白費，直接跳過。
      if (!this.displaySettings.displayChart) return;

      this.refreshBarChart();
      this.refreshDoughnutChart();
    },

    refreshBarChart() {
      this.syncChartData();

      if (!this.chartLabels.length) return;

      const ctx = document.getElementById('attendance-chart-canvas');
      this.setupDashboardChart(
        ctx,
        this.chartLabels,
        this.chartDataIn,
        this.chartDataOut,
        this.chartDataPresent,
        this.currentSlot(),
      );
    },

    refreshDoughnutChart() {
      const present = this.attendancePresent;
      const absent = this.persons.length - present;

      const ctx = document.getElementById('doughnut-chart-canvas');
      this.setupAttendanceDoughnutChart(ctx, [present, absent], true);
    },

    // ---------------- 分頁 ----------------

    setupPageLayoutAmount() {
      return this.displaySettings.showLeaving ? [20, 8] : [36, 0];
    },

    // 重算兩區的總頁數並刷新當前頁
    refreshData() {
      this.displayAmount = this.setupPageLayoutAmount();

      const totals = [
        Math.max(Math.ceil(this.entryPersons.length / this.displayAmount[0]) - 1, 0),
        this.displayAmount[1] ? Math.max(Math.ceil(this.leavePersons.length / this.displayAmount[1]) - 1, 0) : 0,
      ];

      this.totalPageIndex = totals;

      // 人數變少時目前頁碼可能超出範圍
      totals.forEach((total, idx) => {
        if (this.currentPageIndex[idx] > total) this.$set(this.currentPageIndex, idx, 0);
      });

      this.refreshCurrentPage();
      this.refreshCharts();
    },

    refreshCurrentPage() {
      const beginEntry = this.currentPageIndex[0] * this.displayAmount[0];
      this.currentEntryPersons = this.entryPersons.slice(beginEntry, beginEntry + this.displayAmount[0]);

      const beginLeave = this.currentPageIndex[1] * this.displayAmount[1];
      this.currentLeavePersons = this.displayAmount[1]
        ? this.leavePersons.slice(beginLeave, beginLeave + this.displayAmount[1])
        : [];

      this.fetchPhotosForCurrentPage();
    },

    // 只抓當前頁、且還沒有照片的人
    fetchPhotosForCurrentPage() {
      [...this.currentEntryPersons, ...this.currentLeavePersons].forEach((item) => {
        const person = item;
        if (person.lastImage || person.display_image || person.register_image) return;

        this.$globalFetchPhoto(person.uuid, (err, data) => {
          if (err || !data) return;

          person.display_image = data.display_image || '';
          person.register_image = data.register_image || '';
        });
      });
    },

    range(start, end) {
      if (start > end) return [];

      return Array(end - start + 1)
        .fill()
        .map((val, i) => start + i);
    },

    onClickPrev(idx) {
      if (this.currentPageIndex[idx] === 0) return;

      this.$set(this.currentPageIndex, idx, this.currentPageIndex[idx] - 1);
      this.resetAutoChangePageTimer();
    },

    onClickNext(idx) {
      if (this.currentPageIndex[idx] === this.totalPageIndex[idx]) return;

      this.$set(this.currentPageIndex, idx, this.currentPageIndex[idx] + 1);
      this.resetAutoChangePageTimer();
    },

    onClickPagerDot(idx, index) {
      this.$set(this.currentPageIndex, idx, index);
      this.resetAutoChangePageTimer();
    },

    resetAutoChangePageTimer() {
      if (this.showPageProgressTimer) clearInterval(this.showPageProgressTimer);

      this.countdownStartTime = new Date();
      this.countdownCurrentTime = new Date();

      this.showPageProgressTimer = setInterval(() => {
        this.countdownCurrentTime = new Date();

        const duration = this.displaySettings.personPatrolTime * 1000;
        const percentage = (100 * (this.countdownCurrentTime - this.countdownStartTime)) / duration;

        this.pageProgressPercentage = `${Math.min(percentage, 100)}%`;

        if (percentage < 100) return;

        this.pageProgressPercentage = '0%';
        this.countdownStartTime = new Date();

        this.totalPageIndex.forEach((total, idx) => {
          if (total <= 0) return;

          const next = this.currentPageIndex[idx] === total ? 0 : this.currentPageIndex[idx] + 1;
          this.$set(this.currentPageIndex, idx, next);
        });
      }, 1000);
    },

    // ---------------- 時鐘 ----------------

    setupCurrentTimeLooper() {
      this.updateCurrentTime();

      this.currentTimeLooper = setInterval(() => {
        const now = new Date();
        this.updateCurrentTime(now);

        // 整點：讓圖表推進一格。跨越 dailyResetTime 時是新的一輪，需重取 24 筆
        if (now.getMinutes() === 0 && now.getSeconds() === 0) {
          this.loadDashboard(this.currentSlot() === 0 ? 'all' : null);
        }
      }, 1000);
    },

    updateCurrentTime(date) {
      const now = date || new Date();
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');

      this.currentDate = now.toLocaleDateString();
      this.currentTime = `${hour}:${minute}`;
    },

    // ---------------- 卡片顯示 ----------------

    getImageSrc(personData) {
      if (this.displaySettings.displayPhoto === 'NONE') return `data:image/png;base64,${emptyFace}`;

      const isPlaceholder = (img) => !img || typeof img === 'object' || img === emptyFace;

      const b64 =
        this.displaySettings.displayPhoto === 'REGISTER'
          ? (!isPlaceholder(personData.register_image) && personData.register_image) || personData.lastImage
          : (!isPlaceholder(personData.display_image) && personData.display_image) ||
            (!isPlaceholder(personData.register_image) && personData.register_image) ||
            personData.lastImage;

      if (b64 && !isPlaceholder(b64)) {
        this.$set(personData, 'lastImage', b64);
        return `data:image/png;base64,${b64}`;
      }

      return `data:image/png;base64,${emptyFace}`;
    },

    getDisplayName(person) {
      let retName = '';

      if (this.displaySettings.line2 === 'NAME') retName = person.name;
      else if (this.displaySettings.line2 === 'PARTIALNAME') retName = this.showField(person, 'PARTIALNAME');

      if (this.displaySettings.displayCardMode === 'COMPACT') {
        if (retName.charCodeAt(0) > 256 && retName.length > 3) {
          retName = `${retName.substring(0, 3)}...`;
        } else if (retName.length > 6) {
          retName = `${retName.substring(0, 6)}...`;
        }
      }

      return retName;
    },

    showField(person, field) {
      switch (field) {
        case 'ID':
          return person.id;
        case 'NAME':
          return person.name;
        case 'PARTIALNAME': {
          if (person.name.charCodeAt(0) > 256) {
            // 李***瑋
            return `${person.name.charAt(0)}***${person.name.charAt(person.name.length - 1)}`;
          }
          // J. Lee
          const pNames = `${person.name} `.split(' ');
          let ret = pNames[0].charAt(0);
          if (pNames.length >= 3) ret += `. ${pNames[pNames.length - 2]}`;
          return ret;
        }
        case 'GROUP':
          return (person.group_list || []).join(', ');
        case 'JOBTITLE':
          return person.title || '';
        case 'DEPARTMENT':
          return person.department || '';
        case 'NONE':
        default:
          return '';
      }
    },

    formatEpochTime(epochTime) {
      if (!epochTime) return '';

      const date = new Date(epochTime);
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');

      return `${hour}:${minute}`;
    },

    toLoginPage() {
      this.$globalLogout();
      this.$router.push('/');
    },

    // ---------------- 版面 ----------------

    initViews() {
      this.toggleContainerReset(true);

      // 等 DOM 排版完成再量尺寸
      setTimeout(() => this.zoomViews(), 168);

      window.addEventListener('resize', this.zoomViews);
    },

    // CoreUI 外殼的預設 padding 會擋住全螢幕版面，進入看板時清掉、離開時還原
    toggleContainerReset(on) {
      CONTAINER_RESETS.forEach(([selector, className]) => {
        const element = document.querySelector(selector);
        if (element) element.classList[on ? 'add' : 'remove'](className);
      });
    },

    zoomViews() {
      const dashboard = document.querySelector('.capacity-dashboard');
      if (!dashboard) return;

      const { clientWidth: width, clientHeight: height } = dashboard;

      this.zoomRatio = Math.min(width / 1920, height / 1080);

      const padX = Math.floor((width - 1920 * this.zoomRatio) / 2);
      const padY = Math.floor((height - 1080 * this.zoomRatio) / 2);
      dashboard.style.padding = `${padY}px ${padX}px`;

      ['.current-date-time', '.dashboard-header', '.dashboard-divider', '.footer-box', '.attendance-top-box'].forEach(
        (selector) => {
          const element = document.querySelector(selector);
          if (element) element.style.setProperty('zoom', this.zoomRatio, 'important');
        },
      );

      const footerBox = document.querySelector('.footer-box');
      if (footerBox) footerBox.style.setProperty('width', '100%');

      const footerWrap = document.querySelector('.footer-box-wrap');
      if (footerWrap) {
        footerWrap.style.bottom = `${padY}px`;
        footerWrap.style.setProperty('width', `calc(100% - ${padX}px - ${padX}px)`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active,
.list-move {
  transition: opacity 1s, transform 1s;
}

.list-enter,
.list-enter-from {
  opacity: 0;
  transform: translateY(-200px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(200px);
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.6);
  z-index: 99;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
