<template>
  <div id="wrapper">
    <div>
      <!-- <div class="h1">{{ $t('VideoDeviceBasic') }}</div> -->
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
          
          <AddIOboxesStep1Form :step1form="step1form" @updateStep1form="updateStep1form"/>
          <!-- <AddCamerasStep1Form :step1form="step1form"  @updateStep1form="updateStep1form"/> -->
        </CCardBody>
      </CCard>

       <!-- Basic Form-->
       <CCard :class="showOnStep(1)">
        <CCardBody>
          <AddIOboxesStep2Form :step1form="step1form" @updateStep1form="updateStep1form"/>
          <!-- <AddCamerasStep1Form :step1form="step1form"  @updateStep1form="updateStep1form"/> -->
        </CCardBody>
      </CCard>

       <!-- Basic Form-->
       <CCard :class="showOnStep(2)">
        <CCardBody>
          <AddIOboxesStep3Form :step1form="step1form" @updateStep1form="updateStep1form"/>
          <!-- <AddCamerasStep1Form :step1form="step1form"  @updateStep1form="updateStep1form"/> -->
        </CCardBody>
      </CCard>

       <!-- Basic Form-->
       <CCard :class="showOnStep(3)">
        <CCardBody>
          <AddIOboxesStep4Form :step1form="step1form" @updateStep1form="updateStep1form"/>
          <!-- <AddCamerasStep1Form :step1form="step1form"  @updateStep1form="updateStep1form"/> -->
        </CCardBody>
      </CCard>
    </CCol>
    
    <!-- 按鈕的Col -->
    
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1  || flag_currentSetp == 2 || flag_currentSetp == 3">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary mb-3" size="lg" @click="clickOnNext"
          :disabled="checkForm()"
          >{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol> 

  </div>
</template>
  
<script>
  import i18n from "@/i18n";

  import StepProgress from "vue-step-progress";
  import IOboxesBasic from './forms/IOboxesBasic.vue'
  import AddIOboxesStep1Form from './forms/AddIOboxesStep1Form.vue'
  import AddIOboxesStep2Form from './forms/AddIOboxesStep2Form.vue'
  import AddIOboxesStep3Form from './forms/AddIOboxesStep3Form.vue'
  import AddIOboxesStep4Form from './forms/AddIOboxesStep4Form.vue'

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

       
          ip_address: "",
          port: null, //Number(getPort)
          user: "",
          pass: "",
          connection_info: ""
          
        },
     

      };
    },
    components: {
      IOboxesBasic: IOboxesBasic,
      AddIOboxesStep1Form: AddIOboxesStep1Form,
      AddIOboxesStep2Form: AddIOboxesStep2Form,
      AddIOboxesStep3Form: AddIOboxesStep3Form,
      AddIOboxesStep4Form: AddIOboxesStep4Form,
      stepprogress: StepProgress,
    },
    mounted() {
      
    },
   
    methods: {
      // 是否可以按下一步
      checkForm(){
        const self = this; 
        // if(self.flag_currentSetp === undefined || self.flag_currentSetp === 0) {
        //   console.log(1)
        //   return this.step1form.name === '' || this.step1form.divice_groups === '' || 
        //   this.step1form.stream_type === '' || this.step1form.ip_address === '' || 
        //   this.step1form.port === '' || this.step1form.user === '' || 
        //   this.step1form.pass === '' || this.step1form.connection_info === ''
        // } else if(self.flag_currentSetp === 1) {
        //   //ROI todo
        //   console.log(2)
        //   return false
        // } 
        // else if(self.flag_currentSetp === 2) {
        //   console.log(3)
        //   const { target_score, face_min_length, capture_interval } = this.step3form;

        //   // 檢查 target_score 是否只能輸入 0 或 1
        //   if (target_score !== 0 && target_score !== 1) {
        //     return true;
        //   }

        //   // 檢查 face_min_length 是否只能輸入數字
        //   if (!/^\d+$/.test(face_min_length)) {
        //     return true;
        //   }

        //   // 檢查 capture_interval 是否在 100 到 1000 之間 不包含小數點
        //   if (!/^\d+$/.test(capture_interval) || capture_interval < 100 || capture_interval > 1000) {
        //     return true;
        //   }

        //   // 全部條件都符合才回傳 false，即不禁用按鈕
        //   return false;
        // }
      },
      
      // 處理資料傳遞
      updateStep1form(newValue) {
        this.step1form = { ...newValue };
      },
      
      // 決定現在顯示哪一個步驟
      showOnStep(step) {
        return step == this.flag_currentSetp ? "d-block" : "d-none";
      },
      // 上一步按鈕
      clickOnPrev() {
        const self = this;
        if (self.flag_currentSetp == 0) {
          if (self.value_returnRoutePath.length > 0) {
            self.$router.push({ name: self.value_returnRoutePath });
          } 
        } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
      },

      //送api 完成
      onFinish( data, cb ) {
        const self = this;
        
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
        }
        return form
      },   
      clickOnNext() {
        const self = this;
        // console.log(self.flag_currentSetp,"現在第幾步")
        if (self.flag_currentSetp == 0) {
          self.flag_currentSetp = 1;
        } else if (self.flag_currentSetp == 1) {
          self.flag_currentSetp = 2;
        } else if (self.flag_currentSetp == 2) {
          self.flag_currentSetp = 3;
        } else if (self.flag_currentSetp == 3) {
          if (self.onFinish) {
            self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

            const parameter = self.handleParameter(); // 拿參數
            // console.log("參數",parameter)
         
            self.onFinish(parameter, function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message == "ok") {
                self.flag_currentSetp = 4;
              } else {
                self.$fire({
                  text: i18n.formatter.format("Failed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            });
          } else {
            self.flag_currentSetp = 4;
          } 
        } else {
          self.$router.push({ name: self.value_returnRoutePath });
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