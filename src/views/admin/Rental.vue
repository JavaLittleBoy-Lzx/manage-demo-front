<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 租赁申请
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
          <el-form-item label-width="60px" label="设备名">
            <el-input v-model="query.deviceName" placeholder="设备名" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>

          <el-form-item label-width="80px" label="设备code">
            <el-input v-model="query.deviceCode" placeholder="设备code" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item label-width="60px" label="客户">
            <el-input v-model="query.customerName" placeholder="设备名" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <!--          <el-form-item label="部门" prop="departmentId">-->
          <!--            <el-select-->
          <!--                v-model="query.departmentId"-->
          <!--                placeholder="请选择部门"-->
          <!--                clearable-->
          <!--            >-->
          <!--              <el-option-->
          <!--                  v-for="item in departmentList"-->
          <!--                  :key="item.departmentId"-->
          <!--                  :label="item.departmentName"-->
          <!--                  :value="item.departmentId"-->
          <!--                  clearable-->
          <!--              >-->
          <!--              </el-option>-->
          <!--            </el-select>-->
          <!--          </el-form-item>-->
          <!--          <el-form-item prop="applicationTime" label="申请时间">-->
          <!--            <el-date-picker-->
          <!--                v-model="query.applicationTime"-->
          <!--                type="date"-->
          <!--                placeholder="选择一个日期"-->
          <!--                format="YYYY-MM-DD"-->
          <!--                value-format="YYYY-MM-DD"-->
          <!--                clearable-->
          <!--            >-->
          <!--            </el-date-picker>-->
          <!--          </el-form-item>-->
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">租赁申请
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
            <el-tag type="success" v-if="scope.row.audiusStatus === 1">待审批</el-tag>
            <el-tag type="warning" v-else-if="scope.row.audiusStatus === 2">已租出</el-tag>
            <el-tag type="success" v-else-if="scope.row.audiusStatus === 3">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
                :disabled="(scope.row.audiusStatus === 1) && (applicantUserId == scope.row.applicantUserId) ? false : true">编辑
              </el-button>
              <el-button type="text" icon="el-icon-delete" class="red"
                @click="handleDelete(scope.$index, scope.row.orderId)"
                :disabled="(scope.row.audiusStatus === 1) && (applicantUserId == scope.row.applicantUserId) ? false : true">删除
              </el-button>
              <el-button type="text" icon="el-icon-edit" @click="handleEditTime(scope.row)"
                :disabled="(scope.row.audiusStatus === 2) && (applicantUserId == scope.row.applicantUserId) && (scope.row.actualRent === null) ? false : true">归还设备
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
      <el-dialog title="申请" v-model="dialogVisible" width="50%" :before-close="handleClose">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="设备名" prop="deviceId" :rules="[{ required: true, message: '请选择设备' },]">
            <el-select v-model="form.data.deviceId" placeholder="请选择设备" @change="getDepartment">
              <el-option v-for="item in deviceList" :key="item.supplierId" :label="item.deviceName"
                :value="item.deviceId">
                <span style="float: left">{{ item.deviceName }}</span>
                <span style="  float: right; margin-left: 15px;  color: #777777;   font-size: 15px;  ">{{
                  item.deviceCode
                }}</span>
                <span style=" margin-left: 15px; float: left;   color: #777777;   font-size: 15px;  ">{{
                  item.departmentName
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="使用部门">
            <el-input v-model="orderdepartmentName" disabled></el-input>
          </el-form-item>
          <!--          <el-form-item prop="applicationTime" label="租赁开始时间">-->
          <!--            <el-date-picker-->
          <!--                v-model="form.data.leaseTime"-->
          <!--                type="date"-->
          <!--                placeholder="选择一个日期"-->
          <!--                format="YYYY-MM-DD hh:mm:ss"-->
          <!--                value-format="YYYY-MM-DD hh:mm:ss"-->
          <!--                clearable-->
          <!--            >-->
          <!--            </el-date-picker>-->
          <!--          </el-form-item>-->
          <el-form-item prop="applicationTime" label="设备预还时间">
            <el-date-picker v-model="form.data.expectedReturn" type="date" placeholder="选择设备归还时间"
              format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable>
            </el-date-picker>
          </el-form-item>
          <el-form-item label="审批人">
            <el-select v-model="form.data.audiusUserId" placeholder="请选择审批人">
              <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId"
                :disabled="applicantUserId != item.userId ? false : true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户" prop="customerId" :rules="[{ required: true, message: '请选择客户' },]">
            <el-select v-model="form.data.customerId" placeholder="请选择">
              <el-option v-for="item in customerList" :key="item.customerId" :label="item.customerName"
                :value="item.customerId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日租价格" prop="dayPrice" :rules="[{ required: true, message: '日租价格 是必填参数' },]">
            <el-input type="number" v-model="form.data.dayPrice" style="width: 27%"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" :rows="2" v-model="form.data.remarks" style="width: 80%"></el-input>
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

      <div>
        <el-dialog title="归还时间" v-model="editVis" width="30%">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
            <el-form-item label="设备名">
              <el-select v-model="form.data.deviceId" placeholder="请选择设备" @change="getDepartment" disabled>
                <el-option v-for="item in deviceList" :key="item.supplierId" :label="item.deviceName"
                  :value="item.deviceId">
                  <span style="float: left">{{ item.deviceName }}</span>
                  <span style="  float: right; margin-left: 15px;  color: #777777;   font-size: 15px;  ">{{
                    item.deviceCode
                  }}</span>
                  <span style=" margin-left: 15px; float: left;   color: #777777;   font-size: 15px;  ">{{
                    item.departmentName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="使用部门">
              <el-input v-model="orderdepartmentName" style="width: 34%" disabled></el-input>
            </el-form-item>
            <el-form-item prop="applicationTime" label="租赁开始时间">
              <el-date-picker v-model="form.data.leaseTime" type="date" placeholder="选择一个日期"
                format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable disabled>
              </el-date-picker>
            </el-form-item>
            <el-form-item prop="applicationTime" label="设备预还时间">
              <el-date-picker v-model="form.data.expectedReturn" type="date" placeholder="选择设备归还时间"
                format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable disabled>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="审批人">
              <el-select v-model="form.data.audiusUserId" placeholder="请选择审批人" disabled>
                <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId"
                  :disabled="applicantUserId != item.userId ? false : true">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户">
              <el-select v-model="form.data.customerId" placeholder="请选择" disabled>
                <el-option v-for="item in customerList" :key="item.customerId" :label="item.customerName"
                  :value="item.customerId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="actualReturn" label="实际归还时间">
              <el-date-picker v-model="form.data.actualReturn" type="date" placeholder="选择设备归还时间"
                format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="备注">
              <el-input type="textarea" :rows="2" v-model="form.data.remarks" style="width: 60%"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editVis = false">取 消</el-button>
              <el-button type="primary" @click="saveTime">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <div>
        <el-dialog title="编辑" v-model="editVisible" width="30%">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
            <el-form-item label="设备名">
              <el-input v-model="title" style="width: 80%" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备编码">
              <el-input v-model="deCode" style="width: 80%" disabled></el-input>
            </el-form-item>
            <el-form-item label="使用部门">
              <el-input v-model="orderdepartmentName" style="width: 34%" disabled></el-input>
            </el-form-item>
            <el-form-item prop="applicationTime" label="租赁开始时间">
              <el-date-picker v-model="form.data.leaseTime" type="date" placeholder="选择一个日期"
                format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable disabled>
              </el-date-picker>
            </el-form-item>
            <el-form-item prop="applicationTime" label="设备预还时间">
              <el-date-picker v-model="form.data.expectedReturn" type="date" placeholder="选择设备归还时间"
                format="YYYY-MM-DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" clearable>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="审批人">
              <el-select v-model="form.data.audiusUserId" placeholder="请选择审批人">
                <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId"
                  :disabled="applicantUserId != item.userId ? false : true">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户">
              <el-select v-model="form.data.customerId" placeholder="请选择">
                <el-option v-for="item in customerList" :key="item.customerId" :label="item.customerName"
                  :value="item.customerId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input type="textarea" :rows="2" v-model="form.data.remarks" style="width: 80%"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editVisible = false">取 消</el-button>
              <el-button type="primary" @click="save">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";

const root = "/parking/rental/";
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = [
  { label: "设备编码", prop: "deviceCode" },
  { label: "设备名称", prop: "deviceName" },
  { label: "部门", prop: "departmentName" },
  { label: "客户名称", prop: "customerName" },
  { label: "客户编码", prop: "customerCode" },
  { label: "客户电话", prop: "telephone" },
  { label: "日租金", prop: "dayPrice" },
  { label: "预租金", prop: "rent" },
  { label: "租赁时间", prop: "leaseTime" },
  { label: "申请人", prop: "applicantUserName" },
  { label: "审批人", prop: "audiusUserName" },
  { label: "预计归还时间", prop: "expectedReturn" },
  { label: "实际归还时间", prop: "actualReturn" },
  { label: "实际租金", prop: "actualRent" },
  { label: "备注", prop: "remarks" },
];
const handleClose = (done) => {
  ElMessageBox.confirm("确定放弃选择或者关闭吗?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
const form = reactive({
  data: {
    orderId: "",//zhujian
    deviceId: "",//设备id
    customerId: "",//
    leaseTime: "",//调往部门
    audiusUserId: "",//申请原因
    expectedReturn: '',//审批人
    applicantUserId: localStorage.getItem("userId"),
    remarks: "",
    dayPrice: "",
    rent: 0,
  },
});
const editVis = ref(false);
const handleEditTime = (row) => {
  editVis.value = true
  form.data.orderId = row.orderId
  form.data.deviceId = row.deviceId
  orderdepartmentName.value = row.departmentName
  form.data.customerId = row.customerId
  form.data.audiusUserId = row.audiusUserId
  form.data.leaseTime = row.leaseTime
  form.data.expectedReturn = row.expectedReturn;
  form.data.remarks = row.remarks
  form.data.rent = row.rent
  form.data.dayPrice = row.dayPrice;


};
const saveTime = () => {
  request({
    url: "/parking/rental/updateTime",
    method: "PUT",
    data: form.data,
  }).then((res) => {
    form.data = {}
    if (res.code === null) {
      getData()
      ElMessage.success("提交成功！");
      // 关闭当前页面的标签页;
      editVis.value = false
      // editVis.value = false
    } else {
      editVis.value = false
      // editVis.value = false
      ElMessage.error(res.msg);
    }
  });
}
const isdepartmentId = ref("");
isdepartmentId.value = localStorage.getItem("departmentId")
// 新增操作
const handleAdd = () => {
  form.data = {}
  dialogVisible.value = true
  // form.data.applicantUserId = localStorage.getItem("userId")
  // form.data.departmentId = localStorage.getItem("departmentId")
};
// 表格编辑时弹窗和保存
const editVisible = ref(false);
const title = ref("")
const deCode = ref("")
const handleEdit = (row) => {
  editVisible.value = true
  title.value = row.deviceName
  deCode.value = row.deviceCode
  form.data.orderId = row.orderId
  form.data.deviceId = row.deviceId
  orderdepartmentName.value = row.departmentName
  form.data.customerId = row.customerId
  form.data.audiusUserId = row.audiusUserId
  form.data.leaseTime = row.leaseTime
  form.data.expectedReturn = row.expectedReturn;
  form.data.dayPrice = row.dayPrice;
  form.data.remarks = row.remarks
  getUser()

};
const handleExport = () => {
  window.location.href =
    "http://localhost:9999/rental/exportAllocation?deviceName=" +
    query.deviceName +
    "&deviceCode=" +
    query.deviceCode +
    "&customerName=" +
    query.customerName +
    "";
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
const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")
// alert(applicantUserId.value)
const customerList = ref([]);
request.get("/customer/listCustomer").then((res) => {
  customerList.value = res.data;
});
const query = reactive({
  deviceName: "",
  deviceCode: "",
  customerName: "",
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
const userList = ref([]);
request.get("/user/listAll").then((res) => {
  userList.value = res.data;
});
const getUser = () => {
  request.get("/user/listAll").then((res) => {
    userList.value = res.data;
  });
}
getUser()
const deviceList = ref([]);
const getDevice = () => {
  request.get("/device/listByTypeOne").then((res) => {
    deviceList.value = res.data
  });
}
getDevice();
const orderdepartmentName = ref("")
const getDepartment = (val) => {
  console.log(val)
  request.get("/device/getDepartment", {
    params: { deviceId: val },
  }).then((res) => {
    orderdepartmentName.value = res.data.departmentName
  });
}
const formRef = ref(null);
const save = () => {
  form.data.applicantUserId = localStorage.getItem("userId"),
    // 表单校验
    formRef.value.validate((valid) => {
      if (valid) {
        // var method = form.data.orderId === "" ? "POST" : "PUT";
        request({
          url: "/parking/rental",
          method: "POST",
          data: form.data,
        }).then((res) => {
          dialogVisible.value = false
          editVisible.value = false
          form.data = {}
          if (res.code === null) {
            getData()
            getDevice()
            ElMessage.success("提交成功！");

          } else {
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