<template>
  <div class="butler-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="../../icons/svg/Valliage.svg" alt="管家管理" class="header-icon">
          </div>
          <div class="title-text">
            <h1>管家管理</h1>
            <p class="title-desc">管理小区管家信息、权限设置和二维码验证</p>
          </div>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd" class="action-btn">
            新增管家
          </el-button>
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
            <span>搜索条件</span>
            <el-icon :class="['toggle-icon', { 'expanded': searchPanelExpanded }]">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="searchPanelExpanded" class="search-panel-body">
            <el-form :inline="true" :model="query" class="search-form" label-width="80px">
              <div class="search-row">
                <el-form-item label="小区名称" class="search-item">
                  <el-select v-model="query.community" placeholder="请选择小区" clearable
                    class="search-select">
                    <el-option v-for="item in searchCommunityList" :key="item.community"
                      :label="item.community" :value="item.community">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="管家姓名" class="search-item">
                  <el-input v-model="query.ownername" placeholder="请输入管家姓名" clearable
                    class="search-input"></el-input>
                </el-form-item>
                <div class="search-actions">
                  <el-button type="primary" icon="Search" @click="handleSearch" size="small"
                    class="search-btn">
                    搜索
                  </el-button>
                </div>
              </div>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 管家列表 -->
      <div class="table-panel">
        <div class="table-panel-header">
          <div class="table-title">
            <el-icon>
              <User />
            </el-icon>
            <span>管家列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>
        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable"
            :row-class-name="tableRowClassName" stripe>

            <!-- 管家信息列 -->
            <el-table-column label="管家信息" width="250" fixed="left">
              <template #default="{ row }">
                <div class="butler-info-cell">
                  <div class="butler-avatar">
                    {{ row.username?.charAt(0) || '管' }}
                  </div>
                  <div class="butler-details">
                    <div class="butler-name">{{ row.username }}</div>
                    <div class="butler-code">{{ row.usercode }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 联系方式列 -->
            <el-table-column label="联系方式" width="180">
              <template #default="{ row }">
                <div class="contact-info-cell">
                  <el-icon class="phone-icon">
                    <Phone />
                  </el-icon>
                  <span class="phone-number">{{ row.phone || '未设置' }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 地区信息列 -->
            <el-table-column label="地区信息" width="300">
              <template #default="{ row }">
                <div class="address-info-cell">
                  <div class="address-region">
                    {{ row.province }}-{{ row.city }}-{{ row.district }}
                  </div>
                  <div class="address-community">
                    <el-tag type="success" size="small" class="community-tag">
                      {{ row.community }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === '已确定' ? 'success' : row.status === '待确认' ? 'warning' : 'info'" 
                  size="small"
                  class="status-tag"
                >
                  {{ row.status || '待确认' }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="350" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <!-- 主要操作按钮 -->
                  <el-button type="primary" link icon="Edit" @click="handleEdit(row)" 
                    class="action-btn" size="small">
                    编辑
                  </el-button>
                  <el-button type="success" link icon="Briefcase" @click="createQrCode(row)" 
                    class="action-btn" size="small">
                    二维码
                  </el-button>
                  <el-button type="warning" link icon="Setting" @click="handleAuth(row)" 
                    class="action-btn" size="small">
                    权限
                  </el-button>
                  
                  <!-- 确认状态按钮 - 只对待确认状态显示 -->
                  <el-button 
                    v-if="row.status === '待确认'" 
                    type="info" 
                    link 
                    icon="CircleCheck" 
                    @click="confirmStatus(row)" 
                    class="action-btn" 
                    size="small"
                  >
                    确认
                  </el-button>
                  
                  <!-- 危险操作 - 下拉菜单 -->
                  <el-dropdown trigger="click" @command="handleDropdownCommand($event, row)">
                    <el-button type="danger" link size="small" class="danger-btn">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="delete" icon="Delete">
                          <span style="color: #f56c6c;">删除管家</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination :currentPage="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
          @current-change="handlePageChange">
        </el-pagination>
      </div>
    </div>

    <!-- 二维码对话框 -->
    <el-dialog 
      v-model="qrCodeVisible" 
      title="管家二维码" 
      width="400px"
      class="modern-dialog qr-dialog"
    >
      <div class="qr-content">
        <div class="qr-info">
          <div class="qr-title">{{ qrData.name }}</div>
          <div class="qr-description">扫描二维码进行管家验证</div>
        </div>
        <div class="qr-code-container">
          <qrcode-vue 
            id="picture" 
            render-as="canvas" 
            margin="5" 
            level="H" 
            background="#ffffff" 
            :value="qrData.payUrl"
            :size="qrData.size"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="qrCodeVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="handleDownloadLocal" class="save-btn">保存二维码</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 管家编辑对话框 -->
    <el-dialog 
      :title="form.data.id ? '修改管家信息' : '新增管家信息'" 
      v-model="dialogVisible" 
      width="600px"
      :close-on-click-modal="false"
      class="modern-dialog"
    >
      <el-form :model="form.data" ref="formRef" label-width="100px" class="modern-form">
        <div class="form-section">
          <h3 class="section-title">地区信息</h3>
          <div class="form-grid grid-2">
            <el-form-item label="省份">
              <el-select v-model="form.data.province" placeholder="请选择省份" @change="changeProvince"
                class="form-select">
                <el-option 
                  v-for="item in provinceList" 
                  :key="item.province" 
                  :label="item.province" 
                  :value="item.province"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="地市">
              <el-select v-model="form.data.city" placeholder="请选择地市" @change="changeCity"
                class="form-select">
                <el-option 
                  v-for="item in cityList" 
                  :key="item.city" 
                  :label="item.city" 
                  :value="item.city"
                />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-grid grid-2">
            <el-form-item label="区县">
              <el-select v-model="form.data.district" placeholder="请选择区县" @change="changeDistrict"
                class="form-select">
                <el-option 
                  v-for="item in districtList" 
                  :key="item.district" 
                  :label="item.district" 
                  :value="item.district"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="小区">
              <el-select v-model="form.data.community" placeholder="请选择小区" @change="changeCommunity"
                class="form-select">
                <el-option 
                  v-for="item in communityList" 
                  :key="item.community" 
                  :label="item.community"
                  :value="item.community"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">管家信息</h3>
          <div class="form-grid grid-2">
            <el-form-item label="管家代码">
              <el-input 
                v-model="form.data.usercode" 
                placeholder="请输入管家代码"
                class="form-input"
              />
            </el-form-item>
            
            <el-form-item label="管家名称">
              <el-input 
                v-model="form.data.username" 
                placeholder="请输入管家名称"
                class="form-input"
              />
            </el-form-item>
          </div>
          
          <div class="form-grid grid-1">
            <el-form-item label="管家电话">
              <el-input 
                v-model="form.data.phone" 
                placeholder="请输入管家电话"
                class="form-input"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="save" class="save-btn">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 管家权限对话框 -->
    <el-dialog 
      title="管家权限设置" 
      v-model="treeVisible" 
      width="700px"
      class="modern-dialog"
    >
      <div class="auth-content">
        <div class="auth-info">
          <div class="info-item">
            <span class="label">管家姓名：</span>
            <span class="value">{{ saveTreeInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">所属小区：</span>
            <span class="value">{{ saveTreeInfo.community }}</span>
          </div>
        </div>
        
        <div class="tree-container">
          <div v-if="treeLoading" class="loading-container">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <p style="margin-top: 12px; color: #909399;">加载中...</p>
          </div>
          <div v-else-if="!treeData || treeData.length === 0" class="empty-container">
            <el-empty description="暂无楼栋单元数据" :image-size="100" />
          </div>
          <el-tree 
            v-else
            ref="tree" 
            :data="treeData" 
            show-checkbox 
            node-key="id" 
            :props="treeProps"
            class="permission-tree"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="treeVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="saveTree" class="save-btn">保存权限</el-button>
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
import "@/assets/font_3904303_u891dmfllhm/iconfont.css";
import { useStore } from "vuex";
import QrcodeVue from "qrcode.vue";
import { ArrowDown, Search, User, Phone, Edit, Delete, Plus, Setting, MoreFilled, Loading, CircleCheck } from '@element-plus/icons-vue';
import { activityApi } from '../../api/activity';

const root = "/parking/butler/";
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = [
  { label: "省份", prop: "province" },
  { label: "地市", prop: "city" },
  { label: "县区", prop: "district" },
  { label: "小区", prop: "community" },
  { label: "管家代码", prop: "usercode" },
  { label: "管家姓名", prop: "username" },
  { label: "管家电话", prop: "phone" },
  { label: "状态", prop: "status" },
];

const qrData = reactive({
  payUrl: "这只是一个测试!",
  size: 300,
  name: "",
});

const form = reactive({
  data: {
    id: "",
    province: "",
    city: "",
    district: "",
    community: "",
    usercode: "",
    username: "",
    phone: "",
    status: "",
    createman: "",
  },
});

const queryTree = reactive({
  province: "",
  city: "",
  district: "",
  community: "",
});

const saveTreeInfo = reactive({
  province: "",
  city: "",
  district: "",
  community: "",
  usercode: "",
  username: "",
  arrayId: [],
});

const query = reactive({
  community: "",
  ownername: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const treeData = ref([]);
const pageTotal = ref(0);
const loginName = localStorage.getItem("loginname");
const dialogVisible = ref(false);
const treeVisible = ref(false);
const qrCodeVisible = ref(false);
const searchCommunityList = ref([]);
const searchPanelExpanded = ref(false);
const treeLoading = ref(false);

// 切换搜索面板展开状态
const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 表格样式
const tableRowClassName = ({ row, rowIndex }) => {
  if ((rowIndex + 1) % 2 == 0) {
    return "odd-row";
  } else if ((rowIndex + 1) % 2 != 0) {
    return "even-row";
  }
};

const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let style = { padding: "12px 8px" };
  return style;
};

// 重置表单
const onReset = () => {
  form.data.id = "";
  form.data.province = "";
  form.data.city = "";
  form.data.district = "";
  form.data.community = "";
  form.data.usercode = "";
  form.data.username = "";
  form.data.phone = "";
  form.data.status = "";
  form.data.createman = "";
};

// 获取小区列表数据
const getCommunityList = () => {
  request.get("/parking/community/allCommunity").then((res) => {
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      searchCommunityList.value = res.data;
    } else {
      getCommunityFromButler();
    }
  }).catch((error) => {
    getCommunityFromButler();
  });
};

// 从管家数据中提取小区信息
const getCommunityFromButler = () => {
  request.get(root + "querypage", {
    params: { pageNum: 1, pageSize: 1000 }
  }).then((res) => {
    if (res.data && res.data.records && res.data.records.length > 0) {
      const communities = [...new Set(res.data.records
        .map(item => item.community)
        .filter(community => community && community.trim() !== '')
      )];
      searchCommunityList.value = communities.map(community => ({ community }));
    }
  }).catch((error) => {
    console.log("获取小区列表失败:", error);
  });
};

// 生成二维码下载
const handleDownloadLocal = async () => {
  try {
    // 记录二维码下载操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";
    
    await activityApi.logButlerOperation(
        userId,
        username,
        "下载",
        `下载管家二维码: ${qrData.name}`,
        null,
        null,
        JSON.stringify({ qrCodeName: qrData.name })
    ).catch(err => {
        console.error("记录下载日志失败:", err);
    });
    
    const myCanvas = document.getElementById("picture");
    const a = document.createElement("a");
    a.href = myCanvas.toDataURL("image/png");
    a.download = qrData.name;
    a.click();
    qrCodeVisible.value = false;
    ElMessage.success("下载完成！");
  } catch (error) {
    console.error("下载操作失败:", error);
    // 即使日志记录失败，也要继续执行下载
    const myCanvas = document.getElementById("picture");
    const a = document.createElement("a");
    a.href = myCanvas.toDataURL("image/png");
    a.download = qrData.name;
    a.click();
    qrCodeVisible.value = false;
    ElMessage.success("下载完成！");
  }
};

// 获取表格数据
const getData = () => {
  request
    .get(root + "querypage", {
      params: query,
    })
    .then((res) => {
      tableData.value = res.data.records;
      pageTotal.value = res.data.total;
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
    if (query.community) searchConditions.push(`小区名称: ${query.community}`);
    if (query.ownername) searchConditions.push(`管家姓名: ${query.ownername}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询管家信息 (${searchConditions.join(', ')})` 
        : '查询所有管家信息';
    
    await activityApi.logButlerOperation(
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

// 处理下拉菜单命令
const handleDropdownCommand = (command, row) => {
  if (command === 'auth') {
    handleAuth(row);
  } else if (command === 'delete') {
    handleDelete(null, row.id);
  }
};

// 删除操作
const handleDelete = (index, sid) => {
  // 获取要删除的管家信息，用于记录日志
  const butlerInfo = tableData.value.find(item => item.id === sid);
  
  ElMessageBox.confirm("确定要删除这个管家吗？", "删除确认", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(async () => {
      try {
        const res = await request.delete(root + sid);
        console.log("删除操作结果", res);
        if (res.data || res.code === '0') {
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "管理员";
          
          console.log("准备记录删除日志，参数:", {
            userId,
            username,
            action: "删除",
            description: `删除了管家 ${butlerInfo?.username} (${butlerInfo?.usercode})`,
            butlerId: sid,
            butlerInfo
          });
          
          await activityApi.logButlerOperation(
            userId,
            username,
            "删除",
            `删除了管家 ${butlerInfo?.username} (${butlerInfo?.usercode})`,
            sid,
            JSON.stringify(butlerInfo),
            null
          ).then(result => {
            console.log("删除日志记录成功:", result);
          }).catch(err => {
            console.error("记录删除日志失败:", err);
          });
          
          ElMessage.success("删除成功");
          getData();
        } else {
          ElMessage.error("删除失败");
        }
      } catch (error) {
        console.error('删除操作异常:', error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      // ElMessage.info("已取消删除");
    });
};

// 新增操作
const handleAdd = () => {
  dialogVisible.value = true;
  onReset();
  form.data.createman = loginName;
};

// 管家权限
const handleAuth = (row) => {
  treeVisible.value = true;
  treeLoading.value = true;
  treeData.value = [];
  
  queryTree.province = row.province;
  queryTree.city = row.city;
  queryTree.district = row.district;
  queryTree.community = row.community;
  saveTreeInfo.province = row.province;
  saveTreeInfo.city = row.city;
  saveTreeInfo.district = row.district;
  saveTreeInfo.community = row.community;
  saveTreeInfo.usercode = row.usercode;
  saveTreeInfo.username = row.username;

  // 获取所有楼层
  console.log("=== 权限请求参数 ===");
  console.log("请求URL:", root + "getCommunityInfo");
  console.log("请求参数:", queryTree);
  request({
    url: root + "getCommunityInfo",
    method: "GET",
    params: queryTree,
  }).then((res) => {
    console.log("获取楼栋单元数据:", res.data);
    if (res.data && res.data.data) {
      treeData.value = res.data.data;
    } else if (res.data) {
      treeData.value = res.data;
    }
    
    // 获取所管楼层 - 在树形数据加载完成后再加载已选中的节点
    let manageInfo = {
      province: row.province,
      city: row.city,
      district: row.district,
      community: row.community,
      usercode: row.usercode,
    };
    
    request({
      url: root + "getManageArea",
      method: "GET",
      params: manageInfo,
    }).then((manageRes) => {
      console.log("获取已管理区域:", manageRes.data);
      // 设置已选中的节点
      if (manageRes.data && Array.isArray(manageRes.data)) {
        // 使用 nextTick 确保树形控件已经渲染完成
        setTimeout(() => {
          if (tree.value) {
            tree.value.setCheckedKeys(manageRes.data);
          }
        }, 100);
      } else if (manageRes.data && manageRes.data.data && Array.isArray(manageRes.data.data)) {
        setTimeout(() => {
          if (tree.value) {
            tree.value.setCheckedKeys(manageRes.data.data);
          }
        }, 100);
      }
    }).catch((err) => {
      console.error("获取已管理区域失败:", err);
    }).finally(() => {
      treeLoading.value = false;
    });
  }).catch((err) => {
    console.error("获取楼栋单元数据失败:", err);
    ElMessage.error("获取楼栋单元数据失败");
    treeLoading.value = false;
  });
};

const baseURL = "https://www.xuerparking.cn:8543/verify/butler/";

const createQrCode = async (row) => {
  try {
    // 记录二维码生成操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";
    
    console.log("准备记录二维码生成日志，参数:", {
      userId,
      username,
      action: "生成二维码",
      description: `为管家 ${row.username} (${row.usercode}) 生成二维码`,
      butlerId: row.id,
      butlerInfo: row
    });
    
    await activityApi.logButlerOperation(
      userId,
      username,
      "生成二维码",
      `为管家 ${row.username} (${row.usercode}) 生成二维码`,
      row.id,
      JSON.stringify(row),
      null
    ).then(result => {
      console.log("二维码生成日志记录成功:", result);
    }).catch(err => {
      console.error("记录二维码生成日志失败:", err);
    });
    
    qrCodeVisible.value = true;
    qrData.name = row.username + '_二维码';
    let date = new Date();
    let time = date.getTime();
    let timeunix = parseInt(time / 1000);
    let params = baseURL + "?applyKind=3&butlerId=" + row.id + "&time=" + timeunix + "&community=" + encodeURIComponent(row.community);
    qrData.payUrl = params;
  } catch (error) {
    console.error("二维码生成操作失败:", error);
    // 即使日志记录失败，也要继续执行二维码生成
    qrCodeVisible.value = true;
    qrData.name = row.username + '_二维码';
    let date = new Date();
    let time = date.getTime();
    let timeunix = parseInt(time / 1000);
    let params = baseURL + "?applyKind=3&butlerId=" + row.id + "&time=" + timeunix + "&community=" + encodeURIComponent(row.community);
    qrData.payUrl = params;
  }
};

const handleEdit = (row) => {
  dialogVisible.value = true;
  form.data.id = row.id;
  form.data.province = row.province;
  form.data.city = row.city;
  form.data.district = row.district;
  form.data.community = row.community;
  form.data.usercode = row.usercode;
  form.data.username = row.username;
  form.data.phone = row.phone;
  form.data.status = row.status;
  form.data.createman = row.createman;
};

const provinceList = ref([]);
const cityList = ref([]);
const districtList = ref([]);
const communityList = ref([]);

request.get("/parking/community/province").then((res) => {
  provinceList.value = res.data;
});

const changeProvince = () => {
  request
    .get("/parking/community/city", {
      params: {
        province: form.data.province,
      },
    })
    .then((res) => {
      cityList.value = res.data;
      form.data.city = "";
      form.data.district = "";
      form.data.community = "";
    });
};

const changeCity = () => {
  request
    .get("/parking/community/district", {
      params: {
        province: form.data.province,
        city: form.data.city,
      },
    })
    .then((res) => {
      districtList.value = res.data;
      form.data.district = "";
      form.data.community = "";
    });
};

const changeDistrict = () => {
  request
    .get("/parking/community/community", {
      params: {
        province: form.data.province,
        city: form.data.city,
        district: form.data.district,
      },
    })
    .then((res) => {
      communityList.value = res.data;
      form.data.community = "";
    });
};

const changeCommunity = () => {
  request
    .get("/parking/community/building", {
      params: {
        province: form.data.province,
        city: form.data.city,
        district: form.data.district,
        community: form.data.community,
      },
    })
    .then((res) => {
      // 可以在这里处理楼栋数据
    });
};

// 权限相关
const tree = ref();
const treeProps = {
  children: "children",
  label: "label",
};

const formRef = ref(null);

const save = async () => {
  if (!form.data.username || form.data.username.trim() === '') {
    ElMessage.error("请输入管家名称");
    return;
  }
  
  if (!form.data.usercode || form.data.usercode.trim() === '') {
    ElMessage.error("请输入管家代码");
    return;
  }

  var method = form.data.id === "" ? "POST" : "PUT";
  const isEdit = form.data.id !== "";
  
  try {
    const res = await request({
      url: "/parking/butler",
      method: method,
      data: form.data,
    });
    
    if (res.code != null) {
      // 记录活动日志
      const userId = localStorage.getItem("ms_userid") || "unknown";
      const username = localStorage.getItem("ms_username") || "管理员";
      const action = isEdit ? "修改" : "添加";
      const description = isEdit 
        ? `修改了管家 ${form.data.username} (${form.data.usercode}) 的信息`
        : `新增了管家 ${form.data.username} (${form.data.usercode})`;
      
      console.log("准备记录保存日志，参数:", {
        userId,
        username,
        action,
        description,
        isEdit,
        butlerId: res.data?.id || form.data.id,
        formData: form.data
      });
      
      await activityApi.logButlerOperation(
        userId,
        username,
        action,
        description,
        res.data?.id || form.data.id,
        isEdit ? JSON.stringify(form.data) : null,
        JSON.stringify(form.data)
      ).then(result => {
        console.log("保存日志记录成功:", result);
      }).catch(err => {
        console.error("记录活动日志失败:", err);
      });
      
      ElMessage.success("操作成功！");
      dialogVisible.value = false;
      getData();
    } else {
      dialogVisible.value = false;
      ElMessage.error(res.msg || "操作失败");
    }
    form.data = {};
  } catch (error) {
    console.error("保存操作失败:", error);
    ElMessage.error("操作失败");
    dialogVisible.value = false;
  }
};

const saveTree = async () => {
  let arrayId = tree.value.getCheckedKeys();
  saveTreeInfo.arrayId = arrayId;
  
  console.log("保存权限，选中的ID数量:", arrayId.length);
  
  try {
    const res = await request({
      url: "/parking/area/insertArea",
      method: "POST",
      data: saveTreeInfo,
    });
    
    if (res.code != null) {
      // 记录权限设置活动日志
      const userId = localStorage.getItem("ms_userid") || "unknown";
      const username = localStorage.getItem("ms_username") || "管理员";
      
      console.log("准备记录权限设置日志，参数:", {
        userId,
        username,
        action: "权限设置",
        description: `为管家 ${saveTreeInfo.username} (${saveTreeInfo.usercode}) 设置权限`,
        permissionIds: arrayId,
        saveTreeInfo
      });
      
      await activityApi.logButlerOperation(
        userId,
        username,
        "权限设置",
        `为管家 ${saveTreeInfo.username} (${saveTreeInfo.usercode}) 设置权限`,
        null,
        JSON.stringify({ 
          butler: saveTreeInfo, 
          permissions: arrayId 
        }),
        JSON.stringify({ 
          newPermissions: arrayId 
        })
      ).then(result => {
        console.log("权限设置日志记录成功:", result);
      }).catch(err => {
        console.error("记录权限设置日志失败:", err);
      });
      
      getData();
      ElMessage.success("权限设置成功！");
      treeVisible.value = false;
    } else {
      treeVisible.value = false;
      ElMessage.error(res.msg || "权限设置失败");
    }
    form.data = {};
  } catch (error) {
    console.error("权限设置操作失败:", error);
    ElMessage.error("权限设置失败");
    treeVisible.value = false;
  }
};

// 确认管家状态
const confirmStatus = async (row) => {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确认要将管家 ${row.username} (${row.phone}) 的状态更新为"已确定"吗？\n\n此操作将从user_mapper表中查询该手机号对应的openid并关联到管家账号。`,
      '确认状态',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    // 调用后端API
    const res = await request.post('/parking/butler/confirmStatus', null, {
      params: {
        phone: row.phone
      }
    });

    if (res.code === '0') {
      // 记录活动日志
      const userId = localStorage.getItem("ms_userid") || "unknown";
      const username = localStorage.getItem("ms_username") || "管理员";

      await activityApi.logButlerOperation(
        userId,
        username,
        "确认状态",
        `确认了管家 ${row.username} (${row.usercode}) 的状态，已关联openid`,
        row.id,
        JSON.stringify(row),
        JSON.stringify(res.data)
      ).catch(err => {
        console.error("记录确认状态日志失败:", err);
      });

      ElMessage.success(res.msg || '状态确认成功！');
      getData(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '状态确认失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认状态失败:', error);
      ElMessage.error(error.message || '确认状态失败');
    }
  }
};

// 初始化数据
getData();
getCommunityList();
</script>

<style lang="scss" scoped>
// 页面整体布局
.butler-management {
  padding: 0;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

// 页面头部样式
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
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

  .page-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;

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

  .page-actions {
    display: flex;
    gap: 12px;

    .action-btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

// 容器样式
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

// 搜索面板样式
.search-panel {
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;

  .search-panel-header {
    cursor: pointer;
    user-select: none;

    .search-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #409eff;
      }

      .toggle-icon {
        margin-left: auto;
        transition: transform 0.3s ease;
        font-size: 14px;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }

    &:hover {
      .search-title {
        color: #409eff;
      }
    }
  }

  .search-panel-body {
    padding-top: 16px;

    .search-form {
      .search-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;

        .search-item {
          margin-bottom: 0;
          flex: 0 0 auto;
          min-width: 160px;

          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #606266;
            white-space: nowrap;
            margin-bottom: 0;
          }

          .search-select,
          .search-input {
            width: 160px;
          }
        }

        .search-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex: 0 0 auto;

          .search-btn {
            height: 28px;
            padding: 0 14px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 12px;
            background: linear-gradient(45deg, #409eff, #6b9eff);
            border: none;

            &:hover {
              background: linear-gradient(45deg, #337ecc, #5a8dff);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }
    }
  }
}

// 表格面板样式
.table-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  margin-bottom: 24px;
  
  .table-panel-header {
    padding: 20px 24px;
    background: #fafbfc;
    border-bottom: 1px solid #e8eaed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .table-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      
      .el-icon {
        color: #409eff;
        font-size: 18px;
      }
    }

    .table-stats {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .table-panel-body {
    padding: 0;
    
    .modern-table {
      :deep(.el-table__header) {
        background-color: #f8f9fa;
        
        th {
          background-color: #f8f9fa !important;
          color: #606266;
          font-weight: 600;
          font-size: 15px;
          border-bottom: 2px solid #e8eaed;
        }
      }
      
      :deep(.el-table__row) {
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #f5f7fa !important;
        }
        
        &.el-table__row--striped {
          background-color: #fafbfc;
        }
      }
      
      :deep(.el-table__body) {
        font-size: 14px;
      }
    }
  }
}

// 表格单元格样式
.butler-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  
  .butler-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(45deg, #e6a23c, #f5b041);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .butler-details {
    min-width: 0;
    flex: 1;
    
    .butler-name {
      font-weight: 600;
      color: #303133;
      font-size: 15px;
      line-height: 1.4;
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .butler-code {
      color: #909399;
      font-size: 13px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.contact-info-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .phone-icon {
    color: #409eff;
    font-size: 14px;
    flex-shrink: 0;
  }
  
  .phone-number {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.address-info-cell {
  .address-region {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .address-community {
    .community-tag {
      font-weight: 500;
      font-size: 12px;
    }
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
  

  
  .action-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    &:hover {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }
  }
  
  .more-btn {
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #909399;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 28px;
    
    &:hover {
      color: #409eff;
      transform: translateY(-1px);
      background-color: #f0f9ff;
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

// 分页样式
.pagination {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  
  :deep(.el-pagination) {
    font-size: 14px;
    
    .el-pager li {
      border-radius: 6px;
      margin: 0 2px;
      font-size: 14px;
      
      &.is-active {
        background: linear-gradient(45deg, #409eff, #6b9eff);
        border: none;
      }
    }
    
    .btn-prev,
    .btn-next {
      border-radius: 6px;
      font-size: 14px;
    }
    
    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      font-size: 14px;
    }
  }
}

// 对话框样式
.modern-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      margin: 0;

      .el-dialog__title {
        color: white;
        font-weight: 600;
        font-size: 18px;
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: white;
          font-size: 18px;
        }
      }
    }

    .el-dialog__body {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 16px 24px 24px;
      text-align: right;
    }
  }

  &.qr-dialog {
    .qr-content {
      text-align: center;

      .qr-info {
        margin-bottom: 20px;

        .qr-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .qr-description {
          font-size: 14px;
          color: #909399;
        }
      }

      .qr-code-container {
        display: flex;
        justify-content: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }
    }
  }
}

// 表单样式
.modern-form {
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8eaed;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 40px;
        height: 2px;
        background: linear-gradient(45deg, #409eff, #6b9eff);
      }
    }
  }

  .form-grid {
    display: grid;
    gap: 20px;

    &.grid-1 {
      grid-template-columns: 1fr;
    }

    &.grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr !important;
    }
  }

  .form-select {
    width: 100%;
  }

  .form-input {
    width: 100%;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
}

// 权限设置内容
.auth-content {
  .auth-info {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;

    .info-item {
      display: flex;
      margin-bottom: 8px;

      .label {
        font-weight: 600;
        color: #303133;
        width: 100px;
      }

      .value {
        color: #606266;
      }
    }
  }

  .tree-container {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;

    .loading-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      min-height: 200px;
    }

    .loading-container {
      color: #409eff;
    }

    .permission-tree {
      width: 100%;

      :deep(.el-tree-node__content) {
        padding: 8px 0;
        border-radius: 4px;

        &:hover {
          background: #f0f9ff;
        }
      }

      :deep(.el-tree-node__label) {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

// 对话框底部
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .cancel-btn,
  .save-btn {
    padding: 8px 24px;
    border-radius: 8px;
    font-weight: 500;
  }

  .save-btn {
    background: linear-gradient(45deg, #409eff, #6b9eff);
    border: none;

    &:hover {
      background: linear-gradient(45deg, #337ecc, #5a8dff);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

// 下拉菜单样式
:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
  padding: 4px 0;

  .el-dropdown-menu__item {
    padding: 8px 16px;
    font-size: 13px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f5f7fa;
      color: #409eff;
    }
    
    &.is-divided {
      border-top: 1px solid #e4e7ed;
      margin-top: 4px;
      padding-top: 8px;
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 14px;
    }
  }
}

// 响应式适配
@media (max-width: 1024px) {
  .container {
    padding: 0 16px;
  }

  .page-header {
    padding: 20px 16px;

    .page-header-content {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}

@media (max-width: 768px) {
  .search-panel {
    padding: 12px 16px;

    .search-form .search-row {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .search-item {
        min-width: auto;

        .search-select,
        .search-input {
          width: 100%;
        }
      }

      .search-actions {
        margin-left: 0;
        justify-content: center;
        margin-top: 8px;
      }
    }
  }

  .table-panel {
    .table-panel-header {
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .page-header {
    .page-title {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .page-actions {
      justify-content: flex-start;
    }
  }

  .action-buttons {
    flex-direction: column;
    gap: 6px;
    
    .primary-actions {
      flex-direction: column;
      gap: 4px;
      width: 100%;
      
      .action-btn {
        width: 100%;
        height: 32px;
        padding: 8px 12px;
        font-size: 13px;
        justify-content: center;
      }
    }
    
    .more-btn {
      width: 100%;
      height: 32px;
      padding: 8px 12px;
      font-size: 13px;
      justify-content: center;
    }
  }
}
</style>
