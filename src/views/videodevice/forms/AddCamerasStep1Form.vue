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
        <CInput size="lg"  class="h5"  v-model="localStep1form.name"
        :invalid-feedback= "$t('NoEmptyNorSpaceNeigherRepeat')"
        valid-feedback="ok"
        :is-valid="isNotEmpty"
        required/>
            
      </CCol>
    </CRow>

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
    {{ localStep1form.stream_type }}

    <div id="type" v-if="localStep1form.stream_type !== 'rtsp'">
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_ipAddress }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.ip_address" 
            :invalid-feedback= "$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required/>
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_port }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model.number="localStep1form.port" 
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_username }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.user"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_password }}
            <CInput size="lg" type="password" class="mt-2" style="width: 100%;" v-model="localStep1form.pass" 
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>
        </CRow>
      </div>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_parameters }}</CRow>
      <CRow>
        <textarea class="ml-3 mb-3 form-control" v-model="localStep1form.connection_info" rows="5"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required>
        </textarea>
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

    <!-- 類型不等於rtsp時 -->
    <div id="type" v-else>
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_ipAddress }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.ip_address" 
            :invalid-feedback= "$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required/>
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_port }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model.number="localStep1form.port" 
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_username }}
            <CInput size="lg" class="mt-2" style="width: 100%;" v-model="localStep1form.user"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_password }}
            <CInput size="lg" type="password" class="mt-2" style="width: 100%;" v-model="localStep1form.pass" 
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required
            />
          </CCol>
        </CRow>
      </div>
      
      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_parameters }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" v-model="localStep1form.connection_info" 
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isNotEmpty"
            required/>
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

        // 文字提示
        disp_limitNumber0to1: i18n.formatter.format("limitNumber0to1"), // port 提示文字


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