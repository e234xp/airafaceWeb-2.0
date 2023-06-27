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
              <CButton size="lg" class="btn btn-primary mb-3" @click="clickOnAdd()">
                {{ disp_add }}
              </CButton>
            </div>
            <div style="width: 20px"></div>
            <div>
              <CButton
                class="btn btn-danger mb-3"
                size="lg"
                @click="clickOnMultipleDelete()"
              >
                {{ disp_delete }}
              </CButton>
            </div>
            <div style="margin-left: auto">
              <CInput
                v-model.lazy="value_searchingFilter"
                style="width: 400px"
                size="lg"
                :placeholder="disp_search"
              >
                <template #prepend-content><CIcon name="cil-search" /></template>
              </CInput>
            </div>
          </CRow>
        </CCol>
      </CCol>
      <div style="height: 15px"></div>
    </div>
    <CCard>
      <CCardBody>
        <div>
          <div id="personManagementFrom">
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
                type="checkbox"
                min-width="10%"
                align="center"
              ></vxe-table-column>
              <vxe-table-column field="enable" :title="disp_enable" min-width="12%">
                <template #default="{ row }">
                  <vxe-switch
                    v-model="row.enable"
                    v-on:change="activeStatusChange(row)"
                  ></vxe-switch>
                </template>
              </vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="name"
                :title="disp_settingName"
                min-width="12%"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="group_list"
                :title="disp_group"
                min-width="20%"
              ></vxe-table-column>
              <vxe-table-column
                :show-overflow="ellipsisMode"
                field="access_control_type_name"
                :title="disp_access_control_type"
                min-width="12%"
              ></vxe-table-column>
              <vxe-table-column
                min-width="12%"
                :show-overflow="ellipsisMode"
                field="remarks"
                :title="disp_remarks"
              ></vxe-table-column>
              <vxe-table-column
                field="actionButton"
                title=""
                min-width="12%"
                type="html"
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
          >
          </vxe-pager>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<script>
// import { computeReshapedDimensions } from 'face-api.js/build/commonjs/utils';
import { mapState } from "vuex";
import TableObserver from "@/utils/TableObserver.vue";
import i18n from "../../i18n";

Date.prototype.yyyy_mm_dd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear() + "-",
    (mm > 9 ? "" : "0") + mm + "-",
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

