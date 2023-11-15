<template>
  <div>
    <div class="h1 mb-5">{{ disp_header }}</div>
    <stepprogress class="w-step-progress-3" icon-class="fa fa-check"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness"
      :steps="[disp_inputNotificationInfo, disp_content, disp_complete]"
      :current-step="flag_currentSetp"
    >
    </stepprogress>

    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_notifyName }}</th>
              <th class="h5 w-25 table-th">{{ disp_method }}</th>
              <th class="h5 w-25 table-th">{{ disp_username }}</th>
              <th class="h5 w-25 table-th">{{ disp_password }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_notifyName" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="notifyNameValidator"
                  />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_method" :options="['GET', 'POST']" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_username" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_password"
                  :type="flag_view_password ? 'text' : 'password'"
                >
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                      <CIcon v-show="flag_view_password"  src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 w-25 table-th" colspan="4">{{ disp_url }}
                <span class="h6 table-td px-3 py-0" style="vertical-align: bottom;">ex: http://127.0.0.1:7001/api/createEvent</span>
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td" colspan="4">
                <CInput size="lg" v-model="value_url" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="urlValidator"
                  />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)" :style="param_cardStyle">
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-50 table-th">{{ disp_fields }}</th>
              <th class="h5 w-50 table-th">{{ disp_note }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <ul class="list-group">
                  <li class="list-group-item"
                    v-for="(item, index) in param_Fields" :key="index">
                    <input class="form-check-input me-1" type="checkbox" value="item"
                      :checked="value_selectedFields.indexOf(item) >= 0"
                      @change="fieldSelectedChanged(item, $event)" />
                    <input size="lg" style="width: 260px;" :value="item.key" @input="fieldChanged(item, $event)" /> = {{ $t(item.field) }}
                    <CButton style="float:right; width: 40px; min-width:unset;" @click="fieldMove(item, -1)">
                      <CIcon name="cil-arrow-thick-top" />
                    </CButton>
                    <CButton style="float:right; width: 40px; min-width:unset;" @click="fieldMove(item, 1)">
                      <CIcon name="cil-arrow-thick-bottom" />
                    </CButton>
                  </li>
                </ul>
              </td>
              <td class="table-td">
                <CTextarea size="lg" rows="13" v-model="value_note" />
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
            :disabled="!(flag_notifyNamePass && flag_urlPass)">
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

const defaultlState = () => ({
  obj_loading: null,

  flag_view_password: false,

  param_cardStyle: 'height: 29rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,
  param_Fields: [
    { key: 'timestamp', field: 'timestamp' },
    { key: 'person_id', field: 'person_id' },
    { key: 'person_name', field: 'person_name' },
    { key: 'card_number', field: 'card_number' },
    { key: 'title', field: 'title' },
    { key: 'department', field: 'department' },
    { key: 'email', field: 'email' },
    { key: 'phone_number', field: 'phone_number' },
    { key: 'extension_number', field: 'extension_number' },
    { key: 'remarks', field: 'remarks' },
    { key: 'foreHead_temperature', field: 'foreHead_temperature' },
    { key: 'face_image', field: 'face_image' },
    { key: 'register_image', field: 'register_image' },
    { key: 'display_image', field: 'display_image' },
  ],

  disp_header: i18n.formatter.format('NotificationHttp'),
  disp_inputNotificationInfo: i18n.formatter.format('NotificationInfo'),
  disp_content: i18n.formatter.format('ContentField'),
  disp_complete: i18n.formatter.format('Complete'),

  disp_notifyName: i18n.formatter.format('NotifyName'),
  disp_method: i18n.formatter.format('Method'),
  disp_username: i18n.formatter.format('Username'),
  disp_password: i18n.formatter.format('Password'),
  disp_url: i18n.formatter.format('HttpUrl'),
  disp_fields: i18n.formatter.format('Fields'),
  disp_note: i18n.formatter.format('Note'),

  disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),

  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),

  flag_currentSetp: 0,

  value_uuid: '',
  value_notifyName: '',
  value_method: '',
  value_url: '',
  value_username: '',
  value_password: '',
  value_selectedFields: [{ key: 'timestamp', field: 'timestamp' }],
  value_note: '',

  flag_notifyNamePass: false,
  flag_urlPass: false,
});

