import Vue from 'vue';
import CoreuiVue from '@coreui/vue';

import { setTimeout } from 'core-js';
import webSocketService from '@/webSocketService';

import store from '@/store';
import router from '@/router';

import i18n from '@/i18n';

Vue.use(CoreuiVue);

/* eslint-disable */

global.webVersion = '2.00.01.240819';

const TEST_MODE = process.env.NODE_ENV === 'development';
// const TEST_HOST = '192.168.10.95'; // airaTablet_plus
// const TEST_HOST = '192.168.10.46'; // airaTablet_xs
const TEST_HOST = '192.168.10.86'; // airaFace2
// const TEST_HOST = '192.168.10.57'; // solution day

const TEST_PORT = '443'; // 測試mini的PORT
const HOST = TEST_MODE ? TEST_HOST : window.location.hostname;
const PORT = TEST_MODE ? TEST_PORT : window.location.port;
const href = window.location.href.toLowerCase();

const listParmeters = { uuid: '', slice_shift: 0, slice_length: 2500 };
Vue.use(webSocketService, { store, reconnectInterval: 1000 });

Vue.prototype.$t = (str) => i18n.formatter.format(str);

export default {};

Vue.prototype.$deviceProfile = {
  device_type: '',
  support_wifi: false,
  support_enhance_facemask: false,
  support_rtsp: false,
  support_intercom: false,
  support_high_temp_sound_alert: false,
  support_invalid_result_show_switch: false,
  support_show_verify_indication: false,
};

Vue.prototype.$profileLists = [
  {
    device_type: 'airaTablet_plus',
    support_temperature: true,

    support_wifi: true,

    support_relay1: true,
    support_relay2: true,
    support_custom_start_end_sign: true,

    support_enhance_facemask: true,
    support_rtsp: true,
    support_intercom: true,
    support_high_temp_sound_alert: true,
    support_invalid_result_show_switch: false,
    support_show_verify_indication: true,
  },
  {
    device_type: 'airaTablet_xs',
    support_temperature: false,

    support_wifi: false,

    support_relay1: true,
    support_relay2: false,
    support_custom_start_end_sign: false,

    support_enhance_facemask: true,
    support_rtsp: false,
    support_intercom: false,
    support_high_temp_sound_alert: false,
    support_invalid_result_show_switch: true,
    support_show_verify_indication: false,
  },
  {
    device_type: 'airaFace 2',
    support_temperature: false,
    support_wifi: false,

    support_relay1: false,
    support_relay2: false,
    support_custom_start_end_sign: false,

    support_enhance_facemask: true,
    support_rtsp: true,
    support_intercom: false,
    support_high_temp_sound_alert: true,
    support_invalid_result_show_switch: false,
    support_show_verify_indication: true,
  },
];

global.usingHttps = href.includes('https://') || TEST_MODE;
// global.usingHttps = false;
if (global.usingHttps) window.apiSocketPath = `wss://${HOST}:${PORT}/airafacelite/verifyresults`;
else window.apiSocketPath = `ws://${HOST}:${PORT}/airafacelite/verifyresults`;
// window.apiSocketPath = `ws://${HOST}:80/airafacelite/verifyresults`;

console.log('globalParams.js', window.apiSocketPath);

function apiServerPath() {
  if (global.usingHttps) {
    return `https://${HOST}:${PORT}`;
  }
  return `http://${HOST}:${PORT}`;
}

let maintainSessionTimer = null;
let maintainSessionFailCounter = 0;
function maintainSession() {
  if (maintainSessionTimer) clearTimeout(maintainSessionTimer);
  maintainSessionTimer = null;
  maintainToken({ token: store.state.serverToken.token }, (err) => {
    if (err) maintainSessionFailCounter += 1;
    else maintainSessionFailCounter = 0;
    if (maintainSessionFailCounter < 3) {
      maintainSessionTimer = setTimeout(maintainSession, 60000);
    } else {
      logout();
      maintainSessionTimer = null;
      maintainSessionFailCounter = 0;
    }
  });
}

