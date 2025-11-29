<template>
    <div class="whitelist-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <Check />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>白名单数据管理</h1>
                        <p class="title-desc">管理车辆白名单信息，设置免检车辆</p>
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

                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.parkName" placeholder="请选择车场" clearable filterable
                                        class="search-select">
                                        <el-option
                                            v-for="item in filteredCommunityOptions"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
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
                                        添加白名单
                                    </el-button>
                                    <el-button type="danger" icon="Delete" @click="handleBatchDelete" size="small"
                                        :disabled="multipleSelection.length === 0">
                                        批量删除 ({{ multipleSelection.length }})
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>

            <!-- 白名单记录列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>白名单列表</span>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable" :cell-style="cellStyle"
                        :row-class-name="tableRowClassName" @selection-change="handleSelectionChange" height="430" stripe>

                        <!-- 复选框列 -->
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
                                        </div>
                                        <div class="owner-info">
                                            <div class="owner-name">{{ row.ownerName || '未知' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车主信息列 -->
                        <el-table-column label="车主信息" width="320">
                            <template #default="{ row }">
                                <div class="owner-detail-cell">
                                    <div class="owner-phone" v-if="row.ownerPhone">
                                        <el-icon class="phone-icon">
                                            <Phone />
                                        </el-icon>
                                        {{ row.ownerPhone }}
                                    </div>
                                    <div class="owner-address" v-if="row.ownerAddress">
                                        <el-icon class="address-icon">
                                            <Location />
                                        </el-icon>
                                        <span class="address-text">{{ row.ownerAddress }}</span>
                                    </div>
                                    <div v-if="!row.ownerPhone && !row.ownerAddress" class="no-info">
                                        暂无详细信息
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车场信息列 -->
                        <el-table-column label="车场信息" width="200">
                            <template #default="{ row }">
                                <div class="park-info-cell">
                                    <el-tag type="info" size="small">
                                        {{ row.parkName }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 创建时间列 -->
                        <el-table-column label="创建时间" width="180">
                            <template #default="{ row }">
                                <div class="time-cell">
                                    <el-icon class="time-icon">
                                        <Clock />
                                    </el-icon>
                                    <span>{{ formatTimestamp(row.createdAt) }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 备注列 -->
                        <el-table-column label="备注" width="200">
                            <template #default="{ row }">
                                <div class="remark-cell">
                                    {{ row.remark || '-' }}
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="180" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="primary" text icon="Edit" @click="handleEdit(row)"
                                        class="action-btn-edit">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" text icon="Delete" @click="handleDelete(row)"
                                        class="action-btn-delete">
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
                <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="pageTotal"
                    @size-change="handleSizeChange" @current-change="handlePageChange">
                </el-pagination>
            </div>
        </div>

        <!-- 添加/编辑白名单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogShow" width="600px" class="edit-dialog">
            <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                <el-form-item label="车场名称" prop="parkName">
                    <el-select v-model="formData.parkName" placeholder="请选择车场" style="width: 100%"
                        @change="handleParkChange">
                        <el-option
                            v-for="item in filteredCommunityOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <div v-if="!isAdmin && managedParks.length > 0" style="color: #909399; font-size: 12px; margin-top: 5px;">
                        ℹ️ 您只能为授权车场添加白名单
                    </div>
                </el-form-item>

                <el-form-item label="车牌号码" prop="plateNumber">
                    <el-input v-model="formData.plateNumber" placeholder="请输入车牌号码" 
                        @blur="handlePlateBlur" :disabled="isEdit">
                        <template #append>
                            <el-button @click="queryOwnerInfo" :loading="querying">
                                <el-icon><Search /></el-icon>
                                查询
                            </el-button>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="车主姓名" prop="ownerName">
                    <el-input v-model="formData.ownerName" placeholder="请输入车主姓名" />
                </el-form-item>

                <el-form-item label="车主电话" prop="ownerPhone">
                    <el-input v-model="formData.ownerPhone" placeholder="请输入车主电话" />
                </el-form-item>

                <el-form-item label="车主地址">
                    <el-input v-model="formData.ownerAddress" placeholder="请输入车主地址" type="textarea" :rows="2" />
                </el-form-item>

                <el-form-item label="备注">
                    <el-input v-model="formData.remark" placeholder="请输入备注信息" type="textarea" :rows="3"
                        maxlength="200" show-word-limit />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogShow = false">取消</el-button>
                    <el-button type="primary" @click="handleSave" :loading="saving">
                        保存
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Search, ArrowDown, RefreshRight, Plus, Delete, Edit, Phone, Location, Clock } from '@element-plus/icons-vue';
import { whitelistApi } from "@/api/whitelist";
import { getYardList } from "@/api/parkStaff";
import request from "@/utils/request";
import activityLogger from "@/utils/activityLogger";
// 🔐 导入车场权限管理工具
import { getManagedParks, isAdmin as checkIsAdmin } from '@/utils/parkAuth';

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 🔐 车场权限相关
const isAdmin = ref(checkIsAdmin());
const managedParks = ref(getManagedParks() || []);

// 车场列表选项
const communityOptions = ref([]);

// 🔐 根据用户权限构建车场列表
const filteredCommunityOptions = computed(() => {
    if (isAdmin.value) {
        return communityOptions.value;
    } else {
        return communityOptions.value.filter(option => 
            managedParks.value.includes(option.value)
        );
    }
});

// 查询条件
const query = reactive({
    plateNumber: "",
    ownerName: "",
    ownerPhone: "",
    parkName: "",
    pageNum: 1,
    pageSize: 10,
});

// 表格数据
const tableData = ref([]);
const pageTotal = ref(0);
const multipleSelection = ref([]);

// 对话框相关
const dialogShow = ref(false);
const dialogTitle = computed(() => isEdit.value ? '编辑白名单' : '添加白名单');
const isEdit = ref(false);
const saving = ref(false);
const querying = ref(false);

// 表单数据
const formData = reactive({
    id: null,
    plateNumber: "",
    ownerName: "",
    ownerPhone: "",
    ownerAddress: "",
    parkName: "",
    remark: ""
});

// 表单验证规则
const formRules = {
    parkName: [
        { required: true, message: '请选择车场', trigger: 'change' }
    ],
    plateNumber: [
        { required: true, message: '请输入车牌号码', trigger: 'blur' },
        { pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}$/, message: '请输入正确的车牌号码', trigger: 'blur' }
    ],
    ownerName: [
        { required: true, message: '请输入车主姓名', trigger: 'blur' }
    ],
    ownerPhone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
};

const formRef = ref(null);

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 加载车场列表
const loadCommunityList = async () => {
    try {
        const response = await getYardList();
        console.log("车场列表响应：", response);
        
        let yardList = [];
        if (Array.isArray(response)) {
            yardList = response.filter(yard => yard.deleted === 0);
        } else if (response.data && Array.isArray(response.data)) {
            yardList = response.data.filter(yard => yard.deleted === 0);
        } else {
            console.warn('车场列表数据格式异常:', response);
        }
        
        communityOptions.value = yardList.map(yard => ({
            label: yard.yardName || yard.yardName,
            value: yard.yardName || yard.yardName
        }));
        
        console.log("车场选项列表：", communityOptions.value);
    } catch (error) {
        console.error('获取车场列表失败:', error);
        ElMessage.error('获取车场列表失败');
        communityOptions.value = [];
    }
};

// 获取表格数据
const getData = async () => {
    try {
        const params = {
            page: query.pageNum,
            size: query.pageSize,
        };

        if (query.plateNumber && query.plateNumber.trim()) {
            params.plateNumber = query.plateNumber.trim();
        }
        if (query.ownerName && query.ownerName.trim()) {
            params.ownerName = query.ownerName.trim();
        }
        if (query.ownerPhone && query.ownerPhone.trim()) {
            params.ownerPhone = query.ownerPhone.trim();
        }
        if (query.parkName && query.parkName.trim()) {
            params.parkName = query.parkName.trim();
        }

        const response = await whitelistApi.getWhitelistData(params);
        console.log("response：",response.data.data)
        if (response.data.data && response.data.data.records && Array.isArray(response.data.data.records)) {
            tableData.value = response.data.data.records;
            pageTotal.value = response.data.data.total || 0;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            tableData.value = response.data.data;
            pageTotal.value = response.data.length;
        } else {
            console.warn('API返回的数据格式不正确:', response.data.data);
            tableData.value = [];
            pageTotal.value = 0;
        }
    } catch (error) {
        console.error('获取白名单数据失败:', error);
        ElMessage.error('获取数据失败: ' + (error.message || '未知错误'));
        tableData.value = [];
        pageTotal.value = 0;
    }
};

// 查询操作
const handleSearch = () => {
    query.pageNum = 1;
    getData();
};

// 重置操作
const handleReset = () => {
    query.plateNumber = "";
    query.ownerName = "";
    query.ownerPhone = "";
    query.parkName = "";
    query.pageNum = 1;
    getData();
};

// 表格选择变化处理
const handleSelectionChange = (selection) => {
    multipleSelection.value = selection;
};

// 添加白名单
const handleAdd = () => {
    isEdit.value = false;
    resetForm();
    dialogShow.value = true;
};

// 编辑白名单
const handleEdit = (row) => {
    isEdit.value = true;
    Object.assign(formData, {
        id: row.id,
        plateNumber: row.plateNumber,
        ownerName: row.ownerName,
        ownerPhone: row.ownerPhone,
        ownerAddress: row.ownerAddress,
        parkName: row.parkName,
        remark: row.remark
    });
    dialogShow.value = true;
};

// 删除白名单
const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确定要删除车牌号为 ${row.plateNumber} 的白名单记录吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            await whitelistApi.deleteWhitelist(row.id);
            
            // 记录删除日志（自动获取真实IP）
            activityLogger.logSuccess(
                '白名单管理',
                '删除',
                `删除白名单车辆: ${row.plateNumber} (${row.ownerName})`,
                row.id,
                'whitelist',
                row,
                null
            ).catch(err => console.error('记录日志失败:', err));
            
            ElMessage.success('删除成功');
            getData();
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
    }).catch(() => {
        // 用户取消删除
    });
};

