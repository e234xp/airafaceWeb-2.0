import Vue from 'vue';
import VueRouter from 'vue-router';

// Containers
const TheContainer = () => import('@/containers/TheContainer.vue');

// Views - Pages
const Login = () => import('@/views/Login.vue');
const Mobile = () => import('@/views/Mobile.vue');
const ForgetPassword = () => import('@/views/ForgetPassword.vue');

/// ////////////////////////////////////////
/// /////    Attendance    /////////////////
const PersonMonthlyAttendanceReport = () => import('@/views/attendance/PersonMonthlyAttendanceReport.vue');
const PersonDailyAttendanceReport = () => import('@/views/attendance/PersonDailyAttendanceReport.vue');
const AttendanceSettings = () => import('@/views/attendance/AttendanceSettings.vue');
const ChangeAttendanceClockIn = () => import('@/views/attendance/ChangeAttendanceClockIn.vue');
const ChangeAttendance = () => import('@/views/attendance/ChangeAttendance.vue');

/// ////////////////////////////////////////
/// /////    Dashboards    /////////////////
const WelcomeDashboard = () => import('@/views/dashboards/WelcomeDashboard.vue');
const OccupancyDashboard = () => import('@/views/dashboards/OccupancyDashboard.vue');
const CapacityDashboard = () => import('@/views/dashboards/CapacityDashboard.vue');
const SelfCheckinDashboard = () => import('@/views/dashboards/SelfCheckinDashboard.vue');
const GuardDashboard = () => import('@/views/dashboards/GuardDashboard.vue');
const AlcoholCheckinDashboard = () => import('@/views/dashboards/AlcoholCheckinDashboard.vue');

/// ////////////////////////////////////////
/// /////    Reports    ////////////////////
const PersonReport = () => import('@/views/reports/PersonReport.vue');
const VisitorReport = () => import('@/views/reports/VisitorReport.vue');
const Investigation = () => import('@/views/reports/Investigation.vue');

/// ////////////////////////////////////////
/// /////    Persons Management    /////////
const PersonManagement = () => import('@/views/personsmanagement/PersonManagement.vue');
const AddPerson = () => import('@/views/personsmanagement/AddPerson.vue');
const ModifyPerson = () => import('@/views/personsmanagement/ModifyPerson.vue');

const VisitorManagement = () => import('@/views/personsmanagement/VisitorManagement.vue');
const AddVisitor = () => import('@/views/personsmanagement/AddVisitor.vue');
const ModifyVisitor = () => import('@/views/personsmanagement/ModifyVisitor.vue');

const GroupManagement = () => import('@/views/personsmanagement/GroupManagement.vue');
const CreateGroup = () => import('@/views/personsmanagement/CreateGroup.vue');
const ModifyGroup = () => import('@/views/personsmanagement/ModifyGroup.vue');
const CheckGroup = () => import('@/views/personsmanagement/CheckGroup.vue');

/// ////////////////////////////////////////
/// /////    Access Control    /////////////
// const AccessControlManagement = () => import('@/views/accesscontrol/AccessControlManagement.vue');
// const CreateAccessControlSetting = () => import('@/views/accesscontrol/CreateAccessControlSetting.vue');
// const ModifyAccessControlSetting = () => import('@/views/accesscontrol/ModifyAccessControlSetting.vue');
// const AccessControlDeviceSettings = () => import('@/views/accesscontrol/AccessControlDeviceSettings.vue');
// const RemoteTrigger = () => import('@/views/accesscontrol/RemoteTrigger.vue');

/// ////////////////////////////////////////
/// /////    Event Control    //////////////
const EventControlManagement = () => import('@/views/events/EventControlManagement.vue');
const CreateEventControlSetting = () => import('@/views/events/CreateEventControlSetting.vue');
const ModifyEventControlSetting = () => import('@/views/events/ModifyEventControlSetting.vue');

