<template>
  <div>
    <CRow>
      <CCol sm="12">
        <WelcomeControlSettingForm :form-data="$data" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import WelcomeControlSettingForm from './forms/WelcomeControlSettingForm.vue';

  export default {
    name: 'ModifyWelcomeControlSetting',
    components: { WelcomeControlSettingForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath
          ? this.$route.params.value_returnRoutePath
          : '',
        value_returnRouteName: this.$route.params.value_returnRouteName
          ? this.$route.params.value_returnRouteName
          : '',
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