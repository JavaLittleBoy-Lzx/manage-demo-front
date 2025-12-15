import axios from 'axios';
import router from '../router';

const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    // baseURL: 'https://www.xuerparking.cn:8543',
    // baseURL: 'https://472154x56q.vicp.fun',
    baseURL: 'http://localhost:8543',
    // baseURL: 'http://www.xuerparking.cn:8080',
    // baseURL: 'https://csharphrb.picp.vip',
    timeout: 5000000
});

service.interceptors.request.use(
    config => {
        const token = localStorage.getItem("token");
        if (token) {
            // 同时添加两种格式的 token，确保兼容性
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['token'] = token;  // 🔧 添加 token 请求头，供后端 TokenUtils 使用
        }
        // 兼容不同存储键名，传递后端所需的 userId 请求头
        const storedUserId = localStorage.getItem('userId') || localStorage.getItem('ms_userid');
        if (storedUserId) {
            config.headers['userId'] = storedUserId;
        }
        
        // 🔍 详细日志：查看请求参数
        if (config.url && config.url.includes('/violations')) {
            if (config.params && config.params.park_name) {
                // console.log('🎓 [REQUEST] park_name 存在:', config.params.park_name);
            } else {
                // console.log('❌ [REQUEST] park_name 不存在或为空');
            }
        }
        
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
        // 删除导出表格中的未识别数据，清除未识别数据
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        console.log('请求拦截器捕获错误:', error);
        // 确保错误对象被正确传递
        return Promise.reject(error);
    }
);

export default service;