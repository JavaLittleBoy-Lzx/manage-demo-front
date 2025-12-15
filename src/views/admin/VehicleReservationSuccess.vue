<template>
  <div class="vehicle-reservation-success-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <img src="..//../icons/svg-black/VehicleReservationSuccess.svg" alt="外来车辆放行管理" class="header-icon" />
          </div>
          <div class="title-text">
            <h1>外来车辆放行管理</h1>
            <p class="title-desc">管理外来车辆放行记录，支持数据导出和超时查询分析</p>
          </div>
        </div>
        <div class="page-actions">
          <el-button type="success" icon="Download" @click="handExport" size="large" class="export-btn">
            导出数据
          </el-button>
          <el-button type="info" icon="Clock" @click="timeOutCleanup" size="large" class="timeout-btn">
            离场超时查询
          </el-button>
          <el-button type="warning" icon="Timer" @click="timeOnSite" size="large" class="onsite-btn">
            在场超时查询
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
            <span>筛选条件</span>
            <el-icon :class="['toggle-icon', { 'expanded': searchPanelExpanded }]">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="searchPanelExpanded" class="search-panel-body">
            <el-form :inline="true" :model="query" class="search-form" label-width="80px">
              <div class="search-row">
                <el-form-item label="车场名称" class="search-item">
                  <el-select v-model="query.yardName" placeholder="请选择车场名称" clearable class="search-input">
                    <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                      :value="item.yardName" />
                  </el-select>
                </el-form-item>

                <el-form-item label="车牌号码" class="search-item">
                  <el-input v-model="query.plateNumber" placeholder="请输入车牌号码" clearable class="search-input" />
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
              <CreditCard />
            </el-icon>
            <span>放行记录列表</span>
          </div>
          <div class="table-stats">
            共 {{ pageTotal }} 条记录
          </div>
        </div>

        <div class="table-panel-body">
          <el-table :data="tableData" class="modern-table" ref="multipleTable" :row-class-name="tableRowClassName"
            :cell-style="cellStyle" stripe>
            <!-- 车辆信息列 -->
            <el-table-column label="车辆信息" width="230" fixed="left">
              <template #default="{ row }">
                <div class="vehicle-info-cell">
                  <div class="vehicle-details">
                    <div class="plate-number" :class="getPlateTypeClass(row.plateNumber)">
                      {{ row.plateNumber }}
                    </div>
                    <div class="yard-name">{{ row.yardName }}</div>
                    <div class="channel-name">{{ row.channelName }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 商户信息列 -->
            <el-table-column label="商户信息" width="280">
              <template #default="{ row }">
                <div class="merchant-info-cell">
                  <div class="merchant-detail">
                    <div class="merchant-name">
                      <el-icon class="merchant-icon">
                        <Shop />
                      </el-icon>
                      <span class="merchant-text">{{ row.merchantName }}</span>
                    </div>
                    <div class="notifier-name">
                      <el-icon class="notifier-icon">
                        <User />
                      </el-icon>
                      <span class="notifier-text">{{ row.notifierName }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 时间信息列 -->
            <el-table-column label="时间信息" width="280">
              <template #default="{ row }">
                <div class="time-info-cell">
                  <div class="time-item appointment-time">
                    <el-icon class="time-icon">
                      <Calendar />
                    </el-icon>
                    <div class="time-content">
                      <span class="time-label">预约</span>
                      <span class="time-value">{{ row.appointmentTime }}</span>
                    </div>
                  </div>
                  <div class="time-item reserve-time">
                    <el-icon class="time-icon">
                      <Clock />
                    </el-icon>
                    <div class="time-content">
                      <span class="time-label">放行</span>
                      <span class="time-value">{{ row.reserveTime }}</span>
                    </div>
                  </div>
                  <div class="time-item update-time">
                    <el-icon class="time-icon">
                      <EditPen />
                    </el-icon>
                    <div class="time-content">
                      <span class="time-label">修改</span>
                      <span class="time-value">{{ row.updateTime }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 状态信息列 -->
            <el-table-column label="状态信息" width="120" align="center">
              <template #default="{ row }">
                <div class="status-info-cell">
                  <div class="status-item">
                    <el-tag type="success" v-if="row.appointmentFlag === 0" effect="dark" size="small">
                      未预约
                    </el-tag>
                    <el-tag type="success" v-if="row.appointmentFlag === 1" effect="dark" size="small">
                      已预约
                    </el-tag>
                  </div>
                  <div class="status-item">
                    <el-tag type="danger" v-if="row.reserveFlag === 0" effect="dark" size="small">
                      未放行
                    </el-tag>
                    <el-tag type="success" v-else-if="row.reserveFlag === 1" effect="dark" size="small">
                      已放行
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 备注列 -->
            <el-table-column label="备注" prop="remark" min-width="150">
              <template #default="{ row }">
                <div class="remark-cell">
                  <span v-if="row.remark">{{ row.remark }}</span>
                  <span v-else class="no-remark">暂无备注</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" link size="normal" @click="handleEdit(row)" icon="Edit">
                    编辑
                  </el-button>
                  <el-button type="danger" link size="normal" @click="handleDelete(tableData.indexOf(row), row.id)"
                    icon="Delete">
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination :current-page="query.pageNum" :page-sizes="[10, 20, 40]" :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="pageTotal" @size-change="handleSizeChange"
              @current-change="handlePageChange" />
          </div>
        </div>
      </div>
    </div>

    <!-- 数据导出对话框 -->
    <el-dialog v-model="dialogVisible" title="数据导出信息" width="600px" class="modern-dialog" :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="128px" class="modern-form">
          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <Download />
              </el-icon>
              导出配置
            </h3>
            <div class="form-grid">
              <el-form-item label="选择导出时间">
                <el-date-picker v-model="value2" type="datetimerange" :shortcuts="shortcuts" range-separator="--"
                  start-placeholder="开始时间" end-placeholder="结束时间" class="form-date-picker" />
              </el-form-item>

              <el-form-item label="车场名称" prop="yardName">
                <el-select v-model="form.data.yardName" placeholder="请选择车场名称" @change="updateShowChannelNameOptions"
                  class="form-select">
                  <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                    :value="item.yardName" />
                </el-select>
              </el-form-item>

              <el-form-item label="通道名称" v-if="showChannelNameOptions">
                <el-select v-model="form.data.channelName" placeholder="请选择通道名称" clearable class="form-select">
                  <el-option label="万象上东地库入口" value="万象上东地库入口" />
                  <el-option label="四季三期地库入口" value="四季上东地库入口" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="consoleForm">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="confirm-btn" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            确定导出
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改车辆预约信息对话框 -->
    <el-dialog v-model="dialogVisibleUpdate" title="修改外来车辆预约信息" width="600px" class="modern-dialog"
      :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px" class="modern-form">
          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <CreditCard />
              </el-icon>
              车辆基本信息
            </h3>
            <div class="form-grid">
              <el-form-item label="车场名称" prop="yardName">
                <el-select v-model="form.data.yardName" placeholder="请选择车场名称" class="form-select">
                  <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                    :value="item.yardName" @click="changeYardName" />
                </el-select>
              </el-form-item>

              <el-form-item label="车场编号" prop="yardCode">
                <el-input v-model="form.data.yardCode" disabled class="form-input" />
              </el-form-item>

              <el-form-item label="车牌号码" prop="plateNumber">
                <el-input v-model="form.data.plateNumber" @input="convertToUpperCase" placeholder="请输入车牌号码"
                  class="form-input" />
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <Shop />
              </el-icon>
              商户信息
            </h3>
            <div class="form-grid">
              <el-form-item label="商户名称" prop="merchantName">
                <el-select v-model="form.data.merchantName" placeholder="请选择商户名称" class="form-select">
                  <el-option v-for="item in merchantNameList" :key="item.merchantName" :label="item.merchantName"
                    :value="item.merchantName" @click="changeMerchantName" />
                </el-select>
              </el-form-item>

              <el-form-item label="通知人姓名" prop="notifierName">
                <el-select v-model="form.data.notifierName" placeholder="请选择通知人" class="form-select">
                  <el-option v-for="item in notifierNameList" :key="item.notifierName" :label="item.notifierName"
                    :value="item.notifierName" />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <el-icon>
                <Calendar />
              </el-icon>
              时间和备注
            </h3>
            <div class="form-grid">
              <el-form-item label="预约时间" prop="appointmentTime">
                <el-date-picker v-model="form.data.appointmentTime" format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="选择预约时间" class="form-date-picker" />
              </el-form-item>

              <el-form-item label="备注" prop="remark" class="full-width">
                <el-input type="textarea" v-model="form.data.remark" placeholder="请输入备注信息" :rows="3"
                  class="form-textarea" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="cancel-btn" @click="dialogVisibleUpdate = false">
            <el-icon>
              <Close />
            </el-icon>
            取消
          </el-button>
          <el-button type="primary" size="large" class="confirm-btn" @click="update">
            <el-icon>
              <Check />
            </el-icon>
            确定修改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 离场超时车辆查询对话框 -->
    <el-dialog v-model="dialogTableVisible" title="进场超时车辆信息(已离场)" :before-close="handleBeforeClose" width="900px"
      class="modern-dialog timeout-dialog">
      <div class="dialog-content">
        <el-form :model="formClean" class="timeout-form">
          <div class="timeout-form-row">
            <el-form-item label="车场名称" class="timeout-form-item">
              <el-select v-model="formClean.yardName" placeholder="请选择车场名称" class="timeout-select">
                <el-option v-for="item in yardNameList" :key="item.yardName" :label="item.yardName"
                  :value="item.yardName" @click="changeYardName" />
              </el-select>
            </el-form-item>

            <el-form-item label="车辆超时时间" class="timeout-form-item">
              <el-select v-model="formClean.timeOutInterval" placeholder="请选择超时时间" class="timeout-select">
                <el-option label="2小时" value="2" />
                <el-option label="3小时" value="3" />
              </el-select>
            </el-form-item>

            <div class="timeout-buttons">
              <el-button type="primary" @click="selectTimeOutTables">
                查询
              </el-button>
              <el-button type="danger" @click="resetTimeOut">
                重置
              </el-button>
            </div>
          </div>

          <div class="timeout-notice">
            <el-alert title="默认截止时间为48小时" type="warning" :closable="false" show-icon />
          </div>
        </el-form>

        <div v-if="tableVisible" class="timeout-table-container">
          <el-table :data="tableTimeData" @selection-change="handleSelectionChange" ref="multipleTimeOutTable"
            class="timeout-table">
            <el-table-column property="yardName" label="车场名称" width="180px" />
            <el-table-column property="plateNumber" label="车牌号码" width="150px" />
            <el-table-column property="enterTime" label="进场时间" width="210px" />
            <el-table-column property="timeOutInterval" label="超时时间" width="180px" />
          </el-table>

          <div class="timeout-pagination">
            <el-pagination :current-page="queryTime.pageNum" :page-sizes="[6, 10, 12]"
              :page-size="queryTime.pageTimeSize" layout="total, sizes, prev, pager, next, jumper"
              :total="pageTimeTotal" @size-change="sizeTimeChange" @current-change="currentPageTimeChange" />
          </div>
        </div>
      </div>

      <template #footer v-if="tableVisible">
        <div class="dialog-footer">
          <el-button type="primary" size="large" @click="tableVisible = false">
            <el-icon>
              <Close />
            </el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 在场超时车辆查询对话框 -->
    <el-dialog v-model="dialogOnSiteTableVisible" title="进场超时车辆信息(在场)" :before-close="handleBeforeOnSiteClose"
      width="900px" class="modern-dialog timeout-dialog">
      <div class="dialog-content">
        <el-form :model="formOnSite" class="timeout-form">
          <div class="timeout-form-row">
            <el-form-item label="车场名称" class="timeout-form-item">
              <el-checkbox-group v-model="formOnSite.yardName" class="yard-checkbox-group">
                <el-checkbox label="76A9XFDW7" name="yardName">爱建紫园</el-checkbox>
                <el-checkbox label="2KST9MNP" name="yardName">万象上东</el-checkbox>
                <el-checkbox label="2KUF27BH" name="yardName">医大四院专家公寓</el-checkbox>
                <el-checkbox label="2KW2KQD0" name="yardName">远大中央公园停车场</el-checkbox>
                <el-checkbox label="76AGJKSDZ" name="yardName">爱建锦园3号场</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="车辆超时时间" class="timeout-form-item">
              <el-select v-model="formOnSite.timeOutInterval" placeholder="请选择超时时间" class="timeout-select">
                <el-option label="30分钟" value="30" />
                <el-option label="2小时" value="2" />
                <el-option label="3小时" value="3" />
              </el-select>
            </el-form-item>

            <div class="timeout-buttons">
              <el-button type="primary" @click="selectOnSiteTables">
                查询
              </el-button>
              <el-button type="danger" @click="resetOnSite">
                重置
              </el-button>
            </div>
          </div>

          <div class="timeout-notice">
            <el-alert title="默认截止时间为48小时" type="warning" :closable="false" show-icon />
          </div>
        </el-form>

        <div v-if="tableOnSiteVisible" class="timeout-table-container">
          <el-table :data="tableOnSiteData" @selection-change="handleSelectionChangeOnSite" ref="multipleTimeOutTable"
            class="timeout-table">
            <el-table-column property="parkName" label="车场名称" width="180px" />
            <el-table-column property="carNo" label="车牌号码" width="150px" />
            <el-table-column property="enterTime" label="进场时间" width="210px" />
            <el-table-column property="parkingDuration" label="超时时间" width="180px" />
          </el-table>

          <div class="timeout-pagination">
            <el-pagination :current-page="queryOnSiteTime.pageNum" :page-sizes="[6, 10, 12]"
              :page-size="queryOnSiteTime.pageTimeSize" layout="total, sizes, prev, pager, next, jumper"
              :total="pageTimeTotal" @size-change="sizeTimeOnSiteChange"
              @current-change="currentPageTimeOnSiteChange" />
          </div>
        </div>
      </div>

      <template #footer v-if="tableOnSiteVisible">
        <div class="dialog-footer">
          <el-button type="primary" size="large" @click="tableOnSiteVisible = false">
            <el-icon>
              <Close />
            </el-icon>
            关闭
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
import { ElLoading } from 'element-plus'
import {
  Search, ArrowDown, CreditCard, User, Clock,
  EditPen, Download, Calendar, Check, Close, Shop
} from '@element-plus/icons-vue';

import { activityApi } from '../../api/activity';
const root = "/parking/vehicleReservation/";
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
  { label: "车场名称", prop: "yardName" },
  { label: "入场通道", prop: "channelName" },
  { label: "车牌号码", prop: "plateNumber" },
  { label: "商户名称", prop: "merchantName" },
  { label: "通知人姓名", prop: "notifierName" },
  { label: "预约时间", prop: "appointmentTime" },
  { label: "放行时间", prop: "reserveTime" },
  { label: "备注", prop: "remark" },
  { label: "修改时间", prop: "updateTime" },
];

// 判断车牌类型的函数
const getPlateTypeClass = (plateNumber) => {
  if (!plateNumber) return 'plate-unknown';
  const plate = plateNumber.trim().toUpperCase();
  if (plate.length === 8) {
    return 'plate-new-energy';
  } else if (plate.length === 7) {
    return 'plate-traditional';
  }
  return 'plate-unknown';
};

const form = reactive({
  data: {
    id: '',
    yardCode: '',
    yardName: '',
    channelName: '',
    plateNumber: '',
    vehicleClassification: '',
    merchantName: '',
    releaseReason: '',
    notifierName: '',
    appointmentTime: '',
    reserveTime: '',
    remark: '',
    appointmentFlag: -1,
    reserveFlag: -1,
  },
});

const value2 = ref([])
const showChannelNameOptions = ref(false);
import { ElNotification } from 'element-plus'
const errorTime = ref(0);

const shortcuts = [
  {
    text: '隔日8:00-7:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      // 设置时间为8:00:00
      const startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 0, 0);
      // 设置时间为7:59:59
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-8:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 8, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-11:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 11, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-13:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 13, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-15:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 15, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-18:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 18, 59, 59);
      return [startTime, endTime]
    },
  },
  {
    text: '当日6:00-22:59',
    value: () => {
      // 获取当前时间
      const now = new Date();
      // 计算前一天的日期
      const nowEnd = new Date();
      // 设置时间为6:00:00
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      // 设置时间为8:59:59
      const endTime = new Date(nowEnd.getFullYear(), nowEnd.getMonth(), nowEnd.getDate(), 22, 59, 59);
      return [startTime, endTime]
    },
  },
]

