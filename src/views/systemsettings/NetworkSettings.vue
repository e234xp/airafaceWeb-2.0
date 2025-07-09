<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ $t('NetworkSettings') }}
      </div>

      <CCard class="mt-5" v-if="deviceProfile.support_wifi">
        <CCardHeader>
          <td>
            <span class="h3">{{ $t('WifiSettings') }}</span>
          </td>
        </CCardHeader>

        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow class="align-items-center mb-3">
                <CSwitch size="lg" class="ml-0" color="success" shape="pill"
                  @update:checked="value_wifiActivate = !value_wifiActivate" :checked="value_wifiActivate"
                  :disabled="flag_wifiCannotBeDisabled" />
                <div>
                  <span class="h4 ml-2">
                    <span v-if="value_wifiActivate">{{ $t('Enable') }}</span>
                    <span v-else>{{ $t('Disable') }}</span>
                  </span>
                </div>
                <div v-if="flag_connectionOk">
                  <span class="h4 ml-4">
                    <span v-if="value_wifiConnected" style="color: #00c861">
                      {{ $t('Linked') }}
                    </span>
                    <span v-else style="color: #c86100">
                      {{ $t('NotLinked') }}
                      <span v-if="value_ethernetConnected" style="color: #c86100">
                        {{ $t('PriorityIsEthernet') }}
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
                {{ $t('CurrentSsid') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('CurrentIpAddress') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput size="lg" :value="value_wifiActiveSsid" disabled />
              </td>
              <td class="table-td">
                <CInput size="lg" :value="value_wifiActiveIpaddress" disabled />
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('AvailableWifi') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('WifiPassword') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
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
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>
          <td>
            <span class="h3">{{ $t('LanSettings') }}</span>
          </td>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <CCol sm="12">
              <CRow class="align-items-center mb-3">
                <CSwitch size="lg" class="mr-1" color="success" shape="pill"
                  @update:checked="value_ethernetActivate = !value_ethernetActivate" :checked="value_ethernetActivate"
                  :disabled="flag_lanCannotBeDisabled" />

                <div>
                  <span class="h4 ml-2" v-if="value_ethernetActivate">
                    {{ $t('Enable') }}
                  </span>
                  <span class="h4 ml-2" v-else>{{ $t('Disable') }}</span>
                </div>
                <div v-if="flag_connectionOk">
                  <span class="h4 ml-4">
                    <span v-if="value_ethernetConnected" style="color: #00c861">
                      {{ $t('Linked') }}
                    </span>
                    <span v-else style="color: #c86100">
                      {{ $t('NotLinked') }}
                    </span>
                  </span>
                </div>
              </CRow>
            </CCol>
          </CCol>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('IpAddress') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Netmask') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Gateway') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('DNS') }}
              </th>
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
                {{ $t('EthernetMode') }}
              </th>
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
              <th class="h5 w-25 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_selectedEthernetMode" :options="value_ethernetModeOptions"
                  @change="selEthernetMode($event)" />
              </td>
              <td class="table-td">
                <CButton class="btn btn-primary fz-xl w-100" @click="clickOnChangeEthernet">
                  {{ $t('Apply') }}
                </CButton>
              </td>
              <td class="table-td" />
              <td class="table-td" />
            </tr>
          </table>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
  // import { mapState } from 'vuex';
  // import store from '@/store';

  export default {
    name: 'NetworkSettings',

    data() {
      return {
        param_cardStyle: 'height: 21rem;',

        flag_view_password: false,

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

        value_dhcpEthernetIp: '',
        value_dhcpEthernetMask: '',
        value_dhcpEthernetGateway: '',
        value_dhcpEthernetDns: '',

        value_staticEthernetIp: '',
        value_staticEthernetMask: '',
        value_staticEthernetGateway: '',
        value_staticEthernetDns: '',

        deviceProfile: {},
      };
    },
    computed: {},
    mounted() {
      this.deviceProfile = JSON.parse(localStorage.getItem('deviceProfile'));
    },
    created() {
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

      this.fetchWifiInfo((error) => {
        if (error) {
          if (this.obj_loading) this.obj_loading.hide();
          this.$fire({
            text: this.$t('NetworkLoss'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        } else {
          this.fetchEthernetWifiInfo((err) => {
            if (err) {
              this.$fire({
                text: this.$t('NetworkLoss'),
                type: 'error',
                timer: 3000,
                confirmButtonColor: '#20a8d8',
              });
            }
            if (this.obj_loading) this.obj_loading.hide();
          });
        }
      });

      if (this.obj_loading) this.obj_loading.hide();

      this.refreshAvailableWifiSsidList(() => { });
    },
    watch: {},
    methods: {
      viewPassword() {
        this.flag_view_password = !this.flag_view_password;
      },
      selWifiSsid(e) {
        this.value_avaiableWifiSsidDataList.forEach((d) => {
          if (d.label === e.target.value) {
            this.value_selectedWifiSsid = e.target.value;
            this.flag_wifiNeedPassword = d.secured;
            this.value_wifiCapabilities = d.capabilities;
            this.value_wifiPassword = '';
          }
        });
      },
      selEthernetMode(e) {
        if (e.target.value === 'DHCP') {
          this.flag_ethernetModeIsDhcp = true;
          this.value_selectedEthernetMode = 'DHCP';
        } else {
          this.flag_ethernetModeIsDhcp = false;
          this.value_selectedEthernetMode = 'STATIC';

          if (this.value_staticEthernetIp === '') this.value_staticEthernetIp = this.value_dhcpEthernetIp;
          if (this.value_staticEthernetMask === '') this.value_staticEthernetMask = this.value_dhcpEthernetMask;
          if (this.value_staticEthernetGateway === '') this.value_staticEthernetGateway = this.value_dhcpEthernetGateway;
          if (this.value_staticEthernetDns === '') this.value_staticEthernetDns = this.value_dhcpEthernetDns;
        }
      },
      refreshAvailableWifiSsidList(cb) {
        this.flag_refreshingWifiList = true;
        this.$globalFetchWifiList((error, list) => {
          if (!error && list) {
            this.value_avaiableWifiSsidList = [];
            this.value_avaiableWifiSsidDataList = [];
            this.value_selectedWifiSsid = '';
            this.value_wifiPassword = '';
            this.value_wifiCapabilities = '';
            this.flag_wifiNeedPassword = false;
            list.forEach((wifi) => {
              if (wifi.ssid !== this.value_wifiActiveSsid) {
                if (this.value_selectedWifiSsid === '') {
                  this.value_selectedWifiSsid = wifi.ssid;
                  this.flag_wifiNeedPassword = wifi.secured;
                  this.value_wifiCapabilities = wifi.capabilities;
                  this.value_wifiPassword = '';
                }
                this.value_avaiableWifiSsidList.push(wifi.ssid);
                this.value_avaiableWifiSsidDataList.push({
                  label: wifi.ssid,
                  secured: wifi.secured,
                  capabilities: wifi.capabilities,
                });
              }
            });
          }
          this.flag_refreshingWifiList = false;
          if (cb) cb(error);
        });
      },
      fetchWifiInfo(cb) {
        this.$globalFetchWifiInfo((error, info) => {
          if (!error && info) {
            this.value_wifiActivate = info.enable;
            this.value_wifiConnected = info.linked;
            if (this.value_wifiConnected) {
              this.value_wifiActiveSsid = info.ssid;
              this.value_wifiActiveIpaddress = info.ip_address;
            } else {
              this.value_wifiActiveSsid = '';
              this.value_wifiActiveIpaddress = '';
            }
            this.flag_connectionOk = true;
          } else this.flag_connectionOk = false;
          if (cb) cb(error);
        });
      },
      fetchEthernetWifiInfo(cb) {
        this.$globalFetchEthernetInfo((error, info) => {
          if (!error && info) {
            this.value_ethernetActivate = info.enable;
            this.value_ethernetConnected = info.linked;
            this.value_lanActiveIpaddress = info.ip_address;
            this.flag_ethernetModeIsDhcp = info.is_dhcp;
            if (this.flag_ethernetModeIsDhcp) {
              this.value_selectedEthernetMode = 'DHCP';
              this.value_dhcpEthernetIp = info.ip_address;
              this.value_dhcpEthernetMask = info.mask;
              this.value_dhcpEthernetGateway = info.gateway;
              this.value_dhcpEthernetDns = info.dns;
            } else {
              this.value_selectedEthernetMode = 'STATIC';
              this.value_staticEthernetIp = info.ip_address;
              this.value_staticEthernetMask = info.mask;
              this.value_staticEthernetGateway = info.gateway;
              this.value_staticEthernetDns = info.dns;
            }
            this.flag_connectionOk = true;
          } else this.flag_connectionOk = false;
          if (cb) cb(error);
        });
      },
      clickOnChangeEthernet() {
        this
          .$confirm('', this.$t('ConfirmToChangeNetwork'), {
            confirmButtonText: this.$t('Confirm'),
            cancelButtonText: this.$t('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          })
          .then(() => {
            this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
            this.$globalChangeEthernet(
              {
                dhcp: this.flag_ethernetModeIsDhcp,
                ip_address: this.value_staticEthernetIp,
                mask: this.value_staticEthernetMask,
                gateway: this.value_staticEthernetGateway,
                dns: this.value_staticEthernetDns,
              },
              () => {
                if (this.obj_loading) this.obj_loading.hide();
                this.$globalLogout();
              },
            );
          })
          .catch(() => { });
      },
      clickOnChangeWifi() {
        this
          .$confirm('', this.$t('ConfirmToChangeNetwork'), {
            confirmButtonText: this.$t('Confirm'),
            cancelButtonText: this.$t('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          })
          .then(() => {
            this.flag_refreshingWifiList = true;

            this.$globalChangeWifi(
              {
                ssid: this.value_selectedWifiSsid,
                pass: this.value_wifiPassword,
                capabilities: this.value_wifiCapabilities,
              },
              (error, data) => {
                this.flag_refreshingWifiList = false;

                if (error == null) {
                  if (data.message === 'ok') {
                    this.$fire({
                      text: this.$t('Successful'),
                      type: 'success',
                      timer: 30000,
                    });

                    this.flag_refreshingWifiList = false;

                    this.fetchWifiInfo();
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
              },
            );
          })
          .catch(() => { });
      },
    },
  };
</script>