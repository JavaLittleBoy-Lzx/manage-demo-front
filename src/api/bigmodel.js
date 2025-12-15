import { aiApi } from './backend'
import { isFeatureEnabled } from '@/config/bigmodel'

/**
 * 前端AI服务代理类
 * 通过后端接口调用BigModel AI功能
 * 这样做的好处：
 * 1. 安全性：API密钥不会暴露在前端
 * 2. 统一管理：所有AI请求通过后端统一管理
 * 3. 缓存优化：后端可以实现请求缓存
 * 4. 错误处理：统一的错误处理和重试机制
 */
export class BigModelService {
  /**
   * 检查功能是否启用
   * @param {string} feature - 功能名称
   * @returns {boolean} 是否启用
   */
  isFeatureEnabled(feature) {
    return isFeatureEnabled(feature)
  }

  /**
   * 智能客服对话
   * @param {string} question - 用户问题
   * @param {string} context - 上下文信息
   * @returns {Promise} AI回答
   */
  async customerService(question, context = '') {
    if (!this.isFeatureEnabled('customerService')) {
      throw new Error('智能客服功能未启用')
    }
    return aiApi.customerService(question, context)
  }

  /**
   * 生成违规描述
   * @param {Object} violationData - 违规数据
   * @returns {Promise} 生成的违规描述
   */
  async generateViolationDescription(violationData) {
    if (!this.isFeatureEnabled('violationDescription')) {
      throw new Error('违规描述生成功能未启用')
    }
    return aiApi.generateViolationDescription(violationData)
  }

  /**
   * 生成数据分析报告
   * @param {Object} data - 分析数据
   * @param {string} reportType - 报告类型
   * @returns {Promise} 生成的分析报告
   */
  async generateDataReport(data, reportType = 'daily') {
    if (!this.isFeatureEnabled('dataReport')) {
      throw new Error('数据报告生成功能未启用')
    }
    return aiApi.generateDataReport(data, reportType)
  }

  /**
   * 生成通知文本
   * @param {string} notificationType - 通知类型
   * @param {Object} params - 通知参数
   * @returns {Promise} 生成的通知文本
   */
  async generateNotificationText(notificationType, params) {
    if (!this.isFeatureEnabled('notificationText')) {
      throw new Error('通知文本生成功能未启用')
    }
    return aiApi.generateNotificationText(notificationType, params)
  }

  /**
   * 用户行为分析
   * @param {Array} userActivities - 用户活动日志
   * @param {string} userId - 用户ID
   * @returns {Promise} 分析结果
   */
  async analyzeUserBehavior(userActivities, userId) {
    if (!this.isFeatureEnabled('behaviorAnalysis')) {
      throw new Error('用户行为分析功能未启用')
    }
    return aiApi.analyzeUserBehavior(userActivities, userId)
  }

  /**
   * 智能问答助手
   * @param {string} question - 问题
   * @param {Array} documents - 参考文档
   * @returns {Promise} 回答
   */
  async intelligentQA(question, documents = []) {
    return aiApi.intelligentQA(question, documents)
  }

  /**
   * 获取AI功能状态
   * @returns {Promise} AI功能启用状态
   */
  async getAIStatus() {
    return aiApi.getAIStatus()
  }

  /**
   * 获取AI使用统计
   * @returns {Promise} AI使用统计数据
   */
  async getAIUsage() {
    return aiApi.getAIUsage()
  }
}

// 创建实例
export const bigModelService = new BigModelService()

// 导出便捷方法（保持向后兼容）
export const bigModelApi = {
  // 智能客服
  customerService: (question, context) => bigModelService.customerService(question, context),

  // 生成违规描述
  generateViolationDescription: (violationData) =>
    bigModelService.generateViolationDescription(violationData),

  // 生成数据报告
  generateDataReport: (data, reportType) =>
    bigModelService.generateDataReport(data, reportType),

  // 生成通知文本
  generateNotificationText: (notificationType, params) =>
    bigModelService.generateNotificationText(notificationType, params),

  // 用户行为分析
  analyzeUserBehavior: (userActivities, userId) =>
    bigModelService.analyzeUserBehavior(userActivities, userId),

  // 智能问答
  intelligentQA: (question, documents) =>
    bigModelService.intelligentQA(question, documents),

  // 状态和统计
  getAIStatus: () => bigModelService.getAIStatus(),
  getAIUsage: () => bigModelService.getAIUsage()
}

export default bigModelApi