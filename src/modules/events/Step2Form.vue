<template>
  <component :is="currentFormComponent" v-bind="getFormProps" v-on="getFormEmits" />
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
    languageOptions: [
      { value: 'en', label: 'English' },
      { value: 'zh', label: '繁體中文' },
      { value: 'ja', label: '日本語' },
      { value: 'es', label: 'español' },
      { value: 'fr', label: 'Français' },
      { value: 'th', label: 'แบบไทย' },
    ],
    dataFields: [
      {
        label: 'EventControlName',
        value: 'rule_name',
      },
      {
        label: 'VerifiedUuid',
        value: 'verify_uuid',
      },
      {
        label: 'VideoDeviceVideoSource',
        value: 'source_device',
      },
      {
        label: 'Temperature',
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
      // {
      //   label: 'VerifiedTimeStamp',
      //   value: 'verified_timestamp',
      // },
      {
        label: 'VerifiedDateTime',
        value: 'verified_datetime',
      },
      {
        label: 'CapturedPhoto',
        value: 'captured',
      },
      {
        label: 'RegisterPhoto',
        value: 'register',
      },
      {
        label: 'DisplayImage',
        value: 'display',
      },
    ],
    personFields: [
      {
        label: 'CardNumber',
        value: 'person.card_number',
      },
      {
        label: 'Department',
        value: 'person.department',
      },
      {
        label: 'EmailAddress',
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
      eventControlLanguage: {
        type: String,
        default: '',
      },
      eventControlDataList: {
        type: Object,
        default: () => ({}),
      },
      eventControlNote: {
        type: String,
        default: '',
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
      'update:language',
      'update:dataList',
      'update:note',
      'update:isAllPassed',
    ],
    data() {
      return {

        lineFormPass: {
          token: false,
          group_id: false
        },

        httpFormPass: {
          // host: false,
          // user: false,
          // pass: false,
          body: false,
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
        let type = this.eventControlType;
        if (type == 'telegram') type = 'line';

        return `Step2Form${type.charAt(0).toUpperCase() + type.slice(1)}`;
      },
      getFormProps() {
        switch (this.eventControlType) {
          case 'line':
          case 'telegram':
            let defaultOptions = Array.from(this.$options.dataFields);

            if (this.eventControlType == 'line') {
              defaultOptions = defaultOptions.filter(item => item.value != 'captured');
              defaultOptions = defaultOptions.filter(item => item.value != 'register');
              defaultOptions = defaultOptions.filter(item => item.value != 'display');
            }

            return {
              isNotEmptyValidator: this.isNotEmptyValidator,

              dataFields: defaultOptions,
              personFields: this.$options.personFields,
              language: this.eventControlLanguage,
              languageOptions: this.$options.languageOptions,
              dataList: this.convertToNewDataStructure(this.eventControlDataList),
              note: this.eventControlNote,
              form: this.lineForm,
              formPass: this.lineFormPass,
            };
          case 'http':
            return {
              checkPort: this.checkPort,
              //checkIpAddr: this.checkIpAddr,
              //isNotEmptyValidator: this.isNotEmptyValidator,

              note: this.eventControlNote,
              form: this.httpForm,
              formPass: this.httpFormPass,
            };
          case 'mail':
            return {
              // validators
              checkPort: this.checkPort,
              checkEmail: this.checkEmail,
              isNotEmptyValidator: this.isNotEmptyValidator,

              dataFields: this.$options.dataFields,
              personFields: this.$options.personFields,
              language: this.eventControlLanguage,
              languageOptions: this.$options.languageOptions,
              dataList: this.convertToNewDataStructure(this.eventControlDataList),
              note: this.eventControlNote,
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
      getFormEmits() {
        switch (this.eventControlType) {
          case 'line':
          case 'telegram':
          case 'mail':
            return {
              'update:language': (newLanguage) => this.$emit('update:language', newLanguage),
              'update:dataList': (newDataList) => this.$emit('update:dataList', newDataList),
              'update:note': (newNote) => this.$emit('update:note', newNote),
            };
          case 'http':
            return {
              'update:language': (newLanguage) => this.$emit('update:language', newLanguage),
              'update:note': (newNote) => this.$emit('update:note', newNote),
            };
          case 'iobox':
          case 'wiegand':
          default:
            return null;
        }
      },
      step2FormStatus() {
        let type = this.eventControlType;

        if (type == 'telegram') type = 'line';
        return Object.values(this[`${type}FormPass`]).every((status) => status);
      },
    },
    methods: {
      // Validators
      isNotEmptyValidator(val) {
        if (val === '' && val.replace(/\s/g, '').length <= 0) {
          return i18n.formatter.format('NoEmptyNoSpace');
        }
        return '';
      },

      // import
      checkPort,
      checkIpAddr,
      checkEmail,
      checkDelay,

      // 資料結構轉換方法
      convertToNewDataStructure(oldDataList) {
        if (!oldDataList || Object.keys(oldDataList).length === 0) {
          return { eventData: {}, personData: {} };
        }

        // 如果已經是新格式，直接返回
        if (oldDataList.eventData !== undefined || oldDataList.personData !== undefined) {
          return structuredClone(oldDataList);
        }

        // 轉換舊格式到新格式
        const eventData = {};
        const personData = {};

        Object.keys(oldDataList).forEach(key => {
          if (key === 'person') {
            // 將 person 內容直接展開到 personData
            Object.assign(personData, oldDataList[key]);
          } else {
            eventData[key] = oldDataList[key];
          }
        });

        return { eventData, personData };
      },

      convertToOldDataStructure(newDataList) {
        if (!newDataList) {
          return {};
        }

        const result = {};

        // 合併 eventData
        if (newDataList.eventData) {
          Object.assign(result, newDataList.eventData);
        }

        // 合併 personData
        if (newDataList.personData) {
          Object.assign(result, newDataList.personData);
        }

        return result;
      },
    },
    watch: {
      step2FormStatus(newStatus) {
        this.$emit('update:isAllPassed', newStatus);
      },
    },
  };
</script>