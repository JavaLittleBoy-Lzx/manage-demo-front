<template>
  <div class="profile-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <el-icon class="header-icon">
              <User />
            </el-icon>
          </div>
          <div class="title-text">
            <h1>个人中心</h1>
            <p class="title-desc">管理个人信息和账户设置</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <el-row :gutter="24">
        <!-- 左侧：个人信息卡片 -->
        <el-col :span="8">
          <el-card class="profile-card" shadow="hover">
            <div class="profile-header">
              <div class="avatar-section">
                <el-avatar :size="80" :src="userInfo.avatar" class="user-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </el-avatar>
                <el-button type="primary" size="small" class="avatar-upload-btn" @click="showAvatarDialog = true">
                  更换头像
                </el-button>
              </div>
              <div class="user-info">
                <h3 class="username">{{ userInfo.username }}</h3>
                <p class="user-role">{{ userInfo.role }}</p>
                <p class="user-email">{{ userInfo.email }}</p>

                <!-- 🔐 管理车场信息 -->
                <div class="user-managed-parks" v-if="managedParks.length > 0">
                  <div class="parks-label">
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                    <span>管理车场</span>
                  </div>
                  <div class="parks-tags">
                    <el-tag v-for="park in managedParks" :key="park" type="success" size="small" class="park-tag">
                      {{ park }}
                    </el-tag>
                  </div>
                </div>
                <div class="user-managed-parks" v-else>
                  <div class="parks-label">
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                    <span>管理车场</span>
                  </div>
                  <div class="parks-all-access">
                    <el-tag type="info" size="small">全部车场</el-tag>
                  </div>
                </div>

                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-label">近7天登录</span>
                    <span class="stat-value">{{ userInfo.loginCount }}次</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">最后登录</span>
                    <span class="stat-value" :title="formatFullDateTime(userInfo.lastLoginTime)">
                      {{ formatRelativeTime(userInfo.lastLoginTime) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快捷操作 -->
          <el-card class="quick-actions-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <Setting />
                </el-icon>
                <span>快捷操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" :icon="Edit" @click="activeTab = 'profile'" class="action-btn">
                编辑资料
              </el-button>
              <el-button type="warning" :icon="Lock" @click="activeTab = 'password'" class="action-btn">
                修改密码
              </el-button>
              <el-button type="info" :icon="Clock" @click="activeTab = 'history'" class="action-btn">
                操作历史
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：详细信息 -->
        <el-col :span="16">
          <el-card class="detail-card" shadow="hover">
            <el-tabs v-model="activeTab" class="profile-tabs">
              <!-- 个人信息 -->
              <el-tab-pane label="个人信息" name="profile">
                <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px"
                  class="profile-form">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="用户名" prop="username">
                        <el-input v-model="profileForm.username" disabled />
                      </el-form-item>
                    </el-col>

                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="邮箱" prop="email">
                        <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="手机号" prop="phone">
                        <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                      </el-form-item>
                    </el-col>
                  </el-row>



                  <el-form-item>
                    <el-button type="primary" @click="updateProfile" :loading="profileLoading">
                      保存修改
                    </el-button>
                    <el-button @click="resetProfileForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 修改密码 -->
              <el-tab-pane label="修改密码" name="password">
                <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px"
                  class="password-form">
                  <el-form-item label="当前密码" prop="currentPassword">
                    <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码"
                      show-password />
                  </el-form-item>

                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                  </el-form-item>

                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                      show-password />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="updatePassword" :loading="passwordLoading">
                      修改密码
                    </el-button>
                    <el-button @click="resetPasswordForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 操作历史 -->
              <el-tab-pane label="操作历史" name="history">
                <div class="history-section">
                  <div class="history-filters">
                    <el-date-picker v-model="historyDateRange" type="daterange" range-separator="至"
                      start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      @change="loadOperationHistory" />
                    <el-button type="primary" @click="loadOperationHistory" :loading="historyLoading">
                      查询
                    </el-button>
                  </div>

                  <el-table :data="operationHistory" v-loading="historyLoading" class="history-table" stripe
                    :empty-text="operationHistory.length === 0 ? '暂无操作历史记录' : '加载中...'">
                    <el-table-column label="操作" width="120">
                      <template #default="{ row }">
                        <el-tag :type="getOperationTagType(row.action)" size="small">
                          {{ row.action || '-' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="模块" width="120">
                      <template #default="{ row }">
                        <el-tag type="info" size="small">
                          {{ row.module || '-' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="描述" min-width="250">
                      <template #default="{ row }">
                        <div class="description-cell">
                          {{ row.description || '-' }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="IP地址" width="140">
                      <template #default="{ row }">
                        <div class="ip-cell">
                          <el-icon>
                            <Location />
                          </el-icon>
                          {{ row.ipAddress || row.ip || '-' }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作时间" width="180">
                      <template #default="{ row }">
                        <div class="time-cell">
                          <el-icon>
                            <Clock />
                          </el-icon>
                          {{ formatDateTime(row.createdAt || row.createTime || row.operationTime) }}
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-pagination v-model:current-page="historyPageNum" v-model:page-size="historyPageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="historyTotal"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="loadOperationHistory"
                    @current-change="loadOperationHistory" class="history-pagination" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog v-model="showAvatarDialog" width="680px" class="avatar-dialog" :close-on-click-modal="false"
      :show-close="true">
      <template #header>
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon>
              <User />
            </el-icon>
          </div>
          <div class="header-content">
            <h3>更换头像</h3>
            <p>选择一张图片作为你的个人头像</p>
          </div>
        </div>
      </template>

      <div class="avatar-cropper-container">
        <!-- 如果没有选择图片，显示上传区域 -->
        <div v-if="!cropperImageSrc" class="upload-area">
          <div class="upload-welcome-tip">
            <el-icon class="tip-icon">
              <InfoFilled />
            </el-icon>
            <span>请选择一张图片开始裁剪，上传后可调整大小和位置</span>
          </div>
          <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="handleFileSelect"
            accept="image/jpeg,image/png,image/jpg" drag>
            <div class="upload-content">
              <div class="upload-icon-wrapper">
                <el-icon class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-icon-bg"></div>
              </div>
              <div class="upload-text">
                <h4>点击或拖拽上传图片</h4>
                <p class="upload-desc">支持 JPG、PNG 格式，文件不超过 2MB</p>
                <div class="upload-tips-box">
                  <div class="tip-item">
                    <el-icon>
                      <Camera />
                    </el-icon>
                    <span>建议使用清晰的正面照片</span>
                  </div>
                  <div class="tip-item">
                    <el-icon>
                      <PictureFilled />
                    </el-icon>
                    <span>推荐尺寸：200x200 像素</span>
                  </div>
                  <div class="tip-item">
                    <el-icon>
                      <Checked />
                    </el-icon>
                    <span>上传后可调整裁剪区域</span>
                  </div>
                </div>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 如果已选择图片，显示裁剪区域 -->
        <div v-else class="cropper-area">
          <div class="cropper-main">
            <div class="cropper-preview-box">
              <div class="cropper-title">
                <el-icon>
                  <Edit />
                </el-icon>
                <span>调整头像</span>
                <div class="title-tips">拖动、缩放或旋转图片</div>
              </div>
              <div class="cropper-canvas-wrapper" @mousedown="startDrag" @wheel.prevent="handleWheel">
                <canvas ref="cropperCanvas" class="cropper-canvas" :width="canvasSize" :height="canvasSize"></canvas>
                <div class="cropper-mask">
                  <div class="mask-corner top-left"></div>
                  <div class="mask-corner top-right"></div>
                  <div class="mask-corner bottom-left"></div>
                  <div class="mask-corner bottom-right"></div>
                </div>
              </div>
              <!-- 操作提示移到圆圈外下方 -->
              <div class="cropper-guide-external">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                <div class="guide-content">
                  <span>• 鼠标拖动调整位置</span>
                  <span>• 滚轮缩放图片大小</span>
                </div>
              </div>
            </div>

            <!-- 控制工具栏 -->
            <div class="cropper-controls">
              <div class="control-section">
                <div class="section-title">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <span>图片调整</span>
                </div>
                <div class="control-item scale-control">
                  <div class="control-label-row">
                    <span class="control-label">缩放比例</span>
                    <span class="control-value">{{ (imageScale * 100).toFixed(0) }}%</span>
                  </div>
                  <el-slider v-model="imageScale" :min="0.1" :max="3" :step="0.01" @input="updateCanvas" />
                </div>
                <div class="control-buttons">
                  <el-button class="control-btn" @click="resetImage">
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    重置
                  </el-button>
                  <el-button class="control-btn" @click="rotateImage(-90)">
                    <el-icon>
                      <RefreshLeft />
                    </el-icon>
                    左转
                  </el-button>
                  <el-button class="control-btn" @click="rotateImage(90)">
                    <el-icon>
                      <RefreshRight />
                    </el-icon>
                    右转
                  </el-button>
                  <el-button class="control-btn reselect-btn" type="warning" @click="reSelectImage">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    重选
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="footer-btn cancel-btn" size="large" @click="cancelAvatarUpload">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
          <el-button class="footer-btn confirm-btn" type="primary" size="large" @click="confirmAvatarUpload"
            :disabled="!cropperImageSrc" :loading="uploadingAvatar">
            <el-icon v-if="!uploadingAvatar">
              <Upload />
            </el-icon>
            {{ uploadingAvatar ? '上传中...' : '确定上传' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  User, Setting, Edit, Lock, Clock, Plus, Location, Check,
  Refresh, RefreshLeft, RefreshRight, Picture, Close, Upload,
  InfoFilled, Camera, PictureFilled, Checked, OfficeBuilding
} from '@element-plus/icons-vue';
import { activityApi } from '@/api/activity';
import { userApi } from '@/api/user';

// 路由
const route = useRoute();

// 响应式数据
const activeTab = ref('profile');
const showAvatarDialog = ref(false);
const profileLoading = ref(false);
const passwordLoading = ref(false);
const historyLoading = ref(false);

// 当前用户ID（用于头像上传等）
const currentUserId = ref(localStorage.getItem('ms_userid') || localStorage.getItem('userId') || '');

// 🔐 用户管理的车场列表
const managedParks = ref([]);

// 加载用户管理的车场信息
const loadManagedParks = () => {
  try {
    const parksJson = localStorage.getItem('managed_parks');
    if (parksJson) {
      const parks = JSON.parse(parksJson);
      managedParks.value = Array.isArray(parks) ? parks : [];
      console.log('✅ [ProfileCenter] 加载管理车场:', managedParks.value);
    } else {
      managedParks.value = [];
      console.log('ℹ️ [ProfileCenter] 未配置管理车场');
    }
  } catch (error) {
    console.error('❌ [ProfileCenter] 解析管理车场失败:', error);
    managedParks.value = [];
  }
};

// 图片裁剪器相关状态
const cropperCanvas = ref(null);
const cropperImageSrc = ref('');
const cropperImage = ref(null);
const imageScale = ref(1);
const imageRotation = ref(0);
const imageX = ref(0);
const imageY = ref(0);
const canvasSize = 200; // 裁剪圆圈尺寸（与CSS保持一致）
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const uploadingAvatar = ref(false);

// 用户信息
const userInfo = ref({
  username: localStorage.getItem('ms_username') || '管理员',
  role: '系统管理员',
  email: '',
  avatar: localStorage.getItem('ms_avatar') || '', // 从localStorage初始化头像
  loginCount: 0,
  lastLoginTime: null
});

// 个人信息表单
const profileForm = reactive({
  username: userInfo.value.username,
  email: '',
  phone: ''
});

const profileFormRef = ref(null);
const profileRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
};

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordFormRef = ref(null);
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 操作历史相关
const operationHistory = ref([]);
const historyDateRange = ref([]);
const historyPageNum = ref(1);
const historyPageSize = ref(10);
const historyTotal = ref(0);

// 方法
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

// 格式化相对时间（今日、昨日等）
const formatRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) return '-';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    // 格式化时间部分
    const timeStr = targetDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // 判断日期
    if (targetDay.getTime() === today.getTime()) {
      return `今日 ${timeStr}`;
    } else if (targetDay.getTime() === yesterday.getTime()) {
      return `昨日 ${timeStr}`;
    } else {
      // 超过昨日，显示月-日 时间
      const monthDay = targetDate.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
      return `${monthDay} ${timeStr}`;
    }
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '-';
  }
};

// 格式化完整日期时间（用于tooltip）
const formatFullDateTime = (date) => {
  if (!date) return '-';

  try {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) return '-';

    return targetDate.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '-';
  }
};

const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '-';
  }
};

// 获取操作标签类型
const getOperationTagType = (action) => {
  const actionMap = {
    '新增': 'success',
    '创建': 'success',
    '添加': 'success',
    '修改': 'warning',
    '更新': 'warning',
    '编辑': 'warning',
    '删除': 'danger',
    '移除': 'danger',
    '查询': 'info',
    '查看': 'info',
    '登录': 'primary',
    '登出': 'info',
    '导出': 'success',
    '导入': 'warning'
  };

  for (const [key, type] of Object.entries(actionMap)) {
    if (action && action.includes(key)) {
      return type;
    }
  }
  return '';
};

// 更新个人信息
const updateProfile = async () => {
  try {
    await profileFormRef.value.validate();
    profileLoading.value = true;

    // 调用后端API更新用户信息
    const userId = localStorage.getItem('ms_userid');
    const updateData = {
      userId: userId,
      userName: profileForm.username,
      email: profileForm.email,
      telephone: profileForm.phone,
      avatar: userInfo.value.avatar
    };
    console.log("updateData = " + updateData);
    const response = await userApi.updateUser(updateData);

    const respCode = response?.code ?? response?.data?.code;
    const respMsg = response?.message ?? response?.data?.message;
    const respData = response?.data ?? response?.data?.data;

    if (respCode === "0") {
      // 更新本地用户信息
      userInfo.value.username = profileForm.username;
      userInfo.value.email = profileForm.email;

      // 更新localStorage
      localStorage.setItem('ms_username', profileForm.username);
      localStorage.setItem('ms_email', profileForm.email);
      localStorage.setItem('ms_phone', profileForm.phone);
      // 头像
      if (userInfo.value.avatar) {
        localStorage.setItem('ms_avatar', userInfo.value.avatar);
      }

      ElMessage.success('个人信息更新成功');

      // 🔄 刷新操作历史
      loadOperationHistory();
    } else {
      ElMessage.error('更新失败：' + (respMsg || '请重试'));
    }
  } catch (error) {
    console.error('更新个人信息失败:', error);
    ElMessage.error('更新失败，请重试');
  } finally {
    profileLoading.value = false;
  }
};

// 重置个人信息表单
const resetProfileForm = () => {
  Object.assign(profileForm, {
    username: userInfo.value.username,
    email: '',
    phone: ''
  });
};

// 修改密码
const updatePassword = async () => {
  try {
    await passwordFormRef.value.validate();
    passwordLoading.value = true;

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    ElMessage.success('密码修改成功');

    // 🔄 刷新操作历史
    loadOperationHistory();

    resetPasswordForm();
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改失败，请重试');
  } finally {
    passwordLoading.value = false;
  }
};

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
};

// 加载操作历史（只查询当前用户）
const loadOperationHistory = async () => {
  try {
    historyLoading.value = true;

    const loginName = localStorage.getItem('login_name');

    console.log('ProfileCenter: 加载操作历史，loginName:', loginName);

    if (!loginName) {
      console.warn('ProfileCenter: 未找到登录账号，无法加载操作历史');
      ElMessage.warning('无法获取用户账号信息，请重新登录');
      operationHistory.value = [];
      historyTotal.value = 0;
      return;
    }

    const params = {
      pageNum: historyPageNum.value,
      pageSize: historyPageSize.value,
      username: loginName // 根据登录账号查询当前用户的操作历史
    };

    // 如果选择了日期范围
    if (historyDateRange.value && historyDateRange.value.length === 2) {
      params.startTime = historyDateRange.value[0] + ' 00:00:00';
      params.endTime = historyDateRange.value[1] + ' 23:59:59';
    }

    console.log('ProfileCenter: 查询参数:', params);

    const response = await activityApi.getActivityLogPage(params);

    console.log('ProfileCenter: API响应:', response);
    console.log('ProfileCenter: 发送的完整查询参数:', JSON.stringify(params, null, 2));
    console.log('ProfileCenter: 查询条件 - loginName:', loginName);

    if (response && response.data && response.data.code === "0") {
      const records = response.data.data.records || [];
      console.log('ProfileCenter: 后端返回总记录数:', response.data.data.total);
      console.log('ProfileCenter: 后端返回记录数量:', records.length);

      // 打印第一条记录的所有字段
      if (records.length > 0) {
        console.log('ProfileCenter: 第一条记录的字段:', Object.keys(records[0]));
        console.log('ProfileCenter: 第一条记录:', records[0]);
      }

      // 使用后端返回的记录和总数（后端已按username正确筛选）
      operationHistory.value = records;
      historyTotal.value = response.data.data.total || 0;

      console.log('ProfileCenter: ✅ 加载操作历史成功，总数:', historyTotal.value, '当前页记录数:', records.length);

      if (records.length === 0) {
        console.log('ProfileCenter: 没有找到操作历史记录');
      } else {
        console.log('ProfileCenter: 成功加载', records.length, '条操作历史记录');
      }
    } else {
      console.error('ProfileCenter: 获取操作历史失败，响应码:', response?.data?.code);
      console.error('ProfileCenter: 错误信息:', response?.data?.message);
      operationHistory.value = [];
      historyTotal.value = 0;
    }
  } catch (error) {
    console.error('ProfileCenter: 加载操作历史异常:', error);
    console.error('ProfileCenter: 错误堆栈:', error.stack);
    operationHistory.value = [];
    historyTotal.value = 0;
  } finally {
    historyLoading.value = false;
  }
};

// ========== 图片裁剪器方法 ==========

// 处理文件选择
const handleFileSelect = (uploadFile) => {
  const file = uploadFile.raw;

  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  if (!isImage) {
    ElMessage.error('只支持 JPG、PNG 格式的图片！');
    return;
  }

  // 验证文件大小
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return;
  }

  // 读取文件
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperImageSrc.value = e.target.result;
    loadImageToCanvas(e.target.result);
  };
  reader.readAsDataURL(file);
};