const handleExport = async () => {
  const startDate = value2.value[0]
  const endDate = value2.value[1]
  //格式化开始时间
  const newStartDate = new Date(startDate);
  const formattedStartDate = newStartDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
  //格式化结束时间
  const newEndDate = new Date(endDate);
  const formattedEndDate = newEndDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
  console.log(form.data.yardName)
  console.log(formattedStartDate)
  console.log("channelName：" + form.data.channelName)
  if (form.data.yardName === '四季上东') {
    ElMessage.error('四季上东表格请选择万象上东车场通道进行导出！')
  } else {
    const loadingTime = 0;
    dialogVisible.value = false
    // 使用setTimeout模拟异步请求
    setTimeout(() => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在导出报表，请稍后.....',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      request
        // .get("http://www.xuerparking.cn:8111/aketest/export", {
        .get("https://www.xuerparking.cn:8111/aketest/export", {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            yardName: form.data.yardName,
            channelName: form.data.channelName
          },
          responseType: 'blob' //解决乱码问题
        })
        .then(async (res) => {
          if (!res) {
            ElMessage.error("下载内容为空，请重试！")
          }

          // 记录导出操作日志
          try {
            const userId = localStorage.getItem("ms_userid") || "unknown";
            const username = localStorage.getItem("ms_username") || "管理员";

            const exportParams = [];
            if (form.data.yardName) exportParams.push(`车场: ${form.data.yardName}`);
            if (form.data.channelName) exportParams.push(`通道: ${form.data.channelName}`);
            exportParams.push(`时间范围: ${formattedStartDate} - ${formattedEndDate}`);

            const exportDescription = `导出放行记录 (${exportParams.join(', ')})`;

            await activityApi.logVehicleReservationOperation(
              userId,
              username,
              "导出",
              exportDescription,
              null,
              JSON.stringify({
                exportParams: {
                  startDate: formattedStartDate,
                  endDate: formattedEndDate,
                  yardName: form.data.yardName,
                  channelName: form.data.channelName
                }
              }),
              null
            ).catch(err => {
              console.error("记录导出日志失败:", err);
            });
          } catch (error) {
            console.error("导出日志记录失败:", error);
          }

          let url = window.URL.createObjectURL(new Blob([res], { type: 'application/xlsx' }));
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          if (form.data.channelName == '') {
            link.setAttribute('download', form.data.yardName + formattedStartDate.split(' ')[0] + '放行记录.xlsx');
          } else {
            if (form.data.channelName == '万象上东地库入口') {
              link.setAttribute('download', '万象上东' + formattedStartDate.split(' ')[0] + '放行记录.xlsx');
            } else if (form.data.channelName == '四季上东地库入口') {
              console.log('四季上东' + formattedStartDate.split(' ')[0] + '放行记录.xlsx')
              link.setAttribute('download', '四季上东' + formattedStartDate.split(' ')[0] + '放行记录.xlsx');
            }
          }
          document.body.appendChild(link);
          link.click();
          //释放URL对象所占资源
          window.URL.revokeObjectURL(url);
          //用完即删
          document.body.removeChild(link);
          loading.close()
          ElNotification({
            title: '导出成功！',
            message: '数据表导出成功，请注意查收！',
            type: 'success',
            showClose: false,
          })
          errorTime.value = 0;
        }).catch(error => {
          errorTime.value++;
          if (errorTime.value > 5) {
            ElNotification({
              title: '导出失败',
              message: '报表导出失败，请联系管理员！',
              type: 'error',
              duration: 0,
            })
          } else {
            ElNotification({
              title: '导出失败',
              message: '报表导出失败，请刷新重试！',
              type: 'error',
              showClose: false
            })
          }
          loading.close()
        })
    }, loadingTime);
  }
};

