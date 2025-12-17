<template>
    <div class="violation-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <WarningFilled />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>违规记录查询</h1>
                        <p class="title-desc">查询和管理车辆违规记录，跟踪处理状态</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- 搜索面板 -->
            <div class="search-panel">
                <div class="search-panel-header" @click="toggleSearchPanel">
                    <div class="search-title">
                        <el-icon>
                            <Search />
                        </el-icon>
                        <span>筛选条件</span>
                        <el-icon :class="['toggle-icon', { 'expanded': searchPanelExpanded }]">
                            <ArrowDown />
                        </el-icon>
                    </div>
                </div>
                <el-collapse-transition>
                    <div v-show="searchPanelExpanded" class="search-panel-body">
                        <el-form :inline="true" :model="query" class="search-form" label-width="80px">
                            <!-- 第一行：主要搜索条件 -->
                            <div class="search-row">
                                <el-form-item label="车牌号码" class="search-item">
                                    <el-input v-model="query.plateNumber" placeholder="请输入车牌号码" clearable
                                        class="search-input" />
                                </el-form-item>

                                <el-form-item label="车主姓名" class="search-item">
                                    <el-input v-model="query.ownerName" placeholder="请输入车主姓名" clearable
                                        class="search-input" />
                                </el-form-item>

                                <el-form-item label="车主电话" class="search-item">
                                    <el-input v-model="query.ownerPhone" placeholder="请输入车主电话" clearable
                                        class="search-input" />
                                </el-form-item>

                                <el-form-item label="违规类型" class="search-item">
                                    <el-select v-model="query.violationType" placeholder="请选择违规类型" clearable
                                        class="search-select">
                                        <el-option label="违规停车" value="违规停车"></el-option>
                                        <el-option label="未按位停车" value="未按位停车"></el-option>
                                        <el-option label="占用他人车位" value="占用他人车位"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.community" placeholder="请选择车场" clearable filterable
                                        class="search-select">
                                        <el-option v-for="item in filteredCommunityOptions" :key="item.value"
                                            :label="item.label" :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </div>

                            <!-- 第二行：次要搜索条件 -->
                            <div class="search-row">

                                <el-form-item label="处理状态" class="search-item">
                                    <el-select v-model="query.processStatus" placeholder="请选择处理状态" clearable
                                        class="search-select">
                                        <el-option label="全部" value=""></el-option>
                                        <el-option label="未处理" value="pending"></el-option>
                                        <el-option label="已处理" value="processed"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="处理方式" class="search-item">
                                    <el-select v-model="query.processType" placeholder="请选择处理方式" clearable
                                        class="search-select">
                                        <el-option label="全部" value=""></el-option>
                                        <el-option label="系统自动拉黑" value="auto_blacklist"></el-option>
                                        <el-option label="手动处理" value="manual"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="违规日期" class="search-item date-range-item">
                                    <el-date-picker v-model="query.dateRange" type="daterange" range-separator="至"
                                        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD" clearable class="date-range-picker" />
                                </el-form-item>
                            </div>

                            <!-- 🆕 第三行：处理状态筛选 -->
                            <div class="search-row"></div>

                            <!-- 操作按钮行 -->
                            <div class="search-actions">
                                <div class="search-buttons">
                                    <el-button type="warning" icon="RefreshRight" @click="handleReset" size="small">
                                        重置
                                    </el-button>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                                        搜索
                                    </el-button>
                                </div>
                                <div class="action-buttons">
                                    <!-- 🆕 违规统计按钮 - 只有东北林业大学车场才显示 -->
                                    <el-button 
                                        v-if="showStatisticsButton"
                                        type="info" 
                                        icon="TrendCharts" 
                                        @click="showStatisticsDialog = true"
                                        size="small">
                                        违规统计
                                    </el-button>
                                    <!-- 🆕 批量处理按钮 -->
                                    <el-button type="primary" icon="Check" @click="handleBatchProcess" size="small"
                                        :disabled="multipleSelection.length === 0">
                                        批量处理 ({{ multipleSelection.length }})
                                    </el-button>
                                    <el-button type="success" icon="Download" @click="handleExport" size="small">
                                        导出数据
                                    </el-button>
                                    <el-button v-if="showEuropeNewCityConfig" type="warning" icon="Setting"
                                        @click="handleMonthlyTicketConfig" size="small">
                                        月票车配置（欧洲新城）
                                    </el-button>
                                    <el-button v-if="showNebuConfig" type="danger" icon="Setting"
                                        @click="handleNebuConfigDialog" size="small">
                                        违规阈值（东北林业大学）
                                    </el-button>
                                    <el-button v-if="showCollegeNewCityConfig" type="success" icon="Setting"
                                        @click="handleCollegeNewCityConfigDialog" size="small">
                                        拉黑规则（学院新城）
                                    </el-button>
                                    <el-button v-if="showWanXiangConfig" type="primary" icon="Setting"
                                        @click="handleWanXiangConfigDialog" size="small">
                                        拉黑规则（万象上东）
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>

            <!-- 违规记录列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <WarningFilled />
                        </el-icon>
                        <span>违规记录列表</span>
                    </div>
                    <div class="table-status" v-if="isFiltering">
                        <el-tag type="info" size="small">
                            前端过滤：显示 {{ tableData.length }} 条，共 {{ filteredTotal }} 条记录
                        </el-tag>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable" :cell-style="cellStyle"
                        :row-class-name="tableRowClassName" @selection-change="handleSelectionChange" height="430"
                        stripe>

                        <!-- 🆕 复选框列（用于批量处理） -->
                        <el-table-column type="selection" width="55" align="center" fixed="left"></el-table-column>

                        <!-- 车辆信息列 -->
                        <el-table-column label="车辆信息" width="220" fixed="left">
                            <template #default="{ row }">
                                <div class="vehicle-info-cell">
                                    <div class="vehicle-details">
                                        <div class="car-number-container">
                                            <span :class="['plate-number', getPlateType(row.plateNumber)]">
                                                {{ row.plateNumber }}
                                            </span>
                                            <!-- 🆕 违规次数徽章 -->
                                            <el-badge
                                                v-if="row.violationCount && row.violationCount >= (configForm.maxViolationCount - 2)"
                                                :value="row.violationCount"
                                                :type="row.violationCount >= configForm.maxViolationCount ? 'danger' : 'warning'"
                                                :max="99" class="violation-count-badge">
                                            </el-badge>
                                        </div>
                                        <div class="owner-info">
                                            <div class="owner-name">{{ getDisplayOwnerName(row) }}</div>
                                            <!-- 🆕 自动拉黑警告提示 -->
                                            <div v-if="row.violationCount >= (configForm.maxViolationCount - 1)"
                                                class="auto-blacklist-warning">
                                                <el-icon color="#E6A23C">
                                                    <WarningFilled />
                                                </el-icon>
                                                <span>再违规{{ Math.max(configForm.maxViolationCount - row.violationCount,
                                                    0) }}次将自动拉黑</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 违规信息列 -->
                        <el-table-column label="违规信息" width="320">
                            <template #default="{ row }">
                                <div class="violation-info-cell">
                                    <div class="violation-type">
                                        <el-tag :type="getViolationTypeColor(row.violationType)" size="small">
                                            {{ row.violationType }}
                                        </el-tag>
                                    </div>
                                    <div class="violation-location">
                                        <el-icon class="location-icon">
                                            <Location />
                                        </el-icon>
                                        <span>{{ row.location }}</span>
                                    </div>
                                    <div class="violation-time">
                                        <el-icon class="time-icon">
                                            <Clock />
                                        </el-icon>
                                        <span>{{ formatTimestamp(row.createdAt) }}</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车主信息列 -->
                        <el-table-column label="车主信息" width="320">
                            <template #default="{ row }">
                                <div class="owner-detail-cell">
                                    <div class="owner-phone" v-if="getDisplayOwnerPhone(row) !== '暂无'">
                                        <el-icon class="phone-icon">
                                            <Phone />
                                        </el-icon>
                                        {{ getDisplayOwnerPhone(row) }}
                                    </div>
                                    <div class="owner-address" v-if="row.ownerAddress">
                                        <el-icon class="address-icon">
                                            <Location />
                                        </el-icon>
                                        <span class="address-text">{{ row.ownerAddress }}</span>
                                    </div>
                                    <div v-if="getDisplayOwnerPhone(row) === '暂无' && !row.ownerAddress" class="no-info">
                                        暂无详细信息
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 违规图片列 -->
                        <el-table-column label="违规图片" width="230" align="center">
                            <template #default="{ row }">
                                <div class="image-cell">
                                    <div v-if="row.photos && getAllPhotos(row.photos).length > 0"
                                        class="photos-container">
                                        <!-- 显示多张图片 -->
                                        <div v-for="(photo, index) in getAllPhotos(row.photos)" :key="index"
                                            class="photo-item"
                                            :class="{ 'multiple-photos': getAllPhotos(row.photos).length > 1 }">
                                            <img :src="photo" :alt="`违规图片${index + 1}`" @click="previewImage(photo)"
                                                class="violation-photo" />
                                            <div v-if="getAllPhotos(row.photos).length > 1" class="photo-index">
                                                {{ index + 1 }}/{{ getAllPhotos(row.photos).length }}
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="no-image">
                                        <el-icon class="no-image-icon">
                                            <Picture />
                                        </el-icon>
                                        <span>暂无图片</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 🆕 处理状态列 -->
                        <el-table-column label="处理状态" width="280" align="center">
                            <template #default="{ row }">
                                <div class="process-status-cell">
                                    <!-- 处理状态标签 -->
                                    <el-tag :type="row.processStatus === 'processed' ? 'success' : 'warning'"
                                        size="small" effect="dark">
                                        {{ row.processStatus === 'processed' ? '✅ 已处理' : '⏳ 未处理' }}
                                    </el-tag>

                                    <!-- 处理方式标签 -->
                                    <div v-if="row.processStatus === 'processed'" class="process-type-tag">
                                        <el-tag :type="row.processType === 'auto_blacklist' ? 'danger' : 'info'"
                                            size="small" style="margin-top: 6px;">
                                            {{ row.processType === 'auto_blacklist' ? '🤖 系统自动拉黑' : '👨‍💼 手动处理' }}
                                        </el-tag>
                                    </div>

                                    <!-- 处理信息 -->
                                    <div v-if="row.processStatus === 'processed'" class="process-info">
                                        <div class="process-detail">
                                            <span class="process-label">处理人：</span>
                                            <span class="process-value">{{ row.processedBy || '-' }}</span>
                                        </div>
                                        <div class="process-detail">
                                            <span class="process-label">处理时间：</span>
                                            <span class="process-value">{{ formatTimestamp(row.processedAt) }}</span>
                                        </div>
                                        <div v-if="row.processRemark" class="process-detail">
                                            <span class="process-label">备注：</span>
                                            <el-tooltip effect="dark" :content="row.processRemark" placement="top">
                                                <span class="process-value remark-text">{{ row.processRemark }}</span>
                                            </el-tooltip>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="230" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="info" text icon="View" @click="handleView(row)"
                                        class="action-btn-view">
                                        详情
                                    </el-button>

                                    <!-- 🆕 手动处理按钮（仅未处理的记录显示） -->
                                    <el-button v-if="row.processStatus !== 'processed'" type="success" text icon="Check"
                                        @click="handleProcess(row)">
                                        处理
                                    </el-button>

                                    <!-- 已处理标识 -->
                                    <el-tag v-else type="success" size="small" effect="plain">
                                        已处理
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="isFiltering ? filteredTotal : pageTotal"
                    @size-change="handleSizeChange" @current-change="handlePageChange">
                </el-pagination>
            </div>
        </div>

        <!-- 详情查看弹窗 -->
        <el-dialog title="违规记录详情" v-model="viewShow" width="600px" class="view-dialog">
            <div class="detail-content">
                <div class="detail-section">
                    <h3 class="section-title">车辆信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">车牌号码：</span>
                            <span :class="['plate-number', getPlateType(viewData.plateNumber)]">
                                {{ viewData.plateNumber }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="label">车主姓名：</span>
                            <span class="value">{{ getDisplayOwnerName(viewData) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">车主电话：</span>
                            <span class="value">{{ getDisplayOwnerPhone(viewData) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">车主地址：</span>
                            <span class="value">{{ viewData.ownerAddress || '暂无' }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">违规信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">违规类型：</span>
                            <el-tag :type="getViolationTypeColor(viewData.violationType)" size="small">
                                {{ viewData.violationType }}
                            </el-tag>
                        </div>
                        <div class="detail-item">
                            <span class="label">违规时间：</span>
                            <span class="value">{{ formatTimestamp(viewData.createdAt) }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="label">违规位置：</span>
                            <span class="value">{{ viewData.location }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section" v-if="viewData.photos && getAllPhotos(viewData.photos).length > 0">
                    <h3 class="section-title">违规图片</h3>
                    <div class="detail-grid">
                        <div class="detail-item full-width">
                            <div class="violation-images">
                                <div v-for="(photo, index) in getAllPhotos(viewData.photos)" :key="index"
                                    class="violation-image-item">
                                    <img :src="photo" :alt="`违规图片${index + 1}`" @click="previewImage(photo)"
                                        class="violation-image" />
                                    <div class="image-label">图片 {{ index + 1 }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="viewShow = false" type="primary">
                        关闭
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 月票车超时配置弹窗 -->
        <el-dialog title="月票车超时配置" v-model="configShow" width="1100px" class="config-dialog">
            <div class="config-content">
                <div class="config-info">
                    <p class="config-desc">配置月票车超时检查规则，仅针对 <code>欧洲新城</code> 车场生效</p>
                </div>

                <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="120px">
                    <el-form-item label="超时时间" prop="timeoutMinutes">
                        <el-select v-model="configForm.timeoutMinutes" placeholder="请选择超时时间" style="width: 100%;">
                            <el-option label="30分钟" :value="30"></el-option>
                            <el-option label="1小时" :value="60"></el-option>
                            <el-option label="2小时" :value="120"></el-option>
                            <el-option label="3小时" :value="180"></el-option>
                            <el-option label="6小时" :value="360"></el-option>
                            <el-option label="12小时" :value="720"></el-option>
                        </el-select>
                        <span class="form-tip">超过此时间视为违规</span>
                    </el-form-item>

                    <el-form-item label="累计次数" prop="maxViolationCount">
                        <el-select v-model="configForm.maxViolationCount" placeholder="请选择累计次数" style="width: 100%;">
                            <el-option label="2次" :value="2"></el-option>
                            <el-option label="3次" :value="3"></el-option>
                            <el-option label="4次" :value="4"></el-option>
                            <el-option label="5次" :value="5"></el-option>
                            <el-option label="6次" :value="6"></el-option>
                            <el-option label="10次" :value="10"></el-option>
                            <el-option label="15次" :value="15"></el-option>
                        </el-select>
                        <span class="form-tip">超过此次数自动拉黑</span>
                    </el-form-item>

                    <el-divider content-position="left">
                        <span style="color: #409eff; font-weight: bold;">🌙 过夜停车规则配置</span>
                    </el-divider>

                    <el-form-item label="过夜判定时长" prop="overnightTimeHours">
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <span>跨日停车超过</span>
                            <el-select v-model="configForm.overnightTimeHours" style="width: 120px;">
                                <el-option label="1小时" :value="1"></el-option>
                                <el-option label="2小时" :value="2"></el-option>
                                <el-option label="3小时" :value="3"></el-option>
                                <el-option label="4小时" :value="4"></el-option>
                                <el-option label="5小时" :value="5"></el-option>
                                <el-option label="6小时" :value="6"></el-option>
                                <el-option label="8小时" :value="8"></el-option>
                                <el-option label="12小时" :value="12"></el-option>
                            </el-select>
                            <span>算过夜违规</span>
                        </div>
                        <div class="form-tip" style="margin-top: 8px;">
                            🌙 过夜判定规则：前一天进场且跨日停车超过此时长直接拉黑；凌晨0-6点进场超时累计违规
                        </div>
                    </el-form-item>

                    <el-divider content-position="left">
                        <span style="color: #f56c6c; font-weight: bold;">🛡️ 月票类型免检配置</span>
                    </el-divider>

                    <el-form-item label="免检月票类型">
                        <el-select v-model="configForm.exemptTicketTypes" placeholder="请选择需要免检的月票类型"
                            style="width: 100%;" :loading="ticketTypesLoading" clearable
                            @change="handleExemptTypeChange">
                            <el-option v-for="ticketType in availableTicketTypes" :key="ticketType" :label="ticketType"
                                :value="ticketType" />
                        </el-select>
                        <div class="form-tip" style="margin-top: 8px;">
                            🛡️ 选中的月票类型将免检违规处理：不记录超时违规，过夜也不拉黑。留空表示不免检任何类型
                        </div>
                    </el-form-item>

                </el-form>

                <!-- 🆕 黑名单规则折叠框 -->
                <div class="config-rules-container">
                    <el-collapse v-model="activeCollapseNames">
                        <el-collapse-item title="⚠️ 黑名单规则说明" name="blacklist-rules">
                            <template #title>
                                <div class="collapse-title">
                                    <span class="title-icon">⚠️</span>
                                    <span class="title-text">黑名单规则说明</span>
                                    <span class="title-subtitle">（点击查看详细规则）</span>
                                </div>
                            </template>
                            <div class="config-rules">
                                <ul>
                                    <li>🌙 <strong>过夜停车</strong>：跨日停车超过{{ configForm.overnightTimeHours }}小时，直接加入黑名单
                                        <ul style="margin-top: 5px; font-size: 12px; color: #666;">
                                            <li>• 前一天进场且跨日停车超过时长限制 → 直接拉黑</li>
                                            <li>• 凌晨0-6点进场且超过白天限制 → 累计违规</li>
                                            <li>• 适用于所有车辆（包括月票车和临时车）</li>
                                        </ul>
                                    </li>
                                    <li>⏰ <strong>超时停车</strong>：累计违规达到{{ configForm.maxViolationCount }}次后自动加入黑名单
                                        <ul style="margin-top: 5px; font-size: 12px; color: #666;">
                                            <li>• 月票车白天超时停车累计违规</li>
                                            <li>• 凌晨进场超时停车累计违规</li>
                                            <li>• 临时车超时停车累计违规</li>
                                        </ul>
                                    </li>
                                    <li>🛡️ <strong>免检规则</strong>：免检月票类型{{ configForm.exemptTicketTypes ?
                                        `(${configForm.exemptTicketTypes})` : '(未选择)' }}
                                        <ul style="margin-top: 5px; font-size: 12px; color: #666;">
                                            <li>• 免检类型不记录超时违规，过夜也不拉黑</li>
                                            <li>• 但仍会记录违规日志供查询</li>
                                        </ul>
                                    </li>
                                    <li>📊 <strong>统计周期</strong>：违规次数统计最近30天内的记录</li>
                                </ul>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="configShow = false">取消</el-button>
                    <el-button type="primary" @click="handleSaveConfig" :loading="configSaving">
                        保存配置
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 单条处理弹窗 -->
        <el-dialog title="处理违规记录" v-model="processShow" width="850px" class="process-dialog">
            <div v-if="processForm.processAll && processForm.violationCount > 0" class="process-info-alert">
                <el-alert :title="`将处理该车辆的所有 ${processForm.violationCount} 条未处理违规记录，并加入黑名单`" type="warning"
                    :closable="false" show-icon style="margin-bottom: 20px;">
                </el-alert>
            </div>

            <el-form :model="processForm" label-width="110px">
                <el-form-item label="车牌号">
                    <el-input v-model="processForm.plateNumber" disabled></el-input>
                </el-form-item>

                <el-form-item label="违规类型">
                    <el-input v-model="processForm.violationType" disabled></el-input>
                </el-form-item>

                <el-form-item label="处理数量">
                    <el-input v-model="processCountText" disabled></el-input>
                </el-form-item>

                <!-- 🆕 处理方式选择 -->
                <el-form-item label="处理方式" required>
                    <el-radio-group v-model="processForm.processType">
                        <el-radio label="blacklist">
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <span>拉黑处理</span>
                                <el-tooltip content="违规属实，加入黑名单" placement="top">
                                    <el-icon>
                                        <WarningFilled />
                                    </el-icon>
                                </el-tooltip>
                            </span>
                        </el-radio>
                        <el-radio label="mistake">
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <span>误操作处理</span>
                                <el-tooltip content="误操作或特殊情况，仅标记已处理，不加入黑名单" placement="top">
                                    <el-icon>
                                        <InfoFilled />
                                    </el-icon>
                                </el-tooltip>
                            </span>
                        </el-radio>
                    </el-radio-group>
                    <div style="color: #909399; font-size: 12px; margin-top: 8px;">
                        💡 提示：误操作处理不会加入黑名单，适用于录入错误、特殊情况等场景
                    </div>
                </el-form-item>

                <el-form-item label="处理备注" :required="processForm.processType === 'mistake'">
                    <el-input type="textarea" v-model="processForm.processRemark"
                        :placeholder="processForm.processType === 'mistake' ? '请说明误操作原因（必填）...' : '请输入处理说明（可选）...'"
                        :rows="3" maxlength="200" show-word-limit>
                    </el-input>
                </el-form-item>

                <!-- 🆕 黑名单设置（仅拉黑处理时显示） -->
                <el-divider v-if="processForm.processType === 'blacklist'" content-position="left">黑名单设置</el-divider>

                <el-form-item v-if="processForm.processType === 'blacklist'" label="黑名单类型" required>
                    <el-select v-model="processForm.blacklistType"
                        :placeholder="blacklistTypeLoading ? '加载中...' : '请选择黑名单类型'" :loading="blacklistTypeLoading"
                        style="width: 100%">
                        <el-option v-for="item in blacklistTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value">
                            <span>{{ item.label }}</span>
                            <span v-if="item.description" style="color: #8492a6; font-size: 12px; margin-left: 8px;">
                                {{ item.description }}
                            </span>
                        </el-option>
                    </el-select>
                    <div v-if="isDefaultBlacklistTypes" style="color: #e6a23c; font-size: 12px; margin-top: 4px;">
                        ⚠️ 使用默认黑名单类型（ACMS未配置）
                    </div>
                </el-form-item>

                <el-form-item v-if="processForm.processType === 'blacklist'" label="拉黑时长" required>
                    <el-radio-group v-model="processForm.isPermanent">
                        <el-radio :label="true">永久拉黑</el-radio>
                        <el-radio :label="false">临时拉黑</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="processForm.processType === 'blacklist' && !processForm.isPermanent" label="拉黑时间段"
                    required>
                    <el-date-picker v-model="processForm.blacklistDateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>

                <el-form-item v-if="processForm.processType === 'blacklist'" label="拉黑原因" required>
                    <el-input type="textarea" v-model="processForm.blacklistReason" placeholder="请输入拉黑原因（必填）..."
                        :rows="3" maxlength="200" show-word-limit>
                    </el-input>
                    <div style="margin-top: 8px;">
                        <el-tag v-for="(template, index) in blacklistReasonTemplates" :key="index" size="small"
                            style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
                            @click="processForm.blacklistReason = template">
                            {{ template }}
                        </el-tag>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="processShow = false">取消</el-button>
                    <el-button type="primary" @click="confirmProcess" :loading="processing">
                        {{ processForm.processType === 'mistake' ? '确认处理（不拉黑）' : '确认处理并加入黑名单' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 东北林业大学违规阈值配置弹窗 -->
        <el-dialog title="东北林业大学违规阈值配置" v-model="nebuConfigShow" width="600px" class="nebu-config-dialog">
            <div class="nebu-config-content">
                <div class="config-info">
                    <p class="config-desc">配置东北林业大学自动拉黑规则，仅针对 <code>东北林业大学</code> 车场生效</p>
                </div>

                <el-form :model="nebuConfigForm" :rules="nebuConfigRules" ref="nebuConfigFormRef" label-width="140px">
                    <el-form-item label="自动拉黑阈值" prop="maxViolationCount">
                        <el-select v-model="nebuConfigForm.maxViolationCount" placeholder="请选择违规次数阈值"
                            style="width: 100%;">
                            <el-option label="3次" :value="3"></el-option>
                            <el-option label="4次" :value="4"></el-option>
                            <el-option label="5次（推荐）" :value="5"></el-option>
                            <el-option label="6次" :value="6"></el-option>
                            <el-option label="8次" :value="8"></el-option>
                            <el-option label="10次" :value="10"></el-option>
                        </el-select>
                        <span class="form-tip">累计违规达到此次数自动加入黑名单</span>
                    </el-form-item>

                    <!-- 🆕 黑名单配置 -->
                    <el-divider content-position="left">
                        <span style="color: #0284c7; font-weight: bold;">🛡️ 黑名单配置</span>
                    </el-divider>

                    <el-form-item label="黑名单类型" prop="blacklistType">
                        <el-select v-model="nebuConfigForm.blacklistType"
                            :placeholder="blacklistTypeLoading ? '加载中...' : '请选择黑名单类型'" :loading="blacklistTypeLoading"
                            style="width: 100%">
                            <el-option v-for="item in blacklistTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                                <span>{{ item.label }}</span>
                                <span v-if="item.description"
                                    style="color: #8492a6; font-size: 12px; margin-left: 8px;">
                                    {{ item.description }}
                                </span>
                            </el-option>
                        </el-select>
                        <span class="form-tip">自动拉黑时使用的黑名单类型</span>
                    </el-form-item>

                    <el-form-item label="拉黑时长" prop="isPermanent">
                        <el-radio-group v-model="nebuConfigForm.isPermanent">
                            <el-radio :label="true">永久拉黑</el-radio>
                            <el-radio :label="false">临时拉黑</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="!nebuConfigForm.isPermanent" label="拉黑有效期" prop="blacklistValidDays">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <el-input-number v-model="nebuConfigForm.blacklistValidDays" :min="1" :max="365" :step="1"
                                controls-position="right" style="width: 150px;">
                            </el-input-number>
                            <span style="color: #606266; font-size: 14px;">天</span>
                        </div>
                        <span class="form-tip">拉黑有效天数，自动拉黑时从违规时间开始计算（1-365天）</span>
                    </el-form-item>

                    <!-- 🆕 违规短信/提醒发送间隔配置（分钟） -->
                    <el-form-item label="提醒发送间隔" prop="reminderIntervalMinutes">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <el-input-number v-model="nebuConfigForm.reminderIntervalMinutes" :min="1" :max="1440"
                                :step="1" controls-position="right" style="width: 150px;">
                            </el-input-number>
                            <span style="color: #606266; font-size: 14px;">分钟</span>
                        </div>
                        <span class="form-tip">规定违规短信与违规提醒的最小发送间隔，未超过间隔将禁止再次发送</span>
                    </el-form-item>

                    <el-divider content-position="left">
                        <span style="color: #f56c6c; font-weight: bold;">⚠️ 规则说明</span>
                    </el-divider>

                    <div class="nebu-rules-info">
                        <ul>
                            <li>🚫 <strong>自动拉黑</strong>：未处理违规记录累计达到阈值后，系统自动拉黑</li>
                            <li>📊 <strong>统计范围</strong>：仅统计该车辆在东北林业大学的未处理违规记录</li>
                            <li>🔄 <strong>触发时机</strong>：每次创建新违规记录时自动检查</li>
                            <li>✅ <strong>处理方式</strong>：自动调用ACMS接口拉黑，并批量标记违规记录为已处理</li>
                        </ul>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="nebuConfigShow = false">取消</el-button>
                    <el-button type="primary" @click="handleSaveNebuConfig" :loading="nebuConfigSaving">
                        保存配置
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 学院新城拉黑规则配置弹窗 -->
        <el-dialog title="学院新城拉黑规则配置" v-model="collegeNewCityConfigShow" width="800px"
            class="college-new-city-config-dialog">
            <div class="college-new-city-config-content">
                <div class="config-info">
                    <p class="config-desc">配置学院新城自动拉黑规则，仅针对 <code>学院新城</code> 车场生效</p>
                </div>

                <el-form :model="collegeNewCityConfigForm" :rules="collegeNewCityConfigRules"
                    ref="collegeNewCityConfigFormRef" label-width="140px">
                    <el-form-item label="车场编码" prop="parkCode">
                        <el-input v-model="collegeNewCityConfigForm.parkCode" disabled style="width: 100%;">
                        </el-input>
                        <span class="form-tip">学院新城车场编码（固定值）</span>
                    </el-form-item>

                    <el-form-item label="拉黑时长阈值" prop="blacklistTimeHours">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>超过</span>
                            <el-input-number v-model="collegeNewCityConfigForm.blacklistTimeHours" :min="1" :max="24"
                                :step="1" controls-position="right" style="width: 120px;">
                            </el-input-number>
                            <span>小时自动拉黑</span>
                        </div>
                        <span class="form-tip">0点前进入+0点后超时，或0点后进入+总时长超时，超过此时长将自动拉黑</span>
                    </el-form-item>

                    <!-- 🆕 可配置的凌晨进入时间段 -->
                    <el-form-item label="凌晨时间段" prop="nightTimeRange">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <el-select v-model="collegeNewCityConfigForm.nightStartHour" style="width: 120px;">
                                <el-option v-for="h in 24" :key="`start-` + h" :label="formatHour(h - 1)"
                                    :value="h - 1" />
                            </el-select>
                            <span>至</span>
                            <el-select v-model="collegeNewCityConfigForm.nightEndHour" style="width: 120px;">
                                <el-option v-for="h in 24" :key="`end-` + h" :label="formatHour(h - 1)"
                                    :value="h - 1" />
                            </el-select>
                            <span>进入的车辆按总时长计算</span>
                        </div>
                        <span class="form-tip">请选择有效时间段，例如 00:00 至 07:00。开始时间需小于结束时间。</span>
                    </el-form-item>

                    <!-- 🆕 黑名单配置 -->
                    <el-divider content-position="left">
                        <span style="color: #0284c7; font-weight: bold;">🛡️ 黑名单配置</span>
                    </el-divider>

                    <el-form-item label="黑名单类型" prop="blacklistType">
                        <el-select v-model="collegeNewCityConfigForm.blacklistType"
                            :placeholder="blacklistTypeLoading ? '加载中...' : '请选择黑名单类型'" :loading="blacklistTypeLoading"
                            style="width: 100%">
                            <el-option v-for="item in blacklistTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                                <span>{{ item.label }}</span>
                                <span v-if="item.description"
                                    style="color: #8492a6; font-size: 12px; margin-left: 8px;">
                                    {{ item.description }}
                                </span>
                            </el-option>
                        </el-select>
                        <span class="form-tip">自动拉黑时使用的黑名单类型</span>
                    </el-form-item>

                    <el-form-item label="拉黑时长" prop="isPermanent">
                        <el-radio-group v-model="collegeNewCityConfigForm.isPermanent">
                            <el-radio :label="true">永久拉黑</el-radio>
                            <el-radio :label="false">临时拉黑</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="!collegeNewCityConfigForm.isPermanent" label="拉黑有效期" prop="blacklistValidDays">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <el-input-number v-model="collegeNewCityConfigForm.blacklistValidDays" :min="1" :max="365"
                                :step="1" controls-position="right" style="width: 150px;">
                            </el-input-number>
                            <span style="color: #606266; font-size: 14px;">天</span>
                        </div>
                        <span class="form-tip">拉黑有效天数，自动拉黑时从违规时间开始计算（1-365天）</span>
                    </el-form-item>

                    <el-divider content-position="left">
                        <span style="color: #f56c6c; font-weight: bold;">⚠️ 规则说明</span>
                    </el-divider>

                    <div class="college-new-city-rules-info">
                        <ul>
                            <li>🌙 <strong>0点前进入</strong>：车辆在23:00-23:59进入，计算0点后的停车时长，超过阈值自动拉黑</li>
                            <li>🌅 <strong>凌晨进入</strong>：车辆在{{ formatHour(collegeNewCityConfigForm.nightStartHour) }}-{{
                                formatHour(collegeNewCityConfigForm.nightEndHour) }}进入，计算总停车时长，超过阈值自动拉黑</li>
                            <li>📊 <strong>统计范围</strong>：仅针对学院新城车场（编码：76F1MLQKL）的临时车（enterVipType=1）</li>
                            <li>🔄 <strong>触发时机</strong>：车辆离场时自动检查停车时长并判断是否拉黑</li>
                            <li>✅ <strong>处理方式</strong>：自动调用ACMS接口拉黑，并记录详细日志</li>
                        </ul>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="collegeNewCityConfigShow = false">取消</el-button>
                    <el-button type="primary" @click="handleSaveCollegeNewCityConfig"
                        :loading="collegeNewCityConfigSaving">
                        保存配置
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 万象上东拉黑规则配置弹窗 -->
        <el-dialog title="万象上东拉黑规则配置" v-model="wanXiangConfigShow" width="1100px" class="wan-xiang-config-dialog">
            <div class="wan-xiang-config-content">
                <div class="config-info">
                    <p class="config-desc">配置万象上东过夜拉黑规则，仅针对 <code>万象上东</code> 车场生效</p>
                    <el-alert title="特别说明：业主名下所有车牌批量拉黑" type="warning" :closable="false" style="margin-top: 10px;"
                        show-icon>
                        <p style="font-size: 13px;">当检测到一辆车违规时，将拉黑该业主名下的所有车牌号</p>
                    </el-alert>
                </div>

                <el-form :model="wanXiangConfigForm" :rules="wanXiangConfigRules" ref="wanXiangConfigFormRef"
                    label-width="160px">

                    <!-- 夜间时间配置 -->
                    <el-divider content-position="left">
                        <span style="color: #409eff; font-weight: bold;">🌙 夜间时间配置</span>
                    </el-divider>

                    <el-form-item label="夜间时间段" prop="nightTimeRange">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <el-time-select v-model="wanXiangConfigForm.nightStartTime" placeholder="开始时间" start="00:00"
                                step="00:30" end="23:30" style="width: 140px;">
                            </el-time-select>
                            <span>至</span>
                            <el-time-select v-model="wanXiangConfigForm.nightEndTime" placeholder="结束时间" start="00:00"
                                step="00:30" end="23:30" style="width: 140px;">
                            </el-time-select>
                        </div>
                        <span class="form-tip">在此时间段内进场的车辆将被监控（推荐：23:00 至 06:00）</span>
                    </el-form-item>

                    <el-form-item label="停车时长阈值" prop="nightTimeHours">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>超过</span>
                            <el-input-number v-model="wanXiangConfigForm.nightTimeHours" :min="1" :max="24" :step="1"
                                controls-position="right" style="width: 120px;">
                            </el-input-number>
                            <span>小时自动拉黑</span>
                        </div>
                        <span class="form-tip">夜间进场车辆超过此时长将触发拉黑检查</span>
                    </el-form-item>

                    <!-- VIP月票类型配置 -->
                    <el-divider content-position="left">
                        <span style="color: #f56c6c; font-weight: bold;">🎫 VIP月票类型配置</span>
                    </el-divider>

                    <el-form-item label="检查模式" prop="vipCheckMode">
                        <el-radio-group v-model="wanXiangConfigForm.vipCheckMode">
                            <el-radio label="exclude">
                                <span style="display: inline-flex; align-items: center; gap: 4px;">
                                    <span>免检模式</span>
                                    <el-tooltip content="选择的VIP类型不进行检查" placement="top">
                                        <el-icon>
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </span>
                            </el-radio>
                            <el-radio label="include">
                                <span style="display: inline-flex; align-items: center; gap: 4px;">
                                    <span>待检查模式</span>
                                    <el-tooltip content="只检查选择的VIP类型" placement="top">
                                        <el-icon>
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </span>
                            </el-radio>
                        </el-radio-group>
                        <div class="form-tip" style="margin-top: 8px;">
                            🛡️ 免检模式：选中的VIP类型不检查；待检查模式：只检查选中的VIP类型
                        </div>
                    </el-form-item>

                    <el-form-item label="VIP月票类型" prop="vipTicketTypes">
                        <el-select v-model="wanXiangConfigForm.vipTicketTypes" placeholder="请选择VIP月票类型"
                            style="width: 100%;" :loading="ticketTypesLoading" clearable multiple>
                            <el-option v-for="ticketType in availableTicketTypes" :key="ticketType" :label="ticketType"
                                :value="ticketType" />
                        </el-select>
                        <div class="form-tip" style="margin-top: 8px;">
                            {{ wanXiangConfigForm.vipCheckMode === 'include' ?
                                '✅ 选中的月票类型将被检查，符合条件将拉黑业主名下所有车辆' :
                                '🛡️ 选中的月票类型将免检，不会被拉黑' }}
                        </div>
                    </el-form-item>

                    <!-- 黑名单配置 -->
                    <el-divider content-position="left">
                        <span style="color: #0284c7; font-weight: bold;">🛡️ 黑名单配置</span>
                    </el-divider>

                    <el-form-item label="黑名单类型" prop="blacklistName">
                        <el-select v-model="wanXiangConfigForm.blacklistName"
                            :placeholder="blacklistTypeLoading ? '加载中...' : '请选择黑名单类型'" :loading="blacklistTypeLoading"
                            style="width: 100%">
                            <el-option v-for="item in blacklistTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                                <span>{{ item.label }}</span>
                                <span v-if="item.description"
                                    style="color: #8492a6; font-size: 12px; margin-left: 8px;">
                                    ({{ item.description }})
                                </span>
                            </el-option>
                        </el-select>
                        <span class="form-tip">调用外部接口拉黑时使用的黑名单类型（如：万象上东违规月票车）</span>
                    </el-form-item>

                    <el-form-item label="拉黑时长" prop="blacklistDays">
                        <el-radio-group v-model="wanXiangConfigForm.isPermanent">
                            <el-radio :label="true">永久拉黑</el-radio>
                            <el-radio :label="false">临时拉黑</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="!wanXiangConfigForm.isPermanent" label="拉黑有效期" prop="blacklistValidDays">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <el-input-number v-model="wanXiangConfigForm.blacklistDays" :min="1" :max="365" :step="1"
                                controls-position="right" style="width: 150px;">
                            </el-input-number>
                            <span style="color: #606266; font-size: 14px;">天</span>
                        </div>
                        <span class="form-tip">拉黑有效天数，自动拉黑时从违规时间开始计算（1-365天）</span>
                    </el-form-item>

                    <!-- 🕐 超时推送时间段配置 -->
                    <el-divider content-position="left">
                        <span style="color: #10b981; font-weight: bold;">🕐 超时推送时间段配置</span>
                    </el-divider>

                    <el-form-item label="推送时间段" prop="notificationTimeRange">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <el-time-select v-model="wanXiangConfigForm.notificationStartTime" placeholder="开始时间"
                                start="00:00" step="00:30" end="23:30" style="width: 140px;">
                            </el-time-select>
                            <span>至</span>
                            <el-time-select v-model="wanXiangConfigForm.notificationEndTime" placeholder="结束时间"
                                start="00:00" step="00:30" end="23:30" style="width: 140px;">
                            </el-time-select>
                        </div>
                        <span class="form-tip">设置每天发送超时推送的时间段（建议：23:00 至 06:00）。支持跨日设置，如23:00-06:00表示晚上11点到早上6点</span>
                    </el-form-item>

                    <!-- 规则说明（可折叠） -->
                    <div class="wan-xiang-rules-container">
                        <el-collapse v-model="wanXiangRulesCollapse">
                            <el-collapse-item name="rules">
                                <template #title>
                                    <span class="collapse-title">
                                        <span>📋 规则说明（点击展开查看详细规则）</span>
                                    </span>
                                </template>
                                <div class="wan-xiang-rules-info">
                                    <div class="rules-grid">
                                        <div class="rule-item">
                                            <span class="rule-icon">🌙</span>
                                            <div class="rule-content">
                                                <strong>夜间进场监控</strong>
                                                <p>{{ wanXiangConfigForm.nightStartTime }}-{{
                                                    wanXiangConfigForm.nightEndTime
                                                    }}进场的车辆将被监控</p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">⏰</span>
                                            <div class="rule-content">
                                                <strong>停车时长检查</strong>
                                                <p>停车超过{{ wanXiangConfigForm.nightTimeHours }}小时触发检查</p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">🎫</span>
                                            <div class="rule-content">
                                                <strong>VIP类型检查</strong>
                                                <p v-if="wanXiangConfigForm.vipCheckMode === 'include'">
                                                    只检查{{ wanXiangConfigForm.vipTicketTypes &&
                                                        wanXiangConfigForm.vipTicketTypes.length > 0 ?
                                                    wanXiangConfigForm.vipTicketTypes.join('、') : '(未选择)' }}类型
                                                </p>
                                                <p v-else>
                                                    {{ wanXiangConfigForm.vipTicketTypes &&
                                                        wanXiangConfigForm.vipTicketTypes.length > 0 ?
                                                    wanXiangConfigForm.vipTicketTypes.join('、') : '(未选择)' }}类型免检
                                                </p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">🛡️</span>
                                            <div class="rule-content">
                                                <strong>黑名单类型</strong>
                                                <p>{{ wanXiangConfigForm.blacklistName ?
                                                    wanXiangConfigForm.blacklistName.split('|').slice(-1)[0] : '(未选择)'
                                                    }}</p>
                                            </div>
                                        </div>
                                        <div class="rule-item highlight">
                                            <span class="rule-icon">👥</span>
                                            <div class="rule-content">
                                                <strong>批量拉黑</strong>
                                                <p>检测到一辆违规车辆后，将查询该业主（通过手机号关联）名下的所有车牌号，并全部拉黑</p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">📊</span>
                                            <div class="rule-content">
                                                <strong>关联查询</strong>
                                                <p>通过 month_tick 表的 user_phone 字段关联业主所有车辆</p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">🔄</span>
                                            <div class="rule-content">
                                                <strong>触发时机</strong>
                                                <p>定时任务每分钟检查一次在场车辆</p>
                                            </div>
                                        </div>
                                        <div class="rule-item">
                                            <span class="rule-icon">✅</span>
                                            <div class="rule-content">
                                                <strong>处理方式</strong>
                                                <p>记录违规、本地拉黑、调用外部接口拉黑</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="wanXiangConfigShow = false">取消</el-button>
                    <el-button type="primary" @click="handleSaveWanXiangConfig" :loading="wanXiangConfigSaving">
                        保存配置
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 批量处理弹窗 -->
        <el-dialog title="批量处理违规记录" v-model="showBatchProcessDialog" width="600px" class="batch-process-dialog">
            <div class="batch-info">
                <el-alert
                    :title="batchProcessAll ? `将处理 ${batchTotalCount} 条违规记录（所有相关车辆）` : `已选择 ${multipleSelection.length} 条记录`"
                    :type="batchProcessAll ? 'warning' : 'info'" :closable="false" show-icon>
                    <template v-if="batchProcessAll">
                        <p style="margin-top: 8px; font-size: 13px;">
                            将处理所有选中车辆的全部未处理违规记录
                        </p>
                    </template>
                </el-alert>

                <!-- 🆕 车牌号折叠展示 -->
                <div class="plate-numbers-section" style="margin-top: 15px;">
                    <el-collapse v-model="batchPlateCollapse">
                        <el-collapse-item name="plates">
                            <template #title>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <el-icon>
                                        <CarFilled />
                                    </el-icon>
                                    <span style="font-weight: 500;">涉及车辆 ({{ batchPlateNumbers.length }} 辆)</span>
                                </div>
                            </template>
                            <div class="plate-numbers-list">
                                <el-tag v-for="(plate, index) in batchPlateNumbers" :key="index" type="info"
                                    size="small" style="margin: 4px;">
                                    {{ plate }}
                                </el-tag>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>

            <el-form label-width="110px" style="margin-top: 20px;">
                <!-- 🆕 处理方式选择 -->
                <el-form-item label="处理方式" required>
                    <el-radio-group v-model="batchBlacklistForm.processType">
                        <el-radio label="blacklist">
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <span>拉黑处理</span>
                                <el-tooltip content="违规属实，加入黑名单" placement="top">
                                    <el-icon>
                                        <WarningFilled />
                                    </el-icon>
                                </el-tooltip>
                            </span>
                        </el-radio>
                        <el-radio label="mistake">
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <span>误操作处理</span>
                                <el-tooltip content="误操作或特殊情况，仅标记已处理，不加入黑名单" placement="top">
                                    <el-icon>
                                        <InfoFilled />
                                    </el-icon>
                                </el-tooltip>
                            </span>
                        </el-radio>
                    </el-radio-group>
                    <div style="color: #909399; font-size: 12px; margin-top: 8px;">
                        💡 提示：误操作处理不会加入黑名单，适用于录入错误、特殊情况等场景
                    </div>
                </el-form-item>

                <el-form-item label="批量备注" :required="batchBlacklistForm.processType === 'mistake'">
                    <el-input type="textarea" v-model="batchProcessRemark"
                        :placeholder="batchBlacklistForm.processType === 'mistake' ? '请说明误操作原因（必填）...' : '请输入批量处理说明（可选）...'"
                        :rows="3" maxlength="200" show-word-limit>
                    </el-input>
                </el-form-item>

                <!-- 🆕 黑名单设置（仅拉黑处理时显示） -->
                <el-divider v-if="batchBlacklistForm.processType === 'blacklist'"
                    content-position="left">黑名单设置</el-divider>

                <el-form-item v-if="batchBlacklistForm.processType === 'blacklist'" label="黑名单类型" required>
                    <el-select v-model="batchBlacklistForm.blacklistType"
                        :placeholder="blacklistTypeLoading ? '加载中...' : '请选择黑名单类型'" :loading="blacklistTypeLoading"
                        style="width: 100%">
                        <el-option v-for="item in blacklistTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value">
                            <span>{{ item.label }}</span>
                            <span v-if="item.description" style="color: #8492a6; font-size: 12px; margin-left: 8px;">
                                {{ item.description }}
                            </span>
                        </el-option>
                    </el-select>
                    <div v-if="isDefaultBlacklistTypes" style="color: #e6a23c; font-size: 12px; margin-top: 4px;">
                        ⚠️ 使用默认黑名单类型（ACMS未配置）
                    </div>
                </el-form-item>

                <el-form-item v-if="batchBlacklistForm.processType === 'blacklist'" label="拉黑时长" required>
                    <el-radio-group v-model="batchBlacklistForm.isPermanent">
                        <el-radio :label="true">永久拉黑</el-radio>
                        <el-radio :label="false">临时拉黑</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="batchBlacklistForm.processType === 'blacklist' && !batchBlacklistForm.isPermanent"
                    label="拉黑时间段" required>
                    <el-date-picker v-model="batchBlacklistForm.blacklistDateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>

                <el-form-item v-if="batchBlacklistForm.processType === 'blacklist'" label="拉黑原因" required>
                    <el-input type="textarea" v-model="batchBlacklistForm.blacklistReason" placeholder="请输入拉黑原因（必填）..."
                        :rows="3" maxlength="200" show-word-limit>
                    </el-input>
                    <div style="margin-top: 8px;">
                        <el-tag v-for="(template, index) in blacklistReasonTemplates" :key="index" size="small"
                            style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
                            @click="batchBlacklistForm.blacklistReason = template">
                            {{ template }}
                        </el-tag>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showBatchProcessDialog = false">取消</el-button>
                    <el-button type="primary" @click="confirmBatchProcess" :loading="batchProcessing">
                        {{ batchBlacklistForm.processType === 'mistake' ? '确认批量处理（不拉黑）' : '确认批量处理并加入黑名单' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🆕 违规统计弹窗 -->
        <el-dialog title="违规数据统计" v-model="showStatisticsDialog" width="1200px" class="statistics-dialog">
            <!-- 时间选择器 -->
            <div class="time-selector">
                <el-date-picker
                    v-model="statisticsDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="handleDateRangeChange"
                    size="default"
                    style="margin-right: 12px;"
                />
                <el-button type="primary" @click="loadStatisticsData" :loading="statisticsLoading">
                    查询统计
                </el-button>
            </div>
            
            <div class="statistics-dialog-content" v-loading="statisticsLoading">
                <!-- 统计卡片 -->
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <el-icon><WarningFilled /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ violationStats.totalViolations || 0 }}</div>
                            <div class="stat-label">总违规数</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <el-icon><Clock /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ violationStats.pendingViolations || 0 }}</div>
                            <div class="stat-label">未处理</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon processed">
                            <el-icon><Check /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ violationStats.processedViolations || 0 }}</div>
                            <div class="stat-label">已处理</div>
                        </div>
                    </div>
                    
                </div>
                
                <!-- 违规趋势图表 -->
                <div class="single-chart">
                    <div class="chart-box">
                        <div class="chart-header">
                            <div class="header-content">
                                <h3 class="chart-title">
                                    <el-icon><TrendCharts /></el-icon>
                                    违规数量趋势分析
                                </h3>
                                <div class="chart-subtitle" v-if="statisticsDateRange && statisticsDateRange.length === 2">
                                    {{ formatDate(statisticsDateRange[0]) }} 至 {{ formatDate(statisticsDateRange[1]) }}
                                    <span class="total-count">· 共 {{ violationStats.totalViolations }} 条违规记录</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Top值提醒区域 -->
                        <div class="top-alerts" v-if="topAlerts && topAlerts.length > 0">
                            <div 
                                v-for="alert in topAlerts" 
                                :key="alert.type"
                                class="alert-item"
                                :class="alert.type"
                            >
                                <el-icon class="alert-icon">
                                    <component :is="alert.icon" />
                                </el-icon>
                                <span 
                                    class="alert-text" 
                                    v-if="!alert.isHtml"
                                >{{ alert.message }}</span>
                                <span 
                                    class="alert-text" 
                                    v-else
                                    v-html="alert.message"
                                ></span>
                            </div>
                        </div>
                        
                        <div ref="violationTrendChartRef" class="chart-content"></div>
                    </div>
                </div>
            </div>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showStatisticsDialog = false">关闭</el-button>
                    <el-button type="primary" @click="loadStatisticsData" :loading="statisticsLoading">
                        刷新数据
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref, watch, computed, onMounted, watchEffect } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { useStore } from "vuex";
import { violationApi } from "@/api/violation";
import { WarningFilled, Search, ArrowDown, View, Download, RefreshRight, Location, Clock, Phone, Picture, QuestionFilled, CarFilled, InfoFilled, TrendCharts, Check, UserFilled, PieChart, DataAnalysis } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { activityApi } from "@/api/activity";
import { getYardList } from "@/api/parkStaff";
// 导入违规提醒API
import { violationReminderApi, reminderUtils } from "@/api/violation-reminder-api";
// 🔐 导入车场权限管理工具
import { getManagedParks, isAdmin as checkIsAdmin } from '@/utils/parkAuth';

const router = useRouter();
const route = useRoute();
const store = useStore();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 🔒 车场权限相关
const isAdmin = ref(checkIsAdmin());
const managedParks = ref(getManagedParks() || []);

console.log('🔒 违规记录查询 - 车场权限信息:', {
    isAdmin: isAdmin.value,
    managedParks: managedParks.value
});

// 🔒 违规统计按钮显示条件：只有管理东北林业大学车场的用户才显示
const showStatisticsButton = computed(() => {
    console.log('🔍 [违规统计按钮] 开始检查显示条件:', {
        isAdmin: isAdmin.value,
        managedParks: managedParks.value,
        parksCount: managedParks.value.length
    });
    
    // 管理员显示
    if (isAdmin.value) {
        console.log('✅ [违规统计按钮] 管理员权限，显示按钮');
        return true;
    }
    
    // 检查用户管理的车场中是否包含东北林业大学相关车场
    const hasNEFUPark = managedParks.value.some(parkName => {
        const result = parkName.includes('东北林业大学');
        console.log(`  - 检查车场: "${parkName}", 包含东北林业大学: ${result}`);
        return result;
    });
    
    console.log(hasNEFUPark ? '✅ [违规统计按钮] 找到东北林业大学车场，显示按钮' : '❌ [违规统计按钮] 未找到东北林业大学车场，隐藏按钮');
    return hasNEFUPark;
});

// 🆕 车场列表选项（原始数据）
const communityOptions = ref([]);

// 🔐 车场选项（直接使用管理车场，无需过滤）
const filteredCommunityOptions = computed(() => {
    // 直接返回车场选项，因为已经是基于用户权限生成的
    return communityOptions.value;
});

// 🔐 根据用户权限判断是否显示配置按钮
const showNebuConfig = computed(() => {
    // 获取当前用户角色
    const roleName = localStorage.getItem('ms_role_name') || '';

    // 巡检员不显示此按钮
    if (roleName.includes('巡检员')) {
        return false;
    }

    if (isAdmin.value) return true;
    return managedParks.value.includes('东北林业大学');
});

const showCollegeNewCityConfig = computed(() => {
    if (isAdmin.value) return true;
    return managedParks.value.includes('学院新城');
});

const showWanXiangConfig = computed(() => {
    if (isAdmin.value) return true;
    return managedParks.value.includes('万象上东');
});

const showEuropeNewCityConfig = computed(() => {
    if (isAdmin.value) return true;
    return managedParks.value.includes('欧洲新城');
});

const props = [
    { label: "车牌号码", prop: "plateNumber" },
    { label: "违规类型", prop: "violationType" },
    { label: "违规位置", prop: "location" },
    { label: "车主姓名", prop: "ownerName" },
    { label: "车主电话", prop: "ownerPhone" },
    { label: "车主地址", prop: "ownerAddress" },
    { label: "创建时间", prop: "createdAt" },
];

const viewShow = ref(false);
const viewData = ref({});
const content1 = ref("");

// 🆕 月票车超时配置相关变量（欧洲新城）
const configShow = ref(false);
const configSaving = ref(false);
const configFormRef = ref(null);

// 🆕 东北林业大学违规阈值配置
const nebuConfigShow = ref(false);
const nebuConfigSaving = ref(false);
const nebuConfigFormRef = ref(null);

// 🆕 学院新城拉黑规则配置
const collegeNewCityConfigShow = ref(false);
const collegeNewCityConfigSaving = ref(false);
const collegeNewCityConfigFormRef = ref(null);

// 🆕 月票类型相关变量
const availableTicketTypes = ref([]); // 可选的月票类型列表
const ticketTypesLoading = ref(false); // 月票类型加载状态

// 🆕 折叠框控制变量
const activeCollapseNames = ref([]); // 默认折叠状态（空数组表示全部折叠）

// 欧洲新城配置表单
const configForm = reactive({
    parkCode: "2KPL6XFF",
    timeoutMinutes: 60,
    maxViolationCount: 5,
    // 过夜停车规则配置
    overnightTimeHours: 4,    // 跨日停车超过X小时算过夜违规
    // 🆕 免检月票类型
    exemptTicketTypes: ''     // 免检的月票类型
});

const configRules = {
    timeoutMinutes: [
        { required: true, message: '请选择超时时间', trigger: 'change' }
    ],
    maxViolationCount: [
        { required: true, message: '请选择累计次数', trigger: 'change' }
    ],
    overnightTimeHours: [
        { required: true, message: '请选择过夜判定时长', trigger: 'change' }
    ]
};

// 🆕 东北林业大学配置表单
const nebuConfigForm = reactive({
    parkName: "东北林业大学",
    maxViolationCount: 5,  // 默认5次
    // 🆕 黑名单配置
    blacklistType: "",     // 黑名单类型
    isPermanent: true,     // 是否永久拉黑
    blacklistValidDays: 30, // 临时拉黑有效期（天数）
    // 🆕 违规短信/提醒发送间隔（分钟）
    reminderIntervalMinutes: 30
});

const nebuConfigRules = {
    maxViolationCount: [
        { required: true, message: '请选择违规次数阈值', trigger: 'change' }
    ],
    blacklistType: [
        { required: true, message: '请选择黑名单类型', trigger: 'change' }
    ],
    reminderIntervalMinutes: [
        { required: true, message: '请输入提醒发送间隔（分钟）', trigger: 'change' }
    ]
};

// 🆕 学院新城配置表单
const collegeNewCityConfigForm = reactive({
    parkCode: "76F1MLQKL",        // 学院新城车场编码
    blacklistTimeHours: 1,        // 拉黑时长阈值（小时）
    // 🆕 黑名单配置
    blacklistType: "",            // 黑名单类型
    isPermanent: true,            // 是否永久拉黑
    blacklistValidDays: 30,       // 临时拉黑有效期（天数）
    // 🆕 凌晨进入时间段（可配置）
    nightStartHour: 0,            // 开始小时（0-23）
    nightEndHour: 7              // 结束小时（0-23）
});

const collegeNewCityConfigRules = {
    blacklistTimeHours: [
        { required: true, message: '请输入拉黑时长阈值', trigger: 'change' }
    ],
    blacklistType: [
        { required: true, message: '请选择黑名单类型', trigger: 'change' }
    ],
    nightTimeRange: [
        {
            validator: (_rule, _value, callback) => {
                if (collegeNewCityConfigForm.nightStartHour === undefined || collegeNewCityConfigForm.nightEndHour === undefined) {
                    callback(new Error('请选择凌晨时间段'));
                    return;
                }
                if (collegeNewCityConfigForm.nightStartHour >= collegeNewCityConfigForm.nightEndHour) {
                    callback(new Error('开始时间需小于结束时间'));
                    return;
                }
                callback();
            },
            trigger: 'change'
        }
    ]
};

// 🆕 万象上东拉黑规则配置
const wanXiangConfigShow = ref(false);
const wanXiangConfigSaving = ref(false);
const wanXiangConfigFormRef = ref(null);
const wanXiangRulesCollapse = ref([]);  // 默认折叠（空数组）

// 🆕 万象上东配置表单
const wanXiangConfigForm = reactive({
    parkCode: "2KST9MNP",           // 万象上东车场编码
    nightStartTime: "23:00",        // 夜间开始时间
    nightEndTime: "06:00",          // 夜间结束时间
    nightTimeHours: 2,              // 停车时长阈值（小时）
    vipCheckMode: "include",        // VIP检查模式：include=待检查，exclude=免检
    vipTicketTypes: [],             // VIP月票类型列表
    blacklistName: "",              // 黑名单类型（从下拉列表选择）
    isPermanent: true,              // 是否永久拉黑
    blacklistDays: 30,              // 临时拉黑有效期（天数）
    // 🕐 推送时间段配置
    notificationStartTime: "23:00",  // 推送开始时间
    notificationEndTime: "06:00"     // 推送结束时间
});

const wanXiangConfigRules = {
    parkCode: [
        { required: true, message: '请输入车场编码', trigger: 'change' }
    ],
    nightTimeHours: [
        { required: true, message: '请输入停车时长阈值', trigger: 'change' }
    ],
    vipCheckMode: [
        { required: true, message: '请选择检查模式', trigger: 'change' }
    ],
    blacklistName: [
        { required: true, message: '请输入黑名单名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    nightTimeRange: [
        {
            validator: (_rule, _value, callback) => {
                if (!wanXiangConfigForm.nightStartTime || !wanXiangConfigForm.nightEndTime) {
                    callback(new Error('请选择夜间时间段'));
                    return;
                }
                callback();
            },
            trigger: 'change'
        }
    ]
};

// 🔐 根据用户权限初始化默认车场
const getInitialCommunity = () => {
    if (!isAdmin.value && managedParks.value.length === 1) {
        // 普通用户且只有一个授权车场，默认选中
        return managedParks.value[0];
    }
    // 其他情况不设置默认值
    return "";
};

const query = reactive({
    plateNumber: "",        // 车牌号码
    ownerName: "",         // 车主姓名
    ownerPhone: "",        // 车主电话
    location: "",          // 违规位置
    violationType: "",     // 违规类型
    community: getInitialCommunity(),        // 🔐 根据权限初始化车场
    dateRange: [],        // 违规日期范围
    processStatus: "",    // 🆕 处理状态筛选
    processType: "",      // 🆕 处理方式筛选
    pageNum: 1,
    pageSize: 10,
});

// 🆕 批量处理相关变量
const multipleSelection = ref([]);           // 选中的记录
const showBatchProcessDialog = ref(false);   // 批量处理弹窗
const batchProcessRemark = ref("");          // 批量处理备注
const batchProcessing = ref(false);          // 批量处理中
const batchProcessAll = ref(false);          // 是否处理所有相关车辆的所有违规记录
const batchTotalCount = ref(0);              // 所有相关车辆的违规记录总数

// 🆕 批量处理黑名单表单
const batchBlacklistForm = ref({
    processType: 'blacklist',                // 处理方式：blacklist=拉黑，mistake=误操作
    shouldBlacklist: true,                   // 是否加入黑名单
    blacklistType: "",                       // 黑名单类型（从 ACMS接口动态获取）
    blacklistReason: "",                     // 拉黑原因
    isPermanent: true,                       // 是否永久拉黑
    blacklistDateRange: []                   // 拉黑时间段（临时拉黑时使用）
});

// 🆕 批量处理车牌号相关
const batchPlateNumbers = ref([]);          // 批量处理的车牌号列表
const batchPlateCollapse = ref(['plates']); // 折叠面板状态（默认展开）

// 🆕 违规统计相关变量
const showStatisticsDialog = ref(false);    // 统计弹窗显示状态
const statisticsLoading = ref(false);       // 统计数据加载状态
const statisticsDateRange = ref([]);        // 统计时间范围
const violationStats = ref({                // 违规统计数据
    totalViolations: 0,
    pendingViolations: 0,
    processedViolations: 0,
    blacklistedVehicles: 0
});
const topViolators = ref([]);               // 高频违规车辆Top10
const topViolatorsTimeRange = ref('30');    // 高频违规时间范围
const topAlerts = ref([]);                  // Top值提醒数据

// 图表实例引用
const violationTrendChartRef = ref(null);

// 图表实例
let violationTrendChart = null;

// 🆕 单条处理相关变量
const processShow = ref(false);              // 处理弹窗
const processing = ref(false);               // 单条处理中
const processForm = ref({
    id: null,
    plateNumber: "",
    violationType: "",
    processRemark: "",
    processAll: false,                       // 是否处理该车辆的所有违规记录
    violationCount: 1,                       // 该车辆的违规记录数量（默认至少1条）
    // 🆕 黑名单相关字段（处理违规记录必须拉黑）
    shouldBlacklist: true,                   // 是否加入黑名单（固定为true）
    blacklistType: "",                       // 黑名单类型（从ACMS接口动态获取）
    blacklistReason: "",                     // 拉黑原因
    isPermanent: true,                       // 是否永久拉黑
    blacklistDateRange: []                   // 拉黑时间段（临时拉黑时使用）
});

// 🆕 黑名单类型选项（从ACMS外部接口获取）
const blacklistTypeOptions = ref([]);
const blacklistTypeLoading = ref(false);
const isDefaultBlacklistTypes = ref(false);

// 🆕 黑名单原因模板
const blacklistReasonTemplates = ref([
    '占用他人车位',
    '占用消防通道，存在安全隐患',
    '多次违规停车',
    '恶意占用公共资源'
]);

// 🆕 计算属性：处理数量显示文本
const processCountText = computed(() => {
    if (processForm.value.processAll) {
        return `${processForm.value.violationCount} 条（全部）`;
    } else {
        return '1 条（当前）';
    }
});

const tableData = ref([]);
const originalData = ref([]); // 存储从后端获取的原始数据
const pageTotal = ref(0);
const filteredTotal = ref(0); // 存储过滤后的数据总数
const isFiltering = ref(false); // 标记是否正在使用前端过滤

// 存储过滤后的完整数据（用于前端分页）
const filteredFullData = ref([]);

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 查看操作
const handleView = (row) => {
    viewShow.value = true;
    viewData.value = { ...row };
};

//图片路径处理
const getAllPhotos = (photos) => {
    if (!photos) {
        return [];
    }
    try {
        // 如果photos是字符串，尝试解析为JSON数组
        let photoArray;
        if (typeof photos === 'string') {
            photoArray = JSON.parse(photos);
        } else if (Array.isArray(photos)) {
            photoArray = photos;
        } else {
            return [];
        }

        // 返回所有图片的URL数组
        if (photoArray && photoArray.length > 0) {
            return photoArray;
        }
    } catch (error) {
        console.error('解析photos数据失败:', error);
    }
    return [];
};

// 保留原有的getFirstPhoto函数用于其他地方
const getFirstPhoto = (photos) => {
    const allPhotos = getAllPhotos(photos);
    return allPhotos.length > 0 ? allPhotos[0] : '';
};

const previewImage = (imageUrl) => {
    ElMessageBox.alert('<img src="' + imageUrl + '" style="max-width: 100%; max-height: 100%;">', '违规停车图片预览', {
        dangerouslyUseHTMLString: true,
        showClose: true,
        closeOnClickModal: true,
        dialogClass: 'preview-dialog'
    })
}

// 格式化时间戳
const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// 获取违规类型颜色
const getViolationTypeColor = (type) => {
    const typeColorMap = {
        '违规停车': 'danger',
        '占用消防通道': 'danger',
        '占用绿化带': 'warning',
        '占用盲道': 'warning',
        '超时停车': 'info',
        '其他': 'info'
    };
    return typeColorMap[type] || 'info';
};

// 转换严重程度
const getSeverityText = (severity) => {
    const severityMap = {
        'mild': '轻微',
        'moderate': '中等',
        'severe': '严重'
    };
    return severityMap[severity] || severity;
};

// 前端过滤函数
const applyFrontendFilter = () => {
    console.log('=== 开始前端过滤 ===');
    console.log('原始数据长度:', originalData.value.length);
    console.log('过滤条件:', {
        车主姓名: query.ownerName,
        车主电话: query.ownerPhone,
        违规位置: query.location
    });

    let filteredData = [...originalData.value];

    // 检查是否有前端过滤条件
    const hasFrontendFilter = (query.ownerName && query.ownerName.trim()) ||
        (query.ownerPhone && query.ownerPhone.trim()) ||
        (query.location && query.location.trim());

    // 按车主姓名过滤
    if (query.ownerName && query.ownerName.trim()) {
        const ownerNameFilter = query.ownerName.trim().toLowerCase();
        filteredData = filteredData.filter(item => {
            const ownerName = item.ownerName || '';
            return ownerName.toLowerCase().includes(ownerNameFilter);
        });
        console.log('按车主姓名过滤后数据长度:', filteredData.length);
    }

    // 按车主电话过滤
    if (query.ownerPhone && query.ownerPhone.trim()) {
        const ownerPhoneFilter = query.ownerPhone.trim();
        filteredData = filteredData.filter(item => {
            const ownerPhone = item.ownerPhone || '';
            return ownerPhone.includes(ownerPhoneFilter);
        });
        console.log('按车主电话过滤后数据长度:', filteredData.length);
    }

    // 按违规位置过滤
    if (query.location && query.location.trim()) {
        const locationFilter = query.location.trim().toLowerCase();
        filteredData = filteredData.filter(item => {
            const location = item.location || '';
            return location.toLowerCase().includes(locationFilter);
        });
        console.log('按违规位置过滤后数据长度:', filteredData.length);
    }

    // 更新过滤状态和总数
    if (hasFrontendFilter) {
        isFiltering.value = true;
        filteredFullData.value = filteredData; // 保存完整的过滤数据
        filteredTotal.value = filteredData.length;

        // 前端分页处理
        const startIndex = (query.pageNum - 1) * query.pageSize;
        const endIndex = startIndex + query.pageSize;
        tableData.value = filteredData.slice(startIndex, endIndex);

        console.log('=== 前端过滤模式 ===');
        console.log('过滤后数据总数:', filteredTotal.value);
        console.log('当前页显示数据:', tableData.value.length);
    } else {
        isFiltering.value = false;
        filteredFullData.value = [];
        filteredTotal.value = pageTotal.value;
        tableData.value = filteredData; // 显示所有数据（后端已分页）
        console.log('=== 无前端过滤 ===');
        console.log('使用原始数据总数:', pageTotal.value);
    }

    console.log('=== 前端过滤完成 ===');
    console.log('最终显示数据长度:', tableData.value.length);
    console.log('分页显示总数:', isFiltering.value ? filteredTotal.value : pageTotal.value);
};

// 🆕 处理URL参数，自动填充搜索条件
const handleUrlParams = () => {
    const urlParams = route.query;
    console.log('🔍 URL参数:', urlParams);

    // 如果URL中有搜索参数，自动填充到搜索表单
    if (urlParams.plateNumber) {
        query.plateNumber = urlParams.plateNumber;
        console.log('🔍 自动填充车牌号:', urlParams.plateNumber);
    }
    // ✅ 启用车主姓名的自动填充
    if (urlParams.ownerName) {
        query.ownerName = urlParams.ownerName;
        console.log('🔍 自动填充车主姓名:', urlParams.ownerName);
    }
    if (urlParams.ownerPhone) {
        query.ownerPhone = urlParams.ownerPhone;
        console.log('🔍 自动填充车主电话:', urlParams.ownerPhone);
    }

    // 如果有任何搜索参数，自动展开搜索面板并自动搜索
    if (urlParams.plateNumber || urlParams.ownerName || urlParams.ownerPhone) {
        searchPanelExpanded.value = true;
        console.log('🔍 自动展开搜索面板，准备执行搜索');
    }
};

// 获取表格数据
const getData = () => {
    console.log('🔍 === getData 开始 ===');
    console.log('🔍 query.community 值:', query.community);
    console.log('🔍 query.community 类型:', typeof query.community);
    console.log('🔍 query 完整对象:', JSON.stringify(query, null, 2));

    const params = {
        page: query.pageNum,      // 后端接口使用 page 参数
        size: query.pageSize,     // 后端接口使用 size 参数
    };

    // 添加搜索条件，参数名与后端接口保持一致
    if (query.plateNumber && query.plateNumber.trim()) {
        params.plateNumber = query.plateNumber.trim();
    }
    // 注意：后端接口不支持按车主姓名、车主电话、违规位置搜索
    // 只保留后端实际支持的参数
    if (query.violationType && query.violationType.trim()) {
        params.violationType = query.violationType.trim();
    }
    if (query.status && query.status.trim()) {
        params.status = query.status.trim();
    }
    if (query.severity && query.severity.trim()) {
        params.severity = query.severity.trim();
    }

    console.log('🔍 检查 query.community 条件:');
    console.log('  - query.community:', query.community);
    console.log('  - 是否存在:', !!query.community);
    console.log('  - trim后:', query.community ? query.community.trim() : 'N/A');
    console.log('  - trim后是否为真:', query.community && query.community.trim() ? true : false);

    if (query.community && query.community.trim()) {
        params.community = query.community.trim();  // 后端接口使用 community
        console.log('✅ 设置了 params.community:', params.community);
    } else {
        console.log('❌ 未设置 params.community');
    }

    // 🆕 添加处理状态筛选参数
    if (query.processStatus && query.processStatus.trim()) {
        params.processStatus = query.processStatus.trim();
    }
    if (query.processType && query.processType.trim()) {
        params.processType = query.processType.trim();
    }

    // 处理日期范围
    if (query.dateRange && query.dateRange.length === 2) {
        params.startDate = query.dateRange[0] + ' 00:00:00';
        params.endDate = query.dateRange[1] + ' 23:59:59';
    }
    // 添加用户角色参数（从store获取）
    const userInfo = store.getters.getUserInfo;
    if (userInfo && userInfo.role) {
        params.userRole = userInfo.role;
    }

    violationApi
        .getViolations(params)
        .then((res) => {
            console.log('🚀 ~ file: IllegalRegiste.vue:29 ~ getViolations ~ res:', res);
            // 确保 tableData 始终是数组
            if (res.data.data && res.data.data.records && Array.isArray(res.data.data.records)) {
                let records = res.data.data.records;
                
                // 🔒 车场权限过滤：只显示用户管理的车场数据
                if (!isAdmin.value && managedParks.value.length > 0) {
                    const beforeFilter = records.length;
                    
                    // 🐛 详细调试：查看每条数据的parkName
                    const parkNames = [...new Set(records.map(item => item.parkName || '未知'))];
                    const sampleData = records.slice(0, 3).map(item => ({
                        plateNumber: item.plateNumber,
                        parkName: item.parkName,
                        matched: managedParks.value.includes(item.parkName)
                    }));
                    
                    console.log('🔍 [车场过滤] 过滤前详情:', {
                        管理车场列表: Array.from(managedParks.value),
                        数据中的车场: parkNames,
                        样例数据: sampleData,
                        总数: beforeFilter
                    });
                    
                    records = records.filter(item => {
                        // 如果没有parkName字段，则保留（兼容处理）
                        if (!item.parkName) {
                            console.log('⚠️ [车场过滤] 发现没有parkName的数据:', item.plateNumber);
                            return true;
                        }
                        // 检查车场名称是否在用户管理的车场列表中
                        return managedParks.value.includes(item.parkName);
                    });
                    
                    console.log('🔒 [表格数据] 车场权限过滤:', {
                        过滤前: beforeFilter,
                        过滤后: records.length,
                        被过滤: beforeFilter - records.length
                    });
                    
                    if (beforeFilter === records.length) {
                        console.log('✅ [车场过滤] 所有数据都属于用户管理的车场');
                    }
                } else {
                    console.log('🔒 [表格数据] 管理员权限，显示所有车场数据');
                }
                
                originalData.value = records; // 保存过滤后的数据
                pageTotal.value = res.data.data.total || 0; // 使用后端返回的总数
                
                console.log('📊 [表格数据] 最终数据统计:', {
                    后端总数: res.data.data.total,
                    当前页数据: records.length,
                    当前页码: query.pageNum,
                    每页条数: query.pageSize
                });

                // 🐛 调试：打印第一条数据的字段
                if (originalData.value.length > 0) {
                    // console.log('完整数据:', originalData.value);
                }

                // 🆕 批量获取每个车牌的违规次数
                batchGetViolationCounts(originalData.value).then(() => {
                    // 应用前端过滤
                    applyFrontendFilter();
                });
            } else if (res.data && Array.isArray(res.data)) {
                let records = res.data;
                
                // 🔒 车场权限过滤：只显示用户管理的车场数据
                if (!isAdmin.value && managedParks.value.length > 0) {
                    const beforeFilter = records.length;
                    
                    const parkNames = [...new Set(records.map(item => item.parkName || '未知'))];
                    console.log('🔍 [车场过滤] 过滤前详情:', {
                        管理车场: Array.from(managedParks.value),
                        数据车场: parkNames
                    });
                    
                    records = records.filter(item => {
                        if (!item.parkName) return true;
                        return managedParks.value.includes(item.parkName);
                    });
                    
                    console.log('🔒 [表格数据] 车场权限过滤:', {
                        过滤前: beforeFilter,
                        过滤后: records.length,
                        被过滤: beforeFilter - records.length
                    });
                }
                
                originalData.value = records; // 保存过滤后的数据
                pageTotal.value = records.length; // 使用过滤后的数据总数

                // 🆕 批量获取每个车牌的违规次数
                batchGetViolationCounts(originalData.value).then(() => {
                    // 应用前端过滤
                    applyFrontendFilter();
                });
            } else {
                console.warn('API返回的数据格式不正确:', res.data);
                originalData.value = [];
                tableData.value = [];
                pageTotal.value = 0;
                filteredTotal.value = 0;
                isFiltering.value = false;
            }
        })
        .catch((error) => {
            console.log('=== API请求失败 ===');
            console.error('获取violations数据失败:', error);
            console.error('错误详情:', error.response);
            console.error('错误状态码:', error.response?.status);
            console.error('错误消息:', error.message);
            ElMessage.error('获取违规数据失败: ' + (error.message || '未知错误'));
            originalData.value = [];
            tableData.value = [];
            pageTotal.value = 0;
            filteredTotal.value = 0;
            isFiltering.value = false;
        });
    console.log('tableData:', tableData.value);
};

/**
 * 🆕 批量获取违规次数
 * 为每个车牌查询未处理的违规记录数量，用于显示徽章
 */
const batchGetViolationCounts = async (records) => {
    if (!records || records.length === 0) return;

    // 提取所有不重复的车牌号
    const plateNumbers = [...new Set(records.map(r => r.plateNumber).filter(Boolean))];

    // 并行查询每个车牌的违规次数
    const countPromises = plateNumbers.map(async (plateNumber) => {
        try {
            const response = await violationApi.getViolations({
                plateNumber: plateNumber,
                processStatus: 'pending', // 只统计未处理的
                page: 1,
                size: 1 // 只需要total
            });
            const count = response.data?.data?.total || 0;
            return { plateNumber, count };
        } catch (error) {
            return { plateNumber, count: 0 };
        }
    });

    try {
        const results = await Promise.all(countPromises);

        // 创建车牌号到违规次数的映射
        const countMap = {};
        results.forEach(({ plateNumber, count }) => {
            countMap[plateNumber] = count;
        });

        // 将违规次数附加到每条记录
        records.forEach(record => {
            record.violationCount = countMap[record.plateNumber] || 0;
        });
    } catch (error) {
        console.error('❌ [违规次数] 批量查询失败:', error);
    }
};

// 🆕 处理URL参数
handleUrlParams();

getData();

// 🆕 加载黑名单类型列表（按名称，兼容旧逻辑）
const loadBlacklistTypes = async () => {
    blacklistTypeLoading.value = true;

    try {
        console.log('📋 [黑名单类型] 开始加载黑名单类型列表...');

        const response = await violationApi.getBlacklistTypes('东北林业大学');
        console.log('黑名单类型响应：', response);

        if (response.data?.code === "0") {
            const { blacklistTypes, isDefault } = response.data.data;

            // 转换数据格式：{ code, name, description } => { label, value: "code|name" }
            // value 格式为 "code|name"，方便后端解析
            blacklistTypeOptions.value = (blacklistTypes || []).map(type => ({
                label: type.name,
                value: `${type.code}|${type.name}`,  // 🔑 格式：code|name
                description: type.description
            }));

            isDefaultBlacklistTypes.value = isDefault || false;

            console.log('✅ [黑名单类型] 加载成功:', {
                count: blacklistTypeOptions.value.length,
                isDefault: isDefaultBlacklistTypes.value,
                types: blacklistTypeOptions.value
            });

            // 如果是默认数据，给出提示
            if (isDefaultBlacklistTypes.value) {
                console.warn('⚠️ [黑名单类型] 使用默认黑名单类型（ACMS未配置）');
            }

            // 设置默认选中第一个类型
            if (blacklistTypeOptions.value.length > 0) {
                processForm.value.blacklistType = blacklistTypeOptions.value[0].value;
                batchBlacklistForm.value.blacklistType = blacklistTypeOptions.value[0].value;
            }
        } else {
            throw new Error(response.data?.msg || '获取黑名单类型失败');
        }
    } catch (error) {
        console.error('❌ [黑名单类型] 加载失败:', error);

        // 使用本地兜底数据（格式：code|name）
        blacklistTypeOptions.value = [
            { label: '违规黑名单', value: 'local_violation|违规黑名单', description: '因违规停车被加入黑名单' },
            { label: '安全黑名单', value: 'local_security|安全黑名单', description: '因安全原因被加入黑名单' }
        ];
        isDefaultBlacklistTypes.value = true;
        processForm.value.blacklistType = 'local_violation|违规黑名单';
        batchBlacklistForm.value.blacklistType = 'local_violation|违规黑名单';

        console.warn('⚠️ [黑名单类型] 使用本地兜底数据');
    } finally {
        blacklistTypeLoading.value = false;
    }
};

// 🆕 按车场编码加载黑名单类型（外部API，供学院新城等使用）
const loadBlacklistTypesForPark = async (parkCode) => {
    blacklistTypeLoading.value = true;

    try {
        console.log('📋 [黑名单类型] 按车场编码加载列表...', parkCode);

        const response = await violationApi.getBlacklistTypesByParkCode(parkCode);
        console.log('黑名单类型响应（按编码）：', response);

        const ok = response?.data?.code === "0" || response?.data?.status === 1 || response?.data?.resultCode === 0;
        const recordList = response?.data?.data?.recordList || response?.data?.data?.data?.recordList || [];

        if (ok && Array.isArray(recordList)) {
            blacklistTypeOptions.value = recordList.map(item => ({
                label: item.name,
                value: `${item.id}|${item.name}`
            }));

            isDefaultBlacklistTypes.value = false;

            if (blacklistTypeOptions.value.length > 0) {
                processForm.value.blacklistType = blacklistTypeOptions.value[0].value;
                batchBlacklistForm.value.blacklistType = blacklistTypeOptions.value[0].value;
            }
        } else {
            throw new Error(response.data?.msg || '获取黑名单类型失败');
        }
    } catch (error) {
        console.error('❌ [黑名单类型] 按车场编码加载失败:', error);
        // 兜底数据
        blacklistTypeOptions.value = [
            { label: '违规黑名单', value: 'local_violation|违规黑名单', description: '因违规停车被加入黑名单' },
            { label: '安全黑名单', value: 'local_security|安全黑名单', description: '因安全原因被加入黑名单' }
        ];
        isDefaultBlacklistTypes.value = true;
        processForm.value.blacklistType = 'local_violation|违规黑名单';
        batchBlacklistForm.value.blacklistType = 'local_violation|违规黑名单';
    } finally {
        blacklistTypeLoading.value = false;
    }
};

// 🆕 违规统计相关函数

// 加载违规统计数据
const loadViolationStatistics = async () => {
    try {
        statisticsLoading.value = true;
        console.log('📊 开始加载违规统计数据...');

        // 模拟统计数据（实际使用时可以调用后端API）
        const response = await violationApi.getViolations({
            pageNum: 1,
            pageSize: 1000,
            processStatus: ''
        });

        const allData = response.data?.data?.records || response.data || [];

        violationStats.value = {
            totalViolations: allData.length,
            pendingViolations: allData.filter(item => item.processStatus === 'pending').length,
            processedViolations: allData.filter(item => item.processStatus === 'processed').length,
            blacklistedVehicles: new Set(allData.filter(item => item.processStatus === 'processed').map(item => item.plateNumber)).size
        };

        console.log('✅ 违规统计数据加载成功:', violationStats.value);
    } catch (error) {
        console.error('❌ 加载违规统计数据失败:', error);
        // 使用默认数据
        violationStats.value = {
            totalViolations: 0,
            pendingViolations: 0,
            processedViolations: 0,
            blacklistedVehicles: 0
        };
    } finally {
        statisticsLoading.value = false;
    }
};

// 加载高频违规车辆Top10
const loadTopViolators = async () => {
    try {
        console.log(`📊 开始加载高频违规车辆Top10（近${topViolatorsTimeRange.value}天）...`);

        // 获取所有违规记录
        const response = await violationApi.getViolations({
            pageNum: 1,
            pageSize: 1000
        });

        const allData = response.data?.data?.records || response.data || [];

        // 按车牌号统计违规次数
        const plateMap = new Map();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(topViolatorsTimeRange.value));

        allData.forEach(item => {
            const violationDate = new Date(item.createdAt);
            if (violationDate >= cutoffDate) {
                const plateNumber = item.plateNumber;
                if (!plateMap.has(plateNumber)) {
                    plateMap.set(plateNumber, {
                        plateNumber,
                        violationCount: 0,
                        violationTypes: new Set(),
                        lastViolationTime: null
                    });
                }
                const plateData = plateMap.get(plateNumber);
                plateData.violationCount += 1;

                // 收集违规类型
                if (item.violationType) {
                    plateData.violationTypes.add(item.violationType);
                }

                // 更新最后违规时间
                if (!plateData.lastViolationTime || violationDate > new Date(plateData.lastViolationTime)) {
                    plateData.lastViolationTime = item.createdAt;
                }
            }
        });

        // 转换为数组并排序，取Top10
        topViolators.value = Array.from(plateMap.values())
            .map(item => ({
                ...item,
                violationTypes: Array.from(item.violationTypes).join(', ')
            }))
            .sort((a, b) => b.violationCount - a.violationCount)
            .slice(0, 10);

        console.log('✅ 高频违规车辆Top10加载成功:', topViolators.value);
    } catch (error) {
        console.error('❌ 加载高频违规车辆失败:', error);
        topViolators.value = [];
    }
};

// 刷新统计数据
const refreshStatistics = async () => {
    await Promise.all([
        loadViolationStatistics(),
        loadTopViolators()
    ]);
};

// 获取排名样式类
const getRankClass = (index) => {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    if (index === 2) return 'rank-third';
    return 'rank-normal';
};

// 获取车牌类型样式类
const getPlateTypeClass = (plateNumber) => {
    if (!plateNumber) return 'normal-plate';
    // 新能源车牌判断（绿牌）
    if (plateNumber.length === 8 && /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}[A-Z0-9]$/.test(plateNumber)) {
        return 'new-energy-plate';
    }
    return 'normal-plate';
};

// 获取进度条宽度
const getProgressWidth = (current, max) => {
    if (!max || max === 0) return '0%';
    const percentage = Math.round((current / max) * 100);
    return `${Math.min(percentage, 100)}%`;
};

// 页面加载时获取黑名单类型（默认按学校名称，供全局处理使用）
loadBlacklistTypes();

// 初始化图表
const initCharts = () => {
    if (violationTrendChartRef.value) {
        violationTrendChart = echarts.init(violationTrendChartRef.value);
    }
};

// 渲染违规趋势折线图
const renderViolationTrendChart = (data, topViolatingPlates = []) => {
    console.log('📈 开始渲染趋势图表, 数据条数:', data?.length);
    
    if (!violationTrendChart) {
        console.error('❌ 图表实例未初始化');
        return;
    }
    
    if (!data || data.length === 0) {
        console.warn('⚠️ 数据为空，显示空状态');
        const emptyOption = {
            title: {
                text: '暂无数据',
                left: 'center',
                top: 'center',
                textStyle: {
                    fontSize: 16,
                    color: '#9ca3af'
                }
            }
        };
        violationTrendChart.setOption(emptyOption);
        return;
    }
    
    // 按日期聚合数据
    const dateMap = new Map();
    let processedCount = 0;
    
    data.forEach((item, index) => {
        if (item.createdAt !== undefined && item.createdAt !== null) {
            // 处理不同的日期格式
            let date = '';
            try {
                if (typeof item.createdAt === 'number') {
                    // 如果是数字时间戳，转换为日期
                    const dateObj = new Date(item.createdAt);
                    date = formatDate(dateObj);

                } else if (typeof item.createdAt === 'string') {
                    // 如果是字符串，先尝试解析为数字
                    const timestamp = parseInt(item.createdAt);
                    if (!isNaN(timestamp) && timestamp > 1000000000000) {
                        // 看起来像是时间戳
                        const dateObj = new Date(timestamp);
                        date = formatDate(dateObj);
                    } else {
                        // 正常的日期字符串
                        if (item.createdAt.includes('T')) {
                            date = item.createdAt.split('T')[0];
                        } else if (item.createdAt.includes(' ')) {
                            date = item.createdAt.split(' ')[0];
                        } else {
                            date = item.createdAt.substring(0, 10);
                        }
                        // 🐛 修复：将斜杠格式转换为短横线格式 (2025/11/20 → 2025-11-20)
                        date = date.replace(/\//g, '-');
                        console.log(`字符串日期转换 [${index}]:`, item.createdAt, '→', date);
                    }
                } else if (item.createdAt instanceof Date) {
                    date = formatDate(item.createdAt);
                    console.log(`Date对象转换 [${index}]:`, item.createdAt, '→', date);
                }
                
                if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateMap.set(date, (dateMap.get(date) || 0) + 1);
                    processedCount++;
                } else {
                    console.warn(`日期格式不正确 [${index}]:`, item.createdAt, '→', date);
                }
            } catch (error) {
                console.error(`处理日期错误 [${index}]:`, item.createdAt, error);
            }
        } else {
            console.warn(`缺少createdAt字段 [${index}]:`, item);
        }
    });
    
    console.log('📅 日期聚合结果:', {
        原始数据条数: data.length,
        处理成功条数: processedCount,
        日期数量: dateMap.size,
        日期列表: Array.from(dateMap.keys()).sort()
    });
    
    if (dateMap.size === 0) {
        console.warn('⚠️ 没有有效的日期数据');
        const noDateOption = {
            title: {
                text: '数据中缺少有效日期',
                left: 'center',
                top: 'center',
                textStyle: {
                    fontSize: 16,
                    color: '#f59e0b'
                }
            }
        };
        violationTrendChart.setOption(noDateOption);
        return;
    }
    
    // 排序日期并获取对应的数量
    const dates = Array.from(dateMap.keys()).sort();
    const counts = dates.map(date => dateMap.get(date));
    
    console.log('📈 图表数据:', { dates, counts });
    
    // 计算统计数据
    const maxValue = Math.max(...counts);
    const minValue = Math.min(...counts);
    const avgValue = (counts.reduce((sum, val) => sum + val, 0) / counts.length).toFixed(1);
    const maxIndex = counts.indexOf(maxValue);
    const minIndex = counts.indexOf(minValue);
    
    // 生成Top值提醒
    generateTopAlerts({
        maxValue,
        minValue,
        avgValue: parseFloat(avgValue),
        maxDate: dates[maxIndex],
        minDate: dates[minIndex],
        totalDays: dates.length,
        totalViolations: data.length,
        dates,
        counts,
        topViolatingPlates
    });
    
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: `总计: ${data.length} 条违规记录`,
            left: 'center',
            top: 5,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1f2937'
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
                color: '#374151',
                fontSize: 13
            },
            formatter: (params) => {
                const param = params[0];
                const date = param.axisValue;
                const value = param.value;
                const percentage = ((value / data.length) * 100).toFixed(1);
                
                return `
                    <div style="padding: 8px;">
                        <div style="font-weight: bold; margin-bottom: 6px; color: #1f2937;">${date}</div>
                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #667eea; border-radius: 50%; margin-right: 6px;"></span>
                            <span>违规数量: <strong>${value}</strong> 条</span>
                        </div>
                        <div style="font-size: 12px; color: #6b7280;">占总数的 ${percentage}%</div>
                    </div>
                `;
            },
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#667eea',
                    width: 1,
                    type: 'dashed'
                }
            }
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '8%',
            top: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLabel: {
                rotate: 45,
                color: '#6b7280',
                fontSize: 11,
                formatter: (value) => {
                    return value.substring(5);
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#e5e7eb'
                }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: '违规数量',
            nameTextStyle: {
                color: '#6b7280',
                fontSize: 12
            },
            minInterval: 1,
            axisLabel: {
                color: '#6b7280',
                fontSize: 11
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6',
                    type: 'dashed'
                }
            }
        },
        series: [{
            name: '违规数量',
            type: 'line',
            smooth: true,
            data: counts,
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                    { offset: 0.5, color: 'rgba(99, 102, 241, 0.15)' },
                    { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                ])
            },
            lineStyle: {
                color: '#6366f1',
                width: 3,
                shadowColor: 'rgba(99, 102, 241, 0.3)',
                shadowBlur: 10,
                shadowOffsetY: 3
            },
            itemStyle: {
                color: '#6366f1',
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: 'rgba(99, 102, 241, 0.5)',
                shadowBlur: 8
            },
            emphasis: {
                itemStyle: {
                    color: '#4f46e5',
                    borderWidth: 3,
                    shadowBlur: 15
                },
                lineStyle: {
                    width: 4
                }
            },
            markPoint: {
                symbol: 'pin',
                symbolSize: 50,
                data: [
                    {
                        name: '最高值',
                        value: maxValue,
                        xAxis: dates[maxIndex],
                        yAxis: maxValue,
                        itemStyle: {
                            color: '#ef4444'
                        },
                        label: {
                            formatter: '最高\n{c}条',
                            fontSize: 11,
                            fontWeight: 'bold'
                        }
                    },
                    {
                        name: '最低值',
                        value: minValue,
                        xAxis: dates[minIndex],
                        yAxis: minValue,
                        itemStyle: {
                            color: '#10b981'
                        },
                        label: {
                            formatter: '最低\n{c}条',
                            fontSize: 11,
                            fontWeight: 'bold'
                        }
                    }
                ]
            },
            markLine: {
                silent: true,
                lineStyle: {
                    color: '#f59e0b',
                    type: 'dashed',
                    width: 2
                },
                data: [
                    {
                        type: 'average',
                        name: '平均值',
                        label: {
                            formatter: '平均: {c}条',
                            position: 'end',
                            fontSize: 11,
                            color: '#f59e0b',
                            fontWeight: 'bold'
                        }
                    }
                ]
            }
        }]
    };
    
    violationTrendChart.setOption(option);
};

