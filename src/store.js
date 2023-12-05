import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  ellipsisMode: false,
  deviceType: '',
  deviceTypes: {
    TYPE_AIRA_TABLET_M: 'airaFace2',
  },
  deviceName: '',

  persons: [],

  availableLicenseAmount: 0,

  deviceProfile: {
    device_type: '',
    support_wifi: false,
    support_enhance_facemask: false,
    support_rtsp: false,
    support_intercom: false,
    support_high_temp_sound_alert: false,
    support_invalid_result_show_switch: false,
    support_show_verify_indication: false,
  },
};

const mutations = {
  toggleSidebarDesktop(pState) {
    const localState = pState;
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow);
    localState.sidebarShow = sidebarOpened ? false : 'responsive';
  },
  toggleSidebarMobile(pState) {
    const localState = pState;
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow);
    localState.sidebarShow = sidebarClosed ? true : 'responsive';
  },
  set(pState, [variable, value]) {
    const localState = pState;
    localState[variable] = value;
  },

  changeNotifications: () => {

  },

  changeWebSocket: () => {

  },

  changeEllipsisMode(pState) {
    const localState = pState;
    localState.ellipsisMode = !state.ellipsisMode;
  },
  changeDeviceName() {
    switch (state.deviceType) {
      case state.deviceTypes.TYPE_AIRA_TABLET_M:
        state.deviceName = 'Tablet';
        break;
      default:
        break;
    }
  },
};

const actions = {
  setNotifications: ({ commit }, payload) => {
    const o = JSON.parse(payload);
    commit('changeNotifications', o);
  },

  setWebSocketChange: ({ commit }, payload) => {
    commit('changeWebSocket', payload);
  },
  toggleEllipsisMode: ({ commit }) => {
    commit('changeEllipsisMode');
  },
  initDeviceName({ commit }) {
    // console.log('INIT'); // stday todo
    commit('changeDeviceName');
  },

  setPersons({ commit }, payload) {
    const persons = [];
    switch (payload.monde) {
      case 'DELETE':
        commit('set', ['persons', persons]);
        break;
      default:
        commit('set', ['persons', persons]);
        break;
    }
  },

  updateTargetScore({ commit }, score) {
    commit('setTargetScore', score);
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