// 加载图片到画布
const loadImageToCanvas = (src) => {
  const img = new Image();
  img.onload = () => {
    cropperImage.value = img;

    // 初始化位置和缩放
    imageScale.value = 1;
    imageRotation.value = 0;

    // 计算初始位置（居中）
    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    imageScale.value = scale;
    imageX.value = (canvasSize - img.width * scale) / 2;
    imageY.value = (canvasSize - img.height * scale) / 2;

    updateCanvas();
  };
  img.src = src;
};

// 更新画布
const updateCanvas = () => {
  if (!cropperCanvas.value || !cropperImage.value) return;

  const canvas = cropperCanvas.value;
  const ctx = canvas.getContext('2d');
  const img = cropperImage.value;

  // 清空画布
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // 保存上下文状态
  ctx.save();

  // 🔵 创建圆形裁剪路径
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = canvasSize / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip(); // 应用圆形裁剪

  // 移动到图片中心点
  const imgCenterX = imageX.value + (img.width * imageScale.value) / 2;
  const imgCenterY = imageY.value + (img.height * imageScale.value) / 2;

  ctx.translate(imgCenterX, imgCenterY);
  ctx.rotate((imageRotation.value * Math.PI) / 180);
  ctx.translate(-imgCenterX, -imgCenterY);

  // 绘制图片
  ctx.drawImage(
    img,
    imageX.value,
    imageY.value,
    img.width * imageScale.value,
    img.height * imageScale.value
  );

  // 恢复上下文状态
  ctx.restore();
};

