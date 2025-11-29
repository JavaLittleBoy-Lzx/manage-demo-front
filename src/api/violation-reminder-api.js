import request from '@/utils/request'

// 违规提醒API对象
export const violationReminderApi = {
  // 根据车牌号获取未处理的违规提醒
  async getUnprocessedRemindersByPlate(plateNumber) {
    try {
      const response = await request({
        url: '/parking/violationReminders/page',
        method: 'get',
        params: { 
          plateNumber,
          isProcessed: 0,
          current: 1,
          size: 10
        }
      })
      return response
    } catch (error) {
      console.error('获取未处理违规提醒失败:', error)
      throw error
    }
  },

  // 发送违规提醒短信
  async sendViolationReminderSms(phone, templateData) {
    try {
      const response = await request({
        url: '/parking/sms/sendViolationReminder',
        method: 'post',
        data: {
          phone,
          templateData
        }
      })
      return response
    } catch (error) {
      console.error('发送违规提醒短信失败:', error)
      throw error
    }
  },

  // 发送违规短信
  async sendViolationSms(phone, templateData) {
    try {
      const response = await request({
        url: '/parking/sms/sendBlacklistMessage',
        method: 'post',
        data: {
          phone,
          templateData
        }
      })
      return response
    } catch (error) {
      console.error('发送违规短信失败:', error)
      throw error
    }
  },

  // 创建违规提醒记录
  async createViolationReminder(reminderData) {
    try {
      const response = await request({
        url: '/parking/violationReminders/add',
        method: 'post',
        data: reminderData
      })
      return response
    } catch (error) {
      console.error('创建违规提醒记录失败:', error)
      throw error
    }
  },

  // 标记所有提醒为已处理
  async markAllRemindersAsProcessed(plateNumber, processedBy) {
    try {
      // 先获取该车牌号的所有未处理提醒
      const remindersResponse = await this.getUnprocessedRemindersByPlate(plateNumber)
      if (remindersResponse.code === "0" && remindersResponse.data.records.length > 0) {
        // 批量处理所有未处理的提醒
        const promises = remindersResponse.data.records.map(reminder => 
          request({
            url: `/parking/violationReminders/${reminder.id}/process`,
            method: 'put',
            data: { processedBy }
          })
        )
        await Promise.all(promises)
        return { code: "0", msg: "批量处理成功" }
      }
      return { code: "0", msg: "没有需要处理的提醒" }
    } catch (error) {
      console.error('标记提醒为已处理失败:', error)
      throw error
    }
  },

  // 获取违规提醒历史记录
  async getReminderHistory(params) {
    try {
      const response = await request({
        url: `/parking/violationReminders/history/${params.plateNumber}`,
        method: 'get',
        params: {
          parkCode: params.parkCode
        }
      })
      return response
    } catch (error) {
      console.error('获取违规提醒历史失败:', error)
      throw error
    }
  },

  // 获取统计信息
  async getStatistics() {
    try {
      const response = await request({
        url: '/parking/violationReminders/statistics',
        method: 'get'
      })
      return response
    } catch (error) {
      console.error('获取统计信息失败:', error)
      throw error
    }
  }
}

// 违规提醒工具函数
export const reminderUtils = {
  // 构建短信模板数据
  buildSmsTemplateData({ plateNumber, location }) {
    return {
      plateNumber,
      location: location || '停车场',
      timestamp: new Date().toLocaleString('zh-CN'),
      reminderType: 'violation_reminder'
    }
  },

  // 构建违规提醒数据
  buildReminderData({ plateNumber, violationType, location }, ownerInfo) {
    return {
      plateNumber,
      violationType: violationType || '未知',
      location: location || '停车场',
      ownerName: ownerInfo?.name || '',
      ownerPhone: ownerInfo?.phone || '',
      reminderType: 'violation_reminder',
      status: 'pending',
      createdAt: new Date().toISOString(),
      reminderCount: 1
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待处理',
      'processed': '已处理',
      'expired': '已过期'
    }
    return statusMap[status] || '未知'
  },

  // 获取提醒类型文本
  getReminderTypeText(type) {
    const typeMap = {
      'violation_reminder': '违规提醒',
      'violation_notice': '违规通知'
    }
    return typeMap[type] || '未知'
  }
}
