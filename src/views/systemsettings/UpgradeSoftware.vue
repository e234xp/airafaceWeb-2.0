<template>
  <div>
    <CCol sm="12">
      <div class="h1">
        {{ disp_header }}
      </div>

      <CCard class="pt-3 mt-5">
        <CCardHeader>
          <span class="h3">
            {{ disp_upgradeSoftware }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ disp_versionInfo }}
          </span>

          <span v-if="value_selectedDbFile" class="ml-4">{{ disp_fileName }}</span>
          <span v-if="value_selectedDbFile" class="ml-1">
            {{ value_fileName }}
          </span>
        </CCardHeader>
        <CCardBody class="px-5">
          <CRow class="align-items-center">
            <label v-if="!value_selectedDbFile" class="btn btn-primary fz-xl mb-0">
              {{ disp_chooseFile }}
              <input ref="uploadFile" type="file" id="file" :multiple="false" accept=".airasoft" style="display: none"
                @change="onUploadFiles" />
            </label>
            <label v-else class="btn btn-danger fz-xl mb-0">
              {{ disp_chooseAnotherFile }}
              <input ref="uploadFile" type="file" id="newfile" :multiple="false" accept=".airasoft"
                style="display: none" @change="onReUploadFiles" />
            </label>

            <CButton class="btn btn-primary fz-xl ml-5" @click="clickOnUpload"
              :disabled="flag_uploading || !value_selectedDbFile">
              {{ disp_upload }}
            </CButton>

            <div v-if="flag_uploading" class="height: auto; pb-3">
              <progress-bar :options="progressOptions" :value="value_uploadProgress" class="ml-5" />
            </div>
          </CRow>
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
    name: "UpgradeSoftware",
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
        disp_header: i18n.formatter.format("UpgradeSoftware"),
        disp_upgradeSoftware: i18n.formatter.format("UpgradeSoftware"),
        disp_upload: i18n.formatter.format("Upload"),
        disp_chooseFile: i18n.formatter.format("ChooseFile"), //
        disp_chooseAnotherFile: i18n.formatter.format("ChooseAnotherFile"), //

        disp_fileName: i18n.formatter.format("FileName"), //
        value_fileName: "",
        flag_uploading: false,
        value_uploadProgress: 0,
        value_selectedDbFile: null,
        disp_versionInfo: "",
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
      self.$globalGetSystemInfo(function (err, data) {
        if (data) {
          self.disp_versionInfo =
            i18n.formatter.format("CurrentVersionNumber") + " : " + data.fw_version + " / " + global.webVersion;
        }
      });
    },
    components: {
      ProgressBar,
    },
    methods: {
      clickOnUpload() {
        const self = this;
        self.$confirm(i18n.formatter.format("ConfirmToProcess")).then(() => {
          self.value_uploadProgress = 0;
          self.flag_uploading = true;
          let formData = new FormData();
          formData.append("file", self.value_selectedDbFile);
          const client = Axios.create({ timeout: 600000 });
          client
            .post(self.$globalUpgradeSwPath(), formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                //'Connection': 'Keep-Alive',
                token: self.$globalGetTokenString(),
              },
              onUploadProgress: (progressEvent) => {
                const total = parseFloat(progressEvent.total);
                const current = progressEvent.loaded;
                self.value_uploadProgress = Math.floor((current / total) * 100);

                if (self.value_uploadProgress > 99) {
                  self.$globalLogout();
                  self
                    .$fire({
                      text: i18n.formatter.format("CompleteAndRestart"),
                      type: "success",
                      showConfirmButton: false,
                      //timerProgressBar : true,
                      timer: 60000,
                      allowOutsideClick: () => { },
                    })
                    .then(() => {
                      //console.log("sss")
                    });
                }
              },
            })
            .then(function () {
              self.flag_uploading = false;
              // self.$fire({
              //   text: i18n.formatter.format("Complete"),
              //   type: "success",
              //   timer: 3000
              // });
            })
            .catch(function (e) {
              self.flag_uploading = false;
              self.$fire({
                text: i18n.formatter.format("LostConnection"),
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
          // let filesArray = Object.keys(this.$refs.uploadFile.files).map((key) => [
          //   this.$refs.uploadFile.files[key],
          // ]);
          // filesArray.forEach((file) => {
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