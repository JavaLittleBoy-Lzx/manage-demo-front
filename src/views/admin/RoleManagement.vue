<template>
  <div class="role-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="crumbs">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>
            <i class="header-icon">👥</i>
            <span>角色管理</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增角色
        </el-button>
      </div>
    </div>

    <!-- 现代化搜索面板 -->
    <div class="search-card">
      <div class="card-header">
        <div class="header-title">
          <i class="search-icon">🔍</i>
          <span>搜索条件</span>
        </div>
      </div>

      <div class="search-content">
        <el-form :inline="true" :model="query" class="search-form">
          <div class="form-row">
            <el-form-item label="角色名称" class="form-item">
              <el-input v-model="query.name" placeholder="请输入角色名称" clearable prefix-icon="el-icon-user"
                class="search-input" />
            </el-form-item>
            <el-form-item class="form-item">
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">
                搜索
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 现代化数据表格 -->
    <div class="data-card">
      <div class="card-header">
        <div class="header-title">
          <i class="table-icon">📋</i>
          <span>角色列表</span>
        </div>
        <div class="table-stats">
          共 {{ pageTotal }} 条记录
        </div>
      </div>

      <div class="table-container">
        <el-table :data="tableData" class="modern-table" ref="multipleTable" :row-class-name="tableRowClassName"
          :cell-style="cellStyle" :header-row-style="headerRowStyle">
          <!-- 角色信息列 -->
          <el-table-column label="角色信息" min-width="200">
            <template #default="{ row }">
              <div class="role-info">
                <div class="role-icon">👤</div>
                <div class="role-details">
                  <div class="role-name">{{ row.name }}</div>
                  <div class="role-id">ID: {{ row.id }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 创建时间列 -->
          <el-table-column label="创建时间" width="180" align="center">
            <template #default="{ row }">
              <div class="time-info">
                <i class="el-icon-time"></i>
                {{ row.createTime || '未知' }}
              </div>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column label="状态" width="120" align="center">
            <template>
              <el-tag type="success" size="small" class="status-tag">
                正常
              </el-tag>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(row.id)"
                  class="action-btn">
                  编辑
                </el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete($index, row.id)"
                  class="action-btn">
                  删除
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

    <!-- 角色编辑对话框 -->
    <el-dialog :title="form.id ? '修改角色' : '新增角色'" v-model="addVisible" width="500px" :close-on-click-modal="false"
      class="modern-dialog">
      <el-form :model="form" label-width="80px" class="role-form">
        <el-form-item label="角色名称" prop="name" :rules="[
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]">
          <el-input v-model="form.name" placeholder="请输入角色名称" prefix-icon="el-icon-user" />
        </el-form-item>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addVisible = false">取消</el-button>
          <el-button type="primary" @click="addSaveEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import request from "../../utils/request";
import { activityApi } from "@/api/activity";

