<template>
    <div id="wrapper">
      <!-- 標題 -->
      <div>
      <CCol sm="12">
          <td class="h1">{{ disp_header }}</td>
      </CCol>
     
      <div style="height: 35px"></div>
      </div>
      <!-- Basic -->
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5" >
            {{ disp_IOBoxesBasicBrand }}
            <CSelect size="lg" v-model="localStep1form.brand" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" 
          
            valid-feedback="ok"
            
            required/>
          </CCol>
          <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicModel }}
            <CSelect size="lg" v-model="localStep1form.model" :options="value_deviceGroupsList" :filterable="true" class="font-control mt-2" 
          
            valid-feedback="ok"
            
            required/>
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicDeviceName }}
            <CInput size="lg" class="mt-2" v-model="localStep1form.name" 
            :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('name', localStep1form.name)"
            required/>
          </CCol>
          <CCol sm="6" class="h5" >
            {{ disp_IOBoxesBasicDeviceGroups }}
            <multiselect class="mt-2"  v-model="localStep1form.divice_groups" placeholder="" :options="value_deviceGroupsList" :multiple="true"
              :taggable="true" :hideSelected="true" 
              :show-no-options="false"
            >
            </multiselect>
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
      name: "Step1Form",
      props:{
        step1form: Object,
        defaultValues: Object,
        isFieldPassed: Function,
      },
      data() {
      return {
          localStep1form: { ...this.step1form },

          isChecked: true,

          /*Basic title  */
          disp_header: i18n.formatter.format("I/OBoxesBasicName"),

          /**content */
          disp_IOBoxesBasicBrand: i18n.formatter.format("I/OBoxesBasicCOlNameBrand"),
          disp_IOBoxesBasicModel: i18n.formatter.format("I/OBoxesBasicCOlNameModel"),
          disp_IOBoxesBasicDeviceName: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceName"),
          disp_IOBoxesBasicDeviceGroups: i18n.formatter.format("I/OBoxesBasicCOlNameDeviceGroups"),

          /**v-model */
          value_deviceGroups: "", /**選單 */
          value_deviceGroupsList: [1,2,3]
        };
      },
      components: {
        "v-select": VueSelect,
        multiselect: Multiselect,
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