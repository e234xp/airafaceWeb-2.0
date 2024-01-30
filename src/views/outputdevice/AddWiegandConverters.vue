<template>
  <div id="wrapper">
    <div>
      <div class="h1">
        {{ $t("TitleWiegandConverter") }}
      </div>

      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[$t('WiegandStep1Name'), $t('WiegandStep3Name'), $t('Complete')]"
        icon-class="fa fa-check"
      />

      <div style="height: 35px" />
    </div>

    <CCol sm="12">
      <!-- Basic Form-->
      <CCard
        v-if="isOnStep(0)"
        style="height: 35rem"
      >
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>

      <!-- Settings Form-->
      <CCard
        v-else-if="isOnStep(1)"
        style="height: 35rem"
      >
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
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
          >
            {{ value_returnRouteName }}
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

import Step1Form from '@/modules/outputdevice/addwiegandconverts/Step1Form.vue';
import Step2Form from '@/modules/outputdevice/addwiegandconverts/Step2Form.vue';

import { getIsFieldPassedFunction } from '@/utils';

export default {
  name: 'AddWiegandConverters',
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

      // step setting
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

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
      const form = {
        name: await this.getDefaultName(),
        ip_address: '',
        port: -1,
        bits: 26,
      };

      return form;
    },

    async getDefaultName() {
      const {
        data: { total_length: totalLength, list: deviceList },
      } = await this.$globalFindWiegandConverters('', 0, 3000);

      let number = totalLength + 1;
      let name = `Wiegand-${number}`;
      // Check for duplicates, if found, increment the number and check again
      while (this.isDuplicateName(deviceList, name)) {
        number += 1;
        name = `Wiegand-${number}`;
      }

      return name;
    },

    isDuplicateName(deviceList, name) {
      return deviceList.some((device) => device.name === name);
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
            ...this.step1form,
            ...this.step2form,
          };

          const { data } = await this.create(parameter);

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

    // 送api 完成
    create(data) {
      return this.$globalCreateWiegandConverter(data);
    },

    nextButtonName(step) {
      switch (step) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('Next');
        case 2:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
  },
};
</script>
