# 白名单数据管理功能使用说明

## 功能概述

白名单数据管理功能用于管理车辆白名单信息，实现免检车辆的管理。白名单中的车辆可以享受特殊的停车权限，不受常规违规检查的限制。

## 功能特性

### 1. 白名单管理
- ✅ 分页查询白名单列表
- ✅ 添加白名单记录（支持ACMS接口查询车主信息）
- ✅ 编辑白名单记录
- ✅ 删除白名单记录
- ✅ 批量删除白名单记录

### 2. 查询筛选
- 车牌号模糊查询
- 车主姓名模糊查询
- 车主电话模糊查询
- 车场名称精确查询

### 3. ACMS集成
- 选择车场后输入车牌号，自动调用ACMS接口查询车主信息
- 自动回显车主姓名、电话、地址等信息
- 支持手动修改查询到的信息

## 使用流程

### 添加白名单

1. 点击【添加白名单】按钮
2. 选择车场名称（必填）
3. 输入车牌号码（必填）
4. 点击【查询】按钮或失焦时自动查询车主信息
5. 系统自动填充车主姓名、电话、地址
6. 可手动修改或补充车主信息
7. 输入备注信息（可选）
8. 点击【保存】按钮

### 编辑白名单

1. 在列表中点击【编辑】按钮
2. 修改车主信息或备注
3. 点击【保存】按钮

### 删除白名单

- **单条删除**：点击列表中的【删除】按钮
- **批量删除**：
  1. 勾选要删除的记录
  2. 点击【批量删除】按钮
  3. 确认删除操作

## 前端文件

- **页面组件**: `src/views/admin/WhitelistManagement.vue`
- **API接口**: `src/api/whitelist.js`

## 后端文件

- **实体类**: `src/main/java/com/parkingmanage/entity/Whitelist.java`
- **Mapper**: `src/main/java/com/parkingmanage/mapper/WhitelistMapper.java`
- **Mapper XML**: `src/main/resources/mapper/WhitelistMapper.xml`
- **Service接口**: `src/main/java/com/parkingmanage/service/IWhitelistService.java`
- **Service实现**: `src/main/java/com/parkingmanage/service/impl/WhitelistServiceImpl.java`
- **Controller**: `src/main/java/com/parkingmanage/controller/WhitelistController.java`
- **数据库SQL**: `sql/create_whitelist_table.sql`

## API接口说明

### 1. 分页查询白名单列表

**请求方式**: GET

**请求路径**: `/parking/whitelist`

**请求参数**:
```javascript
{
  page: 1,              // 页码
  size: 10,             // 每页大小
  plateNumber: "",      // 车牌号（可选）
  ownerName: "",        // 车主姓名（可选）
  ownerPhone: "",       // 车主电话（可选）
  parkName: ""          // 车场名称（可选）
}
```

**响应数据**:
```javascript
{
  code: "0",
  msg: "查询成功",
  data: {
    records: [...],     // 记录列表
    total: 100,         // 总记录数
    size: 10,           // 每页大小
    current: 1,         // 当前页
    pages: 10           // 总页数
  }
}
```

### 2. 创建白名单记录

**请求方式**: POST

**请求路径**: `/parking/whitelist`

**请求参数**:
```javascript
{
  plateNumber: "京A12345",      // 车牌号（必填）
  parkName: "东北林业大学",      // 车场名称（必填）
  ownerName: "张三",            // 车主姓名（必填）
  ownerPhone: "13800138000",   // 车主电话（可选）
  ownerAddress: "某某地址",     // 车主地址（可选）
  remark: "备注信息"            // 备注（可选）
}
```

### 3. 更新白名单记录

**请求方式**: PUT

**请求路径**: `/parking/whitelist/{id}`

**请求参数**: 同创建接口

### 4. 删除白名单记录

**请求方式**: DELETE

**请求路径**: `/parking/whitelist/{id}`

### 5. 批量删除白名单记录

**请求方式**: POST

**请求路径**: `/parking/whitelist/batch-delete`

**请求参数**:
```javascript
{
  ids: [1, 2, 3, ...]
}
```

### 6. 根据车牌号查询白名单

**请求方式**: GET

**请求路径**: `/parking/whitelist/by-plate`

