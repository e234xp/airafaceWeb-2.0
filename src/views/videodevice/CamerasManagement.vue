<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CamerasManagementForm :formData="$data" :onAdd="onAdd" :onDelete="onDelete" :onModify="onModify" :onFetchDataCallback="onFetchDataCallback"/>
      </CCol>
    </CRow>
  </div>
</template>
  
<script>
  import CamerasManagementForm from './forms/CamerasManagementForm.vue'

  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  export default {
    name: "Cameras",
    mixins: [TableObserver],
    components: { CamerasManagementForm },
    data() {
      return {
        value_dataItemsToShow: [{enable:false,name:'',timestamp:'',remark:'',modifier:'',remark1:''}],
        value_allTableItems: [],
        value_tablePage: {
          currentPage: 1,
          pageSize: 5,
          totalResult: 0,
        },
        value_searchingFilter: "",

        disp_header: i18n.formatter.format("VideoDeviceCameras"),
        disp_search: i18n.formatter.format("Search"),
        disp_add: i18n.formatter.format("Add"),
        disp_delete: i18n.formatter.format("Delete"),


        /*data table */
        disp_enable: i18n.formatter.format("Enable"),
        disp_deviceName: i18n.formatter.format("DeviceName"),
        disp_status: i18n.formatter.format("DeviceStatus"),
        disp_ipAddress: i18n.formatter.format("IpAddress"),
        disp_In: i18n.formatter.format("EnableIn"),
        disp_out: i18n.formatter.format("EnableOut"),

      };
    },
    computed: {
      ...mapState(["ellipsisMode"]),
    },
    methods: {
      // 新增
      onAdd() {
        this.$router.push({
          name: 'AddCameras', params: {
            value_returnRoutePath: "CamerasManagement",
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
          name: 'ModifyCameras', params: {
            value_returnRoutePath: "CamerasManagement",
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
  