import Vue from 'vue'
import VueRouter from 'vue-router'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views - Pages
const Login = () => import('@/views/Login')


/////////////////  Attendance ////////////////
const PersonMonthlyAttendanceReport = () => import('@/views/attendance/PersonMonthlyAttendanceReport')
const PersonDailyAttendanceReport = () => import('@/views/attendance/PersonDailyAttendanceReport')
const AttendanceSettings = () => import('@/views/attendance/AttendanceSettings')
const ChangeAttendanceClockIn = () => import('@/views/attendance/ChangeAttendanceClockIn')
const ChangeAttendance = () => import('@/views/attendance/ChangeAttendance')


///////////////////////////////////////////
/////////////////  Dashboards /////////////
const WelcomeMode = () => import('@/views/dashboards/WelcomeMode')
const OccupancyMode = () => import('@/views/dashboards/OccupancyMode')
const CapacityMode = () => import('@/views/dashboards/CapacityMode')
const WelcomeDashboard = () => import('@/views/dashboards/WelcomeDashboard')
const OccupancyDashboard = () => import('@/views/dashboards/OccupancyDashboard')
// const CapacityDashboard = () => import('@/views/dashboards/CapacityDashboard')



///////////////////////////////////////////
/////////////////  Reports ////////////////
const PersonReport = () => import('@/views/reports/PersonReport')
const VisitorReport = () => import('@/views/reports/VisitorReport')
const Investigation = () => import('@/views/reports/Investigation')

///////////////////////////////////////////
///////////  Persons Management ///////////
const PersonManagement = () => import('@/views/personsmanagement/PersonManagement')
const AddPerson = () => import('@/views/personsmanagement/AddPerson')
const ModifyVisitor = () => import('@/views/personsmanagement/ModifyVisitor')

const VisitorManagement = () => import('@/views/personsmanagement/VisitorManagement')
const AddVisitor = () => import('@/views/personsmanagement/AddVisitor')
const ModifyPerson = () => import('@/views/personsmanagement/ModifyPerson')

const GroupManagement = () => import('@/views/personsmanagement/GroupManagement')
const CreateGroup = () => import('@/views/personsmanagement/CreateGroup')
const ModifyGroup = () => import('@/views/personsmanagement/ModifyGroup')
const CheckGroup = () => import('@/views/personsmanagement/CheckGroup')

///////////////////////////////////////////
///////////  Access Control  ///////////
const AccessControlManagement = () => import('@/views/accesscontrol/AccessControlManagement')
const CreateAccessControlSetting = () => import('@/views/accesscontrol/CreateAccessControlSetting')
const ModifyAccessControlSetting = () => import('@/views/accesscontrol/ModifyAccessControlSetting')
const AccessControlDeviceSettings = () => import('@/views/accesscontrol/AccessControlDeviceSettings')
const RemoteTrigger = () => import('@/views/accesscontrol/RemoteTrigger')

///////////////////////////////////////////
///////////  Event Control  ///////////
const EventControlManagement = () => import('@/views/events/EventControlManagement')
const CreateEventControlSetting = () => import('@/views/events/CreateEventControlSetting')
const ModifyEventControlSetting = () => import('@/views/events/ModifyEventControlSetting')

///////////////////////////////////////////
/////////// Display settings ///////////
const ModifyWelcomeControlSetting = () => import('@/views/displays/ModifyWelcomeControlSetting')
const ModifyOccupancyControlSetting = () => import('@/views/displays/ModifyOccupancyControlSetting')
const ModifyCapacityControlSetting = () => import('@/views/displays/ModifyCapacityControlSetting')
// const WelcomeDashboardSettings = () => import('@/views/displays/WelcomeDashboardSettings')

///////////////////////////////////////////
/////////// System settings ///////////
const GeneralSettings = () => import('@/views/systemsettings/GeneralSettings')
const NetworkSettings = () => import('@/views/systemsettings/NetworkSettings')
const TimeSettings = () => import('@/views/systemsettings/TimeSettings')
const FactoryDefault = () => import('@/views/systemsettings/FactoryDefault')
const BackupAndRestore = () => import('@/views/systemsettings/BackupAndRestore')
const UpgradeSoftware = () => import('@/views/systemsettings/UpgradeSoftware')
const AccountManagement = () => import('@/views/systemsettings/AccountManagement')
const CreateAccount = () => import('@/views/systemsettings/CreateAccount')
const SystemLog = () => import('@/views/systemsettings/SystemLog')
const IndicationSettings = () => import('@/views/systemsettings/IndicationSettings')

