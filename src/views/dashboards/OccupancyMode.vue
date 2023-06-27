<template>
  <CCard class="occupancy" ref="occupancy">
    <CCardHeader class="header">
      <div ref="identity" class="identity" @click="toLoginPage"></div>
      <div ref="title" class="title"></div>
      <div class="counter-wrapper">
        <div ref="counter" id="counter" class="counter">
          {{ disp_occupancyPresent }}：{{ entryedPerson }} {{ disp_occupancyPeople }} /
          {{ disp_occupancyExpected }}：{{ totalPerson }} {{ disp_occupancyPeople }}
        </div>
      </div>
      <div class="timer-panel">
        <div class="timestamp" id="timer-panel">2020-04-18 12:12:12</div>
        <div class="poweredby">
          Powered by <img :src="`data:image/png;base64,${airaLogo}`" />
        </div>
      </div>
    </CCardHeader>
    <CCardBody class="body">
      <CCarousel v-if="pages.length > 0" animate :interval="pageDuration" class="carousel" ref="carouselpanel"
        @slideToItemIndex="slideToItemIndex">
        <CCarouselItem v-for="(page, i) in pages" active :key="i" name="person-list">
          <div v-for="(person, j) in page" :key="j" class="container COccupancy mx-0" ref="container">
            <!-- status => DEPARTED, ENTERED, NORMAL, ABNORMAL -->
            <COccupancy :statusBackgroundColors="statusBackgroundColors" :status="person.status"
              :personId="person.person_Id" :group="person.group_name" :areaA="person.areaA" :areaB="person.areaB"
              :areaC="person.areaC" :photoImage="person.photoImage" :entryTime="person.entryTime"
              :leaveTime="person.leaveTime" :periodTime="person.periodTime">
            </COccupancy>
          </div>
        </CCarouselItem>
      </CCarousel>
    </CCardBody>
    <CCardHeader class="footer">
      <div class="pages">
        <a href="javascript:;" @click.prevent="prevPage" class="d-inline-block page-btn">
          <img src="/img/leftArrow.svg" alt="" />
        </a>
        <div ref="pages">1 / 1</div>

        <a href="javascript:;" @click.prevent="nextPage" class="d-inline-block page-btn">
          <img src="/img/rightArrow.svg" alt="" />
        </a>
      </div>

      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="(ann, i) in config.announcements" :key="i">{{
          ann
          }}</swiper-slide>
      </swiper>
    </CCardHeader>

    <div class="visitor-list" id="visitor-list"></div>
  </CCard>
</template>

