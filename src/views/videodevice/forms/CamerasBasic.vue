<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>

      <div style="height: 35px"></div>
    </div>

    <!-- 項目 -->
    <CCard>
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

          <!-- <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceGroups }}</CRow>
          <CRow>
            <CCol sm="6">
              <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
              </v-select>
             
            </CCol>
          </CRow> -->

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
          <div>
            <h2 sm="12">{{ disp_subtitle }}</h2>
          </div>
          
          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_Type }}</CRow>
          <CRow>
            <CCol sm="6">
              <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
              </v-select>
            </CCol>
          </CRow>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_ConnectionString }}</CRow>
          <CRow>
            <CCol sm="12">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>

          <!-- ROI -->
          <!-- <CTab>
            <template slot="title">
              <CIcon name="cil-crop" /> ROI
            </template>
            <div class="py-2"></div>
            <CButton color="primary" @click="getImage"> 取得影像
            </CButton>
            &nbsp;
            <CButton color="primary" @click="removeRegion"> {{ $t('Devices.Remove_ROI') }}
            </CButton>

            <div style="display: flex; justify-content: center; align-items: center;">
              <div class="form-row">
                <div class="form-group col-md-12"
                  style="display: flex; justify-content: center; align-items: center;">
                  <canvas ref="sketchpad" id="canvas" width="1024" height="576"></canvas>
                </div>
              </div>
            </div>

          </CTab> -->

          <!-- Face Capture -->
          <div>
            <h2 sm="12">{{ disp_subtitleFaceCapture }}</h2>
          </div>
          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5" >
                {{ disp_faceMinimumWidth }}
                <CInput size="lg" class="mt-3" style="width: 100%;" />
              </CCol>
              <CCol sm="6" class="h5"  >
                {{ disp_faceMinimumHeight }}
                <CInput size="lg" class="mt-3" style="width: 100%;" />
              </CCol>
            </CRow>
          </div>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="isChecked" value="" id="checkbox1">
            <label class="form-check-label mt-2" for="flexCheckDefault">
              {{ disp_frontalFaceFilter }}
            </label>
          </div>
          <!-- <CInputCheckbox class="form-check ml-1 mb-4" v-model="isChecked" id="checkbox1" label="Frontal face filter" /> -->

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

          <CRow sm="6" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_antiSpoofingScore }}</CRow>
          <CRow>
            <CCol sm="6">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>


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
        disp_faceMinimumWidth: i18n.formatter.format("VideoBasicCOlNameFaceMinimumWidth"),
        disp_faceMinimumHeight: i18n.formatter.format("VideoBasicCOlNameFaceMinimumHeight"),
        disp_frontalFaceFilter: i18n.formatter.format("VideoBasicCOlNameFrontalFaceFilter"),

        disp_targetScore: i18n.formatter.format("VideoBasicCOlNameTargetScore"),
        disp_captureInterval: i18n.formatter.format("VideoBasicCOlNameCaptureInterval"),
        disp_antiSpoofingScore: i18n.formatter.format("VideoBasicCOlNameAntiSpoofingScore"),

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