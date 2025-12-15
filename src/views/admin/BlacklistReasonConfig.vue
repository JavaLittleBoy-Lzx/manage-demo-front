<template>
    <div class="violation-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <CircleClose />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>拉黑原因配置</h1>
                        <p class="title-desc">管理拉黑原因模板,支持分类管理</p>
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
                                <el-form-item label="原因内容" class="search-item">
                                    <el-input v-model="query.reasonText" placeholder="请输入原因内容关键词" clearable class="search-input" />
                                </el-form-item>
                                <el-form-item label="原因分类" class="search-item">
                                    <el-select v-model="query.reasonCategory" placeholder="请选择原因分类" clearable class="search-select">
                                        <el-option label="全部" value=""></el-option>
                                        <el-option label="违规相关" value="violation"></el-option>
                                        <el-option label="安全相关" value="security"></el-option>
                                        <el-option label="其他" value="other"></el-option>
                                    </el-select>
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
                                    <el-button type="warning" icon="RefreshRight" @click="handleReset" size="small">重置</el-button>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small">搜索</el-button>
                                </div>
                                <div class="action-buttons">
                                    <el-button type="success" icon="Plus" @click="handleAdd" size="small">新增原因</el-button>
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
                            <CircleClose />
                        </el-icon>
                        <span>拉黑原因列表</span>
                    </div>
                    <div class="table-status">
                        <el-tag type="info" size="small">共 {{ total }} 条记录</el-tag>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" :cell-style="cellStyle" :row-class-name="tableRowClassName" height="430" stripe>
                        <el-table-column type="index" label="序号" width="120" align="center" />
                        <el-table-column prop="reasonText" label="原因内容" min-width="300" show-overflow-tooltip />
                        <el-table-column prop="reasonCategory" label="原因分类" width="120">
                            <template #default="{ row }">
                                <el-tag :type="getCategoryType(row.reasonCategory)" size="small">
                                    {{ getCategoryText(row.reasonCategory) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="parkName" label="车场名称" width="150">
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
                        <el-table-column label="操作" width="180" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="primary" text icon="Edit" @click="handleEdit(row)" class="action-btn">编辑</el-button>
                                    <el-button type="danger" text icon="Delete" @click="handleDelete(row)" class="action-btn">删除</el-button>
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
                <el-form-item label="原因内容" prop="reasonText">
                    <el-input v-model="formData.reasonText" type="textarea" :rows="4" placeholder="请输入拉黑原因内容" />
                </el-form-item>
                <el-form-item label="原因分类" prop="reasonCategory">
                    <el-select v-model="formData.reasonCategory" placeholder="请选择原因分类" style="width: 100%">
                        <el-option label="违规相关" value="violation"></el-option>
                        <el-option label="安全相关" value="security"></el-option>
                        <el-option label="其他" value="other"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车场名称" prop="parkName">
                    <el-select v-model="formData.parkName" placeholder="请选择车场" clearable style="width: 100%">
                        <el-option 
                            v-if="isAdmin"
                            label="通用（所有车场可用）" 
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
                        ℹ️ 您只能为授权车场配置拉黑原因
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
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CircleClose, Search, ArrowDown } from '@element-plus/icons-vue';
import * as violationConfigApi from '@/api/violationConfig';
import activityLogger from '@/utils/activityLogger';
// 🔐 导入车场权限管理工具
import { getManagedParks, isAdmin as checkIsAdmin } from '@/utils/parkAuth';

const searchPanelExpanded = ref(true);

// 🔐 车场权限相关
const isAdmin = ref(checkIsAdmin());
const managedParks = ref(getManagedParks() || []);

console.log('🔐 拉黑原因配置 - 车场权限信息:', {
    isAdmin: isAdmin.value,
    managedParks: managedParks.value
});

// 🔐 根据用户权限构建车场选项列表
const parkOptions = computed(() => {
    const options = [];
    
    if (isAdmin.value) {
        // 管理员：显示"全部"和"通用"选项
        options.push({ label: '全部', value: '' });
        options.push({ label: '通用', value: 'null' });
    }
    
    // 添加用户有权限的车场
    managedParks.value.forEach(parkName => {
        options.push({ label: parkName, value: parkName });
    });
    
    console.log('🏗️ 车场选项列表:', options);
    return options;
});

const query = reactive({
    page: 1,
    size: 10,
    reasonText: '',
    reasonCategory: '',
    parkName: '',
    isEnabled: null
});

const tableData = ref([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogTitle = ref('新增拉黑原因');
const submitting = ref(false);
const formRef = ref(null);

const formData = reactive({
    id: null,
    reasonText: '',
    reasonCategory: 'violation',
    parkName: '',
    sortOrder: 0,
    isEnabled: true
});

const formRules = {
    reasonText: [{ required: true, message: '请输入原因内容', trigger: 'blur' }],
    reasonCategory: [{ required: true, message: '请选择原因分类', trigger: 'change' }]
};

const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

const getCategoryText = (category) => {
    const map = {
        'violation': '违规相关',
        'security': '安全相关',
        'other': '其他'
    };
    return map[category] || category;
};

const getCategoryType = (category) => {
    const map = {
        'violation': 'danger',
        'security': 'warning',
        'other': 'info'
    };
    return map[category] || 'info';
};

const getData = async () => {
    try {
        console.log('🔍 开始获取拉黑原因数据...');
        const params = {
            page: query.page,
            size: query.size,
            reasonText: query.reasonText || undefined,
            reasonCategory: query.reasonCategory || undefined,
            parkName: query.parkName === 'null' ? null : (query.parkName || undefined),
            isEnabled: query.isEnabled
        };
        
        console.log('📤 请求参数:', params);
        const res = await violationConfigApi.getReasonPage(params);
        console.log('📥 API响应:', res);
        
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

const handleSearch = () => {
    query.page = 1;
    getData();
};

const handleReset = () => {
    query.reasonText = '';
    query.reasonCategory = '';
    query.parkName = '';
    query.isEnabled = null;
    query.page = 1;
    getData();
};

const handleAdd = () => {
    dialogTitle.value = '新增拉黑原因';
    Object.assign(formData, {
        id: null,
        reasonText: '',
        reasonCategory: 'violation',
        parkName: '',
        sortOrder: 0,
        isEnabled: true
    });
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    dialogTitle.value = '编辑拉黑原因';
    Object.assign(formData, { ...row });
    dialogVisible.value = true;
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
        if (!valid) return;
        
        try {
            submitting.value = true;
            let res;
            
            if (formData.id) {
                res = await violationConfigApi.updateReason(formData.id, formData);
            } else {
                res = await violationConfigApi.addReason(formData);
            }
            
            if (res.code === '0' || res.code === 0) {
                ElMessage.success(res.msg || '操作成功');
                
                // 记录操作日志（自动获取真实IP）
                const action = formData.id ? '修改' : '添加';
                const description = formData.id 
                    ? `修改拉黑原因: ${formData.reasonText}`
                    : `新增拉黑原因: ${formData.reasonText}`;
                
                activityLogger.logSuccess(
                    '拉黑原因管理',
                    action,
                    description,
                    formData.id || res.data?.id,
                    'blacklist_reason',
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

const handleToggleStatus = async (row) => {
    try {
        const res = await violationConfigApi.toggleReasonEnabled(row.id, row.isEnabled);
        if (res.code === '0' || res.code === 0) {
            ElMessage.success('状态更新成功');
        } else {
            ElMessage.error(res.msg || '状态更新失败');
            row.isEnabled = !row.isEnabled;
        }
    } catch (error) {
        console.error('切换状态失败:', error);
        ElMessage.error('状态更新失败');
        row.isEnabled = !row.isEnabled;
    }
};

const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除该拉黑原因吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(async () => {
        try {
            const res = await violationConfigApi.deleteReason(row.id);
            if (res.code === '0' || res.code === 0) {
                ElMessage.success('删除成功');
                
                // 记录删除日志（自动获取真实IP）
                activityLogger.logSuccess(
                    '拉黑原因管理',
                    '删除',
                    `删除拉黑原因: ${row.reasonText}`,
                    row.id,
                    'blacklist_reason',
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

const tableRowClassName = ({ row, rowIndex }) => {
    return (rowIndex + 1) % 2 == 0 ? 'odd-row' : 'even-row';
};

const cellStyle = () => {
    return { padding: '8px 3px' };
};

onMounted(() => {
    getData();
});
</script>

<style lang="scss" scoped>
@import './violation-config-common.scss';
</style>
