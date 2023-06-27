<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ disp_header }}
      </div>
      <div style="height: 30px"></div>
      <!-- 辨識設定 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_faceVerifySettings }}</span>
          </div>
        </CCardHeader>

        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">{{ disp_verifyThreshold }}</th>
              <th class="h5 w-25 table-th">{{ disp_antiSpoofingThreshold }}</th>
              <th class="h5 w-25 table-th">{{ disp_faceDetectThreshold }}</th>
              <th class="h5 w-25 table-th"></th>
              <!-- <th class="h5 w-25 table-th">
                <div v-if="flag_support_enhance_facemask">
                  {{ disp_faceMaskEnhancement }}
                </div>
              </th> -->
            </tr>
            <tr>
              <td class="table-td">
                <CInput size="lg" v-model="value_verifyThreshold" :value="value_verifyThreshold"
                  :is-valid="isValidThreshhole" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_antiSpoofingThreshold" :value="value_antiSpoofingThreshold"
                  :is-valid="isValidThreshhole" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_faceDetectThreshold" :is-valid="isValidThreshhole" />
              </td>
              <td class="table-td"></td>
              <!-- <td class="table-td">
                <div v-if="flag_support_enhance_facemask">
                  <CSelect
                    size="lg"
                    :value.sync="value_faceMaskEnhancement"
                    :options="value_enableDisableListToShow"
                    @change="selFaceMaskEnhancement($event)"
                  />
                </div>
              </td> -->
            </tr>
            <tr>
              <th class="h5 w-25 table-th">{{ disp_faceMaskDetection }}</th>
              <th class="h5 w-25 table-th">{{ disp_enableIdCard }}</th>
              <th class="h5 w-25 table-th">{{ disp_enableTwoFactorAuthentication }}</th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_haveToWearFaceMask" :options="value_enableDisableListToShow"
                  @change="selFaceMaskDetection($event)" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_enableIdCard" :options="value_enableDisableListToShow"
                  @change="selEnableIdCard($event)" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_enableTwoFactorAuthentication"
                  :options="value_enableDisableListToShow" @change="selEnableTwoFactorAuthentication($event)" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary mb-16 fz-xl" @click="clickOnApplyVerifySettings"
                  :disabled="flag_changingVerifySettings || !flag_verifySettingsOk">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 平板顯示設定 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_tabletDisplaySettings }}</span>
          </div>
        </CCardHeader>

        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_verifyResultPhoto }}</th>

              <th class="h5 w-25 table-th">
                <div class="h5" data-coreui-toggle="tooltip">
                  {{ disp_displayVerifyResultTime }}
                </div>
              </th>
              <th class="h5 w-25 table-th">{{ disp_temperatureDisplayingUnit }}</th>
              <th class="h5 w-25 table-th">
                <div v-if="flag_support_show_verify_indication">
                  {{ disp_showVerifyIndication }}
                </div>
              </th>
            </tr>

            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_showProfilePhoto" :options="value_verifyResultPhotoList"
                  @change="selVerifyDisplayPhoto($event)" />
              </td>

              <td class="table-td">
                <CInput size="lg" v-model="value_displayVerifyResultTime" :is-valid="isDisplayVerifyResultTimeNumber" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_temperatureUnitCelsius"
                  :options="value_temperatureDisplayingUnitList" @change="selShowTemperatureUnit($event)" />
              </td>
              <td v-if="flag_support_show_verify_indication" class="table-td">
                <CSelect size="lg" :value.sync="value_showVerifyIndication" :options="value_showVerifyIndicationList"
                  @change="selShowVerifyIndication($event)" />
              </td>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CButton class="btn btn-primary w-100 fz-xl" @click="clickOnApplyDisplaySettings"
                  :disabled="flag_changingDisplaySettings || !flag_displaySettingsOk">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 成為網路攝影機 -->
      <CCard v-if="flag_support_rtsp">
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_turnsIpCamera }}</span>
            <span class="h6 ml-2">
              <span v-if="value_rtspActivated" class="text-truncate text-black-50">
                Live streaming :
              </span>
              <span v-if="value_rtspActivated" class="text-info">
                {{ value_rtspPath }}
              </span>
            </span>
          </div>
        </CCardHeader>
        <CCardBody>
          <div style="height: 15px"></div>
          <CCol sm="12">
            <CCol sm="12">
              <CRow>
                <CSwitch size="lg" color="success" shape="pill" :checked="value_enableRtsp"
                  @update:checked="value_enableRtsp = !value_enableRtsp" />
                <div>
                  <span class="h4 ml-2">
                    <span v-if="value_enableRtsp">{{ disp_enable }}</span>
                    <span v-else>{{ disp_disable }}</span>
                  </span>
                </div>
              </CRow>
            </CCol>
          </CCol>

          <table class="table-layout mt-4">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_username }}</th>
              <th class="h5 w-25 table-th">{{ disp_password }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_rtspUsername" :value="value_rtspUsername"
                  :disabled="!value_enableRtsp" />
              </td>
              <td class="table-td">
                <CInput size="lg" type="password" v-model="value_rtspPassword" :value="value_rtspPassword"
                  :disabled="!value_enableRtsp" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyRtsp" :disabled="flag_changingRtsp">
                  <div style="font-size: 20px">{{ disp_apply }}</div>
                </CButton>
              </td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 打卡鐘模式 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_clockinMode }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableClockinMode"
                @update:checked="value_enableClockinMode = !value_enableClockinMode" />
              <div>
                <span class="h4 ml-2 p-0">
                  <span v-if="value_enableClockinMode">{{ disp_enable }}</span>
                  <span v-else>{{ disp_disable }}</span>
                </span>
              </div>
              <CButton class="btn btn-primary ml-5 btn-w-normal" @click="clickOnApplyClockInMode">
                <div style="font-size: 20px">{{ disp_apply }}</div>
              </CButton>
            </div>
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 門禁對講機 -->
      <CCard v-if="flag_support_intercom && deviceType !== deviceTypes.TYPE_AIRA_TABLET_M">
        <CCardHeader>
          <div>
            <span class="h3" style="display: inline-block; position: relative; margin-right: 33px">{{
              disp_intercomSettings }}</span>
            <span class="h6" style="display: inline-block; margin: 0; position: relative; bottom: 4px">
              <span style="background-color: white; color: gray">
                Intercom client :
              </span>
              <a :href="value_videoPath" download>{{ disp_download }}</a>
            </span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <!-- <div class="h5">{{ disp_enableIntercom }}</div> -->
              <CSwitch size="lg" class="ml-0" color="success" shape="pill"
                @update:checked="value_enableIntercom = !value_enableIntercom" :checked="value_enableIntercom">
              </CSwitch>
              <div>
                <span class="h4 ml-2">
                  <span v-if="value_enableIntercom">{{ disp_enableIntercom }}</span>
                  <span v-else>{{ disp_disableIntercom }}</span>
                </span>
              </div>
              <CButton @click="clickOnApplyIntercom" class="btn btn-primary ml-5 btn-w-normal"
                :disabled="flag_changingIntercomSettings">
                <div style="font-size: 20px">{{ disp_apply }}</div>
              </CButton>
            </div>
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 自定義功能按鈕 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_customButton }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableCustomButton"
                @update:checked="value_enableCustomButton = !value_enableCustomButton" />
              <div>
                <span class="h4 ml-2">
                  <span v-if="value_enableCustomButton">{{ disp_enable }}</span>
                  <span v-else>{{ disp_disable }}</span>
                </span>
              </div>
              <CButton class="btn btn-primary ml-5 btn-w-normal" @click="clickOnApplyCustomButton">
                <div style="font-size: 20px">{{ disp_apply }}</div>
              </CButton>
            </div>
          </CCol>
          <div style="height: 30px"></div>
          <CCol sm="12">
            <div class="h5">{{ disp_url }}</div>
            <CInput size="lg" v-model="value_customFunctionUrl" :value="value_customFunctionUrl"
              :disabled="!value_enableCustomButton" />
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 警示設定 -->
      <CCard v-if="flag_support_high_temp_sound_alert">
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_alarmSettings }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_alarmVolume }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_highTemperatureThreshold }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_alarmVolume" :options="value_alarmVolumeList"
                  @change="selAlarmVolume($event)" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_highTemperatureThreshold" :value="value_highTemperatureThreshold"
                  :is-valid="isValidTempterature" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyAlarmSettings"
                  :disabled="flag_changingAlarmSettings || !flag_verifyAlarmSettingsOk">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 平板介面語言 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_tabletInterfaceLangurage }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_tabletInterfaceLangurageList }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_tabletInterfaceLangurage"
                  :options="value_tabletInterfaceLangurageList" @change="selInterfaceLangurage($event)" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyTabletInterfaceLangurage"
                  :disabled="flag_changingTabletInterfaceLangurage">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 中央管理 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_centralManagement }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center mt-3 mb-5">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableAiraManager"
                @update:checked="value_enableAiraManager = !value_enableAiraManager" />
              <div>
                <span class="h4 ml-2 p-0">
                  <span v-if="value_enableAiraManager">{{ disp_enable }}</span>
                  <span v-else>{{ disp_disable }}</span>
                </span>
              </div>
            </div>
          </CCol>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_hostname }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_airaManagerHostName" :value="value_airaManagerHostName"
                  :disabled="!value_enableAiraManager" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyAiraManager">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 系統管理密碼 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_tabletSystemPassword }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_tabletSystemPassword }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_tabletSystemPassword" :value="value_tabletSystemPassword" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-lg" @click="clickOnApplyTabletSystemPassword"
                  :disabled="flag_changingTabletSystemPassword">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
  import i18n from "../../i18n";
  import { mapState } from "vuex";
  import { deviceTypes } from "../../globalParams.js";

  export default {
    name: "GeneralSettings",

    data() {
      return {
        param_cardStyle: "height: 26rem;",
        disp_header: i18n.formatter.format("GeneralSettings"),
        disp_enable: i18n.formatter.format("Enable"),
        disp_disable: i18n.formatter.format("Disable"),
        disp_username: i18n.formatter.format("Username"),
        disp_password: i18n.formatter.format("Password"),
        disp_turnsIpCamera: i18n.formatter.format("TurnsIpCamera"),
        disp_apply: i18n.formatter.format("Apply"),
        disp_clockinMode: i18n.formatter.format("ClockinMode"),
        disp_customButton: i18n.formatter.format("CustomButton"),
        disp_clockIn: i18n.formatter.format("ClockIn"),
        disp_clockOut: i18n.formatter.format("ClockOut"),
        disp_enableIntercom: i18n.formatter.format("EnableIntercom"),
        disp_disableIntercom: i18n.formatter.format("DisableIntercom"),
        disp_intercomSettings: i18n.formatter.format("Intercom"),
        disp_download: i18n.formatter.format("Download"),
        disp_faceVerifySettings: i18n.formatter.format("FaceVerifySettings"),
        disp_verifyResultPhoto: i18n.formatter.format("VerifyResultPhoto"),
        disp_tabletDisplaySettings: i18n.formatter.format("TabletDisplaySettings"),
        disp_verifyThreshold: i18n.formatter.format("VerifyThreshold"),
        disp_antiSpoofingThreshold: i18n.formatter.format("AntiSpoofingThreshold"),
        disp_faceDetectThreshold: i18n.formatter.format("FaceDetectThreshold"),
        disp_faceMaskDetection: i18n.formatter.format("FaceMaskDetection"),
        disp_showVerifyIndication: i18n.formatter.format("ShowVerifyIndication"),
        disp_temperatureDisplayingUnit: i18n.formatter.format("TemperatureDisplayingUnit"),
        disp_alarmVolume: i18n.formatter.format("AlarmVolume"),
        disp_enableIdCard: i18n.formatter.format("EnableIdCard"),
        disp_enableTwoFactorAuthentication: i18n.formatter.format(
          "EnableTwoFactorAuthentication"
        ),
        disp_highTemperatureThreshold:
          i18n.formatter.format("HighTemperatureThreshold") +
          " " +
          i18n.formatter.format("Celsius"),

        disp_tabletInterfaceLangurage: i18n.formatter.format("TabletInterfaceLangurage"),
        disp_tabletInterfaceLangurageList: i18n.formatter.format(
          "TabletInterfaceLangurageList"
        ),
        disp_alarmSettings: i18n.formatter.format("AlarmSettings"),
        disp_tabletSystemPassword: i18n.formatter.format("TabletSystemPassword"),
        disp_centralManagement: i18n.formatter.format("CentralManagement"),
        disp_willLossAllPersonData: i18n.formatter.format("WillLossAllPersonData"),
        disp_faceMaskEnhancement: i18n.formatter.format("FaceMaskEnhancement"),

        disp_hostname: i18n.formatter.format("HostName"),
        disp_url: "URL",
        value_airaManagerHostName: "",
        value_airaManagerPort: 8443,
        value_enableAiraManager: false,
        value_customFunctionUrl: "",

        value_enableDisableListToShow: [
          { value: true, label: i18n.formatter.format("Yes") },
          { value: false, label: i18n.formatter.format("No") },
        ],
        value_haveToWearFaceMask: false,
        value_faceMaskEnhancement: false,
        value_enableIdCard: false,
        value_enableTwoFactorAuthentication: false,
        value_verifyResultPhotoList: [
          { value: true, label: i18n.formatter.format("RegisterPhoto") },
          { value: false, label: i18n.formatter.format("CapturedPhoto") },
        ],
        value_showVerifyIndication: false,
        value_showVerifyIndicationList: [
          { value: true, label: i18n.formatter.format("Yes") },
          { value: false, label: i18n.formatter.format("No") },
        ],
        value_showProfilePhoto: false,
        value_temperatureDisplayingUnitList: [
          { value: true, label: i18n.formatter.format("Celsius") },
          { value: false, label: i18n.formatter.format("Fahrenheit") },
        ],
        value_temperatureUnitCelsius: true,
        value_highTemperatureThreshold: 37.5,
        value_highTemperatureThreshold_Celsius: 37.5,
        value_highTemperatureThreshold_Fahrenheit: 99.5,
        value_alarmVolumeList: [
          { value: 1.0, label: "100 %" },
          { value: 0.9, label: "90 %" },
          { value: 0.8, label: "80 %" },
          { value: 0.7, label: "70 %" },
          { value: 0.6, label: "60 %" },
          { value: 0.5, label: "50 %" },
          { value: 0.4, label: "40 %" },
          { value: 0.3, label: "30 %" },
          { value: 0.2, label: "20 %" },
          { value: 0.1, label: "10 %" },
          { value: 0.0, label: "Off" },
        ],
        value_alarmVolume: 0.1,
        value_displayVerifyResultTime: 3000,
        flag_changingTabletInterfaceLangurage: false,
        value_tabletInterfaceLangurage: "zh",
        value_tabletInterfaceLangurageList: [],
        value_tabletSystemPassword: "123456",
        disp_displayVerifyResultTime: i18n.formatter.format("VerifyResultDisplayDuration"),
        flag_changingRtsp: false,
        flag_changingClockInMode: false,
        flag_changingDisplaySettings: false,
        flag_changingVerifySettings: false,
        flag_changingAlarmSettings: false,
        flag_verifySettingsOk: true,
        flag_verifyAlarmSettingsOk: true,
        flag_displaySettingsOk: true,
        value_enableRtsp: false,
        value_rtspActivated: false,
        value_rtspUsername: "",
        value_rtspPassword: "",
        value_tabletSettings: null,
        value_enableClockinMode: false,
        value_enableCustomButton: false,
        value_clockIn: false,
        value_clockOut: false,
        value_verifyThreshold: 0.9,
        value_antiSpoofingThreshold: 0.5,
        value_faceDetectThreshold: 0.6,
        value_enableIntercom: false,
        flag_changingIntercomSettings: false,
        flag_changingCustomButton: false,
        value_videoPath: "",
        flag_downloadingFile: false,
        value_rtspPath: "",
        flag_changingTabletSystemPassword: false,

        flag_support_enhance_facemask: false,
        flag_support_rtsp: false,
        flag_support_intercom: false,
        flag_support_high_temp_sound_alert: false,
        flag_support_show_verify_indication: false,
        flag_support_invalid_result_show_switch: false,
        deviceTypes: {},
      };
    },
    created() {
      const self = this;
      //const HOST = window.location.host;
      //self.value_rtspPath = 'https://' + HOST + '/exe/intercom.zip';
      self.value_videoPath =
        "https://www.aira.com.tw/app/application/airaIntercom_setup_20211217.zip";
      self.value_rtspPath =
        "rtsp://[username]:[password]@" + window.location.hostname + ":8554/live.sdp";

      self.$globalGetSystemInfo(function (err, data) {
        if (data != null) {
          if (data.device_type == "airaTablet_xs") {
            self.flag_support_enhance_facemask = true;
            self.flag_support_rtsp = false;
            self.flag_support_intercom = false;
            self.flag_support_high_temp_sound_alert = false;
            self.flag_support_invalid_result_show_switch = true;
            self.flag_support_show_verify_indication = false;
          } else {
            self.flag_support_enhance_facemask = true;
            self.flag_support_rtsp = true;
            self.flag_support_intercom = true;
            self.flag_support_high_temp_sound_alert = true;
            self.flag_support_invalid_result_show_switch = false;
            self.flag_support_show_verify_indication = true;
          }
        }
      });

      self.$globalGetAiraManagerSetting(function (err, data) {
        if (!err) {
          self.$globalAiraManagerSettings = Object.assign({}, data);
          self.value_airaManagerHostName = data.manager_host;
          self.value_airaManagerPort = data.manager_port;
          self.value_enableAiraManager = data.manager_enable;
        }
      });

      self.$globalGetTabletSetting(function (err, data) {
        if (!err) {
          self.value_tabletSettings = data;
          self.value_rtspUsername = self.checkAndReturnValue(
            self.value_tabletSettings.rtsp_username,
            ""
          );
          self.value_rtspPassword = self.checkAndReturnValue(
            self.value_tabletSettings.rtsp_password,
            ""
          );
          self.value_enableRtsp = self.checkAndReturnValue(
            self.value_tabletSettings.enable_rtsp_camera,
            false
          );
          self.value_rtspActivated = self.checkAndReturnValue(
            self.value_tabletSettings.enable_rtsp_camera,
            false
          );
          self.value_enableClockinMode = self.checkAndReturnValue(
            self.value_tabletSettings.enable_clock_mode,
            false
          );
          self.value_haveToWearFaceMask = self.checkAndReturnValue(
            self.value_tabletSettings.have_to_wear_face_mask,
            false
          );
          self.value_faceMaskEnhancement = self.checkAndReturnValue(
            self.value_tabletSettings.face_mask_enhancement,
            false
          );
          self.value_showProfilePhoto = self.checkAndReturnValue(
            self.value_tabletSettings.show_profile_photo,
            false
          );
          self.value_showVerifyIndication = self.checkAndReturnValue(
            self.value_tabletSettings.show_verify_indication,
            false
          );
          self.value_displayVerifyResultTime = self.checkAndReturnValue(
            self.value_tabletSettings.display_verify_result_time,
            false
          );
          self.value_temperatureUnitCelsius = self.checkAndReturnValue(
            self.value_tabletSettings.temperature_unit_celsius,
            false
          );
          self.value_enableIdCard = self.checkAndReturnValue(
            self.value_tabletSettings.enable_id_card,
            false
          );
          self.value_enableTwoFactorAuthentication = self.checkAndReturnValue(
            self.value_tabletSettings.enable_two_factor_authentication,
            false
          );

          self.value_alarmVolume = self.checkAndReturnValue(
            self.value_tabletSettings.audio_alarm_volume,
            0
          );
          self.value_highTemperatureThreshold_Celsius = self.checkAndReturnValue(
            self.value_tabletSettings.high_temperature,
            38
          );
          self.value_highTemperatureThreshold_Fahrenheit =
            (self.value_highTemperatureThreshold_Celsius * 9) / 5 + 32;
          self.value_highTemperatureThreshold =
            self.value_temperatureUnitCelsius === true
              ? self.value_highTemperatureThreshold_Celsius
              : self.value_highTemperatureThreshold_Fahrenheit;
          self.disp_highTemperatureThreshold =
            i18n.formatter.format("HighTemperatureThreshold") +
            " " +
            (self.value_temperatureUnitCelsius === true
              ? i18n.formatter.format("Celsius")
              : i18n.formatter.format("Fahrenheit"));

          self.value_verifyThreshold = self.checkAndReturnValue(
            self.value_tabletSettings.score_for_valid_face,
            0.9
          );
          self.value_antiSpoofingThreshold = self.checkAndReturnValue(
            self.value_tabletSettings.anti_spoofing_score,
            0
          );
          self.value_faceDetectThreshold = self.checkAndReturnValue(
            self.value_tabletSettings.face_detection_threshold,
            0.5
          );
          //intercom
          self.value_enableIntercom = self.checkAndReturnValue(
            self.value_tabletSettings.enable_intercom,
            false
          );

          // custom button
          if (self.value_tabletSettings.custom_trigger_button_settings != null) {
            self.value_enableCustomButton = self.checkAndReturnValue(
              self.value_tabletSettings.custom_trigger_button_settings.enable,
              false
            );
            self.value_customFunctionUrl = self.checkAndReturnValue(
              self.value_tabletSettings.custom_trigger_button_settings.url,
              ""
            );
          }
        }
      });
      self.$globalFetchSupportedlanguagelist(function (err, data) {
        if (!err) {
          self.value_tabletInterfaceLangurageList = [];
          data.list.forEach((lang) => {
            self.value_tabletInterfaceLangurageList.push({
              value: lang.language,
              label: lang.display_name,
            });
          });
          const activeLang = data.list.filter((l) => {
            return l.active;
          });
          if (activeLang.length > 0) {
            self.value_tabletInterfaceLangurage = activeLang[0].language;
          } else self.value_tabletInterfaceLangurage = "zh";
        }
      });
    },
    mounted() {
      this.deviceTypes = deviceTypes;
    },
    computed: {
      ...mapState(["deviceType"]),
    },
    watch: {
      value_highTemperatureThreshold: function (value) {
        const self = this;
        if (self.value_temperatureUnitCelsius == true) {
          self.value_highTemperatureThreshold_Celsius = value;
          self.value_highTemperatureThreshold_Fahrenheit = (value * 9) / 5 + 32;
        } else {
          self.value_highTemperatureThreshold_Celsius = ((value - 32) * 5) / 9;
          self.value_highTemperatureThreshold_Fahrenheit = value;
        }
      },
    },
    methods: {
      checkAndReturnValue(value, defaultValue) {
        if (value != null) return value;
        return defaultValue;
      },
      sleep(ms = 0) {
        return new Promise((r) => setTimeout(r, ms));
      },
      isDisplayVerifyResultTimeNumber(n) {
        const self = this;
        let ok = false;
        var numbers = /^[0-9]+$/;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        }
        self.flag_displaySettingsOk = ok;
        return ok;
      },
      selEnableTwoFactorAuthentication(e) {
        const self = this;
        self.value_enableTwoFactorAuthentication = e.target.value == "true" ? true : false;
      },
      selEnableIdCard(e) {
        const self = this;
        self.value_enableIdCard = e.target.value == "true" ? true : false;
      },

      selFaceMaskDetection(e) {
        const self = this;
        self.value_haveToWearFaceMask = e.target.value == "true" ? true : false;
      },
      selFaceMaskEnhancement(e) {
        const self = this;
        self.value_faceMaskEnhancement = e.target.value == "true" ? true : false;
      },
      selVerifyDisplayPhoto(e) {
        const self = this;
        self.value_showProfilePhoto = e.target.value == "true" ? true : false;
      },
      selShowVerifyIndication(e) {
        const self = this;
        self.value_showVerifyIndication = e.target.value == "true" ? true : false;
      },
      selShowTemperatureUnit(e) {
        const self = this;
        self.value_temperatureUnitCelsius = e.target.value == "true" ? true : false;
        self.disp_highTemperatureThreshold =
          i18n.formatter.format("HighTemperatureThreshold") +
          " " +
          (self.value_temperatureUnitCelsius == true
            ? i18n.formatter.format("Celsius")
            : i18n.formatter.format("Fahrenheit"));
        self.value_highTemperatureThreshold =
          self.value_temperatureUnitCelsius == true
            ? self.value_highTemperatureThreshold_Celsius
            : self.value_highTemperatureThreshold_Fahrenheit;
      },
      selAlarmVolume(e) {
        const self = this;
        self.value_alarmVolume = Number(e.target.value);
      },
      selInterfaceLangurage(e) {
        const self = this;
        self.value_tabletInterfaceLangurage = e.target.value;
      },
      isFloat(n) {
        return n == 0.0 || (n < 1.0 && !!(n % 1));
      },
      isValidThreshhole(n) {
        const self = this;
        self.flag_verifySettingsOk =
          self.isFloat(self.value_verifyThreshold) &&
          self.isFloat(self.value_antiSpoofingThreshold) &&
          self.isFloat(self.value_faceDetectThreshold);
        return self.isFloat(n);
      },
      isValidTempterature(n) {
        const self = this;
        var numbers = /^[0-9]+$/;
        var ok = false;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        } else {
          ok = !!(n % 1);
        }
        self.flag_verifyAlarmSettingsOk = ok;
        return ok;
      },
      async applyCustomButton() {
        const self = this;
        let dataChange = false;
        self.flag_changingCustomButton = true;
        if (
          self.value_tabletSettings.custom_trigger_button_settings == null ||
          self.value_tabletSettings.custom_trigger_button_settings.enable !=
          self.value_enableCustomButton ||
          self.value_tabletSettings.custom_trigger_button_settings.url !=
          self.value_customFunctionUrl
        ) {
          self.value_tabletSettings["custom_trigger_button_settings"] = {
            enable: self.value_enableCustomButton,
            url: self.value_customFunctionUrl,
          };
          dataChange = true;
        }

        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_enableIntercom = self.value_tabletSettings.enable_intercom;
                retry = false;
                pass = true;
              } else {
                if (counterRetry++ < 60) await self.sleep(2000);
                else break;
              }
            }
            if (pass)
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000,
              });
            else self.$globalLogout();
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingCustomButton = false;
      },
      async applyAiraManager() {
        const self = this;
        var dataChange =
          self.$globalAiraManagerSettings.manager_host != self.value_airaManagerHostName ||
          self.$globalAiraManagerSettings.manager_port != self.value_airaManagerPort ||
          self.$globalAiraManagerSettings.manager_enable != self.value_enableAiraManager;

        if (dataChange) {
          self.$confirm(i18n.formatter.format("WillLossAllPersonData")).then(() => {
            //if( confirm( self.disp_willLossAllPersonData ) ) {
            self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
            self.$globalSetAiraManagerSetting(
              {
                manager_enable: self.value_enableAiraManager,
                manager_host: self.value_airaManagerHostName,
                manager_port: self.value_airaManagerPort,
              },
              function (error) {
                if (!error) {
                  self.$globalLogout();
                  self
                    .$fire({
                      text: i18n.formatter.format("CompleteAndRestart"),
                      type: "success",
                      showConfirmButton: false,
                      //timerProgressBar : true,
                      timer: 60000,
                      allowOutsideClick: () => { },
                    })
                    .then(() => { });
                }
                if (self.obj_loading) self.obj_loading.hide();
              }
            );
          });
        }
      },
      async applyIntercom() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingIntercomSettings = true;

        if (self.value_tabletSettings.enable_intercom != self.value_enableIntercom) {
          self.value_tabletSettings.enable_intercom = self.value_enableIntercom;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_enableIntercom = self.value_tabletSettings.enable_intercom;
                retry = false;
                pass = true;
              } else {
                if (counterRetry++ < 60) await self.sleep(2000);
                else break;
              }
            }
            if (pass)
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000,
              });
            else self.$globalLogout();
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingIntercomSettings = false;
      },
      async ApplyRtsp() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingRtsp = true;
        if (
          self.value_tabletSettings.rtsp_username != self.value_rtspUsername ||
          self.value_tabletSettings.rtsp_password != self.value_rtspPassword ||
          self.value_tabletSettings.enable_rtsp_camera != self.value_enableRtsp
        ) {
          self.value_tabletSettings.rtsp_username = self.value_rtspUsername;
          self.value_tabletSettings.rtsp_password = self.value_rtspPassword;
          self.value_tabletSettings.enable_rtsp_camera = self.value_enableRtsp;
          dataChange = true;
        }
        if (dataChange) {
          let applyOk = false;
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            await self.sleep(15000);
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_rtspUsername = self.value_tabletSettings.rtsp_username;
                self.value_rtspPassword = self.value_tabletSettings.rtsp_password;
                self.value_enableRtsp = self.value_tabletSettings.enable_rtsp_camera;
                retry = false;
                pass = true;
                self.value_rtspActivated = self.value_enableRtsp;
              } else {
                if (counterRetry++ < 60) await self.sleep(2000);
                else break;
              }
            }
            if (pass)
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000,
              });
            else self.$globalLogout();
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingRtsp = false;
      },
      async ApplyClockInMode() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingClockInMode = true;
        if (self.value_tabletSettings.enable_clock_mode != self.value_enableClockinMode) {
          self.value_tabletSettings.enable_clock_mode = self.value_enableClockinMode;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_enableClockinMode = self.value_tabletSettings.enable_clock_mode;
                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingClockInMode = false;
      },

      async ApplyVerifySettings() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingVerifySettings = true;

        if (
          self.value_tabletSettings.score_for_valid_face != self.value_verifyThreshold ||
          self.value_tabletSettings.anti_spoofing_score !=
          self.value_antiSpoofingThreshold ||
          self.value_tabletSettings.have_to_wear_face_mask !=
          self.value_haveToWearFaceMask ||
          self.value_tabletSettings.face_mask_enhancement !=
          self.value_faceMaskEnhancement ||
          self.value_tabletSettings.enable_id_card != self.value_enableIdCard ||
          self.value_tabletSettings.enable_two_factor_authentication !=
          self.value_enableTwoFactorAuthentication ||
          self.value_tabletSettings.face_detection_threshold !=
          self.value_faceDetectThreshold
        ) {
          self.value_tabletSettings["score_for_valid_face"] = parseFloat(
            self.value_verifyThreshold
          );
          self.value_tabletSettings["anti_spoofing_score"] = parseFloat(
            self.value_antiSpoofingThreshold
          );
          self.value_tabletSettings["face_detection_threshold"] = parseFloat(
            self.value_faceDetectThreshold
          );
          self.value_tabletSettings["have_to_wear_face_mask"] =
            self.value_haveToWearFaceMask;
          self.value_tabletSettings["face_mask_enhancement"] =
            self.value_faceMaskEnhancement;
          self.value_tabletSettings["enable_id_card"] = self.value_enableIdCard;
          self.value_tabletSettings["enable_two_factor_authentication"] =
            self.value_enableTwoFactorAuthentication;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self["value_tabletSettings"] = ret.data;
                self["value_verifyThreshold"] =
                  self.value_tabletSettings.score_for_valid_face;
                self["value_faceDetectThreshold"] =
                  self.value_tabletSettings.face_detection_threshold;
                self["value_antiSpoofingThreshold"] =
                  self.value_tabletSettings.anti_spoofing_score;
                self["value_haveToWearFaceMask"] =
                  self.value_tabletSettings.have_to_wear_face_mask;
                self["value_faceMaskEnhancement"] =
                  self.value_tabletSettings.face_mask_enhancement;
                self["value_enableIdCard"] = self.value_tabletSettings.enable_id_card;
                self["value_enableTwoFactorAuthentication"] =
                  self.value_tabletSettings.enable_two_factor_authentication;

                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingVerifySettings = false;
      },
      async ApplyDisplaySettings() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingDisplaySettings = true;

        if (
          self.value_tabletSettings.show_profile_photo != self.value_showProfilePhoto ||
          self.value_tabletSettings.show_verify_indication !=
          self.value_showVerifyIndication ||
          self.value_tabletSettings.display_verify_result_time !=
          Number(self.value_displayVerifyResultTime) ||
          self.value_tabletSettings.temperature_unit_celsius !=
          self.value_temperatureUnitCelsius
        ) {
          self.value_tabletSettings.show_profile_photo = self.value_showProfilePhoto;
          self.value_tabletSettings.show_verify_indication =
            self.value_showVerifyIndication;
          self.value_tabletSettings.display_verify_result_time = Number(
            self.value_displayVerifyResultTime
          );
          self.value_tabletSettings.temperature_unit_celsius =
            self.value_temperatureUnitCelsius;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_showProfilePhoto = self.value_tabletSettings.show_profile_photo;
                self.value_showVerifyIndication =
                  self.value_tabletSettings.show_verify_indication;
                self.value_displayVerifyResultTime =
                  self.value_tabletSettings.display_verify_result_time;
                self.value_temperatureUnitCelsius =
                  self.value_tabletSettings.temperature_unit_celsius;

                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingDisplaySettings = false;
      },
      async ApplyAlarmSettings() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingAlarmSettings = true;

        if (
          self.value_tabletSettings.audio_alarm_volume != self.value_alarmVolume ||
          self.value_tabletSettings.high_temperature !=
          self.value_highTemperatureThreshold_Celsius
        ) {
          self.value_tabletSettings.audio_alarm_volume = self.value_alarmVolume;
          self.value_tabletSettings.high_temperature =
            self.value_highTemperatureThreshold_Celsius;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_alarmVolume = self.value_tabletSettings.audio_alarm_volume;
                self.value_highTemperatureThreshold_Celsius =
                  self.value_tabletSettings.high_temperature;
                self.value_highTemperatureThreshold_Fahrenheit =
                  (self.value_highTemperatureThreshold_Celsius * 9) / 5 + 32;
                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingAlarmSettings = false;
      },
      async ApplyTabletInterfaceLangurage() {
        const self = this;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingTabletInterfaceLangurage = true;
        const applyRet = await self.$globalChangeLanguage({
          language: self.value_tabletInterfaceLangurage,
        });
        if (!applyRet.error) {
          let counterRetry = 0;
          let retry = true;
          let pass = false;
          while (retry) {
            const ret = await self.$globalFetchSupportedlanguagelist();
            if (!ret.error && ret.data) {
              const activeLang = ret.data.list.filter((l) => {
                return l.active;
              });
              if (activeLang.length > 0) {
                self.value_tabletInterfaceLangurage = activeLang[0].language;
              } else self.value_tabletInterfaceLangurage = "zh";

              retry = false;
              pass = true;
            } else if (counterRetry++ < 10) await self.sleep(2000);
          }
          self.$fire({
            text: pass
              ? i18n.formatter.format("Successful")
              : i18n.formatter.format("OperationFailed"),
            type: pass ? "success" : "error",
            timer: 3000,
          });
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingTabletInterfaceLangurage = false;
      },
      async ApplySystemPassword() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingTabletSystemPassword = true;
        if (self.value_tabletSettings.system_password != self.value_tabletSystemPassword) {
          self.value_tabletSettings.system_password = self.value_tabletSystemPassword;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_tabletSystemPassword = self.value_tabletSettings.system_password;
                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingTabletSystemPassword = false;
      },
      clickOnApplyAlarmSettings() {
        this.ApplyAlarmSettings();
      },
      clickOnApplyDisplaySettings() {
        this.ApplyDisplaySettings();
      },
      clickOnApplyRtsp() {
        this.ApplyRtsp();
      },
      clickOnApplyClockInMode() {
        this.ApplyClockInMode();
      },
      clickOnApplyVerifySettings() {
        this.ApplyVerifySettings();
      },
      clickOnApplyTabletInterfaceLangurage() {
        this.ApplyTabletInterfaceLangurage();
      },
      clickOnApplyTabletSystemPassword() {
        this.ApplySystemPassword();
      },
      clickOnApplyIntercom() {
        this.applyIntercom();
      },
      clickOnApplyAiraManager() {
        this.applyAiraManager();
      },
      clickOnApplyCustomButton() {
        this.applyCustomButton();
      },
    },
  };
</script>