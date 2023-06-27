<template>
  <div>
    <CCol sm="12">
      <div class="h1 mb-5">{{ disp_header }}</div>
      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :steps="[disp_inputCompanyInfo, disp_personnelInfo, disp_complete]"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        icon-class="fa fa-check"
      >
      </stepprogress>
    </CCol>
    <CCol sm="12">
      <div :class="showOnStep(0)">
        <CCard>
          <CCardBody>
            <!-- <div style="height:50px;"></div> -->
            <CCol sm="12">
              <CRow>
                <div class="w-25">
                  <div class="h5">{{ disp_backgroundimage }}</div>
                  <label
                    type="button"
                    class="btn btn-primary mt-3 fz-lg d-flex align-items-center justify-content-center"
                  >
                    {{ disp_chooseFile }}
                    <input
                      ref="uploadBackgroundFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onBackgroundUploadFiles"
                      :disabled="flag_backgrounduploading"
                      class="text-wrap w-100"
                    />
                  </label>
                </div>
                <div class="w-25 px-3">
                  <img
                    id="backgroundImage"
                    :src="value_backgroundimage"
                    class="w-100 object-fit-contain background-size-cover img-default-bg h-col-lg"
                  />
                </div>
                <div class="w-25">
                  <div class="h5">{{ disp_companyLogo }}</div>
                  <label
                    type="button"
                    class="btn btn-primary mt-3 fz-md d-flex align-items-center justify-content-center"
                  >
                    {{ disp_chooseFile }}
                    <input
                      ref="uploadLogoFile"
                      type="file"
                      :multiple="false"
                      style="display: none"
                      @change="onLogoUploadFiles"
                      :disabled="flag_logouploading"
                    />
                  </label>
                  <!-- <pre class="language-json"><code>{{ value  }}</code></pre> -->
                </div>
                <div class="w-25 px-3">
                  <img
                    id="logoImage"
                    :src="value_logoimage"
                    style="
                      margin: auto;
                      height: 80px;
                      object-fit: contain;
                      background-color: #ebedef;
                    "
                    class="w-100"
                  />
                </div>
              </CRow>
              <CRow>
                <CCol sm="12">
                  <div class="h5">{{ disp_companyName }}</div>
                  <CInput size="lg" v-model="value_companyName" />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="3">
                  <div class="h5">{{ disp_companyColor }}</div>
                  <CInput size="lg" v-model="value_companyColor" readonly>
                    <template #append-content>
                      <input
                        type="color"
                        v-model="value_companyColor"
                        style="padding: 0px !important; height: 40px"
                      />
                    </template>
                  </CInput>
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_companyFont }}</div>
                  <CSelect
                    size="lg"
                    :value.sync="value_companyFont"
                    :options="value_fontList"
                  />
                </CCol>
                <CCol sm="3">
                  <div class="h5">{{ disp_companyFontSize }}</div>
                  <CInput size="lg" v-model="value_companyFontSize" />
                </CCol>
              </CRow>
              <!-- <div style="height:20px;"></div> -->
            </CCol>
          </CCardBody>
        </CCard>
      </div>
      <div :class="showOnStep(1)">
        <CCard>
          <CCardBody>
            <CRow>
              <CCol sm="12">
                <div class="h5">{{ disp_enabledMask }}</div>
                <CSwitch
                  size="lg"
                  color="success"
                  shape="pill"
                  :checked="value_enabledMask"
                  @update:checked="value_enabledMask = !value_enabledMask"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="6">
                <div class="h5">{{ disp_personInfo }}</div>
                <CRow>
                  <CCol sm="12">
                    <CSelect
                      size="lg"
                      :value.sync="value_areaA"
                      :options="value_displayAttributeList"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol sm="12">
                    <CSelect
                      size="lg"
                      :value.sync="value_areaB"
                      :options="value_displayAttributeList"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol sm="12">
                    <CSelect
                      size="lg"
                      :value.sync="value_areaC"
                      :options="value_displayAttributeList"
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_displayPhoto }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_displayPhoto"
                  :options="value_displayPhotoList"
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_displayGroup }}</div>
                <multiselect
                  v-model="value_displayGroup"
                  placeholder=""
                  :options="value_displayGroupList"
                  :multiple="true"
                  :taggable="true"
                  :hideSelected="true"
                  :select-label="disp_select"
                  :selected-label="disp_selected"
                  :deselect-label="disp_deselect"
                  :show-no-options="false"
                >
                </multiselect>
              </CCol>

              <!-- <CCol sm="3">
                <div class="h5">{{ disp_entryChannel }}</div>
                <CSelect size="lg" :value.sync="value_entryChannel" :options="value_displayChannelList" />
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_exitChannel }}</div>
                <CSelect size="lg" :value.sync="value_exitChannel" :options="value_displayChannelList" />
              </CCol> -->
            </CRow>
            <CRow>
              <CCol sm="3">
                <div class="h5">{{ disp_temperature }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_temperature"
                  :options="value_displayTemperatureList"
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_messageDuration }}</div>
                <CInput size="lg" v-model="value_messageDuration" />
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_resetTime }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_resetTime"
                  :options="value_displayResetTime"
                />
              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_maxStayDuration }}</div>
                <CInput size="lg" v-model="value_maxStayDuration" />
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="3">
                <div class="h5">{{ disp_cardSortBy }}</div>
                <CSelect
                  size="lg"
                  :value.sync="value_cardSortBy"
                  :options="value_displaySortByList"
                />
              </CCol>
            </CRow>
            <!-- <CRow>
              <CCol sm="3">
                <div class="h5">{{ disp_abnormalColor }}</div>
                <CInput size="lg" v-model="value_abnormalColor" readonly>
                  <template #append-content>
                    <input type="color" v-model="value_abnormalColor" style="padding: 0px !important; height: 40px;" />
                  </template>
                </CInput>

              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_enteredColor }}</div>
                <CInput size="lg" v-model="value_enteredColor" readonly>
                  <template #append-content>
                    <input type="color" v-model="value_enteredColor" style="padding: 0px !important; height: 40px;" />
                  </template>
                </CInput>

              </CCol>
              <CCol sm="3">
                <div class="h5">{{ disp_exitedColor }}</div>
                <CInput size="lg" v-model="value_exitedColor" readonly>
                  <template #append-content>
                    <input type="color" v-model="value_exitedColor" style="padding: 0px !important; height: 40px;" />
                  </template>
                </CInput>
              </CCol>
            </CRow> -->
          </CCardBody>
        </CCard>
      </div>
    </CCol>
    <CCol sm="12">
      <!-- <div style="text-align: right"> -->
      <div class="row justify-content-center">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            variant="outline"
            style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
            size="lg"
            @click="clickOnPrev"
            >{{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1">
          <CButton
            variant="outline"
            style="width: 150px; color: #20a8d8; border: 1px solid #20a8d8"
            size="lg"
            @click="clickOnPrev"
            >{{ disp_previous }}
          </CButton>
        </div>
        <div style="width: 20px"></div>
        <div>
          <CButton class="btn btn-primary mb-3" size="lg" @click="clickOnNext"
            >{{ nextButtonName() }}
          </CButton>
        </div>
      </div>
    </CCol>
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
import { backgroundImage, airalogo } from "@/utils/capacityMode";

const defaultlState = () => {
  return {
    obj_loading: null,

    param_cardStyle: "height: 35rem;", //
    param_activeColor: "#6baee3", //
    param_passiveColor: "#919bae", //
    param_lineThickness: 3, //
    param_activeThickness: 3, //
    param_passiveThickness: 3, //

    disp_header: i18n.formatter.format("ModifyCapacityControl"),

    disp_noEmptyNorSpaceNeigherRepeat: i18n.formatter.format(
      "NoEmptyNorSpaceNeigherRepeat"
    ), //
    disp_select: i18n.formatter.format("Select"), //
    disp_selected: i18n.formatter.format("Selected"), //
    disp_deselect: i18n.formatter.format("Deselect"), //

    disp_inputCompanyInfo: i18n.formatter.format("CompanyInfo"), //
    disp_inputAnnouncement: i18n.formatter.format("Announcement"), //
    disp_digitalSignage: i18n.formatter.format("DigitalSignage"), //
    disp_personnelInfo: i18n.formatter.format("PersonnelInfo"), //
    disp_complete: i18n.formatter.format("Complete"), //

    disp_backgroundimage: i18n.formatter.format("BackgroundImage"), //
    disp_chooseFile: i18n.formatter.format("ChooseFile"), //
    disp_companyLogo: i18n.formatter.format("Logo"), //
    disp_companyName: i18n.formatter.format("CompanyName"), //
    disp_companyColor: i18n.formatter.format("Color"), //
    disp_companyFont: i18n.formatter.format("Font"), //
    disp_companyFontSize: i18n.formatter.format("FontSize"), //

    disp_enabledMask: i18n.formatter.format("EnabledMask"), //
    disp_displayPhoto: i18n.formatter.format("DisplayPhoto"), //
    disp_displayGroup: i18n.formatter.format("DisplayGroup"), //
    disp_personInfo: i18n.formatter.format("PersonInfo"), //
    disp_occupancySize: i18n.formatter.format("OccupancySize"), //
    disp_temperature: i18n.formatter.format("Temperature"), //
    disp_entryChannel: i18n.formatter.format("EntryChannel"), //
    disp_exitChannel: i18n.formatter.format("ExitChannel"), //
    disp_messageDuration: i18n.formatter.format("Duration"), //
    disp_resetTime: i18n.formatter.format("ResetTime"), //
    disp_maxStayDuration: i18n.formatter.format("StayDuration"), //
    disp_cardSortBy: i18n.formatter.format("SortBy"), //

    // disp_abnormalColor: i18n.formatter.format("AbnormalColor"), //
    // disp_enteredColor: i18n.formatter.format("EnteredColor"), //
    // disp_exitedColor: i18n.formatter.format("ExitedColor"), //

    value_fontList: [
      "Arial",
      "Arial Rounded MT",
      "Bahnschrift",
      "Baskerville Old Face",
      "Bauhaus 93",
      "Bell MT",
      "Berlin Sans FB",
      "Bernard MT",
      "Blackadder ITC",
      "Blackletter686 BT",
      "Bodoni MT",
      "Bodoni MT Poster",
      "Book Antiqua",
      "Bookman Old Style",
      "Bookshelf Symbol 7",
      "Bradley Hand ITC",
      "Britannic",
      "Broadway",
      "Broadway BT",
      "Brush Script MT",
      "Calibri",
      "Californian FB",
      "Calisto MT",
      "Calligraph421 BT",
      "Cambria",
      "Cambria Math",
      "Candara",
      "Castellar",
      "Cataneo BT",
      "Centaur",
      "Century",
      "Century Gothic",
      "Century Schoolbook",
      "Chiller",
      "Colonna MT",
      "Comic Sans MS",
      "Consolas",
      "Constantia",
      "Cooper",
      "Copperplate Gothic",
      "Corbel",
      "Courier",
      "Courier New",
      "Curlz MT",
      "Dubai",
      "Ebrima",
      "Edwardian Script ITC",
      "Elephant",
      "Engravers MT",
      "Eras ITC",
      "Felix Titling",
      "Fixedsys",
      "Footlight MT",
      "Forte",
      "Franklin Gothic",
      "Franklin Gothic Book",
      "Freestyle Script",
      "French Script MT",
      "Gabriola",
      "Gadugi",
      "Garamond",
      "Georgia",
      "Gigi",
      "Gill Sans",
      "Gill Sans MT",
      "Gloucester MT",
      "Goudy Old Style",
      "Goudy Stout",
      "Haettenschweiler",
      "Harlow Solid",
      "Harrington",
      "High Tower Text",
      "Highlight LET Plain",
      "HolidayPi BT",
      "HoloLens MDL2 Assets",
      "Impact",
      "Imprint MT Shadow",
      "Informal Roman",
      "Ink Free",
      "Javanese Text",
      "John Handy LET Plain",
      "Jokerman",
      "Jokerman LET Plain",
      "Juice ITC",
      "Kievit Offc Pro",
      "Kristen ITC",
      "Kunstler Script",
      "La Bamba LET Plain",
      "Latin",
      "Leelawadee",
      "Leelawadee UI",
      "Lucida Bright",
      "Lucida Calligraphy",
      "Lucida Console",
      "Lucida Sans",
      "Magneto",
      "Malgun Gothic",
      "Marlett",
      "Matura MT Script Capitals",
      "Mekanik LET Plain",
      "Milano LET Plain",
      "MisterEarl BT",
      "Nirmala UI",
      "Noto Sans CJK SC",
      "Noto Sans Mono CJK SC",
      "NSimSun",
      "OCR A",
      "Odessa LET Plain",
      "Old English Text MT",
      "OldDreadfulNo7 BT",
      "Orange LET Plain",
      "Palace Script MT",
      "Palatino Linotype",
      "Papyrus",
      "Parchment",
      "ParkAvenue BT",
      "Perpetua",
      "Perpetua Titling MT",
      "Poor Richard",
      "Pristina",
      "Pump LET Plain",
      "Quixley LET Plain",
      "Rage",
      "Ravie",
      "Rockwell",
      "Roman",
      "Ruach LET Plain",
      "Script MT",
      "Scruff LET Plain",
      "Segoe MDL2 Assets",
      "Segoe Print",
      "Segoe UI",
      "Showcard Gothic",
      "SimSun",
      "SimSun-ExtB",
      "Sitka Display",
      "Square721 BT",
      "Staccato222 BT",
      "System",
      "Tahoma",
      "Tempus Sans ITC",
      "Terminal",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Victorian LET Plain",
      "Viner Hand ITC",
      "Vivaldi",
      "Vladimir Script",
      "Webdings",
      "Westwood LET Plain",
      "Wingdings",
      "Yu Gothic",
      "Yu Gothic UI",
      "細明體",
      "細明體_HKSCS",
      "微軟正黑體",
      "新細明體",
      "標楷體",
    ],

    value_displayPhotoList: [
      { value: "None", label: i18n.formatter.format("None") },
      { value: "RegisterPhoto", label: i18n.formatter.format("RegisterPhoto") },
      { value: "CapturedPhoto", label: i18n.formatter.format("CapturedPhoto") },
      { value: "DisplayPhoto", label: i18n.formatter.format("DisplayPhoto") },
    ],

    value_displayAttributeList: [
      { value: "None", label: i18n.formatter.format("None") },
      { value: "PersonId", label: i18n.formatter.format("PersonId") },
      { value: "PersonName", label: i18n.formatter.format("PersonName") },
      { value: "Department", label: i18n.formatter.format("Department") },
      { value: "JobTitle", label: i18n.formatter.format("JobTitle") },
      { value: "GroupName", label: i18n.formatter.format("GroupName") },
    ],

    value_displaySortByList: [
      { value: "PERSONID", label: i18n.formatter.format("PersonId") },
      { value: "TIMESTAMP", label: i18n.formatter.format("TimeStamp") },
    ],

    value_displayGroupList: [],
    value_displayTemperatureList: [
      { value: "C", label: i18n.formatter.format("Celsius") },
      { value: "F", label: i18n.formatter.format("Fahrenheit") },
    ],
    value_displayResetTime: [
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ],

    flag_backgrounduploading: false,
    flag_logouploading: false,
    flag_isPickingRegisterPhoto: false,

    value_capacitySettingUuid: "",
    value_backgroundimage: backgroundImage,
    value_logoimage:
      "data:image/png;base64,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",
    value_companyName: "Hello",
    value_companyColor: "#fafafa",
    value_companyFont: "微軟正黑體",
    value_companyFontSize: 50,

    value_enabledMask: false,
    value_displayPhoto: "RegisterPhoto",
    value_displayGroup: ["All Person", "All Visitor"],

    value_messageDuration: 15,
    value_temperature: "C",
    value_resetTime: "00",
    value_maxStayDuration: 1800,
    value_cardSortBy: "PERSONID",

    value_areaA: "PersonId",
    value_areaB: "PersonName",
    value_areaC: "Department",

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
  name: "CapacityControlSettingForm",
  props: {
    formData: Object,
    onFinish: { type: Function },
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  created() {},
  async mounted() {
    const self = this;

    let personGroups = await self.$globalGetGroupList();

    if (personGroups.group_list) {
      personGroups.group_list.forEach((item) => {
        // self.value_displayGroupList.push({ value: item.uuid, label: item.name });
        self.value_displayGroupList.push(item.name);
      });
    }

    self.$globalGetDisplaySetting(function (err, data) {
      if (!err) {
        self.value_Setting = data || {};

        self.value_capacitySetting = self.value_Setting["CAPACITY"];

        if (!self.value_capacitySetting) {
          self.value_capacitySetting = {
            displayMode: "CAPACITY",
            uuid: self.makeid(32),
            background_image: backgroundImage,
            logo: airalogo,
            companyName: "Hello",
            companyStyle: {
              color: "#fafafa",
              font: "微軟正黑體",
              size: 50,
            },
            enableInfoMask: false,
            displayPhoto: "RegisterPhoto",
            displayGroup: ["All Person", "Employee"],
            showDuration: 15,
            temperature: "C",
            resetTime: "00",
            maxStayDuration: 1800,
            cardSortBy: "PERSONID",
            areaA: "PersonId",
            areaB: "PersonName",
            areaC: "Department",
          };
        }

        self.value_capacitySettingUuid = self.value_capacitySetting.uuid
          ? self.value_capacitySetting.uuid
          : "";

        self.value_backgroundimage = self.value_capacitySetting.background_image
          ? self.value_capacitySetting.background_image
          : "";
        self.value_logoimage = self.value_capacitySetting.logo
          ? self.value_capacitySetting.logo
          : "";

        self.value_companyName = self.value_capacitySetting.companyName
          ? self.value_capacitySetting.companyName
          : "";
        self.value_companyColor = self.value_capacitySetting.companyStyle.color
          ? self.value_capacitySetting.companyStyle.color
          : "#fafafa";
        self.value_companyFont = self.value_capacitySetting.companyStyle.font
          ? self.value_capacitySetting.companyStyle.font
          : "微軟正黑體";
        self.value_companyFontSize = self.value_capacitySetting.companyStyle.size
          ? self.value_capacitySetting.companyStyle.size
          : 50;

        self.value_enabledMask = self.value_capacitySetting.enableInfoMask
          ? self.value_capacitySetting.enableInfoMask
          : false;
        self.value_displayPhoto = self.value_capacitySetting.displayPhoto
          ? self.value_capacitySetting.displayPhoto
          : "RegisterPhoto";
        self.value_displayGroup = self.value_capacitySetting.displayGroup
          ? self.value_capacitySetting.displayGroup
          : [];

        self.value_displayGroup = self.value_displayGroup.filter((item) => {
          return self.value_displayGroupList.includes(item);
        });

        // self.value_entryChannel = self.value_capacitySetting.entryChannel ? self.value_capacitySetting.entryChannel : [];
        // self.value_exitChannel = self.value_capacitySetting.exitChannel ? self.value_capacitySetting.exitChannel : [];

        self.value_messageDuration = self.value_capacitySetting.showDuration
          ? self.value_capacitySetting.showDuration
          : 15;

        // self.value_occupancySize = self.value_capacitySetting.occupancySize ? self.value_capacitySetting.occupancySize : "5 x 5";
        self.value_temperature = self.value_capacitySetting.temperature
          ? self.value_capacitySetting.temperature
          : "C";
        self.value_resetTime = self.value_capacitySetting.resetTime
          ? self.value_capacitySetting.resetTime
          : "00";
        self.value_maxStayDuration = self.value_capacitySetting.maxStayDuration
          ? self.value_capacitySetting.maxStayDuration
          : 1800;
        self.value_cardSortBy = self.value_capacitySetting.cardSortBy
          ? self.value_capacitySetting.cardSortBy
          : "PERSONID";

        // self.value_abnormalColor = self.value_capacitySetting.abnormalColor ? self.value_capacitySetting.abnormalColor : "#782c29";
        // self.value_enteredColor = self.value_capacitySetting.enteredColor ? self.value_capacitySetting.enteredColor : "#262f36";
        // self.value_exitedColor = self.value_capacitySetting.exitedColor ? self.value_capacitySetting.exitedColor : "#605378";

        self.value_areaA = self.value_capacitySetting.areaA
          ? self.value_capacitySetting.areaA
          : "";
        self.value_areaB = self.value_capacitySetting.areaB
          ? self.value_capacitySetting.areaB
          : "";
        self.value_areaC = self.value_capacitySetting.areaC
          ? self.value_capacitySetting.areaC
          : "";
      }
    });
  },
  updated() {},
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

      var file = this.$refs.uploadBackgroundFile.files[0];
      if (file == null) return;

      var myReader = new FileReader();

      myReader.onloadend = async (e) => {
        var image = new Image();
        var result = myReader.result;

        // var pos = result.indexOf(";base64,");
        // if (pos >= 0) {
        // 	self.value_backgroundimage = result.substring(pos + 8);
        self.value_backgroundimage = result;
        // }
      };
      myReader.readAsDataURL(file);
    },
    onLogoUploadFiles(event) {
      const self = this;

      var file = this.$refs.uploadLogoFile.files[0];
      if (file == null) return;

      var myReader = new FileReader();

      myReader.onloadend = async (e) => {
        var image = new Image();
        var result = myReader.result;

        // var pos = result.indexOf(";base64,");
        // if (pos >= 0) {
        // 	self.value_backgroundimage = result.substring(pos + 8);
        self.value_logoimage = result;
        // }
      };
      myReader.readAsDataURL(file);
    },

    nextButtonName() {
      switch (this.flag_currentSetp) {
        case 0:
          return this.disp_next;
        case 1:
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
        if (self.onFinish) {
          self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });

          let sendData = {
            displayMode: "CAPACITY",
            uuid: self.value_capacitySettingUuid,
            background_image: self.value_backgroundimage,
            logo: self.value_logoimage,
            companyName: self.value_companyName,
            companyStyle: {
              color: self.value_companyColor,
              font: self.value_companyFont,
              size: self.value_companyFontSize,
            },
            enableInfoMask: self.value_enabledMask,
            displayPhoto: self.value_displayPhoto,
            displayGroup: self.value_displayGroup,
            showDuration: self.value_messageDuration,
            occupancySize: self.value_occupancySize,
            temperature: self.value_temperature,
            resetTime: self.value_resetTime,
            areaA: self.value_areaA,
            areaB: self.value_areaB,
            areaC: self.value_areaC,
          };

          self.value_Setting["CAPACITY"] = sendData;

          self.onFinish(self.value_Setting, function (success, result) {
            if (self.obj_loading) self.obj_loading.hide();
            if (success) {
              self.flag_currentSetp = 2;
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

    eventControlNameValidator(val) {
      const self = this;
      if (self.flag_modifyMode) {
        self.flag_eventControlNamePass = true;
        return true;
      }
      if (val.replace(/\s/g, "").length == 0) {
        self.flag_eventControlNamePass = false;
      } else {
        self.flag_eventControlNamePass = val.length > 0;
      }
      if (self.flag_eventControlNamePass) {
        self.value_exstingEventControlSettingsList.forEach((setting) => {
          if (setting.name.toLowerCase() == val.toLowerCase()) {
            self.flag_eventControlNamePass = false;
          }
        });
      }
      return self.flag_eventControlNamePass;
    }, //
    eventLineAccessTokenValidator(val) {
      let flag_pass = false;
      const self = this;
      if (val.replace(/\s/g, "").length == 0) {
        flag_pass = false;
      } else {
        flag_pass = val.length > 0;
      }
      return flag_pass;
    }, //

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
