import Vue from "vue"
import CoreuiVue from "@coreui/vue"
import store from './store'
import router from './router'
import { setTimeout } from "core-js"
import i18n from './i18n'
import webSocketService from '@/webSocketService'

//import sidebarNav from './containers/_nav'

Vue.use(CoreuiVue)

const TEST_MODE = true;
const _TEST_HOST = "192.168.10.101"; //測試mini的IP 
//const _TEST_HOST = "192.168.10.124"; //測試mini的IP 
const _TEST_PORT = "443"; //測試mini的PORT
const _HOST = TEST_MODE ? _TEST_HOST : window.location.hostname;
const _PORT = TEST_MODE ? _TEST_PORT : window.location.port;
const href = window.location.href.toLowerCase()

export const deviceTypes = {
  TYPE_AIRA_TABLET_M: "airaTablet_m",
};

global.usingHttps = href.includes("https://") || TEST_MODE;
if (global.usingHttps) window.apiSocketPath = "wss://" + _HOST + ":" + _PORT + "/airafacelite/verifyresults";
else window.apiSocketPath = "ws://" + _HOST + ":" + _PORT + "/airafacelite/verifyresults";

function apiServerPath() {
  if (global.usingHttps) {
    return "https://" + _HOST + ":" + _PORT;
  }
  return "http://" + _HOST + ":" + _PORT;
}

Vue.use(webSocketService, { store, reconnectInterval: 1000 });

let maintainSessionTimer = null;
let maintainSessionFailCounter = 0;
function maintainSession() {
  if (maintainSessionTimer) clearTimeout(maintainSessionTimer);
  maintainSessionTimer = null;
  maintainToken({ token: store.state.serverToken.token }, function (err, data) {
    if (err) maintainSessionFailCounter++;
    else maintainSessionFailCounter = 0;
    if (maintainSessionFailCounter < 3) {
      maintainSessionTimer = setTimeout(maintainSession, 60000);
    }
    else {
      logout();
      maintainSessionTimer = null;
      maintainSessionFailCounter = 0;
    }
  })
};

function logout() {
  store.commit("set", ["serverToken", null])
  store.commit("set", ['sidebarShow', false])
  Vue.$cookies.set("serverToken", null);
  store.commit("set", ["deviceType", null])
  Vue.$cookies.set("deviceType", null);
  router.push({ name: "Login" });
};

function getTokenString() {
  if (store.state.serverToken != null) {
    return store.state.serverToken.token;
    // let now = Date.now();
    // if (store.state.serverToken.expire + 300000 > now) {
    //   return store.state.serverToken.token;
    // }
  }
  return "";
}

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(new Error('TIMEOUT')) }, ms);
    promise.then(value => {
      clearTimeout(timer)
      resolve(value);
    }).catch(reason => {
      clearTimeout(timer)
      reject(reason);
    });
  });
}

function postJson(cgi, jsondata, cb) {
  var token = getTokenString();
  if (token.length == 0
    && cgi != "/airafacelite/generatetoken"
    && cgi != "/airafacelite/maintaintoken"
    && cgi != "/system/downloadsyslog"
    && cgi != "/system/systeminfo") {
    if (cb) cb("error", null);
    return;
  }

  const requestOptions = {
    method: "POST",
    cache: 'no-cache',
    headers: {
      "Content-Type": "application/json",
      "token": token
    },
    body: JSON.stringify(jsondata)
  };
  const FETCH_TIMEOUT = 30000;
  timeout(FETCH_TIMEOUT, fetch(apiServerPath() + cgi, requestOptions).then(response => {
    if (response.status != 200) {
      throw new Error("Bad response from server");
    }
    return response.json();
  }).then(data => {
    if (cb) cb(null, data);
  }).catch(err => {
    if (cb) cb(err ? err : "error", null);
  })).catch(error => {
    if (cb) cb(error ? error : "error", null);
  });
}

