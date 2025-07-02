import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Vue from 'vue';
import CoreuiVue from '@coreui/vue';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all';
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import VueSimpleAlert from 'vue-simple-alert';
import XEUtils from 'xe-utils';
import VXEUI from 'vxe-pc-ui';
import VXETable from 'vxe-table';
import VueCookies from 'vue-cookies';
import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import 'vxe-table-plugin-element/dist/style.css';

import ElementUI, { ElInput, ElSwitch } from 'element-ui';

import 'element-ui/lib/theme-chalk/index.css';

import DatePicker from 'vue2-datepicker';
import './airacss/vue2-datepicker.css';
// import 'vue2-datepicker/index.css';
import datePickerLangEn from 'vue2-datepicker/locale/en';
import datepickerLangTw from 'vue2-datepicker/locale/zh-tw';
import datepickerLangJa from 'vue2-datepicker/locale/ja';
import datepickerLangEs from 'vue2-datepicker/locale/es';
import datepickerLangFr from 'vue2-datepicker/locale/fr';
import datepickerLangVi from 'vue2-datepicker/locale/vi';
import datepickerLangId from 'vue2-datepicker/locale/id';
import datepickerLangTh from 'vue2-datepicker/locale/th';
import datepickerLangTr from 'vue2-datepicker/locale/tr';

import './globalParams';

import zhTW from 'vxe-table/lib/locale/lang/zh-TW';
import enUS from 'vxe-table/lib/locale/lang/en-US';
import jaJP from 'vxe-table/lib/locale/lang/ja-JP';
import i18n from '@/i18n';
import store from '@/store';
import { iconsSet as icons } from '@/assets/icons/icons';
import App from '@/App.vue';
import router from '@/router';

Vue.config.performance = true;

Vue.use(CoreuiVue);
Vue.use(VueSimpleAlert);
Vue.use(VueCookies);
Vue.use(VXEUI);
Vue.use(VXETable);
VXETable.use(ElInput);
VXETable.use(ElSwitch);
Vue.use(ElementUI);
Vue.use(DatePicker);
Vue.use(VueLoading, { color: '#6baed7' });

Vue.prototype.$log = console.log.bind(console);

const mainVue = new Vue({
  el: '#app',
  router,
  store,
  icons,
  i18n,
  template: '<App/>',
  components: {
    App,
  },
  watch: {
    $route(param) {
      if (param.path === '/forgetpassword') router.push(param.path);
      else if (!this.$globalServerTokenIsEffective()) { router.push('/login'); }
    },
  },
  beforeCreate() {

  },
  created() {
    Vue.prototype.$globalAiraManagerSettings = {
      manager_enable: false,
      manager_host: '',
      manager_port: 8443,
    };

    // 多國語言
    let browserLanguage = enUS;
    const lang = Vue.$cookies.get('selectedLang');
    switch (lang) {
      case 'zh':
        i18n.locale = 'zh';
        browserLanguage = zhTW;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangTw;
        break;
      case 'en':
        i18n.locale = 'en';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datePickerLangEn;
        break;
      case 'ja':
        i18n.locale = 'ja';
        browserLanguage = jaJP;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangJa;
        break;
      case 'es':
        i18n.locale = 'es';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangEs;
        break;
      case 'fr':
        i18n.locale = 'fr';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangFr;
        break;
      case 'th':
        i18n.locale = 'th';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangTh;
        break;
      case 'vi':
        i18n.locale = 'vi';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangVi;
        break;
      case 'id':
        i18n.locale = 'id';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangId;
        break;
      case 'tr':
        i18n.locale = 'tr';
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLangTr;
        break;

      default:
        if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('zh-tw')) {
          i18n.locale = 'zh';
          browserLanguage = zhTW;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangTw;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('ja')) {
          i18n.locale = 'ja';
          browserLanguage = jaJP;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangJa;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('es')) {
          i18n.locale = 'es';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangEs;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('fr')) {
          i18n.locale = 'fr';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangFr;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('th')) {
          i18n.locale = 'th';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangTh;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('vi')) {
          i18n.locale = 'vi';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangVi;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('id')) {
          i18n.locale = 'id';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangId;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('tr')) {
          i18n.locale = 'tr';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLangTr;
        } else {
          i18n.locale = 'en';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datePickerLangEn;
        }
        Vue.$cookies.set('selectedLang', i18n.locale);
        break;
    }

    VXETable.setup({
      i18n: (
        key, args,
      ) => XEUtils.toFormatString(XEUtils.get(browserLanguage, key), args),
    });

    try {
      const serverToken = Vue.$cookies.get('serverToken');

      // console.log("serverToken created 1", serverToken )
      store.commit('set', ['serverToken', serverToken]);
      // Vue.$cookies.set('serverToken', null);

      const deviceType = Vue.$cookies.get('deviceType');
      store.commit('set', ['deviceType', deviceType]);
      store.dispatch('initDeviceName');
      Vue.$cookies.set('deviceType', null);
      if (this.$globalServerTokenIsEffective()) {
        if (serverToken) {
          this.$globalMaintainSession();
          this.$globalGetAiraManagerSetting((err, data) => {
            if (!err) {
              Vue.prototype.$globalAiraManagerSettings = { ...data };
            }
          });
        }
      } else this.$globalLogout();
    } catch (e) {
      store.commit('set', ['serverToken', null]);
    }
  },
  beforeMount() {
  },
  mounted() {
  },
  beforeUpdate() {
  },
  updated() {
  },
});

// console.log('main.js', mainVue);
