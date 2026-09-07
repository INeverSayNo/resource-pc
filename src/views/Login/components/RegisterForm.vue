<script setup lang="ts">
  import { computed, onUnmounted, ref } from 'vue'
  import { ElCheckbox, ElForm, ElFormItem, ElInput } from 'element-plus'
  import { required, useForm } from '@/hooks/useForm'
  import { ElButton } from 'element-plus'

  interface RegisterValues {
    username: string
    password: string
    checkPassword: string
    code: string
    agreed: boolean
  }

  const emit = defineEmits(['to-login'])
  const { state, actions } = useForm<RegisterValues>({
    initialValues: {
      username: '',
      password: '',
      checkPassword: '',
      code: '',
      agreed: false
    },
    rules: {
      username: required(),
      password: required(),
      checkPassword: [
        required(),
        (value, values) => (value === values.password ? undefined : '两次输入的密码不一致')
      ],
      code: required(),
      agreed: (value) => (value ? undefined : '请先同意用户协议')
    }
  })
  const values = computed(() => state.values.value)
  const errors = computed(() => state.errors.value)
  const submitting = computed(() => state.submitting.value)

  const codeTime = ref(0)
  let codeTimer: ReturnType<typeof setInterval> | undefined

  const getCode = () => {
    if (codeTime.value > 0) return

    codeTime.value = 60
    codeTimer = setInterval(() => {
      codeTime.value -= 1
      if (codeTime.value > 0) return

      clearInterval(codeTimer)
      codeTimer = undefined
    }, 1000)
  }

  onUnmounted(() => {
    if (codeTimer) clearInterval(codeTimer)
  })

  const register = () =>
    actions.submit(async () => {
      emit('to-login')
    })
</script>

<template>
  <ElForm
    :model="values"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="register-form"
    @submit.prevent="register()"
  >
    <div class="form-intro">
      <span class="form-kicker">创建账号</span>
      <h2>注册</h2>
      <p>开箱即用的中后台管理系统</p>
    </div>

    <ElFormItem class="register-field" label="用户名" :error="errors.username?.[0]">
      <ElInput
        v-model="values.username"
        placeholder="请输入用户名"
        autocomplete="username"
        :disabled="submitting"
        @input="actions.clearErrors('username')"
        @blur="actions.validateField('username')"
      />
    </ElFormItem>

    <div class="password-grid">
      <ElFormItem class="register-field" label="密码" :error="errors.password?.[0]">
        <ElInput
          v-model="values.password"
          type="password"
          show-password
          placeholder="请输入密码"
          autocomplete="new-password"
          :disabled="submitting"
          @input="actions.clearErrors(['password', 'checkPassword'])"
          @blur="actions.validateField('password')"
        />
      </ElFormItem>

      <ElFormItem class="register-field" label="确认密码" :error="errors.checkPassword?.[0]">
        <ElInput
          v-model="values.checkPassword"
          type="password"
          show-password
          placeholder="请输入密码"
          autocomplete="new-password"
          :disabled="submitting"
          @input="actions.clearErrors('checkPassword')"
          @blur="actions.validateField('checkPassword')"
        />
      </ElFormItem>
    </div>

    <ElFormItem class="register-field code-field" label="验证码" :error="errors.code?.[0]">
      <div class="code-control">
        <ElInput
          v-model="values.code"
          placeholder="请输入验证码"
          autocomplete="one-time-code"
          :disabled="submitting"
          @input="actions.clearErrors('code')"
          @blur="actions.validateField('code')"
        />
        <ElButton
          native-type="button"
          plain
          type="primary"
          class="code-button"
          :disabled="codeTime > 0 || submitting"
          @click="getCode"
        >
          {{ codeTime > 0 ? `${codeTime}秒` : '获取验证码' }}
        </ElButton>
      </div>
    </ElFormItem>

    <ElFormItem class="agreement-field" :error="errors.agreed?.[0]">
      <ElCheckbox
        v-model="values.agreed"
        :disabled="submitting"
        @change="actions.clearErrors('agreed')"
      >
        我同意《用户协议》
      </ElCheckbox>
    </ElFormItem>

    <ElButton native-type="submit" :loading="submitting" type="primary" class="register-submit">
      注册
    </ElButton>

    <button type="button" class="login-link" @click="emit('to-login')">
      <i aria-hidden="true">←</i>
      <span>已有账号？去登录</span>
    </button>
  </ElForm>
</template>

<style lang="less" scoped>
  .register-form {
    width: 100%;
    color: var(--login-ink);
  }

  .form-intro {
    margin-bottom: 22px;

    h2 {
      margin: 6px 0;
      font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 32px;
      font-weight: 720;
      line-height: 1.12;
      letter-spacing: -0.035em;
      color: var(--login-ink);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--login-muted);
    }
  }

  .form-kicker {
    font-family: SFMono-Regular, Consolas, monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--login-blue);
  }

  .password-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .register-field {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      height: auto;
      padding: 0;
      margin-bottom: 7px;
      font-size: 12px;
      font-weight: 650;
      line-height: 1.3;
      color: var(--login-ink);
    }

    :deep(.el-input__wrapper) {
      min-height: 46px;
      padding: 0 14px;
      background: color-mix(in srgb, var(--login-panel) 72%, var(--login-card));
      border-radius: 13px;
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
      font-size: 13px;
      color: var(--login-ink);
    }

    :deep(.el-form-item__error) {
      padding-top: 4px;
      font-size: 10px;
    }
  }

  .code-control {
    display: grid;
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }

  .code-button {
    min-width: 112px;
    min-height: 46px;
    border-radius: 13px;
  }

  .agreement-field {
    margin: -1px 0 13px;

    :deep(.el-checkbox__label) {
      font-size: 12px;
      color: var(--login-muted);
    }

    :deep(.el-form-item__error) {
      padding-top: 0;
      font-size: 10px;
    }
  }

  .register-submit {
    width: 100%;
    min-height: 48px;
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
  }

  .login-link {
    display: flex;
    width: 100%;
    padding: 5px;
    margin-top: 15px;
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
        transform: translateX(-2px);
      }
    }

    &:focus-visible {
      border-radius: 8px;
      outline: 2px solid var(--login-blue);
      outline-offset: 3px;
    }
  }

  @media (width <= 520px) {
    .form-intro {
      margin-bottom: 20px;
    }

    .password-grid {
      display: block;
    }

    .code-control {
      grid-template-columns: minmax(0, 1fr) 96px;
    }

    .code-button {
      min-width: 0;
      padding: 8px;
      font-size: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .register-submit,
    .login-link,
    .login-link i,
    .register-field :deep(.el-input__wrapper) {
      transition: none;
    }
  }
</style>
