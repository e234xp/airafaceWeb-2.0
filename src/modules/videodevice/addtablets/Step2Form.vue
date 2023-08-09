<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{ disp_faceAccessTitle }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Face access -->
    <div class="mt-3">

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_recognitionThreshold }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" />
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceCaptureInternal }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" />
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceOverlapRatio }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" />
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_targetFaceSizeLength }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  style="width: 100%;" />
        </CCol>
      </CRow>

      <!-- Card Access -->
      <CRow sm="12" class="h2 ml-2 mb-3 mt-5" style="padding-top: 10px;text-align: right; ">{{ disp_cardAccessTitle }}</CRow>
      <CRow>
        <CCol sm="6">
          <CSelect
            size="lg"
            v-model="localStep2form.name"
            placeholder="請選擇"
            :options="cardAccessOptions"
          />
        </CCol>
      </CRow>

    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

export default {
  name: "AddTabletsStep2Form",
  props: {
    step2form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep2form: { ...this.step2form },

      /*Face access title  */
      disp_faceAccessTitle: i18n.formatter.format("TabletsBasicTitleNameFaceAccess"),

      /**content */
      disp_recognitionThreshold: i18n.formatter.format("TabletsBasicCOlNameRecognitionThreshold"),
      disp_faceCaptureInternal: i18n.formatter.format("TabletsBasicCOlNameFaceCaptureInternal"),
      disp_faceOverlapRatio: i18n.formatter.format("TabletsBasicCOlNameFaceOverlapRatio"),
      disp_targetFaceSizeLength: i18n.formatter.format("TabletsBasicCOlNameTargetFaceSizeLength"),

      /*Card access title  */
      disp_cardAccessTitle: i18n.formatter.format("TabletsBasicTitleNameCardAccess"),

      // data
      cardAccessOptions:["A","B"]
    };
  },
  watch: {
    localStep2form: {
      handler(newValue) {
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
    },
  },
};
</script>