function logout() {
  store.commit('set', ['serverToken', null]);
  store.commit('set', ['sidebarShow', false]);
  Vue.$cookies.set('serverToken', null);
  store.commit('set', ['deviceType', null]);
  Vue.$cookies.set('deviceType', null);
  router.push({ name: 'Login' });
}

function getTokenString() {
  if (store.state.serverToken != null) {
    let ret = store.state.serverToken.token;

    if (!ret) {
      const serverToken = Vue.$cookies.get('serverToken');
      ret = serverToken.token;
    }

    return ret;
  }
  return '';
}

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(new Error('TIMEOUT')); }, ms);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((reason) => {
      clearTimeout(timer);
      reject(reason);
    });
  });
}

function postJson(cgi, jsondata, cb) {
  const token = getTokenString();
  if (token.length === 0
    && cgi !== '/airafacelite/generatetoken'
    && cgi !== '/airafacelite/maintaintoken'
    && cgi !== '/system/downloadsyslog'
    && cgi !== '/system/systeminfo'
    && cgi !== '/airafacelite/resetpassword'
  ) {
    if (cb) cb('error', null);
    return;
  }

  const requestOptions = {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify(jsondata),
  };
  const FETCH_TIMEOUT = 300000;
  timeout(FETCH_TIMEOUT,
    fetch(apiServerPath() + cgi, requestOptions)
      .then(
        (response) => {
          if (response.status === 401) {
            router.push({ path: '/' });
          } else if (response.status !== 200) {
            throw new Error('Bad response from server');
          }
          return response.json();
        },
      )
      .then((data) => {
        if (cb) cb(null, data);
      })
      .catch((err) => {
        if (cb) cb(err || 'error', null);
      }))
    .catch((error) => {
      if (cb) cb(error || 'error', null);
    });
}

function login(accountInfo, cb) {
  postJson('/airafacelite/generatetoken', accountInfo,
    (err, data) => {
      if (data) {
        const serverToken = {
          username: data.username,
          expire: data.expire,
          token: data.token,
          permission: data.permission,
        };

        store.commit('set', ['serverToken', serverToken]);
        Vue.$cookies.set('serverToken', serverToken);
        maintainSession();
      }
      if (cb) cb(err, data);
    });
}

function maintainToken(tokenInfo, cb) {
  postJson('/airafacelite/maintaintoken', tokenInfo,
    (err, data) => {
      if (err == null) {
        const serverToken = {
          username: data.username,
          expire: data.expire,
          token: data.token,
          permission: data.permission,
        };
        store.commit('set', ['serverToken', serverToken]);
      }
      if (cb) cb(err, data);
    });
}

Vue.prototype.$globalGetHost = () => 'http://192.168.10.119'; // http://${HOST}

Vue.prototype.$globalFindPerson = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
    download_register_image: true,
    download_display_image: true,
    download_face_feature: false,
  };
  postJson('/airafacelite/findperson', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFindPersonWithoutPhoto = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
    download_register_image: false,
    download_display_image: false,
    download_face_feature: false,
  };
  postJson('/airafacelite/findperson', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFindVisitor = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
    download_register_image: true,
    download_display_image: true,
    download_face_feature: false,
  };
  postJson('/airafacelite/findvisitor', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFindVisitorWithoutPhoto = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
    download_register_image: false,
    download_display_image: false,
    download_face_feature: false,
  };
  postJson('/airafacelite/findvisitor', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFetchPhoto = (
  uuid, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
  };
  postJson('/airafacelite/fetchphoto', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFetchVerifyPhoto = (
  fid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/fetchverifyphoto', fid,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreatePerson = (
  person, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createperson', person,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateVisitor = (
  visitor, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createvisitor', visitor,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemovePerson = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeperson', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveVisitor = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removevisitor', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyPerson = (
  person, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyperson', person,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyVisitor = (
  visitor, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyvisitor', visitor,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalGetGroupList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findgroup', {},
    (err, data) => {
      if (cb) cb(err, data.group_list);
      resolve({ error: err, group_list: data.group_list });
    });
});

