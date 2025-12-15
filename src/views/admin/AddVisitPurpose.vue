<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-calendar"></i> 来访目的管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>来访目的编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="form-box">
        <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
          <el-form-item label="来访目的" prop="reason">
            <el-input v-model="form.reason"></el-input>
          </el-form-item>
          <el-form-item label="序号" prop="sortno" :rules="[
            { required: true, message: '联系电话 is required' },]">
            <el-input v-model="form.sortno" maxlength="11" type="number"></el-input>
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
  name: "AddVisitPurpose",
  setup() {
    const root = "/parking/visitreason/";
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const rules = {
      reason: [
        { required: true, message: "请输入来访目的", trigger: "blur" },
      ],
    };
    const formRef = ref(null);
    var form = reactive({
      id: "",
      reason: "",
      sortno: "",
    });
    if (route.query.id) {
      request.get(root + route.query.id).then((res) => {
        form.id = res.data.id
        form.reason = res.data.reason
        form.sortno = res.data.sortno
      });
    }
    // 提交
    const onSubmit = () => {
      // 表单校验
      formRef.value.validate((valid) => {
        if (valid) {
          var method = form.id === "" ? "POST" : "PUT";
          request({
            url: "/parking/visitreason",
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
              router.push("/admin/parking/visitPurpose");
            } else {
              ElMessage.error(res.msg);
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