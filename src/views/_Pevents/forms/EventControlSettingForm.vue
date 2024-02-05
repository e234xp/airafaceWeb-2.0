<template>
  <div>
    <CCol sm="12">
      <td class="h1">
        {{ disp_header }}
      </td>
      <stepprogress
        class="w-step-progress-4"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[
          disp_inputEventControlInfo,
          disp_inputEventControlNotify,
          disp_selectSchedule,
          disp_complete,
        ]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      />
    </CCol>
    <CCol sm="12">
      <div :class="showOnStep(0)">
        <CCard :style="param_cardStyle">
          <CCardBody>
            <!-- <div style="height:50px;"></div> -->
            <CCol sm="12">
              <CRow>
                <CCol
                  sm="3"
                >
                  <div class="column-space-between">
                    <div class="h5">
                      {{ disp_eventControlName }}
                    </div>
                    <CInput
                      size="lg"
                      :invalid-feedback="disp_noEmptyNorSpaceNeigherRepeat"
                      value=""
                      v-model="value_eventControlName"
                      placeholder=""
                      :is-valid="eventControlNameValidator"
                      required
                      :disabled="flag_modifyMode"
                    />
                  </div>
                </CCol>
                <CCol
                  sm="2"
                >
                  <div class="column-space-between">
                    <div class="h5">
                      {{ disp_eventControlType }}
                    </div>
                    <CSelect
                      class="mb-form-row"
                      size="lg"
                      :value.sync="value_eventControlType"
                      :options="value_eventControlTypeList"
                    />
                  </div>
                </CCol>
                <CCol
                  sm="5"
                >
                  <div class="column-space-between">
                    <div class="h5">
                      {{ disp_groupToApply }}
                    </div>
                    <multiselect
                      class="mb-form-row"
                      v-model="value_eventControlGroupList"
                      placeholder=""
                      :options="value_groupsNameList"
                      :multiple="true"
                      :taggable="true"
                      :hide-selected="true"
                      :select-label="disp_select"
                      :selected-label="disp_selected"
                      :deselect-label="disp_deselect"
                      :show-no-options="false"
                    />
                  </div>
                </CCol>
                <CCol
                  sm="2"
                >
                  <div class="column-space-between">
                    <div class="h5">
                      {{ disp_remarks }}
                    </div>
                    <CInput
                      class="mb-form-row"
                      size="lg"
                      v-model="value_eventControlRemarks"
                    />
                  </div>
                </CCol>
              </CRow>
            </CCol>
            <CCol sm="12">
              <CRow>
                <CCol sm="3">
                  <div class="h5">
                    {{ disp_temperatureTriggerRule }}
                  </div>
                  <CSelect
                    size="lg"
                    :value.sync="value_temperatureTriggerRule"
                    :options="value_temperatureTriggerRuleShow"
                    @change="selTemperatureTriggerRule($event)"
                  />
                </CCol>
              </CRow>
            </CCol>
          </CCardBody>
        </CCard>
      </div>
      <div :class="showOnStep(1)">
        <CCard v-if="value_eventControlType == `line notify`">
          <CCardBody>
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventLineAccessToken }}
                </div>
                <CInput
                  size="lg"
                  :invalid-feedback="disp_noEmptyNorSpaceNeigherRepeat"
                  value=""
                  v-model="value_eventLineAccessToken"
                  placeholder=""
                  :is-valid="eventLineAccessTokenValidator"
                  required
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard v-if="value_eventControlType == `http command`">
          <CCardBody>
            <CRow class="mb-4">
              <CCol
                sm="3"
              >
                <div class="column-space-between">
                  <div class="h5">
                    {{ disp_eventHttpHostAddress }}
                  </div>
                  <CInput
                    size="lg"
                    :invalid-feedback="disp_noEmptyNoSpaceOnly"
                    value=""
                    v-model="value_eventHttpHostAddress"
                    placeholder=""
                    :is-valid="eventLineAccessTokenValidator"
                    required
                  />
                </div>
              </CCol>
              <CCol
                sm="3"
              >
                <div class="column-space-between">
                  <div class="h5">
                    {{ disp_eventHttpEnabledSSL }}
                  </div>
                  <CSwitch
                    size="lg"
                    class="mb-form-row"
                    color="success"
                    shape="pill"
                    @update:checked="
                      value_eventHttpEnabledSSL = !value_eventHttpEnabledSSL
                    "
                    :checked="value_eventHttpEnabledSSL"
                  />
                </div>
              </CCol>
              <CCol
                sm="3"
              >
                <div class="column-space-between">
                  <div class="h5">
                    {{ disp_eventHttpUser }}
                  </div>
                  <CInput
                    class="mb-form-row"
                    size="lg"
                    value=""
                    v-model="value_eventHttpUser"
                    placeholder=""
                  />
                </div>
              </CCol>
              <CCol sm="3">
                <div class="column-space-between">
                  <div class="h5">
                    {{ disp_eventHttpPass }}
                  </div>
                  <form>
                    <CInput
                      class="mb-form-row"
                      size="lg"
                      value=""
                      v-model="value_eventHttpPass"
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
                <div class="h5">
                  {{ disp_eventHttpPort }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventHttpPort"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventHttpUrl }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  style="display: inline-block; width: 85%"
                  v-model="value_eventHttpUrl"
                  placeholder=""
                  :is-valid="urlValidator"
                  :invalid-feedback="value_dataCheck"
                />
              </CCol>
              <CCol
                sm="6"
                v-if="value_eventHttpMethod == 'GET'"
              >
                <div class="h5">
                  {{ disp_showCompleteUrl }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_customData"
                  placeholder=""
                  readonly
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard v-if="value_eventControlType == `send mail`">
          <CCardBody>
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPMethod }}
                </div>
                <CSelect
                  size="lg"
                  :options="['SMTP']"
                  @change="selWifiSsid($event)"
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPHostAddress }}
                </div>
                <CInput
                  size="lg"
                  :invalid-feedback="disp_noEmptyNorSpaceNeigherRepeat"
                  value=""
                  v-model="value_eventSMTPHostAddress"
                  placeholder=""
                  :is-valid="eventLineAccessTokenValidator"
                  required
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPPort }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPPort"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPEnabledSecure }}
                </div>
                <CSwitch
                  size="lg"
                  class="ml-0"
                  color="success"
                  shape="pill"
                  @update:checked="
                    value_eventSMTPEnabledSecure = !value_eventSMTPEnabledSecure
                  "
                  :checked="value_eventSMTPEnabledSecure"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPUser }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPUser"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPPass }}
                </div>
                <form>
                  <CInput
                    size="lg"
                    value=""
                    v-model="value_eventSMTPPass"
                    placeholder=""
                    type="password"
                  />
                </form>
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPSender }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPSender"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPSubject }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPSubject"
                  placeholder=""
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPTo }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPTo"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPCC }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPCC"
                  placeholder=""
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">
                  {{ disp_eventSMTPBCC }}
                </div>
                <CInput
                  size="lg"
                  value=""
                  v-model="value_eventSMTPBCC"
                  placeholder=""
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard
          :style="[
            value_eventControlType !== 'http command' ? param_cardStyle : 'height:31rem;',
          ]"
        >
          <CCardBody>
            <CRow style="height: 100%">
              <CCol
                v-if="value_eventControlType !== 'http command'"
                sm="2"
              />
              <CCol
                v-if="value_eventControlType == 'http command'"
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
                        <CCol sm="12">
                          <CRow>
                            <CCol sm="3">
                              <span
                                class="h5"
                                style="display: block"
                              >{{ disp_id }}</span>
                              <CInput
                                size="lg"
                                style="display: block; margin-bottom: 0px"
                                value=""
                                :invalid-feedback="disp_noEmptyNoSpaceOnly"
                                v-model="value_newFieldKey"
                                placeholder=""
                                :is-valid="keyValidator"
                                required
                              />
                            </CCol>
                            <CCol sm="4">
                              <span
                                class="h5"
                                style="display: block"
                              >{{
                                disp_fieldData
                              }}</span>
                              <div
                                style="position: relative; display: block; height: 40px"
                              >
                                <CSelect
                                  id="defaultList"
                                  :visbile="value_typeInOption"
                                  @focusin="customOption($event)"
                                  @focusout="customOption($event)"
                                  @change="customOption($event)"
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
                                <input
                                  id="editOption"
                                  v-if="value_typeInOption"
                                  :placeholder="disp_fieldData"
                                  @mousedown="customOption($event)"
                                  @keyup="customOption($event)"
                                  @focusin="customOption($event)"
                                  @focusout="customOption($event)"
                                  autocomplete="off"
                                  v-model="value_typeInData"
                                  style="
                                    position: absolute;
                                    display: block;
                                    color: #768192;
                                    font-size: 1.09375rem;
                                    line-height: 1.5;
                                    letter-spacing: normal;
                                    font-weight: 400;
                                    font-family: inherit;
                                    text-align: start;
                                    margin-bottom: 0px;
                                    top: 2px;
                                    width: 90%;
                                    height: 40px;
                                    border: 0px;
                                    left: 5px;
                                    outline: none;
                                    z-index: 10001;
                                  "
                                >
                              </div>
                            </CCol>
                            <CCol sm="1">
                              <CButton
                                @click="addnewField"
                                :disabled="value_newFieldKey == ''"
                                type="submit"
                                variant="outline"
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
                                size="lg"
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
                                  value_dataType == 'JSON' &&
                                    value_eventHttpMethod == 'POST'
                                "
                                style="position: relative; display: block"
                              >{{ disp_jsonType }}</span>
                              <span
                                class="h5"
                                v-if="
                                  value_dataType == 'XML' &&
                                    value_eventHttpMethod == 'POST'
                                "
                                style="position: relative; display: block"
                              >{{ disp_xmlType }}</span>
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
                          </CRow>
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
                            {{ disp_QueryString }}
                          </div>
                          <div
                            v-else
                            class="h5"
                            style="position: relative; margin-top: 10px"
                          >
                            {{ disp_Body }}
                          </div>
                          <CTextarea
                            v-if="value_eventHttpMethod == 'POST'"
                            id="customBody1"
                            v-model="value_customTextarea"
                            spellcheck="false"
                            rows="10"
                            placeholder=""
                            style="position: relative; width: 100%"
                            :is-valid="
                              value_eventHttpMethod == 'GET' ? null : customDataValidator
                            "
                            :invalid-feedback="value_dataCheck"
                          />
                          <CTextarea
                            v-else
                            id="customBody2"
                            v-model="value_customTextarea"
                            :is-valid="
                              value_eventHttpMethod == 'POST' ? null : customUrlValidator
                            "
                            spellcheck="false"
                            :invalid-feedback="value_dataCheck"
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
              <CCol
                sm="9"
                v-if="value_eventControlType !== 'http command'"
              >
                <div
                  class="h5"
                  v-if="value_eventControlType !== 'http command'"
                >
                  {{ disp_eventContentField }}
                </div>
                <CRow>
                  <CCol
                    sm="5"
                    v-if="value_eventControlType !== 'http command'"
                  >
                    <vxe-table
                      id="AllTable"
                      name="eventControlAllTable"
                      :data="value_allItemsToShow"
                      height="432"
                      stripe
                      show-overflow
                      :cell-style="cellStyle"
                      :header-cell-style="headerCellStyle"
                      ref="allTable"
                      empty-text=" "
                      @checkbox-change="toggleItemSelect"
                      @checkbox-all="selectAllEvent_sel"
                      :checkbox-config="{ checkMethod }"
                    >
                      <vxe-table-column
                        type="checkbox"
                        width="60"
                        align="center"
                      />
                      <vxe-table-column
                        show-overflow
                        field="id"
                        :title="disp_id"
                        width="180"
                        align="left"
                      />
                      <vxe-table-column
                        show-overflow
                        field="name"
                        :title="disp_name"
                        width="250"
                        align="left"
                      />
                    </vxe-table>
                  </CCol>
                  <CCol
                    sm="2"
                    v-if="value_eventControlType !== 'http command'"
                  >
                    <div style="margin-left: auto; margin-right: auto; width: 50%">
                      <div style="height: 200px" />
                      <CRow>
                        <div>
                          <CButton
                            style="
                              width: 140px;
                              color: #20a8d8;
                              border: 1px solid #20a8d8;
                            "
                            @click="clickOnInsert()"
                          >
                            <div>
                              <span style="display: inline-block; position: relative">
                                <span
                                  style="
                                    font-size: 20px;
                                    color: #505050;
                                    position: absolute;
                                    left: 100%;
                                    right: -30px;
                                    top: -6px;
                                  "
                                >{{ disp_addmark }}</span>
                                <span>{{ disp_insert }}</span>
                              </span>
                            </div>
                          </CButton>
                        </div>
                      </CRow>
                      <div style="height: 15px" />
                      <CRow>
                        <div>
                          <CButton
                            style="
                              width: 140px;
                              color: #f86c6b;
                              border: 1px solid #f86c6b;
                            "
                            @click="clickOnRemove()"
                          >
                            <div style="text-align: center">
                              <span style="display: inline-block; position: relative">
                                <span
                                  style="
                                    font-size: 20px;
                                    color: #505050;
                                    position: absolute;
                                    right: 100%;
                                    left: -30px;
                                    top: -6px;
                                  "
                                >{{ disp_removemark }}</span>
                                <span>{{ disp_remove }}</span>
                              </span>
                            </div>
                          </CButton>
                        </div>
                      </CRow>
                    </div>
                  </CCol>
                  <CCol
                    sm="5"
                    v-if="value_eventControlType !== 'http command'"
                  >
                    <vxe-table
                      id="SelectedTable"
                      :data="value_selectedItemsToShow"
                      height="432"
                      stripe
                      show-overflow
                      :cell-style="cellStyle"
                      :header-cell-style="headerCellStyle"
                      ref="selectedTable"
                      empty-text=" "
                      @checkbox-all="selectAllEvent_sel"
                    >
                      <vxe-table-column
                        type="checkbox"
                        width="60"
                        align="center"
                      />
                      <vxe-table-column
                        show-overflow
                        field="id"
                        :title="disp_id"
                        width="180"
                        align="left"
                      />
                      <vxe-table-column
                        show-overflow
                        field="name"
                        :title="disp_name"
                        width="250"
                        align="left"
                      />
                    </vxe-table>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </div>
      <div :class="showOnStep(2)">
        <CCard :style="param_cardStyle">
          <CCardBody>
            <div style="height: 50px" />
            <CCol sm="12">
              <CRow>
                <CCol sm="6">
                  <div class="h5">
                    {{ disp_selectedWeeklySchedule }}
                  </div>
                  <scheduler
                    v-model="value_eventControlSelectedWeeklySchedule"
                    :multiple="true"
                  />
                </CCol>
                <CCol sm="6">
                  <div class="h5">
                    {{ disp_specifiedDatetimeRange }}
                  </div>
                  <div class="d-flex">
                    <date-picker
                      :lang="this.$globalDatePickerLanguage"
                      v-model="value_specifiedDatetimeRange"
                      type="datetime"
                      range
                      :placeholder="disp_selectDatetimeRange"
                      @change="datePickerDatachange()"
                    />
                    <CButton
                      class="btn btn-outline-primary btn-add ml-2 p-0"
                      @click="clickOnInsertSchedule()"
                    >
                      +
                    </CButton>
                  </div>
                  <div style="height: 5px" />
                  <vxe-table
                    id="ScheduleTable"
                    :show-header="false"
                    :data="value_specifiedDatetimeToShow"
                    height="380"
                    stripe
                    :cell-style="cellStyle"
                    empty-text=" "
                  >
                    <vxe-table-column
                      show-overflow
                      width="60"
                    >
                      <template #default="{ row }">
                        <vxe-button
                          type="text"
                          icon="far fa-minus-square"
                          @click="deleteItemEvent(row)"
                        />
                      </template>
                    </vxe-table-column>
                    <vxe-table-column
                      show-overflow
                      field="display_string"
                      width="400px"
                    />
                  </vxe-table>
                </CCol>
              </CRow>
            </CCol>
          </CCardBody>
        </CCard>
      </div>
    </CCol>
    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary btn-w-normal"
            size="lg"
            @click="clickOnPrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton
            class="btn btn-outline-primary btn-w-normal"
            size="lg"
            @click="clickOnPrev()"
          >
            {{ disp_previous }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 2">
          <CButton
            class="btn btn-outline-primary btn-w-normal"
            size="lg"
            @click="clickOnPrev"
          >
            {{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary"
            size="lg"
            @click="
              clickOnNext();
              modifyTransform();
            "
            :disabled="!(flag_eventControlNamePass && flag_customData && flag_hostData)"
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

import VueScheduler from '@duoa/vue-scheduler';
import '@/airacss/vue-scheduler.css';

Date.prototype.yyyymmdd_HHMMSS = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();
  const HH = this.getHours();
  const MM = this.getMinutes();
  const SS = this.getSeconds();

  return [
    `${this.getFullYear()}-`,
    `${(mm > 9 ? '' : '0') + mm}-`,
    `${(dd > 9 ? '' : '0') + dd} `,
    `${(HH > 9 ? '' : '0') + HH}:`,
    `${(MM > 9 ? '' : '0') + MM}:`,
    (SS > 9 ? '' : '0') + SS,
  ].join('');
};

const defaultlState = () => ({
  obj_loading: null,
  // value_allTablePage: {
  //   currentPage: 1,
  //   pageSize: 6,
  //   totalResult: 0
  // },
  flag_view_password: false,
  param_boxDisabled: false,

  param_cardStyle: 'height: 35rem;', //
  param_activeColor: '#6baee3', //
  param_passiveColor: '#919bae', //
  param_lineThickness: 3, //
  param_activeThickness: 3, //
  param_passiveThickness: 3, //

  disp_header: 'none', //

  disp_temperatureTriggerRule: i18n.formatter.format('TemperatureTriggerRule'),
  disp_noEmptyNorSpaceNeigherRepeat: i18n.formatter.format(
    'NoEmptyNorSpaceNeigherRepeat',
  ), //
  disp_noEmptyNoSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'), //
  disp_inputEventControlInfo: i18n.formatter.format('InputEventControlInfo'), //
  disp_inputEventControlNotify: i18n.formatter.format('InputEventControlNotify'), //
  disp_selectSchedule: i18n.formatter.format('SelectSchedule'), //
  disp_complete: i18n.formatter.format('Complete'), //

  disp_select: i18n.formatter.format('Select'), //
  disp_selected: i18n.formatter.format('Selected'), //
  disp_deselect: i18n.formatter.format('Deselect'), //

  disp_eventControlName: i18n.formatter.format('EventControlName'), //
  disp_eventControlType: i18n.formatter.format('EventControlType'), //
  disp_groupToApply: i18n.formatter.format('GroupToApply'), //
  disp_remarks: i18n.formatter.format('Remarks'), //

  disp_eventLineAccessToken: i18n.formatter.format('LineAccessToken'), //

  disp_eventHttpHostAddress: i18n.formatter.format('HostAddress'), //
  disp_eventHttpEnabledSSL: i18n.formatter.format('HttpEnabledSSL'), //
  disp_eventHttpUser: i18n.formatter.format('Username'), //
  disp_eventHttpPass: i18n.formatter.format('Password'), //
  disp_eventHttpPort: i18n.formatter.format('Port'), //
  disp_eventHttpUrl: 'PATH', // i18n.formatter.format("HttpUrl"), //

  disp_showCompleteUrl: i18n.formatter.format('ShowCompleteUrl'), //

  disp_eventSMTPMethod: i18n.formatter.format('SMTPMethod'), //
  disp_eventSMTPHostAddress: i18n.formatter.format('HostAddress'), //
  disp_eventSMTPPort: i18n.formatter.format('Port'), //
  disp_eventSMTPEnabledSecure: i18n.formatter.format('SMTPEnabledSecure'), //
  disp_eventSMTPUser: i18n.formatter.format('Username'), //
  disp_eventSMTPPass: i18n.formatter.format('Password'), //
  disp_eventSMTPSender: i18n.formatter.format('SMTPSender'), //
  disp_eventSMTPSubject: i18n.formatter.format('SMTPSubject'), //
  disp_eventSMTPTo: i18n.formatter.format('SMTPTo'), //
  disp_eventSMTPCC: i18n.formatter.format('SMTPCC'), //
  disp_eventSMTPBCC: i18n.formatter.format('SMTPBCC'), //

  disp_eventContentField: i18n.formatter.format('ContentField'), //
  disp_Body: i18n.formatter.format('Body'), //
  disp_QueryString: i18n.formatter.format('QueryString'), //
  disp_id: i18n.formatter.format('FieldKey'), //
  disp_name: i18n.formatter.format('FieldName'), //
  disp_addmark: '>', //
  disp_removemark: '<', //
  disp_jsonType: i18n.formatter.format('JSONType'), //
  disp_xmlType: i18n.formatter.format('XMLType'), //
  disp_insert: i18n.formatter.format('Insert'), //
  disp_remove: i18n.formatter.format('Remove'), //
  disp_default: i18n.formatter.format('Default'), //
  disp_custom: i18n.formatter.format('Custom'), //
  disp_invalidQueryString: i18n.formatter.format('InvalidQueryString'), //
  disp_selectedWeeklySchedule: i18n.formatter.format('SelectedWeeklySchedule'), //
  disp_specifiedDatetimeRange: i18n.formatter.format('SpecifiedDatetimeRange'), //
  disp_selectDatetimeRange: i18n.formatter.format('SelectDatetimeRange'), //

  disp_fieldData: i18n.formatter.format('FieldData'), //
  value_defaultDataList: [
    { label: i18n.formatter.format('Blank'), value: '' }, // 空白
    {
      label: `${i18n.formatter.format('VerifiedTimeStamp')}  (String)`,
      value: '##VerifiedTimeStamp##',
    }, // verified_timestamp
    {
      label: `${i18n.formatter.format('IsStranger')}  (Boolean)`,
      value: '##IsStranger##',
    }, // show_identity
    { label: `${i18n.formatter.format('PersonId')}  (String)`, value: '##PersonId##' }, // person.id
    {
      label: `${i18n.formatter.format('PersonName')}  (String)`,
      value: '##PersonName##',
    }, // person.name
    {
      label: `${i18n.formatter.format('CardNumber')}  (String)`,
      value: '##CardNumber##',
    }, // person.card_number
    { label: `${i18n.formatter.format('Group')}  (String)`, value: '##Group##' }, // person.group_list
    { label: `${i18n.formatter.format('JobTitle')}  (String)`, value: '##JobTitle##' }, // person.title
    {
      label: `${i18n.formatter.format('Department')}  (String)`,
      value: '##Department##',
    }, // person.department
    {
      label: `${i18n.formatter.format('EmailAddress')}  (String)`,
      value: '##EmailAddress##',
    }, // person.email
    {
      label: `${i18n.formatter.format('PhoneNumber')}  (String)`,
      value: '##PhoneNumber##',
    }, // person.phone_number
    {
      label: `${i18n.formatter.format('ExtensionNumber')}  (String)`,
      value: '##ExtensionNumber##',
    }, // person.extension_number
    { label: `${i18n.formatter.format('Remarks')}  (String)`, value: '##Remarks##' }, // person.remarks
    {
      label: `${i18n.formatter.format('Temperature')}  (Float)`,
      value: '##Temperature##',
    }, // foreHead_temperature
    {
      label: `${i18n.formatter.format('IsHighTemperature')}  (Boolean)`,
      value: '##IsHighTemperature##',
    }, // is_high_temperature
    {
      label: `${i18n.formatter.format('CapturedPhoto')}  (base64 encoded image)`,
      value: '##CapturedPhoto##',
    }, // display_image.captured
    {
      label: `${i18n.formatter.format('RegisterPhoto')}  (base64 encoded image)`,
      value: '##RegisterPhoto##',
    }, // display_image.register
    {
      label: `${i18n.formatter.format('DisplayPhoto')}  (base64 encoded image)`,
      value: '##DisplayPhoto##',
    }, // display_image.display
  ],
  value_eventControlTypeList: [
    { value: 'line notify', label: i18n.formatter.format('LineNotify') },
    { value: 'http command', label: i18n.formatter.format('HttpCommand') },
    { value: 'send mail', label: i18n.formatter.format('SendMail') },
  ], //
  value_eventHttpMethodList: [
    { value: 'GET', label: i18n.formatter.format('GET') },
    { value: 'POST', label: i18n.formatter.format('POST') },
  ], //

  value_enableDisableListToShow: [
    { value: true, label: i18n.formatter.format('Yes') },
    { value: false, label: i18n.formatter.format('No') },
  ],

  value_temperatureTriggerRuleShow: [
    { value: 0, label: i18n.formatter.format('AllTemperature') },
    { value: 1, label: i18n.formatter.format('NormalTemperatureOnly') },
    { value: 2, label: i18n.formatter.format('HighTemperatureOnly') },
  ],
  value_temperatureTriggerRule: 0,

  value_selectedDefaultData: '', //
  value_typeInOption: true, //
  value_typeInData: '', //
  value_changeOption: '', //
  value_groupsNameList: [], //

  value_eventControlSetting: null,
  value_eventControlUuid: '', //
  value_eventControlEnabled: true, //
  value_eventControlName: '', //
  value_eventControlType: 'line notify', //
  value_eventHttpMethod: 'GET', //

  value_eventControlGroupList: [], //
  value_eventControlRemarks: '', //

  value_eventLineAccessToken: '', //

  value_eventHttpHostAddress: '', //
  value_eventHttpEnabledSSL: false, //
  value_eventHttpUser: '', //
  value_eventHttpPass: '', //
  value_eventHttpPort: 80, //
  value_eventHttpUrl: '/', //

  value_eventSMTPHostAddress: '', //
  value_eventSMTPEnabledSecure: false, //
  value_eventSMTPUser: '', //
  value_eventSMTPPass: '', //
  value_eventSMTPPort: 25, //
  value_eventSMTPSender: '', //
  value_eventSMTPSubject: '', //
  value_eventSMTPTo: '', //
  value_newFieldKey: '', //
  value_eventSMTPCC: '', //
  value_eventSMTPBCC: '', //
  value_enableType: true, //
  value_selectedData: 0,
  value_selectedDataType: [i18n.formatter.format('JSON'), i18n.formatter.format('XML')],
  value_dataCheck: '',
  value_dataType: 'JSON',

  value_customData: '', //
  value_customTextarea: '', //
  value_allItemsToShow: [
    {
      name: i18n.formatter.format('VerifiedTimeStamp'),
      id: 'VerifiedTimeStamp',
      disabled: false,
    },
    { name: i18n.formatter.format('PersonId'), id: 'PersonId', disabled: false },
    { name: i18n.formatter.format('PersonName'), id: 'PersonName', disabled: false },
    { name: i18n.formatter.format('CardNumber'), id: 'CardNumber', disabled: false },
    { name: i18n.formatter.format('Group'), id: 'Group', disabled: false },
    { name: i18n.formatter.format('JobTitle'), id: 'JobTitle', disabled: false },
    { name: i18n.formatter.format('Department'), id: 'Department', disabled: false },
    {
      name: i18n.formatter.format('EmailAddress'),
      id: 'EmailAddress',
      disabled: false,
    },
    { name: i18n.formatter.format('PhoneNumber'), id: 'PhoneNumber', disabled: false },
    {
      name: i18n.formatter.format('ExtensionNumber'),
      id: 'ExtensionNumber',
      disabled: false,
    },
    { name: i18n.formatter.format('Remarks'), id: 'Remarks', disabled: false },
    { name: i18n.formatter.format('Temperature'), id: 'Temperature', disabled: false },
    {
      name: i18n.formatter.format('CapturedPhoto'),
      id: 'CapturedPhoto',
      disabled: false,
    },
    {
      name: i18n.formatter.format('RegisterPhoto'),
      id: 'RegisterPhoto',
      disabled: false,
    },
    {
      name: i18n.formatter.format('DisplayPhoto'),
      id: 'DisplayPhoto',
      disabled: false,
    },
  ], //
  value_selectedItemsToShow: [], //
  value_timeID: 0, //

  value_eventControlSelectedWeeklySchedule: {}, //
  value_specifiedDatetimeRange: [null, null], //
  value_specifiedDatetimeToShow: [], //
  value_eventControlSpecifiedDatetimeData: [], //
  disp_create: i18n.formatter.format('Create'),

  disp_modify: i18n.formatter.format('Modify'),
  disp_saveChanges: i18n.formatter.format('SaveChanges'),

  disp_registerCompleted: i18n.formatter.format('RegisterCompleted'),
  disp_previous: i18n.formatter.format('Previous'),
  disp_next: i18n.formatter.format('Next'),
  disp_invalidJSON: i18n.formatter.format('InvalidJSON'),
  disp_repeatFieldKey: i18n.formatter.format('RepeatFieldKey'),
  disp_invalidXML: i18n.formatter.format('InvalidXML'),
  disp_invalidURL: i18n.formatter.format('InvalidURL'),

  // value_dataListPersonId: true,
  // value_dataListPersonName: true,
  // value_dataListPersonCardNumber: true,
  // value_dataListPersonGroupList: true,
  // value_dataListPersonTitle: true,
  // value_dataListPersonDepartment: true,
  // value_dataListPersonEmail: true,
  // value_dataListPersonPhoneNumber: true,
  // value_dataListPersonExtensionNumber: true,
  // value_dataListPersonRemarks: true,
  // value_dataListTemperature: true,
  // value_dataListCapture: true,
  // value_dataListRegister: true,
  // value_dataListDisplay: true,

  // flag_modifyMode: false, //
  // flag_currentSelection: 0,

  value_returnRoutePath: '',
  value_returnRouteName: i18n.formatter.format('Return'),
  value_group_list: [],

  value_exstingEventControlSettingsList: [],

  flag_currentSetp: 0, //
  flag_eventControlNamePass: false,
  flag_customData: true, //
  flag_hostData: true,
  // flag_eventLineAccessTokenPass: false,

  // value_accessControlUuid: "",

  // value_accessControlEnabled: true,

  disp_AM: i18n.formatter.format('AM'),
  disp_PM: i18n.formatter.format('PM'),
  disp_timeTitle: i18n.formatter.format('Time'),
  disp_weekTitle: i18n.formatter.format('Day'),
  disp_weekDays: [
    i18n.formatter.format('Sun'),
    i18n.formatter.format('Mon'),
    i18n.formatter.format('Tue'),
    i18n.formatter.format('Wed'),
    i18n.formatter.format('Thu'),
    i18n.formatter.format('Fri'),
    i18n.formatter.format('Sat'),
  ],
  disp_hours: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ],
  disp_dragTips: ' ',
  disp_reset: i18n.formatter.format('Reset'),

  // value_selectedPersonList: [],
});
export default {
  name: 'EventControlSettingForm',
  props: {
    formData: Object,
    onFinish: { type: Function },
    advanceFunction: { type: Boolean },
  },
  data() {
    return { ...defaultlState(), ...this.formData };
  },
  created() {
    const self = this;
    VueScheduler.setLocale({
      AM: self.disp_AM,
      PM: self.disp_PM,
      TIME_TITLE: self.disp_timeTitle,
      WEEK_TITLE: self.disp_weekTitle,
      WEEK_DAYS: self.disp_weekDays,
      HOURS: self.disp_hours,
      DRAG_TIP: self.disp_dragTips,
      RESET: self.disp_reset,
    });

    if (self.value_eventControlSetting) {
      self.value_eventControlUuid = self.value_eventControlSetting.uuid != null
        ? self.value_eventControlSetting.uuid
        : '';
      self.value_eventControlEnabled = self.value_eventControlSetting.enable != null
        ? self.value_eventControlSetting.enable
        : true;
      self.value_temperatureTriggerRule = self.value_eventControlSetting.temperature_trigger_rule != null
        ? self.value_eventControlSetting.temperature_trigger_rule
        : 0;
      self.value_eventControlName = self.value_eventControlSetting.name != null
        ? self.value_eventControlSetting.name
        : '';
      self.value_eventControlType = self.value_eventControlSetting.event_control_type != null
        ? self.value_eventControlSetting.event_control_type
        : 'line notify';
      self.value_eventControlGroupList = self.value_eventControlSetting.group_list != null
        ? self.value_eventControlSetting.group_list
        : [];
      self.value_eventControlRemarks = self.value_eventControlSetting.remarks != null
        ? self.value_eventControlSetting.remarks
        : '';

      // line
      self.value_eventLineAccessToken = self.value_eventControlSetting.token != null
        ? self.value_eventControlSetting.token
        : '';

      // http
      self.value_eventHttpHostAddress = self.value_eventControlSetting.host != null
        ? self.value_eventControlSetting.host
        : '';
      self.value_eventHttpEnabledSSL = self.value_eventControlSetting.https != null
        ? self.value_eventControlSetting.https
        : true;
      self.value_eventHttpUser = self.value_eventControlSetting.user != null
        ? self.value_eventControlSetting.user
        : '';
      self.value_eventHttpPass = self.value_eventControlSetting.pass != null
        ? self.value_eventControlSetting.pass
        : '';
      self.value_eventHttpPort = self.value_eventControlSetting.port != null
        ? self.value_eventControlSetting.port
        : 80;
      self.value_eventHttpUrl = self.value_eventControlSetting.url != null
        ? self.value_eventControlSetting.url
        : '/';
      self.value_eventHttpMethod = self.value_eventControlSetting.method != null
        ? self.value_eventControlSetting.method
        : 'GET';
      self.value_customData = self.value_eventControlSetting.custom_data != null
        ? self.value_eventControlSetting.custom_data
        : '';
      self.value_customTextarea = self.value_eventControlSetting.custom_data != null
        ? self.value_eventControlSetting.custom_data
        : '';
      self.value_dataType = self.value_eventControlSetting.data_type != null
        ? self.value_eventControlSetting.data_type
        : 'JSON';

      // smtp
      self.value_eventSMTPHostAddress = self.value_eventControlSetting.host != null
        ? self.value_eventControlSetting.host
        : '';
      self.value_eventSMTPEnabledSecure = self.value_eventControlSetting.secure != null
        ? self.value_eventControlSetting.secure
        : true;
      self.value_eventSMTPUser = self.value_eventControlSetting.user != null
        ? self.value_eventControlSetting.user
        : '';
      self.value_eventSMTPPass = self.value_eventControlSetting.pass != null
        ? self.value_eventControlSetting.pass
        : '';
      self.value_eventSMTPPort = self.value_eventControlSetting.port != null
        ? self.value_eventControlSetting.port
        : 25;
      self.value_eventSMTPSender = self.value_eventControlSetting.from != null
        ? self.value_eventControlSetting.from
        : '';
      self.value_eventSMTPSubject = self.value_eventControlSetting.subject != null
        ? self.value_eventControlSetting.subject
        : '';
      self.value_eventSMTPTo = self.value_eventControlSetting.to != null
        ? self.value_eventControlSetting.to
        : '';
      self.value_eventSMTPCC = self.value_eventControlSetting.cc != null
        ? self.value_eventControlSetting.cc
        : '';
      self.value_eventSMTPBCC = self.value_eventControlSetting.bcc != null
        ? self.value_eventControlSetting.bcc
        : '';

      self.value_eventControlSpecifiedDatetimeData = [];
      if (
        self.value_eventControlSetting.weekly_schedule
        && self.value_eventControlSetting.weekly_schedule.list
      ) {
        self.value_eventControlSetting.weekly_schedule.list.forEach((sch) => {
          const key = sch.day_of_week.toString();
          const value = sch.hours_list;
          self.value_eventControlSelectedWeeklySchedule[key] = value;
        });
      }
      if (
        self.value_eventControlSetting.specify_time
        && self.value_eventControlSetting.specify_time.list
      ) {
        self.value_eventControlSetting.specify_time.list.forEach((sch) => {
          const dataToPush = {
            uuid: self.makeid(32),
            start_time: sch.start_time,
            end_time: sch.end_time,
            display_string:
              `${new Date(sch.start_time).yyyymmdd_HHMMSS()
              } ~ ${
                new Date(sch.end_time).yyyymmdd_HHMMSS()}`,
          };
          self.value_eventControlSpecifiedDatetimeData.push(dataToPush);
        });
      }
    }
    this.calPageData();

    for (let i = self.value_allItemsToShow.length - 1; i >= 0; i--) {
      const item = self.value_allItemsToShow[i];

      let move = false;
      try {
        if (self.value_eventControlSetting && self.value_eventControlSetting.data_list) {
          switch (item.id) {
            case 'VerifiedTimeStamp':
              if (self.value_eventControlSetting.data_list.verified_timestamp === true) move = true;
              break;
            case 'PersonId':
              if (self.value_eventControlSetting.data_list.person.id === true) move = true;
              break;
            case 'PersonName':
              if (self.value_eventControlSetting.data_list.person.name === true) move = true;
              break;
            case 'CardNumber':
              if (self.value_eventControlSetting.data_list.person.card_number === true) move = true;
              break;
            case 'Group':
              if (self.value_eventControlSetting.data_list.person.group_list === true) move = true;
              break;
            case 'JobTitle':
              if (self.value_eventControlSetting.data_list.person.title === true) move = true;
              break;
            case 'Department':
              if (self.value_eventControlSetting.data_list.person.department === true) move = true;
              break;
            case 'EmailAddress':
              if (self.value_eventControlSetting.data_list.person.email === true) move = true;
              break;
            case 'PhoneNumber':
              if (self.value_eventControlSetting.data_list.person.phone_number === true) move = true;
              break;
            case 'ExtensionNumber':
              if (
                self.value_eventControlSetting.data_list.person.extension_number === true
              ) move = true;
              break;
            case 'Remarks':
              if (self.value_eventControlSetting.data_list.person.remarks === true) move = true;
              break;
            case 'Temperature':
              if (self.value_eventControlSetting.data_list.foreHead_temperature === true) move = true;
              break;
            case 'CapturedPhoto':
              if (self.value_eventControlSetting.data_list.display_image === 'captured') move = true;
              break;
            case 'RegisterPhoto':
              if (self.value_eventControlSetting.data_list.display_image === 'register') move = true;
              break;
            case 'DisplayPhoto':
              if (self.value_eventControlSetting.data_list.display_image === 'display') move = true;
              break;
          }
        }
      } catch (e) {}
      if (move) {
        self.value_selectedItemsToShow.push(item);
        self.value_allItemsToShow.splice(i, 1);
      }

      self.value_selectedItemsToShow.find((rec) => {
        if (
          rec.id == 'CapturedPhoto'
          || rec.id == 'RegisterPhoto'
          || rec.id == 'DisplayPhoto'
        ) {
          self.toggleItemSelect({ row: { id: rec.id }, checked: false });
          return true;
        }
      });
    }
  },
  mounted() {
    const self = this;
    const list = [];
    try {
      self.value_group_list.forEach((group) => {
        list.push(group.name);
      });
      self.value_groupsNameList = list;
    } catch (e) {}
  },
  updated() {},
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  watch: {},
  methods: {
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },
    makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    calPageData() {
      const self = this;
      // self.value_allTablePage.totalResult = self.value_eventControlSpecifiedDatetimeData.length;
      // self.value_specifiedDatetimeToShow = self.value_eventControlSpecifiedDatetimeData.slice((self.value_allTablePage.currentPage - 1) * self.value_allTablePage.pageSize, self.value_allTablePage.currentPage * self.value_allTablePage.pageSize);
      self.value_specifiedDatetimeToShow = self.value_eventControlSpecifiedDatetimeData;
    },

    headerCellStyle(row, column, rowIndex, columnIndex) {
      return 'fontSize: 16px';
    },
    cellStyle(row, column, rowIndex, columnIndex) {
      return 'fontSize: 16px;';
    },
    checkMethod({ row }) {
      return !row.disabled;
    },
    selTemperatureTriggerRule(e) {
      const self = this;
      self.value_temperatureTriggerRule = Number(e.target.value);
    },
    selectDateType(type) {
      const self = this;
      self.value_selectedData = type;
      switch (type) {
        case 0:
          {
            self.value_dataType = 'JSON';
            self.value_customData = '';
            self.value_customTextarea = '';
            self.value_newFieldKey = '';
            self.value_typeInData = '';
            self.flag_customData = false;
          }
          break;
        case 1:
          {
            self.value_dataType = 'XML';
            self.value_customData = '';
            self.value_customTextarea = '';
            self.value_newFieldKey = '';
            self.value_typeInData = '';
            self.flag_customData = false;
          }
          break;
      }
    },
    toggleItemSelect({ row, checked }) {
      if (
        row.id == 'CapturedPhoto'
        || row.id == 'RegisterPhoto'
        || row.id == 'DisplayPhoto'
      ) {
        const cap = this.value_allItemsToShow.find((item) => item.id === 'CapturedPhoto');
        const reg = this.value_allItemsToShow.find((item) => item.id === 'RegisterPhoto');
        const dis = this.value_allItemsToShow.find((item) => item.id === 'DisplayPhoto');

        if (checked) {
          // ban
          if (cap) cap.id == row.id ? (cap.disabled = false) : (cap.disabled = true);
          if (reg) reg.id == row.id ? (reg.disabled = false) : (reg.disabled = true);
          if (dis) dis.id == row.id ? (dis.disabled = false) : (dis.disabled = true);
        } else {
          // release
          if (cap) cap.disabled = false;
          if (reg) reg.disabled = false;
          if (dis) dis.disabled = false;
        }
      }
    },
    selectAllEvent_sel({ checked, records }) {
      // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
    },
    deleteItemEvent(item) {
      const self = this;
      self.value_eventControlSpecifiedDatetimeData = self.value_eventControlSpecifiedDatetimeData.filter(
        (data) => data.uuid != item.uuid,
      );
      self.calPageData();
    },
    clickOnInsert() {
      const self = this;
      const allRecords = this.$refs.allTable.getCheckboxRecords();

      if (allRecords.length >= 1) {
        this.value_selectedItemsToShow = this.value_selectedItemsToShow.concat(
          allRecords,
        );

        this.value_allItemsToShow = this.value_allItemsToShow.filter((el) => self.value_selectedItemsToShow.indexOf(el) < 0);
      }
    },
    clickOnRemove() {
      const self = this;
      const selectedRecords = this.$refs.selectedTable.getCheckboxRecords();

      if (selectedRecords.length >= 1) {
        this.value_allItemsToShow = this.value_allItemsToShow.concat(selectedRecords);

        this.value_selectedItemsToShow = this.value_selectedItemsToShow.filter((
          el,
        ) => self.value_allItemsToShow.indexOf(el) < 0);
      }

      selectedRecords.find((rec) => {
        if (
          rec.id == 'CapturedPhoto'
          || rec.id == 'RegisterPhoto'
          || rec.id == 'DisplayPhoto'
        ) {
          self.toggleItemSelect({ row: { id: rec.id }, checked: false });
          return true;
        }
      });
    },
    urlCheck(val) {
      const self = this;
      let inputUrl = val;
      const processData = '';
      const { length } = inputUrl;
      const check = inputUrl.startsWith('/');

      if (inputUrl.includes('//')) {
        let replaceSymbol = inputUrl.indexOf('//');
        while (replaceSymbol != -1) {
          if (replaceSymbol == 0) {
            inputUrl = inputUrl.slice(replaceSymbol - 1, replaceSymbol)
              + inputUrl.slice(replaceSymbol + 1, length);
            replaceSymbol = inputUrl.indexOf('//');
          } else if (replaceSymbol != 0 && replaceSymbol != -1) {
            inputUrl = inputUrl.slice(0, replaceSymbol)
              + inputUrl.slice(replaceSymbol + 1, length);
            replaceSymbol = inputUrl.indexOf('//');
          }
        }
        if (replaceSymbol == -1) {
          return inputUrl;
        }
      } else if (check) {
        return inputUrl;
      } else {
        inputUrl = `/${inputUrl}`;
        return inputUrl;
      }
    },
    removeQmark(inputUrl) {
      let replaceQmark = inputUrl.indexOf('?');
      while (replaceQmark != -1) {
        inputUrl = inputUrl.slice(0, replaceQmark)
          + inputUrl.slice(replaceQmark + 1, inputUrl.length);
        replaceQmark = inputUrl.indexOf('?');
      }
      if (replaceQmark == -1) {
        return inputUrl;
      }
    },
    removeDbSlash(inputUrl) {
      let replaceSymbol = inputUrl.indexOf('//');
      while (replaceSymbol != -1) {
        if (replaceSymbol == 0) {
          inputUrl = inputUrl.slice(replaceSymbol - 1, replaceSymbol)
            + inputUrl.slice(replaceSymbol + 1, inputUrl.length);
          replaceSymbol = inputUrl.indexOf('//');
        } else if (replaceSymbol != 0 && replaceSymbol != -1) {
          inputUrl = inputUrl.slice(0, replaceSymbol)
            + inputUrl.slice(replaceSymbol + 1, inputUrl.length);
          replaceSymbol = inputUrl.indexOf('//');
        }
      }
      if (replaceSymbol == -1) {
        return inputUrl;
      }
    },
    cleanUrl(inputUrl) {
      try {
        let processUrl = '';
        let outputUrl = '';
        const self = this;
        processUrl = self.removeQmark(inputUrl);
        outputUrl = self.removeDbSlash(processUrl);
        return outputUrl;
      } catch (e) {
        console.log(e);
      }
    },
    urlValidator() {
      const self = this;
      const inputUrl = self.value_eventHttpUrl.replace(/\s/g, '');
      const checkStart = inputUrl.startsWith('/');
      const checkGetURL = self.value_eventHttpMethod == 'GET' && self.flag_currentSetp == 1;
      const checkPostUrl = self.value_eventHttpMethod == 'POST' && self.flag_currentSetp == 1;
      let outputUrl = '';
      let processStr = '';
      switch (true) {
        case checkGetURL: {
          let testUrL;
          if (checkStart) {
            outputUrl = self.cleanUrl(inputUrl);
            try {
              processStr = `http://127.0.0.1${outputUrl}`;
              testUrL = new URL(processStr);
              if (testUrL.href == processStr) {
                self.value_eventHttpUrl = outputUrl;
                self.custom_data = true;
                return self.custom_data;
              }
            } catch (e) {
              self.value_dataCheck = self.disp_invalidURL;
              self.custom_data = false;
              console.log(e);
              return self.custom_data;
            }
          } else {
            outputUrl = self.cleanUrl(inputUrl);
            outputUrl = outputUrl.startsWith('/') ? outputUrl : `/${outputUrl}`;
            try {
              testUrL = new URL(`http://127.0.0.1${outputUrl}`);
              if (testUrL) {
                self.value_eventHttpUrl = outputUrl;
                self.custom_data = true;
                return self.custom_data;
              }
            } catch (e) {
              self.value_dataCheck = self.disp_invalidURL;
              self.custom_data = false;
              console.log(e);
              return self.custom_data;
            }
          }
          break;
        }
        case checkPostUrl: {
          let testUrL;
          if (checkStart) {
            outputUrl = self.cleanUrl(inputUrl);
            try {
              processStr = `http://127.0.0.1${outputUrl}`;
              testUrL = new URL(processStr);
              if (testUrL.href == processStr) {
                self.value_eventHttpUrl = outputUrl;
                self.custom_data = true;
                return self.custom_data;
              }
            } catch (e) {
              self.value_dataCheck = self.disp_invalidURL;
              self.custom_data = false;
              console.log(e);
              return self.custom_data;
            }
          } else {
            outputUrl = self.cleanUrl(inputUrl);
            outputUrl = outputUrl.startsWith('/') ? outputUrl : `/${outputUrl}`;
            try {
              testUrL = new URL(`http://127.0.0.1${outputUrl}`);
              if (testUrL) {
                self.value_eventHttpUrl = outputUrl;
                self.custom_data = true;
                return self.custom_data;
              }
            } catch (e) {
              self.value_dataCheck = self.disp_invalidURL;
              self.custom_data = false;
              console.log(e);
              return self.custom_data;
            }
          }
          break;
        }
      }
    },
    customUrlValidator() {
      const self = this;
      const noBlankStr = self.value_customTextarea.replace(/\n/g, '');
      const checkPage = self.flag_currentSetp !== 1;
      const checkURL = self.value_eventHttpMethod == 'GET' && self.flag_currentSetp == 1;

      switch (true) {
        case checkPage: {
          self.flag_customData = true;
          return self.flag_customData;
        }
        case checkURL: {
          try {
            const processQS = noBlankStr.replace(/#/g, '%23');
            const processUrl = self.value_eventHttpUrl;
            const testUrL = new URL(`http://127.0.0.1${processUrl}${processQS}`);
            if (testUrL && noBlankStr.length == 0) {
              self.value_eventHttpUrl = processUrl;
              self.value_customData = processUrl;
              self.flag_customData = true;
              return self.flag_customData;
            } if (testUrL && noBlankStr.length != 0) {
              self.value_eventHttpUrl = processUrl;
              self.value_customData = `${processUrl}?${noBlankStr}`;
              self.flag_customData = true;
              return self.flag_customData;
            }
          } catch (e) {
            self.value_dataCheck = self.disp_invalidQueryString;
            self.flag_customData = false;
            // console.log(e);
            return self.flag_customData;
          }
          break;
        }
      }
    },
    customOption(event) {
      const self = this;
      const clickList = document.getElementById('defaultList');
      const option = defaultList ? defaultList.selectedIndex : '';
      const clickInput = document.getElementById('editOption');
      self.value_typeInOption = true;
      const inputFocusIn = self.value_selectedDefaultData == '' && event.type == 'focusin';
      const inputKeyup = self.value_selectedDefaultData == '' && event.type == 'keyup';
      const inputFocusOut = self.value_selectedDefaultData == '' && event.type == 'focusout';
      const selectFocusIn = self.value_selectedDefaultData != '' && event.type == 'focusin';
      const selectChange = self.value_selectedDefaultData != '' && event.type == 'change';
      const selectFocusOut = self.value_selectedDefaultData != '' && event.type == 'focusout';
      const changeToType = self.value_selectedDefaultData == '' && event.type == 'change';

      switch (true) {
        case inputFocusIn:
          {
            clickList[1].style.marginTop = '36px';
            clickList[0].hidden = true;
            clickList.setAttribute('size', 5);
            self.value_changeOption = event.target.value;
            self.value_timeID = window.setTimeout(() => {
              clickList.focus();
            }, 1000);
          }
          break;
        case inputKeyup:
          {
            clickList[1].style.marginTop = '36px';
            clickList[0].hidden = true;
            clickList.setAttribute('size', 5);
            window.clearTimeout(self.value_timeID);
          }
          break;
        case selectFocusIn:
          {
            self.value_typeInData = '';
            window.clearTimeout(self.value_timeID);
            self.value_typeInOption = false;
            clickList[1].style.marginTop = '0px';
            clickList[0].hidden = false;
            clickList.setAttribute('size', 5);
          }
          break;
        case selectChange:
          {
            window.clearTimeout(self.value_timeID);
            self.value_typeInData = '';
            if (self.value_changeOption != event.target.value) {
              clickList[1].style.marginTop = '0px';
              clickList[0].hidden = false;
              clickList.removeAttribute('size', 5);
              self.value_changeOption = event.target.value;
              self.value_typeInOption = self.value_selectedDefaultData == '';
              clickList.blur();
            } else {
              clickList[1].style.marginTop = '0px';
              clickList[0].hidden = false;
              clickList.setAttribute('size', 5);
              self.value_changeOption = event.target.value;
              self.value_typeInOption = self.value_selectedDefaultData == '';
              clickList.blur();
            }
          }
          break;
        case selectFocusOut:
          {
            clickList[1].style.marginTop = '0px';
            clickList[0].hidden = false;
            clickList.removeAttribute('size', 5);
            self.value_typeInOption = false;
            window.clearTimeout(self.value_timeID);
          }
          break;
        case changeToType:
          {
            clickList[1].style.marginTop = '0px';
            clickList[0].hidden = false;
            clickList.removeAttribute('size', 5);
            self.value_typeInOption = true;
            window.clearTimeout(self.value_timeID);
            clickList.blur();
          }
          break;
        case inputFocusOut:
          {
            clickList[1].style.marginTop = '0px';
            clickList[0].hidden = false;
            clickList.removeAttribute('size', 5);
            self.value_changeOption = event.target.value;
            window.clearTimeout(self.value_timeID);
          }
          break;
      }
    },
    customDataValidator() {
      const self = this;
      let processStr = '';
      const checkJSON = self.value_eventHttpMethod == 'POST' && self.value_dataType == 'JSON';
      const checkXML = self.value_eventHttpMethod == 'POST' && self.value_dataType == 'XML';
      const checkPage = self.flag_currentSetp !== 1;
      let result = '';
      switch (true) {
        case checkPage: {
          self.flag_customData = true;
          return self.flag_customData;
          break;
        }
        case checkJSON: {
          try {
            const noBlankStr = self.value_customTextarea.replace(/\s/g, '');
            const noSoloComma = noBlankStr.replace(/,}/g, '}');
            processStr = JSON.parse(noSoloComma);
            if (processStr) {
              result = JSON.stringify(processStr);
              if (noSoloComma.length == result.length) {
                self.value_customData = result;
                self.flag_customData = true;
                return self.flag_customData;
              } if (noSoloComma.length != result.length) {
                self.value_dataCheck = self.disp_repeatFieldKey;
                self.flag_customData = false;
                return self.flag_customData;
              }
            }
          } catch (e) {
            self.value_dataCheck = self.disp_invalidJSON;
            self.flag_customData = false;
            return self.flag_customData;
          }
          break;
        }
        case checkXML: {
          const noBlankStr = self.value_customTextarea.replace(/\s/g, '');
          self.value_customData = noBlankStr;
          try {
            const strXML = self.value_customData;
            const parser = new DOMParser();
            const result = parser.parseFromString(strXML, 'text/xml');
            const errorNode = result.querySelector('parsererror');
            if (!errorNode) {
              self.flag_customData = true;
              return self.flag_customData;
            }
            self.value_dataCheck = self.disp_invalidXML;
            self.flag_customData = false;
            return self.flag_customData;
          } catch (e) {
            self.value_dataCheck = self.disp_invalidXML;
            self.flag_customData = false;
            console.log(e);
            return self.flag_customData;
          }
          break;
        }
      }
      return self.flag_customData;
    },
    xmlTOString(xmlObject) {
      return new XMLSerializer().serializeToString(xmlObject);
    },
    clearSetting(val) {
      const self = this;
      if (self.value_eventHttpMethod == 'GET') {
        self.value_dataType == 'JSON';
        self.value_customData = '';
        self.value_customTextarea = '';
        self.value_eventHttpUrl = '/';
        self.flag_customData = true;
        self.value_selectedDefaultData = '';
        self.value_newFieldKey = '';
        self.value_typeInData = '';
        self.value_typeInOption = true;
      } else if (self.value_eventHttpMethod == 'POST') {
        self.value_customData = '';
        self.value_customTextarea = '';
        self.value_eventHttpUrl = '/';
        self.flag_customData = false;
        self.value_selectedDefaultData = '';
        self.value_newFieldKey = '';
        self.value_typeInData = '';
        self.value_typeInOption = true;
      }
    },
    addnewField() {
      const self = this;
      const fieldKey = self.value_newFieldKey || '';
      const fieldData = self.value_selectedDefaultData == ''
        ? self.value_typeInData
        : self.value_selectedDefaultData;
      const dataType = self.value_dataType == 'JSON';
      const textArea = document.getElementById('customBody1') || document.getElementById('customBody2');
      const startPos = textArea.selectionStart;
      const endPos = textArea.selectionEnd;
      const tmpStr = textArea.value;
      let processStr = '';
      const focusJsonEvent = dataType;
      const focusXMLEvent = !dataType;
      const focusQueryString = self.value_eventHttpMethod == 'GET';

      switch (true) {
        case focusQueryString: {
          self.value_customTextarea = `${tmpStr.substring(0, startPos)
          }\n`
            + `${fieldKey}`
            + '='
            + `${fieldData}`
            + `&${
              tmpStr.substring(endPos, tmpStr.length)}`;
          const noBlankStr = self.value_customTextarea.replace(/\n/g, '');
          processStr = noBlankStr;
          self.value_customTextarea = processStr;
          self.value_newFieldKey = '';
          self.value_selectedDefaultData = '';
          self.value_typeInData = '';
          self.value_typeInOption = true;
          break;
        }
        case focusJsonEvent: {
          self.value_customTextarea = `${tmpStr.substring(0, startPos)
          }"${fieldKey}"`
            + ':'
            + `"${fieldData}"`
            + ','
            + `\n${
              tmpStr.substring(endPos, tmpStr.length)}`;
          const noBlankStr = self.value_customTextarea.replace(/\s/g, '');
          processStr = noBlankStr;
          self.value_customData = processStr;
          self.value_newFieldKey = '';
          self.value_selectedDefaultData = '';
          self.value_typeInData = '';
          self.value_typeInOption = true;
          break;
        }
        case focusXMLEvent: {
          self.value_customTextarea = `${tmpStr.substring(0, startPos)
          }\n`
            + `<${fieldKey}>`
            + `${fieldData}`
            + `</${fieldKey}>`
            + `\n${
              tmpStr.substring(endPos, tmpStr.length)}`;
          const noBlankStr = self.value_customTextarea.replace(/\n/g, '');
          processStr = noBlankStr;
          self.value_customData = processStr;
          self.value_newFieldKey = '';
          self.value_selectedDefaultData = '';
          self.value_typeInData = '';
          self.value_typeInOption = true;
          break;
        }
      }
    },
    modifyTransform() {
      const self = this;
      if (
        self.flag_modifyMode
        && self.value_eventHttpMethod == 'GET'
        && self.value_eventHttpUrl.indexOf('?') != -1
        && self.flag_currentSetp == 1
      ) {
        const dividePoint = self.value_eventHttpUrl.indexOf('?');
        const process = self.value_eventHttpUrl;
        self.value_customTextarea = process.slice(dividePoint + 1, process.length);
        self.value_eventHttpUrl = process.slice(0, dividePoint);
      } else if (
        self.flag_modifyMode
        && self.value_eventHttpMethod == 'POST'
        && self.value_dataType == 'JSON'
      ) {
        const process = self.value_customData;
        self.value_customTextarea = process.replace(/,/g, ',\n');
        self.value_selectedData = 0;
      } else if (
        self.flag_modifyMode
        && self.value_eventHttpMethod == 'POST'
        && self.value_dataType == 'XML'
      ) {
        let process = self.value_customData.replace(/[>]/g, '>\n');
        self.value_selectedData = 1;
        if (process.indexOf('>\n#') != -1) {
          const output = process.replace(/[<]/g, '\n<');
          if (output.indexOf('\n') == 0) {
            process = output.slice(1, output.length);
            self.value_customTextarea = process;
          } else {
            self.value_customTextarea = output;
          }
        } else {
          self.value_customTextarea = process;
        }
      }
    },
    clickOnInsertSchedule() {
      const self = this;
      if (self.value_specifiedDatetimeRange.length == 2) {
        const startTime = self.value_specifiedDatetimeRange[0];
        const endTime = self.value_specifiedDatetimeRange[1];
        if (startTime != null && endTime != null) {
          self.value_eventControlSpecifiedDatetimeData.push({
            uuid: self.makeid(32),
            display_string:
              `${startTime.yyyymmdd_HHMMSS()} ~ ${endTime.yyyymmdd_HHMMSS()}`,
            start_time: startTime.getTime(),
            end_time: endTime.getTime(),
          });
          self.calPageData();
        }
      }
      self.value_specifiedDatetimeRange = [null, null];
    },
    datePickerDatachange() {},
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.disp_next;
        case 2:
          return this.flag_modifyMode ? this.disp_saveChanges : this.disp_create;
        default:
          return this.disp_complete;
      }
    },
    clickOnPrev() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        self.flag_customData = true;
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
        }
      } else if (self.flag_currentSetp > 0) {
        if (self.flag_currentSetp == 1) {
          self.flag_currentSetp--;
        } else {
          if (
            self.value_eventHttpMethod == 'GET'
            && self.value_eventHttpUrl.indexOf('?') != -1
          ) {
            const dividePoint = self.value_eventHttpUrl.indexOf('?');
            const process = self.value_eventHttpUrl;
            self.value_customTextarea = process.slice(dividePoint + 1, process.length);
            self.value_eventHttpUrl = process.slice(0, dividePoint);
          }
          self.flag_currentSetp--;
        }
      }
    },
    clickOnNext() {
      const self = this;
      if (self.flag_currentSetp == 0) {
        if (self.value_eventControlUuid == '') self.value_eventControlUuid = self.makeid(32);
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp == 1) {
        if (
          self.value_eventControlType == 'http command'
          && self.value_eventHttpMethod == 'GET'
        ) {
          const checkLength = self.value_customTextarea.replace(/\s/g, '').length;
          self.value_eventHttpUrl = checkLength == 0 ? self.value_eventHttpUrl : self.value_customData;
          self.value_customData = '';
          self.flag_currentSetp = 2;
        } else {
          self.flag_currentSetp = 2;
        }
      } else if (self.flag_currentSetp == 2) {
        if (self.onFinish) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          const weeklySchedule = { list: [] };
          for (let i = 0; i < 7; i++) {
            const sch = self.value_eventControlSelectedWeeklySchedule[i.toString()];
            if (sch != null) {
              weeklySchedule.list.push({
                day_of_week: i,
                hours_list: sch,
              });
            }
          }
          const specifyTime = { list: [] };
          self.value_eventControlSpecifiedDatetimeData.forEach((spDay) => {
            specifyTime.list.push({
              start_time: spDay.start_time,
              end_time: spDay.end_time,
            });
          });

          let sendData = {};
          if (self.value_eventControlType == 'line notify') {
            sendData = {
              eventControlType: self.value_eventControlType,
              uuid: self.value_eventControlUuid,
              enable: self.value_eventControlEnabled,
              temperature_trigger_rule: self.value_temperatureTriggerRule,
              name: self.value_eventControlName,
              group_list: self.value_eventControlGroupList,
              remarks: self.value_eventControlRemarks,
              data_list: {
                show_identity: true,
                verified_timestamp:
                  self.value_selectedItemsToShow.find(
                    (item) => item.id === 'VerifiedTimeStamp',
                  ) != undefined,
                person: {
                  id:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PersonId',
                    ) != undefined,
                  name:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PersonName',
                    ) != undefined,
                  card_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'CardNumber',
                    ) != undefined,
                  group_list:
                    self.value_selectedItemsToShow.find((item) => item.id === 'Group')
                    != undefined,
                  title:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'JobTitle',
                    ) != undefined,
                  department:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'Department',
                    ) != undefined,
                  email:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'EmailAddress',
                    ) != undefined,
                  phone_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PhoneNumber',
                    ) != undefined,
                  extension_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'ExtensionNumber',
                    ) != undefined,
                  remarks:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'Remarks',
                    ) != undefined,
                },
                foreHead_temperature:
                  self.value_selectedItemsToShow.find(
                    (item) => item.id === 'Temperature',
                  ) != undefined,
                is_high_temperature: !!self.value_selectedItemsToShow.includes(''),
                display_image: self.value_selectedItemsToShow.find(
                  (item) => item.id === 'CapturedPhoto',
                )
                  ? 'captured'
                  : self.value_selectedItemsToShow.find(
                    (item) => item.id === 'RegisterPhoto',
                  )
                    ? 'register'
                    : self.value_selectedItemsToShow.find(
                      (item) => item.id === 'DisplayPhoto',
                    )
                      ? 'display'
                      : '',
              },
              weekly_schedule: weeklySchedule,
              specify_time: specifyTime,

              token: self.value_eventLineAccessToken,
            };
          } else if (self.value_eventControlType == 'http command') {
            sendData = {
              eventControlType: self.value_eventControlType,
              uuid: self.value_eventControlUuid,
              enable: self.value_eventControlEnabled,
              temperature_trigger_rule: self.value_temperatureTriggerRule,
              name: self.value_eventControlName,
              group_list: self.value_eventControlGroupList,
              remarks: self.value_eventControlRemarks,
              custom_data: self.value_customData,
              data_type: self.value_dataType,
              weekly_schedule: weeklySchedule,
              specify_time: specifyTime,
              host: self.value_eventHttpHostAddress,
              https: self.value_eventHttpEnabledSSL,
              user: self.value_eventHttpUser,
              pass: self.value_eventHttpPass,
              port: self.value_eventHttpPort,
              url: self.value_eventHttpUrl,
              method: self.value_eventHttpMethod,
            };
          } else if (self.value_eventControlType == 'send mail') {
            sendData = {
              eventControlType: self.value_eventControlType,
              uuid: self.value_eventControlUuid,
              enable: self.value_eventControlEnabled,
              temperature_trigger_rule: self.value_temperatureTriggerRule,
              name: self.value_eventControlName,
              group_list: self.value_eventControlGroupList,
              remarks: self.value_eventControlRemarks,
              data_list: {
                show_identity: true,
                verified_timestamp:
                  self.value_selectedItemsToShow.find(
                    (item) => item.id === 'VerifiedTimeStamp',
                  ) != undefined,
                person: {
                  id:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PersonId',
                    ) != undefined,
                  name:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PersonName',
                    ) != undefined,
                  card_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'CardNumber',
                    ) != undefined,
                  group_list:
                    self.value_selectedItemsToShow.find((item) => item.id === 'Group')
                    != undefined,
                  title:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'JobTitle',
                    ) != undefined,
                  department:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'Department',
                    ) != undefined,
                  email:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'EmailAddress',
                    ) != undefined,
                  phone_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'PhoneNumber',
                    ) != undefined,
                  extension_number:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'ExtensionNumber',
                    ) != undefined,
                  remarks:
                    self.value_selectedItemsToShow.find(
                      (item) => item.id === 'Remarks',
                    ) != undefined,
                },
                foreHead_temperature:
                  self.value_selectedItemsToShow.find(
                    (item) => item.id === 'Temperature',
                  ) != undefined,
                is_high_temperature: !!self.value_selectedItemsToShow.includes(''),
                display_image: self.value_selectedItemsToShow.find(
                  (item) => item.id === 'CapturedPhoto',
                )
                  ? 'captured'
                  : self.value_selectedItemsToShow.find(
                    (item) => item.id === 'RegisterPhoto',
                  )
                    ? 'register'
                    : self.value_selectedItemsToShow.find(
                      (item) => item.id === 'DisplayPhoto',
                    )
                      ? 'display'
                      : '',
              },
              weekly_schedule: weeklySchedule,
              specify_time: specifyTime,

              method: 'SMTP',
              host: self.value_eventSMTPHostAddress,
              port: self.value_eventSMTPPort,
              secure: self.value_eventSMTPEnabledSecure,
              user: self.value_eventSMTPUser,
              pass: self.value_eventSMTPPass,
              from: self.value_eventSMTPSender,
              subject: self.value_eventSMTPSubject,
              to: self.value_eventSMTPTo,
              cc: self.value_eventSMTPCC,
              bcc: self.value_eventSMTPBCC,
            };
          }

          self.onFinish(sendData, (success, result) => {
            if (self.obj_loading) self.obj_loading.hide();
            if (success) {
              self.flag_currentSetp = 3;
            } else {
              // self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
              self.$fire({
                text: i18n.formatter.format('Failed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          });
        } else self.flag_currentSetp = 3;
      } else {
        self.$router.push({ name: self.value_returnRoutePath });
      }
    },
    eventControlNameValidator(val) {
      const self = this;
      if (self.flag_modifyMode) {
        self.flag_eventControlNamePass = true;
        return true;
      }
      if (val.replace(/\s/g, '').length == 0) {
        self.flag_eventControlNamePass = false;
      } else {
        self.flag_eventControlNamePass = val.length > 0;
      }
      if (self.flag_eventControlNamePass) {
        self.value_exstingEventControlSettingsList.forEach((setting) => {
          if (setting.name.toLowerCase() == val.toLowerCase()) {
            self.flag_eventControlNamePass = false;
          }
        });
      }
      return self.flag_eventControlNamePass;
    }, //
    httpHostValidator(val) {
      const self = this;

      if (val.replace(/\s/g, '').length == 0) {
        self.flag_customData = false;
      } else {
        self.flag_customData = val.length > 0;
      }
      return self.flag_customData;
    }, //
    keyValidator(val) {
      let flag_pass = false;
      const self = this;
      if (self.flag_currentSetp == 1) {
        if (val.replace(/\s/g, '').length == 0) {
          flag_pass = false;
        } else {
          flag_pass = val.length > 0;
        }
      } else {
        return null;
      }
      return flag_pass;
    }, //
    eventLineAccessTokenValidator(val) {
      let flag_pass = false;
      const self = this;
      if (self.flag_currentSetp == 1) {
        if (val.replace(/\s/g, '').length == 0) {
          flag_pass = false;
          self.flag_hostData = false;
        } else {
          flag_pass = val.length > 0;
          self.flag_hostData = true;
        }
      } else {
        self.flag_hostData = true;
        return null;
      }
      return flag_pass;
    }, //

    showOnStep(step) {
      return step == this.flag_currentSetp ? 'd-block' : 'd-none';
    },
    redrawOnStep(step) {
      return step == this.flag_currentSetp ? 'display:block' : 'height:15px;display:none';
    },
  },

  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
    scheduler: VueScheduler,
  },
};
</script>
