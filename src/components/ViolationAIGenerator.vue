<template>
  <div class="violation-ai-generator">
    <!-- AI生成按钮 -->
    <el-button
      type="primary"
      :icon="MagicStick"
      :loading="isGenerating"
      @click="generateDescription"
      size="default"
    >
      {{ isGenerating ? 'AI生成中...' : 'AI智能生成描述' }}
    </el-button>

    <!-- 生成结果对话框 -->
    <el-dialog
      v-model="showDialog"
      title="AI生成的违规描述"
      width="60%"
      :close-on-click-modal="false"
    >
      <div v-if="generatedContent" class="generated-content">
        <!-- 原始数据展示 -->
        <div class="original-data" v-if="violationData">
          <h4>基础信息：</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="车牌号">{{ violationData.licensePlate }}</el-descriptions-item>
            <el-descriptions-item label="违规类型">{{ violationData.violationType }}</el-descriptions-item>
            <el-descriptions-item label="违规地点">{{ violationData.location }}</el-descriptions-item>
            <el-descriptions-item label="违规时间">{{ violationData.violationTime }}</el-descriptions-item>
            <el-descriptions-item label="现场情况" :span="2">{{ violationData.description || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- AI生成的内容 -->
        <div class="ai-content">
          <h4>
            <el-icon><MagicStick /></el-icon>
            AI生成的描述：
          </h4>
          <div class="content-box">
            <div v-html="formattedContent" class="generated-text"></div>
            <div class="content-meta">
              <span class="word-count">字数：{{ generatedContent.length }}</span>
              <span class="generate-time">生成时间：{{ formatTime(generatedTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button @click="regenerate" :loading="isRegenerating">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
          <el-button type="success" @click="acceptContent">
            <el-icon><Check /></el-icon>
            采用此描述
          </el-button>
          <el-button type="warning" @click="editContent">
            <el-icon><Edit /></el-icon>
            编辑修改
          </el-button>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-if="editMode" class="edit-mode">
        <h4>编辑违规描述：</h4>
        <el-input
          v-model="editableContent"
          type="textarea"
          :rows="8"
          placeholder="请编辑违规描述..."
          show-word-limit
          maxlength="500"
        />
        <div class="edit-actions">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存修改</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 使用提示 -->
    <el-tooltip
      content="基于违规信息自动生成规范的违规描述，支持多次生成和编辑修改"
      placement="top"
      :show-after="500"
    >
      <el-icon class="help-icon"><QuestionFilled /></el-icon>
    </el-tooltip>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick, Refresh, Check, Edit, QuestionFilled } from '@element-plus/icons-vue'
import { bigModelApi } from '@/api/bigmodel'
import { isFeatureEnabled } from '@/config/bigmodel'

export default {
  name: 'ViolationAIGenerator',
  components: {
    MagicStick,
    Refresh,
    Check,
    Edit,
    QuestionFilled
  },
  props: {
    // 违规数据
    violationData: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && (value.licensePlate || value.violationType || value.location)
      }
    }
  },
  emits: ['content-generated', 'content-accepted'],
  setup(props, { emit }) {
    // 响应式数据
    const isGenerating = ref(false)
    const isRegenerating = ref(false)
    const showDialog = ref(false)
    const editMode = ref(false)
    const generatedContent = ref('')
    const editableContent = ref('')
    const generatedTime = ref(null)

    // 检查功能是否启用
    const checkFeatureEnabled = () => {
      if (!isFeatureEnabled('violationDescription')) {
        ElMessage.error('违规描述智能生成功能未启用')
        return false
      }
      return true
    }

    // 格式化内容
    const formattedContent = computed(() => {
      return generatedContent.value
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\d+\.)/g, '<br><strong>$1</strong>')
        .replace(/([：:])/g, '$1<br>')
    })

    // 生成描述
    const generateDescription = async () => {
      if (!checkFeatureEnabled()) return

      if (!props.violationData) {
        ElMessage.error('请先填写违规基础信息')
        return
      }

      // 构建生成数据
      const generationData = {
        ...props.violationData,
        violationTime: props.violationData.violationTime || new Date().toLocaleString(),
        photos: props.violationData.photos || [],
        reporter: props.violationData.reporter || '系统记录',
        fine: props.violationData.fine || 0
      }

      isGenerating.value = true

      try {
        const response = await bigModelApi.generateViolationDescription(generationData)

        if (response && response.choices && response.choices.length > 0) {
          generatedContent.value = response.choices[0].message.content
          generatedTime.value = Date.now()
          showDialog.value = true
          editMode.value = false

          // 通知父组件已生成内容
          emit('content-generated', {
            content: generatedContent.value,
            data: generationData
          })

          ElMessage.success('违规描述生成成功')
        } else {
          throw new Error('生成失败，返回数据格式错误')
        }
      } catch (error) {
        console.error('生成违规描述失败:', error)
        ElMessage.error('生成失败：' + (error.message || '服务器错误'))
      } finally {
        isGenerating.value = false
      }
    }

    // 重新生成
    const regenerate = async () => {
      isRegenerating.value = true
      try {
        await generateDescription()
      } finally {
        isRegenerating.value = false
      }
    }

    // 接受内容
    const acceptContent = () => {
      if (!generatedContent.value.trim()) {
        ElMessage.warning('生成的描述为空，无法采用')
        return
      }

      // 确认采用
      ElMessageBox.confirm(
        '确定要采用这个AI生成的违规描述吗？',
        '确认采用',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        emit('content-accepted', {
          content: generatedContent.value,
          originalData: props.violationData,
          generateTime: generatedTime.value
        })
        showDialog.value = false
        ElMessage.success('已采用AI生成的违规描述')
      }).catch(() => {
        // 用户取消
      })
    }

    // 编辑内容
    const editContent = () => {
      editableContent.value = generatedContent.value
      editMode.value = true
    }

    // 保存编辑
    const saveEdit = () => {
      if (!editableContent.value.trim()) {
        ElMessage.warning('编辑内容不能为空')
        return
      }

      generatedContent.value = editableContent.value
      editMode.value = false
      ElMessage.success('修改已保存')
    }

    // 取消编辑
    const cancelEdit = () => {
      editMode.value = false
      editableContent.value = ''
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    return {
      isGenerating,
      isRegenerating,
      showDialog,
      editMode,
      generatedContent,
      editableContent,
      generatedTime,
      formattedContent,
      generateDescription,
      regenerate,
      acceptContent,
      editContent,
      saveEdit,
      cancelEdit,
      formatTime
    }
  }
}
</script>

<style scoped>
.violation-ai-generator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
}

.generated-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.original-data {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.original-data h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-weight: 600;
}

.ai-content {
  background-color: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.ai-content h4 {
  margin: 0 0 15px 0;
  color: #1e40af;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-box {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.generated-text {
  line-height: 1.6;
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
}

.content-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.edit-mode h4 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 5vh auto;
  }

  .actions {
    flex-direction: column;
  }

  .content-meta {
    flex-direction: column;
    gap: 4px;
  }
}

/* 动画效果 */
.generated-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>