import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  ellipsisMode: false,
  deviceType: '',
  deviceTypes: {
    TYPE_AIRA_TABLET_M: 'airaTablet_plus',
  },
  deviceName: '',

  persons: [],

  availableLicenseAmount: 0,
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
  // changeNotifications: (pState, payload) => {
  changeNotifications: () => {
    // console.log('changeNotifications', pState);
    // console.log('changeNotifications', new Date());
    // console.log('changeNotifications', payload);
  },

  // changeWebSocket: (pState, payload) => {
  changeWebSocket: () => {
    // console.log('changeWebSocket', new Date());
    // console.log('changeWebSocket', pState);
    // console.log('changeWebSocket', payload);
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
    // console.log('state.deviceName', state.deviceName); // stday todo
  },
};

const actions = {
  setNotifications: ({ commit }, payload) => {
    const o = JSON.parse(payload);
    // console.log('setNotifications', o);
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
