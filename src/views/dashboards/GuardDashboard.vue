<template>
  <div
    class="ratio-wrap ratio-wrap-16x9"
    v-show="!isLoadSetting"
  >
    <div
      class="ratio-content dashboard"
      style="position: absolute; z-index: 50;"
      :style="{backgroundImage:'url('+displaySettings.background_image+')'}"
    >
      <div
        class="dashboard-header d-flex justify-content-between"
        style="margin-left: 20px; margin-right: 20px;"
      >
        <div class="d-flex align-items-center">
          <div
            class="dashboard-attendance-logo"
            @click="toLoginPage"
            :style="[{backgroundImage:'url('+displaySettings.logo+')'}, 'zoom: ' + zoomRatio + ' !important;']"
          />
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
      <div
        class="guard-divider"
        style="width: 100%; height: 1px; border-bottom: 1px solid #6a6b6c"
      />

      <div
        class="guard-content"
        style="display: flex; width: 100%;"
        :style="{ height: `calc(100% - ${61 * zoomRatio}px)` }"
      >
        <!-------------------  Guard - LEFT ------------------>
        <div
          style="width: 100%; padding: 24px; position: relative;"
          :style="'zoom: ' + zoomRatio + ' !important;'"
        >
          <div
            style="display: flex; width: 100%; height: 240px; background: #2C2C2C; margin-bottom: 16px;"
            :style="{ opacity: expandFlag === '' ? 1 : 0 }"
          >
            <div
              class="fz-xxxl"
              style="width: 10%; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0 16px 16px;"
            >
              <div>{{ $t('HourlyNumberOfAdmission') }}</div>
              <div>
                <span
                  class="fz-super-large"
                  style="color: #7FB97A"
                >{{ entryPersons.length }}</span> {{ $t('UnitPerson') }}
              </div>
            </div>
            <div style="width: 90%; height:100%; padding: 8px 24px; border-radius: 8px;">
              <canvas ref="canvas" />
            </div>
          </div>
          <template v-if="expandFlag === ''">
            <GuardRegionTitle
              :index="currentPageIndex"
              :total="currentPageTotal"
              :expand="false"
              @prev="onCurrentPrev"
              @next="onCurrentNext"
              @expand="onExpand('current')"
              type="present"
            >
              {{ $t('PersonOfAdmission') }}
            </GuardRegionTitle>
            <div
              class="grid-2-6"
              style="height: 240px; margin-bottom: 16px;"
            >
              <FaceCard
                type="present"
                :image="parseImage(item)"
                :name="parseLine1(item)"
                :depart="parseLine2(item)"
                :time="item.clockinRecord.timestamp"
                v-for="item in currentPersons"
                :key="item.uuid"
              />
            </div>
            <GuardRegionTitle
              :index="strangerPageIndex"
              :total="strangerPageTotal"
              :expand="false"
              @prev="onStrangerPrev"
              @next="onStrangerNext"
              @expand="onExpand('stranger')"
              type="unknown"
            >
              <div style="display: flex; gap: 16px">
                <div style="margin-right: 16px;">
                  {{ $t('Stranger') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  style="padding: 0 16px;"
                  @click="onSelectAll"
                >
                  {{ $t('SelectAll') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  style="padding: 0 16px;"
                  @click="onCancelAll"
                >
                  {{ $t('Cancel') }}
                </div>
                <div>{{ selectedStrangers.length }} / {{ entryStrangers.length }} {{ $t('Selected') }}</div>
                <div
                  class="chart-btn fz-lg"
                  :class="[ selectedStrangers.length === 0 ? 'disabled' : '' ]"
                  style="padding: 0 16px; margin-left: auto"
                  @click="onBatchAck(false)"
                >
                  {{ $t('Remarks') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  :class="[ selectedStrangers.length === 0 ? 'disabled' : '' ]"
                  style="padding: 0 16px;"
                  @click="onBatchAck(true)"
                >
                  {{ $t('Acknowledge') }}
                </div>
              </div>
            </GuardRegionTitle>
            <div
              class="grid-2-6"
              style="height: 240px;"
            >
              <FaceCard
                type="unknown"
                :image="item.face_image"
                :time="item.timestamp"
                :selected="isSelected(item.verify_uuid)"
                @ack="onAck(item.verify_uuid)"
                @click.native="onSelect(item.verify_uuid)"
                v-for="item in currentStrangers"
                :key="item.verify_uuid"
              />
            </div>
          </template>
          <template v-if="expandFlag === 'current'">
            <GuardRegionTitle
              :index="currentPageIndex"
              :total="currentPageTotal"
              :expand="true"
              @prev="onCurrentPrev"
              @next="onCurrentNext"
              @expand="onExpand('')"
              type="present"
              style="position: absolute; top: 16px; left: 24px; width: calc(100% - 40px)"
            >
              {{ $t('PersonOfAdmission') }}
            </GuardRegionTitle>
            <div
              class="grid-7-6"
              style="position: absolute; top: 80px; left: 24px; width: calc(100% - 40px); margin-bottom: 16px; height: 708px"
            >
              <FaceCard
                type="present"
                :image="parseImage(item)"
                :name="parseLine1(item)"
                :depart="parseLine2(item)"
                :time="item.clockinRecord.timestamp"
                v-for="item in currentPersons"
                :key="item.uuid"
              />
            </div>
          </template>
          <template v-else-if="expandFlag === 'stranger'">
            <GuardRegionTitle
              :index="strangerPageIndex"
              :total="strangerPageTotal"
              :expand="true"
              @prev="onStrangerPrev"
              @next="onStrangerNext"
              @expand="onExpand('')"
              type="unknown"
              style="position: absolute; top: 16px; left: 24px; width: calc(100% - 40px)"
            >
              <div style="display: flex; gap: 16px">
                <div style="margin-right: 16px;">
                  {{ $t('Stranger') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  style="padding: 0 16px;"
                  @click="onSelectAll"
                >
                  {{ $t('SelectAll') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  style="padding: 0 16px;"
                  @click="onCancelAll"
                >
                  {{ $t('Cancel') }}
                </div>
                <div>{{ selectedStrangers.length }} / {{ entryStrangers.length }} 已選</div>
                <div
                  class="chart-btn fz-lg"
                  :class="[ selectedStrangers.length === 0 ? 'disabled' : '' ]"
                  style="padding: 0 16px; margin-left: auto"
                  @click="onBatchAck(false)"
                >
                  {{ $t('Remarks') }}
                </div>
                <div
                  class="chart-btn fz-lg"
                  :class="[ selectedStrangers.length === 0 ? 'disabled' : '' ]"
                  style="padding: 0 16px;"
                  @click="onBatchAck(true)"
                >
                  {{ $t('Acknowledge') }}
                </div>
              </div>
            </GuardRegionTitle>
            <div
              class="grid-7-6"
              style="position: absolute; top: 80px; left: 24px; width: calc(100% - 40px); margin-bottom: 16px; height: 708px"
            >
              <FaceCard
                type="unknown"
                :image="item.face_image"
                :time="item.timestamp"
                :selected="isSelected(item.verify_uuid)"
                @ack="onAck(item.verify_uuid)"
                @click.native="onSelect(item.verify_uuid)"
                v-for="item in currentStrangers"
                :key="item.verify_uuid"
              />
            </div>
          </template>
        </div>
        <!-------------------  Guard - RIGHT ------------------>
        <div
          style="width: 20%; height: 100%; background: rgba(44, 44, 44, 0.4); padding: 16px; color: white"
          :style="'zoom: ' + zoomRatio + ' !important;'"
          v-if="false"
        >
          <div
            class="fz-xxxl"
            style="margin-bottom: 24px"
          >
            即時影像
          </div>
          <video
            ref="video"
            autoplay
            height="100"
            style="width: 100%"
          />
          <CameraVideo
            :name="'1 號攝影機 - 大門'"
            style="margin-bottom: 24px"
          />
          <CameraVideo :name="'2 號攝影機 - 會議室'" />
        </div>
      </div>

      <!-- footer -->
      <div
        class="footer-box d-flex justify-content-between"
        style="margin: 0 20px"
        v-if="false"
      >
        <!-- 右下角 powered by aira 字樣 -->
        <div class="footer-detail-box">
          <div class="footer-detail-text">
            powered by
          </div>
          <img
            src="@/assets/img/latticework-logo-white.png"
            alt=""
            class="footer-logo"
          >
        </div>
      </div>
    </div>
    <GuardAckModal
      :style="'zoom: ' + zoomRatio + ' !important;'"
      :persons="ackedStrangers"
      :direct="autoAck"
      @close="onClose"
      @confirm="onConfirm"
      v-if="showAckModal"
    />
    <div
      class="loading"
      v-if="loading"
    >
      <CSpinner color="primary" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { airaLogoWhite as airaLogo, defaultPhotoImage } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';

import occupancyModel from '@/models/OccupancyDashboardModel.vue';
import chartHelper from '@/utils/ChartHelper.vue';

import FaceCard from './components/FaceCard.vue';
import GuardRegionTitle from './components/GuardRegionTitle.vue';
import GuardAckModal from './components/GuardAckModal.vue';
import CameraVideo from './components/CameraVideo.vue';

export default {
  name: 'GuardDashboard',

  components: {
    FaceCard, GuardRegionTitle, GuardAckModal, CameraVideo,
  },

  data() {
    return {
      emptyFace: defaultPhotoImage,
      unSubscribe: null,
      obj_loading: null,

      isLoadSetting: true,
      zoomRatio: 0,

      // idleTime: null,
      currentDate: '',
      currentTime: '',
      currentTimeLooper: null,

      params_entryChannels: [],
      params_leaveChannels: [],

      persons: [],
      entryStrangers: [],

      hourlyPersonInData: new Map(),
      hourlyPersonOutData: new Map(),

      chartBarAmount: 24,
      chartLabels: [],
      chartDataIn: [],
      chartDataOut: [],

      isShowGroup: true,
      // 分頁：
      currentPageIndex: 0,
      strangerPageIndex: 0,
      displayAmount: 12,
      expandAmount: 42,
      normalAmount: 12,

      showPageProgressTimer: null,
      totalPageIndex: 0,

      // currentPersons: [],
      // currentStrangers: [],
      selectedStrangers: [],
      ackedStrangers: [],

      displaySettings: {
        displayMode: 'GUARD',
        uuid: '',
        background_image: backgroundImage,
        logo: airaLogo,

        displayGroup: ['All Person'],
        displayPhoto: 'REGISTER', // NONE, REGISTER, SNAPSHOT, DISPLAY
        line1: 'NAME', // NONE, NAME, PARTIALNAME
        line2: 'NONE', // NONE, JOBTITLE, GROUP, DEPARTMENT, TEMPERATURE

        dailyResetTime: '00:00',

        deviceIn: '',
        deviceOut: '',
      },

      showAckModal: false,
      autoAck: false,
      expandFlag: '',

      stream: null,

      deviceIn: {},
      deviceOut: {},

      authKey: '',
      emptyImg: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
    };
  },
  mixins: [occupancyModel, chartHelper],
  computed: {
    ...mapState(['deviceName']),
    entryPersons() {
      return this.persons.filter((p) => p.status === 0).sort((a, b) => b.clockinRecord.timestamp - a.clockinRecord.timestamp);
    },
    currentPersons() {
      const beginIndex = this.displayAmount * this.currentPageIndex;
      return this.entryPersons.slice(
        beginIndex,
        beginIndex + this.displayAmount,
      );
    },
    currentPageTotal() {
      return Math.ceil(this.entryPersons.length / this.displayAmount) - 1;
    },
    currentStrangers() {
      const beginIndex = this.displayAmount * this.strangerPageIndex;
      return this.entryStrangers.slice(
        beginIndex,
        beginIndex + this.displayAmount,
      );
    },
    strangerPageTotal() {
      return Math.ceil(this.entryStrangers.length / this.displayAmount) - 1;
    },
  },
  // Tulip
  async created() {
    const self = this;

    this.unSubscribe = this.$store.subscribe(async (mutation) => {
      let payload = {};
      let person = {};
      let result = {};
      // console.log(mutation);
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
            console.log('created subscribe', 'mutation payload statusCode == 200');
            return;
          }

          payload = mutation.payload;
          if (payload.merged) return;

          if (payload.type === 0) {
            self.applyVerifyToStranger([{
              ...payload,
              verify_uuid: payload.verify_face_id,
              face_image: payload.snapshot,
              source_id: payload.source_id || payload.channel || '',
              verify_score: payload.score,
              nearest_person: payload.person,
            }]);
            // this.refreshStranger();
          }

          if (payload.type === 1) {
            // console.log('========== changeNotifications');
            // console.log(payload);

            person = payload.person || payload.person_info;

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
            this.refreshData();
            self.refreshBarChart();
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
  },

  // Tulip
  async mounted() {
    this.isLoadSetting = true;

    // 1.0 Load Display Config
    const { data: display } = await this.$globalGetDisplaySetting();
    this.displaySettings = { ...this.displaySettings, ...display.GUARD };

    if (this.displaySettings.dailyResetTime.length === 2) {
      this.displaySettings.dailyResetTime += ':00';
    }

    const { data: { list: cameraList } } = await this.$globalFindCameras('', 0, 3000);
    const { data: { data_list: tabletList } } = await this.$globalGetTabletList('', 0, 3000);

    this.params_entryChannels.push(this.displaySettings.deviceIn);
    this.params_leaveChannels.push(this.displaySettings.deviceOut);

    this.params_entryChannels = this.params_entryChannels.map((id) => {
      const camera = cameraList.find((c) => c.uuid === id);
      const tablet = tabletList.find((c) => c.uuid === id);
      if (camera) return `${id}${camera.name}`;
      if (tablet) return `${id}${tablet.identity}`;
      return id;
    });

    this.params_leaveChannels = this.params_leaveChannels.map((id) => {
      const camera = cameraList.find((c) => c.uuid === id);
      const tablet = tabletList.find((c) => c.uuid === id);
      if (camera) return `${id}${camera.name}`;
      if (tablet) return `${id}${tablet.identity}`;
      return id;
    });

    console.log(this.params_entryChannels);
    console.log(this.params_leaveChannels);

    await this.initialGroupPerson();

    // 4.0 initial Views
    this.initViews();

    // 5.0 display Layout
    // this.refreshData();

    this.isLoadSetting = false;

    // 6.0 defind query startTS
    const nowHM = `${`00${new Date().getHours()}`.slice(-2)}:${`00${new Date().getMinutes()}`.slice(-2)}`;

    let startTS = new Date().setHours(this.displaySettings.dailyResetTime.split(':')[0], this.displaySettings.dailyResetTime.split(':')[1], 0, 0);
    if (nowHM < this.displaySettings.dailyResetTime) {
      startTS -= 86400000;
    }

    const endTS = new Date() - 1000;

    // 7.0 Load Verify Data
    this.setupVerifyData(startTS, endTS, (verifyData) => {
      // console.log(verifyData);
      this.applyVerifyToPerson(verifyData);
      this.refreshData();
      this.refreshBarChart();
    });

    // 7.0 Load Stranger Data
    this.setupStrangerData(startTS, endTS, (strangerData) => {
      this.applyVerifyToStranger(strangerData.filter((d) => d.merged === undefined || d.merged === false).filter((d) => !d.commands));
      this.refreshStranger();
    });

    // 8.0 start Looper
    this.setupCurrentTimeLooper();

    this.$nextTick(() => {
      this.zoomViews();
      this.initBarChart();
    });
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

    if (self.currentTimeLooper) {
      clearInterval(self.currentTimeLooper);
      self.currentTimeLooper = null;
    }

    this.unSubscribe();

    window.removeEventListener('resize', () => {
      self.zoomViews();
    });
  },
  methods: {
    onCurrentPrev() {
      if (this.currentPageIndex === 0) return;
      this.currentPageIndex -= 1;
    },

    onCurrentNext() {
      if (this.currentPageIndex === (this.currentPageTotal - 1)) return;
      this.currentPageIndex += 1;
      this.refreshData();
    },

    onStrangerPrev() {
      if (this.strangerPageIndex === 0) return;
      this.strangerPageIndex -= 1;
    },

    onStrangerNext() {
      if (this.strangerPageIndex === (this.strangerPageTotal - 1)) return;
      this.strangerPageIndex += 1;
      this.refreshStranger();
    },

    isSelected(id) {
      return this.selectedStrangers.indexOf(id) >= 0;
    },

    onClose() {
      this.showAckModal = false;
    },

    onExpand(flag) {
      if (flag === '') {
        this.displayAmount = this.normalAmount;
        if (this.expandFlag === 'current') {
          this.currentPageIndex = Math.floor((this.currentPageIndex * this.expandAmount) / this.normalAmount);
        }
        if (this.expandFlag === 'stranger') {
          this.strangerPageIndex = Math.floor((this.strangerPageIndex * this.expandAmount) / this.normalAmount);
        }
      } else {
        this.displayAmount = this.expandAmount;
        if (flag === 'current') {
          this.currentPageIndex = Math.floor((this.currentPageIndex * this.normalAmount) / this.expandAmount);
          this.refreshData();
        }
        if (flag === 'stranger') {
          this.strangerPageIndex = Math.floor((this.strangerPageIndex * this.normalAmount) / this.expandAmount);
          this.refreshStranger();
        }
      }
      this.expandFlag = flag;
      if (this.expandFlag === '') {
        this.$nextTick(() => {
          this.refreshBarChart();
        });
      }
    },

    onSelect(uuid) {
      const idx = this.selectedStrangers.findIndex((id) => id === uuid);
      if (idx < 0) this.selectedStrangers.push(uuid);
      else this.selectedStrangers.splice(idx, 1);
    },

    onAck(id) {
      const person = this.currentStrangers.find((item) => item.verify_uuid === id);
      if (!person) return;
      if ((!person.nearest_person || !person.nearest_person.person_info)) {
        this.ackedStrangers = [person];
        this.showAckModal = true;
        return;
      }
      const uuid = person.person_id || person.nearest_person.person_info.uuid;
      const nearIdx = this.persons.findIndex((item) => item.uuid === uuid);
      if (nearIdx < 0) {
        this.ackedStrangers = [person];
        this.showAckModal = true;
        return;
      }
      const near = this.persons[nearIdx];
      if (!near.display_image || near.display_image === '' || near.display_image === this.emptyImg
        || !near.register_image || near.register_image === '' || near.register_image === this.emptyImg) {
        this.$globalFetchPhoto(uuid, (err, data) => {
          if (err == null && data) {
            if (data.display_image !== '') {
              this.persons[nearIdx].display_image = data.display_image;
            } else {
              this.persons[nearIdx].display_image = this.emptyFace;
            }

            if (data.register_image !== '') {
              this.persons[nearIdx].register_image = data.register_image;
            } else {
              this.persons[nearIdx].register_image = this.emptyFace;
            }
            near.display_image = this.persons[nearIdx].display_image;
            near.register_image = this.persons[nearIdx].register_image;
          }
          this.ackedStrangers = [{ ...person, near }];
          this.showAckModal = true;
        });
      } else {
        this.ackedStrangers = [{ ...person, near }];
        this.showAckModal = true;
      }
    },

    onBatchAck(auto = false) {
      this.autoAck = auto;
      if (this.selectedStrangers.length === 1) {
        this.onAck(this.selectedStrangers[0]);
        return;
      }
      this.ackedStrangers = this.selectedStrangers.map((id) => this.entryStrangers.find((item) => item.verify_uuid === id));
      this.showAckModal = true;
    },

    async onConfirm(command) {
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
      const list = this.ackedStrangers.map((item) => ({
        timestamp: item.timestamp,
        verify_uuid: item.verify_uuid,
      }));
      const payload = {
        records: list,
        commands: command,
      };
      const { data: { message } } = await this.$globalAddCommand(payload);
      if (message) {
        list.forEach((item) => {
          const { verify_uuid: uuid } = item;
          const idx = this.selectedStrangers.indexOf(uuid);
          if (idx >= 0) {
            this.selectedStrangers.splice(idx, 1);
          }
          const index = this.entryStrangers.findIndex((d) => d.verify_uuid === uuid);
          if (index >= 0) {
            this.entryStrangers.splice(index, 1);
          }
        });
        this.refreshStranger();
        this.showAckModal = false;
        this.obj_loading.hide();
      }
    },

    onSelectAll() {
      const list = this.currentStrangers.map((d) => d.verify_uuid);
      list.forEach((id) => {
        const index = this.selectedStrangers.indexOf(id);
        if (index < 0) this.selectedStrangers.push(id);
      });
    },

    onCancelAll() {
      this.selectedStrangers.length = 0;
      this.selectedStrangers = [];
    },

    parseLine1(item) {
      switch (this.displaySettings.line1) {
        case 'NAME':
          return item.name;
        case 'PARTIALNAME':
          return item.name;
        case 'NONE':
        default:
          return '';
      }
    },

    parseLine2(item) {
      switch (this.displaySettings.line2) {
        case 'ID':
          return item.id;
        case 'DEPARTMENT':
          return item.extra_info.department;
        case 'JOBTITLE':
          return item.extra_info.title;
        case 'GROUP':
          return item.group_list.filter((g) => g !== 'All Person' && g !== 'All Visitor')[0];
        case 'NONE':
        default:
          return '';
      }
    },

    parseImage(item) {
      switch (this.displaySettings.displayPhoto) {
        case 'REGISTER':
          return item.register_image;
        case 'DISPLAY':
          return item.display_image;
        case 'NONE':
        default:
          return undefined;
      }
    },

    toLoginPage() {
      this.flag_login = false;
      this.value_username = '';
      this.$globalLogout();

      this.$router.push('/');
    },

    // Tulip
    refreshData() {
      this.currentPersons.forEach((item) => {
        const { register_image: image, uuid } = item;
        const idx = this.persons.findIndex((p) => p.uuid === uuid);

        if (image
            === 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg=='
            && idx >= 0) {
          this.$globalFetchPhoto(uuid, (err, data) => {
            if (err == null && data) {
              if (data.display_image !== '') {
                this.persons[idx].display_image = data.display_image;
              } else {
                this.persons[idx].display_image = this.emptyFace;
              }

              if (data.register_image !== '') {
                this.persons[idx].register_image = data.register_image;
              } else {
                this.persons[idx].register_image = this.emptyFace;
              }
            }
          });
        }
      });
    },

    refreshStranger() {
      this.currentStrangers.forEach((item) => {
        const { face_image: image, verify_uuid: uuid, face_image_id: payload } = item;
        const idx = this.entryStrangers.findIndex((p) => p.verify_uuid === uuid);

        if (!image) {
          this.$globalFetchVerifyPhoto(payload, (err, data) => {
            if (data) this.$set(this.entryStrangers[idx], 'face_image', data.face_image);
          });
        }
      });
    },

    // Tulip
    refreshBarChart() {
      const hourlyData = this.getHourlyPresentData();

      if (hourlyData) {
        this.chartDataIn = hourlyData.PersonIn;
        this.chartDataOut = hourlyData.PersonOut;
      }

      // const ctx = document.getElementById('attendance-chart-canvas');

      this.setupGuardDashboardChart(
        this.$refs.canvas,
        this.chartLabels,
        this.chartDataIn,
        this.chartDataOut,
        this.zoomRatio,
      );
    },

    //  merge Person and Verify Date
    applyVerifyToPerson(data) {
      // console.log('============  applyVerifyToPerson');
      // console.log(data);
      const self = this;

      let passModeRecord = [];
      const clockModeRecord = [];

      const filter = data.filter((item) => {
        const temp = typeof item.group_list === 'string' ? item.group_list : JSON.stringify(item.group_list);
        return !this.displaySettings.displayGroup.every((g) => temp.indexOf(g) < 0);
      });

      if (filter.length >= 1) {
        passModeRecord = filter.filter((attRec) => (attRec.uuid !== undefined && attRec.verify_mode !== 3 && attRec.verify_mode !== 4));
        // clockModeRecord = data.filter((attRec) => (attRec.verify_mode === 3 || attRec.verify_mode === 4));

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

            if (person && record.group_list.indexOf('All Visitor') >= 0) {
              person.display_image = ''; // record.face_image_id;
            }

            switch (mode) {
              case 3:
                // 人員進入
                if (person) {
                  // presentRecord
                  if (person.presentRecord) {
                    const last = person.presentRecord[person.presentRecord.length - 1];
                    if (last.out) {
                      // 如果人員最後一筆紀錄是 out，就插入一筆新的紀錄 in
                      person.presentRecord.push({
                        in: hour,
                      });
                      person.clockinRecord = record;
                    }
                  } else {
                    // 如果人員之前沒有任何紀錄，也插入一筆新的紀錄 in
                    person.presentRecord = [{
                      in: hour,
                    }];
                    person.clockinRecord = record;
                  }
                  // hourlyPersonInData => Map()<hour, uuid[]>
                  // 更新 hourlyPersonInData
                  const hValue = self.hourlyPersonInData.get(hour) || [];
                  hValue.push(uuid);

                  self.hourlyPersonInData.set(hour, hValue);
                }
                break;
              case 4:
                // 人員離開
                if (person) {
                  // presentRecord
                  if (person.presentRecord) {
                    const last = person.presentRecord[person.presentRecord.length - 1];
                    if (!last.out) {
                      // 補上人員的 out 時間點
                      person.presentRecord[person.presentRecord.length - 1].out = hour;
                      person.clockoutRecord = record;
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

          // self.entryPersons = self.persons.filter((p) => p.status === 0);
          // self.leavePersons = self.persons.filter((p) => p.status === 1);

          // console.log('c persons', self.persons);
          // console.log('c entryPersons', self.entryPersons);
          // console.log('c leavePersons', self.leavePersons);
        }
      }
    },

    applyVerifyToStranger(data) {
      if (data.length >= 1) {
        const clockModeRecord = [];
        const passModeRecord = data.filter((attRec) => (attRec.verify_mode !== 3 && attRec.verify_mode !== 4));
        // clockModeRecord = data.filter((attRec) => (attRec.verify_mode === 3 || attRec.verify_mode === 4));

        // 檢查 passModeRecord 裡面的 person 是 in or out，然後 push 至 clockModeRecord
        for (let i = passModeRecord.length - 1; i >= 0; i -= 1) {
          if (this.params_entryChannels.findIndex((id) => id.indexOf(passModeRecord[i].source_id) >= 0) >= 0) {
            const ppp = passModeRecord.splice(i, 1);
            if (ppp) {
              ppp[0].verify_mode = 3;
              clockModeRecord.push(ppp[0]);
            }
          }
        }

        if (clockModeRecord.length >= 1) {
          this.entryStrangers.push(...clockModeRecord);
          this.entryStrangers.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    },

    getHourlyPresentData() {
      const PersonIn = Array(24).fill(0);
      const PersonOut = Array(24).fill(0);

      this.hourlyPersonInData.forEach((v, k) => {
        PersonIn[k] += v.length;
      });

      this.hourlyPersonOutData.forEach((v, k) => {
        PersonOut[k] += v.length;
      });

      return {
        PersonIn,
        PersonOut,
      };
    },

    async initialGroupPerson() {
      this.persons = await this.setupPersonData();

      for (let i = this.persons.length - 1; i >= 0; i -= 1) {
        const person = this.persons[i];
        let inDisplayGroup = false;

        // 檢查人員的群組是否在顯示設定中的群組中
        if (person.group_list && Array.isArray(person.group_list)) {
          inDisplayGroup = person.group_list.some((value) => this.displaySettings.displayGroup.indexOf(value) >= 0);
        }

        if (!inDisplayGroup) {
          this.persons.splice(i, 1);
        }
      }
    },

    setupCurrentTimeLooper() {
      this.currentTimeLooper = setInterval(async () => {
        const now = new Date();
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        this.currentDate = now.toLocaleDateString();
        this.currentTime = `${hour}:${minute}`;
      }, 1000);
    },

    initViews() {
      // const self = this;
      const mainElement = document.querySelector('.c-main');
      const headerElement = document.querySelector('.c-header');
      const footerElement = document.querySelector('.c-footer');
      const containerElement = document.querySelector('.container-fluid');

      // 把 coreUI 套件的一些預設元件的樣式清除掉
      if (mainElement) mainElement.classList.add('c-main-reset');
      if (headerElement) headerElement.classList.add('c-header-reset');
      if (footerElement) footerElement.classList.add('c-footer-reset');
      if (containerElement) containerElement.classList.add('container-fluid-reset');
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
        const dividerElement = document.querySelector('.guard-divider');
        // const contentElement = document.querySelector('.guard-content');
        const footerBoxElement = document.querySelector('.footer-box');
        const attendanceTopElement = document.querySelector('.attendance-top-box');

        // 將下列 views 進行 zoom
        if (dateTimeElement) self.setZoom(dateTimeElement);
        if (chartElement) self.setZoom(chartElement);
        if (summaryBox) self.setZoom(summaryBox);
        if (headerElement) self.setZoom(headerElement);
        if (dividerElement) self.setZoom(dividerElement);
        // if (contentElement) self.setZoom(contentElement);
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
      this.chartLabels = Array.from(Array(this.chartBarAmount).keys());
      this.chartDataIn = Array(this.chartBarAmount).fill(0);
      this.chartDataOut = Array(this.chartBarAmount).fill(0);

      this.setupGuardDashboardChart(
        this.$refs.canvas,
        this.chartLabels,
        this.chartDataIn,
        this.chartDataOut,
        this.zoomRatio,
      );
    },

  },
};
</script>

<style lang='scss' scoped>
@import '@/assets/scss/variables.scss';
  .group-card {
    transition: 0.5s ease-in-out;
  }

  .group-card.card-flip {
    transform: rotateX(360deg);
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: height .9s ease;
    // max-height: auto;
    overflow: hidden;
  }

  .slide-enter-from,
  .slide-leave-to {
    height: 0;
  }

  // .slide-enter-to,
  // .slide-leave-from {
  //   opacity: 1;
  //   max-height: 240px;
  // }

  .disabled {
    opacity: 0.5;
    cursor: unset !important;
    pointer-events: none !important;
  }

  .chart-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 8px 0 4px;
    border-radius: 4px;
    background: $guard-btn-bg;
    border: 1px solid #FFF;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.10);

    &:hover {
      background: $guard-btn-bg-hover;
    }
  }

  .grid-2-6 {
    display: grid !important;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 16px;
  }
  .grid-7-6 {
    display: grid !important;
    grid-template-rows: repeat(7, 1fr);
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 16px;
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
