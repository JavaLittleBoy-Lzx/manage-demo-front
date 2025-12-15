<template>
  <div class="staff-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <el-icon size="24" color="#409EFF">
              <UserFilled />
            </el-icon>
          </div>
          <div class="title-text">
            <h1>巡检人员管理</h1>
            <p class="title-desc">管理停车场巡检人员信息和权限</p>
          </div>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd" class="action-btn">
            新增人员
          </el-button>
          <el-button icon="Download" @click="handleExport" class="action-btn">
            导出数据
          </el-button>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 搜索面板 -->
      <div class="search-panel">
        <div class="search-panel-header" @click="toggleSearchPanel">
          <div class="search-title">
            <el-icon>
              <Search />
            </el-icon>
            <span>搜索条件</span>
            <el-icon :class="['toggle-icon', { 'expanded': searchPanelExpanded }]">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="searchPanelExpanded" class="search-panel-body">
            <el-form :inline="true" :model="query" class="search-form" label-width="80px">
              <div class="search-row">
                <el-form-item label="用户名" class="search-item">
                  <el-input v-model="query.username" placeholder="请输入用户名" clearable class="search-input"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" class="search-item">
                  <el-input v-model="query.realName" placeholder="请输入真实姓名" clearable class="search-input"></el-input>
                </el-form-item>
                <!-- 🔐 车场名称筛选：根据权限显示车场列表 -->
                <el-form-item label="车场名称" class="search-item">
                  <el-select v-model="query.parkName" placeholder="请选择车场" clearable class="search-select" filterable>
                    <el-option
                      v-for="yard in filteredYardList"
                      :key="yard.id"
                      :label="yard.yardName"
                      :value="yard.yardName"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="状态" class="search-item">
                  <el-select v-model="query.status" placeholder="请选择状态" clearable class="search-select">
                    <el-option label="正常" value="1"></el-option>
                    <el-option label="禁用" value="0"></el-option>
                  </el-select>
                </el-form-item>
                <div class="search-actions">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small" class="search-btn">
                    搜索
                  </el-button>
                  <el-button icon="Refresh" @click="handleReset" size="small" class="search-btn">
                    重置
                  </el-button>
                </div>
              </div>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 人员列表 -->
      <div class="table-panel">
        <div class="table-panel-header">
          <div class="table-title">
            <el-icon>
              <User />
            </el-icon>
            <span>人员列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>
        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable" :row-class-name="tableRowClassName"
            stripe v-loading="loading" @selection-change="handleSelectionChange" height="430">

            <!-- 选择列 -->
            <el-table-column type="selection" width="55" align="center"></el-table-column>

            <!-- 人员信息列 -->
            <el-table-column label="人员信息" width="200" fixed="left">
              <template #default="{ row }">
                <div class="staff-info-cell">
                  <div class="staff-avatar">
                    {{ row.realName?.charAt(0) || row.username?.charAt(0) || '员' }}
                  </div>
                  <div class="staff-details">
                    <div class="staff-name">{{ row.realName }}</div>
                    <div class="staff-username">@{{ row.username }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 联系方式列 -->
            <el-table-column label="联系方式" width="180">
              <template #default="{ row }">
                <div class="contact-info-cell">
                  <div class="contact-item" v-if="row.phone">
                    <el-icon>
                      <Phone />
                    </el-icon>
                    <span>{{ row.phone }}</span>
                  </div>
                  <div class="contact-item" v-if="row.email">
                    <el-icon>
                      <Message />
                    </el-icon>
                    <span>{{ row.email }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 车场信息列 -->
            <el-table-column label="车场信息" width="180" prop="parkName">
              <template #default="{ row }">
                <div class="park-info">
                  <div class="park-name">{{ row.parkName || '未分配' }}</div>
                  <div class="position">{{ row.position || '巡检员' }}</div>
                </div>
              </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column label="状态" width="280" align="center">
              <template #default="{ row }">
                <div class="status-info-wrapper">
                  <div class="status-switch-wrapper">
                    <el-switch 
                      v-model="row.status" 
                      :active-value="1" 
                      :inactive-value="0" 
                      active-text="正常"
                      inactive-text="禁用" 
                      @change="handleStatusChange(row)" 
                      :loading="row.statusLoading"
                      class="status-switch"
                      size="default"
                    />
                  </div>
             <!-- 锁定状态提示（只有当锁定时间未过期时才显示） -->
             <div v-if="row.lockTime && getRemainingLockTime(row.lockTime) > 0" class="lock-status-tip">
               <el-tag type="warning" size="small" effect="plain">
                 <el-icon><Lock /></el-icon>
                 账户已锁定
               </el-tag>
             </div>
                  <!-- 禁用原因提示 -->
                  <div v-if="row.status === 0 && row.disableReason" class="disable-reason-tip">
                    <el-tooltip :content="row.disableReason" placement="top">
                      <el-tag type="danger" size="small" effect="plain">
                        <el-icon><Warning /></el-icon>
                        已禁用：{{ row.disableReason.length > 10 ? row.disableReason.substring(0, 10) + '...' : row.disableReason }}
                      </el-tag>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 最后登录列 -->
            <el-table-column label="最后登录" width="240">
              <template #default="{ row }">
                <div class="login-info">
                  <div class="login-time" v-if="row.lastLoginTime">
                    {{ formatDateTime(row.lastLoginTime) }}
                  </div>
                  <div class="login-ip" v-if="row.lastLoginIp">
                    IP: {{ row.lastLoginIp }}
                  </div>
                  <div class="no-login" v-if="!row.lastLoginTime">
                    未登录
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 禁用/锁定信息列 -->
            <el-table-column label="禁用/锁定信息" width="280" align="center">
              <template #default="{ row }">
                <div class="disable-lock-info">
                  <!-- 禁用信息 -->
                  <div v-if="row.status === 0" class="disable-info">
                    <el-tag type="danger" size="small" effect="plain" class="info-tag">
                      <el-icon><Warning /></el-icon>
                      已禁用
                    </el-tag>
                    <div v-if="row.disableReason" class="disable-reason-text">
                      <el-tooltip :content="row.disableReason" placement="top">
                        <span class="reason-text">原因：{{ row.disableReason.length > 15 ? row.disableReason.substring(0, 15) + '...' : row.disableReason }}</span>
                      </el-tooltip>
                    </div>
                    <div v-if="row.disableTime" class="disable-time-text">
                      {{ formatDateTime(row.disableTime) }}
                    </div>
                  </div>
                  
                  <!-- 锁定信息 -->
                  <div v-if="row.lockTime" class="lock-info">
                    <!-- 只有当锁定时间未过期时才显示"账户已锁定"标签 -->
                    <el-tag v-if="getRemainingLockTime(row.lockTime) > 0" type="warning" size="small" effect="plain" class="info-tag">
                      <el-icon><Lock /></el-icon>
                      账户已锁定
                    </el-tag>
                    <!-- 锁定次数 -->
                    <div v-if="row.lockCount && row.lockCount > 0" class="lock-count-text">
                      <el-tag type="warning" size="small" effect="plain">
                        累计锁定 {{ row.lockCount }} 次
                      </el-tag>
                    </div>
                    <div class="lock-time-text">
                      {{ formatDateTime(row.lockTime) }}
                    </div>
                    <div class="lock-remaining-text">
                      <span v-if="getRemainingLockTime(row.lockTime) > 0">
                        剩余 {{ getRemainingLockTime(row.lockTime) }} 分钟
                      </span>
                      <span v-else style="color: #67C23A;">
                        锁定已解除
                      </span>
                    </div>
                  </div>
                  
                  <!-- 失败登录次数 -->
                  <div v-if="row.failedLoginCount && row.failedLoginCount > 0 && !row.lockTime" class="failed-login-info">
                    <el-tag type="info" size="small" effect="plain" class="info-tag">
                      失败 {{ row.failedLoginCount }} 次
                    </el-tag>
                  </div>
                  
                  <!-- 仅显示锁定次数（无当前锁定状态） -->
                  <div v-if="!row.lockTime && row.lockCount && row.lockCount > 0" class="lock-count-only-info">
                    <el-tag type="warning" size="small" effect="plain" class="info-tag">
                      累计锁定 {{ row.lockCount }} 次
                    </el-tag>
                  </div>
                  
                  <!-- 无禁用/锁定信息 -->
                  <div v-if="row.status === 1 && !row.lockTime && (!row.failedLoginCount || row.failedLoginCount === 0) && (!row.lockCount || row.lockCount === 0)" class="no-info">
                    <span style="color: #909399; font-size: 12px;">正常</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 创建时间列 -->
            <el-table-column label="创建时间" width="180" prop="createdTime">
              <template #default="{ row }">
                {{ formatDateTime(row.createdTime) }}
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" icon="Edit" @click="handleEdit(row)" class="action-btn">
                    编辑
                  </el-button>
                  <el-dropdown @command="(command) => handleAction(command, row)" class="action-dropdown">
                    <el-button type="info" size="small" icon="More" class="action-btn"></el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="resetPassword" icon="Key">重置密码</el-dropdown-item>
                        <el-dropdown-item command="view" icon="View">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" icon="Delete" class="danger-item">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-actions">
            <div class="batch-info">
              已选择 {{ selectedRows.length }} 项
            </div>
            <div class="batch-buttons">
              <el-button type="danger" icon="Delete" @click="handleBatchDelete" size="small">
                批量删除
              </el-button>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="pageTotal" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" class="modern-pagination" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑人员' : '新增人员'" width="600px" :close-on-click-modal="false"
      class="modern-dialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="staff-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="!isEdit">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车场名称" prop="parkName">
              <!-- 🔐 只显示用户有权限的车场 -->
              <el-select v-model="formData.parkName" placeholder="请选择车场" style="width: 100%" filterable clearable>
                <el-option
                  v-for="yard in filteredYardList"
                  :key="yard.id"
                  :label="yard.yardName"
                  :value="yard.yardName"
                />
              </el-select>
              <div v-if="!isAdmin && managedParks && managedParks.length > 0" style="color: #909399; font-size: 12px; margin-top: 5px;">
                ℹ️ 您只能为授权车场添加人员
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-select v-model="formData.position" placeholder="请选择职位" style="width: 100%">
                <el-option label="巡检员" value="巡检员"></el-option>
                <el-option label="主管" value="主管"></el-option>
                <el-option label="经理" value="经理"></el-option>
                <el-option label="管理员" value="管理员"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更 新' : '创 建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPasswordVisible" title="重置密码" width="400px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleResetPasswordSubmit" :loading="resetPasswordLoading">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Download,
  Edit,
  More,
  Key,
  View,
  Delete,
  Refresh,
  Lock,
  Warning
} from '@element-plus/icons-vue'
import {
  getStaffList,
  addStaff,
  updateStaff,
  deleteStaff,
  batchDeleteStaff,
  updateStaffStatus,
  resetPassword,
  checkUsername,
  exportStaffData,
  getYardList
} from '@/api/parkStaff'
import activityLogger from '@/utils/activityLogger'
// 🔐 导入车场权限管理工具
import { getManagedParks, isAdmin as checkIsAdmin } from '@/utils/parkAuth'

export default {
  name: 'StaffManagement',
  components: {
    Search
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const searchPanelExpanded = ref(true)
    const dialogVisible = ref(false)
    const resetPasswordVisible = ref(false)
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const resetPasswordLoading = ref(false)

    // 列表数据
    const tableData = ref([])
    const selectedRows = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const pageTotal = ref(0)
    const yardList = ref([])

    // 🔐 车场权限相关
    const isAdmin = ref(checkIsAdmin())
    const managedParks = ref(getManagedParks() || [])
    
    // 调试信息
    console.log('🔐 车场权限信息:', {
      isAdmin: isAdmin.value,
      managedParks: managedParks.value,
      managedParksCount: managedParks.value.length
    })

    // 搜索表单
    const query = reactive({
      username: '',
      realName: '',
      parkName: '',
      status: ''
    })

    // 表单数据
    const formData = reactive({
      id: null,
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      phone: '',
      email: '',
      parkName: '',
      position: '巡检员',
      status: 1,
      remark: ''
    })

    // 重置密码表单
    const passwordForm = reactive({
      id: null,
      newPassword: '',
      confirmPassword: ''
    })

    // 表单验证规则
    const formRules = reactive({
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
        {
          validator: async (rule, value, callback) => {
            // 编辑模式下不验证用户名唯一性
            if (isEdit.value) {
              callback()
              return
            }
            
            // 用户名为空或长度不够时，由其他规则处理
            if (!value || value.length < 3) {
              callback()
              return
            }
            
            try {
              const response = await checkUsername(value, null)
              console.log('用户名检查响应:', response)
              console.log('响应数据结构:', {
                code: response.code,
                dataCode: response.data?.code,
                available: response.data?.available,
                fullResponse: response
              })
              
              // 尝试多种可能的响应格式
              const isAvailable = response.data?.available ?? 
                                 (response.data?.code === '0' && response.data?.data?.available) ??
                                 (response.code === '0' && response.data?.available)
              
              if (isAvailable === false) {
                callback(new Error('该用户名已被使用，请更换'))
              } else {
                callback()
              }
            } catch (error) {
              console.error('Check username error:', error)
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== formData.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' },
        { max: 20, message: '姓名长度不能超过 20 个字符', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      parkName: [
        { required: true, message: '请输入车场名称', trigger: 'blur' }
      ]
    })

    const passwordRules = reactive({
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    })

    // 引用
    const multipleTable = ref(null)
    const formRef = ref(null)
    const passwordFormRef = ref(null)

    // 计算属性
    const tableRowClassName = computed(() => {
      return ({ row, rowIndex }) => {
        if (rowIndex % 2 === 1) {
          return 'warning-row'
        }
        return ''
      }
    })

    // 🔐 根据用户权限构建车场列表
    const filteredYardList = computed(() => {
      console.log('🏗️ 计算 filteredYardList:', {
        isAdmin: isAdmin.value,
        totalYards: yardList.value.length,
        managedParks: managedParks.value
      })
      
      if (isAdmin.value) {
        // 管理员：显示后端返回的所有车场（完整信息）
        console.log('✅ 管理员模式：显示所有车场', yardList.value.length)
        return yardList.value
      } else {
        // 普通用户：直接使用本地存储的车场名称，无需查询后端
        console.log('🔐 非管理员模式：使用本地存储的车场', managedParks.value.length)
        // 将车场名称转换为下拉选项需要的格式
        const localParkList = managedParks.value.map((parkName, index) => ({
          id: `local-${index}`,
          yardName: parkName,
          yardCode: parkName // 使用相同值作为编码
        }))
        console.log('本地车场列表:', localParkList.map(y => y.yardName))
        return localParkList
      }
    })

    // 方法
    const toggleSearchPanel = () => {
      searchPanelExpanded.value = !searchPanelExpanded.value
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          ...query,
          page: currentPage.value,
          size: pageSize.value
        }
        const response = await getStaffList(params)
        console.log("response：",response.data.code)
        if (response.data.code === '0') {
          tableData.value = response.data.data.records || []
          pageTotal.value = response.data.data.total || 0
        } else {
          ElMessage.error(response.message || '获取数据失败')
        }
      } catch (error) {
        ElMessage.error('获取数据失败')
        console.error('Load data error:', error)
      } finally {
        loading.value = false
      }
    }

    const loadYardList = async () => {
      // 🔐 只有管理员才需要从后端加载车场列表
      if (!isAdmin.value) {
        console.log('🔐 非管理员用户：跳过车场列表查询，直接使用本地存储的车场')
        yardList.value = []
        return
      }

      try {
        const response = await getYardList()
        console.log("🚗 管理员查询车场列表响应：", response)
        if (Array.isArray(response)) {
          yardList.value = response.filter(yard => yard.deleted === 0)
        } else if (response.data && Array.isArray(response.data)) {
          yardList.value = response.data.filter(yard => yard.deleted === 0)
        } else {
          console.warn('车场列表数据格式异常:', response)
          yardList.value = []
        }
        console.log('✅ 管理员已加载车场列表:', yardList.value.length, '个车场')
        console.log('车场名称:', yardList.value.map(y => y.yardName))
      } catch (error) {
        console.error('获取车场列表失败:', error)
        ElMessage.error('获取车场列表失败')
        yardList.value = []
      }
    }

    const handleSearch = () => {
      // 记录查询操作日志（自动获取真实IP）
      const searchConditions = []
      if (query.username) searchConditions.push(`用户名: ${query.username}`)
      if (query.realName) searchConditions.push(`真实姓名: ${query.realName}`)
      if (query.parkName) searchConditions.push(`车场: ${query.parkName}`)
      if (query.status !== '') searchConditions.push(`状态: ${query.status === '1' ? '正常' : '禁用'}`)
      
      const searchDescription = searchConditions.length > 0 
        ? `查询巡检人员 (${searchConditions.join(', ')})` 
        : '查询所有巡检人员'
      
      activityLogger.logSuccess(
        '巡检人员管理',
        '查询',
        searchDescription
      ).catch(err => console.error('记录查询日志失败:', err))
      
      currentPage.value = 1
      loadData()
    }

    const handleReset = () => {
      Object.keys(query).forEach(key => {
        query[key] = ''
      })
      currentPage.value = 1
      loadData()
    }

    const handleAdd = () => {
      isEdit.value = false
      resetForm()
      loadYardList() // 加载车场列表
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      isEdit.value = true
      Object.keys(formData).forEach(key => {
        if (key in row && key !== 'password') {
          formData[key] = row[key]
        }
      })
      // 编辑模式下清空密码字段，因为后端不会返回密码
      formData.password = ''
      formData.confirmPassword = ''
      loadYardList() // 加载车场列表
      dialogVisible.value = true
    }

    const handleAction = (command, row) => {
      switch (command) {
        case 'resetPassword':
          handleResetPassword(row)
          break
        case 'view':
          handleView(row)
          break
        case 'delete':
          handleDelete(row)
          break
      }
    }

    const handleResetPassword = (row) => {
      passwordForm.id = row.id
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      resetPasswordVisible.value = true
    }

    const handleView = (row) => {
      // 构建锁定信息
      let lockInfo = ''
      if (row.lockTime) {
        const lockDate = new Date(row.lockTime)
        const now = new Date()
        const minutesLocked = Math.floor((now - lockDate) / (1000 * 60))
        const remainingMinutes = Math.max(0, 10 - minutesLocked)
        
        if (remainingMinutes > 0) {
          lockInfo = `<p style="color: #E6A23C;"><strong>账户锁定状态：</strong>已锁定，剩余 ${remainingMinutes} 分钟</p>`
        } else {
          lockInfo = '<p style="color: #67C23A;"><strong>账户锁定状态：</strong>锁定已解除</p>'
        }
      }
      
      // 构建禁用信息
      let disableInfo = ''
      if (row.status === 0) {
        disableInfo = `<p style="color: #F56C6C;"><strong>禁用状态：</strong>已禁用</p>`
        if (row.disableReason) {
          disableInfo += `<p style="color: #F56C6C;"><strong>禁用原因：</strong>${row.disableReason}</p>`
        }
        if (row.disableTime) {
          disableInfo += `<p style="color: #F56C6C;"><strong>禁用时间：</strong>${formatDateTime(row.disableTime)}</p>`
        }
      }
      
      // 构建失败登录次数信息
      let failedLoginInfo = ''
      if (row.failedLoginCount && row.failedLoginCount > 0) {
        failedLoginInfo = `<p><strong>登录失败次数：</strong>${row.failedLoginCount} 次</p>`
      }
      
      // 构建锁定次数信息
      let lockCountInfo = ''
      if (row.lockCount && row.lockCount > 0) {
        lockCountInfo = `<p><strong>累计锁定次数：</strong>${row.lockCount} 次</p>`
      }
      
      ElMessageBox.alert(
        `<div style="text-align: left;">
          <p><strong>用户名：</strong>${row.username}</p>
          <p><strong>真实姓名：</strong>${row.realName}</p>
          <p><strong>手机号码：</strong>${row.phone || '未填写'}</p>
          <p><strong>邮箱：</strong>${row.email || '未填写'}</p>
          <p><strong>车场名称：</strong>${row.parkName}</p>
          <p><strong>职位：</strong>${row.position}</p>
          <p><strong>状态：</strong>${row.status === 1 ? '正常' : '禁用'}</p>
          ${lockInfo}
          ${lockCountInfo}
          ${disableInfo}
          ${failedLoginInfo}
          <p><strong>最后登录时间：</strong>${row.lastLoginTime ? formatDateTime(row.lastLoginTime) : '未登录'}</p>
          <p><strong>最后登录IP：</strong>${row.lastLoginIp || '未知'}</p>
          <p><strong>创建时间：</strong>${formatDateTime(row.createdTime)}</p>
          <p><strong>备注：</strong>${row.remark || '无'}</p>
        </div>`,
        '人员详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除人员 "${row.realName}" 吗？此操作不可恢复！`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await deleteStaff(row.id)
        if (response.code === 200) {
          ElMessage.success('删除成功')
          
          // 记录删除日志（自动获取真实IP）
          activityLogger.logSuccess(
            '巡检人员管理',
            '删除',
            `删除巡检人员: ${row.realName} (@${row.username})`,
            row.id,
            'staff',
            row,
            null
          ).catch(err => console.error('记录删除日志失败:', err))
          
          loadData()
        } else {
          ElMessage.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
          console.error('Delete error:', error)
        }
      }
    }

    const handleStatusChange = async (row) => {
      const oldStatus = row.status === 1 ? 0 : 1
      let disableReason = ''
      
      // 如果是禁用操作，需要输入禁用原因
      if (row.status === 0) {
        try {
          const { value } = await ElMessageBox.prompt(
            '请输入禁用原因（可选）',
            '禁用人员',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'textarea',
              inputPlaceholder: '请输入禁用原因，例如：违反公司规定、长期未使用等',
              inputValidator: (value) => {
                // 允许为空，但如果有内容则限制长度
                if (value && value.length > 500) {
                  return '禁用原因不能超过500个字符'
                }
                return true
              }
            }
          )
          disableReason = value || ''
        } catch (error) {
          // 用户取消操作，恢复原状态
          row.status = oldStatus
          return
        }
      }
      
      row.statusLoading = true
      try {
        // 构建请求参数，包含禁用原因
        const requestData = {
          status: row.status
        }
        if (row.status === 0 && disableReason) {
          requestData.disableReason = disableReason
        }
        
        const response = await updateStaffStatus(row.id, requestData)
        console.log("response:",response)
        if (response.code === '0') {
          // 更新本地数据
          if (row.status === 0) {
            row.disableReason = disableReason
            row.disableTime = new Date().toISOString()
          } else {
            row.disableReason = null
            row.disableTime = null
          }
          
          ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}成功`)
          
          // 记录状态更改日志（自动获取真实IP）
          let description = `${row.status === 1 ? '启用' : '禁用'}巡检人员: ${row.realName} (@${row.username})`
          if (row.status === 0 && disableReason) {
            description += `，禁用原因：${disableReason}`
          }
          
          activityLogger.logSuccess(
            '巡检人员管理',
            '修改',
            description,
            row.id,
            'staff',
            { ...row, status: oldStatus }, // 旧状态
            { ...row, status: row.status } // 新状态
          ).catch(err => console.error('记录状态更改日志失败:', err))
        } else {
          // 恢复原状态
          row.status = oldStatus
          ElMessage.error(response.message || '状态更新失败')
        }
      } catch (error) {
        // 恢复原状态
        row.status = oldStatus
        ElMessage.error('状态更新失败')
        console.error('Status change error:', error)
      } finally {
        row.statusLoading = false
      }
    }

    const handleSelectionChange = (selection) => {
      selectedRows.value = selection
    }

    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedRows.value.length} 个人员吗？此操作不可恢复！`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = selectedRows.value.map(row => row.id)
        const response = await batchDeleteStaff(ids)
        if (response.code === 200) {
          ElMessage.success('批量删除成功')
          
          // 记录批量删除日志（自动获取真实IP）
          const deletedNames = selectedRows.value.map(row => row.realName).join(', ')
          activityLogger.logSuccess(
            '巡检人员管理',
            '删除',
            `批量删除巡检人员 (${selectedRows.value.length}人): ${deletedNames}`,
            null,
            'staff',
            selectedRows.value,
            null
          ).catch(err => console.error('记录批量删除日志失败:', err))
          
          selectedRows.value = []
          loadData()
        } else {
          ElMessage.error(response.message || '批量删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
          console.error('Batch delete error:', error)
        }
      }
    }

    const handleExport = async () => {
      try {
        const response = await exportStaffData(query)
        
        // 检查响应是否为 Blob（成功的文件）还是错误信息
        if (response instanceof Blob) {
          // 检查 Blob 是否是 JSON 错误响应
          if (response.type === 'application/json') {
            // 读取 Blob 内容作为 JSON
            const text = await response.text()
            const errorData = JSON.parse(text)
            ElMessage.error(errorData.message || '导出失败')
            return
          }
          
          // 处理文件下载（CSV格式）
          const blob = new Blob([response], { type: 'text/csv;charset=utf-8' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // 生成带时间戳的文件名
          const timestamp = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/[/:]/g, '-').replace(/\s/g, '_')
          link.download = `巡检人员数据_${timestamp}.csv`
          
          link.click()
          window.URL.revokeObjectURL(url)
          ElMessage.success(`导出成功，共 ${pageTotal.value} 条记录`)
          
          // 记录导出日志（自动获取真实IP）
          activityLogger.logSuccess(
            '巡检人员管理',
            '导出',
            `导出巡检人员数据 (共 ${pageTotal.value} 条记录)`
          ).catch(err => console.error('记录导出日志失败:', err))
        } else {
          ElMessage.error('导出数据格式异常')
        }
      } catch (error) {
        console.error('Export error:', error)
        
        // 尝试从错误响应中提取详细信息
        let errorMessage = '导出失败'
        if (error.response) {
          if (error.response.data) {
            // 如果 error.response.data 是 Blob，尝试读取为文本
            if (error.response.data instanceof Blob) {
              try {
                const text = await error.response.data.text()
                const errorData = JSON.parse(text)
                errorMessage = errorData.message || errorMessage
              } catch (e) {
                console.error('解析错误响应失败:', e)
              }
            } else if (typeof error.response.data === 'object') {
              errorMessage = error.response.data.message || errorMessage
            }
          } else if (error.response.status) {
            errorMessage = `导出失败 (HTTP ${error.response.status})`
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        ElMessage.error(errorMessage)
      }
    }

    const checkUsernameUnique = async () => {
      if (!formData.username || formData.username.length < 3) return

      try {
        const response = await checkUsername(formData.username, isEdit.value ? formData.id : null)
        if (response.code === 200 && !response.data.available) {
          ElMessage.warning('用户名已存在，请更换')
        }
      } catch (error) {
        console.error('Check username error:', error)
      }
    }

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        submitLoading.value = true

        const submitData = { ...formData }
        delete submitData.confirmPassword
        
        // 编辑模式下，如果密码为空，则不更新密码字段
        if (isEdit.value && (!submitData.password || submitData.password.trim() === '')) {
          delete submitData.password
        }

        // 🔍 编辑模式：获取原始数据用于对比
        let originalData = null
        if (isEdit.value) {
          originalData = tableData.value.find(item => item.id === submitData.id)
        }

        const response = isEdit.value
          ? await updateStaff(submitData)
          : await addStaff(submitData)
        if (response.data.code === '0') {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          
          // 记录操作日志（自动获取真实IP）
          const action = isEdit.value ? '修改' : '添加'
          let description = ''
          
          if (isEdit.value && originalData) {
            // 构建详细的修改描述
            const changes = []
            
            if (submitData.realName !== originalData.realName) {
              changes.push(`姓名从"${originalData.realName}"改为"${submitData.realName}"`)
            }
            if (submitData.phone !== originalData.phone) {
              changes.push(`手机号从"${originalData.phone || '未填写'}"改为"${submitData.phone || '未填写'}"`)
            }
            if (submitData.email !== originalData.email) {
              changes.push(`邮箱从"${originalData.email || '未填写'}"改为"${submitData.email || '未填写'}"`)
            }
            if (submitData.parkName !== originalData.parkName) {
              changes.push(`车场从"${originalData.parkName}"改为"${submitData.parkName}"`)
            }
            if (submitData.position !== originalData.position) {
              changes.push(`职位从"${originalData.position}"改为"${submitData.position}"`)
            }
            if (submitData.status !== originalData.status) {
              changes.push(`状态从"${originalData.status === 1 ? '正常' : '禁用'}"改为"${submitData.status === 1 ? '正常' : '禁用'}"`)
            }
            if (submitData.remark !== originalData.remark) {
              changes.push(`备注从"${originalData.remark || '无'}"改为"${submitData.remark || '无'}"`)
            }
            
            if (changes.length > 0) {
              description = `修改巡检人员 ${submitData.realName} (@${submitData.username})：${changes.join('；')}`
            } else {
              description = `修改巡检人员 ${submitData.realName} (@${submitData.username})（无字段变更）`
            }
          } else {
            description = `新增巡检人员：${submitData.realName} (@${submitData.username})，车场：${submitData.parkName}，职位：${submitData.position}`
          }
          
          activityLogger.logSuccess(
            '巡检人员管理',
            action,
            description,
            submitData.id || response.data?.id,
            'staff',
            originalData, // 旧数据
            submitData // 新数据
          ).catch(err => console.error('记录操作日志失败:', err))
          
          dialogVisible.value = false
          loadData()
        } else {
          ElMessage.error(response.data.message || (isEdit.value ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        console.error('Submit error:', error)
      } finally {
        submitLoading.value = false
      }
    }

    const handleResetPasswordSubmit = async () => {
      try {
        await passwordFormRef.value.validate()
        resetPasswordLoading.value = true

        const response = await resetPassword(passwordForm.id, passwordForm.newPassword)
        console.log("response:",response)
        if (response.data.code === '0') {
          ElMessage.success('密码重置成功')
          
          // 记录密码重置日志（自动获取真实IP）
          // 查找被重置密码的用户信息
          const targetUser = tableData.value.find(user => user.id === passwordForm.id)
          const userName = targetUser ? `${targetUser.realName} (@${targetUser.username})` : `ID: ${passwordForm.id}`
          
          activityLogger.logSuccess(
            '巡检人员管理',
            '重置密码',
            `重置巡检人员密码: ${userName}`,
            passwordForm.id,
            'staff',
            null,
            null
          ).catch(err => console.error('记录密码重置日志失败:', err))
          
          resetPasswordVisible.value = false
        } else {
          ElMessage.error(response.data.message || '密码重置失败')
        }
      } catch (error) {
        console.error('Reset password error:', error)
      } finally {
        resetPasswordLoading.value = false
      }
    }

    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        if (key === 'status') {
          formData[key] = 1
        } else if (key === 'position') {
          formData[key] = '巡检员'
        } else if (key === 'password') {
          formData[key] = '123456' // 设置默认密码
        } else {
          formData[key] = ''
        }
      })
      formData.id = null
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadData()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadData()
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 计算锁定剩余时间（分钟）
    const getRemainingLockTime = (lockTime) => {
      if (!lockTime) return 0
      const lockDate = new Date(lockTime)
      const now = new Date()
      const minutesLocked = Math.floor((now - lockDate) / (1000 * 60))
      const remainingMinutes = Math.max(0, 10 - minutesLocked)
      return remainingMinutes
    }

    // 生命周期
    onMounted(() => {
      loadData()
      loadYardList() // 初始化时加载车场列表
    })

      return {
      // 响应式数据
      loading,
      searchPanelExpanded,
      dialogVisible,
      resetPasswordVisible,
      isEdit,
      submitLoading,
      resetPasswordLoading,
      tableData,
      selectedRows,
      currentPage,
      pageSize,
      pageTotal,
      yardList,
      query,
      formData,
      passwordForm,
      formRules,
      passwordRules,

      // 🔐 车场权限
      isAdmin,
      managedParks,

      // 引用
      multipleTable,
      formRef,
      passwordFormRef,

      // 计算属性
      tableRowClassName,
      filteredYardList,

      // 图标
      Lock,
      Warning,

      // 方法
      toggleSearchPanel,
      loadData,
      loadYardList,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleAction,
      handleResetPassword,
      handleView,
      handleDelete,
      handleStatusChange,
      handleSelectionChange,
      handleBatchDelete,
      handleExport,
      checkUsernameUnique,
      handleSubmit,
      handleResetPasswordSubmit,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
      formatDateTime,
      getRemainingLockTime
    }
  }
}
</script>

<style lang="scss" scoped>
.staff-management {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .page-header {
    background: white;
    border-bottom: 1px solid #e4e7ed;
    padding: 20px 24px;
    flex-shrink: 0;

    .page-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .page-title {
        display: flex;
        align-items: center;
        gap: 16px;

        .title-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .title-text {
          h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            line-height: 1.2;
          }

          .title-desc {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #909399;
            line-height: 1.2;
          }
        }
      }

      .page-actions {
        display: flex;
        gap: 12px;

        .action-btn {
          border-radius: 8px;
          font-weight: 500;
        }
      }
    }
  }

  .container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 24px;

    .search-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .search-panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid #f0f2f5;
        cursor: pointer;
        user-select: none;

        .search-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #303133;

          .toggle-icon {
            margin-left: auto;
            transition: transform 0.3s ease;

            &.expanded {
              transform: rotate(180deg);
            }
          }
        }
      }

      .search-panel-body {
        padding: 20px;

        .search-form {
          .search-row {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            gap: 16px;

            .search-item {
              margin-bottom: 0;
            }

            .search-input,
            .search-select {
              width: 200px;
            }

            .search-actions {
              display: flex;
              gap: 8px;
            }
          }
        }
      }
    }

    .table-panel {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .table-panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid #f0f2f5;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .table-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #303133;
        }

        .table-stats {
          font-size: 14px;
          color: #909399;
        }
      }

      .table-panel-body {
        padding: 0;
        flex: 1;
        overflow-y: auto;

        .modern-table {
          background: #ffffff;
          border-radius: 0;
          overflow: hidden;
          box-shadow: none;

          .staff-info-cell {
            display: flex;
            align-items: center;
            gap: 12px;

            .staff-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
            }

            .staff-details {
              .staff-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 2px;
              }

              .staff-username {
                font-size: 12px;
                color: #909399;
              }
            }
          }

          .contact-info-cell {
            .contact-item {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 4px;
              font-size: 13px;
              color: #606266;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }

          .park-info {
            .park-name {
              font-weight: 500;
              color: #303133;
              margin-bottom: 2px;
            }

            .position {
              font-size: 12px;
              color: #909399;
            }
          }

          .login-info {
            .login-time {
              font-size: 13px;
              color: #303133;
              margin-bottom: 2px;
            }

            .login-ip {
              font-size: 12px;
              color: #909399;
            }

            .no-login {
              font-size: 13px;
              color: #C0C4CC;
            }
          }

          .action-buttons {
            display: flex;
            gap: 8px;
            align-items: center;

            .action-btn {
              border-radius: 6px;
              font-size: 12px;
            }
          }
        }

        .batch-actions {
          padding: 16px 20px;
          border-top: 1px solid #f0f2f5;
          background: #fafbfc;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .batch-info {
            font-size: 14px;
            color: #606266;
          }

          .batch-buttons {
            display: flex;
            gap: 8px;
          }
        }

        .pagination-wrapper {
          padding: 16px 20px;
          border-top: 1px solid #f0f2f5;
          display: flex;
          justify-content: flex-end;

          .modern-pagination {

            :deep(.el-pagination__total),
            :deep(.el-pagination__sizes),
            :deep(.el-pagination__jump) {
              color: #606266;
            }
          }
        }
      }
    }
  }
}