// 格式化车牌号码为带样式的HTML
const formatPlateNumberWithStyle = (plateNumber) => {
    if (!plateNumber) return '';
    const plateType = getPlateType(plateNumber);
    return `<span class="styled-plate-number ${plateType}">${plateNumber}</span>`;
};

// 生成Top值提醒（主要显示高频违规车牌）
const generateTopAlerts = (stats) => {
    const alerts = [];
    const { topViolatingPlates } = stats;
    
    // 高频违规车牌提醒
    if (topViolatingPlates && topViolatingPlates.length > 0) {
        const topPlate = topViolatingPlates[0];
        
        // 最高违规车牌提醒
        if (topPlate.count >= 10) {
            alerts.push({
                type: 'danger',
                icon: 'WarningFilled',
                message: `车牌 ${formatPlateNumberWithStyle(topPlate.plateNumber)} 违规 ${topPlate.count} 次，为最高频违规车辆，建议立即处理！`,
                isHtml: true
            });
        } else if (topPlate.count >= 5) {
            alerts.push({
                type: 'warning',
                icon: 'CarFilled',
                message: `车牌 ${formatPlateNumberWithStyle(topPlate.plateNumber)} 违规 ${topPlate.count} 次，需要重点关注`,
                isHtml: true
            });
        }
        
        // Top3车牌提醒
        const top3 = topViolatingPlates.slice(0, 3);
        if (top3.length >= 3) {
            const plateList = top3.map(p => `${formatPlateNumberWithStyle(p.plateNumber)}(${p.count}次)`).join('、');
            alerts.push({
                type: 'info',
                icon: 'InfoFilled',
                message: `违规次数Top3车牌：${plateList}`,
                isHtml: true
            });
        }
        
        // 多辆高频违规提醒
        const highFrequencyPlates = topViolatingPlates.filter(p => p.count >= 3);
        if (highFrequencyPlates.length >= 5) {
            alerts.push({
                type: 'warning',
                icon: 'WarningFilled',
                message: `发现 ${highFrequencyPlates.length} 辆车违规次数超过3次，建议加强管理力度`
            });
        }
        
        // 重复违规者提醒
        const repeatOffenders = topViolatingPlates.filter(p => p.count >= 8);
        if (repeatOffenders.length > 0) {
            const plateNames = repeatOffenders.map(p => formatPlateNumberWithStyle(p.plateNumber)).join('、');
            alerts.push({
                type: 'danger',
                icon: 'UserFilled',
                message: `重复违规者：${plateNames}，建议采取严厉措施`,
                isHtml: true
            });
        }
    }
    
    // 日均违规数提醒
    if (stats.avgValue >= 5) {
        alerts.push({
            type: 'warning',
            icon: 'TrendCharts',
            message: `日均违规数 ${stats.avgValue} 条，超出正常范围`
        });
    } else if (stats.avgValue <= 1) {
        alerts.push({
            type: 'success',
            icon: 'Check',
            message: `日均违规数仅 ${stats.avgValue} 条，管理效果良好！`
        });
    }
    
    // 单日最高值提醒
    if (stats.maxValue >= 8) {
        alerts.push({
            type: 'warning',
            icon: 'WarningFilled',
            message: `${stats.maxDate} 单日违规数达 ${stats.maxValue} 条，需重点关注`
        });
    }
    
    topAlerts.value = alerts;
    console.log('🚨 生成车牌Top提醒:', alerts);
};

