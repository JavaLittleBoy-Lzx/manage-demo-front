<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-location"></i> 采购申请
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true" :model="query" class="demo-form-inline" label-width="80px">
          <el-form-item label-width="60px" label="设备名">
            <el-input v-model="query.deviceName" placeholder="设备名称" class="handle-input mr10" clearable></el-input>
          </el-form-item>
          <el-form-item label="部门" prop="departmentId">
            <el-select v-model="query.departmentId" placeholder="请选择部门" clearable>
              <el-option v-for="item in departmentList" :key="item.departmentId" :label="item.departmentName"
                :value="item.departmentId" clearable>
              </el-option>
            </el-select>
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索
          </el-button>
        </el-form>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column :show-overflow-tooltip="true" :prop="item.prop" :label="item.label" v-for="item in props"
          :key="item.prop" align="center">
        </el-table-column>
        <el-table-column label="购买凭证" align="center">
          <template #default="scope">
            <p v-if="scope.row.purchaseVoucher != null">
              <span v-for="(item, index) in scope.row.purchaseVoucher.split(',')" :key="index">
                <el-image style="display: inline-flex;padding: 3px;width: 70%;height: 70%" class="table-td-thumb"
                  :src="item" :preview-src-list="[item]"></el-image>
              </span>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="审批状态" prop="auditStatus" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.auditStatus === 0">待审批</el-tag>
            <el-tag type="warning" v-else-if="scope.row.auditStatus === 1">待采购</el-tag>
            <el-tag type="info" v-else-if="scope.row.auditStatus === 2">未通过</el-tag>
            <el-tag type="info" v-else-if="scope.row.auditStatus === 3">已采购</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEditPurchaseVoucher(scope.row)"
                v-if="scope.row.auditStatus == 1">采购
              </el-button>
              <el-button v-if="(scope.row.auditStatus == 3)">无操作
              </el-button>
            </template>
          </el-table-column>
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
      <el-dialog title="查看审核原因" v-model="viewShow">
        <span style="margin-left: 50px">{{ content }}</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="viewShow = false">取 消</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div>
      <el-dialog title="采购审核" v-model="dialogVisible" width="30%">
        <el-form :model="form.data" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="采购凭证">
            <el-upload ref="pictureUpload" action="#" list-type="picture-card" :limit="1" :on-exceed="handleExceed"
              :auto-upload="false" :file-list="fileList" :on-change="handleFile">
              <template #default>
                <i class="el-icon-plus"></i>
              </template>
              <template #file="{ file }">
                <div>
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                  <span class="el-upload-list__item-actions">
                    <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                      <i class="el-icon-delete"></i>
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>
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

<script>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";

export default {
  name: "",
  methods: {
    //文件上传
    submitUpload() {
      this.$refs.upload.submit();
    },
    //文件数量控制
    handleExceed(files, fileList) {
      console.log(fileList)
      this.$message.warning(
        `The limit is 1, you selected ${files.length
        } files this time, add up to ${files.length + fileList.length} totally`
      );
    },
    //文件移除
    handleRemove(file) {
      let uploadFiles = this.$refs.pictureUpload.uploadFiles
      for (var i = 0; i < uploadFiles.length; i++) {
        if (uploadFiles[i]['url'] == file.url) {
          uploadFiles.splice(i, 1)
          this.fileList.splice(i, 1)
          console.log(this.fileList)
        }
      }
    },
  },
  setup() {
    const root = "/parking/purchase/";
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const props = [
      { label: "设备名称", prop: "deviceName" },
      { label: "设备价格", prop: "devicePrice" },
      { label: "预购数量", prop: "orderQuantity" },
      { label: "申请人", prop: "applicantName" },
      { label: "申请部门", prop: "departmentName" },
      { label: "申请时间", prop: "applicationTime" },
      { label: "申请原因", prop: "applicationReason" },
      // {label: "审批人", prop: "audiustName"},
      { label: "采购时间", prop: "purchaseTime" },
      { label: "审批时间", prop: "audiusTime" },
      { label: "供应商名称", prop: "supplierName" },
    ];
    const form = reactive({
      data: {
        purchaseId: "",
        departmentId: "",
        deviceName: "",
        devicePrice: "",
        orderQuantity: "",
        applicantUserId: "",
        applicationReason: "",
        audiusUserId: "",
        auditStatus: 0,
        supplierId: "",
        fileReason: "",
      },
    });
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
    const departmentList = ref([]);
    request.get("/parking/department/listDepartment").then((res) => {
      departmentList.value = res.data;
    });
    const query = reactive({
      departmentId: "",
      deviceName: "",
      pageNum: 1,
      pageSize: 10,
    });

    const tableData = ref([]);
    const pageTotal = ref(0);
    const dialogVisible = ref(false)
    // 获取表格数据
    const getData = () => {
      request
        .get(root + "queryPagebuy", {
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
    // 表格编辑时弹窗和保存
    const editVisible = ref(false);
    const handleEditPurchaseVoucher = (row) => {
      console.log(row.purchaseId)
      formData.append("purchaseId", row.purchaseId)
      fileList.value = []
      dialogVisible.value = true
      var tadate = [];
      if (row.purchaseVoucher) {
        tadate = row.purchaseVoucher.split(',')
        for (var i = 0; i < tadate.length; i++) {
          var file = {
            name: "",
            url: ""
          }
          file.name = tadate[i].substring(tadate.indexOf("/parking/uploadfile/"), tadate[i].length)
          file.url = tadate[i]
          if (file.name != null && file.name.length > 0 && file.url != null && file.url.length > 0) {
            fileList.value.push(file)
          }
        }
      }
      // form.data.auditStatus = row.auditStatus
      // form.data.fileReason = row.fileReason
    };
    const formRef = ref(null);
    const save = () => {
      // 表单校验
      if (fileList.value != null && fileList.value.length > 0) {
        for (var i = 0; i < fileList.value.length; i++) {
          formData.append("urls", fileList.value[i].url);
        }
      }
      request.post("/parking/purchase/updatePurchaseVoucher", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((res) => {
        if (res.code !== null) {
          ElMessage.error(res.msg);
        } else {
          ElMessage.success("提交成功！");
          formData.delete("purchaseId");
          formData.delete("files")
          // 关闭当前页面的标签页;
          store.commit("closeCurrentTag", {
            $router: router,
            $route: route,
          });
        }
        dialogVisible.value = false
        getData()
      });
    };
    //
    //文件上传
    const disabled = ref(false)
    // const importVisible = ref(false)
    const formData = new FormData();
    const fileList = ref([]);
    const handleFile = (file, fileList) => {
      console.log(fileList)
      formData.delete("files")
      for (var i = 0; i < fileList.length; i++) {
        console.log(fileList[i])
        formData.append("files", fileList[i].raw);
      }
      // console.log(formData.getAll("files"))
    };

    const handleClose = (done) => {
      ElMessageBox.confirm('确定关闭窗口吗?')
        .then(() => {
          done()
          this.formData.delete("roomId")
        })
        .catch(() => {
          // catch error
        })
    }
    return {
      props, handleView,
      query, viewShow, content,
      tableData, dialogVisible,
      pageTotal, departmentList,
      editVisible, formRef,
      form, save, disabled,
      formData, handleFile,
      fileList,
      handleSearch, handleClose,
      handleSizeChange,
      handlePageChange,
      handleEditPurchaseVoucher,
    };
  }
}

</script>

<style scoped></style>