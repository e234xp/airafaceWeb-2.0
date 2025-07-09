<template>
  <div>
    <CRow>
      <CCol sm="12">
        <td class="h1">
          {{ disp_header }}
        </td>
      </CCol>
    </CRow>
    <div style="height: 35px" />
    <div>
      <CCol sm="12">
        <CRow>
          <div>
            <CButton class="btn btn-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnAdd()"
              :disabled="!canDelete()">
              {{ $t('Add') }}
            </CButton>
          </div>

          <div>
            <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnTemplate()"
              :disabled="!canDelete()">
              {{ $t('Template') }}
            </CButton>
          </div>

          <div>
            <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg"
              @click="flag_collapse = !flag_collapse" :disabled="!canDelete()">
              <!-- @click="clickOnImport()"> -->
              {{ $t('Import') }}
            </CButton>
          </div>

          <div>
            <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnExport(true)"
              :disabled="!canDelete() || value_selectedItems.length === 0">
              {{ $t('Export') }}
            </CButton>
          </div>

          <div v-if="formData.type === 'Visitor'">
            <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnSendNotification()"
              :disabled="!canSend">
              {{ $t('SendMail') }}
            </CButton>
          </div>

          <div>
            <CButton class="btn btn-danger btn-w-sm mr-3 mb-3" size="lg" @click="clickOnMultipleDelete()"
              :disabled="!canDelete()">
              {{ $t('Delete') }}
            </CButton>
          </div>
          <div class="d-flex" style="margin-left: auto">
            <CInput v-model.lazy="value_searchingFilter" style="width: 280px" size="lg" :placeholder="$t('Search')">
              <template #prepend-content>
                <CIcon name="cil-search" />
              </template>
            </CInput>
          </div>
        </CRow>
        <CRow>
          <CCol col="12" style="padding-right: 0px !important; padding-left: 0px !important">
            <CCollapse :show="flag_collapse">
              <CCard>
                <CCardBody>
                  <CRow>
                    <CCol col="2" class="label">
                      {{ $t('PersonInfoFile') }}
                    </CCol>
                    <CCol col="10">
                      <CInputFile :lazy="false" @change="personInfoListener" :disabled="isLocal()"
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="2" class="label">
                      {{ $t('UploadFile') }}
                    </CCol>
                    <CCol col="10">
                      <CInputFile :lazy="false" :multiple="true" @change="photoListener" :disabled="isLocal()" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="2" class="pt-2 label">
                      <CButton style="width: 150px; background-color: #20a8d8; color: white" size="lg"
                        :disabled="value_failRecords + value_successRecords >= value_totalRecords"
                        @click="clickOnImport()">
                        {{ $t('Import') }}
                      </CButton>
                    </CCol>

                    <CCol col="10" class="pt-2 label">
                      <div style="float: left; font-size: 20px; padding-top: inherit">
                        {{ $t('SuccessRecords') }} : {{ value_successRecords }} /
                        {{ $t('FailRecords') }} : {{ value_failRecords }} /
                        {{ $t('TotalRecords') }} : {{ value_totalRecords }}
                      </div>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="4" class="pt-2 label">
                      {{ $t('ImportFailure') }}
                    </CCol>
                    <CCol col="12" ref="importFailure" />
                  </CRow>
                </CCardBody>
              </CCard>
            </CCollapse>
          </CCol>
        </CRow>
      </CCol>
      <div style="height: 15px" />
    </div>
    <CCard>
      <CCardBody>
        <div>
          <div id="personManagementFrom">
            <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
              :header-cell-style="headerCellStyle" ref="mainTable" @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" :checkbox-config="{ reserve: true }"
              :edit-config="{ trigger: 'manual', mode: 'row' }">
              <vxe-table-column type="checkbox" width="4%" align="center" />
              <vxe-table-column :show-overflow="ellipsisMode" field="id" :title="$t('PersonId')" width="120px"
                style="font: 10px" />
              <vxe-table-column :show-overflow="ellipsisMode" field="nameToShow" :title="$t('PersonName')"
                width="14%" />
              <vxe-table-column :show-overflow="ellipsisMode" field="extra_info.department" :title="$t('Department')"
                width="14%" />
              <vxe-table-column :show-overflow="ellipsisMode" field="groupToShow" :title="$t('Group')" width="14%" />

              <!-- 註冊照片 -->
              <vxe-table-column width="170" field="imgRegisterPhoto" :title="$t('RegisterPhoto')" type="html" />
              <!-- <vxe-table-column :title="disp_registerPhoto" width="170">
                <template #default="{ row }">
                  <img :id="getRegisterImgId(row.uuid)" />
                </template>
              </vxe-table-column> -->

              <!-- 顯示照片 -->
              <vxe-table-column width="170" field="imgDisplayPhoto" :title="$t('DisplayPhoto')" type="html" />
              <!--  <vxe-table-column :title="disp_displayPhoto" width="170">
                <template #default="{ row }">
                  <img :id="getDisplayImgId(row.uuid)" />
                </template>
              </vxe-table-column> -->

              <!-- 顯示 QR code -->
              <vxe-table-column width="170" field="qrCodeDisplay" :title="'QR code'" type="html"
                v-if="formData.type === 'Visitor'" />

              <!-- 編輯和刪除按鈕 -->
              <!-- <vxe-table-column field="actionButton" title="" width="12%" type="html" /> -->
              <vxe-table-column min-width="13%">
                <template #default="{ row }">
                  <div class="d-flex flex-column align-items-center">
                    <vxe-button class="btn btn-in-cell-primary btn-in-cell" @click="clickOnModify(row)"
                      :class="[!canDelete() ? 'btn.disabled' : '']" :disabled="!canDelete()">
                      {{ $t('Modify') }}
                    </vxe-button>
                    <vxe-button class="btn btn-in-cell-danger btn-in-cell" @click="clickOnSingleDelete(row)"
                      :class="[!canDelete() ? 'btn.disabled' : '']" :disabled="!canDelete()">
                      {{ $t('Delete') }}
                    </vxe-button>
                  </div>
                </template>
              </vxe-table-column>
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
        </div>
      </CCardBody>
    </CCard>
    <canvas ref="qrcode" id="qrcode" style="display: none;" />
  </div>
</template>

