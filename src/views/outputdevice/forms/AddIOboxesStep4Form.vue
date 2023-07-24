<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{  disp_DigitalOutPut2Title }}</h2>
    </div>
  
    <!-- 項目 -->
    <!-- Digital OutPut2 -->
    <div class="form-check mb-3 ml-2">
      <input class="form-check-input" type="checkbox" v-model="isChecked" value="" id="flexCheckDefault">
      <label class="form-check-label mt-2" for="flexCheckDefault">
        {{ disp_IOBoxesBasicEnable }}
      </label>
    </div>
    
    <CRow sm="6" class="h5 ml-2 mb-3">{{ disp_IOBoxesBasicDefaultValue }}</CRow>
    <CRow>
      <CCol sm="6">
        <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control">
        </v-select>
      </CCol>
    </CRow>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicValueWhenTriggered }}
          <v-select v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
          </v-select>
        </CCol>
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicDurationWhenTriggered }}
          <CInput size="lg" class="mt-1" style="width: 100%;" />
        </CCol>
      </CRow>
    </div>

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
        disp_header: i18n.formatter.format("I/OBoxesBasicName"),

        /**content */
        disp_IOBoxesBasicBrand: i18n.formatter.format("I/OBoxesBasicCOlNameBrand"),
        disp_IOBoxesBasicModel: i18n.formatter.format("I/OBoxesBasicCOlNameModel"),
        disp_IOBoxesBasicDeviceName: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceName"),
        disp_IOBoxesBasicDeviceGroups: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceGroups"),

        /*Connection title  */
        disp_ConnectionTitle: i18n.formatter.format("I/OBoxesBasicTitleNameConnection"),

        /**content */
        disp_IOBoxesBasicIP: i18n.formatter.format("I/OBoxesBasicCOlNameIP"),
        disp_IOBoxesBasicPort: i18n.formatter.format("I/OBoxesBasicCOlNamePort"),
        disp_IOBoxesBasicUserName: i18n.formatter.format("I/OBoxesBasicCOlNameUserName"),
        disp_IOBoxesBasicPassword: i18n.formatter.format("I/OBoxesBasicCOlNamePassword"),

        // /*Digital output1 title  */
        disp_DigitalOutPut1Title: i18n.formatter.format("I/OBoxesBasicTitleNameDigitalOutPut1"),

        // /**content */
        disp_IOBoxesBasicEnable: i18n.formatter.format("I/OBoxesBasicCOlNameEnable"),
        disp_IOBoxesBasicDefaultValue: i18n.formatter.format("I/OBoxesBasicCOlNameDefaultValue"),
        disp_IOBoxesBasicValueWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameValueWhenTriggered"),
        disp_IOBoxesBasicDurationWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameDurationWhenTriggered"),

        // /*Digital output2 title  */
        disp_DigitalOutPut2Title: i18n.formatter.format("I/OBoxesBasicTitleNameDigitalOutPut2"),




        disp_save: i18n.formatter.format("Save"),

        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3]
      };
    },
    components: {
      "v-select": VueSelect,
      Multiselect: Multiselect
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