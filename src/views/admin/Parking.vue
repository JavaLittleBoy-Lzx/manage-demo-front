<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 停车场设置
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="80px">
          <el-form-item label-width="80px" label="省份">
            <el-input v-model="query.province" placeholder="省份" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="地市">
            <el-input v-model="query.city" placeholder="地市" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="市县">
            <el-input v-model="query.district" placeholder="市县" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="小区名称">
            <el-input v-model="query.community" placeholder="小区名称" class="handle-input mr10" maxlength="13"
              clearable></el-input>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
        @row-click="handleRowClick">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="text" icon="el-icon-add" @click="handleAdd(scope.row)">增加停车场
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-table :data="parkingData" border class="table" ref="communityTable" @selection-change="selectionChange"
        header-cell-class-name="table-header" row-key="id">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label"
          v-for="item in parkingprops" :key="item.prop" align="center">
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑
            </el-button>
            <el-button type="text" icon="el-icon-delete" class="red"
              @click="handleDelete(scope.$index, scope.row.id)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div>
        <el-dialog title="增加停车场" v-model="dialogVisible" width="50%">
          <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
            <el-form-item label="省份">
              <el-input v-model="form.data.province" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="地市">
              <el-input v-model="form.data.city" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="区县">
              <el-input v-model="form.data.district" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="小区">
              <el-input v-model="form.data.community" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="停车场名称">
              <el-input v-model="form.data.parking" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input type="textarea" :rows="2" v-model="form.data.remark" style="width: 80%"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="handleSave">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
      <div>
        <el-dialog title="修改停车场" v-model="parkingVisible" width="50%">
          <el-form :model="parkingform.data" ref="parkingformRef" :rules="rules" label-width="100px">
            <el-form-item label="省份">
              <el-input v-model="parkingform.data.province" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="地市">
              <el-input v-model="parkingform.data.city" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="区县">
              <el-input v-model="parkingform.data.district" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="小区">
              <el-input v-model="parkingform.data.community" disabled="true" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="停车场名称">
              <el-input v-model="parkingform.data.parking" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input type="textarea" :rows="2" v-model="parkingform.data.remark" style="width: 80%"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="parkingVisible = false">取 消</el-button>
              <el-button type="primary" @click="parkingSave">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { stringifyQuery, useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";

const root = "/parking/community/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const communityTable = ref(null);
const props = [
  { label: "省份", prop: "province" },
  { label: "地市", prop: "city" },
  { label: "区县", prop: "district" },
  { label: "小区", prop: "community" },
];
const parkingprops = [
  { label: "名称", prop: "parking" },
  { label: "备注", prop: "remark" },
];
const handleAdd = (row) => {
  dialogVisible.value = true
  form.data.province = row.province
  form.data.city = row.city
  form.data.district = row.district
  form.data.community = row.community
  form.data.parking = ""
  form.data.remark = ""
};

const handleClose = (done) => {
  ElMessageBox.confirm("确定放弃选择或者关闭吗?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
const form = reactive({
  data: {
    id: '',
    province: '',
    city: '',
    district: '',
    community: '',
    parking: '',
    remark: '',
  },
});
const parkingform = reactive({
  data: {
    id: '',
    province: '',
    city: '',
    district: '',
    community: '',
    parking: '',
    remark: '',
  },
});


const handleEdit = (row) => {
  parkingVisible.value = true
  parkingform.data.id = row.id
  parkingform.data.province = row.province
  parkingform.data.city = row.city
  parkingform.data.district = row.district
  parkingform.data.community = row.community
  parkingform.data.parking = row.parking
  parkingform.data.remark = row.remark

};

const query = reactive({
  id: "",
  province: "",
  city: "",
  district: "",
  community: "",
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
const dialogVisible = ref(false)
const parkingVisible = ref(false)
// 获取表格数据
const getData = () => {
  request
    .get(root + "distinctpage", {
      params: query,
    })
    .then((res) => {
      tableData.value = res.data.records;
      pageTotal.value = res.data.total;
      handleRowClick(tableData.value[0]);
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
//获取社区数据
const queryParking = reactive({
  province: "",
  city: "",
  district: "",
  community: "",
  pageNum: 1,
  pageSize: 10,
});
const openid = reactive({
  openid: "",
  username: "",
});
const saveCommunity = ref([]);
const parkingData = ref([]);
const pageTotalParking = ref(0);

const rootParking = "/parking/parking/";
// 获取表格数据

const handleRowClick = (row) => {
  console.log(row);
  if (row.province) {
    queryParking.province = row.province;
    queryParking.city = row.city;
    queryParking.district = row.district;
    queryParking.community = row.community;
    getParkingData();
  }
};
const selectionChange = (val) => {
  console.log(val);
  saveCommunity.value = val;
  for (let i = 0; i < saveCommunity.value.length; i++) {
    saveCommunity.value[i].openid = openid.openid;
    saveCommunity.value[i].username = openid.username;
    console.log(saveCommunity.value[i].openid);
  }
  console.log(saveCommunity.value);
};

const getParkingData = () => {
  request
    .get(rootParking + "allpage", {
      params: queryParking,
    })
    .then((res) => {
      parkingData.value = res.data.records;
      pageTotalParking.value = res.data.total;

    });
};

// 查询操作
const handleSearchCommunity = () => {
  query.pageNum = 1;
  getParkingData();
};
// 分页大小
const handleSizeChangeCommunity = (val) => {
  query.pageSize = val;
  getParkingData();
};
// 分页导航
const handlePageChangeCommunity = (val) => {
  query.pageNum = val;
  getParkingData();
};

// 表格编辑时弹窗和保存

const formRef = ref(null);
const parkingformRef = ref(null);
const handleSave = () => {

  // 表单校验
  request({
    url: "/parking/parking/",
    method: "POST",
    data: form.data,
  }).then((res) => {

    if (res.code === null) {
      getParkingData()
      dialogVisible.value = false
      ElMessage.success("提交成功！");
      // 关闭当前页面的标签页;
    } else {
      dialogVisible.value = false
      ElMessage.error(res.data.msg);
    }
  });


};
const parkingSave = () => {

  // 表单校验
  request({
    url: "/parking/parking/",
    method: "PUT",
    data: parkingform.data,
  }).then((res) => {

    if (res.code === null) {
      getParkingData()
      parkingVisible.value = false
      ElMessage.success("提交成功！");
      // 关闭当前页面的标签页;
    } else {
      parkingVisible.value = false
      ElMessage.error(res.msg);
    }
  });


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
          getParkingData();
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

</script>

<style scoped></style>