// 开始拖拽
const startDrag = (e) => {
  isDragging.value = true;
  dragStartX.value = e.clientX - imageX.value;
  dragStartY.value = e.clientY - imageY.value;

  const onMouseMove = (e) => {
    if (isDragging.value) {
      imageX.value = e.clientX - dragStartX.value;
      imageY.value = e.clientY - dragStartY.value;
      updateCanvas();
    }
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// 处理滚轮缩放
const handleWheel = (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  imageScale.value = Math.max(0.1, Math.min(3, imageScale.value + delta));
  updateCanvas();
};

// 重置图片
const resetImage = () => {
  if (!cropperImage.value) return;

  const img = cropperImage.value;
  const scale = Math.min(canvasSize / img.width, canvasSize / img.height);

  imageScale.value = scale;
  imageRotation.value = 0;
  imageX.value = (canvasSize - img.width * scale) / 2;
  imageY.value = (canvasSize - img.height * scale) / 2;

  updateCanvas();
};

// 旋转图片
const rotateImage = (degree) => {
  imageRotation.value = (imageRotation.value + degree) % 360;
  updateCanvas();
};

// 重新选择图片
const reSelectImage = () => {
  cropperImageSrc.value = '';
  cropperImage.value = null;
  imageScale.value = 1;
  imageRotation.value = 0;
  imageX.value = 0;
  imageY.value = 0;
};

// 取消上传
const cancelAvatarUpload = () => {
  reSelectImage();
  showAvatarDialog.value = false;
};

// 确认上传头像
const confirmAvatarUpload = async () => {
  if (!cropperCanvas.value) {
    ElMessage.error('请先选择图片');
    return;
  }

  try {
    uploadingAvatar.value = true;

    console.log('📸 [头像上传] 开始处理...');
    console.log('📸 [头像上传] 当前用户ID:', currentUserId.value);

    // 将画布内容转换为 Blob
    const blob = await new Promise((resolve) => {
      cropperCanvas.value.toBlob(resolve, 'image/jpeg', 0.9);
    });

    console.log('📸 [头像上传] Blob生成成功，大小:', blob.size, 'bytes');

    // 创建 FormData
    const formData = new FormData();
    formData.append('file', blob, 'avatar.jpg');
    formData.append('userId', currentUserId.value);

    console.log('📸 [头像上传] FormData创建成功，开始上传...');

    // 使用 axios 上传
    const response = await userApi.uploadAvatar(formData);

    console.log('📸 [头像上传] 服务器响应:', response);
    console.log('📸 [头像上传] response 的类型:', typeof response);
    console.log('📸 [头像上传] response 的键:', Object.keys(response));

    // ⚠️ 检查响应结构
    // 可能的情况1: response = {code, msg, data}
    // 可能的情况2: response = {data: {code, msg, data}}

    let respCode, respMsg, respData, avatarUrl;

    // 判断是否是双重包装
    if (response?.data?.code !== undefined) {
      // 双重包装：response = {data: {code, msg, data}}
      console.log('📸 [头像上传] 检测到双重包装');
      respCode = response.data.code;
      respMsg = response.data.msg ?? response.data.message;
      respData = response.data.data;
      avatarUrl = respData?.avatarUrl ?? respData?.url;
    } else {
      // 单层包装：response = {code, msg, data}
      console.log('📸 [头像上传] 单层包装');
      respCode = response?.code;
      respMsg = response?.msg ?? response?.message;
      respData = response?.data;
      avatarUrl = respData?.avatarUrl ?? respData?.url;
    }

    console.log('📸 [头像上传] 响应代码:', respCode);
    console.log('📸 [头像上传] 响应消息:', respMsg);
    console.log('📸 [头像上传] respData:', respData);
    console.log('📸 [头像上传] 头像URL:', avatarUrl);

    if (respCode === "0") {
      if (avatarUrl) {
        // 更新用户头像（拼接完整的URL）
        const fullAvatarUrl = avatarUrl.startsWith('http')
          ? avatarUrl
          : `https://www.xuerparking.cn:8543${avatarUrl}`;
        userInfo.value.avatar = fullAvatarUrl;
        localStorage.setItem('ms_avatar', fullAvatarUrl);

        // 🔔 触发头像更新事件，通知其他组件（如 Header）更新头像
        window.dispatchEvent(new Event('avatar-updated'));
        console.log('🔔 [头像上传] 已触发头像更新事件');

        ElMessage.success('头像上传成功');
        console.log('✅ [头像上传] 上传成功，头像已更新:', fullAvatarUrl);

        // 🔄 刷新操作历史
        loadOperationHistory();

        reSelectImage();
        showAvatarDialog.value = false;
      } else {
        console.warn('⚠️ [头像上传] 上传成功但未返回头像URL');
        ElMessage.warning('头像上传成功，但未获取到头像地址');
        reSelectImage();
        showAvatarDialog.value = false;
      }
    } else {
      const errorMsg = respMsg || '头像上传失败，请重试';
      console.error('❌ [头像上传] 上传失败:', errorMsg);
      ElMessage.error(errorMsg);
    }
  } catch (error) {
    console.error('❌ [头像上传] 异常:', error);
    console.error('❌ [头像上传] 错误详情:', error.response || error.message);

    // 提取错误信息
    let errorMsg = '头像上传失败';
    if (error.response && error.response.data) {
      errorMsg = error.response.data.msg || error.response.data.message || errorMsg;
    } else if (error.message) {
      errorMsg += ': ' + error.message;
    }

    ElMessage.error(errorMsg);
  } finally {
    uploadingAvatar.value = false;
  }
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 从localStorage获取基本信息
    const userId = localStorage.getItem('ms_userid') || localStorage.getItem('userId');
    const username = localStorage.getItem('ms_username');
    const loginName = localStorage.getItem('login_name'); // 用户登录账号
    console.log("ProfileCenter: 加载用户信息, userId =", userId, ", username =", username, ", loginName =", loginName);

    if (username) {
      // 先设置localStorage中的数据，确保有初始值
      userInfo.value.username = username;
      userInfo.value.email = localStorage.getItem('ms_email') || '';
      userInfo.value.avatar = localStorage.getItem('ms_avatar') || '';

      profileForm.username = username;
      profileForm.email = localStorage.getItem('ms_email') || '';
      profileForm.phone = localStorage.getItem('ms_phone') || '';

      // 调用后端API获取用户详细信息
      try {
        const response = await userApi.getCurrentUser();
        console.log('ProfileCenter: 用户信息API响应:', response);

        const respCode = response?.code ?? response?.data?.code;
        const userData = response?.data?.data ?? response?.data;

        if (respCode === "0" && userData) {
          // 更新用户信息
          userInfo.value.username = userData.userName || userData.username || username;
          userInfo.value.email = userData.email || userInfo.value.email;

          // 头像优先使用API返回的，如果没有则使用localStorage中的
          if (userData.avatar) {
            // 确保头像URL是完整的
            const fullAvatarUrl = userData.avatar.startsWith('http')
              ? userData.avatar
              : `https://www.xuerparking.cn:8543${userData.avatar}`;
            userInfo.value.avatar = fullAvatarUrl;
            localStorage.setItem('ms_avatar', fullAvatarUrl);
          }

          // 获取角色信息
          if (userData.roleName) {
            userInfo.value.role = userData.roleName;
          } else if (userData.roles && userData.roles.length > 0) {
            userInfo.value.role = userData.roles[0].roleName || userData.roles[0].name || '系统管理员';
          }

          // 更新表单数据
          profileForm.username = userInfo.value.username;
          profileForm.email = userData.email || profileForm.email;
          profileForm.phone = userData.telephone || userData.phone || profileForm.phone;

          console.log('ProfileCenter: 用户信息已更新:', userInfo.value);
          console.log('ProfileCenter: 用户头像:', userInfo.value.avatar);
        } else {
          console.warn('ProfileCenter: API返回格式不正确，使用localStorage数据');
        }
      } catch (apiError) {
        console.error('ProfileCenter: 获取用户信息API失败，使用localStorage数据:', apiError);
      }

      // 加载用户统计信息（使用登录账号查询）
      if (loginName) {
        await loadUserStatistics(loginName);
      } else {
        console.warn('ProfileCenter: 没有找到登录账号，无法加载统计信息');
        userInfo.value.lastLoginTime = new Date();
      }
    }
  } catch (error) {
    console.error('ProfileCenter: 加载用户信息失败:', error);
    // 降级处理：使用localStorage中的数据
    const username = localStorage.getItem('ms_username');
    if (username) {
      userInfo.value.username = username;
      userInfo.value.email = localStorage.getItem('ms_email') || '';
      userInfo.value.avatar = localStorage.getItem('ms_avatar') || '';

      profileForm.username = username;
      profileForm.email = localStorage.getItem('ms_email') || '';
      profileForm.phone = localStorage.getItem('ms_phone') || '';

      userInfo.value.lastLoginTime = new Date();
    }
  }
};

// 加载用户详细信息
const loadUserProfile = async (userId) => {
  try {
    // 这里可以调用后端API获取用户详细信息
    // 暂时使用localStorage中的数据或设置默认值
    profileForm.email = localStorage.getItem('ms_email') || '';
    profileForm.phone = localStorage.getItem('ms_phone') || '';
    userInfo.value.avatar = localStorage.getItem('ms_avatar') || '';
  } catch (error) {
    console.error('加载用户详细信息失败:', error);
  }
};

// 加载用户统计信息
const loadUserStatistics = async (loginName) => {
  try {
    console.log('ProfileCenter: 开始加载用户统计信息, loginName:', loginName);

    if (!loginName) {
      console.warn('ProfileCenter: 登录账号为空，无法加载统计信息');
      return;
    }

    // 获取用户登录统计（只获取最近7天的登录数据）
    try {
      // 计算最近7天的开始时间
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startTime = sevenDaysAgo.toISOString().split('T')[0] + ' 00:00:00';
      const endTime = new Date().toISOString().split('T')[0] + ' 23:59:59';

      const queryParams = {
        pageNum: 1,
        pageSize: 1000,
        username: loginName, // 根据登录账号查询
        action: '用户登录', // 只查询登录操作
        startTime: startTime,
        endTime: endTime
      };

      console.log('ProfileCenter: 发送查询请求，完整参数:', JSON.stringify(queryParams, null, 2));

      const loginLogsResponse = await activityApi.getActivityLogPage(queryParams);

      console.log('ProfileCenter: 登录统计响应（最近7天）:', loginLogsResponse);
      console.log('ProfileCenter: 查询参数 - loginName:', loginName, 'action:', '用户登录');

      if (loginLogsResponse && loginLogsResponse.data && loginLogsResponse.data.code === "0") {
        const records = loginLogsResponse.data.data.records || [];
        console.log('ProfileCenter: 后端返回总记录数:', loginLogsResponse.data.data.total);
        console.log('ProfileCenter: 后端返回记录数量:', records.length);

        // 检查是否有其他用户的记录
        const otherUsers = records.filter(r => r.username !== loginName);
        if (otherUsers.length > 0) {
          console.warn('ProfileCenter: ⚠️ 警告！返回了其他用户的记录:', otherUsers.map(r => r.username));
          console.warn('ProfileCenter: ⚠️ 后端未正确过滤 username 参数，前端将手动过滤');
        }

        // 前端手动过滤，确保只统计当前用户的登录记录（防止后端过滤不准确）
        const currentUserLoginRecords = records.filter(r => r.username === loginName);
        userInfo.value.loginCount = currentUserLoginRecords.length;

        console.log('ProfileCenter: ✅ 前端过滤后的登录次数:', userInfo.value.loginCount);
      }
    } catch (statsError) {
      console.error('ProfileCenter: 获取登录统计失败:', statsError);
      userInfo.value.loginCount = 0;
    }

    // 获取最后登录时间（从活动日志中获取登录记录）
    try {
      const lastLoginResponse = await activityApi.getActivityLogPage({
        pageNum: 1,
        pageSize: 1,
        username: loginName, // 根据登录账号查询
        action: '用户登录'
      });

      console.log('ProfileCenter: 最后登录响应:', lastLoginResponse);

      if (lastLoginResponse && lastLoginResponse.data && lastLoginResponse.data.code === "0") {
        const records = lastLoginResponse.data.data.records;
        if (records && records.length > 0) {
          const lastLoginTime = records[0].createdAt || records[0].createTime || records[0].operationTime;
          userInfo.value.lastLoginTime = lastLoginTime ? new Date(lastLoginTime) : null;
          console.log('ProfileCenter: 最后登录时间:', userInfo.value.lastLoginTime);
        } else {
          console.log('ProfileCenter: 没有找到登录记录');
          userInfo.value.lastLoginTime = new Date(); // 默认使用当前时间
        }
      }
    } catch (loginError) {
      console.warn('ProfileCenter: 获取最后登录时间失败:', loginError);
      userInfo.value.lastLoginTime = new Date(); // 默认使用当前时间
    }
  } catch (error) {
    console.error('ProfileCenter: 加载用户统计信息失败:', error);
  }
};

// 初始化
onMounted(() => {
  // 🔄 检查路由参数，如果有 tab 参数则切换到对应标签页
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }

  loadUserInfo();
  loadOperationHistory();
  loadManagedParks(); // 🔐 加载管理车场信息
});
</script>