///////////////////////////////////////////
/////////// device ///////////
const CamerasManagement = () => import('@/views/videodevice/CamerasManagement')
const Tablets = () => import('@/views/videodevice/Tablets')
const DeviceGroups = () => import('@/views/videodevice/DeviceGroups')
// const CamerasBasic = () => import('@/views/videodevice/forms/CamerasBasic')
// const CamerasBasic = () => import('@/views/videodevice/CamerasBasic')
const TabletsBasic = () => import('@/views/videodevice/forms/TabletsBasic')
const TabletsAccessSettings = () => import('@/views/videodevice/forms/TabletsAccessSettings')

///////////////////////////////////////////
/////////// device add update///////////
const AddCameras = () => import('@/views/videodevice/AddCameras')
const ModifyCameras = () => import('@/views/videodevice/ModifyCameras')


const IOboxsManagement = () => import('@/views/outputdevice/IOboxsManagement')
const WiegandConverters = () => import('@/views/outputdevice/WiegandConverters')
const OutputDeviceGroups = () => import('@/views/outputdevice/OutputDeviceGroups')

///////////////////////////////////////////
/////////// output add update///////////
const AddIOboxs = () => import('@/views/outputdevice/AddIOboxs')
const ModifyIOboxs = () => import('@/views/outputdevice/ModifyIOboxs')
const AddWiegandConverters = () => import('@/views/outputdevice/AddWiegandConverters')
const ModifyWiegandConverters = () => import('@/views/outputdevice/ModifyWiegandConverters')