<script>
  import QrCodeWithLogo from 'qr-code-with-logo';
  import { mapState } from 'vuex';
  import TableObserver from '@/utils/TableObserver.vue';

  import FileSaver from 'file-saver';
  import Excel from 'exceljs/dist/exceljs.min';
  import JsZip from 'jszip';
  import XLSX from 'xlsx';

  import * as LoadImage from 'blueimp-load-image';

  const dayjs = require('dayjs');

  export default {
    name: 'ManagementForm',
    props: {
      formData: Object,
      canDelete: { type: Function },
      onAdd: { type: Function },
      onDelete: { type: Function },
      onModify: { type: Function },
      onFetchDataCallback: { type: Function },
      onImport: { type: Function },
    },
    data() {
      return {
        obj_loading: null,
        flag_collapse: false,

        flag_downloadingExecl: false,
        excelExecutionAmounts: 0,
        excelCounter: 0,

        value_successRecords: 0,
        value_failRecords: 0,
        value_totalRecords: 0,

        value_excelFileImpport: [],
        value_fileImporting: false,
        value_personGroupList: [],

        value_emptyPhoto:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQA'
          + 'AAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
        value_dataItemsToShow: [],
        value_allTableItems: [],
        value_selectedItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        },
        value_searchingFilter: '',

        disp_header: 'none', // this.$t('CreatePerson'),

        flag_enableAiraManager: false,

        ...this.formData,
      };
    },
    computed: {
      ...mapState(['ellipsisMode']),
      canSend() {
        return this.value_personGroupList.length > 0;
      },
    },
    mixins: [TableObserver],
    created() { },
    async mounted() {
      const ret1 = await this.$globalGetAiraManagerSetting();
      if (!ret1.error) {
        const data = { ...ret1.data };
        this.flag_enableAiraManager = data.manager_enable;
      }

      const ret2 = await this.$globalGetGroupList();
      if (!ret2.error) {
        ret2.group_list.forEach((g) => {
          this.value_personGroupList.push(g.name);
        });
      }

      this.refreshTableItems();
    },

    updated() {
      this.value_dataItemsToShow.forEach((item) => {
        const modifyButtonId = `actionOnModify_${item.uuid}`;
        const deleteButtonId = `actionOnDelete_${item.uuid}`;

        let newDeleteButton = null;
        let newModifyButton = null;
        const oldDeleteButton = document.getElementById(deleteButtonId);
        const oldModifyButton = document.getElementById(modifyButtonId);
        if (oldDeleteButton && oldDeleteButton.parentNode) {
          newDeleteButton = oldDeleteButton.cloneNode(true);
          oldDeleteButton.parentNode.replaceChild(newDeleteButton, oldDeleteButton);
        }

        if (oldModifyButton && oldModifyButton.parentNode) {
          newModifyButton = oldModifyButton.cloneNode(true);
          oldModifyButton.parentNode.replaceChild(newModifyButton, oldModifyButton);
        }

        if (newDeleteButton) {
          newDeleteButton.addEventListener('click', () => {
            this.clickOnSingleDelete(item);
          });
        }
        if (newModifyButton) {
          newModifyButton.addEventListener('click', () => {
            this.clickOnModify(item);
          });
        }
      });
    },
    watch: {
      value_searchingFilter() {
        this.value_tablePage.currentPage = 1;
        this.generateFilteredData(this.value_allTableItems, this.value_searchingFilter);
      },
    },
    methods: {
      getRegisterImgId(uuid) {
        return `imgRegisterPhoto${uuid}`;
      },
      getDisplayImgId(uuid) {
        return `imgDisplayPhoto${uuid}`;
      },
      isLocal() {
        return false;
      },
      // headerCellStyle(row, column, rowIndex, columnIndex) {
      headerCellStyle() {
        return 'fontSize: 18px;word-break: break-all !important; ';
      },
      // cellStyle(row, column, rowIndex, columnIndex) {
      cellStyle() {
        // return 'fontSize:18px;background:pink;word-break: break-all !important;';
        // return 'fontSize:18px;background:pink;text-overflow: ellipsis !important; white-space:no-wrap !important; word-break:normal !important;';
        return 'fontSize:18px;';
      },
      formatBase64ToImgTag(eleId, desireWidth, desireHeight, base64ImageString) {
        if (base64ImageString.length > 0) {
          return `<img id=${eleId} width='${desireWidth}' height='${desireHeight}' src='data:image/jpeg;base64,${base64ImageString}'>`;
        }
        return `<img id=${eleId} width='${desireWidth}' height='${desireHeight}' src='${this.value_emptyPhoto}'>`;
      },
      async generateFilteredData(sourceData, filter) {
        const filteredItems = filter.length === 0
          ? sourceData
          : sourceData.filter((item) => (
            (item.id && item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            || (item.name && item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            || (item.extra_info.department && item.extra_info.department.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            || (item.group_list && item.group_list.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1)
          ));

        this.value_tablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize,
          this.value_tablePage.currentPage * this.value_tablePage.pageSize,
        );

        sliceList.forEach((item) => {
          const sliceItem = item;

          sliceItem.imgRegisterPhoto = this.formatBase64ToImgTag(
            `imgRegisterPhoto${sliceItem.uuid}`,
            100,
            100,
            '',
          );
          sliceItem.imgDisplayPhoto = this.formatBase64ToImgTag(
            `imgDisplayPhoto${sliceItem.uuid}`,
            100,
            100,
            '',
          );

          sliceItem.nameToShow = sliceItem.name;
          sliceItem.groupToShow = [];

          for (let i = 0; i < sliceItem.group_list.length; i += 1) {
            if (!((sliceItem.group_list[i] === 'All Person') || (sliceItem.group_list[i] === 'All Visitor'))) {
              sliceItem.groupToShow.push(sliceItem.group_list[i]);
            }
          }

          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (sliceItem.begin_date > 0 && sliceItem.begin_date > startOfToday.getTime()) {
            sliceItem.nameToShow += `\n${this.$t('EffectivOn')} : ${dayjs(sliceItem.begin_date).format('YYYY-MM-DD')}`;
          }
          if (sliceItem.expire_date > 0 && sliceItem.expire_date - 1 < startOfToday.getTime()) {
            sliceItem.nameToShow += `\n${this.$t('ExpireOn')} : ${dayjs(sliceItem.expire_date).format('YYYY-MM-DD')}`;
          }
        });

        this.value_dataItemsToShow = Object.assign([], sliceList);
        for (let ii = 0; ii < this.value_dataItemsToShow.length; ii += 1) {
          const item = this.value_dataItemsToShow[ii];
          const photoRet = await this.$globalFetchPhoto(item.uuid);

          const oldRegisterPhotoImg = document.getElementById(`imgRegisterPhoto${item.uuid}`);
          if (oldRegisterPhotoImg && oldRegisterPhotoImg.parentNode) {
            const imgRegister = document.createElement('img');
            imgRegister.width = 100;
            imgRegister.height = 100;
            imgRegister.src = photoRet.data
              && photoRet.data.register_image.length > 0
              ? `data:image/jpeg;base64,${photoRet.data.register_image}`
              : this.value_emptyPhoto;
            oldRegisterPhotoImg.parentNode.replaceChild(imgRegister, oldRegisterPhotoImg);

            const imgDisplay = document.createElement('img');
            imgDisplay.width = 100;
            imgDisplay.height = 100;
            imgDisplay.src = photoRet.data
              && photoRet.data.display_image.length > 0
              ? `data:image/jpeg;base64,${photoRet.data.display_image}`
              : this.value_emptyPhoto;
            const oldDisplayPhotoImg = document.getElementById(`imgDisplayPhoto${item.uuid}`);
            oldDisplayPhotoImg.parentNode.replaceChild(imgDisplay, oldDisplayPhotoImg);
          }

          const qrCanvas = this.$refs.qrcode;
          const num = { uuid: item.uuid };
          const jstr = JSON.stringify(num);

          await QrCodeWithLogo.toCanvas({
            canvas: qrCanvas,
            content: jstr,
            width: 220,
            height: 220,
            logo: {
              src: '/img/logo/airaLogo.png',
              radius: 1,
            },
          });
          const qrCode = await qrCanvas.toDataURL();
          this.value_dataItemsToShow[ii].qrCodeDisplay = `<img src='${qrCode}' width='100' height='100'>`;
          this.value_dataItemsToShow[ii].qrCode = qrCode.replace('data:image/png;base64,', '');
        }
      },
      refreshTableItems(cb) {
        if (this.onFetchDataCallback) {
          this.onFetchDataCallback((error, reset, more, tableItems) => {
            if (!error) {
              if (reset) {
                this.value_allTableItems = [];
                this.value_dataItemsToShow = [];
              }
              if (tableItems) {
                this.value_allTableItems = this.value_allTableItems.concat(tableItems);
                this.generateFilteredData(
                  this.value_allTableItems,
                  this.value_searchingFilter,
                );
                this.observeTableSize();
              }
              if (!more && cb) cb();
            } else if (cb) cb();
          });
        } else if (cb) cb();
      },
      handlePageChange({ currentPage, pageSize }) {
        this.value_tablePage.currentPage = currentPage;
        this.value_tablePage.pageSize = pageSize;
        this.generateFilteredData(this.value_allTableItems, this.value_searchingFilter);
        this.resizeOneTable();
      },
      // selectAllEvent({ checked, records }) {
      selectAllEvent() {
        this.value_selectedItems = [
          ...this.$refs.mainTable.getCheckboxReserveRecords(),
          ...this.$refs.mainTable.getCheckboxRecords(),
        ];
        // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
      },
      // selectChangeEvent({ checked, records }) {
      selectChangeEvent() {
        this.value_selectedItems = [
          ...this.$refs.mainTable.getCheckboxReserveRecords(),
          ...this.$refs.mainTable.getCheckboxRecords(),
        ];
        // console.log(checked ? '勾选事件' : '取消事件', records)
      },
      getSelectEvent() {
        // let selectRecords = this.$refs.mainTable.getCheckboxRecords();
        // console.log(selectRecords);
      },
      async clickOnTemplate() {
        const zip = new JsZip();
        const snapshotFolder = zip.folder('snapshot');

        const workbook = new Excel.Workbook();
        let worksheet = null;

        worksheet = workbook.addWorksheet('Persons');
        worksheet.columns = [
          { header: 'No', key: 'No', width: 10 },
          { header: 'Id', key: 'id', width: 10 },
          { header: 'Fullname', key: 'name', width: 10 },
          { header: 'Department', key: 'department', width: 10 },
          { header: 'Group', key: 'group', width: 10 },
          { header: 'Title', key: 'title', width: 10 },
          { header: 'Card Number', key: 'cardnumber', width: 10 },
          { header: 'Email', key: 'email', width: 10 },
          { header: 'Extension Number', key: 'extension_number', width: 10 },
          { header: 'Phone Number', key: 'phone_number', width: 10 },
          { header: 'Begin Date', key: 'begin_date', width: 10 },
          { header: 'Expire Date', key: 'expire_date', width: 10 },
          { header: 'Remarks', key: 'remarks', width: 10 },
        ];

        worksheet.addRow({
          No: 1,
          id: 'A-0001',
          name: 'John',
          department: 'Department-2',
          group: 'Group-1|Group-2',
          title: 'Job Title',
          cardnumber: '84325746',
          email: 'john@abc.com.tw',
          extension_number: '2585',
          phone_number: '0912345678',
          begin_date: '2020-12-12',
          expire_date: '',
          remarks: '',
        });

        snapshotFolder.file(
          'A-0001.jpeg',
          'iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABKVBMVEX///8nquEmIjT/0rRQTVwnqeEmITPpwKf+0rMkIDImrOQoIzX/07ImIz'
          + 'b80bT/1LElHC3/2Ljg8vrq9/z/27r3y68UquQnseslGCgmhrPS7fhPvu/3/P6/5PUbGS7swKU1kLxGRliq3PKh1/E6t+wnotclSGPI5/a33v'
          + 'N3x+xmxfCEz++Qz+0mlsglFCMmeKEmK0AlNk0mY4dZuuQzLDkWFi4mWXklRV8mfagRESoABifYsp1SREq2loZvXFwlDh1ptNXJyL6ZgXjpzr'
          + 'jZy7tDrd2Euc+etMGwwMe1trdBOUaEc3TEqJhdVmKDh5LIzNHe4eVzdH7Gxsuoi3//6cV0YWFMQUoAAB1fT1ONdm+ixtSPmaO1xcKRvcqrw8'
          + 'XhzrhposCnr7hgY3CRoh8gAAASn0lEQVR4nO2deV/aTNfHC5iQhYSgkCBgKhVc2WRRgVr3tlLqUq/2cmnrre//RTwzk0QWA8xJAng9H379o5'
          + 'YCydczc+bMmcmZd+9mmmmmmWaaaaaZZppppplmmmkmj5RamE8k1taWltYNLS2trSUS8wupad+YB0rNJ5Y+rOQ2NpPJTEZA8qk+/Fcmk0xubu'
          + 'RWPiwl5v+7nKnEem6jksxoAqMKpnw+xuez/sEwgpZJVjZy64n/IOX8BwLnYzDVECFOn5bJVLY+zE/7liFK5Co+TcPmYobiWULv0jShkktM+8'
          + 'aplEpsZVRtuOHsEJE5NTWztfbG2+vC/EoSjNclBJlcmV+YNsZAza9vIPM5xjOsiQy5sf42+2RiZVNQnZvPIiSudnPl7XXJtVxSGOE2ARKEZG'
          + '5t2kg9SmwkvcMzDZnZejt2XNjKuOx9ttIyW2/D56S2BI1u2IMzqlvTHzxS6xkXo8MooahufbqMqbUN9+5zoBjcH9WNaQYB8ysZlTYycywhk5'
          + 'va8Li06aUDHYyoVdanwpfayozZeoZw/J6ZhsdJVMYxQgySVpn44PgB98AJCTcVNfNhonwLW5M0IJGgTXL8T2yOcYwYiKhuTqylLiUn10JfhJ'
          + 'qqmlyaDOB6ZvIGNCRkJjFspFamBsggxJWxDxup3BjD0NEStNyYERe2ptAFe6SO16UubFAD4hm/9zEP9jcbY0Q0AKnuO7u8mM9ncUK4u1EzaL'
          + '7AuAUfIyK9BRmteMCWtld3iov5LGNak2TyNfTHSO+TydHbQkzR90FGKx+wihKPx6Xt1fJiXtCQf8rmkZaXl/FfWR95yREk4xvT1D+VgzjR7G'
          + '5c8vv9LOJUSrvlvWJ5Z3V329Lu6k4ZmRfn8h0gouYwFo+6olG7DtzdlhXFbwhTSpgUicUyfuRL2LwI0okhtRXvASkjGZII1LCKcdZvqfNT14'
          + '8sr8T57XIezsiMI7pZytBZUNBQf1ssllGjlHoIuyA7qJJfOTjYXXSQKhAyHseoCcpgW9jb2S3FC4XCwUHhFdNrobdIbCG+usjAGHFLSXo601'
          + 'jYpATMswdxhcc3LkmjAQ1JbFwq58FmVDe9HDNoxwkhu1qgJusYUlLiu3s+Adgb1S3vAD9QO3Uhu1PgJYr22S9FKsMQ8SYAzxIbiQx9oCX4in'
          + 'FlNJCNJeM7WdDqAHpvxqOumKqA0r7CHq+89pyjCf3x1Sww+6NWvBn4t4ALL9qik2bqZ6XCLtTfaJ50xaUMbDaAuqLihBAhIitCEHE79WDgn6'
          + '9Ag6oyGgkdIaK+WM7CrsVsul7TSOVgfYMRigrvCA+LV4rAMUNznbhZg+WdGC1fUhx1QyJJkZY1QJ/AAarL9f7UBjCcEnbjDpsoFnKo27DfKJ'
          + 'oOuzPiOjDxhOb2LgAx4kEZOmS4cjYpYG5UyEvOO6EpKQ9DFDJujAhdgNF24s47oWFEKb4DbKduBsUF4AIMcjOuTehnS4tAI6rOJxlbEL+Gr1'
          + 'V2Eq/1AfqVHRCgm8gGRdywaCa/7Sjo7pOyDQ3eHEfgG8BeKBRZtxbEYpUi7Lo+bcMZ4FoGCIgCUg8A0bAPC0+RHA77OeDCg7BcchZy94llpU'
          + 'UgoZpzAphIQlMnVv6Q9duk1iCKl4FrG87SUitQwOxqXDIJeVeDhhTfzQInNIKDDPH8JjDKF1DMbTYz/qPYjWiXLR0qFH8Df72Cg1nUOnT5T9'
          + 'izktw8375p8GLnjkeZtJ+fjRehAb8Ajk4XgJMKdJFywbg/Ub89idzUdNG6cb4q6eJgIJbleVbseQlFbtDUInjFbR66H4Fh0LzJUP1YliPtal'
          + '20iKvtWl3szvGLPQMnK1brdV4UO+zKNrgjZqDNdAW8Xp+1uiEvNrlAIBK8bfDmLTeawVaD7QDytR4zsvzx/m29UUOQVjtXwDlwFehrUknoti'
          + '5hudNIg3IAIcrHVZ2YRWzc/RP7yeuWifTWT1Znu4j1jyf/BI8/VnWdN18u7EF3VmtJ2CQqATUhoxVNQn/tTkY2RIjR9iddZ1EjrP2KRCI3v3'
          + 'TT+/DVZvsjr7/4IpatHcuRaKB587Nq+qRCGUrIqLAhEbwzj9HK5ooFL+5HAoaisZuPNZ0VeT0YkSPNO7FGqMTaMTYZsphoQuq/UMPmItHYT5'
          + '38WyqsgnfHA2cY4H1PjGatyfC/mhZhIBJpHiNGsX4clQORWPu2Rhj121iUayL6Gu8XiRHrd7hhB7g73WilwHQNlpABNlLor1DYNl2p/in4Qo'
          + 'h7Iyb59ziK7z8S3L+tIa/pr7Yj6H+C+5/EOoYURV5s4w9FbvykI0qKBF/6BjXTHHDqi+eRpitldbMbWuIQyXHMeEnmEFWtodfuMA8XijVvbv'
          + 'lGo6b767f4lWjb7Ih8HDq9YHwaJPyuwNsIYyaCkeuPBHrFRQjPS8O9k+o3EZM4iuz685fe+PcTsWHzl/kthTx0zPcJFXrAeQfr6tkCb/jF6n'
          + '60DxCRdP8bec3Yyy9BDnDRf6KBYJO8BQ2ihqthDxYdPIhDP+h/gO9xFvIFs3212n2E/RYNyKEeK8sydqNmM/5kOtODPbA39wFWTKHpC5LNN3'
          + 'cm8B+D/a0UoMg3I4KVDorw3zJ9MiNVAeKh4VZbNAlRRMONJhlIeNwhhO/xo14wTSRhgIzqO7x/qFuDheyCMHpjTEnE+vX9oQ82ZjH0Obd1UA'
          + 'oKAR4enUTbDTMq/emikQai+0YsJzaO/zk5OlRhu6Wo10tBS4aMT/0sh+Ro05g8iPqdV4Ry6OQQZkXaETG1AQM8RIDIzzd494RytG1EqmLjJi'
          + 'rL4ZMKDJFypQ24rs0chdFYxsVqJuGrAR9kw3bVnFLuo0hWDv+GzHEYX4VuRISlEdVKCN8ax1WJF0SEw4fDEYRNg5BtNEkkK58BEBnapOISaG'
          + 'Kh/gmTcCR6W/eGkDQFvkYiWTn8GURIuWERFtGovwmhHL3zkFDUW2TIkcN/IYQ+ygfcQKlgRj0NGYT7DTyfdetL2yLRv5+iBuERKNlAlxhO5U'
          + 'DDrHoSMuLqYKuh63q90R94g8TFPv5br9cbdTJdRBHsqQq4G4ah2v8NeGrEIDRDGC74rSVWb9tuTIh9y83P20/HVmwbeoQQUmZN5zdhrdSyIZ'
          + 'oVRdBUyI0FiaJYJiDQhpTJfdhgYfVDcj+vpoJOhCZTL18C7IeMQPUQJnBVTT0Ku4YaTAsb8ilX2YD7vNT7sRL+gRFSLQZDCQ/DYwMMBMKHYy'
          + 'Bcgj798Dg2I8rhU+BCu0AT1MAI8eQpzLmY8w4Rx+GgDYZIQ7gOfbiD+RvmsBW9xCRBKRf+C01kUC2Uwgl99ydyCNnRO0T0XVxIPrmHZ96pCI'
          + 'FfivNQlfuj00fveiMXkB9Pf9xXVHAuimorJpQQQ6qq7+ywM/S7lRw6qpz5VFA4Y97ImAh9JB/11zOfKofugTkoS3SEDp+3Z/54NzCGIBPfbo'
          + '3D03T0OeSVq+Fk2EAPJASP+KbUw5OQR4ChR/BDHibgGEb8jpizI49cDXI0Zw4JqRI1wLj0BZDxffXIhoHQvcOyBGOJvLv02c2KRUcyd+K4G1'
          + 'IRwnddGmKYs1NvjOi4kVLODxGhs+9nmK/eOFPui9OCEkKSJosBy9N0C3lTL2YZ3KPTRkqZp4Hl2rqEfvE/OPfeVOa+OuRDt0CVa4PlS3vkhR'
          + 'E5Di84OSWkq5cB3v7cuYD6NeTSn3Jy+KvzMkaUGxQd7MR4ucKZ27hGDj1Clpv6RLluAVt76kP87C785mCrTX2iXXtyOiD6yBzqKOymneIEqe'
          + 'PaQ9QPJcCfbe5mPDtxMU2Uw49OB3tycco1YNA6fv818LK+Y3/KhWTg3oS+i9M+MQt8fLsf8Q/nEJHjZGj2sFfUuxNh+2n6EdEcw1naDX3q3n'
          + 'kBMHxp6v00kEofdhc6++0EEX3mrytAwHOIeF+b8yuhdnr2OwRG5AKhv268DBZ9IRC3FWaRFaHDohwI/3VbjA/woKWLqIYAosb2OwwzIs7gu6'
          + '03CNhfOu+yqCNOg/8FrNdwXCj8B57gfiXAg0Hwfd79iGQ/H2VnRF3w5LP74u6Qfd4O9uq/QmTUw1M6l4redYr3Wbq1IGivPvihIBtGRq385k'
          + 'Ijmyonh+TfZy6CUet6sOct4M/M2F7Sd38SHrE5Q+bCJ3+Am4HtBXtmxvV4YSDi3cOh4RPGUAjvBPaiWi3wuacEfGXLRqhvnX1+HIYYOv3sQQ'
          + 'sl1wI+uwZ//tD+sujCZ+eBQYxc4PzMGwPCnz908AypvVBv/PL+fczGqXKB2Pv3X7zogUTQZ0jhzwEP1pf3wWAwFpO7KLmAHIuhV99/8eoi8O'
          + 'eAHWdNX4sQEsUsWS94SAivnux4ofSVOoSv5Bmhg+fxXST3+6QOJfSopTipqeAiMdynr1xsAGDMRQK/V07qYrhJKvYKr0jFXkPGYmg49IjQYc'
          + 'ldUP3ugcKZ/i7vaTROy7OGvnoRWTA+wVF9mndrSUcTGublrFhDqrX4zXUGfmvXBiLsfbOTRA36hNOqyfAHLfE9ZvP55UWiZUPng6cX3Ln5Hv'
          + 'MDpBw9/FAFx8W+EoCsIkPOxc0uF3dWt0sSrqgfj7fmsNL7A2dQHLefJu9pkfcrEjlsYDlLztAFUDqvtguYYTCCll0sr5YQm6KwPPrD8i+Eg2'
          + '1oEeK3oz/4sAGltFpezGqApXYXRfeoa+4xjJYtIjwFl8KS/GZxBYANjaekySfJWQOrxSx1LXpBcFHYm9KIjCbs7fIKy/bU8rYIbwbPgbmbHk'
          + 'JTEssq/O4e7cGRrooJ09W+ZLT8qk2Ja4vwW2wgYeybHSGREl/NUyG6q32J65eOvIrgKyoFm2JXfJXc/dz35sBW2jTeMVd9RYi+La4Uacrtu6'
          + 'tf+i61MRJRyO8U7Arrsrw4ZxnRHpGzTDgn8jafl5TCzuhSQ25r0I7eA6bldwfVfjab6Vz6+CSCGbvnh7haxsmxCWjTSIkZ2cLuqHKtrusIv0'
          + 'utDE+dasvb8UFnBVjNFFmxHYtEug3JRSKxtmVBm0ZqSopvLw9HdF8LGs2iRgAOKVlqGXEu/f3bflCORCMcUgQ/5Bbc//bdArQ3oWFGZXtovV'
          + 'YP6nnjrRmDv1/Lbw+rbW31RMw49/3bTbsZjMmxYLN98+37XPrl/8TBBesw4jCX6s1JJYMHRSG7OqzoLNtppwQyjTCxyE8dVfmh3zGw1ifjVV'
          + '1942wEW2V3CkNrsvYh2msoIC54U9gZVIreq7MRUARuH+0LxVH1SjFieihfegSgn9SkHeDPvTrfgpxR8pqQ6RS7HIootoYAtsSRgCi8KdmUVP'
          + 'L0jBLbc2bQFXYozpRBiGy1ZW/HdKvKUgD6pcKOYBOGe3nOjO1ZQdpifPTNkXGbR3ZMv4JMI/vxdOdEsHGbIcPbs4Ls0lLaS63L0XfI836x2n'
          + 'oxZbrVqop+3iZUG6D47itCj897stmwqC0f0N4fKUKLKEntOSwER0pA0lemPegPbTw/s+v1uWu4iiCgdq5ZQ5nHYrteofswrqPY7QLGc6psz9'
          + 'l5jIMS+uyAn2nEl7pCcGY8Z+e9e5fr2i7BaEUFfDiXC0lKsTt2c1a/e6R6zrBkhsZrXgvHbt1udFyHyXdW3NBovz05PsK4bY76jAeTXgpERt'
          + 'uTPDklgBqQlUjdXXKQ/PiPy/WRkywmbEOlbPrysQKafZExpk2TFZlEMWM/09k8l5sRFkuTNSE5nAV1xPGfy42Ez1bH86YJt1IyhxIyYxkH+7'
          + 'WeUT06qwMkZSerjiOSsdNSEh8oI46+KQ8l4oRN0vNYdJAS/6uxEitOjlFEoSlb/5/Hs4lhWrggdbknhYgvxdcuriYHiPRU0qXJIfpFvfQ0UT'
          + '6kq2dSMn8SdLhI+PPlpAHRyHjR0v3jNyP6fklvXYx/FLTT+bPEi+MeFlmRl54n3kItXT0gM47X44ii3nqYrIvpUeryGp8s4h/PZJhFfHzt+n'
          + 'I6LfSF8alUxyOj92ZE3ymy9dLTdPkI40V9PIMjsl99Sh6mX1cXLZ4UqfaqsUqEj29dT7ED9unyIk2OVPHGjngA5PX0xRSGwCG6vJjTdU9CVR'
          + 'F1P16fe2N8WJcPz1KNd82I3KcuPT+8PT6sq/PrUp1nRdGR3xFN89VL1+dvp//1K3X1kCZn40giLAcg4bFP9PO1Rvrh6m34z4FKXV6UGjXsd0'
          + 'Q/nSkN46HGWWuULqY8vNPq8mGuJOEjxoh7HUZJ/h/T6VLpLTqXIbp6unhOVw1M1lxV60GzXsFw1fTz9dPb7XsDlbp8erh+nmtJNdRo+5dD8T'
          + 'qbXqtJrbnn64en/0jbtFPq6vL86eECgaZbqOHWavV6HQFLeGn/+fri4en88q07Fiqlrq6uLi9//Di39OPH5SV67f8D20wzzTTTTDPNNNNMM8'
          + '0000wzvRH9H9yDcYDu4lTGAAAAAElFTkSuQmCC',
          { base64: true },
        );
        snapshotFolder.file(
          'A-0001_d.jpeg',
          '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',
          { base64: true },
        );

        worksheet.addRow({
          No: 2,
          id: 'A-0002',
          name: 'Merry',
          department: 'Department-1',
          group: 'Group-2',
          title: 'Job Title',
          cardnumber: '84325746',
          email: 'merry@abc.com.tw',
          extension_number: '1234',
          phone_number: '',
          begin_date: '',
          expire_date: '2020-12-12',
          remarks: '',
        });
        snapshotFolder.file(
          'A-0002.jpeg',
          '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',
          { base64: true },
        );

        await workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          zip.file('PersonsTemplate.xlsx', blob);
        });

        zip.generateAsync({ type: 'blob' }).then((content) => {
          FileSaver.saveAs(content, 'PersonsList.zip');
        });
      },

      clickOnAdd() {
        if (this.onAdd) this.onAdd(this.value_allTableItems);
      },

      personInfoListener(pEvent) {
        const localEvent = pEvent || [];
        const me = this;

        if (localEvent.length >= 1) {
          [this.xlsxFile] = localEvent;
        }

        if (this.xlsxFile == null) return;
        if (this.xlsxFile.size > 1024000 * 5) {
          alert(this.$t('MaxFileSize'));
          return;
        }

        me.data = [];

        const myReader = new FileReader();
        myReader.onload = async () => {
          const data = new Uint8Array(myReader.result);
          const arr = [];
          for (let i = 0; i !== data.length; i += 1) arr[i] = String.fromCharCode(data[i]);

          const workbook = XLSX.read(arr.join(''), {
            type: 'binary',
            cellDates: true,
            cellStyles: true,
          });
          me.value_excelFileImpport = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]],
          );

          me.value_totalRecords = me.value_excelFileImpport.length;
          me.value_successRecords = 0;
          me.value_failRecords = 0;
        };
        myReader.readAsArrayBuffer(this.xlsxFile);
      },

      photoListener(event) {
        const me = this;

        for (let i = 0; i < event.length; i += 1) {
          const e = event[i];

          if (e.size < 1024000 * 10) {
            const fn = e.name.split('.')[0];
            const isDisp = fn.toLowerCase().indexOf('_d');
            const id = fn.replace('_d', '').replace('_D', '');
            const item = me.value_excelFileImpport.find((x) => (`${x.Id}`) === (`${id}`));
            if (item) {
              if (isDisp >= 0) item.dispfile = e;
              else item.regfile = e;
            }
          } else console.log('====== photoListener =====> file size is too large', e.size);
        }
      },

      async generateEXIFrontImage(file) {
        let imgBase64 = '';
        let imgFile = null;
        const options = { canvas: true };

        imgFile = this.checkBase64(file);

        return new Promise((resolve) => {
          LoadImage.parseMetaData(imgFile, (data) => {
            if (data.exif) {
              options.orientation = 1;
            }
            LoadImage(
              imgFile,
              (canvas) => {
                if (canvas.type === 'error') return resolve(file);
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');

                tempCanvas.width = 240;
                tempCanvas.height = 240;

                tempCtx.drawImage(canvas, 0, 0, 240, 240);
                imgBase64 = tempCanvas.toDataURL(imgFile.type);
                return resolve(imgBase64);
              },
              options,
            );
          });
        });
      },

      checkBase64(file) {
        if (typeof file === 'string') {
          const type = file.split(':')[1].split(';')[0];
          return this.base64ToBlob(file, type);
        }
        return file;
      },

      base64ToBlob(base64) {
        const bin = atob(base64.replace(/^.*,/, ''));
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) {
          buffer[i] = bin.charCodeAt(i);
        }
        return new Blob([buffer.buffer], {
          type: 'image/*',
        });
      },

      async clickOnImport() {
        const me = this;

        me.value_fileImporting = true;
        me.onImport(me.value_fileImporting);

        async function batchEnroll(pItem, resolve) {
          const localItem = pItem;

          if (localItem == null) resolve(true);

          const proformEnroll = () => {
            const beginDate = localItem['Begin Date'] && localItem['Begin Date'].length > 0
              ? new Date(localItem['Begin Date'].replaceAll('-', '/')).getTime()
              : 0;
            const expireDate = localItem['Expire Date'] && localItem['Expire Date'].length > 0
              ? new Date(localItem['Expire Date'].replaceAll('-', '/')).getTime()
              : 0;

            localItem.Id = localItem.Id.toString();

            const idx = me.value_allTableItems.findIndex((x) => x.id === localItem.Id);
            const data = {
              id: localItem.Id || '',
              name: localItem.Fullname || '',
              card_facility_code: '',
              card_number: `${localItem['Card Number'] || ''}`,
              begin_date: beginDate || 0,
              expire_date: expireDate || 0,
              group_list: localItem.Group ? localItem.Group.split('|') : [],
              as_admin: false,
              display_image: localItem.dispImage ? localItem.dispImage : '',
              register_image: localItem.photoImage ? localItem.photoImage : '',
              extra_info: {
                title: `${localItem.Title || ''}`,
                department: `${localItem.Department || ''}`,
                email: `${localItem.Email || ''}`,
                phone_number: `${localItem['Phone Number'] || ''}`,
                extension_number: `${localItem['Extension Number'] || ''}`,
                remarks: `${localItem.Remarks || ''}`,
              },
            };

            if (me.formData.type === 'Person') {
              if (idx < 0) {
                me.$globalCreatePerson(data, async (error, result) => {
                  if (error === null) {
                    me.value_successRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;

                    if (localItem.Group) {
                      const groups = localItem.Group.split('|') || [];
                      for (let i = 0; i < groups.length; i += 1) {
                        const g = groups[i];

                        if (me.value_personGroupList.indexOf(g) < 0) {
                          const data1 = {
                            name: g,
                            person_uuid_list: [result.uuid],
                            remarks: '',
                            visitor_uuid_list: [],
                          };

                          await me.$globalCreateGroup(data1);

                          me.value_personGroupList.push(g);
                        }
                      }
                    }
                  } else {
                    me.$refs.importFailure.innerHTML
                      += (me.$refs.importFailure.innerHTML === '' ? '' : ', ') + localItem.Id;

                    me.value_failRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  }

                  resolve(true);
                });
              } else {
                const person = me.value_allTableItems[idx];
                const dataForModify = {
                  uuid: person.uuid,
                  data: {
                    id: data.id === '' ? person.id : data.id,
                    name: data.name === '' ? person.name : data.name,
                    card_number: data.card_number === '' ? person.card_number : data.card_number,
                    begin_date: beginDate === 0 ? person.begin_date : beginDate,
                    expire_date: expireDate === 0 ? person.expire_date : expireDate,
                    group_list: data.group_list.length === 0 ? person.group_list : data.group_list,
                    card_facility_code: '',
                    display_image: data.display_image !== '' ? data.display_image : undefined,
                    register_image: data.register_image !== '' ? data.register_image : undefined,
                    as_admin: !data.as_admin ? person.as_admin : data.as_admin,
                    extra_info: {
                      title: data.extra_info.title === '' ? person.extra_info.title : data.extra_info.title,
                      department: data.extra_info.department === '' ? person.extra_info.department : data.extra_info.department,
                      email: data.extra_info.email === '' ? person.extra_info.email : data.extra_info.email,
                      phone_number: data.extra_info.phone_number === '' ? person.extra_info.phone_number : data.extra_info.phone_number,
                      extension_number: data.extra_info.extension_number === '' ? person.extra_info.extension_number : data.extra_info.extension_number,
                      remarks: data.extra_info.remarks === '' ? person.extra_info.remarks : data.extra_info.remarks,
                    },
                  },
                };
                me.$globalModifyPerson(dataForModify, async (error) => {
                  if (error === null) {
                    me.value_successRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;

                    if (localItem.Group) {
                      const groups = localItem.Group.split('|') || [];
                      for (let i = 0; i < groups.length; i += 1) {
                        const g = groups[i];

                        if (me.value_personGroupList.indexOf(g) < 0) {
                          const data1 = {
                            name: g,
                            person_uuid_list: [person.uuid],
                            remarks: '',
                            visitor_uuid_list: [],
                          };

                          await me.$globalCreateGroup(data1);

                          me.value_personGroupList.push(g);
                        }
                      }
                    }
                  } else {
                    me.$refs.importFailure.innerHTML
                      += (me.$refs.importFailure.innerHTML === '' ? '' : ', ') + localItem.Id;

                    me.value_failRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  }

                  resolve(true);
                });
              }
            } else if (me.formData.type === 'Visitor') {
              if (idx < 0) {
                me.$globalCreateVisitor(data, (error) => {
                  if (error === null) {
                    me.value_successRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  } else {
                    me.$refs.importFailure.innerHTML
                      += (me.$refs.importFailure.innerHTML === '' ? '' : ', ') + localItem.Id;

                    me.value_failRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  }

                  resolve(true);
                });
              } else {
                const person = me.value_allTableItems[idx];
                const dataForModify = {
                  uuid: person.uuid,
                  data: {
                    id: data.id === '' ? person.id : data.id,
                    name: data.name === '' ? person.name : data.name,
                    card_number: data.card_number === '' ? person.card_number : data.card_number,
                    begin_date: beginDate === 0 ? person.begin_date : beginDate,
                    expire_date: expireDate === 0 ? person.expire_date : expireDate,
                    group_list: data.group_list.length === 0 ? person.group_list : data.group_list,
                    card_facility_code: '',
                    display_image: data.display_image !== '' ? data.display_image : undefined,
                    register_image: data.register_image !== '' ? data.register_image : undefined,
                    as_admin: !data.as_admin ? person.as_admin : data.as_admin,
                    extra_info: {
                      title: data.extra_info.title === '' ? person.extra_info.title : data.extra_info.title,
                      department: data.extra_info.department === '' ? person.extra_info.department : data.extra_info.department,
                      email: data.extra_info.email === '' ? person.extra_info.email : data.extra_info.email,
                      phone_number: data.extra_info.phone_number === '' ? person.extra_info.phone_number : data.extra_info.phone_number,
                      extension_number: data.extra_info.extension_number === '' ? person.extra_info.extension_number : data.extra_info.extension_number,
                      remarks: data.extra_info.remarks === '' ? person.extra_info.remarks : data.extra_info.remarks,
                    },
                  },
                };
                me.$globalModifyVisitor(dataForModify, (error) => {
                  if (error === null) {
                    me.value_successRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  } else {
                    me.$refs.importFailure.innerHTML
                      += (me.$refs.importFailure.innerHTML === '' ? '' : ', ') + localItem.Id;

                    me.value_failRecords += 1;
                    delete localItem.photoImage;
                    delete localItem.dispImage;
                  }

                  resolve(true);
                });
              }
            }
          };

          const readerReg = new FileReader();
          readerReg.onloadend = async () => {
            const result = await me.generateEXIFrontImage(readerReg.result);

            const pos = result.indexOf(';base64,');
            if (pos >= 0) {
              localItem.photoImage = result.substring(pos + 8);
            } else console.log('====== onloadend =====> result.indexOf(base64)', pos);

            proformEnroll();
          };

          const readerDisp = new FileReader();
          readerDisp.onloadend = async () => {
            let result = await me.generateEXIFrontImage(readerDisp.result);

            const img = new Image();
            img.src = result;

            const maxWidth = 500;
            const maxHeight = 500;

            result = await new Promise((resolve1) => {
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.x = 0;
                canvas.y = 0;
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                const ctx = canvas.getContext('2d');

                let rW = (img.width * 100) / maxWidth;
                let rH = (img.height * 100) / maxHeight;

                const r = Math.max(rW, rH) / 100;

                rW = Math.floor(img.width / r);
                rH = Math.floor(img.height / r);
                const sx = Math.floor((maxWidth - rW) / 2);
                const sy = Math.floor((maxHeight - rH) / 2);
                ctx.drawImage(img, sx, sy, rW, rH);

                resolve1(canvas.toDataURL('image/jpeg', 1.0));
              };
            });

            const pos = result.indexOf(';base64,');
            if (pos >= 0) {
              localItem.dispImage = result.substring(pos + 8);
            }

            if (localItem.regfile !== undefined) {
              readerReg.readAsDataURL(localItem.regfile);
            } else {
              proformEnroll();
            }
          };

          if (localItem.dispfile !== undefined) {
            readerDisp.readAsDataURL(localItem.dispfile);
          } else if (localItem.regfile !== undefined) {
            readerReg.readAsDataURL(localItem.regfile);
          } else {
            proformEnroll();
          }
        }

        let lastitem = 1;
        const doJobWithThrottle = async (items, throttle = 1) => new Promise((resolve) => {
          const takeOne = () => {
            const item = items.shift();

            if (!item) {
              lastitem -= 1;

              if (lastitem <= 0) resolve(true);
              return;
            }

            new Promise((resolve1) => {
              batchEnroll(item, resolve1);
            }).then(() => {
              me.importNo += 1;
              takeOne();
            });
          };

          for (let i = 0; i < throttle; i += 1) takeOne();
        });

        await doJobWithThrottle(this.value_excelFileImpport);

        me.value_fileImporting = false;

        me.onImport(me.value_fileImporting);

        me.refreshTableItems();
      },
      async clickOnExport(withPhoto) {
        const salf = this;
        salf.obj_loading = salf.$loading.show({ container: salf.$refs.formContainer });

        salf.flag_downloadingExecl = true;
        let snapshotFolder = null;
        let qrcodeFolder = null;

        const zip = new JsZip();

        if (withPhoto) snapshotFolder = zip.folder('snapshot');
        if (this.formData.type === 'Visitor') qrcodeFolder = zip.folder('qrcode');

        const workbook = new Excel.Workbook();
        let worksheet = null;
        salf.exportNo = 0;

        worksheet = workbook.addWorksheet('Persons');

        if (salf.value_selectedItems != null) {
          worksheet.columns = [
            { header: 'No', key: 'No', width: 10 },
            { header: 'Id', key: 'id', width: 10 },
            { header: 'Fullname', key: 'name', width: 10 },
            { header: 'Department', key: 'department', width: 10 },
            { header: 'Group', key: 'group', width: 10 },
            { header: 'Title', key: 'title', width: 10 },
            { header: 'Card Number', key: 'cardnumber', width: 10 },
            { header: 'Email', key: 'email', width: 10 },
            { header: 'Extension Number', key: 'extension_number', width: 10 },
            { header: 'Phone Number', key: 'phone_number', width: 10 },
            { header: 'Begin Date', key: 'begin_date', width: 10 },
            { header: 'Expire Date', key: 'expire_date', width: 10 },
            { header: 'Remarks', key: 'remarks', width: 10 },
          ];

          salf.excelExecutionAmounts = salf.value_selectedItems.length;
          salf.excelCounter = 0;

          for (let idx = 0; idx < salf.value_selectedItems.length; idx += 1) {
            salf.exportNo += 1;
            salf.excelCounter += 1;

            // console.log('clickOnExport', salf.value_allTableItems[idx].group_list);

            worksheet.addRow({
              No: salf.exportNo,
              id: salf.value_selectedItems[idx].id,
              name: salf.value_selectedItems[idx].name,
              department: salf.value_selectedItems[idx].extra_info.department,
              group: salf.value_selectedItems[idx].group_list.join('|'),
              title: salf.value_selectedItems[idx].extra_info.title,
              cardnumber: salf.value_selectedItems[idx].card_number,
              email: salf.value_selectedItems[idx].extra_info.email,
              extension_number: salf.value_selectedItems[idx].extra_info.extension_number,
              phone_number: salf.value_selectedItems[idx].extra_info.phone_number,
              begin_date:
                salf.value_selectedItems[idx].begin_date === 0
                  ? ''
                  : dayjs(salf.value_selectedItems[idx].begin_date).format('DD/MM/YYYY-MM-DD-HH-mm-ss'),
              expire_date:
                salf.value_selectedItems[idx].expire_date === 0
                  ? ''
                  : dayjs(salf.value_selectedItems[idx].expire_date).format('DD/MM/YYYY-MM-DD-HH-mm-ss'),
              remarks: salf.value_selectedItems[idx].extra_info.remarks,
            });

            if (withPhoto) {
              const photoRet = await salf.$globalFetchPhoto(
                salf.value_selectedItems[idx].uuid,
              );

              if (photoRet.data && photoRet.data.register_image.length > 0) {
                const fileNameR = salf.value_selectedItems[idx].id;
                snapshotFolder.file(`${fileNameR}.jpeg`, photoRet.data.register_image, {
                  base64: true,
                });
              }

              if (photoRet.data && photoRet.data.display_image.length > 0) {
                const fileNameD = `${salf.value_selectedItems[idx].id}_D`;
                snapshotFolder.file(`${fileNameD}.jpeg`, photoRet.data.display_image, {
                  base64: true,
                });
              }
            }

            if (this.formData.type === 'Visitor') {
              const fileNameR = salf.value_selectedItems[idx].id;
              qrcodeFolder.file(`${fileNameR}.jpeg`, salf.value_selectedItems[idx].qrCode, {
                base64: true,
              });
            }
          }

          if (workbook != null) {
            workbook.xlsx.writeBuffer().then((data) => {
              const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });

              zip.file('PersonsList.xlsx', blob);

              zip.generateAsync({ type: 'blob' }).then((content) => FileSaver.saveAs(content, 'PersonsList.zip'));
            });
          }

          salf.flag_downloadingExecl = false;
        }
        if (salf.obj_loading) salf.obj_loading.hide();
      },
      deleteItem(listToDel) {
        if (this.onDelete) {
          this.onDelete(listToDel, (success) => {
            if (success) {
              listToDel.forEach((deletedItem) => {
                this.value_allTableItems = this.value_allTableItems.filter((item) => item.uuid !== deletedItem.uuid);
              });
              this.generateFilteredData(
                this.value_allTableItems,
                this.value_searchingFilter,
              );
            }
          });
        }
      },
      clickOnSingleDelete(item) {
        // console.log( 'clickOnSingleDelete', item.uuid )
        const list = [item];
        if (list.length > 0) this.deleteItem([item]);
      },
      clickOnMultipleDelete() {
        const list = [
          ...this.$refs.mainTable.getCheckboxReserveRecords(),
          ...this.$refs.mainTable.getCheckboxRecords(),
        ];
        if (list.length > 0) this.deleteItem(list);
      },
      clickOnModify(item) {
        if (this.onModify) this.onModify(this.value_allTableItems, item);
      },
      clickOnSendNotification() {
        const list = [
          ...this.$refs.mainTable.getCheckboxReserveRecords(),
          ...this.$refs.mainTable.getCheckboxRecords(),
        ];
        if (list.length > 0) {
          const filter = list.filter((item) => item.extra_info.email !== '');
          for (let i = 0; i < filter.length; i += 1) {
            const item = filter[i];
            const data = {
              subject: `${item.card_number}-${item.name}`,
              to: [item.extra_info.email],
              cc: [],
              bcc: [],
              body: `
              No: ${item.card_number} \n
              Full Name: ${item.name} \n
              Mobile: ${item.extra_info.phone_number} \n
              Department: ${item.extra_info.department} \n
              Job Title: ${item.extra_info.title} \n
              Email: ${item.extra_info.email}
            `,
              attach: item.qrCode,
            };
            this.$globalSendNotification(data, (error) => {
              if (error === null) {
                this.$message.success('Send Email Success');
              } else {
                this.$message.error('Send Email Fail');
              }
            });
          }
        }
      }
    },
  };
</script>