/// ////////////////////////////////////////
/// /////    Display settings    ///////////
const ModifyWelcomeControlSetting = () => import('@/views/displays/ModifyWelcomeControlSetting.vue');
const ModifyOccupancyControlSetting = () => import('@/views/displays/ModifyOccupancyControlSetting.vue');
const ModifyCapacityControlSetting = () => import('@/views/displays/ModifyCapacityControlSetting.vue');
const ModifySelfCheckinControlSetting = () => import('@/views/displays/ModifySelfCheckinControlSetting.vue');
const ModifyGuardControlSetting = () => import('@/views/displays/ModifyGuardControlSetting.vue');

/// ////////////////////////////////////////
/// /////    System settings    ////////////
const GeneralSettings = () => import('@/views/systemsettings/GeneralSettings.vue');
const NetworkSettings = () => import('@/views/systemsettings/NetworkSettings.vue');
const TimeSettings = () => import('@/views/systemsettings/TimeSettings.vue');
const FactoryDefault = () => import('@/views/systemsettings/FactoryDefault.vue');
const BackupAndRestore = () => import('@/views/systemsettings/BackupAndRestore.vue');
const UpgradeSoftware = () => import('@/views/systemsettings/UpgradeSoftware.vue');
const AccountManagement = () => import('@/views/systemsettings/AccountManagement.vue');
const CreateAccount = () => import('@/views/systemsettings/CreateAccount.vue');
const SystemLog = () => import('@/views/systemsettings/SystemLog.vue');
const IndicationSettings = () => import('@/views/systemsettings/IndicationSettings.vue');
const LicenseSettings = () => import('@/views/systemsettings/LicenseSettings.vue');
const Diagnose = () => import('@/views/systemsettings/Diagnose.vue');

/// ////////////////////////////////////////
/// /////    Device settings    ////////////
const CameraList = () => import('@/views/videodevice/CameraList.vue');
const AddCamera = () => import('@/views/videodevice/AddCamera.vue');
const ModifyCameras = () => import('@/views/videodevice/ModifyCameras.vue');

const TabletsList = () => import('@/views/videodevice/TabletsList.vue');
const AddTablets = () => import('@/views/videodevice/AddTablets.vue');
const ModifyTablets = () => import('@/views/videodevice/ModifyTablets.vue');

const DeviceGroups = () => import('@/views/videodevice/DeviceGroups.vue');
const AddVideoDeviceGroups = () => import('@/views/videodevice/AddVideoDeviceGroups.vue');
const ModifyVideoDeviceGroups = () => import('@/views/videodevice/ModifyVideoDeviceGroups.vue');

/// ////////////////////////////////////////
/// /////    Output Device    //////////////
const IOboxsManagement = () => import('@/views/outputdevice/IOboxsManagement.vue');
const WiegandConverters = () => import('@/views/outputdevice/WiegandConverters.vue');
const OutputDeviceGroups = () => import('@/views/outputdevice/OutputDeviceGroups.vue');

/// ////////////////////////////////////////
/// //////// device add update///////////
// const CamerasBasic = () => import('@/views/videodevice/forms/CamerasBasic')
// const CamerasBasic = () => import('@/views/videodevice/CamerasBasic')
const TabletsBasic = () => import('@/views/videodevice/forms/TabletsBasic.vue');
const TabletsAccessSettings = () => import('@/views/videodevice/forms/TabletsAccessSettings.vue');

/// ////////////////////////////////////////
/// //////// output add update///////////
const AddIOboxs = () => import('@/views/outputdevice/AddIOboxs.vue');
const ModifyIOboxs = () => import('@/views/outputdevice/ModifyIOboxs.vue');
const AddWiegandConverters = () => import('@/views/outputdevice/AddWiegandConverters.vue');
const ModifyWiegandConverters = () => import('@/views/outputdevice/ModifyWiegandConverters.vue');
const AddOutputDeviceGroups = () => import('@/views/outputdevice/AddOutputDeviceGroups.vue');
const ModifyOutputDeviceGroups = () => import('@/views/outputdevice/ModifyOutputDeviceGroups.vue');