.modern-dialog {
  .staff-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

:deep(.el-table .warning-row) {
  background: #fdf6ec;
}

:deep(.el-dropdown-menu__item.danger-item) {
  color: #f56c6c;

  &:hover {
    background: #fef0f0;
    color: #f56c6c;
  }
}

/* 状态信息容器 */
.status-info-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

/* 状态开关样式 */
.status-switch-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .status-switch {
    --el-switch-on-color: #67C23A;
    --el-switch-off-color: #F56C6C;
    --el-switch-border-color: #DCDFE6;
    
    :deep(.el-switch__core) {
      border: 2px solid transparent;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
      }
      
      &::after {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
    }
    
    :deep(.el-switch__action) {
      background: white;
      border: 1px solid #E4E7ED;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
    }
    
    :deep(.el-switch__label) {
      font-size: 12px;
      font-weight: 500;
      color: #606266;
      transition: color 0.3s ease;
    }
    
    :deep(.el-switch__label--left) {
      margin-right: 8px;
    }
    
    :deep(.el-switch__label--right) {
      margin-left: 8px;
    }
    
    /* 启用状态样式 */
    &.is-checked {
      :deep(.el-switch__core) {
        background-color: #67C23A;
        border-color: #67C23A;
        box-shadow: 0 0 0 1px rgba(103, 194, 58, 0.2);
      }
      
      :deep(.el-switch__label--right) {
        color: #67C23A;
        font-weight: 600;
      }
      
      :deep(.el-switch__action) {
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        border-color: #67C23A;
      }
    }
    
    /* 禁用状态样式 */
    &:not(.is-checked) {
      :deep(.el-switch__core) {
        background-color: #F56C6C;
        border-color: #F56C6C;
        box-shadow: 0 0 0 1px rgba(245, 108, 108, 0.2);
      }
      
      :deep(.el-switch__label--left) {
        color: #F56C6C;
        font-weight: 600;
      }
      
      :deep(.el-switch__action) {
        background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
        border-color: #F56C6C;
      }
    }
    
    /* 加载状态样式 */
    &.is-loading {
      :deep(.el-switch__core) {
        opacity: 0.7;
        cursor: not-allowed;
        
        &:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: none;
        }
      }
      
      :deep(.el-loading-spinner) {
        .circular {
          width: 14px;
          height: 14px;
        }
        
        .path {
          stroke: #409EFF;
          stroke-width: 3;
        }
      }
    }
    
    /* 响应式动画 */
    &:active:not(.is-loading) {
      :deep(.el-switch__core) {
        transform: scale(0.95);
      }
    }
  }
}

/* 锁定状态提示样式 */
.lock-status-tip {
  margin-top: 4px;
  
  .el-tag {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* 禁用原因提示样式 */
.disable-reason-tip {
  margin-top: 4px;
  max-width: 200px;
  
  .el-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
}

/* 禁用/锁定信息列样式 */
.disable-lock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  min-height: 60px;
  justify-content: center;
  
  .disable-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    
    .info-tag {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .disable-reason-text {
      font-size: 12px;
      color: #F56C6C;
      text-align: center;
      max-width: 100%;
      word-break: break-word;
      
      .reason-text {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .disable-time-text {
      font-size: 11px;
      color: #909399;
      margin-top: 2px;
    }
  }
  
  .lock-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    
    .info-tag {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .lock-time-text {
      font-size: 11px;
      color: #909399;
    }
    
    .lock-remaining-text {
      font-size: 12px;
      color: #E6A23C;
      font-weight: 500;
    }
  }
  
  .failed-login-info {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .info-tag {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .no-info {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 20px;
  }
}
</style>