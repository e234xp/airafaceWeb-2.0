<template>
  <div class="ChangeAttendance">
    <CRow class="flex align-items-start">
      <CButton class="mx-3 btn btn-outline-primary btn-w-normal" size="lg" @click="$router.back(-1)">
        {{ disp_go_back }}
      </CButton>
      <div class="h1 border-left pl-3">{{ disp_changeAttendanceRecord }}</div>
    </CRow>
    <div style="height: 20px"></div>

    <CRow>
      <CCol sm="12">
        <ChangeAttendanceForm ref="changeAttendanceForm" :formData="$data" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';

import TableObserver from '@/utils/TableObserver.vue';

import ChangeAttendanceForm from './forms/ChangeAttendanceForm.vue';

const defaultlState = () => ({
  obj_loading: null,

  disp_go_back: i18n.formatter.format('GoBack'),
  disp_changeAttendanceRecord: i18n.formatter.format('ChangeAttendanceRecord'),

  flag_enableSearchButton: false,

  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
});

export default {
  name: 'ChangeAttendance',
  components: {
    // CTableWrapper,
    ChangeAttendanceForm,
  },
  data() {
    return defaultlState();
  },
  mixins: [TableObserver],

  methods: {
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_tablePage.currentPage = currentPage;
      self.value_tablePage.pageSize = pageSize;
      // self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems);
      self.resizeOneTable(); /* 引入mixins TableObserver */
    },

    // headerCellStyle(row, column, rowIndex, columnIndex) {
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    // cellStyle(row, column, rowIndex, columnIndex) {
    cellStyle() {
      return 'fontSize:18px;';
    },
    // datePickerDataChange() {
    //   const self = this;
    //   self.flag_enableSearchButton = true;
    // },

    saveDataFromSecondPage() {
      const self = this;
      const secondPageData = self.$refs.changeAttendanceForm.getData(); // 使用 $refs 获取第二页组件的引用，并调用 getData() 方法获取数据

      console.log(secondPageData);
      // self.saveData(secondPageData);
    },
  },
};
</script>
