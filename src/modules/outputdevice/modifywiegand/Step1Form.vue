<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div class="content">
      <!-- Basic -->
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_WiegandBasicDeviceName }}
            <CInput size="lg" class="mt-2" v-model="localStep1form.name"
              :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
              :is-valid="isFieldPassed('name', localStep1form.name)" required />
          </CCol>
          <CCol sm="6" class="h5 d-none">
            {{ disp_WiegandBasicDeviceGroups }}
            <CSelect size="lg" v-model="localStep1form.divice_groups" :options="value_deviceGroupsList"
              :filterable="true" class="font-control mt-2" :placeholder="dis_placeholder" />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_WiegandBasicIP }}
            <CInput size="lg" class="mt-2" v-model="localStep1form.ip_address" :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('ip_address', localStep1form.ip_address)" required />
          </CCol>
          <CCol sm="6" class="h5">
            {{ disp_WiegandBasicPort }}
            <CInput size="lg" class="mt-2" v-model.number="localStep1form.port" :invalid-feedback="$t('NoEmptyNoSpace')"
              :is-valid="isFieldPassed('port', localStep1form.port)" required />
          </CCol>
        </CRow>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ModifyWiegandConvertersStep1Form',
    props: {
      step1form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    data() {
      return {
        localStep1form: { ...this.step1form },

        disp_header: i18n.formatter.format('WiegandBasicName'),

        disp_WiegandBasicDeviceName: i18n.formatter.format('WiegandBasicCOlNameDeviceName'),
        disp_WiegandBasicDeviceGroups: i18n.formatter.format('WiegandBasicCOlNameDeviceGroups'),
        disp_WiegandBasicIP: i18n.formatter.format('WiegandBasicCOlNameIP'),
        disp_WiegandBasicPort: i18n.formatter.format('WiegandBasicCOlNamePort'),

        dis_placeholder: i18n.formatter.format('placeholder'), // port 提示文字

        value_deviceGroups: '',
        // value_deviceGroupsList: [1, 2, 3],
      };
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
  };
</script>