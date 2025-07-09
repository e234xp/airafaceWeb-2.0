<template>
  <div class="ChangeAttendance">
    <CRow class="flex align-items-start">
      <CButton class="mx-3 btn btn-outline-primary btn-w-normal" size="lg" @click="$router.back(-1)">
        {{ $t('GoBack') }}
      </CButton>
      <div class="h1 border-left pl-3">
        {{ $t('ChangeAttendanceRecord') }}
      </div>
    </CRow>
    <div style="height: 20px" />

    <CRow>
      <CCol sm="12">
        <ChangeAttendanceForm ref="changeAttendanceForm" :form-data="$data" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import TableObserver from '@/utils/TableObserver.vue';

  import ChangeAttendanceForm from './forms/ChangeAttendanceForm.vue';

  export default {
    name: 'ChangeAttendance',
    components: {
      // CTableWrapper,
      ChangeAttendanceForm,
    },
    data() {
      return {
        obj_loading: null,

        flag_enableSearchButton: false,

        value_tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        },
      };
    },
    mixins: [TableObserver],

    methods: {
      handlePageChange({ currentPage, pageSize }) {
        this.value_tablePage.currentPage = currentPage;
        this.value_tablePage.pageSize = pageSize;
        // this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
        this.resizeOneTable(); /* 引入mixins TableObserver */
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
      //   this.flag_enableSearchButton = true;
      // },

      saveDataFromSecondPage() {
        const secondPageData = this.$refs.changeAttendanceForm.getData(); // 使用 $refs 获取第二页组件的引用，并调用 getData() 方法获取数据

        console.log(secondPageData);
        // this.saveData(secondPageData);
      },
    },
  };
</script>