export default {
  name: "AccessControlManagement",
  // props: {
  //   formData: Object,
  //   onAdd: { type: Function },
  //   onImport: { type: Function },
  //   onExport: { type: Function },
  //   onDelete: { type: Function },
  //   onModify: { type: Function },
  //   onFetchDataCallback: { type: Function }
  // },
  data() {
    return {
      value_dataItemsToShow: [],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0,
      },
      value_searchingFilter: "",

      disp_enable: i18n.formatter.format("Enable"),
      disp_settingName: i18n.formatter.format("SettingName"),
      disp_remarks: i18n.formatter.format("Remarks"),
      disp_group: i18n.formatter.format("Group"),
      disp_search: i18n.formatter.format("Search"),
      disp_access_control_type: i18n.formatter.format("AccessControlDeviceType"),
      disp_add: i18n.formatter.format("Add"),
      disp_delete: i18n.formatter.format("Delete"),
      disp_modify: i18n.formatter.format("Modify"),
      disp_header: i18n.formatter.format("AccessControlSettingsList"),

      value_tabletSettings: null,
    };
  },
  created() {},
  mixins: [TableObserver],
  mounted() {
    const self = this;
    self.refreshTableItems();
    this.observeTableSize();
  },
  computed: {
    ...mapState(["ellipsisMode", "deviceType", "deviceTypes"]),
  },

  updated() {
    const self = this;
    // self.value_dataItemsToShow.forEach( item => {
    //   const modifyButtonId = "actionOnModify_" + item.uuid;
    //   const deleteButtonId = "actionOnDelete_" + item.uuid;
    //   document.getElementById( deleteButtonId ).addEventListener( "click", function() {
    //     self.clickOnSingleDelete( item );
    //   });
    //   document.getElementById( modifyButtonId ).addEventListener( "click", function() {
    //     self.clickOnModify( item );
    //   });
    // });
    self.value_dataItemsToShow.forEach((item) => {
      const modifyButtonId = "actionOnModify_" + item.uuid;
      const deleteButtonId = "actionOnDelete_" + item.uuid;
      var old_deleteButton = document.getElementById(deleteButtonId);
      var new_deleteButton = old_deleteButton.cloneNode(true);
      old_deleteButton.parentNode.replaceChild(new_deleteButton, old_deleteButton);

      var old_modifyButton = document.getElementById(modifyButtonId);
      var new_modifyButton = old_modifyButton.cloneNode(true);
      old_modifyButton.parentNode.replaceChild(new_modifyButton, old_modifyButton);

      new_deleteButton.addEventListener("click", function () {
        self.clickOnSingleDelete(item);
      });
      new_modifyButton.addEventListener("click", function () {
        self.clickOnModify(item);
      });
    });
  },
  watch: {
    value_searchingFilter: function (value) {
      this.value_tablePage.currentPage = 1;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter
      );
    },
  },
  methods: {
    async downloadGroupListAsync(cb) {
      const self = this;
      let ret = await self.$globalGetGroupList();
      const list = ret.group_list;
      const error = ret.error;
      if (error == null) {
        if (cb) cb(null, list);
      } else {
        if (cb) cb(error, []);
        self.$fire({
          title: i18n.formatter.format("NetworkLoss"),
          text: "",
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
        });
      }
    },
    async applySettings() {
      const self = this;
      const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
      if (!applyRet.error) self.refreshTableItems();
      else {
        self.$fire({
          text: i18n.formatter.format("OperationFailed"),
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
        });
      }
    },
    activeStatusChange(item) {
      this.applySettings();
    },
    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 18px";
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize:18px;";
    },
    formatBase64ToImgTag(desireWidth, desireHeight, base64ImageString) {
      const self = this;
      if (base64ImageString.length > 0)
        return (
          '<img width="' +
          desireWidth +
          '" height="' +
          desireHeight +
          '" src="data:image/jpeg;base64,' +
          base64ImageString +
          '">'
        );
      return (
        '<img width="' +
        desireWidth +
        '" height="' +
        desireHeight +
        '" src="' +
        self.value_emptyPhoto +
        '">'
      );
    },
    generateFilteredData(sourceData, filter) {
      const self = this;
      const filteredItems =
        filter.length == 0
          ? sourceData
          : sourceData.filter((item) => {
              return (
                item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                item.group_list.toString().indexOf(filter.toLowerCase()) > -1
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

        if (item.access_control_type === "relay1")
          item["access_control_type_name"] = i18n.formatter.format("Relay1");
        else if (item.access_control_type === "relay2")
          item["access_control_type_name"] = i18n.formatter.format("Relay2");
        else if (item.access_control_type === "wiegand")
          item["access_control_type_name"] = i18n.formatter.format("Wiegand");

        item["actionButton"] =
          '<input type="button" id="' +
          modifyButtonId +
          '" value="' +
          self.disp_modify +
          '" class="btn btn-outline-primary btn-in-cell p-0"/>' +
          '<div style="height:15px;"></div>' +
          '<input type="button" id="' +
          deleteButtonId +
          '" value="' +
          self.disp_delete +
          '" class="btn btn-outline-danger btn-in-cell p-0"/>';
      });
      return Object.assign([], sliceList);
    },
    refreshTableItems(cb) {
      const self = this;
      self.$globalGetTabletSetting(function (err, data) {
        if (!err) {
          self.value_tabletSettings = data;
          self.value_allTableItems = data.access_control_schedule_list;
          if (self.deviceType === self.deviceTypes.TYPE_AIRA_TABLET_M) {
            self.value_allTableItems = self.value_allTableItems.filter((item) => {
              return item.access_control_type != "relay2";
            });
          }
          self.value_dataItemsToShow = self.generateFilteredData(
            self.value_allTableItems,
            self.value_searchingFilter
          );
        } else {
          self.$fire({
            text: i18n.formatter.format("OperationFailed"),
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8",
          });
        }
        if (cb) cb(err);
      });
    },
    handlePageChange({ currentPage, pageSize }) {
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(
        this.value_allTableItems,
        this.value_searchingFilter
      );
      this.resizeOneTable();
    },
    selectAllEvent({ checked, records }) {
      // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
    },
    selectChangeEvent({ checked, records }) {
      // console.log(checked ? '勾选事件' : '取消事件', records)
    },
    getSelectEvent() {},
    clickOnAdd() {
      const self = this;
      self.downloadGroupListAsync(function (err, list) {
        if (!err) {
          const groupList = list;
          self.$router.push({
            name: "CreateAccessControlSetting",
            params: {
              value_returnRoutePath: "AccessControlManagement",
              value_returnRouteName: i18n.formatter.format("Return"),
              value_group_list: groupList,
              value_exstingAccessControlSettingsList: self.value_allTableItems,
              value_accessControlSetting: null,
            },
          });
        }
      });
    },
    deleteItem(listToDel) {
      const self = this;
      self.$globalGetTabletSetting(function (err, data) {
        if (!err) {
          const tabletSettings = data;
          if (!tabletSettings.access_control_schedule_list)
            tabletSettings.access_control_schedule_list = [];
          let schListWithoutModifiedData = tabletSettings.access_control_schedule_list;
          listToDel.forEach((toDel) => {
            schListWithoutModifiedData = schListWithoutModifiedData.filter((sch) => {
              return sch.uuid != toDel.uuid;
            });
          });
          tabletSettings.access_control_schedule_list = schListWithoutModifiedData;
          self.$globalSetTabletSetting(tabletSettings, function (err, result) {
            if (err) {
              self.$fire({
                text: i18n.formatter.format("Failed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8",
              });
            }
            self.refreshTableItems();
          });
        } else {
          self.$fire({
            text: i18n.formatter.format("Failed"),
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8",
          });
          self.refreshTableItems();
        }
      });
    },
    clickOnSingleDelete(item) {
      const self = this;
      const list = [item];
      if (list.length > 0) {
        self
          .$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
            confirmButtonText: i18n.formatter.format("Confirm"),
            cancelButtonText: i18n.formatter.format("Cancel"),
            confirmButtonColor: "#20a8d8",
            cancelButtonColor: "#f86c6b",
          })
          .then((v) => {
            self.deleteItem(list);
          })
          .catch((e) => {
            if (cb) cb(false);
          });
      }
    },
    clickOnMultipleDelete() {
      const self = this;
      const list = this.$refs.mainTable.getCheckboxRecords();
      if (list.length > 0) {
        self
          .$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
            confirmButtonText: i18n.formatter.format("Confirm"),
            cancelButtonText: i18n.formatter.format("Cancel"),
            confirmButtonColor: "#20a8d8",
            cancelButtonColor: "#f86c6b",
          })
          .then((v) => {
            self.deleteItem(list);
          })
          .catch((e) => {
            if (cb) cb(false);
          });
      }
    },
    clickOnModify(item) {
      const self = this;
      self.downloadGroupListAsync(function (err, list) {
        if (!err) {
          const groupList = list;
          self.$router.push({
            name: "ModifyAccessControlSetting",
            params: {
              value_returnRoutePath: "AccessControlManagement",
              value_returnRouteName: i18n.formatter.format("Return"),
              value_group_list: groupList,
              value_exstingAccessControlSettingsList: self.value_allTableItems,
              value_accessControlSetting: item,
            },
          });
        }
      });
    },
  },
  components: {},
};
</script>
