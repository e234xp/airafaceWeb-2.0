<template>
  <div>
    <CRow>
      <CCol sm="12">
        <OccupancyControlSettingForm :formData="$data" :onFinish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from "@/i18n"

  import OccupancyControlSettingForm from './forms/OccupancyControlSettingForm.vue'

  export default {
    name: 'ModifyOccupancyControlSetting',
    components: { OccupancyControlSettingForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
      };
    },
    created() {
      const self = this;
    },
    mounted() {
      
    },
    methods: {
      onFinish(modifiedSetting, cb) {
        const self = this;

        self.$globalSetDisplaySetting(modifiedSetting, function (err, result) {
          if (cb) cb(err == null, result);
        });
      }
    }
  }
</script>