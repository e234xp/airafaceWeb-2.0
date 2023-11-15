<template>
  <div id="wrapper">
    <div>
      <div class="h1">{{ disp_headertitle }}</div>

      <stepprogress class="w-step-progress-2" :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
        :passive-color="param_passiveColor" :current-step="flag_currentSetp" :line-thickness="param_lineThickness"
        :steps="[disp_step1, disp_complete]" icon-class="fa fa-check">
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <CCol sm="12">
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form :step1form="step1form" @updateStep1form="updateStep1form" :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues" />
        </CCardBody>
      </CCard>

    </CCol>

    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="handlePrev">{{ value_returnRouteName }}
          </CButton>
        </div>
        <!-- <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="handlePrev">{{ disp_previous }}</CButton>
        </div> -->
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary mb-3" size="lg" @click="handleNext()"
            :disabled="!isStepPassed(flag_currentSetp)">{{ nextButtonName(flag_currentSetp) }}
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

import Step1Form from '@/modules/videodevice/addvideodevicegroups/Step1Form.vue';

export default {
  name: 'AddOutputDeviceGroups',

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
      disp_step2: i18n.formatter.format('VideoDeviceConnection'),
      disp_step3: i18n.formatter.format('VideoDeviceDigitalOutPut1'),

      disp_complete: i18n.formatter.format('Complete'),
      disp_previous: i18n.formatter.format('Previous'),
      disp_next: i18n.formatter.format('Next'),

      step1form: {
        name: '',
      },

      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form,

  },
  async created() {
    this.defaultValues = await this.getDefaultValues();
  },

  methods: {
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
    },

    async getDefaultValues() {
      const form = {
        name: await this.getDefaultName(),
      };

      return form;
    },

    async getDefaultName() {
      const {
        data: { totalLength, result: videoGroupList },
      } = await this.$globalFindVideoDeviceGroups('', 0, 3000);

      let number = totalLength + 1;
      let name = `Video Group-${number}`;
      while (this.isDuplicateName(videoGroupList, name)) {
        number += 1;
        name = `Video Group-${number}`;
      }

      return name;
    },

    isDuplicateName(videoGroupList, name) {
      return videoGroupList.some((videoGroup) => videoGroup.name === name);
    },

    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.isFormPassed(this.step1form);
        }
        case 1:
        default: {
          return true;
        }
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(([key, value]) => this.isFieldPassed(key, value));
    },

    isFieldPassed(key, value) {
      const rules = {
        name: 'nonEmpty',
        divice_groups: 'nonEmpty',
        stream_type: 'nonEmpty',
        ip_address: 'nonEmpty',
        port: 'port',
        user: 'nonEmpty',
        pass: 'password',
        connection_info: 'nonEmpty',
        target_score: 'target_score',
        face_min_length: 'passitiveInt',
        capture_interval: 'captureInterval',
      };
      const rule = rules[key];
      if (!rule) return true;
      switch (rule) {
        case 'nonEmpty': {
          return !!value;
        }
        case 'port': {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && number >= 1 && number <= 65535;
        }
        case 'password': {
          return !!value;
        }
        case 'passitiveInt': {
          return /^\d+$/.test(value);
        }
        case 'target_score': {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 1;
        }
        case 'captureInterval': {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 100 && value <= 1000;
        }
        default:
          return true;
      }
    },

    isOnStep(step) {
      return this.flag_currentSetp === step;
    },

    handlePrev() {
      if (this.flag_currentSetp > 0) {
        this.flag_currentSetp -= 1;
        return;
      }

      if (this.value_returnRoutePath.length === 0) return;

      this.$router.push({ name: this.value_returnRoutePath });
    },

    async handleNext() {
      switch (this.flag_currentSetp) {
        case 0: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });

          const parameter = {
            ...this.step1form,
            camera_uuid_list: [],
            tablet_uuid_list: [],
          };

          const { data } = await this.create(parameter);

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

    create(data) {
      return this.$globalCreateVideoDeviceGroup(data);
    },

    nextButtonName(step) {
      switch (step) {
        case 1:
          return this.disp_complete;
        case 0:
        default:
          return this.disp_next;
      }
    },
  },
};
</script>
