<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-location"></i> 书籍管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
          <el-form-item label-width="80px" label="书籍名称">
            <el-input v-model="query.community" placeholder="书籍名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-button type="primary" class="searchButton" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" class="addButton" @click="handleAdd">新增
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
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
      <el-dialog title="书籍信息" v-model="dialogVisible" width="50%">
        <el-form :model="form.data" ref="formRef" :rules="gateRules" label-width="110px">
          <el-form-item label="书籍名称" prop="name">
            <el-input v-model="form.data.name" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="生产时间" prop="time">
            <el-input v-model="form.data.time" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="出版日期" prop="date">
            <el-input v-model="form.data.date" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="图片" prop="img">
            <el-input v-model="form.data.img" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="文件" prop="file">
            <el-input v-model="form.data.file" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="书籍价格" prop="price">
            <el-input v-model="form.data.price" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="书籍页数" prop="pages">
            <el-input v-model="form.data.pages" style="width: 80%"></el-input>
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

const treeVisible = ref(false)
const treeBuilding = ref();
const root = "/parking/book/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
  { label: "书籍名称", prop: "name" },
  { label: "生产时间", prop: "time" },
  { label: "出版日期", prop: "date" },
  { label: "图片", prop: "img" },
  { label: "文件", prop: "file" },
  { label: "价格", prop: "price" },
  { label: "页数", prop: "pages" }
];

const form = reactive({
  data: {
    id: '',
    name: '',
    time: '',
    date: '',
    img: '',
    file: '',
    price: '',
    pages: ''
  },
  ticketsData: {
    id: '',
    file: '',
    price: '',
    ticketList: [],
    ticketName: '',
    ticketCode: '',
    name: '',
    time: '',
    date: '',
    img: '',
    treeData: [],
    arrayId: [],
  },
});
const handleExport = () => {
  window.location.href = "http://www.xuerparking.cn:9999/purchase/exportPurchaseManagement";
};
// 重置
const onReset = () => {
  form.data.id = ''
  form.data.name = ''
  form.data.time = ''
  form.data.date = ''
  form.data.img = ''
  form.data.file = ''
  form.data.price = ''
  form.data.pages = ''
  form.ticketsData.id = ''
  form.ticketsData.name = ''
  form.ticketsData.time = ''
  form.ticketsData.date = ''
  form.ticketsData.img = ''
  form.ticketsData.file = ''
  form.ticketsData.price = ''
  form.ticketsData.pages = ''
  form.ticketsData.ticketCode = ''
  form.ticketsData.ticketName = ''
  form.ticketsData.treeData = [],
    form.ticketsData.arrayId = []
};
const viewShow = ref(false)
const content = ref("");
// const handleView = (row) => {
//   console.log("这批我")
//   if (row.fileReason !== null) {
//     viewShow.value = true
//     content.value = row.fileReason
//   } else {
//     ElMessage.info('没有审核原因');
//   }
// };
const query = reactive({
  name: "",
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisible = ref(false)
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
  form.data.name = row.name
  form.data.time = row.time
  form.data.date = row.date
  form.data.img = row.img
  form.data.file = row.file
  form.data.price = row.price
  form.data.pages = row.pages
};
const bookRules = {
  name: [
    {
      required: true,
      message: "请填入书籍名称",
      trigger: 'blur'
    },
  ],
  time: [
    {
      required: true,
      message: "请填入生产时间",
      trigger: 'blur'
    },
  ],
  date: [
    {
      required: true,
      message: "请填入出版日期",
      trigger: 'blur'
    },
  ],
  img: [
    {
      required: true,
      message: "请修改图片",
      trigger: 'change'
    },
  ],
  file: [
    {
      required: true,
      message: "请修改文件",
      trigger: 'blur'
    },
  ],
  price: [
    {
      required: true,
      message: "请填写书籍价格",
      trigger: 'blur'
    },
  ],
  pages: [
    {
      required: true,
      message: "请填写书籍页数",
      trigger: 'blur'
    },
  ],
};
const formRef = ref(null);
const ticketFormRef = ref(null);
const save = () => {
  // 表单校验
  formRef.value.validate((valid) => {
    console.log(form.data.id);
    if (valid) {
      var method = form.data.id === "" ? "POST" : "PUT";
      console.log(method);
      request({
        url: root,
        method: method,
        data: form.data,
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
const treeProps = {
  children: 'children',
  label: 'building'
};

const ticketRules = {
  ticketName: [
    {
      required: true,
      message: "请选择月票类型",

    },
  ],
  arrayId: [{ required: true, message: '请选择', trigger: 'change' },
  ],
};
const changeTickets = () => {
  console.log(form.ticketsData.ticketName)
  for (let i = 0; i < form.ticketsData.ticketList.length; i++) {
    if (form.ticketsData.ticketList[i].ticketName == form.ticketsData.ticketName) {
      form.ticketsData.ticketCode = form.ticketsData.ticketList[i].ticketCode
      console.log(form.ticketsData.ticketCode)
      return

    }
  }
};
const handleCheckChange = () => {
  form.ticketsData.arrayId = treeBuilding.value.getCheckedKeys();
}
</script>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: red;
}
</style>