Vue.prototype.$globalCreateGroup = (
  group, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/creategroup', group,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyGroup = (
  group, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifygroup', group,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveGroup = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removegroup', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalGetTabletSetting = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/gettabletsettings', {},
    (err, data) => {
      if (cb) cb(err, data ? data.settings : null);
      resolve(
        { error: err, data: (data && data.settings) ? data.settings : null },
      );
    });
});

Vue.prototype.$globalSetTabletSetting = (
  tabletSettings, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/settabletsettings', tabletSettings,
    (err, data) => {
      if (cb) cb(err, data);
      resolve(
        { error: err, data: (data && data.settings) ? data.settings : null },
      );
    });
});

Vue.prototype.$globalFetchWifiInfo = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/currentwifiinfo', {},
    (err, data) => {
      if (data && data.message && data.message === 'ok') {
        if (cb) cb(err, err ? null : data.info);
        resolve({ error: err, info: err ? null : data.info });
      } else {
        if (cb) cb('fail', null);
        resolve({ error: 'fail', info: null });
      }
    });
});

Vue.prototype.$globalFetchEthernetInfo = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/currentethernetinfo', {},
    (err, data) => {
      if (data && data.message && data.message === 'ok') {
        if (cb) cb(err, err ? null : data.info);
        resolve({ error: err, info: err ? null : data.info });
      } else {
        if (cb) cb('fail', null);
        resolve({ error: 'fail', info: null });
      }
    });
});

Vue.prototype.$globalFetchWifiList = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/fetchwifilist', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data.list);
      resolve({ error: err, list: err ? null : data.list });
    });
});

