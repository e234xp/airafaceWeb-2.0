<template>
  <div id="wrapper">
    <!-- 標題 -->
   

    <!-- 項目 -->
  
          <!-- Video Source -->
          <div>
            <h2 sm="12">{{ disp_subtitle }}</h2>
          </div>
          
          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_type }}</CRow>
          <CRow>
            <CCol sm="6">
              <!-- <v-select v-model="value_deviceGroups" :options="value_deviceTypesList"  :filterable="true" class="font-control">
              </v-select> -->
              <CSelect size="lg" value="1" v-model="formData.value_deviceTypes" :options="formData.value_deviceTypesList" />
            </CCol>
          </CRow>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_ipAddress }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="formData.IpAddress" />
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_port }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="formData.Port" />
              </CCol>
            </CRow>
          </div>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_username }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="formData.Username"/>
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_password }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="formData.Password" />
              </CCol>
            </CRow>
          </div>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_parameters }}</CRow>
          <CRow>
            <CCol sm="6">
              <!-- <v-select v-model="formData.value_deviceGroups" :options="value_deviceTypesList"  :filterable="true" class="font-control">
              </v-select> -->
              <CInput size="lg"  class="h5"  style="width: 100%;" v-model="formData.Parameters"/>
            </CCol>
          </CRow>

          


          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_connectionString }}</CRow>
          <CRow>
            <CCol sm="12">
              <CInput size="lg"  class="h5"  style="width: 100%;" v-model="formData.ConnectionString" />
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
        disp_type: i18n.formatter.format("VideoSourceType"),
        disp_ipAddress: i18n.formatter.format("VideoSourceIpAddress"),
        disp_port: i18n.formatter.format("VideoSourcePort"),
        disp_username: i18n.formatter.format("VideoSourceUsername"),
        disp_password: i18n.formatter.format("VideoSourcePassword"),
        disp_parameters: i18n.formatter.format("VideoSourceParameters"),
        disp_connectionString: i18n.formatter.format("VideoSourceConnectionString"),

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

        formData: {
          /**v-model */
          value_deviceTypes: "", /**選單 */
          value_deviceTypesList: [1,2,3],
          IpAddress: "",
          Port: "",
          Username: "",
          Password: "",
          Parameters: "",
          ConnectionString: "",
        }
        
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