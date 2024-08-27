<template>
  <div
    class="ratio-wrap ratio-wrap-16x9"
    v-show="!isLoadSetting"
  >
    <div
      key="dashboard"
      class="ratio-content customer-dashboard"
      :style="{backgroundImage:'url('+displaySettings.background_image+')'}"
    >
      <div class="w-100 h-100 d-flex flex-column">
        <transition
          name="fade"
          mode="out-in"
        >
          <div
            v-if="displayMode !== 'Profile'"
            class="dashboard-header d-flex justify-content-between align-items-center"
            style="margin-left: 20px; margin-right: 20px; margin-bottom: 22px;"
          >
            <el-button
              type="text"
              class="home-button"
              @click="goHome"
            >
              <svg
                class="home-icon"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="76"
                  height="76"
                  rx="38"
                  stroke="#463A2A"
                  stroke-width="4"
                />
                <path
                  d="M22 34L40 22L58 34V58H22V34Z"
                  stroke="#463A2A"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </el-button>

            <div
              class="logo-container"
              :style="{ backgroundImage: 'url(' + displaySettings.logo + ')' }"
            />

            <div
              style="flex: 1;"
              class="current-date-time text-white"
            >
              <button
                type="button"
                class="fat-button fz-super-slarge customer-primary ml-auto"
                @click="() => { drawer = true }"
              >
                <div
                  class="d-flex align-items-center justify-content-center"
                  style="gap: 0.5rem;"
                >
                  <CIcon
                    name="cil-search"
                    style="width: 2rem; height: 2rem;"
                  />
                  {{ $t('InputMobilePhoneNumberToQuery') }}
                </div>
              </button>
            </div>
          </div>
        </transition>

        <transition
          name="fade"
          mode="out-in"
        >
          <template v-if="displayMode === 'Dashboard'">
            <!-- Occupancy/Attendance 顯示人員資料列表 -->
            <div
              key="dashboard"
              class="person-card-container flex-grow-1"
            >
              <div class="grid-4x4 d-flex">
                <div
                  v-for="(person, index) in currentEntryPersons"
                  :key="index"
                  :class="[
                    'person-card',
                    'inline-block',
                    person.status === 0 ? 'normal-person-card' : '',
                    person.status === 2 ? 'abnormal-person-card' : '',
                    person.status === 1 ? 'absent-person-card' : '',
                    'person-card-4x4',
                  ]"
                  :style="'zoom: ' + zoomRatio + ' !important;'"
                  @click="handleSelectPerson(person)"
                >
                  <div
                    class="d-flex justify-content-between align-items-stretch person-image-box"
                    style="height: 100%; gap: 1.75rem;"
                  >
                    <img
                      v-show="displaySettings.displayPhoto !== 'NONE'"
                      :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                      :src="`data:image/png;base64,${displaySettings.displayPhoto === 'REGISTER' ? person.register_image : person.display_image}`"
                    >
                    <img
                      :src="`data:image/png;base64,${emptyFace}`"
                      v-show="displaySettings.displayPhoto === 'NONE'"
                    >

                    <div
                      class="flex-grow-1 w-100 h-100 overflow-hidden customer-primary d-flex flex-column justify-content-center"
                    >
                      <div
                        class="flex-grow-1 d-flex flex-column justify-content-start"
                        style="gap: 0.5rem;"
                      >
                        <div class="vip-tag fz-md fw-400">
                          {{ person.group_list.length > 0 ? person.group_list[0] : '--' }}
                        </div>
                        <div class="fz-super-slarge fw-500 lh-1 text-truncate d-block">
                          {{ getDisplayName(person) }}
                        </div>
                      </div>
                      <div
                        class="fz-super-slarge fw-500 lh-1 customer-secondary"
                      >
                        {{
                          person.clockinRecord ?
                            person.clockinRecord.timestamp ?
                              formatEpochTime(person.clockinRecord.timestamp)
                              : "&nbsp;"
                            : "&nbsp;" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-show="isLoadSetting"
                class="align-items-center"
                style="color:white"
              >
                Loading...
              </div>
            </div>
          </template>
          <template v-else-if="displayMode === 'Phone'">
            <div
              key="phone"
              class="w-100 h-100 mt-5"
            >
              <p
                class="fz-super-slarge fw-500 lh-1 customer-primary text-center"
                style="margin-bottom: 1.25rem;"
              >
                {{ $t('MobilePhoneNumberLastThreeDigits') }}
              </p>
              <p
                class="mb-0 fw-500 lh-1 customer-primary text-center"
                style="font-size: 8.75rem;"
              >
                {{ searchNumber.join('') }}
              </p>
              <div class="same-phone-card-container">
                <div
                  v-for="person in matchedPersons"
                  :key="person.uuid"
                  class="same-phone-card"
                  @click="handleSelectPerson(person)"
                >
                  <img
                    v-show="displaySettings.displayPhoto !== 'NONE'"
                    :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                    :src="`data:image/png;base64,${displaySettings.displayPhoto === 'REGISTER' ? person.register_image : person.display_image}`"
                  >
                  <img
                    :src="`data:image/png;base64,${emptyFace}`"
                    v-show="displaySettings.displayPhoto === 'NONE'"
                  >
                  <div class="flex flex-column justify-content-center align-items-center">
                    <div class="vip-tag">
                      {{ person.group_list.length > 0 ? person.group_list[0] : '--' }}
                    </div>
                    <p class="person-name">
                      {{ person.name }}
                    </p>
                    <p class="phone-number">
                      {{ person.extra_info.phone_number }}
                    </p>
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex justify-content-center h-100">
              <div
                key="profile"
                class="profile-info"
              >
                <div class="profile-info-header d-flex justify-content-between align-items-center">
                  <el-button
                    type="text"
                    :style="'zoom: ' + zoomRatio + ' !important;'"
                    @click="goHome"
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 80 80"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="76"
                        height="76"
                        rx="38"
                        stroke="#463A2A"
                        stroke-width="4"
                      />
                      <path
                        d="M22 34L40 22L58 34V58H22V34Z"
                        stroke="#463A2A"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </el-button>

                  <div
                    style="width: 120px; height: 120px;"
                    :style="'zoom: ' + zoomRatio + ' !important;'"
                  >
                    <div
                      :style="[{
                        backgroundImage:'url('+displaySettings.logo+')',
                        width: '100%',
                        height: '100%',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                      }]"
                    />
                  </div>

                  <el-button
                    type="text"
                    style="visibility: hidden;"
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 80 80"
                    />
                  </el-button>
                </div>

                <div class="d-flex flex-column justify-content-center align-items-center">
                  <img
                    v-if="displaySettings.displayPhoto !== 'NONE'"
                    class="profile-person-image"
                    :src="`data:image/png;base64,${displaySettings.displayPhoto === 'REGISTER' ? person.register_image : person.display_image}`"
                  >
                  <img
                    v-else
                    class="profile-person-image"
                    :src="`data:image/png;base64,${emptyFace}`"
                  >

                  <div
                    class="big-vip-tag fw-400"
                  >
                    {{ person.group_list.length > 0 ? person.group_list[0] : '--' }}
                  </div>

                  <p
                    class="person-name customer-primary text-truncate"
                  >
                    {{ person.name }}
                  </p>

                  <p
                    class="fw-500 customer-primary"
                    style="font-size: 3rem;"
                  >
                    {{ person.extra_info.phone_number || '--' }}
                  </p>
                </div>
              </div>

              <CustomerProfile
                :zoom-ratio="zoomRatio"
                :person="person"
                :fields="fields"
                @save="handleSave"
              />
            </div>
          </template>
        </transition>
      </div>

      <!-- 電話查詢 -->
      <el-drawer
        class="phone-drawer"
        :size="802 * zoomRatio"
        :visible.sync="drawer"
        :with-header="false"
        style="backdrop-filter: blur(16px);"
        @open="clearSearchNumber"
      >
        <div class="phone-drawer-container d-flex justify-content-center align-items-start h-100">
          <div
            class="left-container d-flex flex-column align-items-center justify-content-start h-100"
          >
            <div
              class="title fw-500 lh-1 customer-primary"
            >
              {{ $t('MobilePhoneNumberLastThreeDigits') }}
            </div>

            <!-- 顯示已按下的號碼 -->
            <div
              class="d-flex align-items-center justify-content-center my-3"
              style="gap: 1.25rem;"
            >
              <div
                class="view-box"
                v-for="(digit, index) in searchNumber"
                :key="index"
              >
                {{ digit }}
              </div>
            </div>

            <!-- 號碼輸入區 -->
            <div
              class="number-pad"
            >
              <div
                v-for="i in 9"
                :key="i"
                class="pad"
                @click="onNumberClick(i)"
              >
                {{ i }}
              </div>
              <div />
              <div
                class="pad"
                @click="onNumberClick(0)"
              >
                0
              </div>
              <div />
            </div>

            <el-button
              class="search-button fz-super-slarge fw-500 lh-1"
              :disabled="searchNumber.join('').length < 3"
              @click="handleSearch"
            >
              {{ $t('Search') }}
            </el-button>
          </div>
          <el-button
            type="text"
            style="margin: 0; padding: 0;"
            :style="'zoom: ' + zoomRatio + ' !important;'"
            @click="drawer = false"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="76"
                height="76"
                rx="38"
                stroke="#463A2A"
                stroke-width="4"
              />
              <path
                d="M24 24L56 56M56 24L24 56"
                stroke="#463A2A"
                stroke-width="6.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </el-button>
        </div>
      </el-drawer>
    </div>

    <!------------------- Footer - BEGIN ------------------>
    <div
      v-if="displayMode !== 'Profile'"
      style="position: absolute; bottom: 21px; left: 28px;"
      class="fz-xxxxxl fw-500 lh-1 customer-primary"
    >
      {{ currentTime }}
    </div>

    <div
      v-if="displayMode !== 'Profile'"
      style="position: absolute; bottom: 21px; right: 28px; gap: 1.125rem;"
      class="d-flex justify-content-center align-items-baseline"
    >
      <div class="fw-300 fz-xxxxl lh-1 text-white">
        powered by
      </div>
      <img
        src="@/assets/img/aira-logo-white.svg"
        alt=""
        style="width: auto; height: 2rem;"
      >
    </div>

    <!------------------- Footer - END ------------------>

    <div
      class="customer-loading"
      v-if="loading"
    >
      <CSpinner color="customer-primary" />
    </div>
  </div>
