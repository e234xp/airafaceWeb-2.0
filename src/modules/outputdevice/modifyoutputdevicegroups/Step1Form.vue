<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>

      <div style="height: 35px"></div>
    </div>
    <!-- Basic -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_OutputDeviceBasicDeviceName }}
          <CInput
            size="lg"
            class="mt-2"
            v-model="localStep1form.name"
            :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('name', localStep1form.name)"
            required
          />
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

export default {
  name: "Step1Form",
  props: {
    step1form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep1form: { ...this.step1form },

      isChecked: true,

      /*Basic title  */
      disp_header: i18n.formatter.format("OutputDeviceGroupBasicName"),

      /**content */
      disp_OutputDeviceBasicDeviceName: i18n.formatter.format(
        "OutputDeviceGroupsBasicCOlNameDeviceName"
      ),
    };
  },
  // 拿資料 寫入資料
  watch: {
    localStep1form: {
      handler(newValue) {
        console.log("emit updateStep1form");
        this.$emit("updateStep1form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        this.localStep1form = {
          ...this.localStep1form,
          ...newValue,
        };
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
