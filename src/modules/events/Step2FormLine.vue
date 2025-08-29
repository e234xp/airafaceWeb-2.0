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
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- 辨識資料區塊 -->
                <div>
                  <h6 style="margin-bottom: 10px; color: #333; font-weight: 600;">
                    辨識資料
                  </h6>
                  <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 4px; padding: 10px;">
                    <DataFieldSection
                      :fields="dataFields"
                      :selected="dataList.eventData || {}"
                      field-type="event"
                      @update:data="updateEventData"
                    />
                  </div>
                </div>
                <!-- 人員資料區塊 -->
                <div>
                  <h6 style="margin-bottom: 10px; color: #333; font-weight: 600;">
                    人員資料
                  </h6>
                  <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 4px; padding: 10px;">
                    <DataFieldSection
                      :fields="personFields"
                      :selected="dataList.personData || {}"
                      field-type="person"
                      @update:data="updatePersonData"
                    />
                  </div>
                </div>
              </div>
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
