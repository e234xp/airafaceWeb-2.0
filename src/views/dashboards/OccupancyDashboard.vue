<template>
  <div
    v-show="!isLoadSetting"
    class="ratio-wrap ratio-wrap-16x9"
  >
    <div
      class="ratio-content dashboard dashboard--absolute"
      :style="{ backgroundImage: 'url(' + displaySettings.background_image + ')' }"
    >
      <div
        class="occupancy-logo-container"
        :style="{ zoom: zoomRatio }"
      >
        <div
          class="occupancy-logo"
          @click="toLoginPage"
        >
          <img
            :src="displaySettings.logo"
            class="occupancy-logo-img"
          >
        </div>
        <div class="occupancy-time">
          {{ currentTime }}
        </div>
      </div>

      <!-------------------  Title ------------------>
      <h1 class="title">
        House Warming Party
      </h1>

      <!-------------------  Attendance - BEGIN ------------------>
      <div
        v-if="displaySettings.displayChart"
        class="attendance-top-box attendance-top-box--margin"
      >
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag">
            <div>
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
                <CIcon
                  name="cilSortDescending"
                  class="attendance-sort-icon text-white"
                />
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{ getSortByText }}</span>
              </div>
              <button class="btn-reset">
                <img
                  class="attendance-dropdown-arrow"
                  src="@/assets/img/dropdown_arrow_down.svg"
                  alt="dropdown_arrow_down"
                >
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

      <!-- 顯示人員資料列表 -->
      <div class="person-list-wrapper">
        <transition
          name="fade"
          mode="out-in"
        >
          <div
            :key="currentPageIndex"
            :style="{ 'margin-left': `${20 * zoomRatio}px`, 'margin-right': `${20 * zoomRatio}px` }"
            :class="[getGridStyleByAmount(), 'd-flex', 'flex-wrap', 'person-list-container']"
          >
            <div
              v-for="(person, index) in currentPersons"
              :key="index"
              :class="['person-card', person.status === 1 ? 'absent-person-card' : '', getStyleByAmount()]"
              :style="'zoom: ' + zoomRatio + ' !important; border-left: 4px solid ' + getGroupColor(person) + ';'"
            >
              <img
                v-show="displaySettings.displayPhoto != 'NONE'"
                :class="['person-image', person.status === 1 ? 'absent-person-image' : '']"
                :src="getImageSrc(person)"
              >
              <div class="person-info-box">
                <div
                  v-show="displaySettings.displayCardMode == 'STANDARD'"
                  class="person-info-line1"
                >
                  {{ showField(person, displaySettings.line2) }} &nbsp;
                </div>
                <div
                  :class="[person.status === 1 ? 'absent-person-name' : 'person-name']"
                  :style="'zoom: ' + zoomRatio + ' !important; color: ' + getGroupColor(person) + ';'"
                >
                  {{ getDisplayName(person) }}
                </div>
                <div
                  v-if="person.status !== 1"
                  class="d-flex align-items-end"
                />
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- footer -->
      <div class="footer-box">
        <div
          v-show="isLoadSetting"
          class="align-items-center loading-text"
        >
          Loading...
        </div>

        <!-- 分頁按鈕 -->
        <div class="pager">
          <button
            class="pager-arrow-btn"
            :disabled="currentPageIndex === 0"
            @click="onClickPrev"
          >
            <img
              class="pager-arrow-img"
              src="@/assets/img/pager_left_arrow.svg"
              alt="prev"
            >
          </button>
          <span class="pager-text">{{ currentPageIndex + 1 }}/{{ totalPageIndex + 1 }}</span>
          <button
            class="pager-arrow-btn"
            :disabled="currentPageIndex === totalPageIndex"
            @click="onClickNext"
          >
            <img
              class="pager-arrow-img"
              src="@/assets/img/pager_right_arrow.svg"
              alt="next"
            >
          </button>
        </div>
        <!-- 右下角 powered by aira 字樣 -->
        <!-- <div class="footer-detail-box">
          <div class="footer-detail-text">
            powered by
          </div>
          <img
            src="@/assets/img/aira-logo-white.svg"
            alt=""
            class="footer-logo"
          >
        </div> -->
      </div>
    </div>
    <div
      v-if="loading"
      class="loading"
    >
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

