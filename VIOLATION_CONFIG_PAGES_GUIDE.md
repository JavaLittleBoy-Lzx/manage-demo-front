# 违规配置页面创建指南

## 已创建的页面

1. ✅ **ViolationLocationConfig.vue** - 违规位置配置（已完成）

## 待创建页面（参考ViolationLocationConfig.vue）

### 2. ViolationTypeConfig.vue - 违规类型配置

**关键字段：**
- `typeName` - 类型名称
- `typeCode` - 类型代码
- `parkName` - 车场名称
- `severityLevel` - 严重程度（mild/moderate/severe）
- `description` - 类型描述
- `sortOrder` - 排序
- `isEnabled` - 是否启用

**API调用：**
```javascript
import * as violationConfigApi from '@/api/violationConfig';

// 查询列表
violationConfigApi.getTypePage(params);

// 新增/编辑/删除/切换状态
violationConfigApi.addType(data);
violationConfigApi.updateType(id, data);
violationConfigApi.deleteType(id);
violationConfigApi.toggleTypeEnabled(id, isEnabled);
```

### 3. ViolationDescriptionConfig.vue - 违规描述配置

**关键字段：**
- `descriptionText` - 描述内容（TEXT类型）
- `violationTypeCode` - 关联违规类型代码
- `parkName` - 车场名称
- `usageCount` - 使用次数（只读，系统自动统计）
- `sortOrder` - 排序
- `isEnabled` - 是否启用

**API调用：**
```javascript
violationConfigApi.getDescriptionPage(params);
violationConfigApi.addDescription(data);
violationConfigApi.updateDescription(id, data);
violationConfigApi.deleteDescription(id);
violationConfigApi.toggleDescriptionEnabled(id, isEnabled);
```

### 4. BlacklistReasonConfig.vue - 拉黑原因配置

**关键字段：**
- `reasonText` - 原因内容
- `reasonCategory` - 原因分类（violation/security/other）
- `parkName` - 车场名称
- `usageCount` - 使用次数（只读）
- `sortOrder` - 排序
- `isEnabled` - 是否启用

**API调用：**
```javascript
violationConfigApi.getReasonPage(params);
violationConfigApi.addReason(data);
violationConfigApi.updateReason(id, data);
violationConfigApi.deleteReason(id);
violationConfigApi.toggleReasonEnabled(id, isEnabled);
```

## 创建步骤

1. 复制 `ViolationLocationConfig.vue` 文件
2. 修改组件名称和标题
3. 更新字段定义（formData、formRules、query）
4. 更新表格列配置
5. 更新表单字段
6. 替换API调用方法
7. 更新样式（保持一致）

## 路由配置

在 `src/router/index.js` 中添加路由：

```javascript
{
  path: '/admin/violation-location-config',
  name: 'ViolationLocationConfig',
  component: () => import('@/views/admin/ViolationLocationConfig.vue'),
  meta: { title: '违规位置配置' }
},
{
  path: '/admin/violation-type-config',
  name: 'ViolationTypeConfig',
  component: () => import('@/views/admin/ViolationTypeConfig.vue'),
  meta: { title: '违规类型配置' }
},
{
  path: '/admin/violation-description-config',
  name: 'ViolationDescriptionConfig',
  component: () => import('@/views/admin/ViolationDescriptionConfig.vue'),
  meta: { title: '违规描述配置' }
},
{
  path: '/admin/blacklist-reason-config',
  name: 'BlacklistReasonConfig',
  component: () => import('@/views/admin/BlacklistReasonConfig.vue'),
  meta: { title: '拉黑原因配置' }
}
```

## 菜单配置

在后台管理系统菜单中添加：

```
违规配置管理
├── 违规位置配置
├── 违规类型配置
├── 违规描述配置
└── 拉黑原因配置
```

