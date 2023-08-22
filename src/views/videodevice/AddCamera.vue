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
        <CCardBody> </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
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

import Step1Form from "@/modules/videodevice/addcamera/Step1Form.vue";
import Step3Form from "@/modules/videodevice/addcamera/Step3Form.vue";
import { getIsFieldPassedFunction } from "@/utils";

export default {
  name: "AddCameras",
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
      disp_complete: i18n.formatter.format("Complete"),

      /**btn */
      disp_previous: i18n.formatter.format("Previous"),
      disp_next: i18n.formatter.format("Next"),

      step1form: {
        name: "",
        divice_groups: [],

        stream_type: "",
        ip_address: "",
        port: null,
        user: "",
        pass: "",
        connection_info: "",
      },
      step2form: {
        roi: [
          {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
          },
        ],
      },
      step3form: {
        capture_interval: null,
        target_score: null,
        face_min_length: null,
      },
      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form: Step1Form,
    Step3Form: Step3Form,
  },
  async created() {
    this.defaultValues = await this.getDefaultValues();
  },


  methods: {
    // 處理資料傳遞
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
    },
    updateStep3form(newValue) {
      this.step3form = { ...newValue };
    },

    async getDefaultValues() {
      const form = {
        name: await this.getDefaultName(),
        stream_type: "rtsp",
        user: "admin",
        pass: "123456",
        port: 554,
        connection_info: "/media/video1",
        face_min_length: 0,
        target_score: 0.85,
        capture_interval: 500
      };

      return form;
    },

    async getDefaultName() {
      const {
        data: { total_length: totalLength, list: cameraList },
      } = await this.$globalFindCameras("", 0, 3000);

      let number = totalLength + 1;
      let name = `Camera-${number}`;
      // Check for duplicates, if found, increment the number and check again
      while (this.isDuplicateName(cameraList, name)) {
        number++;
        name = `Camera-${number}`;
      }

      return name;
    },

    isDuplicateName(cameraList, name) {
      return cameraList.some((camera) => camera.name === name);
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
      },
      rules: {
        name: "nonEmpty",
        stream_type: "nonEmpty",
        ip_address: "nonEmpty",
        port: "port",
        user: "nonEmpty",
        pass: "password",
        connection_info: "nonEmpty",
        target_score: "target_score",
        face_min_length: "passitiveInt",
        capture_interval: "captureInterval",
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

    // 處理下拉選單選項
    handleDeviceGroups() {
      let obj = {...this.step1form}
      return this.step1form.divice_groups = obj.divice_groups.map(i => i.value);
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
          this.handleDeviceGroups();
          const parameter = {
            ...this.step1form,
            ...this.step2form,
            ...this.step3form,
          };
          console.log(parameter)
          const { data } = await this.create(parameter);

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
    create(data) {
      return this.$globalCreateCameras(data);
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
