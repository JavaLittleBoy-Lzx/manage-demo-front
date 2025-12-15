/**
 * AI 功能使用示例代码
 * 复制这些代码片段到你的项目中使用
 */

import { bigModelApi } from '@/api/bigmodel'
import { ElMessage } from 'element-plus'

// ============================================
// 示例 1: 生成违规描述（最常用）
// ============================================
export const generateViolationDescription = async (violationData) => {
  try {
    const response = await bigModelApi.generateViolationDescription({
      licensePlate: violationData.licensePlate,
      violationType: violationData.violationType,
      location: violationData.location,
      violationTime: violationData.violationTime,
      description: violationData.description || '',
      reporter: violationData.reporter || '管理员'
    })
    
    if (response.code === 200) {
      ElMessage.success('AI描述生成成功')
      return response.data.description
    }
    
    throw new Error(response.message)
  } catch (error) {
    console.error('AI生成失败:', error)
    ElMessage.error(`生成失败: ${error.message}`)
    return null
  }
}

// ============================================
// 示例 2: 智能客服对话
// ============================================
export const askCustomerService = async (question, context = '') => {
  try {
    const response = await bigModelApi.customerService(question, context)
    
    if (response.code === 200) {
      return response.data.answer
    }
    
    throw new Error(response.message)
  } catch (error) {
    console.error('客服调用失败:', error)
    ElMessage.error('客服暂时不可用')
    return null
  }
}

// ============================================
// 示例 3: 生成数据分析报告
// ============================================
export const generateDataReport = async (statistics, reportType = 'daily') => {
  try {
    const response = await bigModelApi.generateDataReport(
      { statistics },
      reportType
    )
    
    if (response.code === 200) {
      return {
        report: response.data.report,
        insights: response.data.insights,
        recommendations: response.data.recommendations
      }
    }
    
    throw new Error(response.message)
  } catch (error) {
    console.error('报告生成失败:', error)
    ElMessage.error('报告生成失败')
    return null
  }
}

// ============================================
// 示例 4: 检查 AI 状态
// ============================================
export const checkAIStatus = async () => {
  try {
    const response = await bigModelApi.getAIStatus()
    
    if (response.code === 200) {
      return {
        enabled: response.data.enabled,
        model: response.data.model,
        status: response.data.status
      }
    }
    
    return { enabled: false, status: '未知' }
  } catch (error) {
    console.error('AI状态检查失败:', error)
    return { enabled: false, status: '异常' }
  }
}

// ============================================
// 示例 5: 批量生成（顺序执行）
// ============================================
export const batchGenerateDescriptions = async (violations) => {
  const results = []
  
  for (const violation of violations) {
    const description = await generateViolationDescription(violation)
    results.push({
      ...violation,
      description: description || violation.description
    })
  }
  
  return results
}

// ============================================
// 示例 6: 带重试的 AI 调用
// ============================================
export const callWithRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      console.log(`重试 ${i + 1}/${maxRetries}...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用示例
export const safeGenerateDescription = (data) => {
  return callWithRetry(
    () => bigModelApi.generateViolationDescription(data),
    3,
    2000
  )
}
