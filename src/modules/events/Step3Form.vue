<template>
  <CCard :style="cardStyle">
    <CCardBody>
      <div style="height: 50px" />
      <CCol sm="12">
        <CRow>
          <CCol sm="6">
            <div class="h5">
              {{ $t('SelectedWeeklySchedule') }}
            </div>
            <Scheduler :multiple="true" :locale="locale" :value="eventControlSelectedWeeklySchedule"
              @change="handleUpdateEmitData('selectedWeeklySchedule', $event)" />
          </CCol>
          <CCol sm="6">
            <div class="h5">
              {{ $t('SpecifiedDatetimeRange') }}
            </div>
            <div class="d-flex">
              <date-picker type="datetime" range :lang="this.$globalDatePickerLanguage" :value="specifiedDatetimeRange"
                :placeholder="$t('SelectDatetimeRange')"
                @change="handleUpdateEmitData('specifiedDatetimeRange', $event)" />
              <CButton class="btn btn-outline-primary btn-add ml-2 p-0" @click="clickOnInsertSchedule()">
                +
              </CButton>
            </div>
            <div style="height: 5px" />
            <vxe-table id="ScheduleTable" height="380" stripe empty-text=" " :show-header="false"
              :data="specifiedDatetimeToShow" :cell-style="cellStyle">
              <vxe-table-column show-overflow width="60">
                <template #default="{ row }">
                  <vxe-button type="text" icon="far fa-minus-square" @click="deleteItemEvent(row)" />
                </template>
              </vxe-table-column>
              <vxe-table-column show-overflow field="display_string" width="400px" />
            </vxe-table>
          </CCol>
        </CRow>
      </CCol>
    </CCardBody>
  </CCard>
</template>

<script>
  import VueScheduler from '@duoa/vue-scheduler';
  import '@/airacss/vue-scheduler.css';

  import { v4 as UUIDv4 } from 'uuid';

  export default {
    name: 'Step3Form',
    components: {
      Scheduler: VueScheduler,
    },
    props: {
      isAllPassed: Boolean,
      cardStyle: String,
      eventControlType: String,

      eventControlSelectedWeeklySchedule: Object,
      specifiedDatetimeRange: Array,
      specifiedDatetimeToShow: Array,

      formatDateToYYYYMMDD_HHMMSS: {
        type: Function,
        required: true,
        default: () => '',
      },
    },
    emits: [
      'update:specifiedDatetimeToShow',
      'update:specifiedDatetimeRange',
    ],
    data() {
      return {
        value_groupsNameList: [
          'All Person',
          'All Visitor',
        ],
        value_remarks: '',
        locale: {
          AM: this.$t('AM'),
          PM: this.$t('PM'),
          TIME_TITLE: this.$t('Time'),
          WEEK_TITLE: this.$t('Date'),
          WEEK_DAYS: [this.$t('Sun'), this.$t('Mon'), this.$t('Tue'), this.$t('Wed'), this.$t('Thu'), this.$t('Fri'), this.$t('Sat')],
          HOURS: [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
            '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
          ],
          DRAG_TIP: this.$t('DragSelect'),
          RESET: this.$t('ResetSelected'),
        },

        ...this.formData,
      };
    },
    methods: {
      handleUpdateEmitData(key, value) {
        this.$emit(`update:${key}`, value);
      },
      cellStyle() {
        return 'fontSize: 16px;';
      },

      clickOnInsertSchedule() {
        if (this.specifiedDatetimeRange.length == 2) {
          const startTime = this.specifiedDatetimeRange[0];
          const endTime = this.specifiedDatetimeRange[1];
          if (startTime != null && endTime != null) {
            this.handleUpdateEmitData('specifiedDatetimeToShow', [
              ...this.specifiedDatetimeToShow,
              {
                uuid: UUIDv4(),
                display_string:
                  `${this.formatDateToYYYYMMDD_HHMMSS(startTime)} ~ ${this.formatDateToYYYYMMDD_HHMMSS(endTime)}`,
                start_time: startTime.getTime(),
                end_time: endTime.getTime(),
              },
            ]);
          }
        }
        this.handleUpdateEmitData('specifiedDatetimeRange', [null, null]);
      },
      deleteItemEvent(item) {
        this.handleUpdateEmitData('specifiedDatetimeToShow', this.specifiedDatetimeToShow.filter(
          (data) => data.uuid != item.uuid,
        ));
      },
    },
  };
</script>