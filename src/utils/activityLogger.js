import { activityApi } from '../api/activity';
import { ElMessage } from 'element-plus';
import { getRealIpAddress } from './ipUtils';

/**
 * 前端活动日志记录工具
 * 用于在各个管理模块中记录用户操作
 */
class ActivityLogger {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    // 获取当前用户信息
    getCurrentUser() {
        return {
            userId: localStorage.getItem('ms_userid') || 'unknown',
            username: localStorage.getItem('login_name') || localStorage.getItem('ms_username') || '未知用户'
        };
    }

    // 记录成功操作
    async logSuccess(module, action, description, targetId = null, targetType = null, oldData = null, newData = null) {
        try {
            // 获取真实IP地址
            const ipAddress = await getRealIpAddress();
            
            const logData = {
                userId: this.currentUser.userId,
                username: this.currentUser.username,
                module,
                action,
                description,
                targetId: targetId ? String(targetId) : null,
                targetType,
                oldData: oldData ? JSON.stringify(oldData) : null,
                newData: newData ? JSON.stringify(newData) : null,
                ipAddress: ipAddress // 添加真实IP地址
            };

            console.log('记录活动日志，IP地址:', ipAddress);
            await activityApi.logSuccess(logData);
        } catch (error) {
            console.error('记录活动日志失败:', error);
            // 不影响主要业务流程，只记录错误
        }
    }

    // 记录失败操作
    async logError(module, action, description, errorMessage, targetId = null, targetType = null) {
        try {
            // 获取真实IP地址
            const ipAddress = await getRealIpAddress();
            
            const logData = {
                userId: this.currentUser.userId,
                username: this.currentUser.username,
                module,
                action,
                description,
                targetId: targetId ? String(targetId) : null,
                targetType,
                errorMessage,
                ipAddress: ipAddress // 添加真实IP地址
            };

            console.log('记录错误日志，IP地址:', ipAddress);
            await activityApi.logError(logData);
        } catch (error) {
            console.error('记录错误日志失败:', error);
        }
    }

    // 车主管理相关日志记录
    async logOwnerOperation(action, description, ownerId, oldData = null, newData = null) {
        return this.logSuccess('车主管理', action, description, ownerId, 'ownerinfo', oldData, newData);
    }

    async logOwnerError(action, description, errorMessage, ownerId = null) {
        return this.logError('车主管理', action, description, errorMessage, ownerId, 'ownerinfo');
    }

    // 预约管理相关日志记录
    async logAppointmentOperation(action, description, appointmentId, oldData = null, newData = null) {
        return this.logSuccess('预约管理', action, description, appointmentId, 'appointment', oldData, newData);
    }

    async logAppointmentError(action, description, errorMessage, appointmentId = null) {
        return this.logError('预约管理', action, description, errorMessage, appointmentId, 'appointment');
    }

    // 违规管理相关日志记录
    async logViolationOperation(action, description, violationId, oldData = null, newData = null) {
        return this.logSuccess('违规管理', action, description, violationId, 'violation', oldData, newData);
    }

    async logViolationError(action, description, errorMessage, violationId = null) {
        return this.logError('违规管理', action, description, errorMessage, violationId, 'violation');
    }

    // 月票管理相关日志记录
    async logMonthTicketOperation(action, description, ticketId, oldData = null, newData = null) {
        return this.logSuccess('月票管理', action, description, ticketId, 'monthticket', oldData, newData);
    }

    async logMonthTicketError(action, description, errorMessage, ticketId = null) {
        return this.logError('月票管理', action, description, errorMessage, ticketId, 'monthticket');
    }

    // 黑名单管理相关日志记录
    async logBlacklistOperation(action, description, blacklistId, oldData = null, newData = null) {
        return this.logSuccess('黑名单管理', action, description, blacklistId, 'blacklist', oldData, newData);
    }

    async logBlacklistError(action, description, errorMessage, blacklistId = null) {
        return this.logError('黑名单管理', action, description, errorMessage, blacklistId, 'blacklist');
    }

    // 用户管理相关日志记录
    async logUserOperation(action, description, targetUserId, oldData = null, newData = null) {
        return this.logSuccess('用户管理', action, description, targetUserId, 'user', oldData, newData);
    }

    async logUserError(action, description, errorMessage, targetUserId = null) {
        return this.logError('用户管理', action, description, errorMessage, targetUserId, 'user');
    }

