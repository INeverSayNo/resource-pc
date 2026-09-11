<template>
  <div v-loading="loading" class="private-line-detail">
    <DcGap>基础信息</DcGap>
    <el-descriptions border :column="2">
      <el-descriptions-item label="专用线名称">{{ showValue(detail.name) }}</el-descriptions-item>
      <el-descriptions-item label="代码">{{ showValue(detail.num) }}</el-descriptions-item>
      <el-descriptions-item label="取送车里程">{{
        showDistance(detail.transferMileage)
      }}</el-descriptions-item>
      <el-descriptions-item label="专用线地址">{{ addressText }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ showValue(detail.contacts) }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ showValue(detail.phone) }}</el-descriptions-item>
      <el-descriptions-item label="收费标准" :span="2">{{
        showValue(detail.chargeRemark)
      }}</el-descriptions-item>
    </el-descriptions>

    <DcGap class="section-title">普通货物办理</DcGap>
    <el-descriptions border :column="2">
      <el-descriptions-item label="发送品类" :span="2">
        <el-tag
          v-for="item in categories(detail.sendCategory)"
          :key="item"
          class="tag-item"
          type="success"
        >
          {{ item }}
        </el-tag>
        <span v-if="categories(detail.sendCategory).length === 0">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="到达品类" :span="2">
        <el-tag
          v-for="item in categories(detail.arriveCategory)"
          :key="item"
          class="tag-item"
          type="success"
        >
          {{ item }}
        </el-tag>
        <span v-if="categories(detail.arriveCategory).length === 0">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="超限">{{ yesNo(detail.overrun) }}</el-descriptions-item>
      <el-descriptions-item label="超重">{{ yesNo(detail.overweight) }}</el-descriptions-item>
    </el-descriptions>

    <DcGap class="section-title">集装箱办理</DcGap>
    <el-descriptions border :column="2">
      <el-descriptions-item label="发送">
        <el-tag
          v-for="item in containerScopes(detail.containerSendHS)"
          :key="item"
          class="tag-item"
          type="success"
        >
          {{ item }}
        </el-tag>
        <span v-if="containerScopes(detail.containerSendHS).length === 0">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="到达">
        <el-tag
          v-for="item in containerScopes(detail.containerArriveHS)"
          :key="item"
          class="tag-item"
          type="success"
        >
          {{ item }}
        </el-tag>
        <span v-if="containerScopes(detail.containerArriveHS).length === 0">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="货物混装" :span="2">{{
        yesNo(detail.containerMixedLoading)
      }}</el-descriptions-item>
    </el-descriptions>

    <DcGap class="section-title">危险品办理</DcGap>
    <el-descriptions border :column="3">
      <el-descriptions-item label="发送灌装">{{
        showValue(detail.dangerSendFilling)
      }}</el-descriptions-item>
      <el-descriptions-item label="发送非灌装">{{
        showValue(detail.dangerSendNotFilling)
      }}</el-descriptions-item>
      <el-descriptions-item label="发送集装箱">{{
        showValue(detail.dangerSendContainer)
      }}</el-descriptions-item>
      <el-descriptions-item label="到达灌装">{{
        showValue(detail.dangerArriveFilling)
      }}</el-descriptions-item>
      <el-descriptions-item label="到达非灌装">{{
        showValue(detail.dangerArriveNotFilling)
      }}</el-descriptions-item>
      <el-descriptions-item label="到达集装箱">{{
        showValue(detail.dangerArriveContainer)
      }}</el-descriptions-item>
    </el-descriptions>

    <DcGap class="section-title">起重能力</DcGap>
    <el-descriptions border :column="2">
      <el-descriptions-item label="最大">{{
        showValue(detail.maxLiftingCapacity)
      }}</el-descriptions-item>
      <el-descriptions-item label="叉车">{{ showValue(detail.forkliftLC) }}</el-descriptions-item>
      <el-descriptions-item label="20尺集装箱">{{
        showValue(detail.container20LC)
      }}</el-descriptions-item>
      <el-descriptions-item label="40尺集装箱">{{
        showValue(detail.container40LC)
      }}</el-descriptions-item>
    </el-descriptions>

    <DcGap class="section-title">附件信息</DcGap>
    <div v-if="imageFiles.length" class="attachment-row">
      <span class="attachment-label">图片附件：</span>
      <el-image
        v-for="file in imageFiles"
        :key="file.id || file.filePath"
        class="attachment-image"
        :src="fileUrl(file.filePath)"
        :preview-src-list="previewImageUrls"
        fit="cover"
        preview-teleported
      />
    </div>
    <div v-if="otherFiles.length" class="attachment-row">
      <span class="attachment-label">其他附件：</span>
      <div class="other-files">
        <FileDownView
          v-for="file in otherFiles"
          :key="file.id || file.filePath"
          :text="file.fileRealName || file.fileName || '附件'"
          :path="file.filePath"
        />
      </div>
    </div>
    <el-empty v-if="allFiles.length === 0" description="暂无附件信息" :image-size="40" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import FileDownView from '@/components/FileDownView/index.vue'
  import { GETFILE_URL } from '@/request'
  import { ContainerType } from '@/views/railway/station/store'
  import { getPrivateLineDetail } from './api'
  import { getPrivateLineAddress, isPrivateLineImage, splitPrivateLineValues } from './logic'
  import type { PrivateLineItem } from './type'

  defineOptions({ name: 'PrivateLineDetailForm' })

  const props = defineProps<{
    privateLineDetail: PrivateLineItem
  }>()

  const detail = ref<PrivateLineItem>({} as PrivateLineItem)
  const loading = ref(false)
  let requestController: AbortController | undefined

  const allFiles = computed(() => detail.value.fileAttach || [])
  const imageFiles = computed(() => allFiles.value.filter(isPrivateLineImage))
  const otherFiles = computed(() => allFiles.value.filter((file) => !isPrivateLineImage(file)))
  const fileUrl = (path?: string) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    return `${GETFILE_URL}${path.startsWith('/') ? path : `/${path}`}`
  }
  const previewImageUrls = computed(() => imageFiles.value.map((file) => fileUrl(file.filePath)))
  const addressText = computed(() => getPrivateLineAddress(detail.value.address))

  const categories = splitPrivateLineValues

  const containerScopes = (value?: string) =>
    (value || '')
      .split(',')
      .map((field) => ContainerType.find((item) => item.field === field)?.label)
      .filter((label): label is string => Boolean(label))

  const showValue = (value: unknown) =>
    value === undefined || value === null || value === '' ? '-' : String(value)
  const showDistance = (value?: number) =>
    value === undefined || value === null ? '-' : `${value}米`
  const yesNo = (value?: boolean) => (value === undefined ? '-' : value ? '是' : '否')

  const loadDetail = async (row: PrivateLineItem) => {
    requestController?.abort()
    detail.value = { ...row }
    if (!row.id) return
    requestController = new AbortController()
    loading.value = true
    const [error, result] = await getPrivateLineDetail(row.id, { signal: requestController.signal })
    if (!requestController.signal.aborted) {
      if (!error) detail.value = { ...row, ...result }
      loading.value = false
    }
  }

  watch(
    () => props.privateLineDetail,
    (row) => void loadDetail(row || ({} as PrivateLineItem)),
    { immediate: true }
  )

  onBeforeUnmount(() => requestController?.abort())
</script>

<style scoped lang="less">
  .section-title {
    margin-top: 16px;
  }

  .tag-item {
    margin-right: 6px;
  }

  .attachment-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 12px;
  }

  .attachment-label {
    flex: none;
    line-height: 32px;
  }

  .attachment-image {
    width: 100px;
    height: 100px;
    margin-right: 8px;
  }

  .other-files {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
