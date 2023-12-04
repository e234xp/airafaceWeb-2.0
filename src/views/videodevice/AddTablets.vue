<template>
  <div id="wrapper">
    <div class="tablet">
      <div class="h1">{{ disp_headertitle }}</div>

      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[
          disp_step1,
          disp_step2,
          disp_complete,
        ]"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <!-- 項目 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard>

      <!-- ROI -->
      <CCard v-else-if="isOnStep(1)">
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
      <!-- <CCard v-else-if="isOnStep(2)">
        <CCardBody>
          <Step3Form
            :step3form="step3form"
            @updateStep3form="updateStep3form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard> -->
    </CCol>

    <!-- 按鈕的Col -->
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton
            class="btn btn-primary mb-3"
            size="lg"
            @click="handleNext()"
            :disabled="!isStepPassed(flag_currentSetp)"
            >{{ nextButtonName(flag_currentSetp) }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>

<script>
import i18n from '@/i18n';

import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Step1Form from '@/modules/videodevice/addtablets/Step1Form.vue';
import Step2Form from '@/modules/videodevice/addtablets/Step2Form.vue';

import { getIsFieldPassedFunction } from '@/utils';

export default {
  name: 'AddTablets',
  data() {
    return {
      param_cardStyle: 'height: 35rem;',

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : '',
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : '',

      disp_headertitle: i18n.formatter.format('VideoDeviceBasic'),

      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

      disp_step1: i18n.formatter.format('VideoDeviceBasic'),
      disp_step2: i18n.formatter.format('TabletStepAccessControl'),
      disp_complete: i18n.formatter.format('Complete'),

      disp_previous: i18n.formatter.format('Previous'),
      disp_next: i18n.formatter.format('Next'),

      // default value i18n
      i18nYes: i18n.formatter.format('TabletsAccessDefaultYes'),
      i18nNo: i18n.formatter.format('TabletsAccessDefaultNo'),
      i18nWelcome: i18n.formatter.format('TabletsAccessDefaultWelcome'),
      i18nIdentifyS: i18n.formatter.format('TabletsAccessDefaultIdentifyS'),
      i18nIdentifySM: i18n.formatter.format('TabletsAccessDefaultIdentifySM'),
      i18nIdentifyF: i18n.formatter.format('TabletsAccessDefaultIdentifyF'),
      i18nIdentifyFM: i18n.formatter.format('TabletsAccessDefaultIdentifyFM'),
      i18nClockInfoDataUp: i18n.formatter.format('TabletsAccessDefaultClockInfoDataUp'),
      i18nClockInfoDataDown: i18n.formatter.format('TabletsAccessDefaultClockInfoDataDown'),
      i18nClockInfoData3n: i18n.formatter.format('TabletsAccessDefaultClockInfoData3n'),
      i18nClockText1: i18n.formatter.format('TabletsAccessDefaultClockText1'),
      i18nClockText2: i18n.formatter.format('TabletsAccessDefaultClockText2'),
      i18nClockText3: i18n.formatter.format('TabletsAccessDefaultClockText3'),
      i18nClockText4: i18n.formatter.format('TabletsAccessDefaultClockText4'),
      i18nClockText5: i18n.formatter.format('TabletsAccessDefaultClockSuccess'),
      i18nClockText6: i18n.formatter.format('TabletsAccessDefaultClockText5'),

      uuid: '',
      step1form: {
        name: '',
        identity: '',
        divice_groups: [],
        divice_group_uuids: [],
        device_uuid: '',
      },

      step2form: {
        // Access
        verify_target_score: 0.9,
        face_capture_interval: 500,
        face_overlap_ratio: 0.5,
        target_face_size_height: 80,
        target_face_size_width: 80,

        // Card
        enable_id_card: true,
        support_wiegand_bits: 34,
        group_list_to_pass: [],
        group_list_to_pass_uuids: [],
        enable_trigger_relay: false,
        relay_delay: 3000,
        enable_two_factor_authentication: false,

        // Temp
        temperature_unit_celsius: true,
        high_temperature: 37.5,
        have_to_wear_face_mask: false,

        // Result  display date
        enable_name_mask: false,
        show_profile_photo: true,
        stranger_display_name: '',
        display_verify_result_time: 2000,
        show_verify_indication: false,

        verify_indication_success_text: '',
        verify_indication_success_message_text: '',
        verify_indication_fail_text: '',
        verify_indication_fail_message_text: '',

        // clock setting
        enable_clock_mode: false,
        clock_info_data_1: '',
        clock_info_data_2: '',
        clock_info_data_3: '',
        enable_clock_function_1: true,
        enable_clock_function_2: true,
        enable_clock_function_3: false,
        enable_clock_function_4: false,
        clock_function_name_1: '',
        clock_function_name_2: '',
        clock_function_name_3: '',
        clock_function_name_4: '',
        clock_indication_success_text: '',
        clock_success_message_text: '',
        clock_indication_fail_text: '',
        clock_fail_message_text: '',

        // RTSP data
        enable_rtsp_camera: true,
        ip_address: '',
        rtsp_username: '',
        rtsp_password: '',
      },
      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form,
    Step2Form,
  },
  async created() {
    const self = this;

    self.defaultValues = await self.getDefaultValues();
    self.defaultValues = { ...self.defaultValues, ...self.settingItem };

    self.isFormPassed(self.step1form);
  },

  methods: {
    // 處理資料傳遞
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
      this.isFormPassed(this.step1form);
    },
    updateStep2form(newValue) {
      this.step2form = { ...newValue };
      this.isFormPassed(this.step2form);
    },

    async getDefaultValues() {
      const ident = await this.getDefaultName();

      const form = {
        name: ident,
        identity: ident,

        // result display
        stranger_display_name: this.i18nWelcome,

        verify_indication_success_text: this.i18nIdentifyS,
        verify_indication_success_message_text: this.i18nIdentifySM,
        verify_indication_fail_text: this.i18nIdentifyF,
        verify_indication_fail_message_text: this.i18nIdentifyFM,

        // clock df
        enable_clock_mode: false,
        clock_info_data_1: this.i18nClockInfoDataUp,
        clock_info_data_2: this.i18nClockInfoDataDown,
        clock_info_data_3: this.i18nClockInfoData3n,
        enable_clock_function_1: true,
        enable_clock_function_2: true,
        enable_clock_function_3: false,
        enable_clock_function_4: false,
        clock_function_name_1: this.i18nClockText1,
        clock_function_name_2: this.i18nClockText2,
        clock_function_name_3: this.i18nClockText3,
        clock_function_name_4: this.i18nClockText4,
        clock_indication_success_text: this.i18nIdentifyS,
        clock_success_message_text: this.i18nClockText5,
        clock_indication_fail_text: this.i18nIdentifyF,
        clock_fail_message_text: this.i18nClockText6,

        ip_address: '192.168.10.48:8554',
        rtsp_username: 'root',
        rtsp_password: '12345',
      };

      console.log('GO!,', form);

      return form;
    },

    async getDefaultName() {
      const {
        data: { total_length: totalLength, list: cameraList },
      } = await this.$globalGetTabletList('', 0, 3000);

      let number = totalLength + 1;
      let name = `Tablet-${number.toString().padStart(2, '0')}`;
      // Check for duplicates, if found, increment the number and check again
      while (this.isDuplicateName(cameraList, name)) {
        number += 1;
        name = `Tablet-${number.toString().padStart(2, '0')}`;
      }

      return name;
    },

    isDuplicateName(cameraList, name) {
      if (cameraList) {
        return cameraList.some((camera) => camera.name === name);
      }

      return false;
    },

    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.isFormPassed(this.step1form);
        }
        case 1:
        default: {
          return this.isFormPassed(this.step2form);
        }
      }
    },

    isFormPassed(form) {
      const ret = Object.entries(form).every(([key, value]) => this.isFieldPassed(key, value));
      return ret;
    },

    isFieldPassed: getIsFieldPassedFunction({
      customValidators: {
        verify0to1: (value) => {
          const pattern = /^(-?\d+)(\.\d+)?$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseFloat(value, 10);
          return number >= 0 && number <= 1;
        },
        verify30to50: (value) => {
          const pattern = /^(-?\d+)(\.\d+)?$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseFloat(value, 10);
          return number >= 30 && number <= 50;
        },
        face_capture_interval: (value) => {
          const pattern = /^[0-9]+$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseInt(value, 10);
          return number >= 100 && number <= 1000;
        },
        number0to1000: (value) => {
          const pattern = /^[0-9]+$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseInt(value, 10);
          return number >= 0 && number <= 1000;
        },
        number0to5000: (value) => {
          const pattern = /^[0-9]+$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseInt(value, 10);
          return number >= 0 && number <= 5000;
        },
        display_verify_result_time: (value) => {
          const pattern = /^[0-9]+$/;
          if (!pattern.test(value)) {
            return false;
          }

          const number = parseInt(value, 10);
          return number >= 0 && number <= 10000;
        },
      },
      rules: {
        name: 'nonEmpty',
        identity: 'nonEmpty',
        verify_target_score: 'verify0to1',
        face_capture_interval: 'face_capture_interval',
        face_overlap_ratio: 'verify0to1',
        target_face_size_width: 'number0to1000',
        display_verify_result_time: 'display_verify_result_time',
        relay_delay: 'number0to5000',
        high_temperature: 'verify30to50',
        ip_address: 'nonEmpty',
        rtsp_username: 'nonEmpty',
      },
    }),

    // 決定現在顯示哪一個步驟
    isOnStep(step) {
      return this.flag_currentSetp === step;
    },

    // 上一步按鈕
    handlePrev() {
      if (this.flag_currentSetp > 0) {
        this.flag_currentSetp -= 1;
        return;
      }

      if (this.value_returnRoutePath.length === 0) return;

      this.$router.go(-1);
      // this.$router.push({ name: this.value_returnRoutePath });
    },

    async handleNext() {
      switch (this.flag_currentSetp) {
        case 0: {
          this.flag_currentSetp += 1;

          break;
        }

        case 1: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });

          const postData = {
            cameraOff: true,
            code: this.step1form.device_uuid,
            identity: this.step1form.identity,
            name: this.step1form.name,
            divice_groups: this.step1form.divice_group_uuids,
            description: '',

            verify_target_score: this.step2form.verify_target_score,
            face_capture_interval: this.step2form.face_capture_interval,
            face_overlap_ratio: this.step2form.face_overlap_ratio,
            target_face_size_height: this.step2form.target_face_size_height,
            target_face_size_width: this.step2form.target_face_size_width,

            enable_id_card: this.step2form.enable_id_card,
            support_wiegand_bits: this.step2form.support_wiegand_bits,
            group_list_to_pass: this.step2form.group_list_to_pass_uuids,
            enable_trigger_relay: this.step2form.enable_trigger_relay,
            relay_delay: this.step2form.relay_delay,
            relay_end_power: 0,
            relay_start_power: 1,
            enable_two_factor_authentication: this.step2form.enable_two_factor_authentication,

            temperature_unit_celsius: this.step2form.temperature_unit_celsius,
            high_temperature: this.step2form.high_temperature,
            have_to_wear_face_mask: this.step2form.have_to_wear_face_mask,

            enable_name_mask: this.step2form.enable_name_mask,
            show_profile_photo: this.step2form.show_profile_photo,
            stranger_display_name: this.step2form.stranger_display_name,
            display_verify_result_time: this.step2form.display_verify_result_time,
            show_verify_indication: this.step2form.show_verify_indication,

            verify_indication_success_text: this.step2form.verify_indication_success_text,
            verify_indication_success_message_text: this.step2form.verify_indication_success_message_text,
            verify_indication_fail_text: this.step2form.verify_indication_fail_text,
            verify_indication_fail_message_text: this.step2form.verify_indication_fail_message_text,

            enable_clock_mode: this.step2form.enable_clock_mode,
            clock_info_data_1: this.step2form.clock_info_data_1,
            clock_info_data_2: this.step2form.clock_info_data_2,
            clock_info_data_3: this.step2form.clock_info_data_3,
            enable_clock_function_1: this.step2form.enable_clock_function_1,
            enable_clock_function_2: this.step2form.enable_clock_function_2,
            enable_clock_function_3: this.step2form.enable_clock_function_3,
            enable_clock_function_4: this.step2form.enable_clock_function_4,
            clock_function_name_1: this.step2form.clock_function_name_1,
            clock_function_name_2: this.step2form.clock_function_name_2,
            clock_function_name_3: this.step2form.clock_function_name_3,
            clock_function_name_4: this.step2form.clock_function_name_4,
            clock_indication_success_text: this.step2form.clock_indication_success_text,
            clock_success_message_text: this.step2form.clock_success_message_text,
            clock_indication_fail_text: this.step2form.clock_indication_fail_text,
            clock_fail_message_text: this.step2form.clock_fail_message_text,

            enable_rtsp_camera: this.step2form.enable_rtsp_camera,
            ip_address: this.step2form.ip_address,
            rtsp_username: this.step2form.rtsp_username,
            rtsp_password: this.step2form.rtsp_password,

            contact_tracing_qr_code: '',
            enable_contact_tracing_qr_code: false,
            enable_high_temperature_sound_alert: true,
            enable_high_temperature_trigger_relay: false,
            enable_pos_intergration: false,
            health_statement: false,
            high_temperature_alert_text: '溫度過高請勿進入',
            high_temperature_no_pass: true,
            high_temperature_trigger_relay_delay: 3000,
            high_temperature_trigger_relay_end_power: 0,
            high_temperature_trigger_relay_start_power: 1,
            indicator_message: '請露出額頭以便測量體溫',
            low_temperature: 34,
            low_temperature_alert_text: '溫度過低, 請露出額頭測量',
            pos_brand: '',
            qr_code_id: '',
            temperature_detection_is_must: true,
          };

          console.log('postData', postData);

          const { data } = await this.create(postData);

          this.obj_loading.hide();
          if (data && data.message === 'ok') {
            this.flag_currentSetp += 1;
          } else {
            this.$fire({
              text: i18n.formatter.format('Failed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }

          break;
        }

        default: {
          this.$router.push({ name: this.value_returnRoutePath });

          break;
        }
      }
    },

    // 送api 完成
    create(data) {
      return this.$globalCreateTablets(data);
    },

    nextButtonName(step) {
      switch (step) {
        case 0:
          return this.disp_next;
        case 1:
          return this.disp_next;
        case 2:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
  },
};
</script>
