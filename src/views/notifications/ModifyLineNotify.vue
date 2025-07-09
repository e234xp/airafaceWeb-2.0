<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CLineNotifyForm :form-data="$data" :modify-mode="true" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CLineNotifyForm from './forms/LineNotifyForm.vue';

  export default {
    name: 'ModifyLineNotify',
    components: { CLineNotifyForm },
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
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'LineNotifyManagement' });
    },
    methods: {
      onFinish(data, cb) {
        this.$globalModifyLineNotify(data, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>