<style lang="scss" scoped>
.profile-center {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 24px;
  color: white;

  .page-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      .header-icon {
        font-size: 24px;
        color: white;
      }
    }

    .title-text {
      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }

      .title-desc {
        margin: 4px 0 0 0;
        opacity: 0.9;
        font-size: 14px;
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 24px;

  .profile-header {
    text-align: center;

    .avatar-section {
      margin-bottom: 20px;

      .user-avatar {
        margin-bottom: 12px;
        border: 4px solid #f0f0f0;
      }

      .avatar-upload-btn {
        width: 100px;
      }
    }

    .user-info {
      .username {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }

      .user-role {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
      }

      .user-email {
        margin: 0 0 16px 0;
        color: #999;
        font-size: 13px;
      }

      .user-managed-parks {
        margin: 0 0 20px 0;

        .parks-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
          margin-bottom: 10px;

          .el-icon {
            color: #409eff;
            font-size: 14px;
          }
        }

        .parks-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .park-tag {
            border-radius: 4px;
            font-size: 12px;
          }
        }

        .parks-all-access {
          .el-tag {
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }

      .user-stats {
        display: flex;
        justify-content: space-around;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        .stat-item {
          text-align: center;

          .stat-label {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .stat-value {
            display: block;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }
      }
    }
  }
}

.quick-actions-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .action-btn {
      width: 100%;
      justify-content: flex-start;
    }
  }
}

