<template>
  <div>
    <div class="leadToDashboard" @dblclick="leadToDashboard"></div>

    <div ref="advertisingPanel" class="welcome-panel"
      style="position: absolute; z-index: 100; background-color: black;">
      <CCarousel animate :interval="config.advertisingDuration * 1000" class="carousel" ref="carouselpanel">
        <CCarouselItem v-for="(page, i) in config.advertising" :key="i">
          <div :style="{backgroundImage:'url('+page+')'}" class="advertising"></div>
        </CCarouselItem>
      </CCarousel>
    </div>

    <div ref="greetingPanel" class="welcome-panel" style="position: absolute; z-index: 50;">
      <div ref="logoPanel" class="logo-panel" @click="toLoginPage"></div>
      <div ref="companyPanel" class="company-panel"></div>

      <div ref="messsagePanel" class="messsage-panel" id="messsage-panel">
        <div class="photo-panel">
          <img ref="photoImg" class="photoImg" src="" style="width: 45rem; height:45rem;"
            onerror="this.style.display='none'">
        </div>
        <div ref="personPanel" class="person-panel"></div>
      </div>

      <swiper class="announcements" ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="(ann, i) in config.announcements" :key="i">{{ ann }}</swiper-slide>
      </swiper>
      <div class="poweredby">Powered by <img :src="`data:image/png;base64,${airaLogo}`" />
      </div>
    </div>
  </div>
</template>

