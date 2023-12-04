<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-show="!isLoadSetting">
    <div class="ratio-content capacity-dashboard"
      :style="{backgroundImage:'url('+displaySettings.background_image+')'}">

      <div class="dashboard-header d-flex justify-content-between" style="margin-left: 20px; margin-right: 20px;">
        <div class="d-flex align-items-center">
          <div class="dashboard-attendance-logo" @click="toLoginPage"
            :style="[{backgroundImage:'url('+displaySettings.logo+')'}, 'zoom: ' + zoomRatio + ' !important;']"></div>
          <div class="attendance-title"></div>
        </div>
        <div class="current-date-time text-white ff-noto-sans fw-200">
          <div class="fz-xxxl current-date">{{ currentDate }}</div>
          <div class="fz-super-large lh-6">{{ currentTime }}</div>
        </div>
      </div>

      <!-------------------  Occupancy ------------------>
      <div class="dashboard-divider" style="margin-left: 20px; margin-right: 20px;"></div>

      <!-------------------  Attendance - BEGIN ------------------>
      <div class="attendance-top-box" v-show="displaySettings.displayChart">
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag">
            <div>{{ attendanceGroupTitle }}</div>
          </div>

          <!-- 第 2 列： 甜甜圈圖表 + 人數的數值-->
          <div class="attendance-statistics-data-box">
            <div class="doughnut-chart-canvas-wrap">
              <!-- Attendance 甜甜圈圖表 -->
              <canvas id="doughnut-chart-canvas" class=""></canvas>
            </div>
            <div class="d-flex align-items-end">
              <div class="attendance-header-present">{{ attendancePresent }}</div>
              <div class="attendance-header-total">/ {{ attendanceTotal }}</div>
            </div>
          </div>

          <!-- 第 3 列：排序選項 + 檢視模式選項 -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="d-flex align-items-center">
                <CIcon name="cilSortDescending" class="attendance-sort-icon text-white" />
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{ $t("SortByGroupName") }}</span>
              </div>
              <button class="btn-reset">
                <img class="attendance-dropdown-arrow" src="@/assets/img/dropdown_arrow_down.svg"
                  alt="dropdown_arrow_down" />
              </button>
            </div>
          </div>
        </div>

        <!-- Attendance 柱狀圖統計圖表 -->
        <div class="attendance-chart-canvas-wrap">
          <canvas id="attendance-chart-canvas"></canvas>
        </div>
      </div>

      <!-------------------  Attendance - END ------------------>

      <!-- Occupancy/Attendance 顯示人員資料列表 -->
      <div style="display: grid !important; gap: 0.7%; grid-template-columns: 66% 33%;">
        <!-- getGridStyleByAmount(), -->
        <div style="padding-left: 10px;">
          <div :class="[
            'grid-4x4',
            'd-flex',
            'flex-wrap',
            'person-list-container',
          ]">
            <div v-for="(person, index) in currentEntryPersons" :key="index" :class="[
              'person-card',
              'inline-block',
              person.status === 0 ? 'normal-person-card' : '',
              person.status === 2 ? 'abnormal-person-card' : '',
              person.status === 1 ? 'absent-person-card' : '',
              'person-card-4x4',
            ]" :style="'zoom: ' + zoomRatio + ' !important;'">
              <div class="d-flex justify-content-between align-items-center person-image-box">
                <img v-show="displaySettings.displayPhoto!='NONE'"
                  :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                  :src="`data:image/png;base64,${displaySettings.displayPhoto=='REGISTER' ? person.register_image : person.display_image}`" />

                <div class="person-info-box text-white">
                  <div v-show="displaySettings.displayCardMode=='STANDARD'" class="fz-xxl">{{showField(person,
                    displaySettings.line1)}} &nbsp;</div>
                  <div :class="[
                    person.status === 1 ? 'absent-person-name' : 'person-name',
                    'fz-l',
                    'fw-600',
                  ]" :style="'zoom: ' + zoomRatio + ' !important;'">
                    {{ getDisplayName(person) }}
                  </div>
                  <div v-if="person.status !== 1" class="d-flex align-items-end temperature-info">
                    <!-- <div :class="[
                      'fz-xxxl',
                      'fw-700',
                      'person-temperature',
                      person.temperatureStatus !== 0 ? 'abnormal-temperature' : '',
                    ]">
                    {{ person.temperature }}
                  </div>
                  <span class="temperature-unit fz-sm">°{{ displaySettings.temperatureUnit }}</span> -->
                  </div>
                  <div v-show="displaySettings.displayCardMode=='STANDARD'" class="fz-sm fw-300">
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

          <div v-show="isLoadSetting" class="align-items-center" style="color:white">
            Loading...
          </div>
        </div>
        <div>
          <!-- getGridStyleByAmount(), -->
          <div :class="[
          'grid-2x4',
          'd-flex',
          'flex-wrap',
          'person-list-container',
        ]">
            <div v-for="(person, index) in currentLeavePersons" :key="index" :class="[
            'person-card',
            'inline-block',
            person.status === 0 ? 'normal-person-card' : '',
            person.status === 2 ? 'abnormal-person-card' : '',
            person.status === 1 ? 'absent-person-card' : '',
            'person-card-2x4',
          ]" :style="'zoom: ' + zoomRatio + ' !important;'">
              <div class="d-flex justify-content-between align-items-center person-image-box">
                <img v-show="displaySettings.displayPhoto!='NONE'"
                  :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
                  :src="`data:image/png;base64,${displaySettings.displayPhoto=='REGISTER' ? person.register_image : person.display_image}`" />

                <div class="person-info-box text-white">
                  <div v-show="displaySettings.displayCardMode=='STANDARD'" class="fz-xxl">{{showField(person,
                    displaySettings.line1)}} &nbsp;</div>
                  <div :class="[
                  person.status === 1 ? 'absent-person-name' : 'person-name',
                  'fz-l',
                  'fw-600',
                ]" :style="'zoom: ' + zoomRatio + ' !important;'">
                    {{ getDisplayName(person) }}
                  </div>
                  <div v-if="person.status !== 1" class="d-flex align-items-end temperature-info">
                  </div>
                  <div v-show="displaySettings.displayCardMode=='STANDARD'" class="fz-sm fw-300">
                    <span style="margin-right: 20px;">
                      {{
                      person.clockinRecord ?
                      person.clockinRecord.timestamp ?
                      formatEpochTime(person.clockinRecord.timestamp)
                      : "&nbsp;"
                      : "&nbsp;" }}
                    </span>

                    <span>
                      {{
                      person.clockoutRecord ?
                      person.clockoutRecord.timestamp ?
                      formatEpochTime(person.clockoutRecord.timestamp)
                      : "&nbsp;"
                      : "&nbsp;" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- footer -->
      <!-- <div class="footer-box-wrap">
        <div class="footer-box">
          <div class="pager d-flex align-items-center justify-content-center">
            <button class="btn-reset" :disabled="currentPageIndex[0] === 0" @click="onClickPrev">
              <img v-if="currentPageIndex[0] === 0" class="pager-left-arrow"
                src="@/assets/img/pager_left_arrow_disabled.svg" />
              <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg" />
            </button>
            <button v-for="(item, i) in range(dispPageIndexStart, currentPageIndex[0] - 1)"
              class="pager-left-dots btn-reset" @click="onClickPagerDot(i)"></button>

            <div class="pager-progressbar-box">
              <div class="pager-progressbar-track"></div>
              <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }"></div>
            </div>
            <button v-for="(item, i) in range(currentPageIndex[0] + 1, dispPageIndexEnd)"
              class="pager-right-dots btn-reset" @click="onClickPagerDot(i + currentPageIndex[0] + 1)"></button>

            <button class="btn-reset" :disabled="currentPageIndex[0] === totalPageIndex" @click="onClickNext">
              <img v-if="currentPageIndex[0] === totalPageIndex" class="pager-right-arrow"
                src="@/assets/img/pager_right_arrow_disabled.svg" />
              <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg" />
            </button>
          </div>

          <div class="pager d-flex align-items-center justify-content-center">
            <button class="btn-reset" :disabled="currentPageIndex[1] === 0" @click="onClickPrev">
              <img v-if="currentPageIndex[1] === 0" class="pager-left-arrow"
                src="@/assets/img/pager_left_arrow_disabled.svg" />
              <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg" />
            </button>
            <button v-for="(item, i) in range(dispPageIndexStart, currentPageIndex[1] - 1)"
              class="pager-left-dots btn-reset" @click="onClickPagerDot(i)"></button>

            <div class="pager-progressbar-box">
              <div class="pager-progressbar-track"></div>
              <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }"></div>
            </div>
            <button v-for="(item, i) in range(currentPageIndex[1] + 1, dispPageIndexEnd)"
              class="pager-right-dots btn-reset" @click="onClickPagerDot(i + currentPageIndex[1] + 1)"></button>

            <button class="btn-reset" :disabled="currentPageIndex[1] === totalPageIndex" @click="onClickNext">
              <img v-if="currentPageIndex[1] === totalPageIndex" class="pager-right-arrow"
                src="@/assets/img/pager_right_arrow_disabled.svg" />
              <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg" />
            </button>
          </div>
        </div>
      </div> -->
      <!-- 右下角 powered by aira 字樣 -->
      <!-- <div class="footer-detail-box">
        <div class="footer-detail-text">powered by</div>
        <img src="@/assets/img/aira-logo-white.svg" alt="" class="footer-logo" />
      </div> -->
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';

