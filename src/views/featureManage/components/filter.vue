<script lang="ts">
import { ElForm } from "element-plus";
import { defineComponent, reactive, shallowRef } from "vue";
import useApplications from "../hooks/useApplicationList";

export default defineComponent({
  name: "FeatureManageFilter",
  emits: ["query"],
  setup(props, { emit }) {
    const { applicationList } = useApplications();

    const queryFormRef = shallowRef<InstanceType<typeof ElForm>>();
    const queryForm = reactive({
      filter: "", // 关键字
      name: "", // 功能名称
      isMenu: false, // 是否菜单
      isShortCut: false, // 是否快捷菜单
      applicationModuleId: "" // 所属模块
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
      queryForm.name = "";
      queryForm.isMenu = false;
      queryForm.isShortCut = false;
      queryForm.applicationModuleId = "";
      emit("query", {});
    };
    return {
      queryForm,
      queryFormRef,
      handleQuery,
      handleReset,
      applicationList
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
        <el-form-item label="所属模块">
          <el-select v-model="queryForm.applicationModuleId" placeholder="请选择所属模块" clearable>
            <el-option-group
              v-for="group in applicationList"
              :key="group.id"
              :label="group.name"
            >
              <el-option
                v-for="item in group.modules"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="4">
        <el-form-item label="是否菜单">
          <el-switch v-model="queryForm.isMenu" class="ml-0.5rem" />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="是否快捷菜单">
          <el-switch v-model="queryForm.isShortCut" class="ml-0.5rem" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
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
</style>
