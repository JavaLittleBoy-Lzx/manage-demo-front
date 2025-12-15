<template>
  <div class="header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="collapseChange">
        <el-icon class="collapse-icon">
          <component :is="collapse ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>

      <!-- 系统标题 -->
      <div class="system-brand">
        <div class="brand-logo">
          <img src="../assets/log00.png" alt="雪人停车" />
        </div>
        <div class="brand-info">
          <h1 class="brand-title">雪人停车</h1>
          <span class="brand-subtitle">管理系统</span>
        </div>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 智能搜索框 -->
      <div class="search-box">
        <el-autocomplete 
          v-model="searchKeyword" 
          :fetch-suggestions="querySearchAsync" 
          placeholder="搜索车牌号、业主姓名..."
          prefix-icon="Search" 
          class="search-input" 
          :trigger-on-focus="false" 
          @select="handleSearchSelect"
          @keyup.enter="handleSearch" 
          clearable
          :debounce="300"
          placement="bottom-start"
          popper-class="search-suggestion-popper"
          :teleported="true"
          fit-input-width>
          <template #default="{ item }">
            <div class="search-suggestion-item">
              <el-icon class="suggestion-icon">
                <component :is="item.icon" />
              </el-icon>
              <div class="suggestion-content">
                <span class="suggestion-title">{{ item.title }}</span>
                <span class="suggestion-type">{{ item.type }}</span>
              </div>
            </div>
          </template>
        </el-autocomplete>
      </div>

      <!-- 通知铃铛 -->
      <div class="notification-container">
        <el-popover placement="bottom" :width="480" trigger="click" v-model:visible="notificationVisible">
          <template #reference>
            <div class="notification-bell" @click="handleNotificationClick">
              <el-badge :value="notificationCount" :hidden="notificationCount === 0" :max="99">
                <el-icon class="bell-icon">
                  <Bell />
                </el-icon>
              </el-badge>
            </div>
          </template>

          <!-- 通知面板 -->
          <div class="notification-panel">
            <div class="notification-header">
              <span class="notification-title">
                <el-icon style="vertical-align: middle; margin-right: 6px;">
                  <Document />
                </el-icon>
                操作日志通知
              </span>
              <div class="header-actions">
                <el-button link @click="refreshNotifications" size="small">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                  刷新
                </el-button>
                <el-button link @click="markAllAsRead" v-if="notifications.length > 0" size="small">
                  全部已读
                </el-button>
                <el-button link @click="clearAllNotifications" v-if="notifications.length > 0" size="small">
                  清空全部
                </el-button>
              </div>
            </div>

            <div class="notification-content" v-if="notifications.length > 0">
              <el-tooltip
                v-for="notification in notifications"
                :key="notification.id"
                :content="getFullNotificationContent(notification)"
                placement="left"
                :show-after="500"
                effect="dark"
                popper-class="notification-tooltip"
              >
                <div class="notification-item"
                  :class="{ 'unread': !notification.read }" 
                  @click="markAsRead(notification)">
                  <div class="notification-icon" :class="notification.type">
                    <el-icon>
                      <component :is="notification.icon" />
                    </el-icon>
                  </div>
                  <div class="notification-info">
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">{{ formatTime(notification.time) }}</span>
                  </div>
                  <div class="notification-actions">
                    <el-button link @click.stop="removeNotification(notification.id)" size="small">
                      <el-icon>
                        <Close />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </el-tooltip>
            </div>

            <div class="notification-empty" v-else>
              <el-icon class="empty-icon">
                <Bell />
              </el-icon>
              <p>暂无新操作日志</p>
            </div>
            
            <div class="notification-footer">
              <el-button link size="small" @click="viewAllLogs">
                查看全部日志
                <el-icon style="margin-left: 4px;">
                  <ArrowRight />
                </el-icon>
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- 全屏切换 -->
      <div class="fullscreen-btn" @click="toggleFullscreen">
        <el-icon class="fullscreen-icon">
          <component :is="isFullscreen ? 'Aim' : 'FullScreen'" />
        </el-icon>
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <!-- 用户头像 -->
        <div class="user-avatar">
          <el-avatar :size="36" :src="userAvatar" class="avatar-image">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="online-status"></div>
        </div>

        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-dropdown" trigger="click" @command="handleCommand">
          <div class="user-details">
            <div class="user-text-info">
              <span class="username">{{ username }}</span>
              <span class="user-role">{{ userRole }}</span>
              <span class="user-parks" v-if="managedParksDisplay" :title="managedParksFull">
                <el-icon class="parks-icon"><OfficeBuilding /></el-icon>
                {{ managedParksDisplay }}
              </span>
            </div>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-menu">
              <el-dropdown-item command="profile">
                <el-icon>
                  <User />
                </el-icon>
                <span>个人中心</span>
              </el-dropdown-item>
              <!-- 系统设置：只有管理员可见 -->
              <el-dropdown-item command="settings" v-if="isAdmin">
                <el-icon>
                  <Setting />
                </el-icon>
                <span>系统设置</span>
              </el-dropdown-item>
              <!-- 帮助文档：所有角色可见，根据菜单权限显示对应内容 -->
              <el-dropdown-item command="help">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
                <span>帮助文档</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import {
  Fold, Expand, Search, Bell, FullScreen, Aim, ArrowDown,
  User, Setting, SwitchButton, QuestionFilled, Close,
  CreditCard, OfficeBuilding, Calendar, WarningFilled, InfoFilled, Refresh,
  Document, ArrowRight
} from '@element-plus/icons-vue';
import { activityApi } from '../api/activity';
import { ownerApi } from '../api/owner';
import { violationApi } from '../api/violation';
import { userApi } from '../api/user';
import request from '../utils/request';

