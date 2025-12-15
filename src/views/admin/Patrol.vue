<template>
  <div class="patrol-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="../../icons/svg-black/Patroller.svg" alt="巡逻员管理" class="header-icon">
          </div>
          <div class="title-text">
            <h1>巡逻员管理</h1>
            <p class="title-desc">管理车场巡逻员信息和二维码验证</p>
          </div>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd" class="action-btn">
            新增巡逻员
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
                <el-form-item label="巡逻员姓名" class="search-item">
                  <el-input v-model="query.ownername" placeholder="请输入巡逻员姓名" clearable
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

      <!-- 巡逻员列表 -->
      <div class="table-panel">
        <div class="table-panel-header">
          <div class="table-title">
            <el-icon>
              <User />
            </el-icon>
            <span>巡逻员列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>
        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable"
            :row-class-name="tableRowClassName" stripe>

            <!-- 巡逻员信息列 -->
            <el-table-column label="巡逻员信息" width="200" fixed="left">
              <template #default="{ row }">
                <div class="patrol-info-cell">
                  <div class="patrol-avatar">
                    {{ row.username?.charAt(0) || '巡' }}
                  </div>
                  <div class="patrol-details">
                    <div class="patrol-name">{{ row.username }}</div>
                    <div class="patrol-code">{{ row.usercode }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 联系方式列 -->
            <el-table-column label="联系方式" width="150">
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
            <el-table-column label="地区信息" width="280">
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
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === '正常' ? 'success' : 'warning'" 
                  size="small"
                  class="status-tag"
                >
                  {{ row.status || '正常' }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 值班状态列 -->
            <el-table-column label="值班状态" width="130" align="center">
              <template #default="{ row }">
                <div class="duty-status-cell">
                  <el-tag 
                    :type="row.notificationEnabled === 1 ? 'success' : 'danger'" 
                    :effect="row.notificationEnabled === 1 ? 'dark' : 'plain'"
                    size="default"
                    class="duty-status-tag"
                  >
                    <span class="duty-icon">{{ row.notificationEnabled === 1 ? '🟢' : '⭕' }}</span>
                    <span class="duty-text">{{ row.notificationEnabled === 1 ? '值班中' : '离岗' }}</span>
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="260" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" text icon="Edit" @click="handleEdit(row)"
                    class="action-btn-edit">
                    编辑
                  </el-button>
                  <el-button type="success" text icon="Briefcase" @click="createQrCode(row)"
                    class="action-btn-qr">
                    二维码
                  </el-button>
                  <el-button type="danger" text icon="Delete"
                    @click="handleDelete($index, row.id)" class="action-btn-delete">
                    删除
                  </el-button>
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
      title="巡逻员二维码" 
      width="400px"
      class="modern-dialog qr-dialog"
    >
      <div class="qr-content">
        <div class="qr-info">
          <div class="qr-title">{{ qrData.name }}</div>
          <div class="qr-description">扫描二维码进行巡逻验证</div>
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

    <!-- 巡逻员编辑对话框 -->
    <el-dialog 
      :title="form.data.id ? '修改巡逻员信息' : '新增巡逻员信息'" 
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
          <h3 class="section-title">巡逻员信息</h3>
          <div class="form-grid grid-2">
            <el-form-item label="巡逻员代码">
              <el-input 
                v-model="form.data.usercode" 
                placeholder="请输入巡逻员代码"
                class="form-input"
              />
            </el-form-item>
            
            <el-form-item label="巡逻员名称">
              <el-input 
                v-model="form.data.username" 
                placeholder="请输入巡逻员名称"
                class="form-input"
              />
            </el-form-item>
          </div>
          
          <div class="form-grid grid-1">
            <el-form-item label="巡逻员电话">
              <el-input 
                v-model="form.data.phone" 
                placeholder="请输入巡逻员电话"
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
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import '@/assets/font_3904303_u891dmfllhm/iconfont.css'
import { useStore } from "vuex";
import QrcodeVue from 'qrcode.vue'
import { ArrowDown, Search, User, Phone, Edit, Briefcase, Delete, Plus } from '@element-plus/icons-vue';
import activityLogger from '../../utils/activityLogger';

const root = "/parking/patrol/";
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = [
  { label: "省份", prop: "province" },
  { label: "地市", prop: "city" },
  { label: "县区", prop: "district" },
  { label: "小区", prop: "community" },
  { label: "巡逻员代码", prop: "usercode" },
  { label: "巡逻员姓名", prop: "username" },
  { label: "巡逻员电话", prop: "phone" },
  { label: "状态", prop: "status" },
];

const qrData = reactive({
  payUrl: '这只是一个测试!',
  size: 300,
  name: "",
});

const form = reactive({
  data: {
    id: '',
    province: '',
    city: '',
    district: '',
    community: '',
    usercode: '',
    username: '',
    phone: '',
    status: '',
    createman: '',
  },
});

const query = reactive({
  community: "",
  ownername: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const loginName = localStorage.getItem("loginname");
const dialogVisible = ref(false);
const qrCodeVisible = ref(false);
const searchCommunityList = ref([]);
const searchPanelExpanded = ref(false);

// 切换搜索面板展开状态
const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

// 表格样式
const tableRowClassName = ({ row, rowIndex }) => {
  if ((rowIndex + 1) % 2 == 0) {
    return 'odd-row';
  } else if ((rowIndex + 1) % 2 != 0) {
    return 'even-row';
  }
};

const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  let style = { padding: '12px 8px' }
  return style
};

// 重置表单
const onReset = () => {
  form.data.id = ''
  form.data.province = ''
  form.data.city = ''
  form.data.district = ''
  form.data.community = ''
  form.data.usercode = ''
  form.data.username = ''
  form.data.phone = ''
  form.data.status = ''
  form.data.createman = ''
};

// 获取小区列表数据
const getCommunityList = () => {
  request.get("/parking/community/allCommunity").then((res) => {
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      searchCommunityList.value = res.data;
    } else {
      getCommunityFromPatrol();
    }
  }).catch((error) => {
    getCommunityFromPatrol();
  });
};

// 从巡逻员数据中提取小区信息
const getCommunityFromPatrol = () => {
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
    // 记录查询操作日志（使用activityLogger自动获取真实IP）
    const searchConditions = [];
    if (query.community) searchConditions.push(`小区名称: ${query.community}`);
    if (query.ownername) searchConditions.push(`巡逻员姓名: ${query.ownername}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询巡逻员信息 (${searchConditions.join(', ')})` 
        : '查询所有巡逻员信息';
    
    activityLogger.logSuccess(
        '巡逻员管理',
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
  // 获取要删除的巡逻员信息，用于记录日志
  const patrolInfo = tableData.value[index];
  
  // 调试信息：输出数据结构
  console.log("删除操作调试信息:", {
    index,
    sid,
    tableDataLength: tableData.value.length,
    patrolInfo,
    allTableData: tableData.value
  });
  
  ElMessageBox.confirm("确定要删除这个巡逻员吗？", "删除确认", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(async () => {
        try {
          // 在删除之前保存巡逻员信息（用于日志记录）
          const patrolName = patrolInfo?.username || "未知巡逻员";
          const patrolCode = patrolInfo?.usercode || "未知代码";
          const description = `删除了巡逻员 ${patrolName} (${patrolCode})`;
          
          const res = await request.delete(root + sid);
          console.log("删除操作结果",res.code);
          if (res.code === '0') {
             ElMessage.success("删除成功");
            getData(); // 刷新数据
            
            // 记录活动日志（使用activityLogger自动获取真实IP）
            activityLogger.logSuccess(
              '巡逻员管理',
              '删除',
              description,
              sid,
              'patrol',
              patrolInfo,
              null
            ).catch(err => {
              console.error("记录删除日志失败:", err);
            });
          } else {
            ElMessage.error("删除失败");
          }
        } catch (error) {
          console.error("删除操作异常:", error);
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

// 生成二维码
const handleDownloadLocal = async () => {
  try {
    // 记录二维码下载操作日志（使用activityLogger自动获取真实IP）
    activityLogger.logSuccess(
        '巡逻员管理',
        '下载',
        `下载巡逻员二维码: ${qrData.name}`
    ).catch(err => {
        console.error("记录下载日志失败:", err);
    });
    
    const myCanvas = document.getElementById('picture')
    const a = document.createElement('a')
    a.href = myCanvas.toDataURL('image/png')
    a.download = qrData.name
    a.click()
    qrCodeVisible.value = false
    ElMessage.success('下载完成！')
  } catch (error) {
    console.error("下载操作失败:", error);
    // 即使日志记录失败，也要继续执行下载
    const myCanvas = document.getElementById('picture')
    const a = document.createElement('a')
    a.href = myCanvas.toDataURL('image/png')
    a.download = qrData.name
    a.click()
    qrCodeVisible.value = false
    ElMessage.success('下载完成！')
  }
}

const baseURL = 'https://www.xuerparking.cn:8543/verify/butler/';

const createQrCode = (row) => {
  qrCodeVisible.value = true;
  qrData.name = row.username + '_二维码';
  let date = new Date();
  let time = date.getTime();
  let timeunix = parseInt(time / 1000);
  let params = baseURL + '?applyKind=4&patrolId=' + row.id + '&time=' + timeunix;
  qrData.payUrl = params;
}

// 编辑操作
const handleEdit = (row) => {
  dialogVisible.value = true
  form.data.id = row.id
  form.data.province = row.province
  form.data.city = row.city
  form.data.district = row.district
  form.data.community = row.community
  form.data.usercode = row.usercode
  form.data.username = row.username
  form.data.phone = row.phone
  form.data.status = row.status
  form.data.createman = row.createman;
};

const provinceList = ref([]);
const cityList = ref([]);
const districtList = ref([]);
const communityList = ref([]);

// 获取省份列表
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

const formRef = ref(null);

const save = async () => {
  if (!form.data.username || form.data.username.trim() === '') {
    ElMessage.error("请输入巡逻员名称");
    return;
  }
  
  if (!form.data.usercode || form.data.usercode.trim() === '') {
    ElMessage.error("请输入巡逻员代码");
    return;
  }

  var method = form.data.id === "" ? "POST" : "PUT";
  const isEdit = form.data.id !== "";

  try {
    const res = await request({
      url: "/parking/patrol",
      method: method,
      data: form.data,
    });
    
    if (res.code === '0') {
      // 记录活动日志（使用activityLogger自动获取真实IP）
      const action = isEdit ? "修改" : "添加";
      const description = isEdit 
        ? `修改了巡逻员 ${form.data.username} (${form.data.usercode}) 的信息`
        : `新增了巡逻员 ${form.data.username} (${form.data.usercode})`;
      
      activityLogger.logSuccess(
        '巡逻员管理',
        action,
        description,
        res.data?.id || form.data.id,
        'patrol',
        null,
        form.data
      ).catch(err => {
        console.error("记录活动日志失败:", err);
      });
      
      getData()
      ElMessage.success("操作成功！");
      dialogVisible.value = false
    } else {
      dialogVisible.value = false
      ElMessage.error(res.msg || "操作失败");
    }
    form.data = {}
  } catch (error) {
    console.error("保存操作失败:", error);
    ElMessage.error("操作失败");
    dialogVisible.value = false
  }
};

// 初始化数据
getData();
getCommunityList();
</script>

<style lang="scss" scoped>
// 页面整体布局
.patrol-management {
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
.patrol-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  
  .patrol-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(45deg, #67c23a, #85ce61);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .patrol-details {
    min-width: 0;
    flex: 1;
    
    .patrol-name {
      font-weight: 600;
      color: #303133;
      font-size: 15px;
      line-height: 1.4;
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .patrol-code {
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

// 值班状态样式
.duty-status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .duty-status-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    
    .duty-icon {
      font-size: 16px;
      line-height: 1;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .duty-text {
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    
    &.el-tag--success.is-dark {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;
      color: white;
      
      .duty-icon {
        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
      }
    }
    
    &.el-tag--danger.is-plain {
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
      border: none;
      color: white;
      opacity: 0.85;
      
      .duty-icon {
        opacity: 0.9;
      }
    }
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
}

// 徽标脉冲动画（仅值班中状态）
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  
  .action-btn-edit,
  .action-btn-qr,
  .action-btn-delete {
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    min-width: 56px;
    height: 32px;
    font-weight: 500;
    
    &:hover {
      transform: translateY(-1px);
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
    gap: 4px;
    
    .action-btn-edit,
    .action-btn-qr,
    .action-btn-delete {
      width: 100%;
      min-width: auto;
    }
  }
}
</style>