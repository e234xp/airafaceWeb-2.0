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
        :steps="[disp_inputAccessControlInfo, disp_inputAccessControlInfo, disp_selectSchedule, disp_complete]"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

    <!-- 項目 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard :class="showOnStep(0)">
        <CCardBody>
          <AddCamerasStep1Form :step1form="step1form"  @updateStep1form="updateStep1form"/>
        </CCardBody>
      </CCard>
    
      父層名稱-step1:{{ step1form  }}
      <!-- ROI -->
      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>
         
        </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <AddCamerasStep3Form :step3form="step3form"  @updateStep3form="updateStep3form"/>
        </CCardBody>
      </CCard>
      父層名稱3 :{{ step3form  }}
    </CCol>

    <!-- 按鈕的Col -->
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1  || flag_currentSetp == 2">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary mb-3" size="lg" @click="clickN">{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol> 

  </div>
  <!-- <CRow>
    {{ form }}
    <CCol sm="12">
      <CameraForm
      :formData="$data"
      :onFinish="onFinish"
      />
    </CCol>
  </CRow> -->

  <!-- <div>
    <FirstStep 
    v-if="step ===0"
    v-model:
    @next="step = 1"
    />
  </div> -->
</template>
  
<script>
  import { mapState } from "vuex";
  import i18n from "@/i18n";

  import StepProgress from "vue-step-progress";

  import VideoSourceForm from './forms/VideoSourceForm.vue'
  import FaceCaptureForm from './forms/FaceCaptureForm.vue'
  import AddCamerasStep1Form from './forms/AddCamerasStep1Form.vue'
  import AddCamerasStep3Form from './forms/AddCamerasStep3Form.vue'



  import VueSelect from 'vue-select';
  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";
	



  export default {
    name: "AddCameras",
    data() {
      return {
        param_cardStyle: "height: 35rem;",

        value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",

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
        disp_complete: i18n.formatter.format("Complete"),
        disp_previous: i18n.formatter.format("Previous"),
        disp_next: i18n.formatter.format("Next"),

       

        step1form: {
          name: "",
          divice_groups: [],

          stream_type: "rtsp",
          ip_address: "",
          port: null, //Number(getPort)
          user: "",
          pass: "",
          connection_info: "",
          
       
          // capture_interval: Number(getCaptureInterval),
          // target_score: Number(getTargetScore),
          // roi: [
          //     {
          //         "x1": 0,
          //         "y1": 0,
          //         "x2": 0,
          //         "y2": 0
          //     }
          // ],
          // face_min_length: Number(getFaceMinimumSize),
          
        },
        step2form: {
          roi: [
            {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 0
            }
          ]
        },

        step3form: {
          capture_interval: null,
          target_score: null,
          face_min_length: null
        },

    

        step:0,
      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
      FaceCaptureForm: FaceCaptureForm,
      VideoSourceForm: VideoSourceForm,
      AddCamerasStep1Form: AddCamerasStep1Form,
      AddCamerasStep3Form: AddCamerasStep3Form,
      stepprogress: StepProgress,
      //CameraForm: CameraForm
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    created() {
      console.log("value_returnRoutePath",this.value_returnRoutePath+ "；" + this.value_returnRouteName, "value_returnRouteName")
    },
   
    methods: {
      // 處理資料傳遞
      updateStep1form(newValue) {
        this.step1form = { ...newValue };
      },
      updateStep3form(newValue) {
        this.step3form = { ...newValue };
      },




      // 決定現在顯示哪一個步驟
      showOnStep(step) {
        return step == this.flag_currentSetp ? "d-block" : "d-none";
      },
      // 上一步按鈕
      clickOnPrev() {
        const self = this;
        // // todo
        // const form = {
        //   ...this.fistStepForm,
        //   ...this.fistStepForm,
        // }
        // send(form)
        console.log(self.value_returnRoutePath,"路徑2")

        if (self.flag_currentSetp == 0) {
          if (self.value_returnRoutePath.length > 0) {
            self.$router.push({ name: self.value_returnRoutePath });
          } 
        } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
        console.log("當前步驟",self.flag_currentSetp)
      },

      onFinish( data, cb ) {
        const self = this;
        console.log("參數確認",data)
        
        const dataForAdd = {
          name: data.name,
          divice_groups: data.divice_groups,
          stream_type: data.stream_type,

          ip_address: data.ip_address,
          port: data.port,
          user: data.user,
          pass: data.pass,
          connection_info: data.connection_info,
          
          //connectionString: data.connectionString,

          capture_interval: data.capture_interval,
          target_score: data.target_score,
          roi: [
              {
                  "x1": 0,
                  "y1": 0,
                  "x2": 0,
                  "y2": 0
              }
          ],
          face_min_length: data.face_min_length,
        };
        self.$globalCreateCameras( dataForAdd, ( error, result ) => {
          if( cb ) cb( error == null, result );
        });
      },

      handleParameter(){
        // todo
        const form = {
          ...this.step1form,
          ...this.step2form,
          ...this.step3form,
        }
        console.log("form",form)
        return form
       
      },

      clickN() {
        const self = this;
        if (self.flag_currentSetp == 0) {
          self.flag_currentSetp = 1;
        } else if (self.flag_currentSetp == 1) {
          self.flag_currentSetp = 2;
        } else if (self.flag_currentSetp == 2) {
          if (self.onFinish) {
            self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

            const parameter = self.handleParameter(); // 拿參數
            console.log("參數",parameter)
         
            self.onFinish(parameter, function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message == "ok") {
                self.flag_currentSetp = 3;
              } else {
                self.$fire({
                  text: i18n.formatter.format("Failed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            });
          } else self.flag_currentSetp = 0;
        } else {
          self.flag_currentSetp = 0;
        }
      },

      nextButtonName() {
        switch (this.flag_currentSetp) {
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
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>