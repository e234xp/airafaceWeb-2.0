<template>
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
              :is-valid="ipAddrValidator"
              :invalid-feedback="checkIpAddr(eventHttpHostAddress)"
              :value="eventHttpHostAddress"
              @input="handleUpdateEmitData('ventHttpHostAddress', $event)"
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
              :checked="eventHttpEnabledSSL"
              @update:checked="handleUpdateEmitData('eventHttpEnabledSSL', !$event)"
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
              :value="eventHttpUser"
              @input="handleUpdateEmitData('eventHttpUser', $event)"
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
                :value="eventHttpPass"
                @input="handleUpdateData('eventHttpPass', $event)"
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
          <div class="h5">
            {{ $t('Port') }}
          </div>
          <CInput
            size="lg"
            value=""
            v-model="value_eventHttpPort"
            placeholder=""
            :is-valid="val => portValidator('httpPortPass', val)"
            :invalid-feedback="checkPort(value_eventHttpPort)"
          />
        </CCol>
        <CCol sm="3">
          <div class="h5">
            PATH

            <span
              class="h6 table-td px-3 py-0"
              style="vertical-align: bottom;"
            >ex: http://127.0.0.1:7001/api/createEvent</span>
          </div>
          <CInput
            size="lg"
            value=""
            style="display: inline-block; width: 85%"
            v-model="value_eventHttpUrl"
            placeholder=""
            :is-valid="urlValidator"
            :invalid-feedback="$t('InvalidURL')"
          />
        </CCol>
        <CCol
          sm="6"
          v-if="value_eventHttpMethod == 'GET'"
        >
          <div class="h5">
            {{ $t('ShowCompleteUrl') }}
          </div>
          <CInput
            size="lg"
            :value="value_eventHttpUrl"
            placeholder=""
            readonly
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
                @change="clearSetting"
                :value.sync="value_eventHttpMethod"
                :options="value_eventHttpMethodList"
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
                      style="display: block; margin-bottom: 0px"
                      value=""
                      v-model="value_newFieldName"
                      placeholder=""
                      :is-valid="(val) => isNotEmptyValidator('newFieldNamePass', val)"
                      :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                      required
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
                        :value.sync="value_selectedDefaultData"
                        :options="value_defaultDataList"
                      />
                    </div>
                  </CCol>

                  <CCol
                    sm="2"
                    style="flex: 0 0 14.666667%; max-width: 14.666667%"
                  >
                    <span
                      class="h5"
                      v-if="
                        value_dataType == 'JSON' &&
                          value_eventHttpMethod == 'POST'
                      "
                      style="position: relative; display: block"
                    >
                      {{ $t('JSONType') }}
                    </span>
                    <span
                      class="h5"
                      v-if="
                        value_dataType == 'XML' &&
                          value_eventHttpMethod == 'POST'
                      "
                      style="position: relative; display: block"
                    >
                      {{ $t('XMLType') }}
                    </span>
                    <CButtonGroup
                      v-if="value_eventHttpMethod == 'POST'"
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
                      v-if="value_eventHttpMethod == 'GET'"
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
                      v-if="value_eventHttpMethod == 'POST'"
                      id="customBody1"
                      v-model="value_customTextarea"
                      spellcheck="false"
                      rows="10"
                      placeholder=""
                      style="position: relative; width: 100%"
                    />
                    <CTextarea
                      v-else
                      id="customBody2"
                      v-model="value_customTextarea"
                      spellcheck="false"
                      rows="10"
                      placeholder=""
                      style="position: relative; width: 100%"
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
</template>

<script>

export default {
  name: 'Step2FormHttp',
  props: {
    // http
    eventHttpHostAddress: String,
    eventHttpEnabledSSL: Boolean,
    eventHttpUser: String,
    eventHttpPass: String,
  },
};
</script>
