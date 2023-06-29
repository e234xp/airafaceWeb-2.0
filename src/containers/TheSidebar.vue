<template>
  <CSidebar
    id="my-sidebar"
    fixed
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
  

    <CSidebarBrand class="d-md-down-none">
      <!-- <div style="width:230px;height:40px;text-align: left">
        <img style="width:54px;height:24px;margin:0px 0" src="data:image/png;base64,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"/>
        <p>Bring Ai to life</p>
      </div> -->
      <div style="width: 230px; height: 32px; text-align: left">
        <img
          style="width: 60px; height: 26px; margin: 0px 0px"
          src="data:image/png;base64,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"
        />
      </div>
    </CSidebarBrand>
    

    <CRenderFunction style="font-size: 18px" flat :content-to-render="$options.nav" />
    <!-- <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    /> -->
  </CSidebar>
</template>

<script>
import store from "../store";
//import nav from './_nav'

// if( store.state.serverToken && store.state.serverToken === "Admin" ) {

// }
// else {
import i18n from "@/i18n";
let nav = [
  {
    _name: "CSidebarNav",
    _children: [
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("Attendance"),
        to: "/attendance",
        permission: ["Admin", "PowerUser", "User"],
        items: [
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("PersonDailyAttendanceReport"),
            to: "/attendance/persondailyattendancereport",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("PersonMonthlyAttendanceReport"),
            to: "/attendance/personmonthlyattendanceReport",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("AttendanceSettings"),
            to: "/attendance/attendancesettings",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("AttendanceOperations"),
            to: "/attendance/ChangeAttendanceClockIn",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("Reports"),
        to: "/reports",
        permission: ["Admin", "PowerUser", "User"],
        items: [
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("PersonReport"),
            to: "/reports/personreport",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("VisitorReport"),
            to: "/reports/visitorreport",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("Investigation"),
            to: "/reports/investigation",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("PersonsManagement"),
        to: "/personsmanagement",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Person"),
            to: "/personsmanagement/personmanagement",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Visitor"),
            to: "/personsmanagement/visitormanagement",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Group"),
            to: "/personsmanagement/groupmanagement",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("AccessControl"),
        to: "/accesscontrol",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("AccessControlManagement"),
            to: "/accesscontrol/accesscontrolmanagement",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("AccessControlDeviceSettings"),
            to: "/accesscontrol/accesscontroldevicesettings",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("RemoteTrigger"),
            to: "/accesscontrol/remotetrigger",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("Events"),
        to: "/events",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("EventControlManagement"),
            to: "/events/eventcontrolmanagement",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("Displays"),
        to: "/displays",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Welcome"),
            to: "/displays/modifywelcomecontrolsetting",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Occupancy"),
            to: "/displays/modifyoccupancycontrolsetting",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Capacity"),
            to: "/displays/modifycapacitycontrolsetting",
          },
        ],
      },

      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("SystemSettings"),
        to: "/systemsettings",
        permission: ["Admin", "PowerUser", "User"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("GeneralSettings"),
            to: "/systemsettings/generalsettings",
          },
          {
            permission: ["Admin", "PowerUser"],
            not_support_detype_type: ["airaTablet_xs"],
            name: i18n.formatter.format("IndicationSettings"),
            to: "/systemsettings/indicationsettings",
          },
          {
            permission: ["Admin", "PowerUser", "User"],
            name: i18n.formatter.format("AccountManagement"),
            to: "/systemsettings/accountmanagement",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("TimeSettings"),
            to: "/systemsettings/timesettings",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("NetworkSettings"),
            to: "/systemsettings/networksettings",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("BackupAndRestore"),
            to: "/systemsettings/backupandrestore",
          },
          {
            permission: ["Admin"],
            name: i18n.formatter.format("UpgradeSoftware"),
            to: "/systemsettings/upgradesoftware",
          },
          {
            permission: ["Admin"],
            name: i18n.formatter.format("FactoryDefault"),
            to: "/systemsettings/factorydefault",
          },
          {
            permission: ["Admin"],
            name: i18n.formatter.format("SystemLog"),
            to: "/systemsettings/systemlog",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("VideoDevice"),
        to: "/videodevice",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Cameras"),
            to: "/videodevice/cameras",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Tablets"),
            to: "/videodevice/tablets",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("DeviceGroup"),
            to: "/videodevice/deviceGroups",
          },
        ],
      },
      {
        _name: "CSidebarNavDropdown",
        name: i18n.formatter.format("OutputDevice"),
        to: "/outputdevice",
        permission: ["Admin", "PowerUser"],
        items: [
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("IOboxs"),
            to: "/outputdevice/ioboxs",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("Wiegandboxs"),
            to: "/outputdevice/wiegandconverters",
          },
          {
            permission: ["Admin", "PowerUser"],
            name: i18n.formatter.format("OutputDeviceGroup"),
            to: "/outputdevice/outputDeviceGroups",
          },
        ],
      },
    ],
  },
];

export default {
  name: "TheSidebar",
  nav,
  computed: {
    show() {
      const self = this;
      nav.forEach((n) => {
        n._children = n._children.filter((child) => {
          const c = child.permission.filter((p) => {
            //console.log( self.$store.state.serverToken.permission )
            return (
              self.$store.state.serverToken &&
              self.$store.state.serverToken.permission &&
              p == self.$store.state.serverToken.permission
            );
          });
          child.items = child.items.filter((item) => {
           
            var ns = [];
            if (item.not_support_detype_type) {
              ns = item.not_support_detype_type.filter((dt) => {
                console.log("dt",dt)
                return self.$store.state.deviceType == dt;
              });
            }
            const i = item.permission.filter((p) => {
              return (
                self.$store.state.serverToken &&
                self.$store.state.serverToken.permission &&
                p == self.$store.state.serverToken.permission
              );
            });

            return i.length > 0 && ns.length == 0; /* 子項目 是否顯示 */
          });
          return c.length > 0;
        });
      });
      if (self.$globalServerTokenIsEffective()) {
        self.$store.commit("set", ["sidebarShow", true]);
      } else self.$store.commit("set", ["sidebarShow", false]);
      return self.$store.state.sidebarShow;
    },
    minimize() {
      return false;
    },
  },
};
</script>
