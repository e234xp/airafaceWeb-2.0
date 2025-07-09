<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CScheduleManagementForm :formData="$data" :onAdd="onAdd" :onModify="onModify" :onDelete="onDelete"
          :onFetchDataCallback="onFetchDataCallback" :onFetchActionCallback="onFetchActionCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import i18n from '@/i18n';
  import CScheduleManagementForm from './forms/ScheduleManagementForm.vue';

  export default {
    name: 'ScheduleManagement',
    components: { CScheduleManagementForm },
    data() {
      return {
        type: 'Schedule',
        flag_keepingDownload: false,
        flag_keepingActionDownload: false,
      };
    },
    created() { },
    updated() { },
    beforeRouteEnter(to, from, next) {
      next((vm) => {
        if (vm.$store.state.loginRedirect) {
          window.location.reload();
        }
      });
    },
    beforeRouteLeave(to, from, next) {
      console.log('ScheduleManagement', to, from, next);
      this.flag_keepingDownload = false;
      this.flag_keepingActionDownload = false;
      next();
    },
    methods: {
      async downloadTableItemsAsync(sliceSize, cb) {
        const self = this;
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;

        // const getLineNotifyList = (q, f, s) => new Promise((resolve) => {
        //   self.$globalGetLineNotifyList(q, f, s, (err, data) => {
        //     resolve({ error: err, data });
        //   });
        // });

        while (self.flag_keepingDownload && thereIsMoreData) {
          const ret = await self.$globalGetScheduleList(
            '', shitf, sliceSize,
          );
          // const ret = getLineNotifyList('', shitf, sliceSize);
          const rData = ret.data;
          const rErr = ret.error;
          if (rErr == null) {
            if (rData.total_length && rData.total_length > (sliceSize + shitf)) {
              thereIsMoreData = true;
              shitf += sliceSize;
            } else thereIsMoreData = false;
            if (cb) cb(rErr, reset, thereIsMoreData, rData.data_list);
            reset = false;
          } else {
            thereIsMoreData = false;
            if (cb) cb(rErr, true, false, []);
            self.$fire({
              title: i18n.formatter.format('NetworkLoss'),
              text: '',
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
        }
      },

      async downloadActionItemsAsync(sliceSize, cb) {
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;

        while (this.flag_keepingActionDownload && thereIsMoreData) {
          const ret = await this.$globalGetActionRuleList(
            '', shitf, sliceSize,
          );
          // const ret = getLineNotifyList('', shitf, sliceSize);
          const rData = ret.data;
          const rErr = ret.error;
          if (rErr == null) {
            if (rData.total_length && rData.total_length > (sliceSize + shitf)) {
              thereIsMoreData = true;
              shitf += sliceSize;
            } else thereIsMoreData = false;
            if (cb) cb(rErr, reset, thereIsMoreData, rData.data_list);
            reset = false;
          } else {
            thereIsMoreData = false;
            if (cb) cb(rErr, true, false, []);
            this.$fire({
              title: i18n.formatter.format('NetworkLoss'),
              text: '',
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
        }
      },

      onFetchDataCallback(cb) {
        const self = this;
        self.flag_keepingDownload = true;
        self.downloadTableItemsAsync(/* sliceSize */ 3000, cb);
      },

      onFetchActionCallback(cb) {
        this.flag_keepingActionDownload = true;
        this.downloadActionItemsAsync(/* sliceSize */ 3000, cb);
      },

      onAdd(allRecords) {
        this.$router.push({
          name: 'AddSchedule',
          params: {
            value_allRecords: allRecords,
            value_returnRoutePath: 'ScheduleManagement',
            value_returnRouteName: i18n.formatter.format('Return'),
          },
        });
      },

      async onModify(item) {
        this.$router.push({
          name: 'ModifySchedule',
          params: {
            value_returnRoutePath: 'ScheduleManagement',
            value_returnRouteName: i18n.formatter.format('Return'),
            value_item: item,
          },
        });
      },

      onDelete(items, cb) {
        const self = this;
        if (items && Array.isArray(items)) {
          const uuidListToDel = [];
          items.forEach((item) => {
            uuidListToDel.push(item.uuid);
          });
          self.$confirm('', i18n.formatter.format('ConfirmToDelete'), {
            confirmButtonText: i18n.formatter.format('Confirm'),
            cancelButtonText: i18n.formatter.format('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          }).then(() => {
            self.removeRecordAsync(uuidListToDel, cb);
          }).catch(() => {
            if (cb) cb(false);
          });
        }
      },

      async removeRecordAsync(uuid, cb) {
        const self = this;
        const ret = await self.$globalRemoveSchedule(uuid);
        const err = ret.error;
        if (err) {
          if (cb) cb(false);
          self.$fire({
            text: i18n.formatter.format('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: i18n.formatter.format('OK'),
          });
        } else if (cb) cb(true);
      },
    },
  };
</script>