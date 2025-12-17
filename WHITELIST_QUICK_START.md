# 白名单数据管理 - 快速启动指南

## 🚀 快速部署（3步完成）

### 步骤1: 初始化数据库

在MySQL中执行以下SQL文件：

```bash
# 进入parking-demo目录
cd d:\PakingDemo\parking-demo

# 执行SQL创建表
mysql -u root -p parking_management < sql/create_whitelist_table.sql
```

或者直接在MySQL客户端执行 `sql/create_whitelist_table.sql` 文件的内容。

### 步骤2: 重启后端服务

```bash
# 进入parking-demo目录
cd d:\PakingDemo\parking-demo

# 如果使用IDEA，直接点击运行按钮
# 如果使用命令行：
mvn spring-boot:run
```

### 步骤3: 访问前端页面

1. 启动前端服务（如果已启动则跳过）
2. 在浏览器中访问后台管理系统
3. 在菜单中找到"白名单数据管理"（需要配置路由）

## 📁 已创建的文件清单

### 前端文件 (manage-front)
```
src/
├── views/admin/
│   └── WhitelistManagement.vue    ✅ 白名单管理页面
└── api/
    └── whitelist.js                ✅ 白名单API接口
```

### 后端文件 (parking-demo)
```
src/main/java/com/parkingmanage/
├── entity/
│   └── Whitelist.java              ✅ 白名单实体类
├── mapper/
│   └── WhitelistMapper.java        ✅ Mapper接口
├── service/
│   ├── IWhitelistService.java      ✅ Service接口
│   └── impl/
│       └── WhitelistServiceImpl.java ✅ Service实现
└── controller/
    └── WhitelistController.java    ✅ Controller控制器

src/main/resources/mapper/
└── WhitelistMapper.xml              ✅ MyBatis映射文件

sql/
└── create_whitelist_table.sql       ✅ 数据库建表SQL
```

## 🔧 配置路由（可选）

如果需要在菜单中显示白名单管理，需要在路由配置中添加：

```javascript
// 在 src/router/index.js 或相应的路由文件中添加
{
  path: '/admin/whitelist',
  name: 'WhitelistManagement',
  component: () => import('@/views/admin/WhitelistManagement.vue'),
  meta: {
    title: '白名单管理',
    icon: 'Check',
    requiresAuth: true
  }
}
```

## ✨ 核心功能演示

### 1️⃣ 添加白名单

```javascript
// 1. 选择车场：东北林业大学
// 2. 输入车牌：京A12345
// 3. 点击查询按钮（或失焦自动查询）
// 4. 系统自动填充：
//    - 车主姓名: 张三
//    - 车主电话: 13800138000
//    - 车主地址: 某某地址
// 5. 点击保存
```

### 2️⃣ ACMS接口集成示例

前端自动调用ACMS接口查询车主信息：

```javascript
// 在 WhitelistManagement.vue 中
const queryOwnerInfo = async () => {
  const response = await request({
    url: '/parking/acms/vip/merged-info',
    method: 'POST',
    data: {
      plateNumber: formData.plateNumber,
      parkName: formData.parkName
    }
  });
  
  // 自动回显查询结果
  formData.ownerName = response.data.ownerName;
  formData.ownerPhone = response.data.ownerPhone;
  formData.ownerAddress = response.data.ownerAddress;
}
```

### 3️⃣ API接口测试

使用Postman或curl测试：

```bash
# 查询白名单列表
curl -X GET "https://www.xuerparking.cn:8543/parking/whitelist?page=1&size=10"

# 添加白名单
curl -X POST "https://www.xuerparking.cn:8543/parking/whitelist" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "京A12345",
    "parkName": "东北林业大学",
    "ownerName": "张三",
    "ownerPhone": "13800138000",
    "ownerAddress": "某某地址",
    "remark": "VIP用户"
  }'

# 检查是否在白名单
curl -X GET "https://www.xuerparking.cn:8543/parking/whitelist/check?plateNumber=京A12345&parkName=东北林业大学"
```

## 🎯 与违规管理的集成建议

可以在违规记录创建时检查白名单，实现免检功能：

```java
// 在 ViolationsService 中添加
@Autowired
private IWhitelistService whitelistService;

public void createViolation(Violations violation) {
    // 检查是否在白名单中
    boolean inWhitelist = whitelistService.checkWhitelist(
        violation.getPlateNumber(), 
        violation.getParkName()
    );
    
    if (inWhitelist) {
        // 白名单车辆，跳过违规记录或特殊处理
        log.info("车辆{}在白名单中，跳过违规记录", violation.getPlateNumber());
        return;
    }
    
    // 正常创建违规记录
    this.save(violation);
}
```

## 📊 数据字段对应关系

| ACMS接口字段 | 白名单表字段 | 说明 |
|-------------|-------------|------|
| ownerName | owner_name | 车主姓名 |
| ownerPhone | owner_phone | 车主电话 |
| ownerAddress | owner_address | 车主地址 |
| - | plate_number | 车牌号（用户输入） |
| - | park_name | 车场名称（用户选择） |
| - | remark | 备注（用户输入） |

## 🐛 故障排查

### 问题1: ACMS接口查询失败

**现象**: 点击查询按钮提示"查询车主信息失败"

**解决方案**:
1. 检查ACMS接口是否正常运行：`https://csharphrb.picp.vip/parking/acms/vip/merged-info`
2. 检查网络连接
3. 查看浏览器控制台错误信息
4. 如果接口不可用，可以手动填写车主信息

### 问题2: 数据库连接失败

**现象**: 后端启动报错，无法连接数据库

**解决方案**:
1. 检查MySQL服务是否启动
2. 检查 `application.yml` 中的数据库配置
3. 确认whitelist表已创建

### 问题3: 前端页面无法访问

**现象**: 404 Not Found

**解决方案**:
1. 检查路由配置是否正确
2. 检查文件路径是否正确
3. 重新编译前端项目：`npm run build`

## 📝 下一步扩展建议

1. **批量导入**: 支持Excel批量导入白名单
2. **有效期管理**: 为白名单添加有效期字段
3. **审批流程**: 添加白名单审批功能
4. **历史记录**: 记录白名单的修改历史
5. **统计报表**: 白名单使用情况统计

## 📧 技术支持

如有问题，请查看详细文档：`README_WHITELIST.md`

---

**开发完成时间**: 2025-10-07  
**版本**: v1.0.0  
**开发者**: AI Assistant