</template>

<script>
import { airaLogoWhite as airaLogo } from '@/utils';

import capacityModel from '@/models/CapacityDashboardModel.vue';
import { backgroundImage } from '@/utils/customerMode';
import CustomerProfile from './components/CustomerProfile.vue';

const emptyFace = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAAXNSR0IB2cksfwAAA'
  + 'AlwSFlzAAALEwAACxMBAJqcGAAAAd1QTFRF19nZztDQtbe3vL6+wsPDsbKzubq7ycvL09XV2Nray83Nh4eIWVlaXFxdW1xdYWFiaWlqcnJzfH19hoeIkpOTnp+gq6ysubu7uLm5jI2Oa2tsWlpbWllb'
  + 'Y2NkgYGCqaqq0tTUwcPDdXV2ZWVmqaurvsDAnZ6ffHx9YGBhzM7OXV1eiYqL1tjYlJWVdnZ3zc/Pk5SUcnN00NLSqKqqgoKDq6ytkZKSa2xs1dfXs7S0jY6Ppqeofn+ApKWmfX1+ra+vhoeHwMLCmJm'
  + 'Z1NbWeXp6kpOU0NHRnZ6edXZ2pqiof4CAr7GxiIiJuLq6kJGRwMHCl5iZxMXFi4yMeHl6rrCwgoODXl5fgIGClJSVrK2thIWGyMrKoKKiaWpqiouMra6vhYaHz9DQqqusfn5/X19gjo+QqKmp0dPTZG'
  + 'Rlt7m5bm9ww8XFhISFYmJjpaamfX5+qaqrp6ippKWlioqLa2xts7S1enp7XFxegICBf4CBe3t8z9HRc3N0W1tcwcLDiYmKZ2docHBxxMbGrq+vsrS0gYKDu7y9lZaXbGxtv8DAbW5vpKambG1tl5iYr'
  + 'K6ub29wmZqabm5vkZOTjo6PyszMsrOzv8HBeXp7iYqKamprsLGxoKGikJGSmJmax8nJ/5q5qgAAAudJREFUeJzt2fdXE0EQB/AlFnLxYoJYsyLRWGKMYDeKgoDYFWsU0KgUY4u9EiP2htgLYPlbvTxE'
  + '43vZmQkz8tN9/4D5vNm9vd29U8qNGzdu3LgZSZlnwsRJk8u9yrL+H2L5pth+254aCFZMq5w+Y+ascnFi9pyQnqv/iV01rzosSMxfoIsnslDMWBQwGE4WSyFLzIaOLpUxqmMAopd5BYj4cohwUlPLR1Y'
  + 'ghtYrV3GN1aih9Zo4z/ABD9bfrOUh6yiGXp/gGF5SI1pv4CAemqE3cpA6IrKJg2wmIvUcpIGIbDGXwJ+JRpuGNJlL4GvI66chDUANVLGCJMNuBGo0o61spXVSxkIqSUYAnF10vFpISAissQ1DtpOQHW'
  + 'ANdL/ZSUJ2gTXQrXM3CdkDF8EmZS8J2QcXCSNIK2nJ74eLIJNy4CAJOXQYrIKslCOk0dI6ia84Y6waImJzjkVHiYif0Yk6RkRCnDtLGxFpZxiqg4gc5yDqBMmwW1lIioREWIc7dZKEnGIZ6jR4NxlNJ'
  + 'w9RXQSjG9p9KaEcVHuYhlJnkpiRSrOR5rOIYZ9jGyp+HuvkAh9RFxEjwx8tpS4hyGUBQ/m6YeSKBIK8WoJhEaQDvDheFTGUugYYXcw7/J/ErxuNGwLfPH4nbVyQN8UMZd0yGLflGjG/i5PsbzcFuWNC'
  + 'JFb7aO6OBzIew2X1GpAYd08sSPaeAcnd551TCtJnIJzYD8IyhlVvRnRSasAeAkjukYyRjQKIfiyDPIEMnZJBnoJIlcikPEM+Rz0XMGpfwIaOedjGy1eI4RyF63hEuoX06a6Xcb5L9EcohBN/zxh/o8T'
  + 'bXhOJfKID2TEQb96WQOSTeVcik+h8XyKRT2CghC0/8QG9kxiS/PjJeVooP6D6kcMvmFz7Z8KoffnKIPJpQpHsIJNwMjQMG8MZvuFkEDIE2sCULHc2CvLNZFTIGTpjmH14byo134saP0SN4q38lDWKz4'
  + 'rgpI9kqKD4L1KHptMGIb/CAAAAAElFTkSuQmCC';

