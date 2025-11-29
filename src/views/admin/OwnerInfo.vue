<template>
    <div class="owner-info-management">
        <!-- 现代化页面头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="title-icon">
                        <img src="..//../icons/svg-black/OwnerInfo.svg" alt="业主管理" class="header-icon">
                    </div>
                    <div class="title-text">
                        <h1>业主管理</h1>
                        <p class="title-desc">管理业主基本信息、车辆信息和车位配置</p>
                    </div>
                </div>
                <div class="page-actions">
                    <el-button type="info" icon="Upload" @click="exportData" class="action-btn">
                        导出数据
                    </el-button>
                    <el-button type="primary" icon="Plus" @click="handleAdd" class="action-btn">
                        新增业主
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
                        <span>搜索条件</span>
                        <el-icon :class="['toggle-icon', { 'expanded': searchPanelExpanded }]">
                            <ArrowDown />
                        </el-icon>
                    </div>
                </div>
                <el-collapse-transition>
                    <div v-show="searchPanelExpanded" class="search-panel-body">
                        <el-form :inline="true" :model="query" class="search-form" label-width="80px">
                            <div class="search-row">
                                <el-form-item label="小区名称" class="search-item">
                                    <el-select v-model="query.community" placeholder="请选择小区" clearable
                                        class="search-select">
                                        <el-option v-for="item in searchCommunityList" :key="item.community"
                                            :label="item.community" :value="item.community">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="业主姓名" class="search-item">
                                    <el-input v-model="query.ownername" placeholder="请输入业主姓名" clearable
                                        class="search-input"></el-input>
                                </el-form-item>
                                <el-form-item label="手机号" class="search-item">
                                    <el-input v-model="query.ownerphone" placeholder="请输入手机号" clearable
                                        class="search-input" maxlength="11"></el-input>
                                </el-form-item>
                                <el-form-item label="车牌号码" class="search-item">
                                    <el-input v-model="query.plates" placeholder="请输入车牌号码" clearable
                                        class="search-input" maxlength="8"></el-input>
                                </el-form-item>
                            </div>
                            <div class="search-row search-row-actions">
                                <div class="search-actions">
                                    <div class="upload-section">
                                        <el-upload ref="upload" class="upload-demo" action="" accept=".xls,.xlsx"
                                            :on-change="onUpload" :limit="1" :on-exceed="handleExceed"
                                            :on-error="onErrorFile" :on-success="onSuccessFile" :auto-upload="false"
                                            :file-list="fileList" :show-file-list="false" name="file">
                                            <el-button type="success" icon="Upload" size="small" class="upload-btn">
                                                批量导入
                                            </el-button>
                                        </el-upload>
                                    </div>
                                    <el-button type="primary" icon="Search" @click="handleSearch" size="small"
                                        class="search-btn">
                                        搜索
                                    </el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-collapse-transition>
            </div>
            <!-- 业主列表 -->
            <div class="table-panel">
                <div class="table-panel-header">
                    <div class="table-title">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>业主列表</span>
                    </div>
                </div>
                <div class="table-panel-body">
                    <el-table :data="tableData" class="modern-table" ref="multipleTable"
                        :row-class-name="tableRowClassName" stripe>

                        <!-- 业主基本信息列 -->
                        <el-table-column label="业主信息" width="200" fixed="left">
                            <template #default="{ row }">
                                <div class="owner-info-cell">
                                    <div class="owner-avatar">
                                        {{ row.ownername?.charAt(0) || '业' }}
                                    </div>
                                    <div class="owner-details">
                                        <div class="owner-name">{{ row.ownername }}</div>
                                        <div class="owner-phone">{{ row.ownerphone }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 地址信息列 -->
                        <el-table-column label="地址信息" width="300">
                            <template #default="{ row }">
                                <div class="address-info-cell">
                                    <div class="address-region">
                                        {{ row.province }}-{{ row.city }}-{{ row.district }}
                                    </div>
                                    <div class="address-community">
                                        {{ row.community }}
                                    </div>
                                    <div class="address-detail">
                                        {{ row.building }}栋{{ row.units }}单元{{ row.floor }}楼{{ row.roomnumber }}房
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车辆信息列 -->
                        <el-table-column label="车牌号码" width="200">
                            <template #default="{ row }">
                                <div class="vehicle-info-cell">
                                    <div v-if="row.plates" class="vehicle-item">
                                        <div class="plate-display">
                                            <span v-for="plate in row.plates.split(',')" :key="plate"
                                                :class="['plate-number', getPlateType(plate)]">
                                                {{ plate.trim() }}
                                            </span>
                                        </div>
                                    </div>
                                    <div v-if="!row.plates" class="no-vehicle">
                                        暂无车牌
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 车位信息列 -->
                        <el-table-column label="车位号码" width="150">
                            <template #default="{ row }">
                                <div class="parking-info-cell">
                                    <div v-if="row.parkingspaces" class="parking-item">
                                        <el-icon class="parking-icon">
                                            <Position />
                                        </el-icon>
                                        <span class="parking-number">{{ row.parkingspaces }}</span>
                                    </div>
                                    <div v-if="!row.parkingspaces" class="no-parking">
                                        暂无车位
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" width="200" align="center" fixed="right">
                            <template #default="scope">
                                <div class="action-buttons">
                                    <el-button type="primary" text icon="Edit" @click="handleEdit(scope.row)"
                                        class="action-btn-edit">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" text icon="Delete"
                                        @click="handleDelete(scope.$index, scope.row.id)" class="action-btn-delete">
                                        删除
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
        <!-- 业主编辑对话框 -->
        <div>
            <el-dialog v-model="dialogVisible" :title="form.data.id ? '修改业主信息' : '增加业主信息'" width="800px"
                class="modern-dialog">
                <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px" class="modern-form">
                    <!-- 地区级联选择器 -->
                    <div class="form-section">
                        <h3 class="section-title">地址信息</h3>
                        <div class="form-grid grid-2">
                            <el-form-item label="省份" prop="province">
                                <el-select v-model="form.data.province" placeholder="请选择省份" class="form-select">
                                    <el-option v-for="item in provinceList" :key="item.province" :label="item.province"
                                        :value="item.province" @click="changeProvince">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="地市" prop="city">
                                <el-select v-model="form.data.city" placeholder="请选择地市" class="form-select">
                                    <el-option v-for="item in cityList" :key="item.city" :label="item.city"
                                        :value="item.city" @click="changeCity">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div class="form-grid grid-2">
                            <el-form-item label="区县" prop="district">
                                <el-select v-model="form.data.district" placeholder="请选择区县" class="form-select">
                                    <el-option v-for="item in districtList" :key="item.district" :label="item.district"
                                        :value="item.district" @click="changeDistrict">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="小区" prop="community">
                                <el-select v-model="form.data.community" placeholder="请选择小区" class="form-select">
                                    <el-option v-for="item in communityList" :key="item.community"
                                        :label="item.community" :value="item.community" @click="changeCommunity">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 房屋信息 -->
                    <div class="form-section">
                        <h3 class="section-title">房屋信息</h3>
                        <div class="form-grid grid-2">
                            <el-form-item label="楼栋" prop="building">
                                <el-select v-model="form.data.building" placeholder="请选择楼栋" class="form-select">
                                    <el-option v-for="item in buildingList" :key="item.building" :label="item.building"
                                        :value="item.building" @click="changeBuilding">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="单元" prop="units">
                                <el-select v-model="form.data.units" placeholder="请选择单元" class="form-select">
                                    <el-option v-for="item in unitsList" :key="item.units" :label="item.units"
                                        :value="item.units" @click="changeUnits">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div class="form-grid grid-2">
                            <el-form-item label="楼层" prop="floor">
                                <el-select v-model="form.data.floor" placeholder="请选择楼层" class="form-select">
                                    <el-option v-for="item in floorList" :key="item.floor" :label="item.floor"
                                        :value="item.floor" @click="changeFloor">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="房号" prop="roomnumber">
                                <el-select v-model="form.data.roomnumber" placeholder="房号" class="form-select">
                                    <el-option v-for="item in roomnumberList" :key="item.roomnumber"
                                        :label="item.roomnumber" :value="item.roomnumber">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 业主信息 -->
                    <div class="form-section">
                        <h3 class="section-title">业主信息</h3>
                        <div class="form-grid grid-1">
                            <el-form-item label="业主名称" prop="ownername">
                                <el-input v-model="form.data.ownername" class="form-input"
                                    placeholder="请输入业主名称"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-grid grid-1">
                            <el-form-item label="业主电话" prop="ownerphone">
                                <el-input v-model="form.data.ownerphone" class="form-input"
                                    placeholder="请输入业主电话"></el-input>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 车牌号码动态输入 -->
                    <div class="form-section">
                        <h3 class="section-title">车辆信息</h3>
                        <el-form-item label="车牌号">
                            <div class="plate-input-section">
                                <div v-for="(item, index) in form.data.carDatas" :key="index" class="plate-input-item">
                                    <el-form-item :prop="'carDatas.' + index + '.data'"
                                        :rules="{ required: true, message: '请输入车牌号', trigger: 'blur' }"
                                        class="plate-form-item">
                                        <div class="plate-input-wrapper">
                                            <div class="plate-preview"
                                                :class="[getPlateType(item.data), { 'empty': !item.data }]">
                                                <span v-if="item.data" class="plate-text">{{ item.data.toUpperCase()
                                                }}</span>
                                                <span v-else class="plate-placeholder">车牌号</span>
                                            </div>
                                            <el-input v-model="item.data" placeholder="请输入车牌号" class="plate-input"
                                                maxlength="8" @input="handlePlateInput(item, index)" />
                                            <el-button type="danger" circle size="small" @click="deleteCar(index)"
                                                v-if="form.data.carDatas.length > 1" class="plate-delete-btn">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </div>
                                    </el-form-item>
                                </div>
                                <el-button type="primary" text icon="Plus" @click="addCar" class="add-plate-btn">
                                    添加车牌
                                </el-button>
                            </div>
                        </el-form-item>

                        <!-- 车位号码动态输入 -->
                        <el-form-item label="车位号码">
                            <div class="parking-input-section">
                                <div v-for="(item, index) in form.data.parkingDatas" :key="index"
                                    class="parking-input-item">
                                    <el-form-item :prop="'parkingDatas.' + index + '.data'"
                                        :rules="{ required: true, message: '请输入车位号码', trigger: 'blur' }"
                                        class="parking-form-item">
                                        <div class="parking-input-wrapper">
                                            <div class="parking-preview" :class="{ 'empty': !item.data }">
                                                <el-icon class="parking-icon">
                                                    <Position />
                                                </el-icon>
                                                <span v-if="item.data" class="parking-text">{{ item.data }}</span>
                                                <span v-else class="parking-placeholder">车位号</span>
                                            </div>
                                            <el-input v-model="item.data" placeholder="请输入车位号码" class="parking-input"
                                                maxlength="10" />
                                            <el-button type="danger" circle size="small" @click="deleteParking(index)"
                                                v-if="form.data.parkingDatas.length > 1" class="parking-delete-btn">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </div>
                                    </el-form-item>
                                </div>
                                <el-button type="primary" text icon="Plus" @click="addParking" class="add-parking-btn">
                                    添加车位
                                </el-button>
                            </div>
                        </el-form-item>
                    </div>

                    <!-- 配置选项 -->
                    <div class="form-section">
                        <h3 class="section-title">配置选项</h3>
                        <div class="form-grid grid-2">
                            <el-form-item label="是否审批" class="radio-group-item">
                                <el-radio-group v-model="form.data.isaudit" class="radio-group">
                                    <el-radio :label="'是'">是</el-radio>
                                    <el-radio :label="'否'">否</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="是否开自助预约" class="radio-group-item">
                                <el-radio-group v-model="form.data.permitverify" class="radio-group">
                                    <el-radio :label="'是'">是</el-radio>
                                    <el-radio :label="'否'">否</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false" class="cancel-btn">
                            取消
                        </el-button>
                        <el-button type="primary" @click="save" class="save-btn">
                            确定
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
        <div>
            <el-dialog title="修改业主信息" v-model="dialogVisibleUpdate" width="50%">
                <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
                    <el-form-item label="省份" prop="province">
                        <el-select v-model="form.data.province" placeholder="请选择省份">
                            <el-option v-for="item in provinceList" :key="item.province" :label="item.province"
                                :value="item.province" @click="changeProvince">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="地市" prop="city">
                        <el-select v-model="form.data.city" placeholder="请选择地市">
                            <el-option v-for="item in cityList" :key="item.city" :label="item.city" :value="item.city"
                                @click="changeCity">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="区县" prop="district">
                        <el-select v-model="form.data.district" placeholder="请选择区县">
                            <el-option v-for="item in districtList" :key="item.district" :label="item.district"
                                :value="item.district" @click="changeDistrict">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="小区" prop="community">
                        <el-select v-model="form.data.community" placeholder="请选择小区">
                            <el-option v-for="item in communityList" :key="item.community" :label="item.community"
                                :value="item.community" @click="changeCommunity">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="楼栋" prop="building">
                        <el-select v-model="form.data.building" placeholder="请选择楼栋">
                            <el-option v-for="item in buildingList" :key="item.building" :label="item.building"
                                :value="item.building" @click="changeBuilding">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="单元" prop="units">
                        <el-select v-model="form.data.units" placeholder="请选择单元">
                            <el-option v-for="item in unitsList" :key="item.units" :label="item.units"
                                :value="item.units" @click="changeUnits">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="楼层" prop="floor">
                        <el-select v-model="form.data.floor" placeholder="请选择楼层">
                            <el-option v-for="item in floorList" :key="item.floor" :label="item.floor"
                                :value="item.floor" @click="changeFloor">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="房号" prop="roomnumber">
                        <el-select v-model="form.data.roomnumber" placeholder="房号">
                            <el-option v-for="item in roomnumberList" :key="item.roomnumber" :label="item.roomnumber"
                                :value="item.roomnumber">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="业主名称" prop="ownername">
                        <el-input v-model="form.data.ownername" style="width: 80%"></el-input>
                    </el-form-item>
                    <el-form-item label="业主电话" prop="ownerphone">
                        <el-input v-model="form.data.ownerphone" style="width: 80%"></el-input>
                    </el-form-item>
                    <!-- label="车牌号"    -->
                    <el-form-item label="车牌号">
                        <el-form-item v-for="(item, index) in form.data.carDatas" :key="index"
                            style="  margin-right: 16px; display: inline-block; margin-bottom: 18px;">
                            <el-form-item :prop="'carDatas.' + index + '.data'"
                                :rules="{ required: true, message: '请输入车牌号', trigger: 'blur' }">
                                <el-input style="width: 194px;" type="text" v-model="item.data" placeholder="请输入车牌号">
                                </el-input>
                                <img src="@/assets/img/del-carCode.svg" @click="deleteCar(index)" alt=""
                                    class="del-carCode">
                            </el-form-item>
                        </el-form-item>
                        <img src="@/assets/img/addCarCode.svg" @click="addCar" alt="" class="addCarCode">
                    </el-form-item>
                    <el-form-item label="车位号码">
                        <el-form-item v-for="(item, index) in form.data.parkingDatas" :key="index"
                            style="  margin-right: 16px; display: inline-block; margin-bottom: 18px;">
                            <el-form-item :prop="'parkingDatas.' + index + '.data'"
                                :rules="{ required: true, message: '请输入车位号码', trigger: 'blur' }">
                                <el-input style="width: 194px;" type="text" v-model="item.data" placeholder="请输入车位号码">
                                </el-input>
                                <img src="@/assets/img/del-carCode.svg" @click="deleteParking(index)" alt=""
                                    class="del-carCode">
                            </el-form-item>
                        </el-form-item>
                        <img src="@/assets/img/addCarCode.svg" @click="addParking" alt="" class="addCarCode">
                    </el-form-item>
                    <el-form-item label="是否审批">
                        <el-radio-group v-model="form.data.isaudit">
                            <el-radio :label="'是'">是</el-radio>
                            <el-radio :label="'否'">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="是否开启自助预约" label-width="150px">
                        <el-radio-group v-model="form.data.permitverify">
                            <el-radio :label="'是'">是</el-radio>
                            <el-radio :label="'否'">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click=" dialogVisibleUpdate = false">取 消</el-button>
                        <el-button type="primary" @click="saveUpdate">确 定</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
        <div>
            <el-dialog title="查看审核原因" v-model="viewShow">
                <span style="margin-left: 50px">{{ content }}</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="viewShow = false">取 消</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
        <div>
            <el-dialog title="查看图片" v-model="viewShow">
                <span style="margin-left: 50px">{{ content1 }}</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="viewShow = false">取 消</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { ArrowDown, Position, Delete } from '@element-plus/icons-vue';
import { activityApi } from "@/api/activity";

import XLSX from "xlsx";

const root = "/parking/ownerinfo/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
    { label: "省份", prop: "province" },
    { label: "地市", prop: "city" },
    { label: "县区", prop: "district" },
    { label: "小区", prop: "community" },
    { label: "栋号", prop: "building" },
    { label: "单元", prop: "units" },
    { label: "楼层", prop: "floor" },
    { label: "房号", prop: "roomnumber" },
    { label: "业主姓名", prop: "ownername" },
    { label: "业主电话", prop: "ownerphone" },
    { label: "是否审批", prop: "isaudit" },
    { label: "允许验证", prop: "permitverify" },
    { label: "车牌号码", prop: "plates" },
    { label: "车位号码", prop: "parkingspaces" },
];

