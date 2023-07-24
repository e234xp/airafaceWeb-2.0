<template>
  <div id="wrapper">
    <!-- 標題 -->


    <div class="content">
        <!-- Basic -->
        <div class="mt-3">
          <CRow sm="12">
            <CCol sm="6" class="h5">
              {{ disp_WiegandBasicDeviceName }}
              <CInput size="lg" class="mt-2" />
            </CCol>
            <CCol sm="6" class="h5">
              {{ disp_WiegandBasicDeviceGroups }}
              <CSelect size="lg" v-model="value_deviceGroups" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" 
              :invalid-feedback= "$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isNotEmpty"
              required/>
            </CCol>
          </CRow>
        </div>
        
    </div>


  </div>
</template>
  
<script>
  import i18n from "@/i18n";

  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";

  export default {
    name: "CamerasBasic",
    props:{
      step1form: Object
    },
    data() {
      return {
        localStep1form: { ...this.step1form },

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


        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3]
      };
    },
    components: {
      Multiselect: Multiselect
    },
    //預設值
    created() {
      // this.defaultPortValue();
      // this.localStep3form.user = "admin",
      // this.localStep3form.pass = "123456"
      // this.localStep3form.connection_info = "/media/video1"
    }, 
    // 拿資料 寫入資料
    watch: {
      localStep1form: {
        handler(newValue) {
          console.log('emit updateStep1form')
          this.$emit('updateStep1form', { ...newValue });
        },
        deep: true,
      },
    },
    methods: {
      defaultPortValue() {
        // this.localStep3form.port = 554;
        // return this.localStep3form.port !== null && this.localStep3form.port >= 0 && this.localStep3form.port <= 65535;
      },
      // 判斷欄位空值
      isNotEmpty(value) {
        return value !== null && value !== undefined && value !== '';
      }
    },

  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>