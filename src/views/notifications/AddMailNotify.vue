<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CMailNotifyForm
          :form-data="$data"
          :modify-mode="false"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CMailNotifyForm from './forms/MailNotifyForm.vue';

export default {
  name: 'AddMailNotify',
  components: { CMailNotifyForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : '',
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : '',
      value_allRecords: this.$route.params.value_allRecords
        ? this.$route.params.value_allRecords
        : [],
      value_settingitem: {},
    };
  },
  created() {
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'MailNotifyManagement' });
  },
  methods: {
    onFinish(data, cb) {
      this.$globalCreateMailNotify(data, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
