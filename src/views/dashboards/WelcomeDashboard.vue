<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-if="!isLoadSetting">
    <div class="ratio-content welcome-dashboard" :style="{backgroundImage:'url('+displaySettings.background_image+')'}">
      <div class="welcome-logo"
        :style="[{backgroundImage:'url('+displaySettings.logo+')'}, 'zoom: ' + zoomRatio + ' !important;']"></div>
      <div v-if="isTestMode" class="position-absolute d-flex">
      </div>
      <div class="welcome-header" :style="'zoom: ' + zoomRatio + ' !important;'">
        <div class="welcome-message">{{ displaySettings.welcomeword }}</div>
        <div class="welcome-title">{{ displaySettings.maintitle }}</div>
      </div>
      <transition-group tag="div" class="welcome-cards-container card-list"
        :style="'zoom: ' + zoomRatio + ' !important;'" name="list">
        <div v-for="person in shownPersons" class="welcome-card item" :key="person">
          <img class="welcome-card-img" :src="`data:image/jpeg;base64,${showField(person, 'displayPhoto')}`" />
          <div class="welcome-card-text-box">
            <div class="welcome-card-title">{{ showField(person, "line1") }}</div>
            <div class="welcome-card-name">{{ showField(person, "line2") }}</div>
            <div class="welcome-card-department">{{ showField(person, "line3") }}</div>
            <div class="welcome-card-remarks">{{ showField(person, "line4") }}</div>
          </div>
        </div>
      </transition-group>


      <!-- <transition-group tag="ul" class="number-list" name="list">
        <li v-for="(item, index) in list" :key="index" class="item">{{ item }}</li>
      </transition-group> -->
      <div class="welcome-subtitle">{{ displaySettings.subtitle }}</div>
    </div>
  </div>
</template>

