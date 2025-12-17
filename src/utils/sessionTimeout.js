/**
 * 会话超时管理工具
 * 监听用户活动，超时后自动退出登录
 */

// 默认超时时间：30分钟（单位：毫秒）
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

// 检查间隔：1分钟（单位：毫秒）
const CHECK_INTERVAL = 30 * 1000;

// 存储最后活动时间的 key
const LAST_ACTIVITY_KEY = 'last_activity_time';

// 禁用会话超时的角色名称列表
// 默认所有角色都启用会话超时，只有在这个列表中的角色才会禁用会话超时
// 如果为空数组，则所有角色都启用会话超时
const DISABLED_ROLES = [
  '管理员',
  '普通用户',
  // 可以添加更多需要禁用会话超时的角色
  // 例如：'访客', '只读用户'
];

class SessionTimeoutManager {
  constructor(timeout = DEFAULT_TIMEOUT) {
    this.timeout = timeout;
    this.checkTimer = null;
    this.onTimeoutCallback = null;
  }

  /**
   * 获取当前用户角色名称
   */
  getCurrentRoleName() {
    return localStorage.getItem('ms_role_name') || '';
  }

  /**
   * 检查当前角色是否需要启用会话超时
   * 默认所有角色都启用，只有在 DISABLED_ROLES 中的角色才禁用
   */
  shouldEnableSessionTimeout() {
    const roleName = this.getCurrentRoleName();
    console.log("roleName：", roleName);
    // 如果角色在禁用列表中，不启用
    if (DISABLED_ROLES.length > 0 && DISABLED_ROLES.includes(roleName)) {
      console.log(`ℹ️ [会话超时] 角色 "${roleName}" 在禁用列表中，不启用会话超时`);
      return false;
    }
    
    // 默认所有角色都启用会话超时
    // console.log(`✅ [会话超时] 角色 "${roleName}" 启用会话超时`);
    return true;
  }

  /**
   * 更新最后活动时间
   */
  updateLastActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * 获取最后活动时间
   */
  getLastActivity() {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    return lastActivity ? parseInt(lastActivity, 10) : null;
  }

  /**
   * 清除最后活动时间
   */
  clearLastActivity() {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
    return !!(token && userId);
  }

  /**
   * 检查是否超时
   */
  isTimeout() {
    if (!this.isLoggedIn()) {
      return false;
    }

    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      // 如果没有记录，认为是新登录，设置当前时间
      this.updateLastActivity();
      return false;
    }

    const now = Date.now();
    const elapsed = now - lastActivity;
    return elapsed > this.timeout;
  }

  /**
   * 开始监听用户活动
   */
  startMonitoring() {
    // 检查是否需要启用会话超时
    if (!this.shouldEnableSessionTimeout()) {
      console.log('ℹ️ [会话超时] 当前角色不需要启用会话超时，跳过监听');
      return () => {
        // 返回一个空的清理函数
        console.log('ℹ️ [会话超时] 未启用监听，无需清理');
      };
    }

    // 如果已经有定时器在运行，先清除
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    // 监听用户活动事件
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // 节流：避免频繁更新和日志输出
    let lastLogTime = 0;
    const LOG_THROTTLE = 5000; // 5秒内最多输出一次日志
    
    const activityHandler = () => {
      if (this.isLoggedIn() && this.shouldEnableSessionTimeout()) {
        this.updateLastActivity();
        const now = Date.now();
        if (now - lastLogTime > LOG_THROTTLE) {
          console.log('🔄 [会话超时] 用户活动，更新最后活动时间');
          lastLogTime = now;
        }
      }
    };

    // 添加事件监听器
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // 初始化最后活动时间
    if (this.isLoggedIn()) {
      this.updateLastActivity();
      const roleName = this.getCurrentRoleName();
      console.log(`✅ [会话超时] 开始监听 - 角色: "${roleName}", 超时时间: ${this.timeout / 1000} 秒，检查间隔: ${CHECK_INTERVAL / 1000} 秒`);
    }

    // 定期检查是否超时
    this.checkTimer = setInterval(() => {
      // 再次检查是否需要启用（角色可能已变更）
      if (!this.shouldEnableSessionTimeout()) {
        console.log('ℹ️ [会话超时] 角色已变更，不再需要会话超时，停止检查');
        if (this.checkTimer) {
          clearInterval(this.checkTimer);
          this.checkTimer = null;
        }
        return;
      }

      const lastActivity = this.getLastActivity();
      const now = Date.now();
      const elapsed = lastActivity ? now - lastActivity : 0;
      
      console.log('⏰ [会话超时] 检查中... 最后活动:', lastActivity ? new Date(lastActivity).toLocaleTimeString() : '无', 
                  '已过去:', Math.floor(elapsed / 1000), '秒', 
                  '超时阈值:', this.timeout / 1000, '秒');
      
      if (this.isTimeout()) {
        console.log('⚠️ [会话超时] 检测到超时，准备退出登录');
        this.handleTimeout();
      }
    }, CHECK_INTERVAL);

    return () => {
      // 清理函数：移除事件监听器
      console.log('🛑 [会话超时] 停止监听');
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
      if (this.checkTimer) {
        clearInterval(this.checkTimer);
        this.checkTimer = null;
      }
    };
  }

  /**
   * 处理超时
   */
  handleTimeout() {
    if (!this.isLoggedIn()) {
      console.log('ℹ️ [会话超时] 用户未登录，跳过超时处理');
      return;
    }

    console.log('⚠️ [会话超时] 触发超时处理，准备退出登录');

    // 清除定时器
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    // 调用超时回调
    if (this.onTimeoutCallback) {
      console.log('📞 [会话超时] 调用超时回调函数');
      this.onTimeoutCallback();
    } else {
      console.warn('⚠️ [会话超时] 未设置超时回调函数');
    }
  }

  /**
   * 设置超时回调
   */
  onTimeout(callback) {
    this.onTimeoutCallback = callback;
  }

  /**
   * 停止监听
   */
  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.clearLastActivity();
  }

  /**
   * 重置会话（登录时调用）
   */
  reset() {
    this.updateLastActivity();
  }
}

// 创建单例
let sessionManager = null;

/**
 * 获取会话管理器实例
 */
export function getSessionManager(timeout = DEFAULT_TIMEOUT) {
  if (!sessionManager) {
    sessionManager = new SessionTimeoutManager(timeout);
  } else if (timeout !== DEFAULT_TIMEOUT && timeout !== sessionManager.timeout) {
    // 如果传入的 timeout 不同，更新超时时间
    sessionManager.timeout = timeout;
    console.log('🔄 [会话超时] 更新超时时间为:', timeout / 1000, '秒');
  }
  return sessionManager;
}

/**
 * 初始化会话超时管理
 * @param {number} timeout - 超时时间（毫秒），默认30分钟
 * @param {Function} onTimeout - 超时回调函数
 */
export function initSessionTimeout(timeout = DEFAULT_TIMEOUT, onTimeout = null) {
  const manager = getSessionManager(timeout);
  
  if (onTimeout) {
    manager.onTimeout(onTimeout);
  }

  return manager.startMonitoring();
}

/**
 * 重置会话（登录成功后调用）
 */
export function resetSession() {
  const manager = getSessionManager();
  manager.reset();
}

export default SessionTimeoutManager;

