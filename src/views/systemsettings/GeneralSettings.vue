<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ $t('GeneralSettings') }}
      </div>
      <div style="height: 30px" />
      <!-- 辨識設定 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('FaceVerifySettings') }}</span>
          </div>
        </CCardHeader>

        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">
                {{ $t('VerifyThreshold') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('AntiSpoofingThreshold') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('FaceDetectThreshold') }}
              </th>
              <th class="h5 w-25 table-th" />
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
              <td class="table-td" />
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
              <th class="h5 w-25 table-th">
                {{ $t('FaceMaskDetection') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('EnableIdCard') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('EnableTwoFactorAuthentication') }}
              </th>
              <th class="h5 w-25 table-th" />
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
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 平板顯示設定 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('TabletDisplaySettings') }}</span>
          </div>
        </CCardHeader>

        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('VerifyResultPhoto') }}
              </th>

              <th class="h5 w-25 table-th">
                <div class="h5" data-coreui-toggle="tooltip">
                  {{ $t('VerifyResultDisplayDuration') }}
                </div>
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('TemperatureDisplayingUnit') }}
              </th>
              <th class="h5 w-25 table-th">
                <div v-if="flag_support_show_verify_indication">
                  {{ $t('ShowVerifyIndication') }}
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
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 成為網路攝影機 -->
      <CCard v-if="deviceProfile.support_rtsp" v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('TurnsIpCamera') }}</span>
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
          <div style="height: 15px" />
          <CCol sm="12">
            <CCol sm="12">
              <CRow>
                <CSwitch size="lg" color="success" shape="pill" :checked="value_enableRtsp"
                  @update:checked="value_enableRtsp = !value_enableRtsp" />
                <div>
                  <span class="h4 ml-2">
                    <span v-if="value_enableRtsp">{{ $t('Enable') }}</span>
                    <span v-else>{{ $t('Disable') }}</span>
                  </span>
                </div>
              </CRow>
            </CCol>
          </CCol>

          <table class="table-layout mt-4">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('Username') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Password') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_rtspUsername" :value="value_rtspUsername"
                  :disabled="!value_enableRtsp" />
              </td>
              <td class="table-td">
                <CInput size="lg" :type="flag_view_password ? 'text' : 'password'" v-model="value_rtspPassword"
                  :value="value_rtspPassword" :disabled="!value_enableRtsp">
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                      <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyRtsp" :disabled="flag_changingRtsp">
                  <div style="font-size: 20px">
                    {{ $t('Apply') }}
                  </div>
                </CButton>
              </td>
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 打卡鐘模式 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('ClockinMode') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableClockinMode"
                @update:checked="value_enableClockinMode = !value_enableClockinMode" />
              <div>
                <span class="h4 ml-2 p-0">
                  <span v-if="value_enableClockinMode">{{ $t('Enable') }}</span>
                  <span v-else>{{ $t('Disable') }}</span>
                </span>
              </div>
              <CButton class="btn btn-primary ml-5 btn-w-normal" @click="clickOnApplyClockInMode">
                <div style="font-size: 20px">
                  {{ $t('Apply') }}
                </div>
              </CButton>
            </div>
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 門禁對講機 -->
      <CCard v-if="deviceProfile.support_intercom" v-show="false">
        <CCardHeader>
          <div>
            <span class="h3" style="display: inline-block; position: relative; margin-right: 33px">
              {{ $t('Intercom') }}
            </span>
            <span class="h6" style="display: inline-block; margin: 0; position: relative; bottom: 4px">
              <span style="background-color: white; color: gray">
                Intercom client :
              </span>
              <a :href="value_videoPath" download>
                {{ $t('Download') }}
              </a>
            </span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <!-- <div class="h5">{{ $t('EnableIntercom') }}</div> -->
              <CSwitch size="lg" class="ml-0" color="success" shape="pill"
                @update:checked="value_enableIntercom = !value_enableIntercom" :checked="value_enableIntercom" />
              <div>
                <span class="h4 ml-2">
                  <span v-if="value_enableIntercom">{{ $t('EnableIntercom') }}</span>
                  <span v-else>{{ $t('DisableIntercom') }}</span>
                </span>
              </div>
              <CButton @click="clickOnApplyIntercom" class="btn btn-primary ml-5 btn-w-normal"
                :disabled="flag_changingIntercomSettings">
                <div style="font-size: 20px">
                  {{ $t('Apply') }}
                </div>
              </CButton>
            </div>
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 自定義功能按鈕 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('CustomButton') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center my-3">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableCustomButton"
                @update:checked="value_enableCustomButton = !value_enableCustomButton" />
              <div>
                <span class="h4 ml-2">
                  <span v-if="value_enableCustomButton">{{ $t('Enable') }}</span>
                  <span v-else>{{ $t('Disable') }}</span>
                </span>
              </div>
              <CButton class="btn btn-primary ml-5 btn-w-normal" @click="clickOnApplyCustomButton">
                <div style="font-size: 20px">
                  {{ $t('Apply') }}
                </div>
              </CButton>
            </div>
          </CCol>
          <div style="height: 30px" />
          <CCol sm="12">
            <div class="h5">
              {{ $t('URL') }}
            </div>
            <CInput size="lg" v-model="value_customFunctionUrl" :value="value_customFunctionUrl"
              :disabled="!value_enableCustomButton" />
          </CCol>
        </CCardBody>
      </CCard>
      <!-- 警示設定 -->
      <CCard v-if="deviceProfile.support_high_temp_sound_alert" v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('AlarmSettings') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('AlarmVolume') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_highTemperatureThreshold }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
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
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 平板介面語言 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('TabletInterfaceLangurage') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('TabletInterfaceLangurageList') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_tabletInterfaceLangurage"
                  :options="value_tabletInterfaceLangurageList" @change="selInterfaceLangurage($event)" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyTabletInterfaceLangurage"
                  :disabled="flag_changingTabletInterfaceLangurage">
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 中央管理 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('CentralManagement') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <div class="d-flex align-items-center mt-3 mb-5">
              <CSwitch size="lg" color="success" shape="pill" :checked="value_enableAiraManager"
                @update:checked="value_enableAiraManager = !value_enableAiraManager" />
              <div>
                <span class="h4 ml-2 p-0">
                  <span v-if="value_enableAiraManager">{{ $t('Enable') }}</span>
                  <span v-else>{{ $t('Disable') }}</span>
                </span>
              </div>
            </div>
          </CCol>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('HostAddress') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_airaManagerHostName" :is-valid="managerIpValidator"
                  :invalid-feedback="flag_manager_host" :disabled="!value_enableAiraManager" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnApplyAiraManager"
                  :disabled="flag_manager_host !== ''">
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 系統管理密碼 -->
      <CCard v-show="false">
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('TabletSystemPassword') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('TabletSystemPassword') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_tabletSystemPassword" :value="value_tabletSystemPassword"
                  :type="flag_view_password ? 'text' : 'password'">
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                      <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-lg" @click="clickOnApplyTabletSystemPassword"
                  :disabled="flag_changingTabletSystemPassword">
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <!-- 資料保存 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('DataRetention') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('VerifiedDuration') }}
              </h5>
              <CSelect size="lg" v-model="value_verified_maintain_duration"
                :options="value_verifiedMaintainDurationList" />
            </CCol>
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('NonVerifiedDuration') }}
              </h5>
              <CSelect size="lg" v-model="value_non_verified_maintain_duration"
                :options="value_nonVerifiedMaintainDurationList" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('MaintainDiskSpace') }}
              </h5>
              <CInput size="lg" v-model.number="value_maintain_disk_space_in_gb" :invalid-feedback="getInvalidFeedback"
                :is-valid="isFieldPassed" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <CButton class="btn btn-primary fz-xl" @click="clickOnApplySystemSetting">
                {{ $t('Apply') }}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <!-- SMTP 設定 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ $t('SmtpSettingTitle') }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('IpAddress') }}
              </h5>
              <CInput size="lg" v-model="value_smtp_host" :invalid-feedback="flag_smtp_host"
                :is-valid="hostValidator" />
            </CCol>
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('SMTPEnabledSecure') }}
              </h5>
              <CSwitch size="lg" class="ml-0" color="success" shape="pill" :checked="value_smtp_secure"
                @update:checked="value_smtp_secure = $event" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('Port') }}
              </h5>
              <CInput size="lg" v-model.number="value_smtp_port" :invalid-feedback="flag_smtp_port"
                :is-valid="portValidator" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('email') }}
              </h5>
              <CInput size="lg" v-model.number="value_smtp_user" :invalid-feedback="flag_smtp_user"
                :is-valid="emailValidator" />
            </CCol>
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('Password') }}
              </h5>
              <CInput size="lg" type="password" v-model="value_smtp_pass" :invalid-feedback="flag_smtp_pass"
                :is-valid="passValidator" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <h5 class="ml-2">
                {{ $t('SMTPSender') }}
              </h5>
              <CInput size="lg" v-model="value_smtp_from" />
            </CCol>
          </CRow>
          <CRow class="ml-2">
            <CCol sm="3">
              <CButton class="btn btn-primary fz-xl"
                :disabled="flag_smtp_host !== '' || flag_smtp_port !== '' || flag_smtp_user !== '' || flag_smtp_pass !== ''"
                @click="applySmtpSetting">
                {{ $t('Apply') }}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  import { checkDomainName, checkPort, checkEmail, checkIpAddr } from '../../utils/validate';

  export default {
    name: 'GeneralSettings',

    data() {
      return {
        param_cardStyle: 'height: 26rem;',

        flag_view_password: false,

        disp_highTemperatureThreshold:
          `${this.$t('HighTemperatureThreshold')
          } ${this.$t('Celsius')}`,

        value_airaManagerHostName: '',
        value_airaManagerPort: 8443,
        value_enableAiraManager: false,
        value_customFunctionUrl: '',

        value_enableDisableListToShow: [
          { value: true, label: this.$t('Yes') },
          { value: false, label: this.$t('No') },
        ],
        value_haveToWearFaceMask: false,
        value_faceMaskEnhancement: false,
        value_enableIdCard: false,
        value_enableTwoFactorAuthentication: false,
        value_verifyResultPhotoList: [
          { value: true, label: this.$t('RegisterPhoto') },
          { value: false, label: this.$t('CapturedPhoto') },
        ],
        value_showVerifyIndication: false,
        value_showVerifyIndicationList: [
          { value: true, label: this.$t('Yes') },
          { value: false, label: this.$t('No') },
        ],
        value_showProfilePhoto: false,
        value_temperatureDisplayingUnitList: [
          { value: true, label: this.$t('Celsius') },
          { value: false, label: this.$t('Fahrenheit') },
        ],
        value_temperatureUnitCelsius: true,
        value_highTemperatureThreshold: 37.5,
        value_highTemperatureThreshold_Celsius: 37.5,
        value_highTemperatureThreshold_Fahrenheit: 99.5,
        value_alarmVolumeList: [
          { value: 1.0, label: '100 %' },
          { value: 0.9, label: '90 %' },
          { value: 0.8, label: '80 %' },
          { value: 0.7, label: '70 %' },
          { value: 0.6, label: '60 %' },
          { value: 0.5, label: '50 %' },
          { value: 0.4, label: '40 %' },
          { value: 0.3, label: '30 %' },
          { value: 0.2, label: '20 %' },
          { value: 0.1, label: '10 %' },
          { value: 0.0, label: 'Off' },
        ],
        value_alarmVolume: 0.1,
        value_displayVerifyResultTime: 3000,
        flag_changingTabletInterfaceLangurage: false,
        value_tabletInterfaceLangurage: 'zh',
        value_tabletInterfaceLangurageList: [],
        value_tabletSystemPassword: '123456',
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
        value_rtspUsername: '',
        value_rtspPassword: '',
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
        value_videoPath: '',
        flag_downloadingFile: false,
        value_rtspPath: '',
        flag_changingTabletSystemPassword: false,

        flag_support_enhance_facemask: false,
        flag_support_rtsp: false,
        // flag_support_intercom: false,
        flag_support_high_temp_sound_alert: false,
        flag_support_show_verify_indication: false,
        flag_support_invalid_result_show_switch: false,

        deviceProfile: {},

        value_verified_maintain_duration: 30 * 24 * 60 * 60 * 1000,
        value_non_verified_maintain_duration: 14 * 24 * 60 * 60 * 1000,
        value_maintain_disk_space_in_gb: 50,

        range_maintain_disk_space_in_gb: [1, 1024],

        value_verifiedMaintainDurationList: [
          { value: 30 * 24 * 60 * 60 * 1000, label: '30' },
          { value: 60 * 24 * 60 * 60 * 1000, label: '60' },
          { value: 120 * 24 * 60 * 60 * 1000, label: '120' },
          { value: 365 * 24 * 60 * 60 * 1000, label: '365' },
        ],

        value_nonVerifiedMaintainDurationList: [
          { value: 7 * 24 * 60 * 60 * 1000, label: '7' },
          { value: 14 * 24 * 60 * 60 * 1000, label: '14' },
          { value: 30 * 24 * 60 * 60 * 1000, label: '30' },
        ],

        value_smtp_secure: false,
        value_smtp_from: '',
        value_smtp_user: '',
        value_smtp_pass: '',
        value_smtp_host: '',
        value_smtp_port: 0,

        flag_smtp_secure: '',
        flag_smtp_from: '',
        flag_smtp_user: '',
        flag_smtp_pass: '',
        flag_smtp_host: '',
        flag_smtp_port: '',

        flag_manager_host: '',
      };
    },
    created() {
      // const HOST = window.location.host;
      // this.value_rtspPath = 'https://' + HOST + '/exe/intercom.zip';
      this.value_videoPath = 'https://www.aira.com.tw/app/application/airaIntercom_setup_20211217.zip';
      this.value_rtspPath = `rtsp://[username]:[password]@${window.location.hostname}:8554/live.sdp`;

      // this.$globalGetSystemInfo(function (err, data) {
      //   if (data != null) {
      //     if (data.device_type == 'airaTablet_xs') {
      //       this.flag_support_enhance_facemask = true;
      //       this.flag_support_rtsp = false;
      //       // this.flag_support_intercom = false;
      //       this.flag_support_high_temp_sound_alert = false;
      //       this.flag_support_invalid_result_show_switch = true;
      //       this.flag_support_show_verify_indication = false;
      //     } else {
      //       this.flag_support_enhance_facemask = true;
      //       this.flag_support_rtsp = true;
      //       // this.flag_support_intercom = true;
      //       this.flag_support_high_temp_sound_alert = true;
      //       this.flag_support_invalid_result_show_switch = false;
      //       this.flag_support_show_verify_indication = true;
      //     }
      //   }
      // });

      this.$globalGetAiraManagerSetting((err, data) => {
        if (!err) {
          this.$globalAiraManagerSettings = { ...data };
          this.value_airaManagerHostName = data.manager_host;
          this.value_airaManagerPort = data.manager_port;
          this.value_enableAiraManager = data.manager_enable;
        }
      });

      // this.$globalGetTabletSetting((err, data) => {
      //   if (!err) {
      //     this.value_tabletSettings = data;

      //     this.value_rtspUsername = this.checkAndReturnValue(
      //       this.value_tabletSettings.rtsp_username,
      //       '',
      //     );
      //     this.value_rtspPassword = this.checkAndReturnValue(
      //       this.value_tabletSettings.rtsp_password,
      //       '',
      //     );
      //     this.value_enableRtsp = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_rtsp_camera,
      //       false,
      //     );
      //     this.value_rtspActivated = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_rtsp_camera,
      //       false,
      //     );
      //     this.value_enableClockinMode = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_clock_mode,
      //       false,
      //     );
      //     this.value_haveToWearFaceMask = this.checkAndReturnValue(
      //       this.value_tabletSettings.have_to_wear_face_mask,
      //       false,
      //     );
      //     this.value_faceMaskEnhancement = this.checkAndReturnValue(
      //       this.value_tabletSettings.face_mask_enhancement,
      //       false,
      //     );
      //     this.value_showProfilePhoto = this.checkAndReturnValue(
      //       this.value_tabletSettings.show_profile_photo,
      //       false,
      //     );
      //     this.value_showVerifyIndication = this.checkAndReturnValue(
      //       this.value_tabletSettings.show_verify_indication,
      //       false,
      //     );
      //     this.value_displayVerifyResultTime = this.checkAndReturnValue(
      //       this.value_tabletSettings.display_verify_result_time,
      //       false,
      //     );
      //     this.value_temperatureUnitCelsius = this.checkAndReturnValue(
      //       this.value_tabletSettings.temperature_unit_celsius,
      //       false,
      //     );
      //     this.value_enableIdCard = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_id_card,
      //       false,
      //     );
      //     this.value_enableTwoFactorAuthentication = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_two_factor_authentication,
      //       false,
      //     );

      //     this.value_alarmVolume = this.checkAndReturnValue(
      //       this.value_tabletSettings.audio_alarm_volume,
      //       0,
      //     );
      //     this.value_highTemperatureThreshold_Celsius = this.checkAndReturnValue(
      //       this.value_tabletSettings.high_temperature,
      //       38,
      //     );

      //     this.value_tabletSystemPassword = this.checkAndReturnValue(
      //       this.value_tabletSettings.system_password,
      //       '123456',
      //     );

      //     this.value_highTemperatureThreshold_Fahrenheit = (this.value_highTemperatureThreshold_Celsius * 9) / 5 + 32;
      //     this.value_highTemperatureThreshold = this.value_temperatureUnitCelsius === true
      //       ? this.value_highTemperatureThreshold_Celsius
      //       : this.value_highTemperatureThreshold_Fahrenheit;
      //     this.disp_highTemperatureThreshold = `${this.$t('HighTemperatureThreshold')
      //     } ${
      //       this.value_temperatureUnitCelsius === true
      //         ? this.$t('Celsius')
      //         : this.$t('Fahrenheit')}`;

      //     this.value_verifyThreshold = this.checkAndReturnValue(
      //       this.value_tabletSettings.score_for_valid_face,
      //       0.9,
      //     );
      //     this.value_antiSpoofingThreshold = this.checkAndReturnValue(
      //       this.value_tabletSettings.anti_spoofing_score,
      //       0,
      //     );
      //     this.value_faceDetectThreshold = this.checkAndReturnValue(
      //       this.value_tabletSettings.face_detection_threshold,
      //       0.5,
      //     );
      //     // intercom
      //     this.value_enableIntercom = this.checkAndReturnValue(
      //       this.value_tabletSettings.enable_intercom,
      //       false,
      //     );

      //     // custom button
      //     if (this.value_tabletSettings.custom_trigger_button_settings != null) {
      //       this.value_enableCustomButton = this.checkAndReturnValue(
      //         this.value_tabletSettings.custom_trigger_button_settings.enable,
      //         false,
      //       );
      //       this.value_customFunctionUrl = this.checkAndReturnValue(
      //         this.value_tabletSettings.custom_trigger_button_settings.url,
      //         '',
      //       );
      //     }
      //   }
      // });

      this.$globalFetchSupportedlanguagelist((err, data) => {
        if (!err) {
          this.value_tabletInterfaceLangurageList = [];
          data.list.forEach((lang) => {
            this.value_tabletInterfaceLangurageList.push({
              value: lang.language,
              label: lang.display_name,
            });
          });
          const activeLang = data.list.filter((l) => l.active);
          if (activeLang.length > 0) {
            this.value_tabletInterfaceLangurage = activeLang[0].language;
          } else this.value_tabletInterfaceLangurage = 'zh';
        }
      });

      this.$globalGetSystemSettings((err, data) => {
        if (!err) {
          const { settings: { db, smtp } } = data;
          if (db.verified_maintain_duration) this.value_verified_maintain_duration = db.verified_maintain_duration;
          if (db.non_verified_maintain_duration) this.value_non_verified_maintain_duration = db.non_verified_maintain_duration;
          if (db.maintain_disk_space_in_gb) this.value_maintain_disk_space_in_gb = db.maintain_disk_space_in_gb;
          if (smtp) {
            this.value_smtp_secure = smtp.secure;
            this.value_smtp_from = smtp.from;
            this.value_smtp_user = smtp.user;
            this.value_smtp_pass = smtp.pass;
            this.value_smtp_host = smtp.host;
            this.value_smtp_port = smtp.port;
          }
        }
      });
    },
    mounted() {
      this.deviceProfile = JSON.parse(localStorage.getItem('deviceProfile'));
    },
    computed: {
      isFieldPassed() {
        const number = parseInt(this.value_maintain_disk_space_in_gb, 10);
        return Number.isInteger(number)
          && this.value_maintain_disk_space_in_gb >= this.range_maintain_disk_space_in_gb[0]
          && this.value_maintain_disk_space_in_gb <= this.range_maintain_disk_space_in_gb[1];
      },
      getInvalidFeedback() {
        return this.$t('limitNumberRange')
          .replace('#1', `${this.range_maintain_disk_space_in_gb[0]}GB`)
          .replace('#2', `${this.range_maintain_disk_space_in_gb[1]}GB`);
      },
    },
    watch: {
      value_highTemperatureThreshold(value) {
        if (this.value_temperatureUnitCelsius == true) {
          this.value_highTemperatureThreshold_Celsius = value;
          this.value_highTemperatureThreshold_Fahrenheit = (value * 9) / 5 + 32;
        } else {
          this.value_highTemperatureThreshold_Celsius = ((value - 32) * 5) / 9;
          this.value_highTemperatureThreshold_Fahrenheit = value;
        }
      },
    },
    methods: {
      viewPassword() {
        this.flag_view_password = !this.flag_view_password;
      },
      hostValidator(val) {
        this.flag_smtp_host = checkDomainName(val);
        return this.flag_smtp_host === '';
      },
      portValidator(val) {
        this.flag_smtp_port = checkPort(val);
        return this.flag_smtp_port === '';
      },
      passValidator(val) {
        this.flag_smtp_pass = val.length < 1 ? i18n.formatter.format('NoEmptyNoSpace') : '';
        return this.flag_smtp_pass === '';
      },
      emailValidator(val) {
        this.flag_smtp_user = checkEmail(val);
        return this.flag_smtp_user === '';
      },
      managerIpValidator(val) {
        if (!this.value_enableAiraManager) {
          this.flag_manager_host = '';
          return true;
        }
        this.flag_manager_host = checkIpAddr(val);
        return this.flag_manager_host === '';
      },

      checkAndReturnValue(value, defaultValue) {
        if (value != null) return value;
        return defaultValue;
      },
      sleep(ms = 0) {
        return new Promise((r) => setTimeout(r, ms));
      },
      isDisplayVerifyResultTimeNumber(n) {
        let ok = false;
        const numbers = /^[0-9]+$/;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        }
        this.flag_displaySettingsOk = ok;
        return ok;
      },
      selEnableTwoFactorAuthentication(e) {
        this.value_enableTwoFactorAuthentication = e.target.value == 'true';
      },
      selEnableIdCard(e) {
        this.value_enableIdCard = e.target.value == 'true';
      },

      thisaceMaskDetection(e) {
        this.value_haveToWearFaceMask = e.target.value == 'true';
      },
      thisaceMaskEnhancement(e) {
        this.value_faceMaskEnhancement = e.target.value == 'true';
      },
      selVerifyDisplayPhoto(e) {
        this.value_showProfilePhoto = e.target.value == 'true';
      },
      selShowVerifyIndication(e) {
        this.value_showVerifyIndication = e.target.value == 'true';
      },
      selShowTemperatureUnit(e) {
        this.value_temperatureUnitCelsius = e.target.value == 'true';
        this.disp_highTemperatureThreshold = `${this.$t('HighTemperatureThreshold')
          } ${this.value_temperatureUnitCelsius == true
            ? this.$t('Celsius')
            : this.$t('Fahrenheit')}`;
        this.value_highTemperatureThreshold = this.value_temperatureUnitCelsius == true
          ? this.value_highTemperatureThreshold_Celsius
          : this.value_highTemperatureThreshold_Fahrenheit;
      },
      selAlarmVolume(e) {
        this.value_alarmVolume = Number(e.target.value);
      },
      selInterfaceLangurage(e) {
        this.value_tabletInterfaceLangurage = e.target.value;
      },
      isFloat(n) {
        return n == 0.0 || (n < 1.0 && !!(n % 1));
      },
      isValidThreshhole(n) {
        this.flag_verifySettingsOk = this.isFloat(this.value_verifyThreshold)
          && this.isFloat(this.value_antiSpoofingThreshold)
          && this.isFloat(this.value_faceDetectThreshold);
        return this.isFloat(n);
      },
      isValidTempterature(n) {
        const numbers = /^[0-9]+$/;
        let ok = false;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        } else {
          ok = !!(n % 1);
        }
        this.flag_verifyAlarmSettingsOk = ok;
        return ok;
      },
      async applyCustomButton() {
        let dataChange = false;
        this.flag_changingCustomButton = true;
        if (
          this.value_tabletSettings.custom_trigger_button_settings == null
          || this.value_tabletSettings.custom_trigger_button_settings.enable
          != this.value_enableCustomButton
          || this.value_tabletSettings.custom_trigger_button_settings.url
          != this.value_customFunctionUrl
        ) {
          this.value_tabletSettings.custom_trigger_button_settings = {
            enable: this.value_enableCustomButton,
            url: this.value_customFunctionUrl,
          };
          dataChange = true;
        }

        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_enableIntercom = this.value_tabletSettings.enable_intercom;
                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 60) {
                counterRetry += 1;
                await this.sleep(2000);
              } else break;
            }
            if (pass) {
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else this.$globalLogout();
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingCustomButton = false;
      },
      async applyAiraManager() {
        const dataChange = this.$globalAiraManagerSettings.manager_host != this.value_airaManagerHostName
          || this.$globalAiraManagerSettings.manager_port != this.value_airaManagerPort
          || this.$globalAiraManagerSettings.manager_enable != this.value_enableAiraManager;

        if (dataChange) {
          this.$confirm(this.$t('WillLossAllPersonData')).then(() => {
            // if( confirm( this.$t('WillLossAllPersonData') ) ) {
            this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
            this.$globalSetAiraManagerSetting(
              {
                manager_enable: this.value_enableAiraManager,
                manager_host: this.value_airaManagerHostName,
                manager_port: this.value_airaManagerPort,
              },
              (error) => {
                if (!error) {
                  this.$globalRestartDevice((error, data) => {
                    if (error === null) {
                      if (data.message === 'ok') {
                        this.$fire({
                          text: this.$t('CompleteAndRestart'),
                          type: 'success',
                          showConfirmButton: false,
                          // timerProgressBar : true,
                          timer: 60000,
                          allowOutsideClick: () => { },
                        })
                          .then(() => { });
                      }
                    }
                  });
                }
                if (this.obj_loading) this.obj_loading.hide();
              },
            );
          });
        }
      },
      async applyIntercom() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingIntercomSettings = true;

        if (this.value_tabletSettings.enable_intercom != this.value_enableIntercom) {
          this.value_tabletSettings.enable_intercom = this.value_enableIntercom;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_enableIntercom = this.value_tabletSettings.enable_intercom;
                retry = false;
                pass = true;
              } else if ((counterRetry + 1) < 60) {
                counterRetry += 1;
                await this.sleep(2000);
              } else break;
            }
            if (pass) {
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else this.$globalLogout();
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingIntercomSettings = false;
      },
      async ApplyRtsp() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingRtsp = true;
        if (
          this.value_tabletSettings.rtsp_username != this.value_rtspUsername
          || this.value_tabletSettings.rtsp_password != this.value_rtspPassword
          || this.value_tabletSettings.enable_rtsp_camera != this.value_enableRtsp
        ) {
          this.value_tabletSettings.rtsp_username = this.value_rtspUsername;
          this.value_tabletSettings.rtsp_password = this.value_rtspPassword;
          this.value_tabletSettings.enable_rtsp_camera = this.value_enableRtsp;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            await this.sleep(15000);
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_rtspUsername = this.value_tabletSettings.rtsp_username;
                this.value_rtspPassword = this.value_tabletSettings.rtsp_password;
                this.value_enableRtsp = this.value_tabletSettings.enable_rtsp_camera;
                retry = false;
                pass = true;
                this.value_rtspActivated = this.value_enableRtsp;
              } else if ((counterRetry + 1) < 60) {
                counterRetry += 1;
                await this.sleep(2000);
              } else break;
            }
            if (pass) {
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else this.$globalLogout();
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingRtsp = false;
      },
      async ApplyClockInMode() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingClockInMode = true;
        if (this.value_tabletSettings.enable_clock_mode != this.value_enableClockinMode) {
          this.value_tabletSettings.enable_clock_mode = this.value_enableClockinMode;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_enableClockinMode = this.value_tabletSettings.enable_clock_mode;
                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 10) {
                counterRetry += 1;
                await this.sleep(2000);
              }
            }
            this.$fire({
              text: pass
                ? this.$t('Successful')
                : this.$t('OperationFailed'),
              type: pass ? 'success' : 'error',
              timer: 3000,
            });
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingClockInMode = false;
      },

      async ApplyVerifySettings() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingVerifySettings = true;

        if (
          this.value_tabletSettings.score_for_valid_face != this.value_verifyThreshold
          || this.value_tabletSettings.anti_spoofing_score
          != this.value_antiSpoofingThreshold
          || this.value_tabletSettings.have_to_wear_face_mask
          != this.value_haveToWearFaceMask
          || this.value_tabletSettings.face_mask_enhancement
          != this.value_faceMaskEnhancement
          || this.value_tabletSettings.enable_id_card != this.value_enableIdCard
          || this.value_tabletSettings.enable_two_factor_authentication
          != this.value_enableTwoFactorAuthentication
          || this.value_tabletSettings.face_detection_threshold
          != this.value_faceDetectThreshold
        ) {
          this.value_tabletSettings.score_for_valid_face = parseFloat(
            this.value_verifyThreshold,
          );
          this.value_tabletSettings.anti_spoofing_score = parseFloat(
            this.value_antiSpoofingThreshold,
          );
          this.value_tabletSettings.face_detection_threshold = parseFloat(
            this.value_faceDetectThreshold,
          );
          this.value_tabletSettings.have_to_wear_face_mask = this.value_haveToWearFaceMask;
          this.value_tabletSettings.face_mask_enhancement = this.value_faceMaskEnhancement;
          this.value_tabletSettings.enable_id_card = this.value_enableIdCard;
          this.value_tabletSettings.enable_two_factor_authentication = this.value_enableTwoFactorAuthentication;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_verifyThreshold = this.value_tabletSettings.score_for_valid_face;
                this.value_faceDetectThreshold = this.value_tabletSettings.face_detection_threshold;
                this.value_antiSpoofingThreshold = this.value_tabletSettings.anti_spoofing_score;
                this.value_haveToWearFaceMask = this.value_tabletSettings.have_to_wear_face_mask;
                this.value_faceMaskEnhancement = this.value_tabletSettings.face_mask_enhancement;
                this.value_enableIdCard = this.value_tabletSettings.enable_id_card;
                this.value_enableTwoFactorAuthentication = this.value_tabletSettings.enable_two_factor_authentication;

                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 10) {
                counterRetry += 1;
                await this.sleep(2000);
              }
            }
            this.$fire({
              text: pass
                ? this.$t('Successful')
                : this.$t('OperationFailed'),
              type: pass ? 'success' : 'error',
              timer: 3000,
            });
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingVerifySettings = false;
      },
      async ApplyDisplaySettings() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingDisplaySettings = true;

        if (
          this.value_tabletSettings.show_profile_photo != this.value_showProfilePhoto
          || this.value_tabletSettings.show_verify_indication
          != this.value_showVerifyIndication
          || this.value_tabletSettings.display_verify_result_time
          != Number(this.value_displayVerifyResultTime)
          || this.value_tabletSettings.temperature_unit_celsius
          != this.value_temperatureUnitCelsius
        ) {
          this.value_tabletSettings.show_profile_photo = this.value_showProfilePhoto;
          this.value_tabletSettings.show_verify_indication = this.value_showVerifyIndication;
          this.value_tabletSettings.display_verify_result_time = Number(
            this.value_displayVerifyResultTime,
          );
          this.value_tabletSettings.temperature_unit_celsius = this.value_temperatureUnitCelsius;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_showProfilePhoto = this.value_tabletSettings.show_profile_photo;
                this.value_showVerifyIndication = this.value_tabletSettings.show_verify_indication;
                this.value_displayVerifyResultTime = this.value_tabletSettings.display_verify_result_time;
                this.value_temperatureUnitCelsius = this.value_tabletSettings.temperature_unit_celsius;

                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 10) {
                counterRetry += 1;
                await this.sleep(2000);
              }
            }
            this.$fire({
              text: pass
                ? this.$t('Successful')
                : this.$t('OperationFailed'),
              type: pass ? 'success' : 'error',
              timer: 3000,
            });
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingDisplaySettings = false;
      },
      async ApplyAlarmSettings() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingAlarmSettings = true;

        if (
          this.value_tabletSettings.audio_alarm_volume != this.value_alarmVolume
          || this.value_tabletSettings.high_temperature
          != this.value_highTemperatureThreshold_Celsius
        ) {
          this.value_tabletSettings.audio_alarm_volume = this.value_alarmVolume;
          this.value_tabletSettings.high_temperature = this.value_highTemperatureThreshold_Celsius;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_alarmVolume = this.value_tabletSettings.audio_alarm_volume;
                this.value_highTemperatureThreshold_Celsius = this.value_tabletSettings.high_temperature;
                this.value_highTemperatureThreshold_Fahrenheit = (this.value_highTemperatureThreshold_Celsius * 9) / 5 + 32;
                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 10) {
                counterRetry += 1;
                await this.sleep(2000);
              }
            }
            this.$fire({
              text: pass
                ? this.$t('Successful')
                : this.$t('OperationFailed'),
              type: pass ? 'success' : 'error',
              timer: 3000,
            });
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingAlarmSettings = false;
      },
      async ApplyTabletInterfaceLangurage() {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingTabletInterfaceLangurage = true;
        const applyRet = await this.$globalChangeLanguage({
          language: this.value_tabletInterfaceLangurage,
        });
        if (!applyRet.error) {
          let counterRetry = 0;
          let retry = true;
          let pass = false;
          while (retry) {
            const ret = await this.$globalFetchSupportedlanguagelist();
            if (!ret.error && ret.data) {
              const activeLang = ret.data.list.filter((l) => l.active);
              if (activeLang.length > 0) {
                this.value_tabletInterfaceLangurage = activeLang[0].language;
              } else this.value_tabletInterfaceLangurage = 'zh';

              retry = false;
              pass = true;
            } else if (counterRetry + 1 < 10) {
              counterRetry += 1;
              await this.sleep(2000);
            }
          }
          this.$fire({
            text: pass
              ? this.$t('Successful')
              : this.$t('OperationFailed'),
            type: pass ? 'success' : 'error',
            timer: 3000,
          });
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingTabletInterfaceLangurage = false;
      },
      async ApplySystemPassword() {
        let dataChange = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.flag_changingTabletSystemPassword = true;
        if (this.value_tabletSettings.system_password != this.value_tabletSystemPassword) {
          this.value_tabletSettings.system_password = this.value_tabletSystemPassword;
          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await this.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                this.value_tabletSettings = ret.data;
                this.value_tabletSystemPassword = this.value_tabletSettings.system_password;
                retry = false;
                pass = true;
              } else if (counterRetry + 1 < 10) {
                counterRetry += 1;
                await this.sleep(2000);
              }
            }
            this.$fire({
              text: pass
                ? this.$t('Successful')
                : this.$t('OperationFailed'),
              type: pass ? 'success' : 'error',
              timer: 3000,
            });
          }
        }
        if (this.obj_loading) this.obj_loading.hide();
        this.flag_changingTabletSystemPassword = false;
      },
      async applySystemSetting() {
        const payload = {
          db: {
            verified_maintain_duration: this.value_verified_maintain_duration,
            non_verified_maintain_duration: this.value_non_verified_maintain_duration,
            maintain_disk_space_in_gb: this.value_maintain_disk_space_in_gb,
          },
        };
        this.$globalSetSystemSettings(payload, (err) => {
          if (!err) {
            this.$fire({
              text: this.$t('Successful'),
              type: 'success',
              timer: 3000,
            });
          }
        });
      },
      async applySmtpSetting() {
        const payload = {
          secure: this.value_smtp_secure,
          from: this.value_smtp_from,
          user: this.value_smtp_user,
          pass: this.value_smtp_pass,
          host: this.value_smtp_host,
          port: this.value_smtp_port,
        };
        this.$globalSetSystemSettings({ smtp: payload }, (err) => {
          if (!err) {
            this.$fire({
              text: this.$t('Successful'),
              type: 'success',
              timer: 3000,
            });
          }
        });
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
      clickOnApplySystemSetting() {
        this.applySystemSetting();
      },
    },
  };
</script>