// 格式化日期为yyyy-MM-dd
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 加载统计数据（包含所有图表）
const loadStatisticsData = async () => {
    try {
        statisticsLoading.value = true;
        console.log('📊 开始加载统计数据...');
        console.log('📅 当前选择的时间范围:', statisticsDateRange.value);
        
        // 构建查询参数 - 测试不同的分页参数名
        const params = {
            // 常见的分页参数名
            pageNum: 1,
            pageSize: 1000,
            current: 1,     // MyBatis Plus 常用
            size: 1000,     // MyBatis Plus 常用
            page: 1,        // 一些框架使用
            limit: 1000,    // 一些框架使用
            offset: 0       // 偏移量
        };
        
        // 🔒 带上主表格的车场筛选条件，确保统计数据与主表格一致
        if (query.community && query.community.trim()) {
            params.community = query.community.trim();
            console.log('🏢 统计查询带上车场条件:', params.community);
        }
        
        // 如果选择了时间范围
        if (statisticsDateRange.value && statisticsDateRange.value.length === 2) {
            params.startDate = formatDate(statisticsDateRange.value[0]);
            params.endDate = formatDate(statisticsDateRange.value[1]);
            console.log('📅 查询时间范围:', params.startDate, '至', params.endDate);
            console.log('📅 原始Date对象:', statisticsDateRange.value[0], '至', statisticsDateRange.value[1]);
        } else {
            console.warn('⚠️ 未选择时间范围，将查询所有数据');
        }
        
        console.log('🔍 API请求参数:', JSON.stringify(params, null, 2));
        
        let allData = [];
        let currentPage = 1;
        let totalPages = 1;
        
        // 循环获取所有分页数据
        do {
            const currentParams = { ...params, pageNum: currentPage };
            console.log(`🔍 请求第${currentPage}页数据，参数:`, currentParams);
            
            const response = await violationApi.getViolations(currentParams);
            console.log(`📡 第${currentPage}页API响应:`, {
                status: response.status,
                dataStructure: response.data ? Object.keys(response.data) : 'no data',
                recordsCount: response.data?.data?.records?.length || 0,
                totalCount: response.data?.data?.total || 'unknown',
                currentPage: response.data?.data?.current || currentPage,
                totalPages: response.data?.data?.pages || 1
            });
            
            const pageData = response.data?.data?.records || response.data || [];
            allData = allData.concat(pageData);
            
            // 更新分页信息
            totalPages = response.data?.data?.pages || 1;
            const totalCount = response.data?.data?.total || 0;
            
            console.log(`📊 已获取 ${allData.length}/${totalCount} 条数据`);
            
            currentPage++;
            
            // 防止无限循环
            if (currentPage > 100) {
                console.warn('⚠️ 达到最大页数限制，停止获取');
                break;
            }
        } while (currentPage <= totalPages);
        
        console.log('📊 最终获取到的数据总数:', allData.length);
        
        // 🔒 车场权限过滤
        let filteredData = allData;
        if (!isAdmin.value && managedParks.value.length > 0) {
            const beforeFilter = allData.length;
            filteredData = allData.filter(item => {
                // 如果没有parkName字段，则保留（兼容处理）
                if (!item.parkName) return true;
                // 检查车场名称是否在用户管理的车场列表中
                return managedParks.value.includes(item.parkName);
            });
            console.log('🔒 车场权限过滤:', {
                过滤前: beforeFilter,
                过滤后: filteredData.length,
                管理车场: managedParks.value
            });
        } else {
            console.log('🔒 管理员权限，显示所有车场数据');
        }
        
        console.log('📊 权限过滤后的数据总数:', filteredData.length);
        
        // 更新统计卡片数据（使用过滤后的数据）
        violationStats.value = {
            totalViolations: filteredData.length,
            pendingViolations: filteredData.filter(item => item.processStatus === 'pending').length,
            processedViolations: filteredData.filter(item => item.processStatus === 'processed').length,
            blacklistedVehicles: new Set(filteredData.filter(item => item.processStatus === 'processed').map(item => item.plateNumber)).size
        };
        
        // 分析数据的时间分布（使用过滤后的数据）
        if (filteredData.length > 0) {
            const timeAnalysis = {
                总数据量: filteredData.length,
                时间字段类型: typeof filteredData[0].createdAt,
                最早时间: null,
                最晚时间: null,
                样例数据: filteredData.slice(0, 3).map(item => ({
                    plateNumber: item.plateNumber,
                    createdAt: item.createdAt,
                    processStatus: item.processStatus,
                    parkName: item.parkName
                }))
            };
            
            // 计算时间范围
            const timestamps = filteredData
                .map(item => typeof item.createdAt === 'number' ? item.createdAt : parseInt(item.createdAt))
                .filter(ts => !isNaN(ts))
                .sort((a, b) => a - b);
                
            if (timestamps.length > 0) {
                timeAnalysis.最早时间 = formatDate(new Date(timestamps[0]));
                timeAnalysis.最晚时间 = formatDate(new Date(timestamps[timestamps.length - 1]));
            }
            
            console.log('📊 数据时间分析:', timeAnalysis);
        }
        
        console.log('📊 准备渲染趋势图表...');
        
        // 计算车牌违规排行（使用过滤后的数据）
        const plateViolationMap = new Map();
        filteredData.forEach(item => {
            const plateNumber = item.plateNumber;
            if (plateNumber) {
                plateViolationMap.set(plateNumber, (plateViolationMap.get(plateNumber) || 0) + 1);
            }
        });
        
        const topViolatingPlates = Array.from(plateViolationMap.entries())
            .map(([plateNumber, count]) => ({ plateNumber, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        console.log('🚗 高频违规车牌Top10:', topViolatingPlates);
        
        // 渲染趋势图表（使用过滤后的数据）
        renderViolationTrendChart(filteredData, topViolatingPlates);
        
        console.log('✅ 统计数据加载成功');
    } catch (error) {
        console.error('❌ 加载统计数据失败:', error);
        ElMessage.error('加载统计数据失败');
    } finally {
        statisticsLoading.value = false;
    }
};

// 处理时间范围变化
const handleDateRangeChange = () => {
    console.log('时间范围变化:', statisticsDateRange.value);
};

// 监听统计弹窗打开，初始化图表
watch(showStatisticsDialog, (newVal) => {
    if (newVal) {
        console.log('📊 打开统计弹窗...');
        // 延迟初始化图表，确保DOM已渲染
        setTimeout(() => {
            initCharts();
            // 设置默认时间范围（最近30天）
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            statisticsDateRange.value = [start, end];
            // 加载数据
            loadStatisticsData();
        }, 100);
    }
});

// 🆕 页面初始化
onMounted(() => {
    console.log('🚀🚗 违规记录页面初始化');
    
    // 监听按钮显示状态
    watchEffect(() => {
        console.log('🔍 [违规统计按钮] watchEffect - 当前显示状态:', showStatisticsButton.value);
    });
    
    console.log('');

    // 处理URL参数，自动填充搜索条件
    handleUrlParams();

    // 获取车场列表
    loadCommunityList();

    // 获取数据
    getData();
});

// 监听前端过滤字段的变化，实现实时过滤
watch(
    () => [query.ownerName, query.ownerPhone, query.location],
    () => {
        // 如果有原始数据，应用前端过滤
        if (originalData.value.length > 0) {
            console.log('检测到前端过滤条件变化，应用过滤');
            query.pageNum = 1; // 重置到第一页
            applyFrontendFilter();
        }
    },
    { deep: true }
);

// 🆕 获取车场列表 - 管理员加载所有车场，普通用户使用授权车场
const loadCommunityList = async () => {
    console.log('========== 车场列表加载 ==========');
    console.log('🔐 当前用户权限信息:', {
        isAdmin: isAdmin.value,
        managedParks: managedParks.value,
        roleId: localStorage.getItem('ms_role'),
        roleName: localStorage.getItem('ms_role_name'),
        userId: localStorage.getItem('ms_userid')
    });

    try {
        if (isAdmin.value) {
            // 管理员：从API加载所有车场
            console.log('✅ 管理员用户，从API加载所有车场');
            try {
                const response = await violationApi.getCommunityList();
                if (response.data && response.data.code === '0' && response.data.data) {
                    const parkList = response.data.data;
                    communityOptions.value = parkList.map(park => ({
                        label: park.parkName || park.community,
                        value: park.parkName || park.community
                    }));
                    console.log(`✅ 管理员加载了 ${communityOptions.value.length} 个车场`);
                } else {
                    // API调用失败，使用授权车场作为备选
                    console.warn('⚠️ API加载车场失败，使用授权车场');
                    communityOptions.value = managedParks.value.map(parkName => ({
                        label: parkName,
                        value: parkName
                    }));
                }
            } catch (error) {
                console.error('❌ 加载车场列表失败:', error);
                // 失败时使用授权车场作为备选
                communityOptions.value = managedParks.value.map(parkName => ({
                    label: parkName,
                    value: parkName
                }));
            }
        } else {
            // 普通用户：直接使用授权的车场
            console.log('✅ 普通用户，加载授权车场');
            communityOptions.value = managedParks.value.map(parkName => ({
                label: parkName,
                value: parkName
            }));
        }

        console.log("✅ 车场选项列表：", communityOptions.value);
        console.log("✅ 车场选项数量：", communityOptions.value.length);

        // 🔐 如果是普通用户且只有一个授权车场，自动选中
        if (!isAdmin.value && managedParks.value.length === 1) {
            const authorizedPark = managedParks.value[0];
            if (!query.community) {
                query.community = authorizedPark;
                console.log('🔐 自动选中唯一授权车场:', authorizedPark);
            }
        }

        // 提示用户当前可用的车场（只对普通用户提示，管理员不提示）
        if (communityOptions.value.length > 0) {
            console.log(`✅ 成功加载 ${communityOptions.value.length} 个车场选项`);
        } else if (!isAdmin.value) {
            // 只对非管理员显示警告
            console.warn('⚠️ 普通用户没有可用的车场选项');
            ElMessage.warning('您暂未分配任何车场权限，请联系管理员配置');
        }
    } catch (error) {
        console.error('❌ 加载车场列表异常:', error);
        if (!isAdmin.value && communityOptions.value.length === 0) {
            ElMessage.warning('加载车场列表失败，请刷新页面重试');
        }
    }
};

// 页面初始化时加载车场列表
loadCommunityList();

// 查询操作
const handleSearch = async () => {
    try {
        console.log('=== 开始搜索 ===');
        console.log('点击搜索按钮');
        console.log('搜索前的query对象:', JSON.stringify(query, null, 2));

        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";

        // 构建查询条件描述
        const searchConditions = [];
        if (query.plateNumber) searchConditions.push(`车牌号: ${query.plateNumber}`);
        if (query.ownerName) searchConditions.push(`车主姓名: ${query.ownerName}`);
        if (query.ownerPhone) searchConditions.push(`车主电话: ${query.ownerPhone}`);
        if (query.location) searchConditions.push(`违规地点: ${query.location}`);
        if (query.violationType) searchConditions.push(`违规类型: ${query.violationType}`);
        if (query.community) searchConditions.push(`车场: ${query.community}`);  // 🎓 添加车场筛选
        if (query.dateRange?.length > 0) searchConditions.push(`日期范围: ${query.dateRange.join(' 至 ')}`);

        const searchDescription = searchConditions.length > 0
            ? `查询违规记录 (${searchConditions.join(', ')})`
            : '查询所有违规记录';

        await activityApi.logViolationOperation(
            userId,
            username,
            "查询",
            searchDescription,
            null,
            JSON.stringify({ searchParams: query }),
            null
        ).catch(err => {
            console.error("记录查询日志失败:", err);
        });

        // 检查是否有搜索条件（包括前端过滤条件）
        const hasSearchCondition = query.plateNumber || query.ownerName || query.ownerPhone ||
            query.location || query.violationType || query.community || query.dateRange?.length > 0;
        console.log('是否有搜索条件:', hasSearchCondition);
        console.log('搜索条件：', {
            车牌号: query.plateNumber,
            车主姓名: query.ownerName,
            车主电话: query.ownerPhone,
            违规位置: query.location,
            违规类型: query.violationType,
            车场名称: query.community,  // 🎓 添加车场筛选日志
            日期范围: query.dateRange
        });

        query.pageNum = 1;
        console.log('开始调用getData()...');

        // 如果只有前端过滤条件，直接对现有数据进行过滤，不重新请求后端
        // 🎓 community 是后端条件，需要重新请求数据
        const hasBackendConditions = query.plateNumber || query.violationType || query.community || query.dateRange?.length > 0;
        const hasFrontendConditions = query.ownerName || query.ownerPhone || query.location;

        if (!hasBackendConditions && hasFrontendConditions && originalData.value.length > 0) {
            console.log('仅有前端过滤条件，直接过滤现有数据');
            query.pageNum = 1; // 重置到第一页
            applyFrontendFilter();
        } else {
            console.log('有后端条件或无数据，重新请求数据');
            getData();
        }
    } catch (error) {
        console.error("查询操作失败:", error);
        // 即使日志记录失败，也要继续执行查询
        query.pageNum = 1;
        getData();
    }

    console.log('搜索处理完成');
};

// 重置操作
const handleReset = () => {
    query.plateNumber = "";
    query.ownerName = "";
    query.ownerPhone = "";
    query.location = "";
    query.violationType = "";
    query.status = "";
    query.severity = "";

    // 🔐 重置时根据用户权限设置默认车场
    if (!isAdmin.value && managedParks.value.length === 1) {
        // 普通用户且只有一个授权车场，默认选中该车场
        query.community = managedParks.value[0];
    } else if (!isAdmin.value && managedParks.value.length > 0) {
        // 普通用户有多个授权车场，清空选择
        query.community = "";
    } else {
        // 管理员，清空选择
        query.community = "";
    }

    query.dateRange = [];
    query.processStatus = "";      // 🆕 重置处理状态
    query.processType = "";        // 🆕 重置处理方式
    query.minCreditScore = null;
    query.maxCreditScore = null;
    query.pageNum = 1;

    // 重置时重新获取数据并应用过滤
    getData();
};

// 🆕 表格选择变化处理
const handleSelectionChange = (selection) => {
    // 只允许选择未处理的记录
    multipleSelection.value = selection.filter(row => row.processStatus !== 'processed');

    if (selection.length > multipleSelection.value.length) {
        ElMessage.warning('已过滤掉已处理的记录');
    }
};

// 🆕 单条处理
const handleProcess = async (row) => {
    try {
        // 获取该车辆的所有未处理违规记录数量
        const params = {
            plateNumber: row.plateNumber,
            processStatus: 'pending',
            page: 1,
            size: 1000
        };

        const response = await violationApi.getViolations(params);
        const allViolations = response.data?.data?.records || response.data || [];
        const violationCount = allViolations.length;

        // 如果该车辆有多条未处理违规记录，询问用户是否全部处理
        if (violationCount > 1) {
            ElMessageBox.confirm(
                `该车辆（${row.plateNumber}）共有 ${violationCount} 条未处理违规记录，是否全部处理并加入黑名单？`,
                '处理确认',
                {
                    confirmButtonText: '全部处理',
                    cancelButtonText: '仅处理当前',
                    type: 'warning',
                    distinguishCancelAndClose: true
                }
            ).then(() => {
                // 用户选择全部处理
                processForm.value = {
                    id: row.id,
                    plateNumber: row.plateNumber,
                    violationType: row.violationType,
                    processRemark: '',
                    processAll: true,
                    violationCount: violationCount,
                    processType: 'blacklist', // 默认拉黑处理
                    // 黑名单相关字段
                    shouldBlacklist: true,
                    blacklistType: blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "parking_violation",
                    blacklistReason: "",
                    isPermanent: true,
                    blacklistDateRange: []
                };
                processShow.value = true;
            }).catch((action) => {
                if (action === 'cancel') {
                    // 用户选择仅处理当前
                    processForm.value = {
                        id: row.id,
                        plateNumber: row.plateNumber,
                        violationType: row.violationType,
                        processRemark: '',
                        processAll: false,
                        violationCount: 1,
                        processType: 'blacklist', // 默认拉黑处理
                        // 黑名单相关字段
                        shouldBlacklist: true,
                        blacklistType: blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "parking_violation",
                        blacklistReason: "",
                        isPermanent: true,
                        blacklistDateRange: []
                    };
                    processShow.value = true;
                }
                // 如果是 close，则不做任何操作
            });
        } else {
            // 只有一条记录，直接处理
            processForm.value = {
                id: row.id,
                plateNumber: row.plateNumber,
                violationType: row.violationType,
                processRemark: '',
                processAll: false,
                violationCount: 1,
                processType: 'blacklist', // 默认拉黑处理
                // 黑名单相关字段
                shouldBlacklist: true,
                blacklistType: blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "parking_violation",
                blacklistReason: "",
                isPermanent: true,
                blacklistDateRange: []
            };
            processShow.value = true;
        }
    } catch (error) {
        console.error('获取违规记录失败:', error);
        // 即使获取失败，也允许处理当前记录
        processForm.value = {
            id: row.id,
            plateNumber: row.plateNumber,
            violationType: row.violationType,
            processRemark: '',
            processAll: false,
            violationCount: 1,
            processType: 'blacklist', // 默认拉黑处理
            shouldBlacklist: true,
            blacklistType: blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "parking_violation",
            blacklistReason: "",
            isPermanent: true,
            blacklistDateRange: []
        };
        processShow.value = true;
    }
};

// 🆕 确认单条处理
const confirmProcess = async () => {
    try {
        // 根据处理方式进行不同的验证
        if (processForm.value.processType === 'blacklist') {
            // 拉黑处理：验证黑名单相关字段
            if (!processForm.value.blacklistType) {
                ElMessage.warning('请选择黑名单类型');
                return;
            }
            if (!processForm.value.blacklistReason || processForm.value.blacklistReason.trim().length < 5) {
                ElMessage.warning('请输入拉黑原因（至少5个字符）');
                return;
            }
            if (!processForm.value.isPermanent && (!processForm.value.blacklistDateRange || processForm.value.blacklistDateRange.length !== 2)) {
                ElMessage.warning('请选择拉黑时间段');
                return;
            }
        } else if (processForm.value.processType === 'mistake') {
            // 误操作处理：验证备注必填
            if (!processForm.value.processRemark || processForm.value.processRemark.trim().length < 5) {
                ElMessage.warning('请说明误操作原因（至少5个字符）');
                return;
            }
        }

        processing.value = true;

        // 从浏览器缓存获取用户信息
        const username = localStorage.getItem("ms_username") || "管理员";
        const userId = localStorage.getItem("ms_userid") || "unknown";

        // 构建请求参数（根据处理方式不同）
        const processParams = {
            processRemark: processForm.value.processRemark,
            operatorName: username,
            shouldBlacklist: processForm.value.processType === 'blacklist', // 根据处理方式决定是否拉黑
            blacklistType: processForm.value.processType === 'blacklist' ? processForm.value.blacklistType : null,
            blacklistReason: processForm.value.processType === 'blacklist' ? processForm.value.blacklistReason : null,
            isPermanent: processForm.value.processType === 'blacklist' ? processForm.value.isPermanent : null,
            blacklistStartTime: processForm.value.processType === 'blacklist' && !processForm.value.isPermanent ? processForm.value.blacklistDateRange[0] : null,
            blacklistEndTime: processForm.value.processType === 'blacklist' && !processForm.value.isPermanent ? processForm.value.blacklistDateRange[1] : null
        };

        let response;
        if (processForm.value.processAll) {
            // 处理该车辆的所有未处理违规记录
            response = await violationApi.processAllViolationsByPlate(
                processForm.value.plateNumber,
                processParams
            );
        } else {
            // 仅处理当前违规记录
            response = await violationApi.processViolation(
                processForm.value.id,
                processParams
            );
        }

        if (response.data && response.data.code === '0') {
            // 根据处理方式显示不同的成功消息
            let message;
            if (processForm.value.processType === 'mistake') {
                message = processForm.value.processAll
                    ? `成功处理 ${processForm.value.violationCount} 条违规记录（误操作，未拉黑）`
                    : `处理成功（误操作，未拉黑）`;
            } else {
                message = processForm.value.processAll
                    ? `成功处理 ${processForm.value.violationCount} 条违规记录，已加入黑名单`
                    : `处理成功，已加入黑名单`;
            }
            ElMessage.success(message);

            // 🆕 检查是否需要发送违规提醒短信
            try {
                // 获取车主信息
                const ownerInfo = await violationApi.getOwnerByPlate(processForm.value.plateNumber);
                if (ownerInfo && ownerInfo.phone && ownerInfo.phone.match(/^1[3-9]\d{9}$/)) {
                    // 检查是否有未处理的违规提醒
                    const unprocessedReminders = await violationReminderApi.getUnprocessedRemindersByPlate(processForm.value.plateNumber);

                    if (!unprocessedReminders.data || !unprocessedReminders.data.records || unprocessedReminders.data.records.length === 0) {
                        // 第一次违规，发送提醒短信
                        await ElMessageBox.confirm(
                            `是否向车主 ${ownerInfo.name} (${ownerInfo.phone}) 发送违规提醒短信？`,
                            '发送违规提醒',
                            {
                                confirmButtonText: '发送',
                                cancelButtonText: '不发送',
                                type: 'warning'
                            }
                        );

                        // 用户选择发送提醒短信
                        const templateData = reminderUtils.buildSmsTemplateData({
                            plateNumber: processForm.value.plateNumber,
                            location: '停车场'
                        });

                        const smsResult = await violationReminderApi.sendViolationReminderSms(ownerInfo.phone, templateData);

                        if (smsResult.success) {
                            // 创建违规提醒记录
                            const reminderData = reminderUtils.buildReminderData({
                                plateNumber: processForm.value.plateNumber,
                                violationType: processForm.value.violationType,
                                location: '停车场'
                            }, ownerInfo);

                            await violationReminderApi.createViolationReminder(reminderData);
                            ElMessage.success('违规提醒短信发送成功');
                        }
                    } else {
                        // 第二次及以后违规，发送违规短信并标记提醒为已处理
                        await ElMessageBox.confirm(
                            `是否向车主 ${ownerInfo.name} (${ownerInfo.phone}) 发送违规短信？`,
                            '发送违规短信',
                            {
                                confirmButtonText: '发送',
                                cancelButtonText: '不发送',
                                type: 'warning'
                            }
                        );

                        // 标记之前的提醒为已处理
                        await violationReminderApi.markAllRemindersAsProcessed(processForm.value.plateNumber, username);

                        // 发送违规短信
                        const templateData = reminderUtils.buildSmsTemplateData({
                            plateNumber: processForm.value.plateNumber,
                            location: '停车场'
                        });

                        const smsResult = await violationReminderApi.sendViolationSms(ownerInfo.phone, templateData);

                        if (smsResult.success) {
                            ElMessage.success('违规短信发送成功');
                        }
                    }
                }
            } catch (error) {
                console.error('❌ [违规提醒检查] 失败:', error);
                // 不显示错误，避免影响主流程
            }

            // 记录操作日志
            await activityApi.logViolationOperation(
                userId,
                username,
                "手动处理",
                `手动处理违规记录并加入黑名单：车牌${processForm.value.plateNumber}，${processForm.value.processAll ? `全部${processForm.value.violationCount}条` : '当前1条'}`,
                processForm.value.plateNumber,
                JSON.stringify(processForm.value),
                null
            ).catch(err => {
                console.error("记录操作日志失败:", err);
            });

            processShow.value = false;
            getData(); // 刷新列表
        } else {
            ElMessage.error('处理失败：' + (response.data?.msg || '未知错误'));
        }
    } catch (error) {
        console.error('处理失败:', error);
        ElMessage.error('处理失败：' + (error.message || '网络错误'));
    } finally {
        processing.value = false;
    }
};

// 🆕 批量处理
const handleBatchProcess = async () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请选择要处理的记录');
        return;
    }

    try {
        // 获取所有选中车辆的车牌号（去重）
        const plateNumbers = [...new Set(multipleSelection.value.map(item => item.plateNumber))];

        // 🆕 初始化车牌号列表
        batchPlateNumbers.value = plateNumbers;

        // 🆕 确保黑名单类型已加载
        if (blacklistTypeOptions.value.length === 0) {
            console.log('🔄 黑名单类型未加载，开始加载...');
            await loadBlacklistTypes();
        }

        // 🆕 初始化批量处理表单
        batchBlacklistForm.value = {
            processType: 'blacklist',
            shouldBlacklist: true,
            blacklistType: blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : '',
            blacklistReason: '',
            isPermanent: true,
            blacklistDateRange: []
        };
        batchProcessRemark.value = '';

        // 统计所有相关车辆的未处理违规记录总数
        let totalCount = 0;
        for (const plateNumber of plateNumbers) {
            const params = {
                plateNumber: plateNumber,
                processStatus: 'pending',
                page: 1,
                size: 1000
            };
            const response = await violationApi.getViolations(params);
            const violations = response.data?.data?.records || response.data || [];
            totalCount += violations.length;
        }

        batchTotalCount.value = totalCount;

        // 如果总数大于选中数量，询问用户是否全部处理
        if (totalCount > multipleSelection.value.length) {
            ElMessageBox.confirm(
                `选中的 ${multipleSelection.value.length} 条记录涉及 ${plateNumbers.length} 辆车，这些车辆共有 ${totalCount} 条未处理违规记录。是否全部处理并加入黑名单？`,
                '批量处理确认',
                {
                    confirmButtonText: '全部处理',
                    cancelButtonText: '仅处理选中',
                    type: 'warning',
                    distinguishCancelAndClose: true
                }
            ).then(() => {
                // 用户选择全部处理
                batchProcessAll.value = true;
                showBatchProcessDialog.value = true;
            }).catch((action) => {
                if (action === 'cancel') {
                    // 用户选择仅处理选中
                    batchProcessAll.value = false;
                    showBatchProcessDialog.value = true;
                }
                // 如果是 close，则不做任何操作
            });
        } else {
            // 总数等于选中数量，直接处理
            batchProcessAll.value = false;
            showBatchProcessDialog.value = true;
        }
    } catch (error) {
        console.error('获取违规记录失败:', error);
        // 即使获取失败，也允许处理选中的记录
        batchProcessAll.value = false;
        batchTotalCount.value = multipleSelection.value.length;
        showBatchProcessDialog.value = true;
    }
};

// 🆕 确认批量处理
const confirmBatchProcess = async () => {
    try {
        // 根据处理方式进行不同的验证
        if (batchBlacklistForm.value.processType === 'blacklist') {
            // 拉黑处理：验证黑名单相关字段
            if (!batchBlacklistForm.value.blacklistType) {
                ElMessage.warning('请选择黑名单类型');
                return;
            }
            if (!batchBlacklistForm.value.blacklistReason || batchBlacklistForm.value.blacklistReason.trim().length < 5) {
                ElMessage.warning('请输入拉黑原因（至少5个字符）');
                return;
            }
            if (!batchBlacklistForm.value.isPermanent && (!batchBlacklistForm.value.blacklistDateRange || batchBlacklistForm.value.blacklistDateRange.length !== 2)) {
                ElMessage.warning('请选择拉黑时间段');
                return;
            }
        } else if (batchBlacklistForm.value.processType === 'mistake') {
            // 误操作处理：验证备注必填
            if (!batchProcessRemark.value || batchProcessRemark.value.trim().length < 5) {
                ElMessage.warning('请说明误操作原因（至少5个字符）');
                return;
            }
        }

        batchProcessing.value = true;

        // 从浏览器缓存获取用户信息
        const username = localStorage.getItem("ms_username") || "管理员";
        const userId = localStorage.getItem("ms_userid") || "unknown";

        // 构建请求参数（根据处理方式不同）
        const processParams = {
            processRemark: batchProcessRemark.value,
            operatorName: username,
            shouldBlacklist: batchBlacklistForm.value.processType === 'blacklist', // 根据处理方式决定是否拉黑
            blacklistType: batchBlacklistForm.value.processType === 'blacklist' ? batchBlacklistForm.value.blacklistType : null,
            blacklistReason: batchBlacklistForm.value.processType === 'blacklist' ? batchBlacklistForm.value.blacklistReason : null,
            isPermanent: batchBlacklistForm.value.processType === 'blacklist' ? batchBlacklistForm.value.isPermanent : null,
            blacklistStartTime: batchBlacklistForm.value.processType === 'blacklist' && !batchBlacklistForm.value.isPermanent ? batchBlacklistForm.value.blacklistDateRange[0] : null,
            blacklistEndTime: batchBlacklistForm.value.processType === 'blacklist' && !batchBlacklistForm.value.isPermanent ? batchBlacklistForm.value.blacklistDateRange[1] : null
        };

        let response;
        if (batchProcessAll.value) {
            // 处理所有相关车辆的所有未处理违规记录
            const plateNumbers = [...new Set(multipleSelection.value.map(item => item.plateNumber))];
            response = await violationApi.batchProcessAllViolationsByPlates(
                plateNumbers,
                processParams
            );
        } else {
            // 仅处理选中的违规记录
            const violationIds = multipleSelection.value.map(row => row.id);
            response = await violationApi.batchProcessViolations(
                violationIds,
                processParams
            );
        }

        if (response.data && response.data.code === '0') {
            const result = response.data.data;
            // 根据处理方式显示不同的成功消息
            let message;
            if (batchBlacklistForm.value.processType === 'mistake') {
                message = batchProcessAll.value
                    ? `批量处理完成！共处理 ${batchTotalCount.value} 条违规记录（误操作，未拉黑）`
                    : `批量处理完成！成功: ${result.success}条，失败: ${result.failed}条（误操作，未拉黑）`;
            } else {
                message = batchProcessAll.value
                    ? `批量处理完成！共处理 ${batchTotalCount.value} 条违规记录，已加入黑名单`
                    : `批量处理完成！成功: ${result.success}条，失败: ${result.failed}条，已加入黑名单`;
            }
            ElMessage.success(message);

            // 🆕 批量处理违规提醒短信
            try {
                const plateNumbers = [...new Set(multipleSelection.value.map(item => item.plateNumber))];

                for (const plateNumber of plateNumbers) {
                    try {
                        // 获取车主信息
                        const ownerInfo = await violationApi.getOwnerByPlate(plateNumber);
                        if (ownerInfo && ownerInfo.phone && ownerInfo.phone.match(/^1[3-9]\d{9}$/)) {
                            // 检查是否有未处理的违规提醒
                            const unprocessedReminders = await violationReminderApi.getUnprocessedRemindersByPlate(plateNumber);

                            if (!unprocessedReminders.data || !unprocessedReminders.data.records || unprocessedReminders.data.records.length === 0) {
                                // 第一次违规，发送提醒短信
                                const templateData = reminderUtils.buildSmsTemplateData({
                                    plateNumber: plateNumber,
                                    location: '停车场'
                                });

                                const smsResult = await violationReminderApi.sendViolationReminderSms(ownerInfo.phone, templateData);

                                if (smsResult.success) {
                                    // 创建违规提醒记录
                                    const reminderData = reminderUtils.buildReminderData({
                                        plateNumber: plateNumber,
                                        violationType: '批量处理',
                                        location: '停车场'
                                    }, ownerInfo);

                                    await violationReminderApi.createViolationReminder(reminderData);
                                    console.log(`✅ [批量处理] 车牌 ${plateNumber} 违规提醒短信发送成功`);
                                }
                            } else {
                                // 第二次及以后违规，发送违规短信并标记提醒为已处理
                                // 标记之前的提醒为已处理
                                await violationReminderApi.markAllRemindersAsProcessed(plateNumber, username);

                                // 发送违规短信
                                const templateData = reminderUtils.buildSmsTemplateData({
                                    plateNumber: plateNumber,
                                    location: '停车场'
                                });

                                const smsResult = await violationReminderApi.sendViolationSms(ownerInfo.phone, templateData);

                                if (smsResult.success) {
                                    console.log(`✅ [批量处理] 车牌 ${plateNumber} 违规短信发送成功`);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`❌ [批量处理] 车牌 ${plateNumber} 违规提醒处理失败:`, error);
                        // 继续处理下一个车牌，不中断整个流程
                    }
                }
            } catch (error) {
                console.error('❌ [批量处理] 违规提醒检查失败:', error);
                // 不显示错误，避免影响主流程
            }

            // 记录操作日志
            await activityApi.logViolationOperation(
                userId,
                username,
                "批量处理",
                `批量手动处理违规记录并加入黑名单：${batchProcessAll.value ? `全部${batchTotalCount.value}条` : `选中${multipleSelection.value.length}条`}`,
                null,
                JSON.stringify({
                    processAll: batchProcessAll.value,
                    count: batchProcessAll.value ? batchTotalCount.value : multipleSelection.value.length,
                    remark: batchProcessRemark.value,
                    blacklist: batchBlacklistForm.value
                }),
                null
            ).catch(err => {
                console.error("记录操作日志失败:", err);
            });

            showBatchProcessDialog.value = false;
            multipleSelection.value = [];
            getData(); // 刷新列表
        } else {
            ElMessage.error('批量处理失败：' + (response.data?.msg || '未知错误'));
        }
    } catch (error) {
        console.error('批量处理失败:', error);
        ElMessage.error('批量处理失败：' + (error.message || '网络错误'));
    } finally {
        batchProcessing.value = false;
    }
};

// 📥 导出功能
const handleExport = async () => {
    try {
        // 显示加载提示
        const loading = ElLoading.service({
            lock: true,
            text: '正在导出数据，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)',
        });

        // 构建查询参数，获取所有符合条件的数据（不分页）
        const params = {
            plateNumber: query.plateNumber || null,
            ownerName: query.ownerName || null,
            ownerPhone: query.ownerPhone || null,
            violationType: query.violationType || null,
            community: query.community || null,
            processStatus: query.processStatus || null,
            processType: query.processType || null,
            startDate: query.dateRange && query.dateRange.length > 0 ? query.dateRange[0] : null,
            endDate: query.dateRange && query.dateRange.length > 1 ? query.dateRange[1] : null,
            pageNum: 1,
            pageSize: 10000, // 获取大量数据用于导出
        };

        // 从后端获取数据
        const res = await violationApi.getViolations(params);

        if (!res.data.data || !res.data.data.records || res.data.data.records.length === 0) {
            loading.close();
            ElMessage.warning('没有可导出的数据');
            return;
        }

        let exportData = res.data.data.records;

        // 🔍 批量查询违规次数（和显示逻辑保持一致）
        try {
            const plateNumbers = [...new Set(exportData.map(r => r.plateNumber).filter(p => p))];
            if (plateNumbers.length > 0) {
                const countMap = {};
                const batchSize = 20;

                for (let i = 0; i < plateNumbers.length; i += batchSize) {
                    const batch = plateNumbers.slice(i, i + batchSize);
                    const countPromises = batch.map(async (plateNumber) => {
                        try {
                            const countRes = await violationApi.getViolations({
                                plateNumber: plateNumber,
                                pageNum: 1,
                                pageSize: 1
                            });
                            return {
                                plateNumber,
                                count: countRes.data?.data?.total || 0
                            };
                        } catch (error) {
                            console.error(`查询车牌 ${plateNumber} 违规次数失败:`, error);
                            return { plateNumber, count: 0 };
                        }
                    });

                    const results = await Promise.all(countPromises);
                    results.forEach(({ plateNumber, count }) => {
                        countMap[plateNumber] = count;
                    });
                }

                // 附加违规次数
                exportData.forEach(record => {
                    record.violationCount = countMap[record.plateNumber] || 0;
                });
            }
        } catch (error) {
            console.error('批量查询违规次数失败:', error);
        }

        // 动态导入支持样式的 xlsx-js-style 库
        const XLSX = await import('xlsx-js-style');

        // 准备导出的数据 - 包含所有有价值的字段（去除：严重程度、状态、车位号、备注）
        const exportList = exportData.map((item, index) => {
            const row = {
                '序号': index + 1,
                '车牌号码': item.plateNumber || '-',
                '车主姓名': getDisplayOwnerName(item),
                '车主电话': getDisplayOwnerPhone(item),
                '车主地址': item.ownerAddress || '-',
                '违规类型': item.violationType || '-',
                '违规位置': item.location || '-',
                '违规描述': item.description || '-',
                '违规时间': formatTimestamp(item.createdAt) || '-',
                '违规次数': item.violationCount || 0,
            };

            // 停车场信息
            if (item.parkName) row['停车场名称'] = item.parkName;
            if (item.parkCode) row['停车场编码'] = item.parkCode;

            // 是否月票车
            if (item.isMonthlyTicket !== null && item.isMonthlyTicket !== undefined) {
                row['是否月票车'] = item.isMonthlyTicket ? '是' : '否';
            }
            const ticketType = getDisplayTicketType(item);
            if (ticketType !== '未知') row['月票类型'] = ticketType;

            // 时间信息
            if (item.appointmentTime) row['预约时间'] = formatTimestamp(item.appointmentTime);
            if (item.enterTime) row['进场时间'] = formatTimestamp(item.enterTime);
            if (item.leaveTime) row['离场时间'] = formatTimestamp(item.leaveTime);

            // 车主详细信息
            if (item.ownerCategory) row['人员类别'] = item.ownerCategory;
            if (item.customerCompany) row['单位/公司'] = item.customerCompany;
            // ❌ 已移除：车位号 (customerRoomNumber)

            // 处理状态
            row['处理状态'] = item.processStatus === 'processed' ? '已处理' : '未处理';
            if (item.processType) {
                row['处理方式'] = item.processType === 'auto_blacklist' ? '系统自动拉黑' :
                    (item.processType === 'manual' ? '手动处理' : item.processType);
            }
            if (item.processedBy) row['处理人'] = item.processedBy;
            if (item.processedAt) row['处理时间'] = formatTimestamp(item.processedAt);
            if (item.processRemark) row['处理备注'] = item.processRemark;

            // 黑名单信息
            if (item.shouldBlacklist) {
                row['是否拉黑'] = item.shouldBlacklist === 1 ? '是' : '否';
            }
            if (item.blacklistReason) row['拉黑原因'] = item.blacklistReason;
            if (item.blacklistTypeName) row['黑名单类型'] = item.blacklistTypeName;
            if (item.blacklistDurationType) {
                row['拉黑时长类型'] = item.blacklistDurationType === 'permanent' ? '永久' : '临时';
            }
            if (item.blacklistStartTime) row['拉黑开始时间'] = formatTimestamp(item.blacklistStartTime);
            if (item.blacklistEndTime) row['拉黑结束时间'] = formatTimestamp(item.blacklistEndTime);

            // 其他信息
            // ❌ 已移除：严重程度 (severity)
            if (item.customType) row['自定义违规类型'] = item.customType;
            // ❌ 已移除：状态 (status)
            // ❌ 已移除：备注 (remark)
            if (item.createdBy) row['创建者'] = item.createdBy;
            if (item.updatedAt) row['更新时间'] = formatTimestamp(item.updatedAt);

            return row;
        });

        // 创建工作表，先不传入数据
        const worksheet = XLSX.utils.aoa_to_sheet([]);

        // 🎯 添加标题行（跨所有列）
        // 获取车场名称
        const parkName = query.community || '全部车场';
        // 格式化日期为 yyyymmdd
        const today = new Date();
        const exportDateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const titleText = `${parkName}违规记录导出表${exportDateStr}`;

        // 获取列数
        const firstRow = exportList[0];
        const columnCount = Object.keys(firstRow).length;

        // 添加标题行
        XLSX.utils.sheet_add_aoa(worksheet, [[titleText]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A2' }); // 空行

        // 从第3行开始添加数据
        XLSX.utils.sheet_add_json(worksheet, exportList, { origin: 'A3' });

        // 设置标题行的合并单元格（合并A1到最后一列）
        const lastColumn = XLSX.utils.encode_col(columnCount - 1);
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } } // 合并标题行
        ];

        // 🎨 设置标题行样式（居中、加粗、字体加大）
        const titleCell = worksheet['A1'];
        if (titleCell) {
            titleCell.s = {
                font: {
                    name: '微软雅黑',
                    sz: 18,        // 字号18
                    bold: true,    // 加粗
                    color: { rgb: '000000' }
                },
                alignment: {
                    horizontal: 'center',  // 水平居中
                    vertical: 'center'     // 垂直居中
                },
                fill: {
                    fgColor: { rgb: 'F0F0F0' }  // 浅灰色背景
                }
            };
        }

        // 设置标题行高度
        worksheet['!rows'] = [
            { hpt: 35 }  // 第1行（标题行）高度35
        ];

        // 动态设置列宽（根据实际列数）
        const columnWidths = Object.keys(firstRow).map(key => {
            let width = 10; // 默认宽度
            if (key.includes('时间') || key.includes('日期')) width = 20;
            else if (key.includes('地址') || key.includes('位置') || key.includes('描述') || key.includes('备注')) width = 30;
            else if (key.includes('电话') || key.includes('编码')) width = 15;
            else if (key === '序号') width = 6;
            return { wch: width };
        });
        worksheet['!cols'] = columnWidths;

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '违规记录');

        // 生成文件名（使用标题中的日期格式）
        const fileName = `${parkName}违规记录导出表${exportDateStr}.xlsx`;

        // 导出文件（支持样式）
        XLSX.writeFile(workbook, fileName, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
        });

        loading.close();
        ElMessage.success(`成功导出 ${exportList.length} 条记录`);

        // 记录活动日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        activityApi.logViolationOperation(
            userId,
            username,
            "导出",
            `导出违规记录数据：${exportList.length}条`,
            null,
            null,
            JSON.stringify({
                action: "export",
                count: exportList.length,
                filters: params,
                timestamp: new Date().toISOString()
            })
        ).catch(err => {
            console.error("记录活动日志失败:", err);
        });

    } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败：' + (error.message || '未知错误'));
    }
};

