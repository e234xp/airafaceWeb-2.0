<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
        <h2 sm="12">{{ disp_ConnectionTitle }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Connection -->
    <div class="mt-3">
        <CRow sm="12">
        <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicIP }}
            <CInput size="lg" class="mt-2" v-model="localStep2form.ip_address"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('ip_address', localStep2form.ip_address)"
              required/>
        </CCol>
        <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicPort }}
            <CInput size="lg" class="mt-2" v-model="localStep2form.port"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('port', localStep2form.port)"
              required/>
        </CCol>
        </CRow>
    </div>

    <div class="mt-3">
        <CRow sm="12">
        <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicUserName }}
            <CInput size="lg" class="mt-2" v-model="localStep2form.username"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('user', localStep2form.username)"
              required/>
        </CCol>
        <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicPassword }}
            <CInput size="lg" class="mt-2" v-model="localStep2form.password" :type="flag_view_password ? 'text' : 'password'"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('pass', localStep2form.password)"
              required>
              <template #append-content>
                <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                  <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                  <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                </CButton>
              </template>
            </CInput>
        </CCol>
        </CRow>
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";


import "@/airacss/vue-multiselect.css";

export default {
  name: "AddCamerasStep2Form",
  props:{
    step2form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
  return {
      localStep2form: { ...this.step2form },

      isChecked: true,

      /*Connection title  */
      

      /**content */
      disp_IOBoxesBasicIP: i18n.formatter.format("I/OBoxesBasicCOlNameIP"),
      disp_IOBoxesBasicPort: i18n.formatter.format("I/OBoxesBasicCOlNamePort"),
      disp_IOBoxesBasicUserName: i18n.formatter.format("I/OBoxesBasicCOlNameUserName"),
      disp_IOBoxesBasicPassword: i18n.formatter.format("I/OBoxesBasicCOlNamePassword"),

      /**v-model */
      value_deviceGroups: "", /**選單 */
      value_deviceGroupsList: [1,2,3],

      flag_view_password: false,
    };
  },

  // 拿資料 寫入資料
  watch: {
    localStep2form: {
      handler(newValue) {
        console.log('emit updateStep2form')
        this.$emit('updateStep2form', { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step2form).includes(key)) return;
          this.localStep2form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },
  },
}
</script>
