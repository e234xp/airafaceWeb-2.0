<template>
  <div>
    <div class="h1 mb-5">{{ disp_header }}</div>
    <stepprogress class="w-step-progress-4" icon-class="fa fa-check"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness"
      :steps="[disp_inputActionRuleInfo, disp_condition, disp_action, disp_complete]"
      :current-step="flag_currentSetp"
    >
    </stepprogress>

    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_actionruleName }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_actionruleName" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="actionruleNameValidator"
                  />
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_accessType }}</th>
              <th class="h5 w-25 table-th">{{ disp_personGroup }}</th>
              <th class="h5 w-25 table-th">{{ disp_videoGroup }}</th>
              <th class="h5 w-25 table-th">{{ disp_timeRange }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_accessType" :options="[
                    { label: $t('Identified'), value: 'Identified' },
                    { label: $t('Unidentified'), value: 'Unidentified' },
                  ]"
                  @change="accessTypeChanged($event)"/>
              </td>
              <td class="table-td">
                <multiselect :class="flag_personGroupPass ? 'is-valid' : 'is-invalid'" placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedPersonGroupList"
                  :options="param_personGroupList"  @input="personGroupListOnInput"
                  :disabled="value_accessType=='Unidentified'"
                >
                </multiselect>
                <div v-if="!flag_personGroupPass" class="invalid-feedback">{{disp_noEmptyNorSpaceOnly}}</div>
              </td>
              <td class="table-td">
                <multiselect :class="flag_videoGroupPass ? 'is-valid' : 'is-invalid'" placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedVideoGroupList"
                  :options="param_vedioGroupList" @input="videoGroupListOnInput"
                >
                </multiselect>
                <div v-if="!flag_videoGroupPass" class="invalid-feedback">{{disp_noEmptyNorSpaceOnly}}</div>
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_timeRange" :options="param_timeRangeList" required
                :invalid-feedback="disp_noEmptyNorSpaceOnly"
                :isValid="timeRangeValidator" />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_ioBoxGroup }}</th>
              <th class="h5 w-25 table-th">{{ disp_weigandGroup }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedIoBoxList"
                  :options="param_ioBoxList"
                >
                </multiselect>
              </td>
              <td class="table-td">
                <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedWiegandList"
                  :options="param_wiegandList"
                >
                </multiselect>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_lineNotify }}</th>
              <th class="h5 w-25 table-th">{{ disp_mailNotify }}</th>
              <th class="h5 w-25 table-th">{{ disp_httpNotify }}</th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedLineNotifyList"
                  :options="param_lineNotifyList"
                >
                </multiselect>
              </td>
              <td class="table-td">
                <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedMailNotifyList"
                  :options="param_mailNotifyList"
                >
                </multiselect>
              </td>
              <td class="table-td">
                <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
                  :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
                  v-model="value_selectedHttpNotifyList"
                  :options="param_httpNotifyList"
                >
                </multiselect>
              </td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(3)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px"></div>
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ disp_complete }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev">
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev">
            {{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary fz-lg btn-w-normal" @click="clickOnNext"
            :disabled="
            flag_currentSetp == 0 ?
              !(flag_actionruleNamePass) :
              flag_currentSetp == 1 ?
                !(flag_personGroupPass && flag_videoGroupPass && flag_timeRangePass) :
                false
              ">
            {{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import i18n from '@/i18n';

import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

const defaultlState = () => ({
  obj_loading: null,

  param_cardStyle: 'height: 29rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,
  param_vedioGroupListValue: [],
  param_vedioGroupList: [],

  param_personGroupListValue: [],
  param_personGroupList: [],
  param_timeRangeListValue: [],
  param_timeRangeList: [],
  param_ioBoxListValue: [],
  param_ioBoxList: [],
  param_wiegandListValue: [],
  param_wiegandList: [],
  param_lineNotifyListValue: [],
  param_lineNotifyList: [],
  param_mailNotifyListValue: [],
  param_mailNotifyList: [],
  param_httpNotifyListValue: [],
  param_httpNotifyList: [],

  disp_header: i18n.formatter.format('ActionRule'),
  disp_inputActionRuleInfo: i18n.formatter.format('ActionRuleInfo'),
  disp_condition: i18n.formatter.format('Condition'),
  disp_action: i18n.formatter.format('Action'),
  disp_complete: i18n.formatter.format('Complete'),

  disp_select: i18n.formatter.format('Select'),
  disp_selected: i18n.formatter.format('Selected'),
  disp_deselect: i18n.formatter.format('Deselect'),

  disp_actionruleName: i18n.formatter.format('ActionRuleName'),
  disp_accessType: i18n.formatter.format('AccessType'),
  disp_videoGroup: i18n.formatter.format('VideoGroup'),
  disp_personGroup: i18n.formatter.format('PersonGroup'),
  disp_timeRange: i18n.formatter.format('TimeRange'),

  disp_ioBoxGroup: i18n.formatter.format('IOboxes'),
  disp_weigandGroup: i18n.formatter.format('Wiegandboxs'),
  disp_outputGroup: i18n.formatter.format('OutputGeoup'),
  disp_lineNotify: i18n.formatter.format('LineNotify'),
  disp_mailNotify: i18n.formatter.format('MailNotify'),
  disp_httpNotify: i18n.formatter.format('HttpNotify'),

  disp_recurrent: i18n.formatter.format('Recurrent'),
  disp_specificCard: i18n.formatter.format('SpecialCardNumber'),

  disp_AM: i18n.formatter.format('AM'),
  disp_PM: i18n.formatter.format('PM'),
  disp_timeTitle: i18n.formatter.format('Time'),
  disp_weekTitle: i18n.formatter.format('Day'),
  disp_weekDays: [
    i18n.formatter.format('Sun'),
    i18n.formatter.format('Mon'),
    i18n.formatter.format('Tue'),
    i18n.formatter.format('Wed'),
    i18n.formatter.format('Thu'),
    i18n.formatter.format('Fri'),
    i18n.formatter.format('Sat'),
  ],
  disp_hours: [
    '00 00', '00 30', '01 00', '01 30', '02 00', '02 30', '03 00', '03 30', '04 00', '04 30',
    '05 00', '05 30', '06 00', '06 30', '07 00', '07 30', '08 00', '08 30', '09 00', '09 30',
    '10 00', '10 30', '11 00', '11 30', '12 00', '12 30', '13 00', '13 30', '14 00', '14 30',
    '15 00', '15 30', '16 00', '16 30', '17 00', '17 30', '18 00', '18 30', '19 00', '19 30',
    '20 00', '20 30', '21 00', '21 30', '22 00', '22 30', '23 00', '23 30',
  ],
  // disp_dragTips: ' ',
  // disp_reset: i18n.formatter.format('Reset'),

  disp_fields: i18n.formatter.format('Fields'),
  disp_note: i18n.formatter.format('Note'),

  disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),
  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),

  flag_currentSetp: 0,

  value_uuid: '',
  value_actionruleName: '',
  value_accessType: 'Identified',
  value_selectedVideoGroupList: [],
  value_selectedPersonGroupList: [],
  value_timeRange: '',
  value_selectedIoBoxList: [],
  value_selectedWiegandList: [],

  value_selectedOutputGroupList: [],
  value_selectedLineNotifyList: [],
  value_selectedMailNotifyList: [],
  value_selectedHttpNotifyList: [],

  flag_actionruleNamePass: false,
  flag_videoGroupPass: false,
  flag_personGroupPass: false,
  flag_timeRangePass: false,
});

export default {
  name: 'ActionRuleForm',
  props: {
    formData: { type: Object, default: () => { } },
    modifyMode: Boolean,
    onFinish: { type: Function, default: () => null },
  },
  data() {
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  async created() {
    const self = this;

    // Video Group
    let ret = await self.$globalFindVideoDeviceGroups('', 0, 1000);
    if (!ret.error) {
      self.param_vedioGroupList = [];
      for (let i = 0; i < ret.data.result.length; i += 1) {
        self.param_vedioGroupListValue.push({ value: ret.data.result[i].uuid, label: ret.data.result[i].name });
        self.param_vedioGroupList.push(ret.data.result[i].name);
      }
    }

    // Person Group
    ret = await self.$globalGetGroupList();
    if (!ret.error) {
      self.param_personGroupList = [];

      for (let i = 0; i < ret.group_list.length; i += 1) {
        self.param_personGroupListValue.push({ value: ret.group_list[i].uuid, label: ret.group_list[i].name });
        self.param_personGroupList.push(ret.group_list[i].name);
      }
    }

    // Schedule
    ret = await self.$globalGetScheduleList();
    if (!ret.error) {
      self.param_timeRangeList = [];
      for (let i = 0; i < ret.data.data_list.length; i += 1) {
        self.param_timeRangeListValue.push({ value: ret.data.data_list[i].uuid, label: ret.data.data_list[i].name });
        self.param_timeRangeList.push(ret.data.data_list[i].name);

        if (i === 0) self.value_timeRange = ret.data.data_list[i].name;
      }
    }

    // ioBox
    ret = await self.$globalFindIoBoxes('', 0, 3000);
    if (!ret.error) {
      self.param_ioBoxListValue = [];
      self.param_ioBoxList = [];
      for (let i = 0; i < ret.data.list.length; i += 1) {
        self.param_ioBoxListValue.push({ value: ret.data.list[i].uuid, label: `${ret.data.list[i].name} DO#1`, idx: 1 });
        self.param_ioBoxList.push(`${ret.data.list[i].name} DO#1`);

        self.param_ioBoxListValue.push({ value: ret.data.list[i].uuid, label: `${ret.data.list[i].name} DO#2`, idx: 2 });
        self.param_ioBoxList.push(`${ret.data.list[i].name} DO#2`);
      }
    }

    // Wiegand
    ret = await self.$globalFindWiegandConverters('', 0, 3000);
    if (!ret.error) {
      self.param_wiegandListValue = [];
      self.param_wiegandList = [];
      for (let i = 0; i < ret.data.list.length; i += 1) {
        self.param_wiegandListValue.push({ value: ret.data.list[i].uuid, label: ret.data.list[i].name, idx: 1 });
        self.param_wiegandList.push(`${ret.data.list[i].name}`);

        self.param_wiegandListValue.push({ value: ret.data.list[i].uuid, label: `${ret.data.list[i].name} (${self.disp_specificCard})`, idx: 2 });
        self.param_wiegandList.push(`${ret.data.list[i].name} (${self.disp_specificCard})`);
      }
    }

    // Line
    ret = await self.$globalGetLineNotifyList();
    if (!ret.error) {
      self.param_lineNotifyList = [];
      for (let i = 0; i < ret.data.data_list.length; i += 1) {
        self.param_lineNotifyListValue.push({ value: ret.data.data_list[i].uuid, label: ret.data.data_list[i].name });
        self.param_lineNotifyList.push(ret.data.data_list[i].name);
      }
    }

    // Mail
    ret = await self.$globalGetMailNotifyList();
    if (!ret.error) {
      self.param_mailNotifyList = [];
      for (let i = 0; i < ret.data.data_list.length; i += 1) {
        self.param_mailNotifyListValue.push({ value: ret.data.data_list[i].uuid, label: ret.data.data_list[i].name });
        self.param_mailNotifyList.push(ret.data.data_list[i].name);
      }
    }

    // Http
    ret = await self.$globalGetHttpNotifyList();
    if (!ret.error) {
      self.param_httpNotifyList = [];
      for (let i = 0; i < ret.data.data_list.length; i += 1) {
        self.param_httpNotifyListValue.push({ value: ret.data.data_list[i].uuid, label: ret.data.data_list[i].name });
        self.param_httpNotifyList.push(ret.data.data_list[i].name);
      }
    }

    self.updateSettings();
  },
  updated() { },
  methods: {
    accessTypeChanged(evt) {
      const self = this;
      const type = evt.target.value;
      console.log('accessTypeChanged', type);

      if (type === 'Identified') {
        self.personGroupListOnInput(self.value_selectedPersonGroupList);
      } else {
        self.flag_personGroupPass = true;
      }
    },

    videoGroupListOnInput(value) {
      if (value.length >= 1) {
        this.flag_videoGroupPass = true;
      } else {
        this.flag_videoGroupPass = false;
      }
    },

    personGroupListOnInput(value) {
      if (value.length >= 1) {
        this.flag_personGroupPass = true;
      } else {
        this.flag_personGroupPass = false;
      }
    },

    async updateSettings() {
      const self = this;

      self.value_uuid = self.value_settingitem.uuid;
      self.value_actionruleName = self.value_settingitem.name || `Event Rule-${(self.value_allRecords.length + 1)}`;

      if (self.value_settingitem.condition) {
        self.value_accessType = self.value_settingitem.condition.access_type || 'Identified';

        // Video Group
        self.value_selectedVideoGroupList = self.value_settingitem.condition.video_device_groups.map((item) => {
          const uuid = self.param_vedioGroupListValue.find((ii) => ii.value === item);
          return uuid.label;
        });
        self.videoGroupListOnInput(self.value_selectedVideoGroupList);

        // Person Group
        self.value_selectedPersonGroupList = self.value_settingitem.condition.groups.map((item) => {
          const uuid = self.param_personGroupListValue.find((ii) => ii.value === item);
          return uuid.label;
        });
        self.personGroupListOnInput(self.value_selectedPersonGroupList);

        // Schedule
        const ret = self.param_timeRangeListValue.find((ii) => ii.value === self.value_settingitem.condition.schedule);
        self.value_timeRange = ret.label;
      }

      if (self.value_settingitem.actions) {
        // IO Box
        self.value_selectedIoBoxList = self.value_settingitem.actions.ioboxes.map((item) => {
          const uuid = self.param_ioBoxListValue.find((ii) => ii.value === item.uuid && ii.idx === item.iopoint);
          return uuid.label;
        });

        // Wiegand
        self.value_selectedWiegandList = self.value_settingitem.actions.wiegand_converters.map((item) => {
          const uuid = self.param_wiegandListValue.find((ii) => ii.value === item.uuid && ii.idx === (item.is_special_card_number ? 2 : 1));
          return uuid.label;
        });

        // Line
        self.value_selectedLineNotifyList = self.value_settingitem.actions.line_commands.map((item) => {
          const uuid = self.param_lineNotifyListValue.find((ii) => ii.value === item);
          return uuid.label;
        });

        // Mail
        self.value_selectedMailNotifyList = self.value_settingitem.actions.email_commands.map((item) => {
          const uuid = self.param_mailNotifyListValue.find((ii) => ii.value === item);
          return uuid.label;
        });

        // Http
        self.value_selectedHttpNotifyList = self.value_settingitem.actions.http_commands.map((item) => {
          const uuid = self.param_httpNotifyListValue.find((ii) => ii.value === item);
          return uuid.label;
        });
      }
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.disp_next;
        case 2:
          return this.disp_next;
        case 3:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
    clickOnPrev() {
      const self = this;

      if (self.flag_currentSetp === 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
        } else self.updateSettings();
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp -= 1;
    },

    // DateFormatter(date) {
    //   return `${date.getFullYear()}-${(`00${date.getMonth() + 1}`).slice(-2)}-${(`00${date.getDate()}`).slice(-2)}`;
    // },

    clickOnNext() {
      const self = this;

      if (self.flag_currentSetp === 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        self.flag_currentSetp = 2;
      } else if (self.flag_currentSetp === 2) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

        // Video Group
        const localSelectedVideoGroupList = self.value_selectedVideoGroupList.map((item) => {
          const uuid = self.param_vedioGroupListValue.find((ii) => ii.label === item);
          return uuid.value;
        });

        // Person Group
        const localSelectedPersonGroupList = self.value_selectedPersonGroupList.map((item) => {
          const uuid = self.param_personGroupListValue.find((ii) => ii.label === item);
          return uuid.value;
        });

        // Schedule
        const ret = self.param_timeRangeListValue.find((ii) => ii.label === self.value_timeRange);
        const localTimeRange = ret.value;

        // IO Box
        const localSelectedIoBoxList = self.value_selectedIoBoxList.map((item) => {
          const uuid = self.param_ioBoxListValue.find((ii) => ii.label === item);
          return {
            uuid: uuid.value,
            iopoint: uuid.idx,
          };
        });

        // Wiegand
        const localSelectedWiegandList = self.value_selectedWiegandList.map((item) => {
          const uuid = self.param_wiegandListValue.find((ii) => ii.label === item);
          return {
            uuid: uuid.value,
            is_special_card_number: uuid.idx === 2,
          };
        });

        // Line
        const localSelectedLineNotifyList = self.value_selectedLineNotifyList.map((item) => {
          const uuid = self.param_lineNotifyListValue.find((ii) => ii.label === item);
          return uuid.value;
        });

        // Mail
        const localSelectedMailNotifyList = self.value_selectedMailNotifyList.map((item) => {
          const uuid = self.param_mailNotifyListValue.find((ii) => ii.label === item);
          return uuid.value;
        });

        // Http
        const localSelectedHttpNotifyList = self.value_selectedHttpNotifyList.map((item) => {
          const uuid = self.param_httpNotifyListValue.find((ii) => ii.label === item);
          return uuid.value;
        });

        const settingData = {
          uuid: self.value_uuid ? self.value_uuid : undefined,
          name: self.value_actionruleName,
          enable: true,
          condition: {
            access_type: self.value_accessType,
            video_device_groups: localSelectedVideoGroupList || [],
            groups: localSelectedPersonGroupList || [],
            schedule: localTimeRange,
          },
          actions: {
            ioboxes: localSelectedIoBoxList,
            wiegand_converters: localSelectedWiegandList,
            line_commands: localSelectedLineNotifyList || [],
            email_commands: localSelectedMailNotifyList || [],
            http_commands: localSelectedHttpNotifyList || [],
          },
        };

        if (self.onFinish) {
          self.onFinish(
            settingData,
            (success, result) => {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message === 'ok') {
                self.flag_currentSetp = 3;
              } else {
                self.$fire({
                  text: i18n.formatter.format('Failed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            },
          );
        } else {
          if (self.obj_loading) self.obj_loading.hide();
          self.flag_currentSetp = 1;
        }
      } else {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },

    actionruleNameValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_actionruleNamePass = false;
      } else {
        this.flag_actionruleNamePass = val.length > 0;
      }

      return this.flag_actionruleNamePass;
    },

    timeRangeValidator(val) {
      if (!val) {
        this.flag_timeRangePass = false;
      } else {
        this.flag_timeRangePass = true;
      }
      return this.flag_timeRangePass;
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
  },
};
</script>