// 分页大小
const handleSizeChange = (val) => {
    query.pageSize = val;
    query.pageNum = 1; // 重置到第一页

    if (isFiltering.value) {
        // 如果是前端过滤模式，重新应用分页
        console.log('前端过滤模式：更新每页显示数量');
        applyFrontendFilter();
    } else {
        // 后端分页模式，重新请求数据
        console.log('后端分页模式：重新请求数据');
        getData();
    }
};

// 分页导航
const handlePageChange = (val) => {
    query.pageNum = val;

    if (isFiltering.value) {
        // 如果是前端过滤模式，重新应用分页
        console.log('前端过滤模式：切换到第', val, '页');
        const startIndex = (val - 1) * query.pageSize;
        const endIndex = startIndex + query.pageSize;
        tableData.value = filteredFullData.value.slice(startIndex, endIndex);
        console.log('显示数据范围:', startIndex, '-', endIndex, '共', tableData.value.length, '条');
    } else {
        // 后端分页模式，重新请求数据
        console.log('后端分页模式：请求第', val, '页数据');
        getData();
    }
};

// 🎫 获取显示用的月票类型（优先使用现有字段，为空则使用月票表字段）
const getDisplayTicketType = (row) => {
    if (!row) return '未知';
    // 检查 vipTypeName 是否有效
    if (row.vipTypeName && row.vipTypeName.trim() !== '') {
        return row.vipTypeName;
    }
    // 检查 monthTicketName 是否有效
    if (row.monthTicketName && row.monthTicketName.trim() !== '') {
        return row.monthTicketName;
    }
    return '未知';
};

