<template>
    <div class="violation-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <Location />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>违规位置配置</h1>
                        <p class="title-desc">管理违规位置选项,支持下拉选择和定位填充</p>
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
                        <el-form :inline="true" :model="query" class="search-form">
                            <div class="search-row">
                                <el-form-item label="位置名称" class="search-item">
                                    <el-input v-model="query.locationName" placeholder="请输入位置名称" clearable class="search-input" />
                                </el-form-item>
                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.parkName" placeholder="请选择车场" clearable class="search-select">
                                        <el-option 
                                            v-for="option in parkOptions" 
                                            :key="option.value" 
                                            :label="option.label" 
                                            :value="option.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="状态" class="search-item">
                                    <el-select v-model="query.isEnabled" placeholder="请选择状态" clearable class="search-select">
                                        <el-option label="全部" :value="null"></el-option>
                                        <el-option label="启用" :value="true"></el-option>
                                        <el-option label="禁用" :value="false"></el-option>
                                    </el-select>
                                </el-form-item>
                            </div>

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
                                    <el-button type="success" icon="Plus" @click="handleAdd" size="small">
                                        新增位置
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>

            <!-- 数据表格 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <Location />
                        </el-icon>
                        <span>违规位置列表</span>
                    </div>
                    <div class="table-status">
                        <el-tag type="info" size="small">共 {{ total }} 条记录</el-tag>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" :cell-style="cellStyle" :row-class-name="tableRowClassName" height="430" stripe>
                        <el-table-column type="index" label="序号" width="120" align="center" />
                        <el-table-column prop="locationName" label="位置名称" min-width="150">
                            <template #default="{ row }">
                                <div class="location-name">
                                    <el-icon><Location /></el-icon>
                                    <span>{{ row.locationName }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="parkName" label="车场名称" width="180">
                            <template #default="{ row }">
                                <el-tag v-if="!row.parkName" type="success">通用</el-tag>
                                <span v-else>{{ row.parkName }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="isEnabled" label="状态" width="100" align="center">
                            <template #default="{ row }">
                                <el-switch v-model="row.isEnabled" @change="handleToggleStatus(row)" active-color="#13ce66" inactive-color="#ff4949" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="createdAt" label="创建时间" width="200">
                            <template #default="{ row }">
                                {{ formatTime(row.createdAt) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="primary" text icon="Edit" @click="handleEdit(row)" class="action-btn">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" text icon="Delete" @click="handleDelete(row)" class="action-btn">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination v-model:current-page="query.page" v-model:page-size="query.size" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="getData" @current-change="getData" />
            </div>
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false" class="form-dialog">
            <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                <el-form-item label="位置名称" prop="locationName">
                    <el-input v-model="formData.locationName" placeholder="请输入位置名称" />
                </el-form-item>
                <el-form-item label="车场名称" prop="parkName">
                    <el-select v-model="formData.parkName" placeholder="请选择车场（留空表示通用）" clearable style="width: 100%">
                        <el-option 
                            v-if="isAdmin"
                            label="通用" 
                            value=""
                        />
                        <el-option 
                            v-for="parkName in managedParks" 
                            :key="parkName" 
                            :label="parkName" 
                            :value="parkName"
                        />
                    </el-select>
                    <div v-if="!isAdmin && managedParks.length > 0" style="color: #909399; font-size: 12px; margin-top: 5px;">
                        ℹ️ 您只能为授权车场配置违规位置
                    </div>
                </el-form-item>
                <el-form-item label="排序顺序">
                    <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-switch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Location, Search, ArrowDown } from '@element-plus/icons-vue';
import * as violationConfigApi from '@/api/violationConfig';
import activityLogger from '@/utils/activityLogger';
// 🔐 导入车场权限管理工具
import { getManagedParks, isAdmin as checkIsAdmin } from '@/utils/parkAuth';

// 搜索面板状态
const searchPanelExpanded = ref(true);

// 🔐 车场权限相关
const isAdmin = ref(checkIsAdmin());
const managedParks = ref(getManagedParks() || []);

// 🔐 根据用户权限构建车场选项
const parkOptions = computed(() => {
    const options = [];
    if (isAdmin.value) {
        options.push({ label: '全部', value: '' });
        options.push({ label: '通用', value: 'null' });
    }
    managedParks.value.forEach(parkName => {
        options.push({ label: parkName, value: parkName });
    });
    return options;
});

// 查询参数
const query = reactive({
    page: 1,
    size: 10,
    locationName: '',
    parkName: '',
    isEnabled: null
});

// 数据列表
const tableData = ref([]);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增违规位置');
const submitting = ref(false);
const formRef = ref(null);

// 表单数据
const formData = reactive({
    id: null,
    locationName: '',
    parkName: '',
    sortOrder: 0,
    isEnabled: true
});

// 表单验证规则
const formRules = {
    locationName: [{ required: true, message: '请输入位置名称', trigger: 'blur' }]
};

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 格式化时间
const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleString('zh-CN');
};

// 获取数据
const getData = async () => {
    try {
        console.log('🔍 开始获取违规位置数据...');
        const params = {
            page: query.page,
            size: query.size,
            locationName: query.locationName || undefined,
            parkName: query.parkName === 'null' ? null : (query.parkName || undefined),
            isEnabled: query.isEnabled
        };
        
        console.log('📤 请求参数:', params);
        const res = await violationConfigApi.getLocationPage(params);
        console.log('📥 API响应:', res);
        
        // 兼容不同的响应格式
        if (res.data.code === '0' || res.data.code === 0) {
            if (res.data && res.data.data.records) {
                tableData.value = res.data.data.records || [];
                total.value = res.data.data.total || 0;
            } else if (Array.isArray(res.data.data)) {
                tableData.value = res.data.data;
                total.value = res.data.data.length;
            } else {
                tableData.value = [];
                total.value = 0;
            }
            console.log('✅ 数据加载成功:', tableData.value.length, '条');
        } else {
            console.error('❌ API返回错误:', res.data.msg);
            ElMessage.error(res.data.msg || '获取数据失败');
        }
    } catch (error) {
        console.error('❌ 获取数据失败:', error);
        ElMessage.error('获取数据失败');
    }
};

// 搜索
const handleSearch = () => {
    query.page = 1;
    getData();
};

// 重置
const handleReset = () => {
    query.locationName = '';
    query.parkName = '';
    query.isEnabled = null;
    query.page = 1;
    getData();
};

// 新增
const handleAdd = () => {
    dialogTitle.value = '新增违规位置';
    Object.assign(formData, {
        id: null,
        locationName: '',
        parkName: '',
        sortOrder: 0,
        isEnabled: true
    });
    dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
    dialogTitle.value = '编辑违规位置';
    Object.assign(formData, { ...row });
    dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
        if (!valid) return;
        
        try {
            submitting.value = true;
            let res;
            
            if (formData.id) {
                res = await violationConfigApi.updateLocation(formData.id, formData);
            } else {
                res = await violationConfigApi.addLocation(formData);
            }
            
            if (res.code === '0' || res.code === 0) {
                ElMessage.success(res.msg || '操作成功');
                
                // 记录操作日志（自动获取真实IP）
                const action = formData.id ? '修改' : '添加';
                const description = formData.id 
                    ? `修改违规位置: ${formData.locationName}`
                    : `新增违规位置: ${formData.locationName}`;
                
                activityLogger.logSuccess(
                    '违规位置管理',
                    action,
                    description,
                    formData.id || res.data?.id,
                    'violation_location',
                    null,
                    formData
                ).catch(err => console.error('记录日志失败:', err));
                
                dialogVisible.value = false;
                getData();
            } else {
                ElMessage.error(res.msg || '操作失败');
            }
        } catch (error) {
            console.error('提交失败:', error);
            ElMessage.error('操作失败');
        } finally {
            submitting.value = false;
        }
    });
};

