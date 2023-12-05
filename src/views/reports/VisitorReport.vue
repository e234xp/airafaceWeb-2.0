<template>
  <div class="VisitorReport">
    <div>
      <CCol sm="12">
        <div class="h1">{{ disp_header }}</div>
      </CCol>
      <div style="height: 35px"></div>
    </div>
    <div>
      <CCol sm="12">
        <CRow class="justify-content-between">
          <div class="d-flex align-items-center h-100 mb-3 mr-3">
            <date-picker style="width: 400px" :lang="this.$globalDatePickerLanguage"
              v-model="value_specifiedDatetimeRange" type="datetime" range :placeholder="disp_selectDatetimeRange"
              @change="datePickerDatachange()"></date-picker>
            <CButton class="btn btn-primary btn-w-normal ml-3" size="lg" @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton">
              {{disp_search}}
            </CButton>
            <CDropdown :togglerText="toggleText()" class="btn btn-primary btn-w-normal ml-3 p-0 dropdown-theme"
              size="lg" :disabled="!flag_enableSearchButton">
              <CDropdownItem @click="exportExcel(true)">{{ disp_exportExcel }} ({{ disp_withPhoto }})</CDropdownItem>
              <CDropdownItem @click="exportExcel(false)">{{ disp_exportExcel }} ({{ disp_withoutPhoto }})
              </CDropdownItem>
            </CDropdown>
          </div>

          <CInput v-model.lazy="value_searchingFilter" style="width: 400px" size="lg" :placeholder="disp_search">
            <template #prepend-content>
              <CIcon name="cil-search" />
            </template>
          </CInput>
        </CRow>
      </CCol>
      <div style="height: 12px"></div>
    </div>
    <CCard>
      <CCardBody>
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" @checkbox-all="selectAllEvent"
            @checkbox-change="selectChangeEvent">
            <vxe-table-column field="dateTime" :title="disp_dateTime" :show-overflow="ellipsisMode" width="16%"
              align="center">
            </vxe-table-column>
            <vxe-table-column field="id" :title="disp_id" :show-overflow="ellipsisMode" width="13%" align="center">
            </vxe-table-column>
            <vxe-table-column field="name" :title="disp_name" :show-overflow="ellipsisMode" width="13%" align="center">
            </vxe-table-column>
            <vxe-table-column field="groups" :title="disp_group_list" :show-overflow="ellipsisMode" width="16%"
              align="center">
            </vxe-table-column>
            <vxe-table-column v-if="$deviceProfile.supportTemperature" field="temperature" :title="disp_temperature"
              :show-overflow="ellipsisMode" width="13%" align="center"></vxe-table-column>
            <vxe-table-column field="score" :title="disp_verify_score" :show-overflow="ellipsisMode" width="16%"
              align="center"></vxe-table-column>

            <vxe-table-column min-width="13%" field="showimage" :title="disp_face_image" type="html"></vxe-table-column>
            <!-- <vxe-table-column :title="disp_face_image" min-width="13%">
              <template #default="{ row }">
                <img :id="row.face_image_id.f + row.face_image_id.uuid" />
              </template>
            </vxe-table-column> -->
          </vxe-table>
        </div>
        <vxe-pager :layouts="[
            'PrevJump',
            'PrevPage',
            'Number',
            'NextPage',
            'NextJump',
            'FullJump',
            'Total',
          ]" :current-page="value_tablePage.currentPage" :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult" @page-change="handlePageChange">
        </vxe-pager>
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
  created() {
    const self = this;
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    const endTimeTimestamp = endTime.getTime();
    const startTimeTimestamp = endTimeTimestamp - 86400000 + 1;

    self.value_specifiedDatetimeRange[0] = new Date(startTimeTimestamp);
    self.value_specifiedDatetimeRange[1] = endTime;
    self.flag_enableSearchButton = true;
    self.clickOnSearch();
  },
  mounted() {
    this.observeTableSize();
  },
  watch: {
    value_searchingFilter() {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
    },
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

      const data = {
        start_time: startTime,
        end_time: endTime,
        slice_shift: 0,
        slice_length: 10000,
        with_image: false,
        uuid_list: [],
      };

      this.queryVisitorResult(data);
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
      self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems);
      self.resizeOneTable();
    },

    generateFilteredData(sourceData) {
      const self = this;
      const filteredItems = sourceData.filter((item) => {
        if (self.value_searchingFilter) {
          if (
            item.id.toLowerCase().indexOf(self.value_searchingFilter.toLowerCase()) > -1
            || item.name.toLowerCase().indexOf(self.value_searchingFilter.toLowerCase()) > -1
            || (item.group_list && item.group_list.toString().toLowerCase().indexOf(self.value_searchingFilter.toLowerCase()) > -1)
          ) {
            return true;
          }
          return false;
        }

        return true;
      });

      self.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize,
      );
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
        { header: self.disp_id, key: 'id', width: 10 },
        { header: self.disp_name, key: 'name', width: 10 },
        { header: self.disp_group_list, key: 'groups', width: 10 },
        { header: self.disp_verify_score, key: 'score', width: 10 },
        { header: self.disp_face_image, key: 'showimage', width: 15 },
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
            worksheet.addImage(
              photoId,
              `H${worksheet.rowCount}:H${worksheet.rowCount}`,
            );
            worksheet.lastRow.height = 60;

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
            { header: self.disp_id, key: 'id', width: 10 },
            { header: self.disp_name, key: 'name', width: 10 },
            { header: self.disp_group_list, key: 'groups', width: 10 },
            { header: self.disp_verify_score, key: 'score', width: 10 },
            { header: self.disp_face_image, key: 'showimage', width: 30 },
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
