<template>
    <div class="month-ticket-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <el-icon class="header-icon">
                            <Ticket />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>月票管理</h1>
                        <p class="title-desc">管理月票信息、状态和有效期</p>
                    </div>
                </div>
                <div class="page-actions">
                    <el-button type="info" icon="Refresh" @click="handleSyc" class="action-btn">
                        同步数据
                    </el-button>
                    <el-button type="primary" icon="Plus" @click="handleAdd" class="action-btn">
                        新增月票
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
                                <!-- 基础搜索条件 -->
                                <el-form-item label="车场名称" class="search-item">
                                    <el-select v-model="query.parkName" placeholder="请选择车场" clearable 
                                               @change="changeParkName" class="search-select">
                                        <el-option label="万象上东" value="万象上东" />
                                        <el-option label="四季上东" value="四季上东" />
                                        <el-option label="欧洲新城" value="欧洲新城" />
                                    </el-select>
                                </el-form-item>
                                
                                <el-form-item label="月票状态" class="search-item">
                                    <el-select v-model="query.isValid" placeholder="请选择月票状态" clearable 
                                               @clear="clearValid" class="search-select">
                                        <el-option label="生效中" value="1" />
                                        <el-option label="已过期" value="4" />
                                    </el-select>
                                </el-form-item>
                                
                                <el-form-item label="冻结状态" class="search-item">
                                    <el-select v-model="query.isFrozen" placeholder="请选择冻结状态" clearable 
                                               @clear="clearFrozen" class="search-select">
                                        <el-option label="未冻结" value="0" />
                                        <el-option label="已冻结" value="2" />
                                    </el-select>
                                </el-form-item>
                                
                                <el-form-item label="月票名称" class="search-item">
                                    <el-select v-model="query.ticketName" placeholder="请选择月票名称" clearable 
                                               @clear="clearTicketName" class="search-select">
                                        <el-option v-for="item in monthTicketTypeList" :key="item.ticketName" 
                                                   :label="item.ticketName" :value="item.ticketName" />
                                    </el-select>
                                </el-form-item>

                                <div class="search-actions">
                                    <el-button type="warning" icon="Refresh" @click="handleOnset" size="small" class="reset-btn">
                                        重置
                                    </el-button>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small" class="search-btn">
                                        搜索
                                    </el-button>
                                </div>
                            </div>

                            <!-- 展开的搜索条件 -->
                            <div v-if="isFormVisible" class="expanded-search-row">
                                <div class="search-row-grid">
                                    <el-form-item label="车牌号码" class="search-item">
                                        <el-input v-model="query.carNo" placeholder="请输入车牌号码" clearable 
                                                  @clear="clearCarNo" class="search-input" />
                                    </el-form-item>
                                    
                                    <el-form-item label="车主姓名" class="search-item">
                                        <el-input v-model="query.userName" placeholder="请输入车主姓名" clearable 
                                                  @clear="clearUserName" class="search-input" />
                                    </el-form-item>
                                    
                                    <el-form-item label="车主电话" class="search-item">
                                        <el-input v-model="query.userPhone" placeholder="请输入车主电话" clearable 
                                                  @clear="clearUserPhone" @input="handleInputPhone" class="search-input" />
                                    </el-form-item>

                                    <el-form-item label="到期日期" class="search-item">
                                        <el-date-picker v-model="value2" type="date" placeholder="请选择日期"
                                                        :shortcuts="shortcuts" class="search-select" />
                                    </el-form-item>

                                    <el-form-item label="有效期" class="search-item">
                                        <el-input v-model="query.timeDays" placeholder="天数" clearable 
                                                  @input="handleInput" @clear="clearTimeDays" class="search-input">
                                            <template #append>天后到期</template>
                                        </el-input>
                                    </el-form-item>
                                    
                                    <el-form-item label="备注1" class="search-item">
                                        <el-input v-model="query.remark1" placeholder="请输入备注1" clearable 
                                                  @clear="clearRemark1" class="search-input" />
                                    </el-form-item>
                                    
                                    <el-form-item label="备注2" class="search-item">
                                        <el-input v-model="query.remark2" placeholder="请输入备注2" clearable 
                                                  @clear="clearRemark2" class="search-input" />
                                    </el-form-item>
                                    
                                    <el-form-item label="备注3" class="search-item">
                                        <el-input v-model="query.remark3" placeholder="请输入备注3" clearable 
                                                  @clear="clearRemark3" class="search-input" />
                                    </el-form-item>
                                </div>
                            </div>
                            
                            <div class="toggle-section">
                                <el-button type="text" @click="toggleForm" class="toggle-btn">
                                    {{ isFormVisible ? '收起高级搜索' : '展开高级搜索' }}
                                    <el-icon :class="['toggle-icon', { 'expanded': isFormVisible }]">
                                        <ArrowDown />
                                    </el-icon>
                                </el-button>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>
            <!-- 月票列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <Ticket />
                        </el-icon>
                        <span>月票列表</span>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="TableRef" 
                              :cell-style="cellStyle" :row-class-name="tableRowClassName" 
                              @selection-change="selectChanged" style="width: 100%" 
                              :height="heightData" @scroll="scrollBehavior" stripe>
                        
                        <!-- 月票信息列 -->
                        <el-table-column label="月票信息" width="220" fixed="left">
                            <template #default="{ row }">
                                <div class="ticket-info-cell">
                                    <div class="ticket-avatar">
                                        <el-icon>
                                            <Ticket />
                                        </el-icon>
                                    </div>
                                    <div class="ticket-details">
                                        <div class="ticket-name">{{ row.ticketName }}</div>
                                        <div class="car-number">{{ row.carNo }}</div>
                                        <div class="park-name">{{ row.parkName }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车主信息列 -->
                        <el-table-column label="车主信息" width="180">
                            <template #default="{ row }">
                                <div class="owner-info-cell">
                                    <div class="owner-avatar">
                                        {{ row.userName?.charAt(0) }}
                                    </div>
                                    <div class="owner-details">
                                        <div class="owner-name">{{ row.userName }}</div>
                                        <div class="owner-phone">{{ row.userPhone }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 有效期列 -->
                        <el-table-column label="有效期" width="280">
                            <template #default="{ row }">
                                <div class="validity-info-cell">
                                    <div class="validity-periods">
                                        <div v-if="formatTimePeriods(row.timePeriodList).length > 0">
                                            <div v-for="(period, index) in formatTimePeriods(row.timePeriodList)" 
                                                 :key="index" 
                                                 :class="['validity-period-item', { 
                                                     'expired': period.isExpired,
                                                     'active': period.isActive 
                                                 }]">
                                                <div class="period-date">{{ period.text }}</div>
                                                <div v-if="period.isExpired" class="period-status expired-tag">已过期</div>
                                                <div v-else-if="period.isActive" class="period-status active-tag">生效中</div>
                                                <div v-else class="period-status future-tag">未生效</div>
                                            </div>
                                        </div>
                                        <div v-else class="no-valid-period">
                                            暂无有效期
                                        </div>
                                    </div>
                                    <el-tag :type="getValidityTagType(row.validStatus, row.timePeriodList)" size="small" class="status-tag">
                                        {{ getValidityText(row.validStatus, row.timePeriodList) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 备注信息列 -->
                        <el-table-column label="备注信息" min-width="250">
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
                                    <div v-if="row.remark3" class="remark-item">
                                        <span class="remark-label">备注3：</span>
                                        <span class="remark-content">{{ row.remark3 }}</span>
                                    </div>
                                    <div v-if="!row.remark1 && !row.remark2 && !row.remark3" class="no-remark">
                                        暂无备注
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 冻结状态列 -->
                        <el-table-column label="冻结状态" width="100" align="center" fixed="right">
                            <template #default="{ row }">
                                <el-tag :type="getFrozenTagType(row.isFrozen)" size="small">
                                    {{ getFrozenText(row.isFrozen) }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="240" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="action-buttons">
                                    <el-button type="primary" size="small" icon="View" @click="handleEdit(row)" 
                                               class="action-btn-view">
                                        详情
                                    </el-button>
                                    <el-button type="danger" size="small" icon="Plus" @click="handleAddBlack(row)" 
                                               class="action-btn-blacklist">
                                        加黑名单
                                    </el-button>
                                    <el-dropdown @command="handleDropdownAction($event, row)" 
                                                 trigger="click" class="action-dropdown">
                                        <el-button type="info" size="small" icon="MoreFilled" class="action-btn-more">
                                            更多
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item command="freeze" icon="Lock">
                                                    {{ row.isFrozen === 2 ? '解冻' : '冻结' }}
                                                </el-dropdown-item>
                                                <el-dropdown-item command="renew" icon="Refresh">
                                                    续期
                                                </el-dropdown-item>
                                                <el-dropdown-item divided command="delete" icon="Delete">
                                                    删除
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
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
        <!-- 弹窗展示月票车辆信息 -->
        <el-dialog title="车辆月票信息" v-model="dialogVisibleUpdate" width="60%">
            <el-descriptions class="margin-top" :column="4" border direction="vertical" :v-model="descriptionData.data">
                <el-descriptions-item>
                    <template #label>
                        <div class="parkName">
                            <i><img src="..//../icons/svg/ParkName.svg"></i>&nbsp;
                            车场名称
                        </div>
                    </template>
                    {{ descriptionData.data.parkName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="ownerName">
                            <i><img src="..//../icons/svg/UserOwner.svg"></i>&nbsp;
                            车主姓名
                        </div>
                    </template>
                    {{ descriptionData.data.userName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <i><img src="..//../icons/svg/UserPhone.svg"></i>&nbsp;
                            车主电话
                        </div>
                    </template>
                    <el-tag size="large" type="warning">{{ descriptionData.data.userPhone }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="ticketName">
                            <i><img src="..//../icons/svg/TicketName.svg"></i>&nbsp;
                            月票名称
                        </div>
                    </template>
                    {{ descriptionData.data.ticketName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>
                            <i><img src="..//../icons/svg/ValidStatus.svg"></i>&nbsp;
                            月票状态
                        </div>
                    </template>
                    <div class="containerX">
                        <el-tag type="success" v-if="descriptionData.data.isValid === 1" effect="dark" size="large"
                            :round="true">生效中</el-tag>
                        <el-tag type="info" v-if="descriptionData.data.isValid === 4" effect="dark" round
                            size="large">已过期</el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>
                            <i><img src="..//../icons/svg/IsFrozen.svg"></i>&nbsp;
                            冻结状态
                        </div>
                    </template>
                    <div class="containerX">
                        <!-- 根据车牌的长度匹配css样式，长度若是7的话选用containerTag，若是8的话选用containerEnergy -->
                        <el-tag type="primary" v-if="descriptionData.data.isFrozen === 0" effect="light" size="dark"
                            round>未冻结</el-tag>
                        <el-tag type="warning" v-else-if="descriptionData.data.isFrozen === 2" effect="dark" round
                            size="large">已冻结</el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <i><img src="..//../icons/svg/Remark1.svg"></i>&nbsp;
                            备注1
                        </div>
                    </template>
                    {{ descriptionData.data.remark1 }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <i><img src="..//../icons/svg/Remark2.svg"></i>&nbsp;
                            备注2
                        </div>
                    </template>
                    {{ descriptionData.data.remark2 }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <i><img src="..//../icons/svg/Remark3.svg"></i>&nbsp;
                            备注3
                        </div>
                    </template>
                    {{ descriptionData.data.remark3 }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <i><img src="..//../icons/svg/TimePeriodList.svg"></i>&nbsp;
                            月票有效期
                        </div>
                    </template>
                    <div class="containerdex">
                        <el-tag size="large" type="success" effect="dark" class="containerTagTime"
                            v-for="(time, index) in timePeriodListResult" :key="index" :class="getTagClassTime(time)">
                            {{ time }}</el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>
                            <i><img src="..//../icons/svg/CarNo.svg"></i>&nbsp;
                            开通车牌
                        </div>
                    </template>
                    <div class="containerX">
                        <!-- 根据车牌的长度匹配css样式，长度若是7的话选用containerTag，若是8的话选用containerEnergy -->
                        <el-tag size="large" type="success" effect="dark" class="containerTag"
                            v-for="(plate, index) in carNoList" :key="index" :class="getTagClass(plate)">
                            {{ plate }}</el-tag>
                    </div>
                </el-descriptions-item>
            </el-descriptions>
        </el-dialog>
        <!-- 添加黑名单信息 -->
        <el-dialog title="添加黑名单车辆信息" v-model="dialogVisibleBlack" width="40%">
            <el-form :model="blackData.data" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="车场名称" prop="parkName">
                    <el-input :style="{ width: 150 + 'px' }" v-model="blackData.data.parkName" disabled></el-input>
                </el-form-item>
                <el-form-item label="黑名单名称" prop="name">
                    <!-- 下拉框选项：1、永久；2、自定义，显示自定义的时候才显示下变得日期时间组件，默认不显示 -->
                    <el-select v-model="blackData.data.specialCarTypeName" placeholder="请选择黑名单名称">
                        <el-option v-for="item in specialCarTypeNameList" :key="item.name" :label="item.name"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车牌号码" prop="carNo">
                    <div class="form-container">
                        <!-- 根据carNoList的数量进行创建输入框并将carNoList中的每个元素添加到创建的输入框中 -->
                        <el-input v-for="(plate, index) in carNoList" :key="index" style="width: 25%;"
                            v-model="carNoList[index]" disabled> </el-input>
                        <i><img src="..//../icons/svg/AddCarNo.svg" @click="addInput" style="margin-left: 15px"></i>
                        <i><img src="..//../icons/svg/DeletedCarNo.svg" @click="removeInput(index)"></i>
                        <div v-for="(input, index) in inputs" :key="index" class="input-container">
                            <el-input v-model="inputs[index]" style="margin-top: 5px; margin-right: -15px"
                                placeholder="请输入车牌"></el-input>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="车主姓名" prop="userName">
                    <el-input v-model="blackData.data.userName" style="width: 40%" placeholder="请输入车主姓名" />
                </el-form-item>
                <el-form-item label="黑名单原因" prop="blackReason">
                    <el-input placeholder="请输入黑名单原因" type="textarea" v-model="blackData.data.blackReason"
                        style="width: 70%" />
                </el-form-item>
                <el-form-item label="黑名单生效期">
                    <!-- 下拉框选项：1、永久；2、自定义，显示自定义的时候才显示下变得日期时间组件，默认不显示 -->
                    <el-select v-model="blackData.data.isPermament" placeholder="请选择生效期">
                        <el-option v-for="(item) in isPermamentList" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="blackData.data.isPermament == '自定义'" style="margin-top: 20px">
                    <el-date-picker v-model="timePeriodListResults" type="datetimerange" :shortcuts="shortcuts"
                        range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
                </el-form-item>
                <el-form-item label="备注" prop="blackRemark">
                    <!-- 默认 -->
                    <el-button class="button-remark" @click="changeIcon"
                        :icon="isRemark ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></el-button>
                </el-form-item>
                <div v-if="isRemark">
                    <el-form-item label="备注1" prop="blackRemark1">
                        <el-input placeholder="请输入备注1" type="textarea" v-model="blackData.data.remark1"
                            style="width: 70%" />
                    </el-form-item>
                    <el-form-item label="备注2" prop="blackRemark2">
                        <el-input placeholder="请输入备注2" type="textarea" v-model="blackData.data.remark2"
                            style="width: 70%" />
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisibleBlack = false">取 消</el-button>
                    <el-button type="primary" @click="update">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 添加抽屉面板 -->
        <el-drawer ref="drawerRef" title="黑名单添加失败数据" size="550px" direction="rtl" v-model="importNotificationDefeat"
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
import { reactive, ref, onMounted, onUnmounted, nextTick } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from "element-plus";
import { useStore } from "vuex";
import { Ticket, Search, ArrowDown, View, Plus, Lock, Refresh, Delete, MoreFilled } from '@element-plus/icons-vue';
import { activityApi } from "@/api/activity";
const root = "/parking/monthTicket/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
    { label: "月票名称", prop: "ticketName" },
    // { label: "车主姓名", prop: "userName" },
    // { label: "车主电话", prop: "userPhone" },
    { label: "开通车牌", prop: "carNo" },
    { label: "有效期", prop: "timePeriodList" },
    { label: "备注1", prop: "remark1" },
    { label: "备注2", prop: "remark2" },
    { label: "备注3", prop: "remark3" },
    // { label: "月票状态", prop: "" },
    // { label: "冻结状态", prop: "" }
];
const importData = ref([]);
// 导入成功 提醒
const importSuccess = ref([]);
const importProps = [
    { label: "车牌号码", prop: "carCode" },
    { label: "导入失败原因", prop: "defeatReason" }
];
// 导入失败 提醒
const importDefeat = ref([]);
const importDefeatData = ref([]);
const formRef = ref(null);
const rules = {
    userName: [
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
    isPermament: [
        {
            required: true,
            message: "请选择黑名单有效期",
            trigger: "change",
        },
    ]
};
const activeNames = ref([]); // 默认展开的折叠面板
const applicantUserId = ref("");
const IconName = ref("el-icon-arrow-down");
// 调用后端接口获取月票类型数据
const monthTicketTypeList = ref([])
const isRemark = ref(false)

const importNotificationDefeat = ref(false);
const inputs = ref([]);
// 添加输入框的方法
const addInput = () => {
    inputs.value.push(''); // 向数组中添加一个新的空字符串
};
// 删除输入框的方法
const removeInput = (index) => {
    // 如何将全部元素移除，且数据也清空
    inputs.value.splice(index, 1); // 从数组中移除指定索引的元素
};
const handleClose = (done) => {
    ElMessageBox.confirm(
        '您是否需要关闭窗口?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            // 清空存储的数据
            importData.value = [];
            importSuccess.value = [];
            importDefeatData.value = [];
            importDefeat.value = [];
            importNotificationDefeat.value = false;
            getData()
            ElMessage({
                type: 'success',
                message: '关闭成功',
            })
        })
        .catch(() => {
            getData()
        })
};
const handleSyc = () => {
    // 同步数据操作
    console.log(query.parkName)
    const loadingTime = 0;
    // dialogVisible.value = false
    // 使用setTimeout模拟异步请求
    // 添加提示框选择更新哪种数据
    ElMessageBox.confirm('请选择更新哪种数据', '提示', {
        confirmButtonText: '生效中的数据',
        cancelButtonText: '已过期的数据',
        type: 'warning',
    }).then(() => {
        setTimeout(() => {
            const loading = ElLoading.service({
                lock: true,
                text: '正在更新数据，请稍后.....',
                background: 'rgba(255, 255, 255, 0.7)',
            })
            request
                .get("parking/monthTicket/AKEPage", {
                    params: {
                        parkName: query.parkName,
                        validStatus: "1",
                    },
                })
                .then((res) => {
                    loading.close()
                    console.log('📄 响应数据: ', res)
                    
                    // 检查响应结构：res.data.data 是实际的同步结果对象
                    const syncResult = res.data.data;
                    
                    if (syncResult && syncResult.success) {
                        ElMessage.success(`同步成功！新增 ${syncResult.addedCount || 0} 条，修改 ${syncResult.modifiedCount || 0} 条，删除 ${syncResult.deletedCount || 0} 条`);
                        getData()
                    } else {
                        const errorMsg = syncResult?.message || '同步失败，请稍后重试';
                        ElMessage.error(errorMsg);
                    }
                })
                .catch((error) => {
                    loading.close()
                    console.error('同步失败:', error)
                    ElMessage.error('同步失败：' + (error.message || '网络错误'))
                });
        }, loadingTime);
    }).catch(() => {
        setTimeout(() => {
            const loading = ElLoading.service({
                lock: true,
                text: '正在更新数据，请稍后.....',
                background: 'rgba(255, 255, 255, 0.7)',
            })
            request
                .get("parking/monthTicket/AKEPage", {
                    params: {
                        parkName: query.parkName,
                        validStatus: "4",
                    },
                })
                .then((res) => {
                    loading.close()
                    console.log('📄 响应数据: ', res)
                    
                    // 检查响应结构：res.data.data 是实际的同步结果对象
                    const syncResult = res.data.data;
                    
                    if (syncResult && syncResult.success) {
                        ElMessage.success(`同步成功！新增 ${syncResult.addedCount || 0} 条，修改 ${syncResult.modifiedCount || 0} 条，删除 ${syncResult.deletedCount || 0} 条`);
                        getData()
                    } else {
                        const errorMsg = syncResult?.message || '同步失败，请稍后重试';
                        ElMessage.error(errorMsg);
                    }
                })
                .catch((error) => {
                    loading.close()
                    console.error('同步失败:', error)
                    ElMessage.error('同步失败：' + (error.message || '网络错误'))
                });
        }, loadingTime);
    })



};
const timePeriodListResult = ref([])
const timePeriodListResults = ref([])
const specialCarTypeNameList = ref([]);
// const heightTable = ref(350)
// const tableMarginTop = ref(0)
const dialogVisibleUpdate = ref(false)
const dialogVisibleBlack = ref(false)
const isPermamentList = ref(['永久', '自定义'])
const TableRef = ref(null)
const heightData = ref(350)
// 窗口高度响应式变量
const windowHeight = ref(window.innerHeight)

// 计算表格高度
const calculateTableHeight = () => {
    // 减去头部、搜索表单、分页等元素占用的高度
    const headerHeight = 60 // 面包屑导航高度
    const formHeight = isFormVisible.value ? 180 : 90 // 表单高度（展开/收起状态）
    const paginationHeight = 60 // 分页组件高度
    const marginPadding = 40 // 间距和内边距
    
    const calculatedHeight = windowHeight.value - headerHeight - formHeight - paginationHeight - marginPadding
    heightData.value = Math.max(calculatedHeight, 300) // 最小高度300px
}

// 监听窗口大小变化
const handleResize = () => {
    windowHeight.value = window.innerHeight
    nextTick(() => {
        calculateTableHeight()
    })
}

// 调用后端接口更新月票数据库数据
// 创建新的备注信息
const changeParkName = () => {
    query.pageNum = 1;
    getData();
}
applicantUserId.value = localStorage.getItem("userId")
// 月票有效期输入限制
const handleInput = (value) => {
    const regex = /^[0-9]*$/;
    if (regex.test(value)) {
        query.timeDays = value;
        console.log(value)
    } else {
        // 输入不合法时，清除该输入框内容
        query.timeDays = "";
        // 同时提醒用户输入数字
        ElMessage.error("请输入数字类型");
        return;
    }
};
const isFormVisible = ref(false);
const searchPanelExpanded = ref(true); // 搜索面板默认展开

// 切换搜索面板展开状态
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 格式化有效期时间段 - 智能显示逻辑
const formatTimePeriods = (timePeriodList) => {
    if (!timePeriodList) return [];
    const periods = timePeriodList.split(',').map(period => period.trim());
    const today = new Date();
    
    // 处理所有时间段并标记状态
    const allPeriods = periods.filter(period => period).map(period => {
        try {
            const parts = period.split('至');
            if (parts.length !== 2) return null;
            
            const startDateStr = parts[0].trim();
            const endDateStr = parts[1].trim();
            
            // 处理包含时间的日期格式
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            
            // 检查日期是否有效
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return null;
            }
            
            const isExpired = today > endDate;
            const isActive = today >= startDate && today <= endDate;
            
            return {
                text: period,
                isExpired,
                isActive,
                endDate, // 用于排序
                startDate // 用于排序
            };
        } catch (error) {
            return null;
        }
    }).filter(item => item !== null);
    
    // 检查是否有生效中的时间段
    const activePeriods = allPeriods.filter(item => item.isActive);
    
    if (activePeriods.length > 0) {
        // 如果有生效中的时间段，只显示生效中的
        return activePeriods;
    } else {
        // 如果没有生效中的时间段，显示最晚过期的那一条
        const expiredPeriods = allPeriods.filter(item => item.isExpired);
        if (expiredPeriods.length > 0) {
            // 按结束时间排序，取最晚的一条
            const latestExpired = expiredPeriods.sort((a, b) => b.endDate - a.endDate)[0];
            return [latestExpired];
        }
        
        // 如果都是未生效的，显示最早开始的那一条
        const futurePeriods = allPeriods.filter(item => !item.isExpired && !item.isActive);
        if (futurePeriods.length > 0) {
            const earliestFuture = futurePeriods.sort((a, b) => a.startDate - b.startDate)[0];
            return [earliestFuture];
        }
    }
    
    return allPeriods;
};


// 检查是否有有效的时间段 - 基于原始数据判断
const hasValidPeriods = (timePeriodList) => {
    if (!timePeriodList) return false;
    const periods = timePeriodList.split(',').map(period => period.trim());
    const now = new Date();
    
    return periods.some(period => {
        try {
            const parts = period.split('至');
            if (parts.length !== 2) return false;
            
            const startDateStr = parts[0].trim();
            const endDateStr = parts[1].trim();
            
            // 处理包含时间的日期格式 "2024-01-01 00:00:00"
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            
            // 检查日期是否有效
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return false;
            }
            
            // 检查是否在有效期内
            return now >= startDate && now <= endDate;
        } catch (error) {
            console.log('日期解析错误:', error, period);
            return false;
        }
    });
};

// 获取有效期标签类型
const getValidityTagType = (validStatus, timePeriodList) => {
    // 如果没有有效的时间段，显示为已过期
    if (!hasValidPeriods(timePeriodList)) {
        return 'info';
    }
    switch(validStatus) {
        case 1: return 'success';
        case 4: return 'info';
        default: return 'warning';
    }
};

// 获取有效期文本
const getValidityText = (validStatus, timePeriodList) => {
    // 如果没有有效的时间段，显示为已过期
    if (!hasValidPeriods(timePeriodList)) {
        return '已过期';
    }
    switch(validStatus) {
        case 1: return '生效中';
        case 4: return '已过期';
        default: return '未知';
    }
};

// 获取冻结状态标签类型
const getFrozenTagType = (isFrozen) => {
    return isFrozen === 2 ? 'warning' : 'success';
};

// 获取冻结状态文本
const getFrozenText = (isFrozen) => {
    return isFrozen === 2 ? '已冻结' : '未冻结';
};

// 处理下拉菜单操作
const handleDropdownAction = (command, row) => {
    switch(command) {
        case 'freeze':
            handleFreeze(row);
            break;
        case 'renew':
            handleRenew(row);
            break;
        case 'delete':
            handleDelete(row);
            break;
    }
};

// 冻结/解冻操作
const handleFreeze = (row) => {
    const action = row.isFrozen === 2 ? '解冻' : '冻结';
    ElMessageBox.confirm(`确定要${action}该月票吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 调用冻结/解冻API
        ElMessage.success(`${action}成功`);
        getData(); // 刷新数据
    }).catch(() => {
        ElMessage.info('操作取消');
    });
};

// 续期操作
const handleRenew = (row) => {
    ElMessage.info('续期功能开发中');
};

// 删除操作
const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该月票吗？此操作不可恢复！', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 调用删除API
        ElMessage.success('删除成功');
        getData(); // 刷新数据
    }).catch(() => {
        ElMessage.info('删除取消');
    });
};

// 新增月票
const handleAdd = () => {
    ElMessage.info('新增月票功能开发中');
};
// 打开折叠板
const toggleForm = () => {
    isFormVisible.value = !isFormVisible.value;
    nextTick(() => {
        calculateTableHeight() // 使用动态计算函数
    })
};
const handleInputPhone = (value) => {
    const regex = /^[0-9]*$/;
    if (regex.test(value)) {
        query.userPhone = value;
        console.log(value)
    } else {
        // 输入不合法时，清除该输入框内容
        query.userPhone = "";
        // 同时提醒用户输入数字
        ElMessage.error("请输入数字类型");
        return;
    }
};
const query = reactive({
    isFrozen: "",
    isValid: "",
    parkName: "万象上东",
    ticketName: "",
    userName: "",
    userPhone: "",
    carNo: "",
    timePeriodList: "",
    remark1: "",
    remark2: "",
    remark3: "",
    timeDays: "", //还有多少天到期
    pageNum: 1,
    pageSize: 10,
});
const descriptionData = reactive({
    data: {
        isFrozen: -1,
        isValid: -1,
        parkName: "",
        ticketName: "",
        userName: "",
        userPhone: "",
        carNo: "",
        timePeriodList: "",
        remark1: "",
        remark2: "",
        remark3: "",
    }
});
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
const blackNameList = reactive({
    id: "",
    name: ""
});
const carNoList = ref([]);
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
const clearTicketName = () => {
    query.ticketName = '';
    getData();
}
const clearCarNo = () => {
    query.carNo = '';
    getData();
};
const clearUserName = () => {
    query.userName = '';
    getData();
}; const clearUserPhone = () => {
    query.userPhone = '';
    getData();
};
const clearTimeDays = () => {
    query.timeDays = ''
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
const clearRemark3 = () => {
    query.remark3 = ''
    getData();
};
const clearValid = () => {
    query.isValid = ''
    getData();
};
const clearFrozen = () => {
    query.isFrozen = ''
    getData();
};
request
    .get("/parking/yardInfo/yardCode",
        {
            params: {
                yardName: query.parkName
            },
        })
    .then((res) => {
        request.get("/parking/monthTicket/getMonthTicketConfigDetailList",
            {
                params: {
                    parkCodeList: res.data[0]
                },
            })
            .then((res) => {
                monthTicketTypeList.value = res.data.data.recordList;
            })
    });
const changeIcon = () => {
    isRemark.value = !isRemark.value;
    if (isRemark.value == false) {
        IconName.value = "el-icon-arrow-up";
    } else {
        IconName.value = "el-icon-arrow-up";
    }
    console.log(isRemark.value)
}
// 弹窗提示用户
const handleEdit = (row) => {
    dialogVisibleUpdate.value = true
    descriptionData.data.id = row.id
    // 将row中的carNo按照"，"进行拆分成数组存储到carNoList中
    carNoList.value = row.carNo.split(",")
    console.log(row.userName)
    // 将row中的timePeriodList数据到descriptionData.data中
    timePeriodListResult.value = row.timePeriodList.split(",");
    descriptionData.data.parkName = row.parkName
    descriptionData.data.ticketName = row.ticketName
    descriptionData.data.userName = row.userName
    descriptionData.data.userPhone = row.userPhone
    descriptionData.data.remark1 = row.remark1
    descriptionData.data.remark2 = row.remark2
    descriptionData.data.remark3 = row.remark3
    descriptionData.data.carNo = row.carNo
    descriptionData.data.isFrozen = row.isFrozen
    // 根据时间段重新计算月票状态
    descriptionData.data.isValid = hasValidPeriods(row.timePeriodList) ? 1 : 4
};
const handleAddBlack = (row) => {
    dialogVisibleBlack.value = true
    blackData.data.id = row.id
    // 将inputs的值赋值给carNoList
    console.log(row.userName)
    // 将row中的carNo按照"，"进行拆分成数组存储到carNoList中
    carNoList.value = row.carNo.split(",")
    blackData.data.parkName = row.parkName
    blackData.data.userName = row.userName
    blackData.data.isPermament = isPermamentList.value[0]
    console.log(isPermamentList.value)
    // 调用后端接口
    request
        .get("/parking/yardInfo/yardCode",
            {
                params: {
                    yardName: row.parkName
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
                    blackData.data.specialCarTypeName = specialCarTypeNameList.value[0].name
                    blackNameList.value = res.data.data.recordList;
                })
        });
};
const tableData = ref([]);
const pageTotal = ref(0);
const scrollCount = ref(0);
const value2 = ref("");
//指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
    if ((rowIndex + 1) % 2 == 0) {
        return 'odd-row';
    } else if ((rowIndex + 1) % 2 != 0) {
        return 'even-row';
    }
};
//指定行高
// 获取表格数据
const getData = () => {
    if (value2.value != "") {
        const startDate = value2.value
        const newStartDate = new Date(startDate);
        const formattedStartDate = newStartDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        // 将上述格式化后的开始时间和结束时间用"-"连接起来，作为查询条件
        query.timePeriodList = formattedStartDate
    } else {
        query.timePeriodList = "";
    }
    // query的timePeriodList和timeDays不能同时赋值，若同时赋值的话提示用户"这两项不可同时进行查询"，接着调用重置按钮进行重置操作
    if (query.timePeriodList && query.timeDays) {
        ElMessage.error("到期日期 和 距离天数 不可同时进行查询")
        handleOnset()
    }
    request
        .get(root + "page", {
            params: query,
        })
        .then((res) => {
            // 重新计算每行的月票状态
            let records = res.data.records.map(row => ({
                ...row,
                validStatus: hasValidPeriods(row.timePeriodList) ? 1 : 4
            }));
            
            // 如果有月票状态筛选条件，需要在前端进行二次筛选
            if (query.isValid !== '' && query.isValid !== undefined && query.isValid !== null) {
                const targetStatus = parseInt(query.isValid);
                records = records.filter(row => row.validStatus === targetStatus);
            }
            
            tableData.value = records;
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
        if (query.userName) searchConditions.push(`用户姓名: ${query.userName}`);
        if (query.userPhone) searchConditions.push(`用户电话: ${query.userPhone}`);
        if (query.ticketName) searchConditions.push(`月票名称: ${query.ticketName}`);
        if (query.carNo) searchConditions.push(`车牌号: ${query.carNo}`);
        if (query.isFrozen !== '') searchConditions.push(`冻结状态: ${query.isFrozen === '1' ? '已冻结' : '未冻结'}`);
        if (query.isValid !== '') searchConditions.push(`有效状态: ${query.isValid === '1' ? '有效' : '无效'}`);
        
        const searchDescription = searchConditions.length > 0 
            ? `查询月票信息 (${searchConditions.join(', ')})` 
            : '查询所有月票信息';
        
        await activityApi.logMonthTicketOperation(
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
const handleOnset = () => {
    value2.value = "";
    query.userName = "",
        query.userPhone = "",
        query.ticketName = "",
        query.carNo = "",
        query.timePeriodList = "",
        query.remark1 = "",
        query.remark2 = "",
        query.remark3 = "",
        query.isFrozen = "",
        query.isValid = "",
        query.timeDays = "" //还有多少天到期
    getData();
};
// 分页大小
const handleSizeChange = (val) => {
    query.pageSize = val;
    getData();
};
// 改变颜色
const getTagClass = (plate) => {
    if (plate.length === 7) {
        return 'containerTag';
    } else if (plate.length === 8) {
        return 'containerEnergy';
    } else {
        return '';
    }
}
const getTagClassTime = (time) => {
    // 将每个字符按照"至"进行拆分成数组，判断数组中的第二个元素是否比当前日期要大
    const timeArr = time.split("至");
    const endDate = new Date(timeArr[1]);
    const today = new Date();
    if (endDate > today) {
        return 'containerTagTime';
    } else {
        return 'containerTagTimeErr';
    }
}
const combinedArray = ref([]);
const setForm = () => {
    blackData.data.blackTimePeriodList = "";
    blackData.data.remark1 = "";
    blackData.data.remark2 = "";
    blackData.data.blackReason = "";
    isRemark.value = false;
    inputs.value = [];
    carNoList.value = [];
    combinedArray.value = [];
    timePeriodListResults.value = [];
}
const update = () => {
    // 表单校验
    formRef.value.validate((valid) => {
        if (inputs.value.length > 0) {
            // 将inputs数组中的值赋值到carNoList数组中
            combinedArray.value = [...carNoList.value, ...inputs.value]
        } else {
            combinedArray.value = carNoList.value;
        }
        const startDate = timePeriodListResults.value[0]
        const endDate = timePeriodListResults.value[1]
        //格式化开始时间
        const newStartDate = new Date(startDate);
        const formattedStartDate = newStartDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
        //格式化结束时间
        const newEndDate = new Date(endDate);
        const formattedEndDate = newEndDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
        //将 formattedEndDate和formattedStartDate用"-"连接起来
        const timePeriod = formattedStartDate + "-" + formattedEndDate;
        console.log(timePeriod)
        blackData.data.carNo = combinedArray.value.join(",");
        console.log(blackData.data.carNo)
        const specialCarTypeId = blackNameList.value.find(item => item.name === blackData.data.specialCarTypeName).id;
        const loadingTime = 0;
        if (valid) {
            // 关闭当前页面的标签页;
            dialogVisibleBlack.value = false
            // 添加加载弹窗
            setTimeout(() => {
                const loading = ElLoading.service({
                    lock: true,
                    // 字体改成黑色
                    text: '正在删除数据，请稍后.....',
                    // 改成白色的背景
                    background: 'rgba(255, 255, 255, 0.7)',
                })
                request
                    .get("/parking/yardInfo/yardCode",
                        {
                            params: {
                                yardName: blackData.data.parkName
                            },
                        })
                    .then((res) => {
                        request({
                            url: "/parking/blackList/addBlackCar",
                            method: "POST",
                            data: {
                                parkCode: res.data[0],
                                parkName: blackData.data.parkName,
                                carCode: blackData.data.carNo,
                                carOwner: blackData.data.userName,
                                isPermament: blackData.data.isPermament,
                                reason: blackData.data.blackReason,
                                timePeriod: timePeriod,
                                specialCarTypeId: specialCarTypeId,
                                specialCarTypeName: blackData.data.specialCarTypeName,
                                remark1: blackData.data.remark1,
                                remark2: blackData.data.remark2
                            },
                        }).then((res) => {
                            if (res.data.code == 0) {
                                importData.value = res.data.data;
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
                                    loading.close()
                                }
                                if (importDefeat.value.length != 0) {
                                    ElNotification({
                                        title: '导入失败',
                                        message: '导入失败' + importDefeat.value.length + '条数据',
                                        type: 'error',
                                        offset: 100,
                                        position: "top-left"
                                    })
                                    loading.close()
                                    importNotificationDefeat.value = true
                                }
                                // 遍历导入失败的数据展示出来
                                importDefeat.value.forEach(item => {
                                    // 将item按照-进行拆分输出为数组，判断数组的第三个元素是否是"业务成功"，若是的话，将这整条数据存储到importSuccess中，否则存储到importDefeat中
                                    const arr = item.split("--");
                                    const defeatReason = arr[arr.length - 1];
                                    console.log(arr[0])
                                    console.log(defeatReason)
                                    importDefeatData.value.push({
                                        carCode: arr[0],
                                        defeatReason: defeatReason
                                    })
                                })
                                getData();
                                setForm()
                            } else {
                                dialogVisibleBlack.value = false
                                ElMessage.error(res.data.msg);
                            }
                        })
                    })
            }, loadingTime)
        } else {
            return false;
        }
    });
};
// 分页导航
const handlePageChange = (val) => {
    query.pageNum = val;
    getData();
};
// 滚动行为
const scrollBehavior = (e) => {
    console.log(e)
    // 判断滚动的次数，达到三次就触发加载更多数据
    scrollCount.value += 1;
    if (scrollCount.value >= 3) {
        // 判断是向上滚动还是向下滚动
        if (e.deltaY < 0) {
            // 向上滚动
            console.log("向上滚动")
            scrollCount.value = 0;
            isFormVisible.value = false;
            nextTick(() => {
                calculateTableHeight() // 使用动态计算函数
            })
        } else {
            // 向下滚动
            console.log("向下滚动")
            scrollCount.value = 0;
            isFormVisible.value = true;
            nextTick(() => {
                calculateTableHeight() // 使用动态计算函数
            })
        }
    }
}
onMounted(() => {
    // 挂载
    TableRef.value && TableRef.value.$refs.bodyWrapper.addEventListener('mousewheel', scrollBehavior)
    // 添加窗口大小监听器
    window.addEventListener('resize', handleResize)
    // 初始化计算表格高度
    nextTick(() => {
        calculateTableHeight()
    })
})

onUnmounted(() => {
    // 卸载
    TableRef.value && TableRef.value.$refs.bodyWrapper.removeEventListener('mousewheel', scrollBehavior)
    // 移除窗口大小监听器
    window.removeEventListener('resize', handleResize)
})
</script>
<style lang="scss">
.odd-row {
    background-color: rgb(241, 242, 244) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}

.ticketName {
    width: 100px;
}

.cell-item {
    // 设置宽度大一点
    width: 80%;
    display: flex;
    align-items: center;
}

.item_car_no {
    // 设置宽度大一点
    width: 80px;
    display: flex;
    align-items: center;
}

.containerTag {
    margin-left: -20px;
    margin-right: 30px;
    margin-bottom: 10px;
    font-size: 14px;
    // 字体往左边点
    width: 82px;
    height: 30px;
    // 将字往左边移动点
    transform: translateX(28px);
    line-height: 30px;
    text-align: center;
    color: #fff;
    // color: black;
    // 去除边框
    border: none;
    border-radius: 5px;
    background-color: #1e68bb;
    // background-image: linear-gradient(to bottom, #c0edc8, #4fcc67); /* 从上到下的绿色渐变 */;
}

.containerTagTime {
    margin-right: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    // 字体往左边点
    width: 290px;
    height: 30px;
    // 垂直排列
    display: flex;
    // 将字往左边移动点
    transform: translateX(8px);
    line-height: 30px;
    text-align: center;
    color: #fff;
    // color: black;
    // 去除边框
    border: none;
    border-radius: 5px;
    background-color: rgb(22, 208, 22);
    // background-image: linear-gradient(to bottom, #c0edc8, #4fcc67); /* 从上到下的绿色渐变 */;
}

.sycButton {
    background: #626aef;
    color: #fff;
    // 去除边框颜色
    border: none;
    // 按钮大一点
    font-size: 12px;
    // 移除定位相关样式
    margin: 0;
    float: none;
    // 点击以后颜色加深
}

.containerTagTimeErr {
    margin-right: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    // 字体往左边点
    width: 290px;
    height: 30px;
    // 垂直排列
    display: flex;
    // 将字往左边移动点
    transform: translateX(8px);
    line-height: 30px;
    text-align: center;
    color: #fff;
    // color: black;
    // 去除边框
    border: none;
    border-radius: 5px;
    background-color: rgb(255, 0, 0);
    // background-image: linear-gradient(to bottom, #c0edc8, #4fcc67); /* 从上到下的绿色渐变 */;
}

.ownerName {
    width: 120px;
}

.containerEnergy {
    margin-left: -20px;
    margin-right: 30px;
    margin-bottom: 10px;
    font-size: 14px;
    // 字体往左边点
    width: 90px;
    height: 30px;
    // 将字往左边移动点
    transform: translateX(28px);
    line-height: 30px;
    text-align: center;
    color: black;
    // 去除边框
    border: none;
    border-radius: 5px;
    background-image: linear-gradient(to bottom, #c0edc8, #4fcc67);
    /* 从上到下的绿色渐变 */
    ;
}

.form-container {
    display: flex;
    flex-wrap: wrap;
    /* 允许元素换行 */
    gap: 1px;
    /* 设置元素之间的间距 */
}

.input-container {
    width: 25%;
    display: flex;
    align-items: center;
    // margin-bottom: 5px;
}

.input-container>* {
    // margin-right: 2px;
}

.button-group {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto; /* 推到右侧 */
    flex-wrap: wrap; /* 允许换行 */
}

.searchButton {
    // 按钮大一点
    font-size: 14px;
    // 移除定位相关样式
    margin: 0;
    float: none;
}

.onsetButton {
    // 按钮大一点
    font-size: 14px;
    // 移除定位相关样式
    margin: 0;
    float: none;
}

.button-remark {
    // 去除按钮的边框
    border: none;
    // background-color: #1e68bb;
    // color: white;
    // 左对齐
    text-align: left;
    // margin-left: px;

    // 去除悬浮的颜色
    /* 去除悬浮状态下的背景色 */
    &:hover {
        // 没有颜色
        background-color: initial;
        /* 或者使用你希望的颜色 */
    }
}

.container {
    display: flex;
    flex-direction: column; /* 改为垂直布局 */
    // 不显示边框
    border: none;
    // 自适应宽度和高度
    width: 100%;
    height: auto;
    min-height: 400px; /* 最小高度 */
    // 不显示滚动条
    overflow: hidden;
    padding: 0 20px; /* 添加左右内边距 */
    box-sizing: border-box; /* 包含内边距在宽度内 */
}

.parkName {
    width: 120px;
}

.tagCss {
    flex: 0 0 25%;
    /* 每个标签占据容器宽度的三分之一 */
    // 不显示边框
    margin-bottom: 10px;
    // 标签的宽度自适应内容
    width: 80px;
    margin-right: 10px;
    text-align: center;
}

.pagination {
    // 居中显示
    display: flex;
    justify-content: center;
    margin-top: 20px;
    width: 100%;
}

.icon-ole {
    margin-top: -200px;
    margin-left: 1150px;
    color: #409eff;
    font-size: 15px;
}

.no-arrow-collapse::part(header) {
    --el-arrow-size: 0;
}

/* 在你的全局样式文件（如 styles.css）中 */
.el-collapse {
    border-bottom: none;
}

.el-collapse-item__arrow {
    // 隐藏掉这个
    font-size: 0 !important;
    color: transparent !important;
}

.el-collapse-item__header {
    // 去除白色背景
    background: transparent;
    border-bottom: none;
}

.toggleClass {
    // 按钮大一点
    font-size: 16px;
    // 移除定位相关样式
    margin: 0;
    float: none;
}

/* 响应式表格样式 */
.responsive-table {
    width: 100% !important;
    overflow-x: auto; /* 水平滚动条 */
}

/* 搜索表单样式 */
.search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.expanded-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

/* 响应式布局 */
@media (max-width: 1500px) {
    .container {
        padding: 0 20px;
    }
}

@media (max-width: 1200px) {
    .container {
        padding: 0 10px;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 5px;
    }
    
    .button-group {
        flex-direction: column;
        align-items: stretch;
        margin-left: 0;
        margin-top: 10px;
    }
    
    .searchButton,
    .onsetButton,
    .sycButton,
    .toggleClass {
        width: 100%;
        margin: 2px 0;
    }
    
    .search-form,
    .expanded-form {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-form .el-form-item,
    .expanded-form .el-form-item {
        margin-left: 0 !important;
        margin-right: 0 !important;
        width: 100%;
    }
}

/* ========== 现代化样式重构 ========== */

// 页面整体布局
.month-ticket-management {
    padding: 0;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
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
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
    }
    
    .page-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1500px;
        margin: 0 auto;
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
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
        display: flex;
        gap: 12px;
        
        .action-btn {
            height: 40px;
            padding: 0 20px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        }
    }
}

// 容器样式
.container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 0 32px;
}

// 搜索面板样式
.search-panel {
    background: white;
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8eaed;
    
    .search-panel-header {
        cursor: pointer;
        user-select: none;
        
        .search-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            
            .el-icon {
                color: #409eff;
            }
            
            .toggle-icon {
                margin-left: auto;
                transition: transform 0.3s ease;
                font-size: 14px;
                
                &.expanded {
                    transform: rotate(180deg);
                }
            }
        }
        
        &:hover {
            .search-title {
                color: #409eff;
            }
        }
    }
    
    .search-panel-body {
        padding-top: 16px;
        
        .search-form {
            .search-row {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 16px;
                
                .search-item {
                    margin-bottom: 0;
                    flex: 0 0 auto;
                    min-width: 140px;
                    
                    :deep(.el-form-item__label) {
                        font-weight: 500;
                        color: #606266;
                        white-space: nowrap;
                        margin-bottom: 0;
                    }
                    
                    .search-select,
                    .search-input {
                        width: 140px;
                    }
                }
                
                .search-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: auto;
                    flex: 0 0 auto;
                    white-space: nowrap;
                    
                    .reset-btn,
                    .search-btn {
                        height: 28px;
                        padding: 0 14px;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 12px;
                    }
                    
                    .search-btn {
                        background: linear-gradient(45deg, #409eff, #6b9eff);
                        border: none;
                        
                        &:hover {
                            background: linear-gradient(45deg, #337ecc, #5a8dff);
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
                        }
                    }
                }
            }
            
            .expanded-search-row {
                margin-bottom: 16px;
                padding-top: 16px;
                border-top: 1px solid #e8eaed;
                
                .search-row-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 12px 16px;
                    
                    @media (min-width: 768px) {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    @media (min-width: 1024px) {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    
                    @media (min-width: 1400px) {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                
                .search-item {
                    margin-bottom: 0;
                    
                    :deep(.el-form-item__label) {
                        font-weight: 500;
                        color: #606266;
                        margin-bottom: 6px;
                        font-size: 13px;
                    }
                    
                    .search-select,
                    .search-input {
                        width: 100%;
                    }
                }
            }
            
            .toggle-section {
                text-align: center;
                padding-top: 8px;
                border-top: 1px solid #f0f0f0;
                
                .toggle-btn {
                    color: #409eff;
                    font-size: 13px;
                    font-weight: 500;
                    
                    .toggle-icon {
                        margin-left: 4px;
                        transition: transform 0.3s ease;
                        font-size: 12px;
                        
                        &.expanded {
                            transform: rotate(180deg);
                        }
                    }
                    
                    &:hover {
                        color: #337ecc;
                    }
                }
            }
        }
    }
}

// 表格面板样式
.table-panel {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8eaed;
    margin-bottom: 24px;
    
    .table-panel-header {
        padding: 20px 24px;
        background: #fafbfc;
        border-bottom: 1px solid #e8eaed;
        
        .table-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            
            .el-icon {
                color: #409eff;
                font-size: 18px;
            }
        }
    }
    
    .table-panel-body {
        padding: 0;
        
        .modern-table {
            :deep(.el-table__header) {
                background-color: #f8f9fa;
                
                th {
                    background-color: #f8f9fa !important;
                    color: #606266;
                    font-weight: 600;
                    font-size: 15px;
                    border-bottom: 2px solid #e8eaed;
                }
            }
            
            :deep(.el-table__row) {
                transition: all 0.3s ease;
                
                &:hover {
                    background-color: #f5f7fa !important;
                }
                
                &.el-table__row--striped {
                    background-color: #fafbfc;
                }
            }
            
            :deep(.el-table__body) {
                font-size: 14px;
            }
        }
    }
}

// 月票信息单元格样式
.ticket-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    
    .ticket-avatar {
        width: 42px;
        height: 42px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        flex-shrink: 0;
    }
    
    .ticket-details {
        min-width: 0;
        flex: 1;
        
        .ticket-name {
            font-weight: 600;
            color: #303133;
            font-size: 15px;
            line-height: 1.4;
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .car-number {
            color: #409eff;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.4;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .park-name {
            color: #909399;
            font-size: 12px;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

// 车主信息单元格样式
.owner-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    
    .owner-avatar {
        width: 38px;
        height: 38px;
        background: linear-gradient(45deg, #409eff, #6b9eff);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
    }
    
    .owner-details {
        min-width: 0;
        flex: 1;
        
        .owner-name {
            font-weight: 600;
            color: #303133;
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .owner-phone {
            color: #909399;
            font-size: 12px;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

// 有效期信息单元格样式
.validity-info-cell {
    padding: 8px 4px;
    
    .validity-periods {
        margin-bottom: 8px;
        
        .validity-period-item {
            margin-bottom: 4px;
            padding: 6px 8px;
            border-radius: 6px;
            background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
            border: 1px solid #b3e5fc;
            transition: all 0.3s ease;
            position: relative;
            
            .period-date {
                font-size: 12px;
                font-weight: 500;
                color: #0369a1;
                line-height: 1.3;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
            }
            
            .period-status {
                font-size: 10px;
                font-weight: 600;
                text-align: center;
                padding: 1px 4px;
                border-radius: 3px;
                
                &.expired-tag {
                    background: #fecaca;
                    color: #dc2626;
                }
                
                &.active-tag {
                    background: #bbf7d0;
                    color: #16a34a;
                }
                
                &.future-tag {
                    background: #fde68a;
                    color: #d97706;
                }
            }
            
            // 过期状态样式
            &.expired {
                background: linear-gradient(45deg, #fef2f2, #fee2e2);
                border-color: #fca5a5;
                
                .period-date {
                    color: #dc2626;
                }
            }
            
            // 生效中状态样式
            &.active {
                background: linear-gradient(45deg, #f0fdf4, #dcfce7);
                border-color: #86efac;
                
                .period-date {
                    color: #16a34a;
                }
            }
            
            // 未生效状态样式（未来的时间段）
            &:not(.expired):not(.active) {
                background: linear-gradient(45deg, #fffbeb, #fef3c7);
                border-color: #fbbf24;
                
                .period-date {
                    color: #d97706;
                }
            }
            
            &:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        }
        
        .no-valid-period {
            padding: 8px 12px;
            border-radius: 6px;
            background: linear-gradient(45deg, #f9fafb, #f3f4f6);
            border: 1px solid #d1d5db;
            color: #6b7280;
            font-size: 12px;
            font-style: italic;
            text-align: center;
        }
    }
    
    .status-tag {
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        display: block;
        margin: 0 auto;
        width: fit-content;
    }
}

// 备注信息单元格样式
.remark-info-cell {
    .remark-item {
        margin-bottom: 4px;
        font-size: 13px;
        line-height: 1.4;
        
        .remark-label {
            color: #909399;
            font-size: 12px;
        }
        
        .remark-content {
            color: #303133;
            font-weight: 500;
        }
    }
    
    .no-remark {
        color: #c0c4cc;
        font-size: 12px;
        font-style: italic;
        text-align: center;
    }
}

// 操作按钮样式
.action-buttons {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 4px;
    
    .action-btn-view,
    .action-btn-blacklist,
    .action-btn-more {
        padding: 5px 10px;
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
        background: linear-gradient(45deg, #409eff, #6b9eff);
        color: white;
        border: none;
        
        &:hover {
            background: linear-gradient(45deg, #337ecc, #5a8dff);
        }
    }
    
    .action-btn-blacklist {
        background: linear-gradient(45deg, #f56565, #fc8181);
        color: white;
        border: none;
        min-width: 70px;
        
        &:hover {
            background: linear-gradient(45deg, #e53e3e, #f56565);
        }
    }
    
    .action-btn-more {
        background: linear-gradient(45deg, #718096, #a0aec0);
        color: white;
        border: none;
        
        &:hover {
            background: linear-gradient(45deg, #4a5568, #718096);
        }
    }
    
    .action-dropdown {
        :deep(.el-dropdown-menu) {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e8eaed;
            
            .el-dropdown-menu__item {
                padding: 8px 16px;
                font-size: 13px;
                
                &:hover {
                    background-color: #f5f7fa;
                    color: #409eff;
                }
            }
        }
    }
}

// 分页样式
.pagination {
    display: flex;
    justify-content: center;
    padding: 24px 0;
    
    :deep(.el-pagination) {
        font-size: 14px;
        
        .el-pager li {
            border-radius: 6px;
            margin: 0 2px;
            font-size: 14px;
            
            &.is-active {
                background: linear-gradient(45deg, #409eff, #6b9eff);
                border: none;
            }
        }
        
        .btn-prev,
        .btn-next {
            border-radius: 6px;
            font-size: 14px;
        }
        
        .el-pagination__total,
        .el-pagination__sizes,
        .el-pagination__jump {
            font-size: 14px;
        }
    }
}

// 响应式适配
@media (max-width: 1024px) {
    .container {
        padding: 0 16px;
    }
    
    .page-header {
        padding: 20px 16px;
        
        .page-header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
        }
        
        .page-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
}

@media (max-width: 768px) {
    .search-panel {
        padding: 12px 16px;
        
        .search-form .search-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            
            .search-item {
                min-width: auto;
                
                .search-select,
                .search-input {
                    width: 100%;
                }
            }
            
            .search-actions {
                margin-left: 0;
                justify-content: center;
                margin-top: 8px;
            }
        }
        
        .expanded-search-row {
            .search-row-grid {
                grid-template-columns: 1fr;
                gap: 6px;
            }
        }
    }
    
    .table-panel {
        .table-panel-header {
            padding: 16px;
        }
    }
    
    .page-header {
        .page-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
        
        .page-actions {
            justify-content: flex-start;
        }
    }
    
    // 移动端操作按钮优化
    .action-buttons {
        gap: 4px;
        
        .action-btn-view,
        .action-btn-blacklist,
        .action-btn-more {
            padding: 4px 6px;
            font-size: 11px;
            min-width: 45px;
            height: 26px;
        }
        
        .action-btn-blacklist {
            min-width: 55px;
        }
    }
}
</style>