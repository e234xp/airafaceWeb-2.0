<template>
  <div>
    <CRow>
      <CCol sm="12">
        <GroupManagementForm
          :form-data="$data"
          :on-add="onAdd"
          :on-modify="onModify"
          :on-check="onCheck"
          :on-delete="onDelete"
          :on-fetch-data-callback="onFetchDataCallback"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import GroupManagementForm from './forms/GroupManagementForm.vue';

const dayjs = require('dayjs');

export default {
  name: 'GroupManagement',
  components: { GroupManagementForm },
  data() {
    return {
      value_emptyPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA'
        + '6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      disp_header: this.$t('Group'),
      value_group_list: [],
    };
  },
  created() {
  },
  updated() {
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  methods: {
    async downloadTableItemsAsync(cb) {
      const ret = await this.$globalGetGroupList();
      const list = ret.group_list;
      const { error } = ret;
      if (error == null) {
        if (list) {
          this.value_group_list = list;
          list.forEach((group) => {
            const localGroup = group;
            localGroup.numberOfPersonInGroup = group.person_list ? group.person_list.length : 0;
            localGroup.numberOfVisitorInGroup = group.visitor_list ? group.visitor_list.length : 0;
            localGroup.createDate = group.create_date ? dayjs(new Date(group.create_date)).format('YYYY-MM-DD') : '';
          });
        }
        if (cb) cb(null, true, false, list);
      } else {
        if (cb) cb(error, true, false, []);
        this.$fire({
          title: this.$t('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },
    async removeGroupAsync(uuid, cb) {
      const ret = await this.$globalRemoveGroup(uuid);
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
      } else if (cb) cb(true);
    },
    onFetchDataCallback(cb) {
      this.downloadTableItemsAsync(cb);
    },
    canDelete() {
      return !(this.$globalAiraManagerSettings.manager_enable === true);
    },
    onAdd() {
      this.$router.push({
        name: 'CreateGroup',
        params: {
          value_returnRoutePath: 'GroupManagement',
          value_returnRouteName: this.$t('Return'),
          value_group_list: this.value_group_list,
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
          this.removeGroupAsync(uuidListToDel, cb);
        }).catch(() => {
          if (cb) cb(false);
        });
      }
    },
    onModify(item) {
      this.$router.push({
        name: 'ModifyGroup',
        params: {
          value_returnRoutePath: 'GroupManagement',
          value_returnRouteName: this.$t('Return'),
          item,
        },
      });
    },
    onCheck(item) {
      this.$router.push({
        name: 'CheckGroup',
        params: {
          value_returnRoutePath: 'GroupManagement',
          value_returnRouteName: this.$t('Return'),
          item,
        },
      });
    },
  },
};
</script>
