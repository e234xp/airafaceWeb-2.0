<template>
  <div id="wrapper">
    <!-- 標題 -->
  
    <div>
      <h2 sm="12">{{ disp_headertitle }}</h2>  
    </div>
    <!-- Basic -->
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceName }}</CRow>
    <CRow>
      <CCol sm="6">
        <CInput size="lg"  class="h5"  v-model="localStep1form.name"  />
      </CCol>
    </CRow>
    {{ localStep1form }}
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceGroups }}</CRow>
    <CRow>
      <CCol sm="6">
        <multiselect placeholder="" v-model="localStep1form.divice_groups" :options="value_deviceGroupsList" :multiple="true"
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
    
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_type }}</CRow>
    <CRow>
      <CCol sm="6">
        <CSelect size="lg" value="1" v-model="localStep1form.stream_type" placeholder="請選擇" :options="value_deviceTypesList" />
      </CCol>
    </CRow>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_ipAddress }}
          <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.ip_address" />
        </CCol>
        <CCol sm="6" class="h5">
          {{ disp_port }}
          <CInput size="lg" class="mt-2" style="width: 100%;" v-model.number="localStep1form.port" />
        </CCol>
      </CRow>
    </div>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_username }}
          <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.user"/>
        </CCol>
        <CCol sm="6" class="h5">
          {{ disp_password }}
          <CInput size="lg" type="password" class="mt-2" style="width: 100%;" v-model="localStep1form.pass" />
        </CCol>
      </CRow>
    </div>
    
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_parameters }}</CRow>
    <CRow>
      <CCol sm="6">
        <CInput size="lg"  class="h5"  style="width: 100%;" v-model="localStep1form.connection_info"/>
      </CCol>
    </CRow>

    

  <!-- <div v-if="showConnectionString">
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_connectionString }}</CRow>
    <CRow>
      <CCol sm="12">
        <CInput size="lg"  class="h5"  style="width: 100%;" v-model="ConnectionString" disabled="disabled"/>
      </CCol>
    </CRow>
  </div> -->
       

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
    name: "ModifyCamerasStep1Form",
    props:{
      step1form: Object
    },
    data() {
      return {
        localStep1form: { ...this.step1form }, // 本地保存父组件传递的 form 数据
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
        disp_headertitle: i18n.formatter.format("VideoDeviceBasic"),
        // disp_header: i18n.formatter.format("VideoDeviceBasic"),

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

        //設備群組 下拉選項
        value_deviceGroupsList: ["A","B","C"],

        //設備類型
        value_deviceTypesList:["rtsp", "SDP"]

      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
    },
    watch: {
      localStep1form: {
        handler(newValue) {
          console.log('emit updateStep1form')
          this.$emit('updateStep1form', { ...newValue });
        },
        deep: true,
      },
    }

    
    // watch: {
    //   localStep1form: {
    //     immediate: true,
    //     handler(newValue) {
    //       // 当父组件传递的 form prop 发生变化时，将其保存到本地的 localForm 中
    //       this.localStep1form = { ...newValue };
    //     },
    //   },
      
    // },
    // methods: {
    //   updateForm() {
    //     // 触发自定义事件将更新后的 localForm 数据传递回父组件
    //     this.$emit("updateForm", this.localStep1form);
    //   },
    // },

  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>