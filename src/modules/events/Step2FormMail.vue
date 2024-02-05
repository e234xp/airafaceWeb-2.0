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
              :value.sync="value_eventSMTPMethod"
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
              :is-valid="(val) => isNotEmptyValidator('hostAddressPass', val)"
              :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
              :value="eventSMTPHostAddress"
              @input="handleUpdateEmitData('eventSMTPHostAddress', $event)"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('Port') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="val => portValidator('mailPortPass', val)"
              :invalid-feedback="checkPort(eventSMTPPort)"
              :value="eventSMTPPort"
              @input="handleUpdateEmitData('eventSMTPPort', Number($event))"
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
              :checked="eventSMTPEnabledSecure"
              @update:checked="handleUpdateEmitData('eventSMTPEnabledSecure', $event)"
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
              :value="eventSMTPUser"
              @input="handleUpdateEmitData('eventSMTPUser', $event)"
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
                :value="eventSMTPPass"
                @input="handleUpdateEmitData('eventSMTPPass', $event)"
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
              :is-valid="(val) => emailValidator('senderPass', val)"
              :invalid-feedback="$t('InvalidEmailFormat')"
              :value="eventSMTPSender"
              @input="handleUpdateEmitData('eventSMTPSender', $event)"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPSubject') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :value="eventSMTPSubject"
              @input="handleUpdateEmitData('eventSMTPSubject', $event)"
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
              :is-valid="(val) => emailValidator('toPass', val)"
              :invalid-feedback="$t('InvalidEmailFormat')"
              :value="eventSMTPTo"
              @input="handleUpdateEmitData('eventSMTPTo', $event)"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPCC') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="(val) => emailValidator('ccPass', val)"
              :invalid-feedback="$t('InvalidEmailFormat')"
              :value="eventSMTPCC"
              @input="handleUpdateEmitData('eventSMTPCC', $event)"
            />
          </CCol>
          <CCol sm="3">
            <div class="h5">
              {{ $t('SMTPBCC') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              :is-valid="(val) => emailValidator('bccPass', val)"
              :invalid-feedback="$t('InvalidEmailFormat')"
              :value="eventSMTPBCC"
              @input="handleUpdateEmitData('eventSMTPBCC', $event)"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
export default {
  name: 'Step2FormMail',
  props: {
    handleUpdateEmitData: {
      type: Function,
      required: true,
      default: () => {},
    },
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
    portValidator: {
      type: Function,
      required: true,
      default: () => () => false,
    },
    emailValidator: {
      type: Function,
      required: true,
      default: () => () => false,
    },
    eventSMTPMethod: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPHostAddress: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPPort: {
      type: Number,
      required: true,
      default: 0,
    },
    eventSMTPEnabledSecure: {
      type: Boolean,
      required: true,
      default: false,
    },
    eventSMTPUser: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPPass: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPSender: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPSubject: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPTo: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPCC: {
      type: String,
      required: true,
      default: '',
    },
    eventSMTPBCC: {
      type: String,
      required: true,
      default: '',
    },
  },
  computed: {
    value_eventSMTPMethod: {
      get() {
        return this.eventSMTPMethod;
      },
      set(value) {
        return this.$emit('update:eventSMTPMethod;', value);
      },
    },
  },
  methods: {
    validateForm() {
      this.$emit('validateForm');
    },
  },
};
</script>
