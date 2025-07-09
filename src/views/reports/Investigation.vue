<template>
  <div class="investigation">
    <CCol sm="12">
      <div class="h1">
        {{ disp_header }}
      </div>
      <div style="height: 30px" />
    </CCol>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="2" class="h5">
            {{ disp_selectDatetimeRange }}
          </CCol>
          <CCol sm="4">
            <date-picker style="width: 100%" :lang="this.$globalDatePickerLanguage" v-model="value_searchDatetimeRange"
              type="datetime" range :placeholder="disp_selectDatetimeRange" @change="datePickerDatachange()" />
          </CCol>
          <CCol sm="2" class="h5">
            {{ disp_resultType }}
          </CCol>
          <CCol sm="4">
            <CSelect size="lg" :value.sync="value_searchTypes" :options="value_displayResultTypeList"
              @change="selectTypeChange($event)" />
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="2" class="h5">
            {{ disp_groups }}
          </CCol>
          <CCol sm="4">
            <multiselect v-model="value_searchGroups" placeholder="" :options="value_displayPersonGroupList"
              :multiple="true" :taggable="true" :hide-selected="true" :select-label="disp_select"
              :selected-label="disp_selected" :deselect-label="disp_deselect" :show-no-options="false" />
          </CCol>
          <CCol sm="2" class="h5">
            {{ disp_keyword }}
          </CCol>
          <CCol sm="4">
            <CInput size="lg" v-model="value_keyword" style="width: 100%" />
          </CCol>
        </CRow>
        <CRow class="mb-4">
          <CCol sm="2" class="h5">
            {{ disp_temperature }}
          </CCol>
          <CCol sm="4" class="form-inline">
            <div class="form-check" style="padding-right: 40px">
              <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" value="All"
                v-model="value_Temperature">
              <label class="form-check-label h5" for="flexRadioDefault1">{{
                disp_temperature_ALL
                }}</label>
            </div>
            <div class="form-check" style="padding-right: 40px">
              <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" value="Normal"
                v-model="value_Temperature">
              <label class="form-check-label h5" for="flexRadioDefault2">{{
                disp_temperature_Normal
                }}</label>
            </div>
            <div class="form-check" style="padding-right: 40px">
              <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3"
                value="OverTemperature" v-model="value_Temperature">
              <label class="form-check-label h5" for="flexRadioDefault3">{{
                disp_temperature_OverTemperature
                }}</label>
            </div>
          </CCol>
          <CCol sm="2" class="h5">
            {{ disp_source }}
          </CCol>
          <CCol sm="4" class="form-inline">
            <multiselect v-model="value_searchSource" placeholder="" :options="value_displayPersonSourceList"
              :multiple="true" :taggable="true" :hide-selected="true" :select-label="disp_select"
              :selected-label="disp_selected" :deselect-label="disp_deselect" :show-no-options="false" />
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="6" />
          <CCol sm="6" class="d-flex flex-wrap justify-content-end">
            <span v-if="exportNo >= 1" class="h5" style="
              float: right;
              height: 90%;
              display: flex;
              align-items: flex-end;
              margin-right: 20px;
            ">{{ exportNo }} / {{ excelExecutionAmounts }}</span>

            <CButton class="btn btn-primary btn-w-normal ml-3" size="lg" @click="clickOnSearch()"
              :disabled="!flag_enableSearchButton">
              {{ disp_search }}
            </CButton>
            <CDropdown :toggler-text="toggleText()" class="btn btn-primary btn-w-normal ml-3 p-0 dropdown-theme"
              size="lg" :disabled="!flag_enableSearchButton">
              <CDropdownItem @click="exportExcel(true)">
                {{ disp_exportExcel }} ({{ disp_withPhoto }})
              </CDropdownItem>
              <CDropdownItem @click="exportExcel(false)">
                {{ disp_exportExcel }} ({{ disp_withoutPhoto }})
              </CDropdownItem>
            </CDropdown>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" @checkbox-all="selectAllEvent"
            @checkbox-change="selectChangeEvent">
            <vxe-table-column field="dateTime" :title="disp_dateTime" width="14%" align="center" />
            <vxe-table-column field="source" :title="disp_source" width="10%" align="center" />
            <vxe-table-column field="id" :title="disp_id" width="8%" align="center" />
            <vxe-table-column field="name" :title="disp_name" align="center" width="8%" />
            <vxe-table-column field="card_number" :title="disp_cardnumber" align="center" width="8%" />
            <vxe-table-column field="groups" :title="disp_group_list" width="10%" align="center" />
            <vxe-table-column v-if="$deviceProfile.supportTemperature" field="temperature" :title="disp_temperature"
              width="8%" align="center" />
            <vxe-table-column field="clockMode" :title="disp_verify_mode" width="8%" align="center" />
            <vxe-table-column field="score" :title="disp_verify_score" width="8%" align="center" />
            <vxe-table-column min-width="8%" field="showimage" :title="disp_face_image" type="html" />
            <vxe-table-column min-width="8%" field="commands" :title="$t('Remarks')" align="center" />

            <!-- <vxe-table-column :title="disp_face_image" min-width="10%">
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
          :total="value_tablePage.totalResult" @page-change="handlePageChange" />
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  import TableObserver from '@/utils/TableObserver.vue';
  import Multiselect from 'vue-multiselect';
  import '@/airacss/vue-multiselect.css';

  import FileSaver from 'file-saver';
  import Excel from 'exceljs/dist/exceljs.min';

  import JsZip from 'jszip';
  import { merge } from 'chart.js/helpers';

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
    exportNo: 0,

    value_displayResultTypeList: [
      { value: 'Person', label: i18n.formatter.format('Person') },
      { value: 'Visitor', label: i18n.formatter.format('Visitor') },
      { value: 'Stranger', label: i18n.formatter.format('Stranger') },
    ],

    value_displayPersonGroupList: [],
    value_displayPersonSourceList: [],

    disp_select: i18n.formatter.format('Select'),
    disp_selected: i18n.formatter.format('Selected'),
    disp_deselect: i18n.formatter.format('Deselect'),

    disp_header: i18n.formatter.format('Investigation'),
    disp_selectDatetimeRange: i18n.formatter.format('DateTime'),
    disp_keyword: i18n.formatter.format('Keyword'),
    disp_groups: i18n.formatter.format('Group'),
    disp_resultType: i18n.formatter.format('ResultType'),

    disp_temperature_ALL: i18n.formatter.format('All'),
    disp_temperature_Normal: i18n.formatter.format('Normal'),
    disp_temperature_OverTemperature: i18n.formatter.format('OverTemperature'),

    disp_search: i18n.formatter.format('Search'),
    disp_exportExcel: i18n.formatter.format('ExportExcel'),
    disp_withPhoto: i18n.formatter.format('WithPhoto'),
    disp_withoutPhoto: i18n.formatter.format('WithoutPhoto'),

    disp_dateTime: i18n.formatter.format('Time'),
    disp_source: i18n.formatter.format('PersonInformationSource'),
    disp_id: i18n.formatter.format('PersonId'),
    disp_name: i18n.formatter.format('PersonName'),
    disp_cardnumber: i18n.formatter.format('CardNumber'),
    disp_group_list: i18n.formatter.format('GroupName'),
    disp_temperature: i18n.formatter.format('Temperature'),
    disp_verify_mode: i18n.formatter.format('ClockModePass'),
    disp_verify_score: i18n.formatter.format('Score'),
    disp_face_image: i18n.formatter.format('CapturedPhoto'),

    value_searchingFilter: '',
    value_searchDatetimeRange: [],
    value_keyword: '',
    value_searchGroups: [],
    value_searchSource: [],
    value_searchTypes: 'Person',
    value_Temperature: 'All',

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
  });

  export default {
    name: 'Investigation',
    // components: { CTableWrapper, multiselect: Multiselect },
    components: { multiselect: Multiselect },
    data() {
      // return Object.assign({}, defaultlState(), this.formData);
      const cloneObject = {};
      Object.assign(cloneObject, defaultlState(), this.formData);

      return cloneObject;
    },
    computed: {
      searchSourceIdList() {
        return this.value_searchSource.map((item) => {
          const camera = this.cameraList.find((c) => c.name === item);
          if (camera) return camera.uuid;
          const tablet = this.tabletList.find((t) => t.name === item);
          if (tablet) return tablet.uuid;
          return '';
        });
      },
    },
    mixins: [TableObserver],
    async created() {
      const self = this;
      const endTime = new Date();
      endTime.setHours(23, 59, 59, 999);
      const endTimeTimestamp = endTime.getTime();
      const startTimeTimestamp = endTimeTimestamp - 86400000 + 1;

      self.value_searchDatetimeRange[0] = new Date(startTimeTimestamp);
      self.value_searchDatetimeRange[1] = endTime;
      self.flag_enableSearchButton = true;
      const { data: { list: cameraList } } = await this.$globalFindCameras('', 0, 3000);
      const { data: { data_list: tabletList } } = await this.$globalGetTabletList('', 0, 3000);

      this.cameraList = cameraList;
      this.tabletList = tabletList;
      this.value_displayPersonSourceList = [...this.cameraList.map((item) => item.name), ...this.tabletList.map((item) => item.name)];

      self.clickOnSearch();
    },

    async mounted() {
      const self = this;

      const personGroups = await self.$globalGetGroupList();
      if (personGroups.group_list) {
        personGroups.group_list.forEach((item) => {
          self.value_displayPersonGroupList.push(item.name);
        });
      }

      this.observeTableSize();
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

      selectTypeChange() {
        if (this.value_searchTypes !== 'Person') {
          this.value_searchGroups = [];
        }
      },

      clickOnSearch() {
        const startTime = this.value_searchDatetimeRange[0].getTime();
        const endTime = this.value_searchDatetimeRange[1].getTime();

        // const data = {
        //   start_time: startTime,
        //   end_time: endTime,
        //   slice_shift: 0,
        //   slice_length: 20000,
        //   with_image: false,
        //   uuid_list: [],
        // };

        // 重設分頁
        this.value_tablePage.currentPage = 1;
        // 取第 1 頁
        this.fetchPageData(startTime, endTime, 1);
      },
      async fetchPageData(startTS, endTS, page) {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
        this.value_allTableItems = [];
        // 計算要跳過幾筆
        const shift = (page - 1) * this.value_tablePage.pageSize;
        const length = this.value_tablePage.pageSize;

        const query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: length,
          slice_shift: shift,
          uuid_list: [],
          with_image: false,
          merged: false,
          keyword: this.value_keyword,
          groups: this.value_searchGroups,
          source: this.value_searchSource,
          temperature: this.value_Temperature
        };

        // 根據類型呼叫不同 API
        let retResult;
        switch (this.value_searchTypes) {
          case 'Visitor':
            retResult = await this.$globalGetVisitorResult(query);
            break;
          case 'Stranger':
            retResult = await this.$globalGetStrangerResult(query);
            break;
          default:
            retResult = await this.$globalGetPersonResult(query);
        }

        const result = retResult.data.result;

        // 更新總筆數，Pager 才會正確顯示分頁
        this.value_tablePage.totalResult = result.total_length;

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
              if (item.group_list) {
                item.groups = JSON.parse(item.group_list);
                item.groups = item.groups.filter((g) => g !== 'All Person');
                item.groups = item.groups.filter((g) => g !== 'All Visitor');
                item.groups = item.groups.join(',');

              } else {
                item.groups = ''
              }

              if (item.verify_mode) {
                switch (item.verify_mode) {
                  case 1:
                    item.clockMode = i18n.formatter.format('ClockModeCard');
                    break;
                  case 2:
                    item.clockMode = i18n.formatter.format('ClockModePass');
                    break;
                  case 3:
                    item.clockMode = i18n.formatter.format('ClockModeClockIn');
                    break;
                  case 4:
                    item.clockMode = i18n.formatter.format('ClockModeClockOut');
                    break;
                  default:
                    item.lockMode = i18n.formatter.format('None');
                    break;
                }
              }

              const showimageId = item.face_image_id
                ? item.face_image_id.f + item.face_image_id.uuid
                : '';
              item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJA`
                + 'AAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAA'
                + 'AQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
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

      // 下面可以刪掉原本的 setupPersonData / setupVisitorData / setupStrangerData
      // 或保留當你要一次撈全量時再用

      async setupPersonData(startTS, endTS) {
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
            keyword: this.value_keyword,
            groups: this.value_searchGroups,
            source: this.value_searchSource,
            temperature: this.value_Temperature
          };

          const retResult = await self.$globalGetPersonResult(query);


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
              // item.groups = eval(item.group_list).join(', ');
              item.groups = item.group_list;
              item.groups = item.group_list;
              item.groups = JSON.parse(item.group_list);
              item.groups = item.groups.filter((g) => g !== 'All Person');
              item.groups = item.groups.filter((g) => g !== 'All Visitor');
              item.groups = item.groups.join(',');

              switch (item.verify_mode) {
                case 1:
                  item.clockMode = i18n.formatter.format('ClockModeCard');
                  break;
                case 2:
                  item.clockMode = i18n.formatter.format('ClockModePass');
                  break;
                case 3:
                  item.clockMode = i18n.formatter.format('ClockModeClockIn');
                  break;
                case 4:
                  item.clockMode = i18n.formatter.format('ClockModeClockOut');
                  break;
                default:
                  item.lockMode = i18n.formatter.format('None');
                  break;
              }

              const showimageId = item.face_image_id
                ? item.face_image_id.f + item.face_image_id.uuid
                : '';
              item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ`
                + 'AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAA'
                + 'AAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
            } catch (ex) {
              console.log(ex);
            }
          });
          self.value_tablePage.currentPage = 1;
          // self.value_dataItemsToShow = self.generateFilteredData(
          //   self.value_allTableItems,
          // );

          self.obj_loading.hide();
        } catch (ex) {
          console.log(ex);
        }
      },

      queryPersonResult(_data) {
        const self = this;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.$globalGetPersonResult(_data, (error, data) => {
          if (self.obj_loading) self.obj_loading.hide();

          if (!error) {
            const filter = data.result.data.filter((item) => !item.merged);
            self.value_allTableItems = filter;
            self.value_dataTotalLength = filter.length;
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
                // item.groups = eval(item.group_list).join(', ');
                item.groups = item.group_list;
                item.groups = item.group_list;
                item.groups = JSON.parse(item.group_list);
                item.groups = item.groups.filter((g) => g !== 'All Person');
                item.groups = item.groups.filter((g) => g !== 'All Visitor');
                item.groups = item.groups.join(',');

                switch (item.verify_mode) {
                  case 1:
                    item.clockMode = i18n.formatter.format('ClockModeCard');
                    break;
                  case 2:
                    item.clockMode = i18n.formatter.format('ClockModePass');
                    break;
                  case 3:
                    item.clockMode = i18n.formatter.format('ClockModeClockIn');
                    break;
                  case 4:
                    item.clockMode = i18n.formatter.format('ClockModeClockOut');
                    break;
                  default:
                    item.lockMode = i18n.formatter.format('None');
                    break;
                }

                const showimageId = item.face_image_id
                  ? item.face_image_id.f + item.face_image_id.uuid
                  : '';
                item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ`
                  + 'AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAA'
                  + 'AAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
              } catch (ex) {
                console.log(ex);
              }
            });
            self.value_tablePage.currentPage = 1;
            self.value_dataItemsToShow = self.generateFilteredData(
              self.value_allTableItems,
            );

            // if (cb) cb();
          }
        });
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
            keyword: this.value_keyword,
            groups: this.value_searchGroups,
            source: this.value_searchSource,
            temperature: this.value_Temperature
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
              item.groups = '';
              const showimageId = item.face_image_id
                ? item.face_image_id.f + item.face_image_id.uuid
                : '';
              item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJA`
                + 'AAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAA'
                + 'AQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
            } catch (ex) {
              console.log(ex);
            }
          });
          self.value_tablePage.currentPage = 1;
          // self.value_dataItemsToShow = self.generateFilteredData(
          //   self.value_allTableItems,
          // );

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
            const filter = data.result.data.filter((item) => !item.merged);
            self.value_allTableItems = filter;
            self.value_dataTotalLength = filter.length;
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
                item.groups = '';
                const showimageId = item.face_image_id
                  ? item.face_image_id.f + item.face_image_id.uuid
                  : '';
                item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJA`
                  + 'AAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAA'
                  + 'AQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
              } catch (ex) {
                console.log(ex);
              }
            });
            self.value_tablePage.currentPage = 1;
            self.value_dataItemsToShow = self.generateFilteredData(
              self.value_allTableItems,
            );

            // if (cb) cb();
          }
        });
      },

      async setupStrangerData(startTS, endTS) {
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
            keyword: this.value_keyword,
            groups: this.value_searchGroups,
            source: this.value_searchSource,
            temperature: this.value_Temperature
          };

          const retResult = await self.$globalGetStrangerResult(query);

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
              item.id = '';
              item.name = '';
              item.card_number = '';
              item.score = `${(item.verify_score * 100).toFixed(2)}%`;
              item.groups = '';
              const showimageId = item.face_image_id
                ? item.face_image_id.f + item.face_image_id.uuid
                : '';
              item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF`
                + 'cSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQA'
                + 'AAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
            } catch (ex) {
              console.log(ex);
            }
          });
          self.value_tablePage.currentPage = 1;
          // self.value_dataItemsToShow = self.generateFilteredData(
          //   self.value_allTableItems,
          // );
          self.obj_loading.hide();
        } catch (ex) {
          console.log(ex);
        }
      },

      queryStrangerResult(_data) {
        const self = this;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.$globalGetStrangerResult(_data, (error, data) => {
          if (self.obj_loading) self.obj_loading.hide();

          if (!error) {
            const filter = data.result.data.filter((item) => !item.merged);
            self.value_allTableItems = filter;
            self.value_dataTotalLength = filter.length;
            self.value_allTableItems.sort((a, b) => {
              if (a.timestamp < b.timestamp) return 1;
              if (a.timestamp > b.timestamp) return -1;
              return 0;
            });
            self.value_allTableItems.forEach((pItem) => {
              const item = pItem;
              try {
                item.dateTime = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss');
                item.id = '';
                item.name = '';
                item.card_number = '';
                item.score = `${(item.verify_score * 100).toFixed(2)}%`;
                item.groups = '';
                const showimageId = item.face_image_id
                  ? item.face_image_id.f + item.face_image_id.uuid
                  : '';
                item.showimage = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfF`
                  + 'cSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQA'
                  + 'AAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==\' width=\'100\' height=\'100\'>';
              } catch (ex) {
                console.log(ex);
              }
            });
            self.value_tablePage.currentPage = 1;
            self.value_dataItemsToShow = self.generateFilteredData(
              self.value_allTableItems,
            );

            // if (cb) cb();
          }
        });
      },

      handlePageChange({ currentPage, pageSize }) {
        this.value_tablePage.currentPage = currentPage;
        this.value_tablePage.pageSize = pageSize;

        const startTime = this.value_searchDatetimeRange[0].getTime();
        const endTime = this.value_searchDatetimeRange[1].getTime();
        this.fetchPageData(startTime, endTime, currentPage);
        this.resizeOneTable();
      },

      generateFilteredData(sourceData) {
        console.log("sourceData", sourceData)
        const self = this;

        const sliceList = sourceData
        sliceList.forEach(async (slicei) => {
          try {
            const showimageId = slicei.face_image_id
              ? slicei.face_image_id.f + slicei.face_image_id.uuid
              : '';
            if (showimageId.length > 0) {
              const dataImage = await self.$globalFetchVerifyPhoto(slicei.face_image_id);
              const ele = document.getElementById(showimageId);
              if (dataImage.error == null && dataImage.data) {
                if (ele) ele.src = `data:image/jpeg;base64,${dataImage.data.face_image}`;
              } else if (ele) {
                ele.src = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmT'
                  + '0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQV'
                  + 'QIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==';
              }
            }
          } catch (e) {
            console.log('sliceList.forEach 535', e);
          }
        });
        return Object.assign([], sliceList);
      },

      sleep(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      },

      async exportExcel(withPhoto) {
        const self = this;

        const startTime = this.value_searchDatetimeRange[0].getTime();
        const endTime = this.value_searchDatetimeRange[1].getTime();

        // 1) 先把所有資料全撈回來，根據 type 呼叫不同的 setupXxxData

        switch (self.value_searchTypes) {
          case 'Visitor':
            await self.setupVisitorData(startTime, endTime);
            break;
          case 'Stranger':
            await self.setupStrangerData(startTime, endTime);
            break;
          default:  // Person
            await self.setupPersonData(startTime, endTime);
        }


        // 2) 現在 this.value_allTableItems 就是全部資料，開始匯出流程
        self.flag_downloadingExecl = true;
        let snapshotFolder = null;

        const zip = new JsZip();

        if (withPhoto) snapshotFolder = zip.folder('snapshot');

        let workbook = new Excel.Workbook();
        let worksheet = null;

        self.exportNo = 0;
        self.excelExecutionAmounts = self.value_allTableItems.length;
        self.excelCounter = 0;

        worksheet = workbook.addWorksheet('Investigation-Report');

        worksheet.columns = [
          { header: 'No', key: 'No', width: 10 },
          { header: self.disp_dateTime, key: 'dateTime', width: 10 },
          { header: self.disp_source, key: 'source', width: 10 },
          { header: self.disp_id, key: 'id', width: 8 },
          { header: self.disp_name, key: 'name', width: 10 },
          { header: self.disp_cardnumber, key: 'card_number', width: 8 },
          { header: self.disp_group_list, key: 'groups', width: 8 },
          { header: self.disp_verify_mode, key: 'clockMode', width: 8 },
          { header: self.disp_verify_score, key: 'score', width: 8 },
          { header: self.disp_face_image, key: 'showimage', width: 15 },
        ];

        if (self.$deviceProfile.supportTemperature) {
          worksheet.columns.push({ header: self.disp_temperature, key: 'temperature', width: 10 });
        }

        for (let idx = 0; idx < self.value_allTableItems.length; idx += 1) {
          self.exportNo += 1;
          self.excelCounter += 1;

          worksheet.addRow({
            No: self.exportNo,
            source: self.value_allTableItems[idx].source,
            dateTime: self.value_allTableItems[idx].dateTime,
            id: self.value_allTableItems[idx].id,
            name: self.value_allTableItems[idx].name,
            card_number: self.value_allTableItems[idx].card_number,
            groups: self.value_allTableItems[idx].groups,
            temperature: self.value_allTableItems[idx].temperature,
            clockMode: self.value_allTableItems[idx].clockMode,
            score: self.value_allTableItems[idx].score,
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
                `J${worksheet.rowCount}:J${worksheet.rowCount}`,
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

          if (self.exportNo % 10000 === 0) {
            await workbook.xlsx.writeBuffer().then((data) => {
              const n = self.exportNo / 10000;
              let filename = '';
              if (n >= 2) {
                filename = `investigation_Report_${dayjs(new Date()).format('YYYYMMDD')}_${n}.xlsx`;
              } else {
                filename = `investigation_Report_${dayjs(new Date()).format('YYYYMMDD')}.xlsx`;
              }

              const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              zip.file(filename, blob);
            });

            workbook = new Excel.Workbook();
            worksheet = workbook.addWorksheet('Investigation-Report');

            worksheet.columns = [
              { header: 'No', key: 'No', width: 10 },
              { header: self.disp_dateTime, key: 'dateTime', width: 10 },
              { header: self.disp_source, key: 'source', width: 10 },
              { header: self.disp_id, key: 'id', width: 8 },
              { header: self.disp_name, key: 'name', width: 10 },
              { header: self.disp_cardnumber, key: 'card_number', width: 8 },
              { header: self.disp_group_list, key: 'groups', width: 8 },
              { header: self.disp_verify_mode, key: 'clockMode', width: 8 },
              { header: self.disp_verify_score, key: 'score', width: 8 },
              { header: self.disp_face_image, key: 'showimage', width: 15 },
            ];

            if (self.$deviceProfile.supportTemperature) {
              worksheet.columns.push({ header: self.disp_temperature, key: 'temperature', width: 10 });
            }
          }
        }

        if (workbook != null) {
          workbook.xlsx.writeBuffer().then((data) => {
            const rN = Math.floor(self.exportNo / 10000) + 1;

            let reportname = '';
            if (rN >= 2) {
              reportname = `investigation_Report_${dayjs(new Date()).format('YYYYMMDD')}_${rN}.xlsx`;
            } else {
              reportname = `investigation_Report_${dayjs(new Date()).format('YYYYMMDD')}.xlsx`;
            }

            const blob = new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            zip.file(reportname, blob);

            zip.generateAsync({ type: 'blob' }).then((content) => {
              FileSaver.saveAs(
                content,
                `investigation_Report_${dayjs(new Date()).format('YYYYMMDD')}.zip`,
              );
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
    border: 0px;
    text-overflow: ellipsis;
  }

  .mx-input-wrapper {
    border: 1px solid #d8dbe0;
    display: flex;
    align-items: center;
    position: static !important;
  }

  .mx-icon-calendar {
    position: static !important;
    margin: 1px 3px 1px 1px;
    transform: translateY(0%) !important;
  }

  .form-inline .form-control {
    width: 100% !important;
  }

  .investigation td,
  .investigation th {
    font-size: 15px !important;
  }
</style>