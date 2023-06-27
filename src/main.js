import 'core-js/stable'
import 'regenerator-runtime/runtime';

import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import { iconsSet as icons } from './assets/icons/icons.js'
import store from './store'
import i18n from './i18n'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import VueSimpleAlert from "vue-simple-alert";
import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import VueCookies from 'vue-cookies'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-element/dist/style.css'

import ElementUI from 'element-ui'
import { ElInput, ElSwitch } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import DatePicker from 'vue2-datepicker';
import "../src/airacss/vue2-datepicker.css";
//import 'vue2-datepicker/index.css';
import datepickerLang_En from 'vue2-datepicker/locale/en';
import datepickerLang_Tw from 'vue2-datepicker/locale/zh-tw';
import datepickerLang_Ja from 'vue2-datepicker/locale/ja';

import "./globalParams.js"

Vue.config.performance = true


Vue.use(CoreuiVue)
Vue.use(VueSimpleAlert);
Vue.use(VueCookies)
Vue.use(VXETable)
VXETable.use(ElInput)
VXETable.use(ElSwitch)
Vue.use(ElementUI)
Vue.use(DatePicker)
Vue.use(VueLoading, { color: '#6baed7' });

import zhTW from 'vxe-table/lib/locale/lang/zh-TW'
import enUS from 'vxe-table/lib/locale/lang/en-US'
import jaJP from 'vxe-table/lib/locale/lang/ja-JP'

Vue.prototype.$log = console.log.bind(console)

new Vue({
  el: '#app',
  router,
  store,
  icons,
  i18n,
  template: '<App/>',
  components: {
    App
  },
  watch: {
    $route(to, from) {
      if (this.$globalServerTokenIsEffective()) {
      }
      else router.push("/login");
    }
  },
  beforeCreate: function () {

  },
  created() {

    Vue.prototype.$globalAiraManagerSettings = {
      manager_enable: false,
      manager_host: "",
      manager_port: 8443
    };

    // 多國語言
    let browserLanguage = enUS;
    let lang = Vue.$cookies.get("selectedLang");
    switch (lang) {
      case "zh": {
        i18n.locale = "zh";
        browserLanguage = zhTW;
        Vue.prototype.$globalDatePickerLanguage = datepickerLang_Tw;
      } break;
      case "en": {
        i18n.locale = "en";
        browserLanguage = enUS;
        Vue.prototype.$globalDatePickerLanguage = datepickerLang_En;
      } break;
      case "ja": {
        i18n.locale = "ja";
        browserLanguage = jaJP;
        Vue.prototype.$globalDatePickerLanguage = datepickerLang_Ja;
      } break;
      default: {
        if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('ja')) {
          i18n.locale = 'ja';
          browserLanguage = jaJP;
          Vue.prototype.$globalDatePickerLanguage = datepickerLang_Ja;
        } else if ((navigator.language || navigator.browserLanguage).toLowerCase().includes('zh-tw')) {
          i18n.locale = 'zh';
          browserLanguage = zhTW;
          Vue.prototype.$globalDatePickerLanguage = datepickerLang_Tw;
        } else {
          i18n.locale = 'en';
          browserLanguage = enUS;
          Vue.prototype.$globalDatePickerLanguage = datepickerLang_En;
        }
      } break;
    }
    VXETable.setup({
      i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(browserLanguage, key), args)
    });


    try {
      const serverToken = Vue.$cookies.get("serverToken");
      store.commit('set', ['serverToken', serverToken]);
      Vue.$cookies.set("serverToken", null);

      const deviceType = Vue.$cookies.get("deviceType");
      store.commit('set', ['deviceType', deviceType]);
      store.dispatch('initDeviceName');
      Vue.$cookies.set("deviceType", null);
      if (this.$globalServerTokenIsEffective()) {
        if (serverToken) {
          this.$globalMaintainSession();
          this.$globalGetAiraManagerSetting(function (err, data) {
            if (!err) {
              Vue.prototype.$globalAiraManagerSettings = Object.assign({}, data);
            }
          });
        }
      }
      else this.$globalLogout();
    }
    catch (e) {
      store.commit('set', ['serverToken', null])
    }
  },
  beforeMount: function () {
  },
  mounted: function () {
  },
  beforeUpdate: function () {
  },
  updated: function () {
  }
})


