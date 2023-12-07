<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">Self Checkin Board Settings</div>
        <stepprogress
          class="w-step-progress-3"
          :active-thickness="4"
          :passive-thickness="4"
          :active-color="'#6baee3'"
          :passive-color="'#919bae'"
          :steps="[
            'Scan QR Code',
            'Register Face',
            'Finish',
            'Source',
            'Complete',
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
                <CCol sm="9">
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
                      accept="image/png, image/jpeg"
                      :multiple="false"
                      style="display: none"
                      @change="onLogoUploadFiles"
                    >
                  </label>
                </CCol>
                <CCol sm="6">
                  <img
                    :src="logo"
                    class="w-100 object-fit-contain background-size-cover img-default-bg"
                  >
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </template>
        <template v-if="[3].indexOf(currentSetp) >= 0">
          <CCard>
            <CCardHeader>Person Information Source</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="12">
                  <CSelect
                    v-model="selectedSource"
                    :options="list"
                    :placeholder="$t('Select')"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </template>
      </CCol>
      <CCol
        sm="5"
        v-if="[0, 1, 2, 3].indexOf(currentSetp) >= 0"
      >
        <div style="position: relative; width: 100%; padding-top: 56%;">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            <img
              :src="backgroundImage"
              style="width: 100%; height: 100%;"
            >
          </div>
        </div>
      </CCol>
      <CCol
        sm="12"
        v-if="[4].indexOf(currentSetp) >= 0"
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
          <div v-if="[1, 2, 3].indexOf(currentSetp) >= 0">
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
      if (this.currentSetp < 3) {
        this.currentSetp += 1;
      } else if (this.currentSetp === 3) {
        this.$emit('submit', {
          step1Background: this.backgroundList[0],
          step2Background: this.backgroundList[1],
          step3Background: this.backgroundList[2],
          logo: this.logo,
          entryChannel: {
            label: this.list.find((item) => item.value === this.selectedSource)?.label || '',
            value: this.selectedSource,
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
        case 3:
          return i18n.formatter.format('Next');
        case 4:
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
};
</script>

<style scoped>
/* Add your component styles here */
</style>
