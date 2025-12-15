# 车场权限管理功能 - 前端实现说明

## 功能概述

本次更新在系统中添加了**车场权限管理**功能，实现了以下需求：

> 在用户信息中添加一个"管理车场"字段，当前用户分配的所有菜单中的车场只能统计和显示当前用户所管理的车场名称，不允许出现除了当前用户所管理的车场之外的数据。

## 前端改动清单

### 1. 新增文件

#### 1.1 车场权限管理工具 (`src/utils/parkAuth.js`)

核心工具文件，提供以下功能：

- `getManagedParks()` - 获取当前用户管理的车场列表
- `setManagedParks(parks)` - 设置用户管理的车场列表
- `isAdmin()` - 判断当前用户是否为管理员
- `canAccessPark(parkName)` - 检查用户是否有权限访问指定车场
- `filterDataByParkAuth(dataList, fieldName)` - 过滤数据列表，只保留有权限的车场数据
- `getParkFilterParam()` - 获取车场筛选参数（用于API请求）
- `getParkFilterArray()` - 获取车场筛选参数数组
- `clearParkAuth()` - 清除车场权限数据（用于登出）
- `getParkAuthTip()` - 获取车场权限提示信息

**特点**：
- 管理员用户可以查看所有车场数据
- 未配置管理车场的用户默认可以查看所有数据（向后兼容）
- 配置了管理车场的用户只能查看其管理的车场数据

### 2. 修改的文件

#### 2.1 登录页面 (`src/views/Login.vue`)

**改动内容**：
- 在登录成功后，从后端返回的用户信息中提取 `managedParks` 字段
- 支持两种数据格式：数组或逗号分隔的字符串
- 将管理车场信息存储到 `localStorage` 中（键名：`managed_parks`）

```javascript
// 存储用户管理的车场信息
if (res.data.data.managedParks) {
  if (Array.isArray(res.data.data.managedParks)) {
    localStorage.setItem("managed_parks", JSON.stringify(res.data.data.managedParks));
  } else if (typeof res.data.data.managedParks === 'string') {
    const parksArray = res.data.data.managedParks.split(',').map(p => p.trim()).filter(p => p);
    localStorage.setItem("managed_parks", JSON.stringify(parksArray));
  }
} else {
  localStorage.removeItem("managed_parks");
}
```

#### 2.2 首页Dashboard (`src/views/admin/EmptyPer.vue`)

**改动内容**：
- 导入车场权限管理工具
- 在所有数据加载函数中添加车场权限过滤逻辑

修改的函数：
1. `loadParkAppointmentStats()` - 各车场预约数量统计
2. `loadParkEntryStats()` - 各车场进场数量统计
3. `loadTopViolators()` - 高频违规车辆Top10
4. `loadViolationTrend()` - 违规记录趋势统计
5. `loadLocationFrequency()` - 各位置违规频次统计

**示例代码**：
```javascript
// 导入工具函数
import { filterDataByParkAuth, getParkAuthTip, isAdmin as checkIsAdmin } from '../../utils/parkAuth';

// 在数据加载函数中添加过滤
const loadParkAppointmentStats = async () => {
  const response = await dashboardApi.getParkAppointmentStats(daysParam);
  let data = response.data.data;
  
  // 🔒 根据用户权限过滤车场数据
  data = filterDataByParkAuth(data, 'parkName');
  console.log(`🔒 权限过滤后 - 数据条数: ${data.length}, 提示: ${getParkAuthTip()}`);
  
  // 后续处理...
};
```

#### 2.3 用户管理 - 添加/编辑页面 (`src/views/admin/AddUser.vue`)

**改动内容**：
- 添加"管理车场"多选下拉框
- 从后端获取所有可用车场列表
- 支持编辑用户的管理车场权限
- 添加友好的提示信息

**新增字段**：
```vue
<el-form-item label="管理车场" prop="managedParks">
  <el-select 
    v-model="form.data.managedParks" 
    placeholder="请选择管理的车场（可多选，不选则可查看所有）" 
    multiple
    collapse-tags
    collapse-tags-tooltip
    style="width: 100%"
  >
    <el-option v-for="item in parkList" :key="item" :label="item" :value="item">
    </el-option>
  </el-select>
  <div style="color: #909399; font-size: 12px; margin-top: 5px;">
    提示：不选择车场则用户可以查看所有车场数据，选择后用户只能查看所选车场的数据
  </div>
</el-form-item>
```

**数据处理**：
```javascript
// 表单数据中添加managedParks字段
var form = reactive({
  data: {
    // ... 其他字段
    managedParks: [], // 管理的车场列表
  },
});

// 编辑时处理managedParks字段（支持字符串和数组）
if (userData.managedParks) {
  if (typeof userData.managedParks === 'string') {
    userData.managedParks = userData.managedParks.split(',').map(p => p.trim()).filter(p => p);
  } else if (!Array.isArray(userData.managedParks)) {
    userData.managedParks = [];
  }
}

// 获取车场列表
request.get("/parking/venue/listAll").then((res) => {
  if (res.data && Array.isArray(res.data)) {
    parkList.value = res.data.map(item => item.parkName || item.community || item.name).filter(name => name);
    parkList.value = [...new Set(parkList.value)];
  }
});
```

## 使用说明

### 管理员配置用户车场权限

1. 登录系统（管理员账号）
2. 进入"用户管理"页面
3. 点击"新增"或"编辑"用户
4. 在"管理车场"字段中选择该用户可以管理的车场（可多选）
   - **不选择**：用户可以查看所有车场数据
   - **选择1个或多个车场**：用户只能查看所选车场的数据