const rules = {
    province: [
        {
            required: true,
            message: "请选择省份",
            trigger: "change",
        },
    ],
    city: [
        {
            required: true,
            message: "请选择地市",
            trigger: "change",
        },
    ],
    district: [
        {
            required: true,
            message: "请选择县区",
            trigger: "change",
        },
    ],
    community: [
        {
            required: true,
            message: "请选择校区",
            trigger: "change",
        },
    ],
    building: [
        {
            required: true,
            message: "请选择楼栋",
            trigger: "change",
        },
    ],
    units: [
        {
            required: true,
            message: "请选择单元",
            trigger: "change",
        },
    ],
    floor: [
        {
            required: true,
            message: "请选择楼层",
            trigger: "change",
        },
    ],
    roomnumber: [
        {
            required: true,
            message: "请选择房号",
            trigger: "change",
        },
    ],
    ownername: [
        {
            required: true,
            message: "请输入业主姓名",
            trigger: "blur",
        },
    ],
    ownerphone: [
        { required: true, message: "请输入业主电话", trigger: "blur" },
    ],
};
const form = reactive({
    data: {
        id: '',
        province: '',
        city: '',
        district: '',
        community: '',
        building: '',
        units: '',
        floor: '',
        roomnumber: '',
        ownername: '',
        ownerphone: '',
        isaudit: '',
        permitverify: '',
        plates: '',
        parkingspaces: '',
        carDatas: [
            {
                id: 0,
                data: ''
            }
        ],
        parkingDatas: [
            {
                id: 0,
                data: ''
            }
        ]
    },

});

