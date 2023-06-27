<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ disp_header }}
      </div>

      <CCard>
        <CCardHeader>
          <td>
            <span class="h3">{{ disp_backupDatabase }}</span>
            <span class="h3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ disp_dbBackupInfo }}</span>
          </td>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <CRow>
              <CButton
                class="btn btn-primary btn-w-normal fz-lg"
                @click="clickOnGenerateBackup"
                :disabled="flag_generating || flag_downloading"
              >
                {{ disp_generateBackup }}
              </CButton>

              <CButton
                class="btn btn-primary btn-w-normal fz-lg ml-5"
                @click="clickOnDownload"
                :disabled="flag_downloading || !value_lastDbBackupTime"
              >
                {{ disp_download }}
              </CButton>

              <div v-if="flag_downloading">
                <progress-bar
                  :options="progressOptions"
                  :value="value_downloadProgress"
                  style="margin: -22px 20px; padding: 0"
                />
              </div>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader
          ><div class="d-flex align-items-center">
            <div class="h3">
              {{ disp_restoreDatabase }}
            </div>
            <div v-if="value_selectedDbFile">
              <span class="ml-4">{{ disp_fileName }}</span>
              <span class="ml-2">{{ value_fileName }}</span>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <CCol sm="12">
            <CRow>
              <label
                v-if="!value_selectedDbFile"
                class="btn btn-primary btn-w-normal fz-lg"
              >
                {{ disp_chooseFile }}
                <input
                  ref="uploadFile"
                  type="file"
                  id="file"
                  :multiple="false"
                  accept=".dbf"
                  style="display: none"
                  @change="onUploadFiles"
                  :disabled="flag_uploading"
                />
              </label>
              <label v-else class="btn btn-primary btn-w-normal fz-lg">
                {{ disp_chooseAnotherFile }}
                <input
                  ref="uploadFile"
                  type="file"
                  id="newfile"
                  :multiple="false"
                  accept=".dbf"
                  style="display: none"
                  @change="onReUploadFiles"
                  :disabled="flag_uploading"
                />
              </label>
              <CButton
                class="btn btn-primary btn-w-normal fz-lg ml-5"
                @click="clickOnUpload"
                :disabled="flag_uploading || !value_selectedDbFile"
              >
                {{ disp_upload }}
              </CButton>

              <div v-if="flag_uploading">
                <progress-bar
                  :options="progressOptions"
                  :value="value_uploadProgress"
                  style="margin: -22px 20px; padding: 0"
                />
              </div>
            </CRow>
          </CCol>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<script>
import ProgressBar from "vuejs-progress-bar";
import Axios from "axios";
import i18n from "../../i18n";

Date.prototype.yyyy_mm_dd_HH_MM_SS = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();
  var HH = this.getHours();
  var MM = this.getMinutes();
  var SS = this.getSeconds();

  return [
    this.getFullYear() + "_",
    (mm > 9 ? "" : "0") + mm + "_",
    (dd > 9 ? "" : "0") + dd + "_",
    (HH > 9 ? "" : "0") + HH + "_",
    (MM > 9 ? "" : "0") + MM + "_",
    (SS > 9 ? "" : "0") + SS,
  ].join("");
};

