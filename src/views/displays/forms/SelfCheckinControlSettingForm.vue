<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ $t('SelfCheckinBoardSettings') }}
        </div>
        <stepprogress
          class="w-step-progress-3"
          :active-thickness="4"
          :passive-thickness="4"
          :active-color="'#6baee3'"
          :passive-color="'#919bae'"
          :steps="[
            $t('ScanQRCodeBg'),
            $t('RegisterFaceBg'),
            $t('FinishBg'),
            // $t('PersonInformationSource'),
            $t('Complete'),
          ]"
          :current-step="currentSetp"
          :line-thickness="4"
          icon-class="fa fa-check"
        />
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="6">
        <template v-if="[0, 1, 2].indexOf(currentSetp) >= 0">
          <CCard>
            <CCardHeader>{{ $t('BackgroundImage') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      :multiple="false"
                      style="display: none"
                      @change="onBackgroundUploadFiles($event, currentSetp)"
                    >
                  </label>
                </CCol>
                <CCol sm="12">
                  <img
                    :src="backgroundList[currentSetp]"
                    class="w-100 object-fit-contain background-size-cover img-default-bg"
                  >
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </template>
        <template v-if="currentSetp === 0">
          <CCard>
            <CCardHeader>{{ $t('Logo') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      :multiple="false"
                      style="display: none"
                      @change="onLogoUploadFiles"
                    >
                  </label>
                </CCol>
                <CCol sm="12">
                  <img
                    :src="logo"
                    class="object-fit-contain background-size-cover img-default-bg mx-auto"
                    style="width: 100%; height: 80px"
                  >
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </template>
      </CCol>
      <CCol
        sm="5"
        v-if="[0, 1, 2].indexOf(currentSetp) >= 0"
      >
        <div style="position: relative; width: 590px; height: 332px">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            <div
              style="position: absolute; top: 0; left: 0; width: 100%; height: 46px;
              display: flex; justify-content: space-between; align-items: center; padding: 0 15px; z-index: 2;"
            >
              <img
                :src="logo"
                style="width: 120px; height: 45px; object-fit: contain;"
              >
              <div style="font-family: 'Noto Sans'; color: white; font-size: 24px; font-weight: 300;">
                {{ currentTime }}
              </div>
            </div>
            <img
              :src="backgroundImage"
              style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 0;"
            >
            <template v-if="currentSetp === 0">
              <div
                style="position: absolute; width: 100%; top: 15%;
                display: flex; flex-direction: column; align-items: center; z-index: 1;"
              >
                <div
                  style="font-family: 'Noto Sans'; color: white; font-size: 36px; font-weight: 300;
                  font-style: italic; text-align: center;
                  text-shadow: 0px 0px 12px #FF00B0, 0px 0px 6px #47EAFF;"
                >
                  {{ $t('Welcome') }}
                </div>
                <div
                  style="font-family: 'Noto Sans'; color: white; font-size: 20px; font-weight: 300;
                  text-align: center; font-style: italic;
                  text-shadow: 0px 0px 12px #FF00B0, 0px 0px 6px #47EAFF;"
                >
                  {{ $t('PleaseHaveYourQRCodeToRegister') }}
                </div>
                <div style="position: relative; width: 132px; height: 132px; margin: 20px 0;">
                  <div style="width: 100%; height: 100%; background: #9C8A9B;" />
                  <!-- 左上角 -->
                  <div
                    style="position: absolute; top: -2px; left: -2px; width: 40px; height: 40px;
                    border-top: 4px solid #00FF00; border-left: 4px solid #00FF00;"
                  />
                  <!-- 右上角 -->
                  <div
                    style="position: absolute; top: -2px; right: -2px; width: 40px; height: 40px;
                    border-top: 4px solid #00FF00; border-right: 4px solid #00FF00;"
                  />
                  <!-- 左下角 -->
                  <div
                    style="position: absolute; bottom: -2px; left: -2px; width: 40px; height: 40px;
                    border-bottom: 4px solid #00FF00; border-left: 4px solid #00FF00;"
                  />
                  <!-- 右下角 -->
                  <div
                    style="position: absolute; bottom: -2px; right: -2px; width: 40px; height: 40px;
                    border-bottom: 4px solid #00FF00; border-right: 4px solid #00FF00;"
                  />
                </div>
              </div>
            </template>
            <template v-if="currentSetp === 1">
              <div
                style="position: absolute; width: 100%; top: 15%; left: 50%;
                transform: translate(-50%, 0); display: flex; flex-direction: column;
                align-items: center; gap: 1.5rem; z-index: 1;"
              >
                <div
                  style="font-family: 'Noto Sans'; color: white; font-size: 24px; font-weight: 300;
                  text-align: center; font-style: italic;
                  text-shadow: 0px 0px 12px #FF00B0, 0px 0px 6px #47EAFF;"
                >
                  {{ $t('PleaseLookAtTheCamera') }}
                </div>
                <div style="width: 132px; height: 132px; background: #9C8A9B;" />
                <div
                  style="padding: 5px 20px; background: linear-gradient(135deg, #76BBFF 0%, #F466D2 100%);
                  border-radius: 40px; font-family: 'Noto Sans'; color: white; font-size: 12px;
                  font-weight: 700; border: 2px solid white;"
                >
                  {{ $t('TakeThePhoto') }}
                </div>
              </div>
            </template>
            <template v-if="currentSetp === 2">
              <div
                style="position: absolute; width: 100%; top: 15%; left: 50%; transform: translate(-50%, 0);
                display: flex; flex-direction: column; align-items: center; z-index: 1;"
              >
                <!-- 頂部文字 -->
                <div
                  style="font-family: 'Noto Sans'; color: white; font-size: 24px; font-weight: 300;
                  text-align: center; font-style: italic; margin-bottom: 1.5rem;
                  text-shadow: 0px 0px 12px #FF00B0, 0px 0px 6px #47EAFF;"
                >
                  {{ $t('Welcome') }}
                </div>
                <!-- 中間內容區：照片在中間 + 右側文字 -->
                <div style="position: relative; width: 100%; display: flex; justify-content: center;">
                  <!-- 中間：人臉照片 -->
                  <div
                    style="width: 132px; height: 132px; background: #9C8A9B;
                    border: 4px solid white; border-radius: 12px;"
                  />
                  <!-- 右側：個人資訊 -->
                  <div
                    style="position: absolute; left: 65%; top: 30%;
                    display: flex; flex-direction: column; gap: 0.8rem;"
                  >
                    <div style="width: 120px; height: 20px; background: rgba(255, 255, 255, 0.3); border-radius: 4px;" />
                    <div style="width: 150px; height: 28px; background: rgba(255, 255, 255, 0.3); border-radius: 4px;" />
                  </div>
                </div>
                <!-- 底部按鈕 -->
                <div
                  style="padding: 5px 20px; background: linear-gradient(135deg, #76BBFF 0%, #F466D2 100%);
                  border-radius: 40px; font-family: 'Noto Sans'; color: white; font-size: 12px;
                  font-weight: 700; border: 2px solid white; margin: 20px 0;"
                >
                  {{ $t('GoBack') }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </CCol>
      <CCol
        sm="12"
        v-if="[3].indexOf(currentSetp) >= 0"
      >
        <CCard style="height: 400px;">
          <CCardBody class="row justify-content-center align-items-center">
            <CRow>
              <CCol sm="12">
                <div class="display-4">
                  {{ $t('Complete') }}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow style="margin-top: 16px;">
      <CCol sm="12">
        <div
          class="row justify-content-center"
          style="gap: 20px"
        >
          <div v-if="[1, 2].indexOf(currentSetp) >= 0">
            <CButton
              variant="outline"
              size="lg"
              style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
              @click="clickOnPrev"
            >
              {{ $t('Previous') }}
            </CButton>
          </div>
          <div>
            <CButton
              class="btn btn-primary mb-3"
              size="lg"
              @click="clickOnNext"
            >
              {{ nextButtonName() }}
            </CButton>
          </div>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import i18n from '@/i18n';
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import { backgroundImage, airalogo } from '@/utils/selfCheckinMode';

export default {
  name: 'SelfCheckinControlSettingForm',
  components: {
    stepprogress: StepProgress,
  },
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    list: {
      type: Array,
      default: () => ([]),
    },
  },
  data: () => ({
    objLoading: {},
    currentSetp: 0,
    step1Background: '',
    step2Background: '',
    step3Background: '',
    backgroundList: [],
    logo: '',
    selectedSource: '',
    currentTime: '',
    timeInterval: null,
  }),
  computed: {
    backgroundImage() {
      switch (this.currentSetp) {
        case 0:
          return this.backgroundList[0];
        case 1:
          return this.backgroundList[1];
        case 2:
        case 3:
        case 4:
        default:
          return this.backgroundList[2];
      }
    },
  },
  watch: {
    form: {
      handler() {
        this.initial();
      },
      deep: true,
    },
  },
  methods: {
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}`;
    },
    done() {
      this.objLoading.hide();
      this.currentSetp += 1;
    },
    initial() {
      this.selectedSource = this.form.entryChannel.value;
      this.logo = this.form.logo === '' ? airalogo : this.form.logo;
      this.backgroundList = [
        this.form.step1Background === '' ? backgroundImage : this.form.step1Background,
        this.form.step2Background === '' ? backgroundImage : this.form.step2Background,
        this.form.step3Background === '' ? backgroundImage : this.form.step3Background,
      ];
    },
    clickOnPrev() {
      if (this.currentSetp > 0) {
        this.currentSetp -= 1;
      }
    },
    clickOnNext() {
      if (this.currentSetp < 2) {
        this.currentSetp += 1;
      } else if (this.currentSetp === 2) {
        this.$emit('submit', {
          step1Background: this.backgroundList[0],
          step2Background: this.backgroundList[1],
          step3Background: this.backgroundList[2],
          logo: this.logo,
          // entryChannel: {
          //   label: this.list.find((item) => item.value === this.selectedSource)?.label || '',
          //   value: this.selectedSource,
          // },
          entryChannel: {
            label: '',
            value: '',
          },
        });
        this.objLoading = this.$loading.show({ container: this.$refs.formContainer });
      } else {
        this.currentSetp = 0;
      }
    },
    nextButtonName() {
      switch (this.currentSetp) {
        case 0:
        case 1:
        case 2:
          return i18n.formatter.format('Next');
        case 3:
        default:
          return i18n.formatter.format('Complete');
      }
    },
    onBackgroundUploadFiles(event, idx) {
      const file = event.target.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = () => {
        this.$set(this.backgroundList, idx, myReader.result);
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles(event) {
      const file = event.target.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = () => {
        this.logo = myReader.result;
      };
      myReader.readAsDataURL(file);
    },
  },
  created() {
    this.initial();
  },
  mounted() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
};
</script>

<style scoped>
  /* Add your component styles here */
</style>
