<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ disp_header }}
      </div>

      <CCard class="mt-5" v-if="flag_support_wifi">
        <CCardHeader>
          <td>
            <span class="h3">{{ disp_wifiSettings }}</span>
          </td>
        </CCardHeader>

        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow class="align-items-center mb-3">
                <CSwitch size="lg" class="ml-0" color="success" shape="pill"
                  @update:checked="value_wifiActivate = !value_wifiActivate" :checked="value_wifiActivate"
                  :disabled="flag_wifiCannotBeDisabled">
                </CSwitch>
                <div>
                  <span class="h4 ml-2">
                    <span v-if="value_wifiActivate">{{ disp_enable }}</span>
                    <span v-else>{{ disp_disable }}</span>
                  </span>
                </div>
                <div v-if="flag_connectionOk">
                  <span class="h4 ml-4">
                    <span v-if="value_wifiConnected" style="color: #00c861">
                      {{ disp_linked }}
                    </span>
                    <span v-else style="color: #c86100">
                      {{ disp_notLinked }}
                      <span v-if="value_ethernetConnected" style="color: #c86100">
                        {{ disp_priorityIsEthernet }}
                      </span>
                    </span>
                  </span>
                </div>
              </CRow>
            </CCol>
          </CCol>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_currentSsid }}
              </th>
              <th class="h5 w-25 table-th">
                {{ disp_currentIpAddress }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" :value="value_wifiActiveSsid" disabled />
              </td>
              <td class="table-td">
                <CInput size="lg" :value="value_wifiActiveIpaddress" disabled />
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_availableWifi }}</th>
              <th class="h5 w-25 table-th">{{ disp_wifiPassword }}</th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :options="value_avaiableWifiSsidList" @change="selWifiSsid($event)"
                  :disabled="flag_refreshingWifiList">
                  <template #prepend>
                    <CButton size="sm" color="light" @click="refreshAvailableWifiSsidList()"
                      :disabled="flag_refreshingWifiList">
                      <!-- <i class="fa fa-sync fa-spin"/> -->
                      <i class="fa fa-sync" />
                    </CButton>
                  </template>
                </CSelect>
              </td>
              <td class="table-td">
                <CInput size="lg" :type="flag_view_password ? 'text' : 'password'" v-model="value_wifiPassword"
                  :disabled="!flag_wifiNeedPassword">
                  <template #append-content>
                    <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                      <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                      <CIcon v-show="!flag_view_password" src="/img/eye.png" />
                    </CButton>
                  </template>
                </CInput>
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl" @click="clickOnChangeWifi" :disabled="flag_refreshingWifiList">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>
          <td>
            <span class="h3">{{ disp_lanSettings }}</span>
          </td>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow class="align-items-center mb-3">
                <CSwitch size="lg" class="mr-1" color="success" shape="pill"
                  @update:checked="value_ethernetActivate = !value_ethernetActivate" :checked="value_ethernetActivate"
                  :disabled="flag_lanCannotBeDisabled">
                </CSwitch>

                <div>
                  <span class="h4 ml-2" v-if="value_ethernetActivate">{{
                    disp_enable
                    }}</span>
                  <span class="h4 ml-2" v-else>{{ disp_disable }}</span>
                </div>
                <div v-if="flag_connectionOk">
                  <span class="h4 ml-4">
                    <span v-if="value_ethernetConnected" style="color: #00c861">
                      {{ disp_linked }}
                    </span>
                    <span v-else style="color: #c86100">
                      {{ disp_notLinked }}
                    </span>
                  </span>
                </div>
              </CRow>
            </CCol>
          </CCol>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_ipAddress }}</th>
              <th class="h5 w-25 table-th">{{ disp_netmask }}</th>
              <th class="h5 w-25 table-th">{{ disp_gateway }}</th>
              <th class="h5 w-25 table-th">{{ disp_dns }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <div>
                  <span v-if="flag_ethernetModeIsDhcp">
                    <CInput size="lg" v-model="value_dhcpEthernetIp" disabled />
                  </span>
                  <span v-else>
                    <CInput size="lg" v-model="value_staticEthernetIp" />
                  </span>
                </div>
              </td>
              <td class="table-td">
                <div>
                  <span v-if="flag_ethernetModeIsDhcp">
                    <CInput size="lg" v-model="value_dhcpEthernetMask" disabled />
                  </span>
                  <span v-else>
                    <CInput size="lg" v-model="value_staticEthernetMask" />
                  </span>
                </div>
              </td>
              <td class="table-td">
                <div>
                  <span v-if="flag_ethernetModeIsDhcp">
                    <CInput size="lg" v-model="value_dhcpEthernetGateway" disabled />
                  </span>
                  <span v-else>
                    <CInput size="lg" v-model="value_staticEthernetGateway" />
                  </span>
                </div>
              </td>
              <td class="table-td">
                <div>
                  <span v-if="flag_ethernetModeIsDhcp">
                    <CInput size="lg" v-model="value_dhcpEthernetDns" disabled />
                  </span>
                  <span v-else>
                    <CInput size="lg" v-model="value_staticEthernetDns" />
                  </span>
                </div>
              </td>
            </tr>
          </table>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_ethernetMode }}
              </th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
              <th class="h5 w-25 table-th"></th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_selectedEthernetMode" :options="value_ethernetModeOptions"
                  @change="selEthernetMode($event)">
                </CSelect>
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl w-100" @click="clickOnChangeEthernet">
                  {{ disp_apply }}
                </CButton>
              </td>
              <td class="table-td"></td>
              <td class="table-td"></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  // import { deviceTypes } from '@/globalParams.js';

  import { mapState } from 'vuex';

  // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  export default {
    name: 'NetworkSettings',

    data() {
      return {
        param_cardStyle: 'height: 21rem;',

        flag_view_password: false,

        disp_header: i18n.formatter.format('NetworkSettings'),
        disp_enable: i18n.formatter.format('Enable'),
        disp_disable: i18n.formatter.format('Disable'),
        disp_wifiSettings: i18n.formatter.format('WifiSettings'),
        disp_lanSettings: i18n.formatter.format('LanSettings'),
        disp_linked: i18n.formatter.format('Linked'),
        disp_notLinked: i18n.formatter.format('NotLinked'),

        disp_currentSsid: i18n.formatter.format('CurrentSsid'),
        disp_currentIpAddress: i18n.formatter.format('CurrentIpAddress'),
        disp_wifiPassword: i18n.formatter.format('WifiPassword'),
        disp_availableWifi: i18n.formatter.format('AvailableWifi'),
        disp_apply: i18n.formatter.format('Apply'),
        disp_priorityIsEthernet: i18n.formatter.format('PriorityIsEthernet'),
        disp_ethernetMode: i18n.formatter.format('EthernetMode'),

        disp_ipAddress: i18n.formatter.format('IpAddress'),
        disp_netmask: i18n.formatter.format('Netmask'),
        disp_gateway: i18n.formatter.format('Gateway'),
        disp_dns: i18n.formatter.format('DNS'),

        flag_wifiCannotBeDisabled: true,
        flag_lanCannotBeDisabled: true,
        value_wifiConnected: false,
        value_wifiActivate: false,
        value_wifiActiveSsid: '',
        value_wifiActiveIpaddress: '',
        value_ethernetActivate: false,
        value_avaiableWifiSsidList: [],
        value_avaiableWifiSsidDataList: [],
        flag_refreshingWifiList: false,
        flag_wifiNeedPassword: false,
        value_selectedWifiSsid: '',
        value_wifiCapabilities: '',
        value_wifiPassword: '',
        value_selectedEthernetMode: 'DHCP',
        value_ethernetModeOptions: ['DHCP', 'STATIC'],

        flag_connectionOk: false,
        flag_ethernetModeIsDhcp: true,
        value_ethernetConnected: true,
        flag_support_wifi: false,

        value_dhcpEthernetIp: '',
        value_dhcpEthernetMask: '',
        value_dhcpEthernetGateway: '',
        value_dhcpEthernetDns: '',

        value_staticEthernetIp: '',
        value_staticEthernetMask: '',
        value_staticEthernetGateway: '',
        value_staticEthernetDns: '',
      };
    },
    computed: {
      ...mapState(['deviceType']),
    },
    mounted() {
      this.deviceTypes = this.$deviceProfile.deviceTypes;
    },
    created() {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

      self.$globalGetSystemInfo((err, data) => {
        if (data != null) {
          if ((data.device_type === 'airaTablet_xs') || (data.device_type === 'airaFace2')) {
            self.flag_support_wifi = false;
          } else {
            self.flag_support_wifi = true;
          }
        }
      });

      self.fetchWifiInfo((error) => {
        if (error) {
          if (self.obj_loading) self.obj_loading.hide();
          self.$fire({
            text: i18n.formatter.format('NetworkLoss'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        } else {
          self.fetchEthernetWifiInfo((err) => {
            if (err) {
              self.$fire({
                text: i18n.formatter.format('NetworkLoss'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
            if (self.obj_loading) self.obj_loading.hide();
          });
        }
      });

      if (self.obj_loading) self.obj_loading.hide();

      self.refreshAvailableWifiSsidList(() => { });
    },
    watch: {
    },
    methods: {
      viewPassword() {
        const self = this;

        self.flag_view_password = !self.flag_view_password;
      },
      selWifiSsid(e) {
        const self = this;
        self.value_avaiableWifiSsidDataList.forEach((d) => {
          if (d.label === e.target.value) {
            self.value_selectedWifiSsid = e.target.value;
            self.flag_wifiNeedPassword = d.secured;
            self.value_wifiCapabilities = d.capabilities;
            self.value_wifiPassword = '';
          }
        });
      },
      selEthernetMode(e) {
        const self = this;
        if (e.target.value === 'DHCP') {
          self.flag_ethernetModeIsDhcp = true;
          self.value_selectedEthernetMode = 'DHCP';
        } else {
          self.flag_ethernetModeIsDhcp = false;
          self.value_selectedEthernetMode = 'STATIC';

          if (self.value_staticEthernetIp === '') self.value_staticEthernetIp = self.value_dhcpEthernetIp;
          if (self.value_staticEthernetMask === '') self.value_staticEthernetMask = self.value_dhcpEthernetMask;
          if (self.value_staticEthernetGateway === '') self.value_staticEthernetGateway = self.value_dhcpEthernetGateway;
          if (self.value_staticEthernetDns === '') self.value_staticEthernetDns = self.value_dhcpEthernetDns;
        }
      },
      refreshAvailableWifiSsidList(cb) {
        const self = this;
        self.flag_refreshingWifiList = true;
        self.$globalFetchWifiList((error, list) => {
          if (!error && list) {
            self.value_avaiableWifiSsidList = [];
            self.value_avaiableWifiSsidDataList = [];
            self.value_selectedWifiSsid = '';
            self.value_wifiPassword = '';
            self.value_wifiCapabilities = '';
            self.flag_wifiNeedPassword = false;
            list.forEach((wifi) => {
              if (wifi.ssid !== self.value_wifiActiveSsid) {
                if (self.value_selectedWifiSsid === '') {
                  self.value_selectedWifiSsid = wifi.ssid;
                  self.flag_wifiNeedPassword = wifi.secured;
                  self.value_wifiCapabilities = wifi.capabilities;
                  self.value_wifiPassword = '';
                }
                self.value_avaiableWifiSsidList.push(wifi.ssid);
                self.value_avaiableWifiSsidDataList.push({
                  label: wifi.ssid,
                  secured: wifi.secured,
                  capabilities: wifi.capabilities,
                });
              }
            });
          }
          self.flag_refreshingWifiList = false;
          if (cb) cb(error);
        });
      },
      fetchWifiInfo(cb) {
        const self = this;
        self.$globalFetchWifiInfo((error, info) => {
          if (!error && info) {
            self.value_wifiActivate = info.enable;
            self.value_wifiConnected = info.linked;
            if (self.value_wifiConnected) {
              self.value_wifiActiveSsid = info.ssid;
              self.value_wifiActiveIpaddress = info.ip_address;
            } else {
              self.value_wifiActiveSsid = '';
              self.value_wifiActiveIpaddress = '';
            }
            self.flag_connectionOk = true;
          } else self.flag_connectionOk = false;
          if (cb) cb(error);
        });
      },
      fetchEthernetWifiInfo(cb) {
        const self = this;
        self.$globalFetchEthernetInfo((error, info) => {
          if (!error && info) {
            self.value_ethernetActivate = info.enable;
            self.value_ethernetConnected = info.linked;
            self.value_lanActiveIpaddress = info.ip_address;
            self.flag_ethernetModeIsDhcp = info.is_dhcp;
            if (self.flag_ethernetModeIsDhcp) {
              self.value_selectedEthernetMode = 'DHCP';
              self.value_dhcpEthernetIp = info.ip_address;
              self.value_dhcpEthernetMask = info.mask;
              self.value_dhcpEthernetGateway = info.gateway;
              self.value_dhcpEthernetDns = info.dns;
            } else {
              self.value_selectedEthernetMode = 'STATIC';
              self.value_staticEthernetIp = info.ip_address;
              self.value_staticEthernetMask = info.mask;
              self.value_staticEthernetGateway = info.gateway;
              self.value_staticEthernetDns = info.dns;
            }
            self.flag_connectionOk = true;
          } else self.flag_connectionOk = false;
          if (cb) cb(error);
        });
      },
      clickOnChangeEthernet() {
        const self = this;
        self
          .$confirm('', i18n.formatter.format('ConfirmToChangeNetwork'), 'question', {
            confirmButtonText: i18n.formatter.format('Confirm'),
            cancelButtonText: i18n.formatter.format('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          })
          .then(() => {
            self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
            self.$globalChangeEthernet(
              {
                dhcp: self.flag_ethernetModeIsDhcp,
                ip_address: self.value_staticEthernetIp,
                mask: self.value_staticEthernetMask,
                gateway: self.value_staticEthernetGateway,
                dns: self.value_staticEthernetDns,
              },
              () => {
                if (self.obj_loading) self.obj_loading.hide();
                self.$globalLogout();
              },
            );
          })
          .catch(() => { });
      },
      clickOnChangeWifi() {
        const self = this;
        self
          .$confirm('', i18n.formatter.format('ConfirmToChangeNetwork'), 'question', {
            confirmButtonText: i18n.formatter.format('Confirm'),
            cancelButtonText: i18n.formatter.format('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          })
          .then(() => {
            self.flag_refreshingWifiList = true;

            self.$globalChangeWifi(
              {
                ssid: self.value_selectedWifiSsid,
                pass: self.value_wifiPassword,
                capabilities: self.value_wifiCapabilities,
              },
              (error, data) => {
                self.flag_refreshingWifiList = false;

                if (error == null) {
                  if (data.message === 'ok') {
                    self.$fire({
                      text: i18n.formatter.format('Successful'),
                      type: 'success',
                      timer: 30000,
                    });

                    self.flag_refreshingWifiList = false;

                    // let loop = 0 ;
                    // let info = {linked: false};
                    // while( loop < 3 || !info.linked ) {
                    // }

                    self.fetchWifiInfo();
                  } else {
                    self.$fire({
                      text: i18n.formatter.format('OperationFailed'),
                      type: 'error',
                      timer: 3000,
                      confirmButtonColor: '#20a8d8',
                    });
                  }
                } else {
                  self.$fire({
                    text: i18n.formatter.format('OperationFailed'),
                    type: 'error',
                    timer: 3000,
                    confirmButtonColor: '#20a8d8',
                  });
                }
              },
            );
          })
          .catch(() => { });
      },
    },
  };
</script>