import request from '../utils/request';

// 活动日志相关API
export const activityApi = {
    // 获取最近活动列表（分页查询活动日志）
    getRecentActivities(limit = 10) {
        return request({
            url: '/parking/activity-log/page',
            method: 'get',
            params: { 
                pageNum: 1,
                pageSize: limit,
                // 按创建时间倒序排列，获取最近的活动
            }
        });
    },

    // 分页查询活动日志
    getActivityLogPage(params) {
        return request({
            url: '/parking/activity-log/page',
            method: 'get',
            params: {
                pageNum: params.pageNum || 1,
                pageSize: params.pageSize || 20,
                userId: params.userId,
                username: params.username,
                module: params.module,
                action: params.action,
                status: params.status,
                startTime: params.startTime,
                endTime: params.endTime
            }
        });
    },

    // 记录活动日志
    logActivity(logData) {
        return request({
            url: '/parking/activity-log/log',
            method: 'post',
            data: {
                userId: logData.userId,
                username: logData.username,
                module: logData.module,
                action: logData.action,
                description: logData.description,
                targetId: logData.targetId,
                targetType: logData.targetType,
                oldData: logData.oldData,
                newData: logData.newData,
                status: logData.status || 'success',
                errorMessage: logData.errorMessage,
                duration: logData.duration,
                remark: logData.remark,
                ipAddress: logData.ipAddress // 添加IP地址字段
            }
        });
    },

    // 记录成功操作日志
    logSuccess(logData) {
        return request({
            url: '/parking/activity-log/log-success',
            method: 'post',
            data: {
                userId: logData.userId,
                username: logData.username,
                module: logData.module,
                action: logData.action,
                description: logData.description,
                targetId: logData.targetId,
                targetType: logData.targetType,
                oldData: logData.oldData,
                newData: logData.newData,
                ipAddress: logData.ipAddress // 添加IP地址字段
            }
        });
    },

    // 记录失败操作日志
    logError(logData) {
        return request({
            url: '/parking/activity-log/log-error',
            method: 'post',
            data: {
                userId: logData.userId,
                username: logData.username,
                module: logData.module,
                action: logData.action,
                description: logData.description,
                targetId: logData.targetId,
                targetType: logData.targetType,
                errorMessage: logData.errorMessage,
                ipAddress: logData.ipAddress // 添加IP地址字段
            }
        });
    },

    // 统计用户操作次数
    countByUserId(userId, startTime, endTime) {
        return request({
            url: `/parking/activity-log/count-by-user/${userId}`,
            method: 'get',
            params: { startTime, endTime }
        });
    },

    // 统计各模块操作次数
    countByModule(startTime, endTime) {
        return request({
            url: '/parking/activity-log/count-by-module',
            method: 'get',
            params: { startTime, endTime }
        });
    },

    // 统计各操作类型次数
    countByAction(startTime, endTime) {
        return request({
            url: '/parking/activity-log/count-by-action',
            method: 'get',
            params: { startTime, endTime }
        });
    },

    // 获取活动统计数据
    getActivityStatistics(startTime, endTime) {
        return request({
            url: '/parking/activity-log/statistics',
            method: 'get',
            params: { startTime, endTime }
        });
    },

    // 清理过期日志
    cleanExpiredLogs(days = 90) {
        return request({
            url: '/parking/activity-log/clean-expired',
            method: 'delete',
            params: { days }
        });
    },

    // 便捷方法：记录业主管理操作
    logOwnerOperation(userId, username, action, description, ownerId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '车主管理',
            action,
            description,
            targetId: ownerId,
            targetType: 'ownerinfo',
            oldData,
            newData
        });
    },

    // 便捷方法：记录预约管理操作
    logAppointmentOperation(userId, username, action, description, appointmentId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '预约管理',
            action,
            description,
            targetId: appointmentId,
            targetType: 'appointment',
            oldData,
            newData
        });
    },

    // 便捷方法：记录违规管理操作
    logViolationOperation(userId, username, action, description, violationId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '违规管理',
            action,
            description,
            targetId: violationId,
            targetType: 'violation',
            oldData,
            newData
        });
    },

    // 便捷方法：记录月票管理操作
    logMonthTicketOperation(userId, username, action, description, ticketId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '月票管理',
            action,
            description,
            targetId: ticketId,
            targetType: 'monthticket',
            oldData,
            newData
        });
    },

    // 便捷方法：记录黑名单管理操作
    logBlacklistOperation(userId, username, action, description, blacklistId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '黑名单管理',
            action,
            description,
            targetId: blacklistId,
            targetType: 'blacklist',
            oldData,
            newData
        });
    },

    // 便捷方法：记录用户管理操作
    logUserOperation(userId, username, action, description, targetUserId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '用户管理',
            action,
            description,
            targetId: targetUserId,
            targetType: 'user',
            oldData,
            newData
        });
    },

    // 便捷方法：记录系统操作
    logSystemOperation(userId, username, action, description, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '系统管理',
            action,
            description,
            oldData,
            newData
        });
    },

    // 便捷方法：记录巡逻员管理操作
    logPatrolOperation(userId, username, action, description, patrolId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '巡逻员管理',
            action,
            description,
            targetId: patrolId,
            targetType: 'patrol',
            oldData,
            newData
        });
    },

    // 便捷方法：记录小区管理操作
    logCommunityOperation(userId, username, action, description, communityId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '小区管理',
            action,
            description,
            targetId: communityId,
            targetType: 'community',
            oldData,
            newData
        });
    },

    // 便捷方法：记录来访目的管理操作
    logVisitPurposeOperation(userId, username, action, description, visitPurposeId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '来访目的管理',
            action,
            description,
            targetId: visitPurposeId,
            targetType: 'visit_purpose',
            oldData,
            newData
        });
    },

    // 便捷方法：记录拒绝原因管理操作
    logRefuseReasonOperation(userId, username, action, description, refuseReasonId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '拒绝原因管理',
            action,
            description,
            targetId: refuseReasonId,
            targetType: 'refuse_reason',
            oldData,
            newData
        });
    },

    // 便捷方法：记录车辆预约管理操作
    logVehicleReservationOperation(userId, username, action, description, reservationId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '车辆预约管理',
            action,
            description,
            targetId: reservationId,
            targetType: 'vehicle_reservation',
            oldData,
            newData
        });
    },

    // 便捷方法：记录车场管理操作
    logYardOperation(userId, username, action, description, yardId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '车场管理',
            action,
            description,
            targetId: yardId,
            targetType: 'yard',
            oldData,
            newData
        });
    },

    // 便捷方法：记录通知商家管理操作
    logNotifierOperation(userId, username, action, description, notifierId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '通知商家管理',
            action,
            description,
            targetId: notifierId,
            targetType: 'notifier',
            oldData,
            newData
        });
    },

    // 便捷方法：记录管家管理操作
    logButlerOperation(userId, username, action, description, butlerId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '管家管理',
            action,
            description,
            targetId: butlerId,
            targetType: 'butler',
            oldData,
            newData
        });
    },

    // 便捷方法：记录角色管理操作
    logRoleOperation(userId, username, action, description, roleId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '角色管理',
            action,
            description,
            targetId: roleId,
            targetType: 'role',
            oldData,
            newData
        });
    },

    // 便捷方法：记录入场记录操作
    logVenueOperation(userId, username, action, description, venueId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '入场记录',
            action,
            description,
            targetId: venueId,
            targetType: 'venue',
            oldData,
            newData
        });
    },

    // 便捷方法：记录访客审批操作
    logVisitorOperation(userId, username, action, description, visitorId, oldData = null, newData = null) {
        return this.logSuccess({
            userId,
            username,
            module: '访客审批',
            action,
            description,
            targetId: visitorId,
            targetType: 'visitor',
            oldData,
            newData
        });
    },

    // 获取用户活动历史（个人中心使用）
    getUserActivities(params) {
        return request({
            url: '/parking/activity-log/page',
            method: 'get',
            params: {
                pageNum: params.pageNum || 1,
                pageSize: params.pageSize || 10,
                userId: params.userId,
                username: params.username,
                startTime: params.startDate,
                endTime: params.endDate
            }
        });
    }
}; 