function login(accountInfo, cb) {
  postJson("/airafacelite/generatetoken", accountInfo, function (err, data) {
    if (data) {
      const serverToken = {
        username: data.username,
        expire: data.expire,
        token: data.token,
        permission: data.permission
      };

      store.commit("set", ["serverToken", serverToken]);
      Vue.$cookies.set("serverToken", serverToken);
      maintainSession();
    }
    if (cb) cb(err, data);
  });
};

function maintainToken(tokenInfo, cb) {
  postJson("/airafacelite/maintaintoken", tokenInfo, function (err, data) {
    if (err == null) {
      const serverToken = {
        username: data.username,
        expire: data.expire,
        token: data.token,
        permission: data.permission
      };
      store.commit("set", ["serverToken", serverToken]);
      //Vue.$cookies.set("serverToken", serverToken);
    }
    if (cb) cb(err, data);
  });
};

Vue.prototype.$t = function (str) { return i18n.formatter.format(str) };


Vue.prototype.$globalFindPerson = function (uuid, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid,
      slice_shift: shift,
      slice_length: sliceSize,
      download_register_image: true,
      download_display_image: true,
      download_face_feature: false
    };
    postJson("/airafacelite/findperson", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFindPersonWithoutPhoto = function (uuid, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid,
      slice_shift: shift,
      slice_length: sliceSize,
      download_register_image: false,
      download_display_image: false,
      download_face_feature: false
    };
    postJson("/airafacelite/findperson", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFindVisitor = function (uuid, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid,
      slice_shift: shift,
      slice_length: sliceSize,
      download_register_image: true,
      download_display_image: true,
      download_face_feature: false
    };
    postJson("/airafacelite/findvisitor", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFindVisitorWithoutPhoto = function (uuid, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid,
      slice_shift: shift,
      slice_length: sliceSize,
      download_register_image: false,
      download_display_image: false,
      download_face_feature: false
    };
    postJson("/airafacelite/findvisitor", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFetchPhoto = function (uuid, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid
    };
    postJson("/airafacelite/fetchphoto", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFetchVerifyPhoto = function (fid, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/fetchverifyphoto", fid, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalCreatePerson = function (person, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/createperson", person, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalCreateVisitor = function (visitor, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/createvisitor", visitor, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalRemovePerson = function (uuid, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/removeperson", { uuid: uuid }, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalRemoveVisitor = function (uuid, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/removevisitor", { uuid: uuid }, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalModifyPerson = function (person, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/modifyperson", person, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalModifyVisitor = function (visitor, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/modifyvisitor", visitor, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalGetGroupList = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/findgroup", {}, function (err, data) {
      if (cb) cb(err, data.group_list);
      resolve({ error: err, group_list: data.group_list });
    });
  });
};

Vue.prototype.$globalCreateGroup = function (group, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/creategroup", group, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalModifyGroup = function (group, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/modifygroup", group, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalRemoveGroup = function (uuid, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/removegroup", { uuid: uuid }, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalGetTabletSetting = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/gettabletsettings", {}, function (err, data) {
      if (cb) cb(err, data ? data.settings : null);
      resolve({ error: err, data: (data && data.settings) ? data.settings : null });
    });
  });
};

Vue.prototype.$globalSetTabletSetting = function (tabletSettings, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/settabletsettings", tabletSettings, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: (data && data.settings) ? data.settings : null });
    });
  });
};

Vue.prototype.$globalFetchWifiInfo = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/currentwifiinfo", {}, function (err, data) {
      if (data && data.message && data.message == "ok") {
        if (cb) cb(err, err ? null : data.info);
        resolve({ error: err, info: err ? null : data.info });
      }
      else {
        if (cb) cb("fail", null);
        resolve({ error: "fail", info: null });
      }
    });
  });
};

Vue.prototype.$globalFetchEthernetInfo = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/currentethernetinfo", {}, function (err, data) {
      if (data && data.message && data.message == "ok") {
        if (cb) cb(err, err ? null : data.info);
        resolve({ error: err, info: err ? null : data.info });
      }
      else {
        if (cb) cb("fail", null);
        resolve({ error: "fail", info: null });
      }
    });
  });
};

Vue.prototype.$globalFetchWifiList = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/fetchwifilist", {}, function (err, data) {
      if (cb) cb(err, err ? null : data.list);
      resolve({ error: err, list: err ? null : data.list });
    });
  });
};

