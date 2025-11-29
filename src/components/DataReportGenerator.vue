<template>
  <div class="data-report-generator">
    <!-- 生成报告按钮 -->
    <el-button
      type="success"
      :icon="Document"
      :loading="isGenerating"
      @click="generateReport"
      size="default"
    >
      {{ isGenerating ? 'AI分析中...' : '生成智能分析报告' }}
    </el-button>

    <!-- 报告预览对话框 -->
    <el-dialog
      v-model="showReportDialog"
      title="智能数据分析报告"
      width="80%"
      :close-on-click-modal="false"
      fullscreen
    >
      <div v-if="reportContent" class="report-container">
        <!-- 报告头部 -->
        <div class="report-header">
          <div class="report-title">
            <h2>{{ reportTitle }}</h2>
            <div class="report-meta">
              <span>生成时间：{{ formatDateTime(reportGeneratedTime) }}</span>
              <span>数据周期：{{ reportPeriod }}</span>
              <span>报告类型：{{ reportTypeText }}</span>
            </div>
          </div>
          <div class="report-actions">
            <el-dropdown @command="exportReport">
              <el-button type="primary">
                导出报告
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pdf">导出为 PDF</el-dropdown-item>
                  <el-dropdown-item command="word">导出为 Word</el-dropdown-item>
                  <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="printReport">
              <el-icon><Printer /></el-icon>
              打印
            </el-button>
          </div>
        </div>

        <!-- 报告内容 -->
        <div class="report-content">
          <div v-html="formattedReportContent" class="report-text"></div>
        </div>

        <!-- 数据摘要 -->
        <div class="data-summary" v-if="summaryData">
          <h3>数据摘要</h3>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(item, key) in summaryData" :key="key">
              <div class="summary-card">
                <div class="summary-label">{{ getSummaryLabel(key) }}</div>
                <div class="summary-value">{{ formatSummaryValue(key, item) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 配置面板 -->
      <template v-if="showConfigPanel">
        <div class="config-panel">
          <h3>报告配置</h3>
          <el-form :model="reportConfig" label-width="120px">
            <el-form-item label="报告类型">
              <el-select v-model="reportConfig.type" placeholder="请选择报告类型">
                <el-option label="日报" value="daily"></el-option>
                <el-option label="周报" value="weekly"></el-option>
                <el-option label="月报" value="monthly"></el-option>
                <el-option label="季报" value="quarterly"></el-option>
                <el-option label="年报" value="yearly"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="时间范围">
              <el-date-picker
                v-model="reportConfig.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="报告重点">
              <el-checkbox-group v-model="reportConfig.focusAreas">
                <el-checkbox label="utilization">车位利用率分析</el-checkbox>
                <el-checkbox label="violations">违规情况分析</el-checkbox>
                <el-checkbox label="revenue">收入统计分析</el-checkbox>
                <el-checkbox label="trends">趋势预测分析</el-checkbox>
                <el-checkbox label="suggestions">改进建议</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="额外说明">
              <el-input
                v-model="reportConfig.notes"
                type="textarea"
                :rows="3"
                placeholder="请输入额外要求或说明..."
              />
            </el-form-item>
          </el-form>

          <div class="config-actions">
            <el-button @click="cancelConfig">取消</el-button>
            <el-button type="primary" @click="confirmConfig">确定生成</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 快捷配置 -->
    <el-dropdown @command="quickGenerate" trigger="click">
      <el-button>
        快速报告
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="daily">今日数据报告</el-dropdown-item>
          <el-dropdown-item command="weekly">本周数据报告</el-dropdown-item>
          <el-dropdown-item command="monthly">本月数据报告</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, ArrowDown, Printer } from '@element-plus/icons-vue'
import { bigModelApi } from '@/api/bigmodel'
import { isFeatureEnabled } from '@/config/bigmodel'
import * as XLSX from 'xlsx'

export default {
  name: 'DataReportGenerator',
  components: {
    Document,
    ArrowDown,
    Printer
  },
  props: {
    // 基础数据
    baseData: {
      type: Object,
      required: true
    },
    // 数据统计信息
    statistics: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['report-generated'],
  setup(props, { emit }) {
    // 响应式数据
    const isGenerating = ref(false)
    const showReportDialog = ref(false)
    const showConfigPanel = ref(false)
    const reportContent = ref('')
    const reportGeneratedTime = ref(null)
    const summaryData = ref(null)

    // 报告配置
    const reportConfig = reactive({
      type: 'daily',
      dateRange: [],
      focusAreas: ['utilization', 'violations'],
      notes: ''
    })

    // 检查功能是否启用
    const checkFeatureEnabled = () => {
      if (!isFeatureEnabled('dataReport')) {
        ElMessage.error('数据报告生成功能未启用')
        return false
      }
      return true
    }

    // 计算属性
    const reportTitle = computed(() => {
      const typeText = reportTypeText.value
      return `停车管理${typeText}分析报告`
    })

    const reportTypeText = computed(() => {
      const typeMap = {
        daily: '日',
        weekly: '周',
        monthly: '月',
        quarterly: '季',
        yearly: '年'
      }
      return typeMap[reportConfig.type] || '日'
    })

    const reportPeriod = computed(() => {
      if (reportConfig.dateRange && reportConfig.dateRange.length === 2) {
        return `${reportConfig.dateRange[0]} 至 ${reportConfig.dateRange[1]}`
      }
      return '今日'
    })

    // 格式化报告内容
    const formattedReportContent = computed(() => {
      return reportContent.value
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/(\d+\.) (.*)$/gm, '<div class="report-item"><strong>$1</strong> $2</div>')
    })

    // 生成报告
    const generateReport = async () => {
      if (!checkFeatureEnabled()) return

      showConfigPanel.value = true
      showReportDialog.value = true
    }

    // 确认配置并生成
    const confirmConfig = async () => {
      if (!reportConfig.dateRange || reportConfig.dateRange.length !== 2) {
        // 如果没有选择时间范围，使用默认时间
        const today = new Date()
        const startDate = new Date(today)

        switch (reportConfig.type) {
          case 'daily':
            startDate.setDate(today.getDate() - 1)
            break
          case 'weekly':
            startDate.setDate(today.getDate() - 7)
            break
          case 'monthly':
            startDate.setMonth(today.getMonth() - 1)
            break
        }

        reportConfig.dateRange = [
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ]
      }

      showConfigPanel.value = false
      isGenerating.value = true

      try {
        // 构建报告数据
        const reportData = {
          ...props.baseData,
          ...props.statistics,
          reportType: reportConfig.type,
          dateRange: reportConfig.dateRange,
          focusAreas: reportConfig.focusAreas,
          notes: reportConfig.notes,
          generatedTime: new Date().toISOString()
        }

        const response = await bigModelApi.generateDataReport(reportData, reportConfig.type)

        if (response && response.choices && response.choices.length > 0) {
          reportContent.value = response.choices[0].message.content
          reportGeneratedTime.value = Date.now()
          summaryData.value = extractSummaryData(reportData)

          emit('report-generated', {
            content: reportContent.value,
            data: reportData,
            config: { ...reportConfig }
          })

          ElMessage.success('数据分析报告生成成功')
        } else {
          throw new Error('生成失败，返回数据格式错误')
        }
      } catch (error) {
        console.error('生成数据报告失败:', error)
        ElMessage.error('生成失败：' + (error.message || '服务器错误'))
      } finally {
        isGenerating.value = false
      }
    }

    // 快速生成
    const quickGenerate = async (type) => {
      if (!checkFeatureEnabled()) return

      reportConfig.type = type

      // 设置默认时间范围
      const today = new Date()
      const startDate = new Date(today)

      switch (type) {
        case 'daily':
          startDate.setDate(today.getDate() - 1)
          break
        case 'weekly':
          startDate.setDate(today.getDate() - 7)
          break
        case 'monthly':
          startDate.setMonth(today.getMonth() - 1)
          break
      }

      reportConfig.dateRange = [
        startDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]

      // 直接生成报告
      showConfigPanel.value = false
      showReportDialog.value = true
      await confirmConfig()
    }

    // 取消配置
    const cancelConfig = () => {
      showConfigPanel.value = false
      showReportDialog.value = false
    }

    // 导出报告
    const exportReport = (format) => {
      if (!reportContent.value) {
        ElMessage.warning('没有可导出的报告内容')
        return
      }

      switch (format) {
        case 'pdf':
          exportToPDF()
          break
        case 'word':
          exportToWord()
          break
        case 'excel':
          exportToExcel()
          break
        default:
          ElMessage.error('不支持的导出格式')
      }
    }

    // 导出为PDF（模拟）
    const exportToPDF = () => {
      // 这里应该调用真实的PDF导出库，如html2pdf.js
      ElMessage.info('PDF导出功能需要集成html2pdf.js库')
    }

    // 导出为Word（模拟）
    const exportToWord = () => {
      ElMessage.info('Word导出功能需要集成docx库')
    }

    // 导出为Excel
    const exportToExcel = () => {
      try {
        const workbook = XLSX.utils.book_new()

        // 创建报告内容工作表
        const reportData = [
          ['报告标题', reportTitle.value],
          ['生成时间', formatDateTime(reportGeneratedTime.value)],
          ['数据周期', reportPeriod.value],
          ['', ''],
          ...reportContent.value.split('\n').map(line => ['报告内容', line])
        ]

        const worksheet = XLSX.utils.aoa_to_sheet(reportData)
        XLSX.utils.book_append_sheet(workbook, worksheet, '数据报告')

        // 下载文件
        const fileName = `${reportTitle.value}_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(workbook, fileName)

        ElMessage.success('Excel报告导出成功')
      } catch (error) {
        console.error('导出Excel失败:', error)
        ElMessage.error('导出失败：' + error.message)
      }
    }

    // 打印报告
    const printReport = () => {
      const printWindow = window.open('', '_blank')
      const printContent = `
        <html>
          <head>
            <title>${reportTitle.value}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1, h2, h3 { color: #333; }
              .report-meta { color: #666; font-size: 14px; margin-bottom: 20px; }
              .report-text { line-height: 1.6; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${reportTitle.value}</h1>
            <div class="report-meta">
              <p>生成时间：${formatDateTime(reportGeneratedTime.value)}</p>
              <p>数据周期：${reportPeriod.value}</p>
            </div>
            <div class="report-text">${reportContent.value}</div>
          </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }

    // 提取摘要数据
    const extractSummaryData = (data) => {
      return {
        totalParkingSpaces: data.totalParkingSpaces || 0,
        occupiedSpaces: data.occupiedSpaces || 0,
        utilizationRate: data.utilizationRate || 0,
        todayViolations: data.todayViolations || 0,
        monthViolations: data.monthViolations || 0,
        totalRevenue: data.totalRevenue || 0
      }
    }

    // 获取摘要标签
    const getSummaryLabel = (key) => {
      const labels = {
        totalParkingSpaces: '总车位数',
        occupiedSpaces: '占用车位',
        utilizationRate: '使用率',
        todayViolations: '今日违规',
        monthViolations: '本月违规',
        totalRevenue: '总收入'
      }
      return labels[key] || key
    }

    // 格式化摘要值
    const formatSummaryValue = (key, value) => {
      if (key === 'utilizationRate') {
        return `${value}%`
      }
      if (key === 'totalRevenue') {
        return `¥${value.toLocaleString()}`
      }
      return value.toLocaleString()
    }

    // 格式化日期时间
    const formatDateTime = (timestamp) => {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    return {
      isGenerating,
      showReportDialog,
      showConfigPanel,
      reportContent,
      reportGeneratedTime,
      summaryData,
      reportConfig,
      reportTitle,
      reportTypeText,
      reportPeriod,
      formattedReportContent,
      generateReport,
      quickGenerate,
      confirmConfig,
      cancelConfig,
      exportReport,
      printReport,
      getSummaryLabel,
      formatSummaryValue,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.data-report-generator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.report-container {
  max-width: 100%;
  margin: 0 auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.report-title h2 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 600;
}

.report-meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.report-content {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.report-text {
  line-height: 1.8;
  color: #374151;
  font-size: 15px;
  white-space: pre-wrap;
}

.report-text h1 {
  color: #111827;
  font-size: 24px;
  margin: 20px 0 15px 0;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.report-text h2 {
  color: #1f2937;
  font-size: 20px;
  margin: 18px 0 12px 0;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 6px;
}

.report-text h3 {
  color: #374151;
  font-size: 18px;
  margin: 15px 0 10px 0;
}

.report-text .report-item {
  margin: 8px 0;
  padding-left: 20px;
}

.report-text li {
  margin: 5px 0;
  list-style-type: disc;
}

.data-summary {
  margin-top: 30px;
}

.data-summary h3 {
  margin: 0 0 15px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.summary-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #059669;
}

.config-panel {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.config-panel h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.config-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .report-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .report-meta {
    flex-direction: column;
    gap: 5px;
  }

  .report-actions {
    justify-content: center;
  }

  .data-summary .el-col {
    margin-bottom: 10px;
  }
}

/* 打印样式 */
@media print {
  .report-actions,
  .config-panel {
    display: none !important;
  }

  .report-container {
    max-width: 100%;
  }
}
</style>