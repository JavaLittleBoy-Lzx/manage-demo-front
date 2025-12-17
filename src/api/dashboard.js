import request from '../utils/request';

export const dashboardApi = {
  // 保留的现有接口
  getRealtimeOverview() {
    return request({
      url: '/api/dashboard/realtime-overview',
      method: 'GET'
    });
  },

  getTrafficTrend(days = 7, parkCode = '') {
    return request({
      url: '/api/dashboard/traffic-trend',
      method: 'GET',
      params: { days, parkCode }
    });
  },

  getViolationTypeDistribution(days = 30) {
    return request({
      url: '/api/dashboard/violation-type-distribution',
      method: 'GET',
      params: { days }
    });
  },

  getMonthTicketUsage() {
    return request({
      url: '/api/dashboard/month-ticket-usage',
      method: 'GET'
    });
  },

  // ========== 数据概览模块 ==========
  // 各车场预约数量统计 (基于 vehicle_reservation)
  getParkAppointmentStats(days = 7) {
    return request({
      url: '/api/dashboard/park-appointment-stats',
      method: 'GET', 
      params: { days }
    });
  },

  // 各车场进场数量统计 (基于 vehicle_reservation.enter_time)
  getParkEntryStats(days = 7) {
    return request({
      url: '/api/dashboard/park-entry-stats',
      method: 'GET',
      params: { days }
    });
  },

  // 业主按小区统计 (基于现有 owner 表)
  getOwnerByCommunityStats() {
    return request({
      url: '/api/dashboard/owner-community-stats', 
      method: 'GET'
    });
  },

  // 车辆类型统计 (基于车牌规律分析)
  getVehicleTypeStats() {
    return request({
      url: '/api/dashboard/vehicle-type-stats',
      method: 'GET'
    });
  },

  // ========== 业务分析模块 ==========
  // 月票按名称统计
  getMonthTicketByNameStats() {
    return request({
      url: '/api/dashboard/month-ticket-name-stats',
      method: 'GET'
    });
  },

  // 月票按车场统计  
  getMonthTicketByParkStats() {
    return request({
      url: '/api/dashboard/month-ticket-park-stats',
      method: 'GET' 
    });
  },

  // 黑名单按违规类型统计
  getBlacklistByViolationStats() {
    return request({
      url: '/api/dashboard/blacklist-violation-stats',
      method: 'GET'
    });
  },

  // 黑名单按车场统计
  getBlacklistByParkStats() {
    return request({
      url: '/api/dashboard/blacklist-park-stats', 
      method: 'GET'
    });
  },

  // ========== 人员管理模块 ==========
  // 管家按小区统计
  getButlerByCommunityStats() {
    return request({
      url: '/api/dashboard/butler-community-stats',
      method: 'GET'
    });
  },

  // 巡逻员按小区统计
  getPatrolByCommunityStats() {
    return request({
      url: '/api/dashboard/patrol-community-stats',
      method: 'GET'
    });
  },

  // 预约审批状态统计 (基于 appointment 表)
  getAppointmentApprovalStats(days = 30) {
    return request({
      url: '/api/dashboard/appointment-approval-stats',
      method: 'GET',
      params: { days }
    });
  },

  // 违规处理统计
  getViolationHandlingStats(days = 30) {
    return request({
      url: '/api/dashboard/violation-handling-stats',
      method: 'GET',
      params: { days }
    });
  },

  // ========== 放行记录模块 ==========
  // 外来车辆放行统计 (基于 vehicle_reservation.reserve_flag)
  getVehicleReleaseStats(days = 7) {
    return request({
      url: '/api/dashboard/vehicle-release-stats',
      method: 'GET',
      params: { days }
    });
  },

  // 重复放行车辆统计 (基于 vehicle_reservation 分组统计)
  getRepeatReleaseVehicleStats(days = 30) {
    return request({
      url: '/api/dashboard/repeat-release-stats', 
      method: 'GET',
      params: { days }
    });
  },

  // 预约转化率统计 (预约 -> 实际进场)
  getAppointmentConversionStats(days = 30) {
    return request({
      url: '/api/dashboard/appointment-conversion-stats',
      method: 'GET',
      params: { days }
    });
  },

  // 小区活跃度排行 (仅基于 appointment 表)
  getCommunityActivityRanking(days = 7) {
    return request({
      url: '/api/dashboard/community-activity-ranking',
      method: 'GET', 
      params: { days }
    });
  },

  // ==================== 📊 新增统计图表API ====================

  /**
   * 1. 高频违规车辆Top N
   * @param {Number} days - 统计天数，默认30天
   * @param {Number} limit - 返回数量，默认10
   * @param {String} parkName - 车场名称（可选）
   */
  getTopViolators(days = 30, limit = 10, parkName = null) {
    const params = { days, limit };
    if (parkName) {
      params.parkName = parkName;
    }
    return request({
      url: '/parking/violations/stats/top-violators',
      method: 'GET',
      params
    });
  },

  /**
   * 2. 违规记录趋势统计
   * @param {Number} days - 统计天数，默认30天
   */
  getViolationTrend(days = 30) {
    return request({
      url: '/parking/violations/stats/trend',
      method: 'GET',
      params: { days }
    });
  },

  /**
   * 3. 违规类型趋势分析
   * @param {Number} days - 统计天数，默认30天
   */
  getViolationTypeTrend(days = 30) {
    return request({
      url: '/parking/violations/stats/type-trend',
      method: 'GET',
      params: { days }
    });
  },

  /**
   * 4. 各位置违规频次统计
   * @param {Number} days - 统计天数，默认30天
   */
  getLocationFrequency(days = 30) {
    return request({
      url: '/parking/violations/stats/location-frequency',
      method: 'GET',
      params: { days }
    });
  },

  /**
   * 5. 重复违规车辆预警分析
   * @param {Number} days - 统计天数，默认30天
   * @param {Number} minCount - 最小违规次数，默认3
   */
  getRepeatViolationWarning(days = 30, minCount = 3) {
    return request({
      url: '/parking/violations/stats/repeat-warning',
      method: 'GET',
      params: { days, minCount }
    });
  },

  /**
   * 6. 巡检人员状态统计
   */
  getStaffStatusStats() {
    return request({
      url: '/api/staff/stats/status',
      method: 'GET'
    });
  },

  /**
   * 7. 巡检员发现问题类型分布
   * @param {Number} days - 统计天数，默认30天
   */
  getStaffProblemTypes(days = 30) {
    return request({
      url: '/api/staff/stats/problem-types',
      method: 'GET',
      params: { days }
    });
  },

  /**
   * 8. 违规记录与提醒发送关联分析
   * @param {Number} days - 统计天数，默认30天
   */
  getViolationReminderCorrelation(days = 30) {
    return request({
      url: '/parking/violationReminders/stats/correlation',
      method: 'GET',
      params: { days }
    });
  }
};
