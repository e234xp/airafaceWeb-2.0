<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CEventForm
          :form-data="$data"
          :enable-admin-field="true"
          :modify-mode="false"
          :can-modify="canModify"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CEventForm from './forms/EventForm.vue';

export default {
  name: 'AddPerson',
  components: { CEventForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
      value_allPerson: this.$route.params.value_allPerson ? this.$route.params.value_allPerson : [],

      flag_jcurrentSetp: 0,

      value_personId: '',
      value_personName: '',

      value_assignedGroupList: null,
    };
  },
  created() {
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'Eventcontrolmanagement' });

    console.log(this.$route);
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
