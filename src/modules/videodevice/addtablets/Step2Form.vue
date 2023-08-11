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
        <CCol sm="6">
          <CInput size="lg" class="h5" 
            v-model.number="localStep2form.ip_address5"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('ip_address5', localStep2form.ip_address5)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceCaptureInternal }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg"  class="h5"  
            v-model.number="localStep2form.ip_address2"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('ip_address2', localStep2form.ip_address2)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_faceOverlapRatio }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg" class="h5"
            v-model.number="localStep2form.ip_address3"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('ip_address3', localStep2form.ip_address3)"
            required/>
        </CCol>
      </CRow>

      <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_targetFaceSizeLength }}</CRow>
      <CRow>
        <CCol sm="6">
          <CInput size="lg" class="h5"  
            v-model.number="localStep2form.ip_address4"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="isFieldPassed('ip_address4', localStep2form.ip_address4)"
            required/>
        </CCol>
      </CRow>

      <!-- Card Access -->
      <CRow sm="12" class="h2 ml-2 mb-3 mt-5" style="padding-top: 10px;text-align: right; ">{{ disp_cardAccessTitle }}</CRow>
      <CRow>
        <CCol sm="6">
          <CSelect
            size="lg"
            v-model="localStep2form.name"
            placeholder="請選擇"
            :options="cardAccessOptions"
          />
        </CCol>
      </CRow>

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
       
            <!-- two Factor -->
            <div>
              <CRow sm="12" class="h2 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_twoFactor }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect
                    size="lg"
                    v-model="name"
                    placeholder="請選擇"
                    :options="cardAccessOptions"
                  />
                </CCol>
              </CRow>
            </div>

            <div style="height: 35px"></div>

            <!-- Relay -->
            <div>
              <h2 sm="12">{{ disp_relayTitle }}</h2>
            </div>

            <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_Duration }}</CRow>
            <CRow>
              <CCol sm="6">
                <CInput size="lg" class="h5"
                  v-model.number="localStep2form.duration"
                  :invalid-feedback="$t('NoEmptyNoSpace')"
                  valid-feedback="ok"
                  :is-valid="isFieldPassed('duration', localStep2form.duration)"
                  required/>
              </CCol>
            </CRow>

            <div style="height: 35px"></div>


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
                <CCol sm="6">
                  <CSelect
                    size="lg"
                    v-model="name"
                    placeholder="請選擇"
                    :options="temperatureOptions"
                  />
                </CCol>
              </CRow>
              <div style="height: 15px"></div>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_threshold }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="h5" v-model.number="localStep2form.threshold"/>
                </CCol>
              </CRow>
            </div>
            

            <!-- Face masks -->
            <div>
              <div class="mt-3">
                <h4 sm="12">{{ disp_faceMasks }}</h4>
              </div>
              
              <CRow>
                <CCol sm="1">
                  <CSwitch size="lg" class="ml-0 mb-16" color="success" shape="pill"
                  @update:checked="value_enableStranger = !value_enableStranger" :checked="value_enableStranger">
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
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_shownProfilePhoto }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_strangerDisplayMessage }}</CRow>
              <CRow sm="6">
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_displayVerifyDuration }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"
                    v-model.number="localStep2form.verifyDuration"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('verifyDuration', localStep2form.verifyDuration)"
                    required/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_showVerifyResult }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>
              </CRow>

              <!-- disable content-->
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationSuccessText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationSuccessMessageText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationFailText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_verifyIndicationFailMessageText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>
            </div>

            <!-- Clock setting -->
            <div>
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_enableClockMode }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoDataUp }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoDataDown }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockInfoData3 }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <!-- disable content -->
              <!-- A -->
              <CRow sm="12">
                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_enableClockFunction1 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>

                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <!-- B -->
              <CRow sm="12">
                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_enableClockFunction2 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>

                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <!-- C -->
              <CRow sm="12">
                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_enableClockFunction3 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>

                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <!-- D -->
              <CRow sm="12">
                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_enableClockFunction4 }}</h5>
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>

                <CCol sm="6" class="h5">
                  <h5 class="ml-2">{{ disp_verifyIndicationSuccessText }}</h5>
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <!-- E單欄 -->
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockIndicationSuccessText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockSuccessMessageText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockIndicationFailText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
                </CCol>
              </CRow>
              
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_clockFailMessageText }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"/>
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
                <CCol sm="6">
                  <CSelect class="mt-2" size="lg" value="1" v-model="name" :placeholder="dis_placeholder" :options="cardAccessOptions" />
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_ipAddress }}</CRow>
              <CRow sm="6">
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"
                    v-model.number="localStep2form.rtsp_ip_address"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('rtsp_ip_address', localStep2form.rtsp_ip_address)"
                    required/>
                </CCol>
              </CRow>
             
              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_RTSPUserName }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2"
                    v-model.number="localStep2form.rtsp_username"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('rtsp_username', localStep2form.rtsp_username)"
                    required/>
                </CCol>
              </CRow>

              <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_RTSPPassWord }}</CRow>
              <CRow>
                <CCol sm="6">
                  <CInput size="lg" class="mt-2" type="password"
                    v-model.number="localStep2form.rtsp_password"
                    :invalid-feedback="$t('NoEmptyNoSpace')"
                    valid-feedback="ok"
                    :is-valid="isFieldPassed('rtsp_password', localStep2form.rtsp_password)"
                    required/>
                </CCol>
              </CRow>
            </div>
      </div>
      

    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

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

   

      // 延伸項目
      dis_placeholder: i18n.formatter.format("placeholder"), // 提示文字


      /*Basic title  */
      disp_header: i18n.formatter.format("TabletsAccessName"),
      /**content */
      disp_twoFactor: i18n.formatter.format("TabletsAccessCOlNameTwoFactor"),


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
      disp_shownProfilePhoto: i18n.formatter.format("TabletsAccessColNameShownProfilePhoto"),
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
      cardAccessOptions: ["26Bit","32Bit"],
      temperatureOptions: ["Celsius","Fahrenheit"],

      // checkbox switch
      value_enableStranger: false,



      /**v-model */


      /**TEST */
      name:"123",

    };
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
    },
  },
};
</script>

