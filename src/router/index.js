import {
    createRouter,
    createWebHashHistory
} from "vue-router";
import AdminHome from "../views/admin/AdminHome.vue";
import store from "../store";

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/admin',
        redirect: '/admin/emptyPer'
    },
    {
        path: "/admin",
        name: "AdminHome",
        component: AdminHome,
        children: [{
                path: "emptyPer",
                name: "EmptyPer",
                meta: {
                    title: '首页',
                    permission: "00"
                },
                component: () =>
                    import("../views/admin/EmptyPer.vue")
            },
            {
                path: "user",
                name: "user",
                meta: {
                    title: '用户管理',
                    permission: "11"
                },
                component: () =>
                    import("../views/admin/User.vue")
            },
            {
                path: "roleManagement",
                name: "RoleManagement",
                meta: {
                    title: '角色管理',
                    permission: "12"
                },
                component: () =>
                    import("../views/admin/RoleManagement.vue")
            },
            {
                path: "addUser",
                name: "addUser",
                meta: {
                    title: '用户编辑',
                    permission: "11"
                },
                component: () =>
                    import("../views/admin/AddUser.vue")
            },
            {
                path: "permission",
                name: "permission",
                meta: {
                    title: '权限管理',
                    permission: "13"
                },
                component: () =>
                    import("../views/admin/Permission.vue")
            },
            {
                path: "butler",
                name: "Butler",
                meta: {
                    title: '管家管理',
                    permission: "14"
                },
                component: () =>
                    import("../views/admin/Butler.vue")
            },
            {

                path: "patrol",
                name: "Patrol",
                meta: {
                    title: '车场巡逻员管理',
                    permission: "15"
                },
                component: () =>
                    import("../views/admin/Patrol.vue")
            },
            {
                path: "staffManagement",
                name: "StaffManagement",
                meta: {
                    title: '巡检人员管理',
                    permission: "16"
                },
                component: () =>
                    import("../views/admin/StaffManagement.vue")
            },
            {
                path: "communitySet",
                name: "CommunitySet",
                meta: {
                    title: '小区管理',
                    permission: "21"
                },
                component: () =>
                    import("../views/admin/CommunitySet.vue")
            },
            {

                path: "ownerInfo",
                name: "OwnerInfo",
                meta: {
                    title: '业主管理',
                    permission: "22"
                },
                component: () =>
                    import("../views/admin/OwnerInfo.vue")
            },
            {
                path: "gate",
                name: "Gate",
                meta: {
                    title: '出入口系统绑定',
                    permission: "23",
                    // icon: "E:/park-demo-icons/系统管理.png"
                },
                component: () =>
                    import("../views/admin/Gate.vue")
            },
            {
                path: "customer",
                name: "Customer",
                meta: {
                    title: '客户管理',
                    permission: "23"
                },
                component: () =>
                    import("../views/admin/Customer.vue")
            },
            {
                path: "addCustomer",
                name: "AddCustomer",
                meta: {
                    title: '客户编辑',
                    permission: "231"
                },
                component: () =>
                    import("../views/admin/AddCustomer.vue")
            },
            {
                path: "department",
                name: "Department",
                meta: {
                    title: '部门管理',
                    permission: "22"
                },
                component: () =>
                    import("../views/admin/Department.vue")
            },
            {
                path: "addDepartment",
                name: "AddDepartment",
                meta: {
                    title: '部门编辑',
                    permission: "231"
                },
                component: () =>
                    import("../views/admin/AddDepartment.vue")
            },
            {
                path: "deviceInfo",
                name: "DeviceInfo",
                meta: {
                    title: '设备基本信息',
                    permission: "24"
                },
                component: () =>
                    import("../views/admin/DeviceInfo.vue")
            },
            {
                path: "visitPurpose",
                name: "VisitPurpose",
                meta: {
                    title: '来访目的',
                    permission: "25"
                },
                component: () =>
                    import("../views/admin/VisitPurpose.vue")
            },
            {
                path: "addVisitPurpose",
                name: "AddVisitPurpose",
                meta: {
                    title: '来访目的编辑',
                    permission: "251"
                },
                component: () =>
                    import("../views/admin/AddVisitPurpose.vue")

            },
            {
                path: "refuseReason",
                name: "RefuseReason",
                meta: {
                    title: '来访目的',
                    permission: "26"
                },
                component: () =>
                    import("../views/admin/RefuseReason.vue")
            },
            {
                path: "addRefuseReason",
                name: "AddRefuseReason",
                meta: {
                    title: '来访目的编辑',
                    permission: "261"
                },
                component: () =>
                    import("../views/admin/AddRefuseReason.vue")
            },
            {

                path: "appointAudit",
                name: "AppointAudit",
                meta: {
                    title: '预约审批',
                    permission: "31"
                },
                component: () =>
                    import("../views/admin/AppointAudit.vue")
            },
            {
                path: "deviceMng",
                name: "DeviceMng",
                meta: {
                    title: '购买登记',
                    permission: "33"
                },
                component: () =>
                    import("../views/admin/DeviceMng.vue")
            },
            {
                path: "memberAudit",
                name: "MemberAudit",
                meta: {
                    title: '用户审批',
                    permission: "34"
                },
                component: () =>
                    import("../views/admin/MemberAudit.vue")
            },
            {
                path: "community",
                name: "Community",
                meta: {
                    title: '小区管理',
                    permission: "35"
                },
                component: () =>
                    import("../views/admin/Community.vue")
            },
            {
                path: "maintenance",
                name: "Maintenance",
                meta: {
                    title: '报修申请',
                    permission: "61"
                },
                component: () =>
                    import("../views/admin/Maintenance.vue")
            },
            {
                path: "maintenanceAudit",
                name: "MaintenanceAudit",
                meta: {
                    title: '报修审批',
                    permission: "62"
                },
                component: () =>
                    import("../views/admin/MaintenanceAudit.vue")
            },
            {
                path: "allocation",
                name: "Allocation",
                meta: {
                    title: '调拨申请',
                    permission: "51"
                },
                component: () =>
                    import("../views/admin/Allocation.vue")
            },
            {
                path: "allocationAudit",
                name: "AllocationAudit",
                meta: {
                    title: '调拨审批',
                    permission: "52"
                },
                component: () =>
                    import("../views/admin/AllocationAudit.vue")
            },
            {
                path: "book",
                name: "Book",
                meta: {
                    title: '书籍管理',
                    permission: "41"
                },
                component: () =>
                    import("../views/admin/Book.vue")
            },
            {
                path: "vehicleReservation",
                name: "VehicleReservation",
                meta: {
                    title: '外来车辆预约',
                    permission: "42"
                },
                component: () =>
                    import("../views/admin/VehicleReservation.vue")
            },
            {
                path: "yardInfo",
                name: "YardInfo",
                meta: {
                    title: '车场信息管理',
                    permission: "43"
                },
                component: () =>
                    import("../views/admin/YardInfo.vue")
            },
            {
                path: "smsTemplate",
                name: "SmsTemplate",
                meta: {
                    title: '短信模板管理',
                    permission: "93"
                },
                component: () =>
                    import("../views/admin/SmsTemplate.vue")
            },
            {
                path: "blackList",
                name: "blackList",
                meta: {
                    title: '黑名单管理',
                    permission: "44"
                },
                component: () =>
                    import("../views/admin/BlackList.vue")
            },
            {
                path: "notifierInfo",
                name: "NotifierInfo",
                meta: {
                    title: '商场信息管理',
                    permission: "45"
                },
                component: () =>
                    import("../views/admin/NotifierInfo.vue")
            },
            {
                path: "monthTicket",
                name: "monthTicket",
                meta: {
                    title: '月票管理',
                    permission: "46"
                },
                component: () =>
                    import("../views/admin/MonthTicket.vue")
            },
            {
                path: "reportCarIn",
                name: "reportCarIn",
                meta: {
                    title: '车辆入场记录',
                    permission: "47"
                },
                component: () =>
                    import("../views/admin/ReportCarIn.vue")
            },
            {
                path: "reportCarOut",
                name: "reportCarOut",
                meta: {
                    title: '车辆离场记录',
                    permission: "48"
                },
                component: () =>
                    import("../views/admin/ReportCarOut.vue")
            },
            {
                path: "vehicleReservationSuccess",
                name: "VehicleReservationSuccess",
                meta: {
                    title: '外来车辆放行管理',
                    permission: "49"
                },
                component: () =>
                    import("../views/admin/VehicleReservationSuccess.vue")
            },
            {
                path: "scrap",
                name: "Scrap",
                meta: {
                    title: '报废申请',
                    permission: "63"
                },
                component: () =>
                    import("../views/admin/Scrap.vue")
            },
            {
                path: "scrapEdit",
                name: "ScrapEdit",
                meta: {
                    title: '报废审核',
                    permission: "64"
                },
                component: () =>
                    import("../views/admin/ScrapEdit.vue")
            },
            {
                path: "appointment",
                name: "Appointment",
                meta: {
                    title: '预约查询',
                    permission: "71"
                },
                component: () =>
                    import("../views/admin/Appointment.vue")
            },
            {
                path: "venue",
                name: "Venue",
                meta: {
                    title: '入场查询',
                    permission: "72"
                },
                component: () =>
                    import("../views/admin/Venue.vue")
            },
            {
                path: "illegalRegiste",
                name: "IllegalRegiste",
                meta: {
                    title: '违规查询',
                    permission: "76"
                },
                component: () =>
                    import("../views/admin/IllegalRegiste.vue")
            },
            {
                path: "violationManagement",
                name: "ViolationManagement",
                meta: {
                    title: '违规管理',
                    permission: "76"
                },
                component: () =>
                    import("../views/admin/ViolationManagement.vue")
            },
            {
                path: "whitelistManagement",
                name: "WhitelistManagement",
                meta: {
                    title: '白名单管理',
                    permission: "77"
                },
                component: () =>
                    import("../views/admin/WhitelistManagement.vue")
            },
            // 违规配置管理路由
            {
                path: "violationLocationConfig",
                name: "ViolationLocationConfig",
                meta: {
                    title: '违规位置配置',
                    permission: "78"
                },
                component: () =>
                    import("../views/admin/ViolationLocationConfig.vue")
            },
            {
                path: "violationTypeConfig",
                name: "ViolationTypeConfig",
                meta: {
                    title: '违规类型配置',
                    permission: "79"
                },
                component: () =>
                    import("../views/admin/ViolationTypeConfig.vue")
            },
            {
                path: "violationReminder",
                name: "ViolationReminder",
                meta: {
                    title: '违规提醒管理',
                    permission: "80"
                },
                component: () =>
                    import("../views/admin/ViolationReminder.vue")
            },
            {
                path: "blacklistReasonConfig",
                name: "BlacklistReasonConfig",
                meta: {
                    title: '拉黑原因配置',
                    permission: "81"
                },
                component: () =>
                    import("../views/admin/BlacklistReasonConfig.vue")
            },
            // 🆕 个人中心
            {
                path: "ProfileCenter",
                name: "ProfileCenter",
                meta: {
                    title: '个人中心',
                    permission: "90"
                },
                component: () =>
                    import("../views/admin/ProfileCenter.vue")
            },
            // 🆕 系统设置
            {
                path: "SystemSettings",
                name: "SystemSettings",
                meta: {
                    title: '系统设置',
                    permission: "91"
                },
                component: () =>
                    import("../views/admin/SystemSettings.vue")
            },
            // 🆕 帮助文档
            {
                path: "HelpDocs",
                name: "HelpDocs",
                meta: {
                    title: '帮助文档',
                    permission: "92"
                },
                component: () =>
                    import("../views/admin/HelpDocs.vue")
            },
            // 🆕 BigModel AI测试
            {
                path: "BigModelTest",
                name: "BigModelTest",
                meta: {
                    title: 'AI功能测试',
                    permission: "93"
                },
                component: () =>
                    import("../views/admin/BigModelTest.vue")
            },
            {
                path: "tempMedia",
                name: "TempMedia",
                meta: {
                    title: '微信临时素材管理',
                    permission: "94"
                },
                component: () =>
                    import("../views/wechat/tempMedia.vue")
            },
        ]
    },
    {
        path: "/login",
        name: "Login",
        meta: {
            title: '登录'
        },
        component: () =>
            import("../views/Login.vue")
    },
    {
        path: "/parking-dashboard",
        name: "ParkingDashboard",
        meta: {
            title: '智慧停车大屏'
        },
        component: () =>
            import("../views/ParkingDashboard.vue")
    },

];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | 雪人停车管理系统`;

    // 自动添加标签页（登录页面和403页面除外）
    if (to.meta.title && to.path !== '/login' && to.path !== '/403') {
        store.commit('setTagsItem', {
            title: to.meta.title,
            path: to.path,
            name: to.name
        });
    }

    if (to.path === '/login') {
        next();
    }
    const user = localStorage.getItem('user');
    if (!user && to.path !== '/login') {
        console.log(user);
        return next('/login');
    }
    const role = localStorage.getItem('ms_role');
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permission) {
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        // role === to.meta.permission
        //     ? next()
        //     : next('/403');
        next();
    } else {
        next();
    }
});

export default router;