<template>
  <div class="system-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <el-icon class="header-icon">
              <Setting />
            </el-icon>
          </div>
          <div class="title-text">
            <h1>系统设置</h1>
            <p class="title-desc">配置系统参数和功能设置</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <el-row :gutter="24">
        <!-- 左侧：设置分类 -->
        <el-col :span="6">
          <el-card class="settings-nav-card" shadow="hover">
            <div class="settings-nav">
              <div 
                v-for="category in settingsCategories" 
                :key="category.key"
                :class="['nav-item', { active: activeCategory === category.key }]"
                @click="activeCategory = category.key"
              >
                <el-icon class="nav-icon">
                  <component :is="category.icon" />
                </el-icon>
                <span class="nav-label">{{ category.label }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：设置内容 -->
        <el-col :span="18">
          <el-card class="settings-content-card" shadow="hover">
            <!-- 基础设置 -->
            <div v-show="activeCategory === 'basic'" class="settings-section">
              <div class="section-header">
                <h3>基础设置</h3>
                <p>配置系统的基本参数</p>
              </div>

              <el-form :model="basicSettings" :rules="basicRules" ref="basicFormRef" label-width="120px">
                <el-form-item label="系统名称" prop="systemName">
                  <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
                </el-form-item>

                <el-form-item label="系统版本" prop="systemVersion">
                  <el-input v-model="basicSettings.systemVersion" disabled />
                </el-form-item>

                <el-form-item label="管理员邮箱" prop="adminEmail">
                  <el-input v-model="basicSettings.adminEmail" placeholder="请输入管理员邮箱" />
                </el-form-item>

                <el-form-item label="系统描述" prop="systemDescription">
                  <el-input 
                    v-model="basicSettings.systemDescription" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入系统描述"
                  />
                </el-form-item>

                <el-form-item label="时区设置" prop="timezone">
                  <el-select v-model="basicSettings.timezone" placeholder="请选择时区">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                    <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                  </el-select>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveBasicSettings" :loading="basicLoading">
                    保存设置
                  </el-button>
                  <el-button @click="resetBasicSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-show="activeCategory === 'security'" class="settings-section">
              <div class="section-header">
                <h3>安全设置</h3>
                <p>配置系统安全相关参数</p>
              </div>

              <el-form :model="securitySettings" :rules="securityRules" ref="securityFormRef" label-width="120px">
                <el-form-item label="密码策略" prop="passwordPolicy">
                  <el-checkbox-group v-model="securitySettings.passwordPolicy">
                    <el-checkbox label="requireUppercase">必须包含大写字母</el-checkbox>
                    <el-checkbox label="requireLowercase">必须包含小写字母</el-checkbox>
                    <el-checkbox label="requireNumbers">必须包含数字</el-checkbox>
                    <el-checkbox label="requireSymbols">必须包含特殊字符</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="密码最小长度" prop="minPasswordLength">
                  <el-input-number 
                    v-model="securitySettings.minPasswordLength" 
                    :min="6" 
                    :max="20"
                    controls-position="right"
                  />
                </el-form-item>

                <el-form-item label="登录失败锁定" prop="loginLockout">
                  <el-switch v-model="securitySettings.loginLockout" />
                  <span class="form-tip">启用后，连续登录失败将锁定账户</span>
                </el-form-item>

                <el-form-item label="最大失败次数" prop="maxFailedAttempts" v-if="securitySettings.loginLockout">
                  <el-input-number 
                    v-model="securitySettings.maxFailedAttempts" 
                    :min="3" 
                    :max="10"
                    controls-position="right"
                  />
                </el-form-item>

                <el-form-item label="会话超时时间" prop="sessionTimeout">
                  <el-input-number 
                    v-model="securitySettings.sessionTimeout" 
                    :min="30" 
                    :max="480"
                    controls-position="right"
                  />
                  <span class="form-tip">分钟</span>
                </el-form-item>

                <el-form-item label="IP白名单" prop="ipWhitelist">
                  <el-input 
                    v-model="securitySettings.ipWhitelist" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入IP地址，每行一个"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveSecuritySettings" :loading="securityLoading">
                    保存设置
                  </el-button>
                  <el-button @click="resetSecuritySettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 通知设置 -->
            <div v-show="activeCategory === 'notification'" class="settings-section">
              <div class="section-header">
                <h3>通知设置</h3>
                <p>配置系统通知相关参数</p>
              </div>

              <el-form :model="notificationSettings" :rules="notificationRules" ref="notificationFormRef" label-width="120px">
                <el-form-item label="邮件通知" prop="emailNotification">
                  <el-switch v-model="notificationSettings.emailNotification" />
                </el-form-item>

                <el-form-item label="SMTP服务器" prop="smtpServer" v-if="notificationSettings.emailNotification">
                  <el-input v-model="notificationSettings.smtpServer" placeholder="请输入SMTP服务器地址" />
                </el-form-item>

                <el-form-item label="SMTP端口" prop="smtpPort" v-if="notificationSettings.emailNotification">
                  <el-input-number 
                    v-model="notificationSettings.smtpPort" 
                    :min="1" 
                    :max="65535"
                    controls-position="right"
                  />
                </el-form-item>

                <el-form-item label="发送邮箱" prop="senderEmail" v-if="notificationSettings.emailNotification">
                  <el-input v-model="notificationSettings.senderEmail" placeholder="请输入发送邮箱" />
                </el-form-item>

                <el-form-item label="邮箱密码" prop="senderPassword" v-if="notificationSettings.emailNotification">
                  <el-input 
                    v-model="notificationSettings.senderPassword" 
                    type="password" 
                    placeholder="请输入邮箱密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="短信通知" prop="smsNotification">
                  <el-switch v-model="notificationSettings.smsNotification" />
                </el-form-item>

                <el-form-item label="短信服务商" prop="smsProvider" v-if="notificationSettings.smsNotification">
                  <el-select v-model="notificationSettings.smsProvider" placeholder="请选择短信服务商">
                    <el-option label="阿里云短信" value="aliyun" />
                    <el-option label="腾讯云短信" value="tencent" />
                    <el-option label="华为云短信" value="huawei" />
                  </el-select>
                </el-form-item>

                <el-form-item label="通知类型" prop="notificationTypes">
                  <el-checkbox-group v-model="notificationSettings.notificationTypes">
                    <el-checkbox label="system">系统通知</el-checkbox>
                    <el-checkbox label="security">安全通知</el-checkbox>
                    <el-checkbox label="violation">违规通知</el-checkbox>
                    <el-checkbox label="maintenance">维护通知</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveNotificationSettings" :loading="notificationLoading">
                    保存设置
                  </el-button>
                  <el-button @click="resetNotificationSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 违规设置 -->
            <div v-show="activeCategory === 'violation'" class="settings-section">
              <div class="section-header">
                <h3>违规设置</h3>
                <p>配置违规处理相关参数</p>
              </div>

              <el-form :model="violationSettings" :rules="violationRules" ref="violationFormRef" label-width="120px">
                <el-form-item label="自动拉黑" prop="autoBlacklist">
                  <el-switch v-model="violationSettings.autoBlacklist" />
                  <span class="form-tip">启用后，达到违规次数阈值将自动拉黑</span>
                </el-form-item>

                <el-form-item label="违规次数阈值" prop="violationThreshold">
                  <el-input-number 
                    v-model="violationSettings.violationThreshold" 
                    :min="1" 
                    :max="20"
                    controls-position="right"
                  />
                </el-form-item>

                <el-form-item label="拉黑有效期" prop="blacklistDuration">
                  <el-input-number 
                    v-model="violationSettings.blacklistDuration" 
                    :min="1" 
                    :max="365"
                    controls-position="right"
                  />
                  <span class="form-tip">天（0表示永久拉黑）</span>
                </el-form-item>

                <el-form-item label="违规处理方式" prop="violationProcessType">
                  <el-radio-group v-model="violationSettings.violationProcessType">
                    <el-radio label="auto">自动处理</el-radio>
                    <el-radio label="manual">手动处理</el-radio>
                    <el-radio label="hybrid">混合模式</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="违规通知" prop="violationNotification">
                  <el-switch v-model="violationSettings.violationNotification" />
                </el-form-item>

                <el-form-item label="违规记录保留" prop="violationRetention">
                  <el-input-number 
                    v-model="violationSettings.violationRetention" 
                    :min="30" 
                    :max="3650"
                    controls-position="right"
                  />
                  <span class="form-tip">天</span>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveViolationSettings" :loading="violationLoading">
                    保存设置
                  </el-button>
                  <el-button @click="resetViolationSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 系统维护 -->
            <div v-show="activeCategory === 'maintenance'" class="settings-section">
              <div class="section-header">
                <h3>系统维护</h3>
                <p>系统维护和清理操作</p>
              </div>

              <div class="maintenance-actions">
                <el-card class="action-card" shadow="hover">
                  <div class="action-header">
                    <el-icon class="action-icon"><Delete /></el-icon>
                    <h4>数据清理</h4>
                  </div>
                  <p>清理过期的日志和临时数据</p>
                  <el-button type="warning" @click="cleanExpiredData" :loading="cleanLoading">
                    开始清理
                  </el-button>
                </el-card>

                <el-card class="action-card" shadow="hover">
                  <div class="action-header">
                    <el-icon class="action-icon"><Download /></el-icon>
                    <h4>数据备份</h4>
                  </div>
                  <p>备份系统数据和配置</p>
                  <el-button type="primary" @click="backupData" :loading="backupLoading">
                    开始备份
                  </el-button>
                </el-card>

                <el-card class="action-card" shadow="hover">
                  <div class="action-header">
                    <el-icon class="action-icon"><Refresh /></el-icon>
                    <h4>缓存清理</h4>
                  </div>
                  <p>清理系统缓存，提高性能</p>
                  <el-button type="info" @click="clearCache" :loading="cacheLoading">
                    清理缓存
                  </el-button>
                </el-card>

                <el-card class="action-card" shadow="hover">
                  <div class="action-header">
                    <el-icon class="action-icon"><Warning /></el-icon>
                    <h4>系统重启</h4>
                  </div>
                  <p>重启系统服务（谨慎操作）</p>
                  <el-button type="danger" @click="restartSystem" :loading="restartLoading">
                    重启系统
                  </el-button>
                </el-card>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Setting, User, Bell, WarningFilled, Tools, 
  Delete, Download, Refresh, Warning 
} from '@element-plus/icons-vue';

