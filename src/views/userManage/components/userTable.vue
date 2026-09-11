<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { UserItem } from "../types";
import { ElMessage, ElMessageBox, ElTable } from "element-plus";
import { formatTime } from "@/utils";
import UserManageEditUserForm from "../components/editUserForm.vue";
import usePositions from "../hooks/usePosition";
import useUserList from "../hooks/userUserList";
import { DeleteUser, ResetPassword } from "../api";

export default defineComponent({
  name: "UserManageTable",
  components: {
    UserManageEditUserForm
  },
  setup(props, { emit }) {
    const { getMatchPosition } = usePositions();
    const { userList, paginationState, handleCurrentChange, handleSizeChange } =
      useUserList();

    const userTableRef = ref<InstanceType<typeof ElTable>>();

    const editUserInfo = ref<UserItem | null>(null);
    const showEditUserForm = ref(false);
    const handleEdit = (payload: UserItem) => {
      editUserInfo.value = payload;
      showEditUserForm.value = true;
    };

    const handleAddUser = () => {
      editUserInfo.value = null;
      showEditUserForm.value = true;
    };

    const handleDelete = async (payload: UserItem) => {
      ElMessageBox.confirm("确认删除该用户吗？", "温馨提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        await DeleteUser(payload.id);
        handleCurrentChange(1);
      });
    };

    const handleReset = (payload: UserItem) => {
      ElMessageBox.prompt("请输入新密码", "重置密码", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        inputValue: "",
        inputPlaceholder: "请输入新密码",
        inputType: "password"
      }).then(async ({ value }) => {
        if (!value) {
          ElMessage.warning("密码不能为空");
          return;
        }
        await ResetPassword(payload.id, value);
        ElMessage.success("修改密码成功");
      });
    };

    const getRowClassName = computed(() => ({ row }) => {
      const name = getMatchPosition.value!(row.positionId)?.name;
      return name && name.indexOf("管理") > -1 ? "manager-row" : "";
    });

    return {
      userList,
      paginationState,
      handleCurrentChange,
      handleSizeChange,
      userTableRef,
      formatTime,
      handleAddUser,
      handleEdit,
      handleDelete,
      handleReset,
      getMatchPosition,
      editUserInfo,
      showEditUserForm,
      getRowClassName
    };
  }
});
</script>
<template>
  <div>
    <el-button
      size="mini"
      type="primary"
      icon="el-icon-edit-outline"
      @click="handleAddUser"
    >
      新增用户
    </el-button>
    <el-table
      ref="userTableRef"
      size="small"
      :data="userList"
      highlight-current-row
      border
      height="600"
      :row-class-name="getRowClassName"
    >
      <el-table-column type="index" label="序号" align="center" fixed="left" />
      <el-table-column
        prop="userName"
        label="姓名"
        align="center"
        width="140"
        fixed="left"
      />
      
      <el-table-column prop="userName" label="角色" align="center" width="240">
        <template #default="{ row }">
          <span>{{ getMatchPosition(row.positionId)?.name || "无" }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="logonName"
        label="登录名"
        align="center"
        width="160"
      />
      <el-table-column
        prop="userName"
        label="是否冻结"
        align="center"
        width="100"
      >
        <template #default="{ row }">
          <span>{{ row.isFreeze ? "是" : "否" }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column
        prop="userName"
        label="是否外部用户"
        align="center"
        width="120"
      >
        <template #default="{ row }">
          <span>{{ row.isOutSide ? "是" : "否" }}</span>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="userName"
        label="是否超级管理员"
        align="center"
        width="120"
      >
        <template #default="{ row }">
          <span>{{ row.isSuperMgr ? "是" : "否" }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="userName"
        label="创建时间"
        align="center"
        width="220"
      >
        <template #default="{ row }">
          <span>{{ formatTime(row.createTime, "yyyy-MM-dd HH:mm:ss") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="260">
        <template #default="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit-outline"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="warning"
            icon="el-icon-edit-outline"
            @click="handleReset(scope.row)"
          >
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:currentPage="paginationState.curPage"
      class="table-pagination"
      :page-size="paginationState.maxResultCount"
      layout="total, sizes, prev, pager, next, jumper"
      :total="paginationState.totalCount"
      @size-change="(size) => handleSizeChange(size)"
      @current-change="(page) => handleCurrentChange(page)"
    />
    <teleport to="body">
      <UserManageEditUserForm
        v-model:show="showEditUserForm"
        :user-info="editUserInfo"
        @success="handleCurrentChange(1)"
      ></UserManageEditUserForm>
    </teleport>
  </div>
</template>
<style lang="less">
.manager-row{
  background-color: #dde9ff !important;
}
</style>