<template>
  <section>
    <CCard>
      <CCardBody>
        <table class="table-layout">
          <tr class="table-tr">
            <th class="h5 w-25 table-th">
              {{ $t('SMTPMethod') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('HostAddress') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('Port') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('SMTPEnabledSecure') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CSelect
                size="lg"
                :filterable="true"
                :options="['SMTP']"
                :value.sync="form.method"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                required
                :is-valid="formPass.host = isNotEmptyValidator(form.host) === ''"
                :invalid-feedback="isNotEmptyValidator(form.host)"
                v-model="form.host"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.port = checkPort(form.port) === ''"
                :invalid-feedback="checkPort(form.port)"
                v-model.number="form.port"
              />
            </td>
            <td class="table-td">
              <CSwitch
                size="lg"
                class="ml-0"
                color="success"
                shape="pill"
                :checked="form.secure"
                @update:checked="form.secure = $event"
              />
            </td>
          </tr>

          <tr class="table-tr">
            <th class="h5 w-25 table-th">
              {{ $t('Username') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('Password') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('SMTPSender') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('SMTPSubject') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.user = isNotEmptyValidator(form.user) === ''"
                :invalid-feedback="isNotEmptyValidator(form.user)"
                v-model="form.user"
              />
            </td>
            <td class="table-td">
              <CInput
                type="password"
                size="lg"
                placeholder=""
                :is-valid="formPass.pass = isNotEmptyValidator(form.pass) === ''"
                :invalid-feedback="isNotEmptyValidator(form.pass)"
                v-model="form.pass"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.from = checkEmail(form.from) === ''"
                :invalid-feedback="checkEmail(form.from)"
                v-model="form.from"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                v-model="form.subject"
              />
            </td>
          </tr>

          <tr class="table-tr">
            <th class="h5 w-25 table-th">
              {{ $t('SMTPTo') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('SMTPCC') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('SMTPBCC') }}
            </th>
            <th class="h5 w-25 table-th">
              {{ $t('ContentLanguage') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.to = checkEmail(form.to[0]) === ''"
                :invalid-feedback="checkEmail(form.to[0])"
                v-model="form.to[0]"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.cc = checkCCEmail(form.cc[0]) === ''"
                :invalid-feedback="checkCCEmail(form.cc[0])"
                v-model="form.cc[0]"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                placeholder=""
                :is-valid="formPass.bcc = checkCCEmail(form.bcc[0]) === ''"
                :invalid-feedback="checkCCEmail(form.bcc[0])"
                v-model="form.bcc[0]"
              />
            </td>
            <td class="table-td">
              <CSelect
                size="lg"
                :filterable="true"
                :options="languageOptions"
                :value="language"
                @update:value="$emit('update:language', $event)"
              />
            </td>
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
              <DataFieldList
                :data-fields="dataFields"
                :person-fields="personFields"
                :data="dataList"
                @update:data="newDataList => $emit('update:dataList', newDataList)"
              />
            </td>
            <td class="table-td">
              <CTextarea
                size="lg"
                rows="9"
                :value="note"
                @input="$emit('update:note', $event)"
              />
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
  name: 'Step2FormMail',
  components: {
    DataFieldList,
  },
  props: {
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => () => '',
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
    note: {
      type: String,
      required: true,
      default: '',
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
  emits: [
    'update:language',
    'update:note',
    'update:dataList',
  ],
  methods: {
    checkCCEmail(val) {
      if (val === '') return '';
      return this.checkEmail(val);
    },
  },
};
</script>
