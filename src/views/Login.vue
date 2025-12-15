<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <!-- 几何装饰元素 -->
      <div class="geo-shape shape1"></div>
      <div class="geo-shape shape2"></div>
      <div class="geo-shape shape3"></div>
      <div class="geo-shape shape4"></div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="login-content">
      <!-- 左侧插图区域 -->
      <div class="illustration-section">
        <div class="illustration-container">
          <img src="../assets/img/报表解说.png" alt="智能办公平台" class="main-illustration" />
          <div class="illustration-title">
            <h2>WELCOME</h2>
            <p>雪人停车智能管理平台</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-section">
        <div class="login-card">
          <!-- 系统标题 -->
          <h1 class="system-title">雪人停车管理系统</h1>
          
          <!-- 登录表单 -->
          <div class="form-container">
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="login-form">
              <el-form-item prop="username">
                <div class="input-wrapper">
                  <i class="input-icon el-icon-user"></i>
                  <el-input 
                    v-model="param.username" 
                    placeholder="请输入用户名"
                    class="custom-input"
                  />
                </div>
              </el-form-item>
              
              <el-form-item prop="password">
                <div class="input-wrapper">
                  <i class="input-icon el-icon-lock"></i>
                  <el-input 
                    type="password" 
                    placeholder="请输入密码" 
                    v-model="param.password"
                    class="custom-input"
                  />
                </div>
              </el-form-item>
              
              <el-form-item>
                <div class="input-wrapper verify-wrapper">
                  <i class="input-icon el-icon-price-tag"></i>
                  <el-input 
                    v-model="verify" 
                    @keyup.enter="submitForm()" 
                    placeholder="请输入验证码"
                    class="custom-input verify-input"
                  />
                  <div class="verify-code">
                    <vVerify ref="verifyRef" />
                  </div>
                </div>
              </el-form-item>
              
              <div class="form-actions">
                <el-button 
                  type="primary" 
                  @click="submitForm()" 
                  :disabled="formdata.codeDisabled"
                  :loading="formdata.loginLoading"
                  class="login-button"
                >
                  <span v-if="formdata.loginLoading">登录中...</span>
                  <span v-else>登录</span>
                </el-button>
              </div>
              
              <div class="form-tips">
                <span class="tips-text">Tips: 用户名、密码和验证码必须填写</span>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import request from "../utils/request";
import vVerify from "../components/Verify.vue";