// 重置
const onReset = () => {
  form.data.id = ''
  form.data.yardCode = ''
  form.data.yardName = ''
  form.data.channelName = ''
  form.data.plateNumber = ''
  form.data.vehicleClassification = ''
  form.data.merchantName = ''
  form.data.releaseReason = ''
  form.data.notifierName = ''
  form.data.appointmentTime = ''
  form.data.reserveTime = ''
  form.data.remark = ''
};

const handleEdit = (row) => {
  dialogVisibleUpdate.value = true
  form.data.id = row.id
  form.data.yardCode = row.yardCode
  form.data.yardName = row.yardName
  form.data.channelName = row.channelName
  form.data.plateNumber = row.plateNumber
  form.data.vehicleClassification = row.vehicleClassification
  form.data.merchantName = row.merchantName
  form.data.releaseReason = row.releaseReason
  form.data.notifierName = row.notifierName
  form.data.appointmentTime = row.appointmentTime
  form.data.remark = row.remark
};

const channelNameList = ref([]);
const vehicleClassificationList = ref([]);
const merchantNameList = ref([]);
const releaseReasonList = ref([]);
const notifierNameList = ref([]);
const appointmentTimeList = ref([]);
const viewShow = ref(false)
const content = ref("");
const yardNameList = ref([]);
const yardNameLists = ref(["爱建紫园", "万象上东", "医大四院专家公寓", "远大中央公园停车场", "爱建锦园3号场"]);
const applicantUserId = ref("");
const dialogTableVisible = ref(false);
const tableVisible = ref(false);
const tableOnSiteVisible = ref(false);
const gridData = ref([]);
const selectTimeOutData = ref([]);
const tableTimeData = ref([]);
const tableOnSiteData = ref([]);
const dialogFormVisible = ref(false);
const dialogOnSiteTableVisible = ref(false);

