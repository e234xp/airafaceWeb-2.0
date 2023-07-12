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
        console.log("參數確認",data)
        
        const dataForAdd = {
          name: data.name,
          divice_groups: data.divice_groups,
          stream_type: data.stream_type,

          ip_address: data.ip_address,
          port: data.port,
          user: data.user,
          pass: data.pass,
          connection_info: data.connection_info,
          
          //connectionString: data.connectionString,

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
        };
        self.$globalCreateCameras( dataForAdd, ( error, result ) => {
          if( cb ) cb( error == null, result );
        });
      }
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>