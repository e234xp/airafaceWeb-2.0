<template>
  <div id="wrapper">
    <div>
      <div class="h1">
        {{ $t('VideoDeviceBasic') }}
      </div>
      <stepprogress
        class="w-step-progress-4"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[
          $t('VideoDeviceBasic'),
          $t('VideoDeviceROI'),
          $t('VideoFaceCapture'),
          $t('VideoFaceMerge'),
          $t('Complete'),
        ]"
        icon-class="fa fa-check"
      />

      <div style="height: 35px" />
    </div>

    <!-- 項目 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>
      <!-- ROI -->
      <CCard v-else-if="isOnStep(1)">
        <CCardBody>
          <Step2Form
            :step1form="step1form"
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
      <CCard v-else-if="isOnStep(2)">
        <CCardBody>
          <Step3Form
            :step3form="step3form"
            @updateStep3form="updateStep3form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>
      <!-- FaceMerge Form -->
      <CCard v-else-if="isOnStep(3)">
        <CCardBody>
          <Step4Form
            :step4form="step4form"
            @updateStep4form="updateStep4form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>

      <CCard
        style="height: 34rem;"
        v-else-if="isOnStep(4)"
      >
        <CCardBody style="display: flex; justify-content: center; align-items: center;">
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('Complete') }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- 按鈕的Col -->
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2 || flag_currentSetp == 3">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary mb-3"
            size="lg"
            @click="handleNext()"
            :disabled="!isStepPassed(flag_currentSetp)"
          >
            {{ nextButtonName(flag_currentSetp) }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>

<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Step1Form from '@/modules/videodevice/modifycamera/Step1Form.vue';
import Step2Form from '@/modules/videodevice/modifycamera/Step2Form.vue';
import Step3Form from '@/modules/videodevice/modifycamera/Step3Form.vue';
import Step4Form from '@/modules/videodevice/modifycamera/Step4Form.vue';
import { getIsFieldPassedFunction } from '@/utils';

export default {
  name: 'ModifyCameras',
  data() {
    return {
      param_cardStyle: 'height: 35rem;',

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : '',
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : '',

      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

      uuid: '',
      step1form: {
        name: '',
        divice_groups: [],
        divice_group_uuids: [],
        stream_type: '',
        ip_address: '',
        port: null,
        user: '',
        pass: '',
        connection_info: '',
      },
      step2form: {
        roi: [{}, {}, {}, {}, {}],
      },
      step3form: {
        capture_interval: null,
        target_score: null,
        face_min_length: null,
        antispoofing_score: 0,
        april_tag_type: '',
        face_detection_score: 0.8,
      },
      step4form: {
        verified_merge_setting: {
          enable: false,
          merge_duration: 5000,
          non_action: true,
        },
        non_verified_merge_setting: {
          enable: false,
          merge_score: 0.6,
          merge_duration: 5000,
          non_action: true,
        },
      },
      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form,
    Step2Form,
    Step3Form,
    Step4Form,
  },
  async created() {
    this.defaultValues = await this.getDefaultValues();
    this.defaultValues = { ...this.defaultValues, ...this.settingItem };

    this.uuid = this.defaultValues.uuid;
    this.defaultValues.divice_group_uuids = this.defaultValues.divice_groups;
    this.defaultValues.divice_groups = [];

    this.defaultValues.group_list_to_pass_uuids = this.defaultValues.group_list_to_pass;
    this.defaultValues.group_list_to_pass = [];

    this.isFormPassed(this.step1form);
  },

  methods: {
    // 處理資料傳遞
    updateStep1form(newValue) {
      this.step1form = { ...newValue };

      if (this.step1form.stream_type === 'sdp') {
        this.step1form.ip_address = '1.1.1.1';
      }

      if (!this.step1form.user) {
        this.step1form.user = '0';
      }
    },
    updateStep2form(newValue) {
      this.step2form = { ...newValue };
    },
    updateStep3form(newValue) {
      this.step3form = { ...newValue };
    },
    updateStep4form(newValue) {
      this.step4form = { ...newValue };
    },

    async getDefaultValues() {
      return this.$route.params.item;
    },

    // 是否可以按下一步
    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.isFormPassed(this.step1form);
        }
        case 1: {
          // todo ROI
          return true;
        }
        case 2: {
          return this.isFormPassed(this.step3form);
        }
        case 3: {
          return true;
        }
        default:
          return true;
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(
        ([key, value]) => {
          let ret = false;

          if (form.stream_type === 'sdp') {
            if (key === 'ip_address') ret = true;
            else if (key === 'port') ret = true;
            else ret = this.isFieldPassed(key, value);
          } else {
            ret = this.isFieldPassed(key, value);
          }

          return ret;
        },
      );
    },

    isFieldPassed: getIsFieldPassedFunction({
      customValidators: {
        target_score: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 1;
        },
        captureInterval: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 100 && value <= 1000;
        },
        antispoofing_score: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 1;
        },
      },
      rules: {
        name: 'nonEmpty',
        stream_type: 'nonEmpty',
        ip_address: 'nonEmpty',
        port: 'port',
        // user: 'nonEmpty',
        // pass: 'password',
        connection_info: 'nonEmpty',
        target_score: 'target_score',
        face_min_length: 'passitiveInt',
        capture_interval: 'captureInterval',
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
        case 0:
        case 1:
        case 2: {
          this.flag_currentSetp += 1;
          break;
        }
        case 3: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });
          const parameter = {
            uuid: this.uuid,
            data: {
              ...this.step1form,
              ...this.step2form,
              ...this.step3form,
              ...this.step4form,
            },
          };
          parameter.data.divice_groups = this.step1form.divice_group_uuids;

          const { data } = await this.modify(parameter);

          this.obj_loading.hide();
          if (data && data.message === 'ok') {
            this.flag_currentSetp += 1;
          } else {
            this.$fire({
              text: this.$t('Failed'),
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

    // 送 api 完成
    modify(data) {
      return this.$globalModifyCameras(data);
    },

    nextButtonName(step) {
      switch (step) {
        case 0:
        case 1:
        case 2:
        case 3:
          return this.$t('Next');
        case 4:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
  },
};
</script>