export default {
  name: 'Header',
  components: {
    Fold, Expand, Search, Bell, FullScreen, Aim, ArrowDown,
    User, Setting, SwitchButton, QuestionFilled, Close,
    CreditCard, OfficeBuilding, Calendar, WarningFilled, InfoFilled, Refresh,
    Document, ArrowRight
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const username = localStorage.getItem("ms_username") || "管理员";
    const userRole = ref('系统管理员'); // 用户角色名称
    const currentUserId = ref(null); // 当前用户ID
    const userRoleId = ref(localStorage.getItem("ms_role")); // 用户角色ID
    const userRoleName = ref(localStorage.getItem("ms_role_name") || ''); // 用户角色名称
    const userMenus = ref([]); // 用户的菜单权限
    
    // 🔐 用户管理的车场信息
    const managedParks = ref([]);
    
    // 加载用户管理的车场
    const loadManagedParks = () => {
      try {
        const parksJson = localStorage.getItem('managed_parks');
        if (parksJson) {
          const parks = JSON.parse(parksJson);
          managedParks.value = Array.isArray(parks) ? parks : [];
          console.log('✅ [Header] 加载管理车场:', managedParks.value);
        } else {
          managedParks.value = [];
        }
      } catch (error) {
        console.error('❌ [Header] 解析管理车场失败:', error);
        managedParks.value = [];
      }
    };
    
    // 管理车场显示文本（简短版本，用于显示在用户名下方）
    const managedParksDisplay = computed(() => {
      if (managedParks.value.length === 0) {
        return ''; // 不显示（表示全部车场）
      }
      if (managedParks.value.length === 1) {
        return managedParks.value[0];
      }
      if (managedParks.value.length === 2) {
        return managedParks.value.join('、');
      }
      // 超过2个车场，只显示前两个 + 数量
      return `${managedParks.value.slice(0, 2).join('、')} 等${managedParks.value.length}个车场`;
    });
    
    // 管理车场完整文本（用于 tooltip）
    const managedParksFull = computed(() => {
      if (managedParks.value.length === 0) {
        return '可管理全部车场';
      }
      return `管理车场：${managedParks.value.join('、')}`;
    });
    
    // 🔐 判断是否是管理员（精确匹配角色名称，避免误判）
    const isAdmin = computed(() => {
      const roleName = userRoleName.value || userRole.value;
      // 必须完全匹配以下角色名称之一，不能只是包含
      const adminRoles = ['管理员', '系统管理员', 'admin', 'administrator', 'Admin', 'Administrator', 'ADMIN', 'ADMINISTRATOR'];
      return adminRoles.includes(roleName);
    });
    
    // 🖼️ 用户头像（从localStorage获取，确保是完整URL）
    const getFullAvatarUrl = (avatarPath) => {
      if (!avatarPath) return '';
      if (avatarPath.startsWith('http')) return avatarPath;
      return `https://www.xuerparking.cn:8543${avatarPath}`;
    };
    const userAvatar = ref(getFullAvatarUrl(localStorage.getItem("ms_avatar")));
    
    // 🔄 刷新头像的方法
    const refreshAvatar = () => {
      const newAvatar = localStorage.getItem("ms_avatar");
      userAvatar.value = getFullAvatarUrl(newAvatar);
      console.log('🖼️ [Header] 头像已刷新:', userAvatar.value);
    };
    
    const searchKeyword = ref('');
    const notificationCount = ref(0);
    const isFullscreen = ref(false);
    const notificationVisible = ref(false);
    const refreshTimer = ref(null);

    // 通知数据
    const notifications = ref([]);

    const collapse = computed(() => store.state.collapse);

    // 从 localStorage 读取已查看的通知ID列表
    const getViewedNotificationIds = () => {
      try {
        const viewed = localStorage.getItem('viewedNotificationIds');
        return viewed ? JSON.parse(viewed) : [];
      } catch (error) {
        console.error('Header: 读取已查看通知ID失败:', error);
        return [];
      }
    };

    // 保存已查看的通知ID列表到 localStorage
    const saveViewedNotificationIds = (ids) => {
      try {
        localStorage.setItem('viewedNotificationIds', JSON.stringify(ids));
      } catch (error) {
        console.error('Header: 保存已查看通知ID失败:', error);
      }
    };

    // 标记通知为已查看
    const markNotificationsAsViewed = (notificationIds) => {
      const viewedIds = getViewedNotificationIds();
      const newViewedIds = [...new Set([...viewedIds, ...notificationIds])];
      // 只保留最近1000个已查看的ID，避免localStorage过大
      const limitedIds = newViewedIds.slice(-1000);
      saveViewedNotificationIds(limitedIds);
    };

    // 侧边栏折叠
    const collapseChange = () => {
      store.commit("handleCollapse", !collapse.value);
    };

    // 智能搜索建议（只搜索车牌号和业主姓名）
    const querySearchAsync = async (queryString, callback) => {
      console.log('Header: 搜索触发，关键词:', queryString);
      console.log('Header: 当前用户管理的车场:', managedParks.value);
      console.log('Header: 是否为管理员:', isAdmin.value);
      
      // 允许单个字符搜索，提高搜索灵敏度
      if (!queryString || queryString.trim().length < 1) {
        console.log('Header: 搜索关键词为空，返回空结果');
        callback([]);
        return;
      }

      try {
        const results = [];
        
        // 🔐 根据用户权限确定车场参数
        // 如果是管理员或没有授权车场，查询所有；否则只查询授权车场
        let parkNameParam = null;
        if (!isAdmin.value && managedParks.value.length > 0) {
          // 普通用户有授权车场，传递车场名称（如果有多个，传递第一个或用逗号分隔）
          parkNameParam = managedParks.value.join(',');
          console.log('Header: 🔐 普通用户搜索，限制车场范围:', parkNameParam);
        } else {
          console.log('Header: 🔐 管理员搜索或无车场限制，查询所有车场');
        }
        
        // 1. 车牌号搜索建议（从违规记录中获取）- 降低最小搜索长度到1
        if (queryString.length >= 1) {
          try {
            // 🔐 使用违规记录API获取车牌建议，传递车场权限参数
            const plateResponse = await violationApi.getViolationPlateSuggestions(queryString, parkNameParam);
            console.log('Header: 车牌搜索API响应:', plateResponse);
            
            if (plateResponse && plateResponse.data && plateResponse.data.code === "0") {
              const plateSuggestions = plateResponse.data.data || [];
              console.log('Header: 车牌搜索建议数据:', plateSuggestions);
              
              // 🔧 去重车牌号码，避免重复显示
              const uniquePlates = new Map();
              plateSuggestions.forEach(plate => {
                if (!uniquePlates.has(plate.plateNumber)) {
                  uniquePlates.set(plate.plateNumber, plate);
                }
              });
              
              // 添加去重后的车牌建议，显示业主名称
              uniquePlates.forEach(plate => {
                const ownerInfo = plate.ownerName ? ` - ${plate.ownerName}` : '';
                results.push({
                  title: `车牌: ${plate.plateNumber}${ownerInfo}`,
                  type: '车牌号码',
                  icon: 'CreditCard',
                  path: '/admin/IllegalRegiste',
                  plateNumber: plate.plateNumber,
                  ownerName: plate.ownerName,
                  ownerPhone: plate.ownerPhone,
                  violationCount: plate.violationCount, // 🆕 显示违规次数
                  isPlateSearch: true
                });
              });
            }
          } catch (error) {
            console.error('Header: 违规记录车牌搜索失败:', error);
            console.error('Header: 错误详情:', error.response);
            
            // 降级到原有的业主API
            try {
              console.log('Header: 尝试使用降级API搜索车牌...');
              const plateResponse = await ownerApi.getPlateSuggestions(queryString);
              console.log('Header: 降级API响应:', plateResponse);
              
              if (plateResponse && plateResponse.data && plateResponse.data.code === "0") {
                const plateSuggestions = plateResponse.data.data || [];
                console.log('Header: 降级API搜索结果:', plateSuggestions);
                
                const uniquePlates = new Map();
                plateSuggestions.forEach(plate => {
                  if (!uniquePlates.has(plate.plateNumber)) {
                    uniquePlates.set(plate.plateNumber, plate);
                  }
                });
                
                uniquePlates.forEach(plate => {
                  const ownerInfo = plate.ownerName ? ` - ${plate.ownerName}` : '';
                  results.push({
                    title: `车牌: ${plate.plateNumber}${ownerInfo}`,
                    type: '车牌号码',
                    icon: 'CreditCard',
                    path: '/admin/IllegalRegiste',
                    plateNumber: plate.plateNumber,
                    ownerName: plate.ownerName,
                    ownerPhone: plate.ownerPhone,
                    isPlateSearch: true
                  });
                });
                console.log('Header: 降级搜索成功，共', uniquePlates.size, '条结果');
              }
            } catch (fallbackError) {
              console.error('Header: 降级车牌搜索也失败:', fallbackError);
              console.error('Header: 降级错误详情:', fallbackError.response);
            }
          }
        }

        // 2. 业主姓名搜索（降低到1个字符就可以搜索）
        if (queryString.length >= 1) {
          try {
            const ownerResponse = await ownerApi.getOwnerNameSuggestions(queryString);
            console.log('Header: 业主姓名搜索响应:', ownerResponse);
            
            if (ownerResponse && ownerResponse.data && ownerResponse.data.code === "0") {
              const ownerSuggestions = ownerResponse.data.data || [];
              console.log('Header: 业主姓名搜索结果:', ownerSuggestions);
              
              // 去重业主姓名
              const uniqueOwners = new Map();
              ownerSuggestions.forEach(owner => {
                const key = `${owner.ownerName}_${owner.ownerPhone || ''}`;
                if (!uniqueOwners.has(key)) {
                  uniqueOwners.set(key, owner);
                }
              });
              
              // 添加去重后的业主建议
              uniqueOwners.forEach(owner => {
                results.push({
                  title: `业主: ${owner.ownerName}${owner.ownerPhone ? ' (' + owner.ownerPhone + ')' : ''}`,
                  type: '业主信息',
                  icon: 'User',
                  path: '/admin/IllegalRegiste',
                  ownerName: owner.ownerName,
                  ownerPhone: owner.ownerPhone,
                  plateNumber: owner.plateNumber, // 如果有关联车牌
                  isOwnerSearch: true
                });
              });
            }
          } catch (error) {
            console.warn('Header: 业主姓名搜索失败:', error);
          }
        }

        console.log('Header: 搜索结果汇总:', results);
        
        // 如果没有搜索结果，显示提示信息并提供直接搜索选项
        if (results.length === 0) {
          console.log('Header: 未找到匹配结果，提供直接搜索选项');
          callback([{
            title: `直接搜索"${queryString}"`,
            type: '点击直接搜索',
            icon: 'Search',
            value: queryString,
            isDirectSearch: true
          }]);
        } else {
          // 在有结果的情况下，也添加一个"直接搜索"选项在最后
          results.push({
            title: `搜索全部"${queryString}"相关记录`,
            type: '搜索全部',
            icon: 'Search',
            value: queryString,
            isDirectSearch: true
          });
          callback(results);
        }
      } catch (error) {
        console.error('Header: 搜索建议获取失败:', error);
        // 即使出错也返回一个错误提示
        callback([{
          title: '搜索出错，请稍后重试',
          type: '错误',
          icon: 'WarningFilled',
          value: queryString,
          isError: true
        }]);
      }
    };

    // 搜索功能（直接跳转到违规查询页面）
    const handleSearch = () => {
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim();
        console.log('Header: 执行直接搜索，关键词:', keyword);
        
        // 智能判断关键词类型，传递正确的参数
        const query = {};
        
        // 判断是否是车牌号（通常包含字母和数字）
        if (/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4,6}$/i.test(keyword)) {
          query.plateNumber = keyword;
          console.log('Header: 识别为车牌号');
        } 
        // 判断是否是手机号
        else if (/^1[3-9]\d{9}$/.test(keyword)) {
          query.ownerPhone = keyword;
          console.log('Header: 识别为手机号');
        }
        // 判断是否是中文姓名
        else if (/^[\u4e00-\u9fa5]{2,4}$/.test(keyword)) {
          query.ownerName = keyword;
          console.log('Header: 识别为姓名');
        }
        // 其他情况，尝试作为车牌号搜索
        else {
          query.plateNumber = keyword;
          console.log('Header: 默认作为车牌号搜索');
        }
        
        console.log('Header: 跳转参数:', query);
        
        // 直接跳转到违规查询页面
        router.push({
          path: '/admin/IllegalRegiste',
          query: query
        });
        ElMessage.success(`正在搜索：${keyword}`);
      }
    };

    // 搜索选择处理
    const handleSearchSelect = (item) => {
      console.log('Header: 选择搜索项:', item);
      
      // 如果是"直接搜索"、"无结果"或"错误"项，执行普通搜索
      if (item.isDirectSearch || item.isNoResult || item.isError) {
        // 使用item中的关键词或当前搜索框的值
        if (item.value) {
          searchKeyword.value = item.value;
        }
        handleSearch();
        return;
      }
      
      if (item.path) {
        // 如果是车牌或业主搜索，需要传递参数到违规记录页面
        if (item.isPlateSearch || item.isOwnerSearch) {
          const query = {};
          if (item.plateNumber) {
            query.plateNumber = item.plateNumber;
            console.log('Header: 传递车牌号参数:', item.plateNumber);
          }
          if (item.ownerName) {
            query.ownerName = item.ownerName;
            console.log('Header: 传递业主名称参数:', item.ownerName);
          }
          if (item.ownerPhone) {
            query.ownerPhone = item.ownerPhone;
            console.log('Header: 传递业主电话参数:', item.ownerPhone);
          }
          
          console.log('Header: 完整跳转参数:', query);
          router.push({
            path: item.path,
            query: query
          });
          ElMessage.success(`正在查看车辆 ${item.plateNumber || ''} 的违规记录`);
        } else {
          router.push(item.path);
          ElMessage.success(`正在跳转到：${item.title}`);
        }
      }
    };

    // 将活动日志转换为通知格式
    const convertActivityToNotification = (activity) => {
      // 数据验证
      if (!activity || !activity.id) {
        console.warn('Header: 无效的活动数据:', activity);
        return null;
      }

      const getNotificationType = (module, action, status) => {
        if (status === 'error' || status === 'failure') return 'warning';

        switch (module) {
          case '车主管理':
          case '用户管理':
            return 'success';
          case '违规管理':
          case '黑名单管理':
            return 'warning';
          case '预约管理':
          case '月票管理':
            return 'info';
          default:
            return 'info';
        }
      };

      const getNotificationIcon = (module, action) => {
        switch (module) {
          case '车主管理':
          case '用户管理':
            return 'User';
          case '违规管理':
          case '黑名单管理':
            return 'WarningFilled';
          case '预约管理':
            return 'Calendar';
          case '月票管理':
            return 'CreditCard';
          case '小区管理':
            return 'OfficeBuilding';
          default:
            return 'InfoFilled';
        }
      };

      // 处理时间字段
      let activityTime;
      try {
        activityTime = new Date(activity.createdAt || activity.createTime || activity.operationTime || Date.now());
        // 验证时间是否有效
        if (isNaN(activityTime.getTime())) {
          activityTime = new Date();
        }
      } catch (error) {
        console.warn('Header: 时间解析错误:', error);
        activityTime = new Date();
      }

      const notification = {
        id: activity.id,
        title: `${activity.module || '系统'} - ${activity.action || '操作'}`,
        message: activity.description || `${activity.username || '用户'}进行了${activity.action || '操作'}`,
        time: activityTime,
        type: getNotificationType(activity.module, activity.action, activity.status),
        icon: getNotificationIcon(activity.module, activity.action),
        read: false,
        module: activity.module || '系统',
        action: activity.action || '操作',
        username: activity.username || '用户'
      };
      return notification;
    };

    // 初始化标志，确保只在首次加载时显示历史活动
    const isInitialLoad = ref(true);

    // 获取当前用户信息
    const loadCurrentUser = async () => {
      try {
        const response = await userApi.getCurrentUser();
        if (response && response.data && response.data.code === "0" && response.data.data) {
          const userData = response.data.data;
          currentUserId.value = userData.id || userData.userId;
          
          // 获取用户角色名称和权限
          if (userData.roleName) {
            userRole.value = userData.roleName;
            userRoleName.value = userData.roleName;
          } else if (userData.roles && userData.roles.length > 0) {
            // 如果有多个角色，显示第一个角色
            const firstRole = userData.roles[0];
            userRole.value = firstRole.roleName || firstRole.name || '系统管理员';
            userRoleName.value = userRole.value;
            
            // 获取角色ID
            if (firstRole.id) {
              userRoleId.value = firstRole.id;
              localStorage.setItem('ms_role', firstRole.id);
            }
            
            // 🆕 解析角色的PERMISSION字段（JSON字符串）
            if (firstRole.permission) {
              try {
                const permissions = JSON.parse(firstRole.permission);
                // 将权限ID列表保存到localStorage
                localStorage.setItem('user_permissions', firstRole.permission);
                console.log('Header: 角色权限ID列表:', permissions);
              } catch (e) {
                console.warn('Header: 解析角色权限失败:', e);
              }
            }
          }
          
          // 获取用户的菜单权限（从Store）
          try {
            const menus = store.state.menu || [];
            userMenus.value = menus;
            console.log('Header: 用户菜单权限:', userMenus.value);
          } catch (menuError) {
            console.warn('Header: 获取菜单权限失败:', menuError);
            userMenus.value = [];
          }
          
          console.log('Header: 当前用户信息加载成功', { 
            userId: currentUserId.value, 
            role: userRole.value,
            roleId: userRoleId.value,
            isAdmin: isAdmin.value 
          });
        }
      } catch (error) {
        console.warn('Header: 获取当前用户信息失败，使用默认值', error);
        // 使用默认值，不影响其他功能
      }
    };

    // 加载通知（只显示当前用户的操作日志，过滤已查看的）
    const loadNotifications = async () => {
      try {
        // 获取当前登录用户的登录账号
        const loginName = localStorage.getItem('login_name');
        
        // console.log('Header: 加载通知，loginName:', loginName);
        
        if (!loginName) {
          console.warn('Header: 未找到登录账号，无法加载通知');
          return;
        }

        // 获取当前用户的活动日志（根据loginName查询）
        const response = await activityApi.getActivityLogPage({
          pageNum: 1,
          pageSize: 1000,
          username: loginName // 根据登录账号查询当前用户的操作日志
        });

        // 修复：使用与EmptyPer.vue相同的响应格式检查
        if (response && response.data && response.data.code === "0" && response.data.data) {
          const activities = response.data.data.records || [];
        
          
          // 检查是否有其他用户的记录
          const otherUsers = activities.filter(r => r.username !== loginName);
          if (otherUsers.length > 0) {
            const uniqueOtherUsers = [...new Set(otherUsers.map(r => r.username))];
            console.warn('Header: ⚠️ 警告！返回了其他用户的记录:', uniqueOtherUsers);
            console.warn('Header: ⚠️ 后端未正确过滤 username 参数，前端将手动过滤');
          }
          
          // 前端手动过滤，确保只显示当前用户的操作记录
          const currentUserActivities = activities.filter(activity => activity.username === loginName)

          // 过滤出需要显示为通知的活动（扩展到最近4小时内的活动）
          const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
          const recentActivities = currentUserActivities.filter(activity => {
            // 修复：使用正确的时间字段名称
            const activityTime = new Date(activity.createdAt || activity.createTime || activity.operationTime);
            return activityTime > fourHoursAgo;
          });

          // 转换为通知格式
          const newNotifications = recentActivities.map(convertActivityToNotification).filter(n => n !== null); // 过滤掉无效的通知

          // 获取已查看的通知ID列表
          const viewedIds = getViewedNotificationIds();
          
          // 过滤掉已查看的通知
          const unviewedNotifications = newNotifications.filter(n => !viewedIds.includes(n.id));

          // 合并现有通知和新通知，去重
          const existingIds = notifications.value.map(n => n.id);
          const uniqueNotifications = unviewedNotifications.filter(n => !existingIds.includes(n.id));

          if (uniqueNotifications.length > 0 || isInitialLoad.value) {
            // 有新活动或初次加载时，更新通知列表
            if (isInitialLoad.value) {
              // 初次加载时，显示所有未查看的活动
              notifications.value = unviewedNotifications;
              // 将超过1小时的活动标记为已读，1小时内的标记为未读
              const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
              notifications.value.forEach(notification => {
                const notificationTime = new Date(notification.time);
                notification.read = notificationTime <= oneHourAgo; // 超过1小时的标记为已读
              });
            } else {
              // 非初次加载时，只添加新通知
              notifications.value = [...uniqueNotifications, ...notifications.value];
            }
            updateNotificationCount();
          }

          // 标记初始化完成
          isInitialLoad.value = false;
        } else {
          console.error('Header: API返回数据格式错误:', response);
        }

        // 确保每次加载后都更新通知数量
        updateNotificationCount();
      } catch (error) {
        console.error('Header: 加载通知失败:', error);
        // 如果API调用失败，可以显示默认通知或静默处理
        updateNotificationCount(); // 即使失败也要更新数量
      }
    };

    // 更新通知数量
    const updateNotificationCount = () => {
      const unreadNotifications = notifications.value.filter(n => !n.read);
      const unreadCount = unreadNotifications.length;
      notificationCount.value = unreadCount;

      // 强制触发响应式更新
      if (notificationCount.value !== unreadCount) {
        notificationCount.value = unreadCount;
      }
    };

    // 标记为已读（点击通知项时触发）
    const markAsRead = (notification) => {
      if (!notification.read) {
        notification.read = true;
        // 标记该通知为已查看（保存到localStorage）
        markNotificationsAsViewed([notification.id]);
        updateNotificationCount();
        console.log('Header: 通知已标记为已读，ID:', notification.id);
      }
    };

    // 删除通知（标记为已查看）
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id);
      if (index > -1) {
        // 标记为已查看
        markNotificationsAsViewed([id]);
        
        notifications.value.splice(index, 1);
        updateNotificationCount();
        ElMessage.success('消息已删除');
      }
    };

    // 全部标记为已读
    const markAllAsRead = () => {
      if (notifications.value.length > 0) {
        // 标记所有通知为已读
        notifications.value.forEach(notification => {
          notification.read = true;
        });
        
        // 保存到localStorage
        const notificationIds = notifications.value.map(n => n.id);
        markNotificationsAsViewed(notificationIds);
        
        updateNotificationCount();
        ElMessage.success('所有消息已标记为已读');
        console.log('Header: 所有通知已标记为已读');
      }
    };

    // 清空所有通知
    const clearAllNotifications = () => {
      // 标记所有通知为已查看
      if (notifications.value.length > 0) {
        const notificationIds = notifications.value.map(n => n.id);
        markNotificationsAsViewed(notificationIds);
      }
      
      notifications.value = [];
      notificationCount.value = 0;
      notificationVisible.value = false;
      
      ElMessage.success('所有消息已清空');
    };

    // 定时刷新通知
    const startNotificationRefresh = () => {
      // 每2秒检查一次新的活动日志（提供最实时的体验）
      refreshTimer.value = setInterval(async () => {
        // 定时刷新时不重新初始化，只检查新活动
        // console.log('Header: 定时检查新活动...');
        await loadNotifications();
        // 确保界面立即更新
        updateNotificationCount();
      }, 3000); // 改为2秒刷新一次，提供最实时的体验
    };

    // 停止定时刷新
    const stopNotificationRefresh = () => {
      if (refreshTimer.value) {
        clearInterval(refreshTimer.value);
        refreshTimer.value = null;
      }
    };

    // 处理点击通知铃铛（不自动标记为已读，只是打开面板）
    const handleNotificationClick = async () => {
      console.log('Header: 用户点击通知铃铛，打开通知面板');
      // 不做任何标记操作，只是打开面板让用户查看
    };

    // 手动刷新通知
    const refreshNotifications = async () => {
      console.log('Header: 手动刷新通知...');
      await loadNotifications();
      updateNotificationCount();
      ElMessage.success('通知已刷新');
    };

    // 格式化时间
    const formatTime = (time) => {
      const now = new Date();
      const diff = now - time;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      return `${days}天前`;
    };

    // 全屏切换
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        isFullscreen.value = true;
      } else {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
    };

    // 用户下拉菜单选择事件
    // 处理退出登录
    const handleLogout = async () => {
      try {
        // 先调用后端接口记录退出日志（在清除 localStorage 之前）
        const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
        if (userId) {
          try {
            // 调用后端退出登录接口记录日志
            await request.post('/parking/user/logout', {}, {
              headers: {
                'userId': userId
              }
            });
            console.log('✅ 退出登录日志记录成功');
          } catch (error) {
            // 记录日志失败不影响退出流程
            console.warn('⚠️ 记录退出登录日志失败:', error);
          }
        }
        
        // 清除本地存储
        localStorage.removeItem("ms_username");
        localStorage.removeItem("login_name");
        localStorage.removeItem("userId");
        localStorage.removeItem("ms_userid");
        localStorage.removeItem("token");
        localStorage.removeItem("ms_role");
        localStorage.removeItem("ms_role_name");
        localStorage.removeItem("departmentId");
        localStorage.removeItem("managed_parks");
        localStorage.removeItem("user");
        
        ElMessage.success('已安全退出系统');
        router.push("/login");
      } catch (error) {
        console.error('退出登录失败:', error);
        // 即使出错也清除本地存储并跳转
        localStorage.removeItem("ms_username");
        localStorage.removeItem("login_name");
        localStorage.removeItem("userId");
        localStorage.removeItem("ms_userid");
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/admin/ProfileCenter');
          ElMessage.success('正在跳转到个人中心');
          break;
        case 'settings':
          // 只有管理员可以访问系统设置
          if (isAdmin.value) {
          router.push('/admin/SystemSettings');
          ElMessage.success('正在跳转到系统设置');
          } else {
            ElMessage.warning('您没有权限访问系统设置');
          }
          break;
        case 'help':
          // 帮助文档：根据用户角色和菜单权限跳转
          router.push({
            path: '/admin/HelpDocs',
            query: {
              roleId: userRoleId.value,
              roleName: userRoleName.value,
              isAdmin: isAdmin.value
            }
          });
          ElMessage.success('正在跳转到帮助文档');
          break;
        case 'logout':
          handleLogout();
          break;
      }
    };

    // 监听全屏变化
    onMounted(async () => {
      console.log('Header: 组件已挂载，开始初始化...');

      document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement;
      });

      // 🖼️ 监听头像更新事件
      window.addEventListener('avatar-updated', refreshAvatar);
      console.log('🖼️ [Header] 已添加头像更新事件监听器');

      // 响应式处理
      if (document.body.clientWidth < 1500) {
        collapseChange();
      }

      // 首先加载当前用户信息
      console.log('Header: 开始加载当前用户信息...');
      await loadCurrentUser();

      // 初始化加载通知
      console.log('Header: 开始初始化加载通知...');
      await loadNotifications();

      // 开始定时刷新通知
      console.log('Header: 启动定时刷新通知...');
      startNotificationRefresh();
      
      // 🔐 加载用户管理的车场信息
      loadManagedParks();
    });

    // 组件卸载时清理定时器和事件监听
    onUnmounted(() => {
      stopNotificationRefresh();
      window.removeEventListener('avatar-updated', refreshAvatar);
      console.log('🖼️ [Header] 已移除头像更新事件监听器');
    });

    // 获取完整的通知内容（用于悬浮提示）
    const getFullNotificationContent = (notification) => {
      // 只返回详情的完整内容
      return notification.message || '无详细信息';
    };

    // 查看全部日志（跳转到个人中心的操作历史）
    const viewAllLogs = () => {
      notificationVisible.value = false;
      router.push({ 
        path: '/profile-center',
        query: { tab: 'history' }
      });
    };

    return {
      username,
      userRole,
      userAvatar,
      isAdmin,
      userMenus,
      managedParks,
      managedParksDisplay,
      managedParksFull,
      searchKeyword,
      notificationCount,
      isFullscreen,
      notificationVisible,
      notifications,
      collapse,
      collapseChange,
      querySearchAsync,
      handleSearch,
      handleSearchSelect,
      loadNotifications,
      loadCurrentUser,
      handleNotificationClick,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      formatTime,
      toggleFullscreen,
      handleCommand,
      getFullNotificationContent,
      viewAllLogs,
    };
  },
};
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 70px;
  padding: 0 24px;
  background: linear-gradient(135deg, #001529 0%, #002140 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

// 左侧区域
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: scale(1.05);
  }

  .collapse-icon {
    font-size: 18px;
  }
}

