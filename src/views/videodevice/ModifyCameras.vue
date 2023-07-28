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
        :steps="[
          disp_inputAccessControlInfo,
          disp_inputAccessControlInfo,
          disp_selectSchedule,
          disp_complete,
        ]"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <!-- 步驟 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard v-if="isOnStep(0)" class="h-100">
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :isFieldPassed="isFieldPassed"
          />
        </CCardBody>
      </CCard>
      <!-- ROI -->
      <CCard v-else-if="isOnStep(1)" :style="param_cardStyle">
        <CCardBody> </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
      <CCard v-else-if="isOnStep(2)" class="h-100">
        <CCardBody>
          <Step3Form
            :step3form="step3form"
            @updateStep3form="updateStep3form"
            :isFieldPassed="isFieldPassed"
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
import i18n from "@/i18n";

import StepProgress from "vue-step-progress";

import Step1Form from "@/modules/videodevice/modifycamera/Step1Form.vue";
import Step3Form from "@/modules/videodevice/modifycamera/Step3Form.vue";

export default {
  name: "ModifyCameras",
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
      disp_inputAccessControlInfo: i18n.formatter.format("VideoDeviceBasic"),
      disp_selectSchedule: i18n.formatter.format("SelectSchedule"),

      /**btn */
      disp_complete: i18n.formatter.format("Complete"),
      disp_previous: i18n.formatter.format("Previous"),
      disp_next: i18n.formatter.format("Next"),

      //要編輯的id
      value_cameraUuid:
        this.$route.params.item && this.$route.params.item.uuid
          ? this.$route.params.item.uuid
          : "",

      // 第一步驟
      deviceName:
        this.$route.params.item && this.$route.params.item.name
          ? this.$route.params.item.name
          : "",
      value_deviceGroups:
        this.$route.params.item && this.$route.params.item.divice_groups
          ? this.$route.params.item.divice_groups
          : "",

      // video source
      value_deviceType:
        this.$route.params.item && this.$route.params.item.stream_type
          ? this.$route.params.item.stream_type
          : "",
      ip_address:
        this.$route.params.item && this.$route.params.item.ip_address
          ? this.$route.params.item.ip_address
          : "",
      port:
        this.$route.params.item && this.$route.params.item.port
          ? this.$route.params.item.port
          : "",
      userName:
        this.$route.params.item && this.$route.params.item.user
          ? this.$route.params.item.user
          : "",
      password:
        this.$route.params.item && this.$route.params.item.pass
          ? this.$route.params.item.pass
          : "",
      parameters:
        this.$route.params.item && this.$route.params.item.connection_info
          ? this.$route.params.item.connection_info
          : "",

      // roi:[],

      step1form: {},

      step2form: {},

      step3form: {},

      // 第三步驟
      captureInterval:
        this.$route.params.item && this.$route.params.item.capture_interval
          ? this.$route.params.item.capture_interval
          : "",
      targetScore:
        this.$route.params.item && this.$route.params.item.target_score
          ? this.$route.params.item.target_score
          : "",
      faceMinimumSize:
        this.$route.params.item && this.$route.params.item.face_min_length
          ? this.$route.params.item.face_min_length
          : "",
    };
  },
  components: {
    Step1Form: Step1Form,
    Step3Form: Step3Form,
    stepprogress: StepProgress,
  },

  // 給預設值 把那一支設備裡面的資料拿出來
  created() {
    // Give the form object initial values
    (this.step1form = {
      uuid: this.value_cameraUuid,
      name: this.deviceName,
      divice_groups: this.value_deviceGroups,
      stream_type: this.value_deviceType,
      ip_address: this.ip_address,
      port: this.port,
      user: this.userName,
      pass: this.password,
      connection_info: this.parameters,
      // Add other properties as needed
    }),
      (this.step2form = {
        roi: [
          {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
          },
        ],
      }),
      (this.step3form = {
        capture_interval: this.captureInterval,
        target_score: this.targetScore,
        face_min_length: this.faceMinimumSize,
      });
  },

  methods: {
    // Handle the form update from the child component if needed
    updateStep1form(updatedForm) {
      this.step1form = { ...updatedForm };
    },
    updateStep3form(updatedForm) {
      this.step3form = { ...updatedForm };
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
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(([key, value]) => {
        return this.isFieldPassed(key, value);
      });
    },

    isFieldPassed(key, value) {
      const rules = {
        name: "nonEmpty",
        divice_groups: "nonEmpty",
        stream_type: "nonEmpty",
        ip_address: "nonEmpty",
        port: "port",
        user: "nonEmpty",
        pass: "password",
        connection_info: "nonEmpty",
        target_score: "target_score",
        face_min_length: "passitiveInt",
        capture_interval: "captureInterval",
      };
      const rule = rules[key];
      if (!rule) return true;
      switch (rule) {
        case "nonEmpty": {
          return !!value;
        }

        case "port": {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && number >= 1 && number <= 65535;
        }

        case "password": {
          return !!value;
        }

        case "passitiveInt": {
          return /^\d+$/.test(value);
        }

        case "target_score": {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 1;
        }

        case "captureInterval": {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 100 && value <= 1000;
        }
      }
    },

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

    // 按下一步
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

          const { uuid, ...step1Data } = this.step1form

          const parameter = {
              ...step1Data,
              ...this.step2form,
              ...this.step3form,
          };

          const dataParameter = {uuid, data:parameter };
          
          const response = await this.modify(dataParameter);
          
          this.obj_loading.hide();
          // 如果成功拿到資料
          if (response.data && response.data.message == "ok") {
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
      return this.$globalModifyCamera(data);
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
