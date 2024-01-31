<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ $t('TimeSettings') }}
      </div>
      <div style="height:30px;" />
      <CCard :style="param_cardStyle">
        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow>
                <span class="h2">{{ $t('CurrentLocalTime') }}</span>
                <div style="width:20px;" />
                <span class="h2">:</span>
                <div style="width:20px;" />
                <span class="h2">{{ value_currentLocalTimeString }}</span>
              </CRow>
              <div style="height:10px;" />
              <CRow>
                <span class="h2">{{ $t('CurrentDeviceTime') }}</span>
                <div style="width:20px;" />
                <span class="h2">:</span>
                <div style="width:20px;" />
                <span class="h2">{{ value_currentDeviceTimeString }}</span>
              </CRow>
            </CCol>
            <div style="height:60px;" />
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ $t('NtpServer') }}
                </div>
                <CInput
                  size="lg"
                  v-model="value_ntpServerIpAddress"
                  :disabled="!value_ntpServerActivate"
                >
                  <template #append-content>
                    <div style="width:55px;margin:0 0 -5px 0">
                      <CSwitch
                        color="success"
                        shape="pill"
                        @update:checked="value_ntpServerActivate = !value_ntpServerActivate"
                        :checked="value_ntpServerActivate"
                      />
                    </div>
                  </template>
                </CInput>
              </CCol>
            </CRow>
          </CCol>
          <div style="height:30px;" />
          <CCol sm="12">
            <CRow>
              <CCol sm="3">
                <div class="h5">
                  {{ $t('Timezone') }}
                </div>
                <CSelect
                  size="lg"
                  :value.sync="value_selectedTimezone"
                  :options="value_avaiableTimezoneListToShow"
                  @change="selTimezone($event)"
                />
              </CCol>
              <CCol sm="3">
                <div style="height:30px;" />
                <CButton
                  style="height:45px;width: 300px;background-color:#20a8d8;color: white;"
                  @click="clickOnApplyTimeSettings"
                  :disabled="flag_applying"
                >
                  <div
                    v-if="value_ntpServerActivate"
                    style="font-size:20px"
                  >
                    {{ $t('SynyMethodNtpServer') }}
                  </div>
                  <div
                    v-else
                    style="font-size:20px"
                  >
                    {{ $t('SynyMethodLocalTime') }}
                  </div>
                </CButton>
              </CCol>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
export default {
  name: 'TimeSettings',

  data() {
    return {
      param_cardStyle: 'height: 25rem;',

      value_ntpServerIpAddress: '',

      flag_applying: false,
      value_ntpServerActivate: false,

      value_currentLocalTimeString: '',
      value_currentLocalTime: 0,

      value_currentDeviceTimeString: '',
      value_currentDeviceTime: 0,

      value_selectedTimezone: '',
      value_deviceTimezone: '',

      value_timeoutID: null,
      value_avaiableTimezoneListToShow: [],
    };
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    window.clearInterval(this.value_timeoutID);
    next();
  },
  created() {
    this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
    this.$globalFetchSupportedTimezoneList((error, list) => {
      if (!error && list) {
        const l = [];
        list.forEach((tz) => {
          l.push({ value: tz.timezone_id, label: `${tz.timezone_id} (${tz.timezone_offset_display})` });
        });
        this.value_avaiableTimezoneListToShow = l;
        this.refreshDeviceTimeInfo(() => {
          if (this.obj_loading) this.obj_loading.hide();
        });
      } else {
        if (this.obj_loading) this.obj_loading.hide();
        this.$fire({
          text: this.$t('NetworkLoss'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    });

    if (this.value_timeoutID == null) {
      this.value_timeoutID = window.setInterval(() => {
        const localTime = new Date();
        this.value_currentLocalTime = Date.now();
        this.value_currentLocalTimeString = `( ${window.Intl.DateTimeFormat().resolvedOptions().timeZone} ) ${
          localTime.getFullYear()}-${
          (localTime.getMonth() + 1).toString().padStart(2, 0)}-${
          localTime.getDate().toString().padStart(2, 0)} ${
          localTime.getHours().toString().padStart(2, 0)}:${
          localTime.getMinutes().toString().padStart(2, 0)}:${
          localTime.getSeconds().toString().padStart(2, 0)}`;

        if (this.value_deviceTimezone.length > 0) {
          const deviceTime = new Date(new Date(this.value_currentDeviceTime).toLocaleString('en-US', { timeZone: this.value_deviceTimezone }));
          this.value_currentDeviceTimeString = `( ${this.value_deviceTimezone} ) ${
            deviceTime.getFullYear()}-${
            (deviceTime.getMonth() + 1).toString().padStart(2, 0)}-${
            deviceTime.getDate().toString().padStart(2, 0)} ${
            deviceTime.getHours().toString().padStart(2, 0)}:${
            deviceTime.getMinutes().toString().padStart(2, 0)}:${
            deviceTime.getSeconds().toString().padStart(2, 0)}`;
          this.value_currentDeviceTime += 1000;
        }
      }, 1000);
    }
  },
  watch: {
    // value_ntpServerActivate : function ( enable ) {
    // }
  },
  methods: {
    getTimezoneOffse(timeZone) {
      const date = new Date();
      const tz = date.toLocaleString('en', { timeZone, timeStyle: 'long' }).split(' ').slice(-1)[0];
      const dateString = date.toString();
      const offset = Date.parse(`${dateString} UTC`) - Date.parse(`${dateString} ${tz}`);

      // return UTC offset in millis
      return offset;
    },
    refreshDeviceTimeInfo(cb) {
      this.$globalFetchTimeInfo((error, info) => {
        if (error) {
          this.value_deviceTimezone = window.Intl.DateTimeFormat().resolvedOptions().timeZone;
        } else {
          this.value_ntpServerIpAddress = info.ntp_server;
          this.value_selectedTimezone = info.time_zone;
          this.value_deviceTimezone = info.time_zone;
          this.value_ntpServerActivate = info.enable_auto_time;
          this.value_currentDeviceTime = info.timestamp;
        }
        if (cb) cb();
      });
    },
    selTimezone(e) {
      this.value_selectedTimezone = e.target.value;
    },
    clickOnApplyTimeSettings() {
      this.flag_applying = true;
      if (this.value_ntpServerActivate) {
        this.$globalEnableNtp({
          enable_auto_time: true,
          enable_auto_timezone: false,
          specify_time_zone: this.value_selectedTimezone,
          specify_ntp_server: this.value_ntpServerIpAddress,
        }, (error, data) => {
          if (error == null) {
            if (data.message == 'ok') {
              this.refreshDeviceTimeInfo();
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else {
              this.$fire({
                text: this.$t('OperationFailed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          } else {
            this.$fire({
              text: this.$t('OperationFailed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          this.flag_applying = false;
        });
      } else {
        this.$globalSyncTime({
          timestamp: Date.now(),
          time_zone: this.value_selectedTimezone,
        }, (error, data) => {
          if (error == null) {
            if (data.message == 'ok') {
              this.refreshDeviceTimeInfo();
              this.$fire({
                text: this.$t('Successful'),
                type: 'success',
                timer: 3000,
              });
            } else {
              this.$fire({
                text: this.$t('OperationFailed'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
          } else {
            this.$fire({
              text: this.$t('OperationFailed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          this.flag_applying = false;
        });
      }
    },
  },
};
</script>
