<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">
        {{ disp_subtitleFaceCapture }}
      </h2>
    </div>

    <!-- 項目 -->
    <!-- Face Capture -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol
          sm="6"
          class="h5"
        >
          {{ disp_faceMinimumSize }}
          <CInput
            size="lg"
            class="mt-3"
            style="width: 100%"
            v-model.number="localStep3form.face_min_length"
            :invalid-feedback="disp_limitNumbers"
            :is-valid="
              isFieldPassed('face_min_length', localStep3form.face_min_length)
            "
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ disp_targetScore }}
      </CRow>
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model.number="localStep3form.target_score"
            :invalid-feedback="disp_limitNumber0to1"
            :is-valid="
              isFieldPassed('target_score', localStep3form.target_score)
            "
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ disp_captureInterval }}
      </CRow>
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model.number="localStep3form.capture_interval"
            pattern="[0-9]*"
            :invalid-feedback="disp_limitNumber100up"
            :is-valid="
              isFieldPassed('capture_interval', localStep3form.capture_interval)
            "
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ $t('VideoBasicCOlNameAntiSpoofingScore') }}
      </CRow>
      <CRow>
        <CCol sm="6">
          <CSelect
            size="lg"
            v-model="localStep3form.antispoofing_score"
            :options="param_antiSpoofingOptions"
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ $t('FaceDetectThreshold') }}
      </CRow>
      <CRow>
        <CCol sm="6">
          <CSelect
            size="lg"
            v-model="localStep3form.face_detection_score"
            :options="param_faceDetectionScore"
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        April Tag Type
      </CRow>
      <CRow>
        <CCol sm="6">
          <CSelect
            size="lg"
            v-model="localStep3form.april_tag_type"
            :options="param_aprilTagType"
          />
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'ModifyCameraStep3Form',
  props: {
    step3form: {
      type: Object,
      default: () => ({}),
    },
    defaultValues: {
      type: Object,
      default: () => ({}),
    },
    isFieldPassed: {
      type: Function,
      default: () => () => true,
    },
  },
  data() {
    return {
      localStep3form: {},

      disp_subtitleFaceCapture: i18n.formatter.format('VideoFaceCapture'),

      disp_faceMinimumSize: i18n.formatter.format(
        'VideoBasicCOlNameFaceMinimumSize',
      ),
      disp_targetScore: i18n.formatter.format('VideoBasicCOlNameTargetScore'),
      disp_captureInterval: i18n.formatter.format(
        'VideoBasicCOlNameCaptureInterval',
      ),

      disp_limitNumbers: i18n.formatter.format('limitNumbers'),
      disp_limitNumber0to1: i18n.formatter.format('limitNumber0to1'),
      disp_limitNumber100up: i18n.formatter.format('limitNumbers100up'),

      param_antiSpoofingOptions: [
        { label: i18n.formatter.format('SpoofingLevelNone'), value: 0 },
        { label: i18n.formatter.format('SpoofingLevelLow'), value: 0.1 },
        { label: i18n.formatter.format('SpoofingLevelHigh'), value: 0.3 },
        { label: i18n.formatter.format('SpoofingLevelExtremeHigh'), value: 0.6 },
      ],

      param_faceDetectionScore: [
        { label: i18n.formatter.format('SpoofingLevelLow'), value: 0.1 },
        { label: i18n.formatter.format('Medium'), value: 0.3 },
        { label: i18n.formatter.format('SpoofingLevelHigh'), value: 0.5 },
      ],

      param_aprilTagType: [
        { label: i18n.formatter.format('Disable'), value: '' },
        { label: 'tag36h11', value: 'tag36h11' },
        { label: 'tag25h9', value: 'tag25h9' },
        { label: 'tag16h5', value: 'tag16h5' },
        { label: 'tagCircle21h7', value: 'tagCircle21h7' },
        { label: 'tagCircle49h12', value: 'tagCircle49h12' },
        { label: 'tagCustom48h12', value: 'tagCustom48h12' },
        { label: 'tagStandard41h12', value: 'tagStandard41h12' },
        { label: 'tagStandard52h13', value: 'tagStandard52h13' },
      ],
    };
  },
  watch: {
    localStep3form: {
      handler(newValue) {
        this.$emit('updateStep3form', { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step3form).includes(key)) return;
          this.localStep3form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.localStep3form = { ...this.step3form, ...this.localStep3form };
  },
};
</script>
