<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CEventManagementForm
          :form-data="$data"
          :on-add="onAdd"
          :on-modify="onModify"
          :on-delete="onDelete"
          :on-fetch-data-callback="onFetchDataCallback"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CEventManagementForm from './forms/EventManagementForm.vue';

export default {
  name: 'EventControlManagement',
  components: { CEventManagementForm },
  data() {
    return {
      type: 'EventControl',
      flag_keepingDownload: false,
      actionTypeList: ['http', 'line', 'mail', 'wiegand', 'iobox'],

      value_groupNameOptions: [],
      value_diviceGroupOptions: [],
    };
  },
  beforeRouteLeave(to, from, next) {
    console.log('EventControlManagement', to, from, next);
    this.flag_keepingDownload = false;
    next();
  },
  methods: {
    async downloadTableItemsAsync(sliceSize, cb) {
      let reset = true;
      let thereIsMoreData = true;

      while (this.flag_keepingDownload && thereIsMoreData) {
        const ret = await this.$globalGetEventList(
          '', this.actionTypeList,
        );
        const rData = {
          list: ret.data.list,
        };
        const rErr = ret.error;
        if (rErr == null) {
          if (rData.total_length && rData.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) cb(rErr, reset, thereIsMoreData, rData.list);
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
    async fetchGroupsData() {
      const [ret1, ret2] = await Promise.all([
        this.$globalGetGroupList(),
        this.$globalFindVideoDeviceGroups(''),
      ]);
      if (ret1.error === null && ret2.error === null) {
        if (ret1?.group_list) {
          this.value_groupNameOptions = ret1?.group_list.map((item) => item.name);
        }

        if (ret2?.data) {
          this.value_diviceGroupOptions = ret2?.data.result.map((item) => item.uuid);
        }
      } else {
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },

    async onFetchDataCallback(cb) {
      this.flag_keepingDownload = true;
      await this.downloadTableItemsAsync(/* sliceSize */ 3000, cb);
      await this.fetchGroupsData();
    },

    onAdd(allRecords) {
      console.log('allRecords', allRecords);
      this.$router.push({
        name: 'CreateEventControlSetting',
        params: {
          value_allRecords: allRecords,
          value_returnRoutePath: 'EventControlManagement',
          value_returnRouteName: this.$t('Return'),
          value_groupNameOptions: this.value_groupNameOptions,
          value_diviceGroupOptions: this.value_diviceGroupOptions,
        },
      });
    },

    async onModify(item) {
      this.$router.push({
        name: 'ModifyEventControlSetting',
        params: {
          value_returnRoutePath: 'EventControlManagement',
          value_returnRouteName: this.$t('Return'),
          value_item: item,
          value_groupNameOptions: this.value_groupNameOptions,
          value_diviceGroupOptions: this.value_diviceGroupOptions,
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
      const ret = await this.$globalRemoveEventHandle(uuid);
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