import { airaLogoWhite as airaLogo } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';

import capacityModel from '@/models/CapacityDashboardModel.vue';
import chartHelper from '@/utils/ChartHelper.vue';

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

  data() {
    return {
      obj_loading: null,

      isLoadSetting: true,
      zoomRatio: 0,

      idleTime: null,
      currentDate: '',
      currentTime: '',
      currentTimeLooper: null,

      params_entryChannels: [],
      params_leaveChannels: [],

      persons: [],
      // groupPersons: [],
      entryPersons: [],
      leavePersons: [],

      hourlyPersonInData: new Map(),
      hourlyPersonOutData: new Map(),
      hourlyPresentData: new Map(),

      chartBarAmount: 24,
      chartLabels: [],
      chartDataIn: [],
      chartDataOut: [],
      chartDataPresent: [],

      // 分頁：
      currentPageIndex: [0, 0],
      displayAmount: [20, 8],
      // dispPageIndexStart: 0,
      // dispPageIndexEnd: 0,

      // progressDotAmount: 5,
      // autoChangePageTimer: null,
      showPageProgressTimer: null,
      countdownStartTime: null,
      countdownCurrentTime: null,
      pageProgressPercentage: '0%',
      totalPageIndex: [0, 0],
      // previousArrowEnabled: false,
      // nextArrowEnabled: true,

      // rawData: [],
      // currentPersons: [],
      currentEntryPersons: [],
      currentLeavePersons: [],
      // personStatus: {},

      displaySettings: {
        displayMode: 'CAPACITY',
        background_image: backgroundImage,
        logo: airaLogo,

        mode: 0, // 0: 標準模式 | 1: 精簡模式
        showDuration: 10000,
        // temperatureUnit: 'C', // 度 C | 度 F

        // Summary View
        enableSummaryView: true,
        summaryBy: 'GROUP',
        summaryPatrolTime: 10,
        patrolidleTime: 60,

        // Personal View
        displayGroup: [],
        displayCardMode: 'STANDARD',
        displayPhoto: 'REGISTER',
        line1: 'NONE',
        line2: 'NAME',

        // Page Layout
        pageLayout: 'LARGE',
        displayChart: false,
        dailyResetTime: '00',
        personPatrolTime: 15,
      },

      // ------------ Attendance 的變數 -------------
      // orderBy: 0, // 0: 依群組名稱排序 | 1: 依人數排序
      // isDetailMode: false,
      attendanceTitle: i18n.formatter.format('CAPACITY'),
      attendanceGroupTitle: '',
      currentGroups: [],

      // isAttendance: true,
      currentGroup: '',

      refreshKey: 1,
    };
  },
  mixins: [capacityModel, chartHelper],
  computed: {
    ...mapState(['deviceName']),
    attendancePresent() {
      // this.refreshKey;

      const self = this;
      return self.currentEntryPersons.length;
    },
    attendanceTotal() {
      // this.refreshKey;

      const self = this;
      return self.currentEntryPersons.length + self.currentLeavePersons.length;
    },
  },
  watch: {
    currentPageIndex: {
      deep: true,
      immediate: true,
      handler(newIndex, oldIndex) {
        console.log('currentPageIndex', newIndex, oldIndex);

        const self = this;

        self.displayAmount = self.setupPageLayoutAmount();

        const beginIndex = [];

        beginIndex[0] = self.displayAmount[0] * newIndex[0];
        self.currentEntryPersons = self.entryPersons.slice(
          beginIndex[0],
          beginIndex[0] + self.displayAmount[0],
        );

        beginIndex[1] = self.displayAmount[1] * newIndex[1];
        self.currentLeavePersons = self.leavePersons.slice(
          beginIndex[1],
          beginIndex[1] + self.displayAmount[1],
        );

        self.currentEntryPersons.forEach((pPerson) => {
          const person = pPerson;

          if (person.register_image === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALE'
            + 'gHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
            self.$globalFetchPhoto(person.uuid, (err, data) => {
              if (err === null && data) {
                if (data.display_image !== '') {
                  person.display_image = data.display_image;
                }
                else {
                  person.display_image = emptyFace;
                }

                if (data.register_image !== '') {
                  person.register_image = data.register_image;
                }
                else {
                  person.register_image = emptyFace;
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
              if (err === null && data) {
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

        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();

        setTimeout(() => {
          console.log('currentPageIndex setTimeout');

          const cards = document.getElementsByName('groupCards');

          cards.forEach((element) => {
            element.classList.toggle('card-flip');
          });

          self.zoomViews();
        }, 100);
      },
    },
  },

  created() {
    const self = this;
    // console.log('created start');

    this.unSubscribe = this.$store.subscribe(async (mutation) => {
      let payload = {};
      let person = {};

      switch (mutation.type) {
        case 'changeNotifications':
          if (mutation.payload.statusCode === '200') {
            console.log('created subscribe', 'mutation payload statusCode == 200');
            return;
          }

          payload = mutation.payload;

          if (payload.person === undefined) {
            console.log('created subscribe', 'payload.person === undefined');
            return;
          }

          person = {
            card_facility_code: payload.person.card_facility_code,
            card_number: payload.person.card_number,
            face_image_id: payload.face_image,
            group_list: payload.person.group_list,
            high_temperature: payload.is_high_temperature,
            id: payload.person.id,
            name: payload.person.name,
            source_id: payload.source_id,
            temperature: payload.foreHead_temperature,
            timestamp: payload.timestamp,
            uuid: payload.person.uuid,
            verify_mode: payload.verify_mode,
            target_score: 0,
            verify_mode_string: '',
            verify_score: 0,
            verify_uuid: '',
          };

          self.applyVerifyToPerson([person]);
          self.refreshKey *= -1;

          self.refreshData();
          self.refreshBarChart();
          self.refreshDoughnutChart();

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

    self.isLoadSetting = false;

    // console.log('created end');
  },

  // Tulip
  async mounted() {
    const self = this;
    // console.log('mounted start');

    self.isLoadSetting = true;

    // 1.0 Load Display Config
    let setting = await self.$globalGetDisplaySetting();

    let valueSetting = setting.data || {};
    const capacity = valueSetting.CAPACITY;
    self.displaySettings = { ...self.displaySettings, ...capacity };

    if (self.displaySettings.dailyResetTime.length === 2) {
      self.displaySettings.dailyResetTime += ':00';
    }

    // 1.5 Load Attendance Config
    setting = await self.$globalGetAttendanceSettings();
    valueSetting = setting || {};

    const videoDeviceGroupIn = valueSetting.data.video_device_group_in;
    const videoDeviceGroupOut = valueSetting.data.video_device_group_out;

    self.$globalFindVideoDeviceGroups('', 0, 3000, (err, data) => {
      let result = [];
      if (data) {
        result = data.result || [];
      }

      let entryChannels = [];
      let leaveChannels = [];
      result.forEach((g) => {
        if (videoDeviceGroupIn.indexOf(g.name) >= 0) {
          entryChannels = entryChannels.concat(g.camera_uuid_list);
          entryChannels = entryChannels.concat(g.tablet_uuid_list);
        }

        if (videoDeviceGroupOut.indexOf(g.name) >= 0) {
          leaveChannels = leaveChannels.concat(g.camera_uuid_list);
          leaveChannels = leaveChannels.concat(g.tablet_uuid_list);
        }
      });

      self.params_entryChannels = Array.from(new Set(entryChannels));
      self.params_leaveChannels = Array.from(new Set(leaveChannels));

      console.log('Channels', self.params_entryChannels, self.params_leaveChannels);
    });

    // 2.0 modify setting
    self.displaySettings.enableSummaryView = false;

    // 3.0 initiao Group Person
    await self.initialGroupPerson();

    // 4.0 initial Views
    self.initViews();

    // 5.0 display Layout
    self.refreshData();

    if (self.totalPageIndex[0] >= 1 || self.totalPageIndex[1] >= 1) {
      self.resetAutoChangePageTimer();
    }

    self.isLoadSetting = false;

    // 6.0 defind query startTS
    const nowHM = `${`00${new Date().getHours()}`.slice(-2)}:${`00${new Date().getMinutes()}`.slice(-2)}`;

    let startTS = new Date().setHours(self.displaySettings.dailyResetTime.split(':')[0], self.displaySettings.dailyResetTime.split(':')[1], 0, 0);
    if (nowHM < self.displaySettings.dailyResetTime) {
      startTS -= 86400000;
    }

    const endTS = new Date() - 1000;

    self.initBarChart();
    self.initDoughnutChart();

    // 7.0 Load Last Data
    self.setupVerifyData(startTS, endTS, (verifyData) => {
      self.applyVerifyToPerson(verifyData);
      // self.groupPersons.forEach(element => {
      //   let present = element.persons.filter((p) => p.punchMode == 3);
      //   element.present = present.length;
      // });
      self.refreshKey *= -1;

      self.refreshData();
      self.refreshBarChart();
      self.refreshDoughnutChart();
    });

    // 8.0 start Looper
    self.setupCurrentTimeLooper();

    // console.log('mounted end');
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

    async initialGroupPerson() {
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
    PartialName(pPerson) {
      const person = pPerson;

      person.partialName = '';

      if (person.name.charCodeAt(0) > 256) {
        // '李***瑋'
        person.partialName = `${person.name.charAt(0)}***${person.name.charAt(person.name.length - 1)}`;
      } else {
        // J. Lee
        const pNames = (`${person.name} `).split(' ');
        person.partialName = pNames[0].charAt(0);

        if (pNames.length >= 3) {
          person.partialName += (`. ${pNames[pNames.length - 2]}`);
        }
      }

      return person.partialName;
    },

    // Tulip
    showField(person, field) {
      let ret = '';

      switch (field) {
        case 'ID':
          ret = person.id;
          break;
        case 'NAME':
          ret = person.name;
          break;
        case 'PARTIALNAME':
          if (person.name.charCodeAt(0) > 256) {
            // '李***瑋'
            ret = `${person.name.charAt(0)}***${person.name.charAt(person.name.length - 1)}`;
          } else {
            // J. Lee
            const pNames = (`${person.name} `).split(' ');
            ret = pNames[0].charAt(0);

            if (pNames.length >= 3) {
              ret += (`. ${pNames[pNames.length - 2]}`);
            }
          }
          break;
        case 'GROUP':
          ret = (person.group_list || []).join(', ');
          break;
        case 'JOBTITLE':
          ret = person.title;
          ret = person.extra_info ? person.extra_info.title : '';
          break;
        case 'DEPARTMENT':
          ret = person.extra_info ? person.extra_info.department : '';
          break;
        case 'REGISTER':
          ret = person.register_image;
          break;
        case 'DISPLAY':
          ret = person.display_image;
          break;
        case 'SNAPSHOT':
          ret = person.snapshot_image;
          break;
        case 'NONE':
        default:
          ret = emptyFace;
          break;
      }
      return ret;
    },

    // Tulip
    refreshData() {
      const self = this;

      self.displayAmount = self.setupPageLayoutAmount();

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
              }
              else {
                person.display_image = emptyFace;
              }

              if (data.register_image !== '') {
                person.register_image = data.register_image;
              }
              else {
                person.register_image = emptyFace;
              }
            }
          });
        }
      });
    },

    refreshDoughnutChart() {
      const self = this;

      const normal = self.attendancePresent;
      // let absent = self.persons.length - self.attendancePresent;
      const absent = 100;

      const ctx = document.getElementById('doughnut-chart-canvas');

      self.setupAttendanceDoughnutChart(ctx, [normal, absent], true);

      // self.updateAttendanceDoughnutChart();
    },

    refreshBarChart() {
      const self = this;

      const hourlyData = self.getHourlyPresentData();

      if (hourlyData) {
        self.chartDataIn = hourlyData.PersonIn;
        self.chartDataOut = hourlyData.PersonOut;
        self.chartDataPresent = hourlyData.PersonPresent;
      }

      const ctx = document.getElementById('attendance-chart-canvas');

      self.setupDashboardChart(
        ctx,
        self.chartLabels,
        self.chartDataIn,
        self.chartDataOut,
        self.chartDataPresent,
      );

      // self.updateDashboardChart();
    },

    setupCurrentTimeLooper() {
      // console.log('setupCurrentTimeLooper ============================');

      const self = this;

      self.currentTimeLooper = setInterval(async () => {
        console.log('dashboards self.currentTimeLooper');

        const now = new Date();
        // let month = now.getMonth() + 1;
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        // self.currentDate = month + '/' + now.getDate() + '/' + now.getFullYear();
        self.currentDate = now.toLocaleDateString();

        self.currentTime = `${hour}:${minute}`;

        // if (now.getMinutes() === 0 && now.getSeconds() === 0) {

        //   console.log( 'dashboards self.currentTimeLooper refreshBarChart') ;

        //   self.refreshBarChart();
        // }
      }, 1000);
    },

    //  merge Person and Verify Date
    applyVerifyToPerson(data) {
      // console.log('============  applyVerifyToPerson');
      const self = this;

      let passModeRecord = [];
      let clockModeRecord = [];

      if (data.length >= 1) {
        passModeRecord = data.filter((attRec) => (attRec.verify_mode !== 3 && attRec.verify_mode !== 4));

        clockModeRecord = data.filter((attRec) => (attRec.verify_mode === 3 || attRec.verify_mode === 4));
        for (let i = passModeRecord.length - 1; i >= 0; i -= 1) {
          // console.log('params_entryChannels', self.params_entryChannels, passModeRecord[i].source_id, self.params_entryChannels.indexOf(passModeRecord[i].source_id));

          if (self.params_entryChannels.indexOf(passModeRecord[i].source_id) >= 0) {
            const ppp = passModeRecord.splice(i, 1);
            if (ppp) {
              ppp[0].verify_mode = 3;
              clockModeRecord.push(ppp[0]);
            }
          } else if (self.params_leaveChannels.indexOf(passModeRecord[i].source_id) >= 0) {
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

          self.entryPersons = self.persons.filter((p) => p.status === 0);
          self.leavePersons = self.persons.filter((p) => p.status === 1);

          console.log('c persons', self.persons);
          console.log('c entryPersons', self.entryPersons);
          console.log('c leavePersons', self.leavePersons);
          // console.log('c hourlyPresentData', self.hourlyPresentData);
          // console.log('c hourlyPersonInData', self.hourlyPersonInData);
          // console.log('c hourlyPersonOutData', self.hourlyPersonOutData);
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

          console.log('p persons', self.persons);
          console.log('P hourlyPresentData', self.hourlyPresentData);
          console.log('p hourlyPersonInData', self.hourlyPersonInData);
          console.log('p hourlyPersonOutData', self.hourlyPersonOutData);
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

    setupPageLayoutAmount() {
      return [20, 8];
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
        console.log('initViews setTimeout');
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
    },

    zoomViews() {
      const self = this;
      const dashboard = document.querySelector('.capacity-dashboard');
      if (dashboard) {
        const width = dashboard.clientWidth;
        const height = dashboard.clientHeight;

        const rW = width / 1920;
        const rH = height / 1080;
        self.zoomRatio = Math.min(rW, rH);

        const dW = width - (1920 * self.zoomRatio);
        const dH = height - (1080 * self.zoomRatio);

        dashboard.style.paddingTop = `${Math.floor(dH / 2)}px`;
        dashboard.style.paddingBottom = `${Math.floor(dH / 2)}px`;
        dashboard.style.paddingLeft = `${Math.floor(dW / 2)}px`;
        dashboard.style.paddingRight = `${Math.floor(dW / 2)}px`;

        const dateTimeElement = document.querySelector('.current-date-time');
        const chartElement = document.querySelector('#chart-canvas');
        const summaryBox = document.querySelector('.summary-box');
        const headerElement = document.querySelector('.dashboard-header');
        const dividerElement = document.querySelector('.dashboard-divider');
        const footerBoxElement = document.querySelector('.footer-box');
        const attendanceTopElement = document.querySelector('.attendance-top-box');

        // 將下列 views 進行 zoom
        if (dateTimeElement) self.setZoom(dateTimeElement);
        if (chartElement) self.setZoom(chartElement);
        if (summaryBox) self.setZoom(summaryBox);
        if (headerElement) self.setZoom(headerElement);
        if (dividerElement) self.setZoom(dividerElement);
        if (footerBoxElement) self.setZoom(footerBoxElement);
        if (attendanceTopElement) self.setZoom(attendanceTopElement);
      }
    },

    setZoom(element) {
      const self = this;
      element.style.setProperty('zoom', self.zoomRatio, 'important');
    },

    initBarChart() {
      const self = this;

      self.chartLabels = Array.from(Array(self.chartBarAmount).keys());
      self.chartDataIn = Array(self.chartBarAmount).fill(0);
      self.chartDataOut = Array(self.chartBarAmount).fill(0);
      self.chartDataPresent = Array(self.chartBarAmount).fill(0);

      const ctx = document.getElementById('attendance-chart-canvas');

      self.setupDashboardChart(
        ctx,
        self.chartLabels,
        self.chartDataIn,
        self.chartDataOut,
        self.chartDataPresent,
      );
    },

    initDoughnutChart() {
      const self = this;

      const ctx = document.getElementById('doughnut-chart-canvas');
      self.setupAttendanceDoughnutChart(ctx, [0, 0], true);
    },

    changePage(selectedIndex) {
      const self = this;
      self.currentPageIndex[0] = selectedIndex;
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

    getStyleByAmount() {
      const self = this;
      let style = '';
      switch (self.displayAmount[0]) {
        case 30:
          style = 'person-card-6x5';
          break;
        case 8:
          style = 'person-card-4x2';
          break;
        case 12:
          style = 'person-card-4x3';
          break;
        case 48:
          style = 'person-card-12x4';
          break;
        case 60:
          style = 'person-card-12x5';
          break;
        case 18:
          style = 'person-card-9x2';
          break;
        case 27:
          style = 'person-card-9x3';
          break;
        case 24:
        default:
          style = 'person-card-6x4';
          break;
      }

      return style;
    },

    getGroupStyleByAmount() {
      const self = this;
      let style = '';

      switch (self.displayAmount[0]) {
        case 30:
          style = 'group-card-6x5';
          break;
        case 8:
          style = 'group-card-4x2';
          break;
        case 12:
          style = 'group-card-4x3';
          break;
        case 48:
          style = 'group-card-12x4';
          break;
        case 60:
          style = 'group-card-12x5';
          break;
        case 18:
          style = 'group-card-9x2';
          break;
        case 27:
          style = 'group-card-9x3';
          break;
        case 24:
        default:
          style = 'group-card-6x4';
          break;
      }
      return style;
    },

    getGridStyleByAmount() {
      // console.log('getGridStyleByAmount ============================');

      const self = this;
      let style = '';
      switch (self.displayAmount[0]) {
        case 8:
          style = 'grid-4x2';
          break;
        case 48:
          style = 'grid-12x4';
          break;
        case 18:
          style = 'grid-9x2';
          break;
        case 24:
        default:
          style = 'grid-4x4';
          break;
      }

      return style;
    },
  },
};
</script>

<style lang='scss' scoped>
  .group-card {
    transition: 0.5s ease-in-out;
  }

  .group-card.card-flip {
    transform: rotateX(360deg);
  }

  .list-enter-active,
  .list-leave-active,
  .list-move {
    transition: opacity 1s, transform 1s;
  }

  .list-enter,
  .list-enter-from {
    opacity: 0;
    transform: translateY(-200px);
  }

  .list-leave-to {
    opacity: 0;
    transform: translateY(200px);
  }
</style>
