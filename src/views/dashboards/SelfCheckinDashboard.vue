<template>
  <div
    class="ratio-wrap ratio-wrap-16x9"
  >
    <div
      class="ratio-content selfcheckin-dashboard"
    >
      <img
        :src="backgroud"
        style="width: 100%; height: 100%; object-fit: cover;"
        v-if="backgroud !== ''"
      >
      <template v-if="currentStep === 1">
        <div
          class="section-step-1"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <!-- <CSelect
          v-model="selectedCamera"
          :options="cameraList"
          :placeholder="$t('Select')"
        /> -->
          <QrcodeStream
            @decode="onDecode"
            :camera="selectedCamera"
            class="mirror qrcodeReader"
          />
        </div>
      </template>
      <template v-if="currentStep === 2">
        <div
          class="section-step-2"
          :style="{ width: `calc(100% - ${paddingX}px)`, zoom: `${zoomRatio}!important` }"
        >
          <div class="info">
            <div>
              <div>編號</div>
              <div>{{ visitor.id }}</div>
            </div>
            <div>
              <div>姓名</div>
              <div>{{ visitor.name }}</div>
            </div>
            <div>
              <div>時段</div>
              <div>12/07 12:00 - 12/07 17:00</div>
            </div>
          </div>
          <div class="webcam-list">
            <div
              class="btn type-1"
              @click="onReTake"
            >
              Re-Take
            </div>
            <div
              class="webcam"
              style="margin-right: 2rem;"
            >
              <WebCam
                ref="webcam"
                :device-id="selectedDeviceId"
                @cameras="onCameras"
                class="mirror"
                style="width: 100%; height: 100%; "
              />
            </div>
            <div
              class="webcam"
              style="margin-left: 2rem;"
            >
              <img
                :src="imageList[0]"
                class="mirror"
                style="width: 100%; height: 100%;"
                v-show="imageList[0] && imageList[0] !== ''"
              >
            </div>
            <div
              class="btn type-2"
              @click="onRegister(0)"
            >
              Capture
            </div>
          </div>
        </div>
      </template>
      <template v-if="currentStep === 3">
        <div
          class="section-step-3"
          :style="{ zoom: `${zoomRatio}!important` }"
        >
          <div class="image">
            <img
              class="mirror"
              :src="selectedImage"
              style="width: 100%; height: 100%; object-fit: contain;"
              v-if="selectedImage !== ''"
            >
          </div>
          <div class="info">
            <div>
              <div>編號</div>
              <div>{{ visitor.id }}</div>
            </div>
            <div>
              <div>姓名</div>
              <div>{{ visitor.name }}</div>
            </div>
            <div>
              <div>時段</div>
              <div>12/07 12:00 - 12/07 17:00</div>
            </div>
          </div>
          <div
            class="back-btn"
            @click="onBack"
          >
            返回 ({{ cdCount }})
          </div>
        </div>
      </template>
      <div
        class="house-icon"
        @click="onBack"
        :style="{ right: `${(paddingX / 2) + 16}px` }"
        v-if="currentStep === 2"
      >
        <CIcon
          name="cil-house"
          style="width: 100%; height: 100%; color: rgba(255, 255, 255, 0.8)"
        />
      </div>
    </div>
  </div>
</template>

<script>

