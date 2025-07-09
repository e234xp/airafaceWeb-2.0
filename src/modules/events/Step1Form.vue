<template>
  <CCard :style="cardStyle">
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
            {{ $t('DeviceGroup') }}
          </th>
        </tr>
        <tr class="table-tr">
          <td class="table-td">
            <CInput size="lg" placeholder="" required
              :is-valid="formPass.name = eventControlNameValidator(eventControlName) === ''"
              :invalid-feedback="eventControlNameValidator(eventControlName)" :value="eventControlName"
              @input="handleUpdateEmitData('name', $event)" />
          </td>
          <td class="table-td">
            <CSelect size="lg" :filterable="true" :options="[
                { value: 'line', label: $t('LineNotify') },
                { value: 'telegram', label: $t('TelegramNotify') },
                { value: 'http', label: $t('HttpCommand') },
                { value: 'mail', label: $t('SendMail') },
                { value: 'iobox', label: $t('IOboxes') },
                { value: 'wiegand', label: $t('Wiegand Converters') },
              ]" :value.sync="value_eventControlType" />
          </td>
          <td class="table-td">
            <multiselect placeholder="" :class="formPass.groupList ? 'is-valid' : 'is-invalid'"
              :value="eventControlGroupList" :options="groupNameOptions" :multiple="true" :taggable="true"
              :hide-selected="true" :select-label="$t('Select')" :selected-label="$t('Selected')"
              :deselect-label="$t('Deselect')" :show-no-options="false"
              @input="groupListValidator($event), handleUpdateEmitData('groupList', $event);" />
            <div v-if="!formPass.groupList" class="invalid-feedback">
              {{ $t('NoEmptyNoSpaceOnly') }}
            </div>
          </td>
          <td class="table-td">
            <multiselect placeholder="" :class="formPass.diviceGroups ? 'is-valid' : 'is-invalid'"
              :value="parseEventControlDiviceGroups" :options="parseDiviceGroupOptions" :multiple="true"
              :taggable="true" :hide-selected="true" :select-label="$t('Select')" :selected-label="$t('Selected')"
              :deselect-label="$t('Deselect')" :show-no-options="false"
              @input="deviceGroupsValidator($event), handleUpdateEmitData('diviceGroups', handleParseDeviceGroup($event));" />
            <div v-if="!formPass.diviceGroups" class="invalid-feedback">
              {{ $t('NoEmptyNoSpaceOnly') }}
            </div>
          </td>
        </tr>

        <tr class="table-tr">
          <th class="h5 w-25 table-th">
            {{ $t('Note') }}
          </th>
        </tr>
        <tr class="table-tr">
          <td class="table-td">
            <CInput size="lg" :value="eventControlRemarks" @input="handleUpdateEmitData('remarks', $event)" />
          </td>
        </tr>
      </table>
    </CCardBody>
  </CCard>
</template>

<script>
  import i18n from '@/i18n';

  import Multiselect from 'vue-multiselect';
  import '@/airacss/vue-multiselect.css';

  export default {
    name: 'Step1Form',
    components: {
      multiselect: Multiselect,
    },
    props: {
      cardStyle: {
        type: String,
        default: 'height: 100%;',
      },
      eventControlUuid: {
        type: String,
        required: true,
        default: '',
      },
      eventControlName: {
        type: String,
        required: true,
        default: '',
      },
      eventControlType: {
        type: String,
        required: true,
        default: '',
      },
      eventControlGroupList: {
        type: Array,
        required: true,
        default: () => [],
      },
      eventControlDiviceGroups: {
        type: Array,
        required: true,
        default: () => [],
      },
      eventControlRemarks: {
        type: String,
        required: true,
        default: '',
      },
    },
    emits: [
      'update:isAllPassed',
      'update:name',
      'update:type',
      'update:groupList',
      'update:diviceGroups',
      'update:remarks',
    ],
    data() {
      return {
        groupNameOptions: this.$route.params.value_groupNameOptions ? this.$route.params.value_groupNameOptions : [],
        diviceGroupOptions: this.$route.params.value_diviceGroupOptions ? this.$route.params.value_diviceGroupOptions : [],
        allRecords: this.$route.params.value_allRecords ? this.$route.params.value_allRecords : [],

        formPass: {
          name: false,
          groupList: false,
          diviceGroups: false,
        },

        ...this.formData,
      };
    },
    computed: {
      value_eventControlType: {
        get() {
          return this.eventControlType;
        },
        set(value) {
          return this.$emit('update:type', value);
        },
      },
      value_eventControlLanguage: {
        get() {
          return this.eventControlLanguage;
        },
        set(value) {
          return this.$emit('update:language', value);
        },
      },
      step1FormStatus() {
        return Object.values(this.formPass).every((status) => status);
      },
      parseDiviceGroupOptions() {
        return this.diviceGroupOptions.map((item) => item.name);
      },
      parseEventControlDiviceGroups() {
        return this.eventControlDiviceGroups.map((id) => {
          let devGroup = this.diviceGroupOptions.find((item) => item.id === id);
          if (devGroup) return devGroup.name;
          else return '';
        });
      },
    },
    methods: {
      handleUpdateEmitData(key, value) {
        this.$emit(`update:${key}`, value);
      },

      eventControlNameValidator(val) {
        if (val.replace(/\s/g, '').length <= 0) {
          return i18n.formatter.format('NoEmptyNoSpace');
        }

        if (this.allRecords.filter((item) => item.name === val && item.uuid !== this.eventControlUuid).length >= 1) {
          return i18n.formatter.format('NoRepeat');
        }

        return '';
      },

      initialValid() {
        this.groupListValidator(this.eventControlGroupList);
        this.deviceGroupsValidator(this.eventControlDiviceGroups);
      },
      groupListValidator(val) {
        if (!Array.isArray(val)) return;

        if (val.length === 0) {
          this.formPass.groupList = false;
        } else {
          this.formPass.groupList = true;
        }
      },
      deviceGroupsValidator(val) {
        if (!Array.isArray(val)) return;

        if (val.length === 0) {
          this.formPass.diviceGroups = false;
        } else {
          this.formPass.diviceGroups = true;
        }
      },
      handleParseDeviceGroup(val) {
        return val.map((name) => this.diviceGroupOptions.find((item) => item.name === name).id);
      },
    },
    watch: {
      step1FormStatus(newStatus) {
        this.$emit('update:isAllPassed', newStatus);
      },
    },
    created() {
      this.initialValid();
    },
  };
</script>