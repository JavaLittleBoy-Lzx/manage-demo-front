import request from '@/utils/request'

/**
 * 后端AI接口服务
 * 前端通过调用后端接口来使用BigModel AI功能
 */

// 基础配置
const AI_API = {
  baseURL: '', // 使用request.js中配置的baseURL
  timeout: 60000
}

/**
 * 智能客服接口
 * @param {string} question - 用户问题
 * @param {string} context - 上下文信息（可选）
 * @returns {Promise} 后端响应
 */
export const customerService = (question, context = '') => {
  return request({
    url: '/api/ai/customer-service',
    method: 'post',
    data: {
      question,
      context
    },
    timeout: AI_API.timeout
  })
}

/**
 * 生成违规描述接口
 * @param {Object} violationData - 违规数据
 * @returns {Promise} 后端响应
 */
export const generateViolationDescription = (violationData) => {
  return request({
    url: '/api/ai/violation-description',
    method: 'post',
    data: violationData,
    timeout: AI_API.timeout
  })
}

/**
 * 生成数据分析报告接口
 * @param {Object} reportData - 报告数据
 * @param {string} reportType - 报告类型（daily/weekly/monthly）
 * @returns {Promise} 后端响应
 */
export const generateDataReport = (reportData, reportType = 'daily') => {
  return request({
    url: '/api/ai/data-report',
    method: 'post',
    data: {
      ...reportData,
      reportType
    },
    timeout: AI_API.timeout
  })
}

/**
 * 生成通知文本接口
 * @param {string} notificationType - 通知类型
 * @param {Object} params - 通知参数
 * @returns {Promise} 后端响应
 */
export const generateNotificationText = (notificationType, params) => {
  return request({
    url: '/api/ai/notification-text',
    method: 'post',
    data: {
      notificationType,
      params
    },
    timeout: AI_API.timeout
  })
}

/**
 * 用户行为分析接口
 * @param {Array} userActivities - 用户活动日志
 * @param {string} userId - 用户ID
 * @returns {Promise} 后端响应
 */
export const analyzeUserBehavior = (userActivities, userId) => {
  return request({
    url: '/api/ai/behavior-analysis',
    method: 'post',
    data: {
      userActivities,
      userId
    },
    timeout: AI_API.timeout
  })
}

/**
 * 智能问答助手接口
 * @param {string} question - 问题
 * @param {Array} documents - 参考文档（可选）
 * @returns {Promise} 后端响应
 */
export const intelligentQA = (question, documents = []) => {
  return request({
    url: '/api/ai/intelligent-qa',
    method: 'post',
    data: {
      question,
      documents
    },
    timeout: AI_API.timeout
  })
}

/**
 * 获取AI功能状态接口
 * @returns {Promise} AI功能启用状态
 */
export const getAIStatus = () => {
  return request({
    url: '/api/ai/status',
    method: 'get'
  })
}

/**
 * 获取AI使用统计接口
 * @returns {Promise} AI使用统计数据
 */
export const getAIUsage = () => {
  return request({
    url: '/api/ai/usage',
    method: 'get'
  })
}

// 导出统一接口
export const aiApi = {
  customerService,
  generateViolationDescription,
  generateDataReport,
  generateNotificationText,
  analyzeUserBehavior,
  intelligentQA,
  getAIStatus,
  getAIUsage
}

export default aiApi