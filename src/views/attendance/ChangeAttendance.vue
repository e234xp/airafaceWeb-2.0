<template>
  <div class="ChangeAttendance">
    <div class="d-flex ml-3">
      <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" 
         @click=" $router.back(-1)">
        {{ disp_go_back }}
      </CButton>
      <CCol sm="3" class="h5 mt-2 text-center font-weight-bold">{{ disp_changeAttendanceRecord }}</CCol>
      <!-- <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" @click="saveData()" 
        >
        {{ disp_save }}
      </CButton> -->
    </div>
    <div style="height: 35px"></div>
    <CCol sm="12">
      <ChangeAttendanceForm ref="changeAttendanceForm" :formData="$data" />
    </CCol>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TableObserver from "@/utils/TableObserver.vue";
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";
import CTableWrapper from "../reports/ReportTable.vue";


import ChangeAttendanceForm from './forms/ChangeAttendanceForm.vue'


const defaultlState = () => {
  return {
    obj_loading: null,

    disp_go_back: i18n.formatter.format("GoBack"),
    disp_changeAttendanceRecord: i18n.formatter.format("ChangeAttendanceRecord"),
    
    flag_enableSearchButton: false,

    /*跳頁 */
    value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
    },
    
  }
}

export default {
  name: "ChangeAttendance",
  components: {
    CTableWrapper,
    ChangeAttendanceForm
  },
  data() {
    return defaultlState();
  },
  mixins: [TableObserver],

  methods: { 
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      // this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
      this.resizeOneTable(); /* 引入mixins TableObserver */
    },
  
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 18px";
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize:18px;";
    },
    datePickerDataChange() {
      const self = this;
      self.flag_enableSearchButton = true;
    },

    saveDataFromSecondPage() {
      const self = this;
      const secondPageData = self.$refs.changeAttendanceForm.getData(); // 使用 $refs 获取第二页组件的引用，并调用 getData() 方法获取数据
  
      console.log(secondPageData); // 在控制台打印第二页的值
      //self.saveData(secondPageData);
    },



    
  }
 
}

</script>