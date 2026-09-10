<template>
  <DcGap class="bar">
    货场业务办理范围
    <span class="fs-12 theme-success mr-5px">绿色=可以办理</span>
    <span class="bar-btn fr" @click="showEdit = true">
      <DAliIcon name="edit" class="" />
      编辑
    </span>
  </DcGap>
  <div class="base-info">
    <el-row>
      <el-col v-for="(item, index) in showData" :key="index" :span="item.colspan || 8">
        <span class="label">{{ item.label }}</span>
        <span v-if="item.children?.length" class="value">
          <span
            v-for="(cItem, cIndex) in item.children"
            :key="cIndex"
            class="dt-item"
            :class="cItem.class"
          >
            {{ cItem.value }}
          </span>
        </span>
        <span v-else :class="item.class" class="value">{{ item.value }}</span>
      </el-col>
    </el-row>
  </div>
  <YardForm v-model:show="showEdit" :data="yard" @success="handleSuccess"></YardForm>
</template>

<script lang="ts">
  import { reactive, toRefs, defineComponent, PropType, computed } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { RailWayGoodsYard } from '../types'
  import { useDetails } from '../useDetails'
  import YardForm from './yardForm.vue'

  export default defineComponent({
    components: {
      DcGap,
      YardForm
    },
    props: {
      yard: {
        type: Object as PropType<RailWayGoodsYard>,
        default: () => {}
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const { GetYardShowData } = useDetails(false)
      const state = reactive({
        showEdit: false
      })
      const showData = computed(() => GetYardShowData(props.yard || {}))
      function handleSuccess() {
        emit('reload')
      }
      return {
        ...toRefs(state),
        showData,
        handleSuccess
      }
    }
  })
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