export default {
  name: "BackupAndRestore",
  data() {
    return {
      progressOptions: {
        text: {
          color: "#000000",
          shadowEnable: false,
          shadowColor: "#000000",
          fontSize: 14,
          fontFamily: "Helvetica",
          dynamicPosition: false,
          hideText: false,
        },
        progress: {
          color: "#2dbd2d",
          backgroundColor: "#C0C0C0",
        },
        layout: {
          height: 50,
          width: 50,
          verticalTextAlign: 35,
          horizontalTextAlign: 8,
          zeroOffset: 0,
          strokeWidth: 10,
          progressPadding: 0,
          type: "circle",
        },
      },
      param_cardStyle: "height: 9rem;",
      disp_header: i18n.formatter.format("BackupAndRestore"),
      disp_backupDatabase: i18n.formatter.format("BackupDatabase"),
      disp_restoreDatabase: i18n.formatter.format("RestoreDatabase"),
      disp_dbBackupInfo: "",
      disp_generateBackup: i18n.formatter.format("GenerateBackup"),
      disp_download: i18n.formatter.format("Download"),
      disp_upload: i18n.formatter.format("Upload"),
      disp_chooseFile: i18n.formatter.format("ChooseFile"), //
      disp_chooseAnotherFile: i18n.formatter.format("ChooseAnotherFile"), //
      disp_fileName: i18n.formatter.format("FileName"), //
      flag_downloading: false,
      flag_generating: false,
      flag_uploading: false,
      value_downloadProgress: 0,
      value_uploadProgress: 0,
      value_selectedDbFile: null,
      value_lastDbBackupTime: null,
      value_fileName: "",
    };
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {
    const self = this;
  },
  mounted() {
    const self = this;
    self.value_lastDbBackupTime = null;
    self.disp_dbBackupInfo = "";
    self.flag_generating = true;
    self.CheckGenerateBackup({ restart: false });
  },
  components: {
    ProgressBar,
  },
  methods: {
    async checkDbbackup(cb) {
      const self = this;
      let ret = await self.$globalCheckDbBackupFile();
      console.log("checkDbbackup", ret.data);
      if (!ret.error) {
        if (ret.data.date.length > 0) {
          self.value_lastDbBackupTime = ret.data.date;
          self.disp_dbBackupInfo =
            i18n.formatter.format("DbBackupTime") + self.value_lastDbBackupTime;
        } else {
          self.value_lastDbBackupTime = null;
          self.disp_dbBackupInfo = "";
        }
      } else {
        self.value_lastDbBackupTime = null;
        self.disp_dbBackupInfo = "";
        // await self.sleep( 5000 );
        // self.checkDbbackup()
      }
    },
    async downloadDb(cb) {
      const self = this;
      const client = Axios.create({
        timeout: 600000,
        headers: {
          // 'Connection': 'Keep-Alive'
        },
      });
      self.value_downloadProgress = 0;
      let error = null;
      let token = self.$globalGetTokenString();
      self.flag_downloading = true;
      await client
        .get(self.$globalDownloadDbPath() + `?token=${token}`, {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const total = parseFloat(progressEvent.total);
            const current = progressEvent.loaded;
            self.value_downloadProgress = Math.floor((current / total) * 100);
          },
        })
        .then((response) => {
          const blob = new Blob([response.data], {});
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download =
            "airatabletlite_db_backup_" + new Date().yyyy_mm_dd_HH_MM_SS() + ".dbf";
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((err) => {
          error = err;
        });
      self.flag_downloading = false;
      self.value_downloadProgress = 0;
      if (cb) cb(error);
    },
    async generateDbBak(cb) {
      const self = this;
      const client = Axios.create({
        timeout: 600000,
        headers: {
          // 'Connection': 'Keep-Alive'
        },
      });
      self.value_downloadProgress = 0;
      let error = null;
      let token = self.$globalGetTokenString();
      self.flag_downloading = true;
      await client
        .get(self.$globalDownloadDbPath() + `?token=${token}`, {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const total = parseFloat(progressEvent.total);
            const current = progressEvent.loaded;
            self.value_downloadProgress = Math.floor((current / total) * 100);
          },
        })
        .then((response) => {
          const blob = new Blob([response.data], {});
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download =
            "airatabletlite_db_backup_" + new Date().yyyy_mm_dd_HH_MM_SS() + ".dbf";
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((err) => {
          error = err;
        });
      self.flag_downloading = false;
      self.value_downloadProgress = 0;
      if (cb) cb(error);
    },
    sleep(ms = 0) {
      return new Promise((r) => setTimeout(r, ms));
    },
    CheckGenerateBackup(query) {
      const self = this;
      self.$globalGenerateDbBackup(query, async function (err, data) {
        if (!err) {
          if (data.message != "ok") {
            self.disp_dbBackupInfo = "Processing : " + data.progress + " %";
            await self.sleep(5000);
            self.CheckGenerateBackup({ restart: false });
          } else {
            self.flag_generating = false;
            self.checkDbbackup();
          }
        } else self.flag_generating = false;
      });
    },

    async clickOnGenerateBackup() {
      const self = this;
      if (self.flag_generating) return;
      self.value_lastDbBackupTime = null;
      self.disp_dbBackupInfo = "";
      self.flag_generating = true;
      self.CheckGenerateBackup({ restart: true });
    },
    clickOnDownload() {
      const self = this;
      self.downloadDb(function (error) {
        if (error) {
          self.$fire({
            text: i18n.formatter.format("OperationFailed"),
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8",
          });
        } else {
          self.$fire({
            text: i18n.formatter.format("Complete"),
            type: "success",
            timer: 3000,
          });
        }
      });
    },
    clickOnUpload() {
      const self = this;
      self.$confirm(i18n.formatter.format("ConfirmToProcess")).then(() => {
        self.flag_uploading = true;
        self.value_uploadProgress = 0;
        let formData = new FormData();
        formData.append("file", self.value_selectedDbFile);
        const client = Axios.create({ timeout: 600000 });
        client
          .post(self.$globalUploadDbPath(), formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              token: self.$globalGetTokenString(),
            },
            onUploadProgress: (progressEvent) => {
              const total = parseFloat(progressEvent.total);
              const current = progressEvent.loaded;
              self.value_uploadProgress = Math.floor((current / total) * 100);
            },
          })
          .then(function () {
            self.flag_uploading = false;
            self.$fire({
              text: i18n.formatter.format("Complete"),
              type: "success",
              timer: 3000,
            });
          })
          .catch(function () {
            self.flag_uploading = false;
            self.$fire({
              text: i18n.formatter.format("OperationFailed"),
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8",
            });
          });
      });
    },
    onUploadFiles(event) {
      const self = this;

      self.value_selectedDbFile = null;
      this.$refs.uploadFile.files.forEach((file) => {
        self.value_selectedDbFile = file;
      });
      let file = document.getElementById("file").files[0];
      self.value_fileName = file.name;
    },
    onReUploadFiles(event) {
      const self = this;

      self.value_selectedDbFile = null;
      this.$refs.uploadFile.files.forEach((file) => {
        self.value_selectedDbFile = file;
      });
      let file = document.getElementById("newfile").files[0];
      self.value_fileName = file.name;
    },
  },
};
</script>
