// BigModel API 配置文件

/**
 * 环境配置
 * 根据不同环境使用不同的配置
 */
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development'

  const configs = {
    development: {
      // 开发环境配置
      apiKey: process.env.VUE_APP_BIGMODEL_API_KEY || 'your-dev-api-key',
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      timeout: 30000,
      retryTimes: 3,
      debug: true
    },

    production: {
      // 生产环境配置
      apiKey: process.env.VUE_APP_BIGMODEL_API_KEY,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      timeout: 60000,
      retryTimes: 2,
      debug: false
    },

    testing: {
      // 测试环境配置
      apiKey: process.env.VUE_APP_BIGMODEL_API_KEY || 'test-api-key',
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      timeout: 30000,
      retryTimes: 1,
      debug: true
    }
  }

  return configs[env] || configs.development
}

/**
 * BigModel API 主配置
 */
export const BIGMODEL_CONFIG = {
  // 获取环境配置
  env: getEnvironmentConfig(),

  // 支持的模型列表
  models: {
    // GLM-4 - 最新的通用大模型
    'glm-4': {
      name: 'GLM-4',
      description: '智谱AI最新一代通用大模型，综合能力最强',
      maxTokens: 8192,
      cost: 0.1
    },

    // GLM-3-Turbo - 高性能模型
    'glm-3-turbo': {
      name: 'GLM-3-Turbo',
      description: '高性能模型，响应速度快，成本较低',
      maxTokens: 4096,
      cost: 0.05
    },

    // GLM-4V - 多模态模型（支持图片）
    'glm-4v': {
      name: 'GLM-4V',
      description: '多模态模型，支持图片理解和生成',
      maxTokens: 2048,
      cost: 0.2
    },

    // CodeGeex - 代码专用模型
    'codegeex': {
      name: 'CodeGeex',
      description: '代码生成和解释专用模型',
      maxTokens: 4096,
      cost: 0.08
    }
  },

  // 默认模型配置
  defaultModel: 'glm-3-turbo',

  // 功能配置
  features: {
    // 智能客服配置
    customerService: {
      enabled: true,
      model: 'glm-3-turbo',
      maxContextLength: 10, // 最大上下文轮数
      systemPrompt: '你是一个专业的停车管理系统智能客服助手...',
      welcomeMessage: '您好！我是停车管理系统的智能助手，有什么可以帮助您的吗？'
    },

    // 违规描述生成配置
    violationDescription: {
      enabled: true,
      model: 'glm-4',
      template: '基于以下信息生成规范的违规描述...',
      maxLength: 200
    },

    // 数据报告生成配置
    dataReport: {
      enabled: true,
      model: 'glm-4',
      template: '生成停车数据分析报告...',
      maxTokens: 2000
    },

    // 通知文本生成配置
    notificationText: {
      enabled: true,
      model: 'glm-3-turbo',
      templates: {
        violation: '违规停车通知模板',
        payment: '缴费提醒通知模板',
        maintenance: '系统维护通知模板'
      }
    },

    // 用户行为分析配置
    behaviorAnalysis: {
      enabled: true,
      model: 'glm-4',
      riskLevels: ['low', 'medium', 'high'],
      analysisWindow: 24 * 60 * 60 * 1000 // 24小时
    }
  },

  // 限流配置
  rateLimit: {
    // 每分钟最大请求数
    requestsPerMinute: 60,
    // 每日最大请求数
    requestsPerDay: 1000,
    // 并发请求数
    concurrentRequests: 5
  },

  // 缓存配置
  cache: {
    // 缓存时间（毫秒）
    ttl: 30 * 60 * 1000, // 30分钟
    // 最大缓存条目数
    maxEntries: 1000,
    // 缓存键前缀
    keyPrefix: 'bigmodel:'
  },

  // 错误处理配置
  errorHandling: {
    // 重试次数
    retryAttempts: 3,
    // 重试延迟（毫秒）
    retryDelay: 1000,
    // 错误日志记录
    logErrors: true,
    // 错误通知邮箱
    errorNotificationEmail: 'admin@example.com'
  }
}

/**
 * 获取API密钥
 * @returns {string} API密钥
 */
export const getApiKey = () => {
  const config = BIGMODEL_CONFIG.env
  if (!config.apiKey) {
    console.error('BigModel API Key not configured!')
    throw new Error('BigModel API Key not configured')
  }
  return config.apiKey
}

/**
 * 获取完整的请求头
 * @returns {Object} 请求头对象
 */
export const getHeaders = () => {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * 验证配置
 * @returns {boolean} 配置是否有效
 */
export const validateConfig = () => {
  const config = BIGMODEL_CONFIG.env

  try {
    // 检查API密钥
    if (!config.apiKey || config.apiKey === 'your-dev-api-key') {
      console.warn('BigModel API Key not properly configured')
      return false
    }

    // 检查基础URL
    if (!config.baseURL) {
      console.error('BigModel Base URL not configured')
      return false
    }

    return true
  } catch (error) {
    console.error('BigModel configuration validation failed:', error)
    return false
  }
}

/**
 * 获取模型配置
 * @param {string} modelName - 模型名称
 * @returns {Object|null} 模型配置
 */
export const getModelConfig = (modelName) => {
  return BIGMODEL_CONFIG.models[modelName] || null
}

/**
 * 检查功能是否启用
 * @param {string} featureName - 功能名称
 * @returns {boolean} 功能是否启用
 */
export const isFeatureEnabled = (featureName) => {
  return BIGMODEL_CONFIG.features[featureName]?.enabled || false
}

/**
 * 获取功能配置
 * @param {string} featureName - 功能名称
 * @returns {Object|null} 功能配置
 */
export const getFeatureConfig = (featureName) => {
  return BIGMODEL_CONFIG.features[featureName] || null
}

export default BIGMODEL_CONFIG