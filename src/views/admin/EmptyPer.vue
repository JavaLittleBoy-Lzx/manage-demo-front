<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-info">
          <h1 class="welcome-title">
            欢迎回来，<span class="username">{{ username }}</span>
          </h1>
          <p class="welcome-desc">雪人停车管理系统 - 让停车管理更智能高效</p>
          <div class="current-time">{{ currentTime }}</div>
        </div>
        <div class="welcome-illustration">
          <div class="illustration-circle">
            <el-icon size="60">
              <Monitor />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    <!-- 快捷操作（只对管家和普通用户显示） -->
    <div v-if="availableQuickActions.length > 0" class="quick-actions-section">
      <h2 class="section-title">快捷操作</h2>
      <div class="actions-grid">
        <div v-for="action in availableQuickActions" :key="action.id" class="action-card"
          @click="goToPage(action.path)">
          <div :class="['action-icon', action.icon]">
            <el-icon>
              <component :is="action.iconComponent" />
            </el-icon>
          </div>
          <div class="action-info">
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </div>
          <div class="action-arrow">
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    <!-- 数据可视化图表区域 -->
    <div class="charts-section">
      <div class="section-header">
        <h2 class="section-title">数据分析</h2>
        <div class="header-actions">
          <el-button type="text" size="small" @click="refreshCharts" :loading="chartsLoading">
            刷新数据
          </el-button>
        </div>
      </div>
      <!-- Tab导航 -->
      <div class="dashboard-tabs">
        <div class="tabs-wrapper">
          <div v-for="tab in chartTabs" :key="tab.key" :class="['tab-item', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key">
            <el-icon>
              <component :is="tab.icon" />
            </el-icon>
            <span>{{ tab.label }}</span>
          </div>
        </div>
      </div>

      <!-- Tab内容区域 -->
      <div class="tab-content" v-loading="chartsLoading">

        <!-- Tab 1: 数据概览 -->
        <div v-show="activeTab === 'overview'"
          :class="['charts-grid', 'overview-grid', { 'appointment-30days': appointmentStatsDays === '30', 'entry-30days': entryStatsDays === '30' && appointmentStatsDays !== '30' }]">
          
          <!-- ==================== 管理员专属：原有数据概览图表 ==================== -->
          
          <!-- 各车场预约数量统计（仅管理员可见） -->
          <div v-if="userRoleName === 'admin'" :class="['chart-container', { 'full-width-chart': appointmentStatsDays === '30' }]">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <CreditCard />
                </el-icon>
                各车场预约数量统计
              </h3>
              <div class="chart-controls">
                <el-radio-group v-model="appointmentStatsDays" size="small" @change="loadParkAppointmentStats">
                  <el-radio-button label="7" value="7">近7天</el-radio-button>
                  <el-radio-button label="30" value="30">近30天</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div ref="parkAppointmentChart" class="chart-content" data-chart="parkAppointment"></div>
          </div>

          <!-- 各车场进场数量统计（仅管理员可见） -->
          <div v-if="userRoleName === 'admin'"
            :class="['chart-container', { 'full-width-chart': entryStatsDays === '30' && appointmentStatsDays !== '30' }]">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <ArrowRight />
                </el-icon>
                各车场进场数量统计
              </h3>
              <div class="chart-controls">
                <el-radio-group v-model="entryStatsDays" size="small" @change="loadParkEntryStats">
                  <el-radio-button label="7" value="7">近7天</el-radio-button>
                  <el-radio-button label="30" value="30">近30天</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div ref="parkEntryChart" class="chart-content" data-chart="parkEntry"></div>
          </div>

          <!-- 预约转化率统计（仅管理员可见） -->
          <div v-if="userRoleName === 'admin'" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <TrendCharts />
                </el-icon>
                预约转化率统计
              </h3>
            </div>
            <div ref="appointmentConversionChart" class="chart-content" data-chart="appointmentConversion"></div>
          </div>

          <!-- 重复放行车辆Top20（仅管理员可见） -->
          <div v-if="userRoleName === 'admin'" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <ArrowRight />
                </el-icon>
                重复放行车辆Top20
              </h3>
            </div>
            <div ref="repeatReleaseChart" class="chart-content" data-chart="repeatRelease"></div>
          </div>

          <!-- ==================== 所有角色可见：违规统计图表 ==================== -->
          
          <!-- 1. 高频违规车辆Top10 -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <WarningFilled />
                </el-icon>
                高频违规车辆Top10
              </h3>
            </div>
            <div ref="topViolatorsChart" class="chart-content" data-chart="topViolators"></div>
          </div>

          <!-- 2. 违规记录趋势（近30天） -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <TrendCharts />
                </el-icon>
                违规记录趋势（近30天）
              </h3>
            </div>
            <div ref="violationTrendChart" class="chart-content" data-chart="violationTrend"></div>
          </div>

          <!-- 3. 巡检人员状态统计 -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <UserFilled />
                </el-icon>
                巡检人员状态统计
              </h3>
            </div>
            <div ref="staffStatusChart" class="chart-content" data-chart="staffStatus"></div>
          </div>

          <!-- 4. 各位置违规频次统计 -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <Location />
                </el-icon>
                各位置违规频次统计
              </h3>
            </div>
            <div ref="locationFrequencyChart" class="chart-content" data-chart="locationFrequency"></div>
          </div>
        </div>

        <!-- Tab 2: 业务分析 -->
        <div v-show="activeTab === 'business'" class="charts-grid business-grid">
            <!-- ==================== 基础统计图表（所有角色可见） ==================== -->
            
          <!-- 管家按小区统计 -->
            <div v-if="!showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <User />
                </el-icon>
                管家按小区统计
              </h3>
            </div>
            <div ref="butlerCommunityChart" class="chart-content" data-chart="butlerCommunity"></div>
          </div>

          <!-- 黑名单按违规类型统计 -->
            <div v-if="!showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <WarningFilled />
                </el-icon>
                黑名单按违规类型统计
              </h3>
            </div>
            <div ref="blacklistViolationChart" class="chart-content" data-chart="blacklistViolation"></div>
          </div>

          <!-- 月票按名称统计 -->
            <div v-if="!showViolationCharts" class="chart-container full-width">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <Tickets />
                </el-icon>
                月票按名称统计
              </h3>
            </div>
            <div ref="monthTicketNameChart" class="chart-content" data-chart="monthTicketName"></div>
          </div>

            <!-- ==================== 🆕 违规统计图表（巡检管理员角色专属） ==================== -->

          <!-- 1. 违规类型趋势分析（近30天） + 2. 巡检员发现问题类型分布 - 一行显示 -->
            <div v-if="showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <DataLine />
                </el-icon>
                违规类型趋势分析（近30天）
              </h3>
            </div>
            <div ref="violationTypeTrendChart" class="chart-content" data-chart="violationTypeTrend"></div>
          </div>

          <div v-if="showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <Histogram />
                </el-icon>
                巡检员发现问题类型分布
              </h3>
            </div>
            <div ref="problemTypeDistributionChart" class="chart-content" data-chart="problemTypeDistribution"></div>
          </div>

          <!-- 3. 违规记录与提醒发送关联分析 -->
            <div v-if="showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <Connection />
                </el-icon>
                违规记录与提醒发送关联分析
              </h3>
            </div>
            <div ref="correlationAnalysisChart" class="chart-content" data-chart="correlationAnalysis"></div>
          </div>

          <!-- 4. 重复违规车辆预警 -->
            <div v-if="showViolationCharts" class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon>
                  <Bell />
                </el-icon>
                重复违规车辆预警
              </h3>
            </div>
            <div ref="repeatViolatorsChart" class="chart-content" data-chart="repeatViolators"></div>
          </div>
        </div>

        <!-- Tab 3: 系统活动 -->
        <div v-show="activeTab === 'activities'" class="activity-tab-content">
          <div class="section-header">
            <h3 class="chart-title">最近活动</h3>
            <div class="header-actions">
              <el-button type="text" size="small" @click="refreshActivities" :loading="activitiesLoading">
                刷新
              </el-button>
            </div>
          </div>
          <div class="activity-list" v-loading="activitiesLoading">
            <div v-if="recentActivities.length === 0" class="empty-activities">
              <el-empty description="暂无活动记录" />
            </div>
            <div v-else v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div :class="['activity-icon', getActivityIconClass(activity.type)]">
                <el-icon>
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.description }}</p>
                <span class="activity-time">{{ formatTimeAgo(activity.createdTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Monitor, CreditCard, User, Calendar, WarningFilled, ArrowUp, ArrowDown,
  ArrowRight, Tickets, Check, Warning, InfoFilled, Clock, Location,
  Phone, Setting, Money, UserFilled, TrendCharts, DataLine, Histogram,
  Connection, Bell
} from '@element-plus/icons-vue';
import { activityApi } from '../../api/activity';
import { dashboardApi } from '../../api/dashboard';
import { userApi } from '../../api/user';
import * as echarts from 'echarts';
// 开发环境下导入测试工具
import { testDashboardApis, generateTestReport } from '../../utils/dashboard-test';
// 导入车场权限管理工具
import { filterDataByParkAuth, getParkAuthTip, isAdmin as checkIsAdmin } from '../../utils/parkAuth';

export default {
  name: "EmptyPer",
  components: {
    Monitor, CreditCard, User, Calendar, WarningFilled, ArrowUp, ArrowDown,
    ArrowRight, Tickets, Check, Warning, InfoFilled, Clock, Location,
    Phone, Setting, Money, UserFilled, TrendCharts, DataLine, Histogram,
    Connection, Bell
  },
  setup() {
    const router = useRouter();
    const username = localStorage.getItem("ms_username") || "管理员";
    const userRole = localStorage.getItem("ms_role") || "admin"; // 获取用户角色ID
    const userRoleName = ref(''); // 角色类型名称（admin/user）
    const currentTime = ref('');
    const recentActivities = ref([]);
    const activitiesLoading = ref(false);
    let timeInterval = null;

    // 图表相关数据
    const activeTab = ref('overview');
    const chartsLoading = ref(false);
    const realtimeData = ref({});
    const trafficTrendDays = ref(7);

    // 新增统计模块的日期范围控制变量
    const appointmentStatsDays = ref("7");
    const entryStatsDays = ref("7");
    const releaseStatsDays = ref("7");

    // 添加调试监听器
    watch(appointmentStatsDays, (newVal, oldVal) => {
      console.log(`📊 appointmentStatsDays 变化: "${oldVal}" -> "${newVal}", 类型: ${typeof newVal}`);
      // 延迟调整所有图表尺寸以适应布局变化，并重新配置tooltip
      setTimeout(() => {
        Object.keys(chartInstances.value).forEach(chartKey => {
          const chart = chartInstances.value[chartKey];
          if (chart && chart.resize) {
            chart.resize();
            console.log(`📏 ${chartKey} 图表尺寸已调整（预约天数变化）`);
          }
        });

        // 统一重新初始化所有tooltip
        setTimeout(() => {
          reinitializeTooltips();
          console.log('🔧 所有图表tooltip已重新初始化（预约天数变化）');
        }, 100);
      }, 600);
    });

    watch(entryStatsDays, (newVal, oldVal) => {
      console.log(`📊 entryStatsDays 变化: "${oldVal}" -> "${newVal}", 类型: ${typeof newVal}`);
      // 延迟调整所有图表尺寸以适应布局变化，并重新配置tooltip
      setTimeout(() => {
        Object.keys(chartInstances.value).forEach(chartKey => {
          const chart = chartInstances.value[chartKey];
          if (chart && chart.resize) {
            chart.resize();
            console.log(`📏 ${chartKey} 图表尺寸已调整（进场天数变化）`);
          }
        });

        // 统一重新初始化所有tooltip
        setTimeout(() => {
          reinitializeTooltips();
          console.log('🔧 所有图表tooltip已重新初始化（进场天数变化）');
        }, 100);
      }, 600);
    });

    // Chart实例
    const chartInstances = ref({});

    // 开发环境检测
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Tab配置
    const chartTabs = ref([
      { key: 'overview', label: '数据概览', icon: CreditCard },
      { key: 'business', label: '业务分析', icon: Tickets },
      { key: 'activities', label: '系统活动', icon: InfoFilled }
    ]);

    // 更新当前时间
    const updateTime = () => {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      currentTime.value = now.toLocaleDateString('zh-CN', options);
    };

    // 🆕 判断角色类型（根据角色ID查询角色信息）
    const fullRoleName = ref(''); // 存储完整的角色名称
    const determineRoleType = async () => {
      try {
        // console.log('📋 [角色判断] 开始判断用户角色类型 - roleId:', userRole);
        
        // 如果是旧的简单判断（roleId = 1 或 2）
        if (userRole == 1) {
          userRoleName.value = 'admin'; // 管理员不显示快捷操作
          fullRoleName.value = '管理员';
          console.log('✅ [角色判断] 角色类型: admin (roleId=1) - 不显示快捷操作');
          return;
        } else if (userRole == 2) {
          userRoleName.value = 'user'; // 普通用户显示快捷操作
          fullRoleName.value = '普通用户';
          console.log('✅ [角色判断] 角色类型: user (roleId=2) - 显示快捷操作');
          return;
        }

        // 对于其他角色ID，通过API查询角色信息
        const response = await userApi.getRoleById(userRole);
        console.log('📊 [角色判断] API响应:', response);

        if (response && response.data) {
          const role = response.data;
          const roleName = role.name || '';
          fullRoleName.value = roleName; // 保存完整的角色名称
          
          console.log('📝 [角色判断] 角色名称:', roleName);
          
          // 根据角色名称判断角色类型
          // ⚠️ 特殊处理：巡检管理员不算作普通管理员
          if (roleName.includes('巡检管理员')) {
            userRoleName.value = 'special_admin'; // 特殊管理员（不显示原有的4个图表）
            console.log('✅ [角色判断] 角色类型: special_admin (巡检管理员) - 不显示原有数据概览图表');
            console.log('📊 [角色判断] 完整角色名称:', roleName);
          }
          // 管理员角色（包含"管理员"字样，但不包含东北林业大学）→ 不显示快捷操作
          else if (roleName.includes('管理员') || roleName.includes('Admin') || roleName.includes('admin')) {
            userRoleName.value = 'admin';
            console.log('✅ [角色判断] 角色类型: admin - 不显示快捷操作');
            console.log('📊 [角色判断] 完整角色名称:', roleName);
          } 
          // 管家角色 → 显示快捷操作
          else if (roleName.includes('管家') || roleName.includes('housekeeper') || roleName.includes('butler')) {
            userRoleName.value = 'housekeeper';
            console.log('✅ [角色判断] 角色类型: housekeeper - 显示快捷操作');
          }
          // 其他角色默认为普通用户 → 显示快捷操作
          else {
            userRoleName.value = 'user';
            console.log('✅ [角色判断] 角色类型: user - 显示快捷操作');
          }
        } else {
          // 默认为user
          userRoleName.value = 'user';
          fullRoleName.value = '用户';
          console.warn('⚠️ [角色判断] API未返回角色信息，默认设置为user');
        }
      } catch (error) {
        console.error('❌ [角色判断] 查询角色信息失败:', error);
        // 出错时默认为user
        userRoleName.value = 'user';
        fullRoleName.value = '用户';
      }
    };

    // 页面跳转
    const goToPage = (path) => {
      router.push(path);
    };

    // 获取活动数据
    const fetchActivities = async () => {
      try {
        activitiesLoading.value = true;
        console.log('开始获取活动数据...');

        const response = await activityApi.getRecentActivities(8);
        console.log('API响应:', response);

        // 处理后端返回的分页数据
        if (response && response.data.code === "0" && response.data.data) {
          // 后端返回的是分页对象，需要取records字段
          const activities = response.data.data.records || [];
          console.log('解析的活动数据:', activities);

          if (activities.length === 0) {
            console.log('暂无活动数据，显示空状态');
            recentActivities.value = [];
          } else {
            // 转换后端数据格式为前端需要的格式
            recentActivities.value = activities.map(item => ({
              id: item.id,
              type: getActivityTypeFromModule(item.module, item.action),
              title: `${item.module} - ${item.action}`,
              description: item.description || `${item.username} 执行了 ${item.action} 操作`,
              createdTime: new Date(item.createdAt)
            }));
            console.log('转换后的活动数据:', recentActivities.value);
          }
        } else {
          console.error('API返回数据格式错误:', response);
          throw new Error(`API返回格式错误: code=${response?.code}, data=${response?.data}`);
        }
      } catch (error) {
        console.error('获取活动数据失败 - 详细错误:', error);
        console.error('错误类型:', error.name);
        console.error('错误消息:', error.message);
        console.error('错误堆栈:', error.stack);
        ElMessage.warning(`暂时无法获取最新活动数据: ${error.message || '网络错误'}，显示模拟数据`);
      } finally {
        activitiesLoading.value = false;
      }
    };

    // 刷新活动数据
    const refreshActivities = async () => {
      try {
        // 记录刷新活动日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";

        await activityApi.logSystemOperation(
          userId,
          username,
          "查询",
          "刷新系统活动日志列表"
        ).catch(err => {
          console.error("记录刷新活动日志失败:", err);
        });

        fetchActivities();
      } catch (error) {
        console.error("刷新活动操作失败:", error);
        // 即使日志记录失败，也要继续执行刷新
        fetchActivities();
      }
    };


    // 将后端的模块和操作转换为前端的活动类型
    const getActivityTypeFromModule = (module, action) => {
      const typeMap = {
        '车主管理': {
          '添加': 'OWNER_REGISTRATION',
          '修改': 'OWNER_UPDATE',
          '删除': 'OWNER_DELETE'
        },
        '违规管理': {
          '添加': 'VIOLATION_RECORD',
          '处理': 'VIOLATION_HANDLE',
          '导出': 'VIOLATION_EXPORT'
        },
        '预约管理': {
          '审批': 'APPOINTMENT_APPROVAL',
          '添加': 'APPOINTMENT_CREATE',
          '修改': 'APPOINTMENT_UPDATE',
          '取消': 'APPOINTMENT_CANCEL',
          '导出': 'APPOINTMENT_EXPORT'
        },
        '月票管理': {
          '续费': 'MONTH_TICKET_RENEWAL',
          '添加': 'MONTH_TICKET_CREATE',
          '修改': 'MONTH_TICKET_UPDATE',
          '删除': 'MONTH_TICKET_DELETE'
        },
        '黑名单管理': {
          '添加': 'BLACKLIST_ADD',
          '移除': 'BLACKLIST_REMOVE',
          '批量删除': 'BLACKLIST_BATCH_DELETE',
          '同步': 'BLACKLIST_SYNC'
        },
        '角色管理': {
          '查询': 'ROLE_QUERY',
          '添加': 'ROLE_CREATE',
          '修改': 'ROLE_UPDATE',
          '删除': 'ROLE_DELETE'
        },
        '系统管理': {
          '登录': 'USER_LOGIN',
          '登出': 'USER_LOGOUT',
          '备份': 'SYSTEM_BACKUP',
          '测试': 'SYSTEM_TEST',
          '查询': 'SYSTEM_QUERY'
        },
        '巡逻员管理': {
          '添加': 'PATROL_CREATE',
          '修改': 'PATROL_UPDATE',
          '删除': 'PATROL_DELETE'
        },
        '巡检人员管理': {
          '添加': 'STAFF_CREATE',
          '修改': 'STAFF_UPDATE',
          '删除': 'STAFF_DELETE',
          '重置密码': 'STAFF_RESET_PASSWORD',
          '状态变更': 'STAFF_STATUS_CHANGE'
        },
        '小区管理': {
          '添加': 'COMMUNITY_CREATE',
          '修改': 'COMMUNITY_UPDATE',
          '删除': 'COMMUNITY_DELETE',
          '批量添加': 'COMMUNITY_BATCH_CREATE'
        },
        '来访目的管理': {
          '删除': 'VISIT_PURPOSE_DELETE'
        },
        '拒绝原因管理': {
          '删除': 'REFUSE_REASON_DELETE'
        },
        '车辆预约管理': {
          '查询': 'VEHICLE_RESERVATION_QUERY',
          '审批': 'VEHICLE_RESERVATION_APPROVAL',
          '添加': 'VEHICLE_RESERVATION_CREATE',
          '修改': 'VEHICLE_RESERVATION_UPDATE',
          '删除': 'VEHICLE_RESERVATION_DELETE'
        },
        '车场管理': {
          '查询': 'YARD_QUERY',
          '添加': 'YARD_CREATE',
          '修改': 'YARD_UPDATE',
          '删除': 'YARD_DELETE'
        },
        '通知商家管理': {
          '查询': 'NOTIFIER_QUERY',
          '添加': 'NOTIFIER_CREATE',
          '修改': 'NOTIFIER_UPDATE',
          '删除': 'NOTIFIER_DELETE'
        },
        '管家管理': {
          '查询': 'BUTLER_QUERY',
          '添加': 'BUTLER_CREATE',
          '修改': 'BUTLER_UPDATE',
          '删除': 'BUTLER_DELETE'
        }
      };

      return typeMap[module]?.[action] || 'SYSTEM_OPERATION';
    };

    // 获取模拟活动数据（用于测试和fallback）
    const getMockActivities = () => {
      return [];
    };

    // 获取活动图标
    const getActivityIcon = (type) => {
      const iconMap = {
        'OWNER_REGISTRATION': User,
        'OWNER_UPDATE': User,
        'OWNER_DELETE': User,
        'VIOLATION_RECORD': Warning,
        'VIOLATION_HANDLE': Check,
        'VIOLATION_EXPORT': ArrowDown,
        'APPOINTMENT_APPROVAL': Check,
        'APPOINTMENT_CREATE': Calendar,
        'APPOINTMENT_UPDATE': Calendar,
        'APPOINTMENT_CANCEL': Calendar,
        'APPOINTMENT_EXPORT': ArrowDown,
        'MONTH_TICKET_RENEWAL': Tickets,
        'MONTH_TICKET_CREATE': Tickets,
        'MONTH_TICKET_UPDATE': Tickets,
        'MONTH_TICKET_DELETE': Tickets,
        'BLACKLIST_ADD': WarningFilled,
        'BLACKLIST_REMOVE': Check,
        'BLACKLIST_BATCH_DELETE': WarningFilled,
        'BLACKLIST_SYNC': Setting,
        'ROLE_QUERY': User,
        'ROLE_CREATE': User,
        'ROLE_UPDATE': User,
        'ROLE_DELETE': User,
        'VEHICLE_ENTRY': ArrowRight,
        'VEHICLE_EXIT': ArrowRight,
        'USER_LOGIN': User,
        'USER_LOGOUT': User,
        'SYSTEM_BACKUP': Setting,
        'SYSTEM_TEST': InfoFilled,
        'SYSTEM_QUERY': InfoFilled,
        'SYSTEM_OPERATION': Setting,
        'PATROL_CREATE': User,
        'PATROL_UPDATE': User,
        'PATROL_DELETE': User,
        'COMMUNITY_CREATE': Location,
        'COMMUNITY_UPDATE': Location,
        'COMMUNITY_DELETE': Location,
        'COMMUNITY_BATCH_CREATE': Location,
        'VISIT_PURPOSE_DELETE': Warning,
        'REFUSE_REASON_DELETE': Warning,
        'VEHICLE_RESERVATION_QUERY': Calendar,
        'VEHICLE_RESERVATION_APPROVAL': Check,
        'VEHICLE_RESERVATION_CREATE': Calendar,
        'VEHICLE_RESERVATION_UPDATE': Calendar,
        'VEHICLE_RESERVATION_DELETE': Calendar,
        'YARD_QUERY': CreditCard,
        'YARD_CREATE': CreditCard,
        'YARD_UPDATE': CreditCard,
        'YARD_DELETE': CreditCard,
        'NOTIFIER_QUERY': Phone,
        'NOTIFIER_CREATE': Phone,
        'NOTIFIER_UPDATE': Phone,
        'NOTIFIER_DELETE': Phone,
        'BUTLER_QUERY': User,
        'BUTLER_CREATE': User,
        'BUTLER_UPDATE': User,
        'BUTLER_DELETE': User
      };
      return iconMap[type] || InfoFilled;
    };

    // 获取活动图标样式类
    const getActivityIconClass = (type) => {
      const classMap = {
        'OWNER_REGISTRATION': 'success',
        'OWNER_UPDATE': 'info',
        'OWNER_DELETE': 'warning',
        'VIOLATION_RECORD': 'warning',
        'VIOLATION_HANDLE': 'success',
        'VIOLATION_EXPORT': 'info',
        'APPOINTMENT_APPROVAL': 'success',
        'APPOINTMENT_CREATE': 'info',
        'APPOINTMENT_UPDATE': 'info',
        'APPOINTMENT_CANCEL': 'warning',
        'APPOINTMENT_EXPORT': 'info',
        'MONTH_TICKET_RENEWAL': 'success',
        'MONTH_TICKET_CREATE': 'info',
        'MONTH_TICKET_UPDATE': 'info',
        'MONTH_TICKET_DELETE': 'warning',
        'BLACKLIST_ADD': 'warning',
        'BLACKLIST_REMOVE': 'success',
        'BLACKLIST_BATCH_DELETE': 'warning',
        'BLACKLIST_SYNC': 'info',
        'ROLE_QUERY': 'info',
        'ROLE_CREATE': 'success',
        'ROLE_UPDATE': 'info',
        'ROLE_DELETE': 'warning',
        'VEHICLE_ENTRY': 'info',
        'VEHICLE_EXIT': 'info',
        'USER_LOGIN': 'success',
        'USER_LOGOUT': 'neutral',
        'SYSTEM_BACKUP': 'info',
        'SYSTEM_TEST': 'info',
        'SYSTEM_QUERY': 'info',
        'SYSTEM_OPERATION': 'neutral',
        'PATROL_CREATE': 'success',
        'PATROL_UPDATE': 'info',
        'PATROL_DELETE': 'warning',
        'COMMUNITY_CREATE': 'success',
        'COMMUNITY_UPDATE': 'info',
        'COMMUNITY_DELETE': 'warning',
        'COMMUNITY_BATCH_CREATE': 'success',
        'VISIT_PURPOSE_DELETE': 'warning',
        'REFUSE_REASON_DELETE': 'warning',
        'VEHICLE_RESERVATION_QUERY': 'info',
        'VEHICLE_RESERVATION_APPROVAL': 'success',
        'VEHICLE_RESERVATION_CREATE': 'info',
        'VEHICLE_RESERVATION_UPDATE': 'info',
        'VEHICLE_RESERVATION_DELETE': 'warning',
        'YARD_QUERY': 'info',
        'YARD_CREATE': 'success',
        'YARD_UPDATE': 'info',
        'YARD_DELETE': 'warning',
        'NOTIFIER_QUERY': 'info',
        'NOTIFIER_CREATE': 'success',
        'NOTIFIER_UPDATE': 'info',
        'NOTIFIER_DELETE': 'warning',
        'BUTLER_QUERY': 'info',
        'BUTLER_CREATE': 'success',
        'BUTLER_UPDATE': 'info',
        'BUTLER_DELETE': 'warning'
      };
      return classMap[type] || 'neutral';
    };

    // 格式化时间（显示相对时间）
    const formatTimeAgo = (timestamp) => {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffInMs = now.getTime() - activityTime.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 1) {
        return '刚刚';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`;
      } else if (diffInMinutes < 1440) { // 24小时
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}小时前`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}天前`;
      }
    };

    // 图表数据获取和渲染方法
    const loadRealtimeData = async () => {
      try {
        console.log('开始获取实时数据...');
        const response = await dashboardApi.getRealtimeOverview();
        // console.log('实时数据API响应:', response);

        if (response && response.data.code === "0" && response.data.data) {
          realtimeData.value = response.data.data;
          // console.log('实时数据加载成功:', realtimeData.value);
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }
      } catch (error) {
        console.error('获取实时数据失败:', error);
        // ElMessage.warning(`获取实时数据失败: ${error.message || '网络错误'}，显示模拟数据`);
        // 降级到模拟数据
        realtimeData.value = {
          parkingUtilization: '78.5%',
          monthTicketCount: '1,268',
          approvalRate: '92.6%',
          pendingViolations: '15',
          todayRevenue: '¥8,520',
          equipmentOnlineRate: '98.3%',
          blacklistCount: '24',
          systemActivity: '94.7%'
        };
      }
    };

    // 通用tooltip重新初始化函数
    const reinitializeTooltips = () => {
      Object.keys(chartInstances.value).forEach(chartKey => {
        const chart = chartInstances.value[chartKey];
        if (chart && !chart.isDisposed()) {
          const currentOption = chart.getOption();
          if (currentOption && currentOption.tooltip && currentOption.tooltip.length > 0) {
            const currentTooltip = currentOption.tooltip[0];
            
            // 检查当前tooltip是否有自定义样式（白色背景）
            const hasCustomStyle = 
              currentTooltip.backgroundColor && 
              currentTooltip.backgroundColor.includes('255, 255, 255');
            
            console.log(`🔧 reinitializeTooltips - ${chartKey}:`, {
              hasCustomStyle,
              currentBg: currentTooltip.backgroundColor
            });
            
            if (hasCustomStyle) {
              // 有自定义样式，保留原样式，只更新功能性配置
              chart.setOption({
                tooltip: {
                  show: true,
                  confine: true,
                  appendToBody: true,
                  enterable: false,
                  hideDelay: 100
                }
              }, false);
            } else {
              // 没有自定义样式，使用默认黑色主题
              chart.setOption({
                tooltip: {
                  show: true,
                  confine: true,
                  appendToBody: true,
                  enterable: false,
                  hideDelay: 100,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderColor: 'transparent',
                  textStyle: {
                    color: '#fff',
                    fontSize: 12
                  },
                  extraCssText: 'z-index: 9999; pointer-events: none;',
                  // 保持原有的trigger和formatter
                  trigger: currentOption.tooltip?.[0]?.trigger || 'axis',
                  formatter: currentOption.tooltip?.[0]?.formatter
                }
              }, false);
            }
          }
        }
      });
    };

    const initChart = (refName, option) => {
      const chartDom = document.querySelector(`[data-chart="${refName}"]`);
      if (!chartDom) return;

      let chart = chartInstances.value[refName];
      if (!chart) {
        chart = echarts.init(chartDom, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });
        chartInstances.value[refName] = chart;
      }

      // 确保tooltip配置正确，增强稳定性
      // 智能合并 tooltip 配置：如果传入了自定义样式，则不使用默认黑色主题
      let mergedTooltip;
      
      if (option.tooltip) {
        // 检查是否有自定义的背景色或文字颜色
        const hasCustomStyle = 
          option.tooltip.backgroundColor || 
          option.tooltip.textStyle?.color;
        
        console.log(`📊 [${refName}] tooltip配置检测:`, {
          hasCustomStyle,
          backgroundColor: option.tooltip.backgroundColor,
          textStyleColor: option.tooltip.textStyle?.color
        });
        
        if (hasCustomStyle) {
          // 有自定义样式，只添加必要的功能性配置，不覆盖样式
          mergedTooltip = {
            show: true,
            confine: true,
            appendToBody: true,
            enterable: false,
            hideDelay: 100,
            ...option.tooltip
          };
          console.log(`✅ [${refName}] 使用自定义样式:`, mergedTooltip);
        } else {
          // 没有自定义样式，使用默认黑色主题
          const defaultBlackTheme = {
            show: true,
            trigger: 'axis',
            confine: true,
            appendToBody: true,
            enterable: false,
            hideDelay: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'transparent',
            textStyle: {
              color: '#fff',
              fontSize: 12
            },
            extraCssText: 'z-index: 9999; pointer-events: none;'
          };
          
          mergedTooltip = {
            ...defaultBlackTheme,
            ...option.tooltip,
            textStyle: {
              ...defaultBlackTheme.textStyle,
              ...(option.tooltip.textStyle || {})
            }
          };
        }
      } else {
        // 没有传入tooltip配置，使用默认黑色主题
        mergedTooltip = {
          show: true,
          trigger: 'axis',
          confine: true,
          appendToBody: true,
          enterable: false,
          hideDelay: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          extraCssText: 'z-index: 9999; pointer-events: none;'
        };
      }
      
      const mergedOption = {
        ...option,
        tooltip: mergedTooltip
      };

      chart.setOption(mergedOption, true);

      // 窗口大小改变时自适应，并重新初始化tooltip
      const resizeHandler = () => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
          // 延迟重新初始化tooltip，确保resize完成后执行
          setTimeout(() => {
            reinitializeTooltips();
          }, 100);
        }
      };

      window.removeEventListener('resize', resizeHandler);
      window.addEventListener('resize', resizeHandler);
    };
    const refreshCharts = async () => {
      chartsLoading.value = true;
      try {
        // 根据当前激活的 tab 来决定刷新哪些图表
        const refreshPromises = [loadRealtimeData()];

        switch (activeTab.value) {
          case 'overview':
            // 管理员刷新原有的数据概览图表
            if (userRoleName.value === 'admin') {
              refreshPromises.push(
                loadParkAppointmentStats(),
                loadParkEntryStats(),
                loadAppointmentConversionStats(),
                loadRepeatReleaseStats()
              );
            }
            // 所有角色刷新违规统计图表
            refreshPromises.push(
              loadTopViolators(),
              loadViolationTrend(),
              loadStaffStatus(),
              loadLocationFrequency()
            );
            break;
          case 'business':
            // 根据角色刷新不同的图表
            if (showViolationCharts.value) {
              // 巡检管理员：刷新违规统计图表
              console.log('📊 [刷新图表] 刷新违规统计图表（巡检管理员）');
            refreshPromises.push(
              loadViolationTypeTrend(),
              loadProblemTypeDistribution(),
              loadCorrelationAnalysis(),
              loadRepeatViolators()
            );
            } else {
              // 其他角色：刷新基础统计图表
              console.log('📊 [刷新图表] 刷新基础统计图表');
              refreshPromises.push(
                loadButlerCommunityStats(),
                loadBlacklistViolationStats(),
                loadMonthTicketNameStats()
              );
            }
            break;
          case 'activities':
            refreshPromises.push(fetchActivities());
            break;
          default:
            // 默认刷新数据概览图表
            if (userRoleName.value === 'admin') {
              refreshPromises.push(
                loadParkAppointmentStats(),
                loadParkEntryStats(),
                loadAppointmentConversionStats(),
                loadRepeatReleaseStats()
              );
            }
            refreshPromises.push(
              loadTopViolators(),
              loadViolationTrend(),
              loadStaffStatus(),
              loadLocationFrequency()
            );
        }

        await Promise.all(refreshPromises);
        console.log(`${activeTab.value} 图表刷新完成`);
        ElMessage.success('图表数据已更新');
      } catch (error) {
        console.error('刷新图表失败:', error);
        ElMessage.error('刷新图表数据失败');
      } finally {
        chartsLoading.value = false;
      }
    };

    // 加载车场预约统计
    const loadParkAppointmentStats = async () => {
      try {
        chartsLoading.value = true;
        console.log(`🔍 开始获取车场预约统计数据 - 原始值: "${appointmentStatsDays.value}", 类型: ${typeof appointmentStatsDays.value}, 天数: ${appointmentStatsDays.value}天`);
        const daysParam = parseInt(appointmentStatsDays.value);
        console.log(`🔍 转换后的参数: ${daysParam}, 类型: ${typeof daysParam}`);
        const response = await dashboardApi.getParkAppointmentStats(daysParam);

        console.log('📊 车场预约统计API响应:', response);

        if (response && response.data.code === "0" && response.data.data) {
          let data = response.data.data;
          console.log(`✅ 使用真实API数据 - 数据条数: ${data.length}, 天数参数: ${appointmentStatsDays.value}`);
          
          // 🔒 根据用户权限过滤车场数据
          data = filterDataByParkAuth(data, 'parkName');
          console.log(`🔒 权限过滤后 - 数据条数: ${data.length}, 提示: ${getParkAuthTip()}`);
          
          // 处理数据并渲染图表
          const parkNames = [...new Set(data.map(item => item.parkName))];
          const dates = [...new Set(data.map(item => item.appointmentDate))].sort();
          console.log(`📅 API返回日期范围: ${dates[0]} 到 ${dates[dates.length - 1]}, 总共${dates.length}天`);
          const series = parkNames.map(parkName => ({
            name: parkName,
            type: 'bar',
            data: dates.map(date => {
              const item = data.find(d => d.parkName === parkName && d.appointmentDate === date);
              return item ? item.appointmentCount : 0;
            })
          }));

          const option = {
            title: { text: '各车场预约数量统计', textStyle: { fontSize: 14, color: '#333' } },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              textStyle: { color: '#fff' },
              formatter: function (params) {
                let result = params[0].axisValue + '<br/>';
                params.forEach(param => {
                  if (param.value > 0) {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                    result += `${param.seriesName}: ${param.value}次<br/>`;
                  }
                });
                return result;
              }
            },
            legend: {
              data: parkNames.filter(name => {
                const seriesData = series.find(s => s.name === name);
                return seriesData && seriesData.data.some(value => value > 0);
              }),
              bottom: 15
            },
            grid: { left: '8%', right: '8%', bottom: '25%', top: '15%', containLabel: true },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                interval: dates.length > 15 ? Math.ceil(dates.length / 8) : 0, // 当数据点过多时，自动调整显示间隔
                rotate: dates.length > 15 ? 45 : 0, // 数据点多时倾斜显示
                fontSize: 11,
                margin: 10
              },
              axisTick: {
                alignWithLabel: true
              }
            },
            yAxis: { type: 'value' },
            series: series.filter(s => s.data.some(value => value > 0)),
            // 添加数据缩放功能，方便用户查看详细数据
            dataZoom: dates.length > 15 ? [
              {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: 100,
                bottom: 5,
                height: 20
              }
            ] : []
          };

          await nextTick();
          initChart('parkAppointment', option);

          // 布局切换后，延迟调整图表尺寸以确保正确显示
          setTimeout(() => {
            const chart = chartInstances.value['parkAppointment'];
            if (chart) {
              // 先重新设置option以确保tooltip配置正确
              const currentOption = chart.getOption();
              chart.setOption({
                ...currentOption,
                tooltip: {
                  show: true,
                  trigger: 'axis',
                  confine: true,
                  appendToBody: true,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  textStyle: { color: '#fff' },
                  formatter: function (params) {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach(param => {
                      if (param.value > 0) {
                        result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                        result += `${param.seriesName}: ${param.value}次<br/>`;
                      }
                    });
                    return result;
                  }
                }
              }, false);

              chart.resize(); // 重新调整图表尺寸
              console.log('📏 预约统计图表尺寸已调整，tooltip重新配置完成');
            }
          }, 500); // 增加延迟时间确保DOM完全更新
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }
      } catch (error) {
        console.error('❌ 加载车场预约统计失败:', error);
        console.log(`⚠️ API调用失败，使用模拟数据 - 天数参数: ${appointmentStatsDays.value}`);
        ElMessage.warning(`获取车场预约统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据
        const mockDates = [];
        const today = new Date();
        const daysCount = parseInt(appointmentStatsDays.value);
        for (let i = daysCount - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockDates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        }
        console.log(`🎭 生成模拟数据 - 天数: ${daysCount}, 日期数量: ${mockDates.length}`);
        console.log(`🎭 模拟数据日期范围: ${mockDates[0]} 到 ${mockDates[mockDates.length - 1]}`);

        const mockData = {
          parkNames: ['A区车场', 'B区车场', 'C区车场'],
          dates: mockDates,
          series: [
            {
              name: 'A区车场',
              type: 'bar',
              data: mockDates.map(() => Math.floor(Math.random() * 50) + 20)
            },
            {
              name: 'B区车场',
              type: 'bar',
              data: mockDates.map(() => Math.floor(Math.random() * 40) + 15)
            },
            {
              name: 'C区车场',
              type: 'bar',
              data: mockDates.map(() => Math.floor(Math.random() * 35) + 10)
            }
          ]
        };

        const option = {
          title: { text: '各车场预约数量统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            textStyle: { color: '#fff' },
            formatter: function (params) {
              let result = params[0].axisValue + '<br/>';
              params.forEach(param => {
                result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                result += `${param.seriesName}: ${param.value}次<br/>`;
              });
              return result;
            }
          },
          legend: { data: mockData.parkNames, bottom: 15 },
          grid: { left: '8%', right: '8%', bottom: '25%', top: '15%', containLabel: true },
          xAxis: {
            type: 'category',
            data: mockData.dates,
            axisLabel: {
              interval: mockData.dates.length > 15 ? Math.ceil(mockData.dates.length / 8) : 0, // 当数据点过多时，自动调整显示间隔
              rotate: mockData.dates.length > 15 ? 45 : 0, // 数据点多时倾斜显示
              fontSize: 11,
              margin: 10
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: { type: 'value' },
          series: mockData.series,
          // 添加数据缩放功能，方便用户查看详细数据
          dataZoom: mockData.dates.length > 15 ? [
            {
              type: 'slider',
              show: true,
              xAxisIndex: 0,
              start: 0,
              end: 100,
              bottom: 5,
              height: 20
            }
          ] : []
        };

        await nextTick();
        initChart('parkAppointment', option);

        // 模拟数据情况下也需要调整图表尺寸
        setTimeout(() => {
          const chart = chartInstances.value['parkAppointment'];
          if (chart) {
            // 先重新设置option以确保tooltip配置正确
            const currentOption = chart.getOption();
            chart.setOption({
              ...currentOption,
              tooltip: {
                show: true,
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: { color: '#fff' },
                formatter: function (params) {
                  let result = params[0].axisValue + '<br/>';
                  params.forEach(param => {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                    result += `${param.seriesName}: ${param.value}次<br/>`;
                  });
                  return result;
                }
              }
            }, false);

            chart.resize(); // 重新调整图表尺寸
            console.log('📏 预约统计图表尺寸已调整（模拟数据），tooltip重新配置完成');
          }
        }, 500);
      } finally {
        chartsLoading.value = false;
      }
    };

    // 加载车场进场统计
    const loadParkEntryStats = async () => {
      try {
        chartsLoading.value = true;
        console.log(`🔍 开始获取车场进场统计数据 - 原始值: "${entryStatsDays.value}", 类型: ${typeof entryStatsDays.value}, 天数: ${entryStatsDays.value}天`);
        const daysParam = parseInt(entryStatsDays.value);
        console.log(`🔍 转换后的参数: ${daysParam}, 类型: ${typeof daysParam}`);
        const response = await dashboardApi.getParkEntryStats(daysParam);

        console.log('📊 车场进场统计API响应:', response);

        if (response && response.data.code === "0" && response.data.data) {
          let data = response.data.data;
          console.log(`✅ 使用真实API数据 - 数据条数: ${data.length}, 天数参数: ${entryStatsDays.value}`);
          
          // 🔒 根据用户权限过滤车场数据
          data = filterDataByParkAuth(data, 'parkName');
          console.log(`🔒 权限过滤后 - 数据条数: ${data.length}, 提示: ${getParkAuthTip()}`);
          
          const parkNames = [...new Set(data.map(item => item.parkName))];
          const dates = [...new Set(data.map(item => item.entryDate))].sort();
          console.log(`📅 API返回日期范围: ${dates[0]} 到 ${dates[dates.length - 1]}, 总共${dates.length}天`);
          const series = parkNames.map(parkName => ({
            name: parkName,
            type: 'line',
            smooth: true,
            data: dates.map(date => {
              const item = data.find(d => d.parkName === parkName && d.entryDate === date);
              return item ? item.entryCount : 0;
            })
          }));

          const option = {
            title: { text: '各车场进场数量统计', textStyle: { fontSize: 14, color: '#333' } },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              textStyle: { color: '#fff' },
              formatter: function (params) {
                let result = params[0].axisValue + '<br/>';
                params.forEach(param => {
                  if (param.value > 0) {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                    result += `${param.seriesName}: ${param.value}次<br/>`;
                  }
                });
                return result;
              }
            },
            legend: {
              data: parkNames.filter(name => {
                const seriesData = series.find(s => s.name === name);
                return seriesData && seriesData.data.some(value => value > 0);
              }),
              bottom: 15
            },
            grid: { left: '8%', right: '8%', bottom: '25%', top: '15%', containLabel: true },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                interval: dates.length > 15 ? Math.ceil(dates.length / 8) : 0, // 当数据点过多时，自动调整显示间隔
                rotate: dates.length > 15 ? 45 : 0, // 数据点多时倾斜显示
                fontSize: 11,
                margin: 10
              },
              axisTick: {
                alignWithLabel: true
              }
            },
            yAxis: { type: 'value' },
            series: series.filter(s => s.data.some(value => value > 0)).map(s => ({
              ...s,
              lineStyle: { width: 3 },
              symbolSize: 6
            })),
            // 添加数据缩放功能，方便用户查看详细数据
            dataZoom: dates.length > 15 ? [
              {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: 100,
                bottom: 5,
                height: 20
              }
            ] : []
          };

          await nextTick();
          initChart('parkEntry', option);

          // 布局切换后，延迟调整图表尺寸以确保正确显示
          setTimeout(() => {
            const chart = chartInstances.value['parkEntry'];
            if (chart) {
              // 先重新设置option以确保tooltip配置正确
              const currentOption = chart.getOption();
              chart.setOption({
                ...currentOption,
                tooltip: {
                  show: true,
                  trigger: 'axis',
                  confine: true,
                  appendToBody: true,
                  axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  textStyle: { color: '#fff' },
                  formatter: function (params) {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach(param => {
                      if (param.value > 0) {
                        result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                        result += `${param.seriesName}: ${param.value}次<br/>`;
                      }
                    });
                    return result;
                  }
                }
              }, false);

              chart.resize(); // 重新调整图表尺寸
              console.log('📏 进场统计图表尺寸已调整，tooltip重新配置完成');
            }
          }, 500); // 增加延迟时间确保DOM完全更新
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }
      } catch (error) {
        console.error('❌ 加载车场进场统计失败:', error);
        console.log(`⚠️ API调用失败，使用模拟数据 - 天数参数: ${entryStatsDays.value}`);
        ElMessage.warning(`获取车场进场统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据
        const mockDates = [];
        const today = new Date();
        const daysCount = parseInt(entryStatsDays.value);
        for (let i = daysCount - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockDates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        }
        console.log(`🎭 生成模拟数据 - 天数: ${daysCount}, 日期数量: ${mockDates.length}`);
        console.log(`🎭 模拟数据日期范围: ${mockDates[0]} 到 ${mockDates[mockDates.length - 1]}`);

        const mockData = {
          parkNames: ['A区车场', 'B区车场', 'C区车场'],
          dates: mockDates,
          series: [
            {
              name: 'A区车场',
              type: 'line',
              smooth: true,
              data: mockDates.map(() => Math.floor(Math.random() * 80) + 40),
              lineStyle: { width: 3 },
              symbolSize: 6
            },
            {
              name: 'B区车场',
              type: 'line',
              smooth: true,
              data: mockDates.map(() => Math.floor(Math.random() * 70) + 30),
              lineStyle: { width: 3 },
              symbolSize: 6
            },
            {
              name: 'C区车场',
              type: 'line',
              smooth: true,
              data: mockDates.map(() => Math.floor(Math.random() * 60) + 25),
              lineStyle: { width: 3 },
              symbolSize: 6
            }
          ]
        };

        const option = {
          title: { text: '各车场进场数量统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            textStyle: { color: '#fff' },
            formatter: function (params) {
              let result = params[0].axisValue + '<br/>';
              params.forEach(param => {
                result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                result += `${param.seriesName}: ${param.value}次<br/>`;
              });
              return result;
            }
          },
          legend: { data: mockData.parkNames, bottom: 15 },
          grid: { left: '8%', right: '8%', bottom: '25%', top: '15%', containLabel: true },
          xAxis: {
            type: 'category',
            data: mockData.dates,
            axisLabel: {
              interval: mockData.dates.length > 15 ? Math.ceil(mockData.dates.length / 8) : 0, // 当数据点过多时，自动调整显示间隔
              rotate: mockData.dates.length > 15 ? 45 : 0, // 数据点多时倾斜显示
              fontSize: 11,
              margin: 10
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: { type: 'value' },
          series: mockData.series,
          // 添加数据缩放功能，方便用户查看详细数据
          dataZoom: mockData.dates.length > 15 ? [
            {
              type: 'slider',
              show: true,
              xAxisIndex: 0,
              start: 0,
              end: 100,
              bottom: 5,
              height: 20
            }
          ] : []
        };

        await nextTick();
        initChart('parkEntry', option);

        // 模拟数据情况下也需要调整图表尺寸
        setTimeout(() => {
          const chart = chartInstances.value['parkEntry'];
          if (chart) {
            // 先重新设置option以确保tooltip配置正确
            const currentOption = chart.getOption();
            chart.setOption({
              ...currentOption,
              tooltip: {
                show: true,
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: { color: '#fff' },
                formatter: function (params) {
                  let result = params[0].axisValue + '<br/>';
                  params.forEach(param => {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                    result += `${param.seriesName}: ${param.value}次<br/>`;
                  });
                  return result;
                }
              }
            }, false);

            chart.resize(); // 重新调整图表尺寸
            console.log('📏 进场统计图表尺寸已调整（模拟数据），tooltip重新配置完成');
          }
        }, 500);
      } finally {
        chartsLoading.value = false;
      }
    };
    // ========== 业务分析模块图表加载函数 ==========

    // 加载月票按名称统计
    const loadMonthTicketNameStats = async () => {
      try {
        console.log('开始获取月票按名称统计数据...');
        const response = await dashboardApi.getMonthTicketByNameStats();

        let data = [];
        if (response && response.data.code === "0" && response.data.data) {
          // 过滤并验证数据
          const rawData = Array.isArray(response.data.data) ? response.data.data : [];
          data = rawData
            .filter(item => item && typeof item === 'object' && item.ticketName && typeof item.count === 'number')
            .map((item, index) => ({
              name: item.ticketName,
              value: item.count,
              itemStyle: { color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'][index % 4] }
            }));
          console.log('月票按名称统计数据加载成功:', data);
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }

        const filteredData = data.filter(item => item.value > 0);

        // 根据数据量选择合适的图表类型
        let option;
        if (filteredData.length <= 4) {
          // 数据较少时使用饼图，能更好显示名称
          option = {
            title: { text: '月票按名称统计', textStyle: { fontSize: 14, color: '#333' } },
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c}张 ({d}%)'
            },
            legend: {
              orient: 'horizontal',
              bottom: 10,
              data: filteredData.map(item => item.name)
            },
            series: [{
              name: '月票分布',
              type: 'pie',
              radius: ['30%', '70%'],
              center: ['50%', '45%'],
              data: filteredData,
              label: {
                show: true,
                formatter: '{b}\n{c}张'
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
        } else {
          // 数据较多时使用横向柱状图，能完整显示长名称
          option = {
            title: {
              text: '月票按名称统计',
              textStyle: { fontSize: 14, color: '#333' },
              left: 'left'
            },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: {
              left: '30%',
              right: '8%',
              bottom: '8%',
              top: '10%',
              containLabel: true
            },
            xAxis: { type: 'value' },
            yAxis: {
              type: 'category',
              data: filteredData.map(item => item.name),
              axisLabel: {
                interval: 0,
                fontSize: 12,
                width: 80,
                overflow: 'truncate'
              }
            },
            series: [{
              name: '数量',
              type: 'bar',
              data: filteredData.map(item => ({
                value: item.value,
                itemStyle: item.itemStyle
              })),
              barHeight: '60%',
              label: {
                show: true,
                position: 'right',
                formatter: '{c}张'
              }
            }]
          };
        }

        await nextTick();
        initChart('monthTicketName', option);
      } catch (error) {
        console.error('加载月票名称统计失败:', error);
        ElMessage.warning(`获取月票名称统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据
        const mockData = [
          { name: '临时月票', value: 320, itemStyle: { color: '#409eff' } },
          { name: '普通月票', value: 240, itemStyle: { color: '#67c23a' } },
          { name: 'VIP月票', value: 180, itemStyle: { color: '#e6a23c' } },
          { name: '商务月票', value: 160, itemStyle: { color: '#f56c6c' } }
        ];

        const filteredMockData = mockData.filter(item => item.value > 0);

        // 根据数据量选择合适的图表类型
        let option;
        if (filteredMockData.length <= 4) {
          // 数据较少时使用饼图，能更好显示名称
          option = {
            title: { text: '月票按名称统计', textStyle: { fontSize: 14, color: '#333' } },
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c}张 ({d}%)'
            },
            legend: {
              orient: 'horizontal',
              bottom: 10,
              data: filteredMockData.map(item => item.name)
            },
            series: [{
              name: '月票分布',
              type: 'pie',
              radius: ['30%', '70%'],
              center: ['50%', '45%'],
              data: filteredMockData,
              label: {
                show: true,
                formatter: '{b}\n{c}张'
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
        } else {
          // 数据较多时使用横向柱状图，能完整显示长名称
          option = {
            title: {
              text: '月票按名称统计',
              textStyle: { fontSize: 14, color: '#333' },
              left: 'left'
            },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: {
              left: '25%',
              right: '8%',
              bottom: '8%',
              top: '10%',
              containLabel: true
            },
            xAxis: { type: 'value' },
            yAxis: {
              type: 'category',
              data: filteredMockData.map(item => item.name),
              axisLabel: {
                interval: 0,
                fontSize: 12,
                width: 120,
                overflow: 'truncate'
              }
            },
            series: [{
              name: '数量',
              type: 'bar',
              data: filteredMockData.map(item => ({
                value: item.value,
                itemStyle: item.itemStyle
              })),
              barHeight: '70%',
              label: {
                show: true,
                position: 'right',
                formatter: '{c}张'
              }
            }]
          };
        }

        await nextTick();
        initChart('monthTicketName', option);
      }
    };
    // 加载黑名单按违规类型统计
    const loadBlacklistViolationStats = async () => {
      try {
        console.log('开始获取黑名单违规类型统计数据...');
        const response = await dashboardApi.getBlacklistByViolationStats();

        let data = [];
        if (response && response.data.code === "0" && response.data.data) {
          // 过滤并验证数据
          const rawData = Array.isArray(response.data.data) ? response.data.data : [];
          data = rawData
            .filter(item => item && typeof item === 'object' && item.violationType && typeof item.count === 'number')
            .map((item, index) => ({
              name: item.violationType,
              value: item.count,
              itemStyle: { color: ['#f56c6c', '#ffa726', '#42a5f5', '#ab47bc'][index % 4] }
            }));
          console.log('黑名单按违规类型统计数据加载成功:', data);
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }

        const filteredData = data.filter(item => item.value > 0);
        const option = {
          title: { text: '黑名单按违规类型统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: {
            show: filteredData.length > 0,
            data: filteredData.map(item => item.name)
          },
          series: [{
            name: '违规类型',
            type: 'pie',
            radius: ['40%', '70%'],
            data: filteredData
          }]
        };

        await nextTick();
        initChart('blacklistViolation', option);
      } catch (error) {
        console.error('加载黑名单违规类型统计失败:', error);
        ElMessage.warning(`获取黑名单违规类型统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据
        const mockData = [];

        const filteredMockData = mockData.filter(item => item.value > 0);
        const option = {
          title: { text: '黑名单按违规类型统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: {
            show: filteredMockData.length > 0,
            data: filteredMockData.map(item => item.name)
          },
          series: [{
            name: '违规类型',
            type: 'pie',
            radius: ['40%', '70%'],
            data: filteredMockData
          }]
        };

        await nextTick();
        initChart('blacklistViolation', option);
      }
    };

    // 加载管家按小区统计
    const loadButlerCommunityStats = async () => {
      try {
        console.log('开始获取管家按小区统计数据...');
        const response = await dashboardApi.getButlerByCommunityStats();

        let data = [];
        if (response && response.data.code === "0" && response.data.data) {
          // 过滤并验证数据
          const rawData = Array.isArray(response.data.data) ? response.data.data : [];
          data = rawData
            .filter(item => item && typeof item === 'object' && item.communityName && typeof item.butlerCount === 'number')
            .map((item, index) => ({
              name: item.communityName,
              value: item.butlerCount,
              itemStyle: { color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'][index % 4] }
            }));
          console.log('管家按小区统计数据加载成功:', data);
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }

        const filteredData = data.filter(item => item.value > 0);
        const option = {
          title: { text: '管家按小区统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
          legend: {
            show: filteredData.length > 0,
            data: filteredData.map(item => item.name)
          },
          series: [{
            name: '管家分布',
            type: 'pie',
            radius: '60%',
            data: filteredData
          }]
        };

        await nextTick();
        initChart('butlerCommunity', option);
      } catch (error) {
        console.error('加载管家小区统计失败:', error);
        ElMessage.warning(`获取管家小区统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据
        const mockData = [];
        const filteredMockData = mockData.filter(item => item.value > 0);
        const option = {
          title: { text: '管家按小区统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
          legend: {
            show: filteredMockData.length > 0,
            data: filteredMockData.map(item => item.name)
          },
          series: [{
            name: '管家分布',
            type: 'pie',
            radius: '60%',
            data: filteredMockData
          }]
        };

        await nextTick();
        initChart('butlerCommunity', option);
      }
    };

    // ==================== 🆕 新增统计图表数据加载方法 ====================

    // 1. 加载高频违规车辆Top10（参考重复放行车辆Top20样式）
    const loadTopViolators = async () => {
      try {
        console.log('开始获取高频违规车辆Top10...');
        const response = await dashboardApi.getTopViolators(30, 10);
        
        let rawData = response?.data?.data || [];
        console.log('高频违规车辆原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          console.log(`🔒 违规数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        // 聚合数据：由于后端现在按 plateNumber + parkName 分组，前端需要按 plateNumber 汇总
        const plateMap = new Map();
        rawData.forEach(item => {
          const plateNumber = item.plateNumber;
          if (!plateMap.has(plateNumber)) {
            plateMap.set(plateNumber, {
              plateNumber,
              violationCount: 0,
              violationTypes: new Set(),
              lastViolationTime: null
            });
          }
          const plateData = plateMap.get(plateNumber);
          plateData.violationCount += item.violationCount || 0;
          
          // 合并违规类型
          if (item.violationTypes) {
            item.violationTypes.split(',').forEach(type => {
              plateData.violationTypes.add(type.trim());
            });
          }
          
          // 更新最后违规时间
          const currentTime = new Date(item.lastViolationTime);
          if (!plateData.lastViolationTime || currentTime > new Date(plateData.lastViolationTime)) {
            plateData.lastViolationTime = item.lastViolationTime;
          }
        });
        
        // 转换为数组并排序，取Top10
        const aggregatedData = Array.from(plateMap.values())
          .map(item => ({
            ...item,
            violationTypes: Array.from(item.violationTypes).join(', ')
          }))
          .sort((a, b) => b.violationCount - a.violationCount)
          .slice(0, 10);
        
        // 使用formatPlateNumber处理车牌号，添加车牌类型信息
        const data = aggregatedData.map(item => ({
          ...formatPlateNumber(item.plateNumber),
          violationCount: item.violationCount,
          violationTypes: item.violationTypes,
          lastViolationTime: item.lastViolationTime
        }));
        
        const option = {
          title: { 
            text: '高频违规车辆Top10', 
            textStyle: { fontSize: 14, color: '#333' } 
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params) {
              const item = params[0];
              const dataIndex = item.dataIndex;
              const plateInfo = data[data.length - 1 - dataIndex]; // 因为数据是反转的
              const typeIcon = plateInfo.isNewEnergy ? '🔋' : '⛽';
              
              // 使用与重复放行车辆Top20相同的车牌样式配色
              const plateBgColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';
              const plateTextColor = plateInfo.plateTypeClass === 'new-energy' ? '#000000' : '#FFFFFF';
              const plateBorderColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';
              
              return `
                <div style="padding: 12px;">
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background: ${plateInfo.typeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-right: 8px;">
                      ${typeIcon} ${plateInfo.plateType}
                    </span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="
                      display: inline-block; 
                      background: ${plateBgColor}; 
                      color: ${plateTextColor}; 
                      border: 1px solid ${plateBorderColor};
                      padding: 6px 10px; 
                      border-radius: 6px; 
                      font-size: 15px; 
                      font-weight: bold; 
                      font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
                      letter-spacing: 0.8px;
                      min-width: 85px;
                      text-align: center;
                    ">
                      ${plateInfo.plateNumber}
                    </span>
                  </div>
                  <div style="margin-bottom: 5px;">违规次数: <span style="color: #ff4444; font-weight: bold; font-size: 16px;">${item.value}次</span></div>
                  ${plateInfo.violationTypes ? `<div style="font-size: 11px; color: #666;">违规类型: ${plateInfo.violationTypes}</div>` : ''}
                </div>
              `;
            }
          },
          grid: { left: '25%', right: '8%', bottom: '8%', top: '12%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: { 
            type: 'category',
            data: data.map(item => item.plateNumber).reverse(),
            axisLabel: {
              fontSize: 12,
              margin: 15,
              interval: 0,
              formatter: function (value) {
                const plateInfo = data.find(item => item.plateNumber === value);
                if (!plateInfo) return value;
                
                // 使用与重复放行车辆Top20相同的车牌样式
                if (plateInfo.plateTypeClass === 'new-energy') {
                  return `{newEnergyPlate|${value}}`;
                } else {
                  return `{traditionalPlate|${value}}`;
                }
              },
              rich: {
                // 新能源车牌样式 - 参考重复放行车辆Top20的绿色渐变
                newEnergyPlate: {
                  backgroundColor: '#6AD390',
                  color: '#000000',
                  borderColor: '#6AD390',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                },
                // 传统燃油车牌样式 - 参考重复放行车辆Top20的蓝色渐变
                traditionalPlate: {
                  backgroundColor: '#0C4FC5',
                  color: '#FFFFFF',
                  borderColor: '#0C4FC5',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                }
              }
            },
            axisTick: {
              alignWithLabel: true,
              length: 6
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#f5f5f5',
                width: 1,
                type: 'solid'
              }
            }
          },
          series: [{
            name: '违规次数',
            type: 'bar',
            data: data.map((item, index) => ({
              value: item.violationCount,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  item.plateTypeClass === 'new-energy' ? [
                    { offset: 0, color: '#6AD390' },
                    { offset: 1, color: '#D0F1E4' }
                  ] : [
                    { offset: 0, color: '#0C4FC5' },
                    { offset: 1, color: '#216FEF' }
                  ]
                )
              }
            })).reverse(),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}次',
              fontSize: 11,
              color: '#333',
              fontWeight: 'bold'
            }
      }]
    };
    
    await nextTick();
    initChart('topViolators', option);
    
    // 为图表添加点击事件，跳转到违规记录页面
    const chartInstance = chartInstances.value['topViolators'];
    if (chartInstance) {
      // 移除旧的点击事件监听器（如果有）
      chartInstance.off('click');
      
      // 添加新的点击事件监听器
      chartInstance.on('click', (params) => {
        if (params.componentType === 'series') {
          // 因为数据是反转的，需要计算正确的索引
          const dataIndex = data.length - 1 - params.dataIndex;
          const clickedData = data[dataIndex];
          
          if (clickedData && clickedData.plateNumber) {
            console.log('点击高频违规车辆:', clickedData.plateNumber);
            
            // 🔧 隐藏tooltip（悬浮窗）
            chartInstance.dispatchAction({
              type: 'hideTip'
            });
            
            // 跳转到违规记录页面，传递车牌号作为搜索参数
            router.push({
              path: '/admin/IllegalRegiste',
              query: {
                plateNumber: clickedData.plateNumber
              }
            });
            
            ElMessage.success(`正在查看 ${clickedData.plateNumber} 的违规记录`);
          }
        }
      });
    }
  } catch (error) {
    console.error('加载高频违规车辆失败:', error);
  }
};

    // 2. 加载违规记录趋势统计
    const loadViolationTrend = async () => {
      try {
        console.log('开始获取违规记录趋势...');
        const response = await dashboardApi.getViolationTrend(30);
        
        let rawData = response?.data?.data || [];
        console.log('违规趋势原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          // console.log(`🔒 违规趋势数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        // 聚合数据：由于后端现在按 date + parkName 分组，前端需要按 date 汇总
        const dateMap = new Map();
        rawData.forEach(item => {
          const date = item.date;
          if (!dateMap.has(date)) {
            dateMap.set(date, { date, count: 0, uniqueVehicles: 0 });
          }
          const dateData = dateMap.get(date);
          dateData.count += item.count || 0;
          dateData.uniqueVehicles += item.uniqueVehicles || 0;
        });
        
        const data = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        
        const option = {
          title: { text: '违规记录趋势（近30天）', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'axis' },
          grid: { left: '10%', right: '10%', bottom: '15%', top: '15%' },
          xAxis: { 
            type: 'category',
            data: data.map(item => item.date),
            axisLabel: { rotate: 45, fontSize: 10 }
          },
          yAxis: { type: 'value' },
          series: [{
            name: '违规数量',
            type: 'line',
            data: data.map(item => item.count),
            smooth: true,
            itemStyle: { color: '#e6a23c' },
            areaStyle: { opacity: 0.3 }
          }]
        };
        
        await nextTick();
        initChart('violationTrend', option);
      } catch (error) {
        console.error('加载违规趋势失败:', error);
      }
    };

    // 3. 加载巡检人员状态统计
    const loadStaffStatus = async () => {
      try {
        console.log('开始获取巡检人员状态统计...');
        const response = await dashboardApi.getStaffStatusStats();
        
        const data = response?.data?.data || [];
        const option = {
          title: { text: '巡检人员状态统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
          series: [{
            name: '人员状态',
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.map(item => ({
              name: item.statusName,
              value: item.count
            })),
            label: { show: true, formatter: '{b}\n{c}人' }
          }]
        };
        
        await nextTick();
        initChart('staffStatus', option);
      } catch (error) {
        console.error('加载巡检人员状态统计失败:', error);
      }
    };

    // 4. 加载各位置违规频次统计（横轴柱状图）
    const loadLocationFrequency = async () => {
      try {
        console.log('开始获取各位置违规频次统计...');
        const response = await dashboardApi.getLocationFrequency(30);
        // console.log("各位置违规频次统计",response);
        let data = response?.data?.data || [];
        // console.log("各位置违规频次统计 - 原始数据:",data);
        
        // 🔒 根据用户权限过滤车场数据
        // 注意：location 是违规位置，不是车场名称，应该使用 parkName 字段进行过滤
        if (data.length > 0) {
          // 检查数据中是否有 parkName 或 parkingName 等车场字段
          const parkFieldName = data[0].parkName ? 'parkName' 
            : data[0].parkingName ? 'parkingName'
            : data[0].parkingLotName ? 'parkingLotName'
            : null;
          
          if (parkFieldName) {
            // 有车场字段，按车场权限过滤
            data = filterDataByParkAuth(data, parkFieldName);
            // console.log(`🔒 按车场权限过滤后（字段: ${parkFieldName}）- 数据条数: ${data.length}`);
          } else {
            // 没有车场字段，说明是全局统计，不需要过滤（或者 location 本身就是车场）
            console.log(`⚠️ 数据中未找到车场字段，保留所有数据 - 数据条数: ${data.length}`);
          }
        }
        const option = {
          title: { text: '各位置违规频次统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '10%', right: '10%', bottom: '20%', top: '15%' },
          xAxis: { 
            type: 'category',
            data: data.map(item => item.location),
            axisLabel: { 
              rotate: 45,
              fontSize: 10,
              interval: 0 // 显示所有标签
            }
          },
          yAxis: { 
            type: 'value',
            name: '违规次数'
          },
          series: [{
            name: '违规次数',
            type: 'bar',
            data: data.map(item => item.count),
            itemStyle: { 
              color: '#409eff',
              barBorderRadius: [4, 4, 0, 0]
            },
            label: { show: true, position: 'top', fontSize: 10 }
          }]
        };
        
        await nextTick();
        initChart('locationFrequency', option);
      } catch (error) {
        console.error('加载位置违规频次统计失败:', error);
      }
    };

    // 5. 加载违规类型趋势分析（增强悬浮提示）
    const loadViolationTypeTrend = async () => {
      try {
        console.log('开始获取违规类型趋势分析...');
        const response = await dashboardApi.getViolationTypeTrend(30);
        
        let rawData = response?.data?.data || [];
        console.log('违规类型趋势原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          console.log(`🔒 违规类型趋势数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        const dates = [...new Set(rawData.map(item => item.date))].sort();
        const types = [...new Set(rawData.map(item => item.violationType))];
        
        const series = types.map(type => ({
          name: type,
          type: 'line',
          data: dates.map(date => {
            // 聚合同一日期、同一类型的所有车场数据
            const items = rawData.filter(d => d.date === date && d.violationType === type);
            return items.reduce((sum, item) => sum + (item.count || 0), 0);
          }),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            focus: 'series'
          }
        }));
        
        const option = {
          title: { 
            text: '违规类型趋势分析（近30天）', 
            textStyle: { fontSize: 14, color: '#333' } 
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
              color: '#333',
              fontSize: 12
            },
            formatter: (params) => {
              // 安全检查：确保 params 存在且不为空
              if (!params || !Array.isArray(params) || params.length === 0) {
                return '';
              }
              
              const date = params[0]?.axisValue || '';
              let tooltip = `<div style="padding: 8px;"><strong>${date}</strong><br/>`;
              
              let total = 0;
              params.forEach(param => {
                if (param && param.seriesName) {
                  total += param.value || 0;
                  tooltip += `
                    <div style="margin: 4px 0;">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:5px;"></span>
                      ${param.seriesName}: <span style="color:#e74c3c;font-weight:bold">${param.value || 0}次</span>
                    </div>
                  `;
                }
              });
              
              tooltip += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-weight: bold;">
                总计: <span style="color:#409eff;font-size:14px">${total}次</span>
              </div></div>`;
              
              return tooltip;
            }
          },
          legend: { 
            data: types, 
            bottom: 5, 
            type: 'scroll',
            textStyle: { fontSize: 11 },
            pageIconSize: 12,
            pageTextStyle: {
              fontSize: 11
            }
          },
          grid: { 
            left: '6%', 
            right: '6%', 
            bottom: '25%', 
            top: '12%',
            containLabel: true 
          },
          xAxis: { 
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLabel: { 
              rotate: 45, 
              fontSize: 10,
              formatter: (value) => {
                const parts = value.split('-');
                return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
              }
            }
          },
          yAxis: { 
            type: 'value',
            name: '违规次数',
            nameTextStyle: { fontSize: 11 },
            minInterval: 1,
            axisLabel: {
              margin: 10
            }
          },
          series: series
        };
        
        await nextTick();
        initChart('violationTypeTrend', option);
      } catch (error) {
        console.error('加载违规类型趋势分析失败:', error);
      }
    };

    // 6. 加载巡检员发现问题类型分布（热力图 - 时间×违规类型）
    const loadProblemTypeDistribution = async () => {
      try {
        console.log('开始获取巡检员发现问题类型分布...');
        
        // 获取违规类型趋势数据（包含日期和违规类型）
        const response = await dashboardApi.getViolationTypeTrend(30);
        
        let rawData = response?.data?.data || [];
        console.log('巡检员问题类型分布原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          console.log(`🔒 巡检员问题类型分布数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        if (rawData.length === 0) {
          console.warn('没有违规类型趋势数据（过滤后）');
          // 显示无数据提示
          const option = {
            title: {
              text: '违规类型时间分布热力图',
              subtext: '暂无数据',
              left: 'center',
              top: 'middle',
              textStyle: { fontSize: 14, color: '#999' }
            }
          };
          await nextTick();
          initChart('problemTypeDistribution', option);
          return;
        }
        
        // 获取所有唯一的日期和违规类型
        const dates = [...new Set(rawData.map(item => item.date))].sort();
        const violationTypes = [...new Set(rawData.map(item => item.violationType))];
        
        console.log('热力图数据 - 日期数:', dates.length, '违规类型数:', violationTypes.length);
        
        // 构建热力图数据 [x(时间索引), y(违规类型索引), 数量]
        const heatmapData = [];
        let maxValue = 0;
        let totalCount = 0;
        
        // 🔄 聚合数据：由于后端现在按 date + parkName + violationType 分组，需要按 date + violationType 汇总
        const dataMap = new Map();
        rawData.forEach(item => {
          const key = `${item.date}_${item.violationType}`;
          if (!dataMap.has(key)) {
            dataMap.set(key, 0);
          }
          dataMap.set(key, dataMap.get(key) + (item.count || 0));
        });
        
        // 填充热力图数据（横轴=时间，纵轴=违规类型）
        dates.forEach((date, xIndex) => {
          violationTypes.forEach((type, yIndex) => {
            const key = `${date}_${type}`;
            const value = dataMap.get(key) || 0;
            heatmapData.push([xIndex, yIndex, value]);
            if (value > maxValue) maxValue = value;
            totalCount += value;
          });
        });
        
        console.log('热力图数据点数:', heatmapData.length, '最大值:', maxValue, '总计:', totalCount);
        
        const option = {
          title: { 
            text: '违规类型时间分布热力图', 
            textStyle: { fontSize: 16, color: '#333' },
            subtext: `近30天 · 共${totalCount}次违规 · 颜色越深表示该类型在该日期的违规越多`,
            subtextStyle: { fontSize: 12 }
          },
          tooltip: {
            trigger: 'item',  // 单个单元格触发
            position: 'top',
            formatter: (params) => {
              // 安全检查：热力图的 params 可能是数组或单个对象
              if (!params) {
                return '';
              }
              
              // 如果 params 是数组，取第一个元素；否则直接使用
              const param = Array.isArray(params) ? params[0] : params;
              
              // 确保 param 和 param.value 存在
              if (!param || !param.value || !Array.isArray(param.value)) {
                return '';
              }
              
              const xLabel = dates[param.value[0]];
              const yLabel = violationTypes[param.value[1]];
              const value = param.value[2];
              
              return `
                <div style="padding: 10px; min-width: 200px;">
                  <div style="font-weight: bold; font-size: 13px; color: #409eff; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px;">
                    📅 ${xLabel}
                  </div>
                  <div style="margin: 6px 0;">
                    <span style="color: #666; font-size: 12px;">违规类型：</span>
                    <span style="color: #333; font-weight: 500;">${yLabel}</span>
                  </div>
                  <div style="margin: 6px 0;">
                    <span style="color: #666; font-size: 12px;">违规次数：</span>
                    <span style="color: #e74c3c; font-weight: bold; font-size: 16px;">${value}</span>
                    <span style="color: #e74c3c; font-weight: bold; font-size: 12px;">次</span>
                  </div>
                </div>
              `;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
              color: '#333',
              fontSize: 12
            },
            extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 6px; background-color: rgba(255, 255, 255, 0.98) !important; color: #333 !important;'
          },
          grid: {
            left: '12%',
            right: '3%',
            bottom: '18%',
            top: '20%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            splitArea: {
              show: true
            },
            axisLabel: {
              rotate: 45,
              fontSize: 10,
              interval: Math.floor(dates.length / 15), // 自动间隔显示
              color: '#666',
              formatter: (value) => {
                // 显示月-日格式
                const parts = value.split('-');
                return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
              }
            },
            axisTick: {
              show: false
            }
          },
          yAxis: {
            type: 'category',
            data: violationTypes,
            splitArea: {
              show: true
            },
            axisLabel: {
              fontSize: 11,
              color: '#666',
              width: 100,
              overflow: 'truncate',
              ellipsis: '...'
            }
          },
          visualMap: {
            min: 0,
            max: maxValue > 0 ? maxValue : 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '3%',
            itemWidth: 25,
            itemHeight: 180,
            inRange: {
              color: [
                '#f7fbff',  // 极浅蓝 - 0-1次
                '#deebf7',  // 浅蓝
                '#c6dbef',  // 中浅蓝
                '#9ecae1',  // 中蓝
                '#6baed6',  // 蓝
                '#4292c6',  // 深蓝
                '#2171b5',  // 较深蓝
                '#08519c',  // 很深蓝
                '#08306b'   // 极深蓝 - 高频
              ]
            },
            text: ['高频', '低频'],
            textStyle: {
              fontSize: 11,
              color: '#666'
            }
          },
          series: [{
            name: '违规次数',
            type: 'heatmap',
            data: heatmapData,
            label: {
              show: true,
              fontSize: 10,
              formatter: (params) => {
                const value = params.value[2];
                // 只显示大于0的数值
                return value > 0 ? value : '';
              },
              color: (params) => {
                // 根据数值动态调整文字颜色
                const value = params.value[2];
                const ratio = value / (maxValue || 1);
                return ratio > 0.5 ? '#fff' : '#333';
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                borderColor: '#333',
                borderWidth: 2
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            }
          }]
        };
        
        await nextTick();
        initChart('problemTypeDistribution', option);
      } catch (error) {
        console.error('加载巡检员问题类型分布失败:', error);
      }
    };

    // 7. 加载违规记录与提醒发送关联分析
    // 7. 加载违规记录与提醒发送关联分析（增强悬浮提示）
    const loadCorrelationAnalysis = async () => {
      try {
        console.log('开始获取违规记录与提醒发送关联分析...');
        const response = await dashboardApi.getViolationReminderCorrelation(30);
        
        let rawData = response?.data?.data || [];
        console.log('关联分析原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          console.log(`🔒 关联分析数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        // 聚合数据：由于后端现在按 date + parkName 分组，前端需要按 date 汇总
        const dateMap = new Map();
        rawData.forEach(item => {
          const date = item.date;
          if (!dateMap.has(date)) {
            dateMap.set(date, { 
              date, 
              violationCount: 0, 
              reminderCount: 0 
            });
          }
          const dateData = dateMap.get(date);
          dateData.violationCount += item.violationCount || 0;
          dateData.reminderCount += item.reminderCount || 0;
        });
        
        // 重新计算提醒率
        const data = Array.from(dateMap.values()).map(item => ({
          ...item,
          reminderRate: item.violationCount > 0 
            ? Math.round((item.reminderCount / item.violationCount) * 100 * 100) / 100 
            : 0
        })).sort((a, b) => a.date.localeCompare(b.date));
        const option = {
          title: { 
            text: '违规记录与提醒发送关联分析', 
            textStyle: { fontSize: 14, color: '#333' },
            subtext: '分析违规记录与提醒发送的关联性'
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
              color: '#333',
              fontSize: 12
            },
            formatter: (params) => {
              // 安全检查：确保 params 存在且不为空
              if (!params || !Array.isArray(params) || params.length === 0) {
                return '';
              }
              
              const date = params[0]?.axisValue || '';
              let tooltip = `<div style="padding: 10px;"><strong>📅 ${date}</strong><br/>`;
              
              // 查找对应日期的数据
              const dayData = data.find(d => d.date === date);
              const violationCount = dayData ? dayData.violationCount : 0;
              const reminderCount = dayData ? dayData.reminderCount : 0;
              const reminderRate = dayData ? dayData.reminderRate : 0;
              
              tooltip += `
                <div style="margin: 8px 0;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#f56c6c;margin-right:5px;"></span>
                  违规数量: <span style="color:#f56c6c;font-weight:bold;font-size:14px">${violationCount}次</span>
                </div>
                <div style="margin: 8px 0;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#67c23a;margin-right:5px;"></span>
                  提醒数量: <span style="color:#67c23a;font-weight:bold;font-size:14px">${reminderCount}次</span>
                </div>
                <div style="margin: 8px 0;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#409eff;margin-right:5px;"></span>
                  提醒率: <span style="color:#409eff;font-weight:bold;font-size:14px">${reminderRate}%</span>
                </div>
              `;
              
              // 添加分析说明
              const unremindedCount = violationCount - reminderCount;
              if (unremindedCount > 0) {
                tooltip += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; color: #ff9800;">
                  ⚠️ 未提醒: <strong>${unremindedCount}次</strong>
                </div>`;
              } else if (reminderCount === violationCount && violationCount > 0) {
                tooltip += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; color: #67c23a;">
                  ✅ 已全部提醒
                </div>`;
              }
              
              tooltip += `</div>`;
              return tooltip;
            }
          },
          legend: { 
            data: ['违规数量', '提醒数量', '提醒率%'], 
            bottom: 5,
            textStyle: { fontSize: 11 }
          },
          grid: { 
            left: '6%', 
            right: '18%', 
            bottom: '22%', 
            top: '15%',
            containLabel: true 
          },
          xAxis: { 
            type: 'category',
            data: data.map(item => item.date),
            boundaryGap: true, // 柱状图保持间隙
            axisLabel: { 
              rotate: 45, 
              fontSize: 10,
              formatter: (value) => {
                const parts = value.split('-');
                return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
              }
            }
          },
          yAxis: [
            { 
              type: 'value', 
              name: '数量',
              nameTextStyle: { fontSize: 11 },
              minInterval: 1,
              axisLabel: {
                margin: 10
              }
            },
            { 
              type: 'value', 
              name: '提醒率%', 
              min: 0,
              max: 100,
              nameTextStyle: { fontSize: 11 },
              splitLine: {
                show: false // 隐藏右侧Y轴的网格线，避免混乱
              },
              axisLabel: {
                margin: 10
              }
            }
          ],
          series: [
            {
              name: '违规数量',
              type: 'bar',
              data: data.map(item => item.violationCount),
              itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ff8a80' },
                  { offset: 1, color: '#f56c6c' }
                ])
              },
              barWidth: '25%'
            },
            {
              name: '提醒数量',
              type: 'bar',
              data: data.map(item => item.reminderCount),
              itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#95d475' },
                  { offset: 1, color: '#67c23a' }
                ])
              },
              barWidth: '25%'
            },
            {
              name: '提醒率%',
              type: 'line',
              yAxisIndex: 1,
              data: data.map(item => item.reminderRate),
              itemStyle: { color: '#409eff' },
              lineStyle: { width: 2 },
              symbol: 'circle',
              symbolSize: 6,
              smooth: true,
              z: 3 // 确保线条在柱状图上方
            }
          ]
        };
        
        await nextTick();
        initChart('correlationAnalysis', option);
      } catch (error) {
        console.error('加载违规记录与提醒关联分析失败:', error);
      }
    };

    // 8. 加载重复违规车辆预警（表格形式）
    const loadRepeatViolators = async () => {
      try {
        console.log('开始获取重复违规车辆预警...');
        const response = await dashboardApi.getRepeatViolationWarning(30, 3);
        
        let rawData = response?.data?.data || [];
        console.log('重复违规预警原始数据:', rawData);
        
        // 🔒 根据用户权限过滤车场数据
        if (rawData.length > 0 && rawData[0].parkName) {
          rawData = filterDataByParkAuth(rawData, 'parkName');
          console.log(`🔒 重复违规预警数据权限过滤后 - 数据条数: ${rawData.length}`);
        }
        
        // 聚合数据：由于后端现在按 plateNumber + parkName 分组，前端需要按 plateNumber 汇总
        const plateMap = new Map();
        rawData.forEach(item => {
          const plateNumber = item.plateNumber;
          if (!plateMap.has(plateNumber)) {
            plateMap.set(plateNumber, {
              plateNumber,
              totalCount: 0,
              typeCount: new Set(),
              violationTypes: new Set(),
              lastViolationTime: null,
              latestDate: null
            });
          }
          const plateData = plateMap.get(plateNumber);
          plateData.totalCount += item.totalCount || 0;
          
          // 合并违规类型
          if (item.violationTypes) {
            item.violationTypes.split(',').forEach(type => {
              plateData.violationTypes.add(type.trim());
            });
          }
          
          // 更新最后违规时间
          const currentTime = new Date(item.lastViolationTime || item.latestDate);
          if (!plateData.lastViolationTime || currentTime > new Date(plateData.lastViolationTime)) {
            plateData.lastViolationTime = item.lastViolationTime || item.latestDate;
            plateData.latestDate = item.lastViolationTime || item.latestDate;
          }
        });
        
        const data = Array.from(plateMap.values())
          .map(item => ({
            ...item,
            typeCount: item.typeCount.size,
            violationTypes: Array.from(item.violationTypes).join(', ')
          }))
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(0, 10);
        
        // 构建表格数据
        const tableData = data.slice(0, 10).map((item, index) => ({
          rank: index + 1,
          plateNumber: item.plateNumber || '未知',
          totalCount: item.totalCount || 0,
          latestDate: item.latestDate || '-'
        }));
        
        // 使用柱状图展示，添加预警等级颜色
        const option = {
          title: { 
            text: '重复违规车辆预警 Top10', 
            textStyle: { fontSize: 14, color: '#333' },
            subtext: '近30天内违规≥3次的车辆'
          },
          tooltip: { 
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
              const item = params[0];
              const count = item.value;
              let level = '低';
              let color = '#67c23a';
              if (count >= 10) {
                level = '高危';
                color = '#ff4d4f';
              } else if (count >= 6) {
                level = '中危';
                color = '#ff9800';
              } else if (count >= 3) {
                level = '警告';
                color = '#faad14';
              }
              return `${item.name}<br/>违规次数: ${count}次<br/>预警等级: <span style="color:${color}">●</span> ${level}`;
            }
          },
          grid: { left: '10%', right: '10%', bottom: '20%', top: '20%' },
          xAxis: { 
            type: 'category',
            data: tableData.map(item => item.plateNumber),
            axisLabel: { 
              rotate: 45,
              fontSize: 10,
              interval: 0
            }
          },
          yAxis: { 
            type: 'value',
            name: '违规次数'
          },
          series: [{
            name: '违规次数',
            type: 'bar',
            data: tableData.map(item => {
              const count = item.totalCount;
              let color = '#67c23a'; // 低风险 绿色
              if (count >= 10) {
                color = '#ff4d4f'; // 高危 红色
              } else if (count >= 6) {
                color = '#ff9800'; // 中危 橙色
              } else if (count >= 3) {
                color = '#faad14'; // 警告 黄色
              }
              return {
                value: count,
                itemStyle: { 
                  color: color,
                  barBorderRadius: [4, 4, 0, 0]
                }
              };
            }),
            label: { 
              show: true, 
              position: 'top',
              fontSize: 10,
              formatter: '{c}次'
            }
          }]
        };
        
        await nextTick();
        initChart('repeatViolators', option);
      } catch (error) {
        console.error('加载重复违规车辆预警失败:', error);
      }
    };

    // 判断车牌类型（参考AppointAudit.vue的实现）
    const getPlateType = (plateNumber) => {
      if (!plateNumber) return 'traditional';

      const plate = plateNumber.trim().toUpperCase();

      // 新能源车牌特征：
      // 1. 8位车牌（新能源专用号牌）
      // 2. 包含字母D或F的新能源号牌
      // 3. 绿色车牌模式（通常8位，第2位或最后一位是字母）
      if (plate.length === 8) {
        // 8位车牌通常是新能源
        return 'new-energy';
      } else if (plate.length === 7) {
        return 'traditional';
      }

      return 'traditional';
    };
    // 格式化车牌号显示（带样式标识）
    const formatPlateNumber = (plateNumber) => {
      const plateTypeClass = getPlateType(plateNumber);
      const isNewEnergy = plateTypeClass === 'new-energy';
      const plateType = isNewEnergy ? '新能源' : '燃油车';
      const typeColor = isNewEnergy ? '#52c41a' : '#1890ff';

      return {
        plateNumber,
        isNewEnergy,
        plateType,
        typeColor,
        plateTypeClass,
        displayText: plateNumber
      };
    };

    // 加载重复放行车辆Top20
    const loadRepeatReleaseStats = async () => {
      try {
        console.log('开始获取重复放行车辆Top20数据...');
        const response = await dashboardApi.getRepeatReleaseVehicleStats(30);

        let data = [];
        if (response && response.data.code === "0" && response.data.data) {
          data = response.data.data.map(item => ({
            ...formatPlateNumber(item.plateNumber),
            count: item.releaseCount
          }));
          console.log('重复放行车辆Top20数据加载成功:', data);
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }

        const option = {
          title: { text: '重复放行车辆Top20', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params) {
              const item = params[0];
              const dataIndex = item.dataIndex;
              const plateInfo = data[data.length - 1 - dataIndex]; // 因为数据是反转的
              const typeIcon = plateInfo.isNewEnergy ? '🔋' : '⛽';

              // 使用与AppointAudit.vue相同的车牌样式配色
              const plateBgColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';
              const plateTextColor = plateInfo.plateTypeClass === 'new-energy' ? '#000000' : '#FFFFFF';
              const plateBorderColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';

              return `
                <div style="padding: 12px;">
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background: ${plateInfo.typeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-right: 8px;">
                      ${typeIcon} ${plateInfo.plateType}
                    </span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="
                      display: inline-block; 
                      background: ${plateBgColor}; 
                      color: ${plateTextColor}; 
                      border: 1px solid ${plateBorderColor};
                      padding: 6px 10px; 
                      border-radius: 6px; 
                      font-size: 15px; 
                      font-weight: bold; 
                      font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
                      letter-spacing: 0.8px;
                      min-width: 85px;
                      text-align: center;
                    ">
                      ${plateInfo.plateNumber}
                    </span>
                  </div>
                  <div>放行次数: <span style="color: #ff6b6b; font-weight: bold;">${item.value}</span></div>
                </div>
              `;
            }
          },
          grid: { left: '25%', right: '8%', bottom: '8%', top: '12%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: data.map(item => item.plateNumber).reverse(),
            axisLabel: {
              fontSize: 12,
              margin: 15,
              interval: 0,
              formatter: function (value) {
                const plateInfo = data.find(item => item.plateNumber === value);
                if (!plateInfo) return value;

                // 使用与AppointAudit.vue相同的车牌样式
                if (plateInfo.plateTypeClass === 'new-energy') {
                  return `{newEnergyPlate|${value}}`;
                } else {
                  return `{traditionalPlate|${value}}`;
                }
              },
              rich: {
                // 新能源车牌样式 - 参考AppointAudit.vue的绿色渐变
                newEnergyPlate: {
                  backgroundColor: '#6AD390',
                  color: '#000000',
                  borderColor: '#6AD390',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                },
                // 传统燃油车牌样式 - 参考AppointAudit.vue的蓝色渐变
                traditionalPlate: {
                  backgroundColor: '#0C4FC5',
                  color: '#FFFFFF',
                  borderColor: '#0C4FC5',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                }
              }
            },
            axisTick: {
              alignWithLabel: true,
              length: 6
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#f5f5f5',
                width: 1,
                type: 'solid'
              }
            }
          },
          series: [{
            name: '放行次数',
            type: 'bar',
            data: data.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  item.plateTypeClass === 'new-energy' ? [
                    { offset: 0, color: '#6AD390' },
                    { offset: 1, color: '#D0F1E4' }
                  ] : [
                    { offset: 0, color: '#0C4FC5' },
                    { offset: 1, color: '#216FEF' }
                  ]
                )
              }
            })).reverse(),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}次',
              fontSize: 11
            }
          }]
        };

        await nextTick();
        initChart('repeatRelease', option);
      } catch (error) {
        console.error('加载重复放行统计失败:', error);
        ElMessage.warning(`获取重复放行统计失败: ${error.message || '网络错误'}，显示模拟数据`);

        // 降级到模拟数据（包含新能源和燃油车混合）
        const mockPlates = [];

        const mockData = mockPlates.map((plate, index) => ({
          ...formatPlateNumber(plate),
          count: 38 - index * 1.5 // 调整计数算法以适应更多数据
        }));

        const option = {
          title: { text: '重复放行车辆Top20', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params) {
              const item = params[0];
              const dataIndex = item.dataIndex;
              const plateInfo = mockData[mockData.length - 1 - dataIndex]; // 因为数据是反转的
              const typeIcon = plateInfo.isNewEnergy ? '🔋' : '⛽';

              // 使用与AppointAudit.vue相同的车牌样式配色
              const plateBgColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';
              const plateTextColor = plateInfo.plateTypeClass === 'new-energy' ? '#000000' : '#FFFFFF';
              const plateBorderColor = plateInfo.plateTypeClass === 'new-energy' ? '#6AD390' : '#0C4FC5';

              return `
                <div style="padding: 12px;">
                  <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; background: ${plateInfo.typeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-right: 8px;">
                      ${typeIcon} ${plateInfo.plateType}
                    </span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="
                      display: inline-block; 
                      background: ${plateBgColor}; 
                      color: ${plateTextColor}; 
                      border: 1px solid ${plateBorderColor};
                      padding: 6px 10px; 
                      border-radius: 6px; 
                      font-size: 15px; 
                      font-weight: bold; 
                      font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
                      letter-spacing: 0.8px;
                      min-width: 85px;
                      text-align: center;
                    ">
                      ${plateInfo.plateNumber}
                    </span>
                  </div>
                  <div>放行次数: <span style="color: #ff6b6b; font-weight: bold;">${item.value}</span></div>
                </div>
              `;
            }
          },
          grid: { left: '25%', right: '8%', bottom: '8%', top: '12%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: mockData.map(item => item.plateNumber).reverse(),
            axisLabel: {
              fontSize: 12,
              margin: 15,
              interval: 0,
              formatter: function (value) {
                const plateInfo = mockData.find(item => item.plateNumber === value);
                if (!plateInfo) return value;

                // 使用与AppointAudit.vue相同的车牌样式
                if (plateInfo.plateTypeClass === 'new-energy') {
                  return `{newEnergyPlate|${value}}`;
                } else {
                  return `{traditionalPlate|${value}}`;
                }
              },
              rich: {
                // 新能源车牌样式 - 参考AppointAudit.vue的绿色渐变
                newEnergyPlate: {
                  backgroundColor: '#6AD390',
                  color: '#000000',
                  borderColor: '#6AD390',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                },
                // 传统燃油车牌样式 - 参考AppointAudit.vue的蓝色渐变
                traditionalPlate: {
                  backgroundColor: '#0C4FC5',
                  color: '#FFFFFF',
                  borderColor: '#0C4FC5',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [4, 8],
                  fontSize: 12,
                  fontWeight: 'bold',
                  fontFamily: '微软雅黑',
                  letterSpacing: 0.6,
                  minWidth: 70,
                  align: 'center'
                }
              }
            },
            axisTick: {
              alignWithLabel: true,
              length: 6
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#f5f5f5',
                width: 1,
                type: 'solid'
              }
            }
          },
          series: [{
            name: '放行次数',
            type: 'bar',
            data: mockData.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  item.plateTypeClass === 'new-energy' ? [
                    { offset: 0, color: '#6AD390' },
                    { offset: 1, color: '#D0F1E4' }
                  ] : [
                    { offset: 0, color: '#0C4FC5' },
                    { offset: 1, color: '#216FEF' }
                  ]
                )
              }
            })).reverse(),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}次',
              fontSize: 11
            }
          }]
        };

        await nextTick();
        initChart('repeatRelease', option);
      }
    };
    // 加载预约转化率统计
    const loadAppointmentConversionStats = async () => {
      try {
        console.log('开始获取预约转化率统计数据...');
        const response = await dashboardApi.getAppointmentConversionStats(30);

        let dates = [];
        let conversionRates = [];
        if (response && response.data.code === "0" && response.data.data) {
          const rawData = Array.isArray(response.data.data) ? response.data.data : [];
          console.log('API返回的原始数据:', rawData);

          // 尝试不同的字段名映射
          dates = rawData.map(item => {
            return item.date || item.appointmentDate || item.statisticDate || '未知日期';
          }).filter(date => date !== '未知日期');

          conversionRates = rawData.map(item => {
            const rate = item.conversionRate || item.conversion_rate || item.rate || 0;
            return typeof rate === 'number' ? rate : parseFloat(rate) || 0;
          });

          console.log('预约转化率统计数据加载成功:', { dates, conversionRates });

          // 验证数据有效性
          if (dates.length === 0 || conversionRates.length === 0) {
            throw new Error('返回的数据为空');
          }
        } else {
          throw new Error(`API返回格式错误: code=${response?.data?.code}`);
        }

        const option = {
          title: { text: '预约转化率统计', textStyle: { fontSize: 14, color: '#333' } },
          tooltip: { trigger: 'axis', formatter: '{b}<br/>{a}: {c}%' },
          grid: { left: '8%', right: '8%', bottom: dates.length > 15 ? '25%' : '15%', top: '15%', containLabel: true },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
              interval: dates.length > 15 ? Math.ceil(dates.length / 8) : 0, // 当数据点过多时，自动调整显示间隔
              rotate: dates.length > 15 ? 45 : 0, // 数据点多时倾斜显示
              fontSize: 11,
              margin: 10
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { formatter: '{value}%' }
          },
          series: [{
            name: '转化率',
            type: 'line',
            smooth: true,
            data: conversionRates,
            itemStyle: { color: '#42a5f5' },
            areaStyle: { color: 'rgba(66, 165, 245, 0.1)' },
            lineStyle: { width: 3 },
            symbolSize: 6
          }],
          // 添加数据缩放功能，方便用户查看详细数据
          dataZoom: dates.length > 15 ? [
            {
              type: 'slider',
              show: true,
              xAxisIndex: 0,
              start: 0,
              end: 100,
              bottom: 5,
              height: 20
            }
          ] : []
        };

        await nextTick();
        initChart('appointmentConversion', option);
      } catch (error) {
        console.error('加载预约转化率统计失败:', error);
        ElMessage.error(`获取预约转化率统计失败: ${error.message || '网络错误'}`);
      }
    };
    // 监听Tab切换，初始化对应图表
    watch(activeTab, async (newTab) => {
      await nextTick();

      switch (newTab) {
        case 'overview':
          // 管理员加载原有的数据概览图表
          if (userRoleName.value === 'admin') {
            loadParkAppointmentStats();
            loadParkEntryStats();
            loadAppointmentConversionStats();
            loadRepeatReleaseStats();
          }
          // 所有角色加载违规统计图表
          loadTopViolators();
          loadViolationTrend();
          loadStaffStatus();
          loadLocationFrequency();
          break;
        case 'business':
          // 根据角色显示不同的图表
          if (showViolationCharts.value) {
            // 巡检管理员：加载违规统计图表
            console.log('📊 [业务分析] 加载违规统计图表（巡检管理员）');
            loadViolationTypeTrend();
            loadProblemTypeDistribution();
            loadCorrelationAnalysis();
            loadRepeatViolators();
          } else {
            // 其他角色：加载基础统计图表
            console.log('📊 [业务分析] 加载基础统计图表');
          loadButlerCommunityStats();
          loadBlacklistViolationStats();
          loadMonthTicketNameStats();
          }
          break;
      }

      // Tab切换后，延迟重新初始化所有tooltip确保正常工作
      setTimeout(() => {
        reinitializeTooltips();
      }, 3000);
    });

    onMounted(async () => {
      updateTime();
      timeInterval = setInterval(updateTime, 60000); // 每分钟更新一次
      
      // 🆕 首先判断角色类型
      await determineRoleType();
      
      fetchActivities(); // 获取活动数据
      loadRealtimeData(); // 获取实时数据

      // 初始化默认Tab的图表（数据概览）
      nextTick(() => {
        // 管理员加载原有的数据概览图表
        if (userRoleName.value === 'admin') {
          loadParkAppointmentStats();
          loadParkEntryStats();
          loadAppointmentConversionStats();
          loadRepeatReleaseStats();
        }
        // 所有角色加载违规统计图表
        loadTopViolators();
        loadViolationTrend();
        loadStaffStatus();
        loadLocationFrequency();
      });
    });

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }

      // 销毁所有图表实例
      Object.values(chartInstances.value).forEach(chart => {
        if (chart && chart.dispose) {
          chart.dispose();
        }
      });
    });

    // 定义所有快捷操作项（只对管家和普通用户显示）
    const allQuickActions = [
      {
        id: 'vehicleReservation',
        path: '/admin/vehicleReservation',
        icon: 'reservations',
        iconComponent: Calendar,
        title: '车辆预约',
        description: '处理外来车辆预约申请',
        roles: ['housekeeper', 'user'] // 管家和普通用户可见
      },
      {
        id: 'blackList',
        path: '/admin/blackList',
        icon: 'violations',
        iconComponent: WarningFilled,
        title: '黑名单管理',
        description: '管理违规车辆黑名单',
        roles: ['housekeeper', 'user'] // 管家和普通用户可见
      },
      {
        id: 'vehicleRelease',
        path: '/admin/vehicleReservation',
        icon: 'release',
        iconComponent: WarningFilled,
        title: '外来车辆放行记录',
        description: '查看和管理车辆放行记录',
        roles: ['housekeeper', 'user'] // 管家和普通用户可见
      }
    ];
    
    // 根据用户角色过滤快捷操作项（使用响应式的 userRoleName）
    const availableQuickActions = computed(() => {
      console.log('🔍 [快捷操作] 当前角色类型:', userRoleName.value);
      console.log('🔍 [快捷操作] 完整角色名称:', fullRoleName.value);
    
      // 如果角色类型还未确定，返回空数组
      if (!userRoleName.value) {
        console.log('⏳ [快捷操作] 角色类型未确定，返回空数组');
        return [];
      }
      
      // 管理员角色不显示快捷操作
      if (userRoleName.value === 'admin') {
        console.log('🚫 [快捷操作] 管理员角色，不显示快捷操作');
        return [];
      }
      
      // 巡检员角色不显示快捷操作
      if (fullRoleName.value && fullRoleName.value.includes('巡检员')) {
        console.log('🚫 [快捷操作] 巡检员角色，不显示快捷操作');
        return [];
      }
      
      // 管家和普通用户显示对应的快捷操作
      const actions = allQuickActions.filter(action => action.roles.includes(userRoleName.value));
      console.log('✅ [快捷操作] 可用操作数量:', actions.length, '角色:', userRoleName.value);
      return actions;
    });
    
    // 🆕 判断是否显示违规统计图表（巡检管理员、管理员、巡检员角色）
    const showViolationCharts = computed(() => {
      // 检查是否包含巡检管理员、管理员或巡检员角色
      const show = fullRoleName.value.includes('巡检管理员') || 
                   fullRoleName.value.includes('管理员') || 
                   fullRoleName.value.includes('巡检员');
      console.log('📊 [图表显示] 是否显示违规统计图表:', show);
      console.log('📊 [图表显示] 完整角色名称:', fullRoleName.value);
      return show;
    });

    return {
      username,
      userRole,
      userRoleName,
      fullRoleName,
      currentTime,
      recentActivities,
      activitiesLoading,
      goToPage,
      refreshActivities,
      getActivityIcon,
      getActivityIconClass,
      formatTimeAgo,
      // 图表相关
      activeTab,
      chartsLoading,
      realtimeData,
      trafficTrendDays,
      chartTabs,
      refreshCharts,
      isDevelopment,
      // 统计模块相关
      appointmentStatsDays,
      entryStatsDays,
      loadParkAppointmentStats,
      loadParkEntryStats,
      loadAppointmentConversionStats,
      loadRepeatReleaseStats,
      // 业务分析模块
      loadMonthTicketNameStats,
      loadBlacklistViolationStats,
      loadButlerCommunityStats,
      // Tooltip工具函数
      reinitializeTooltips,
      availableQuickActions,
      // 角色判断
      determineRoleType,
      showViolationCharts
    };
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

