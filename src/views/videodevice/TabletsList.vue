<template>
  <div>
    <CRow>
      <CCol sm="12">
        <ListForm :on-add="onAdd" :on-delete="onDelete" :on-modify="onModify" :on-get-items="onGetItems" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import TableObserver from '@/utils/TableObserver.vue';

  import ListForm from '@/modules/videodevice/tabletslist/ListForm.vue';

  export default {
    name: 'CameraList',
    mixins: [TableObserver],
    components: { ListForm },
    methods: {
      async onGetItems() {
        return this.getItems(0, 3000);
      },

      async getItems(shift, sliceSize) {
        const ret = await this.$globalGetTabletList('', shift, sliceSize);
        const {
          data: { data_list: dataList },
          error,
        } = ret;

        if (error) {
          this.$fire({
            title: this.$t('NetworkLoss'),
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
          name: 'AddTablets',
          params: {
            value_returnRoutePath: 'TabletsList',
            value_returnRouteName: this.$t('Return'),
          },
        });
      },

      // 修改
      async onModify(item) {
        this.$router.push({
          name: 'ModifyTablets',
          params: {
            value_returnRoutePath: 'TabletsList',
            value_returnRouteName: this.$t('Return'),
            item,
          },
        });
      },

      // 刪除
      onDelete(items, cb) {
        if (!items || !Array.isArray(items)) return;

        const uuidListToDel = items.map(({ uuid }) => uuid);
        this.$confirm('', this.$t('ConfirmToDelete'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        })
          .then(() => {
            this.deleteCamera(uuidListToDel, cb);
          })
          .catch(() => {
            if (cb) cb(false);
          });
      },

      async deleteCamera(uuid, cb) {
        const ret = await this.$globalRemoveTablets(uuid);
        const { error } = ret;

        if (error) {
          if (cb) cb(false);
          this.$fire({
            text: this.$t('OperationFailed'),
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
            confirmButtonText: this.$t('OK'),
          });
        }
        if (cb) cb(true);
      },
    },
  };
</script>