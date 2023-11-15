<template>
  <div>
    <CRow>
      <CCol sm="12">
        <GroupManagementForm :formData="$data" :onAdd="onAdd" :onModify="onModify" :onCheck="onCheck"
          :onDelete="onDelete" :onFetchDataCallback="onFetchDataCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';
import GroupManagementForm from './forms/GroupManagementForm.vue';

const dayjs = require('dayjs');

export default {
  name: 'GroupManagement',
  components: { GroupManagementForm },
  data() {
    return {
      value_emptyPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA'
        + '6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      disp_header: i18n.formatter.format('Group'),
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
      const self = this;
      const ret = await self.$globalGetGroupList();
      const list = ret.group_list;
      const { error } = ret;
      if (error == null) {
        if (list) {
          self.value_group_list = list;
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
        self.$fire({
          title: i18n.formatter.format('NetworkLoss'),
          text: '',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },
    async removeGroupAsync(uuid, cb) {
      const self = this;
      const ret = await self.$globalRemoveGroup(uuid);
      const { error } = ret;
      if (error) {
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
    onFetchDataCallback(cb) {
      const self = this;
      self.downloadTableItemsAsync(cb);
    },
    onAdd() {
      const self = this;
      self.$router.push({
        name: 'CreateGroup',
        params: {
          value_returnRoutePath: 'GroupManagement',
          value_returnRouteName: i18n.formatter.format('Return'),
          value_group_list: self.value_group_list,
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
          self.removeGroupAsync(uuidListToDel, cb);
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
          value_returnRouteName: i18n.formatter.format('Return'),
          item,
        },
      });
    },
    onCheck(item) {
      this.$router.push({
        name: 'CheckGroup',
        params: {
          value_returnRoutePath: 'GroupManagement',
          value_returnRouteName: i18n.formatter.format('Return'),
          item,
        },
      });
    },
  },
};
</script>
