<template>
  <div class="error-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
    
    <!-- 主要内容 -->
    <div class="error-content">
      <div class="error-illustration">
        <!-- 404插图 -->
        <div class="error-number">
          <span class="digit">4</span>
          <span class="digit special">0</span>
          <span class="digit">4</span>
        </div>
        <div class="error-icon">
          <el-icon size="80"><DocumentDelete /></el-icon>
        </div>
      </div>
      
      <div class="error-info">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移动</p>
        
        <!-- 建议操作 -->
        <div class="error-suggestions">
          <h3>您可以尝试：</h3>
          <ul>
            <li>检查网址是否正确</li>
            <li>返回上一页继续浏览</li>
            <li>访问首页查找所需内容</li>
          </ul>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome" class="action-btn primary">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack" class="action-btn secondary">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
      
      <!-- 快捷导航 -->
      <div class="quick-nav">
        <h4>快捷导航</h4>
        <div class="nav-links">
          <router-link to="/admin/ownerInfo" class="nav-link">
            <el-icon><User /></el-icon>
            <span>业主管理</span>
          </router-link>
          <router-link to="/admin/community" class="nav-link">
            <el-icon><OfficeBuilding /></el-icon>
            <span>小区管理</span>
          </router-link>
          <router-link to="/admin/monthTicket" class="nav-link">
            <el-icon><Tickets /></el-icon>
            <span>月票管理</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { DocumentDelete, HomeFilled, Back, User, OfficeBuilding, Tickets } from '@element-plus/icons-vue';

export default {
    name: "404",
    components: {
        DocumentDelete,
        HomeFilled, 
        Back,
        User,
        OfficeBuilding,
        Tickets
    },
    setup() {
        const router = useRouter();
        
        const goBack = () => {
            router.go(-1);
        };
        
        const goHome = () => {
            router.push('/admin/emptyPer');
        };
        
        return {
            goBack,
            goHome
        };
    },
};
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .floating-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
    
    &.shape-1 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 60px;
      height: 60px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 80px;
      height: 80px;
      bottom: 30%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.error-content {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.error-illustration {
  margin-bottom: 40px;
  
  .error-number {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    
    .digit {
      font-size: 120px;
      font-weight: 900;
      color: #667eea;
      text-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
      
      &.special {
        color: #ff6b6b;
        transform: scale(1.2);
        animation: bounce 2s ease-in-out infinite;
      }
    }
  }
  
  .error-icon {
    color: #94a3b8;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: scale(1.2) translateY(0); }
  40% { transform: scale(1.2) translateY(-10px); }
  60% { transform: scale(1.2) translateY(-5px); }
}

.error-info {
  margin-bottom: 40px;
  
  .error-title {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .error-desc {
    font-size: 18px;
    color: #6b7280;
    margin-bottom: 30px;
    line-height: 1.6;
  }
}

.error-suggestions {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 8px 0;
      color: #6b7280;
      position: relative;
      padding-left: 20px;
      
      &::before {
        content: '•';
        color: #667eea;
        font-weight: bold;
        position: absolute;
        left: 0;
      }
    }
  }
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  
  .action-btn {
    height: 48px;
    padding: 0 24px;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }
    }
    
    &.secondary {
      background: white;
      border: 2px solid #e5e7eb;
      color: #6b7280;
      
      &:hover {
        border-color: #667eea;
        color: #667eea;
        transform: translateY(-2px);
      }
    }
  }
}

.quick-nav {
  border-top: 1px solid #e5e7eb;
  padding-top: 30px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
  }
  
  .nav-links {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid #e5e7eb;
      
      &:hover {
        background: #f3f4f6;
        color: #667eea;
        border-color: #667eea;
        transform: translateY(-1px);
      }
      
      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-content {
    padding: 40px 20px;
    margin: 20px;
  }
  
  .error-number .digit {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    
    .action-btn {
      width: 100%;
      max-width: 280px;
    }
  }
  
  .nav-links {
    flex-direction: column;
    align-items: center;
    
    .nav-link {
      width: 100%;
      max-width: 200px;
      justify-content: center;
    }
  }
}
</style>