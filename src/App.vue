<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { initSessionTimeout, resetSession } from "./utils/sessionTimeout";
import request from "./utils/request";

export default {
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  setup() {
    // 切换为中文
    let locale = zhCn;
    const router = useRouter();
    let cleanupSessionTimeout = null;

    // 处理会话超时
    const handleSessionTimeout = async () => {
      try {
        // 先尝试调用后端接口记录退出日志
        const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
        if (userId) {
          try {
            await request.post('/parking/user/logout', {}, {
              headers: {
                'userId': userId
              }
            });
            console.log('✅ 会话超时退出日志记录成功');
          } catch (error) {
            console.warn('⚠️ 记录会话超时退出日志失败:', error);
          }
        }
      } catch (error) {
        console.warn('⚠️ 会话超时处理异常:', error);
      } finally {
        // 清除本地存储
        localStorage.clear();
        
        // 显示提示信息
        ElMessageBox.alert(
          '由于长时间未操作，为了您的账户安全，系统已自动退出登录，请重新登录。',
          '会话超时',
          {
            confirmButtonText: '确定',
            type: 'warning',
            callback: () => {
              // 跳转到登录页
              router.push('/login');
            }
          }
        );
      }
    };

    // 初始化会话超时管理
    const initSession = () => {
      // 检查是否需要启用会话超时
      const roleName = localStorage.getItem('ms_role_name') || '';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
      
      // 如果未登录，不启用
      if (!token || !userId) {
        console.log('ℹ️ [App] 用户未登录，不启用会话超时');
        return;
      }

      // 使用 sessionTimeout.js 中配置的默认超时时间（当前为10分钟）
      // 生产环境建议改为 30 * 60 * 1000 (30分钟)
      const timeout = 10 * 60 * 1000; // 10分钟
      
      console.log(`🚀 [App] 初始化会话超时管理 - 角色: "${roleName}", 超时时间: ${timeout / 1000} 秒`);
      
      cleanupSessionTimeout = initSessionTimeout(timeout, handleSessionTimeout);
      
      // 监听路由变化，在登录成功后重置会话
      router.afterEach((to) => {
        if (to.path === '/login') {
          // 在登录页，清除会话记录
          if (cleanupSessionTimeout) {
            cleanupSessionTimeout();
            cleanupSessionTimeout = null;
          }
        } else {
          // 在其他页面，检查是否已登录，如果已登录则重置会话
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
          if (token && userId) {
            const roleName = localStorage.getItem('ms_role_name') || '';
            const timeout = 10 * 60 * 1000; // 10分钟
            
            // 重置会话（更新最后活动时间）
            resetSession();
            console.log(`🔄 [App] 路由变化，重置会话时间 - 角色: "${roleName}"`);
            
            // 重新初始化会话管理（如果还没有初始化）
            if (!cleanupSessionTimeout) {
              console.log(`🔄 [App] 重新初始化会话管理 - 角色: "${roleName}"`);
              cleanupSessionTimeout = initSessionTimeout(timeout, handleSessionTimeout);
            }
          }
        }
      });
    };

    onMounted(() => {
      initSession();
      
      // 如果页面加载时已经登录，立即启动会话管理
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
      const roleName = localStorage.getItem('ms_role_name') || '';
      if (token && userId && router.currentRoute.value.path !== '/login') {
        console.log(`✅ [App] 页面加载时检测到已登录，启动会话管理 - 角色: "${roleName}"`);
        const timeout = 10 * 60 * 1000; // 10分钟
        if (!cleanupSessionTimeout) {
          cleanupSessionTimeout = initSessionTimeout(timeout, handleSessionTimeout);
        }
        resetSession();
      }
    });

    onUnmounted(() => {
      // 清理会话超时监听
      if (cleanupSessionTimeout) {
        cleanupSessionTimeout();
        cleanupSessionTimeout = null;
      }
    });

    return {
      locale,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "./assets/css/main.css";
@import "./assets/css/color-dark.css";
</style>
