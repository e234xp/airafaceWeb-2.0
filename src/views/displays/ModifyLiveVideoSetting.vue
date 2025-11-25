<template>
  <div>
    <CRow>
      <CCol sm="12">
        <LiveVideoSettingForm :form-data="$data" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import LiveVideoSettingForm from './forms/LiveVideoSettingForm.vue';

export default {
  name: 'ModifyLiveVideoSetting',
  components: { LiveVideoSettingForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
    };
  },
  methods: {
    onFinish(modifiedSetting, cb) {
      this.$globalSetDisplaySetting(modifiedSetting, (err, result) => {
        if (cb) cb(err == null, result);
      });
    },
  },
};
</script>
