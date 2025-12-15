<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-calendar"></i> 部门管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>部门编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="form-box">
        <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
          <el-form-item label="部门名称" prop="departmentName">
            <el-input v-model="form.departmentName"></el-input>
          </el-form-item>
          <el-form-item label="地址" prop="departmentAddress">
            <el-input v-model="form.departmentAddress"></el-input>
          </el-form-item>
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="form.leader"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="leaderPhone" :rules="[
            { required: true, message: '联系电话 is required' },
          ]">
            <el-input v-model="form.leaderPhone" maxlength="11" type="number"></el-input>
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
  name: "AddDepartment",
  setup() {
    const root = "/parking/department/";
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const rules = {
      departmentName: [
        { required: true, message: "请输入部门名称", trigger: "blur" },
      ],
    };
    const formRef = ref(null);
    var form = reactive({
      departmentId: "",
      departmentName: "",
      departmentAddress: "",
      leader: "",
      leaderPhone: "",
    });
    if (route.query.id) {
      request.get(root + route.query.id).then((res) => {
        form.departmentId = res.data.departmentId
        form.departmentName = res.data.departmentName
        form.departmentAddress = res.data.departmentAddress
        form.leader = res.data.leader
        form.leaderPhone = res.data.leaderPhone
      });
    }
    // 提交
    const onSubmit = () => {
      // 表单校验
      formRef.value.validate((valid) => {
        if (valid) {
          var method = form.departmentId === "" ? "POST" : "PUT";
          request({
            url: "/parking/department",
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
              router.push("/admin/parking/department");
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