// const IOboxesBasic = () => import('@/views/outputdevice/forms/IOboxesBasic')
// const WiegandBasic = () => import('@/views/outputdevice/forms/WiegandBasic')

// TODO: Delete unuse nav
/// ////////////////////////////////////////
/// /////    Notify Management    //////////
const LineNotifyManagement = () => import('@/views/notifications/LineNotifyManagement.vue');
const AddLineNotify = () => import('@/views/notifications/AddLineNotify.vue');
const ModifyLineNotify = () => import('@/views/notifications/ModifyLineNotify.vue');

const MailNotifyManagement = () => import('@/views/notifications/MailNotifyManagement.vue');
const AddMailNotify = () => import('@/views/notifications/AddMailNotify.vue');
const ModifyMailNotify = () => import('@/views/notifications/ModifyMailNotify.vue');

const HttpNotifyManagement = () => import('@/views/notifications/HttpNotifyManagement.vue');
const AddHttpNotify = () => import('@/views/notifications/AddHttpNotify.vue');
const ModifyHttpNotify = () => import('@/views/notifications/ModifyHttpNotify.vue');

/// ////////////////////////////////////////
/// /////    Action Rules    ///////////////
const ActionRuleManagement = () => import('@/views/accessrules/ActionRuleManagement.vue');
const AddActionRule = () => import('@/views/accessrules/AddActionRule.vue');
const ModifyActionRule = () => import('@/views/accessrules/ModifyActionRule.vue');

const ScheduleManagement = () => import('@/views/accessrules/ScheduleManagement.vue');
const AddSchedule = () => import('@/views/accessrules/AddSchedule.vue');
const ModifySchedule = () => import('@/views/accessrules/ModifySchedule.vue');

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

export default new VueRouter({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes(),
});