**请求参数**:
```javascript
{
  plateNumber: "京A12345",
  parkName: "东北林业大学"
}
```

### 7. 检查车牌是否在白名单中

**请求方式**: GET

**请求路径**: `/parking/whitelist/check`

**请求参数**:
```javascript
{
  plateNumber: "京A12345",
  parkName: "东北林业大学"
}
```

**响应数据**:
```javascript
{
  code: "0",
  msg: "检查成功",
  data: true  // true-在白名单中，false-不在白名单中
}
```

## 数据库表结构

### whitelist 表

| 字段名 | 类型 | 说明 | 备注 |
|-------|------|------|------|
| id | bigint(20) | 主键ID | 自增 |
| plate_number | varchar(20) | 车牌号 | 必填 |
| park_name | varchar(100) | 停车场名称 | 必填 |
| owner_name | varchar(50) | 车主姓名 | 可选 |
| owner_phone | varchar(20) | 车主电话 | 可选 |
| owner_address | varchar(500) | 车主地址 | 可选 |
| remark | varchar(500) | 备注 | 可选 |
| created_at | datetime | 创建时间 | 自动生成 |
| updated_at | datetime | 更新时间 | 自动更新 |
| created_by | varchar(50) | 创建人 | 可选 |

**唯一索引**: `uk_plate_park` (plate_number, park_name)

**普通索引**:
- idx_plate_number
- idx_park_name
- idx_owner_name
- idx_owner_phone
- idx_created_at

## ACMS接口集成

### 查询车主信息接口

**接口地址**: `/parking/acms/vip/merged-info`

**请求方式**: POST

**请求参数**:
```javascript
{
  plateNumber: "京A12345",
  parkName: "东北林业大学"
}
```

**响应数据**:
```javascript
{
  code: "0",
  msg: "查询成功",
  data: {
    ownerName: "张三",
    ownerPhone: "13800138000",
    ownerAddress: "某某地址",
    vipTypeName: "月票类型",
    ownerCategory: "人员类别",
    customerCompany: "单位名称",
    customerRoomNumber: "房间号"
  }
}
```

## 部署步骤

### 1. 数据库初始化

执行SQL文件创建白名单表：

```bash
mysql -u root -p your_database < sql/create_whitelist_table.sql
```

### 2. 后端部署

1. 将后端代码文件复制到对应目录
2. 重新编译项目
3. 重启后端服务

### 3. 前端部署

1. 将前端代码文件复制到对应目录
2. 如果需要，重新编译前端项目
3. 刷新浏览器查看新功能

### 4. 路由配置

在前端路由配置文件中添加白名单管理页面的路由（如果需要）。

## 注意事项

1. **唯一性约束**: 同一车牌在同一车场只能有一条白名单记录
2. **ACMS接口**: 查询车主信息需要ACMS接口正常运行
3. **权限控制**: 建议为白名单管理功能配置适当的权限控制
4. **数据校验**: 车牌号格式需符合国内车牌规范
5. **手机号校验**: 手机号需符合11位数字格式

## 常见问题

### Q1: 查询车主信息失败怎么办？

A: 如果ACMS接口查询失败，可以手动填写车主信息。系统会提示"未查询到车主信息，请手动填写"。

### Q2: 能否添加重复的车牌？

A: 不能。同一车牌在同一车场只能添加一次。如需修改，请使用编辑功能。

### Q3: 白名单记录是否可以批量导入？

A: 当前版本不支持批量导入。如需此功能，可以后续扩展。

### Q4: 删除白名单后是否可以恢复？

A: 当前版本删除后无法恢复。建议在删除前确认操作。

## 技术栈

- **前端**: Vue 3 + Element Plus
- **后端**: Spring Boot + MyBatis Plus
- **数据库**: MySQL 5.7+
- **外部接口**: ACMS融合接口

## 开发人员

- **开发者**: MLH
- **开发时间**: 2025-10-07
- **版本**: v1.0.0

## 更新日志

### v1.0.0 (2025-10-07)
- ✅ 初始版本发布
- ✅ 实现白名单基础CRUD功能
- ✅ 集成ACMS接口查询车主信息
- ✅ 支持分页查询和多条件筛选
- ✅ 支持批量删除功能

