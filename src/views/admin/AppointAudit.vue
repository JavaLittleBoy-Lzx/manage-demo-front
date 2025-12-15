<template>
  <div class="appoint-audit-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/AppointAudit.svg" alt="预约审批" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>预约审批管理</h1>
            <p class="title-desc">管理预约申请的审批流程，支持批量审核和详细记录</p>
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
                  <el-select v-model="query.community" placeholder="请选择小区" clearable class="search-select">
                    <el-option v-for="item in communityList" :key="item.community" :label="item.community"
                      :value="item.community" />
                  </el-select>
                </el-form-item>

                <el-form-item label="业主姓名" class="search-item">
                  <el-input v-model="query.ownername" placeholder="请输入业主姓名" clearable maxlength="13"
                    class="search-input" />
                </el-form-item>

                <el-form-item label="申请时间" class="search-item">
                  <el-date-picker v-model="query.recorddate" type="date" placeholder="选择申请日期" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" clearable class="search-date" />
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
            <span>预约审批列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>

        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable" :row-class-name="tableRowClassName"
            stripe>
            <!-- 申请信息列 -->
            <el-table-column label="申请信息" width="220" fixed="left">
              <template #default="{ row }">
                <div class="application-info-cell">
                  <div class="app-icon">
                    <el-icon>
                      <User />
                    </el-icon>
                  </div>
                  <div class="app-details">
                    <div class="owner-name">{{ row.ownername }}</div>
                    <div class="community-name">{{ row.community }}</div>
                    <div class="apply-date">{{ row.recorddate }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 地址信息列 -->
            <el-table-column label="地址信息" width="320">
              <template #default="{ row }">
                <div class="address-info">
                  <div class="address-item">
                    <el-icon>
                      <Location />
                    </el-icon>
                    <span class="location-text">{{ row.province }} {{ row.city }} {{ row.district }}</span>
                  </div>
                  <div class="address-item">
                    <el-icon>
                      <House />
                    </el-icon>
                    <span class="house-info">{{ row.building }}栋{{ row.units }}单元{{ row.floor }}层{{ row.room }}房</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 来访信息列 -->
            <el-table-column label="来访信息" width="280">
              <template #default="{ row }">
                <div class="visit-info">
                  <div class="visit-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    <span class="visit-date">{{ row.visitdate }}</span>
                  </div>
                  <div class="visit-item">
                    <el-icon>
                      <Phone />
                    </el-icon>
                    <span class="phone-number">{{ row.visitorphone }}</span>
                  </div>
                  <div class="visit-item">
                    <el-icon>
                      <CaretRight />
                    </el-icon>
                    <span :class="['plate-number', getPlateType(row.platenumber)]">{{ row.platenumber }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 来访原因列 -->
            <el-table-column label="来访原因" prop="visitreason" width="180">
              <template #default="{ row }">
                <div class="reason-cell">
                  <el-tooltip :content="`来访原因：${row.visitreason}${getReasonDescription(row.visitreason)}`"
                    placement="top" effect="dark">
                    <span :class="['visit-reason-tag', getReasonStyle(row.visitreason)]">
                      <el-icon>
                        <component :is="getReasonIcon(row.visitreason)" />
                      </el-icon>
                      {{ row.visitreason }}
                    </span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>

            <!-- 审批状态列 -->
            <el-table-column label="审批状态" prop="auditstatus" align="center" width="100">
              <template #default="{ row }">
                <div class="status-cell">
                  <el-tag type="info" v-if="row.auditstatus === '待审批'" effect="dark">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    待审批
                  </el-tag>
                  <el-tag type="success" v-else-if="row.auditstatus === '已通过'" effect="dark">
                    <el-icon>
                      <Check />
                    </el-icon>
                    已通过
                  </el-tag>
                  <el-tag type="warning" v-else-if="row.auditstatus === '未通过'" effect="dark">
                    <el-icon>
                      <Close />
                    </el-icon>
                    未通过
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="handleEdit(row)"
                    :disabled="row.auditstatus !== '待审批'">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    审批
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination :current-page="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
              @current-change="handlePageChange">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- 审批对话框 -->
    <el-dialog v-model="dialogVisible" title="预约审批" width="600px" class="modern-dialog" :close-on-click-modal="false"
      :before-close="handleClose">
      <div class="dialog-content">
        <el-form :model="form.data" ref="formRef" class="modern-form">
          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <DocumentChecked />
              </el-icon>
              审批决定
            </h3>
            <div class="form-grid">
              <el-form-item label="审核结果" prop="auditstatus" required>
                <el-radio-group v-model="form.data.auditstatus" class="audit-radio-group">
                  <el-radio label="已通过" class="audit-radio pass">
                    <el-icon>
                      <CircleCheck />
                    </el-icon>
                    通过
                  </el-radio>
                  <el-radio label="未通过" class="audit-radio reject">
                    <el-icon>
                      <CircleClose />
                    </el-icon>
                    拒绝
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <EditPen />
              </el-icon>
              审批意见
            </h3>
            <div class="form-grid full-width">
              <el-form-item label="审批原因" prop="refusereason">
                <el-input type="textarea" :rows="4" placeholder="请输入审批原因或意见..." v-model="form.data.refusereason"
                  class="form-textarea" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="dialogVisible = false">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="confirm-btn" @click="save">
            <el-icon>
              <Check />
            </el-icon>
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
import { activityApi } from "@/api/activity";
import {
  Search, ArrowDown, List, Edit, User, Location, House,
  Calendar, Phone, CaretRight, Clock, Check, Close,
  DocumentChecked, CircleCheck, CircleClose, EditPen,
  // 来访原因图标
  UserFilled, Tools, Goods, Service, MessageBox,
  Present, Star, More, QuestionFilled
} from '@element-plus/icons-vue';

const root = "/parking/appointment/";
const router = useRouter();
const route = useRoute();
const store = useStore();

// 搜索面板展开状态
const searchPanelExpanded = ref(true);

// 切换搜索面板
const toggleSearchPanel = () => {
  searchPanelExpanded.value = !searchPanelExpanded.value;
};

const props = [
  { label: "省份", prop: "province" },
  { label: "地区", prop: "city" },
  { label: "区县", prop: "district" },
  { label: "小区", prop: "community" },
  { label: "申请日期", prop: "recorddate" },
  { label: "来访日期", prop: "visitdate" },
  { label: "车牌号码", prop: "platenumber" },
  { label: "来访电话", prop: "visitorphone" },
  { label: "栋号", prop: "building" },
  { label: "单元", prop: "units" },
  { label: "楼层", prop: "floor" },
  { label: "房号", prop: "room" },
  { label: "业主姓名", prop: "ownername" },
  { label: "来访原因", prop: "visitreason" },
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

const form = reactive({
  data: {
    id: "",
    auditstatus: "",
    refusereason: "",
    auditusername: localStorage.getItem("userId"),
  },
});

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

const handleEdit = (row) => {
  dialogVisible.value = true
  form.data.id = row.id
  // 重置表单
  form.data.auditstatus = ""
  form.data.refusereason = ""
};

const query = reactive({
  id: "",
  username: "",
  community: "",
  ownername: "",
  recorddate: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisible = ref(false);
const communityList = ref([]);

// 获取小区列表数据
const getCommunityList = () => {
  console.log("开始获取小区列表...");

  // 尝试获取所有小区数据
  request.get("/parking/community/allCommunity").then((res) => {
    console.log("专门小区接口返回:", res);
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      communityList.value = res.data;
      console.log("小区列表加载成功:", communityList.value);
    } else {
      console.log("专门小区接口无数据，尝试从预约数据提取");
      getCommunityFromAppointments();
    }
  }).catch((error) => {
    console.log("专门小区接口失败:", error);
    // 如果专门的接口不存在，可以从现有的预约数据中提取小区信息
    getCommunityFromAppointments();
  });
};

// 从预约数据中提取小区信息
const getCommunityFromAppointments = () => {
  request.get(root + "listAppointNoAudit", {
    params: { pageNum: 1, pageSize: 1000 } // 获取足够多的数据来提取小区信息
  }).then((res) => {
    console.log("预约数据返回:", res);
    if (res.data && res.data.records && res.data.records.length > 0) {
      // 从预约数据中提取唯一的小区名称
      const communities = [...new Set(res.data.records
        .map(item => item.community)
        .filter(community => community && community.trim() !== '')
      )];
      console.log("提取的小区名称:", communities);
      communityList.value = communities.map(community => ({ community }));
      console.log("小区列表设置完成:", communityList.value);
    } else {
      console.log("预约数据中没有找到小区信息");
    }
  }).catch((error) => {
    console.log("获取小区列表失败:", error);
  });
};

// 获取表格数据
const getData = () => {
  request
    .get(root + "listAppointNoAudit", {
      params: query,
    })
    .then((res) => {
      console.log("表格数据:", res);
      tableData.value = res.data.records;
      pageTotal.value = res.data.total;

      // 如果小区列表为空，尝试从表格数据中提取
      if (communityList.value.length === 0 && res.data.records && res.data.records.length > 0) {
        console.log("从表格数据中提取小区信息...");
        const communities = [...new Set(res.data.records
          .map(item => item.community)
          .filter(community => community && community.trim() !== '')
        )];
        if (communities.length > 0) {
          communityList.value = communities.map(community => ({ community }));
          console.log("从表格数据提取的小区列表:", communityList.value);
        }
      }
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
    if (query.community) searchConditions.push(`小区: ${query.community}`);
    if (query.ownername) searchConditions.push(`业主姓名: ${query.ownername}`);
    if (query.recorddate) searchConditions.push(`申请日期: ${query.recorddate}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询预约审批 (${searchConditions.join(', ')})` 
        : '查询所有预约审批';
    
    await activityApi.logAppointmentOperation(
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
      request({
        url: "/parking/appointment/auditAppoint",
        method: "POST",
        data: form.data,
      }).then((res) => {
        dialogVisible.value = false
        
        // 保存审核信息用于日志记录
        const auditInfo = {
          appointmentId: form.data.id,
          status: form.data.auditstatus,
          reason: form.data.refusereason,
          auditor: localStorage.getItem("userId")
        };
        
        form.data = {
          id: "",
          auditstatus: "",
          refusereason: "",
          auditusername: localStorage.getItem("userId"),
        }
        console.log(res)
        if (res.code != null) {
          getData()
          ElMessage.success("审批提交成功！");
          
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "管理员";
          activityApi.logAppointmentOperation(
            userId,
            username,
            "审核",
            `审核预约申请：${auditInfo.status}${auditInfo.reason ? '，原因：' + auditInfo.reason : ''}`,
            auditInfo.appointmentId,
            null,
            JSON.stringify(auditInfo)
          ).catch(err => {
            console.error("记录活动日志失败:", err);
          });
        } else {
          ElMessage.error(res.data.msg);
        }
      });
    } else {
      return false;
    }
  });
};

// 判断车牌类型（新能源 vs 油车）
const getPlateType = (plateNumber) => {
  if (!plateNumber) return 'traditional';

  const plate = plateNumber.trim().toUpperCase();

  // 新能源车牌特征：
  // 1. 8位车牌（新能源专用号牌）
  // 2. 包含字母D或F的新能源号牌
  // 3. 绿色车牌模式（通常8位，第2位或最后一位是字母）
  if (plate.length === 8) {
    // 8位车牌通常是新能源
    return 'new-energy';
  } else if (plate.length === 7) {
    return 'traditional';
  }

  return 'traditional';
};

// 根据来访原因返回对应的图标
const getReasonIcon = (reason) => {
  if (!reason) return 'QuestionFilled';

  const reasonLower = reason.toLowerCase().trim();

  // VIP重要客户类（优先级最高）
  if (reasonLower.includes('vip') || reasonLower.includes('重要') || reasonLower.includes('特殊') ||
    reasonLower.includes('贵宾') || reasonLower.includes('高级') || reasonLower.includes('总裁') ||
    reasonLower.includes('董事') || reasonLower.includes('领导')) {
    return 'Star';
  }

  // 商务类
  if (reasonLower.includes('商务') || reasonLower.includes('洽谈') || reasonLower.includes('会议') ||
    reasonLower.includes('合作') || reasonLower.includes('签约') || reasonLower.includes('业务') ||
    reasonLower.includes('谈判') || reasonLower.includes('协商') || reasonLower.includes('商谈') ||
    reasonLower.includes('会晤') || reasonLower.includes('商讨')) {
    return 'UserFilled';
  }

  // 维修类
  if (reasonLower.includes('维修') || reasonLower.includes('修理') || reasonLower.includes('安装') ||
    reasonLower.includes('检修') || reasonLower.includes('保养') || reasonLower.includes('维护') ||
    reasonLower.includes('调试') || reasonLower.includes('检测') || reasonLower.includes('更换') ||
    reasonLower.includes('施工') || reasonLower.includes('装修')) {
    return 'Tools';
  }

  // 送货类
  if (reasonLower.includes('送货') || reasonLower.includes('配送') || reasonLower.includes('快递') ||
    reasonLower.includes('物流') || reasonLower.includes('运输') || reasonLower.includes('送达') ||
    reasonLower.includes('取货') || reasonLower.includes('发货') || reasonLower.includes('收货') ||
    reasonLower.includes('派送') || reasonLower.includes('投递')) {
    return 'Goods';
  }

  // 服务类
  if (reasonLower.includes('服务') || reasonLower.includes('上门') || reasonLower.includes('客服') ||
    reasonLower.includes('咨询') || reasonLower.includes('支持') || reasonLower.includes('技术') ||
    reasonLower.includes('指导') || reasonLower.includes('培训') || reasonLower.includes('教学') ||
    reasonLower.includes('帮助') || reasonLower.includes('解决')) {
    return 'Service';
  }

  // 拜访类
  if (reasonLower.includes('拜访') || reasonLower.includes('探访') || reasonLower.includes('看望') ||
    reasonLower.includes('访问') || reasonLower.includes('拜见') || reasonLower.includes('探望') ||
    reasonLower.includes('慰问') || reasonLower.includes('问候') || reasonLower.includes('走访')) {
    return 'UserFilled';
  }

  // 面试招聘类
  if (reasonLower.includes('面试') || reasonLower.includes('招聘') || reasonLower.includes('应聘') ||
    reasonLower.includes('求职') || reasonLower.includes('入职') || reasonLower.includes('试用') ||
    reasonLower.includes('考核') || reasonLower.includes('评估')) {
    return 'MessageBox';
  }

  // 礼品赠送类
  if (reasonLower.includes('礼品') || reasonLower.includes('赠送') || reasonLower.includes('礼物') ||
    reasonLower.includes('庆祝') || reasonLower.includes('祝贺') || reasonLower.includes('慰问') ||
    reasonLower.includes('节日') || reasonLower.includes('生日') || reasonLower.includes('纪念')) {
    return 'Present';
  }

  // 其他类
  if (reasonLower.includes('其他') || reasonLower.includes('其它') || reasonLower.includes('临时') ||
    reasonLower.includes('紧急') || reasonLower.includes('特殊')) {
    return 'More';
  }

  // 默认图标
  return 'QuestionFilled';
};

// 根据来访原因返回对应的样式类
const getReasonStyle = (reason) => {
  if (!reason) return 'reason-default';

  const reasonLower = reason.toLowerCase().trim();

  // VIP重要客户类 - 金色系（优先级最高）
  if (reasonLower.includes('vip') || reasonLower.includes('重要') || reasonLower.includes('特殊') ||
    reasonLower.includes('贵宾') || reasonLower.includes('高级') || reasonLower.includes('总裁') ||
    reasonLower.includes('董事') || reasonLower.includes('领导')) {
    return 'reason-vip';
  }

  // 商务类 - 蓝色系
  if (reasonLower.includes('商务') || reasonLower.includes('洽谈') || reasonLower.includes('会议') ||
    reasonLower.includes('合作') || reasonLower.includes('签约') || reasonLower.includes('业务') ||
    reasonLower.includes('谈判') || reasonLower.includes('协商') || reasonLower.includes('商谈') ||
    reasonLower.includes('会晤') || reasonLower.includes('商讨')) {
    return 'reason-business';
  }

  // 维修类 - 橙色系
  if (reasonLower.includes('维修') || reasonLower.includes('修理') || reasonLower.includes('安装') ||
    reasonLower.includes('检修') || reasonLower.includes('保养') || reasonLower.includes('维护') ||
    reasonLower.includes('调试') || reasonLower.includes('检测') || reasonLower.includes('更换') ||
    reasonLower.includes('施工') || reasonLower.includes('装修')) {
    return 'reason-maintenance';
  }

  // 送货类 - 绿色系
  if (reasonLower.includes('送货') || reasonLower.includes('配送') || reasonLower.includes('快递') ||
    reasonLower.includes('物流') || reasonLower.includes('运输') || reasonLower.includes('送达') ||
    reasonLower.includes('取货') || reasonLower.includes('发货') || reasonLower.includes('收货') ||
    reasonLower.includes('派送') || reasonLower.includes('投递')) {
    return 'reason-delivery';
  }

  // 服务类 - 紫色系
  if (reasonLower.includes('服务') || reasonLower.includes('上门') || reasonLower.includes('客服') ||
    reasonLower.includes('咨询') || reasonLower.includes('支持') || reasonLower.includes('技术') ||
    reasonLower.includes('指导') || reasonLower.includes('培训') || reasonLower.includes('教学') ||
    reasonLower.includes('帮助') || reasonLower.includes('解决')) {
    return 'reason-service';
  }

  // 拜访类 - 粉色系
  if (reasonLower.includes('拜访') || reasonLower.includes('探访') || reasonLower.includes('看望') ||
    reasonLower.includes('访问') || reasonLower.includes('拜见') || reasonLower.includes('探望') ||
    reasonLower.includes('慰问') || reasonLower.includes('问候') || reasonLower.includes('走访')) {
    return 'reason-visit';
  }

  // 面试招聘类 - 青色系
  if (reasonLower.includes('面试') || reasonLower.includes('招聘') || reasonLower.includes('应聘') ||
    reasonLower.includes('求职') || reasonLower.includes('入职') || reasonLower.includes('试用') ||
    reasonLower.includes('考核') || reasonLower.includes('评估')) {
    return 'reason-interview';
  }

  // 礼品赠送类 - 红色系
  if (reasonLower.includes('礼品') || reasonLower.includes('赠送') || reasonLower.includes('礼物') ||
    reasonLower.includes('庆祝') || reasonLower.includes('祝贺') || reasonLower.includes('慰问') ||
    reasonLower.includes('节日') || reasonLower.includes('生日') || reasonLower.includes('纪念')) {
    return 'reason-gift';
  }

  // 其他类 - 灰色系
  if (reasonLower.includes('其他') || reasonLower.includes('其它') || reasonLower.includes('临时') ||
    reasonLower.includes('紧急')) {
    return 'reason-other';
  }

  // 默认样式
  return 'reason-default';
};

// 根据来访原因返回详细描述
const getReasonDescription = (reason) => {
  if (!reason) return '';

  const reasonLower = reason.toLowerCase().trim();

  // VIP重要客户类
  if (reasonLower.includes('vip') || reasonLower.includes('重要') || reasonLower.includes('特殊') ||
    reasonLower.includes('贵宾') || reasonLower.includes('高级') || reasonLower.includes('总裁') ||
    reasonLower.includes('董事') || reasonLower.includes('领导')) {
    return '\n🌟 VIP重要客户，请优先处理';
  }

  // 商务类
  if (reasonLower.includes('商务') || reasonLower.includes('洽谈') || reasonLower.includes('会议') ||
    reasonLower.includes('合作') || reasonLower.includes('签约') || reasonLower.includes('业务') ||
    reasonLower.includes('谈判') || reasonLower.includes('协商') || reasonLower.includes('商谈') ||
    reasonLower.includes('会晤') || reasonLower.includes('商讨')) {
    return '\n💼 商务活动，建议提前准备会议室';
  }

  // 维修类
  if (reasonLower.includes('维修') || reasonLower.includes('修理') || reasonLower.includes('安装') ||
    reasonLower.includes('检修') || reasonLower.includes('保养') || reasonLower.includes('维护') ||
    reasonLower.includes('调试') || reasonLower.includes('检测') || reasonLower.includes('更换') ||
    reasonLower.includes('施工') || reasonLower.includes('装修')) {
    return '\n🔧 维修服务，请确认携带工具设备';
  }

  // 送货类
  if (reasonLower.includes('送货') || reasonLower.includes('配送') || reasonLower.includes('快递') ||
    reasonLower.includes('物流') || reasonLower.includes('运输') || reasonLower.includes('送达') ||
    reasonLower.includes('取货') || reasonLower.includes('发货') || reasonLower.includes('收货') ||
    reasonLower.includes('派送') || reasonLower.includes('投递')) {
    return '\n📦 物流配送，请预留卸货空间';
  }

  // 服务类
  if (reasonLower.includes('服务') || reasonLower.includes('上门') || reasonLower.includes('客服') ||
    reasonLower.includes('咨询') || reasonLower.includes('支持') || reasonLower.includes('技术') ||
    reasonLower.includes('指导') || reasonLower.includes('培训') || reasonLower.includes('教学') ||
    reasonLower.includes('帮助') || reasonLower.includes('解决')) {
    return '\n🛠️ 专业服务，建议提前沟通需求';
  }

  // 拜访类
  if (reasonLower.includes('拜访') || reasonLower.includes('探访') || reasonLower.includes('看望') ||
    reasonLower.includes('访问') || reasonLower.includes('拜见') || reasonLower.includes('探望') ||
    reasonLower.includes('慰问') || reasonLower.includes('问候') || reasonLower.includes('走访')) {
    return '\n👥 私人拜访，请确认业主在家';
  }

  // 面试招聘类
  if (reasonLower.includes('面试') || reasonLower.includes('招聘') || reasonLower.includes('应聘') ||
    reasonLower.includes('求职') || reasonLower.includes('入职') || reasonLower.includes('试用') ||
    reasonLower.includes('考核') || reasonLower.includes('评估')) {
    return '\n📋 招聘面试，建议安排安静环境';
  }

  // 礼品赠送类
  if (reasonLower.includes('礼品') || reasonLower.includes('赠送') || reasonLower.includes('礼物') ||
    reasonLower.includes('庆祝') || reasonLower.includes('祝贺') || reasonLower.includes('慰问') ||
    reasonLower.includes('节日') || reasonLower.includes('生日') || reasonLower.includes('纪念')) {
    return '\n🎁 礼品赠送，温馨提醒';
  }

  // 其他类
  if (reasonLower.includes('其他') || reasonLower.includes('其它') || reasonLower.includes('临时') ||
    reasonLower.includes('紧急')) {
    return '\n❓ 其他事务，建议详细了解';
  }

  return '';
};
</script>

<style scoped lang="scss">
.appoint-audit-management {
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
.application-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .app-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
  }

  .app-details {
    .owner-name {
      font-weight: 600;
      color: #374151;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .community-name {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 2px;
    }

    .apply-date {
      font-size: 13px;
      color: #94a3b8;
    }
  }
}

.address-info,
.visit-info {

  .address-item,
  .visit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    color: #64748b;

    .el-icon {
      font-size: 14px;
      color: #3b82f6;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

/* 地址信息样式 - 星空紫渐变 */
.location-text {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8360c3 100%);
  color: white;
  border-radius: 12px;
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 0.5px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #5a6fd8 0%, #6b4d94 50%, #7952b3 100%);

    &::before {
      left: 100%;
    }
  }
}

/* 房屋信息样式 - 金橙渐变 */
.house-info {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 75%, #ffc3a0 100%);
  color: #2d1b69;
  border-radius: 12px;
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 0.5px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(255, 154, 158, 0.45);
    background: linear-gradient(135deg, #ff8a95 0%, #fdbde8 25%, #fdbde8 75%, #ffb347 100%);

    &::before {
      left: 100%;
    }
  }
}

/* 来访时间样式 - 高级深蓝纯色 */
.visit-date {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 12px;
  background: #1e40af;
  color: white;
  border-radius: 14px;
  font-family: "Consolas", "Monaco", monospace;
  letter-spacing: 0.6px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.25);
  border: 1px solid rgba(30, 64, 175, 0.3);

  &:hover {
    transform: translateY(-3px);
    background: #1d4ed8;
    box-shadow: 0 8px 28px rgba(29, 78, 216, 0.4);
    border-color: rgba(29, 78, 216, 0.5);
  }
}

/* 手机号码样式 - 高级墨绿纯色 */
.phone-number {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  background: #059669;
  color: white;
  border-radius: 14px;
  font-family: "Consolas", "Monaco", monospace;
  letter-spacing: 0.8px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.25);
  border: 1px solid rgba(5, 150, 105, 0.3);

  &:hover {
    transform: translateY(-3px);
    background: #047857;
    box-shadow: 0 8px 28px rgba(4, 120, 87, 0.4);
    border-color: rgba(4, 120, 87, 0.5);
  }
}

/* 车牌号码样式 */
.plate-number {
  display: inline-block;
  font-size: 15px;
  font-weight: bold;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
  letter-spacing: 0.8px;
  min-width: 85px;
  text-align: center;
  transition: all 0.3s ease;

  // 传统燃油车牌 - 蓝色渐变
  &.traditional {
    background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
    color: #FFFFFF;
    border: 1px solid #0C4FC5;
    box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3);
  }

  // 新能源车牌 - 绿色渐变
  &.new-energy {
    background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
    color: #000000;
    border: 1px solid #6AD390;
    box-shadow: 0 2px 4px rgba(106, 211, 144, 0.3);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
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
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
    white-space: nowrap;
    position: relative;
    overflow: hidden;

    .el-icon {
      font-size: 14px;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }

    &:hover::before {
      left: 100%;
    }

    // 商务类 - 专业蓝色
    &.reason-business {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
      }
    }

    // 维修类 - 活力橙色
    &.reason-maintenance {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
      }
    }

    // 送货类 - 自然绿色
    &.reason-delivery {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }
    }

    // 服务类 - 优雅紫色
    &.reason-service {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      }
    }

    // 拜访类 - 温馨粉色
    &.reason-visit {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
      }
    }

    // 面试类 - 清新青色
    &.reason-interview {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
      }
    }

    // 礼品类 - 热情红色
    &.reason-gift {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
      }
    }

    // VIP类 - 尊贵金色
    &.reason-vip {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      position: relative;

      &::after {
        content: '✨';
        position: absolute;
        top: -2px;
        right: -2px;
        font-size: 10px;
        animation: sparkle 2s infinite;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
      }
    }

    // 其他类 - 中性灰色
    &.reason-other {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
      }
    }

    // 默认样式 - 柔和蓝灰
    &.reason-default {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(100, 116, 139, 0.4);
      }
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

                &:hover,
                &.is-checked {
                  border-color: #10b981;
                  background: #f0fdf4;
                  color: #047857;
                }
              }

              &.reject {

                &:hover,
                &.is-checked {
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
  .appoint-audit-management {
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

  .application-info-cell {
    .app-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }

  /* 移动端样式优化 */
  .phone-number {
    font-size: 11px;
    padding: 3px 6px;
    min-width: 60px;
  }

  .plate-number {
    font-size: 11px;
    padding: 3px 5px;
    min-width: 60px;
  }

  .location-text,
  .house-info,
  .visit-date {
    font-size: 11px;
    padding: 2px 6px;
    min-width: 50px;
  }

  /* 移动端来访原因标签优化 */
  .visit-reason-tag {
    font-size: 10px !important;
    padding: 4px 8px !important;
    gap: 4px !important;

    .el-icon {
      font-size: 12px !important;
    }

    &.reason-vip::after {
      font-size: 8px !important;
      top: -1px !important;
      right: -1px !important;
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
  .appoint-audit-management {
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

  &:hover,
  &.is-focus {
    box-shadow: 0 0 0 1px #3b82f6;
  }
}

/* VIP标签闪烁动画 */
@keyframes sparkle {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* 来访原因标签的额外动画效果 */
@keyframes pulse-shadow {
  0% {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  50% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  100% {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

/* 表格行悬停时的来访原因标签增强效果 */
:deep(.el-table__row:hover) {
  .visit-reason-tag {
    transform: translateY(-1px) scale(1.02);

    &.reason-vip {
      animation: pulse-shadow 1.5s ease-in-out infinite;
    }
  }
}
</style>