// const IOboxesBasic = () => import('@/views/outputdevice/forms/IOboxesBasic')
// const WiegandBasic = () => import('@/views/outputdevice/forms/WiegandBasic')

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new VueRouter({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

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
          component: Login
        },
        {
          path: 'welcomemode',
          name: 'DashboardWelcome',
          component: WelcomeDashboard
        },
        {
          path: 'occupancymode',
          name: 'DashboardOccupancy',
          component: OccupancyDashboard,
        },
        // {
        //   path: 'capacitymode',
        //   name: 'DashboardCapacity',
        //   component: CapacityDashboard
        // },
        {
          path: 'reports',
          redirect: '/reports/personreport',
          name: 'Reports',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'personreport',
              name: 'PersonReport',
              component: PersonReport
            },
            {
              path: 'visitorreport',
              name: 'VisitorReport',
              component: VisitorReport
            },
            {
              path: 'investigation',
              name: 'Investigation',
              component: Investigation
            }
          ]
        },
        {
          path: 'attendance',
          redirect: '/attendance/persondailyattendancereport',
          name: 'Attendance',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'persondailyattendancereport',
              name: 'PersonDailyAttendanceReport',
              component: PersonDailyAttendanceReport
            },
            {
              path: 'personmonthlyattendancereport',
              name: 'PersonMonthlyAttendanceReport',
              component: PersonMonthlyAttendanceReport
            },
            {
              path: 'attendancesettings',
              name: 'AttendanceSettings',
              component: AttendanceSettings
            },
            {
              path: 'changeAttendanceClockIn',
              name: 'ChangeAttendanceClockIn',
              component: ChangeAttendanceClockIn
            },
            {
              path: 'changeAttendance',
              name: 'ChangeAttendance',
              component: ChangeAttendance
            },
          ]
        },
        {
          path: 'personsmanagement',
          redirect: '/personsmanagement/addperson',
          name: 'PersonsManagement',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'personmanagement',
              name: 'PersonManagement',
              component: PersonManagement
            },
            {
              path: 'visitormanagement',
              name: 'VisitorManagement',
              component: VisitorManagement
            },
            {
              path: 'addperson',
              name: 'AddPerson',
              component: AddPerson
            },
            {
              path: 'modifyperson',
              name: 'ModifyPerson',
              component: ModifyPerson
            },
            {
              path: 'addvisitor',
              name: 'AddVisitor',
              component: AddVisitor
            },
            {
              path: 'modifyvisitor',
              name: 'ModifyVisitor',
              component: ModifyVisitor
            },
            {
              path: 'groupmanagement',
              name: 'GroupManagement',
              component: GroupManagement
            },
            {
              path: 'creategroup',
              name: 'CreateGroup',
              component: CreateGroup
            },
            {
              path: 'modifygroup',
              name: 'ModifyGroup',
              component: ModifyGroup
            },
            {
              path: 'checkgroup',
              name: 'CheckGroup',
              component: CheckGroup
            }
          ]
        },
        {
          path: 'accesscontrol',
          redirect: '/accesscontrol/AccessControlManagement',
          name: 'AccessControl',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'accesscontrolmanagement',
              name: 'AccessControlManagement',
              component: AccessControlManagement
            },
            {
              path: 'createaccesscontrolsetting',
              name: 'CreateAccessControlSetting',
              component: CreateAccessControlSetting
            },
            {
              path: 'modifyaccesscontrolsetting',
              name: 'ModifyAccessControlSetting',
              component: ModifyAccessControlSetting
            },
            {
              path: 'accesscontroldevicesettings',
              name: 'AccessControlDeviceSettings',
              component: AccessControlDeviceSettings
            },
            {
              path: 'remotetrigger',
              name: 'RemoteTrigger',
              component: RemoteTrigger
            }
          ]
        },
        {
          path: 'events',
          redirect: '/events/EventControlManagement',
          name: 'EventControl',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'eventcontrolmanagement',
              name: 'EventControlManagement',
              component: EventControlManagement
            },
            {
              path: 'createeventcontrolsetting',
              name: 'CreateEventControlSetting',
              component: CreateEventControlSetting
            },
            {
              path: 'modifyeventcontrolsetting',
              name: 'ModifyEventControlSetting',
              component: ModifyEventControlSetting
            },
          ]
        },
        {
          path: 'displays',
          redirect: '/displays/ModifyWelcomeControlSetting',
          name: 'DisplayControl',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'modifywelcomecontrolsetting',
              name: 'ModifyWelcomeControlSetting',
              component: ModifyWelcomeControlSetting
            },
            {
              path: 'modifyoccupancycontrolsetting',
              name: 'ModifyOccupancyControlSetting',
              component: ModifyOccupancyControlSetting
            },
            {
              path: 'modifycapacitycontrolsetting',
              name: 'ModifyCapacityControlSetting',
              component: ModifyCapacityControlSetting
            },
            // {
            //   path: 'welcomeDashboardSettings',
            //   name: 'WelcomeDashboardSettings',
            //   component: WelcomeDashboardSettings
            // },
          ]
        },
        {
          path: 'systemsettings',
          redirect: '/systemsettings/networksettings',
          name: 'SystemSettings',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'generalsettings',
              name: 'GeneralSettings',
              component: GeneralSettings
            },
            {
              path: 'indicationsettings',
              name: 'IndicationSettings',
              component: IndicationSettings
            },
            {
              path: 'timesettings',
              name: 'TimeSettings',
              component: TimeSettings
            },
            {
              path: 'networksettings',
              name: 'NetworkSettings',
              component: NetworkSettings
            },
            {
              path: 'BackupAndRestore',
              name: 'backupandrestore',
              component: BackupAndRestore
            },
            {
              path: 'upgradesoftware',
              name: 'UpgradeSoftware',
              component: UpgradeSoftware
            },
            {
              path: 'factorydefault',
              name: 'FactoryDefault',
              component: FactoryDefault
            },
            {
              path: 'accountmanagement',
              name: 'AccountManagement',
              component: AccountManagement
            },
            {
              path: 'createaccount',
              name: 'CreateAccount',
              component: CreateAccount
            },
            {
              path: 'systemlog',
              name: 'SystemLog',
              component: SystemLog
            }
          ]
        },
        //新項目路由
        {
          path: 'videodevice',
          redirect: '/videodevice/Cameras',
          name: 'VideoDevice',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'camerasManagement',
              name: 'CamerasManagement',
              component: CamerasManagement
            },
            {
              path: 'tablets',
              name: 'Tablets',
              component: Tablets
            },
            {
              path: 'deviceGroups',
              name: 'DeviceGroups',
              component: DeviceGroups
            },
            {
              path: 'addCameras',
              name: 'AddCameras',
              component: AddCameras
            },
            {
              path: 'modifyCameras',
              name: 'ModifyCameras',
              component: ModifyCameras
            },
            {
              path: 'tabletsBasic',
              name: 'TabletsBasic',
              component: TabletsBasic
            },
            {
              path: 'tabletsAccessSettings',
              name: 'TabletsAccessSettings',
              component: TabletsAccessSettings
            },
          ]
        },
        {
          path: 'outputdevice',
          redirect: '/outputdevice/IOboxsManagement',
          name: 'OutputDevice',
          component: {
            render(c) { return c('router-view') }
          },
          children: [
            {
              path: 'ioboxsManagement',
              name: 'IOboxsManagement',
              component: IOboxsManagement
            },
            {
              path: 'addIOboxs',
              name: 'AddIOboxs',
              component: AddIOboxs
            },
            {
              path: 'modifyIOboxs',
              name: 'ModifyIOboxs',
              component: ModifyIOboxs
            },
            {
              path: 'wiegandconverters',
              name: 'WiegandConverters',
              component: WiegandConverters
            },
            {
              path: 'addWiegandConverters',
              name: 'AddWiegandConverters',
              component: AddWiegandConverters
            },
            {
              path: 'modifyWiegandConverters',
              name: 'ModifyWiegandConverters',
              component: ModifyWiegandConverters
            },
            {
              path: 'outputDeviceGroups',
              name: 'OutputDeviceGroups',
              component: OutputDeviceGroups
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
          ]
        },
      ]
    }
  ]
}

