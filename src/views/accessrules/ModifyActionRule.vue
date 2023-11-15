<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CActionRuleForm
          :formData="$data"
          :modifyMode="true"
          :onFinish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CActionRuleForm from './forms/ActionRuleForm.vue';

export default {
  name: 'ModifyActionRule',
  components: { CActionRuleForm },
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
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'ActionRuleManagement' });
  },
  methods: {
    onFinish(data, cb) {
      const self = this;
      self.$globalModifyActionRule(data, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