5. 提交保存

### 用户使用

1. 用户登录后，系统会自动加载其管理的车场权限
2. 在Dashboard和各个管理页面中，只会显示该用户有权限查看的车场数据
3. 管理员用户始终可以查看所有车场数据

## 权限规则

### 1. 管理员权限

以下情况视为管理员，可以查看所有车场数据：
- `roleId = 1`
- 角色名称包含"管理员"（但不包含特殊标识，如"东北林业大学"）

### 2. 普通用户权限

- **未配置管理车场**（`managedParks` 为空或NULL）：可以查看所有车场数据（向后兼容）
- **配置了管理车场**：只能查看其管理的车场数据

### 3. 数据过滤

所有涉及车场数据的查询都会自动进行权限过滤：
- Dashboard统计图表
- 车场预约统计
- 车场进场统计
- 违规记录统计
- 其他涉及车场的数据查询

## 后端配置要求

前端已完成所有车场权限管理功能的开发，后端需要配合实现以下内容：

### 1. 数据库修改

在用户表中添加 `managed_parks` 字段：

```sql
ALTER TABLE sys_user ADD COLUMN managed_parks VARCHAR(500) COMMENT '管理的车场列表（逗号分隔）';
```

### 2. 登录接口返回数据

登录接口需要返回 `managedParks` 字段：

```json
{
  "code": "0",
  "data": {
    "userId": 10,
    "userName": "张三",
    "roleId": 2,
    "managedParks": "A区车场,B区车场"  // 新增字段
  }
}
```

### 3. 用户管理接口

- 新增/修改用户接口需要支持 `managedParks` 字段的保存
- 查询用户接口需要返回 `managedParks` 字段

### 4. 车场列表接口

需要提供一个获取所有车场列表的接口（用于用户管理页面的下拉选择）：

```
GET /parking/venue/listAll
```

**详细的后端实现指南请参考**：`PARKING_AUTH_BACKEND_GUIDE.md`

## 数据格式说明

### 前后端数据交互

**前端 → 后端**（保存用户）：
```json
{
  "userId": 10,
  "managedParks": ["A区车场", "B区车场"]  // 前端发送数组
}
```

**后端 → 前端**（查询用户/登录）：
```json
{
  "userId": 10,
  "managedParks": "A区车场,B区车场"  // 后端返回字符串（逗号分隔）或数组都可以
}
```

**localStorage存储格式**：
```javascript
// 存储在 localStorage 中的格式是JSON字符串
localStorage.getItem('managed_parks')  // '["A区车场","B区车场"]'
```

## 测试建议

### 1. 功能测试

1. **管理员测试**
   - 创建管理员用户，验证可以查看所有车场数据
   
2. **普通用户测试**
   - 创建普通用户，配置管理车场为"A区车场,B区车场"
   - 验证Dashboard只显示A区和B区的数据
   - 验证无法看到C区的数据

3. **无限制用户测试**
   - 创建用户但不配置管理车场
   - 验证可以查看所有车场数据（向后兼容）

### 2. 边界测试

- 测试空数组 `[]`
- 测试 `null` 值
- 测试空字符串 `""`
- 测试单个车场
- 测试多个车场

## 兼容性说明

### 向后兼容

本次更新完全向后兼容：
1. 未配置 `managedParks` 的用户可以继续查看所有数据
2. 不会影响现有用户的使用
3. 只有明确配置了车场权限的用户才会受到限制

### 浏览器兼容性

- 使用 `localStorage` 存储权限信息
- 支持所有现代浏览器
- 需要启用 JavaScript

## 常见问题

### Q1: 用户看不到任何数据？
**A**: 检查该用户是否配置了管理车场，且配置的车场名称与数据库中的车场名称完全一致（包括空格）。

### Q2: 管理员也被限制了权限？
**A**: 检查管理员的 `roleId` 是否为 1，或角色名称是否包含"管理员"。

### Q3: 修改用户的管理车场后，用户需要重新登录吗？
**A**: 是的，管理车场信息在登录时加载到 `localStorage`，修改后需要用户重新登录才能生效。

### Q4: 可以动态切换管理车场吗？
**A**: 当前实现是在登录时加载权限，如需动态切换，需要额外开发实时权限刷新功能。

## 开发者注意事项

1. **字段名称一致性**
   - 确保数据中的车场字段名称与 `filterDataByParkAuth` 函数的 `fieldName` 参数一致
   - 常见字段名：`parkName`、`community`、`location`

2. **新增涉及车场的功能**
   - 所有新增的涉及车场数据的功能都需要添加权限过滤
   - 使用 `filterDataByParkAuth` 函数进行过滤

3. **性能考虑**
   - 权限过滤在前端进行，大数据量时可能影响性能
   - 建议后端也实现相应的权限过滤，减少传输数据量

4. **日志记录**
   - 已在数据过滤时添加 console.log 输出
   - 便于开发和调试

## 更新日志

### 2025-01-XX v1.0

- ✅ 创建车场权限管理工具 (`parkAuth.js`)
- ✅ 修改登录逻辑，存储管理车场信息
- ✅ 修改Dashboard统计图表，添加车场过滤
- ✅ 修改用户管理页面，添加管理车场字段编辑功能
- ✅ 编写后端实现指南文档

## 相关文档

- [后端实现指南](./PARKING_AUTH_BACKEND_GUIDE.md) - 详细的后端开发指南
- [车场权限工具API文档](./src/utils/parkAuth.js) - 工具函数的详细说明

## 技术支持

如有问题，请联系开发团队或查看项目文档。

