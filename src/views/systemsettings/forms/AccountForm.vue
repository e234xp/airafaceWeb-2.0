<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ disp_header }}
      </div>
      <stepprogress
        class="w-step-progress-2"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[$t('AccountInfo'), $t('Complete')]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      />
    </CCol>
    <CCol sm="12">
      <CCard
        :class="showOnStep(0)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">
                {{ $t('Account') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Password') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('ConfirmPassword') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Permission') }}
              </th>
            </tr>
            <tr>
              <td class="table-td">
                <CInput
                  class="mb-form-row"
                  size="lg"
                  :invalid-feedback="flag_accountNamePass"
                  value=""
                  v-model="value_accountName"
                  placeholder=""
                  :is-valid="accountNameValidator"
                  required
                  :disabled="flag_modifyMode"
                />
              </td>
              <td class="table-td">
                <CInput
                  class="mb-form-row"
                  size="lg"
                  :type="flag_view_password ? 'text' : 'password'"
                  :invalid-feedback="$t('NoEmptyNoSpace')"
                  value=""
                  v-model="value_password"
                  placeholder=""
                  :is-valid="passwordValidator"
                  required
                >
                  <template #append-content>
                    <CButton
                      @click="viewPassword"
                      style="padding: 0.375rem 0.375rem;"
                    >
                      <CIcon
                        v-show="flag_view_password"
                        src="/img/eye-slash.png"
                      />
                      <CIcon
                        v-show="!flag_view_password"
                        src="/img/eye.png"
                      />
                    </CButton>
                  </template>
                </CInput>
              </td>
              <td class="table-td">
                <CInput
                  class="mb-form-row"
                  size="lg"
                  :type="flag_view_password ? 'text' : 'password'"
                  :invalid-feedback="$t('PasswordIsDifferent')"
                  value=""
                  v-model="value_passwordConfirm"
                  placeholder=""
                  :is-valid="passwordConfirmValidator"
                  required
                />
              </td>
              <td class="table-td">
                <CSelect
                  size="lg"
                  :value.sync="value_accountPermission"
                  :options="value_accountPermissionList"
                  @change="selAccountPermission($event)"
                />
              </td>
            </tr>
          </table>

          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">
                {{ $t('Remarks') }}
              </th>
            </tr>
            <tr>
              <td
                colspan="4"
                class="table-td pr-0"
              >
                <CInput
                  class="mb-form-row"
                  size="lg"
                  v-model="value_remarks"
                />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <CCard
        :class="showOnStep(1)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <div style="height: 220px" />
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('Complete') }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-primary fz-lg"
            @click="clickOnPrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary fz-lg"
            @click="clickOnNext"
            :disabled="flag_accountNamePass !== '' || !flag_passwordConfirmPass"
          >
            {{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

// eslint-disable-next-line no-extend-native
Date.prototype.yyyy_mm_dd = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();

  return `${this.getFullYear()}-${(mm > 9 ? '' : '0') + mm}-${(dd > 9 ? '' : '0') + dd}`;
};

export default {
  name: 'AccountForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,
      param_cardStyle: 'height: 35rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,

      flag_modifyMode: false,
      flag_currentSelection: 0,

      value_returnRoutePath: '',
      value_returnRouteName: '',
      value_account_list: [],

      flag_currentSetp: 0,

      value_accountName: '',
      flag_accountNamePass: '',

      flag_view_password: false,
      value_password: '',
      flag_passwordPass: false,
      value_passwordConfirm: '',
      flag_passwordConfirmPass: false,

      value_accountPermission: 'User',
      value_accountPermissionList: [
        { value: 'Admin', label: 'Admin' },
        { value: 'PowerUser', label: 'Power User' },
        { value: 'User', label: 'User' },
      ],

      value_remarks: '',
      disp_header: 'none',

      ...this.formData,
    };
  },
  watch: {
    value_searchingFilterForAll: () => {
      this.updateData();
    },
    value_searchingFilterForSelected: () => {
      this.updateData();
    },
  },
  methods: {
    // headerCellStyle(row, column, rowIndex, columnIndex) {
    headerCellStyle() {
      return 'fontSize: 16px';
    },
    // cellStyle(row, column, rowIndex, columnIndex) {
    cellStyle() {
      return 'fontSize: 16px;';
    },
    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },
    selAccountPermission(e) {
      this.value_accountPermission = e.target.value;
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.flag_modifyMode ? this.$t('SaveChanges') : this.$t('Create');
        case 1:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
    clickOnPrev() {
      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
          this.flag_keepingDownload = false;
        }
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    clickOnNext() {
      if (this.flag_currentSetp === 0) {
        this.flag_keepingDownload = false;
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        if (this.onFinish) {
          this.onFinish(
            {
              uuid: this.value_accountUuid,
              username: this.value_accountName,
              password: this.value_password,
              permission: this.value_accountPermission,
              remarks: this.value_remarks,
            },
            (success, result) => {
              if (this.obj_loading) this.obj_loading.hide();
              if (result && result.message === 'ok') {
                this.flag_currentSetp = 1;
              } else {
                // this.$alert( this.disp_registerFailed + ' : ' + ( result && result.message ? result.message : 'network loss') );
                this.$fire({
                  text: this.$t('Failed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            },
          );
        } else {
          if (this.obj_loading) this.obj_loading.hide();
          this.flag_currentSetp = 1;
        }
      } else {
        this.$router.push({ name: this.value_returnRoutePath });
      }
    },
    passwordConfirmValidator() {
      if (
        this.value_passwordConfirm.length > 0
          && this.value_passwordConfirm === this.value_password
      ) {
        this.flag_passwordConfirmPass = true;
      } else {
        this.flag_passwordConfirmPass = false;
      }
      return this.flag_passwordConfirmPass;
    },
    passwordValidator(val) {
      if (val.indexOf(' ') >= 0) {
        this.flag_passwordPass = false;
      } else {
        this.flag_passwordPass = val.length > 0;
      }
      return this.flag_passwordPass;
    },
    accountNameValidator(val) {
      this.flag_accountNamePass = '';
      if (/^[a-zA-Z0-9]+$/.test(val)) this.flag_accountNamePass = '';
      else this.flag_accountNamePass = this.$t('NoEmptyNoSpaceNoSpecial');

      if (this.flag_accountNamePass === '') {
        this.value_account_list.forEach((account) => {
          if (account.username.toLowerCase() === val.toLowerCase()) {
            this.flag_accountNamePass = this.$t('NoSpaceNeigherRepeat');
          }
        });
      }
      return this.flag_accountNamePass === '';
    },
    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
  },
  components: {
    stepprogress: StepProgress,
  },
};
</script>
