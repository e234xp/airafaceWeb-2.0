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
          <!-- <component
            :is="currentFormComponent"
            v-bind="getFormProps"
            @update:isAllPassed="handleUpdatePassStatus"
            @update:eventControlType="handleUpdateData($event, 'eventControlType')"
            @update:eventControlGroupList="handleUpdateData($event, 'eventControlGroupList')"
          /> -->

          <component
            :is="currentFormComponent"
            v-bind="getFormProps"
            @update:isAllPassed="handleUpdatePassStatus"
            @update:eventControlName="handleUpdateData('eventControlName', $event)"
            @update:eventControlType="handleUpdateData('eventControlType', $event)"
            @update:eventControlGroupList="handleUpdateData('eventControlGroupList', $event)"
            @update:eventControlRemarks="handleUpdateData('eventControlRemarks', $event)"

            @update:eventLineAccessToken="handleUpdateData('eventLineAccessToken', $event)"

            @update:eventHttpHostAddress="handleUpdateData('eventHttpHostAddress', $event)"
            @update:eventHttpEnabledSSL="handleUpdateData('eventHttpEnabledSSL', $event)"

            @update:eventSMTPMethod="handleUpdateData('eventSMTPMethod', $event)"
            @update:eventSMTPHostAddress="handleUpdateData('eventSMTPHostAddress', $event)"
            @update:eventSMTPPort="handleUpdateData('eventSMTPPort', $event)"
            @update:eventSMTPEnabledSecure="handleUpdateData('eventSMTPEnabledSecure', $event)"
            @update:eventSMTPUser="handleUpdateData('eventSMTPUser', $event)"
            @update:eventSMTPPass="handleUpdateData('eventSMTPPass', $event)"
            @update:eventSMTPSender="handleUpdateData('eventSMTPSender', $event)"
            @update:eventSMTPSubject="handleUpdateData('eventSMTPSubject', $event)"
            @update:eventSMTPTo="handleUpdateData('eventSMTPTo', $event)"
            @update:eventSMTPCC="handleUpdateData('eventSMTPCC', $event)"
            @update:eventSMTPBCC="handleUpdateData('eventSMTPBCC', $event)"

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

      // step1 data
      value_eventControlName: '',
      value_eventControlGroupList: [],
      value_eventControlRemarks: '',

      // step2 data
      // line
      value_eventLineAccessToken: '',
      value_language: 'zh',
      value_note: '',
      // NOTE: what this ?
      value_temperatureTriggerRule: 0,

      // http
      value_eventHttpHostAddress: '',
      value_eventHttpEnabledSSL: false,
      value_eventHttpUser: '',
      value_eventHttpPass: '',
      value_eventHttpPort: 80,

      // mail
      value_eventSMTPMethod: 'SMTP',
      value_eventSMTPHostAddress: '',
      value_eventSMTPPort: 25,
      value_eventSMTPEnabledSecure: false,
      value_eventSMTPUser: '',
      value_eventSMTPPass: '',
      value_eventSMTPSender: '',
      value_eventSMTPSubject: '',
      value_eventSMTPTo: '',
      value_eventSMTPCC: '',
      value_eventSMTPBCC: '',

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

      const lineProps = {
        eventLineAccessToken: this.value_eventLineAccessToken,
      };

      const httpProps = {
        eventHttpHostAddress: this.value_eventHttpHostAddress,
        eventHttpEnabledSSL: this.value_eventHttpEnabledSSL,
        eventHttpUser: this.value_eventHttpUser,
        eventHttpPass: this.value_eventHttpPass,
        eventHttpPort: this.value_eventHttpPort,
      };

      const mailProps = {
        eventSMTPMethod: this.value_eventSMTPMethod,
        eventSMTPHostAddress: this.value_eventSMTPHostAddress,
        eventSMTPPort: this.value_eventSMTPPort,
        eventSMTPEnabledSecure: this.value_eventSMTPEnabledSecure,
        eventSMTPUser: this.value_eventSMTPUser,
        eventSMTPPass: this.value_eventSMTPPass,
        eventSMTPSender: this.value_eventSMTPSender,
        eventSMTPSubject: this.value_eventSMTPSubject,
        eventSMTPTo: this.value_eventSMTPTo,
        eventSMTPCC: this.value_eventSMTPCC,
        eventSMTPBCC: this.value_eventSMTPBCC,
      };

      switch (this.flag_currentSetp) {
        case 0:
          return {
            eventControlName: this.value_eventControlName,
            eventControlGroupList: this.value_eventControlGroupList,
            eventControlRemarks: this.eventControlRemarks,

            ...defaultProps,
          };
        case 1:
          switch (this.value_eventControlType) {
            case 'line':
              return {
                ...lineProps,
                ...defaultProps,
              };
            case 'http':
              return {
                ...httpProps,
                ...defaultProps,
              };
            case 'mail':
              return {
                ...mailProps,
                ...defaultProps,
              };
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
          return {
            ...defaultProps,
          };

        default: {
          return {};
        }
      }
    },
  },
  methods: {
    // global valid
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
    handleUpdateData(key, value) {
      if (Array.isArray(value)) {
        this[`value_${key}`] = [...value];
      } else if (typeof value === 'object') {
        this[`value_${key}`] = { ...value };
      } else {
        this[`value_${key}`] = value;
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
      console.log(this.value_returnRoutePath);
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

            // TEST: mock data
            const data_list = {
              display_image: '',
              foreHead_temperature: false,
              is_high_temperature: false,
              show_identity: true,
              verified_timestamp: false,
              person: {
                card_number: false,
                department: false,
                email: false,
                extension_number: false,
                group_list: false,
                id: true,
                name: true,
                phone_number: false,
                remarks: false,
                title: false,
              },
            };

            const defaultSendData = {
              action_type: this.value_eventControlType,
              name: this.value_eventControlName,
              enable: true,
              group_list: this.value_eventControlGroupList,
              temperature_trigger_rule: this.value_temperatureTriggerRule,
              remarks: this.value_eventControlRemarks,
              specify_time: specifyTime,
              weekly_schedule: weeklySchedule,
              // TODO: replace mock data
              language: 'en',
              note: '',
              divice_groups: [
                'cdc97c86-5f06-4504-914e-87172af202c5',
                'c07b60a3-2380-4f90-ad8a-464287a8dbe2',
              ],
            };

            const lineSendData = {
              token: this.value_eventLineAccessToken,
              data_list,
            };

            const mailSendData = {
              from: this.value_eventSMTPSender,
              host: this.value_eventSMTPHostAddress,
              port: this.value_eventSMTPPort,
              user: this.value_eventSMTPUser,
              pass: this.value_eventSMTPPass,
              subject: this.value_eventSMTPSubject,
              to: [this.value_eventSMTPTo],
              cc: [this.value_eventSMTPCC],
              bcc: [this.value_eventSMTPBCC],
              method: this.value_eventSMTPMethod,
              secure: this.value_eventSMTPEnabledSecure,
              data_list,
            };

            let sendData = {};

            switch (this.value_eventControlType) {
              case 'line':
                sendData = {
                  ...lineSendData,
                  ...defaultSendData,
                };
                break;
              case 'mail':
                sendData = {
                  ...mailSendData,
                  ...defaultSendData,
                };
                break;
              default:
                break;
            }

            this.onFinish(sendData, (success, result) => {
              console.log('success :', success);
              console.log('result :', result);
              if (this.obj_loading) this.obj_loading.hide();
              if (success) {
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
