<template>
  <div>
    <div class="h1 mb-5">
      {{ disp_header }}
    </div>
    <stepprogress
      class="w-step-progress-3"
      icon-class="fa fa-check"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness"
      :steps="[disp_inputNotificationInfo, disp_content, disp_complete]"
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
                {{ disp_notifyName }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_host }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_security }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_port }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_notifyName"
                  required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
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
                {{ disp_sender }}
              </th>
              <th class="h5 table-th">
                {{ disp_account }}
              </th>
              <th class="h5 table-th">
                {{ disp_password }}
              </th>
              <th class="h5 table-th">
                {{ disp_subject }}
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
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="accountValidator"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  v-model="value_password"
                  required
                  :type="flag_view_password ? 'text' : 'password'"
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
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
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="subjectValidator"
                />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 table-th">
                {{ disp_to }}
              </th>
              <th class="h5 table-th">
                {{ disp_cc }}
              </th>
              <th class="h5 table-th">
                {{ disp_bcc }}
              </th>
              <th class="h5 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="h5 table-td">
                <multiselect
                  :class="flag_valueToPass ? 'is-valid' : 'is-invalid'"
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  v-model="value_to"
                  :options="param_personGroupList"
                  @input="ccListOnInput"
                />
              </td>
              <td class="h5 table-td">
                <multiselect
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  v-model="value_cc"
                  :options="param_personGroupList"
                />
              </td>
              <td class="h5 table-td">
                <multiselect
                  placeholder=""
                  :multiple="true"
                  :hide-selected="true"
                  :searchable="false"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  v-model="value_bcc"
                  :options="param_personGroupList"
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
                {{ disp_fields }}
              </th>
              <th class="h5 w-50 table-th">
                {{ disp_language }}
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
                {{ disp_note }}
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
            {{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="clickOnNext"
            :disabled="!(flag_notifyNamePass && flag_hostPass === '' && flag_portPass === ''
              && flag_senderPass === '' && flag_accountPass && flag_passwordPass && flag_subjectPass )"
          >
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

import { checkDomainName, checkPort, checkEmail } from '@/utils';

const defaultlState = () => ({
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

  disp_header: i18n.formatter.format('NotificationMail'),
  disp_inputNotificationInfo: i18n.formatter.format('NotificationInfo'),
  disp_content: i18n.formatter.format('ContentField'),
  disp_complete: i18n.formatter.format('Complete'),

  disp_notifyName: i18n.formatter.format('NotifyName'),
  disp_host: i18n.formatter.format('HostAddress'),
  disp_security: i18n.formatter.format('SMTPEnabledSecure'),
  disp_port: i18n.formatter.format('Port'),
  disp_sender: i18n.formatter.format('SMTPSender'),
  disp_account: i18n.formatter.format('Username'),
  disp_password: i18n.formatter.format('Password'),
  disp_subject: i18n.formatter.format('SMTPSubject'),
  disp_to: i18n.formatter.format('SMTPTo'),
  disp_cc: i18n.formatter.format('SMTPCC'),
  disp_bcc: i18n.formatter.format('SMTPBCC'),

  disp_fields: i18n.formatter.format('Fields'),
  disp_language: i18n.formatter.format('ContentLanguage'),
  disp_note: i18n.formatter.format('ExpansionField'),
  disp_select: i18n.formatter.format('Select'),
  disp_selected: i18n.formatter.format('Selected'),
  disp_deselect: i18n.formatter.format('Deselect'),

  disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),
  disp_noEmptyPortOnly: i18n.formatter.format('NoEmptyPortOnly'),
  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),

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
  value_to: [],
  value_cc: [],
  value_bcc: [],
  value_language: 'zh',
  value_selectedFields: ['timestamp'],
  value_note: '',

  flag_notifyNamePass: false,
  flag_hostPass: false,
  flag_portPass: false,
  flag_senderPass: false,
  flag_accountPass: false,
  flag_passwordPass: false,
  flag_subjectPass: false,
  flag_valueToPass: false,
});

