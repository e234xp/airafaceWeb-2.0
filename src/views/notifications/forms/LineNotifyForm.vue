<template>
  <div>
    <div class="h1 mb-5">
      {{ $t('NotificationLine') }}
    </div>
    <stepprogress class="w-step-progress-3" icon-class="fa fa-check" :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness" :active-color="param_activeColor" :passive-color="param_passiveColor"
      :line-thickness="param_lineThickness" :steps="[$t('NotificationInfo'), $t('ContentField'), $t('Complete')]"
      :current-step="flag_currentSetp" />

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
              <th class="h5 w-25 table-th">
                {{ $t('NotifyName') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('LineAccessToken') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" v-model="value_notifyName" required :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                  :is-valid="notifyNameValidator" />
              </td>
              <td class="table-td">
                <CInput size="lg" v-model="value_accessToken" required :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                  :is-valid="accessTokenValidator" />
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)" :style="param_cardStyle">
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
              <td class="table-td" rowspan="3">
                <ul class="list-group">
                  <li class="list-group-item" v-for="(item, index) in param_Fields" :key="index">
                    <input class="form-check-input me-1" type="checkbox" value="item" :checked="item.checked"
                      :disabled="!item.enabled" @change="fieldChanged(item, $event)">
                    {{ $t(item.label) }}
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
                <CSelect size="lg" :value.sync="value_language" :options="$options.languageOptions" />
              </td>
            </tr>
            <tr class="table-tr">
              <th class="h5 w-50 table-th">
                {{ $t('ExpansionField') }}
              </th>
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
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev">
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev">
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
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
  import StepProgress from 'vue-step-progress';
  import '@/airacss/vue-step-progress.css';

  export default {
    name: 'LineNotifyForm',
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

        param_cardStyle: 'height: 29rem;',
        param_activeColor: '#6baee3',
        param_passiveColor: '#919bae',
        param_lineThickness: 3,
        param_activeThickness: 3,
        param_passiveThickness: 3,
        param_Fields: [
          { label: 'timestamp', checked: false, enabled: true },
          { label: 'person_id', checked: false, enabled: true },
          { label: 'person_name', checked: false, enabled: true },
          { label: 'card_number', checked: false, enabled: true },
          { label: 'title', checked: false, enabled: true },
          { label: 'department', checked: false, enabled: true },
          { label: 'email', checked: false, enabled: true },
          { label: 'phone_number', checked: false, enabled: true },
          { label: 'extension_number', checked: false, enabled: true },
          { label: 'remarks', checked: false, enabled: true },
          { label: 'foreHead_temperature', checked: false, enabled: true },
          { label: 'face_image', checked: false, enabled: true },
          { label: 'register_image', checked: false, enabled: true },
          { label: 'display_image', checked: false, enabled: true },
        ],

        param_data_fields: [
          { label: 'timestamp', value: 'verified_timestamp' },
          { label: 'foreHead_temperature', value: 'foreHead_temperature' },
          { label: 'is_high_temperature', value: 'is_high_temperature' },
          { label: 'show_identity', value: 'show_identity' },
          { label: 'face_image', value: 'captured' },
          { label: 'register_image', value: 'register' },
          { label: 'display_image', value: 'display' },
        ],

        param_person_fields: [
          { label: 'person_id', value: 'person.id' },
          { label: 'person_name', value: 'person.name' },
          { label: 'card_number', value: 'person.card_number' },
          { label: 'title', value: 'person.title' },
          { label: 'department', value: 'person.department' },
          { label: 'email', value: 'person.email' },
          { label: 'Group', value: 'person.group_list' },
          { label: 'phone_number', value: 'person.phone_number' },
          { label: 'extension_number', value: 'person.extension_number' },
        ],

        flag_currentSetp: 0,

        value_uuid: '',
        value_notifyName: '',
        value_accessToken: '',
        value_language: 'zh',
        value_selectedFields: ['timestamp'],
        value_note: '',

        flag_notifyNamePass: false,
        flag_accessTokenPass: false,

        ...this.formData,
      };
    },
    created() {
      this.updateSettings();
    },
    updated() { },
    methods: {
      async updateSettings() {
        this.value_uuid = this.value_settingitem.uuid;
        this.value_notifyName = this.value_settingitem.name || `Line Notify-${(this.value_allRecords.length + 1)}`;
        this.value_accessToken = this.value_settingitem.access_token || '';
        if (this.value_settingitem.fields) {
          if (Array.isArray(this.value_settingitem.fields)) {
            this.value_selectedFields = this.value_settingitem.fields;
          } else {
            this.value_selectedFields = ['timestamp'];
          }
        } else {
          this.value_selectedFields = ['timestamp'];
        }

        this.value_language = this.value_settingitem.language || 'zh';
        this.value_note = this.value_settingitem.note || '';

        for (let i = 0; i < this.param_Fields.length; i += 1) {
          if (this.value_selectedFields.indexOf(this.param_Fields[i].label) >= 0) {
            this.param_Fields[i].checked = true;
            this.param_Fields[i].enabled = true;

            switch (this.param_Fields[i].label) {
              case 'face_image': {
                let idx = this.param_Fields.findIndex((obj) => obj.label === 'register_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                idx = this.param_Fields.findIndex((obj) => obj.label === 'display_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                break;
              }
              case 'register_image': {
                let idx = this.param_Fields.findIndex((obj) => obj.label === 'face_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                idx = this.param_Fields.findIndex((obj) => obj.label === 'display_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                break;
              }
              case 'display_image': {
                let idx = this.param_Fields.findIndex((obj) => obj.label === 'face_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                idx = this.param_Fields.findIndex((obj) => obj.label === 'register_image') || -1;
                if (idx !== -1) this.param_Fields[idx].enabled = false;

                break;
              }
              default:
                break;
            }
          }
        }
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
            this.onFinish(
              {
                uuid: this.value_uuid ? this.value_uuid : undefined,
                name: this.value_notifyName,
                enable: true,
                access_token: this.value_accessToken,
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

      fieldChanged(pItem, evt) {
        const item = pItem;

        item.checked = evt.target.checked;

        this.value_selectedFields = [];
        for (let i = 0; i < this.param_Fields.length; i += 1) {
          if (this.param_Fields[i].checked) {
            this.value_selectedFields.push(this.param_Fields[i].label);
          }
        }

        if (['face_image', 'register_image', 'display_image'].indexOf(item.label) >= 0) {
          let idx = -1;
          idx = this.param_Fields.findIndex((obj) => obj.label === 'face_image') || -1;
          if (idx !== -1) this.param_Fields[idx].enabled = !item.checked;
          idx = this.param_Fields.findIndex((obj) => obj.label === 'register_image') || -1;
          if (idx !== -1) this.param_Fields[idx].enabled = !item.checked;
          idx = this.param_Fields.findIndex((obj) => obj.label === 'display_image') || -1;
          if (idx !== -1) this.param_Fields[idx].enabled = !item.checked;

          idx = this.param_Fields.findIndex((obj) => obj.label === item.label) || -1;
          if (idx !== -1) this.param_Fields[idx].enabled = true;
        }
      },

      fieldMove(item, step) {
        const idx = this.param_Fields.findIndex((obj) => obj.label === item.label) || -1;

        if ((step === -1) && (idx === 0)) return;
        if ((step === 1) && (idx === this.param_Fields.length - 1)) return;

        const temp = this.param_Fields[idx];
        this.param_Fields[idx] = this.param_Fields[idx + step];
        this.param_Fields[idx + step] = temp;

        this.value_selectedFields = [];
        for (let i = 0; i < this.param_Fields.length; i += 1) {
          if (this.param_Fields[i].checked) {
            this.value_selectedFields.push(this.param_Fields[i].label);
          }
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