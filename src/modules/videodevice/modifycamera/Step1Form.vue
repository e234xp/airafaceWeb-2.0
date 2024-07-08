<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div>
      <h2 sm="12">
        {{ disp_headertitle }}
      </h2>
    </div>
    <!-- Basic -->
    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
    >
      {{ disp_basicDeviceName }}
    </CRow>
    <CRow>
      <CCol sm="6">
        <CInput
          size="lg"
          class="h5"
          v-model="localStep1form.name"
          :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
          :is-valid="isFieldPassed('name', localStep1form.name)"
          required
        />
      </CCol>
    </CRow>

    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
    >
      {{ disp_basicDeviceGroups }}
    </CRow>
    <CRow>
      <CCol sm="6">
        <multiselect
          placeholder=""
          :multiple="true"
          :hide-selected="true"
          :searchable="false"
          :select-label="disp_select"
          :selected-label="disp_selected"
          :deselect-label="disp_deselect"
          v-model="localStep1form.divice_groups"
          :options="param_deviceGroupsList"
        />
      </CCol>
    </CRow>

    <div style="height: 35px" />

    <!-- Video Source -->
    <div>
      <h2 sm="12">
        {{ disp_subtitle }}
      </h2>
    </div>

    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
    >
      {{ disp_type }}
    </CRow>
    <CRow>
      <CCol sm="6">
        <CSelect
          size="lg"
          :value.sync="localStep1form.stream_type"
          :options="value_deviceTypesList"
        />
      </CCol>
    </CRow>

    <!-- 類型等於sdp時 -->
    <div
      id="type"
      v-if="localStep1form.stream_type !== 'rtsp'"
    >
      <CRow
        sm="12"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ disp_parameters }}
      </CRow>
      <CRow>
        <textarea
          class="ml-3 mb-3 form-control"
          v-model="localStep1form.connection_info"
          rows="5"
          :invalid-feedback="$t('NoEmptyNoSpace')"
          :is-valid="
            isFieldPassed('connection_info', localStep1form.connection_info)
          "
          required
        />
      </CRow>

      <div v-if="isShowConnectionString">
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px; text-align: right"
        >
          {{ disp_connectionString }}
        </CRow>
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%"
              v-model="connectionString"
              disabled="disabled"
            />
          </CCol>
        </CRow>
      </div>
    </div>

    <!-- rtsp時 -->
    <div
      id="type"
      v-else
    >
      <div class="mt-3">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            {{ disp_ipAddress }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.ip_address"
              :invalid-feedback="flag_ipAddrPass"
              :is-valid="ipAddrValidator"
              required
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            {{ disp_port }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model.number="localStep1form.port"
              :invalid-feedback="flag_portPass"
              :is-valid="portValidator"
              required
            />
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            {{ disp_username }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.user"
              :invalid-feedback="flag_userPass"
              :is-valid="userValidator"
              required
            />
          </CCol>

          <CCol
            sm="6"
            class="h5"
          >
            {{ disp_password }}
            <CInput
              size="lg"
              :type="flag_view_password ? 'text' : 'password'"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.pass"
              required
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
          </CCol>
        </CRow>
      </div>

      <CRow
        sm="12"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
      >
        {{ disp_parameters }}
      </CRow>
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model="localStep1form.connection_info"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            :is-valid="
              isFieldPassed('connection_info', localStep1form.connection_info)
            "
            required
          />
        </CCol>
      </CRow>

      <div v-if="isShowConnectionString">
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px; text-align: right"
        >
          {{ disp_connectionString }}
        </CRow>
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%"
              v-model="connectionString"
              disabled="disabled"
            />
          </CCol>
        </CRow>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

import { checkPort, checkIpAddr } from '@/utils';

export default {
  name: 'ModifyCamerasStep1Form',
  props: {
    step1form: {
      type: Object,
      default: () => ({}),
    },
    defaultValues: {
      type: Object,
      default: () => ({}),
    },
    isFieldPassed: {
      type: Function,
      default: () => () => true,
    },
  },
  emits: ['updateStep1form'],
  data() {
    return {
      localStep1form: {},

      param_deviceGroupsList: [],
      param_deviceGroupsValue: [],

      flag_view_password: false,

      disp_headertitle: i18n.formatter.format('VideoDeviceBasic'),
      // disp_header: i18n.formatter.format('VideoDeviceBasic'),

      disp_basicDeviceName: i18n.formatter.format('BasicDeviceName'),
      disp_basicDeviceGroups: i18n.formatter.format('BasicDeviceGroups'),

      disp_subtitle: i18n.formatter.format('VideoDeviceVideoSource'),

      disp_type: i18n.formatter.format('VideoSourceType'),
      disp_ipAddress: i18n.formatter.format('VideoSourceIpAddress'),
      disp_port: i18n.formatter.format('VideoSourcePort'),
      disp_username: i18n.formatter.format('VideoSourceUsername'),
      disp_password: i18n.formatter.format('VideoSourcePassword'),
      disp_parameters: i18n.formatter.format('VideoSourceParameters'),
      disp_connectionString: i18n.formatter.format(
        'VideoSourceConnectionString',
      ),

      // 文字提示
      disp_limitNumber0to1: i18n.formatter.format('limitNumber0to1'), // port 提示文字
      dis_placeholder: i18n.formatter.format('placeholder'), // port 提示文字
      disp_select: i18n.formatter.format('Select'),
      disp_selected: i18n.formatter.format('Selected'),
      disp_deselect: i18n.formatter.format('Deselect'),

      // 設備群組 下拉選項
      value_deviceGroupsList: [],

      groupValue: [],

      // 設備類型
      value_deviceTypesList: [
        { value: 'rtsp', label: i18n.formatter.format('RTSP') },
        { value: 'sdp', label: i18n.formatter.format('RTP') },
      ],

      flag_portPass: '',
      flag_ipAddrPass: '',
      flag_userPass: '',
    };
  },
  components: {
    multiselect: Multiselect,
  },
  computed: {
    isShowConnectionString() {
      // 判断輸入框是否都不為空
      return this.flag_portPass === ''
        && this.flag_ipAddrPass === ''
        && this.flag_userPass === ''
        && this.localStep1form.connection_info !== '';
    },
    // 連接資訊   let testString = 'rtsp://admin:12345@192.168.10.171:554/media/video1';
    connectionString() {
      return `${this.localStep1form.stream_type}://${this.localStep1form.user}`
        + `${this.localStep1form.pass !== '' ? ':' : ''}${this.localStep1form.pass.replace(/./g, '*')}`
        + `${this.localStep1form.user !== '' ? '@' : ''}${this.localStep1form.ip_address}`
        + `:${this.localStep1form.port}${this.localStep1form.connection_info}`;
    },
  },
  // 拿資料 寫入資料
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
  created() {
    this.localStep1form = { ...this.step1form };
  },
  mounted() {
    this.formatNameList();
  },
  methods: {
    viewPassword() {
      const self = this;

      self.flag_view_password = !self.flag_view_password;
    },

    async formatNameList() {
      const self = this;

      const ret = await self.$globalFindVideoDeviceGroups('', 0, 3000);
      const {
        data: { result: dataList },
        error,
      } = ret;

      if (!error) {
        self.param_deviceGroupsValue = [];
        self.param_deviceGroupsList = [];
        self.localStep1form.divice_groups = [];
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

    portValidator(val) {
      this.flag_portPass = checkPort(val);
      return this.flag_portPass === '';
    },

    ipAddrValidator(val) {
      this.flag_ipAddrPass = checkIpAddr(val);
      return this.flag_ipAddrPass === '';
    },

    userValidator(val) {
      this.flag_userPass = val === '' && this.localStep1form.pass !== '' ? this.$t('NoEmptyNoSpace') : '';
      return this.flag_userPass === '';
    },
  },
};
</script>
