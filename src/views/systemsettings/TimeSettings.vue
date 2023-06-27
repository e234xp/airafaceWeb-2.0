<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ disp_header }}
      </div>
      <div style="height:30px;"></div>
      <CCard :style="param_cardStyle">
        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow>
                <span class="h2">{{disp_currentLocalTime}}</span>
                <div style="width:20px;"></div>
                <span class="h2">:</span>
                <div style="width:20px;"></div>
                <span class="h2">{{value_currentLocalTimeString}}</span>
              </CRow>
              <div style="height:10px;"></div>
              <CRow>
                <span class="h2">{{disp_currentDeviceTime}}</span>
                <div style="width:20px;"></div>
                <span class="h2">:</span>
                <div style="width:20px;"></div>
                <span class="h2">{{value_currentDeviceTimeString}}</span>
              </CRow>
            </CCol>
            <div style="height:60px;"></div>
            <CRow>
              <CCol sm="3">
                <div class="h5">{{disp_ntpServer}}</div>
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
          <div style="height:30px;"></div>
          <CCol sm="12">
            <CRow>
              <CCol sm="3">
                <div class="h5">{{disp_timezone}}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_selectedTimezone"
                  :options="value_avaiableTimezoneListToShow"
                  @change="selTimezone($event)"
                />
              </CCol>
              <CCol sm="3">
                <div style="height:30px;"></div>
                <CButton
                  style="height:45px;width: 300px;background-color:#20a8d8;color: white;"
                  @click="clickOnApplyTimeSettings"
                  :disabled="flag_applying"
                >
                <div v-if="value_ntpServerActivate" style="font-size:20px">{{disp_synyMethodNtpServer}}</div>
                <div v-else style="font-size:20px">{{disp_synyMethodLocalTime}}</div>
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

