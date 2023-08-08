<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div>
      <h2 sm="12">{{ disp_headertitle }}</h2>
    </div>
    <!-- Basic -->
    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
      >{{ disp_basicDeviceName }}</CRow
    >
    <CRow>
      <CCol sm="6">
        <CInput
          size="lg"
          class="h5"
          v-model="localStep1form.name"
          :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
          valid-feedback="ok"
          :is-valid="isFieldPassed('name', localStep1form.name)"
          required
        />
      </CCol>
    </CRow>

    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
      >{{ disp_basicDeviceGroups }}</CRow
    >
    <CRow>
      <CCol sm="6">
        <multiselect
          placeholder=""
          v-model="localStep1form.divice_groups"
          :options="value_deviceGroupsList"
          :multiple="true"
          :taggable="true"
          :hideSelected="true"
          :show-no-options="false"
          label="name"
        >
        </multiselect>
      </CCol>
    </CRow>

    <div style="height: 35px"></div>

    <!-- Video Source -->
    <div>
      <h2 sm="12">{{ disp_subtitle }}</h2>
    </div>

    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
      style="padding-top: 10px; text-align: right"
      >{{ disp_type }}</CRow
    >
    <CRow>
      <CCol sm="6">
        <CSelect
          size="lg"
          value="1"
          v-model="localStep1form.stream_type"
          placeholder="請選擇"
          :options="value_deviceTypesList"
        />
      </CCol>
    </CRow>

    <div id="type" v-if="localStep1form.stream_type !== 'rtsp'">
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_ipAddress }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.ip_address"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('ip_address', localStep1form.ip_address)"
              required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_port }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model.number="localStep1form.port"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('port', localStep1form.port)"
              required
            />
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_username }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.user"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('user', localStep1form.user)"
              required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_password }}
            <CInput
              size="lg"
              type="password"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.pass"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('pass', localStep1form.pass)"
              required
            />
          </CCol>
        </CRow>
      </div>

      <CRow
        sm="12"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_parameters }}</CRow
      >
      <CRow>
        <textarea
          class="ml-3 mb-3 form-control"
          v-model="localStep1form.connection_info"
          rows="5"
          :invalid-feedback="$t('NoEmptyNoSpace')"
          valid-feedback="ok"
          :is-valid="
            isFieldPassed('connection_info', localStep1form.connection_info)
          "
          required
        >
        </textarea>
      </CRow>

      <div v-if="isShowConnectionString">
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px; text-align: right"
          >{{ disp_connectionString }}</CRow
        >
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%"
              v-model="connectionString"
              disabled="disabled"
            />
          </CCol>
        </CRow>
      </div>
    </div>

    <!-- 類型不等於rtsp時 -->
    <div id="type" v-else>
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_ipAddress }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.ip_address"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('ip_address', localStep1form.ip_address)"
              required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_port }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model.number="localStep1form.port"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('port', localStep1form.port)"
              required
            />
          </CCol>
        </CRow>
      </div>

      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_username }}
            <CInput
              size="lg"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.user"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('user', localStep1form.user)"
              required
            />
          </CCol>

          <CCol sm="6" class="h5">
            {{ disp_password }}
            <CInput
              size="lg"
              type="password"
              class="mt-2"
              style="width: 100%"
              v-model="localStep1form.pass"
              :invalid-feedback="$t('NoEmptyNoSpace')"
              valid-feedback="ok"
              :is-valid="isFieldPassed('pass', localStep1form.pass)"
              required
            />
          </CCol>
        </CRow>
      </div>

      <CRow
        sm="12"
        class="h5 ml-2 mb-3"
        style="padding-top: 10px; text-align: right"
        >{{ disp_parameters }}</CRow
      >
      <CRow>
        <CCol sm="6">
          <CInput
            size="lg"
            class="h5"
            style="width: 100%"
            v-model="localStep1form.connection_info"
            :invalid-feedback="$t('NoEmptyNoSpace')"
            valid-feedback="ok"
            :is-valid="
              isFieldPassed('connection_info', localStep1form.connection_info)
            "
            required
          />
        </CCol>
      </CRow>

      <div v-if="isShowConnectionString">
        <CRow
          sm="12"
          class="h5 ml-2 mb-3"
          style="padding-top: 10px; text-align: right"
          >{{ disp_connectionString }}</CRow
        >
        <CRow>
          <CCol sm="12">
            <CInput
              size="lg"
              class="h5"
              style="width: 100%"
              v-model="connectionString"
              disabled="disabled"
            />
          </CCol>
        </CRow>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";

export default {
  name: "ModifyCamerasStep1Form",
  props: {
    step1form: Object,
    defaultValues: Object,
    isFieldPassed: Function,
  },
  emits: ["updateStep1form"],
  data() {
    return {
      localStep1form: { ...this.step1form },

      /*Basic title  */
      disp_headertitle: i18n.formatter.format("VideoDeviceBasic"),
      // disp_header: i18n.formatter.format("VideoDeviceBasic"),

      /**content */
      disp_basicDeviceName: i18n.formatter.format("BasicDeviceName"),
      disp_basicDeviceGroups: i18n.formatter.format("BasicDeviceGroups"),

      /*Video Source title  */
      disp_subtitle: i18n.formatter.format("VideoDeviceVideoSource"),

      /**content */
      disp_type: i18n.formatter.format("VideoSourceType"),
      disp_ipAddress: i18n.formatter.format("VideoSourceIpAddress"),
      disp_port: i18n.formatter.format("VideoSourcePort"),
      disp_username: i18n.formatter.format("VideoSourceUsername"),
      disp_password: i18n.formatter.format("VideoSourcePassword"),
      disp_parameters: i18n.formatter.format("VideoSourceParameters"),
      disp_connectionString: i18n.formatter.format(
        "VideoSourceConnectionString"
      ),

      // 文字提示
      disp_limitNumber0to1: i18n.formatter.format("limitNumber0to1"), // port 提示文字

      //設備群組 下拉選項
      value_deviceGroupsList: [],

      //設備類型
      value_deviceTypesList: ["rtsp", "sdp"],
    };
  },
  components: {
    multiselect: Multiselect,
  },
  computed: {
    isShowConnectionString() {
      // 判断輸入框是否都不為空
      return (
        this.localStep1form.ip_address !== "" &&
        this.localStep1form.port !== "" &&
        this.localStep1form.user !== "" &&
        this.localStep1form.pass !== "" &&
        this.localStep1form.connection_info !== ""
      );
    },
    //連接資訊   let testString = "rtsp://admin:12345@192.168.10.171:554/media/video1";
    connectionString() {
      return `${this.localStep1form.stream_type}://${
        this.localStep1form.user
      }:${this.localStep1form.pass.replace(/./g, "*")}@${
        this.localStep1form.ip_address
      }:${this.localStep1form.port}${this.localStep1form.connection_info}`;
    },
  },
  // 拿資料 寫入資料
  watch: {
    localStep1form: {
      handler(newValue) {
        this.$emit("updateStep1form", { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step1form).includes(key)) return;
          this.localStep1form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.formatNameList();
  },
  methods: {
    /**設備群組 */
    async formatNameList() {
      const self = this;
      let res = await self.$globalFindVideoDeviceGroups("", 0, 3000); /**get data */
      let groups = res.data.result; /**拿回所有group */
      const handleData = groups.map(({ name, uuid }) => ({ name: name, value: uuid })); 
      this.value_deviceGroupsList = handleData;
    },
  
  },

};
</script>

<style>
@import url("https://unpkg.com/vue-select@latest/dist/vue-select.css");
</style>
