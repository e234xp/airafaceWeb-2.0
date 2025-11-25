<template>
  <div class="ratio-wrap ratio-wrap-16x9">
    <div class="ratio-content live-video-dashboard" :style="{ backgroundImage: `url('${settings.background_image}')` }">
      <!-- Header -->
      <div class="dashboard-header">
        <img v-if="settings.logo" :src="settings.logo" class="dashboard-logo" alt="Logo" />
        <div class="dashboard-time">
          <span>{{ currentDate }}</span>
          <span>{{ currentTime }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <!-- Left: Video Area (3/4) -->
        <div class="video-area">
          <div v-if="selectedCamera && rtspUrl" class="video-container">
            <video ref="videoPlayer" class="video-player" autoplay muted playsinline />
          </div>
          <div v-else class="no-camera-selected">
            <p>{{ $t('PleaseSelectCamera') }}</p>
          </div>
        </div>

        <!-- Right: Recognition Results (1/4) -->
        <div class="recognition-area" :class="{ 'single-section': isSingleSection }">
          <!-- 全部顯示員工（當兩個都沒勾選時） -->
          <div v-if="isSingleSection" class="recognition-section recognition-section-full">
            <div class="recognition-header">
              <h3>{{ $t('Employee') }}</h3>
              <span class="recognition-count">{{ allEmployeeResults.length }}</span>
            </div>
            <div class="recognition-list">
              <div
                v-for="result in allEmployeeResults"
                :key="result._id"
                class="recognition-item"
                :class="getResultTypeClass(result.type)"
              >
                <div class="recognition-snapshot">
                  <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                </div>
                <div class="recognition-info">
                  <div class="recognition-name">
                    {{ getPersonName(result) }}
                  </div>
                  <div class="recognition-detail">
                    {{ getPersonDetail(result) }}
                  </div>
                  <div class="recognition-meta">
                    <span class="recognition-type">{{ getTypeLabel(result.type) }}</span>
                  </div>
                  <div class="recognition-time">
                    {{ formatTime(result.timestamp) }}
                  </div>
                </div>
              </div>
              <div v-if="allEmployeeResults.length === 0" class="no-results">
                <p>{{ $t('NoRecognitionResults') }}</p>
              </div>
            </div>
          </div>

          <!-- 上下分割顯示（當有勾選訪客或陌生人時） -->
          <template v-else>
            <!-- Top Half: Employees -->
            <div class="recognition-section">
              <div class="recognition-header">
                <h3>{{ $t('Employee') }}</h3>
                <span class="recognition-count">{{ employeeResults.length }}</span>
              </div>
              <div class="recognition-list">
                <div
                  v-for="result in employeeResults"
                  :key="result._id"
                  class="recognition-item"
                  :class="getResultTypeClass(result.type)"
                >
                  <div class="recognition-snapshot">
                    <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                  </div>
                  <div class="recognition-info">
                    <div class="recognition-name">
                      {{ getPersonName(result) }}
                    </div>
                    <div class="recognition-detail">
                      {{ getPersonDetail(result) }}
                    </div>
                    <div class="recognition-meta">
                      <span class="recognition-type">{{ getTypeLabel(result.type) }}</span>
                    </div>
                    <div class="recognition-time">
                      {{ formatTime(result.timestamp) }}
                    </div>
                  </div>
                </div>
                <div v-if="employeeResults.length === 0" class="no-results">
                  <p>{{ $t('NoRecognitionResults') }}</p>
                </div>
              </div>
            </div>

            <!-- Bottom Half: Visitors & Strangers -->
            <div class="recognition-section">
              <div class="recognition-header">
                <h3>{{ otherResultsTitle }}</h3>
                <span class="recognition-count">{{ otherResults.length }}</span>
              </div>
              <div class="recognition-list">
                <div
                  v-for="result in otherResults"
                  :key="result._id"
                  class="recognition-item"
                  :class="getResultTypeClass(result.type)"
                >
                  <div class="recognition-snapshot">
                    <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                  </div>
                  <div class="recognition-info">
                    <div class="recognition-name">
                      {{ getPersonName(result) }}
                    </div>
                    <div class="recognition-detail">
                      {{ getPersonDetail(result) }}
                    </div>
                    <div class="recognition-meta">
                      <span class="recognition-type">{{ getTypeLabel(result.type) }}</span>
                    </div>
                    <div class="recognition-time">
                      {{ formatTime(result.timestamp) }}
                    </div>
                  </div>
                </div>
                <div v-if="otherResults.length === 0" class="no-results">
                  <p>{{ $t('NoRecognitionResults') }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Settings Button -->
      <CButton class="settings-btn" color="primary" @click="showSettingsModal = true">
        <CIcon name="cil-settings" />
      </CButton>

      <!-- Settings Modal -->
      <CModal :show.sync="showSettingsModal" :centered="true" :close-on-backdrop="false">
        <template #header>
          <h5>{{ $t('VideoSettings') }}</h5>
        </template>

        <CCard>
          <CCardBody>
            <!-- Camera Selection -->
            <CRow class="mb-3">
              <CCol sm="12">
                <label class="h5">{{ $t('Camera') }}</label>
                <CSelect
                  :value.sync="selectedCameraUuid"
                  :options="cameraOptions"
                  size="lg"
                  @update:value="onCameraChange"
                />
              </CCol>
            </CRow>

            <!-- Display Options -->
            <CRow class="mb-3">
              <CCol sm="12">
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <label class="h5 mb-0">{{ $t('ShowVisitors') }}</label>
                  <CSwitch color="success" :checked.sync="displayOptions.showVisitors" size="lg" />
                </div>
              </CCol>
              <CCol sm="12">
                <div class="d-flex align-items-center justify-content-between">
                  <label class="h5 mb-0">{{ $t('ShowStrangers') }}</label>
                  <CSwitch color="success" :checked.sync="displayOptions.showStrangers" size="lg" />
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <template #footer>
          <CButton color="secondary" @click="showSettingsModal = false">
            {{ $t('Cancel') }}
          </CButton>
          <CButton color="primary" @click="confirmSettings">
            {{ $t('Confirm') }}
          </CButton>
        </template>
      </CModal>
    </div>
  </div>
</template>

<script>
import { backgroundImage, airalogo } from '@/utils/occupancyMode';

export default {
  name: 'LiveVideoDashboard',
  data() {
    return {
      currentTime: '',
      currentDate: '',
      settings: {
        background_image: backgroundImage,
        logo: airalogo,
      },
      showSettingsModal: true, // 預設顯示 modal
      cameraList: [],
      cameraOptions: [],
      selectedCameraUuid: '',
      selectedCamera: null,
      rtspUrl: '',
      displayOptions: {
        showVisitors: true,
        showStrangers: true,
      },
      timeInterval: null,
      hls: null,
      recognitionResults: [], // 所有辨識結果
      maxResults: 50, // 最多保留的結果數量
      isConfirmed: false, // 是否已確認設定
    };
  },
  computed: {
    // 判斷是否為單一區域模式（兩個都沒勾選）
    isSingleSection() {
      return !this.displayOptions.showVisitors && !this.displayOptions.showStrangers;
    },
    // 全部員工資料（單一區域模式）
    allEmployeeResults() {
      const self = this;
      if (!self.selectedCameraUuid || !self.isConfirmed) {
        return [];
      }

      return self.recognitionResults
        .filter((result) => {
          // 篩選該攝影機的結果
          if (result.source_id !== self.selectedCameraUuid) {
            return false;
          }
          // 只顯示員工 (type 1)
          return result.type === 1;
        })
        .slice(0, 50); // 整個區域最多 50 筆
    },
    // 上半部：員工資料
    employeeResults() {
      const self = this;
      if (!self.selectedCameraUuid || !self.isConfirmed) {
        return [];
      }

      return self.recognitionResults
        .filter((result) => {
          // 篩選該攝影機的結果
          if (result.source_id !== self.selectedCameraUuid) {
            return false;
          }
          // 只顯示員工 (type 1)
          return result.type === 1;
        })
        .slice(0, 25); // 限制上半部最多 25 筆
    },
    // 下半部：訪客及陌生人
    otherResults() {
      const self = this;
      if (!self.selectedCameraUuid || !self.isConfirmed) {
        return [];
      }

      // 判斷顯示邏輯
      const { showVisitors } = self.displayOptions;
      const { showStrangers } = self.displayOptions;

      return self.recognitionResults
        .filter((result) => {
          // 篩選該攝影機的結果
          if (result.source_id !== self.selectedCameraUuid) {
            return false;
          }

          // 根據勾選狀態篩選
          if (result.type === 2) {
            return showVisitors; // 訪客
          }
          if (result.type === 0) {
            return showStrangers; // 陌生人
          }

          return false;
        })
        .slice(0, 25); // 限制下半部最多 25 筆
    },
    // 下半部標題
    otherResultsTitle() {
      const self = this;
      const { showVisitors } = self.displayOptions;
      const { showStrangers } = self.displayOptions;

      // 如果兩個都沒勾選，顯示員工
      if (!showVisitors && !showStrangers) {
        return self.$t('Employee');
      }

      // 如果都有勾選
      if (showVisitors && showStrangers) {
        return self.$t('VisitorsAndStrangers');
      }

      // 只勾選其中一個
      if (showVisitors) {
        return self.$t('Visitor');
      }
      if (showStrangers) {
        return self.$t('Stranger');
      }

      return '';
    },
  },
  mounted() {
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
    this.loadSettings();
    this.loadCameraList();
    this.initViews();
    this.subscribeWebSocket();
  },
  beforeDestroy() {
    const self = this;

    // 清除樣式
    const mainElement = document.querySelector('.c-main');
    const headerElement = document.querySelector('.c-header');
    const footerElement = document.querySelector('.c-footer');
    const containerElement = document.querySelector('.container-fluid');

    if (mainElement) mainElement.classList.remove('c-main-reset');
    if (headerElement) headerElement.classList.remove('c-header-reset');
    if (footerElement) footerElement.classList.remove('c-footer-reset');
    if (containerElement) containerElement.classList.remove('container-fluid-reset');

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    this.destroyVideoPlayer();
    this.unsubscribeWebSocket();
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      this.currentDate = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    },
    loadSettings() {
      const self = this;
      self.$globalGetDisplaySetting((err, data) => {
        if (!err && data && data.LIVEVIDEO) {
          self.settings = { ...self.settings, ...data.LIVEVIDEO };
        }
      });
    },
    async loadCameraList() {
      const self = this;
      self.$globalFindCameras('', 0, 1000, (err, data) => {
        if (!err && data && data.list) {
          self.cameraList = data.list;

          // 組成選項列表
          self.cameraOptions = [
            { value: '', label: self.$t('PleaseSelect') },
            ...data.list.map((camera) => ({
              value: camera.uuid,
              label: camera.name,
            })),
          ];

          // 如果之前有選過攝影機，自動載入
          const savedCamera = sessionStorage.getItem('selectedCameraUuid');
          if (savedCamera) {
            self.selectedCameraUuid = savedCamera;
            self.onCameraChange(savedCamera);
          }
        }
      });
    },
    onCameraChange(uuid) {
      const self = this;
      if (!uuid) {
        self.selectedCamera = null;
        self.rtspUrl = '';
        return;
      }

      // 找到選中的攝影機
      self.selectedCamera = self.cameraList.find((cam) => cam.uuid === uuid);

      if (self.selectedCamera) {
        // 組成 RTSP URL
        const { user, pass, ip_address, port, connection_info } = self.selectedCamera;
        self.rtspUrl = `rtsp://${user}:${pass}@${ip_address}:${port}${connection_info}`;

        console.log('RTSP URL:', self.rtspUrl);
      }
    },
    confirmSettings() {
      const self = this;

      if (!self.selectedCameraUuid) {
        self.$fire({
          text: self.$t('PleaseSelectCamera'),
          type: 'warning',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
        return;
      }

      // 儲存選擇
      sessionStorage.setItem('selectedCameraUuid', self.selectedCameraUuid);
      sessionStorage.setItem('displayOptions', JSON.stringify(self.displayOptions));

      // 設定為已確認，開始顯示資料
      self.isConfirmed = true;

      // 關閉 modal
      self.showSettingsModal = false;

      // 初始化視訊播放
      self.$nextTick(() => {
        self.initVideoPlayer();
      });
    },
    initVideoPlayer() {
      const self = this;

      if (!self.rtspUrl || !self.$refs.videoPlayer) {
        return;
      }

      // 注意：瀏覽器無法直接播放 RTSP
      // 需要後端將 RTSP 轉換為 HLS 或 WebRTC
      // 這裡提供一個基本框架，實際需要配合後端實作

      console.log('Initializing video player with URL:', self.rtspUrl);

      // 方案 1: 如果後端提供 HLS 轉換
      // 使用 hls.js 播放 HLS 串流
      // if (Hls.isSupported()) {
      //   self.hls = new Hls();
      //   self.hls.loadSource(hlsUrl);
      //   self.hls.attachMedia(self.$refs.videoPlayer);
      // }

      // 方案 2: 如果使用 WebRTC
      // 需要搭配 WebRTC 服務器 (如 Janus, Kurento)

      // 暫時顯示提示訊息
      self.$fire({
        text: self.$t('VideoStreamInitializing'),
        type: 'info',
        timer: 3000,
        confirmButtonColor: '#20a8d8',
      });
    },
    destroyVideoPlayer() {
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
    },
    initViews() {
      const self = this;
      const mainElement = document.querySelector('.c-main');
      const headerElement = document.querySelector('.c-header');
      const footerElement = document.querySelector('.c-footer');
      const containerElement = document.querySelector('.container-fluid');

      // 把 coreUI 套件的一些預設元件的樣式清除掉
      if (mainElement) mainElement.classList.add('c-main-reset');
      if (headerElement) headerElement.classList.add('c-header-reset');
      if (footerElement) footerElement.classList.add('c-footer-reset');
      if (containerElement) containerElement.classList.add('container-fluid-reset');

      // setTimeout(() => {
      //   self.zoomViews();
      // }, 168);

      // window.addEventListener('resize', () => self.zoomViews());
    },
    zoomViews() {
      const self = this;
      const dashboards = document.querySelectorAll('.live-video-dashboard');
      if (dashboards) {
        for (let i = 0; i < dashboards.length; i += 1) {
          const dashboard = dashboards[i];

          const width = dashboard.clientWidth;
          const height = dashboard.clientHeight;

          const rW = width / 1920;
          const rH = height / 1080;
          const zoomRatio = Math.min(rW, rH);

          const dW = width - 1920 * zoomRatio;
          const dH = height - 1080 * zoomRatio;

          dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
          dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;
        }
      }
    },
    subscribeWebSocket() {
      const self = this;
      // 訂閱 WebSocket 辨識結果
      self.$store.subscribe((mutation) => {
        if (mutation.type === 'changeNotifications') {
          self.handleVerifyResult(mutation.payload);
        }
      });
    },
    unsubscribeWebSocket() {
      // WebSocket 連線由全域管理，這裡不需要特別處理
    },
    handleVerifyResult(result) {
      const self = this;

      // 加入新的辨識結果到列表開頭
      self.recognitionResults.unshift(result);

      // 限制結果數量
      if (self.recognitionResults.length > self.maxResults) {
        self.recognitionResults = self.recognitionResults.slice(0, self.maxResults);
      }
    },
    getPersonName(result) {
      if (result.type === 0) {
        // 陌生人
        return this.$t('Stranger');
      }
      if (result.type === 1) {
        // 員工 - 顯示 fullname
        if (result.person_info && result.person_info.fullname) {
          return result.person_info.fullname;
        }
      }
      if (result.person && result.person.name) {
        return result.person.name;
      }
      return this.$t('Unknown');
    },
    getPersonDetail(result) {
      if (result.type === 0) {
        // 陌生人沒有詳細資訊
        return '';
      }
      if (result.type === 1 && result.person_info) {
        // 員工 - 顯示 groupname
        const details = [];
        if (result.person_info.group_list && result.person_info.group_list.length > 0) {
          const groupNames = result.person_info.group_list.map(g => g.groupname).join(', ');
          details.push(groupNames);
        }
        return details.join(' | ');
      }
      if (result.person) {
        const details = [];
        if (result.person.id) details.push(result.person.id);
        if (result.person.department) details.push(result.person.department);
        if (result.person.jobtitle) details.push(result.person.jobtitle);
        return details.join(' | ');
      }
      return '';
    },
    getTypeLabel(type) {
      switch (type) {
        case 0:
          return this.$t('Stranger');
        case 1:
          return this.$t('Employee');
        case 2:
          return this.$t('Visitor');
        default:
          return this.$t('Unknown');
      }
    },
    getResultTypeClass(type) {
      switch (type) {
        case 0:
          return 'type-stranger';
        case 1:
          return 'type-employee';
        case 2:
          return 'type-visitor';
        default:
          return '';
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },
  },
};
</script>

<style scoped>
.live-video-dashboard {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.dashboard-logo {
  height: 40px;
  object-fit: contain;
}

.dashboard-time {
  display: flex;
  gap: 20px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
}

.dashboard-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px 20px;
  position: relative;
  overflow: hidden;
}

/* Video Area (3/4) */
.video-area {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 10px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-camera-selected {
  text-align: center;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 60px 80px;
  border-radius: 10px;
}

.no-camera-selected p {
  font-size: 24px;
  margin: 0;
}

/* Recognition Area (1/4) */
.recognition-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.recognition-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  overflow: hidden;
}

.recognition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(32, 168, 216, 0.3);
  border-bottom: 2px solid #20a8d8;
}

.recognition-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
}

.recognition-count {
  background-color: #20a8d8;
  color: #ffffff;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.recognition-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.recognition-list::-webkit-scrollbar {
  width: 8px;
}

.recognition-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.recognition-list::-webkit-scrollbar-thumb {
  background: rgba(32, 168, 216, 0.5);
  border-radius: 10px;
}

.recognition-list::-webkit-scrollbar-thumb:hover {
  background: rgba(32, 168, 216, 0.8);
}

.recognition-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.recognition-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(-5px);
}

.recognition-item.type-stranger {
  border-left-color: #f86c6b;
}

.recognition-item.type-employee {
  border-left-color: #4dbd74;
}

.recognition-item.type-visitor {
  border-left-color: #ffc107;
}

.recognition-snapshot {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}

.recognition-snapshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recognition-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.recognition-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recognition-detail {
  font-size: 12px;
  color: #b8c7ce;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recognition-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.recognition-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}

.type-stranger .recognition-type {
  background-color: #f86c6b;
}

.type-employee .recognition-type {
  background-color: #4dbd74;
}

.type-visitor .recognition-type {
  background-color: #ffc107;
  color: #333;
}

.recognition-score {
  font-size: 12px;
  color: #b8c7ce;
  font-weight: 500;
}

.recognition-time {
  font-size: 11px;
  color: #73818f;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #73818f;
}

.no-results p {
  margin: 0;
  font-size: 16px;
}

.settings-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.settings-btn:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>