Vue.prototype.$globalChangeWifi = (
  wifiSettings, cb,
) => new Promise((resolve) => {
  postJson('/system/changewifi', wifiSettings,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalPurgeWifi = (
  wifiSettings, cb,
) => new Promise((resolve) => {
  postJson('/system/purgewifi', wifiSettings,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalChangeEthernet = (
  ethernetSettings, cb,
) => new Promise((resolve) => {
  let path = '';
  let query = {};
  if (ethernetSettings.dhcp) {
    path = '/system/enableethernetdhcp';
  } else {
    query = {
      ip_address: ethernetSettings.ip_address,
      mask: ethernetSettings.mask,
      gateway: ethernetSettings.gateway,
      dns: ethernetSettings.dns,
    };
    path = '/system/enableethernetstatic';
  }
  postJson(path, query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalFetchSupportedTimezoneList = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/supportedtimezonelist', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data.list);
      resolve({ error: err, list: err ? null : data.list });
    });
});

Vue.prototype.$globalFetchTimeInfo = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/timeinfo', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalEnableNtp = (
  settings, cb,
) => new Promise((resolve) => {
  postJson('/system/enablentp', settings,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalSyncTime = (
  settings, cb,
) => new Promise((resolve) => {
  postJson('/system/synctime', settings,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalFactoryDefault = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/factorydefault', {},
    () => {
      postJson('/system/restart', {},
        (err2, data2) => {
          if (cb) cb(err2, err2 ? null : data2);
          resolve({ error: err2, data: err2 ? null : data2 });
        });
    });
});

Vue.prototype.$globalRestartDevice = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/restart', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalRestartService = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/restartservice', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalDownloadDbPath = () => `${apiServerPath()}/system/downloaddb`;

Vue.prototype.$globalUploadDbPath = () => `${apiServerPath()}/system/uploaddb`;

Vue.prototype.$globalUpgradeSwPath = () => `${apiServerPath()}/system/upgradefw`;

Vue.prototype.$globalSetServerToken = (serverToken) => {
  store.commit('set', ['serverToken', serverToken]);
};

Vue.prototype.$globalSetSidebarShow = (show) => {
  store.commit('set', ['sidebarShow', show]);
};

Vue.prototype.$globalGotoRootPage = (page, cb) => {
  if (getTokenString().length > 0) {
    switch (page) {
      case 'Welcome': router.push({ name: 'DashboardWelcome' }); break;
      case 'Occupancy': router.push({ name: 'DashboardOccupancy' }); break;
      case 'Capacity': router.push({ name: 'DashboardCapacity' }); break;
      case 'SelfCheckin': router.push({ name: 'DashboardSelfCheckin' }); break;
      case 'AlcoholCheckin': router.push({ name: 'DashboardAlcoholCheckin' }); break;
      case 'Guard': router.push({ name: 'DashboardGuard' }); break;
      case 'Setting':
      default:
        router.push({ name: 'PersonDailyAttendanceReport' }); break;
    }
  } else {
    store.commit('set', ['sidebarShow', false]);
    logout();
  }
  if (cb) cb();
};

Vue.prototype.$globalServerTokenInfo = () => (
  (getTokenString().length > 0) ? store.state.serverToken : null);

Vue.prototype.$globalServerTokenIsEffective = () => (
  getTokenString().length > 0);

Vue.prototype.$globalFetchAccountList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findaccount', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalCreateAccount = (
  account, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createaccount', account,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalModifyAccount = (
  account, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyaccount', account,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalRemoveAccount = (
  uuidList, cb,
) => new Promise(
  (resolve) => {
    postJson('/airafacelite/removeaccount', uuidList,
      (err, data) => {
        if (cb) cb(err, err ? null : data);
        resolve({ error: err, data: err ? null : data });
      });
  },
);

Vue.prototype.$globalLogin = (
  accountInfo, cb,
) => new Promise((resolve) => {
  login(accountInfo, (err, data) => {
    if (cb) cb(err, err ? null : data);
    resolve({ error: err, data: err ? null : data });
  });
});

Vue.prototype.$globalLogout = (
  cb,
) => new Promise((resolve) => {
  logout();
  if (cb) cb();
  resolve();
});

Vue.prototype.$globalMaintainSession = () => {
  if (maintainSessionTimer == null) maintainSession();
};

Vue.prototype.$globalFetchSupportedlanguagelist = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/supportedlanguagelist', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalChangeLanguage = (
  lang, cb,
) => new Promise((resolve) => {
  postJson('/system/changelanguage', lang,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetEventSetting = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/geteventsettings', {},
    (err, data) => {
      if (cb) cb(err, data ? data.settings : []);
      resolve({ error: err, data: data ? data.settings : [] });
    });
});

Vue.prototype.$globalSetEventSetting = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/seteventsettings', setting,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalQuerySystemLog = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/querysystemlog', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetDisplaySetting = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getdashboardsettings', {},
    (err, data) => {
      if (cb) cb(err, data ? data.settings : {});
      resolve({ error: err, data: data ? data.settings : {} });
    });
});

Vue.prototype.$globalSetDisplaySetting = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/setdashboardsettings', setting,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetPersonResult = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/querypersonverifyresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetVisitorResult = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/queryvisitorverifyresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalPersonVerifyResult = (
  uuidList, startTime, endTime, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    start_time: startTime,
    end_time: endTime,
    slice_shift: shift,
    slice_length: sliceSize,
    with_image: false,
    uuid_list: uuidList,
  };

  postJson('/airafacelite/querypersonverifyresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
});

Vue.prototype.$globalManualClockin = (
  submitData, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/manualclockin', submitData,
    (err, data) => {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
});

Vue.prototype.$globalManualClockinResult = (
  uuidList, startTime, endTime, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    start_time: startTime,
    end_time: endTime,
    slice_shift: shift,
    slice_length: sliceSize,
    uuid_list: uuidList,
  };

  postJson('/airafacelite/querymanualclockinresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
});

