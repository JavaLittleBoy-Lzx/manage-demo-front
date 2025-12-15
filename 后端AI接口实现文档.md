# 后端BigModel AI接口实现文档

## 📋 架构概述

本文档提供后端实现BigModel AI接口的完整方案，确保安全性、性能和可维护性。

## 🔐 安全架构

### 为什么需要后端代理？

1. **API密钥安全**：避免BigModel API密钥暴露在前端
2. **统一管理**：所有AI请求通过后端统一管理和监控
3. **缓存优化**：后端可以实现智能缓存，减少API调用成本
4. **访问控制**：基于用户权限控制AI功能的使用
5. **审计日志**：记录所有AI请求，便于问题追踪

### 安全措施

- API密钥存储在服务器端环境变量
- 实现请求频率限制
- 添加内容安全过滤
- 用户权限验证
- 请求签名验证（可选）

## 🛠️ 后端接口实现

### 1. 环境配置

```bash
# BigModel API配置
BIGMODEL_API_KEY=831bff9d3cd9440ea40b30a966960444.zJ8ffGR16OwpZd9B
BIGMODEL_BASE_URL=https://open.bigmodel.cn/api/paas/v4
BIGMODEL_TIMEOUT=60000

# AI功能开关
AI_CUSTOMER_SERVICE_ENABLED=true
AI_VIOLATION_DESCRIPTION_ENABLED=true
AI_DATA_REPORT_ENABLED=true
AI_NOTIFICATION_TEXT_ENABLED=true
AI_BEHAVIOR_ANALYSIS_ENABLED=true

# 缓存配置
AI_CACHE_TTL=1800
AI_CACHE_MAX_SIZE=1000

# 限流配置
AI_RATE_LIMIT_PER_MINUTE=60
AI_RATE_LIMIT_PER_HOUR=1000
```

### 2. Spring Boot实现示例

#### 2.1 配置类

```java
@Configuration
public class BigModelConfig {

    @Value("${bigmodel.api.key}")
    private String apiKey;

    @Value("${bigmodel.base.url}")
    private String baseUrl;

    @Value("${bigmodel.timeout}")
    private int timeout;

    @Bean
    public RestTemplate bigModelRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // 设置超时时间
        HttpComponentsClientHttpRequestFactory factory =
            new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);

        restTemplate.setRequestFactory(factory);

        // 设置请求头
        restTemplate.setInterceptors(List.of(new BigModelInterceptor(apiKey)));

        return restTemplate;
    }

    @Bean
    public CacheManager aiCacheManager() {
        return new CaffeineCacheManager();
    }
}

// 请求拦截器
public class BigModelInterceptor implements ClientHttpRequestInterceptor {

    private final String apiKey;

    public BigModelInterceptor(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public ClientHttpResponse intercept(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution) throws IOException {

        // 添加认证头
        request.getHeaders().setBearerAuth(apiKey);
        request.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return execution.execute(request, body);
    }
}
```

#### 2.2 服务接口

```java
public interface BigModelService {

    /**
     * 智能客服对话
     */
    AIResponse customerService(String question, String context);

    /**
     * 生成违规描述
     */
    String generateViolationDescription(ViolationData violationData);

    /**
     * 生成数据分析报告
     */
    String generateDataReport(ReportData data, String reportType);

    /**
     * 生成通知文本
     */
    NotificationResponse generateNotificationText(String type, Map<String, Object> params);

    /**
     * 用户行为分析
     */
    BehaviorAnalysisResult analyzeUserBehavior(List<UserActivity> activities, String userId);
}
```

#### 2.3 服务实现

