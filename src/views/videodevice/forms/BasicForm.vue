<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <div class="h1">{{ disp_header }}</div>
      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[disp_inputAccessControlInfo, disp_selectSchedule, disp_complete]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      >
      </stepprogress>
  

      <div style="height: 35px"></div>
    </div>

    <!-- 項目 -->
    <CCard >
      <CCardBody>
          <div>
            <h2 sm="12">{{ disp_header }}</h2>  
          </div>
          <!-- Basic -->
          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceName }}</CRow>
          <CRow>
            <CCol sm="6">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
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

          <!-- Video Source -->
          <VideoSourceForm :class="showOnStep(0)"/>

          <div style="height: 35px"></div>
          <!-- ROI -->

          <!-- Face Capture -->
          <FaceCaptureForm :class="showOnStep(0)"/>
          <div style="height: 35px"></div>


          <!-- 儲存按鈕 -->
          <div class="d-flex ml-3 justify-content-end">
            <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" @click="saveData()">
              {{ disp_save }}
            </CButton>
          </div>

      </CCardBody>
    </CCard>

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
    data() {
      return {
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
        disp_complete: i18n.formatter.format("Complete"),



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

        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3]
      };
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
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>