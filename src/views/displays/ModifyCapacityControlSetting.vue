<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CapacityControlSettingForm
          :form-data="$data"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CapacityControlSettingForm from './forms/CapacityControlSettingForm.vue';

export default {
  name: 'ModifyCapacityControlSetting',
  components: { CapacityControlSettingForm },
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
