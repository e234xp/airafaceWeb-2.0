<template>
  <div id="wrapper">
    <!-- 標題 -->


    <div class="content">
        <!-- Basic -->
        <div class="mt-3">
          <CRow sm="12">
            <CCol sm="6" class="h5">
              {{ disp_WiegandBasicDeviceName }}
              <CInput size="lg" class="mt-2" v-model="localStep1form.name"
                :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
                valid-feedback="ok"
                :is-valid="isFieldPassed('name', localStep1form.name)"
                required/>
            </CCol>
            <CCol sm="6" class="h5">
              {{ disp_WiegandBasicDeviceGroups }}
              <CSelect size="lg" v-model="localStep1form.divice_groups" 
              :options="value_deviceGroupsList" 
              :filterable="true" class="font-control mt-2"/>
            </CCol>
          </CRow>
        </div>
        
    </div>


  </div>
</template>
  
<script>
  import i18n from "@/i18n";

  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";

  export default {
    name: "CamerasBasic",
    props:{
      step1form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    data() {
      return {
        localStep1form: { ...this.step1form },

        /*Basic title  */
        disp_header: i18n.formatter.format("WiegandBasicName"),

        /**content */
        disp_WiegandBasicDeviceName: i18n.formatter.format("WiegandBasicCOlNameDeviceName"),
        disp_WiegandBasicDeviceGroups: i18n.formatter.format("WiegandBasicCOlNameDeviceGroups"),


        /**v-model */
        value_deviceGroups: "", /**選單 */
        value_deviceGroupsList: [1,2,3]
      };
    },
    components: {
      Multiselect: Multiselect
    },
   
    // 拿資料 寫入資料
    watch: {
      localStep1form: {
        handler(newValue) {
          console.log('emit updateStep1form')
          this.$emit('updateStep1form', { ...newValue });
        },
        deep: true,
      },
      defaultValues: {
        handler(newValue) {
          this.localStep1form = {
            ...this.localStep1form,
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