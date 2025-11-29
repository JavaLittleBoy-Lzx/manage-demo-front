# 停车管理系统 - 月票车免检功能实现

## 修改概述

根据用户需求，对停车管理系统进行了以下重要调整：

1. **过夜检查扩展**：过夜停车检查不再限制为月票车，所有车辆都会进行过夜检查
2. **月票类型免检**：增加了月票类型免检功能，特定类型的月票车可以免检违规处理
3. **UI配置界面**：在前端配置页面增加了月票类型选择功能

## 详细修改内容

### 1. 后端修改

#### VehicleReservationController.java
- **修改方法**: `processMonthlyTicketTimeoutCheck`
  - 过夜检查不再限制为月票车，所有推送的车辆数据都会进行过夜检查
  - 添加了免检月票类型的判断逻辑
  - 免检类型的月票车不记录超时违规，过夜也不拉黑

- **新增方法**: 
  - `getTicketNameByMonthTicketId`: 根据月票ID获取票类型名称
  - `isExemptMonthlyTicketType`: 检查是否为免检的月票类型
  - `getTicketTypesByParkCode`: 获取指定车场的所有月票类型列表（新增API接口）

#### ViolationsService.java & ViolationsServiceImpl.java
- **新增接口**: `saveMonthlyTicketFullConfigWithExempt` - 保存包含免检类型的完整配置
- **修改方法**: `getMonthlyTicketTimeoutConfig` - 返回配置时包含免检类型信息
- **新增私有方法**:
  - `parseExemptTicketTypes`: 从配置描述中解析免检类型
  - `buildDescriptionWithExempt`: 构建包含免检类型的配置描述

#### ViolationsController.java
- **修改接口**: `/monthly-ticket-full-config` - 添加免检月票类型参数
- 接口现在接受 `exemptTicketTypes` 参数，支持多选月票类型免检

### 2. 前端修改

#### violation.js API文件
- **新增接口**: `getTicketTypesByParkCode` - 获取指定车场的月票类型列表
- **新增接口**: `saveMonthlyTicketConfigWithExempt` - 保存包含免检类型的配置

#### IllegalRegiste.vue 配置页面
- **新增响应式变量**:
  - `availableTicketTypes`: 可选的月票类型列表
  - `ticketTypesLoading`: 月票类型加载状态
  - `configForm.exemptTicketTypes`: 免检的月票类型列表

- **新增UI组件**:
  - 月票类型免检配置区域
  - 多选下拉框，支持选择多个月票类型进行免检
  - 配置说明更新，反映新的免检规则

- **新增方法**:
  - `loadTicketTypes`: 加载指定车场的月票类型列表
  - 修改 `handleMonthlyTicketConfig`: 并行加载配置和月票类型
  - 修改 `handleSaveConfig`: 保存配置时包含免检类型信息

### 3. 业务逻辑变更

#### 过夜检查逻辑
```
旧逻辑: 只有月票车进行过夜检查
新逻辑: 所有车辆都进行过夜检查
- 免检类型的月票车：过夜不拉黑
- 普通月票车：过夜直接拉黑  
- 非月票车：过夜直接拉黑
```

#### 超时检查逻辑
```
旧逻辑: 只有月票车进行超时检查
新逻辑: 只有月票车进行超时检查（保持不变）
- 免检类型的月票车：不记录超时违规
- 普通月票车：累计超时违规，达到阈值后拉黑
- 非月票车：不进行超时检查
```

#### 免检规则
- 免检的月票类型在欧洲新城车场可以选择配置
- 免检类型不记录超时违规记录
- 免检类型过夜停车不会被拉黑
- 但仍会记录违规日志供查询（便于统计和监控）

## 配置方式

### 后端配置
1. 系统会自动查询"欧洲新城"车场的所有 `ticket_name`
2. 管理员在前端界面选择需要免检的月票类型
3. 免检信息存储在配置表的 `description` 字段中，格式为：
   ```
   过夜(22:00-06:00)超过4小时直接拉黑,免检类型:类型1|类型2|类型3
   ```

### 前端配置
1. 打开违规记录查询页面
2. 点击"月票车配置"按钮
3. 在"免检月票类型"区域选择需要免检的类型
4. 保存配置

## API接口变更

### 新增接口
- `GET /parking/vehicleReservation/getTicketTypesByParkCode?parkCode=2KPL6XFF`
  - 功能：获取指定车场的月票类型列表
  - 返回：`{ code: "0", data: { ticketTypes: ["类型1", "类型2"] } }`

### 修改接口
- `POST /parking/violations/monthly-ticket-full-config`
  - 新增参数：`exemptTicketTypes` (List<String>, 可选)
  - 功能：保存配置时支持免检类型

## 测试验证

### 功能测试点
1. **月票类型查询**：确认能正确查询到欧洲新城车场的所有月票类型
2. **配置保存**：确认免检类型能正确保存和读取
3. **过夜检查**：
   - 免检类型月票车过夜不拉黑
   - 普通月票车过夜正常拉黑
   - 非月票车过夜正常拉黑
4. **超时检查**：
   - 免检类型月票车不记录超时违规
   - 普通月票车正常记录超时违规
5. **UI交互**：配置界面的月票类型选择和保存功能

### 数据验证
- 检查配置表中 `description` 字段是否正确存储免检类型信息
- 检查违规表中是否按预期记录或不记录违规信息
- 检查黑名单接口调用是否按预期执行或跳过

## 兼容性说明

- 此修改向后兼容，对现有数据和功能无影响
- 如果配置中没有免检类型，系统按原逻辑工作
- 新增的API接口不影响现有接口的使用

## 部署注意事项

1. 需要重新编译和部署后端服务
2. 需要更新前端代码并重新部署
3. 建议在测试环境充分验证后再部署到生产环境
4. 部署后需要重新配置月票免检类型（如果需要） 