<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ $t('UpgradeSoftware') }}
      </div>

      <CCard class="pt-3 mt-5">
        <CCardHeader>
          <span class="h3">
            {{ $t('UpgradeSoftware') }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ disp_versionInfo }}
          </span>

          <span
            v-if="value_selectedDbFile"
            class="ml-4"
          >{{ $t('FileName') }}</span>
          <span
            v-if="value_selectedDbFile"
            class="ml-1"
          >
            {{ value_fileName }}
          </span>
        </CCardHeader>
        <CCardBody class="px-5">
          <CRow class="align-items-center">
            <label
              v-if="!value_selectedDbFile"
              class="btn btn-primary fz-xl mb-0"
            >
              {{ $t('ChooseFile') }}
              <input
                ref="uploadFile"
                type="file"
                id="file"
                :multiple="false"
                accept=".airasoft"
                style="display: none"
                @change="onUploadFiles"
              >
            </label>
            <label
              v-else
              class="btn btn-danger fz-xl mb-0"
            >
              {{ $t('ChooseAnotherFile') }}
              <input
                ref="uploadFile"
                type="file"
                id="newfile"
                :multiple="false"
                accept=".airasoft"
                style="display: none"
                @change="onReUploadFiles"
              >
            </label>

            <CButton
              class="btn btn-primary fz-xl ml-5"
              @click="clickOnUpload"
              :disabled="flag_uploading || !value_selectedDbFile"
            >
              {{ $t('Upload') }}
            </CButton>

            <div
              v-if="flag_uploading"
              class="height: auto; pb-3"
            >
              <progress-bar
                :options="progressOptions"
                :value="value_uploadProgress"
                class="ml-5"
              />
            </div>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import ProgressBar from 'vuejs-progress-bar';
import Axios from 'axios';

// FIXME: I have no idea :<
// eslint-disable-next-line no-extend-native
Date.prototype.yyyy_mm_dd_HH_MM_SS = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();
  const HH = this.getHours();
  const MM = this.getMinutes();
  const SS = this.getSeconds();

  return [
    `${this.getFullYear()}_`,
    `${(mm > 9 ? '' : '0') + mm}_`,
    `${(dd > 9 ? '' : '0') + dd}_`,
    `${(HH > 9 ? '' : '0') + HH}_`,
    `${(MM > 9 ? '' : '0') + MM}_`,
    (SS > 9 ? '' : '0') + SS,
  ].join('');
};

export default {
  name: 'UpgradeSoftware',
  data() {
    return {
      progressOptions: {
        text: {
          color: '#000000',
          shadowEnable: false,
          shadowColor: '#000000',
          fontSize: 14,
          fontFamily: 'Helvetica',
          dynamicPosition: false,
          hideText: false,
        },
        progress: {
          color: '#2dbd2d',
          backgroundColor: '#C0C0C0',
        },
        layout: {
          height: 50,
          width: 50,
          verticalTextAlign: 35,
          horizontalTextAlign: 8,
          zeroOffset: 0,
          strokeWidth: 10,
          progressPadding: 0,
          type: 'circle',
        },
      },
      param_cardStyle: 'height: 9rem;',

      value_fileName: '',
      flag_uploading: false,
      value_uploadProgress: 0,
      value_selectedDbFile: null,
      disp_versionInfo: '',
    };
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {
    this.$globalGetSystemInfo(function (err, data) {
      if (data) {
        this.disp_versionInfo = `${this.$t('CurrentVersionNumber')} : ${data.fw_version} / ${global.webVersion}`;
      }
    });
  },
  components: {
    ProgressBar,
  },
  methods: {
    clickOnUpload() {
      this.$confirm(this.$t('ConfirmToProcess')).then(() => {
        this.value_uploadProgress = 0;
        this.flag_uploading = true;
        const formData = new FormData();
        formData.append('file', this.value_selectedDbFile);
        const client = Axios.create({ timeout: 600000 });
        client
          .post(this.$globalUpgradeSwPath(), formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              // 'Connection': 'Keep-Alive',
              token: this.$globalGetTokenString(),
            },
            onUploadProgress: (progressEvent) => {
              const total = parseFloat(progressEvent.total);
              const current = progressEvent.loaded;
              this.value_uploadProgress = Math.floor((current / total) * 100);

              if (this.value_uploadProgress > 99) {
                this.$globalLogout();
                this
                  .$fire({
                    text: this.$t('CompleteAndRestart'),
                    type: 'success',
                    showConfirmButton: false,
                    // timerProgressBar : true,
                    timer: 60000,
                    allowOutsideClick: () => { },
                  })
                  .then(() => {
                    // console.log("sss")
                  });
              }
            },
          })
          .then(() => {
            this.flag_uploading = false;
            // this.$fire({
            //   text: this.$t("Complete"),
            //   type: "success",
            //   timer: 3000
            // });
          })
          .catch(function () {
            this.flag_uploading = false;
            this.$fire({
              text: this.$t('LostConnection'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          });
      });
    },
    onUploadFiles() {
      this.value_selectedDbFile = null;
      this.$refs.uploadFile.files.forEach((file) => {
        // let filesArray = Object.keys(this.$refs.uploadFile.files).map((key) => [
        //   this.$refs.uploadFile.files[key],
        // ]);
        // filesArray.forEach((file) => {
        this.value_selectedDbFile = file;
      });
      const file = document.getElementById('file').files[0];
      this.value_fileName = file.name;
    },
    onReUploadFiles() {
      this.value_selectedDbFile = null;
      this.$refs.uploadFile.files.forEach((file) => {
        this.value_selectedDbFile = file;
      });
      const file = document.getElementById('newfile').files[0];
      this.value_fileName = file.name;
    },
  },
};
</script>
