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

      <CCard
        style="height: 34rem;"
        v-else-if="isOnStep(1)"
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
    const self = this;
    self.defaultValues = await self.getDefaultValues();

    self.isFormPassed(self.step1form);
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
      };
      const rule = rules[key];
      if (!rule) return true;
      switch (rule) {
        case 'nonEmpty': {
          let ret = !!value;

          switch (key) {
            case 'name' :
              if (value.replace(/\s/g, '').length === 0) {
                ret = false;
              } else if (value.replace(/[^\+\)\(\*\&\^\%\$\#\@\!\~\|\}\{\"\:\?\>\<\,\.\/\'\;\\\]\[\=\`\]\]]/g, '').length === 0) {
                ret = true;
              } else {
                ret = false;
              }
              break;
            default:
              ret = !!value;
              break;
          }

          return ret;
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
