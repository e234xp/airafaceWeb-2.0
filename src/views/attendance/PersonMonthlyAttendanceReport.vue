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
      class="loading"
      v-if="loading_percent < 100"
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
  created() { },
  mounted() {
    this.setWrapperStyle();
  },
  updated() { },
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
    async downloadPersonDataAsync(sliceSize, cb) {
      const self = this;
      if (self.$store.state.loginRedirect) {
        if (cb) cb(null, true, false, []);
        return;
      }
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (self.flag_keepingDownloadPersonData && thereIsMoreData) {
        const ret = await self.$globalFindPersonWithoutPhoto('', shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.person_list);
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, false, []);
          self.$fire({
            title: this.$t('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    onFetchPersonDataCallback(cb) {
      // console.log('onFetchDataCallback' )
      const self = this;
      self.flag_keepingDownloadPersonData = true;
      self.downloadPersonDataAsync(20000, cb);
    },

    async downloadPersonVerifyResultAsync(dateOnMonth, uuidList, sliceSize, cb) {
      const self = this;

      this.loading_percent = 0;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      const date = new Date(dateOnMonth);

      const startTime = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const endTime = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();
      while (this.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
        console.log("downloadPersonVerifyResultAsync 1", new Date() );

        const ret = await this.$globalManualClockinResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;
        console.log("downloadPersonVerifyResultAsync 2", new Date() );

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else {
            thereIsMoreData = false;
          }

          if (cb) cb(error, reset, true, data.data);
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, true, []);
        }
      }

      shitf = 0;
      reset = true;
      thereIsMoreData = true;
      while (this.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {

        console.log("globalAttendanceVerifyResult 1", new Date() );

        const ret = await this.$globalAttendanceVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;
        console.log("globalAttendanceVerifyResult 2", new Date() );

        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          this.loading_percent = thereIsMoreData ? ((shitf / data.total_length) * 100).toFixed(0) : 100;
          if (cb) cb(error, reset, thereIsMoreData, data.data);
          reset = false;
        } else {
          thereIsMoreData = false;
          this.loading_percent = 100;
          if (cb) cb(error, true, false, []);
          this.$fire({
            title: this.$t('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    onFetchPersonAttendanceDataCallback(dateOnMonth, uuidList, cb) {
      this.flag_keepingDownloadPersonVerifyResult = true;
      // this.downloadPersonVerifyResultAsync(dateOnMonth, uuidList, 2500, cb);
      this.downloadPersonVerifyResultAsync(dateOnMonth, [], 15000, cb);
    },

    async downloadSingleVerifyResultAsync(startData, endDate, uuidList, sliceSize, cb) {
      this.loading_percent = 0;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      const start = new Date(startData);
      const end = new Date(endDate);

      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();
      while (this.flag_keepingDownloadSingleVerifyResult && thereIsMoreData) {

        console.log("globalManualClockinResult 1", new Date() );

        const ret = await this.$globalManualClockinResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;
        console.log("globalManualClockinResult 2", new Date() );

        if (error == null) {
          if (data.total_length && data.total_length > sliceSize + shitf) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else {
            thereIsMoreData = false;
          }

          if (cb) cb(error, reset, true, data.data);
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, true, []);
        }
      }

      shitf = 0;
      reset = true;
      thereIsMoreData = true;
      while (this.flag_keepingDownloadSingleVerifyResult && thereIsMoreData) {
        console.log("globalPersonVerifyResult 1", new Date() );

        const ret = await this.$globalPersonVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;
        console.log("globalPersonVerifyResult 2", new Date() );

        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          this.loading_percent = thereIsMoreData ? ((shitf / data.total_length) * 100).toFixed(0) : 100;
          if (cb) cb(error, reset, thereIsMoreData, data.data);
          reset = false;
        } else {
          thereIsMoreData = false;
          this.loading_percent = 100;
          if (cb) cb(error, true, false, []);
          this.$fire({
            title: this.$t('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    onFetchSingleAttendanceDataCallback(startData, endDate, uuid, cb) {
      this.flag_keepingDownloadSingleVerifyResult = true;
      this.downloadSingleVerifyResultAsync(startData, endDate, [uuid], 15000, cb);
    },

    setWrapperStyle() {
      document.querySelector('style').textContent
        += '@media screen and (max-width: 992px) { '
        + '.c-wrapper { max-width: 718px !important; margin-left: 256px; } '
        + '.c-sidebar { margin-left: 0px !important; } '
        + '.backdrop { display: block !important; } '
        + '}';
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
