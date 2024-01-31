<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">
          {{ $t('GuardBoard') }}
        </div>
        <stepprogress
          class="w-step-progress-3"
          :active-thickness="param_activeThickness"
          :passive-thickness="param_passiveThickness"
          :active-color="param_activeColor"
          :passive-color="param_passiveColor"
          :steps="[
            $t('CompanyInfo'),
            $t('PersonnelInfo'),
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
        v-show="flag_currentSetp ===0 || flag_currentSetp ===1"
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
                    >
                  </label>
                </CCol>
                <CCol sm="9">
                  <img
                    id="backgroundImage"
                    :src="value_guardSetting.background_image"
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
                    :src="value_guardSetting.logo"
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
            <CCardBody>
              <CRow>
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('ClockInChannel') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.deviceIn"
                    :options="deviceInList"
                  />
                </CCol>
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('ClockOutChannel') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.deviceOut"
                    :options="deviceOutList"
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
                    v-model="value_guardSetting.displayGroup"
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
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('DisplayPhoto') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.displayPhoto"
                    :options="value_displayPhotoList"
                  />
                </CCol>
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 1
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.line1"
                    :options="value_displayPrimaryList"
                  />
                </CCol>
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('DisplayAttribute') }} 2
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.line2"
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
                <CCol sm="4">
                  <div class="h5">
                    {{ $t('ResetTime') }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_guardSetting.dailyResetTime"
                    :options="value_displayResetTime"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
      <CCol
        sm="6"
        v-show="(flag_currentSetp === 0 || flag_currentSetp === 1) && false"
      >
        <table
          width="590"
          height="332"
          :style="`background-image: url('${value_guardSetting.background_image}')`"
          style="background-size: 100% 100%; background-repeat: no-repeat; background-position: center;"
        >
          <tr>
            <td
              colspan="2"
              height="26"
              style="background: #1E1E1E"
            >
              <img
                :src="`${value_guardSetting.logo}`"
                style="width: 32px; height: 26px; padding-left: 8px; object-fit: contain;"
              >
              <span style="float: right; padding-right: 15px; color: #FFFFFF;">12:32</span>
              <span style="float: right; padding-right: 15px; color: #FFFFFF;">06/13/2023</span>
            </td>
          </tr>
          <tr>
            <td
              width="470"
              height="100"
            >
              <!-- eslint-disable max-len -->
              <img
                style="width: 100%; height: 100%; object-fit: contain;"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZIAAABUCAMAAACfmkHVAAAC3FBMVEVad2JeeF1ZeldXfVVRdk9bcF1LUmJMVWVKY2dLWmtQV2lTW2tDTl5UWlqKpIyMqY+Iso6HsYKCsYOOsIKBsXyAuHqHtoKJrYyVs5BWa1RrdXtsfo1lgIxrfpRweo5thYdre5R0gJdjZGZcXmNtcnJyd3iXmJqEhYeRkpQ8T0CItot4sXmQt42AvX12sG+HvYF4qXOUyI6PxYlLZU9keI9jepdqf5xddYp5kKFxf5JjdYR1hZlfb39vhaBTYW+Jiozo6evZ2tx9f4FCREajpKbFxcdaW12oqauEpIyAt4S347Kj256/77rJ/MOt3KfC9bx/sm+OsI5mf5t+k6u4zua+0eeXq8Tc7v+gtMxrbG64ubvKy81NTlA0NTc5Ojw+VkN6uXmXwJKNuYR2pHPE67+OvYlifpxxi6iPpcHK4fy/1/GNjpC0tbfT1NZGYkR6t4GLyIPi/96x1a223LF1mm7H8cOtxOOovtlTbImDmrOxxd3Q5/++v8GvsLJ3eHo+VTlwqWu+5Lmcxpd5vXRUZHesrbDj4+W5vb2BqoB/uHB/vXSTrMqluteEnLhRa1B3i6NjhZGXupeFooGFt3aHsXhmcIWen6H///9TY1Z1i3F6i35sgWiRmY5jiWmDnIpGV0dCXEFmhGSCnH52knpxknBui294vXx3k21tk26ypLNshWVsil2GvXFxmHNLWk1+k3mAo3qJpHp3uXCPqYJQbUZulX5ebVozSTFwgWuBtpJIa0iguJ5lh3VjfnhKXVd/r5KCqZBbcW5/l4QtQRsxRht2j2UsRSeVro0/WjQiOQ8nQBxdamtgdnZbY2dTVFdkbG1ncG9NVldbZl5rgXlffWVsi3w+R0pshXlmhoV1f357hYV6hIN+io5+g4dhiIRnj4RbjIhtio9ERVdJSU5mjZFlkY9ZaG1ZY3FegIo/TmI6PlRabYOdm6YvMDIwMzI9PkAzOUwsLS8iIif///9gmWK/AAAA9HRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AGOD3FwAAAAlwSFlzAAALEgAACxIB0t1+/AAADW9JREFUeJztnY1DE+cdx+vLtFaR3CV3QUMghrwtIUJLEl9AUwMGjjpnUnWmFRppCW1R01m32lUzLXaFdHNIYqZzVutL6hRbRd3EMdF1W1etQOusIC2tbVd1a8e2+wf2e4KaJxjBAokH3DcG7nfPk8vveT73e16Oe877WF4c03332gFe3cUj4Zx4JJwTj4Rz4pFwTjwSzmmYI7lvxMhRo0aOHDFiVEgjkUJbo0eO+A6kjxl7/7hbGjv2AXiNG3vDHD8hRj7F5rCDRAkTEwUESQgThSKKEtEigiRp+AXbhDhp4iSWnSyRSJKl8AO9QSmpXb9lsilTUsbHxqnhg0SeBj8UcvihVKlZVqWBre8mCbS0jtAS6ZSempqRkZnxYCb1kF5H6WlSnJTFsqkpUqnBYJQapCbptOnTZ8zMzsmeIZ01zWQyyqbMjo2jwwaJ+WHgwM6x5LJsXsJc1mxV5bNsVgEhYjLoTKKQpjIemfe9+YWF8x76/rxHqAUUTdiyWFYiMUjtdtMsk0EqfXThosXZ2T/IXrJoyXSjycQj6bccgOSxPIf1cXapfI61qNgCSJ6waUVOnY5eVlhCP0mnFy4TCZ9aVvjgvFKaorqQGEwml91uNJQZjQbp04slixYZnjE8O83ochlNPJJ+SuVg89MsqLmyli9fWrx0BWytFIjcFPXc/Hk/LFyVLly2Kkm86vlVz6/+EaGjnKQ2C5Bk243GWU//+NkXFq6Rvrho+pIXf/LiQuNLjxoBFI+kv7Ko2cfWrpgT2l7nWTrXCr9/Ki7V6fW69cSGZSIy/amXiQ0bbEkbXn6KKKEqRCEkBrvJVDbLBSqb9dKj2YtfeGnxQvuzyHbJNsbG0WGEBAWIx8M+Ll/3yuNL5/xsxasQJVqdU6+n6NL5ukxaVCisLNxQuGx+4cs6qspLISQyaLdCKlvjeu3nL7w2xbBkzS+eKTOWwS47HyUx0KYnSb1+/dTSyswM/XPr9VW6jPUP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"
              >
              <!-- eslint-enable max-len -->
            </td>
            <td
              rowspan="2"
              width="120"
              height="100%"
              style="background: #2C2C2C"
            />
          </tr>
          <tr>
            <td
              width="470"
              height="200"
            >
              <img
                style="width: 100%; height: 100%; object-fit: contain;"
                src="@/assets/img/30c.png"
              >
            </td>
            <td />
          </tr>
        </table>
      </CCol>

      <CCol
        sm="12"
        v-show="flag_currentSetp === 2"
      >
        <div :class="showOnStep(2)">
          <CCard style="height: 34rem;">
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

import { backgroundImage, airalogo } from '@/utils/capacityMode';

export default {
  name: 'GuardControlSettingForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,

      param_activeColor: '#6baee3', //
      param_passiveColor: '#919bae', //
      param_lineThickness: 3, //
      param_activeThickness: 3, //
      param_passiveThickness: 3, //

      value_displayPhotoList: [
        { value: 'NONE', label: this.$t('None') },
        { value: 'REGISTER', label: this.$t('RegisterPhoto') },
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

      // param_videoDeviceGroupIn: [],
      // param_videoDeviceGroupOut: [],
      value_displayGroupList: [],
      value_deviceList: [],

      value_Setting: {},

      value_guardSetting: {
        displayMode: 'GUARD',
        uuid: '',
        background_image: backgroundImage,
        logo: airalogo,

        displayGroup: ['All Person'],
        displayPhoto: 'REGISTER', // NONE, REGISTER, SNAPSHOT, DISPLAY
        line1: 'NAME', // NONE, NAME, PARTIALNAME
        line2: 'NONE', // NONE, JOBTITLE, GROUP, DEPARTMENT, TEMPERATURE

        dailyResetTime: '00:00',

        deviceIn: '',
        deviceOut: '',
      },

      value_displayResetTime: [
        '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
        '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '20', '21', '22', '23',
      ],

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

        this.value_guardSetting = { ...this.value_guardSetting, ...this.value_Setting.GUARD };
        this.value_guardSetting.uuid = this.makeid(32);
      }

      if (this.obj_loading) this.obj_loading.hide();
    });

    const cam = await this.$globalFindCameras('', 0, 3000);
    if (!cam.error) {
      cam.data.list.forEach((element) => {
        this.value_deviceList.push({
          label: element.name,
          value: element.uuid,
        });
      });
    }

    const tab = await this.$globalGetTabletList('', 0, 3000);
    if (!tab.error) {
      tab.data.data_list.forEach((element) => {
        this.value_deviceList.push({
          label: element.name,
          value: element.uuid,
        });
      });
    }

    // console.log(this.value_deviceList);

    if (this.value_guardSetting.deviceIn == '' && this.value_deviceList[0]) {
      this.value_guardSetting.deviceIn = this.value_deviceList[0].value;
    }

    if (this.value_guardSetting.deviceOut == '' && this.value_deviceList[1]) {
      this.value_guardSetting.deviceOut = this.value_deviceList[1].value;
    }
  },
  updated() { },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  computed: {
    deviceInList() {
      return this.value_deviceList.filter((element) => element.value !== this.value_guardSetting.deviceOut);
    },
    deviceOutList() {
      return this.value_deviceList.filter((element) => element.value !== this.value_guardSetting.deviceIn);
    },
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
      const file = this.$refs.uploadBackgroundFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        this.value_guardSetting.background_image = myReader.result;
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles() {
      const file = this.$refs.uploadLogoFile.files[0];
      if (file == null) return;

      const myReader = new FileReader();
      myReader.onloadend = async () => {
        this.value_guardSetting.logo = myReader.result;
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
      if (this.flag_currentSetp == 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        }
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    clickOnNext() {
      if (this.flag_currentSetp == 0) {
        this.flag_currentSetp = 1;
      } else if (this.flag_currentSetp == 1) {
        if (this.onFinish) {
          this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

          const sendData = {
            displayMode: 'GUARD',
            uuid: this.value_guardSetting.uuid,
            background_image: this.value_guardSetting.background_image,
            logo: this.value_guardSetting.logo,

            displayGroup: this.value_guardSetting.displayGroup,
            displayPhoto: this.value_guardSetting.displayPhoto,
            line1: this.value_guardSetting.line1,
            line2: this.value_guardSetting.line2,

            dailyResetTime: this.value_guardSetting.dailyResetTime,
            deviceIn: this.value_guardSetting.deviceIn,
            deviceOut: this.value_guardSetting.deviceOut,
          };

          this.value_Setting.GUARD = sendData;

          this.onFinish(this.value_Setting, (success) => {
            if (this.obj_loading) this.obj_loading.hide();
            if (success) {
              this.flag_currentSetp = 2;
            } else {
              // this.$alert( this.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
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
      return step == this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step == this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
  },
};
</script>
