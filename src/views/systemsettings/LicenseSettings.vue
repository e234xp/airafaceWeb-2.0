<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1">
          {{ $t('LicenseManagement') }}
        </div>
        <div style="height:10px;" />
      </CCol>
    </CRow>

    <CRow>
      <CCol sm="12">
        <CCard style="height:12rem;">
          <CCardHeader>
            <div class="h3">
              {{ $t('TitleActivateLicense') }}
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <!-- FIXME: no i18n-->
              <!-- <CCol sm="5">
                <div class="h5">{{$t('MAC')}}</div>
                <CSelect size="lg" :value.sync="value_networkMac" :options="value_avaiableNetworkListToShow"
                  @change="selNetwork($event)" />

              </CCol> -->
              <CCol sm="8">
                <div class="h5">
                  {{ $t('LicenseKey') }}
                </div>
                <CInput
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="$t('NoEmptyNoSpaceNoSpecial')"
                  value=""
                  v-model="value_licenseKey"
                  placeholder=""
                  :is-valid="isValidLicenseKey"
                  required
                />
              </CCol>
              <CCol sm="2">
                <div class="h5">
&nbsp;
                </div>
                <CButton
                  style="width: 200px; background-color:#20a8d8;color: white;"
                  :disabled="!flag_licenseKeyPass"
                  @click="clickOnApplyLicense"
                >
                  <div style="font-size:20px">
                    {{ $t('BtnActivate') }}
                  </div>
                </CButton>
              </CCol>
              <CCol sm="2">
                <div class="h5">
&nbsp;
                </div>
                <CButton
                  style="width: 200px; background-color:#20a8d8;color: white;"
                  @click="clickOnActiveTrialLicense"
                  :disabled="!flag_defaultLicense && false"
                >
                  <div style="font-size:20px">
                    {{ $t('BtnTrial') }}
                  </div>
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="12">
        <CCard>
          <CCardHeader>
            <div class="h3">
              {{ $t('TitleLicenses') }}
            </div>
          </CCardHeader>
          <CCardBody>
            <div>
              <vxe-table
                :data="value_dataItemsToShow"
                height="398"
                columns-height="100"
                stripe
                align="center"
                :cell-style="cellStyle"
                :header-cell-style="headerCellStyle"
                ref="mainTable"
              >
                <vxe-table-column
                  show-overflow
                  field="no"
                  :title="$t('Seq')"
                  min-width="100"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="license_key"
                  :title="$t('LicenseKey')"
                  min-width="380"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="trial_days"
                  :title="$t('TrialDays')"
                  min-width="120"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="local_end_time"
                  :title="$t('ExpireDays')"
                  min-width="250"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="face_db_size"
                  :title="$t('FaceDBSize')"
                  min-width="160"
                  align="left"
                />
                <vxe-table-column
                  show-overflow
                  field="channel_amount"
                  :title="$t('Amounts')"
                  min-width="100"
                  align="left"
                />
              </vxe-table>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
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
    // this.$globalFetchEthernetList((error, result) => {
    //   if (!error && result) {
    //     let l = [];
    //     result.forEach((inter) => {
    //       l.push({ value: inter.ether, label: inter.interface + ' (' + inter.ether + ')' });

    //       if (this.value_networkMac == '')
    //         this.value_networkMac = inter.ether;
    //     });
    //     this.value_avaiableNetworkListToShow = l;
    //   }
    // });

    this.refreshTableItems();
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
      const filteredItems = sourceData;

      this.value_tablePage.totalResult = filteredItems.length;
      const sliceList = filteredItems.slice(
        (this.value_tablePage.currentPage - 1) * this.value_tablePage.pageSize, this.value_tablePage.currentPage * this.value_tablePage.pageSize,
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
      this.$globalGetLicenseList((error, result) => {
        if (result) {
          this.value_allTableItems = result.data_list;

          if (result.trial_avaiable_for_active) {
            this.flag_defaultLicense = true;
          } else {
            let no = 1;

            let availableLicenseAmount = 0;
            localStorage.setItem('availableLicenseAmount', availableLicenseAmount);
            console.log('refreshTableItems 1', 'availableLicenseAmount', availableLicenseAmount);

            this.value_allTableItems.forEach((item) => {
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

            this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems, this.value_searchingFilter);
          }
        }
      });
    },

    isValidLicenseKey(val) {
      this.flag_licenseKeyPass = false;
      if (val.replace(/\s/g, '').length >= 1) {
        this.flag_licenseKeyPass = true;
      }

      return this.flag_licenseKeyPass;
    },

    async clickOnApplyLicense() {
      const dataApply = {
        license_server_address: 'license.aira.com.tw',
        license_server_port: 5168,
        license_key: this.value_licenseKey,
        // mac_address: this.value_networkMac,
      };

      this.$globalCreateLicense(dataApply, (err) => {
        if (err) {
          this.$fire({
            text: this.$t('Failed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
        this.refreshTableItems();
      });
    },

    async clickOnActiveTrialLicense() {
      this.$confirm('', this.$t('ConfirmToProcess'), {
        confirmButtonText: this.$t('Confirm'),
        cancelButtonText: this.$t('Cancel'),
        confirmButtonColor: '#20a8d8',
        cancelButtonColor: '#f86c6b',
      }).then(() => {
        this.$globalDefaultLicense({}, (err) => {
          if (err) {
            this.$fire({
              text: this.$t('Failed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
          this.refreshTableItems();
        });
      }).catch(() => {
        // if (cb) cb(false);
      });
    },
  },
};
</script>
