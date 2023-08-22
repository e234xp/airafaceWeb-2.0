<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <h2 sm="12">{{ disp_faceAccessTitle }}</h2>
    </div>

    <!-- 項目 -->
    <!-- Face access -->
    <div class="mt-3">

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_recognitionThreshold }}</CRow>
      <CRow>
        <CCol sm="6">verify_target_score
          <CInput size="lg" class="h5" 
            v-model.number="localStep2form.verify_target_score"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('verify_target_score', localStep2form.verify_target_score)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceCaptureInternal }}</CRow>
      <CRow>
        <CCol sm="6">face_capture_interval
          <CInput size="lg"  class="h5"  
            v-model.number="localStep2form.face_capture_interval"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('face_capture_interval', localStep2form.face_capture_interval)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceOverlapRatio }}</CRow>
      <CRow>
        <CCol sm="6">face_overlap_ratio
          <CInput size="lg" class="h5"
            v-model.number="localStep2form.face_overlap_ratio"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('face_overlap_ratio', localStep2form.face_overlap_ratio)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_targetFaceSizeLength }}</CRow>
      <CRow>
        <CCol sm="6">target_face_size_width
          <CInput size="lg" class="h5"
            v-model.number="localStep2form.target_face_size_width"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('target_face_size_width', localStep2form.target_face_size_width)"
            required/>
        </CCol>
      </CRow>

      <!-- Card Access -->
      <CRow sm="12" class="h2 ml-2 mb-3 mt-5" style="padding-top: 10px;text-align: right; ">{{ disp_cardAccessTitle }}</CRow>
      <CRow>enable_id_card
        <CCol sm="1">
          <CSwitch size="lg" class="ml-0 mb-16" color="success" shape="pill"
            @update:checked="enable_id_card = !enable_id_card" :checked="enable_id_card">
          </CSwitch>
        </CCol>
        <CCol sm="6">support_wiegand_bits
          <CSelect
            size="lg"
            v-model="localStep2form.support_wiegand_bits"
            :placeholder="dis_placeholder"
            :options="cardAccessOptions"
          />
        </CCol>
      </CRow>

      <div>
        <!-- option 放group uuid -->
        <CRow sm="12" class="h5 ml-2 mb-2" style="padding-top: 10px;text-align: right; ">{{ disp_allowedPersonnelGroups }}</CRow>
        <CRow>
          <CCol sm="6">group_list_to_pass
            <multiselect
              v-model="localStep2form.group_list_to_pass"
                      :placeholder=dis_placeholder
                      :options="value_allowedPersonnelGroupList"
                      :multiple="true"
                      :taggable="true"
                      :hideSelected="true"
                      :select-label="disp_select"
                      :selected-label="disp_selected"
                      :deselect-label="disp_deselect"
                      :show-no-options="false"
                      label="name"
                      track-by="value"
                      :disabled="!enable_id_card"
                     
            >
            </multiselect>
          </CCol>
        </CRow>
        <div style="height: 35px"></div>

        <!-- trigger -->
        <CRow sm="12">
          <CCol sm="6" class="h5">enable_trigger_relay
            <h5 class="ml-2">{{ disp_triggerRelay }}</h5>
            <CSelect class="mt-2" size="lg" v-model="localStep2form.enable_trigger_relay" :placeholder="dis_placeholder" :options="showOptions" :disabled="!enable_id_card"/>
          </CCol>

          <CCol sm="6" class="h5">relay_delay
            <h5 class="ml-2">{{ disp_relayInternal }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep2form.relay_delay" :disabled="!enable_id_card"/>
          </CCol>
        </CRow>

        <!-- two Factor -->
        <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_twoFactor }}</CRow>
        <CRow>
          <CCol sm="6">enable_two_factor_authentication
            <CSelect
              size="lg"
              v-model="localStep2form.enable_two_factor_authentication"
              :placeholder="dis_placeholder"
              :options="showOptions"
              :disabled="!enable_id_card"
            />
          </CCol>
        </CRow>
      </div>
      
     

      <!-- 延伸項目 Advanced settings -->
      <!-- 標題 -->
      <div>
        <CCol sm="12 mt-5">
          <td class="h4">{{ disp_header }}</td>
        </CCol>

        <div style="height: 35px"></div>
      </div>

      <!-- 項目 -->
      <div class="advanced settings">
            <!-- Relay -->
            <!-- <div>
              <h2 sm="12">{{ disp_relayTitle }}</h2>
            </div>

            <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_Duration }}</CRow>
            <CRow>
              <CCol sm="6">relay_delay
                <CInput size="lg" class="h5"
                  v-model.number="localStep2form.duration"
                  :invalid-feedback="$t('NoEmptyNoSpace')"
                  valid-feedback="ok"
                  :is-valid="isFieldPassed('duration', localStep2form.duration)"
                  required/>
              </CCol>
            </CRow> -->

            <!-- Temperature Mask -->
            <div>
              <div>
                <h2 sm="12">{{ disp_temperatureMaskTitle }}</h2>
              </div>

              <div>
                <h4 sm="12">{{ disp_subTitleName }}</h4>
              </div>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_temperatureUnit }}</CRow>
              <CRow>
                <CCol sm="6">temperature_unit_celsius
                  <CSelect
                    size="lg"
                    v-model="localStep2form.temperature_unit_celsius"
                    :placeholder="dis_placeholder"
                    :options="temperatureOptions"
                  />
                </CCol>
              </CRow>
              <div style="height: 15px"></div>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_threshold }}</CRow>
              <CRow>
                <CCol sm="6">high_temperature
                  <CInput size="lg" class="h5" v-model.number="localStep2form.high_temperature"/>
                </CCol>
              </CRow>
            </div>
            

            <!-- Face masks -->
            <div>
              <div class="mt-3">
                <h4 sm="12">{{ disp_faceMasks }}</h4>
              </div>
              have_to_wear_face_mask
              <CRow>
                <CCol sm="1">
                  <CSwitch size="lg" class="ml-0 mb-16" color="success" shape="pill"
                  @update:checked="have_to_wear_face_mask = !have_to_wear_face_mask" :checked="have_to_wear_face_mask">
                </CSwitch>
                </CCol>

                <CCol sm="11">
                  <h4>{{ disp_enforceFaceMaskCheck }}</h4>
                </CCol>
              </CRow>
            </div>

            <div style="height: 35px"></div>



            <!-- Result Display -->
            <!-- title -->
            <div>
              <div>
                <h2 sm="12">{{ disp_resultDisplayTitle }}</h2>
              </div>

              <!-- content -->
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_displayName }}</CRow>
              <CRow>
                <CCol sm="6">enable_name_mask
                  <CSelect class="mt-2" size="lg" v-model="localStep2form.enable_name_mask" :placeholder="dis_placeholder" :options="displayNameOptions" />
                </CCol>
              </CRow>


              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_displayProfilePhoto }}</CRow>
              <CRow>
                <CCol sm="6">show_profile_photo
                  <CSelect class="mt-2" size="lg" v-model="localStep2form.show_profile_photo" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>
              </CRow>
              

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_strangerDisplayMessage }}</CRow>
              <CRow sm="6">
                <CCol sm="6">stranger_display_name
                  <CInput size="lg" class="mt-2" v-model="localStep2form.stranger_display_name" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_displayVerifyDuration }}</CRow>
              <CRow>
                <CCol sm="6">display_verify_result_time
                  <CInput size="lg" class="mt-2"
                    v-model.number="localStep2form.display_verify_result_time"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('display_verify_result_time', localStep2form.display_verify_result_time)"
                    required/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_showVerifyResult }}</CRow>
              <CRow>
                <CCol sm="6">show_verify_indication
                  <CSelect class="mt-2" size="lg" v-model="localStep2form.show_verify_indication :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>
              </CRow>

              <!-- disable content-->
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationSuccessText }}</CRow>
              <CRow>
                <CCol sm="6">verify_indication_success_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.verify_indication_success_text"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationSuccessMessageText }}</CRow>
              <CRow>
                <CCol sm="6">verify_indication_success_message_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.verify_indication_success_message_text"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationFailText }}</CRow>
              <CRow>
                <CCol sm="6">verify_indication_fail_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.verify_indication_fail_text"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationFailMessageText }}</CRow>
              <CRow>
                <CCol sm="6">verify_indication_fail_message_text
                  <CInput size="lg" class="mt-2"  v-model="localStep2form.verify_indication_fail_message_text"/>
                </CCol>
              </CRow>
            </div>
            
            <!-- Clock setting -->
            <div>
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_enableClockMode }}</CRow>
              <CRow>
                <CCol sm="6">enable_clock_mode
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_clock_mode" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoDataUp }}</CRow>
              <CRow>
                <CCol sm="6">clock_info_data_1
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_info_data_1"/>
                </CCol>
              </CRow>
              
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoDataDown }}</CRow>
              <CRow>
                <CCol sm="6">clock_info_data_2
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_info_data_2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoData3 }}</CRow>
              <CRow>
                <CCol sm="6">clock_info_data_3
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_info_data_3"/>
                </CCol>
              </CRow>

              <!-- disable content -->
              <!-- A -->
              <CRow sm="12">
                <CCol sm="6" class="h5">enable_clock_function_1
                  <h5 class="ml-2">{{ disp_enableClockFunction1 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_clock_function_1" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>

                <CCol sm="6" class="h5">clock_function_name_1
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_function_name_1" />
                </CCol>
              </CRow>

              <!-- B -->
              <CRow sm="12">
                <CCol sm="6" class="h5">enable_clock_function_2
                  <h5 class="ml-2">{{ disp_enableClockFunction2 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_clock_function_2" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>

                <CCol sm="6" class="h5">clock_function_name_2
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_function_name_2" />
                </CCol>
              </CRow>

              <!-- C -->
              <CRow sm="12">
                <CCol sm="6" class="h5">enable_clock_function_3
                  <h5 class="ml-2">{{ disp_enableClockFunction3 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_clock_function_3" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>

                <CCol sm="6" class="h5">clock_function_name_3
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_function_name_3" />
                </CCol>
              </CRow>

              <!-- D -->
              <CRow sm="12">
                <CCol sm="6" class="h5">enable_clock_function_4
                  <h5 class="ml-2">{{ disp_enableClockFunction4 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_clock_function_4" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>

                <CCol sm="6" class="h5">clock_function_name_4
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_function_name_4"/>
                </CCol>
              </CRow>

              <!-- E單欄 -->
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockIndicationSuccessText }}</CRow>
              <CRow>
                <CCol sm="6">clock_indication_success_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_indication_success_text"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockSuccessMessageText }}</CRow>
              <CRow>
                <CCol sm="6">clock_success_message_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_success_message_text"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockIndicationFailText }}</CRow>
              <CRow>
                <CCol sm="6">clock_indication_fail_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_indication_fail_text"/>
                </CCol>
              </CRow>
              
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockFailMessageText }}</CRow>
              <CRow>
                <CCol sm="6">clock_fail_message_text
                  <CInput size="lg" class="mt-2" v-model="localStep2form.clock_fail_message_text"/>
                </CCol>
              </CRow>
            </div>
            

            <!-- RTSP setting -->
            <!-- title -->
            <div>
              <div>
                <h2 sm="12">{{ disp_RTSPSettingTitle }}</h2>
              </div>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_enableRTSPCamera }}</CRow>
              <CRow>
                <CCol sm="6">enable_rtsp_camera
                  <CSelect class="mt-2" size="lg" value="1" v-model="localStep2form.enable_rtsp_camera" :placeholder="dis_placeholder" :options="showOptions" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_ipAddress }}</CRow>
              <CRow sm="6">
                <CCol sm="6">ip_address
                  <CInput size="lg" class="mt-2"
                    v-model="localStep2form.ip_address"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('ip_address', localStep2form.ip_address)"
                    required/>
                </CCol>
              </CRow>
             
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_RTSPUserName }}</CRow>
              <CRow>
                <CCol sm="6">rtsp_username
                  <CInput size="lg" class="mt-2"
                    v-model="localStep2form.rtsp_username"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('rtsp_username', localStep2form.rtsp_username)"
                    required/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_RTSPPassWord }}</CRow>
              <CRow>
                <CCol sm="6">rtsp_password
                  <CInput size="lg" class="mt-2" type="password"
                    v-model="localStep2form.rtsp_password"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('rtsp_password', localStep2form.rtsp_password)"
                    required/>
                </CCol>
              </CRow>
            </div>
      </div>
      {{ localStep2form }}

    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";