// 批量删除
const handleBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请选择要删除的记录');
        return;
    }

    ElMessageBox.confirm(
        `确定要删除选中的 ${multipleSelection.value.length} 条白名单记录吗？`,
        '批量删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const ids = multipleSelection.value.map(row => row.id);
            await whitelistApi.batchDeleteWhitelist(ids);
            ElMessage.success('批量删除成功');
            multipleSelection.value = [];
            getData();
        } catch (error) {
            console.error('批量删除失败:', error);
            ElMessage.error('批量删除失败: ' + (error.message || '未知错误'));
        }
    }).catch(() => {
        // 用户取消删除
    });
};

// 车场选择变化
const handleParkChange = (value) => {
    console.log('选择车场:', value);
};

// 车牌输入失焦
const handlePlateBlur = () => {
    if (formData.plateNumber && formData.plateNumber.trim() && formData.parkName) {
        queryOwnerInfo();
    }
};

// 查询车主信息（调用ACMS接口）
const queryOwnerInfo = async () => {
    if (!formData.parkName) {
        ElMessage.warning('请先选择车场');
        return;
    }
    if (!formData.plateNumber || !formData.plateNumber.trim()) {
        ElMessage.warning('请输入车牌号码');
        return;
    }

    try {
        querying.value = true;
        
        // 调用ACMS融合接口查询车主信息
        const response = await request({
            url: '/parking/acms/vip/merged-info',
            method: 'POST',
            data: {
                plateNumber: formData.plateNumber.trim(),
                parkName: formData.parkName
            },
            timeout: 30000
        });

        console.log('ACMS查询结果:', response);

        if (response.data && response.data.code === '0' && response.data.data) {
            const data = response.data.data;
            
            // 回显车主信息
            formData.ownerName = data.ownerName || '';
            formData.ownerPhone = data.ownerPhone || '';
            formData.ownerAddress = data.ownerAddress || '';
            
            ElMessage.success('车主信息查询成功');
        } else {
            ElMessage.warning('未查询到车主信息，请手动填写');
        }
    } catch (error) {
        console.error('查询车主信息失败:', error);
        ElMessage.warning('查询车主信息失败，请手动填写');
    } finally {
        querying.value = false;
    }
};

