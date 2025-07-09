<template>
  <div id="wrapper">
    <div>
      <!-- <div class="h1">{{ $t('VideoDeviceBasic') }}</div> -->
      <div class="h1">
        {{ $t('TitleIOBox') }}
      </div>

      <stepprogress class="w-step-progress-3" :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
        :passive-color="param_passiveColor" :current-step="flag_currentSetp" :line-thickness="param_lineThickness"
        :steps="[$t('VideoDeviceBasic'), $t('VideoDeviceDigitalOutPut'), $t('Complete')]" icon-class="fa fa-check" />

      <div style="height: 35px" />
    </div>

    <!-- Step1 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form :step1form="step1form" @updateStep1form="updateStep1form" :is-field-passed="isFieldPassed"
            :default-values="defaultValues" />
        </CCardBody>
      </CCard>

      <!-- Step2 -->
      <CCard v-else-if="isOnStep(1)">
        <CCardBody>
          <Step2Form :step2form="step2form" @updateStep2form="updateStep2form" :is-field-passed="isFieldPassed"
            :default-values="defaultValues" />
        </CCardBody>
      </CCard>
    </CCol>

    <!-- 按鈕的Col -->
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="handlePrev">
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="handlePrev">
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton class="btn btn-primary mb-3" size="lg" @click="handleNext()"
            :disabled="!isStepPassed(flag_currentSetp)">
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

  import Step1Form from '@/modules/outputdevice/addioboxes/Step1Form.vue';
  import Step2Form from '@/modules/outputdevice/addioboxes/Step2Form.vue';
  import { getIsFieldPassedFunction } from '@/utils';

  export default {
    name: 'AddIOboxs',

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
          brand: '',
          model: '',
          name: '',
          divice_groups: [],
          ip_address: '',
          port: null,
          username: '',
          password: '',
        },

        step2form: [
          {
            no: 1,
            name: 'Do 1',
            enable: false,
            default: false,
            trigger: true,
            delay: 3,
          },
          {
            no: 2,
            name: 'Do 2',
            enable: false,
            default: false,
            trigger: true,
            delay: 3,
          },
        ],

        defaultValues: {},
      };
    },
    components: {
      stepprogress: StepProgress,
      Step1Form,
      Step2Form,
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
          brand: 'airaIO Box',
          model: 'TCP-KP-C2',

          ip_address: '',
          port: -1,
          username: '',
          password: '',

          default: false,
          trigger: true,
          delay: 3,
        };

        return form;
      },

      async getDefaultName() {
        const {
          data: { total_length: totalLength, list: IOboxList },
        } = await this.$globalFindIoBoxes('', 0, 3000);

        let number = totalLength + 1;
        let name = `IO Box-${number}`;
        // Check for duplicates, if found, increment the number and check again
        while (this.isDuplicateName(IOboxList, name)) {
          number += 1;
          name = `IO Box-${number}`;
        }

        return name;
      },

      isDuplicateName(IOboxList, name) {
        return IOboxList.some((IOBox) => IOBox.name === name);
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
          delay: (value) => {
            const number = parseInt(value, 10);

            return Number.isInteger(number) && value >= 1 && value <= 30;
          },
        },
        rules: {
          name: 'nonEmpty',
          ip_address: 'nonEmpty',
          port: 'port',
          user: 'nonEmpty',
          pass: 'password',
          delay: 'delay',
        },
      }),

      // 決定現在顯示哪一個步驟
      isOnStep(step) {
        return this.flag_currentSetp === step;
      },

      // 上一步按鈕
      async handlePrev() {
        if (this.flag_currentSetp > 0) {
          this.flag_currentSetp -= 1;
          return;
        }

        if (this.value_returnRoutePath.length === 0) return;

        this.$router.go(-1);
        // this.$router.push({ name: this.value_returnRoutePath });
      },

      handleParameter() {
        const iopoint = [];
        this.step2form[0].default = this.step2form[0].default === 1;
        this.step2form[0].trigger = this.step2form[0].trigger === 1;
        this.step2form[1].default = this.step2form[1].default === 1;
        this.step2form[1].trigger = this.step2form[1].trigger === 1;

        iopoint.push(this.step2form[0]);
        iopoint.push(this.step2form[1]);

        // todo
        const form = {
          ...this.step1form,
          iopoint,
        };
        console.log(form, 'form');
        return form;
      },

      async handleNext() {
        switch (this.flag_currentSetp) {
          case 0:
            this.flag_currentSetp += 1;
            break;
          case 1: {
            this.obj_loading = this.$loading.show({
              container: this.$refs.formContainer,
            });

            const parameter = this.handleParameter();

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

      create(data) {
        return this.$globalCreateIoBox(data);
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