export default {
  name: 'MailNotifyForm',
  languageOptions: [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'es', label: 'español' },
    { value: 'fr', label: 'Français' },
    { value: 'th', label: 'แบบไทย' },
  ],
  props: {
    formData: { type: Object, default: () => { } },
    modifyMode: Boolean,
    onFinish: { type: Function, default: () => null },
  },
  data() {
    // return Object.assign({}, defaultlState(), this.formData);
    const cloneObject = {};
    Object.assign(cloneObject, defaultlState(), this.formData);

    return cloneObject;
  },
  computed: {
    filterImage() {
      return ['face_image', 'register_image', 'display_image'].filter((key) => this.value_selectedFields.indexOf(key) < 0);
    },
  },
  async created() {
    const self = this;

    // Person Group
    const ret = await self.$globalGetGroupList();
    if (!ret.error) {
      self.param_personGroupList = [];
      for (let i = 0; i < ret.group_list.length; i += 1) {
        self.param_personGroupListValue.push({ value: ret.group_list[i].uuid, label: ret.group_list[i].name });
        self.param_personGroupList.push(ret.group_list[i].name);
      }
    }

    self.updateSettings();
  },
  updated() { },
  methods: {
    async updateSettings() {
      const self = this;

      self.value_uuid = self.value_settingitem.uuid || '';
      self.value_notifyName = self.value_settingitem.name || `Mail Notify-${(self.value_allRecords.length + 1)}`;
      self.value_host = self.value_settingitem.host || '';
      self.value_security = self.value_settingitem.security || 'SSL';
      self.value_port = +self.value_settingitem.port || 587;
      self.value_sender = self.value_settingitem.sender || '';
      self.value_account = self.value_settingitem.email || '';
      self.value_password = self.value_settingitem.password || '';
      self.value_subject = self.value_settingitem.subject || '';

      // self.value_to = self.value_settingitem.to || [];
      self.value_to = self.value_settingitem.to.map((item) => {
        const uuid = self.param_personGroupListValue.find((ii) => ii.value === item);
        return uuid.label;
      });
      self.ccListOnInput(self.value_to);

      // self.value_cc = self.value_settingitem.cc || [];
      self.value_cc = self.value_settingitem.cc.map((item) => {
        const uuid = self.param_personGroupListValue.find((ii) => ii.value === item);
        return uuid.label;
      });

      // self.value_bcc = self.value_settingitem.bcc || [];
      self.value_bcc = self.value_settingitem.bcc.map((item) => {
        const uuid = self.param_personGroupListValue.find((ii) => ii.value === item);
        return uuid.label;
      });

      if (self.value_settingitem.fields) {
        self.value_selectedFields = self.value_settingitem.fields;
      }

      self.value_language = self.value_settingitem.language || 'zh';
      self.value_note = self.value_settingitem.note || '';

      const fields = [].concat(self.value_selectedFields);
      for (let i = 0; i < self.param_Fields.length; i += 1) {
        if (self.value_selectedFields.indexOf(self.param_Fields[i]) < 0) {
          fields.push(self.param_Fields[i]);
        }
      }
      self.param_Fields = [].concat(fields);
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
    clickOnNext() {
      const self = this;

      if (self.flag_currentSetp === 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

        if (self.onFinish) {
          const localSelectedToList = self.value_to.map((item) => {
            const uuid = self.param_personGroupListValue.find((ii) => ii.label === item);
            return uuid.value;
          });

          const localSelectedCCList = self.value_cc.map((item) => {
            const uuid = self.param_personGroupListValue.find((ii) => ii.label === item);
            return uuid.value;
          });

          const localSelectedBccList = self.value_bcc.map((item) => {
            const uuid = self.param_personGroupListValue.find((ii) => ii.label === item);
            return uuid.value;
          });

          self.onFinish(
            {
              uuid: self.value_uuid ? self.value_uuid : undefined,
              name: self.value_notifyName,
              enable: true,
              host: self.value_host,
              security: self.value_security,
              port: +self.value_port || 0,
              sender: self.value_sender,
              email: self.value_account,
              password: self.value_password,
              subject: self.value_subject,
              to: localSelectedToList || [],
              cc: localSelectedCCList || [],
              bcc: localSelectedBccList || [],
              language: self.value_language,
              fields: self.value_selectedFields,
              note: self.value_note,
            },
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

    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },

    notifyNameValidator(val) {
      const self = this;

      if (val.replace(/\s/g, '').length === 0) {
        self.flag_notifyNamePass = false;
      } else {
        self.flag_notifyNamePass = val.length > 0;
      }

      return self.flag_notifyNamePass;
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
      const self = this;

      if (val.replace(/\s/g, '').length === 0) {
        self.flag_senderPass = false;
      } else {
        self.flag_senderPass = val.length > 0;
      }

      return self.flag_senderPass;
    },

    accountValidator(val) {
      this.flag_accountPass = checkEmail(val);
      return this.flag_accountPass === '';
    },

    passwordValidator(val) {
      const self = this;

      if (val.replace(/\s/g, '').length === 0) {
        self.flag_passwordPass = false;
      } else {
        self.flag_passwordPass = val.length > 0;
      }

      return self.flag_passwordPass;
    },

    subjectValidator(val) {
      const self = this;

      if (val.replace(/\s/g, '').length === 0) {
        self.flag_subjectPass = false;
      } else {
        self.flag_subjectPass = val.length > 0;
      }

      return this.flag_subjectPass;
    },

    ccListOnInput(value) {
      if (value.length >= 1) {
        this.flag_valueToPass = true;
      } else {
        this.flag_valueToPass = false;
      }
    },

    fieldChanged(item, evt) {
      const self = this;

      if (evt.target.checked) {
        if (self.value_selectedFields.indexOf(item) < 0) {
          self.value_selectedFields.push(item);
        }
      } else {
        const idx = self.value_selectedFields.indexOf(item);
        if (idx >= 0) {
          self.value_selectedFields.splice(idx, 1);
        }
      }
    },

    fieldMove(item, step) {
      const self = this;

      const idx = self.value_selectedFields.indexOf(item);
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === self.value_selectedFields.length - 1)) return;

      let temp = self.param_Fields[idx];
      self.param_Fields[idx] = self.param_Fields[idx + step];
      self.param_Fields[idx + step] = temp;

      if (self.param_Fields.length >= 1) {
        const popped = self.param_Fields.pop();
        self.param_Fields.push(popped);
      }

      temp = self.value_selectedFields[idx];
      self.value_selectedFields[idx] = self.value_selectedFields[idx + step];
      self.value_selectedFields[idx + step] = temp;
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
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
