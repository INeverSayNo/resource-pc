<script lang="ts">
import { computed, defineComponent, ref, shallowRef, nextTick } from "vue";
import { ElTable } from "element-plus";
import useFeatureRoleList from "../hooks/useFeatureRoleList";
import { IFeatureRoleItem } from "../types";

export default defineComponent({
  name: "FeatureRolesTable",
  components: {},
  props: {},
  setup(props, { expose }) {
    const {
      featureRoleList,
      paginationState,
      handleCurrentChange,
      handleSizeChange
    } = useFeatureRoleList();

    const curFeatureRole = ref<IFeatureRoleItem | null>(null);
    const curFeatureIdList = computed(() => {
      return curFeatureRole.value?.featureIds || [];
    });

    const updateCurFeatureRole = async (row: IFeatureRoleItem) => {
      curFeatureRole.value = null;
      await nextTick();
      curFeatureRole.value = row;
    };

    const featureRolesTableRef = shallowRef<InstanceType<typeof ElTable>>();

    expose({
      curFeatureRole,
      curFeatureIdList
    });
    return {
      curFeatureRole,
      updateCurFeatureRole,
      curFeatureIdList,
      featureRoleList,
      paginationState,
      handleCurrentChange,
      handleSizeChange,
      featureRolesTableRef
    };
  }
});
</script>
<template>
  <div>
    <el-table
      ref="featureRolesTableRef"
      size="small"
      :data="featureRoleList"
      highlight-current-row
      border
      height="600"
      @cell-click="updateCurFeatureRole"
    >
      <el-table-column type="index" label="序号" align="center" fixed="left" />
      <el-table-column
        prop="name"
        label="角色名称"
        align="center"
        width="180"
        fixed="left"
      />
      <el-table-column prop="code" label="编码" align="center" width="160" />

      <el-table-column prop="sort" label="排序" align="center" width="100" />

      <el-table-column prop="remark" label="备注" align="center" width="180" />
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
  </div>
</template>
