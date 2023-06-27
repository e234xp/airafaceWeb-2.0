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
import i18n from "@/i18n";

import EventControlSettingForm from "./forms/EventControlSettingForm.vue";

export default {
  name: "ModifyEventControlSetting",
  components: { EventControlSettingForm },
  data() {
    return {
      value_eventControlSetting: null,

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : "",
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : "",
      value_group_list: this.$route.params.value_group_list
        ? this.$route.params.value_group_list
        : [],
      value_exstingEventControlSettingsList: this.$route.params
        .value_exstingEventControlSettingsList
        ? this.$route.params.value_exstingEventControlSettingsList
        : [],

      disp_header: i18n.formatter.format("ModifyEventControl"),
      flag_modifyMode: true,
      //flag_currentSetp : 0
    };
  },
  created() {
    const self = this;
    if (self.value_returnRoutePath === "")
      self.$router.push({ name: "EventControlManagement" });
    if (self.$route.params.value_eventControlSetting)
      self.value_eventControlSetting = self.$route.params.value_eventControlSetting;
  },
  mounted() {},
  methods: {
    onFinish(modifiedSetting, cb) {
      const self = this;

      let type = modifiedSetting.eventControlType;
      delete modifiedSetting.eventControlType;

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
          const actListWithoutModifiedData = actionList.filter((act) => {
            return act.uuid != modifiedSetting.uuid;
          });
          actListWithoutModifiedData.push(modifiedSetting);

          switch (type) {
            case "line notify":
              eventSettings.line_actions_list = actListWithoutModifiedData;
              break;
            case "http command":
              eventSettings.http_actions_list = actListWithoutModifiedData;
              break;
            case "send mail":
              eventSettings.mail_actions_list = actListWithoutModifiedData;
              break;
          }

          self.$globalSetEventSetting(eventSettings, function (err, result) {
            if (cb) cb(err == null, result);
          });
        } else {
          if (cb) cb(false, null);
        }
      });
    },
  },
};
</script>
