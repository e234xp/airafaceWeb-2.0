<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CAccountForm
          :form-data="$data"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CAccountForm from './forms/AccountForm.vue';

export default {
  name: 'CreateAccount',
  components: { CAccountForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
      value_account_list: this.$route.params.value_account_list ? this.$route.params.value_account_list : [],

      disp_header: this.$t('CreateAccount'),
      flag_modifyMode: false,
    };
  },
  created() {
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'AccountManagement' });
  },
  methods: {
    onFinish(data, cb) {
      const dataForCreate = {
        username: data.username,
        password: data.password,
        permission: data.permission,
        remarks: data.remarks,
      };

      this.$globalCreateAccount(dataForCreate, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
