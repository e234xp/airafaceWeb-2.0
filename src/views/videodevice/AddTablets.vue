<template>
  <div id="wrapper">
    <div class="tablet">
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
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
            :isFieldPassed="isFieldPassed"
            :defaultValues="defaultValues"
          /> 
        </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
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

import Step1Form from "@/modules/videodevice/addtablets/Step1Form.vue";
import Step2Form from "@/modules/videodevice/addtablets/Step2Form.vue";
// import Step3Form from "@/modules/videodevice/addtablets/Step3Form.vue";
import { getIsFieldPassedFunction } from "@/utils";

export default {
  name: "AddTablets",
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

      //default value i18n
      disp_previous: i18n.formatter.format("Previous"),
      
      i18nYes: i18n.formatter.format("TabletsAccessDefaultYes"), //"Yes",
      i18nNo: i18n.formatter.format("TabletsAccessDefaultNo"),  //"No",
      i18nWelcome: i18n.formatter.format("TabletsAccessDefaultWelcome"),          //"歡迎光臨",
      i18nIdentifyS: i18n.formatter.format("TabletsAccessDefaultIdentifyS"),        //"辨識成功",
      i18nIdentifySM: i18n.formatter.format("TabletsAccessDefaultIdentifySM"),       //"請通行",
      i18nIdentifyF: i18n.formatter.format("TabletsAccessDefaultIdentifyF"),        //"辨識失敗",
      i18nIdentifyFM: i18n.formatter.format("TabletsAccessDefaultIdentifyFM"),       //"請洽服務人員",
      i18nClockInfoDataUp: i18n.formatter.format("TabletsAccessDefaultClockInfoDataUp"),  // "美好的一天",
      i18nClockInfoDataDown: i18n.formatter.format("TabletsAccessDefaultClockInfoDataDown"),// "你好",
      i18nClockInfoData3n: i18n.formatter.format("TabletsAccessDefaultClockInfoData3n"),  // "請選擇打卡功能",
      i18nClockText1: i18n.formatter.format("TabletsAccessDefaultClockText1"),       // "上班",
      i18nClockText2: i18n.formatter.format("TabletsAccessDefaultClockText2"),       // "下班",
      i18nClockText3: i18n.formatter.format("TabletsAccessDefaultClockText3"),       // "休息開始",
      i18nClockText4: i18n.formatter.format("TabletsAccessDefaultClockText4"),       // "休息結束",
      i18nClockText5: i18n.formatter.format("TabletsAccessDefaultClockSuccess"),       // "打卡成功",
      i18nClockText6: i18n.formatter.format("TabletsAccessDefaultClockText5"),       // "請重新打卡",


      step1form: {
        name: "",
        identity: "",
        divice_groups: [],

        device_uuid: "",
      },

      // 8/11改
      step2form: {
        //前五項
        verify_target_score: 0.9,
        face_capture_interval:500,
        face_overlap_ratio:0.5,
        target_face_size_height: 80,
        target_face_size_width: 80,

        //進階項目
        //Card
        enable_id_card: true,
        support_wiegand_bits:	 34,
        group_list_to_pass: [],
        enable_trigger_relay: false,
        relay_delay: 3000,
        enable_two_factor_authentication: false,


        //Temp
        temperature_unit_celsius: true,
        high_temperature: 37.5,
        have_to_wear_face_mask: false,

        //Result  display date
        enable_name_mask: false,
        show_profile_photo: true,
        stranger_display_name: "",
        display_verify_result_time: 2000,
        show_verify_indication: false,

        verify_indication_success_text: "",
        verify_indication_success_message_text: "",
        verify_indication_fail_text: "",
        verify_indication_fail_message_text: "",

        //clock setting
        enable_clock_mode: false,
        clock_info_data_1: "",
        clock_info_data_2: "",
        clock_info_data_3: "",
        enable_clock_function_1: true,
        enable_clock_function_2: true,
        enable_clock_function_3: false,
        enable_clock_function_4: false,
        clock_function_name_1: "",
        clock_function_name_2: "",
        clock_function_name_3: "",
        clock_function_name_4: "",
        clock_indication_success_text: "",
        clock_success_message_text: "",
        clock_indication_fail_text: "",
        clock_fail_message_text: "",

        //RTSP data
        enable_rtsp_camera:true,
        ip_address: "",
        rtsp_username: "",
        rtsp_password: "",
      },
    
      step4form: {
        code: "code",
        description: "",
        relay_start_power: 1,
        relay_end_power: 0,
        low_temperature: 34,
        enable_high_temperature_sound_alert: true,
        enable_high_temperature_trigger_relay: false,
        high_temperature_trigger_relay_start_power: 1,
        high_temperature_trigger_relay_delay: 3000,
        high_temperature_trigger_relay_end_power: 0,
        temperature_detection_is_must: true,
        indicator_message: "請露出額頭以便測量體溫",
        qr_code_id: "",
        high_temperature_no_pass: true,
        high_temperature_alert_text: "溫度過高請勿進入",
        low_temperature_alert_text: "溫度過低, 請露出額頭測量",
        enable_contact_tracing_qr_code: false,
        contact_tracing_qr_code: "",
        health_statement: false,
        sessionId: "$2a$10$1469c0462c5464025a663OaJkNxMc89CKWnr6/KB.lB7rKYAU2wRK",
        device_uuid: "",
        enable_pos_intergration: false,
        pos_brand: ""
      },
      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form: Step1Form,
    Step2Form: Step2Form,
    // Step3Form: Step3Form,
  },
  async created() {
    this.defaultValues = await this.getDefaultValues();
    console.log(this.defaultValues,"CREATED")
  },


  methods: {
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
      const form = {
        name: await this.getDefaultName(),
        identity: "Tablet-02",

        //result display
        stranger_display_name:this.i18nWelcome,

        verify_indication_success_text: this.i18nIdentifyS,
        verify_indication_success_message_text: this.i18nIdentifySM,
        verify_indication_fail_text: this.i18nIdentifyF,
        verify_indication_fail_message_text: this.i18nIdentifyFM,

        //clock df
        enable_clock_mode: false,
        clock_info_data_1: this.i18nClockInfoDataUp,
        clock_info_data_2: this.i18nClockInfoDataDown,
        clock_info_data_3: this.i18nClockInfoData3n,
        enable_clock_function_1: true,
        enable_clock_function_2: true,
        enable_clock_function_3: false,
        enable_clock_function_4: false,
        clock_function_name_1: this.i18nClockText1,
        clock_function_name_2: this.i18nClockText2,
        clock_function_name_3: this.i18nClockText3,
        clock_function_name_4: this.i18nClockText4,
        clock_indication_success_text: this.i18nIdentifyS,
        clock_success_message_text: this.i18nClockText5,
        clock_indication_fail_text: this.i18nIdentifyF,
        clock_fail_message_text: this.i18nClockText6,

       
        ip_address: "192.168.10.48:8554",
        rtsp_username: "root",
        rtsp_password: "12345"
      };

      console.log("GO!,",form)

      return form;
    },

    async getDefaultName() {
      const {
        data: { total_length: totalLength, list: cameraList },
      } = await this.$globalFindTablets("", 0, 3000);

      let number = totalLength + 1;
      let name = `Tablet-${number}`;
      // Check for duplicates, if found, increment the number and check again
      while (this.isDuplicateName(cameraList, name)) {
        number++;
        name = `Tablet-${number}`;
      }

      return name;
    },

    isDuplicateName(cameraList, name) {
      return cameraList.some((camera) => camera.name === name);
    },

    // 是否可以按下一步 8/11改
    isStepPassed(step) {
      switch (step) {
        case 0: {
          return true;
          return this.isFormPassed(this.step1form);
        }

        case 1: {
          // todo ROI
          return true;
        }

        case 2: {
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
        number:(value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 1000;
        },
        displayVerifyResultTime:(value) => {
          const number = parseInt(value, 10);

          return Number.isInteger(number) && value >= 0 && value <= 10000;
        },
      },
      rules: {
        /**步驟1 */
        name: "nonEmpty",
        device_id: "nonEmpty",
        divice_groups: "nonEmpty",
        
        /**步驟2 8/11改*/
        ip_address5:"number",
        ip_address2:"number",
        ip_address3:"number",
        divice_groups:"number",
        duration:"number",
        display_verify_result_time:"displayVerifyResultTime",
        rtsp_ip_address: "number",
        rtsp_username: "nonEmpty",
        rtsp_password: "password",


        /**步驟3 */
        ip_address: "nonEmpty",
        device_id: "nonEmpty",
       
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
        case 0: {
          this.flag_currentSetp += 1;

          break;
        }

        case 1: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });
          this.handleDeviceGroups();
          const parameter = {
            ...this.step1form,
            ...this.step2form,
            ...this.step3form,
            ...this.step4form
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
      return this.$globalCreateTablets(data);
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
