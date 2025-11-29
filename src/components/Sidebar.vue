<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#001529"
      text-color="#ffffff"
      active-text-color="#1890ff"
      unique-opened
      router
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index">
            <template #title>
              <i v-if="item.title === '系统管理'"><img src="../icons/svg/Setting.svg"></i>
              <i v-if="item.title === '小区管理'"><img src="../icons/svg/CommunityManage.svg"></i>
              <i v-if="item.title === '日常管理'"><img src="../icons/svg/DailyManage.svg"></i>
              <i v-if="item.title === '外来车辆管理'"><img src="../icons/svg/CarIntoManage.svg"></i>
              <i v-if="item.title === '查询统计'"><img src="../icons/svg/Query.svg"></i>&nbsp;
              <span style="font-size: 16px;">{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-sub-menu
                v-if="subItem.subs"
                :index="subItem.index"
                :key="subItem.index"
              >
                <template #title>{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, i) in subItem.subs"
                  :key="i"
                  :index="threeItem.index"
                >
                  {{ threeItem.title }}</el-menu-item
                >
              </el-sub-menu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index + '-item'"> 
                <i v-if="subItem.title === '用户管理'"><img src="../icons/svg/UserManage.svg"></i>
                <i v-if="subItem.title === '角色管理'"><img src="../icons/svg/RoleManage.svg"></i>
                <i v-if="subItem.title === '权限管理'"><img src="../icons/svg/LimitManage.svg"></i>
                <i v-if="subItem.title === '管家管理'"><img src="../icons/svg/HouseKeep.svg"></i>
                <i v-if="subItem.title === '巡逻员管理'"><img src="../icons/svg/Patroller.svg"></i>
                <i v-if="subItem.title === '巡检员管理'"><img src="../icons/svg/UserManage.svg"></i>
                <i v-if="subItem.title === '小区设置'"><img src="../icons/svg/Valliage.svg"></i>
                <i v-if="subItem.title === '业主管理'"><img src="../icons/svg/OwnerInfo.svg"></i>
                <i v-if="subItem.title === '出入口系统绑定'"><img src="../icons/svg/Gate.svg"></i>
                <i v-if="subItem.title === '来访目的'"><img src="../icons/svg/VisitPurpose.svg"></i>
                <i v-if="subItem.title === '拒绝原因'"><img src="../icons/svg/RefuseReason.svg"></i>
                <i v-if="subItem.title === '预约审批'"><img src="../icons/svg/AppointAudit.svg"></i>
                <i v-if="subItem.title === '用户审批'"><img src="../icons/svg/MemberAudit.svg"></i>
                <i v-if="subItem.title === '小区管理'"><img src="../icons/svg/CommunityManage.svg"></i>
                <i v-if="subItem.title === '外来车辆预约'"><img src="../icons/svg/VehicleReservation.svg"></i>
                <i v-if="subItem.title === '车场信息管理'"><img src="../icons/svg/YardInfo.svg"></i>
                <i v-if="subItem.title === '短信模板管理'"><img src="../icons/svg/NotifierInfo.svg"></i>
                <i v-if="subItem.title === '黑名单管理'"><img src="../icons/svg/VehicleClassification.svg"></i>
                <i v-if="subItem.title === '商场信息管理'"><img src="../icons/svg/NotifierInfo.svg"></i>
                <i v-if="subItem.title === '月票管理'"><img src="../icons/svg/ReleaseReason.svg"></i>
                <i v-if="subItem.title === '车辆入场记录'"><img src="../icons/svg/ReportCarIn.svg"></i>
                <i v-if="subItem.title === '车辆离场记录'"><img src="../icons/svg/ReportCarOut.svg"></i>
                <i v-if="subItem.title === '外来车辆放行记录'"><img src="../icons/svg/VehicleReservationSuccess.svg"></i>
                <i v-if="subItem.title === '预约查询'"><img src="../icons/svg/Appointment.svg"></i>
                <i v-if="subItem.title === '入场查询'"><img src="../icons/svg/Venue.svg"></i>
                <i v-if="subItem.title === '违规查询'"><img src="../icons/svg/IllegalRegiste.svg"></i>
                <i v-if="subItem.title === '违规类型管理'"><img src="../icons/svg/NotifierInfo.svg"></i>
                <i v-if="subItem.title === '拉黑原因管理'"><img src="../icons/svg/RefuseReason.svg"></i>
                <i v-if="subItem.title === '违规位置管理'"><img src="../icons/svg/Setting.svg"></i>
                    <i v-if="subItem.title === '违规提醒管理'"><img src="../icons/svg/ReportCarOut.svg"></i>
                <i v-if="subItem.title === '白名单管理'"><img src="../icons/svg/VehicleClassification.svg"></i>&nbsp;
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { computed  } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
export default {
  props: ["items"],
  setup() {
    const route = useRoute();

    const onRoutes = computed(() => {
      return route.path;
    });
    const store = useStore();
    const collapse = computed(() => store.state.collapse);
    const collapseChange = () => {
      store.commit("handleCollapse", !collapse.value);
    };
    return {
      // items,
      onRoutes,
      collapse,
      collapseChange
    };
  },
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 71px;
  bottom: 0;
  overflow-y: scroll;
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  box-shadow: 2px 0 8px rgba(0,0,0,0.15);
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-el-menu {
  border-right: none;
  background: transparent !important;
}

.sidebar > ul {
  height: 100%;
}

/* 菜单项悬停效果 */
.sidebar :deep(.el-menu-item:hover) {
  background-color: rgba(24, 144, 255, 0.1) !important;
  transform: translateX(4px);
  transition: all 0.3s ease;
}

/* 激活状态 */
.sidebar :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  border-radius: 6px;
  margin: 2px 8px;
  color: #fff !important;
}

/* 子菜单悬停效果 */
.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: rgba(24, 144, 255, 0.1) !important;
  transform: translateX(2px);
  transition: all 0.3s ease;
}

/* 子菜单项样式 */
.sidebar :deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  font-size: 14px;
  min-height: 44px;
}

/* 图标样式优化 */
.sidebar :deep(.el-menu-item img) {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.sidebar :deep(.el-menu-item:hover img) {
  opacity: 1;
}

/* 主菜单项样式 */
.sidebar :deep(.el-menu-item) {
  min-height: 48px;
  line-height: 48px;
}

.sidebar :deep(.el-sub-menu__title) {
  min-height: 48px;
  line-height: 48px;
}
</style>
