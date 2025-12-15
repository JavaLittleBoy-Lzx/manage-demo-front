import request from '@/utils/request'

export const violationApi = {
  // 获取违规记录列表
  getViolations(params) {
    return request({
      url: '/parking/violations',
      method: 'get',
      params
    })
  },

  // 创建违规记录
  createViolation(data) {
    return request({
      url: '/parking/violations',
      method: 'post',
      data
    })
  },

  // 更新违规记录状态
  updateViolationStatus(id, params) {
    return request({
      url: `/parking/violations/${id}/status`,
      method: 'put',
      params
    })
  },

  // 根据车牌号查询预约记录
  getAppointmentRecords(plateNumber) {
    return request({
      url: `/parking/violations/appointment-records/${plateNumber}`,
      method: 'get'
    })
  },

  // 根据车牌号分析违规情况
  analyzeViolationByPlate(plateNumber) {
    return request({
      url: `/parking/violations/appointment-analysis/${plateNumber}`,
      method: 'get'
    })
  },

  // 获取车主信息
  getOwnerByPlateNumber(plateNumber) {
    return request({
      url: `/parking/violations/owners/by-plate/${plateNumber}`,
      method: 'get'
    })
  },

  // 获取车牌号搜索建议
  getPlateSuggestions(keyword) {
    return request({
      url: '/parking/violations/owners/plate-suggestions',
      method: 'get',
      params: { keyword }
    })
  },

  // 🆕 从违规记录中获取车牌号搜索建议
  getViolationPlateSuggestions(keyword, parkCode) {
    return request({
      url: '/parking/violations/violation-plate-suggestions',
      method: 'get',
      params: { keyword, parkCode }
    })
  },

  // 获取违规统计
  getStatistics(params) {
    return request({
      url: '/parking/violations/statistics',
      method: 'get',
      params
    })
  },

  // 获取高风险车辆
  getHighRiskVehicles(params) {
    return request({
      url: '/parking/violations/high-risk-vehicles',
      method: 'get',
      params
    })
  },

  // 🆕 获取月票车超时配置
  getMonthlyTicketConfig(parkCode) {
    return request({
      url: '/parking/violations/monthly-ticket-config',
      method: 'get',
      params: { parkCode }
    })
  },

  // 🆕 保存月票车超时配置
  saveMonthlyTicketConfig(data) {
    return request({
      url: '/parking/violations/monthly-ticket-config',
      method: 'post',
      params: data
    })
  },

  // 🆕 保存月票车完整配置（包含过夜停车配置）
  saveMonthlyTicketFullConfig(data) {
    // 🔧 对于包含数组的参数，使用URLSearchParams确保正确传递
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        // 数组参数：每个元素单独添加
        data[key].forEach(item => {
          params.append(key, item);
        });
      } else {
        // 普通参数
        params.append(key, data[key]);
      }
    });
    
    return request({
      url: '/parking/violations/monthly-ticket-full-config',
      method: 'post',
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  // 🆕 获取月票车违规记录
  getMonthlyTicketViolations(params) {
    return request({
      url: '/parking/violations/monthly-ticket-violations',
      method: 'get',
      params
    })
  },

  // 🆕 获取指定车场的月票类型列表
  getTicketTypesByParkCode(parkCode) {
    return request({
      url: '/parking/vehicleReservation/getTicketTypesByParkCode',
      method: 'get',
      params: { parkCode }
    })
  },


  // 🆕 获取所有车场列表（管理员使用）
  getCommunityList() {
    return request({
      url: `/parking/community/list`,
      method: 'get'
    })
  },

  // 🆕 保存月票车配置（包含免检类型）
  saveMonthlyTicketConfigWithExempt(data) {
    return request({
      url: '/parking/violations/monthly-ticket-config-with-exempt',
      method: 'post',
      params: data
    })
  },

  // ==================== 🆕 违规记录处理功能API ====================

  /**
   * 手动处理单条违规记录（支持黑名单）
   * @param {Number} violationId 违规记录ID
   * @param {Object} processParams 处理参数（包含黑名单相关参数）
   */
  processViolation(violationId, processParams) {
    return request({
      url: `/parking/violations/${violationId}/process`,
      method: 'post',
      data: processParams
    })
  },

  /**
   * 批量处理违规记录（支持黑名单）
   * @param {Array} violationIds 违规记录ID列表
   * @param {Object} processParams 处理参数（包含黑名单相关参数）
   */
  batchProcessViolations(violationIds, processParams) {
    return request({
      url: '/parking/violations/batch-process',
      method: 'post',
      data: {
        violationIds: violationIds,
        ...processParams
      }
    })
  },

  /**
   * 手动处理单条违规记录并加入黑名单
   * @param {Number} violationId 违规记录ID
   * @param {String} processRemark 处理备注（可选）
   * @param {String} username 操作用户名
   */
  processViolationWithBlacklist(violationId, processRemark, username) {
    return request({
      url: `/parking/violations/${violationId}/process-with-blacklist`,
      method: 'post',
      params: {
        processRemark: processRemark || '',
        username: username
      }
    })
  },

  /**
   * 处理该车辆的所有未处理违规记录（支持黑名单）
   * @param {String} plateNumber 车牌号
   * @param {Object} processParams 处理参数（包含黑名单相关参数）
   */
  processAllViolationsByPlate(plateNumber, processParams) {
    return request({
      url: `/parking/violations/process-all-by-plate`,
      method: 'post',
      params: {
        plateNumber: plateNumber
      },
      data: processParams
    })
  },

  /**
   * 批量处理选中的违规记录（支持黑名单）- 已废弃，使用batchProcessViolations代替
   * @deprecated
   */
  batchProcessViolationsWithBlacklist(violationIds, processRemark, username) {
    return request({
      url: '/parking/violations/batch-process-with-blacklist',
      method: 'post',
      data: {
        violationIds: violationIds,
        processRemark: processRemark || '',
        username: username
      }
    })
  },

  /**
   * 批量处理所有相关车辆的所有未处理违规记录（支持黑名单）
   * @param {Array} plateNumbers 车牌号列表
   * @param {Object} processParams 处理参数（包含黑名单相关参数）
   */
  batchProcessAllViolationsByPlates(plateNumbers, processParams) {
    return request({
      url: '/parking/violations/batch-process-all-by-plates',
      method: 'post',
      data: {
        plateNumbers: plateNumbers,
        ...processParams
      }
    })
  },

  /**
   * 获取黑名单类型列表（从ACMS外部接口获取）
   * @param {String} parkName 停车场名称
   */
  getBlacklistTypes(parkName) {
    return request({
      // url: 'https://csharphrb.picp.vip/parking/acms/vip/blacklist-types',
      url: 'https://www.xuerparking.cn:8543/parking/acms/vip/blacklist-types',
      method: 'post',
      data: {
        parkName: parkName || '东北林业大学'
      }
    })
  },

  /**
   * 🆕 按车场编码获取黑名单类型列表（从ACMS外部接口获取）
   * @param {String} parkCode 车场编码
   */
  getBlacklistTypesByParkCode(parkCode) {
    return request({
      url: '/parking/blackList/getSpecialCarTypeList',
      method: 'get',
      params: {
        parkCodeList: parkCode
      }
    })
  },

  // ==================== 🆕 东北林业大学违规阈值配置API ====================

  /**
   * 获取东北林业大学违规阈值配置
   */
  getNebuViolationConfig() {
    return request({
      url: '/parking/violations/nebu-config',
      method: 'get'
    })
  },

  /**
   * 保存东北林业大学违规阈值配置
   * @param {Object} data 配置数据 { parkName, maxViolationCount }
   */
  saveNebuViolationConfig(data) {
    return request({
      url: '/parking/violations/nebu-config',
      method: 'post',
      params: data
    })
  },

  // ==================== 🆕 学院新城拉黑规则配置API ====================

  /**
   * 获取学院新城拉黑规则配置
   */
  getCollegeNewCityConfig() {
    return request({
      url: '/parking/violations/college-new-city-config',
      method: 'get'
    })
  },

  /**
   * 保存学院新城拉黑规则配置
   * @param {Object} data 配置数据 { parkCode, blacklistTimeHours, blacklistType, isPermanent, blacklistValidDays }
   */
  saveCollegeNewCityConfig(data) {
    return request({
      url: '/parking/violations/college-new-city-config',
      method: 'post',
        params: data
      })
    },

    // ==================== 违规提醒查看功能API ====================

    /**
     * 获取违规提醒记录列表
     * @param {Object} params 查询参数
     * @param {String} params.plateNumber 车牌号（可选）
     * @param {String} params.ownerName 车主姓名（可选）
     * @param {String} params.violationType 违规类型（可选）
     * @param {Number} params.isProcessed 处理状态（可选）
     * @param {String} params.startTime 开始时间（可选）
     * @param {String} params.endTime 结束时间（可选）
     * @param {String} params.parkCode 车场编码（可选）
     * @param {Number} params.current 页码（可选）
     * @param {Number} params.size 每页大小（可选）
     */
    getViolationReminders(params) {
      return request({
        url: '/parking/violationReminders/page',
        method: 'get',
        params: params
      })
    },

    /**
     * 处理违规提醒记录（标记为已处理）
     * @param {Number} id 违规提醒记录ID
     * @param {Object} data 处理数据
     * @param {String} data.processedBy 处理人
     */
    processViolationReminder(id, data) {
      return request({
        url: `/parking/violationReminders/${id}/process`,
        method: 'put',
        data: data
      })
    },

    /**
     * 重发违规提醒短信
     * @param {Number} id 违规提醒记录ID
     */
    resendViolationReminder(id) {
      return request({
        url: `/parking/violationReminders/${id}/resend`,
        method: 'post'
      })
    },

    /**
     * 获取违规提醒统计信息
     * @param {Object} params 查询参数
     * @param {String} params.startTime 开始时间（可选）
     * @param {String} params.endTime 结束时间（可选）
     * @param {String} params.parkCode 车场编码（可选）
     */
    getViolationReminderStatistics(params) {
      return request({
        url: '/parking/violationReminders/statistics',
        method: 'get',
        params: params
      })
    }
}

export default violationApi 