<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ $t('ModifyWelcomeControl') }}
        </div>
        <stepprogress
          class="w-step-progress-5"
          :active-thickness="param_activeThickness"
          :passive-thickness="param_passiveThickness"
          :active-color="param_activeColor"
          :passive-color="param_passiveColor"
          :steps="[
            $t('CompanyInfo'),
            $t('DigitalSignage'),
            $t('PersonInfo'),
            $t('Complete'),
          ]"
          :current-step="flag_currentSetp"
          :line-thickness="param_lineThickness"
          icon-class="fa fa-check"
        />
      </CCol>
    </CRow>
    <CRow>
      <CCol
        sm="6"
        v-show="flag_currentSetp==0||flag_currentSetp==1||flag_currentSetp==2"
      >
        <div :class="showOnStep(0)">
          <CCard>
            <CCardHeader>{{ $t('BackgroundImage') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      ref="uploadBackgroundFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onBackgroundUploadFiles"
                      :disabled="flag_backgrounduploading"
                    >
                  </label>
                </CCol>
                <CCol sm="12">
                  <img
                    id="backgroundImage"
                    :src="value_welcomeSetting.background_image"
                    class="w-100 object-fit-contain background-size-cover img-default-bg h-col-lg"
                  >
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>{{ $t('Logo') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ $t('ChooseFile') }}
                    <input
                      ref="uploadLogoFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onLogoUploadFiles"
                      :disabled="flag_logouploading"
                    >
                  </label>
                </CCol>
                <CCol sm="9">
                  <img
                    id="logoImage"
                    :src="value_welcomeSetting.logo"
                    style="
                    margin: auto;
                    height: 80px;
                    object-fit: contain;
                    background-color: #ebedef;
                  "
                    class="w-100"
                  >
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
        <div :class="showOnStep(1)">
          <!-- <CCard>
            <CCardHeader>
              <CSwitch size="lg" color="success" shape="pill" :checked="value_welcomeSetting.enabledGreetingMode"
                @update:checked="value_welcomeSetting.enabledGreetingMode = !value_welcomeSetting.enabledGreetingMode;
                value_welcomeSetting.enabledAdvertisingMode = !value_welcomeSetting.enabledGreetingMode;" />
              <span class="h5 ml-2 my-0">{{ $t('GreetingMode') }}</span>
            </CCardHeader>
            <CCardBody>
              <fieldset :disabled="!value_welcomeSetting.enabledGreetingMode">
                <CRow>
                  <CCol sm="4">
                    <div class="column-space-between">
                      <div class="h5">{{ $t('Caption') }}</div>
                      <CInput class="mb-form-row" size="lg" v-model="value_welcomeSetting.caption" />
                    </div>
                  </CCol>
                  <CCol sm="2">
                    <div class="column-space-between">
                      <div class="h5">{{ $t('FontSize') }}</div>
                      <CInput class="mb-form-row" size="lg" v-model="value_welcomeSetting.captionSize" />
                    </div>
                  </CCol>
                  <CCol sm="4">
                    <div class="column-space-between">
                      <div class="h5">{{ $t('Greeting') }}</div>
                      <CInput class="mb-form-row" size="lg" v-model="value_welcomeSetting.greeting" />
                    </div>
                  </CCol>
                  <CCol sm="2">
                    <div class="column-space-between">
                      <div class="h5">{{ $t('FontSize') }}</div>
                      <CInput class="mb-form-row" size="lg" v-model="value_welcomeSetting.greetingSize" />
                    </div>
                  </CCol>
                </CRow>
              </fieldset>
            </CCardBody>
          </CCard> -->

          <CCard>
            <CCardHeader>
              <CSwitch
                size="lg"
                color="success"
                shape="pill"
                :checked="value_welcomeSetting.enabledAdvertisingMode"
                @update:checked="
                  value_welcomeSetting.enabledAdvertisingMode = !value_welcomeSetting.enabledAdvertisingMode;
                  value_welcomeSetting.enabledGreetingMode = !value_welcomeSetting.enabledAdvertisingMode;
                "
              />
              <span class="h5 ml-2 my-0">{{ $t('AdvertisingMode') }}</span>
            </CCardHeader>
            <CCardBody>
              <fieldset :disabled="!value_welcomeSetting.enabledAdvertisingMode">
                <CRow>
                  <CCol sm="3">
                    <div class="h5">
                      {{ $t('Duration') }}
                    </div>
                    <CInput
                      class="mb-form-row"
                      size="lg"
                      v-model="value_welcomeSetting.advertisingDuration"
                    />
                  </CCol>
                  <CCol
                    sm="3"
                    v-for="(value, idx) in value_welcomeSetting.advertising"
                    :key="`${uuidv4() + idx}`"
                  >
                    <img
                      :id="`advertisingimage${idx}`"
                      :src="value"
                      :key="componentKey"
                      class="w-100 mb-2 d-block img-upload-block object-fit-contain"
                    >
                    <div class="d-flex justify-content-between mb-3">
                      <CButton
                        variant="outline"
                        class="btn btn-outline-primary mb-3"
                        @click="clickOnPickAdvertisingImage(idx)"
                        :disabled="flag_isPickingRegisterPhoto"
                      >
                        <span>{{ $t('SelectPhoto') }}</span>
                      </CButton>
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <CButton
                        variant="outline"
                        class="btn btn-outline-primary mb-3"
                        @click="clickOnRemoveAdvertisingImage(idx)"
                      >
                        <span>{{ $t('DeletePhoto') }}</span>
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </fieldset>
            </CCardBody>
          </CCard>
        </div>
        <div :class="showOnStep(2)">
          <CCard>
            <CCardHeader>{{ $t('PersonalDisplay') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayPhoto') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.displayPhoto"
                    :options="value_displayPhotoList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 1
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.line1"
                    :options="value_displayPrimaryList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 2
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.line2"
                    :options="value_displayAttributeList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 3
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.line3"
                    :options="value_displayAttributeList"
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 4
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.line4"
                    :options="value_displayAttributeList"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>{{ $t('PageDisplay') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('DisplayGroup') }}
                  </div>
                  <multiselect
                    v-model="value_welcomeSetting.displayGroup"
                    placeholder=""
                    style="margin-bottom: 12px;"
                    :options="value_displayGroupList"
                    :multiple="true"
                    :taggable="true"
                    :hide-selected="true"
                    :select-label="$t('Select')"
                    :selected-label="$t('Selected')"
                    :deselect-label="$t('Deselect')"
                    :show-no-options="false"
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('WelcomeGreeting') }}
                  </div>
                  <CInput
                    class="mb-form-row"
                    size="lg"
                    v-model="value_welcomeSetting.welcomeword"
                  />
                </CCol>
                <CCol sm="9">
                  <div class="h5">
                    {{ $t('Maintitle') }}
                  </div>
                  <CInput
                    class="mb-form-row"
                    size="lg"
                    v-model="value_welcomeSetting.maintitle"
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('Subtitle') }}
                  </div>
                  <CInput
                    class="mb-form-row"
                    size="lg"
                    v-model="value_welcomeSetting.subtitle"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('NumberOfDisplayPersons') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.numberOfDisplayPersons"
                    :options="[1,2,3,4]"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('Duration') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_welcomeSetting.showDuration"
                    :options="[5,10,15,20,30]"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
      <CCol
        sm="6"
        v-show="flag_currentSetp==0||flag_currentSetp==1||flag_currentSetp==2"
      >
        <table
          width="590"
          height="332"
          :style="`background-image: url('${value_welcomeSetting.background_image}')`"
          style="background-size: 100% 100%; background-repeat: no-repeat; background-position: center;"
        >
          <tr>
            <td height="46">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 15px;">
                <img
                  :src="`${value_welcomeSetting.logo}`"
                  style="width:120px; height:45px;"
                >
                <div style="font-family: 'Noto Sans'; color: white; font-size: 24px; font-weight: 300;">
                  {{ currentTime }}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              align="center"
              valign="top"
              height="30"
              style="
                font-family: 'Noto Sans';
                color: white;
                font-size: 36px;
                font-style:italic;
                font-weight: 200;
                letter-spacing: 3%;
                text-shadow: 0px 0px 12px #FF00B0, 0px 0px 6px #47EAFF;
              "
            >
              {{ value_welcomeSetting.welcomeword }}
            </td>
          </tr>
          <tr>
            <td
              align="center"
              valign="top"
              height="30"
              style="font-family: 'Noto Sans TC'; color: #FFFFFF;"
            >
              {{ value_welcomeSetting.maintitle }}
            </td>
          </tr>
          <tr>
            <td
              align="center"
              height="100%"
            >
              <div style="display: flex; justify-content: center;">
                <span
                  v-for="(n, index) in value_welcomeSetting.numberOfDisplayPersons"
                  :key="`${uuidv4() + index}`"
                  style="flex-direction: column; align-items: center; width: 135px;"
                >
                  <img
                    v-show="value_welcomeSetting.displayPhoto!='NONE'"
                    src="@/assets/img/welcomeSample.jpg"
                    width="95px"
                    height="95px"
                    style="border: 1px solid white; border-radius: 12px;"
                  >
                  <div
                    class="welcome-card-text-box1"
                    style="padding: 10px 0;"
                  >
                    <div
                      v-show="value_welcomeSetting.line1!='NONE'"
                      style="color: white; font-weight: 800; font-size: 18px"
                    >
                      {{ value_welcomeSetting.line1 }}</div>
                    <div
                      v-show="value_welcomeSetting.line2!='NONE'"
                      style="color: white; font-weight: 600; font-size:14px"
                    >
                      {{ value_welcomeSetting.line2 }}</div>
                    <div
                      v-show="value_welcomeSetting.line3!='NONE'"
                      style="color: white;"
                    >
                      {{ value_welcomeSetting.line3 }}</div>
                    <div
                      v-show="value_welcomeSetting.line4!='NONE'"
                      style="color: white; font-size:10px"
                    >
                      {{ value_welcomeSetting.line4 }}</div>
                  </div>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td
              align="center"
              valign="bottom"
              style="font-family: 'Noto Sans TC';
            color: #FFFFFF;"
            >
              {{ value_welcomeSetting.subtitle }}
            </td>
          </tr>
        </table>
      </CCol>

      <CCol
        sm="12"
        v-show="flag_currentSetp==3"
      >
        <div :class="showOnStep(3)">
          <CCard :style="param_cardStyle">
            <CCardBody>
              <div style="height: 220px" />
              <CRow>
                <CCol sm="12">
                  <p class="display-4 row justify-content-center">
                    {{ $t('Complete') }}
                  </p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="12">
        <!-- <div style="text-align: right"> -->
        <div class="row justify-content-center">
          <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
            <CButton
              variant="outline"
              style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
              size="lg"
              @click="clickOnPrev"
            >
              {{ $t('Return') }}
            </CButton>
          </div>
          <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2">
            <CButton
              variant="outline"
              style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
              size="lg"
              @click="clickOnPrev"
            >
              {{ $t('Previous') }}
            </CButton>
          </div>
          <div style="width: 20px" />
          <div>
            <CButton
              class="btn btn-primary mb-3"
              size="lg"
              @click="clickOnNext"
            >
              {{ nextButtonName() }}
            </CButton>
          </div>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';
