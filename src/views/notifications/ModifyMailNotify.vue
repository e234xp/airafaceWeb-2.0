<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CMailNotifyForm :form-data="$data" :modify-mode="true" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CMailNotifyForm from './forms/MailNotifyForm.vue';

  export default {
    name: 'ModifyMailNotify',
    components: { CMailNotifyForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath
          ? this.$route.params.value_returnRoutePath
          : '',
        value_returnRouteName: this.$route.params.value_returnRouteName
          ? this.$route.params.value_returnRouteName
          : '',
        value_allRecords: [],
        value_settingitem: this.$route.params.value_item
          ? this.$route.params.value_item
          : {},
      };
    },
    created() {
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'MailNotifyManagement' });
    },
    methods: {
      onFinish(data, cb) {
        this.$globalModifyMailNotify(data, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>