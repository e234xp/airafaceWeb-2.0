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
    };
  },
  created() { },
  mounted() {
    this.setWrapperStyle();
  },
  updated() { },
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
    async downloadPersonDataAsync(sliceSize, cb) {
      if (this.$store.state.loginRedirect) {
        if (cb) cb(null, true, false, []);
        return;
      }
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (this.flag_keepingDownloadPersonData && thereIsMoreData) {
        const ret = await this.$globalFindPersonWithoutPhoto('', shitf, sliceSize);
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
    onFetchPersonDataCallback(cb) {
      // console.log('onFetchDataCallback' )
      this.flag_keepingDownloadPersonData = true;
      this.downloadPersonDataAsync(20000, cb);
    },

    async downloadPersonVerifyResultAsync(dateOnDay, uuidList, sliceSize, cb) {
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      // const date = new Date(dateOnDay);
      const startTime = new Date(dateOnDay);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(dateOnDay);
      endTime.setHours(23, 59, 59, 999);

      const startTimeMs = startTime.getTime();
      const endTimeMs = endTime.getTime();
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

          // for (let i = 0; i < data.data.length; i++) {
          //   data.data[i].timestamp += (new Date().getTimezoneOffset() * 60000);
          // }

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
        const ret = await this.$globalPersonVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
        const { error, data } = ret;

        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(error, reset, thereIsMoreData, data.data);
          reset = false;
        } else {
          thereIsMoreData = false;
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
    onFetchPersonAttendanceDataCallback(dateOnDay, uuidList, cb) {
      this.flag_keepingDownloadPersonVerifyResult = true;
      // this.downloadPersonVerifyResultAsync(dateOnDay, uuidList, 2500, cb);
      this.downloadPersonVerifyResultAsync(dateOnDay, [], 250, cb);
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
