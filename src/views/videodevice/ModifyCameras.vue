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

    <!-- 步驟 -->
    <CCol sm="12">
      <!-- Basic Form-->
      <CCard :class="showOnStep(0)">
        <CCardBody>
          <ModifyCamerasStep1Form :step1form="step1form" @updateStep1form="updateStep1form"/>
        </CCardBody>
      </CCard>
      <!-- ROI -->
      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>

        </CCardBody>
      </CCard>

      <!-- FaceCapture Form -->
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <ModifyCamerasStep3Form :step3form="step3form"  @updateStep3form="updateStep3form"/>
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
        <div v-if="flag_currentSetp == 1  || flag_currentSetp == 2">
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
  import ModifyCamerasStep1Form from './forms/ModifyCamerasStep1Form.vue'
  import ModifyCamerasStep3Form from './forms/ModifyCamerasStep3Form.vue'


  export default {
    name: "ModifyCameras",
    components: {
      ModifyCamerasStep1Form: ModifyCamerasStep1Form,
      ModifyCamerasStep3Form: ModifyCamerasStep3Form,
      stepprogress: StepProgress, 
    },
    data() {
      return {
        param_cardStyle: "height: 35rem;",
        
        value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",

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
        disp_complete: i18n.formatter.format("Complete"),
        disp_previous: i18n.formatter.format("Previous"),
        disp_next: i18n.formatter.format("Next"),

        //要編輯的id
        value_cameraUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : "",
        
        // 第一步驟
        deviceName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : "",
        value_deviceGroups: this.$route.params.item && this.$route.params.item.divice_groups ? this.$route.params.item.divice_groups : "",
        
        // video source
        value_deviceType: this.$route.params.item && this.$route.params.item.stream_type ? this.$route.params.item.stream_type : "",
        ip_address: this.$route.params.item && this.$route.params.item.ip_address ? this.$route.params.item.ip_address : "",
        port: this.$route.params.item && this.$route.params.item.port ? this.$route.params.item.port : "",
        userName: this.$route.params.item && this.$route.params.item.user ? this.$route.params.item.user : "",
        password: this.$route.params.item && this.$route.params.item.pass ? this.$route.params.item.pass : "",
        parameters: this.$route.params.item && this.$route.params.item.connection_info ? this.$route.params.item.connection_info : "",
        
        // roi:[],
        
        step1form: {},
      
        step2form: {},

        step3form: {},
        

        // 第三步驟
        captureInterval: this.$route.params.item && this.$route.params.item.capture_interval ? this.$route.params.item.capture_interval : "",
        targetScore: this.$route.params.item && this.$route.params.item.target_score ? this.$route.params.item.target_score : "",
        faceMinimumSize: this.$route.params.item && this.$route.params.item.face_min_length ? this.$route.params.item.face_min_length : "",
        
      };
    },
    mounted(){
      // console.log(this.value_cameraUuid,"ID是什麼")
      // console.log(this.deviceName,"name是什麼")
      // console.log(this.$route.params.item,"print item")
      // console.log(this.value_deviceType,"value_deviceType")
      console.log("當前步驟",self.flag_currentSetp)
    },
 
    // 給預設值 把那一支設備裡面的資料拿出來
    created() {
      // Give the form object initial values
      this.step1form = {
        uuid: this.value_cameraUuid,
        name: this.deviceName,
        divice_groups:this.value_deviceGroups,
        stream_type: this.value_deviceType,
        ip_address: this.ip_address,
        port: this.port,
        user: this.userName,
        pass: this.password,
        connection_info: this.parameters
        // Add other properties as needed
      },

      this.step2form = {
        roi: [
          {
              "x1": 0,
              "y1": 0,
              "x2": 0,
              "y2": 0
          }
        ]
      },

      this.step3form = {
        capture_interval: this.captureInterval,
        target_score: this.targetScore,
        face_min_length: this.faceMinimumSize
      }
      
    },
 
    methods: {
      // Handle the form update from the child component if needed
      updateStep1form(updatedForm) {
        this.step1form = { ...updatedForm };
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
        const dataForModify = {
            uuid : self.value_cameraUuid,
            data : {
              name: data.name,
              divice_groups: data.divice_groups,
              stream_type: data.stream_type,

              ip_address: data.ip_address,
              port: data.port,
              user: data.user,
              pass: data.pass,
              connection_info: data.connection_info,

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
            }
        };
        self.$globalModifyCameras( dataForModify, ( error, result ) => {
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
        console.log("formDT",form)
        return form
       
      },

      clickOnNext() {
        const self = this;
        console.log("現在第幾部",self.flag_currentSetp)
        if (self.flag_currentSetp == 0) {
          self.flag_currentSetp = 1;
        } else if (self.flag_currentSetp == 1) {
          self.flag_currentSetp = 2;
        } else if (self.flag_currentSetp == 2) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          if (self.onFinish) {

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
          } else {
            self.flag_currentSetp = 3;
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

      // 是否可以按下一步
      checkForm(){
        if(self.flag_currentSetp === undefined) {
          return this.step1form.name === '' || this.step1form.divice_groups === '' || 
          this.step1form.stream_type === '' || this.step1form.ip_address === '' || 
          this.step1form.port === '' || this.step1form.user === '' || 
          this.step1form.pass === '' || this.step1form.connection_info === ''
        } else if(self.flag_currentSetp === 0) {
          //ROI todo
        } else if(self.flag_currentSetp === 1) {
          // return this.step1form.capture_interval === false || this.step1form.divice_groups === '' || 
          // this.step1form.stream_type === ''
        }
      },

    },
  }
</script>