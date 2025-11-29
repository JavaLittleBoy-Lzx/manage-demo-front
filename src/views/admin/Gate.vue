<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i><img src="..//../icons/svg-black/Gate.svg"></i>&nbsp;出入口系统绑定
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="60px">
          <el-form-item label-width="80px" label="小区名称">
            <el-input v-model="query.community" placeholder="小区名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label-width="90px" label="出入口名称">
            <el-input v-model="query.gatename" placeholder="出入口名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-button type="primary" class="searchButton" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
          <el-button type="primary" class="addButton" @click="handleAdd">新增
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
        :cell-style="cellStyle" :row-class-name="tableRowClassName">
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
            <el-button type="text" icon="el-icon-user" class="red" @click="handleTickets(scope.row)">权限
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
      <el-dialog title="出入口系统绑定" v-model="dialogVisible" width="50%">
        <el-form :model="form.data" ref="formRef" :rules="gateRules" label-width="110px">
          <el-form-item label="省份" prop="province">
            <el-select v-model="form.data.province" placeholder="请选择省份">
              <el-option v-for="item in provinceList" :key="item.province" :label="item.province" :value="item.province"
                @click="changeProvince">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="地市" prop="city">
            <el-select v-model="form.data.city" placeholder="请选择地市">
              <el-option v-for="item in cityList" :key="item.city" :label="item.city" :value="item.city"
                @click="changeCity">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区县" prop="district">
            <el-select v-model="form.data.district" placeholder="请选择区县">
              <el-option v-for="item in districtList" :key="item.district" :label="item.district" :value="item.district"
                @click="changeDistrict">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="小区" prop="community">
            <el-select v-model="form.data.community" placeholder="请选择小区">
              <el-option v-for="item in communityList" :key="item.community" :label="item.community"
                :value="item.community" @click="changeCommunity">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="出入口名称" prop="gatename">
            <el-input v-model="form.data.gatename" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="出入口编码" prop="parkingcode">
            <el-input v-model="form.data.parkingcode" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="parkingsecret" prop="parkingsecret">
            <el-input v-model="form.data.parkingsecret" style="width: 80%"></el-input>
          </el-form-item>
          <el-form-item label="parkingkey" prop="parkingkey">
            <el-input v-model="form.data.parkingkey" style="width: 80%" @blur="getTickets"></el-input>
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
    <div>
      <el-dialog title="楼栋权限" v-model="treeVisible" width="50%">
        <el-form :model="form.ticketsData" ref="ticketFormRef" :rules="ticketRules" label-width="100px">
          <el-form-item label="月票类型" prop="ticketName">
            <el-select v-model="form.ticketsData.ticketName" placeholder="请选择月票类型">
              <el-option v-for="item in form.ticketsData.ticketList" :key="item.ticketName" :label="item.ticketName"
                :value="item.ticketName" @click="changeTickets">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择楼栋" prop="arrayId">
            <el-tree ref="treeBuilding" :data="form.ticketsData.treeData" show-checkbox node-key="id"
              @check-change="handleCheckChange" :props="treeProps">
            </el-tree>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="treeVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveTree">确 定</el-button>
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
const root = "/parking/gate/";
const router = useRouter();
const route = useRoute();
const store = useStore();
const props = [
  { label: "省份", prop: "province" },
  { label: "地市", prop: "city" },
  { label: "县区", prop: "district" },
  { label: "小区", prop: "community" },
  { label: "出入口名称", prop: "gatename" },
  { label: "出入口编码", prop: "parkingcode" },
  { label: "secret", prop: "parkingsecret" },
  { label: "key", prop: "parkingkey" },

];

