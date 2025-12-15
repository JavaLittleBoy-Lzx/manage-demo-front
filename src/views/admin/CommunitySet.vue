<template>
  <div class="community-set-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/CommunityManage.svg" alt="社区设置" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>小区设置</h1>
            <p class="title-desc">管理小区基础信息配置，支持单个新增和批量导入</p>
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
              <!-- 搜索条件和按钮 -->
              <div class="search-row">
                <el-form-item label="地区选择" class="search-item">
                  <el-cascader v-model="querySelectedOptions" :options="options" @change="handleQueryChange"
                    placeholder="请选择省份/地市/区县" clearable class="search-cascader">
                  </el-cascader>
                </el-form-item>

                <el-form-item label="小区名称" class="search-item">
                  <el-select v-model="query.community" placeholder="请先选择地区后选择小区" clearable
                    :disabled="!querySelectedOptions || querySelectedOptions.length < 3" class="search-select">
                    <el-option v-for="item in communityList" :key="item" :label="item" :value="item">
                    </el-option>
                  </el-select>
                </el-form-item>

                <!-- 操作按钮紧跟搜索框 -->
                <div class="search-buttons-inline">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                    搜索
                  </el-button>
                  <el-button type="success" icon="Plus" @click="handleAdd" size="small">
                    新增
                  </el-button>
                  <el-button type="warning" icon="Upload" @click="handleBatAdd" size="small">
                    批量新增
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
            <span>小区信息列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>

        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable" :row-class-name="tableRowClassName"
            stripe>
            <!-- 地区信息列 -->
            <el-table-column label="地区信息" width="350" fixed="left">
              <template #default="{ row }">
                <div class="location-info-cell">
                  <div class="location-details">
                    <div class="location-path">
                      <el-tag type="primary" size="small">{{ row.province }}</el-tag>
                      <el-icon class="location-separator">
                        <ArrowRight />
                      </el-icon>
                      <el-tag type="success" size="small">{{ row.city }}</el-tag>
                      <el-icon class="location-separator">
                        <ArrowRight />
                      </el-icon>
                      <el-tag type="info" size="small">{{ row.district }}</el-tag>
                    </div>
                    <div class="community-name">{{ row.community }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 住址信息列 -->
            <el-table-column label="住址信息" width="200">
              <template #default="{ row }">
                <div class="address-info">
                  <div class="address-item">
                    <el-icon>
                      <House />
                    </el-icon>
                    <span>{{ row.building }}栋{{ row.units }}单元</span>
                  </div>
                  <div class="address-item">
                    <el-icon>
                      <Location />
                    </el-icon>
                    <span>{{ row.floor }}层{{ row.roomnumber }}房</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 审批状态列 -->
            <el-table-column label="审批状态" prop="isAudit" align="center" width="200">
              <template #default="{ row }">
                <el-tag type="danger" v-if="row.isAudit === '是'" effect="dark" size="large">需要审核</el-tag>
                <el-tag type="success" v-if="row.isAudit === '否'" effect="dark" size="large">无需审核</el-tag>
              </template>
            </el-table-column>

            <!-- 审核时间列 -->
            <el-table-column label="审核时间" width="300" align="center">
              <template #default="{ row }">
                <div v-if="row.isAudit === '是'" class="time-info">
                  <div class="time-item">
                    <el-icon>
                      <Timer />
                    </el-icon>
                    <span>开始：{{ row.auditStartTime }}</span>
                  </div>
                  <div class="time-item">
                    <el-icon>
                      <Timer />
                    </el-icon>
                    <span>结束：{{ row.auditEndTime }}</span>
                  </div>
                </div>
                <div v-else class="no-audit">
                  <span class="text-gray">无需审核</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="300" align="center" fixed="right">
              <template #default="{ row, $index }">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="handleEdit(row)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDelete($index, row.id)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination :current-page="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
              @current-change="handlePageChange">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量新增对话框 -->
    <el-dialog v-model="batVisible" title="批量增加小区信息" width="550px" class="modern-dialog" :close-on-click-modal="false">
      <el-form :model="form.batData" ref="formRef" :rules="rules" label-width="100px" class="modern-form">
        <!-- 地区信息 -->
        <div class="form-section">
          <h3 class="section-title">地区信息</h3>
          <div class="form-grid grid-2">
            <el-form-item label="省份地区" prop="province">
              <el-cascader :options="options" v-model="selectedOptions" @change="handleChange" placeholder="请选择省份/地市/区县"
                class="form-select" />
            </el-form-item>
            <el-form-item label="小区名称" prop="community">
              <el-input v-model="form.batData.community" placeholder="请输入小区名称" style="width: 40%;"/>
            </el-form-item>
          </div>
        </div>

        <!-- 批量范围设置 -->
        <div class="form-section">
          <h3 class="section-title">批量范围设置</h3>
          <div class="form-grid grid-2">
            <el-form-item label="楼栋范围">
              <div class="range-inputs">
                <el-input v-model="form.batData.buildingBegin" type="text" maxlength="2" placeholder="起始"
                style="width: 25%;" />
                <span style="margin: 0 10px;">至</span>
                <el-input v-model="form.batData.buildingEnd" type="text" maxlength="2" placeholder="结束"
                  style="width: 25%;"/>
              </div>
            </el-form-item>
            <el-form-item label="单元范围">
              <div class="range-inputs">
                <el-input v-model="form.batData.unitsBegin" type="text" maxlength="2" placeholder="起始"
                style="width: 25%;" />
                <span style="margin: 0 10px;">至</span>
                <el-input v-model="form.batData.unitsEnd" type="text" maxlength="2" placeholder="结束"
                style="width: 25%;" />
              </div>
            </el-form-item>
          </div>
          <div class="form-grid grid-2">
            <el-form-item label="楼层范围">
              <div class="range-inputs">
                <el-input v-model="form.batData.floorBegin" type="text" maxlength="2" placeholder="起始"
                style="width: 25%;" />
                <span style="margin: 0 10px;">至</span>
                <el-input v-model="form.batData.floorEnd" type="text" maxlength="2" placeholder="结束"
                style="width: 25%;" />
              </div>
            </el-form-item>
            <el-form-item label="房间号范围">
              <div class="range-inputs">
                <el-input v-model="form.batData.roomnumberBegin" type="text" maxlength="2" placeholder="起始"
                style="width: 25%;" />
                <span style="margin: 0 10px;">至</span>
                <el-input v-model="form.batData.roomnumberEnd" type="text" maxlength="2" placeholder="结束"
                style="width: 25%;" />
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 审批设置 -->
        <div class="form-section">
          <h3 class="section-title">审批设置</h3>
          <div class="form-grid grid-2">
            <el-form-item label="是否审批" prop="isAudit" class="radio-group-item">
              <el-radio-group v-model="form.batData.isAudit" @change="updateShowChangeBatDate" class="radio-group">
                <el-radio label="是">需要审批</el-radio>
                <el-radio label="否">无需审批</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="showBatDate" label="审批时间区间" prop="auditTime">
              <el-date-picker v-model="value2" type="datetimerange" :shortcuts="shortcuts" range-separator="--"
                start-placeholder="开始时间" end-placeholder="结束时间" class="form-date-picker" />
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batVisible = false" class="cancel-btn">
            取消
          </el-button>
          <el-button type="primary" @click="batSave" class="save-btn">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 单个新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.data.id ? '编辑小区信息' : '新增小区信息'" width="600px" class="modern-dialog"
      :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form :model="form.data" ref="formRef" :rules="rules" class="modern-form">
          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <Location />
              </el-icon>
              基础信息
            </h3>
            <div class="form-grid">
              <el-form-item label="省份地区" prop="province">
                <el-cascader size="large" :options="options" v-model="selectedOptions" @change="handleChange"
                  placeholder="请选择省份/地市/区县" class="form-cascader" />
              </el-form-item>
              <el-form-item label="小区名称" prop="community">
                <el-input v-model="form.data.community" placeholder="请输入小区名称" class="form-input" />
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <House />
              </el-icon>
              详细地址
            </h3>
            <div class="form-grid form-grid-4">
              <el-form-item label="楼栋" prop="building">
                <el-input v-model="form.data.building" type="text" maxlength="2" placeholder="楼栋号"
                  class="form-input-short" />
              </el-form-item>
              <el-form-item label="单元" prop="units">
                <el-input v-model="form.data.units" type="text" maxlength="2" placeholder="单元号"
                  class="form-input-short" />
              </el-form-item>
              <el-form-item label="楼层" prop="floor">
                <el-input v-model="form.data.floor" type="text" maxlength="2" placeholder="楼层"
                  class="form-input-short" />
              </el-form-item>
              <el-form-item label="房间号" prop="roomnumber">
                <el-input v-model="form.data.roomnumber" type="text" maxlength="2" placeholder="房间号"
                  class="form-input-short" />
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <CircleCheck />
              </el-icon>
              审批设置
            </h3>
            <div class="form-grid">
              <el-form-item label="是否审批" prop="isAudit">
                <el-radio-group v-model="form.data.isAudit" @change="updateShowChangeDate">
                  <el-radio label="是">需要审批</el-radio>
                  <el-radio label="否">无需审批</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="showChannelDate" label="审批时间区间" prop="auditTime">
                <el-date-picker v-model="value2" type="datetimerange" :shortcuts="shortcuts" range-separator="--"
                  start-placeholder="开始时间" end-placeholder="结束时间" class="form-date-picker" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="consoleForm()">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="confirm-btn" @click="save">
            <el-icon v-if="form.data.id">
              <Edit />
            </el-icon>
            <el-icon v-else>
              <Check />
            </el-icon>
            {{ form.data.id ? '更新' : '确定' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看审核原因对话框 -->
    <el-dialog v-model="viewShow" title="查看审核原因" width="500px" class="modern-dialog">
      <div class="dialog-content">
        <div class="view-content">
          <el-icon class="view-icon">
            <InfoFilled />
          </el-icon>
          <span class="view-text">{{ content }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="viewShow = false">
            <el-icon>
              <Close />
            </el-icon>
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
import { ElNotification } from 'element-plus'
import { regionDataPlus, CodeToText, TextToCode } from "element-china-area-data";
import {
  Search, ArrowDown, List, Edit, Delete, Plus, Upload,
  Location, House, Timer, ArrowRight, CircleCheck,
  Check, Close, InfoFilled
} from '@element-plus/icons-vue';
import { activityApi } from '../../api/activity';

const root = "/parking/community/";
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
  { label: "省份", prop: "province" },
  { label: "地市", prop: "city" },
  { label: "县区", prop: "district" },
  { label: "小区", prop: "community" },
  { label: "栋号", prop: "building" },
  { label: "单元", prop: "units" },
  { label: "楼层", prop: "floor" },
  { label: "房号", prop: "roomnumber" },
  { label: "是否审批", prop: "isAudit" },
  { label: "审核开始时间", prop: "auditStartTime" },
  { label: "审核结束时间", prop: "auditEndTime" }
];

const options = regionDataPlus;
const selectedOptions = ref([]);
const querySelectedOptions = ref([]);
const communityList = ref([]);
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
    isAudit: '',
    auditStartTime: '',
    auditEndTime: ''
  },
  batData: {
    id: '',
    province: '',
    city: '',
    district: '',
    community: '',
    buildingBegin: '',
    buildingEnd: '',
    unitsBegin: '',
    unitsEnd: '',
    floorBegin: '',
    floorEnd: '',
    roomnumberBegin: '',
    roomnumberEnd: '',
    isAudit: '',
    auditStartTime: '',
    auditEndTime: ''
  },
});

