<template>
  <div class="member-audit-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/MemberAudit.svg" alt="访客审批" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>访客审批管理</h1>
            <p class="title-desc">管理访客申请的审批流程，支持快速审核和详细记录</p>
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
                <el-form-item label="小区名称" class="search-item">
                  <el-select 
                    v-model="query.community" 
                    placeholder="请选择小区" 
                    clearable 
                    filterable
                    class="search-select"
                  >
                    <el-option
                      v-for="item in communityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="访客姓名" class="search-item">
                  <el-input 
                    v-model="query.username" 
                    placeholder="请输入访客姓名" 
                    clearable
                    maxlength="13"
                    class="search-input"
                  />
                </el-form-item>

                <el-form-item label="申请时间" class="search-item">
                  <el-date-picker 
                    v-model="query.applydate" 
                    type="date" 
                    placeholder="选择申请日期" 
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" 
                    clearable
                    class="search-date"
                  />
                </el-form-item>
                
                <!-- 操作按钮紧跟搜索框 -->
                <div class="search-buttons-inline">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small">
                    搜索
                  </el-button>
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
            <span>访客申请列表</span>
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
            <!-- 访客信息列 -->
            <el-table-column label="访客信息" width="200" fixed="left">
              <template #default="{ row }">
                <div class="visitor-info-cell">
                  <div class="visitor-icon">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="visitor-details">
                    <div class="visitor-name">{{ row.nickname }}</div>
                    <div class="visitor-phone">{{ row.phone }}</div>
                    <div class="visitor-gender">
                      <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small" effect="plain">
                        {{ row.gender }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 申请信息列 -->
            <!-- <el-table-column label="申请信息" width="180">
              <template #default="{ row }">
                <div class="application-info">
                  <div class="app-item">
                    <el-icon><Document /></el-icon>
                    <span>{{ row.applicationNo }}</span>
                  </div>
                  <div class="app-item">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ row.applydate }}</span>
                  </div>
                </div>
              </template>
            </el-table-column> -->

            <!-- 访问地址列 -->
            <el-table-column label="访问地址" min-width="250">
              <template #default="{ row }">
                <div class="address-info">
                  <div class="address-text">
                    <el-icon><Location /></el-icon>
                    <span>{{ row.fullAddress }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 申请原因列 -->
            <el-table-column label="申请原因" width="220">
              <template #default="{ row }">
                <div class="reason-cell">
                  <el-tooltip :content="`申请原因：${row.reason}`" placement="top" effect="dark">
                    <span class="visit-reason-tag">
                      <el-icon><MessageBox /></el-icon>
                      {{ row.reason }}
                    </span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>

            <!-- 审批状态列 -->
            <el-table-column label="审批状态" prop="auditstatus" align="center" width="150">
              <template #default="{ row }">
                <div class="status-cell">
                  <el-tag type="info" v-if="row.auditstatus === '待审批'" effect="dark">
                    <el-icon><Clock /></el-icon>
                    待审批
                  </el-tag>
                  <el-tag type="success" v-else-if="row.auditstatus === '已通过'" effect="dark">
                    <el-icon><Check /></el-icon>
                    已通过
                  </el-tag>
                  <el-tag type="danger" v-else-if="row.auditstatus === '未通过'" effect="dark">
                    <el-icon><Close /></el-icon>
                    未通过
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 审批信息列 -->
            <el-table-column label="审批信息" width="200">
              <template #default="{ row }">
                <div v-if="row.auditusername || row.auditdate" class="audit-info">
                  <div v-if="row.auditusername" class="audit-item">
                    <el-icon><UserFilled /></el-icon>
                    <span>{{ row.auditusername }}</span>
                  </div>
                  <div v-if="row.auditdate" class="audit-item">
                    <el-icon><Timer /></el-icon>
                    <span>{{ row.auditdate }}</span>
                  </div>
                  <div v-if="row.refusereason" class="audit-item">
                    <el-icon><ChatDotRound /></el-icon>
                    <span class="audit-reason">{{ row.refusereason }}</span>
                  </div>
                </div>
                <div v-else class="no-audit-info">
                  <span>待审批</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="handleEdit(row)"
                    :disabled="row.auditstatus !== '待审批'"
                  >
                    <el-icon><Edit /></el-icon>
                    审批
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

    <!-- 访客审批对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="访客审批" 
      width="600px" 
      class="modern-dialog"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div class="dialog-content">
        <el-form :model="form.data" ref="formRef" class="modern-form">
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><DocumentChecked /></el-icon>
              审批决定
            </h3>
            <div class="form-grid">
              <el-form-item label="审核结果" prop="auditstatus" required>
                <el-radio-group v-model="form.data.auditstatus" class="audit-radio-group">
                  <el-radio label="已通过" class="audit-radio pass">
                    <el-icon><CircleCheck /></el-icon>
                    通过
                  </el-radio>
                  <el-radio label="未通过" class="audit-radio reject">
                    <el-icon><CircleClose /></el-icon>
                    拒绝
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon><EditPen /></el-icon>
              审批意见
            </h3>
            <div class="form-grid full-width">
              <el-form-item label="审批原因" prop="refusereason">
                <el-input 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入审批原因或意见..." 
                  v-model="form.data.refusereason"
                  class="form-textarea"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="confirm-btn" @click="save">
            <el-icon><Check /></el-icon>
            确定审批
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { 
  Search, ArrowDown, List, Edit, User, Document, Calendar,
  Location, MessageBox, Clock, Check, Close, UserFilled, 
  Timer, ChatDotRound, DocumentChecked, CircleCheck, 
  CircleClose, EditPen
} from '@element-plus/icons-vue';
import { activityApi } from '../../api/activity';

const visitorRoot = "/parking/visitor/";
const router = useRouter();
const route = useRoute();
const store = useStore();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 切换搜索面板
const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 访客申请表格配置
const visitorProps = [
  { label: "申请编号", prop: "applicationNo" },
  { label: "访客姓名", prop: "nickname" },
  { label: "手机号", prop: "phone" },
  { label: "性别", prop: "gender" },
  { label: "访问地址", prop: "fullAddress" },
  { label: "申请原因", prop: "reason" },
  { label: "申请时间", prop: "applydate" },
  { label: "审批人", prop: "auditusername" },
  { label: "审批时间", prop: "auditdate" },
  { label: "备注", prop: "refusereason" },
];

const handleClose = (done) => {
  ElMessageBox.confirm("确定放弃审批操作并关闭吗?", "确认关闭", {
    type: "warning",
    confirmButtonText: "确定关闭",
    cancelButtonText: "继续审批",
  })
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

// 从 localStorage 获取审批人信息
const getAuditorName = () => {
  return localStorage.getItem('js-username') || '系统管理员';
};

const form = reactive({
  data: {
    id: "",
    auditstatus: "",
    refusereason: "",
    auditusername: getAuditorName(), // 从浏览器存储获取审批人名称
  },
});

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

const handleEdit = async (row) => {
  try {
    // 记录开始审批操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";
    
    await activityApi.logVisitorOperation(
        userId,
        username,
        "开始审批",
        `开始审批访客申请 (访客: ${row.nickname || '未知'}, 申请人: ${row.applier || '未知'})`,
        row.id,
        JSON.stringify({ 
            visitorName: row.nickname,
            applier: row.applier,
            community: row.community,
            currentStatus: row.auditstatus
        }),
        null
    ).catch(err => {
        console.error("记录审批开始日志失败:", err);
    });
    
    // 重置表单数据
    form.data = {
      id: row.id,
      auditstatus: "",
      refusereason: "",
      auditusername: getAuditorName(), // 从浏览器存储获取审批人名称
    };
    
    dialogVisible.value = true;
  } catch (error) {
    console.error("开始审批操作失败:", error);
    // 即使日志记录失败，也要继续执行审批
    form.data = {
      id: row.id,
      auditstatus: "",
      refusereason: "",
      auditusername: getAuditorName(),
    };
    dialogVisible.value = true;
  }
};

// 固定为访客申请
const currentTab = ref('visitor');

// 表格属性固定为访客申请
const currentProps = ref(visitorProps);

const query = reactive({
  id: "",
  username: "",
  community: "",
  applydate: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisible = ref(false);

// 小区选项数据
const communityOptions = ref([]);

// 获取小区列表
const getCommunityList = () => {
  request
    .get("/parking/community/getAllCommunity")
    .then((res) => {
      if (res.data && Array.isArray(res.data)) {
        // 提取唯一的小区名称
        const uniqueCommunities = [...new Set(res.data.map(item => item.community))];
        communityOptions.value = uniqueCommunities.map(community => ({
          label: community,
          value: community
        }));
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        // 提取唯一的小区名称
        const uniqueCommunities = [...new Set(res.data.data.map(item => item.community))];
        communityOptions.value = uniqueCommunities.map(community => ({
          label: community,
          value: community
        }));
      }
    })
    .catch((error) => {
      console.error('获取小区列表失败:', error);
      // 如果API调用失败，使用默认选项
      communityOptions.value = [
        { label: '四季上东', value: '四季上东' },
        { label: '万象上东', value: '万象上东' }
      ];
    });
};

// 获取表格数据
const getData = () => {
  const apiUrl = visitorRoot + "mypage";
  
  request
    .get(apiUrl, {
      params: query,
    })
    .then((res) => {
      if (res.data && res.data.records) {
        tableData.value = res.data.records;
        pageTotal.value = res.data.total || 0;
      } else {
        tableData.value = [];
        pageTotal.value = 0;
      }
    })
    .catch((error) => {
      console.error('获取数据失败:', error);
      ElMessage.error('获取数据失败，请重试');
      tableData.value = [];
      pageTotal.value = 0;
    });
};

getData();
getCommunityList();

// 查询操作
const handleSearch = async () => {
  try {
    // 记录查询操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";
    
    // 构建查询条件描述
    const searchConditions = [];
    if (query.community) searchConditions.push(`小区名称: ${query.community}`);
    if (query.username) searchConditions.push(`访客姓名: ${query.username}`);
    if (query.applydate) searchConditions.push(`申请时间: ${query.applydate}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询访客审批记录 (${searchConditions.join(', ')})` 
        : '查询所有访客审批记录';
    
    await activityApi.logVisitorOperation(
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

// 表格编辑时弹窗和保存
const formRef = ref(null);
const save = () => {
  if (form.data.id === "") {
    ElMessage.warning("请选择要审批的记录");
    return
  }
  
  if (!form.data.auditstatus) {
    ElMessage.warning("请选择审批结果");
    return
  }
  
  // 表单校验
  formRef.value.validate((valid) => {
    if (valid) {
      // 使用访客审批接口
      const apiUrl = "/parking/visitor/audit";
      
      request({
        url: apiUrl,
        method: "PUT",
        data: form.data,
      }).then(async (res) => {
        dialogVisible.value = false;
        
        if (res.code === null || res.code === "0") {
          // 记录活动日志
          try {
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "未知用户";
            const visitorInfo = tableData.value.find(item => item.id === form.data.id);
            const description = `完成访客申请审批 - 访客: ${visitorInfo?.nickname || '未知'}, 申请人: ${visitorInfo?.applier || '未知'}, 审批结果: ${form.data.auditstatus}${form.data.refusereason ? ', 审批意见: ' + form.data.refusereason : ''}`;
            
            await activityApi.logVisitorOperation(
              userId,
              username,
              "审批完成",
              description,
              form.data.id,
              JSON.stringify({ 
                visitorName: visitorInfo?.nickname,
                applier: visitorInfo?.applier,
                auditResult: form.data.auditstatus,
                auditReason: form.data.refusereason,
                community: visitorInfo?.community
              }),
              form.data.auditstatus === "已通过" ? "success" : "warning"
            );
          } catch (error) {
            console.error('记录审批日志失败:', error);
          }
          
          // 重置表单数据
          form.data = {
            id: "",
            auditstatus: "",
            refusereason: "",
            auditusername: getAuditorName(), // 从浏览器存储获取审批人名称
          };
          
          // 刷新表格数据
          getData();
          ElMessage.success('访客申请审批成功！');
        } else {
          ElMessage.error(res.msg || '审批失败，请重试');
        }
      }).catch((error) => {
        console.error('审批失败:', error);
        ElMessage.error('审批失败，请重试');
        dialogVisible.value = false;
      });
    } else {
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.member-audit-management {
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
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
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
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

          .search-select,
          .search-input,
          .search-date {
            width: 200px;
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
.visitor-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .visitor-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
  }

  .visitor-details {
    .visitor-name {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .visitor-phone {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
      font-family: monospace;
    }

    .visitor-gender {
      display: flex;
      align-items: center;
    }
  }
}

.application-info, .audit-info {
  .app-item, .audit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 13px;
    color: #64748b;

    .el-icon {
      font-size: 14px;
      color: #3b82f6;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .audit-reason {
    font-style: italic;
    color: #f59e0b;
    font-weight: 500;
  }
}

.address-info {
  .address-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    line-height: 1.5;

    .el-icon {
      font-size: 16px;
      color: #10b981;
      flex-shrink: 0;
    }
  }
}

.reason-cell {
  display: flex;
  justify-content: center;

  .visit-reason-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 12px;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    transition: all 0.3s ease;

    .el-icon {
      font-size: 14px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
    }
  }
}

.status-cell {
  display: flex;
  justify-content: center;

  .el-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
}

.no-audit-info {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 对话框样式 */
.modern-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    .el-dialog__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 16px 16px 0 0;

      .el-dialog__title {
        font-size: 20px;
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        top: 24px;
        right: 32px;

        .el-dialog__close {
          color: white;
          font-size: 20px;
        }
      }
    }

    .el-dialog__body {
      padding: 0;
    }
  }

  .dialog-content {
    padding: 32px;
  }

  .modern-form {
    .form-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid transparent;
        background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%) bottom;
        background-size: 100% 2px;
        background-repeat: no-repeat;

        .el-icon {
          font-size: 18px;
          color: #3b82f6;
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;

        &.full-width {
          grid-template-columns: 1fr;
        }

        .el-form-item {
          margin-bottom: 0;

          :deep(.el-form-item__label) {
            font-weight: 600;
            color: #374151;
          }

          .audit-radio-group {
            display: flex;
            gap: 24px;

            .audit-radio {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 16px 24px;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              transition: all 0.3s ease;
              cursor: pointer;

              &.pass {
                &:hover, &.is-checked {
                  border-color: #10b981;
                  background: #f0fdf4;
                  color: #047857;
                }
              }

              &.reject {
                &:hover, &.is-checked {
                  border-color: #ef4444;
                  background: #fef2f2;
                  color: #dc2626;
                }
              }

              :deep(.el-radio__input) {
                display: none;
              }

              :deep(.el-radio__label) {
                font-weight: 600;
                font-size: 16px;
              }

              .el-icon {
                font-size: 20px;
              }
            }
          }

          .form-textarea {
            width: 100%;
            :deep(.el-textarea__inner) {
              border-radius: 8px;
              border: 2px solid #e2e8f0;
              transition: border-color 0.3s ease;

              &:focus {
                border-color: #3b82f6;
              }
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      padding: 12px 24px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;

      &.cancel-btn {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;

        &:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }
      }

      &.confirm-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-color: #3b82f6;

        &:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .member-audit-management {
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
        .search-select,
        .search-input,
        .search-date {
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

  .visitor-info-cell {
    .visitor-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }

  .modern-dialog {
    .dialog-content {
      padding: 20px;
    }

    .modern-form {
      .form-section {
        .form-grid {
          .audit-radio-group {
            flex-direction: column;
            gap: 12px;
          }
        }
      }
    }
  }
}

/* 深色模式适配 */
.dark {
  .member-audit-management {
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

  .modern-dialog {
    :deep(.el-dialog) {
      background: #1e293b;
      border: 1px solid #334155;

      .el-dialog__header {
        background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
      }
    }

    .dialog-footer {
      background: #334155;
      border-top-color: #475569;
    }
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

  &:disabled {
    opacity: 0.5;
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

:deep(.el-date-editor .el-input__wrapper) {
  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px #3b82f6;
  }
}
</style>