    // 系统管理相关日志记录
    async logSystemOperation(action, description, oldData = null, newData = null) {
        return this.logSuccess('系统管理', action, description, null, null, oldData, newData);
    }

    async logSystemError(action, description, errorMessage) {
        return this.logError('系统管理', action, description, errorMessage);
    }
}

// 创建单例实例
const activityLogger = new ActivityLogger();

// 导出便捷方法
export const logActivity = {
    // 车主管理
    ownerAdd: (description, ownerId, newData) => 
        activityLogger.logOwnerOperation('添加', description, ownerId, null, newData),
    ownerUpdate: (description, ownerId, oldData, newData) => 
        activityLogger.logOwnerOperation('修改', description, ownerId, oldData, newData),
    ownerDelete: (description, ownerId, oldData) => 
        activityLogger.logOwnerOperation('删除', description, ownerId, oldData, null),
    ownerError: (action, description, errorMessage, ownerId) => 
        activityLogger.logOwnerError(action, description, errorMessage, ownerId),

    // 预约管理
    appointmentCreate: (description, appointmentId, newData) => 
        activityLogger.logAppointmentOperation('添加', description, appointmentId, null, newData),
    appointmentApprove: (description, appointmentId, oldData, newData) => 
        activityLogger.logAppointmentOperation('审批', description, appointmentId, oldData, newData),
    appointmentCancel: (description, appointmentId, oldData) => 
        activityLogger.logAppointmentOperation('取消', description, appointmentId, oldData, null),
    appointmentError: (action, description, errorMessage, appointmentId) => 
        activityLogger.logAppointmentError(action, description, errorMessage, appointmentId),

    // 违规管理
    violationAdd: (description, violationId, newData) => 
        activityLogger.logViolationOperation('添加', description, violationId, null, newData),
    violationHandle: (description, violationId, oldData, newData) => 
        activityLogger.logViolationOperation('处理', description, violationId, oldData, newData),
    violationDelete: (description, violationId, oldData) => 
        activityLogger.logViolationOperation('删除', description, violationId, oldData, null),
    violationError: (action, description, errorMessage, violationId) => 
        activityLogger.logViolationError(action, description, errorMessage, violationId),

    // 月票管理
    monthTicketCreate: (description, ticketId, newData) => 
        activityLogger.logMonthTicketOperation('添加', description, ticketId, null, newData),
    monthTicketRenew: (description, ticketId, oldData, newData) => 
        activityLogger.logMonthTicketOperation('续费', description, ticketId, oldData, newData),
    monthTicketCancel: (description, ticketId, oldData) => 
        activityLogger.logMonthTicketOperation('取消', description, ticketId, oldData, null),
    monthTicketError: (action, description, errorMessage, ticketId) => 
        activityLogger.logMonthTicketError(action, description, errorMessage, ticketId),

    // 黑名单管理
    blacklistAdd: (description, blacklistId, newData) => 
        activityLogger.logBlacklistOperation('添加', description, blacklistId, null, newData),
    blacklistRemove: (description, blacklistId, oldData) => 
        activityLogger.logBlacklistOperation('移除', description, blacklistId, oldData, null),
    blacklistError: (action, description, errorMessage, blacklistId) => 
        activityLogger.logBlacklistError(action, description, errorMessage, blacklistId),

    // 用户管理
    userLogin: (description) => 
        activityLogger.logUserOperation('登录', description),
    userLogout: (description) => 
        activityLogger.logUserOperation('登出', description),
    userCreate: (description, userId, newData) => 
        activityLogger.logUserOperation('添加', description, userId, null, newData),
    userUpdate: (description, userId, oldData, newData) => 
        activityLogger.logUserOperation('修改', description, userId, oldData, newData),
    userDelete: (description, userId, oldData) => 
        activityLogger.logUserOperation('删除', description, userId, oldData, null),
    userError: (action, description, errorMessage, userId) => 
        activityLogger.logUserError(action, description, errorMessage, userId),

    // 系统管理
    systemBackup: (description) => 
        activityLogger.logSystemOperation('备份', description),
    systemRestore: (description) => 
        activityLogger.logSystemOperation('恢复', description),
    systemConfig: (description, oldData, newData) => 
        activityLogger.logSystemOperation('配置', description, oldData, newData),
    systemError: (action, description, errorMessage) => 
        activityLogger.logSystemError(action, description, errorMessage)
};

export default activityLogger; 