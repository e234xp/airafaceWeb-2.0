<template>
  <div class="ratio-wrap ratio-wrap-16x9">
    <div class="ratio-content selfcheckin-dashboard">
      <!-- <img
        :src="display.logo"
        style="height: 60px; min-width: 120px; object-fit: contain; object-fit: contain; position: absolute; top: 16px;"
        :style="{ left: `${(paddingX / 2) + 16}px` }"
        @click="toLoginPage"
        v-if="display.logo !== ''"
      > -->
      <img :src="backgroud" style="width: 100%; height: 100%; object-fit: cover;" v-if="backgroud !== ''">
      <!-- <div style="font-size: 20px; color: red">{{ testMsg }}</div> -->
      <template v-if="currentStep === 1">
        <div class="section-step-1" :style="{ zoom: `${zoomRatio}!important` }">
          <CSelect v-model="selectedDeviceId" :options="cameraList" :placeholder="$t('Select')" />
          <div
            style="width: 492px; height: 492px; padding: 26px; background-image: url('/img/inspect/camera_border.svg');">
            <WebCam ref="webcam" :device-id="selectedDeviceId" @cameras="onCameras" @started="onStart" class="mirror"
              style="width: 100%; height: 100%; " />
          </div>
        </div>
      </template>
      <template v-if="currentStep === 2">
        <transition name="slide-fade">
          <div class="section-step-2" :style="{ zoom: `${zoomRatio}!important` }" v-if="showStep2Trans">
            <div class="image">
              <img :src="image" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div class="info">
              <div class="profile">
                <div class="title">
                  編號
                </div>
                <div class="content">
                  {{ person.employeeno }}
                </div>
              </div>
              <div class="profile">
                <div class="title">
                  姓名
                </div>
                <div class="content">
                  {{ person.fullname }}
                </div>
              </div>
              <div class="profile">
                <div class="title">
                  時間
                </div>
                <div class="content">
                  {{ time }}
                </div>
              </div>
            </div>
          </div>
        </transition>
        <div class="section-step-2-button-list" :style="{ zoom: `${zoomRatio}!important` }">
          <div class="button" @click="onBack">
            返回
          </div>
          <div class="button test" @click="onTest">
            酒精測試
          </div>
        </div>
      </template>
      <template v-if="currentStep === 3 || currentStep === 4">
        <div class="section-step-3" :style="{ zoom: `${zoomRatio}!important` }">
          <div class="container" v-if="showStep3Trans">
            <div class="image">
              <img class="mirror" :src="image" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div class="name">
              {{ person.fullname }}
            </div>
          </div>
          <transition name="verse-slide-fade">
            <div class="info"
              :class="[ctrlText === '' || ctrlText === 'heating' || ctrlText === 'opening' || ctrlText === 'ready' || ctrlText === 'prepare' || ctrlText === 'measure' ? 'bg' : '']"
              v-if="showStep3Trans">
              <template v-if="ctrlText === ''">
                <div class="text">
                  請點選機器前方按鈕
                </div>
              </template>
              <template v-if="ctrlText === 'opening'">
                <div class="text" style="display: flex; gap: 1rem">
                  <div>準備酒測</div>
                  <scale-loader :color="'#007FFF'" :height="'36px'" :width="'12px'"></scale-loader>
                </div>
              </template>
              <template v-if="ctrlText === 'heating'">
                <!-- <img src="/img/inspect/device_heating.svg" class="image"> -->
                <div class="text">設備預熱中 {{ ctrlData }}</div>
                <img src="/img/inspect/device_self.svg" class="device rotate">
              </template>
              <template v-if="ctrlText === 'prepare'">
                <div class="text">設備校正中，請稍候</div>
              </template>
              <template v-if="ctrlText === 'measure'">
                <div class="text">判別中</div>
              </template>
              <template v-if="ctrlText === 'ready'">
                <div class="text">請吹氣</div>
                <div ref="blow" style="margin-left: 40%; width: 50%; height: 100%;" v-if="showGauge" />
              </template>
              <template v-if="ctrlText === 'end' && alcoPass">
                <img src="/img/inspect/alco_pass.svg" class="image">
                <div class="result">{{ ctrlData }}</div>
              </template>
              <template v-if="ctrlText === 'end' && !alcoPass">
                <img src="/img/inspect/alco_fail.svg" class="image">
                <div class="result">{{ ctrlData || '--' }}</div>
              </template>
              <!-- <transition
                  name="text-fade"
                  mode="out-in"
                >
                  <div :key="ctrlText">
                    <div
                      style="display: flex; flex-direction: column;"
                      v-if="ctrlText === 'ready'"
                    >
                      <div style="display: flex; align-items: center; gap: 1rem">
                        <div>準備中</div>
                        <CSpinner style="border-width: 0.4rem; color: #20a8d8" />
                      </div>
                      <div>請勿吹氣</div>
                    </div>
                    <div v-if="ctrlText !== ''">
                      {{ ctrlText }}
                    </div>
                    <div
                      ref="blow"
                      v-if="showGauge"
                      style="width: 50%; height: 100%;"
                    />
                  </div>
                </transition> -->
            </div>
          </transition>
        </div>
        <div class="section-step-3-button-list" :style="{ zoom: `${zoomRatio}!important` }" v-if="currentStep === 4">
          <div class="button" @click="onReTest">
            重新測試
          </div>
          <div class="button test" @click="onBack">
            完成
          </div>
        </div>
      </template>
      <div class="house-icon" @click="() => ctrl += '1'" :style="{ right: `${(paddingX / 2) + 16}px` }"
        v-if="currentStep === 2">
        <CIcon name="cil-house" style="width: 100%; height: 100%; color: rgba(255, 255, 255, 0.8)" />
      </div>
    </div>
  </div>
