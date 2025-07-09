<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-show="!isLoadSetting">
    <div class="ratio-content dashboard" style="position: absolute; z-index: 50;"
      :style="{backgroundImage:'url('+displaySettings.background_image+')'}">
      <div class="dashboard-header d-flex justify-content-between" style="margin-left: 20px; margin-right: 20px;">
        <div class="d-flex align-items-center">
          <div class="dashboard-attendance-logo" @click="toLoginPage" :style="['zoom: ' + zoomRatio + ' !important;']">
            <img :src="displaySettings.logo" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
          <div class="attendance-title" />
        </div>
        <div class="current-date-time text-white ff-noto-sans fw-200">
          <div class="fz-xxxl current-date">
            {{ currentDate }}
          </div>
          <div class="fz-super-large lh-6">
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-------------------  Occupancy ------------------>
      <div class="dashboard-divider" style="margin-left: 20px; margin-right: 20px;" />

      <!-------------------  Attendance - BEGIN ------------------>
      <div class="attendance-top-box" style="margin-left: 20px; margin-right: 20px;"
        v-show="displaySettings.displayChart">
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag">
            <button v-if="displaySettings.enableSummaryView" class="btn-return" @click="returnToAllGroups">
              <img v-if="!isShowGroup" src="@/assets/img/attendance_return_arrow.svg" class="attendance-return-arrow">
            </button>
            <div v-show="!isShowGroup">
              {{ attendanceGroupTitle }}
            </div>
          </div>

          <!-- 第 2 列： 甜甜圈圖表 + 人數的數值-->
          <div class="attendance-statistics-data-box">
            <div class="doughnut-chart-canvas-wrap">
              <!-- Attendance 甜甜圈圖表 -->
              <canvas id="doughnut-chart-canvas" />
            </div>
            <div class="d-flex align-items-end">
              <div class="attendance-header-present">
                {{ attendancePresent }}
              </div>
              <div class="attendance-header-total">
                / {{ attendanceTotal }}
              </div>
            </div>
          </div>

          <!-- 第 3 列：排序選項 + 檢視模式選項 -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="d-flex align-items-center">
                <CIcon name="cilSortDescending" class="attendance-sort-icon text-white" />
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{ getSortByText }}</span>
              </div>
              <button class="btn-reset">
                <img class="attendance-dropdown-arrow" src="@/assets/img/dropdown_arrow_down.svg"
                  alt="dropdown_arrow_down">
              </button>
            </div>
          </div>
        </div>

        <!-- Attendance 柱狀圖統計圖表 -->
        <div class="attendance-chart-canvas-wrap">
          <canvas id="attendance-chart-canvas" />
        </div>
      </div>

      <!-------------------  Attendance - END ------------------>

      <!-- Occupancy/Attendance 顯示人員資料列表 -->
      <div v-if="!isShowGroup"
        style="height: 60%; margin-left: 20px; margin-right: 20px; align-items: start;grid-auto-rows: min-content;"
        :style="{'margin-left': `${20 * zoomRatio}px`, 'margin-right': `${20 * zoomRatio}px`}" :class="[
          getGridStyleByAmount(),
          'd-flex',
          'flex-wrap',
          'person-list-container',
        ]">
        <div v-for="(person, index) in currentPersons" :key="index" :class="[
            'person-card',
            'inline-block',
            person.status === 0 ? 'normal-person-card' : '',
            person.status === 2 ? 'abnormal-person-card' : '',
            person.status === 1 ? 'absent-person-card' : '',
            getStyleByAmount(),
          ]" :style="'zoom: ' + zoomRatio + ' !important;'">
          <div class="d-flex justify-content-between align-items-center person-image-box">
            <img v-show="displaySettings.displayPhoto!='NONE'"
              :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]" :src="getImageSrc(person)">
            <div class="person-info-box text-white">
              <div :class="[
                  person.status === 1 ? 'absent-person-name' : 'person-name',
                  'fz-xxxl',
                  'fw-600',
                ]" :style="'zoom: ' + zoomRatio + ' !important;'">
                {{ getDisplayName(person) }}
              </div>
              <div v-show="displaySettings.displayCardMode=='STANDARD'" class="fz-xl">
                {{ showField(person,
                displaySettings.line2) }} &nbsp;
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

      <!-- Attendance 顯示群組資料列表 -->
      <div v-if="isShowGroup"
        style="height: 60%; margin-left: 20px; margin-right: 20px; align-items: start;grid-auto-rows: min-content;"
        :style="{'margin-left': `${20 * zoomRatio}px`, 'margin-right': `${20 * zoomRatio}px`}" :class="[
          getGridStyleByAmount(),
          'd-flex',
          'flex-wrap',
          'person-list-container',
        ]">
        <button v-for="(group, index) in currentGroups" class="btn-reset item" @click="(evt)=>onClickGroup(evt, group)"
          :key="index">
          <transition name="list">
            <div name="groupCards" :class="['group-card', 'btn-reset', getGroupStyleByAmount()]"
              :style="'zoom: ' + zoomRatio + ' !important;'">
              <div class="attendace-group-card-name">
                {{ group.groupName }}
              </div>

              <div>
                <span class="group-card-present-number">{{ group.present }}</span>
                <span class="group-card-total-number">/ {{ group.total }}</span>
              </div>
            </div>
          </transition>
        </button>
      </div>

      <!-- footer -->
      <div class="footer-box d-flex justify-content-between" style="margin-left: 20px; margin-right: 20px;">
        <div v-show="isLoadSetting" class="align-items-center" style="color:white">
          Loading...
        </div>

        <!-- 分頁按鈕和滑桿 -->
        <div class="pager d-flex align-items-center justify-content-center">
          <button class="btn-reset" :disabled="currentPageIndex === 0" @click="onClickPrev">
            <img v-if="currentPageIndex === 0" class="pager-left-arrow"
              src="@/assets/img/pager_left_arrow_disabled.svg">
            <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg">
          </button>
          <!-- <button v-for="(item, i) in currentPageIndex" class="pager-left-dots btn-reset"
            @click="onClickPagerDot(i)"></button> -->
          <button v-for="(item, i) in range(dispPageIndexStart, currentPageIndex - 1)"
            :key="`${range(dispPageIndexStart, currentPageIndex - 1)}${i}`" class="pager-left-dots btn-reset"
            @click="onClickPagerDot(i)" />

          <div class="pager-progressbar-box">
            <div class="pager-progressbar-track" />
            <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }" />
          </div>
          <!-- <button v-for="(item, i) in totalPageIndex - currentPageIndex" class="pager-right-dots btn-reset"
            @click="onClickPagerDot(i + currentPageIndex + 1)"></button> -->
          <button v-for="(item, i) in range(currentPageIndex + 1, dispPageIndexEnd)"
            :key="`${range(currentPageIndex + 1, dispPageIndexEnd)}${i}`" class="pager-right-dots btn-reset"
            @click="onClickPagerDot(i + currentPageIndex + 1)" />

          <button class="btn-reset" :disabled="currentPageIndex === totalPageIndex" @click="onClickNext">
            <img v-if="currentPageIndex === totalPageIndex" class="pager-right-arrow"
              src="@/assets/img/pager_right_arrow_disabled.svg">
            <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg">
          </button>
        </div>
        <!-- 右下角 powered by aira 字樣 -->
        <div class="footer-detail-box">
          <div class="footer-detail-text">
            powered by
          </div>
          <img src="@/assets/img/aira-logo-white.svg" alt="" class="footer-logo">
        </div>
      </div>
    </div>
    <div class="loading" v-if="loading">
      <CSpinner color="primary" />
    </div>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  import { mapState } from 'vuex';

  import { airaLogoWhite as airaLogo } from '@/utils';
  import { backgroundImage } from '@/utils/welcomeMode';

  import occupancyModel from '@/models/OccupancyDashboardModel.vue';
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
    name: 'OccupancyDashboard',

    data() {
      return {
        unSubscribe: null,
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
        groupPersons: [],
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

        isShowGroup: true,

        // 分頁：
        currentPageIndex: 0,
        displayAmount: 24,
        dispPageIndexStart: 0,
        dispPageIndexEnd: 0,

        // progressDotAmount: 5,
        // autoChangePageTimer: null,
        showPageProgressTimer: null,
        countdownStartTime: null,
        countdownCurrentTime: null,
        pageProgressPercentage: '0%',
        totalPageIndex: 0,
        // previousArrowEnabled: false,
        // nextArrowEnabled: true,

        // rawData: [],
        currentPersons: [],

        // personStatus: {},

        displaySettings: {
          displayMode: 'OCCUPANCY',
          background_image: backgroundImage,
          logo: airaLogo,

          mode: 0, // 0: 標準模式 | 1: 精簡模式
          showDuration: 10000,
          // temperatureUnit: 'C', // 度 C | 度 F

          // Summary View
          enableSummaryView: false,
          summaryBy: 'GROUP',
          summaryPatrolTime: 10,
          patrolidleTime: 60,

          // Personal View
          displayGroup: ['All Person'],
          displayCardMode: 'STANDARD',
          displayPhoto: 'REGISTER',
          line1: 'NAME',
          line2: 'NONE',

          // Page Layout
          pageLayout: 'LARGE',
          displayChart: true,
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
    mixins: [occupancyModel, chartHelper],
    computed: {
      ...mapState(['deviceName']),
      attendancePresent() {
        // from persons and groupPersons
        // this.refreshKey;

        const self = this;

        let ret = 0;
        if (self.displaySettings.enableSummaryView) {
          if (self.isShowGroup) {
            const presentArray = self.persons.filter((p) => p.status === 0);
            ret = presentArray.length;
          } else {
            const currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
            let presentArray = [];

            if (currentGroupData && currentGroupData.persons) {
              presentArray = currentGroupData.persons.filter(
                (p) => p.status === 0,
              );
            }
            ret = presentArray.length;
          }
        } else {
          let presentArray = [];

          if (self.persons) {
            presentArray = self.persons.filter(
              (p) => p.status === 0,
            );
          }
          ret = presentArray.length;
        }

        return ret;
      },
      attendanceTotal() {
        // from persons and groupPersons
        // this.refreshKey;

        const self = this;
        let len = 0;
        if (self.displaySettings.enableSummaryView) {
          if (self.isShowGroup) {
            len = self.persons.length;
          } else {
            const currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
            if (currentGroupData && currentGroupData.persons) {
              len = currentGroupData.persons.length;
            }
          }
        } else {
          len = self.persons.length;
        }

        return len;
      },
      getSortByText() {
        const self = this;
        switch (self.displaySettings.summaryBy) {
          case 'DEPARTMENT':
            return self.$t('SortByDepartment');
          case 'JOBTITLE':
            return self.$t('SortByJobTitle');
          case 'GROUP':
          default:
            return self.$t('SortByGroupName');
        }
      },
    },
    watch: {
      currentPageIndex(newIndex) {
        const self = this;

        self.displayAmount = self.setupPageLayoutAmount();

        const beginIndex = self.displayAmount * newIndex;

        if (self.displaySettings.enableSummaryView) {
          if (self.isShowGroup) {
            self.currentGroups = self.groupPersons.slice(
              beginIndex,
              beginIndex + self.displayAmount,
            );
          } else {
            const currentGroupData = self.groupPersons.find(
              (g) => g.groupName === self.currentGroup,
            );

            self.currentPersons = currentGroupData.persons.slice(
              beginIndex,
              beginIndex + self.displayAmount,
            );

            self.currentPersons.forEach((item) => {
              const person = item;
              if (person.register_image
                === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
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
          }
        } else {
          self.currentPersons = self.persons.slice(
            beginIndex,
            beginIndex + self.displayAmount,
          );

          self.currentPersons.forEach((item) => {
            const person = item;
            if (person.register_image
              === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
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
        }

        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();

        self.dispPageIndexStart = newIndex - 4;
        if (self.dispPageIndexStart < 0) {
          self.dispPageIndexStart = 0;
        }

        if (self.totalPageIndex >= 9) {
          if (self.dispPageIndexStart >= self.totalPageIndex - 8) {
            self.dispPageIndexStart = self.totalPageIndex - 8;
          }
        }

        self.dispPageIndexEnd = self.dispPageIndexStart + 8;
        if (self.dispPageIndexEnd >= self.totalPageIndex) {
          self.dispPageIndexEnd = self.totalPageIndex;
        }

        setTimeout(() => {
          const cards = document.getElementsByName('groupCards');

          cards.forEach((element) => {
            element.classList.toggle('card-flip');
          });

          self.zoomViews();
        }, 100);
      },
    },
    // Tulip
    async created() {
      const self = this;

      this.unSubscribe = this.$store.subscribe(async (mutation) => {
        let payload = {};
        let person = {};
        let result = {};
        switch (mutation.type) {
          case 'changeWebSocket':
            if (mutation.payload === 0) {
              if (!self.obj_loading) self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
            } else if (self.obj_loading) {
              self.obj_loading.hide();
              self.obj_loading = null;
            }
            break;
          case 'changeNotifications':
            if (mutation.payload.statusCode === '200') {
              // console.log('created subscribe', 'mutation payload statusCode == 200');
              return;
            }

            payload = mutation.payload;

            if (payload !== undefined) {
              person = payload.person || payload.person_info;
            }

            if (person === undefined) {
              // console.log('created subscribe', 'payload.person === undefined');
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
            self.groupPersons.forEach((elem) => {
              const element = elem;
              const present = element.persons.filter((p) => p.punchMode === 3);
              element.present = present.length;
            });
            self.refreshKey *= -1;

            self.refreshBarChart();
            self.refreshDoughnutChart();
            break;
          default:
            break;
        }
      });

      window.addEventListener('resize', () => {
        self.zoomViews();
      });

      window.addEventListener('mousemove', () => {
        self.idleTime = Date.now();
      });
      window.addEventListener('mousedown', () => {
        self.idleTime = Date.now();
      });
      window.addEventListener('keydown', () => {
        self.idleTime = Date.now();
      });

      self.isLoadSetting = false;
    },

    // Tulip
    async mounted() {
      const self = this;

      self.isLoadSetting = true;

      // 1.0 Load Display Config
      const { data: display } = await self.$globalGetDisplaySetting();
      self.displaySettings = { ...self.displaySettings, ...display.OCCUPANCY };
      console.log(self.displaySettings);

      if (self.displaySettings.dailyResetTime.length === 2) {
        self.displaySettings.dailyResetTime += ':00';
      }

      // 1.5 Load Attendance Config
      const setting = await self.$globalGetAttendanceSettings();
      const videoDeviceGroupIn = setting.data.video_device_group_in;
      const videoDeviceGroupOut = setting.data.video_device_group_out;

      const { data: { list: cameraList } } = await this.$globalFindCameras('', 0, 3000);
      const { data: { data_list: tabletList } } = await this.$globalGetTabletList('', 0, 3000);

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

        self.params_entryChannels = self.params_entryChannels.map((id) => {
          const camera = cameraList.find((c) => c.uuid === id);
          const tablet = tabletList.find((c) => c.uuid === id);
          if (camera) return `${id}${camera.name}`;
          if (tablet) return `${id}${tablet.identity}`;
          return id;
        });

        self.params_leaveChannels = self.params_leaveChannels.map((id) => {
          const camera = cameraList.find((c) => c.uuid === id);
          const tablet = tabletList.find((c) => c.uuid === id);
          if (camera) return `${id}${camera.name}`;
          if (tablet) return `${id}${tablet.identity}`;
          return id;
        });
      });

      // 2.0 modify setting
      self.isShowGroup = self.displaySettings.enableSummaryView;

      // 3.0 initial Group Person
      await self.initialGroupPerson();

      // 4.0 initial Views
      self.initViews();

      // 5.0 display Layout
      self.refreshData();

      if (self.totalPageIndex >= 1) {
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

      this.$nextTick(() => {
        self.initBarChart();
        self.initDoughnutChart();
      });

      // 7.0 Load Last Data
      self.setupVerifyData(startTS, endTS, (verifyData) => {
        self.applyVerifyToPerson(verifyData);
        self.groupPersons.forEach((elem) => {
          const element = elem;
          const present = element.persons.filter((p) => p.punchMode === 3);
          element.present = present.length;
        });
        self.refreshKey *= -1;

        this.$nextTick(() => {
          self.refreshBarChart();
          self.refreshDoughnutChart();
        });
      });

      // 8.0 start Looper
      self.setupCurrentTimeLooper();
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

      this.unSubscribe();
    },
    methods: {
      getImageSrc(person) {
        // console.log("1111",person.register_image )
        // console.log("2222",person.display_image )
        // 先統一 normalize
        if (typeof person.register_image === 'object') {
          person.register_image = '';
        }
        if (typeof person.display_image === 'object') {
          person.display_image = '';
        }
        const key = this.displaySettings.displayPhoto === 'REGISTER'
          ? 'register_image'
          : 'display_image';

        let b64 = person[key] || person._lastImage;

        if (b64) {
          // 更新快取
          person._lastImage = b64;
          return `data:image/png;base64,${b64}`;
        }
        return '';
      },
      range(start, end) {
        let ret = [];

        if (start <= end) {
          ret = Array(end - start + 1).fill().map((val, i) => start + i);
        }

        return ret;
      },

      // Tulip
      getDisplayName(person) {
        const self = this;

        let retName = '';
        if (self.displaySettings.line1 === 'NAME') {
          retName = person.name;
        } else if (self.displaySettings.line1 === 'PARTIALNAME') {
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

        const raw = await self.setupPersonData();

        self.persons = raw.map(p => {
          // 如果有物件格式就拆成字串
          if (typeof p.register_image === 'object') {
            p.register_image = '';
          }
          if (typeof p.display_image === 'object') {
            p.display_image = '';
          }
          // 新增快取欄位，初始設空
          p._lastImage = '';
          return p;
        });

        for (let i = self.persons.length - 1; i >= 0; i -= 1) {
          const r = self.persons[i];
          let inDisplayGroup = false;

          // 檢查人員的群組是否在顯示設定中的群組中
          if (r.group_list && Array.isArray(r.group_list)) {
            inDisplayGroup = r.group_list.some((value) => self.displaySettings.displayGroup.indexOf(value) >= 0);
          }

          if (!inDisplayGroup) {
            self.persons.splice(i, 1);
          }
        }

        // sort person by name
        self.persons.sort((a, b) => {
          let ret = 0;

          if (a.name < b.name) {
            ret = -1;
          } else if (a.name > b.name) {
            ret = 1;
          } else {
            ret = 0;
          }
          return ret;
        });

        switch (self.displaySettings.summaryBy) {
          case 'DEPARTMENT':
            self.groupPersons = [];

            self.persons.forEach((p) => {
              const person = p;

              const depart = person.extra_info.department || '';

              const gp = self.groupPersons.find((g) => g.groupName === depart);
              person.punchMode = 0;
              if (gp) {
                gp.persons.push(person);
                gp.total += 1;
              } else {
                self.groupPersons.push({
                  groupName: depart, persons: [person], present: 0, total: 1,
                });
              }
            });

            break;
          case 'JOBTITLE':
            self.groupPersons = [];

            self.persons.forEach((p) => {
              const person = p;

              const title = person.extra_info.title || '';

              const gp = self.groupPersons.find((g) => g.groupName === title);
              person.punchMode = 0;
              if (gp) {
                gp.persons.push(person);
                gp.total += 1;
              } else {
                self.groupPersons.push({
                  groupName: title, persons: [person], present: 0, total: 1,
                });
              }
            });
            break;
          case 'GROUP':
          default:
            self.groupPersons = [];

            self.persons.forEach((p) => {
              const person = p;

              const groupList = person.group_list || [];

              for (let j = 0; j < groupList.length; j += 1) {
                const group = groupList[j];

                const gp = self.groupPersons.find((g) => g.groupName === group);

                person.punchMode = 0;
                if (gp) {
                  gp.persons.push(person);
                  gp.total += 1;
                } else if ((self.displaySettings.displayGroup.indexOf(group) >= 0)) {
                  self.groupPersons.push({
                    groupName: group, persons: [person], present: 0, total: 1,
                  });
                }
              }
            });
            break;
        }

        // 3.0 from Persons tp GroupPersons
        self.groupPersons.forEach((pGroup) => {
          const group = pGroup;

          group.total = group.persons.length;
          group.persons.sort((a, b) => {
            let ret = 0;
            if (a.name < b.name) {
              ret = -1;
            } else if (a.name > b.name) {
              ret = 1;
            } else {
              ret = 0;
            }
            return ret;
          });
        });
      },

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
            break;
          default:
            ret = emptyFace;
            break;
        }
        return ret;
      },

      toLoginPage() {
        const self = this;
        self.flag_login = false;
        self.value_username = '';
        self.$globalLogout();

        this.$router.push('/');
      },

      // Tulip
      refreshData() {
        const self = this;

        self.displayAmount = self.setupPageLayoutAmount();

        if (self.displaySettings.enableSummaryView) {
          if (self.isShowGroup) {
            self.currentGroups = self.groupPersons.slice(
              self.currentPageIndex,
              self.displayAmount,
            );

            self.totalPageIndex = Math.ceil(self.groupPersons.length / self.displayAmount) - 1;
          } else {
            const currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);

            self.currentPersons = currentGroupData.persons.slice(
              self.currentPageIndex,
              self.displayAmount,
            );

            self.totalPageIndex = Math.ceil(currentGroupData.persons.length / self.displayAmount) - 1;

            self.currentPersons.forEach((item) => {
              const person = item;

              if (person.register_image
                === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
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
          }
        } else {
          self.currentPersons = self.persons.slice(
            self.currentPageIndex,
            self.displayAmount,
          );

          self.totalPageIndex = Math.ceil(self.persons.length / self.displayAmount) - 1;

          self.currentPersons.forEach((item) => {
            const person = item;

            if (person.register_image
              === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
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
        }

        self.dispPageIndexStart = self.currentPageIndex - 4;
        if (self.dispPageIndexStart < 0) {
          self.dispPageIndexStart = 0;
        }

        if (self.totalPageIndex >= 9) {
          if (self.dispPageIndexStart >= self.totalPageIndex - 8) {
            self.dispPageIndexStart = self.totalPageIndex - 8;
          }
        }

        self.dispPageIndexEnd = self.dispPageIndexStart + 8;
        if (self.dispPageIndexEnd >= self.totalPageIndex) {
          self.dispPageIndexEnd = self.totalPageIndex;
        }
      },

      // Tulip
      refreshDoughnutChart() {
        // from attendancePresent and persons

        const self = this;

        const normal = self.attendancePresent;
        const absent = self.persons.length - self.attendancePresent;

        const ctx = document.getElementById('doughnut-chart-canvas');

        self.setupAttendanceDoughnutChart(ctx, [normal, absent], true);
      },

      // Tulip
      refreshBarChart() {
        // console.log('refreshBarChart ============================');

        const self = this;

        const hourlyData = self.getHourlyPresentData();

        if (hourlyData) {
          self.chartDataIn = hourlyData.PersonIn;
          self.chartDataOut = hourlyData.PersonOut;
          self.chartDataPresent = hourlyData.PersonPresent;
        }

        if (self.chartLabels.length) {
          const ctx = document.getElementById('attendance-chart-canvas');

          self.setupDashboardChart(
            ctx,
            self.chartLabels,
            self.chartDataIn,
            self.chartDataOut,
            self.chartDataPresent,
          );
        }
      },

      setupCurrentTimeLooper() {
        const self = this;

        self.currentTimeLooper = setInterval(async () => {
          const now = new Date();
          const hour = String(now.getHours()).padStart(2, '0');
          const minute = String(now.getMinutes()).padStart(2, '0');
          self.currentDate = now.toLocaleDateString();

          self.currentTime = `${hour}:${minute}`;

          if (self.displaySettings.enableSummaryView && !self.isShowGroup) {
            if (self.displaySettings.patrolidleTime > 0 && (Date.now() - self.idleTime) > (self.displaySettings.patrolidleTime * 1000)) {
              self.returnToAllGroups();
            }
          }

          if (now.getMinutes() === 0 && now.getSeconds() === 0) {
            self.refreshBarChart();
          }
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

          // 檢查 passModeRecord 裡面的 person 是 in or out，然後 push 至 clockModeRecord
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

          // 處理進出人員狀態 clockModeRecord
          if (clockModeRecord.length >= 1) {
            clockModeRecord.sort((a, b) => a.timestamp - b.timestamp);

            for (let i = 0; i < clockModeRecord.length; i += 1) {
              const record = clockModeRecord[i];
              const { uuid } = record;
              const mode = record.verify_mode;

              const hour = new Date(record.timestamp).getHours();

              const person = self.persons.find((r) => r.uuid === uuid);

              if (person != null && record.group_list.indexOf('All Visitor') >= 0) {
                person.display_image = record.face_image_id;
              }

              switch (mode) {
                case 3:
                  {
                    // 人員進入
                    if (person) {
                      // clockinRecord
                      person.clockinRecord = record;

                      // presentRecord
                      if (person.presentRecord) {
                        const last = person.presentRecord[person.presentRecord.length - 1];
                        if (last.out) {
                          // 如果人員最後一筆紀錄是 out，就插入一筆新的紀錄 in
                          person.presentRecord.push({
                            in: hour,
                          });
                        }
                      } else {
                        // 如果人員之前沒有任何紀錄，也插入一筆新的紀錄 in
                        person.presentRecord = [];
                        person.presentRecord.push({
                          in: hour,
                        });
                      }
                    }

                    // hourlyPersonInData => Map()<hour, uuid[]>
                    // 更新 hourlyPersonInData
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
                          // 補上人員的 out 時間點
                          person.presentRecord[person.presentRecord.length - 1].out = hour;
                        }
                      }
                    }

                    // hourlyPersonOutData => Map()<hour, uuid[]>
                    // 更新 hourlyPersonOutData
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
                  // 沒有 in & 沒有 out
                  person.punchMode = 0;
                  person.status = 1;
                } else if ((!person.clockinRecord) && (person.clockoutRecord)) {
                  // 沒有 in & 有 out
                  person.punchMode = 0;
                  person.status = 1;
                }
                if ((person.clockinRecord) && (!person.clockoutRecord)) {
                  // 有 in & 沒有 out
                  person.punchMode = 3;
                  person.status = 0;
                }
                if ((person.clockinRecord) && (person.clockoutRecord)) {
                  // 有 in & 有 out
                  if (person.clockinRecord.timestamp < person.clockoutRecord.timestamp) {
                    // in < out
                    person.punchMode = 4;
                    person.status = 1;
                  } else {
                    // in >= out
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
          } else if (passModeRecord.length >= 1) {
            passModeRecord.sort((a, b) => a.timestamp - b.timestamp);

            for (let i = 0; i < passModeRecord.length; i += 1) {
              const record = passModeRecord[i];

              const { uuid } = record;

              const hour = new Date(record.timestamp).getHours();
              const person = self.persons.find((r) => r.uuid === uuid);

              if (person && record.group_list.indexOf('All Visitor') >= 0) {
                person.display_image = record.face_image_id;
              }

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

      setupPageLayoutAmount() {
        // console.log('setupPageLayoutAmount ============================');

        const self = this;

        switch (self.isShowGroup) {
          case false:
            switch (self.displaySettings.pageLayout) {
              case 'SMALL':
                switch (self.displaySettings.displayCardMode) {
                  case 'COMPACT':
                    return self.displaySettings.displayChart ? 18 : 27;
                  case 'STANDARD':
                  default:
                    return self.displaySettings.displayChart ? 8 : 12;
                }
              case 'LARGE':
              default:
                switch (self.displaySettings.displayCardMode) {
                  case 'COMPACT':
                    return self.displaySettings.displayChart ? 48 : 60;
                  case 'STANDARD':
                  default:
                    return self.displaySettings.displayChart ? 24 : 30;
                }
            }
          case true:
          default:
            return self.displaySettings.displayChart ? 24 : 30;
        }
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

      // Tulip
      resetAutoChangePageTimer() {
        // console.log('resetAutoChangePageTimer ============================');

        const self = this;

        if (self.showPageProgressTimer) {
          clearInterval(self.showPageProgressTimer);
        }

        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();

        // 每 500 毫秒更新進度條
        self.showPageProgressTimer = setInterval(() => {
          if (self.totalPageIndex > 0) {
            self.countdownCurrentTime = new Date();

            let base = 1;
            if (self.isShowGroup) base = self.displaySettings.summaryPatrolTime;
            else base = self.displaySettings.personPatrolTime;

            const percentage = (100 * (self.countdownCurrentTime - self.countdownStartTime)) / (base * 1000);
            self.pageProgressPercentage = `${percentage}%`;

            if (percentage >= 100) {
              self.pageProgressPercentage = '0%';
              if (self.currentPageIndex === self.totalPageIndex) {
                self.currentPageIndex = 0;
              } else {
                self.currentPageIndex += 1;
              }
            }
          }
        }, 1000);
      },

      zoomViews() {
        const self = this;
        const dashboard = document.querySelector('.dashboard');
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

      // Tulip
      setZoom(element) {
        // console.log('setZoom ============================');

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
        self.currentPageIndex = selectedIndex;
        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();
        self.resetAutoChangePageTimer();
      },

      // Tulip
      onClickGroup(evt, group) {
        const self = this;

        if (group.persons.length <= 0) return;

        self.currentGroup = group.groupName;
        self.isShowGroup = false;

        const currentGroupData = self.groupPersons.find((g) => g.groupName === group.groupName);

        self.displayAmount = self.setupPageLayoutAmount();

        self.currentPersons = currentGroupData.persons.slice(
          0,
          self.displayAmount,
        );

        self.currentPersons.forEach((pPerson) => {
          const person = pPerson;

          if (person.register_image === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlE'
            + 'QVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==') {
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

        self.currentPageIndex = 0;
        self.totalPageIndex = Math.ceil(currentGroupData.persons.length / self.displayAmount) - 1;

        self.dispPageIndexStart = self.currentPageIndex - 4;
        if (self.dispPageIndexStart < 0) {
          self.dispPageIndexStart = 0;
        }

        if (self.totalPageIndex >= 9) {
          if (self.dispPageIndexStart >= self.totalPageIndex - 8) {
            self.dispPageIndexStart = self.totalPageIndex - 8;
          }
        }

        self.dispPageIndexEnd = self.dispPageIndexStart + 8;
        if (self.dispPageIndexEnd >= self.totalPageIndex) {
          self.dispPageIndexEnd = self.totalPageIndex;
        }

        self.attendanceGroupTitle = group.groupName;
        self.zoomViews();
        self.resetAutoChangePageTimer();
      },

      // Tulip
      returnToAllGroups() {
        const self = this;

        self.isShowGroup = true;

        self.displayAmount = self.setupPageLayoutAmount();

        self.currentPageIndex = 0;
        self.totalPageIndex = Math.ceil(self.groupPersons.length / self.displayAmount) - 1;
        self.currentGroups = self.groupPersons.slice(0, self.displayAmount);

        self.dispPageIndexStart = self.currentPageIndex - 4;
        if (self.dispPageIndexStart < 0) {
          self.dispPageIndexStart = 0;
        }

        if (self.totalPageIndex >= 9) {
          if (self.dispPageIndexStart >= self.totalPageIndex - 8) {
            self.dispPageIndexStart = self.totalPageIndex - 8;
          }
        }

        self.dispPageIndexEnd = self.dispPageIndexStart + 8;
        if (self.dispPageIndexEnd >= self.totalPageIndex) {
          self.dispPageIndexEnd = self.totalPageIndex;
        }

        self.resetAutoChangePageTimer();
      },

      formatEpochTime(epochTime) {
        const date = new Date(epochTime);
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');

        return `${hour}:${minute}`;
      },

      onClickPrev() {
        const self = this;
        if (self.currentPageIndex === 0) return;

        self.currentPageIndex -= 1;
        self.resetAutoChangePageTimer();
      },

      onClickNext() {
        const self = this;
        if (self.currentPageIndex === self.totalPageIndex) return;

        self.currentPageIndex += 1;
        self.resetAutoChangePageTimer();
      },

      onClickPagerDot(index) {
        const self = this;
        self.currentPageIndex = index;
        self.resetAutoChangePageTimer();
      },

      // Tulip
      getStyleByAmount() {
        const self = this;
        let style = '';
        switch (self.displayAmount) {
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

      // Tulip
      getGroupStyleByAmount() {
        const self = this;
        let style = '';

        switch (self.displayAmount) {
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

      // Tulip
      getGridStyleByAmount() {
        // console.log('getGridStyleByAmount ============================');

        const self = this;
        let style = '';
        switch (self.displayAmount) {
          case 30:
            style = 'grid-6x5';
            break;
          case 8:
            style = 'grid-4x2';
            break;
          case 12:
            style = 'grid-4x3';
            break;
          case 48:
            style = 'grid-12x4';
            break;
          case 60:
            style = 'grid-12x5';
            break;
          case 18:
            style = 'grid-9x2';
            break;
          case 27:
            style = 'grid-9x3';
            break;
          case 24:
          default:
            style = 'grid-6x4';
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

  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.6);
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>