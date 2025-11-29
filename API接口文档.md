# 停车管理系统 API 接口文档

## 项目信息

**项目名称**: manage-front - 停车管理系统前端
**版本**: v0.1.0
**技术栈**: Vue 3 + Element Plus + Vuex + Vue Router + Axios
**API基础URL**: `https://www.xuerparking.cn:8543`
**文档版本**: v1.0.0
**最后更新**: 2025-11-17

## 目录

- [认证方式](#认证方式)
- [请求格式](#请求格式)
- [响应格式](#响应格式)
- [错误处理](#错误处理)
- [API接口](#api接口)
  - [认证管理](#认证管理)
  - [用户管理](#用户管理)
  - [违规管理](#违规管理)
  - [车辆管理](#车辆管理)
  - [活动日志](#活动日志)
  - [巡检管理](#巡检管理)
  - [数据统计](#数据统计)
  - [文件上传](#文件上传)
  - [BigModel AI接口](#bigmodel-ai接口)

## 认证方式

### Token认证

本系统采用基于Token的认证机制。

**请求头设置**:
```http
Authorization: Bearer {token}
token: {token}
userId: {userId}
```

**获取Token**:
1. 用户登录成功后，服务器返回Token
2. 前端将Token存储在localStorage中
3. 后续所有API请求都需要携带Token

**Token存储位置**:
```javascript
localStorage.getItem('token')        // 主Token
localStorage.getItem('userId')       // 用户ID
localStorage.getItem('ms_userid')    // 备用用户ID
```

## 请求格式

### HTTP请求配置

**基础配置**:
```javascript
{
  baseURL: 'https://www.xuerparking.cn:8543',
  timeout: 5000000,  // 5分钟超时
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}',
    'token': '{token}',
    'userId': '{userId}'
  }
}
```

**支持请求方法**:
- `GET` - 获取数据
- `POST` - 创建数据
- `PUT` - 更新数据
- `DELETE` - 删除数据

### 请求参数

**路径参数**:
```javascript
// 示例: GET /api/users/{userId}
const userId = '123456';
```

**查询参数**:
```javascript
// 示例: GET /api/violations?page=1&pageSize=20&status=pending
const params = {
  page: 1,
  pageSize: 20,
  status: 'pending'
};
```

**请求体**:
```javascript
// 示例: POST /api/owners
const data = {
  name: '张三',
  phone: '13800138000',
  licensePlate: '京A12345',
  // ... 其他字段
};
```

## 响应格式

### 成功响应

**标准响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  },
  "timestamp": "2025-11-17T10:30:00Z"
}
```

**分页响应格式**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      // 数据列表
    ],
    "total": 100,
    "size": 20,
    "current": 1,
    "pages": 5
  },
  "timestamp": "2025-11-17T10:30:00Z"
}
```

### 错误响应

**标准错误格式**:
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "详细错误信息",
  "timestamp": "2025-11-17T10:30:00Z"
}
```

**常见错误码**:
- `400` - 请求参数错误
- `401` - 未授权访问
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 错误处理

### 前端错误处理机制

**HTTP错误拦截**:
```javascript
// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return response.data;
    } else {
      return Promise.reject(response);
    }
  },
  error => {
    console.log('请求拦截器捕获错误:', error);
    return Promise.reject(error);
  }
);
```

**会话超时管理**:
- 默认超时时间: 10分钟
- 支持角色级别超时控制
- 自动清理本地存储并跳转登录页

## API接口

### 认证管理

#### 用户登录
**接口地址**: `POST /api/auth/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "123456",
  "captcha": "1234",
  "captchaKey": "uuid"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "123456",
    "username": "admin",
    "role": "admin",
    "permissions": ["1", "2", "3"]
  }
}
```

#### 用户登出
**接口地址**: `POST /api/auth/logout`

**请求头**: 需要携带Token

**响应示例**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

#### 获取验证码
**接口地址**: `GET /api/auth/captcha`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "captchaKey": "uuid-string",
    "captchaImage": "base64-image-data"
  }
}
```

### 用户管理

#### 获取用户列表
**接口地址**: `GET /api/users`

**查询参数**:
- `page` (number): 页码，默认1
- `pageSize` (number): 每页数量，默认20
- `username` (string): 用户名模糊查询
- `role` (string): 角色筛选
- `status` (string): 状态筛选 (active/inactive)

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": "123456",
        "username": "admin",
        "realName": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "role": "admin",
        "status": "active",
        "createTime": "2025-01-01T00:00:00Z",
        "updateTime": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 20,
    "pages": 5
  }
}
```

#### 创建用户
**接口地址**: `POST /api/users`

**请求参数**:
```json
{
  "username": "newuser",
  "password": "123456",
  "realName": "新用户",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "role": "user",
  "permissions": ["1", "2"]
}
```

#### 更新用户
**接口地址**: `PUT /api/users/{userId}`

**请求参数**:
```json
{
  "realName": "更新后的姓名",
  "email": "updated@example.com",
  "phone": "13800138002",
  "role": "manager",
  "status": "active"
}
```

#### 删除用户
**接口地址**: `DELETE /api/users/{userId}`

### 违规管理

#### 获取违规记录列表
**接口地址**: `GET /parking/violations`

**查询参数**:
- `page` (number): 页码
- `pageSize` (number): 每页数量
- `licensePlate` (string): 车牌号
- `parkName` (string): 停车场名称
- `status` (string): 违规状态
- `startTime` (string): 开始时间
- `endTime` (string): 结束时间

**请求示例**:
```javascript
// api/violation.js - getViolations()
getViolations(params) {
  return request({
    url: '/parking/violations',
    method: 'get',
    params
  })
}
```

#### 创建违规记录
**接口地址**: `POST /parking/violations`

**请求参数**:
```json
{
  "licensePlate": "京A12345",
  "parkName": "A区停车场",
  "violationType": "违规停车",
  "description": "占用消防通道",
  "photos": ["url1", "url2"],
  "location": "A区-001车位",
  "reporter": "张三",
  "fine": 200
}
```

#### 批量处理违规记录
**接口地址**: `POST /parking/violations/batch-process`

**请求参数**:
```json
{
  "violationIds": ["id1", "id2", "id3"],
  "action": "approve", // approve/reject
  "remark": "批量处理备注"
}
```

#### 获取违规统计数据
**接口地址**: `GET /parking/violations/statistics`

**查询参数**:
- `startDate` (string): 开始日期
- `endDate` (string): 结束日期
- `groupBy` (string): 分组方式 (day/week/month)

### 车辆管理

#### 获取业主列表
**接口地址**: `GET /api/owners`

**查询参数**:
- `page` (number): 页码
- `pageSize` (number): 每页数量
- `name` (string): 业主姓名
- `phone` (string): 手机号
- `licensePlate` (string): 车牌号

**请求示例**:
```javascript
// api/owner.js - getOwners()
getOwners(params) {
  return request({
    url: '/api/owners',
    method: 'get',
    params
  })
}
```

#### 创建业主
**接口地址**: `POST /api/owners`

**请求参数**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "licensePlate": "京A12345",
  "carModel": "特斯拉Model 3",
  "parkingSpace": "A区-001",
  "contactPhone": "13800138001",
  "address": "北京市朝阳区xxx街道",
  "idCard": "110101199001011234",
  "propertyType": "住宅",
  "emergencyContact": "李四",
  "emergencyPhone": "13800138002"
}
```

#### 更新业主信息
**接口地址**: `PUT /api/owners/{ownerId}`

#### 删除业主
**接口地址**: `DELETE /api/owners/{ownerId}`

#### 白名单管理
**接口地址**: `GET /api/whitelist`

**查询参数**:
- `page` (number): 页码
- `pageSize` (number): 每页数量
- `licensePlate` (string): 车牌号
- `status` (string): 状态

**请求示例**:
```javascript
// api/whitelist.js - getWhitelist()
getWhitelist(params) {
  return request({
    url: '/api/whitelist',
    method: 'get',
    params
  })
}
```

### 活动日志

#### 记录活动日志
**接口地址**: `POST /parking/activity-log/log`

**请求参数**:
```json
{
  "userId": "123456",
  "username": "admin",
  "module": "用户管理",
  "action": "添加用户",
  "description": "添加新用户张三",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "targetId": "new-user-id",
  "targetType": "user",
  "result": "success"
}
```

**请求示例**:
```javascript
// api/activity.js - logActivity()
logActivity(logData) {
  return request({
    url: '/parking/activity-log/log',
    method: 'post',
    data: {
      userId: logData.userId,
      username: logData.username,
      module: logData.module,
      action: logData.action,
      description: logData.description,
      // ... 其他字段
    }
  })
}
```

#### 分页查询活动日志
**接口地址**: `GET /parking/activity-log/page`

**查询参数**:
- `pageNum` (number): 页码，默认1
- `pageSize` (number): 每页数量，默认20
- `userId` (string): 用户ID
- `module` (string): 模块名称
- `action` (string): 操作类型
- `startTime` (string): 开始时间
- `endTime` (string): 结束时间

### 巡检管理

#### 获取巡检人员列表
**接口地址**: `GET /api/park-staff`

**查询参数**:
- `page` (number): 页码
- `pageSize` (number): 每页数量
- `name` (string): 姓名模糊查询
- `status` (string): 在岗状态
- `area` (string): 负责区域

**请求示例**:
```javascript
// api/parkStaff.js - getParkStaff()
getParkStaff(params) {
  return request({
    url: '/api/park-staff',
    method: 'get',
    params
  })
}
```

#### 创建巡检人员
**接口地址**: `POST /api/park-staff`

**请求参数**:
```json
{
  "name": "巡检员张三",
  "phone": "13800138000",
  "idCard": "110101199001011234",
  "area": "A区",
  "workTime": "08:00-18:00",
  "status": "active"
}
```

#### 更新巡检人员状态
**接口地址**: `PUT /api/park-staff/{staffId}/status`

**请求参数**:
```json
{
  "status": "on_duty" // on_duty/off_duty
}
```

### 数据统计

#### 获取仪表板数据
**接口地址**: `GET /api/dashboard/stats`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "totalOwners": 1000,
    "totalViolations": 150,
    "todayViolations": 5,
    "totalParkingSpaces": 500,
    "occupiedSpaces": 350,
    "violationTrend": [
      {"date": "2025-11-01", "count": 3},
      {"date": "2025-11-02", "count": 5}
    ],
    "parkingStats": {
      "areas": [
        {"name": "A区", "total": 100, "occupied": 80},
        {"name": "B区", "total": 150, "occupied": 120}
      ]
    }
  }
}
```

**请求示例**:
```javascript
// api/dashboard.js - getDashboardData()
getDashboardData() {
  return request({
    url: '/api/dashboard/stats',
    method: 'get'
  })
}
```

#### 获取停车数据统计
**接口地址**: `GET /api/parking-data/statistics`

**查询参数**:
- `startDate` (string): 开始日期
- `endDate` (string): 结束日期
- `groupType` (string): 分组类型

**请求示例**:
```javascript
// api/parkingData.js - getParkingStatistics()
getParkingStatistics(params) {
  return request({
    url: '/api/parking-data/statistics',
    method: 'get',
    params
  })
}
```

### 文件上传

#### 上传图片
**接口地址**: `POST /api/upload/image`

**请求格式**: `multipart/form-data`

**请求参数**:
- `file` (File): 图片文件
- `type` (string): 上传类型 (violation/avatar/document)

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "fileName": "image.jpg",
    "fileSize": 1024000
  }
}
```

#### 批量上传图片
**接口地址**: `POST /api/upload/images`

**请求格式**: `multipart/form-data`

**请求参数**:
- `files` (File[]): 图片文件数组
- `type` (string): 上传类型

### 违规提醒

#### 获取提醒配置
**接口地址**: `GET /api/violation-reminder/config`

**请求示例**:
```javascript
// api/violation-reminder-api.js - getReminderConfig()
getReminderConfig() {
  return request({
    url: '/api/violation-reminder/config',
    method: 'get'
  })
}
```

#### 更新提醒配置
**接口地址**: `PUT /api/violation-reminder/config`

**请求参数**:
```json
{
  "emailEnabled": true,
  "smsEnabled": true,
  "emailTemplate": "违规通知模板",
  "smsTemplate": "短信通知模板",
  "reminderInterval": 30
}
```

## 前端工具类

### 活动日志记录工具

**文件位置**: `src/utils/activityLogger.js`

**使用示例**:
```javascript
import { logActivity } from '@/utils/activityLogger';

// 记录业主添加操作
await logActivity.ownerAdd('添加业主张三', 'owner123', {
  name: '张三',
  licensePlate: '京A12345'
});

// 记录用户登录操作
await logActivity.userLogin('管理员admin登录系统');
```

### 会话超时管理

**文件位置**: `src/utils/sessionTimeout.js`

**配置**:
- 默认超时时间: 10分钟
- 支持角色级别配置
- 自动跳转登录页

## 状态管理

### Vuex Store结构

**文件位置**: `src/store/index.js`

**主要状态**:
```javascript
state: {
  userInfo: null,
  token: null,
  permissions: [],
  tagsList: [],        // 标签页
  collapse: false      // 侧边栏折叠状态
}
```

## 环境配置

### 开发环境
```javascript
// vue.config.js
devServer: {
  port: 9999,
  proxy: {
    '/api': {
      target: 'http://www.xuerparking.cn:8543',
      changeOrigin: true
    }
  }
}
```

### 生产环境
```javascript
// request.js
baseURL: 'https://www.xuerparking.cn:8543'
```

## 权限控制

### 路由权限配置

**权限元数据**:
```javascript
{
  path: "user",
  name: "user",
  meta: {
    title: '用户管理',
    permission: "11"  // 权限标识
  },
  component: () => import("../views/admin/User.vue")
}
```

### 主要权限标识

| 模块 | 权限标识 | 说明 |
|------|----------|------|
| 用户管理 | 11 | 用户增删改查 |
| 违规管理 | 12 | 违规记录处理 |
| 车辆管理 | 13 | 业主、白名单管理 |
| 数据统计 | 14 | 查看统计报表 |
| 系统设置 | 15 | 系统配置管理 |

## 错误码对照表

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 1001 | Token无效 | 重新登录 |
| 1002 | Token过期 | 刷新Token或重新登录 |
| 1003 | 权限不足 | 联系管理员分配权限 |
| 2001 | 参数错误 | 检查请求参数格式 |
| 3001 | 资源不存在 | 确认资源ID是否正确 |
| 5001 | 服务器内部错误 | 联系技术支持 |

## BigModel AI接口

本系统集成了智谱AI BigModel API，提供智能化功能支持。BigModel API基于GLM系列大模型，为停车管理系统提供AI能力。

### AI功能概述

**支持的功能**:
- **智能客服**：基于自然语言的用户问答服务
- **违规描述生成**：AI自动生成规范的违规停车描述
- **数据分析报告**：智能生成停车数据分析报告
- **通知文本生成**：自动生成各类通知和提醒文本
- **用户行为分析**：分析用户操作日志，识别异常行为

### 配置要求

**环境变量**:
```bash
VUE_APP_BIGMODEL_API_KEY=your_api_key_here
```

**文件位置**: `src/config/bigmodel.js`

**基础配置**:
```javascript
const BIGMODEL_CONFIG = {
  env: {
    apiKey: process.env.VUE_APP_BIGMODEL_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    timeout: 60000
  },
  models: {
    'glm-4': { name: 'GLM-4', maxTokens: 8192, cost: 0.1 },
    'glm-3-turbo': { name: 'GLM-3-Turbo', maxTokens: 4096, cost: 0.05 },
    'glm-4v': { name: 'GLM-4V', maxTokens: 2048, cost: 0.2 }
  },
  features: {
    customerService: { enabled: true, model: 'glm-3-turbo' },
    violationDescription: { enabled: true, model: 'glm-4' },
    dataReport: { enabled: true, model: 'glm-4' }
  }
}
```

### 智能客服接口

#### AI客服对话
**接口地址**: `POST /bigmodel/customer-service`

**请求参数**:
```json
{
  "question": "如何缴纳停车费？",
  "context": "用户当前在缴费页面",
  "userId": "123456",
  "sessionId": "session_uuid"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer": "您可以通过以下方式缴纳停车费：1. 在停车缴费页面输入车牌号查询费用；2. 选择微信或支付宝支付；3. 完成支付后系统将自动更新停车状态。",
    "sessionId": "session_uuid",
    "timestamp": 1635180000000
  }
}
```

**使用示例**:
```javascript
import { bigModelApi } from '@/api/bigmodel'

// 客服对话
const response = await bigModelApi.customerService('如何申请月卡？', '用户在月卡申请页面')
console.log(response.data.answer)
```

### 违规描述生成接口

#### 生成违规描述
**接口地址**: `POST /bigmodel/violation-description`

**请求参数**:
```json
{
  "licensePlate": "京A12345",
  "violationType": "占用消防通道",
  "location": "A区-001车位",
  "violationTime": "2025-11-17 14:30:00",
  "description": "车辆占用消防通道停车",
  "photos": ["photo_url_1", "photo_url_2"],
  "reporter": "巡检员张三"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "description": "2025年11月17日14时30分，车牌号为京A12345的车辆在A区-001车位违规占用消防通道停车。该行为违反消防安全规定，存在严重安全隐患。现场已拍摄照片取证，需立即处理并处以相应罚款。",
    "wordCount": 98,
    "generateTime": 1635180000000
  }
}
```

**使用示例**:
```javascript
import { bigModelApi } from '@/api/bigmodel'

// 生成违规描述
const violationData = {
  licensePlate: '京A12345',
  violationType: '占用消防通道',
  location: 'A区-001车位'
}

const response = await bigModelApi.generateViolationDescription(violationData)
console.log(response.data.description)
```

### 数据分析报告接口

#### 生成数据报告
**接口地址**: `POST /bigmodel/data-report`

**请求参数**:
```json
{
  "reportType": "daily",
  "dateRange": ["2025-11-16", "2025-11-17"],
  "statistics": {
    "totalParkingSpaces": 500,
    "occupiedSpaces": 350,
    "utilizationRate": 70,
    "todayViolations": 5,
    "monthViolations": 150,
    "totalRevenue": 25000
  },
  "focusAreas": ["utilization", "violations", "revenue"],
  "notes": "重点关注违规高发时段"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "report": "# 停车管理日报分析报告\n\n## 数据概况\n\n今日车位使用率为70%，占用车位350个...",
    "summary": {
      "keyFindings": ["车位使用率稳定", "违规数量下降"],
      "recommendations": ["加强高峰时段管理", "优化车位分配"],
      "riskLevel": "low"
    },
    "generateTime": 1635180000000
  }
}
```

**使用示例**:
```javascript
import { bigModelApi } from '@/api/bigmodel'

// 生成数据分析报告
const reportData = {
  reportType: 'weekly',
  statistics: {
    totalParkingSpaces: 500,
    occupiedSpaces: 350,
    utilizationRate: 70
  }
}

const response = await bigModelApi.generateDataReport(reportData, 'weekly')
console.log(response.data.report)
```

### 通知文本生成接口

#### 生成通知文本
**接口地址**: `POST /bigmodel/notification-text`

**请求参数**:
```json
{
  "notificationType": "violation",
  "params": {
    "licensePlate": "京A12345",
    "violationType": "占用消防通道",
    "fine": 200,
    "deadline": "2025-11-20",
    "contactPhone": "010-12345678"
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "title": "违规停车处理通知",
    "content": "尊敬的车主，您的车辆（京A12345）因占用消防通道被记录违规...",
    "smsContent": "【停车管理处】您的车辆京A12345因违规停车需处理...",
    "generateTime": 1635180000000
  }
}
```

### 用户行为分析接口

#### 分析用户行为
**接口地址**: `POST /bigmodel/behavior-analysis`

**请求参数**:
```json
{
  "userId": "123456",
  "timeWindow": 24,
  "activities": [
    {
      "action": "login",
      "timestamp": "2025-11-17T09:00:00Z",
      "ip": "192.168.1.100"
    },
    {
      "action": "view_violations",
      "timestamp": "2025-11-17T09:05:00Z"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "riskLevel": "low",
    "behaviorPattern": "正常办公时间操作",
    "anomalies": [],
    "recommendations": ["用户行为正常，无需特别关注"],
    "analysisTime": 1635180000000
  }
}
```

### 组件集成

#### 智能客服组件
**组件名**: `BigModelChat`
**文件位置**: `src/components/BigModelChat.vue`

**使用方法**:
```vue
<template>
  <div>
    <BigModelChat />
  </div>
</template>

<script>
import BigModelChat from '@/components/BigModelChat.vue'

export default {
  components: {
    BigModelChat
  }
}
</script>
```

#### 违规描述生成组件
**组件名**: `ViolationAIGenerator`
**文件位置**: `src/components/ViolationAIGenerator.vue`

**使用方法**:
```vue
<template>
  <div>
    <ViolationAIGenerator
      :violation-data="violationForm"
      @content-accepted="handleAIContentAccepted"
    />
  </div>
</template>

<script>
import ViolationAIGenerator from '@/components/ViolationAIGenerator.vue'

export default {
  components: {
    ViolationAIGenerator
  },
  methods: {
    handleAIContentAccepted(data) {
      console.log('AI生成的内容:', data.content)
    }
  }
}
</script>
```

#### 数据报告生成组件
**组件名**: `DataReportGenerator`
**文件位置**: `src/components/DataReportGenerator.vue`

**使用方法**:
```vue
<template>
  <div>
    <DataReportGenerator
      :base-data="dashboardData"
      :statistics="statisticsData"
      @report-generated="handleReportGenerated"
    />
  </div>
</template>

<script>
import DataReportGenerator from '@/components/DataReportGenerator.vue'

export default {
  components: {
    DataReportGenerator
  },
  methods: {
    handleReportGenerated(data) {
      console.log('生成的报告:', data.content)
    }
  }
}
</script>
```

### API使用限制

**请求限制**:
- 每分钟最多60次请求
- 每日最多1000次请求
- 并发请求最多5个

**模型限制**:
- GLM-4: 最大8192 tokens，成本较高
- GLM-3-Turbo: 最大4096 tokens，性价比高
- GLM-4V: 支持图片，最大2048 tokens

**功能开关**:
```javascript
// 在 src/config/bigmodel.js 中配置
features: {
  customerService: { enabled: true },
  violationDescription: { enabled: true },
  dataReport: { enabled: true },
  notificationText: { enabled: true },
  behaviorAnalysis: { enabled: false }  // 默认关闭
}
```

### 错误处理

**BigModel专用错误码**:

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 4001 | API密钥无效 | 检查API密钥配置 |
| 4002 | API配额不足 | 检查使用量，联系客服 |
| 4003 | 模型不存在 | 检查模型名称是否正确 |
| 4004 | 参数格式错误 | 检查请求参数格式 |
| 4005 | 内容安全审核失败 | 检查输入内容是否合规 |
| 4006 | 请求超时 | 重试或调整超时设置 |

**错误处理示例**:
```javascript
try {
  const response = await bigModelApi.customerService(question)
  console.log(response.data.answer)
} catch (error) {
  if (error.code === 4002) {
    ElMessage.error('AI服务配额不足，请稍后再试')
  } else if (error.code === 4005) {
    ElMessage.error('输入内容包含不当信息，请重新输入')
  } else {
    ElMessage.error('AI服务暂时不可用，请稍后再试')
  }
}
```

### 性能优化

**缓存策略**:
- 智能客服对话缓存30分钟
- 违规描述生成结果缓存2小时
- 数据报告缓存24小时

**请求优化**:
- 使用GLM-3-Turbo进行大部分任务
- 复杂分析任务使用GLM-4
- 合并多个小请求为批量请求

## 版本更新记录

### v1.1.0 (2025-11-17)
- 新增BigModel AI接口文档
- 集成智能客服、违规描述生成等功能
- 添加数据分析报告生成
- 完善错误处理和性能优化

### v1.0.0 (2025-11-17)
- 初始版本
- 包含完整的API接口文档
- 定义认证、用户、违规、车辆等核心模块接口

## 联系信息

- **技术支持**: tech-support@example.com
- **文档维护**: dev-team@example.com
- **问题反馈**: https://github.com/your-repo/issues
- **BigModel支持**: https://open.bigmodel.cn/

---

*本文档基于Vue 3 + Element Plus停车管理系统项目自动生成，最后更新时间: 2025-11-17*