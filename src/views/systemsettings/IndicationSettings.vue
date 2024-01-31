<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ $t('IndicationSettings') }}
      </div>

      <CCard>
        <CCardBody>
          <CRow class="align-items-center">
            <CButton
              class="btn btn-primary btn-w-normal mx-3"
              @click="clickOnApplySettings"
              :disabled="
                value_useHttp_disp
                  ? !(flag_dataChanged && value_httpParamPass)
                  : !(value_useHttp_disp != value_useHttp || flag_dataChanged)
              "
            >
              <div style="font-size: 20px">
                {{ $t('Apply') }}
              </div>
            </CButton>

            <CSwitch
              size="lg"
              color="secondary"
              :checked="value_useHttp_disp"
              @update:checked="switchMode()"
            />

            <div class="h2 mb-0 ml-3 p-0">
              {{ disp_settingType }}
            </div>
          </CRow>
        </CCardBody>
      </CCard>
      <CCard v-if="!value_useHttp_disp">
        <CCardBody>
          <CRow>
            <!-- 辨識成功提示 左欄 -->
            <CCol sm="3">
              <CCol sm="12">
                <div class="h4 p-0 mt-3 h-xxxl d-flex justify-content-center text-center">
                  {{ $t('VerifiedIndication') }}
                </div>

                <!-- 綠色區 -->
                <div
                  class="w-100 d-flex flex-column align-items-center"
                  :style="`background-color:${value_verifiedBackgroundColor_disp};`"
                >
                  <div
                    class="fz-lg h-xxxl font-weight-bold text-center p-2 mb-3 text-break"
                    :style="`color:${value_verifiedTextColor_disp};`"
                  >
                    {{ value_verifiedTopMessage_converted || value_topMessage_default }}
                  </div>

                  <img
                    class="w-100 p-3 mb-3"
                    v-if="!value_verifiedImageUseDynamicQrCode_disp"
                    id="verified_image"
                    :src="
                      value_verifiedIndicationImage_disp ||
                        value_verifiedIndicationImage_default
                    "
                  >

                  <vue-qr
                    v-if="value_verifiedImageUseDynamicQrCode_disp"
                    :text="value_verifiedImageQrcodeString_converted"
                    class="w-75 mb-3"
                  />

                  <div
                    class="fz-lg h-xxxl font-weight-bold text-center"
                    :style="`color:${value_verifiedTextColor_disp};`"
                  >
                    {{
                      value_verifiedBottomMessage_converted || value_bottomMessage_default
                    }}
                  </div>

                  <div v-if="value_verifiedImageUseDynamicQrCode_disp">
                    <textarea
                      class="form-control mb-3"
                      rows="10"
                      :value="value_dynamicParamsFormat"
                      readonly
                    />
                  </div>
                </div>
              </CCol>
            </CCol>
            <!-- 辨識成功提示 右欄 -->
            <CCol sm="3">
              <CCol sm="12">
                <CCol sm="12">
                  <div class="h5 mt-3">
                    {{ $t('TopMessage') }}
                  </div>
                  <CInput
                    size="lg"
                    v-model="value_verifiedTopMessage_disp"
                    :placeholder="$t('DefaultValue')"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('BottomMessage') }}
                  </div>
                  <CInput
                    size="lg"
                    v-model="value_verifiedBottomMessage_disp"
                    :placeholder="$t('DefaultValue')"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('TextColor') }}
                  </div>
                  <CInput
                    size="lg"
                    type="color"
                    style=""
                    v-model="value_verifiedTextColor_disp"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('BackgroundColor') }}
                  </div>
                  <CInput
                    size="lg"
                    type="color"
                    style=""
                    v-model="value_verifiedBackgroundColor_disp"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('DisplayImage') }}
                  </div>
                  <div style="height: 10px" />
                  <CRow>
                    <CSwitch
                      color="secondary"
                      style="margin: 0 20px 0 15px"
                      :checked="value_verifiedImageUseDynamicQrCode_disp"
                      @update:checked="switchVerifiedImageType()"
                    />
                    <div class="h5">
                      {{ disp_displayVerifiedImageType }}
                    </div>
                  </CRow>
                  <div style="height: 20px" />
                  <CButton
                    v-if="!value_verifiedImageUseDynamicQrCode_disp"
                    variant="outline"
                    style="height: 45px; color: #20a8d8; border: 1px solid #20a8d8"
                    size="lg"
                    color="light"
                    @click="clickOnPickImageForVerified"
                  >
                    {{ $t('Select') }}
                  </CButton>
                  <textarea
                    v-if="value_verifiedImageUseDynamicQrCode_disp"
                    class="form-control"
                    style="font-size: 14px; resize: none"
                    rows="7"
                    v-model="value_verifiedImageQrcodeString_disp"
                  />
                </CCol>
              </CCol>
            </CCol>

            <!-- 辨識失敗提示 左欄 = -->
            <CCol sm="3">
              <CCol sm="12">
                <div class="h4 p-0 mt-3 h-xxxl d-flex justify-content-center text-center">
                  {{ $t('UnverifiedIndication') }}
                </div>

                <!-- 紅色區 -->
                <div
                  class="w-100 d-flex flex-column align-items-center"
                  :style="`background-color:${value_unverifiedBackgroundColor_disp};`"
                >
                  <div
                    class="fz-lg h-xxxl font-weight-bold text-center p-2 mb-3 text-break"
                    :style="`color:${value_unverifiedTextColor_disp};`"
                  >
                    {{ value_unverifiedTopMessage_converted || value_topMessage_default }}
                  </div>

                  <img
                    v-if="!value_unverifiedImageUseDynamicQrCode_disp"
                    class="w-100 p-3 mb-3"
                    id="nonVerified_image"
                    :src="
                      value_unverifiedIndicationImage_disp ||
                        value_unverifiedIndicationImage_default
                    "
                  >
                  <vue-qr
                    v-if="value_unverifiedImageUseDynamicQrCode_disp"
                    :text="value_unverifiedImageQrcodeString_converted"
                    class="w-75 mb-3"
                  />

                  <div
                    class="fz-lg h-xxxl font-weight-bold text-center"
                    :style="`color:${value_unverifiedTextColor_disp};`"
                  >
                    {{
                      value_unverifiedBottomMessage_converted ||
                        value_bottomMessage_default
                    }}
                  </div>

                  <div v-if="value_unverifiedImageUseDynamicQrCode_disp">
                    <textarea
                      class="form-control mb-3"
                      rows="10"
                      :value="value_dynamicParamsFormat"
                      readonly
                    />
                  </div>
                </div>
              </CCol>
            </CCol>
            <!-- 辨識失敗提示 右欄 = -->
            <CCol sm="3">
              <CCol sm="12">
                <CCol sm="12">
                  <div class="h5 mt-3">
                    {{ $t('TopMessage') }}
                  </div>
                  <CInput
                    size="lg"
                    v-model="value_unverifiedTopMessage_disp"
                    :placeholder="$t('DefaultValue')"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('BottomMessage') }}
                  </div>
                  <CInput
                    size="lg"
                    v-model="value_unverifiedBottomMessage_disp"
                    :placeholder="$t('DefaultValue')"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('TextColor') }}
                  </div>
                  <CInput
                    size="lg"
                    type="color"
                    style=""
                    v-model="value_unverifiedTextColor_disp"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('BackgroundColor') }}
                  </div>
                  <CInput
                    size="lg"
                    type="color"
                    style=""
                    v-model="value_unverifiedBackgroundColor_disp"
                  />
                </CCol>
                <CCol sm="12">
                  <div class="h5">
                    {{ $t('DisplayImage') }}
                  </div>
                  <div style="height: 10px" />
                  <CRow>
                    <CSwitch
                      color="secondary"
                      style="margin: 0 20px 0 15px"
                      :checked="value_unverifiedImageUseDynamicQrCode_disp"
                      @update:checked="switchNonVerifiedImageType()"
                    />
                    <div class="h5">
                      {{ disp_displayUnverifiedImageType }}
                    </div>
                  </CRow>
                  <div style="height: 20px" />
                  <CButton
                    v-if="!value_unverifiedImageUseDynamicQrCode_disp"
                    variant="outline"
                    style="height: 45px; color: #20a8d8; border: 1px solid #20a8d8"
                    size="lg"
                    color="light"
                    @click="clickOnPickImageForUnverified"
                  >
                    {{ $t('Select') }}
                  </CButton>
                  <textarea
                    v-if="value_unverifiedImageUseDynamicQrCode_disp"
                    class="form-control"
                    style="font-size: 14px; resize: none"
                    rows="7"
                    v-model="value_unverifiedImageQrcodeString_disp"
                  />
                </CCol>
              </CCol>
            </CCol>
          </CRow>
        </CCardBody>
        <CRow>
          <CCol sm="12">
            <div class="row justify-content-center">
              <CButton
                @click="clickOnDefaultSettings"
                class="btn btn-primary mb-3"
                size="lg"
              >
                {{ $t('DefaultValue') }}
              </CButton>
            </div>
          </CCol>
        </CRow>
      </CCard>

      <CCard v-if="value_useHttp_disp">
        <CCardBody>
          <CCol sm="12">
            <CRow>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ $t('HostAddress') }}
                  </div>
                  <CInput
                    size="lg"
                    :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                    value=""
                    v-model="value_httpHostAddress_disp"
                    placeholder=""
                    :is-valid="hostAddressValidator"
                    required
                  />
                </div>
              </CCol>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ $t('HttpEnabledSSL') }}
                  </div>
                  <CSwitch
                    size="lg"
                    class="ml-0 mb-16"
                    color="success"
                    shape="pill"
                    @update:checked="
                      value_httpEnabledSSL_disp = !value_httpEnabledSSL_disp
                    "
                    :checked="value_httpEnabledSSL_disp"
                  />
                </div>
              </CCol>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ $t('Username') }}
                  </div>
                  <CInput
                    size="lg"
                    value=""
                    v-model="value_httpUser_disp"
                    placeholder=""
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
                      size="lg"
                      value=""
                      v-model="value_httpPass_disp"
                      placeholder=""
                      :type="flag_view_password ? 'text' : 'password'"
                      autocomplete="on"
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
                  </form>
                </div>
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ $t('Port') }}
                  </div>
                  <CInput
                    size="lg"
                    value=""
                    v-model="value_httpPort_disp"
                    placeholder=""
                    :is-valid="numberValidator"
                    :invalid-feedback="$t('NumbersOnly')"
                  />
                </div>
              </CCol>
              <CCol sm="6">
                <div class="column-space-between">
                  <div class="h5">
                    {{ disp_httpUrl }}
                  </div>
                  <CInput
                    size="lg"
                    value=""
                    v-model="value_httpUrl_disp"
                    placeholder=""
                    :is-valid="urlValidator"
                    :invalid-feedback="$t('InvalidURL')"
                  />
                </div>
              </CCol>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ $t('ConnectTimetoutMs') }}
                  </div>
                  <CInput
                    size="lg"
                    value=""
                    v-model="value_httpTimeout_disp"
                    placeholder=""
                    :is-valid="numberValidator"
                    :invalid-feedback="$t('NumbersOnly')"
                  />
                </div>
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="6">
                <div class="h5">
                  REQUEST URL
                </div>
                <textarea
                  class="form-control"
                  style="resize: none; font-size: 20px"
                  rows="9"
                  :value="value_completeUrl"
                  readonly
                />
              </CCol>
              <CCol sm="6">
                <div class="h5">
                  RESPONSE ( Content-Type : "application/json" )
                </div>
                <textarea
                  class="form-control"
                  style="resize: none; font-size: 20px"
                  rows="9"
                  :value="value_resposeFormat"
                  readonly
                />
              </CCol>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import VueQr from 'vue-qr';

