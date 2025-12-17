<template>
    <div class="notifier-info-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <img src="..//../icons/svg-black/NotifierInfo.svg" alt="商场信息管理" class="header-icon" />
                    </div>
                    <div class="title-text">
                        <h1>商场信息管理</h1>
                        <p class="title-desc">管理商户及通知人信息，包括商户名称、通知人配置和联系方式</p>
                    </div>
                </div>
                <div class="page-actions">
                    <el-button type="primary" icon="Plus" @click="handleAdd" size="large" class="add-btn">
                        新增商户
                    </el-button>
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
                            <div class="search-row">
                                <el-form-item label="商场名称" class="search-item">
                                    <el-input v-model="query.merchantName" placeholder="请输入商场名称" clearable
                                        class="search-input" />
                                </el-form-item>

                                <!-- 操作按钮紧跟搜索框 -->
                                <div class="search-buttons-inline">
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                                        搜索
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>

            <!-- 数据表格面板 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <Shop />
                        </el-icon>
                        <span>商户信息列表</span>
                    </div>
                    <div class="table-stats">
                        共 {{ pageTotal }} 条记录
                    </div>
                </div>

                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable"
                        :row-class-name="tableRowClassName" :cell-style="cellStyle" stripe>
                        <!-- 商户信息列 -->
                        <el-table-column label="商户信息" width="300" fixed="left">
                            <template #default="{ row }">
                                <div class="merchant-info-cell">
                                    <div class="merchant-icon">
                                        <el-icon>
                                            <Shop />
                                        </el-icon>
                                    </div>
                                    <div class="merchant-details">
                                        <div class="merchant-name">{{ row.merchantName }}</div>
                                        <div class="notifier-info">
                                            <el-icon>
                                                <User />
                                            </el-icon>
                                            <span>{{ row.notifierName }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 通知人详情列 -->
                        <el-table-column label="通知人详情" width="250">
                            <template #default="{ row }">
                                <div class="notifier-detail-cell">
                                    <div class="detail-item">
                                        <el-icon>
                                            <User />
                                        </el-icon>
                                        <span class="detail-label">姓名：</span>
                                        <span class="detail-value">{{ row.notifierName }}</span>
                                    </div>
                                    <div class="detail-item">
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 创建时间列 -->
                        <el-table-column label="创建时间" prop="gmtCreate" width="250" align="center">
                            <template #default="{ row }">
                                <div class="time-cell">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>{{ row.gmtCreate }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 修改时间列 -->
                        <el-table-column label="修改时间" prop="gmtModified" width="250" align="center">
                            <template #default="{ row }">
                                <div class="time-cell">
                                    <el-icon>
                                        <EditPen />
                                    </el-icon>
                                    <span>{{ row.gmtModified }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="250" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons">
                                    <el-button type="primary" link size="small" @click="handleEdit(row)" icon="Edit">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" link size="small"
                                        @click="handleDelete(tableData.indexOf(row), row.id)" icon="Delete">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <div class="pagination">
                        <el-pagination :current-page="query.pageNum" :page-sizes="[10, 20, 40]"
                            :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper"
                            :total="pageTotal" @size-change="handleSizeChange" @current-change="handlePageChange" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 商场信息编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="form.data.id ? '修改商场信息' : '新增商场信息'" width="500px"
            class="modern-dialog" :close-on-click-modal="false">
            <div class="dialog-content">
                <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px" class="modern-form">
                    <div class="form-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Shop />
                            </el-icon>
                            商户基本信息
                        </h3>
                        <div class="form-grid">
                            <el-form-item label="商户名称" prop="merchantName">
                                <el-input v-model="form.data.merchantName" placeholder="请输入商户名称" class="form-input" />
                            </el-form-item>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3 class="section-title">
                            <el-icon>
                                <User />
                            </el-icon>
                            通知人信息
                        </h3>
                        <div class="form-grid">
                            <el-form-item label="通知人姓名" prop="notifierName">
                                <el-input v-model="form.data.notifierName" placeholder="请输入通知人姓名" class="form-input" />
                            </el-form-item>

                            <el-form-item label="通知人序号" prop="notifierNo">
                                <el-input v-model="form.data.notifierNo" placeholder="请输入通知人序号" class="form-input" />
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button size="large" class="cancel-btn" @click="dialogVisible = false">
                        <el-icon>
                            <Close />
                        </el-icon>
                        取消
                    </el-button>
                    <el-button type="primary" size="large" class="confirm-btn" @click="save">
                        <el-icon>
                            <Check />
                        </el-icon>
                        确定
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
import {
    Search, ArrowDown, Shop, Edit, Delete, User, Clock,
    EditPen, Plus, Check, Close, Rank
} from '@element-plus/icons-vue';

import XLSX from "xlsx";
import { activityApi } from '../../api/activity';
const root = "/parking/notifierInfo/";
const router = useRouter();
const route = useRoute();
const store = useStore();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

const props = [
    { label: "商户名称", prop: "merchantName" },
    { label: "通知人姓名", prop: "notifierName" },
    { label: "通知人序号", prop: "notifierNo" },
    { label: "创建时间", prop: "gmtCreate" },
    { label: "修改时间", prop: "gmtModified" }
];

const rules = {
    merchantName: [
        {
            required: true,
            message: "请输入商户名称",
            trigger: "blur",
        },
    ],
    notifierName: [
        {
            required: true,
            message: "请输入通知人姓名",
            trigger: "blur",
        },
    ],
    notifierNo: [
        {
            required: true,
            message: "请输入通知人序号",
            trigger: "blur"
        },
    ],
};

const form = reactive({
    data: {
        id: '',
        merchantName: '',
        notifierName: '',
        notifierNo: ''
    },
});

const handleExport = () => {
    window.location.href = "http://localhost:9999/purchase/exportPurchaseManagement";
};

// 重置
const onReset = () => {
    form.data.id = ''
    form.data.merchantName = ''
    form.data.notifierName = ''
    form.data.notifierNo = ''
};

const viewShow = ref(false)
const content = ref("");

const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")

const query = reactive({
    merchantName: "",
    pageNum: 1,
    pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)

// 获取表格数据
const getData = () => {
    request
        .get(root + "page", {
            params: query,
        })
        .then((res) => {
            tableData.value = res.data.records;
            pageTotal.value = res.data.total;
        });
};

getData();

// 查询操作
const handleSearch = async () => {
    try {
        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        
        // 构建查询条件描述
        const searchDescription = query.merchantName 
            ? `查询通知商家信息 (商场名称: ${query.merchantName})` 
            : '查询所有通知商家信息';
        
        await activityApi.logNotifierOperation(
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

// 删除操作
const handleDelete = async (index, sid) => {
    // 二次确认删除
    ElMessageBox.confirm("确定要删除吗？", "提示", {
        type: "warning",
    })
        .then(async () => {
            try {
                const res = await request.delete(root + sid);
                if (res.data) {
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "未知用户";
                    await activityApi.logActivity(
                        userId,
                        username,
                        "商户管理",
                        "删除",
                        `删除商户信息 ID: ${sid}`
                    );
                    
                    ElMessage.success("删除成功");
                    tableData.value.splice(index, 1);
                } else {
                    ElMessage.error("删除失败");
                }
            } catch (error) {
                console.error('删除操作失败:', error);
                ElMessage.error("删除失败");
            }
        })
        .catch(() => {
        });
};

// 新增操作
const handleAdd = () => {
    dialogVisible.value = true;
    onReset();
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
const handleEdit = (row) => {
    dialogVisible.value = true
    form.data.id = row.id
    form.data.merchantName = row.merchantName
    form.data.notifierName = row.notifierName
    form.data.notifierNo = row.notifierNo
};

const formRef = ref(null);
const save = () => {
    // 表单校验
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                var method = form.data.id === "" ? "POST" : "PUT";
                const res = await request({
                    url: "/parking/notifierInfo",
                    method: method,
                    data: {
                        id: form.data.id,
                        merchantName: form.data.merchantName,
                        notifierName: form.data.notifierName,
                        notifierNo: form.data.notifierNo
                    },
                });
                
                if (res.data.code == 0 || res.code == 0) {
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "未知用户";
                    const action = form.data.id === "" ? "添加" : "修改";
                    await activityApi.logActivity(
                        userId,
                        username,
                        "商户管理",
                        action,
                        `${action}商户信息: ${form.data.merchantName}`
                    );
                    
                    getData();
                    ElMessage.success("提交成功！");
                    dialogVisible.value = false;
                } else {
                    dialogVisible.value = false;
                    ElMessage.error(res.data.msg);
                }
            } catch (error) {
                console.error('保存操作失败:', error);
                ElMessage.error("操作失败");
            }
        }
    });
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
    let style = { padding: '12px 8px' }
    return style
};
</script>

<style scoped lang="scss">
.notifier-info-management {
      padding: 0 20px 20px 20px;
  background: #f0f2f5;
    min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 20px 32px;
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
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

    .page-actions {
        .add-btn {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 12px;
            transition: all 0.3s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.25);
                border-color: rgba(255, 255, 255, 0.5);
                transform: translateY(-2px);
            }
        }
    }
}

/* 搜索面板样式 */
.search-panel {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
    overflow: hidden;

    .search-panel-header {
        padding: 20px 24px;
        background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
        }

        .search-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            color: #475569;

            .el-icon {
                font-size: 18px;
                color: #3b82f6;
            }

            .toggle-icon {
                margin-left: auto;
                transition: transform 0.3s ease;
                color: #94a3b8;

                &.expanded {
                    transform: rotate(180deg);
                }
            }
        }
    }

    .search-panel-body {
        padding: 24px;

        .search-form {
            .search-row {
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;

                .search-item {
                    margin-bottom: 0;

                    .search-input {
                        width: 200px;
                    }
                }

                .search-buttons-inline {
                    display: flex;
                    gap: 12px;
                    margin-left: auto;

                    .el-button {
                        font-weight: 500;
                    }
                }
            }
        }
    }
}