request.get("/parking/yardInfo/yardName").then((res) => {
  yardNameList.value = res.data;
});
request.get("/parking/vehicleClassification/vehicleClassification").then(
  (res) => {
    vehicleClassificationList.value = res.data;
  });
request.get("/parking/notifierInfo/merchantName").then(
  (res) => {
    merchantNameList.value = res.data;
  });
request.get("/parking/releaseReason/releaseReason").then(
  (res) => {
    releaseReasonList.value = res.data;
  });

const changeYardName = () => {
  console.log(form.data.yardCode);
  request
    .get("/parking/yardInfo/yardCode",
      {
        params: {
          yardName: form.data.yardName
        },
      })
    .then((res) => {
      form.data.channelName = "";
      form.data.vehicleClassification = "";
      form.data.notifierName = "";
      form.data.merchantName = "";
      form.data.releaseReason = "";
      form.data.yardCode = res.data[0]
      request
        .get("/parking/vehicleReservation/aikeGetChannelInfo",
          {
            params: {
              yardCode: res.data[0]
            },
          })
        .then((res) => {
          console.log("传递的参数为", form.data.yardCode)
          form.data.vehicleClassification = "";
          form.data.notifierName = "";
          form.data.merchantName = "";
          form.data.releaseReason = "";
          channelNameList.value = res.data
        });
    });
};

