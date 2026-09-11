<script setup lang="ts">
  import * as echarts from 'echarts'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { getOrganizationRelation } from '../api'
  import { buildOrganizationTree } from '../logic'
  import type { OrganizationNode } from '../types'
  import contactIcon from '../assets/contact-person.svg'
  import staffIcon from '../assets/staff-person.svg'

  const props = defineProps<{ centerId: string }>()
  const emit = defineEmits<{
    change: [id: string, name: string]
    edit: [node: OrganizationNode]
  }>()

  const containerRef = ref<HTMLDivElement | null>(null)
  const loading = ref(false)
  const fullscreen = ref(false)
  const showContacts = ref(false)
  const relationNodes = ref<OrganizationNode[]>([])
  const contextMenu = ref({ visible: false, x: 0, y: 0, node: null as OrganizationNode | null })
  let chart: echarts.ECharts | null = null
  let controller: AbortController | null = null
  let requestVersion = 0

  const treeData = computed(() =>
    buildOrganizationTree(relationNodes.value, {
      showContacts: showContacts.value,
      contactIcon,
      staffIcon
    })
  )

  const option = computed<echarts.EChartsOption>(() => ({
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'tree',
        data: treeData.value,
        left: '3%',
        right: '3%',
        top: '14%',
        bottom: '16%',
        orient: 'vertical',
        symbol: 'circle',
        roam: true,
        initialTreeDepth: showContacts.value ? 5 : 1,
        expandAndCollapse: true,
        animationDuration: 450,
        animationDurationUpdate: 650,
        lineStyle: { type: 'dashed' },
        label: {
          position: 'inside',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          lineHeight: 15,
          formatter: (params: any) =>
            String(params.data.name || '')
              .split('')
              .map((char, index) => (index && index % 3 === 0 ? `${char}\n` : char))
              .join('')
        },
        leaves: { label: { position: 'inside' } }
      }
    ]
  }))

  const renderChart = () => {
    if (!chart) return
    chart.setOption(option.value, { notMerge: true })
  }

  const loadRelation = async () => {
    const version = ++requestVersion
    controller?.abort()
    if (!props.centerId) {
      relationNodes.value = []
      loading.value = false
      return
    }
    controller = new AbortController()
    loading.value = true
    const [error, relation] = await getOrganizationRelation(props.centerId, {
      signal: controller.signal
    })
    if (version !== requestVersion) return
    loading.value = false
    if (!error) relationNodes.value = relation.centerOrganizationList || []
  }

  const closeContextMenu = () => {
    contextMenu.value.visible = false
  }

  const handleResize = () => chart?.resize()

  const initChart = () => {
    if (!containerRef.value) return
    chart = echarts.init(containerRef.value)
    chart.on('click', (params: any) => {
      closeContextMenu()
      if (params.data?.id && params.data?.organizationType >= 0) {
        emit('change', params.data.id, params.data.organizationName)
      }
    })
    chart.on('contextmenu', (params: any) => {
      const event = params.event?.event as MouseEvent | undefined
      event?.preventDefault()
      if (!params.data?.id || params.data?.organizationType < 0) return
      contextMenu.value = {
        visible: true,
        x: params.event.offsetX,
        y: params.event.offsetY,
        node: params.data as OrganizationNode
      }
    })
    renderChart()
  }

  const toggleFullscreen = async () => {
    fullscreen.value = !fullscreen.value
    await nextTick()
    handleResize()
  }

  const reset = () => {
    renderChart()
    chart?.dispatchAction({ type: 'restore' })
  }

  const editNode = () => {
    if (contextMenu.value.node) emit('edit', contextMenu.value.node)
    closeContextMenu()
  }

  watch(treeData, renderChart)
  watch(() => props.centerId, loadRelation)

  onMounted(() => {
    initChart()
    void loadRelation()
    window.addEventListener('resize', handleResize)
    window.addEventListener('click', closeContextMenu)
  })

  onBeforeUnmount(() => {
    requestVersion += 1
    controller?.abort()
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('click', closeContextMenu)
    chart?.dispose()
    chart = null
  })

  defineExpose({ refresh: loadRelation })
</script>

<template>
  <section v-loading="loading" class="graph-panel" :class="{ fullscreen }">
    <header class="panel-header">
      <span>物流中心架构情况</span>
      <div class="graph-actions">
        <span class="hint">右键机构节点可编辑</span>
        <el-switch v-model="showContacts" active-text="显示联络线" />
        <el-button link type="primary" @click="toggleFullscreen">
          {{ fullscreen ? '退出全屏' : '全屏' }}
        </el-button>
        <el-button link type="primary" @click="reset">重置视图</el-button>
      </div>
    </header>
    <div ref="containerRef" class="chart" />
    <button
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      type="button"
      @click.stop="editNode"
    >
      编辑查看
    </button>
  </section>
</template>

<style scoped lang="less">
  .graph-panel {
    position: relative;
    border-radius: 8px;
    background: #fff;
  }

  .graph-panel.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 2000;
    border-radius: 0;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px dashed #ebeef5;
    color: #606266;
  }

  .graph-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .hint {
    color: #909399;
    font-size: 12px;
  }

  .chart {
    width: 100%;
    height: 340px;
  }

  .fullscreen .chart {
    height: calc(100vh - 58px);
  }

  .context-menu {
    position: absolute;
    z-index: 10;
    border: 0;
    border-radius: 5px;
    background: #e6a23c;
    color: #fff;
    cursor: pointer;
    padding: 7px 12px;
  }
</style>