const form = reactive({
  data: {
    id: '',
    province: '',
    city: '',
    district: '',
    community: '',
    gatename: '',
    parkingcode: '',
    parkingsecret: '',
    parkingkey: '',
  },
  ticketsData: {
    id: '',
    parkingcode: '',
    parkingsecret: '',
    parkingkey: '',
    ticketList: [],
    ticketName: '',
    ticketCode: '',
    province: '',
    city: '',
    district: '',
    community: '',
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
  form.data.province = ''
  form.data.city = ''
  form.data.district = ''
  form.data.community = ''
  form.data.gatename = ''
  form.data.parkingcode = ''
  form.data.parkingsecret = ''
  form.data.parkingkey = ''

  form.ticketsData.id = ''
  form.ticketsData.parkingcode = ''
  form.ticketsData.parkingkey = ''
  form.ticketsData.parkingsecret = ''
  form.ticketsData.province = ''
  form.ticketsData.city = ''
  form.ticketsData.district = ''
  form.ticketsData.community = ''
  form.ticketsData.ticketCode = ''
  form.ticketsData.ticketName = ''
  form.ticketsData.treeData = [],
    form.ticketsData.arrayId = []
};
const viewShow = ref(false)
const content = ref("");
const handleView = (row) => {
  console.log("这批我")
  if (row.fileReason !== null) {
    viewShow.value = true
    content.value = row.fileReason
  } else {
    ElMessage.info('没有审核原因');
  }
};
const viewShow1 = ref(false)
const content1 = ref("");
const handleView1 = (row) => {
  console.log("这批我")
  if (row.purchaseVoucher !== null) {
    viewShow.value = true
    content1.value = row.purchaseVoucher
  } else {
    ElMessage.info('没有审核原因');
  }
};

const query = reactive({
  community: "",
  gatename: "",
  pageNum: 1,
  pageSize: 10,
});
const tableData = ref([]);
const pageTotal = ref(0);
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
    .get(root + "querypage", {
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
  form.data.province = row.province
  form.data.city = row.city
  form.data.district = row.district
  form.data.community = row.community
  form.data.gatename = row.gatename
  form.data.parkingcode = row.parkingcode
  form.data.parkingsecret = row.parkingsecret
  form.data.parkingkey = row.parkingkey
};
const gateRules = {
  province: [
    {
      required: true,
      message: "请选择省份",
      trigger: 'change'
    },
  ],
  city: [
    {
      required: true,
      message: "请选择地市",
      trigger: 'change'
    },
  ],
  district: [
    {
      required: true,
      message: "请选择县区",
      trigger: 'change'
    },
  ],
  community: [
    {
      required: true,
      message: "请选择小区",
      trigger: 'change'
    },
  ],
  gatename: [
    {
      required: true,
      message: "请填写出入口名称",
      trigger: 'blur'
    },
  ],
  parkingcode: [
    {
      required: true,
      message: "请填写出入口编码",
      trigger: 'blur'
    },
  ],
  parkingsecret: [
    {
      required: true,
      message: "请填写secret",
      trigger: 'blur'
    },
  ],
  parkingkey: [
    {
      required: true,
      message: "请填写key",
      trigger: 'blur'
    },
  ],
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
    .get("/parking/community/city",
      {
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
  console.log(form.data.province);
  request
    .get("/parking/community/district",
      {
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
    .get("/parking/community/community",
      {
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
// 月票楼栋
const handleTickets = (row) => {
  onReset();
  treeVisible.value = true;
  form.ticketsData.id = row.id
  form.ticketsData.parkingcode = row.parkingcode
  form.ticketsData.parkingkey = row.parkingkey
  form.ticketsData.parkingsecret = row.parkingsecret
  form.ticketsData.province = row.province
  form.ticketsData.city = row.city
  form.ticketsData.district = row.district
  form.ticketsData.community = row.community
  console.log(form.ticketsData);
  //获得多有楼层
  getTickets();
  //获得多有楼层
  request({
    url: "/parking/community/getBuilding",
    method: "GET",
    params: {
      province: form.ticketsData.province,
      city: form.ticketsData.city,
      district: form.ticketsData.district,
      community: form.ticketsData.community,
    },
  }).then((res) => {
    console.log(res);
    form.ticketsData.treeData = res.data
    //所管楼栋
    request({
      url: "/parking/tickets/getManageBuilding",
      method: "GET",
      params: {
        gateid: form.ticketsData.id
      },
    }).then((res) => {
      console.log(res.data);
      if (res.data.length > 0) {
        form.ticketsData.ticketCode = res.data[0].ticketcode
        form.ticketsData.ticketName = res.data[0].ticketname
        var arr = [];
        for (let i = 0; i < res.data.length; i++) {
          arr.push(res.data[i].building)
        }
        console.log(arr);
        treeBuilding.value.setCheckedKeys(arr)
      } else {
        treeBuilding.value.setCheckedKeys([])
      }
    });
  });
}
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
const saveTree = () => {
  ticketFormRef.value.validate((valid) => {
    console.log(form.ticketsData.ticketName)
    if (valid) {
      let arrayId;
      arrayId = treeBuilding.value.getCheckedKeys();
      form.ticketsData.arrayId = arrayId;
      console.log(arrayId);
      console.log(form.ticketsData);
      request({
        url: "/parking/tickets/insertTickets",
        method: "POST",
        params: {
          gateid: form.ticketsData.id,
          createman: localStorage.getItem("loginname"),
          ticketcode: form.ticketsData.ticketCode,
          ticketname: form.ticketsData.ticketName,
          arrayId: form.ticketsData.arrayId,
        },
      }).then((res) => {

        form.data = {}
        if (res.code === null) {
          getData()
          ElMessage.success("提交成功！");
          // 关闭当前页面的标签页;
          treeVisible.value = false
        } else {
          treeVisible.value = false
          ElMessage.error(res.msg);
        }
      });
    } else {
      return false;
    }
  });
};
const getTickets = () => {
  console.log("00000000");
  request
    .get("/parking/gate/getTickets",
      {
        params: {
          parkingKey: form.ticketsData.parkingkey,
          parkingSecret: form.ticketsData.parkingsecret,
          parkingCode: form.ticketsData.parkingcode,
        },
      })
    .then((res) => {
      var data = JSON.parse(res.data);
      console.log(data);
      console.log(data.data.recordList);
      form.ticketsData.ticketList = data.data.recordList
    });

};

</script>
<style lang="scss" scoped>
// :deep(.el-form-item__label) {
//     color: red;
//   }
.odd-row {
  background-color: rgb(219, 244, 252) !important;
}

.even-row {
  background-color: rgb(208, 250, 202) !important;
}
</style>
