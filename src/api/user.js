import request from '../utils/request';

// 用户相关API
export const userApi = {
    // 获取当前用户信息
    getCurrentUser() {
        return request({
            url: '/parking/user/current',
            method: 'get'
        });
    },

    // 更新用户信息
    updateUser(userData) {
        return request({
            url: '/parking/user',
            method: 'put',
            data: userData
        });
    },

    // 修改密码
    changePassword(passwordData) {
        return request({
            url: '/parking/user/change-password',
            method: 'post',
            data: passwordData
        });
    },

    // 上传头像
    uploadAvatar(formData) {
        return request({
            url: '/parking/personal/upload-avatar',
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 获取角色信息
    getRoleById(roleId) {
        return request({
            url: `/parking/role/${roleId}`,
            method: 'get'
        });
    },

    // 获取所有角色列表
    getAllRoles() {
        return request({
            url: '/parking/role/listAll',
            method: 'get'
        });
    }
};
