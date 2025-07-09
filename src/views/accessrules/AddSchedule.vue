<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CScheduleForm :formData="$data" :modifyMode="false" :onFinish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CScheduleForm from './forms/ScheduleForm.vue';

  export default {
    name: 'AddSchedule',
    components: { CScheduleForm },
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
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'ScheduleManagement' });
    },
    methods: {
      onFinish(data, cb) {
        const self = this;

        self.$globalCreateSchedule(data, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>