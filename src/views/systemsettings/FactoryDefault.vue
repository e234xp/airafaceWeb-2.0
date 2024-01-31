<template>
  <div>
    <div class="h1">
      {{ $t('FactoryDefault') }}
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
              <div style="font-size: 20px">
                {{ $t('FactoryDefault') }}
              </div>
            </CButton>
            <CButton
              class="btn btn-primary btn-w-md mx-5 my-2"
              @click="clickOnReboot"
              :disabled="flag_applying"
            >
              <div style="font-size: 20px">
                {{ $t('Reboot') }}
              </div>
            </CButton>
          </CRow>
        </CCol>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  name: 'FactoryDefault',

  data() {
    return {
      param_cardStyle: 'height: 9rem;',

      flag_applying: false,
    };
  },
  methods: {
    clickOnReboot() {
      this.flag_applying = true;
      this
        .$confirm('', this.$t('ConfirmToReboot'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        })
        .then(() => {
          this.$globalRestartDevice((error, data) => {
            if (error === null) {
              if (data.message === 'ok') {
                this.$fire({
                  text: this.$t('CompleteAndRestart'),
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
        })
        .catch(() => {
          this.flag_applying = false;
        });
    },
    clickOnExcecute() {
      this.flag_applying = true;
      this
        .$confirm('', this.$t('ConfirmToFactoryDefault'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        })
        .then(() => {
          this.$globalFactoryDefault((error, data) => {
            if (error === null) {
              if (data.message === 'ok') {
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
        })
        .catch(() => {
          this.flag_applying = false;
        });
    },
  },
};
</script>
