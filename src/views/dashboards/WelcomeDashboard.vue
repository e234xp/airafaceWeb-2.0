<template>
  <div class="ratio-wrap ratio-wrap-16x9" v-show="!isLoadSetting">
    <div v-if="displaySettings.enabledAdvertisingMode" ref="advertisingPanel" class="ratio-content welcome-dashboard"
      style="position: absolute; z-index: 100; background-color: black; width: 100%; height: 100%; ">
      <CCarousel animate :interval="displaySettings.advertisingDuration * 1000" class="carousel" ref="carouselpanel">
        <CCarouselItem v-for="(page, i) in displaySettings.advertising" :key="i">
          <div :style="{backgroundImage:'url('+page+')'}" class="advertising"></div>
        </CCarouselItem>
      </CCarousel>
    </div>

    <div ref="welcomePanel" class="ratio-content welcome-dashboard" style="position: absolute; z-index: 50;"
      :style="{backgroundImage:'url('+displaySettings.background_image+')'}">
      <div class="welcome-logo" @click="toLoginPage"
        :style="[{'backgroundImage':'url('+displaySettings.logo+')', 'zoom':zoomRatio+' !important'}]"></div>

      <div class="welcome-header" :style="'zoom: ' + zoomRatio + ' !important;'">
        <div class="welcome-message">{{ displaySettings.welcomeword }}</div>
        <div class="welcome-title">{{ displaySettings.maintitle }}</div>
      </div>
      <transition-group tag="div" class="welcome-cards-container card-list"
        :style="'zoom: ' + zoomRatio + ' !important;'" name="list">
        <div v-for="(person, index) in shownPersons" class="welcome-card item" :key="index">
          <img class="welcome-card-img" :src="`data:image/jpeg;base64,${showField(person, 'displayPhoto' )}`" />
          <div class="welcome-card-text-box">
            <div class="welcome-card-title">{{ showField(person, "line1") }}</div>
            <div class="welcome-card-name">{{ showField(person, "line2") }}</div>
            <div class="welcome-card-department">{{ showField(person, "line3") }}</div>
            <div class="welcome-card-remarks">{{ showField(person, "line4") }}</div>
          </div>
        </div>
      </transition-group>

      <div class="welcome-subtitle" :style="'zoom: ' + zoomRatio + ' !important;'">{{ displaySettings.subtitle }}</div>
      <div v-show="isLoadSetting" class="align-items-center" style="color:white">
        Loading...
      </div>
    </div>
  </div>
</template>

