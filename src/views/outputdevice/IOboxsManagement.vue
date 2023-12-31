<template>
  <div>
    <CRow>
      <CCol sm="12">
        <ListForm
          :onAdd="onAdd"
          :onDelete="onDelete"
          :onModify="onModify"
          :onGetItems="onGetItems"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import ListForm from "@/modules/outputdevice/IOboxlist/ListForm.vue";

import TableObserver from "@/utils/TableObserver.vue";
import i18n from "@/i18n";

export default {
  name: "CameraList",
  mixins: [TableObserver],
  components: { ListForm },
  methods: {
    async onGetItems() {
      return this.getItems(0, 3000);
    },

    async getItems(shift, sliceSize) {
      const ret = await this.$globalFindIoBoxes("", shift, sliceSize);
      const {
        data: { list: dataList },
        error,
      } = ret;

      if (error) {
        this.$fire({
          title: i18n.formatter.format("NetworkLoss"),
          text: "",
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
        });
      }

      return dataList;
    },

    // 新增
    onAdd() {
      this.$router.push({
        name: "AddIOboxs",
        params: {
          value_returnRoutePath: "IOboxsManagement",
          value_returnRouteName: i18n.formatter.format("Return"),
        },
      });
    },

    //修改
    async onModify(item) {
      this.$router.push({
        name: "ModifyIOboxs",
        params: {
          value_returnRoutePath: "IOboxsManagement",
          value_returnRouteName: i18n.formatter.format("Return"),
          item: item,
        },
      });
    },

    // 刪除
    onDelete(items, cb) {
      if (!items || !Array.isArray(items)) return;

      const uuidListToDel = items.map(({ uuid }) => uuid);
      this.$confirm("", i18n.formatter.format("ConfirmToDelete"), {
        confirmButtonText: i18n.formatter.format("Confirm"),
        cancelButtonText: i18n.formatter.format("Cancel"),
        confirmButtonColor: "#20a8d8",
        cancelButtonColor: "#f86c6b",
      })
        .then(() => {
          this.deleteIoBoxes(uuidListToDel, cb);
        })
        .catch(() => {
          if (cb) cb(false);
        });
    },

    async deleteIoBoxes(uuid, cb) {
      const ret = await this.$globalRemoveIoBoxes(uuid);
      const { error } = ret;

      if (error) {
        if (cb) cb(false);
        this.$fire({
          text: i18n.formatter.format("OperationFailed"),
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
          confirmButtonText: i18n.formatter.format("OK"),
        });
      }
      if (cb) cb(true);
    },
  },
};
</script>
