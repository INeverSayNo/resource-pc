<script lang="tsx">
  import { defineComponent } from 'vue'
  import Collapse from '@/components/Collapse/index.vue'
  import UserInfo from '@/components/UserInfo/index.vue'
  import Breadcrumb from '@/components/Breadcrumb/index.vue'
  import { appConfig } from '@/config/app'

  const prefixCls = 'v-tool-header'

  export default defineComponent({
    name: 'ToolHeader',
    props: {
      showCollapse: {
        type: Boolean,
        default: true
      },
      showBreadcrumb: {
        type: Boolean,
        default: true
      }
    },
    setup(props) {
      return () => (
        <div
          id="v-tool-header"
          class={[
            prefixCls,
            'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between'
          ]}
        >
          {props.showCollapse || props.showBreadcrumb ? (
            <div class="h-full flex items-center min-w-0">
              {appConfig.ui.hamburger && props.showCollapse ? (
                <Collapse class="header-action" color="var(--top-header-text-color)"></Collapse>
              ) : undefined}
              {appConfig.ui.breadcrumb && props.showBreadcrumb ? (
                <Breadcrumb class="<md:hidden"></Breadcrumb>
              ) : undefined}
            </div>
          ) : undefined}
          <div class="h-full flex items-center">
            <UserInfo></UserInfo>
          </div>
        </div>
      )
    }
  })
</script>

<style lang="less" scoped>
  @prefix-cls: v-tool-header;

  .@{prefix-cls} {
    transition: left var(--transition-time-02);

    :deep(.el-switch.header-action) {
      height: 100%;

      &:hover,
      &:focus-within {
        background: var(--top-header-hover-color);
      }
    }
  }
</style>
