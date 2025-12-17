<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i><img src="..//../icons/svg-black/ReleaseReason.svg"></i>&nbsp; 放行原因
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
                    <el-form-item label-width="80px" label=放行原因>
                        <el-input v-model="query.releaseReason" placeholder="放行原因" class="handle-input mr10"
                            clearable></el-input>
                    </el-form-item>

                    <el-button type="primary" class="searchButton" icon="search" @click="handleSearch">搜索
                    </el-button>
                    <el-button type="primary" class="addButton" @click="handleAdd">新增
                    </el-button>
                </el-form>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
                :cell-style="cellStyle" :row-class-name="tableRowClassName">
                <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label"
                    v-for="item in props" :key="item.prop" align="center">
                </el-table-column>


                <el-table-column label="操作" width="200" align="center" fixed="right">
                    <template #default="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑
                        </el-button>
                        <el-button type="text" icon="el-icon-delete" class="red"
                            @click="handleDelete(scope.$index, scope.row.id)">删除
                        </el-button>

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
        <div>
            <el-dialog title="放行原因" v-model="dialogVisible" width="50%">
                <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
                    <el-form-item label="放行原因" prop="releaseReason">
                        <el-input v-model="form.data.releaseReason" style="width: 80%"></el-input>
                    </el-form-item>
                    <el-form-item label="放行原因序号" prop="releaseNo" label-width="120px">
                        <el-input v-model="form.data.releaseNo" style="width: 80%"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="save">确 定</el-button>
                    </span>
                </template>
            </el-dialog>
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
const root = "/parking/releaseReason/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
    { label: "放行原因", prop: "releaseReason" },
    { label: "放行原因序号", prop: "releaseNo" },
    { label: "创建时间", prop: "gmtCreate" },
    { label: "修改时间", prop: "gmtModified" },
];

const rules = {
    releaseReason: [
        {
            required: true,
            message: "请输入放行原因",
            trigger: "blur",
        },
    ],
    releaseNo: [
        {
            required: true,
            message: "请输入放行原因序号",
            trigger: "blur",
        },
    ],
};
const form = reactive({
    data: {
        id: '',
        releaseReason: '',
        releaseNo: ''
    },
})

const handleExport = () => {
    window.location.href = "http://localhost:9999/purchase/exportPurchaseManagement";
};
// 重置
const onReset = () => {
    form.data.releaseReason = ''
    form.data.releaseNo = ''
};
const viewShow = ref(false)
const content = ref("");

const applicantUserId = ref("");
applicantUserId.value = localStorage.getItem("userId")

const query = reactive({
    releaseReason: "",
    pageNum: 1,
    pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const userId = localStorage.getItem("userId")
const dialogVisible = ref(false)
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
// 删除操作
const handleDelete = (index, sid) => {
    // 二次确认删除
    ElMessageBox.confirm("确定要删除吗？", "提示", {
        type: "warning",
    })
        .then(() => {
            request.delete(root + sid).then((res) => {
                if (res.data) {
                    ElMessage.success("删除成功");
                    tableData.value.splice(index, 1);
                } else {
                    ElMessage.error("删除失败");
                }
            });
        })
        .catch(() => {
        });
};

// 新增操作
const handleAdd = () => {
    dialogVisible.value = true;
    onReset();
};
// 表格编辑时弹窗和保存
const editVisible = ref(false);
const handleEdit = (row) => {
    dialogVisible.value = true
    form.data.id = row.id
    form.data.releaseReason = row.releaseReason
    form.data.releaseNo = row.releaseNo
};
const formRef = ref(null);
const save = () => {
    // 表单校验
    formRef.value.validate((valid) => {
        if (valid) {
            var method = form.data.id === "" ? "POST" : "PUT";
            request({
                url: "/parking/releaseReason",
                method: method,
                data: {
                    id: form.data.id,
                    releaseReason: form.data.releaseReason,
                    releaseNo: form.data.releaseNo,
                },
            }).then((res) => {
                form.data = {}
                if (res.code === null) {
                    getData()
                    ElMessage.success("提交成功！");
                    // 关闭当前页面的标签页;
                    dialogVisible.value = false
                } else {
                    dialogVisible.value = false
                    ElMessage.error(res.msg);
                }
            });
        } else {
            return false;
        }
    });
};
</script>
<style lang="scss" scoped>
.odd-row {
    background-color: rgb(241, 242, 244) !important;
}

.even-row {
    background-color: rgb(255, 255, 255) !important;
}
</style>