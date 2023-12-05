<template>
  <div id="wrapper">
    <!-- Brand -->
    <CCard>
      <CCardHeader @click="flag_basicBrandVisiable=!flag_basicBrandVisiable">
        <span class="h3">{{ disp_BasicBrandTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_basicBrandVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_basicBrandVisiable">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicBrand }}</h5>
            <CSelect size="lg" v-model="localStep1form.brand" :options="value_brandList" :filterable="true" class="font-control mt-2"/>
          </CCol>
          <CCol sm="6" class="h5"  >
            <h5 class="ml-2">{{ disp_IOBoxesBasicModel }}</h5>
            <CSelect size="lg" v-model="localStep1form.model" :options="value_modelList" :filterable="true" class="font-control mt-2"/>
          </CCol>
        </CRow>

        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicDeviceName }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep1form.name"
              :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
              :is-valid="isFieldPassed('name', localStep1form.name)"
              required/>
          </CCol>

          <CCol sm="6" class="h5 d-none" >
            <h5 class="ml-2">{{ disp_IOBoxesBasicDeviceGroups }}</h5>
            <multiselect class="mt-2"  v-model="localStep1form.divice_groups" placeholder="" :options="value_deviceGroupsList" :multiple="true"
              :taggable="true" :hideSelected="true"
              :show-no-options="false"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Connection -->
    <CCard>
      <CCardHeader @click="flag_connectionVisiable=!flag_connectionVisiable">
        <span class="h3">{{ disp_ConnectionTitle }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_connectionVisiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_connectionVisiable">
        <CRow sm="12">
          <CCol sm="6" class="h5"  >
            <h5 class="ml-2">{{ disp_IOBoxesBasicIP }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep1form.ip_address"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('ip_address', localStep1form.ip_address)"
              required/>
          </CCol>
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicPort }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep1form.port"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('port', localStep1form.port)"
              required/>
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol sm="6" class="h5"  >
            <h5 class="ml-2">{{ disp_IOBoxesBasicUserName }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep1form.username"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('user', localStep1form.username)"
              required/>
          </CCol>
          <CCol sm="6" class="h5"  >
            <h5 class="ml-2">{{ disp_IOBoxesBasicPassword }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep1form.password" :type="flag_view_password ? 'text' : 'password'"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('pass', localStep1form.password)"
              required>
              <template #append-content>
                <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                  <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                  <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                </CButton>
              </template>
            </CInput>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from '@/i18n';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

export default {
  name: 'Step1Form',
  props: {
    step1form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  data() {
    return {
      localStep1form: { ...this.step1form },

      isChecked: true,

      disp_BasicBrandTitle: i18n.formatter.format('I/OBoxesBasicName'),
      disp_ConnectionTitle: i18n.formatter.format('I/OBoxesBasicTitleNameConnection'),

      flag_basicBrandVisiable: true,
      flag_connectionVisiable: true,

      disp_IOBoxesBasicBrand: i18n.formatter.format('I/OBoxesBasicCOlNameBrand'),
      disp_IOBoxesBasicModel: i18n.formatter.format('I/OBoxesBasicCOlNameModel'),
      disp_IOBoxesBasicDeviceName: i18n.formatter.format('I/OBoxesBasicCOlNameDeviceName'),
      disp_IOBoxesBasicDeviceGroups: i18n.formatter.format('I/OBoxesBasicCOlNameDeviceGroups'),
      disp_IOBoxesBasicIP: i18n.formatter.format('I/OBoxesBasicCOlNameIP'),
      disp_IOBoxesBasicPort: i18n.formatter.format('I/OBoxesBasicCOlNamePort'),
      disp_IOBoxesBasicUserName: i18n.formatter.format('I/OBoxesBasicCOlNameUserName'),
      disp_IOBoxesBasicPassword: i18n.formatter.format('I/OBoxesBasicCOlNamePassword'),

      value_deviceGroupsList: ['A', 'B'],
      value_brandList: ['airaIO box'],
      value_modelList: ['TCP-KP-C2'],
      value_deviceGroups: '',
      // value_deviceGroupsList: [1, 2, 3],

      flag_view_password: false,
    };
  },
  components: {
    multiselect: Multiselect,
  },
  // 拿資料 寫入資料
  watch: {
    localStep1form: {
      handler(newValue) {
        console.log('emit updateStep1form');
        this.$emit('updateStep1form', { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step1form).includes(key)) return;
          this.localStep1form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },
  },
};
</script>