export default {
  name: "AddTabletsStep2Form",
  props: {
    step2form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep2form: { ...this.step2form },

      /*Face access title  */
      disp_faceAccessTitle: i18n.formatter.format("TabletsBasicTitleNameFaceAccess"),

      /**content */
      disp_recognitionThreshold: i18n.formatter.format("TabletsBasicCOlNameRecognitionThreshold"),
      disp_faceCaptureInternal: i18n.formatter.format("TabletsBasicCOlNameFaceCaptureInternal"),
      disp_faceOverlapRatio: i18n.formatter.format("TabletsBasicCOlNameFaceOverlapRatio"),
      disp_targetFaceSizeLength: i18n.formatter.format("TabletsBasicCOlNameTargetFaceSizeLength"),

      /*Card access title  */
      disp_cardAccessTitle: i18n.formatter.format("TabletsBasicTitleNameCardAccess"),
      disp_allowedPersonnelGroups: i18n.formatter.format("TabletsBasicCOlNameAllowedPersonnelGroups"),
      disp_triggerRelay: i18n.formatter.format("TabletsBasicCOlNameTriggerRelay"),
      disp_relayInternal: i18n.formatter.format("TabletsBasicCOlNameRelayInternal"),
      disp_twoFactor: i18n.formatter.format("TabletsAccessCOlNameTwoFactor"),

   

      // 延伸項目
      dis_placeholder: i18n.formatter.format("placeholder"), // 提示文字
      disp_select: i18n.formatter.format("Select"),
      disp_selected: i18n.formatter.format("Selected"),
      disp_deselect: i18n.formatter.format("Deselect"),


      /*Basic title  */
      disp_header: i18n.formatter.format("TabletsAccessName"),
      /**content */


      /*Relay title  */
      disp_relayTitle: i18n.formatter.format("TabletsAccessTitleNameRelay"),
      /**content */
      disp_Duration: i18n.formatter.format("TabletsAccessCOlNameDuration"),

      
      /*Temperature & Mask title  */
      disp_temperatureMaskTitle: i18n.formatter.format("TabletsAccessTitleNameTemperatureMask"),
      /**content */
      disp_subTitleName: i18n.formatter.format("TabletsAccessSubTitleName"),
      disp_temperatureUnit: i18n.formatter.format("TabletsAccessColNameTemperatureUnit"),
      disp_threshold: i18n.formatter.format("TabletsAccessColNameThreshold"),
      disp_faceMasks: i18n.formatter.format("TabletsAccessColNameFaceMasks"),
      disp_enforceFaceMaskCheck: i18n.formatter.format("TabletsAccessColNameEnforceFaceMaskCheck"),


      /*Result display title  */
      disp_resultDisplayTitle: i18n.formatter.format("TabletsAccessTitleNameResultDisplay"),

      /**content */
      disp_displayName: i18n.formatter.format("TabletsAccessColNameDisplayName"),
      disp_displayProfilePhoto: i18n.formatter.format("TabletsAccessColNameDisplayProfilePhoto"),
      disp_strangerDisplayMessage: i18n.formatter.format("TabletsAccessColNameStrangerDisplayMessage"),
      disp_displayVerifyDuration: i18n.formatter.format("TabletsAccessColNameDisplayVerifyDuration"),
      disp_showVerifyResult: i18n.formatter.format("TabletsAccessColNameShowVerifyResult"),

      
      disp_verifyIndicationSuccessText: i18n.formatter.format("TabletsAccessColNameVerifyIndicationSuccessText"),
      disp_verifyIndicationSuccessMessageText: i18n.formatter.format("TabletsAccessColNameVerifyIndicationSuccessMessageText"),
      disp_verifyIndicationFailText: i18n.formatter.format("TabletsAccessColNameVerifyIndicationFailText"),
      disp_verifyIndicationFailMessageText: i18n.formatter.format("TabletsAccessColNameVerifyIndicationFailMessageText"),

      /* Clock setting */
      disp_enableClockMode: i18n.formatter.format("TabletsAccessColNameEnableClockMode"),
      disp_clockInfoDataUp: i18n.formatter.format("TabletsAccessColNameClockInfoData(Up)"),
      disp_clockInfoDataDown: i18n.formatter.format("TabletsAccessColNameClockInfoData(Down)"),
      disp_clockInfoData3: i18n.formatter.format("TabletsAccessColNameClockInfoData3"),

      disp_enableClockFunction1: i18n.formatter.format("TabletsAccessColNameEnableClockFunction1"),
      disp_enableClockFunction2: i18n.formatter.format("TabletsAccessColNameEnableClockFunction2"),
      disp_enableClockFunction3: i18n.formatter.format("TabletsAccessColNameEnableClockFunction3"),
      disp_enableClockFunction4: i18n.formatter.format("TabletsAccessColNameEnableClockFunction4"),

      disp_clockIndicationSuccessText: i18n.formatter.format("TabletsAccessColNameClockIndicationSuccessText"),
      disp_clockSuccessMessageText: i18n.formatter.format("TabletsAccessColNameClockSuccessMessageText"),
      disp_clockIndicationFailText: i18n.formatter.format("TabletsAccessColNameClockIndicationFailText"),
      disp_clockFailMessageText: i18n.formatter.format("TabletsAccessColNameClockFailMessageText"),

      /* RTSP setting */
      disp_RTSPSettingTitle: i18n.formatter.format("TabletsAccessTitleNameRTSPSetting"),

      /**content */
      disp_enableRTSPCamera: i18n.formatter.format("TabletsAccessColNameEnableRTSPCamera"),
      disp_ipAddress: i18n.formatter.format("TabletsAccessColNameIpAddress"),
      disp_RTSPUserName: i18n.formatter.format("TabletsAccessColNameRTSPUserName"),
      disp_RTSPPassWord: i18n.formatter.format("TabletsAccessColNameRTSPPassWord"),

      // 預設值i18n

      
      // data
      cardAccessOptions: [ {label:"26Bit", value:26}, {label:"34Bit", value:34} ],
      temperatureOptions: [ {label:"Celsius", value:true}, {label:"Fahrenheit", value:false} ],
      showOptions: ["Yes","No"],
      showOptions: [ {label:"Yes", value:true}, {label:"No", value:false} ],
      
      // checkbox switch
      have_to_wear_face_mask: false,
      enable_id_card: true,



      /**v-model */
      value_allowedPersonnelGroupList: [],
      displayNameOptions:[ {label:"Partial name", value:true}, {label:"Full name", value:false} ],


      /**TEST */
      name:"123",

    };
  },
  components: {
    multiselect: Multiselect,
  },
  watch: {
    localStep2form: {
      handler(newValue) {
        this.$emit("updateStep2form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step2form).includes(key)) return;
          this.localStep2form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
    
  },
};
</script>