.system-brand {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 32px;
      height: 32px;
      object-fit: cover;
    }
  }

  .brand-info {
    display: flex;
    flex-direction: column;

    .brand-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1;
      letter-spacing: 0.5px;
    }

    .brand-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 2px;
    }
  }
}

// 右侧区域
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

// 搜索框样式
.search-box {
  .search-input {
    width: 320px;

    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.15);
      }

      &.is-focus {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.2);
      }
    }

    :deep(.el-input__inner) {
      color: #fff;
      font-size: 14px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    :deep(.el-input__prefix-inner) {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 搜索建议样式
.search-suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  .suggestion-icon {
    color: #40a9ff;
    font-size: 16px;
  }

  .suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .suggestion-title {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .suggestion-type {
      font-size: 12px;
      color: #999;
    }
  }
}

// 搜索建议弹出层样式
:deep(.search-suggestion-popper) {
  z-index: 2000 !important;
  
  .el-autocomplete-suggestion__wrap {
    max-height: 400px;
    overflow-y: auto;
  }

  .el-autocomplete-suggestion__list {
    padding: 8px 0;
  }

  .el-autocomplete-suggestion li {
    padding: 8px 12px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

// 通知相关样式
.notification-container {
  position: relative;
}

.notification-bell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: scale(1.05);
  }

  .bell-icon {
    font-size: 18px;
  }

  :deep(.el-badge__content) {
    border: 2px solid #001529;
    font-size: 10px;
  }
}

.notification-panel {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;

    .notification-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .notification-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
      background: #f8f9fa;
      border-color: #e9ecef;
    }

    &.unread {
      background: #f0f9ff;
      border-color: #bae6fd;

      .notification-message {
        font-weight: 600;
        color: #1e40af;
      }
    }

    .notification-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
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
    }

    .notification-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .notification-message {
        font-size: 13px;
        color: #333;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
        white-space: pre-wrap;
      }

      .notification-time {
        font-size: 11px;
        color: #999;
      }
    }

    .notification-actions {
      .el-button {
        color: #ccc;

        &:hover {
          color: #666;
        }
      }
    }
  }

  .notification-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .notification-footer {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    margin-top: 12px;
    text-align: center;

    .el-button {
      font-size: 13px;
      color: #409eff;

      &:hover {
        color: #66b1ff;
      }
    }
  }
}

