<script lang="ts">
import { computed, defineComponent, shallowRef } from "vue";
import FeatureRolesTable from "./components/featureRolesTable.vue";
import FeatureTable from "./components/featureTable.vue";

export default defineComponent({
  name: "AuthManage",
  components: {
    FeatureRolesTable,
    FeatureTable
  },
  setup() {
    const featureRolesTableRef =
      shallowRef<InstanceType<typeof FeatureRolesTable>>();

    const curFeatureRole = computed(() => {
      if (!featureRolesTableRef.value) return null;
      return featureRolesTableRef.value.curFeatureRole;
    });
    const curFeatureIdList = computed(() => {
      if (!featureRolesTableRef.value) return [];
      return featureRolesTableRef.value.curFeatureIdList;
    });
    return {
      featureRolesTableRef,
      curFeatureRole,
      curFeatureIdList
    };
  }
});
</script>
<template>
  <div class="auth-manage-container">
    <div class="feature-roles-table">
      <FeatureRolesTable ref="featureRolesTableRef"></FeatureRolesTable>
    </div>
    <div class="feature-table">
      <div v-if="!curFeatureRole" class="no-data-wrap">
        <DAliIcon name="no-data"  width="120" height="120"/>
        <span class="no-data-wrap-tips">暂无权限列表，请先在左侧选择角色</span>
      </div>
      <FeatureTable
        v-else
        :feature-ids="curFeatureIdList"
        :feature-role="curFeatureRole"
      ></FeatureTable>
    </div>
  </div>
</template>
<style lang="less" scoped>
.feature-roles-table {
  width: 50%;
}

.feature-table {
  width: 46%;
}
.auth-manage-container {
  display: flex;
  justify-content: space-between;
}
.no-data-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 7rem;
  &-tips {
    font-size: 14px;
    color: #909293;
    user-select: none;
  }
}
</style>
