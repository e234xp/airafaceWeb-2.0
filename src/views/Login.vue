<template>
  <div style="display: flex; align-items: center; margin-top: calc((100vh - 650px) / 2)">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol class="login-container">
          <CCard class="p-3">
            <CCardHeader>
              <h1>{{ disp_title }}</h1>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <p class="text-muted">
                  {{ disp_subtitle }}
                </p>
                <CInput :placeholder="disp_username" v-model="value_username">
                  <template #prepend-content>
                    <CIcon name="cil-user" />
                  </template>
                </CInput>
                <CInput
                  :placeholder="disp_password"
                  v-model="value_password"
                  :type="flag_view_password ? 'text' : 'password'"
                >
                  <template #prepend-content>
                    <CIcon name="cil-lock-locked" />
                  </template>
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0 0.275rem 0 0.275rem">
                      <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>

                <CSelect
                  :options="$options.languageOptions"
                  :value="value_lang"
                  @update:value="
                    (value) => {
                      setLangChange(value);
                    }
                  "
                >
                  <template #prepend-content>
                    <CIcon name="cil-speech" />
                  </template>
                </CSelect>

                <CSelect :value.sync="value_displayMode" :options="value_displayModeOptions">
                  <template #prepend-content>
                    <CIcon name="cil-laptop" />
                  </template>
                </CSelect>
                <CRow>
                  <CCol col="12" class="text-left">
                    <CSwitch
                      size="sm"
                      class="ml-0"
                      color="success"
                      shape="pill"
                      @update:checked="switchRememberMe()"
                      :checked="value_rememberMe"
                    />
                    <span
                      v-if="value_rememberMe"
                      style="position: absolute; left: 60px; top: -1px; font-size: 15px; color: #00c861"
                    >
                      {{ disp_rememberMe }}
                    </span>
                    <span v-else style="position: absolute; left: 60px; top: -1px; font-size: 15px; color: gray">
                      {{ disp_rememberMe }}
                    </span>
                    <div style="height: 10px" />

                    <CRow>
                      <CCol col="12" class="text-center">
                        <CButton
                          style="width: 140px; color: #20a8d8; border: 1px solid #20a8d8"
                          :disabled="value_username === '' || value_password === ''"
                          @click="clickOnLogin"
                        >
                          {{ disp_title }}
                        </CButton>
                      </CCol>
                      <CCol col="6" class="text-right" style="padding-top: 8px" />
                    </CRow>
                    <div class="forget-password" @click="onForget">{{ $t('ForgotPassword') }}?</div>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
            <CCardFooter>
              <span style="color: gray; float: right"> {{ disp_versionInfo }}</span>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import i18n from '@/i18n';
import Vue from 'vue';
import VXETable from 'vxe-table';
import store from '@/store';
import XEUtils from 'xe-utils';

import localeEn from 'vue2-datepicker/locale/en';
import localeTw from 'vue2-datepicker/locale/zh-tw';
import localeJP from 'vue2-datepicker/locale/ja';
import localeEs from 'vue2-datepicker/locale/es';
import localeFr from 'vue2-datepicker/locale/fr';
import localeVi from 'vue2-datepicker/locale/vi';
import localeId from 'vue2-datepicker/locale/id';
import localeTh from 'vue2-datepicker/locale/th';
import localeTr from 'vue2-datepicker/locale/tr';
import localeKo from 'vue2-datepicker/locale/ko';
import localePt from 'vue2-datepicker/locale/pt';

import zhTW from 'vxe-table/lib/locale/lang/zh-TW';
import enUS from 'vxe-table/lib/locale/lang/en-US';
import jaJP from 'vxe-table/lib/locale/lang/ja-JP';
import esES from 'vxe-table/lib/locale/lang/es-ES';
import viVN from 'vxe-table/lib/locale/lang/vi-VN';

