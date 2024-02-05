<template>
  <section>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="3">
            <div class="h5">
              {{ $t('LineAccessToken') }}
            </div>
            <CInput
              size="lg"
              placeholder=""
              required
              :is-valid="(val) => isNotEmptyValidator('lineAccessTokenPass', val)"
              :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
              :value="eventLineAccessToken"
              @input="handleUpdateEmitData('eventLineAccessToken', $event)"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        213
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
export default {
  name: 'Step2FormLine',
  props: {
    handleUpdateEmitData: {
      type: Function,
      required: true,
      default: () => {},
    },
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => () => true,
    },
    eventLineAccessToken: {
      type: String,
      required: true,
      default: '',
    },
  },
  emit: [
    'update:eventLineAccessToken',
  ],
};

</script>
