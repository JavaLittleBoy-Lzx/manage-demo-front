<template>
    <div class="violation-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <Setting />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>违规类型配置</h1>
                        <p class="title-desc">管理违规类型选项,支持严重程度分类</p>
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
                                <el-form-item label="类型名称" class="search-item">
                                    <el-input v-model="query.typeName" placeholder="请输入类型名称" clearable
                                        class="search-input" />
                                </el-form-item>
                                <el-form-item label="类型代码" class="search-item">
                                    <el-input v-model="query.typeCode" placeholder="请输入类型代码" clearable
                                        class="search-input" />
                                </el-form-item>
                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.parkName" placeholder="请选择车场" clearable
                                        class="search-select">
                                        <el-option 
                                            v-for="option in parkOptions" 
                                            :key="option.value" 
                                            :label="option.label" 
                                            :value="option.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="严重程度" class="search-item">
                                    <el-select v-model="query.severityLevel" placeholder="请选择严重程度" clearable
                                        class="search-select">
                                        <el-option label="全部" value=""></el-option>
                                        <el-option label="轻微" value="mild"></el-option>
                                        <el-option label="中等" value="moderate"></el-option>
                                        <el-option label="严重" value="severe"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="状态" class="search-item">
                                    <el-select v-model="query.isEnabled" placeholder="请选择状态" clearable
                                        class="search-select">
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
                                        新增类型
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
                            <Setting />
                        </el-icon>
                        <span>违规类型列表</span>
                    </div>
                    <div class="table-status">
                        <el-tag type="info" size="small">共 {{ total }} 条记录</el-tag>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" :cell-style="cellStyle"
                        :row-class-name="tableRowClassName" height="430" stripe>
                        <el-table-column type="index" label="序号" width="80" align="center" />
                        <el-table-column prop="icon" label="图标" width="80" align="center">
                            <template #default="{ row }">
                                <el-icon v-if="row.icon && iconComponents[row.icon]" :size="24" class="table-icon">
                                    <component :is="iconComponents[row.icon]" />
                                </el-icon>
                                <span v-else class="no-icon-text">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="typeName" label="类型名称" min-width="130" width="130">
                            <template #default="{ row }">
                                <span class="type-name">{{ row.typeName }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="typeCode" label="类型代码" width="150">
                            <template #default="{ row }">
                                <el-tag type="info" size="small">{{ row.typeCode }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="parkName" label="车场名称" width="130">
                            <template #default="{ row }">
                                <el-tag v-if="!row.parkName" type="success">通用</el-tag>
                                <span v-else>{{ row.parkName }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="severityLevel" label="严重程度" width="110" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getSeverityType(row.severityLevel)" effect="dark">
                                    {{ getSeverityText(row.severityLevel) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="类型描述" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="isEnabled" label="状态" width="100" align="center">
                            <template #default="{ row }">
                                <el-switch v-model="row.isEnabled" @change="handleToggleStatus(row)"
                                    active-color="#13ce66" inactive-color="#ff4949" />
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="primary" text icon="Edit" @click="handleEdit(row)"
                                        class="action-btn">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" text icon="Delete" @click="handleDelete(row)"
                                        class="action-btn">
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
                <el-pagination v-model:current-page="query.page" v-model:page-size="query.size" :total="total"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="getData" @current-change="getData" />
            </div>
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false"
            class="form-dialog">
            <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                <el-form-item label="类型名称" prop="typeName">
                    <el-input v-model="formData.typeName" placeholder="请输入类型名称" />
                </el-form-item>
                <el-form-item label="类型代码" prop="typeCode">
                    <el-input v-model="formData.typeCode" placeholder="请输入类型代码（英文字母）" />
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
                        ℹ️ 您只能为授权车场配置违规类型
                    </div>
                </el-form-item>
                <el-form-item label="严重程度" prop="severityLevel">
                    <el-select v-model="formData.severityLevel" placeholder="请选择严重程度" style="width: 100%">
                        <el-option label="轻微" value="mild"></el-option>
                        <el-option label="中等" value="moderate"></el-option>
                        <el-option label="严重" value="severe"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="图标">
                    <div class="icon-selector-wrapper">
                        <el-input v-model="formData.icon" placeholder="点击右侧按钮选择图标" readonly style="flex: 1;">
                            <template #prefix v-if="formData.icon && iconComponents[formData.icon]">
                                <el-icon :size="18">
                                    <component :is="iconComponents[formData.icon]" />
                                </el-icon>
                            </template>
                        </el-input>
                        <el-button type="primary" @click="showIconPicker = true" style="margin-left: 10px;">
                            选择图标
                        </el-button>
                        <el-button v-if="formData.icon" @click="formData.icon = ''" style="margin-left: 5px;">
                            清除
                        </el-button>
                    </div>
                </el-form-item>
                <!-- 违规描述列表 -->
                <div class="descriptions-container">
                    <!-- AI智能建议区域 -->
                    <div class="description-suggestions" style="margin-bottom: 15px;">
                        <!-- 加载状态 -->
                        <div v-if="loadingSuggestions" style="display: flex; align-items: center; margin-bottom: 10px;">
                            <el-icon class="is-loading" style="margin-right: 5px; color: #409EFF;">
                                <Loading />
                            </el-icon>
                            <span style="font-size: 14px; color: #606266;">🤖 正在生成智能建议...</span>
                        </div>
                        <!-- 建议列表 -->
                        <div v-else-if="suggestedDescriptions.length > 0">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <el-icon style="margin-right: 5px; color: #409EFF;">
                                    <InfoFilled />
                                </el-icon>
                                <span style="font-size: 14px; color: #606266; font-weight: 500;">🤖 智能建议（点击快速添加）：</span>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <el-tag 
                                    v-for="(suggestion, idx) in suggestedDescriptions" 
                                    :key="idx"
                                    type="info"
                                    effect="plain"
                                    style="cursor: pointer; user-select: none;"
                                    @click="applySuggestion(suggestion)"
                                >
                                    <el-icon style="margin-right: 4px;"><Plus /></el-icon>
                                    {{ suggestion }}
                                </el-tag>
                            </div>
                        </div>
                    </div>

                    <div v-for="(desc, index) in formData.descriptions" :key="index" class="description-item">
                        <el-form-item :label="`违规描述 ${index + 1}`" class="description-form-item">
                            <div class="description-input-wrapper">
                                <el-input type="textarea" :rows="2" v-model="desc.descriptionText"
                                    placeholder="请输入具体的违规情况描述" style="flex: 1;" />
                                <el-button type="danger" circle size="small" @click="removeDescription(index)"
                                    :disabled="formData.descriptions.length === 1">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                                <el-button v-if="index === formData.descriptions.length - 1" type="success" circle
                                    size="small" @click="addDescription">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                </el-button>
                            </div>
                        </el-form-item>
                    </div>
                </div>

                <el-row :gutter="20" style="margin-top: 20px;">
                    <el-col :span="12">
                        <el-form-item label="排序顺序">
                            <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态">
                            <el-switch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
            </template>
        </el-dialog>

        <!-- 图标选择器弹窗 -->
        <el-dialog v-model="showIconPicker" title="选择图标" width="600px" class="icon-picker-dialog">
            <div class="icon-picker-container">
                <div class="icon-grid">
                    <div 
                        v-for="icon in availableIcons" 
                        :key="icon" 
                        class="icon-item"
                        :class="{ 'selected': formData.icon === icon }"
                        @click="selectIcon(icon)"
                    >
                        <el-icon :size="24">
                            <component :is="iconComponents[icon]" />
                        </el-icon>
                        <span class="icon-name">{{ icon }}</span>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="showIconPicker = false">取消</el-button>
                <el-button type="primary" @click="showIconPicker = false">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
    Setting, Search, ArrowDown, Document, Delete, Plus,
    Warning, CircleClose, WarningFilled, InfoFilled, QuestionFilled,
    Lock, Unlock, Clock, Timer, Calendar, Location, Position,
    Camera, Picture, VideoCamera, Microphone, Phone, Message,
    User, UserFilled, Avatar, Tickets, Stamp, Flag,
    Star, StarFilled, Medal, Trophy, Present, Bell,
    Files, Folder, FolderOpened, DocumentCopy, Edit, View,
    Download, Upload, Share, Link, Paperclip, Promotion,
    CircleCheck, CirclePlus, Remove, Close, Check, CloseBold, Loading,
    ArrowLeft, ArrowRight, ArrowUp, DArrowLeft, DArrowRight,
    House, School, Shop, Goods, ShoppingCart, Van, Bicycle, Coordinate, MapLocation, Guide
} from '@element-plus/icons-vue';
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

// 图标选择器状态
const showIconPicker = ref(false);

// 图标组件映射 - 停车违规相关图标
const iconComponents = {
    // 警告类图标（适合违规提示）
    'Warning': Warning,
    'WarningFilled': WarningFilled,
    'CircleClose': CircleClose,
    'InfoFilled': InfoFilled,
    'WarnTriangleFilled': WarningFilled,
    
    // 禁止/限制类图标
    'Lock': Lock,
    'CircleCloseFilled': CircleClose,
    'RemoveFilled': Remove,
    'CloseBold': CloseBold,
    'Delete': Delete,
    
    // 时间相关（超时停车、限时停车）
    'Clock': Clock,
    'Timer': Timer,
    'AlarmClock': Clock,
    
    // 位置相关（违规停车位置）
    'Location': Location,
    'Position': Position,
    'MapLocation': MapLocation,
    'Coordinate': Coordinate,
    
    // 车辆相关
    'Van': Van,
    'Bicycle': Bicycle,
    
    // 监控相关（违规抓拍）
    'Camera': Camera,
    'VideoCamera': VideoCamera,
    'View': View,
    
    // 标记/标识类
    'Flag': Flag,
    'Stamp': Stamp,
    'Tickets': Tickets,
    
    // 其他常用
    'Bell': Bell,
    'Message': Message,
    'Document': Document,
    'Files': Files
};

// 可用图标列表
const availableIcons = Object.keys(iconComponents);

// 查询参数
const query = reactive({
    page: 1,
    size: 10,
    typeName: '',
    typeCode: '',
    parkName: '',
    severityLevel: '',
    isEnabled: null
});

// 数据列表
const tableData = ref([]);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增违规类型');
const submitting = ref(false);
const formRef = ref(null);

// 表单数据
const formData = reactive({
    id: null,
    typeName: '',
    typeCode: '',
    parkName: '',
    severityLevel: 'moderate',
    icon: '', // 图标
    sortOrder: 0,
    isEnabled: true,
    createdBy: '',
    descriptions: [{ descriptionText: '' }] // 违规描述列表
});

// 智能建议的违规描述
const suggestedDescriptions = ref([]);

// 表单验证规则
const formRules = {
    typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    typeCode: [{ required: true, message: '请输入类型代码', trigger: 'blur' }],
    severityLevel: [{ required: true, message: '请选择严重程度', trigger: 'change' }]
};

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 选择图标
const selectIcon = (icon) => {
    formData.icon = icon;
};

// 严重程度文本映射
const getSeverityText = (level) => {
    const map = {
        'mild': '轻微',
        'moderate': '中等',
        'severe': '严重'
    };
    return map[level] || level;
};

// 严重程度标签类型
const getSeverityType = (level) => {
    const map = {
        'mild': 'success',
        'moderate': 'warning',
        'severe': 'danger'
    };
    return map[level] || 'info';
};

// 获取数据
const getData = async () => {
    try {
        console.log('🔍 开始获取违规类型数据...');
        const params = {
            page: query.page,
            size: query.size,
            typeName: query.typeName || undefined,
            typeCode: query.typeCode || undefined,
            parkName: query.parkName === 'null' ? null : (query.parkName || undefined),
            severityLevel: query.severityLevel || undefined,
            isEnabled: query.isEnabled
        };

        console.log('📤 请求参数:', params);
        const res = await violationConfigApi.getTypePage(params);
        console.log('📥 API响应:', res.data);

        // 兼容不同的响应格式
        if (res.data.code === '0' || res.data.code === 0) {
            if (res.data.data && res.data.data.records) {
                tableData.value = res.data.data.records || [];
                total.value = res.data.data.total || 0;
            } else if (Array.isArray(res.data)) {
                tableData.value = res.data;
                total.value = res.data.data.length;
            } else {
                tableData.value = [];
                total.value = 0;
            }
            console.log('✅ 数据加载成功:', tableData);
            
            // 🔍 调试：检查每条记录的 icon 字段
            console.log('🎨 图标字段检查:');
            tableData.value.forEach((item, index) => {
                console.log(`  记录 ${index + 1}:`, {
                    typeName: item.typeName,
                    icon: item.icon,
                    iconExists: !!item.icon,
                    iconInComponents: item.icon ? !!iconComponents[item.icon] : false
                });
            });
        } else {
            console.error('❌ API返回错误:', res.data.data.msg);
            ElMessage.error(res.data.data.msg || '获取数据失败');
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
    query.typeName = '';
    query.typeCode = '';
    query.parkName = '';
    query.severityLevel = '';
    query.isEnabled = null;
    query.page = 1;
    getData();
};

// AI建议加载状态
const loadingSuggestions = ref(false);

// 根据违规类型名称生成AI智能建议
const generateSuggestions = async (typeName) => {
    if (!typeName || !typeName.trim()) {
        return [];
    }

    try {
        loadingSuggestions.value = true;
        console.log('🤖 调用AI生成建议，类型名称:', typeName);
        
        const res = await violationConfigApi.getAISuggestions(typeName);
        
        if (res.data.code === '0' || res.data.code === 0) {
            const suggestions = res.data.data || [];
            console.log('✅ AI建议生成成功:', suggestions);
            return suggestions;
        } else {
            console.warn('⚠️ AI建议生成失败，使用默认建议');
            return getDefaultSuggestions();
        }
    } catch (error) {
        console.error('❌ AI建议生成错误:', error);
        return getDefaultSuggestions();
    } finally {
        loadingSuggestions.value = false;
    }
};

// 默认建议（当AI服务不可用时使用）
const getDefaultSuggestions = () => {
    return [
        '车辆停放不符合规定',
        '违反停车管理规定',
        '影响其他车辆或行人通行'
    ];
};

// 应用建议描述
const applySuggestion = (suggestion) => {
    // 查找第一个空的描述框
    const emptyIndex = formData.descriptions.findIndex(desc => !desc.descriptionText || !desc.descriptionText.trim());
    
    if (emptyIndex !== -1) {
        // 如果有空的描述框，填充到空框中
        formData.descriptions[emptyIndex].descriptionText = suggestion;
    } else {
        // 如果没有空框，添加新的描述
        formData.descriptions.push({ descriptionText: suggestion });
    }
    
    ElMessage.success('已添加建议描述');
};

// 新增
const handleAdd = () => {
    dialogTitle.value = '新增违规类型';
    Object.assign(formData, {
        id: null,
        typeName: '',
        typeCode: '',
        parkName: '',
        severityLevel: 'moderate',
        sortOrder: 0,
        isEnabled: true,
        createdBy: localStorage.getItem('ms_username') || '',
        descriptions: [{ descriptionText: '' }]
    });
    suggestedDescriptions.value = []; // 清空建议
    dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row) => {
    dialogTitle.value = '编辑违规类型';
    Object.assign(formData, { ...row });

    // 从 description 字段中拆分违规描述
    if (row.description && row.description.trim()) {
        // 用分号分隔描述
        const descriptions = row.description.split(';').map(desc => desc.trim()).filter(desc => desc);
        if (descriptions.length > 0) {
            formData.descriptions = descriptions.map(desc => ({
                descriptionText: desc
            }));
        } else {
            formData.descriptions = [{ descriptionText: '' }];
        }
    } else {
        formData.descriptions = [{ descriptionText: '' }];
    }

    console.log('📝 编辑模式 - 加载的描述:', formData.descriptions);

    // 生成AI智能建议
    if (formData.typeName) {
        suggestedDescriptions.value = await generateSuggestions(formData.typeName);
    }

    dialogVisible.value = true;
};

// 添加描述
const addDescription = () => {
    formData.descriptions.push({ descriptionText: '' });
};

// 删除描述
const removeDescription = (index) => {
    if (formData.descriptions.length > 1) {
        formData.descriptions.splice(index, 1);
    }
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitting.value = true;

            // 将违规描述合并成一个字符串（用分号分隔）
            const validDescriptions = formData.descriptions.filter(desc => desc.descriptionText && desc.descriptionText.trim());
            const descriptionText = validDescriptions.map(desc => desc.descriptionText.trim()).join('; ');

            // 保存违规类型（包含描述）
            const typeData = {
                typeName: formData.typeName,
                typeCode: formData.typeCode,
                parkName: formData.parkName,
                severityLevel: formData.severityLevel,
                description: descriptionText || null,  // 将描述保存到 description 字段
                icon: formData.icon || null,
                sortOrder: formData.sortOrder,
                isEnabled: formData.isEnabled,
                createdBy: formData.createdBy
            };

            console.log('💾 保存违规类型数据:', typeData);

            let typeRes;
            if (formData.id) {
                typeRes = await violationConfigApi.updateType(formData.id, typeData);
            } else {
                typeRes = await violationConfigApi.addType(typeData);
            }

            if (typeRes.data.code !== '0' && typeRes.data.code !== 0) {
                ElMessage.error(typeRes.data.msg || '保存类型失败');
                return;
            }

            console.log('✅ 违规类型保存成功');

            // 记录操作日志（自动获取真实IP）
            const action = formData.id ? '修改' : '添加';
            const description = formData.id 
                ? `修改违规类型: ${formData.typeName}`
                : `新增违规类型: ${formData.typeName}`;
            
            activityLogger.logSuccess(
                '违规类型管理',
                action,
                description,
                formData.id || typeRes.data?.id,
                'violation_type',
                null,
                formData
            ).catch(err => console.error('记录日志失败:', err));

            ElMessage.success('操作成功');
            dialogVisible.value = false;
            getData();

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
        const res = await violationConfigApi.toggleTypeEnabled(row.id, row.isEnabled);
        if (res.data.code === '0' || res.data.code === 0) {
            ElMessage.success('状态更新成功');
        } else {
            ElMessage.error(res.data.msg || '状态更新失败');
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
    ElMessageBox.confirm(`确定要删除类型"${row.typeName}"吗？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(async () => {
        try {
            const res = await violationConfigApi.deleteType(row.id);
            if (res.data.code === '0' || res.data.code === 0) {
                ElMessage.success('删除成功');
                
                // 记录删除日志（自动获取真实IP）
                activityLogger.logSuccess(
                    '违规类型管理',
                    '删除',
                    `删除违规类型: ${row.typeName}`,
                    row.id,
                    'violation_type',
                    row,
                    null
                ).catch(err => console.error('记录日志失败:', err));
                
                getData();
            } else {
                ElMessage.error(res.data.msg || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    }).catch(() => { });
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

// 监听类型名称变化，自动生成AI建议
watch(() => formData.typeName, async (newTypeName) => {
    if (newTypeName && newTypeName.trim()) {
        suggestedDescriptions.value = await generateSuggestions(newTypeName);
        console.log('💡 AI智能建议已生成:', suggestedDescriptions.value);
    } else {
        suggestedDescriptions.value = [];
    }
});

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
                color: #667eea;
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

// 类型名称样式
.type-name {
    font-weight: 600;
    color: #2d3748;
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

// 描述列表样式
.descriptions-container {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    .description-item {
        margin-bottom: 12px;

        &:last-child {
            margin-bottom: 0;
        }

        .description-form-item {
            margin-bottom: 0;

            :deep(.el-form-item__label) {
                font-weight: 500;
                color: #4a5568;
            }

            .description-input-wrapper {
                display: flex;
                gap: 12px;
                align-items: center;
            }
        }
    }
}

// 图标选择器样式
.icon-selector-wrapper {
    display: flex;
    align-items: center;
}

// 表格图标样式
.table-icon {
    color: #667eea;
    transition: all 0.3s ease;
    
    &:hover {
        color: #764ba2;
        transform: scale(1.1);
    }
}

.no-icon-text {
    color: #cbd5e0;
    font-size: 14px;
}

.icon-picker-dialog {
    :deep(.el-dialog) {
        border-radius: 12px;

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
    }
}

.icon-picker-container {
    max-height: 500px;
    overflow-y: auto;
    padding: 10px;

    .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;

        .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px 8px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8fafc;

            &:hover {
                border-color: #667eea;
                background: #eef2ff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            }

            &.selected {
                border-color: #667eea;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

                .icon-name {
                    color: white;
                }
            }

            .el-icon {
                margin-bottom: 8px;
            }

            .icon-name {
                font-size: 12px;
                color: #4a5568;
                text-align: center;
                word-break: break-word;
            }
        }
    }
}
</style>
