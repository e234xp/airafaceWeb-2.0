<template>
  <div v-show="!isLoadSetting" class="ratio-wrap ratio-wrap-16x9">
    <div
      class="ratio-content dashboard dashboard--absolute"
      :style="{ backgroundImage: 'url(' + displaySettings.background_image + ')' }"
    >
      <div class="occupancy-logo-container" :style="{ zoom: zoomRatio }">
        <div class="d-flex align-items-center">
          <!-- 圖表停用時左上角統計區不顯示，返回箭頭改放在 logo 旁 -->
          <button v-if="isInGroupPersons && !displaySettings.displayChart" class="btn-reset" @click="returnToAllGroups">
            <img src="@/assets/img/attendance_return_arrow.svg" class="attendance-return-arrow" alt="return" />
          </button>
          <div class="occupancy-logo" @click="toLoginPage">
            <img :src="displaySettings.logo" class="occupancy-logo-img" />
          </div>
          <div v-if="!displaySettings.displayChart" class="attendance-title">
            {{ attendanceGroupTitle }}
          </div>
        </div>
        <div class="occupancy-time">
          {{ currentTime }}
        </div>
      </div>

      <!-------------------  Attendance - BEGIN ------------------>
      <div v-if="displaySettings.displayChart" class="attendance-top-box attendance-top-box--margin">
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag d-flex align-items-center">
            <button v-if="isInGroupPersons" class="btn-reset" @click="returnToAllGroups">
              <img src="@/assets/img/attendance_return_arrow.svg" class="attendance-return-arrow" alt="return" />
            </button>
            <div>
              {{ attendanceGroupTitle }}
            </div>
          </div>

          <!-- 第 2 列： 甜甜圈圖表 + 人數的數值-->
          <div class="attendance-statistics-data-box">
            <div class="doughnut-chart-canvas-wrap">
              <!-- Attendance 甜甜圈圖表 -->
              <canvas id="doughnut-chart-canvas" />
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
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{ getSortByText }}</span>
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

      <!-- 顯示人員資料列表 / 群組模式時的分組卡片 -->
      <div class="person-list-wrapper">
        <transition name="fade" mode="out-in">
          <div
            v-if="isShowGroup"
            :key="`group-${currentPageIndex}`"
            :style="{ 'margin-left': `${20 * zoomRatio}px`, 'margin-right': `${20 * zoomRatio}px` }"
            class="grid-6 person-list-container"
          >
            <button
              v-for="group in currentGroups"
              :key="group.name"
              class="btn-reset group-card-button"
              @click="onClickGroup(group)"
            >
              <div class="group-card group-card--tile" :style="'zoom: ' + zoomRatio + ' !important;'">
                <div class="attendance-group-card-name">
                  {{ groupLabel(group.name) }}
                </div>
                <div>
                  <span class="group-card-present-number">{{ group.present }}</span>
                  <span class="group-card-total-number">/ {{ group.total }}</span>
                </div>
              </div>
            </button>
          </div>
          <div
            v-else
            :key="`person-${currentGroup}-${currentPageIndex}`"
            :style="{ 'margin-left': `${20 * zoomRatio}px`, 'margin-right': `${20 * zoomRatio}px` }"
            class="grid-5 d-flex flex-wrap person-list-container"
          >
            <div
              v-for="(person, index) in currentPersons"
              :key="index"
              :class="['person-card', person.status === 1 ? 'absent-person-card' : '']"
              :style="'zoom: ' + zoomRatio + ' !important; border-left: 4px solid ' + getGroupColor(person) + ';'"
            >
              <img
                v-show="displaySettings.displayPhoto != 'NONE'"
                :class="['person-image', person.status === 1 ? 'absent-person-image' : '']"
                :src="getImageSrc(person)"
              />
              <div class="person-info-box">
                <div v-show="displaySettings.displayCardMode == 'STANDARD'" class="person-info-line1">
                  {{ showField(person, displaySettings.line2) }} &nbsp;
                </div>
                <div
                  :class="[person.status === 1 ? 'absent-person-name' : 'person-name']"
                  :style="'zoom: ' + zoomRatio + ' !important; color: ' + getGroupColor(person) + ';'"
                >
                  {{ getDisplayName(person) }}
                </div>
                <div v-if="person.status !== 1" class="d-flex align-items-end" />
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- footer -->
      <div class="footer-box">
        <div v-show="isLoadSetting" class="align-items-center loading-text">Loading...</div>

        <!-- 分頁按鈕 -->
        <div class="pager">
          <button class="pager-arrow-btn" :disabled="currentPageIndex === 0" @click="onClickPrev">
            <img class="pager-arrow-img" src="@/assets/img/pager_left_arrow.svg" alt="prev" />
          </button>
          <span class="pager-text">{{ currentPageIndex + 1 }}/{{ totalPageIndex + 1 }}</span>
          <button class="pager-arrow-btn" :disabled="currentPageIndex === totalPageIndex" @click="onClickNext">
            <img class="pager-arrow-img" src="@/assets/img/pager_right_arrow.svg" alt="next" />
          </button>
        </div>
        <!-- 右下角 powered by aira 字樣 -->
        <!-- <div class="footer-detail-box">
          <div class="footer-detail-text">
            powered by
          </div>
          <img
            src="@/assets/img/aira-logo-white.svg"
            alt=""
            class="footer-logo"
          >
        </div> -->
      </div>
    </div>
    <div v-if="loading" class="loading">
      <CSpinner color="primary" />
    </div>
  </div>
