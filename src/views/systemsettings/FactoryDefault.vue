<template>
  <div>
    <div class="h1">
      {{ disp_header }}
    </div>
    <CCard class="mt-5">
      <CCardBody class="py-5">
        <CCol sm="12">
          <CRow class="justify-content-center">
            <CButton
              class="btn btn-danger btn-w-md mr-5 my-2"
              @click="clickOnExcecute"
              :disabled="flag_applying"
            >
              <div style="font-size: 20px">{{ disp_excecute }}</div>
            </CButton>
            <CButton
              class="btn btn-primary btn-w-md mx-5 my-2"
              @click="clickOnReboot"
              :disabled="flag_applying"
            >
              <div style="font-size: 20px">{{ disp_reboot }}</div>
            </CButton>
          </CRow>
        </CCol>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import i18n from "../../i18n";
export default {
  name: "FactoryDefault",

  data() {
    return {
      param_cardStyle: "height: 9rem;",
      disp_header: i18n.formatter.format("FactoryDefault"),

      disp_excecute: i18n.formatter.format("FactoryDefault"),
      disp_reboot: i18n.formatter.format("Reboot"),
      flag_applying: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {},
  methods: {
    clickOnReboot() {
      const self = this;
      self.flag_applying = true;
      self
        .$confirm("", i18n.formatter.format("ConfirmToReboot"), "question", {
          confirmButtonText: i18n.formatter.format("Confirm"),
          cancelButtonText: i18n.formatter.format("Cancel"),
          confirmButtonColor: "#20a8d8",
          cancelButtonColor: "#f86c6b",
        })
        .then((v) => {
          self.$globalRestartDevice((error, data) => {
            if (error == null) {
              if (data.message == "ok") {
                self.$fire({
                  text: i18n.formatter.format("CompleteAndRestart"),
                  type: "success",
                  timer: 3000,
                });
              } else {
                self.$fire({
                  text: i18n.formatter.format("OperationFailed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            } else {
              self.$fire({
                text: i18n.formatter.format("OperationFailed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8",
              });
            }
            self.flag_applying = false;
          });
        })
        .catch((e) => {
          self.flag_applying = false;
        });
    },
    clickOnExcecute() {
      const self = this;
      self.flag_applying = true;
      self
        .$confirm("", i18n.formatter.format("ConfirmToFactoryDefault"), "question", {
          confirmButtonText: i18n.formatter.format("Confirm"),
          cancelButtonText: i18n.formatter.format("Cancel"),
          confirmButtonColor: "#20a8d8",
          cancelButtonColor: "#f86c6b",
        })
        .then((v) => {
          self.$globalFactoryDefault((error, data) => {
            if (error == null) {
              if (data.message == "ok") {
                self.$fire({
                  text: i18n.formatter.format("Successful"),
                  type: "success",
                  timer: 3000,
                });
              } else {
                self.$fire({
                  text: i18n.formatter.format("OperationFailed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            } else {
              self.$fire({
                text: i18n.formatter.format("OperationFailed"),
                type: "error",
                timer: 3000,
                confirmButtonColor: "#20a8d8",
              });
            }
            self.flag_applying = false;
          });
        })
        .catch((e) => {
          self.flag_applying = false;
        });
    },
  },
};
</script>
