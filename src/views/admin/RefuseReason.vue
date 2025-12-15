<template>
  <div class="refuse-reason-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/RefuseReason.svg" alt="拒绝原因" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>拒绝原因管理</h1>
            <p class="title-desc">管理系统拒绝请求的原因分类，支持自定义排序和快速检索</p>
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
                <el-form-item label="拒绝原因" class="search-item">
                  <el-input 
                    v-model="query.reason" 
                    placeholder="请输入拒绝原因关键字" 
                    clearable
                    class="search-input"
                  />
                </el-form-item>
                
                <!-- 操作按钮紧跟搜索框 -->
                <div class="search-buttons-inline">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                    搜索
                  </el-button>
                  <!-- <el-button type="success" icon="Plus" @click="handleAdd" size="small">
                    新增原因
                  </el-button> -->
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
            <span>拒绝原因列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>
        
        <div class="table-panel-body">
          <el-table 
            :data="tableData" 
            class="modern-table" 
            ref="multipleTable" 
            :row-class-name="tableRowClassName"
            stripe
          >
            <!-- 拒绝原因列 -->
            <el-table-column label="拒绝原因" prop="reason" min-width="200">
              <template #default="{ row }">
                <div class="reason-info-cell">
                  <div class="reason-icon">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="reason-details">
                    <div class="reason-name">{{ row.reason }}</div>
                    <div class="reason-desc">系统拒绝原因</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 排序序号列 -->
            <el-table-column label="排序序号" prop="sortno" width="120" align="center">
              <template #default="{ row }">
                <div class="sort-info">
                  <el-tag type="warning" size="large" effect="plain">
                    <el-icon><Sort /></el-icon>
                    {{ row.sortno }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row, $index }">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="handleEdit(row.id)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDelete($index, row.id)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination">
            <el-pagination 
              :current-page="query.pageNum" 
              :page-sizes="[10, 20, 40]" 
              :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper" 
              :total="pageTotal" 
              @size-change="handleSizeChange"
              @current-change="handlePageChange">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import request from "../../utils/request";
import { 
  Search, ArrowDown, List, Edit, Delete, Plus,
  Warning, Sort
} from '@element-plus/icons-vue';
import activityLogger from '../../utils/activityLogger';

const root = "/parking/refusereason/";
const router = useRouter();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 切换搜索面板
const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

const props = [
  { label: "拒绝原因", prop: "reason" },
  { label: "序号", prop: "sortno" },
];

