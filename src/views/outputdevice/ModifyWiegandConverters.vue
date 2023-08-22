<template>
  <div id="wrapper">
    <div>
      <div class="h1">{{ disp_headertitle }}</div>
      <stepprogress
        class="w-step-progress-4"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[disp_step1, disp_step2, disp_step3, disp_complete]"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <!-- 步驟 -->
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

      <!-- Connection Form-->
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

      <!-- Digital output1 Form-->
      <CCard v-else-if="isOnStep(2)">
        <CCardBody>
          <Step3Form
            :step3form="step3form"
            @updateStep3form="updateStep3form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          />
        </CCardBody>
      </CCard>
      <!-- Digital output1 Form-->
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
        <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2">
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
            @click="handleNext(flag_currentSetp)"
            :disabled="!isStepPassed(flag_currentSetp)"
            >{{ nextButtonName(flag_currentSetp) }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>

<script>
import i18n from "@/i18n";

import StepProgress from "vue-step-progress";

import Step1Form from "@/modules/outputdevice/modifywiegand/Step1Form.vue";
import Step2Form from "@/modules/outputdevice/modifywiegand/Step2Form.vue";
import Step3Form from "@/modules/outputdevice/modifywiegand/Step3Form.vue";
import { getIsFieldPassedFunction } from "@/utils";

export default {
  name: "ModifyCameras",
  components: {
    Step1Form: Step1Form,
    Step2Form: Step2Form,
    Step3Form: Step3Form,

    stepprogress: StepProgress,
  },
  data() {
    return {
      param_cardStyle: "height: 35rem;",

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : "",
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : "",

      disp_header: i18n.formatter.format("ModifyCameras"), //編輯設備

      /*Basic title  */
      disp_headertitle: i18n.formatter.format("VideoDeviceBasic"),

      // step setting
      param_activeColor: "#6baee3",
      param_passiveColor: "#919bae",
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

      /**Step 1 2 3 */
      disp_step1: i18n.formatter.format("VideoDeviceBasic"),
      disp_step2: i18n.formatter.format("VideoDeviceConnection"),
      disp_step3: i18n.formatter.format("VideoDeviceDigitalOutPut1"),
      disp_complete: i18n.formatter.format("Complete"),

      /**btn */
      disp_complete: i18n.formatter.format("Complete"),
      disp_previous: i18n.formatter.format("Previous"),
      disp_next: i18n.formatter.format("Next"),

      step1form: {
        name: "",
        divice_groups: [],
      },

      step2form: {
        ip_address: "",
        port: null,
      },

      step3form: {
        bits: 0,
        index: 0,
        syscode: 0,
        special_card_number:""
      },

      defaultValues: {}
    };
  },

  // 給預設值 把那一支設備裡面的資料拿出來
  async created() {
    this.defaultValues = await this.getDefaultValues();
    this.uuid = this.defaultValues.uuid;
  },

  methods: {
    // Handle the form update from the child component if needed
    // 處理資料傳遞
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
    },
    updateStep2form(newValue) {
      this.step2form = { ...newValue };
    },
    updateStep3form(newValue) {
      this.step3form = { ...newValue };
    },

    async getDefaultValues() {
      console.log(this.$route.params.item,"h0")
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

        case 2: {
          return true;
          //return this.isFormPassed(this.step3form);
        }

        case 3: {
          return true;
        }
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(([key, value]) => {
        return this.isFieldPassed(key, value);
      });
    },

    isFieldPassed: getIsFieldPassedFunction({
      customValidators: {
        syscode: (value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 255;
        },
        // specialCardNumber: (value) => /^\d+$/.test(value),
      },
      rules: {
        name: "nonEmpty",
        ip_address: "nonEmpty",
        port: "port",
        index: "passitiveInt",
        syscode: "syscode"
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

      this.$router.push({ name: this.value_returnRoutePath });
    },

    async handleNext() {
      switch (this.flag_currentSetp) {
        case 0:
        case 1: {
          this.flag_currentSetp += 1;

          break;
        }

        case 2: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });

          const parameter = {
            uuid: this.uuid,
            data: {
              ...this.step1form,
              ...this.step2form,
              ...this.step3form,
            },
          };

          const { data } = await this.modify(parameter);

          this.obj_loading.hide();
          if (data && data.message == "ok") {
            this.flag_currentSetp += 1;
          } else {
            this.$fire({
              text: i18n.formatter.format("Failed"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8",
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

    //送api 完成
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
          return this.disp_next;
        case 3:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
  },
};
</script>
