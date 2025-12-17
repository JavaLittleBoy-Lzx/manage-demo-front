<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 报修审批
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
          <el-form-item label-width="80px" label="设备编码">
            <el-input v-model="query.deviceCode" placeholder="设备编码" class="handle-input mr10" maxlength="13"
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
          <!--          <el-button-->
          <!--              type="primary"-->
          <!--              @click="handleAdd"-->
          <!--          >新增-->
          <!--          </el-button>-->
          <!--          <el-button-->
          <!--              type="primary"-->
          <!--              @click="handleExport"-->
          <!--          >导出-->
          <!--          </el-button-->
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>

        <el-table-column label="审批状态" prop="auditStatus" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.auditStatus === 1">待维修</el-tag>
            <el-tag type="warning" v-else-if="scope.row.auditStatus === 3">维修失败</el-tag>
            <el-tag type="warning" v-else-if="scope.row.auditStatus === 2">已维修</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
                :disabled="scope.row.auditStatus === 1 ? false : true">维修情况
              </el-button>
              <!--              <el-button-->
              <!--                  type="text"-->
              <!--                  icon="el-icon-delete"-->
              <!--                  class="red"-->
              <!--                  @click="handleDelete(scope.$index, scope.row.maintenanceId)"-->
              <!--                  :disabled="scope.row.auditStatus === 1 ? false:true"-->
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
      <div>
        <el-dialog title="申请" v-model="editVis" width="50%">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
            <el-form-item label="设备名">
              <el-input v-model="title" style="width: 80%" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备编码">
              <el-input v-model="deCode" style="width: 80%" disabled></el-input>
            </el-form-item>
            <el-form-item label="维修情况">
              <el-radio-group v-model="entity.data.auditStatus">
                <el-radio :label=2>已修好</el-radio>
                <el-radio :label=3>申请报废</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="维修意见">
              <el-input type="textarea" :rows="2" v-model="entity.data.maintOpinions" style="width: 80%"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editVis = false">取 消</el-button>
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

const root = "/parking/maintenance/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
  { label: "设备名称", prop: "deviceName" },
  { label: "故障描述", prop: "faultDescription" },
  { label: "部门地址", prop: "departmentAddress" },
  { label: "备注", prop: "remarks" },
  { label: "设备编码", prop: "deviceCode" },
  { label: "申请人", prop: "repairmanUserName" },
  { label: "维修人", prop: "maintenanceUserName" },
];
const form = reactive({
  data: {
    maintenanceId: '',
    deviceId: "",
    maintenanceUserId: "",//维修人
    repairmanUserId: "",
    faultDescription: "",
    remarks: "",
  },
});
const editVis = ref(false);

// 新增操作
const handleAdd = () => {
  dialogVisible.value = true
  // form.data.applicantUserId = localStorage.getItem("userId")
  // form.data.departmentId = localStorage.getItem("departmentId")
};
const title = ref("")
const deCode = ref("")
const handleEdit = (row) => {
  editVis.value = true
  title.value = row.deviceName
  deCode.value = row.deviceCode
  entity.data.maintenanceId = row.maintenanceId
  entity.data.deviceId = row.deviceId
};
const entity = reactive({
  data: {
    maintenanceId: '',
    deviceId: '',
    maintOpinions: '',
    auditStatus: '',
    maintenanceUserId: '',
  },
});
const save = () => {
  request.post("/parking/maintenance/updateManage", entity.data).then((res) => {
    if (res.code === null) {
      getData()
      ElMessage.success("提交成功！");
      editVis.value = false
    } else {
      dialogVisible.value = false
      editVis.value = false
      ElMessage.error(res.msg);
    }
    entity.data = {}
  }
  )
};
const handleExport = () => {
  window.location.href = "http://localhost:9999/maintenance/exportMaintenance";
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
const departmentList = ref([]);
request.get("/parking/department/listDepartment").then((res) => {
  departmentList.value = res.data;
});
const query = reactive({
  departmentId: "",
  deviceName: "",
  deviceCode: "",
  applicationTime: "",
  maintenanceUserId: localStorage.getItem("userId"),
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
// 获取表格数据

const getData = () => {
  query.maintenanceUserId = localStorage.getItem("userId")
  request
    .get(root + "pageBymaintenanceUserId", {
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
request.get("/parking/user/listAll").then((res) => {
  userList.value = res.data;
});
const deviceList = ref([]);
const getDevice = () => {
  request.get("/parking/device/listByType").then((res) => {
    deviceList.value = res.data
  });
}
getDevice();
const formRef = ref(null);

</script>

<style scoped></style>