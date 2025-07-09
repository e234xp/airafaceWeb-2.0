<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CEventForm :form-data="$data" :enable-admin-field="true" :modify-mode="false" :can-modify="canModify"
          :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CEventForm from './forms/EventForm.vue';

  export default {
    name: 'CreateEventControlSetting',
    components: { CEventForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
        value_item: {},
        value_mode: 'create',
      };
    },
    created() {
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'Eventcontrolmanagement' });
    },
    methods: {
      canModify() {
        return !(this.$globalAiraManagerSettings.manager_enable === true);
      },
      async onFinish(data, cb) {
        await this.$globalCreateEventHandle(data, cb);
      },
    },
  };
</script>