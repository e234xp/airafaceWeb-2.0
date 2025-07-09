<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div>
      <h2 sm="12">{{ disp_header }}</h2>
    </div>
    <!-- Basic -->
    <!-- <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
      >{{ disp_type }}</CRow
    > -->
    <!-- <CRow>
      <CCol sm="6">
        <CSelect size="lg" value="1" v-model="localStep1form.stream_type" :placeholder="dis_placeholder" :options="value_deviceTypesList" />
      </CCol>
    </CRow> -->

    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletDeviceName }}</CRow>
    <CRow>
      <CCol sm="6">
        <CInput size="lg" class="h5" style="width: 100%;" v-model="localStep1form.name" required
          :invalid-feedback="disp_noEmptyNorSpaceOnly" :is-valid="isFieldPassed('name', localStep1form.name)" />
      </CCol>
    </CRow>

    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletID }}</CRow>
    <CRow>
      <CCol sm="6">
        <CInput size="lg" class="h5" style="width: 100%;" v-model="localStep1form.identity" required
          :invalid-feedback="disp_noEmptyNorSpaceOnly" :is-valid="isFieldPassed('identity', localStep1form.identity)" />
      </CCol>
    </CRow>

    <CRow sm="12" class="h5 ml-2 mb-3" style="padding-top: 10px;text-align: right; ">{{ disp_tabletDeviceGroups }}
    </CRow>
    <CRow>
      <CCol sm="6">
        <multiselect placeholder="" :multiple="true" :hideSelected="true" :searchable="false"
          :select-label="disp_select" :selected-label="disp_selected" :deselect-label="disp_deselect"
          v-model="localStep1form.divice_groups" :options="param_deviceGroupsList">
        </multiselect>
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from '@/i18n';

  import Multiselect from 'vue-multiselect';
  import '@/airacss/vue-multiselect.css';

  export default {
    name: 'AddTabletsStep1Form',
    props: {
      step1form: Object,
      defaultValues: Object,
      isFieldPassed: Function,
    },
    emits: ['updateStep1form'],
    data() {
      return {
        localStep1form: { ...this.step1form },

        param_deviceGroupsList: [],
        param_deviceGroupsValue: [],

        disp_header: i18n.formatter.format('TabletsBasicName'),

        disp_type: i18n.formatter.format('TabletsBasicCOlNameDeviceType'),
        disp_tabletID: i18n.formatter.format('TabletsBasicCOlNameDeviceID'),
        disp_tabletDeviceName: i18n.formatter.format('TabletsBasicCOlNameDeviceName'),
        disp_tabletDeviceGroups: i18n.formatter.format('TabletsBasicCOlNameDeviceGroups'),

        value_deviceTypesList: ['airaTablet', 'airaTablet xs'],

        dis_placeholder: i18n.formatter.format('placeholder'), // port 提示文字
        disp_select: i18n.formatter.format('Select'),
        disp_selected: i18n.formatter.format('Selected'),
        disp_deselect: i18n.formatter.format('Deselect'),
        // value_deviceTypesList: ['airaTablet', 'airaTablet xs'],

        disp_noEmptyNorSpaceOnly: i18n.formatter.format('NoEmptyNoSpaceOnly'),
      };
    },
    components: {
      multiselect: Multiselect,
    },
    watch: {
      localStep1form: {
        handler(newValue) {
          const self = this;
          const localValue = { ...newValue };

          if (self.param_deviceGroupsValue.length >= 1) {
            localValue.divice_group_uuids = [];
            if (localValue.divice_groups.length >= 1) {
              localValue.divice_group_uuids = localValue.divice_groups.map((item) => {
                const uuid = self.param_deviceGroupsValue.find((ii) => ii.label === item);
                return uuid.value;
              });
            }
          }
          this.$emit('updateStep1form', { ...localValue });
        },
        deep: true,
      },
      defaultValues: {
        handler(newValue) {
          const localValue = { ...newValue };
          if (localValue.divice_group_uuids) {
            localValue.divice_groups = [];

            const ret = localValue.divice_group_uuids.map((item) => {
              const uuid = this.param_deviceGroupsValue.find((ii) => ii.value === item);
              if (uuid) return uuid.label;
              return null;
            });
            ret.map((item) => {
              if (item !== null) localValue.divice_groups.push(item);

              return true;
            });
          }

          Object.entries(localValue).forEach(([key, value]) => {
            if (!Object.keys(this.step1form).includes(key)) return;
            this.localStep1form[key] = value;
          });
        },
        deep: true,
        immediate: true,
      },
    },

    async mounted() {
      const self = this;
      const ret = await self.$globalFindVideoDeviceGroups('', 0, 3000);
      const {
        data: { result: dataList },
        error,
      } = ret;

      if (!error) {
        self.param_deviceGroupsValue = [];
        self.param_deviceGroupsList = [];
        for (let i = 0; i < dataList.length; i += 1) {
          if (dataList[i].uuid.length === 36) {
            self.param_deviceGroupsValue.push({ value: dataList[i].uuid, label: dataList[i].name });
            self.param_deviceGroupsList.push(dataList[i].name);

            if (self.localStep1form.divice_group_uuids.indexOf(dataList[i].uuid) >= 0) {
              self.localStep1form.divice_groups.push(dataList[i].name);
            }
          }
        }
      }
    },
  };
</script>