import i18n from "../../i18n"
export default {
  name: 'TimeSettings',

  data () {
    return {
      param_cardStyle: "height: 25rem;",
      disp_header: i18n.formatter.format("TimeSettings"),
      disp_enable: i18n.formatter.format("Enable"),
      disp_disable: i18n.formatter.format("Disable"),
      disp_currentLocalTime: i18n.formatter.format("CurrentLocalTime"),
      disp_currentDeviceTime: i18n.formatter.format("CurrentDeviceTime"),

      disp_ntpServer: i18n.formatter.format("NtpServer"),
      disp_synyMethodLocalTime : i18n.formatter.format("SynyMethodLocalTime"),
      disp_synyMethodNtpServer : i18n.formatter.format("SynyMethodNtpServer"),

      value_ntpServerIpAddress : "",

      disp_apply : i18n.formatter.format("Apply"),

      flag_applying : false,
      value_ntpServerActivate : false,

      value_currentLocalTimeString : "",
      value_currentLocalTime : 0,

      value_currentDeviceTimeString : "",
      value_currentDeviceTime : 0,

      value_selectedTimezone : "",
      value_deviceTimezone : "",

      value_timeoutID : null,
      disp_timezone : i18n.formatter.format("Timezone"),
      value_avaiableTimezoneListToShow : []
    };
  },
  beforeRouteEnter (to, from, next) {
    next();
  },
  beforeRouteLeave (to, from , next) {
    window.clearInterval(this.value_timeoutID);
    next();
  },
  created() {
    const self = this;
    self.obj_loading = self.$loading.show( {container: self.$refs.formContainer});
    self.$globalFetchSupportedTimezoneList(( error, list ) => {
        if( !error && list ) {
          let l = [];
          list.forEach( (tz) => {
            l.push( { value : tz.timezone_id, label : tz.timezone_id + " (" + tz.timezone_offset_display + ")" } );
          });
          self.value_avaiableTimezoneListToShow = l;
          self.refreshDeviceTimeInfo( function() {
            if( self.obj_loading ) self.obj_loading.hide();
          });
        }
        else {
          if( self.obj_loading ) self.obj_loading.hide();
          self.$fire({
              text: i18n.formatter.format("NetworkLoss"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8"
            });
        }
        
    });

    if( self.value_timeoutID == null ) self.value_timeoutID = window.setInterval( () => {
      let localTime = new Date();
      self.value_currentLocalTime = Date.now();
      self.value_currentLocalTimeString = "( " + window.Intl.DateTimeFormat().resolvedOptions().timeZone + " ) " +
      localTime.getFullYear() + "-" + 
      (localTime.getMonth()+1).toString().padStart(2, 0) + "-" + 
      localTime.getDate().toString().padStart(2, 0) + " " +
      localTime.getHours().toString().padStart(2, 0)  + ":" + 
      localTime.getMinutes().toString().padStart(2, 0)  + ":" + 
      localTime.getSeconds().toString().padStart(2, 0) ;

      if( self.value_deviceTimezone.length > 0 ) {
        const deviceTime = new Date( new Date( self.value_currentDeviceTime).toLocaleString('en-US', {timeZone: self.value_deviceTimezone} ) );
        self.value_currentDeviceTimeString = "( " + self.value_deviceTimezone + " ) " +
        deviceTime.getFullYear() + "-" + 
        (deviceTime.getMonth()+1).toString().padStart(2, 0) + "-" + 
        deviceTime.getDate().toString().padStart(2, 0) + " " +
        deviceTime.getHours().toString().padStart(2, 0)  + ":" + 
        deviceTime.getMinutes().toString().padStart(2, 0)  + ":" + 
        deviceTime.getSeconds().toString().padStart(2, 0) ;
        self.value_currentDeviceTime = self.value_currentDeviceTime + 1000;
      }
    }, 1000 );
  },
  watch: {
    // value_ntpServerActivate : function ( enable ) {
    //   const self = this;
    // }
  },
  methods: {
    getTimezoneOffse( timeZone ) {
      const date = new Date();
      const tz = date.toLocaleString("en", {timeZone, timeStyle: "long"}).split(" ").slice(-1)[0];
      const dateString = date.toString();
      const offset = Date.parse(`${dateString} UTC`) - Date.parse(`${dateString} ${tz}`);
      
      // return UTC offset in millis
      return offset;
    },
    refreshDeviceTimeInfo( cb ) {
      const self = this;
      self.$globalFetchTimeInfo(( error, info ) => {
        if( error ) {
          self.value_deviceTimezone = window.Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        else {
          self.value_ntpServerIpAddress = info.ntp_server;
          self.value_selectedTimezone = info.time_zone;
          self.value_deviceTimezone = info.time_zone;
          self.value_ntpServerActivate = info.enable_auto_time;
          self.value_currentDeviceTime = info.timestamp;
        }
        if( cb ) cb();
      });
    },
    selTimezone ( e ) {
      this.value_selectedTimezone = e.target.value;
    },
    clickOnApplyTimeSettings () {
      const self = this;
      self.flag_applying = true;
      if( self.value_ntpServerActivate ) {
        self.$globalEnableNtp( {
          enable_auto_time : true,
          enable_auto_timezone : false,
          specify_time_zone : self.value_selectedTimezone,
          specify_ntp_server : self.value_ntpServerIpAddress },( error, data ) => {
          if( error == null ) {
            if( data.message == "ok" ) {
              self.refreshDeviceTimeInfo();
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000
              });
            }
            else {
              self.$fire({
                text: i18n.formatter.format("OperationFailed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8"
              });
            }
          }
          else {
            self.$fire({
              text: i18n.formatter.format("OperationFailed"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8"
            });
          }
          self.flag_applying = false;
        });
      }
      else {
        self.$globalSyncTime( {
          timestamp : Date.now(),
          time_zone : self.value_selectedTimezone },( error, data ) => {
          if( error == null ) {
            if( data.message == "ok" ) {
              self.refreshDeviceTimeInfo();
              self.$fire({
                text: i18n.formatter.format("Successful"),
                type: "success",
                timer: 3000
              });
            }
            else {
              self.$fire({
                text: i18n.formatter.format("OperationFailed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8"
              });
            }
          }
          else {
            self.$fire({
              text: i18n.formatter.format("OperationFailed"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8"
            });
          }
          self.flag_applying = false;
        });
      }
    }
  }
}
</script>
