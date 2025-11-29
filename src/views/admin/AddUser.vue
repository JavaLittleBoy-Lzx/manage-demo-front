<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-calendar"></i> 用户管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>用户编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="form-box">
        <el-form ref="formRef" :rules="rules" :model="form.data" label-width="80px">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="form.data.userName"></el-input>
          </el-form-item>
          <el-form-item label="账号" prop="loginName">
            <el-input v-model="form.data.loginName"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.data.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="联系方式" prop="telephone">
            <el-input v-model="form.data.telephone" type="telephone"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleId">
            <el-select v-model="form.data.roleId" placeholder="请选择角色">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管理车场" prop="managedParks">
            <el-select 
              v-model="form.data.managedParks" 
              placeholder="请选择管理的车场（可多选，不选则可查看所有）" 
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
              :loading="parkListLoading"
              loading-text="正在加载车场列表..."
              no-data-text="暂无车场数据"
            >
              <el-option v-for="item in parkList" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <div v-if="parkListLoading" style="color: #409eff; font-size: 12px; margin-top: 5px;">
              <i class="el-icon-loading"></i> 正在加载车场列表，请稍候...
            </div>
            <div v-else-if="parkList.length > 0" style="color: #67c23a; font-size: 12px; margin-top: 5px;">
              ✓ 已加载 {{ parkList.length }} 个车场
            </div>
            <div v-else style="color: #e6a23c; font-size: 12px; margin-top: 5px;">
              ⚠ 未获取到车场数据，请刷新页面重试
            </div>
            <div style="color: #909399; font-size: 12px; margin-top: 5px;">
              提示：不选择车场则用户可以查看所有车场数据，选择后用户只能查看所选车场的数据
            </div>
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
  name: "AddUser",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const rules = {
      userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    };
    const formRef = ref(null);
    var form = reactive({
      data: {
        userId: "",
        userName: "",
        loginName: "",
        password: "",
        telephone: "",
        departmentId: "",
        roleId: "",
        managedParks: [], // 管理的车场列表
      },
    });
    if (route.query.userId) {
      request.get("/parking/user/" + route.query.userId).then((res) => {
        const userData = res.data;
        
        // 处理managedParks字段
        if (userData.managedParks) {
          // 如果是字符串，转换为数组
          if (typeof userData.managedParks === 'string') {
            userData.managedParks = userData.managedParks.split(',').map(p => p.trim()).filter(p => p);
          }
          // 如果不是数组，设置为空数组
          else if (!Array.isArray(userData.managedParks)) {
            userData.managedParks = [];
          }
        } else {
          userData.managedParks = [];
        }
        
        form.data = userData;
      });
    }
    const roleList = ref([]);

    request.get("/parking/role/listAll").then((res) => {
      roleList.value = res.data;
    });
    const departmentList = ref([]);
    request.get("/parking/department/listDepartment").then((res) => {
      departmentList.value = res.data;
    });
    
    // 获取车场列表
    const parkList = ref([]);
    const parkListLoading = ref(false);
    
    // 加载车场列表的函数
    const loadParkList = () => {
      parkListLoading.value = true;
      request.get("/parking/venue/listAll").then((res) => {
        console.log("🔍 车场列表API原始响应:", res);
        
        // 处理后端返回的Result<List<String>>结构
        let parkData = null;
        
        // 根据实际的响应结构获取数据
        if (res.data && res.data.data) {
          // 标准Result结构: { code: "0", msg: "成功", data: [...] }
          parkData = res.data.data;
        } else if (res.data && Array.isArray(res.data)) {
          // 直接返回数组
          parkData = res.data;
        } else if (Array.isArray(res)) {
          // axios已经解析过，直接是数组
          parkData = res;
        }
        
        if (parkData && Array.isArray(parkData)) {
          parkList.value = parkData;
          console.log("✅ 成功获取车场列表，共", parkList.value.length, "个车场:", parkList.value);
          ElMessage.success(`成功加载 ${parkList.value.length} 个车场`);
        } else {
          console.warn("⚠️ 车场数据格式不正确:", parkData);
          parkList.value = [];
          ElMessage.warning("车场数据格式不正确");
        }
      }).catch((error) => {
        console.error("❌ 获取车场列表失败:", error);
        ElMessage.error({
          message: "获取车场列表失败，请稍后重试",
          duration: 3000
        });
        parkList.value = [];
      }).finally(() => {
        parkListLoading.value = false;
      });
    };
    
    // 页面加载时获取车场列表
    loadParkList();
    // 提交
    const onSubmit = () => {
      // 表单校验
      formRef.value.validate((valid) => {
        if (valid) {
          var method = form.data.userId ? "PUT" : "POST";
          request({
            url: "/parking/user",
            method: method,
            data: form.data,
          }).then((res) => {
            console.log(res);
            if (res.code === "0") {
              ElMessage.success("提交成功！");
              // 关闭当前页面的标签页;
              store.commit("closeCurrentTag", {
                $router: router,
                $route: route,
              });
              router.push("/admin/user");
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
      departmentList,
      roleList,
      parkList,
      parkListLoading,
      formRef,
      form,
      onSubmit,
      onReset,
    };
  },
};
</script>