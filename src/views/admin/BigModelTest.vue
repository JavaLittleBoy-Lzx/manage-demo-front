<template>
  <div class="bigmodel-test">
    <div class="page-header">
      <h2>BigModel AI功能测试</h2>
      <p>测试后端AI接口是否正常工作（API密钥已安全存储在后端）</p>
    </div>

    <div class="test-container">
      <!-- API配置状态 -->
      <el-card class="status-card">
        <template #header>
          <span>API配置状态</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="API密钥">
            <el-tag :type="apiKeyStatus.type">{{ apiKeyStatus.text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="功能状态">
            <el-tag :type="featureStatus.type">{{ featureStatus.text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="API地址">
            <code>{{ bigmodelConfig.baseURL }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="超时设置">
            {{ bigmodelConfig.timeout }}ms
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 测试功能 -->
      <el-row :gutter="20" class="test-row">
        <el-col :span="12">
          <el-card class="test-card">
            <template #header>
              <span>智能客服测试</span>
            </template>
            <div class="test-content">
              <el-input
                v-model="testQuestion"
                placeholder="请输入测试问题..."
                type="textarea"
                :rows="3"
              />
              <el-button
                type="primary"
                :loading="customerTestLoading"
                @click="testCustomerService"
                style="margin-top: 10px; width: 100%"
              >
                测试智能客服
              </el-button>
              <div v-if="customerResponse" class="test-result">
                <h4>AI回答：</h4>
                <div class="response-content">{{ customerResponse }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="test-card">
            <template #header>
              <span>违规描述生成测试</span>
            </template>
            <div class="test-content">
              <el-form :model="violationTestData" label-width="80px" size="small">
                <el-form-item label="车牌号">
                  <el-input v-model="violationTestData.licensePlate" placeholder="京A12345" />
                </el-form-item>
                <el-form-item label="违规类型">
                  <el-select v-model="violationTestData.violationType" placeholder="请选择" style="width: 100%">
                    <el-option label="占用消防通道" value="占用消防通道" />
                    <el-option label="违规停车" value="违规停车" />
                  </el-select>
                </el-form-item>
                <el-form-item label="违规地点">
                  <el-input v-model="violationTestData.location" placeholder="A区-001车位" />
                </el-form-item>
              </el-form>
              <el-button
                type="success"
                :loading="violationTestLoading"
                @click="testViolationDescription"
                style="width: 100%"
              >
                生成违规描述
              </el-button>
              <div v-if="violationResponse" class="test-result">
                <h4>生成的描述：</h4>
                <div class="response-content">{{ violationResponse }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据报告测试 -->
      <el-card class="test-card">
        <template #header>
          <span>数据报告生成测试</span>
        </template>
        <div class="test-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="总车位数">
                <el-input-number v-model="reportData.totalParkingSpaces" :min="1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="占用车位">
                <el-input-number v-model="reportData.occupiedSpaces" :min="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="今日违规">
                <el-input-number v-model="reportData.todayViolations" :min="0" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-button
            type="warning"
            :loading="reportTestLoading"
            @click="testDataReport"
          >
            生成数据报告
          </el-button>
          <div v-if="reportResponse" class="test-result">
            <h4>生成的报告：</h4>
            <div class="response-content">{{ reportResponse }}</div>
          </div>
        </div>
      </el-card>

      <!-- 测试日志 -->
      <el-card class="log-card">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>测试日志</span>
            <el-button size="small" @click="clearLogs">清除日志</el-button>
          </div>
        </template>
        <div class="log-content">
          <div
            v-for="(log, index) in testLogs"
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { bigModelApi } from '@/api/bigmodel'
import { aiApi } from '@/api/backend'

export default {
  name: 'BigModelTest',
  setup() {
    // 测试数据
    const testQuestion = ref('如何缴纳停车费？')
    const customerResponse = ref('')
    const customerTestLoading = ref(false)

    const violationTestData = reactive({
      licensePlate: '京A12345',
      violationType: '占用消防通道',
      location: 'A区-001车位',
      violationTime: new Date().toLocaleString(),
      reporter: '巡检员'
    })
    const violationResponse = ref('')
    const violationTestLoading = ref(false)

    const reportData = reactive({
      totalParkingSpaces: 500,
      occupiedSpaces: 350,
      utilizationRate: 70,
      todayViolations: 5,
      monthViolations: 150
    })
    const reportResponse = ref('')
    const reportTestLoading = ref(false)

    const testLogs = ref([])

    // 状态数据
    const aiStatus = ref(null)
    const isLoadingStatus = ref(false)

    // 计算属性
    const apiKeyStatus = computed(() => {
      if (isLoadingStatus.value) {
        return { type: 'info', text: '检查中...' }
      }
      if (!aiStatus.value) {
        return { type: 'warning', text: '未知' }
      }
      return aiStatus.value.enabled 
        ? { type: 'success', text: '已配置' }
        : { type: 'danger', text: '未配置' }
    })

    const featureStatus = computed(() => {
      if (isLoadingStatus.value) {
        return { type: 'info', text: '检查中...' }
      }
      if (!aiStatus.value || !aiStatus.value.features) {
        return { type: 'warning', text: '未知' }
      }
      const features = aiStatus.value.features
      const enabledCount = Object.values(features).filter(f => f).length
      const totalCount = Object.keys(features).length
      if (enabledCount === totalCount) {
        return { type: 'success', text: '全部功能已启用' }
      } else if (enabledCount > 0) {
        return { type: 'warning', text: `${enabledCount}/${totalCount} 功能已启用` }
      }
      return { type: 'danger', text: '功能未启用' }
    })

    const bigmodelConfig = computed(() => ({
      baseURL: '/api/ai',
      timeout: 60000
    }))

    // 测试方法
    const addLog = (message, type = 'info') => {
      testLogs.value.unshift({
        message,
        type,
        timestamp: Date.now()
      })
      // 限制日志数量
      if (testLogs.value.length > 50) {
        testLogs.value = testLogs.value.slice(0, 50)
      }
    }

    const testCustomerService = async () => {
      if (!testQuestion.value.trim()) {
        ElMessage.warning('请输入测试问题')
        return
      }

      customerTestLoading.value = true
      addLog(`开始测试智能客服，问题：${testQuestion.value}`)

      try {
        const response = await bigModelApi.customerService(testQuestion.value)
        
        // 🔍 调试：打印完整响应结构
        console.log('📊 完整响应对象:', response)
        console.log('📊 response.data:', response.data)
        console.log('📊 response.data?.answer:', response.data?.answer)
        addLog(`响应结构: ${JSON.stringify(response)}`, 'info')
        
        // 适配后端返回格式：response.data.answer
        customerResponse.value = response.data.data?.answer || '无返回内容'
        addLog(`AI回答内容: ${customerResponse.value}`, 'success')
        addLog('智能客服测试成功', 'success')
        ElMessage.success('智能客服测试成功')
      } catch (error) {
        console.error('❌ 错误详情:', error)
        addLog(`智能客服测试失败：${error.message}`, 'error')
        ElMessage.error('智能客服测试失败：' + error.message)
      } finally {
        customerTestLoading.value = false
      }
    }

    const testViolationDescription = async () => {
      violationTestLoading.value = true
      addLog(`开始测试违规描述生成，车牌号：${violationTestData.licensePlate}`)

      try {
        const response = await bigModelApi.generateViolationDescription(violationTestData)
        // 适配后端返回格式：response.data.description
        violationResponse.value = response.data?.description || '无返回内容'
        addLog('违规描述生成测试成功', 'success')
        ElMessage.success('违规描述生成测试成功')
      } catch (error) {
        addLog(`违规描述生成测试失败：${error.message}`, 'error')
        ElMessage.error('违规描述生成测试失败：' + error.message)
      } finally {
        violationTestLoading.value = false
      }
    }

    const testDataReport = async () => {
      reportTestLoading.value = true
      addLog('开始测试数据报告生成')

      try {
        const response = await bigModelApi.generateDataReport(reportData, 'daily')
        // 适配后端返回格式：response.data.report
        reportResponse.value = response.data?.report || '无返回内容'
        addLog('数据报告生成测试成功', 'success')
        ElMessage.success('数据报告生成测试成功')
      } catch (error) {
        addLog(`数据报告生成测试失败：${error.message}`, 'error')
        ElMessage.error('数据报告生成测试失败：' + error.message)
      } finally {
        reportTestLoading.value = false
      }
    }

    const clearLogs = () => {
      testLogs.value = []
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    // 加载AI状态
    const loadAIStatus = async () => {
      isLoadingStatus.value = true
      try {
        const response = await aiApi.getAIStatus()
        if (response.data) {
          aiStatus.value = response.data
          addLog('AI功能状态加载成功', 'success')
          addLog(`后端AI服务状态: ${aiStatus.value.enabled ? '已启用' : '未启用'}`)
        }
      } catch (error) {
        addLog(`AI状态加载失败: ${error.message}`, 'error')
        console.error('加载AI状态失败:', error)
      } finally {
        isLoadingStatus.value = false
      }
    }

    // 组件挂载时进行配置验证
    onMounted(async () => {
      addLog('BigModel测试页面加载完成')
      addLog('通过后端API调用AI服务，API密钥安全存储在后端', 'info')
      
      // 加载AI状态
      await loadAIStatus()
    })

    return {
      testQuestion,
      customerResponse,
      customerTestLoading,
      violationTestData,
      violationResponse,
      violationTestLoading,
      reportData,
      reportResponse,
      reportTestLoading,
      testLogs,
      apiKeyStatus,
      featureStatus,
      bigmodelConfig,
      isLoadingStatus,
      loadAIStatus,
      testCustomerService,
      testViolationDescription,
      testDataReport,
      clearLogs,
      formatTime
    }
  }
}
</script>

<style scoped>
.bigmodel-test {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.test-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card,
.test-card,
.log-card {
  margin-bottom: 0;
}

.test-row {
  margin-bottom: 20px;
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.test-result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.test-result h4 {
  margin: 0 0 10px 0;
  color: #374151;
  font-size: 14px;
}

.response-content {
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background-color: #1f2937;
  border-radius: 6px;
  padding: 15px;
}

.log-item {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-item:last-child {
  margin-bottom: 0;
}

.log-time {
  color: #9ca3af;
  flex-shrink: 0;
  width: 80px;
}

.log-message {
  flex: 1;
}

.log-item.info .log-message {
  color: #d1d5db;
}

.log-item.success .log-message {
  color: #34d399;
}

.log-item.warning .log-message {
  color: #fbbf24;
}

.log-item.error .log-message {
  color: #f87171;
}

/* 滚动条样式 */
.log-content::-webkit-scrollbar {
  width: 6px;
}

.log-content::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-row .el-col {
    margin-bottom: 20px;
  }
}
</style>