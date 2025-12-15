# 🔥 UnionID功能测试指南

## 📋 功能概述
本系统实现了基于UnionID机制的小程序引导用户关注公众号的完整解决方案。

## 🚀 快速开始

### 1. 数据库准备
```sql
-- 在MySQL中执行以下命令
mysql -u root -p
USE parking_manage;

-- 执行创建表的SQL脚本
source parking-demo/create_unionid_table.sql
```

### 2. 启动后端服务
```bash
cd parking-demo
mvn spring-boot:run
```

### 3. 启动小程序
```bash
cd car-new-demo
# 使用微信开发者工具打开项目
```

## 🔍 测试步骤

### 步骤1：检查后端服务
确保以下接口可以正常访问：
- `POST /parking/wechat/getUnionInfo` - 获取UnionID
- `POST /parking/wechat/getUnionInfoWithAuth` - 授权获取UnionID
- `GET /parking/wechat/checkSubscriptionByUnionid` - 检查关注状态
- `POST /parking/wechat/generateBindingCode` - 生成绑定码
- `GET /parking/wechat/checkBindingStatus` - 检查绑定状态

### 步骤2：小程序登录测试
1. 打开小程序登录页面
2. 查看控制台日志，应该看到以下信息：
   ```
   🚀 页面加载开始，准备初始化UnionID检查...
   🔍 开始初始化UnionID检查流程...
   🚀 初始化UnionID检查流程...
   ⏰ 延迟执行UnionID检查...
   🔍 开始检查公众号关注状态...
   🔄 开始获取用户微信信息...
   🚀 getUserFullInfo 开始执行...
   🔐 尝试静默登录...
   🔐 silentLogin 开始执行...
   ```

### 步骤3：检查UnionID获取
如果一切正常，应该看到：
- 成功获取到登录code
- 调用后端接口成功
- 返回包含UnionID的用户信息

### 步骤4：检查关注状态
- 如果用户未关注公众号，会显示关注提示
- 3秒后弹出引导弹窗
- 用户可以选择"去关注"或"稍后"

## 🐛 常见问题排查

### 问题1：没有看到UnionID检查日志
**原因**：可能前端代码没有正确加载
**解决**：
1. 检查控制台是否有JavaScript错误
2. 确认`WechatUnionUtils`是否正确导入
3. 检查`onLoad`方法是否被调用

### 问题2：后端接口调用失败
**原因**：接口路径或服务未启动
**解决**：
1. 确认后端服务正在运行
2. 检查接口路径是否正确（应该是`/parking/wechat/`）
3. 查看后端日志是否有错误

### 问题3：数据库连接失败
**原因**：数据库配置或表不存在
**解决**：
1. 检查数据库连接配置
2. 确认`user_wechat_info`表已创建
3. 执行SQL脚本创建表

### 问题4：UnionID为空
**原因**：微信配置问题
**解决**：
1. 确认小程序和公众号绑定到同一个微信开放平台
2. 检查AppID和AppSecret配置
3. 确认用户已授权小程序

## 📱 测试数据

### 测试用户信息
- 手机号：13800138000
- UnionID：test_unionid_001
- 小程序OpenID：test_miniapp_openid_001

### 测试接口
```bash
# 测试获取UnionID
curl -X POST http://www.xuerparking.cn:8080/parking/wechat/getUnionInfo \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'

# 测试检查关注状态
curl -X GET "http://www.xuerparking.cn:8080/parking/wechat/checkSubscriptionByUnionid?unionid=test_unionid_001"
```

## 🔧 调试技巧

### 1. 前端调试
- 打开微信开发者工具的控制台
- 查看Network面板的网络请求
- 使用`console.log`输出关键信息

### 2. 后端调试
- 查看Spring Boot控制台日志
- 使用Postman测试接口
- 检查数据库中的数据

### 3. 微信调试
- 使用微信开发者工具的调试功能
- 查看微信API的返回结果
- 确认授权流程是否正确

## 📞 技术支持

如果遇到问题，请：
1. 查看控制台错误日志
2. 检查网络请求状态
3. 确认配置是否正确
4. 联系开发团队

## 🎯 预期结果

成功实现后，用户登录小程序时：
1. 自动获取UnionID
2. 检查公众号关注状态
3. 如果未关注，显示引导提示
4. 用户可以跳转到关注引导页面
5. 完成关注后自动关联用户身份

---

**注意**：本功能需要微信开放平台配置支持，请确保相关配置正确。 