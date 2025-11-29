<template>
  <div class="vehicle-reservation-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <el-icon class="header-icon">
              <CreditCard />
            </el-icon>
          </div>
          <div class="title-text">
            <h1>外来车辆预约管理</h1>
            <p class="title-desc">管理外来车辆预约信息，支持批量操作和超时清理</p>
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
                <el-form-item label="车场名称" class="search-item">
                  <el-select v-model="query.yardName" placeholder="请选择车场名称" clearable class="search-select">
                    <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                      :value="item.yardName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="车牌号码" class="search-item">
                  <el-input v-model="query.plateNumber" placeholder="请输入车牌号码" clearable class="search-input" />
                </el-form-item>

                <!-- 操作按钮紧跟搜索框 -->
                <div class="search-buttons-inline">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                    搜索
                  </el-button>
                  <el-button type="success" icon="Clock" @click="timeOutCleanup()" size="small">
                    超时清理
                  </el-button>
                  <el-button type="danger" icon="Delete" @click="delBatch()" :disabled="selectData.length === 0"
                    size="small">
                    批量删除 ({{ selectData.length }})
                  </el-button>
                  <el-button type="primary" icon="Plus" @click="handleAdd" size="small">
                    新增预约
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
            <span>预约列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>
        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable" @selection-change="selectChanged"
            :row-class-name="tableRowClassName" :cell-style="cellStyle">
            <el-table-column type="selection" width="55" align="center" />
            <!-- 车辆信息列 -->
            <el-table-column label="车辆信息" width="151" fixed="left">
              <template #default="{ row }">
                <div class="vehicle-info-cell">
                  <div class="vehicle-details">
                    <div class="car-number-container">
                      <span :class="`plate-number ${getPlateType(row.plateNumber)}`">
                        {{ row.plateNumber }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 商户名称列 -->
            <el-table-column label="商户名称" width="150" align="center">
              <template #default="{ row }">
                <div class="merchant-name">{{ row.merchantName }}</div>
              </template>
            </el-table-column>
            <!-- 通知人姓名列 -->
            <el-table-column label="通知人" width="120" align="center">
              <template #default="{ row }">
                <div class="notifier-name">{{ row.notifierName }}</div>
              </template>
            </el-table-column>
            <!-- 预约时间列 -->
            <el-table-column label="预约时间" width="160" align="center">
              <template #default="{ row }">
                <div class="time-info-single">
                  {{ row.appointmentTime }}
                </div>
              </template>
            </el-table-column>
            <!-- 入场状态列 -->
            <el-table-column label="入场状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.reserveFlag === 1 ? 'success' : 'danger'" effect="dark" size="small"
                  class="status-tag">
                  {{ row.reserveFlag === 1 ? '已入场' : '未入场' }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- 备注列 -->
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <div class="remark-text">{{ row.remark || '无' }}</div>
              </template>
            </el-table-column>
            <!-- 修改时间列 -->
            <el-table-column label="修改时间" width="160" align="center">
              <template #default="{ row }">
                <div class="time-info-single">{{ row.updateTime }}</div>
              </template>
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" icon="Edit" @click="handleEdit(row)" class="action-btn">
                    编辑
                  </el-button>
                  <el-button type="success" size="small" icon="Position" @click="handleReservation(row)"
                    class="action-btn" :disabled="row.reserveFlag === 1">
                    入场
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination :current-page="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
              @current-change="handlePageChange" background />
          </div>
        </div>
      </div>

      <!-- 新增预约对话框 -->
      <el-dialog title="新增外来车辆预约" v-model="dialogVisible" width="700px" :close-on-click-modal="false"
        class="modern-dialog reservation-dialog" destroy-on-close>
        <div class="dialog-content">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-="120px" class="modern-form">
            <!-- 车场信息区域 -->
            <div class="form-section">
              <h3 class="section-title">车场信息</h3>
              <div class="form-grid grid-2">
                <el-form-item label="车场名称" prop="yardName">
                  <el-select v-model="form.data.yardName" placeholder="请选择车场名称" @change="changeYardName"
                    class="form-select">
                    <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                      :value="item.yardName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="车场编号" prop="yardCode">
                  <el-input v-model="form.data.yardCode" disabled class="form-input" />
                </el-form-item>
              </div>
            </div>

            <!-- 车辆信息区域 -->
            <div class="form-section">
              <h3 class="section-title">车辆信息</h3>
              <el-form-item label="车牌号码" prop="plateNumber">
                <div class="plate-input-container">
                  <el-input v-model="form.data.plateNumber" placeholder="请输入车牌号码" @input="convertToUpperCase"
                    @paste="handlePaste" maxlength="15" class="plate-input" />
                  <div class="plate-preview" v-if="form.data.plateNumber && form.data.plateNumber.trim()">
                    <div :class="`plate-number-preview ${getPlateType(form.data.plateNumber)}`">
                      {{ form.data.plateNumber }}
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>

            <!-- 联系信息区域 -->
            <div class="form-section">
              <h3 class="section-title">联系信息</h3>
              <div class="form-grid grid-2">
                <el-form-item label="商户名称" prop="merchantName">
                  <el-select v-model="form.data.merchantName" placeholder="请选择商户名称" @change="changeMerchantName"
                    class="form-select">
                    <el-option v-for="item in merchantNameList" :key="item.merchantName" :label="item.merchantName"
                      :value="item.merchantName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="通知人姓名" prop="notifierName">
                  <el-select v-model="form.data.notifierName" placeholder="请选择通知人" class="form-select">
                    <el-option v-for="item in notifierNameList" :key="item.notifierName" :label="item.notifierName"
                      :value="item.notifierName" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 预约详情区域 -->
            <div class="form-section">
              <h3 class="section-title">预约详情</h3>
              <div class="form-grid grid-1">
                <el-form-item label="预约时间" prop="appointmentTime">
                  <el-date-picker v-model="form.data.appointmentTime" type="datetime" placeholder="请选择预约时间"
                    format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" class="form-date-picker" />
                </el-form-item>
              </div>

              <div class="form-grid grid-1">
                <el-form-item label="备注信息" prop="remark">
                  <el-input type="textarea" v-model="form.data.remark" placeholder="请输入备注信息" :rows="3"
                    class="form-textarea" />
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="display()" size="large" class="cancel-btn">
              <el-icon>
                <Close />
              </el-icon>
              取消
            </el-button>
            <el-button type="primary" @click="save" size="large" class="confirm-btn">
              <el-icon>
                <Check />
              </el-icon>
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 修改预约对话框 -->
      <el-dialog title="修改外来车辆预约" v-model="dialogVisibleUpdate" width="700px" :close-on-click-modal="false"
        class="modern-dialog reservation-dialog" destroy-on-close>
        <div class="dialog-content">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-width="120px" class="modern-form">
            <!-- 车场信息区域 -->
            <div class="form-section">
              <h3 class="section-title">车场信息</h3>
              <div class="form-grid grid-2">
                <el-form-item label="车场名称" prop="yardName">
                  <el-select v-model="form.data.yardName" placeholder="请选择车场名称" @change="changeYardName"
                    class="form-select">
                    <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                      :value="item.yardName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="车场编号" prop="yardCode">
                  <el-input v-model="form.data.yardCode" disabled class="form-input" />
                </el-form-item>
              </div>
            </div>

            <!-- 车辆信息区域 -->
            <div class="form-section">
              <h3 class="section-title">车辆信息</h3>
              <el-form-item label="车牌号码" prop="plateNumber">
                <div class="plate-input-container">
                  <el-input v-model="form.data.plateNumber" placeholder="请输入车牌号码" @input="convertToUpperCase"
                    @paste="handlePaste" maxlength="15" class="plate-input" />
                  <div class="plate-preview" v-if="form.data.plateNumber && form.data.plateNumber.trim()">
                    <div :class="`plate-number-preview ${getPlateType(form.data.plateNumber)}`">
                      {{ form.data.plateNumber }}
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>

            <!-- 联系信息区域 -->
            <div class="form-section">
              <h3 class="section-title">联系信息</h3>
              <div class="form-grid grid-2">
                <el-form-item label="商户名称" prop="merchantName">
                  <el-select v-model="form.data.merchantName" placeholder="请选择商户名称" @change="changeMerchantName"
                    class="form-select">
                    <el-option v-for="item in merchantNameList" :key="item.merchantName" :label="item.merchantName"
                      :value="item.merchantName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="通知人姓名" prop="notifierName">
                  <el-select v-model="form.data.notifierName" placeholder="请选择通知人" class="form-select">
                    <el-option v-for="item in notifierNameList" :key="item.notifierName" :label="item.notifierName"
                      :value="item.notifierName" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 预约详情区域 -->
            <div class="form-section">
              <h3 class="section-title">预约详情</h3>
              <div class="form-grid grid-1">
                <el-form-item label="预约时间" prop="appointmentTime">
                  <el-date-picker v-model="form.data.appointmentTime" type="datetime" placeholder="请选择预约时间"
                    format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" class="form-date-picker" />
                </el-form-item>
              </div>

              <div class="form-grid grid-1">
                <el-form-item label="备注信息" prop="remark">
                  <el-input type="textarea" v-model="form.data.remark" placeholder="请输入备注信息" :rows="3"
                    class="form-textarea" />
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisibleUpdate = false" size="large" class="cancel-btn">
              <el-icon>
                <Close />
              </el-icon>
              取消
            </el-button>
            <el-button type="primary" @click="update" size="large" class="confirm-btn">
              <el-icon>
                <Edit />
              </el-icon>
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 超时清理对话框 -->
      <el-dialog v-model="dialogTableVisible" title="预约超时车辆删除" :before-close="handleBeforeClose" width="1000px"
        class="modern-dialog">
        <div class="timeout-form">
          <el-form :model="formClean">
            <el-form-item label="车辆超时时间" :label-width="formLabelWidth" size="large">
              <div class="timeout-controls">
                <el-select v-model="formClean.timeOutInterval" placeholder="请选择预约车辆超时时间" style="width: 200px">
                  <el-option label="6小时" value="6" />
                  <el-option label="9小时" value="9" />
                  <el-option label="12小时" value="12" />
                  <el-option label="24小时" value="24" />
                  <el-option label="36小时" value="36" />
                  <el-option label="48小时" value="48" />
                </el-select>
                <el-button type="primary" @click="selectTimeOutTables()">查询</el-button>
                <el-button type="danger" @click="resetTimeOut()">重置</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="gridData" v-if="tableVisible" @selection-change="handleSelectionChange"
          ref="multipleTimeOutTable" class="timeout-table">
          <el-table-column type="selection" width="55" />
          <el-table-column property="yardName" label="车场名称" width="150" />
          <el-table-column property="plateNumber" label="车牌号码" />
          <el-table-column property="appointmentTime" label="预约时间" />
          <el-table-column property="timeOutInterval" label="超时时间" />
        </el-table>

        <template #footer v-if="tableVisible">
          <div class="dialog-footer">
            <el-button @click="tableVisible = false">取消删除</el-button>
            <el-button type="primary" @click="cleanUp()">确认删除</el-button>
          </div>
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
import XLSX from "xlsx";
import { CreditCard, Search, ArrowDown, List, Clock, Edit, Position, Plus, Delete, Location, User, Close, Check } from "@element-plus/icons-vue";
import { activityApi } from "@/api/activity";

const root = "/parking/vehicleReservation/";
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = [
  { label: "车场名称", prop: "yardName" },
  { label: "车牌号码", prop: "plateNumber" },
  { label: "商户名称", prop: "merchantName" },
  { label: "通知人姓名", prop: "notifierName" },
  { label: "预约时间", prop: "appointmentTime" },
  { label: "备注", prop: "remark" },
  { label: "修改时间", prop: "updateTime" },
];

const rules = {
  yardName: [{ required: true, message: "请选择车场名称", trigger: "change" }],
  plateNumber: [{ required: true, message: "请输入车牌号", trigger: "blur" }],
  merchantName: [{ required: true, message: "请选择商户名称", trigger: "change" }],
  notifierName: [{ required: true, message: "请选择通知人姓名", trigger: "change" }],
  appointmentTime: [{ required: true, message: "请选择预约时间", trigger: "change" }],
  remark: [{ required: true, message: "请输入备注信息", trigger: "blur" }],
};

const form = reactive({
  data: {
    id: '',
    yardCode: '',
    yardName: '',
    channelName: '',
    plateNumber: '',
    vehicleClassification: '',
    merchantName: '',
    releaseReason: '',
    notifierName: '',
    enterTime: '',
    leaveTime: '',
    remark: '',
    appointmentTime: "",
    reserveFlag: -1
  },
});

const formClean = reactive({
  timeOutInterval: ''
});

const query = reactive({
  plateNumber: "",
  yardName: "",
  pageNum: 1,
  pageSize: 10,
  orderBy: "createTime", // 按创建时间排序
  orderDirection: "desc" // 倒序排列，最新的在前
});

const tableData = ref([]);
const selectData = ref([]);
const selectTimeOutData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
const dialogVisibleUpdate = ref(false)
const dialogTableVisible = ref(false);
const tableVisible = ref(false);
const formLabelWidth = '100px'
const gridData = ref([]);
const searchPanelExpanded = ref(true);

// 保持所有原有的方法和数据处理逻辑
const tableRowClassName = ({ row, rowIndex }) => {
  if ((rowIndex + 1) % 2 == 0) {
    return 'odd-row';
  } else if ((rowIndex + 1) % 2 != 0) {
    return 'even-row';
  }
};

const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let style = { padding: '8px 12px' }
  return style
};

const onReset = () => {
  form.data.id = ''
  form.data.yardCode = ''
  form.data.yardName = ''
  form.data.channelName = ''
  form.data.plateNumber = ''
  form.data.vehicleClassification = ''
  form.data.merchantName = ''
  form.data.releaseReason = ''
  form.data.notifierName = ''
  form.data.remark = ''
};

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

const handleSearch = async () => {
  try {
    // 记录查询操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";

    // 构建查询条件描述
    const searchConditions = [];
    if (query.yardName) searchConditions.push(`车场名称: ${query.yardName}`);
    if (query.plateNumber) searchConditions.push(`车牌号: ${query.plateNumber}`);

    const searchDescription = searchConditions.length > 0
      ? `查询外来车辆预约 (${searchConditions.join(', ')})`
      : '查询所有外来车辆预约';

    await activityApi.logVehicleReservationOperation(
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

const handleSizeChange = (val) => {
  query.pageSize = val;
  getData();
};

const handlePageChange = (val) => {
  query.pageNum = val;
  getData();
};

const handleReservation = (row) => {
  ElMessageBox.confirm("确定要将此条数据添加入场吗？", "提示", {
    type: "success",
  })
    .then(() => {
      request.post("/parking/vehicleReservation/addReservation", row).then((res) => {
        if (!res.data.data) {
          ElMessage.success("添加入场成功");
          getData();
        } else {
          ElMessage.error("添加入场失败");
        }
      });
    })
    .catch(() => {
    });
};

const display = () => {
  dialogVisible.value = false;
  form.data.appointmentTime = ''
}

const selectChanged = (val) => {
  selectData.value = val;
};

const delBatch = () => {
  const ids = selectData.value.map(item => item.id);
  request.post('/parking/vehicleReservation/batchDelete', ids)
    .then(response => {
      if (response.code == 0) {
        ElMessage.success('批量删除成功!');
        getData();
      } else {
        ElMessage.error(response.msg);
      }
    })
};

const handleAdd = () => {
  onReset();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogVisibleUpdate.value = true
  form.data.id = row.id
  form.data.yardCode = row.yardCode
  form.data.yardName = row.yardName
  form.data.channelName = row.channelName
  form.data.plateNumber = row.plateNumber
  form.data.vehicleClassification = row.vehicleClassification
  form.data.merchantName = row.merchantName
  form.data.releaseReason = row.releaseReason
  form.data.notifierName = row.notifierName
  form.data.appointmentTime = row.appointmentTime
  form.data.remark = row.remark
};

const yardCodeList = ref([]);
const yardNameList = ref([]);
const channelNameList = ref([]);
const vehicleClassificationList = ref([]);
const merchantNameList = ref([]);
const releaseReasonList = ref([]);
const notifierNameList = ref([]);
const appointmentTimeList = ref([]);

// 超时清理相关方法
const timeOutCleanup = () => {
  dialogTableVisible.value = true;
};

const selectTimeOutTables = () => {
  tableVisible.value = true;
  request
    .get(root + "timeOutCleanUp", {
      params: {
        timeOutInterval: formClean.timeOutInterval
      },
    })
    .then((res) => {
      gridData.value = res.data;
    });
}

const handleBeforeClose = () => {
  formClean.timeOutInterval = '';
  dialogTableVisible.value = false;
  tableVisible.value = false;
};

const resetTimeOut = () => {
  formClean.timeOutInterval = '';
  tableVisible.value = false;
};

const handleSelectionChange = (val) => {
  selectTimeOutData.value = val;
};

const cleanUp = () => {
  const ids = selectTimeOutData.value.map(item => item.id);
  request.post('/parking/vehicleReservation/batchDelete', ids)
    .then(response => {
      if (response.code == 0) {
        ElMessage.success('超时信息删除成功!');
        tableVisible.value = false;
        formClean.timeOutInterval = '';
      } else {
        ElMessage.error(response.msg);
      }
    })
};

// 获取下拉数据
request.get("/parking/yardInfo/yardName").then((res) => {
  yardNameList.value = res.data;
});

request.get("/parking/vehicleClassification/vehicleClassification").then((res) => {
  vehicleClassificationList.value = res.data;
});

request.get("/parking/notifierInfo/merchantName").then((res) => {
  merchantNameList.value = res.data;
});

request.get("/parking/releaseReason/releaseReason").then((res) => {
  releaseReasonList.value = res.data;
});

const changeYardName = () => {
  request
    .get("/parking/yardInfo/yardCode", {
      params: {
        yardName: form.data.yardName
      },
    })
    .then((res) => {
      form.data.channelName = "";
      form.data.vehicleClassification = "";
      form.data.notifierName = "";
      form.data.merchantName = "";
      form.data.releaseReason = "";
      form.data.yardCode = res.data[0]

      request
        .get("/parking/vehicleReservation/aikeGetChannelInfo", {
          params: {
            yardCode: res.data[0]
          },
        })
        .then((res) => {
          form.data.vehicleClassification = "";
          const date = new Date();
          const formattedDate = formatDate(date);
          form.data.appointmentTime = formattedDate;

          if (form.data.yardName == '四季上东') {
            form.data.merchantName = "四季一期";
          } else if (form.data.yardName == '爱建锦园') {
            form.data.merchantName = "爱建锦园3号场";
          } else {
            form.data.merchantName = form.data.yardName;
          }

          request
            .get("/parking/notifierInfo/notifierName", {
              params: {
                merchantName: form.data.merchantName
              },
            })
            .then((res) => {
              form.data.releaseReason = "";
              notifierNameList.value = res.data;
              form.data.notifierName = res.data[0].notifierName;
            });
          form.data.releaseReason = "";
          form.data.remark = "放行";
          channelNameList.value = res.data
        });
    });
};

const changeMerchantName = () => {
  request
    .get("/parking/notifierInfo/notifierName", {
      params: {
        merchantName: form.data.merchantName
      },
    })
    .then((res) => {
      form.data.notifierName = "";
      form.data.releaseReason = "";
      notifierNameList.value = res.data;
    });
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const convertToUpperCase = () => {
  // 去除所有空格、特殊符号（-、.、_等），只保留中文、字母、数字
  form.data.plateNumber = form.data.plateNumber.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toUpperCase();
  
  // 根据中国车牌规范，将容易混淆的字母进行转换
  // O -> 0, I -> 1
  form.data.plateNumber = form.data.plateNumber
    .replace(/O/g, '0')  // 字母O转换为数字0
    .replace(/I/g, '1'); // 字母I转换为数字1
  
  // 确保长度不超过8位
  if (form.data.plateNumber.length > 8) {
    form.data.plateNumber = form.data.plateNumber.substring(0, 8);
  }
};

const handlePaste = (event) => {
  // 阻止默认粘贴行为
  event.preventDefault();

  // 获取剪贴板内容
  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData('text');

  // 处理粘贴的内容：去除所有空格、特殊符号（-、.、_等），只保留中文、字母、数字，转换为大写
  let processedText = pastedText
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')  // 去除所有非中文、字母、数字的字符（包括-、.、_、空格等）
    .toUpperCase();
  
  // 根据中国车牌规范，将容易混淆的字母进行转换
  // O -> 0, I -> 1
  processedText = processedText
    .replace(/O/g, '0')  // 字母O转换为数字0
    .replace(/I/g, '1'); // 字母I转换为数字1
    
  const finalText = processedText.length > 8 ? processedText.substring(0, 8) : processedText;

  // 设置处理后的值
  form.data.plateNumber = finalText;
};

const formRef = ref(null);

const save = () => {
  if (form.data.plateNumber.length < 7 || form.data.plateNumber.length > 8) {
    ElMessage.error('车牌号长度必须为7-8位');
    return;
  }

  formRef.value.validate((valid) => {
    if (valid) {
      request({
        url: "/parking/blackList/getParkBlack",
        method: "GET",
        params: {
          carCode: form.data.plateNumber,
          parkCodeList: form.data.yardCode
        },
      }).then((res) => {
        if (res.data.data.count != 0) {
          ElMessageBox.confirm(
            '当前车辆为黑名单车辆，是否需要添加?',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              saveReservation();
            })
            .catch(() => {
              ElMessage({
                type: 'error',
                message: '取消添加！',
              })
            })
        } else {
          saveReservation();
        }
      });
    }
  });
};

const saveReservation = () => {
  request({
    url: "/parking/vehicleReservation/insert",
    method: "POST",
    data: {
      id: form.data.id,
      yardCode: form.data.yardCode,
      yardName: form.data.yardName,
      channelName: form.data.channelName,
      plateNumber: form.data.plateNumber,
      vehicleClassification: form.data.vehicleClassification,
      merchantName: form.data.merchantName,
      releaseReason: form.data.releaseReason,
      notifierName: form.data.notifierName,
      appointmentTime: form.data.appointmentTime,
      remark: form.data.remark
    },
  }).then((res) => {
    if (res.data.code == 0) {
      // 记录活动日志
      const userId = localStorage.getItem("ms_userid") || "unknown";
      const username = localStorage.getItem("ms_username") || "管理员";

      activityApi.logAppointmentOperation(
        userId,
        username,
        "添加",
        `新增了车辆预约 ${form.data.plateNumber}`,
        res.data.data?.id || form.data.id,
        null,
        JSON.stringify(form.data)
      ).catch(err => {
        console.error("记录活动日志失败:", err);
      });

      form.data = {}
      getData()
      ElMessage.success("添加成功！");
      formRef.value.resetFields();
      dialogVisible.value = false
    } else {
      dialogVisible.value = false
      ElMessage.error(res.data.msg);
      formRef.value.resetFields();
    }
  });
};

const update = () => {
  if (form.data.plateNumber.length < 7 || form.data.plateNumber.length > 8) {
    ElMessage.error('车牌号长度必须为7-8位');
    return;
  }

  formRef.value.validate((valid) => {
    if (valid) {
      request({
        url: "/parking/vehicleReservation/update",
        method: "POST",
        data: {
          id: form.data.id,
          yardCode: form.data.yardCode,
          yardName: form.data.yardName,
          channelName: form.data.channelName,
          plateNumber: form.data.plateNumber,
          vehicleClassification: form.data.vehicleClassification,
          merchantName: form.data.merchantName,
          releaseReason: form.data.releaseReason,
          notifierName: form.data.notifierName,
          appointmentTime: form.data.appointmentTime,
          remark: form.data.remark
        },
      }).then((res) => {
        if (res.data.code == 0) {
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "管理员";

          activityApi.logAppointmentOperation(
            userId,
            username,
            "修改",
            `修改了车辆预约 ${form.data.plateNumber}`,
            form.data.id,
            null,
            JSON.stringify(form.data)
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });

          getData()
          ElMessage.success("修改成功！");
          dialogVisibleUpdate.value = false
        } else {
          dialogVisibleUpdate.value = false
          ElMessage.error(res.data.msg);
        }
        form.data = {}
      });
    }
  });
};

// 初始化数据
getData();

const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

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
    return 'traditional';
  }

  return 'traditional';
};
</script>

<style lang="scss" scoped>
.vehicle-reservation-management {
  padding: 0 20px 20px 20px;
  background: #f5f7fa;
  min-height: 100vh;

  // 页面头部样式
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 16px 28px;
    margin-bottom: 0;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);

    .page-header-content {
      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);

          .header-icon {
            font-size: 16px;
            color: white;
          }
        }

        .title-text {
          h1 {
            margin: 0 0 2px 0;
            font-size: 16px;
            font-weight: 600;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .title-desc {
            margin: 0;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 400;
          }
        }
      }
    }
  }

  .container {

    // 搜索面板样式
    .search-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      margin-bottom: 20px;
      overflow: hidden;

      .search-panel-header {
        padding: 20px 24px;
        border-bottom: 1px solid #f0f2f5;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background-color: #fafbfc;
        }

        .search-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            font-size: 18px;
            color: #409eff;
          }

          .toggle-icon {
            margin-left: auto;
            font-size: 14px;
            color: #909399;
            transition: transform 0.3s ease;

            &.expanded {
              transform: rotate(180deg);
            }
          }
        }
      }

      .search-panel-body {
        padding: 24px;
        background: #fafbfc;

        .search-form {
          .search-row {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 20px;
            flex-wrap: wrap;

            .search-item {
              margin-bottom: 0;
              min-width: 280px;

              :deep(.el-form-item__label) {
                font-weight: 500;
                color: #606266;
              }

              .search-select,
              .search-input {
                width: 200px;

                :deep(.el-input__wrapper) {
                  border-radius: 8px;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                  transition: all 0.3s ease;

                  &:hover {
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
                  }
                }
              }
            }

            .search-buttons-inline {
              display: flex;
              gap: 12px;
              align-items: center;
              margin-left: auto;
              flex-wrap: wrap;
            }
          }
        }
      }
    }

    // 表格面板样式
    .table-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;

      .table-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #f0f2f5;
        background: #fafbfc;

        .table-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            font-size: 18px;
            color: #409eff;
          }
        }

        .table-stats {
          color: #909399;
          font-size: 14px;
          font-weight: 500;
        }
      }

      .table-panel-body {
        padding: 24px;

        // 表格内容样式
        .modern-table {
          border-radius: 8px;
          overflow: hidden;

          // 车辆信息列样式
          .vehicle-info-cell {
            .vehicle-details {
              display: flex;
              flex-direction: column;
              gap: 8px;

              .car-number-container {
                .plate-number {
                  display: inline-block;
                  padding: 6px 10px;
                  border-radius: 4px;
                  font-weight: bold;
                  font-size: 14px;
                  font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
                  letter-spacing: 0.5px;
                  min-width: 80px;
                  text-align: center;
                  transition: all 0.3s ease;

                  &.traditional {
                    background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%) !important;
                    color: #FFFFFF !important;
                    border: 1px solid #0C4FC5 !important;
                    box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3) !important;
                  }

                  &.new-energy {
                    background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%) !important;
                    color: #000000 !important;
                    border: 1px solid #6AD390 !important;
                    box-shadow: 0 2px 4px rgba(106, 211, 144, 0.3) !important;
                  }

                  &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
                  }
                }
              }

              .yard-name-tag {
                .el-tag {
                  border-radius: 12px;
                  font-size: 12px;
                }
              }
            }
          }

          // 商户名称样式
          .merchant-name {
            font-weight: 600;
            color: #303133;
            font-size: 14px;
          }

          // 通知人姓名样式
          .notifier-name {
            font-size: 14px;
            color: #606266;
            font-weight: 500;
          }

          // 时间信息样式
          .time-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #606266;

            .el-icon {
              color: #409eff;
            }
          }

          // 单行时间显示样式
          .time-info-single {
            font-size: 13px;
            color: #606266;
            white-space: nowrap;
            line-height: 1.4;
          }

          // 状态标签样式
          .status-tag {
            font-weight: 500;
            border-radius: 12px;
          }

          // 备注文本样式
          .remark-text {
            color: #606266;
            font-size: 13px;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          // 更新时间样式
          .update-time {
            font-size: 13px;
            color: #909399;
          }

          // 操作按钮样式
          .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;

            .action-btn {
              padding: 4px 12px;
              font-size: 12px;
              border-radius: 6px;
              font-weight: 500;
            }
          }
        }

        // 分页样式
        .pagination-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f0f2f5;
        }
      }
    }
  }

  // 对话框样式
  .modern-dialog {
    :deep(.el-dialog) {
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
      overflow: hidden !important;
      border: none !important;
    }

    :deep(.el-dialog__header) {
      padding: 32px 32px 24px !important;
      border-bottom: none !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
      }

      .el-dialog__title {
        font-weight: 700 !important;
        color: white !important;
        font-size: 22px !important;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        margin: 0 !important;
      }

      .el-dialog__headerbtn {
        top: 24px !important;
        right: 24px !important;
        width: 40px !important;
        height: 40px !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 50% !important;
        transition: all 0.3s ease !important;

        &:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: scale(1.1) !important;
        }

        .el-dialog__close {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 20px !important;
          font-weight: 600 !important;

          &:hover {
            color: white !important;
          }
        }
      }
    }

    :deep(.el-dialog__body) {
      padding: 0 !important;
      background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 50%, #f8fafc 100%) !important;
    }

    // 预约对话框专用样式
    &.reservation-dialog {
      .dialog-content {
        padding: 32px;
        background: white;
        max-height: 70vh;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;

          &:hover {
            background: #a8a8a8;
          }
        }
      }

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

        .form-date-picker,
        .form-textarea {
          width: 100%;
        }

        :deep(.el-form-item__label) {
          font-weight: 500;
          color: #606266;
        }

        :deep(.el-input__wrapper),
        :deep(.el-select .el-input__wrapper),
        :deep(.el-textarea__inner) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
          }

          &.is-focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }

        :deep(.el-date-picker .el-input__wrapper) {
          width: 100%;
        }

        :deep(.el-textarea) {
          .el-textarea__inner {
            resize: vertical;
            min-height: 80px;
          }
        }
      }

      .reservation-form {
        .form-section {
          margin-bottom: 28px;
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.1);
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 12px rgba(99, 102, 241, 0.08);

          &:hover {
            border-color: rgba(99, 102, 241, 0.2);
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
            transform: translateY(-2px);
          }

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 24px 28px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-bottom: none;
            font-weight: 700;
            font-size: 17px;
            color: white;
            position: relative;
            overflow: hidden;

            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg,
                  transparent,
                  rgba(255, 255, 255, 0.1),
                  transparent);
              transition: left 0.6s ease;
            }

            &:hover::before {
              left: 100%;
            }

            .section-icon {
              font-size: 22px;
              color: white;
              background: rgba(255, 255, 255, 0.15);
              padding: 10px;
              border-radius: 12px;
              backdrop-filter: blur(10px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding: 28px;
            background: white;
          }

          .el-form-item {
            margin-bottom: 0;
            padding: 0 28px 28px 28px;
            background: white;

            &:last-child {
              padding-bottom: 28px;
            }
          }
        }

        .plate-input-container {
          display: flex;
          align-items: center;
          gap: 24px;
          background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.1);

          .plate-input {
            flex: 1;
          }

          .plate-preview {
            flex-shrink: 0;
            animation: fadeInRight 0.5s ease-out;
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));

            .plate-number-preview {
              display: inline-block;
              font-size: 18px;
              font-weight: 900;
              padding: 16px 20px;
              border-radius: 12px;
              font-family: "微软雅黑", "Microsoft YaHei", Arial, sans-serif;
              letter-spacing: 2px;
              min-width: 140px;
              text-align: center;
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              border: 3px solid transparent;
              position: relative;
              overflow: hidden;
              cursor: pointer;
              backdrop-filter: blur(10px);

              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg,
                    transparent,
                    rgba(255, 255, 255, 0.4),
                    transparent);
                transition: left 0.8s ease;
              }

              &::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 9px;
                padding: 3px;
                background: linear-gradient(145deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask-composite: exclude;
                opacity: 0;
                transition: opacity 0.3s ease;
              }

              &:hover {
                &::before {
                  left: 100%;
                }

                &::after {
                  opacity: 1;
                }
              }

              // 传统燃油车牌 - 蓝色渐变增强
              &.traditional {
                background: linear-gradient(145deg, #1e3a8a 0%, #2563eb 25%, #3b82f6 50%, #1d4ed8 75%, #1e40af 100%);
                color: #ffffff;
                border: 3px solid #1e40af;
                box-shadow:
                  0 8px 24px rgba(30, 64, 175, 0.5),
                  0 4px 8px rgba(30, 64, 175, 0.4),
                  inset 0 2px 4px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.2);
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              }

              // 新能源车牌 - 绿色渐变增强
              &.new-energy {
                background: linear-gradient(145deg, #15803d 0%, #16a34a 25%, #22c55e 50%, #15803d 75%, #166534 100%);
                color: #ffffff;
                border: 3px solid #16a34a;
                box-shadow:
                  0 8px 24px rgba(22, 163, 74, 0.5),
                  0 4px 8px rgba(22, 163, 74, 0.4),
                  inset 0 2px 4px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.2);
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              }

              &:hover {
                transform: translateY(-4px) scale(1.08) rotateX(5deg);
                box-shadow:
                  0 12px 32px rgba(0, 0, 0, 0.25),
                  0 6px 16px rgba(0, 0, 0, 0.2);
              }

              &:active {
                transform: translateY(-2px) scale(1.03);
                transition: all 0.1s ease;
              }
            }
          }
        }

        .form-select,
        .form-input,
        .form-date-picker,
        .form-textarea {
          width: 100%;
        }

        :deep(.el-form-item__label) {
          font-weight: 700;
          color: #1f2937;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            width: 3px;
            height: 16px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 2px;
          }
        }

        :deep(.el-input__wrapper),
        :deep(.el-select .el-input__wrapper),
        :deep(.el-textarea__inner) {
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          min-height: 44px;

          &:hover {
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
            transform: translateY(-1px);
          }

          &.is-focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
            background: white;
            transform: translateY(-1px);
          }
        }

        :deep(.el-input__inner),
        :deep(.el-textarea__inner) {
          font-size: 15px;
          color: #1f2937;
          font-weight: 500;
          padding: 12px 16px;

          &::placeholder {
            color: #9ca3af;
            font-weight: 400;
          }
        }

        :deep(.el-select__placeholder) {
          color: #9ca3af;
          font-weight: 400;
        }

        :deep(.el-date-picker .el-input__wrapper) {
          min-height: 44px;
        }

        :deep(.el-textarea) {
          .el-textarea__inner {
            padding: 16px;
            line-height: 1.6;
            resize: vertical;
            min-height: 100px;
          }

        }
      }

      .dialog-footer {
        display: flex;
        justify-content: center;
        gap: 20px;
        padding: 28px 32px 32px;
        border-top: 1px solid rgba(99, 102, 241, 0.1);
        background: linear-gradient(to top, #f8fafc 0%, white 100%);
        backdrop-filter: blur(10px);

        .cancel-btn,
        .confirm-btn {
          padding: 14px 36px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 140px;
          justify-content: center;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent);
            transition: left 0.6s ease;
          }

          &:hover::before {
            left: 100%;
          }

          .el-icon {
            font-size: 18px;
          }
        }

        .cancel-btn {
          background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e5e7eb;
          color: #6b7280;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

          &:hover {
            background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
            border-color: #d1d5db;
            color: #374151;
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: translateY(0) scale(1);
            transition: all 0.1s ease;
          }
        }

        .confirm-btn {
          background: linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          border: none;
          color: white;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

          &:hover {
            background: linear-gradient(145deg, #5b5bf6 0%, #7c3aed 50%, #9333ea 100%);
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 32px rgba(99, 102, 241, 0.6);
          }

          &:active {
            transform: translateY(-1px) scale(1.02);
            transition: all 0.1s ease;
          }
        }
      }
    }

    // 超时清理对话框样式
    .timeout-form {
      margin-bottom: 20px;
      padding: 20px;
      background: #fafbfc;
      border-radius: 8px;

      .timeout-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .timeout-table {
      margin-top: 20px;
      border-radius: 8px;
      overflow: hidden;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px;
      border-top: 1px solid #f0f2f5;
      background: #fafbfc;
    }
  }
}

