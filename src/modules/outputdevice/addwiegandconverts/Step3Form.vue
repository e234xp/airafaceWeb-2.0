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
          <CSelect size="lg" v-model.number="localStep3form.bits" 
          :options="value_deviceGroupsList" 
          :filterable="true" 
          class="font-control mt-2"
          :placeholder="disp_Placeholder"
           /> 
        </CCol>
      </CRow>

      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicIndex }}
          <CSelect size="lg" v-model="localStep3form.index" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" :placeholder="disp_Placeholder"/>
        </CCol>
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicSystemCode }}
          <CSelect size="lg" v-model.number="localStep3form.syscode" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" :placeholder="disp_Placeholder"/> 
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
      step3form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    data() {
      return {
        localStep3form: { ...this.step3form },

        disp_Placeholder: i18n.formatter.format("placeholder"),

        // /*Settings title  */
        disp_SettingsTitle: i18n.formatter.format("WiegandBasicTitleNameSettings"),

        // /**content */
        disp_WiegandBasicIndex: i18n.formatter.format("WiegandBasicCOlNameIndex"),
        disp_WiegandBasicSystemCode: i18n.formatter.format("WiegandBasicCOlNameSystemCode"),
        disp_WiegandBasicDataFormat: i18n.formatter.format("WiegandBasicCOlNameDataFormat"),

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
   
    // 拿資料 寫入資料
    watch: {
      localStep3form: {
        handler(newValue) {
          console.log('emit updateStep3form')
          this.$emit('updateStep3form', { ...newValue });
        },
        deep: true,
      },
      defaultValues: {
        handler(newValue) {
          this.localStep3form = {
            ...this.localStep3form,
            ...newValue,
          };
        },
        deep: true,
        immediate: true,
      },
    },
    
  }
</script>
  

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>