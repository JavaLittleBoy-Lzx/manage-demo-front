<template>
  <div class="permission-management">
    <!-- 现代化页面头部 -->
    <div class="page-header">
      <div class="crumbs">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>
            <i class="header-icon">🔐</i>
            <span>权限管理</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="header-actions">
        <el-button type="primary" @click="saveEdit" :disabled="!roleId">
          保存权限配置
        </el-button>
      </div>
    </div>

    <!-- 角色选择面板 -->
    <div class="role-select-card">
      <div class="card-header">
        <div class="header-title">
          <i class="role-icon">👤</i>
          <span>选择角色</span>
        </div>
        <div class="role-info" v-if="selectedRole">
          当前配置角色：<span class="role-name">{{ selectedRole.name }}</span>
        </div>
      </div>
      
      <div class="role-select-content">
        <el-form>
          <el-form-item label="角色名称">
            <el-select 
              v-model="roleId" 
              @change="handleSearch" 
              placeholder="请选择要配置权限的角色"
              class="role-select"
              size="large"
            >
              <el-option 
                v-for="r in roleList.list" 
                :key="r.id" 
                :label="r.name" 
                :value="r.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 权限配置面板 -->
    <div class="permission-card" v-if="roleId">
      <div class="card-header">
        <div class="header-title">
          <i class="permission-icon">⚙️</i>
          <span>权限配置</span>
        </div>
        <div class="permission-stats">
          已配置 {{ getSelectedCount }} 项权限
        </div>
      </div>
      
      <div class="permission-content">
        <div class="permission-list">
          <div 
            class="permission-group" 
            v-for="(p, index) in rolePerm.perms" 
            :key="index"
          >
            <div class="group-header">
              <el-checkbox 
                v-model="p.checkAll" 
                :indeterminate="p.isIndeterminate"
                @change="handleCheckAllChange($event, index)"
                class="group-checkbox"
              >
                <div class="group-info">
                  <div class="group-icon">📁</div>
                  <div class="group-title">{{ p.title }}</div>
                </div>
              </el-checkbox>
            </div>
            
            <div class="group-content">
              <el-checkbox-group 
                v-model="p.checkedList" 
                @change="handleCheckedChange($event, index)"
                class="permission-checkbox-group"
              >
                <div class="permission-items">
                  <el-checkbox 
                    v-for="sub in p.subs" 
                    :key="sub.id" 
                    :label="sub.id"
                    class="permission-item"
                  >
                    <div class="permission-info">
                      <div class="permission-icon">📄</div>
                      <div class="permission-name">{{ sub.title }}</div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">🔒</div>
      <div class="empty-title">请选择角色</div>
      <div class="empty-description">选择一个角色来配置其权限设置</div>
    </div>

    <!-- 新增角色对话框 -->
    <el-dialog 
      title="新增角色" 
      v-model="addVisible" 
      width="500px" 
      @close="getData"
      class="modern-dialog"
    >
      <el-form :model="form.data" label-width="80px" class="role-form">
        <el-form-item label="角色名称" prop="name">
          <el-input 
            v-model="form.data.name" 
            placeholder="请输入角色名称"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addVisible = false">取消</el-button>
          <el-button type="primary" @click="addRole">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from "vue";
import request from "../../utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { activityApi } from "../../api/activity";

