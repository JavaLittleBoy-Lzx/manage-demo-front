// 智慧停车大屏模拟数据服务
// 参考API接口文档：https://s.apifox.cn/a088c4fe-5b5c-49c9-901c-cd64316c7c11/6518936m0

/**
 * 3.1.进场数据同步接口模拟数据
 */
export const getEntryData = () => {
  return {
    plate_number: "粤A12345",
    entry_time: new Date().toISOString(),
    channel_id: "CHANNEL001",
    parking_area: "A区商业",
    vehicle_type: "普通车辆", // 普通车辆/VIP车辆
    entry_image: "/images/entry_001.jpg",
    operator: "system"
  }
}

/**
 * 3.2.离场数据同步接口模拟数据
 */
export const getExitData = () => {
  return {
    plate_number: "粤A12345",
    exit_time: new Date().toISOString(),
    channel_id: "CHANNEL002",
    parking_duration: 180, // 停车时长(分钟)
    parking_fee: 15.00, // 停车费用
    exit_image: "/images/exit_001.jpg",
    payment_status: "已付", // 已付/未付/免费
    discount_applied: 2.00 // 优惠券使用金额
  }
}

/**
 * 3.3.剩余车位同步接口模拟数据
 */
export const getParkingSpaceData = () => {
  return {
    total_spaces: 7210, // 总车位数
    occupied_spaces: 5816, // 已占用车位
    available_spaces: 1394, // 剩余车位
    area_code: "ALL", // 区域编码
    update_time: new Date().toISOString()
  }
}

/**
 * 3.10.获取指定时间段支付账单信息模拟数据
 */
export const getPaymentData = () => {
  return {
    order_id: "ORDER2024122501",
    plate_number: "粤A12345",
    payment_amount: 15.00, // 支付金额
    payment_time: new Date().toISOString(),
    payment_method: "微信支付", // 现金/微信/支付宝/银行卡
    discount_amount: 2.00 // 优惠金额
  }
}

/**
 * 3.13.获取时间段范围内的车流量模拟数据
 */
export const getTrafficFlowData = () => {
  return {
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date().toISOString(),
    entry_count: 156, // 进场车辆数
    exit_count: 134, // 离场车辆数
    area_code: "ALL" // 区域编码
  }
}

/**
 * 3.25.获取统计区域剩余车位数模拟数据
 */
export const getAreaParkingData = () => {
  return [
    {
      area_name: "A区商业",
      total_spaces: 256,
      occupied_spaces: 218,
      available_spaces: 38,
      utilization_rate: 85.3
    },
    {
      area_name: "B区办公",
      total_spaces: 359,
      occupied_spaces: 331,
      available_spaces: 28,
      utilization_rate: 92.1
    },
    {
      area_name: "C区住宅",
      total_spaces: 200,
      occupied_spaces: 157,
      available_spaces: 43,
      utilization_rate: 78.5
    },
    {
      area_name: "D区医疗",
      total_spaces: 150,
      occupied_spaces: 98,
      available_spaces: 52,
      utilization_rate: 65.2
    },
    {
      area_name: "E区学校",
      total_spaces: 120,
      occupied_spaces: 55,
      available_spaces: 65,
      utilization_rate: 45.8
    },
    {
      area_name: "F区综合",
      total_spaces: 250,
      occupied_spaces: 223,
      available_spaces: 27,
      utilization_rate: 89.2
    },
    {
      area_name: "G区临时",
      total_spaces: 150,
      occupied_spaces: 52,
      available_spaces: 98,
      utilization_rate: 34.6
    },
    {
      area_name: "H区VIP",
      total_spaces: 90,
      occupied_spaces: 71,
      available_spaces: 19,
      utilization_rate: 78.9
    }
  ]
}

/**
 * 4.10.获取车辆VIP票模拟数据
 */
export const getVipTicketData = () => {
  return {
    plate_number: "粤A88888",
    vip_type: "月卡", // 月卡/年卡/储值卡
    start_date: "2024-01-01",
    end_date: "2025-01-01",
    remaining_amount: 500.00, // 剩余金额/次数
    usage_count: 45 // 使用次数
  }
}

/**
 * 生成实时车流量数据（模拟WebSocket推送）
 */
export const generateRealTimeTrafficData = () => {
  const now = new Date()
  const timePoints = []
  const entryData = []
  const exitData = []
  
  // 生成过去2小时的数据
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 5 * 60 * 1000)
    timePoints.push(time.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }))
    
    // 模拟早晚高峰
    const hour = time.getHours()
    let baseEntry = 100
    let baseExit = 90
    
    if (hour >= 7 && hour <= 9) { // 早高峰
      baseEntry = 180 + Math.random() * 40
      baseExit = 60 + Math.random() * 20
    } else if (hour >= 17 && hour <= 19) { // 晚高峰
      baseEntry = 80 + Math.random() * 20
      baseExit = 160 + Math.random() * 40
    } else if (hour >= 11 && hour <= 14) { // 午高峰
      baseEntry = 120 + Math.random() * 30
      baseExit = 110 + Math.random() * 25
    }
    
    entryData.push(Math.floor(baseEntry))
    exitData.push(Math.floor(baseExit))
  }
  
  return {
    timePoints,
    entryData,
    exitData
  }
}

/**
 * 获取停车时长分布数据
 */
