<template>
  <div id="wrapper">
    <!-- 標題 -->

    <!-- 項目 -->
    <!-- Connection -->
    <div class="mb-3">
      <h2 sm="12">{{ disp_ConnectionTitle }}</h2>
    </div>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicIP }}
          <CInput
            size="lg"
            class="mt-2"
            v-model="localStep2form.ip_address"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            :is-valid="isFieldPassed('ip_address', localStep2form.ip_address)"
            required
          />
        </CCol>
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicPort }}
          <CInput
            size="lg"
            class="mt-2"
            v-model.number="localStep2form.port"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            :is-valid="isFieldPassed('port', localStep2form.port)"
            required
          />
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";

export default {
  name: "ModifyWiegandConvertersStep2Form",
  props: {
    step2form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep2form: { ...this.step2form },

      /*Connection title  */
      disp_ConnectionTitle: i18n.formatter.format(
        "WiegandBasicTitleNameConnection"
      ),

      /**content */
      disp_WiegandBasicIP: i18n.formatter.format("WiegandBasicCOlNameIP"),
      disp_WiegandBasicPort: i18n.formatter.format("WiegandBasicCOlNamePort"),
    };
  },
  // 拿資料 寫入資料
  watch: {
    localStep2form: {
      handler(newValue) {
        console.log("emit updateStep2form");
        this.$emit("updateStep2form", { ...newValue });
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
};
</script>
