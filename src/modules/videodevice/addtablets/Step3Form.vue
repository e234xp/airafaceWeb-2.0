<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div id="tablet">
      <h2 sm="12">{{ disp_headertitle }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Face Capture -->
    <div class="mt-3">
      <CRow
        sm="12"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_serverAddress }}</CRow
      >
      <CRow sm="12">
        <CCol sm="6" class="h5">
          <CInput
            size="lg"
            class="mt-3"
            v-model.number="localStep3form.ip_address"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('ip_address', localStep3form.ip_address)"
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <CRow
        sm="6"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_deviceId }}</CRow
      >
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            v-model.number="localStep3form.device_id"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('device_id', localStep3form.device_id)"
            required
            placeholder=""
          />
        </CCol>
      </CRow>

      <!-- 圖片 -->
      <CRow sm="12" class="mt-4">
        <CCol sm="1">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Layer 2">
              <path
                id="Vector"
                d="M14 27.4375C11.3423 27.4375 8.74432 26.6494 6.53453 25.1729C4.32475 23.6964 2.60243 21.5977 1.58537 19.1423C0.568322 16.6869 0.302215 13.9851 0.820704 11.3785C1.33919 8.77186 2.61899 6.37753 4.49826 4.49826C6.37753 2.61899 8.77186 1.33919 11.3785 0.820704C13.9851 0.302215 16.6869 0.568322 19.1423 1.58537C21.5977 2.60243 23.6964 4.32475 25.1729 6.53453C26.6494 8.74432 27.4375 11.3423 27.4375 14C27.4335 17.5626 26.0165 20.9782 23.4974 23.4974C20.9782 26.0165 17.5626 27.4335 14 27.4375ZM14 2.43751C11.7132 2.43751 9.47767 3.11563 7.57623 4.38614C5.67478 5.65664 4.19279 7.46246 3.31765 9.57523C2.44251 11.688 2.21353 14.0128 2.65968 16.2557C3.10582 18.4986 4.20704 20.5589 5.82408 22.1759C7.44113 23.793 9.50137 24.8942 11.7443 25.3403C13.9872 25.7865 16.312 25.5575 18.4248 24.6824C20.5376 23.8072 22.3434 22.3252 23.6139 20.4238C24.8844 18.5223 25.5625 16.2869 25.5625 14C25.5592 10.9345 24.3399 7.99541 22.1723 5.82774C20.0046 3.66007 17.0656 2.44081 14 2.43751Z"
                fill="black"
              />
              <path
                id="Vector_2"
                d="M14 19.9375C13.7514 19.9375 13.5129 19.8387 13.3371 19.6629C13.1613 19.4871 13.0625 19.2486 13.0625 19V12.75C13.0625 12.5014 13.1613 12.2629 13.3371 12.0871C13.5129 11.9113 13.7514 11.8125 14 11.8125C14.2486 11.8125 14.4871 11.9113 14.6629 12.0871C14.8387 12.2629 14.9375 12.5014 14.9375 12.75V19C14.9375 19.2486 14.8387 19.4871 14.6629 19.6629C14.4871 19.8387 14.2486 19.9375 14 19.9375Z"
                fill="black"
              />
              <path
                id="Vector_3"
                d="M14 10.25C14.6904 10.25 15.25 9.69036 15.25 9C15.25 8.30964 14.6904 7.75 14 7.75C13.3096 7.75 12.75 8.30964 12.75 9C12.75 9.69036 13.3096 10.25 14 10.25Z"
                fill="black"
              />
            </g>
          </svg>
        </CCol>
        <CCol sm="11">
          <h4>{{ disp_Hint }}</h4>
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

export default {
  name: "AddTabletsStep3Form",
  props: {
    step3form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep3form: { ...this.step3form },

      /*Enrollment info title*/
      disp_headertitle: i18n.formatter.format(
        "TabletsBasicTitleNameEnrollmentInfo"
      ),

      /*Card access title  */
      disp_cardAccessTitle: i18n.formatter.format(
        "TabletsBasicTitleNameCardAccess"
      ),

      /**content */
      disp_serverAddress: i18n.formatter.format(
        "TabletsBasicCOlNameServerAddress"
      ),
      disp_deviceId: i18n.formatter.format("TabletsBasicCOlNameDeviceID"),

      disp_Hint: i18n.formatter.format("TabletsBasicCOlNameHint"),
    };
  },
  watch: {
    localStep3form: {
      handler(newValue) {
        this.$emit("updateStep3form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        const localStep3formKeys = Object.keys(this.localStep3form);
        Object.entries(newValue).forEach(([key, value]) => {
          if (localStep3formKeys.includes(key)) {
            this.localStep3form[key] = value;
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
