<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'
  import { usePermissionStore } from '@/store/modules/permission'
  import { getApiErrorMessage } from '@/request'

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const router = useRouter()
  const switchingAccountId = ref('')
  const currentUserId = computed(() => userStore.currentUserId)

  const prefixCls = 'v-user-info'

  const loginOut = async () => {
    try {
      await ElMessageBox.confirm('是否退出本系统？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
    } catch {
      return
    }
  }

  const changeAccount = async (accountId: string) => {
    if (!accountId || accountId === currentUserId.value || switchingAccountId.value) return
    switchingAccountId.value = accountId
    const [error] = await userStore.switchAccount(accountId)
    switchingAccountId.value = ''
    if (error) {
      ElMessage.error(getApiErrorMessage(error, '账号切换失败'))
      return
    }
    await router.replace(permissionStore.homePath)
  }

  const toDocument = () => {
    window.open('https://docs.element-plus-admin.cn/')
  }

  onMounted(() => {
    void userStore.loadAccounts()
  })
</script>

<template>
  <ElDropdown class="header-action" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <img
        src="@/assets/imgs/avatar.jpg"
        alt=""
        class="w-[calc(var(--logo-height)-25px)] rounded-[50%]"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">{{
        userStore.userInfo?.erp_username
      }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="account in userStore.accounts"
          :key="account.id"
          :disabled="account.id === currentUserId || Boolean(switchingAccountId)"
        >
          <div @click="changeAccount(account.id)">
            {{ userStore.userInfo?.given_name || userStore.userInfo?.erp_username }}（{{
              [account.areaName, account.organizationName].filter(Boolean).join('-')
            }}）
          </div>
        </ElDropdownItem>
        <ElDropdownItem>
          <div @click="toDocument">项目文档</div>
        </ElDropdownItem>
        <ElDropdownItem divided>
          <div @click="loginOut">退出系统</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
