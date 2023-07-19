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
        <CInput size="lg"  class="h5"  v-model="deviceName"  @input="updateDeviceName()"/>
      </CCol>
    </CRow>

    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_basicDeviceGroups }}</CRow>
    <CRow>
      <CCol sm="6">
        <multiselect placeholder="" :options="value_deviceGroupsList" :multiple="true"
            :taggable="true" :hideSelected="true" 
            :show-no-options="false"
          >
        </multiselect>

        <!-- {{ deviceGroups }} -->
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

    

  <div v-if="showConnectionString">
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_connectionString }}</CRow>
    <CRow>
      <CCol sm="12">
        <CInput size="lg"  class="h5"  style="width: 100%;" v-model="ConnectionString" disabled="disabled"/>
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
    name: "BasicAndVideoSourceForm",
    props:{
      parentDeviceName: String //字串型別
    },
    data() {
      return {
        deviceName:  this.parentDeviceName,
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
        value_deviceTypesList:[1,2,3]

      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
    },                   
    // 拿資料 寫入資料
    computed: {
      //連接資訊   let testString = "rtsp://admin:12345@192.168.10.171:554/media/video1";
      ConnectionString() {
        return `rtsp://${this.Username}:${this.Password}@${this.IpAddress}:${this.Port}${this.Parameters}`;
      },
      showConnectionString() {
      // 判断输入框1到5是否都不为空
        return this.IpAddress !== '' && this.Port !== '' && this.Username !== '' && this.Password !== '' && this.Parameters !== '';
      },
      // value: {
      //   get() {
      //     return this.deviceName
      //   },
      //   set(value) {
      //     this.$emit('update:deviceName', value)
      //   }
      // },
    
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
    methods: {
      updateDeviceName() {
        console.log("子傳遞",this.deviceName)
        this.$emit('updateDevice', this.deviceName);
      }
    },
   

  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>