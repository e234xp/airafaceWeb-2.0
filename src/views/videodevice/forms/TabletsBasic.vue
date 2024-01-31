<template>
  <div id="wrapper">
    <!-- 標題 -->
    <div>
      <CCol sm="12">
        <td class="h1">
          {{ $t('TabletsBasicName') }}
        </td>
      </CCol>

      <div style="height: 35px" />
    </div>

    <!-- 項目 -->
    <CCard>
      <CCardBody>
        <!-- Basic -->
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          <!-- FIXME: no i18n -->
          {{ $t('TabletsBasicCOlNameUUID') }}
        </CRow>
        <CRow>
          <CCol sm="6">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%;"
            />
          </CCol>
        </CRow>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          {{ $t('TabletsBasicCOlNameDeviceName') }}
        </CRow>
        <CRow>
          <CCol sm="6">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%;"
            />
          </CCol>
        </CRow>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          {{ $t('TabletsBasicCOlNameDeviceGroups') }}
        </CRow>
        <CRow>
          <CCol sm="6">
            <multiselect
              v-model="value_deviceGroups"
              placeholder=""
              :options="value_deviceGroupsList"
              :multiple="true"
              :taggable="true"
              :hide-selected="true"
              :show-no-options="false"
            />
          </CCol>
        </CRow>

        <div style="height: 35px" />

        <!-- Face access -->
        <div>
          <h2 sm="12">
            {{ $t('TabletsBasicTitleNameFaceAccess') }}
          </h2>
        </div>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          <!-- FIXME: no i18n -->
          {{ $t('TabletsBasicCOlNameFaceDetectionThreshold') }}
        </CRow>
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%;"
            />
          </CCol>
        </CRow>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          {{ $t('TabletsBasicCOlNameRecognitionThreshold') }}
        </CRow>
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%;"
            />
          </CCol>
        </CRow>

        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          <!-- FIXME: no i18n -->
          {{ $t('TabletsBasicCOlNameAntiSpoofingThreshold') }}
        </CRow>
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%;"
            />
          </CCol>
        </CRow>

        <!-- Card access -->
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px;text-align: right; "
        >
          {{ $t('TabletsBasicTitleNameCardAccess') }}
        </CRow>
        <CRow>
          <CCol sm="6">
            <v-select
              v-model="value_deviceGroups"
              :options="value_deviceGroupsList"
              :filterable="true"
              class="font-control"
            />
          </CCol>
        </CRow>

        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="isChecked"
            value=""
            id="checkbox1"
          >
          <label
            class="form-check-label mt-2"
            for="flexCheckDefault"
          >
            Frontal face filter
          </label>
          <input
            class="form-check-input mt-1 ml-5"
            type="text"
            value=""
            id="cardNo"
          >
        </div>

        <!-- 儲存按鈕 -->
        <div class="d-flex ml-3 justify-content-end">
          <CButton
            class="btn btn-outline-primary btn-w-normal mb-3"
            size="lg"
            @click="saveData()"
          >
            {{ $t('Save') }}
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

export default {
  name: 'TabletsBasic',
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

      value_deviceGroups: '',
      value_deviceGroupsList: [1, 2, 3],
    };
  },
  components: {
    Multiselect,
  },
  computed: {
    ...mapState(['ellipsisMode']),
  },
  methods: {},
};
</script>
