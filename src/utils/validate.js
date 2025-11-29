/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
  }
  
  /**
   * @param {string} str
   * @returns {Boolean} Boolean
   */
  export function validMobile(str) {
    return /^1[3-9][0-9]{9}$/.test(str)
  }
  