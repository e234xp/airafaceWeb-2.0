<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div>
      <h2 sm="12">{{ disp_header }}</h2>
    </div>
    <!-- Basic -->
    <!-- <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
      >{{ disp_type }}</CRow
    > -->
    <!-- <CRow>
      <CCol sm="6">
        <CSelect size="lg" value="1" v-model="localStep1form.stream_type" :placeholder="dis_placeholder" :options="value_deviceTypesList" />
      </CCol>
    </CRow> -->

    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletDeviceName }}</CRow>
    <CRow>
      <CCol sm="6">name
        <CInput size="lg"  class="h5"  style="width: 100%;"  v-model="localStep1form.name"/>
      </CCol>
    </CRow>
   
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletID }}</CRow>
    <CRow>
      <CCol sm="6">
        <CInput size="lg"  class="h5"  style="width: 100%;"  v-model="localStep1form.identity"/>
      </CCol>
    </CRow>
    
    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletDeviceGroups }}</CRow>
    <CRow>
      <CCol sm="6">divice_groups
        <multiselect
          v-model="localStep1form.divice_groups"
                  placeholder=""
                  :options="value_deviceGroupsList"
                  :multiple="true"
                  :taggable="true"
                  :hideSelected="true"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  :show-no-options="false"
                  label="name"
                  track-by="value"
        >
        </multiselect>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";

export default {
  name: "AddTabletsStep1Form",
  props: {
    step1form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  emits: ["updateStep1form"],
  data() {
    return {
      localStep1form: { ...this.step1form },

      /*Basic title  */
      disp_header: i18n.formatter.format("TabletsBasicName"),

      /**content */
      disp_type: i18n.formatter.format("TabletsBasicCOlNameDeviceType"),
      disp_tabletID: i18n.formatter.format("TabletsBasicCOlNameDeviceID"),
      disp_tabletDeviceName: i18n.formatter.format("TabletsBasicCOlNameDeviceName"),
      disp_tabletDeviceGroups: i18n.formatter.format("TabletsBasicCOlNameDeviceGroups"),

      value_deviceTypesList: ["airaTablet", "airaTablet xs"],

      // 文字提示
      dis_placeholder: i18n.formatter.format("placeholder"), // port 提示文字
      disp_select: i18n.formatter.format("Select"),
      disp_selected: i18n.formatter.format("Selected"),
      disp_deselect: i18n.formatter.format("Deselect"),

      //設備群組 下拉選項
      value_deviceGroupsList: [],

      //設備類型
      value_deviceTypesList: ["airaTablet", "airaTablet xs"],
    };
  },
  components: {
    multiselect: Multiselect,
  },
  // 拿資料 寫入資料
  watch: {
    localStep1form: {
      handler(newValue) {
        this.$emit("updateStep1form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step1form).includes(key)) return;
          this.localStep1form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.formatNameList();
  },
  methods: {
    /**設備群組 */
    async formatNameList() {
      const self = this;
      let res = await self.$globalFindVideoDeviceGroups("", 0, 3000); /**get data */
      let groups = res.data.result; /**拿回所有group */
      const handleData = groups.map(({ name, uuid }) => ({ name: name, value: uuid })); 
      this.value_deviceGroupsList = handleData;
    },
  
  },

};
</script>