/* 表格面板样式 */
.table-panel {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .table-panel-header {
        padding: 20px 24px;
        background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .table-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            color: #475569;
            font-size: 16px;

            .el-icon {
                font-size: 18px;
                color: #3b82f6;
            }
        }

        .table-stats {
            color: #64748b;
            font-size: 14px;
        }
    }

    .table-panel-body {
        padding: 0;

        .modern-table {
            border: none;

            :deep(.el-table__header) {
                background-color: #f8fafc;

                th {
                    background-color: #f8fafc !important;
                    border-bottom: 2px solid #e2e8f0;
                    color: #475569;
                    font-weight: 600;
                    padding: 16px 12px;
                }
            }

            :deep(.el-table__body) {
                tr {
                    &:hover {
                        background-color: #f8fafc !important;
                    }

                    td {
                        padding: 16px 12px;
                        border-bottom: 1px solid #f1f5f9;
                    }
                }
            }
        }

        .pagination {
            padding: 20px 24px;
            background: #fafbfc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: center;
        }
    }
}

/* 表格单元格样式 */
.merchant-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .merchant-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        flex-shrink: 0;
    }

    .merchant-details {
        .merchant-name {
            font-weight: 600;
            color: #374151;
            font-size: 15px;
            margin-bottom: 4px;
        }

        .notifier-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 2px;

            .el-icon {
                font-size: 12px;
                color: #3b82f6;
            }
        }

        .notifier-no {
            font-size: 13px;
            color: #64748b;
        }
    }
}

