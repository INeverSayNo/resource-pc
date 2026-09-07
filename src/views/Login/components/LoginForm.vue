<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElButton, ElCheckbox, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { required, useForm } from '@/hooks/useForm'
  import { useUserStore } from '@/store/modules/user'
  import { usePermissionStore } from '@/store/modules/permission'
  import { readLoginPreferences, saveLoginPreferences } from '@/utils/loginPreferences'
  import { resolveInternalRedirect } from '@/utils/redirect'

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const { currentRoute, replace } = useRouter()
  const preferences = readLoginPreferences()

  const { state, actions } = useForm<Record<'username' | 'password', string>>({
    initialValues: { username: preferences.rememberedUsername, password: '' },
    rules: {
      username: required(),
      password: required()
    }
  })
  const values = computed(() => state.values.value)
  const errors = computed(() => state.errors.value)
  const submitting = computed(() => state.submitting.value)
  const remember = ref(preferences.rememberMe)
  const redirect = computed(() => {
    const value = currentRoute.value.query.redirect
    return typeof value === 'string' ? value : ''
  })

  const login = async (formData: Record<'username' | 'password', string>) => {
    const [error] = await userStore.loginByPassword(formData)
    if (error) {
      let msg = "";
      if(typeof error === 'object' && error && Reflect.has(error,'error_description')) {
        msg = (error as any)?.error_description
      }
      ElMessage.error(
        msg || '登录失败，请检查账号密码是否有误'
      )
      return
    }
    saveLoginPreferences(formData.username, remember.value)
    await replace(resolveInternalRedirect(redirect.value, permissionStore.homePath))
  }

  const signIn = () => actions.submit(login)
</script>

<template>
  <ElForm
    :model="values"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="login-form"
    @submit.prevent="signIn()"
  >
    <div class="form-intro">
      <span class="form-kicker">欢迎使用道臣智运</span>
      <h2>登录</h2>
      <p>开箱即用的中后台管理系统</p>
    </div>

    <ElFormItem class="login-field" label="用户名" :error="errors.username?.[0]">
      <ElInput
        v-model="values.username"
        placeholder="请输入用户名"
        autocomplete="username"
        :disabled="submitting"
        @input="actions.clearErrors('username')"
        @blur="actions.validateField('username')"
      />
    </ElFormItem>

    <ElFormItem class="login-field" label="密码" :error="errors.password?.[0]">
      <ElInput
        v-model="values.password"
        type="password"
        show-password
        placeholder="请输入密码"
        autocomplete="current-password"
        :disabled="submitting"
        @input="actions.clearErrors('password')"
        @blur="actions.validateField('password')"
      />
    </ElFormItem>

    <div class="login-options">
      <ElCheckbox v-model="remember" label="记住我" size="small" />
      <span class="secure-note"><i></i>SSL</span>
    </div>

    <ElButton native-type="submit" :loading="submitting" type="primary" class="login-submit">
      登录
    </ElButton>
  </ElForm>
</template>

<style lang="less" scoped>
  .login-form {
    width: 100%;
    color: var(--login-ink);
  }

  .form-intro {
    margin-bottom: 30px;

    h2 {
      margin: 7px 0 8px;
      font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: clamp(30px, 3vw, 38px);
      font-weight: 720;
      line-height: 1.15;
      letter-spacing: -0.035em;
      color: var(--login-ink);
    }

    p {
      display: none;
      margin: 0;
      font-size: 14px;
      line-height: 1.65;
      color: var(--login-muted);
    }
  }

  .form-kicker {
    font-family: SFMono-Regular, Consolas, monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--login-blue);
    text-transform: uppercase;
  }

  .login-field {
    margin-bottom: 21px;

    :deep(.el-form-item__label) {
      height: auto;
      padding: 0;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 650;
      line-height: 1.3;
      color: var(--login-ink);
    }

    :deep(.el-input__wrapper) {
      min-height: 52px;
      padding: 0 15px;
      background: color-mix(in srgb, var(--login-panel) 72%, var(--login-card));
      border-radius: 14px;
      box-shadow: inset 0 0 0 1px var(--login-line);
      transition:
        box-shadow 180ms ease,
        transform 180ms ease,
        background-color 180ms ease;
    }

    :deep(.el-input__wrapper:hover) {
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--login-blue) 42%, var(--login-line));
    }

    :deep(.el-input__wrapper.is-focus) {
      background: var(--login-card);
      transform: translateY(-1px);
      box-shadow:
        inset 0 0 0 1.5px var(--login-blue),
        0 7px 20px rgb(52 126 223 / 10%);
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      color: var(--login-ink);
    }

    :deep(.el-input__inner::placeholder) {
      color: color-mix(in srgb, var(--login-muted) 70%, transparent);
    }

    :deep(.el-form-item__error) {
      padding-top: 5px;
      font-size: 11px;
    }
  }

  .login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 24px;
    margin-top: -2px;

    :deep(.el-checkbox__label) {
      font-size: 12px;
      color: var(--login-muted);
    }
  }

  .secure-note {
    display: flex;
    font-family: SFMono-Regular, Consolas, monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: var(--login-muted);
    gap: 6px;
    align-items: center;

    i {
      width: 6px;
      height: 6px;
      background: #2ecb8f;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgb(46 203 143 / 11%);
    }
  }

  .login-submit {
    width: 100%;
    min-height: 50px;
    margin-top: 24px;
    font-size: 14px;
    font-weight: 650;
    letter-spacing: 0.04em;
    border: 0;
    border-radius: 14px;
    box-shadow: 0 13px 28px color-mix(in srgb, var(--el-color-primary) 25%, transparent);
    transition:
      transform 180ms ease,
      box-shadow 180ms ease;

    &:hover:not(.is-disabled) {
      transform: translateY(-2px);
      box-shadow: 0 16px 34px color-mix(in srgb, var(--el-color-primary) 32%, transparent);
    }

    &:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--el-color-primary) 24%, transparent);
      outline-offset: 3px;
    }
  }

  .register-link {
    display: flex;
    width: 100%;
    padding: 5px;
    margin-top: 20px;
    font: inherit;
    font-size: 12px;
    color: var(--login-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    transition: color 160ms ease;
    gap: 9px;
    align-items: center;
    justify-content: center;

    i {
      display: grid;
      width: 21px;
      height: 21px;
      font-style: normal;
      border: 1px solid var(--login-line);
      border-radius: 50%;
      transition:
        border-color 160ms ease,
        transform 160ms ease;
      place-items: center;
    }

    &:hover {
      color: var(--login-blue);

      i {
        border-color: var(--login-blue);
        transform: translate(2px, -2px);
      }
    }

    &:focus-visible {
      border-radius: 8px;
      outline: 2px solid var(--login-blue);
      outline-offset: 3px;
    }
  }

  @media (width <= 860px) {
    .form-intro p {
      display: block;
    }
  }

  @media (width <= 520px) {
    .form-intro {
      margin-bottom: 25px;

      h2 {
        font-size: 30px;
      }
    }

    .login-field {
      margin-bottom: 18px;

      :deep(.el-input__wrapper) {
        min-height: 50px;
      }
    }

    .login-submit {
      margin-top: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .login-submit,
    .register-link,
    .register-link i,
    .login-field :deep(.el-input__wrapper) {
      transition: none;
    }
  }
</style>
