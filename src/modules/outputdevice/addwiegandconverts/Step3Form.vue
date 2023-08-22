<template>
  <div id="wrapper">
    <!-- 標題 -->

    <!-- 項目 -->
    <!-- Settings -->
    <div class="mb-3">
      <h2 sm="12">{{ disp_SettingsTitle }}</h2>
    </div>

    <div class="mt-3">
      <CRow sm="6">
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicDataFormat }}
          <CSelect
            size="lg"
            v-model.number="localStep3form.bits"
            :options="value_DataFormatBitsList"
            :filterable="true"
            class="font-control mt-2"
            :placeholder="dis_placeholder"
          />
        </CCol>
      </CRow>

      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicIndex }}
          <CInput
            size="lg"
            class="mt-2"
            v-model.number="localStep3form.index"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('index', localStep3form.index)"
            required
          />
        </CCol>

        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicSystemCode }}
          <CInput
            size="lg"
            class="mt-2"
            v-model.number="localStep3form.syscode"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('syscode', localStep3form.syscode)"
            required
          />
        </CCol>
      </CRow>

      <!-- 圖片 -->
      <CRow sm="12">
        <CCol sm="1">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Layer 2">
              <path id="Vector" d="M14 27.4375C11.3423 27.4375 8.74432 26.6494 6.53453 25.1729C4.32475 23.6964 2.60243 21.5977 1.58537 19.1423C0.568322 16.6869 0.302215 13.9851 0.820704 11.3785C1.33919 8.77186 2.61899 6.37753 4.49826 4.49826C6.37753 2.61899 8.77186 1.33919 11.3785 0.820704C13.9851 0.302215 16.6869 0.568322 19.1423 1.58537C21.5977 2.60243 23.6964 4.32475 25.1729 6.53453C26.6494 8.74432 27.4375 11.3423 27.4375 14C27.4335 17.5626 26.0165 20.9782 23.4974 23.4974C20.9782 26.0165 17.5626 27.4335 14 27.4375ZM14 2.43751C11.7132 2.43751 9.47767 3.11563 7.57623 4.38614C5.67478 5.65664 4.19279 7.46246 3.31765 9.57523C2.44251 11.688 2.21353 14.0128 2.65968 16.2557C3.10582 18.4986 4.20704 20.5589 5.82408 22.1759C7.44113 23.793 9.50137 24.8942 11.7443 25.3403C13.9872 25.7865 16.312 25.5575 18.4248 24.6824C20.5376 23.8072 22.3434 22.3252 23.6139 20.4238C24.8844 18.5223 25.5625 16.2869 25.5625 14C25.5592 10.9345 24.3399 7.99541 22.1723 5.82774C20.0046 3.66007 17.0656 2.44081 14 2.43751Z" fill="black"/>
              <path id="Vector_2" d="M14 19.9375C13.7514 19.9375 13.5129 19.8387 13.3371 19.6629C13.1613 19.4871 13.0625 19.2486 13.0625 19V12.75C13.0625 12.5014 13.1613 12.2629 13.3371 12.0871C13.5129 11.9113 13.7514 11.8125 14 11.8125C14.2486 11.8125 14.4871 11.9113 14.6629 12.0871C14.8387 12.2629 14.9375 12.5014 14.9375 12.75V19C14.9375 19.2486 14.8387 19.4871 14.6629 19.6629C14.4871 19.8387 14.2486 19.9375 14 19.9375Z" fill="black"/>
              <path id="Vector_3" d="M14 10.25C14.6904 10.25 15.25 9.69036 15.25 9C15.25 8.30964 14.6904 7.75 14 7.75C13.3096 7.75 12.75 8.30964 12.75 9C12.75 9.69036 13.3096 10.25 14 10.25Z" fill="black"/>
            </g>
          </svg>
        </CCol>
        <CCol sm="11">
          {{ disp_SpecialCardHint }}
        </CCol>
      </CRow>

      <CRow sm="12" class="pt-3">
        <CCol sm="6" class="h5">
          {{ disp_SpecialCardNumber }}
          <CInput
            size="lg"
            class="mt-2"
            v-model="localStep3form.special_card_number"
            />
        </CCol>
      </CRow>
     
      
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

export default {
  name: "AddWiegandconvertsStep3Form",
  props: {
    step3form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep3form: { ...this.step3form },

      dis_placeholder: i18n.formatter.format("placeholder"), // port 提示文字

      // /*Settings title  */
      disp_SettingsTitle: i18n.formatter.format(
        "WiegandBasicTitleNameSettings"
      ),

      // /**content */
      disp_WiegandBasicIndex: i18n.formatter.format("WiegandBasicCOlNameIndex"),
      disp_WiegandBasicSystemCode: i18n.formatter.format(
        "WiegandBasicCOlNameSystemCode"
        ),
      disp_WiegandBasicDataFormat: i18n.formatter.format(
        "WiegandBasicCOlNameDataFormat"
        ),
      disp_SpecialCardNumber: i18n.formatter.format("SpecialCardNumber"),
      disp_SpecialCardHint: i18n.formatter.format("SpecialCardHint"),
      
      value_DataFormatBitsList:[ {label:"26-bit", value:26}, {label:"34-bit", value:34} ],
      // value_DataFormatBitsList: ["26-bit","34-bit"],
    };
  },
  // 拿資料 寫入資料
  watch: {
    localStep3form: {
      handler(newValue) {
        console.log("emit updateStep3form");
        this.$emit("updateStep3form", { ...newValue });
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
};
</script>
