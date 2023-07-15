<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CameraForm
        :formData="$data"
        :enableAdminField="true"
        :modifyMode="true"
        :canModify="canModify"
        :onFinish="onFinish"
        
        />
      </CCol>
      <!-- {{targetScore}} -->
      <!-- getFaceMinimumSize: {{ getFaceMinimumSize }}
      getTargetScore: {{ getTargetScore }}
      getCaptureInterval: {{ getCaptureInterval }} -->
    </CRow>
  </div>
</template>
  
<script>
  import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';

  import i18n from "@/i18n";

  import CameraForm from './forms/CameraForm.vue'


  export default {
    name: "ModifyCameras",
    components: { CameraForm: CameraForm },
    data() {
      return {
        value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",

        disp_header: i18n.formatter.format("ModifyCameras"), //編輯設備
        value_cameraUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : "",
        
        // 第一步驟
        deviceName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : "",
        value_deviceGroups: this.$route.params.item && this.$route.params.item.divice_groups ? this.$route.params.item.divice_groups : "",
        // 第三步驟
        // captureInterval: this.$route.params.item && this.$route.params.item.capture_interval ? this.$route.params.item.capture_interval : "",
        // targetScore: this.$route.params.item && this.$route.params.item.target_score ? this.$route.params.item.target_score : "",
        // faceMinimumSize: this.$route.params.item && this.$route.params.item.face_min_length ? this.$route.params.item.face_min_length : "",
        
      };
    },
    mounted(){
      console.log(this.value_cameraUuid,"ID是什麼")
      console.log(this.deviceName,"name是什麼")
      console.log(this.$route.params.item,"print item")

    },
 
    // 給預設值 把那一支設備裡面的資料拿出來
    created() {
      let targetScoreValue = "";
      if (this.$route.params.item && this.$route.params.item.target_score !== undefined) {
        targetScoreValue = this.$route.params.item.target_score;
      }
      this.setTargetScore(targetScoreValue); 
      
      
      let faceMinimumSize = "";
      if (this.$route.params.item && this.$route.params.item.face_min_length !== undefined) {
        faceMinimumSize = this.$route.params.item.face_min_length;
      }
      this.setFaceMinimumSize(faceMinimumSize);

      let captureInterval = "";
      if (this.$route.params.item && this.$route.params.item.capture_interval !== undefined) {
        captureInterval = this.$route.params.item.capture_interval;
      }
      this.setCaptureInterval(captureInterval);
      
      // Video Source
      let DeviceTypes = "";
      if (this.$route.params.item && this.$route.params.item.stream_type !== undefined) {
        DeviceTypes = this.$route.params.item.stream_type;
      }
      this.setDeviceTypes(DeviceTypes);

      let IpAddress = "";
      if (this.$route.params.item && this.$route.params.item.ip_address !== undefined) {
        IpAddress = this.$route.params.item.ip_address;
      }
      this.setIpAddress(IpAddress);

      let Port = "";
      if (this.$route.params.item && this.$route.params.item.port !== undefined) {
        Port = this.$route.params.item.port;
      }
      this.setPort(Port);

      let Username = "";
      if (this.$route.params.item && this.$route.params.item.user !== undefined) {
        Username = this.$route.params.item.user;
      }
      this.setUsername(Username);

      let Password = "";
      if (this.$route.params.item && this.$route.params.item.pass !== undefined) {
        Password = this.$route.params.item.pass;
      }
      this.setPassword(Password);
      
      let Parameters = "";
      if (this.$route.params.item && this.$route.params.item.connection_info !== undefined) {
        Parameters = this.$route.params.item.connection_info;
      }
      this.setParameters(Parameters);
    },
    methods: {
      // 預設值
      ...mapMutations(['setTargetScore','setFaceMinimumSize','setCaptureInterval', 'setDeviceTypes', 'setIpAddress', 'setPort', 'setUsername', 'setPassword', 'setParameters']),
      canModify () {
        return !(this.$globalAiraManagerSettings.manager_enable === true);
      },
      onFinish( data, cb ) {
        const self = this;
        const dataForModify = {
            uuid : self.value_cameraUuid,
            data : {
              name: data.name,
              divice_groups: data.divice_groups,
              stream_type: data.stream_type,

              ip_address: data.ip_address,
              port: data.port,
              user: data.user,
              pass: data.pass,
              connection_info: data.connection_info,

              capture_interval: data.capture_interval,
              target_score: data.target_score,
              roi: [
                  {
                      "x1": 0,
                      "y1": 0,
                      "x2": 0,
                      "y2": 0
                  }
              ],
              face_min_length: data.face_min_length,
            }
        };
        self.$globalModifyCameras( dataForModify, ( error, result ) => {
          if( cb ) cb( error == null, result );
        });
      }
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>