<script>
  import i18n from "@/i18n";

  import { COccupancy } from "@/components";
  import { airaLogoWhite as airaLogo, defaultPhotoImage } from "@/utils";
  import { Swiper, SwiperSlide, directive } from "vue-awesome-swiper";
  // import 'swiper/swiper-bundle.css';

  Date.prototype.yyyy_mm_dd_HH_MM_SS = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var HH = this.getHours();
    var MM = this.getMinutes();
    var SS = this.getSeconds();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd + " ",
      (HH > 9 ? "" : "0") + HH + ":",
      (MM > 9 ? "" : "0") + MM + ":",
      (SS > 9 ? "" : "0") + SS,
    ].join("");
  };

  Date.prototype.yyyy_mm_dd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd,
    ].join("");
  };

  Date.prototype.HH_MM_SS = function () {
    var HH = this.getHours();
    var MM = this.getMinutes();
    var SS = this.getSeconds();

    return [
      (HH > 9 ? "" : "0") + HH + ":",
      (MM > 9 ? "" : "0") + MM + ":",
      (SS > 9 ? "" : "0") + SS,
    ].join("");
  };

  export default {
    name: "OccupancyMode",
    components: {
      Swiper,
      SwiperSlide,
      COccupancy,
    },
    directives: {
      swiper: directive,
    },
    data: function () {
      return {
        disp_occupancyPresent: i18n.formatter.format("Present"),
        disp_occupancyExpected: i18n.formatter.format("Expected"),
        disp_occupancyPeople: i18n.formatter.format("People"),

        airaLogo,
        config: {},
        pages: [],
        groups: [],
        pageDuration: 100,
        visitors: [],
        totalPerson: 0,
        entryedPerson: 0,
        // departedPerson: 0,
        acitvePageIndex: -1,
        savePersons: [],
        timer_panel: null,
        swiperOptions: {
          direction: "vertical",
          slidesPerView: 1,
          spaceBetween: 30,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
        },
        statusBackgroundColors: {},
        resolution: new Map([
          ["5 x 5", { times: 5, pageAmount: 25 }],
          ["6 x 6", { times: 6, pageAmount: 36 }],
          ["7 x 7", { times: 7, pageAmount: 49 }],
          ["8 x 8", { times: 8, pageAmount: 64 }],
          [
            "ipad",
            {
              times: "ipad",
              pageAmount: 24,
              portrait: {
                shorterSide: 3,
                longerSide: 8,
              },
              landscape: {
                shorterSide: 6,
                longerSide: 4,
              },
            },
          ],
          [
            "ipadPro",
            {
              times: "ipadPro",
              pageAmount: 40,
              portrait: {
                shorterSide: 4,
                longerSide: 10,
              },
              landscape: {
                shorterSide: 8,
                longerSide: 5,
              },
            },
          ],
        ]),

        personGroups: [],
        isReloadData: true,

        nextResetTime: 0,
        cardresized: false
      };
    },
    beforeRouteEnter(to, from, next) {
      // console.log("sdads")
      next((vm) => {
        if (vm.$store.state.loginRedirect) {
          window.location.reload();
        }
      });
    },
    created() {
      const self = this;

      self.unSubscribe = self.$store.subscribe(async (mutation, state) => {
        switch (mutation.type) {
          case "changeNotifications":
            if (mutation.payload["statusCode"] == `200`) return;

            let payload = mutation.payload;

            if (payload["verify_mode"] == 1 || payload["verify_mode"] == 2) {
              let person = payload["person"];
              if (person == undefined) return;

              var group = "";
              if (person["group_list"]) {
                if (Array.isArray(person["group_list"]))
                  group = person["group_list"].join(", ");
                else group = person["group_list"];
              }

              var data = {
                expire: new Date().valueOf() + self.config.showDuration,
                timestamp: payload["timestamp"],
                fullname: person == undefined ? "" : person["name"],
                employeeno: person == undefined ? "" : person["id"],
                group: group,
                jobtitle:
                  person == undefined
                    ? ""
                    : person["extra_info"] == undefined
                      ? ""
                      : person["extra_info"]["title"],
                department:
                  person == undefined
                    ? ""
                    : person["extra_info"] == undefined
                      ? ""
                      : person["extra_info"]["department"],
                snapshot: payload["face_image"],
                register: person == undefined ? "" : person["register_image"],
                display: person == undefined ? "" : person["display_image"],
                person_id: person["uuid"],
                score: person["score"],
                temperature: payload["foreHead_temperature"] + "",
                clock_mode_function: payload["verify_mode"],
                photoImage: defaultPhotoImage,
              };

              var inDispGroup = false;

              if (self.config.displayGroup && person["group_list"]) {
                var g = [];
                if (Array.isArray(person["group_list"])) g = person["group_list"];
                else g = [person["group_list"]];

                for (let i = 0; i < g.length; i++) {
                  if (self.config.displayGroup.indexOf(g[i]) >= 0) {
                    inDispGroup = true;
                    break;
                  }
                }
              }

              if (!inDispGroup) return;

              var idx = self.visitors.findIndex((x) => x.person_id === data.person_id);
              if (idx == -1) {
                self.visitors.push(data);
              } else {
                self.visitors[idx] = data;
              }

              self.setPersonInOut(data);

              self.resizePersonCard();
            }

            break;
        }
      });
    },
    mounted() {
      const self = this;

      self.$globalGetDisplaySetting(async function (err, data) {
        if (!err) {
          // setTimeout(async () => {
          let layout = data["OCCUPANCY"];

          let persons = [];
          let ret1 = await self.$globalFindPersonWithoutPhoto("", 0, 3000);
          if (ret1)
            if (ret1.data.message == "ok")
              persons = [].concat(persons, ret1.data.person_list);

          let visitors = [];
          let ret2 = await self.$globalFindVisitorWithoutPhoto("", 0, 3000);
          if (ret2)
            if (ret2.data.message == "ok")
              visitors = [].concat(visitors, ret2.data.visitor_list);

          self.personGroups = await self.$globalGetGroupList();

          self.personGroups.group_list.forEach((group) => {
            group.persons = [];

            if (layout.displayGroup.indexOf(group.name) >= 0) {
              group.person_list.forEach((per) => {
                var detailInfo = persons.find((x) => x.uuid === per.uuid);
                if (detailInfo) {
                  detailInfo.status = "NORMAL";
                  detailInfo.areaA = "";
                  detailInfo.areaB = "";
                  detailInfo.areaC = "";
                  detailInfo.entryTime = "";
                  detailInfo.leaveTime = "";
                  detailInfo.periodTime = "";
                  detailInfo.photoImage = defaultPhotoImage;

                  group.persons.push(detailInfo);
                }
              });

              group.visitor_list.forEach((per) => {
                var detailInfo = visitors.find((x) => x.uuid === per.uuid);
                if (detailInfo) {
                  detailInfo.status = "NORMAL";
                  detailInfo.areaA = "";
                  detailInfo.areaB = "";
                  detailInfo.areaC = "";
                  detailInfo.entryTime = "";
                  detailInfo.leaveTime = "";
                  detailInfo.periodTime = "";
                  detailInfo.photoImage = defaultPhotoImage;

                  group.persons.push(detailInfo);
                }
              });
            }
          });

          let resetTime = layout["resetTime"];
          let startTime = new Date().setHours(+resetTime, 0, 0, 0);

          if (+resetTime > new Date().getHours()) startTime -= 86400000;

          let endTime = startTime + 86400000;

          self.nextResetTime = endTime;

          self.setDisplayItems(layout, false);

          let _data = {
            start_time: startTime,
            end_time: endTime,
            slice_shift: 0,
            slice_length: 30000,
            with_image: true,
            uuid_list: [],
          };

          let dd = [];
          let result = await self.$globalGetPersonResult(_data);
          dd = result.data.result.data;

          result = await self.$globalGetVisitorResult(_data);
          dd = dd.concat(result.data.result.data);

          for (let i = 0; i < dd.length; i++) {
            const payload = dd[i];

            if (payload["verify_mode"] == 1 || payload["verify_mode"] == 2) {
              let person = persons.find((p) => p.uuid == payload["uuid"]);
              if (!person) person = visitors.find((p) => p.uuid == payload["uuid"]);

              if (person) {
                var group = "";
                if (person["group_list"]) {
                  if (Array.isArray(person["group_list"]))
                    group = person["group_list"].join(", ");
                  else group = person["group_list"];
                }

                var data = {
                  timestamp: payload["timestamp"],
                  fullname: payload["name"],
                  employeeno: payload["id"],
                  group: group,
                  jobtitle:
                    person["extra_info"] == undefined ? "" : person["extra_info"]["title"],
                  department:
                    person["extra_info"] == undefined
                      ? ""
                      : person["extra_info"]["department"],
                  snapshot: payload["face_image"],
                  register: person["register_image"],
                  display: person["display_image"],
                  person_id: person["uuid"],
                  score: payload["verify_score"],
                  temperature: payload["temperature"] + "",
                  clock_mode_function: payload["verify_mode"],
                  photoImage: defaultPhotoImage,
                };

                var inDispGroup = false;

                if (self.config.displayGroup && person["group_list"]) {
                  var g = [];
                  if (Array.isArray(person["group_list"])) g = person["group_list"];
                  else g = [person["group_list"]];

                  for (let i = 0; i < g.length; i++) {
                    if (self.config.displayGroup.indexOf(g[i]) >= 0) {
                      inDispGroup = true;
                      break;
                    }
                  }
                }

                if (!inDispGroup) continue;

                self.setPersonInOut(data);
              }
            }
          }

          self.resizePersonCard();
        } else {
          self.$router.push("/login");
        }
      });

      this.timerClick();
      this.setHtmlFontSize();

      window.addEventListener("orientationchange", self.resizePersonCard);
      window.addEventListener("resize", self.resizePersonCard);

      // self.disp_occupancyPresent = i18n.formatter.format("OccupancyPresent");
      // self.disp_occupancyExpected = i18n.formatter.format("OccupancyExpected");
      // self.disp_occupancyPeople = i18n.formatter.format("OccupancyPeople");
    },

    beforeDestroy() {
      const vm = this;
      clearInterval(vm.intervalid);
      clearTimeout(vm.queryResetTimeoutvalid);
      this.removeHtmlFontSize();
      window.removeEventListener("orientationchange", vm.resizePersonCard);
      window.removeEventListener("resize", vm.resizePersonCard);

      this.unSubscribe();
    },

    methods: {
      async setDisplayItems(config, reset) {
        let self = this;

        if (config != null) {
          self.setDisplayConfig(config);
        }

        if (self.personGroups != null) {
          self.createGroupPerson();
        }

        // if (this.isReloadData && config) {
        //   await this.setTodayLastData();
        //   this.isReloadData = false;
        // }

        if (reset) {
          for (let i = 0; i < self.groups.length; i++) {
            self.groups[i].persons.forEach((person) => {
              person.status = "NORMAL";
              person.leaveTime = "";
              person.entryTime = "";
              person.periodTime = "";
            });
          }

          self.savePersons = [];

          self.splitDisplayPage();

          // get first page photoImage
          let persons = self.pages[0];
          if (persons) {
            persons.forEach(async (e) => {
              if (e.photoImage == undefined || e.photoImage == defaultPhotoImage)
                await self.setCardDisplayPhoto(e);
            });
          }
        } else {
          self.splitDisplayPage();
        }

        // self.countEntryedAndDepartedPerson();

        if (config != null) {
          self.$nextTick(() => {
            self.$refs.carouselpanel.setFirstActive();
          });
        }
      },

      setDisplayConfig(config) {
        let largeSide = screen.height > screen.width ? screen.height : screen.width;
        let isIpad = /(Macintosh|iPad)/i.test(navigator.userAgent);

        if (isIpad && largeSide === 1366) {
          config.occupancySize = "ipadPro";
        } else if (isIpad) {
          config.occupancySize = "ipad";
        }

        const statusBackgroundColors = {
          NORMAL:
            config && config.NormalColor
              ? "background-color: " + config.NormalColor + ";"
              : "background-color: #7e8e8f;",
          ABNORMAL:
            config && config.AbnormalColor
              ? "background-color: " + config.AbnormalColor + ";"
              : "background-color: #bf4d4d;",
          ENTERED:
            config && config.EnteredColor
              ? "background-color: " + config.EnteredColor + ";"
              : "background-color: #7e8e8f;",
          DEPARTED:
            config && config.DepartColor
              ? "background-color: " + config.DepartColor + ";"
              : "background-color: #b0b3b9;",
        };

        this.statusBackgroundColors = statusBackgroundColors;
        this.config = config;
        this.config.showDuration *= 1000;
        this.pageDuration = this.config.showDuration;

        this.$refs.occupancy.style.backgroundImage =
          `url('` + this.config.background_image + `')`;
        this.$refs.identity.style.backgroundImage = `url('` + this.config.logo + `')`;
        this.$refs.title.innerText = this.config.companyName;
        this.$refs.title.style.fontFamily = this._data.config.companyStyle.font;
        this.$refs.title.style.color = this._data.config.companyStyle.color;
        this.$refs.title.style.fontSize = this._data.config.companyStyle.size / 10 + "rem";
        this.$refs.title.style.fontWeight = "bold";

        for (let i = this.config.announcements.length - 1; i >= 0; i--) {
          const element = this.config.announcements[i];

          if (element == "") {
            this.config.announcements.splice(i, 1);
          }
        }
      },

      async setPersonInOut(data) {
        let self = this;

        let personList = [];
        for (let i = 0; i < this.groups.length; i++) {
          const g = this.groups[i];

          var persons = g.persons.filter((obj) => {
            return obj.uuid == data.person_id;
          });

          personList = personList.concat(persons);
        }

        let eventTime = new Date(data["timestamp"]).HH_MM_SS();

        if (data["clock_mode_function"] == 1 || data["clock_mode_function"] == 2) {
          personList.forEach((p) => {
            if (p.status == "NORMAL") {
              // in
              p.status = "ENTERED";
              p.entryTime = eventTime;
              p.leaveTime = "";
              p.periodTime = "";
            } else if (p.status == "ENTERED" || p.status == "DEPARTED") {
              // out
              p.status = "DEPARTED";
              p.leaveTime = eventTime;
              p.periodTime = self.periodTime(p.entryTime, p.leaveTime);
            }
          });
        }

        this.countEntryedPerson();

        // if (this.pages.length == 1) {
        //   if (this.pages[0].length == 1)
        //     this.$refs.carouselpanel.setFirstActive();
        // }
      },

      countEntryedPerson() {
        let entryedPerson = new Set();
        for (let i = 0; i < this.groups.length; i++) {
          const { persons } = this.groups[i];

          persons.forEach((person) => {
            if (person.status != "NORMAL") {
              entryedPerson.add(person.uuid);
            }
          });
        }

        this.entryedPerson = entryedPerson.size;

        if (this.$refs.counter) {
          this.$refs.counter.innerText = `${this.disp_occupancyPresent} : ${this.entryedPerson} ${this.disp_occupancyPeople} / ${this.disp_occupancyExpected} : ${this.totalPerson} ${this.disp_occupancyPeople}`;
        }
      },

      periodTime(entry, depart) {
        if (entry == undefined || depart == undefined) return "";
        if (entry == "" || depart == "") return "";

        var b = entry.split(":");
        var s = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

        b = depart.split(":");
        var e = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

        var diff = Math.abs(e - s);

        if (diff <= 0) return "";
        else {
          // var ms = diff % 1000;

          // diff = (diff - ms) / 1000;
          var ss = Math.floor(diff % 60);
          ss = (ss > 9 ? "" : "0") + ss;

          diff = (diff - ss) / 60;
          var mm = Math.floor(diff % 60);
          mm = (mm > 9 ? "" : "0") + mm;

          diff = (diff - mm) / 60;
          var hh = Math.floor(diff % 24);
          hh = (hh > 9 ? "" : "0") + hh;

          return hh + ":" + mm + ":" + ss;
        }
      },

      getPersonInfo(area, data) {
        var ret = "";
        switch (area) {
          case "Department":
            ret =
              data == undefined
                ? ""
                : data["extra_info"] == undefined
                  ? ""
                  : data["extra_info"]["department"];
            break;
          case "GroupName":
            ret =
              data == undefined
                ? ""
                : data["group_list"] == undefined
                  ? ""
                  : data["group_list"][0];
            break;
          case "PersonId":
            ret = data == undefined ? "" : data["id"];
            break;
          case "PersonName":
            ret = data == undefined ? "" : data["name"];
            break;
          case "JobTitle":
            ret =
              data == undefined
                ? ""
                : data["extra_info"] == undefined
                  ? ""
                  : data["extra_info"]["title"];
            break;
        }

        return ret;
      },

      createGroupPerson() {
        var self = this;

        let allPerson = new Set();

        this.groups = this.personGroups.group_list;
        this.totalPerson = 0;

        this.groups.forEach((group) => {
          group.persons.forEach((per) => {
            allPerson.add(per.uuid);

            // per.group_list = group.name;
            per.group_name = group.name;
            if (self.config.enableInfoMask) {
              if (per.id.length <= 4)
                per.id = "*****" + per.id.substr(per.id.length - 1, 1);
              else per.id = "*****" + per.id.substr(per.id.length - 3, 3);

              if (per.name.length <= 4)
                per.name = "*****" + per.name.substr(per.name.length - 1, 1);
              else per.name = "*****" + per.name.substr(per.name.length - 3, 3);
            }

            per.areaA = self.getPersonInfo(self.config.areaA, per) || "";
            per.areaB = self.getPersonInfo(self.config.areaB, per) || "";
            per.areaC = self.getPersonInfo(self.config.areaC, per) || "";
          });
        });

        self.totalPerson = allPerson.size;

        if (this.groups.length >= 2) this.groups.sort((a, b) => (a.name > b.name ? 1 : 0));

        this.groups.forEach((g) => {
          if (g.persons.length >= 2) {
            g.persons.sort((a, b) =>
              a.person_info_employeeno > b.person_info_employeeno ? 1 : 0
            );
          }
        });
      },

      splitDisplayPage() {
        const resolution = this.resolution;

        let pageAmount = 25;
        if (resolution.has(this.config.occupancySize)) {
          const values = resolution.get(this.config.occupancySize);
          pageAmount = values.pageAmount;
        }

        this.pages = [];
        var groupPage = [];

        for (let i = 0; i < this.groups.length; i++) {
          const g = this.groups[i];

          groupPage = [];
          for (let j = 0; j < g.persons.length; j++) {
            const p = g.persons[j];

            groupPage.push(p);
            if (groupPage.length == 1) {
              this.pages.push(groupPage);
            }

            if (groupPage.length == pageAmount) {
              groupPage = [];
            }
          }
        }

        if (this.pages.length == 0) this.pages.push([]);

        if (!this.pages[0]) {
          this.pages[0].push([]);
        }

        if (this.pages[0].length >= 1 && this.$refs.carouselpanel)
          this.$refs.carouselpanel.setFirstActive();

        this.resizePersonCard();
      },

      resizePersonCard() {
        const resolution = this.resolution;

        this.$nextTick(function () {
          if (resolution.has(this.config.occupancySize)) {
            const values = resolution.get(this.config.occupancySize);

            this.setCardStyle({
              times: values.times,
            });
          }
        });
      },

      timerClick() {
        const self = this;

        self.intervalid = setInterval(async () => {
          let now = new Date();
          if (self.timer_panel == null)
            self.timer_panel = document.getElementById("timer-panel");

          if (self.timer_panel != null)
            self.timer_panel.innerText = now.yyyy_mm_dd_HH_MM_SS();

          // Visitor List Panel
          if (self.visitors.length >= 1) {
            try {
              for (let idx = self.visitors.length - 1; idx >= 0; idx--) {
                const v = self.visitors[idx];
                if (v.expire < now.valueOf()) {
                  self.visitors.splice(idx, 1);

                  var children = self.visitor_list.childNodes;

                  for (let idx = children.length - 1; idx >= 0; idx--) {
                    if (children[idx].getAttribute("person_id") == v.person_id) {
                      //console.log("remove", children[idx]);
                      self.visitor_list.removeChild(children[idx]);
                    }
                  }
                }
              }
            } catch (ex) { }
          }

          self.showVisitorCard();

          // if ((now.getHours() == +self.config.resetTime) && (now.getMinutes() == 0) && (now.getSeconds() == 0)) {
          if (self.nextResetTime > 0) {
            if (now.valueOf() >= self.nextResetTime) {
              const tmr = new Date(new Date().setHours(+self.config.resetTime, 0, 0, 0));
              tmr.setDate(tmr.getDate() + 1);
              self.nextResetTime = tmr.valueOf();
              // self.nextResetTime += 86400000;

              self.setDisplayItems(null, true);
              (self.totalPerson = 0), (self.entryedPerson = 0);
              self.countEntryedPerson();
            }
          }
        }, 1000);
      },

      showVisitorCard() {
        if (this.visitor_list == null)
          this.visitor_list = document.getElementById("visitor-list");

        if (this.visitor_list == null) return;

        var children = this.visitor_list.childNodes;

        for (let idx = 0; idx < this.visitors.length; idx++) {
          const v = this.visitors[idx];

          if (v.person_id == undefined) return;

          var card = null;
          for (let idx = 0; idx < children.length; idx++) {
            if (children[idx].getAttribute("person_id") == v["person_id"]) {
              card = children[idx];
              break;
            }
          }

          // Add
          if (card == null) {
            card = document.createElement("div");

            var bDisplay = true;

            if (bDisplay) {
              card.setAttribute("person_id", v["person_id"]);
              card.setAttribute("class", "vcard");

              if (v["snapshot"] != null) {
                var img = document.createElement("img");
                card.appendChild(img);
                img.setAttribute("id", "image");
                img.setAttribute("class", "image");
                img.setAttribute("src", "data:image/jpeg;base64," + v["snapshot"]);
                // img.setAttribute("src", `${AppGlobals.cgiConfig}persons/snapshotimage?image=${v["snapshot"]}`);
              }

              var container = document.createElement("div");
              card.appendChild(container);
              container.setAttribute("class", "container");

              var h5 = document.createElement("h5");
              var b = document.createElement("b");
              h5.appendChild(b);
              container.appendChild(h5);
              b.innerText = v["employeeno"];

              h5 = document.createElement("h5");
              b = document.createElement("b");
              h5.appendChild(b);
              container.appendChild(h5);
              b.innerText = v["fullname"];

              var p = document.createElement("p");
              p.style.float = "left";

              container.appendChild(p);
              p.innerText = new Date(v["timestamp"]).HH_MM_SS();

              var p = document.createElement("p");
              p.style.float = "right";

              container.appendChild(p);
              p.innerText = (+v["score"] * 100).toFixed(2) + "%";

              this.visitor_list.appendChild(card);
            }
          } else {
            // Modify
            var img = card.getElementsByTagName("img")[0];
            var snap = "data:image/jpeg;base64," + v["snapshot"];
            var src = img.getAttribute("src");

            if (src != snap) img.setAttribute("src", snap);
          }
        }
      },

      cardBufferHeight({ isPad }) {
        // const headerHeight = document.querySelector('.occupancy .header').clientHeight;
        // const footer = document.querySelector('.occupancy .footer').clientHeight;
        const buffer = isPad ? 85 : 35;

        // return headerHeight + footer + buffer;
        return buffer;
      },

      slideToItemIndex(index) {
        let self = this;

        this.$refs.pages.innerText = index + 1 + ` / ` + this.pages.length;

        this.acitvePageIndex = index;
        let persons = this.pages[index];

        if (persons) {
          persons.forEach(async (e) => {
            if (e.photoImage == undefined || e.photoImage == defaultPhotoImage)
              await self.setCardDisplayPhoto(e);
          });
        }
      },

      setCardStyle({ times }) {
        let items = document.getElementsByClassName("container");

        let width = 1820;
        let height = 757;

        if (!this.cardresized) {
          this.cardresized = true;
          let widthTimes = times;
          let heightTimes = times;

          for (let i = 0; i < items.length; i++) {
            const e = items[i];

            e.style.setProperty("zoom", 1.0, "important");
            e.style.setProperty("width", (width - 10) / widthTimes + "px", "important");
            e.style.setProperty("height", (height - 30) / heightTimes + "px", "important");
          }

          // items = document.querySelectorAll(".COccupancy .person");
          // for (let i = 0; i < items.length; i++) {
          //   const e = items[i];
          //   e.classList.add(`times${times}`);
          // };
        }

        width = this.$refs.carouselpanel.$el.clientWidth;
        height = this.$refs.carouselpanel.$el.clientHeight;

        let rW = width / 1820;
        let rH = height / 757;
        let zoom = Math.min(rW, rH);

        for (let i = 0; i < items.length; i++) {
          const e = items[i];

          e.style.setProperty("zoom", zoom, "important");
        }
      },

      prevPage() {
        this.$refs.carouselpanel.previousItem();
      },

      nextPage() {
        this.$refs.carouselpanel.nextItem();
      },

      async setCardDisplayPhoto(data) {
        // console.log("setCardDisplayPhoto")
        const self = this;
        if (data && !data["register_image"]) {
          try {
            let photo = await self.$globalFetchPhoto(data.uuid);
            if (photo.data) {
              data["register_image"] = photo.data.register_image;
              data["display_image"] = photo.data.display_image;
            }
          } catch (e) { }
        }

        switch (this.config.displayPhoto) {
          case "RegisterPhoto":
            data.photoImage =
              data == undefined ? defaultPhotoImage : data["register_image"];
            break;
          case "DisplayPhoto":
            data.photoImage = data == undefined ? defaultPhotoImage : data["display_image"];
            break;
          case "CapturedPhoto":
            data.photoImage = "";
            break;
          case "None":
            data.photoImage = defaultPhotoImage;
            break;
        }
      },

      setHtmlFontSize() {
        // const clientWidth = screen.width;

        // if (clientWidth >= 3840) {
        //   // 1rem = 20px;
        //   document.documentElement.style.fontSize = "125%";
        // } else if (clientWidth >= 2560) {
        //   // 1rem = 13.3px;
        //   document.documentElement.style.fontSize = "83.3%";
        // } else if (clientWidth < 1367) {
        //   //  1rem = 13.3px;
        //   document.documentElement.style.fontSize = "44.4%";
        // } else {
        //   // 1rem = 10px;
        document.documentElement.style.fontSize = "62.5%";
        // }
      },

      removeHtmlFontSize() {
        document.documentElement.style.fontSize = null;
      },

      toLoginPage() {
        const self = this;
        self.flag_login = false;
        self.value_username = "";
        self.$globalLogout();

        this.$router.push("/");
      },
    },
  };