export const getParkingDurationData = () => {
  return [
    { 
      duration_range: "0-1小时", 
      count: 3245, 
      percentage: 32.5,
      color: '#4fc3f7'
    },
    { 
      duration_range: "1-2小时", 
      count: 2876, 
      percentage: 28.8,
      color: '#29b6f6'
    },
    { 
      duration_range: "2-4小时", 
      count: 1987, 
      percentage: 19.9,
      color: '#0288d1'
    },
    { 
      duration_range: "4-6小时", 
      count: 1254, 
      percentage: 12.5,
      color: '#0277bd'
    },
    { 
      duration_range: "6-8小时", 
      count: 456, 
      percentage: 4.6,
      color: '#01579b'
    },
    { 
      duration_range: "8小时以上", 
      count: 182, 
      percentage: 1.7,
      color: '#263238'
    }
  ]
}

/**
 * 获取支付方式统计数据
 */
export const getPaymentMethodData = () => {
  return [
    {
      method: "微信支付",
      icon: "💚",
      amount: 40.3,
      percentage: 45.2,
      success_rate: 98.5,
      transaction_count: 5634
    },
    {
      method: "支付宝",
      icon: "💙", 
      amount: 28.7,
      percentage: 32.1,
      success_rate: 97.8,
      transaction_count: 3876
    },
    {
      method: "银行卡",
      icon: "💳",
      amount: 16.1,
      percentage: 18.3,
      success_rate: 95.2,
      transaction_count: 2145
    },
    {
      method: "现金",
      icon: "💰",
      amount: 4.5,
      percentage: 4.4,
      success_rate: 99.9,
      transaction_count: 523
    }
  ]
}

/**
 * 获取通道效率数据
 */
export const getChannelEfficiencyData = () => {
  return [
    {
      channel_id: "CHANNEL001",
      channel_name: "主入口A",
      efficiency: 95,
      hourly_traffic: 234,
      status: "正常", // 正常/缓慢/拥堵
      avg_processing_time: 12 // 平均处理时间(秒)
    },
    {
      channel_id: "CHANNEL002",
      channel_name: "主入口B",
      efficiency: 89,
      hourly_traffic: 198,
      status: "正常",
      avg_processing_time: 15
    },
    {
      channel_id: "CHANNEL003",
      channel_name: "VIP通道",
      efficiency: 92,
      hourly_traffic: 67,
      status: "正常",
      avg_processing_time: 8
    },
    {
      channel_id: "CHANNEL004",
      channel_name: "侧门C",
      efficiency: 78,
      hourly_traffic: 156,
      status: "缓慢",
      avg_processing_time: 22
    },
    {
      channel_id: "CHANNEL005",
      channel_name: "地下入口",
      efficiency: 67,
      hourly_traffic: 123,
      status: "拥堵",
      avg_processing_time: 35
    }
  ]
}

/**
 * 获取车辆类型统计数据
 */
export const getVehicleTypeData = () => {
  return [
    {
      vehicle_type: "轿车",
      entry_count: 6520,
      exit_count: 6180,
      percentage: 52,
      revenue: 46.6
    },
    {
      vehicle_type: "SUV",
      entry_count: 3890,
      exit_count: 3650,
      percentage: 31,
      revenue: 27.8
    },
    {
      vehicle_type: "新能源车",
      entry_count: 3120,
      exit_count: 2980,
      percentage: 25,
      revenue: 22.4
    },
    {
      vehicle_type: "货车",
      entry_count: 2140,
      exit_count: 2020,
      percentage: 17,
      revenue: 15.3
    },
    {
      vehicle_type: "摩托车",
      entry_count: 450,
      exit_count: 420,
      percentage: 3,
      revenue: 2.7
    }
  ]
}

/**
 * 获取7天趋势数据
 */
export const getWeeklyTrendData = () => {
  return {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    utilization: [75.2, 78.5, 82.1, 85.3, 80.7, 83.2, 79.8],
    revenue: [65.3, 72.8, 78.5, 89.6, 85.2, 92.1, 88.4],
    entry_count: [8945, 9532, 10234, 12547, 11890, 13245, 12098],
    exit_count: [8756, 9123, 9987, 11893, 11234, 12987, 11654]
  }
}

/**
 * 获取优惠券使用统计
 */
export const getCouponUsageData = () => {
  return {
    total_issued: 10000,
    total_claimed: 6500,
    total_used: 2345,
    total_completed: 2156,
    usage_rate: 18.7,
    completion_rate: 21.6,
    total_discount_amount: 12.8,
    coupon_types: [
      { type: "满减券", count: 1245, amount: 8.9 },
      { type: "折扣券", count: 890, amount: 2.3 },
      { type: "免费券", count: 210, amount: 1.6 }
    ]
  }
}

/**
 * 模拟实时数据更新
 */
export const mockRealTimeUpdate = () => {
  return {
    timestamp: new Date().toISOString(),
    current_vehicles: 5816 + Math.floor(Math.random() * 20 - 10),
    current_utilization: parseFloat((80.7 + Math.random() * 4 - 2).toFixed(1)),
    current_entry_rate: 156 + Math.floor(Math.random() * 30 - 15),
    current_exit_rate: 134 + Math.floor(Math.random() * 30 - 15),
    today_revenue: parseFloat((89.6 + Math.random() * 2 - 1).toFixed(1)),
    alerts: [
      "B区办公接近饱和(92.1%)，建议引导至G区",
      "地下入口通道效率偏低，可能需要维护",
      "预计下一小时车流量将增加15%"
    ]
  }
}

// 导出所有数据获取函数
export default {
  getEntryData,
  getExitData,
  getParkingSpaceData,
  getPaymentData,
  getTrafficFlowData,
  getAreaParkingData,
  getVipTicketData,
  generateRealTimeTrafficData,
  getParkingDurationData,
  getPaymentMethodData,
  getChannelEfficiencyData,
  getVehicleTypeData,
  getWeeklyTrendData,
  getCouponUsageData,
  mockRealTimeUpdate
} 