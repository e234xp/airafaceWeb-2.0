<template>
  <section>
    <CCard>
      <CCardBody>
        <CRow class="mb-4">
          <CCol
            sm="3"
          >
            <div>
              <div class="h5">
                {{ $t('HostAddress') }}
              </div>
              <CInput
                size="lg"
                placeholder=""
                required
                :is-valid="formPass.host = checkIpAddr(form.host) === ''"
                :invalid-feedback="checkIpAddr(form.host)"
                v-model="form.host"
              />
            </div>
          </CCol>
          <CCol
            sm="3"
          >
            <div class="column-space-between">
              <div class="h5">
                {{ $t('HttpEnabledSSL') }}
              </div>
              <CSwitch
                size="lg"
                class="mb-form-row"
                color="success"
                shape="pill"
                :checked="form.https"
                @update:checked="form.https = $event"
              />
            </div>
          </CCol>
          <CCol
            sm="3"
          >
            <div class="column-space-between">
              <div class="h5">
                {{ $t('Username') }}
              </div>
              <CInput
                class="mb-form-row"
                size="lg"
                placeholder=""
                :is-valid="formPass.user = isNotEmptyValidator(form.user) === ''"
                :invalid-feedback="isNotEmptyValidator(form.user)"
                v-model="form.user"
              />
            </div>
          </CCol>
          <CCol sm="3">
            <div class="column-space-between">
              <div class="h5">
                {{ $t('Password') }}
              </div>
              <form>
                <CInput
                  class="mb-form-row"
                  size="lg"
                  placeholder=""
                  autocomplete="on"
                  :type="flag_view_password ? 'text' : 'password'"
                  :is-valid="formPass.pass = isNotEmptyValidator(form.pass) === ''"
                  :invalid-feedback="isNotEmptyValidator(form.pass)"
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
            </div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="3">
            <div class="h5">
              {{ $t('Port') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.port = checkPort(form.port) === ''"
              :invalid-feedback="checkPort(form.port)"
              v-model="form.port"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              PATH
            </div>
            <CInput
              id="pathInput"
              type="text"
              size="lg"
              style="display: inline-block; width: 85%"
              prepend="/"
              v-model="value_realTime_eventHttpUrl"
              @input="handlePathInput"
            />
          </CCol>
          <CCol
            sm="6"
            v-if="form.method === 'GET'"
          >
            <div class="h5">
              {{ $t('ShowCompleteUrl') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              readonly
              :value="form.url"
            />
          </CCol>
        </CRow>
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
                  Method
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
                      style=""
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
                        v-model="value_customTextarea"
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
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => () => '',
    },
    checkPort: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkIpAddr: {
      type: Function,
      required: true,
      default: () => '',
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
        {
          label: `${this.$t('VerifiedTimeStamp')}  (String)`,
          value: '##VerifiedTimeStamp##',
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
        const [, value] = copyUrl.split('/');
        const [result] = value.split('?');
        this.value_realTime_eventHttpUrl = this.form.url.startsWith('/') ? result : this.form.url;

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

          this.value_customTextarea = `${this.value_customTextarea}${newCustomData}`;
          this.form.url = `${this.form.url}?${newCustomData}`;
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
  },
  created() {
    this.initialConvert();

    this.value_selectedData = this.form.data_type === 'JSON' ? 0 : 1;
  },
};
</script>
