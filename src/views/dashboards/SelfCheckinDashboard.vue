<template>
  <div class="ratio-wrap ratio-wrap-16x9">
    <div
      class="ratio-content selfcheckin-dashboard"
      style="position: absolute; z-index: 50"
      :style="{ backgroundImage: 'url(' + backgroud + ')', backgroundSize: 'cover', backgroundPosition: 'center' }"
    >
      <div
        class="header-container"
        :style="{ zoom: `${zoomRatio}` }"
      >
        <div
          class="logo"
          @click="toLoginPage"
          v-if="display.logo !== ''"
        >
          <img
            :src="display.logo"
            style="width: 100%; height: 100%; object-fit: contain"
          >
        </div>
        <div class="time">
          {{ currentTime }}
        </div>
      </div>
      <template v-if="currentStep === 1">
        <div
          class="section-step-1"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <div class="step1-welcome-title">
            {{ $t('Welcome') }}
          </div>
          <div class="step1-subtitle">
            {{ $t('PleaseHaveYourQRCodeToRegister') }}
          </div>
          <div
            class="qrcode-container"
            @click="switchCamera"
            :title="$t('ClickToSwitchCamera')"
          >
            <QrcodeStream
              @decode="onDecode"
              :camera="selectedCamera"
              class="qrcodeReader mirror"
              v-if="freshReader"
            />
            <div
              class="err-msg"
              v-else
            >
              {{ errMsg }}
            </div>
            <!-- 綠框 -->
            <div class="qr-corner qr-corner-top-left" />
            <div class="qr-corner qr-corner-top-right" />
            <div class="qr-corner qr-corner-bottom-left" />
            <div class="qr-corner qr-corner-bottom-right" />
          </div>
        </div>
      </template>
      <template v-if="currentStep === 2">
        <div
          class="section-step-2"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <div class="step2-title">
            {{ $t('PleaseLookAtTheCamera') }}
          </div>
          <div class="step2-webcam-container">
            <WebCam
              ref="webcam"
              :device-id="selectedDeviceId"
              @cameras="onCameras"
              @started="onStart"
              @click="switchCamera"
              class="mirror step2-webcam"
            />
          </div>
          <div
            class="step2-take-photo-btn gradient-btn"
            :class="{ 'btn-busy': isDetecting }"
            @click="onTakePhoto"
          >
            {{ $t('TakeThePhoto') }}
          </div>
        </div>
      </template>
      <template v-if="currentStep === 3">
        <div
          class="section-step-3-new"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <div class="welcome-title">
            {{ $t('Welcome') }}
          </div>
          <div class="content-wrapper">
            <div class="left-section">
              <div class="video-container">
                <video
                  ref="videoPreview"
                  autoplay
                  playsinline
                  class="mirror"
                />
              </div>
              <div
                class="retake-btn"
                :class="{ 'btn-busy': isDetecting }"
                @click="onReTake"
              >
                {{ $t('ReTakePhoto') }}
              </div>
            </div>
            <div class="center-section">
              <div class="divider-arrow">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                :src="imageList[0]"
                class="mirror photo-preview"
                v-if="imageList[0] && imageList[0] !== ''"
              >
            </div>
            <div class="right-section">
              <div class="visitor-info">
                <div
                  class="department"
                  v-if="visitor.extra_info"
                >
                  {{ visitor.extra_info.department }}
                </div>
                <div class="name">
                  {{ visitor.name }}
                </div>
              </div>
            </div>
          </div>
          <div
            class="next-btn gradient-btn"
            :class="{ 'btn-busy': isSubmitting }"
            @click="onNext"
          >
            {{ $t('Next') }}
          </div>
        </div>
      </template>
      <template v-if="currentStep === 4">
        <div
          class="section-step-4-new"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <div class="welcome-title">
            {{ $t('Welcome') }}
          </div>
          <div class="content-wrapper-step4">
            <div class="left-section-step4" />
            <div class="center-section-step4">
              <img
                :src="imageList[0]"
                class="mirror photo-preview"
                v-if="imageList[0] && imageList[0] !== ''"
              >
            </div>
            <div class="right-section-step4">
              <div class="visitor-info">
                <div class="department">
                  {{ visitor.extra_info ? visitor.extra_info.department : '' }}
                </div>
                <div class="name">
                  {{ visitor.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="back-btn-step4 gradient-btn"
          @click="onBack"
          v-if="currentStep === 4"
        >
          {{ $t('Back') }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';
import { WebCam } from 'vue-web-cam';
import Axios from 'axios';
import * as faceapi from 'face-api.js';
import i18n from '@/i18n';

// airaTracker 相簿上傳設定
// 由 .env.local 提供，未設定 URL 時整個上傳功能自動停用
const TRACKER_UPLOAD_URL = process.env.VUE_APP_TRACKER_UPLOAD_URL || '';
const TRACKER_SESSION_ID = process.env.VUE_APP_TRACKER_SESSION_ID || '';
const TRACKER_ALBUM_ID = process.env.VUE_APP_TRACKER_ALBUM_ID || '';
const TRACKER_UPLOAD_TIMEOUT = 10000;

export default {
  name: 'SelfCheckinDashboard',
  components: {
    QrcodeStream,
    WebCam,
  },
  data() {
    return {
      display: {},
      currentStep: 1,
      cameraList: [],
      selectedCamera: 'auto',
      selectedDeviceId: '',
      visitor: {},
      paddingX: 0,
      imageList: [],
      cdCount: 10,
      cdTimer: null,
      zoomRatio: 0,
      freshReader: true,
      errMsg: '',
      currentTime: '',
      timeInterval: null,
      faceModelReady: null,
      isDetecting: false,
      isSubmitting: false,
    };
  },
  computed: {
    backgroud() {
      if (this.currentStep === 1) return this.display.step1Background;
      if (this.currentStep === 2) return this.display.step2Background;
      if (this.currentStep === 3) return this.display.step3Background;
      if (this.currentStep === 4) return this.display.step1Background;
      return '';
    },
  },
  watch: {
    selectedCamera() {
      this.onRefresh();
    },
  },
  methods: {
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}`;
    },
    switchCamera() {
      this.selectedCamera = this.selectedCamera === 'front' ? 'auto' : 'front';
    },
    initViews() {
      const mainElement = document.querySelector('.c-main');
      const headerElement = document.querySelector('.c-header');
      const footerElement = document.querySelector('.c-footer');
      const containerElement = document.querySelector('.container-fluid');

      // 把 coreUI 套件的一些預設元件的樣式清除掉
      if (mainElement) mainElement.classList.add('c-main-reset');
      if (headerElement) headerElement.classList.add('c-header-reset');
      if (footerElement) footerElement.classList.add('c-footer-reset');
      if (containerElement) containerElement.classList.add('container-fluid-reset');

      setTimeout(() => {
        this.zoomViews();
      }, 168);

      window.addEventListener('resize', () => this.zoomViews());
    },
    zoomViews() {
      const dashboards = document.querySelectorAll('.selfcheckin-dashboard');
      if (dashboards) {
        for (let i = 0; i < dashboards.length; i += 1) {
          const dashboard = dashboards[i];

          const width = dashboard.clientWidth;
          const height = dashboard.clientHeight;

          const rW = width / 1920;
          const rH = height / 1080;
          this.zoomRatio = Math.min(rW, rH);

          const dW = width - 1920 * this.zoomRatio;
          const dH = height - 1080 * this.zoomRatio;

          dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
          dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;

          this.paddingX = dW;
        }
      }
    },
    async onCameras() {
      const idx = this.cameraList.findIndex(
        (item) => item.label.toLowerCase().indexOf('front') >= 0 || item.label.toLowerCase().indexOf('face') >= 0,
      );
      this.selectedDeviceId = this.cameraList[idx < 0 ? this.cameraList.length - 1 : idx].value;
    },
    onStart() {
      this.startTimer(500);
    },
    async startTimer(t) {
      setTimeout(() => {
        try {
          const image = this.$refs.webcam.capture();
          if (image) this.imageList.push(image);
        } catch (e) {
          console.error('startTimer error:', e);
        }
      }, t || 500);
    },
    async onDecode(decode) {
      let isErr = true;

      try {
        // QR code 內容不一定是本系統的 JSON，解析失敗要能繼續掃描
        const { uuid } = JSON.parse(decode);
        if (uuid) {
          const { data } = await this.$globalFindVisitor(uuid, 0, 20);
          if (data.message === 'ok') {
            const [item] = data.visitor_list;
            this.visitor = item;
            // if (this.visitor.card_number === '') {
            //   this.$message.error(i18n.formatter.format('NoCardMsg'));
            // }
            if (this.visitor.expire_date !== 0 && this.visitor.expire_date < Date.now()) {
              this.$message.error(i18n.formatter.format('QRcodeExpiredMsg'));
            } else if (this.visitor.begin_date !== 0 && this.visitor.begin_date > Date.now()) {
              this.$message.error(i18n.formatter.format('QRcodeExpiredMsg'));
            } else {
              this.currentStep = 2;
              isErr = false;
            }
          } else {
            this.$message.error(i18n.formatter.format('NoInfoMsg'));
          }
        } else {
          this.$message.error(i18n.formatter.format('NoInfoMsg'));
        }
      } catch (e) {
        console.error('QR code 解析失敗:', e);
        this.$message.error(i18n.formatter.format('NoInfoMsg'));
      }

      if (isErr) this.onRefresh();
    },
    onRefresh() {
      this.freshReader = false;
      setTimeout(() => {
        this.freshReader = true;
        this.errMsg = '';
      }, 2000);
    },
    loadImage(dataUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image decode failed'));
        img.src = dataUrl;
      });
    },
    // 取中央正方形，與畫面上 object-fit: cover 的預覽構圖一致
    // source 可以是 <img> 或 <video>
    drawCenteredSquare(source, sourceWidth, sourceHeight) {
      const size = Math.min(sourceWidth, sourceHeight);
      const sx = (sourceWidth - size) / 2;
      const sy = (sourceHeight - size) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(source, sx, sy, size, size, 0, 0, size, size);

      return canvas.toDataURL('image/jpeg');
    },
    async cropToSquare(dataUrl) {
      const img = await this.loadImage(dataUrl);
      return this.drawCenteredSquare(img, img.naturalWidth, img.naturalHeight);
    },
    // 檢查照片中是否恰好有一張人臉，通過才回傳 true
    async validatePhoto(dataUrl) {
      try {
        await this.faceModelReady;

        const img = await this.loadImage(dataUrl);
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }),
        );

        if (detections.length === 0) {
          this.$message.error(i18n.formatter.format('NoFaceDetectedMsg'));
          return false;
        }

        if (detections.length > 1) {
          this.$message.error(i18n.formatter.format('MultipleFacesMsg'));
          return false;
        }

        return true;
      } catch (e) {
        console.error('人臉偵測失敗:', e);
        this.$message.error(i18n.formatter.format('FaceDetectFailedMsg'));
        return false;
      }
    },
    applyPhoto(image) {
      this.imageList = [image];
      this.visitor.register_image = image.replaceAll('data:image/jpeg;base64,', '');
      this.visitor.display_image = image.replaceAll('data:image/jpeg;base64,', '');
    },
    async onReTake() {
      if (this.isDetecting) return;

      try {
        const image = this.captureFromVideo();
        if (!image) return;

        this.isDetecting = true;
        if (!(await this.validatePhoto(image))) return;

        this.applyPhoto(image);
      } catch (e) {
        console.error('重新拍照失敗:', e);
      } finally {
        this.isDetecting = false;
      }
    },
    async onTakePhoto() {
      if (this.isDetecting) return;

      try {
        const raw = this.$refs.webcam.capture();
        if (!raw) return;

        this.isDetecting = true;

        // 先裁成正方形，讓人臉偵測與後續儲存都與預覽構圖一致
        const image = await this.cropToSquare(raw);
        if (!(await this.validatePhoto(image))) return;

        this.applyPhoto(image);
        this.currentStep = 3;
        // 在 Step 3 啟動 video 預覽
        await this.$nextTick();
        this.startVideoPreview();
      } catch (e) {
        console.error('拍照失敗:', e);
      } finally {
        this.isDetecting = false;
      }
    },
    async startVideoPreview() {
      try {
        // 如果有 selectedDeviceId 就使用，否則使用預設的前置鏡頭
        const constraints = {
          video: this.selectedDeviceId ? { deviceId: { exact: this.selectedDeviceId } } : { facingMode: 'user' },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (this.$refs.videoPreview) {
          this.$refs.videoPreview.srcObject = stream;
        }
      } catch (e) {
        console.error('無法啟動攝影機預覽:', e);
        // 如果指定的攝影機失敗，嘗試使用任何可用的攝影機
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (this.$refs.videoPreview) {
            this.$refs.videoPreview.srcObject = stream;
          }
        } catch (e2) {
          console.error('完全無法啟動攝影機:', e2);
        }
      }
    },
    captureFromVideo() {
      const video = this.$refs.videoPreview;
      if (!video || !video.videoWidth || !video.videoHeight) return null;

      // 不翻轉，直接捕捉中央正方形
      return this.drawCenteredSquare(video, video.videoWidth, video.videoHeight);
    },
    async uploadPhotoToTracker(faceImage) {
      // 未設定 VUE_APP_TRACKER_UPLOAD_URL 即不啟用相簿上傳
      if (!TRACKER_UPLOAD_URL || !faceImage) return;

      try {
        await Axios.post(
          TRACKER_UPLOAD_URL,
          {
            albumId: TRACKER_ALBUM_ID,
            face_image: faceImage,
          },
          {
            headers: { sessionId: TRACKER_SESSION_ID },
            timeout: TRACKER_UPLOAD_TIMEOUT,
          },
        );
      } catch (e) {
        // 相簿上傳失敗不中斷訪客報到流程
        console.error('上傳照片至 airaTracker 失敗:', e);
      }
    },
    onNext() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      this.stopVideoPreview();

      this.$globalModifyVisitor({ uuid: this.visitor.uuid, data: this.visitor }, async (error, result) => {
        if (!error && result && result.message === 'ok') {
          // 傳含 data URI 前綴的原始照片（imageList[0] 即畫面上顯示的那張）
          await this.uploadPhotoToTracker(this.imageList[0]);
          this.isSubmitting = false;
          this.currentStep = 4;
          this.onCountDown();
        } else {
          console.error('訪客報到失敗:', error);
          this.isSubmitting = false;
          this.$message.error(i18n.formatter.format('CheckinFailedMsg'));
          // 失敗時留在確認頁，重新啟動預覽讓使用者可以重拍或再送出一次
          this.startVideoPreview();
        }
      });
    },
    stopVideoPreview() {
      if (this.$refs.videoPreview && this.$refs.videoPreview.srcObject) {
        const tracks = this.$refs.videoPreview.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        this.$refs.videoPreview.srcObject = null;
      }
    },
    onCountDown() {
      this.cdCount = 10;
      this.cdTimer = setInterval(() => {
        if (this.cdCount <= 0 && this.currentStep === 4) {
          this.onBack();
        }
        this.cdCount -= 1;
      }, 1000);
    },
    onBack() {
      clearInterval(this.cdTimer);
      this.imageList = [];
      this.imageList.length = 0;
      this.selectedDeviceId = '';
      this.currentStep = 1;
    },
    toLoginPage() {
      this.$globalLogout();
      this.$router.push('/');
    },
  },
  async created() {
    await this.$globalGetDisplaySetting((err, data) => {
      if (data.SELFCHECKIN) this.display = data.SELFCHECKIN;
    });
    try {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            if (device.kind === 'videoinput' && device.label.indexOf('IR') <= -1) {
              this.cameraList.push({ value: device.deviceId, label: device.label });
            }
          });
          this.selectedCamera = 'front';
        })
        .catch((err) => {
          console.log(`${err.name}: ${err.message}`);
        });
    } catch (e) {
      console.error('Camera enumeration error:', e);
    }
  },
  async mounted() {
    this.initViews();
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);

    // 先開始載入人臉偵測模型，拍照時再 await 這個 promise
    this.faceModelReady = faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  },
  beforeDestroy() {
    clearInterval(this.cdTimer);
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    const mainElement = document.querySelector('.c-main');
    const headerElement = document.querySelector('.c-header');
    const footerElement = document.querySelector('.c-footer');
    const containerElement = document.querySelector('.container-fluid');

    if (mainElement) mainElement.classList.remove('c-main-reset');
    if (headerElement) headerElement.classList.remove('c-header-reset');
    if (footerElement) footerElement.classList.remove('c-footer-reset');
    if (containerElement) containerElement.classList.remove('container-fluid-reset');
  },
};
</script>

<style lang="scss" scoped>
// 人臉偵測或送出進行中：擋掉重複點擊
.btn-busy {
  opacity: 0.5;
  pointer-events: none;
}

// Common gradient button style
.gradient-btn {
  padding: 15px 60px;
  background: linear-gradient(135deg, #76bbff 0%, #f466d2 100%);
  border-radius: 40px;
  font-family: 'Noto Sans';
  color: white;
  font-size: 32px;
  font-weight: 700;
  cursor: pointer;
  border: 4px solid white;
  text-align: center;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  width: 100%;
}

.logo {
  width: 360px;
  height: auto;
  cursor: pointer;
}

.time {
  font-family: 'Noto Sans';
  color: white;
  font-size: 4rem;
  font-weight: 400;
}

.section-step-1 {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translate(-50%, 0);

  .step1-welcome-title {
    font-family: 'Noto Sans';
    color: white;
    font-size: 88px;
    font-weight: 300;
    font-style: italic;
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 0px 0px 12px #ff00b0, 0px 0px 6px #47eaff;
  }

  .step1-subtitle {
    font-family: 'Noto Sans';
    color: white;
    font-size: 48px;
    font-weight: 300;
    text-align: center;
    font-style: italic;
    margin-bottom: 3rem;
    text-shadow: 0px 0px 12px #ff00b0, 0px 0px 6px #47eaff;
  }

  .qrcode-container {
    position: relative;
    width: 320px;
    height: 320px;
    margin: 0 auto;
    cursor: pointer;

    .qr-corner {
      position: absolute;
      width: 80px;
      height: 80px;
      pointer-events: none;

      &.qr-corner-top-left {
        top: -4px;
        left: -4px;
        border-top: 8px solid #00ff00;
        border-left: 8px solid #00ff00;
      }

      &.qr-corner-top-right {
        top: -4px;
        right: -4px;
        border-top: 8px solid #00ff00;
        border-right: 8px solid #00ff00;
      }

      &.qr-corner-bottom-left {
        bottom: -4px;
        left: -4px;
        border-bottom: 8px solid #00ff00;
        border-left: 8px solid #00ff00;
      }

      &.qr-corner-bottom-right {
        bottom: -4px;
        right: -4px;
        border-bottom: 8px solid #00ff00;
        border-right: 8px solid #00ff00;
      }
    }
  }
}

.mirror {
  transform: scaleX(-1);
}

.qrcodeReader {
  width: 100%;
  height: 100%;
}

.err-msg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-step-2 {
  position: absolute;
  left: 50%;
  top: 30%;
  height: 540px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  gap: 2rem;
  transform: translate(-50%, 0);

  .step2-title {
    font-family: 'Noto Sans';
    color: white;
    font-size: 64px;
    font-weight: 300;
    text-align: center;
    font-style: italic;
    margin-bottom: 2rem;
    text-shadow: 0px 0px 12px #ff00b0, 0px 0px 6px #47eaff;
  }

  .step2-webcam-container {
    position: relative;
    width: 320px;
    height: 320px;
    margin: 0 auto 3rem;

    .step2-webcam {
      width: 320px;
      height: 320px;
      border-radius: 12px;
      object-fit: cover;
    }
  }

  .step2-take-photo-btn {
    padding: 20px 60px;
    margin: 0 auto;
    display: inline-block;
  }

  .info {
    width: 90%;
    background: #e2e2e2;
    border-radius: 1rem;
    color: #323232;
    font-size: 3rem;
    display: flex;
    justify-content: space-around;

    > div {
      display: flex;
      gap: 1rem;
      align-items: center;

      > div:first-child {
        font-size: 1.5rem;
      }
    }
  }

  .webcam-list {
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .webcam {
      width: 22rem;
      height: 16rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .btn {
      padding: 8px 16px;
      width: 10.25rem;
      height: 4.1875rem;
      font-size: 2rem;
      border-radius: 0.375rem;
      color: rgba(255, 255, 255, 0.8);

      &.type-1 {
        background-color: #ffa114;
      }

      &.type-2 {
        background-color: #30bf36;
      }
    }
  }
}

.section-step-3-new {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .welcome-title {
    color: white;
    font-size: 88px;
    font-weight: 300;
    font-style: italic;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 0px 0px 12px #ff00b0, 0px 0px 6px #47eaff;
  }

  .content-wrapper {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .video-container {
      position: relative;
      width: 320px;
      height: 330px;
      background: #9c8a9b;
      overflow: hidden;

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .retake-btn {
      width: 320px;
      padding: 15px 0;
      background: transparent;
      border-radius: 40px;
      font-family: 'Noto Sans';
      color: white;
      font-size: 24px;
      font-weight: 700;
      cursor: pointer;
      border: 3px solid white;
      margin-top: 1.5rem;
      text-align: center;
    }
  }

  .center-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    border-left: 2px solid white;

    &::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background: black;
      border-radius: 50%;
      z-index: 2;
    }

    &::after {
      content: '';
      position: absolute;
      left: -1px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 50px;
      background: transparent;
      z-index: 3;
    }

    .divider-arrow {
      position: absolute;
      left: -26px;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
    }

    .photo-preview {
      width: 400px;
      height: 400px;
      border-radius: 24px;
      object-fit: cover;
    }
  }

  .next-btn {
    width: 400px;
    margin-top: 2rem;
  }

  .right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    align-self: center;

    .visitor-info {
      color: white;

      .department {
        font-size: 32px;
        font-weight: 300;
        margin-bottom: 0.5rem;
      }

      .name {
        font-size: 48px;
        font-weight: 900;
      }
    }
  }
}

.section-step-3 {
  position: absolute;
  left: 50%;
  top: 40%;
  width: 60%;
  height: 40%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;

  .image {
    width: 40%;

    .step4-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .info {
    height: 18rem;
    width: 60%;
    padding: 1rem;
    color: #323232;
    font-size: 3rem;
    border-radius: 0 0.9375rem 0.9375rem 0;
    background: #e2e2e2;
    display: flex;
    flex-direction: column;
    justify-content: center;

    > div {
      display: flex;
      gap: 1rem;
      align-items: center;

      > div:first-child {
        font-size: 1.5rem;
      }
    }
  }

  .back-btn {
    position: absolute;
    bottom: -3rem;
    right: 0;
    text-align: center;
    padding: 8px 16px;
    width: 10.25rem;
    height: 4.1875rem;
    font-size: 2rem;
    border-radius: 0.375rem;
    color: rgba(255, 255, 255, 0.8);
    background-color: #30bf36;
  }
}

.section-step-4-new {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .welcome-title {
    color: white;
    font-size: 88px;
    font-weight: 300;
    font-style: italic;
    text-align: center;
    margin-bottom: 3rem;
    text-shadow: 0px 0px 12px #ff00b0, 0px 0px 6px #47eaff;
  }

  .content-wrapper-step4 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .left-section-step4 {
    flex: 1;
  }

  .center-section-step4 {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .photo-preview {
      width: 400px;
      height: 400px;
      border-radius: 24px;
      object-fit: cover;
    }
  }

  .right-section-step4 {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    .visitor-info {
      font-family: 'Noto Sans';
      color: white;

      .department {
        font-size: 32px;
        font-weight: 300;
        margin-bottom: 1rem;
      }

      .name {
        font-size: 48px;
        font-weight: 700;
      }
    }
  }
}

.back-btn-step4 {
  width: 400px;
  position: fixed;
  bottom: 5rem;
  right: 5rem;
  z-index: 100;
}

.err-msg {
  width: 100%;
  height: 100%;
  background: #e2e2e2;
  color: #323232;
}
</style>
