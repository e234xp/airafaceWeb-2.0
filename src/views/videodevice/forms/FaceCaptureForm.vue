<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{ disp_subtitleFaceCapture }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Face Capture -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5" >
          {{ disp_faceMinimumSize }}
          <CInput size="lg" class="mt-3" style="width: 100%;" v-model="faceMinimumSize"
          :invalid-feedback="disp_limitNumbers"
          valid-feedback="ok"
          :is-valid="limitNumber"
          required
          placeholder=""
          />
        </CCol>
      </CRow>
      
      <CRow sm="6" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_targetScore }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" v-model="targetScore"
          :invalid-feedback="disp_limitNumber0to1"
          valid-feedback="ok"
          :is-valid="limitNumber0to1"
          required
          placeholder=""/>
        </CCol>
      </CRow>

      <CRow sm="6" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_captureInterval }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" v-model="captureInterval"
          :invalid-feedback="disp_limitNumbers"
          valid-feedback="ok"
          :is-valid="limitNumber"
          required
          placeholder=""/>
        </CCol>
      </CRow>
      
    </div>

  </div>
</template>
  
<script>
  import {  mapState, mapMutations  } from "vuex";
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
        disp_limitNumbers: i18n.formatter.format("limitNumbers"),
        disp_limitNumber0to1: i18n.formatter.format("limitNumber0to1"),

        
      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
    },
    computed: {
      targetScore: {
        get() {
          return this.$store.state.targetScore;
        },
        set(value) {
          this.$store.commit('set', ['TargetScore',value]);
        }
      },

      captureInterval: {
        get() {
          return this.$store.state.captureInterval;
        },
        set(value) {
          this.$store.commit('setCaptureInterval', value);
        },
      },

      faceMinimumSize: {
        get() {
          return this.$store.state.faceMinimumSize;
        },
        set(value) {
          this.$store.commit('setFaceMinimumSize', value);
        },
      },
    },
    methods: {
     
      limitNumber0to1(val) {
        if (!/^[01]$/.test(val)) {
          return false;
        }
        return true;
      },
      limitNumber(value) {
        if (!/^[0-9]/.test(value)) {
          return false;
        }
        return true;
      }
    },

   
  
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>