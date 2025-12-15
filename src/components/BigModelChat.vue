<template>
  <div class="bigmodel-chat-container">
    <!-- 聊天窗口 -->
    <div v-if="isVisible" class="chat-window">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>智能客服助手</span>
        </div>
        <div class="chat-actions">
          <el-button size="small" text @click="clearHistory">
            <el-icon><Delete /></el-icon>
          </el-button>
          <el-button size="small" text @click="toggleChat">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-body" ref="chatBodyRef">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="avatar ai-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="message ai-message">
            {{ welcomeMessage }}
          </div>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="{ 'user-message': message.role === 'user' }"
        >
          <div class="avatar" :class="{ 'user-avatar': message.role === 'user', 'ai-avatar': message.role === 'assistant' }">
            <el-icon v-if="message.role === 'user'"><UserFilled /></el-icon>
            <el-icon v-else><User /></el-icon>
          </div>
          <div class="message" :class="{ 'user-message-content': message.role === 'user', 'ai-message-content': message.role === 'assistant' }">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="message-item">
          <div class="avatar ai-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="message ai-message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="typing-text">AI正在思考中...</div>
          </div>
        </div>
      </div>

      <!-- 快捷问题 -->
      <div class="quick-questions" v-if="messages.length === 0">
        <div class="quick-title">常见问题：</div>
        <div class="quick-buttons">
          <el-button
            v-for="question in quickQuestions"
            :key="question"
            size="small"
            @click="sendQuickQuestion(question)"
          >
            {{ question }}
          </el-button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-footer">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题..."
            @keydown.enter.ctrl="sendMessage"
            :disabled="isLoading"
            resize="none"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              :loading="isLoading"
              @click="sendMessage"
              :disabled="!inputMessage.trim()"
            >
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动按钮 -->
    <div v-if="!isVisible" class="chat-float-button" @click="toggleChat">
      <el-icon><ChatDotRound /></el-icon>
      <span class="float-text">智能客服</span>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { ChatDotRound, Close, Delete, User, UserFilled } from '@element-plus/icons-vue'
import { bigModelApi } from '@/api/bigmodel'
import { isFeatureEnabled } from '@/config/bigmodel'