const handleExport = () => {
    window.location.href = "http://www.xuerparking.cn:9999/purchase/exportPurchaseManagement";
};
// 重置
const onReset = () => {
    form.data.id = ''
    form.data.province = ''
    form.data.city = ''
    form.data.district = ''
    form.data.community = ''
    form.data.building = ''
    form.data.units = ''
    form.data.floor = ''
    form.data.roomnumber = ''
    form.data.ownername = ''
    form.data.ownerphone = ''
    form.data.isaudit = ''
    form.data.permitverify = ''
    form.data.plates = ''
    form.data.parkingspaces = ''
    form.data.carDatas = []
    form.data.carDatas.push({
        id: 0,
        data: ''
    }
    )
    form.data.parkingDatas = []
    form.data.parkingDatas.push(
        {
            id: 0,
            data: ''
        }
    )
};
const viewShow = ref(false)
const content = ref("");
const handleView = (row) => {
    console.log("这批我")
    if (row.fileReason !== null) {
        viewShow.value = true
        content.value = row.fileReason
    } else {
        ElMessage.info('没有审核原因');
    }
};
const viewShow1 = ref(false)
const content1 = ref("");
const handleView1 = (row) => {
    console.log("这批我")
    if (row.purchaseVoucher !== null) {
        viewShow.value = true
        content1.value = row.purchaseVoucher
    } else {
        ElMessage.info('没有审核原因');
    }
};
const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")
// alert(applicantUserId.value)
const departmentList = ref([]);
request.get("/parking/department/listDepartment").then((res) => {
    departmentList.value = res.data;
});
const query = reactive({
    community: "",
    ownername: "",
    ownerphone: "",
    plates: "",
    pageNum: 1,
    pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisibleUpdate = ref(false)
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
const searchCommunityList = ref([]);
const searchPanelExpanded = ref(false);

// 获取小区列表数据
const getCommunityList = () => {
    console.log("开始获取小区列表...");

    // 尝试获取所有小区数据
    request.get("/parking/community/allCommunity").then((res) => {
        console.log("专门小区接口返回:", res);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            searchCommunityList.value = res.data;
            console.log("小区列表加载成功:", searchCommunityList.value);
        } else {
            console.log("专门小区接口无数据，尝试从业主数据提取");
            getCommunityFromOwner();
        }
    }).catch((error) => {
        console.log("专门小区接口失败:", error);
        // 如果专门的接口不存在，可以从现有的业主数据中提取小区信息
        getCommunityFromOwner();
    });
};

// 从业主数据中提取小区信息
const getCommunityFromOwner = () => {
    request.get(root + "querypage", {
        params: { pageNum: 1, pageSize: 1000 } // 获取足够多的数据来提取小区信息
    }).then((res) => {
        console.log("业主数据返回:", res);
        if (res.data && res.data.records && res.data.records.length > 0) {
            // 从业主数据中提取唯一的小区名称
            const communities = [...new Set(res.data.records
                .map(item => item.community)
                .filter(community => community && community.trim() !== '')
            )];
            console.log("提取的小区名称:", communities);
            searchCommunityList.value = communities.map(community => ({ community }));
            console.log("小区列表设置完成:", searchCommunityList.value);
        } else {
            console.log("业主数据中没有找到小区信息");
        }
    }).catch((error) => {
        console.log("获取小区列表失败:", error);
    });
};

// 获取表格数据

const getData = () => {
    request
        .get(root + "querypage", {
            params: query,
        })
        .then((res) => {
            tableData.value = res.data.records;
            pageTotal.value = res.data.total;
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
        const searchParams = [];
        if (query.community) searchParams.push(`小区: ${query.community}`);
        if (query.ownername) searchParams.push(`业主姓名: ${query.ownername}`);
        if (query.ownerphone) searchParams.push(`手机号: ${query.ownerphone}`);
        if (query.plates) searchParams.push(`车牌号码: ${query.plates}`);
        
        const searchDescription = searchParams.length > 0 
            ? `查询业主信息 (${searchParams.join(', ')})` 
            : '查询所有业主信息';
        
        await activityApi.logOwnerOperation(
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

// 导出数据操作
const exportData = async () => {
    try {
        const res = await request.get(`${root}getAllUsersForExport`, {
            params: query
        });
        
        if (res && res.data && res.data.length > 0) {
            // 创建工作簿
            const ws = XLSX.utils.json_to_sheet(res.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "业主信息");

            // 导出文件
            const fileName = `业主信息_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);

            // 记录导出操作日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";
            
            // 构建导出条件描述
            const exportParams = [];
            if (query.community) exportParams.push(`小区: ${query.community}`);
            if (query.ownername) exportParams.push(`业主姓名: ${query.ownername}`);
            
            const exportDescription = exportParams.length > 0 
                ? `导出业主信息 (${exportParams.join(', ')}) - 共${res.data.length}条记录` 
                : `导出所有业主信息 - 共${res.data.length}条记录`;
            
            await activityApi.logOwnerOperation(
                userId,
                username,
                "导出",
                exportDescription,
                null,
                JSON.stringify({ 
                    exportParams: query, 
                    recordCount: res.data.length,
                    fileName: fileName 
                }),
                null
            ).catch(err => {
                console.error("记录导出日志失败:", err);
            });

            ElMessage.success("导出成功");
        } else {
            ElMessage.warning("暂无数据可导出");
        }
    } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败");
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
const handleDelete = (index, sid) => {
    // 获取要删除的业主信息，用于记录日志
    const ownerInfo = tableData.value[index];
    
    // 二次确认删除
    ElMessageBox.confirm("确定要删除吗？", "提示", {
        type: "warning",
    })
        .then(() => {
            request.delete(root + sid).then((res) => {
                if (res.data) {
                    ElMessage.success("删除成功");
                    tableData.value.splice(index, 1);
                    
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "管理员";
                    activityApi.logOwnerOperation(
                        userId,
                        username,
                        "删除",
                        `删除了业主 ${ownerInfo.ownername} 的信息`,
                        sid,
                        JSON.stringify(ownerInfo),
                        null
                    ).catch(err => {
                        console.error("记录活动日志失败:", err);
                    });
                } else {
                    ElMessage.error("删除失败");
                }
            });
        })
        .catch(() => {
        });
};

// 新增操作
const handleAdd = () => {
    dialogVisible.value = true;
    onReset();
    form.data.isaudit = '是';
    form.data.permitverify = '是';


};
// 表格编辑时弹窗和保存
const editVisible = ref(false);
const handleEdit = (row) => {
    console.log("✏️ [编辑模式] 开始编辑业主信息:", row);

    // 使用新的现代化弹窗而不是旧的弹窗
    dialogVisible.value = true;
    dialogVisibleUpdate.value = false; // 确保旧弹窗关闭

    form.data.id = row.id
    form.data.province = row.province
    form.data.city = row.city
    form.data.district = row.district
    form.data.community = row.community
    form.data.building = row.building
    form.data.units = row.units
    form.data.floor = row.floor
    form.data.roomnumber = row.roomnumber
    form.data.ownername = row.ownername
    form.data.ownerphone = row.ownerphone
    form.data.isaudit = row.isaudit
    form.data.permitverify = row.permitverify

    // 处理车牌和车位数据
    var carArr = []
    var parkingArr = []
    carArr = row.plates.split(',')
    parkingArr = row.parkingspaces.split(',')
    form.data.carDatas = []
    form.data.parkingDatas = []
    dataNum.value = 0
    dataParkingNum.value = 0
    for (let i = 0; i < carArr.length; i++) {
        form.data.carDatas.push({
            id: dataNum.value++,
            data: carArr[i]
        })
    }
    for (let i = 0; i < parkingArr.length; i++) {
        form.data.parkingDatas.push({
            id: dataParkingNum.value++,
            data: parkingArr[i]
        })
    }

    // 🔧 重要：编辑模式下自动加载所有相关的下拉列表
    loadAllDropdownLists();
};

// 加载所有下拉列表的方法（用于编辑模式）
const loadAllDropdownLists = () => {
    console.log("📋 [编辑模式] 开始加载所有下拉列表");

    // 1. 加载城市列表
    if (form.data.province) {
        request.get("/parking/community/city", {
            params: { province: form.data.province }
        }).then((res) => {
            cityList.value = res.data;
            console.log("✅ [编辑模式] 城市列表已加载");
        });
    }

    // 2. 加载区县列表
    if (form.data.province && form.data.city) {
        request.get("/parking/community/district", {
            params: {
                province: form.data.province,
                city: form.data.city
            }
        }).then((res) => {
            districtList.value = res.data;
            console.log("✅ [编辑模式] 区县列表已加载");
        });
    }

    // 3. 加载小区列表
    if (form.data.province && form.data.city && form.data.district) {
        request.get("/parking/community/community", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district
            }
        }).then((res) => {
            communityList.value = res.data;
            console.log("✅ [编辑模式] 小区列表已加载");
        });
    }

    // 4. 加载楼栋列表
    if (form.data.province && form.data.city && form.data.district && form.data.community) {
        request.get("/parking/community/building", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district,
                community: form.data.community,
            }
        }).then((res) => {
            buildingList.value = res.data;
            console.log("✅ [编辑模式] 楼栋列表已加载");
        });
    }

    // 5. 加载单元列表
    if (form.data.building) {
        request.get("/parking/community/units", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district,
                community: form.data.community,
                building: form.data.building,
            }
        }).then((res) => {
            unitsList.value = res.data;
            console.log("✅ [编辑模式] 单元列表已加载");
        });
    }

    // 6. 加载楼层列表
    if (form.data.units) {
        request.get("/parking/community/floor", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district,
                community: form.data.community,
                building: form.data.building,
                units: form.data.units,
            }
        }).then((res) => {
            floorList.value = res.data;
            console.log("✅ [编辑模式] 楼层列表已加载");
        });
    }

    // 7. 加载房号列表
    if (form.data.floor) {
        request.get("/parking/community/roomnumber", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district,
                community: form.data.community,
                building: form.data.building,
                units: form.data.units,
                floor: form.data.floor,
            }
        }).then((res) => {
            roomnumberList.value = res.data;
            console.log("✅ [编辑模式] 房号列表已加载");
        });
    }
};
const provinceList = ref([]);
const cityList = ref([]);
const districtList = ref([]);
const communityList = ref([]);
const buildingList = ref([]);
const unitsList = ref([]);
const floorList = ref([]);
const roomnumberList = ref([]);
request.get("/parking/community/province").then((res) => {
    provinceList.value = res.data;
});
const changeProvince = () => {
    console.log("🌍 [省份选择] 用户选择了省份:", form.data.province);

    request
        .get("/parking/community/city",
            {
                params: {
                    province: form.data.province,
                },
            })
        .then((res) => {
            cityList.value = res.data;

            // 🔧 智能清空逻辑：只在新增模式或当前值不在新列表中时才清空
            const isEditMode = dialogVisibleUpdate.value;

            if (!isEditMode) {
                // 新增模式：清空所有下级字段
                form.data.city = "";
                form.data.district = "";
                form.data.community = "";
                form.data.building = "";
                form.data.units = "";
                form.data.floor = "";
                form.data.roomnumber = "";
            } else {
                // 编辑模式：检查当前值是否在新列表中，如果不在才清空
                const currentCityExists = res.data.some(item => item.city === form.data.city);
                if (!currentCityExists && form.data.city) {
                    console.log("⚠️ [省份选择] 当前城市不在新列表中，清空城市及下级字段");
                    form.data.city = "";
                    form.data.district = "";
                    form.data.community = "";
                    form.data.building = "";
                    form.data.units = "";
                    form.data.floor = "";
                    form.data.roomnumber = "";
                } else {
                    console.log("✅ [省份选择] 编辑模式，保持当前选择");
                    // 如果城市值有效，继续加载下级列表
                    if (form.data.city) {
                        loadDistrictList();
                    }
                }
            }
        });
};
// 独立的加载区县列表方法
const loadDistrictList = () => {
    if (form.data.province && form.data.city) {
        request
            .get("/parking/community/district", {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                },
            })
            .then((res) => {
                districtList.value = res.data;

                // 如果当前区县值有效，继续加载小区列表
                if (form.data.district) {
                    loadCommunityList();
                }
            });
    }
};

const changeCity = () => {
    console.log("🏙️ [城市选择] 用户选择了城市:", form.data.city);

    request
        .get("/parking/community/district",
            {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                },
            })
        .then((res) => {
            districtList.value = res.data;

            const isEditMode = dialogVisibleUpdate.value;

            if (!isEditMode) {
                // 新增模式：清空所有下级字段
                form.data.district = "";
                form.data.community = "";
                form.data.building = "";
                form.data.units = "";
                form.data.floor = "";
                form.data.roomnumber = "";
            } else {
                // 编辑模式：检查当前值是否在新列表中
                const currentDistrictExists = res.data.some(item => item.district === form.data.district);
                if (!currentDistrictExists && form.data.district) {
                    console.log("⚠️ [城市选择] 当前区县不在新列表中，清空区县及下级字段");
                    form.data.district = "";
                    form.data.community = "";
                    form.data.building = "";
                    form.data.units = "";
                    form.data.floor = "";
                    form.data.roomnumber = "";
                } else {
                    console.log("✅ [城市选择] 编辑模式，保持当前选择");
                    if (form.data.district) {
                        loadCommunityList();
                    }
                }
            }
        });
};
// 独立的加载小区列表方法
const loadCommunityList = () => {
    if (form.data.province && form.data.city && form.data.district) {
        request
            .get("/parking/community/community", {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                },
            })
            .then((res) => {
                communityList.value = res.data;

                // 如果当前小区值有效，继续加载楼栋列表
                if (form.data.community) {
                    loadBuildingList();
                }
            });
    }
};

const changeDistrict = () => {
    console.log("🏘️ [区县选择] 用户选择了区县:", form.data.district);

    request
        .get("/parking/community/community",
            {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                },
            })
        .then((res) => {
            communityList.value = res.data;

            const isEditMode = dialogVisibleUpdate.value;

            if (!isEditMode) {
                // 新增模式：清空所有下级字段
                form.data.community = "";
                form.data.building = "";
                form.data.units = "";
                form.data.floor = "";
                form.data.roomnumber = "";
            } else {
                // 编辑模式：检查当前值是否在新列表中
                const currentCommunityExists = res.data.some(item => item.community === form.data.community);
                if (!currentCommunityExists && form.data.community) {
                    console.log("⚠️ [区县选择] 当前小区不在新列表中，清空小区及下级字段");
                    form.data.community = "";
                    form.data.building = "";
                    form.data.units = "";
                    form.data.floor = "";
                    form.data.roomnumber = "";
                } else {
                    console.log("✅ [区县选择] 编辑模式，保持当前选择");
                    if (form.data.community) {
                        loadBuildingList();
                    }
                }
            }
        });
};
const changeCommunity = () => {
    console.log("🏠 [小区选择] 用户选择了小区:", form.data.community);

    // 🔧 重要功能：根据小区名称自动查询并填充省市区信息
    if (form.data.community) {
        // 先查询该小区对应的省市区信息
        request
            .get("/parking/community/findProvinceByCommunityName", {
                params: {
                    community: form.data.community,
                    building: "", // 暂时不传具体地址，只根据小区名称查询
                    units: "",
                    floor: "",
                    room: ""
                }
            })
            .then((provinceRes) => {
                console.log("🔍 [省市区查询] 查询结果:", provinceRes);

                // 如果查询到省市区信息，自动填充
                if (provinceRes && provinceRes.data) {
                    const communityInfo = provinceRes.data;
                    if (communityInfo.province) {
                        form.data.province = communityInfo.province;
                        console.log("✅ [自动填充] 省份:", communityInfo.province);
                    }
                    if (communityInfo.city) {
                        form.data.city = communityInfo.city;
                        console.log("✅ [自动填充] 城市:", communityInfo.city);
                    }
                    if (communityInfo.district) {
                        form.data.district = communityInfo.district;
                        console.log("✅ [自动填充] 区县:", communityInfo.district);
                    }

                    // 更新相关的下拉列表
                    updateRelatedLists();
                } else {
                    console.log("⚠️ [省市区查询] 未查询到省市区信息，使用当前选择");
                    // 如果查询不到，继续使用当前的省市区信息
                    loadBuildingList();
                }
            })
            .catch((error) => {
                console.error("❌ [省市区查询] 查询失败:", error);
                // 查询失败时，继续使用当前的省市区信息
                loadBuildingList();
            });
    } else {
        // 如果没有选择小区，直接加载楼栋列表
        loadBuildingList();
    }
};

// 更新相关的下拉列表（省市区变化后需要重新加载）
const updateRelatedLists = () => {
    // 重新加载城市列表
    if (form.data.province) {
        request.get("/parking/community/city", {
            params: { province: form.data.province }
        }).then((res) => {
            cityList.value = res.data;
        });
    }

    // 重新加载区县列表
    if (form.data.province && form.data.city) {
        request.get("/parking/community/district", {
            params: {
                province: form.data.province,
                city: form.data.city
            }
        }).then((res) => {
            districtList.value = res.data;
        });
    }

    // 重新加载小区列表
    if (form.data.province && form.data.city && form.data.district) {
        request.get("/parking/community/community", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district
            }
        }).then((res) => {
            communityList.value = res.data;
        });
    }

    // 最后加载楼栋列表
    loadBuildingList();
};

// 加载楼栋列表的独立方法
const loadBuildingList = () => {
    request
        .get("/parking/community/building", {
            params: {
                province: form.data.province,
                city: form.data.city,
                district: form.data.district,
                community: form.data.community,
            },
        })
        .then((res) => {
            buildingList.value = res.data;
            form.data.building = "";
            form.data.units = "";
            form.data.floor = "";
            form.data.roomnumber = "";
        });
};
const changeBuilding = () => {
    request
        .get("/parking/community/units",
            {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                    community: form.data.community,
                    building: form.data.building,
                },
            })
        .then((res) => {
            unitsList.value = res.data;
            form.data.units = "";
            form.data.floor = "";
            form.data.roomnumber = "";
        });

};
const changeUnits = () => {
    request
        .get("/parking/community/floor",
            {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                    community: form.data.community,
                    building: form.data.building,
                    units: form.data.units,
                },
            })
        .then((res) => {
            floorList.value = res.data;
            form.data.floor = "";
            form.data.roomnumber = "";
        });

};
const changeFloor = () => {
    request
        .get("/parking/community/roomnumber",
            {
                params: {
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                    community: form.data.community,
                    building: form.data.building,
                    units: form.data.units,
                    floor: form.data.floor,
                },
            })
        .then((res) => {
            roomnumberList.value = res.data;
            form.data.roomnumber = "";
        });
};

const formRef = ref(null);
const save = () => {
    // 表单校验
    formRef.value.validate((valid) => {
        if (valid) {
            //车牌处理
            var carstr = ''
            var parkingstr = ''
            var find = false;
            for (let i = 0; i < form.data.carDatas.length; i++) {
                for (let j = i + 1; j < form.data.carDatas.length; j++) {
                    if (form.data.carDatas[i].data == form.data.carDatas[j].data) {
                        find = true;
                        break;
                    }
                }
            }
            if (find) {
                ElMessage.warning("车牌号有重复！");
                return false;
            }
            for (let i = 0; i < form.data.carDatas.length; i++) {
                if (carstr == '') carstr = form.data.carDatas[i].data
                else carstr = carstr + ',' + form.data.carDatas[i].data
            }
            //车位编号处理
            for (let i = 0; i < form.data.parkingDatas.length; i++) {
                for (let j = i + 1; j < form.data.parkingDatas.length; j++) {
                    if (form.data.parkingDatas[i].data == form.data.parkingDatas[j].data) {
                        find = true;
                        break;
                    }
                }
            }
            if (find) {
                ElMessage.warning("车位编号有重复！");
                return false;
            }
            for (let i = 0; i < form.data.parkingDatas.length; i++) {
                if (parkingstr == '') parkingstr = form.data.parkingDatas[i].data
                else parkingstr = parkingstr + ',' + form.data.parkingDatas[i].data
            }
            form.data.plates = carstr
            form.data.parkingspaces = parkingstr

            // 根据是否有ID判断是新增还是编辑
            var method = form.data.id === "" ? "POST" : "PUT";
            var url = form.data.id === "" ? "/parking/ownerinfo" : "/parking/ownerinfo/update";

            request({
                url: url,
                method: method,
                data: {
                    id: form.data.id, // 编辑时需要传递ID
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                    community: form.data.community,
                    building: form.data.building,
                    units: form.data.units,
                    floor: form.data.floor,
                    roomnumber: form.data.roomnumber,
                    ownername: form.data.ownername,
                    ownerphone: form.data.ownerphone,
                    isaudit: form.data.isaudit,
                    permitverify: form.data.permitverify,
                    plates: form.data.plates,
                    parkingspaces: form.data.parkingspaces,
                },
            }).then((res) => {
                console.log(res)
                if (res.data.code == 0) {
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "管理员";
                    const isEdit = form.data.id !== "";
                    const action = isEdit ? "修改" : "添加";
                    const description = isEdit 
                        ? `修改了业主 ${form.data.ownername} 的信息`
                        : `新增了业主 ${form.data.ownername}`;
                    
                    activityApi.logOwnerOperation(
                        userId,
                        username,
                        action,
                        description,
                        res.data.data?.id || form.data.id,
                        isEdit ? JSON.stringify(form.data) : null,
                        JSON.stringify(form.data)
                    ).catch(err => {
                        console.error("记录活动日志失败:", err);
                    });
                    
                    getData()
                    ElMessage.success("提交成功！");
                    // 关闭当前页面的标签页;
                    dialogVisible.value = false
                    // 重置表单数据
                    onReset();
                } else {
                    // dialogVisible.value = false
                    ElMessage.error(res.data.msg);
                }
            });
        } else {
            return false;
        }
    });
};
const saveUpdate = () => {
    // 表单校验
    formRef.value.validate((valid) => {
        if (valid) {
            //车牌处理
            var carstr = ''
            var parkingstr = ''
            var find = false;
            for (let i = 0; i < form.data.carDatas.length; i++) {
                for (let j = i + 1; j < form.data.carDatas.length; j++) {
                    if (form.data.carDatas[i].data == form.data.carDatas[j].data) {
                        find = true;
                        break;
                    }
                }
            }
            if (find) {
                ElMessage.warning("车牌号有重复！");
                return false;
            }
            for (let i = 0; i < form.data.carDatas.length; i++) {
                if (carstr == '') carstr = form.data.carDatas[i].data
                else carstr = carstr + ',' + form.data.carDatas[i].data
            }
            //车位编号处理
            for (let i = 0; i < form.data.parkingDatas.length; i++) {
                for (let j = i + 1; j < form.data.parkingDatas.length; j++) {
                    if (form.data.parkingDatas[i].data == form.data.parkingDatas[j].data) {
                        find = true;
                        break;
                    }
                }
            }
            if (find) {
                ElMessage.warning("车位编号有重复！");
                return false;
            }
            for (let i = 0; i < form.data.parkingDatas.length; i++) {
                if (parkingstr == '') parkingstr = form.data.parkingDatas[i].data
                else parkingstr = parkingstr + ',' + form.data.parkingDatas[i].data
            }
            form.data.plates = carstr
            form.data.parkingspaces = parkingstr
            request({
                url: "/parking/ownerinfo/update",
                method: "POST",
                data: {
                    id: form.data.id,
                    province: form.data.province,
                    city: form.data.city,
                    district: form.data.district,
                    community: form.data.community,
                    building: form.data.building,
                    units: form.data.units,
                    floor: form.data.floor,
                    roomnumber: form.data.roomnumber,
                    ownername: form.data.ownername,
                    ownerphone: form.data.ownerphone,
                    isaudit: form.data.isaudit,
                    permitverify: form.data.permitverify,
                    plates: form.data.plates,
                    parkingspaces: form.data.parkingspaces,
                },
            }).then((res) => {
                // console.log(
                console.log(res.data)
                if (res.data.code == 0) {
                    // 记录活动日志
                    const userId = localStorage.getItem("ms_userid") || "unknown";
                    const username = localStorage.getItem("ms_username") || "管理员";
                    
                    activityApi.logOwnerOperation(
                        userId,
                        username,
                        "修改",
                        `修改了业主 ${form.data.ownername} 的信息`,
                        form.data.id,
                        null,
                        JSON.stringify(form.data)
                    ).catch(err => {
                        console.error("记录活动日志失败:", err);
                    });
                    
                    getData()
                    ElMessage.success("提交成功！");
                    // 关闭当前页面的标签页;
                    dialogVisibleUpdate.value = false
                    form.data = {}
                } else {
                    // dialogVisible.value = false
                    ElMessage.error(res.data.msg);
                }
            });
        } else {
            return false;
        }
    });
};
const upload = ref();
const fileList = ref([]); // 图片列表
const onUpload = (file) => {
    const files = { 0: file.raw }// 取到File
    // console.log(files)
    if (files === 'undefined') {
        console.log()
    } else {
        readExcel(files)
    }
    //state.upload.value.clearFiles(); //去掉文件列表
    console.log(upload)
    console.log(state.upload)
};
const readExcel = (files) => { // 表格导入
    console.log(files)
    if (files.length <= 0) { // 如果没有文件名
        return false
    } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        console.log('上传格式不正确，请上传xls或者xlsx格式')
        return false
    }

    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
        try {
            const data = ev.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const wsname = workbook.SheetNames[0]// 取第一张表
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
            console.log(ws)
            request({
                url: "/parking/ownerinfo/batInsert",
                method: "POST",
                data: ws,
            }).then((res) => {
                if (res.code === null) {
                    getData()
                    // 关闭当前页面的标签页;
                    dialogVisible.value = false
                    console.log(res.msg)
                    if (res.msg !== "") {
                        ElMessageBox.alert(res.msg, '提示', {
                            // if you want to disable its autofocus
                            // autofocus: false,
                            confirmButtonText: 'OK',
                            callback: (action) => {
                            },
                        })
                    } else {
                        ElMessage.success("提交成功！");
                    }

                } else {
                    dialogVisible.value = false
                    ElMessage.error(res.msg);
                }
            });
            // 重写数据
            upload.value = ''
        } catch (e) {
            return false
        }
    }
    fileReader.readAsBinaryString(files[0])
};
const state = reactive({
    upload: null
})
// 文件上传失败钩子
const onErrorFile = () => {
    ElMessage.error('文件上传失败')
    state.upload.value.clearFiles(); //去掉文件列表
}

// 文件上传成功钩子
const onSuccessFile = () => {
    ElMessage.success('文件上传成功')
    state.upload.value.clearFiles(); //去掉文件列表
}

const dataNum = ref(0);
const deleteCar = (index) => {
    if (form.data.carDatas.length <= 1) {
        // 如果只有一个输入框则不可以删除
        return false
    }
    console.log(index);
    form.data.carDatas.splice(index, 1)
    // 删除了数组中对应的数据也就将这个位置的输入框删除
}

//指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
    // console.log(rowIndex)
    if ((rowIndex + 1) % 2 == 0) {
        console.log(rowIndex)
        return 'odd-row';
    } else if ((rowIndex + 1) % 2 != 0) {
        console.log(rowIndex)
        return 'even-row';
    }
};
//指定行高
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
    let style = { padding: '0px 3px' }
    return style
};
const addCar = () => {
    console.log(dataNum)
    if (form.data.carDatas.length > 9) {
        // 如果只有一个输入框则不可以删除
        ElMessage.success('业主所属车量不能超过10个！')
        return false
    }
    form.data.carDatas.push(
        // 增加就push进数组一个新值
        {
            id: dataNum.value++,
            data: ''
        }
    )
}

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

// 切换搜索面板展开状态
const toggleSearchPanel = () => {
    searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 处理车牌输入，自动转大写
const handlePlateInput = (item, index) => {
    // 自动转换为大写
    item.data = item.data.toUpperCase();
    // 更新显示
    updatePlateDisplay();
};

// 更新车牌预览显示
const updatePlateDisplay = () => {
    // 强制重新渲染车牌预览
    // 这个方法主要是为了触发车牌样式的更新
};

const dataParkingNum = ref(0);
const deleteParking = (index) => {
    if (form.data.parkingDatas.length <= 1) {
        // 如果只有一个输入框则不可以删除
        return false
    }
    console.log(index);
    form.data.parkingDatas.splice(index, 1)
    // 删除了数组中对应的数据也就将这个位置的输入框删除
}
const addParking = () => {
    console.log(dataParkingNum)
    if (form.data.length > 9) {
        // 如果只有一个输入框则不可以删除
        ElMessage.success('业主所属停车位数量不能超过10个！')
        return false
    }
    form.data.parkingDatas.push(
        // 增加就push进数组一个新值
        {
            id: dataParkingNum.value++,
            data: ''
        }
    )
}

</script>
<style lang="scss" scoped>
// 页面整体布局
.owner-info-management {
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
    max-width: 1200px;
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
    max-width: 1200px;
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
                gap: 16px;
                flex-wrap: wrap;

                .search-item {
                    margin-bottom: 0;
                    flex: 0 0 auto;
                    min-width: 160px;

                    :deep(.el-form-item__label) {
                        font-weight: 500;
                        color: #606266;
                        white-space: nowrap;
                        margin-bottom: 0;
                    }

                    .search-select,
                    .search-input {
                        width: 160px;
                    }
                }

                &.search-row-actions {
                    margin-top: 12px;
                    justify-content: flex-end;
                }

                .search-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px; // 减小间距
                    margin-left: auto;
                    flex: 0 0 auto; // 避免占满整行
                    white-space: nowrap; // 防止内部换行导致高度变大

                    .upload-section {
                        display: inline-flex; // 让上传容器紧凑排列
                        align-items: center;
                        flex: 0 0 auto; // 不允许在flex中拉伸

                        :deep(.el-upload) {
                            display: inline-flex; // 避免占据整行
                            align-items: center;
                            flex: 0 0 auto; // 不允许在flex中拉伸
                            width: auto !important; // 避免拉伸到父元素宽度
                            height: 28px; // 限制整体高度
                            margin: 0; // 去掉可能的默认外边距
                            padding: 0; // 去掉可能的默认内边距
                        }

                        :deep(.el-upload) .el-button {
                            height: 28px; // 与外层一致
                            line-height: 28px;
                            padding: 0 10px; // 紧凑内边距
                        }

                        .upload-btn {
                            height: 28px; // 减小高度
                            padding: 0 10px; // 减小内边距
                            border-radius: 6px;
                            font-weight: 500;
                            font-size: 12px;
                            min-width: auto; // 移除最小宽度限制
                        }
                    }

                    .search-btn {
                        height: 28px; // 减小高度
                        padding: 0 14px; // 减小内边距
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 12px;
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
            font-size: 18px; // 增大标题字体
            font-weight: 600;
            color: #303133;

            .el-icon {
                color: #409eff;
                font-size: 18px; // 增大图标大小
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
                    font-size: 15px; // 增大表头字体
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

            // 增大表格整体字体
            :deep(.el-table__body) {
                font-size: 14px;
            }
        }
    }
}

// 表格单元格样式
.owner-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    .owner-avatar {
        width: 42px; // 增大头像尺寸
        height: 42px;
        background: linear-gradient(45deg, #409eff, #6b9eff);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px; // 增大头像文字
        flex-shrink: 0;
    }

    .owner-details {
        min-width: 0;
        flex: 1;

        .owner-name {
            font-weight: 600;
            color: #303133;
            font-size: 15px; // 增大姓名字体
            line-height: 1.4;
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .owner-phone {
            color: #909399;
            font-size: 13px; // 增大电话字体
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

.address-info-cell {
    .address-region {
        font-weight: 500;
        color: #303133;
        font-size: 14px; // 增大地区字体
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-community {
        color: #606266;
        font-size: 14px; // 增大小区字体
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-detail {
        color: #909399;
        font-size: 13px; // 增大详细地址字体
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.vehicle-info-cell {
    .vehicle-item {
        margin-bottom: 8px;

        .plate-display {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .plate-number {
                display: inline-block;
                font-size: 14px; // 增大车牌字体
                font-weight: bold;
                padding: 8px 12px; // 增大内边距
                border-radius: 4px;
                font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                letter-spacing: 0.5px;
                min-width: 90px; // 增大最小宽度
                text-align: center;
                flex-shrink: 0;
                transition: all 0.3s ease;
                margin-bottom: 3px;

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
    }

    .no-vehicle {
        color: #c0c4cc;
        font-size: 13px; // 增大无车辆提示字体
        font-style: italic;
    }
}

.parking-info-cell {
    .parking-item {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 3px;

        .parking-icon {
            color: #e6a23c;
            font-size: 14px; // 增大车位图标
            flex-shrink: 0;
        }

        .parking-number {
            font-size: 14px; // 增大车位号字体
            font-weight: 500;
            color: #303133;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .no-parking {
        color: #c0c4cc;
        font-size: 13px; // 增大无车位提示字体
        font-style: italic;
    }
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;

    .action-btn-edit,
    .action-btn-delete {
        padding: 6px 12px; // 增大按钮内边距
        border-radius: 4px;
        font-size: 13px; // 增大按钮字体
        min-width: 60px; // 增大按钮最小宽度

        &:hover {
            transform: translateY(-1px);
        }
    }
}

// 分页样式
.pagination {
    display: flex;
    justify-content: center;
    padding: 24px 0;

    :deep(.el-pagination) {
        font-size: 14px; // 增大分页字体

        .el-pager li {
            border-radius: 6px;
            margin: 0 2px;
            font-size: 14px; // 增大页码字体

            &.is-active {
                background: linear-gradient(45deg, #409eff, #6b9eff);
                border: none;
            }
        }

        .btn-prev,
        .btn-next {
            border-radius: 6px;
            font-size: 14px; // 增大翻页按钮字体
        }

        .el-pagination__total,
        .el-pagination__sizes,
        .el-pagination__jump {
            font-size: 14px; // 增大分页信息字体
        }
    }
}

// 对话框样式
.modern-dialog {
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

        .el-dialog__footer {
            padding: 16px 24px 24px;
            text-align: right;
        }
    }
}

// 表单样式
.modern-form {
    .form-section {
        margin-bottom: 24px;

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
                background: linear-gradient(45deg, #409eff, #6b9eff);
            }
        }
    }

    .form-grid {
        display: grid;
        gap: 20px;

        &.grid-1 {
            grid-template-columns: 1fr;
        }

        &.grid-2 {
            grid-template-columns: 1fr 1fr;
        }

        &.grid-4 {
            grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr !important;
        }
    }

    .form-select {
        width: 70%;
    }

    .form-input {
        width: 40%;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
    }
}

// 车牌输入样式
.plate-input-section {
    .plate-input-item {
        margin-bottom: 12px;

        .plate-form-item {
            margin-bottom: 0;

            .plate-input-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;

                .plate-preview {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                    letter-spacing: 0.5px;
                    min-width: 90px;
                    text-align: center;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                    height: 32px;
                    border: 2px solid transparent;

                    // 传统燃油车牌 - 蓝色渐变
                    &.traditional {
                        background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
                        color: #FFFFFF;
                        border-color: #0C4FC5;
                        box-shadow: 0 2px 6px rgba(12, 79, 197, 0.3);
                    }

                    // 新能源车牌 - 绿色渐变
                    &.new-energy {
                        background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
                        color: #000000;
                        border-color: #6AD390;
                        box-shadow: 0 2px 6px rgba(106, 211, 144, 0.3);
                    }

                    // 空状态
                    &.empty {
                        background: #f5f7fa;
                        color: #c0c4cc;
                        border-color: #e4e7ed;
                        box-shadow: none;
                    }

                    .plate-text {
                        font-weight: bold;
                        font-size: 11px;
                    }

                    .plate-placeholder {
                        font-size: 10px;
                        font-style: italic;
                    }
                }

                .plate-input {
                    flex: 1;
                    max-width: 120px;

                    :deep(.el-input__wrapper) {
                        border-radius: 6px;
                        height: 32px;
                    }
                }

                .plate-delete-btn {
                    width: 32px; // 增加宽度
                    height: 32px; // 增加高度
                    min-width: 32px;
                    padding: 0;
                    border-radius: 50%;
                    background-color: #f56c6c;
                    border: 1px solid #f56c6c;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: #f78989;
                        border-color: #f78989;
                        transform: scale(1.1);
                        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
                    }

                    &:active {
                        transform: scale(0.95);
                    }

                    .el-icon {
                        font-size: 14px; // 增加图标大小
                    }
                }
            }
        }
    }

    .add-plate-btn {
        margin-top: 8px;
        padding: 6px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;

        &:hover {
            background-color: #e3f2fd;
            transform: translateY(-1px);
        }
    }
}

// 车位输入样式
.parking-input-section {
    .parking-input-item {
        margin-bottom: 12px;

        .parking-form-item {
            margin-bottom: 0;

            .parking-input-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;

                .parking-preview {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    padding: 6px 10px;
                    border-radius: 4px;
                    min-width: 80px;
                    text-align: center;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                    height: 32px;
                    background: linear-gradient(45deg, #f4a261, #e76f51);
                    color: white;
                    border: 1px solid #e76f51;
                    box-shadow: 0 2px 6px rgba(231, 111, 81, 0.3);

                    &.empty {
                        background: #f5f7fa;
                        color: #c0c4cc;
                        border-color: #e4e7ed;
                        box-shadow: none;
                    }

                    .parking-icon {
                        font-size: 12px;
                        color: inherit;
                    }

                    .parking-text {
                        font-weight: 500;
                        font-size: 10px;
                    }

                    .parking-placeholder {
                        font-size: 9px;
                        font-style: italic;
                    }
                }

                .parking-input {
                    flex: 1;
                    max-width: 100px;

                    :deep(.el-input__wrapper) {
                        border-radius: 6px;
                        height: 32px;
                    }
                }

                .parking-delete-btn {
                    width: 32px; // 增加宽度
                    height: 32px; // 增加高度
                    min-width: 32px;
                    padding: 0;
                    border-radius: 50%;
                    background-color: #f56c6c;
                    border: 1px solid #f56c6c;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: #f78989;
                        border-color: #f78989;
                        transform: scale(1.1);
                        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
                    }

                    &:active {
                        transform: scale(0.95);
                    }

                    .el-icon {
                        font-size: 14px; // 增加图标大小
                    }
                }
            }
        }
    }

    .add-parking-btn {
        margin-top: 8px;
        padding: 6px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;

        &:hover {
            background-color: #e3f2fd;
            transform: translateY(-1px);
        }
    }
}

.radio-group {
    :deep(.el-radio) {
        margin-right: 24px;

        .el-radio__label {
            font-weight: 500;
        }
    }
}

// 配置选项样式优化
.radio-group-item {
    :deep(.el-form-item__label) {
        white-space: nowrap; // 防止文字换行
        font-weight: 500;
        color: #606266;
    }
}

// 对话框底部
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .cancel-btn,
    .save-btn {
        padding: 8px 24px;
        border-radius: 8px;
        font-weight: 500;
    }

    .save-btn {
        background: linear-gradient(45deg, #409eff, #6b9eff);
        border: none;

        &:hover {
            background: linear-gradient(45deg, #337ecc, #5a8dff);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }
    }
}

// 上传组件样式
.upload-demo {
    display: inline-flex;
    align-items: center;
    height: 28px;
    width: auto;
    flex: 0 0 auto; // 不允许拉伸

    :deep(.el-upload) {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto; // 不允许拉伸
        width: auto !important;
        height: 28px;
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
            gap: 12px;

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
}
</style>
