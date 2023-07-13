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
    name: "ModifyCameras",
    data() {
      return {
        value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
        disp_header: i18n.formatter.format("ModifyAccessControl"), //編輯設備
        value_cameraUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : "",

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
    mounted(){
      console.log(this.value_cameraUuid,"ID是什麼")
    },
    methods: {
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
        self.$globalModifyPerson( dataForModify, ( error, result ) => {
          if( cb ) cb( error == null, result );
        });
      }
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>