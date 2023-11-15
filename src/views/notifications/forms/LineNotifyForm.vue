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
        <!-- <CCardHeader>
          <td>
            <span class="h3">{{ disp_inputPersonInfo }}</span>
          </td>
        </CCardHeader> -->
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_notifyName }}</th>
              <th class="h5 w-25 table-th">{{ disp_accessToken }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_notifyName" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="notifyNameValidator"
                  />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_accessToken" required
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  :is-valid="accessTokenValidator"
                />
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
              <th class="h5 w-50 table-th">{{ disp_fields }}</th>
              <th class="h5 w-50 table-th">{{ disp_language }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td" rowspan="3">
                <ul class="list-group">
                  <li class="list-group-item"
                    v-for="(item, index) in param_Fields" :key="index">
                    <input class="form-check-input me-1" type="checkbox" value="item"
                      :checked="value_selectedFields.indexOf(item) >= 0"
                      @change="fieldChanged(item, $event)" />
                    {{ $t(item) }}
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
                <CSelect size="lg" :value.sync="value_language" :options="$options.languageOptions"
                  @change="selWiegandBoxBits($event)" />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 w-50 table-th">{{ disp_note }}</th>
            </tr>
            <tr>
              <td class="table-td">
                <CTextarea size="lg" rows="9" v-model="value_note" />
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
            :disabled="!(flag_notifyNamePass && flag_accessTokenPass)">
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

  param_cardStyle: 'height: 29rem;',
  param_activeColor: '#6baee3',
  param_passiveColor: '#919bae',
  param_lineThickness: 3,
  param_activeThickness: 3,
  param_passiveThickness: 3,
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

  disp_header: i18n.formatter.format('NotificationLine'),
  disp_inputNotificationInfo: i18n.formatter.format('NotificationInfo'),
  disp_content: i18n.formatter.format('ContentField'),
  disp_complete: i18n.formatter.format('Complete'),

  disp_notifyName: i18n.formatter.format('NotifyName'),
  disp_accessToken: i18n.formatter.format('LineAccessToken'),
  disp_fields: i18n.formatter.format('Fields'),
  disp_language: i18n.formatter.format('ContentLanguage'),
  disp_note: i18n.formatter.format('ExpansionField'),

  disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),
  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),

  flag_currentSetp: 0,

  value_uuid: '',
  value_notifyName: '',
  value_accessToken: '',
  value_language: 'zh',
  value_selectedFields: ['timestamp'],
  value_note: '',

  flag_notifyNamePass: false,
  flag_accessTokenPass: false,
});

export default {
  name: 'LineNotifyForm',
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
  created() {
    const self = this;
    self.updateSettings();
  },
  updated() { },
  methods: {
    async updateSettings() {
      const self = this;

      self.value_uuid = self.value_settingitem.uuid;
      self.value_notifyName = self.value_settingitem.name || `Line Notify-${(self.value_allRecords.length + 1)}`;
      self.value_accessToken = self.value_settingitem.access_token || '';
      if (self.value_settingitem.fields) {
        self.value_selectedFields = self.value_settingitem.fields;
      }

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
          self.onFinish(
            {
              uuid: self.value_uuid ? self.value_uuid : undefined,
              name: self.value_notifyName,
              enable: true,
              access_token: self.value_accessToken,
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

    accessTokenValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_accessTokenPass = false;
      } else {
        this.flag_accessTokenPass = val.length > 0;
      }

      return this.flag_accessTokenPass;
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
