<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CamerasManagementForm :formData="$data" :onAdd="onAdd"/>
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
      onAdd() {
        console.log(123)
        this.$router.push({
          name: 'AddCameras', params: {
            value_returnRoutePath: "Cameras",
            value_returnRouteName: i18n.formatter.format("Return")
          }
        });
      },
      clickOnAdd() {
        console.log("ADD")
      },
      clickOnMultipleDelete() {
        const self = this;
        const list = this.$refs.mainTable.getCheckboxRecords();
        if (list.length > 0) {
          self.$confirm("", i18n.formatter.format("ConfirmToDelete"), "question", {
            confirmButtonText: i18n.formatter.format("Confirm"),
            cancelButtonText: i18n.formatter.format("Cancel"),
            confirmButtonColor: "#20a8d8",
            cancelButtonColor: "#f86c6b",
          })
          .then((v) => {
            //self.deleteItem(list);
          })
          .catch((e) => {
            if (cb) cb(false);
          });
        }
      },
     
    },
  }
</script>
  