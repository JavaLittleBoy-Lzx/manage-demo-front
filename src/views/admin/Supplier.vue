<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 供应商管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="90px" clearable>
          <el-form-item label="供应商名称">
            <el-input v-model="query.name" placeholder="供应商名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label="供应商编码">
            <el-input v-model="query.supplierCode" placeholder="供应商编码" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="query.contactsPerson" placeholder="联系人" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">添加供应商
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
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row.supplierId)">编辑
              </el-button>
              <el-button type="text" icon="el-icon-delete" class="red"
                @click="handleDelete(scope.$index, scope.row.supplierId)">删除</el-button>
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

export default {
  name: "Department",
  setup() {
    const root = "/parking /parking/supplier/";
    const router = useRouter();

    const props = [
      { label: "供应商名称", prop: "supplierName" },
      { label: "供应商编码", prop: "supplierCode" },
      { label: "供应商地址", prop: "supplierAddress" },
      { label: "联系人", prop: "contactsPerson" },
      { label: "联系人电话", prop: "telephone" },
      { label: "登记日期", prop: "registrationTime" },
      { label: "备注", prop: "remarks" },
    ];

    const query = reactive({
      name: "",
      contactsPerson: "",
      supplierCode: "",
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
        .catch(() => { });
    };

    // 新增操作
    const handleAdd = () => {
      router.push("/admin/parking/addSupplier");
    };

    // 表格编辑时弹窗和保存
    const editVisible = ref(false);
    let form = reactive({
      name: "",
      address: "",
    });
    const handleEdit = (id) => {
      console.log(id)
      router.push({ path: "/admin/parking/addSupplier", query: { id: id } });
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