</template>

<script>
import { airaLogoWhite as airaLogo } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';

import chartHelper from '@/utils/ChartHelper.vue';
import OccupancySocket from '@/utils/OccupancySocket';

const emptyFace = '/img/empty-face.svg';

const SLOT_COUNT = 24;

// 群組模式下視為使用者還在操作的事件，閒置超過 patrolidleTime 才自動回分組畫面
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart'];

// 進入看板時要清掉預設 padding 的 CoreUI 外殼元素
const CONTAINER_RESETS = [
  ['.c-main', 'c-main-reset'],
  ['.c-header', 'c-header-reset'],
  ['.c-footer', 'c-footer-reset'],
  ['.container-fluid', 'container-fluid-reset'],
];

// 可以直接用 CSS zoom 縮放的區塊（內部沒有需要滑鼠互動的 canvas）
const ZOOM_TARGETS = ['.attendance-statistics-box', '.footer-box'];

// 圖表區各元素在 1920x1080 基準下的尺寸，縮放時改設實際 px 而非用 zoom
const CHART_BOX = {
  height: 240,
  marginX: 20,
  marginBottom: 25,
  chartWidth: 1363,
};

export default {
  name: 'OccupancyDashboard',
  mixins: [chartHelper],
  data() {
    return {
      loading: false,
      isLoadSetting: true,
      zoomRatio: 0,

      currentTime: '',
      currentTimeLooper: null,

      socket: null,

      // 後端回傳的資料
      persons: [],
      groups: [],
      hourly: [],

      // 群組模式：先顯示分組卡片，點擊後才進入該組人員
      isShowGroup: false,
      currentGroup: '',
      currentGroups: [],
      idleTime: Date.now(),

      // 卡片分頁
      currentPersons: [],
      currentPageIndex: 0,
      displayAmount: 20,
      totalPageIndex: 0,
      showPageProgressTimer: null,
      countdownStartTime: null,

      // 圖表
      chartLabels: [],
      chartDataIn: [],
      chartDataOut: [],
      chartDataPresent: [],

      displaySettings: {
        displayMode: 'OCCUPANCY',
        background_image: backgroundImage,
        logo: airaLogo,

        enableSummaryView: false,
        summaryBy: 'GROUP',
        summaryPatrolTime: 10,
        patrolidleTime: 60,

        displayGroup: ['All Person'],
        displayCardMode: 'STANDARD',
        displayPhoto: 'REGISTER',
        line1: 'NAME',
        line2: 'NONE',

        pageLayout: 'LARGE',
        displayChart: true,
        dailyResetTime: '00',
        personPatrolTime: 5,
      },
    };
  },
  computed: {
    // 群組模式下已點進某一組
    isInGroupPersons() {
      return this.displaySettings.enableSummaryView && !this.isShowGroup;
    },
    attendanceGroupTitle() {
      return this.isInGroupPersons ? this.groupLabel(this.currentGroup) : '';
    },
    // 依 summaryBy 由前端從 persons 分組，人員 status 隨 socket 更新時在場數會跟著變。
    // GROUP 只列 displayGroup 內的群組並照其順序；部門、職稱照人員出現的順序。
    summaryGroups() {
      const { summaryBy, displayGroup } = this.displaySettings;
      const groupMap = new Map();

      if (summaryBy === 'DEPARTMENT' || summaryBy === 'JOBTITLE') {
        const field = summaryBy === 'DEPARTMENT' ? 'department' : 'title';
        this.persons.forEach((p) => {
          const name = p[field] || '';
          if (!groupMap.has(name)) groupMap.set(name, []);
          groupMap.get(name).push(p);
        });
      } else {
        (displayGroup || []).forEach((name) => groupMap.set(name, []));
        this.persons.forEach((p) => {
          (p.group_list || []).forEach((name) => {
            if (groupMap.has(name)) groupMap.get(name).push(p);
          });
        });
      }

      return [...groupMap]
        .filter(([, persons]) => persons.length > 0)
        .map(([name, persons]) => ({
          name,
          persons,
          present: persons.filter((p) => p.status === 0).length,
          total: persons.length,
        }));
    },
    // 目前要列出卡片的人員：一般模式為全部，群組模式為點進的那一組
    viewPersons() {
      if (!this.displaySettings.enableSummaryView) return this.persons;
      const group = this.summaryGroups.find((g) => g.name === this.currentGroup);
      return group ? group.persons : [];
    },
    // 左上角數字：在分組畫面或一般模式顯示全部，點進某組時只算該組
    headerPersons() {
      return this.isInGroupPersons ? this.viewPersons : this.persons;
    },
    attendancePresent() {
      return this.headerPersons.filter((p) => p.status === 0).length;
    },
    attendanceTotal() {
      return this.headerPersons.length;
    },
    getSortByText() {
      switch (this.displaySettings.summaryBy) {
        case 'DEPARTMENT':
          return this.$t('SortByDepartment');
        case 'JOBTITLE':
          return this.$t('SortByJobTitle');
        case 'GROUP':
        default:
          return this.$t('SortByGroupName');
      }
    },
  },
  watch: {
    currentPageIndex() {
      this.refreshCurrentPage();
    },
  },

  async created() {
    const { data: display } = await this.$globalGetDisplaySetting();
    if (display && display.OCCUPANCY) {
      this.displaySettings = { ...this.displaySettings, ...display.OCCUPANCY };
    }
    this.isShowGroup = this.displaySettings.enableSummaryView;

    this.initHourly();
    this.initViews();
    this.isLoadSetting = false;

    await this.loadDashboard('all');

    this.$nextTick(() => {
      this.zoomViews();
      this.initBarChart();
      this.initDoughnutChart();

      requestAnimationFrame(() => {
        this.refreshCurrentPage();
        this.refreshCharts();

        // 只有一頁時計時器不會翻頁；點進群組後頁數會變，因此一律啟動
        this.resetAutoChangePageTimer();
      });
    });

    this.setupCurrentTimeLooper();
    this.connectSocket();
  },

  destroyed() {
    this.toggleContainerReset(false);
    window.removeEventListener('resize', this.zoomViews);
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, this.markActive));

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

      const { error, data } = await this.$globalQueryOccupancyDashboard(range);

      this.loading = false;

      if (error || !data) {
        console.error('載入 Occupancy 看板資料失敗:', error);
        return;
      }

      this.applyPersons(data.persons || []);
      this.groups = data.groups || [];

      if (range === 'all') this.initHourly();
      this.applyHourly(data.hourly || []);

      this.refreshCurrentPage();
      this.refreshCharts();
    },

    // persons 依後端排序後的順序顯示，前端不再排序。
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
        const slot = item.hour === undefined
          ? item.slot
          : (item.hour - this.resetHour() + SLOT_COUNT) % SLOT_COUNT;

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

    // 一則推播同時帶 occupancy / capacity / guard 三個看板的判定結果，這裡只取 occupancy
    applySocketUpdate(payload) {
      const update = payload && payload.occupancy;
      if (!update || !update.counted) return;

      const person = this.persons.find((p) => p.uuid === update.person_uuid);
      if (person) person.status = update.status;

      const cell = this.hourly[this.currentSlot()];
      if (cell) {
        if (update.direction === 'in') cell.in += 1;
        else cell.out += 1;

        // 長條圖是全部人員的統計，不受目前點進哪一組影響
        cell.present = this.persons.filter((p) => p.status === 0).length;
      }

      // 分組卡片是 summaryGroups 的切片，需重切一次才會顯示新的在場數
      if (this.isShowGroup) this.refreshCurrentPage();

      this.refreshCharts();
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
      const absent = this.attendanceTotal - present;

      const ctx = document.getElementById('doughnut-chart-canvas');
      this.setupAttendanceDoughnutChart(ctx, [present, absent], true);
    },

    // ---------------- 分頁 ----------------

    // 每頁卡片數依容器高度動態計算，螢幕越高一頁越多人
    setupPageLayoutAmount() {
      const [columns, cardHeight, cardMargin] = this.isShowGroup ? [6, 152, 9] : [5, 104, 12];
      const zoomRatio = this.zoomRatio || 1;
      const cardTotalHeight = (cardHeight + cardMargin) * zoomRatio;

      const listWrapper = document.querySelector('.person-list-wrapper');
      if (listWrapper) {
        const rows = Math.floor(listWrapper.clientHeight / cardTotalHeight) || 4;
        return columns * rows;
      }

      return 20;
    },

    refreshCurrentPage() {
      const items = this.isShowGroup ? this.summaryGroups : this.viewPersons;

      this.displayAmount = this.setupPageLayoutAmount();
      this.totalPageIndex = Math.max(Math.ceil(items.length / this.displayAmount) - 1, 0);

      if (this.currentPageIndex > this.totalPageIndex) {
        this.currentPageIndex = 0;
        return; // watch 會再進來一次
      }

      const begin = this.currentPageIndex * this.displayAmount;
      const pageItems = items.slice(begin, begin + this.displayAmount);

      if (this.isShowGroup) {
        this.currentGroups = pageItems;
        return;
      }

      this.currentPersons = pageItems;
      this.fetchPhotosForCurrentPage();
    },

    // 分組畫面與人員畫面切換時，頁碼、卡片、左上角數字與輪巡計時都要重來
    switchView(isShowGroup, groupName) {
      this.isShowGroup = isShowGroup;
      this.currentGroup = groupName;
      this.currentPageIndex = 0;
      this.idleTime = Date.now();

      this.refreshCurrentPage();
      this.refreshDoughnutChart();
      this.resetAutoChangePageTimer();
    },

    onClickGroup(group) {
      if (group.total <= 0) return;
      this.switchView(false, group.name);
    },

    returnToAllGroups() {
      this.switchView(true, '');
    },

    markActive() {
      this.idleTime = Date.now();
    },

    // 沒填部門或職稱的人歸在名稱為空字串的組
    groupLabel(name) {
      return name || this.$t('Uncategorized');
    },

    // 只抓當前頁、且還沒有照片的人
    fetchPhotosForCurrentPage() {
      this.currentPersons.forEach((item) => {
        const person = item;
        if (person.lastImage || person.display_image || person.register_image) return;

        this.$globalFetchPhoto(person.uuid, (err, data) => {
          if (err || !data) return;

          person.display_image = data.display_image || '';
          person.register_image = data.register_image || '';
        });
      });
    },

    resetAutoChangePageTimer() {
      if (this.showPageProgressTimer) clearInterval(this.showPageProgressTimer);

      this.countdownStartTime = new Date();

      this.showPageProgressTimer = setInterval(() => {
        if (this.totalPageIndex <= 0) return;

        const elapsed = new Date() - this.countdownStartTime;
        const patrolTime = this.isShowGroup
          ? this.displaySettings.summaryPatrolTime
          : this.displaySettings.personPatrolTime;
        const duration = patrolTime * 1000;

        if (elapsed >= duration) {
          this.countdownStartTime = new Date();
          this.currentPageIndex = this.currentPageIndex === this.totalPageIndex ? 0 : this.currentPageIndex + 1;
        }
      }, 1000);
    },

    onClickPrev() {
      if (this.currentPageIndex === 0) return;
      this.currentPageIndex -= 1;
      this.resetAutoChangePageTimer();
    },

    onClickNext() {
      if (this.currentPageIndex === this.totalPageIndex) return;
      this.currentPageIndex += 1;
      this.resetAutoChangePageTimer();
    },

    // ---------------- 時鐘 ----------------

    setupCurrentTimeLooper() {
      this.updateCurrentTime();

      this.currentTimeLooper = setInterval(() => {
        const now = new Date();
        this.updateCurrentTime(now);

        const idleLimit = this.displaySettings.patrolidleTime * 1000;
        if (this.isInGroupPersons && idleLimit > 0 && Date.now() - this.idleTime > idleLimit) {
          this.returnToAllGroups();
        }

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
      this.currentTime = `${hour}:${minute}`;
    },

    // ---------------- 卡片顯示 ----------------

    getImageSrc(personData) {
      const isPlaceholder = (img) => !img || typeof img === 'object' || img === emptyFace;

      const b64 = (!isPlaceholder(personData.display_image) && personData.display_image)
        || (!isPlaceholder(personData.register_image) && personData.register_image)
        || personData.lastImage;

      if (b64 && !isPlaceholder(b64)) {
        this.$set(personData, 'lastImage', b64);
        return `data:image/png;base64,${b64}`;
      }

      return emptyFace;
    },

    getDisplayName(person) {
      let retName = '';

      if (this.displaySettings.line1 === 'NAME') retName = person.name;
      else if (this.displaySettings.line1 === 'PARTIALNAME') retName = this.showField(person, 'PARTIALNAME');

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
          return '';
        default:
          return '';
      }
    },

    // TODO: 群組顏色目前寫死，自訂群組名稱不會有顏色，待搬到顯示設定
    getGroupColor(person) {
      if (person.status === 1) return '#FFFFFF';

      const groupColors = {
        Employee: '#FF9D72',
        Partner: '#44C961',
        VIP: '#5B9AF9',
        來賓: '#F066FC',
      };

      return groupColors[person.primary_group] || '#FFFFFF';
    },

    // ---------------- 版面 ----------------

    initViews() {
      this.toggleContainerReset(true);

      // 等 DOM 排版完成再量尺寸
      setTimeout(() => this.zoomViews(), 168);

      window.addEventListener('resize', this.zoomViews);
      ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, this.markActive));
    },

    // CoreUI 外殼的預設 padding 會擋住全螢幕版面，進入看板時清掉、離開時還原
    toggleContainerReset(on) {
      CONTAINER_RESETS.forEach(([selector, className]) => {
        const element = document.querySelector(selector);
        if (element) element.classList[on ? 'add' : 'remove'](className);
      });
    },

    // 版面以 1920x1080 為基準等比縮放並置中。
    // 用 CSS zoom 而非 transform: scale，因為 setupPageLayoutAmount() 需要
    // 縮放後的實際 clientHeight 來計算每頁卡片數。
    zoomViews() {
      const dashboard = document.querySelector('.dashboard');
      if (!dashboard) return;

      const { clientWidth: width, clientHeight: height } = dashboard;

      this.zoomRatio = Math.min(width / 1920, height / 1080);

      const padX = Math.floor((width - 1920 * this.zoomRatio) / 2);
      const padY = Math.floor((height - 1080 * this.zoomRatio) / 2);
      dashboard.style.padding = `${padY}px ${padX}px`;

      ZOOM_TARGETS.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) element.style.setProperty('zoom', this.zoomRatio, 'important');
      });

      this.resizeChartBox();
    },

    // 長條圖不能用 CSS zoom：chart.js 以 offsetX 判斷滑鼠落在哪一根柱子，
    // 而 zoom 會讓 offsetX 與 canvas 內部座標對不上，tooltip 會指到別根柱子。
    // 因此改為直接設定縮放後的實際尺寸，讓 canvas 維持在未縮放的座標系。
    resizeChartBox() {
      const ratio = this.zoomRatio;

      const topBox = document.querySelector('.attendance-top-box');
      if (topBox) {
        topBox.style.height = `${CHART_BOX.height * ratio}px`;
        topBox.style.marginLeft = `${CHART_BOX.marginX * ratio}px`;
        topBox.style.marginRight = `${CHART_BOX.marginX * ratio}px`;
        topBox.style.marginBottom = `${CHART_BOX.marginBottom * ratio}px`;
      }

      const chartWrap = document.querySelector('.attendance-chart-canvas-wrap');
      if (chartWrap) chartWrap.style.width = `${CHART_BOX.chartWidth * ratio}px`;
    },

    toLoginPage() {
      this.$globalLogout();
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
.header-reset {
  display: none;
}

.main-reset {
  padding-top: 0px !important;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-reset {
  padding-left: 0px !important;
  padding-right: 0px !important;
  margin-left: 0px !important;
  margin-right: 0px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-reset {
  display: none;
}

.dashboard {
  font-family: 'Noto Sans', sans-serif;
  position: relative;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  overflow: hidden;

  &--absolute {
    position: absolute;
    z-index: 50;
    background-size: 100%;
    min-height: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column;
  }

  .pager {
    display: flex;
    align-items: center;
    padding: 20px 0;
  }
}

.occupancy-logo-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  width: 100%;

  .occupancy-logo {
    width: 120px;
    height: auto;
    cursor: pointer;

    &-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .occupancy-time {
    font-family: 'Noto Sans', sans-serif;
    color: white;
    font-size: 4rem;
    font-weight: 400;
  }
}

.dashboard-divider {
  margin: 12px 0;

  &--margin {
    margin-left: 20px;
    margin-right: 20px;
  }
}

.attendance-top-box {
  width: 100%;
  height: 240px;
  margin-bottom: 25px;
  display: flex;

  &--margin {
    margin-left: 20px;
    margin-right: 20px;
  }
}

.attendance-statistics-box {
  width: 504px;
  height: 240px;
  border-right: 1px solid #565758;
  margin-bottom: 22px;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.attendance-statistics-data-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid #565758;
}

.attendance-title {
  margin-left: 20px;
  color: white;
  font-weight: 200;
  font-size: 32px;
  font-family: 'Noto Sans', sans-serif;
}

.attendance-header-tag {
  height: 41px;
  border-radius: 4px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 200;
  color: white;
  font-size: 32px;
}

.attendance-header-present {
  font-weight: 400;
  font-size: 80px;
  color: #8dcdff;
  font-family: 'Noto Sans', sans-serif;
  margin-right: 8px;
  line-height: 0.7em;
}

.attendance-header-total {
  font-weight: 500;
  font-size: 44px;
  font-family: 'Noto Sans', sans-serif;
  color: #737578;
  line-height: 0.7em;
}

.attendance-return-arrow {
  width: 24px;
  height: 22px;
  margin-right: 24px;
}

.attendance-sort-icon {
  width: 20px !important;
  height: 20px !important;
}

.attendance-dropdown-arrow {
  margin-left: 20px;
  width: 12px;
  height: 6px;
}

.attendance-group-card-name {
  color: white;
  font-family: 'Noto Sans', sans-serif;
  text-overflow: ellipsis;
  font-size: 22px;
  line-height: 0.75em;
  text-align: left;
}

.attendance-chart-canvas-wrap {
  width: 1363px;
}

.doughnut-chart-canvas-wrap {
  width: 95px;
  height: 95px;
}

#chart-canvas {
  width: 80% !important;
  height: 100% !important;
}

#doughnut-chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.person-list-wrapper {
  flex: 1;
  overflow: hidden;
  margin-bottom: 10px;
}

.person-list-container {
  align-items: start;
  align-content: start;
  grid-auto-rows: min-content;
}

.grid-5 {
  display: grid !important;
  gap: 0.7%;
  grid-template-columns: repeat(5, 1fr);
}

.person-card {
  background: rgba(74, 74, 74, 0.3);
  backdrop-filter: blur(16px);
  border-radius: 0 8px 8px 0;
  width: 100%;
  height: 104px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;

  .person-image {
    width: 80px;
    height: 80px;
    border-radius: 2px;
    object-fit: contain;
  }

  .absent-person-image {
    opacity: 0.6;
  }

  .person-info-box {
    flex: 1;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .person-info-line1 {
      width: 100%;
      font-weight: 500;
      font-size: 18px;
      color: white;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .person-name,
    .absent-person-name {
      width: 100%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.2;
      color: white;
      font-weight: 700;
      font-size: 20px;
    }
  }
}

.absent-person-card {
  opacity: 0.4;
}

.clockin-time {
  margin-right: 20px;
}

.group-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  transition: 0.5s ease-in-out;

  &.card-flip {
    transform: rotateX(360deg);
  }
}

.group-card-present-number {
  color: #6fa4cd;
  font-size: 60px;
  margin-right: 8px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 500;
  line-height: 0.7em;
}

.group-card-total-number {
  font-family: 'Noto Sans', sans-serif;
  color: #737578;
  font-size: 24px;
  font-weight: 500;
  line-height: 0.7em;
}

.grid-6 {
  display: grid !important;
  gap: 0.7%;
  grid-template-columns: repeat(6, 1fr);
}

.group-card-button {
  width: 100%;
  cursor: pointer;
}

.group-card--tile {
  height: 152px;
  background: #37393c;
  padding: 16px;
  margin-bottom: 9px;
}

.pager-arrow-btn {
  padding: 4px 8px;
  cursor: pointer;
  background: transparent;
  border: none;

  &:disabled {
    cursor: not-allowed;
    background: transparent;
    opacity: 0.4;
  }
}

.pager-arrow-img {
  width: 10px;
  height: auto;
  display: block;
}

.pager-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 24px;
}

.footer-box {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 20px 0 40px;
}

.footer-detail-box {
  position: absolute;
  bottom: 0.96%;
  right: 0;
  display: flex;
  color: white;
  align-items: end;
}

.footer-detail-text {
  font-size: 14px;
  font-weight: 200;
  margin-right: 9px;
  line-height: 0.6em;
}

.footer-logo {
  width: 54px;
  height: 24px;
  object-fit: contain;
}

.loading-text {
  color: white;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