// 保存白名单
const handleSave = async () => {
    if (!formRef.value) return;
    
    try {
        const valid = await formRef.value.validate();
        if (!valid) return;

        saving.value = true;

        const submitData = {
            plateNumber: formData.plateNumber.trim(),
            ownerName: formData.ownerName.trim(),
            ownerPhone: formData.ownerPhone.trim(),
            ownerAddress: formData.ownerAddress.trim(),
            parkName: formData.parkName,
            remark: formData.remark
        };

        if (isEdit.value) {
            // 编辑
            submitData.id = formData.id;
            let response = await whitelistApi.updateWhitelist(submitData);
            console.log("编辑成功：",response);
            if (response.data.code === "0") {
                ElMessage.success('编辑成功');
            } else {
                ElMessage.error('编辑失败: ' + (response.data.msg || '未知错误'));
            }
        } else {
            // 新增
            let response = await whitelistApi.createWhitelist(submitData);
            console.log("添加成功：",response);
            if (response.data.code === "0") {
                ElMessage.success('添加成功');
            } else {
                ElMessage.error('添加失败: ' + (response.data.msg || '未知错误'));
            }
        }

        dialogShow.value = false;
        resetForm(); // ✅ 保存成功后清空表单数据
        getData();
    } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('保存失败: ' + (error.message || '未知错误'));
    } finally {
        saving.value = false;
    }
};