const query = reactive({
  reason: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);

//指定行颜色
const tableRowClassName = ({ row, rowIndex }) => {
  if ((rowIndex + 1) % 2 == 0) {
    return 'odd-row';
  } else if ((rowIndex + 1) % 2 != 0) {
    return 'even-row';
  }
};

//指定行高
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let style = { padding: '0px 3px' }
  return style
};

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
    // 记录查询操作日志（使用activityLogger自动获取真实IP）
    const searchConditions = [];
    if (query.reason) searchConditions.push(`拒绝原因: ${query.reason}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询拒绝原因 (${searchConditions.join(', ')})` 
        : '查询所有拒绝原因';
    
    activityLogger.logSuccess(
        '拒绝原因管理',
        '查询',
        searchDescription
    ).catch(err => {
        console.error("记录查询日志失败:", err);
    });
    
    query.pageNum = 1;
    getData();
  } catch (error) {
    console.error("查询操作失败:", error);
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
  // 获取要删除的拒绝原因信息，用于记录日志
  const refuseReasonInfo = tableData.value[index];
  
  // 二次确认删除
  ElMessageBox.confirm("确定要删除这个拒绝原因吗？", "删除确认", {
    type: "warning",
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
  })
    .then(async () => {
      try {
        const res = await request.delete(root + sid);
        if (res.data) {
          // 记录活动日志（使用activityLogger自动获取真实IP）
          activityLogger.logSuccess(
            '拒绝原因管理',
            '删除',
            `删除了拒绝原因：${refuseReasonInfo.reason}`,
            sid,
            'refuse_reason',
            refuseReasonInfo,
            null
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });
          
          ElMessage.success("删除成功");
          tableData.value.splice(index, 1);
          pageTotal.value -= 1;
        } else {
          ElMessage.error("删除失败");
        }
      } catch (error) {
        console.error("删除操作失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// 新增操作
const handleAdd = () => {
  router.push("/admin/parking/addRefuseReason");
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
  reason: "",
  sortno: "",
});

const handleEdit = (id) => {
  console.log(id)
  router.push({ path: "/admin/parking/addRefuseReason", query: { id: id } });
};
</script>

<style scoped lang="scss">
.refuse-reason-management {
  padding: 0 20px 20px 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px 32px;
  margin-bottom: 0;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;

    .title-icon {
      .header-icon {
        width: 24px;
        height: 24px;
        filter: brightness(0) invert(1);
      }
    }

    .title-text {
      color: white;

      h1 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .title-desc {
        font-size: 12px;
        opacity: 0.9;
        margin: 0;
        font-weight: 400;
      }
    }
  }
}

/* 搜索面板样式 */
.search-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;

  .search-panel-header {
    padding: 20px 24px;
    background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
    }

    .search-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #475569;

      .el-icon {
        font-size: 18px;
        color: #3b82f6;
      }

      .toggle-icon {
        margin-left: auto;
        transition: transform 0.3s ease;
        color: #94a3b8;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  .search-panel-body {
    padding: 24px;

    .search-form {
      .search-row {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;

        .search-item {
          margin-bottom: 0;

          .search-input {
            width: 300px;
          }
        }

        .search-buttons-inline {
          display: flex;
          gap: 12px;
          margin-left: auto;

          .el-button {
            font-weight: 500;
          }
        }
      }
    }
  }
}

/* 表格面板样式 */
.table-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .table-panel-header {
    padding: 20px 24px;
    background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #475569;
      font-size: 16px;

      .el-icon {
        font-size: 18px;
        color: #3b82f6;
      }
    }

    .table-stats {
      color: #64748b;
      font-size: 14px;
    }
  }

  .table-panel-body {
    padding: 0;

    .modern-table {
      border: none;

      :deep(.el-table__header) {
        background-color: #f8fafc;

        th {
          background-color: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          padding: 16px 12px;
        }
      }

      :deep(.el-table__body) {
        tr {
          &:hover {
            background-color: #f8fafc !important;
          }

          td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
        }
      }
    }

    .pagination {
      padding: 20px 24px;
      background: #fafbfc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: center;
    }
  }
}

/* 表格单元格样式 */
.reason-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .reason-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
  }

  .reason-details {
    .reason-name {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .reason-desc {
      font-size: 12px;
      color: #64748b;
    }
  }
}

.sort-info {
  display: flex;
  justify-content: center;

  .el-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .refuse-reason-management {
    padding: 16px;
  }

  .page-header {
    padding: 20px;

    .page-title {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .title-text h1 {
        font-size: 24px;
      }
    }
  }

  .search-panel-body {
    .search-form .search-row {
      flex-direction: column;
      align-items: stretch;

      .search-item {
        .search-input {
          width: 100%;
        }
      }

      .search-buttons-inline {
        margin-left: 0;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }

  .reason-info-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .reason-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }
}

/* 深色模式适配 */
.dark {
  .refuse-reason-management {
    background: #0f172a;
  }

  .page-header {
    background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
  }

  .search-panel,
  .table-panel {
    background: #1e293b;
    border: 1px solid #334155;

    .search-panel-header,
    .table-panel-header {
      background: #334155;
      border-bottom-color: #475569;
    }
  }

  .reason-info-cell .reason-icon {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
}

/* 表格行样式优化 */
:deep(.odd-row) {
  background: #f8fafc !important;
}

:deep(.even-row) {
  background: white !important;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-table) {
  .el-table__header tr,
  .el-table__header th {
    padding: 0;
    height: 48px;
    font-size: 14px;
    background-color: #f8fafc !important;
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;

  &.is-link {
    padding: 8px 12px;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 0 1px #3b82f6;
  }
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
