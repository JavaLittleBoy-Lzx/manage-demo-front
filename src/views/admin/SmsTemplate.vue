<template>
    <div class="sms-template-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon>
                            <Message />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>短信模板管理</h1>
                        <p class="title-desc">管理短信模板签名和模板CODE，用于车场短信通知配置</p>
                    </div>
                </div>
                <div class="page-actions">
                    <el-button type="primary" icon="Plus" @click="handleAdd" size="large" class="add-btn">
                        新增模板
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
                                <el-form-item label="模板名称" class="search-item">
                                    <el-input v-model="query.templateName" placeholder="请输入模板名称" clearable
                                        class="search-input" />
                                </el-form-item>
                                
                                <el-form-item label="模板类型" class="search-item">
                                    <el-select v-model="query.templateType" placeholder="请选择模板类型" clearable
                                        class="search-input">
                                        <el-option label="违规提醒" :value="1"></el-option>
                                        <el-option label="停车超时" :value="2"></el-option>
                                        <el-option label="其他" :value="3"></el-option>
                                    </el-select>
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
                            <List />
                        </el-icon>
                        <span>短信模板列表</span>
                    </div>
                    <div class="table-stats">
                        共 {{ pageTotal }} 条记录
                    </div>
                </div>

                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable"
                        :row-class-name="tableRowClassName" :cell-style="cellStyle" stripe>
                        
                        <!-- 模板信息列 -->
                        <el-table-column label="模板信息" width="300" fixed="left">
                            <template #default="{ row }">
                                <div class="template-info-cell">
                                    <div class="template-icon">
                                        <el-icon>
                                            <ChatLineSquare />
                                        </el-icon>
                                    </div>
                                    <div class="template-details">
                                        <div class="template-name">{{ row.templateName }}</div>
                                        <div class="template-type">{{ getTemplateTypeText(row.templateType) }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 模板签名列 -->
                        <el-table-column label="模板签名" prop="signName" width="200" align="center">
                            <template #default="{ row }">
                                <el-tag type="primary" effect="plain">{{ row.signName }}</el-tag>
                            </template>
                        </el-table-column>

                        <!-- 模板CODE列 -->
                        <el-table-column label="模板CODE" prop="templateCode" width="200" align="center">
                            <template #default="{ row }">
                                <el-tag type="success" effect="plain">{{ row.templateCode }}</el-tag>
                            </template>
                        </el-table-column>

                        <!-- 描述列 -->
                        <el-table-column label="描述" prop="description" min-width="250">
                            <template #default="{ row }">
                                <span class="description-text">{{ row.description || '-' }}</span>
                            </template>
                        </el-table-column>

                        <!-- 创建时间列 -->
                        <el-table-column label="创建时间" prop="gmtCreate" width="200" align="center">
                            <template #default="{ row }">
                                <div class="time-cell">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>{{ row.gmtCreate }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="200" align="center" fixed="right">
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

        <!-- 短信模板编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="form.data.id ? '修改短信模板' : '新增短信模板'" width="600px"
            class="modern-dialog" :close-on-click-modal="false">
            <div class="dialog-content">
                <el-form :model="form.data" ref="formRef" :rules="rules" label-width="120px" class="modern-form">
                    <div class="form-section">
                        <h3 class="section-title">
                            <el-icon>
                                <Message />
                            </el-icon>
                            模板基本信息
                        </h3>
                        <div class="form-grid">
                            <el-form-item label="模板名称" prop="templateName">
                                <el-input v-model="form.data.templateName" placeholder="请输入模板名称" class="form-input" />
                            </el-form-item>

                            <el-form-item label="模板签名" prop="signName">
                                <el-input v-model="form.data.signName" placeholder="例如：东北林业大学" class="form-input">
                                    <template #prepend>
                                        <el-icon><Stamp /></el-icon>
                                    </template>
                                </el-input>
                                <div class="form-tip">格式参考：东北林业大学</div>
                            </el-form-item>

                            <el-form-item label="模板CODE" prop="templateCode">
                                <el-input v-model="form.data.templateCode" placeholder="例如：SMS_496020098" class="form-input">
                                    <template #prepend>
                                        <el-icon><Tickets /></el-icon>
                                    </template>
                                </el-input>
                                <div class="form-tip">格式参考：SMS_496020098</div>
                            </el-form-item>

                            <el-form-item label="模板类型" prop="templateType">
                                <el-select v-model="form.data.templateType" placeholder="请选择模板类型" class="form-input">
                                    <el-option label="违规提醒" :value="1"></el-option>
                                    <el-option label="停车超时" :value="2"></el-option>
                                    <el-option label="其他" :value="3"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="模板描述" prop="description">
                                <el-input v-model="form.data.description" type="textarea" :rows="3"
                                    placeholder="请输入模板描述" class="form-input" />
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
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import {
    Search, ArrowDown, List, Edit, Delete, Message, Clock,
    Plus, Check, Close, ChatLineSquare, Stamp, Tickets
} from '@element-plus/icons-vue';

const root = "/parking/smsTemplate/";

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 获取模板类型文本
const getTemplateTypeText = (type) => {
    const typeMap = {
        1: '违规提醒',
        2: '停车超时',
        3: '其他'
    };
    return typeMap[type] || '未知';
};

// 表单验证规则
const rules = {
    templateName: [
        {
            required: true,
            message: "请输入模板名称",
            trigger: "blur",
        },
    ],
    signName: [
        {
            required: true,
            message: "请输入模板签名",
            trigger: "blur",
        },
        {
            validator: (rule, value, callback) => {
                // 检查签名格式（中文字符）
                const pattern = /^[\u4e00-\u9fa5]+$/;
                if (!pattern.test(value)) {
                    callback(new Error('模板签名格式不正确，应为中文字符，例如：东北林业大学'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    templateCode: [
        {
            required: true,
            message: "请输入模板CODE",
            trigger: "blur",
        },
        {
            validator: (rule, value, callback) => {
                // 检查模板CODE格式（SMS_开头加数字）
                const pattern = /^SMS_\d+$/;
                if (!pattern.test(value)) {
                    callback(new Error('模板CODE格式不正确，应为SMS_加数字，例如：SMS_496020098'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    templateType: [
        {
            required: true,
            message: "请选择模板类型",
            trigger: "change",
        },
    ],
};

const form = reactive({
    data: {
        id: null,
        templateName: '',
        signName: '',
        templateCode: '',
        templateType: null,
        description: ''
    },
});

// 重置表单
const onReset = () => {
    form.data.id = null;
    form.data.templateName = '';
    form.data.signName = '';
    form.data.templateCode = '';
    form.data.templateType = null;
    form.data.description = '';
};

const query = reactive({
    templateName: "",
    templateType: null,
    pageNum: 1,
    pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisible = ref(false);

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
const handleSearch = () => {
    query.pageNum = 1;
    getData();
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
    ElMessageBox.confirm("确定要删除此短信模板吗？", "提示", {
        type: "warning",
    })
        .then(async () => {
            try {
                const res = await request.delete(root + sid);
                if (res.data) {
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

// 表格编辑
const handleEdit = (row) => {
    dialogVisible.value = true;
    form.data.id = row.id;
    form.data.templateName = row.templateName;
    form.data.signName = row.signName;
    form.data.templateCode = row.templateCode;
    form.data.templateType = row.templateType;
    form.data.description = row.description;
};

const formRef = ref(null);
const save = () => {
    // 表单校验
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                var method = form.data.id === null ? "POST" : "PUT";
                const res = await request({
                    url: "/parking/smsTemplate",
                    method: method,
                    data: form.data,
                });
                
                if (res.data.code === "1") {
                    ElMessage.error(res.data.msg);
                } else {
                    getData();
                    ElMessage.success("提交成功！");
                    dialogVisible.value = false;
                }
            } catch (error) {
                console.error('保存操作失败:', error);
                ElMessage.error("操作失败");
            }
        }
    });
};

// 指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
    if ((rowIndex + 1) % 2 == 0) {
        return 'odd-row';
    } else if ((rowIndex + 1) % 2 != 0) {
        return 'even-row';
    }
};

// 指定行高
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
    let style = { padding: '12px 8px' }
    return style
};
</script>

<style scoped lang="scss">
.sms-template-management {
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
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
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
.template-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .template-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        flex-shrink: 0;
    }

    .template-details {
        .template-name {
            font-weight: 600;
            color: #374151;
            font-size: 15px;
            margin-bottom: 4px;
        }

        .template-type {
            font-size: 13px;
            color: #64748b;
        }
    }
}

.description-text {
    color: #64748b;
    font-size: 14px;
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
            margin-bottom: 0;

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

                    .form-tip {
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 4px;
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
    .sms-template-management {
        padding: 16px;
    }

    .page-header {
        padding: 20px;

        .page-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
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

    .modern-dialog .dialog-content {
        padding: 20px;
    }
}
</style>