const changeMerchantName = () => {
  request
    .get("/parking/notifierInfo/notifierName",
      {
        params: {
          merchantName: form.data.merchantName
        },
      })
    .then((res) => {
      form.data.notifierName = "";
      form.data.releaseReason = "";
      notifierNameList.value = res.data;
    });
};

applicantUserId.value = localStorage.getItem("userId")
request.get("/parking/yardInfo/expYardName").then((res) => {
  yardNameList.value = res.data;
});

// 超时清理按钮
const timeOutCleanup = () => {
  dialogTableVisible.value = true;
};

const selectTimeOutTables = async () => {
  try {
    // 记录查询操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";

    // 构建查询条件描述
    const searchConditions = [];
    if (formClean.yardName) searchConditions.push(`车场名称: ${formClean.yardName}`);
    if (formClean.timeOutInterval) searchConditions.push(`超时时间: ${formClean.timeOutInterval}小时`);

    const searchDescription = searchConditions.length > 0
      ? `查询离场超时车辆 (${searchConditions.join(', ')})`
      : '查询所有离场超时车辆';

    await activityApi.logVehicleReservationOperation(
      userId,
      username,
      "查询",
      searchDescription,
      null,
      JSON.stringify({ searchParams: formClean }),
      null
    ).catch(err => {
      console.error("记录查询日志失败:", err);
    });

    tableVisible.value = true;
    request
      .get(root + "enterTimeOutCleanUp", {
        params: {
          timeOutInterval: formClean.timeOutInterval,
          yardName: formClean.yardName
        },
      })
      .then((res) => {
        console.log(formClean.yardName);
        gridData.value = res.data;
        pageTimeTotal.value = res.data.length;
        getTableData()
      });
  } catch (error) {
    console.error("查询操作失败:", error);
    // 即使日志记录失败，也要继续执行查询
    tableVisible.value = true;
    request
      .get(root + "enterTimeOutCleanUp", {
        params: {
          timeOutInterval: formClean.timeOutInterval,
          yardName: formClean.yardName
        },
      })
      .then((res) => {
        console.log(formClean.yardName);
        gridData.value = res.data;
        pageTimeTotal.value = res.data.length;
        getTableData()
      });
  }
};