</script>

<style>
  .c-main {
    padding-top: 0px !important;
  }

  .container-fluid {
    padding-left: 0px !important;
    padding-right: 0px !important;

    margin-left: 0px !important;
    margin-right: 0px !important;
  }

  .visitor-list {
    position: absolute;
    left: 30px !important;
    bottom: 30px !important;
    right: 30px !important;
    height: 200px !important;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
  }

  .visitor-list .vcard {
    background-color: black;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    color: white;
    width: 160px;
    height: 245px;
    margin-left: 5px;
    margin-right: 5px;
  }

  .visitor-list .vcard .image {
    width: 90%;
    margin-left: 8px;
    padding-top: 10px;
    max-width: 155px;
    max-height: 130px;
  }
</style>

<style lang="scss" scoped>
  // Occupancy Client
  .occupancy {
    margin-bottom: 0 !important;
    overflow-y: hidden;
    background-size: cover;
    background-origin: center;
    background-repeat: no-repeat;
    background-image: url(/img/capacity/bg-ds.png);
    border: 0px solid !important;
  }

  // ========== header ===========

  .header {
    height: 8rem;
    border-bottom: 0;
    padding: 0 !important;
    display: flex;
    background: transparent;
  }

  .header .identity {
    width: 20rem;
    float: left;
    height: 60%;
    margin: 15px 5px 0 0;
    padding-left: 0.5rem;
    padding-top: 0.5rem;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    cursor: pointer;
    flex: 0 0 20rem;
  }

  .header .identity .logo {
    max-width: 18rem;
    max-height: 7rem;
    background-size: contain;
  }

  .header .title {
    width: 100%;
    height: 100%;
    display: flex;
    font-size: 4.4rem;
    color: #fafafa;
    align-items: center;
  }

  .header .counter-wrapper {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    align-content: center;
    justify-content: center;
    margin-left: auto;
  }

  .header .counter {
    width: 100%;
    padding-left: 3rem;
    padding-right: 3rem;
    white-space: nowrap;
    font-size: 3rem;
    line-height: 1em;
    text-align: center;
    color: #fafafa;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .header .timer-panel {
    color: #fafafa;
    height: 100%;
    padding: 0.5rem 3rem 3.4rem 1rem;
  }

  .header .poweredby {
    width: 100%;
    display: flex;
    font-size: 1.6rem;
    color: #fff;
    align-items: center;
    justify-content: flex-end;
    display: inline-flex;
    position: relative;
    align-items: baseline;
    top: -0.5rem;

    img {
      position: relative;
      top: 0.1rem;
      max-width: 100%;
      width: 4.8rem;
      margin-left: 1rem;
    }
  }

  .header .timestamp {
    color: #fafafa;
    height: 100%;
    display: flex;
    font-size: 1.8rem;
    align-items: center;
    white-space: nowrap;
  }

  .body {
    padding: 30px 50px;
    height: calc(100vh - 12rem);
  }

  .body .carousel {
    height: 100% !important;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
  }

  .body .container {
    display: inline-block;
    margin-left: 0.5rem;
    margin-right: 0.2rem;
    margin-top: 0;
    margin-bottom: 0;
  }

  .body .footer {
    height: 3rem;
  }

  // ========== footer ===========

  .footer {
    height: 4rem;
    padding: 0 !important;
    background-color: #232d33;
  }

  .footer .pages {
    width: auto;
    color: #fafafa;
    float: right;
    height: 100%;
    display: flex;
    font-size: 2.2rem;
    align-items: center;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .footer .page-btn {
    font-size: 1.7rem;
    padding: 0.2rem 0.4rem;
    margin: 0 0.3rem;
    color: white;
    position: relative;

    &:hover::after {
      content: "";
      border-bottom: 0.1rem solid;
      bottom: -0.2rem;
      left: 0.3rem;
      right: 0.3rem;
      position: absolute;
    }
  }

  .footer .swiper-container {
    position: absolute !important;
    bottom: -0.3rem;
    left: 4rem;
    height: 4rem;
    font-size: 2rem;
    color: #fff;
  }

  @media (max-width: 1366px) and (orientation: landscape) {
    .occupancy .body {
      height: calc(100vh - 4rem);
    }
  }

  @media (max-width: 1366px) and (orientation: portrait) {
    .occupancy .body {
      height: calc(100vh - 10rem);
    }
  }

  @media (max-width: 1000px) {
    .header .title {
      display: none;
    }
  }
</style>