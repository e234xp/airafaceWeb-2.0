<template>
  <div id="wrapper">
    <!-- 標題 -->
   

    <!-- 項目 -->
   

          <!-- Face Capture -->
          <div>
            <h2 sm="12">{{ disp_subtitleFaceCapture }}</h2>
          </div>
          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5" >
                {{ disp_faceMinimumSize }}
                <CInput size="lg" class="mt-3" style="width: 100%;" />
              </CCol>
            </CRow>
          </div>

       

          <CRow sm="6" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_targetScore }}</CRow>
          <CRow>
            <CCol sm="6">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>

          <CRow sm="6" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_captureInterval }}</CRow>
          <CRow>
            <CCol sm="6">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>

  </div>
</template>
  
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

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
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
   
    methods: {

    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>