.notifier-detail-cell {
    .detail-item {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 14px;

        &:last-child {
            margin-bottom: 0;
        }

        .el-icon {
            font-size: 14px;
            color: #3b82f6;
        }

        .detail-label {
            color: #64748b;
            font-weight: 500;
        }

        .detail-value {
            color: #374151;
        }
    }
}

.time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #64748b;

    .el-icon {
        font-size: 14px;
        color: #3b82f6;
    }
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

/* 对话框样式 */
.modern-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

        .el-dialog__header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px 32px;
            border-radius: 16px 16px 0 0;

            .el-dialog__title {
                font-size: 20px;
                font-weight: 600;
            }

            .el-dialog__headerbtn {
                top: 24px;
                right: 32px;

                .el-dialog__close {
                    color: white;
                    font-size: 20px;
                }
            }
        }

        .el-dialog__body {
            padding: 0;
        }
    }

    .dialog-content {
        padding: 32px;
    }

    .modern-form {
        .form-section {
            margin-bottom: 32px;

            &:last-child {
                margin-bottom: 0;
            }

            .section-title {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 2px solid transparent;
                background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%) bottom;
                background-size: 100% 2px;
                background-repeat: no-repeat;

                .el-icon {
                    font-size: 18px;
                    color: #3b82f6;
                }
            }

            .form-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 20px;

                .el-form-item {
                    margin-bottom: 0;

                    :deep(.el-form-item__label) {
                        font-weight: 600;
                        color: #374151;
                    }

                    .form-input {
                        width: 100%;

                        :deep(.el-input__wrapper) {
                            border-radius: 8px;
                            border: 2px solid #e2e8f0;
                            transition: border-color 0.3s ease;

                            &:hover {
                                border-color: #3b82f6;
                            }

                            &.is-focus {
                                border-color: #3b82f6;
                            }
                        }
                    }
                }
            }
        }
    }

    .dialog-footer {
        padding: 24px 32px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .el-button {
            padding: 12px 24px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;

            &.cancel-btn {
                background: #f1f5f9;
                border-color: #cbd5e1;
                color: #475569;

                &:hover {
                    background: #e2e8f0;
                    border-color: #94a3b8;
                }
            }

            &.confirm-btn {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border-color: #3b82f6;

                &:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                }
            }
        }
    }
}

/* 表格行样式 */
:deep(.odd-row) {
    background: #f8fafc !important;
}

:deep(.even-row) {
    background: white !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .notifier-info-management {
        padding: 16px;
    }

    .page-header {
        padding: 20px;

        .page-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }

        .page-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .title-text h1 {
                font-size: 24px;
            }
        }
    }

    .search-panel-body {
        .search-form .search-row {
            flex-direction: column;
            align-items: stretch;

            .search-item .search-input {
                width: 100%;
            }

            .search-buttons-inline {
                margin-left: 0;
                justify-content: center;
            }
        }
    }

    .merchant-info-cell {
        .merchant-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
        }
    }

    .modern-dialog .dialog-content {
        padding: 20px;
    }
}
</style>
