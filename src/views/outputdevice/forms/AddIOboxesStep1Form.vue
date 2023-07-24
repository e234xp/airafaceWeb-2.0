<template>
    <div id="wrapper">
      <!-- 標題 -->
      <div>
      <CCol sm="12">
          <td class="h1">{{ disp_header }}</td>
      </CCol>

      <div style="height: 35px"></div>
      </div>
      <!-- Basic -->
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5" >
            {{ disp_IOBoxesBasicBrand }}
            <v-select  v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
            </v-select>
          </CCol>
          <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicModel }}
            <v-select  v-model="value_deviceGroups" :options="value_deviceGroupsList"  :filterable="true" class="font-control mt-2">
            </v-select>
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicDeviceName }}
            <CInput size="lg" class="mt-2" style="width: 100%;" />
          </CCol>
          <CCol sm="6" class="h5" >
            {{ disp_IOBoxesBasicDeviceGroups }}
            <multiselect class="mt-2"  v-model="value_deviceGroups" placeholder="" :options="value_deviceGroupsList" :multiple="true"
              :taggable="true" :hideSelected="true" 
              :show-no-options="false"
            >
            </multiselect>
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
  name: "AddCamerasStep1Form",
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
      disp_header: i18n.formatter.format("I/OBoxesBasicName"),

      /**content */
      disp_IOBoxesBasicBrand: i18n.formatter.format("I/OBoxesBasicCOlNameBrand"),
      disp_IOBoxesBasicModel: i18n.formatter.format("I/OBoxesBasicCOlNameModel"),
      disp_IOBoxesBasicDeviceName: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceName"),
      disp_IOBoxesBasicDeviceGroups: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceGroups"),

      /**v-model */
      value_deviceGroups: "", /**選單 */
      value_deviceGroupsList: [1,2,3]
    };
  },
  components: {
    "v-select": VueSelect,
    multiselect: Multiselect,
  },
  created() {
    this.defaultCamerasValue(); //Cameras Name default Value
    this.defaultPortValue();
    this.localStep1form.user = "admin",
    this.localStep1form.pass = "123456"
    this.localStep1form.connection_info = "/media/video1"
  }, 
  computed: {
  //連接資訊   let testString = "rtsp://admin:12345@192.168.10.171:554/media/video1";
    ConnectionString() {
      return `${this.localStep1form.stream_type}://${this.localStep1form.user}:${this.localStep1form.pass.replace(/./g, '*')}@${this.localStep1form.ip_address}:${this.localStep1form.port}${this.localStep1form.connection_info}`;
    },
    showConnectionString() {
      // 判断輸入框是否都不為空
      return this.localStep1form.ip_address !== '' && this.localStep1form.port !== '' && this.localStep1form.user !== '' && this.localStep1form.pass !== '' && this.localStep1form.connection_info !== '';
    },
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
    localStep3form: {
        handler(newValue) {
        console.log('emit updateStep3form')
        this.$emit('updateStep3form', { ...newValue });
        },
        deep: true,
    },
  },
  methods: {
    setInitialName(camerasLength,cameraList) {
        let name = `Camera-${camerasLength + 1}`;
        
        // Check for duplicates, if found, increment the number and check again
        while (this.isDuplicateName(cameraList,name)) {
        camerasLength++;
        name = `Camera-${camerasLength + 1}`;
        }
        console.log("名稱",name)
        console.log("名稱",this.localStep1form.name)
        this.localStep1form.name = name;
    },
    isDuplicateName(cameraList,name) {
        // Check if the name is already in the cameras array
        return cameraList.some((camera) => camera.name === name);
    },

    // get Cameras total
    async defaultCamerasValue(cb) {
        const self = this;
        let ret = await self.$globalFindCameras("", 0,3000, cb);
        console.log(ret,"拿到的資料")
        const totalLength = ret.data.total_length;
        const cameraList = ret.data.camera_list;
        this.setInitialName(totalLength,cameraList)
        console.log(cameraList,"拿到的資料list")
        
    },

    defaultPortValue() {
      this.localStep1form.port = 554;
      return this.localStep1form.port !== null && this.localStep1form.port >= 0 && this.localStep1form.port <= 65535;
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