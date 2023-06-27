<template>
  <div class="capacity">
    <div class="header">
      <div ref="identity" class="identity" @click="toLoginPage"></div>
      <div class="timer-panel">
        <div ref="timerpanel">2020/05/28 18:18:18</div>
        <div class="poweredby">Powered by <img :src="`data:image/png;base64,${airaLogo}`" />
        </div>
      </div>
      <div class="entry-Status">
        {{ disp_numberOfEntry }}：{{entryPersons.length + departPersons.length }}
        {{ disp_People }} ／
        {{ disp_averageResidenceTime }}：{{residenceTime}}</div>
      <div ref="title" class="title">title</div>
    </div>

    <div v-show="showEventPanel" ref="eventpanel" class="event">
      <div class="title">
        <span class="caption">{{ disp_abnormalPerson }}</span>
        <select class="selection">
          <option value="asdf">{{ disp_all }}</option>
        </select>
        <span class="paging" v-if="eventPages.length >= 1">
          <a href="javascript:;" @click.prevent="prevPage('EVENT')" class="d-inline-block page-btn">
            <img src="/img/leftArrow.svg" alt="">
          </a>
          {{showEventPages}}
          <a href="javascript:;" @click.prevent="nextPage('EVENT')" class="d-inline-block page-btn">
            <img src="/img/rightArrow.svg" alt="">
          </a>
        </span>
      </div>
      <CCarousel animate :interval="pageDuration" class="carousel" ref="eventCarouselPanel"
        @slideToItemIndex="eventSlideToItem">
        <CCarouselItem v-for="(page, i) in eventPages" active name="person-list" :key="i">
          <div v-for="(person, j) in page" :key="j" class="cardcontainer" ref="eventCardContainer">
            <CTemperature :objectId="person.objectId" :temperatureArea="temperatureArea" :status="person.status"
              :faceId="person.faceId" :person_id="person.person_id" :group="person.group" :areaA="person.areaA"
              :areaB="person.areaB" :areaC="person.areaC" :photoImage="person.photoImage" :entryTime="person.entryTime"
              :leaveTime="person.leaveTime" :periodTime="person.periodTime" :itemMessage="person.itemMessage"
              :action="true" @onConfirmed="onConfirmed" @ocCanceled="ocCanceled" />
          </div>
        </CCarouselItem>
      </CCarousel>
    </div>

    <div class="d-flex">
      <div class="entryed" :class="{'hideEventPanel': !showEventPanel}">
        <div class="title">
          <span class="caption">
            {{ disp_peopleInTheVenue }}：{{entryPersons.length }}
            {{ disp_People }}</span>
          <span class="paging" v-if="entryPages.length >= 1">
            <a href="javascript:;" @click.prevent="prevPage('ENTRY')" class="d-inline-block page-btn">
              <img src="/img/leftArrow.svg" alt="">
            </a>
            {{showEntryPages}}
            <a href="javascript:;" @click.prevent="nextPage('ENTRY')" class="d-inline-block page-btn">
              <img src="/img/rightArrow.svg" alt="">
            </a>
          </span>
        </div>
        <div class="carousel-wrapper">
          <CCarousel animate :interval="pageDuration" class="carousel" ref="entryCarouselPanel"
            @slideToItemIndex="entrySlideToItem">
            <CCarouselItem v-for="(page, i) in entryPages" active name="person-list" :key="i">
              <div v-for="(person, j) in page" class="cardcontainer" ref="entryCardContainer" :key="person.person_id">
                <CTemperature :objectId="person.objectId" :temperatureArea="temperatureArea" :manualLeave="true"
                  :status="person.status" :bgcolor1="person.bgcolor1" :bgcolor2="person.bgcolor2"
                  :faceId="person.faceId" :person_id="person.person_id" :group="person.group" :areaA="person.areaA"
                  :areaB="person.areaB" :areaC="person.areaC" :photoImage="person.photoImage"
                  :entryTime="person.entryTime" :leaveTime="person.leaveTime" :periodTime="person.periodTime"
                  :itemMessage="person.itemMessage" :action="false" @remove-entry-person="removeEntryPerson(person)" />
              </div>
            </CCarouselItem>
          </CCarousel>
        </div>
      </div>

      <div class="leaved" :class="{'hideEventPanel': !showEventPanel}">
        <div class="title">
          <span class="caption">
            {{ disp_hasLeft }}：{{departPersons.length }}
            {{ disp_People }}
          </span>
          <span class="paging" v-if="departPages.length >= 1">
            <a href="javascript:;" @click.prevent="prevPage('DEPART')" class="d-inline-block page-btn">
              <img src="/img/leftArrow.svg" alt="">
            </a>
            {{ showDepartPages }}
            <a href="javascript:;" @click.prevent="nextPage('DEPART')" class="d-inline-block page-btn">
              <img src="/img/rightArrow.svg" alt="">
            </a>
          </span>
        </div>
        <div class="carousel-wrapper">
          <CCarousel animate :interval="pageDuration" class="carousel" ref="departCarouselPanel"
            @slideToItemIndex="departSlideToItem">
            <CCarouselItem v-for="(page, i) in departPages" active name="person-list" :key="i">
              <div v-for="(person, j) in page" class="cardcontainer" ref="departCardContainer" :key="person.person_id">
                <CTemperature :objectId="person.objectId" :temperatureArea="temperatureArea" :unitCelsius="unitCelsius"
                  :status="person.status" :faceId="person.faceId" :person_id="person.person_id" :group="person.group"
                  :areaA="person.areaA" :areaB="person.areaB" :areaC="person.areaC" :photoImage="person.photoImage"
                  :entryTime="person.entryTime" :leaveTime="person.leaveTime" :periodTime="person.periodTime"
                  :itemMessage="person.itemMessage" :action="false" />
              </div>
            </CCarouselItem>
          </CCarousel>
        </div>
      </div>
    </div>

    <div class="visitor-list" id="visitor-list"></div>

    <CModal :show.sync="confirmTemplatureModal">
      <template #header>
        <div class="alertModal_Title">
          {{ isFalseAlerm ? $t('Temperature.falseAlarmResponseTitle') : $t('Temperature.confirmResponseTitle') }}
        </div>
      </template>

      <CRow>
        <CCol col="4">
          <img class="alertModal_Img" :src="clonePerson.photoImage" alt="">
        </CCol>
        <CCol col="8" class="alertModal_Text">
          <div>{{clonePerson.areaA}}</div>
          <div>{{clonePerson.areaB}}</div>
          <div>{{clonePerson.areaC}}</div>
        </CCol>
        <div v-if="isFalseAlerm === true" class="d-flex alertModal_Text" col="12">
          <label class="ml-5 label mt-4 pt-2">{{$t('Temperature.confirmedTemperature')}}</label>
          <CInput class="d-inline-block my-4 px-2 alertModel_Input"
            :invalidFeedback="$t('CForm.This_is_a_required_numeric')" :isValid="checkIfValid('updatedTemplature')"
            :value.sync="$v.updatedTemplature.$model">
          </CInput>
          <span class="mt-4 pt-2">{{config.temperature_unit_celsius ? '°C' : '°F' }}</span>
        </div>
      </CRow>

      <template #footer-wrapper>
        <footer class="modal-footer">
          <CButton class="ml-1 btn-temp" color="secondary" @click="setConformOutingModal({modalStatus: false})">
            {{$t('CForm.Cancel')}}
          </CButton>
          <CButton class="ml-1 btn-temp" color="primary" @click="sendAcknowledgestatus">
            {{ $t('CForm.Submit') }}
          </CButton>

        </footer>
      </template>
    </CModal>
  </div>
