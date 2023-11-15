<template>
  <div>
    <div class="h1 mb-5">{{ disp_header }}</div>
    <stepprogress class="w-step-progress-3" icon-class="fa fa-check"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness"
      :steps="[disp_inputScheduleInfo, disp_timerange, disp_complete]"
      :current-step="flag_currentSetp"
    >
    </stepprogress>

    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_scheduleName }}</th>
              <th class="h5 w-25 table-th">{{ disp_recurrent }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_scheduleName" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="scheduleNameValidator"
                  />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_type"
                  :options="[
                    { value: 'recurrent', label: $t('ScheduleRecurrent') },
                    { value: 'non-recurrent', label: $t('ScheduleNonrecurrent') }
                  ]" />
              </td>
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
              <th class="h5 w-100 table-th">{{ disp_timerange }}</th>
            </tr>
            <tr class="table-tr" v-show="value_type=='recurrent'">
              <td class="table-td">
                <scheduler
                  v-model="value_recurrentSchedule"
                  :multiple="true"
                  :footer="false"
                />
              </td>
            </tr>

            <tr class="table-tr" v-show="value_type=='non-recurrent'">
              <td class="table-td">
                <date-picker
                    :lang="this.$globalDatePickerLanguage"
                    v-model="value_specifiedDate"
                    type="date"
                    range
                  ></date-picker><p></p>
                <scheduler
                  v-model="value_nonrecurrentSchedule"
                  :multiple="true"
                  :footer="false"
                  :ignoreWeekend="true"
                />
              </td>
            </tr>

          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(2)" :style="param_cardStyle">
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
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev">
            {{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary fz-lg btn-w-normal" @click="clickOnNext"
            :disabled="!(flag_scheduleNamePass)">
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

import VueScheduler from '@duoa/vue-scheduler';
import '@/airacss/vue-scheduler.css';

const defaultlState = () => ({
  obj_loading: null,

  param_cardStyle: 'height: 29rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,

  disp_header: i18n.formatter.format('Schedule'),
  disp_inputScheduleInfo: i18n.formatter.format('ScheduleInfo'),
  disp_timerange: i18n.formatter.format('TimeRange'),
  disp_complete: i18n.formatter.format('Complete'),

  disp_scheduleName: i18n.formatter.format('ScheduleName'),
  disp_recurrent: i18n.formatter.format('ScheduleType'),

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
  value_scheduleName: '',
  value_type: 'recurrent',
  value_recurrentSchedule: {},

  value_specifiedDate: [null, null],
  value_nonrecurrentSchedule: {},

  value_note: '',

  flag_scheduleNamePass: false,
});

export default {
  name: 'ScheduleForm',
  props: {
    formData: { type: Object, default: () => { } },
    // enableAdminField: Boolean,
    modifyMode: Boolean,
    // canModify: { type: Function, default: () => null },
    onFinish: { type: Function, default: () => null },
  },
  data() {
    // return Object.assign({}, defaultlState(), this.formData);
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
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
      // DRAG_TIP: self.disp_dragTips,
      // RESET: self.disp_reset,
    });

    self.updateSettings();
  },
  updated() { },
  methods: {
    async updateSettings() {
      const self = this;

      self.value_uuid = self.value_settingitem.uuid;
      self.value_scheduleName = self.value_settingitem.name || '';
      self.value_type = self.value_settingitem.type || 'recurrent';

      const { times } = self.value_settingitem;
      if (times) {
        if (self.value_type === 'recurrent') {
          Object.entries(times).forEach((key) => {
            self.value_recurrentSchedule[key[0]] = self.parameterToSchedule(key[1]);
          });
        } else {
          const startDate = self.value_settingitem.start_date;
          const endDate = self.value_settingitem.end_date;

          if (startDate && endDate) {
            self.value_specifiedDate = [new Date(startDate), new Date(endDate)];
          }

          self.value_nonrecurrentSchedule[1] = self.parameterToSchedule(times);
        }
      }
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.disp_next;
        case 2:
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

    DateFormatter(date) {
      return `${date.getFullYear()}-${(`00${date.getMonth() + 1}`).slice(-2)}-${(`00${date.getDate()}`).slice(-2)}`;
    },

    scheduleToParameter(sch) {
      const sche = [];

      for (let j = 0; j < sch.length; j += 1) {
        sche.push(sch[j] / 2);
      }

      return sche;
    },

    parameterToSchedule(sch) {
      const sche = [];

      for (let j = 0; j < sch.length; j += 1) {
        sche.push(sch[j] * 2);
      }

      return sche;
    },

    clickOnNext() {
      const self = this;

      if (self.flag_currentSetp === 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

        let settingData = {};

        if (self.value_type !== 'recurrent') {
          let schedule = [];
          const sch = self.value_nonrecurrentSchedule['1'];
          if (sch != null) {
            schedule = self.scheduleToParameter(sch);
          }

          if (self.value_specifiedDate.length === 2) {
            let idx = 0;
            const startDate = self.value_specifiedDate[idx];
            idx = 1;
            const endDate = self.value_specifiedDate[idx];

            settingData = {
              uuid: self.value_uuid ? self.value_uuid : undefined,
              name: self.value_scheduleName,
              enable: true,
              type: self.value_type,
              start_date: self.DateFormatter(startDate),
              end_date: self.DateFormatter(endDate),
              times: schedule,
            };
          }
        } else {
          const weeklySchedule = {};
          for (let i = 0; i < 7; i += 1) {
            const sch = self.value_recurrentSchedule[i.toString()];
            let sche = [];
            if (sch != null) {
              sche = self.scheduleToParameter(sch);
              weeklySchedule[i] = sche;
            }
          }

          settingData = {
            uuid: self.value_uuid ? self.value_uuid : undefined,
            name: self.value_scheduleName,
            type: self.value_type,
            times: weeklySchedule,
          };
        }

        if (self.onFinish) {
          self.onFinish(
            settingData,
            (success, result) => {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message === 'ok') {
                self.flag_currentSetp = 2;
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

    scheduleNameValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_scheduleNamePass = false;
      } else {
        this.flag_scheduleNamePass = val.length > 0;
      }

      return this.flag_scheduleNamePass;
    },
  },
  components: {
    stepprogress: StepProgress,
    scheduler: VueScheduler,
  },
};
</script>
