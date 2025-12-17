<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 采购申请
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
          <el-form-item label-width="60px" label="设备名">
            <el-input v-model="query.deviceName" placeholder="部门名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label="部门" prop="departmentId">
            <el-select v-model="query.departmentId" placeholder="请选择部门" clearable>
              <el-option v-for="item in departmentList" :key="item.departmentId" :label="item.departmentName"
                :value="item.departmentId" clearable>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="applicationTime" label-width="70px" label="申请时间">
            <el-date-picker v-model="query.applicationTime" type="date" placeholder="选择一个日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" clearable>
            </el-date-picker>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">新增
          </el-button>
          <el-button type="primary" @click="handleExport">导出
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>
        <el-table-column label="审批状态" prop="auditStatus" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.auditStatus === 0">待审批</el-tag>
            <el-tag type="warning" v-else-if="scope.row.auditStatus === 1">待采购</el-tag>
            <el-tag type="info" v-else-if="scope.row.auditStatus === 2">未通过</el-tag>
            <el-tag type="info" v-else-if="scope.row.auditStatus === 3">已采购</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
                v-if="scope.row.auditStatus == 0">编辑
              </el-button>
              <el-button type="text" icon="el-icon-delete" class="red"
                v-if="scope.row.auditStatus == 0 && applicantUserId == scope.row.applicantUserId"
                @click="handleDelete(scope.$index, scope.row.purchaseId)">删除
              </el-button>
              <el-button type="text" icon="el-icon-view" @click="handleView(scope.row)"
                v-if="scope.row.auditStatus == 1">查看原因</el-button>
              <el-button type="text" icon="el-icon-view" @click="handleView1(scope.row)"
                v-if="scope.row.auditStatus == 3">查看图片</el-button>
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
      <el-dialog title="申请" v-model="dialogVisible" width="50%">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="设备名称">
            <el-input v-model="form.data.deviceName" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="设备数量">
            <el-input v-model="form.data.orderQuantity" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="设备价格">
            <el-input v-model="form.data.devicePrice" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="申请原因">
            <el-input type="textarea" :rows="2" v-model="form.data.applicationReason" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="规格型号">
            <el-input v-model="form.data.model" style="width: 40%"></el-input>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="form.data.deviceType" placeholder="请选择类型">
              <el-option v-for="item in Typeoptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="审批人">
            <el-select v-model="form.data.audiusUserId" placeholder="请选择审批人">
              <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId"
                :disabled="applicantUserId != item.userId ? false : true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="供应商">
            <el-select v-model="form.data.supplierId" placeholder="请选择供应商">
              <el-option v-for="item in supplierList" :key="item.supplierId" :label="item.supplierName"
                :value="item.supplierId">
              </el-option>
            </el-select>
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

const root = "/parking/purchase/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
  { label: "设备名称", prop: "deviceName" },
  { label: "设备价格", prop: "devicePrice" },
  { label: "预购数量", prop: "orderQuantity" },
  { label: "申请人", prop: "applicantName" },
  { label: "申请部门", prop: "departmentName" },
  { label: "申请时间", prop: "applicationTime" },
  { label: "申请原因", prop: "applicationReason" },
  { label: "审批人", prop: "audiustName" },
  { label: "供应商名称", prop: "supplierName" },
];
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
    purchaseId: '',
    departmentId: '',
    deviceName: '',
    devicePrice: '',
    orderQuantity: '',
    applicantUserId: '',
    applicationReason: '',
    audiusUserId: '',
    // auditStatus: '',
    supplierId: '',
    // fileReason: '',
    model: "",
    deviceType: "",
  },
});
const handleExport = () => {
  window.location.href = "http://localhost:9999/purchase/exportPurchaseManagement";
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
  departmentId: "",
  deviceName: "",
  applicationTime: "",
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
  form.data.applicantUserId = localStorage.getItem("userId")
  form.data.departmentId = localStorage.getItem("departmentId")
};
// 表格编辑时弹窗和保存
const editVisible = ref(false);
const handleEdit = (row) => {
  dialogVisible.value = true
  form.data.purchaseId = row.purchaseId
  form.data.supplierId = row.supplierId
  form.data.deviceName = row.deviceName
  form.data.devicePrice = row.devicePrice
  form.data.orderQuantity = row.orderQuantity
  form.data.applicantUserId = row.applicantUserId
  form.data.applicationReason = row.applicationReason
  form.data.audiusUserId = row.audiusUserId
  form.data.model = row.model
  form.data.deviceType = row.deviceType

};
const userList = ref([]);
request.get("/parking/user/listAll").then((res) => {
  userList.value = res.data;
});
const supplierList = ref([]);
request.get("/parking/supplier/listsupplier").then((res) => {
  supplierList.value = res.data
});
const formRef = ref(null);
const save = () => {
  // 表单校验
  formRef.value.validate((valid) => {
    if (valid) {
      var method = form.data.purchaseId === "" ? "POST" : "PUT";
      request({
        url: "/parking/purchase",
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