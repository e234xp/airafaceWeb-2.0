<template>
  <CCard
    :style="cardStyle"
  >
    <CCardBody>
      <table class="table-layout">
        <tr class="table-tr">
          <th class="h5 w-25 table-th">
            {{ $t('EventControlName') }}
          </th>
          <th class="h5 w-25 table-th">
            {{ $t('EventControlType') }}
          </th>
          <th class="h5 w-25 table-th">
            {{ $t('GroupToApply') }}
          </th>
          <th class="h5 w-25 table-th">
            {{ $t('Note') }}
          </th>
        </tr>
        <tr class="table-tr">
          <td class="table-td">
            <CInput
              size="lg"
              placeholder=""
              required
              :invalid-feedback="$t('NoEmptyNorSpaceNeigherRepeat')"
              :value="eventControlName"
              :is-valid="eventControlNameValidator"
              @input="handleUpdateEmitData('eventControlName', $event)"
            />
          </td>
          <td class="table-td">
            <CSelect
              size="lg"
              :value.sync="value_eventControlType"
              :options="[
                { value: 'line', label: $t('LineNotify') },
                { value: 'http', label: $t('HttpCommand') },
                { value: 'mail', label: $t('SendMail') }
              ]"
            />
          </td>
          <td class="table-td">
            <multiselect
              placeholder=""
              :class="flag_groupListPass ? 'is-valid' : 'is-invalid'"
              :value="eventControlGroupList"
              :options="value_groupsNameList"
              :multiple="true"
              :taggable="true"
              :hide-selected="true"
              :select-label="$t('Select')"
              :selected-label="$t('Selected')"
              :deselect-label="$t('Deselect')"
              :show-no-options="false"
              @input="groupListValidator($event), handleUpdateEmitData('eventControlGroupList', $event);"
            />
            <div
              v-if="!flag_groupListPass"
              class="invalid-feedback"
            >
              {{ $t('NoEmptyNoSpaceOnly') }}
            </div>
          </td>
          <td class="table-td">
            <CInput
              size="lg"
              :value="eventControlRemarks"
              @input="handleUpdateEmitData('eventControlRemarks', $event)"
            />
          </td>
        </tr>
      </table>
    </CCardBody>
  </CCard>
</template>

<script>
import Multiselect from 'vue-multiselect';
import '@/airacss/vue-multiselect.css';

export default {
  name: 'Step1Form',
  components: {
    multiselect: Multiselect,
  },
  props: {
    isAllPassed: Boolean,
    cardStyle: String,
    handleUpdateData: Function,
    eventControlType: String,

    eventControlName: String,
    eventControlGroupList: Array,
    eventControlRemarks: String,
  },
  emits: [
    'update:isAllPassed',
    'update:eventControlName',
    'update:eventControlType',
    'update:eventControlRemarks',
  ],
  data() {
    return {
      value_groupsNameList: [
        'All Person',
        'All Visitor',
      ],
      value_remarks: '',

      flag_eventNamePass: false,
      flag_groupListPass: false,

      ...this.formData,
    };
  },
  computed: {
    value_eventControlType: {
      get() {
        return this.eventControlType;
      },
      set(value) {
        return this.$emit('update:eventControlType', value);
      },
    },
    step1FormStatus() {
      return this.flag_eventNamePass && this.flag_groupListPass;
    },
  },
  methods: {
    handleUpdateEmitData(key, value) {
      this.$emit(`update:${key}`, value);
    },

    eventControlNameValidator(val) {
      if (val.replace(/\s/g, '').length === 0) {
        this.flag_eventNamePass = false;
      } else {
        this.flag_eventNamePass = val.length > 0;
      }

      return this.flag_eventNamePass;
    },

    groupListValidator(val) {
      if (!Array.isArray(val)) return;

      if (val.length === 0) {
        this.flag_groupListPass = false;
      } else {
        this.flag_groupListPass = true;
      }
    },

    // Fetch Groups
    async fetchGroupsData() {
      const ret = await this.$globalGetGroupList();
      const list = ret.group_list;
      const { error } = ret;
      if (error == null) {
        if (list) {
          this.value_groupsNameList = list.map((item) => item.name);
        }
      } else {
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },
  },
  watch: {
    step1FormStatus(status) {
      this.$emit('update:isAllPassed', status);
    },
  },
  mounted() {
    this.fetchGroupsData();
  },
};
</script>
