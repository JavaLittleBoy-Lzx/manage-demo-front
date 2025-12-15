<template>
  <div class="community-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/CommunityManage.svg" alt="小区管理" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>小区管理</h1>
            <p class="title-desc">管理小区基础信息，生成小区二维码，支持快速检索和数据导出</p>
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
            <el-form :inline="true" :model="query" class="search-form">
              <!-- 搜索条件和按钮 -->
              <div class="search-row">
                <el-form-item label="小区名称" class="search-item">
                  <el-input 
                    v-model="query.community" 
                    placeholder="请输入小区名称" 
                    clearable
                    maxlength="13"
                    class="search-input"
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
            <span>小区信息列表</span>
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
            stripe
          >
            <!-- 地区信息列 -->
            <el-table-column label="地区信息" width="450" fixed="left">
              <template #default="{ row }">
                <div class="location-info-cell">
                  <div class="location-icon">
                    <el-icon><MapLocation /></el-icon>
                  </div>
                  <div class="location-details">
                    <div class="location-path">
                      <el-tag type="primary" size="small">{{ row.province }}</el-tag>
                      <el-icon class="location-separator"><ArrowRight /></el-icon>
                      <el-tag type="success" size="small">{{ row.city }}</el-tag>
                      <el-icon class="location-separator"><ArrowRight /></el-icon>
                      <el-tag type="info" size="small">{{ row.district }}</el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 小区名称列 -->
            <el-table-column label="小区名称" prop="community" width="250">
              <template #default="{ row }">
                <div class="community-info-cell">
                  <div class="community-icon">
                    <el-icon><OfficeBuilding /></el-icon>
                  </div>
                  <div class="community-details">
                    <div class="community-name">{{ row.community }}</div>
                    <div class="community-desc">住宅小区</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 小区图片列 -->
            <el-table-column label="小区图片" width="200" align="center">
              <template #default="{ row }">
                <div class="image-cell">
                  <el-image
                    v-if="row.mainImage"
                    :src="row.mainImage"
                    fit="cover"
                    :preview-src-list="[row.mainImage]"
                    style="width: 80px; height: 60px; border-radius: 8px;"
                  />
                  <div v-else class="no-image">
                    <el-icon><Picture /></el-icon>
                    <span>暂无图片</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" min-width="250" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="createQrCode(row)"
                  >
                    <el-icon><Briefcase /></el-icon>
                    查看二维码
                  </el-button>
                  <el-button 
                    type="success" 
                    link 
                    size="small" 
                    @click="openImageUpload(row)"
                  >
                    <el-icon><Upload /></el-icon>
                    上传图片
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

    <!-- 图片上传对话框 -->
    <el-dialog 
      v-model="imageUploadVisible" 
      title="上传小区图片" 
      width="650px"
      :close-on-click-modal="false"
      class="modern-dialog image-upload-dialog"
      destroy-on-close
    >
      <div class="dialog-content">
        <div class="upload-info">
          <div class="info-item">
            <span class="label">小区名称：</span>
            <span class="value">{{ currentCommunity.community }}</span>
          </div>
          <div class="info-item">
            <span class="label">地址：</span>
            <span class="value">{{ currentCommunity.province }}{{ currentCommunity.city }}{{ currentCommunity.district }}</span>
          </div>
        </div>

        <div class="image-cropper-container">
          <!-- 如果没有选择图片，显示上传区域 -->
          <div v-if="!cropperImageSrc" class="upload-area">
            <div class="upload-welcome-tip">
              <el-icon class="tip-icon">
                <InfoFilled />
              </el-icon>
              <span>请选择一张小区图片开始裁剪，上传后可调整大小和位置</span>
            </div>
            <el-upload 
              class="image-uploader" 
              :show-file-list="false" 
              :auto-upload="false" 
              :on-change="handleFileSelect"
              accept="image/jpeg,image/png,image/jpg" 
              drag
            >
              <div class="upload-content">
                <div class="upload-icon-wrapper">
                  <el-icon class="upload-icon">
                    <Plus />
                  </el-icon>
                </div>
                <div class="upload-text">
                  <h4>点击或拖拽上传小区图片</h4>
                  <p class="upload-desc">支持 JPG、PNG 格式，文件不超过 5MB</p>
                </div>
              </div>
            </el-upload>
          </div>

          <!-- 如果已选择图片，显示裁剪区域 -->
          <div v-else class="cropper-area">
            <div class="cropper-main">
              <div class="cropper-preview-box">
                <div class="cropper-title">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  <span>调整小区图片</span>
                  <div class="title-tips">拖动、缩放图片到合适位置</div>
                </div>
                <div class="cropper-canvas-wrapper" @mousedown="startDrag" @wheel.prevent="handleWheel">
                  <canvas ref="cropperCanvas" class="cropper-canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
                </div>
                <div class="cropper-guide-external">
                  <el-icon>
                    <InfoFilled />
                  </el-icon>
                  <div class="guide-content">
                    <span>• 鼠标拖动调整位置</span>
                    <span>• 滚轮缩放图片大小</span>
                  </div>
                </div>
              </div>

              <!-- 控制工具栏 -->
              <div class="cropper-controls">
                <div class="control-section">
                  <div class="section-title">
                    <el-icon>
                      <Setting />
                    </el-icon>
                    <span>图片调整</span>
                  </div>
                  <div class="control-item scale-control">
                    <div class="control-label-row">
                      <span class="control-label">缩放比例</span>
                      <span class="control-value">{{ (imageScale * 100).toFixed(0) }}%</span>
                    </div>
                    <el-slider v-model="imageScale" :min="0.1" :max="3" :step="0.01" @input="updateCanvas" />
                  </div>
                  <div class="control-buttons">
                    <el-button class="control-btn" @click="resetImage">
                      <el-icon>
                        <Refresh />
                      </el-icon>
                      重置
                    </el-button>
                    <el-button class="control-btn reselect-btn" type="warning" @click="reSelectImage">
                      <el-icon>
                        <Picture />
                      </el-icon>
                      重选
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 或直接输入URL -->
          <div class="url-input-section">
            <el-divider>或</el-divider>
            <el-form :model="imageForm" label-width="100px">
              <el-form-item label="图片URL">
                <el-input 
                  v-model="imageForm.mainImage" 
                  placeholder="直接输入图片URL（将跳过裁剪）"
                  clearable
                  @input="handleUrlInput"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="() => { resetImageUploadState(); imageUploadVisible = false; }">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="save-btn" @click="handleSaveImage">
            <el-icon><Check /></el-icon>
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 二维码对话框 -->
    <el-dialog 
      v-model="qrCodeVisible" 
      title="小区二维码" 
      width="500px" 
      class="modern-dialog qr-dialog"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div class="dialog-content">
        <div class="qr-content">
          <div class="qr-info">
            <div class="qr-title">
              <el-icon><Briefcase /></el-icon>
              小区访问二维码
            </div>
            <div class="qr-description">
              此二维码包含小区详细信息，可用于快速访问和识别
            </div>
          </div>
          
          <div class="qr-code-container">
            <qrcode-vue 
              id="picture" 
              render-as="canvas" 
              margin="3" 
              level="Q" 
              size="200" 
              background="#ffffff"
              foreground="#1f2937" 
              :value="qrData.payUrl"
            />
          </div>
          
          <div class="qr-details">
            <div class="qr-detail-item">
              <span class="label">二维码ID:</span>
              <span class="value">{{ qrData.name }}</span>
            </div>
            <div class="qr-detail-item">
              <span class="label">生成时间:</span>
              <span class="value">{{ formatDateTime(new Date()) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="qrCodeVisible = false">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
          <el-button type="primary" size="large" class="save-btn" @click="handleDownloadLocal">
            <el-icon><Download /></el-icon>
            保存图片
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
import QrcodeVue from 'qrcode.vue'
import XLSX from "xlsx";
import { 
  Search, ArrowDown, List, Briefcase, MapLocation, ArrowRight,
  OfficeBuilding, Close, Download, Upload, Picture, Plus, Check,
  InfoFilled, Edit, Setting, Refresh
} from '@element-plus/icons-vue';
import { activityApi } from '../../api/activity';

const root = "/parking/community/";
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
];

const qrCodeVisible = ref(false)
const imageUploadVisible = ref(false)
const currentCommunity = ref({})
const imageForm = reactive({
  mainImage: ''
})

// 图片裁剪器相关数据（参考 ProfileCenter）
const cropperCanvas = ref(null);
const cropperImageSrc = ref('');
const cropperImage = ref(null);
const imageScale = ref(1);
const imageX = ref(0);
const imageY = ref(0);
const canvasWidth = 400; // 小区图片宽度（16:9比例）
const canvasHeight = 225; // 小区图片高度
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);

