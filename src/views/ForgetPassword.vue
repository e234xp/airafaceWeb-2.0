<template>
  <div style="display: flex; align-items: center; margin-top: calc( (100vh - 650px) / 2);">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol class="login-container">
          <CCard class="p-3">
            <CCardHeader>
              <h1>{{ $t('ForgotPassword') }}</h1>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <p class="text-muted">
                  {{ $t('ForgetPasswordSubTitle') }}
                </p>
                <CInput :placeholder="$t('LoginUsername')" v-model="value_username">
                  <template #prepend-content>
                    <CIcon name="cil-user" />
                  </template>
                </CInput>
                <CInput :placeholder="$t('License')" v-model="value_license">
                  <template #prepend-content>
                    <CIcon name="cil-book" />
                  </template>
                </CInput>
                <CInput :placeholder="$t('NewPassword')" v-model="value_password"
                  :type="flag_view_password ? 'text' : 'password'">
                  <template #prepend-content>
                    <CIcon name="cil-lock-locked" />
                  </template>
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0 0.275rem 0 0.275rem;">
                      <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>
                <CRow>
                  <CCol col="6">
                    <CButton style="color: #20a8d8; border: 1px solid #20a8d8; width: 100%" @click="onBack">
                      {{ $t('GoBack') }}
                    </CButton>
                  </CCol>
                  <CCol col="6">
                    <CButton style="width: 100%; color: #20a8d8; border: 1px solid #20a8d8"
                      :disabled="flag_reset_finish" @click="onReset">
                      {{ $t('Reset') }}
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
            <CCardFooter>
              <span style="color: gray;float: right;">
                {{ $t('ForgetPasswordFooter') }}
              </span>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
  import i18n from '@/i18n';

  export default {
    name: 'ForgetPassword',
    data: () => ({
      value_username: '',
      value_license: '',
      value_password: '',
      flag_view_password: false,
      flag_reset_finish: false,
      disp_password: 'Password',
    }),
    methods: {
      viewPassword() {
        this.flag_view_password = !this.flag_view_password;
      },
      onBack() {
        this.$router.push('/login');
      },
      onReset() {
        const payload = {
          username: this.value_username,
          password: this.value_password,
          license: this.value_license,
        };
        this.$globalResetPassword(payload, (err) => {
          if (!err) {
            this.$fire({
              text: i18n.formatter.format('Successful'),
              type: 'success',
              timer: 3000,
            });
            this.flag_reset_finish = true;
          } else {
            this.$fire({
              text: i18n.formatter.format('ResetFailHint'),
              type: 'error',
              timer: 3000,
            });
          }
        });
        // http://192.168.10.122/airafacelite/resetpassword
        // {
        //     "username": "Admin",
        //     "password": "123456",
        //     "license":"UVJUX-YYUSJ-TVFTY-TXTJY-IWRRG-XXJBB"
        // }
      },
    },
  };
</script>

<style scoped>
  /* Your component styles here */
</style>