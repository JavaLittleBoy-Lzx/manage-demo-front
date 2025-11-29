<template>
  <div class="violation-management">
    <div class="page-header">
      <h2>违规管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增违规记录
        </el-button>
        <el-button type="success" @click="batchProcess">
          <el-icon><Operation /></el-icon>
          批量处理
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.licensePlate" placeholder="请输入车牌号" clearable />
        </el-form-item>
        <el-form-item label="违规类型">
          <el-select v-model="searchForm.violationType" placeholder="请选择" clearable>
            <el-option label="占用消防通道" value="占用消防通道" />
            <el-option label="违规停车" value="违规停车" />
            <el-option label="超时停车" value="超时停车" />
            <el-option label="逆向停车" value="逆向停车" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchViolations">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="violationList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="licensePlate" label="车牌号" width="120" />
        <el-table-column prop="violationType" label="违规类型" width="120" />
        <el-table-column prop="location" label="违规地点" width="150" />
        <el-table-column prop="description" label="违规描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="fine" label="罚款金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.fine || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="violationTime" label="违规时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editViolation(scope.row)">编辑</el-button>
            <el-button size="small" type="success" @click="processViolation(scope.row)">
              处理
            </el-button>
            <el-button size="small" type="danger" @click="deleteViolation(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑违规记录' : '新增违规记录'"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="violationFormRef"
        :model="violationForm"
        :rules="violationRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="licensePlate">
              <el-input v-model="violationForm.licensePlate" placeholder="请输入车牌号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="违规类型" prop="violationType">
              <el-select v-model="violationForm.violationType" placeholder="请选择" style="width: 100%">
                <el-option label="占用消防通道" value="占用消防通道" />
                <el-option label="违规停车" value="违规停车" />
                <el-option label="超时停车" value="超时停车" />
                <el-option label="逆向停车" value="逆向停车" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="违规地点" prop="location">
              <el-input v-model="violationForm.location" placeholder="请输入违规地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罚款金额" prop="fine">
              <el-input-number
                v-model="violationForm.fine"
                :min="0"
                :max="10000"
                :precision="2"
                placeholder="请输入罚款金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="违规时间" prop="violationTime">
              <el-date-picker
                v-model="violationForm.violationTime"
                type="datetime"
                placeholder="选择违规时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上报人" prop="reporter">
              <el-input v-model="violationForm.reporter" placeholder="请输入上报人" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- AI生成功能集成 -->
        <el-form-item label="违规描述" prop="description">
          <div class="description-section">
            <el-input
              v-model="violationForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入违规描述..."
              show-word-limit
              maxlength="500"
            />
            <!-- 集成AI生成组件 -->
            <div class="ai-generate-section">
              <ViolationAIGenerator
                :violation-data="violationForm"
                @content-accepted="handleAIContentAccepted"
              />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="现场照片" prop="photos">
          <el-upload
            v-model:file-list="violationForm.photos"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            multiple
            :limit="5"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png文件，单文件不超过2MB，最多上传5张
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialog">取消</el-button>
          <el-button type="primary" @click="saveViolation">
            {{ isEdit ? '更新' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Operation } from '@element-plus/icons-vue'
import { violationApi } from '@/api/violation'
import { logActivity } from '@/utils/activityLogger'
import ViolationAIGenerator from '@/components/ViolationAIGenerator.vue'

export default {
  name: 'ViolationManagement',
  components: {
    Plus,
    Search,
    Operation,
    ViolationAIGenerator
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const showDialog = ref(false)
    const isEdit = ref(false)
    const violationFormRef = ref()
    const selectedViolations = ref([])

    // 搜索表单
    const searchForm = reactive({
      licensePlate: '',
      violationType: '',
      status: '',
      dateRange: []
    })

    // 分页数据
    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    // 违规列表
    const violationList = ref([])

    // 违规表单
    const violationForm = reactive({
      id: null,
      licensePlate: '',
      violationType: '',
      location: '',
      description: '',
      fine: 0,
      violationTime: '',
      reporter: '',
      photos: [],
      status: 'pending'
    })

    // 表单验证规则
    const violationRules = {
      licensePlate: [
        { required: true, message: '请输入车牌号', trigger: 'blur' },
        { pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/, message: '请输入正确的车牌号', trigger: 'blur' }
      ],
      violationType: [
        { required: true, message: '请选择违规类型', trigger: 'change' }
      ],
      location: [
        { required: true, message: '请输入违规地点', trigger: 'blur' }
      ],
      violationTime: [
        { required: true, message: '请选择违规时间', trigger: 'change' }
      ],
      reporter: [
        { required: true, message: '请输入上报人', trigger: 'blur' }
      ]
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        pending: 'warning',
        processed: 'success',
        ignored: 'info'
      }
      return typeMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        pending: '待处理',
        processed: '已处理',
        ignored: '已忽略'
      }
      return textMap[status] || '未知'
    }

    // 搜索违规记录
    const searchViolations = async () => {
      loading.value = true
      try {
        const params = {
          pageNum: pagination.current,
          pageSize: pagination.size,
          ...searchForm
        }

        // 处理时间范围
        if (searchForm.dateRange && searchForm.dateRange.length === 2) {
          params.startTime = searchForm.dateRange[0]
          params.endTime = searchForm.dateRange[1]
        }

        const response = await violationApi.getViolations(params)
        if (response && response.data) {
          violationList.value = response.data.records || []
          pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('搜索违规记录失败:', error)
        ElMessage.error('搜索失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    // 重置搜索
    const resetSearch = () => {
      Object.assign(searchForm, {
        licensePlate: '',
        violationType: '',
        status: '',
        dateRange: []
      })
      pagination.current = 1
      searchViolations()
    }

    // 显示新增对话框
    const showAddDialog = () => {
      isEdit.value = false
      resetForm()
      showDialog.value = true
    }

    // 编辑违规记录
    const editViolation = (row) => {
      isEdit.value = true
      Object.assign(violationForm, {
        ...row,
        photos: row.photos ? JSON.parse(JSON.stringify(row.photos)) : []
      })
      showDialog.value = true
    }

    // 重置表单
    const resetForm = () => {
      Object.assign(violationForm, {
        id: null,
        licensePlate: '',
        violationType: '',
        location: '',
        description: '',
        fine: 0,
        violationTime: '',
        reporter: '',
        photos: [],
        status: 'pending'
      })
      if (violationFormRef.value) {
        violationFormRef.value.resetFields()
      }
    }

    // 取消对话框
    const cancelDialog = () => {
      showDialog.value = false
      resetForm()
    }

    // 保存违规记录
    const saveViolation = async () => {
      if (!violationFormRef.value) return

      try {
        await violationFormRef.value.validate()

        const formData = { ...violationForm }

        // 处理照片数据
        if (formData.photos && formData.photos.length > 0) {
          formData.photos = formData.photos.map(photo => {
            if (photo.url) {
              return photo.url
            }
            return photo.response?.url || photo.url
          }).filter(Boolean)
        }

        let response
        if (isEdit.value) {
          response = await violationApi.updateViolation(formData.id, formData)
          // 记录活动日志
          await logActivity.violationUpdate('更新违规记录', formData.id, null, formData)
          ElMessage.success('更新成功')
        } else {
          response = await violationApi.createViolation(formData)
          // 记录活动日志
          await logActivity.violationAdd('新增违规记录', response.data?.id, null, formData)
          ElMessage.success('添加成功')
        }

        showDialog.value = false
        resetForm()
        searchViolations()
      } catch (error) {
        if (error.name !== 'ElFormValidateError') {
          console.error('保存失败:', error)
          ElMessage.error('保存失败：' + error.message)
        }
      }
    }

    // 处理违规记录
    const processViolation = async (row) => {
      try {
        const { value: remark } = await ElMessageBox.prompt('请输入处理备注', '处理违规记录', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '备注不能为空'
        })

        const response = await violationApi.processViolation(row.id, {
          status: 'processed',
          remark: remark
        })

        if (response) {
          // 记录活动日志
          await logActivity.violationProcess('处理违规记录', row.id, row, { status: 'processed', remark })
          ElMessage.success('处理成功')
          searchViolations()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('处理失败:', error)
          ElMessage.error('处理失败：' + error.message)
        }
      }
    }

    // 删除违规记录
    const deleteViolation = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除车牌号为 ${row.licensePlate} 的违规记录吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await violationApi.deleteViolation(row.id)
        if (response) {
          // 记录活动日志
          await logActivity.violationDelete('删除违规记录', row.id, row, null)
          ElMessage.success('删除成功')
          searchViolations()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('删除失败：' + error.message)
        }
      }
    }

    // 批量处理
    const batchProcess = async () => {
      if (selectedViolations.value.length === 0) {
        ElMessage.warning('请选择要处理的违规记录')
        return
      }

      try {
        const { value: action } = await ElMessageBox.confirm(
          `确定要批量处理选中的 ${selectedViolations.value.length} 条违规记录吗？`,
          '批量处理',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const violationIds = selectedViolations.value.map(item => item.id)
        const response = await violationApi.batchProcessViolations(violationIds, {
          action: 'processed'
        })

        if (response) {
          // 记录活动日志
          await logActivity.violationBatchProcess('批量处理违规记录', null, null, {
            count: selectedViolations.value.length,
            action: 'processed'
          })
          ElMessage.success('批量处理成功')
          searchViolations()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量处理失败:', error)
          ElMessage.error('批量处理失败：' + error.message)
        }
      }
    }

    // 处理选择变化
    const handleSelectionChange = (selection) => {
      selectedViolations.value = selection
    }

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      searchViolations()
    }

    // 处理页码变化
    const handleCurrentChange = (current) => {
      pagination.current = current
      searchViolations()
    }

    // 处理AI生成内容接受
    const handleAIContentAccepted = (data) => {
      violationForm.description = data.content
      ElMessage.success('已采用AI生成的违规描述')
    }

    // 组件挂载
    onMounted(() => {
      searchViolations()
    })

    return {
      loading,
      showDialog,
      isEdit,
      violationFormRef,
      searchForm,
      pagination,
      violationList,
      violationForm,
      violationRules,
      selectedViolations,
      getStatusType,
      getStatusText,
      searchViolations,
      resetSearch,
      showAddDialog,
      editViolation,
      cancelDialog,
      saveViolation,
      processViolation,
      deleteViolation,
      batchProcess,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      handleAIContentAccepted
    }
  }
}
</script>

<style scoped>
.violation-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin: 0;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.description-section {
  width: 100%;
}

.ai-generate-section {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .search-form {
    display: block;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>