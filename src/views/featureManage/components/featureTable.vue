<script lang="ts">
import { defineComponent, ref, shallowRef } from "vue";
import useFeatureList from "../hooks/useFeatureList";
import { ElMessageBox, ElTable } from "element-plus";
import { DeleteFeature } from "../api";
import useApplications from "../hooks/useApplicationList";
import EditFeatureForm from "./editFeatureForm.vue";
import { IFeatureItem } from "../types";

export default defineComponent({
  name: "FeatureTable",
  components: {
    EditFeatureForm
  },
  props: {},
  setup() {
    const { getMatchApplicationModule } = useApplications();

    const {
      featureList,
      paginationState,
      handleCurrentChange,
      handleSizeChange
    } = useFeatureList();

    const featureTableRef = shallowRef<InstanceType<typeof ElTable>>();

    const editFeatureInfo = ref<IFeatureItem | null>(null);
    const showEditFeatureForm = ref(false);
    const handleIconUrl = (icon: string) => {
      return icon ? `${icon}` : "";
    };
    const handleAddFeature = () => {
      editFeatureInfo.value = null;
      showEditFeatureForm.value = true;
    };
    const handleEdit = (payload: any) => {
      editFeatureInfo.value = payload;
      showEditFeatureForm.value = true;
    };
    const handleDelete = (payload: IFeatureItem) => {
      ElMessageBox.confirm("确认删除该功能吗？", "温馨提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        await DeleteFeature(payload.id);
        handleCurrentChange(1);
      });
    };
    return {
      getMatchApplicationModule,
      featureList,
      paginationState,
      handleCurrentChange,
      handleSizeChange,
      featureTableRef,
      handleAddFeature,
      handleEdit,
      handleDelete,
      showEditFeatureForm,
      editFeatureInfo,
      handleIconUrl
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
      @click="handleAddFeature"
    >
      新增功能
    </el-button>
    <el-table
      ref="featureTableRef"
      size="small"
      :data="featureList"
      highlight-current-row
      border
      height="600"
    >
      <el-table-column type="index" label="序号" align="center" fixed="left" />
      <el-table-column
        prop="applicationModuleId"
        label="所属模块"
        align="center"
        width="260"
        fixed="left"
      >
        <template #default="{ row }">
          <span>
            {{ getMatchApplicationModule(row.applicationModuleId, true) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="功能名称"
        align="center"
        width="200"
        fixed="left"
      />
      <el-table-column prop="code" label="编码" align="center" width="200" />

      <el-table-column
        prop="actionName"
        label="方法名称"
        align="center"
        width="200"
      />

      <el-table-column prop="url" label="url" align="center" width="180" />
      <el-table-column
        prop="parameters"
        label="参数"
        align="center"
        width="180"
      />
      <el-table-column prop="icon" label="图标" align="center" width="120">
        <template #default="{ row }">
          <div
            style="display: flex; align-items: center; justify-content: center"
          >
            <el-image
              v-if="row.icon"
              style="width: 80px"
              :src="handleIconUrl(row.icon)"
              :fit="fit"
            ></el-image>
            <span v-else>暂无</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="controllerName"
        label="控制器"
        align="center"
        width="260"
      />
      <el-table-column prop="sort" label="排序" align="center" width="80" />
      <el-table-column prop="remark" label="备注" align="center" width="120" />
      <el-table-column
        prop="isMenu"
        label="是否菜单"
        align="center"
        width="100"
      >
        <template #default="scoped">
          {{ scoped.row.isMenu ? "是" : "否" }}
        </template>
      </el-table-column>

      <el-table-column
        prop="isShortCut"
        label="是否快捷菜单"
        align="center"
        width="100"
      >
        <template #default="scoped">
          {{ scoped.row.isShortCut ? "是" : "否" }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template #default="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit-outline"
            @click="handleEdit(scope.row)"
          >
            更新
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-edit-outline"
            @click="handleDelete(scope.row)"
          >
            删除
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
      <EditFeatureForm
        v-model:show="showEditFeatureForm"
        :feature-info="editFeatureInfo"
        @success="handleCurrentChange(1)"
      ></EditFeatureForm>
    </teleport>
  </div>
</template>
