import request from '../utils/request';

/**
 * 巡检人员管理API
 */

// 获取巡检人员列表
export const getStaffList = (params) => {
    return request({
        url: '/api/staff/list',
        method: 'get',
        params
    });
};

// 获取巡检人员详情
export const getStaffDetail = (id) => {
    return request({
        url: `/api/staff/${id}`,
        method: 'get'
    });
};

// 新增巡检人员
export const addStaff = (data) => {
    return request({
        url: '/api/staff/add',
        method: 'post',
        data
    });
};

// 更新巡检人员信息
export const updateStaff = (data) => {
    return request({
        url: '/api/staff/update',
        method: 'put',
        data
    });
};

// 删除巡检人员
export const deleteStaff = (id) => {
    return request({
        url: `/api/staff/delete/${id}`,
        method: 'delete'
    });
};

// 批量删除巡检人员
export const batchDeleteStaff = (ids) => {
    return request({
        url: '/api/staff/batch-delete',
        method: 'delete',
        data: { ids }
    });
};

// 更新人员状态
export const updateStaffStatus = (id, requestData) => {
    return request({
        url: `/api/staff/status/${id}`,
        method: 'put',
        data: requestData // 传递完整的请求数据，包含 status 和 disableReason
    });
};

// 重置密码
export const resetPassword = (id, newPassword) => {
    return request({
        url: `/api/staff/reset-password/${id}`,
        method: 'put',
        data: { password: newPassword }
    });
};

// 检查用户名是否存在
export const checkUsername = (username, excludeId = null) => {
    return request({
        url: '/api/auth/check-username',
        method: 'get',
        params: { username, excludeId }
    });
};

// 获取车场列表（用于下拉选择）
export const getParkList = () => {
    return request({
        url: '/api/park/list',
        method: 'get'
    });
};

// 获取车场信息列表（从 yard_info 表）
export const getYardList = () => {
    return request({
        url: '/parking/yardInfo/getAllYardInfo',
        method: 'get'
    });
};

// 导出巡检人员数据
export const exportStaffData = (params) => {
    return request({
        url: '/api/staff/export',
        method: 'get',
        params,
        responseType: 'blob'
    });
}; 