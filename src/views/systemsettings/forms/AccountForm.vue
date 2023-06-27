<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">{{ disp_header }}</div>
      <stepprogress
        class="w-step-progress-2"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[disp_inputAccountInfo, disp_complete]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      >
      </stepprogress>
    </CCol>
    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">{{ disp_accountName }}</th>
              <th class="h5 w-25 table-th">{{ disp_password }}</th>
              <th class="h5 w-25 table-th">{{ disp_confirmPassword }}</th>
              <th class="h5 w-25 table-th">{{ disp_accountPermission }}</th>
            </tr>
            <tr>
              <td class="table-td">
                <CInput
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_noEmptyNoSpaceNoSpecial"
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
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_noEmptyNorSpace"
                  value=""
                  v-model="value_password"
                  placeholder=""
                  :is-valid="passwordValidator"
                  required
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_passwordIsDifferent"
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
              <th class="h5 w-25 table-th">{{ disp_remarks }}</th>
            </tr>
            <tr>
              <td colspan="4" class="table-td pr-0">
                <CInput size="lg" v-model="value_remarks" />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px"></div>
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">{{ disp_complete }}</p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-primary fz-lg" @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton
            class="btn btn-primary fz-lg"
            @click="clickOnNext"
            :disabled="!flag_accountNamePass || !flag_passwordConfirmPass"
            >{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import i18n from "../../../i18n";

import StepProgress from "vue-step-progress";
// import "vue-step-progress/dist/main.css";
import "../../../../src/airacss/vue-step-progress.css";

Date.prototype.yyyy_mm_dd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear() + "-",
    (mm > 9 ? "" : "0") + mm + "-",
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

const defaultlState = () => {
  return {
    obj_loading: null,
    param_cardStyle: "height: 35rem;",
    param_activeColor: "#6baee3",
    param_passiveColor: "#919bae",
    param_lineThickness: 3,
    param_activeThickness: 3,
    param_passiveThickness: 3,

    disp_passwordIsDifferent: i18n.formatter.format("PasswordIsDifferent"),
    disp_noEmptyNorSpace: i18n.formatter.format("NoEmptyNoSpace"),
    disp_noEmptyNoSpaceNoSpecial: i18n.formatter.format("NoEmptyNoSpaceNoSpecial"),

    disp_inputAccountInfo: i18n.formatter.format("AccountInfo"),
    disp_saveChanges: i18n.formatter.format("SaveChanges"),
    disp_complete: i18n.formatter.format("Complete"),
    disp_previous: i18n.formatter.format("Previous"),
    disp_next: i18n.formatter.format("Next"),
    disp_select: i18n.formatter.format("Select"),
    disp_search: i18n.formatter.format("Search"),
    disp_create: i18n.formatter.format("Create"),
    disp_password: i18n.formatter.format("Password"),
    disp_confirmPassword: i18n.formatter.format("ConfirmPassword"),
    disp_accountPermission: i18n.formatter.format("Permission"),
    disp_accountName: i18n.formatter.format("Account"),
    disp_remarks: i18n.formatter.format("Remarks"),

    flag_modifyMode: false,
    flag_currentSelection: 0,

    value_returnRoutePath: "",
    value_returnRouteName: "",
    value_account_list: [],

    flag_currentSetp: 0,

    value_accountName: "",
    flag_accountNamePass: false,

    value_password: "",
    flag_passwordPass: false,
    value_passwordConfirm: "",
    flag_passwordConfirmPass: false,

    value_accountPermission: "User",
    value_accountPermissionList: [
      { value: "Admin", label: "Admin" },
      { value: "PowerUser", label: "Power User" },
      { value: "User", label: "User" },
    ],

    value_remarks: "",
    disp_header: "none", //i18n.formatter.format("CreatePerson"),
  };
};
export default {
  name: "AccountForm",
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  created() {},
  mounted() {},
  updated() {},
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    // this.flag_keepingDownload = false;
    next();
  },
  watch: {
    value_searchingFilterForAll: function (value) {
      this.updateData();
    },
    value_searchingFilterForSelected: function (value) {
      this.updateData();
    },
  },
  methods: {
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 16px";
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 16px;";
    },
    selAccountPermission(e) {
      const self = this;
      self.value_accountPermission = e.target.value;
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.flag_modifyMode ? this.disp_saveChanges : this.disp_create;
        case 1:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
    clickOnPrev() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
          self.flag_keepingDownload = false;
        }
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        self.flag_keepingDownload = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        if (self.onFinish)
          self.onFinish(
            {
              uuid: self.value_accountUuid,
              username: self.value_accountName,
              password: self.value_password,
              permission: self.value_accountPermission,
              remarks: self.value_remarks,
            },
            function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message == "ok") {
                self.flag_currentSetp = 1;
              } else {
                //self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
                self.$fire({
                  text: i18n.formatter.format("Failed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            }
          );
        else {
          if (self.obj_loading) self.obj_loading.hide();
          self.flag_currentSetp = 1;
        }
      } else {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },
    passwordConfirmValidator(val) {
      const self = this;
      if (
        self.value_passwordConfirm.length > 0 &&
        self.value_passwordConfirm == self.value_password
      ) {
        self.flag_passwordConfirmPass = true;
      } else {
        self.flag_passwordConfirmPass = false;
      }
      return self.flag_passwordConfirmPass;
    },
    passwordValidator(val) {
      const self = this;
      if (val.indexOf(" ") >= 0) {
        self.flag_passwordPass = false;
      } else {
        self.flag_passwordPass = val.length > 0;
      }
      return self.flag_passwordPass;
    },
    accountNameValidator(val) {
      const self = this;
      self.flag_accountNamePass = false;
      if (/^[a-zA-Z0-9]+$/.test(val)) {
        self.flag_accountNamePass = true;
      }
      if (self.flag_accountNamePass) {
        self.value_account_list.forEach((account) => {
          if (account.username.toLowerCase() == val.toLowerCase()) {
            self.flag_accountNamePass = false;
          }
        });
      }
      return self.flag_accountNamePass;
    },
    showOnStep(step) {
      return step == this.flag_currentSetp ? "d-block" : "d-none";
    },
  },
  components: {
    stepprogress: StepProgress,
  },
};
</script>