const getTableData = () => {
  tableTimeData.value = gridData.value.slice(
    (queryTime.pageNum - 1) * queryTime.pageSize,
    queryTime.pageNum * queryTime.pageSize
  );
  pageTimeTotal.value = gridData.value.length;
};

const handleBeforeClose = () => {
  formClean.timeOutInterval = '';
  dialogTableVisible.value = false;
  tableVisible.value = false;
  formClean.yardName = ''
};

const resetTimeOut = () => {
  formClean.timeOutInterval = '';
  tableVisible.value = false;
  formClean.yardName = ''
};

const formClean = reactive({
  timeOutInterval: '',
  yardName: ''
});

const handleSelectionChange = (val) => {
  // 选择的数据
  selectTimeOutData.value = val;
  console.log(selectTimeOutData.value)
};

// 在场车辆
const timeOnSite = () => {
  dialogOnSiteTableVisible.value = true;
};

const selectOnSiteTables = async () => {
  try {
    // 记录查询操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";

    // 构建查询条件描述
    const searchConditions = [];
    if (formOnSite.yardName && formOnSite.yardName.length > 0) {
      searchConditions.push(`车场: ${formOnSite.yardName.join(', ')}`);
    }
    if (formOnSite.timeOutInterval) searchConditions.push(`超时时间: ${formOnSite.timeOutInterval}分钟`);

    const searchDescription = searchConditions.length > 0
      ? `查询在场超时车辆 (${searchConditions.join(', ')})`
      : '查询所有在场超时车辆';

    await activityApi.logVehicleReservationOperation(
      userId,
      username,
      "查询",
      searchDescription,
      null,
      JSON.stringify({ searchParams: formOnSite }),
      null
    ).catch(err => {
      console.error("记录查询日志失败:", err);
    });

    tableOnSiteVisible.value = true;
    console.log(formOnSite.yardName)
    console.log(formOnSite.timeOutInterval)
    request({
      url: "https://www.xuerparking.cn:8111/aketest/getAKEParkOnSiteCar",
      method: "POST",
      data: {
        parkCodeList: formOnSite.yardName,
        timeOutInterval: formOnSite.timeOutInterval
      },
    })
      .then((res) => {
        console.log(res);
        gridData.value = res.data;
        pageTimeTotal.value = res.data.length;
        getOnSiteTableData()
      });
  } catch (error) {
    console.error("查询操作失败:", error);
    // 即使日志记录失败，也要继续执行查询
    tableOnSiteVisible.value = true;
    console.log(formOnSite.yardName)
    console.log(formOnSite.timeOutInterval)
    request({
      url: "https://www.xuerparking.cn:8111/aketest/getAKEParkOnSiteCar",
      method: "POST",
      data: {
        parkCodeList: formOnSite.yardName,
        timeOutInterval: formOnSite.timeOutInterval
      },
    })
      .then((res) => {
        console.log(res);
        gridData.value = res.data;
        pageTimeTotal.value = res.data.length;
        getOnSiteTableData()
      });
  }
};

const getOnSiteTableData = () => {
  tableOnSiteData.value = gridData.value.slice(
    (queryOnSiteTime.pageNum - 1) * queryOnSiteTime.pageSize,
    queryOnSiteTime.pageNum * queryOnSiteTime.pageSize
  );
  pageTimeTotal.value = gridData.value.length;
};

const handleBeforeOnSiteClose = () => {
  formOnSite.timeOutInterval = '';
  dialogOnSiteTableVisible.value = false;
  tableOnSiteVisible.value = false;
  formOnSite.yardName = []
};

const resetOnSite = () => {
  formOnSite.timeOutInterval = '';
  tableOnSiteVisible.value = false;
  formOnSite.yardName = []
};

const formOnSite = reactive({
  timeOutInterval: '',
  yardName: []
});

const handleSelectionChangeOnSite = (val) => {
  selectTimeOutData.value = val;
  console.log(selectTimeOutData.value)
};

const updateShowChannelNameOptions = () => {
  if (form.data.yardName === '万象上东') {
    showChannelNameOptions.value = true;
  } else {
    showChannelNameOptions.value = false;
  }
};