// 👤 获取显示用的车主姓名（优先使用现有字段，为空则使用月票表字段）
const getDisplayOwnerName = (row) => {
    if (!row) return '未知';
    // 检查 ownerName 是否有效
    if (row.ownerName && row.ownerName.trim() !== '') {
        return row.ownerName;
    }
    // 检查 monthTicketUserName 是否有效
    if (row.monthTicketUserName && row.monthTicketUserName.trim() !== '') {
        return row.monthTicketUserName;
    }
    return '未知';
};

// 📞 获取显示用的车主电话（优先使用现有字段，为空则使用月票表字段）
const getDisplayOwnerPhone = (row) => {
    if (!row) return '暂无';
    // 检查 ownerPhone 是否有效
    if (row.ownerPhone && row.ownerPhone.trim() !== '') {
        return row.ownerPhone;
    }
    // 检查 monthTicketUserPhone 是否有效
    if (row.monthTicketUserPhone && row.monthTicketUserPhone.trim() !== '') {
        return row.monthTicketUserPhone;
    }
    return '暂无';
};

// 判断车牌类型（新能源 vs 油车）
const getPlateType = (plateNumber) => {
    // console.log('判断车牌类型:', plateNumber);
    if (!plateNumber) return 'traditional';
    const plate = plateNumber.trim().toUpperCase();
    // console.log('处理后的车牌:', plate.length);
    // 新能源车牌特征：
    // 1. 8位车牌（新能源专用号牌）
    // 2. 包含字母D或F的新能源号牌
    // 3. 绿色车牌模式（通常8位，第2位或最后一位是字母）
    // 去除空格并转换为大写字母
    if (plate.length === 8) {
        // 8位车牌通常是新能源
        return 'new-energy';
    } else if (plate.length === 7) {
        // 7位车牌中，如果第6位是D或F，则为新能源
        return 'traditional';
    }
};

