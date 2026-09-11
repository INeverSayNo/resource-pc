<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  ref,
  shallowRef,
  unref,
  watch
} from "vue";
import useAllFeatureList from "../hooks/useAllFeatureList";
import useApplications from "../../featureManage/hooks/useApplicationList";
import { IFeatureGroupItem, IFeatureItem } from "../../featureManage/types";
import { IFeatureRoleItem } from "../types";
import { updateFeatureRoleFeature } from "../api";
import { ElLoading, ElMessage, ElTable } from "element-plus";

export default defineComponent({
  name: "FeatureTable",
  
  props: {
    featureIds: {
      type: Array as () => string[],
      default: () => []
    },
    featureRole: {
      type: Object as PropType<IFeatureRoleItem>,
      default: () => ({})
    }
  },
  setup(props) {
    const { allFeatureList } = useAllFeatureList();
    const { getMatchApplicationModule, applicationList } = useApplications();

    const featureTableRef = shallowRef<InstanceType<typeof ElTable>>();
    const tableData = computed(() => {
      if (!applicationList.value.length || !allFeatureList.value.length)
        return [];
      return applicationList.value.reduce((prev, next) => {
        const newModList = next.modules?.map((mod) => {
          return {
            ...mod,
            children: allFeatureList.value.filter(
              (f) => f.applicationModuleId === mod.id
            )
          };
        });
        prev = [
          ...prev,
          {
            ...next,
            children: newModList || []
          }
        ];
        return prev;
      }, [] as any[]);
    });

    const setDefaultCheck = async (val: IFeatureGroupItem[]) => {
      if (!val.length) return;
      await nextTick();

      props.featureIds.forEach((id) => {
        for (let i = 0; i < val.length; i++) {
          const app = val[i];
          for (let j = 0; j < (app.children?.length || 0); j++) {
            const mod = app.children?.[j];
            const matchFeature = mod?.children?.find((f) => f.id === id);
            if (matchFeature) {
              featureTableRef.value?.toggleRowSelection(matchFeature, true);
              break;
            }
          }
        }
      });
    };
    watch(tableData, setDefaultCheck);

    const selectedFeatures = ref<IFeatureItem[]>([]);
    const handleSelectionChange = (payload: IFeatureItem[]) => {
      selectedFeatures.value = payload;
    };
    const selectable = (row: IFeatureGroupItem) => {
      return row["children"] === undefined;
    };

    const handleUpdateFeature = async () => {
      const featureIds = selectedFeatures.value.map((f) => f.id);
      const loading = ElLoading.service({
        fullscreen: true,
        lock: true,
        text: "更新中..."
      });
      const [err, data] = await updateFeatureRoleFeature(
        {
          featureIds: featureIds
        },
        props.featureRole.id
      );
      loading.close();
      if (err) {
        return;
      }
      ElMessage.success("更新成功");
    };

    const keywords = ref("");
    const rowHeight = 40.81;
    const handleQuickQuery = async () => {
      if (!keywords.value.trim()) {
        ElMessage.warning("请输入关键字");
        return;
      }
      const scrollEl: HTMLDivElement | null =
        featureTableRef.value?.$el.querySelector(
          ".el-table__body-wrapper.is-scrolling-left"
        );
      if (!scrollEl) return;
      let realRowIndex = 0;
      let found = false;
      let targetFeature = null;

      for (let appIndex = 0; appIndex < tableData.value.length; appIndex++) {
        const app = tableData.value[appIndex];
        realRowIndex++;
        if (app.children) {
          for (let modIndex = 0; modIndex < app.children.length; modIndex++) {
            const mod = app.children[modIndex];
            realRowIndex++;
            if (mod.children) {
              for (
                let featureIndex = 0;
                featureIndex < mod.children.length;
                featureIndex++
              ) {
                const feature = mod.children[featureIndex];
                if (feature.name.includes(keywords.value.trim())) {
                  targetFeature = feature;
                  found = true;
                  break;
                }
                realRowIndex++;
              }
            }
            if (found) break;
          }
        }
        if (found) break;
      }

      if (found && targetFeature) {
        for (let i = 0; i < tableData.value.length; i++) {
          const app = tableData.value[i];
          featureTableRef.value?.toggleRowExpansion(app, true);
          if (app.children) {
            for (let j = 0; j < app.children.length; j++) {
              const mod = app.children[j];
              featureTableRef.value?.toggleRowExpansion(mod, true);
            }
          }
        }
        await nextTick();
        const top = realRowIndex * rowHeight;
        (scrollEl as HTMLElement).scrollTo({
          top,
          behavior: "smooth"
        });
        featureTableRef.value?.setCurrentRow(targetFeature);
      } else {
        ElMessage.warning("未找到匹配的功能");
      }
    };
    return {
      featureTableRef,
      tableData,
      getMatchApplicationModule,
      handleSelectionChange,
      handleUpdateFeature,
      selectable,
      keywords,
      handleQuickQuery
    };
  }
});
</script>
<template>
  <div>
    <div class="feature-container-header">
      <p class="feature-role-name">
        <DAliIcon name="tag"></DAliIcon>
        <span>{{ featureRole.name }}</span>
      </p>
      <div>
        <el-input
          v-model="keywords"
          placeholder="请输入关键字"
          style="width: 240px; margin-right: 0.8rem"
          size="small"
          @keypress.enter="handleQuickQuery"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="handleQuickQuery" />
          </template>
        </el-input>
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-edit-outline"
          @click="handleUpdateFeature"
        >
          更新权限
        </el-button>
      </div>
    </div>
    <el-table
      ref="featureTableRef"
      stripe
      size="small"
      :data="tableData"
      highlight-current-row
      border
      height="600"
      row-key="id"
      class="layout-table"
      default-expand-all
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :selectable="selectable" width="55" />
      <el-table-column type="index" label="序号" align="center" fixed="left" />
      <el-table-column
        prop="name"
        label="功能名称"
        align="left"
        width="260"
        fixed="left"
      />
      <el-table-column prop="code" label="编码" align="center" width="200" />

      <el-table-column prop="sort" label="排序" align="center" width="80" />

      <el-table-column prop="remark" label="备注" align="center" width="180" show-overflow-tooltip/>
    </el-table>
  </div>
</template>
<style lang="less" scoped>
.feature-container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
}
.feature-role-name {
  display: flex;
  align-items: center;
  font-size: 14px;
}
</style>
