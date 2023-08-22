<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{  disp_DigitalOutPut2Title }}</h2>
    </div>
  
    <!-- 項目 -->
    <!-- Digital OutPut2 -->
    <div class="form-check mb-3 ml-2"> <!-- Check BOX -->
      <input class="form-check-input" type="checkbox" v-model="localStep4form.enable" value="" id="flexCheckDefault">
      <label class="form-check-label mt-2" for="flexCheckDefault">
        {{ disp_IOBoxesBasicEnable }}
      </label>
    </div>
    
    <CRow sm="6" class="h5 ml-2 mb-3">{{ disp_IOBoxesBasicDefaultValue }}</CRow>
    <CRow>
      <CCol sm="6">
        <CSelect size="lg" v-model="localStep4form.default" :options="value_deviceDefaultValue" :filterable="true" class="font-control mt-2" 
        :placeholder="dis_placeholder" :disabled="localStep4form.enable"/>
      </CCol>
    </CRow>

    <!-- trigger -->
    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicValueWhenTriggered }}
          <CSelect size="lg" v-model="localStep4form.trigger" :options="value_deviceTrigger" 
            :filterable="true" class="font-control mt-2"
            :placeholder="dis_placeholder"
            :disabled="localStep4form.enable"
            />
        </CCol>
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicDurationWhenTriggered }}
          <CInput size="lg" class="mt-2" v-model="localStep4form.delay"
            pattern="[0-9]*"
            :invalid-feedback="disp_limitNumber1to30"
            valid-feedback="ok"
            :is-valid="isFieldPassed('delay', localStep4form.delay)"
            required
            :disabled="localStep4form.enable"
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
    name: "Step4Form",
    props:{
      step4form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    data() {
      return {
        localStep4form: { ...this.step4form },
 
        isChecked: true,

        /*Digital output2 title  */
        disp_DigitalOutPut2Title: i18n.formatter.format("I/OBoxesBasicTitleNameDigitalOutPut2"),
        dis_placeholder: i18n.formatter.format("placeholder"), // 提示文字
        disp_limitNumber1to30: i18n.formatter.format("limitNumbers1to30"),

        
        /**content */
        disp_IOBoxesBasicEnable: i18n.formatter.format("I/OBoxesBasicCOlNameEnable"),
        disp_IOBoxesBasicDefaultValue: i18n.formatter.format("I/OBoxesBasicCOlNameDefaultValue"),
        disp_IOBoxesBasicValueWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameValueWhenTriggered"),
        disp_IOBoxesBasicDurationWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameDurationWhenTriggered"),


        /**v-model */
        value_deviceDefaultValue: [0, 1],
        value_deviceTrigger: [0, 1],
      };
    },
    components: {
      Multiselect: Multiselect
    },
    // 拿資料 寫入資料
    watch: {
      localStep4form: {
        handler(newValue) {
          console.log('emit updateStep4form')
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
  }
</script>