Vue.prototype.$globalChangeWifi = function (wifiSettings, cb) {
  return new Promise((resolve) => {
    postJson("/system/changewifi", wifiSettings, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalChangeEthernet = function (ethernetSettings, cb) {
  return new Promise((resolve) => {
    let path = "";
    let query = {};
    if (ethernetSettings.dhcp) {
      path = "/system/enableethernetdhcp";
    }
    else {
      query = {
        ip_address: ethernetSettings.ip_address,
        mask: ethernetSettings.mask,
        gateway: ethernetSettings.gateway,
        dns: ethernetSettings.dns
      };
      path = "/system/enableethernetstatic";
    }
    postJson(path, query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalFetchSupportedTimezoneList = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/supportedtimezonelist", {}, function (err, data) {
      if (cb) cb(err, err ? null : data.list);
      resolve({ error: err, list: err ? null : data.list });
    });
  });
};

Vue.prototype.$globalFetchTimeInfo = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/timeinfo", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalEnableNtp = function (settings, cb) {
  return new Promise((resolve) => {
    postJson("/system/enablentp", settings, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalSyncTime = function (settings, cb) {
  return new Promise((resolve) => {
    postJson("/system/synctime", settings, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalFactoryDefault = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/factorydefault", {}, function (err, data) {
      postJson("/system/restart", {}, function (err, data) {
        if (cb) cb(err, err ? null : data);
        resolve({ error: err, data: err ? null : data });
      });
    });
  });
};

Vue.prototype.$globalRestartDevice = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/restart", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalDownloadDbPath = function () {
  return apiServerPath() + "/system/downloaddb";
};

Vue.prototype.$globalUploadDbPath = function () {
  return apiServerPath() + "/system/uploaddb";
};

Vue.prototype.$globalUpgradeSwPath = function () {
  return apiServerPath() + "/system/upgradefw";
};

Vue.prototype.$globalSetServerToken = function (serverToken) {
  store.commit("set", ["serverToken", serverToken])
};

Vue.prototype.$globalSetSidebarShow = function (show) {
  store.commit("set", ['sidebarShow', show])
};

Vue.prototype.$globalGotoRootPage = function (page, cb) {
  if (getTokenString().length > 0) {
    switch (page) {
      case "Setting": router.push({ name: "PersonDailyAttendanceReport" }); break;
      case "Welcome": router.push({ name: "DashboardWelcome" }); break;
      case "Occupancy": router.push({ name: "DashboardOccupancy" }); break;
      case "Capacity": router.push({ name: "DashboardCapacity" }); break;
    }
  }
  else {
    store.commit("set", ['sidebarShow', false])
    logout();
  }
  if (cb) cb();
};

Vue.prototype.$globalServerTokenInfo = function () {
  return (getTokenString().length > 0) ? store.state.serverToken : null;
};

Vue.prototype.$globalServerTokenIsEffective = function () {
  return (getTokenString().length > 0);
};

Vue.prototype.$globalFetchAccountList = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/findaccount", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalCreateAccount = function (account, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/createaccount", account, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalModifyAccount = function (account, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/modifyaccount", account, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalRemoveAccount = function (uuidList, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/removeaccount", uuidList, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalLogin = function (accountInfo, cb) {
  return new Promise((resolve) => {
    login(accountInfo, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalLogout = function (cb) {
  return new Promise((resolve) => {
    logout();
    if (cb) cb();
    resolve();
  });
};

Vue.prototype.$globalMaintainSession = function () {
  if (maintainSessionTimer == null) maintainSession();
};

Vue.prototype.$globalFetchSupportedlanguagelist = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/supportedlanguagelist", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalChangeLanguage = function (lang, cb) {
  return new Promise((resolve) => {
    postJson("/system/changelanguage", lang, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetEventSetting = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/geteventsettings", {}, function (err, data) {
      if (cb) cb(err, data ? data.settings : []);
      resolve({ error: err, data: data ? data.settings : [] });
    });
  });
};

Vue.prototype.$globalSetEventSetting = function (setting, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/seteventsettings", setting, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalQuerySystemLog = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/querysystemlog", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetDisplaySetting = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/getdashboardsettings", {}, function (err, data) {
      if (cb) cb(err, data ? data.settings : {});
      resolve({ error: err, data: data ? data.settings : {} });
    });
  });
};

Vue.prototype.$globalSetDisplaySetting = function (setting, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/setdashboardsettings", setting, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetPersonResult = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/querypersonverifyresult", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetVisitorResult = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/queryvisitorverifyresult", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalPersonVerifyResult = function (uuidList, startTime, endTime, shift, sliceSize, cb) {

  return new Promise((resolve) => {
    const query = {
      start_time: startTime,
      end_time: endTime,
      slice_shift: shift,
      slice_length: sliceSize,
      with_image: false,
      uuid_list: uuidList
    };

    postJson("/airafacelite/querypersonverifyresult", query, function (err, data) {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
  });
};
Vue.prototype.$globalManualClockin = function (submitData, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/manualclockin", submitData, function (err, data) {
      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
  });
};

Vue.prototype.$globalManualClockinResult = function (uuidList, startTime, endTime, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      start_time: startTime,
      end_time: endTime,
      slice_shift: shift,
      slice_length: sliceSize,
      uuid_list: uuidList
    };

    postJson("/airafacelite/querymanualclockinresult", query, function (err, data) {

      if (cb) cb(err, err ? null : data.result);
      resolve({ error: err, data: err ? null : data.result });
    });
  });
};

