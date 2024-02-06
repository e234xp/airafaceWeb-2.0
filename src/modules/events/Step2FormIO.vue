<template>
  <section>
    <!-- Brand -->
    <CCard>
      <CCardHeader>
        <span class="h3">{{ $t('I/OBoxesBasicName') }}</span>
      </CCardHeader>
      <CCardBody>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameBrand') }}
            </h5>
            <CSelect
              size="lg"
              class="font-control mt-2"
              :value.sync="form.brand"
              :options="value_brandList"
              :filterable="true"
            />
          </CCol>
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameModel') }}
            </h5>
            <CSelect
              size="lg"
              class="font-control mt-2"
              :value.sync="form.model"
              :options="value_modelList"
              :filterable="true"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Connection -->
    <CCard>
      <CCardHeader>
        <span class="h3">{{ $t('I/OBoxesBasicTitleNameConnection') }}</span>
      </CCardHeader>
      <CCardBody>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameIP') }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              required
              :invalid-feedback="checkIpAddr(form.host)"
              :is-valid="formPass.host = checkIpAddr(form.host) === ''"
              v-model="form.host"
            />
          </CCol>
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNamePort') }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              required
              :invalid-feedback="checkPort(form.port)"
              :is-valid="formPass.port = checkPort(form.port) === ''"
              v-model.number="form.port"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameUserName') }}
            </h5>
            <!-- <CInput
              size="lg"
              class="mt-2"
              v-model="form.user"
              required
            /> -->
            <CInput
              size="lg"
              class="mt-2"
              required
              :is-valid="formPass.user = isNotEmptyValidator(form.user) === ''"
              :invalid-feedback="isNotEmptyValidator(form.user)"
              v-model="form.user"
            />
          </CCol>
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNamePassword') }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              required
              :type="flag_view_password ? 'text' : 'password'"
              :is-valid="formPass.pass = isNotEmptyValidator(form.pass) === ''"
              :invalid-feedback="isNotEmptyValidator(form.pass)"
              v-model="form.pass"
            >
              <template #append-content>
                <CButton
                  @click="viewPassword"
                  style="padding: 0.375rem 0.375rem;"
                >
                  <CIcon
                    v-show="flag_view_password"
                    src="/img/eye-slash.png"
                  />
                  <CIcon
                    v-show="!flag_view_password"
                    src="/img/eye.png"
                  />
                </CButton>
              </template>
            </CInput>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Digital OutPut 1 -->
    <CCard
      v-for="idx in [0, 1]"
      :key="idx"
    >
      <CCardHeader>
        <span class="h3">{{ `${$t('DigitalOutput')} #${idx + 1}` }}</span>
      </CCardHeader>
      <CCardBody>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameEnable') }}
            </h5>
            <label class="switch">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="form.iopont[idx].enable"
              >
              <span class="slider round" />
            </label>
          </CCol>
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameDefaultValue') }}
            </h5>
            <CSelect
              size="lg"
              class="font-control mt-2"
              :value.sync="form.iopont[idx].default"
              :options="value_deviceDefaultValue"
              :filterable="true"
              :placeholder="$t('placeholder')"
              :disabled="!form.iopont[idx].enable"
            />
          </CCol>
        </CRow>
        <CRow sm="12">
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameValueWhenTriggered') }}
            </h5>
            <CSelect
              size="lg"
              class="font-control mt-2"
              :value.sync="form.iopont[idx].trigger"
              :options="value_deviceTrigger"
              :filterable="true"
              :placeholder="$t('placeholder')"
              :disabled="!form.iopont[idx].enable"
            />
          </CCol>
          <CCol
            sm="6"
            class="h5"
          >
            <h5 class="ml-2">
              {{ $t('I/OBoxesBasicCOlNameDurationWhenTriggered') }}
            </h5>
            <CInput
              size="lg"
              class="mt-2"
              pattern="[0-9]*"
              required
              :disabled="!form.iopont[idx].enable"
              :is-valid="formPass.delay = checkDelay(form.iopont[idx].delay) === ''"
              :invalid-feedback="checkDelay(form.iopont[idx].delay)"
              v-model.number="form.iopont[idx].delay"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>

export default {
  name: 'Step2FormIO',
  props: {
    checkPort: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkIpAddr: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkDelay: {
      type: Function,
      required: true,
      default: () => '',
    },
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => '',
    },
    form: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    formPass: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      value_deviceGroupsList: ['A', 'B'],
      value_brandList: ['airaIO box'],
      value_modelList: ['TCP-KP-C2'],
      value_deviceDefaultValue: [{ label: '0', value: false }, { label: '1', value: true }],
      value_deviceTrigger: [{ label: '0', value: false }, { label: '1', value: true }],

      flag_view_password: false,
    };
  },
  methods: {
    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },
  },
};
</script>
