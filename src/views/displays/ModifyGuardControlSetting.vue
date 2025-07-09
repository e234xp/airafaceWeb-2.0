<template>
  <div>
    <CRow>
      <CCol sm="12">
        <GuardControlSettingForm :form-data="$data" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import GuardControlSettingForm from './forms/GuardControlSettingForm.vue';

  export default {
    name: 'ModifyGuardControlSetting',
    components: { GuardControlSettingForm },
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
    mounted() {

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