import { v4 as uuidv4 } from 'uuid';

// import VueScheduler from '@duoa/vue-scheduler';
// import '@/airacss/vue-scheduler.css';

import { backgroundImage, airalogo } from '@/utils/welcomeMode';

export default {
  name: 'WelcomeControlSettingForm',
  props: {
    formData: {
      type: Object,
      default: () => ({}),
    },
    onFinish: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      obj_loading: null,
      currentTime: '',
      timeInterval: null,

      param_cardStyle: 'height: 35rem;', //
      param_activeColor: '#6baee3', //
      param_passiveColor: '#919bae', //
      param_lineThickness: 3, //
      param_activeThickness: 3, //
      param_passiveThickness: 3, //

      value_displayPhotoList: [
        { value: 'NONE', label: this.$t('None') },
        { value: 'REGISTER', label: this.$t('RegisterPhoto') },
        { value: 'SNAPSHOT', label: this.$t('CapturedPhoto') },
        { value: 'DISPLAY', label: this.$t('DisplayPhoto') },
      ],

      value_displayPrimaryList: [
        { value: 'NONE', label: this.$t('None') },
        { value: 'NAME', label: this.$t('PersonName') },
        { value: 'PARTIALNAME', label: this.$t('PartialName') },
      ],

      value_displayAttributeList: [
        { value: 'NONE', label: this.$t('None') },
        { value: 'ID', label: this.$t('PersonId') },
        { value: 'DEPARTMENT', label: this.$t('Department') },
        { value: 'JOBTITLE', label: this.$t('JobTitle') },
        { value: 'GROUP', label: this.$t('GroupName') },

      ],

      value_displayGroupList: [],

      // value_displayGroupList: [],
      // value_displayChannelList: [],

      flag_backgrounduploading: false,
      flag_logouploading: false,
      flag_isPickingRegisterPhoto: false,

      componentKey: 0,

      value_Setting: {},
      value_welcomeSetting: {
        displayMode: 'WELCOME',
        uuid: '',
        background_image: backgroundImage,
        logo: airalogo,

        displayPhoto: 'REGISTER',
        line1: 'JOBTITLE',
        line2: 'NAME',
        line3: 'GROUP',
        line4: 'NONE',
        welcomeword: 'Welcome',
        maintitle: '2023 Product launch',
        subtitle: 'aira Corporation',
        numberOfDisplayPersons: 4,
        showDuration: 10,

        displayGroup: ['All Person'],
        enabledGreetingMode: true,
        caption: '人臉辨識影像解決方案',
        captionSize: 125,
        greeting: '歡迎您的蒞臨',
        greetingSize: 110,
        enabledAdvertisingMode: false,
        advertisingDuration: 15,
        advertising: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg=='],
      },

      value_returnRoutePath: '',
      value_group_list: [],

      flag_currentSetp: 0,

      ...this.formData,
    };
  },
  created() { },
  async mounted() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);

    this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

    this.$globalGetGroupList((err, data) => {
      if (!err) {
        this.value_displayGroupList = [];
        data.forEach((element) => {
          this.value_displayGroupList.push(element.name);
        });
      }
    });

    this.$globalGetDisplaySetting((err, data) => {
      if (!err) {
        this.value_Setting = data || {};

        this.welcome = this.value_Setting.WELCOME;
        this.value_welcomeSetting.uuid = this.makeid(32);

        // this.value_welcomeSetting = Object.assign({}, this.value_welcomeSetting, this.welcome);
        this.value_welcomeSetting = { ...this.value_welcomeSetting, ...this.welcome };

        for (let i = 0; i < this.value_welcomeSetting.advertising.length; i += 1) {
          const advertising = this.value_welcomeSetting.advertising[i];
          if (advertising.length <= 0) {
            this.value_welcomeSetting.advertising[i] = 'data:image/png;base64,'
                + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
          }
        }
      }

      if (this.obj_loading) this.obj_loading.hide();
    });
  },
  updated() { },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  watch: {},
  methods: {
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}`;
    },
    makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    onBackgroundUploadFiles() {
      const file = this.$refs.uploadBackgroundFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        this.value_welcomeSetting.background_image = myReader.result;
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles() {
      const file = this.$refs.uploadLogoFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        this.value_welcomeSetting.logo = myReader.result;
      };
      myReader.readAsDataURL(file);
    },

    clickOnPickAdvertisingImage(idx) {
      this.flag_isPickingRegisterPhoto = true;
      this.selectPhotoFromFile((img) => {
        if (img) {
          this.value_welcomeSetting.advertising[idx] = img.src;
          this.componentKey += 1;
        }
      });
      this.flag_isPickingRegisterPhoto = false;
    },

    clickOnRemoveAdvertisingImage(idx) {
      this.value_welcomeSetting.advertising[idx] = 'data:image/png;base64,'
          + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
      this.componentKey -= 1;
    },

    selectPhotoFromFile(cb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onclick = function handleClick(e) {
        if (e.target.value.length === 0) {
          if (cb) cb(null);
        }
      };
      input.onchange = function handleChange(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file, 'UTF-8');
        reader.onload = async (readerEvent) => {
          const img = document.createElement('img');
          img.src = readerEvent.target.result;

          if (cb) cb(img);
        };
      };
      input.click();
    },

    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('Next');
        case 2:
          return this.$t('Next');
        case 3:
          return this.$t('Complete');
        default:
          return this.$t('Complete');
      }
    },
    clickOnPrev() {
      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        }
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    clickOnNext() {
      if (this.flag_currentSetp === 0) {
        this.flag_currentSetp = 1;
      } else if (this.flag_currentSetp === 1) {
        this.flag_currentSetp = 2;
      } else if (this.flag_currentSetp === 2) {
        if (this.onFinish) {
          this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

          const sendData = {
            displayMode: 'WELCOME',
            uuid: this.value_welcomeSetting.uuid,
            background_image: this.value_welcomeSetting.background_image,
            logo: this.value_welcomeSetting.logo,
            displayPhoto: this.value_welcomeSetting.displayPhoto,
            line1: this.value_welcomeSetting.line1,
            line2: this.value_welcomeSetting.line2,
            line3: this.value_welcomeSetting.line3,
            line4: this.value_welcomeSetting.line4,

            displayGroup: this.value_welcomeSetting.displayGroup,
            welcomeword: this.value_welcomeSetting.welcomeword,
            maintitle: this.value_welcomeSetting.maintitle,
            subtitle: this.value_welcomeSetting.subtitle,
            numberOfDisplayPersons: this.value_welcomeSetting.numberOfDisplayPersons ? +this.value_welcomeSetting.numberOfDisplayPersons : 4,
            showDuration: this.value_welcomeSetting.showDuration ? +this.value_welcomeSetting.showDuration : 10,

            enabledGreetingMode: this.value_welcomeSetting.enabledGreetingMode,
            caption: this.value_welcomeSetting.caption,
            captionSize: this.value_welcomeSetting.captionSize,
            greeting: this.value_welcomeSetting.greeting,
            greetingSize: this.value_welcomeSetting.greetingSize,
            enabledAdvertisingMode: this.value_welcomeSetting.enabledAdvertisingMode,
            advertisingDuration: this.value_welcomeSetting.advertisingDuration,
            advertising: this.value_welcomeSetting.advertising,
          };

          this.value_Setting.WELCOME = sendData;

          this.onFinish(this.value_Setting, (success) => {
            if (this.obj_loading) this.obj_loading.hide();
            if (success) {
              this.flag_currentSetp = 3;
            } else {
              // this.$alert( this.disp_registerFailed + ' : ' + ( result && result.message ? result.message : 'network loss') );
              this.$fire({
                text: this.$t('Failed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          });
        } else this.flag_currentSetp = 0;
      } else {
        // this.$router.push({ name: this.value_returnRoutePath })
        this.flag_currentSetp = 0;
      }
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step === this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
    uuidv4,
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
    // scheduler: VueScheduler,
  },
};
</script>
