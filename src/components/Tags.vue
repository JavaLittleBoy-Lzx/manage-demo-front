<template>
  <div class="tags-container">
    <div class="tags-wrapper">
      <el-tag
        v-for="(tag, index) in tagsList"
        :key="tag.path"
        :closable="tag.path !== '/admin/emptyPer'"
        :type="$route.path === tag.path ? 'primary' : 'info'"
        @close="closeTag(tag, index)"
        @click="goToPage(tag)"
        class="tag-item"
      >
        {{ tag.title }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Tags',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const tagsList = computed(() => store.state.tagsList || [])
    
    const closeTag = (tag, index) => {
      store.commit('delTagsItem', { index })
      
      // 如果关闭的是当前页，跳转到上一个标签
      if (tag.path === route.path && tagsList.value.length > 0) {
        const nextTag = tagsList.value[index - 1] || tagsList.value[0]
        if (nextTag) {
          router.push(nextTag.path)
        }
      }
    }
    
    const goToPage = (tag) => {
      if (tag.path !== route.path) {
        router.push(tag.path)
      }
    }
    
    return {
      tagsList,
      closeTag,
      goToPage
    }
  }
}
</script>

<style scoped>
.tags-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 1px solid #e1e8ed;
  padding: 8px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: relative;
}

.tags-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #1890ff, #722ed1, #13c2c2);
}

.tags-wrapper {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 20px;
  align-items: center;
}

.tag-item {
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  border-radius: 20px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #666666;
  padding: 8px 16px;
  position: relative;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
  min-height: 32px;
  display: flex;
  align-items: center;
}

.tag-item:hover {
  background: linear-gradient(135deg, #e6f7ff, #bae7ff);
  color: #1890ff;
  border-color: #91d5ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.tag-item.el-tag--primary {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.tag-item.el-tag--primary:hover {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.tag-item.el-tag--info {
  background: #ffffff;
  color: #666666;
}

.tag-item .el-tag__close {
  color: rgba(255, 255, 255, 0.8);
  margin-left: 8px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.tag-item.el-tag--info .el-tag__close {
  color: #999;
  background: rgba(0, 0, 0, 0.05);
}

.tag-item .el-tag__close:hover {
  color: #ffffff;
  background: #ff4d4f;
  transform: scale(1.1);
}

.tag-item.el-tag--info .el-tag__close:hover {
  color: #ffffff;
  background: #ff4d4f;
}

.tags-wrapper::-webkit-scrollbar {
  height: 4px;
}

.tags-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #1890ff, #722ed1);
  border-radius: 2px;
}

.tags-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

/* 添加一些动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tag-item {
  animation: slideIn 0.3s ease-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tags-wrapper {
    padding: 0 12px;
    gap: 2px;
  }
  
  .tag-item {
    padding: 6px 12px;
    font-size: 12px;
    min-height: 28px;
  }
}
</style> 