// 重置表单
const resetForm = () => {
    Object.assign(formData, {
        id: null,
        plateNumber: "",
        ownerName: "",
        ownerPhone: "",
        ownerAddress: "",
        parkName: "",
        remark: ""
    });
    if (formRef.value) {
        formRef.value.clearValidate();
    }
};

// 分页大小变化
const handleSizeChange = (val) => {
    query.pageSize = val;
    query.pageNum = 1;
    getData();
};

// 分页页码变化
const handlePageChange = (val) => {
    query.pageNum = val;
    getData();
};

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

// 判断车牌类型（新能源 vs 油车）
const getPlateType = (plateNumber) => {
    if (!plateNumber) return 'traditional';
    const plate = plateNumber.trim().toUpperCase();
    if (plate.length === 8) {
        return 'new-energy';
    } else {
        return 'traditional';
    }
};

// 指定行颜色
const tableRowClassName = ({ rowIndex }) => {
    return (rowIndex + 1) % 2 === 0 ? 'odd-row' : 'even-row';
};

// 指定行高
const cellStyle = () => {
    return { padding: '8px 3px' };
};

// 页面初始化
loadCommunityList();
getData();
</script>

<style lang="scss" scoped>
// 引用违规记录页面的基础样式
.whitelist-management {
    min-height: 100vh;
    padding: 0;
}

// 页面头部样式
.page-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 0;
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
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
                color: #10b981;
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
                color: #10b981;
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

                &.traditional {
                    background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
                    color: #FFFFFF;
                    border: 1px solid #0C4FC5;
                    box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3);
                }

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

// 车场信息单元格样式
.park-info-cell {
    display: flex;
    justify-content: center;
    padding: 4px 0;
}

// 时间单元格样式
.time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #64748b;

    .time-icon {
        font-size: 14px;
        color: #3b82f6;
    }
}

// 备注单元格样式
.remark-cell {
    font-size: 13px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

// 操作按钮样式
.action-buttons-inline {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    padding: 0;

    .action-btn-edit {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        min-width: 60px;
        height: 30px;
        line-height: 20px;
        transition: all 0.3s ease;
    }

    .action-btn-delete {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        min-width: 60px;
        height: 30px;
        line-height: 20px;
        transition: all 0.3s ease;
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
                background: #10b981;
                color: white;
                transform: translateY(-2px);
            }

            &.is-active {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }
        }

        .btn-prev,
        .btn-next {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.3s ease;

            &:hover {
                background: #10b981;
                color: white;
            }
        }
    }
}

// 编辑弹窗样式
.edit-dialog {
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

// 兼容原有样式
.odd-row {
    background-color: rgb(241, 242, 244) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}
</style>

