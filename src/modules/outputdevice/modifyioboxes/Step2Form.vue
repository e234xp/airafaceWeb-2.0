<template>
  <div id="wrapper">
    <!-- Digital OutPut 1 -->
    <CCard>
      <CCardHeader @click="flag_outPut1Visiable=!flag_outPut1Visiable">
        <span class="h3">{{ disp_digitalOutPutTitle1 }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_outPut1Visiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_outPut1Visiable">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicEnable }}</h5>
            <label class="switch">
              <input class="form-check-input" type="checkbox" v-model="localStep2form[0].enable">
              <span class="slider round"></span>
            </label>
          </CCol>
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicDefaultValue }}</h5>
            <CSelect size="lg" v-model="localStep2form[0].default" :options="value_deviceDefaultValue"
              :filterable="true" class="font-control mt-2" :placeholder="dis_placeholder"
              :disabled="!localStep2form[0].enable" />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicValueWhenTriggered }}</h5>
            <CSelect size="lg" v-model="localStep2form[0].trigger" :options="value_deviceTrigger" :filterable="true"
              class="font-control mt-2" :placeholder="dis_placeholder" :disabled="!localStep2form[0].enable" />
          </CCol>
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicDurationWhenTriggered }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep2form[0].delay" pattern="[0-9]*"
              :invalid-feedback="disp_limitNumber1to30" :is-valid="isFieldPassed('delay', localStep2form[0].delay)"
              required :disabled="!localStep2form[0].enable" />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Digital OutPut 2 -->
    <CCard>
      <CCardHeader @click="flag_outPut2Visiable=!flag_outPut2Visiable">
        <span class="h3">{{ disp_digitalOutPutTitle2 }}</span>
        <div class="card-header-actions">
          <CLink class="card-header-action btn-minimize">
            <CIcon :name="`${flag_outPut2Visiable ? 'cil-chevron-bottom' : 'cil-chevron-top'}`" />
          </CLink>
        </div>
      </CCardHeader>
      <CCardBody v-show="flag_outPut2Visiable">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicEnable }}</h5>
            <label class="switch">
              <input class="form-check-input" type="checkbox" v-model="localStep2form[1].enable">
              <span class="slider round"></span>
            </label>
          </CCol>
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicDefaultValue }}</h5>
            <CSelect size="lg" v-model="localStep2form[1].default" :options="value_deviceDefaultValue"
              :filterable="true" class="font-control mt-2" :placeholder="dis_placeholder"
              :disabled="!localStep2form[1].enable" />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicValueWhenTriggered }}</h5>
            <CSelect size="lg" v-model="localStep2form[1].trigger" :options="value_deviceTrigger" :filterable="true"
              class="font-control mt-2" :placeholder="dis_placeholder" :disabled="!localStep2form[1].enable" />
          </CCol>
          <CCol sm="6" class="h5">
            <h5 class="ml-2">{{ disp_IOBoxesBasicDurationWhenTriggered }}</h5>
            <CInput size="lg" class="mt-2" v-model="localStep2form[1].delay" pattern="[0-9]*"
              :invalid-feedback="disp_limitNumber1to30" :is-valid="isFieldPassed('delay', localStep2form[1].delay)"
              required :disabled="!localStep2form[1].enable" />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

  </div>
</template>

<script>
  import i18n from '@/i18n';

  // import Multiselect from 'vue-multiselect';
  // import '@/airacss/vue-multiselect.css';

  export default {
    name: 'Step2Form',
    props: {
      step2form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    data() {
      return {
        localStep2form: { ...this.step2form },

        isChecked: true,

        flag_outPut1Visiable: true,
        flag_outPut2Visiable: true,

        disp_digitalOutPutTitle1: `${i18n.formatter.format('VideoDeviceDigitalOutPut')} #1`,
        disp_digitalOutPutTitle2: `${i18n.formatter.format('VideoDeviceDigitalOutPut')} #2`,

        dis_placeholder: i18n.formatter.format('placeholder'), // 提示文字
        disp_limitNumber1to30: i18n.formatter.format('limitNumbers1to30'),

        disp_IOBoxesBasicEnable: i18n.formatter.format('I/OBoxesBasicCOlNameEnable'),
        disp_IOBoxesBasicDefaultValue: i18n.formatter.format('I/OBoxesBasicCOlNameDefaultValue'),
        disp_IOBoxesBasicValueWhenTriggered: i18n.formatter.format('I/OBoxesBasicCOlNameValueWhenTriggered'),
        disp_IOBoxesBasicDurationWhenTriggered: i18n.formatter.format('I/OBoxesBasicCOlNameDurationWhenTriggered'),

        value_deviceDefaultValue: [{ label: '0', value: false }, { label: '1', value: true }],
        value_deviceTrigger: [{ label: '0', value: false }, { label: '1', value: true }],

      };
    },
    components: {
      // Multiselect: Multiselect,
    },

    // 拿資料 寫入資料
    watch: {
      localStep2form: {
        handler(newValue) {
          this.$emit('updateStep2form', { ...newValue });
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

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #83bae6;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked+.slider {
    background-color: #2196F3;
  }

  input:disabled+.slider {
    background-color: #ccc;
  }

  input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>