export default {
  name: 'BigModelChat',
  components: {
    ChatDotRound,
    Close,
    Delete,
    User,
    UserFilled
  },
  setup() {
    // 响应式数据
    const isVisible = ref(false)
    const isLoading = ref(false)
    const inputMessage = ref('')
    const messages = ref([])
    const chatBodyRef = ref(null)

    // 配置数据
    const welcomeMessage = ref('您好！我是停车管理系统的智能助手。我可以帮您解答关于停车缴费、违规处理、车位预约等问题。请问有什么可以帮助您的吗？')

    const quickQuestions = ref([
      '如何缴纳停车费？',
      '车辆被违规记录了怎么办？',
      '如何申请月卡？',
      '如何预约车位？',
      '忘记密码怎么办？'
    ])

    // 消息历史记录
    const chatHistory = reactive({
      maxMessages: 50,
      context: []
    })

    // 检查功能是否启用
    const checkFeatureEnabled = () => {
      if (!isFeatureEnabled('customerService')) {
        ElMessage.error('智能客服功能未启用')
        return false
      }
      return true
    }

    // 切换聊天窗口
    const toggleChat = () => {
      if (!checkFeatureEnabled()) return
      isVisible.value = !isVisible.value
      if (isVisible.value) {
        scrollToBottom()
      }
    }

    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return

      const userMessage = {
        role: 'user',
        content: inputMessage.value.trim(),
        timestamp: Date.now()
      }

      // 添加用户消息
      messages.value.push(userMessage)

      // 清空输入框
      inputMessage.value = ''

      // 滚动到底部
      await nextTick()
      scrollToBottom()

      // 设置加载状态
      isLoading.value = true

      try {
        // 构建对话上下文
        const contextMessages = buildContextMessages()

        // 调用BigModel API
        const response = await bigModelApi.customerService(userMessage.content, getContextInfo())

        if (response && response.choices && response.choices.length > 0) {
          const aiMessage = {
            role: 'assistant',
            content: response.choices[0].message.content,
            timestamp: Date.now()
          }

          messages.value.push(aiMessage)

          // 更新上下文
          updateContext(userMessage, aiMessage)
        } else {
          throw new Error('API响应格式错误')
        }
      } catch (error) {
        console.error('发送消息失败:', error)

        const errorMessage = {
          role: 'assistant',
          content: '抱歉，我现在无法回答您的问题。请稍后再试或联系人工客服。',
          timestamp: Date.now()
        }
        messages.value.push(errorMessage)

        ElMessage.error('智能服务暂时不可用，请稍后再试')
      } finally {
        isLoading.value = false
        await nextTick()
        scrollToBottom()
      }
    }

    // 发送快捷问题
    const sendQuickQuestion = (question) => {
      inputMessage.value = question
      sendMessage()
    }

    // 构建上下文消息
    const buildContextMessages = () => {
      // 获取最近的10条消息作为上下文
      const recentMessages = messages.value.slice(-10)
      return recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    }

    // 更新上下文
    const updateContext = (userMessage, aiMessage) => {
      chatHistory.context.push(
        { role: 'user', content: userMessage.content },
        { role: 'assistant', content: aiMessage.content }
      )

      // 限制上下文长度
      if (chatHistory.context.length > chatHistory.maxMessages) {
        chatHistory.context = chatHistory.context.slice(-chatHistory.maxMessages)
      }
    }

    // 获取上下文信息
    const getContextInfo = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = localStorage.getItem('ms_role') || 'user'

      return `当前用户信息：
- 用户名：${user.username || '未知'}
- 角色：${role}
- 当前时间：${new Date().toLocaleString()}
- 系统功能：停车缴费、违规处理、车位预约、月卡办理等`
    }

    // 清除历史记录
    const clearHistory = () => {
      messages.value = []
      chatHistory.context = []
      ElMessage.success('聊天记录已清除')
    }

    // 滚动到底部
    const scrollToBottom = () => {
      if (chatBodyRef.value) {
        chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
      }
    }

    // 格式化消息
    const formatMessage = (content) => {
      // 简单的文本格式化
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 键盘事件处理
    const handleKeydown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
      }
    }

    // 组件挂载
    onMounted(() => {
      // 检查功能是否启用
      if (!checkFeatureEnabled()) {
        return
      }

      // 可以添加初始化逻辑
      console.log('BigModel Chat component mounted')
    })

    return {
      isVisible,
      isLoading,
      inputMessage,
      messages,
      chatBodyRef,
      welcomeMessage,
      quickQuestions,
      toggleChat,
      sendMessage,
      sendQuickQuestion,
      clearHistory,
      formatMessage,
      formatTime,
      handleKeydown
    }
  }
}
</script>

<style scoped>
.bigmodel-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

/* 浮动按钮 */
.chat-float-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  font-weight: 500;
}

.chat-float-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.float-text {
  font-size: 14px;
}

/* 聊天窗口 */
.chat-window {
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天头部 */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.chat-actions .el-button {
  color: white;
}

.chat-actions .el-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 聊天内容区域 */
.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.welcome-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-avatar {
  background-color: #e2e8f0;
  color: #4a5568;
}

.message {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-message-content {
  align-items: flex-start;
}

.user-message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  word-wrap: break-word;
}

.ai-message .message-text {
  background-color: white;
  color: #2d3748;
  border: 1px solid #e2e8f0;
}

.user-message-content .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-time {
  font-size: 12px;
  color: #718096;
  padding: 0 8px;
}

/* 输入指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  margin-bottom: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #cbd5e0;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.typing-text {
  font-size: 12px;
  color: #718096;
  padding-left: 8px;
}

/* 快捷问题 */
.quick-questions {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
}

.quick-title {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 10px;
  font-weight: 500;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-buttons .el-button {
  border-radius: 16px;
  font-size: 13px;
  padding: 6px 12px;
}

/* 输入区域 */
.chat-footer {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-window {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
  }

  .bigmodel-chat-container {
    bottom: 10px;
    right: 10px;
  }
}

/* 滚动条样式 */
.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>