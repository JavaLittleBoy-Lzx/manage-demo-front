# 违规管理系统 TooManyResultsException 修复指南

## 问题描述

**错误现象：** 在 `add-violation.vue` 页面中，当用户点击车牌搜索结果后，系统报错：
```
org.mybatis.spring.MyBatisSystemException: nested exception is org.apache.ibatis.exceptions.TooManyResultsException: Expected one result (or null) to be returned by selectOne(), but found: 8
```

**错误触发流程：**
1. 用户在违规记录添加页面输入车牌号
2. 系统显示搜索建议列表
3. 用户点击某个搜索结果
4. 触发 `selectPlateSuggestion()` 方法
5. 调用 `getOwnerInfo()` 方法
6. 调用后端API `/parking/violations/owners/by-plate/{plateNumber}`
7. 后端使用 `selectOne()` 查询车主信息
8. 由于同一车牌号对应多个车主记录，抛出 `TooManyResultsException`

## 根本原因

数据库中同一个车牌号对应了多个车主记录（8条），而后端代码使用了 `selectOne()` 方法，该方法期望只返回一个结果。

## 修复方案

### 方案 1：修改后端查询逻辑（推荐）

修改 `ViolationsServiceImpl.getOwnerByPlate()` 方法：

```java
@Override
public Map<String, Object> getOwnerByPlate(String plateNumber) {
    try {
        log.info("根据车牌号查询车主信息: {}", plateNumber);
        
        // 构建查询条件
        QueryWrapper<Ownerinfo> wrapper = new QueryWrapper<>();
        wrapper.eq("plate_number", plateNumber)
               .orderBy(true, false, "created_at")  // 按创建时间倒序，取最新的
               .last("LIMIT 1");  // 只取一条记录
        
        // 使用 selectList 代替 selectOne，然后取第一条
        List<Ownerinfo> owners = ownerinfoMapper.selectList(wrapper);
        
        if (owners.isEmpty()) {
            log.warn("未找到车牌号 {} 对应的车主信息", plateNumber);
            return Collections.emptyMap();
        }
        
        Ownerinfo owner = owners.get(0);
        
        // 如果找到多条记录，记录警告日志
        if (owners.size() > 1) {
            log.warn("车牌号 {} 对应多个车主记录，共 {} 条，使用最新的记录", plateNumber, owners.size());
        }
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("ownerId", owner.getId());
        result.put("name", owner.getName());
        result.put("phone", owner.getPhone());
        result.put("address", owner.getAddress());
        result.put("creditScore", owner.getCreditScore() != null ? owner.getCreditScore() : 100);
        
        log.info("查询车主信息成功: 车牌号={}, 车主={}", plateNumber, owner.getName());
        return result;
        
    } catch (Exception e) {
        log.error("查询车主信息失败: 车牌号={}, 错误={}", plateNumber, e.getMessage(), e);
        throw new RuntimeException("查询车主信息失败: " + e.getMessage());
    }
}
```

### 方案 2：使用 MyBatis-Plus 的 `selectList` + 手动处理

