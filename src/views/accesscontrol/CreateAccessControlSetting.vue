<template>
  <div>
    <CRow>
      <CCol sm="12">
        <AccessControlSettingForm
        :formData="$data"
        :onFinish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from "@/i18n"
import AccessControlSettingForm from './forms/AccessControlSettingForm.vue'

export default {
  name: 'CreateAccessControlSetting',
  components: { AccessControlSettingForm },
  data () {
    return {
      value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
      value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
      value_group_list : this.$route.params.value_group_list ? this.$route.params.value_group_list : [],
      value_exstingAccessControlSettingsList : this.$route.params.value_exstingAccessControlSettingsList ? this.$route.params.value_exstingAccessControlSettingsList : [],

      disp_header: i18n.formatter.format("CreateAccessControl"),
      flag_modifyMode : false,
      //flag_currentSetp : 0
    };
  },
  created() {
    if( this.value_returnRoutePath === "" ) this.$router.push({ name: 'AccessControlManagement' });
  },
  mounted () {

  },
  methods: {
    onFinish( newSetting, cb ) {
      const self = this;
      self.$globalGetTabletSetting( function( err, data ) {
        if( !err ) {
          const tabletSettings = data;
          //self.value_allTableItems = data.access_control_schedule_list;
          if( !tabletSettings.access_control_schedule_list ) tabletSettings.access_control_schedule_list = [];
          tabletSettings.access_control_schedule_list.push( newSetting );
          self.$globalSetTabletSetting( tabletSettings, function( err, result ) {
            if( cb ) cb( err == null, result );
          });
        }
        else {
          if( cb ) cb( false, null );
        }
      });
    }
  }
}
</script>
