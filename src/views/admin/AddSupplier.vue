<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-calendar"></i> 供应商管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>供应商编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="form-box">
        <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input v-model="form.supplierName"></el-input>
          </el-form-item>
          <el-form-item label="供应商编码" prop="supplierCode">
            <el-input v-model="form.supplierCode"></el-input>
          </el-form-item>
          <el-form-item label="供应商地址" prop="supplierAddress">
            <el-input v-model="form.supplierAddress"></el-input>
          </el-form-item>
          <el-form-item label="联系人" prop="contactsPerson">
            <el-input v-model="form.contactsPerson"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="telephone" :rules="[{ required: true, message: '联系电话 is required' },]">
            <el-input v-model="form.telephone" maxlength="11" type="number"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="form.remarks" type="textarea" :rows="2"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "AddSupplier",
  setup() {
    const root = "/parking/supplier/";
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const rules = {
      departmentName: [
        { required: true, message: "请输入设备名", trigger: "blur" },
      ],
    };
    const formRef = ref(null);
    const form = reactive({
      supplierId: "",
      supplierName: "",
      supplierCode: "",
      supplierAddress: "",
      contactsPerson: "",
      telephone: "",
      remarks: "",
    });
    if (route.query.id) {
      request.get(root + route.query.id).then((res) => {
        form.supplierId = res.data.supplierId
        form.supplierName = res.data.supplierName
        form.supplierCode = res.data.supplierCode
        form.supplierAddress = res.data.supplierAddress
        form.contactsPerson = res.data.contactsPerson
        form.telephone = res.data.telephone
        form.remarks = res.data.remarks
      });
    }
    // 提交
    const onSubmit = () => {
      // 表单校验
      formRef.value.validate((valid) => {
        if (valid) {
          var method = form.supplierId === "" ? "POST" : "PUT";
          request({
            url: "/parking/supplier",
            method: method,
            data: form,
          }).then((res) => {
            if (res.code === null) {
              ElMessage.success("提交成功！");
              // 关闭当前页面的标签页;
              store.commit("closeCurrentTag", {
                $router: router,
                $route: route,
              });
              router.push("/admin/parking/supplier");
            } else {
              ElMessage.error(res.data.msg);
            }

          });
        } else {
          return false;
        }
      });
    };
    // 重置
    const onReset = () => {
      formRef.value.resetFields();
    };

    return {
      rules,
      formRef,
      form,
      onSubmit,
      onReset,
    };
  },
};
</script>
