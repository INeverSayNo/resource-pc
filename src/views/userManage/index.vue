<script lang="ts" setup>
import UserManageFilter from "./components/filter.vue";
import UserManageTable from "./components/userTable.vue";
import useUserList from "./hooks/userUserList";

const { getUserList } = useUserList({
  immediateQuery: false
});
const queryByFilter = (payload: any) => {
  getUserList(payload, true);
};
</script>
<template>
  <UserManageFilter @query="queryByFilter" />
  <UserManageTable></UserManageTable>
</template>