const emptyFace = '/img/empty-face.svg';

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
        personPatrolTime: 5,
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
      const self = this;
      let presentArray = [];

      if (self.persons) {
        presentArray = self.persons.filter((p) => p.status === 0);
      }

      return presentArray.length;
    },
    attendanceTotal() {
      return this.persons.length;
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

      self.currentPersons = self.persons.slice(beginIndex, beginIndex + self.displayAmount);

      self.currentPersons.forEach((item) => {
        const person = item;
        if (
          person.register_image ===
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg=='
        ) {
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
        self.zoomViews();
      }, 100);
    },
  },
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

  async mounted() {
    const self = this;

    self.isLoadSetting = true;

    // 1.0 Load Display Config
    const { data: display } = await self.$globalGetDisplaySetting();
    self.displaySettings = { ...self.displaySettings, ...display.OCCUPANCY };

    if (self.displaySettings.dailyResetTime.length === 2) {
      self.displaySettings.dailyResetTime += ':00';
    }

    // 1.5 Load Attendance Config
    const setting = await self.$globalGetAttendanceSettings();
    const videoDeviceGroupIn = setting.data.video_device_group_in;
    const videoDeviceGroupOut = setting.data.video_device_group_out;

    const {
      data: { list: cameraList },
    } = await this.$globalFindCameras('', 0, 3000);
    const {
      data: { data_list: tabletList },
    } = await this.$globalGetTabletList('', 0, 3000);

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

    // 2.0 initial Group Person
    await self.initialGroupPerson();

    // 3.0 initial Views
    self.initViews();

    // 4.0 先關閉 Loading 狀態
    self.isLoadSetting = false;

    // 等待 DOM 完全渲染後再計算頁面佈局
    self.$nextTick(() => {
      // 先計算 zoomRatio，再計算頁面佈局
      self.zoomViews();

      // 使用 requestAnimationFrame 確保瀏覽器已完成佈局計算
      requestAnimationFrame(() => {
        self.refreshData();

        if (self.totalPageIndex >= 1) {
          self.resetAutoChangePageTimer();
        }
      });
    });

    // 5.0 defind query startTS
    const nowHM = `${`00${new Date().getHours()}`.slice(-2)}:${`00${new Date().getMinutes()}`.slice(-2)}`;

    let startTS = new Date().setHours(
      self.displaySettings.dailyResetTime.split(':')[0],
      self.displaySettings.dailyResetTime.split(':')[1],
      0,
      0,
    );
    if (nowHM < self.displaySettings.dailyResetTime) {
      startTS -= 86400000;
    }

    const endTS = new Date() - 1000;

    this.$nextTick(() => {
      self.initBarChart();
      self.initDoughnutChart();
    });

    // 6.0 Load Last Data
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

    // 7.0 start Looper
    self.setupCurrentTimeLooper();
  },

  destroyed() {
    const self = this;

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
    getImageSrc(personData) {
      // 需要排除的 placeholder 圖片
      const transparentPlaceholder =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';

      const isPlaceholder = (img) => {
        if (!img || typeof img === 'object') return true;
        if (img === transparentPlaceholder) return true;
        if (img === emptyFace) return true;
        return false;
      };

      const registerImg = isPlaceholder(personData.register_image) ? '' : personData.register_image;
      const displayImg = isPlaceholder(personData.display_image) ? '' : personData.display_image;

      // 預設顯示 display_image，沒有才顯示 register_image，都沒有就顯示空白人像 icon
      const b64 = displayImg || registerImg || personData.lastImage;

      if (b64 && !isPlaceholder(b64)) {
        this.$set(personData, 'lastImage', b64);
        return `data:image/png;base64,${b64}`;
      }
      // 都沒有照片時顯示空白人像 SVG
      return emptyFace;
    },
    range(start, end) {
      let ret = [];

      if (start <= end) {
        ret = Array(end - start + 1)
          .fill()
          .map((val, i) => start + i);
      }

      return ret;
    },

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

      // 先取得群組資料（包含 person_list 排序）
      await self.setupGroupData();

      const raw = await self.setupPersonData();

      self.persons = raw.map((item) => {
        const person = { ...item };
        // 如果有物件格式就拆成字串
        if (typeof person.register_image === 'object') {
          person.register_image = '';
        }
        if (typeof person.display_image === 'object') {
          person.display_image = '';
        }
        // 新增快取欄位，初始設空
        person.lastImage = '';
        return person;
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

      // 建立群組名稱到 person_list 的對應表
      const groupPersonListMap = {};
      self.groupData.forEach((g) => {
        groupPersonListMap[g.groupName] = g.person_list || [];
      });

      // sort person by group order, then by person_list order within group
      self.persons.sort((a, b) => {
        // 取得人員所屬群組在 displayGroup 中的最小索引，以及對應的群組名稱
        const getGroupInfo = (person) => {
          if (!person.group_list || !Array.isArray(person.group_list)) {
            return { index: 999, groupName: null };
          }
          let minIndex = 999;
          let primaryGroup = null;
          person.group_list.forEach((group) => {
            const idx = self.displaySettings.displayGroup.indexOf(group);
            if (idx >= 0 && idx < minIndex) {
              minIndex = idx;
              primaryGroup = group;
            }
          });
          return { index: minIndex, groupName: primaryGroup };
        };

        const aGroupInfo = getGroupInfo(a);
        const bGroupInfo = getGroupInfo(b);

        // 先按群組順序排序
        if (aGroupInfo.index !== bGroupInfo.index) {
          return aGroupInfo.index - bGroupInfo.index;
        }

        // 同一群組內按 person_list 順序排序
        const { groupName } = aGroupInfo;
        const personList = groupPersonListMap[groupName] || [];

        // person_list 裡存的是物件 { uuid, id, name }，需要用 findIndex 比對 uuid
        const aPersonIndex = personList.findIndex((p) => p.uuid === a.uuid);
        const bPersonIndex = personList.findIndex((p) => p.uuid === b.uuid);

        // 如果都在 person_list 中，按 person_list 順序
        if (aPersonIndex >= 0 && bPersonIndex >= 0) {
          return aPersonIndex - bPersonIndex;
        }
        // 如果只有一個在 person_list 中，在 list 中的排前面
        if (aPersonIndex >= 0) return -1;
        if (bPersonIndex >= 0) return 1;

        // 都不在 person_list 中，按姓名排序
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
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
                groupName: depart,
                persons: [person],
                present: 0,
                total: 1,
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
                groupName: title,
                persons: [person],
                present: 0,
                total: 1,
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
              } else if (self.displaySettings.displayGroup.indexOf(group) >= 0) {
                self.groupPersons.push({
                  groupName: group,
                  persons: [person],
                  present: 0,
                  total: 1,
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
        const pNames = `${person.name} `.split(' ');
        person.partialName = pNames[0].charAt(0);

        if (pNames.length >= 3) {
          person.partialName += `. ${pNames[pNames.length - 2]}`;
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
            const pNames = `${person.name} `.split(' ');
            ret = pNames[0].charAt(0);

            if (pNames.length >= 3) {
              ret += `. ${pNames[pNames.length - 2]}`;
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

    refreshData() {
      const self = this;

      self.displayAmount = self.setupPageLayoutAmount();

      // 直接顯示所有人員資料
      self.currentPersons = self.persons.slice(
        self.currentPageIndex * self.displayAmount,
        (self.currentPageIndex + 1) * self.displayAmount,
      );

      self.totalPageIndex = Math.ceil(self.persons.length / self.displayAmount) - 1;

      self.currentPersons.forEach((item) => {
        const person = item;

        if (
          person.register_image ===
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg=='
        ) {
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

    refreshDoughnutChart() {
      // from attendancePresent and persons

      const self = this;

      const normal = self.attendancePresent;
      const absent = self.persons.length - self.attendancePresent;

      const ctx = document.getElementById('doughnut-chart-canvas');

      self.setupAttendanceDoughnutChart(ctx, [normal, absent], true);
    },

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

        self.setupDashboardChart(ctx, self.chartLabels, self.chartDataIn, self.chartDataOut, self.chartDataPresent);
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
        passModeRecord = data.filter(
          (attRec) => attRec.uuid !== undefined && attRec.verify_mode !== 3 && attRec.verify_mode !== 4,
        );
        clockModeRecord = data.filter((attRec) => attRec.verify_mode === 3 || attRec.verify_mode === 4);

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
              if (!person.clockinRecord && !person.clockoutRecord) {
                // 沒有 in & 沒有 out
                person.punchMode = 0;
                person.status = 1;
              } else if (!person.clockinRecord && person.clockoutRecord) {
                // 沒有 in & 有 out
                person.punchMode = 0;
                person.status = 1;
              }
              if (person.clockinRecord && !person.clockoutRecord) {
                // 有 in & 沒有 out
                person.punchMode = 3;
                person.status = 0;
              }
              if (person.clockinRecord && person.clockoutRecord) {
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
      // 動態計算每頁可放幾張卡片
      const self = this;
      const columns = 5; // 固定 5 欄
      const cardHeight = 104; // 卡片高度（卡片本身已有 zoom 屬性）
      const cardMargin = 12; // 卡片間距
      // 卡片有 zoom 屬性，所以實際佔用高度要乘以 zoomRatio
      const zoomRatio = self.zoomRatio || 1;
      const cardTotalHeight = (cardHeight + cardMargin) * zoomRatio;

      // 取得卡片列表容器的可用高度
      const listWrapper = document.querySelector('.person-list-wrapper');
      if (listWrapper) {
        const availableHeight = listWrapper.clientHeight;
        // 確保至少能顯示完整的行數
        const rows = Math.floor(availableHeight / cardTotalHeight) || 4;
        return columns * rows;
      }

      // 預設 5x4 = 20
      return 20;
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

      // 每 1000 毫秒更新進度條
      self.showPageProgressTimer = setInterval(() => {
        if (self.totalPageIndex > 0) {
          self.countdownCurrentTime = new Date();

          const base = self.displaySettings.personPatrolTime;

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

        const dW = width - 1920 * self.zoomRatio;
        const dH = height - 1080 * self.zoomRatio;

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

      self.setupDashboardChart(ctx, self.chartLabels, self.chartDataIn, self.chartDataOut, self.chartDataPresent);
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

    getStyleByAmount() {
      // 固定使用 person-card 樣式
      return 'person-card';
    },

    getGridStyleByAmount() {
      // 固定使用 grid-5 樣式 (一行5張)
      return 'grid-5';
    },

    getGroupColor(person) {
      // 缺席的人用白色
      if (person.status === 1) {
        return '#FFFFFF';
      }

      // 根據群組名稱取得對應顏色
      const groupColors = {
        Employee: '#FF9D72',
        Partner: '#44C961',
        VIP: '#5B9AF9',
        來賓: '#F066FC',
      };

      // 取得人員所屬群組中，在 displayGroup 順序最前面的群組
      if (person.group_list && Array.isArray(person.group_list)) {
        let minIndex = 999;
        let primaryGroup = null;

        person.group_list.forEach((group) => {
          const idx = this.displaySettings.displayGroup.indexOf(group);
          if (idx >= 0 && idx < minIndex) {
            minIndex = idx;
            primaryGroup = group;
          }
        });

        if (primaryGroup && groupColors[primaryGroup]) {
          return groupColors[primaryGroup];
        }
      }

      // 預設白色
      return '#FFFFFF';
    },
  },
};
</script>

<style lang="scss" scoped>
.header-reset {
  display: none;
}

.main-reset {
  padding-top: 0px !important;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-reset {
  padding-left: 0px !important;
  padding-right: 0px !important;
  margin-left: 0px !important;
  margin-right: 0px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-reset {
  display: none;
}

.dashboard {
  font-family: 'Noto Sans', sans-serif;
  position: relative;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  overflow: hidden;

  &--absolute {
    position: absolute;
    z-index: 50;
    background-size: 100%;
    min-height: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column;
  }

  .title {
    font-family: 'Noto Sans';
    font-size: 88px;
    line-height: 0.8em;
    color: white;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.5px;
    text-shadow: 0px 0px 12px #00afff, 0px 0px 6px #44c4ff;
    text-align: center;
    margin: 2.5rem 0;
  }

  .pager {
    display: flex;
    align-items: center;
    padding: 20px 0;
  }
}

.occupancy-logo-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  width: 100%;

  .occupancy-logo {
    width: 360px;
    height: auto;
    cursor: pointer;

    &-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .occupancy-time {
    font-family: 'Noto Sans', sans-serif;
    color: white;
    font-size: 4rem;
    font-weight: 400;
  }
}

.dashboard-divider {
  margin: 12px 0;

  &--margin {
    margin-left: 20px;
    margin-right: 20px;
  }
}

.attendance-top-box {
  width: 100%;
  height: 240px;
  margin-bottom: 25px;
  display: flex;

  &--margin {
    margin-left: 20px;
    margin-right: 20px;
  }
}

.attendance-statistics-box {
  width: 504px;
  height: 240px;
  border-right: 1px solid #565758;
  margin-bottom: 22px;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.attendance-statistics-data-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid #565758;
}

.attendance-title {
  margin-left: 20px;
  color: white;
  font-weight: 200;
  font-size: 32px;
  font-family: 'Noto Sans', sans-serif;
}

.attendance-header-tag {
  height: 41px;
  border-radius: 4px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 200;
  color: white;
  font-size: 32px;
}

.attendance-header-present {
  font-weight: 400;
  font-size: 80px;
  color: #8dcdff;
  font-family: 'Noto Sans', sans-serif;
  margin-right: 8px;
  line-height: 0.7em;
}

.attendance-header-total {
  font-weight: 500;
  font-size: 44px;
  font-family: 'Noto Sans', sans-serif;
  color: #737578;
  line-height: 0.7em;
}

.attendance-return-arrow {
  width: 24px;
  height: 22px;
  margin-right: 24px;
}

.attendance-sort-icon {
  width: 20px !important;
  height: 20px !important;
}

.attendance-dropdown-arrow {
  margin-left: 20px;
  width: 12px;
  height: 6px;
}

.attendance-group-card-name {
  color: white;
  font-family: 'Noto Sans', sans-serif;
  text-overflow: ellipsis;
  font-size: 22px;
  line-height: 0.75em;
  text-align: left;
}

.attendance-chart-canvas-wrap {
  width: 1363px;
}

.doughnut-chart-canvas-wrap {
  width: 95px;
  height: 95px;
}

#chart-canvas {
  width: 80% !important;
  height: 100% !important;
}

#doughnut-chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.person-list-wrapper {
  flex: 1;
  overflow: hidden;
  margin-bottom: 10px;
}

.person-list-container {
  align-items: start;
  align-content: start;
  grid-auto-rows: min-content;
}

.grid-5 {
  display: grid !important;
  gap: 0.7%;
  grid-template-columns: repeat(5, 1fr);
}

.person-card {
  background: rgba(74, 74, 74, 0.3);
  backdrop-filter: blur(16px);
  border-radius: 0 8px 8px 0;
  width: 100%;
  height: 104px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;

  .person-image {
    width: 80px;
    height: 80px;
    border-radius: 2px;
    object-fit: contain;
  }

  .absent-person-image {
    opacity: 0.6;
  }

  .person-info-box {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .person-info-line1 {
      font-weight: 500;
      font-size: 18px;
      color: white;
    }

    .person-name,
    .absent-person-name {
      display: inline-block;
      line-height: 100%;
      color: white;
      font-weight: 700;
      font-size: 20px;
    }
  }
}

.absent-person-card {
  opacity: 0.4;
}

.clockin-time {
  margin-right: 20px;
}

.group-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  transition: 0.5s ease-in-out;

  &.card-flip {
    transform: rotateX(360deg);
  }
}

.group-card-present-number {
  color: #6fa4cd;
  font-size: 60px;
  margin-right: 8px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 500;
  line-height: 0.7em;
}

.group-card-total-number {
  font-family: 'Noto Sans', sans-serif;
  color: #737578;
  font-size: 24px;
  font-weight: 500;
  line-height: 0.7em;
}

.group-card-6x4,
.group-card-6x5 {
  width: 302px;
  height: 152px;
  background: #37393c;
  padding: 16px;
  margin-bottom: 9px;
}

.pager-arrow-btn {
  padding: 4px 8px;
  cursor: pointer;
  background: transparent;
  border: none;

  &:disabled {
    cursor: not-allowed;
    background: transparent;
    opacity: 0.4;
  }
}

.pager-arrow-img {
  width: 10px;
  height: auto;
  display: block;
}

.pager-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 24px;
}

.footer-box {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 20px 0 40px;
}

.footer-detail-box {
  position: absolute;
  bottom: 0.96%;
  right: 0;
  display: flex;
  color: white;
  align-items: end;
}

.footer-detail-text {
  font-size: 14px;
  font-weight: 200;
  margin-right: 9px;
  line-height: 0.6em;
}

.footer-logo {
  width: 54px;
  height: 24px;
  object-fit: contain;
}

.loading-text {
  color: white;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
