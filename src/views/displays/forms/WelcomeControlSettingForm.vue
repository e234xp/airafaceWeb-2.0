<template>
  <div>
    <CRow>
      <CCol sm="12">
        <div class="h1 mb-5">{{ disp_header }}</div>
        <stepprogress class="w-step-progress-5" :active-thickness="param_activeThickness"
          :passive-thickness="param_passiveThickness" :active-color="param_activeColor"
          :passive-color="param_passiveColor" :steps="[
          disp_inputCompanyInfo,
          disp_digitalSignage,
          disp_personnelInfo,
          disp_complete,
        ]" :current-step="flag_currentSetp" :line-thickness="param_lineThickness" icon-class="fa fa-check">
        </stepprogress>
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="6">
        <div :class="showOnStep(0)">
          <CCard>
            <CCardHeader>{{ disp_backgroundimage }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ disp_chooseFile }}
                    <input ref="uploadBackgroundFile" type="file" :multiple="false" style="display: none"
                      @change="onBackgroundUploadFiles" :disabled="flag_backgrounduploading" />
                  </label>
                </CCol>
                <CCol sm="9">
                  <img id="backgroundImage" :src="value_welcomeSetting.background_image"
                    class="w-100 object-fit-contain background-size-cover img-default-bg h-col-lg" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>{{ disp_companyLogo }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <label class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center">
                    {{ disp_chooseFile }}
                    <input ref="uploadLogoFile" type="file" :multiple="false" style="display: none"
                      @change="onLogoUploadFiles" :disabled="flag_logouploading" />
                  </label>
                </CCol>
                <CCol sm="9">
                  <img id="logoImage" :src="value_welcomeSetting.logo" style="
                    margin: auto;
                    height: 80px;
                    object-fit: contain;
                    background-color: #ebedef;
                  " class="w-100" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
        <div :class="showOnStep(1)">
          <CCard>
            <CCardHeader>
              <CSwitch size="lg" color="success" shape="pill" :checked="value_welcomeSetting.enabledGreetingMode"
                @update:checked="value_welcomeSetting.enabledGreetingMode = !value_welcomeSetting.enabledGreetingMode;
                value_welcomeSetting.enabledAdvertisingMode = !value_welcomeSetting.enabledGreetingMode;" />
              <span class="h5 ml-2 my-0">{{ disp_greetingMode }}</span>
            </CCardHeader>
            <CCardBody>
              <fieldset :disabled="!value_welcomeSetting.enabledGreetingMode">
                <CRow>
                  <CCol sm="4">
                    <div class="column-space-between">
                      <div class="h5">{{ disp_caption }}</div>
                      <CInput size="lg" v-model="value_welcomeSetting.caption" />
                    </div>
                  </CCol>
                  <CCol sm="2">
                    <div class="column-space-between">
                      <div class="h5">{{ disp_captionSize }}</div>
                      <CInput size="lg" v-model="value_welcomeSetting.captionSize" />
                    </div>
                  </CCol>
                  <CCol sm="4">
                    <div class="column-space-between">
                      <div class="h5">{{ disp_greeting }}</div>
                      <CInput size="lg" v-model="value_welcomeSetting.greeting" />
                    </div>
                  </CCol>
                  <CCol sm="2">
                    <div class="column-space-between">
                      <div class="h5">{{ disp_greetingSize }}</div>
                      <CInput size="lg" v-model="value_welcomeSetting.greetingSize" />
                    </div>
                  </CCol>
                </CRow>
              </fieldset>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>
              <CSwitch size="lg" color="success" shape="pill" :checked="value_welcomeSetting.enabledAdvertisingMode"
                @update:checked="
          value_welcomeSetting.enabledAdvertisingMode = !value_welcomeSetting.enabledAdvertisingMode;
          value_welcomeSetting.enabledGreetingMode = !value_welcomeSetting.enabledAdvertisingMode;
            " />
              <span class="h5 ml-2 my-0">{{ disp_advertisingMode }}</span>
            </CCardHeader>
            <CCardBody>
              <fieldset :disabled="!value_welcomeSetting.enabledAdvertisingMode">
                <CRow>
                  <CCol sm="3">
                    <div class="h5">{{ disp_advertisingDuration }}</div>
                    <CInput size="lg" v-model="value_welcomeSetting.advertisingDuration" />
                  </CCol>
                  <CCol sm="3" v-for="(value, idx) in value_welcomeSetting.advertising">
                    <img :id="`advertisingimage${idx}`" :src="value" :key="componentKey"
                      class="w-100 mb-2 d-block img-upload-block object-fit-contain" />
                    <div class="d-flex justify-content-between mb-3">
                      <CButton variant="outline" class="btn btn-outline-primary mb-3"
                        @click="clickOnPickAdvertisingImage(idx)" :disabled="flag_isPickingRegisterPhoto">
                        <span>{{ disp_selectPhoto }}</span>
                      </CButton>
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <CButton variant="outline" class="btn btn-outline-primary mb-3"
                        @click="clickOnRemoveAdvertisingImage(idx)" :disabled="!value">
                        <span>{{ disp_deletePhoto }}</span>
                      </CButton>
                    </div>
                  </CCol>

                </CRow>
              </fieldset>
            </CCardBody>
          </CCard>
        </div>
        <div :class="showOnStep(2)">
          <CCard>
            <CCardHeader>{{ disp_PersonalDisplay }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <div class="h5">{{ disp_displayPhoto }}</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.displayPhoto"
                    :options="value_displayPhotoList" />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_LineAttribute }} 1</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.line1" :options="value_displayAttributeList" />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_LineAttribute }} 2</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.line2" :options="value_displayPrimaryList" />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_LineAttribute }} 3</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.line3" :options="value_displayAttributeList" />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">{{ disp_LineAttribute }} 4</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.line4" :options="value_displayAttributeList" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>{{ disp_PageDisplay }}</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm="3">
                  <div class="h5">{{ disp_welcomeWord }}</div>
                  <CInput size="lg" v-model="value_welcomeSetting.welcomeword" />
                </CCol>
                <CCol sm="9">
                  <div class="h5">{{ disp_mainTitle }}</div>
                  <CInput size="lg" v-model="value_welcomeSetting.maintitle" />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">{{ disp_subTitle }}</div>
                  <CInput size="lg" v-model="value_welcomeSetting.subtitle" />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_NumberOfDisplayPersons }}</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.numberOfDisplayPersons" :options="[1,2,3,4]" />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_duration }}</div>
                  <CSelect size="lg" :value.sync="value_welcomeSetting.showDuration" :options="[5,10,15,20,30]" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
      <CCol sm="6" v-show="flag_currentSetp==0||flag_currentSetp==1||flag_currentSetp==2">
        <table width="590" height="332" :style="`background-image: url('${value_welcomeSetting.background_image}')`"
          style="background-size: 100% 100%; background-repeat: no-repeat; background-position: center;">
          <tr>
            <td height="46"><img :src="`${value_welcomeSetting.logo}`"
                style="width:60px; height:25px; padding-left: 15px;" /></td>
          </tr>
          <tr>
            <td align="center" valign="top" height="30" style="font-family: 'Noto Sans TC'; color: #FFBE5C;">
              {{value_welcomeSetting.welcomeword }}</td>
          </tr>
          <tr>
            <td align="center" valign="top" height="30" style="font-family: 'Noto Sans TC'; color: #FFFFFF;">
              {{value_welcomeSetting.maintitle }}</td>
          </tr>
          <tr>
            <td align="center" height="100%">
              <div style="display: flex; justify-content: center;">
                <span v-for=" n in value_welcomeSetting.numberOfDisplayPersons"
                  style="flex-direction: column; align-items: center; width: 135px;">
                  <img v-show="value_welcomeSetting.displayPhoto!='NONE'" src="@/assets/img/welcomeSample.jpg"
                    width="95px" height="95px" />
                  <div class="welcome-card-text-box1">
                    <div v-show="value_welcomeSetting.line1!='NONE'" style="color: white;">
                      {{value_welcomeSetting.line1}}</div>
                    <div v-show="value_welcomeSetting.line2!='NONE'" style="color: white; font-size:16px">
                      {{value_welcomeSetting.line2 }}</div>
                    <div v-show="value_welcomeSetting.line3!='NONE'" style="color: white;">
                      {{value_welcomeSetting.line3}}</div>
                    <div v-show="value_welcomeSetting.line4!='NONE'" style="color: white; font-size:10px">
                      {{value_welcomeSetting.line4 }}</div>
                  </div>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" valign="bottom" style="font-family: 'Noto Sans TC'; 
            color: #FFFFFF;">{{value_welcomeSetting.subtitle }}</td>
          </tr>
        </table>
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="12">
        <!-- <div style="text-align: right"> -->
        <div class="row justify-content-center">
          <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
            <CButton variant="outline" style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8" size="lg"
              @click="clickOnPrev">{{ value_returnRouteName }}
            </CButton>
          </div>
          <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2">
            <CButton variant="outline" style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8" size="lg"
              @click="clickOnPrev">{{ disp_previous }}
            </CButton>
          </div>
          <div style="width: 20px"></div>
          <div>
            <CButton class="btn btn-primary mb-3" size="lg" @click="clickOnNext">{{ nextButtonName() }}
            </CButton>
          </div>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from "@/i18n";

  import StepProgress from "vue-step-progress";
  // import "vue-step-progress/dist/main.css";
  import "@/airacss/vue-step-progress.css";

  import Multiselect from "vue-multiselect";
  //import "vue-multiselect/dist/vue-multiselect.min.css";
  import "@/airacss/vue-multiselect.css";

  import VueScheduler from "@duoa/vue-scheduler";
  import "@/airacss/vue-scheduler.css";
  //import '@duoa/vue-scheduler/dist/vue-scheduler.css'

  import { backgroundImage, airalogo } from "@/utils/welcomeMode";

  const defaultlState = () => {
    return {
      obj_loading: null,

      param_cardStyle: "height: 35rem;", //
      param_activeColor: "#6baee3", //
      param_passiveColor: "#919bae", //
      param_lineThickness: 3, //
      param_activeThickness: 3, //
      param_passiveThickness: 3, //

      disp_header: i18n.formatter.format("ModifyWelcomeControl"),

      disp_noEmptyNorSpaceNeigherRepeat: i18n.formatter.format(
        "NoEmptyNorSpaceNeigherRepeat"
      ), //
      disp_select: i18n.formatter.format("Select"), //
      disp_selected: i18n.formatter.format("Selected"), //
      disp_deselect: i18n.formatter.format("Deselect"), //

      disp_inputCompanyInfo: i18n.formatter.format("CompanyInfo"), //
      // disp_inputAnnouncement: i18n.formatter.format("Announcement"), //
      disp_digitalSignage: i18n.formatter.format("DigitalSignage"), //
      disp_personnelInfo: i18n.formatter.format("PersonnelInfo"), //
      disp_complete: i18n.formatter.format("Complete"), //

      disp_backgroundimage: i18n.formatter.format("BackgroundImage"), //
      disp_chooseFile: i18n.formatter.format("ChooseFile"), //
      disp_companyLogo: i18n.formatter.format("Logo"), //
      // disp_companyName: i18n.formatter.format("CompanyName"), //
      // disp_companyColor: i18n.formatter.format("Color"), //
      // disp_companyFont: i18n.formatter.format("Font"), //
      // disp_companyFontSize: i18n.formatter.format("FontSize"), //

      // disp_announcement: i18n.formatter.format("Announcement"), //

      disp_greetingMode: i18n.formatter.format("GreetingMode"), //
      disp_advertisingMode: i18n.formatter.format("AdvertisingMode"), //
      disp_caption: i18n.formatter.format("Caption"), //
      disp_captionSize: i18n.formatter.format("FontSize"), //
      disp_greeting: i18n.formatter.format("Greeting"), //
      disp_greetingSize: i18n.formatter.format("FontSize"), //

      disp_advertisingDuration: i18n.formatter.format("Duration"), //

      disp_PersonalDisplay: i18n.formatter.format("PersonalDisplay"), //

      disp_selectPhoto: i18n.formatter.format("SelectPhoto"), //
      disp_deletePhoto: i18n.formatter.format("DeletePhoto"), //

      disp_LineAttribute: i18n.formatter.format("DisplayAttribute"), //

      disp_PageDisplay: i18n.formatter.format("PageDisplay"), //
      disp_welcomeWord: i18n.formatter.format("WelcomeGreeting"), //
      disp_mainTitle: i18n.formatter.format("Maintitle"), //
      disp_subTitle: i18n.formatter.format("Subtitle"), //
      disp_NumberOfDisplayPersons: i18n.formatter.format("NumberOfDisplayPersons"), //
      disp_duration: i18n.formatter.format("Duration"), //

      disp_enabledMask: i18n.formatter.format("EnabledMask"), //
      disp_displayPhoto: i18n.formatter.format("DisplayPhoto"), //
      disp_displayGroup: i18n.formatter.format("DisplayGroup"), //
      disp_personInfo: i18n.formatter.format("PersonInfo"), //
      disp_messageDuration: i18n.formatter.format("Duration"), //

      value_displayPhotoList: [
        { value: "NONE", label: i18n.formatter.format("None") },
        { value: "REGISTER", label: i18n.formatter.format("RegisterPhoto") },
        { value: "SNAPSHOT", label: i18n.formatter.format("CapturedPhoto") },
        { value: "DISPLAY", label: i18n.formatter.format("DisplayPhoto") },
      ],

      value_displayPrimaryList: [
        { value: "NONE", label: i18n.formatter.format("None") },
        { value: "NAME", label: i18n.formatter.format("PersonName") },
        { value: "PARTIALNAME", label: i18n.formatter.format("PartialName") },
      ],

      value_displayAttributeList: [
        { value: "NONE", label: i18n.formatter.format("None") },
        { value: "ID", label: i18n.formatter.format("PersonId") },
        { value: "DEPARTMENT", label: i18n.formatter.format("Department") },
        { value: "JOBTITLE", label: i18n.formatter.format("JobTitle") },
        { value: "GROUP", label: i18n.formatter.format("GroupName") },

      ],

      // value_displayGroupList: [],
      // value_displayChannelList: [],

      flag_backgrounduploading: false,
      flag_logouploading: false,
      flag_isPickingRegisterPhoto: false,

      componentKey: 0,

      value_Setting: {},
      value_welcomeSetting: {
        displayMode: "WELCOME",
        uuid: "",
        background_image: backgroundImage,
        logo: airalogo,

        displayPhoto: "REGISTER", // NONE, REGISTER, SNAPSHOT, DISPLAY
        line1: "JOBTITLE",         // NONE, JOBTITLE, ORGNIZATION, GROUP, DEPARTMENT 
        line2: "NAME",             // NONE, NAME, PARTIALNAME
        line3: "GROUP",            // NONE, JOBTITLE, ORGNIZATION, GROUP, DEPARTMENT 
        line4: "NONE",             // NONE, JOBTITLE, ORGNIZATION, GROUP, DEPARTMENT 
        welcomeword: "Welcome",
        maintitle: "2023 Product launch",
        subtitle: "aira Corporation",
        numberOfDisplayPersons: 4,
        showDuration: 10,

        enabledGreetingMode: true,
        caption: "人臉辨識影像解決方案",
        captionSize: 125,
        greeting: "歡迎您的蒞臨",
        greetingSize: 110,
        enabledAdvertisingMode: false,
        advertisingDuration: 15,
        advertising: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg=="]
      },

      // value_welcomeSettingUuid: "",
      // value_backgroundimage: backgroundImage,
      // value_logoimage: airalogo,

      // value_companyName: "城智科技股份有限公司",
      // value_companyColor: "#fafafa",
      // value_companyFont: "微軟正黑體",
      // value_companyFontSize: 115,

      // value_groupsNameList: [], //

      // value_announcements1: "AI + Era = aira",
      // value_announcements2: "眾志成城 智慧科技",
      // value_announcements3: "Bring AI to Life",
      // value_announcements4: "可以落地的解決方案",
      // value_announcements5: "AIRA Corporation",
      // value_announcements6: "城智科技股份有限公司",
      // value_announcements7: "",
      // value_announcements8: "",

      // value_Caption: "人臉辨識影像解決方案",
      // value_CaptionSize: 125,
      // value_Greeting: "歡迎您的蒞臨",
      // value_GreetingSize: 110,

      // value_enableGreetingMode: true,
      // value_enableAdvertisingMode: false,

      // value_advertisingDuration: 15,

      // value_advertisingimage1: "",
      // value_advertisingimage2: "",
      // value_advertisingimage3: "",
      // value_advertisingimage4: "",
      // value_advertisingimage5: "",
      // value_advertisingimage6: "",
      // value_advertisingimage7: "",

      // value_enabledMask: false,
      // value_displayPhoto: "REGISTER",
      // value_displayGroup: ["All Person", "All Visitor"],
      // // value_entryChannel: [],
      // // value_exitChannel: [],

      // value_messageDuration: 10,

      // value_areaA: "",
      // value_areaASize: 80,
      // value_areaB: "GroupName",
      // value_areaBSize: 80,
      // value_areaC: "Department",
      // value_areaCSize: 80,
      // value_areaD: "PersonName",
      // value_areaDSize: 120,
      // value_areaE: "JobTitle",
      // value_areaESize: 120,

      disp_create: i18n.formatter.format("Create"),
      disp_modify: i18n.formatter.format("Modify"),
      disp_saveChanges: i18n.formatter.format("SaveChanges"),
      disp_registerCompleted: i18n.formatter.format("RegisterCompleted"),
      disp_previous: i18n.formatter.format("Previous"),
      disp_next: i18n.formatter.format("Next"),

      value_returnRoutePath: "",
      value_returnRouteName: i18n.formatter.format("Return"),
      value_group_list: [],

      flag_currentSetp: 0, //
    };
  };
  export default {
    name: "WelcomeControlSettingForm",
    props: {
      formData: Object,
      onFinish: { type: Function },
    },
    data() {
      return Object.assign({}, defaultlState(), this.formData);
    },
    created() { },
    async mounted() {
      const self = this;

      self.$globalGetDisplaySetting(function (err, data) {
        if (!err) {
          self.value_Setting = data || {};
          self.welcome = self.value_Setting["WELCOME"];

          self.value_welcomeSetting.uuid = makeid(32);
          self.value_welcomeSetting = Object.assign({}, self.value_welcomeSetting, self.welcome);
        }
      });
    },
    updated() { },
    beforeRouteEnter(to, from, next) {
      next();
    },
    beforeRouteLeave(to, from, next) {
      next();
    },
    watch: {},
    methods: {
      makeid(length) {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      },
      onBackgroundUploadFiles(event) {
        const self = this;

        let file = this.$refs.uploadBackgroundFile.files[0];
        if (file == null) return;

        let myReader = new FileReader();
        myReader.onloadend = async (e) => {
          self.value_welcomeSetting.background_image = myReader.result;
        };
        myReader.readAsDataURL(file);
      },
      onLogoUploadFiles(event) {
        const self = this;

        let file = this.$refs.uploadLogoFile.files[0];
        if (file == null) return;

        let myReader = new FileReader();
        myReader.onloadend = async (e) => {
          self.value_welcomeSetting.logo = myReader.result;
        };
        myReader.readAsDataURL(file);
      },

      clickOnPickAdvertisingImage(idx) {
        const self = this;

        self.flag_isPickingRegisterPhoto = true;
        self.selectPhotoFromFile(function (img) {
          if (img) {
            self.value_welcomeSetting.advertising[idx] = img.src;
            self.componentKey++;
          }
        });
        self.flag_isPickingRegisterPhoto = false;
      },

      clickOnRemoveAdvertisingImage(idx) {
        const self = this;

        self.value_welcomeSetting.advertising[idx] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
        self.componentKey--;
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

      nextButtonName() {
        switch (this.flag_currentSetp) {
          case 0:
            return this.disp_next;
          case 1:
            return this.disp_next;
          case 2:
            return this.disp_next;
          case 3:
            return this.disp_saveChanges;
          default:
            return this.disp_complete;
        }
      },
      clickOnPrev() {
        const self = this;
        if (self.flag_currentSetp == 0) {
          if (self.value_returnRoutePath.length > 0) {
            self.$router.push({ name: self.value_returnRoutePath });
          }
        } else if (self.flag_currentSetp > 0) self.flag_currentSetp--;
      },
      clickOnNext() {
        const self = this;
        if (self.flag_currentSetp == 0) {
          self.flag_currentSetp = 1;
        } else if (self.flag_currentSetp == 1) {
          self.flag_currentSetp = 2;
        } else if (self.flag_currentSetp == 2) {
          if (self.onFinish) {
            self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

            let sendData = {
              displayMode: "WELCOME",
              uuid: self.value_welcomeSetting.uuid,
              background_image: self.value_welcomeSetting.background_image,
              logo: self.value_welcomeSetting.logo,
              displayPhoto: self.value_welcomeSetting.displayPhoto,
              line1: self.value_welcomeSetting.line1,
              line2: self.value_welcomeSetting.line2,
              line3: self.value_welcomeSetting.line3,
              line4: self.value_welcomeSetting.line4,

              welcomeword: self.value_welcomeSetting.welcomeword,
              maintitle: self.value_welcomeSetting.maintitle,
              subtitle: self.value_welcomeSetting.subtitle,
              numberOfDisplayPersons: self.value_welcomeSetting.numberOfDisplayPersons ? +self.value_welcomeSetting.numberOfDisplayPersons : 4,
              showDuration: self.value_welcomeSetting.showDuration ? +self.value_welcomeSetting.showDuration : 10,

              enabledGreetingMode: self.value_welcomeSetting.enabledGreetingMode,
              caption: self.value_welcomeSetting.caption,
              captionSize: self.value_welcomeSetting.captionSize,
              greeting: self.value_welcomeSetting.greeting,
              greetingSize: self.value_welcomeSetting.greetingSize,
              enabledAdvertisingMode: self.value_welcomeSetting.enabledAdvertisingMode,
              advertisingDuration: self.value_welcomeSetting.advertisingDuration,
              advertising: self.value_welcomeSetting.advertising
            };

            self.value_Setting["WELCOME"] = sendData;

            self.onFinish(self.value_Setting, function (success, result) {
              if (self.obj_loading) self.obj_loading.hide();
              if (success) {
                self.flag_currentSetp = 3;
              } else {
                //self.$alert( self.disp_registerFailed + " : " + ( result && result.message ? result.message : "network loss") );
                self.$fire({
                  text: i18n.formatter.format("Failed"),
                  type: "error",
                  timer: 3000,
                  confirmButtonColor: "#20a8d8",
                });
              }
            });
          } else self.flag_currentSetp = 0;
        } else {
          // self.$router.push({ name: self.value_returnRoutePath })
          self.flag_currentSetp = 0;
        }
      },


      showOnStep(step) {
        return step == this.flag_currentSetp ? "d-block" : "d-none";
      },
      redrawOnStep(step) {
        return step == this.flag_currentSetp ? "display:block" : "height:15px;display:none";
      },
    },
    components: {
      stepprogress: StepProgress,
      multiselect: Multiselect,
      scheduler: VueScheduler,
    },
  };
</script>