<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ $t('PageTitleAttendanceBoardSettings') }}
        </div>
        <stepprogress
          class="w-step-progress-4"
          :active-thickness="param_activeThickness"
          :passive-thickness="param_passiveThickness"
          :active-color="param_activeColor"
          :passive-color="param_passiveColor"
          :steps="[
            $t('CompanyInfo'),
            $t('PersonInfo'),
            $t('Complete')
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
        v-show="flag_currentSetp==0||flag_currentSetp==1"
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
                <CCol sm="9">
                  <img
                    id="backgroundImage"
                    :src="value_occupancySetting.background_image"
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
                    :src="value_occupancySetting.logo"
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
          <CCard>
            <CCardHeader>{{ $t('SummaryDisplay') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('SummaryView') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.enableSummaryView"
                    :options="value_EnableList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('SummaryBy') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.summaryBy"
                    :options="value_summaryByList"
                    :disabled="!value_occupancySetting.enableSummaryView"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('Duration') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.summaryPatrolTime"
                    :options="[5,10,15,20,30]"
                    :disabled="!value_occupancySetting.enableSummaryView"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('IdleTime') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.patrolidleTime"
                    :options="[5,10,15,20,30,60]"
                    :disabled="!value_occupancySetting.enableSummaryView"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>{{ $t('PersonalDisplay') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('DisplayGroup') }}
                  </div>
                  <multiselect
                    v-model="value_occupancySetting.displayGroup"
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
                    {{ $t('DisplayMode') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.displayCardMode"
                    :options="value_displayModeList"
                  />
                </CCol>

                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayPhoto') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.displayPhoto"
                    :options="value_displayPhotoList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 1
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.line1"
                    :options="value_displayPrimaryList"
                  />
                </CCol>

                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 2
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.line2"
                    :options="value_displayAttributeList"
                    :disabled="value_occupancySetting.displayCardMode == 'COMPACT'"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>{{ $t('PageDisplay') }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.pageLayout"
                    :options="value_pageLayoutList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('DisplayChart') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.displayChart"
                    :options="value_EnableList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('ResetTime') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.dailyResetTime"
                    :options="value_displayResetTime"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">
                    {{ $t('Duration') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_occupancySetting.personPatrolTime"
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
        v-show="flag_currentSetp==0||flag_currentSetp==1"
      >
        <table
          width="590"
          height="332"
          :style="`background-image: url('${value_occupancySetting.background_image}')`"
          style="background-size: 100% 100%; background-repeat: no-repeat; background-position: center;"
        >
          <tr>
            <td height="46">
              <img
                :src="`${value_occupancySetting.logo}`"
                style="width:60px; height:25px; padding-left: 15px;"
              >
              <span style="float: right; padding-right: 15px; color: #FFFFFF;">12:32</span>
              <span style="float: right; padding-right: 15px; color: #FFFFFF;">06/13/2023</span>
            </td>
          </tr>
          <tr>
            <td
              align="center"
              valign="top"
              height="50"
              v-show="value_occupancySetting.displayChart == true"
            >
              <div style="display: flex; justify-content: center;">
                <div style="width:150px;">
                  <!-- eslint-disable max-len -->
                  <img
                    style="padding-top: 40px;"
                    src="data:image/png;base64,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"
                  >
                  <!-- eslint-enable max-len -->
                </div>
                <div style="width:430px">
                  <!-- eslint-disable max-len -->
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZIAAABUCAMAAACfmkHVAAAC3FBMVEVad2JeeF1ZeldXfVVRdk9bcF1LUmJMVWVKY2dLWmtQV2lTW2tDTl5UWlqKpIyMqY+Iso6HsYKCsYOOsIKBsXyAuHqHtoKJrYyVs5BWa1RrdXtsfo1lgIxrfpRweo5thYdre5R0gJdjZGZcXmNtcnJyd3iXmJqEhYeRkpQ8T0CItot4sXmQt42AvX12sG+HvYF4qXOUyI6PxYlLZU9keI9jepdqf5xddYp5kKFxf5JjdYR1hZlfb39vhaBTYW+Jiozo6evZ2tx9f4FCREajpKbFxcdaW12oqauEpIyAt4S347Kj256/77rJ/MOt3KfC9bx/sm+OsI5mf5t+k6u4zua+0eeXq8Tc7v+gtMxrbG64ubvKy81NTlA0NTc5Ojw+VkN6uXmXwJKNuYR2pHPE67+OvYlifpxxi6iPpcHK4fy/1/GNjpC0tbfT1NZGYkR6t4GLyIPi/96x1a223LF1mm7H8cOtxOOovtlTbImDmrOxxd3Q5/++v8GvsLJ3eHo+VTlwqWu+5Lmcxpd5vXRUZHesrbDj4+W5vb2BqoB/uHB/vXSTrMqluteEnLhRa1B3i6NjhZGXupeFooGFt3aHsXhmcIWen6H///9TY1Z1i3F6i35sgWiRmY5jiWmDnIpGV0dCXEFmhGSCnH52knpxknBui294vXx3k21tk26ypLNshWVsil2GvXFxmHNLWk1+k3mAo3qJpHp3uXCPqYJQbUZulX5ebVozSTFwgWuBtpJIa0iguJ5lh3VjfnhKXVd/r5KCqZBbcW5/l4QtQRsxRht2j2UsRSeVro0/WjQiOQ8nQBxdamtgdnZbY2dTVFdkbG1ncG9NVldbZl5rgXlffWVsi3w+R0pshXlmhoV1f357hYV6hIN+io5+g4dhiIRnj4RbjIhtio9ERVdJSU5mjZFlkY9ZaG1ZY3FegIo/TmI6PlRabYOdm6YvMDIwMzI9PkAzOUwsLS8iIif///9gmWK/AAAA9HRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AGOD3FwAAAAlwSFlzAAALEgAACxIB0t1+/AAADW9JREFUeJztnY1DE+cdx+vLtFaR3CV3QUMghrwtIUJLEl9AUwMGjjpnUnWmFRppCW1R01m32lUzLXaFdHNIYqZzVutL6hRbRd3EMdF1W1etQOusIC2tbVd1a8e2+wf2e4KaJxjBAokH3DcG7nfPk8vveT73e16Oe877WF4c03332gFe3cUj4Zx4JJwTj4Rz4pFwTjwSzmmYI7lvxMhRo0aOHDFiVEgjkUJbo0eO+A6kjxl7/7hbGjv2AXiNG3vDHD8hRj7F5rCDRAkTEwUESQgThSKKEtEigiRp+AXbhDhp4iSWnSyRSJKl8AO9QSmpXb9lsilTUsbHxqnhg0SeBj8UcvihVKlZVqWBre8mCbS0jtAS6ZSempqRkZnxYCb1kF5H6WlSnJTFsqkpUqnBYJQapCbptOnTZ8zMzsmeIZ01zWQyyqbMjo2jwwaJ+WHgwM6x5LJsXsJc1mxV5bNsVgEhYjLoTKKQpjIemfe9+YWF8x76/rxHqAUUTdiyWFYiMUjtdtMsk0EqfXThosXZ2T/IXrJoyXSjycQj6bccgOSxPIf1cXapfI61qNgCSJ6waUVOnY5eVlhCP0mnFy4TCZ9aVvjgvFKaorqQGEwml91uNJQZjQbp04slixYZnjE8O83ochlNPJJ+SuVg89MsqLmyli9fWrx0BWytFIjcFPXc/Hk/LFyVLly2Kkm86vlVz6/+EaGjnKQ2C5Bk243GWU//+NkXFq6Rvrho+pIXf/LiQuNLjxoBFI+kv7Ko2cfWrpgT2l7nWTrXCr9/Ki7V6fW69cSGZSIy/amXiQ0bbEkbXn6KKKEqRCEkBrvJVDbLBSqb9dKj2YtfeGnxQvuzyHbJNsbG0WGEBAWIx8M+Ll/3yuNL5/xsxasQJVqdU6+n6NL5ukxaVCisLNxQuGx+4cs6qspLISQyaLdCKlvjeu3nL7w2xbBkzS+eKTOWwS47HyUx0KYnSb1+/dTSyswM/XPr9VW6jPUP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"
                  >
                  <!-- eslint-enable max-len -->
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              align="center"
              height="100%"
            >
              <img
                v-show="(
                  value_occupancySetting.pageLayout=='LARGE' &&
                  value_occupancySetting.displayCardMode=='STANDARD' &&
                  value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/24.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='SMALL' &&
                  value_occupancySetting.displayCardMode=='COMPACT' &&
                  value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/18.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='SMALL' &&
                  value_occupancySetting.displayCardMode=='COMPACT' &&
                  !value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/27.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='SMALL' &&
                  value_occupancySetting.displayCardMode=='STANDARD' &&
                  value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/8.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='SMALL' &&
                  value_occupancySetting.displayCardMode=='STANDARD' &&
                  !value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/12.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='LARGE' &&
                  value_occupancySetting.displayCardMode=='COMPACT' &&
                  value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/48.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='LARGE' &&
                  value_occupancySetting.displayCardMode=='COMPACT' &&
                  !value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/60.png"
              >

              <img
                v-show="(
                  value_occupancySetting.pageLayout=='LARGE' &&
                  value_occupancySetting.displayCardMode=='STANDARD' &&
                  !value_occupancySetting.displayChart
                )
                "
                src="@/assets/img/30.png"
              >
            </td>
          </tr>
        </table>
      </CCol>

      <CCol
        sm="12"
        v-show="flag_currentSetp==2"
      >
        <div :class="showOnStep(2)">
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
          <div v-if="flag_currentSetp == 1">
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

// import VueScheduler from '@duoa/vue-scheduler';
// import '@/airacss/vue-scheduler.css';

import { backgroundImage, airalogo } from '@/utils/occupancyMode';

export default {
  name: 'OccupancyControlSettingForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,

      param_cardStyle: 'height: 35rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,

      value_EnableList: [
        { value: true, label: this.$t('Enable') },
        { value: false, label: this.$t('Disable') },
      ],

      value_summaryByList: [
        { value: 'GROUP', label: this.$t('Group') },
        { value: 'JOBTITLE', label: this.$t('JobTitle') },
        { value: 'DEPARTMENT', label: this.$t('Department') },
      ],

      value_displayModeList: [
        { value: 'STANDARD', label: this.$t('Standard') },
        { value: 'COMPACT', label: this.$t('Compact') },
      ],

      value_displayPhotoList: [
        { value: 'NONE', label: this.$t('None') },
        { value: 'REGISTER', label: this.$t('RegisterPhoto') },
        // { value: 'SNAPSHOT', label: this.$t('CapturedPhoto') },
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

      value_pageLayoutList: [
        { value: 'LARGE', label: this.$t('LARGE') },
        { value: 'SMALL', label: this.$t('SMALL') },
      ],

      value_displayGroupList: [],

      value_Setting: {},
      value_occupancySetting: {
        displayMode: 'OCCUPANCY',
        uuid: '',
        background_image: backgroundImage,
        logo: airalogo,

        displayGroup: ['All Person'],
        displayCardMode: 'STANDARD', // STANDARD, COMPACT
        displayPhoto: 'REGISTER', // NONE, REGISTER, SNAPSHOT, DISPLAY
        line1: 'NAME', // NONE, NAME, PARTIALNAME
        line2: 'NONE', // NONE, JOBTITLE, GROUP, DEPARTMENT, TEMPERATURE

        pageLayout: 'LARGE', // LARGE, SMALL
        displayChart: true,
        dailyResetTime: '00:00',
        personPatrolTime: 10,

        enableSummaryView: true,
        summaryBy: 'GROUP', // GROUP JOBTITLE, DEPARTMENT
        summaryPatrolTime: 10,
        patrolidleTime: 60,
      },

      value_displayResetTime: [
        '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
        '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '20', '21', '22', '23',
      ],

      flag_backgrounduploading: false,
      flag_logouploading: false,
      flag_isPickingRegisterPhoto: false,

      value_returnRoutePath: '',
      value_group_list: [],

      flag_currentSetp: 0, //

      ...this.formData,
    };
  },
  created() { },
  async mounted() {
    const self = this;
    self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

    self.$globalGetGroupList((err, data) => {
      if (!err) {
        self.value_displayGroupList = [];
        data.forEach((element) => {
          self.value_displayGroupList.push(element.name);
        });
      }
    });

    self.$globalGetDisplaySetting((err, data) => {
      if (!err) {
        self.value_Setting = data || {};

        self.occupancy = self.value_Setting.OCCUPANCY;
        self.value_occupancySetting.uuid = self.makeid(32);

        // self.value_occupancySetting = Object.assign({}, self.value_occupancySetting, self.occupancy);
        self.value_occupancySetting = { ...self.value_occupancySetting, ...self.occupancy };
      }

      if (self.obj_loading) self.obj_loading.hide();
    });
  },
  updated() { },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  watch: {},
  methods: {
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
      const self = this;

      const file = this.$refs.uploadBackgroundFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        self.value_occupancySetting.background_image = myReader.result;
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles() {
      const self = this;

      const file = this.$refs.uploadLogoFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        self.value_occupancySetting.logo = myReader.result;
      };
      myReader.readAsDataURL(file);
    },

    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('SaveChanges');
        default:
          return this.$t('Complete');
      }
    },
    clickOnPrev() {
      const self = this;
      if (self.flag_currentSetp === 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
        }
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp -= 1;
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp === 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        if (self.onFinish) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

          const sendData = {
            displayMode: 'OCCUPANCY',
            uuid: self.value_occupancySetting.uuid,
            background_image: self.value_occupancySetting.background_image,
            logo: self.value_occupancySetting.logo,

            displayGroup: self.value_occupancySetting.displayGroup,
            displayCardMode: self.value_occupancySetting.displayCardMode,
            displayPhoto: self.value_occupancySetting.displayPhoto,
            line1: self.value_occupancySetting.line1,
            line2: self.value_occupancySetting.line2,

            pageLayout: self.value_occupancySetting.pageLayout,
            displayChart: self.value_occupancySetting.displayChart,
            dailyResetTime: self.value_occupancySetting.dailyResetTime,
            personPatrolTime: self.value_occupancySetting.personPatrolTime,

            enableSummaryView: self.value_occupancySetting.enableSummaryView,
            summaryBy: self.value_occupancySetting.summaryBy,
            summaryPatrolTime: self.value_occupancySetting.summaryPatrolTime,
            patrolidleTime: self.value_occupancySetting.patrolidleTime,
          };

          self.value_Setting.OCCUPANCY = sendData;

          self.onFinish(self.value_Setting, (success) => {
            if (self.obj_loading) self.obj_loading.hide();
            if (success) {
              self.flag_currentSetp = 2;
            } else {
              // self.$alert( self.disp_registerFailed + ' : ' + ( result && result.message ? result.message : 'network loss') );
              self.$fire({
                text: this.$t('Failed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          });
        } else self.flag_currentSetp = 0;
      } else {
        // self.$router.push({ name: self.value_returnRoutePath })
        self.flag_currentSetp = 0;
      }
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step === this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
    // scheduler: VueScheduler,
  },
};
</script>