```java
@Service
@Slf4j
public class BigModelServiceImpl implements BigModelService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private CacheManager cacheManager;

    @Value("${bigmodel.base.url}")
    private String baseUrl;

    @Override
    @Cacheable(value = "customerService", key = "#question + #context")
    public AIResponse customerService(String question, String context) {

        BigModelRequest request = buildCustomerServiceRequest(question, context);

        try {
            ResponseEntity<BigModelResponse> response = restTemplate.postForEntity(
                baseUrl + "/chat/completions",
                request,
                BigModelResponse.class
            );

            return response.getBody();

        } catch (Exception e) {
            log.error("智能客服调用失败", e);
            throw new AIServiceException("智能客服暂时不可用", e);
        }
    }

    @Override
    public String generateViolationDescription(ViolationData violationData) {

        BigModelRequest request = buildViolationDescriptionRequest(violationData);

        try {
            ResponseEntity<BigModelResponse> response = restTemplate.postForEntity(
                baseUrl + "/chat/completions",
                request,
                BigModelResponse.class
            );

            return response.getBody().getChoices().get(0).getMessage().getContent();

        } catch (Exception e) {
            log.error("违规描述生成失败", e);
            throw new AIServiceException("违规描述生成失败", e);
        }
    }

    private BigModelRequest buildCustomerServiceRequest(String question, String context) {
        String systemPrompt = String.format("""
            你是一个专业的停车管理系统智能客服助手。请基于以下信息回答用户问题：

            停车系统功能包括：
            - 车辆入场出场管理
            - 违规停车处理
            - 月卡办理和续费
            - 车位查询和预约
            - 费用查询和缴纳
            - 业主信息管理

            回答要求：
            1. 专业、准确、友好
            2. 如果涉及具体操作，提供详细步骤
            3. 如果无法回答，建议联系人工客服
            4. 回复要简洁明了，控制在一两句话内

            当前上下文：%s
            """, context);

        return BigModelRequest.builder()
            .model("glm-3-turbo")
            .temperature(0.7)
            .maxTokens(1000)
            .messages(List.of(
                new Message("system", systemPrompt),
                new Message("user", question)
            ))
            .build();
    }

    private BigModelRequest buildViolationDescriptionRequest(ViolationData violationData) {
        String prompt = String.format("""
            请根据以下违规停车信息，生成一个标准、规范的违规描述：

            车牌号：%s
            违规类型：%s
            违规地点：%s
            违规时间：%s
            现场情况：%s
            照片信息：%s

            请生成包含以下要素的违规描述：
            1. 事实清晰、用词准确
            2. 符合交通法规术语
            3. 包含时间、地点、车牌等关键信息
            4. 描述简洁，字数控制在100-200字之间
            5. 语气客观、专业
            """,
            violationData.getLicensePlate(),
            violationData.getViolationType(),
            violationData.getLocation(),
            violationData.getViolationTime(),
            violationData.getDescription(),
            violationData.getPhotos() != null ? "已拍摄照片" : "无照片"
        );

        return BigModelRequest.builder()
            .model("glm-4")
            .temperature(0.5)
            .maxTokens(500)
            .messages(List.of(
                new Message("system", "你是一个专业的交通违规记录员，负责生成规范、准确的违规停车描述。"),
                new Message("user", prompt)
            ))
            .build();
    }
}
```

### 3. Node.js实现示例

#### 3.1 配置文件

```javascript
// config/bigmodel.js
module.exports = {
  apiKey: process.env.BIGMODEL_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  timeout: 60000,
  features: {
    customerService: process.env.AI_CUSTOMER_SERVICE_ENABLED === 'true',
    violationDescription: process.env.AI_VIOLATION_DESCRIPTION_ENABLED === 'true',
    dataReport: process.env.AI_DATA_REPORT_ENABLED === 'true',
    notificationText: process.env.AI_NOTIFICATION_TEXT_ENABLED === 'true',
    behaviorAnalysis: process.env.AI_BEHAVIOR_ANALYSIS_ENABLED === 'true'
  },
  cache: {
    ttl: parseInt(process.env.AI_CACHE_TTL) || 1800,
    maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE) || 1000
  },
  rateLimit: {
    perMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
    perHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR) || 1000
  }
}
```

#### 3.2 服务实现

```javascript
// services/bigModelService.js
const axios = require('axios');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const config = require('../config/bigmodel');

class BigModelService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      maxKeys: config.cache.maxSize
    });
  }

  async customerService(question, context = '') {
    const cacheKey = `customer:${question}:${context}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const systemPrompt = `你是一个专业的停车管理系统智能客服助手...`;

    const request = {
      model: 'glm-3-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    try {
      const response = await this.client.post('/chat/completions', request);
      const result = response.data;

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('智能客服调用失败:', error);
      throw new Error('智能客服暂时不可用');
    }
  }

  async generateViolationDescription(violationData) {
    const prompt = `请根据以下违规停车信息，生成一个标准、规范的违规描述...`;

    const request = {
      model: 'glm-4',
      messages: [
        { role: 'system', content: '你是一个专业的交通违规记录员...' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 500
    };

    try {
      const response = await this.client.post('/chat/completions', request);
      return response.data.choices[0].message.content;

    } catch (error) {
      console.error('违规描述生成失败:', error);
      throw new Error('违规描述生成失败');
    }
  }
}

module.exports = new BigModelService();
```

#### 3.3 控制器实现

```javascript
// controllers/aiController.js
const bigModelService = require('../services/bigModelService');
const { checkPermission } = require('../middleware/auth');

class AIController {
  // 智能客服
  async customerService(req, res) {
    try {
      const { question, context } = req.body;

      if (!question) {
        return res.status(400).json({ error: '问题不能为空' });
      }

      const result = await bigModelService.customerService(question, context);

      res.json({
        code: 200,
        message: 'success',
        data: {
          answer: result.choices[0].message.content,
          timestamp: Date.now()
        }
      });

    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message,
        data: null
      });
    }
  }

  // 生成违规描述
  async generateViolationDescription(req, res) {
    try {
      const violationData = req.body;

      const result = await bigModelService.generateViolationDescription(violationData);

      res.json({
        code: 200,
        message: 'success',
        data: {
          description: result,
          generateTime: Date.now()
        }
      });

    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message,
        data: null
      });
    }
  }
}

