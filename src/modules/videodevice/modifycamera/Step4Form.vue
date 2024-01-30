<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">
        {{ $t('VideoFaceMerge') }}
      </h2>
    </div>

    <!-- 項目 -->
    <!-- Face Merge -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('EnableVerifiedMerge') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.verified_merge_setting.enable"
            :placeholder="disp_placeholder"
            :options="param_enableOptions"
          />
        </CCol>
      </CRow>
      <CRow sm="12">
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('MergeDuration') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.verified_merge_setting.merge_duration"
            :placeholder="disp_placeholder"
            :options="param_durationOptions"
            :disabled="!localStep4form.verified_merge_setting.enable"
          />
        </CCol>
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('NonAction') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.verified_merge_setting.non_action"
            :placeholder="disp_placeholder"
            :options="param_enableOptions"
            :disabled="!localStep4form.verified_merge_setting.enable"
          />
        </CCol>
      </CRow>
      <CRow
        sm="12"
        class="mt-3"
      >
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('EnableNonVerifiedMerge') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.non_verified_merge_setting.enable"
            :placeholder="disp_placeholder"
            :options="param_enableOptions"
          />
        </CCol>
      </CRow>
      <CRow sm="12">
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('MergeDuration') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.non_verified_merge_setting.merge_duration"
            :placeholder="disp_placeholder"
            :options="param_durationOptions"
            :disabled="!localStep4form.non_verified_merge_setting.enable"
          />
        </CCol>
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('NonAction') }}
          </h5>
          <CSelect
            size="lg"
            v-model="localStep4form.non_verified_merge_setting.non_action"
            :placeholder="disp_placeholder"
            :options="param_enableOptions"
            :disabled="!localStep4form.non_verified_merge_setting.enable"
          />
        </CCol>
      </CRow>
      <CRow sm="12">
        <CCol
          sm="6"
          class="h5"
        >
          <h5 class="ml-2">
            {{ $t('MergeScore') }}
          </h5>
          <CInput
            size="lg"
            v-model.number="localStep4form.non_verified_merge_setting.merge_score"
            :invalid-feedback="$t('limitNumber0to1')"
            :is-valid="localStep4form.non_verified_merge_setting.merge_score > 0 && localStep4form.non_verified_merge_setting.merge_score < 1"
            :required="localStep4form.non_verified_merge_setting.enable"
            :disabled="!localStep4form.non_verified_merge_setting.enable"
          />
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'ModifyCameraStep4Form',
  props: {
    step4form: {
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
      localStep4form: {},

      disp_placeholder: i18n.formatter.format('placeholder'),

      param_enableOptions: [
        { label: i18n.formatter.format('Yes'), value: true },
        { label: i18n.formatter.format('No'), value: false },
      ],

      param_durationOptions: [
        { label: '10000', value: 10000 },
        { label: '5000', value: 5000 },
        { label: '1000', value: 1000 },
      ],
    };
  },
  watch: {
    localStep4form: {
      handler(newValue) {
        this.$emit('updateStep4form', { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step4form).includes(key)) return;
          this.localStep4form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.localStep4form = { ...this.step4form, ...this.localStep4form };
  },
};
</script>
