/**
 * 车场权限管理工具
 * 用于控制用户只能访问其管理的车场数据
 */

/**
 * 获取当前用户管理的车场列表
 * @returns {Array<string>} 车场名称数组
 */
export function getManagedParks() {
  const managedParksStr = localStorage.getItem('managed_parks');
  if (!managedParksStr) {
    return [];
  }
  
  try {
    const parks = JSON.parse(managedParksStr);
    return Array.isArray(parks) ? parks : [];
  } catch (error) {
    console.error('解析管理车场数据失败:', error);
    return [];
  }
}

/**
 * 设置当前用户管理的车场列表
 * @param {Array<string>} parks - 车场名称数组
 */
export function setManagedParks(parks) {
  if (!Array.isArray(parks)) {
    console.error('设置管理车场失败：参数必须是数组');
    return;
  }
  localStorage.setItem('managed_parks', JSON.stringify(parks));
}

/**
 * 检查当前用户是否是管理员（管理员可以查看所有车场）
 * @returns {boolean}
 */
export function isAdmin() {
  const roleId = localStorage.getItem('ms_role');
  const roleName = (localStorage.getItem('ms_role_name') || '').trim();
  
  // 调试信息
  console.log('🔍 检查管理员权限:', {
    roleId,
    roleName,
    isAdmin: roleId == 1 || roleName === '管理员' || roleName.includes('管理员')
  });
  
  // roleId = 1 表示管理员
  if (roleId == 1) {
    return true;
  }
  
  // 角色名称包含"管理员"就认为是管理员（更宽松的匹配）
  if (roleName.includes('管理员')) {
    return true;
  }
  
  return false;
}

/**
 * 检查用户是否有权限查看指定车场
 * @param {string} parkName - 车场名称
 * @returns {boolean}
 */
export function canAccessPark(parkName) {
  // 管理员可以访问所有车场
  if (isAdmin()) {
    return true;
  }
  
  // 检查是否在用户管理的车场列表中
  const managedParks = getManagedParks();
  
  // 如果没有配置管理车场，默认允许访问（向后兼容）
  if (managedParks.length === 0) {
    return true;
  }
  
  return managedParks.includes(parkName);
}

/**
 * 过滤数据列表，只保留用户有权限访问的车场数据
 * @param {Array} dataList - 数据列表
 * @param {string} parkFieldName - 车场字段名称，默认为 'parkName'
 * @returns {Array} 过滤后的数据列表
 */
export function filterDataByParkAuth(dataList, parkFieldName = 'parkName') {
  if (!Array.isArray(dataList)) {
    return [];
  }
  
  // 管理员可以查看所有数据
  if (isAdmin()) {
    return dataList;
  }
  
  const managedParks = getManagedParks();
  
  // 如果没有配置管理车场，返回所有数据（向后兼容）
  if (managedParks.length === 0) {
    return dataList;
  }
  
  // 过滤数据
  return dataList.filter(item => {
    const parkName = item[parkFieldName];
    return parkName && managedParks.includes(parkName);
  });
}

/**
 * 获取车场筛选参数（用于API请求）
 * @returns {string} 车场名称列表（逗号分隔），如果是管理员则返回空字符串表示查询所有
 */
export function getParkFilterParam() {
  // 管理员不需要过滤
  if (isAdmin()) {
    return '';
  }
  
  const managedParks = getManagedParks();
  
  // 如果没有配置管理车场，返回空字符串（向后兼容）
  if (managedParks.length === 0) {
    return '';
  }
  
  // 返回逗号分隔的车场名称
  return managedParks.join(',');
}

/**
 * 获取车场筛选参数数组（用于API请求）
 * @returns {Array<string>} 车场名称数组，如果是管理员则返回空数组表示查询所有
 */
export function getParkFilterArray() {
  // 管理员不需要过滤
  if (isAdmin()) {
    return [];
  }
  
  return getManagedParks();
}

/**
 * 清除车场权限数据（用于登出）
 */
export function clearParkAuth() {
  localStorage.removeItem('managed_parks');
}

/**
 * 在页面显示车场权限提示信息
 * @returns {string}
 */
export function getParkAuthTip() {
  if (isAdmin()) {
    return '您是管理员，可以查看所有车场数据';
  }
  
  const managedParks = getManagedParks();
  
  if (managedParks.length === 0) {
    return '您暂未分配管理车场，可以查看所有数据';
  }
  
  return `您管理的车场：${managedParks.join('、')}`;
}

export default {
  getManagedParks,
  setManagedParks,
  isAdmin,
  canAccessPark,
  filterDataByParkAuth,
  getParkFilterParam,
  getParkFilterArray,
  clearParkAuth,
  getParkAuthTip
};

