<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-location"></i> 部门管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
          <el-form-item label-width="60px" label="部门">
            <el-input v-model="query.name" placeholder="部门名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label-width="60px" label="负责人">
            <el-input v-model="query.leader" placeholder="负责人" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">新增
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop">
        </el-table-column>
        <el-table-column>

          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row.departmentId)">编辑
              </el-button>
              <el-button type="text" icon="el-icon-delete" class="red"
                @click="handleDelete(scope.$index, scope.row.departmentId)">删除</el-button>
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
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import request from "../../utils/request";
import { activityApi } from "../../api/activity";

export default {
  name: "Department",
  setup() {
    const root = "/parking/department/";
    const router = useRouter();

    const props = [
      { label: "部门名称", prop: "departmentName" },
      { label: "部门地址", prop: "departmentAddress" },
      { label: "联系人", prop: "leader" },
      { label: "联系电话", prop: "leaderPhone" },
      // { label: "联系电话", prop: "president" },
    ];

    const query = reactive({
      name: "",
      leader: "",
      pageNum: 1,
      pageSize: 10,
    });
    const tableData = ref([]);
    const pageTotal = ref(0);
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
    const handleSearch = async () => {
      try {
        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        
        // 构建查询条件描述
        const searchConditions = [];
        if (query.name) searchConditions.push(`部门名称: ${query.name}`);
        if (query.leader) searchConditions.push(`负责人: ${query.leader}`);
        
        const searchDescription = searchConditions.length > 0 
            ? `查询部门信息 (${searchConditions.join(', ')})` 
            : '查询所有部门信息';
        
        await activityApi.logDepartmentOperation(
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
        .catch(() => { });
    };

    // 新增操作
    const handleAdd = () => {
      router.push("/admin/parking/addDepartment");
    };

    // 表格编辑时弹窗和保存
    const editVisible = ref(false);
    let form = reactive({
      name: "",
      address: "",
    });
    const handleEdit = (id) => {
      console.log(id)
      router.push({ path: "/admin/parking/addDepartment", query: { id: id } });
    };

    return {
      props,
      query,
      tableData,
      pageTotal,
      editVisible,
      form,
      handleSearch,
      handleSizeChange,
      handlePageChange,
      handleAdd,
      handleDelete,
      handleEdit,
    };
  },
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #ff0000;
}

.mr10 {
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