// eslint-disable-next-line max-len
const verifiedIndicationImageDefault = 'data:image/png;base64,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';

// eslint-disable-next-line max-len
const unverifiedIndicationImageDefault = 'data:image/png;base64,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';

export default {
  name: 'FactoryDefault',

  data() {
    return {
      param_cardStyle: 'height: 35rem;',

      flag_view_password: false,

      disp_displayVerifiedImageType: this.$t('StaticPicture'),
      disp_displayUnverifiedImageType: this.$t('StaticPicture'),

      disp_httpUrl: 'PATH', // this.$t("HttpUrl"), //
      disp_showCompleteUrl: 'QUERY', // this.$t("ShowCompleteUrl"), //

      disp_settingType: this.$t('StaticSettings'), //

      value_useHttp: false,
      value_httpHostAddress: '', //
      value_httpEnabledSSL: false, //
      value_httpUser: '', //
      value_httpPass: '', //
      value_httpPort: 80, //
      value_httpUrl: '/', //
      value_httpMethod: 'GET',
      value_httpTimeout: 3000,

      value_verifiedImageUseDynamicQrCode_disp: false,
      value_verifiedImageUseDynamicQrCode: false,
      value_verifiedImageQrcodeString_disp: '',
      value_verifiedImageQrcodeString_converted: '',
      value_verifiedImageQrcodeString: '',

      value_unverifiedImageUseDynamicQrCode_disp: false,
      value_unverifiedImageUseDynamicQrCode: false,
      value_unverifiedImageQrcodeString_disp: '',
      value_unverifiedImageQrcodeString_converted: '',
      value_unverifiedImageQrcodeString: '',

      value_useHttp_disp: false,
      value_httpHostAddress_disp: '', //
      value_httpEnabledSSL_disp: false, //
      value_httpUser_disp: '', //
      value_httpPass_disp: '', //
      value_httpPort_disp: 80, //
      value_httpUrl_disp: '/', //
      value_httpMethod_disp: 'GET',
      value_httpTimeout_disp: 3000,

      value_completeUrl: '',

      value_verifiedTextColor: '#ffffff',
      value_verifiedBackgroundColor: '#048729',
      value_verifiedTopMessage: '',
      value_verifiedBottomMessage: '',
      value_verifiedIndicationImage: '',

      value_verifiedTextColor_disp: '#ffffff',
      value_verifiedBackgroundColor_disp: '#048729',
      value_verifiedTopMessage_disp: '',
      value_verifiedTopMessage_converted: '',
      value_verifiedBottomMessage_disp: '',
      value_verifiedBottomMessage_converted: '',
      value_verifiedIndicationImage_disp: '',

      value_unverifiedTextColor: '#ffffff',
      value_unverifiedBackgroundColor: '#d50000',
      value_unverifiedTopMessage: '',
      value_unverifiedBottomMessage: '',
      value_unverifiedIndicationImage: '',

      value_unverifiedTextColor_disp: '#ffffff',
      value_unverifiedBackgroundColor_disp: '#d50000',
      value_unverifiedTopMessage_disp: '',
      value_unverifiedTopMessage_converted: '',
      value_unverifiedBottomMessage_disp: '',
      value_unverifiedBottomMessage_converted: '',
      value_unverifiedIndicationImage_disp: '',

      value_topMessage_default: '',
      value_bottomMessage_default: this.$t('DefaultValue'),
      value_verifiedIndicationImage_default: verifiedIndicationImageDefault,
      value_unverifiedIndicationImage_default: unverifiedIndicationImageDefault,
      value_tabletSettings: null,
      flag_changingSettings: false,
      flag_dataChanged: false,
      value_httpParamPass: false,
      value_resposeFormat: `{
  "top_message" : "message string",
  "bottom_message" : "message string",
  "text_color" : "#ffffff",
  "background_color" : "#d50000",
  "base64_image" : "base64image string"
}`,
      value_dynamicParamsFormat: `Match : {{match}}
Timestamp : {{timestamp}}
Person id : {{personId}}
Person name : {{personName}}
Group List : {{groupList}}
Temperature : {{temperature}}

http ex : https://action.go/verify?known={{match}}&id={{personId}}

sms ex : SMSTO:0988123456:{{personName}} is clockin
    `,
    };
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {
    this.flag_changingSettings = true;
    this.$globalGetTabletSetting(function (err, data) {
      if (!err) {
        this.value_tabletSettings = data;
        this.resetSettings(data);
        if (this.value_useHttp_disp) {
          // FIXME: no i18n
          this.disp_settingType = this.$t('FetchViaHttp');
        } else {
          // FIXME: no i18n
          this.disp_settingType = this.$t('StaticSettings');
        }

        if (this.value_verifiedImageUseDynamicQrCode_disp) {
          this.disp_displayVerifiedImageType = this.$t('GeneratedQrcode');
        } else {
          this.disp_displayVerifiedImageType = this.$t('StaticPicture');
        }
        if (this.value_unverifiedImageUseDynamicQrCode_disp) {
          this.disp_displayUnverifiedImageType = this.$t('GeneratedQrcode');
        } else {
          this.disp_displayUnverifiedImageType = this.$t('StaticPicture');
        }
        this.buildUrl();
      }
      this.flag_changingSettings = false;
    });
  },
  watch: {
    value_useHttp_disp(value) {
      if (value) {
        // FIXME: no i18n
        this.disp_settingType = this.$t('FetchViaHttp');
      } else {
        // FIXME: no i18n
        this.disp_settingType = this.$t('StaticSettings');
      }
    },
    value_httpHostAddress_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpEnabledSSL_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpUser_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpPass_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpPort_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpUrl_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_httpTimeout_disp() {
      this.flag_dataChanged = this.dataChanged();
      this.buildUrl();
    },
    value_verifiedTextColor_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_verifiedBackgroundColor_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_verifiedTopMessage_disp(value) {
      this.value_verifiedTopMessage_converted = this.covertString(value);
      this.flag_dataChanged = this.dataChanged();
    },
    value_verifiedBottomMessage_disp(value) {
      this.value_verifiedBottomMessage_converted = this.covertString(value);
      this.flag_dataChanged = this.dataChanged();
    },
    value_verifiedIndicationImage_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedTextColor_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedBackgroundColor_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedTopMessage_disp(value) {
      this.value_unverifiedTopMessage_converted = this.covertString(value);

      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedBottomMessage_disp(value) {
      this.value_unverifiedBottomMessage_converted = this.covertString(value);
      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedIndicationImage_disp() {
      this.flag_dataChanged = this.dataChanged();
    },
    value_verifiedImageQrcodeString_disp(value) {
      this.value_verifiedImageQrcodeString_converted = this.covertStringQr(value);
      this.flag_dataChanged = this.dataChanged();
    },
    value_unverifiedImageQrcodeString_disp(value) {
      this.value_unverifiedImageQrcodeString_converted = this.covertStringQr(value);
      this.flag_dataChanged = this.dataChanged();
    },
  },
  components: { VueQr },
  methods: {
    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },

    covertString(value) {
      let s = value;
      const formatDate = (fmt) => {
        let newFmt = fmt;
        const d = new Date();
        const o = {
          'M+': d.getMonth() + 1, // 月份
          'd+': d.getDate(), // 日
          'h+': d.getHours(), // 小時
          'm+': d.getMinutes(), // 分
          's+': d.getSeconds(), // 秒
          'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
          S: d.getMilliseconds(), // 毫秒
        };
        if (/(y+)/.test(fmt)) {
          newFmt = fmt.replace(
            RegExp.$1,
            (`${d.getFullYear()}`).substr(4 - RegExp.$1.length),
          );
        }
        Object.keys(o).forEach((k) => {
          if (new RegExp(`(${k})`).test(fmt)) {
            newFmt = fmt.replace(
              RegExp.$1,
              RegExp.$1.length == 1 ? o[k] : (`00${o[k]}`).substr((`${o[k]}`).length),
            );
          }
        });
        return newFmt;
      };
      s = s.replaceAll('{{personId}}', 'A-001');
      s = s.replaceAll('{{personName}}', 'John');
      s = s.replaceAll('{{match}}', 'true');
      s = s.replaceAll('{{timestamp}}', Date.now());
      s = s.replaceAll('{{groupList}}', '["vip"]');
      s = s.replaceAll('{{temperature}}', '36.5');
      s = s.replaceAll('{{date}}', formatDate('yyyy-MM-dd'));
      s = s.replaceAll('{{time}}', formatDate('hh:mm:ss'));
      s = s.replaceAll('{{br}}', '\n');
      return s;
    },
    covertStringQr(value) {
      let s = value;
      s = s.replaceAll('{{personId}}', 'A-001');
      s = s.replaceAll('{{personName}}', 'John');
      s = s.replaceAll('{{match}}', 'true');
      s = s.replaceAll('{{timestamp}}', '1234567890123');
      s = s.replaceAll('{{groupList}}', '["vip"]');
      s = s.replaceAll('{{temperature}}', '36.5');
      return s;
    },
    switchMode() {
      this.value_useHttp_disp = !this.value_useHttp_disp;
      this.value_verifiedTextColor_disp = this.value_verifiedTextColor;
      this.value_verifiedBackgroundColor_disp = this.value_verifiedBackgroundColor;
      this.value_verifiedTopMessage_disp = this.value_verifiedTopMessage;
      this.value_verifiedBottomMessage_disp = this.value_verifiedBottomMessage;
      this.value_verifiedIndicationImage_disp = this.value_verifiedIndicationImage;

      this.value_unverifiedTextColor_disp = this.value_unverifiedTextColor;
      this.value_unverifiedBackgroundColor_disp = this.value_unverifiedBackgroundColor;
      this.value_unverifiedTopMessage_disp = this.value_unverifiedTopMessage;
      this.value_unverifiedBottomMessage_disp = this.value_unverifiedBottomMessage;
      this.value_unverifiedIndicationImage_disp = this.value_unverifiedIndicationImage;

      this.value_httpHostAddress_disp = this.value_httpHostAddress;
      this.value_httpEnabledSSL_disp = this.value_httpEnabledSSL;
      this.value_httpUser_disp = this.value_httpUser;
      this.value_httpPass_disp = this.value_httpPass;
      this.value_httpPort_disp = this.value_httpPort;
      this.value_httpUrl_disp = this.value_httpUrl;
      this.value_httpMethod_disp = this.value_httpMethod;
      this.value_httpTimeout_disp = this.value_httpTimeout;

      this.value_verifiedImageUseDynamicQrCode_disp = this.value_verifiedImageUseDynamicQrCode;
      this.value_verifiedImageQrcodeString_disp = this.value_verifiedImageQrcodeString;
      if (this.value_verifiedImageUseDynamicQrCode_disp) {
        this.$ = this.$t('GeneratedQrcode');
      } else {
        this.disp_displayVerifiedImageType = this.$t('StaticPicture');
      }

      this.value_unverifiedImageUseDynamicQrCode_disp = this.value_unverifiedImageUseDynamicQrCode;
      this.value_unverifiedImageQrcodeString_disp = this.value_unverifiedImageQrcodeString;
      if (this.value_unverifiedImageUseDynamicQrCode_disp) {
        this.disp_displayUnverifiedImageType = this.$t('GeneratedQrcode');
      } else {
        this.disp_displayUnverifiedImageType = this.$t('StaticPicture');
      }
      // this.buildUrl();
    },
    switchVerifiedImageType() {
      this.value_verifiedImageUseDynamicQrCode_disp = !this.value_verifiedImageUseDynamicQrCode_disp;
      this.value_verifiedImageQrcodeString_disp = this.value_verifiedImageQrcodeString;

      if (this.value_verifiedImageUseDynamicQrCode_disp) {
        this.disp_displayVerifiedImageType = this.$t('GeneratedQrcode');
      } else {
        this.disp_displayVerifiedImageType = this.$t('StaticPicture');
      }
      this.flag_dataChanged = this.dataChanged();
    },
    switchNonVerifiedImageType() {
      this.value_unverifiedImageUseDynamicQrCode_disp = !this.value_unverifiedImageUseDynamicQrCode_disp;
      this.value_unverifiedImageQrcodeString_disp = this.value_unverifiedImageQrcodeString;

      if (this.value_unverifiedImageUseDynamicQrCode_disp) {
        this.disp_displayUnverifiedImageType = this.$t('GeneratedQrcode');
      } else {
        this.disp_displayUnverifiedImageType = this.$t('StaticPicture');
      }
      this.flag_dataChanged = this.dataChanged();
    },
    dataChanged() {
      const changed = this.value_verifiedTextColor_disp != this.value_verifiedTextColor
          || this.value_verifiedBackgroundColor_disp != this.value_verifiedBackgroundColor
          || this.value_verifiedTopMessage_disp != this.value_verifiedTopMessage
          || this.value_verifiedBottomMessage_disp != this.value_verifiedBottomMessage
          || this.value_verifiedIndicationImage_disp != this.value_verifiedIndicationImage
          || this.value_unverifiedTextColor_disp != this.value_unverifiedTextColor
          || this.value_unverifiedBackgroundColor_disp
          != this.value_unverifiedBackgroundColor
          || this.value_unverifiedTopMessage_disp != this.value_unverifiedTopMessage
          || this.value_unverifiedBottomMessage_disp != this.value_unverifiedBottomMessage
          || this.value_unverifiedIndicationImage_disp
          != this.value_unverifiedIndicationImage
          || this.value_httpHostAddress_disp != this.value_httpHostAddress
          || this.value_httpPort_disp != this.value_httpPort
          || this.value_httpUser_disp != this.value_httpUser
          || this.value_httpPass_disp != this.value_httpPass
          || this.value_httpUrl_disp != this.value_httpUrl
          || this.value_httpMethod_disp != this.value_httpMethod
          || this.value_httpTimeout_disp != this.value_httpTimeout
          || this.value_verifiedImageUseDynamicQrCode_disp
          != this.value_verifiedImageUseDynamicQrCode
          || this.value_unverifiedImageUseDynamicQrCode_disp
          != this.value_unverifiedImageUseDynamicQrCode
          || this.value_verifiedImageQrcodeString_disp
          != this.value_verifiedImageQrcodeString
          || this.value_unverifiedImageQrcodeString_disp
          != this.value_unverifiedImageQrcodeString;
      return changed;
    },
    buildUrl() {
      this.value_completeUrl = this.value_httpEnabledSSL_disp ? 'https://' : 'http://';
      // if( this.value_httpUser.length > 0 ) {
      //   this.value_completeUrl += this.value_httpUser + ":" + "[password]@";
      // }
      this.value_completeUrl
          += `${this.value_httpHostAddress_disp}:${this.value_httpPort_disp}`;
      if (this.value_httpUrl_disp.length == 0 || this.value_httpUrl_disp[0] != '/') {
        this.value_completeUrl += '/';
      }
      this.value_completeUrl
          += `${this.value_httpUrl_disp
        }?match=[boolean]&time=[timestamp]&personId=[string]&personName=[string]&groupList=[string]&temperature=[float]`;
      this.value_httpParamPass = this.hostAddressValidator()
          && this.portValidator()
          && this.urlValidator()
          && this.timeoutValidator();

      // console.log( " this.value_httpParamPass :", this.value_httpParamPass );
    },
    portValidator() {
      const processStr = `${this.value_httpPort_disp}`;
      if (typeof processStr != 'string') return false; // we only process strings!
      return (
        !Number.isNaN(processStr) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          && !Number.isNaN(parseFloat(processStr))
      ); // ...and ensure strings of whitespace fail
    },
    timeoutValidator() {
      const processStr = `${this.value_httpTimeout_disp}`;
      if (typeof processStr != 'string') return false; // we only process strings!
      return (
        !Number.isNaN(processStr) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          && !Number.isNaN(parseFloat(processStr))
      ); // ...and ensure strings of whitespace fail
    },
    numberValidator(val) {
      const processStr = `${val}`;
      if (typeof processStr != 'string') return false; // we only process strings!
      return (
        !Number.isNaN(processStr) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          && !Number.isNaN(parseFloat(processStr))
      ); // ...and ensure strings of whitespace fail
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
    urlValidator() {
      const processStr = `https://127.0.0.1${
        this.value_httpUrl_disp.length > 0 && this.value_httpUrl_disp[0] != '/'
          ? '/'
          : ''
      }${this.value_httpUrl_disp}`;
      return this.urlValidatorFn(processStr);
    },
    hostAddressValidator() {
      let flagPass = false;
      const val = this.value_httpHostAddress_disp;
      if (this.value_useHttp_disp == true) {
        if (val.replace(/\s/g, '').length == 0) {
          flagPass = false;
          this.flag_hostData = false;
        } else {
          flagPass = val.length > 0;
          this.flag_hostData = true;
        }
      } else {
        this.flag_hostData = true;
        return null;
      }
      return flagPass;
    }, //
    resizeImageFromDataURL(box, base64Str, maxWidth, maxHeight, callBack) {
      // We create an image to receive the Data URI
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.x = 0;
          canvas.y = 0;
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext('2d');
          if (box) {
            ctx.drawImage(
              img,
              box.x,
              box.y,
              box.width,
              box.height,
              0,
              0,
              maxWidth,
              maxHeight,
            );
          } else ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, maxWidth, maxHeight);
          if (callBack) callBack(canvas.toDataURL('image/png', 1.0));
        } catch (e) {
          if (callBack) callBack(null);
        }
      };
    },
    selectPhotoFromFile(cb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onclick = function (e) {
        if (e.target.value.length == 0) {
          if (cb) cb(null);
        }
      };
      input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file, 'UTF-8');
        reader.onload = async (readerEvent) => {
          const img = document.createElement('img');
          img.src = readerEvent.target.result;

          if (cb) cb(img);
        };
      };
      input.click();
    },
    clickOnPickImageForVerified() {
      this.selectPhotoFromFile((img) => {
        if (img) {
          this.resizeImageFromDataURL(null, img.src, 300, 300, (base64Img) => {
            this.value_verifiedIndicationImage_disp = base64Img;
          });
        }
      });
    },
    clickOnPickImageForUnverified() {
      this.selectPhotoFromFile((img) => {
        if (img) {
          this.resizeImageFromDataURL(null, img.src, 300, 300, (base64Img) => {
            this.value_unverifiedIndicationImage_disp = base64Img;
          });
        }
      });
    },
    resetSettings(tabletSettings) {
      if (tabletSettings) {
        if (tabletSettings && tabletSettings.customize_verify_indication) {
          this.value_verifiedTextColor = '#ffffff';
          this.value_verifiedBackgroundColor = '#048729';
          this.value_verifiedTopMessage = '';
          this.value_verifiedBottomMessage = '';
          this.value_verifiedIndicationImage = '';
          this.value_unverifiedTextColor = '#ffffff';
          this.value_unverifiedBackgroundColor = '#d50000';
          this.value_unverifiedTopMessage = '';
          this.value_unverifiedBottomMessage = '';
          this.value_unverifiedIndicationImage = '';

          this.value_unverifiedImageUseDynamicQrCode = false;
          this.value_unverifiedImageQrcodeString = '';
          this.value_unverifiedImageUseDynamicQrCode = false;
          this.value_unverifiedImageQrcodeString = '';

          this.value_useHttp = false;
          this.value_httpHostAddress = '';
          this.value_httpEnabledSSL = false;
          this.value_httpUser = '';
          this.value_httpPass = '';
          this.value_httpPort = 80;
          this.value_httpUrl = '/';
          this.value_httpMethod = 'GET';
          this.value_httpTimeout = 3000;

          if (tabletSettings.customize_verify_indication.static_verified_info) {
            this.value_verifiedTextColor = tabletSettings.customize_verify_indication.static_verified_info
              .text_color || '#ffffff';
            this.value_verifiedBackgroundColor = tabletSettings.customize_verify_indication.static_verified_info
              .background_color || '#048729';
            this.value_verifiedTopMessage = tabletSettings.customize_verify_indication.static_verified_info
              .top_message || '';
            this.value_verifiedBottomMessage = tabletSettings.customize_verify_indication.static_verified_info
              .bottom_message || '';
            this.value_verifiedIndicationImage = tabletSettings.customize_verify_indication.static_verified_info
              .base64_image || '';

            this.value_verifiedImageUseDynamicQrCode = tabletSettings.customize_verify_indication.static_verified_info
              .use_qrcode || false;
            this.value_verifiedImageQrcodeString = tabletSettings.customize_verify_indication.static_verified_info
              .qrcode_string || '';
          }
          if (tabletSettings.customize_verify_indication.static_unverified_info) {
            this.value_unverifiedTextColor = tabletSettings.customize_verify_indication.static_unverified_info
              .text_color || '#ffffff';
            this.value_unverifiedBackgroundColor = tabletSettings.customize_verify_indication.static_unverified_info
              .background_color || '#d50000';
            this.value_unverifiedTopMessage = tabletSettings.customize_verify_indication.static_unverified_info
              .top_message || '';
            this.value_unverifiedBottomMessage = tabletSettings.customize_verify_indication.static_unverified_info
              .bottom_message || '';
            this.value_unverifiedIndicationImage = tabletSettings.customize_verify_indication.static_unverified_info
              .base64_image || '';

            this.value_unverifiedImageUseDynamicQrCode = tabletSettings.customize_verify_indication.static_unverified_info
              .use_qrcode || false;
            this.value_unverifiedImageQrcodeString = tabletSettings.customize_verify_indication.static_unverified_info
              .qrcode_string || '';
          }
          if (tabletSettings.customize_verify_indication.http_custom_connection_info) {
            this.value_httpHostAddress = tabletSettings.customize_verify_indication.http_custom_connection_info
              .host || '';
            this.value_httpEnabledSSL = tabletSettings.customize_verify_indication.http_custom_connection_info
              .use_ssl || false;
            this.value_httpUser = tabletSettings.customize_verify_indication.http_custom_connection_info
              .username || '';
            this.value_httpPass = tabletSettings.customize_verify_indication.http_custom_connection_info
              .password || '';
            this.value_httpPort = tabletSettings.customize_verify_indication.http_custom_connection_info
              .port || 80;
            this.value_httpUrl = tabletSettings.customize_verify_indication.http_custom_connection_info
              .url || '';
            this.value_httpMethod = tabletSettings.customize_verify_indication.http_custom_connection_info
              .method || 'GET';
            this.value_httpTimeout = tabletSettings.customize_verify_indication.http_custom_connection_info
              .timeout || 3000;
          }
          if (tabletSettings.customize_verify_indication.use_http != null) {
            this.value_useHttp = tabletSettings.customize_verify_indication.use_http;
          }

          this.value_verifiedTextColor_disp = this.value_verifiedTextColor;
          this.value_verifiedBackgroundColor_disp = this.value_verifiedBackgroundColor;
          this.value_verifiedTopMessage_disp = this.value_verifiedTopMessage;
          this.value_verifiedBottomMessage_disp = this.value_verifiedBottomMessage;
          this.value_verifiedIndicationImage_disp = this.value_verifiedIndicationImage;

          this.value_unverifiedTextColor_disp = this.value_unverifiedTextColor;
          this.value_unverifiedBackgroundColor_disp = this.value_unverifiedBackgroundColor;
          this.value_unverifiedTopMessage_disp = this.value_unverifiedTopMessage;
          this.value_unverifiedBottomMessage_disp = this.value_unverifiedBottomMessage;
          this.value_unverifiedIndicationImage_disp = this.value_unverifiedIndicationImage;

          this.value_useHttp_disp = this.value_useHttp;
          this.value_httpHostAddress_disp = this.value_httpHostAddress;
          this.value_httpEnabledSSL_disp = this.value_httpEnabledSSL;
          this.value_httpUser_disp = this.value_httpUser;
          this.value_httpPass_disp = this.value_httpPass;
          this.value_httpPort_disp = this.value_httpPort;
          this.value_httpUrl_disp = this.value_httpUrl;
          this.value_httpMethod_disp = this.value_httpMethod;
          this.value_httpTimeout_disp = this.value_httpTimeout;

          this.value_verifiedImageUseDynamicQrCode_disp = this.value_verifiedImageUseDynamicQrCode;
          this.value_verifiedImageQrcodeString_disp = this.value_verifiedImageQrcodeString;
          this.value_unverifiedImageUseDynamicQrCode_disp = this.value_unverifiedImageUseDynamicQrCode;
          this.value_unverifiedImageQrcodeString_disp = this.value_unverifiedImageQrcodeString;
        }
      } else {
        this.value_verifiedTextColor_disp = '#ffffff';
        this.value_verifiedBackgroundColor_disp = '#048729';
        this.value_verifiedTopMessage_disp = '';
        this.value_verifiedBottomMessage_disp = '';
        this.value_verifiedIndicationImage_disp = '';

        this.value_unverifiedTextColor_disp = '#ffffff';
        this.value_unverifiedBackgroundColor_disp = '#d50000';
        this.value_unverifiedTopMessage_disp = '';
        this.value_unverifiedBottomMessage_disp = '';
        this.value_unverifiedIndicationImage_disp = '';

        this.value_verifiedImageUseDynamicQrCode_disp = false;
        this.value_verifiedImageQrcodeString_disp = '';
        this.value_unverifiedImageUseDynamicQrCode_disp = false;
        this.value_unverifiedImageQrcodeString_disp = '';
      }
    },
    clickOnDefaultSettings() {
      this.resetSettings();
    },
    async clickOnApplySettings() {
      this.flag_changingSettings = true;
      this.value_tabletSettings.customize_verify_indication = {
        use_http: this.value_useHttp_disp,
        static_verified_info: {},
        static_unverified_info: {},
      };

      if (this.value_useHttp_disp) {
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info = {};
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.use_ssl = this.value_httpEnabledSSL_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.host = this.value_httpHostAddress_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.port = this.value_httpPort_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.url = this.value_httpUrl_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.username = this.value_httpUser_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.password = this.value_httpPass_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.method = this.value_httpMethod_disp;
        this.value_tabletSettings.customize_verify_indication.http_custom_connection_info.timeout = this.value_httpTimeout_disp;
      } else {
        if (this.value_verifiedTextColor_disp) {
          this.value_tabletSettings.customize_verify_indication.static_verified_info.text_color = this.value_verifiedTextColor_disp;
        }
        if (this.value_verifiedBackgroundColor_disp) {
          this.value_tabletSettings.customize_verify_indication.static_verified_info.background_color = this.value_verifiedBackgroundColor_disp;
        }
        if (this.value_verifiedTopMessage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_verified_info.top_message = this.value_verifiedTopMessage_disp;
        }
        if (this.value_verifiedBottomMessage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_verified_info.bottom_message = this.value_verifiedBottomMessage_disp;
        }

        this.value_tabletSettings.customize_verify_indication.static_verified_info.use_qrcode = this.value_verifiedImageUseDynamicQrCode_disp;
        if (this.value_verifiedImageUseDynamicQrCode_disp) {
          if (this.value_verifiedImageQrcodeString_disp) {
            this.value_tabletSettings.customize_verify_indication.static_verified_info.qrcode_string = this.value_verifiedImageQrcodeString_disp;
          } else {
            this.value_tabletSettings.customize_verify_indication.static_verified_info.qrcode_string = '';
          }
        } else if (this.value_verifiedIndicationImage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_verified_info.base64_image = this.value_verifiedIndicationImage_disp;
        }

        if (this.value_unverifiedTextColor_disp) {
          this.value_tabletSettings.customize_verify_indication.static_unverified_info.text_color = this.value_unverifiedTextColor_disp;
        }
        if (this.value_unverifiedBackgroundColor_disp) {
          this.value_tabletSettings.customize_verify_indication.static_unverified_info.background_color = this.value_unverifiedBackgroundColor_disp;
        }
        if (this.value_unverifiedTopMessage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_unverified_info.top_message = this.value_unverifiedTopMessage_disp;
        }
        if (this.value_unverifiedBottomMessage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_unverified_info.bottom_message = this.value_unverifiedBottomMessage_disp;
        }

        this.value_tabletSettings.customize_verify_indication.static_unverified_info.use_qrcode = this.value_unverifiedImageUseDynamicQrCode_disp;
        if (this.value_unverifiedImageUseDynamicQrCode_disp) {
          if (this.value_unverifiedImageQrcodeString_disp) {
            this.value_tabletSettings.customize_verify_indication.static_unverified_info.qrcode_string = this.value_unverifiedImageQrcodeString_disp;
          } else {
            this.value_tabletSettings.customize_verify_indication.static_unverified_info.qrcode_string = '';
          }
        } else if (this.value_unverifiedIndicationImage_disp) {
          this.value_tabletSettings.customize_verify_indication.static_unverified_info.base64_image = this.value_unverifiedIndicationImage_disp;
        }
      }

      const applyRet = await this.$globalSetTabletSetting(this.value_tabletSettings);
      if (!applyRet.error) {
        let counterRetry = 0;
        let retry = true;
        let pass = false;
        while (retry) {
          const ret = await this.$globalGetTabletSetting();
          if (!ret.error && ret.data) {
            this.value_tabletSettings = ret.data;
            this.resetSettings(ret.data);
            this.flag_dataChanged = false;
            retry = false;
            pass = true;
          } else if (counterRetry + 1 < 10) {
            counterRetry += 1;
            await this.sleep(2000);
          }
        }
        this.$fire({
          text: pass
            ? this.$t('Successful')
            : this.$t('OperationFailed'),
          type: pass ? 'success' : 'error',
          timer: 3000,
        });
      }
      this.flag_changingSettings = false;
    },
  },
};
</script>
