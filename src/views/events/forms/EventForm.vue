<template>
  <div>
    <!-- Title & Step -->
    <div class="h1 mb-5">
      {{ getTitle }}
    </div>
    <StepProgress
      class="w-step-progress-3"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :steps="[$t('InputEventControlInfo'), $t('InputEventControlNotify'), $t('SelectSchedule'), $t('Complete')]"
      :current-step="flag_currentSetp"
      :line-thickness="param_lineThickness"
      icon-class="fa fa-check"
    />

    <CCol
      sm="12"
    >
      <div
        :class="showOnStep(flag_currentSetp)"
      >
        <keep-alive>
          <component
            :is="currentFormComponent"
            v-bind="getFormProps"
            @update:isAllPassed="handleUpdatePassStatus"
            @update:name="handleUpdateData('eventControlName', $event)"
            @update:type="handleUpdateData('eventControlType', $event)"
            @update:groupList="handleUpdateData('eventControlGroupList', $event)"
            @update:diviceGroups="handleUpdateData('eventControlDiviceGroups', $event)"
            @update:remarks="handleUpdateData('eventControlRemarks', $event)"
            @update:dataList="handleUpdateData('eventControlDataList', $event)"
            @update:selectedWeeklySchedule="handleUpdateData('eventControlSelectedWeeklySchedule', $event)"
            @update:specifiedDatetimeToShow="handleUpdateData('specifiedDatetimeToShow', $event)"
            @update:specifiedDatetimeRange="handleUpdateData('specifiedDatetimeRange', $event)"
          />
        </keep-alive>
      </div>
    </CCol>

    <!-- Prev & Next Button -->
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp === 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-else>
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="handleNext"
            :disabled="!isStepPassed(flag_currentSetp)"
          >
            {{ nextButtonName }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>

<script>
import { v4 as UUIDv4 } from 'uuid';

import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Step1Form from '@/modules/events/Step1Form.vue';
import Step2Form from '@/modules/events/Step2Form.vue';
import Step3Form from '@/modules/events/Step3Form.vue';
import Step4Form from '@/modules/events/Step4Form.vue';

export default {
  name: 'PersonForm',
  components: {
    StepProgress,
    Step1Form,
    Step2Form,
    Step3Form,
    Step4Form,
  },
  props: {
    formData: Object,
    enableAdminField: Boolean,
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,

      // vue-step-progress args
      param_cardStyle: 'height: 35rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,

      flag_currentSetp: 0,

      value_eventControlType: 'line',

      // is valid pass
      flag_step1FormPass: false,
      flag_step2FormPass: false,

      value_language: 'zh',
      value_note: '',
      value_temperatureTriggerRule: 0,

      value_eventControlEnable: true,
      value_eventControlName: '',
      value_eventControlGroupList: [],
      value_eventControlRemarks: '',
      value_eventControlDiviceGroups: [],
      value_eventControlDataList: {},

      // line
      lineForm: {
        token: '',
      },

      httpForm: {
        method: 'GET',
        https: false,
        user: '',
        pass: '',
        host: '',
        port: 80,
        url: '/',
        custom_data: '',
        data_type: 'JSON',
      },

      mailForm: {
        from: '',
        host: '',
        port: 25,
        user: '',
        pass: '',
        subject: '',
        to: [''],
        cc: [''],
        bcc: [''],
        method: 'SMTP',
        secure: false,
      },

      ioboxForm: {
        brand: '',
        model: '',
        host: '',
        port: 80,
        user: '',
        pass: '',
        iopoint: [
          {
            no: 1,
            enable: true,
            default: false,
            trigger: false,
            delay: 3,
          },
          {
            no: 2,
            enable: false,
            default: false,
            trigger: false,
            delay: 3,
          },
        ],
      },

      wiegandForm: {
        host: '',
        port: 80,
        bits: 0,
        index: 0,
        syscode: 1,
        special_card_number: '',
      },

      value_eventControlSelectedWeeklySchedule: {},
      value_specifiedDatetimeRange: [null, null],
      value_specifiedDatetimeToShow: [],

      ...this.formData,
    };
  },
  computed: {
    getTitle() {
      return this.value_mode === 'create' ? this.$t('AddPerson') : this.$t('ModifyEventControl');
    },
    currentFormComponent() {
      return `Step${this.flag_currentSetp + 1}Form`;
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('Next');
        case 2:
          return this.$t('Next');
        case 3:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
    getFormProps() {
      const defaultProps = {
        cardStyle: this.param_cardStyle,
        isAllPassed: this[`flag_step${this.flag_currentSetp}FormPass`],

        eventControlType: this.value_eventControlType,
      };

      switch (this.flag_currentSetp) {
        case 0:
          return {
            eventControlName: this.value_eventControlName,
            eventControlGroupList: [...this.value_eventControlGroupList],
            eventControlRemarks: this.value_eventControlRemarks,
            eventControlDiviceGroups: this.value_eventControlDiviceGroups,

            ...defaultProps,
          };
        case 1:
          switch (this.value_eventControlType) {
            case 'line':
              return {
                lineForm: this.lineForm,
                eventControlDataList: this.value_eventControlDataList,
                ...defaultProps,
              };
            case 'http':
              return {
                httpForm: this.httpForm,
                ...defaultProps,
              };
            case 'mail':
              return {
                mailForm: this.mailForm,
                eventControlDataList: this.value_eventControlDataList,
                ...defaultProps,
              };
            case 'iobox': {
              return {
                ioboxForm: this.ioboxForm,
                ...defaultProps,
              };
            }
            case 'wiegand': {
              return {
                wiegandForm: this.wiegandForm,
                ...defaultProps,
              };
            }
            default:
              return {
                ...defaultProps,
              };
          }
        case 2:
          return {
            eventControlSelectedWeeklySchedule: this.value_eventControlSelectedWeeklySchedule,
            specifiedDatetimeRange: this.value_specifiedDatetimeRange,
            specifiedDatetimeToShow: this.value_specifiedDatetimeToShow,
            formatDateToYYYYMMDD_HHMMSS: this.formatDateToYYYYMMDD_HHMMSS,

            ...defaultProps,
          };

        case 3:
          return null;
        default: {
          return null;
        }
      }
    },
  },
  methods: {
    handleUpdateExistData(item) {
      if (this.value_mode !== 'modify' && !Object.hasOwn(item, 'action_type')) return;

      this.value_eventControlType = item.action_type;
      this.value_eventControlName = item.name;
      this.value_enable = item.enable;
      this.value_eventControlGroupList = [...item.group_list];
      this.value_temperatureTriggerRule = item.temperature_trigger_rule;
      this.value_eventControlRemarks = item.remarks;
      this.value_eventControlDiviceGroups = [...item.divice_groups];
      this.value_eventControlDataList = structuredClone(item.data_list);
      this.value_eventControlSelectedWeeklySchedule = this.convertBackToEventControlSelectedWeeklySchedule(item.weekly_schedule);
      this.value_specifiedDatetimeToShow = this.convertBackToSpecifiedDatetimeToShow(item.specify_time);

      // language: 'en',
      // note: '',

      switch (item.action_type) {
        case 'line':
          Object.assign(this.lineForm, {
            token: item.token,
          });
          break;
        case 'http':
          Object.assign(this.httpForm, {
            method: item.method,
            https: item.https,
            user: item.user,
            pass: item.pass,
            host: item.host,
            port: item.port,
            url: item.url,
            custom_data: item.custom_data,
            data_type: item.data_type,
          });
          break;
        case 'mail':
          Object.assign(this.mailForm, {
            from: item.from,
            host: item.host,
            port: item.port,
            user: item.user,
            pass: item.pass,
            subject: item.subject,
            to: item.to,
            cc: item.cc,
            bcc: item.bcc,
            method: item.method,
            secure: item.secure,
          });
          break;
        case 'iobox':
          Object.assign(this.ioboxForm, {
            brand: item.brand,
            model: item.model,
            host: item.host,
            port: item.port,
            user: item.user,
            pass: item.pass,
            iopoint: item.iopoint,
          });
          break;
        case 'wiegand':
          Object.assign(this.wiegandForm, {
            host: item.host,
            port: item.port,
            bits: item.bits,
            index: item.index,
            syscode: item.syscode,
            special_card_number: item.special_card_number,
          });
          break;
        default:
          break;
      }
    },
    handleUpdateData(key, value) {
      if (Array.isArray(value)) {
        this[`value_${key}`] = [...value];
      } else if (typeof value === 'object') {
        this[`value_${key}`] = { ...value };
      } else {
        this[`value_${key}`] = value;
      }
    },

    convertToWeeklySchedule(selectedWeeklySchedule) {
      return {
        list: Object.entries(selectedWeeklySchedule)
          .filter(([, value]) => value != null)
          .map(([key, value]) => ({ day_of_week: parseInt(key, 10), hours_list: value })),
      };
    },
    convertBackToEventControlSelectedWeeklySchedule(weeklySchedule) {
      return weeklySchedule.list.reduce((acc, { day_of_week: dayOfWeek, hours_list: hoursList }) => {
        acc[dayOfWeek] = hoursList;
        return acc;
      }, {});
    },
    convertToSpecifyTime(specifiedDatetimeToShow) {
      return {
        list: specifiedDatetimeToShow.map((spDay) => ({
          start_time: spDay.start_time,
          end_time: spDay.end_time,
        })),
      };
    },
    convertBackToSpecifiedDatetimeToShow(specifyTime) {
      return specifyTime.list.map((item) => {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);

        return {
          uuid: UUIDv4(),
          display_string: `${this.formatDateToYYYYMMDD_HHMMSS(startTime)} ~ ${this.formatDateToYYYYMMDD_HHMMSS(endTime)}`,
          start_time: item.start_time,
          end_time: item.end_time,
        };
      });
    },
    formatDateToYYYYMMDD_HHMMSS(date) {
      const mm = date.getMonth() + 1; // getMonth() is zero-based
      const dd = date.getDate();
      const HH = date.getHours();
      const MM = date.getMinutes();
      const SS = date.getSeconds();

      return [
        `${date.getFullYear()}-`,
        `${(mm > 9 ? '' : '0') + mm}-`,
        `${(dd > 9 ? '' : '0') + dd} `,
        `${(HH > 9 ? '' : '0') + HH}:`,
        `${(MM > 9 ? '' : '0') + MM}:`,
        (SS > 9 ? '' : '0') + SS,
      ].join('');
    },

    // TODO: 判斷 name 重複
    isNotEmptyValidator(key, val) {
      console.log(key, val);
      this[`flag_${key}`] = val.replace(/\s/g, '').length > 0;
      return this[`flag_${key}`];
    },

    handleUpdatePassStatus(status) {
      switch (this.flag_currentSetp) {
        case 0:
          this.flag_step1FormPass = status;
          break;
        case 1:
          this.flag_step2FormPass = status;
          break;
        default:
          break;
      }
    },
    // 是否可以按下一步
    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.flag_step1FormPass;
        }
        case 1: {
          return this.flag_step2FormPass;
        }
        default: {
          return true;
        }
      }
    },
    // 上一步按鈕
    handlePrev() {
      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        }
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    // 下一步按鈕
    async handleNext() {
      switch (this.flag_currentSetp) {
        case 0:
        case 1:
          this.flag_currentSetp += 1;
          break;
        case 2:
          if (this.onFinish) {
            this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

            const defaultSendData = {
              action_type: this.value_eventControlType,
              name: this.value_eventControlName,
              enable: this.value_eventControlEnable,
              group_list: this.value_eventControlGroupList,
              temperature_trigger_rule: this.value_temperatureTriggerRule,
              remarks: this.value_eventControlRemarks,
              specify_time: this.convertToSpecifyTime(this.value_specifiedDatetimeToShow),
              weekly_schedule: this.convertToWeeklySchedule(this.value_eventControlSelectedWeeklySchedule),
              divice_groups: this.value_eventControlDiviceGroups,
              data_list: this.value_eventControlDataList,
              // TODO: replace mock data
              language: 'en',
              note: '',
            };

            let sendData = {};

            switch (this.value_eventControlType) {
              case 'line':
                sendData = {
                  ...this.lineForm,
                  ...defaultSendData,
                };
                break;
              case 'http':
                sendData = {
                  ...this.httpForm,
                  ...defaultSendData,
                };
                break;
              case 'mail':
                sendData = {
                  ...this.mailForm,
                  ...defaultSendData,
                };
                break;
              case 'iobox':
                sendData = {
                  ...this.ioboxForm,
                  ...defaultSendData,
                };
                break;
              case 'wiegand':
                sendData = {
                  ...this.wiegandForm,
                  ...defaultSendData,
                };
                break;
              default:
                break;
            }

            console.log('sendData :', sendData);

            this.onFinish(sendData, (err) => {
              if (this.obj_loading) this.obj_loading.hide();
              if (!err) {
                this.flag_currentSetp = 3;
              } else {
                this.$fire({
                  text: this.$t('Failed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            });
          }
          break;
        default: {
          this.$router.push({ name: this.value_returnRoutePath });
        }
      }
    },

    isOnStep(step) {
      return this.flag_currentSetp === step;
    },
    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },
  },
  created() {
    this.handleUpdateExistData(this.value_item);
  },
};
</script>