.detail-card {
  .profile-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }

    :deep(.el-tabs__item) {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .profile-form,
  .password-form {
    max-width: 600px;
  }

  .history-section {
    .history-filters {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }

    .history-table {
      margin-bottom: 20px;

      .description-cell {
        line-height: 1.5;
        color: #606266;
      }

      .ip-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #606266;

        .el-icon {
          color: #909399;
        }
      }

      .time-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #606266;

        .el-icon {
          color: #909399;
        }
      }
    }

    .history-pagination {
      display: flex;
      justify-content: center;
    }
  }
}

.avatar-dialog {
  .avatar-upload {
    text-align: center;

    .avatar-uploader {
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 120px;
        height: 120px;
        line-height: 120px;
        text-align: center;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
        }
      }

      .avatar-preview {
        width: 120px;
        height: 120px;
        border-radius: 6px;
        object-fit: cover;
      }
    }

    .upload-tips {
      margin-top: 12px;
      color: #999;
      font-size: 12px;

      p {
        margin: 4px 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .el-col {
    margin-bottom: 16px;
  }

  .profile-header {
    .user-stats {
      flex-direction: column;
      gap: 12px;
    }
  }
}

// ========== 对话框头部样式 ==========
.avatar-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .header-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      flex-shrink: 0;
    }

    .header-content {
      flex: 1;
      color: white;

      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 13px;
        opacity: 0.9;
      }
    }
  }
}