```java
@Override
public Map<String, Object> getOwnerByPlate(String plateNumber) {
    try {
        log.info("根据车牌号查询车主信息: {}", plateNumber);
        
        // 构建查询条件
        QueryWrapper<Ownerinfo> wrapper = new QueryWrapper<>();
        wrapper.eq("plate_number", plateNumber);
        
        // 使用 selectList 查询所有匹配的记录
        List<Ownerinfo> owners = ownerinfoMapper.selectList(wrapper);
        
        if (owners.isEmpty()) {
            log.warn("未找到车牌号 {} 对应的车主信息", plateNumber);
            return Collections.emptyMap();
        }
        
        // 选择最合适的记录（按业务规则）
        Ownerinfo selectedOwner = selectBestOwner(owners, plateNumber);
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("ownerId", selectedOwner.getId());
        result.put("name", selectedOwner.getName());
        result.put("phone", selectedOwner.getPhone());
        result.put("address", selectedOwner.getAddress());
        result.put("creditScore", selectedOwner.getCreditScore() != null ? selectedOwner.getCreditScore() : 100);
        
        log.info("查询车主信息成功: 车牌号={}, 车主={}, 共找到{}条记录", 
                plateNumber, selectedOwner.getName(), owners.size());
        return result;
        
    } catch (Exception e) {
        log.error("查询车主信息失败: 车牌号={}, 错误={}", plateNumber, e.getMessage(), e);
        throw new RuntimeException("查询车主信息失败: " + e.getMessage());
    }
}

/**
 * 从多个车主记录中选择最合适的一个
 */
private Ownerinfo selectBestOwner(List<Ownerinfo> owners, String plateNumber) {
    if (owners.size() == 1) {
        return owners.get(0);
    }
    
    log.warn("车牌号 {} 对应多个车主记录，共 {} 条，需要选择最合适的", plateNumber, owners.size());
    
    // 业务规则：优先选择状态为active的记录
    List<Ownerinfo> activeOwners = owners.stream()
            .filter(owner -> "active".equals(owner.getStatus()))
            .collect(Collectors.toList());
    
    if (!activeOwners.isEmpty()) {
        // 如果有active状态的记录，选择创建时间最新的
        return activeOwners.stream()
                .max(Comparator.comparing(Ownerinfo::getCreatedAt))
                .orElse(activeOwners.get(0));
    }
    
    // 如果没有active状态的记录，选择创建时间最新的
    return owners.stream()
            .max(Comparator.comparing(Ownerinfo::getCreatedAt))
            .orElse(owners.get(0));
}
```

### 方案 3：数据库层面解决（长期方案）

1. **添加唯一约束**：
```sql
-- 为车牌号字段添加唯一约束（如果业务允许）
ALTER TABLE ownerinfo ADD CONSTRAINT uk_plate_number UNIQUE (plate_number);
```

2. **数据清理**：
```sql
-- 查找重复的车牌号
SELECT plate_number, COUNT(*) as count 
FROM ownerinfo 
GROUP BY plate_number 
HAVING COUNT(*) > 1;

-- 删除重复记录，保留最新的
DELETE o1 FROM ownerinfo o1
INNER JOIN ownerinfo o2 
WHERE o1.id < o2.id 
AND o1.plate_number = o2.plate_number;
```

## 实施步骤

1. **立即修复**：
   - 使用方案 1 快速解决当前问题
   - 在 `ViolationsServiceImpl.java` 的第159行附近修改代码

2. **测试验证**：
   - 重启后端服务
   - 在前端测试车牌搜索功能
   - 验证点击搜索结果不再报错

3. **数据清理**（可选）：
   - 分析重复数据的原因
   - 制定数据清理策略
   - 执行数据去重操作

4. **预防措施**：
   - 在应用层添加重复性检查
   - 考虑添加数据库唯一约束

## 相关文件

- **后端文件**：`ViolationsServiceImpl.java` （第159行）
- **前端文件**：`car-new-demo/pagesE/violation/add-violation.vue` （第879行）
- **API配置**：`car-new-demo/config/api.js` （第124行）

## 预期效果

修复后，用户在违规记录添加页面点击车牌搜索结果时：
1. 不再出现 `TooManyResultsException` 错误
2. 能够正常获取车主信息并显示在界面上
3. 系统会在日志中记录多条记录的情况，便于后续数据清理

## 注意事项

1. **数据一致性**：如果同一车牌号有多个车主，需要根据业务逻辑选择正确的记录
2. **性能优化**：使用 `LIMIT 1` 限制查询结果，提高查询性能
3. **日志记录**：保留详细的日志记录，便于问题追踪和数据分析
4. **业务规则**：可根据实际业务需求调整选择车主记录的规则 