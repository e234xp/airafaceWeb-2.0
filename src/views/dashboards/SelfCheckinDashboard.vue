<template>
  <div
    class="ratio-wrap ratio-wrap-16x9"
  >
    <div
      class="ratio-content selfcheckin-dashboard"
    >
      <img
        :src="display.logo"
        style="height: 60px; min-width: 120px; object-fit: contain; object-fit: contain; position: absolute; top: 16px;"
        :style="{ left: `${(paddingX / 2) + 16}px` }"
        @click="toLoginPage"
        v-if="display.logo !== ''"
      >
      <img
        :src="backgroud"
        style="width: 100%; height: 100%; object-fit: cover;"
        v-if="backgroud !== ''"
      >
      <!-- <div style="font-size: 20px; color: red">{{ testMsg }}</div> -->
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
          <!-- <p class="text-white">{{ selectedCamera }}</p> -->
          <button class="switch-camera-btn" 
          @click="switchCamera">{{ $t('SwitchCamera') }}</button>
          <QrcodeStream
            @decode="onDecode"
            :camera="selectedCamera"
            class="qrcodeReader"
            v-if="freshReader"
          />
          <div class="err-msg" v-else>
            {{ errMsg }}
          </div>
        </div>
      </template>
      <template v-if="currentStep === 2">
        <div
          class="section-step-2"
          :style="{ width: `calc(100% - ${paddingX}px)`, zoom: `${zoomRatio}!important` }"
        >
          <div class="info">
            <div>
              <div>{{ $t('VisitorId') }}</div>
              <div>{{ visitor.id }}</div>
            </div>
            <div>
              <div>{{ $t('KeywordName') }}</div>
              <div>{{ visitor.name }}</div>
            </div>
            <div>
              <div>{{ $t('ValidPeriod') }}</div>
              <div v-if="visitor.begin_date === 0 && visitor.expire_date === 0">--</div>
              <div v-else>{{ parseTime(visitor.begin_date) }} ~ {{ parseTime(visitor.expire_date) }}</div>
            </div>
          </div>
          <div class="webcam-list">
            <div
              class="btn type-1"
              @click="onReTake"
            >
              {{ $t('ReTake') }}
            </div>
            <div
              class="webcam"
              style="margin-right: 2rem;"
            >
              <CSelect
                v-model="selectedDeviceId"
                :options="cameraList"
                :placeholder="$t('Select')"
              />
              <WebCam
                ref="webcam"
                :device-id="selectedDeviceId"
                @cameras="onCameras"
                @started="onStart"
                class="mirror"
                style="width: 100%; height: 100%; "
              />
            </div>
            <div
              class="webcam"
              style="margin-left: 2rem; margin-top: 3.2rem"
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
              {{ $t('Capture') }}
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
              <div>{{ $t('VisitorId') }}</div>
              <div>{{ visitor.id }}</div>
            </div>
            <div>
              <div>{{ $t('KeywordName') }}</div>
              <div>{{ visitor.name }}</div>
            </div>
            <div>
              <div>{{ $t('ValidPeriod') }}</div>
              <div v-if="visitor.begin_date === 0 && visitor.expire_date === 0">--</div>
              <div v-else>{{ parseTime(visitor.begin_date) }} ~ {{ parseTime(visitor.expire_date) }}</div>
            </div>
          </div>
          <div
            class="back-btn"
            @click="onBack"
          >
            {{ $t('GoBack') }} ({{ cdCount }})
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
import dayjs from 'dayjs';
import i18n from '@/i18n';

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
      initTimer: null,
      zoomRatio: 0,
      freshReader: true,
      errMsg: '',
      testMsg: '',
      isAuo: false,
      trackToken: '',
      tabletToken: '',
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
  watch: {
    selectedCamera() {
      this.onRefresh();
    },
  },
  methods: {
    switchCamera(){
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

          dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
          dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
          dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;

          this.paddingX = dW;
        }
      }
    },
    async onCameras(cameras) {
      // this.cameraList = cameras;
      const idx = this.cameraList.findIndex((item) => item.label.toLowerCase().indexOf('front') >= 0 || item.label.toLowerCase().indexOf('face') >= 0);
      this.selectedDeviceId = this.cameraList[idx < 0 ? this.cameraList.length - 1 : idx].value;
      // this.$refs.webcam.start();
      this.testMsg += `onCameras ${JSON.stringify(cameras)}`;
      // this.startTimer(1500);
    },
    onStart() {
      this.startTimer(500);
    },
    async startTimer(t) {
      setTimeout(() => {
        try {
          const image = this.$refs.webcam.capture();
          this.testMsg += `image ${JSON.stringify(image)}`;
          if (image) this.imageList.push(image);
        } catch (e) {
          this.testMsg = `startTimer ${e}`;
        }
      }, t || 500);
    },
    async onDecode(decode) {
      let isErr = true;
      const { uuid } = JSON.parse(decode);
      if (uuid) {
        const { data } = await this.$globalFindVisitor(uuid, 0, 20);
        if (data.message === 'ok') {
          const [item] = data.visitor_list;
          this.visitor = item;
          // if (this.visitor.card_number === '') {
          //   this.$message.error(i18n.formatter.format('NoCardMsg'));
          //   // this.errMsg = i18n.formatter.format('NoCardMsg');
          // }
          if (this.visitor.expire_date !== 0 && this.visitor.expire_date < Date.now()) {
            this.$message.error(i18n.formatter.format('QRcodeExpiredMsg'));
            // this.errMsg = i18n.formatter.format('QRcodeExpiredMsg');
          } else if (this.visitor.begin_date !== 0 && this.visitor.begin_date > Date.now()) {
            this.$message.error(i18n.formatter.format('QRcodeExpiredMsg'));
            // this.errMsg = i18n.formatter.format('QRcodeExpiredMsg');
          } else {
            this.currentStep = 2;
            isErr = false;
          }
        } else {
          this.$message.error(i18n.formatter.format('NoInfoMsg'));
          // this.errMsg = i18n.formatter.format('NoInfoMsg');
        }
      } else this.$message.error(i18n.formatter.format('NoInfoMsg')); // this.errMsg = i18n.formatter.format('NoInfoMsg');
      if (isErr) this.onRefresh();
    },
    onRefresh() {
      this.freshReader = false;
      setTimeout(() => {
        this.freshReader = true;
        this.errMsg = '';
      }, 2000);
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
          this.currentStep = 3;
          this.onCountDown();
          // this.$globalVerifyCard({
          //   client_id: this.display.entryChannel.label,
          //   device_uuid: this.display.entryChannel.value.split('/')[0],
          //   uuid: this.display.entryChannel.value.split('/')[1],
          //   card_number: this.visitor.card_number,
          //   timestamp: Date.now(),
          // }, (err, res) => {
          //   if (!err && res.message === 'ok') {
          //     this.currentStep = 3;
          //     // if (this.isAuo) {
          //     //   this.addToTablet();
          //     //   this.addToTrack();
          //     // }
          //     this.onCountDown();
          //   }
          // });
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
    toLoginPage() {
      this.$globalLogout();
      this.$router.push('/');
    },
    parseTime(val) {
      return val === 0 ? '--' : dayjs(val).format('YYYY-MM-DD');
    },
    initAuo() {
      const track = 'https://192.168.10.212:8443/airaTracker/login';
      const tablet = 'https://192.168.10.199/airafacelite/generatetoken';
      const info = {
        username: 'Admin',
        password: '123456',
      };
      const requestOptions = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      };
      fetch(track, requestOptions)
        .then(
          async (response) => {
            const payload = await response.json();
            this.trackToken = payload.sessionId;
          },
        )
        .catch((error) => {
          console.log(error);
        });
      fetch(tablet, requestOptions)
        .then(
          async (response) => {
            const payload = await response.json();
            this.tabletToken = payload.token;
          },
        )
        .catch((error) => {
          console.log(error);
        });
    },
    maintain() {
      const track = 'https://192.168.10.212:8443/airaTracker/expiretime/extend';
      const tablet = 'https://192.168.10.199/airafacelite/maintaintoken';
      const trackOptions = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          sessionId: this.trackToken,
        },
      };
      const tabletOptions = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.tabletToken }),
      };
      fetch(track, trackOptions)
        .then(
          async (response) => {
            console.log(response);
            // const payload = await response.json();
            // this.trackToken = payload.sessionId;
          },
        )
        .catch((error) => {
          console.log(error);
        });
      fetch(tablet, tabletOptions)
        .then(
          async (response) => {
            const payload = await response.json();
            this.tabletToken = payload.token;
          },
        )
        .catch((error) => {
          console.log(error);
        });
    },
    addToTablet() {
      const requestOptions = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          token: this.tabletToken,
        },
        body: JSON.stringify(this.visitor),
      };
      const api = 'https://192.168.10.199/airafacelite/createvisitor';
      fetch(api, requestOptions)
        .then(
          async (response) => {
            if (response.status === 200) {
              this.$fire({
                text: i18n.formatter.format('Successful'),
                type: 'success',
                timer: 1000,
              });
            }
          },
        )
        .catch(() => {
          this.$fire({
            text: '',
            type: 'error',
            timer: 3000,
          });
        });
    },
    addToTrack() {
      const requestOptions = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          sessionId: this.trackToken,
        },
        body: JSON.stringify({
          face_image: `data:image/jpeg;base64,${this.visitor.register_image}`,
          albumId: '3',
        }),
      };
      const api = 'https://192.168.10.212:8443/airaTracker/albums/uploadPhoto';
      fetch(api, requestOptions)
        .then(
          async (response) => {
            if (response.status === 200) {
              this.$fire({
                text: i18n.formatter.format('Successful'),
                type: 'success',
                timer: 1000,
              });
            }
          },
        )
        .catch(() => {
          this.$fire({
            text: '',
            type: 'error',
            timer: 3000,
          });
        });
    },
  },
  async created() {
    await this.$globalGetDisplaySetting((err, data) => {
      if (data.SELFCHECKIN) this.display = data.SELFCHECKIN;
    });
    try {
      navigator.mediaDevices.enumerateDevices()
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
      // this.testMsg = `try ${e}`;
    }
  },
  async mounted() {
    this.initViews();
    this.zoomViews();

    // if (this.isAuo) {
    //   this.initAuo();
    //   this.initTimer = setInterval(() => {
    //     this.maintain();
    //   }, 60000);
    // }

    window.addEventListener('resize', () => {
      console.log('zoomViews');
      this.zoomViews();
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.cdTimer);
    clearInterval(this.initTimer);

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
  left: 50%;
  top: 40%;
  height: 540px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  gap: 2rem;
  transform: translate(-50%, 0);

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

.err-msg {
  width: 100%;
  height: 100%;
  background: #E2E2E2;
  color: #323232;
}
.switch-camera-btn {
  padding: 10px 20px;
  margin-bottom: 30px;
  background-color: #2563eb; 
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.switch-camera-btn:hover {
  background-color: #1d4ed8;
}

.switch-camera-btn:active {
  transform: scale(0.98);
}
</style>