</template>

<script>
  import { QrcodeStream } from 'vue-qrcode-reader';
  import { WebCam } from 'vue-web-cam';
  import dayjs from 'dayjs';
  import i18n from '@/i18n';
  import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'
  import * as faceapi from 'face-api.js';
  import * as echarts from 'echarts';

  export default {
    name: 'SelfCheckinDashboard',
    components: {
      QrcodeStream,
      WebCam,
      ScaleLoader,
    },
    data() {
      return {
        showStep2Trans: false,
        showStep3Trans: false,
        alcoPass: false,
        alcoRecord: [],
        unSubscribe: null,
        display: {},
        currentStep: 1,
        cameraList: [],
        selectedCamera: 'auto',
        selectedDeviceId: '',
        person: {},
        time: '',
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
        ctrlText: '',
        ctrlData: '',
        chart: null,
        camTimer: null,
        option: {
          series: [
            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              center: ['50%', '75%'],
              radius: '100%',
              min: 0,
              max: 100,
              splitNumber: 8,
              axisLine: {
                lineStyle: {
                  width: 16,
                  color: [
                    [0.25, 'grey'],
                    [0.5, 'green'],
                    [0.75, 'green'],
                    [1, 'red'],
                  ],
                },
              },
              pointer: {
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: '12%',
                width: 20,
                offsetCenter: [0, '-60%'],
                itemStyle: {
                  color: 'auto',
                },
              },
              axisTick: {
                length: 12,
                lineStyle: {
                  color: 'auto',
                  width: 2,
                },
              },
              splitLine: {
                length: 20,
                lineStyle: {
                  color: 'auto',
                  width: 5,
                },
              },
              axisLabel: {
                show: false,
                rotate: 'tangential',
              },
              detail: {
                fontSize: 100,
                offsetCenter: [0, '-20%'],
                valueAnimation: false,
                color: 'inherit',
              },
              data: [
                {
                  value: 0,
                  name: '',
                },
              ],
            },
          ],
        },
      };
    },
    computed: {
      backgroud() {
        if (this.currentStep === 1) return '/img/inspect/registration-1.jpg';
        if (this.currentStep === 2 || this.currentStep === 3) return '/img/inspect/registration-2.jpg';
        if (this.currentStep === 4) return '/img/inspect/registration-3.jpg';
        return '';
      },
      showGauge() {
        const flag = this.ctrlText === 'ready';
        if (flag && !this.chart) {
          this.$nextTick(() => {
            this.chart = echarts.init(this.$refs.blow);
            this.chart.setOption(this.option);
          });
        }
        return flag;
      },
    },
    watch: {
      currentStep(val) {
        if (val === 1) {
          this.$nextTick(() => {
            this.showStep2Trans = false;
            this.showStep3Trans = false;
          });
        }
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

            dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
            dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
            dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
            dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;

            this.paddingX = dW;
          }
        }
      },
      async detectFaceAndGetHeadBox(img, cb) {
        const detection = await faceapi.detectSingleFace(
          img,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1 }),
        );
        return new Promise((resolve) => {
          let box = null;
          if (detection) {
            const rangeRatio = 2;
            let headWidthToHunt = (detection.box.width < detection.box.height ? detection.box.width : detection.box.height) * rangeRatio;
            let headX = detection.box.x - detection.box.width / 2;
            let headY = detection.box.y - detection.box.height / 1.2;
            if (headX < 0) headX = 0;
            if (headY < 0) headY = 0;
            while (headWidthToHunt + headX > img.width || headWidthToHunt + headY > img.height) {
              headWidthToHunt -= 1;
            }

            box = {
              x: headX,
              y: headY,
              width: headWidthToHunt,
              height: headWidthToHunt,
            };
          }
          if (cb) cb(box);
          resolve(box);
        });
      },
      async onCameras(cameras) {
        this.cameraList = cameras.map((item) => ({ label: item.label, value: item.deviceId }));
        const idx = this.cameraList.findIndex((item) => item.label.toLowerCase().indexOf('front') >= 0 || item.label.toLowerCase().indexOf('face') >= 0);
        this.selectedDeviceId = this.cameraList[idx < 0 ? this.cameraList.length - 1 : idx].value;
        // this.$refs.webcam.start();
        // this.testMsg += `onCameras ${JSON.stringify(cameras)}`;
        // this.startTimer(1500);
      },
      onStart() {
        this.startTimer();
      },
      async startTimer() {
        this.camTimer = setInterval(() => {
          try {
            const image = this.$refs.webcam.capture();
            const img = new Image();
            img.src = image;
            this.detectFaceAndGetHeadBox(img, (box) => {
              if (box) {
                this.verifyFace(image);
              }
            });
          } catch (e) {
            this.testMsg = `startTimer ${e}`;
          }
        }, 1000);
      },
      onReTake() {
        this.imageList = [];
        this.imageList.length = 0;
        this.imageTaked = 0;
        this.startTimer();
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
      onTest() {
        this.currentStep = 3;
        this.showStep3Trans = true;
      },
      onReTest() {
        this.currentStep = 3;
        this.onResetAlco();
      },
      onBack() {
        clearInterval(this.cdTimer);
        this.selectedDeviceId = '';
        this.currentStep = 1;
        this.onResetAlco();
      },
      onResetAlco() {
        this.chart = null;
        this.ctrlText = '';
        this.ctrlData = 0;
        this.alcoPass = false;
        this.alcoRecord = [];
        this.alcoRecord.length = 0;
      },
      toLoginPage() {
        this.$globalLogout();
        this.$router.push('/');
      },
      parseTime(val) {
        return val === 0 ? '--' : dayjs(val).format('YYYY-MM-DD HH:mm');
      },
      verifyFace(image) {
        // const face = 'https://192.168.10.11:8588/system/verifyface';
        // const info = {
        //   source_id: '6feb718b84b149dba1961aaac0db8882',
        //   target_score: 0.85,
        //   verify_mode: 0,
        //   base64_image: image.replaceAll('data:image/jpeg;base64,', ''),
        // };
        const face = 'http://192.168.10.11:80/airaface/verifyfaceservice';
        const info = {
          client_id: 'Tablet-xs',
          device_uuid: '6feb718b84b149dba1961aaac0db8882',
          uuid: '',
          face_image: image.replaceAll('data:image/jpeg;base64,', ''),
        };
        const requestOptions = {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(info),
        };
        fetch(face, requestOptions)
          .then(
            async (response) => {
              console.log(response);
            },
          )
          .catch((error) => {
            console.log(error);
          });
      },
    },
    async created() {
      faceapi.nets.tinyFaceDetector.loadFromUri('/models');

      await this.$globalGetDisplaySetting((err, data) => {
        if (data.SELFCHECKIN) this.display = data.SELFCHECKIN;
      });

      this.unSubscribe = this.$store.subscribe(async (mutation) => {
        let payload = {};
        // let person = {};
        // let result = {};
        // console.log(mutation);
        switch (mutation.type) {
          case 'changeWebSocket':
            // if (mutation.payload === 0) {
            //   if (!self.obj_loading) self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
            // } else if (self.obj_loading) {
            //   self.obj_loading.hide();
            //   self.obj_loading = null;
            // }
            break;
          case 'changeNotifications':
            if (this.currentStep !== 1) return;
            if (mutation.payload.statusCode === '200') {
              console.log('created subscribe', 'mutation payload statusCode == 200');
              return;
            }

            payload = mutation.payload;

            if (payload.person_info) {
              this.person = payload.person_info;
              const { data: { person_list } } = await this.$globalFindPerson(payload.person_id, 0, 20);
              const { display_image, register_image } = person_list[0];
              this.image = `data:image/jpeg;base64,${display_image !== '' ? display_image : register_image}`;
              this.time = this.parseTime(payload.timestamp);
              this.currentStep = 2;
              clearInterval(this.camTimer);
              this.$nextTick(() => {
                this.showStep2Trans = true;
              });
            }
            break;
          default:
            break;
        }
      });

      const wsSocketPath = new WebSocket('ws://192.168.10.10:8087/airaconnect/ws/devicestatus');

      wsSocketPath.onopen = () => {
        console.log('onopen');
      };

      wsSocketPath.onmessage = (event) => {
        if (this.ctrlText === 'end') return;
        console.log('onmessage', event.data);
        const ctrl = JSON.parse(event.data).ctrl || '';
        this.ctrlData = JSON.parse(event.data).data || 0;

        if (this.ctrlText === '') {
          if (ctrl === 'eae517') this.ctrlText = 'opening';
          else return;
        }

        if (ctrl === 'eae590') this.ctrlText = 'heating';
        if (ctrl === 'eae5a0' && this.ctrlText !== 'measure') this.ctrlText = 'ready';
        if (ctrl === 'eae513') this.ctrlText = 'prepare';
        if (ctrl === 'eae520') this.ctrlText = 'measure';
        if (ctrl === 'eae512') this.ctrlText = 'end';
        if (this.ctrlText === 'ready' && ctrl === 'ebe41d') this.ctrlText = 'end';

        if (this.showGauge) {
          this.option.series[0].data[0].value = this.ctrlData;
          if (this.chart) this.chart.setOption(this.option);
        }

        if (this.ctrlText === 'ready') {
          if (this.ctrlData >= 25) this.alcoRecord.push(this.ctrlData);
        }

        if (this.ctrlText === 'end') {
          this.alcoPass = this.alcoRecord.length >= 1 && this.ctrlData <= 0.14;
          if (this.alcoRecord.length === 0) this.ctrlData = '--';
          this.currentStep = 4;
        }
      };

      wsSocketPath.onclose = (event) => {
        console.log('onclose', event);
      };

      wsSocketPath.onerror = (error) => {
        console.log('onerror', error);
      };
    },
    async mounted() {
      this.initViews();
      this.zoomViews();

      window.addEventListener('resize', () => {
        this.zoomViews();
      });
    },
    beforeDestroy() {
      this.unSubscribe();

      clearInterval(this.timer);
      clearInterval(this.cdTimer);
      clearInterval(this.initTimer);
      clearInterval(this.camTimer);

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
    top: 40%;
    // width: 440px;
    // height: 440px;
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
    top: 37%;
    height: 432px;
    width: 1040px;
    display: flex;
    justify-content: center;
    padding: 40px;
    gap: 2rem;
    transform: translate(-50%, 0);
    background-image: url('/img/inspect/profile_border.svg');
    backdrop-filter: blur(6px);

    .image {
      width: 352px;
      height: 352px;
      background-color: rgb(174, 173, 173);
    }

    .info {
      height: 100%;
      width: calc(100% - 352px);
      font-size: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      justify-content: center;

      >.profile {
        border-radius: 1rem;
        display: flex;
        gap: 1.5rem;
        align-items: center;

        >.title {
          color: #A4A4A4;
          font-size: 1.5rem;
        }

        >.content {
          color: #FFFFFF;
          font-size: 3rem;
        }
      }
    }
  }

  .section-step-2-button-list {
    position: absolute;
    left: 50%;
    top: calc(37% + 432px + 1.2rem);
    width: 1040px;
    display: flex;
    justify-content: center;
    gap: 2rem;
    transform: translate(-50%, 0);
  }

  .section-step-3 {
    position: absolute;
    left: 50%;
    top: 37%;
    width: 1220px;
    height: 520px;
    transform: translate(-50%, 0);

    .container {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      padding: 20px;
      width: 320px;
      height: 408px;
      border-radius: 12px;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);

      >.image {
        width: 280px;
        height: 280px;
        border-radius: 4px;
        background-color: gray;
      }

      >.name {
        margin-top: 1rem;
        text-align: center;
        font-size: 2.4rem;
        color: #FFFFFF;
      }
    }

    .info {
      position: absolute;
      left: 280px;
      top: 0;
      width: 885px; // 930px
      height: 100%;
      z-index: -1;
      backdrop-filter: blur(6px);

      &.bg {
        border-radius: 12px;
        background-color: rgba(0, 0, 0, 0.4);
      }

      >.text {
        position: absolute;
        top: 50%;
        left: 140px;
        transform: translate(0, -50%);
        color: #FFFFFF;
        font-size: 3rem;
      }

      >.image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      >.device {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      >.result {
        position: absolute;
        right: 52px;
        bottom: 56px;
        color: #FFFFFF;
        font-size: 200px;
        font-weight: bold;
      }
    }
  }

  .section-step-3-button-list {
    position: absolute;
    left: 50%;
    top: calc(37% + 520px + 1.2rem);
    width: 1040px;
    display: flex;
    justify-content: center;
    gap: 2rem;
    transform: translate(-50%, 0);
  }

  .button {
    border-radius: 6px;
    border: 2px solid #FFFFFF;
    text-align: center;
    padding: 0.2rem 3rem;
    font-size: 2.5rem;
    color: #FFFFFF;
    cursor: pointer;

    &.test {
      background: #30BF36;
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

  .rotate {
    animation: rotation 1s infinite linear;
  }

  // @keyframes rotation {
  //   0% {
  //     transform: rotateZ(0deg);
  //   }
  //   50% {
  //     transform: rotateZ(5deg);
  //   }
  //   100% {
  //     transform: rotateZ(0deg);
  //   }
  // }

  @keyframes rotation {
    0% {
      transform: rotateZ(0deg);
    }

    25% {
      transform: rotateZ(2deg);
    }

    50% {
      transform: rotateZ(4deg);
    }

    75% {
      transform: rotateZ(2deg);
    }

    100% {
      transform: rotateZ(0deg);
    }
  }

  .slide-fade-enter-active {
    transition: all .5s ease;
  }

  .slide-fade-leave-active {
    transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .slide-fade-enter,
  .slide-fade-leave-to

  /* .slide-fade-leave-active below version 2.1.8 */
    {
    transform: translateX(40px);
    opacity: 0;
  }

  // .verse-slide-fade-enter-active {
  //   transition: all .5s ease;
  // }
  // .verse-slide-fade-leave-active {
  //   transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  // }
  // .verse-slide-fade-enter, .verse-slide-fade-leave-to
  // /* .slide-fade-leave-active below version 2.1.8 */ {
  //   transform: translateX(-60px);
  //   opacity: 0;
  // }

  .text-fade-enter-active {
    transition: all .3s ease;
  }

  .text-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .text-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
  }

  .text-fade-enter {
    transform: translateY(-10px);
    opacity: 0;
  }
</style>