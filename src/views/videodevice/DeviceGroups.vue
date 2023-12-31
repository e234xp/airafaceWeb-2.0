<template>
  <div>
    <CRow>
      <CCol sm="12">
        <ListForm :onAdd="onAdd" :onDelete="onDelete" :onModify="onModify" :onGetItems="onGetItems" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';

import ListForm from '@/modules/videodevice/videodevicegrouplist/ListForm.vue';
import TableObserver from '@/utils/TableObserver.vue';

export default {
  name: 'VideoDeviceGroups',
  mixins: [TableObserver],
  components: { ListForm },
  methods: {
    async onGetItems() {
      return this.getItems(0, 3000);
    },

    async getItems(shift, sliceSize) {
      const ret = await this.$globalFindVideoDeviceGroups('', shift, sliceSize);
      const {
        data: { result: dataList },
        error,
      } = ret;

      if (error) {
        this.$fire({
          title: i18n.formatter.format('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }

      return dataList;
    },

    // 新增
    onAdd() {
      this.$router.push({
        name: 'AddVideoDeviceGroups',
        params: {
          value_returnRoutePath: 'DeviceGroups',
          value_returnRouteName: i18n.formatter.format('Return'),
        },
      });
    },

    // 修改
    async onModify(item) {
      this.$router.push({
        name: 'ModifyVideoDeviceGroups',
        params: {
          value_returnRoutePath: 'DeviceGroups',
          value_returnRouteName: i18n.formatter.format('Return'),
          item,
        },
      });
    },

    // 刪除
    onDelete(items, cb) {
      if (!items || !Array.isArray(items)) return;

      const uuidListToDel = items.map(({ uuid }) => uuid);
      this.$confirm('', i18n.formatter.format('ConfirmToDelete'), {
        confirmButtonText: i18n.formatter.format('Confirm'),
        cancelButtonText: i18n.formatter.format('Cancel'),
        confirmButtonColor: '#20a8d8',
        cancelButtonColor: '#f86c6b',
      })
        .then(() => {
          this.deleteVideoDeviceGroups(uuidListToDel, cb);
        })
        .catch(() => {
          if (cb) cb(false);
        });
    },

    async deleteVideoDeviceGroups(uuid, cb) {
      const ret = await this.$globalRemoveVideoDeviceGroups(uuid);
      const { error } = ret;

      if (error) {
        if (cb) cb(false);
        this.$fire({
          text: i18n.formatter.format('OperationFailed'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
      }
      if (cb) cb(true);
    },
  },
};
</script>
