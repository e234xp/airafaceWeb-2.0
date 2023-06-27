<template>
  <div>
    <div>
      <CCol sm="12">
        <td class="h1">{{ disp_header }}</td>
      </CCol>
      <div style="height: 35px"></div>
    </div>
    <div>
      <CCol sm="12">
        <CCol sm="12">
          <CRow>
            <div>
              <CButton class="btn btn-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnAdd()"
                :disabled="!canDelete()">
                {{ disp_add }}
              </CButton>
            </div>

            <div>
              <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnTemplate()"
                :disabled="!canDelete()">
                {{ disp_Template }}
              </CButton>
            </div>

            <div>
              <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg"
                @click="flag_collapse = !flag_collapse" :disabled="!canDelete()">
                <!-- @click="clickOnImport()"> -->
                {{ disp_import }}
              </CButton>
            </div>

            <div>
              <CButton class="btn btn-outline-primary btn-w-sm mr-3 mb-3" size="lg" @click="clickOnExport(true)"
                :disabled="!canDelete()">
                {{ disp_export }}
              </CButton>
            </div>

            <div>
              <CButton class="btn btn-danger btn-w-sm mr-3 mb-3" size="lg" @click="clickOnMultipleDelete()"
                :disabled="!canDelete()">
                {{ disp_delete }}
              </CButton>
            </div>
            <div class="d-flex" style="margin-left: auto">
              <CInput v-model.lazy="value_searchingFilter" style="width: 280px" size="lg" :placeholder="disp_search">
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
                      <CCol col="1" class="pt-2 label">{{ disp_infoExcelFile }}</CCol>
                      <CCol col="11">
                        <CInputFile :lazy="false" @change="personInfoListener" :disabled="isLocal()"
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol col="1" class="pt-2 label">{{ disp_uploadFile }}</CCol>
                      <CCol col="11">
                        <CInputFile :lazy="false" :multiple="true" @change="photoListener" :disabled="isLocal()" />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol col="2" class="pt-2 label">
                        <CButton style="width: 150px; background-color: #20a8d8; color: white" size="lg"
                          @click="clickOnImport()">
                          {{ disp_import }}
                        </CButton>
                      </CCol>

                      <CCol col="10" class="pt-2 label">
                        <div style="float: left; font-size: 20px; padding-top: inherit">
                          {{ disp_successRecords }} : {{ value_successRecords }} /
                          {{ disp_failRecords }} : {{ value_failRecords }} /
                          {{ disp_totalRecords }} : {{ value_totalRecords }}
                        </div>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol col="4" class="pt-2 label">{{ disp_importFailure }}</CCol>
                      <CCol col="12" ref="importFailure"> </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCollapse>
            </CCol>
          </CRow>
        </CCol>
      </CCol>
      <div style="height: 15px"></div>
    </div>
    <CCard>
      <CCardBody>
        <div>
          <div id="personManagementFrom">
            <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
              :header-cell-style="headerCellStyle" ref="mainTable" @checkbox-all="selectAllEvent"
              @checkbox-change="selectChangeEvent" :edit-config="{ trigger: 'manual', mode: 'row' }">
              <vxe-table-column type="checkbox" width="4%" align="center"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="id" :title="disp_id" width="14%"
                style="font: 10px">
              </vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="nameToShow" :title="disp_name"
                width="14%"></vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="extra_info.department" :title="disp_department"
                width="14%">
              </vxe-table-column>
              <vxe-table-column :show-overflow="ellipsisMode" field="group_list" :title="disp_group"
                width="14%"></vxe-table-column>

              <!-- 註冊照片 -->
              <vxe-table-column width="170" field="imgRegisterPhoto" :title="disp_registerPhoto" type="html">
              </vxe-table-column>
              <!-- <vxe-table-column :title="disp_registerPhoto" width="170">
                <template #default="{ row }">
                  <img :id="getRegisterImgId(row.uuid)" />
                </template>
              </vxe-table-column> -->

              <!-- 顯示照片 -->
              <vxe-table-column width="170" field="imgDisplayPhoto" :title="disp_displayPhoto" type="html">
              </vxe-table-column>
              <!--  <vxe-table-column :title="disp_displayPhoto" width="170">
                <template #default="{ row }">
                  <img :id="getDisplayImgId(row.uuid)" />
                </template>
              </vxe-table-column> -->

              <!-- 編輯和刪除按鈕 -->
              <!-- <vxe-table-column field="actionButton" title="" width="12%" type="html" /> -->
              <vxe-table-column min-width="13%">
                <template #default="{ row }">
                  <div class="d-flex flex-column align-items-center">
                    <vxe-button class="btn-in-cell-primary btn-in-cell" @click="clickOnModify(row)">{{ disp_modify
                      }}</vxe-button>

                    <vxe-button class="btn-in-cell-danger btn-in-cell" @click="clickOnSingleDelete(row)">{{ disp_delete
                      }}</vxe-button>
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
            :total="value_tablePage.totalResult" @page-change="handlePageChange">
          </vxe-pager>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  import FileSaver from "file-saver";
  import Excel from "exceljs/dist/exceljs.min.js";
  import JsZip from "jszip";
  import XLSX from "xlsx";

  import * as LoadImage from "blueimp-load-image";

  Date.prototype.yyyy_mm_dd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd,
    ].join("");
  };

  Date.prototype.yyyy_mm_dd_HH_MM_SS = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var HH = this.getHours();
    var MM = this.getMinutes();
    var SS = this.getSeconds();

    return [
      this.getFullYear() + "-",
      (mm > 9 ? "" : "0") + mm + "-",
      (dd > 9 ? "" : "0") + dd + " ",
      (HH > 9 ? "" : "0") + HH + ":",
      (MM > 9 ? "" : "0") + MM + ":",
      (SS > 9 ? "" : "0") + SS,
    ].join("");
  };

  const defaultlState = () => {
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
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==",
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 4,
        totalResult: 0,
      },
      value_searchingFilter: "",

      disp_id: i18n.formatter.format("PersonId"),
      disp_name: i18n.formatter.format("PersonName"),

      disp_department: i18n.formatter.format("Department"),
      disp_group: i18n.formatter.format("Group"),
      disp_registerPhoto: i18n.formatter.format("RegisterPhoto"),
      disp_displayPhoto: i18n.formatter.format("DisplayPhoto"),
      disp_search: i18n.formatter.format("Search"),
      disp_add: i18n.formatter.format("Add"),
      disp_Template: i18n.formatter.format("Template"),
      disp_import: i18n.formatter.format("Import"),
      disp_export: i18n.formatter.format("Export"),
      disp_delete: i18n.formatter.format("Delete"),
      disp_modify: i18n.formatter.format("Modify"),
      disp_header: "none", //i18n.formatter.format("CreatePerson"),

      disp_infoExcelFile: i18n.formatter.format("PersonInfoFile"),
      disp_uploadFile: i18n.formatter.format("UploadFile"),
      disp_successRecords: i18n.formatter.format("SuccessRecords"),
      disp_failRecords: i18n.formatter.format("FailRecords"),
      disp_totalRecords: i18n.formatter.format("TotalRecords"),

      disp_maxFileSize: i18n.formatter.format("MaxFileSize"),
      disp_importFailure: i18n.formatter.format("ImportFailure"),
      // disp_maxPeople : i18n.formatter.format("MaxPeople")
    };
  };
  export default {
    name: "ManagementForm",
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
      return Object.assign({}, defaultlState(), this.formData);
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    mixins: [TableObserver],
    created() { },
    async mounted() {
      const self = this;

      let ret = await self.$globalGetGroupList();
      if (!ret.error) {
        ret.group_list.forEach((g) => {
          self.value_personGroupList.push(g.name);
        });
      }

      self.refreshTableItems();
    },

    updated() {
      const self = this;
      self.value_dataItemsToShow.forEach((item) => {
        const modifyButtonId = "actionOnModify_" + item.uuid;
        const deleteButtonId = "actionOnDelete_" + item.uuid;

        var new_deleteButton = null;
        var new_modifyButton = null;
        var old_deleteButton = document.getElementById(deleteButtonId);
        var old_modifyButton = document.getElementById(modifyButtonId);
        if (old_deleteButton && old_deleteButton.parentNode) {
          new_deleteButton = old_deleteButton.cloneNode(true);
          old_deleteButton.parentNode.replaceChild(new_deleteButton, old_deleteButton);
        }

        if (old_modifyButton && old_modifyButton.parentNode) {
          new_modifyButton = old_modifyButton.cloneNode(true);
          old_modifyButton.parentNode.replaceChild(new_modifyButton, old_modifyButton);
        }

        if (new_deleteButton)
          new_deleteButton.addEventListener("click", function () {
            self.clickOnSingleDelete(item);
          });
        if (new_modifyButton)
          new_modifyButton.addEventListener("click", function () {
            self.clickOnModify(item);
          });
      });
    },
    watch: {
      value_searchingFilter: function (value) {
        this.value_tablePage.currentPage = 1;
        this.generateFilteredData(this.value_allTableItems, this.value_searchingFilter);
      },
    },
    methods: {
      getRegisterImgId(uuid) {
        return "imgRegisterPhoto" + uuid;
      },
      getDisplayImgId(uuid) {
        return "imgDisplayPhoto" + uuid;
      },
      isLocal() {
        return false;
      },
      headerCellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize: 18px;word-break: break-all !important; ";
      },
      cellStyle(row, column, rowIndex, columnIndex) {
        // return "fontSize:18px;background:pink;word-break: break-all !important;";
        // return "fontSize:18px;background:pink;text-overflow: ellipsis !important; white-space:no-wrap !important; word-break:normal !important;";
        return "fontSize:18px;";
      },
      formatBase64ToImgTag(eleId, desireWidth, desireHeight, base64ImageString) {
        const self = this;
        if (base64ImageString.length > 0)
          return `<img id=${eleId} width="${desireWidth}" height="${desireHeight}" src="data:image/jpeg;base64,${base64ImageString}">`;
        return `<img id=${eleId} width="${desireWidth}" height="${desireHeight}" src="${self.value_emptyPhoto}">`;
      },
      async generateFilteredData(sourceData, filter) {
        const self = this;
        const filteredItems =
          filter.length == 0
            ? sourceData
            : sourceData.filter((item) => {
              return (
                (item.id && item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1) ||
                (item.name &&
                  item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1) ||
                (item.extra_info &&
                  item.extra_info.department &&
                  item.extra_info.department.toLowerCase().indexOf(filter.toLowerCase()) >
                  -1) ||
                (item.group_list &&
                  item.group_list.toString().toLowerCase().indexOf(filter.toLowerCase()) >
                  -1)
              );
            });

        self.value_tablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
          self.value_tablePage.currentPage * self.value_tablePage.pageSize
        );

        sliceList.forEach((item) => {
          let modifyButtonId = "actionOnModify_" + item.uuid;
          let deleteButtonId = "actionOnDelete_" + item.uuid;

          item["actionButton"] =
            '<input type="button" onclick="" id="' +
            modifyButtonId +
            '" value="' +
            self.disp_modify +
            '" class="btn btn-outline-primary btn-w-xs mb-2 fz-sm" />' +
            (self.canDelete()
              ? '<div style="height:15px;"></div>' +
              '<input type="button" id="' +
              deleteButtonId +
              '" value="' +
              self.disp_delete +
              '" class="btn btn-outline-danger btn-w-xs fz-sm"/>'
              : "");

          //console.log( "item.register_image", item )
          item["imgRegisterPhoto"] = self.formatBase64ToImgTag(
            `imgRegisterPhoto${item.uuid}`,
            100,
            100,
            ""
          );
          item["imgDisplayPhoto"] = self.formatBase64ToImgTag(
            `imgDisplayPhoto${item.uuid}`,
            100,
            100,
            ""
          );

          item["nameToShow"] = item.name;
          var startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (item.begin_date > 0 && item.begin_date > startOfToday.getTime()) {
            item["nameToShow"] +=
              "\n" +
              i18n.formatter.format("EffectivOn") +
              " : " +
              new Date(item.begin_date).yyyy_mm_dd();
          }
          if (item.expire_date > 0 && item.expire_date - 1 < startOfToday.getTime()) {
            item["nameToShow"] +=
              "\n" +
              i18n.formatter.format("ExpireOn") +
              " : " +
              new Date(item.expire_date).yyyy_mm_dd();
          }
        });
        self.value_dataItemsToShow = Object.assign([], sliceList);
        for (let ii = 0; ii < self.value_dataItemsToShow.length; ii++) {
          const item = self.value_dataItemsToShow[ii];
          let photoRet = await self.$globalFetchPhoto(item.uuid);

          let oldRegisterPhotoImg = document.getElementById(`imgRegisterPhoto${item.uuid}`);
          if (oldRegisterPhotoImg && oldRegisterPhotoImg.parentNode) {
            var imgRegister = document.createElement("img");
            imgRegister.width = 100;
            imgRegister.height = 100;
            imgRegister.src =
              photoRet.data && photoRet.data.register_image.length > 0
                ? `data:image/jpeg;base64,${photoRet.data.register_image}`
                : self.value_emptyPhoto;
            oldRegisterPhotoImg.parentNode.replaceChild(imgRegister, oldRegisterPhotoImg);

            var imgDisplay = document.createElement("img");
            imgDisplay.width = 100;
            imgDisplay.height = 100;
            imgDisplay.src =
              photoRet.data && photoRet.data.display_image.length > 0
                ? `data:image/jpeg;base64,${photoRet.data.display_image}`
                : self.value_emptyPhoto;
            let oldDisplayPhotoImg = document.getElementById(`imgDisplayPhoto${item.uuid}`);
            oldDisplayPhotoImg.parentNode.replaceChild(imgDisplay, oldDisplayPhotoImg);
          }
        }
      },
      refreshTableItems(cb) {
        const self = this;
        if (self.onFetchDataCallback) {
          self.onFetchDataCallback(function (error, reset, more, tableItems) {
            if (!error) {
              if (reset) {
                self.value_allTableItems = [];
                self.value_dataItemsToShow = [];
              }
              if (tableItems) {
                self.value_allTableItems = self.value_allTableItems.concat(tableItems);
                self.generateFilteredData(
                  self.value_allTableItems,
                  self.value_searchingFilter
                );
                self.observeTableSize();
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
      selectAllEvent({ checked, records }) {
        // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
      },
      selectChangeEvent({ checked, records }) {
        // console.log(checked ? '勾选事件' : '取消事件', records)
      },
      getSelectEvent() {
        let selectRecords = this.$refs.mainTable.getCheckboxRecords();
        //console.log(selectRecords);
      },
      async clickOnTemplate() {
        var zip = new JsZip();
        var snapshotFolder = zip.folder("snapshot");

        var workbook = new Excel.Workbook();
        var worksheet = null;

        worksheet = workbook.addWorksheet("Persons");
        worksheet.columns = [
          { header: "No", key: "No", width: 10 },
          { header: "Id", key: "id", width: 10 },
          { header: "Fullname", key: "name", width: 10 },
          { header: "Department", key: "department", width: 10 },
          { header: "Group", key: "group", width: 10 },
          { header: "Title", key: "title", width: 10 },
          { header: "Card Number", key: "cardnumber", width: 10 },
          { header: "Email", key: "email", width: 10 },
          { header: "Extension Number", key: "extension_number", width: 10 },
          { header: "Phone Number", key: "phone_number", width: 10 },
          { header: "Begin Date", key: "begin_date", width: 10 },
          { header: "Expire Date", key: "expire_date", width: 10 },
          { header: "Remarks", key: "remarks", width: 10 },
        ];

        worksheet.addRow({
          No: 1,
          id: "A-0001",
          name: "John",
          department: "Department-1|Department-2",
          group: "Group-1|Group-2",
          title: "Job Title",
          cardnumber: "84325746",
          email: "john@abc.com.tw",
          extension_number: "2585",
          phone_number: "0912345678",
          begin_date: "2020-12-12",
          expire_date: "",
          remarks: "",
        });

        snapshotFolder.file(
          "A-0001.jpeg",
          "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",
          { base64: true }
        );
        snapshotFolder.file(
          "A-0001-D.jpeg",
          "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",
          { base64: true }
        );

        worksheet.addRow({
          No: 2,
          id: "A-0002",
          name: "Merry",
          department: "Department-1",
          group: "Group-2",
          title: "Job Title",
          cardnumber: "84325746",
          email: "merry@abc.com.tw",
          extension_number: "1234",
          phone_number: "",
          begin_date: "",
          expire_date: "2020-12-12",
          remarks: "",
        });
        snapshotFolder.file(
          "A-0002.jpeg",
          "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",
          { base64: true }
        );

        await workbook.xlsx.writeBuffer().then((data) => {
          var blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          zip.file("PersonsTemplate.xlsx", blob);
        });

        zip.generateAsync({ type: "blob" }).then(function (content) {
          FileSaver.saveAs(content, "PersonsList.zip");
        });
      },

      clickOnAdd() {
        if (this.onAdd) this.onAdd(this.value_allTableItems);
      },

      personInfoListener(event) {
        var me = this;

        this.xlsxFile = event[0];
        if (this.xlsxFile == null) return;
        if (this.xlsxFile.size > 1024000 * 5) {
          alert(disp_maxFileSize);
          return;
        }

        me.data = [];

        var myReader = new FileReader();
        myReader.onload = async (e) => {
          var data = new Uint8Array(myReader.result);
          var arr = new Array();
          for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);

          var workbook = XLSX.read(arr.join(""), {
            type: "binary",
            cellDates: true,
            cellStyles: true,
          });
          me.value_excelFileImpport = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
          );

          me.totalRecords = me.value_excelFileImpport.length;
        };
        myReader.readAsArrayBuffer(this.xlsxFile);
      },

      photoListener(event) {
        var me = this;

        for (let i = 0; i < event.length; i++) {
          const e = event[i];

          if (e.size < 1024000 * 5) {
            var _fn = e.name.split(".")[0];
            var isDisp = _fn.toLowerCase().indexOf("_d");
            var _id = _fn.replace("_d", "").replace("_D", "");
            var item = me.value_excelFileImpport.find((x) => x.Id == _id);
            if (item) {
              if (isDisp >= 0) item["dispfile"] = e;
              else item["regfile"] = e;
            }
          }
        }
      },

      async generateEXIFrontImage(file) {
        let imgBase64 = "";
        let imgFile = null;
        let options = { canvas: true };

        imgFile = this.checkBase64(file);

        return new Promise((resolve, reject) => {
          LoadImage.parseMetaData(imgFile, (data) => {
            if (data.exif) {
              // options.orientation = data.exif.get('Orientation');
              options.orientation = 1;
            }
            LoadImage(
              imgFile,
              (canvas) => {
                // if (canvas.type === "error") return reject(canvas);
                if (canvas.type === "error") return resolve(file);
                imgBase64 = canvas.toDataURL(imgFile.type);
                resolve(imgBase64);
              },
              options
            );
          });
        });
      },

      checkBase64(file) {
        if (typeof file === "string") {
          let type = file.split(":")[1].split(";")[0];
          return this.base64ToBlob(file, type);
        } else {
          return file;
        }
      },

      base64ToBlob(base64, fileType) {
        const bin = atob(base64.replace(/^.*,/, ""));
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        return new Blob([buffer.buffer], {
          type: fileType ? fileType : "image/*",
        });
      },

      async clickOnImport() {
        const me = this;

        me.value_fileImporting = true;
        me.onImport(me.value_fileImporting);

        async function batchEnroll(_item, resolve) {
          if (_item == null) resolve(true);

          let readerReg = new FileReader();
          readerReg.onloadend = async (e) => {
            var image = new Image();
            var result = await me.generateEXIFrontImage(readerReg.result);

            var pos = result.indexOf(";base64,");
            if (pos >= 0) {
              _item.photoImage = result.substring(pos + 8);
            }

            var beginDate =
              _item["Begin Date"] && _item["Begin Date"].length > 0
                ? new Date(_item["Begin Date"].replaceAll("-", "/")).getTime()
                : 0;
            var expireDate =
              _item["Expire Date"] && _item["Expire Date"].length > 0
                ? new Date(_item["Expire Date"].replaceAll("-", "/")).getTime()
                : 0;

            let data = {
              id: _item["Id"],
              name: _item["Fullname"] || "",
              card_facility_code: "",
              card_number: _item["Card Number"] || "",
              begin_date: beginDate || 0,
              expire_date: expireDate || 0,
              group_list: _item["Group"] ? _item["Group"].split("|") : [],

              display_image: _item.dispImage ? _item.dispImage : "",
              register_image: _item.photoImage ? _item.photoImage : "",
              extra_info: {
                title: _item["Title"] || "",
                department: _item["Department"] || "",
                email: _item["Email"] || "",
                phone_number: _item["Phone Number"] || "",
                extension_number: _item["Extension Number"] || "",
                remarks: _item["Remarks"] || "",
              },
            };

            if (me.formData.type == "Person") {
              me.$globalCreatePerson(data, async (error, result) => {
                if (error == null) {
                  me.value_successRecords = me.value_successRecords + 1;
                  delete _item.photoImage;
                  delete _item.dispImage;

                  //console.log(result.uuid);

                  if (_item["Group"]) {
                    let groups = _item["Group"].split("|") || [];
                    for (let i = 0; i < groups.length; i++) {
                      const g = groups[i];

                      if (me.value_personGroupList.indexOf(g) < 0) {
                        let data = {
                          name: g,
                          person_uuid_list: [result.uuid],
                          remarks: "",
                          visitor_uuid_list: [],
                        };

                        await me.$globalCreateGroup(data);

                        me.value_personGroupList.push(g);
                      }
                    }
                  }
                } else {
                  me.$refs.importFailure.innerHTML +=
                    (me.$refs.importFailure.innerHTML == "" ? "" : ", ") + _item["Id"]; // + " " + i18n.formatter.format("ImportFailure");

                  me.value_failRecords = me.value_failRecords + 1;
                  delete _item.photoImage;
                  delete _item.dispImage;
                }

                resolve(true);
              });
            } else if (me.formData.type == "Visitor") {
              me.$globalCreateVisitor(data, (error, result) => {
                if (error == null) {
                  me.value_successRecords = me.value_successRecords + 1;
                  delete _item.photoImage;
                  delete _item.dispImage;
                } else {
                  me.$refs.importFailure.innerHTML +=
                    (me.$refs.importFailure.innerHTML == "" ? "" : ", ") +
                    _item["Id"] +
                    " " +
                    i18n.formatter.format("ImportFailure");

                  me.value_failRecords = me.value_failRecords + 1;
                  delete _item.photoImage;
                  delete _item.dispImage;
                }

                resolve(true);
              });
            }
          };

          var readerDisp = new FileReader();
          readerDisp.onloadend = async (e) => {
            var image = new Image();
            var result = await me.generateEXIFrontImage(readerDisp.result);

            var pos = result.indexOf(";base64,");
            if (pos >= 0) {
              _item.dispImage = result.substring(pos + 8);
            }

            readerReg.readAsDataURL(_item.regfile);
          };

          if (_item.regfile == undefined) {
            me.$refs.importFailure.innerHTML +=
              (me.$refs.importFailure.innerHTML == "" ? "" : ", ") +
              _item["Id"] +
              " " +
              i18n.formatter.format("ImportFailure");

            me.value_failRecords = me.value_failRecords + 1;
            delete _item.photoImage;
            delete _item.dispImage;

            resolve(true);
          } else {
            if (_item.dispfile != undefined) readerDisp.readAsDataURL(_item.dispfile);
            else readerReg.readAsDataURL(_item.regfile);
          }
        }

        let lastitem = 1;
        var doJobWithThrottle = async (items, throttle = 1) => {
          return new Promise((resolve) => {
            var takeOne = () => {
              var item = items.shift();

              if (!item) {
                lastitem--;

                if (lastitem <= 0) resolve(true);
                return;
              }

              new Promise((resolve) => {
                batchEnroll(item, resolve);
              }).then(() => {
                me.importNo++;
                takeOne();
              });
            };

            for (var i = 0; i < throttle; ++i) takeOne();
          });
        };

        this.value_totalRecords = this.value_excelFileImpport.length;

        await doJobWithThrottle(this.value_excelFileImpport);

        me.value_fileImporting = false;

        me.onImport(me.value_fileImporting);

        me.refreshTableItems();
      },
      async clickOnExport(withPhoto) {
        let salf = this;
        salf.obj_loading = salf.$loading.show({ container: salf.$refs.formContainer });

        salf.flag_downloadingExecl = true;
        var snapshotFolder = null;

        var zip = new JsZip();

        if (withPhoto) snapshotFolder = zip.folder("snapshot");

        var workbook = new Excel.Workbook();
        var worksheet = null;
        salf.exportNo = 0;

        worksheet = workbook.addWorksheet("Persons");

        if (salf.value_allTableItems != null) {
          worksheet.columns = [
            { header: "No", key: "No", width: 10 },
            { header: "Id", key: "id", width: 10 },
            { header: "Fullname", key: "name", width: 10 },
            { header: "Department", key: "department", width: 10 },
            { header: "Group", key: "group", width: 10 },
            { header: "Title", key: "title", width: 10 },
            { header: "Card Number", key: "cardnumber", width: 10 },
            { header: "Email", key: "email", width: 10 },
            { header: "Extension Number", key: "extension_number", width: 10 },
            { header: "Phone Number", key: "phone_number", width: 10 },
            { header: "Begin Date", key: "begin_date", width: 10 },
            { header: "Expire Date", key: "expire_date", width: 10 },
            { header: "Remarks", key: "remarks", width: 10 },
          ];

          salf.excelExecutionAmounts = salf.value_allTableItems.length;
          salf.excelCounter = 0;

          for (let idx = 0; idx < salf.value_allTableItems.length; idx++) {
            salf.exportNo++;
            salf.excelCounter++;

            worksheet.addRow({
              No: salf.exportNo,
              id: salf.value_allTableItems[idx].id,
              name: salf.value_allTableItems[idx].name,
              department: salf.value_allTableItems[idx].extra_info.department,
              group: eval(salf.value_allTableItems[idx].group_list).join("|"),
              title: salf.value_allTableItems[idx].extra_info.title,
              cardnumber: salf.value_allTableItems[idx].card_number,
              email: salf.value_allTableItems[idx].extra_info.email,
              extension_number: salf.value_allTableItems[idx].extra_info.extension_number,
              phone_number: salf.value_allTableItems[idx].extra_info.phone_number,
              begin_date:
                salf.value_allTableItems[idx].begin_date == 0
                  ? ""
                  : new Date(
                    salf.value_allTableItems[idx].begin_date
                  ).yyyy_mm_dd_HH_MM_SS(),
              expire_date:
                salf.value_allTableItems[idx].expire_date == 0
                  ? ""
                  : new Date(
                    salf.value_allTableItems[idx].expire_date
                  ).yyyy_mm_dd_HH_MM_SS(),
              remarks: salf.value_allTableItems[idx].extra_info.remarks,
            });

            if (withPhoto) {
              let photoRet = await salf.$globalFetchPhoto(
                salf.value_allTableItems[idx].uuid
              );

              if (photoRet.data && photoRet.data.register_image.length > 0) {
                let fileNameR = salf.value_allTableItems[idx].id;
                snapshotFolder.file(fileNameR + ".jpeg", photoRet.data.register_image, {
                  base64: true,
                });
              }

              if (photoRet.data && photoRet.data.display_image.length > 0) {
                let fileNameD = salf.value_allTableItems[idx].id + "_D";
                snapshotFolder.file(fileNameD + ".jpeg", photoRet.data.display_image, {
                  base64: true,
                });
              }
            }

            // if (salf.exportNo % 1000 == 0) {
            //   await workbook.xlsx.writeBuffer()
            //     .then((data) => {
            //       var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            //       zip.file("PersonsList.xlsx", blob);
            //     });x
            //   workbook = new Excel.Workbook();
            //   worksheet = workbook.addWorksheet('Report' + salf.exportNo);

            //   worksheet.columns = [
            //     { header: 'No', key: 'No', width: 10 },
            //     { header: salf.disp_id, key: 'id', width: 10 },
            //     { header: salf.disp_name, key: 'nameToShow', width: 10 },
            //     { header: salf.disp_department, key: 'department', width: 10 },
            //     { header: salf.disp_group, key: 'group', width: 10 },
            //     { header: salf.disp_registerPhoto, key: 'registerPhoto', width: 20 },
            //     { header: salf.disp_displayPhoto, key: 'displayPhoto', width: 20 }
            //   ];
            // }
          }

          if (workbook != null) {
            workbook.xlsx.writeBuffer().then((data) => {
              var blob = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });

              zip.file("PersonsList.xlsx", blob);

              zip.generateAsync({ type: "blob" }).then(function (content) {
                FileSaver.saveAs(content, "PersonsList.zip");
              });
            });
          }

          salf.flag_downloadingExecl = false;
        }
        if (salf.obj_loading) salf.obj_loading.hide();
      },
      deleteItem(listToDel) {
        const self = this;
        if (self.onDelete) {
          self.onDelete(listToDel, function (success) {
            if (success) {
              listToDel.forEach((deletedItem) => {
                self.value_allTableItems = self.value_allTableItems.filter(function (item) {
                  return item.uuid !== deletedItem.uuid;
                });
              });
              self.generateFilteredData(
                self.value_allTableItems,
                self.value_searchingFilter
              );
            }
          });
        }
      },
      clickOnSingleDelete(item) {
        //console.log( "clickOnSingleDelete", item.uuid )
        const list = [item];
        if (list.length > 0) this.deleteItem([item]);
      },
      clickOnMultipleDelete() {
        const list = this.$refs.mainTable.getCheckboxRecords();
        if (list.length > 0) this.deleteItem(list);
      },
      clickOnModify(item) {
        if (this.onModify) this.onModify(item);
      },
    },
  };
</script>