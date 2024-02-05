<template>
  <component
    :is="currentFormComponent"
    v-bind="getFormProps"
  />
</template>

<script>
import { checkPort, checkEmail, checkIpAddr } from '@/utils/validate';
import Step2FormLine from './Step2FormLine.vue';
import Step2FormMail from './Step2FormMail.vue';

export default {
  name: 'Step2Form',
  components: {
    Step2FormLine,
    Step2FormMail,
  },
  props: {
    isAllPassed: {
      type: Boolean,
      required: true,
      default: false,
    },
    cardStyle: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    eventControlType: {
      type: String,
      required: true,
      default: 'line',
    },

    eventLineAccessToken: {
      type: String,
      required: true,
      default: '',
    },

    eventHttpHostAddress: {
      type: String,
      required: true,
      default: '',
    },
    eventHttpEnabledSSL: {
      type: Boolean,
      required: true,
      default: false,
    },
    eventHttpUser: {
      type: String,
      required: true,
      default: '',
    },
    eventHttpPass: {
      type: String,
      required: true,
      default: '',
    },
    eventHttpPort: {
      type: Number,
      required: true,
      default: 80,
    },

    eventSMTPMethod: {
      type: String,
      required: true,
      default: 'smtp',
    },
    eventSMTPHostAddress: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPPort: {
      type: Number,
      required: true,
      default: 25,
    },
    eventSMTPEnabledSecure: {
      type: Boolean,
      required: true,
      default: false,
    },
    eventSMTPUser: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPPass: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPSender: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPSubject: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPTo: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPCC: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPBCC: {
      type: String,
      required: true,
      default: '',
    },
  },
  emits: [
    'update:isAllPassed',

    'update:eventHttpHostAddress',
    'update:eventHttpEnabledSSL',
    'update:eventHttpUser',

    'update:eventSMTPMethod',
    'update:eventSMTPHostAddress',
    'update:eventSMTPPort',
    'update:eventSMTPEnabledSecure',
    'update:eventSMTPUser',
    'update:eventHttpHostAddress',
    'update:eventSMTPSender',
    'update:eventSMTPSubject',
    'update:eventSMTPTo',
    'update:eventSMTPCC',
    'update:eventSMTPBCC',
  ],
  data() {
    return {
      flag_enable_SSL: false,

      // valid
      flag_lineAccessTokenPass: false,

      flag_httpPortPass: false,
      flag_urlPass: false,
      flag_ipAddrPass: false,
      flag_newFieldNamePass: false,

      flag_hostAddressPass: false,
      flag_mailPortPass: false,
      flag_senderPass: false,
      flag_toPass: false,
      flag_ccPass: false,
      flag_bccPass: false,
    };
  },
  computed: {
    currentFormComponent() {
      return `Step2Form${this.eventControlType.charAt(0).toUpperCase() + this.eventControlType.slice(1)}`;
    },
    getFormProps() {
      const defaultProps = {
        handleUpdateEmitData: this.handleUpdateEmitData,
        isNotEmptyValidator: this.isNotEmptyValidator,
        checkPort: this.checkPort,
        checkEmail: this.checkEmail,
        checkIpAddr: this.checkIpAddr,
        portValidator: this.portValidator,
        emailValidator: this.emailValidator,
        ipAddrValidator: this.ipAddrValidator,
        urlValidator: this.urlValidator,

        eventControlType: this.eventControlType,
      };

      const lineProps = {
        eventLineAccessToken: this.eventLineAccessToken,
      };

      const httpProps = {
        eventHttpHostAddress: this.eventHttpHostAddress,
        eventHttpEnabledSSL: this.eventHttpEnabledSSL,
        eventHttpUser: this.eventHttpUser,
        eventHttpPass: this.eventHttpPass,
      };

      const mailProps = {
        eventSMTPMethod: this.eventSMTPMethod,
        eventSMTPHostAddress: this.eventSMTPHostAddress,
        eventSMTPPort: this.eventSMTPPort,
        eventSMTPEnabledSecure: this.eventSMTPEnabledSecure,
        eventSMTPUser: this.eventSMTPUser,
        eventSMTPPass: this.eventSMTPPass,
        eventSMTPSender: this.eventSMTPSender,
        eventSMTPSubject: this.eventSMTPSubject,
        eventSMTPTo: this.eventSMTPTo,
        eventSMTPCC: this.eventSMTPCC,
        eventSMTPBCC: this.eventSMTPBCC,
      };

      switch (this.eventControlType) {
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

        default: {
          return {};
        }
      }
    },
    step2FormStatus() {
      switch (this.eventControlType) {
        case 'line':
          return this.flag_lineAccessTokenPass;
        case 'http':
          return true;
        case 'mail':
          return this.flag_hostAddressPass && this.flag_mailPortPass && this.flag_senderPass && this.flag_toPass && this.flag_ccPass && this.flag_bccPass;
        default:
          return false;
      }
    },
  },
  methods: {
    handleUpdateEmitData(key, value) {
      this.$emit(`update:${key}`, value);
    },

    // selectDateType(type) {
    //   this.value_selectedData = type;
    //   switch (type) {
    //     case 0:
    //       this.value_dataType = 'JSON';
    //       this.value_customData = '';
    //       this.value_customTextarea = '';
    //       this.value_newFieldKey = '';
    //       this.value_typeInData = '';
    //       this.flag_customData = false;
    //       break;
    //     case 1:
    //       this.value_dataType = 'XML';
    //       this.value_customData = '';
    //       this.value_customTextarea = '';
    //       this.value_newFieldKey = '';
    //       this.value_typeInData = '';
    //       this.flag_customData = false;
    //       break;
    //     default:
    //       break;
    //   }
    // },
    // cleanUrl(inputUrl) {
    //   try {
    //     let processUrl = '';
    //     let outputUrl = '';
    //     processUrl = this.removeQmark(inputUrl);
    //     outputUrl = this.removeDbSlash(processUrl);
    //     return outputUrl;
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // },
    // clearSetting() {
    //   if (this.value_eventHttpMethod == 'GET') {
    //     this.value_dataType = 'JSON';
    //     this.value_customData = '';
    //     this.value_customTextarea = '';
    //     this.value_eventHttpUrl = '';
    //     this.flag_customData = true;
    //     this.value_selectedDefaultData = '';
    //     this.value_newFieldKey = '';
    //     this.value_typeInData = '';
    //     this.value_typeInOption = true;
    //   } else if (this.value_eventHttpMethod == 'POST') {
    //     this.value_customData = '';
    //     this.value_customTextarea = '';
    //     this.value_eventHttpUrl = '';
    //     this.flag_customData = false;
    //     this.value_selectedDefaultData = '';
    //     this.value_newFieldKey = '';
    //     this.value_typeInData = '';
    //     this.value_typeInOption = true;
    //   }
    // },

    // Validators
    // TODO: 判斷 name 重複
    isNotEmptyValidator(key, val) {
      console.log(key, val);
      this[`flag_${key}`] = val.replace(/\s/g, '').length > 0;
      return this[`flag_${key}`];
    },
    urlValidatorFn(val) {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' // protocol
          + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
          + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
          + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
          + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
          + '(\\#[-a-z\\d_]*)?$',
        'i',
      ); // fragment locator
      return !!pattern.test(val);
    },
    urlValidator(text) {
      let url;

      try {
        url = new URL(text);
      } catch (err) {
        return false;
      }
      return url.protocol === 'http:' || url.protocol === 'https:';
    },
    portValidator(key, val) {
      const errorMsg = checkPort(Number(val));
      this[`flag_${key}`] = errorMsg === '';
      return this[`flag_${key}`];
    },
    emailValidator(key, email) {
      const errorMsg = checkEmail(email);
      this[`flag_${key}`] = errorMsg === '';
      return this[`flag_${key}`];
    },
    ipAddrValidator(key, val) {
      const errorMsg = checkIpAddr(val);
      this.flag_ipAddrPass = errorMsg === '';
      return this[`flag_${key}`];
    },

    // import
    checkPort,
    checkIpAddr,
  },
  watch: {
    step2FormStatus(status) {
      this.$emit('update:isAllPassed', status);
    },
  },
};
</script>
