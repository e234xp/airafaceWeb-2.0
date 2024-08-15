<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">
        {{ $t('BackupAndRestore') }}
      </div>

      <CCard>
        <CCardHeader>
          <td>
            <span class="h3">{{ $t('BackupDatabase') }}</span>
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
                {{ $t('GenerateBackup') }}
              </CButton>

              <CButton
                class="btn btn-primary btn-w-normal fz-lg ml-5"
                @click="clickOnDownload"
                :disabled="flag_downloading || !value_lastDbBackupTime"
              >
                {{ $t('Download') }}
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
        <CCardHeader>
          <div class="d-flex align-items-center">
            <div class="h3">
              {{ $t('RestoreDatabase') }}
            </div>
            <div v-if="value_selectedDbFile">
              <span class="ml-4">{{ $t('FileName') }}</span>
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
                style="margin-bottom: 0 !important;"
              >
                {{ $t('ChooseFile') }}
                <input
                  ref="uploadFile"
                  type="file"
                  id="file"
                  :multiple="false"
                  accept=".dbf"
                  style="display: none"
                  @change="onUploadFiles"
                  :disabled="flag_uploading"
                >
              </label>
              <label
                v-else
                class="btn btn-primary btn-w-normal fz-lg"
                style="margin-bottom: 0 !important;"
              >
                {{ $t('ChooseAnotherFile') }}
                <input
                  ref="uploadFile"
                  type="file"
                  id="newfile"
                  :multiple="false"
                  accept=".dbf"
                  style="display: none"
                  @change="onReUploadFiles"
                  :disabled="flag_uploading"
                >
              </label>
              <CButton
                class="btn btn-primary btn-w-normal fz-lg ml-5"
                @click="clickOnUpload"
                :disabled="flag_uploading || !value_selectedDbFile && false"
              >
                {{ $t('Upload') }}
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
import ProgressBar from 'vuejs-progress-bar';
import Axios from 'axios';

