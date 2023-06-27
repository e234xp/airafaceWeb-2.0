<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CDailyAttendanceReportForm :formData="$data" :onFetchPersonDataCallback="onFetchPersonDataCallback"
          :onFetchPersonAttendanceDataCallback="onFetchPersonAttendanceDataCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CDailyAttendanceReportForm from "./forms/DailyAttendanceReportForm.vue";

  import i18n from "../../i18n";
  export default {
    name: "PersonDailyAttendanceReport",
    components: { CDailyAttendanceReportForm },
    data() {
      return {
        flag_keepingDownloadPersonData: false,
        flag_keepingDownloadPersonVerifyResult: false,
        disp_header: i18n.formatter.format("PersonDailyAttendanceReport"),
        disp_id: i18n.formatter.format("PersonId"),
        disp_name: i18n.formatter.format("PersonName"),
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
        const self = this;
        if (self.$store.state.loginRedirect) {
          if (cb) cb(null, true, false, []);
          return;
        }
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;
        while (self.flag_keepingDownloadPersonData && thereIsMoreData) {
          let ret = await self.$globalFindPersonWithoutPhoto("", shitf, sliceSize);
          const data = ret.data;
          const error = ret.error;
          if (error == null) {
            if (data.total_length && data.total_length > (sliceSize + shitf)) {
              thereIsMoreData = true;
              shitf += sliceSize;
            }
            else thereIsMoreData = false;
            if (cb) cb(error, reset, thereIsMoreData, data.person_list);
            reset = false;
          }
          else {
            thereIsMoreData = false;
            if (cb) cb(error, true, false, []);
            self.$fire({
              title: i18n.formatter.format("NetworkLoss"),
              text: "",
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8"
            });
          }
        }
      },
      onFetchPersonDataCallback(cb) {
        // console.log("onFetchDataCallback" )
        const self = this;
        self.flag_keepingDownloadPersonData = true;
        self.downloadPersonDataAsync(/* sliceSize */ 3000, cb);
      },

      async downloadPersonVerifyResultAsync(dateOnDay, uuidList, sliceSize, cb) {
        const self = this;
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;
        const date = new Date(dateOnDay);
        const startTime = new Date(dateOnDay);
        startTime.setHours(0, 0, 0, 0);
        const endTime = new Date(dateOnDay);
        endTime.setHours(23, 59, 59, 999);

        const startTimeMs = startTime.getTime();
        const endTimeMs = endTime.getTime();
        while (self.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
          let ret = await self.$globalManualClockinResult(
            uuidList,
            startTimeMs,
            endTimeMs,
            shitf,
            sliceSize
          );
          const data = ret.data;
          const error = ret.error;
          if (error == null) {
            if (data.total_length && data.total_length > sliceSize + shitf) {
              thereIsMoreData = true;
              shitf += sliceSize;
            }
            else {
              thereIsMoreData = false;
            }
            if (cb) cb(error, reset, true, data.data);
            reset = false;
          }
          else {
            thereIsMoreData = false;
            if (cb) cb(error, true, true, []);
          }
        }

        shitf = 0;
        reset = true;
        thereIsMoreData = true;
        while (self.flag_keepingDownloadPersonVerifyResult && thereIsMoreData) {
          let ret = await self.$globalPersonVerifyResult(uuidList, startTimeMs, endTimeMs, shitf, sliceSize);
          const data = ret.data;
          const error = ret.error;
          if (error == null) {
            if (data.total_length && data.total_length > (sliceSize + shitf)) {
              thereIsMoreData = true;
              shitf += sliceSize;
            }
            else thereIsMoreData = false;
            if (cb) cb(error, reset, thereIsMoreData, data.data);
            reset = false;
          }
          else {
            thereIsMoreData = false;
            if (cb) cb(error, true, false, []);
            self.$fire({
              title: i18n.formatter.format("NetworkLoss"),
              text: "",
              type: "error",
              timer: 3000,
              confirmButtonColor: "#20a8d8"
            });
          }
        }
      },
      onFetchPersonAttendanceDataCallback(dateOnDay, uuidList, cb) {
        const self = this;
        self.flag_keepingDownloadPersonVerifyResult = true;
        self.downloadPersonVerifyResultAsync(dateOnDay, uuidList, /* sliceSize */ 1000, cb);
      },
      setWrapperStyle() {
        document.querySelector("style").textContent +=
          "@media screen and (max-width: 992px) { " +
          ".c-wrapper { max-width: 718px !important; margin-left: 256px; } " +
          ".c-sidebar { margin-left: 0px !important; } " +
          ".backdrop { display: block !important; } " +
          "}";
      },
    },
  };
</script>