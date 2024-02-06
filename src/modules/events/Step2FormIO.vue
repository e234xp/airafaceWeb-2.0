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
              v-model="form.brand"
              :options="value_brandList"
              :filterable="true"
              class="font-control mt-2"
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
              v-model="form.model"
              :options="value_modelList"
              :filterable="true"
              class="font-control mt-2"
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
              v-model="form.host"
              :invalid-feedback="checkIpAddr(form.host)"
              :is-valid="checkIpAddr(form.host) === ''"
              required
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
              v-model.number="form.port"
              :invalid-feedback="checkPort(form.port)"
              :is-valid="checkPort(form.port) === ''"
              required
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
            <CInput
              size="lg"
              class="mt-2"
              v-model="form.user"
              :invalid-feedback="checkNonEmpty(form.user)"
              :is-valid="checkNonEmpty(form.user) === ''"
              required
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
              v-model="form.pass"
              :type="flag_view_password ? 'text' : 'password'"
              :invalid-feedback="checkNonEmpty(form.pass)"
              :is-valid="checkNonEmpty(form.pass) === ''"
              required
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
                v-model="form.iopoint[idx].enable"
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
              v-model="form.iopoint[idx].default"
              :options="value_deviceDefaultValue"
              :filterable="true"
              class="font-control mt-2"
              :placeholder="$t('placeholder')"
              :disabled="!form.iopoint[idx].enable"
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
              v-model="form.iopoint[idx].trigger"
              :options="value_deviceTrigger"
              :filterable="true"
              class="font-control mt-2"
              :placeholder="$t('placeholder')"
              :disabled="!form.iopoint[idx].enable"
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
              v-model.number="form.iopoint[idx].delay"
              pattern="[0-9]*"
              :invalid-feedback="checkDelay(form.iopoint[idx].delay)"
              :is-valid="checkDelay(form.iopoint[idx].delay) === ''"
              required
              :disabled="!form.iopoint[idx].enable"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
import i18n from '@/i18n';

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
    form: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    handleUpdateEmitData: {
      type: Function,
      required: true,
      default: () => '',
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
    checkNonEmpty: (value) => {
      if (value === '') {
        return i18n.formatter.format('NoEmptyNoSpace');
      }
      return '';
    },
    checkDelay: (value) => {
      if (value < 1 || value > 30) {
        return i18n.formatter.format('disp_limitNumber1to30');
      }
      return '';
    },
  },
  emit: [],
};

</script>
