<template>
  <div>
    <CCol sm="12">
      <div class="h1" style="font-weight: 800;">{{ disp_groupPersonList }}</div>
    </CCol>
    <div style="height:20px;"></div>
    <CCol sm="12">
      <CRow>
        <CCol sm="3">
          <segmented-control
            :options="segmetionOptions"
            :defaultSelectedOptionIdx="0"
            label="name"
            value="value"
            color="#fff"
            active-color="#20a8d8"
            :multiple="false"
            @select="onSelectType"
          />
        </CCol>
        <CCol sm="9">
        <div style="margin-left:auto">
          <CInput v-model.lazy="value_searchingFilterForAll" style="width: 100%;" size="lg" :placeholder="disp_search">
            <template #prepend-content><CIcon name="cil-search"/></template>
          </CInput>
        </div>
        </CCol>
      </CRow>
    </CCol>
    <CCol sm="12">
      <CCard>
        <CCardBody>
          <CRow>
            <CCol sm="12">
              <div class="h3" style="font-weight: 800;">{{ disp_allPerson }}</div>
              <div style="height:10px;"></div>
              <vxe-table id="AllTable"
                :data="value_allItemsToShow"
                style="height:528px"
                stripe
                show-header-overflow
                :cell-style="cellStyle"
                :header-cell-style="headerCellStyle"
                ref="allTable"
                empty-text=" ">
                <vxe-table-column type="" width="60" align="center"></vxe-table-column>
                <vxe-table-column show-overflow field="id" :title="disp_id" width="180" align="left"></vxe-table-column>  
                <vxe-table-column show-overflow field="name" :title="disp_name" align="left"></vxe-table-column>
              </vxe-table>
              <vxe-pager
                :layouts="[ 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
                :current-page="value_allTablePage.currentPage"
                :page-size="value_allTablePage.pageSize"
                :total="value_allTablePage.totalResult"
                @page-change="handleAllPageChange">
              </vxe-pager>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      
      <CCol sm="12">
        <div class="row justify-content-center">
          <CButton
            style="width: 150px; background-color:#20a8d8;color: white; "
            size="lg"
            @click="clickOnComplete"
            >{{ disp_return }}
          </CButton>
        </div>
      </CCol>
    </CCol>
  </div>
</template>

<script>

import CGroupForm from './forms/GroupForm.vue'
import SegmentedControl from 'vue-segmented-control'
import i18n from "../../i18n"
export default {
  name: 'CheckGroup',
  components: { CGroupForm },
  data () {
    return {
      disp_groupPersonList : i18n.formatter.format("GroupPersonList"),
      disp_id : i18n.formatter.format("PersonId"),
      disp_name : i18n.formatter.format("PersonName"),
      disp_return : i18n.formatter.format("Return"),
      disp_allPerson : i18n.formatter.format("PersonList"),
      value_returnRoutePath : this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : "",
      value_returnRouteName : this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : "",
      
      value_groupUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : "",
      value_groupName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : "",
      value_remarks: this.$route.params.item && this.$route.params.item.remarks ? this.$route.params.item.remarks : "",
      value_allPersonList: this.$route.params.item && this.$route.params.item.person_list ? this.$route.params.item.person_list : [],
      value_allVisitorList: this.$route.params.item && this.$route.params.item.visitor_list ? this.$route.params.item.visitor_list : [],

      disp_header: i18n.formatter.format("CheckGroup"),
      disp_search : i18n.formatter.format("Search"),
      value_searchingFilterForAll : "",
      value_allItemsToShow : [],
      value_allTablePage : {
        currentPage : 1,
        pageSize : 10,
        totalResult : 0
      },
      segmetionOptions: [
        { name: i18n.formatter.format("Person"), value: 'PersonList' },
        { name: i18n.formatter.format("Visitor"), value: 'VisitorList' }
      ],
      flag_currentSelection : 0
    };
  },
  watch : {
      value_searchingFilterForAll : function (value) {
        this.updateData();
      }
  },
  created() {
    if( this.value_returnRoutePath === "" ) this.$router.push({ name: 'GroupManagement' });

    
  },
  mounted () {
    this.updateData();
  },
  methods: {
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return 'fontSize: 16px';
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return 'fontSize: 16px;';
    },
    updateData () {
      const self = this;
      let allItemsToShow = [];

      if( self.flag_currentSelection == 0 ) {
        allItemsToShow = self.value_allPersonList;
      }
      else {
        allItemsToShow = self.value_allVisitorList;
      }
      self.value_allItemsToShow = self.generateAllFilteredData( allItemsToShow, self.value_searchingFilterForAll );
    },
    generateAllFilteredData( sourceData, filter ) {
      const self = this;

      const filteredItems = filter.length == 0 ? sourceData : sourceData.filter( item => {
        return ( item.id.toLowerCase().indexOf( filter.toLowerCase() ) > -1 
          || item.name.toLowerCase().indexOf( filter.toLowerCase() ) > -1 );
        }
      );
      self.value_allTablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice((self.value_allTablePage.currentPage - 1) * self.value_allTablePage.pageSize, self.value_allTablePage.currentPage * self.value_allTablePage.pageSize);
      return Object.assign([], sliceList);
    },
    clickOnComplete() {
      const self = this;
      self.$router.push({ name: self.value_returnRoutePath })
    },
    handleAllPageChange ({ currentPage, pageSize }) {
      this.value_allTablePage.currentPage = currentPage;
      this.value_allTablePage.pageSize = pageSize;
      this.updateData();
    },
    onSelectType ( optionsSelected ) {
      // console.log( optionsSelected );
      this.disp_allPerson = i18n.formatter.format( optionsSelected[0].value );
      if( optionsSelected[0].value == "VisitorList" ) this.flag_currentSelection = 1;
      else this.flag_currentSelection = 0;
      this.value_allTablePage.currentPage = 1;
      this.updateData();
    },
  },
  components: {
    SegmentedControl
  }
}
</script>