const consoleForm = () => {
  onReset();
  value2.value = ref([]);
  showChannelNameOptions.value = false;
  dialogVisible.value = false
};

const queryTime = reactive({
  pageNum: 1,
  pageSize: 10,
});

const queryOnSiteTime = reactive({
  pageNum: 1,
  pageSize: 10,
});

const query = reactive({
  yardName: "",
  plateNumber: "",
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref([]);
const pageTotal = ref(0);
const pageTimeTotal = ref(0);
const dialogVisibleUpdate = ref(false)
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)

// 获取表格数据
const getData = () => {
  request
    .get(root + "reservationPage", {
      params: query,
    })
    .then((res) => {
      tableData.value = res.data.records;
      pageTotal.value = res.data.total;
      console.log(res.data)
    });
};

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
  let style = { padding: '12px 8px' }
  return style
};

getData();

// 查询操作
const handleSearch = async () => {
  try {
    // 记录查询操作日志
    const userId = localStorage.getItem("ms_userid") || "unknown";
    const username = localStorage.getItem("ms_username") || "管理员";

    // 构建查询条件描述
    const searchParams = [];
    if (query.yardName) searchParams.push(`车场名称: ${query.yardName}`);
    if (query.plateNumber) searchParams.push(`车牌号码: ${query.plateNumber}`);

    const searchDescription = searchParams.length > 0
      ? `查询车辆预约记录 (${searchParams.join(', ')})`
      : '查询所有车辆预约记录';

    await activityApi.logVehicleReservationOperation(
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

// currentChange
const currentPageTimeChange = (val) => {
  queryTime.pageNum = val;
  getTableData();
};

const sizeTimeChange = (val) => {
  queryTime.pageSize = val;
  queryTime.pageNum = 1;
  getTableData();
}

// currentChange
const currentPageTimeOnSiteChange = (val) => {
  queryOnSiteTime.pageNum = val;
  getOnSiteTableData();
};

const sizeTimeOnSiteChange = (val) => {
  queryOnSiteTime.pageSize = val;
  queryOnSiteTime.pageNum = 1;
  getOnSiteTableData();
}

// 删除操作
const handleDelete = async (index, sid) => {
  // 二次确认删除
  ElMessageBox.confirm("确定要删除放行信息吗？", "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await request.post(root + sid);
        if (res.data) {
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "未知用户";
          await activityApi.logActivity(
            userId,
            username,
            "车辆预约管理",
            "删除",
            `删除放行记录 ID: ${sid}`
          );

          ElMessage.success("删除成功");
          query.pageNum = 1;
          getData();
          tableData.value.splice(index, 1);
        } else {
          ElMessage.error("删除失败");
        }
      } catch (error) {
        console.error('删除操作失败:', error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
    });
};

//弹窗显示要导出的数据时间节点
const handExport = () => {
  dialogVisible.value = true;
}

const formRef = ref(null);

const convertToUpperCase = (value) => {
  // 将输入值转换为大写
  form.data.plateNumber = value.toUpperCase();
};

const update = () => {
  if (form.data.plateNumber.length < 7 || form.data.plateNumber.length > 8) {
    alert('输入长度必须为7-8位');
    form.data.plateNumber = "";
    return;
  } else if (/[\u4e00-\u9fa5]/.test(form.data.plateNumber)) {
    // 检查输入值是否包含多个汉字
    const chineseCharacters = form.data.plateNumber.match(/[\u4e00-\u9fa5]/g);
    if (chineseCharacters && chineseCharacters.length > 2) {
      ('除第一个和最后一个外不允许输入多个汉字');
      form.data.plateNumber = "";
      return;
    }
  }
  // 表单校验
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request({
          url: "/parking/vehicleReservation/update",
          method: "POST",
          data: {
            id: form.data.id,
            yardCode: form.data.yardCode,
            yardName: form.data.yardName,
            channelName: form.data.channelName,
            plateNumber: form.data.plateNumber,
            vehicleClassification: form.data.vehicleClassification,
            merchantName: form.data.merchantName,
            releaseReason: form.data.releaseReason,
            notifierName: form.data.notifierName,
            appointmentTime: form.data.appointmentTime,
            remark: form.data.remark
          },
        });

        if (res.data.code == 0) {
          // 记录活动日志
          const userId = localStorage.getItem("ms_userid") || "unknown";
          const username = localStorage.getItem("ms_username") || "未知用户";
          await activityApi.logActivity(
            userId,
            username,
            "车辆预约管理",
            "修改",
            `修改放行记录，车牌号: ${form.data.plateNumber}`
          );

          getData();
          ElMessage.success("修改成功！");
          dialogVisibleUpdate.value = false;
        } else {
          dialogVisibleUpdate.value = false;
          ElMessage.error(res.data.msg);
        }
      } catch (error) {
        console.error('修改操作失败:', error);
        ElMessage.error("修改失败");
      }
    }
  });
};


</script>