export default {
  components: {
    vVerify,
  },
  setup() {
    const router = useRouter();
    const param = reactive({
      username: "",
      password: "",
    });
    const formdata = reactive({
      codeDisabled: false,
      loginLoading: false,
    });

    const rules = {
      username: [
        {
          required: true,
          message: "请输入用户名",
          trigger: "blur",
        },
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
      ],
    };
    const login = ref(null);
    const verifyRef = ref(null);
    const state = reactive({
      verify: "",
    });
    const submitForm = () => {
      // 验证验证码
      if (!state.verify) {
        ElMessage.warning("请输入验证码");
        return;
      }
      
      if (verifyRef.value.imgCode !== state.verify.toUpperCase()) {
        ElMessage.error("验证码错误，请重新输入");
        verifyRef.value.handleDraw();
        state.verify = "";
        return;
      }
      
      // 验证表单
      login.value.validate((valid) => {
        if (!valid) {
          ElMessage.warning("请填写完整的登录信息");
          return false;
        }
        
        // 开始登录
        formdata.codeDisabled = true;
        formdata.loginLoading = true;
        
        // 显示登录中提示
        const loadingMessage = ElMessage({
          message: '正在登录，请稍候...',
          type: 'info',
          duration: 0,
          iconClass: 'el-icon-loading'
        });
        
        request.get("/parking/user/login", {
          params: param,
        }).then((res) => {
          console.log('登录响应:', res);
          
          // 检查是否有错误信息
          if (res.data && res.data.message && (res.data.resultCode !== 0 && res.data.resultCode !== 200)) {
            // 登录失败 - 显示后端返回的具体错误信息
            loadingMessage.close();
            ElMessage.error({
              message: res.data.message || "登录失败，请检查用户名和密码",
              duration: 3000
            });
            verifyRef.value.handleDraw();
            state.verify = "";
            formdata.loginLoading = false;
            formdata.codeDisabled = false;
            return false;
          }
          
          if (res.data && res.data.data) {
                localStorage.setItem("user", res.data)
                localStorage.setItem("token", res.data.token)
                localStorage.setItem("ms_username", res.data.data.userName);
                localStorage.setItem("login_name", res.data.data.loginName);
                localStorage.setItem("userId", res.data.data.userId)
                localStorage.setItem("ms_userid", res.data.data.userId)
                localStorage.setItem("ms_role", res.data.data.roleId);
                localStorage.setItem("ms_role_name", res.data.data.roleName);
                localStorage.setItem("departmentId", res.data.data.departmentId)
                
                // 存储用户管理的车场信息
                if (res.data.data.managedParks) {
                  // 如果后端返回的是数组，直接存储
                  if (Array.isArray(res.data.data.managedParks)) {
                    localStorage.setItem("managed_parks", JSON.stringify(res.data.data.managedParks));
                  } 
                  // 如果后端返回的是字符串（逗号分隔），转换为数组后存储
                  else if (typeof res.data.data.managedParks === 'string') {
                    const parksArray = res.data.data.managedParks.split(',').map(p => p.trim()).filter(p => p);
                    localStorage.setItem("managed_parks", JSON.stringify(parksArray));
                  }
                  console.log('✅ 用户管理车场信息已存储:', res.data.data.managedParks);
                } else {
                  // 如果没有返回管理车场，清空之前的数据
                  localStorage.removeItem("managed_parks");
                  console.log('ℹ️ 用户未配置管理车场');
                }
                
                // 关闭登录中提示
                loadingMessage.close();
                
                // 显示成功提示
                ElMessage.success({
                  message: `欢迎回来，${res.data.data.userName}！`,
                  duration: 2000
                });
                
                // 注意：登录日志已由后端 UserController.login() 方法记录，前端不需要重复记录
                if (res.data.data.roleId != null) {
                  // 检查角色名称是否为"欧洲新城_用户"
                  if (res.data.data.roleName === "欧洲新城_用户") {
                    router.push("/admin/blacklist");
                  } else {
                    router.push("/admin");
                  }
                } else {
                  loadingMessage.close();
                  ElMessage.error({
                    message: "用户角色未设置，请联系管理员",
                    duration: 3000
                  });
                  verifyRef.value.handleDraw();
                  state.verify = "";
                  formdata.loginLoading = false;
                  formdata.codeDisabled = false;
                  return false;
                }
              } else {
                // 登录失败 - 显示后端返回的错误信息或默认提示
                loadingMessage.close();
                const errorMsg = res.data?.message || "登录失败，请检查用户名和密码";
                ElMessage.error({
                  message: errorMsg,
                  duration: 3000
                });
                verifyRef.value.handleDraw();
                state.verify = "";
                formdata.loginLoading = false;
                formdata.codeDisabled = false;
                return false;
              }
            }).catch((error) => {
              // 网络错误或服务器错误
              console.error('❌ 登录请求失败:', error);
              loadingMessage.close();
              
              let errorMessage = null;
              
              // 优先检查后端返回的错误信息（需要确保 error.response 存在）
              if (error && error.response && error.response.data) {
                // 检查后端返回的 message 字段
                if (error.response.data.message) {
                  errorMessage = error.response.data.message;
                } else if (error.response.data.msg) {
                  errorMessage = error.response.data.msg;
                } else if (error.response.data.data && error.response.data.data.message) {
                  errorMessage = error.response.data.data.message;
                }
                
                // 检查HTTP状态码对应的错误信息
                if (!errorMessage && error.response.status) {
                  if (error.response.status === 500) {
                    errorMessage = error.response.data?.message || "服务器内部错误，请联系管理员";
                  } else if (error.response.status === 404) {
                    errorMessage = "登录接口不存在，请联系管理员";
                  } else if (error.response.status === 401) {
                    errorMessage = error.response.data?.message || "用户名或密码错误";
                  }
                }
              }
              
              // 如果没有后端错误信息，检查是否是网络连接错误或其他错误
              if (!errorMessage) {
                if (error) {
                  // 检查是否是网络连接错误
                  const isNetworkError = 
                    error.code === 'ERR_NETWORK' || 
                    error.code === 'ECONNREFUSED' ||
                    (error.message && (
                      error.message.includes('ERR_CONNECTION_REFUSED') ||
                      error.message.includes('Network Error') ||
                      error.message.includes('timeout') ||
                      error.message.includes('Failed to fetch')
                    ));
                  
                  if (isNetworkError) {
                    // 网络连接错误时显示友好提示
                    errorMessage = "无法连接到服务器，请检查后端服务是否已启动";
                    console.warn('⚠️ 网络连接错误:', error.message || error.code);
                  } else if (error.message) {
                    // 如果有错误消息，使用它
                    errorMessage = error.message;
                  } else {
                    // 其他未知错误显示通用提示
                    errorMessage = "登录失败，请稍后重试";
                  }
                } else {
                  // 如果 error 对象都不存在，显示默认提示
                  errorMessage = "登录失败，请稍后重试";
                }
              }
              
              // 确保总是显示错误提示
              ElMessage.error({
                message: errorMessage || "登录失败，请稍后重试",
                duration: 5000,
                showClose: true
              });
              
              // 恢复界面状态
              verifyRef.value.handleDraw();
              state.verify = "";
              formdata.loginLoading = false;
              formdata.codeDisabled = false;
            }).finally(() => {
              // 确保loading状态一定会被重置
              setTimeout(() => {
                formdata.loginLoading = false;
                formdata.codeDisabled = false;
              }, 100);
            });
          });
    };

    const store = useStore();
    store.commit("clearTags");

    return {
      param,
      rules,
      login,
      ...toRefs(state),
      verifyRef,
      submitForm,
      formdata,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .geo-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    
    &.shape1 {
      width: 100px;
      height: 100px;
      top: 10%;
      left: 15%;
      transform: rotate(45deg);
      animation: float 6s ease-in-out infinite;
    }
    
    &.shape2 {
      width: 60px;
      height: 60px;
      top: 70%;
      left: 80%;
      transform: rotate(30deg);
      animation: float 8s ease-in-out infinite reverse;
    }
    
    &.shape3 {
      width: 80px;
      height: 80px;
      top: 20%;
      right: 10%;
      border-radius: 50%;
      animation: float 7s ease-in-out infinite;
    }
    
    &.shape4 {
      width: 120px;
      height: 40px;
      bottom: 20%;
      left: 10%;
      border-radius: 20px;
      animation: float 9s ease-in-out infinite reverse;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-content {
  display: flex;
  width: 90%;
  max-width: 1200px;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.illustration-section {
  flex: 1;
  background: linear-gradient(135deg, #3045cc 0%, #243ba0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 40px;
  
  .illustration-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 450px;
    
    .main-illustration {
      width: 100%;
      max-width: 400px;
      height: auto;
      object-fit: contain;
      margin-bottom: 30px;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
    }
    
    .illustration-title {
      text-align: center;
      color: white;
      
      h2 {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 10px 0;
        letter-spacing: 2px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }
      
      p {
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
        font-weight: 300;
      }
    }
  }
}



.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.system-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 40px;
  position: relative;
  
     &::after {
     content: '';
     position: absolute;
     bottom: -10px;
     left: 50%;
     transform: translateX(-50%);
     width: 60px;
     height: 3px;
     background: linear-gradient(90deg, #4f46e5, #06b6d4);
     border-radius: 2px;
   }
}

.form-container {
  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  
     &:focus-within {
     border-color: #4f46e5;
     box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
   }
  
  .input-icon {
    padding: 0 15px;
    color: #6c757d;
    font-size: 18px;
  }
  
  .custom-input {
    flex: 1;
    
    :deep(.el-input__inner) {
      border: none;
      background: transparent;
      padding: 15px 0;
      font-size: 16px;
      
      &:focus {
        box-shadow: none;
      }
    }
  }
  
  &.verify-wrapper {
    padding: 8px;
    gap: 12px;
    
    .verify-input {
      flex: 1;
      max-width: 160px;
    }
    
    .verify-code {
      display: flex;
      align-items: center;
    }
  }
}

.form-actions {
  margin-top: 32px;
  
     .login-button {
     width: 100%;
     height: 50px;
     background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
     border: none;
     border-radius: 25px;
     font-size: 16px;
     font-weight: 600;
     transition: all 0.3s ease;
     
     &:hover {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
     }
    
    &:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
  }
}

.form-tips {
  text-align: center;
  margin-top: 24px;
  
  .tips-text {
    color: #6c757d;
    font-size: 14px;
  }
  
  .additional-links {
    margin-top: 16px;
    
         .link-item {
       color: #4f46e5;
       font-size: 14px;
       cursor: pointer;
       transition: color 0.3s ease;
       
       &:hover {
         color: #06b6d4;
         text-decoration: underline;
       }
     }
  }
}

// Element Plus 样式覆盖
:deep(.el-form-item__content) {
  line-height: normal;
}

 :deep(.el-input) {
   --el-input-focus-border-color: #4f46e5;
 }
</style>