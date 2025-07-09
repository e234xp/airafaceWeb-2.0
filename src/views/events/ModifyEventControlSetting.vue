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
    name: 'ModifyEventControlSetting',
    components: { CEventForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
        value_item: this.$route.params.value_item ? this.$route.params.value_item : null,
        value_mode: 'modify',
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
        await this.$globalModifyEventHandle({
          uuid: this.value_item.uuid,
          data: {
            ...data,
          },
        }, cb);
      },
    },
  };
</script>