<template>
  <div>
    <CRow>
      <CCol sm="12">
        <ListForm :formData="$data" :onAdd="onAdd" :onDelete="onDelete" :onModify="onModify" :onFetchDataCallback="onFetchDataCallback"/>
      </CCol>
    </CRow>
  </div>
</template>
  
<script>
  import ListForm from "@/modules/videodevice/videodevicegrouplist/ListForm.vue";

  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  export default {
    name: "DeviceGroups",
    mixins: [TableObserver],
    components: { VideoDevicesGroupsForm },
    data() {
      return {
        value_dataItemsToShow: [],
        value_allTableItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 5,
          totalResult: 0,
        },
        value_searchingFilter: "",

        disp_header: i18n.formatter.format("DevicesGroupTitle"),
        disp_search: i18n.formatter.format("Search"),
        disp_add: i18n.formatter.format("Add"),
        disp_delete: i18n.formatter.format("Delete"),


        /*data table */
        disp_group: i18n.formatter.format("VideoDevicesGroup"),
        disp_videoDevices: i18n.formatter.format("VideoDevices"),
        disp_outputDevices: i18n.formatter.format("OutputDevices"),
        disp_rules: i18n.formatter.format("Rules"),

      };
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    methods: {
      // 新增
      onAdd() {
        this.$router.push({
          name: 'AddVideoDeviceGroups', params: {
            value_returnRoutePath: "DeviceGroups",
            value_returnRouteName: i18n.formatter.format("Return")
          }
        });
      },
      onFetchDataCallback(cb) {
        const self = this;
        self.flag_keepingDownload = true;
        self.downloadTableItemsAsync(0,3000, cb);
      },
      
      async downloadTableItemsAsync(shitf,sliceSize, cb) {
        const self = this;
        let reset = true;
        let thereIsMoreData = true;
        let ret = await self.$globalFindCameras("", shitf, sliceSize, cb);
        //console.log(ret,"拿到的資料")
        const list = ret.data.camera_list;
        //console.log(list,"拿到的資料list")
        const error = ret.error;
        if( error == null ) {
          if(cb) cb( null, reset, thereIsMoreData, list );
          //console.log(null, true, false, list,"QQQ")

        }
        else {
          if( cb ) cb( error, true, false, [] );
          self.$fire({
            title: i18n.formatter.format("NetworkLoss"),
            text: "",
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8"
          });
        }
      },
      // 刪除
      onDelete(items, cb) {
        const self = this;
        if (items && Array.isArray(items)) {
          let uuidListToDel = [];
          items.forEach(item => {
            uuidListToDel.push(item.uuid);
          });
          self.$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
            confirmButtonText: i18n.formatter.format("Confirm"),
            cancelButtonText: i18n.formatter.format("Cancel"),
            confirmButtonColor: "#20a8d8",
            cancelButtonColor: "#f86c6b"
          }).then((v) => {
            self.RemoveCameraAsync(uuidListToDel, cb);
          }).catch((e) => {
            if (cb) cb(false);
          });
        }
      },
      //修改
      async onModify(item) {
        this.$router.push({
          name: 'ModifyWiegandConverters', params: {
            value_returnRoutePath: "WiegandConverters",
            value_returnRouteName: i18n.formatter.format("Return"),
            item: item,
          }
        });
      },
      async RemoveCameraAsync(uuid, cb) {
        const self = this;
        let ret = await self.$globalRemoveCameras(uuid);
        const error = ret.error;
        if (error) {
          if (cb) cb(false);
          self.$fire({
            text: i18n.formatter.format("OperationFailed"),
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8",
            confirmButtonText: i18n.formatter.format("OK")
          });
        }
        else if (cb) cb(true);
      },  
    },
  }
</script>
  