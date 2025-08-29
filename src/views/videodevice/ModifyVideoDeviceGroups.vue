<template>
  <div id="wrapper">
    <div>
      <div class="h1">
        {{ $t('VideoDeviceBasic') }}
      </div>

      <stepprogress
        class="w-step-progress-3"
        :active-thickness="param_activeThickness"
        :passive-thickness="param_passiveThickness"
        :active-color="param_activeColor"
        :passive-color="param_passiveColor"
        :current-step="flag_currentSetp"
        :line-thickness="param_lineThickness"
        :steps="[$t('VideoDeviceBasic'), $t('SelectGroupDevice'), $t('Complete')]"
        icon-class="fa fa-check"
      />

      <div style="height: 35px" />
    </div>

    <CCol sm="12">
      <CCard v-if="isOnStep(0)">
        <CCardBody>
          <Step1Form
            :step1form="step1form"
            @updateStep1form="updateStep1form"
            :is-field-passed="isFieldPassed"
            :default-values="defaultValues"
          />
        </CCardBody>
      </CCard>

      <CCard v-else-if="isOnStep(1)">
        <CCardBody>
          <Step2Form
            :step2form="step2form"
            @updateStep2form="updateStep2form"
          />
        </CCardBody>
      </CCard>

      <CCard
        style="height: 34rem;"
        v-else-if="isOnStep(2)"
      >
        <CCardBody style="display: flex; justify-content: center; align-items: center;">
          <CRow>
            <CCol sm="12">
              <p class="display-4 row justify-content-center">
                {{ $t('Complete') }}
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="12">
      <div class="row justify-content-center mb-4">
        <div v-if="flag_currentSetp == 0 && value_returnRoutePath.length > 0">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ value_returnRouteName }}
          </CButton>
        </div>
        <div v-if="flag_currentSetp == 1 || flag_currentSetp == 2">
          <CButton
            class="btn btn-outline-primary fz-lg btn-w-normal"
            @click="handlePrev"
          >
            {{ $t('Previous') }}
          </CButton>
        </div>
        <div style="width: 20px" />
        <div>
          <CButton
            class="btn btn-primary mb-3"
            size="lg"
            @click="handleNext()"
            :disabled="!isStepPassed(flag_currentSetp)"
          >
            {{ nextButtonName(flag_currentSetp) }}
          </CButton>
        </div>
      </div>
    </CCol>
  </div>
</template>

<script>
import StepProgress from 'vue-step-progress';
import '@/airacss/vue-step-progress.css';

import Step1Form from '@/modules/videodevice/modifyvideodevicegroups/Step1Form.vue';
import Step2Form from '@/modules/videodevice/addvideodevicegroups/Step2Form.vue';