function configRoutes() {
  return [
    {
      path: '/',
      redirect: '/login',
      name: 'Home',
      component: TheContainer,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: Login,
        },
        {
          path: 'forgetpassword',
          name: 'ForgetPassword',
          component: ForgetPassword,
        },
        {
          path: 'm',
          name: 'm',
          component: Mobile,
        },
        {
          path: 'welcomemode',
          name: 'DashboardWelcome',
          component: WelcomeDashboard,
        },
        {
          path: 'occupancymode',
          name: 'DashboardOccupancy',
          component: OccupancyDashboard,
        },
        {
          path: 'capacitymode',
          name: 'DashboardCapacity',
          component: CapacityDashboard,
        },
        {
          path: 'selfcheckinmode',
          name: 'DashboardSelfCheckin',
          component: SelfCheckinDashboard,
        },
        {
          path: 'alcoholcheckinmode',
          name: 'DashboardAlcoholCheckin',
          component: AlcoholCheckinDashboard,
        },
        {
          path: 'guardmode',
          name: 'DashboardGuard',
          component: GuardDashboard,
        },
        {
          path: 'reports',
          redirect: '/reports/personreport',
          name: 'Reports',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'personreport',
              name: 'PersonReport',
              component: PersonReport,
            },
            {
              path: 'visitorreport',
              name: 'VisitorReport',
              component: VisitorReport,
            },
            {
              path: 'investigation',
              name: 'Investigation',
              component: Investigation,
            },
          ],
        },
        {
          path: 'attendance',
          redirect: '/attendance/persondailyattendancereport',
          name: 'Attendance',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'persondailyattendancereport',
              name: 'PersonDailyAttendanceReport',
              component: PersonDailyAttendanceReport,
            },
            {
              path: 'personmonthlyattendancereport',
              name: 'PersonMonthlyAttendanceReport',
              component: PersonMonthlyAttendanceReport,
            },
            {
              path: 'attendancesettings',
              name: 'AttendanceSettings',
              component: AttendanceSettings,
            },
            {
              path: 'changeAttendanceClockIn',
              name: 'ChangeAttendanceClockIn',
              component: ChangeAttendanceClockIn,
            },
            {
              path: 'changeAttendance',
              name: 'ChangeAttendance',
              component: ChangeAttendance,
            },
          ],
        },
        {
          path: 'personsmanagement',
          redirect: '/personsmanagement/addperson',
          name: 'PersonsManagement',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'personmanagement',
              name: 'PersonManagement',
              component: PersonManagement,
            },
            {
              path: 'visitormanagement',
              name: 'VisitorManagement',
              component: VisitorManagement,
            },
            {
              path: 'addperson',
              name: 'AddPerson',
              component: AddPerson,
            },
            {
              path: 'modifyperson',
              name: 'ModifyPerson',
              component: ModifyPerson,
            },
            {
              path: 'addvisitor',
              name: 'AddVisitor',
              component: AddVisitor,
            },
            {
              path: 'modifyvisitor',
              name: 'ModifyVisitor',
              component: ModifyVisitor,
            },
            {
              path: 'groupmanagement',
              name: 'GroupManagement',
              component: GroupManagement,
            },
            {
              path: 'creategroup',
              name: 'CreateGroup',
              component: CreateGroup,
            },
            {
              path: 'modifygroup',
              name: 'ModifyGroup',
              component: ModifyGroup,
            },
            {
              path: 'checkgroup',
              name: 'CheckGroup',
              component: CheckGroup,
            },
          ],
        },
        // {
        //   path: 'accesscontrol',
        //   redirect: '/accesscontrol/AccessControlManagement',
        //   name: 'AccessControl',
        //   component: {
        //     render(c) { return c('router-view'); },
        //   },
        //   children: [
        //     {
        //       path: 'accesscontrolmanagement',
        //       name: 'AccessControlManagement',
        //       component: AccessControlManagement,
        //     },
        //     {
        //       path: 'createaccesscontrolsetting',
        //       name: 'CreateAccessControlSetting',
        //       component: CreateAccessControlSetting,
        //     },
        //     {
        //       path: 'modifyaccesscontrolsetting',
        //       name: 'ModifyAccessControlSetting',
        //       component: ModifyAccessControlSetting,
        //     },
        //     {
        //       path: 'accesscontroldevicesettings',
        //       name: 'AccessControlDeviceSettings',
        //       component: AccessControlDeviceSettings,
        //     },
        //     {
        //       path: 'remotetrigger',
        //       name: 'RemoteTrigger',
        //       component: RemoteTrigger,
        //     },
        //   ],
        // },
        // {
        //   path: 'events',
        //   redirect: '/events/EventControlManagement',
        //   name: 'EventControl',
        //   component: {
        //     render(c) { return c('router-view'); },
        //   },
        //   children: [
        //     {
        //       path: 'eventcontrolmanagement',
        //       name: 'EventControlManagement',
        //       component: EventControlManagement,
        //     },
        //     {
        //       path: 'createeventcontrolsetting',
        //       name: 'CreateEventControlSetting',
        //       component: CreateEventControlSetting,
        //     },
        //     {
        //       path: 'modifyeventcontrolsetting',
        //       name: 'ModifyEventControlSetting',
        //       component: ModifyEventControlSetting,
        //     },
        //   ],
        // },
        {
          path: 'displays',
          redirect: '/displays/ModifyWelcomeControlSetting',
          name: 'DisplayControl',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'modifywelcomecontrolsetting',
              name: 'ModifyWelcomeControlSetting',
              component: ModifyWelcomeControlSetting,
            },
            {
              path: 'modifyoccupancycontrolsetting',
              name: 'ModifyOccupancyControlSetting',
              component: ModifyOccupancyControlSetting,
            },
            {
              path: 'modifycapacitycontrolsetting',
              name: 'ModifyCapacityControlSetting',
              component: ModifyCapacityControlSetting,
            },
            {
              path: 'modifyselfcheckincontrolsetting',
              name: 'ModifySelfCheckinControlSetting',
              component: ModifySelfCheckinControlSetting,
            },
            {
              path: 'modifyguardcontrolsetting',
              name: 'ModifyGuardControlSetting',
              component: ModifyGuardControlSetting,
            },
            // {
            //   path: 'welcomeDashboardSettings',
            //   name: 'WelcomeDashboardSettings',
            //   component: WelcomeDashboardSettings
            // },
          ],
        },
        {
          path: 'systemsettings',
          redirect: '/systemsettings/networksettings',
          name: 'SystemSettings',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'generalsettings',
              name: 'GeneralSettings',
              component: GeneralSettings,
            },
            {
              path: 'indicationsettings',
              name: 'IndicationSettings',
              component: IndicationSettings,
            },
            {
              path: 'timesettings',
              name: 'TimeSettings',
              component: TimeSettings,
            },
            {
              path: 'networksettings',
              name: 'NetworkSettings',
              component: NetworkSettings,
            },
            {
              path: 'BackupAndRestore',
              name: 'backupandrestore',
              component: BackupAndRestore,
            },
            {
              path: 'upgradesoftware',
              name: 'UpgradeSoftware',
              component: UpgradeSoftware,
            },
            {
              path: 'factorydefault',
              name: 'FactoryDefault',
              component: FactoryDefault,
            },
            {
              path: 'accountmanagement',
              name: 'AccountManagement',
              component: AccountManagement,
            },
            {
              path: 'createaccount',
              name: 'CreateAccount',
              component: CreateAccount,
            },
            {
              path: 'licensesettings',
              name: 'LicenseSettings',
              component: LicenseSettings,
            },
            {
              path: 'systemlog',
              name: 'SystemLog',
              component: SystemLog,
            },
            {
              path: 'diagnose',
              name: 'Diagnose',
              component: Diagnose,
            },
          ],
        },
        {
          path: 'videodevice',
          redirect: '/videodevice/cameralist',
          name: 'VideoDevice',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'cameralist',
              name: 'CameraList',
              component: CameraList,
            },
            {
              path: 'addcamera',
              name: 'AddCamera',
              component: AddCamera,
            },
            {
              path: 'modifyCameras',
              name: 'ModifyCameras',
              component: ModifyCameras,
            },
            {
              path: 'tabletslist',
              name: 'TabletsList',
              component: TabletsList,
            },
            {
              path: 'addtablets',
              name: 'AddTablets',
              component: AddTablets,
            },
            {
              path: 'modifytablets',
              name: 'ModifyTablets',
              component: ModifyTablets,
            },
            {
              path: 'tabletsBasic',
              name: 'TabletsBasic',
              component: TabletsBasic,
            },
            {
              path: 'tabletsAccessSettings',
              name: 'TabletsAccessSettings',
              component: TabletsAccessSettings,
            },
            {
              path: 'deviceGroups',
              name: 'DeviceGroups',
              component: DeviceGroups,
            },
            {
              path: 'addvideodevicegroups',
              name: 'AddVideoDeviceGroups',
              component: AddVideoDeviceGroups,
            },
            {
              path: 'Modifyvideodevicegroups',
              name: 'ModifyVideoDeviceGroups',
              component: ModifyVideoDeviceGroups,
            },
          ],
        },
        {
          path: 'outputdevice',
          redirect: '/outputdevice/IOboxsManagement',
          name: 'OutputDevice',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'ioboxsManagement',
              name: 'IOboxsManagement',
              component: IOboxsManagement,
            },
            {
              path: 'addIOboxs',
              name: 'AddIOboxs',
              component: AddIOboxs,
            },
            {
              path: 'modifyIOboxs',
              name: 'ModifyIOboxs',
              component: ModifyIOboxs,
            },
            {
              path: 'wiegandconverters',
              name: 'WiegandConverters',
              component: WiegandConverters,
            },
            {
              path: 'addWiegandConverters',
              name: 'AddWiegandConverters',
              component: AddWiegandConverters,
            },
            {
              path: 'modifyWiegandConverters',
              name: 'ModifyWiegandConverters',
              component: ModifyWiegandConverters,
            },
            {
              path: 'outputDeviceGroups',
              name: 'OutputDeviceGroups',
              component: OutputDeviceGroups,
            },
            {
              path: 'addoutputdevicegroups',
              name: 'AddOutputDeviceGroups',
              component: AddOutputDeviceGroups,
            },
            {
              path: 'modifyoutputdevicegroups',
              name: 'ModifyOutputDeviceGroups',
              component: ModifyOutputDeviceGroups,
            },
            // {
            //   path: 'iOboxesBasic',
            //   name: 'IOboxesBasic',
            //   component: IOboxesBasic
            // },
            // {
            //   path: 'wiegandBasic',
            //   name: 'WiegandBasic',
            //   component: WiegandBasic
            // },
          ],
        },
        {
          path: 'notifications',
          redirect: '/notifications/linenotify',
          name: 'Notifications',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'linenotify',
              name: 'LineNotifyManagement',
              component: LineNotifyManagement,
            },
            {
              path: 'addlinenotify',
              name: 'AddLineNotify',
              component: AddLineNotify,
            },
            {
              path: 'modifylinenotify',
              name: 'ModifyLineNotify',
              component: ModifyLineNotify,
            },
            {
              path: 'mailnotify',
              name: 'MailNotifyManagement',
              component: MailNotifyManagement,
            },
            {
              path: 'addmailnotify',
              name: 'AddMailNotify',
              component: AddMailNotify,
            },
            {
              path: 'modifymailnotify',
              name: 'ModifyMailNotify',
              component: ModifyMailNotify,
            },
            {
              path: 'httpnotify',
              name: 'HttpNotifyManagement',
              component: HttpNotifyManagement,
            },
            {
              path: 'addhttpnotify',
              name: 'AddHttpNotify',
              component: AddHttpNotify,
            },
            {
              path: 'modifyhttpnotify',
              name: 'ModifyHttpNotify',
              component: ModifyHttpNotify,
            },
          ],
        },
        {
          path: 'accessrules',
          redirect: '/accessrules/schedules',
          name: 'AccessRules',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'actionrule',
              name: 'ActionRuleManagement',
              component: ActionRuleManagement,
            },
            {
              path: 'addactionrule',
              name: 'AddActionRule',
              component: AddActionRule,
            },
            {
              path: 'modifyactionrule',
              name: 'ModifyActionRule',
              component: ModifyActionRule,
            },

            {
              path: 'schedules',
              name: 'ScheduleManagement',
              component: ScheduleManagement,
            },
            {
              path: 'addschedule',
              name: 'AddSchedule',
              component: AddSchedule,
            },
            {
              path: 'modifyschedule',
              name: 'ModifySchedule',
              component: ModifySchedule,
            },
          ],
        },
        {
          path: 'events',
          redirect: '/events/EventControlManagement',
          name: 'EventControl',
          component: {
            render(c) { return c('router-view'); },
          },
          children: [
            {
              path: 'eventcontrolmanagement',
              name: 'EventControlManagement',
              component: EventControlManagement,
            },
            {
              path: 'createeventcontrolsetting',
              name: 'CreateEventControlSetting',
              component: CreateEventControlSetting,
            },
            {
              path: 'modifyeventcontrolsetting',
              name: 'ModifyEventControlSetting',
              component: ModifyEventControlSetting,
            },
          ],
        },
      ],
    },
  ];
}
