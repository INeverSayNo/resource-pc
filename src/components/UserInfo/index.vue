<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'
  import { usePermissionStore } from '@/store/modules/permission'
  import { storeToRefs } from 'pinia'

  const userStore = useUserStore()

  const { userInfo, accounts } = storeToRefs(userStore)

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
    try {
      await userStore.switchAccount(accountId)
      await router.replace(permissionStore.homePath)
    } catch (error) {
      const message =
        typeof error === 'object' && error ? String(Reflect.get(error, 'message') || '') : ''
      ElMessage.error(message || '账号切换失败')
    } finally {
      switchingAccountId.value = ''
    }
  }
  onMounted(userStore.loadAccounts)
</script>

<template>
  <ElDropdown class="header-action" :class="prefixCls">
    <div class="flex items-center">
      <img
        src="https://gateway.dczhiyun.com/api/abp/minio/wechat/icon/dczy-default-header.png"
        alt=""
        class="w-[calc(var(--logo-height)-25px)] rounded-[50%]"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">{{
        `${userInfo?.given_name}(${userInfo?.erp_area_name || ''}${userInfo?.erp_area_name ? '-' : ''}${userInfo?.erp_org_name})` ||
        ''
      }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="account in accounts"
          :key="account.id"
          :disabled="account.id === currentUserId || Boolean(switchingAccountId)"
        >
          <div @click="changeAccount(account.id)">
            {{ userInfo?.given_name || userInfo?.erp_username }}（{{
              [account.areaName, account.organizationName].filter(Boolean).join('-')
            }}）
          </div>
        </ElDropdownItem>

        <ElDropdownItem divided>
          <div @click="loginOut">退出系统</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
