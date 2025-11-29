// 仪表盘 API 接口测试工具
import { dashboardApi } from '../api/dashboard';

/**
 * 测试所有仪表盘 API 接口
 */
export const testDashboardApis = async () => {
  const results = {
    success: [],
    failed: [],
    total: 0
  };

  const apiTests = [
    {
      name: '实时概览数据',
      test: () => dashboardApi.getRealtimeOverview()
    },
    {
      name: '车流量趋势',
      test: () => dashboardApi.getTrafficTrend(7)
    },
    {
      name: '违规类型分布',
      test: () => dashboardApi.getViolationTypeDistribution(30)
    },
    {
      name: '预约通过率趋势',
      test: () => dashboardApi.getAppointmentApprovalTrend(7)
    },
    {
      name: '月票使用率分析',
      test: () => dashboardApi.getMonthTicketUsage()
    },
    {
      name: '车场车流量对比',
      test: () => dashboardApi.getParkTrafficComparison(7)
    },
    {
      name: '车场利用率排行',
      test: () => dashboardApi.getParkUtilizationRanking(7)
    },
    {
      name: '24小时车流热力图',
      test: () => dashboardApi.getTrafficHeatmap(7)
    },
    {
      name: '预约时段偏好',
      test: () => dashboardApi.getAppointmentTimePreference(7)
    },
    {
      name: '工作日vs周末对比',
      test: () => dashboardApi.getWeekdayWeekendComparison(7)
    },
    {
      name: '月票状态分布',
      test: () => dashboardApi.getMonthTicketStatusDistribution()
    },
    {
      name: '黑名单统计',
      test: () => dashboardApi.getBlacklistStatistics(30)
    },
    {
      name: '预约状态分布',
      test: () => dashboardApi.getAppointmentStatusDistribution(30)
    }
  ];

  console.log('开始测试仪表盘 API 接口...');
  results.total = apiTests.length;

  for (const apiTest of apiTests) {
    try {
      console.log(`测试: ${apiTest.name}`);
      const response = await apiTest.test();
      
      if (response && response.data) {
        if (response.data.code === "0") {
          results.success.push({
            name: apiTest.name,
            status: 'success',
            data: response.data.data
          });
          console.log(`✅ ${apiTest.name} - 成功`);
        } else {
          results.failed.push({
            name: apiTest.name,
            status: 'api_error',
            error: `API返回错误: code=${response.data.code}, message=${response.data.message}`
          });
          console.log(`❌ ${apiTest.name} - API错误: ${response.data.code}`);
        }
      } else {
        results.failed.push({
          name: apiTest.name,
          status: 'invalid_response',
          error: '响应格式无效'
        });
        console.log(`❌ ${apiTest.name} - 响应格式无效`);
      }
    } catch (error) {
      results.failed.push({
        name: apiTest.name,
        status: 'network_error',
        error: error.message
      });
      console.log(`❌ ${apiTest.name} - 网络错误: ${error.message}`);
    }
  }

  console.log('API 测试完成');
  console.log(`成功: ${results.success.length}/${results.total}`);
  console.log(`失败: ${results.failed.length}/${results.total}`);
  
  return results;
};

/**
 * 测试特定分类的 API 接口
 */
export const testApiCategory = async (category) => {
  const categories = {
    trends: ['getRealtimeOverview', 'getTrafficTrend', 'getViolationTypeDistribution', 'getAppointmentApprovalTrend', 'getMonthTicketUsage'],
    comparison: ['getParkTrafficComparison', 'getParkUtilizationRanking'],
    timeAnalysis: ['getTrafficHeatmap', 'getAppointmentTimePreference', 'getWeekdayWeekendComparison'],
    monitoring: ['getMonthTicketStatusDistribution', 'getBlacklistStatistics', 'getAppointmentStatusDistribution']
  };

  const apiList = categories[category];
  if (!apiList) {
    console.error(`未知的分类: ${category}`);
    return null;
  }

  console.log(`测试 ${category} 分类的 API 接口...`);
  const results = [];

  for (const apiName of apiList) {
    try {
      const response = await dashboardApi[apiName]();
      results.push({
        api: apiName,
        success: response?.data?.code === "0",
        data: response?.data
      });
    } catch (error) {
      results.push({
        api: apiName,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * 生成 API 测试报告
 */
export const generateTestReport = (results) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      success: results.success.length,
      failed: results.failed.length,
      successRate: `${((results.success.length / results.total) * 100).toFixed(1)}%`
    },
    details: {
      successful: results.success,
      failed: results.failed
    }
  };

  console.table(report.summary);
  
  if (results.failed.length > 0) {
    console.log('失败的接口详情:');
    results.failed.forEach(item => {
      console.log(`- ${item.name}: ${item.error}`);
    });
  }

  return report;
}; 