export default {
  name: 'CapacityDashboard',
  components: {
    CustomerProfile,
  },
  data() {
    return {
      // Display | Profile | Phone
      displayMode: 'Dashboard',

      obj_loading: null,

      isLoadSetting: false,
      zoomRatio: 0,

      currentTime: '',
      currentTimeLooper: null,

      params_entryChannels: [],
      params_leaveChannels: [],

      persons: [],
      entryPersons: [],
      leavePersons: [],
      currentEntryPersons: [],

      hourlyPersonInData: new Map(),
      hourlyPersonOutData: new Map(),
      hourlyPresentData: new Map(),

      // 分頁：
      currentPageIndex: [0, 0],
      displayAmount: [12, 8],

      showPageProgressTimer: null,
      countdownStartTime: null,
      countdownCurrentTime: null,
      pageProgressPercentage: '0%',
      totalPageIndex: [0, 0],

      displaySettings: {
        background_image: backgroundImage,
        logo: airaLogo,

        mode: 0, // 0: 標模式 | 1: 精簡模式

        // Personal View
        displayGroup: ['All Person'],
        displayCardMode: 'STANDARD',
        displayPhoto: 'REGISTER',
        line1: 'NONE',
        line2: 'NAME',

        // Page Layout
        dailyResetTime: '00',
        personPatrolTime: 15,
      },

      refreshKey: 1,
      emptyFace,

      // 電話查詢的變數
      drawer: false,
      searchNumber: ['', '', ''],
      matchedPersons: [],

      // Profile
      person: {},

      fields: {
        smoothie: '0',
        fruitPlate: '0',
        milk: '0',
      },
    };
  },
  mixins: [capacityModel],

  created() {
    const self = this;

    this.unSubscribe = this.$store.subscribe(async (mutation) => {
      let payload = {};
      let person = {};
      let result = {};

      switch (mutation.type) {
        case 'changeNotifications':
          if (mutation.payload.statusCode === '200') {
            console.log('created subscribe', 'mutation payload statusCode == 200');
            return;
          }

          payload = mutation.payload;

          if (payload !== undefined) {
            person = payload.person || payload.person_info;
          }

          if (person === undefined) {
            console.log('created subscribe', 'payload.person === undefined');
            return;
          }

          result = {
            card_facility_code: person.card_facility_code,
            card_number: person.card_number,
            face_image_id: payload.face_image,
            group_list: payload.groups || person.group_list,
            high_temperature: payload.is_high_temperature,
            id: payload.person_id || person.id,
            name: person.fullname || person.name,
            source_id: payload.source_id || payload.channel || '',
            temperature: payload.foreHead_temperature,
            timestamp: payload.timestamp,
            uuid: payload.person_id || person.uuid,
            verify_mode: payload.verify_mode,
            target_score: 0,
            verify_mode_string: '',
            verify_score: 0,
            verify_uuid: '',
          };

          self.applyVerifyToPerson([result]);
          self.refreshKey *= -1;

          self.refreshData();

          break;
        case 'changeWebSocket':
          if (mutation.payload === 0) {
            if (!self.obj_loading) self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          }

          if (self.obj_loading) {
            self.obj_loading.hide();
            self.obj_loading = null;
          }
          break;
        default:
          break;
      }
    });

    window.addEventListener('resize', () => {
      self.zoomViews();
    });
  },

  // Tulip
  async mounted() {
    this.isLoadSetting = true;

    // 1.0 Load Display Config
    let setting = await this.$globalGetDisplaySetting();

    let valueSetting = setting.data || {};
    const customer = valueSetting.CUSTOMER;
    this.displaySettings = { ...this.displaySettings, ...customer };

    if (this.displaySettings.dailyResetTime.length === 2) {
      this.displaySettings.dailyResetTime += ':00';
    }

    // 1.5 Load Attendance Config
    setting = await this.$globalGetAttendanceSettings();
    valueSetting = setting || {};

    await this.initializeData();

    // 8.0 start Looper
    this.setupCurrentTimeLooper();

    this.isLoadSetting = false;
  },

  destroyed() {
    const self = this;
    console.log('destroyed ============================');

    const mainElement = document.querySelector('.c-main');
    const headerElement = document.querySelector('.c-header');
    const footerElement = document.querySelector('.c-footer');
    const containerElement = document.querySelector('.container-fluid');

    if (mainElement) mainElement.classList.remove('c-main-reset');
    if (headerElement) headerElement.classList.remove('c-header-reset');
    if (footerElement) footerElement.classList.remove('c-footer-reset');
    if (containerElement) containerElement.classList.remove('container-fluid-reset');

    // if (self.autoChangePageTimer) {
    //   clearInterval(self.autoChangePageTimer);
    //   self.autoChangePageTimer = null;
    // }

    if (self.showPageProgressTimer) {
      clearInterval(self.showPageProgressTimer);
      self.showPageProgressTimer = null;
    }

    if (self.currentTimeLooper) {
      clearInterval(self.currentTimeLooper);
      self.currentTimeLooper = null;
    }
  },
  methods: {
    async initializeData() {
      // 3.0 initiao Group Person
      await this.initialPerson();

      // 4.0 initial Views
      this.initViews();

      // 5.0 display Layout
      this.refreshData();

      if (this.totalPageIndex[0] >= 1 || this.totalPageIndex[1] >= 1) {
        this.resetAutoChangePageTimer();
      }

      // 6.0 defind query startTS
      const nowHM = `${`00${new Date().getHours()}`.slice(-2)}:${`00${new Date().getMinutes()}`.slice(-2)}`;

      let startTS = new Date().setHours(this.displaySettings.dailyResetTime.split(':')[0], this.displaySettings.dailyResetTime.split(':')[1], 0, 0);
      if (nowHM < this.displaySettings.dailyResetTime) {
        startTS -= 86400000;
      }

      const endTS = new Date() - 1000;

      // 7.0 Load Last Data
      this.setupVerifyData(startTS, endTS, (verifyData) => {
        this.applyVerifyToPerson(verifyData);
        this.refreshKey *= -1;

        this.refreshData();
      });
    },

    toLoginPage() {
      const self = this;
      self.flag_login = false;
      self.value_username = '';
      self.$globalLogout();

      this.$router.push('/');
    },

    // Tulip
    getDisplayName(person) {
      const self = this;

      let retName = '';
      if (self.displaySettings.line2 === 'NAME') {
        retName = person.name;
      } else {
        retName = self.showField(person, 'PARTIALNAME');
      }

      if (self.displaySettings.displayCardMode === 'COMPACT') {
        if (retName.charCodeAt(0) > 256) {
          if (retName.length > 3) {
            retName = `${retName.substring(0, 3)}...`;
          }
        }

        if (retName.length > 6) {
          retName = `${retName.substring(0, 6)}...`;
        }
      }
      return retName;
    },

    async initialPerson() {
      const self = this;

      self.persons = await self.setupPersonData();

      for (let i = self.persons.length - 1; i >= 0; i -= 1) {
        const r = self.persons[i];
        let inDisplayGroup = false;

        if (r.group_list) {
          if (Array.isArray(r.group_list)) {
            inDisplayGroup = r.group_list.some((value) => self.displaySettings.displayGroup.indexOf(value) >= 0);
          }
        }

        if (!inDisplayGroup) {
          self.persons.splice(i, 1);
        }
      }
      self.persons.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }

        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    },

    // Tulip
    // showField(person, field) {
    //   let ret = '';

    //   switch (field) {
    //     case 'ID':
    //       ret = person.id;
    //       break;
    //     case 'NAME':
    //       ret = person.name;
    //       break;
    //     case 'PARTIALNAME':
    //       if (person.name.charCodeAt(0) > 256) {
    //         // '李***瑋'
    //         ret = `${person.name.charAt(0)}***${person.name.charAt(person.name.length - 1)}`;
    //       } else {
    //         // J. Lee
    //         const pNames = (`${person.name} `).split(' ');
    //         ret = pNames[0].charAt(0);

    //         if (pNames.length >= 3) {
    //           ret += (`. ${pNames[pNames.length - 2]}`);
    //         }
    //       }
    //       break;
    //     case 'GROUP':
    //       ret = (person.group_list || []).join(', ');
    //       break;
    //     case 'JOBTITLE':
    //       ret = person.title;
    //       ret = person.extra_info ? person.extra_info.title : '';
    //       break;
    //     case 'DEPARTMENT':
    //       ret = person.extra_info ? person.extra_info.department : '';
    //       break;
    //     case 'REGISTER':
    //       ret = person.register_image;
    //       break;
    //     case 'DISPLAY':
    //       ret = person.display_image;
    //       break;
    //     case 'SNAPSHOT':
    //       ret = person.snapshot_image;
    //       break;
    //     case 'NONE':
    //       break;
    //     default:
    //       ret = emptyFace;
    //       break;
    //   }
    //   return ret;
    // },

    // Tulip
    refreshData() {
      const self = this;

      self.entryPersons.sort((a, b) => b.clockinRecord.timestamp - a.clockinRecord.timestamp);
      self.currentEntryPersons = self.entryPersons.slice(
        self.currentPageIndex[0],
        self.displayAmount[0],
      );
      self.totalPageIndex[0] = Math.ceil(self.entryPersons.length / self.displayAmount[0]) - 1;

      self.leavePersons.sort((a, b) => b.clockoutRecord.timestamp - a.clockoutRecord.timestamp);
      self.currentLeavePersons = self.leavePersons.slice(
        self.currentPageIndex[1],
        self.displayAmount[1],
      );
      self.totalPageIndex[1] = Math.ceil(self.leavePersons.length / self.displayAmount[1]) - 1;

      self.totalPageIndex[0] = self.totalPageIndex[0] < 0 ? 0 : self.totalPageIndex[0];
      self.totalPageIndex[1] = self.totalPageIndex[1] < 0 ? 0 : self.totalPageIndex[1];

      self.currentEntryPersons.forEach((pPerson) => {
        const person = pPerson;

        if (person.register_image === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALE'
          + 'gHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
          self.$globalFetchPhoto(person.uuid, (err, data) => {
            if (err === null && data) {
              if (data.display_image !== '') {
                person.display_image = data.display_image;
              }

              if (data.register_image !== '') {
                person.register_image = data.register_image;
              }
            }
          });
        }
      });

      self.currentLeavePersons.forEach((pPerson) => {
        const person = pPerson;

        if (person.register_image === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALE'
          + 'gHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
          self.$globalFetchPhoto(person.uuid, (err, data) => {
            if (err == null && data) {
              if (data.display_image !== '') {
                person.display_image = data.display_image;
              } else {
                person.display_image = emptyFace;
              }

              if (data.register_image !== '') {
                person.register_image = data.register_image;
              } else {
                person.register_image = emptyFace;
              }
            }
          });
        }
      });
    },

    setupCurrentTimeLooper() {
      const self = this;

      self.currentTimeLooper = setInterval(async () => {
        const now = new Date();
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        self.currentTime = `${hour}:${minute}:${second}`;
      }, 1000);
    },

    //  merge Person and Verify Date
    applyVerifyToPerson(data) {
      const self = this;

      let passModeRecord = [];
      let clockModeRecord = [];

      if (data.length >= 1) {
        passModeRecord = data.filter((attRec) => (attRec.uuid !== undefined && attRec.verify_mode !== 3 && attRec.verify_mode !== 4));
        clockModeRecord = data.filter((attRec) => (attRec.verify_mode === 3 || attRec.verify_mode === 4));
        for (let i = passModeRecord.length - 1; i >= 0; i -= 1) {
          if (self.params_entryChannels.findIndex((id) => id.indexOf(passModeRecord[i].source_id) >= 0) >= 0) {
            const ppp = passModeRecord.splice(i, 1);
            if (ppp) {
              ppp[0].verify_mode = 3;
              clockModeRecord.push(ppp[0]);
            }
          } else if (self.params_leaveChannels.findIndex((id) => id.indexOf(passModeRecord[i].source_id) >= 0) >= 0) {
            const ppp = passModeRecord.splice(i, 1);
            if (ppp) {
              ppp[0].verify_mode = 4;
              clockModeRecord.push(ppp[0]);
            }
          }
        }

        if (clockModeRecord.length >= 1) {
          clockModeRecord.sort((a, b) => a.timestamp - b.timestamp);

          for (let i = 0; i < clockModeRecord.length; i += 1) {
            const record = clockModeRecord[i];
            const { uuid } = record;
            const mode = record.verify_mode;

            const hour = new Date(record.timestamp).getHours();

            const person = self.persons.find((r) => r.uuid === uuid);
            switch (mode) {
              case 3:
                {
                  if (person) {
                    // clockinRecord
                    person.clockinRecord = record;

                    // presentRecord
                    if (person.presentRecord) {
                      const last = person.presentRecord[person.presentRecord.length - 1];
                      if (last.out) {
                        person.presentRecord.push({
                          in: hour,
                        });
                      }
                    } else {
                      person.presentRecord = [];
                      person.presentRecord.push({
                        in: hour,
                      });
                    }
                  }

                  // hourlyPersonInData
                  const hValue = self.hourlyPersonInData.get(hour) || [];
                  hValue.push(uuid);

                  self.hourlyPersonInData.set(hour, hValue);
                }
                break;
              case 4:
                {
                  // clockoutRecord
                  if (person) {
                    person.clockoutRecord = record;

                    // presentRecord
                    if (person.presentRecord) {
                      const last = person.presentRecord[person.presentRecord.length - 1];
                      if (!last.out) {
                        person.presentRecord[person.presentRecord.length - 1].out = hour;
                      }
                    }
                  }

                  // hourlyPersonOutData
                  const hValue = self.hourlyPersonOutData.get(hour) || [];
                  hValue.push(uuid);

                  self.hourlyPersonOutData.set(hour, hValue);
                }
                break;
              default:
                break;
            }

            if (person) {
              if ((!person.clockinRecord) && (!person.clockoutRecord)) {
                person.punchMode = 0;
                person.status = 1;
              } else if ((!person.clockinRecord) && (person.clockoutRecord)) {
                person.punchMode = 0;
                person.status = 1;
              }
              if ((person.clockinRecord) && (!person.clockoutRecord)) {
                person.punchMode = 3;
                person.status = 0;
              }
              if ((person.clockinRecord) && (person.clockoutRecord)) {
                if (person.clockinRecord.timestamp < person.clockoutRecord.timestamp) {
                  person.punchMode = 4;
                  person.status = 1;
                } else {
                  person.punchMode = 3;
                  person.status = 0;
                }
              }
            }
          }

          for (let i = 0; i < self.persons.length; i += 1) {
            const person = self.persons[i];

            if (person.presentRecord) {
              for (let j = 0; j < person.presentRecord.length; j += 1) {
                const present = person.presentRecord[j];

                const hourIn = present.in;
                const hourOut = present.out;

                if (hourIn && hourOut) {
                  // console.log('presentRecord', person, hourIn, hourOut);

                  for (let k = hourIn; k < hourOut; k += 1) {
                    const hValue = self.hourlyPresentData.get(k) || [];

                    if (hValue.indexOf(person.uuid) < 0) {
                      hValue.push(person.uuid);
                    }

                    self.hourlyPresentData.set(k, hValue);
                  }
                }
              }
            }
          }

          self.entryPersons = self.persons.filter((p) => p.status === 0 && p.punchMode !== undefined);
          self.leavePersons = self.persons.filter((p) => p.status === 1 && p.punchMode !== undefined);
        } else if (passModeRecord.length >= 1) {
          passModeRecord.sort((a, b) => a.timestamp - b.timestamp);

          for (let i = 0; i < passModeRecord.length; i += 1) {
            const record = passModeRecord[i];
            const { uuid } = record;

            const hour = new Date(record.timestamp).getHours();

            const person = self.persons.find((r) => r.uuid === uuid);

            if (person) person.clockinRecord = record;

            if (person) {
              if (person.clockinRecord) {
                person.punchMode = 3;
                person.status = 0;
              }

              if (person.punchMode === 3) {
                const hValue = self.hourlyPersonInData.get(hour) || [];
                hValue.push(uuid);

                self.hourlyPersonInData.set(hour, hValue);
              }

              if (!person.presentRecord) {
                person.presentRecord = [];
                person.presentRecord.push({
                  in: hour,
                });
              }
            }
          }

          for (let i = 0; i < self.persons.length; i += 1) {
            const person = self.persons[i];

            if (person.presentRecord) {
              const present = person.presentRecord[0];

              if (present.in) {
                for (let k = present.in; k <= 23; k += 1) {
                  const hValue = self.hourlyPresentData.get(k) || [];

                  if (hValue.indexOf(person.uuid) < 0) {
                    hValue.push(person.uuid);
                  }

                  self.hourlyPresentData.set(k, hValue);
                }
              }
            }
          }

          self.entryPersons = self.persons.filter((p) => p.status === 0);
          self.leavePersons = self.persons.filter((p) => p.status === 1);
        }
      }
    },

    getHourlyPresentData() {
      const PersonIn = Array(24).fill(0);
      const PersonOut = Array(24).fill(0);
      const PersonPresent = Array(24).fill(0);

      this.hourlyPersonInData.forEach((v, k) => {
        PersonIn[k] += v.length;
      });

      this.hourlyPersonOutData.forEach((v, k) => {
        PersonOut[k] += v.length * -1;
      });

      this.hourlyPresentData.forEach((v, k) => {
        PersonPresent[k] += v.length;
      });

      return {
        PersonIn,
        PersonOut,
        PersonPresent,
      };
    },

    initViews() {
      const self = this;
      const mainElement = document.querySelector('.c-main');
      const headerElement = document.querySelector('.c-header');
      const footerElement = document.querySelector('.c-footer');
      const containerElement = document.querySelector('.container-fluid');

      // 把 coreUI 套件的一些預設元件的樣式清除掉
      if (mainElement) mainElement.classList.add('c-main-reset');
      if (headerElement) headerElement.classList.add('c-header-reset');
      if (footerElement) footerElement.classList.add('c-footer-reset');
      if (containerElement) containerElement.classList.add('container-fluid-reset');

      setTimeout(() => {
        self.zoomViews();
      }, 168);
    },

    resetAutoChangePageTimer() {
      const self = this;

      if (self.showPageProgressTimer) {
        clearInterval(self.showPageProgressTimer);
      }

      self.countdownStartTime = new Date();
      self.countdownCurrentTime = new Date();

      self.showPageProgressTimer = setInterval(() => {
        self.totalPageIndex.forEach((total, idx) => {
          if (total > 0) {
            self.countdownCurrentTime = new Date();

            // let base = 1;
            // if (self.isShowGroup) base = self.displaySettings.summaryPatrolTime;
            // else base = self.displaySettings.personPatrolTime;

            const base = self.displaySettings.personPatrolTime;

            const percentage = (100 * (self.countdownCurrentTime - self.countdownStartTime)) / (base * 1000);
            self.pageProgressPercentage = `${percentage}%`;

            if (percentage >= 100) {
              self.pageProgressPercentage = '0%';
              if (self.currentPageIndex[idx] === total) {
                self.$set(self.currentPageIndex, idx, 0);
              } else {
                self.$set(self.currentPageIndex, idx, self.currentPageIndex[idx] + 1);
              }
            }
          }
        });
      }, 1000);
    },

    zoomViews() {
      const self = this;
      const dashboard = document.querySelector('.customer-dashboard');
      if (dashboard) {
        const width = dashboard.clientWidth;
        const height = dashboard.clientHeight;

        const rW = width / 1920;
        const rH = height / 1080;
        self.zoomRatio = Math.min(rW, rH);

        const dW = width - (1920 * self.zoomRatio);

        dashboard.style.paddingTop = '32px';
        dashboard.style.paddingBottom = '32px';
        dashboard.style.paddingLeft = `${Math.floor(dW / 2) + 32}px`;
        dashboard.style.paddingRight = `${Math.floor(dW / 2) + 32}px`;

        const footerBoxElement = document.querySelector('.footer-box');
        const footerBoxWrapElement = document.querySelector('.footer-box-wrap');

        // 將下列 views 進行 zoom
        if (footerBoxElement) self.setZoom(footerBoxElement);
        if (footerBoxElement) footerBoxElement.style.setProperty('width', '100%');
        if (footerBoxWrapElement) footerBoxWrapElement.style.setProperty('width', `calc(100% - ${dashboard.style.paddingLeft} - ${dashboard.style.paddingRight})`);
      }
    },

    setZoom(element) {
      const self = this;
      element.style.setProperty('zoom', self.zoomRatio, 'important');
    },

    changePage(selectedIndex) {
      const self = this;
      self.$set(self.currentPageIndex, 0, selectedIndex);
      self.countdownStartTime = new Date();
      self.countdownCurrentTime = new Date();
      self.resetAutoChangePageTimer();
    },

    formatEpochTime(epochTime) {
      const date = new Date(epochTime);
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');

      return `${hour}:${minute}`;
    },

    onNumberClick(number) {
      const emptyIndex = this.searchNumber.findIndex((digit) => digit === '');
      if (emptyIndex !== -1) {
        this.$set(this.searchNumber, emptyIndex, number.toString());
      } else {
        // 清空並重新開始
        this.$set(this.searchNumber, 0, number.toString());
        this.$set(this.searchNumber, 1, '');
        this.$set(this.searchNumber, 2, '');
      }
    },

    handleSearch() {
      const searchPhoneNumber = this.searchNumber.join('');
      if (searchPhoneNumber.length < 3) return;

      const result = this.persons.filter((p) => p?.extra_info?.phone_number?.endsWith(searchPhoneNumber));

      this.drawer = false;

      if (result.length === 0) {
        this.$fire({
          text: '查無此人',
          type: 'error',
          timer: 5000,
          confirmButtonColor: '#20a8d8',
        });
        return;
      }

      if (result.length === 1) {
        this.person = result[0];
        this.displayMode = 'Profile';
        this.clearSearchNumber();
        this.initialFields();
      } else {
        this.matchedPersons = result;
        this.displayMode = 'Phone';
      }
    },

    clearSearchNumber() {
      this.searchNumber = ['', '', ''];
    },

    handleSelectPerson(person) {
      this.person = { ...person };
      this.displayMode = 'Profile';

      this.initialFields();

      if (this.searchNumber.length > 0) this.searchNumber = [];
    },

    initialFields() {
      if (Object.hasOwn(this.person, 'plugin_info')) {
        if (Object.hasOwn(this.person.plugin_info, 'smoothie')) {
          this.fields.smoothie = this.person.plugin_info.smoothie;
        }

        if (Object.hasOwn(this.person.plugin_info, 'fruitPlate')) {
          this.fields.fruitPlate = this.person.plugin_info.fruitPlate;
        }

        if (Object.hasOwn(this.person.plugin_info, 'milk')) {
          this.fields.milk = this.person.plugin_info.milk;
        }
      } else {
        this.fields = {
          smoothie: '0',
          fruitPlate: '0',
          milk: '0',
        };
      }
    },

    async handleSave(fields) {
      this.fields = fields;
      const { uuid, ...plugin_info } = this.person;
      const data = {
        uuid,
        data: {
          ...plugin_info,
          plugin_info: this.fields,
        },
      };

      await this.$globalModifyPerson(data);
    },

    goHome() {
      this.initializeData();
      this.displayMode = 'Dashboard';
    },
  },
};
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .person-card-container::-webkit-scrollbar {
    display: none;
  }

  .person-card-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
