<template>
  <div>
    <!-- Title & Step -->
    <div class="h1 mb-5">
      {{ $t('AddPerson') }}
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
            @update:eventControlName="handleUpdateData('eventControlName', $event)"
            @update:eventControlType="handleUpdateData('eventControlType', $event)"
            @update:eventControlGroupList="handleUpdateData('eventControlGroupList', $event)"
            @update:diviceGroups="handleUpdateData('diviceGroups', $event)"
            @update:eventControlRemarks="handleUpdateData('eventControlRemarks', $event)"
            @update:eventControlSelectedWeeklySchedule="handleUpdateData('eventControlSelectedWeeklySchedule', $event)"

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
        <!-- <div v-if="flag_currentSetp === 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div> -->
        <div v-if="flag_currentSetp !== 3">
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
      // NOTE: what this ?
      value_temperatureTriggerRule: 0,

      // step1 data
      value_eventControlName: '',
      value_eventControlGroupList: [],
      value_eventControlRemarks: '',
      value_diviceGroups: [],

      // step2 data
      data_list: {},

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

      // step3 data
      value_eventControlSelectedWeeklySchedule: {},
      value_specifiedDatetimeRange: [null, null],
      value_specifiedDatetimeToShow: [],

      ...this.formData,
    };
  },
  computed: {
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
            eventControlGroupList: this.value_eventControlGroupList,
            eventControlRemarks: this.eventControlRemarks,
            diviceGroups: this.value_diviceGroups,

            ...defaultProps,
          };
        case 1:
          switch (this.value_eventControlType) {
            case 'line':
              return {
                lineForm: this.lineForm,
                data: this.data_list,
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
    handleUpdateData(key, value) {
      if (Array.isArray(value)) {
        this[`value_${key}`] = [...value];
      } else if (typeof value === 'object') {
        this[`value_${key}`] = { ...value };
      } else {
        this[`value_${key}`] = value;
      }
    },

    // TODO: 判斷 name 重複
    isNotEmptyValidator(key, val) {
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

        case 2: {
          return true;
        }

        case 3: {
          return true;
        }

        default: {
          return false;
        }
      }
    },
    // 上一步按鈕
    handlePrev() {
      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        } else this.updateSettings();
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;

      // if (this.flag_currentSetp > 0) {
      //   this.flag_currentSetp -= 1;
      //   return;
      // }

      // if (this.value_returnRoutePath.length === 0) return;

      // this.$router.go(-1);
      // this.$router.push({ name: this.value_returnRoutePath });
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

            const weeklySchedule = { list: [] };
            for (let i = 0; i < 7; i += 1) {
              const sch = this.value_eventControlSelectedWeeklySchedule[i.toString()];
              if (sch != null) {
                weeklySchedule.list.push({
                  day_of_week: i,
                  hours_list: sch,
                });
              }
            }

            const specifyTime = { list: [] };
            this.value_specifiedDatetimeToShow.forEach((spDay) => {
              specifyTime.list.push({
                start_time: spDay.start_time,
                end_time: spDay.end_time,
              });
            });

            const defaultSendData = {
              action_type: this.value_eventControlType,
              name: this.value_eventControlName,
              enable: true,
              group_list: this.value_eventControlGroupList,
              temperature_trigger_rule: this.value_temperatureTriggerRule,
              remarks: this.value_eventControlRemarks,
              specify_time: specifyTime,
              weekly_schedule: weeklySchedule,
              divice_groups: this.value_diviceGroups,
              // TODO: replace mock data
              language: 'en',
              note: '',
              data_list: this.data_list,
            };

            console.log(this.data_list);

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

            this.onFinish(sendData, (success, result) => {
              if (this.obj_loading) this.obj_loading.hide();
              if (success) {
                console.log('success :', success);
                console.log('result :', result);
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
};
</script>
