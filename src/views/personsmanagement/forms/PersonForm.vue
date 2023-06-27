<template>
  <div>
    <div class="h1 mb-5">{{ disp_header }}</div>
    <stepprogress
      class="w-step-progress-3"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :steps="[disp_inputPersonInfo, disp_selectRegisterPhoto, disp_complete]"
      :current-step="flag_currentSetp"
      :line-thickness="param_lineThickness"
      icon-class="fa fa-check"
    >
    </stepprogress>

    <CCol sm="12">
      <CCard :class="showOnStep(0)" :style="param_cardStyle">
        <!-- <CCardHeader>
          <td>
            <span class="h3">{{ disp_inputPersonInfo }}</span>
          </td>
        </CCardHeader> -->
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_personId }}</th>
              <th class="h5 w-25 table-th">{{ disp_personName }}</th>
              <th class="h5 w-25 table-th">{{ disp_department }}</th>
              <th class="h5 w-25 table-th">{{ disp_jobTitle }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  :disabled="modifyMode || !canModify()"
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_moreThan4lettersAndNumbers"
                  value=""
                  v-model="value_personId"
                  placeholder=""
                  :is-valid="personIdValidator"
                  required
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  valid-feedback="ok"
                  :invalid-feedback="disp_noEmptyNorSpaceOnly"
                  value=""
                  v-model="value_personName"
                  placeholder=""
                  :is-valid="personNameValidator"
                  required
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  value=""
                  v-model="value_department"
                  placeholder=""
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  value=""
                  v-model="value_jobTitle"
                  placeholder=""
                />
              </td>
            </tr>
          </table>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ disp_cardNumber }}
              </th>
              <th class="h5 w-25 table-th">{{ disp_emailAddress }}</th>
              <th class="h5 w-25 table-th">{{ disp_extensionNumber }}</th>
              <th class="h5 w-25 table-th">{{ disp_phoneNumber }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  class="input-no-spin"
                  :disabled="!canModify()"
                  size="lg"
                  v-model="value_cardNumber"
                  placeholder=""
                  valid-feedback="ok"
                  :invalid-feedback="disp_numbersOnlyIn20Bytes"
                  :is-valid="cardNumberValidator"
                  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                  maxLength="20"
                  type="number"
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  v-model="value_emailAddress"
                  type="email"
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  value=""
                  v-model="value_extensionNumber"
                  placeholder=""
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  value=""
                  v-model="value_phoneNumber"
                  placeholder=""
                />
              </td>
            </tr>
          </table>

          <CCol sm="12">
            <CRow class="mb-4">
              <CCol sm="6">
                <div class="h5">{{ disp_group }}</div>
                <multiselect
                  v-model="value_selectedGroupList"
                  placeholder=""
                  :options="value_allGroupsList"
                  :multiple="true"
                  :hideSelected="true"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  :searchable="false"
                  @input="updateSelectedGroupList"
                >
                </multiselect>
              </CCol>
              <CCol sm="6" v-if="value_assignedGroupList">
                <div class="h5">{{ disp_assignedGroup }}</div>
                <multiselect
                  v-model="value_assignedGroupList"
                  placeholder=""
                  :options="value_assignedGroupList"
                  :multiple="true"
                  disabled
                >
                </multiselect>
              </CCol>
            </CRow>
          </CCol>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">{{ disp_effectiveDate }}</th>
              <th class="h5 w-25 table-th">{{ disp_expireDate }}</th>
              <th class="h5 w-25 table-th">{{ disp_asAdmin }}</th>
              <th class="h5 w-25 table-th">{{ disp_remarks }}</th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  type="date"
                  :value="value_effectiveDate"
                  v-model="value_effectiveDate"
                />
              </td>
              <td class="table-td">
                <CInput
                  :disabled="!canModify()"
                  size="lg"
                  type="date"
                  :value="value_expireDate"
                  v-model="value_expireDate"
                />
              </td>
              <td class="table-td">
                <CSelect
                  :disabled="!enableAdminField"
                  size="lg"
                  :value.sync="value_asAdmin"
                  :options="value_asAdminOptions"
                  @change="selAsAdmin($event)"
                />
              </td>
              <td class="table-td"><CInput size="lg" v-model="value_remarks" /></td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)">
        <!-- <CCardHeader>
          <td>
            <span class="h3">{{ disp_selectRegisterPhoto }}</span>
          </td>
        </CCardHeader> -->
        <CCardBody>
          <CRow class="justify-content-center">
            <!-- 左欄 -->
            <CCol sm="4">
              <CCol sm="12">
                <div class="h1" />
                <div class="h1 row justify-content-center">
                  <div class="h3">{{ disp_registerPhoto }}</div>
                </div>
              </CCol>
              <CCol sm="12">
                <CRow>
                  <div id="take_photo_camera" v-if="flag_takingPhoto" class="w-100" />
                  <img
                    id="register_photo"
                    v-if="!flag_takingPhoto"
                    :src="value_photoToRegisterToShow"
                    class="w-100 w-img-col object-fit-contain"
                  />
                </CRow>
              </CCol>
              <div style="height: 20px"></div>
              <CCol sm="12">
                <div class="row justify-content-center">
                  <CButton
                    class="btn btn-outline-primary fz-lg mb-3 mx-2"
                    @click="clickOnPickRegisterPhoto"
                    :disabled="flag_isPickingRegisterPhoto || !canModify()"
                    ><span>{{ disp_selectPhoto }}</span>
                  </CButton>

                  <CButton
                    class="btn btn-outline-primary fz-lg mb-3"
                    @click="clickOnTakeRegisterPhoto"
                    :disabled="!flag_haveWebCam || !canModify()"
                    ><span v-if="flag_takingPhoto">{{ disp_useWebCamPhoto }}</span>
                    <span v-else>{{ disp_takePhoto }}</span>
                  </CButton>
                </div>
              </CCol>
              <div style="height: 20px"></div>
              <CCol sm="12">
                <div class="row justify-content-center">
                  <CSelect
                    :disabled="!canModify()"
                    style="width: 350px"
                    :options="getWebcamList()"
                    @change="selWebcam($event)"
                  >
                    <template #prepend>
                      <CButton
                        :disabled="!canModify()"
                        size="sm"
                        color="light"
                        @click="refreshCamera()"
                        ><i class="fa fa-sync"></i
                      ></CButton>
                    </template>
                  </CSelect>
                </div>
              </CCol>
            </CCol>
            <!-- 右欄 -->
            <CCol sm="4">
              <CCol sm="12">
                <div class="h1" />
                <div class="h1 row justify-content-center">
                  <div class="h3">{{ disp_displayPhoto }}</div>
                </div>
              </CCol>
              <CCol sm="12">
                <CRow>
                  <img
                    :src="value_photoToDisplayToShow"
                    class="w-100 w-img-col object-fit-contain"
                  />
                </CRow>
              </CCol>
              <div style="height: 20px"></div>
              <CCol sm="12">
                <div class="row justify-content-center">
                  <CButton
                    class="btn btn-outline-primary fz-lg mb-3 mx-2"
                    :disabled="flag_isPickingDisplayPhoto"
                    @click="clickOnPickDisplayPhoto"
                    >{{ disp_selectPhoto }}
                  </CButton>
                </div>
              </CCol>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <CCard :class="showOnStep(2)" :style="param_cardStyle">
        <CCardBody>
          <div style="height: 220px"></div>
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ disp_registerCompleted }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton class="btn btn-outline-primary fz-lg btn-w-normal" @click="clickOnPrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="clickOnNext"
            :disabled="!(flag_personNamePass && flag_personIdPass && flag_cardNumberPass)"
            >{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import i18n from "../../../i18n";
import * as faceapi from "face-api.js";

import StepProgress from "vue-step-progress";
// import "vue-step-progress/dist/main.css";
import "../../../../src/airacss/vue-step-progress.css";

import Multiselect from "vue-multiselect";
//import "vue-multiselect/dist/vue-multiselect.min.css";
import "../../../../src/airacss/vue-multiselect.css";

import Webcam from "../webcam.js";

Date.prototype.yyyy_mm_dd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear() + "-",
    (mm > 9 ? "" : "0") + mm + "-",
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

const defaultlState = () => {
  return {
    obj_loading: null,

    param_cardStyle: "height: 35rem;",
    param_activeColor: "#6baee3",
    param_passiveColor: "#919bae",
    param_lineThickness: 3,
    param_activeThickness: 3,
    param_passiveThickness: 3,

    disp_header: "none", //i18n.formatter.format("CreatePerson"),
    disp_moreThan4lettersAndNumbers: i18n.formatter.format("MoreThan4lettersAndNumbers"),
    disp_numbersOnlyIn20Bytes: i18n.formatter.format("NumbersOnlyIn20Bytes"),
    disp_noEmptyNorSpaceOnly: i18n.formatter.format("NoEmptyNoSpaceOnly"),
    disp_inputPersonInfo: i18n.formatter.format("InputPersonInfo"),
    disp_selectRegisterPhoto: i18n.formatter.format("SelectRegisterPhoto"),
    disp_registerPhoto: i18n.formatter.format("RegisterPhoto"),
    disp_displayPhoto: i18n.formatter.format("DisplayPhoto"),
    disp_register: i18n.formatter.format("Register"),
    disp_complete: i18n.formatter.format("Complete"),
    disp_registerCompleted: i18n.formatter.format("RegisterCompleted"),
    disp_previous: i18n.formatter.format("Previous"),
    disp_next: i18n.formatter.format("Next"),
    disp_select: i18n.formatter.format("Select"),
    disp_selected: i18n.formatter.format("Selected"),
    disp_deselect: i18n.formatter.format("Deselect"),

    value_allPerson: [],
    value_returnRoutePath: "",
    value_returnRouteName: "",

    flag_currentSetp: 0,
    disp_personId: i18n.formatter.format("PersonId"),
    value_personId: "",
    flag_personIdPass: false,

    disp_personName: i18n.formatter.format("PersonName"),
    value_personName: "",
    flag_personNamePass: false,

    disp_cardNumber: i18n.formatter.format("CardNumber"),
    value_cardNumber: "",
    flag_cardNumberPass: false,

    disp_emailAddress: i18n.formatter.format("EmailAddress"),
    value_emailAddress: "",

    disp_department: i18n.formatter.format("Department"),
    value_department: "",

    disp_jobTitle: i18n.formatter.format("JobTitle"),
    value_jobTitle: "",

    disp_extensionNumber: i18n.formatter.format("ExtensionNumber"),
    value_extensionNumber: "",

    disp_phoneNumber: i18n.formatter.format("PhoneNumber"),
    value_phoneNumber: "",

    disp_effectiveDate: i18n.formatter.format("EffectiveDate"),
    value_effectiveDate: new Date().yyyy_mm_dd(),

    disp_expireDate: i18n.formatter.format("ExpireDate"),
    value_expireDate: "",

    disp_remarks: i18n.formatter.format("Remarks"),
    value_remarks: "",

    disp_asAdmin: i18n.formatter.format("AsAdmin"),
    value_asAdmin: false,
    value_asAdminOptions: [
      { value: false, label: i18n.formatter.format("No") },
      { value: true, label: i18n.formatter.format("Yes") },
    ],

    disp_group: i18n.formatter.format("Group"),
    disp_assignedGroup: i18n.formatter.format("AssignedGroup"),
    value_selectedGroupList: [],

    flag_takingPhoto: false,
    flag_isPickingRegisterPhoto: false,
    flag_haveWebCam: false,
    flag_isPickingDisplayPhoto: false,
    disp_selectPhoto: i18n.formatter.format("SelectPhoto"),
    disp_takePhoto: i18n.formatter.format("TakePhoto"),
    disp_useWebCamPhoto: i18n.formatter.format("UseWebCamPhoto"),

    value_constraintsList: [],
    value_selectedConstraints: null,

    value_photoToRegisterToShow:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==",
    value_photoToDisplayToShow:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==",
    value_photoToRegister: "",
    value_photoToDisplay: "",

    value_allGroupsList: [],
  };
};
export default {
  name: "PersonForm",
  props: {
    formData: Object,
    enableAdminField: Boolean,
    modifyMode: Boolean,
    canModify: { type: Function },
    onFinish: { type: Function },
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  created() {
    const self = this;
    faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    self.refreshCamera();
    self.updateSettings();
  },
  updated() {
    const self = this;
    if (self.flag_takingPhoto && self.value_selectedConstraints) {
      Webcam.set({
        constraints: self.value_selectedConstraints,
        flip_horiz: true,
        width: 464,
        height: 350,
        dest_width: 640,
        dest_height: 480,
        // crop_width : 300,
        // crop_height : 300,
        image_format: "jpeg",
        jpeg_quality: 100,
      });
      Webcam.attach("#take_photo_camera");
    }
  },
  methods: {
    updateSelectedGroupList(g) {
      const self = this;
      // Array.prototype.unique = function() {
      //     var a = this.concat();
      //     for(var i=0; i<a.length; ++i) {
      //         for(var j=i+1; j<a.length; ++j) {
      //             if(a[i] === a[j])
      //                 a.splice(j--, 1);
      //         }
      //     }
      //     return a;
      // };

      // self.value_selectedGroupList = self.value_selectedGroupList.concat(self.value_assginedGroupsList).unique()
    },
    selAsAdmin(e) {
      const self = this;
      self.value_asAdmin = e.target.value == "true" ? true : false;
    },
    refreshCamera() {
      const self = this;
      self.value_constraintsList = [];
      Webcam.fetchDeviceList(function (list) {
        if (list != null)
          list.forEach(function (device) {
            self.value_constraintsList.push({
              label: device.label,
              constraints: { deviceId: { exact: device.deviceId } },
            });
          });
        if (self.value_constraintsList.length > 0) {
          self.flag_haveWebCam = true;
        }
      });
    },
    async detectFaceAndGetHeadBox(img, cb) {
      const detection = await faceapi.detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions()
      );
      return new Promise((resolve) => {
        let box = null;
        if (detection) {
          let rangeRatio = 2;
          let headWidthToHunt =
            (detection.box.width < detection.box.height
              ? detection.box.width
              : detection.box.height) * rangeRatio;
          let headX = detection.box.x - detection.box.height / 2;
          let headY = detection.box.y - detection.box.height / 1.2;
          if (headX < 0) headX = 0;
          if (headY < 0) headY = 0;
          while (
            headWidthToHunt + headX > img.width ||
            headWidthToHunt + headY > img.height
          ) {
            headWidthToHunt--;
          }

          box = {
            x: headX,
            y: headY,
            width: headWidthToHunt,
            height: headWidthToHunt,
          };
        }
        if (cb) cb(box);
        resolve(box);
      });
    },
    async updateSettings() {
      const self = this;
      self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
      let ret = await self.$globalGetGroupList();
      if (ret.error) {
        self.value_allGroupsList = [];
        self.$fire({
          title: i18n.formatter.format("NetworkLoss"),
          text: "",
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
        });
      } else {
        const list = [];
        const assginedList = [];
        try {
          ret.group_list.forEach((group) => {
            if (!group.assgined_by_manager) {
              list.push(group.name);
            }
          });
          self.value_allGroupsList = list;
        } catch (e) {}
      }
      if (self.obj_loading) self.obj_loading.hide();
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
          return this.disp_register;
        case 2:
          return this.disp_complete;
        default:
          return this.disp_next;
      }
    },
    clickOnPrev() {
      const self = this;
      self.flag_takingPhoto = false;
      if (Webcam.loaded) Webcam.reset();

      if (self.flag_currentSetp == 0) {
        if (self.value_returnRoutePath.length > 0) {
          self.$router.push({ name: self.value_returnRoutePath });
        } else self.updateSettings();
      } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
    },
    clickOnNext() {
      const self = this;
      self.flag_takingPhoto = false;
      if (Webcam.loaded) Webcam.reset();

      if (self.flag_currentSetp == 0) {
        self.flag_currentSetp = 1;
      } else if (self.flag_currentSetp == 1) {
        self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
        if (self.onFinish)
          self.onFinish(
            {
              id: self.value_personId,
              name: self.value_personName,
              card_facility_code: "",
              card_number: self.value_cardNumber,
              begin_date: self.value_effectiveDate,
              expir_date: self.value_expireDate,
              email: self.value_emailAddress,
              register_image: self.value_photoToRegister,
              display_image: self.value_photoToDisplay,
              title: self.value_jobTitle,
              department: self.value_department,
              phone_number: self.value_phoneNumber,
              extension_number: self.value_extensionNumber,
              as_admin: self.value_asAdmin,
              remarks: self.value_remarks,
              group_list: self.value_selectedGroupList,
            },
            function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (result && result.message == "ok") {
                self.flag_currentSetp = 2;
              } else {
                //self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
                self.$fire({
                  text: i18n.formatter.format("RegisterFailed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            }
          );
        else {
          if (self.obj_loading) self.obj_loading.hide();
          self.flag_currentSetp = 2;
        }
      } else {
        // self.flag_currentSetp = 0;
        // let d = Object.assign({}, defaultlState(), self.formData);
        // Object.assign(self.$data, d);
        // self.updateSettings();
        self.$router.push({ name: self.value_returnRoutePath });
        //let merged = {...obj1, ...obj2};
      }
    },

    selectPhotoFromFile(cb) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onclick = function (e) {
        if (e.target.value.length == 0) {
          if (cb) cb(null);
        }
      };
      input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file, "UTF-8");
        reader.onload = async (readerEvent) => {
          const img = document.createElement("img");
          img.src = readerEvent.target.result;

          if (cb) cb(img);
        };
      };
      input.click();
    },
    clickOnPickRegisterPhoto() {
      const self = this;
      self.flag_isPickingRegisterPhoto = true;
      self.selectPhotoFromFile(function (img) {
        if (img) {
          //self.obj_loading = self.$loading.show( {container: self.$refs.formContainer});
          self.detectFaceAndGetHeadBox(img, function (box) {
            if (box) {
              try {
                let canvas = document.createElement("canvas");
                canvas.x = 0;
                canvas.y = 0;
                canvas.width = 500;
                canvas.height = 500;
                //let ctx = canvas.getContext("2d");
                //ctx.drawImage( img, box.x, box.y, box.width, box.height, 0, 0, 500, 500 );
                canvas
                  .getContext("2d")
                  .drawImage(img, box.x, box.y, box.width, box.height, 0, 0, 500, 500);
                const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
                self.value_photoToRegister = dataUrl.replace(
                  /^data:image\/[a-z]+;base64,/,
                  ""
                );
                self.value_photoToRegisterToShow = dataUrl;
              } catch (e) {}
            }
            //if( self.obj_loading ) self.obj_loading.hide();
          });
        }
        self.flag_isPickingRegisterPhoto = false;
      });
      self.flag_takingPhoto = false;
      try {
        Webcam.reset();
      } catch (e) {}
    },
    clickOnTakeRegisterPhoto() {
      const self = this;
      if (self.flag_takingPhoto) {
        //self.obj_loading = self.$loading.show( {container: self.$refs.formContainer});
        Webcam.snap(function (dataUri) {
          const img = new Image();
          img.src = dataUri;
          self.flag_takingPhoto = false;
          try {
            Webcam.reset();
          } catch (e) {}
          self.detectFaceAndGetHeadBox(img, function (box) {
            if (box) {
              try {
                let canvas = document.createElement("canvas");
                canvas.x = 0;
                canvas.y = 0;
                canvas.width = 500;
                canvas.height = 500;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, 500, 500);
                const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
                self.value_photoToRegister = dataUrl.replace(
                  /^data:image\/[a-z]+;base64,/,
                  ""
                );
                self.value_photoToRegisterToShow = dataUrl;
              } catch (e) {}
            }
            //if( self.obj_loading ) self.obj_loading.hide();
          });
        });
      } else {
        Webcam.on("live", function () {
          if (self.obj_loading) self.obj_loading.hide();
        });
        Webcam.on("error", function () {
          if (self.obj_loading) self.obj_loading.hide();
        });
        self.flag_takingPhoto = !self.flag_takingPhoto;
      }
    },
    clickOnPickDisplayPhoto() {
      const self = this;
      self.flag_isPickingDisplayPhoto = true;
      self.selectPhotoFromFile(function (img) {
        if (img) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
          self.resizeImageFromDataURL(null, img.src, 500, 500, function (basr64Img) {
            const dataUrl = basr64Img;
            self.value_photoToDisplay = dataUrl.replace(
              /^data:image\/[a-z]+;base64,/,
              ""
            );
            self.value_photoToDisplayToShow = dataUrl;
            if (self.obj_loading) self.obj_loading.hide();
          });
        }
        self.flag_isPickingDisplayPhoto = false;
      });
    },

    showOnStep(step) {
      return step == this.flag_currentSetp ? "d-block" : "d-none";
    },

    personNameValidator(val) {
      this.test = this.value_personName;
      if (val.replace(/\s/g, "").length == 0) {
        this.flag_personNamePass = false;
      } else this.flag_personNamePass = val.length > 0;
      return this.flag_personNamePass;
    },
    personIdValidator(val) {
      if (!/^[a-zA-Z0-9]/.test(val)) {
        return false;
      }
      const exist = this.value_allPerson.filter((p) => {
        return p.id == val;
      });
      if (exist.length > 0) return false;

      this.flag_personIdPass = val.length >= 4;
      return this.flag_personIdPass;
    },

    cardNumberValidator(val) {
      if (val.length != 0) {
        if (!/^[0-9]+$/.test(val)) {
          return false;
        }
      }
      this.flag_cardNumberPass = val.length <= 20;
      return this.flag_cardNumberPass;
    },
    resizeImageFromDataURL(box, base64Str, maxWidth, maxHeight, callBack) {
      // We create an image to receive the Data URI
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        try {
          let canvas = document.createElement("canvas");
          canvas.x = 0;
          canvas.y = 0;
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          let ctx = canvas.getContext("2d");
          if (box)
            ctx.drawImage(
              img,
              box.x,
              box.y,
              box.width,
              box.height,
              0,
              0,
              maxWidth,
              maxHeight
            );
          else ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, maxWidth, maxHeight);
          if (callBack) callBack(canvas.toDataURL("image/jpeg", 1.0));
        } catch (e) {
          if (callBack) callBack(null);
        }
      };
    },
    selWebcam(e) {
      const self = this;
      self.value_constraintsList.forEach(function (d) {
        if (d.label == e.target.value) {
          self.value_selectedConstraints = d.constraints;
        }
      });
    },
    getWebcamList() {
      const self = this;
      const list = [];
      self.value_constraintsList.forEach(function (d) {
        if (self.value_selectedConstraints == null) {
          self.value_selectedConstraints = d.constraints;
        }
        list.push(d.label);
      });
      return list; // self.value_constraintsList;
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
  },
};
</script>
