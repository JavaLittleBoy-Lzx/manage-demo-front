/**
 * IP地址工具类
 * 用于获取客户端真实IP地址
 */

// 缓存IP地址，避免频繁请求
let cachedIp = null;
let ipFetchPromise = null;

/**
 * 从第三方API获取真实IP地址
 * @returns {Promise<string>} IP地址
 */
export const getRealIpAddress = async () => {
  // 如果已经有缓存的IP，直接返回
  if (cachedIp) {
    return cachedIp;
  }

  // 如果正在请求中，返回同一个Promise
  if (ipFetchPromise) {
    return ipFetchPromise;
  }

  // 创建新的请求Promise
  ipFetchPromise = fetchIpAddress();
  
  try {
    const ip = await ipFetchPromise;
    cachedIp = ip;
    return ip;
  } finally {
    ipFetchPromise = null;
  }
};

/**
 * 实际获取IP的函数
 * @returns {Promise<string>}
 */
const fetchIpAddress = async () => {
  // 尝试多个IP获取服务，按优先级依次尝试
  const ipServices = [
    // 1. ipify (推荐，稳定快速)
    {
      url: 'https://api.ipify.org?format=json',
      parse: (data) => data.ip
    },
    // 2. ip-api (免费，包含地理位置信息)
    {
      url: 'https://ipapi.co/json/',
      parse: (data) => data.ip
    },
    // 3. ipinfo.io (备用)
    {
      url: 'https://ipinfo.io/json',
      parse: (data) => data.ip
    }
  ];

  // 依次尝试各个服务
  for (const service of ipServices) {
    try {
      console.log(`尝试从 ${service.url} 获取IP地址...`);
      
      // 创建带超时的fetch请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ip = service.parse(data);
        
        if (ip && isValidIp(ip)) {
          console.log(`✅ 成功获取IP地址: ${ip}`);
          return ip;
        } else {
          console.warn(`❌ 获取的IP地址无效: ${ip}`);
        }
      } else {
        console.warn(`❌ HTTP状态错误: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`❌ 请求超时: ${service.url}`);
      } else {
        console.warn(`❌ 从 ${service.url} 获取IP失败:`, error.message);
      }
      // 继续尝试下一个服务
    }
  }

  // 所有服务都失败，尝试获取本地IP
  console.warn('⚠️ 所有外部IP获取服务都失败，尝试获取本地IP');
  const localIp = await getLocalIp();
  
  if (localIp && localIp !== '未知' && isValidIp(localIp)) {
    console.log(`✅ 获取本地IP成功: ${localIp}`);
    return localIp;
  }
  
  // 本地IP也获取失败，返回友好的默认值
  console.warn('⚠️ 无法获取IP地址，使用默认值');
  return '客户端IP';
};

/**
 * 验证IP地址格式
 * @param {string} ip 
 * @returns {boolean}
 */
const isValidIp = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // IPv4 验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 验证（简单验证）
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  return false;
};

/**
 * 获取本地IP（WebRTC方式）
 * 注意：此方法获取的是局域网IP，不是公网IP
 * @returns {Promise<string>}
 */
const getLocalIp = async () => {
  try {
    // 使用 WebRTC 获取本地IP
    const pc = new RTCPeerConnection({
      iceServers: []
    });
    
    pc.createDataChannel('');
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    return new Promise((resolve) => {
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve('未知');
          return;
        }
        
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = ipRegex.exec(ice.candidate.candidate);
        
        if (match && match[1]) {
          pc.close();
          resolve(match[1]);
        }
      };
      
      // 超时处理
      setTimeout(() => {
        pc.close();
        resolve('未知');
      }, 3000);
    });
  } catch (error) {
    console.error('获取本地IP失败:', error);
    return '未知';
  }
};

/**
 * 清除IP缓存（用于测试或强制刷新）
 */
export const clearIpCache = () => {
  cachedIp = null;
  ipFetchPromise = null;
  console.log('IP缓存已清除');
};

/**
 * 获取IP地址（同步方式，返回缓存值或默认值）
 * 如果需要实时获取，请使用 getRealIpAddress()
 * @returns {string}
 */
export const getIpAddressSync = () => {
  return cachedIp || '获取中...';
};

// 页面加载时预先获取IP地址
if (typeof window !== 'undefined') {
  getRealIpAddress().then(ip => {
    console.log('预加载IP地址成功:', ip);
  }).catch(error => {
    console.error('预加载IP地址失败:', error);
  });
}