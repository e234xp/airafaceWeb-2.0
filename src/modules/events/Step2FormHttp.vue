<template>
  <section>
    <CCard>
      <CCardBody>
        <table class="table-layout">
          <tr class="table-tr">
            <th class="h5 w-25 table-th">
              {{ $t('HostAddress') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('HttpEnabledSSL') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('Username') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('Password') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                required
                v-model="form.host"
              />
            </td>
            <td class="table-td">
              <CSwitch
                size="lg"
                class="mb-form-row"
                color="success"
                shape="pill"
                :checked="form.https"
                @update:checked="form.https = $event"
              />
            </td>
            <td class="table-td">
              <CInput
                class="mb-form-row"
                size="lg"
                placeholder=""
                v-model="form.user"
              />
            </td>
            <td class="table-td">
              <form>
                <CInput
                  class="mb-form-row"
                  size="lg"
                  placeholder=""
                  autocomplete="on"
                  :type="flag_view_password ? 'text' : 'password'"
                  v-model="form.pass"
                >
                  <template #append-content>
                    <CButton
                      style="padding: 0.375rem 0.375rem;"
                      @click="viewPassword"
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
              </form>
            </td>
          </tr>

          <tr class="table-tr">
            <th class="h5 w-25 table-th">
              {{ $t('Port') }}
            </th>
            <th class="h5 w-25 table-th">
              PATH
            </th>
            <th
              v-if="form.method === 'GET'"
              colspan="2"
              class="h5 w-25 table-th"
            >
              {{ $t('ShowCompleteUrl') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.port = checkPort(form.port) === ''"
                :invalid-feedback="checkPort(form.port)"
                v-model.number="form.port"
              />
            </td>
            <td class="table-td">
              <CInput
                id="pathInput"
                type="text"
                size="lg"
                style="display: inline-block; width: 85%"
                prepend="/"
                v-model="value_realTime_eventHttpUrl"
                @input="handlePathInput"
              />
            </td>
            <td
              colspan="2"
              class="table-td"
            >
              <CInput
                size="lg"
                placeholder=""
                readonly
                :value="form.url"
              />
            </td>
          </tr>
        </table>
      </CCardBody>
    </CCard>

    <CCard style="height: 31rem">
      <CCardBody>
        <CRow style="height: 100%;">
          <CCol
            sm="12"
          >
            <CRow>
              <CCol sm="12">
                <div
                  class="h5"
                  style="display: block; height: 25px; margin-bottom: 6px"
                >
                  {{ $t('Method') }}
                </div>
                <CSelect
                  size="lg"
                  :filterable="true"
                  :value.sync="form.method"
                  :options="value_eventHttpMethodList"
                  @change="clearSetting"
                />
              </CCol>

              <CCol sm="12">
                <CForm
                  style="position: relative; display: block; padding-bottom: 10px"
                >
                  <CRow>
                    <CCol sm="3">
                      <span
                        class="h5"
                        style="display: block"
                      >
                        {{ $t('FieldName') }}
                      </span>
                      <CInput
                        size="lg"
                        placeholder=""
                        required
                        style="display: block; margin-bottom: 0px"
                        v-model="value_newFieldName"
                      />
                    </CCol>

                    <CCol sm="4">
                      <span
                        class="h5"
                        style="display: block"
                      >
                        {{ $t('FieldData') }}
                      </span>
                      <div
                        style="position: relative; display: block; height: 40px"
                      >
                        <CSelect
                          id="defaultList"
                          size="lg"
                          style="
                              position: relative;
                              display: block;
                              margin-bottom: 0px;
                              z-index: 10000;
                            "
                          :filterable="true"
                          :options="value_defaultDataList"
                          :value.sync="value_selectedDefaultData"
                        />
                      </div>
                    </CCol>

                    <CCol sm="1">
                      <CButton
                        type="submit"
                        variant="outline"
                        size="lg"
                        style="
                          position: relative;
                          display: inline-block;
                          color: #20a8d8;
                          border: 1px solid #20a8d8;
                          vertical-align: top;
                          margin-right: 20px;
                          top: 1.85rem;
                          margin-bottom: 0px;
                        "
                        :disabled="!isAddNewField"
                        @click="addNewField"
                      >
                        +
                      </CButton>
                    </CCol>

                    <CCol
                      sm="2"
                      style="flex: 0 0 14.666667%; max-width: 14.666667%"
                    >
                      <span
                        class="h5"
                        v-if="
                          form.data_type === 'JSON' &&
                            form.method === 'POST'
                        "
                        style="position: relative; display: block"
                      >
                        {{ $t('JSONType') }}
                      </span>
                      <span
                        class="h5"
                        v-if="
                          form.data_type === 'XML' &&
                            form.method === 'POST'
                        "
                        style="position: relative; display: block"
                      >
                        {{ $t('XMLType') }}
                      </span>
                      <CButtonGroup
                        v-if="form.method === 'POST'"
                        class="float-right mr-3"
                        size="lg"
                        style="
                            position: relative;
                            height: 45px;
                            float: none !important;
                            margin-bottom: 0px;
                          "
                      >
                        <CButton
                          style="color: #20a8d8; border: 1px solid #20a8d8"
                          color="outline-secondary"
                          v-for="(value, key) in [0, 1]"
                          :key="key"
                          :pressed="value === value_selectedData ? true : false"
                          @click="selectDateType(value)"
                        >
                          {{ value_selectedDataType[value] }}
                        </CButton>
                      </CButtonGroup>
                    </CCol>

                    <CCol
                      sm="12"
                    >
                      <div
                        v-if="form.method === 'GET'"
                        class="h5"
                        style="position: relative; margin-top: 10px"
                      >
                        {{ $t('QueryString') }}
                      </div>
                      <div
                        v-else
                        class="h5"
                        style="position: relative; margin-top: 10px"
                      >
                        {{ $t('Body') }}
                      </div>
                      <CTextarea
                        id="customBody1"
                        spellcheck="false"
                        rows="10"
                        placeholder=""
                        style="position: relative; width: 100%"
                        :is-valid="formPass.body = checkBody(value_customTextarea) === ''"
                        :invalid-feedback="checkBody(value_customTextarea)"
                        :value="value_customTextarea"
                        @input="onChangeCustomText"
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <CRow style="height: 100%;">
          <CCol
            sm="12"
          >
            <CRow>
              <CCol sm="12">
                <CForm
                  style="position: relative; display: block; padding-bottom: 10px"
                >
                  <CRow>
                    <CCol
                      sm="12"
                    >
                      <div
                        class="h5"
                        style="position: relative; margin-top: 10px"
                      >
                        {{ $t('ExpansionField') }}
                      </div>
                      <CTextarea
                        size="lg"
                        rows="9"
                        :value="note"
                        @input="$emit('update:note', $event)"
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>

export default {
  name: 'Step2FormHttp',
  props: {
    // isNotEmptyValidator: {
    //   type: Function,
    //   required: true,
    //   default: () => () => '',
    // },
    checkPort: {
      type: Function,
      required: true,
      default: () => '',
    },
    // checkIpAddr: {
    //   type: Function,
    //   required: true,
    //   default: () => '',
    // },
    note: {
      type: String,
      required: true,
      default: '',
    },
    form: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    formPass: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ['update:note'],
  data() {
    return {
      flag_view_password: false,

      value_selectedData: 0,

      value_newFieldName: '',
      value_selectedDefaultData: '',
      value_realTime_eventHttpUrl: '',
      value_customTextarea: '',

      value_eventHttpMethodList: [
        { value: 'GET', label: this.$t('GET') },
        { value: 'POST', label: this.$t('POST') },
      ],
      value_selectedDataType: [
        this.$t('JSON'),
        this.$t('XML'),
      ],
      value_defaultDataList: [
        {
          label: this.$t('FieldData'),
          value: '',
          disabled: true,
        },
        // {
        //   label: `${this.$t('VerifiedTimeStamp')}  (String)`,
        //   value: '##VerifiedTimeStamp##',
        // },
        {
          label: `${this.$t('EventControlName')}  (String)`,
          value: '##RuleName##',
        },
        {
          label: `${this.$t('VerifiedUuid')}  (String)`,
          value: '##VerifiedUuid##',
        },
        {
          label: `${this.$t('VerifiedDateTime')}  (String)`,
          value: '##VerifiedDateTime##',
        },
        {
          label: `${this.$t('VideoDeviceVideoSource')}  (String)`,
          value: '##SourceDevice##',
        },
        {
          label: `${this.$t('IsStranger')}  (Boolean)`,
          value: '##IsStranger##',
        },
        { label: `${this.$t('PersonId')}  (String)`, value: '##PersonId##' },
        {
          label: `${this.$t('PersonName')}  (String)`,
          value: '##PersonName##',
        },
        {
          label: `${this.$t('CardNumber')}  (String)`,
          value: '##CardNumber##',
        },
        {
          label: `${this.$t('Group')}  (String)`,
          value: '##Group##',
        },
        {
          label: `${this.$t('JobTitle')}  (String)`,
          value: '##JobTitle##',
        },
        {
          label: `${this.$t('Department')}  (String)`,
          value: '##Department##',
        },
        {
          label: `${this.$t('EmailAddress')}  (String)`,
          value: '##EmailAddress##',
        },
        {
          label: `${this.$t('PhoneNumber')}  (String)`,
          value: '##PhoneNumber##',
        },
        {
          label: `${this.$t('ExtensionNumber')}  (String)`,
          value: '##ExtensionNumber##',
        },
        {
          label: `${this.$t('Remarks')}  (String)`,
          value: '##Remarks##',
        },
        {
          label: `${this.$t('Temperature')}  (Float)`,
          value: '##Temperature##',
        },
        {
          label: `${this.$t('IsHighTemperature')}  (Boolean)`,
          value: '##IsHighTemperature##',
        },
        {
          label: `${this.$t('CapturedPhoto')}  (base64 encoded image)`,
          value: '##CapturedPhoto##',
        },
        {
          label: `${this.$t('RegisterPhoto')}  (base64 encoded image)`,
          value: '##RegisterPhoto##',
        },
        {
          label: `${this.$t('DisplayPhoto')}  (base64 encoded image)`,
          value: '##DisplayPhoto##',
        },
      ],
    };
  },
  computed: {
    isAddNewField() {
      return this.value_newFieldName && this.value_selectedDefaultData;
    },
  },
  methods: {
    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },

    handlePathInput(value) {
      if (!value.startsWith('/')) {
        this.form.url = `/${value}`;
      } else {
        this.form.url = value;
      }
      this.form.url = `${this.form.url.split('?')[0]}${(this.value_customTextarea || '') === '' ? '' : '?'}${this.value_customTextarea || ''}`;
    },

    selectDateType(type) {
      this.value_selectedData = type;

      switch (type) {
        case 0:
          this.form.data_type = 'JSON';
          break;
        case 1:
          this.form.data_type = 'XML';
          break;
        default:
          break;
      }

      this.form.custom_data = '';
      this.value_customTextarea = '';
    },

    clearSetting() {
      if (this.form.methods == 'GET') {
        this.form.data_type = 'JSON';
      }

      Object.assign(this.form, {
        custom_data: '',
        url: '/',
      });

      this.value_newFieldName = '';
      this.value_selectedDefaultData = '';
      this.value_customTextarea = '';
    },

    initialConvert() {
      if (this.form.url === '') return;

      if (this.form.method === 'GET') {
        const copyUrl = this.form.url;
        // const [, value] = copyUrl.split('/');
        // const [result] = value.split('?');
        const [result] = copyUrl.split('?');
        this.value_realTime_eventHttpUrl = this.form.url.startsWith('/') ? result.slice(1) : this.form.url;

        const customTextarea = this.form.url;
        const [, queryString] = customTextarea.split('?');
        this.value_customTextarea = queryString;
      } else if (this.form.method === 'POST') {
        this.value_realTime_eventHttpUrl = this.form.url.startsWith('/') ? this.form.url.slice(1) : this.form.url;
        this.value_customTextarea = this.form.custom_data;
      }
    },
    combineJSON(fieldName, data) {
      return `"${fieldName}":"${data}",`;
    },
    splitJSON(json) {
      const split = json.split(':');
      return {
        fieldName: split[0].replace(/"/g, ''),
        data: split[1].replace(/"/g, ''),
      };
    },
    combineXML(fieldName, data) {
      return `<${fieldName}>${data}</${fieldName}>`;
    },
    splitXML(combined) {
      const fieldName = combined.match(/<(.+)>/)[1];
      const data = combined.match(/>(.+)<\//)[1];
      return { fieldName, data };
    },

    addNewField() {
      let newCustomData = '';
      switch (this.form.method) {
        case 'GET':
          newCustomData = `&${this.value_newFieldName}=${this.value_selectedDefaultData}`;

          this.value_customTextarea = `${this.value_customTextarea || ''}${newCustomData}`;
          this.form.url = `${this.form.url.split('?')[0]}${(this.value_customTextarea || '') === '' ? '' : '?'}${this.value_customTextarea || ''}`;
          break;
        case 'POST':
          switch (this.form.data_type) {
            case 'JSON':
              newCustomData = this.combineJSON(this.value_newFieldName, this.value_selectedDefaultData);

              this.value_customTextarea = this.value_customTextarea ? `${this.value_customTextarea}\n${newCustomData}` : newCustomData;
              this.form.custom_data = this.value_customTextarea;
              break;
            case 'XML':
              newCustomData = this.combineXML(this.value_newFieldName, this.value_selectedDefaultData);

              this.value_customTextarea = this.value_customTextarea ? `${this.value_customTextarea}\n${newCustomData}` : newCustomData;
              this.form.custom_data = this.value_customTextarea;
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }

      this.value_newFieldName = '';
      this.value_selectedDefaultData = '';
    },
    onChangeCustomText(value) {
      this.value_customTextarea = value;

      if (this.form.method === 'GET') {
        this.form.url = `${this.form.url.split('?')[0]}${(this.value_customTextarea || '') === '' ? '' : '?'}${this.value_customTextarea || ''}`;
      } else if (this.form.method === 'POST') {
        this.form.custom_data = this.value_customTextarea;
      }
    },
    checkBody(value) {
      if (value === '') return '';
      if (this.form.method === 'GET') {
        const regex = /^(?:&[^\s&=]+=##[^#]+##)(?:&[^\s&=]+=##[^#]+##)*$/;
        return regex.test(value) ? '' : this.$t('InvalidEmailFormat');
      }
      if (this.form.method === 'POST') {
        if (this.form.data_type === 'JSON') {
          const regex = /^("[^"]+":"##[^"]+##",(?:\n|$))+$/;
          return regex.test(value) ? '' : this.$t('InvalidEmailFormat');
        }
        if (this.form.data_type === 'XML') {
          const regex = /^(<[^>]+>##[^#]+##<\/[^>]+>(?:\n|$))+$/;
          return regex.test(value) ? '' : this.$t('InvalidEmailFormat');
        }
      }
      return '';
    },
  },
  created() {
    this.initialConvert();

    this.value_selectedData = this.form.data_type === 'JSON' ? 0 : 1;
  },
};
</script>
