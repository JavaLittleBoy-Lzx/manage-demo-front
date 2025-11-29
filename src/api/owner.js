import request from '../utils/request';

// 车主相关API
export const ownerApi = {
    // 根据车牌号查询车主信息
    getOwnerByPlate(plateNumber) {
        return request({
            url: `/parking/violations/owners/by-plate/${plateNumber}`,
            method: 'get'
        });
    },

    // 车牌号搜索建议
    getPlateSuggestions(keyword) {
        return request({
            url: '/parking/violations/owners/plate-suggestions',
            method: 'get',
            params: { keyword }
        });
    },

    // 业主姓名搜索建议
    getOwnerNameSuggestions(keyword) {
        return request({
            url: '/parking/ownerinfo/owner-name-suggestions',
            method: 'get',
            params: { keyword }
        });
    },

    // 获取车主的车辆列表
    getOwnerVehicles(ownerId) {
        return request({
            url: `/parking/violations/owners/${ownerId}/vehicles`,
            method: 'get'
        });
    },

    // 更新车主信用分
    updateCreditScore(ownerId, creditScore, reason) {
        return request({
            url: `/parking/violations/owners/${ownerId}/credit-score`,
            method: 'put',
            data: { creditScore, reason }
        });
    },

    // 获取车主信用分
    getCreditScore(ownerId) {
        return request({
            url: `/parking/violations/owners/${ownerId}/credit-score`,
            method: 'get'
        });
    }
}; 