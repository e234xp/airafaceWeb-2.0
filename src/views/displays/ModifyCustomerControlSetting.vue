<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CustomerControlSettingForm
          :form-data="$data"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CustomerControlSettingForm from './forms/CustomerControlSettingForm.vue';

export default {
  name: 'ModifyCustomerControlSetting',
  components: { CustomerControlSettingForm },
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