export default {
  name: "RoleManagement",
  setup() {
    const root = "/parking/role/";
    const router = useRouter();

    const props = [
      { label: "角色名称", prop: "name" },
    ];

    const addVisible = ref(false);
    const query = reactive({
      name: "",
      pageNum: 1,
      pageSize: 10,
    });

    const tableData = ref([]);
    const pageTotal = ref(0);
    let form = reactive({
      id: "",
      name: ""
    });

    // 表格行样式
    const tableRowClassName = ({ row, rowIndex }) => {
      if ((rowIndex + 1) % 2 == 0) {
        return 'odd-row';
      } else if ((rowIndex + 1) % 2 != 0) {
        return 'even-row';
      }
    };

    // 单元格样式
    const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
      let style = { padding: '12px 8px' }
      return style
    };

    // 表头行样式
    const headerRowStyle = () => {
      return {
        height: '50px',
        padding: '0px'
      }
    };

    // 获取表格数据
    const getData = () => {
      request
        .get(root + "page", {
          params: query,
        })
        .then((res) => {
          if (res.code == 18) {
            ElMessage.warning(res.msg);
            tableData.value = []
          } else {
            tableData.value = res.data.records;
            pageTotal.value = res.data.total;
          }
        });
    };

    // 查询操作
    const handleSearch = async () => {
      try {
        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        
        // 构建查询条件描述
        const searchConditions = [];
        if (query.roleName) searchConditions.push(`角色名称: ${query.roleName}`);
        if (query.roleDesc) searchConditions.push(`角色描述: ${query.roleDesc}`);
        
        const searchDescription = searchConditions.length > 0 
            ? `查询角色信息 (${searchConditions.join(', ')})` 
            : '查询所有角色信息';
        
        await activityApi.logRoleOperation(
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
      ElMessageBox.confirm("确定要删除这个角色吗？", "删除确认", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          request.delete(root + sid).then((res) => {
            if (res.data) {
              ElMessage.success("删除成功");
              
              // 记录活动日志
              const userId = localStorage.getItem("ms_userid") || "unknown";
              const username = localStorage.getItem("ms_username") || "管理员";
              activityApi.logSystemOperation(
                userId,
                username,
                "删除",
                `删除了角色 ID: ${sid}`,
                JSON.stringify({ roleId: sid }),
                null
              ).catch(err => {
                console.error("记录活动日志失败:", err);
              });
              
              getData(); // 重新获取数据
            } else {
              ElMessage.error("删除失败");
            }
          });
        })
        .catch(() => {
          ElMessage.info("已取消删除");
        });
    };

    // 新增操作
    const handleAdd = () => {
      form.id = "";
      form.name = "";
      addVisible.value = true;
    };

    // 编辑操作
    const handleEdit = (id) => {
      addVisible.value = true;
      request.get(root + id).then((res) => {
        form.id = res.data.id;
        form.name = res.data.name;
      });
    };

    // 保存编辑
    const addSaveEdit = () => {
      if (!form.name || form.name.trim() === '') {
        ElMessage.error("请输入角色名称");
        return;
      }

      if (form.id) {  // 更新
        request.put("/parking/role", form).then(res => {
          if (res.code === '0') {
            ElMessage.success("更新成功");
            
            // 记录活动日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";
            activityApi.logSystemOperation(
              userId,
              username,
              "修改",
              `修改了角色: ${form.name}`,
              null,
              JSON.stringify({ roleId: form.id, roleName: form.name })
            ).catch(err => {
              console.error("记录活动日志失败:", err);
            });
          } else {
            ElMessage.error(res.msg || "更新失败");
          }
          form.id = "";
          form.name = "";
          getData();
          addVisible.value = false;
        });
      } else {  // 新增
        request.post("/parking/role", form).then(res => {
        console.log(res);
          if (res.code !== null) {
            ElMessage.success("新增成功");
            
            // 记录活动日志
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";
            activityApi.logSystemOperation(
              userId,
              username,
              "新增",
              `新增了角色: ${form.name}`,
              null,
              JSON.stringify({ roleName: form.name })
            ).catch(err => {
              console.error("记录活动日志失败:", err);
            });
          } else {
            ElMessage.error(res.msg || "新增失败");
          }
          form.id = "";
          form.name = "";
          getData();
          addVisible.value = false;
        });
      }
    };

    // 初始化数据
    getData();

    return {
      props,
      query,
      tableData,
      pageTotal,
      form,
      addVisible,
      addSaveEdit,
      handleSearch,
      handleSizeChange,
      handlePageChange,
      handleAdd,
      handleDelete,
      handleEdit,
      tableRowClassName,
      cellStyle,
      headerRowStyle
    };
  },
};
</script>

<style lang="scss" scoped>
.role-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 4px;

    .crumbs {
      .el-breadcrumb-item {
        .header-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        span {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-card,
  .data-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 20px;

      .header-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #303133;

        .search-icon,
        .table-icon {
          margin-right: 8px;
          font-size: 18px;
        }
      }

      .table-stats {
        color: #909399;
        font-size: 14px;
      }
    }

    .search-content {
      padding: 0 24px 20px;

      .search-form {
        .form-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;

          .form-item {
            margin-bottom: 0;

            .search-input {
              width: 200px;
            }
          }
        }
      }
    }

    .table-container {
      padding: 0 24px 24px;

      .modern-table {
        .role-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .role-icon {
            width: 36px;
            height: 36px;
            background: #fff;  
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: white;
          }

          .role-details {
            .role-name {
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .role-id {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #606266;
        }

        .status-tag {
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 8px;

          .action-btn {
            padding: 4px 12px;
            font-size: 12px;
          }
        }
      }

      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
      }
    }
  }

  .modern-dialog {
    .role-form {
      padding: 10px 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}

// 表格行样式
:deep(.odd-row) {
  background-color: #fafafa !important;
}

:deep(.even-row) {
  background-color: #ffffff !important;
}

// Element Plus 组件样式调整
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8f9fa !important;
  color: #303133;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
