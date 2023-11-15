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
          {{ disp_IOBoxesBasicDeviceName }}
          <CInput
            size="lg"
            class="mt-2"
            v-model="localStep1form.name"
            :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
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
  name: "AddVideoDeviceGroupStep1Form",
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
      disp_header: i18n.formatter.format("VideoDeviceGroupsBasicName"),

      /**content */
      disp_IOBoxesBasicDeviceName: i18n.formatter.format(
        "VideoDeviceGroupsBasicCOlNameDeviceName"
      ),
    };
  },
  // 拿資料 寫入資料
  watch: {
    localStep1form: {
      handler(newValue) {
        this.$emit("updateStep1form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step1form).includes(key)) return;
          this.localStep1form[key] = value;
        });
      },
      deep: true,
    },
  },
};
</script>