</template>

<script>
  import i18n from "@/i18n";
  import { airaLogoWhite as airaLogo, defaultPhotoImage } from '@/utils';

  import { CTemperature } from '@/components';

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
    name: 'CapacityMode',
    components: {
      CTemperature,
    },
    data: function () {
      return {
        airaLogo,
        config: {},
        tabletConfig: {},
        eventPages: [],
        entryPages: [],
        departPages: [],
        pageDuration: 100,

        visitors: [],
        eventPersons: [],
        entryPersons: [],
        departPersons: [],

        eventIndex: 0,
        entryIndex: 0,
        departIndex: 0,

        residenceTime: "00:00:00",
        temperatureArea: '',
        unitCelsius: true,
        confirmTemplatureModal: false,
        isFalseAlerm: false,
        clonePerson: {},
        updatedTemplature: '',

        personGroups: [],
        isReloadData: true,

        disp_numberOfEntry: i18n.formatter.format("NumberOfEntry"),
        disp_averageResidenceTime: i18n.formatter.format("AverageResidenceTime"),
        disp_People: i18n.formatter.format("People"),
        disp_abnormalPerson: i18n.formatter.format("AbnormalPerson"),
        disp_all: i18n.formatter.format("ALL"),
        disp_peopleInTheVenue: i18n.formatter.format("PeopleInTheVenue"),
        disp_hasLeft: i18n.formatter.format("HasLeft"),

        cardresized: false,
      }
    },

    created() {
      this.unSubscribe = this.$store.subscribe(async (mutation, state) => {
        switch (mutation.type) {
          case "changeNotifications":

            if (mutation.payload["statusCode"] == `200`) return;

            let payload = mutation.payload;

            if ((payload["verify_mode"] == 3) || (payload["verify_mode"] == 4)) {
              let person = payload["person"];
              if (person == undefined) return;

              var data = {
                expire: new Date().valueOf() + this.config.showDuration,
                timestamp: payload["timestamp"],
                fullname: person == undefined ? "" : person["name"],
                employeeno: person == undefined ? "" : person["id"],
                group: person == undefined ? "" : person["group_list"] == undefined ? "" : person["group_list"][0],
                jobtitle: person == undefined ? "" : person["extra_info"] == undefined ? "" : person["extra_info"]["title"],
                department: person == undefined ? "" : person["extra_info"] == undefined ? "" : person["extra_info"]["department"],
                snapshot: payload["face_image"],
                register: person == undefined ? "" : person["register_image"],
                display: person == undefined ? "" : person["display_image"],
                person_id: person["uuid"],
                score: person["score"],
                is_high_temperature: payload["is_high_temperature"],
                bgcolor1: '#7e8e8f',
                bgcolor2: '#485556',
                photoImage: '',
                clock_mode_function: payload["verify_mode"],
                faceId: payload[""]
              }

              var inGroup = false;
              if (this.config) {
                if (this.config.displayGroup.indexOf(data.group) >= 0) {
                  inGroup = true;
                }
              }

              if (!inGroup)
                return;

              var idx = this.visitors.findIndex(x => x.person_id === data.person_id);
              if (idx == -1) { this.visitors.push(data); }
              else { this.visitors[idx] = data; }

              await this.setPersonInOut(data);

              this.splitEventPage();
              this.splitEntryPage();
              this.splitDepartPage();

              if (this.eventPages.length >= 1)
                if (this.eventPages[0].length == 1)
                  this.$refs.eventCarouselPanel.setFirstActive();

              if (this.entryPages.length >= 1)
                if (this.entryPages[0].length == 1)
                  this.$refs.entryCarouselPanel.setFirstActive();

              if (this.departPages.length >= 1)
                if (this.departPages[0].length == 1)
                  this.$refs.departCarouselPanel.setFirstActive();
            }
            break;
        }
      })
    },
    mounted() {
      const self = this;

      self.$globalGetDisplaySetting(async function (err, data) {
        if (!err) {
          // setTimeout(async () => {
          let layout = data["CAPACITY"];

          let persons = [];
          let ret1 = await self.$globalFindPerson("", 0, 1000);
          if (ret1)
            if (ret1.data.message == "ok")
              persons = [].concat(persons, ret1.data.person_list);

          let tablet = await self.$globalGetTabletSetting();
          self.tabletConfig = tablet.data;

          let resetTime = layout["resetTime"];
          let startTime = new Date().setHours(+resetTime, 0, 0, 0);
          let endTime = new Date().getTime();

          self.setDisplayItems(layout, false);

          let _data = {
            "start_time": startTime,
            "end_time": endTime,
            "slice_shift": 0,
            "slice_length": 30000,
            "with_image": true,
            "uuid_list": []
          };
          self.$globalGetPersonResult(_data, function (error, data) {
            if (!error) {
              let dd = data.result.data;
              for (let i = 0; i < dd.length; i++) {
                const payload = dd[i];

                if ((payload["verify_mode"] == 3) || (payload["verify_mode"] == 4)) {
                  let person = persons.find(p => p.uuid == payload["uuid"]);

                  if (person) {
                    var data = {
                      timestamp: payload["timestamp"],
                      fullname: payload["name"],
                      employeeno: payload["id"],
                      group: person["group_list"] == undefined ? "" : person["group_list"][0],
                      jobtitle: person["extra_info"] == undefined ? "" : person["extra_info"]["title"],
                      department: person["extra_info"] == undefined ? "" : person["extra_info"]["department"],
                      snapshot: payload["face_image"],
                      register: person["register_image"],
                      display: person["display_image"],
                      person_id: person["uuid"],
                      score: payload["verify_score"],
                      temperature: (payload["temperature"]) + "",
                      clock_mode_function: payload["verify_mode"],
                      is_high_temperature: payload["high_temperature"],
                      bgcolor1: '#7e8e8f',
                      bgcolor2: '#485556',
                      photoImage: '',
                    }

                    self.setCardDisplayPhoto(data);

                    self.setPersonInOut(data);

                  }
                }
              }

              self.splitEventPage();
              self.splitEntryPage();
              self.splitDepartPage();

              if (self.eventPages.length >= 1)
                if (self.eventPages[0].length == 1)
                  self.$refs.eventCarouselPanel.setFirstActive();

              if (self.entryPages.length >= 1)
                if (self.entryPages[0].length == 1)
                  self.$refs.entryCarouselPanel.setFirstActive();

              if (self.departPages.length >= 1)
                if (self.departPages[0].length == 1)
                  self.$refs.departCarouselPanel.setFirstActive();
            }
          });
        }
        else {
          self.$router.push('/login');
        }
      });

      this.timerClick();
      this.setHtmlFontSize();
      window.addEventListener('resize', this.resizeHandler);
      this.resizeHandler();
    },

    beforeDestroy() {
      clearInterval(this.intervalid);
      this.removeHtmlFontSize();
      window.removeEventListener('resize', this.resizeHandler);

      this.unSubscribe();
    },

    computed: {
      showEventPanel: function () {
        if (this.eventPages.length >= 1) {
          this.splitEntryPage();
          this.splitDepartPage();

          if (this.$refs.eventpanel && this.eventPages[0].length >= 1) {
            if (this.$refs.eventpanel.style.display == "none") {
              this.$refs.eventpanel.style.display = "inline";
              this.$refs.eventCarouselPanel.setFirstActive();
            }

            return true;
          }
          else {
            this.eventIndex = 0;
            this.$refs.eventpanel.style.display = "none";
            return false;
          }
        }
        else {
          return false;
        }
      },

      showEventPages: function () {
        if (this.eventPages.length >= 1)
          return this.eventIndex + 1 + " / " + this.eventPages.length;
        else
          return "";
      },

      showEntryPages: function () {
        if (this.entryPages.length >= 1)
          return this.entryIndex + 1 + " / " + this.entryPages.length;
        else
          return "";
      },

      showDepartPages: function () {
        if (this.departPages.length >= 1)
          return this.departIndex + 1 + " / " + this.departPages.length;
        else
          return "";
      }
    },

    methods: {
      async setDisplayItems(config, reset) {
        let self = this;

        if (config != null) { this.setDisplayConfig(config); }

        if (this.isReloadData && config) {
          let { entryPersons, departPersons } = await this.setTodayLastData();

          this.entryPersons = entryPersons;
          this.departPersons = departPersons;

          this.isReloadData = false;
        }

        let storage = JSON.parse(localStorage.getItem("CapacityStatus"));
        if (storage != undefined) {
          if (reset) {
            localStorage.removeItem("CapacityStatus");
            this.eventPersons = [];
          }
          else if (storage.timestamp !== new Date().yyyy_mm_dd()) {
            // check is today
            this.eventPersons = [];
          }
          else {
            this.eventPersons = storage.eventPersons;
          }
        }

        if (reset) {
          this.entryPersons = [];
          this.departPersons = [];

          this.entryIndex = 0;
          this.departIndex = 0;
        }

        this.tmpStorageData();

        this.splitEventPage();
        this.splitEntryPage();
        this.splitDepartPage();


        if (this.eventPages.length >= 1)
          if (this.eventPages[0].length == 1)
            this.$refs.eventCarouselPanel.setFirstActive();


        if (this.entryPages.length >= 1)
          if (this.entryPages[0].length == 1)
            this.$refs.entryCarouselPanel.setFirstActive();

        if (this.departPages.length >= 1)
          if (this.departPages[0].length == 1)
            this.$refs.departCarouselPanel.setFirstActive();
      },

      setDisplayConfig(config) {
        const areaFields = ['areaA', 'areaB', 'areaC'];
        areaFields.forEach(item => {
          if (config[item] === "Temperature") {
            this.temperatureArea = item;
          }
        })
        this.unitCelsius = config.temperature == "C";

        this.config = config;
        this.config.showDuration *= 1000;
        this.pageDuration = this.config.showDursation;

        this.$refs.identity.style.backgroundImage = `url('` + this.config.logo + `')`;
        this.$refs.title.innerText = this.config.companyName;
        this.$refs.title.style.fontFamily = this._data.config.companyStyle.font;
        this.$refs.title.style.color = this._data.config.companyStyle.color;
        this.$refs.title.style.fontSize = (this._data.config.companyStyle.size / 10) + 'rem';
        this.$refs.title.style.fontWeight = 'bold';
      },

      async setTodayLastData() {
        // let ret = await getLastData('CAPACITY');
        let ret = [];

        let entryPersons = [];
        let departPersons = [];

        for (let index = 0; index < ret.length; index++) {
          let data = this.formatLastData(ret[index]);
          this.setPersonInOut(data, entryPersons, departPersons, this.isReloadData);
        }

        return {
          entryPersons,
          departPersons,
        }
      },

      formatLastData(payload) {
        let data = {
          // objectId: payload["_id"],
          // faceId: payload["faceId"] + "" || "",
          // person_id: payload["person_id"],
          // expire: new Date().valueOf() + 15000,
          // timestamp: payload["timestamp"],
          // channel: payload["channel"],
          // fullname: payload["person_info_fullname"] || "",
          // organization: payload["person_info_organization"] || "",
          // employeeno: payload["person_info_employeeno"] || "",
          // jobtitle: payload["person_info_job_title"] || "",
          // group: payload["person_info_group_list"].split(",")[0] || "",
          // corp: payload["person_info_department_list"] || "",
          // snapshot: payload["snapshot"],
          // score: payload["score"],
          // temperature: payload["temperature"] + "",
          // clock_mode_function: payload["clock_mode_function"] || "0",
          // bgcolor1: '#7e8e8f',
          // bgcolor2: '#485556',
          // photoImage: '',

        }

        return data;
      },

      setPersonInOut(data, entryPersons, departPersons, isReloadData = false) {
        let self = this;

        data.areaA = self.getPersonInfo(self.config.areaA, data) || "";
        data.areaB = self.getPersonInfo(self.config.areaB, data) || "";
        data.areaC = self.getPersonInfo(self.config.areaC, data) || "";

        let eventData = null;
        if (data["is_high_temperature"]) {
          eventData = { ...data };
          eventData.status = "danger";
          eventData.entryTime = new Date(data["timestamp"]).HH_MM_SS();
          eventData.itemMessage = i18n.formatter.format("Hyperthermia");

          self.eventPersons.unshift(eventData);
          return;
        }

        let entryIdx = self.entryPersons.findIndex((item) => {
          return (item.person_id === data.person_id)
        });

        let departIdx = self.departPersons.findIndex((item) => {
          return (item.person_id === data.person_id)
        });

        if (data["clock_mode_function"] == 3) {
          // in
          if (entryIdx != -1) { self.entryPersons.splice(entryIdx, 1); }
          if (departIdx != -1) { self.departPersons.splice(departIdx, 1); }

          let entryData = { ...data };
          entryData.entryTime = new Date(data["timestamp"]).HH_MM_SS();

          entryData.entryTimeTimestamp = data["timestamp"];
          self.entryPersons.unshift(entryData);

        }
        else if (data["clock_mode_function"] == 4) {
          // out
          let departData = null;
          if (entryIdx == -1) { return; }
          else {
            departData = self.entryPersons[entryIdx];
            self.entryPersons.splice(entryIdx, 1);
          }

          departData.status = "departed";
          departData.itemMessage = self.periodTime(departData.entryTime, new Date(data["timestamp"]).HH_MM_SS());
          self.departPersons.unshift(departData);
        }
      },

      async setCardDisplayPhoto(data) {
        switch (this.config.displayPhoto) {
          case 'RegisterPhoto':
            let ret1 = await this.$globalFetchPhoto(data.person_id);
            data.photoImage = data == undefined ? "" : ret1.data.register_image
            break;
          case 'DisplayPhoto':
            let ret2 = await this.$globalFetchPhoto(data.person_id);
            data.photoImage = data == undefined ? "" : ret2.data.display_image
            break;
          case 'None':
            data.photoImage = defaultPhotoImage;;
            break;
        }
      },

      getPersonInfo(area, data) {
        var ret = "";
        switch (area) {
          case "Department": ret = data.department ? data.department : ""; break;
          case "GroupName": ret = data.group ? data.group : ""; break;
          case "PersonId": ret = data.employeeno ? data.employeeno : ""; break;
          case "PersonName": ret = data.fullname ? data.fullname : ""; break;
          case "JobTitle": ret = data.jobtitle ? data.jobtitle : ""; break;
        }

        return ret;
      },

      periodTime(entry, depart) {
        if ((entry == undefined) || (depart == undefined)) return "";
        if ((entry == "") || (depart == "")) return "";

        var b = entry.split(':');
        var s = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

        b = depart.split(':');
        var e = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

        var diff = Math.abs(e - s);


        if (diff <= 0)
          return "";
        else {
          var ss = diff % 60;
          ss = (ss > 9 ? "" : "0") + ss;

          diff = (diff - ss) / 60
          var mm = diff % 60;
          mm = (mm > 9 ? "" : "0") + mm;

          diff = (diff - mm) / 60
          var hh = diff % 24;
          hh = (hh > 9 ? "" : "0") + hh;

          return hh + ":" + mm + ":" + ss;
        }
      },

      splitEventPage() {
        const clientWidth = window.innerWidth;

        let pageAmount = 6;

        // if (clientWidth >= 1150 && clientWidth < 1360) {
        //   pageAmount = 5;
        // } else if (clientWidth >= 895 && clientWidth < 1150) {
        //   pageAmount = 4;
        // } else if (clientWidth >= 768 && clientWidth < 895) {
        //   pageAmount = 3;
        // } else if (clientWidth < 768) {
        //   pageAmount = 2;
        // }

        this.personsArrangement(this.eventPersons);

        this.eventPages = [];
        this.eventPages = this.generatePages(this.eventPersons, pageAmount);
      },

      splitEntryPage() {
        const clientWidth = window.innerWidth;

        let pageAmount = this.eventPersons.length >= 1 ? 16 : 24;

        // if (clientWidth >= 1150 && clientWidth < 1360) {
        //   pageAmount = this.eventPersons.length >= 1 ? 12 : 15;
        // } else if (clientWidth >= 768 && clientWidth < 1150) {
        //   pageAmount = this.eventPersons.length >= 1 ? 8 : 10;
        // } else if (clientWidth < 768) {
        //   pageAmount = this.eventPersons.length >= 1 ? 4 : 5;
        // }

        this.personsArrangement(this.entryPersons);

        this.entryPages = [];
        this.entryPages = this.generatePages(this.entryPersons, pageAmount);
      },

      splitDepartPage() {
        const clientWidth = window.innerWidth;

        let pageAmount = this.eventPersons.length >= 1 ? 8 : 12;

        // if (clientWidth >= 1150 && clientWidth < 1360) {
        //   pageAmount = this.eventPersons.length >= 1 ? 8 : 5;
        // } else if (clientWidth < 1150) {
        //   pageAmount = this.eventPersons.length >= 1 ? 4 : 5;
        // }

        this.personsArrangement(this.departPersons);

        this.departPages = [];
        this.departPages = this.generatePages(this.departPersons, pageAmount);
      },

      generatePages(persons, pageAmount = 0) {
        let pages = [];
        let pageItems = [];

        for (let j = 0; j < persons.length; j++) {
          pageItems.push(persons[j]);

          if (pageItems.length == 1)
            pages.push(pageItems);

          if (pageItems.length == pageAmount)
            pageItems = [];
        }

        if (pages.length === 0) { pages.push([]) };
        if (!pages[0]) { pages[0].push([]) };

        return pages;
      },

      personsArrangement(persons) {
        if (persons.length >= 2) {
          if (this.config.cardItemSortBy == "EntryTime")
            persons.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : ((b.timestamp < a.timestamp) ? -1 : 0));
          else
            persons.sort((a, b) => (a.employeeno < b.employeeno) ? 1 : ((b.employeeno < a.employeeno) ? -1 : 0));
        }
      },

      timerClick() {
        const self = this;

        self.intervalid = setInterval(async () => {
          let totalPerson = 0; let totalTime = 0;

          let now = new Date();

          try {
            self.$refs.timerpanel.innerText = now.yyyy_mm_dd_HH_MM_SS();
          }
          catch (ex) { }

          // Visitor List Panel  
          if (this.visitors.length >= 1) {
            try {
              for (let idx = this.visitors.length - 1; idx >= 0; idx--) {
                const v = this.visitors[idx];
                if (v.expire < now.valueOf()) {
                  this.visitors.splice(idx, 1);

                  var children = this.visitor_list.childNodes;

                  for (let idx = children.length - 1; idx >= 0; idx--) {
                    if (children[idx].getAttribute("person_id") == v.person_id) {
                      console.log("remove", children[idx]);
                      this.visitor_list.removeChild(children[idx]);
                    }
                  }
                }
              }
            }
            catch (ex) { }
          }

          this.showVisitorCard();

          // @01:00 reset
          if ((now.getHours() == +self.config.resetTime) && (now.getMinutes() == 0) && (now.getSeconds() == 0)) {
            this.setDisplayItem(null, null, null, null, true);
            totalPerson = 0, totalTime = 0;
            return;
          }

          if (((now.getSeconds() % 15) == 0)) {
            if (this.entryPages[this.entryIndex] != undefined) {
              this.entryPages[this.entryIndex].forEach(element => {
                var entry = element.entryTime;
                var depart = new Date().HH_MM_SS();
                element.itemMessage = self.periodTime(entry, depart);

                var b = entry.split(':');
                var s = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

                b = depart.split(':');
                var e = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);

                var diff = Math.abs(e - s);
                if ((diff > this.config.maxDuration * 60000) && (element.status != "warning")) {
                  let data = this.entryPersons.find((item) => {
                    return (item.person_id === element.person_id)
                  });

                  let eventData = { ...data };

                  element.status = "warning";
                  eventData.status = "warning";
                  eventData.itemMessage = i18n.formatter.format("StayTimeout");

                  this.eventPersons.unshift(eventData);
                  this.splitEventPage();

                  // save data to localstorage
                  this.tmpStorageData();
                }
              });

              this.splitEntryPage();
            }

            for (let idx = 0; idx < self.entryPages.length; idx++) {
              const ePage = self.entryPages[idx];

              for (let person = 0; person < ePage.length; person++) {
                let s = self.totalSecond(ePage[person].itemMessage);

                if (s != 0) {
                  totalPerson++;
                  totalTime += s;
                }
              }
            }

            for (let idx = 0; idx < self.departPages.length; idx++) {
              const dPage = self.departPages[idx];

              for (let person = 0; person < dPage.length; person++) {
                let s = self.totalSecond(dPage[person].itemMessage);

                if (s != 0) {
                  totalPerson++;
                  totalTime += s;
                }
              }
            }

            if (totalPerson >= 1) {
              var diff = totalTime / totalPerson;
              var ss = diff % 60;
              ss = (ss > 9 ? "" : "0") + ss;

              diff = (diff - ss) / 60
              var mm = diff % 60;
              mm = (mm > 9 ? "" : "0") + mm;

              diff = (diff - mm) / 60
              var hh = diff % 24;
              hh = (hh > 9 ? "" : "0") + hh;

              self.residenceTime = hh + ":" + mm + ":" + ss;
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
              p.style.float = 'left';

              container.appendChild(p);
              p.innerText = new Date(v["timestamp"]).HH_MM_SS();

              var p = document.createElement("p");
              p.style.float = 'right';

              container.appendChild(p);
              p.innerText = (+v["score"] * 100).toFixed(2) + '%';

              this.visitor_list.appendChild(card);
            }
          }
          else {
            // Modify
            var img = card.getElementsByTagName("img")[0];
            var snap = "data:image/jpeg;base64," + v["snapshot"];
            var src = img.getAttribute("src");

            if (src != snap)
              img.setAttribute("src", snap);
          }
        }
      },

      totalSecond(msg) {
        let p = msg.split(':');

        if (p.length == 3) {
          return (+p[0] * 3600) + (+p[1] * 60) + (+p[2]);
        }
        else {
          return 0;
        }
      },

      async eventSlideToItem(index) {
        if (!this.eventPages || !this.$refs.eventCarouselPanel) return;
        if (this.eventPages.length <= 0 || this.eventPages[0].length <= 0) return;

        if (index > this.eventPages.length - 1) {
          this.$refs.eventCarouselPanel.setFirstActive();
        }
        else {
          this.eventIndex = index;
        }

        let eventPagesPersons = this.eventPages[index];
        if (eventPagesPersons) {
          for (let i = 0; i < eventPagesPersons.length; i++) {
            let data = eventPagesPersons[i];
            if (data.photoImage === "") {
              await this.setCardDisplayPhoto(data);
            }
          }
        }
      },

      async entrySlideToItem(index) {
        if (!this.entryPages || !this.$refs.entryCarouselPanel) return;
        if (this.entryPages.length <= 0 || this.entryPages[0].length <= 0) return;

        if (index > this.entryPages.length - 1) {
          this.$refs.entryCarouselPanel.setFirstActive();
        }
        else {
          this.entryIndex = index;
        }

        let entryPagesPersons = this.entryPages[index];
        if (entryPagesPersons) {
          for (let i = 0; i < entryPagesPersons.length; i++) {
            let data = entryPagesPersons[i];
            if (data.photoImage === "") {
              await this.setCardDisplayPhoto(data);
            }
          }
        }
      },

      async departSlideToItem(index) {
        if (!this.departPages || !this.$refs.departCarouselPanel) return;
        if (this.departPages.length <= 0 || this.departPages[0].length <= 0) return;

        if (index > this.departPages.length - 1) {
          this.$refs.departCarouselPanel.setFirstActive();
        }
        else {
          this.departIndex = index;
        }

        let departPagesPersons = this.departPages[index];
        if (departPagesPersons) {
          for (let i = 0; i < departPagesPersons.length; i++) {
            let data = departPagesPersons[i];
            if (data.photoImage === "") {
              await this.setCardDisplayPhoto(data);
            }
          }
        }
      },

      prevPage(type) {
        switch (type) {
          case "EVENT":
            this.$refs.eventCarouselPanel.previousItem();
            this.$refs.eventCarouselPanel.pauseInterval();
            break;
          case "ENTRY":
            this.$refs.entryCarouselPanel.previousItem();
            this.$refs.entryCarouselPanel.pauseInterval();
            break;
          case "DEPART":
            this.$refs.departCarouselPanel.previousItem();
            this.$refs.departCarouselPanel.pauseInterval();
            break;
        }
      },

      nextPage(type) {
        switch (type) {
          case "EVENT":
            this.$refs.eventCarouselPanel.nextItem();
            this.$refs.eventCarouselPanel.pauseInterval();
            break;
          case "ENTRY":
            this.$refs.entryCarouselPanel.nextItem();
            this.$refs.entryCarouselPanel.pauseInterval();
            break;
          case "DEPART":
            this.$refs.departCarouselPanel.nextItem();
            this.$refs.departCarouselPanel.pauseInterval();
            break;
        }
      },


      async sendAcknowledgestatus() {
      },

      formatTemperature(temp) {
        if (!temp) return temp;
        if (isNaN(Number(temp))) return temp;

        if (this.config.temperature_unit_celsius) {
          return Number(temp).toFixed(1) + '°C'
        }

        return Number((+temp * 9 / 5) + 32).toFixed(1) + '°F';
      },

      setHtmlFontSize() {
        const clientWidth = screen.width;

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
        // 1rem = 10px;
        document.documentElement.style.fontSize = "62.5%";
        // }
      },

      removeHtmlFontSize() {
        document.documentElement.style.fontSize = null;
      },

      resizeHandler() {
        let eventItem = document.getElementsByClassName("event");
        let entryedItem = document.getElementsByClassName("entryed");
        let leavedItem = document.getElementsByClassName("leaved");

        if (!this.cardresized) {
          this.cardresized = true;

          for (let i = 0; i < eventItem.length; i++) {
            const e = eventItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }

          for (let i = 0; i < entryedItem.length; i++) {
            const e = entryedItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }

          for (let i = 0; i < leavedItem.length; i++) {
            const e = leavedItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }

          this.setHtmlFontSize();
          this.splitEventPage();
          this.splitEntryPage();
          this.splitDepartPage();
        }

        let width = 1273;
        let height = 857;

        width = entryedItem[0].clientWidth;
        height = entryedItem[0].clientHeight;

        let rW = width / 1273;
        let rH = height / 857;
        let zoom = Math.min(rW, rH);

        for (let i = 0; i < eventItem.length; i++) {
          const e = eventItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

        for (let i = 0; i < entryedItem.length; i++) {
          const e = entryedItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

        for (let i = 0; i < leavedItem.length; i++) {
          const e = leavedItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

      },

      tmpStorageData() {
        let tmp = {
          timestamp: new Date().yyyy_mm_dd(),
          eventPersons: this.eventPersons,
        };
        localStorage.setItem("CapacityStatus", JSON.stringify(tmp));
        console.log("save CapacityStatus =====================================");
      },

      toLoginPage() {
        const self = this;
        self.flag_login = false;
        self.value_username = "";
        self.$globalLogout();

        this.$router.push('/');
      },
    }
  }

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
  .btn-temp {
    font-size: 1.6rem;
    padding: 0.5rem 1.7rem;
    margin: .5rem;
    border-radius: .5rem;
  }

  .alertModal_Img {
    width: 100%;
    max-width: 100%;
  }

  .alertModal_Title {
    font-size: 2.4rem;
  }

  .alertModal_Text {
    font-size: 1.8rem;
  }

  .alertModel_Input .form-control {
    max-width: 20rem;
    height: 4rem;
    border-radius: .5rem;
    font-size: 1.8rem;
  }

  .capacity {
    background-image: url(/img/capacity/bg-ds.png);
    background-repeat: no-repeat;
    background-size: cover;
    min-height: 100vh;
    max-height: 100vh;
    min-width: 100vw;
    overflow: hidden;
  }

  // ======= header =======

  .card-header {
    background-color: unset !important;
  }

  .header {
    height: 8rem;
    border-bottom: 0;
    padding: 0 !important;
  }

  .header .identity {
    width: 20rem;
    float: left;
    height: 100%;
    padding-left: .5rem;
    padding-top: .5rem;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    cursor: pointer;
    flex: 0 0 20rem;
  }

  .header .title {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header .entry-Status {
    float: right;
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 3rem;
    padding-left: 3rem;
    font-size: 3rem;
    color: #fff;
  }

  .timer-panel {
    float: right;
    color: #fafafa;
    height: 100%;
    padding-top: 1.2rem;
    padding-right: 3rem;
    padding-bottom: 3.4rem;
    font-size: 1.8rem;
  }

  .poweredby {
    width: 100%;
    font-size: 1.6rem;
    color: #fff;
    align-items: baseline;
    justify-content: flex-end;
    display: inline-flex;
    margin-top: .2rem;

    img {
      position: relative;
      top: .1rem;
      max-width: 100%;
      width: 4.8rem;
      margin-left: 1rem;
    }
  }

  // ======= event =======

  .event {
    height: 26.4rem;
  }

  .event .title {
    height: 4.8rem;
    background-color: rgba(0, 0, 0, 0.6);
  }

  .event .title .caption {
    font-size: 1.8rem;
    color: white;
    padding-left: 1rem;
    padding-right: 3rem;
  }

  .event .title select {
    height: 4rem;
    margin-top: .4rem;
    width: 22rem;
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 1.8rem;
  }

  .event .title select option {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 1.8rem;
  }

  .event .title .paging {
    float: right;
    font-size: 1.8rem;
    color: white;
    height: 4.8rem;
    display: flex;
    align-items: center;
    padding-right: 2rem;
    word-spacing: 1rem;
  }

  .event .cardcontainer {
    height: calc(100% - 4.8rem);
  }

  .event .carditem {
    height: 21.5rem;
    float: left;
  }

  // ======= entryed leaved  =======

  .entryed {
    width: 127.5rem;
    flex: 2 2 auto;
    /* height: calc(100vh - 80px); */
    height: 850px;
    border-right: .2rem solid rgba(255, 255, 255, 0.1);
  }

  .entryed .title,
  .leaved .title {
    height: 4rem;
  }

  .entryed .caption,
  .leaved .caption {
    float: left;
    font-size: 2rem;
    font-weight: 600;
    color: white;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 1rem;
  }

  .entryed .paging,
  .leaved .paging {
    float: right;
    font-size: 2rem;
    font-weight: 600;
    color: white;
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 2rem;
    word-spacing: 1rem;
  }

  .entryed .title {
    background-color: rgba(107, 189, 218, 0.6);
  }

  .leaved .carousel-item,
  .entryed .carousel-item {
    overflow-y: auto;
    height: calc(100vh - 40rem);

    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 .6rem rgba(0, 0, 0, 0.3);
      background-color: #445051;
    }

    &::-webkit-scrollbar {
      width: .5rem;
      background-color: #F5F5F5;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 1rem;
      -webkit-box-shadow: inset 0 0 .6rem rgba(0, 0, 0, .3);
      background-color: #8a9699;
    }
  }

  .leaved.hideEventPanel .carousel-item,
  .entryed.hideEventPanel .carousel-item {
    height: calc(100vh - 13rem);
  }

  .leaved .carousel-item.active,
  .entryed .carousel-item.active {
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
  }

  .leaved {
    width: 64.5rem;
    flex: 1 1 auto;
    /* height: calc(100vh - 80px); */
    height: 850px;
    border-left: .2rem solid rgba(255, 255, 255, 0.1);
  }

  .leaved .title {
    background-color: rgba(152, 152, 152, 0.6);
  }

  // ===================
  .page-btn {
    font-size: 1.7rem;
    padding: .2rem .4rem;
    margin: 0 .3rem;
    color: white;
    position: relative;

    &:hover::after {
      content: "";
      border-bottom: .1rem solid;
      bottom: -.2rem;
      left: .3rem;
      right: .3rem;
      position: absolute;
    }
  }

  @media (max-width: 1450px) {
    .header .title {
      display: none;
    }

    .header .entry-Status {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 1150px) {
    .header .entry-Status {
      font-size: 2.2rem;
    }
  }

  @media (max-width: 768px) {
    .timer-panel {
      padding-top: 0.6rem;
      padding-right: 0.3rem;
      font-size: 1.8rem;
      transform: scale(0.8);
    }

    .header {
      height: 6.9rem;
    }

    .header .entry-Status {
      font-size: 1.6rem;
      padding-right: 0.5rem;
      padding-left: 0;
    }

    .header .identity {
      width: 11.3rem;
    }

    .event .title .caption {
      font-size: 1.8rem;
    }

    .event .title .paging {
      font-size: 1.8rem;
    }

    .entryed .caption,
    .leaved .caption {
      font-size: 1.7rem;
    }

    .event .title .paging,
    .entryed .paging,
    .leaved .paging {
      font-size: 1.7rem;
      padding-right: 1.3rem;
    }

    .entryed,
    .leaved {
      flex: 1 1 50%;
    }
  }
</style>