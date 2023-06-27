<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ disp_header }}
      </div>

      <CCard>
        <CCardBody>
          <CCol sm="12">
            <CRow class="my-4 justify-content-center">
              <CButton
                class="btn btn-primary btn-w-md fz-xl mx-4 mb-4"
                @click="clickOnRelay1"
                :disabled="flag_applying"
              >
                {{ disp_relay1 }}
              </CButton>

              <CButton
                v-if="deviceType !== deviceTypes.TYPE_AIRA_TABLET_M"
                class="btn btn-primary btn-w-md fz-xl mx-4 mb-4"
                @click="clickOnRelay2"
                :disabled="flag_applying"
              >
                {{ disp_relay2 }}
              </CButton>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { deviceTypes } from "../../globalParams.js";
import i18n from "../../i18n";
export default {
  name: "RemoteTrigger",

  data() {
    return {
      param_cardStyle: "height: 9rem;",
      disp_header: i18n.formatter.format("RemoteTrigger"),
      disp_relay1: i18n.formatter.format("Relay1"),
      disp_relay2: i18n.formatter.format("Relay2"),
      flag_applying: false,
      deviceTypes: {},
    };
  },
  mounted() {
    this.deviceTypes = deviceTypes;
  },
  computed: {
    ...mapState(["deviceType"]),
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {},
  methods: {
    clickOnRelay1() {
      const self = this;
      self.$globalTriggerRelay1((error, data) => {
        if (data && data.message === "ok") {
          self.$fire({
            text: i18n.formatter.format("ok"),
            type: "success",
            timer: 2000,
          });
        } else {
          self.$fire({
            text: i18n.formatter.format("Failed"),
            type: "error",
            timer: 2000,
            confirmButtonColor: "#20a8d8",
          });
        }
      });
    },
    clickOnRelay2() {
      const self = this;
      self.$globalTriggerRelay2((error, data) => {
        if (data && data.message === "ok") {
          self.$fire({
            text: i18n.formatter.format("ok"),
            type: "success",
            timer: 2000,
          });
        } else {
          self.$fire({
            text: i18n.formatter.format("Failed"),
            type: "error",
            timer: 2000,
            confirmButtonColor: "#20a8d8",
          });
        }
      });
    },
  },
};
</script>