// 🎨 自定义 tooltip 样式
:deep(.notification-tooltip) {
  max-width: 400px !important;
  line-height: 1.6 !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: scale(1.05);
  }

  .fullscreen-icon {
    font-size: 16px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    border-color: #40a9ff;
    transform: scale(1.05);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .online-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #52c41a;
    border-radius: 50%;
    border: 2px solid #001529;
  }
}

.user-dropdown {
  cursor: pointer;

  .user-details {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    min-width: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-text-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
      flex: 1;

      .username {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }

      .user-role {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.2;
        white-space: nowrap;
        margin-top: 2px;
      }
      
      .user-parks {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
        margin-top: 2px;
        display: flex;
        align-items: center;
        gap: 3px;
        
        .parks-icon {
          font-size: 11px;
          flex-shrink: 0;
        }
      }
    }

    .dropdown-arrow {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    &:hover .dropdown-arrow {
      transform: rotate(180deg);
    }
  }
}

:deep(.user-menu) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    transition: all 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #f0f9ff;
      color: #1890ff;
    }

    &.is-divided {
      border-top: 1px solid #f0f0f0;
      margin-top: 8px;
      padding-top: 16px;
    }

    .el-icon {
      font-size: 16px;
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .search-box .search-input {
    width: 260px;
  }

  .user-details .user-text-info .username {
    max-width: 80px;
  }
}

@media (max-width: 1200px) {
  .search-box .search-input {
    width: 200px;
  }

  .header-right {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .header-left {
    gap: 12px;
  }

  .header-right {
    gap: 8px;
  }

  .search-box {
    display: none;
  }

  .system-brand .brand-info .brand-title {
    font-size: 16px;
  }

  .user-details .user-text-info {
    display: none;
  }
}

@media (max-width: 480px) {

  .notification-container,
  .fullscreen-btn {
    display: none;
  }
}
</style>
