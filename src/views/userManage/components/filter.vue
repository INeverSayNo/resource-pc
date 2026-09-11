<script lang="ts">
import { ElForm } from "element-plus";
import { defineComponent, reactive, shallowRef } from "vue";
import usePositions from "../hooks/usePosition";

export default defineComponent({
  name: "UserManageFilter",
  emits: ["query"],
  setup(props, { emit }) {
    const { positionList } = usePositions({ immediateQuery: true });

    const queryFormRef = shallowRef<InstanceType<typeof ElForm>>();
    const queryForm = reactive({
      filter: "", // 关键字
      userName: "", // 用户名
      isFreeze: false, // 是否冻结
      isOutSide: false, // 是否外部用户
      isSuperMgr: false, // 是否超级管理员
      positionId: "" // 用户角色
    });

    const handleQuery = () => {
      const payload = {};
      for (const key in queryForm) {
        if (queryForm[key]) {
          payload[key] = queryForm[key];
        }
      }
      emit("query", payload);
    };
    const handleReset = () => {
      queryForm.filter = "";
      queryForm.userName = "";
      queryForm.isFreeze = false;
      queryForm.isOutSide = false;
      queryForm.isSuperMgr = false;
      emit("query", {});
    };
    return {
      queryForm,
      queryFormRef,
      handleQuery,
      handleReset,
      positionList
    };
  }
});
</script>

<template>
  <el-form
    ref="queryFormRef"
    :model="queryForm"
    v-bind="{
      labelWidth: '140px',
      inline: true,
      labelSuffix: '：',
      size: 'small'
    }"
  >
    <el-row>
      <el-col :span="6">
        <el-form-item label="用户角色" prop="positionId">
          <el-select
            v-model="queryForm.positionId"
            placeholder="请选择"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="(item, index) in positionList"
              :key="index"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <!-- <el-col :span="5">
        <el-form-item label="用户名">
          <el-input
            v-model="queryForm.userName"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
      </el-col> -->

      <el-col :span="3">
        <el-form-item label="是否冻结">
          <el-switch v-model="queryForm.isFreeze" class="ml-2" />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="3">
        <el-form-item label="是否外部用户">
          <el-switch v-model="queryForm.isOutSide" class="ml-2" />
        </el-form-item>
      </el-col> -->
      <el-col :span="4">
        <el-form-item label="是否超级管理员">
          <el-switch v-model="queryForm.isSuperMgr" class="ml-2" />
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="关键字">
          <el-input
            v-model="queryForm.filter"
            placeholder="请输入关键字"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <div class="">
          <el-button size="small" type="primary" @click="handleQuery">
            查询
          </el-button>
          <el-button size="small" type="warning" @click="handleReset">
            重置并查询
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<style lang="less" scoped>
@import "../../tgsSolution/styles/base.less";
</style>
