<template>
  <div class="breadcrumb-wrapper">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="index"
        :to="index === breadcrumbList.length - 1 ? null : item.path"
      >
        <span>{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'CustomBreadcrumb',
  setup() {
    const route = useRoute()
    
    const breadcrumbList = computed(() => {
      const matched = route.matched.filter(item => item.meta && item.meta.title)
      const breadcrumbs = []
      
      // 添加首页
      if (route.path !== '/admin/emptyPer') {
        breadcrumbs.push({
          title: '首页',
          path: '/admin/emptyPer'
        })
      }
      
      // 添加当前路径层级
      matched.forEach(item => {
        if (item.meta && item.meta.title) {
          breadcrumbs.push({
            title: item.meta.title,
            path: item.path
          })
        }
      })
      
      return breadcrumbs
    })
    
    return {
      breadcrumbList
    }
  }
}
</script>

<style scoped>
.breadcrumb-wrapper {
  padding: 12px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e1e8ed;
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.breadcrumb-wrapper :deep(.el-breadcrumb) {
  font-size: 14px;
  font-weight: 500;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__separator) {
  color: #d9d9d9;
  font-weight: bold;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  color: #666666;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 12px;
  position: relative;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1890ff;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05));
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item .el-breadcrumb__inner:hover) {
  color: #40a9ff;
  cursor: pointer;
  background: rgba(24, 144, 255, 0.08);
  transform: translateY(-1px);
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner:hover) {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.08));
}
</style> 