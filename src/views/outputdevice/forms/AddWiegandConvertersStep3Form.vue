<template>
  <div id="wrapper">
    <!-- 標題 -->
 
    <!-- 項目 -->
    <!-- Settings -->
    <div class="mb-3">
      <h2 sm="12">{{ disp_SettingsTitle }}</h2>
    </div>

    <div class="mt-3">
      <CRow sm="12">
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicIndex }}
          <CSelect size="lg" v-model="localStep3form.index" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" />
        </CCol>
        <CCol sm="6" class="h5">
          {{ disp_WiegandBasicSystemCode }}
          <CSelect size="lg" v-model.number="localStep3form.syscode" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" /> 
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
      step3form: Object
    },
    data() {
      return {
        localStep3form: { ...this.step3form },

        // /*Settings title  */
        disp_SettingsTitle: i18n.formatter.format("WiegandBasicTitleNameSettings"),

        // /**content */
        disp_WiegandBasicIndex: i18n.formatter.format("WiegandBasicCOlNameIndex"),
        disp_WiegandBasicSystemCode: i18n.formatter.format("WiegandBasicCOlNameSystemCode"),

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