// 格式化日期时间
const formatDateTime = (date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 生成二维码
const handleDownloadLocal = () => {
  const myCanvas = document.getElementById('picture')
  const a = document.createElement('a')
  a.href = myCanvas.toDataURL('image/png')
  a.download = `community_qr_${qrData.name}.png`
  a.click()
  qrCodeVisible.value = false
  ElMessage.success('二维码图片下载成功!')
}

// const baseURL = 'https://csharphrb.picp.vip/verify/butler/';
const baseURL = 'https://www.xuerparking.cn:8543/verify/butler/';
const createQrCode = (row) => {
  qrCodeVisible.value = true;
  qrData.name = row.id;
  
  // 构建完整的访问参数
  const params = {
    qrId: row.id, // 🆕 添加二维码ID，用于识别外来访客
    province: row.province || '',
    city: row.city || '',
    district: row.district || '',
    community: row.community || '',
    type: 'community_info',
    timestamp: Date.now() // 🆕 时间戳，用于验证二维码有效期（1分钟）
  };

  // 构建完整URL
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  qrData.payUrl = `${baseURL}?${queryString}`;
}

const form = reactive({
  data: {
    id: '',
    community: '',
    notifierName: '',
    notifierNo: ''
  },
});

const qrData = reactive({
  payUrl: '这只是一个测试!',
  size: 800,
  name: "",
});

const handleClose = (done) => {
  done();
};

const handleExport = () => {
  window.location.href = "http://www.xuerparking.cn:9999/purchase/exportPurchaseManagement";
};

// 重置
const onReset = () => {
  form.data.id = ''
  form.data.merchantName = ''
  form.data.notifierNo = ''
};

const viewShow = ref(false)
const content = ref("");

const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")

const query = reactive({
  community: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)

// 获取表格数据（使用新的 community-info 接口）
const getData = () => {
  request
    .get("/parking/community-info/page", {
      params: query,
    })
    .then((res) => {
      console.log('📊 [小区信息] API响应:', res);
      
      // 处理双层嵌套的响应结构: res.data.data
      if (res && res.data && res.data.data) {
        const pageData = res.data.data;
        tableData.value = pageData.records || [];
        pageTotal.value = pageData.total || 0;
        console.log('✅ [小区信息] 获取数据成功:', tableData.value.length, '条');
      } else {
        console.warn('⚠️ [小区信息] 响应数据格式不正确:', res);
        tableData.value = [];
        pageTotal.value = 0;
        ElMessage.warning('数据格式不正确，请检查后端服务');
      }
    })
    .catch((error) => {
      console.error('❌ [小区信息] 获取数据失败:', error);
      tableData.value = [];
      pageTotal.value = 0;
      
      // 更详细的错误提示
      if (error.response) {
        ElMessage.error(`获取数据失败: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        ElMessage.error('无法连接到服务器，请检查后端服务是否启动');
      } else {
        ElMessage.error('获取数据失败: ' + error.message);
      }
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
    if (query.communityName) searchConditions.push(`小区名称: ${query.communityName}`);
    if (query.address) searchConditions.push(`地址: ${query.address}`);
    
    const searchDescription = searchConditions.length > 0 
        ? `查询小区信息 (${searchConditions.join(', ')})` 
        : '查询所有小区信息';
    
    await activityApi.logCommunityOperation(
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
const editVisible = ref(false);
const formRef = ref(null);

// 重置图片上传状态
const resetImageUploadState = () => {
  // 清除裁剪器状态
  reSelectImage();
  // 清除表单数据
  imageForm.mainImage = '';
};

// 打开图片上传对话框
const openImageUpload = (row) => {
  currentCommunity.value = row;
  resetImageUploadState();
  imageForm.mainImage = row.mainImage || '';
  imageUploadVisible.value = true;
  console.log('🖼️ [图片上传] 打开上传对话框:', row.community);
};

// 处理文件选择（图片裁剪版本）
const handleFileSelect = (uploadFile) => {
  const file = uploadFile.raw;
  
  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  if (!isImage) {
    ElMessage.error('只支持 JPG、PNG 格式的图片！');
    return;
  }
  
  // 验证文件大小
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return;
  }
  
  // 读取文件
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperImageSrc.value = e.target.result;
    loadImageToCanvas(e.target.result);
  };
  reader.readAsDataURL(file);
};

// 加载图片到画布
const loadImageToCanvas = (src) => {
  const img = new Image();
  img.onload = () => {
    cropperImage.value = img;
    
    // 初始化位置和缩放
    imageScale.value = 1;
    
    // 计算初始位置（居中）
    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    imageScale.value = scale;
    imageX.value = (canvasWidth - img.width * scale) / 2;
    imageY.value = (canvasHeight - img.height * scale) / 2;
    
    updateCanvas();
  };
  img.src = src;
};

// 更新画布
const updateCanvas = () => {
  if (!cropperCanvas.value || !cropperImage.value) return;
  
  const canvas = cropperCanvas.value;
  const ctx = canvas.getContext('2d');
  const img = cropperImage.value;
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // 绘制图片
  ctx.drawImage(
    img,
    imageX.value,
    imageY.value,
    img.width * imageScale.value,
    img.height * imageScale.value
  );
};

// 开始拖拽
const startDrag = (e) => {
  isDragging.value = true;
  dragStartX.value = e.clientX - imageX.value;
  dragStartY.value = e.clientY - imageY.value;
  
  const onMouseMove = (e) => {
    if (isDragging.value) {
      imageX.value = e.clientX - dragStartX.value;
      imageY.value = e.clientY - dragStartY.value;
      updateCanvas();
    }
  };
  
  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// 处理滚轮缩放
const handleWheel = (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  imageScale.value = Math.max(0.1, Math.min(3, imageScale.value + delta));
  updateCanvas();
};

// 重置图片
const resetImage = () => {
  if (!cropperImage.value) return;
  
  const img = cropperImage.value;
  const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
  
  imageScale.value = scale;
  imageX.value = (canvasWidth - img.width * scale) / 2;
  imageY.value = (canvasHeight - img.height * scale) / 2;
  
  updateCanvas();
};

// 重新选择图片
const reSelectImage = () => {
  cropperImageSrc.value = '';
  cropperImage.value = null;
  imageScale.value = 1;
  imageX.value = 0;
  imageY.value = 0;
};

// 处理URL输入
const handleUrlInput = (value) => {
  if (value) {
    // 如果输入了URL，清除裁剪器状态
    reSelectImage();
  }
};

// 保存图片
const handleSaveImage = async () => {
  // 如果有裁剪的图片，使用裁剪的；否则使用URL输入的
  let finalImageData = '';
  
  if (cropperCanvas.value && cropperImageSrc.value) {
    // 使用裁剪后的图片
    console.log('💾 [图片保存] 使用裁剪后的图片');
    const blob = await new Promise((resolve) => {
      cropperCanvas.value.toBlob(resolve, 'image/jpeg', 0.9);
    });
    
    // 转换为Base64
    const reader = new FileReader();
    const base64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    finalImageData = base64;
  } else if (imageForm.mainImage) {
    // 使用URL输入的图片
    console.log('💾 [图片保存] 使用URL输入的图片');
    finalImageData = imageForm.mainImage;
  } else {
    ElMessage.warning('请先上传图片或输入图片URL！');
    return;
  }
  
  try {
    console.log('💾 [图片保存] 开始保存:', currentCommunity.value.id);
    console.log('💾 [图片保存] 图片数据长度:', finalImageData.length);
    
    // 使用FormData格式发送数据，匹配后端@RequestParam期望
    const formData = new FormData();
    formData.append('id', currentCommunity.value.id);
    formData.append('mainImage', finalImageData);
    
    const response = await request.put('/parking/community-info/updateImages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.code === '0') {
      ElMessage.success('图片保存成功!');
      imageUploadVisible.value = false;
      
      // 清除裁剪器状态
      reSelectImage();
      imageForm.mainImage = '';
      
      // 更新表格数据
      const index = tableData.value.findIndex(item => item.id === currentCommunity.value.id);
      if (index !== -1) {
        tableData.value[index].mainImage = finalImageData;
      }
      
      // 记录操作日志
      try {
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        await activityApi.logCommunityOperation(
          userId,
          username,
          "上传图片",
          `为小区 ${currentCommunity.value.community} 上传图片`,
          currentCommunity.value.id,
          JSON.stringify({ mainImage: finalImageData }),
          null
        ).catch(err => console.error("记录操作日志失败:", err));
      } catch (error) {
        console.error("记录日志失败:", error);
      }
      
      console.log('✅ [图片保存] 保存成功');
    } else {
      ElMessage.error('图片保存失败: ' + response.msg);
      console.error('❌ [图片保存] 保存失败:', response);
    }
  } catch (error) {
    console.error('❌ [图片保存] 保存异常:', error);
    ElMessage.error('图片保存失败: ' + error.message);
  }
};
</script>

<style scoped lang="scss">
.community-management {
  padding: 0 20px 20px 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 页面头部样式 */
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
.location-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .location-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
  }

  .location-details {
    .location-path {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .location-separator {
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }
}

.community-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .community-icon {
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

  .community-details {
    .community-name {
      font-weight: 600;
      color: #374151;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .community-desc {
      font-size: 12px;
      color: #64748b;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 二维码对话框样式 */
.modern-dialog.qr-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .el-dialog__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 28px 36px;
      border-radius: 20px 20px 0 0;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 120px;
        height: 120px;
        background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(40%, -40%);
      }

      .el-dialog__title {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1;
      }

      .el-dialog__headerbtn {
        top: 28px;
        right: 36px;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }

        .el-dialog__close {
          color: white;
          font-size: 22px;
          transition: all 0.3s ease;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }

    .el-dialog__body {
      padding: 0;
      background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
    }
  }

  .dialog-content {
    padding: 40px 36px;
  }

  .qr-content {
    text-align: center;

    .qr-info {
      margin-bottom: 32px;
      animation: slideInDown 0.6s ease-out;

      .qr-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 12px;
        letter-spacing: 0.3px;

        .el-icon {
          font-size: 24px;
          color: #667eea;
          padding: 8px;
          background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
      }

      .qr-description {
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
        font-weight: 400;
      }
    }

    .qr-code-container {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
      padding: 32px;
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 20px;
      border: 3px solid #e5e7eb;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      position: relative;
      transition: all 0.3s ease;
      animation: zoomIn 0.8s ease-out;

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
        border-radius: 22px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);

        &::before {
          opacity: 0.6;
        }
      }

      canvas {
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
    }

    .qr-details {
      text-align: left;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
      animation: slideInUp 0.8s ease-out;

      .qr-detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px 16px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: '';
            width: 4px;
            height: 4px;
            background: #667eea;
            border-radius: 50%;
            display: inline-block;
          }
        }

        .value {
          color: #6b7280;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 13px;
          font-weight: 500;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
        }
      }
    }
  }

  .dialog-footer {
    padding: 28px 36px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 16px;

    .el-button {
      padding: 14px 28px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 12px;
      font-size: 14px;
      letter-spacing: 0.3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.6s ease;
      }

      &:hover::before {
        left: 100%;
      }

      &.cancel-btn {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 2px solid #d1d5db;
        color: #4b5563;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

        &:hover {
          background: linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%);
          border-color: #9ca3af;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        }
      }

      &.save-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 2px solid #10b981;
        color: white;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

        &:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: #047857;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

/* 动画效果 */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 弹窗打开/关闭动画 */
:deep(.el-dialog) {
  animation: dialogSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-management {
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

  .location-info-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .location-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }

    .location-details .location-path {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }

  .community-info-cell {
    .community-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }

  .modern-dialog.qr-dialog {
    :deep(.el-dialog) {
      margin: 20px;
      width: calc(100vw - 40px) !important;
      max-width: none;

      .el-dialog__header {
        padding: 20px 24px;

        .el-dialog__title {
          font-size: 18px;
        }

        .el-dialog__headerbtn {
          top: 20px;
          right: 24px;

          .el-dialog__close {
            font-size: 20px;
          }
        }
      }
    }

    .dialog-content {
      padding: 24px 20px;
    }

    .qr-content {
      .qr-info {
        margin-bottom: 24px;

        .qr-title {
          font-size: 18px;
          gap: 12px;

          .el-icon {
            font-size: 20px;
            padding: 6px;
          }
        }

        .qr-description {
          font-size: 14px;
        }
      }

      .qr-code-container {
        padding: 20px;
        margin-bottom: 24px;
        
        canvas {
          max-width: 160px !important;
          max-height: 160px !important;
        }
      }

      .qr-details {
        padding: 16px;

        .qr-detail-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;

          &:hover {
            transform: none;
          }

          .label {
            font-size: 13px;
          }

          .value {
            font-size: 12px;
            align-self: flex-end;
            word-break: break-all;
          }
        }
      }
    }

    .dialog-footer {
      padding: 20px;
      gap: 12px;
      flex-direction: column;

      .el-button {
        padding: 12px 20px;
        font-size: 14px;
        width: 100%;
        justify-content: center;

        &:hover::before {
          display: none;
        }
      }
    }
  }
}

/* 图片上传对话框样式（图片裁剪版本） */
.image-upload-dialog {
  :deep(.el-dialog) {
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
    max-height: 90vh;
    overflow: hidden;
  }

  :deep(.el-dialog__body) {
    padding: 30px;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  // 图片裁剪器容器
  .image-cropper-container {
    .upload-area {
      text-align: center;
      
      .upload-welcome-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: #f0f9ff;
        border-radius: 8px;
        font-size: 14px;
        color: #0369a1;
        
        .tip-icon {
          font-size: 16px;
        }
      }
      
      .image-uploader {
        :deep(.el-upload) {
          width: 100%;
        }
        
        :deep(.el-upload-dragger) {
          width: 100%;
          height: 200px;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          background: #f9fafb;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #3b82f6;
            background: #eff6ff;
          }
        }
        
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          
          .upload-icon-wrapper {
            .upload-icon {
              font-size: 48px;
              color: #9ca3af;
            }
          }
          
          .upload-text {
            h4 {
              margin: 0 0 8px 0;
              color: #374151;
              font-size: 16px;
            }
            
            .upload-desc {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
          }
        }
      }
    }
    
    .cropper-area {
      .cropper-main {
        display: flex;
        gap: 24px;
        
        .cropper-preview-box {
          flex: 1;
          
          .cropper-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-weight: 600;
            color: #374151;
            
            .el-icon {
              color: #3b82f6;
            }
            
            .title-tips {
              margin-left: auto;
              font-size: 12px;
              font-weight: normal;
              color: #6b7280;
            }
          }
          
          .cropper-canvas-wrapper {
            position: relative;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            cursor: move;
            
            .cropper-canvas {
              display: block;
            }
          }
          
          .cropper-guide-external {
            margin-top: 16px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            font-size: 13px;
            color: #6b7280;
            
            .el-icon {
              color: #3b82f6;
              margin-top: 2px;
            }
            
            .guide-content {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
          }
        }
        
        .cropper-controls {
          width: 200px;
          
          .control-section {
            .section-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 16px;
              font-weight: 600;
              color: #374151;
              
              .el-icon {
                color: #3b82f6;
              }
            }
            
            .control-item {
              margin-bottom: 20px;
              
              &.scale-control {
                .control-label-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;
                  
                  .control-label {
                    font-size: 14px;
                    color: #374151;
                  }
                  
                  .control-value {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 600;
                  }
                }
              }
            }
            
            .control-buttons {
              display: flex;
              flex-direction: column;
              gap: 8px;
              
              .control-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                
                &.reselect-btn {
                  margin-top: 8px;
                  border-color: #f59e0b;
                  color: #f59e0b;
                  
                  &:hover {
                    background: #fef3c7;
                    border-color: #d97706;
                    color: #d97706;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    .url-input-section {
      margin-top: 24px;
      
      :deep(.el-divider__text) {
        background: white;
        color: #6b7280;
      }
    }
  }

  .upload-info {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 600;
        color: #475569;
        min-width: 80px;
      }

      .value {
        color: #1e293b;
        font-weight: 500;
      }
    }
  }

  .image-preview-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    
    .image-uploader {
      // 确保 el-upload 组件本身不限制高度
      :deep(.el-upload) {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        line-height: 1 !important;
      }

      :deep(.el-upload-dragger) {
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        border: none !important;
        overflow: visible !important;
        line-height: 1 !important;
      }

      .uploaded-image {
        width: 100% !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        min-height: auto !important;
        object-fit: contain !important;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: block !important;
        margin: 0 auto;

        &:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
      }
      .upload-placeholder {
        width: 100%;
        max-width: 500px;
        height: 300px;
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f9fafb;

        &:hover {
          border-color: #3b82f6;
          background: #eff6ff;

          .upload-icon {
            color: #3b82f6;
            transform: scale(1.1);
          }
        }
        .upload-icon {
          font-size: 48px;
          color: #9ca3af;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .upload-text {
          color: #6b7280;
          font-size: 14px;
        }
      }
    }
  }

  .upload-tips {
    margin-top: 16px;
    padding: 12px 16px;
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    border-radius: 6px;

    p {
      margin: 4px 0;
      font-size: 13px;
      color: #92400e;
    }
  }
}

.image-cell {
  .no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #9ca3af;
    font-size: 12px;

    .el-icon {
      font-size: 24px;
    }
  }
}

/* 深色模式适配 */
.dark {
  .community-management {
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

  .modern-dialog.qr-dialog {
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

    .qr-content {
      .qr-code-container,
      .qr-details {
        background: #334155;
        border-color: #475569;
      }
    }
  }
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