Vue.prototype.$globalGetVisitorResult = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/queryvisitorverifyresult", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetStrangerResult = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/querystrangerverifyresult", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetAttendanceSettings = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/getattendancesettings", {}, function (err, data) {
      if (cb) cb(err, err ? null : data.settings);
      resolve({ error: err, data: err ? null : data.settings });
    });
  });
};

Vue.prototype.$globalSetAttendanceSettings = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/setattendancesettings", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetSystemInfo = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/systeminfo", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetTokenString = function () {
  return getTokenString();
};

Vue.prototype.$globalTriggerRelay1 = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/triggerrelay1", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalTriggerRelay2 = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/triggerrelay2", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalCheckDbBackupFile = function (cb) {
  return new Promise((resolve) => {
    postJson("/system/checkdbbackupfile", {}, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGenerateDbBackup = function (query, cb) {
  return new Promise((resolve) => {
    postJson("/system/generatedbbackup", query, function (err, data) {
      if (cb) cb(err, err ? null : data);
      resolve({ error: err, data: err ? null : data });
    });
  });
};

Vue.prototype.$globalGetAiraManagerSetting = function (cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/getmanagersettings", {}, function (err, data) {
      if (cb) cb(err, data ? data.settings : null);
      resolve({ error: err, data: (data && data.settings) ? data.settings : null });
    });
  });
};

Vue.prototype.$globalSetAiraManagerSetting = function (managerSettings, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/setmanagersettings", managerSettings, function (err, data) {
      if (cb) cb(err);
      resolve(err);
    });
  });
};

Vue.prototype.$globalRemoveCameras = function (uuid, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/removecamera", { uuid: uuid }, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalCreateCameras = function (camera, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/createcamera", camera, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

// Vue.prototype.$globalManualClockin = function (submitData, cb) {
//   return new Promise((resolve) => {
//     postJson("/airafacelite/manualclockin", submitData, function (err, data) {
//       if (cb) cb(err, err ? null : data.result);
//       resolve({ error: err, data: err ? null : data.result });
//     });
//   });
// };

Vue.prototype.$globalModifyCameras = function (camera, cb) {
  return new Promise((resolve) => {
    postJson("/airafacelite/modifycamera", camera, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};

Vue.prototype.$globalFindCameras = function (uuid, shift, sliceSize, cb) {
  return new Promise((resolve) => {
    const query = {
      uuid: uuid,
      slice_shift: shift,
      slice_length: sliceSize
    };
    postJson("/airafacelite/findcamera", query, function (err, data) {
      if (cb) cb(err, data);
      resolve({ error: err, data: data });
    });
  });
};