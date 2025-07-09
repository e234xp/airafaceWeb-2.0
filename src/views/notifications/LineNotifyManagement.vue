<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CLineNotifyManagementForm :form-data="$data" :on-add="onAdd" :on-modify="onModify" :on-delete="onDelete"
          :on-fetch-data-callback="onFetchDataCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CLineNotifyManagementForm from './forms/LineNotifyManagementForm.vue';

  export default {
    name: 'LineNotifyManagement',
    components: { CLineNotifyManagementForm },
    data() {
      return {
        type: 'LineNotify',
        flag_keepingDownload: false,
      };
    },
    created() { },
    updated() { },
    beforeRouteEnter(to, from, next) {
      next();
    },
    beforeRouteLeave(to, from, next) {
      console.log('LineNotifyManagement', to, from, next);
      this.flag_keepingDownload = false;
      next();
    },
    methods: {
      async downloadTableItemsAsync(sliceSize, cb) {
        let shitf = 0;
        let reset = true;
        let thereIsMoreData = true;

        // const getLineNotifyList = (q, f, s) => new Promise((resolve) => {
        //   this.$globalGetLineNotifyList(q, f, s, (err, data) => {
        //     resolve({ error: err, data });
        //   });
        // });

        while (this.flag_keepingDownload && thereIsMoreData) {
          const ret = await this.$globalGetLineNotifyList(
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
              title: this.$t('NetworkLoss'),
              text: '',
              type: 'error',
              timer: 3000,
              confirmButtonColor: '#20a8d8',
            });
          }
        }
      },

      onFetchDataCallback(cb) {
        this.flag_keepingDownload = true;
        this.downloadTableItemsAsync(/* sliceSize */ 3000, cb);
      },

      onAdd(allRecords) {
        this.$router.push({
          name: 'AddLineNotify',
          params: {
            value_allRecords: allRecords,
            value_returnRoutePath: 'LineNotifyManagement',
            value_returnRouteName: this.$t('Return'),
          },
        });
      },

      async onModify(item) {
        this.$router.push({
          name: 'ModifyLineNotify',
          params: {
            value_returnRoutePath: 'LineNotifyManagement',
            value_returnRouteName: this.$t('Return'),
            value_item: item,
          },
        });
      },

      onDelete(items, cb) {
        if (items && Array.isArray(items)) {
          const uuidListToDel = [];
          items.forEach((item) => {
            uuidListToDel.push(item.uuid);
          });
          this.$confirm('', this.$t('ConfirmToDelete'), {
            confirmButtonText: this.$t('Confirm'),
            cancelButtonText: this.$t('Cancel'),
            confirmButtonColor: '#20a8d8',
            cancelButtonColor: '#f86c6b',
          }).then(() => {
            this.removeRecordAsync(uuidListToDel, cb);
          }).catch(() => {
            if (cb) cb(false);
          });
        }
      },

      async removeRecordAsync(uuid, cb) {
        const ret = await this.$globalRemoveLineNotify(uuid);
        const err = ret.error;
        if (err) {
          if (cb) cb(false);
          this.$fire({
            text: this.$t('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: this.$t('OK'),
          });
        } else if (cb) cb(true);
      },
    },
  };
</script>