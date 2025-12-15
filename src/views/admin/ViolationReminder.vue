<template>
  <div class="page-container">
    <!-- 页头（与 BlacklistReasonConfig 风格一致） -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <i class="el-icon-warning"></i>
          </div>
          <div class="title-text">
            <h1>违规提醒管理</h1>
            <p class="title-desc">查看和管理车辆违规提醒记录</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 搜索面板 -->
      <div class="search-panel">
        <div class="search-panel-header">
          <div class="search-title">
            <i class="el-icon-search"></i>
            <span>筛选条件</span>
          </div>
        </div>
        <div class="search-panel-body">
          <el-form :model="searchForm" :inline="true" class="search-form">
            <div class="search-row">
              <el-form-item label="车牌号" class="search-item">
                <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" clearable class="search-input" />
              </el-form-item>
              <el-form-item label="车主姓名" class="search-item">
                <el-input v-model="searchForm.ownerName" placeholder="请输入车主姓名" clearable class="search-input" />
              </el-form-item>
              <el-form-item label="创建时间" class="search-item">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 350px"
                />
              </el-form-item>
            </div>
            <div class="search-actions">
              <div class="search-buttons">
                <el-button type="warning" @click="handleReset" icon="el-icon-refresh" size="small">重置</el-button>
                <el-button type="primary" @click="handleSearch" :loading="loading" icon="el-icon-search" size="small">搜索</el-button>
              </div>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon total">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.total }}</div>
                  <div class="stats-label">总提醒数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon today">
                  <i class="el-icon-date"></i>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.today }}</div>
                  <div class="stats-label">今日新增</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon week">
                  <el-icon :size="28">
                    <Calendar />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.thisWeek }}</div>
                  <div class="stats-label">本周新增</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon month">
                  <el-icon :size="28">
                    <DataAnalysis />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.thisMonth }}</div>
                  <div class="stats-label">本月新增</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 表格面板 -->
      <div class="table-panel">
        <div class="table-panel-header">
          <div class="table-title">
            <i class="el-icon-document"></i>
            <span>违规提醒列表</span>
          </div>
          <div class="table-status">
            <el-tag type="info" size="small">共 {{ total }} 条记录</el-tag>
          </div>
        </div>
        <div class="table-panel-body">
          <el-table :data="tableData" v-loading="loading" class="modern-table" max-height="430" stripe>
            <el-table-column prop="plateNumber" label="车牌号" width="120">
              <template #default="scope">
                <el-tag type="primary" size="small">{{ scope.row.plateNumber }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ownerName" label="车主姓名" width="120" />
            <el-table-column prop="ownerPhone" label="车主电话" width="130">
              <template #default="scope">
                <el-tag type="info" size="small">{{ scope.row.ownerPhone }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="violationType" label="违规类型" width="150">
              <template #default="scope">
                <el-tag :type="getViolationTypeTag(scope.row.violationType)" size="small">
                  {{ scope.row.violationType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="violationLocation" label="违规地点" min-width="150" show-overflow-tooltip />
            <el-table-column prop="violationTime" label="违规时间" width="190">
              <template #default="scope">
                {{ formatDateTime(scope.row.violationTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="reminderTime" label="提醒时间" width="190">
              <template #default="scope">
                {{ formatDateTime(scope.row.reminderTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="parkName" label="车场名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="reminderContent" label="提醒内容" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="scope">
                <div class="action-buttons-inline">
                  <el-button type="primary" text size="small" @click="handleView(scope.row)" class="action-btn">查看详情</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          />
        </div>
      </div>

      <!-- 查看详情对话框 -->
      <!-- eslint-disable-next-line vue/no-deprecated-v-bind-sync -->
      <el-dialog
        title="违规提醒详情"
        v-model="viewDialogVisible"
        width="800px"
        :close-on-click-modal="false"
        class="form-dialog"
      >
        <div v-if="currentRecord" class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="车牌号">
              <el-tag type="primary">{{ currentRecord.plateNumber }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="车主姓名">{{ currentRecord.ownerName }}</el-descriptions-item>
            <el-descriptions-item label="车主电话">
              <el-tag type="info">{{ currentRecord.ownerPhone }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="违规类型">
              <el-tag :type="getViolationTypeTag(currentRecord.violationType)">
                {{ currentRecord.violationType }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="违规地点" :span="2">{{ currentRecord.violationLocation }}</el-descriptions-item>
            <el-descriptions-item label="违规时间">{{ formatDateTime(currentRecord.violationTime) }}</el-descriptions-item>
            <el-descriptions-item label="提醒时间">{{ formatDateTime(currentRecord.reminderTime) }}</el-descriptions-item>
            <el-descriptions-item label="车场名称" :span="2">{{ currentRecord.parkName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提醒内容" :span="2">
              <div class="reminder-content">{{ currentRecord.reminderContent }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>
      <!-- eslint-enable vue/no-deprecated-v-bind-sync -->
    </div>
  </div>
</template>

<script>
import { violationApi } from '@/api/violation'
import { Calendar, DataAnalysis } from '@element-plus/icons-vue'

export default {
  name: 'ViolationReminder',
  components: {
    Calendar,
    DataAnalysis
  },
  data() {
    return {
      loading: false,
      searchForm: {
        plateNumber: '',
        ownerName: '',
        violationType: '',
        dateRange: []
      },
      tableData: [],
      total: 0,
      pagination: {
        current: 1,
        size: 20
      },
      stats: {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      viewDialogVisible: false,
      currentRecord: null
    }
  },
  mounted() {
    // 只需加载数据，统计会在数据加载完成后自动更新
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          current: this.pagination.current,
          size: this.pagination.size
        }
        
        // 处理时间范围
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startTime = this.searchForm.dateRange[0]
          params.endTime = this.searchForm.dateRange[1]
        }
        delete params.dateRange

        const res = await violationApi.getViolationReminders(params)
        const ok = res && res.data && (res.data.code === '0' || res.data.code === 0)
        if (ok) {
          const data = res.data.data
          if (data && data.records) {
            this.tableData = data.records || []
            this.total = data.total || 0
          } else if (Array.isArray(data)) {
            this.tableData = data
            this.total = data.length
          } else {
            this.tableData = []
            this.total = 0
          }
        } else {
          this.$message.error((res && res.data && res.data.msg) || '加载数据失败')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
        // 数据加载完成后更新统计
        this.$nextTick(() => {
          this.loadStats()
        })
      }
    },

     // 加载统计信息
     async loadStats() {
       try {
         const params = {}
         if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
           params.startTime = this.searchForm.dateRange[0]
           params.endTime = this.searchForm.dateRange[1]
         }
         if (this.searchForm.parkCode) {
           params.parkCode = this.searchForm.parkCode
         }

        const res = await violationApi.getViolationReminderStatistics(params)
        const ok = res && res.data && (res.data.code === '0' || res.data.code === 0)
        if (ok && res.data.data) {
          // API 返回的数据包含 total, today, thisWeek, thisMonth
          const apiStats = res.data.data
          // 检查返回的数据是否是基于违规时间统计的
          if (apiStats.thisWeek !== undefined && apiStats.thisMonth !== undefined) {
            this.stats = {
              total: apiStats.total !== undefined ? apiStats.total : this.total,
              today: apiStats.today !== undefined ? apiStats.today : 0,
              thisWeek: apiStats.thisWeek !== undefined ? apiStats.thisWeek : 0,
              thisMonth: apiStats.thisMonth !== undefined ? apiStats.thisMonth : 0
            }
          } else {
            // API返回的数据不完整，使用本地计算
            await this.calculateLocalStats()
          }
        } else {
           // 如果统计接口失败或返回格式不对，使用本地计算
           await this.calculateLocalStats()
        }
       } catch (error) {
         console.error('加载统计信息失败:', error)
         // 使用本地计算作为备选方案
         await this.calculateLocalStats()
       }
     },

     // 本地计算统计数据 - 查询所有符合筛选条件的数据
     async calculateLocalStats() {
       try {
         const now = new Date()
         const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
         today.setHours(0, 0, 0, 0)
         
         // 获取本周开始时间（周一）
         const startOfWeek = new Date(now)
         const day = startOfWeek.getDay()
         const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
         startOfWeek.setDate(diff)
         startOfWeek.setHours(0, 0, 0, 0)
         
         // 获取本月开始时间
         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
         startOfMonth.setHours(0, 0, 0, 0)
         
         // 查询所有符合筛选条件的数据（不分页或使用较大的pageSize）
         const params = {
           plateNumber: this.searchForm.plateNumber || '',
           ownerName: this.searchForm.ownerName || '',
           violationType: this.searchForm.violationType || '',
           current: 1,
           size: 10000 // 获取足够多的数据用于统计
         }
         
         // 处理时间范围（统计时不需要时间范围限制，要获取所有数据）
         // 注意：这里不添加时间范围，以便统计所有数据
         
         console.log('开始查询所有数据用于统计，查询参数:', params)
         
         const res = await violationApi.getViolationReminders(params)
         const ok = res && res.data && (res.data.code === '0' || res.data.code === 0)
         
         let allData = []
         if (ok) {
           const data = res.data.data
           if (data && data.records) {
             allData = data.records || []
           } else if (Array.isArray(data)) {
             allData = data
           }
         }
         
         console.log('查询到的总数据量:', allData.length)
         
         // 计算统计数据
         let todayCount = 0
         let weekCount = 0
         let monthCount = 0
         
         allData.forEach(item => {
           // 使用违规时间进行统计，优先使用 violationTime
           const itemDateStr = item.violationTime || item.violation_time
           if (!itemDateStr) {
             console.warn('数据缺少违规时间字段:', item)
             return
           }
           
           const itemDate = new Date(itemDateStr)
           if (isNaN(itemDate.getTime())) {
             console.warn('无效的违规时间:', itemDateStr, item)
             return
           }
           
           // 判断是否是今天
           if (itemDate >= today) {
             todayCount++
           }
           
           // 判断是否是本周
           if (itemDate >= startOfWeek) {
             weekCount++
           }
           
           // 判断是否是本月
           if (itemDate >= startOfMonth) {
             monthCount++
           }
         })
         
         this.stats = {
           total: this.total || allData.length || 0,
           today: todayCount,
           thisWeek: weekCount,
           thisMonth: monthCount
         }
         
         console.log('统计计算完成（基于违规时间）:', this.stats)
         console.log('计算使用的数据量:', allData.length)
         console.log('今日开始时间:', today.toLocaleString())
         console.log('本周开始时间:', startOfWeek.toLocaleString())
         console.log('本月开始时间:', startOfMonth.toLocaleString())
       } catch (error) {
         console.error('计算统计数据失败:', error)
         // 如果出错，至少显示总数
         this.stats = {
           total: this.total || 0,
           today: 0,
           thisWeek: 0,
           thisMonth: 0
         }
       }
     },

    // 搜索
    handleSearch() {
      this.pagination.current = 1
      this.loadData().then(() => {
        this.loadStats()
      })
    },

    // 重置
    handleReset() {
      this.searchForm = {
        plateNumber: '',
        ownerName: '',
        violationType: '',
        dateRange: []
      }
      this.pagination.current = 1
      this.loadData()
      this.loadStats()
    },

    // 刷新
    handleRefresh() {
      this.loadData()
      this.loadStats()
    },

    // 查看详情
    handleView(row) {
      this.currentRecord = row
      this.viewDialogVisible = true
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.current = 1
      this.loadData()
    },

    // 当前页变化
    handleCurrentChange(current) {
      this.pagination.current = current
      this.loadData()
    },

    // 获取违规类型标签样式
    getViolationTypeTag(type) {
      const typeMap = {
        '违停': 'danger',
        '超时': 'warning',
        '占用': 'info',
        '其他': 'primary'
      }
      return typeMap[type] || 'primary'
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './violation-config-common.scss';

.stats-section {
  margin: 16px 0;

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      padding: 10px;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: white;
        flex-shrink: 0;
        
        :deep(.el-icon) {
          font-size: 28px;
          color: white !important;
        }

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.today {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        &.week {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        &.month {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }
      }

      .stats-info {
        .stats-number {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          line-height: 1;
          margin-bottom: 5px;
        }

        .stats-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.detail-content {
  .reminder-content {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    border-left: 4px solid #409eff;
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
  }
}
</style>
