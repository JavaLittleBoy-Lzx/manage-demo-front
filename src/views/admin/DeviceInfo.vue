<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-location"></i> 设备信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="80px">
          <el-form-item label="设备名">
            <el-input v-model="query.deviceName" placeholder="设备名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label="部门" prop="departmentId">
            <el-select v-model="query.departmentId" placeholder="请选择部门" clearable>
              <el-option v-for="item in departmentList" :key="item.departmentId" :label="item.departmentName"
                :value="item.departmentId" clearable>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="query.deviceType" placeholder="请选择类型">
              <el-option label="生产设备" value="1" />
              <el-option label="电气设备" value="2" />
              <el-option label="特种设备" value="3" />
              <el-option label="精密设备" value="4" />
              <el-option label="动力设备" value="5" />
              <el-option label="压力设备" value="6" />
            </el-select>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" @click="handleExport">导出
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>
        <el-table-column label="设备状态" prop="deviceStatus" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.deviceStatus === 1">空闲</el-tag>
            <el-tag type="success" v-else-if="scope.row.deviceStatus === 2">使用中</el-tag>
            <el-tag type="success" v-else-if="scope.row.deviceStatus === 3">待维修</el-tag>
            <el-tag type="success" v-else-if="scope.row.deviceStatus === 4">租赁</el-tag>
            <el-tag type="success" v-else-if="scope.row.deviceStatus === 5">调拨</el-tag>
            <el-tag type="warning" v-else-if="scope.row.deviceStatus === 6">报废</el-tag>
            <el-tag type="warning" v-else-if="scope.row.deviceStatus === 7">维修失败</el-tag>
            <el-tag type="warning" v-else-if="scope.row.deviceStatus === 8">租赁申请中</el-tag>
            <el-tag type="warning" v-else-if="scope.row.deviceStatus === 9">报废中</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
                v-if="scope.row.deviceStatus == 1 || scope.row.deviceStatus == 2">编辑
              </el-button>
              <el-button v-if="!(scope.row.deviceStatus == 1 || scope.row.deviceStatus == 2)">无操作
              </el-button>
              <el-button type="text" icon="el-icon-delete" class="red"
                @click="handleDelete(scope.$index, scope.row.deviceId)"
                v-if="scope.row.deviceStatus == 1 || scope.row.deviceStatus == 2">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
          @current-change="handlePageChange">
        </el-pagination>
      </div>
    </div>
    <div>
      <el-dialog title="设备信息维护" v-model="dialogVisible" width="25% " :before-close="handleClose">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="设备名称" v-if="viewShowtable">
            <el-select v-model="form.data.purchaseId" placeholder="请选择审批设备名">
              <el-option v-for="item in purchaseList" :key="item.purchaseId" :label="item.deviceName"
                :value="item.purchaseId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="规格型号">
            <el-input v-model="form.data.model" style="width: 40%" disabled></el-input>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="form.data.deviceType" placeholder="请选择类型" disabled>
              <el-option v-for="item in Typeoptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备状态" v-if="viewShow">
            <el-radio-group v-model="form.data.deviceStatus">
              <el-radio :label=1>空闲</el-radio>
              <el-radio :label=2>使用</el-radio>
            </el-radio-group>
          </el-form-item>

        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="save">确 定</el-button>
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

const root = "/parking/device/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
  { label: "设备编码", prop: "deviceCode" },
  { label: "设备名称", prop: "deviceName" },
  { label: "设备价格", prop: "devicePrice" },
  { label: "规格型号", prop: "model" },
  { label: "设备类型", prop: "deviceTypeName" },
  // {label: "技术文档", prop: "technicalDocumentation"},
  { label: "部门名称", prop: "departmentName" },
  // {label: "使用情况", prop: "deviceStatus"},
  { label: "登记日期", prop: "purchaseTime" },
];
const handleClose = (done) => {
  ElMessageBox.confirm("确定放弃选择或者关闭吗?")
    .then(() => {
      form.data = {}
      done();
    })
    .catch(() => {
      // catch error
    });
};
const Typeoptions = [
  {
    value: 1,
    label: '生产设备',
  },
  {
    value: 2,
    label: '电气设备',
  },
  {
    value: 3,
    label: '特种设备',
  },
  {
    value: 4,
    label: '精密设备',
  },
  {
    value: 5,
    label: '动力设备',
  },
  {
    value: 6,
    label: '压力设备',
  },
]
const form = reactive({
  data: {
    deviceId: "",
    purchaseId: "",
    deviceCode: "",
    model: "",
    deviceType: "",
    deviceStatus: "",
    purchaseTime: "",
  },
});
const handleEdit = (row) => {
  dialogVisible.value = true
  viewShow.value = true
  viewShowtable.value = false
  form.data.deviceId = row.deviceId
  form.data.deviceCode = row.deviceCode
  form.data.model = row.model
  form.data.deviceType = row.deviceType
  form.data.deviceStatus = row.deviceStatus
  form.data.purchaseTime = row.purchaseTime

};
const handleExport = () => {
  window.location.href = "http://localhost:9999/device/exportDevice";
};

const viewShow = ref(false)
const viewShowtable = ref(false)
// const content = ref("");
// const handleView = (row) => {
//   console.log("")
//   if (row.fileReason !== null) {
//     viewShow.value = true
//     content.value = row.fileReason
//   } else {
//     ElMessage.info('没有审核原因');
//   }
// };
const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")
// alert(applicantUserId.value)
const departmentList = ref([]);
request.get("/parking/department/listDepartment").then((res) => {
  departmentList.value = res.data;
});
const query = reactive({
  deviceName: "",
  deviceCode: "",
  departmentId: '',
  deviceType: "",
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
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
const handleDelete = (index, sid) => {
  // 二次确认删除
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      request.delete(root + sid).then((res) => {
        if (res.data) {
          ElMessage.success("删除成功");
          tableData.value.splice(index, 1);
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
  dialogVisible.value = true
  viewShow.value = false
  viewShowtable.value = true
};
// 表格编辑时弹窗和保存
const editVisible = ref(false);


const purchaseList = ref([]);
request.get("/parking/purchase/listByType").then((res) => {
  purchaseList.value = res.data
});
const formRef = ref(null);
const save = () => {
  // 表单校验
  formRef.value.validate((valid) => {
    if (valid) {
      var method = form.data.deviceId === "" ? "POST" : "PUT";
      request({
        url: "/parking/device",
        method: method,
        data: form.data,
      }).then((res) => {

        form.data = {}
        if (res.code === null) {
          getData()
          ElMessage.success("提交成功！");
          // 关闭当前页面的标签页;
          dialogVisible.value = false
        } else {
          dialogVisible.value = false
          ElMessage.error(res.msg);
        }
      });
    } else {
      return false;
    }
  });
};
</script>

<style scoped></style>