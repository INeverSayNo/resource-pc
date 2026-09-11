<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { getCenterDetail } from './api'
  import { completionRate, normalizeImageList, parseAddress, resolveFileUrl } from './logic'
  import type {
    AddressInfo,
    CenterDetail,
    EditorNode,
    OrganizationListItem,
    OrganizationNode
  } from './types'
  import CenterMap from './components/CenterMap.vue'
  import RelationshipGraph from './components/RelationshipGraph.vue'
  import OrganizationList from './components/OrganizationList.vue'
  import VisitRecordList from './components/VisitRecordList.vue'
  import OrganizationEditorDialog from './components/OrganizationEditorDialog.vue'

  const route = useRoute()
  const centerId = computed(() => String(route.query.centerId || ''))
  const routeCenterName = computed(() => String(route.query.centerName || ''))
  const loading = ref(false)
  const center = ref<CenterDetail | null>(null)
  const images = ref<string[]>([])
  const currentImage = ref('')
  const mapAddress = ref<AddressInfo>({ address: '', lat: '', lng: '', regionName: '' })
  const currentOrganization = reactive({ id: '', name: '' })
  const editorVisible = ref(false)
  const editorNode = ref<Partial<EditorNode>>({})
  const editorTab = ref<'base' | 'children' | 'contacts'>('base')
  const createParentId = ref('')
  const graphRef = ref<InstanceType<typeof RelationshipGraph> | null>(null)
  const organizationListRef = ref<InstanceType<typeof OrganizationList> | null>(null)
  let controller: AbortController | null = null
  let requestVersion = 0

  const loadCenter = async () => {
    const version = ++requestVersion
    controller?.abort()
    if (!centerId.value) {
      center.value = null
      images.value = []
      loading.value = false
      return
    }
    controller = new AbortController()
    loading.value = true
    const [error, data] = await getCenterDetail(centerId.value, { signal: controller.signal })
    if (version !== requestVersion) return
    loading.value = false
    if (error || !data?.id) return
    const address = parseAddress(data.organizationAddressDetail)
    center.value = { ...data, formatAddress: address }
    images.value = normalizeImageList(data.imgList)
    if (!images.value.length && data.firstPageImgUrl)
      images.value = [resolveFileUrl(data.firstPageImgUrl)]
    currentImage.value = images.value[0] || ''
    mapAddress.value = address
    if (!currentOrganization.id || currentOrganization.id === data.id) {
      currentOrganization.id = data.id
      currentOrganization.name = data.organizationName
    }
  }

  const chooseOrganization = (id: string, name: string) => {
    currentOrganization.id = id
    currentOrganization.name = name
  }

  const openEditor = (
    node: Partial<EditorNode>,
    tab: 'base' | 'children' | 'contacts' = 'base'
  ) => {
    editorNode.value = node
    editorTab.value = tab
    createParentId.value = ''
    editorVisible.value = true
  }

  const openNodeEditor = (
    node: OrganizationNode | OrganizationListItem,
    tab: 'base' | 'children' | 'contacts' = 'base'
  ) => openEditor(node, tab)

  const createOrganization = (parentId: string) => {
    editorNode.value = {}
    editorTab.value = 'base'
    createParentId.value = parentId
    editorVisible.value = true
  }

  const refreshAll = async () => {
    await loadCenter()
    await nextTick()
    await Promise.all([graphRef.value?.refresh(), organizationListRef.value?.refresh(true)])
  }

  const completion = computed(() => completionRate(center.value?.dataCompletionDegree))

  watch(
    centerId,
    (id) => {
      center.value = null
      images.value = []
      currentImage.value = ''
      mapAddress.value = { address: '', lat: '', lng: '', regionName: '' }
      currentOrganization.id = id
      currentOrganization.name = routeCenterName.value
      void loadCenter()
    },
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestVersion += 1
    controller?.abort()
  })
</script>

