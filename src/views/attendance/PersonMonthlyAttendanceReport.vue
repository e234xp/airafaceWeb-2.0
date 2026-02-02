<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CMonthlyAttendanceReportForm
          :form-data="$data"
          :on-fetch-person-data-callback="onFetchPersonDataCallback"
          :on-fetch-person-attendance-data-callback="onFetchPersonAttendanceDataCallback"
          :on-fetch-single-attendance-data-callback="onFetchSingleAttendanceDataCallback"
        />
      </CCol>
    </CRow>
    <div
      v-if="loading_percent < 100"
      class="loading"
    >
      <CSpinner color="primary" />
      <div>{{ loading_percent }}%</div>
    </div>
  </div>
</template>

<script>
import CMonthlyAttendanceReportForm from './forms/MonthlyAttendanceReportForm.vue';

export default {
  name: 'PersonMonthlyAttendanceReport',
  components: { CMonthlyAttendanceReportForm },
  data() {
    return {
      flag_keepingDownloadPersonData: false,
      flag_keepingDownloadPersonVerifyResult: false,
      flag_keepingDownloadSingleVerifyResult: false,
      disp_header: this.$t('PersonMonthlyAttendanceReport'),
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
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.flag_keepingDownloadPersonData = false;
    this.flag_keepingDownloadPersonVerifyResult = false;
    this.flag_keepingDownloadSingleVerifyResult = false;
    next();
  },
  methods: {
    async downloadPersonDataAsync(sliceShift, sliceSize, keyword, cb, uuidArray = null) {
      if (this.$store.state.loginRedirect) {
        if (cb) cb(null, [], 0);
        return;
      }

      // uuid 保持空字串，UUID 陣列放在第六個參數 (uuidList)
      const ret = await this.$globalFindPersonWithoutPhoto('', sliceShift, sliceSize, keyword, null, uuidArray);
      const { error, data } = ret;

      if (error == null) {
        if (cb) cb(null, data.person_list, data.total_length);
      } else {
        if (cb) cb(error, [], 0);
        this.$fire({
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

    async downloadPersonVerifyResultAsync(dateOnMonth, uuidList, sliceSize, cb) {
      this.loading_percent = 0;
      const date = new Date(dateOnMonth);

      const startTime = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const endTime = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();

      // 收集所有資料
      const allData = [];
      const manualClockInData = []; // querymanualclockinresult 的資料

      // 先取得 AttendanceVerifyResult 資料
      let shitf = 0;
      let thereIsMoreData = true;
      while (this.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
        const ret = await this.$globalAttendanceVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          this.loading_percent = thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50;
          if (data.data && data.data.length > 0) {
            allData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
          this.$fire({
            title: this.$t('NetworkLoss'),
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
      while (this.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
        const ret = await this.$globalManualClockinResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else {
            thereIsMoreData = false;
          }
          this.loading_percent = 50 + (thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50);
          if (data.data && data.data.length > 0) {
            manualClockInData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
        }
      }

      // 合併資料：manualClockInData 優先級最高，會覆蓋 allData 中相同 key 的記錄
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

      this.loading_percent = 100;
      if (cb) cb(null, true, false, mergedData);
    },
    onFetchPersonAttendanceDataCallback(dateOnMonth, uuidList, cb) {
      this.flag_keepingDownloadPersonVerifyResult = true;
      this.downloadPersonVerifyResultAsync(dateOnMonth, uuidList, 15000, cb);
    },

    async downloadSingleVerifyResultAsync(startData, endDate, uuidList, sliceSize, cb) {
      this.loading_percent = 0;
      const start = new Date(startData);
      const end = new Date(endDate);

      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();

      // 收集所有資料
      const allData = [];
      const manualClockInData = []; // querymanualclockinresult 的資料

      // 先取得 PersonVerifyResult 資料
      let shitf = 0;
      let thereIsMoreData = true;
      while (this.flag_keepingDownloadSingleVerifyResult && thereIsMoreData) {
        const ret = await this.$globalPersonVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          this.loading_percent = thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50;
          if (data.data && data.data.length > 0) {
            allData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
          this.$fire({
            title: this.$t('NetworkLoss'),
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
      while (this.flag_keepingDownloadSingleVerifyResult && thereIsMoreData) {
        const ret = await this.$globalManualClockinResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else {
            thereIsMoreData = false;
          }
          this.loading_percent = 50 + (thereIsMoreData ? ((shitf / data.total_length) * 50).toFixed(0) : 50);
          if (data.data && data.data.length > 0) {
            manualClockInData.push(...data.data);
          }
        } else {
          thereIsMoreData = false;
        }
      }

      // 合併資料：manualClockInData 優先級最高，會覆蓋 allData 中相同 key 的記錄
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

      this.loading_percent = 100;
      if (cb) cb(null, true, false, mergedData);
    },
    onFetchSingleAttendanceDataCallback(startData, endDate, uuid, cb) {
      this.flag_keepingDownloadSingleVerifyResult = true;
      this.downloadSingleVerifyResultAsync(startData, endDate, [uuid], 15000, cb);
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
