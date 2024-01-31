<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CScheduleForm
          :form-data="$data"
          :modify-mode="true"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CScheduleForm from './forms/ScheduleForm.vue';

export default {
  name: 'ModifySchedule',
  components: { CScheduleForm },
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
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'ScheduleManagement' });
  },
  methods: {
    onFinish(data, cb) {
      this.$globalModifySchedule(data, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
