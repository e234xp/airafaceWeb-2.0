<template>
  <section>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPMethod') }}
            </div>
            <CSelect
              size="lg"
              :options="['SMTP']"
              :value.sync="form.method"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('HostAddress') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              required
              :is-valid="formPass.host = isNotEmptyValidator(form.host) === ''"
              :invalid-feedback="isNotEmptyValidator(form.host)"
              v-model="form.host"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('Port') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.port = checkPort(form.port) === ''"
              :invalid-feedback="checkPort(form.port)"
              v-model="form.port"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPEnabledSecure') }}
            </div>
            <CSwitch
              size="lg"
              class="ml-0"
              color="success"
              shape="pill"
              v-model="form.secure"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="3">
            <div class="h5">
              {{ $t('Username') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.user = isNotEmptyValidator(form.user) === ''"
              :invalid-feedback="isNotEmptyValidator(form.user)"
              v-model="form.user"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('Password') }}
            </div>
            <form>
              <CInput
                type="password"
                size="lg"
                placeholder=""
                :is-valid="formPass.pass = isNotEmptyValidator(form.pass) === ''"
                :invalid-feedback="isNotEmptyValidator(form.pass)"
                v-model="form.pass"
              />
            </form>
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPSender') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.from = checkEmail(form.from) === ''"
              :invalid-feedback="checkEmail(form.from)"
              v-model="form.from"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPSubject') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              v-model="form.subject"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPTo') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.to = checkEmail(form.to[0]) === ''"
              :invalid-feedback="checkEmail(form.to[0])"
              v-model="form.to[0]"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPCC') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.cc = checkEmail(form.cc[0]) === ''"
              :invalid-feedback="checkEmail(form.cc[0])"
              v-model="form.cc[0]"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPBCC') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="formPass.bcc = checkEmail(form.bcc[0]) === ''"
              :invalid-feedback="checkEmail(form.bcc[0])"
              v-model="form.bcc[0]"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <DataFieldList
          :data-fields="dataFields"
          :person-fields="personFields"
          :data="data"
          @update:data="newData => Object.assign(data, newData)"
        />
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
import DataFieldList from '@/views/components/DataFieldList.vue';

export default {
  name: 'Step2FormMail',
  components: {
    DataFieldList,
  },
  props: {
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => () => false,
    },
    checkPort: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkEmail: {
      type: Function,
      required: true,
      default: () => '',
    },
    dataFields: {
      type: Array,
      required: true,
      default: () => [],
    },
    personFields: {
      type: Array,
      required: true,
      default: () => [],
    },
    data: {
      type: Object,
      required: true,
      default: () => ({}),
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
};
</script>
