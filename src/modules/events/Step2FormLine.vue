<template>
  <section>
    <CCard>
      <CCardBody>
        <table class="table-layout">
          <tr>
            <th class="h5 w-25 table-th">
              {{ $t('LineAccessToken') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('LineGroupId') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('ContentLanguage') }}
            </th>
            <th colspan="2" />
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput size="lg" required :is-valid="formPass.token = isNotEmptyValidator(form.token) === ''"
                :invalid-feedback="$t('NoEmptyNoSpaceOnly')" v-model="form.token" />
            </td>
            <td class="table-td">
              <CInput size="lg" required :is-valid="formPass.group_id = isNotEmptyValidator(form.group_id) === ''"
                :invalid-feedback="$t('NoEmptyNoSpaceOnly')" v-model="form.group_id" />
            </td>
            <td class="table-td">
              <CSelect size="lg" :filterable="true" :options="languageOptions" :value="language"
                @update:value="$emit('update:language', $event)" />
            </td>
            <td colspan="2" />
          </tr>
        </table>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <table class="table-layout">
          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('Fields') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('ExpansionField') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <DataFieldList :data-fields="dataFields" :person-fields="personFields" :data="dataList"
                @update:data="newDataList => $emit('update:dataList', newDataList)" />
            </td>
            <td class="table-td">
              <CTextarea size="lg" rows="9" :value="note" @input="$emit('update:note', $event)" />
            </td>
          </tr>
        </table>
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
      language: {
        type: String,
        required: true,
        default: '',
      },
      languageOptions: {
        type: Array,
        required: true,
        default: () => [],
      },
      dataList: {
        type: Object,
        required: true,
        default: () => ({}),
      },
      note: {
        type: String,
        required: true,
        default: '',
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
    emits: [
      'update:language',
      'update:note',
      'update:dataList',
    ],
  };

</script>