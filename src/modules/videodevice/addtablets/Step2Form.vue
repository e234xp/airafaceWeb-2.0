<template>
  <div id="wrapper">
    <!-- Face access -->
    <CCard>
      <CCardHeader @click="flag_faceAccessVisiable=!flag_faceAccessVisiable">
        <span class="h3">{{ disp_faceAccessTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_faceAccessVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_faceAccessVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_recognitionThreshold }}
            </h5>
            <CInput
              size="lg"
              class="h5"
              v-model="localStep2form.verify_target_score"
              :invalid-feedback="$t('NoEmptyInRange').replace('$1', '0.0 ~ 1.0')"
              :is-valid="isFieldPassed('verify_target_score', localStep2form.verify_target_score)"
              required
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_faceCaptureInternal }}
            </h5>
            <CInput
              size="lg"
              class="h5"
              v-model="localStep2form.face_capture_interval"
              :invalid-feedback="$t('NoEmptyInRange').replace('$1', '100 ~ 1000')"
              :is-valid="isFieldPassed('face_capture_interval', localStep2form.face_capture_interval)"
              required
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_faceOverlapRatio }}
            </h5>
            <CInput
              size="lg"
              class="h5"
              v-model="localStep2form.face_overlap_ratio"
              :invalid-feedback="$t('NoEmptyInRange').replace('$1', '0.0 ~ 1.0')"
              :is-valid="isFieldPassed('face_overlap_ratio', localStep2form.face_overlap_ratio)"
              required
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_targetFaceSizeLength }}
            </h5>
            <CInput
              size="lg"
              class="h5"
              v-model="localStep2form.target_face_size_width"
              :invalid-feedback="disp_noEmptyInRange0to1000"
              :is-valid="isFieldPassed('target_face_size_width', localStep2form.target_face_size_width)"
              required
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Card Access -->
    <CCard>
      <CCardHeader @click="flag_cardAccessVisiable=!flag_cardAccessVisiable">
        <span class="h3">{{ disp_cardAccessTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_cardAccessVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_cardAccessVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableCardAccess }}
            </h5>
            <CSwitch
              size="lg"
              class="ml-0 mb-16"
              color="success"
              shape="pill"
              @update:checked="localStep2form.enable_id_card = !localStep2form.enable_id_card"
              :checked="localStep2form.enable_id_card"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_supportWiegandBits }}
            </h5>
            <CSelect
              size="lg"
              v-model="localStep2form.support_wiegand_bits"
              :placeholder="disp_placeholder"
              :options="param_cardAccessOptions"
              :disabled="!localStep2form.enable_id_card"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_allowedPersonnelGroups }}
            </h5>
            <multiselect
              placeholder=""
              :multiple="true"
              :hide-selected="true"
              :searchable="false"
              :select-label="disp_select"
              :selected-label="disp_selected"
              :deselect-label="disp_deselect"
              v-model="localStep2form.group_list_to_pass"
              :options="param_personnGroupsList"
              :disabled="!localStep2form.enable_id_card"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_twoFactor }}
            </h5>
            <CSelect
              size="lg"
              v-model="localStep2form.enable_two_factor_authentication"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
              :disabled="!localStep2form.enable_id_card"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_triggerRelay }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              v-model="localStep2form.enable_trigger_relay"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
              :disabled="!localStep2form.enable_id_card"
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_relayInternal }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.relay_delay"
              :disabled="!localStep2form.enable_id_card"
              :invalid-feedback="disp_noEmptyInRange0to5000"
              :is-valid="isFieldPassed('relay_delay', localStep2form.relay_delay)"
              required
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Temperature & Mask -->
    <CCard>
      <CCardHeader @click="flag_temperatureMaskVisiable=!flag_temperatureMaskVisiable">
        <span class="h3">{{ disp_temperatureMaskTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_temperatureMaskVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_temperatureMaskVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_temperatureUnit }}
            </h5>
            <CSelect
              size="lg"
              v-model="localStep2form.temperature_unit_celsius"
              :placeholder="disp_placeholder"
              :options="param_temperatureOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_threshold }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.high_temperature"
              :invalid-feedback="disp_noEmptyInRange30to50"
              :is-valid="isFieldPassed('high_temperature', localStep2form.high_temperature)"
              required
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enforceFaceMaskCheck }}
            </h5>
            <CSwitch
              size="lg"
              class="ml-0"
              color="success"
              shape="pill"
              @update:checked="localStep2form.have_to_wear_face_mask = !localStep2form.have_to_wear_face_mask"
              :checked="localStep2form.have_to_wear_face_mask"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Result Display -->
    <CCard>
      <CCardHeader @click="flag_resultDisplayVisiable=!flag_resultDisplayVisiable">
        <span class="h3">{{ disp_resultDisplayTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_resultDisplayVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_resultDisplayVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_displayName }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              v-model="localStep2form.enable_name_mask"
              :placeholder="disp_placeholder"
              :options="param_displayNameOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_displayProfilePhoto }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              v-model="localStep2form.show_profile_photo"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_strangerDisplayMessage }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.stranger_display_name"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_displayVerifyDuration }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.display_verify_result_time"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('display_verify_result_time', localStep2form.display_verify_result_time)"
              required
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_showVerifyResult }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              v-model="localStep2form.show_verify_indication"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.verify_indication_success_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessMessageText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.verify_indication_success_message_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationFailText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.verify_indication_fail_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationFailMessageText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.verify_indication_fail_message_text"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Clock setting -->
    <CCard>
      <CCardHeader @click="flag_clockSettingVisiable=!flag_clockSettingVisiable">
        <span class="h3">{{ disp_clockSettingTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_clockSettingVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_clockSettingVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableClockMode }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_clock_mode"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockInfoDataUp }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_info_data_1"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockInfoDataDown }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_info_data_2"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockInfoData3 }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_info_data_3"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableClockFunction1 }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_clock_function_1"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_function_name_1"
              :disabled="!localStep2form.enable_clock_function_1"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableClockFunction2 }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_clock_function_2"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_function_name_2"
              :disabled="!localStep2form.enable_clock_function_2"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableClockFunction3 }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_clock_function_3"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_function_name_3"
              :disabled="!localStep2form.enable_clock_function_3"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableClockFunction4 }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_clock_function_4"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_verifyIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_function_name_4"
              :disabled="!localStep2form.enable_clock_function_4"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockIndicationSuccessText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_indication_success_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockSuccessMessageText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_success_message_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockIndicationFailText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_indication_fail_text"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_clockFailMessageText }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.clock_fail_message_text"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- RTSP setting -->
    <CCard>
      <CCardHeader @click="flag_rtspSettingVisiable=!flag_rtspSettingVisiable">
        <span class="h3">{{ disp_RTSPSettingTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_rtspSettingVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_rtspSettingVisiable">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_enableRTSPCamera }}
            </h5>
            <CSelect
              class="mt-2"
              size="lg"
              value="1"
              v-model="localStep2form.enable_rtsp_camera"
              :placeholder="disp_placeholder"
              :options="param_showOptions"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_ipAddress }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.ip_address"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('ip_address', localStep2form.ip_address)"
              required
              :disabled="!localStep2form.enable_rtsp_camera"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_RTSPUserName }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              v-model="localStep2form.rtsp_username"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('rtsp_username', localStep2form.rtsp_username)"
              required
              :disabled="!localStep2form.enable_rtsp_camera"
            />
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ disp_RTSPPassWord }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              :type="flag_view_password ? 'text' : 'password'"
              v-model="localStep2form.rtsp_password"
            >
              <template #append-content>
                <CButton
                  @click="viewPassword"
                  style="padding: 0.375rem 0.375rem;"
                >
                  <CIcon
                    v-show="flag_view_password"
                    src="/img/eye-slash.png"
                  />
                  <CIcon
                    v-show="!flag_view_password"
                    src="/img/eye.png"
                  />
                </CButton>
              </template>
            </CInput>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from '@/i18n';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

