<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1">{{ disp_header }}</div>
        <div style="height:10px;"></div>
      </CCol>
    </CRow>

    <CRow>
      <CCol sm="12">
        <CCard style="height:12rem;">
          <CCardHeader>
            <div class="h3">{{disp_titleActivateLicense}}</div>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <!-- <CCol sm="5">
                <div class="h5">{{disp_networkMac}}</div>
                <CSelect size="lg" :value.sync="value_networkMac" :options="value_avaiableNetworkListToShow"
                  @change="selNetwork($event)" />

              </CCol> -->
              <CCol sm="8">
                <div class="h5">{{disp_licenseKey}}</div>
                <CInput size="lg" valid-feedback="ok" :invalid-feedback="disp_noEmptyNoSpaceNoSpecial" value=""
                  v-model="value_licenseKey" placeholder="" :is-valid="isValidLicenseKey" required />
              </CCol>
              <CCol sm="2">
                <div class="h5">&nbsp;</div>
                <CButton style="width: 200px; background-color:#20a8d8;color: white;" :disabled="!flag_licenseKeyPass"
                  @click="clickOnApplyLicense">
                  <div style="font-size:20px">{{disp_apply}}</div>
                </CButton>
              </CCol>
              <CCol sm="2">
                <div class="h5">&nbsp;</div>
                <CButton style="width: 200px; background-color:#20a8d8;color: white;" @click="clickOnActiveTrialLicense"
                  :disabled="!flag_defaultLicense">
                  <div style="font-size:20px">{{disp_trial}}</div>
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="12">
        <CCard>
          <CCardHeader>
            <div class="h3">{{disp_titleLicenses}}</div>
          </CCardHeader>
          <CCardBody>
            <div>
              <vxe-table :data="value_dataItemsToShow" height="398" columns-height="100" stripe align="center"
                :cell-style="cellStyle" :header-cell-style="headerCellStyle" ref="mainTable">
                <vxe-table-column show-overflow field="no" :title="disp_seq" min-width="100" align="left">
                </vxe-table-column>
                <vxe-table-column show-overflow field="license_key" :title="disp_licenseKey" min-width="380"
                  align="left">
                </vxe-table-column>
                <vxe-table-column show-overflow field="trial_days" :title="disp_trial_days" min-width="120"
                  align="left">
                </vxe-table-column>
                <vxe-table-column show-overflow field="local_end_time" :title="disp_expire_days" min-width="250"
                  align="left"></vxe-table-column>
                <vxe-table-column show-overflow field="face_db_size" :title="disp_mac" min-width="160" align="left">
                </vxe-table-column>
                <vxe-table-column show-overflow field="channel_amount" :title="disp_channel_amount" min-width="100"
                  align="left"></vxe-table-column>
              </vxe-table>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from '@/i18n';

  export default {
    name: 'LicenseSettings',

    data() {
      return {
        obj_loading: null,
        value_tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0,
        },
        param_cardStyle: 'height: 26rem;',
        disp_header: i18n.formatter.format('LicenseManagement'),

        disp_titleActivateLicense: i18n.formatter.format('TitleActivateLicense'),
        disp_titleLicenses: i18n.formatter.format('TitleLicenses'),
        disp_networkMac: i18n.formatter.format('MAC'),
        disp_licenseKey: i18n.formatter.format('LicenseKey'),
        disp_apply: i18n.formatter.format('BtnActivate'),
        disp_trial: i18n.formatter.format('BtnTrial'),
        disp_noEmptyNoSpaceNoSpecial: i18n.formatter.format('NoEmptyNoSpaceNoSpecial'),

        disp_seq: i18n.formatter.format('Seq'),
        // disp_mac: i18n.formatter.format('MAC'),
        disp_mac: i18n.formatter.format('FaceDBSize'),
        disp_trial_days: i18n.formatter.format('TrialDays'),
        disp_expire_days: i18n.formatter.format('ExpireDays'),
        disp_channel_amount: i18n.formatter.format('Amounts'),

        // value_networkMac: '',
        value_licenseKey: '',
        flag_licenseKeyPass: false,
        flag_defaultLicense: false,

        value_avaiableNetworkListToShow: [],
        value_dataItemsToShow: [],
        value_allTableItems: [],
      };
    },
    created() { },
    mounted() {
      const self = this;

      // self.$globalFetchEthernetList((error, result) => {
      //   if (!error && result) {
      //     let l = [];
      //     result.forEach((inter) => {
      //       l.push({ value: inter.ether, label: inter.interface + ' (' + inter.ether + ')' });

      //       if (self.value_networkMac == '')
      //         self.value_networkMac = inter.ether;
      //     });
      //     self.value_avaiableNetworkListToShow = l;
      //   }
      // });

      self.refreshTableItems();
    },
    watch: {},
    methods: {
      // sleep(ms = 0) {
      //   return new Promise(r => setTimeout(r, ms));
      // },

      headerCellStyle() {
        return 'fontSize: 18px';
      },
      cellStyle() {
        return 'fontSize:18px;overflow:hidden;white-space:nowrap;text-overflow: ellipsis;';
      },

      selNetwork(e) {
        this.value_networkMac = e.target.value;
      },

      generateFilteredData(sourceData) {
        const self = this;
        const filteredItems = sourceData;

        self.value_tablePage.totalResult = filteredItems.length;
        const sliceList = filteredItems.slice(
          (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize, self.value_tablePage.currentPage * self.value_tablePage.pageSize,
        );

        sliceList.forEach((item) => {
          const localItem = item;

          let trialEndTime = localItem.trial_end_time;
          if (trialEndTime) {
            const isoDatetime = new Date(trialEndTime);
            trialEndTime = [
              `${isoDatetime.getFullYear()}-`,
              `${(isoDatetime.getMonth() + 1).toString().padStart(2, '0')}-`,
              `${(isoDatetime.getDate()).toString().padStart(2, '0')} `,
              `${(isoDatetime.getHours()).toString().padStart(2, '0')}:`,
              `${(isoDatetime.getMinutes()).toString().padStart(2, '0')}:`,
              `${(isoDatetime.getSeconds()).toString().padStart(2, '0')}`,
            ].join('');

            localItem.local_end_time = trialEndTime;
          }

          localItem.face_db_size = 0;
          if (localItem.default_face_db_size) localItem.face_db_size += localItem.default_face_db_size;
          if (localItem.addon_face_db_size) localItem.face_db_size += localItem.addon_face_db_size;
        });

        return Object.assign([], sliceList);
      },

      refreshTableItems() {
        const self = this;

        self.$globalGetLicenseList((error, result) => {
          if (result) {
            self.value_allTableItems = result.data_list;

            if (result.trial_avaiable_for_active) {
              self.flag_defaultLicense = true;
            } else {
              let no = 1;

              let availableLicenseAmount = 0;
              localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
              console.log('refreshTableItems 1', 'availableLicenseAmount', availableLicenseAmount);

              self.value_allTableItems.forEach((item) => {
                const localItem = item;

                localItem.no = no;
                no += 1;

                if (item.trial_days >= 0) {
                  if (item.trial_end_time > new Date()) {
                    availableLicenseAmount += +item.channel_amount;
                    localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
                    console.log('refreshTableItems 2', availableLicenseAmount);
                  }
                } else {
                  availableLicenseAmount += +item.channel_amount;
                  localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
                  console.log('refreshTableItems 3', availableLicenseAmount);
                }

                return localItem;
              });

              self.value_dataItemsToShow = self.generateFilteredData(self.value_allTableItems, self.value_searchingFilter);
            }
          }
        });
      },

      isValidLicenseKey(val) {
        const self = this;

        self.flag_licenseKeyPass = false;
        if (val.replace(/\s/g, '').length >= 1) {
          self.flag_licenseKeyPass = true;
        }

        return self.flag_licenseKeyPass;
      },

      async clickOnApplyLicense() {
        const self = this;

        const dataApply = {
          license_server_address: 'license.aira.com.tw',
          license_server_port: 5168,
          license_key: self.value_licenseKey,
          // mac_address: self.value_networkMac,
        };

        self.$globalCreateLicense(dataApply, (err) => {
          if (err) {
            self.$fire({
              text: i18n.formatter.format('Failed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          self.refreshTableItems();
        });
      },

      async clickOnActiveTrialLicense() {
        const self = this;

        self.$globalDefaultLicense({}, (err) => {
          if (err) {
            self.$fire({
              text: i18n.formatter.format('Failed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          self.refreshTableItems();
        });
      },
    },
  };
</script>