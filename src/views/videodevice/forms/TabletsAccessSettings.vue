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
          <!-- Basic -->
          <CRow sm="12" class="h2 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_twoFactor }}</CRow>
          <CRow>
            <CCol sm="6">
              <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
              </v-select>
            </CCol>
          </CRow>

          <div style="height: 35px"></div>

          <!-- Video Source -->
          <div>
            <h2 sm="12">{{ disp_relayTitle }}</h2>
          </div>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_Duration }}</CRow>
          <CRow>
            <CCol sm="12">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>

          <div style="height: 35px"></div>


          <!-- Temperature Mask -->
          <div>
            <h2 sm="12">{{ disp_temperatureMaskTitle }}</h2>
          </div>

          <div>
            <h4 sm="12">{{ disp_subTitleName }}</h4>
          </div>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_temperatureUnit }}</CRow>
          <CRow>
            <CCol sm="6">
              <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
              </v-select>
            </CCol>
          </CRow>
          <div style="height: 15px"></div>

          <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_threshold }}</CRow>
          <CRow>
            <CCol sm="12">
              <CInput size="lg"  class="h5"  style="width: 100%;" />
            </CCol>
          </CRow>

          <div>
            <h4 sm="12">{{ disp_faceMasks }}</h4>
          </div>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="isChecked" value="" id="checkbox1">
            <label class="form-check-label mt-2" for="flexCheckDefault">
              {{ disp_enforceFaceMaskCheck }}
            </label>
            <input class="form-check-input mt-1 ml-5" type="text" value="" id="cardNo">
          </div>
          <div style="height: 35px"></div>


          <!-- Result Display -->
          <div>
            <h4 sm="12">{{ disp_resultDisplayTitle }}</h4>
          </div>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5" >
                {{ disp_shownPhoto }}
                <v-select  v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
                </v-select>
              </CCol>
              <CCol sm="6" class="h5"  >
                {{ disp_displayDuration }}
                <CInput size="lg" class="mt-2" style="width: 100%;" />
              </CCol>
            </CRow>
          </div>

          <CRow sm="6" class="h5 ml-2 mb-3" style="text-align: right; ">{{ disp_resultPrompt }}</CRow>
          <CRow>
            <CCol sm="6">
              <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
              </v-select>
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
        disp_header: i18n.formatter.format("TabletsAccessName"),
        /**content */
        disp_twoFactor: i18n.formatter.format("TabletsAccessCOlNameTwoFactor"),


        /*Relay title  */
        disp_relayTitle: i18n.formatter.format("TabletsAccessTitleNameRelay"),
        /**content */
        disp_Duration: i18n.formatter.format("TabletsAccessCOlNameDuration"),

        
        /*Temperature & Mask title  */
        disp_temperatureMaskTitle: i18n.formatter.format("TabletsAccessTitleNameTemperatureMask"),
        /**content */
        disp_subTitleName: i18n.formatter.format("TabletsAccessSubTitleName"),
        disp_temperatureUnit: i18n.formatter.format("TabletsAccessColNameTemperatureUnit"),
        disp_threshold: i18n.formatter.format("TabletsAccessColNameThreshold"),
        disp_faceMasks: i18n.formatter.format("TabletsAccessColNameFaceMasks"),
        disp_enforceFaceMaskCheck: i18n.formatter.format("TabletsAccessColNameEnforceFaceMaskCheck"),


        /*Result display title  */
        disp_resultDisplayTitle: i18n.formatter.format("TabletsAccessTitleNameResultDisplay"),
        /**content */
        disp_shownPhoto: i18n.formatter.format("TabletsAccessColNameShownPhoto"),
        disp_displayDuration: i18n.formatter.format("TabletsAccessColNameDisplayDuration"),
        disp_resultPrompt: i18n.formatter.format("TabletsAccessColNameResultPrompt"),



        disp_save: i18n.formatter.format("Save"),

        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3]
      };
    },
    components: {
      "v-select": VueSelect,
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