// 表格行样式
:deep(.odd-row) {
  background-color: #fafbfc !important;
}

:deep(.even-row) {
  background-color: #ffffff !important;
}

// Element Plus 全局样式调整
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f2f5;

  th.el-table__cell {
    background-color: #f8f9fa !important;
    color: #303133;
    font-weight: 600;
    border-bottom: 1px solid #e4e7ed;
    padding: 12px 8px;
  }

  td.el-table__cell {
    padding: 12px 8px;
    border-bottom: 1px solid #f5f7fa;
  }

  .el-table__body tr:hover>td {
    background-color: #f0f9ff !important;
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button.is-disabled) {
  transform: none;
  box-shadow: none;
}

:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-tag) {
  border-radius: 12px;
  font-weight: 500;
  border: none;
}

:deep(.el-tag--info) {
  background-color: #f4f4f5;
  color: #606266;
}

:deep(.el-tag--success) {
  background-color: #f0f9ff;
  color: #1890ff;
}

:deep(.el-tag--danger) {
  background-color: #fff2f0;
  color: #ff4d4f;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  margin: 0 2px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  border-radius: 6px;
}

:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-date-picker .el-input__wrapper) {
  border-radius: 8px;
}

// 动画效果
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .vehicle-reservation-management {
    padding: 12px;

    .page-header {
      padding: 16px 20px;

      .page-header-content .page-title {
        gap: 12px;

        .title-icon {
          width: 40px;
          height: 40px;

          .header-icon {
            font-size: 20px;
          }
        }

        .title-text h1 {
          font-size: 20px;
        }
      }
    }

    .container {
      .search-panel .search-panel-body .search-form .search-row {
        flex-direction: column;
        gap: 16px;

        .search-item {
          min-width: 100%;
        }
      }

      .table-panel .table-panel-body {
        padding: 16px;
        overflow-x: auto;
      }
    }

    .modern-dialog :deep(.el-dialog) {
      margin: 5vh auto;
      width: 90% !important;
    }
  }
}
</style>