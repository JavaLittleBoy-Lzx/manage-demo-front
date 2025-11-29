# 车场权限管理 - 后端实现指南

## 概述

本文档说明如何在后端实现用户车场权限管理功能，使用户只能访问其管理的车场数据。

## 1. 数据库修改

### 1.1 修改用户表

在用户表（假设为 `sys_user`）中添加 `managed_parks` 字段：

```sql
-- 添加managed_parks字段，用于存储用户管理的车场列表（逗号分隔）
ALTER TABLE sys_user ADD COLUMN managed_parks VARCHAR(500) COMMENT '管理的车场列表（逗号分隔）';

-- 示例数据
-- 用户1：管理A区车场和B区车场
UPDATE sys_user SET managed_parks = 'A区车场,B区车场' WHERE user_id = 1;

-- 用户2：管理所有车场（NULL或空字符串表示）
UPDATE sys_user SET managed_parks = NULL WHERE user_id = 2;
```

## 2. 后端实体类修改

### 2.1 用户实体类（User/SysUser）

```java
@Data
@TableName("sys_user")
public class SysUser {
    private Long userId;
    private String userName;
    private String loginName;
    private String password;
    private String telephone;
    private Long roleId;
    private String roleName;
    
    // 新增：管理的车场列表（逗号分隔的字符串）
    private String managedParks;
    
    // 其他字段...
}
```

## 3. 登录接口修改

### 3.1 登录API返回数据

在用户登录接口中，需要返回 `managedParks` 字段：

```java
@RestController
@RequestMapping("/parking/user")
public class UserController {
    
    @GetMapping("/login")
    public Result login(@RequestParam String username, @RequestParam String password) {
        // 验证用户名密码...
        
        SysUser user = userService.getUserByLoginName(username);
        
        // 构建返回数据
        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getUserId());
        data.put("userName", user.getUserName());
        data.put("loginName", user.getLoginName());
        data.put("roleId", user.getRoleId());
        data.put("roleName", user.getRoleName());
        
        // 🔑 关键：返回用户管理的车场列表
        data.put("managedParks", user.getManagedParks());
        
        return Result.success(data);
    }
}
```

## 4. 用户管理接口修改

### 4.1 新增/修改用户接口

```java
@RestController
@RequestMapping("/parking/user")
public class UserController {
    
    @PostMapping
    public Result createUser(@RequestBody SysUser user) {
        // 保存用户信息（包括managedParks字段）
        userService.save(user);
        return Result.success();
    }
    
    @PutMapping
    public Result updateUser(@RequestBody SysUser user) {
        // 更新用户信息（包括managedParks字段）
        userService.updateById(user);
        return Result.success();
    }
    
    @GetMapping("/{userId}")
    public Result getUserById(@PathVariable Long userId) {
        SysUser user = userService.getById(userId);
        // 返回用户信息（包括managedParks字段）
        return Result.success(user);
    }
}
```

## 5. 数据查询接口添加车场过滤

### 5.1 车场预约统计接口

```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    @GetMapping("/park-appointment-stats")
    public Result getParkAppointmentStats(@RequestParam Integer days) {
        // 获取当前登录用户
        Long userId = SecurityUtils.getCurrentUserId();
        SysUser user = userService.getById(userId);
        
        List<ParkAppointmentStats> stats;
        
        // 根据用户权限过滤数据
        if (isAdmin(user) || StringUtils.isEmpty(user.getManagedParks())) {
            // 管理员或未配置管理车场的用户：查询所有数据
            stats = dashboardService.getParkAppointmentStats(days);
        } else {
            // 普通用户：只查询其管理的车场数据
            List<String> managedParkList = Arrays.asList(user.getManagedParks().split(","));
            stats = dashboardService.getParkAppointmentStatsByParks(days, managedParkList);
        }
        
        return Result.success(stats);
    }
    
    // 判断是否为管理员
    private boolean isAdmin(SysUser user) {
        // roleId = 1 表示管理员
        return user.getRoleId() == 1 || 
               (user.getRoleName() != null && user.getRoleName().contains("管理员"));
    }
}
```

### 5.2 Service层添加车场过滤

```java
@Service
public class DashboardServiceImpl implements DashboardService {
    
    @Override
    public List<ParkAppointmentStats> getParkAppointmentStats(Integer days) {
        // 查询所有车场的预约统计
        return baseMapper.selectParkAppointmentStats(days, null);
    }
    
    @Override
    public List<ParkAppointmentStats> getParkAppointmentStatsByParks(
            Integer days, List<String> parkNames) {
        // 查询指定车场的预约统计
        return baseMapper.selectParkAppointmentStats(days, parkNames);
    }
}
```

### 5.3 Mapper/SQL修改