<script>
import { airaLogoWhite as airaLogo, px } from '@/utils';
import { backgroundImage } from '@/utils/welcomeMode';
import welcomeModel from '@/models/WelcomeDashboardModel.vue';

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
  name: 'WelcomeDashboard',
  mixins: [welcomeModel],

  data() {
    return {
      unSubscribe: null,
      obj_loading: null,

      isLoadSetting: true,
      isFirstLoading: true,
      zoomRatio: 0,

      shownPersons: [],
      waitingPersons: [],

      displaySettings: {
        displayMode: 'WELCOME',
        background_image: backgroundImage,
        logo: airaLogo,
        enabledAdvertisingMode: false,
        enabledGreetingMode: true,
        advertising: [],
        advertisingDuration: 15,
        displayGroup: ['All Visitor'],
        welcomeword: 'Welcome',
        maintitle: 'Conference 2023',
        subtitle: 'aira Corporation',
        displayPhoto: 'REGISTER',
        line1: 'JOBTITLE',
        line2: 'NAME',
        line3: 'GROUP',
        line4: 'NONE',
        numberOfDisplayPersons: 4,
        showDuration: 15,

        priorityGroup: [],
      },

      looper: null,
    };
  },

  created() {
    const self = this;
    this.unSubscribe = this.$store.subscribe(async (mutation) => {
      const { payload } = mutation;

      let person = null;
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

          if (mutation.payload.type === 0) {
            return;
          }

          if (payload !== undefined) {
            person = payload.person || payload.person_info;
          }

          if (person === undefined) {
            console.log('created subscribe', 'payload.person === undefined');
            return;
          }

          person.snapshot_image = payload.snapshot || payload.face_image;

          self.checkRecord({ ...person, uuid: payload.person_id, groups: payload.groups });
          break;
        default:
          break;
      }
    });

    self.isLoadSetting = false;
  },

  async mounted() {
    const self = this;

    self.isLoadSetting = true;

    const data = await self.$globalGetDisplaySetting();

    const valueSetting = data.data || {};
    const welcome = valueSetting.WELCOME;

    self.displaySettings = { ...self.displaySettings, ...welcome };

    self.displaySettings.showDuration *= 1000;

    for (let idx = self.displaySettings.advertising.length - 1; idx >= 0; idx -= 1) {
      if (self.displaySettings.advertising[idx] === `data:image/png;base64,${px}`) {
        self.displaySettings.advertising.splice(idx, 1);
      }
    }

    self.initViews();
    self.initLooper();

    self.isLoadSetting = false;
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

    this.unSubscribe();

    if (self.looper) {
      clearInterval(self.looper);
    }
  },

  methods: {
    // Tulip
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

      window.addEventListener('resize', () => self.zoomViews());
    },

    // Tulip
    zoomViews() {
      const self = this;
      const dashboards = document.querySelectorAll('.welcome-dashboard');
      if (dashboards) {
        for (let i = 0; i < dashboards.length; i += 1) {
          const dashboard = dashboards[i];

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
        }
      }
    },

    toLoginPage() {
      const self = this;
      self.flag_login = false;
      self.value_username = '';
      self.$globalLogout();

      this.$router.push('/');
    },

    // Tulip
    // setZoom(element) {
    //   const self = this;
    //   element.style.setProperty('zoom', self.zoomRatio, 'important');
    // },

    // Tulip
    initLooper() {
      const self = this;

      self.looper = setInterval(() => {
        const now = new Date() - 0;

        for (let i = self.waitingPersons.length - 1; i >= 0; i -= 1) {
          const wp = self.waitingPersons[i];
          // console.log('initLooper waitingPersons', now, wp.expireTime);

          if (now - wp.expireTime >= 0) {
            self.waitingPersons.splice(i, 1);
          }
        }

        for (let i = self.shownPersons.length - 1; i >= 0; i -= 1) {
          const wp = self.shownPersons[i];

          if (now - wp.expireTime >= 0) {
            self.shownPersons.splice(i, 1);
          }
        }

        if (self.shownPersons.length <= self.displaySettings.numberOfDisplayPersons - 1) {
          while ((self.shownPersons.length < self.displaySettings.numberOfDisplayPersons) && (self.waitingPersons.length >= 1)) {
            const element = self.waitingPerson.shift();

            element.expireTime = now + 5000;
            self.shownPersons.push(element);
          }
        }

        if (self.shownPersons.length <= 0) {
          if (self.$refs.advertisingPanel) {
            if (self.displaySettings.enabledAdvertisingMode) {
              self.$refs.advertisingPanel.style.zIndex = 100;
            }
          }
        }
      }, 1000);
    },

    async checkRecord(pR) {
      const self = this;
      const r = pR;

      let inDisplayGroup = false;

      if (r.groups) {
        if (Array.isArray(r.groups)) {
          inDisplayGroup = r.groups.some((value) => self.displaySettings.displayGroup.indexOf(value) >= 0);
          r.PriorityGroup = r.groups.some((value) => self.displaySettings.priorityGroup.indexOf(value) >= 0);
        }
      }

      if (!inDisplayGroup) return;

      let bADD = false;

      r.expireTime = new Date().valueOf() + self.displaySettings.showDuration;

      let res = await self.$globalFindPerson(r.uuid, 0, 20);
      let { data } = res;

      if (data.message === 'ok') {
        let p = null;

        if (data.person_list && data.person_list.length >= 1) {
          // p = data.person_list[0];
          [p] = data.person_list;
        } else {
          res = await self.$globalFindVisitor(r.uuid, 0, 20);
          data = res.data;

          if (data.message === 'ok') {
            if (data.visitor_list && data.visitor_list.length >= 1) {
              // p = data.visitor_list[0];
              [p] = data.visitor_list;
            }
          }
        }

        if (p) {
          r.register_image = p.register_image;
          r.display_image = p.display_image;
          r.group_list = p.groups;
          r.title = p.extra_info.title;
          r.department = p.extra_info.department;
        }
      }

      if (r.PriorityGroup) {
        for (let j = 0; j < self.shownPersons.length; j += 1) {
          if (!self.shownPersons[j].PriorityGroup) {
            const inList = self.shownPersons.find((item) => item.uuid === r.uuid);
            if (!inList) {
              r.expireTime = new Date().valueOf() + self.displaySettings.showDuration;
              self.shownPersons.splice(j, 0, r);
            }

            bADD = true;
            break;
          }
        }

        if (!bADD && self.shownPersons.length <= self.displaySettings.numberOfDisplayPersons - 1) {
          const inList = self.shownPersons.find((item) => item.uuid === r.uuid);
          if (!inList) {
            r.expireTime = new Date().valueOf() + self.displaySettings.showDuration;
            self.shownPersons.shift(r);
          }
          // else
          //   console.log('in shownPersons list', r);

          bADD = true;
        }

        // showPersons length >= 5 move last item to waitingPersons expire time + 5
        if (self.shownPersons.length >= self.displaySettings.numberOfDisplayPersons + 1) {
          const last = self.shownPersons.pop();
          last.expireTime += self.displaySettings.showDuration;

          self.waitingPersons = self.shownPersons.filter((item) => item.uuid !== r.uuid);
          self.waitingPersons.unshift(last);

          // waitingPersons length >= 5 remove last item
          if (self.waitingPersons.length >= self.displaySettings.numberOfDisplayPersons + 1) {
            self.waitingPersons.pop();
          }
        }
      }

      // shownPersons not full add to shownPersons
      if ((!bADD) && (self.shownPersons.length <= 3)) {
        const inList = self.shownPersons.find((item) => item.uuid === r.uuid);
        if (!inList) {
          r.expireTime = new Date().valueOf() + self.displaySettings.showDuration;

          self.shownPersons.push(r);
        }
        // else
        //   console.log('in shownPersons list', r);

        bADD = true;
      }

      // shownPersons full add to waitingPersons
      if ((!bADD) && self.waitingPersons.length <= self.displaySettings.numberOfDisplayPersons - 1) {
        const inList = self.waitingPersons.find((item) => item.uuid === r.uuid);
        if (!inList) {
          r.expireTime = new Date().valueOf() + self.displaySettings.showDuration;
          self.waitingPersons.push(r);
        }
        // else
        //   console.log('in waitingPersons list', r);
      }

      // console.log('self.shownPersons', self.shownPersons);
      // console.log('waitingPersons', self.waitingPersons);
      //   }
      // }

      if (self.$refs.advertisingPanel) {
        if (self.shownPersons.length >= 1) {
          console.log('advertisingPanel', -1);
          self.$refs.advertisingPanel.style.zIndex = -1;
        } else {
          self.$refs.advertisingPanel.style.zIndex = 100;
          console.log('advertisingPanel', 100);
        }
      }

      // self.checkRecordProcess = false;
      //   });
      // }

      // self.checkRecordTimer = setTimeout(() => {
      //   self.checkRecord();
      // }, 1000);
    },

    showField(person, line) {
      const field = this.displaySettings[line];
      let g = person.group_list || [];

      let ret = '';
      switch (field) {
        case 'ID': ret = person.id; break;
        case 'NAME': ret = person.name; break;
        case 'PARTIALNAME':
          if (person.name.charCodeAt(0) > 256) {
            // '李***瑋'
            ret = `${person.name.charAt(0)}***${person.name.charAt(person.name.length - 1)}`;
          } else {
            // J. Lee
            const names = `${person.name} `.split(' ');
            ret = names[0].charAt(0);

            if (names.length >= 3) {
              ret += (`. ${names[names.length - 2]}`);
            }
          }
          break;
        case 'GROUP':
          g = g.filter((item) => !(item === 'All Person' || item === 'All Visitor'));
          ret = g.join(', ');
          break;
        case 'JOBTITLE': ret = person.title;
          break;
        case 'DEPARTMENT': ret = person.department;
          break;
        case 'REGISTER': ret = person.register_image === '' ? emptyFace : person.register_image; break;
        case 'DISPLAY': ret = person.display_image === '' ? emptyFace : person.display_image; break;
        case 'SNAPSHOT': ret = person.snapshot_image; break;
        case 'NONE':
          if (line === 'displayPhoto') ret = emptyFace;
          break;
        default: ret = emptyFace; break;
      }
      return ret;
    },
  },
};
</script>

<style lang='scss' scoped>
  .welcome-panel {
    background-repeat: no-repeat;
    background-size: 100%;
    min-height: 100%;
    min-width: 100%;
    overflow: hidden;
  }

  .advertising {
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    min-height: 100vh;
    min-width: 100%;
    overflow: hidden;
  }

  .card-list {
    overflow: hidden;
    padding: 0;
    justify-content: center;
  }

  .card-list>div {
    display: flex;
    float: left;
    width: 430px;
    height: 571px;
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