//指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
    if ((rowIndex + 1) % 2 == 0) {
        return 'odd-row';
    } else if ((rowIndex + 1) % 2 != 0) {
        return 'even-row';
    }
};

//指定行高
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
    let style = { padding: '8px 3px' }
    return style
};

// 🆕 月票车超时配置相关方法
const handleMonthlyTicketConfig = async () => {
    try {
        console.log('打开月票车配置弹窗');

        // 并行获取配置和月票类型
        const [configResponse, ticketTypesResponse] = await Promise.allSettled([
            violationApi.getMonthlyTicketConfig('2KPL6XFF'),
            loadTicketTypes()
        ]);

        // 处理配置响应
        if (configResponse.status === 'fulfilled' &&
            configResponse.value.data &&
            configResponse.value.data.code === 0) {
            const config = configResponse.value.data.data;
            configForm.timeoutMinutes = config.timeoutMinutes || 60;
            configForm.maxViolationCount = config.maxViolationCount || 5;
            configForm.overnightTimeHours = config.overnightTimeHours || 4;
            configForm.exemptTicketTypes = (config.exemptTicketTypes && config.exemptTicketTypes.length > 0) ? config.exemptTicketTypes[0] : '';
        }

        // 处理月票类型响应
        if (ticketTypesResponse.status === 'rejected') {
            console.warn('获取月票类型失败:', ticketTypesResponse.reason);
            ElMessage.warning('获取月票类型失败，请稍后重试');
        }

        configShow.value = true;

    } catch (error) {
        console.error('获取月票车配置失败:', error);
        ElMessage.warning('获取配置失败，使用默认配置');
        configShow.value = true;
    }
};

// 🆕 加载月票类型列表
const loadTicketTypes = async () => {
    try {
        ticketTypesLoading.value = true;
        const response = await violationApi.getTicketTypesByParkCode('2KPL6XFF');

        if (response.data && response.data.code === '0') {
            const data = response.data.data;
            availableTicketTypes.value = data.ticketTypes || [];
            console.log('加载月票类型成功:', availableTicketTypes.value);
        } else {
            throw new Error(response.data?.msg || '获取月票类型失败');
        }
    } catch (error) {
        console.error('加载月票类型失败:', error);
        availableTicketTypes.value = [];
        throw error;
    } finally {
        ticketTypesLoading.value = false;
    }
};

// 🆕 按车场编码加载月票类型列表（供万象上东等使用）
const loadTicketTypesForPark = async (parkCode) => {
    try {
        ticketTypesLoading.value = true;
        const response = await violationApi.getTicketTypesByParkCode(parkCode);

        if (response.data && response.data.code === '0') {
            const data = response.data.data;
            availableTicketTypes.value = data.ticketTypes || [];
            console.log(`加载车场 ${parkCode} 月票类型成功:`, availableTicketTypes.value);
        } else {
            throw new Error(response.data?.msg || '获取月票类型失败');
        }
    } catch (error) {
        console.error(`加载车场 ${parkCode} 月票类型失败:`, error);
        availableTicketTypes.value = [];
        throw error;
    } finally {
        ticketTypesLoading.value = false;
    }
};

// 🆕 处理免检类型选择变化
const handleExemptTypeChange = (value) => {
    // 选择变化时的处理逻辑（如需要可在此添加）
};

const handleSaveConfig = async () => {
    try {
        // 表单验证
        if (!configFormRef.value) {
            return;
        }

        const valid = await configFormRef.value.validate();
        if (!valid) {
            return;
        }

        configSaving.value = true;

        // 处理免检类型
        const exemptTypes = (configForm.exemptTicketTypes && configForm.exemptTicketTypes.trim())
            ? [configForm.exemptTicketTypes.trim()]
            : [];

        // 调用保存接口（包含过夜停车配置和免检类型）
        const response = await violationApi.saveMonthlyTicketFullConfig({
            parkCode: configForm.parkCode,
            timeoutMinutes: configForm.timeoutMinutes,
            maxViolationCount: configForm.maxViolationCount,
            overnightTimeHours: configForm.overnightTimeHours,
            enableOvernightCheck: true,
            exemptTicketTypes: exemptTypes
        });
        if (response.data && response.data.code === '0') {
            ElMessage.success('配置保存成功');
            configShow.value = false;

            // 记录操作日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";

            const exemptTypesDesc = (configForm.exemptTicketTypes && configForm.exemptTicketTypes.trim())
                ? `，免检类型：${configForm.exemptTicketTypes.trim()}`
                : '，无免检类型';

            await activityApi.logViolationOperation(
                userId,
                username,
                "配置",
                `设置月票车超时配置：超时时间${configForm.timeoutMinutes}分钟，累计次数${configForm.maxViolationCount}次，过夜时长${configForm.overnightTimeHours}小时${exemptTypesDesc}`,
                null,
                JSON.stringify(configForm),
                null
            ).catch(err => {
                console.error("记录操作日志失败:", err);
            });

        } else {
            ElMessage.error(response.data?.msg || '配置保存失败');
        }

    } catch (error) {
        console.error('保存月票车配置失败:', error);
        ElMessage.error('保存配置失败: ' + (error.message || '未知错误'));
    } finally {
        configSaving.value = false;
    }
};

// 🆕 打开东北林业大学配置弹窗（从后端API读取配置）
const handleNebuConfigDialog = async () => {
    console.log('打开东北林业大学违规阈值配置弹窗');

    try {
        // 打开弹窗前按名称加载黑名单类型（东北林业大学）
        await loadBlacklistTypes();

        // 从后端读取当前配置
        const res = await violationApi.getNebuViolationConfig();
        console.log('获取东北林业大学配置:', res);

        if (res.code === 200 && res.data) {
            nebuConfigForm.maxViolationCount = res.data.maxViolationCount || 5;
            nebuConfigForm.blacklistType = res.data.blacklistType || (blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "");
            nebuConfigForm.isPermanent = res.data.isPermanent !== undefined ? res.data.isPermanent : true;
            nebuConfigForm.blacklistValidDays = res.data.blacklistValidDays || 30;
            nebuConfigForm.reminderIntervalMinutes = res.data.reminderIntervalMinutes || 30;
        } else {
            // 如果获取失败，使用默认值
            nebuConfigForm.maxViolationCount = 5;
            nebuConfigForm.blacklistType = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
            nebuConfigForm.isPermanent = true;
            nebuConfigForm.blacklistValidDays = 30;
            nebuConfigForm.reminderIntervalMinutes = 30;
        }
    } catch (error) {
        console.error('获取配置失败:', error);
        // 失败时使用默认值
        nebuConfigForm.maxViolationCount = 5;
        nebuConfigForm.blacklistType = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
        nebuConfigForm.isPermanent = true;
        nebuConfigForm.blacklistValidDays = 30;
    }

    nebuConfigShow.value = true;
};

