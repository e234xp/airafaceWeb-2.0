<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">{{ disp_header }}</div>
      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[disp_inputAccessControlInfo, disp_selectSchedule, disp_complete]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      >
      </stepprogress>
    </CCol>
    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <!-- <div style="height:50px;"></div> -->
          <CCol sm="12">
            <CRow>
              <CCol sm="3">
                <div class="h5">{{ disp_accessControlName }}</div>
                <CInput
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_noEmptyNorSpaceNeigherRepeat"
                  value=""
                  v-model="value_accessControlName"
                  placeholder=""
                  :is-valid="accessControlNameValidator"
                  required
                  :disabled="flag_modifyMode"
                />
              </CCol>
              <CCol sm="2">
                <div class="h5">{{ disp_accessControlDeviceType }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_accessControlDeviceType"
                  :options="value_accessControlDeviceTypeList"
                />
              </CCol>
              <CCol sm="5">
                <div class="h5">{{ disp_groupToApply }}</div>
                <multiselect
                  v-model="value_accessControlGroupList"
                  placeholder=""
                  :options="value_groupsNameList"
                  :multiple="true"
                  :taggable="true"
                  :hideSelected="true"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  :show-no-options="false"
                >
                </multiselect>
                <!-- <pre class="language-json"><code>{{ value  }}</code></pre> -->
              </CCol>
              <CCol sm="2">
                <div class="h5">{{ disp_remarks }}</div>
                <CInput size="lg" v-model="value_accessControlRemarks" />
              </CCol>
            </CRow>
            <!-- <div style="height:20px;"></div> -->
          </CCol>
          <CCol sm="12">
            <CRow>
              <CCol sm="3">
                <div class="h5">{{ disp_temperatureTriggerRule }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_accessControlTemperatureTriggerRule"
                  :options="value_temperatureTriggerRuleShow"
                  @change="selTemperatureTriggerRule($event)"
                />
              </CCol>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(1)">
        <CCardBody>
          <div style="height: 50px"></div>
          <CCol sm="12">
            <CRow>
              <CCol sm="6">
                <div class="h5">{{ disp_selectedWeeklySchedule }}</div>
                <scheduler
                  v-model="value_accessControlSelectedWeeklySchedule"
                  :multiple="true"
                />
              </CCol>
              <CCol sm="6">
                <div class="h5">{{ disp_specifiedDatetimeRange }}</div>
                <div class="d-flex align-items-center">
                  <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    v-model="value_specifiedDatetimeRange"
                    type="datetime"
                    range
                    :placeholder="disp_selectDatetimeRange"
                    @change="datePickerDatachange()"
                  ></date-picker>
                  <CButton
                    class="btn btn-outline-primary btn-add ml-2"
                    @click="clickOnInsert()"
                  >
                    +
                  </CButton>
                </div>
                <div style="height: 5px"></div>
                <vxe-table
                  id="AllTable"
                  :show-header="false"
                  :data="value_specifiedDatetimeToShow"
                  style="height: 288px"
                  stripe
                  :cell-style="cellStyle"
                  empty-text=" "
                >
                  <vxe-table-column show-overflow width="auto">
                    <template #default="{ row }">
                      <vxe-button
                        type="text"
                        icon="far fa-minus-square"
                        @click="deleteItemEvent(row)"
                      ></vxe-button>
                    </template>
                  </vxe-table-column>
                  <vxe-table-column
                    show-overflow
                    field="display_string"
                    width="695"
                  ></vxe-table-column>
                </vxe-table>
                <vxe-pager
                  class="h-theme-pager"
                  :layouts="[
                    'PrevJump',
                    'PrevPage',
                    'Number',
                    'NextPage',
                    'NextJump',
                    'FullJump',
                    'Total',
                  ]"
                  :current-page="value_allTablePage.currentPage"
                  :page-size="value_allTablePage.pageSize"
                  :total="value_allTablePage.totalResult"
                  @page-change="handleAllPageChange"
                >
                </vxe-pager>
              </CCol>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px"></div>
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">{{ disp_complete }}</p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-3">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="clickOnNext"
            :disabled="!flag_accessControlNamePass"
            >{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import { mapState } from "vuex";
import datepickerLang_Tw from "vue2-datepicker/locale/zh-tw";
import i18n from "../../../i18n";

import StepProgress from "vue-step-progress";
// import "vue-step-progress/dist/main.css";
import "../../../../src/airacss/vue-step-progress.css";

import Multiselect from "vue-multiselect";
//import "vue-multiselect/dist/vue-multiselect.min.css";
import "../../../../src/airacss/vue-multiselect.css";

import VueScheduler from "@duoa/vue-scheduler";
import "../../../../src/airacss/vue-scheduler.css";
//import '@duoa/vue-scheduler/dist/vue-scheduler.css'

Date.prototype.yyyymmdd_HHMMSS = function () {
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
    value_allTablePage: {
      currentPage: 1,
      pageSize: 6,
      totalResult: 0,
    },

    param_cardStyle: "height: 35rem;",
    param_activeColor: "#6baee3",
    param_passiveColor: "#919bae",
    param_lineThickness: 3,
    param_activeThickness: 3,
    param_passiveThickness: 3,

    disp_noEmptyNorSpaceNeigherRepeat: i18n.formatter.format(
      "NoEmptyNorSpaceNeigherRepeat"
    ),
    disp_inputAccessControlInfo: i18n.formatter.format("InputAccessControlInfo"),
    disp_selectSchedule: i18n.formatter.format("SelectSchedule"),

    disp_create: i18n.formatter.format("Create"),
    disp_modify: i18n.formatter.format("Modify"),
    disp_saveChanges: i18n.formatter.format("SaveChanges"),
    disp_complete: i18n.formatter.format("Complete"),
    disp_registerCompleted: i18n.formatter.format("RegisterCompleted"),
    disp_previous: i18n.formatter.format("Previous"),
    disp_next: i18n.formatter.format("Next"),
    disp_select: i18n.formatter.format("Select"),
    disp_selected: i18n.formatter.format("Selected"),
    disp_deselect: i18n.formatter.format("Deselect"),
    disp_selectedWeeklySchedule: i18n.formatter.format("SelectedWeeklySchedule"),
    disp_specifiedDatetimeRange: i18n.formatter.format("SpecifiedDatetimeRange"),
    disp_selectDatetimeRange: i18n.formatter.format("SelectDatetimeRange"),
    disp_accessControlDeviceType: i18n.formatter.format("AccessControlDeviceType"),
    disp_accessControlName: i18n.formatter.format("AccessControlName"),
    disp_groupToApply: i18n.formatter.format("GroupToApply"),
    disp_remarks: i18n.formatter.format("Remarks"),
    disp_temperatureTriggerRule: i18n.formatter.format("TemperatureTriggerRule"),

    flag_modifyMode: false,

    value_returnRoutePath: "",
    value_returnRouteName: i18n.formatter.format("Return"),
    value_group_list: [],
    value_groupsNameList: [],
    value_exstingAccessControlSettingsList: [],

    flag_currentSetp: 0,

    flag_accessControlNamePass: false,
    value_accessControlSetting: null,
    value_accessControlUuid: "",
    value_accessControlName: "",
    value_accessControlEnabled: true,
    value_accessControlGroupList: [],
    value_accessControlDeviceType: "relay1",
    value_accessControlRemarks: "",
    value_accessControlSelectedWeeklySchedule: {},
    value_accessControlSpecifiedDatetimeData: [],

    value_specifiedDatetimeRange: [null, null],
    value_specifiedDatetimeToShow: [],

    value_temperatureTriggerRuleShow: [
      { value: 0, label: i18n.formatter.format("AllTemperature") },
      { value: 1, label: i18n.formatter.format("NormalTemperatureOnly") },
      { value: 2, label: i18n.formatter.format("HighTemperatureOnly") },
    ],
    value_accessControlTemperatureTriggerRule: 0,

    value_accessControlDeviceTypeList: [
      { value: "relay1", label: i18n.formatter.format("Relay1") },
      { value: "relay2", label: i18n.formatter.format("Relay2") },
      { value: "wiegand", label: i18n.formatter.format("Wiegand") },
    ],
    disp_header: "none",
    disp_AM: i18n.formatter.format("AM"),
    disp_PM: i18n.formatter.format("PM"),
    disp_timeTitle: i18n.formatter.format("Time"),
    disp_weekTitle: i18n.formatter.format("Day"),
    disp_weekDays: [
      i18n.formatter.format("Sun"),
      i18n.formatter.format("Mon"),
      i18n.formatter.format("Tue"),
      i18n.formatter.format("Wed"),
      i18n.formatter.format("Thu"),
      i18n.formatter.format("Fri"),
      i18n.formatter.format("Sat"),
    ],
    disp_hours: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ],
    disp_dragTips: " ",
    disp_reset: i18n.formatter.format("Reset"),
  };
};
export default {
  name: "AccessControlSettingForm",
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  computed: {
    ...mapState(["ellipsisMode", "deviceType", "deviceTypes"]),
  },

  created() {
    const self = this;
    VueScheduler.setLocale({
      AM: self.disp_AM,
      PM: self.disp_PM,
      TIME_TITLE: self.disp_timeTitle,
      WEEK_TITLE: self.disp_weekTitle,
      WEEK_DAYS: self.disp_weekDays,
      HOURS: self.disp_hours,
      DRAG_TIP: self.disp_dragTips,
      RESET: self.disp_reset,
    });
    if (self.value_accessControlSetting) {
      //console.log( "self.value_accessControlSetting", self.value_accessControlSetting );
      self.value_accessControlUuid =
        self.value_accessControlSetting.uuid != null
          ? self.value_accessControlSetting.uuid
          : "";
      self.value_accessControlName =
        self.value_accessControlSetting.name != null
          ? self.value_accessControlSetting.name
          : "";
      self.value_accessControlEnabled =
        self.value_accessControlSetting.enable != null
          ? self.value_accessControlSetting.enable
          : true;
      self.value_accessControlTemperatureTriggerRule =
        self.value_accessControlSetting.temperature_trigger_rule != null
          ? self.value_accessControlSetting.temperature_trigger_rule
          : 0;
      self.value_accessControlGroupList =
        self.value_accessControlSetting.group_list != null
          ? self.value_accessControlSetting.group_list
          : [];
      self.value_accessControlDeviceType =
        self.value_accessControlSetting.access_control_type != null
          ? self.value_accessControlSetting.access_control_type
          : "relay1";
      self.value_accessControlRemarks =
        self.value_accessControlSetting.remarks != null
          ? self.value_accessControlSetting.remarks
          : "";
      self.value_accessControlSpecifiedDatetimeData = [];
      if (
        self.value_accessControlSetting.weekly_schedule &&
        self.value_accessControlSetting.weekly_schedule.list
      ) {
        self.value_accessControlSetting.weekly_schedule.list.forEach((sch) => {
          const key = sch.day_of_week.toString();
          const value = sch.hours_list;
          self.value_accessControlSelectedWeeklySchedule[key] = value;
        });
      }
      if (
        self.value_accessControlSetting.specify_time &&
        self.value_accessControlSetting.specify_time.list
      ) {
        self.value_accessControlSetting.specify_time.list.forEach((sch) => {
          const dataToPush = {
            uuid: self.makeid(32),
            start_time: sch.start_time,
            end_time: sch.end_time,
            display_string:
              new Date(sch.start_time).yyyymmdd_HHMMSS() +
              " ~ " +
              new Date(sch.end_time).yyyymmdd_HHMMSS(),
          };
          self.value_accessControlSpecifiedDatetimeData.push(dataToPush);
        });
      }
    }
    this.calPageData();

    if (self.deviceType === self.deviceTypes.TYPE_AIRA_TABLET_M) {
      self.value_accessControlDeviceTypeList = self.value_accessControlDeviceTypeList.filter(
        (item) => {
          return item.value !== "relay2";
        }
      );
    }
  },
  mounted() {
    const self = this;
    const list = [];
    try {
      self.value_group_list.forEach((group) => {
        list.push(group.name);
      });
      self.value_groupsNameList = list;
    } catch (e) {}
  },
  updated() {},
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  watch: {},
  methods: {
    makeid(length) {
      let result = "";
      let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    calPageData() {
      const self = this;
      self.value_allTablePage.totalResult =
        self.value_accessControlSpecifiedDatetimeData.length;
      self.value_specifiedDatetimeToShow = self.value_accessControlSpecifiedDatetimeData.slice(
        (self.value_allTablePage.currentPage - 1) * self.value_allTablePage.pageSize,
        self.value_allTablePage.currentPage * self.value_allTablePage.pageSize
      );
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 16px;";
    },
    handleAllPageChange({ currentPage, pageSize }) {
      const self = this;
      self.value_allTablePage.currentPage = currentPage;
      self.value_allTablePage.pageSize = pageSize;
      self.calPageData();
    },
    deleteItemEvent(item) {
      const self = this;
      self.value_accessControlSpecifiedDatetimeData = self.value_accessControlSpecifiedDatetimeData.filter(
        (data) => {
          return data.uuid != item.uuid;
        }
      );
      self.calPageData();
    },
    selTemperatureTriggerRule(e) {
      const self = this;
      self.value_accessControlTemperatureTriggerRule = Number(e.target.value);
    },
    clickOnInsert() {
      const self = this;
      if (self.value_specifiedDatetimeRange.length == 2) {
        const startTime = self.value_specifiedDatetimeRange[0];
        const endTime = self.value_specifiedDatetimeRange[1];
        if (startTime != null && endTime != null) {
          self.value_accessControlSpecifiedDatetimeData.push({
            uuid: self.makeid(32),
            display_string:
              startTime.yyyymmdd_HHMMSS() + " ~ " + endTime.yyyymmdd_HHMMSS(),
            start_time: startTime.getTime(),
            end_time: endTime.getTime(),
          });
          self.calPageData();
        }
      }
      self.value_specifiedDatetimeRange = [null, null];
    },
    datePickerDatachange() {},
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.flag_modifyMode ? this.disp_saveChanges : this.disp_create;
        case 2:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
    clickOnPrev() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
        }
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp == 1) {
        if (self.onFinish) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          const weeklySchedule = { list: [] };
          for (let i = 0; i < 7; i++) {
            const sch = self.value_accessControlSelectedWeeklySchedule[i.toString()];
            if (sch != null) {
              weeklySchedule.list.push({
                day_of_week: i,
                hours_list: sch,
              });
            }
          }
          const specifyTime = { list: [] };
          self.value_accessControlSpecifiedDatetimeData.forEach((spDay) => {
            specifyTime.list.push({
              start_time: spDay.start_time,
              end_time: spDay.end_time,
            });
          });

          //console.log( "self.value_accessControlTemperatureTriggerRule", self.value_accessControlTemperatureTriggerRule );
          self.onFinish(
            {
              uuid: self.value_accessControlUuid,
              name: self.value_accessControlName,
              enable: self.value_accessControlEnabled,
              temperature_trigger_rule: self.value_accessControlTemperatureTriggerRule,
              access_control_type: self.value_accessControlDeviceType,
              group_list: self.value_accessControlGroupList,
              remarks: self.value_accessControlRemarks,
              weekly_schedule: weeklySchedule,
              specify_time: specifyTime,
            },
            function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (success) {
                self.flag_currentSetp = 2;
              } else {
                //self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
                self.$fire({
                  text: i18n.formatter.format("Failed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            }
          );
        } else self.flag_currentSetp = 2;
      } else {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },
    accessControlNameValidator(val) {
      const self = this;
      if (self.flag_modifyMode) {
        self.flag_accessControlNamePass = true;
        return true;
      }
      if (val.replace(/\s/g, "").length == 0) {
        self.flag_accessControlNamePass = false;
      } else {
        self.flag_accessControlNamePass = val.length > 0;
      }
      if (self.flag_accessControlNamePass) {
        self.value_exstingAccessControlSettingsList.forEach((setting) => {
          if (setting.name.toLowerCase() == val.toLowerCase()) {
            self.flag_accessControlNamePass = false;
          }
        });
      }
      return self.flag_accessControlNamePass;
    },

    showOnStep(step) {
      return step == this.flag_currentSetp ? "d-block" : "d-none";
    },
    redrawOnStep(step) {
      return step == this.flag_currentSetp ? "display:block" : "height:15px;display:none";
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
    scheduler: VueScheduler,
  },
};
</script>
