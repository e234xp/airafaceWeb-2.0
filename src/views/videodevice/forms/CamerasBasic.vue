<template>
  <div id="wrapper">
    

  </div>
</template>
  
<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  export default {
    name: "CamerasBasic",
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

    },
  }
</script>
  