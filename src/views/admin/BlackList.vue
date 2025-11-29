<template>
    <div class="blacklist-management">
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
                        <h1>黑名单车辆</h1>
                        <p class="title-desc">管理违规车辆黑名单，支持批量操作</p>
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
                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.parkName" placeholder="请选择车场名称" clearable
                                        @change="changeParkName" class="search-select">
                                        <el-option 
                                            v-for="park in availableParks" 
                                            :key="park.value" 
                                            :label="park.label" 
                                            :value="park.value" />
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="名称" class="search-item">
                                    <el-select v-model="query.specialCarTypeConfigName" placeholder="请选择黑名单名称" clearable
                                        @change="getData()" class="search-select">
                                        <el-option v-for="item in specialCarTypeNameList" :key="item.name"
                                            :label="item.name" :value="item.name" />
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="车牌号码" class="search-item">
                                    <el-input v-model="query.carCode" placeholder="请输入车牌号码" clearable
                                        @clear="clearCarNo" class="search-input" />
                                </el-form-item>

                                <el-form-item label="车主姓名" class="search-item">
                                    <el-input v-model="query.userName" placeholder="请输入车主姓名" clearable
                                        @clear="clearUserName" class="search-input" />
                                </el-form-item>
                            </div>

                            <!-- 第二行：次要搜索条件 -->
                            <div class="search-row">
                                <el-form-item label="原因" class="search-item">
                                    <el-input v-model="query.blackReason" placeholder="请输入黑名单原因" clearable
                                        @clear="clearBlackReason" class="search-input" />
                                </el-form-item>

                                <el-form-item label="备注1" class="search-item">
                                    <el-input v-model="query.remark1" placeholder="请输入备注1" clearable
                                        @clear="clearRemark1" class="search-input" />
                                </el-form-item>

                                <el-form-item label="备注2" class="search-item">
                                    <el-input v-model="query.remark2" placeholder="请输入备注2" clearable
                                        @clear="clearRemark2" class="search-input" />
                                </el-form-item>
                            </div>

                            <!-- 操作按钮行 -->
                            <div class="search-actions">
                                <div class="search-buttons">
                                    <el-button type="warning" icon="Refresh" @click="handleOnset" size="small">
                                        重置
                                    </el-button>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                                        搜索
                                    </el-button>
                                </div>

                                <div class="action-buttons">
                                    <el-button type="info" icon="Refresh" @click="handleSyc" size="small">
                                        同步数据
                                    </el-button>
                                    <el-button type="warning" icon="Delete" @click="handleAutoDelete" size="small">
                                        清理多余数据
                                    </el-button>
                                    <el-button type="success" icon="Upload" @click="handleAdd" size="small">
                                        批量导入
                                    </el-button>
                                    <el-button type="primary" icon="Edit" @click="handleTextImport" size="small">
                                        文本导入
                                    </el-button>
                                    <el-button type="danger" icon="Delete" @click="delBatch()"
                                        :disabled="selectData.length === 0" size="small">
                                        批量移除 ({{ selectData.length }})
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>
            <!-- 黑名单列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <WarningFilled />
                        </el-icon>
                        <span>黑名单列表</span>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable" :cell-style="cellStyle"
                        :row-class-name="tableRowClassName" @selection-change="selectChanged" height="430" stripe>
                        <el-table-column type="selection" width="55" />

                        <!-- 车辆信息列 -->
                        <el-table-column label="车辆信息" width="200" fixed="left">
                            <template #default="{ row }">
                                <div class="vehicle-info-cell">
                                    <div class="vehicle-details">
                                        <div class="car-number-container">
                                            <span :class="['plate-number', getPlateType(row.carCode)]">
                                                {{ row.carCode }}
                                            </span>
                                        </div>
                                        <div class="owner-name">{{ row.owner }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车场信息列 -->
                        <el-table-column label="车场名称" width="120" align="center">
                            <template #default="{ row }">
                                <el-tag type="info" size="small">
                                    {{ row.parkName }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <!-- 黑名单类型列 -->
                        <el-table-column label="黑名单类型" width="140" align="center">
                            <template #default="{ row }">
                                <el-tag type="danger" size="small">
                                    {{ row.specialCarTypeConfigName }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <!-- 有效期列 -->
                        <el-table-column label="有效期" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.blackListForeverFlag === '永久' ? 'danger' : 'warning'" size="small">
                                    {{ row.blackListForeverFlag }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <!-- 原因列 -->
                        <el-table-column label="黑名单原因" min-width="200">
                            <template #default="{ row }">
                                <div class="reason-cell">
                                    {{ row.reason }}
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 备注信息列 -->
                        <el-table-column label="备注信息" width="200">
                            <template #default="{ row }">
                                <div class="remark-info-cell">
                                    <div v-if="row.remark1" class="remark-item">
                                        <span class="remark-label">备注1：</span>
                                        <span class="remark-content">{{ row.remark1 }}</span>
                                    </div>
                                    <div v-if="row.remark2" class="remark-item">
                                        <span class="remark-label">备注2：</span>
                                        <span class="remark-content">{{ row.remark2 }}</span>
                                    </div>
                                    <div v-if="!row.remark1 && !row.remark2" class="no-remark">
                                        暂无备注
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="150" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons-inline">
                                    <el-button type="info" text icon="View" @click="handleView(row)"
                                        class="action-btn-view">
                                        查看
                                    </el-button>
                                    <el-button type="danger" text icon="Delete" @click="handleDelete(row.id)"
                                        class="action-btn-delete">
                                        移除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div class="pagination">
                <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
                    @current-change="handlePageChange">
                </el-pagination>
            </div>
        </div>
        <div>
            <el-dialog title="批量导入黑名单" v-model="dialogVisible" width="420px">
                <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :file-list="fileList"
                    :before-upload="beforeUpload" :action="uploadUrl" :http-request="customHttpRequest"
                    :on-success="handleSuccess">
                    <el-icon class="el-icon-upload">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            <text style="font-size: 14px; color: red;">
                                仅允许导入xls、xlsx格式文件，上传文件不能超过500KB!
                            </text>
                        </div>
                    </template>
                </el-upload>
                <el-progress :percentage="uploadPercentage" v-if="uploadPercentage > 0"></el-progress>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false">
                            取消
                        </el-button>
                        <el-button type="primary" @click="dialogVisible = false">
                            确认
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
        
        <!-- 文本批量导入弹窗 -->
        <el-dialog title="文本批量导入黑名单" v-model="textImportDialogVisible" width="600px" class="text-import-dialog">
            <el-form :model="textImportForm" ref="textImportFormRef" :rules="textImportRules" label-width="120px">
                <el-form-item label="车场名称" prop="parkName">
                    <el-select v-model="textImportForm.parkName" placeholder="请选择车场名称" 
                        @change="handleTextImportParkChange" class="full-width">
                        <el-option 
                            v-for="park in availableParks" 
                            :key="park.value" 
                            :label="park.label" 
                            :value="park.value" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="黑名单类型" prop="specialCarTypeConfigName">
                    <el-select v-model="textImportForm.specialCarTypeConfigName" placeholder="请选择黑名单类型" 
                        class="full-width">
                        <el-option 
                            v-for="item in textImportSpecialCarTypeList" 
                            :key="item.id" 
                            :label="item.name" 
                            :value="item.name" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="拉黑期限" prop="isPermament">
                    <el-select v-model="textImportForm.isPermament" placeholder="请选择拉黑期限" 
                        class="full-width">
                        <el-option label="永久" value="永久" />
                        <el-option label="自定义" value="自定义" />
                    </el-select>
                </el-form-item>
                
                <el-form-item v-if="textImportForm.isPermament === '自定义'" label="有效时间" prop="timePeriod">
                    <el-date-picker
                        v-model="textImportForm.timePeriod"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        class="full-width" />
                </el-form-item>
                
                <el-form-item label="车牌号码" prop="carCodes">
                    <el-input 
                        v-model="textImportForm.carCodes" 
                        type="textarea" 
                        :rows="8" 
                        placeholder="请输入车牌号码，多个车牌请用换行分隔，例如：&#10;黑A12345&#10;黑B67890&#10;黑C11111"
                        class="full-width" />
                    <div class="input-tip">
                        <el-text type="info" size="small">
                            支持批量输入，每行一个车牌号，系统会自动解析并添加
                        </el-text>
                    </div>
                </el-form-item>
                
                <el-form-item label="黑名单原因" prop="blackReason">
                    <el-input 
                        v-model="textImportForm.blackReason" 
                        type="textarea" 
                        :rows="3" 
                        placeholder="请输入黑名单原因"
                        class="full-width" />
                </el-form-item>
                
                <el-form-item label="备注1" prop="remark1">
                    <el-input 
                        v-model="textImportForm.remark1" 
                        placeholder="请输入备注1（可选）"
                        class="full-width" />
                </el-form-item>
                
                <el-form-item label="备注2" prop="remark2">
                    <el-input 
                        v-model="textImportForm.remark2" 
                        placeholder="请输入备注2（可选）"
                        class="full-width" />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="textImportDialogVisible = false">
                        取消
                    </el-button>
                    <el-button type="primary" @click="handleTextImportSubmit" :loading="textImportLoading">
                        确认导入
                    </el-button>
                </div>
            </template>
        </el-dialog>
        
        <!-- 添加黑名单信息 -->
        <el-dialog title="补充黑名单车辆信息" v-model="dialogVisibleBlack" width="80%">
            <el-form :model="info" ref="formRef">
                <el-table :data="info.tableDataDefeat" @selection-change="handleSelectionChange" border class="table"
                    header-cell-class-name="table-header" :cell-style="cellStyle" :row-class-name="tableRowClassName"
                    height="350">
                    <el-table-column type="index" label="序号" width="50px" />
                                    <el-table-column label="车场名称" prop="parkName" width="140px">
                                        <template #default="scope">
                                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.parkName`"
                                                :rules="formRules.parkName">
                                                <el-select v-model="info.tableDataDefeat[scope.$index].parkName" placeholder="请选择车场名称"
                                                    @change="changeBlackParkName(info.tableDataDefeat[scope.$index].parkName, scope.$index)">
                                                    <el-option 
                                                        v-for="park in availableParks" 
                                                        :key="park.value" 
                                                        :label="park.label" 
                                                        :value="park.value" />
                                                </el-select>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                    <el-table-column label="车牌号码" prop="carCode" width="130px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.carCode`" :rules="formRules.carCode">
                                <el-input placeholder="请填写车牌" v-model="info.tableDataDefeat[scope.$index].carCode" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="黑名单类型" prop="specialCarTypeConfigName" width="180px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.specialCarTypeConfigName`"
                                :rules="formRules.specialCarTypeConfigName">
                                <el-select v-model="info.tableDataDefeat[scope.$index].specialCarTypeConfigName"
                                    placeholder="请选择黑名单名称">
                                    <el-option
                                        v-for="item in getOptionsForRow(info.tableDataDefeat[scope.$index].parkName)"
                                        :key="item.name" :label="item.name" :value="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="车主姓名" prop="owner" width="180px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.owner`">
                                <el-input placeholder="请填写车主姓名" v-model="info.tableDataDefeat[scope.$index].owner" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="有效期" prop="isPermament" width="170px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.isPermament`"
                                :rules="formRules.isPermament">
                                <!-- 下拉框选项：1、永久；2、自定义，显示自定义的时候才显示下变得日期时间组件，默认不显示 -->
                                <el-select v-model="info.tableDataDefeat[scope.$index].isPermament"
                                    placeholder="请选择有效期">
                                    <el-option v-for="(item) in isPermamentList" :key="item" :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="有效时间" prop="timePeriodListResults" width="420x">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.timePeriodListResults`">
                                <el-date-picker v-if="info.tableDataDefeat[scope.$index].isPermament == '自定义'"
                                    v-model="info.tableDataDefeat[scope.$index].timePeriodListResults"
                                    type="datetimerange" :shortcuts="shortcuts" range-separator="至"
                                    start-placeholder="开始时间" end-placeholder="结束时间" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="黑名单原因" prop="blackReason" width="180px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.blackReason`"
                                :rules="formRules.blackReason">
                                <el-input v-model="info.tableDataDefeat[scope.$index].blackReason"
                                    placeholder="请填写黑名单原因" type="textarea"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="备注1" prop="remark1" width="180px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.remark1`">
                                <el-input v-model="info.tableDataDefeat[scope.$index].remark1" placeholder="请填写备注1"
                                    type="textarea"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="备注2" prop="remark2" width="180px">
                        <template #default="scope">
                            <el-form-item :prop="`tableDataDefeat.${scope.$index}.remark2`">
                                <el-input v-model="info.tableDataDefeat[scope.$index].remark2" placeholder="请填写备注2"
                                    type="textarea"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisibleBlack = false">取 消</el-button>
                    <el-button type="primary" @click="submit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 查看详情弹窗 -->
        <el-dialog title="黑名单详情" v-model="viewDialogVisible" width="600px" class="view-dialog">
            <div class="detail-content">
                <div class="detail-section">
                    <h3 class="section-title">车辆信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">车牌号码：</span>
                            <span :class="['plate-number', getPlateType(viewData.carCode)]">
                                {{ viewData.carCode }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="label">车主姓名：</span>
                            <span class="value">{{ viewData.owner }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">车场名称：</span>
                            <span class="value">{{ viewData.parkName }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3 class="section-title">黑名单信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">黑名单类型：</span>
                            <el-tag type="danger" size="small">{{ viewData.specialCarTypeConfigName }}</el-tag>
                        </div>
                        <div class="detail-item">
                            <span class="label">有效期：</span>
                            <el-tag :type="viewData.blackListForeverFlag === '永久' ? 'danger' : 'warning'" size="small">
                                {{ viewData.blackListForeverFlag }}
                            </el-tag>
                        </div>
                        <div class="detail-item full-width">
                            <span class="label">黑名单原因：</span>
                            <span class="value">{{ viewData.reason || '暂无' }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section" v-if="viewData.remark1 || viewData.remark2">
                    <h3 class="section-title">备注信息</h3>
                    <div class="detail-grid">
                        <div class="detail-item full-width" v-if="viewData.remark1">
                            <span class="label">备注1：</span>
                            <span class="value">{{ viewData.remark1 }}</span>
                        </div>
                        <div class="detail-item full-width" v-if="viewData.remark2">
                            <span class="label">备注2：</span>
                            <span class="value">{{ viewData.remark2 }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="viewDialogVisible = false" type="primary">
                        关闭
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 添加抽屉面板 -->
        <el-drawer ref="drawerRef" title="黑名单批量导入失败数据" size="550px" direction="rtl" v-model="importNotificationDefeat"
            :before-close="handleClose" close-on-click-modal="false" close-on-press-escape="false">
            <el-table :data="importDefeatData" border class="table" ref="multipleTable"
                header-cell-class-name="table-header">
                <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label"
                    v-for="item in importProps" :key="item.importProps" align="center">
                </el-table-column>
            </el-table>
        </el-drawer>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref, onBeforeUnmount, computed } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from "element-plus";
import { useStore } from "vuex";
import { WarningFilled, Search, ArrowDown, CreditCard, View, Delete, Upload, Refresh } from '@element-plus/icons-vue';
import { activityApi } from "@/api/activity";
const fileList = ref([]);
const importNotificationDefeat = ref(false);
const timePeriod = ref("");
const blackType = ref("");
const formRef = ref(null);
const uploadPercentage = ref(0);
const importData = ref([]);
// 导入成功 提醒
const importSuccess = ref([]);
// 导入失败 提醒
const importDefeat = ref([]);
const importDefeatData = ref([]);
const specialCarTypeNameList = ref([]);
const specialCarTypeNameWanLists = ref([]);
// 搜索面板展开状态
const searchPanelExpanded = ref(false);
const isFormVisible = ref(false);
const specialCarTypeNameFourJiLists = ref([]);
const specialCarTypeNameOuZhouLists = ref([]);
const startTime = ref(null);
const pageTotal = ref(0);
const dialogVisible = ref(false)
const selectData = ref([]);
// 查看弹窗相关
const viewDialogVisible = ref(false);
const viewData = ref({});

// 文本导入相关
const textImportDialogVisible = ref(false);
const textImportLoading = ref(false);
const textImportSpecialCarTypeList = ref([]);
const textImportFormRef = ref(null);

// 文本导入表单数据
const textImportForm = reactive({
    parkName: '',
    specialCarTypeConfigName: '',
    isPermament: '永久',
    timePeriod: null,
    carCodes: '',
    blackReason: '',
    remark1: '',
    remark2: ''
});

// 文本导入表单验证规则
const textImportRules = {
    parkName: [
        { required: true, message: '请选择车场名称', trigger: 'change' }
    ],
    specialCarTypeConfigName: [
        { required: true, message: '请选择黑名单类型', trigger: 'change' }
    ],
    isPermament: [
        { required: true, message: '请选择拉黑期限', trigger: 'change' }
    ],
    timePeriod: [
        { 
            validator: (rule, value, callback) => {
                if (textImportForm.isPermament === '自定义' && (!value || value.length !== 2)) {
                    callback(new Error('请选择有效时间'));
                } else {
                    callback();
                }
            }, 
            trigger: 'change' 
        }
    ],
    carCodes: [
        { required: true, message: '请输入车牌号码', trigger: 'blur' },
        { 
            validator: (rule, value, callback) => {
                if (!value || value.trim() === '') {
                    callback(new Error('请输入车牌号码'));
                } else {
                    const carCodes = value.split('\n').filter(code => code.trim() !== '');
                    if (carCodes.length === 0) {
                        callback(new Error('请输入至少一个车牌号码'));
                    } else {
                        // 验证车牌号格式 - 支持中国车牌号的各种格式
                        // 格式：省份简称 + 地区代码(1-2位字母或数字) + 4-6位数字字母组合
                        const plateRegex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z0-9]{1,2}[A-Z0-9]{4,6}$/;
                        const invalidCodes = carCodes.filter(code => !plateRegex.test(code.trim()));
                        if (invalidCodes.length > 0) {
                            callback(new Error(`以下车牌号格式不正确：${invalidCodes.join(', ')}`));
                        } else {
                            callback();
                        }
                    }
                }
            }, 
            trigger: 'blur' 
        }
    ],
    blackReason: [
        { required: true, message: '请输入黑名单原因', trigger: 'blur' }
    ]
};

import Cookies from "js-cookie";

const root = "/parking/blackList/";
const uploadUrl = "/parking/blackList/import";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
    { label: "车场名称", prop: "parkName" },
    { label: "车牌号码", prop: "carCode" },
    { label: "车主姓名", prop: "owner" },
    { label: "黑名单类型", prop: "specialCarTypeConfigName" },
    { label: "有效期", prop: "blackListForeverFlag" },
    { label: "黑名单原因", prop: "reason" },
    { label: "备注1", prop: "remark1" },
    { label: "备注2", prop: "remark2" },
];
const importProps = [
    { label: "车牌号码", prop: "carCode" },
    { label: "导入失败原因", prop: "defeatReason" }
];
const formRules = {
    parkName: [
        {
            required: true,
            message: "请选择车场名称",
            trigger: "change",
        },
    ], carCode: [
        {
            required: true,
            message: "请输入车牌号",
            trigger: "blur"
        }
    ], specialCarTypeConfigName: [
        {
            required: true,
            message: "请选择黑名单名称",
            trigger: "change",
        },
    ],
    owner: [
        {
            required: true,
            message: "请输入车主姓名",
            trigger: "blur",
        },
    ],
    blackReason: [
        {
            required: true,
            message: "请输入黑名单原因",
            trigger: "blur",
        },
    ],
};
const shortcuts = [
    {
        text: '后一天',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一天的日期
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            // 设置时间为8:00:00
            const endTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
            // 设置时间为7:59:59
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, endTime]
        },
    },
    {
        text: '后一周',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一周的日期
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000 * 7);
            // 设置时间为8:00:00
            const endTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
            // 设置时间为7:59:59
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, endTime]
        },
    },
    {
        text: '后一个月',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一个月的日期
            // 计算后一个月的日期
            const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            const oneMonthEndTime = new Date(oneMonthLater.getFullYear(), oneMonthLater.getMonth(), oneMonthLater.getDate(), 23, 59, 59);
            const oneMonthStartTime = new Date(oneMonthLater.getFullYear(), oneMonthLater.getMonth(), oneMonthLater.getDate(), 0, 0, 0);
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, oneMonthEndTime]
        },
    },
    {
        text: '后三个月',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一个月的日期
            // 计算后三个月的日期
            const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
            const threeMonthsEndTime = new Date(threeMonthsLater.getFullYear(), threeMonthsLater.getMonth(), threeMonthsLater.getDate(), 23, 59, 59);
            const threeMonthsStartTime = new Date(threeMonthsLater.getFullYear(), threeMonthsLater.getMonth(), threeMonthsLater.getDate(), 0, 0, 0);
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, threeMonthsEndTime]
        },
    },
    {
        text: '后一年',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一个月的日期
            // 计算一年后的日期
            const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            const oneYearEndTime = new Date(oneYearLater.getFullYear(), oneYearLater.getMonth(), oneYearLater.getDate(), 23, 59, 59);
            const oneYearStartTime = new Date(oneYearLater.getFullYear(), oneYearLater.getMonth(), oneYearLater.getDate(), 0, 0, 0);
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, oneYearEndTime]
        },
    },
    {
        text: '后十年',
        value: () => {
            // 获取当前时间
            const now = new Date();
            // 计算后一个月的日期
            const tenYearsLater = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
            const tenYearsEndTime = new Date(tenYearsLater.getFullYear(), tenYearsLater.getMonth(), tenYearsLater.getDate(), 23, 59, 59);
            const tenYearsStartTime = new Date(tenYearsLater.getFullYear(), tenYearsLater.getMonth(), tenYearsLater.getDate(), 0, 0, 0);
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            return [startTime, tenYearsEndTime]
        },
    }
];
const upload = reactive({
    // 是否显示弹出层（用户导入）
    open: false,
    // 弹出层标题（用户导入）
    title: "",
    // 是否禁用上传
    isUploading: false,
    // 是否更新已经存在的用户数据
    updateSupport: 0,
    // 设置上传的请求头部
    headers: { Authorization: "Bearer" },
    // 上传的地址
    url: root + "/parking/blackList/import",
});
const getOptionsForRow = (parkName) => {
    if (parkName == '万象上东') {
        return specialCarTypeNameWanLists.value;
    } else if (parkName == '四季上东') {
        return specialCarTypeNameFourJiLists.value;
    } else if (parkName == '欧洲新城') {
        return specialCarTypeNameOuZhouLists.value;
    }
};
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
function isValidDateTime(input) {
    const regex = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([01][0-9]|2[0-3])([0-5][0-9])([0-5][0-9])$/;
    return regex.test(input);
}
const StartDate = ref("");
const endDate = ref("");
const str = ref([]);
const submit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            // 遍历info.tableDataDefeat数组
            info.value.tableDataDefeat.forEach((item, index) => {
                // 根据item的specialCarTypeConfigName查询数组中对应的id值
                if (item.parkName == '万象上东') {
                    // specialCarTypeConfigName不是数字的时候才进行筛选
                    if (isNaN(item.specialCarTypeConfigName)) {
                        item.specialCarTypeConfigName = specialCarTypeNameWanLists.value.filter(
                            elementFilter => elementFilter.name === item.specialCarTypeConfigName)[0].id;
                    }
                } else if (item.parkName == '四季上东') {
                    if (isNaN(item.specialCarTypeConfigName)) {
                        item.specialCarTypeConfigName = specialCarTypeNameFourJiLists.value.filter(
                            elementFilter => elementFilter.name === item.specialCarTypeConfigName)[0].id;
                    }
                } else if (item.parkName == '欧洲新城') {
                    if (isNaN(item.specialCarTypeConfigName)) {
                        item.specialCarTypeConfigName = specialCarTypeNameOuZhouLists.value.filter(
                            elementFilter => elementFilter.name === item.specialCarTypeConfigName)[0].id;
                    }
                }
                // 查询出parkCode
                request
                    .get("/parking/yardInfo/yardCode",
                        {
                            params: {
                                yardName: item.parkName
                            },
                        })
                    .then((res) => {
                        if (item.timePeriodListResults.length > 0) {
                            // 对[Fri Dec 06 2024 00:00:00 GMT+0800 (中国标准时间), Fri Dec 13 2024 23:59:59 GMT+0800 (中国标准时间)]格式化成yyyymmddhhmmss-yyyymmddhhmmss的形式
                            // 解析日期字符串并格式化
                            // 判断字符串是不是yyyymmddhhmmss格式，若不是的话再进行格式化
                            if (isValidDateTime(item.timePeriodListResults[0]) == false) {
                                StartDate.value = formatDate(new Date(item.timePeriodListResults[0]));
                                endDate.value = formatDate(new Date(item.timePeriodListResults[1]));
                                timePeriod.value = StartDate.value + "-" + endDate.value;
                            } else {
                                timePeriod.value = item.timePeriodListResults[0] + "-" + item.timePeriodListResults[1];
                            }
                        } else {
                            timePeriod.value = "";
                        }
                        request({
                            url: "/parking/blackList/addBlackListCarVue",
                            method: "POST",
                            data: {
                                parkName: item.parkName,
                                parkCode: res.data[0],
                                carCode: item.carCode,
                                carOwner: item.owner,
                                isPermament: item.isPermament,
                                timePeriod: timePeriod.value,
                                reason: item.blackReason,
                                remark1: item.remark1,
                                remark2: item.remark2,
                                specialCarTypeId: item.specialCarTypeConfigName,
                                specialCarTypeName: item.specialCarTypeConfigName,
                            },
                        }).then((res) => {
                            console.log(res.data.data)
                            // 将获取到的值遍历接着通过"--"进行拆分获取最后一个值
                            str.value = res.data.data;
                            str.value.forEach(item => {
                                const arr = item.split("--");
                                if (arr[arr.length - 2] == "业务成功") {
                                    info.value = {}
                                    getData()
                                    ElMessage({
                                        type: "success",
                                        message: "添加成功",
                                    })
                                    importData.value = [];
                                    importSuccess.value = [];
                                    importDefeatData.value = [];
                                    importDefeat.value = [];
                                    importNotificationDefeat.value = false;
                                    dialogVisibleBlack.value = false
                                    //重新加载页面
                                    window.location.reload()
                                } else {
                                    // 提示用户错误信息
                                    ElMessage({
                                        type: "error",
                                        message: arr[arr.length - 2],
                                    })
                                    getData();
                                    dialogVisibleBlack.value = false
                                    importNotificationDefeat.value = false;
                                }
                            })
                        });
                    })
            });
        } else {
            return false;
        }
    });
}
const blackData = reactive({
    data: {
        id: "",
        parkName: "",
        // 创建个数组
        specialCarTypeName: "",
        userName: "",
        userPhone: "",
        carNo: "",
        isPermament: "",
        remark1: "",
        remark2: "",
    }
});
const addInput = () => {
    inputs.value.push(''); // 向数组中添加一个新的空字符串
};
// 删除输入框的方法
const removeInput = (index) => {
    // 如何将全部元素移除，且数据也清空
    inputs.value.splice(index, 1); // 从数组中移除指定索引的元素
};
const timePeriodListResults = ref([])
const carNoList = ref([]);
const inputs = ref([]);
const isPermamentList = ref(['永久', '自定义'])
// 抽屉关闭的回调函数
const handleClose = (done) => {
    ElMessageBox.confirm(
        '您是否需要补充错误数据?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            // 判断importDefeatData中的元素中的reasonDefault是否包含有"已存在"的数据，有的话才显示，要是所有的都不包含的话不打开
            let isShowNotification = importDefeatData.value.every(item => item.defeatReason.includes("已存在"));
            importDefeatData.value.forEach(item => {
                console.log(item.defeatReason)
            })
            // console.log(isShowNotification)
            if (isShowNotification == true) {
                // 直接关闭窗口
                // importNotificationDefeat.value = true;
                // 清空存储的数据
                importData.value = [];
                importSuccess.value = [];
                importDefeatData.value = [];
                importDefeat.value = [];
                importNotificationDefeat.value = false;
                done();
            } else {
                dialogVisibleBlack.value = true
            }
            getData()
            ElMessage({
                type: 'success',
                message: '关闭成功',
            })
        })
        .catch(() => {
            // 清空存储的数据
            importData.value = [];
            importSuccess.value = [];
            importDefeatData.value = [];
            importDefeat.value = [];
            importNotificationDefeat.value = false
            getData()
        })
};
const handleOnset = () => {
    query.userName = "",
        query.carCode = "",
        query.specialCarTypeConfigName = "",
        query.blackReason = "",
        query.timePeriodList = "",
        query.remark1 = "",
        query.remark2 = "",
        query.parkName = defaultPark.value
    getData();
};
const clearUserName = () => {
    query.userName = '';
    getData();
};
const clearBlackReason = () => {
    query.userName = '';
    getData();
};
const clearCarNo = () => {
    query.carNo = '';
    getData();
};
const clearRemark1 = () => {
    query.remark1 = ''
    getData();
};
const clearRemark2 = () => {
    query.remark2 = ''
    getData();
};
const changeBlackParkName = (val, index) => {
    console.log(val)
    // console.log(tableDataDefeat.value.parkName)
    // 调用查询黑名单名称的接口
    if (val == '万象上东') {
        request
            .get("/parking/yardInfo/yardCode",
                {
                    params: {
                        yardName: val
                    },
                })
            .then((res) => {
                // console.log("arr:" + arr[1])
                request.get("/parking/blackList/getSpecialCarTypeList",
                    {
                        params: {
                            parkCodeList: res.data[0]
                        },
                    })
                    .then((res) => {
                        // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                        specialCarTypeNameWanLists.value = res.data.data.recordList;
                        // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                    })
            });
    } else if (val == '四季上东') {
        request
            .get("/parking/yardInfo/yardCode",
                {
                    params: {
                        yardName: val
                    },
                })
            .then((res) => {
                // console.log("arr:" + arr[1])
                request.get("/parking/blackList/getSpecialCarTypeList",
                    {
                        params: {
                            parkCodeList: res.data[0]
                        },
                    })
                    .then((res) => {
                        // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                        specialCarTypeNameFourJiLists.value = res.data.data.recordList;
                        // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                    })
            });
    } else if (val == '欧洲新城') {
        request
            .get("/parking/yardInfo/yardCode",
                {
                    params: {
                        yardName: val
                    },
                })
            .then((res) => {
                // console.log("arr:" + arr[1])
                request.get("/parking/blackList/getSpecialCarTypeList",
                    {
                        params: {
                            parkCodeList: res.data[0]
                        },
                    })
                    .then((res) => {
                        // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                        specialCarTypeNameOuZhouLists.value = res.data.data.recordList;
                        // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                    })
            });
    }
    info.value.tableDataDefeat[index].specialCarTypeConfigName = '';
}
const changeParkName = () => {
    query.specialCarTypeConfigName = ""
    handleSearch();
    console.log(query.parkName)
    // 调用查询黑名单名称的接口
    request
        .get("/parking/yardInfo/yardCode",
            {
                params: {
                    yardName: query.parkName
                },
            })
        .then((res) => {
            request.get("/parking/blackList/getSpecialCarTypeList",
                {
                    params: {
                        parkCodeList: res.data[0]
                    },
                })
                .then((res) => {
                    specialCarTypeNameList.value = res.data.data.recordList
                    // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                })
        });
}
const applicantUserId = ref("");
const dialogVisibleBlack = ref(false)
applicantUserId.value = localStorage.getItem("userId")

// 获取用户角色
const userRole = localStorage.getItem("ms_role_name") || "";

// 调试信息：打印当前用户角色
console.log("当前用户角色:", userRole);
console.log("localStorage中的所有角色相关数据:", {
    ms_role_name: localStorage.getItem("ms_role_name"),
    role: localStorage.getItem("role"),
    userRole: localStorage.getItem("userRole"),
    roleName: localStorage.getItem("roleName")
});

// 根据角色确定可用的车场选项
const availableParks = computed(() => {
    console.log("计算车场选项，当前角色:", userRole);
    if (userRole === "欧洲新城_用户") {
        console.log("匹配到欧洲新城_用户，返回欧洲新城车场");
        return [
            { label: "欧洲新城", value: "欧洲新城" }
        ];
    } else {
        console.log("未匹配到欧洲新城_用户，返回所有车场");
        return [
            { label: "学院新城", value: "学院新城" },
            { label: "万象上东", value: "万象上东" },
            { label: "四季上东", value: "四季上东" },
            { label: "欧洲新城", value: "欧洲新城" }
        ];
    }
});

// 根据角色设置默认车场
const defaultPark = computed(() => {
    if (userRole === "欧洲新城_用户") {
        return "欧洲新城";
    } else {
        return "万象上东";
    }
});

const query = reactive({
    parkName: defaultPark.value,
    carCode: "", // 车牌号码
    userName: "", // 车主姓名
    specialCarTypeConfigName: "", // 黑名单类型
    blackReason: "", // 黑名单原因
    remark1: "", // 备注1
    remark2: "", // 备注2
    pageNum: 1,
    pageSize: 10,
});
request.get("/parking/yardInfo/yardCode",
    {
        params: {
            yardName: query.parkName
        },
    })
    .then((res) => {
        request.get("/parking/blackList/getSpecialCarTypeList",
            {
                params: {
                    parkCodeList: res.data[0]
                },
            })
            .then((res) => {
                specialCarTypeNameList.value = res.data.data.recordList
                // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
            })
    });

const tableData = ref([]);
const tableDataDefeat = ref([]);
const info = ref({
    tableDataDefeat: [],
})
// 获取表格数据
const getData = () => {
    // console.log(query.specialCarTypeConfigName)
    request
        .get(root + "page", {
            params: {
                parkName: query.parkName,
                carCode: query.carCode,
                userName: query.userName,
                specialCarTypeConfigName: query.specialCarTypeConfigName,
                blackReason: query.blackReason,
                remark1: query.remark1,
                remark2: query.remark2,
                pageNum: query.pageNum,
                pageSize: query.pageSize,
            },
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
        const searchConditions = [];
        if (query.carCode) searchConditions.push(`车牌号: ${query.carCode}`);
        if (query.userName) searchConditions.push(`车主: ${query.userName}`);
        if (query.parkName) searchConditions.push(`停车场: ${query.parkName}`);
        if (query.specialCarTypeConfigName) searchConditions.push(`黑名单类型: ${query.specialCarTypeConfigName}`);
        if (query.blackReason) searchConditions.push(`拉黑原因: ${query.blackReason}`);
        if (query.remark1) searchConditions.push(`备注1: ${query.remark1}`);
        if (query.remark2) searchConditions.push(`备注2: ${query.remark2}`);

        const searchDescription = searchConditions.length > 0
            ? `查询黑名单信息 (${searchConditions.join(', ')})`
            : '查询所有黑名单信息';

        await activityApi.logBlacklistOperation(
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

// 切换搜索面板
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
    isFormVisible.value = !isFormVisible.value;
};

// 重置搜索条件
const resetSearch = () => {
    query.carCode = '';
    query.owner = '';
    query.parkName = '';
    query.specialCarTypeId = '';
    query.blackListForeverFlag = '';
    query.reason = '';
    query.remark1 = '';
    query.remark2 = '';
    handleSearch();
};

// 查看操作
const handleView = (row) => {
    // 显示查看详情弹窗
    viewDialogVisible.value = true;
    viewData.value = { ...row };
    console.log('查看黑名单记录:', row);
};

// 删除操作
const handleDelete = (id) => {
    // 找到对应的记录
    const record = tableData.value.find(item => item.id === id);
    if (!record) {
        ElMessage.error('未找到要删除的记录');
        return;
    }

    ElMessageBox.confirm('确定要移除这条黑名单记录吗？删除后会同时清除该车辆的违规记录。', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        const loading = ElLoading.service({
            lock: true,
            text: '正在删除数据，请稍后.....',
            background: 'rgba(255, 255, 255, 0.7)',
        });

        // 构造删除参数，格式与批量删除一致
        const removeInfo = [record.carCode + "_" + record.parkName + "_" + record.id];

        request.post('/parking/blackList/batchDelete', removeInfo)
            .then(response => {
                loading.close();
                if (response.code == 0) {
                    ElMessage.success('删除成功');
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "管理员";
                    activityApi.logBlacklistOperation(
                        userId,
                        username,
                        "删除",
                        `删除了车牌号 ${record.carCode} 在 ${record.parkName} 车场的黑名单记录`,
                        null,
                        JSON.stringify({ carCode: record.carCode, parkName: record.parkName }),
                        null
                    ).catch(err => {
                        console.error("记录活动日志失败:", err);
                    });
                    // 重新加载数据
                    getData();
                } else {
                    ElMessage.error(response.msg || '删除失败');
                }
            })
            .catch(error => {
                loading.close();
                console.error('删除失败:', error);
                ElMessage.error('删除失败，请重试');
            });
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};
const selectChanged = (val) => {
    selectData.value = val;
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
const handleSyc = () => {
    // 同步数据操作
    console.log(query.parkName)
    const loadingTime = 0;
    dialogVisible.value = false
    // 使用setTimeout模拟异步请求
    setTimeout(() => {
        const loading = ElLoading.service({
            lock: true,
            text: '正在更新数据，请稍后.....',
            background: 'rgba(255, 255, 255, 0.7)',
        })
        request
            .get(root + "synchroBlack", {
                params: {
                    parkName: query.parkName
                },
            })
            .then((res) => {
                loading.close()
                ElMessage.success("成功更新" + res.data.data + "数据!");

                // 记录活动日志
                const userId = localStorage.getItem("ms_userid") || "unknown";
                const username = localStorage.getItem("ms_username") || "管理员";
                activityApi.logBlacklistOperation(
                    userId,
                    username,
                    "同步数据",
                    `同步了 ${query.parkName} 车场的黑名单数据，更新了 ${res.data.data} 条记录`,
                    null,
                    null,
                    JSON.stringify({ parkName: query.parkName, updateCount: res.data.data })
                ).catch(err => {
                    console.error("记录活动日志失败:", err);
                });

                getData()
            });
    }, loadingTime);
};
// 删除操作
const delBatch = () => {
    if (selectData.value.length == 0) {
        ElMessage({
            type: 'warning',
            message: '请选择要删除的项'
        })
    } else {
        ElMessageBox.confirm('你确定要删除选中的数据吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            const loadingTime = 0;
            // 添加加载弹窗
            setTimeout(() => {
                const loading = ElLoading.service({
                    lock: true,
                    // 字体改成黑色
                    text: '正在删除数据，请稍后.....',
                    // 改成白色的背景
                    background: 'rgba(255, 255, 255, 0.7)',
                })
                // 将选中的车牌号、车场名称连接成一个字符串放到数组中
                const removeInfo = selectData.value.map(item => item.carCode + "_" + item.parkName + "_" + item.id)
                console.log(removeInfo)
                request.post('/parking/blackList/batchDelete', removeInfo)
                    .then(response => {
                        if (response.code == 0) {
                            loading.close()
                            ElMessage.success('批量删除成功!');

                            // 记录活动日志
                            const userId = localStorage.getItem("ms_userid") || "unknown";
                            const username = localStorage.getItem("ms_username") || "管理员";
                            activityApi.logBlacklistOperation(
                                userId,
                                username,
                                "批量删除",
                                `批量删除了 ${selectData.value.length} 条黑名单记录`,
                                null,
                                JSON.stringify(selectData.value.map(item => ({ carCode: item.carCode, parkName: item.parkName }))),
                                null
                            ).catch(err => {
                                console.error("记录活动日志失败:", err);
                            });

                            // 重新加载数据
                            query.pageNum = 1;
                            getData();
                        } else {
                            loading.close()
                            ElMessage.error(response.msg);
                        }
                    })
            }, loadingTime)
        }).catch(() => {
            ElMessage.info('已取消删除');
            // 清空选中的数组
            selectData.value = [];
            getData();
            // 清空选中的
        })
    }
};

// 新增操作
const handleAdd = () => {
    dialogVisible.value = true;
};

// 文本导入操作
const handleTextImport = () => {
    // 重置表单
    Object.assign(textImportForm, {
        parkName: defaultPark.value,
        specialCarTypeConfigName: '',
        isPermament: '永久',
        timePeriod: null,
        carCodes: '',
        blackReason: '',
        remark1: '',
        remark2: ''
    });
    
    // 根据默认车场加载黑名单类型
    if (textImportForm.parkName) {
        handleTextImportParkChange(textImportForm.parkName);
    }
    
    textImportDialogVisible.value = true;
};

// 文本导入车场变化处理
const handleTextImportParkChange = (parkName) => {
    if (!parkName) {
        textImportSpecialCarTypeList.value = [];
        return;
    }
    
    // 获取车场代码
    request.get("/parking/yardInfo/yardCode", {
        params: { yardName: parkName }
    }).then((res) => {
        // 获取黑名单类型列表
        request.get("/parking/blackList/getSpecialCarTypeList", {
            params: { parkCodeList: res.data[0] }
        }).then((res) => {
            textImportSpecialCarTypeList.value = res.data.data.recordList;
        }).catch(err => {
            console.error("获取黑名单类型失败:", err);
            ElMessage.error("获取黑名单类型失败");
        });
    }).catch(err => {
        console.error("获取车场代码失败:", err);
        ElMessage.error("获取车场代码失败");
    });
};

// 自动清理功能
const handleAutoDelete = () => {
    ElMessageBox.confirm(
        `确定要对 ${query.parkName} 车场执行数据清理吗？\n\n此操作将：\n• 查询外部API获取最新黑名单数据\n• 对比本地与外部数据差异\n• 删除本地多余的黑名单记录（外部API中不存在的）\n• 同时删除对应的违规记录\n\n此操作不可撤销！`,
        '确认清理多余数据',
        {
            confirmButtonText: '确定清理',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
        }
    ).then(() => {
        const loading = ElLoading.service({
            lock: true,
            text: '正在对比数据并清理多余记录，请稍后...',
            background: 'rgba(255, 255, 255, 0.7)',
        });

        request.get('/parking/blackList/autoDeleteByExternalApi', {
            params: {
                parkName: query.parkName
            }
        }).then(response => {
            loading.close();
            
            if (response.code === '0') {
                const data = response.data;
                const message = `数据清理完成！\n\n清理结果：\n• 本地记录：${data.localRecordCount} 条\n• 外部记录：${data.externalRecordCount} 条\n• 清理多余黑名单：${data.deletedBlackListCount} 条\n• 清理违规记录：${data.deletedViolationCount} 条`;
                
                if (data.deletedCars && data.deletedCars.length > 0) {
                    const deletedCarsList = data.deletedCars.join('、');
                    ElMessageBox.alert(
                        `${message}\n\n已删除的车牌：\n${deletedCarsList}`,
                        '数据清理完成',
                        {
                            confirmButtonText: '确定',
                            type: 'success'
                        }
                    );
                } else {
                    ElMessage.success(message);
                }

                // 记录活动日志
                const userId = localStorage.getItem("ms_userid") || "unknown";
                const username = localStorage.getItem("ms_username") || "管理员";
                activityApi.logBlacklistOperation(
                    userId,
                    username,
                    "清理多余数据",
                    `对 ${query.parkName} 车场执行数据清理，清理了 ${data.deletedBlackListCount} 条多余的黑名单记录和 ${data.deletedViolationCount} 条违规记录`,
                    null,
                    JSON.stringify({
                        parkName: query.parkName,
                        deletedCars: data.deletedCars,
                        statistics: data
                    }),
                    null
                ).catch(err => {
                    console.error("记录活动日志失败:", err);
                });

                // 刷新数据
                getData();
            } else {
                ElMessage.error(response.msg || '数据清理失败');
            }
        }).catch(error => {
            loading.close();
            console.error('数据清理失败:', error);
            ElMessage.error('数据清理失败，请重试');
        });
    }).catch(() => {
        ElMessage.info('已取消数据清理');
    });
};

// 文本导入提交
const handleTextImportSubmit = async () => {
    try {
        await textImportFormRef.value.validate();
        textImportLoading.value = true;
        
        // 解析车牌号码
        const carCodes = textImportForm.carCodes
            .split('\n')
            .map(code => code.trim())
            .filter(code => code !== '');
        
        if (carCodes.length === 0) {
            ElMessage.error('请输入至少一个车牌号码');
            return;
        }
        
        // 获取车场代码
        const parkCodeRes = await request.get("/parking/yardInfo/yardCode", {
            params: { yardName: textImportForm.parkName }
        });
        
        // 获取黑名单类型ID
        const specialCarType = textImportSpecialCarTypeList.value.find(
            item => item.name === textImportForm.specialCarTypeConfigName
        );
        
        if (!specialCarType) {
            ElMessage.error('未找到对应的黑名单类型');
            return;
        }
        
        // 批量查询车主信息
        console.log('🔍 开始查询车主信息...');
        let ownerInfoRes;
        try {
            ownerInfoRes = await request.post("/parking/blackList/batchGetCarOwnerByPlate", {
                carCodes: carCodes,
                parkName: textImportForm.parkName
            });
            console.log('✅ 车主信息查询结果:', ownerInfoRes.data);
        } catch (error) {
            console.warn('⚠️ 车主信息查询失败，将使用默认车主信息:', error);
            ownerInfoRes = { data: [] };
        }
        
        // 验证车主信息查询结果的数据结构
        let ownerInfoList = [];
        console.log('🔍 车主信息数据结构分析:', {
            isArray: Array.isArray(ownerInfoRes.data),
            hasList: ownerInfoRes.data && Array.isArray(ownerInfoRes.data.list),
            hasData: ownerInfoRes.data && Array.isArray(ownerInfoRes.data.data),
            dataType: typeof ownerInfoRes.data,
            dataKeys: ownerInfoRes.data ? Object.keys(ownerInfoRes.data) : 'null'
        });
        
        if (Array.isArray(ownerInfoRes.data)) {
            ownerInfoList = ownerInfoRes.data;
            console.log('✅ 使用直接数组格式');
        } else if (ownerInfoRes.data && Array.isArray(ownerInfoRes.data.list)) {
            ownerInfoList = ownerInfoRes.data.list;
            console.log('✅ 使用 data.list 格式');
        } else if (ownerInfoRes.data && Array.isArray(ownerInfoRes.data.data)) {
            ownerInfoList = ownerInfoRes.data.data;
            console.log('✅ 使用 data.data 格式');
        } else {
            console.warn('⚠️ 车主信息查询结果不是预期的数组格式:', ownerInfoRes.data);
            console.log('📋 将使用空数组，所有车主信息显示为"未知车主"');
        }
        
        console.log('📊 最终车主信息列表:', ownerInfoList);
        
        // 批量添加黑名单 - 调用外部接口
        const promises = carCodes.map(async (carCode) => {
            // 查找对应的车主信息
            const ownerInfo = ownerInfoList.find(item => item.carCode === carCode);
            const carOwner = ownerInfo ? ownerInfo.carOwner : '未知车主';
            
            console.log(`📝 处理车牌号: ${carCode}, 车主: ${carOwner}`);
            
            // 根据车主姓名设置不同的黑名单原因和备注
            let blackListReason, remark1, remark2;
            if (carOwner === '未知车主') {
                blackListReason = '临时车过夜停车';
                remark1 = '夜间时段停车违规，系统自动拉黑';
                remark2 = '夜间时段停车违规，系统自动拉黑';
            } else {
                blackListReason = '月票车过夜停车';
                remark1 = '夜间时段停车违规，系统自动拉黑';
                remark2 = '夜间时段停车违规，系统自动拉黑';
            }
            
            console.log(`🎯 车牌 ${carCode} 设置: 原因=${blackListReason}, 备注=${remark1}`);
            
            // 调用外部接口添加黑名单
            const params = {
                parkCode: parkCodeRes.data[0],
                carCode: carCode,
                carOwner: carOwner,
                reason: blackListReason,
                isPermament: textImportForm.isPermament === '永久' ? '1' : '0',
                timePeriod: textImportForm.isPermament === '永久' ? '' : 
                    (textImportForm.timePeriod && textImportForm.timePeriod.length === 2 ? 
                        `${textImportForm.timePeriod[0]},${textImportForm.timePeriod[1]}` : ''),
                specialCarTypeId: specialCarType.id,
                remark1: remark1,
                remark2: remark2
            };
            
            return request.post("/parking/blackList/addBlackCar", {
                parkName: textImportForm.parkName,
                parkCode: parkCodeRes.data[0],
                carCode: carCode,
                carOwner: carOwner,
                reason: blackListReason,
                isPermament: textImportForm.isPermament,
                timePeriod: textImportForm.isPermament === '永久' ? '' : 
                    (textImportForm.timePeriod && textImportForm.timePeriod.length === 2 ? 
                        `${textImportForm.timePeriod[0]},${textImportForm.timePeriod[1]}` : ''),
                specialCarTypeId: specialCarType.id,
                specialCarTypeName: specialCarType.name,
                remark1: remark1,
                remark2: remark2
            });
        });
        console.log("添加结果：",promises)
        const results = await Promise.allSettled(promises);
        
        // 统计结果
        let successCount = 0;
        let failCount = 0;
        const failedCars = [];
        const successDetails = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.code === '0') {
                successCount++;
                successDetails.push({
                    carCode: carCodes[index],
                    message: result.value.msg || '添加成功'
                });
            } else {
                failCount++;
                failedCars.push(carCodes[index]);
                console.error(`车牌号 ${carCodes[index]} 添加失败:`, result.reason || result.value);
            }
        });
        
        // 显示结果
        if (successCount > 0) {
            ElMessage.success(`成功导入 ${successCount} 个车牌号到黑名单`);
            console.log('✅ 导入成功详情:', successDetails);
            
            // 记录活动日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";
            await activityApi.logBlacklistOperation(
                userId,
                username,
                "文本批量导入",
                `通过文本导入添加了 ${successCount} 个车牌号到黑名单`,
                null,
                JSON.stringify({ 
                    carCodes: carCodes.slice(0, successCount), 
                    parkName: textImportForm.parkName,
                    specialCarType: textImportForm.specialCarTypeConfigName,
                    successDetails: successDetails
                }),
                null
            ).catch(err => {
                console.error("记录活动日志失败:", err);
            });
        }
        
        if (failCount > 0) {
            ElMessage.warning(`导入失败 ${failCount} 个车牌号：${failedCars.join(', ')}`);
            console.log('❌ 导入失败的车牌号:', failedCars);
        }
        
        // 显示详细结果
        if (successCount > 0 || failCount > 0) {
            const resultMessage = `导入完成：成功 ${successCount} 个，失败 ${failCount} 个`;
            ElNotification({
                title: '文本导入结果',
                message: resultMessage,
                type: successCount > 0 ? 'success' : 'warning',
                duration: 5000
            });
        }
        
        // 关闭弹窗并刷新数据
        textImportDialogVisible.value = false;
        getData();
        
    } catch (error) {
        console.error('文本导入失败:', error);
        ElMessage.error('导入失败，请检查输入信息');
    } finally {
        textImportLoading.value = false;
    }
};
//指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
    // console.log(rowIndex)
    if ((rowIndex + 1) % 2 == 0) {
        // console.log(rowIndex)
        return 'odd-row';
    } else if ((rowIndex + 1) % 2 != 0) {
        // console.log(rowIndex)
        return 'even-row';
    }
};
//指定行高
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
    let style = { padding: '8px 3px' }
    return style
};
// const handleProgress = event => {
//     progress.value = event.percent;
// };

const handleSuccess = () => {
    if (uploadPercentage.value !== 100) uploadPercentage.value = 100;
    dialogVisible.value = false;
    ElMessage.success('解析成功')
};

// const handleError = () => {
//     progress.value = 0;
//     // 显示错误消息
//     console.error('上传失败');
// };
//自定义上传请求
const customHttpRequest = async (options) => {
    startTime.value = new Date().getTime();
    const formData = new FormData();
    formData.append("file", options.file); formData.append("文件", options.file);
    const token = Cookies.get("Admin-Token");
    try {
        const response = await request.post(options.action, formData, {
            // 更新进度条的函数
            onUploadProgress: (event) => {
                uploadPercentage.value = Math.floor((event.loaded * 100) / event.total);
                if (uploadPercentage.value === 100) {
                    dialogVisible.value = false;
                    ElNotification({
                        title: '提示',
                        message: '正在处理数据，请稍后...',
                        type: 'warning',
                    })
                }
            },
            // 进度条的值为100的时候关闭弹窗
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `${token}`  // 传入token
            },
        });
        options.onSuccess(response.data, options.file);
        // console.log(response.data.data);
        importData.value = response.data.data;
        console.log(importData.value)
        // 将importData.value中的数据遍历一下，将每个数据按照-进行拆分输出为数组，判断数组的第三个元素是否是"业务成功"，若是的话，将这整条数据存储到importSuccess中，否则存储到importDefeat中
        importData.value.forEach(item => {
            const arr = item.split("--");
            if (arr[arr.length - 1] == "业务成功") {
                // 弹窗提示用户进行填写原因
                importSuccess.value.push(item);
            } else {
                importDefeat.value.push(item);
            }
        })
        // 将导入成功和失败的数据具体通知，哪些车牌导入成功，哪些车牌导入失败，以及失败的原因是什么，采用drawer 
        // 通知成功导入的数据
        if (importSuccess.value.length != 0) {
            ElNotification({
                title: '导入成功',
                message: '导入成功' + importSuccess.value.length + '条数据',
                type: 'success',
                offset: 100
            })
        }
        if (importDefeat.value.length != 0) {
            ElNotification({
                title: '导入失败',
                message: '导入失败' + importDefeat.value.length + '条数据',
                type: 'error',
                offset: 100,
                position: "top-left"
            })
            importNotificationDefeat.value = true
        }
        // 遍历导入失败的数据展示出来
        importDefeat.value.forEach(item => {
            // 将item按照-进行拆分输出为数组，判断数组的第三个元素是否是"业务成功"，若是的话，将这整条数据存储到importSuccess中，否则存储到importDefeat中
            const arr = item.split("--");
            const defeatReason = arr[arr.length - 1];
            // 查询defeatReason中是否包含"已存在",包含的话不显示弹窗让用户填写信息，不包含的话才显示
            const isExist = defeatReason.indexOf("已存在") != -1;
            if (isExist == false) {
                const timeList = arr[2].split("-");
                // 取得最后一位
                if (arr[2] !== '永久') {
                    info.value.tableDataDefeat.push({
                        parkName: arr[1],
                        carCode: arr[0],
                        // 存储到timePeriodListResults数组中分别存储
                        timePeriodListResults: [timeList[0], timeList[1]],
                        isPermament: "自定义",
                        owner: arr[3],
                        specialCarTypeConfigName: arr[4],
                        blackReason: "",
                        remark1: "",
                        remark2: "",
                    })
                } else {
                    info.value.tableDataDefeat.push({
                        parkName: arr[1],
                        carCode: arr[0],
                        timePeriodListResults: [],
                        isPermament: arr[2],
                        owner: arr[3],
                        specialCarTypeConfigName: arr[4],
                        blackReason: "",
                        remark1: "",
                        remark2: "",
                    })
                }
                // 将arr值赋值到info的tableDataDefeat中
                if (arr[1] == '万象上东') {
                    request
                        .get("/parking/yardInfo/yardCode",
                            {
                                params: {
                                    yardName: arr[1]
                                },
                            })
                        .then((res) => {
                            // console.log("arr:" + arr[1])
                            request.get("/parking/blackList/getSpecialCarTypeList",
                                {
                                    params: {
                                        parkCodeList: res.data[0]
                                    },
                                })
                                .then((res) => {
                                    // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                                    specialCarTypeNameWanLists.value = res.data.data.recordList;
                                    // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                                })
                        });
                } else if (arr[1] == '四季上东') {
                    request
                        .get("/parking/yardInfo/yardCode",
                            {
                                params: {
                                    yardName: arr[1]
                                },
                            })
                        .then((res) => {
                            // console.log("arr:" + arr[1])
                            request.get("/parking/blackList/getSpecialCarTypeList",
                                {
                                    params: {
                                        parkCodeList: res.data[0]
                                    },
                                })
                                .then((res) => {
                                    // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                                    specialCarTypeNameFourJiLists.value = res.data.data.recordList;
                                    // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                                })
                        });
                } else if (arr[1] == '欧洲新城') {
                    request
                        .get("/parking/yardInfo/yardCode",
                            {
                                params: {
                                    yardName: arr[1]
                                },
                            })
                        .then((res) => {
                            // console.log("arr:" + arr[1])
                            request.get("/parking/blackList/getSpecialCarTypeList",
                                {
                                    params: {
                                        parkCodeList: res.data[0]
                                    },
                                })
                                .then((res) => {
                                    // 将响应的结果存储到SelectSpecialCarTypeNames对象数组中
                                    specialCarTypeNameOuZhouLists.value = res.data.data.recordList;
                                    // query.specialCarTypeConfigName = specialCarTypeNameList.value[0].name;
                                })
                        });
                }
            }
            importDefeatData.value.push({
                carCode: arr[0],
                defeatReason: defeatReason
            });
        })
        getData();
        // 清空导入的文件内容
        fileList.value = [];
        // dialogVisible.value = false;
    } catch (error) {
        options.onError(error);
    }
};
// 模拟进度条的增加（在文件上传开始之前）
//文件导入
const beforeUpload = (file) => {
    const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const isLt500kb = file.size / 1024 < 500;
    if (!isXlsx) {
        ElMessage({
            message: "上传文件只能是 XLSX 格式!",
            type: "warning"
        });
    }
    if (!isLt500kb) {
        ElMessage({
            message: "上传文件大小不能超过 500KB!",
            type: "warning"
        });
    }
    console.log(isXlsx)
    return isXlsx && isLt500kb;
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
        // 或者包含特定的新能源标识
        return 'traditional';
    }

    return 'traditional';
};
</script>
<style lang="scss" scoped>
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
                color: #e53e3e;
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
            margin-bottom: 4px;

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

        .owner-name {
            font-size: 13px;
            color: #718096;
        }
    }
}

// 备注信息单元格样式
.remark-info-cell {
    font-size: 13px;
    line-height: 1.4;

    .remark-item {
        margin-bottom: 4px;

        .remark-label {
            font-weight: 500;
            color: #4a5568;
        }

        .remark-content {
            color: #718096;
        }
    }

    .no-remark {
        color: #a0aec0;
        font-style: italic;
    }
}

// 原因单元格样式
.reason-cell {
    font-size: 13px;
    color: #4a5568;
    line-height: 1.4;
}

// 操作按钮样式
.action-buttons {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 0;

    .action-btn-view,
    .action-btn-delete {
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

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    }

    .action-btn-view {
        background: linear-gradient(45deg, #909399, #b1b3b8);
        color: white;
        border: none;

        &:hover {
            background: linear-gradient(45deg, #73767a, #9a9ca2);
        }
    }

    .action-btn-delete {
        background: linear-gradient(45deg, #f56565, #fc8181);
        color: white;
        border: none;

        &:hover {
            background: linear-gradient(45deg, #e53e3e, #f56565);
        }
    }
}

// 行内操作按钮样式
.action-buttons-inline {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    padding: 0;

    .action-btn-view,
    .action-btn-delete {
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

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    }

    .action-btn-view {
        background: linear-gradient(45deg, #909399, #b1b3b8);
        color: white;
        border: none;

        &:hover {
            background: linear-gradient(45deg, #73767a, #9a9ca2);
        }
    }

    .action-btn-delete {
        background: linear-gradient(45deg, #f56565, #fc8181);
        color: white;
        border: none;

        &:hover {
            background: linear-gradient(45deg, #e53e3e, #f56565);
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

/* 响应式布局 */
@media (max-width: 1500px) {
    .container {
        padding: 0 20px;
    }
}

@media (max-width: 1200px) {
    .container {
        padding: 0 16px;
    }

    .page-header {
        padding: 24px 32px;
        margin: -24px -16px 24px -16px;

        .page-title {
            justify-content: center;

            .title-text h1 {
                font-size: 24px;
            }
        }
    }

    .search-panel .search-panel-body {
        padding: 12px;

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

    .table-panel .table-panel-body {
        padding: 16px;
    }
}

@media (max-width: 768px) {
    .page-container {
        padding: 16px;
    }

    .container {
        padding: 0 12px;
    }

    .page-header {
        padding: 20px 24px;
        margin: -16px -12px 20px -12px;

        .page-title {
            .title-icon {
                font-size: 24px;
                padding: 8px;
            }

            .title-text h1 {
                font-size: 20px;
            }
        }
    }

    .search-panel .search-panel-body {
        padding: 10px;
    }

    .table-panel .table-panel-body {
        padding: 0;
    }

    // 移动端操作按钮优化
    .action-buttons {
        gap: 4px;

        .action-btn-edit,
        .action-btn-delete {
            padding: 4px 6px;
            font-size: 11px;
            min-width: 45px;
            height: 26px;
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

.divDrawer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 58vh;
}

/* 按钮行样式 */
.button-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.button-row .el-button {
    font-size: 14px;
}

/* 按钮组样式 */
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-left: 20px;
    align-items: center;
}

.button-group .el-button {
    font-size: 14px;
}

/* 表单样式优化 */
.demo-form-inline {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
}

.handle-box {
    margin-bottom: 20px;
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

// 文本导入弹窗样式
.text-import-dialog {
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
            max-height: 80vh;
            overflow-y: auto;
        }
    }

    .full-width {
        width: 100%;
    }

    .input-tip {
        margin-top: 8px;
        padding: 8px 12px;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        font-size: 12px;
        color: #0369a1;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #374151;
    }

    :deep(.el-textarea__inner) {
        border-radius: 8px;
        border: 1px solid #d1d5db;
        transition: all 0.3s ease;

        &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
    }

    :deep(.el-select) {
        .el-input__inner {
            border-radius: 8px;
            border: 1px solid #d1d5db;
            transition: all 0.3s ease;

            &:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
        }
    }

    :deep(.el-input__inner) {
        border-radius: 8px;
        border: 1px solid #d1d5db;
        transition: all 0.3s ease;

        &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
    }
}

// 文本导入对话框样式
.text-import-dialog {
    .el-dialog__body {
        padding: 20px 24px;
    }
    
    .full-width {
        width: 100%;
    }
    
    .input-tip {
        margin-top: 8px;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #667eea;
    }
    
    .el-form-item {
        margin-bottom: 20px;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
    
    .el-textarea__inner {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.5;
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
</style>