// Vue.prototype.$globalGetVisitorResult = (
//   query, cb,
// ) => new Promise((resolve) => {
//   postJson('/airafacelite/queryvisitorverifyresult', query,
//     (err, data) => {
//       if (cb) cb(err, err ? null : data);
//       resolve({ error: err, data: err ? null : data });
//     });
// });

Vue.prototype.$globalGetStrangerResult = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/querystrangerverifyresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetAttendanceSettings = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getattendancesettings', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data.settings);
      resolve({ error: err, data: err ? null : data.settings });
    });
});

Vue.prototype.$globalSetAttendanceSettings = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/setattendancesettings', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetSystemInfo = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/systeminfo', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetTokenString = () => getTokenString();

Vue.prototype.$globalTriggerRelay1 = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/triggerrelay1', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalTriggerRelay2 = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/triggerrelay2', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalCheckDbBackupFile = (
  cb,
) => new Promise((resolve) => {
  postJson('/system/checkdbbackupfile', {},
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGenerateDbBackup = (
  query, cb,
) => new Promise((resolve) => {
  postJson('/system/generatedbbackup', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetAiraManagerSetting = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getmanagersettings', {},
    (err, data) => {
      if (cb) cb(err, data ? data.settings : null);
      resolve(
        { error: err, data: (data && data.settings) ? data.settings : null },
      );
    });
});

Vue.prototype.$globalSetAiraManagerSetting = (
  managerSettings, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/setmanagersettings', managerSettings,
    (err, data) => {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
});

Vue.prototype.$globalGetAutoLightSettings = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getautolightsettings', {},
    (err, data) => {
      if (cb) cb(err, data);
      resolve(err, data);
    });
});

Vue.prototype.$globalSetAutoLightSettings = (
  settings, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/setautolightsettings', settings,
    (err, data) => {
      if (cb) cb(err, data);
      resolve(err, data);
    });
});

// camera start
Vue.prototype.$globalRemoveCameras = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removecamera', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateCameras = (
  camera, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createcamera', camera,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyCameras = (
  camera, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifycamera', camera,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalFindCameras = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findcamera', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// 韋根
Vue.prototype.$globalFindWiegandConverters = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findwiegandconverter', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateWiegandConverter = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createwiegandconverter', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyWiegandConverter = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifywiegandconverter', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveWiegandConverters = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removewiegandconverter', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// IO Box
Vue.prototype.$globalFindIoBoxes = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findiobox', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateIoBox = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createiobox', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyIoBox = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyiobox', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveIoBoxes = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeiobox', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// VideoDevice Group
Vue.prototype.$globalFindVideoDeviceGroups = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findvideodevicegroup', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateVideoDeviceGroup = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createvideodevicegroup', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyVideoDeviceGroups = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyvideodevicegroup', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveVideoDeviceGroups = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removevideodevicegroup', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// OutputDevice Group
Vue.prototype.$globalFindOutputDeviceGroups = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findoutputdevicegroup', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCreateOutputDeviceGroup = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createoutputdevicegroup', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyOutputDeviceGroups = (
  device, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyoutputdevicegroup', device,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveOutputDeviceGroup = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeoutputdevicegroup', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});


// TODO: Delte unuse ----------------------------------------------------------------

