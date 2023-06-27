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

import AccessControlSettingForm from './forms/AccessControlSettingForm.vue'

import i18n from "../../i18n"
export default {
  name: 'ModifyAccessControlSetting',
  components: { AccessControlSettingForm },
  data () {
    return {
      value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
      value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
      value_group_list : this.$route.params.value_group_list ? this.$route.params.value_group_list : [],
      value_exstingAccessControlSettingsList : this.$route.params.value_exstingAccessControlSettingsList ? this.$route.params.value_exstingAccessControlSettingsList : [],
      value_accessControlSetting : null,

      disp_header: i18n.formatter.format("ModifyAccessControl"),
      flag_modifyMode : true,
      //flag_currentSetp : 0
    };
  },
  created() {
    const self = this;
    if( self.value_returnRoutePath === "" ) self.$router.push({ name: 'AccessControlManagement' });
    if( self.$route.params.value_accessControlSetting ) self.value_accessControlSetting = self.$route.params.value_accessControlSetting;
    
  },
  methods: {
    onFinish( modifiedSetting, cb ) {
      const self = this;
      self.$globalGetTabletSetting( function( err, data ) {
        if( !err ) {
          const tabletSettings = data;
          //self.value_allTableItems = data.access_control_schedule_list;
          if( !tabletSettings.access_control_schedule_list ) tabletSettings.access_control_schedule_list = [];
          const schListWithoutModifiedData = tabletSettings.access_control_schedule_list.filter( sch => {
            return sch.uuid != modifiedSetting.uuid;
          });
          //console.log( modifiedSetting );
          schListWithoutModifiedData.push( modifiedSetting );
          tabletSettings.access_control_schedule_list = schListWithoutModifiedData;
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
