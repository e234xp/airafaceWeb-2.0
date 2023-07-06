<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CameraForm
        :formData="$data"
        :onFinish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>
  
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  import CameraForm from './forms/CameraForm.vue'


  import VueSelect from 'vue-select';
  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";
	



  export default {
    name: "AddCameras",
    data() {
      return {
        value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
      };
    },
    components: {
      "v-select": VueSelect,
      multiselect: Multiselect,
      CameraForm: CameraForm
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
   
    methods: {
      onFinish( data, cb ) {
        const self = this;
        const dataForAdd = {
          name: data.value_deviceName,
          divice_groups: data.value_deviceGroups,
          stream_type: data.value_deviceType,

          ip_address: ip,
          port: port,
          user: user,
          pass: password,
          connection_info: filePath,
          
          connectionString: data.value_deviceConnectionString,

          capture_interval: data.value_deviceCaptureInterval,
          target_score: data.value_deviceTargetScore,
          roi: [
              {
                  "x1": 0,
                  "y1": 0,
                  "x2": 0,
                  "y2": 0
              }
          ],
          face_min_length: data.value_deviceFaceMinimumSize,
        };
        self.$globalCreatePerson( dataForAdd, ( error, result ) => {
          if( cb ) cb( error == null, result );
        });
      }
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>