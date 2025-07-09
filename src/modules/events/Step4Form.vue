<template>
  <CCol sm="12">
    <CCard :style="cardStyle">
      <CCardBody>
        <CRow>
          <CCol sm="12">
            <p class="display-4 row justify-content-center align-items-center" style="height: 34rem;">
              {{ $t('Complete') }}
            </p>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </CCol>
</template>

<script>

  export default {
    name: 'Step4Form',
    props: {
      isAllPassed: Boolean,
      cardStyle: String,
      handleUpdateData: Function,
      eventControlType: String,
    },
  };
</script>