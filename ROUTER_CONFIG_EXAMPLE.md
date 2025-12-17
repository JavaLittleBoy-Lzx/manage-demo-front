# 违规配置页面路由配置示例

## 📝 路由配置

将以下代码添加到 `src/router/index.js` 文件中：

### 方式1：作为独立路由模块

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ... 其他路由配置 ...
  
  // 违规配置管理路由
  {
    path: '/admin/violation-config',
    name: 'ViolationConfig',
    meta: { 
      title: '违规配置管理',
      requiresAuth: true,  // 需要登录
      roles: ['admin']     // 需要管理员权限
    },
    redirect: '/admin/violation-config/location',  // 默认重定向到违规位置配置
    children: [
      {
        path: 'location',
        name: 'ViolationLocationConfig',
        component: () => import('@/views/admin/ViolationLocationConfig.vue'),
        meta: { 
          title: '违规位置配置',
          icon: 'Location'
        }
      },
      {
        path: 'type',
        name: 'ViolationTypeConfig',
        component: () => import('@/views/admin/ViolationTypeConfig.vue'),
        meta: { 
          title: '违规类型配置',
          icon: 'Warning'
        }
      },
      {
        path: 'description',
        name: 'ViolationDescriptionConfig',
        component: () => import('@/views/admin/ViolationDescriptionConfig.vue'),
        meta: { 
          title: '违规描述配置',
          icon: 'Document'
        }
      },
      {
        path: 'reason',
        name: 'BlacklistReasonConfig',
        component: () => import('@/views/admin/BlacklistReasonConfig.vue'),
        meta: { 
          title: '拉黑原因配置',
          icon: 'CircleClose'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
```

### 方式2：平铺式路由

```javascript
// src/router/index.js
const routes = [
  // ... 其他路由配置 ...
  
  // 违规位置配置
  {
    path: '/admin/violation-location-config',
    name: 'ViolationLocationConfig',
    component: () => import('@/views/admin/ViolationLocationConfig.vue'),
    meta: { 
      title: '违规位置配置',
      requiresAuth: true,
      icon: 'Location'
    }
  },
  
  // 违规类型配置
  {
    path: '/admin/violation-type-config',
    name: 'ViolationTypeConfig',
    component: () => import('@/views/admin/ViolationTypeConfig.vue'),
    meta: { 
      title: '违规类型配置',
      requiresAuth: true,
      icon: 'Warning'
    }
  },
  
  // 违规描述配置
  {
    path: '/admin/violation-description-config',
    name: 'ViolationDescriptionConfig',
    component: () => import('@/views/admin/ViolationDescriptionConfig.vue'),
    meta: { 
      title: '违规描述配置',
      requiresAuth: true,
      icon: 'Document'
    }
  },
  
  // 拉黑原因配置
  {
    path: '/admin/blacklist-reason-config',
    name: 'BlacklistReasonConfig',
    component: () => import('@/views/admin/BlacklistReasonConfig.vue'),
    meta: { 
      title: '拉黑原因配置',
      requiresAuth: true,
      icon: 'CircleClose'
    }
  }
]
```

---

## 🎯 侧边栏菜单配置

### Element Plus Menu 配置示例

```vue
<!-- src/components/Sidebar.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="isCollapse"
    @select="handleSelect"
  >
    <!-- ... 其他菜单项 ... -->
    
    <!-- 违规配置管理 -->
    <el-sub-menu index="violation-config">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>违规配置管理</span>
      </template>
      
      <el-menu-item index="/admin/violation-config/location">
        <el-icon><Location /></el-icon>
        <span>违规位置配置</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/violation-config/type">
        <el-icon><Warning /></el-icon>
        <span>违规类型配置</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/violation-config/description">
        <el-icon><Document /></el-icon>
        <span>违规描述配置</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/violation-config/reason">
        <el-icon><CircleClose /></el-icon>
        <span>拉黑原因配置</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Setting, Location, Warning, Document, CircleClose } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const handleSelect = (index) => {
  router.push(index)
}
</script>
```

### JSON 格式菜单配置

```javascript
// src/config/menu.js
export const menuConfig = [
  // ... 其他菜单 ...
  
  {
    id: 'violation-config',
    title: '违规配置管理',
    icon: 'Setting',
    children: [
      {
        id: 'violation-location',
        title: '违规位置配置',
        icon: 'Location',
        path: '/admin/violation-config/location',
        component: 'ViolationLocationConfig'
      },
      {
        id: 'violation-type',
        title: '违规类型配置',
        icon: 'Warning',
        path: '/admin/violation-config/type',
        component: 'ViolationTypeConfig'
      },
      {
        id: 'violation-description',
        title: '违规描述配置',
        icon: 'Document',
        path: '/admin/violation-config/description',
        component: 'ViolationDescriptionConfig'
      },
      {
        id: 'blacklist-reason',
        title: '拉黑原因配置',
        icon: 'CircleClose',
        path: '/admin/violation-config/reason',
        component: 'BlacklistReasonConfig'
      }
    ]
  }
]
```

---

## 🔐 权限控制示例

### 路由守卫配置

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      next('/login')
      return
    }
  }
  
  // 检查角色权限
  if (to.meta.roles) {
    const userRole = localStorage.getItem('userRole')
    if (!to.meta.roles.includes(userRole)) {
      ElMessage.error('您没有权限访问此页面')
      next(from.path)
      return
    }
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to) => {
  // 设置页面标题
  document.title = to.meta.title || '违规配置管理系统'
})

export default router
```

---

## 📱 面包屑导航配置

```vue
<!-- src/components/Breadcrumb.vue -->
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-breadcrumb-item>
    
    <el-breadcrumb-item 
      v-for="item in breadcrumbs" 
      :key="item.path"
      :to="item.path ? { path: item.path } : null"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})
</script>
```

**面包屑显示效果：**
- 违规位置配置：`首页 > 违规配置管理 > 违规位置配置`
- 违规类型配置：`首页 > 违规配置管理 > 违规类型配置`
- 违规描述配置：`首页 > 违规配置管理 > 违规描述配置`
- 拉黑原因配置：`首页 > 违规配置管理 > 拉黑原因配置`

---

## 🎨 完整的侧边栏菜单示例

```vue
<!-- src/layout/Sidebar.vue -->
<template>
  <div class="sidebar-container">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapse"
      :unique-opened="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      @select="handleSelect"
    >
      <!-- 首页 -->
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      
      <!-- 违规管理 -->
      <el-sub-menu index="violation">
        <template #title>
          <el-icon><WarningFilled /></el-icon>
          <span>违规管理</span>
        </template>
        <el-menu-item index="/admin/violation-record">
          <el-icon><List /></el-icon>
          <span>违规记录查询</span>
        </el-menu-item>
        <el-menu-item index="/admin/violation-register">
          <el-icon><EditPen /></el-icon>
          <span>违规登记</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 🆕 违规配置管理 -->
      <el-sub-menu index="violation-config">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>违规配置管理</span>
        </template>
        
        <el-menu-item index="/admin/violation-config/location">
          <el-icon><Location /></el-icon>
          <span>违规位置配置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/violation-config/type">
          <el-icon><Warning /></el-icon>
          <span>违规类型配置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/violation-config/description">
          <el-icon><Document /></el-icon>
          <span>违规描述配置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/violation-config/reason">
          <el-icon><CircleClose /></el-icon>
          <span>拉黑原因配置</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 车场管理 -->
      <el-sub-menu index="parking">
        <template #title>
          <el-icon><OfficeBuilding /></el-icon>
          <span>车场管理</span>
        </template>
        <el-menu-item index="/admin/parking-list">
          <el-icon><List /></el-icon>
          <span>车场列表</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 系统设置 -->
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Tools /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/admin/user-management">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/role-management">
          <el-icon><UserFilled /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  HomeFilled, 
  WarningFilled, 
  Setting, 
  Location, 
  Warning, 
  Document, 
  CircleClose,
  List,
  EditPen,
  OfficeBuilding,
  Tools,
  User,
  UserFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const handleSelect = (index) => {
  router.push(index)
}

// 监听路由变化，自动高亮菜单
watch(
  () => route.path,
  (newPath) => {
    console.log('当前路径:', newPath)
  }
)
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;
  
  .sidebar-menu {
    height: 100%;
    border-right: none;
    
    :deep(.el-sub-menu__title) {
      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
    
    :deep(.el-menu-item) {
      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      &.is-active {
        background-color: #409EFF !important;
        color: #fff !important;
      }
    }
  }
}
</style>
```

---

## 🚀 快速测试

### 1. 添加路由配置后测试

```bash
# 启动开发服务器
npm run dev
```

### 2. 访问各个配置页面

在浏览器中访问：
- 违规位置配置：http://localhost:8080/admin/violation-config/location
- 违规类型配置：http://localhost:8080/admin/violation-config/type
- 违规描述配置：http://localhost:8080/admin/violation-config/description
- 拉黑原因配置：http://localhost:8080/admin/violation-config/reason

### 3. 验证功能

- ✅ 页面能正常访问
- ✅ 侧边栏菜单高亮正确
- ✅ 面包屑导航显示正确
- ✅ 样式正常显示
- ✅ API接口能正常调用

---

## 📖 注意事项

### 1. 路由懒加载

使用动态导入实现路由懒加载，提高首屏加载速度：

```javascript
component: () => import('@/views/admin/ViolationLocationConfig.vue')
```

### 2. 路由元信息

合理使用 `meta` 字段存储路由元信息：
- `title` - 页面标题
- `icon` - 菜单图标
- `requiresAuth` - 是否需要登录
- `roles` - 所需角色权限
- `keepAlive` - 是否缓存页面

### 3. 动态路由

如果需要动态生成路由（基于后端权限），可以使用 `router.addRoute()` 方法：

```javascript
// 动态添加路由
const addRoutes = (routes) => {
  routes.forEach(route => {
    router.addRoute(route)
  })
}
```

### 4. 路由跳转

在组件中跳转路由的方式：

```javascript
// 编程式导航
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到违规位置配置
router.push('/admin/violation-config/location')

// 带参数跳转
router.push({
  name: 'ViolationLocationConfig',
  query: { parkName: '东北林业大学' }
})
```

---

## ✅ 配置完成检查清单

完成以下步骤后，违规配置管理功能即可正常使用：

- [ ] 已添加路由配置到 `src/router/index.js`
- [ ] 已在侧边栏菜单中添加相应菜单项
- [ ] 已配置权限控制（如需要）
- [ ] 已添加面包屑导航（如需要）
- [ ] 已测试所有路由能正常访问
- [ ] 已测试菜单高亮显示正确
- [ ] 已验证样式显示正常
- [ ] 已测试API接口调用正常

**完成以上步骤后，违规配置管理系统即可投入使用！** 🎉