// Tulip
Vue.prototype.$globalGetLineNotifyList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findlinecommand', listParmeters,
    (err, data) => {
      const d = {
        slice_length: data.slice_length,
        slice_shift: data.slice_shift,
        total_length: data.total_length,
        data_list: data.list,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateLineNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createlinecommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifyLineNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifylinecommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveLineNotify = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removelinecommand', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalGetMailNotifyList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findemailcommand', listParmeters,
    (err, data) => {
      const d = {
        slice_length: data.slice_length,
        slice_shift: data.slice_shift,
        total_length: data.total_length,
        data_list: data.list,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateMailNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createemailcommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifyMailNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyemailcommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveMailNotify = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeemailcommand', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalGetHttpNotifyList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findhttpcommand', listParmeters,
    (err, data) => {
      const d = {
        slice_length: data.slice_length,
        slice_shift: data.slice_shift,
        total_length: data.total_length,
        data_list: data.list,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateHttpNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createhttpcommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifyHttpNotify = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyhttpcommand', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveHttpNotify = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removehttpcommand', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalGetScheduleList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findschedule', listParmeters,
    (err, data) => {
      const d = {
        slice_length: data.slice_length,
        slice_shift: data.slice_shift,
        total_length: data.total_length,
        data_list: data.list,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateSchedule = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createschedule', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifySchedule = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyschedule', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveSchedule = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeschedule', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalGetActionRuleList = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/findrule', listParmeters,
    (err, data) => {
      const d = {
        slice_length: data.slice_length,
        slice_shift: data.slice_shift,
        total_length: data.total_length,
        data_list: data.list,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

Vue.prototype.$globalCreateActionRule = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createrule', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalModifyActionRule = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyrule', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalRemoveActionRule = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removerule', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// ----------------------------------------------------------------

// Tulip
Vue.prototype.$globalGetEventList = (
  uuid, action_type, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    action_type
  };
  postJson('/airafacelite/findeventhandle', query,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalCreateEventHandle = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createeventhandle', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifyEventHandle = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifyeventhandle', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveEventHandle = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removeeventhandle', { uuid } ,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalCameraSnapshot = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getcamerasnapshot', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalGetTabletList = (
  uuid, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    uuid,
    slice_shift: shift,
    slice_length: sliceSize,
  };
  postJson('/airafacelite/findtablet', query,
    (err, data) => {
      const d = {
        slice_length: data ? data.slice_length || 0 : 0,
        slice_shift: data ? data.slice_shift || 0 : 0,
        total_length: data ? data.total_length || 20 : 0,
        data_list: data ? data.list || [] : 0,
      };

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateTablets = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/createtablet', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalModifyTablet = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/modifytablet', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveTablets = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removetablet', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalGetLicenseList = (
  cb,
) => new Promise((resolve) => {
  const query = {};
  postJson('/airafacelite/findlicense', query,
    (err, data) => {
      let d = { data_list: [] };

      if (data) {
        d = {
          // slice_length: data.slice_length,
          // slice_shift: data.slice_shift,
          // total_length: data.total_length,
          data_list: data.license,
          trial_avaiable_for_active: data.trial_avaiable_for_active,
        };
      }

      if (cb) cb(err, d);
      resolve({ error: err, data: d });
    });
});

// Tulip
Vue.prototype.$globalCreateLicense = (
  setting, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/addlicense', setting,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

// Tulip
Vue.prototype.$globalRemoveLicenses = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/removelicense', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalDefaultLicense = (
  uuid, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/defaultlicense', { uuid },
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalVerifyCard = (
  payload, cb,
) => new Promise((resolve) => {
  postJson('/airaface/verifycardnoservice', payload,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalAddCommand = (
  payload, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/addcommands', payload,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalGetSystemSettings = (
  cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/getsystemsettings', {},
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalSetSystemSettings = (
  payload, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/setsystemsettings', payload,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalResetPassword = (
  payload, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/resetpassword', payload,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalSendNotification = (
  payload, cb,
) => new Promise((resolve) => {
  postJson('/airafacelite/sendnotification', payload,
    (err, data) => {
      if (cb) cb(err, data);
      resolve({ error: err, data });
    });
});

Vue.prototype.$globalAttendanceVerifyResult = (
  uuidList, startTime, endTime, shift, sliceSize, cb,
) => new Promise((resolve) => {
  const query = {
    start_time: startTime,
    end_time: endTime,
    slice_shift: shift,
    slice_length: sliceSize,
    with_image: false,
    uuid_list: uuidList,
  };

  postJson('/airafacelite/queryattendanceverifyresult', query,
    (err, data) => {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
});