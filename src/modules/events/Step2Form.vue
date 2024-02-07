<template>
  <component
    :is="currentFormComponent"
    v-bind="getFormProps"
    @update:dataList="newDataList => $emit('update:dataList', newDataList)"
  />
</template>

<script>
import {
  checkPort,
  checkEmail,
  checkIpAddr,
  checkDelay,
} from '@/utils/validate';
import i18n from '@/i18n';
import Step2FormLine from './Step2FormLine.vue';
import Step2FormHttp from './Step2FormHttp.vue';
import Step2FormMail from './Step2FormMail.vue';
import Step2FormIobox from './Step2FormIO.vue';
import Step2FormWiegand from './Step2FormWiegand.vue';

export default {
  name: 'Step2Form',
  components: {
    Step2FormLine,
    Step2FormHttp,
    Step2FormMail,
    Step2FormIobox,
    Step2FormWiegand,
  },
  props: {
    isAllPassed: {
      type: Boolean,
      required: true,
      default: false,
    },
    cardStyle: {
      type: String,
      required: true,
      default: '',
    },
    eventControlType: {
      type: String,
      default: 'line',
    },
    eventControlDataList: {
      type: Object,
      default: () => ({}),
    },
    lineForm: {
      type: Object,
      default: () => ({}),
    },
    httpForm: {
      type: Object,
      default: () => ({}),
    },
    mailForm: {
      type: Object,
      defauljt: () => ({}),
    },
    ioboxForm: {
      type: Object,
      default: () => ({}),
    },
    wiegandForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: [
    'update:isAllPassed',
  ],
  data() {
    return {
      dataFields: [
        {
          label: 'foreHead_temperature',
          value: 'foreHead_temperature',
        },
        {
          label: 'HighTemperatureOnly',
          value: 'is_high_temperature',
        },
        {
          label: 'show_identity',
          value: 'show_identity',
        },
        {
          label: 'VerifiedTimestamp',
          value: 'verified_timestamp',
        },
        {
          label: 'face_image',
          value: 'captured',
        },
        {
          label: 'register_image',
          value: 'register',
        },
        {
          label: 'display_image',
          value: 'display',
        },
      ],
      personFields: [
        {
          label: 'card_number',
          value: 'person.card_number',
        },
        {
          label: 'Department',
          value: 'person.department',
        },
        {
          label: 'HighTemperatureOnly',
          value: 'person.email',
        },
        {
          label: 'ExtensionNumber',
          value: 'person.extension_number',
        },
        {
          label: 'Group',
          value: 'person.group_list',
        },
        {
          label: 'PersonId',
          value: 'person.id',
        },
        {
          label: 'PersonName',
          value: 'person.name',
        },
        {
          label: 'PhoneNumber',
          value: 'person.phone_number',
        },
        {
          label: 'Remarks',
          value: 'person.remarks',
        },
        {
          label: 'JobTitle',
          value: 'person.title',
        },
      ],

      lineFormPass: {
        token: false,
      },

      httpFormPass: {
        host: false,
        user: false,
        pass: false,
      },

      mailFormPass: {
        host: false,
        port: false,
        user: false,
        pass: false,
        to: false,
        cc: false,
        bcc: false,
      },

      ioboxFormPass: {
        host: false,
        port: false,
        user: false,
        pass: false,
        delay: false,
      },

      wiegandFormPass: {
        host: false,
        port: false,
        index: false,
        syscode: false,
      },
    };
  },
  computed: {
    currentFormComponent() {
      return `Step2Form${this.eventControlType.charAt(0).toUpperCase() + this.eventControlType.slice(1)}`;
    },
    getFormProps() {
      switch (this.eventControlType) {
        case 'line':
          return {
            isNotEmptyValidator: this.isNotEmptyValidator,

            dataFields: this.dataFields,
            personFields: this.personFields,
            dataList: structuredClone(this.eventControlDataList),
            form: this.lineForm,
            formPass: this.lineFormPass,
          };
        case 'http':
          return {
            checkPort: this.checkPort,
            checkIpAddr: this.checkIpAddr,
            isNotEmptyValidator: this.isNotEmptyValidator,

            form: this.httpForm,
            formPass: this.httpFormPass,
          };
        case 'mail':
          return {
            // validators
            checkPort: this.checkPort,
            checkEmail: this.checkEmail,
            isNotEmptyValidator: this.isNotEmptyValidator,

            dataFields: this.dataFields,
            personFields: this.personFields,
            dataList: structuredClone(this.eventControlDataList),
            form: this.mailForm,
            formPass: this.mailFormPass,
          };
        case 'iobox': {
          return {
            // validators
            checkPort: this.checkPort,
            checkIpAddr: this.checkIpAddr,
            checkDelay: this.checkDelay,
            isNotEmptyValidator: this.isNotEmptyValidator,

            form: this.ioboxForm,
            formPass: this.ioboxFormPass,
          };
        }
        case 'wiegand': {
          return {
            // validators
            checkPort: this.checkPort,
            checkIpAddr: this.checkIpAddr,

            form: this.wiegandForm,
            formPass: this.wiegandFormPass,
          };
        }
        default: {
          return {};
        }
      }
    },
    step2FormStatus() {
      return Object.values(this[`${this.eventControlType}FormPass`]).every((status) => status);
    },
  },
  methods: {
    // Validators
    isNotEmptyValidator(val) {
      if (val.replace(/\s/g, '').length <= 0) {
        return i18n.formatter.format('NoEmptyNoSpace');
      }
      return '';
    },

    // import
    checkPort,
    checkIpAddr,
    checkEmail,
    checkDelay,
  },
  watch: {
    step2FormStatus(newStatus) {
      this.$emit('update:isAllPassed', newStatus);
    },
  },
};
</script>
