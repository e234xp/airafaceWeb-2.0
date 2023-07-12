<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <div class="h1">{{ disp_header }}</div>
      <stepprogress
        class="w-step-progress-4"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[disp_inputAccessControlInfo, disp_inputAccessControlInfo,disp_selectSchedule, disp_complete]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      >
      </stepprogress>

      <div style="height: 35px"></div>
    </div>

  
 
    <!-- 項目 -->
    <CCol sm="12">
      <CCard :class="showOnStep(0)">
        <CCardBody>
          <div>
            <h2 sm="12">{{ disp_header }}</h2>  
          </div>
          <!-- Basic -->
          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceName }}</CRow>
          <CRow>
            <CCol sm="6">
              <CInput size="lg"  class="h5" v-model="deviceName"/>
            </CCol>
          </CRow>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceGroups }}</CRow>
          <CRow>
            <CCol sm="6">
              <multiselect v-model="value_deviceGroups" placeholder="" :options="value_deviceGroupsList" :multiple="true"
                  :taggable="true" :hideSelected="true" 
                  :show-no-options="false"
                >
              </multiselect>
            </CCol>
          </CRow>

          <div style="height: 35px"></div>

          <!-- Video Source -->
          <VideoSourceForm ref="videoForm"/>

        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>
          <!-- ROI -->
          <!-- <VideoSourceForm/> -->
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <FaceCaptureForm ref="faceCaptureForm"/>
        </CCardBody>
      </CCard>
    </CCol>
   
      <!-- 按鈕的Col -->
      <CCol sm="12">
        <div class="row justify-content-center mb-4">
          <div v-if="flag_currentSetp == 0 && formData.value_returnRoutePath.length > 0">
            <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
              >{{ formData.value_returnRouteName }}
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
</template>
  
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";
  import StepProgress from "vue-step-progress";


  
  import VideoSourceForm from './VideoSourceForm.vue'
  import FaceCaptureForm from './FaceCaptureForm.vue'


  import VueSelect from 'vue-select';
  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";
	



  export default {
    name: "CamerasBasic",
    props: {
      value_returnRoutePath: {type: String, default: "",},
      value_returnRouteName: {type: String, default: "",},
      formData: Object,
      onFinish: { type: Function },
    },
    created() {
      console.log("CD",this.value_returnRoutePath)
      console.log("CD",this.value_returnRouteName)
      console.log("CD",this.formData.value_returnRoutePath)

    },
    data() {
      return {
        param_cardStyle: "height: 35rem;",
        videoFormData:"",
        faceCaptureFormData: "",

        obj_loading: null,
        // value_returnRoutePath: value_returnRoutePath,
        // value_returnRouteName: value_returnRouteName,

        value_dataItemsToShow: [{enable:false,name:'',timestamp:'',remark:'',modifier:'',remark1:''}],
        value_allTableItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 5,
          totalResult: 0,
        },
        value_searchingFilter: "",
        isChecked: true,

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
        disp_registerCompleted: i18n.formatter.format("RegisterCompleted"),
        disp_previous: i18n.formatter.format("Previous"),
        disp_next: i18n.formatter.format("Next"),



        /*Basic title  */
        disp_header: i18n.formatter.format("VideoDeviceBasic"),

        /**content */
        disp_basicDeviceName: i18n.formatter.format("BasicDeviceName"),
        disp_basicDeviceGroups: i18n.formatter.format("BasicDeviceGroups"),

        /*Video Source title  */
        disp_subtitle: i18n.formatter.format("VideoDeviceVideoSource"),

        /**content */
        disp_Type: i18n.formatter.format("VideoSourceType"),
        disp_ConnectionString: i18n.formatter.format("VideoSourceConnectionString"),

        /*Face Capture title  */
        disp_subtitleFaceCapture: i18n.formatter.format("VideoFaceCapture"),

        /**content */
        // disp_faceMinimumWidth: i18n.formatter.format("VideoBasicCOlNameFaceMinimumWidth"),
        // disp_faceMinimumHeight: i18n.formatter.format("VideoBasicCOlNameFaceMinimumHeight"),
        disp_faceMinimumSize: i18n.formatter.format("VideoBasicCOlNameFaceMinimumSize"),
        // disp_frontalFaceFilter: i18n.formatter.format("VideoBasicCOlNameFrontalFaceFilter"),

        disp_targetScore: i18n.formatter.format("VideoBasicCOlNameTargetScore"),
        disp_captureInterval: i18n.formatter.format("VideoBasicCOlNameCaptureInterval"),
        // disp_antiSpoofingScore: i18n.formatter.format("VideoBasicCOlNameAntiSpoofingScore"),

        disp_save: i18n.formatter.format("Save"),

        /**api */
        deviceName: "",
        value_deviceGroups: [], /**選單 */

        value_deviceType: "",
        value_deviceConnectionString: "",
        value_deviceFaceMinimumSize: 0,
        value_deviceTargetScore: 0,
        value_deviceCaptureInterval: 0,


        /**v-model */
        value_deviceGroupsList: [1,2,3]
      };
    },
    mounted() {
      console.log("test", this.videoFormData = this.$refs.videoForm.formData)// 通过实例访问VideoForm组件的数据)
      console.log("faceCaptureFormData", this.faceCaptureFormData = this.$refs.faceCaptureForm.formData)
    },
   
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
      FaceCaptureForm: FaceCaptureForm,
      VideoSourceForm: VideoSourceForm,
      stepprogress: StepProgress,

    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
   
    methods: {
      // 決定現在顯示哪一個步驟
      showOnStep(step) {
        return step == this.flag_currentSetp ? "d-block" : "d-none";
      },
      clickOnPrev() {
        const self = this;
        console.log(self.formData.value_returnRoutePath,"路徑2")

        if (self.flag_currentSetp == 0) {
          if (self.formData.value_returnRoutePath.length > 0) {
            self.$router.push({ name: self.formData.value_returnRoutePath });
          } 
        } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
        console.log("當前步驟",self.flag_currentSetp)
      },
      handleParameter() {
        const self = this;
        let connectionString = self.value_deviceConnectionString;

        let testString = "rtsp://admin:12345@192.168.10.171:554/media/video1";
        let parts1 = testString.split("://"); //拆rtsp and admin:12345@192.168.10.171:554/media/video1

        let remainingString = parts1[1].split("@"); // ['admin:12345', '192.168.10.171:554/media/video1']
        let userInfo = remainingString[0].split(":"); //['admin', '12345']
        const user = userInfo[0] // admin
        const password = userInfo[1] //12345

        let ipInfo = remainingString[1].split("/") //  ['192.168.10.171:554', 'media', 'video1']

        let ipAddress = ipInfo[0].split(":") // ['192.168.10.171', '554']
        const ip = ipAddress[0];  // 192.168.10.171
        const port = Number(ipAddress[1]) // 554
        console.log("PORT",port)
        const filePath = "/" + ipInfo[1] + "/" + ipInfo[2] // 組路徑 /media/video1
        console.log("拿過來的videodata", this.videoFormData = this.$refs.videoForm.formData)
        console.log("faceCaptureFormData", this.faceCaptureFormData = this.$refs.faceCaptureForm.formData)

        

        let data = {
          name: self.deviceName,
          divice_groups: self.value_deviceGroups,

          stream_type: self.value_deviceType,
          ip_address: this.videoFormData.IpAddress,
          port: Number(this.videoFormData.Port),
          user: this.videoFormData.Username,
          pass: this.videoFormData.Password,
          connection_info: this.videoFormData.Parameters,
          
          //connectionString: self.value_deviceConnectionString,
         

          capture_interval: Number(this.faceCaptureFormData.captureInterval),
          target_score: Number(this.faceCaptureFormData.targetScore),
          roi: [
              {
                  "x1": 0,
                  "y1": 0,
                  "x2": 0,
                  "y2": 0
              }
          ],
          face_min_length: Number(this.faceCaptureFormData.faceMinimumSize),
        };
        return data
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
          // self.$router.push({ name: self.value_returnRoutePath })
          self.flag_currentSetp = 0;
        }
      },
      clickOnNext() {
        const self = this;
        if (self.flag_currentSetp == 0) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          setTimeout(() => {
            self.flag_currentSetp = 1;
            if (self.obj_loading) self.obj_loading.hide();
          }, 168);
        }
        else if (self.flag_currentSetp == 1) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          setTimeout(() => {
            self.flag_currentSetp = 2;
            if (self.obj_loading) self.obj_loading.hide();
          }, 168);
        }
        else if (self.flag_currentSetp == 2) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          if (self.onFinish) {
            const parameter = self.handleParameter(); // 拿參數
            console.log("參數",parameter)
            self.onFinish(parameter,
              function (success, result) {
                if (self.obj_loading) self.obj_loading.hide();
                if (result && result.message == "ok") {
                  self.flag_currentSetp = 3;
                } else {
                  //self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
                  self.$fire({
                    text: i18n.formatter.format("RegisterFailed"),
                    type: "error",
                    timer: 3000,
                    confirmButtonColor: "#20a8d8",
                  });
                }
              }
            );
          } 
          else {
            if (self.obj_loading) self.obj_loading.hide();
            self.flag_currentSetp = 0;
          }
         
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