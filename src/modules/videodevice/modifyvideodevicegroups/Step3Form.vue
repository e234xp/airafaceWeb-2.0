<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{ disp_subtitleFaceCapture }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Face Capture -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_faceMinimumSize }}
          <CInput
            size="lg"
            class="mt-3"
            style="width: 100%"
            v-model.number="localStep3form.face_min_length"
            :invalid-feedback="disp_limitNumbers"
            valid-feedback="ok"
            :is-valid="limitNumber"
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_targetScore }}</CRow
      >
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model.number="localStep3form.target_score"
            :invalid-feedback="disp_limitNumber0to1"
            valid-feedback="ok"
            :is-valid="limitNumber0to1"
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_captureInterval }}</CRow
      >
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model.number="localStep3form.capture_interval"
            :invalid-feedback="disp_limitNumbers"
            valid-feedback="ok"
            :is-valid="limitNumber"
            required
            placeholder=""
          />
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import TableObserver from "@/utils/TableObserver.vue";
import i18n from "@/i18n";

export default {
  name: "Step3Form",
  props: {
    step3form: Object,
  },
  data() {
    return {
      localStep3form: { ...this.step3form },

      value_dataItemsToShow: [
        {
          enable: false,
          name: "",
          timestamp: "",
          remark: "",
          modifier: "",
          remark1: "",
        },
      ],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0,
      },
      value_searchingFilter: "",
      isChecked: true,

      /*Face Capture title  */
      disp_subtitleFaceCapture: i18n.formatter.format("VideoFaceCapture"),

      /**content */
      disp_faceMinimumSize: i18n.formatter.format(
        "VideoBasicCOlNameFaceMinimumSize"
      ),
      disp_targetScore: i18n.formatter.format("VideoBasicCOlNameTargetScore"),
      disp_captureInterval: i18n.formatter.format(
        "VideoBasicCOlNameCaptureInterval"
      ),

      disp_limitNumbers: i18n.formatter.format("limitNumbers"),
      disp_limitNumber0to1: i18n.formatter.format("limitNumber0to1"),
    };
  },
  watch: {
    localStep3form: {
      handler(newValue) {
        console.log("emit updateStep3form");
        this.$emit("updateStep3form", { ...newValue });
      },
      deep: true,
    },
  },

  methods: {
    limitNumber0to1(val) {
      if (!/^[01]$/.test(val)) {
        return false;
      }
      return true;
    },
    limitNumber(value) {
      if (!/^[0-9]/.test(value)) {
        return false;
      }
      return true;
    },
  },
};
</script>