export default {
  name: 'AddTabletsStep2Form',
  props: {
    step2form: {
      type: Object,
      default: () => {},
    },
    defaultValues: {
      type: Object,
      default: () => {},
    },
    isFieldPassed: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      localStep2form: { ...this.step2form },

      flag_view_password: false,

      param_personnGroupsList: [],
      param_personnGroupsValue: [],
      param_cardAccessOptions: [{ label: '26-bit', value: 26 }, { label: '34-bit', value: 34 }, { label: '64-bit', value: 64 }],
      param_temperatureOptions: [
        { label: i18n.formatter.format('Celsius'), value: true },
        { label: i18n.formatter.format('Fahrenheit'), value: false },
      ],
      param_showOptions: [
        { label: i18n.formatter.format('Yes'), value: true },
        { label: i18n.formatter.format('No'), value: false },
      ],
      param_displayNameOptions: [
        { label: i18n.formatter.format('PartialName'), value: true },
        { label: i18n.formatter.format('PersonName'), value: false },
      ],

      flag_faceAccessVisiable: true,
      flag_cardAccessVisiable: true,
      flag_temperatureMaskVisiable: false,
      flag_resultDisplayVisiable: false,
      flag_clockSettingVisiable: false,
      flag_rtspSettingVisiable: false,

      // disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),
      // disp_noEmptyInRange0to1: i18n.formatter.format('NoEmptyInRange').replace('$1', '0.0 ~ 1.0'),
      // disp_noEmptyInRange100to1000: i18n.formatter.format('NoEmptyInRange').replace('$1', '100 ~ 1000'),
      disp_noEmptyInRange0to1000: i18n.formatter.format('NoEmptyInRange').replace('$1', '0 ~ 1000'),
      disp_noEmptyInRange0to5000: i18n.formatter.format('NoEmptyInRange').replace('$1', '0 ~ 5000'),
      disp_noEmptyInRange30to50: i18n.formatter.format('NoEmptyInRange').replace('$1', '30 ~ 50'),

      disp_placeholder: i18n.formatter.format('placeholder'),
      disp_select: i18n.formatter.format('Select'),
      disp_selected: i18n.formatter.format('Selected'),
      disp_deselect: i18n.formatter.format('Deselect'),

      // Face access
      disp_faceAccessTitle: i18n.formatter.format('TabletsBasicTitleNameFaceAccess'),
      disp_recognitionThreshold: i18n.formatter.format('TabletsBasicCOlNameRecognitionThreshold'),
      disp_faceCaptureInternal: i18n.formatter.format('TabletsBasicCOlNameFaceCaptureInternal'),
      disp_faceOverlapRatio: i18n.formatter.format('TabletsBasicCOlNameFaceOverlapRatio'),
      disp_targetFaceSizeLength: i18n.formatter.format('TabletsBasicCOlNameTargetFaceSizeLength'),

      // Card Access
      disp_cardAccessTitle: i18n.formatter.format('TabletsAccessControlTitleNameCardAccess'),
      disp_enableCardAccess: i18n.formatter.format('TabletsAccessControlEnableCardAccess'),
      disp_supportWiegandBits: i18n.formatter.format('TabletsAccessControlSupportWiegandBits'),
      disp_allowedPersonnelGroups: i18n.formatter.format('TabletsAccessControlCOlNameAllowedPersonnelGroups'),
      disp_twoFactor: i18n.formatter.format('TabletsAccessCOlNameTwoFactor'),
      disp_triggerRelay: i18n.formatter.format('TabletsBasicCOlNameTriggerRelay'),
      disp_relayInternal: i18n.formatter.format('TabletsBasicCOlNameRelayInternal'),

      // Temperature & Mask
      disp_temperatureMaskTitle: i18n.formatter.format('TabletsAccessTitleNameTemperatureMask'),
      disp_temperatureUnit: i18n.formatter.format('TabletsAccessColNameTemperatureUnit'),
      disp_threshold: i18n.formatter.format('TabletsAccessColNameThreshold'),
      disp_enforceFaceMaskCheck: i18n.formatter.format('TabletsAccessColNameEnforceFaceMaskCheck'),

      // Result Display
      disp_resultDisplayTitle: i18n.formatter.format('TabletsAccessTitleNameResultDisplay'),
      disp_displayName: i18n.formatter.format('TabletsAccessColNameDisplayName'),
      disp_displayProfilePhoto: i18n.formatter.format('TabletsAccessColNameDisplayProfilePhoto'),
      disp_strangerDisplayMessage: i18n.formatter.format('TabletsAccessColNameStrangerDisplayMessage'),
      disp_displayVerifyDuration: i18n.formatter.format('TabletsAccessColNameDisplayVerifyDuration'),
      disp_showVerifyResult: i18n.formatter.format('TabletsAccessColNameShowVerifyResult'),
      disp_verifyIndicationSuccessText: i18n.formatter.format('TabletsAccessColNameVerifyIndicationSuccessText'),
      disp_verifyIndicationSuccessMessageText: i18n.formatter.format('TabletsAccessColNameVerifyIndicationSuccessMessageText'),
      disp_verifyIndicationFailText: i18n.formatter.format('TabletsAccessColNameVerifyIndicationFailText'),
      disp_verifyIndicationFailMessageText: i18n.formatter.format('TabletsAccessColNameVerifyIndicationFailMessageText'),

      // Clock setting
      disp_clockSettingTitle: i18n.formatter.format('TabletsAccessClockSettingTitle'),
      disp_enableClockMode: i18n.formatter.format('TabletsAccessColNameEnableClockMode'),
      disp_clockInfoDataUp: i18n.formatter.format('TabletsAccessColNameClockInfoData(Up)'),
      disp_clockInfoDataDown: i18n.formatter.format('TabletsAccessColNameClockInfoData(Down)'),
      disp_clockInfoData3: i18n.formatter.format('TabletsAccessColNameClockInfoData3'),
      disp_enableClockFunction1: i18n.formatter.format('TabletsAccessColNameEnableClockFunction1'),
      disp_enableClockFunction2: i18n.formatter.format('TabletsAccessColNameEnableClockFunction2'),
      disp_enableClockFunction3: i18n.formatter.format('TabletsAccessColNameEnableClockFunction3'),
      disp_enableClockFunction4: i18n.formatter.format('TabletsAccessColNameEnableClockFunction4'),
      disp_clockIndicationSuccessText: i18n.formatter.format('TabletsAccessColNameClockIndicationSuccessText'),
      disp_clockSuccessMessageText: i18n.formatter.format('TabletsAccessColNameClockSuccessMessageText'),
      disp_clockIndicationFailText: i18n.formatter.format('TabletsAccessColNameClockIndicationFailText'),
      disp_clockFailMessageText: i18n.formatter.format('TabletsAccessColNameClockFailMessageText'),

      // RTSP setting
      disp_RTSPSettingTitle: i18n.formatter.format('TabletsAccessTitleNameRTSPSetting'),
      disp_enableRTSPCamera: i18n.formatter.format('TabletsAccessColNameEnableRTSPCamera'),
      disp_ipAddress: i18n.formatter.format('TabletsAccessColNameIpAddress'),
      disp_RTSPUserName: i18n.formatter.format('TabletsAccessColNameRTSPUserName'),
      disp_RTSPPassWord: i18n.formatter.format('TabletsAccessColNameRTSPPassWord'),
    };
  },
  components: {
    multiselect: Multiselect,
  },
  watch: {
    localStep2form: {
      handler(newValue) {
        const self = this;
        const localValue = { ...newValue };

        if (self.param_personnGroupsValue.length >= 1) {
          if (localValue.group_list_to_pass.length >= 1) {
            localValue.group_list_to_pass_uuids = [];
            localValue.group_list_to_pass_uuids = localValue.group_list_to_pass.map((item) => {
              const uuid = self.param_personnGroupsValue.find((ii) => ii.label === item);
              return uuid.value;
            });
          } else {
            localValue.group_list_to_pass = [];
            localValue.group_list_to_pass = localValue.group_list_to_pass_uuids.map((item) => {
              const uuid = self.param_personnGroupsValue.find((ii) => ii.value === item);
              return uuid.label;
            });
          }
        }
        this.$emit('updateStep2form', { ...localValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step2form).includes(key)) return;
          this.localStep2form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },

  async mounted() {
    const self = this;
    const ret = await self.$globalGetGroupList();
    const {
      group_list: dataList,
      error,
    } = ret;

    if (!error) {
      self.param_personnGroupsList = [];
      self.param_personnGroupsValue = [];
      for (let i = 0; i < dataList.length; i += 1) {
        self.param_personnGroupsValue.push({ value: dataList[i].uuid, label: dataList[i].name });
        self.param_personnGroupsList.push(dataList[i].name);

        if (self.localStep2form.group_list_to_pass_uuids.indexOf(dataList[i].uuid) >= 0) {
          self.localStep2form.group_list_to_pass.push(dataList[i].name);
        }
      }
    }
  },

  methods: {
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },
  },
};
</script>

<style scoped>
  .row {
    margin-top: 4px;
    margin-bottom: 4px;
  }
</style>
