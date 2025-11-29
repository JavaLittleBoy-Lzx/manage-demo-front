<template>
    <div class="appointment-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <Calendar />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>预约查询</h1>
                        <p class="title-desc">查询和管理车辆预约记录，跟踪预约状态</p>
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
                                <el-form-item label="小区名称" class="search-item">
                                    <el-select v-model="query.community" placeholder="请选择小区名称" clearable
                                        class="search-select" filterable>
                                        <el-option v-for="item in communityList" :key="item.community"
                                            :label="item.community" :value="item.community" />
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="车牌号码" class="search-item">
                                    <el-input v-model="query.plateNumber" placeholder="请输入车牌号码" clearable
                                        class="search-input" />
                                </el-form-item>
                                <el-form-item label="预约日期" class="search-item">
                                    <el-date-picker v-model="query.visitdate" type="date" placeholder="选择预约日期"
                                        format="YYYY-MM-DD" value-format="YYYY-MM-DD" clearable class="search-select" />
                                </el-form-item>
                                <el-form-item label="预约状态" class="search-item">
                                    <el-select v-model="query.auditstatus" placeholder="请选择状态" clearable
                                        class="search-select">
                                        <el-option v-for="item in statusList" :key="item.auditstatus"
                                            :label="item.auditstatus" :value="item.auditstatus" />
                                    </el-select>
                                </el-form-item>
                            </div>

                            <!-- 操作按钮行 -->
                            <div class="search-actions">
                                <div class="search-buttons">
                                    <el-button type="warning" icon="Refresh" @click="handleReset" size="small">
                                        重置
                                    </el-button>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                                        搜索
                                    </el-button>
                                </div>

                                <div class="action-buttons">
                                    <el-button type="success" icon="Download" @click="handleExport" size="small">
                                        导出数据
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>

            <!-- 预约列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <Calendar />
                        </el-icon>
                        <span>预约记录列表</span>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable" :cell-style="cellStyle"
                        :row-class-name="tableRowClassName" height="430" stripe>

                        <!-- 预约信息列 -->
                        <el-table-column label="预约信息" width="200" fixed="left">
                            <template #default="{ row }">
                                <div class="appointment-info-cell">
                                    <div class="appointment-details">
                                        <div class="car-number-container">
                                            <span :class="['plate-number', getPlateType(row.platenumber)]">
                                                {{ row.platenumber }}
                                            </span>
                                        </div>
                                        <div class="visit-date">
                                            <el-icon class="date-icon">
                                                <Calendar />
                                            </el-icon>
                                            {{ row.visitdate }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 业主信息列 -->
                        <el-table-column label="业主信息" width="220">
                            <template #default="{ row }">
                                <div class="owner-info-cell">
                                    <div class="owner-name">{{ row.ownername }}</div>
                                    <div class="owner-phone">{{ row.ownerphone }}</div>
                                    <div class="visitor-phone">访客：{{ row.visitorphone }}</div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 地址信息列 -->
                        <el-table-column label="地址信息" width="250">
                            <template #default="{ row }">
                                <div class="address-info-cell">
                                    <div class="address-main">
                                        {{ row.province }}-{{ row.city }}-{{ row.district }}
                                    </div>
                                    <div class="address-community">{{ row.community }}</div>
                                    <div class="address-detail">
                                        {{ row.building }}栋{{ row.units }}单元{{ row.floor }}楼{{ row.room }}房
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 预约详情列 -->
                        <el-table-column label="预约详情" width="260">
                            <template #default="{ row }">
                                <div class="appointment-detail-cell">
                                    <div class="visit-reason">
                                        <span class="detail-label">目的：</span>
                                        <span class="detail-value">{{ row.visitreason }}</span>
                                    </div>
                                    <div class="appointment-type">
                                        <span class="detail-label">类型：</span>
                                        <el-tag size="small" type="info">{{ row.appointtype }}</el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 审核信息列 -->
                        <el-table-column label="审核信息" width="260">
                            <template #default="{ row }">
                                <div class="audit-info-cell">
                                    <div class="audit-status">
                                        <el-tag :type="getStatusType(row.auditstatus)" size="small">
                                            {{ row.auditstatus }}
                                        </el-tag>
                                    </div>
                                    <div v-if="row.auditusername" class="audit-user">
                                        <span class="detail-label">审核人：</span>
                                        <span class="detail-value">{{ row.auditusername }}</span>
                                    </div>
                                    <div v-if="row.auditdate" class="audit-date">
                                        <span class="detail-label">审核时间：</span>
                                        <span class="detail-value">{{ row.auditdate }}</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="180" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="info" text icon="View" @click="handleView(row)"
                                        class="action-btn-view">
                                        详情
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
                    @current-change="handlePageChange">
                </el-pagination>
            </div>
        </div>

        <!-- 详情查看弹窗 -->
        <el-dialog title="预约详情" v-model="viewShow" width="600px" class="view-dialog">
            <div class="detail-content">
                <div class="detail-section">
                    <h3 class="section-title">预约信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">车牌号码：</span>
                            <span :class="['plate-number', getPlateType(viewData.platenumber)]">
                                {{ viewData.platenumber }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="label">预约日期：</span>
                            <span class="value">{{ viewData.visitdate }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">预约类型：</span>
                            <span class="value">{{ viewData.appointtype }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">来访目的：</span>
                            <span class="value">{{ viewData.visitreason }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">业主信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">业主姓名：</span>
                            <span class="value">{{ viewData.ownername }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">业主电话：</span>
                            <span class="value">{{ viewData.ownerphone }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">访客电话：</span>
                            <span class="value">{{ viewData.visitorphone }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">地址信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item full-width">
                            <span class="label">详细地址：</span>
                            <span class="value">
                                {{ viewData.province }}{{ viewData.city }}{{ viewData.district }}
                                {{ viewData.community }}{{ viewData.building }}栋{{ viewData.units }}单元{{ viewData.floor
                                }}楼{{
                                viewData.room }}房
                            </span>
                        </div>
                    </div>
                </div>

                <div class="detail-section" v-if="viewData.auditusername">
                    <h3 class="section-title">审核信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">审核状态：</span>
                            <el-tag :type="getStatusType(viewData.auditstatus)" size="small">
                                {{ viewData.auditstatus }}
                            </el-tag>
                        </div>
                        <div class="detail-item">
                            <span class="label">审核人：</span>
                            <span class="value">{{ viewData.auditusername }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="label">审核时间：</span>
                            <span class="value">{{ viewData.auditdate }}</span>
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
    </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { Calendar, Search, ArrowDown, View, Download, Refresh } from '@element-plus/icons-vue';
import { activityApi } from "@/api/activity";

const root = "/parking/appointment/";
const router = useRouter();
const route = useRoute();
const store = useStore();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);
const communityList = ref([]);

const props = [
    { label: "省份", prop: "province" },
    { label: "地市", prop: "city" },
    { label: "区县", prop: "district" },
    { label: "小区", prop: "community" },
    { label: "栋号", prop: "building" },
    { label: "单元", prop: "units" },
    { label: "楼层", prop: "floor" },
    { label: "房号", prop: "room" },
    { label: "预约日期", prop: "visitdate" },
    { label: "访客电话", prop: "visitorphone" },
    { label: "房号", prop: "room" },
    { label: "车牌号码", prop: "platenumber" },
    { label: "状态", prop: "auditstatus" },
    { label: "业主姓名", prop: "ownername" },
    { label: "业主电话", prop: "ownerphone" },
    { label: "来访目的", prop: "visitreason" },
    { label: "预约类型", prop: "appointtype" },
    { label: "审核人", prop: "auditusername" },
    { label: "审核日期", prop: "auditdate" },
];

// 导出报表的按钮
const handleExport = () => {
    ElMessage.info("导出功能开发中...");

    // 记录活动日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";
    activityApi.logAppointmentOperation(
        userId,
        username,
        "导出",
        "导出预约记录数据",
        null,
        null,
        JSON.stringify({ action: "export", timestamp: new Date().toISOString() })
    ).catch(err => {
        console.error("记录活动日志失败:", err);
    });
};

const statusList = ref([{ auditstatus: "待审批" }, { auditstatus: "已通过" }, { auditstatus: "未通过" }]);

const viewShow = ref(false);
const viewData = ref({});
const content1 = ref("");

const handleView = (row) => {
    viewShow.value = true;
    viewData.value = { ...row };
};

const query = reactive({
    community: "",
    plateNumber: "",
    visitdate: "",
    auditstatus: "",
    pageNum: 1,
    pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId");
const dialogVisible = ref(false);

// 获取表格数据
const getData = () => {
    request
        .get(root + "allpage", {
            params: query,
        })
        .then((res) => {
            tableData.value = res.data.records;
            console.log(res.data.records);
            pageTotal.value = res.data.total;
        });
};

// 获取小区列表数据
const getCommunityList = () => {
    console.log("开始获取小区列表...");

    // 尝试获取所有小区数据
    request.get("/parking/community/allCommunity").then((res) => {
        console.log("专门小区接口返回:", res);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            communityList.value = res.data;
            console.log("小区列表加载成功:", communityList.value);
        } else {
            console.log("专门小区接口无数据，尝试从预约数据提取");
            getCommunityFromAppointments();
        }
    }).catch((error) => {
        console.log("专门小区接口失败:", error);
        // 如果专门的接口不存在，可以从现有的预约数据中提取小区信息
        getCommunityFromAppointments();
    });
};

// 从预约数据中提取小区信息
const getCommunityFromAppointments = () => {
    request.get(root + "allpage", {
        params: { pageNum: 1, pageSize: 1000 } // 获取足够多的数据来提取小区信息
    }).then((res) => {
        if (res.data && res.data.records && Array.isArray(res.data.records)) {
            // 提取所有唯一的小区名称
            const communities = [...new Set(res.data.records.map(item => item.community).filter(community => community))];
            communityList.value = communities.map(community => ({ community }));
            console.log("小区列表设置完成:", communityList.value);
        }
    }).catch((error) => {
        console.error("从预约数据提取小区信息失败:", error);
    });
};

getData();
getCommunityList();

// 查询操作
const handleSearch = async () => {
    try {
        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";

        // 构建查询条件描述
        const searchConditions = [];
        if (query.community) searchConditions.push(`小区: ${query.community}`);
        if (query.plateNumber) searchConditions.push(`车牌号: ${query.plateNumber}`);
        if (query.visitdate) searchConditions.push(`预约日期: ${query.visitdate}`);
        if (query.auditstatus) searchConditions.push(`审核状态: ${query.auditstatus}`);

        const searchDescription = searchConditions.length > 0
            ? `查询预约信息 (${searchConditions.join(', ')})`
            : '查询所有预约信息';

        await activityApi.logAppointmentOperation(
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

        query.pageNum = 1;
        getData();
    } catch (error) {
        console.error("查询操作失败:", error);
        // 即使日志记录失败，也要继续执行查询
        query.pageNum = 1;
        getData();
    }
};

// 重置操作
const handleReset = () => {
    query.community = "";
    query.plateNumber = "";
    query.visitdate = "";
    query.auditstatus = "";
    query.pageNum = 1;
    getData();
};

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 分页大小
const handleSizeChange = (val) => {
    query.pageSize = val;
    getData();
};

// 分页导航
const handlePageChange = (val) => {
    query.pageNum = val;
    getData();
};

// 获取状态类型
const getStatusType = (status) => {
    const statusMap = {
        '待审批': 'warning',
        '已通过': 'success',
        '未通过': 'danger'
    };
    return statusMap[status] || 'info';
};

// 判断车牌类型（新能源 vs 油车）
const getPlateType = (plateNumber) => {
    if (!plateNumber) return 'traditional';

    const plate = plateNumber.trim().toUpperCase();

    // 新能源车牌特征：
    // 1. 8位车牌（新能源专用号牌）
    // 2. 包含字母D或F的新能源号牌
    // 3. 绿色车牌模式（通常8位，第2位或最后一位是字母）
    if (plate.length === 8) {
        // 8位车牌通常是新能源
        return 'new-energy';
    } else if (plate.length === 7) {
        // 7位车牌中，如果第6位是D或F，则为新能源
        if (plate.charAt(5) === 'D' || plate.charAt(5) === 'F') {
            return 'new-energy';
        }
        // 或者包含特定的新能源标识
        if (plate.includes('D') || plate.includes('F')) {
            return 'new-energy';
        }
    }

    return 'traditional';
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);

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
</script>

<style lang="scss" scoped>
// 引入黑名单页面的样式结构
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

        .table-title {
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

// 预约信息单元格样式
.appointment-info-cell {
    display: flex;
    align-items: center;
    padding: 4px 0;

    .appointment-details {
        flex: 1;

        .car-number-container {
            margin-bottom: 6px;

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

        .visit-date {
            font-size: 13px;
            color: #718096;
            display: flex;
            align-items: center;
            gap: 4px;

            .date-icon {
                font-size: 12px;
            }
        }
    }
}

// 业主信息单元格样式
.owner-info-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #f8fbff 0%, #f1f6ff 100%);
    border-radius: 8px;
    border-left: 3px solid #667eea;

    .owner-name {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: '👤';
            font-size: 14px;
        }
    }

    .owner-phone,
    .visitor-phone {
        color: #4a5568;
        font-size: 12px;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 6px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 4px;

        &::before {
            content: '📱';
            font-size: 11px;
        }
    }

    .visitor-phone {
        background: rgba(16, 185, 129, 0.1);

        &::before {
            content: '🎭';
        }
    }
}

// 地址信息单元格样式
.address-info-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border-radius: 8px;
    border-left: 3px solid #10b981;

    .address-main {
        font-weight: 600;
        color: #065f46;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        background: rgba(16, 185, 129, 0.15);
        border-radius: 6px;

        &::before {
            content: '🌍';
            font-size: 13px;
        }
    }

    .address-community {
        color: #047857;
        margin-bottom: 4px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: '🏘️';
            font-size: 12px;
        }
    }

    .address-detail {
        color: #059669;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 6px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 4px;

        &::before {
            content: '🏠';
            font-size: 11px;
        }
    }
}

// 预约详情单元格样式
.appointment-detail-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #fef3e2 0%, #fef7ed 100%);
    border-radius: 8px;
    border-left: 3px solid #f59e0b;

    .visit-reason {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
        background: rgba(245, 158, 11, 0.1);
        border-radius: 6px;

        .detail-label {
            font-weight: 600;
            color: #92400e;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
                content: '🎯';
                font-size: 12px;
            }
        }

        .detail-value {
            color: #b45309;
            font-weight: 500;
            padding-left: 18px;
        }
    }

    .appointment-type {
        display: flex;
        align-items: center;
        gap: 6px;

        .detail-label {
            font-weight: 600;
            color: #92400e;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
                content: '📋';
                font-size: 12px;
            }
        }

        :deep(.el-tag) {
            font-weight: 500;
            border-radius: 6px;
            padding: 4px 8px;
        }
    }
}

// 审核信息单元格样式
.audit-info-cell {
    font-size: 13px;
    line-height: 1.4;
    padding: 8px;
    background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
    border-radius: 8px;
    border-left: 3px solid #8b5cf6;

    .audit-status {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: '✅';
            font-size: 14px;
        }

        :deep(.el-tag) {
            font-weight: 600;
            border-radius: 6px;
            padding: 4px 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    }

    .audit-user,
    .audit-date {
        margin-bottom: 4px;
        padding: 3px 6px;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 6px;

        .detail-label {
            font-weight: 600;
            color: #6d28d9;
            white-space: nowrap;
        }

        .detail-value {
            color: #7c3aed;
            font-weight: 500;
        }
    }

    .audit-user {
        .detail-label::before {
            content: '👨‍💼';
            font-size: 12px;
            margin-right: 2px;
        }
    }

    .audit-date {
        .detail-label::before {
            content: '📅';
            font-size: 12px;
            margin-right: 2px;
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

                .search-select,
                .search-input {
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
</style>