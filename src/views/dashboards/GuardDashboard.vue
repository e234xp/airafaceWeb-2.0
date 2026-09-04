<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-show="!isLoadSetting">
    <div
      class="ratio-content dashboard"
      style="position: absolute; z-index: 50"
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
      <div class="guard-divider" style="width: 100%; height: 1px; border-bottom: 1px solid #6a6b6c" />

      <div
        class="guard-content"
        style="display: flex; width: 100%"
        :style="{ height: `calc(100% - ${61 * zoomRatio}px)` }"
      >
        <!-------------------  Guard - LEFT ------------------>
        <div style="width: 100%; padding: 24px; position: relative" :style="'zoom: ' + zoomRatio + ' !important;'">
          <div
            style="display: flex; width: 100%; height: 240px; background: #2c2c2c; margin-bottom: 16px"
            :style="{ opacity: expandFlag === '' ? 1 : 0 }"
          >
            <div
              class="fz-xxxl"
              style="
                width: 10%;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 16px 0 16px 16px;
              "
            >
              <div>{{ $t('HourlyNumberOfAdmission') }}</div>
              <div>
                <span class="fz-super-large" style="color: #7fb97a">{{ entryPersons.length }}</span>
                {{ $t('UnitPerson') }}
              </div>
            </div>
            <div style="width: 90%; height: 100%; padding: 8px 24px; border-radius: 8px">
              <canvas ref="canvas" />
            </div>
          </div>
          <template v-if="expandFlag === ''">
            <GuardRegionTitle
              :index="currentPageIndex"
              :total="currentPageTotal"
              :expand="false"
              @prev="onCurrentPrev"
              @next="onCurrentNext"
              @expand="onExpand('current')"
              type="present"
            >
              {{ $t('PersonOfAdmission') }}
            </GuardRegionTitle>
            <div class="grid-2-6" style="height: 240px; margin-bottom: 16px">
              <FaceCard
                type="present"
                :image="parseImage(item)"
                :name="parseLine1(item)"
                :depart="parseLine2(item)"
                :time="item.last_in_time"
                v-for="item in currentPersons"
                :key="item.uuid"
              />
            </div>
            <GuardRegionTitle
              :index="strangerPageIndex"
              :total="strangerPageTotal"
              :expand="false"
              @prev="onStrangerPrev"
              @next="onStrangerNext"
              @expand="onExpand('stranger')"
              type="unknown"
            >
              <div style="display: flex; gap: 16px">
                <div style="margin-right: 16px">
                  {{ $t('Stranger') }}
                </div>
                <div class="chart-btn fz-lg" style="padding: 0 16px" @click="onSelectAll">
                  {{ $t('SelectAll') }}
                </div>
                <div class="chart-btn fz-lg" style="padding: 0 16px" @click="onCancelAll">
                  {{ $t('Cancel') }}
                </div>
                <div>{{ selectedStrangers.length }} / {{ strangers.length }} {{ $t('Selected') }}</div>
                <div
                  class="chart-btn fz-lg"
                  :class="[selectedStrangers.length === 0 ? 'disabled' : '']"
                  style="padding: 0 16px; margin-left: auto"
                  @click="onBatchAck(false)"
                >
                  {{ $t('Remarks') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  :class="[selectedStrangers.length === 0 ? 'disabled' : '']"
                  style="padding: 0 16px"
                  @click="onBatchAck(true)"
                >
                  {{ $t('Acknowledge') }}
                </div>
              </div>
            </GuardRegionTitle>
            <div class="grid-2-6" style="height: 240px">
              <FaceCard
                type="unknown"
                :image="item.face_image || emptyFace"
                :time="item.timestamp"
                :selected="isSelected(item.verify_uuid)"
                @ack="onAck(item.verify_uuid)"
                @click.native="onSelect(item.verify_uuid)"
                v-for="item in currentStrangers"
                :key="item.verify_uuid"
              />
            </div>
          </template>
          <template v-if="expandFlag === 'current'">
            <GuardRegionTitle
              :index="currentPageIndex"
              :total="currentPageTotal"
              :expand="true"
              @prev="onCurrentPrev"
              @next="onCurrentNext"
              @expand="onExpand('')"
              type="present"
              style="position: absolute; top: 16px; left: 24px; width: calc(100% - 40px)"
            >
              {{ $t('PersonOfAdmission') }}
            </GuardRegionTitle>
            <div
              class="grid-7-6"
              style="
                position: absolute;
                top: 80px;
                left: 24px;
                width: calc(100% - 40px);
                margin-bottom: 16px;
                height: 708px;
              "
            >
              <FaceCard
                type="present"
                :image="parseImage(item)"
                :name="parseLine1(item)"
                :depart="parseLine2(item)"
                :time="item.last_in_time"
                v-for="item in currentPersons"
                :key="item.uuid"
              />
            </div>
          </template>
          <template v-else-if="expandFlag === 'stranger'">
            <GuardRegionTitle
              :index="strangerPageIndex"
              :total="strangerPageTotal"
              :expand="true"
              @prev="onStrangerPrev"
              @next="onStrangerNext"
              @expand="onExpand('')"
              type="unknown"
              style="position: absolute; top: 16px; left: 24px; width: calc(100% - 40px)"
            >
              <div style="display: flex; gap: 16px">
                <div style="margin-right: 16px">
                  {{ $t('Stranger') }}
                </div>
                <div class="chart-btn fz-lg" style="padding: 0 16px" @click="onSelectAll">
                  {{ $t('SelectAll') }}
                </div>
                <div class="chart-btn fz-lg" style="padding: 0 16px" @click="onCancelAll">
                  {{ $t('Cancel') }}
                </div>
                <div>{{ selectedStrangers.length }} / {{ strangers.length }} {{ $t('Selected') }}</div>
                <div
                  class="chart-btn fz-lg"
                  :class="[selectedStrangers.length === 0 ? 'disabled' : '']"
                  style="padding: 0 16px; margin-left: auto"
                  @click="onBatchAck(false)"
                >
                  {{ $t('Remarks') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  :class="[selectedStrangers.length === 0 ? 'disabled' : '']"
                  style="padding: 0 16px"
                  @click="onBatchAck(true)"
                >
                  {{ $t('Acknowledge') }}
                </div>
              </div>
            </GuardRegionTitle>
            <div
              class="grid-7-6"
              style="
                position: absolute;
                top: 80px;
                left: 24px;
                width: calc(100% - 40px);
                margin-bottom: 16px;
                height: 708px;
              "
            >
              <FaceCard
                type="unknown"
                :image="item.face_image || emptyFace"
                :time="item.timestamp"
                :selected="isSelected(item.verify_uuid)"
                @ack="onAck(item.verify_uuid)"
                @click.native="onSelect(item.verify_uuid)"
                v-for="item in currentStrangers"
                :key="item.verify_uuid"
              />
            </div>
          </template>
        </div>
        <!-------------------  Guard - RIGHT ------------------>
        <div
          style="width: 20%; height: 100%; background: rgba(44, 44, 44, 0.4); padding: 16px; color: white"
          :style="'zoom: ' + zoomRatio + ' !important;'"
          v-if="false"
        >
          <div class="fz-xxxl" style="margin-bottom: 24px">即時影像</div>
          <video ref="video" autoplay height="100" style="width: 100%" />
          <CameraVideo :name="'1 號攝影機 - 大門'" style="margin-bottom: 24px" />
          <CameraVideo :name="'2 號攝影機 - 會議室'" />
        </div>
      </div>

      <!-- footer -->
      <div class="footer-box d-flex justify-content-between" style="margin: 0 20px" v-if="false">
        <!-- 右下角 powered by aira 字樣 -->
        <div class="footer-detail-box">
          <div class="footer-detail-text">powered by</div>
          <img src="@/assets/img/aira-logo-white.svg" alt="" class="footer-logo" />
        </div>
      </div>
    </div>
    <GuardAckModal
      :style="'zoom: ' + zoomRatio + ' !important;'"
      :persons="ackedStrangers"
      :direct="autoAck"
      @close="onClose"
      @confirm="onConfirm"
      v-if="showAckModal"
    />
    <div class="loading" v-if="loading">
      <CSpinner color="primary" />
    </div>
  </div>
</template>

<script>
import { airaLogoWhite as airaLogo, defaultPhotoImage } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';

import chartHelper from '@/utils/ChartHelper.vue';
import OccupancySocket from '@/utils/OccupancySocket';

import FaceCard from './components/FaceCard.vue';
import GuardRegionTitle from './components/GuardRegionTitle.vue';
import GuardAckModal from './components/GuardAckModal.vue';
import CameraVideo from './components/CameraVideo.vue';

const SLOT_COUNT = 24;

// 進入看板時要清掉預設 padding 的 CoreUI 外殼元素
const CONTAINER_RESETS = [
  ['.c-main', 'c-main-reset'],
  ['.c-header', 'c-header-reset'],
  ['.c-footer', 'c-footer-reset'],
  ['.container-fluid', 'container-fluid-reset'],
];

export default {
  name: 'GuardDashboard',

  components: {
    FaceCard,
    GuardRegionTitle,
    GuardAckModal,
    CameraVideo,
  },

  mixins: [chartHelper],

  data() {
    return {
      emptyFace: defaultPhotoImage,

      loading: false,
      isLoadSetting: true,
      zoomRatio: 0,

      currentDate: '',
      currentTime: '',
      currentTimeLooper: null,

      socket: null,

      // 後端回傳的資料
      persons: [],
      strangers: [],
      hourly: [],

      // 圖表
      chartLabels: [],
      chartDataIn: [],
      chartDataOut: [],

      // 分頁：兩個區塊共用同一個每頁筆數，展開時才放大
      currentPageIndex: 0,
      strangerPageIndex: 0,
      displayAmount: 12,
      expandAmount: 42,
      normalAmount: 12,

      selectedStrangers: [],
      ackedStrangers: [],

      displaySettings: {
        displayMode: 'GUARD',
        uuid: '',
        background_image: backgroundImage,
        logo: airaLogo,

        displayGroup: ['All Person'],
        displayPhoto: 'REGISTER', // NONE, REGISTER, SNAPSHOT, DISPLAY
        line1: 'NAME', // NONE, NAME, PARTIALNAME
        line2: 'NONE', // NONE, JOBTITLE, GROUP, DEPARTMENT, TEMPERATURE

        dailyResetTime: '00:00',
        strangerMaxItem: 100,

        deviceIn: '',
        deviceOut: '',
      },

      showAckModal: false,
      autoAck: false,
      expandFlag: '',
    };
  },

  computed: {
    // 在場：依最後進場時間由新到舊
    entryPersons() {
      return this.persons.filter((p) => p.status === 0).sort((a, b) => (b.last_in_time || 0) - (a.last_in_time || 0));
    },

    currentPersons() {
      const beginIndex = this.displayAmount * this.currentPageIndex;
      return this.entryPersons.slice(beginIndex, beginIndex + this.displayAmount);
    },

    currentPageTotal() {
      return Math.ceil(this.entryPersons.length / this.displayAmount);
    },

    currentStrangers() {
      const beginIndex = this.displayAmount * this.strangerPageIndex;
      return this.strangers.slice(beginIndex, beginIndex + this.displayAmount);
    },

    strangerPageTotal() {
      return Math.ceil(this.strangers.length / this.displayAmount);
    },
  },

  watch: {
    // 照片一律懶載入，只抓當前頁；換頁、展開、即時推播都會讓這兩個 computed 重算
    currentPersons() {
      this.fetchPersonPhotos();
    },

    currentStrangers() {
      this.fetchStrangerPhotos();
    },
  },

  async mounted() {
    const { data: display } = await this.$globalGetDisplaySetting();
    if (display && display.GUARD) {
      this.displaySettings = { ...this.displaySettings, ...display.GUARD };
    }

    this.initHourly();
    this.initViews();
    this.isLoadSetting = false;

    // 圖表建立時就要拿到 zoomRatio，Chart.js 的滑鼠座標校正只在建立當下綁定
    this.zoomViews();

    await this.loadDashboard('all');

    this.$nextTick(() => {
      this.zoomViews();
      this.refreshBarChart();
    });

    this.setupCurrentTimeLooper();
    this.connectSocket();
  },

  destroyed() {
    this.toggleContainerReset(false);
    window.removeEventListener('resize', this.zoomViews);

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
      }));
    },

    // ---------------- 資料載入 ----------------

    // range 帶 'all' 取完整 24 筆 hourly，不帶則只更新當前時段
    async loadDashboard(range) {
      this.loading = true;

      const { error, data } = await this.$globalQueryGuardDashboard(range);

      this.loading = false;

      if (error || !data) {
        console.error('載入 Guard 看板資料失敗:', error);
        return;
      }

      this.applyPersons(data.persons || []);
      this.applyStrangers(data.strangers || []);

      if (range === 'all') this.initHourly();
      this.applyHourly(data.hourly || []);

      this.refreshBarChart();
    },

    // 照片不隨此 API 回傳，翻頁時才懶載入，重載時保留已抓到的圖避免閃爍
    applyPersons(list) {
      const cache = new Map();
      this.persons.forEach((p) => {
        if (p.register_image || p.display_image) {
          cache.set(p.uuid, { register_image: p.register_image, display_image: p.display_image });
        }
      });

      this.persons = list.map((p) => ({
        ...p,
        register_image: '',
        display_image: '',
        ...cache.get(p.uuid),
      }));
    },

    // 即時推播進來的陌生人已內嵌快照，重載時要保住，否則會再抓一次抓拍照
    applyStrangers(list) {
      const cache = new Map();
      this.strangers.forEach((s) => {
        if (s.face_image) cache.set(s.verify_uuid, s.face_image);
      });

      this.strangers = list.map((s) => ({
        ...s,
        face_image: cache.get(s.verify_uuid) || '',
      }));

      this.trimStrangers();
    },

    // 依格子覆蓋，不分辨是 1 筆還是 24 筆。
    // 優先用 hour 反推位置：hour 是絕對的時鐘小時，slot 則依賴前後端對
    // dailyResetTime 的認知一致，用 hour 換算才不會整批錯位。
    applyHourly(list) {
      list.forEach((item) => {
        const slot = item.hour === undefined ? item.slot : (item.hour - this.resetHour() + SLOT_COUNT) % SLOT_COUNT;

        if (slot === undefined || slot < 0 || slot >= SLOT_COUNT) return;

        this.$set(this.hourly, slot, {
          slot,
          hour: item.hour === undefined ? this.slotToHour(slot) : item.hour,
          in: item.in || 0,
          // 長條圖是堆疊圖，out 一律取正值
          out: Math.abs(item.out || 0),
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

    // 一則推播可能同時帶 occupancy / capacity / guard 三個看板的判定結果，
    // 也可能只推 guard 區塊本身，取不到 guard 就把整包當 guard 區塊看
    applySocketUpdate(payload) {
      const update = payload && payload.guard;
      if (!update || !update.counted) return;

      if (update.type === 'stranger') {
        this.applyStrangerUpdate(update);
        return;
      }

      // 未帶 type 視為人員事件
      const person = this.persons.find((p) => p.uuid === update.person_uuid);
      if (person) {
        person.status = update.status;

        // 卡片要顯示進場時間，清單也依此排序；沒有這個值排序會跳動
        if (update.direction === 'in' && update.last_in_time) {
          person.last_in_time = update.last_in_time;
        }
        if (update.direction === 'out') {
          person.last_out_time = update.last_out_time || update.timestamp || Date.now();
        }
      }

      const cell = this.hourly[this.currentSlot()];
      if (cell) {
        if (update.direction === 'in') cell.in += 1;
        else cell.out += 1;
      }

      this.refreshBarChart();
    },

    applyStrangerUpdate(update) {
      const stranger = {
        ...update,
        // 即時推播直接內嵌快照，歷史資料只有 face_image_id，翻頁時才懶載入
        face_image: update.snapshot || update.face_image || '',
      };

      // 同一張 base64 留兩份會多佔一倍記憶體
      delete stranger.snapshot;

      this.strangers.unshift(stranger);
      this.trimStrangers();
    },

    // 陌生人清單只保留 strangerMaxItem 筆。每筆都帶一張 base64 快照，
    // 看板是 24 小時連續跑的，不設上限記憶體會無限成長。
    trimStrangers() {
      const max = this.displaySettings.strangerMaxItem || 100;

      // 後端已依 timestamp 由新到舊排序，砍尾即砍最舊的。
      // Vue 2 偵測不到 arr.length = n，必須用 splice 才會觸發更新；
      // 被移除的物件（含 face_image 的 base64）失去參照後由 GC 回收。
      if (this.strangers.length > max) {
        this.strangers.splice(max);
      }

      // 被裁掉的項目若還留在勾選清單裡會變成幽靈選取，
      // onBatchAck() 的 find() 會拿到 undefined。
      if (this.selectedStrangers.length >= 1) {
        const alive = new Set(this.strangers.map((d) => d.verify_uuid));
        const kept = this.selectedStrangers.filter((id) => alive.has(id));
        if (kept.length !== this.selectedStrangers.length) this.selectedStrangers = kept;
      }

      // 裁切後總頁數可能變少，目前停留的頁碼要收回範圍內
      const lastPage = Math.max(this.strangerPageTotal - 1, 0);
      if (this.strangerPageIndex > lastPage) this.strangerPageIndex = lastPage;
    },

    // ---------------- 圖表 ----------------

    syncChartData() {
      this.chartLabels = this.hourly.map((h) => h.hour);
      this.chartDataIn = this.hourly.map((h) => h.in);
      this.chartDataOut = this.hourly.map((h) => h.out);
    },

    refreshBarChart() {
      this.syncChartData();

      this.setupGuardDashboardChart(
        this.$refs.canvas,
        this.chartLabels,
        this.chartDataIn,
        this.chartDataOut,
        this.currentSlot(),
        this.zoomRatio,
      );
    },

    // ---------------- 照片懶載入 ----------------

    fetchPersonPhotos() {
      if (this.displaySettings.displayPhoto === 'NONE') return;

      this.currentPersons.forEach((item) => {
        const person = item;
        if (person.register_image || person.display_image) return;

        this.$globalFetchPhoto(person.uuid, (err, data) => {
          if (err || !data) return;

          // 沒有照片的人也要寫入預設圖，否則每次清單重算都會再抓一次
          person.register_image = data.register_image || this.emptyFace;
          person.display_image = data.display_image || '';
        });
      });
    },

    fetchStrangerPhotos() {
      this.currentStrangers.forEach((item) => {
        const stranger = item;
        if (stranger.face_image || !stranger.face_image_id) return;

        this.$globalFetchVerifyPhoto(stranger.face_image_id, (err, data) => {
          if (err || !data) return;

          stranger.face_image = data.face_image || this.emptyFace;
        });
      });
    },

    // ---------------- 分頁 ----------------

    onCurrentPrev() {
      if (this.currentPageIndex === 0) return;
      this.currentPageIndex -= 1;
    },

    onCurrentNext() {
      if (this.currentPageIndex >= this.currentPageTotal - 1) return;
      this.currentPageIndex += 1;
    },

    onStrangerPrev() {
      if (this.strangerPageIndex === 0) return;
      this.strangerPageIndex -= 1;
    },

    onStrangerNext() {
      if (this.strangerPageIndex >= this.strangerPageTotal - 1) return;
      this.strangerPageIndex += 1;
    },

    onExpand(flag) {
      if (flag === '') {
        this.displayAmount = this.normalAmount;
        if (this.expandFlag === 'current') {
          this.currentPageIndex = Math.floor((this.currentPageIndex * this.expandAmount) / this.normalAmount);
        }
        if (this.expandFlag === 'stranger') {
          this.strangerPageIndex = Math.floor((this.strangerPageIndex * this.expandAmount) / this.normalAmount);
        }
      } else {
        this.displayAmount = this.expandAmount;
        if (flag === 'current') {
          this.currentPageIndex = Math.floor((this.currentPageIndex * this.normalAmount) / this.expandAmount);
        }
        if (flag === 'stranger') {
          this.strangerPageIndex = Math.floor((this.strangerPageIndex * this.normalAmount) / this.expandAmount);
        }
      }

      this.expandFlag = flag;

      // 收合後圖表區塊才重新顯示，canvas 尺寸變了要重畫
      if (this.expandFlag === '') {
        this.$nextTick(() => {
          this.refreshBarChart();
        });
      }
    },

    // ---------------- 陌生人備註／確認 ----------------

    isSelected(id) {
      return this.selectedStrangers.indexOf(id) >= 0;
    },

    onSelect(uuid) {
      const idx = this.selectedStrangers.findIndex((id) => id === uuid);
      if (idx < 0) this.selectedStrangers.push(uuid);
      else this.selectedStrangers.splice(idx, 1);
    },

    onSelectAll() {
      this.currentStrangers.forEach((d) => {
        if (this.selectedStrangers.indexOf(d.verify_uuid) < 0) this.selectedStrangers.push(d.verify_uuid);
      });
    },

    onCancelAll() {
      this.selectedStrangers = [];
    },

    // 相似人員由後端直接帶 id / name，只差一張註冊照
    onAck(id) {
      const stranger = this.strangers.find((item) => item.verify_uuid === id);
      if (!stranger) return;

      const near = stranger.nearest_person;
      if (!near || !near.uuid) {
        this.ackedStrangers = [stranger];
        this.showAckModal = true;
        return;
      }

      // 相似人員可能已離場，不一定在當前頁，照片沿用人員清單當快取
      const cached = this.persons.find((p) => p.uuid === near.uuid);
      if (cached && cached.register_image) {
        this.openAckModal(stranger, { ...near, register_image: cached.register_image });
        return;
      }

      this.$globalFetchPhoto(near.uuid, (err, data) => {
        const image = (!err && data && data.register_image) || '';
        if (cached && image) cached.register_image = image;

        this.openAckModal(stranger, { ...near, register_image: image || this.emptyFace });
      });
    },

    openAckModal(stranger, near) {
      this.ackedStrangers = [{ ...stranger, near }];
      this.showAckModal = true;
    },

    onBatchAck(auto = false) {
      this.autoAck = auto;

      if (this.selectedStrangers.length === 1) {
        this.onAck(this.selectedStrangers[0]);
        return;
      }

      this.ackedStrangers = this.selectedStrangers.map((id) => this.strangers.find((s) => s.verify_uuid === id));
      this.showAckModal = true;
    },

    onClose() {
      this.showAckModal = false;
      // ackedStrangers 內含快照與註冊照的 base64，關閉後就沒有用途了
      this.ackedStrangers = [];
    },

    async onConfirm(command) {
      this.loading = true;

      const list = this.ackedStrangers.map((item) => ({
        timestamp: item.timestamp,
        verify_uuid: item.verify_uuid,
      }));

      const {
        data: { message },
      } = await this.$globalAddCommand({ records: list, commands: command });

      this.loading = false;

      if (!message) return;

      // 已備註／確認過的紀錄後端不再回傳，前端同步移除
      list.forEach((item) => {
        const { verify_uuid: uuid } = item;

        const selectedIdx = this.selectedStrangers.indexOf(uuid);
        if (selectedIdx >= 0) this.selectedStrangers.splice(selectedIdx, 1);

        const idx = this.strangers.findIndex((d) => d.verify_uuid === uuid);
        if (idx >= 0) this.strangers.splice(idx, 1);
      });

      // 移除後總頁數可能變少，順便收回頁碼與殘留的勾選
      this.trimStrangers();

      this.showAckModal = false;
      this.ackedStrangers = [];
    },

    // ---------------- 卡片顯示 ----------------

    parseLine1(item) {
      switch (this.displaySettings.line1) {
        case 'NAME':
          return item.name;
        case 'PARTIALNAME':
          return item.name;
        case 'NONE':
        default:
          return '';
      }
    },

    parseLine2(item) {
      switch (this.displaySettings.line2) {
        case 'ID':
          return item.id;
        case 'DEPARTMENT':
          return item.department || '';
        case 'JOBTITLE':
          return item.title || '';
        case 'GROUP':
          return (item.group_list || []).filter((g) => g !== 'All Person' && g !== 'All Visitor')[0] || '';
        case 'NONE':
        default:
          return '';
      }
    },

    parseImage(item) {
      if (this.displaySettings.displayPhoto === 'NONE') return this.emptyFace;

      const image =
        this.displaySettings.displayPhoto === 'DISPLAY'
          ? item.display_image || item.register_image
          : item.register_image || item.display_image;

      return image || this.emptyFace;
    },

    toLoginPage() {
      this.$globalLogout();
      this.$router.push('/');
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
      const dashboard = document.querySelector('.dashboard');
      if (!dashboard) return;

      const { clientWidth: width, clientHeight: height } = dashboard;

      this.zoomRatio = Math.min(width / 1920, height / 1080);

      const padX = Math.floor((width - 1920 * this.zoomRatio) / 2);
      const padY = Math.floor((height - 1080 * this.zoomRatio) / 2);
      dashboard.style.padding = `${padY}px ${padX}px`;

      ['.current-date-time', '.dashboard-header', '.guard-divider', '.footer-box'].forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) element.style.setProperty('zoom', this.zoomRatio, 'important');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.group-card {
  transition: 0.5s ease-in-out;
}

.group-card.card-flip {
  transform: rotateX(360deg);
}

.slide-enter-active,
.slide-leave-active {
  transition: height 0.9s ease;
  // max-height: auto;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  height: 0;
}

// .slide-enter-to,
// .slide-leave-from {
//   opacity: 1;
//   max-height: 240px;
// }

.disabled {
  opacity: 0.5;
  cursor: unset !important;
  pointer-events: none !important;
}

.chart-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 8px 0 4px;
  border-radius: 4px;
  background: $guard-btn-bg;
  border: 1px solid #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);

  &:hover {
    background: $guard-btn-bg-hover;
  }
}

.grid-2-6 {
  display: grid !important;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 16px;
}

.grid-7-6 {
  display: grid !important;
  grid-template-rows: repeat(7, 1fr);
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 16px;
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