<script>
  import { airaLogoWhite as airaLogo } from "@/utils";
  import { backgroundImage } from "@/utils/welcomeMode";
  import welcomeModel from "@/models/WelcomeDashboardModel.vue";

  export default {
    name: "WelcomeDashboard",
    mixins: [welcomeModel],

    data: function () {
      return {
        isTestMode: true,
        testCount: 0,
        isAnimating: false,
        // welcomeMessage: "Welcome!",
        // welcomeTitle: "Welcome to the campaign!",
        shownPersons: [],
        zoomRatio: 0,
        elementsToDelete: [],
        elementsToMoveLeft: [],
        itemsToDelete: [],
        waitingPersons: [],
        waitingQueueMaxLength: 10,
        looper: null,

        displaySettings: {
          displayMode: "WELCOME",
          advertisingDuration: 15,
          background_image: backgroundImage,
          logo: airaLogo,
          caption: "aira Facial recognition Solution",
          captionSize: 125,
          displayPhoto: "REGISTER",
          enabledAdvertisingMode: false,
          enabledGreetingMode: true,
          greeting: "Welcome !",
          greetingSize: 110,
          line1: "JOBTITLE",
          line2: "NAME",
          line3: "GROUP",
          line4: "NONE",
          welcomeword: "Welcome",
          maintitle: "2023's airaFace Product launch",
          subtitle: "aira Corporation",
          numberOfDisplayPersons: 4,
          showDuration: 10,
          uuid: "",




          // welcomeMessage: "Welcome!",
          // welcomeTitle: "Welcome to the campaign!",
          priorityGroup: ["Employee", "Group-1"],
          temperatureUnit: "C", // 度 C | 度 F
        },

        checkRecordTimer: null,
        checkRecordProcess: false,

        isLoadSetting: true


      };
    },

    async created() {
      const self = this;
      // self.setupPersonDataV2();
      // self.shownPersons = self.getPersonData();

      console.log("created start");
      self.isLoadSetting = true;
      let data = await self.$globalGetDisplaySetting();

      let value_Setting = data.data || {};
      let welcome = value_Setting["WELCOME"];

      self.displaySettings = Object.assign({}, self.displaySettings, welcome);

      console.log("created end");

      self.isLoadSetting = false;
    },
    mounted() {
      const self = this;

      console.log("mounted start");

      self.initViews();
      self.initLooper();

      self.checkRecordTimer = setTimeout(() => {
        self.initCheckRecord();
      }, 5000);

      console.log("mounted end");
    },

    destroyed() {
      const self = this;

      const mainElement = document.querySelector(".c-main");
      const headerElement = document.querySelector(".c-header");
      const footerElement = document.querySelector(".c-footer");
      const containerElement = document.querySelector(".container-fluid");

      if (mainElement) mainElement.classList.remove("c-main-reset");
      if (headerElement) headerElement.classList.remove("c-header-reset");
      if (footerElement) footerElement.classList.remove("c-footer-reset");
      if (containerElement) containerElement.classList.remove("container-fluid-reset");

      if (self.looper) {
        clearInterval(self.looper);
      }

      if (self.checkRecordTimer) {
        clearTimeout(self.checkRecordTimer);
        self.checkRecordTimer = null;
      }
    },
    methods: {
      // animateRemove(deleteIndex) {
      //   const self = this;
      //   if (self.isAnimating) return;

      //   self.isAnimating = true;

      //   let cardElements = document.querySelectorAll(".welcome-card");

      //   self.elementsToDelete.push(cardElements[deleteIndex]);
      //   self.itemsToDelete.push(self.shownPersons[deleteIndex].uuid);

      //   // 把要執行左移動畫的 card elements 加入清單
      //   for (let i = deleteIndex; i < cardElements.length; i++) {
      //     self.elementsToMoveLeft.push(cardElements[i]);
      //   }

      //   self.elementsToDelete.forEach(function (item) {
      //     item.classList.add("welcome-fade-out");
      //   });

      //   setTimeout(() => {
      //     self.elementsToMoveLeft.forEach(function (item) {
      //       // item.classList.add("shrink");
      //     });
      //     setTimeout(() => {
      //       self.itemsToDelete.forEach((id) => {
      //         self.shownPersons = self.shownPersons.filter((e) => {
      //           return e && e.uuid !== id;
      //         });
      //       });

      //       self.elementsToMoveLeft.forEach(function (item) {
      //         // item.classList.remove("shrink");
      //       });

      //       self.itemsToDelete = [];
      //       self.elementsToMoveLeft = [];
      //       self.elementsToDelete = [];
      //       setTimeout(() => {
      //         self.isAnimating = false;
      //       }, 500);
      //     }, 700);
      //   }, 200);
      // },
      initLooper() {
        const self = this;

        self.looper = setInterval(() => {
          let now = new Date() - 0;

          for (let i = self.waitingPersons.length - 1; i >= 0; i--) {
            const wp = self.waitingPersons[i];
            // console.log("initLooper waitingPersons", now, wp.expireTime);

            if (now - wp.expireTime >= 0)
              self.waitingPersons.splice(i, 1);
          }

          for (let i = self.shownPersons.length - 1; i >= 0; i--) {
            const wp = self.shownPersons[i];

            // console.log("initLooper shownPersons", now, wp.expireTime);

            if (now - wp.expireTime >= 0)
              self.shownPersons.splice(i, 1);
          }

          if (self.shownPersons.length <= self.displaySettings.shownQueueMaxLength - 1) {
            while ((self.shownPersons.length < self.displaySettings.shownQueueMaxLength) && (self.waitingPersons.length >= 1)) {
              let element = self.waitingPerson.shift();

              element.expireTime = now + 5000;
              self.shownPersons.push(element);
            }
          }
        }, 1000);
      },
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
      },
      zoomViews() {
        const self = this;
        let dashboard = document.querySelector(".welcome-dashboard");
        if (dashboard) {
          let width = dashboard.clientWidth;
          let height = dashboard.clientHeight;
          // let width = window.clientWidth;
          // let height = window.clientHeight;


          let rW = width / 1920;
          let rH = height / 1080;
          self.zoomRatio = Math.min(rW, rH);
        }
      },
      setZoom(element) {
        const self = this;
        element.style.setProperty("zoom", self.zoomRatio, "important");
      },

      initCheckRecord() {
        const self = this;

        if (self.checkRecordTimer) {
          clearTimeout(self.checkRecordTimer);
          self.checkRecordTimer = null;
        }

        let startTS = new Date().setHours(0, 0, 0, 0);
        if (self.lastRecordTimestamp != 0)
          startTS = self.lastRecordTimestamp + 1;

        let endTS = new Date() - 0;

        console.log("initCheckRecord", startTS, endTS)

        if (!self.checkRecordProcess) {
          self.checkRecordProcess = true;
          self.setupVerifyData(startTS, endTS, async (ret) => {
            {
              //   card_facility_code: ""
              //   card_number: ""
              //   face_image_id: { f: 'pvr_1685059200000_1685145599999', uuid: '2a42cea0-5241-47af-8967-bbf246ba03c8' }
              //   group_list: "[\"All Person\"]"
              //   high_temperature: false
              //   id: "A-0011"
              //   name: "Fd"
              //   target_score: 0.9
              //   temperature: 0
              //   timestamp: 1685062461000
              //   uuid: "7B7B04A4-F706-4A5C-8951-988B474A47A7"
              //   verify_mode: 3
              //   verify_mode_string: "CLOCK_IN_MODE"
              //   verify_score: 0.91
              //   verify_uuid: "2a42cea0-5241-47af-8967-bbf246ba03c8"
            }

            if (ret.result.length >= 1) {
              // check properity
              for (let i = 0; i < ret.result.length; i++) {
                // // console.log("====================================");
                const r = ret.result[i];

                let inPriorityGroup = false;
                let bADD = false;

                if (r.group_list)
                  inPriorityGroup = eval(r.group_list).some(value => self.displaySettings.priorityGroup.indexOf(value) >= 0);

                r.PriorityGroup = inPriorityGroup;

                r.expireTime = new Date().valueOf() + self.value_welcomeSetting.showDuration;
                // in PriorityGroup add Show Person expire time + 5

                let res = await self.$globalFindPerson(r.uuid, 0, 20);
                let data = res.data;

                if (data.message == "ok") {
                  if (data.person_list && data.person_list.length >= 1) {
                    let p = data.person_list[0];

                    r.register_image = p.register_image;
                    r.display_image = p.display_image;
                    r.group_list = p.group_list;
                    r.title = p.extra_info.title;
                    r.department = p.extra_info.department;
                  }
                }

                res = await self.$globalFetchVerifyPhoto(r.face_image_id);
                data = res.data;
                if (data)
                  r.snapshot_image = data.face_image;

                if (inPriorityGroup) {
                  for (let j = 0; j < self.shownPersons.length; j++) {
                    // add to ShowPersons end of priorityGroup
                    if (!self.shownPersons[j].PriorityGroup) {

                      let inList = self.shownPersons.find((item) => item.uuid == r.uuid);
                      if (!inList)
                        self.shownPersons.splice(i, 0, r);
                      // else
                      //   console.log("in shownPersons list", r);

                      bADD = true;
                      break;
                    }
                  }

                  if (!bADD && self.shownPersons.length <= self.displaySettings.shownQueueMaxLength - 1) {
                    let inList = self.shownPersons.find((item) => item.uuid == r.uuid);
                    if (!inList)
                      self.shownPersons.shift(r);
                    // else
                    //   console.log("in shownPersons list", r);

                    bADD = true;
                  }

                  // showPersons length >= 5 move last item to waitingPersons expire time + 5
                  if (self.shownPersons.length >= self.displaySettings.shownQueueMaxLength + 1) {
                    let last = self.shownPersons.pop();
                    last.expireTime += self.value_welcomeSetting.showDuration;

                    self.waitingPersons = self.shownPersons.filter((item) => item.uuid != r.uuid);
                    self.waitingPersons.unshift(last);

                    // waitingPersons length >= 5 remove last item
                    if (self.waitingPersons.length >= self.displaySettings.shownQueueMaxLength + 1)
                      self.waitingPersons.pop();
                  }
                }

                // shownPersons not full add to shownPersons
                if ((!bADD) && (self.shownPersons.length <= 3)) {
                  let inList = self.shownPersons.find((item) => item.uuid == r.uuid);
                  if (!inList) {
                    self.shownPersons.push(r);
                  }
                  // else
                  //   console.log("in shownPersons list", r);

                  bADD = true;
                }

                // shownPersons full add to waitingPersons
                if ((!bADD) && self.waitingPersons.length <= self.displaySettings.shownQueueMaxLength - 1) {
                  let inList = self.waitingPersons.find((item) => item.uuid == r.uuid);
                  if (!inList) {
                    self.waitingPersons.push(r);
                  }
                  // else
                  //   console.log("in waitingPersons list", r);
                }

                // console.log("self.shownPersons", self.shownPersons);
                // console.log("waitingPersons", self.waitingPersons);
              }
            }

            self.checkRecordProcess = false;
          });
        }

        self.checkRecordTimer = setTimeout(() => {
          self.initCheckRecord();
        }, 5000);
      },

      showField(person, line) {
        let field = this.displaySettings[line];
        let ret = "";

        switch (field) {
          case "ID": ret = person.id; break;
          case "NAME": ret = person.name; break;
          case "PARTIALNAME":
            if (person.name.charCodeAt(0) > 256) {
              // "李***瑋"
              ret = person.name.charAt(0) + "***" + person.name.charAt(person.name.length - 1);
            }
            else {
              // J. Lee
              let _names = (person.name + " ").split(' ');
              ret = _names[0].charAt(0);

              if (_names.length >= 3)
                ret += (". " + _names[_names.length - 2]);

              // if (person.name <= 4) {
              //   // "J***"
              //   ret = person.name.charAt(0) + "***";
              // }
              // else if (person.name <= 7) {
              //   // "Fra***"
              //   ret = person.name.charAt(0) + person.name.charAt(1) + person.name.charAt(2) + "***"
              // }
              // else {
              //   // "Jas***ine"
              //   ret = person.name.charAt(0) + person.name.charAt(1) + person.name.charAt(2) + "***" +
              //     person.name.charAt(person.name.length - 3) + person.name.charAt(person.name.length - 2) + person.name.charAt(person.name.length - 1);
              // }
            }
            break;
          case "GROUP": ret = (person.group_list || []).join(', '); break;
          case "JOBTITLE": ret = person.title; break;
          case "DEPARTMENT": ret = person.department; break;
          case "REGISTER": ret = person.register_image; break;
          case "DISPLAY": ret = person.display_image; break;
          case "SNAPSHOT": ret = person.snapshot_image; break;
          default: ret = ""; break;
        }
        return ret;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .card-list {
    overflow: hidden;
    padding: 0;

    >div {
      /* display: block; */
      width: 430px;
      height: 571px;
      /* background-color: #f00; */
    }
  }

  .list-move {
    /* transition: opacity 1.0s, transform 1.0s; */
    transition: all 0.8s ease;
  }

  .list-leave-active {
    position: absolute;
  }

  .list-enter-from {
    opacity: 0;
    transform: translateY(-100px);
  }

  .list-leave-to {
    opacity: 0;
    transform: translateY(100px);
  }
</style>