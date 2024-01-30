<template>
  <div>
    <CCol sm="12">
      <div
        class="h1"
        style="font-weight: 800;"
      >
        {{ $t('GroupPersonList') }}
      </div>
    </CCol>
    <div style="height:20px;" />
    <CCol sm="12">
      <CRow>
        <CCol sm="3">
          <segmented-control
            :options="segmetionOptions"
            :selected-segment-index="flag_currentSelection"
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
            <CInput
              v-model.lazy="value_searchingFilterForAll"
              style="width: 100%;"
              size="lg"
              :placeholder="$t('Search')"
            >
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
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
              <div
                class="h3"
                style="font-weight: 800;"
              >
                {{ $t('Person') }}
              </div>
              <div style="height:10px;" />
              <vxe-table
                id="AllTable"
                :data="value_allItemsToShow"
                style="height:528px"
                stripe
                show-header-overflow
                :cell-style="cellStyle"
                :header-cell-style="headerCellStyle"
                ref="allTable"
                empty-text=" "
              >
                <vxe-table-column
                  type=""
                  width="60"
                  align="center"
                />
                <vxe-table-column
                  show-overflow
                  field="id"
                  :title="$t('PersonId')"
                  width="180"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="name"
                  :title="$t('PersonName')"
                  align="left"
                />
              </vxe-table>
              <vxe-pager
                :layouts="[ 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
                :current-page="value_allTablePage.currentPage"
                :page-size="value_allTablePage.pageSize"
                :total="value_allTablePage.totalResult"
                @page-change="handleAllPageChange"
              />
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
          >
            {{ $t('Return') }}
          </CButton>
        </div>
      </CCol>
    </CCol>
  </div>
</template>

<script>
import SegmentedControl from 'vue-segmented-control';

export default {
  name: 'CheckGroup',
  components: { SegmentedControl },
  data() {
    return {
      disp_allPerson: this.$t('PersonList'),
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',

      value_groupUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : '',
      value_groupName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : '',
      value_remarks: this.$route.params.item && this.$route.params.item.remarks ? this.$route.params.item.remarks : '',
      value_allPersonList: this.$route.params.item && this.$route.params.item.person_list ? this.$route.params.item.person_list : [],
      value_allVisitorList: this.$route.params.item && this.$route.params.item.visitor_list ? this.$route.params.item.visitor_list : [],

      value_searchingFilterForAll: '',
      value_allItemsToShow: [],
      value_allTablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      segmetionOptions: [
        { name: this.$t('Person'), value: 'PersonList', checked: false },
        { name: this.$t('Visitor'), value: 'VisitorList', checked: false },
      ],
      flag_currentSelection: 0,
    };
  },
  watch: {
    value_searchingFilterForAll() {
      this.updateData();
    },
  },
  created() {
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'GroupManagement' });

    if (this.$route.params.item) {
      if (this.$route.params.item.nameToShow) {
        if (this.$route.params.item.nameToShow == 'All Person') {
          this.flag_currentSelection = 0;
          // let selectedItems = this.segmetionOptions.filter((item) => item.value == 'PersonList');

          // if (selectedItems)
          //   selectedItems[0].checked = true ;
        } else {
          this.flag_currentSelection = 1;

          // let selectedItems = this.segmetionOptions.filter((item) => item.value == 'VisitorList');

          // if (selectedItems)
          //   selectedItems[0].checked = true ;
        }
      }
    }
  },
  mounted() {
    this.updateData();
  },
  methods: {
    headerCellStyle() {
      return 'fontSize: 16px';
    },
    cellStyle() {
      return 'fontSize: 16px;';
    },
    updateData() {
      let allItemsToShow = [];

      if (this.flag_currentSelection === 0) {
        allItemsToShow = this.value_allPersonList;
      } else {
        allItemsToShow = this.value_allVisitorList;
      }

      allItemsToShow.sort((a, b) => a.id.localeCompare(b.id));

      this.value_allItemsToShow = this.generateAllFilteredData(allItemsToShow, this.value_searchingFilterForAll);
    },
    generateAllFilteredData(sourceData, filter) {
      const filteredItems = filter.length === 0 ? sourceData : sourceData.filter((item) => (
        item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
        || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
      ));

      this.value_allTablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_allTablePage.currentPage - 1) * this.value_allTablePage.pageSize,
        this.value_allTablePage.currentPage * this.value_allTablePage.pageSize,
      );

      return Object.assign([], sliceList);
    },
    clickOnComplete() {
      this.$router.push({ name: this.value_returnRoutePath });
    },
    handleAllPageChange({ currentPage, pageSize }) {
      this.value_allTablePage.currentPage = currentPage;
      this.value_allTablePage.pageSize = pageSize;
      this.updateData();
    },
    onSelectType(optionsSelected) {
      // console.log( optionsSelected );
      this.disp_allPerson = this.$t(optionsSelected[0].value);
      if (optionsSelected[0].value === 'VisitorList') this.flag_currentSelection = 1;
      else this.flag_currentSelection = 0;
      this.value_allTablePage.currentPage = 1;
      this.updateData();
    },
  },
};
</script>
