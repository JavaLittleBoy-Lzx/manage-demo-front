<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 报废审核
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="80px">
          <el-form-item label-width="60px" label="设备名">
            <el-input v-model="query.deviceName" placeholder="设备名" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="设备编码">
            <el-input v-model="query.deviceCode" placeholder="设备编码" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item prop="scrapDate" label="申请时间">
            <el-date-picker v-model="query.scrapDate" type="date" placeholder="选择一个日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" clearable>
            </el-date-picker>
          </el-form-item>
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
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>

        <el-table-column label="审批状态" prop="auditStatus" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.deviceStatus === 1">待审批</el-tag>
            <el-tag type="warning" v-else-if="scope.row.deviceStatus === 2">已通过</el-tag>
            <el-tag type="success" v-else-if="scope.row.deviceStatus === 3">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
                :disabled="scope.row.deviceStatus === 1 ? false : true">审核
              </el-button>
              <!--              <el-button-->
              <!--                  type="text"-->
              <!--                  icon="el-icon-delete"-->
              <!--                  class="red"-->
              <!--                  @click="handleDelete(scope.$index, scope.row.scrapId)"-->
              <!--                  :disabled="scope.row.deviceStatus === 1? false:true "-->
              <!--              >删除-->
              <!--              </el-button>-->
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
      <el-dialog title="报废申请" v-model="edeitVisible" width="50%">
        <el-form :model="entity.data" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="设备名">
            <el-input v-model="deviceName" disabled></el-input>
          </el-form-item>
          <el-form-item label="设备code">
            <el-input v-model="deCode" disabled></el-input>
          </el-form-item>
          <el-form-item label="使用部门">
            <el-input v-model="orderdepartmentName" disabled></el-input>
          </el-form-item>
          <el-form-item label="故障障描述">
            <el-input type="textarea" :rows="2" v-model="entity.data.faultDescription" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="维修人">
            <el-select v-model="entity.data.maintenanceUserId" placeholder="请选择审批人">
              <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId"
                :disabled="applicantUserId != item.userId ? false : true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" :rows="2" v-model="entity.data.remarks" style="width: 80%"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="edeitVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveMainten">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div>
      <el-dialog title="报废审批" v-model="dialogVisible" width="50%">
        <el-form :model="form.data" ref="formRef" label-width="100px">
          <el-form-item label="审核情况">
            <el-radio-group v-model="form.data.deviceStatus">
              <el-radio :label=2>通过</el-radio>
              <el-radio :label=3>不通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核原因">
            <el-input type="textarea" :rows="2" placeholder="请输入审核原因" v-model="form.data.audiusReason"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="save" v-if="form.data.deviceStatus !== 3">确 定</el-button>
            <el-button type="primary" @click="handleEditMain" v-if="form.data.deviceStatus == 3">提交报修申请</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";

const root = "/parking/scrap/";
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = [
  { label: "设备编码", prop: "deviceCode" },
  { label: "设备名称", prop: "deviceName" },
  { label: "部门", prop: "departmentName" },
  { label: "报废原因", prop: "scrapReason" },
  { label: "申请人", prop: "registrationUserName" },
  { label: "报废日期", prop: "scrapDate" },
  { label: "审批人", prop: "audiusUserName" },
  { label: "实际报废审批时间", prop: "approvalTime" },
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
    scrapId: "",
    deviceId: "",//设备id
    audiusReason: "",//申请原因
    registrationUserId: localStorage.getItem("userId"),
    audiusUserId: "",//
    remarks: "",
  },
});

const handleEditMain = () => {
  dialogVisible.value = false
  edeitVisible.value = true
  entity.data.audiusReason = form.data.audiusReason
  entity.data.deviceStatus = form.data.deviceStatus
};
const entity = reactive({
  data: {
    scrapId: "",
    audiusReason: "",
    deviceStatus: "",
    maintenanceUserId: "",//维修人
    repairmanUserId: localStorage.getItem("userId"),
    faultDescription: "",//
    remarks: "",
  },
});
const saveMainten = () => {

  entity.data.repairmanUserId = localStorage.getItem("userId")
  request({
    url: "/parking/scrap/auditScrapAndMaintence",
    method: "PUT",
    data: entity.data,
  }).then((res) => {
    dialogVisible.value = false
    edeitVisible.value = false
    entity.data = {}
    if (res.code === null) {
      getData()
      ElMessage.success("提交成功！");
      // 关闭当前页面的标签页;
    } else {
      ElMessage.error(res.msg);
    }
  });
}
const isdepartmentId = ref("");
isdepartmentId.value = localStorage.getItem("departmentId")
// 新增操作
const handleAdd = () => {
  form.data = {};
  orderdepartmentName.value = ""
  dialogVisible.value = true
  form.data.scrapId = ""
  // form.data.applicantUserId = localStorage.getItem("userId")
  // form.data.departmentId = localStorage.getItem("departmentId")
};
const deviceName = ref("")
const deCode = ref("")
const edeitVisible = ref(false);
const handleEdit = (row) => {
  dialogVisible.value = true
  form.data.scrapId = row.scrapId
  form.data.deviceId = row.deviceId
  orderdepartmentName.value = row.departmentName
  deviceName.value = row.deviceName
  form.data.deviceName = row.deviceName
  deCode.value = row.deviceCode
  form.data.audiusUserId = row.audiusUserId
  form.data.scrapReason = row.scrapReason;
  form.data.remarks = row.remarks
  entity.data.scrapId = row.scrapId

};

const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")
// alert(applicantUserId.value)
const customerList = ref([]);
request.get("/parking/customer/listCustomer").then((res) => {
  customerList.value = res.data;
});
const query = reactive({
  deviceName: "",
  audiusUserId: localStorage.getItem("userId"),
  deviceCode: "",
  scrapDate: "",
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
// 获取表格数据

const getData = () => {
  query.audiusUserId = localStorage.getItem("userId")
  request
    .get(root + "mypage", {
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


// 表格编辑时弹窗和保存
const editVisible = ref(false);

const userList = ref([]);
const getUser = () => {
  request.get("/parking/user/listAll").then((res) => {
    userList.value = res.data;
  });
}
getUser()
const deviceList = ref([]);
const getDevice = () => {
  request.get("/parking/device/getByStatue").then((res) => {
    deviceList.value = res.data
  });
}
getDevice();
const orderdepartmentName = ref("")
const getDepartment = (val) => {
  console.log(val)
  request.get("/parking/device/getDepartment", {
    params: { deviceId: val },
  }).then((res) => {
    orderdepartmentName.value = res.data.departmentName
  });
}
const formRef = ref(null);
const save = () => {
  if (form.data.scrapId === "") {
    return
  }
  // 表单校验
  formRef.value.validate((valid) => {
    if (valid) {
      request({
        url: "/parking/scrap/auditScrap",
        method: "PUT",
        data: form.data,
      }).then((res) => {
        dialogVisible.value = false
        edeitVisible.value = false
        form.data = {}
        if (res.code === null) {
          getData()
          ElMessage.success("提交成功！");
          // 关闭当前页面的标签页;
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