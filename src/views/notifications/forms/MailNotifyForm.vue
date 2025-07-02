<template>
  <div>
    <div class="h1 mb-5">
      {{ $t('NotificationMail') }}
    </div>
    <stepprogress
      class="w-step-progress-3"
      icon-class="fa fa-check"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness"
      :steps="[$t('NotificationInfo'), $t('ContentField'), $t('Complete')]"
      :current-step="flag_currentSetp"
    />

    <CCol sm="12">
      <CCard
        :class="showOnStep(0)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('NotifyName') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('HostAddress') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('SMTPEnabledSecure') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Port') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_notifyName"
                  required
                  :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                  :is-valid="notifyNameValidator"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_host"
                  required
                  :invalid-feedback="flag_hostPass"
                  :is-valid="hostValidator"
                />
              </td>
              <td class="table-td">
                <CSelect
                  size="lg"
                  :value.sync="value_security"
                  :options="['SSL', 'TLS', 'SSL/TLS']"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_port"
                  required
                  :invalid-feedback="flag_portPass"
                  :is-valid="portValidator"
                />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 table-th">
                {{ $t('SMTPSender') }}
              </th>
              <th class="h5 table-th">
                {{ $t('Username') }}
              </th>
              <th class="h5 table-th">
                {{ $t('Password') }}
              </th>
              <th class="h5 table-th">
                {{ $t('SMTPSubject') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_sender"
                  required
                  :invalid-feedback="flag_senderPass"
                  :is-valid="senderValidator"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_account"
                  required
                  :invalid-feedback="flag_accountPass"
                  :is-valid="accountValidator"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_password"
                  required
                  :type="flag_view_password ? 'text' : 'password'"
                  :invalid-feedback="$t('noEmptyNoSpaceOnly')"
                  :is-valid="passwordValidator"
                >
                  <template #append-content>
                    <CButton
                      @click="viewPassword"
                      style="padding: 0.375rem 0.375rem;"
                    >
                      <CIcon
                        v-show="flag_view_password"
                        src="/img/eye-slash.png"
                      />
                      <CIcon
                        v-show="!flag_view_password"
                        src="/img/eye.png"
                      />
                    </CButton>
                  </template>
                </CInput>
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_subject"
                  required
                  :invalid-feedback="$t('noEmptyNoSpaceOnly')"
                  :is-valid="subjectValidator"
                />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 table-th">
                {{ $t('SMTPTo') }}
              </th>
              <th class="h5 table-th">
                {{ $t('SMTPCC') }}
              </th>
              <th class="h5 table-th">
                {{ $t('SMTPBCC') }}
              </th>
              <th class="h5 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <!-- <multiselect
                  :class="flag_valueToPass ? 'is-valid' : 'is-invalid'"
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="$t('Select')"
                  :selected-label="$t('Selected')"
                  :deselect-label="$t('Deselect')"
                  v-model="value_to"
                  :options="param_personGroupList"
                  @input="ccListOnInput"
                /> -->
                <CInput
                  size="lg"
                  v-model="value_to"
                  required
                  :invalid-feedback="flag_toPass"
                  :is-valid="receiverValidator"
                />
              </td>
              <td class="table-td">
                <!-- <multiselect
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="isp_select"
                  :selected-label="$t('Selected')"
                  :deselect-label="$t('Deselect')"
                  v-model="value_cc"
                  :options="param_personGroupList"
                /> -->
                <CInput
                  size="lg"
                  v-model="value_cc"
                  required
                  :invalid-feedback="flag_ccPass"
                  :is-valid="ccValidator"
                />
              </td>
              <td class="table-td">
                <!-- <multiselect
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="$t('Select')"
                  :selected-label="$t('Selected')"
                  :deselect-label="$t('Deselect')"
                  v-model="value_bcc"
                  :options="param_personGroupList"
                /> -->
                <CInput
                  size="lg"
                  v-model="value_bcc"
                  required
                  :invalid-feedback="value_bcc"
                  :is-valid="bccValidator"
                />
              </td>
              <td class="h5 table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard
        :class="showOnStep(1)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-50 table-th">
                {{ $t('Fields') }}
              </th>
              <th class="h5 w-50 table-th">
                {{ $t('ContentLanguage') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td
                class="table-td"
                rowspan="3"
              >
                <ul class="list-group">
                  <li
                    class="list-group-item"
                    v-for="(item, index) in param_Fields"
                    :key="index"
                  >
                    <input
                      class="form-check-input me-1"
                      type="checkbox"
                      value="item"
                      :disabled="filterImage.length === 2 && filterImage.indexOf(item) >= 0"
                      :checked="value_selectedFields.indexOf(item) >= 0"
                      @change="fieldChanged(item, $event)"
                    >
                    {{ $t(item) }}
                    <CButton
                      style="float:right; width: 40px; min-width:unset;"
                      @click="fieldMove(item, -1)"
                    >
                      <CIcon name="cil-arrow-thick-top" />
                    </CButton>
                    <CButton
                      style="float:right; width: 40px; min-width:unset;"
                      @click="fieldMove(item, 1)"
                    >
                      <CIcon name="cil-arrow-thick-bottom" />
                    </CButton>
                  </li>
                </ul>
              </td>
              <td class="table-td">
                <CSelect
                  size="lg"
                  :value.sync="value_language"
                  :options="$options.languageOptions"
                />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 w-50 table-th">
                {{ $t('ExpansionField') }}
              </th>
            </tr>
            <tr>
              <td class="table-td">
                <CTextarea
                  size="lg"
                  rows="9"
                  v-model="value_note"
                />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard
        :class="showOnStep(2)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <div style="height: 220px" />
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('Complete') }}
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
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="clickOnPrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="clickOnPrev"
          >
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="clickOnNext"
            :disabled="!(flag_notifyNamePass && flag_hostPass === '' && flag_portPass === ''
              && flag_toPass === '' && flag_ccPass === '' && flag_bccPass === ''
              && flag_senderPass === '' && flag_accountPass === '' && flag_passwordPass && flag_subjectPass )"
          >
            {{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';
import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

import {
  checkDomainName, checkPort, checkEmail, checkMultiEmail,
} from '@/utils';

export default {
  name: 'MailNotifyForm',
  languageOptions: [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'es', label: 'español' },
    { value: 'fr', label: 'Français' },
    { value: 'th', label: 'แบบไทย' },
    // { value: 'vi', label: 'Tiếng Việt' },
    // { value: 'id', label: 'Bahasa Indonesia' },
    // { value: 'tr', label: 'Türkçe' },

  ],
  props: {
    formData: { type: Object, default: () => { } },
    modifyMode: Boolean,
    onFinish: { type: Function, default: () => null },
  },
  data() {
    return {
      obj_loading: null,

      flag_view_password: false,

      param_cardStyle: 'height: 29rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      param_personGroupListValue: [],
      param_personGroupList: [],
      param_Fields: [
        'timestamp',
        'person_id',
        'person_name',
        'card_number',
        'title',
        'department',
        'email',
        'phone_number',
        'extension_number',
        'remarks',
        'foreHead_temperature',
        'face_image',
        'register_image',
        'display_image',
      ],

      flag_currentSetp: 0,

      value_uuid: '',
      value_notifyName: '',
      value_host: '',
      value_security: 'SSL',
      value_port: 587,
      value_sender: '',
      value_account: '',
      value_password: '',
      value_subject: '',
      value_to: '',
      value_cc: '',
      value_bcc: '',
      value_language: 'zh',
      value_selectedFields: ['timestamp'],
      value_note: '',

      flag_notifyNamePass: false,
      flag_hostPass: '',
      flag_portPass: '',
      flag_senderPass: '',
      flag_accountPass: '',
      flag_passwordPass: false,
      flag_subjectPass: false,
      flag_valueToPass: false,

      flag_toPass: '',
      flag_ccPass: '',
      flag_bccPass: '',

      ...this.formData,
    };
  },
  computed: {
    filterImage() {
      return ['face_image', 'register_image', 'display_image'].filter((key) => this.value_selectedFields.indexOf(key) < 0);
    },
  },
  async created() {
    // Person Group
    const ret = await this.$globalGetGroupList();
    if (!ret.error) {
      this.param_personGroupList = [];
      for (let i = 0; i < ret.group_list.length; i += 1) {
        this.param_personGroupListValue.push({ value: ret.group_list[i].uuid, label: ret.group_list[i].name });
        this.param_personGroupList.push(ret.group_list[i].name);
      }
    }

    this.updateSettings();
  },
  updated() { },
  methods: {
    async updateSettings() {
      this.value_uuid = this.value_settingitem.uuid || '';
      this.value_notifyName = this.value_settingitem.name || `Mail Notify-${(this.value_allRecords.length + 1)}`;
      this.value_host = this.value_settingitem.host || '';
      this.value_security = this.value_settingitem.security || 'SSL';
      this.value_port = +this.value_settingitem.port || 587;
      this.value_sender = this.value_settingitem.sender || '';
      this.value_account = this.value_settingitem.email || '';
      this.value_password = this.value_settingitem.password || '';
      this.value_subject = this.value_settingitem.subject || '';

      // this.value_to = this.value_settingitem.to || [];
      this.value_to = this.value_settingitem.to.join(',');
      // this.ccListOnInput(this.value_to);

      // this.value_cc = this.value_settingitem.cc || [];
      this.value_cc = this.value_settingitem.cc.join(',');

      // this.value_bcc = this.value_settingitem.bcc || [];
      this.value_bcc = this.value_settingitem.bcc.join(',');

      if (this.value_settingitem.fields) {
        this.value_selectedFields = this.value_settingitem.fields;
      }

      this.value_language = this.value_settingitem.language || 'zh';
      this.value_note = this.value_settingitem.note || '';

      const fields = [].concat(this.value_selectedFields);
      for (let i = 0; i < this.param_Fields.length; i += 1) {
        if (this.value_selectedFields.indexOf(this.param_Fields[i]) < 0) {
          fields.push(this.param_Fields[i]);
        }
      }
      this.param_Fields = [].concat(fields);
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('Next');
        case 2:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
    clickOnPrev() {
      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        } else this.updateSettings();
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    clickOnNext() {
      if (this.flag_currentSetp === 0) {
        this.flag_currentSetp = 1;
      } else if (this.flag_currentSetp === 1) {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

        if (this.onFinish) {
          const localSelectedToList = this.value_to.split(',');
          const localSelectedCCList = this.value_cc.split(',');
          const localSelectedBccList = this.value_bcc.split(',');

          this.onFinish(
            {
              uuid: this.value_uuid ? this.value_uuid : undefined,
              name: this.value_notifyName,
              enable: true,
              host: this.value_host,
              security: this.value_security,
              port: +this.value_port || 0,
              sender: this.value_sender,
              email: this.value_account,
              password: this.value_password,
              subject: this.value_subject,
              to: localSelectedToList || [],
              cc: localSelectedCCList || [],
              bcc: localSelectedBccList || [],
              language: this.value_language,
              fields: this.value_selectedFields,
              note: this.value_note,
            },
            (success, result) => {
              if (this.obj_loading) this.obj_loading.hide();
              if (result && result.message === 'ok') {
                this.flag_currentSetp = 2;
              } else {
                this.$fire({
                  text: this.$t('Failed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            },
          );
        } else {
          if (this.obj_loading) this.obj_loading.hide();
          this.flag_currentSetp = 1;
        }
      } else {
        this.$router.push({ name: this.value_returnRoutePath });
      }
    },

    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },

    notifyNameValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_notifyNamePass = false;
      } else {
        this.flag_notifyNamePass = val.length > 0;
      }

      return this.flag_notifyNamePass;
    },

    hostValidator(val) {
      this.flag_hostPass = checkDomainName(val);
      return this.flag_hostPass === '';
    },

    portValidator(val) {
      this.flag_portPass = checkPort(val);
      return this.flag_portPass === '';
    },

    senderValidator(val) {
      this.flag_senderPass = val.length === 0 ? this.$t('NoEmptyNoSpaceOnly') : '';
      return this.flag_senderPass === '';
    },

    accountValidator(val) {
      this.flag_accountPass = checkEmail(val);
      return this.flag_accountPass === '';
    },

    passwordValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_passwordPass = false;
      } else {
        this.flag_passwordPass = val.length > 0;
      }

      return this.flag_passwordPass;
    },

    subjectValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_subjectPass = false;
      } else {
        this.flag_subjectPass = val.length > 0;
      }

      return this.flag_subjectPass;
    },

    receiverValidator(val) {
      this.flag_toPass = checkMultiEmail(val);
      return this.flag_toPass === '';
    },

    ccValidator(val) {
      if (val === '') this.flag_ccPass = '';
      else this.flag_ccPass = checkMultiEmail(val);
      return this.flag_ccPass === '';
    },

    bccValidator(val) {
      if (val === '') this.flag_bccPass = '';
      else this.flag_bccPass = checkMultiEmail(val);
      return this.flag_bccPass === '';
    },

    ccListOnInput(value) {
      if (value.length >= 1) {
        this.flag_valueToPass = true;
      } else {
        this.flag_valueToPass = false;
      }
    },

    fieldChanged(item, evt) {
      if (evt.target.checked) {
        if (this.value_selectedFields.indexOf(item) < 0) {
          this.value_selectedFields.push(item);
        }
      } else {
        const idx = this.value_selectedFields.indexOf(item);
        if (idx >= 0) {
          this.value_selectedFields.splice(idx, 1);
        }
      }
    },

    fieldMove(item, step) {
      const idx = this.value_selectedFields.indexOf(item);
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === this.value_selectedFields.length - 1)) return;

      let temp = this.param_Fields[idx];
      this.param_Fields[idx] = this.param_Fields[idx + step];
      this.param_Fields[idx + step] = temp;

      if (this.param_Fields.length >= 1) {
        const popped = this.param_Fields.pop();
        this.param_Fields.push(popped);
      }

      temp = this.value_selectedFields[idx];
      this.value_selectedFields[idx] = this.value_selectedFields[idx + step];
      this.value_selectedFields[idx + step] = temp;
    },
  },
  components: {
    stepprogress: StepProgress,
    // multiselect: Multiselect,
  },
};
</script>

<style>
  .list-group {
    height: 22.5rem;
    overflow-y: scroll;
  }

  .list-group-item {
    padding-left: 30px !important;
    padding-top: 5px;
    padding-right: 30px;
    padding-bottom: 5px;
    line-height: 40px;
    font-size: 18px;
  }
</style>