// ========== 图片裁剪器样式 ==========
.avatar-cropper-container {
  .upload-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 450px;
    padding: 20px;

    .upload-welcome-tip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      border-radius: 12px;
      border: 1px solid #c7d2fe;
      color: #4338ca;
      font-size: 14px;
      line-height: 1.6;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);

      .tip-icon {
        font-size: 20px;
        color: #667eea;
        flex-shrink: 0;
      }
    }

    .avatar-uploader {
      width: 100%;
      flex: 1;

      :deep(.el-upload) {
        width: 100%;
        height: 100%;

        .el-upload-dragger {
          width: 100%;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3px dashed #d9d9d9;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            z-index: 0;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.4s;
          }

          &:hover {
            border-color: #667eea;
            background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);

            &::before {
              opacity: 1;
            }

            .upload-icon-wrapper {
              transform: scale(1.1);

              .upload-icon-bg {
                transform: scale(1.3);
                opacity: 0.3;
              }
            }
          }

          .upload-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            position: relative;
            z-index: 10;

            .upload-icon-wrapper {
              position: relative;
              width: 100px;
              height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 11;

              .upload-icon {
                font-size: 56px;
                color: #667eea;
                position: relative;
                z-index: 12;
                filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.4));
              }

              .upload-icon-bg {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                opacity: 0.15;
                z-index: 11;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              }
            }

            .upload-text {
              text-align: center;
              position: relative;
              z-index: 10;

              h4 {
                margin: 0 0 12px 0;
                font-size: 20px;
                font-weight: 600;
                color: #303133;
                letter-spacing: 0.5px;
              }

              .upload-desc {
                margin: 0 0 24px 0;
                color: #909399;
                font-size: 14px;
                line-height: 1.6;
              }

              .upload-tips-box {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 20px 28px;
                background: white;
                border-radius: 12px;
                box-shadow:
                  0 2px 8px rgba(0, 0, 0, 0.04),
                  inset 0 0 0 1px rgba(102, 126, 234, 0.1);
                min-width: 300px;

                .tip-item {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  color: #606266;
                  font-size: 14px;
                  line-height: 1.5;

                  .el-icon {
                    color: #667eea;
                    font-size: 18px;
                    flex-shrink: 0;
                  }

                  span {
                    flex: 1;
                    text-align: left;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .cropper-area {
    padding: 20px;

    .cropper-main {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .cropper-preview-box {
      .cropper-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;

        .el-icon {
          color: #667eea;
        }

        .title-tips {
          margin-left: auto;
          font-size: 12px;
          font-weight: normal;
          color: #909399;
        }
      }

      .cropper-canvas-wrapper {
        position: relative;
        cursor: move;
        user-select: none;
        border: 4px solid #667eea;
        border-radius: 50%; // 🔵 圆形容器
        overflow: hidden;
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.08),
          inset 0 0 0 2px rgba(255, 255, 255, 0.5);
        transition: all 0.3s;
        margin: 0 auto;
        width: 200px;
        height: 200px;
        background: #f5f7fa;

        &:hover {
          border-color: #5a67d8;
          box-shadow:
            0 6px 24px rgba(102, 126, 234, 0.3),
            inset 0 0 0 2px rgba(255, 255, 255, 0.8);
          transform: scale(1.02);
        }

        &:active {
          cursor: grabbing;
          transform: scale(0.98);
        }

        .cropper-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .cropper-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;

          // 🔵 圆形虚线引导线
          &::before {
            content: '';
            position: absolute;
            width: 90%;
            height: 90%;
            border: 2px dashed rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            box-sizing: border-box;
            animation: rotate-dash 20s linear infinite;
          }

          @keyframes rotate-dash {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          // 圆形边界上的装饰点（上下左右四个方向）
          .mask-corner {
            position: absolute;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow:
              0 2px 8px rgba(102, 126, 234, 0.4),
              0 0 0 2px rgba(102, 126, 234, 0.2);
            z-index: 10;
            animation: pulse-dot 2s ease-in-out infinite;

            &.top-left {
              top: 5%;
              left: 50%;
              transform: translate(-50%, -50%);
            }

            &.top-right {
              top: 50%;
              right: 5%;
              transform: translate(50%, -50%);
            }

            &.bottom-left {
              bottom: 5%;
              left: 50%;
              transform: translate(-50%, 50%);
            }

            &.bottom-right {
              top: 50%;
              left: 5%;
              transform: translate(-50%, -50%);
            }
          }

          @keyframes pulse-dot {

            0%,
            100% {
              box-shadow:
                0 2px 8px rgba(102, 126, 234, 0.4),
                0 0 0 2px rgba(102, 126, 234, 0.2);
            }

            50% {
              box-shadow:
                0 4px 16px rgba(102, 126, 234, 0.6),
                0 0 0 4px rgba(102, 126, 234, 0.4);
            }
          }
        }

      }

      // 操作提示（移到圆圈外下方）
      .cropper-guide-external {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
        border-radius: 12px;
        border: 1px solid #c7d2fe;

        .el-icon {
          font-size: 20px;
          color: #667eea;
          flex-shrink: 0;
        }

        .guide-content {
          display: flex;
          flex-direction: column;
          gap: 6px;

          span {
            font-size: 13px;
            color: #4338ca;
            line-height: 1.5;
          }
        }
      }
    }

    .cropper-controls {
      .control-section {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 16px;

          .el-icon {
            color: #667eea;
          }
        }

        .scale-control {
          margin-bottom: 20px;

          .control-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .control-label {
              font-size: 14px;
              color: #606266;
              font-weight: 500;
            }

            .control-value {
              font-size: 14px;
              color: #667eea;
              font-weight: 600;
              background: white;
              padding: 4px 12px;
              border-radius: 6px;
            }
          }

          :deep(.el-slider__runway) {
            height: 6px;
          }

          :deep(.el-slider__bar) {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          }

          :deep(.el-slider__button) {
            width: 16px;
            height: 16px;
            border: 3px solid #667eea;
          }
        }

        .control-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;

          .control-btn {
            height: 40px;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;

            &:not(.reselect-btn) {
              background: white;
              border-color: #e4e7ed;
              color: #606266;

              &:hover {
                background: #667eea;
                border-color: #667eea;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              }
            }

            &.reselect-btn {
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
              }
            }

            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}

// 底部按钮样式
.avatar-dialog {
  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .footer-btn {
      min-width: 120px;
      height: 44px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s;

      .el-icon {
        margin-right: 6px;
      }

      &.cancel-btn {
        background: white;
        border-color: #dcdfe6;
        color: #606266;

        &:hover {
          background: #f5f7fa;
          border-color: #c0c4cc;
          transform: translateY(-2px);
        }
      }

      &.confirm-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
