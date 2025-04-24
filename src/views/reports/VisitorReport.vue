<template>
  <div class="VisitorReport">
    <div>
      <CCol sm="12">
        <div class="h1">
          {{ disp_header }}
        </div>
      </CCol>
      <div style="height: 35px" />
    </div>
    <div>
      <CCol sm="12">
        <CRow class="justify-content-between">
          <div class="d-flex align-items-center h-100 mb-3 mr-3">
            <date-picker
              style="width: 400px"
              :lang="this.$globalDatePickerLanguage"
              v-model="value_specifiedDatetimeRange"
              type="datetime"
              range
              :placeholder="disp_selectDatetimeRange"
              @change="datePickerDatachange()"
            />
            <CButton
              class="btn btn-primary btn-w-normal ml-3"
              size="lg"
              @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton"
            >
              {{ disp_search }}
            </CButton>
            <CDropdown
              :toggler-text="toggleText()"
              class="btn btn-primary btn-w-normal ml-3 p-0 dropdown-theme"
              size="lg"
              :disabled="!flag_enableSearchButton"
            >
              <CDropdownItem @click="exportExcel(true)">
                {{ disp_exportExcel }} ({{ disp_withPhoto }})
              </CDropdownItem>
              <CDropdownItem @click="exportExcel(false)">
                {{ disp_exportExcel }} ({{ disp_withoutPhoto }})
              </CDropdownItem>
            </CDropdown>
          </div>

          <CInput
            v-model.lazy="value_searchingFilter"
            style="width: 400px"
            size="lg"
            :placeholder="disp_search"
          >
            <template #prepend-content>
              <CIcon name="cil-search" />
            </template>
          </CInput>
        </CRow>
      </CCol>
      <div style="height: 12px" />
    </div>
    <CCard>
      <CCardBody>
        <div>
          <vxe-table
            :data="value_dataItemsToShow"
            stripe
            align="center"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            ref="mainTable"
            @checkbox-all="selectAllEvent"
            @checkbox-change="selectChangeEvent"
          >
            <vxe-table-column
              field="dateTime"
              :title="disp_dateTime"
              :show-overflow="ellipsisMode"
              width="16%"
              align="center"
            />
            <vxe-table-column
              field="source"
              :title="disp_source"
              width="10%"
              align="center"
            />
            <vxe-table-column
              field="id"
              :title="disp_id"
              :show-overflow="ellipsisMode"
              width="13%"
              align="center"
            />
            <vxe-table-column
              field="name"
              :title="disp_name"
              :show-overflow="ellipsisMode"
              width="13%"
              align="center"
            />
            <vxe-table-column
              field="groups"
              :title="disp_group_list"
              :show-overflow="ellipsisMode"
              width="16%"
              align="center"
            />
            <vxe-table-column
              v-if="$deviceProfile.supportTemperature"
              field="temperature"
              :title="disp_temperature"
              :show-overflow="ellipsisMode"
              width="13%"
              align="center"
            />
            <vxe-table-column
              field="score"
              :title="disp_verify_score"
              :show-overflow="ellipsisMode"
              width="16%"
              align="center"
            />

            <vxe-table-column
              min-width="13%"
              field="showimage"
              :title="disp_face_image"
              type="html"
            />
            <!-- <vxe-table-column :title="disp_face_image" min-width="13%">
              <template #default="{ row }">
                <img :id="row.face_image_id.f + row.face_image_id.uuid" />
              </template>
            </vxe-table-column> -->
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
  </div>
</template>

<script>
import i18n from '@/i18n';
import { mapState } from 'vuex';
import TableObserver from '@/utils/TableObserver.vue';

import FileSaver from 'file-saver';
import Excel from 'exceljs/dist/exceljs.min';
import JsZip from 'jszip';

const dayjs = require('dayjs');

const defaultlState = () => ({
  obj_loading: null,

  param_cardStyle: 'height: 35rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,

  flag_enableSearchButton: false,
  flag_downloadingExecl: false,

  excelExecutionAmounts: 0,
  excelCounter: 0,

  disp_select: i18n.formatter.format('Select'),
  disp_selected: i18n.formatter.format('Selected'),
  disp_deselect: i18n.formatter.format('Deselect'),

  disp_header: i18n.formatter.format('VisitorReport'),
  disp_selectDatetimeRange: i18n.formatter.format('DateTime'),

  disp_search: i18n.formatter.format('Search'),
  disp_exportExcel: i18n.formatter.format('ExportExcel'),
  disp_withPhoto: i18n.formatter.format('WithPhoto'),
  disp_withoutPhoto: i18n.formatter.format('WithoutPhoto'),

  disp_dateTime: i18n.formatter.format('Time'),
  disp_source: i18n.formatter.format('PersonInformationSource'),
  disp_id: i18n.formatter.format('PersonId'),
  disp_name: i18n.formatter.format('PersonName'),
  disp_group_list: i18n.formatter.format('GroupName'),
  disp_temperature: i18n.formatter.format('Temperature'),
  disp_verify_score: i18n.formatter.format('Score'),
  disp_face_image: i18n.formatter.format('CapturedPhoto'),

  value_searchingFilter: '',
  value_specifiedDatetimeRange: [],

  value_allTableItems: [],
  value_dataTotalLength: 0,
  value_dataItemsToShow: [],
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },

  cameraList: [],
  tabletList: [],
  searchTimer: null,
});

