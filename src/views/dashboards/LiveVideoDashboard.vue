<template>
  <div class="ratio-wrap ratio-wrap-16x9">
    <div class="ratio-content live-video-dashboard" :style="{ backgroundImage: `url('${settings.background_image}')` }">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="dashboard-header-left">
          <img
            v-if="settings.logo"
            :src="settings.logo"
            class="dashboard-logo"
            alt="Logo"
            @click="handleLogout"
            style="cursor: pointer"
          />
          <h2 class="dashboard-title">
            {{ settings.title || $t('LiveVideo') }}
          </h2>
        </div>
        <div class="dashboard-header-right">
          <div class="dashboard-time">
            <div class="time-date">
              {{ currentDate }}
            </div>
            <div class="time-clock">
              {{ currentTime }}
            </div>
          </div>
          <button class="settings-btn-header" @click="showSettingsModal = true">
            <CIcon name="cil-settings" height="24" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <!-- Left: Video Area (3/4) -->
        <div class="video-area">
          <div v-if="selectedCamera && rtspUrl" class="video-container">
            <div class="camera-name-overlay">
              {{ selectedCamera.name }}
            </div>
            <video ref="videoPlayer" class="video-player" autoplay muted playsinline @loadedmetadata="onVideoLoaded" />
            <!-- ROI 畫框圖層 -->
            <canvas ref="roiCanvas" class="roi-overlay" />
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
            </div>
            <div class="recognition-list">
              <div
                v-for="result in allEmployeeResults"
                :key="result._id"
                class="recognition-item"
                :class="getResultTypeClass(result)"
              >
                <div class="recognition-snapshot">
                  <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                </div>
                <div v-if="result.registered_photo" class="recognition-registered">
                  <img :src="`data:image/jpeg;base64,${result.registered_photo}`" alt="Registered" />
                </div>
                <div class="recognition-info">
                  <div class="recognition-name">
                    {{ getPersonName(result) }}
                  </div>
                  <div class="recognition-detail">
                    {{ getPersonDetail(result) }}
                  </div>
                  <div class="recognition-meta">
                    <span class="recognition-type">{{ getTypeLabel(result) }}</span>
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
              </div>
              <div class="recognition-list">
                <div
                  v-for="result in employeeResults"
                  :key="result._id"
                  class="recognition-item"
                  :class="getResultTypeClass(result)"
                >
                  <div class="recognition-snapshot">
                    <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                  </div>
                  <div v-if="result.registered_photo" class="recognition-registered">
                    <img :src="`data:image/jpeg;base64,${result.registered_photo}`" alt="Registered" />
                  </div>
                  <div class="recognition-info">
                    <div class="recognition-name">
                      {{ getPersonName(result) }}
                    </div>
                    <div class="recognition-detail">
                      {{ getPersonDetail(result) }}
                    </div>
                    <!-- <div class="recognition-meta">
                      <span class="recognition-type">{{ getTypeLabel(result) }}</span>
                    </div> -->
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
              </div>
              <div class="recognition-list">
                <div
                  v-for="result in otherResults"
                  :key="result._id"
                  class="recognition-item"
                  :class="getResultTypeClass(result)"
                >
                  <div class="recognition-snapshot">
                    <img :src="`data:image/jpeg;base64,${result.snapshot}`" alt="Snapshot" />
                  </div>
                  <div v-if="result.registered_photo" class="recognition-registered">
                    <img :src="`data:image/jpeg;base64,${result.registered_photo}`" alt="Registered" />
                  </div>
                  <div class="recognition-info">
                    <div class="recognition-name">
                      {{ getPersonName(result) }}
                    </div>
                    <div class="recognition-detail">
                      {{ getPersonDetail(result) }}
                    </div>
                    <!-- <div class="recognition-meta">
                      <span class="recognition-type">{{ getTypeLabel(result) }}</span>
                    </div> -->
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

      <!-- Footer -->
      <div class="dashboard-footer">
        <div />
        <div class="powered-by">Powered by <img src="/img/logo/logo.png" alt="aira" class="aira-logo" /></div>
      </div>

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
      currentDate: '',
      currentTime: '',
      settings: {
        background_image: backgroundImage,
        logo: airalogo,
        title: this.$t('LiveVideo'),
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
      peerConnection: null, // WebRTC 連接
      recognitionResults: [], // 所有辨識結果
      maxResults: 50, // 最多保留的結果數量
      isConfirmed: false, // 是否已確認設定
      photoCache: {}, // 快取註冊照片，避免重複 API 呼叫
    };
  },
  computed: {
    // 動態生成 WebRTC URL
    webrtcUrl() {
      const TEST_MODE = process.env.NODE_ENV === 'development';
      const HOST = TEST_MODE ? '192.168.14.32' : window.location.hostname;
      return `https://${HOST}/viewvideo/${this.selectedCameraUuid}/whep`;
    },
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
          // 只顯示員工 (type 1 且 person 1)
          return result.type === 1 && result.person === 1;
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
          // 只顯示員工 (type 1 且 person 1)
          return result.type === 1 && result.person === 1;
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
          // 訪客：type 1 且 person 0
          if (result.type === 1 && result.person === 0) {
            return showVisitors;
          }
          // 陌生人：type 0
          if (result.type === 0) {
            return showStrangers;
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

    // 監聽視窗大小變化，重新繪製 ROI
    window.addEventListener('resize', this.drawROI);
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

    // 移除視窗 resize 監聽
    window.removeEventListener('resize', this.drawROI);

    this.destroyVideoPlayer();
    this.unsubscribeWebSocket();
  },
  methods: {
    updateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      // 年月日
      this.currentDate = `${year}年${month}月${day}日`;
      // 時分秒
      this.currentTime = `${hours}:${minutes}:${seconds}`;
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

        // console.log('RTSP URL:', self.rtspUrl);
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
    async initVideoPlayer() {
      const self = this;

      if (!self.$refs.videoPlayer) {
        console.error('Video player element not found');
        return;
      }

      try {
        // console.log('Initializing WebRTC connection to:', self.webrtcUrl);

        // 1. 建立 RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        self.peerConnection = pc;

        // 2. 處理接收到的遠端串流
        pc.ontrack = (event) => {
          // console.log('Received remote track:', event.track.kind);
          if (self.$refs.videoPlayer) {
            self.$refs.videoPlayer.srcObject = event.streams[0];
          }
        };

        // 3. 監聽連線狀態
        pc.onconnectionstatechange = () => {
          // console.log('Connection state:', pc.connectionState);
          if (pc.connectionState === 'connected') {
            // console.log('WebRTC connection established');
          } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            console.error('WebRTC connection failed or disconnected');
            self.$fire({
              text: '影片連線失敗，請重試',
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
        };

        // 4. 添加 transceiver（接收模式）
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // 5. 建立 SDP offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 6. 透過 WHEP 協議發送 offer 到後端
        // console.log('Sending WHEP request to:', self.webrtcUrl);
        const response = await fetch(self.webrtcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp, // WHEP 協議直接傳送 SDP 字串
        });

        if (!response.ok) {
          throw new Error(`WHEP request failed: ${response.status} ${response.statusText}`);
        }

        // 7. 接收 SDP answer（WHEP 回傳純文字 SDP）
        const answerSdp = await response.text();
        // console.log('Received WHEP answer from backend');

        // 8. 設定遠端描述
        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answerSdp,
        });

        // console.log('WebRTC setup complete, waiting for stream...');
      } catch (error) {
        console.error('Failed to initialize video player:', error);
        self.$fire({
          text: `影片播放初始化失敗: ${error.message}`,
          type: 'error',
          timer: 5000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },
    destroyVideoPlayer() {
      const self = this;

      // 清理 WebRTC 連接
      if (self.peerConnection) {
        console.log('Closing WebRTC connection');
        self.peerConnection.close();
        self.peerConnection = null;
      }

      // 清理 video element
      if (self.$refs.videoPlayer) {
        self.$refs.videoPlayer.srcObject = null;
      }
    },
    onVideoLoaded() {
      const self = this;
      // 當影片載入後，繪製 ROI 框
      self.$nextTick(() => {
        self.drawROI();
      });
    },
    drawROI() {
      const self = this;
      const canvas = self.$refs.roiCanvas;
      const video = self.$refs.videoPlayer;

      if (!canvas || !video || !self.selectedCamera || !video.videoWidth || !video.videoHeight) {
        return;
      }

      // 設定 canvas 尺寸與容器相同
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 取得攝影機的 ROI 資料
      const roiList = self.selectedCamera.roi || [];

      // 計算影片在容器中的實際顯示尺寸和位置 (object-fit: contain)
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth;
      let displayHeight;
      let offsetX;
      let offsetY;

      if (containerAspect > videoAspect) {
        // 容器較寬，影片會垂直填滿，左右有黑邊
        displayHeight = containerHeight;
        displayWidth = displayHeight * videoAspect;
        offsetX = (containerWidth - displayWidth) / 2;
        offsetY = 0;
      } else {
        // 容器較高，影片會水平填滿，上下有黑邊
        displayWidth = containerWidth;
        displayHeight = displayWidth / videoAspect;
        offsetX = 0;
        offsetY = (containerHeight - displayHeight) / 2;
      }

      // ROI 座標是基於設定頁面的 1024px 寬度 canvas 儲存的
      // 需要先轉換到影片原始解析度，再縮放到顯示尺寸
      const ROI_CANVAS_WIDTH = 1024;
      const roiToVideoScale = video.videoWidth / ROI_CANVAS_WIDTH;

      // 計算從影片解析度到顯示尺寸的縮放比例
      const scaleX = displayWidth / video.videoWidth;
      const scaleY = displayHeight / video.videoHeight;

      // 繪製每個 ROI 框
      roiList.forEach((roi, index) => {
        if (roi.x !== undefined && roi.y !== undefined && roi.w && roi.h) {
          // 步驟1: ROI座標(基於1024px) -> 影片原始解析度
          const videoX = roi.x * roiToVideoScale;
          const videoY = roi.y * roiToVideoScale;
          const videoW = roi.w * roiToVideoScale;
          const videoH = roi.h * roiToVideoScale;

          // 步驟2: 影片原始解析度 -> 顯示尺寸，並加上偏移量
          const x = videoX * scaleX + offsetX;
          const y = videoY * scaleY + offsetY;
          const w = videoW * scaleX;
          const h = videoH * scaleY;

          // 設定框的樣式
          ctx.strokeStyle = '#00ff00'; // 綠色框
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // 繪製框的編號
          ctx.fillStyle = '#00ff00';
          ctx.font = '16px Arial';
          ctx.fillText(`ROI ${index + 1}`, x + 5, y + 20);
        }
      });
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

      // 如果有 person_id，取得註冊照片（員工、訪客、陌生人都需要）
      if (result.person_id) {
        // 檢查快取中是否已有此照片
        if (self.photoCache[result.person_id]) {
          // 使用快取的照片
          self.$set(result, 'registered_photo', self.photoCache[result.person_id]);
        } else {
          // 呼叫 API 取得照片
          self.$globalFetchPhoto(result.person_id, (err, data) => {
            if (!err && data) {
              // 優先使用 display_image，若為空則使用 register_image
              const photo = data.display_image || data.register_image;

              if (photo) {
                // 存入快取
                self.$set(self.photoCache, result.person_id, photo);
                // 設定到 result
                self.$set(result, 'registered_photo', photo);
              }
            }
          });
        }
      }

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
        // type 1 可能是員工或訪客
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
          const groupNames = result.person_info.group_list.map((g) => g.groupname).join(', ');
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
    getTypeLabel(result) {
      if (result.type === 0) {
        return this.$t('Stranger');
      }
      if (result.type === 1) {
        // 根據 person 判斷是員工還是訪客
        return result.person === 1 ? this.$t('Employee') : this.$t('Visitor');
      }
      return this.$t('Unknown');
    },
    getResultTypeClass(result) {
      if (result.type === 0) {
        return 'type-stranger';
      }
      if (result.type === 1) {
        // 根據 person 判斷是員工還是訪客
        return result.person === 1 ? 'type-employee' : 'type-visitor';
      }
      return '';
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
    handleLogout() {
      const self = this;

      // 清理資源
      self.destroyVideoPlayer();
      self.unsubscribeWebSocket();

      // 執行登出
      self.$globalLogout(() => {
        // 跳轉到登入頁
        self.$router.push({ name: 'Login' });
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

.dashboard-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dashboard-logo {
  height: 40px;
  object-fit: contain;
}

.dashboard-title {
  margin: 0;
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
}

.dashboard-header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dashboard-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #ffffff;
  line-height: 1.3;
}

.time-date {
  font-size: 16px;
  font-weight: 500;
}

.time-clock {
  font-size: 16px;
  font-weight: 500;
}

.settings-btn-header {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn-header:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.dashboard-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px 20px 0 20px;
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
  position: relative;
}

.camera-name-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  z-index: 10;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.roi-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
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

.recognition-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
  max-width: 100%;
  overflow: hidden;
}

.recognition-item.type-employee {
  background-color: rgba(77, 189, 116, 0.3);
  border-left-color: #4dbd74;
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
  transform: translateX(-5px);
}

.recognition-item.type-employee:hover {
  background-color: rgba(77, 189, 116, 0.4);
}

.recognition-item.type-stranger {
  border-left-color: #f86c6b;
  background-color: rgba(248, 108, 107, 0.3);
}

.recognition-item.type-stranger:hover {
  background-color: rgba(248, 108, 107, 0.4);
}

.recognition-item.type-visitor {
  border-left-color: #20a8d8;
  background-color: rgba(32, 168, 216, 0.3);
}

.recognition-item.type-visitor:hover {
  background-color: rgba(32, 168, 216, 0.4);
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

.recognition-registered {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  border: 2px solid transparent;
}

.recognition-item.type-employee .recognition-registered {
  border-color: #4dbd74;
}

.recognition-item.type-visitor .recognition-registered {
  border-color: #20a8d8;
}

.recognition-item.type-stranger .recognition-registered {
  border-color: #f86c6b;
}

.recognition-registered img {
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

.dashboard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.settings-btn {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent !important;
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
  box-shadow: none;
}

.settings-btn svg {
  width: 28px;
  height: 28px;
}

.settings-btn:hover {
  border-color: rgba(255, 255, 255, 0.8) !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
  transform: scale(1.05);
  transition: all 0.2s;
}

.powered-by {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

.aira-logo {
  height: 20px;
  vertical-align: middle;
}
</style>