// 响应式数据
const activeCategory = ref('basic');
const basicLoading = ref(false);
const securityLoading = ref(false);
const notificationLoading = ref(false);
const violationLoading = ref(false);
const cleanLoading = ref(false);
const backupLoading = ref(false);
const cacheLoading = ref(false);
const restartLoading = ref(false);

// 设置分类
const settingsCategories = [
  { key: 'basic', label: '基础设置', icon: 'Setting' },
  { key: 'security', label: '安全设置', icon: 'User' },
  { key: 'notification', label: '通知设置', icon: 'Bell' },
  { key: 'violation', label: '违规设置', icon: 'WarningFilled' },
  { key: 'maintenance', label: '系统维护', icon: 'Tools' }
];

// 基础设置
const basicSettings = reactive({
  systemName: '雪人停车管理系统',
  systemVersion: 'v1.0.0',
  adminEmail: 'admin@example.com',
  systemDescription: '智慧停车管理系统，提供车辆管理、违规处理、数据分析等功能',
  timezone: 'Asia/Shanghai'
});

const basicFormRef = ref(null);
const basicRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  adminEmail: [
    { required: true, message: '请输入管理员邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

// 安全设置
const securitySettings = reactive({
  passwordPolicy: ['requireUppercase', 'requireLowercase', 'requireNumbers'],
  minPasswordLength: 8,
  loginLockout: true,
  maxFailedAttempts: 5,
  sessionTimeout: 120,
  ipWhitelist: ''
});

const securityFormRef = ref(null);
const securityRules = {
  minPasswordLength: [
    { required: true, message: '请设置密码最小长度', trigger: 'blur' }
  ],
  maxFailedAttempts: [
    { required: true, message: '请设置最大失败次数', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请设置会话超时时间', trigger: 'blur' }
  ]
};

// 通知设置
const notificationSettings = reactive({
  emailNotification: true,
  smtpServer: 'smtp.example.com',
  smtpPort: 587,
  senderEmail: 'noreply@example.com',
  senderPassword: '',
  smsNotification: false,
  smsProvider: 'aliyun',
  notificationTypes: ['system', 'security', 'violation']
});

const notificationFormRef = ref(null);
const notificationRules = {
  smtpServer: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发送邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

// 违规设置
const violationSettings = reactive({
  autoBlacklist: true,
  violationThreshold: 5,
  blacklistDuration: 30,
  violationProcessType: 'hybrid',
  violationNotification: true,
  violationRetention: 365
});

const violationFormRef = ref(null);
const violationRules = {
  violationThreshold: [
    { required: true, message: '请设置违规次数阈值', trigger: 'blur' }
  ],
  blacklistDuration: [
    { required: true, message: '请设置拉黑有效期', trigger: 'blur' }
  ]
};

// 方法
const saveBasicSettings = async () => {
  try {
    await basicFormRef.value.validate();
    basicLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('基础设置保存成功');
  } catch (error) {
    console.error('保存基础设置失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    basicLoading.value = false;
  }
};

const resetBasicSettings = () => {
  Object.assign(basicSettings, {
    systemName: '雪人停车管理系统',
    systemVersion: 'v1.0.0',
    adminEmail: 'admin@example.com',
    systemDescription: '智慧停车管理系统，提供车辆管理、违规处理、数据分析等功能',
    timezone: 'Asia/Shanghai'
  });
};

const saveSecuritySettings = async () => {
  try {
    await securityFormRef.value.validate();
    securityLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('安全设置保存成功');
  } catch (error) {
    console.error('保存安全设置失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    securityLoading.value = false;
  }
};

const resetSecuritySettings = () => {
  Object.assign(securitySettings, {
    passwordPolicy: ['requireUppercase', 'requireLowercase', 'requireNumbers'],
    minPasswordLength: 8,
    loginLockout: true,
    maxFailedAttempts: 5,
    sessionTimeout: 120,
    ipWhitelist: ''
  });
};

const saveNotificationSettings = async () => {
  try {
    await notificationFormRef.value.validate();
    notificationLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('通知设置保存成功');
  } catch (error) {
    console.error('保存通知设置失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    notificationLoading.value = false;
  }
};

const resetNotificationSettings = () => {
  Object.assign(notificationSettings, {
    emailNotification: true,
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    senderEmail: 'noreply@example.com',
    senderPassword: '',
    smsNotification: false,
    smsProvider: 'aliyun',
    notificationTypes: ['system', 'security', 'violation']
  });
};

const saveViolationSettings = async () => {
  try {
    await violationFormRef.value.validate();
    violationLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('违规设置保存成功');
  } catch (error) {
    console.error('保存违规设置失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    violationLoading.value = false;
  }
};

const resetViolationSettings = () => {
  Object.assign(violationSettings, {
    autoBlacklist: true,
    violationThreshold: 5,
    blacklistDuration: 30,
    violationProcessType: 'hybrid',
    violationNotification: true,
    violationRetention: 365
  });
};

// 维护操作
const cleanExpiredData = async () => {
  try {
    await ElMessageBox.confirm('确定要清理过期数据吗？此操作不可恢复。', '确认清理', {
      type: 'warning'
    });
    
    cleanLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    ElMessage.success('数据清理完成');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('数据清理失败:', error);
      ElMessage.error('数据清理失败');
    }
  } finally {
    cleanLoading.value = false;
  }
};

const backupData = async () => {
  try {
    backupLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    ElMessage.success('数据备份完成');
  } catch (error) {
    console.error('数据备份失败:', error);
    ElMessage.error('数据备份失败');
  } finally {
    backupLoading.value = false;
  }
};

const clearCache = async () => {
  try {
    cacheLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('缓存清理完成');
  } catch (error) {
    console.error('缓存清理失败:', error);
    ElMessage.error('缓存清理失败');
  } finally {
    cacheLoading.value = false;
  }
};

const restartSystem = async () => {
  try {
    await ElMessageBox.confirm('确定要重启系统吗？这将中断所有用户会话。', '确认重启', {
      type: 'warning'
    });
    
    restartLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    ElMessage.success('系统重启中，请稍候...');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('系统重启失败:', error);
      ElMessage.error('系统重启失败');
    }
  } finally {
    restartLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  // 加载设置数据
  console.log('系统设置页面已加载');
});
</script>

<style lang="scss" scoped>
.system-settings {
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
  max-width: 1400px;
  margin: 0 auto;
}

.settings-nav-card {
  .settings-nav {
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;

      &:hover {
        background: #f0f9ff;
        color: #1890ff;
      }

      &.active {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
      }

      .nav-icon {
        font-size: 18px;
      }

      .nav-label {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.settings-content-card {
  .settings-section {
    .section-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }

    .form-tip {
      margin-left: 8px;
      font-size: 12px;
      color: #999;
    }

    .maintenance-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .action-card {
        text-align: center;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .action-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;

          .action-icon {
            font-size: 24px;
            color: #1890ff;
          }

          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }

        p {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
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

  .maintenance-actions {
    grid-template-columns: 1fr !important;
  }
}
</style>
