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
          <CCol sm="6" class="h5"  >
            {{ disp_IOBoxesBasicDeviceName }}
            <CInput size="lg" class="mt-2" v-model="value_deviceGroups" 
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
      name: "AddCamerasStep1Form",
      props:{
        step1form: Object
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
      //預設值
      created() {
        this.defaultPortValue();
        this.localStep1form.user = "admin",
        this.localStep1form.pass = "123456"
        this.localStep1form.connection_info = "/media/video1"
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
      },
      methods: {
        defaultPortValue() {
          this.localStep1form.port = 554;
          return this.localStep1form.port !== null && this.localStep1form.port >= 0 && this.localStep1form.port <= 65535;
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