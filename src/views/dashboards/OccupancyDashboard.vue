<template>
  <div class="ratio-wrap ratio-wrap-16x9">
    <div class="ratio-content dashboard">
      <!-- 最上方 header 區域 -->
      <div class="dashboard-header d-flex justify-content-between">
        <div class="d-flex align-items-center">
          <button class="btn-reset" @click="returnToAllGroups">
            <img v-if="!isShowGroup" src="@/assets/img/attendance_return_arrow.svg" class="attendance-return-arrow" />
          </button>
          <!-- <img :src="logoSrc" :class="[ isAttendance ? 'dashboard-attendance-logo' : 'dashboard-occupancy-logo', ]" /> -->
          <img :src="logoSrc" class="dashboard-attendance-logo" />
          <div class="attendance-title">
            {{ isShowGroup ? attendanceTitle : attendanceGroupTitle }}
          </div>
        </div>
        <div class="current-date-time text-white ff-noto-sans fw-200">
          <div class="fz-xxxl current-date">{{ currentDate }}</div>
          <div class="fz-super-large lh-6">{{ currentTime }}</div>
        </div>
      </div>

      <!-------------------  Occupancy ------------------>
      <div class="dashboard-divider"></div>

      <!-------------------  Attendance - BEGIN ------------------>
      <div class="attendance-top-box">
        <!-- Attendance - 總覽 - 左上角統計數據的區塊 -->
        <div class="attendance-statistics-box">
          <!-- 第 1 列：標籤 -->
          <div class="attendance-header-tag"></div>
          <!-- 第 2 列： 甜甜圈圖表 + 人數的數值-->
          <div class="attendance-statistics-data-box">
            <div class="doughnut-chart-canvas-wrap">
              <!-- Attendance 甜甜圈圖表 -->
              <canvas id="doughnut-chart-canvas" class=""></canvas>
            </div>
            <div class="d-flex align-items-end">
              <div class="attendance-header-present">
                {{ attendancePresent }}
              </div>
              <div class="attendance-header-total">/ {{ attendanceTotal }}</div>
            </div>
          </div>

          <!-- 第 3 列：排序選項 + 檢視模式選項 -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="d-flex align-items-center">
                <CIcon name="cilSortDescending" class="attendance-sort-icon text-white" />
                <span class="fz-xxxl text-white fw-200 ff-noto-sans">{{
                  $t("SortByGroupName")
                  }}</span>
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
      <div v-if="!isShowGroup" :class="[
          getGridStyleByAmount(),
          ,
          'd-flex',
          'flex-wrap',
          'person-list-container',
        ]">
        <div v-if="testingTurnOnVfor" v-for="(person, index) in currentPersons" :class="[
            'person-card',
            'inline-block',
            person.status === 0 ? 'normal-person-card' : '',
            person.status === 2 ? 'abnormal-person-card' : '',
            person.status === 1 ? 'absent-person-card' : '',
            getSyleByAmount(),
          ]" :style="'zoom: ' + zoomRatio + ' !important;'">
          <div class="d-flex justify-content-between">
            <img :class="['person-image', person.status === 1 ? 'absent-person-image' : 1]"
              :src="`data:image/png;base64,${person.register_image}`" />
            <div class="person-info-box text-white">
              <div :class="[
                  person.status === 1 ? 'absent-person-name' : 'person-name',
                  'fz-xxxl',
                  'fw-600',
                ]">
                {{ person.name }}
              </div>
              <div v-if="person.status !== 1" class="d-flex align-items-end temperature-info">
                <div :class="[
                    'fz-xxxl',
                    'fw-700',
                    'person-temperature',
                    person.temperatureStatus !== 0 ? 'abnormal-temperature' : '',
                  ]">
                  {{ person.temperature }}
                </div>
                <span class="temperature-unit fz-sm">°{{ displaySettings.temperatureUnit }}</span>
              </div>
              <div v-if="person.status !== 1" class="fz-sm fw-300">
                {{ person.clockinRecord ?
                person.clockinRecord.timestamp ?
                formatEpochTime(person.clockinRecord.timestamp)
                : ""
                : "" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance 顯示群組資料列表 -->
      <div v-if="isShowGroup" :class="[
          getGridStyleByAmount(),
          ,
          'd-flex',
          'flex-wrap',
          'person-list-container',
        ]">
        <button v-for="(group, index) in currentGroups" class="btn-reset" @click="onClickGroup(group)">
          <div :class="['group-card', 'btn-reset', getGroupStyleByAmount()]"
            :style="'zoom: ' + zoomRatio + ' !important;'">
            <div class="attendace-group-card-name">
              {{ group.groupName }}
            </div>

            <div>
              <span class="group-card-present-number">{{ group.present }}</span>
              <span class="group-card-total-number">/ {{ group.total }}</span>
            </div>
          </div>
        </button>
      </div>

      <!-- footer -->
      <div class="footer-box-wrap">
        <div class="footer-box w-100">
          <!-- 分頁按鈕和滑桿 -->
          <div class="pager d-flex align-items-center justify-content-center">
            <button class="btn-reset" :disabled="currentPageIndex === 0" @click="onClickPrev">
              <img v-if="currentPageIndex === 0" class="pager-left-arrow"
                src="@/assets/img/pager_left_arrow_disabled.svg" />
              <img v-else class="pager-left-arrow" src="@/assets/img/pager_left_arrow.svg" />
            </button>
            <button v-for="(item, i) in currentPageIndex" class="pager-left-dots btn-reset"
              @click="onClickPagerDot(i)"></button>
            <div class="pager-progressbar-box">
              <div class="pager-progressbar-track"></div>
              <div class="pager-progressbar-thumb" :style="{ width: pageProgressPercentage }"></div>
            </div>
            <button v-for="(item, i) in totalPageIndex - currentPageIndex" class="pager-right-dots btn-reset"
              @click="onClickPagerDot(i + currentPageIndex + 1)"></button>
            <button class="btn-reset" :disabled="currentPageIndex === totalPageIndex" @click="onClickNext">
              <img v-if="currentPageIndex === totalPageIndex" class="pager-right-arrow"
                src="@/assets/img/pager_right_arrow_disabled.svg" />
              <img v-else class="pager-right-arrow" src="@/assets/img/pager_right_arrow.svg" />
            </button>
          </div>
          <!-- 右下角 powered by aira 字樣 -->
          <div class="footer-detail-box">
            <div class="footer-detail-text">powered by</div>
            <img src="@/assets/img/aira-logo-white.svg" alt="" class="footer-logo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import occupancyModel from "@/models/OccupancyDashboardModel.vue";
  import chartHelper from "@/utils/ChartHelper.vue";

  export default {
    name: "OccupancyDashboard",

    data() {
      return {
        isTestMode: true,
        testingTurnOnVfor: true, // debug 的時候暫時拿掉一些 v-for 的 component，
        zoomRatio: 1,
        logoSrc: "",
        currentDate: "",
        currentTime: "",
        currentTimeLooper: null,

        // 分頁：
        currentPageIndex: 0,
        progressDotAmount: 5,
        autoChangePageTimer: null,
        showPageProgressTimer: null,
        countdownStartTime: null,
        countdownCurrentTime: null,
        pageProgressPercentage: "0%",
        totalPageIndex: 0,
        previousArrowEnabled: false,
        nextArrowEnabled: true,

        // rawData: [],
        currentPersons: [],
        persons: [],
        personStatus: {},

        displaySettings: {
          mode: 0, // 0: 標準模式 | 1: 精簡模式
          displayAmount: 24,
          showDuration: 10000,
          temperatureUnit: "C", // 度 C | 度 F
        },

        isShowStatisticBox: true,
        statistics: {
          companyName: "",
          logo: "",
          // tags: [
          //   {
          //     tagName: "木工",
          //     tagType: 0, // 標籤顏色 0: 咖啡色 | 1: 紫色 | 2: 粉紫色
          //   },
          //   {
          //     tagName: "鋼筋籠",
          //     tagType: 1, // 標籤顏色 0: 咖啡色 | 1: 紫色 | 2: 粉紫色
          //   },
          // ],
          summary: {
            present: 5,
            absent: 10,
          },

          // 圖表：
          chartTimer: null,
          chartData: [],
        },
        chartBarAmount: 24,
        chartLabels: [],
        chartDataIn: [],
        chartDataOut: [],
        chartDataPresent: [],

        // ------------ Attendance 的變數 -------------
        orderBy: 0, // 0: 依群組名稱排序 | 1: 依人數排序
        isDetailMode: false,
        idleTime: 5,
        attendanceTitle: "Attendance",
        attendanceGroupTitle: "",
        currentGroups: [],

        isShowGroup: true,
        isAttendance: true,
        currentGroup: "",
        groupPersons: [],


        refreshKey: 1,
      };
    },
    mixins: [occupancyModel, chartHelper],
    computed: {
      ...mapState(["deviceName"]),
      attendancePresent() {
        this.refreshKey;

        console.log("attendancePresent ============================");
        const self = this;

        if (self.isShowGroup) {
          let presentArray = self.persons.filter((p) => p.punchMode === 3);
          return presentArray.length;
        }
        else {
          let currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
          let presentArray = [];

          if (currentGroupData && currentGroupData.persons) {
            presentArray = currentGroupData.persons.filter(
              (p) => p.punchMode === 3
            );
          }
          return presentArray.length;
        }
      },
      attendanceTotal() {
        this.refreshKey;

        console.log("attendanceTotal ============================");

        const self = this;
        let len = 0;
        if (self.isShowGroup) {
          len = self.persons.length;
        }
        else {
          let currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
          if (currentGroupData && currentGroupData.persons)
            len = currentGroupData.persons.length;
        }

        return len;
      },

      // attendanceDetailPresent() {
      //   console.log("attendanceDetailPresent");

      //   const self = this;
      //   let currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
      //   let presentArray = [];

      //   if (currentGroupData && currentGroupData.persons) {
      //     presentArray = currentGroupData.persons.filter(
      //       (p) => p.punchMode === 3
      //     );
      //   }
      //   return presentArray.length;
      // },
      // attendanceDetailTotal() {
      //   console.log("attendanceDetailTotal");

      //   const self = this;
      //   let currentGroupData = self.groupPersons.find((g) => g.groupName === self.currentGroup);
      //   let len = 0;

      //   if (currentGroupData && currentGroupData.persons)
      //     len = currentGroupData.persons.length;

      //   return len;
      // },
    },
    watch: {
      currentPageIndex(newIndex, oldIndex) {
        console.log("currentPageIndex", newIndex, oldIndex);

        const self = this;
        let beginIndex = self.displaySettings.displayAmount * newIndex;
        if (self.isShowGroup) {
          self.currentGroups = self.groupPersons.slice(
            beginIndex,
            beginIndex + self.displaySettings.displayAmount
          );
        }
        else {
          let currentGroupData = self.groupPersons.find(
            (g) => g.groupName === self.currentGroup
          );

          self.currentPersons = currentGroupData.persons.slice(
            beginIndex,
            beginIndex + self.displaySettings.displayAmount
          );

          self.currentPersons.forEach(person => {
            if (person.register_image == "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==") {
              self.$globalFetchPhoto(person.uuid, (err, data) => {
                if (err == null && data) {
                  if (data.display_image != "")
                    person.display_image = data.display_image;

                  if (data.register_image != "")
                    person.register_image = data.register_image;

                  // console.log("globalFetchPhoto", data);
                }
              })
            }
          });
        }

        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();

        setTimeout(() => {
          console.log("xxxxxxxxx watch currentPageIndex");
          self.zoomViews();
        }, 50);
      },
    },
    // Tulip
    async created() {
      const self = this;
      await self.setupPersonData();

      let startTS = new Date().setHours(0, 0, 0, 0);
      let endTS = new Date() - 0;

      console.log("created startTS endTS", startTS, endTS);
      await self.setupVerifyData(startTS, endTS);

      let persons = self.getPersonData();
      console.log("created", persons);

      self.refreshData(persons);
    },
    // Tulip
    mounted() {
      console.log("====   mounted   ====");

      const self = this;
      self.initViews();
      self.setupStatisticBox();
      self.resetAutoChangePageTimer();
      self.initBarChart();
      self.initDoughnutChart();
    },
    destroyed() {
      const mainElement = document.querySelector(".c-main");
      const headerElement = document.querySelector(".c-header");
      const footerElement = document.querySelector(".c-footer");
      const containerElement = document.querySelector(".container-fluid");

      if (mainElement) mainElement.classList.remove("c-main-reset");
      if (headerElement) headerElement.classList.remove("c-header-reset");
      if (footerElement) footerElement.classList.remove("c-footer-reset");
      if (containerElement) containerElement.classList.remove("container-fluid-reset");
      if (self.autoChangePageTimer) {
        clearInterval(self.autoChangePageTimer);
      }
      if (self.showPageProgressTimer) {
        clearInterval(self.showPageProgressTimer);
      }
      if (self.currentTimeLooper) {
        clearInterval(self.currentTimeLooper);
      }
    },
    methods: {
      // Tulip
      refreshData(data) {
        const self = this;
        self.persons = data;

        self.convertPersonToGroupData();

        if (self.isShowGroup) {
          self.currentGroups = self.groupPersons.slice(
            self.currentPageIndex,
            self.displaySettings.displayAmount
          );

          self.totalPageIndex =
            Math.ceil(self.groupPersons.length / self.displaySettings.displayAmount) - 1;
        } else {
          let currentGroupData = self.groupPersons.find(
            (g) => g.groupName === self.currentGroup
          );

          self.currentPersons = currentGroupData.persons.slice(
            self.currentPageIndex,
            self.displaySettings.displayAmount
          );

          self.totalPageIndex =
            Math.ceil(currentGroupData.persons.length / self.displaySettings.displayAmount) - 1;
        }

        console.log("refreshData", self.currentPageIndex, self.totalPageIndex);
        self.refreshDoughnutChart();
        self.refreshBarChart();
      },
      // Tulip
      refreshDoughnutChart() {
        const self = this;

        let normal = self.attendancePresent;
        let absent = self.persons.length - self.attendancePresent;

        let ctx = document.getElementById("doughnut-chart-canvas");

        self.setupAttendanceDoughnutChart(ctx, [normal, absent], true);
      },

      // Tulip
      refreshBarChart() {
        const self = this;

        let hourlyData = self.getHourlyPresentData();

        if (hourlyData) {
          self.chartDataIn = hourlyData.PersonIn;
          self.chartDataOut = hourlyData.PersonOut;
          self.chartDataPresent = hourlyData.PersonPresent
        }

        let ctx = document.getElementById("attendance-chart-canvas");

        self.setupDashboardChart(
          ctx,
          self.chartLabels,
          self.chartDataIn,
          self.chartDataOut,
          self.chartDataPresent
        );
      },

      // Tulip
      convertPersonToGroupData() {
        const self = this;

        self.groupPersons = [];

        for (let i = 0; i < self.persons.length; i++) {
          const person = self.persons[i];

          for (let j = 0; j < person.group_list.length; j++) {
            const groupName = person.group_list[j];

            let group = self.groupPersons.find((e) => e.groupName === groupName);

            if (group == undefined) {
              group = {
                groupName: groupName,
                persons: [],
                total: 0,
                present: 0,
              }
              self.groupPersons.push(group);

              self.groupPersons.sort((a, b) => (a.groupName < b.groupName) ? -1 : (a.groupName > b.groupName) ? 1 : 0);
            }

            group.persons.push(person);
            group.total += 1;

            if (person.punchMode === 3) {
              group.present += 1;
            }
          }
        }



      },

      // Tulip
      setupStatisticBox() {
        const self = this;
        switch (self.displaySettings.displayAmount) {
          case 30:
          case 12:
          case 60:
          case 27:
            self.isShowStatisticBox = false;
            break;
        }
      },

      // Tulip
      initViews() {
        const self = this;
        const mainElement = document.querySelector(".c-main");
        const headerElement = document.querySelector(".c-header");
        const footerElement = document.querySelector(".c-footer");
        const containerElement = document.querySelector(".container-fluid");

        // 把 coreUI 套件的一些預設元件的樣式清除掉
        if (mainElement) mainElement.classList.add("c-main-reset");
        if (headerElement) headerElement.classList.add("c-header-reset");
        if (footerElement) footerElement.classList.add("c-footer-reset");
        if (containerElement) containerElement.classList.add("container-fluid-reset");

        self.zoomViews();

        window.addEventListener("resize", function () {
          self.zoomViews();
        });

        self.currentTimeLooper = setInterval(() => {
          let now = new Date();
          let month = now.getMonth() + 1;
          let hour = String(now.getHours()).padStart(2, "0");
          let minute = String(now.getMinutes()).padStart(2, "0");
          self.currentDate = month + "/" + now.getDate() + "/" + now.getFullYear();
          self.currentTime = hour + ":" + minute;

          if ((now.getSeconds() % 15) == 0) {
            let startTS = new Date().setHours(0, 0, 0, 0);
            if (self.lastRecordTimestamp > 0)
              startTS = self.lastRecordTimestamp + 1;

            let endTS = new Date() - 0;

            self.setupVerifyData(startTS, endTS, (lastTimestamp) => {
              if (((startTS - 1) != lastTimestamp) || (self.currentHour != now.getHours())) {
                let persons = self.getPersonData();
                // force refresh attendance data
                self.refreshKey *= -1;

                self.refreshData(persons);
              }
            });
          }
        }, 1000);
      },

      resetAutoChangePageTimer() {
        const self = this;

        // reset 換頁和進度條的 timer
        // if (self.autoChangePageTimer) {
        //   clearInterval(self.autoChangePageTimer);
        // }
        if (self.showPageProgressTimer) {
          clearInterval(self.showPageProgressTimer);
        }

        console.log("resetAutoChangePageTimer", self.currentPageIndex, self.totalPageIndex);

        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();

        // 每 500 毫秒更新進度條
        self.showPageProgressTimer = setInterval(() => {
          self.countdownCurrentTime = new Date();
          let percentage =
            (100 * (self.countdownCurrentTime - self.countdownStartTime)) /
            self.displaySettings.showDuration;
          self.pageProgressPercentage = percentage + "%";

          if (percentage >= 100) {
            if (self.currentPageIndex === self.totalPageIndex) {
              self.currentPageIndex = 0;
            } else {
              self.currentPageIndex++;
            }

          }
        }, 500);
      },
      // Tulip
      zoomViews() {
        const self = this;
        let dashboard = document.querySelector(".dashboard");
        if (dashboard) {
          let width = dashboard.clientWidth;
          let height = dashboard.clientHeight;
          let rW = width / 1920;
          let rH = height / 1080;
          self.zoomRatio = Math.min(rW, rH);

          let dateTimeElement = document.querySelector(".current-date-time");
          let chartElement = document.querySelector("#chart-canvas");
          let summaryBox = document.querySelector(".summary-box");
          let headerElement = document.querySelector(".dashboard-header");
          let dividerElement = document.querySelector(".dashboard-divider");
          let footerBoxElement = document.querySelector(".footer-box");
          let attendanceTopElement = document.querySelector(".attendance-top-box");

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
        const self = this;
        element.style.setProperty("zoom", self.zoomRatio, "important");
      },

      // Tulip
      initBarChart() {
        console.log("====   initBarChart   ====");

        let self = this;

        self.chartLabels = Array.from(Array(self.chartBarAmount).keys());
        self.chartDataIn = Array(self.chartBarAmount).fill(0);
        self.chartDataOut = Array(self.chartBarAmount).fill(0);
        self.chartDataPresent = Array(self.chartBarAmount).fill(0);

        let ctx = document.getElementById("attendance-chart-canvas");

        self.setupDashboardChart(
          ctx,
          self.chartLabels,
          self.chartDataIn,
          self.chartDataOut,
          self.chartDataPresent
        );
      },

      // Tulip
      initDoughnutChart() {
        console.log("====   initDoughnutChart   ====");
        let self = this;

        let ctx = document.getElementById("doughnut-chart-canvas");
        self.setupAttendanceDoughnutChart(ctx, [0, 0], true);
      },

      // Tulip
      changePage(selectedIndex) {
        console.log("changePage");
        const self = this;
        self.currentPageIndex = selectedIndex;
        self.countdownStartTime = new Date();
        self.countdownCurrentTime = new Date();
        self.resetAutoChangePageTimer();
      },
      // Tulip
      onClickGroup(group) {
        const self = this;

        self.currentGroup = group.groupName;

        let currentGroupData = self.groupPersons.find((g) => g.groupName === group.groupName);

        self.currentPersons = currentGroupData.persons.slice(
          0,
          self.displaySettings.displayAmount
        );

        // self.currentPersons.forEach(person => {
        //   if (person.register_image == "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==") {
        //     self.$globalFetchPhoto(person.uuid, (err, data) => {
        //       if (err == null && data) {
        //         if (data.display_image != "")
        //           person.display_image = data.display_image;

        //         if (data.register_image != "")
        //           person.register_image = data.register_image;

        //         // console.log("globalFetchPhoto", data);
        //       }
        //     })
        //   }
        // });

        self.isShowGroup = false;

        console.log("onClickGroup");
        self.currentPageIndex = 0;
        self.totalPageIndex =
          Math.ceil(currentGroupData.persons.length / self.displaySettings.displayAmount) -
          1;

        self.attendanceGroupTitle = group.groupName;

        // setTimeout(() => {
        // console.log("xxxxxxxxx methods onClickGroup");

        self.zoomViews();
        // self.initDetailDoughnutChart();
        // }, 20);
        self.resetAutoChangePageTimer();
      },
      // Tulip
      returnToAllGroups() {
        const self = this;
        self.isShowGroup = true;
        console.log("returnToAllGroups");
        self.currentPageIndex = 0;
        self.totalPageIndex =
          Math.ceil(self.groupPersons.length / self.displaySettings.displayAmount) - 1;
        self.currentGroups = self.groupPersons.slice(0, self.displaySettings.displayAmount);

        // setTimeout(() => {
        // console.log("xxxxxxxxx methods initDetailDoughnutChart");

        // self.zoomViews();
        // self.initDoughnutChart();
        // }, 20);
        self.resetAutoChangePageTimer();
      },

      // Tulip
      formatEpochTime(epochTime) {
        let date = new Date(0);
        date.setUTCSeconds(epochTime);

        let hour = String(date.getHours()).padStart(2, "0");
        let minute = String(date.getMinutes()).padStart(2, "0");

        return hour + ":" + minute;
      },
      onClickPrev() {
        const self = this;

        console.log("onClickPrev");
        if (self.currentPageIndex === 0) return;

        self.currentPageIndex--;
        self.resetAutoChangePageTimer();
      },
      onClickNext() {
        const self = this;
        console.log("onClickNext");
        if (self.currentPageIndex === self.totalPageIndex) return;

        self.currentPageIndex++;
        self.resetAutoChangePageTimer();
      },
      onClickPagerDot(index) {
        const self = this;
        console.log("onClickPagerDot");
        self.currentPageIndex = index;
        self.resetAutoChangePageTimer();
      },

      // Tulip
      getSyleByAmount() {
        const self = this;
        let style = "";
        switch (self.displaySettings.displayAmount) {
          case 24:
            style = "person-card-6x4";
            break;
          case 30:
            style = "person-card-6x5";
            break;
          case 8:
            style = "person-card-4x2";
            break;
          case 12:
            style = "person-card-4x3";
            break;
          case 48:
            style = "person-card-12x4";
            break;
          case 30:
            style = "person-card-12x5";
            break;
          case 18:
            style = "person-card-9x2";
            break;
          case 27:
            style = "person-card-9x3";
            break;
        }

        return style;
      },

      // Tulip
      getGroupStyleByAmount() {
        const self = this;
        let style = "";

        switch (self.displaySettings.displayAmount) {
          case 24:
            style = "group-card-6x4";
            break;
          case 30:
            style = "group-card-6x5";
            break;
          case 8:
            style = "group-card-4x2";
            break;
          case 12:
            style = "group-card-4x3";
            break;
          case 48:
            style = "group-card-12x4";
            break;
          case 30:
            style = "group-card-12x5";
            break;
          case 18:
            style = "group-card-9x2";
            break;
          case 27:
            style = "group-card-9x3";
            break;
        }

        return style;
      },

      // Tulip
      getGridStyleByAmount() {
        const self = this;
        let style = "";
        switch (self.displaySettings.displayAmount) {
          case 24:
            style = "grid-6x4";
            break;
          case 30:
            style = "grid-6x5";
            break;
          case 8:
            style = "grid-4x2";
            break;
          case 12:
            style = "grid-4x3";
            break;
          case 48:
            style = "grid-12x4";
            break;
          case 30:
            style = "grid-12x5";
            break;
          case 18:
            style = "grid-9x2";
            break;
          case 27:
            style = "grid-9x3";
            break;
        }

        return style;
      },
    },
  };
</script>