// 🆕 保存东北林业大学配置（调用后端API保存到数据库）
const handleSaveNebuConfig = async () => {
    try {
        // 表单验证
        if (!nebuConfigFormRef.value) {
            return;
        }

        const valid = await nebuConfigFormRef.value.validate();
        if (!valid) {
            return;
        }

        // 如果是临时拉黑，验证有效天数
        if (!nebuConfigForm.isPermanent && (!nebuConfigForm.blacklistValidDays || nebuConfigForm.blacklistValidDays < 1)) {
            ElMessage.warning('请输入拉黑有效天数（至少1天）');
            return;
        }

        // 构建配置数据
        const configData = {
            parkName: '东北林业大学',
            maxViolationCount: nebuConfigForm.maxViolationCount,
            blacklistType: nebuConfigForm.blacklistType,
            isPermanent: nebuConfigForm.isPermanent,
            blacklistValidDays: nebuConfigForm.isPermanent ? null : nebuConfigForm.blacklistValidDays,
            // 🆕 保存短信/提醒发送间隔（分钟）
            reminderIntervalMinutes: nebuConfigForm.reminderIntervalMinutes
        };
        console.log("参数：", nebuConfigForm.blacklistType);
        console.log("保存配置数据：", configData);

        // 调用后端API保存配置
        const res = await violationApi.saveNebuViolationConfig(configData);

        console.log('保存东北林业大学配置结果:', res);

        if (res.data.code === '0') {
            const validDaysText = nebuConfigForm.isPermanent ? '永久拉黑' : `临时拉黑${nebuConfigForm.blacklistValidDays}天`;
            ElMessage.success(`配置保存成功：违规阈值${nebuConfigForm.maxViolationCount}次，${validDaysText}，提醒间隔${nebuConfigForm.reminderIntervalMinutes}分钟`);
            nebuConfigShow.value = false;

            // 记录操作日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";

            await activityApi.logViolationOperation(
                userId,
                username,
                "配置",
                `设置东北林业大学违规阈值：${nebuConfigForm.maxViolationCount}次，黑名单类型：${nebuConfigForm.blacklistType}，${validDaysText}，提醒间隔${nebuConfigForm.reminderIntervalMinutes}分钟`,
                null,
                JSON.stringify(nebuConfigForm),
                null
            ).catch(err => {
                console.warn('记录操作日志失败:', err);
            });
        } else {
            ElMessage.error(res.msg || '保存配置失败');
        }
    } catch (error) {
        console.error('❌ 保存东北林业大学配置失败:', error);
        ElMessage.error('配置保存失败');
    }
};

// 🆕 打开学院新城配置弹窗（从后端API读取配置）
const handleCollegeNewCityConfigDialog = async () => {
    console.log('打开学院新城拉黑规则配置弹窗');

    try {
        // 🆕 先按学院新城车场编码加载黑名单类型
        await loadBlacklistTypesForPark(collegeNewCityConfigForm.parkCode);

        // 从后端读取当前配置
        const res = await violationApi.getCollegeNewCityConfig();
        console.log('获取学院新城配置:', res);

        if (res.code === 200 && res.data) {
            collegeNewCityConfigForm.blacklistTimeHours = res.data.blacklistTimeHours || 1;
            collegeNewCityConfigForm.blacklistType = res.data.blacklistType || (blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "");
            collegeNewCityConfigForm.isPermanent = res.data.isPermanent !== undefined ? res.data.isPermanent : true;
            collegeNewCityConfigForm.blacklistValidDays = res.data.blacklistValidDays || 30;
            // 🆕 读取时间段（后端可选返回）
            collegeNewCityConfigForm.nightStartHour = (res.data.nightStartHour !== undefined) ? res.data.nightStartHour : 0;
            collegeNewCityConfigForm.nightEndHour = (res.data.nightEndHour !== undefined) ? res.data.nightEndHour : 7;
        } else {
            // 如果获取失败，使用默认值
            collegeNewCityConfigForm.blacklistTimeHours = 1;
            collegeNewCityConfigForm.blacklistType = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
            collegeNewCityConfigForm.isPermanent = true;
            collegeNewCityConfigForm.blacklistValidDays = 30;
            collegeNewCityConfigForm.nightStartHour = 0;
            collegeNewCityConfigForm.nightEndHour = 7;
        }
    } catch (error) {
        console.error('获取配置失败:', error);
        // 失败时使用默认值
        collegeNewCityConfigForm.blacklistTimeHours = 1;
        collegeNewCityConfigForm.blacklistType = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
        collegeNewCityConfigForm.isPermanent = true;
        collegeNewCityConfigForm.blacklistValidDays = 30;
        collegeNewCityConfigForm.nightStartHour = 0;
        collegeNewCityConfigForm.nightEndHour = 7;
    }

    collegeNewCityConfigShow.value = true;
};

// 🆕 保存学院新城配置（调用后端API保存到数据库）
const handleSaveCollegeNewCityConfig = async () => {
    try {
        // 表单验证
        if (!collegeNewCityConfigFormRef.value) {
            return;
        }

        const valid = await collegeNewCityConfigFormRef.value.validate();
        if (!valid) {
            return;
        }

        // 如果是临时拉黑，验证有效天数
        if (!collegeNewCityConfigForm.isPermanent && (!collegeNewCityConfigForm.blacklistValidDays || collegeNewCityConfigForm.blacklistValidDays < 1)) {
            ElMessage.warning('请输入拉黑有效天数（至少1天）');
            return;
        }

        // 仅传递黑名单类型名称（去掉 id| 前缀）
        const blacklistTypeName = (collegeNewCityConfigForm.blacklistType || '').split('|').slice(-1)[0] || '';

        // 构建配置数据（包含学院新城名称）
        const configData = {
            parkCode: '76F1MLQKL',
            park_name: '学院新城',
            blacklistTimeHours: collegeNewCityConfigForm.blacklistTimeHours,
            blacklistType: blacklistTypeName,
            isPermanent: collegeNewCityConfigForm.isPermanent,
            blacklistValidDays: collegeNewCityConfigForm.isPermanent ? null : collegeNewCityConfigForm.blacklistValidDays,
            // 🆕 传递可配置凌晨时间段
            nightStartHour: collegeNewCityConfigForm.nightStartHour,
            nightEndHour: collegeNewCityConfigForm.nightEndHour
        };
        console.log("保存学院新城配置数据：", configData);

        // 调用后端API保存配置
        const res = await violationApi.saveCollegeNewCityConfig(configData);

        console.log('保存学院新城配置结果:', res);

        if (res.data.code === '0') {
            const validDaysText = collegeNewCityConfigForm.isPermanent ? '永久拉黑' : `临时拉黑${collegeNewCityConfigForm.blacklistValidDays}天`;
            ElMessage.success(`配置保存成功：拉黑阈值${collegeNewCityConfigForm.blacklistTimeHours}小时，${validDaysText}`);
            collegeNewCityConfigShow.value = false;

            // 记录操作日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";

            await activityApi.logViolationOperation(
                userId,
                username,
                "配置",
                `设置学院新城拉黑规则：${collegeNewCityConfigForm.blacklistTimeHours}小时，黑名单类型：${collegeNewCityConfigForm.blacklistType}，凌晨时间段：${formatHour(collegeNewCityConfigForm.nightStartHour)}-${formatHour(collegeNewCityConfigForm.nightEndHour)}，${validDaysText}`,
                null,
                JSON.stringify(collegeNewCityConfigForm),
                null
            ).catch(err => {
                console.warn('记录操作日志失败:', err);
            });
        } else {
            ElMessage.error(res.msg || '保存配置失败');
        }
    } catch (error) {
        console.error('❌ 保存学院新城配置失败:', error);
        ElMessage.error('配置保存失败');
    }
};

// 🔍 解析旧格式 description 文本的辅助函数
const parseOldDescriptionFormat = (description) => {
    const result = {
        nightStartTime: null,
        nightEndTime: null,
        nightTimeHours: null,
        vipCheckMode: null,
        vipTicketTypes: [],
        blacklistName: null,
        isPermanent: true,
        blacklistDays: 30
    };

    if (!description || typeof description !== 'string') {
        return result;
    }

    try {
        // 解析夜间时间段：夜间(23:00-06:00)
        const nightTimeMatch = description.match(/夜间\((\d{2}:\d{2})-(\d{2}:\d{2})\)/);
        if (nightTimeMatch) {
            result.nightStartTime = nightTimeMatch[1];
            result.nightEndTime = nightTimeMatch[2];
        }

        // 解析小时数：超过2小时
        const hoursMatch = description.match(/超过(\d+)小时/);
        if (hoursMatch) {
            result.nightTimeHours = parseInt(hoursMatch[1]);
        }

        // 解析VIP检查模式和类型：[待检:类型1,类型2] 或 [免检:类型1,类型2]
        const vipMatch = description.match(/\[(待检|免检):(.*?)\]/);
        if (vipMatch) {
            result.vipCheckMode = vipMatch[1] === '待检' ? 'include' : 'exclude';
            const typesStr = vipMatch[2];
            if (typesStr && typesStr.trim()) {
                result.vipTicketTypes = typesStr.split(',').map(t => t.trim()).filter(t => t);
            }
        }

        // 解析拉黑天数：[拉黑天数:永久] 或 [拉黑天数:30]
        const daysMatch = description.match(/\[拉黑天数:(.*?)\]/);
        if (daysMatch) {
            const daysStr = daysMatch[1].trim();
            if (daysStr === '永久') {
                result.isPermanent = true;
                result.blacklistDays = 9999;
            } else {
                result.isPermanent = false;
                result.blacklistDays = parseInt(daysStr) || 30;
            }
        }

        // 解析黑名单类型：[黑名单类型:类型名]
        const blacklistMatch = description.match(/\[黑名单类型:(.*?)\]/);
        if (blacklistMatch) {
            const blacklistTypeName = blacklistMatch[1].trim();
            // 尝试匹配黑名单类型选项
            const matchedOption = blacklistTypeOptions.value.find(opt =>
                opt.label === blacklistTypeName || opt.value.includes(blacklistTypeName)
            );
            result.blacklistName = matchedOption ? matchedOption.value : '';
        }

        console.log('📝 解析旧格式description结果:', result);
    } catch (e) {
        console.error('❌ 解析旧格式description失败:', e);
    }

    return result;
};

// 🆕 打开万象上东配置弹窗（从后端API读取配置）
const handleWanXiangConfigDialog = async () => {
    console.log('打开万象上东拉黑规则配置弹窗');

    try {
        // 加载月票类型列表
        await loadTicketTypesForPark(wanXiangConfigForm.parkCode);

        // 🆕 加载黑名单类型列表
        await loadBlacklistTypesForPark(wanXiangConfigForm.parkCode);

        // 从后端读取当前配置
        const res = await request.get(`/parking/violations/monthly-ticket-config/${wanXiangConfigForm.parkCode}`);
        console.log('获取万象上东配置:', res);

        if (res.data && res.data.code === '0' && res.data.data) {
            const config = res.data.data;

            // ✅ 从 description JSON 中解析所有配置
            if (config.description) {
                try {
                    const descConfig = JSON.parse(config.description);
                    console.log('📋 解析description配置:', descConfig);

                    // 夜间时间配置
                    wanXiangConfigForm.nightStartTime = config.nightStartTime || descConfig.nightStartTime || "23:00";
                    wanXiangConfigForm.nightEndTime = config.nightEndTime || descConfig.nightEndTime || "06:00";
                    wanXiangConfigForm.nightTimeHours = config.nightTimeHours || descConfig.nightTimeHours || 2;

                    // VIP配置
                    wanXiangConfigForm.vipCheckMode = descConfig.vipCheckMode || "include";
                    wanXiangConfigForm.vipTicketTypes = descConfig.vipTicketTypes || [];

                    // 黑名单配置
                    wanXiangConfigForm.blacklistName = descConfig.blacklistName || (blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "");

                    // 拉黑天数
                    if (descConfig.isPermanent === true || descConfig.blacklistDays === "永久" || descConfig.blacklistDays === 9999) {
                        wanXiangConfigForm.isPermanent = true;
                        wanXiangConfigForm.blacklistDays = 30;
                    } else {
                        wanXiangConfigForm.isPermanent = descConfig.isPermanent === false ? false : true;
                        wanXiangConfigForm.blacklistDays = descConfig.blacklistDays || 30;
                    }

                    // 推送时间段
                    wanXiangConfigForm.notificationStartTime = descConfig.notificationStartTime || "23:00";
                    wanXiangConfigForm.notificationEndTime = descConfig.notificationEndTime || "06:00";

                    console.log('✅ 加载配置成功:', wanXiangConfigForm);
                } catch (e) {
                    console.warn('⚠️ 解析description配置失败（可能是旧格式数据）:', e);
                    console.log('📋 旧格式description内容:', config.description);

                    // 🔍 尝试解析旧格式文本：月票车配置: 夜间(23:00-06:00)超过2小时拉黑 | [待检:类型1,类型2] | [拉黑天数:永久] | [黑名单类型:类型名]
                    const oldConfig = parseOldDescriptionFormat(config.description);

                    // 夜间时间配置（优先使用数据库基础字段）
                    wanXiangConfigForm.nightStartTime = config.nightStartTime || oldConfig.nightStartTime || "23:00";
                    wanXiangConfigForm.nightEndTime = config.nightEndTime || oldConfig.nightEndTime || "06:00";
                    wanXiangConfigForm.nightTimeHours = config.nightTimeHours || oldConfig.nightTimeHours || 2;

                    // VIP配置（从旧格式解析）
                    wanXiangConfigForm.vipCheckMode = oldConfig.vipCheckMode || "include";
                    wanXiangConfigForm.vipTicketTypes = oldConfig.vipTicketTypes || [];

                    // 黑名单配置（从旧格式解析）
                    wanXiangConfigForm.blacklistName = oldConfig.blacklistName || (blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "");

                    // 拉黑天数
                    wanXiangConfigForm.isPermanent = oldConfig.isPermanent !== undefined ? oldConfig.isPermanent : true;
                    wanXiangConfigForm.blacklistDays = oldConfig.blacklistDays || 30;

                    // 推送时间段
                    wanXiangConfigForm.notificationStartTime = "23:00";
                    wanXiangConfigForm.notificationEndTime = "06:00";

                    console.log('✅ 从旧格式解析的配置:', oldConfig);

                    // 提示用户重新保存配置
                    ElMessage.warning({
                        message: '已从旧配置格式中读取配置，请检查后重新保存以升级为新格式。',
                        duration: 5000
                    });
                }
            } else {
                // 没有description，使用默认值
                wanXiangConfigForm.nightStartTime = config.nightStartTime || "23:00";
                wanXiangConfigForm.nightEndTime = config.nightEndTime || "06:00";
                wanXiangConfigForm.nightTimeHours = config.nightTimeHours || 2;
                wanXiangConfigForm.vipCheckMode = "include";
                wanXiangConfigForm.vipTicketTypes = [];
                wanXiangConfigForm.blacklistName = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
                wanXiangConfigForm.isPermanent = true;
                wanXiangConfigForm.blacklistDays = 30;
                wanXiangConfigForm.notificationStartTime = "23:00";
                wanXiangConfigForm.notificationEndTime = "06:00";
            }
        } else {
            // 使用默认值
            wanXiangConfigForm.nightStartTime = "23:00";
            wanXiangConfigForm.nightEndTime = "06:00";
            wanXiangConfigForm.nightTimeHours = 2;
            wanXiangConfigForm.vipCheckMode = "include";
            wanXiangConfigForm.vipTicketTypes = [];
            wanXiangConfigForm.blacklistName = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
            wanXiangConfigForm.isPermanent = true;
            wanXiangConfigForm.blacklistDays = 30;
        }
    } catch (error) {
        console.error('获取万象上东配置失败:', error);
        // 失败时使用默认值
        wanXiangConfigForm.nightStartTime = "23:00";
        wanXiangConfigForm.nightEndTime = "06:00";
        wanXiangConfigForm.nightTimeHours = 2;
        wanXiangConfigForm.vipCheckMode = "include";
        wanXiangConfigForm.vipTicketTypes = [];
        wanXiangConfigForm.blacklistName = blacklistTypeOptions.value.length > 0 ? blacklistTypeOptions.value[0].value : "";
        wanXiangConfigForm.isPermanent = true;
        wanXiangConfigForm.blacklistDays = 30;
    }

    wanXiangConfigShow.value = true;
};

// 🆕 保存万象上东配置（调用后端API保存到数据库）
const handleSaveWanXiangConfig = async () => {
    try {
        // 表单验证
        if (!wanXiangConfigFormRef.value) {
            return;
        }

        const valid = await wanXiangConfigFormRef.value.validate();
        if (!valid) {
            return;
        }

        // 如果是临时拉黑，验证有效天数
        if (!wanXiangConfigForm.isPermanent && (!wanXiangConfigForm.blacklistDays || wanXiangConfigForm.blacklistDays < 1)) {
            ElMessage.warning('请输入拉黑有效天数（至少1天）');
            return;
        }

        // 验证VIP月票类型不能为空
        if (!wanXiangConfigForm.vipTicketTypes || wanXiangConfigForm.vipTicketTypes.length === 0) {
            ElMessage.warning('请至少选择一个VIP月票类型');
            return;
        }

        wanXiangConfigSaving.value = true;

        // 从黑名单类型值中提取名称（格式：code|name）
        const blacklistTypeName = (wanXiangConfigForm.blacklistName || '').split('|').slice(-1)[0] || '';

        // 🕐 构建description JSON（包含所有配置项）
        const descriptionConfig = {
            // 夜间时间配置
            nightStartTime: wanXiangConfigForm.nightStartTime,
            nightEndTime: wanXiangConfigForm.nightEndTime,
            nightTimeHours: wanXiangConfigForm.nightTimeHours,
            // VIP配置
            vipCheckMode: wanXiangConfigForm.vipCheckMode,
            vipTicketTypes: wanXiangConfigForm.vipTicketTypes,
            // 黑名单配置
            blacklistName: wanXiangConfigForm.blacklistName,
            isPermanent: wanXiangConfigForm.isPermanent,
            blacklistDays: wanXiangConfigForm.isPermanent ? 9999 : wanXiangConfigForm.blacklistDays,
            // 推送时间段
            notificationStartTime: wanXiangConfigForm.notificationStartTime || "23:00",
            notificationEndTime: wanXiangConfigForm.notificationEndTime || "06:00"
        };
        const description = JSON.stringify(descriptionConfig);
        console.log('💾 保存description配置:', descriptionConfig);

        // 构建配置数据
        const configData = {
            parkCode: wanXiangConfigForm.parkCode,
            parkName: '万象上东',
            nightStartTime: wanXiangConfigForm.nightStartTime,
            nightEndTime: wanXiangConfigForm.nightEndTime,
            nightTimeHours: wanXiangConfigForm.nightTimeHours,
            enableOvernightCheck: true,
            description: description
        };

        console.log("保存万象上东配置数据：", configData);

        // 调用后端API保存配置
        const res = await request.post('/parking/violations/monthly-ticket-config/save-full', configData);

        console.log('保存万象上东配置结果:', res);

        if (res.data && res.data.code === '0') {
            const validDaysText = wanXiangConfigForm.isPermanent ? '永久拉黑' : `临时拉黑${wanXiangConfigForm.blacklistDays}天`;
            const modeText = wanXiangConfigForm.vipCheckMode === 'include' ? '待检查模式' : '免检模式';
            ElMessage.success(`配置保存成功：${wanXiangConfigForm.nightStartTime}-${wanXiangConfigForm.nightEndTime}超过${wanXiangConfigForm.nightTimeHours}小时，${modeText}，${validDaysText}`);
            wanXiangConfigShow.value = false;

            // 记录操作日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";

            const notificationDesc = `，推送时间段：${wanXiangConfigForm.notificationStartTime}~${wanXiangConfigForm.notificationEndTime}`;

            await activityApi.logViolationOperation(
                userId,
                username,
                "配置",
                `设置万象上东拉黑规则：夜间${wanXiangConfigForm.nightStartTime}-${wanXiangConfigForm.nightEndTime}超过${wanXiangConfigForm.nightTimeHours}小时，${modeText}，VIP类型：${wanXiangConfigForm.vipTicketTypes.join('、')}，黑名单类型：${blacklistTypeName}，${validDaysText}${notificationDesc}`,
                null,
                JSON.stringify(wanXiangConfigForm),
                null
            ).catch(err => {
                console.warn('记录操作日志失败:', err);
            });
        } else {
            ElMessage.error(res.data?.msg || '保存配置失败');
        }
    } catch (error) {
        console.error('❌ 保存万象上东配置失败:', error);
        ElMessage.error('配置保存失败：' + (error.response?.data?.msg || error.message));
    } finally {
        wanXiangConfigSaving.value = false;
    }
};

// 🆕 小时格式化显示，如 0 => 00:00
const formatHour = (h) => {
    const v = Number(h ?? 0);
    const hh = v.toString().padStart(2, '0');
    return `${hh}:00`;
};
</script>

<style lang="scss" scoped>
// 引用预约查询页面的基础样式
// 页面容器样式
.page-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0 16px 16px 16px;
    overflow: hidden;
}

// 主容器样式
.container {
    max-width: 1700px;
    margin: 0 auto;
    padding: 0 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
}

// 页面头部样式
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 0;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
    }

    .page-header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
    }

    .page-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
            .header-icon {
                width: 24px;
                height: 24px;
                filter: brightness(0) invert(1);
            }
        }

        .title-text {
            color: white;

            h1 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 4px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .title-desc {
                font-size: 12px;
                opacity: 0.9;
                margin: 0;
                font-weight: 400;
            }
        }
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(180deg);
    }
}

// 搜索面板样式
.search-panel {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    border: 1px solid #e8eaed;
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s ease;

    .search-panel-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 20px 24px;
        border-bottom: 1px solid #e8eaed;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;

        .search-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;

            .el-icon {
                font-size: 20px;
                color: #667eea;
            }

            .toggle-icon {
                transition: transform 0.3s ease;

                &.expanded {
                    transform: rotate(180deg);
                }
            }
        }
    }

    .search-panel-body {
        padding: 18px;
        background: #ffffff;

        .search-row {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-bottom: 16px;

            .search-item {
                margin-bottom: 0;
                flex: 0 0 auto;
                min-width: 180px;

                &.date-range-item {
                    min-width: 280px;
                }

                :deep(.el-form-item__label) {
                    font-weight: 500;
                    color: #4a5568;
                    font-size: 14px;
                    margin-bottom: 8px;
                }

                .search-select,
                .search-input {
                    width: 160px;
                }

                .date-range-picker {
                    width: 280px;
                }
            }
        }

        .search-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid #e8eaed;
            margin-top: 6px;

            .search-buttons {
                display: flex;
                gap: 12px;
            }

            .action-buttons {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
        }
    }
}

// 表格面板样式
.table-panel {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    border: 1px solid #e8eaed;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;

    .table-panel-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 16px 20px;
        border-bottom: 1px solid #e8eaed;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .table-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;

            .el-icon {
                font-size: 20px;
                color: #e53e3e;
            }
        }

        .table-status {
            font-size: 12px;
        }
    }

    .table-panel-body {
        padding: 0;
        flex: 1;
        overflow-y: auto;

        .modern-table {
            background: #ffffff;
            border-radius: 0;
            overflow: hidden;
            box-shadow: none;

            :deep(.el-table__row) {
                height: 40px;
            }

            :deep(.el-table__header) {
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);

                th {
                    background: transparent !important;
                    color: #2d3748;
                    font-weight: 600;
                    font-size: 14px;
                    padding: 6px 16px;
                    border-bottom: 2px solid #e2e8f0;
                    text-align: left;
                }
            }

            :deep(.el-table__body) {
                tr {
                    transition: all 0.3s ease;

                    &:hover {
                        background: #f7fafc !important;
                        transform: scale(1.002);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }

                    td {
                        padding: 4px 16px;
                        border-bottom: 1px solid #e8eaed;
                        vertical-align: middle;
                    }
                }
            }
        }
    }
}