// 欢迎横幅
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .welcome-info {
    flex: 1;

    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .username {
        color: #ffd700;
      }
    }

    .welcome-desc {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .current-time {
      font-size: 14px;
      opacity: 0.8;
      font-weight: 500;
    }
  }

  .welcome-illustration {
    .illustration-circle {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
  }
}

// 通用标题
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
}

// 统计卡片
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  min-height: 100px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    flex-shrink: 0;
  }

  &.parking .stat-icon {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  }

  &.owners .stat-icon {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  &.reservations .stat-icon {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  &.violations .stat-icon {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  &.revenue .stat-icon {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  &.equipment .stat-icon {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  &.blacklist .stat-icon {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  &.activity .stat-icon {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  .stat-info {
    flex: 1;

    h3 {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
      margin-bottom: 6px;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;

      &.positive {
        color: #10b981;
      }

      &.negative {
        color: #ef4444;
      }

      &.neutral {
        color: #6b7280;
      }

      &.warning {
        color: #f59e0b;
      }
    }
  }
}

// 快捷操作
.quick-actions-section {
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    max-width: 1400px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 80px;
  max-height: 90px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;

    &.owners {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    &.reservations {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    &.tickets {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    &.violations {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    &.community {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
    }

    &.butler {
      background: linear-gradient(135deg, #84cc16, #65a30d);
    }

    &.patrol {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
    }

    &.release {
      background: linear-gradient(135deg, #f97316, #ea580c);
    }

    &.staff {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
    }

    &.dashboard {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }
  }

  .action-info {
    flex: 1;

    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
      line-height: 1.3;
    }

    p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }
  }

  .action-arrow {
    color: #9ca3af;
    transition: all 0.3s ease;
  }

  &:hover .action-arrow {
    color: #667eea;
    transform: translateX(4px);
  }
}

// 最近活动
.recent-activities {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }
}

.activity-list {
  .empty-activities {
    padding: 40px 20px;
    text-align: center;
    background: #fafafa;
    border-radius: 12px;
    border: 2px dashed #e5e7eb;
  }
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
    flex-shrink: 0;

    &.success {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    &.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    &.info {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    &.neutral {
      background: linear-gradient(135deg, #6b7280, #4b5563);
    }
  }

  .activity-content {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .activity-time {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

// 数据可视化图表区域
.charts-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .dashboard-tabs {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
    padding-left: 10px;

    .tabs-wrapper {
      display: flex;
      gap: 20px;
    }

    .tab-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #ebeef5;
      border-bottom: none;
      background-color: #f9fafc;
      color: #606266;
      font-weight: 500;

      &:hover {
        background-color: #ebeef5;
        color: #409eff;
      }

      &.active {
        background-color: white;
        color: #409eff;
        border-color: #409eff;
        border-bottom: 1px solid white;
        box-shadow: 0 -2px 0 0 #409eff;
      }
    }
  }

  .tab-content {
    padding-top: 20px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%; // 确保占据全宽

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  // 数据概览布局 - 2x2网格布局
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px 40px; // 增加列间距，减少行间距
    max-width: 1200px;
    margin: 0;
    margin-left: 60px; // 整体往左移动（从140px减少到100px）
    justify-content: start; // 左对齐网格内容
    width: calc(100% - 40px); // 减去左边距，确保不超出

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      margin-left: 20px; // 移动端适当减少左边距
      width: calc(100% - 20px);
      gap: 20px;
    }

    .chart-container {
      width: 100%;

      // 左侧列的图表容器调整
      &:nth-child(odd) {
        padding-left: 10px; // 左侧图表减少左内边距
      }

      // 右侧列的图表容器调整  
      &:nth-child(even) {
        padding-right: 10px; // 右侧图表减少右内边距
      }

      .chart-content {
        width: 100%;
        height: 380px; // 增加高度以容纳数据缩放滑块
      }
    }

    // 当选择30天数据时的特殊布局
    &.appointment-30days,
    &.entry-30days {
      grid-template-columns: 1fr; // 改为单列布局
      gap: 25px;
      max-width: none !important; // 移除最大宽度限制
      width: 100% !important; // 明确设置宽度为100%

      .chart-container {
        width: 100% !important;
        max-width: 100% !important; // 强制占据全宽
        padding-left: 0;
        padding-right: 0;
        margin: 0; // 移除可能的边距

        // 选择30天的图表占据整行，高度更大，宽度拉伸
        &.full-width-chart {
          width: 100% !important;
          min-width: 100% !important; // 确保最小宽度也是100%

          .chart-content {
            height: 420px; // 30天数据时给予更大高度
            width: 100% !important; // 确保图表内容区域也占据全宽
            min-width: 100% !important;
          }
        }

        // 其他图表使用标准高度但也要全宽
        &:not(.full-width-chart) {
          width: 100% !important;

          .chart-content {
            height: 350px;
            width: 100% !important;
          }
        }
      }

      // 移动端保持单列，但调整间距
      @media (max-width: 768px) {
        gap: 20px;

        .chart-container {
          &.full-width-chart .chart-content {
            height: 380px; // 移动端稍微降低高度
            width: 100% !important;
          }

          &:not(.full-width-chart) .chart-content {
            height: 320px;
            width: 100% !important;
          }
        }
      }
    }
  }

  // 业务分析布局 - 2个图表一行，第3个占满整行
  .business-grid {
    display: grid;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;

    @media (min-width: 769px) {
      grid-template-columns: repeat(2, 1fr);

      .full-width {
        grid-column: 1 / -1;
        width: 100%;
        margin: 20px 0 0 0;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;

      .full-width {
        margin-top: 0;
        width: 100%;
      }
    }
  }





  .chart-container {
    background: #f9fafc;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    min-height: 400px;

    // 重复放行图表容器需要更大最小高度
    &:has([data-chart="repeatRelease"]) {
      min-height: 680px;
    }

    // 热力图容器需要更大最小高度
    &:has([data-chart="problemTypeDistribution"]) {
      min-height: 630px;
    }

    // 违规类型趋势分析容器需要更大最小高度
    &:has([data-chart="violationTypeTrend"]) {
      min-height: 530px;
    }

    // 违规记录与提醒发送关联分析容器需要更大最小高度
    &:has([data-chart="correlationAnalysis"]) {
      min-height: 530px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .chart-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;

        .el-icon {
          font-size: 20px;
          color: #409eff;
        }
      }

      .chart-controls {
        .el-radio-group {
          .el-radio-button__inner {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      }
    }

    .chart-content {
      width: 100%;
      height: 320px;
      min-height: 320px;
      position: relative;
      z-index: 1;

      // 确保ECharts tooltip能正常显示
      .echarts-tooltip {
        z-index: 9999 !important;
        pointer-events: none;
      }

      // 重复放行图表需要更大高度以显示Top20数据
      &[data-chart="repeatRelease"] {
        height: 600px;
        min-height: 600px;
      }

      // 热力图需要更大高度以完整显示数据
      &[data-chart="problemTypeDistribution"] {
        height: 550px;
        min-height: 550px;
      }

      // 违规类型趋势分析需要更大高度避免曲线被遮挡
      &[data-chart="violationTypeTrend"] {
        height: 450px;
        min-height: 450px;
      }

      // 违规记录与提醒发送关联分析需要更大高度
      &[data-chart="correlationAnalysis"] {
        height: 450px;
        min-height: 450px;
      }
    }

    &.full-width {
      grid-column: 1 / -1;

      .chart-content {
        height: 1000px;
      }
    }
  }

  .activity-tab-content {
    .activity-list {
      .empty-activities {
        padding: 40px 20px;
        text-align: center;
        background: #fafafa;
        border-radius: 12px;
        border: 2px dashed #e5e7eb;
      }
    }

    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
        flex-shrink: 0;

        &.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        &.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        &.info {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        &.neutral {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }
      }

      .activity-content {
        flex: 1;

        h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        p {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .activity-time {
          font-size: 12px;
          color: #9ca3af;
        }
      }
    }
  }
}

// 全局ECharts tooltip样式确保
:global(.echarts-tooltip) {
  z-index: 9999 !important;
  pointer-events: none !important;
  position: absolute !important;
}

:global(.echarts-tooltip-content) {
  background: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  border-radius: 6px !important;
  padding: 8px 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-banner {
    padding: 24px;

    .banner-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }

    .welcome-title {
      font-size: 24px;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .charts-section {

    .charts-grid,
    .overview-grid,
    .business-grid {
      max-width: 100%;
      margin: 0;
    }

    .chart-container {
      min-height: 350px;

      .chart-content {
        height: 280px;

        // 重复放行图表在移动端也需要更大高度
        &[data-chart="repeatRelease"] {
          height: 500px;
          min-height: 500px;
        }
      }

      &.full-width .chart-content {
        height: 550px;
      }
    }
  }

  .stat-card,
  .action-card {
    padding: 12px 16px;
    min-height: 70px;
    max-height: 80px;

    .action-icon {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    .action-info {
      h3 {
        font-size: 14px;
        margin-bottom: 1px;
      }

      p {
        font-size: 12px;
      }
    }
  }

  .stat-card {
    min-height: 80px;

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .stat-info {
      .stat-number {
        font-size: 20px;
      }

      h3 {
        font-size: 13px;
      }
    }
  }
}
</style>