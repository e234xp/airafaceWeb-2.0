<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ $t('LiveVideoSettings') }}
        </div>
        <stepprogress
          class="w-step-progress-2"
          :active-thickness="param_activeThickness"
          :passive-thickness="param_passiveThickness"
          :active-color="param_activeColor"
          :passive-color="param_passiveColor"
          :steps="[$t('CompanyInfo'), $t('Complete')]"
          :current-step="flag_currentSetp"
          :line-thickness="param_lineThickness"
          icon-class="fa fa-check"
        />
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="6" v-show="flag_currentSetp == 0">
        <div :class="showOnStep(0)">
          <CCard>
            <CCardHeader>{{ $t('BackgroundImage') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      ref="uploadBackgroundFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onBackgroundUploadFiles"
                      :disabled="flag_backgrounduploading"
                    />
                  </label>
                </CCol>
                <CCol sm="9">
                  <img
                    id="backgroundImage"
                    :src="value_liveVideoSetting.background_image"
                    class="w-100 object-fit-contain background-size-cover img-default-bg h-col-lg"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>{{ $t('Logo') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      ref="uploadLogoFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onLogoUploadFiles"
                      :disabled="flag_logouploading"
                    />
                  </label>
                </CCol>
                <CCol sm="9">
                  <img
                    id="logoImage"
                    :src="value_liveVideoSetting.logo"
                    style="margin: auto; height: 80px; object-fit: contain; background-color: #ebedef"
                    class="w-100"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
      <CCol sm="6" v-show="flag_currentSetp == 0">
        <table
          width="590"
          height="332"
          :style="`background-image: url('${value_liveVideoSetting.background_image}')`"
          style="background-size: 100% 100%; background-repeat: no-repeat; background-position: center"
        >
          <tr>
            <td height="46">
              <img :src="`${value_liveVideoSetting.logo}`" style="width: 60px; height: 25px; padding-left: 15px" />
              <span style="float: right; padding-right: 15px; color: #ffffff">12:32</span>
              <span style="float: right; padding-right: 15px; color: #ffffff">06/13/2023</span>
            </td>
          </tr>
          <tr>
            <td align="center" valign="middle" height="100%">
              <div style="color: #ffffff; font-size: 24px; padding: 20px">
                {{ $t('LiveVideoPreview') }}
              </div>
            </td>
          </tr>
        </table>
      </CCol>

      <CCol sm="12" v-show="flag_currentSetp == 1">
        <div :class="showOnStep(1)">
          <CCard :style="param_cardStyle">
            <CCardBody>
              <div style="height: 220px" />
              <CRow>
                <CCol sm="12">
                  <p class="display-4 row justify-content-center">
                    {{ $t('Complete') }}
                  </p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="12">
        <div class="row justify-content-center">
          <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
            <CButton
              variant="outline"
              style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
              size="lg"
              @click="clickOnPrev"
            >
              {{ $t('Return') }}
            </CButton>
          </div>
          <div style="width: 20px" />
          <div>
            <CButton class="btn btn-primary mb-3" size="lg" @click="clickOnNext">
              {{ nextButtonName() }}
            </CButton>
          </div>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import { backgroundImage, airalogo } from '@/utils/occupancyMode';

export default {
  name: 'LiveVideoSettingForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,

      param_cardStyle: 'height: 35rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,

      value_Setting: {},
      value_liveVideoSetting: {
        displayMode: 'LIVEVIDEO',
        uuid: '',
        background_image: backgroundImage,
        logo: airalogo,
      },

      flag_backgrounduploading: false,
      flag_logouploading: false,

      value_returnRoutePath: '',

      flag_currentSetp: 0,

      ...this.formData,
    };
  },
  created() {},
  async mounted() {
    const self = this;
    self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

    self.$globalGetDisplaySetting((err, data) => {
      if (!err) {
        self.value_Setting = data || {};

        self.liveVideo = self.value_Setting.LIVEVIDEO;
        self.value_liveVideoSetting.uuid = self.makeid(32);

        self.value_liveVideoSetting = { ...self.value_liveVideoSetting, ...self.liveVideo };
      }

      if (self.obj_loading) self.obj_loading.hide();
    });
  },
  updated() {},
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  watch: {},
  methods: {
    makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    onBackgroundUploadFiles() {
      const self = this;

      const file = this.$refs.uploadBackgroundFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        self.value_liveVideoSetting.background_image = myReader.result;
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles() {
      const self = this;

      const file = this.$refs.uploadLogoFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        self.value_liveVideoSetting.logo = myReader.result;
      };
      myReader.readAsDataURL(file);
    },

    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('SaveChanges');
        default:
          return this.$t('Complete');
      }
    },
    clickOnPrev() {
      const self = this;
      if (self.value_returnRoutePath.length > 0) {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp === 0) {
        if (self.onFinish) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

          const sendData = {
            displayMode: 'LIVEVIDEO',
            uuid: self.value_liveVideoSetting.uuid,
            background_image: self.value_liveVideoSetting.background_image,
            logo: self.value_liveVideoSetting.logo,
          };

          self.value_Setting.LIVEVIDEO = sendData;

          self.onFinish(self.value_Setting, (success) => {
            if (self.obj_loading) self.obj_loading.hide();
            if (success) {
              self.flag_currentSetp = 1;
            } else {
              self.$fire({
                text: this.$t('Failed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          });
        } else self.flag_currentSetp = 0;
      } else {
        self.flag_currentSetp = 0;
      }
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step === this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
  },
  components: {
    stepprogress: StepProgress,
  },
};
</script>
