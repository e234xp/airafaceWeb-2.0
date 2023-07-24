<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{ disp_DigitalOutPut1Title }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Digital OutPut1 -->
    <div class="form-check mb-3 ml-2">
      <input class="form-check-input" type="checkbox" v-model="isChecked" value="" id="flexCheckDefault">
      <label class="form-check-label mt-2" for="flexCheckDefault">
        {{ disp_IOBoxesBasicEnable }}
      </label>
    </div>
    
    <CRow sm="6" class="h5 ml-2 mb-3">{{ disp_IOBoxesBasicDefaultValue }}</CRow>
    <CRow>
      <CCol sm="6">
        <CSelect size="lg" v-model="value_deviceGroups" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" 
        :invalid-feedback= "$t('NoEmptyNoSpace')"
        valid-feedback="ok"
        :is-valid="isNotEmpty"
        required/>
      </CCol>
    </CRow>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicValueWhenTriggered }}
          <CSelect size="lg" v-model="value_deviceGroups" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2"
          :invalid-feedback= "$t('NoEmptyNoSpace')"
          valid-feedback="ok"
          :is-valid="isNotEmpty"
          required/>
        </CCol>
        <CCol sm="6" class="h5"  >
          {{ disp_IOBoxesBasicDurationWhenTriggered }}
          <CInput size="lg" class="mt-2" v-model="value_durationTriggered"
          :invalid-feedback= "$t('NoEmptyNoSpace')"
          valid-feedback="ok"
          :is-valid="isNotEmpty"
          required/>
        </CCol>
      </CRow>
    </div>

  </div>
</template>
  
<script>
  import i18n from "@/i18n";

  import VueSelect from 'vue-select';
  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";

  export default {
    name: "AddCamerasStep3Form",
    props:{
      step1form: Object
    },
    data() {
      return {
        localStep2form: { ...this.step2form },

        isChecked: true,

        // /*Digital output1 title  */
        disp_DigitalOutPut1Title: i18n.formatter.format("I/OBoxesBasicTitleNameDigitalOutPut1"),

        // /**content */
        disp_IOBoxesBasicEnable: i18n.formatter.format("I/OBoxesBasicCOlNameEnable"),
        disp_IOBoxesBasicDefaultValue: i18n.formatter.format("I/OBoxesBasicCOlNameDefaultValue"),
        disp_IOBoxesBasicValueWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameValueWhenTriggered"),
        disp_IOBoxesBasicDurationWhenTriggered: i18n.formatter.format("I/OBoxesBasicCOlNameDurationWhenTriggered"),

        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3],
        value_durationTriggered: "",
      };
    },
    components: {
      "v-select": VueSelect,
      Multiselect: Multiselect
    },
    //預設值
    created() {
      // this.defaultPortValue();
      // this.localStep3form.user = "admin",
      // this.localStep3form.pass = "123456"
      // this.localStep3form.connection_info = "/media/video1"
    }, 
    // 拿資料 寫入資料
    watch: {
      localStep3form: {
        handler(newValue) {
          console.log('emit updateStep3form')
          this.$emit('updateStep3form', { ...newValue });
        },
        deep: true,
      },
    },
    methods: {
      defaultPortValue() {
        // this.localStep3form.port = 554;
        // return this.localStep3form.port !== null && this.localStep3form.port >= 0 && this.localStep3form.port <= 65535;
      },
      // 判斷欄位空值
      isNotEmpty(value) {
        return value !== null && value !== undefined && value !== '';
      }
    },
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>