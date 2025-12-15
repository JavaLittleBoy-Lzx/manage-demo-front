import request from '@/utils/request'

export const whitelistApi = {
  /**
   * 获取白名单数据列表
   * @param {Object} params 查询参数
   */
  getWhitelistData(params) {
    return request({
      url: '/parking/whitelist',
      method: 'get',
      params
    })
  },

  /**
   * 创建白名单记录
   * @param {Object} data 白名单数据
   */
  createWhitelist(data) {
    return request({
      url: '/parking/whitelist',
      method: 'post',
      data
    })
  },

  /**
   * 更新白名单记录
   * @param {Object} data 白名单数据（包含id）
   */
  updateWhitelist(data) {
    return request({
      url: `/parking/whitelist/${data.id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除白名单记录
   * @param {Number} id 白名单记录ID
   */
  deleteWhitelist(id) {
    return request({
      url: `/parking/whitelist/${id}`,
      method: 'delete'
    })
  },

  /**
   * 批量删除白名单记录
   * @param {Array} ids 白名单记录ID列表
   */
  batchDeleteWhitelist(ids) {
    return request({
      url: '/parking/whitelist/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  /**
   * 根据车牌号查询白名单记录
   * @param {String} plateNumber 车牌号码
   * @param {String} parkName 车场名称
   */
  getWhitelistByPlate(plateNumber, parkName) {
    return request({
      url: '/parking/whitelist/by-plate',
      method: 'get',
      params: { plateNumber, parkName }
    })
  },

  /**
   * 检查车牌是否在白名单中
   * @param {String} plateNumber 车牌号码
   * @param {String} parkName 车场名称
   */
  checkWhitelist(plateNumber, parkName) {
    return request({
      url: '/parking/whitelist/check',
      method: 'get',
      params: { plateNumber, parkName }
    })
  }
}

export default whitelistApi