// 切换状态
const handleToggleStatus = async (row) => {
    try {
        const res = await violationConfigApi.toggleLocationEnabled(row.id, row.isEnabled);
        if (res.code === '0' || res.code === 0) {
            ElMessage.success('状态更新成功');
        } else {
            ElMessage.error(res.msg || '状态更新失败');
            row.isEnabled = !row.isEnabled; // 恢复原状态
        }
    } catch (error) {
        console.error('切换状态失败:', error);
        ElMessage.error('状态更新失败');
        row.isEnabled = !row.isEnabled; // 恢复原状态
    }
};

// 删除
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除位置"${row.locationName}"吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(async () => {
        try {
            const res = await violationConfigApi.deleteLocation(row.id);
            if (res.code === '0' || res.code === 0) {
                ElMessage.success('删除成功');
                
                // 记录删除日志（自动获取真实IP）
                activityLogger.logSuccess(
                    '违规位置管理',
                    '删除',
                    `删除违规位置: ${row.locationName}`,
                    row.id,
                    'violation_location',
                    row,
                    null
                ).catch(err => console.error('记录日志失败:', err));
                
                getData();
            } else {
                ElMessage.error(res.msg || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    }).catch(() => {});
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
    let style = { padding: '8px 3px' };
    return style;
};

// 初始化
onMounted(() => {
    getData();
});
</script>

<style lang="scss" scoped>
// 引用违规记录查询页面的基础样式
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
                color: #3b82f6;
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

// 位置名称样式
.location-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #2d3748;

    .el-icon {
        color: #3b82f6;
    }
}

// 操作按钮样式
.action-buttons-inline {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    padding: 0;

    .action-btn {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        min-width: 60px;
        height: 30px;
        line-height: 20px;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

// 弹窗样式
.form-dialog {
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

// 兼容原有样式
.odd-row {
    background-color: rgb(241, 242, 244) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}
</style>