export default {
  name: 'BackupAndRestore',
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
          horizontalTextAlign: 15,
          zeroOffset: 0,
          strokeWidth: 10,
          progressPadding: 0,
          type: 'circle',
        },
      },
      param_cardStyle: 'height: 9rem;',
      disp_dbBackupInfo: '',
      flag_downloading: false,
      flag_generating: false,
      flag_uploading: false,
      value_downloadProgress: 0,
      value_uploadProgress: 0,
      value_selectedDbFile: null,
      value_lastDbBackupTime: null,
      value_fileName: '',
    };
  },
  mounted() {
    this.value_lastDbBackupTime = null;
    this.disp_dbBackupInfo = '';
    this.flag_generating = true;
    this.CheckGenerateBackup({ restart: false });
  },
  components: {
    ProgressBar,
  },
  methods: {
    yyyy_mm_dd_HH_MM_SS(date) {
      const mm = date.getMonth() + 1;
      const dd = date.getDate();
      const HH = date.getHours();
      const MM = date.getMinutes();
      const SS = date.getSeconds();

      return `${date.getFullYear()}-${(mm > 9 ? '' : '0') + mm}-${(dd > 9 ? '' : '0') + dd} ${(HH > 9 ? '' : '0') + HH}:${(MM > 9 ? '' : '0') + MM}:${(SS > 9 ? '' : '0') + SS}`;
    },

    async checkDbbackup() {
      const ret = await this.$globalCheckDbBackupFile();
      console.log('checkDbbackup', ret.data);
      if (!ret.error) {
        if (ret.data.date.length > 0) {
          this.value_lastDbBackupTime = ret.data.date;
          this.disp_dbBackupInfo = this.$t('DbBackupTime') + this.value_lastDbBackupTime;
        } else {
          this.value_lastDbBackupTime = null;
          this.disp_dbBackupInfo = '';
        }
      } else {
        this.value_lastDbBackupTime = null;
        this.disp_dbBackupInfo = '';
        // await this.sleep( 5000 );
        // this.checkDbbackup()
      }
    },
    async downloadDb(cb) {
      const client = Axios.create({
        timeout: 600000,
        headers: {
          // 'Connection': 'Keep-Alive'
        },
      });
      this.value_downloadProgress = 0;
      let error = null;
      const token = this.$globalGetTokenString();
      this.flag_downloading = true;
      await client
        .post(`${this.$globalDownloadDbPath()}?token=${token}`, {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const total = parseFloat(progressEvent.total);
            const current = progressEvent.loaded;
            this.value_downloadProgress = Math.floor((current / total) * 100);
          },
        })
        .then((response) => {
          const blob = new Blob([response.data], {});
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `airatabletlite_db_backup_${this.yyyy_mm_dd_HH_MM_SS(new Date())}.dbf`;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((err) => {
          error = err;
        });
      this.flag_downloading = false;
      this.value_downloadProgress = 0;
      if (cb) cb(error);
    },
    async generateDbBak(cb) {
      const client = Axios.create({
        timeout: 600000,
        headers: {
          // 'Connection': 'Keep-Alive'
        },
      });
      this.value_downloadProgress = 0;
      let error = null;
      const token = this.$globalGetTokenString();
      this.flag_downloading = true;
      await client
        .get(`${this.$globalDownloadDbPath()}?token=${token}`, {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const total = parseFloat(progressEvent.total);
            const current = progressEvent.loaded;
            this.value_downloadProgress = Math.floor((current / total) * 100);
          },
        })
        .then((response) => {
          const blob = new Blob([response.data], {});
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `airatabletlite_db_backup_${this.yyyy_mm_dd_HH_MM_SS(new Date())}.dbf`;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((err) => {
          error = err;
        });
      this.flag_downloading = false;
      this.value_downloadProgress = 0;
      if (cb) cb(error);
    },
    sleep(ms = 0) {
      return new Promise((r) => setTimeout(r, ms));
    },
    CheckGenerateBackup(query) {
      this.$globalGenerateDbBackup(query, async (err, data) => {
        if (!err) {
          if (data.message !== 'ok') {
            this.disp_dbBackupInfo = `Processing : ${data.progress.toFixed(1)} %`;
            await this.sleep(5000);
            this.CheckGenerateBackup({ restart: false });
          } else {
            this.flag_generating = false;
            this.checkDbbackup();
          }
        } else this.flag_generating = false;
      });
    },

    async clickOnGenerateBackup() {
      if (this.flag_generating) return;
      this.value_lastDbBackupTime = null;
      this.disp_dbBackupInfo = '';
      this.flag_generating = true;
      this.CheckGenerateBackup({ restart: true });
    },
    clickOnDownload() {
      this.downloadDb((error) => {
        if (error) {
          this.$fire({
            text: this.$t('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        } else {
          this.$fire({
            text: this.$t('Complete'),
            type: 'success',
            timer: 3000,
          });
        }
      });
    },
    clickOnUpload() {
      this.$confirm(this.$t('ConfirmToProcess')).then(() => {
        this.flag_uploading = true;
        this.value_uploadProgress = 0;
        const formData = new FormData();
        formData.append('file', this.value_selectedDbFile);
        const client = Axios.create({ timeout: 600000 });
        client
          .post(this.$globalUploadDbPath(), formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              token: this.$globalGetTokenString(),
            },
            onUploadProgress: (progressEvent) => {
              const total = parseFloat(progressEvent.total);
              const current = progressEvent.loaded;
              this.value_uploadProgress = Math.floor((current / total) * 100);
            },
          })
          .then(() => {
            this.flag_uploading = false;
            // this.$fire({
            //   text: this.$t('Complete'),
            //   type: 'success',
            //   timer: 3000,
            // });
            this.$fire({
              text: this.$t('ConfirmToLogout'),
              type: 'success',
              timer: 3000,
            }).then(() => {
              this.$globalLogout();
            });
          })
          .catch(() => {
            this.flag_uploading = false;
            this.$fire({
              text: this.$t('OperationFailed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          });
      });
    },
    onUploadFiles() {
      this.value_selectedDbFile = null;
      Array.from(this.$refs.uploadFile.files).forEach((file) => {
        this.value_selectedDbFile = file;
      });
      const file = document.getElementById('file').files[0];
      this.value_fileName = file.name;
    },
    onReUploadFiles() {
      this.value_selectedDbFile = null;
      Array.from(this.$refs.uploadFile.files).forEach((file) => {
        this.value_selectedDbFile = file;
      });
      const file = document.getElementById('newfile').files[0];
      this.value_fileName = file.name;
    },
  },
};
</script>
