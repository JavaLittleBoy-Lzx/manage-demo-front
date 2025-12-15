<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i><img src="..//../icons/svg-black/ReportCarIn.svg"></i> 车辆入场记录
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
                    <el-form-item label-width="80px" label="车场名称">
                        <el-input v-model="query.yardName" placeholder="车场名称" class="handle-input mr10"
                            clearable></el-input>
                    </el-form-item>
                    <el-form-item label-width="80px" label="车牌号码">
                        <el-input v-model="query.enterCarLicenseNumber" placeholder="车牌号码" class="handle-input mr10"
                            clearable></el-input>
                    </el-form-item>
                    <el-button type="primary" class="searchButton" icon="search" @click="handleSearch">搜索
                    </el-button>
                </el-form>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
                :cell-style="cellStyle" :row-class-name="tableRowClassName">
                <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label"
                    v-for="item in props" :key="item.prop" align="center" width="110px" height="10px">
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

<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";


import XLSX from "xlsx";

const root = "/parking/akReportCarIn/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
    { label: "车场名称", prop: "yardName" },
    { label: "入场通道名称", prop: "enterChannelName" },
    { label: "进场类型", prop: "enterType" },
    { label: "进场Vip类型", prop: "enterVipType" },
    { label: "最终车牌号", prop: "carLicenseNumber" },
    { label: "车辆类型", prop: "enterCarType" },
    { label: "进场说明", prop: "enterNoVipCodeName" },
    { label: "入场车牌号码", prop: "enterCarLicenseNumber" },
    { label: "校正类型", prop: "correctType" },
    { label: "入场时间", prop: "enterTime" },
    { label: "入场车牌颜色", prop: "enterCarLicenseColor" },
    { label: "进场放行操作员", prop: "inOperatorName" },
    { label: "进场放行时间", prop: "inOperatorTime" },
    { label: "创建时间", prop: "createTime" },
    { label: "修改时间", prop: "updateTime" },
];
const form = reactive({
    data: {
        id: '',
        yardName: '',
        enterChannelName: '',
        enterType: '',
        enterVipType: '',
        carLicenseNumber: '',
        enterCarType: '',
        enterNoVipCodeName: '',
        enterCarLicenseNumber: '',
        correctType: '',
        enterTime: '',
        enterCarLicenseColor: '',
        inOperatorName: '',
        inOperatorTime: '',
        appointmentFlag: -1,
        reserveFlag: -1
    },

});

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
    let style = { padding: '15px 5px' }
    return style
};
const viewShow = ref(false)
const content = ref("");

const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")

const query = reactive({
    enterCarLicenseNumber: "",
    yardName: "",
    pageNum: 1,
    pageSize: 10
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
const dialogVisibleReservation = ref(false);

// 获取表格数据
const getData = () => {
    request
        .get(root + "page", {
            params: query,
        })
        .then((res) => {
            tableData.value = res.data.records;
            pageTotal.value = res.data.total;
            console.log(res.data);
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
const formRef = ref(null);
</script>

<style lang="scss" scoped>
.odd-row {
    background-color: rgb(245, 247, 250) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}
</style>