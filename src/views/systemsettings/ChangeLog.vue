<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ $t('SystemLog') }}
      </div>
      <div style="height: 30px" />
      <CCol sm="12">
        <CRow>
          <div class="mb-3 d-flex align-items-center">
            <date-picker
              style="width: 500px"
              :lang="this.$globalDatePickerLanguage"
              v-model="value_specifiedDatetimeRange"
              type="datetime"
              range
              :placeholder="$t('SelectDatetimeRange')"
              @change="datePickerDatachange()"
            />
            <CButton
              class="btn btn-primary btn-w-normal ml-3"
              size="lg"
              @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton"
            >
              {{ $t('Search') }}
            </CButton>
          </div>
          <div style="margin-left: auto">
            <CInput
              v-model.lazy="value_searchingFilter"
              style="width: 400px"
              size="lg"
              :placeholder="$t('Search')"
            >
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </div>
        </CRow>
      </CCol>
      <CCard>
        <CCardBody>
          <div>
            <vxe-table
              :data="value_dataItemsToShow"
              height="531"
              columns-height="100"
              stripe
              align="center"
              :cell-style="cellStyle"
              :header-cell-style="headerCellStyle"
              ref="mainTable"
            >
              <vxe-table-column
                field="dateTime"
                :title="$t('Time')"
                width="30%"
                style="font: 10px"
                align="center"
              />
              <vxe-table-column
                field="person_name"
                :title="$t('PersonName')"
                width="30%"
                align="center"
              />
              <vxe-table-column
                field="data"
                :title="$t('Info')"
                width="40%"
                align="left"
              />
            </vxe-table>
          </div>
          <vxe-pager
            :layouts="[
              'PrevJump',
              'PrevPage',
              'Number',
              'NextPage',
              'NextJump',
              'FullJump',
              'Total',
            ]"
            :current-page="value_tablePage.currentPage"
            :page-size="value_tablePage.pageSize"
            :total="value_tablePage.totalResult"
            @page-change="handlePageChange"
          />
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import TableObserver from '@/utils/TableObserver.vue';

// eslint-disable-next-line no-extend-native
Date.prototype.yyyymmdd_HHMMSS = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();
  const HH = this.getHours();
  const MM = this.getMinutes();
  const SS = this.getSeconds();

  return [
    `${this.getFullYear()}-`,
    `${(mm > 9 ? '' : '0') + mm}-`,
    `${(dd > 9 ? '' : '0') + dd} `,
    `${(HH > 9 ? '' : '0') + HH}:`,
    `${(MM > 9 ? '' : '0') + MM}:`,
    (SS > 9 ? '' : '0') + SS,
  ].join('');
};

export default {
  name: 'ChangeLog',
  data() {
    return {
      obj_loading: null,
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      param_cardStyle: 'height: 39rem;',
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_searchingFilter: '',
      value_dataTotalLength: 0,
      value_specifiedDatetimeRange: [null, null],
      flag_enableSearchButton: true,
    };
  },

  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  mixins: [TableObserver],
  mounted() {
    this.observeTableSize();
  },
  created() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    const endTimeTimestamp = endTime.getTime();
    const startTimeTimestamp = endTimeTimestamp - 86400000 * 1 + 1;

    this.value_specifiedDatetimeRange[0] = new Date(startTimeTimestamp);
    this.value_specifiedDatetimeRange[1] = endTime;
    this.queryData(startTimeTimestamp, endTimeTimestamp);
  },

  watch: {
    value_searchingFilter() {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter,
      );
    },
  },
  components: {},
  methods: {
    clickOnSearch() {
      this.flag_enableSearchButton = false;
      const startTime = this.value_specifiedDatetimeRange[0];
      const endTime = this.value_specifiedDatetimeRange[1];
      if (startTime != null && endTime != null) {
        this.queryData(startTime.getTime(), endTime.getTime(), () => { });
      }
    },
    datePickerDatachange() {
      this.flag_enableSearchButton = true;
    },
    queryData(startTime, endTime, cb) {
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
      this.$globalFindPerson('', 0, 20000, (_, personData) => {
        const { person_list } = personData;

        this.$globalQueryChangeLog(
          {
            start_time: startTime,
            end_time: endTime,
            slice_shift: 0,
            slice_length: 10000,
            uuid_list: [],
          },
          (__, data) => {
            if (this.obj_loading) this.obj_loading.hide();
            this.value_allTableItems = data.result.data;
            this.value_dataTotalLength = data.result.total_length;
            this.value_allTableItems.sort((a, b) => {
              if (a.timestamp < b.timestamp) return 1;
              if (a.timestamp > b.timestamp) return -1;
              return 0;
            });
            this.value_allTableItems.forEach((item, index) => {
              this.value_allTableItems[index].dateTime = new Date(item.timestamp).yyyymmdd_HHMMSS();
              this.value_allTableItems[index].person_name = person_list.find((person) => person.uuid === item.uuid)?.name;
              this.value_allTableItems[index].data = this.generateDataInfo(item);
            });
            this.value_dataItemsToShow = this.generateFilteredData(
              this.value_allTableItems,
              this.value_searchingFilter,
            );
            this.value_tablePage.currentPage = 1;
            if (cb) cb();
          },
        );
      });
    },
    generateDataInfo(item) {
      const { action, oriData, newData } = item;
      const properties = ['smoothie', 'vegetable', 'milk'];
      let info = '';
      let result = '';
      const added = [];
      const removed = [];

      switch (action) {
        case 'create':
          info = properties
            .filter((prop) => newData[prop] > 0)
            .map((prop) => `${newData[prop]} ${this.$t(prop.charAt(0).toUpperCase() + prop.slice(1))}`)
            .join('、');
          return info ? `${this.$t('Create')} ${info}` : '';

        case 'remove':
          info = properties
            .filter((prop) => oriData[prop] > 0)
            .map((prop) => `${oriData[prop]} ${this.$t(prop.charAt(0).toUpperCase() + prop.slice(1))}`)
            .join('、');
          return info ? `${this.$t('Remove')} ${info}` : '';

        case 'modify':
          properties.forEach((prop) => {
            const diff = newData[prop] - oriData[prop];
            if (diff > 0) added.push(`${diff} ${this.$t(prop.charAt(0).toUpperCase() + prop.slice(1))}`);
            else if (diff < 0) removed.push(`${-diff} ${this.$t(prop.charAt(0).toUpperCase() + prop.slice(1))}`);
          });

          if (added.length) result += `${this.$t('Add')} ${added.join('、')}`;
          if (added.length && removed.length) result += '，';
          if (removed.length) result += `${this.$t('Remove')} ${removed.join('、')}`;
          return result;

        default:
          return '';
      }
    },
    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter,
      );
      this.resizeOneTable();
    },
    generateFilteredData(sourceData, filter) {
      const filteredItems = filter.length == 0
        ? sourceData
        : sourceData.filter((item) => (
          item.dateTime.toLowerCase().indexOf(filter.toLowerCase()) > -1
          || item.person_name.toLowerCase().indexOf(filter.toLowerCase()) > -1
        ));
      this.value_tablePage.totalResult = this.value_dataTotalLength; // filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
        this.value_tablePage.currentPage * this.value_tablePage.pageSize,
      );
      return Object.assign([], sliceList);
    },
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;overflow:hidden;white-space:nowrap;text-overflow: ellipsis;';
    },
  },
};
</script>

<style>
  .mx-input {
    padding: 0.5rem 1rem;
    font-size: 1.09375rem;
    height: calc(1.5em + 1rem + 2px);
    border-color: #d8dbe0;
  }
</style>