// 时间快捷选项
const shortcuts = [
  {
    text: '今天',
    value: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return [start, end];
    }
  },
  {
    text: '明天',
    value: () => {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    }
  },
  {
    text: '本周',
    value: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    }
  }
];

// 表单验证规则
const rules = {
  community: [
    { required: true, message: '请输入小区名称', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ]
};

const handleExport = () => {
  window.location.href = "http://www.xuerparking.cn:9999/purchase/exportPurchaseManagement";
};

// 重置表单
const onReset = () => {
  form.data.id = ''
  form.data.province = ''
  form.data.city = '',
    form.data.district = ''
  form.data.community = '',
    form.data.building = ''
  form.data.units = ''
  form.data.floor = '',
    form.data.roomnumber = '',
    form.data.isAudit = '',
    form.data.auditStartTime = '',
    form.data.auditEndTime = '',
    selectedOptions.value = [], //重新初始化
    querySelectedOptions.value = [], //重新初始化查询级联选择器
    communityList.value = [], //重新初始化小区列表
    form.batData.id = '',
    form.batData.province = '',
    form.batData.city = '',
    form.batData.district = '',
    form.batData.community = '',
    form.batData.buildingBegin = '',
    form.batData.buildingEnd = '',
    form.batData.unitsBegin = '',
    form.batData.unitsEnd = '',
    form.batData.floorBegin = '',
    form.batData.floorEnd = '',
    form.batData.roomnumberBegin = '',
    form.batData.roomnumberEnd = ''
  form.data.isAudit = ''
  form.data.auditStartTime = ''
  form.data.auditEndTime = ''
  value2.value = []
};

const handleChange = (arr) => {
  console.log(arr);
  form.data.province = CodeToText[arr[0]]
  form.data.city = CodeToText[arr[1]]
  form.data.district = CodeToText[arr[2]]
  form.batData.province = CodeToText[arr[0]]
  form.batData.city = CodeToText[arr[1]]
  form.batData.district = CodeToText[arr[2]]
};

const handleQueryChange = (arr) => {
  if (arr && arr.length > 0) {
    query.province = CodeToText[arr[0]] || '';
    query.city = arr.length > 1 ? CodeToText[arr[1]] || '' : '';
    query.district = arr.length > 2 ? CodeToText[arr[2]] || '' : '';

    // 清空小区选择
    query.community = '';
    communityList.value = [];

    // 如果选择了完整的省市区，则获取小区列表
    if (arr.length === 3) {
      getCommunityList();
    }
  } else {
    query.province = '';
    query.city = '';
    query.district = '';
    query.community = '';
    communityList.value = [];
  }
};

// 获取小区列表
const getCommunityList = () => {
  if (query.province && query.city && query.district) {
    request.get("/parking/community/community", {
      params: {
        province: query.province,
        city: query.city,
        district: query.district
      }
    }).then((res) => {
      // 从返回的Community对象数组中提取唯一的小区名称
      if (res.data && Array.isArray(res.data)) {
        const uniqueCommunities = [...new Set(res.data.map(item => item.community))];
        communityList.value = uniqueCommunities.filter(name => name && name.trim() !== '');
        console.log("小区列表已加载:", communityList.value);
      } else {
        communityList.value = [];
        console.log("返回数据格式异常或为空");
      }
    }).catch((error) => {
      console.error("获取小区列表失败:", error);
      communityList.value = [];
    });
  }
};

const query = reactive({
  province: '',
  city: '',
  district: '',
  community: '',
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
const batVisible = ref(false)
const viewShow = ref(false)
const content = ref('')
const content1 = ref('')

// 获取表格数据
const tableRowClassName = (rowIndex) => {
  if (rowIndex % 2 !== 0) {
    return 'light-row'
  } else {
    return 'aterrimus-row'
  }
};

const consoleForm = () => {
  if (form.data.id == null) {
    onReset();
  }
  dialogVisible.value = false
};

const getData = () => {
  request
    .get(root + "allpage", {
      params: query,
    })
    .then((res) => {
      tableData.value = res.data.records;
      pageTotal.value = res.data.total;
      console.log(res)
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
    if (query.province) searchConditions.push(`省份: ${query.province}`);
    if (query.city) searchConditions.push(`城市: ${query.city}`);
    if (query.district) searchConditions.push(`区县: ${query.district}`);
    if (query.community) searchConditions.push(`小区: ${query.community}`);
    
    const searchDescription = searchConditions.length > 0 
      ? `查询小区设置 (${searchConditions.join(', ')})` 
      : '查询所有小区设置';
    
    await activityApi.logCommunityOperation(
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
const handleDelete = (index, sid) => {
  // 获取要删除的小区信息，用于记录日志
  const communityInfo = tableData.value[index];
  
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
          const username = localStorage.getItem("ms_username") || "管理员";
          await activityApi.logCommunityOperation(
            userId,
            username,
            "删除",
            `删除了小区信息：${communityInfo.province}-${communityInfo.city}-${communityInfo.district}-${communityInfo.community}`,
            sid,
            JSON.stringify(communityInfo),
            null
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });
          
          ElMessage.success("删除成功");
          tableData.value.splice(index, 1);
        } else {
          ElMessage.error("删除失败");
        }
      } catch (error) {
        console.error("删除操作失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
    });
};

// 新增操作
const handleAdd = () => {
  dialogVisible.value = true;
  showChannelDate.value = false;
  onReset();
};

const handleBatAdd = () => {
  batVisible.value = true;
  showChannelDate.value = false;
  onReset();
};

const value2 = ref([2]);
const showChannelDate = ref(false);
const showBatDate = ref(false);

// 表格编辑时弹窗和保存
const editVisible = ref(false);
const handleEdit = (row) => {
  console.log(row)
  dialogVisible.value = true
  form.data.id = row.id
  form.data.province = row.province
  form.data.city = row.city
  form.data.district = row.district
  form.data.community = row.community
  form.data.building = row.building
  form.data.units = row.units
  form.data.floor = row.floor
  form.data.roomnumber = row.roomnumber
  form.data.isAudit = row.isAudit
  if (row.isAudit == '是') {
    showChannelDate.value = true;
    showBatDate.value = true;
    value2.value[0] = row.auditStartTime
    value2.value[1] = row.auditEndTime
  } else if (row.isAudit == '否') {
    showChannelDate.value = false;
    showBatDate.value = false;
  } else {
    showChannelDate.value = false;
    showBatDate.value = false;
  }
  selectedOptions.value = [TextToCode[row.province].code, TextToCode[row.province][row.city].code,
  TextToCode[row.province][row.city][row.district].code]
};

const provinceList = ref([]);
const formRef = ref(null);

const updateShowChangeDate = () => {
  if (form.data.isAudit === '是') {
    showChannelDate.value = true;
  } else if (form.data.isAudit === '否') {
    showChannelDate.value = false;
  }
};

const updateShowChangeBatDate = () => {
  if (form.batData.isAudit === '是') {
    showBatDate.value = true;
  } else if (form.batData.isAudit === '否') {
    showBatDate.value = false;
  }
};

const save = () => {
  if (form.data.community == "") {
    ElMessage.error("小区不能为空！");
    return;
  }
  if (form.data.province == "") {
    ElMessage.error("省份不能为空！");
    return;
  }
  if (form.data.building == "") {
    ElMessage.error("楼栋号不能为空！");
    return;
  }
  if (form.data.units == "") {
    ElMessage.error("单元号不能为空！");
    return;
  }
  if (form.data.floor == "") {
    ElMessage.error("楼层号不能为空！");
    return;
  }
  if (form.data.roomnumber == "") {
    ElMessage.error("房间号不能为空！");
    return;
  }
  if (form.data.isAudit == "") {
    ElMessage.error("请选择是否需要审核");
    return;
  }
  console.log(form.data.province)

  // 表单校验
  formRef.value.validate(async (valid) => {
    const startDate = value2.value[0]
    const endDate = value2.value[1]
    //格式化开始时间
    const newStartDate = new Date(startDate);
    const formattedStartDate = newStartDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
    //格式化结束时间
    const newEndDate = new Date(endDate);
    const formattedEndDate = newEndDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
    console.log(form.data.yardName)
    console.log(formattedStartDate)
    form.data.auditStartTime = formattedStartDate
    console.log(formattedEndDate)
    form.data.auditEndTime = formattedEndDate
    if (valid) {
      var method = form.data.id === "" ? "POST" : "PUT";
      const isEdit = form.data.id !== "";
      
      try {
        const res = await request({
          url: "/parking/community",
          method: method,
          data: form.data,
        });
        
        console.log(res);
        form.data = {}
        if (res.code != null) {
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "管理员";
          const action = isEdit ? "修改" : "添加";
          const description = isEdit 
            ? `修改了小区信息：${form.data.province}-${form.data.city}-${form.data.district}-${form.data.community}`
            : `新增了小区信息：${form.data.province}-${form.data.city}-${form.data.district}-${form.data.community}`;
          
          await activityApi.logCommunityOperation(
            userId,
            username,
            action,
            description,
            res.data?.id || form.data.id,
            isEdit ? JSON.stringify(form.data) : null,
            JSON.stringify(form.data)
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });
          
          getData()
          ElMessage.success("提交成功！");
          dialogVisible.value = false
        } else {
          dialogVisible.value = false
          ElMessage.error(res.data.msg);
        }
      } catch (error) {
        console.error("保存操作失败:", error);
        ElMessage.error("提交失败");
        dialogVisible.value = false
      }
    } else {
      return false;
    }
  });
};

const batSave = () => {
  if (form.batData.community == "") {
    ElMessage.error("小区不能为空！");
    return;
  }
  if (form.batData.province == "") {
    ElMessage.error("省份不能为空！");
    return;
  }
  if (form.batData.buildingBegin == "") {
    ElMessage.error("楼栋号不能为空！");
    return;
  }
  if (form.batData.buildingEnd == "") {
    ElMessage.error("楼栋号不能为空！");
    return;
  }
  if (form.batData.buildingBegin > form.batData.buildingEnd) {
    ElMessage.error("楼栋号开始不能大于结束！");
    return;
  }
  if (form.batData.unitsBegin == "") {
    ElMessage.error("单元号不能为空！");
    return;
  }
  if (form.batData.unitsEnd == "") {
    ElMessage.error("单元号不能为空！");
    return;
  }
  if (form.batData.unitsBegin > form.batData.unitsEnd) {
    ElMessage.error("单元号开始不能大于结束！");
    return;
  }
  if (form.batData.floorBegin == "") {
    ElMessage.error("楼层号不能为空！");
    return;
  }
  if (form.batData.floorEnd == "") {
    ElMessage.error("楼层号不能为空！");
    return;
  }
  if (form.batData.floorBegin > form.batData.floorEnd) {
    ElMessage.error("楼层号开始不能大于结束！");
    return;
  }
  if (form.batData.roomnumberBegin > form.batData.roomnumberEnd) {
    ElMessage.error("房间号开始不能大于结束！");
    return;
  }
  if (form.batData.isAudit == "") {
    ElMessage.error("请选择是否需要审核");
    return;
  }

  // 表单校验
  formRef.value.validate(async (valid) => {
    batVisible.value = false
    // 提醒用户正在添加小区信息
    ElNotification({
      title: '添加通知',
      message: '正在添加小区信息，请稍后...',
      type: 'warning',
      showClose: false,
    })
    const startDate = value2.value[0]
    const endDate = value2.value[1]
    //格式化开始时间
    const newStartDate = new Date(startDate);
    const formattedStartDate = newStartDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
    //格式化结束时间
    const newEndDate = new Date(endDate);
    const formattedEndDate = newEndDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
    console.log(form.data.yardName)
    console.log(formattedStartDate)
    form.batData.auditStartTime = formattedStartDate
    console.log(formattedEndDate)
    form.batData.auditEndTime = formattedEndDate
    if (valid) {
      var method = "POST";
      
      try {
        const res = await request({
          url: "/parking/community/insertBatCommunity",
          method: method,
          data: form.batData,
        });
        
        if (res.code != null && res.code === '0') {
          // 获取统计数据
          const data = res.data || {};
          const totalGenerated = data.totalGenerated || 0;
          const totalSaved = data.totalSaved || 0;
          const totalDuplicate = data.totalDuplicate || 0;
          const message = data.message || '批量添加完成！';
          
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "管理员";
          await activityApi.logCommunityOperation(
            userId,
            username,
            "批量添加",
            `批量添加小区信息：${message}`,
            null,
            null,
            JSON.stringify({
              ...form.batData,
              stats: { totalGenerated, totalSaved, totalDuplicate }
            })
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });
          
          // 刷新数据
          getData()
          
          // 根据结果显示不同的通知
          if (totalSaved === 0 && totalDuplicate > 0) {
            // 所有记录都重复
            ElNotification({
              title: '批量添加完成',
              message: `所有${totalGenerated}条记录均已存在，未添加新数据。`,
              type: 'warning',
              duration: 5000,
              showClose: true,
            })
          } else if (totalSaved === totalGenerated) {
            // 全部成功
            ElNotification({
              title: '批量添加成功',
              message: `成功添加${totalSaved}条新记录！`,
              type: 'success',
              duration: 4000,
              showClose: true,
            })
          } else {
            // 部分成功
            ElNotification({
              title: '批量添加完成',
              message: `共生成${totalGenerated}条记录，成功添加${totalSaved}条，重复跳过${totalDuplicate}条。`,
              type: 'info',
              duration: 5000,
              showClose: true,
            })
          }
          
          // 清空表单数据
          form.batData = {}
          batVisible.value = false
        } else {
          batVisible.value = false
          ElMessage.error(res.msg || '批量添加失败');
        }
        console.log(res)
        console.log(form.batData)
      } catch (error) {
        console.error("批量添加操作失败:", error);
        ElMessage.error("批量添加失败");
        batVisible.value = false
      }
    } else {
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.community-set-management {
  padding: 0 20px 20px 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding:10px 12px;
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

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;

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

          .search-cascader,
          .search-select {
            width: 280px;
          }

          .search-input {
            width: 220px;
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
.location-info-cell {
  .location-details {
    .location-path {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .location-separator {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    .community-name {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }
  }
}

.address-info {
  .address-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 13px;
    color: #64748b;

    .el-icon {
      font-size: 14px;
      color: #3b82f6;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.time-info {
  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
    color: #64748b;

    .el-icon {
      font-size: 12px;
      color: #f59e0b;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.no-audit {
  text-align: center;
  padding: 8px;

  .text-gray {
    color: #94a3b8;
    font-style: italic;
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

  // .modern-form {
  //   .form-section {
  //     margin-bottom: 32px;

  //     &:last-child {
  //       margin-bottom: 0;
  //     }

  //     .section-title {
  //       display: flex;
  //       align-items: center;
  //       gap: 12px;
  //       font-size: 16px;
  //       font-weight: 600;
  //       color: #374151;
  //       margin-bottom: 20px;
  //       padding-bottom: 12px;
  //       border-bottom: 2px solid transparent;
  //       background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%) bottom;
  //       background-size: 100% 2px;
  //       background-repeat: no-repeat;

  //       .el-icon {
  //         font-size: 18px;
  //         color: #3b82f6;
  //       }
  //     }

  //     .form-grid {
  //       display: grid;
  //       grid-template-columns: 1fr 1fr;
  //       gap: 20px;

  //       &.grid-1 {
  //         grid-template-columns: 1fr;
  //       }

  //       &.grid-2 {
  //         grid-template-columns: 1fr 1fr;
  //       }

  //       &.form-grid-4 {
  //         grid-template-columns: repeat(4, 1fr);
  //       }


  //       .el-form-item {
  //         margin-bottom: 0;

  //         :deep(.el-form-item__label) {
  //           font-weight: 600;
  //           color: #374151;
  //         }

  //         .form-cascader,
  //         .form-select,
  //         .form-input,
  //         .form-date-picker {
  //           width: 70%;
  //         }

  //         .form-input-short {
  //           width: 70px !important;
  //         }
  //       }
  //     }

  //     // 单选框样式
  //     .radio-group {
  //       :deep(.el-radio) {
  //         margin-right: 24px;

  //         .el-radio__label {
  //           font-weight: 500;
  //         }
  //       }
  //     }

  //     // 配置选项样式优化
  //     .radio-group-item {
  //       :deep(.el-form-item__label) {
  //         white-space: nowrap;
  //         font-weight: 500;
  //         color: #606266;
  //       }
  //     }
  //   }
  // }

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

  .view-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;

    .view-icon {
      font-size: 24px;
      color: #3b82f6;
    }

    .view-text {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-set-management {
    padding: 16px;
  }

  .page-header {
    padding: 20px;

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

      .search-item {

        .search-cascader,
        .search-select,
        .search-input {
          width: 100%;
        }
      }

      .search-buttons-inline {
        margin-left: 0;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }

  .modern-dialog {
    .dialog-content {
      padding: 20px;
    }

    .modern-form {
      .form-section {
        .form-grid {
          grid-template-columns: 1fr;

          &.form-grid-4 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .batch-range-grid-compact {
          .range-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      }
    }
  }
}

/* 深色模式适配 */
.dark {
  .community-set-management {
    background: #0f172a;
  }

  .page-header {
    background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
  }

  .search-panel,
  .table-panel {
    background: #1e293b;
    border: 1px solid #334155;

    .search-panel-header,
    .table-panel-header {
      background: #334155;
      border-bottom-color: #475569;
    }
  }

  .modern-dialog {
    :deep(.el-dialog) {
      background: #1e293b;
      border: 1px solid #334155;

      .el-dialog__header {
        background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
      }
    }

    .dialog-footer {
      background: #334155;
      border-top-color: #475569;
    }
  }
}

/* 表格行样式优化 */
:deep(.light-row) {
  background: #f8fafc !important;
}

:deep(.aterrimus-row) {
  background: white !important;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-table) {

  .el-table__header tr,
  .el-table__header th {
    padding: 0;
    height: 48px;
    font-size: 14px;
    background-color: #f8fafc !important;
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;

  &.is-link {
    padding: 8px 12px;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 0 1px #3b82f6;
  }
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #3b82f6;
}

:deep(.el-cascader) {
  .el-input__wrapper {

    &:hover,
    &.is-focus {
      box-shadow: 0 0 0 1px #3b82f6;
    }
  }
}
</style>