```xml
<!-- ParkingMapper.xml -->
<select id="selectParkAppointmentStats" resultType="ParkAppointmentStats">
    SELECT 
        park_name as parkName,
        appointment_date as appointmentDate,
        COUNT(*) as appointmentCount
    FROM vehicle_reservation
    WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY)
    
    <!-- 🔑 关键：添加车场过滤条件 -->
    <if test="parkNames != null and parkNames.size() > 0">
        AND park_name IN
        <foreach collection="parkNames" item="parkName" open="(" separator="," close=")">
            #{parkName}
        </foreach>
    </if>
    
    GROUP BY park_name, appointment_date
    ORDER BY appointment_date ASC
</select>
```

## 6. 其他需要修改的接口

需要在以下接口中添加车场权限过滤：

1. **车场进场统计** (`/api/dashboard/park-entry-stats`)
2. **违规记录查询** (`/parking/violations/*`)
3. **车辆预约查询** (`/parking/vehicle-reservation/*`)
4. **入场记录查询** (`/parking/venue/*`)
5. **月票管理** (`/parking/month-ticket/*`)
6. **黑名单管理** (`/parking/blacklist/*`)

所有涉及车场数据的查询接口都需要添加类似的权限过滤逻辑。

## 7. 工具类（可选）

创建一个工具类来统一处理车场权限：

```java
@Component
public class ParkAuthUtil {
    
    @Autowired
    private UserService userService;
    
    /**
     * 获取当前用户管理的车场列表
     */
    public List<String> getCurrentUserManagedParks() {
        Long userId = SecurityUtils.getCurrentUserId();
        SysUser user = userService.getById(userId);
        
        if (isAdmin(user) || StringUtils.isEmpty(user.getManagedParks())) {
            return null; // null表示可以访问所有车场
        }
        
        return Arrays.asList(user.getManagedParks().split(","))
                     .stream()
                     .map(String::trim)
                     .filter(StringUtils::isNotEmpty)
                     .collect(Collectors.toList());
    }
    
    /**
     * 检查用户是否有权限访问指定车场
     */
    public boolean canAccessPark(String parkName) {
        List<String> managedParks = getCurrentUserManagedParks();
        
        // null表示可以访问所有车场
        if (managedParks == null) {
            return true;
        }
        
        return managedParks.contains(parkName);
    }
    
    /**
     * 判断是否为管理员
     */
    private boolean isAdmin(SysUser user) {
        return user.getRoleId() == 1 || 
               (user.getRoleName() != null && user.getRoleName().contains("管理员"));
    }
}
```

## 8. 测试建议

1. **管理员用户测试**
   - 创建管理员用户（roleId=1），不设置managedParks
   - 验证可以查看所有车场数据

2. **普通用户测试**
   - 创建普通用户，设置managedParks为"A区车场,B区车场"
   - 验证只能查看A区和B区的数据
   - 验证无法查看C区的数据

3. **无车场限制用户测试**
   - 创建用户，managedParks设置为NULL或空字符串
   - 验证可以查看所有车场数据（向后兼容）

## 9. 注意事项

1. **数据格式统一**：前端传递数组，后端存储为逗号分隔的字符串
2. **NULL值处理**：NULL或空字符串表示可以访问所有车场
3. **性能优化**：对于频繁查询，考虑在SQL层面进行过滤而不是应用层
4. **权限验证**：在Controller层就进行权限检查，不要等到Service层
5. **日志记录**：记录用户访问车场数据的日志，便于审计

## 10. 前后端数据交互示例

### 10.1 登录响应

```json
{
  "code": "0",
  "msg": "成功",
  "data": {
    "userId": 10,
    "userName": "张三",
    "loginName": "zhangsan",
    "roleId": 2,
    "roleName": "普通用户",
    "managedParks": "A区车场,B区车场",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 10.2 保存用户请求

```json
{
  "userId": 10,
  "userName": "张三",
  "loginName": "zhangsan",
  "password": "******",
  "telephone": "13800138000",
  "roleId": 2,
  "managedParks": ["A区车场", "B区车场"]
}
```

**注意**：前端发送数组，后端需要转换为逗号分隔的字符串存储。

```java
// 在Controller或Service中处理
if (user.getManagedParks() != null) {
    // 如果前端传递的是JSON数组，需要先反序列化
    // 然后转换为逗号分隔的字符串
    String managedParksStr = String.join(",", managedParksArray);
    user.setManagedParks(managedParksStr);
}
```

## 总结

通过以上步骤，可以完整实现用户车场权限管理功能。核心思想是：

1. 在用户表中添加 `managed_parks` 字段
2. 登录时返回该字段给前端
3. 所有涉及车场数据的查询接口都要添加车场过滤逻辑
4. 管理员和未配置车场的用户可以查看所有数据

前端已经完成了相关的权限过滤逻辑，后端只需要按照本指南实现即可。

