<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h4">
          {{ $t('TabletsAccessName') }}
        </td>
      </CCol>

      <div style="height: 35px" />
    </div>

    <!-- 項目 -->
    <CCard>
      <CCardBody>
        <!-- two Factor -->
        <div>
          <CRow
            sm="12"
            class="h2 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessCOlNameTwoFactor') }}
          </CRow>
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

        <div style="height: 35px" />

        <!-- Relay -->
        <div>
          <h2 sm="12">
            {{ $t('TabletsAccessTitleNameRelay') }}
          </h2>
        </div>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          {{ $t('TabletsAccessCOlNameDuration') }}
        </CRow>
        <CRow>
          <CCol sm="6">
            <CInput
              size="lg"
              class="h5"
            />
          </CCol>
        </CRow>

        <div style="height: 35px" />

        <!-- Temperature Mask -->
        <div>
          <div>
            <h2 sm="12">
              {{ $t('TabletsAccessTitleNameTemperatureMask') }}
            </h2>
          </div>

          <div>
            <h4 sm="12">
              {{ $t('TabletsAccessSubTitleName') }}
            </h4>
          </div>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameTemperatureUnit') }}
          </CRow>
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
          <div style="height: 15px" />

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameThreshold') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="h5"
              />
            </CCol>
          </CRow>
        </div>

        <!-- Face masks -->
        <div>
          <div class="mt-3">
            <h4 sm="12">
              {{ $t('TabletsAccessColNameFaceMasks') }}
            </h4>
          </div>

          <CRow>
            <CCol sm="1">
              <CSwitch
                size="lg"
                class="ml-0 mb-16"
                color="success"
                shape="pill"
                @update:checked="value_enableStranger = !value_enableStranger"
                :checked="value_enableStranger"
              />
            </CCol>

            <CCol sm="11">
              <h4>{{ $t('TabletsAccessColNameEnforceFaceMaskCheck') }}</h4>
            </CCol>
          </CRow>
        </div>

        <div style="height: 35px" />

        <!-- Result Display -->
        <!-- title -->
        <div>
          <div>
            <h2 sm="12">
              {{ $t('TabletsAccessTitleNameResultDisplay') }}
            </h2>
          </div>

          <!-- content -->
          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameShownProfilePhoto') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameStrangerDisplayMessage') }}
          </CRow>
          <CRow sm="6">
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameDisplayVerifyDuration') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameShowVerifyResult') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>
          </CRow>

          <!-- disable content-->
          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameVerifyIndicationSuccessText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameVerifyIndicationSuccessMessageText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameVerifyIndicationFailText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ disp_verifyIndicationFailMessageText }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>
        </div>

        <!-- Clock setting -->
        <div>
          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameEnableClockMode') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockInfoData(Up)') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockInfoData(Down)') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockInfoData3') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <!-- disable content -->
          <!-- A -->
          <CRow sm="12">
            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameEnableClockFunction1') }}
              </h5>
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>

            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameVerifyIndicationSuccessText') }}
              </h5>
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <!-- B -->
          <CRow sm="12">
            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameEnableClockFunction2') }}
              </h5>
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>

            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameVerifyIndicationSuccessText') }}
              </h5>
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow sm="12">
            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameEnableClockFunction3') }}
              </h5>
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>

            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameVerifyIndicationSuccessText') }}
              </h5>
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <!-- D -->
          <CRow sm="12">
            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameEnableClockFunction4') }}
              </h5>
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>

            <CCol
              sm="6"
              class="h5"
            >
              <h5 class="ml-2">
                {{ $t('TabletsAccessColNameVerifyIndicationSuccessText') }}
              </h5>
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <!-- E單欄 -->
          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockIndicationSuccessText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockSuccessMessageText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockIndicationFailText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameClockFailMessageText') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>
        </div>

        <!-- RTSP setting -->
        <!-- title -->
        <div>
          <div>
            <h2 sm="12">
              {{ $t('TabletsAccessTitleNameRTSPSetting') }}
            </h2>
          </div>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameEnableRTSPCamera') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CSelect
                class="mt-2"
                size="lg"
                value="1"
                v-model="name"
                :placeholder="$t('placeholder')"
                :options="cardAccessOptions"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameIpAddress') }}
          </CRow>
          <CRow sm="6">
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameRTSPUserName') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
              />
            </CCol>
          </CRow>

          <CRow
            sm="12"
            class="h5 ml-2 mb-3"
            style="padding-top: 10px;text-align: right; "
          >
            {{ $t('TabletsAccessColNameRTSPPassWord') }}
          </CRow>
          <CRow>
            <CCol sm="6">
              <CInput
                size="lg"
                class="mt-2"
                type="password"
              />
            </CCol>
          </CRow>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'CamerasBasic',
  data() {
    return {
      value_dataItemsToShow: [{
        enable: false, name: '', timestamp: '', remark: '', modifier: '', remark1: '',
      }],
      value_allTableItems: [],
      value_tablePage: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0,
      },
      value_searchingFilter: '',
      isChecked: true,

      // checkbox switch
      value_enableStranger: false,

      /** v-model */

      /** TEST */
      name: '123',
      cardAccessOptions: ['C', 'D'],
    };
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },

  methods: {
    selectFaceMaskCheck(e) {
      this.faceMaskCheck = e.target.value == '1' ? 1 : 0;
    },
  },
};
</script>