module.exports = new AIController();
```

## 🚀 接口文档

### 1. 智能客服接口

**接口地址**: `POST /api/ai/customer-service`

**请求参数**:
```json
{
  "question": "如何缴纳停车费？",
  "context": "用户当前在缴费页面"
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer": "您可以通过以下方式缴纳停车费...",
    "timestamp": 1635180000000
  }
}
```

### 2. 违规描述生成接口

**接口地址**: `POST /api/ai/violation-description`

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

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "description": "2025年11月17日14时30分，车牌号为京A12345的车辆...",
    "generateTime": 1635180000000
  }
}
```

### 3. 数据报告生成接口

**接口地址**: `POST /api/ai/data-report`

**请求参数**:
```json
{
  "reportType": "daily",
  "statistics": {
    "totalParkingSpaces": 500,
    "occupiedSpaces": 350,
    "utilizationRate": 70,
    "todayViolations": 5,
    "monthViolations": 150
  }
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "report": "# 停车管理日报分析报告...",
    "generateTime": 1635180000000
  }
}
```

## 🔄 限流和缓存策略

### 限流实现

```java
// Spring Boot限流示例
@RestController
@RequestMapping("/api/ai")
public class AIController {

    @RateLimiter(name = "ai-api", fallbackMethod = "rateLimitFallback")
    @PostMapping("/customer-service")
    public ResponseEntity<?> customerService(@RequestBody CustomerServiceRequest request) {
        // 业务逻辑
    }

    public ResponseEntity<?> rateLimitFallback(Exception e) {
        return ResponseEntity.status(429)
            .body(Map.of(
                "code", 429,
                "message", "请求过于频繁，请稍后再试",
                "data", null
            ));
    }
}
```

### 缓存策略

- **智能客服**: 缓存30分钟，相同问题返回缓存结果
- **违规描述生成**: 缓存2小时，相同违规数据返回缓存结果
- **数据报告**: 缓存24小时，相同统计数据返回缓存结果

## 📊 监控和日志

### 关键指标监控

1. **API调用量**: 每日/每小时调用量统计
2. **成功率**: API调用成功率统计
3. **响应时间**: 平均响应时间监控
4. **错误率**: 错误类型和频率统计
5. **缓存命中率**: 缓存效果统计

### 日志记录

```java
@Aspect
@Component
@Slf4j
public class AILogAspect {

    @Around("execution(* com.example.service.BigModelService.*(..))")
    public Object logAICall(ProceedingJoinPoint joinPoint) throws Throwable {

        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("AI调用开始 - 方法: {}, 参数: {}", methodName, args);

        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            log.info("AI调用成功 - 方法: {}, 耗时: {}ms", methodName, duration);
            return result;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;

            log.error("AI调用失败 - 方法: {}, 耗时: {}ms, 错误: {}",
                methodName, duration, e.getMessage(), e);
            throw e;
        }
    }
}
```

## 🔧 部署建议

### 1. 环境隔离
- 开发环境：使用测试API密钥，启用详细日志
- 测试环境：模拟真实场景，完整功能测试
- 生产环境：使用生产API密钥，优化性能

### 2. 容器化部署

```dockerfile
# Dockerfile示例
FROM openjdk:17-jdk-slim

COPY target/ai-service.jar app.jar
COPY config/ config/

EXPOSE 8080

ENV BIGMODEL_API_KEY=${BIGMODEL_API_KEY}
ENV BIGMODEL_BASE_URL=${BIGMODEL_BASE_URL}

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### 3. 配置管理

```yaml
# application.yml
bigmodel:
  api:
    key: ${BIGMODEL_API_KEY}
    base-url: ${BIGMODEL_BASE_URL:https://open.bigmodel.cn/api/paas/v4}
    timeout: ${BIGMODEL_TIMEOUT:60000}
  features:
    customer-service: ${AI_CUSTOMER_SERVICE_ENABLED:true}
    violation-description: ${AI_VIOLATION_DESCRIPTION_ENABLED:true}
  cache:
    ttl: ${AI_CACHE_TTL:1800}
    max-size: ${AI_CACHE_MAX_SIZE:1000}
```

## 🚨 错误处理和重试

### 重试机制

```java
@Retryable(value = {AIServiceException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
public String generateViolationDescription(ViolationData violationData) {
    // 实现逻辑
}
```

### 错误码映射

| BigModel错误码 | 后端错误码 | 处理方式 |
|----------------|------------|----------|
| 401 | 401 | API密钥无效 |
| 429 | 429 | 请求频率过高 |
| 500 | 500 | 服务器内部错误 |
| timeout | 504 | 请求超时 |

## 📈 性能优化

1. **连接池配置**: 合理配置HTTP连接池
2. **异步处理**: 非实时需求使用异步处理
3. **批量请求**: 支持批量处理减少API调用
4. **智能缓存**: 基于业务场景优化缓存策略
5. **负载均衡**: 多实例部署，负载均衡

---

这个实现方案提供了完整的后端BigModel AI接口架构，确保了安全性、性能和可维护性。您可以根据实际的技术栈选择相应的实现方案。