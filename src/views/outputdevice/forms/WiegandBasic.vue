<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>
9999
      <div style="height: 35px"></div>
    </div>

    <!-- 項目 -->
    <CCard>
      <CCardBody>
          <div class="mb-5">
            <h2 sm="12">{{ disp_header }}</h2>  
          </div>
          <!-- Basic -->
          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicDeviceName }}
                <CInput size="lg" class="mt-2" style="width: 100%;" />
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicDeviceGroups }}
                <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
                </v-select>
              </CCol>
            </CRow>
          </div>

          <div style="height: 35px"></div>

          <!-- Connection -->
          <div class="mb-5">
            <h2 sm="12">{{ disp_ConnectionTitle }}</h2>
          </div>
          
          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicIP }}
                <CInput size="lg" class="mt-2" style="width: 100%;" />
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicPort }}
                <CInput size="lg" class="mt-2" style="width: 100%;" />
              </CCol>
            </CRow>
          </div>

          <div style="height: 35px"></div>

          <!-- Settings -->
          <div class="mb-5">
            <h2 sm="12">{{ disp_SettingsTitle }}</h2>
          </div>

          <div class="mt-3">
            <CRow sm="12">
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicIndex }}
                <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
                </v-select>
              </CCol>
              <CCol sm="6" class="h5">
                {{ disp_WiegandBasicSystemCode }}
                <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
                </v-select>
              </CCol>
            </CRow>
          </div>

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
        disp_header: i18n.formatter.format("WiegandBasicName"),

        /**content */
        disp_WiegandBasicDeviceName: i18n.formatter.format("WiegandBasicCOlNameDeviceName"),
        disp_WiegandBasicDeviceGroups: i18n.formatter.format("WiegandBasicCOlNameDeviceGroups"),
 
        /*Connection title  */
        disp_ConnectionTitle: i18n.formatter.format("WiegandBasicTitleNameConnection"),

        /**content */
        disp_WiegandBasicIP: i18n.formatter.format("WiegandBasicCOlNameIP"),
        disp_WiegandBasicPort: i18n.formatter.format("WiegandBasicCOlNamePort"),


        // /*Settings title  */
        disp_SettingsTitle: i18n.formatter.format("WiegandBasicTitleNameSettings"),

        // /**content */
        disp_WiegandBasicIndex: i18n.formatter.format("WiegandBasicCOlNameIndex"),
        disp_WiegandBasicSystemCode: i18n.formatter.format("WiegandBasicCOlNameSystemCode"),


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