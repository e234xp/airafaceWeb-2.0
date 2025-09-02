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
              <CInput
                size="lg"
                required
                :is-valid="formPass.token = isNotEmptyValidator(form.token) === ''"
                :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                v-model="form.token"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                required
                :is-valid="formPass.group_id = isNotEmptyValidator(form.group_id) === ''"
                :invalid-feedback="$t('NoEmptyNoSpaceOnly')"
                v-model="form.group_id"
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
            <td colspan="2" />
          </tr>
        </table>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <div style="display: flex; gap: 15px; height: 500px;">
          <!-- 左欄：辨識資料 -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <h6 style="margin-bottom: 10px; color: #333; font-weight: 600; text-align: center;">
              {{ $t('EventData') }}
            </h6>
            <div style="flex: 1; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 4px; padding: 10px; background-color: #fff;">
              <DataFieldSection
                :fields="dataFields"
                :selected="dataList.eventData || {}"
                field-type="event"
                @update:data="updateEventData"
              />
            </div>
          </div>

          <!-- 中欄：人員資料 -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <h6 style="margin-bottom: 10px; color: #333; font-weight: 600; text-align: center;">
              {{ $t('PersonData') }}
            </h6>
            <div style="flex: 1; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 4px; padding: 10px; background-color: #fff;">
              <DataFieldSection
                :fields="personFields"
                :selected="dataList.personData || {}"
                field-type="person"
                @update:data="updatePersonData"
              />
            </div>
          </div>

          <!-- 右欄：擴充欄位 -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <h6 style="margin-bottom: 10px; color: #333; font-weight: 600; text-align: center;">
              {{ $t('ExpansionField') }}
            </h6>
            <textarea
              :value="note"
              style="
                flex: 1;
                width: 100%;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                resize: none;
                padding: 10px;
                box-sizing: border-box;
                font-family: inherit;
                font-size: 14px;
                background-color: #fff;
              "
              @input="$emit('update:note', $event.target.value)"
            />
          </div>
        </div>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
import DataFieldSection from '@/views/components/DataFieldSection.vue';

export default {
  name: 'Step2FormLine',
  components: {
    DataFieldSection,
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
      default: () => ({ eventData: {}, personData: {} }),
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
  methods: {
    updateEventData(newData) {
      const updatedDataList = {
        ...this.dataList,
        eventData: newData,
      };
      this.$emit('update:dataList', updatedDataList);
    },
    updatePersonData(newData) {
      const updatedDataList = {
        ...this.dataList,
        personData: newData,
      };
      this.$emit('update:dataList', updatedDataList);
    },
  },
};
</script>
