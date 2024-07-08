<template>
  <div>
    <div class="h1 mb-5">
      <template v-if="enableAdminField">
        {{ modifyMode ? $t('EditPerson') : $t('AddPerson') }}
      </template>
      <template v-else>
        {{ modifyMode ? $t('EditVisitor') : $t('AddVisitor') }}
      </template>
    </div>
    <stepprogress
      class="w-step-progress-3"
      :active-thickness="param_activeThickness"
      :passive-thickness="param_passiveThickness"
      :active-color="param_activeColor"
      :passive-color="param_passiveColor"
      :steps="[$t('InputPersonInfo'), $t('SelectRegisterPhoto'), $t('Complete')]"
      :current-step="flag_currentSetp"
      :line-thickness="param_lineThickness"
      icon-class="fa fa-check"
    />

    <CCol sm="12">
      <CCard
        :class="showOnStep(0)"
        :style="param_cardStyle"
      >
        <!-- <CCardHeader>
          <td>
            <span class="h3">{{ $t('InputPersonInfo') }}</span>
          </td>
        </CCardHeader> -->
        <CCardBody>
          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('PersonId') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('PersonName') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Department') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('JobTitle') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  :disabled="modifyMode || !canModify()"
                  size="lg"
                  :invalid-feedback="$t('MoreThan4lettersAndNumbers')"
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
                  :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
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
                {{ $t('CardNumber') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('EmailAddress') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('ExtensionNumber') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('PhoneNumber') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CInput
                  class="input-no-spin"
                  :disabled="!canModify()"
                  size="lg"
                  v-model="value_cardNumber"
                  placeholder=""
                  :invalid-feedback="$t('NoRepeat')"
                  :is-valid="(val) => cardNumberValidator(val.toString())"
                  oninput="if (this.value.length > 20) this.value = this.value.slice(0, 20);"
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
                <div class="h5">
                  {{ $t('Group') }}
                </div>
                <multiselect
                  v-model="value_selectedGroupList"
                  placeholder=""
                  :options="value_allGroupsList"
                  :multiple="true"
                  :hide-selected="true"
                  :select-label="$t('Select')"
                  :selected-label="$t('Selected')"
                  :deselect-label="$t('Deselect')"
                  :searchable="false"
                />
              </CCol>
              <CCol
                sm="6"
                v-if="value_assignedGroupList"
              >
                <div class="h5">
                  {{ $t('AssignedGroup') }}
                </div>
                <multiselect
                  v-model="value_assignedGroupList"
                  placeholder=""
                  :options="value_assignedGroupList"
                  :multiple="true"
                  disabled
                />
              </CCol>
            </CRow>
          </CCol>

          <table class="table-layout">
            <tr class="table-tr">
              <th class="h5 w-25 table-th">
                {{ $t('EffectiveDate') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('ExpireDate') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('AsAdmin') }}
              </th>
              <th class="h5 w-25 table-th">
                {{ $t('Remarks') }}
              </th>
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
              <td class="table-td">
                <CInput
                  class="mb-form-row"
                  size="lg"
                  v-model="value_remarks"
                />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>

      <CCard :class="showOnStep(1)">
        <!-- <CCardHeader>
          <td>
            <span class="h3">{{ $t('SelectRegisterPhoto') }}</span>
          </td>
        </CCardHeader> -->
        <CCardBody>
          <CRow class="flex">
            <CCol
              sm="3"
              class="mt-5"
            >
              <div
                class="h5"
                :class="flag_maxRegisterFileSize ? '' : 'invalid-feedback'"
                style="text-align: right; display: block !important;"
              >
                {{ $t('ImageMaximumFileSize') }}
              </div>

              <div
                class="h5"
                :class="flag_minFaceResolution ? '' : 'invalid-feedback'"
                style="text-align: right; display: block !important;"
              >
                {{ $t('FaceMinimumResolution') }}
              </div>

              <div
                class="h5"
                :class="flag_imageHaveClearFace ? '' : 'invalid-feedback'"
                style="text-align: right; display: block !important;"
              >
                {{ $t('ImageHaveClearFace') }}
              </div>
            </CCol>
            <!-- 左欄 -->
            <CCol
              sm="3"
              class="justify-content-center"
            >
              <CRow>
                <CCol sm="12">
                  <div class="h3 row justify-content-center">
                    <div>{{ $t('RegisterPhoto') }}</div>
                  </div>
                </CCol>
                <CCol
                  sm="12"
                  class="mb-2"
                >
                  <CRow class="justify-content-center">
                    <div
                      id="take_photo_camera"
                      v-if="flag_takingPhoto"
                      class="w-100"
                    />
                    <img
                      id="register_photo"
                      v-if="!flag_takingPhoto"
                      :src="value_photoToRegisterToShow"
                      class="w-100 w-img-col object-fit-contain"
                    >
                  </CRow>
                </CCol>
                <CCol
                  sm="12"
                  class="mb-2"
                >
                  <div class="row justify-content-center">
                    <CButton
                      class="btn-outline-primary fz-lg mx-1"
                      style="width: 40%"
                      @click="clickOnPickRegisterPhoto"
                      :disabled="flag_isPickingRegisterPhoto || !canModify()"
                    >
                      <span>{{ $t('SelectPhoto') }}</span>
                    </CButton>

                    <CButton
                      class="btn-outline-primary fz-lg mx-1"
                      style="width: 40%"
                      @click="clickOnTakeRegisterPhoto"
                      :disabled="!flag_haveWebCam || !canModify()"
                    >
                      <span v-if="flag_takingPhoto">{{ $t('UseWebCamPhoto') }}</span>
                      <span v-else>{{ $t('TakePhoto') }}</span>
                    </CButton>
                  </div>
                </CCol>
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
                        >
                          <i
                            class="fa fa-sync"
                          />
                        </CButton>
                      </template>
                    </CSelect>
                  </div>
                </CCol>
              </CRow>
            </CCol>
            <!-- 右欄 -->
            <CCol
              sm="3"
              class="justify-content-center"
            >
              <CRow>
                <CCol sm="12">
                  <div class="h3 row justify-content-center">
                    <div>{{ $t('DisplayPhoto') }}</div>
                  </div>
                </CCol>
                <CCol
                  sm="12"
                  class="mb-2"
                >
                  <CRow class="justify-content-center">
                    <img
                      :src="value_photoToDisplayToShow"
                      class="w-100 w-img-col object-fit-contain"
                    >
                  </CRow>
                </CCol>

                <CCol
                  sm="12"
                  class="mb-2"
                >
                  <div class="row justify-content-center">
                    <CButton
                      class="btn-outline-primary fz-lg mx-1"
                      style="width: 40%"
                      :disabled="flag_isPickingDisplayPhoto"
                      @click="clickOnPickDisplayPhoto"
                    >
                      {{ $t('SelectPhoto') }}
                    </CButton>

                    <CButton
                      class=" fz-lg mx-1"
                      style="width: 40%"
                      :disabled="flag_isPickingDisplayPhoto"
                      @click="clickOnPickDisplayPhoto"
                    />
                  </div>
                </CCol>

                <CCol sm="12">
                  <div class="row justify-content-center" />
                </CCol>
              </CRow>
            </CCol>
            <CCol
              sm="3"
              class="mt-5"
            >
              <div
                class="h5"
                :class="flag_maxDisplayFileSize ? '' : 'invalid-feedback'"
                style="display: block !important;"
              >
                {{ $t('ImageMaximumFileSize') }}
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <CCard
        :class="showOnStep(2)"
        :style="param_cardStyle"
      >
        <CCardBody>
          <div style="height: 220px" />
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('RegisterCompleted') }}
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
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="clickOnPrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="clickOnPrev"
          >
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary fz-lg btn-w-normal"
            @click="clickOnNext"
            :disabled="!(flag_personNamePass && flag_personIdPass && flag_cardNumberPass)"
          >
            {{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>
<script>
import * as faceapi from 'face-api.js';

import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

import Webcam from '../webcam';

const dayjs = require('dayjs');

export default {
  name: 'PersonForm',
  props: {
    formData: Object,
    enableAdminField: Boolean,
    modifyMode: Boolean,
    canModify: { type: Function },
    onFinish: { type: Function },
  },
  data() {
    return {
      obj_loading: null,

      param_cardStyle: 'height: 35rem;',
      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,

      value_allPerson: [],
      value_returnRoutePath: '',
      value_returnRouteName: '',

      flag_currentSetp: 0,
      value_personId: '',
      flag_personIdPass: false,

      value_personName: '',
      flag_personNamePass: false,

      value_cardNumber: '',
      flag_cardNumberPass: false,

      value_emailAddress: '',

      value_department: '',

      value_jobTitle: '',

      value_extensionNumber: '',

      value_phoneNumber: '',

      value_effectiveDate: dayjs(new Date()).format('YYYY-MM-DD'),

      value_expireDate: '',

      value_remarks: '',

      value_asAdmin: false,
      value_asAdminOptions: [
        { value: false, label: this.$t('No') },
        { value: true, label: this.$t('Yes') },
      ],

      value_selectedGroupList: [],

      flag_takingPhoto: false,
      flag_isPickingRegisterPhoto: false,
      flag_haveWebCam: false,
      flag_isPickingDisplayPhoto: false,

      flag_maxRegisterFileSize: true,
      flag_maxDisplayFileSize: true,
      flag_minFaceResolution: true,
      flag_imageHaveClearFace: true,

      value_constraintsList: [],
      value_selectedConstraints: null,

      value_photoToRegisterToShow:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACA'
    + 'AQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      value_photoToDisplayToShow:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACA'
    + 'AQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      value_photoToRegister: '',
      value_photoToDisplay: '',

      value_allGroupsList: [],

      ...this.formData,
    };
  },
  created() {
    faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    this.refreshCamera();
    this.updateSettings();
  },
  updated() {
    if (this.flag_takingPhoto && this.value_selectedConstraints) {
      Webcam.set({
        constraints: this.value_selectedConstraints,
        flip_horiz: true,
        width: 464,
        height: 350,
        dest_width: 640,
        dest_height: 480,
        // crop_width : 300,
        // crop_height : 300,
        image_format: 'jpeg',
        jpeg_quality: 100,
      });
      Webcam.attach('#take_photo_camera');
    }
  },
  methods: {
    // updateSelectedGroupList(g) {
    //   Array.prototype.unique = function() {
    //       var a = this.concat();
    //       for(var i=0; i<a.length; ++i) {
    //           for(var j=i+1; j<a.length; ++j) {
    //               if(a[i] === a[j])
    //                   a.splice(j--, 1);
    //           }
    //       }
    //       return a;
    //   };

    //   this.value_selectedGroupList = this.value_selectedGroupList.concat(this.value_assginedGroupsList).unique()
    // },
    selAsAdmin(e) {
      this.value_asAdmin = e.target.value === 'true';
    },
    refreshCamera() {
      this.value_constraintsList = [];
      Webcam.fetchDeviceList((list) => {
        if (list != null) {
          list.forEach((device) => {
            this.value_constraintsList.push({
              label: device.label,
              constraints: { deviceId: { exact: device.deviceId } },
            });
          });
        }

        if (this.value_constraintsList.length > 0) {
          this.flag_haveWebCam = true;
        }
      });
    },
    async detectFaceAndGetHeadBox(img, cb) {
      const detection = await faceapi.detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }),
      );
      return new Promise((resolve) => {
        let box = null;
        if (detection) {
          const rangeRatio = 2;
          let headWidthToHunt = (detection.box.width < detection.box.height ? detection.box.width : detection.box.height) * rangeRatio;
          let headX = detection.box.x - detection.box.width / 2;
          let headY = detection.box.y - detection.box.height / 1.2;
          if (headX < 0) headX = 0;
          if (headY < 0) headY = 0;
          while (headWidthToHunt + headX > img.width || headWidthToHunt + headY > img.height) {
            headWidthToHunt -= 1;
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
      this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
      const ret = await this.$globalGetGroupList();
      if (ret.error) {
        this.value_allGroupsList = [];
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      } else {
        const list = [];
        // const assginedList = [];
        try {
          ret.group_list.forEach((group) => {
            if (!group.assgined_by_manager) {
              list.push(group.name);
            }
          });

          this.value_allGroupsList = list.filter((item) => {
            let r = true;
            if (item === 'All Person') {
              r = false;
            } else if (item === 'All Visitor') {
              r = false;
            } else {
              r = true;
            }
            return r;
          });
        } catch (e) {
          console.log('parse group_list', e);
        }
      }
      if (this.obj_loading) this.obj_loading.hide();
    },
    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('Register');
        case 2:
          return this.$t('Complete');
        default:
          return this.$t('Next');
      }
    },
    clickOnPrev() {
      this.flag_takingPhoto = false;
      if (Webcam.loaded) Webcam.reset();

      if (this.flag_currentSetp === 0) {
        if (this.value_returnRoutePath.length > 0) {
          this.$router.push({ name: this.value_returnRoutePath });
        } else this.updateSettings();
      } else if (this.flag_currentSetp > 0) this.flag_currentSetp -= 1;
    },
    clickOnNext() {
      this.flag_takingPhoto = false;
      if (Webcam.loaded) Webcam.reset();

      if (this.flag_currentSetp === 0) {
        this.flag_currentSetp = 1;
      } else if (this.flag_currentSetp === 1) {
        this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });

        if (this.onFinish) {
          this.onFinish(
            {
              id: this.value_personId,
              name: this.value_personName,
              card_facility_code: '',
              card_number: this.value_cardNumber,
              begin_date: this.value_effectiveDate,
              expir_date: this.value_expireDate,
              email: this.value_emailAddress,
              register_image: this.value_photoToRegister,
              display_image: this.value_photoToDisplay,
              title: this.value_jobTitle,
              department: this.value_department,
              phone_number: this.value_phoneNumber,
              extension_number: this.value_extensionNumber,
              as_admin: this.value_asAdmin,
              remarks: this.value_remarks,
              group_list: this.value_selectedGroupList,
            },
            (success, result) => {
              if (this.obj_loading) this.obj_loading.hide();
              if (result && result.message === 'ok') {
                this.flag_currentSetp = 2;
              } else {
                // this.$alert( this.disp_registerFailed + ' : ' + ( result && result.message ? result.message : 'network loss') );
                this.$fire({
                  text: this.$t('RegisterFailed'),
                  type: 'error',
                  timer: 3000,
                  confirmButtonColor: '#20a8d8',
                });
              }
            },
          );
        } else {
          if (this.obj_loading) this.obj_loading.hide();
          this.flag_currentSetp = 2;
        }
      } else {
        // this.flag_currentSetp = 0;
        // let d = Object.assign({}, defaultlState(), this.formData);
        // Object.assign(this.$data, d);
        // this.updateSettings();
        this.$router.push({ name: this.value_returnRoutePath });
        // let merged = {...obj1, ...obj2};
      }
    },

    selectPhotoFromFile(from, cb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onclick = function (e) {
        if (e.target.value.length === 0) {
          if (cb) cb(null);
        }
      };
      input.onchange = function (e) {
        const file = e.target.files[0];
        const mb = file.size / 1024 / 1024;

        if (mb >= 10) {
          if (from == 'REGISTER') {
            this.flag_maxRegisterFileSize = false;
          } else {
            this.flag_maxDisplayFileSize = false;
          }
        } else {
          this.flag_maxRegisterFileSize = true;
          this.flag_maxDisplayFileSize = true;
        }

        if (this.flag_maxRegisterFileSize && this.flag_maxDisplayFileSize) {
          const reader = new FileReader();
          reader.readAsDataURL(file, 'UTF-8');
          reader.onload = async (readerEvent) => {
            const img = document.createElement('img');
            img.src = readerEvent.target.result;

            if (cb) cb(img);
          };
        } else if (cb) cb(null);
      };
      input.click();
    },
    clickOnPickRegisterPhoto() {
      this.flag_isPickingRegisterPhoto = true;
      this.selectPhotoFromFile('REGISTER', (img) => {
        if (img) {
          // this.obj_loading = this.$loading.show( {container: this.$refs.formContainer});
          this.detectFaceAndGetHeadBox(img, (box) => {
            if (box) {
              this.flag_imageHaveClearFace = true;

              if (box.width < 200 || box.height < 200) {
                this.flag_minFaceResolution = false;
              } else {
                this.flag_minFaceResolution = true;
              }

              if (this.flag_minFaceResolution) {
                try {
                  const canvas = document.createElement('canvas');
                  // canvas.x = 0;
                  // canvas.y = 0;
                  // canvas.width = 200;
                  // canvas.height = 200;
                  // let ctx = canvas.getContext('2d');
                  // ctx.drawImage( img, box.x, box.y, box.width, box.height, 0, 0, 500, 500 );
                  // canvas
                  //   .getContext('2d')
                  //   .drawImage(img, box.x, box.y, box.width, box.height, 0, 0, 200, 200);
                  canvas.x = 0;
                  canvas.y = 0;
                  canvas.width = 240;
                  canvas.height = 240;
                  canvas
                    .getContext('2d')
                    .drawImage(img, 0, 0, img.width, img.height, 0, 0, 240, 240);
                  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
                  this.value_photoToRegister = dataUrl.replace(
                    /^data:image\/[a-z]+;base64,/,
                    '',
                  );
                  this.value_photoToRegisterToShow = dataUrl;
                } catch (e) {
                  console.log('drawImage', e);
                }
              }
            } else {
              this.flag_imageHaveClearFace = false;
            }
            // if( this.obj_loading ) this.obj_loading.hide();
          });
        }
        this.flag_isPickingRegisterPhoto = false;
      });
      this.flag_takingPhoto = false;
      try {
        Webcam.reset();
      } catch (e) {
        console.log('Webcam.reset', e);
      }
    },
    clickOnTakeRegisterPhoto() {
      if (this.flag_takingPhoto) {
        // this.obj_loading = this.$loading.show( {container: this.$refs.formContainer});
        Webcam.snap((dataUri) => {
          const img = new Image();
          img.src = dataUri;
          this.flag_takingPhoto = false;
          try {
            Webcam.reset();
          } catch (e) {
            console.log('Webcam.reset', e);
          }
          this.detectFaceAndGetHeadBox(img, (box) => {
            if (box) {
              try {
                const canvas = document.createElement('canvas');
                canvas.x = 0;
                canvas.y = 0;
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, 200, 200);
                const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
                this.value_photoToRegister = dataUrl.replace(
                  /^data:image\/[a-z]+;base64,/,
                  '',
                );
                this.value_photoToRegisterToShow = dataUrl;
              } catch (e) {
                console.log('canvas', e);
              }
            }
            // if( this.obj_loading ) this.obj_loading.hide();
          });
        });
      } else {
        Webcam.on('live', () => {
          if (this.obj_loading) this.obj_loading.hide();
        });
        Webcam.on('error', () => {
          if (this.obj_loading) this.obj_loading.hide();
        });
        this.flag_takingPhoto = !this.flag_takingPhoto;
      }
    },
    clickOnPickDisplayPhoto() {
      this.flag_isPickingDisplayPhoto = true;
      this.selectPhotoFromFile('DISPLAY', (img) => {
        if (img) {
          this.obj_loading = this.$loading.show({ container: this.$refs.formContainer });
          this.resizeImageFromDataURL(null, img.src, 200, 200, (basr64Img) => {
            const dataUrl = basr64Img;
            this.value_photoToDisplay = dataUrl.replace(
              /^data:image\/[a-z]+;base64,/,
              '',
            );
            this.value_photoToDisplayToShow = dataUrl;
            if (this.obj_loading) this.obj_loading.hide();
          });
        }
        this.flag_isPickingDisplayPhoto = false;
      });
    },

    showOnStep(step) {
      return step === this.flag_currentSetp ? 'd-block' : 'd-none';
    },

    personNameValidator(val) {
      this.test = this.value_personName;
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_personNamePass = false;
      } else this.flag_personNamePass = val.length > 0;
      return this.flag_personNamePass;
    },
    personIdValidator(val) {
      // if (!/^[a-zA-Z0-9]/.test(val)) {
      //   return false;
      // }
      const exist = this.value_allPerson.filter((p) => p.id === val);

      if (this.value_personUuid) {
        if (exist.length >= 1) {
          if (exist[0].uuid !== this.value_personUuid) {
            return false;
          }
        }
      } else if (exist.length >= 1) {
        return false;
      }

      this.flag_personIdPass = val.length >= 4;
      return this.flag_personIdPass;
    },

    cardNumberValidator(val) {
      if (val.length !== 0) {
        if (!/^[a-zA-Z0-9]+$/.test(val)) {
          return false;
        }

        const exist = this.value_allPerson.filter((p) => p.card_number === val);

        if (this.value_personUuid) {
          if (exist.length >= 1) {
            if (exist[0].uuid !== this.value_personUuid) {
              return false;
            }
          }
        } else if (exist.length >= 1) {
          return false;
        }
      }
      this.flag_cardNumberPass = val.length <= 20;
      return this.flag_cardNumberPass;
    },
    resizeImageFromDataURL(box, base64Str, maxWidth, maxHeight, callBack) {
      // We create an image to receive the Data URI
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.x = 0;
          canvas.y = 0;
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext('2d');
          if (box) {
            ctx.drawImage(
              img,
              box.x,
              box.y,
              box.width,
              box.height,
              0,
              0,
              maxWidth,
              maxHeight,
            );
          } else {
            let rW = (img.width * 100) / maxWidth;
            let rH = (img.height * 100) / maxHeight;

            const r = Math.max(rW, rH) / 100;

            rW = Math.floor(img.width / r);
            rH = Math.floor(img.height / r);
            const sx = Math.floor((maxWidth - rW) / 2);
            const sy = Math.floor((maxHeight - rH) / 2);
            ctx.drawImage(img, sx, sy, rW, rH);
            // ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, maxWidth, maxHeight);
          }
          if (callBack) callBack(canvas.toDataURL('image/jpeg', 1.0));
        } catch (e) {
          if (callBack) callBack(null);
        }
      };
    },
    selWebcam(e) {
      this.value_constraintsList.forEach((d) => {
        if (d.label === e.target.value) {
          this.value_selectedConstraints = d.constraints;
        }
      });
    },
    getWebcamList() {
      const list = [];
      this.value_constraintsList.forEach((d) => {
        if (this.value_selectedConstraints == null) {
          this.value_selectedConstraints = d.constraints;
        }
        list.push(d.label);
      });
      return list; // this.value_constraintsList;
    },
  },
  components: {
    stepprogress: StepProgress,
    multiselect: Multiselect,
  },
};
</script>
