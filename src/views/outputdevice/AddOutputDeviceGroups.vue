<template>
  <div id="wrapper">
    <div>
      <!-- <div class="h1">{{ $t('VideoDeviceBasic') }}</div> -->
      <div class="h1">
        {{ $t('VideoDeviceBasic') }}
      </div>

      <stepprogress class="w-step-progress-4" :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
        :passive-color="param_passiveColor" :current-step="flag_currentSetp" :line-thickness="param_lineThickness"
        :steps="[$t('VideoDeviceBasic'), $t('Complete')]" icon-class="fa fa-check" />

      <div style="height: 35px" />
    </div>

    <!-- 項目 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form :step1form="step1form" @updateStep1form="updateStep1form" :is-field-passed="isFieldPassed"
            :default-values="defaultValues" />
        </CCardBody>
      </CCard>

      <!-- Connection Form-->
      <!-- <CCard v-else-if="isOnStep(1)">
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard> -->

      <!-- Digital output1 Form-->
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

      <!-- Digital output2 Form-->
      <!-- <CCard v-else-if="isOnStep(3)">
        <CCardBody>
          <Step4Form
            :step4form="step4form"
            @updateStep4form="updateStep4form"
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
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="handlePrev">
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="
            flag_currentSetp == 1 ||
              flag_currentSetp == 2 ||
              flag_currentSetp == 3
          ">
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

  import Step1Form from '@/modules/outputdevice/addoutputdevicegroups/Step1Form.vue';

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

        // step setting
        param_activeColor: '#6baee3',
        param_passiveColor: '#919bae',
        param_lineThickness: 3,
        param_activeThickness: 3,
        param_passiveThickness: 3,
        flag_currentSetp: 0,

        step1form: {
          name: '',
        },

        // step2form: {
        //   ip_address: "",
        //   port: null, //Number(getPort)
        //   username: "",
        //   password: "",
        // },

        // step3form: {
        //   no: 1,
        //   enable: true,
        //   default: false,
        //   trigger: true,
        //   delay: 3
        // },

        // step4form: {
        //   no: 2,
        //   enable: false,
        //   default: true,
        //   trigger: false,
        //   delay: 1
        // },

        defaultValues: {},
      };
    },
    components: {
      Step1Form,
      // Step2Form: Step2Form,
      // Step3Form: Step3Form,
      // Step4Form: Step4Form,
      stepprogress: StepProgress,
    },
    async created() {
      this.defaultValues = await this.getDefaultValues();
    },
    methods: {
      // 處理資料傳遞
      updateStep1form(newValue) {
        this.step1form = { ...newValue };
      },
      // updateStep2form(newValue) {
      //   this.step2form = { ...newValue };
      // },
      // updateStep3form(newValue) {
      //   this.step3form = { ...newValue };
      // },
      // updateStep4form(newValue) {
      //   this.step4form = { ...newValue };
      // },

      async getDefaultValues() {
        const form = {
          name: await this.getDefaultName(),
        };

        return form;
      },

      async getDefaultName() {
        const {
          data: { totalLength, result: deviceList },
        } = await this.$globalFindOutputDeviceGroups('', 0, 3000);

        let number = totalLength + 1;
        let name = `OutputGroup-${number}`;
        // Check for duplicates, if found, increment the number and check again
        while (this.isDuplicateName(deviceList, name)) {
          number += 1;
          name = `OutputGroup-${number}`;
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

          // case 1: {
          //   // todo ROI
          //   return true;
          // }

          // case 2: {
          //   return this.isFormPassed(this.step3form);
          // }

          case 1: {
            return true;
          }

          default:
            return false;
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
            return false;
        }
      },

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

        this.$router.push({ name: this.value_returnRoutePath });
      },

      // 送api 完成
      handleParameter() {
        const form = {
          ...this.step1form,
          wiegand_converter_uuid_list: [],
          iobox_uuid_list: [],
        };
        console.log(form, 'form');
        return form;
      },

      async handleNext() {
        switch (this.flag_currentSetp) {
          // case 0:
          // case 1:
          // case 2:{
          //   this.flag_currentSetp += 1;

          //   break;
          // }

          case 0: {
            this.obj_loading = this.$loading.show({
              container: this.$refs.formContainer,
            });

            const parameter = this.handleParameter();
            console.log(parameter, '送的資料');

            const { data } = await this.create(parameter);

            this.obj_loading.hide();
            if (data && data.message == 'ok') {
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
        return this.$globalCreateOutputDeviceGroup(data);
      },

      nextButtonName(step) {
        switch (step) {
          case 0:
            return this.$t('Next');
          case 1:
            return this.$t('Complete');
          default:
            return this.$t('Next');
        }
      },
    },
  };
</script>