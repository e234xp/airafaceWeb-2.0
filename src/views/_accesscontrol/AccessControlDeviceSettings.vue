<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">{{ disp_header }}</div>
      <!-- 繼電器 1 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_relayOneSettings }} </span>
          </div>
        </CCardHeader>

        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 col-4 table-th">
                {{ disp_startSignal }}
              </th>
              <th class="h5 col-4 table-th">{{ disp_durationForHoldingStartSignal }}</th>
              <th class="h5 col-4 table-th">{{ disp_endSignal }}</th>
              <!-- <th class="h5 w-25 table-th">{{ disp_enableIdCardPassMode }}</th> -->
            </tr>
            <tr>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_relayOneStartSignal" :options="value_signalList"
                  @change="selRelayOneStartSignal($event)" :disabled="
                    !flag_support_custom_start_end_sign ||
                    deviceType == deviceTypes.TYPE_AIRA_TABLET_M
                  " />
              </td>
              <td class="table-td">
                <CInput class="mb-form-row" size="lg" v-model="value_durationForHoldingRelayOneStartSignal"
                  :is-valid="isRelayOneHoldingTimeNumber" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_relayOneEndSignal" :options="value_signalList"
                  @change="selRelayOneEndSignal($event)" :disabled="
                    !flag_support_custom_start_end_sign ||
                    deviceType == deviceTypes.TYPE_AIRA_TABLET_M
                  " />
              </td>
              <!-- <td class="table-td">
                <CSelect size="lg" :value.sync="value_enableIdCardPassModeOnRelay1"
                  :options="value_enableDisableListToShow" @change="selEnableIdCardBypassMode1($event)" />
              </td> -->
            </tr>

            <tr>
              <!-- <td class="table-td"></td> -->
              <td class="table-td col-3"></td>
              <td class="table-td col-3"></td>
              <td class="table-td">
                <CButton class="btn btn-primary w-100" @click="clickOnApplyRelayOneSettings"
                  :disabled="flag_changingRelayOneSettings || !flag_relayOneSettingsOk">
                  <div style="font-size: 20px">{{ disp_apply }}</div>
                </CButton>
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <!-- 繼電器 2 -->
      <CCard v-if="deviceType !== deviceTypes.TYPE_AIRA_TABLET_M">
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_relayTwoSettings }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-25 table-th">{{ disp_startSignal }}</th>
              <th class="h5 w-25 table-th">{{ disp_durationForHoldingStartSignal }}</th>
              <th class="h5 w-25 table-th">{{ disp_endSignal }}</th>
              <th class="h5 w-25 table-th">{{ disp_enableIdCardPassMode }}</th>
            </tr>
            <tr>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_relayTwoStartSignal" :options="value_signalList"
                  @change="selRelayTwoStartSignal($event)" :disabled="!flag_support_custom_start_end_sign" />
              </td>
              <td class="table-td">
                <CInput class="mb-form-row" size="lg" v-model="value_durationForHoldingRelayTwoStartSignal"
                  :is-valid="isRelayTwoHoldingTimeNumber" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_relayTwoEndSignal" :options="value_signalList"
                  @change="selRelayTwoEndSignal($event)" :disabled="!flag_support_custom_start_end_sign" />
              </td>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_enableIdCardPassModeOnRelay2"
                  :options="value_enableDisableListToShow" @change="selEnableIdCardBypassMode2($event)" />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <!-- 韋根 -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_wiegandSettings }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 col-4 table-th">{{ disp_wiegandFormat }}</th>
              <th class="h5 col-4 table-th">
                <div v-if="value_enableStranger" class="h5">
                  {{ disp_enableStranger }}
                </div>
                <div v-else class="h5">{{ disp_disableStranger }}</div>
              </th>
              <th class="h5 col-4 table-th">{{ disp_strangerID }}</th>
              <!-- <th class="h5 w-25 table-th">{{ disp_enableIdCardPassMode }}</th> -->
            </tr>
            <tr>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_wiegandBits" :options="value_wiegandBitslList"
                  @change="selWiegandBits($event)" />
              </td>
              <td class="table-td">
                <CSwitch size="lg" class="ml-2 mb-16" color="success" shape="pill"
                  @update:checked="value_enableStranger = !value_enableStranger" :checked="value_enableStranger">
                </CSwitch>
              </td>
              <td class="table-td">
                <CInput class="mb-form-row input-no-spin" size="lg" v-model="value_strangerCardId" required
                  :disabled="!value_enableStranger"
                  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                  maxLength="20" type="number" />
              </td>
              <!-- <td class="table-td">
                <CSelect size="lg" :value.sync="value_enableIdCardPassModeOnWiegand"
                  :options="value_enableDisableListToShow" @change="selEnableIdCardBypassModeWiegand($event)" />
              </td> -->
            </tr>
            <tr>
              <!-- <td class="table-td"></td> -->
              <td class="table-td col-3"></td>
              <td class="table-td col-3"></td>
              <td class="table-td">
                <CButton class="btn btn-primary w-100" @click="clickOnApplyWiegand"
                  :disabled="flag_changingWiegandSettings">
                  <div style="font-size: 20px">{{ disp_apply }}</div>
                </CButton>
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <!-- 韋根 Box -->
      <CCard>
        <CCardHeader>
          <div>
            <span class="h3">{{ disp_wiegandBoxSettings }}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 col-4 table-th">{{ disp_wiegandFormat }}</th>
              <th class="h5 col-4 table-th">
                <div v-if="value_enableBoxStranger" class="h5">
                  {{ disp_enableStranger }}
                </div>
                <div v-else class="h5">{{ disp_disableStranger }}</div>
              </th>
              <th class="h5 col-4 table-th">{{ disp_strangerID }}</th>
            </tr>
            <tr>
              <td class="table-td">
                <CSelect size="lg" :value.sync="value_wiegandBoxBits" :options="value_wiegandBoxBitslList"
                  @change="selWiegandBoxBits($event)" />
              </td>
              <td class="table-td">
                <CSwitch size="lg" class="ml-3 mb-16" color="success" shape="pill"
                  @update:checked="value_enableBoxStranger = !value_enableBoxStranger"
                  :checked="value_enableBoxStranger">
                </CSwitch>
              </td>
              <td class="table-td">
                <CInput class="mb-form-row" size="lg" v-model="value_wiegandBoxStrangerCardId" required
                  :disabled="!value_enableBoxStranger"
                  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                  maxLength="20" type="number" />
              </td>
            </tr>
            <tr>
              <td class="table-td col-3"></td>
              <td class="table-td col-3"></td>
              <td class="table-td">
                <CButton class="btn btn-primary w-100" @click="clickOnApplyWiegand"
                  :disabled="flag_changingWieganBoxdSettings">
                  <div style="font-size: 20px">{{ disp_apply }}</div>
                </CButton>
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>


    </CCol>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import { deviceTypes } from "../../globalParams.js";
  import i18n from "@/i18n";
  export default {
    name: "AccessControlDeviceSettings",

    data() {
      return {
        param_cardStyle: "height: 26rem;",
        disp_header: i18n.formatter.format("AccessControlDeviceSettings"),
        disp_relayOneSettings: i18n.formatter.format("Relay1"),
        disp_relayTwoSettings: i18n.formatter.format("Relay2"),
        disp_wiegandSettings: i18n.formatter.format("Wiegand"),
        disp_apply: i18n.formatter.format("Apply"),
        disp_startSignal: i18n.formatter.format("StartSignal"),
        disp_endSignal: i18n.formatter.format("EndSignal"),
        disp_durationForHoldingStartSignal: i18n.formatter.format("HoldingTime"),
        disp_wiegandFormat: i18n.formatter.format("WiegandFormat"),
        disp_enableStranger: i18n.formatter.format("EnableStranger"),
        disp_disableStranger: i18n.formatter.format("DisableStranger"),

        disp_strangerID: i18n.formatter.format("StrangerID"),
        disp_enableIdCardPassMode: i18n.formatter.format("EnableIdCardPassMode"),

        disp_wiegandBoxSettings: i18n.formatter.format("WiegandBox"),

        value_enableIdCardPassModeOnRelay1: false,
        value_enableIdCardPassModeOnRelay2: false,
        value_enableIdCardPassModeOnWiegand: false,
        value_enableDisableListToShow: [
          { value: true, label: i18n.formatter.format("Yes") },
          { value: false, label: i18n.formatter.format("No") },
        ],

        /// relay 1
        value_relayOneStartSignal: 0,
        value_relayOneEndSignal: 1,
        value_durationForHoldingRelayOneStartSignal: 3000,
        /// relay 2
        value_relayTwoStartSignal: 0,
        value_relayTwoEndSignal: 1,
        value_durationForHoldingRelayTwoStartSignal: 3000,

        value_signalList: [
          { value: 0, label: "0" },
          { value: 1, label: "1" },
        ],

        value_wiegandBits: 26,
        flag_changingRelayOneSettings: false,
        flag_changingRelayTwoSettings: false,
        flag_relayOneSettingsOk: true,
        flag_relayTwoSettingsOk: true,
        flag_changingWiegandSettings: false,

        value_wiegandBitslList: [
          { value: 26, label: "26 bits" },
          { value: 34, label: "34 bits" },
          { value: 64, label: "64 bits" },
        ],
        value_tabletSettings: null,
        value_enableStranger: false,
        value_strangerCardId: "",

        flag_changingWieganBoxdSettings: false,
        value_wiegandBoxBitslList: [
          { value: 64, label: "Felica (64 bits)" }
        ],
        value_wiegandBoxBits: 64,
        value_wiegandBoxStrangerCardId: "",
        value_enableBoxStranger: false,

        flag_support_custom_start_end_sign: false,
        deviceTypes: {},
      };
    },
    mounted() {
      const self = this;
      self.$globalGetSystemInfo(function (err, data) {
        if (data != null) {
          if (data.device_type == "airaTablet_xs") {
            self.flag_support_custom_start_end_sign = false;
          } else self.flag_support_custom_start_end_sign = true;
        }
      });
      this.deviceTypes = deviceTypes;
    },
    computed: {
      ...mapState(["deviceType"]),
    },
    created() {
      const self = this;

      self.$globalGetTabletSetting(function (err, data) {
        if (!err) {
          self.value_tabletSettings = data;
          //relay1
          if (self.value_tabletSettings.id_card_pass_mode_on_relay_1 == null)
            self.value_tabletSettings["id_card_pass_mode_on_relay_1"] = false;
          self.value_relayOneStartSignal = self.value_tabletSettings.relay_1_start_power;
          self.value_relayOneEndSignal = self.value_tabletSettings.relay_1_end_power;
          self.value_durationForHoldingRelayOneStartSignal =
            self.value_tabletSettings.relay_1_delay;
          self.value_enableIdCardPassModeOnRelay1 =
            self.value_tabletSettings.id_card_pass_mode_on_relay_1;

          //relay2
          if (self.value_tabletSettings.id_card_pass_mode_on_relay_2 == null)
            self.value_tabletSettings["id_card_pass_mode_on_relay_2"] = false;
          self.value_relayTwoStartSignal = self.value_tabletSettings.relay_2_start_power;
          self.value_relayTwoEndSignal = self.value_tabletSettings.relay_2_end_power;
          self.value_durationForHoldingRelayTwoStartSignal =
            self.value_tabletSettings.relay_2_delay;
          self.value_enableIdCardPassModeOnRelay2 =
            self.value_tabletSettings.id_card_pass_mode_on_relay_2;

          //weigand
          if (self.value_tabletSettings.id_card_pass_mode_on_wiegand == null)
            self.value_tabletSettings["id_card_pass_mode_on_wiegand"] = false;
          self.value_wiegandBits = self.value_tabletSettings.support_wiegand_bits;
          self.value_enableStranger = self.value_tabletSettings.enable_stranger_card_id;
          self.value_strangerCardId = self.value_tabletSettings.stranger_card_id;
          self.value_enableIdCardPassModeOnWiegand = self.value_tabletSettings.id_card_pass_mode_on_wiegand;

          //weigand Box
          self.value_wiegandBoxBits = self.value_tabletSettings.wiegand_box_support_wiegand_bits;
          self.value_enableBoxStranger = self.value_tabletSettings.wiegand_box_enable_stranger_card_id;
          self.value_wiegandBoxStrangerCardId = self.value_tabletSettings.wiegand_box_stranger_card_id;
        }
      });
    },
    watch: {},
    methods: {
      sleep(ms = 0) {
        return new Promise((r) => setTimeout(r, ms));
      },
      selRelayOneStartSignal(e) {
        const self = this;
        self.value_relayOneStartSignal = e.target.value == "1" ? 1 : 0;
      },
      selRelayOneEndSignal(e) {
        const self = this;
        self.value_relayOneEndSignal = e.target.value == "1" ? 1 : 0;
      },
      selEnableIdCardBypassMode1(e) {
        const self = this;
        self.value_enableIdCardPassModeOnRelay1 = e.target.value == "true" ? true : false;
      },
      selRelayTwoStartSignal(e) {
        const self = this;
        self.value_relayTwoStartSignal = e.target.value == "1" ? 1 : 0;
      },
      selRelayTwoEndSignal(e) {
        const self = this;
        self.value_relayTwoEndSignal = e.target.value == "1" ? 1 : 0;
      },
      selEnableIdCardBypassMode2(e) {
        const self = this;
        self.value_enableIdCardPassModeOnRelay2 = e.target.value == "true" ? true : false;
      },
      selWiegandBits(e) {
        const self = this;
        self.value_wiegandBits = Number(e.target.value);
      },
      selEnableIdCardBypassWiegand(e) {
        const self = this;
        self.value_enableIdCardPassModeOnWiegand = e.target.value == "true" ? true : false;
      },
      isRelayOneHoldingTimeNumber(n) {
        const self = this;
        let ok = false;
        var numbers = /^[0-9]+$/;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        }
        self.flag_relayOneSettingsOk = ok;
        return ok;
      },
      isRelayTwoHoldingTimeNumber(n) {
        const self = this;
        let ok = false;
        var numbers = /^[0-9]+$/;
        if (numbers.test(n)) {
          ok = Number.isInteger(Number(n));
        }
        self.flag_relayTwoSettingsOk = ok;
        return ok;
      },
      async applyWiegand() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingWiegandSettings = true;

        if (
          self.value_tabletSettings.support_wiegand_bits != self.value_wiegandBits ||
          self.value_tabletSettings.stranger_card_id != self.value_strangerCardId ||
          self.value_tabletSettings.enable_stranger_card_id != self.value_enableStranger ||
          self.value_tabletSettings.id_card_pass_mode_on_wiegand != self.value_enableIdCardPassModeOnWiegand ||
          self.value_tabletSettings.wiegand_box_support_wiegand_bits != self.value_wiegandBoxBits ||
          self.value_tabletSettings.wiegand_box_stranger_card_id != self.value_wiegandBoxStrangerCardId ||
          self.value_tabletSettings.wiegand_box_enable_stranger_card_id != self.value_enableBoxStranger
        ) {
          self.value_tabletSettings.support_wiegand_bits = self.value_wiegandBits;
          self.value_tabletSettings.stranger_card_id = self.value_strangerCardId;
          self.value_tabletSettings.enable_stranger_card_id = self.value_enableStranger;
          self.value_tabletSettings.id_card_pass_mode_on_wiegand = self.value_enableIdCardPassModeOnWiegand;
          self.value_tabletSettings.wiegand_box_support_wiegand_bits = self.value_wiegandBoxBits;
          self.value_tabletSettings.wiegand_box_enable_stranger_card_id = self.value_enableBoxStranger;
          self.value_tabletSettings.wiegand_box_stranger_card_id = self.value_enableBoxStranger ? self.value_wiegandBoxStrangerCardId : "";



          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;
                self.value_wiegandBits = self.value_tabletSettings.support_wiegand_bits;
                self.value_strangerCardId = self.value_tabletSettings.stranger_card_id;
                self.value_enableStranger = self.value_tabletSettings.enable_stranger_card_id;
                self.value_enableIdCardPassModeOnWiegand = self.value_tabletSettings.id_card_pass_mode_on_wiegand;

                self.value_wiegandBoxBits = self.value_tabletSettings.wiegand_box_support_wiegand_bits;
                self.value_enableBoxStranger = self.value_tabletSettings.wiegand_box_enable_stranger_card_id;
                self.value_wiegandBoxStrangerCardId = self.value_tabletSettings.wiegand_box_stranger_card_id;

                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingWiegandSettings = false;
      },
      async applyRelayTwoSettings() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingRelayTwoSettings = true;

        if (
          self.value_tabletSettings.relay_2_start_power != self.value_relayTwoStartSignal ||
          self.value_tabletSettings.relay_2_end_power != self.value_relayTwoEndSignal ||
          self.value_tabletSettings.relay_2_delay !=
          self.value_durationForHoldingRelayTwoStartSignal ||
          self.value_tabletSettings.id_card_pass_mode_on_relay_2 !=
          self.value_enableIdCardPassModeOnRelay2
        ) {
          self.value_tabletSettings.relay_2_start_power = self.value_relayTwoStartSignal;
          self.value_tabletSettings.relay_2_end_power = self.value_relayTwoEndSignal;
          self.value_tabletSettings.relay_2_delay =
            self.value_durationForHoldingRelayTwoStartSignal;
          self.value_tabletSettings.id_card_pass_mode_on_relay_2 =
            self.value_enableIdCardPassModeOnRelay2;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;

                self.value_relayTwoStartSignal =
                  self.value_tabletSettings.relay_2_start_power;
                self.value_relayTwoEndSignal = self.value_tabletSettings.relay_2_end_power;
                self.value_durationForHoldingRelayTwoStartSignal =
                  self.value_tabletSettings.relay_2_delay;
                self.value_enableIdCardPassModeOnRelay2 =
                  self.value_tabletSettings.id_card_pass_mode_on_relay_2;

                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingRelayTwoSettings = false;
      },
      async applyRelayOneSettings() {
        const self = this;
        let dataChange = false;
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        self.flag_changingRelayOneSettings = true;

        if (
          self.value_tabletSettings.relay_1_start_power != self.value_relayOneStartSignal ||
          self.value_tabletSettings.relay_1_end_power != self.value_relayOneEndSignal ||
          self.value_tabletSettings.relay_1_delay !=
          self.value_durationForHoldingRelayOneStartSignal ||
          self.value_tabletSettings.id_card_pass_mode_on_relay_1 !=
          self.value_enableIdCardPassModeOnRelay1
        ) {
          self.value_tabletSettings.relay_1_start_power = self.value_relayOneStartSignal;
          self.value_tabletSettings.relay_1_end_power = self.value_relayOneEndSignal;
          self.value_tabletSettings.relay_1_delay =
            self.value_durationForHoldingRelayOneStartSignal;
          self.value_tabletSettings.id_card_pass_mode_on_relay_1 =
            self.value_enableIdCardPassModeOnRelay1;

          dataChange = true;
        }
        if (dataChange) {
          const applyRet = await self.$globalSetTabletSetting(self.value_tabletSettings);
          if (!applyRet.error) {
            let counterRetry = 0;
            let retry = true;
            let pass = false;
            while (retry) {
              const ret = await self.$globalGetTabletSetting();
              if (!ret.error && ret.data) {
                self.value_tabletSettings = ret.data;

                self.value_relayOneStartSignal =
                  self.value_tabletSettings.relay_1_start_power;
                self.value_relayOneEndSignal = self.value_tabletSettings.relay_1_end_power;
                self.value_durationForHoldingRelayOneStartSignal =
                  self.value_tabletSettings.relay_1_delay;
                self.value_enableIdCardPassModeOnRelay1 =
                  self.value_tabletSettings.id_card_pass_mode_on_relay_1;

                retry = false;
                pass = true;
              } else if (counterRetry++ < 10) await self.sleep(2000);
            }
            self.$fire({
              text: pass
                ? i18n.formatter.format("Successful")
                : i18n.formatter.format("OperationFailed"),
              type: pass ? "success" : "error",
              timer: 3000,
            });
          }
        }
        if (self.obj_loading) self.obj_loading.hide();
        self.flag_changingRelayOneSettings = false;
      },
      clickOnApplyRelayOneSettings() {
        this.applyRelayOneSettings();
      },
      clickOnApplyRelayTwoSettings() {
        this.applyRelayTwoSettings();
      },
      clickOnApplyWiegand() {
        const self = this;
        if ((self.value_enableStranger == true && self.value_strangerCardId == "") ||
          (self.value_enableBoxStranger == true && self.value_wiegandBoxStrangerCardId == "")) {
          self.$fire({
            text: i18n.formatter.format("CannotBeBlank"),
            type: "error",
            timer: 3000,
          });
          return;
        } else {
          this.applyWiegand();
        }
      },
    },
  };
</script>