<style scoped lang="scss">
.vehicle-reservation-success-management {
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

  .page-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
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

  .page-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .el-button {
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      color: white;
      font-weight: 600;
      padding: 12px 20px;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
      }

      &.export-btn:hover {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.5);
      }

      &.timeout-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
      }

      &.onsite-btn:hover {
        background: rgba(251, 191, 36, 0.2);
        border-color: rgba(251, 191, 36, 0.5);
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

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: stretch;

          .search-item .search-input {
            width: 100%;
          }

          .search-buttons-inline {
            margin-left: 0;
            justify-content: center;
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
.vehicle-info-cell {
  display: flex;
  align-items: flex-start;

  .vehicle-details {
    .plate-number {
      font-weight: bold;
      font-size: 15px;
      margin-bottom: 4px;
      padding: 4px 12px;
      border-radius: 6px;
      text-align: center;
      min-width: 90px;
      display: inline-block;

      &.plate-new-energy {
        background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
        color: #000000;
        border: 1px solid #6AD390;
        box-shadow: 0 2px 4px rgba(106, 211, 144, 0.3);
      }

      &.plate-traditional {
        background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
        color: #FFFFFF;
        border: 1px solid #0C4FC5;
        box-shadow: 0 2px 4px rgba(12, 79, 197, 0.3);
      }

      &.plate-unknown {
        background: #f3f4f6;
        color: #6b7280;
        border: 1px solid #d1d5db;
      }
    }

    .yard-name {
      font-size: 13px;
      color: #374151;
      margin-bottom: 3px;
      font-weight: 500;
      padding: 2px 0;
    }

    .channel-name {
      font-size: 12px;
      color: #64748b;
      background: #f8fafc;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
  }
}

.merchant-info-cell {
  .merchant-detail {
    .merchant-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      margin-bottom: 8px;
      padding: 6px 10px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 8px;
      border-left: 3px solid #f59e0b;

      .merchant-icon {
        font-size: 16px;
        color: #d97706;
      }

      .merchant-text {
        font-weight: 600;
      }
    }

    .notifier-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #64748b;
      padding: 4px 10px;
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-radius: 6px;
      border-left: 3px solid #0ea5e9;

      .notifier-icon {
        font-size: 14px;
        color: #0284c7;
      }

      .notifier-text {
        font-weight: 500;
      }
    }
  }
}

.time-info-cell {
  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &.appointment-time {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 3px solid #0ea5e9;

      .time-icon {
        font-size: 14px;
        color: #0284c7;
      }
    }

    &.reserve-time {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 3px solid #22c55e;

      .time-icon {
        font-size: 14px;
        color: #16a34a;
      }
    }

    &.update-time {
      background: linear-gradient(135deg, #fefbf3 0%, #fef3c7 100%);
      border-left: 3px solid #eab308;

      .time-icon {
        font-size: 14px;
        color: #ca8a04;
      }
    }

    .time-content {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .time-label {
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
      }

      .time-value {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }

    &:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.status-info-cell {
  .status-item {
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.remark-cell {
  .no-remark {
    color: #9ca3af;
    font-style: italic;
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

        @media (min-width: 768px) {
          grid-template-columns: 1fr 1fr;

          .full-width {
            grid-column: 1 / -1;
          }
        }

        .el-form-item {
          margin-bottom: 0;

          :deep(.el-form-item__label) {
            font-weight: 600;
            color: #374151;
          }

          .form-input,
          .form-select,
          .form-date-picker {
            width: 100%;

            :deep(.el-input__wrapper),
            :deep(.el-select__wrapper) {
              border-radius: 8px;
              border: 2px solid #e2e8f0;
              transition: border-color 0.3s ease;

              &:hover {
                border-color: #3b82f6;
              }

              &.is-focus {
                border-color: #3b82f6;
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

/* 超时查询对话框特殊样式 */
.timeout-dialog {
  .timeout-form {
    .timeout-form-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
      margin-bottom: 20px;

      .timeout-form-item {
        flex: 1;
        min-width: 200px;
        margin-bottom: 0;

        .timeout-select {
          width: 100%;
        }

        .yard-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .el-checkbox {
            margin: 0;
          }
        }
      }

      .timeout-buttons {
        display: flex;
        gap: 8px;
      }
    }

    .timeout-notice {
      margin-bottom: 20px;
    }
  }

  .timeout-table-container {
    .timeout-table {
      margin-bottom: 16px;
    }

    .timeout-pagination {
      display: flex;
      justify-content: center;
    }
  }
}

/* 表格行样式 */
:deep(.odd-row) {
  background: #f8fafc !important;
}

:deep(.even-row) {
  background: white !important;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .vehicle-reservation-success-management {
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

  .vehicle-info-cell {
    .vehicle-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }

  .modern-dialog .dialog-content {
    padding: 20px;
  }

  .timeout-dialog .timeout-form .timeout-form-row {
    flex-direction: column;
    align-items: stretch;

    .timeout-form-item {
      min-width: auto;
    }

    .timeout-buttons {
      justify-content: center;
    }
  }
}
</style>