// 车辆信息单元格样式
.vehicle-info-cell {
    display: flex;
    align-items: center;
    padding: 4px 0;

    .vehicle-details {
        flex: 1;

        .car-number-container {
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;

            .plate-number {
                display: inline-block;
                font-size: 14px;
                font-weight: bold;
                padding: 6px 10px;
                border-radius: 4px;
                font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                letter-spacing: 0.5px;
                min-width: 80px;
                text-align: center;
                transition: all 0.3s ease;

                // 传统燃油车牌 - 蓝色渐变
                &.traditional {
                    background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
                    color: #FFFFFF;
                    border: 1px solid #0C4FC5;
                    box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3);
                }

                // 新能源车牌 - 绿色渐变
                &.new-energy {
                    background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
                    color: #000000;
                    border: 1px solid #6AD390;
                    box-shadow: 0 2px 4px rgba(106, 211, 144, 0.3);
                }

                &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
                }
            }
        }

        .owner-info {
            font-size: 13px;
            color: #718096;

            .owner-name {
                font-weight: 500;
            }

            // 🆕 自动拉黑警告提示样式
            .auto-blacklist-warning {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-top: 4px;
                padding: 4px 8px;
                background: linear-gradient(135deg, #fff7e6 0%, #fffaf0 100%);
                border-radius: 4px;
                border-left: 2px solid #E6A23C;
                font-size: 11px;
                color: #b45309;
                font-weight: 500;

                span {
                    white-space: nowrap;
                }

                .el-icon {
                    font-size: 12px;
                    flex-shrink: 0;
                }
            }
        }

        // 🆕 违规次数徽章样式
        .violation-count-badge {
            :deep(.el-badge__content) {
                font-weight: 600;
                font-size: 11px;
                height: 18px;
                line-height: 18px;
                padding: 0 6px;
                border-radius: 9px;
            }

            :deep(.el-badge__content.is-fixed) {
                top: -2px;
                right: -10px;
            }
        }
    }
}

// 违规信息单元格样式
.violation-info-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
    border-radius: 8px;
    border-left: 3px solid #ef4444;

    .violation-type {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: '⚠️';
            font-size: 14px;
        }

        :deep(.el-tag) {
            font-weight: 600;
            border-radius: 6px;
            padding: 4px 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: none;
        }
    }

    .violation-location,
    .violation-time {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 12px;
        color: #b91c1c;
        font-weight: 500;
        padding: 3px 6px;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 4px;

        .location-icon,
        .time-icon {
            font-size: 13px;
            color: #ef4444;
        }
    }

    .violation-location {
        &::before {
            content: '📍';
            font-size: 11px;
            margin-right: 2px;
        }
    }

    .violation-time {
        &::before {
            content: '🕐';
            font-size: 11px;
            margin-right: 2px;
        }
    }
}

// 车主详细信息单元格样式
.owner-detail-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 8px;
    border-left: 3px solid #0284c7;

    .owner-phone {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        color: #0f172a;
        font-weight: 600;
        padding: 4px 8px;
        background: rgba(2, 132, 199, 0.1);
        border-radius: 6px;

        .phone-icon {
            font-size: 14px;
            color: #0284c7;
        }

        &::before {
            content: '👨‍💼';
            font-size: 12px;
        }
    }

    .owner-address {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 12px;
        color: #075985;
        font-weight: 500;
        padding: 4px 6px;
        background: rgba(2, 132, 199, 0.08);
        border-radius: 4px;

        .address-icon {
            font-size: 13px;
            color: #0284c7;
            margin-top: 1px;
            flex-shrink: 0;
        }

        .address-text {
            line-height: 1.4;
        }

        &::before {
            content: '🏠';
            font-size: 11px;
            margin-right: 2px;
            margin-top: 1px;
        }
    }

    .no-info {
        color: #64748b;
        font-style: italic;
        font-size: 12px;
        text-align: center;
        padding: 8px;
        background: rgba(148, 163, 184, 0.1);
        border-radius: 4px;

        &::before {
            content: '📝';
            font-size: 11px;
            margin-right: 6px;
        }
    }
}

// 图片单元格样式
.image-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 8px;
    border: 2px solid #e2e8f0;

    .photos-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
    }

    .photo-item {
        position: relative;
        width: 80px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;

        &.multiple-photos {
            width: 80px;
            height: 60px;
        }

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            border-color: #3b82f6;
        }

        .violation-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.3s ease;
        }

        .photo-index {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            z-index: 1;
        }
    }

    .demo-image__preview {
        width: 80px;
        height: 60px;
        overflow: hidden;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;

        &::before {
            content: '🔍';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1;
        }

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            border-color: #3b82f6;

            &::before {
                opacity: 1;
            }
        }
    }

    .demo-image__preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s ease;
    }

    .no-image {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 60px;
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        color: #6b7280;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
            border-color: #9ca3af;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .no-image-icon {
            font-size: 24px;
            margin-bottom: 4px;
            color: #9ca3af;
        }

        &::before {
            content: '📷';
            font-size: 18px;
            margin-bottom: 2px;
        }
    }
}

// 操作按钮样式
.action-buttons-inline {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    padding: 0;

    .action-btn-view {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        min-width: 60px;
        height: 30px;
        line-height: 20px;
        transition: all 0.3s ease;
        border: 1px solid transparent;
        white-space: nowrap;
        background: linear-gradient(45deg, #909399, #b1b3b8);
        color: white;
        border: none;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            background: linear-gradient(45deg, #73767a, #9a9ca2);
        }
    }
}

// 分页样式
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px 0;
    background: #ffffff;
    border-radius: 0 0 16px 16px;
    margin-top: 24px;

    :deep(.el-pagination) {
        .el-pager li {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin: 0 4px;
            transition: all 0.3s ease;

            &:hover {
                background: #667eea;
                color: white;
                transform: translateY(-2px);
            }

            &.is-active {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
        }

        .btn-prev,
        .btn-next {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.3s ease;

            &:hover {
                background: #667eea;
                color: white;
            }
        }
    }
}

// 查看弹窗样式
.view-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;

        .el-dialog__header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 24px;
            margin: 0;

            .el-dialog__title {
                color: white;
                font-weight: 600;
                font-size: 18px;
            }

            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: white;
                    font-size: 18px;
                }
            }
        }

        .el-dialog__body {
            padding: 24px;
            max-height: 70vh;
            overflow-y: auto;
        }
    }
}

.detail-content {
    .detail-section {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e8eaed;
            position: relative;

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 40px;
                height: 2px;
                background: linear-gradient(45deg, #667eea, #764ba2);
            }
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;

            .detail-item {
                display: flex;
                align-items: center;
                gap: 8px;

                &.full-width {
                    grid-column: 1 / -1;
                    align-items: flex-start;
                    flex-direction: column;
                    gap: 4px;
                }

                .label {
                    font-weight: 500;
                    color: #606266;
                    white-space: nowrap;
                    min-width: 80px;
                }

                .value {
                    color: #303133;
                    flex: 1;
                    word-break: break-all;
                }

                .plate-number {
                    display: inline-block;
                    font-size: 13px;
                    font-weight: bold;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                    letter-spacing: 0.5px;
                    min-width: 90px;
                    text-align: center;
                    transition: all 0.3s ease;

                    // 传统燃油车牌 - 蓝色渐变
                    &.traditional {
                        background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
                        color: #FFFFFF;
                        border: 1px solid #0C4FC5;
                        box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3);
                    }

                    // 新能源车牌 - 绿色渐变
                    &.new-energy {
                        background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
                        color: #000000;
                        border: 1px solid #6AD390;
                        box-shadow: 0 2px 4px rgba(106, 211, 144, 0.3);
                    }
                }

                .violation-images {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }

                .violation-image-item {
                    position: relative;
                    width: 80px;
                    height: 60px;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid #e2e8f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    &:hover {
                        transform: scale(1.1);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                        border-color: #3b82f6;
                    }

                    .violation-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: all 0.3s ease;
                    }

                    .image-label {
                        position: absolute;
                        bottom: 4px;
                        right: 4px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                        z-index: 1;
                    }
                }
            }

            @media (max-width: 768px) {
                grid-template-columns: 1fr;

                .detail-item {
                    &.full-width {
                        grid-column: 1;
                    }
                }
            }
        }
    }
}

// 兼容原有样式
.odd-row {
    background-color: rgb(241, 242, 244) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}

/* 响应式布局 */
@media (max-width: 1200px) {
    .search-panel .search-panel-body {
        .search-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;

            .search-item {
                flex: 1;
                min-width: unset;

                &.date-range-item {
                    min-width: unset;
                }

                .search-select,
                .search-input,
                .date-range-picker {
                    width: 100%;
                }
            }
        }

        .search-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;

            .search-buttons,
            .action-buttons {
                justify-content: center;
                flex-wrap: wrap;
            }
        }
    }
}

// 多张图片容器样式
.photos-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    .photo-item {
        position: relative;
        width: 80px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &.multiple-photos {
            width: 70px;
            height: 50px;
        }

        .violation-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.3s ease;
        }

        .photo-index {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 10px;
            text-align: center;
            padding: 2px 4px;
            font-weight: 500;
        }

        &:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-color: #3b82f6;
        }
    }
}

// 详情弹窗中的多张图片样式
.violation-images {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;

    .violation-image-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .violation-image {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            &:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                border-color: #3b82f6;
            }
        }

        .image-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
    }
}

// 当只有一张图片时的样式调整
.photos-container:has(.photo-item:only-child) {
    .photo-item {
        width: 80px;
        height: 60px;

        .photo-index {
            display: none;
        }
    }
}

// 🆕 月票车配置弹窗样式
.config-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;

        .el-dialog__header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 24px;
            margin: 0;

            .el-dialog__title {
                color: white;
                font-weight: 600;
                font-size: 18px;
            }

            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: white;
                    font-size: 18px;
                }
            }
        }

        .el-dialog__body {
            padding: 24px;
        }
    }
}

.config-content {
    .config-info {
        margin-bottom: 24px;
        padding: 16px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 8px;
        border-left: 4px solid #0284c7;

        .config-desc {
            margin: 0;
            font-size: 14px;
            color: #0f172a;
            line-height: 1.6;

            code {
                background: rgba(2, 132, 199, 0.1);
                color: #0284c7;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-weight: 600;
            }
        }
    }

    .form-tip {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }

    // 🆕 折叠框容器样式
    .config-rules-container {
        margin-top: 24px;

        :deep(.el-collapse) {
            border-radius: 8px;
            border: 1px solid #e8eaed;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .el-collapse-item {
                border-bottom: none;

                .el-collapse-item__header {
                    background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
                    border-bottom: 1px solid #f59e0b;
                    padding: 16px 20px;
                    font-weight: 600;
                    color: #92400e;
                    transition: all 0.3s ease;

                    &:hover {
                        background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
                        color: #78350f;
                    }

                    .el-collapse-item__arrow {
                        color: #f59e0b;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    }
                }

                .el-collapse-item__wrap {
                    background: #ffffff;
                    border-bottom: none;

                    .el-collapse-item__content {
                        padding: 0;
                    }
                }
            }
        }

        .collapse-title {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;

            .title-icon {
                font-size: 16px;
            }

            .title-text {
                font-size: 14px;
                font-weight: 600;
                color: #92400e;
            }

            .title-subtitle {
                font-size: 12px;
                font-weight: 400;
                color: #a16207;
                font-style: italic;
                margin-left: auto;
            }
        }
    }

    .config-rules {
        padding: 20px;
        background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
        margin: 0;

        ul {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 12px;
                font-size: 13px;
                color: #78350f;
                line-height: 1.6;

                strong {
                    color: #92400e;
                }

                &:last-child {
                    margin-bottom: 0;
                }

                ul {
                    margin-top: 8px;
                    padding-left: 16px;

                    li {
                        margin-bottom: 4px;
                        font-size: 12px;
                        color: #a16207;
                        line-height: 1.4;

                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                }
            }
        }
    }
}

// 🆕 处理状态单元格样式
.process-status-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px;

    .process-type-tag {
        width: 100%;
    }

    .process-info {
        width: 145rpx;
        margin-top: 8px;
        padding: 8px;
        background: #f8fafc;
        border-radius: 4px;
        font-size: 12px;

        .process-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;

            &:last-child {
                margin-bottom: 0;
            }

            .process-label {
                color: #64748b;
                font-weight: 500;
            }

            .process-value {
                color: #1e293b;

                &.remark-text {
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}

// 🆕 东北林业大学配置弹窗样式
.nebu-config-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;

        .el-dialog__header {
            background: linear-gradient(135deg, #f56c6c 0%, #ef4444 100%);
            color: white;
            padding: 20px 24px;
            margin: 0;

            .el-dialog__title {
                color: white;
                font-weight: 600;
                font-size: 18px;
            }

            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: white;
                    font-size: 18px;
                }
            }
        }

        .el-dialog__body {
            padding: 24px;
        }
    }
}

.nebu-config-content {
    .config-info {
        margin-bottom: 24px;
        padding: 16px;
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        border-radius: 8px;
        border-left: 4px solid #ef4444;

        .config-desc {
            margin: 0;
            font-size: 14px;
            color: #7f1d1d;
            line-height: 1.6;

            code {
                background: rgba(239, 68, 68, 0.1);
                color: #dc2626;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-weight: 600;
            }
        }
    }

    .nebu-rules-info {
        padding: 16px;
        background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
        border-radius: 8px;
        border-left: 4px solid #f59e0b;

        ul {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 10px;
                font-size: 13px;
                color: #78350f;
                line-height: 1.6;

                strong {
                    color: #92400e;
                }

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

    .form-tip {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }
}

// 🆕 学院新城配置弹窗样式
.college-new-city-config-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;

        .el-dialog__header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px 24px;
            margin: 0;

            .el-dialog__title {
                color: white;
                font-weight: 600;
                font-size: 18px;
            }

            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: white;
                    font-size: 18px;
                }
            }
        }

        .el-dialog__body {
            padding: 24px;
        }
    }
}

.college-new-city-config-content {
    .config-info {
        margin-bottom: 24px;
        padding: 16px;
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border-radius: 8px;
        border-left: 4px solid #10b981;

        .config-desc {
            margin: 0;
            font-size: 14px;
            color: #064e3b;
            line-height: 1.6;

            code {
                background: rgba(16, 185, 129, 0.1);
                color: #047857;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-weight: 600;
            }
        }
    }

    .college-new-city-rules-info {
        padding: 16px;
        background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
        border-radius: 8px;
        border-left: 4px solid #f59e0b;

        ul {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 10px;
                font-size: 13px;
                color: #78350f;
                line-height: 1.6;

                strong {
                    color: #92400e;
                }

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

    .form-tip {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }
}

// 🆕 万象上东配置弹窗样式
.wan-xiang-config-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;

        .el-dialog__header {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: white;
            padding: 20px 24px;
            margin: 0;

            .el-dialog__title {
                color: white;
                font-weight: 600;
                font-size: 18px;
            }

            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: white;
                    font-size: 18px;
                }
            }
        }

        .el-dialog__body {
            padding: 24px;
        }
    }
}

.wan-xiang-config-content {
    .config-info {
        margin-bottom: 24px;
        padding: 16px;
        background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
        border-radius: 8px;
        border-left: 4px solid #0284c7;

        .config-desc {
            margin: 0;
            font-size: 14px;
            color: #0f172a;
            line-height: 1.6;

            code {
                background: rgba(2, 132, 199, 0.1);
                color: #0284c7;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-weight: 600;
            }
        }
    }

    // 折叠容器样式
    .wan-xiang-rules-container {
        margin-top: 24px;

        :deep(.el-collapse) {
            border-radius: 8px;
            border: 1px solid #bae6fd;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.1);

            .el-collapse-item {
                border-bottom: none;

                .el-collapse-item__header {
                    background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
                    border-bottom: 1px solid #7dd3fc;
                    padding: 16px 20px;
                    font-weight: 600;
                    color: #0369a1;
                    transition: all 0.3s ease;

                    &:hover {
                        background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
                        color: #0c4a6e;
                    }

                    .el-collapse-item__arrow {
                        color: #0284c7;
                        font-weight: bold;
                    }
                }

                .el-collapse-item__content {
                    padding: 0;
                    background: #f0f9ff;
                }
            }
        }

        .collapse-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
        }
    }

    .wan-xiang-rules-info {
        padding: 20px;

        .rules-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .rule-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e0f2fe;
                transition: all 0.2s ease;

                &:hover {
                    border-color: #0284c7;
                    box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15);
                    transform: translateY(-2px);
                }

                &.highlight {
                    background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
                    border-color: #f59e0b;

                    strong {
                        color: #b45309;
                    }
                }

                .rule-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .rule-content {
                    flex: 1;

                    strong {
                        display: block;
                        font-size: 14px;
                        color: #0369a1;
                        margin-bottom: 4px;
                    }

                    p {
                        margin: 0;
                        font-size: 13px;
                        color: #64748b;
                        line-height: 1.5;
                    }
                }
            }
        }
    }

    .form-tip {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }
}

// 批量处理弹窗样式
.batch-process-dialog {
    .batch-info {
        margin-bottom: 20px;
    }
}

// 🆕 违规统计弹窗样式
.statistics-dialog {
    :deep(.el-dialog__header) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px 24px;

        .el-dialog__title {
            color: white;
            font-weight: 600;
            font-size: 18px;
        }

        .el-dialog__headerbtn {
            .el-dialog__close {
                color: white;
                font-size: 20px;

                &:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }
    }

    :deep(.el-dialog__body) {
        padding: 0;
        background: #f8fafc;
    }
}

// 时间选择器样式
.time-selector {
    padding: 20px 24px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 12px;
}

// 统计弹窗内容样式
.statistics-dialog-content {
    padding: 24px;
    min-height: 400px;

    .stats-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 32px;
    }

    .stat-card {
        display: flex;
        align-items: center;
        padding: 20px;
        background: white;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;

        .el-icon {
            font-size: 24px;
        }

        &.warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #d97706;
        }

        &.pending {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #2563eb;
        }

        &.processed {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #059669;
        }

        &.blacklisted {
            background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
            color: #dc2626;
        }
    }

    .stat-content {
        flex: 1;
    }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1.2;
        margin-bottom: 6px;
    }

    .stat-label {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
    }

    // 单图表布局
    .single-chart {
        margin-top: 24px;
    }

    .chart-box {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #f1f5f9;
        transition: all 0.3s ease;
        
        &:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
        }

        .chart-header {
            margin-bottom: 20px;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 12px;

            .header-content {
                .chart-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 8px 0;

                    .el-icon {
                        color: #667eea;
                    }
                }

                .chart-subtitle {
                    font-size: 14px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .total-count {
                        color: #dc2626;
                        font-weight: 600;
                    }
                }
            }
        }

        .chart-content {
            width: 100%;
            height: 350px;
        }
        
        // Top值提醒区域样式
        .top-alerts {
            margin: 16px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
            
            .alert-item {
                display: flex;
                align-items: center;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.3s ease;
                
                .alert-icon {
                    margin-right: 8px;
                    font-size: 16px;
                }
                
                .alert-text {
                    flex: 1;
                    line-height: 1.4;
                    
                    // 提醒中的车牌样式
                    :deep(.styled-plate-number) {
                        display: inline-block;
                        font-size: 12px;
                        font-weight: bold;
                        padding: 3px 6px;
                        border-radius: 3px;
                        font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                        letter-spacing: 0.3px;
                        margin: 0 2px;
                        vertical-align: middle;
                        
                        // 传统燃油车牌 - 蓝色渐变
                        &.traditional {
                            background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
                            color: #FFFFFF;
                            border: 1px solid #0C4FC5;
                            box-shadow: 0 1px 2px rgba(12, 79, 197, 0.3);
                        }
                        
                        // 新能源车牌 - 绿色渐变
                        &.new-energy {
                            background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
                            color: #000000;
                            border: 1px solid #6AD390;
                            box-shadow: 0 1px 2px rgba(106, 211, 144, 0.3);
                        }
                    }
                }
                
                &.danger {
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    color: #dc2626;
                    border-left: 4px solid #ef4444;
                    
                    .alert-icon {
                        color: #ef4444;
                    }
                    
                    &:hover {
                        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                        transform: translateX(2px);
                    }
                }
                
                &.warning {
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    color: #d97706;
                    border-left: 4px solid #f59e0b;
                    
                    .alert-icon {
                        color: #f59e0b;
                    }
                    
                    &:hover {
                        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        transform: translateX(2px);
                    }
                }
                
                &.success {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    color: #059669;
                    border-left: 4px solid #10b981;
                    
                    .alert-icon {
                        color: #10b981;
                    }
                    
                    &:hover {
                        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                        transform: translateX(2px);
                    }
                }
                
                &.info {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    color: #0284c7;
                    border-left: 4px solid #0ea5e9;
                    
                    .alert-icon {
                        color: #0ea5e9;
                    }
                    
                    &:hover {
                        background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                        transform: translateX(2px);
                    }
                }
            }
        }
    }

    // 高频违规车辆Top10样式（保留但不使用）
    .top-violators-section {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;

                .el-icon {
                    color: #f59e0b;
                }
            }

            .time-filter {
                :deep(.el-radio-group) {
                    .el-radio-button {
                        .el-radio-button__inner {
                            border-color: #d1d5db;
                            color: #6b7280;
                            background: white;
                            font-size: 12px;
                            padding: 8px 16px;

                            &:hover {
                                color: #4f46e5;
                                border-color: #4f46e5;
                            }
                        }

                        &.is-active {
                            .el-radio-button__inner {
                                background: #4f46e5;
                                border-color: #4f46e5;
                                color: white;
                            }
                        }
                    }
                }
            }
        }

        .top-violators-content {
            .empty-data {
                text-align: center;
                padding: 40px 20px;
                color: #9ca3af;
            }

            .violators-list {
                .violator-item {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    margin-bottom: 12px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;

                    &:hover {
                        transform: translateX(4px);
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }

                    &.top-three {
                        border-left: 4px solid #f59e0b;
                        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    }

                    .rank {
                        margin-right: 20px;

                        .rank-number {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            font-weight: 700;
                            font-size: 14px;

                            &.rank-first {
                                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                                color: white;
                            }

                            &.rank-second {
                                background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
                                color: white;
                            }

                            &.rank-third {
                                background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                                color: white;
                            }

                            &.rank-normal {
                                background: #f3f4f6;
                                color: #6b7280;
                            }
                        }
                    }

                    .plate-info {
                        flex: 1;
                        margin-right: 16px;

                        .plate-number {
                            font-size: 16px;
                            font-weight: 700;
                            margin-bottom: 6px;
                            padding: 6px 12px;
                            border-radius: 6px;
                            display: inline-block;
                            font-family: 'Courier New', monospace;

                            &.normal-plate {
                                background: #1e40af;
                                color: white;
                                border: 1px solid #1e40af;
                            }

                            &.new-energy-plate {
                                background: #059669;
                                color: white;
                                border: 1px solid #059669;
                            }
                        }

                        .violation-types {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            flex-wrap: wrap;

                            .more-types {
                                font-size: 12px;
                                color: #6b7280;
                                font-style: italic;
                            }
                        }
                    }

                    .violation-count {
                        text-align: center;
                        margin-right: 20px;

                        .count-number {
                            font-size: 24px;
                            font-weight: 700;
                            color: #dc2626;
                            line-height: 1;
                        }

                        .count-label {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 2px;
                        }
                    }

                    .progress-bar {
                        width: 80px;
                        height: 8px;
                        background: #f3f4f6;
                        border-radius: 4px;
                        overflow: hidden;
                        position: relative;

                        .progress-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%);
                            border-radius: 4px;
                            transition: width 0.8s ease;
                        }
                    }
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .statistics-dialog-content {
        padding: 16px;

        .stats-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 24px;

            .stat-card {
                padding: 16px;

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    margin-right: 12px;

                    .el-icon {
                        font-size: 20px;
                    }
                }

                .stat-content {
                    .stat-value {
                        font-size: 22px;
                    }

                    .stat-label {
                        font-size: 12px;
                    }
                }
            }
        }

        .top-violators-section {
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;

                .section-title {
                    font-size: 16px;
                }
            }

            .violators-list {
                .violator-item {
                    padding: 12px 16px;

                    .plate-info {
                        .plate-number {
                            font-size: 14px;
                            padding: 4px 8px;
                        }
                    }

                    .violation-count {
                        .count-number {
                            font-size: 20px;
                        }
                    }

                    .progress-bar {
                        width: 60px;
                    }
                }
            }
        }
    }
}
</style>