<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CActionRuleForm :formData="$data" :modifyMode="false" :onFinish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CActionRuleForm from './forms/ActionRuleForm.vue';

  export default {
    name: 'AddActionRule',
    components: { CActionRuleForm },
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
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'ActionRuleManagement' });
    },
    methods: {
      onFinish(data, cb) {
        const self = this;

        self.$globalCreateActionRule(data, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>