export default {
  name: 'VisitorReport',
  components: {
    // CTableWrapper,
  },
  data() {
    // return Object.assign({}, defaultlState(), this.formData);
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  mixins: [TableObserver],
  async created() {
    const self = this;
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    const endTimeTimestamp = endTime.getTime();
    const startTimeTimestamp = endTimeTimestamp - 86400000 + 1;

    const { data: { list: cameraList } } = await this.$globalFindCameras('', 0, 3000);
    const { data: { data_list: tabletList } } = await this.$globalGetTabletList('', 0, 3000);

    this.cameraList = cameraList;
    this.tabletList = tabletList;

    self.value_specifiedDatetimeRange[0] = new Date(startTimeTimestamp);
    self.value_specifiedDatetimeRange[1] = endTime;
    self.flag_enableSearchButton = true;
    self.clickOnSearch();
  },
  mounted() {
    this.observeTableSize();
  },
  watch: {
  value_searchingFilter(newVal) {
    // 先清掉舊的計時器（如果還沒到 500ms 就又改字了）
    clearTimeout(this.searchTimer);
    // 再重設一個新的計時器：500ms 後才執行裡面的函式
    this.searchTimer = setTimeout(() => {
      this.value_tablePage.currentPage = 1;
      const startTime = this.value_specifiedDatetimeRange[0].getTime();
      const endTime   = this.value_specifiedDatetimeRange[1].getTime();
      this.fetchPageData(startTime, endTime, 1, newVal);
    }, 500);
  }
},
  methods: {
    toggleText() {
      return i18n.formatter.format('ExportExcel');
    },
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    cellStyle() {
      return 'fontSize:18px;';
    },
    datePickerDatachange() {
      const self = this;
      self.flag_enableSearchButton = true;
    },
    selectAllEvent() {

    },
    selectChangeEvent() {

    },

    clickOnSearch() {
      const startTime = this.value_specifiedDatetimeRange[0].getTime();
      const endTime = this.value_specifiedDatetimeRange[1].getTime();

      this.value_tablePage.currentPage = 1;
      this.fetchPageData(startTime, endTime, 1);
    },
    async fetchPageData(startTS, endTS, page, keyword='') {
    // 顯示 loading
    this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
    this.value_allTableItems = []

    // 計算 slice_shift / slice_length
    const shift  = (page - 1) * this.value_tablePage.pageSize;
    const length = this.value_tablePage.pageSize;

    const query = {
      start_time:   startTS,
      end_time:     endTS,
      slice_length: length,
      slice_shift:  shift,
      uuid_list:    [],
      with_image:   false,
      merged: false,
      keyword,
    };
    
    // 呼叫 API
    const retResult = await this.$globalGetVisitorResult(query);
 

    // 更新總筆數給 Pager
    this.value_tablePage.totalResult = retResult.data.result.total_length;


    const err = retResult.error;
        if (err == null && retResult.data) {
          const { result } = retResult.data;
          if (result.data) {
            if (result.data.length >= 1) {
              // result.data.sort((a, b) => a.timestamp - b.timestamp);
              const filter = result.data.filter((item) => !item.merged);
              this.value_allTableItems.push(...filter);
              this.value_dataTotalLength += filter.length;
              this.value_allTableItems.sort((a, b) => {
                if (a.timestamp < b.timestamp) return 1;
                if (a.timestamp > b.timestamp) return -1;
                return 0;
              });
            }
          }

        }

        try {
        this.value_allTableItems.forEach((pItem) => {
          const item = pItem;
          try {
            item.source = (this.cameraList.find((c) => c.uuid === item.source_id) || this.tabletList.find((t) => t.uuid === item.source_id))?.name || '';
            item.dateTime = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss');

            item.score = `${(item.verify_score * 100).toFixed(2)}%`;
            item.groups = JSON.parse(item.group_list);
            item.groups = item.groups.filter((g) => g !== 'All Visitor');
            item.groups = item.groups.join(',');

            const showimageId = item.face_image_id
              ? item.face_image_id.f + item.face_image_id.uuid
              : '';
            item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAf`
              + 'FcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAA'
              + 'QAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
          } catch (ex) {
            console.log(ex);
          }
        });
        this.value_dataItemsToShow = this.generateFilteredData(
          this.value_allTableItems,
        );
        this.obj_loading.hide();
      } catch (ex) {
        console.log(ex);
      }
    
    
  },
    async setupVisitorData(startTS, endTS) {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
      self.value_allTableItems = [];
      self.value_dataTotalLength = 0;
      let shitf = 0;
      let thereIsMoreData = true;

      while (thereIsMoreData) {
        const query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: 10000,
          slice_shift: shitf,
          uuid_list: [],
          with_image: false,
          merged: false,
          keyword: self.value_searchingFilter
        };

        const retResult = await self.$globalGetVisitorResult(query);

        const err = retResult.error;
        if (err == null && retResult.data) {
          const { result } = retResult.data;
          if (result.data) {
            if (result.data.length >= 1) {
              // result.data.sort((a, b) => a.timestamp - b.timestamp);
              const filter = result.data.filter((item) => !item.merged);
              self.value_allTableItems.push(...filter);
              self.value_dataTotalLength += filter.length;
              self.value_allTableItems.sort((a, b) => {
                if (a.timestamp < b.timestamp) return 1;
                if (a.timestamp > b.timestamp) return -1;
                return 0;
              });
            }
          }

          if (result.slice_shift + result.data.length < result.total_length) {
            thereIsMoreData = true;
            shitf = result.slice_shift + result.data.length;
          } else thereIsMoreData = false;
        } else thereIsMoreData = false;
      }

      try {
        self.value_allTableItems.forEach((pItem) => {
          const item = pItem;
          try {
            item.source = (this.cameraList.find((c) => c.uuid === item.source_id) || this.tabletList.find((t) => t.uuid === item.source_id))?.name || '';
            item.dateTime = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss');

            item.score = `${(item.verify_score * 100).toFixed(2)}%`;
            item.groups = item.group_list;
            item.groups = JSON.parse(item.group_list);
            item.groups = item.groups.filter((g) => g !== 'All Visitor');
            item.groups = item.groups.join(',');

            const showimageId = item.face_image_id
              ? item.face_image_id.f + item.face_image_id.uuid
              : '';
            item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAf`
              + 'FcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAA'
              + 'QAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
          } catch (ex) {
            console.log(ex);
          }
        });
        // self.value_dataItemsToShow = self.generateFilteredData(
        //   self.value_allTableItems,
        // );
        self.value_tablePage.currentPage = 1;
        self.obj_loading.hide();
      } catch (ex) {
        console.log(ex);
      }
    },
    queryVisitorResult(_data) {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
      self.$globalGetVisitorResult(_data, (error, data) => {
        if (self.obj_loading) self.obj_loading.hide();

        if (!error) {
          self.value_allTableItems = data.result.data;
          self.value_dataTotalLength = data.result.total_length;
          self.value_allTableItems.sort((a, b) => {
            if (a.timestamp < b.timestamp) return 1;
            if (a.timestamp > b.timestamp) return -1;
            return 0;
          });
          self.value_allTableItems.forEach((pItem) => {
            const item = pItem;
            try {
              item.source = (this.cameraList.find((c) => c.uuid === item.source_id) || this.tabletList.find((t) => t.uuid === item.source_id))?.name || '';
              item.dateTime = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss');

              item.score = `${(item.verify_score * 100).toFixed(2)}%`;
              item.groups = item.group_list;
              item.groups = JSON.parse(item.group_list);
              item.groups = item.groups.filter((g) => g !== 'All Visitor');
              item.groups = item.groups.join(',');

              const showimageId = item.face_image_id
                ? item.face_image_id.f + item.face_image_id.uuid
                : '';
              item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAf`
                + 'FcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAA'
                + 'QAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
            } catch (ex) {
              console.log(ex);
            }
          });
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
          );

          self.value_tablePage.currentPage = 1;
          // if (cb) cb();
        }
      });
    },
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_tablePage.currentPage = currentPage;
      self.value_tablePage.pageSize = pageSize;
      const startTime = self.value_specifiedDatetimeRange[0].getTime();
      const endTime   = self.value_specifiedDatetimeRange[1].getTime();
      const keyword   = this.value_searchingFilter;
      self.fetchPageData(startTime, endTime, currentPage, keyword);
      self.resizeOneTable();
    },

    generateFilteredData(sourceData) {
      const self = this;
      const sliceList = sourceData
      sliceList.forEach(async (slicei) => {
        try {
          const showimageId = slicei.face_image_id
            ? slicei.face_image_id.f + slicei.face_image_id.uuid
            : '';
          if (showimageId.length > 0) {
            const dataImage = await self.$globalFetchVerifyPhoto(slicei.face_image_id);
            if (dataImage.error == null && dataImage.data) {
              const ele = document.getElementById(showimageId);
              if (ele) ele.src = `data:image/jpeg;base64,${dataImage.data.face_image}`;
            }
          }
        } catch (e) {
          console.log('sliceList.forEach 315', e);
        }
      });
      return Object.assign([], sliceList);
    },

    sleep(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    },

    async exportExcel(withPhoto) {
      const self = this;

      const startTime = this.value_specifiedDatetimeRange[0].getTime();
      const endTime = this.value_specifiedDatetimeRange[1].getTime();

      await self.setupVisitorData(startTime, endTime);

      
      self.flag_downloadingExecl = true;
      let snapshotFolder = null;

      const zip = new JsZip();

      if (withPhoto) snapshotFolder = zip.folder('snapshot');

      let workbook = new Excel.Workbook();
      let worksheet = null;
      self.exportNo = 0;

      worksheet = workbook.addWorksheet('Report');

      worksheet.columns = [
        { header: 'No', key: 'No', width: 10 },
        { header: self.disp_dateTime, key: 'dateTime', width: 10 },
        { header: self.disp_source, key: 'source', width: 10 },
        { header: self.disp_id, key: 'id', width: 8 },
        { header: self.disp_name, key: 'name', width: 10 },
        { header: self.disp_group_list, key: 'groups', width: 8 },
        { header: self.disp_verify_score, key: 'score', width: 8 },
        { header: self.disp_face_image, key: 'showimage', width: 10 },
      ];

      if (self.$deviceProfile.supportTemperature) {
        worksheet.columns.push({ header: self.disp_temperature, key: 'temperature', width: 10 });
      }

      self.excelExecutionAmounts = self.value_allTableItems.length;
      self.excelCounter = 0;

      for (let idx = 0; idx < self.value_allTableItems.length; idx += 1) {
        self.exportNo += 1;
        self.excelCounter += 1;

        worksheet.addRow({
          No: self.exportNo,
          source: self.value_allTableItems[idx].source,
          dateTime: self.value_allTableItems[idx].dateTime,
          id: self.value_allTableItems[idx].id,
          name: self.value_allTableItems[idx].name,
          groups: self.value_allTableItems[idx].groups,
          score: self.value_allTableItems[idx].score,
          temperature: self.value_allTableItems[idx].temperature,
        });

        if (withPhoto) {
          await self.sleep(10);
          const faceImageRet = await self.$globalFetchVerifyPhoto(
            self.value_allTableItems[idx].face_image_id,
          );
          if (!faceImageRet.error) {
            const photoId = workbook.addImage({
              base64: faceImageRet.data.face_image,
              extension: 'jpeg',
            });

            worksheet.lastRow.height = 60;
            worksheet.addImage(
              photoId,
              `H${worksheet.rowCount}:H${worksheet.rowCount}`,
            );

            const fileName = self.value_allTableItems[idx].dateTime
              .replace('-', '_')
              .replace(' ', '_')
              .replace(':', '_');
            snapshotFolder.file(
              `${self.exportNo}_${fileName}.jpeg`,
              faceImageRet.data.face_image,
              { base64: true },
            );
          }
        }

        if (self.exportNo % 1000 === 0) {
          await workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            zip.file('Investigation-Report.xlsx', blob);
          });

          workbook = new Excel.Workbook();
          worksheet = workbook.addWorksheet('Report');

          worksheet.columns = [
            { header: 'No', key: 'No', width: 10 },
            { header: self.disp_dateTime, key: 'dateTime', width: 10 },
            { header: self.disp_source, key: 'source', width: 10 },
            { header: self.disp_id, key: 'id', width: 8 },
            { header: self.disp_name, key: 'name', width: 10 },
            { header: self.disp_group_list, key: 'groups', width: 8 },
            { header: self.disp_verify_score, key: 'score', width: 8 },
            { header: self.disp_face_image, key: 'showimage', width: 10 },
          ];

          if (self.$deviceProfile.supportTemperature) {
            worksheet.columns.push({ header: self.disp_temperature, key: 'temperature', width: 10 });
          }
        }
      }

      if (workbook != null) {
        workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          zip.file('Investigation-Report.xlsx', blob);

          zip.generateAsync({ type: 'blob' }).then((content) => {
            FileSaver.saveAs(content, 'Investigation-Report.zip');
          });
        });
      }

      self.flag_downloadingExecl = false;
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

  .VisitorReport td,
  .VisitorReport th {
    font-size: 15px !important;
  }
</style>
