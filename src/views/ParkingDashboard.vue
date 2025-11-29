<template>
  <div class="parking-dashboard">
    <!-- 大屏头部标题 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">🏢 智慧停车数据中心</h1>
      <div class="dashboard-time">
        {{ currentTime }}
      </div>
    </div>

    <!-- 大屏主体内容 -->
    <div class="dashboard-body">
      <!-- 第一行 -->
      <div class="dashboard-row row-top">
        <!-- 核心KPI指标 -->
        <div class="dashboard-card kpi-card">
          <h3 class="card-title">📊 核心KPI</h3>
          <div class="kpi-metrics">
            <div class="kpi-item">
              <div class="kpi-icon">🏗️</div>
              <div class="kpi-content">
                <div class="kpi-value">{{ kpiData.totalSpaces }}</div>
                <div class="kpi-label">总车位</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">🚗</div>
              <div class="kpi-content">
                <div class="kpi-value">{{ kpiData.occupiedSpaces }}</div>
                <div class="kpi-label">在场车辆</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">📈</div>
              <div class="kpi-content">
                <div class="kpi-value">{{ kpiData.utilizationRate }}%</div>
                <div class="kpi-label">利用率</div>
                <div class="kpi-trend">↗️ +{{ kpiData.utilizationTrend }}%</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">💰</div>
              <div class="kpi-content">
                <div class="kpi-value">¥{{ kpiData.todayRevenue }}万</div>
                <div class="kpi-label">今日收入</div>
                <div class="kpi-trend">↗️ +{{ kpiData.revenueTrend }}%</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">🎯</div>
              <div class="kpi-content">
                <div class="kpi-value">{{ kpiData.turnoverRate }}次/天</div>
                <div class="kpi-label">周转率</div>
                <div class="kpi-trend">↗️ +{{ kpiData.turnoverTrend }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 全域停车地图 -->
        <div class="dashboard-card map-card">
          <h3 class="card-title">🗺️ 全域停车地图</h3>
          <div class="map-content">
            <div class="map-area">
              <div class="area-item" v-for="area in areaData" :key="area.code">
                <div class="area-name">{{ area.name }}</div>
                <div class="area-indicator" :class="getAreaStatus(area.utilization)">
                  <div class="area-utilization">{{ area.utilization }}%</div>
                  <div class="area-spaces">{{ area.occupied }}/{{ area.total }}位</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 车辆流量实时分析 -->
        <div class="dashboard-card traffic-card">
          <h3 class="card-title">📈 车辆流量实时分析</h3>
          <div class="traffic-chart-container">
            <div ref="trafficChart" class="chart-container"></div>
            <div class="traffic-stats">
              <div class="stat-item entry">
                🟢 进场: {{ trafficData.entryRate }}辆/h ⚡当前: {{ trafficData.currentEntry }}辆
              </div>
              <div class="stat-item exit">
                🔴 离场: {{ trafficData.exitRate }}辆/h ⚡当前: {{ trafficData.currentExit }}辆
              </div>
              <div class="stat-item net">
                📊 净增: +{{ trafficData.netIncrease }}辆/h 🎯预测: +{{ trafficData.prediction }}辆
              </div>
            </div>
          </div>
        </div>

        <!-- 进出统计 -->
        <div class="dashboard-card stats-card">
          <h3 class="card-title">📊 进出统计</h3>
          <div class="stats-content">
            <div class="stat-row">
              <span class="stat-icon">🚗</span>
              <span class="stat-label">今日进场</span>
              <span class="stat-value">{{ entryExitData.todayEntry }}辆</span>
              <span class="stat-trend">↗️ +{{ entryExitData.entryTrend }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-icon">🚪</span>
              <span class="stat-label">今日出场</span>
              <span class="stat-value">{{ entryExitData.todayExit }}辆</span>
              <span class="stat-trend">↗️ +{{ entryExitData.exitTrend }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-icon">⏱️</span>
              <span class="stat-label">平均停车</span>
              <span class="stat-value">{{ entryExitData.avgParkingTime }}小时</span>
              <span class="stat-trend">↘️ -{{ entryExitData.parkingTimeTrend }}h</span>
            </div>
            <div class="stat-row">
              <span class="stat-icon">🎫</span>
              <span class="stat-label">VIP进出</span>
              <span class="stat-value">{{ entryExitData.vipEntry }}辆</span>
              <span class="stat-detail">占比: {{ entryExitData.vipRatio }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行 -->
      <div class="dashboard-row row-bottom">
        <!-- 趋势分析 -->
        <div class="dashboard-card trend-card">
          <h3 class="card-title">📈 趋势分析</h3>
          <div class="trend-charts">
            <div class="trend-item">
              <h4>🔹 车位利用率</h4>
              <div ref="utilizationTrendChart" class="mini-chart"></div>
            </div>
            <div class="trend-item">
              <h4>💰 收入趋势</h4>
              <div ref="revenueTrendChart" class="mini-chart"></div>
            </div>
            <div class="trend-item">
              <h4>🔮 预测分析</h4>
              <div class="prediction-content">
                <div>明日预测</div>
                <div>进场: +{{ predictionData.entryIncrease }}%</div>
                <div>收入: +{{ predictionData.revenueIncrease }}%</div>
                <div>利用率: {{ predictionData.utilization }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区域与支付TOP排行 -->
        <div class="dashboard-card ranking-card">
          <h3 class="card-title">🏆 区域与支付TOP排行</h3>
          <div class="ranking-content">
            <div class="ranking-section">
              <h4>🔥 热门停车区域TOP5</h4>
              <div class="ranking-list">
                <div 
                  v-for="(area, index) in topAreas" 
                  :key="area.code"
                  class="ranking-item"
                >
                  <span class="rank">{{ getRankIcon(index) }}{{ index + 1 }}</span>
                  <span class="name">{{ area.name }}</span>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: area.utilization + '%' }"
                    ></div>
                  </div>
                  <span class="value">{{ area.utilization }}%</span>
                </div>
              </div>
            </div>

            <div class="ranking-section">
              <h4>💳 支付方式分布</h4>
              <div class="payment-stats">
                <div 
                  v-for="payment in paymentData" 
                  :key="payment.method"
                  class="payment-item"
                >
                  <span class="payment-icon">{{ payment.icon }}</span>
                  <span class="payment-method">{{ payment.method }}</span>
                  <span class="payment-amount">¥{{ payment.amount }}万</span>
                  <span class="payment-ratio">({{ payment.ratio }}%)</span>
                  <span class="success-rate">成功率: {{ payment.successRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 停车时长分析 -->
        <div class="dashboard-card duration-card">
          <h3 class="card-title">⏱️ 停车时长分析</h3>
          <div ref="durationChart" class="chart-container"></div>
        </div>

        <!-- 支付统计 -->
        <div class="dashboard-card payment-card">
          <h3 class="card-title">💳 支付统计</h3>
          <div class="payment-summary">
            <div class="payment-total">
              <div class="total-amount">¥{{ paymentSummary.totalAmount }}万</div>
              <div class="total-label">今日总收入</div>
            </div>
            <div class="payment-breakdown">
              <div 
                v-for="item in paymentSummary.breakdown" 
                :key="item.method"
                class="breakdown-item"
              >
                <span class="method-name">{{ item.icon }} {{ item.method }}</span>
                <span class="method-amount">¥{{ item.amount }}万</span>
                <span class="method-ratio">({{ item.ratio }}%)</span>
              </div>
            </div>
            <div class="payment-trends">
              <div class="trend-item">
                <span>🎯 优惠使用</span>
                <span>{{ paymentSummary.couponCount }}张</span>
                <span>使用率: {{ paymentSummary.couponUsageRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import parkingDataService from '@/api/parkingData'

export default {
  name: 'ParkingDashboard',
  data() {
    return {
      currentTime: '',
      // 核心KPI数据
      kpiData: {
        totalSpaces: 7210,
        occupiedSpaces: 5816,
        utilizationRate: 80.7,
        utilizationTrend: 2.1,
        todayRevenue: 89.6,
        revenueTrend: 4.6,
        turnoverRate: 3.2,
        turnoverTrend: 0.3
      },
      // 区域数据
      areaData: [
        { code: 'A', name: 'A区商业', total: 256, occupied: 218, utilization: 85.3 },
        { code: 'B', name: 'B区办公', total: 359, occupied: 331, utilization: 92.1 },
        { code: 'C', name: 'C区住宅', total: 200, occupied: 157, utilization: 78.5 },
        { code: 'D', name: 'D区医疗', total: 150, occupied: 98, utilization: 65.2 }
      ],
      // 车流数据
      trafficData: {
        entryRate: 156,
        exitRate: 134,
        currentEntry: 13,
        currentExit: 11,
        netIncrease: 22,
        prediction: 18
      },
      // 进出数据
      entryExitData: {
        todayEntry: 12547,
        todayExit: 11893,
        entryTrend: 8.5,
        exitTrend: 6.2,
        avgParkingTime: 2.8,
        parkingTimeTrend: 0.3,
        vipEntry: 892,
        vipRatio: 23.4
      },
      // TOP区域数据
      topAreas: [
        { code: 'B', name: 'B区办公', utilization: 92.1 },
        { code: 'F', name: 'F区综合', utilization: 89.2 },
        { code: 'A', name: 'A区商业', utilization: 85.3 },
        { code: 'C', name: 'C区住宅', utilization: 78.5 },
        { code: 'H', name: 'H区VIP', utilization: 78.9 }
      ],
      // 支付数据
      paymentData: [
        { method: '微信支付', icon: '💚', amount: 40.3, ratio: 45, successRate: 98.5 },
        { method: '支付宝', icon: '💙', amount: 28.7, ratio: 32, successRate: 97.8 },
        { method: '银行卡', icon: '💳', amount: 16.1, ratio: 18, successRate: 95.2 },
        { method: '现金', icon: '💰', amount: 4.5, ratio: 5, successRate: 99.9 }
      ],
      // 支付汇总
      paymentSummary: {
        totalAmount: 89.6,
        breakdown: [
          { method: '微信支付', icon: '💚', amount: 40.3, ratio: 45 },
          { method: '支付宝', icon: '💙', amount: 28.7, ratio: 32 },
          { method: '银行卡', icon: '💳', amount: 16.1, ratio: 18 },
          { method: '现金', icon: '💰', amount: 4.5, ratio: 5 }
        ],
        couponCount: 2345,
        couponUsageRate: 18.7
      },
      // 预测数据
      predictionData: {
        entryIncrease: 15,
        revenueIncrease: 12,
        utilization: 84
      }
    }
  },
  mounted() {
    this.updateTime()
    this.loadInitialData()
    this.initCharts()
    // 定时更新时间
    this.timeInterval = setInterval(this.updateTime, 1000)
    // 模拟数据更新
    this.dataInterval = setInterval(this.updateData, 5000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    async loadInitialData() {
      try {
        // 加载基础数据
        const parkingSpaceData = parkingDataService.getParkingSpaceData()
        this.kpiData.totalSpaces = parkingSpaceData.total_spaces
        this.kpiData.occupiedSpaces = parkingSpaceData.occupied_spaces
        this.kpiData.utilizationRate = parseFloat(
          ((parkingSpaceData.occupied_spaces / parkingSpaceData.total_spaces) * 100).toFixed(1)
        )

        // 加载区域数据
        const areaData = parkingDataService.getAreaParkingData()
        this.areaData = areaData.map(area => ({
          code: area.area_name.substring(0, 1),
          name: area.area_name,
          total: area.total_spaces,
          occupied: area.occupied_spaces,
          utilization: area.utilization_rate
        }))

        // 加载支付数据
        const paymentMethods = parkingDataService.getPaymentMethodData()
        this.paymentData = paymentMethods
        this.paymentSummary.breakdown = paymentMethods.map(item => ({
          method: item.method,
          icon: item.icon,
          amount: item.amount,
          ratio: item.percentage
        }))
        this.paymentSummary.totalAmount = paymentMethods.reduce((sum, item) => sum + item.amount, 0)

        // 加载TOP区域数据
        this.topAreas = areaData
          .sort((a, b) => b.utilization_rate - a.utilization_rate)
          .slice(0, 5)
          .map(area => ({
            code: area.area_name.substring(0, 1),
            name: area.area_name,
            utilization: area.utilization_rate
          }))

        // 加载车流数据
        const trafficFlow = parkingDataService.getTrafficFlowData()
        this.trafficData.entryRate = trafficFlow.entry_count
        this.trafficData.exitRate = trafficFlow.exit_count
        this.trafficData.netIncrease = trafficFlow.entry_count - trafficFlow.exit_count

      } catch (error) {
        console.error('加载初始数据失败:', error)
      }
    },
    getAreaStatus(utilization) {
      if (utilization >= 90) return 'status-critical'
      if (utilization >= 80) return 'status-busy'
      if (utilization >= 60) return 'status-normal'
      return 'status-free'
    },
    getRankIcon(index) {
      const icons = ['🥇', '🥈', '🥉', '', '']
      return icons[index] || ''
    },
    initCharts() {
      this.initTrafficChart()
      this.initDurationChart()
      this.initTrendCharts()
    },
    initTrafficChart() {
      const chart = echarts.init(this.$refs.trafficChart)
      
      // 使用真实数据
      const trafficData = parkingDataService.generateRealTimeTrafficData()
      
      const option = {
        title: {
          text: '实时车流监控',
          textStyle: { color: '#fff', fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' },
          formatter: function(params) {
            let tooltip = params[0].axisValueLabel + '<br/>'
            params.forEach(item => {
              tooltip += `${item.marker}${item.seriesName}: ${item.value}辆<br/>`
            })
            return tooltip
          }
        },
        legend: {
          data: ['进场车流', '离场车流'],
          textStyle: { color: '#fff' },
          top: 25
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '20%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: trafficData.timePoints,
          axisLabel: { 
            color: '#fff',
            fontSize: 10,
            rotate: 45
          },
          axisLine: { lineStyle: { color: '#fff' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { 
            color: '#fff',
            fontSize: 10
          },
          axisLine: { lineStyle: { color: '#fff' } },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: [
          {
            name: '进场车流',
            type: 'line',
            data: trafficData.entryData,
            itemStyle: { color: '#00ff88' },
            lineStyle: { width: 2 },
            areaStyle: { 
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0,255,136,0.3)' },
                  { offset: 1, color: 'rgba(0,255,136,0.05)' }
                ]
              }
            },
            smooth: true
          },
          {
            name: '离场车流',
            type: 'line',
            data: trafficData.exitData,
            itemStyle: { color: '#ff6b6b' },
            lineStyle: { width: 2 },
            areaStyle: { 
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(255,107,107,0.3)' },
                  { offset: 1, color: 'rgba(255,107,107,0.05)' }
                ]
              }
            },
            smooth: true
          }
        ],
        animation: true,
        animationDuration: 1000
      }
      
      chart.setOption(option)
      this.trafficChart = chart
      
      // 保存数据供更新使用
      this.trafficChartData = trafficData
    },
    initDurationChart() {
      const chart = echarts.init(this.$refs.durationChart)
      
      // 使用真实数据
      const durationData = parkingDataService.getParkingDurationData()
      
      const option = {
        title: {
          text: '停车时长分布',
          textStyle: { color: '#fff', fontSize: 14 },
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.seriesName}<br/>${params.name}: ${params.value}辆 (${params.percent}%)`
          },
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: { 
            color: '#fff',
            fontSize: 10
          },
          formatter: function(name) {
            const item = durationData.find(d => d.duration_range === name)
            return `${name} (${item ? item.count : 0}辆)`
          }
        },
        series: [
          {
            name: '停车时长',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '60%'],
            data: durationData.map(item => ({
              value: item.percentage,
              name: item.duration_range,
              itemStyle: { color: item.color }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              color: '#fff',
              fontSize: 10,
              formatter: '{b}\n{c}%'
            },
            labelLine: {
              lineStyle: { color: '#fff' }
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
          }
        ]
      }
      
      chart.setOption(option)
      this.durationChart = chart
    },
    initTrendCharts() {
      // 使用真实数据
      const weeklyData = parkingDataService.getWeeklyTrendData()
      
      // 利用率趋势图
      const utilizationChart = echarts.init(this.$refs.utilizationTrendChart)
      const utilizationOption = {
        grid: { left: 5, right: 5, top: 10, bottom: 10 },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].axisValue}<br/>利用率: ${params[0].value}%`
          },
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' }
        },
        xAxis: { 
          type: 'category', 
          data: weeklyData.dates,
          show: false 
        },
        yAxis: { type: 'value', show: false },
        series: [{
          data: weeklyData.utilization,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#4fc3f7' },
          lineStyle: { width: 2 },
          areaStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(79, 195, 247, 0.3)' },
                { offset: 1, color: 'rgba(79, 195, 247, 0.05)' }
              ]
            }
          }
        }]
      }
      utilizationChart.setOption(utilizationOption)
      this.utilizationChart = utilizationChart
      
      // 收入趋势图
      const revenueChart = echarts.init(this.$refs.revenueTrendChart)
      const revenueOption = {
        grid: { left: 5, right: 5, top: 10, bottom: 10 },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].axisValue}<br/>收入: ¥${params[0].value}万`
          },
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' }
        },
        xAxis: { 
          type: 'category', 
          data: weeklyData.dates,
          show: false 
        },
        yAxis: { type: 'value', show: false },
        series: [{
          data: weeklyData.revenue,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#ffb74d' },
          lineStyle: { width: 2 },
          areaStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 183, 77, 0.3)' },
                { offset: 1, color: 'rgba(255, 183, 77, 0.05)' }
              ]
            }
          }
        }]
      }
      revenueChart.setOption(revenueOption)
      this.revenueChart = revenueChart
    },
    updateData() {
      try {
        // 获取实时更新数据
        const realTimeData = parkingDataService.mockRealTimeUpdate()
        
        // 更新KPI数据
        this.kpiData.occupiedSpaces = realTimeData.current_vehicles
        this.kpiData.utilizationRate = realTimeData.current_utilization
        this.kpiData.todayRevenue = realTimeData.today_revenue
        
        // 更新车流数据
        this.trafficData.entryRate = realTimeData.current_entry_rate
        this.trafficData.exitRate = realTimeData.current_exit_rate
        this.trafficData.currentEntry = Math.floor(Math.random() * 20)
        this.trafficData.currentExit = Math.floor(Math.random() * 20)
        this.trafficData.netIncrease = this.trafficData.entryRate - this.trafficData.exitRate
        
        // 更新区域数据
        const areaUpdates = parkingDataService.getAreaParkingData()
        this.areaData = areaUpdates.map((area, index) => ({
          ...this.areaData[index],
          occupied: area.occupied_spaces + Math.floor(Math.random() * 4 - 2),
          utilization: parseFloat((area.utilization_rate + Math.random() * 2 - 1).toFixed(1))
        }))
        
        // 更新图表数据
        if (this.trafficChart && this.trafficChartData) {
          // 添加新的数据点并移除旧的
          const newTrafficData = parkingDataService.generateRealTimeTrafficData()
          this.trafficChartData = newTrafficData
          
          this.trafficChart.setOption({
            xAxis: {
              data: newTrafficData.timePoints
            },
            series: [
              {
                data: newTrafficData.entryData
              },
              {
                data: newTrafficData.exitData
              }
            ]
          })
        }
        
        console.log('数据更新完成:', realTimeData.timestamp)
        
      } catch (error) {
        console.error('数据更新失败:', error)
      }
    }
  },
  beforeUnmount() {
    // 清理定时器和图表实例
    if (this.trafficChart) {
      this.trafficChart.dispose()
      this.trafficChart = null
    }
    if (this.durationChart) {
      this.durationChart.dispose()
      this.durationChart = null
    }
    if (this.utilizationChart) {
      this.utilizationChart.dispose()
      this.utilizationChart = null
    }
    if (this.revenueChart) {
      this.revenueChart.dispose()
      this.revenueChart = null
    }
    
    // 清理定时器
    if (this.timeInterval) clearInterval(this.timeInterval)
    if (this.dataInterval) clearInterval(this.dataInterval)
  }
}
</script>

<style scoped>
.parking-dashboard {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.dashboard-header {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-bottom: 2px solid rgba(255,255,255,0.1);
}

.dashboard-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.dashboard-time {
  position: absolute;
  right: 30px;
  font-size: 18px;
  color: #b3e5fc;
}

.dashboard-body {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

.dashboard-row {
  display: flex;
  gap: 20px;
  flex: 1;
}

.dashboard-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #b3e5fc;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* 核心KPI卡片 */
.kpi-card {
  flex: 1;
  min-width: 300px;
}

.kpi-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.kpi-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: #00e676;
}

.kpi-label {
  font-size: 14px;
  color: #b3e5fc;
}

.kpi-trend {
  font-size: 12px;
  color: #4fc3f7;
}

/* 地图卡片 */
.map-card {
  flex: 2;
}

.map-area {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  height: 100%;
}

.area-item {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.area-name {
  font-size: 14px;
  margin-bottom: 10px;
  color: #b3e5fc;
}

.area-indicator {
  padding: 10px;
  border-radius: 8px;
}

.status-critical {
  background: linear-gradient(45deg, #ff5722, #f44336);
}

.status-busy {
  background: linear-gradient(45deg, #ff9800, #ff5722);
}

.status-normal {
  background: linear-gradient(45deg, #4caf50, #2196f3);
}

.status-free {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.area-utilization {
  font-size: 18px;
  font-weight: bold;
}

.area-spaces {
  font-size: 12px;
  margin-top: 5px;
}

/* 车流卡片 */
.traffic-card {
  flex: 2;
}

.traffic-chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  min-height: 200px;
}

.traffic-stats {
  margin-top: 10px;
}

.stat-item {
  font-size: 12px;
  margin: 5px 0;
  padding: 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}

.stat-item.entry {
  border-left: 4px solid #00ff88;
}

.stat-item.exit {
  border-left: 4px solid #ff6b6b;
}

.stat-item.net {
  border-left: 4px solid #4fc3f7;
}

/* 统计卡片 */
.stats-card {
  flex: 1;
  min-width: 250px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
  width: 30px;
}

.stat-label {
  flex: 1;
  font-size: 14px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #00e676;
}

.stat-trend {
  font-size: 12px;
  color: #4fc3f7;
}

.stat-detail {
  font-size: 12px;
  color: #b3e5fc;
}

/* 趋势分析卡片 */
.trend-card {
  flex: 1;
  min-width: 300px;
}

.trend-charts {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.trend-item {
  flex: 1;
}

.trend-item h4 {
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #b3e5fc;
}

.mini-chart {
  height: 80px;
}

.prediction-content {
  font-size: 12px;
  line-height: 1.8;
  color: #b3e5fc;
}

/* 排行卡片 */
.ranking-card {
  flex: 2;
}

.ranking-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.ranking-section {
  flex: 1;
}

.ranking-section h4 {
  font-size: 14px;
  margin: 0 0 15px 0;
  color: #b3e5fc;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  font-size: 12px;
}

.rank {
  width: 30px;
  font-weight: bold;
}

.name {
  flex: 1;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  transition: width 0.3s ease;
}

.value {
  width: 40px;
  text-align: right;
  font-weight: bold;
  color: #00e676;
}

.payment-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  font-size: 12px;
}

.payment-icon {
  width: 20px;
}

.payment-method {
  flex: 1;
}

.payment-amount {
  font-weight: bold;
  color: #00e676;
}

.payment-ratio {
  color: #b3e5fc;
}

.success-rate {
  color: #4fc3f7;
  font-size: 10px;
}

/* 时长分析卡片 */
.duration-card {
  flex: 1;
}

/* 支付统计卡片 */
.payment-card {
  flex: 1;
  min-width: 250px;
}

.payment-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.payment-total {
  text-align: center;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
}

.total-amount {
  font-size: 28px;
  font-weight: bold;
  color: #00e676;
}

.total-label {
  font-size: 14px;
  color: #b3e5fc;
  margin-top: 5px;
}

.payment-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  font-size: 12px;
}

.method-name {
  flex: 1;
}

.method-amount {
  font-weight: bold;
  color: #00e676;
}

.method-ratio {
  color: #b3e5fc;
}

.payment-trends {
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.payment-trends .trend-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .dashboard-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .dashboard-card {
    flex: none !important;
    min-height: 300px;
  }
}

@media (max-width: 1200px) {
  .dashboard-title {
    font-size: 24px;
  }
  
  .dashboard-body {
    padding: 15px;
  }
  
  .card-title {
    font-size: 16px;
  }
}
</style> 