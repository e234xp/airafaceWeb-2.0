<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CAccountForm :formData="$data" :onFinish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  import CAccountForm from './forms/AccountForm.vue';

  export default {
    name: 'CreateAccount',
    components: { CAccountForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
        value_account_list: this.$route.params.value_account_list ? this.$route.params.value_account_list : [],

        disp_header: i18n.formatter.format('CreateAccount'),
        flag_modifyMode: false,
      };
    },
    created() {
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'AccountManagement' });
    },
    methods: {
      onFinish(data, cb) {
        const self = this;
        const dataForCreate = {
          username: data.username,
          password: data.password,
          permission: data.permission,
          remarks: data.remarks,
        };

        self.$globalCreateAccount(dataForCreate, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>