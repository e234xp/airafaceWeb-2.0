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
              required
              :is-valid="formPass.token = isNotEmptyValidator(form.token) === ''"
              :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
              v-model="form.token"
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
          :data="dataList"
          @update:data="newData => Object.assign(dataList, newData)"
        />
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
import DataFieldList from '@/views/components/DataFieldList.vue';

export default {
  name: 'Step2FormLine',
  components: {
    DataFieldList,
  },
  props: {
    isNotEmptyValidator: {
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
    dataList: {
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
