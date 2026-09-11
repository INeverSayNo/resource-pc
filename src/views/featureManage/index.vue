<script lang="ts" setup>
import FeatureFilter from "./components/filter.vue";
import FeatureTable from "./components/featureTable.vue";
import useFeatureList from "./hooks/useFeatureList";

const { getFeatureList } = useFeatureList({
  immediateQuery: false
});
const queryByFilter = (payload: any) => {
  getFeatureList(payload, true);
};
</script>
<template>
  <div>
    <FeatureFilter @query="queryByFilter"></FeatureFilter>
    <FeatureTable></FeatureTable>
  </div>
</template>