<script>
  import { airaLogoWhite as airaLogo } from '@/utils';
  import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
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

  export default {
    name: 'WelcomeMode',
    components: {
      Swiper,
      SwiperSlide
    },
    directives: {
      swiper: directive
    },
    data: function () {
      return {
        airaLogo,
        config: {},
        timeTicker: null,
        visitors: {},
        preview: false,
        swiperOptions: {
          direction: 'vertical',
          slidesPerView: 1,
          spaceBetween: 30,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false
          }
        },
        cardresized: false,
      }
    },

    created() {
      this.unSubscribe = this.$store.subscribe(async (mutation, state) => {
        switch (mutation.type) {
          case "changeNotifications":

            if (mutation.payload["statusCode"] == `200`) return;

            let payload = mutation.payload;

            let person = payload["person"];
            if (person == undefined) return;

            var data = {
              expire: new Date().valueOf() + this.config.showDuration * 1000,
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
              score: person["score"]
            }

            if (this.config) {
              if (this.config.displayGroup.indexOf(data.group) >= 0) {
                await this.setPersonInOut(data);
              }
            }

            break;
        }
      })
    },
    mounted() {
      const self = this;

      self.$globalGetDisplaySetting(function (err, data) {
        if (!err) {
          self.setDisplayItems(data["WELCOME"]);
        }
        else {
          self.$router.push('/login');
        }
      });
      self.setHtmlFontSize();

      window.addEventListener("resize", self.resizePersonCard);
      self.resizePersonCard();
    },

    beforeDestroy() {
      this.removeHtmlFontSize();
      clearTimeout(this.timeTicker);

      this.unSubscribe();

      window.removeEventListener("resize", vm.resizePersonCard);
    },

    methods: {
      setDisplayItems(config) {

        this.config = config;

        for (let i = this.config.announcements.length - 1; i >= 0; i--) {
          const element = this.config.announcements[i];

          if (element == "") {
            this.config.announcements.splice(i, 1);
          }
        }

        this.config.advertising = this.config.advertising.filter((item) => item != "");

        this.$refs.greetingPanel.style.backgroundImage = `url('` + this.config.background_image + `')`;
        this.$refs.logoPanel.style.backgroundImage = `url('` + this.config.logo + `')`;

        this.$refs.companyPanel.innerText = this.config.companyName;
        this.$refs.companyPanel.style.fontFamily = this.config.companyStyle.font;
        this.$refs.companyPanel.style.color = this.config.companyStyle.color;
        this.$refs.companyPanel.style.fontSize = (+this.config.companyStyle.size / 10) + 'rem';
        this.$refs.companyPanel.style.fontWeight = 'bold';

        let info = this.setDisplayView();
        this.$refs.personPanel.innerHTML = info;
        // this.$refs.personPanel.style.fontFamily = this.config.personStyle.font;
        // this.$refs.personPanel.style.color = this.config.personStyle.color;
        if (this.config.enabledAdvertisingMode) {
          this.$refs.advertisingPanel.style.zIndex = 100;
          setTimeout(() => this.$refs.carouselpanel.setFirstActive(), 168);
        }
        else {
          this.$refs.advertisingPanel.style.zIndex = -1;
        }
        this.timerClick();
      },
      setDisplayView(data = {}) {
        let info = `<div class="container">`;

        let h = 100;
        if (+this.config.areaASize + 20 > h)
          h = +this.config.areaASize + 20;

        if (+this.config.areaBSize + 20 > h)
          h = +this.config.areaBSize + 20;

        info += `<div class="row" style="height: ${h / 10}rem;">`;
        // Area A
        info += `<div style="font-size: ${this.config.areaASize / 10}rem;">`;
        info += this.getPersonInfo(this.config.areaA, data);
        info += `</div>`;

        // Area B
        info += `<div style="font-size: ${this.config.areaBSize / 10}rem; margin-left: auto;">`;
        info += this.getPersonInfo(this.config.areaB, data);
        info += `</div>`;

        info += `</div>`;

        info += `<div class="row" style="height: ${(+this.config.areaCSize + 20) / 10 || 8}rem;"><div style="font-size: ${this.config.areaCSize / 10}rem;">`;
        info += this.getPersonInfo(this.config.areaC, data);
        info += `</div></div>`;

        info += `<div class="row" style="height: ${(+this.config.areaDSize + 20) / 10 || 8}rem;"><div style="font-size: ${this.config.areaDSize / 10}rem;">`;
        info += this.getPersonInfo(this.config.areaD, data);
        info += `</div></div>`;

        info += `<div class="row" style="height: ${(+this.config.areaESize + 20) / 10 || 8}rem;"><div style="font-size: ${this.config.areaESize / 10}rem;">`;
        info += this.getPersonInfo(this.config.areaE, data);
        info += `</div></div>`;

        info += `</div>`;

        return info;
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

      timerClick() {
        const self = this;

        this.timeTicker = setInterval(() => {
          let today = new Date();

          if (self.$refs.personPanel) {
            var info = `<div class="container"><div class="caption" style="font-size: ${self.config.captionSize / 10}rem;">` + self.config.caption + `</div>`;
            info += `<div class="greeting" style="font-size: ${self.config.greetingSize / 10}rem;">` + self.config.greeting + `</div>`;
            info += `<div class="timestamp">` + today.yyyy_mm_dd_HH_MM_SS() + `</div></div>`;
            const v = self.visitors;
            if (v != undefined) {
              if (v.expire != undefined) {
                if (v.expire < today.valueOf()) {
                  if (self.config.enabledAdvertisingMode)
                    self.$refs.advertisingPanel.style.zIndex = 100;

                  self.$refs.personPanel.innerHTML = info;
                  self.$refs.photoImg.style.display = 'none';
                  self.visitors = {};
                }
              }
              else {
                if (self.config.enabledAdvertisingMode)
                  self.$refs.advertisingPanel.style.zIndex = 100;

                self.$refs.personPanel.innerHTML = info;
                self.$refs.photoImg.style.display = 'none';
              }
            }
            else {
              if (self.config.enabledAdvertisingMode)
                self.$refs.advertisingPanel.style.zIndex = 100;

              self.$refs.personPanel.innerHTML = info;
              self.$refs.photoImg.style.display = 'none';
            }
          }
        }, 1000);
      },

      async setPersonInOut(data) {
        if (this.config.enableInfoMask) { this.setPersonInfoMask(data); }

        await this.setCardDisplayPhoto(data);

        if (this.$refs.personPanel) {
          this.visitors = data;
          let info = this.setDisplayView(data);
          this.$refs.personPanel.innerHTML = info;

          this.$refs.advertisingPanel.style.zIndex = -1;
        }
      },

      setPersonInfoMask(data) {
        if (data.employeeno.length > 3)
          data.employeeno = "*****" + data.employeeno.substr(data.employeeno.length - 3, 3);
        else
          data.employeeno = "*****" + data.employeeno.substr(data.employeeno.length - 1, 1);

        if (data.fullname.length > 3)
          data.fullname = "*****" + data.fullname.substr(data.fullname.length - 3, 3);
        else
          data.fullname = "*****" + data.fullname.substr(data.fullname.length - 1, 1);
      },

      async setCardDisplayPhoto(data) {
        const self = this;
        if (data) {
          try {
            let photo = await self.$globalFetchPhoto(data.uuid);
            if (photo.data) {
              data["register_image"] = photo.data.register_image;
              data["display_image"] = photo.data.display_image;
            }
          } catch (e) { }
        }

        switch (this.config.displayPhoto) {
          case 'RegisterPhoto':
            if (data["register_image"]) {
              this.$refs.photoImg.setAttribute("src", `data:image/jpeg;base64,${data["register_image"]}`);
              this.$refs.photoImg.style.display = 'inline';
            }
            else {
              this.$refs.photoImg.setAttribute("src", ``);
              this.$refs.photoImg.style.display = 'none';
            }
            break;
          case 'DisplayPhoto':
            let ret2 = await this.$globalFetchPhoto(data.person_id);
            if (data["display_image"]) {
              this.$refs.photoImg.setAttribute("src", `data:image/jpeg;base64,${data["display_image"]}`);
              this.$refs.photoImg.style.display = 'inline';
            }
            else {
              this.$refs.photoImg.setAttribute("src", ``);
              this.$refs.photoImg.style.display = 'none';
            }
            break;
          case 'CapturedPhoto':
            if (data.snapshot == '') {
              this.$refs.photoImg.setAttribute("src", ``);
              this.$refs.photoImg.style.display = 'none';
            }
            else {
              this.$refs.photoImg.setAttribute("src", `data:image/jpeg;base64,${data.snapshot}`);
              this.$refs.photoImg.style.display = 'inline';
            }
            break;
          case 'None':
            this.$refs.photoImg.style.display = 'none';
            break;
        }
      },

      leadToDashboard() {
        this.$router.push('/reports/personreport')
      },

      setHtmlFontSize() {
        const clientWidth = screen.width;

        if (clientWidth >= 3840) {
          // 1rem = 20px;
          document.documentElement.style.fontSize = "125%";
        } else if (clientWidth >= 2560) {
          // 1rem = 13.3px;
          document.documentElement.style.fontSize = "83.3%";
        } else if (clientWidth < 1367) {
          //  1rem = 13.3px;
          document.documentElement.style.fontSize = "44.4%";
        } else {
          // 1rem = 10px;
          document.documentElement.style.fontSize = "62.5%";
        }
      },

      removeHtmlFontSize() {
        document.documentElement.style.fontSize = null;
      },

      resizePersonCard() {
        let logoItem = document.getElementsByClassName("logo-panel");
        let companyItem = document.getElementsByClassName("company-panel");
        let messageItem = document.getElementsByClassName("messsage-panel");

        if (!this.cardresized) {
          this.cardresized = true;

          for (let i = 0; i < logoItem.length; i++) {
            const e = logoItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }

          for (let i = 0; i < companyItem.length; i++) {
            const e = companyItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }

          for (let i = 0; i < messageItem.length; i++) {
            const e = messageItem[i];
            e.style.setProperty("zoom", 1.0, "important");
          }
        }

        let width = 1891;
        let height = 472;

        width = messageItem[0].clientWidth;
        height = messageItem[0].clientHeight;

        let rW = width / 1891;
        let rH = height / 472;
        let zoom = Math.min(rW, rH);

        for (let i = 0; i < logoItem.length; i++) {
          const e = logoItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

        for (let i = 0; i < companyItem.length; i++) {
          const e = companyItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

        for (let i = 0; i < messageItem.length; i++) {
          const e = messageItem[i];
          e.style.setProperty("zoom", zoom, "important");
        }

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
</style>

<style lang="scss" scoped>
  .welcome-panel {
    background-repeat: no-repeat;
    background-size: 100%;
    min-height: 100vh;
    min-width: 100vw;
    overflow: hidden;
  }

  .logo-panel {
    margin-top: 5rem;
    margin-left: 5rem;
    background-repeat: no-repeat;
    background-size: contain;
    height: 15rem;
    width: 30rem;
    cursor: pointer;
    max-width: 30rem;
  }

  .advertising {
    // background-image: url("/img/welcome/1.jpg");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 50% 50%;
    min-height: 100vh;
    min-width: 100vw;
    overflow: hidden;
  }

  .company-panel {
    position: absolute;
    right: 5rem !important;
    top: 5rem !important;
    line-height: 1;
  }



  .messsage-panel {
    margin-left: 5rem;
    /* height: calc(100vh - 35rem);
    width: calc(100vw - 4rem); */
    overflow: hidden;

    font-size: 8rem;
    color: #fafafa;
  }

  .messsage-panel .caption {
    font-size: 12.5rem;
    font-weight: bolder;
  }

  .messsage-panel .greeting {
    font-size: 11rem;
  }

  .messsage-panel .timestamp {
    text-align: right;
  }

  .messsage-panel .person-panel {
    display: flex;
    align-items: center;
    /* Vertical center alignment */
    justify-content: center;
    height: 100%;

    float: right;
    margin-right: 35rem;
    /* width: calc(100vw - 65rem);
    max-width: calc(100vw - 65rem); */
  }

  .messsage-panel .person-panel .container {
    padding-left: 0;
    padding-right: 0;
    margin-left: 0;
    margin-right: 0;
    max-width: calc(100vw - 65rem);
  }

  .messsage-panel .photo-panel {
    display: flex;
    align-items: center;
    /* Vertical center alignment */
    justify-content: center;
    width: 25%;
    height: 100%;
    float: left;
    margin-right: 5rem;
  }

  .messsage-panel .photo-panel .photoImg {
    /* clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); */
    border-radius: 999em;
  }

  .swiper-container {
    position: fixed;
    bottom: 1rem;
    height: 4rem;
    color: white;
    font-size: 3rem;
    padding-left: 3.5rem !important;
    width: calc(100% - 27rem);
  }

  .poweredby {
    position: fixed;
    bottom: 1rem;
    right: 1.5rem;
    font-size: 1.6rem;
    color: #fff;
    align-items: baseline;
    justify-content: flex-end;
    display: inline-flex;
    width: 25rem;

    img {
      position: relative;
      top: 1px;
      max-width: 100%;
      width: 48px;
      margin-left: 10px;
    }
  }

  .leadToDashboard {
    position: fixed;
    left: 0;
    top: 0;
    width: 60px;
    height: 60px;
    z-index: 70;
  }
</style>