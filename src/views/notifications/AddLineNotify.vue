<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CLineNotifyForm
          :formData="$data"
          :modifyMode="false"
          :onFinish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CLineNotifyForm from './forms/LineNotifyForm.vue';

export default {
  name: 'AddLineNotify',
  components: { CLineNotifyForm },
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
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'LineNotifyManagement' });
  },
  methods: {
    onFinish(data, cb) {
      const self = this;

      self.$globalCreateLineNotify(data, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
