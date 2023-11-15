<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CHttpNotifyManagementForm :formData="$data" :onAdd="onAdd"
          :onModify="onModify" :onDelete="onDelete"
          :onFetchDataCallback="onFetchDataCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';
import CHttpNotifyManagementForm from './forms/HttpNotifyManagementForm.vue';

export default {
  name: 'HttpNotifyManagement',
  components: { CHttpNotifyManagementForm },
  data() {
    return {
      type: 'HttpNotify',
      flag_keepingDownload: false,
    };
  },
  created() { },
  updated() { },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    console.log('HttpNotifyManagement', to, from, next);
    this.flag_keepingDownload = false;
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
        const ret = await self.$globalGetHttpNotifyList(
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

    onFetchDataCallback(cb) {
      const self = this;
      self.flag_keepingDownload = true;
      self.downloadTableItemsAsync(/* sliceSize */ 3000, cb);
    },

    onAdd(allRecords) {
      this.$router.push({
        name: 'AddHttpNotify',
        params: {
          value_allRecords: allRecords,
          value_returnRoutePath: 'HttpNotifyManagement',
          value_returnRouteName: i18n.formatter.format('Return'),
        },
      });
    },

    async onModify(item) {
      this.$router.push({
        name: 'ModifyHttpNotify',
        params: {
          value_returnRoutePath: 'HttpNotifyManagement',
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
        self.$confirm('', i18n.formatter.format('ConfirmToDelete'), 'question', {
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
      const ret = await self.$globalRemoveHttpNotify(uuid);
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
