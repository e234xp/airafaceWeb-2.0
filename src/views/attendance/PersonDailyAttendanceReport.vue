<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CDailyAttendanceReportForm
          :form-data="$data"
          :on-fetch-person-data-callback="onFetchPersonDataCallback"
          :on-fetch-person-attendance-data-callback="onFetchPersonAttendanceDataCallback"
        />
      </CCol>
    </CRow>
    <div
      class="loading"
      v-if="loading_percent < 100"
    >
      <CSpinner color="primary" />
      <div>{{ loading_percent }}%</div>
    </div>
  </div>
</template>

<script>
import CDailyAttendanceReportForm from './forms/DailyAttendanceReportForm.vue';

export default {
  name: 'PersonDailyAttendanceReport',
  components: { CDailyAttendanceReportForm },
  data() {
    return {
      flag_keepingDownloadPersonData: false,
      flag_keepingDownloadPersonVerifyResult: false,
      disp_header: this.$t('PersonDailyAttendanceReport'),
      disp_id: this.$t('PersonId'),
      disp_name: this.$t('PersonName'),

      flag_downloadingExecl: false,
      loading_percent: 100,
    };
  },
  created() {},
  mounted() {
    this.setWrapperStyle();
  },
  updated() {},
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.$store.state.loginRedirect) {
        window.location.reload();
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    this.flag_keepingDownloadPersonData = false;
    this.flag_keepingDownloadPersonVerifyResult = false;
    next();
  },
  methods: {
    async downloadPersonDataAsync(sliceShift, sliceSize, keyword, cb, uuidArray = null) {
      const self = this;
      if (self.$store.state.loginRedirect) {
        if (cb) cb(null, [], 0);
        return;
      }

      // uuid 保持空字串，UUID 陣列放在第六個參數 (uuidList)
      const ret = await self.$globalFindPersonWithoutPhoto('', sliceShift, sliceSize, keyword, null, uuidArray);
      const { error, data } = ret;

      if (error == null) {
        if (cb) cb(null, data.person_list, data.total_length);
      } else {
        if (cb) cb(error, [], 0);
        self.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },
    onFetchPersonDataCallback(sliceShift, sliceSize, keyword, cb, uuidArray = null) {
      this.downloadPersonDataAsync(sliceShift, sliceSize, keyword, cb, uuidArray);
    },

    async downloadPersonVerifyResultAsync(dateOnDay, uuidList, sliceSize, cb) {
      const self = this;

      self.loading_percent = 0;
      const startTime = new Date(dateOnDay);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(dateOnDay);
      endTime.setHours(23, 59, 59, 999);

      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();

      // 收集所有資料
      const allData = [];
      const manualClockInData = []; // querymanualclockinresult 的資料

      // 先取得 AttendanceVerifyResult 資料
      let shitf = 0;
      let thereIsMoreData = true;
      while (self.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
        const ret = await self.$globalAttendanceVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          self.loading_percent = thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50;
          if (data.data && data.data.length > 0) {
            allData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
          self.$fire({
            title: self.$t('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }

      // 再取得 ManualClockinResult 資料 (優先級最高)
      shitf = 0;
      thereIsMoreData = true;
      while (self.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
        const ret = await self.$globalManualClockinResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else {
            thereIsMoreData = false;
          }
          self.loading_percent = 50 + (thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50);
          if (data.data && data.data.length > 0) {
            manualClockInData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
        }
      }

      // 合併資料：manualClockInData 優先級最高，會覆蓋 allData 中相同 uuid + 相同日期的記錄
      // 先用 allData，然後用 manualClockInData 覆蓋
      const mergedDataMap = new Map();

      // 先加入 allData
      allData.forEach((item) => {
        const key = item.verify_uuid || `${item.uuid}_${item.timestamp}`;
        mergedDataMap.set(key, item);
      });

      // 用 manualClockInData 覆蓋（優先級最高）
      manualClockInData.forEach((item) => {
        const key = item.verify_uuid || `${item.uuid}_${item.timestamp}`;
        mergedDataMap.set(key, item);
      });

      const mergedData = Array.from(mergedDataMap.values());

      self.loading_percent = 100;
      if (cb) cb(null, true, false, mergedData);
    },
    onFetchPersonAttendanceDataCallback(dateOnDay, uuidList, cb) {
      const self = this;
      self.flag_keepingDownloadPersonVerifyResult = true;
      self.downloadPersonVerifyResultAsync(dateOnDay, uuidList, 5000, cb);
    },

    setWrapperStyle() {
      document.querySelector('style').textContent +=
        '@media screen and (max-width: 992px) { ' +
        '.c-wrapper { max-width: 718px !important; margin-left: 256px; } ' +
        '.c-sidebar { margin-left: 0px !important; } ' +
        '.backdrop { display: block !important; } ' +
        '}';
    },
  },
};
</script>

<style>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