export default {
  name: "Permission",
  setup() {
    const roleList = reactive({
      list: [],
    });

    const rolePerm = reactive({
      perms: [
        {
          checkAll: false,
          isIndeterminate: false,
          checkedList: [],
          id: "",
          title: "",
          subs: [
            {
              title: "",
              id: "",
            },
          ],
        },
      ],
    });

    const roleId = ref("");
    const addVisible = ref(false);
    
    const form = reactive({
      data: {
        name: "",
      },
    });

    // 计算选中的角色信息
    const selectedRole = computed(() => {
      return roleList.list.find(role => role.id === roleId.value);
    });

    // 计算已选择的权限数量
    const getSelectedCount = () => {
      return rolePerm.perms.reduce((count, perm) => {
        return count + perm.checkedList.length;
      }, 0);
    };

    // 查询角色列表
    const getData = () => {
      return request.get("/parking/role/listAll").then((res) => {
        roleList.list = res.data;
      });
    };

    // 查询角色权限
    const handleSearch = async (val) => {
      try {
        if (!val) {
          rolePerm.perms = [];
          return;
        }
        
        // 记录查询操作日志
        const userId = localStorage.getItem("ms_userid") || "unknown";
        const username = localStorage.getItem("ms_username") || "管理员";
        
        // 获取角色名称
        const selectedRoleName = roleList.list.find(role => role.id === val)?.name || `角色ID: ${val}`;
        
        await activityApi.logPermissionOperation(
            userId,
            username,
            "查询",
            `查询角色权限 (角色: ${selectedRoleName})`,
            val,
            JSON.stringify({ roleId: val }),
            null
        ).catch(err => {
            console.error("记录查询日志失败:", err);
        });
        
        request.get("/parking/role/perm/" + val).then((res) => {
          rolePerm.perms = res.data;
        });
      } catch (error) {
        console.error("查询操作失败:", error);
        // 即使日志记录失败，也要继续执行查询
        request.get("/parking/role/perm/" + val).then((res) => {
          rolePerm.perms = res.data;
        });
      }
    };

    // 保存权限配置
    const saveEdit = () => {
      if (!roleId.value) {
        ElMessage.warning("请先选择角色");
        return;
      }

      request
        .post(
          "/parking/role/perm/" + roleId.value,
          "permission=" + JSON.stringify(rolePerm.perms)
        )
        .then((res) => {
          if (res.code === "0") {
            ElMessage.success("权限配置保存成功！");
          } else {
            ElMessage.error("权限配置保存失败！");
          }
        });
    };

    // 全选/取消全选
    const handleCheckAllChange = (val, index) => {
      rolePerm.perms[index].checkedList = val
        ? rolePerm.perms[index].subs.map((sub) => sub.id)
        : [];
      rolePerm.perms[index].isIndeterminate = false;
    };

    // 权限项变更
    const handleCheckedChange = (value, index) => {
      const checkedCount = value.length;
      rolePerm.perms[index].checkAll =
        checkedCount === rolePerm.perms[index].subs.length;
      rolePerm.perms[index].isIndeterminate =
        checkedCount > 0 && checkedCount < rolePerm.perms[index].subs.length;
    };

    // 新增角色
    const handleAdd = () => {
      addVisible.value = true;
    };

    // 保存新增角色
    const addRole = () => {
      if (!form.data.name || form.data.name.trim() === '') {
        ElMessage.error("请输入角色名称");
        return;
      }

      request({
        url: "/parking/role",
        method: "POST",
        data: form.data,
      }).then((res) => {
        ElMessage.success("角色创建成功！");
        form.data.name = "";
        addVisible.value = false;
        getData(); // 刷新角色列表
      });
    };

    onMounted(() => {
      getData().then(() => {
        if (roleList.list.length > 0) {
          roleId.value = roleList.list[0].id;
          handleSearch(roleId.value);
        }
      });
    });

    return {
      roleList,
      rolePerm,
      roleId,
      form,
      addVisible,
      selectedRole,
      getData,
      addRole,
      handleSearch,
      saveEdit,
      handleCheckAllChange,
      handleCheckedChange,
      handleAdd,
      getSelectedCount,
    };
  },
};
</script>

<style lang="scss" scoped>
.permission-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 4px;

    .crumbs {
      .el-breadcrumb-item {
        .header-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        span {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .role-select-card, .permission-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;

      .header-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #303133;

        .role-icon, .permission-icon {
          margin-right: 8px;
          font-size: 18px;
        }
      }

      .role-info {
        color: #606266;
        font-size: 14px;

        .role-name {
          color: #409eff;
          font-weight: 600;
        }
      }

      .permission-stats {
        color: #909399;
        font-size: 14px;
      }
    }

    .role-select-content {
      padding: 24px;

      .role-select {
        width: 300px;
      }
    }

    .permission-content {
      padding: 24px;

      .permission-list {
        .permission-group {
          margin-bottom: 24px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;

          .group-header {
            background: #f8f9fa;
            padding: 16px 20px;
            border-bottom: 1px solid #e4e7ed;

            .group-checkbox {
              width: 100%;

              .group-info {
                display: flex;
                align-items: center;
                gap: 8px;

                .group-icon {
                  font-size: 16px;
                }

                .group-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #303133;
                }
              }
            }
          }

          .group-content {
            padding: 20px;

            .permission-checkbox-group {
              width: 100%;

              .permission-items {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 12px;

                .permission-item {
                  padding: 12px;
                  border: 1px solid #e4e7ed;
                  border-radius: 6px;
                  transition: all 0.3s ease;

                  &:hover {
                    border-color: #409eff;
                    background: #f0f9ff;
                  }

                  .permission-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .permission-icon {
                      font-size: 14px;
                      color: #909399;
                    }

                    .permission-name {
                      font-size: 14px;
                      color: #606266;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .empty-description {
      font-size: 14px;
      color: #909399;
    }
  }

  .modern-dialog {
    .role-form {
      padding: 10px 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}

// Element Plus 组件样式调整
:deep(.el-checkbox) {
  width: 100%;
  
  .el-checkbox__label {
    width: 100%;
    padding-left: 8px;
  }
}

:deep(.el-checkbox-group) {
  width: 100%;
}

:deep(.el-select) {
  .el-input__inner {
    border-radius: 6px;
  }
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}
</style>