export default {
  name: 'Login',
  languageOptions: [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'es', label: 'español' },
    { value: 'fr', label: 'Français' },
    { value: 'th', label: 'แบบไทย' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'ko', label: '한국어' },
    { value: 'pt', label: 'Português' },
  ],
  data() {
    return {
      flag_view_password: false,

      value_username: '',
      value_password: '',
      value_displayMode: 'Setting',
      value_lang: 'en',
      value_rememberMe: false,
      value_disbleLoginButton: true,

      disp_title: i18n.formatter.format('LoginTitle'),
      disp_subtitle: i18n.formatter.format('LoginSubtitle'),
      disp_username: i18n.formatter.format('LoginUsername'),
      disp_password: i18n.formatter.format('LoginPassword'),
      disp_login: i18n.formatter.format('Login'),
      disp_loginfailed: i18n.formatter.format('Failed'),
      disp_UsernameorPasswordError: i18n.formatter.format('UsernameorPasswordError'),
      disp_rememberMe: i18n.formatter.format('RememberMe'),
      disp_versionInfo: '',
      disp_versionNumber: '',

      value_displayModeOptions: [
        { value: 'Setting', label: i18n.formatter.format('Setup_Mode') },
        { value: 'Welcome', label: i18n.formatter.format('Welcome_Mode') },
        { value: 'Occupancy', label: i18n.formatter.format('MenuAttendanceBoard') },
        { value: 'Capacity', label: i18n.formatter.format('MenuOccupancyBoard') },
        { value: 'Guard', label: i18n.formatter.format('GuardBoard') },
        { value: 'SelfCheckin', label: i18n.formatter.format('SelfCheckin') },
        { value: 'LiveVideo', label: i18n.formatter.format('LiveVideo_Mode') },
        // { value: 'AlcoholCheckin', label: '人員辨識與酒測系統' },
      ],
    };
  },
  computed: {},
  beforeRouteEnter(to, from, next) {
    if (to.name === 'Login') {
      next((vm) => {
        vm.$globalLogout();
      });
    } else next();
  },
  mounted() {
    const self = this;
    const rememberMe = Vue.$cookies.get('remember_me');
    if (rememberMe) {
      self.value_rememberMe = rememberMe.remember;
      self.value_username = rememberMe.user;
      self.value_password = rememberMe.pass;
    } else {
      self.value_rememberMe = false;
      self.value_username = '';
      self.value_password = '';
    }

    const selectedLang = Vue.$cookies.get('selectedLang');
    if (selectedLang) {
      self.value_lang = selectedLang;
      self.setLangChange(self.value_lang);
    }

    self.getversionInfo();

    document.querySelector('style').textContent +=
      '@media screen and (max-width:992px) { ' +
      '.c-wrapper { max-width: 100% !important; margin-left: 0px; } ' +
      '.c-sidebar { margin-left: -256px !important; } ' +
      '.backdrop { display: none !important; } ' +
      '}';
  },

  methods: {
    getversionInfo() {
      const self = this;
      self.value_disbleLoginButton = true;
      self.$globalGetSystemInfo((err, data) => {
        if (data) {
          // self.disp_versionNumber = data.fw_version;
          self.disp_versionInfo = `${i18n.formatter.format('VersionNumber')} : ${
            data.fw_version === 'unknown' ? '' : `${data.fw_version}/`
          } ${global.webVersion}`;
          self.value_disbleLoginButton = false;

          for (let i = 0; i < self.$profileLists.length; i += 1) {
            if (self.$profileLists[i].device_type === data.device_type) {
              document.title = self.$profileLists[i].device_type;

              // store.commit('set', ['deviceProfile', self.$profileLists[i]]);
              // console.log('getversionInfo', store.state.deviceProfile);

              localStorage.setItem('deviceProfile', JSON.stringify(self.$profileLists[i]));
              console.log('getversionInfo', JSON.parse(localStorage.getItem('deviceProfile')));
              break;
            }
          }
        }
      });
    },
    switchRememberMe() {
      this.value_rememberMe = !this.value_rememberMe;
    },
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },
    setLangChange(lang) {
      i18n.locale = lang;
      Vue.$cookies.set('selectedLang', lang);
      switch (lang) {
        case 'zh':
          VXETable.setup({
            i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhTW, key), args),
          });
          Vue.prototype.$globalDatePickerLanguage = localeTw;
          break;
        case 'ja':
          VXETable.setup({
            i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(jaJP, key), args),
          });
          Vue.prototype.$globalDatePickerLanguage = localeJP;
          break;
        case 'es':
          VXETable.setup({
            i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(esES, key), args),
          });
          Vue.prototype.$globalDatePickerLanguage = localeEs;
          break;
        case 'vi':
          VXETable.setup({
            i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(viVN, key), args),
          });
          Vue.prototype.$globalDatePickerLanguage = localeVi;
          break;
        case 'fr':
          Vue.prototype.$globalDatePickerLanguage = localeFr;
          break;
        case 'id':
          Vue.prototype.$globalDatePickerLanguage = localeId;
          break;
        case 'th':
          Vue.prototype.$globalDatePickerLanguage = localeTh;
          break;
        case 'tr':
          Vue.prototype.$globalDatePickerLanguage = localeTr;
          break;
        case 'ko':
          Vue.prototype.$globalDatePickerLanguage = localeKo;
          break;
        case 'pt':
          Vue.prototype.$globalDatePickerLanguage = localePt;
          break;
        case 'en':
        default:
          VXETable.setup({
            i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(enUS, key), args),
          });
          Vue.prototype.$globalDatePickerLanguage = localeEn;
          break;
      }

      this.disp_title = i18n.formatter.format('LoginTitle');
      this.disp_subtitle = i18n.formatter.format('LoginSubtitle');
      this.disp_username = i18n.formatter.format('LoginUsername');
      this.disp_password = i18n.formatter.format('LoginPassword');
      this.disp_login = i18n.formatter.format('Login');
      this.disp_loginfailed = i18n.formatter.format('Failed');
      this.disp_UsernameorPasswordError = i18n.formatter.format('UsernameorPasswordError');
      this.disp_rememberMe = i18n.formatter.format('RememberMe');
      // this.disp_versionInfo = `${i18n.formatter.format('VersionNumber')} : ${this.disp_versionNumber}`;
      this.value_displayModeOptions = [
        { value: 'Setting', label: i18n.formatter.format('Setup_Mode') },
        { value: 'Welcome', label: i18n.formatter.format('Welcome_Mode') },
        { value: 'Occupancy', label: i18n.formatter.format('MenuAttendanceBoard') },
        { value: 'Capacity', label: i18n.formatter.format('MenuOccupancyBoard') },
        { value: 'Guard', label: i18n.formatter.format('GuardBoard') },
        { value: 'SelfCheckin', label: i18n.formatter.format('SelfCheckin') },
        { value: 'LiveVideo', label: i18n.formatter.format('LiveVideo_Mode') },
        // { value: 'AlcoholCheckin', label: '辨識與酒精偵測' },
      ];
    },
    clickOnLogin() {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
      self.$globalLogin(
        {
          username: self.value_username,
          password: self.value_password,
        },
        async (err) => {
          console.log(err);
          if (self.obj_loading) self.obj_loading.hide();
          if (err) {
            self.$globalLogout();
            self.$fire({
              text: self.disp_UsernameorPasswordError,
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          } else {
            // Set Cookie
            Vue.$cookies.set('remember_me', {
              remember: self.value_rememberMe,
              user: self.value_rememberMe ? self.value_username : '',
              pass: self.value_rememberMe ? self.value_password : '',
            });

            // Get License Amount
            const lic = await self.$globalGetLicenseList();
            if (lic.data) {
              if (lic.data.data_list) {
                let availableLicenseAmount = 0;
                localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
                lic.data.data_list.forEach((item) => {
                  if (item.trial_days >= 0) {
                    if (new Date(item.trial_end_time) > new Date()) {
                      availableLicenseAmount += +item.channel_amount;
                      localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
                    }
                  } else {
                    availableLicenseAmount += +item.channel_amount;
                    localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
                  }
                });
              }
            }

            // Get Camera Used Amount
            let cameraUsed = 0;
            const cam = await self.$globalFindCameras('', 0, 3000);
            if (cam.data) {
              cameraUsed = cam.data.list.length;
            }
            localStorage.setItem('cameraUsed', cameraUsed);

            // Get Tablet Used Amount
            let tabletUsed = 0;
            const tab = await self.$globalGetTabletList('', 0, 3000);
            if (tab.data) {
              tabletUsed = tab.data.data_list.length;
            }
            localStorage.setItem('tabletUsed', tabletUsed);

            // Save Display Mode
            sessionStorage.setItem('displayMode', self.value_displayMode);
            self.$globalSetSidebarShow(self.value_displayMode === 'Setting');

            // Goto Default Page
            store.commit('set', ['loginRedirect', true]);
            self.$globalGotoRootPage(self.value_displayMode);
          }
        },
      );
    },
    onForget() {
      this.$router.push('/forgetpassword');
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/variables.scss';

.forget-password {
  cursor: pointer;
  text-align: right;
  font-size: 15px;
  color: gray;

  &:hover {
    color: $dashboard-danger-light;
  }
}
</style>
