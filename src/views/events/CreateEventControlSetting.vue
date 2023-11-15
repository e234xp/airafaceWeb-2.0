<template>
  <div>
    <CRow>
      <CCol sm="12">
        <EventControlSettingForm :formData="$data" :onFinish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';

  import EventControlSettingForm from './forms/EventControlSettingForm.vue'

  export default {
    name: 'CreateEventControlSetting',
    components: { EventControlSettingForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
        value_group_list: this.$route.params.value_group_list ? this.$route.params.value_group_list : [],
        value_exstingAccessControlSettingsList: this.$route.params.value_exstingAccessControlSettingsList ? this.$route.params.value_exstingAccessControlSettingsList : [],

        disp_header: i18n.formatter.format("CreateEventControl"),
        flag_modifyMode: false,
        //flag_currentSetp : 0
      };
    },
    created() {
      const self = this;
      if (self.value_returnRoutePath === "") self.$router.push({ name: 'EventControlManagement' });
    },
    mounted() {

    },
    methods: {
      onFinish(newSetting, cb) {
        const self = this;

        let type = newSetting.eventControlType ;
        delete newSetting.eventControlType ;

        self.$globalGetEventSetting(function (err, data) {
          if (!err) {
            const eventSettings = data;

            let actionList = [];
            switch (type) {
              case "line notify":
                actionList = eventSettings.line_actions_list;
                break;
              case "http command":
                actionList = eventSettings.http_actions_list;
                break;
              case "send mail":
                actionList = eventSettings.mail_actions_list;
                break;
            }

            if (!actionList) actionList = [];
            const actListWithoutModifiedData = actionList.filter(act => {
              return act.uuid != newSetting.uuid;
            });
            actListWithoutModifiedData.push(newSetting);
            
            switch (type) {
              case "line notify":
                eventSettings.line_actions_list = actListWithoutModifiedData ;
                break;
              case "http command":
                eventSettings.http_actions_list = actListWithoutModifiedData ;
                break;
              case "send mail":
                eventSettings.mail_actions_list = actListWithoutModifiedData ;
                break;
            }

            self.$globalSetEventSetting(eventSettings, function (err, result) {
              if (cb) cb(err == null, result);
            });
          }
          else {
            if (cb) cb(false, null);
          }
        });
      }
    }
  }
</script>