import { QrcodeStream } from 'vue-qrcode-reader';
import { WebCam } from 'vue-web-cam';

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
      imageTaked: 0,
      imageList: [],
      selectedImage: '',
      cdCount: 10,
      timer: null,
      cdTimer: null,
    };
  },
  computed: {
    backgroud() {
      if (this.currentStep === 1) return this.display.step1Background;
      if (this.currentStep === 2) return this.display.step2Background;
      if (this.currentStep === 3) return this.display.step3Background;
      return '';
    },
  },
  methods: {
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

          const dW = width - (1920 * this.zoomRatio);
          const dH = height - (1080 * this.zoomRatio);

          // dashboard.style.width = `${Math.floor(1920 * this.zoomRatio)}px`;
          // dashboard.style.height = `${Math.floor(1080 * this.zoomRatio)}px`;

          dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
          dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;

          this.paddingX = dW;
        }
      }
    },
    async onCameras(cameras) {
      this.selectedDeviceId = cameras[0].deviceId;
      this.startTimer(1500);
    },
    async startTimer(t) {
      setTimeout(() => {
        const image = this.$refs.webcam.capture();
        if (image) this.imageList.push(image);
      }, t || 500);
      // this.timer = setInterval(() => {
      //   if (this.imageTaked === 1) clearInterval(this.timer);
      //   else {
      //     const image = this.$refs.webcam.capture();
      //     if (image) {
      //       this.imageTaked += 1;
      //       this.imageList.push(image);
      //     }
      //   }
      // }, 1000);
    },
    async onDecode(decode) {
      const { uuid } = JSON.parse(decode);
      if (uuid) {
        const { data } = await this.$globalFindVisitor(uuid, 0, 20);
        if (data.message === 'ok') {
          const [item] = data.visitor_list;
          this.visitor = item;
          console.log(this.visitor);
          this.currentStep = 2;
        } else {
          // this.currentStep = 3;
        }
      }
    },
    onReTake() {
      this.imageList = [];
      this.imageList.length = 0;
      this.imageTaked = 0;
      this.startTimer();
    },
    onRegister(idx) {
      this.selectedImage = this.imageList[idx];
      this.visitor.register_image = this.imageList[idx].replaceAll('data:image/jpeg;base64,', '');
      this.visitor.display_image = this.imageList[idx].replaceAll('data:image/jpeg;base64,', '');
      this.$globalModifyVisitor({ uuid: this.visitor.uuid, data: this.visitor }, (error, result) => {
        if (!error && result.message === 'ok') {
          this.$globalVerifyCard({
            client_id: this.display.entryChannel.label,
            device_uuid: this.display.entryChannel.value,
            card_number: this.visitor.card_number,
            timestamp: Date.now(),
          }, (err, res) => {
            if (!err && res.message === 'ok') {
              this.currentStep = 3;
              this.onCountDown();
            }
          });
        }
      });
    },
    onCountDown() {
      this.cdCount = 10;
      this.cdTimer = setInterval(() => {
        if (this.cdCount <= 0 && this.currentStep === 3) {
          this.onBack();
        }
        this.cdCount -= 1;
      }, 1000);
    },
    onBack() {
      clearInterval(this.cdTimer);
      this.imageList = [];
      this.imageList.length = 0;
      this.imageTaked = 0;
      this.selectedDeviceId = '';
      this.currentStep = 1;
    },
  },
  async created() {
    await this.$globalGetDisplaySetting((err, data) => {
      if (data.SELFCHECKIN) this.display = data.SELFCHECKIN;
    });
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'videoinput' && device.label.indexOf('IR') <= -1) {
            this.cameraList.push({ value: device.deviceId, label: device.label });
          }
        });
        this.selectedCamera = this.cameraList.length > 1 ? 'front' : 'auto';
        // this.selectedDeviceId = this.cameraList[0].value;
      })
      .catch((err) => {
        console.log(`${err.name}: ${err.message}`);
      });
  },
  async mounted() {
    this.initViews();
    this.zoomViews();

    window.addEventListener('resize', () => {
      console.log('zoomViews');
      this.zoomViews();
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.cdTimer);

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

<style lang='scss' scoped>
/* Add your component styles here */
.section-step-1 {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 440px;
  height: 440px;
  transform: translate(-50%, 0);
}

.mirror {
  transform: scaleX(-1);
}

.qrcodeReader {
  width: 100%;
  height: 100%;
}

.section-step-2 {
  position: absolute;
  top: 40%;
  height: 540px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  gap: 2rem;

  .info {
    width: 90%;
    background: #E2E2E2;
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
        background-color: #FFA114;
      }

      &.type-2 {
        background-color: #30BF36;
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
  }

  .info {
    height: 18rem;
    width: 60%;
    padding: 1rem;
    color: #323232;
    font-size: 3rem;
    border-radius: 0 0.9375rem 0.9375rem 0;
    background: #E2E2E2;
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
    background-color: #30BF36;
  }
}

.house-icon {
  position: absolute;
  bottom: 1rem;
  width: 4.5rem;
  height: 4.5rem;
  background: #20a8d8;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
