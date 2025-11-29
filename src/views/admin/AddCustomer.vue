<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-calendar"></i> 客户管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>客户编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="form-box">
        <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="form.customerName"></el-input>
          </el-form-item>
          <el-form-item label="客户编码" prop="customerCode">
            <el-input v-model="form.customerCode"></el-input>
          </el-form-item>
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="form.leader"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="telephone" :rules="[
            { required: true, message: '联系电话 is required' },
          ]">
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
  name: "AddCustomer",
  setup() {
    const root = "/parking/customer/";
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const rules = {
      customerName: [
        { required: true, message: "请输入客户名称", trigger: "blur" },
      ],
    };
    const formRef = ref(null);
    var form = reactive({
      customerId: "",
      customerName: "",
      customerCode: "",
      leader: "",
      telephone: "",
      registionDate: "",
      remarks: "",
    });
    if (route.query.id) {
      request.get(root + route.query.id).then((res) => {
        form.customerId = res.data.customerId
        form.customerName = res.data.customerName
        form.customerCode = res.data.customerCode
        form.leader = res.data.leader
        form.telephone = res.data.telephone
        form.registionDate = res.data.registionDate
        form.remarks = res.data.remarks
      });
    }
    // 提交
    const onSubmit = () => {
      // 表单校验
      formRef.value.validate((valid) => {
        if (valid) {
          var method = form.customerId === "" ? "POST" : "PUT";
          request({
            url: "/parking/customer",
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
              router.push("/admin/parking/customer");
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