import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  ellipsisMode: false,
  deviceType: "",
  deviceTypes: {
    TYPE_AIRA_TABLET_M: "airaTablet_m",
  },
  deviceName: "",

  persons: [],

  //設備管理用
  targetScore: '',
  captureInterval: '', 
  faceMinimumSize: '',

  //Video Source
  value_deviceTypes: "",
  IpAddress: "",
  Port: "",
  Username: "",
  Password:"",
  Parameters:"",
}

const mutations = {
  toggleSidebarDesktop(state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  toggleSidebarMobile(state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  set(state, [variable, value]) {
    state[variable] = value
  },
  changeNotifications: (state, payload) => {
    // console.log("changeNotifications" , new Date()) ;
    // console.log("changeNotifications" , payload) ;
  },
  changeEllipsisMode(state) {
    state.ellipsisMode = !state.ellipsisMode;
  },
  changeDeviceName(state) {
    switch (state.deviceType) {
      case state.deviceTypes.TYPE_AIRA_TABLET_M:
        state.deviceName = "Tablet"
        break;
    }
    console.log("state.deviceName", state.deviceName); // stday todo
  },

  //設備管理用
  setTargetScore(state, score) {
    state.targetScore = score; // 設定狀態的值
  },
  setCaptureInterval(state, value) {
    state.captureInterval = value; 
  },
  setFaceMinimumSize(state, value) {
    state.faceMinimumSize = value; 
  },

  // Video Source
  setDeviceTypes(state, value) {
    state.value_deviceTypes = value; 
  },

  setIpAddress(state, value) {
    state.IpAddress = value; 
  },

  setPort(state, value) {
    state.Port = value; 
  },

  setUsername(state, value) {
    state.Username = value; 
  },

  setPassword(state, value) {
    state.Password = value; 
  },

  setParameters(state, value) {
    state.Parameters = value; 
  },
  

}

const actions = {
  setNotifications: ({ commit }, payload) => {
    let o = JSON.parse(payload);
    // {
    //   "timestamp":1630484589304,
    //   "verify_mode": "PASS_MODE",
    //   "face_image": "/9j/4AAQSkZJRgAMaSfu08h/qI//2Q==",
    //   "is_stranger": false,
    //   "is_person": true,
    //   "person": {
    //       "uuid": "3d84b9fe-1819-4cb4-bf6f-a07f3030718a",
    //       "id": "t1111",
    //       "name": "Ken",
    //       "card_facility_code": "",
    //       "card_number": "",
    //       "group_list": [
    //           "BLACKLIST"
    //       ],
    //       "extra_info": {
    //           "title": "",
    //           "department": "",
    //           "email": "",
    //           "phone_number": "",
    //           "extension_number": "",
    //           "remarks": ""
    //       },
    //       "display_image": "",
    //       "register_image": "/9j/4AAQSkZJRgABAQoAewGP/2Q==",
    //       "face_feature": "[]",
    //       "begin_date": 1628438400000,
    //       "expire_date": 0,
    //       "create_date": 1628488340504,
    //       "last_modify_date": 1629691700474,
    //       "___id": "T000054R000002",
    //       "___s": true,
    //       "score": 0.24067128,
    //       "is_person_not_visitor": true,
    //       "match": false
    //   },
    //   "foreHead_temperature": 0,
    //   "is_high_temperature": false
    // }


    commit('changeNotifications', o)

  },
  toggleEllipsisMode: ({ commit }, payload) => {
    commit("changeEllipsisMode");
  },
  initDeviceName({ commit }, payload) {
    console.log("INIT"); // stday todo
    commit("changeDeviceName");
  },

  setPersons({ commit }, payload) {
    let persons = [];
    switch (payload.monde) {
      case "DELETE":
        commit('set', ['persons', persons]);
        break;
      default:
        commit('set', ['persons', persons]);
        break;
    }
  },

  //設備管理用
  updateTargetScore({ commit }, score) {
    commit('setTargetScore', score);
  },
}

//設備管理用
const getters = {
  getTargetScore(state) {
    return state.targetScore;
  },
  getFaceMinimumSize(state) {
    return state.faceMinimumSize;
  },
  getCaptureInterval(state) {
    return state.captureInterval;
  },

  // Video Source
  getDeviceTypes(state) {
    return state.value_deviceTypes;
  },

  getIpAddress(state) {
    return state.IpAddress;
  },

  getPort(state) {
    return state.Port;
  },

  getUsername(state) {
    return state.Username;
  },

  getPassword(state) {
    return state.Password;
  },

  getParameters(state) {
    return state.Parameters;
  },

};



export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})