export default {
  name: 'HttpNotifyForm',
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
  created() {
    const self = this;
    self.updateSettings();
  },
  updated() { },
  methods: {
    async updateSettings() {
      const self = this;

      self.value_uuid = self.value_settingitem.uuid;
      self.value_notifyName = self.value_settingitem.name || `Http Notify-${(self.value_allRecords.length + 1)}`;
      self.value_method = self.value_settingitem.method || 'POST';
      self.value_url = self.value_settingitem.url || '';
      self.value_username = self.value_settingitem.username || '';
      self.value_password = self.value_settingitem.password || '';

      if (self.value_settingitem.fields) {
        self.value_selectedFields = self.parameterToField(self.value_settingitem.fields);
      }

      self.value_note = self.value_settingitem.note || '';

      const fields = [].concat(self.value_selectedFields);
      for (let i = 0; i < self.param_Fields.length; i += 1) {
        if (self.value_selectedFields.findIndex((item) => item.field === self.param_Fields[i].field) <= -1) {
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

    fieldToParameter(fields) {
      const ret = {};

      for (let i = 0; i < fields.length; i += 1) {
        // { key: 'timestamp', field: 'timestamp' },
        ret[fields[i].field] = fields[i].key;
      }

      return ret;
    },

    parameterToField(parmams) {
      const ret = [];

      Object.entries(parmams).forEach((key) => {
        // { key: 'timestamp', field: 'timestamp' },
        ret.push({ key: key[1], field: key[0] });
      });

      return ret;
    },

    clickOnNext() {
      const self = this;

      if (self.flag_currentSetp === 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp === 1) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

        if (self.onFinish) {
          self.onFinish(
            {
              uuid: self.value_uuid ? self.value_uuid : undefined,
              name: self.value_notifyName,
              enable: true,
              method: self.value_method,
              url: self.value_url,
              username: self.value_username,
              password: self.value_password,
              fields: self.fieldToParameter(self.value_selectedFields),
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
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_notifyNamePass = false;
      } else {
        this.flag_notifyNamePass = val.length > 0;
      }

      return this.flag_notifyNamePass;
    },

    urlValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_urlPass = false;
      } else {
        this.flag_urlPass = val.length > 0;
      }

      return this.flag_urlPass;
    },

    fieldChanged(pItem, evt) {
      const item = pItem;

      item.key = evt.srcElement.value;
    },

    fieldSelectedChanged(item, evt) {
      const self = this;

      if (evt.target.checked) {
        if (self.value_selectedFields.findIndex((f) => f.field === item.field) >= -1) {
          self.value_selectedFields.push(item);
        }
      } else {
        const idx = self.value_selectedFields.findIndex((f) => f.field === item.field);
        if (idx >= 0) {
          self.value_selectedFields.splice(idx, 1);
        }
      }
    },

    fieldMove(item, step) {
      const self = this;

      const idx = self.value_selectedFields.findIndex((f) => f.field === item.field);
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === self.value_selectedFields.length - 1)) return;

      const temp = self.value_selectedFields[idx];
      self.value_selectedFields[idx] = self.value_selectedFields[idx + step];
      self.value_selectedFields[idx + step] = temp;

      const fields = [].concat(self.value_selectedFields);
      for (let i = 0; i < self.param_Fields.length; i += 1) {
        if (self.value_selectedFields.findIndex((f) => f.field === self.param_Fields[i].field) <= -1) {
          fields.push(self.param_Fields[i]);
        }
      }
      self.param_Fields = [].concat(fields);

      if (self.param_Fields.length >= 1) {
        const popped = self.param_Fields.pop();
        self.param_Fields.push(popped);
      }
    },
  },
  components: {
    stepprogress: StepProgress,
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