export default {
  name: 'ModifyVideoDeviceGroups',

  data() {
    return {
      param_cardStyle: 'height: 35rem;',

      value_returnRoutePath: this.$route.params.value_returnRoutePath
        ? this.$route.params.value_returnRoutePath
        : '',
      value_returnRouteName: this.$route.params.value_returnRouteName
        ? this.$route.params.value_returnRouteName
        : '',

      param_activeColor: '#6baee3',
      param_passiveColor: '#919bae',
      param_lineThickness: 3,
      param_activeThickness: 3,
      param_passiveThickness: 3,
      flag_currentSetp: 0,

      uuid: '',
      step1form: {
        name: '',
        remarks: '',
      },

      step2form: {
        selectedCameras: [],
        selectedTablets: [],
      },

      defaultValues: {},
    };
  },
  components: {
    stepprogress: StepProgress,
    Step1Form,
    Step2Form,
  },
  async created() {
    this.defaultValues = await this.getDefaultValues();
    this.defaultValues = { ...this.defaultValues, ...this.settingItem };

    this.uuid = this.defaultValues.uuid;

    // 載入現有的設備資料
    await this.loadExistingDevices();

    this.isFormPassed(this.step1form);
  },

  methods: {
    updateStep1form(newValue) {
      this.step1form = { ...newValue };
    },

    updateStep2form(newValue) {
      this.step2form = { ...newValue };
    },

    async getDefaultValues() {
      return this.$route.params.item;
    },

    async loadExistingDevices() {
      try {
        // 從路由參數獲取現有群組資料
        const groupData = this.$route.params.item;

        if (groupData && groupData.camera_uuid_list && groupData.tablet_uuid_list) {
          // 獲取所有攝影機和平板資料
          const [cameraResponse, tabletResponse] = await Promise.all([
            this.$globalFindCameras('', 0, 1000),
            this.$globalGetTabletList('', 0, 1000),
          ]);

          let allCameras = [];
          let allTablets = [];

          if (cameraResponse && cameraResponse.data && cameraResponse.data.list) {
            allCameras = cameraResponse.data.list;
          }

          if (tabletResponse && tabletResponse.data) {
            // 嘗試從不同的可能欄位獲取平板資料
            allTablets = tabletResponse.data.data_list;
          }

          // 根據UUID找到對應的設備物件，並添加deviceType屬性
          const selectedCameras = allCameras.filter((camera) => groupData.camera_uuid_list.includes(camera.uuid)).map((camera) => ({
            ...camera,
            deviceType: this.$t('Camera'),
            type: 'camera',
          }));

          const selectedTablets = allTablets.filter((tablet) => groupData.tablet_uuid_list.includes(tablet.uuid)).map((tablet) => ({
            ...tablet,
            deviceType: this.$t('Tablet'),
            type: 'tablet',
          }));

          // 設置到step2form
          this.step2form = {
            selectedCameras,
            selectedTablets,
          };
        }
      } catch (error) {
        console.error('Error loading existing devices:', error);
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },

    async getDefaultName() {
      const {
        data: { totalLength, result: videoGroupList },
      } = await this.$globalFindVideoDeviceGroups('', 0, 3000);

      let number = totalLength + 1;
      let name = `Video Group-${number}`;
      while (this.isDuplicateName(videoGroupList, name)) {
        number += 1;
        name = `Video Group-${number}`;
      }

      return name;
    },

    isDuplicateName(videoGroupList, name) {
      return videoGroupList.some((videoGroup) => videoGroup.name === name);
    },

    isStepPassed(step) {
      switch (step) {
        case 0: {
          return this.isFormPassed(this.step1form);
        }
        case 1: {
          return true; // Step2 is always passable since device selection is optional
        }
        case 2:
        default: {
          return true;
        }
      }
    },

    isFormPassed(form) {
      return Object.entries(form).every(([key, value]) => this.isFieldPassed(key, value));
    },

    isFieldPassed(key, value) {
      const rules = {
        name: 'nonEmpty',
      };
      const rule = rules[key];
      if (!rule) return true;
      switch (rule) {
        case 'nonEmpty': {
          let ret = !!value;

          switch (key) {
            case 'name':
              if (value.replace(/\s/g, '').length === 0) {
                ret = false;
              } else if (value.replace(/[^\+\)\(\*\&\^\%\$\#\@\!\~\|\}\{\"\:\?\>\<\,\.\/\'\;\\\]\[\=\`\]\]]/g, '').length === 0) {
                ret = true;
              } else {
                ret = false;
              }
              break;
            default:
              ret = !!value;
              break;
          }

          return ret;
        }
        default:
          return true;
      }
    },

    isOnStep(step) {
      return this.flag_currentSetp === step;
    },

    handlePrev() {
      if (this.flag_currentSetp > 0) {
        this.flag_currentSetp -= 1;
        return;
      }

      if (this.value_returnRoutePath.length === 0) return;

      this.$router.push({ name: this.value_returnRoutePath });
    },

    async handleNext() {
      switch (this.flag_currentSetp) {
        case 0: {
          this.flag_currentSetp += 1;
          break;
        }
        case 1: {
          this.obj_loading = this.$loading.show({
            container: this.$refs.formContainer,
          });

          const cameraUuidList = this.step2form.selectedCameras
            ? this.step2form.selectedCameras.map((camera) => camera.uuid) : [];
          const tabletUuidList = this.step2form.selectedTablets
            ? this.step2form.selectedTablets.map((tablet) => tablet.uuid) : [];

          const parameter = {
            uuid: this.uuid,
            data: {
              ...this.step1form,
              camera_uuid_list: cameraUuidList,
              tablet_uuid_list: tabletUuidList,
            },
          };

          const { data } = await this.modify(parameter);

          this.obj_loading.hide();
          if (data && data.message === 'ok') {
            this.flag_currentSetp += 1;
          } else {
            this.$fire({
              text: this.$t('Failed'),
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }

          break;
        }

        default: {
          this.$router.push({ name: this.value_returnRoutePath });

          break;
        }
      }
    },

    modify(data) {
      return this.$globalModifyVideoDeviceGroups(data);
    },

    nextButtonName(step) {
      switch (step) {
        case 0:
          return this.$t('Next');
        case 1:
          return this.$t('SaveChanges');
        case 2:
        default:
          return this.$t('Complete');
      }
    },
  },
};
</script>
