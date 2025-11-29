/**
 * 违规配置管理API
 * @author system
 * @date 2025-01-31
 */
import request from '@/utils/request';

const BASE_URL = '/parking/violation-config';
const TYPES_BASE_URL = '/parking/violation-types';

// ==================== 违规位置管理 ====================

/**
 * 分页查询违规位置列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getLocationPage(params) {
    return request({
        url: `${BASE_URL}/locations`,
        method: 'get',
        params
    });
}

/**
 * 查询启用的违规位置列表（下拉选择）
 * @param {String} parkName 车场名称
 * @returns {Promise}
 */
export function getEnabledLocations(parkName) {
    return request({
        url: `${BASE_URL}/locations/enabled`,
        method: 'get',
        params: { parkName }
    });
}

/**
 * 新增违规位置
 * @param {Object} data 位置数据
 * @returns {Promise}
 */
export function addLocation(data) {
    return request({
        url: `${BASE_URL}/locations`,
        method: 'post',
        data
    });
}

/**
 * 更新违规位置
 * @param {Number} id 位置ID
 * @param {Object} data 位置数据
 * @returns {Promise}
 */
export function updateLocation(id, data) {
    return request({
        url: `${BASE_URL}/locations/${id}`,
        method: 'put',
        data
    });
}

/**
 * 删除违规位置
 * @param {Number} id 位置ID
 * @returns {Promise}
 */
export function deleteLocation(id) {
    return request({
        url: `${BASE_URL}/locations/${id}`,
        method: 'delete'
    });
}

/**
 * 切换违规位置启用状态
 * @param {Number} id 位置ID
 * @param {Boolean} isEnabled 是否启用
 * @returns {Promise}
 */
export function toggleLocationEnabled(id, isEnabled) {
    return request({
        url: `${BASE_URL}/locations/${id}/toggle`,
        method: 'patch',
        params: { isEnabled }
    });
}

// ==================== 违规类型管理 ====================

/**
 * 分页查询违规类型列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getTypePage(params) {
    return request({
        url: `${BASE_URL}/types`,
        method: 'get',
        params
    });
}

/**
 * 查询启用的违规类型列表（下拉选择）
 * @param {String} parkName 车场名称
 * @returns {Promise}
 */
export function getEnabledTypes(parkName) {
    return request({
        url: `${BASE_URL}/types/enabled`,
        method: 'get',
        params: { parkName }
    });
}

/**
 * 新增违规类型
 * @param {Object} data 类型数据
 * @returns {Promise}
 */
export function addType(data) {
    return request({
        url: `${BASE_URL}/types`,
        method: 'post',
        data
    });
}

/**
 * 更新违规类型
 * @param {Number} id 类型ID
 * @param {Object} data 类型数据
 * @returns {Promise}
 */
export function updateType(id, data) {
    return request({
        url: `${BASE_URL}/types/${id}`,
        method: 'put',
        data
    });
}

/**
 * 删除违规类型
 * @param {Number} id 类型ID
 * @returns {Promise}
 */
export function deleteType(id) {
    return request({
        url: `${BASE_URL}/types/${id}`,
        method: 'delete'
    });
}

/**
 * 切换违规类型启用状态
 * @param {Number} id 类型ID
 * @param {Boolean} isEnabled 是否启用
 * @returns {Promise}
 */
export function toggleTypeEnabled(id, isEnabled) {
    return request({
        url: `${BASE_URL}/types/${id}/toggle`,
        method: 'patch',
        params: { isEnabled }
    });
}

// ==================== 违规描述管理 ====================

/**
 * 分页查询违规描述列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getDescriptionPage(params) {
    return request({
        url: `${BASE_URL}/descriptions`,
        method: 'get',
        params
    });
}

/**
 * 查询启用的违规描述列表（下拉选择）
 * @param {String} violationTypeCode 违规类型代码
 * @param {String} parkName 车场名称
 * @returns {Promise}
 */
export function getEnabledDescriptions(violationTypeCode, parkName) {
    return request({
        url: `${BASE_URL}/descriptions/enabled`,
        method: 'get',
        params: { violationTypeCode, parkName }
    });
}

/**
 * 新增违规描述
 * @param {Object} data 描述数据
 * @returns {Promise}
 */
export function addDescription(data) {
    return request({
        url: `${BASE_URL}/descriptions`,
        method: 'post',
        data
    });
}

/**
 * 更新违规描述
 * @param {Number} id 描述ID
 * @param {Object} data 描述数据
 * @returns {Promise}
 */
export function updateDescription(id, data) {
    return request({
        url: `${BASE_URL}/descriptions/${id}`,
        method: 'put',
        data
    });
}

/**
 * 删除违规描述
 * @param {Number} id 描述ID
 * @returns {Promise}
 */
export function deleteDescription(id) {
    return request({
        url: `${BASE_URL}/descriptions/${id}`,
        method: 'delete'
    });
}

/**
 * 切换违规描述启用状态
 * @param {Number} id 描述ID
 * @param {Boolean} isEnabled 是否启用
 * @returns {Promise}
 */
export function toggleDescriptionEnabled(id, isEnabled) {
    return request({
        url: `${BASE_URL}/descriptions/${id}/toggle`,
        method: 'patch',
        params: { isEnabled }
    });
}

// ==================== 拉黑原因管理 ====================

/**
 * 分页查询拉黑原因列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getReasonPage(params) {
    return request({
        url: `${BASE_URL}/reasons`,
        method: 'get',
        params
    });
}

/**
 * 查询启用的拉黑原因列表（下拉选择）
 * @param {String} reasonCategory 原因分类
 * @param {String} parkName 车场名称
 * @returns {Promise}
 */
export function getEnabledReasons(reasonCategory, parkName) {
    return request({
        url: `${BASE_URL}/reasons/enabled`,
        method: 'get',
        params: { reasonCategory, parkName }
    });
}

/**
 * 新增拉黑原因
 * @param {Object} data 原因数据
 * @returns {Promise}
 */
export function addReason(data) {
    return request({
        url: `${BASE_URL}/reasons`,
        method: 'post',
        data
    });
}

/**
 * 更新拉黑原因
 * @param {Number} id 原因ID
 * @param {Object} data 原因数据
 * @returns {Promise}
 */
export function updateReason(id, data) {
    return request({
        url: `${BASE_URL}/reasons/${id}`,
        method: 'put',
        data
    });
}

/**
 * 删除拉黑原因
 * @param {Number} id 原因ID
 * @returns {Promise}
 */
export function deleteReason(id) {
    return request({
        url: `${BASE_URL}/reasons/${id}`,
        method: 'delete'
    });
}

/**
 * 切换拉黑原因启用状态
 * @param {Number} id 原因ID
 * @param {Boolean} isEnabled 是否启用
 * @returns {Promise}
 */
export function toggleReasonEnabled(id, isEnabled) {
    return request({
        url: `${BASE_URL}/reasons/${id}/toggle`,
        method: 'patch',
        params: { isEnabled }
    });
}

// ==================== AI智能建议 ====================

/**
 * 获取AI智能生成的违规描述建议
 * @param {String} typeName 违规类型名称
 * @returns {Promise}
 */
export function getAISuggestions(typeName) {
    return request({
        url: `${TYPES_BASE_URL}/ai-suggestions`,
        method: 'get',
        params: { typeName }
    });
}