<template>
  <div v-loading="loading" class="detail-page">
    <section v-if="center" class="center-header">
      <div class="gallery">
        <el-image class="main-image" :src="currentImage" fit="cover" :preview-src-list="images">
          <template #error>
            <button class="image-empty" type="button" @click="openEditor(center)"
              >暂无中心图片</button
            >
          </template>
        </el-image>
        <div v-if="images.length > 1" class="thumbnail-list">
          <el-image
            v-for="image in images"
            :key="image"
            :src="image"
            fit="cover"
            :class="{ active: image === currentImage }"
            @click="currentImage = image"
          />
        </div>
      </div>
      <div class="base-info">
        <div class="title-row">
          <div>
            <div class="title-with-rate">
              <h2>{{ center.organizationName }}</h2>
              <el-rate :model-value="completion" disabled />
              <span class="completion">{{ center.dataCompletionDegree || 0 }}%</span>
            </div>
            <div class="tags">
              <el-tag v-if="center.belongRailwayCompany">{{ center.belongRailwayCompany }}</el-tag>
              <el-tag v-if="center.ourResponsibleRegionalCompanyName" type="success">
                {{ center.ourResponsibleRegionalCompanyName }}
              </el-tag>
              <el-button circle title="编辑中心" @click="openEditor(center)">
                <DAliIcon name="edit" />
              </el-button>
              <el-button circle title="刷新" @click="refreshAll">
                <DAliIcon name="sync" />
              </el-button>
            </div>
          </div>
          <div class="totals">
            <p
              ><b>{{ center.businessDepartmentCount || 0 }}个</b><span>机构部门</span></p
            >
            <p
              ><b>{{ center.stationCount || 0 }}个</b><span>站点</span></p
            >
          </div>
        </div>
        <div class="extra-info">
          <div class="contact-stats">
            <span class="extra-title">联系</span>
            <p
              ><b>{{ center.allDepartmentCount || 0 }}个</b><span>机构部门</span></p
            >
            <p
              ><b>{{ center.alreadyContactDepartmentCount || 0 }}个</b><span>已联系机构</span></p
            >
            <p
              ><b>{{ center.allContactPersonCount || 0 }}个</b><span>联系人</span></p
            >
            <p
              ><b>{{ center.alreadyContactPersonCount || 0 }}个</b><span>已联系人</span></p
            >
          </div>
          <div class="business-tags">
            <span class="extra-title">业务</span>
            <el-tag v-for="label in center.businessLabelList || []" :key="label" type="success">
              {{ label }}
            </el-tag>
            <span v-if="!center.businessLabelList?.length" class="empty-text">暂无标签</span>
          </div>
          <div class="map-row">
            <span class="extra-title">地址</span>
            <CenterMap
              :address="mapAddress"
              :name="currentOrganization.name || center.organizationName"
            />
          </div>
        </div>
      </div>
    </section>
    <el-empty v-else-if="!loading" description="未找到物流中心信息" />

    <RelationshipGraph
      ref="graphRef"
      :center-id="centerId"
      @change="chooseOrganization"
      @edit="openNodeEditor"
    />

    <section class="list-panel">
      <header>
        下辖机构
        <span>{{ currentOrganization.name || routeCenterName }}</span>
      </header>
      <OrganizationList
        ref="organizationListRef"
        :org-id="currentOrganization.id"
        :org-name="currentOrganization.name"
        @location="mapAddress = $event"
        @edit="openNodeEditor"
        @create="createOrganization"
      />
    </section>

    <VisitRecordList :org-id="currentOrganization.id" />

    <OrganizationEditorDialog
      v-model="editorVisible"
      :node="editorNode"
      :center-id="centerId"
      :initial-tab="editorTab"
      :create-parent-id="createParentId"
      @success="refreshAll"
    />
  </div>
</template>

<style scoped lang="less">
  .detail-page {
    display: flex;
    min-height: calc(100vh - 84px);
    flex-direction: column;
    gap: 18px;
    padding: 18px;
    background: #f5f7fa;
    box-sizing: border-box;
  }

  .center-header {
    display: grid;
    grid-template-columns: 510px minmax(0, 1fr);
    gap: 18px;
    padding: 18px;
    border-radius: 8px;
    background: #fff;
  }

  .gallery {
    display: flex;
    gap: 10px;
  }

  .main-image,
  .image-empty {
    width: 420px;
    height: 420px;
  }

  .image-empty {
    border: 1px solid #ebeef5;
    background: #f5f7fa;
    color: #909399;
    cursor: pointer;
    font-size: 18px;
  }

  .thumbnail-list {
    display: flex;
    width: 80px;
    height: 420px;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }

  .thumbnail-list :deep(.el-image) {
    width: 72px;
    min-height: 72px;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
  }

  .thumbnail-list :deep(.el-image.active) {
    border-color: var(--el-color-primary);
  }

  .base-info {
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: space-between;
  }

  .title-row,
  .title-with-rate,
  .tags,
  .contact-stats,
  .business-tags,
  .map-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title-with-rate h2 {
    margin: 0;
  }

  .completion,
  .totals b,
  .contact-stats b {
    color: #f56c6c;
  }

  .totals {
    display: flex;
    gap: 28px;
  }

  .totals p,
  .contact-stats p {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
  }

  .totals b {
    font-size: 25px;
  }

  .totals span,
  .contact-stats span,
  .empty-text {
    color: #909399;
    font-size: 13px;
  }

  .tags {
    margin-top: 12px;
  }

  .extra-info {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 7px;
    background: #f5f7fa;
  }

  .contact-stats {
    justify-content: space-between;
  }

  .extra-title {
    width: 42px;
    flex-shrink: 0;
    color: #606266;
  }

  .map-row {
    align-items: flex-start;
  }

  .map-row :deep(.center-map) {
    min-width: 0;
    flex: 1;
  }

  .list-panel {
    padding: 0 16px 16px;
    border-radius: 8px;
    background: #fff;
  }

  .list-panel > header {
    padding: 14px 0;
    border-bottom: 1px dashed #ebeef5;
    color: #606266;
  }

  .list-panel > header span {
    margin-left: 8px;
    color: var(--el-color-primary);
    font-size: 13px;
  }

  .list-panel :deep(.organization-list) {
    padding-top: 14px;
  }

  @media (width <= 1320px) {
    .center-header {
      grid-template-columns: 1fr;
    }
  }
</style>
