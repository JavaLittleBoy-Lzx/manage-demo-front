<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i><img src="..//../icons/svg-black/UserManage.svg"></i> 用户管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.userName" placeholder="用户名" class="handle-input mr10"></el-input>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleAdd">新增</el-button>
      </div>
      <el-table size="small" :data="tableData" :cell-style="cellStyle" border class="table" ref="multipleTable"
        header-cell-class-name="table-header" :row-class-name="tableRowClassName">
        
        <!-- 用户名 -->
        <el-table-column prop="userName" label="用户名" width="120" :show-overflow-tooltip="true"></el-table-column>
        
        <!-- 账号 -->
        <el-table-column prop="loginName" label="账号" width="120" :show-overflow-tooltip="true"></el-table-column>
        
        <!-- 电话 -->
        <el-table-column prop="telephone" label="电话" width="130" :show-overflow-tooltip="true"></el-table-column>
        
        <!-- 邮箱 -->
        <el-table-column prop="email" label="邮箱" width="180" :show-overflow-tooltip="true"></el-table-column>
        
        <!-- 角色 -->
        <el-table-column prop="roleName" label="角色" width="120" :show-overflow-tooltip="true"></el-table-column>
        
        <!-- 管理车场 -->
        <el-table-column label="管理车场" width="220" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <div v-if="row.managedParks && row.managedParks.length > 0" class="managed-parks-cell">
              <el-tag 
                v-for="(park, index) in row.managedParks.slice(0, 2)" 
                :key="index" 
                size="small" 
                type="success"
                class="park-tag"
              >
                {{ park }}
              </el-tag>
              <el-tag v-if="row.managedParks && row.managedParks.length > 2" size="small" type="info">
                +{{ row.managedParks.length - 2 }}
              </el-tag>
            </div>
            <span v-else class="empty-text">全部车场</span>
          </template>
        </el-table-column>
        
        <!-- 最后登录IP -->
        <el-table-column label="登录IP" width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span v-if="row.lastLoginIp" class="ip-text">{{ row.lastLoginIp }}</span>
            <span v-else class="empty-text">未登录</span>
          </template>
        </el-table-column>
        
        <!-- 登录次数 -->
        <el-table-column label="登录次数" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.loginCount && row.loginCount > 0" type="primary" size="small" class="count-tag">
              {{ row.loginCount }}次
            </el-tag>
            <span v-else class="empty-text">0次</span>
          </template>
        </el-table-column>
        
        <!-- 最后登录时间 -->
        <el-table-column label="最后登录时间" width="170">
          <template #default="{ row }">
            <span v-if="row.lastLoginTime">{{ formatDateTime(row.lastLoginTime) }}</span>
            <span v-else class="empty-text">未登录</span>
          </template>
        </el-table-column>
        
        
        <!-- 操作 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row.userId)">编辑
            </el-button>
            <el-button type="text" icon="el-icon-delete" class="red"
              @click="handleDelete(scope.$index, scope.row.userId)">删除</el-button>
          </template>
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
// import { fetchData } from "../../api/index";
import request from "../../utils/request";
import { activityApi } from "../../api/activity";

export default {
  name: "UserMng",
  setup() {
    const router = useRouter();
    var roleMap = [];
    request.get("/parking/role/map").then((res) => {
      roleMap = res.data;
    });

    const getRole = (roleId) => {
      if (roleId) {
        return roleMap[roleId] ? roleMap[roleId].name : "";
      }
    };

    const propt = [
      { label: "用户名", prop: "userName", width: "120" },
      { label: "账号", prop: "loginName", width: "120" },
      { label: "电话", prop: "telephone", width: "130" },
      { label: "邮箱", prop: "email", width: "180" },
      { label: "角色", prop: "roleName", width: "120" },
      { label: "管理车场", prop: "managedParks", width: "220" },
      { label: "登录IP", prop: "lastLoginIp", width: "140" },
      { label: "登录次数", prop: "loginCount", width: "100" },
      { label: "最后登录时间", prop: "lastLoginTime", width: "170" }
    ];
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
    const query = reactive({
      userName: "",
      pageNum: 1,
      pageSize: 10,
    });
    const tableData = ref([]);
    const pageTotal = ref(0);
    // 获取表格数据
    const getData = () => {
      request
        .get("/parking/user/page", {
          params: query,
        })
        .then((res) => {
          console.log("用户查询结果:", res);
          if (res.data.data && res.data.data.records) {
            tableData.value = res.data.data.records;
            pageTotal.value = res.data.data.total;
          } else {
            tableData.value = [];
            pageTotal.value = 0;
          }
        })
        .catch((error) => {
          console.error("用户查询失败:", error);
          tableData.value = [];
          pageTotal.value = 0;
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
        const searchDescription = query.userName 
            ? `查询用户信息 (用户名: ${query.userName})` 
            : '查询所有用户信息';
        
        await activityApi.logUserOperation(
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
    const handleDelete = (index, userId) => {
      // 二次确认删除
      ElMessageBox.confirm("确定要删除吗？", "提示", {
        type: "warning",
      })
        .then(() => {
          request.delete("/parking/user/" + userId).then((res) => {
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
      router.push("/admin/addUser");
    };

    // 表格编辑时弹窗和保存
    const editVisible = ref(false);
    let form = reactive({
      name: "",
      address: "",
    });
    const handleEdit = (userId) => {
      console.log("编辑用户:", userId)
      router.push({ path: "/admin/addUser", query: { userId: userId } });
    };

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-';
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return {
      propt,
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
      getRole,
      tableRowClassName,
      cellStyle,
      formatDateTime
    };
  },

};
</script>

<style lang="scss" scoped>
.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}

.mr10 {
  margin-right: 10px;
}

.odd-row {
  background-color: rgb(241, 242, 244) !important;
}

.even-row {
  background-color: rgb(255, 255, 255) !important;
}

// 管理车场单元格样式
.managed-parks-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  
  .park-tag {
    margin: 2px;
    font-size: 12px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 空文本样式
.empty-text {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

// IP地址样式
.ip-text {
  color: #606266;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

// 登录次数标签样式
.count-tag {
  font-weight: 600;
  border-radius: 4px;
}
</style>
