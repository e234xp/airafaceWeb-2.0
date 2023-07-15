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
              <CSelect size="lg" value="1" v-model="deviceTypes" placeholder="請選擇" :options="value_deviceTypesList" />
            </CCol>
          </CRow>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_ipAddress }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="IpAddress" />
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_port }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="Port" />
              </CCol>
            </CRow>
          </div>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_username }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="Username"/>
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_password }}
                <CInput size="lg" class="mt-2" style="width: 100%;" v-model="Password" />
              </CCol>
            </CRow>
          </div>
          
          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_parameters }}</CRow>
          <CRow>
            <CCol sm="6">
              <!-- <v-select v-model="value_deviceGroups" :options="value_deviceTypesList"  :filterable="true" class="font-control">
              </v-select> -->
              <CInput size="lg"  class="h5"  style="width: 100%;" v-model="Parameters"/>
            </CCol>
          </CRow>

          


          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_connectionString }}</CRow>
          <CRow>
            <CCol sm="12">
              <CInput size="lg"  class="h5"  style="width: 100%;" v-model="ConnectionString" />
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

        value_deviceTypesList: [4,5,6],

        // 連接資訊
        ConnectionString: ""
        
        
      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
    },
    // 拿資料 寫入資料
    computed: {
      deviceTypes: {
        get() {
          return this.$store.state.value_deviceTypes;
        },
        set(value) {
          this.$store.commit('setDeviceTypes', value);
        }
      },
      IpAddress: {
        get() {
          return this.$store.state.IpAddress;
        },
        set(value) {
          this.$store.commit('setIpAddress', value);
        }
      },
      Port: {
        get() {
          return this.$store.state.Port;
        },
        set(value) {
          this.$store.commit('setPort', value);
        }
      },
      Username: {
        get() {
          return this.$store.state.Username;
        },
        set(value) {
          this.$store.commit('setUsername', value);
        }
      },

      Password: {
        get() {
          return this.$store.state.Password;
        },
        set(value) {
          this.$store.commit('setPassword', value);
        },
      },

      Parameters: {
        get() {
          return this.$store.state.Parameters;
        },
        set(value) {
          this.$store.commit('setParameters', value);
        },
      },
    },
   

  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>