<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CHttpNotifyForm :form-data="$data" :modify-mode="true" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CHttpNotifyForm from './forms/HttpNotifyForm.vue';

  export default {
    name: 'ModifyHttpNotify',
    components: { CHttpNotifyForm },
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
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'HttpNotifyManagement' });
    },
    methods: {
      onFinish(data, cb) {
        this.$globalModifyHttpNotify(data, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>