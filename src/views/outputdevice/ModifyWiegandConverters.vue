<template>
  <div id="wrapper">
    <div>
      <div class="h1">{{ $t("TitleWiegandConverter") }}</div>

      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[disp_step1, disp_step3, disp_complete]"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)" style="height: 35rem">
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard>

      <!-- Settings Form-->
      <CCard v-else-if="isOnStep(1)" style="height: 35rem">
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
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
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div
          v-if="
            flag_currentSetp == 1
          "
        >
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

import Step1Form from '@/modules/outputdevice/modifywiegand/Step1Form.vue';
import Step2Form from '@/modules/outputdevice/modifywiegand/Step2Form.vue';

import { getIsFieldPassedFunction } from '@/utils';

export default {
  name: 'ModifyCameras',
  components: {
    stepprogress: StepProgress,
    Step1Form,
    Step2Form,
  },
  data() {
    return {
      param_cardStyle: 'height: 35rem;',

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : '',
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : '',

      // /*Basic title  */
      disp_headertitle: i18n.formatter.format('VideoDeviceBasic'),

      // step setting
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

      // /**Step 1 2 3 */
      disp_step1: i18n.formatter.format('WiegandStep1Name'),
      disp_step2: i18n.formatter.format('WiegandStep2Name'),
      disp_step3: i18n.formatter.format('WiegandStep3Name'),
      disp_complete: i18n.formatter.format('Complete'),

      // /**btn */
      // disp_complete: i18n.formatter.format('Complete'),
      disp_previous: i18n.formatter.format('Previous'),
      disp_next: i18n.formatter.format('Next'),

      step1form: {
        name: '',
        divice_groups: [],
        ip_address: '',
        port: null,
      },

      step2form: {
        bits: 26,
        index: 1,
        syscode: 1,
        special_card_number: '',
      },

      defaultValues: {},
    };
  },

  async created() {
    this.defaultValues = await this.getDefaultValues();
    this.uuid = this.defaultValues.uuid;
  },

  methods: {
    // 處理資料傳遞
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
    },
    updateStep2form(newValue) {
      this.step2form = { ...newValue };
    },

    async getDefaultValues() {
      console.log(this.$route.params.item, 'h0');
      return this.$route.params.item;
    },

    // 是否可以按下一步
    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.isFormPassed(this.step1form);
        }

        case 1: {
          return this.isFormPassed(this.step2form);
        }

        case 2:
        default: {
          return true;
        }
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(([key, value]) => this.isFieldPassed(key, value));
    },

    isFieldPassed: getIsFieldPassedFunction({
      customValidators: {
        syscode: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 255;
        },
        index: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 100;
        },
        // specialCardNumber: (value) => /^\d+$/.test(value),
      },
      rules: {
        name: 'nonEmpty',
        ip_address: 'nonEmpty',
        port: 'port',
        index: 'index',
        syscode: 'syscode',
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

      this.$router.push({ name: this.value_returnRoutePath });
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

          const parameter = {
            uuid: this.uuid,
            data: {
              ...this.step1form,
              ...this.step2form,
            },
          };

          const { data } = await this.modify(parameter);

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
    modify(data) {
      return this.$globalModifyWiegandConverter(data);
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
