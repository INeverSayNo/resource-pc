<script setup lang="ts">
  import { onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { formatTime } from '@/utils'
  import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
  import { queryVisitRecords } from '../api'
  import { resolveFileUrl } from '../logic'
  import type { VisitRecord } from '../types'

  const props = defineProps<{ orgId: string }>()
  const loading = ref(false)
  const records = ref<VisitRecord[]>([])
  const pagination = reactive({ page: 1, limit: 20, total: 0 })
  let controller: AbortController | null = null
  let requestVersion = 0

  const loadRecords = async () => {
    const version = ++requestVersion
    controller?.abort()
    if (!props.orgId) {
      records.value = []
      pagination.total = 0
      loading.value = false
      return
    }
    controller = new AbortController()
    loading.value = true
    const [error, result] = await queryVisitRecords(
      { page: pagination.page, limit: pagination.limit, businessId: props.orgId },
      { signal: controller.signal }
    )
    if (version !== requestVersion) return
    if (!error) {
      records.value = result.items || []
      pagination.total = result.totalCount || 0
    }
    loading.value = false
  }

  watch(
    () => props.orgId,
    () => {
      pagination.page = 1
      void loadRecords()
    },
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestVersion += 1
    controller?.abort()
  })
</script>

<template>
  <section class="visit-panel">
    <header>物流中心拜访情况</header>
    <div v-loading="loading" class="visit-content">
      <el-steps v-if="records.length" direction="vertical" :space="150">
        <el-step
          v-for="record in records"
          :key="record.id"
          :title="formatTime(record.visitDate, 'yyyy-MM-dd')"
        >
          <template #description>
            <article class="visit-item">
              <div class="visit-meta">
                <span>{{ record.visitUserName || '未知拜访人' }}</span>
                <el-tag size="small" type="info">{{
                  record.visitExtendJson?.visitType || '拜访'
                }}</el-tag>
                <time>{{ formatTime(record.visitDate, 'yyyy-MM-dd HH:mm:ss') }}</time>
              </div>
              <div class="visit-body">
                <p>{{ record.visitContent || '暂无拜访内容' }}</p>
                <div class="visit-images">
                  <el-image
                    v-for="file in record.fileAttachDtos || []"
                    :key="file.id"
                    :src="resolveFileUrl(file.filePath)"
                    :preview-src-list="
                      (record.fileAttachDtos || []).map((item) => resolveFileUrl(item.filePath))
                    "
                    fit="cover"
                  />
                </div>
              </div>
              <div class="visit-target">
                拜访对象：{{ record.businessName || '暂无' }}
                <span>{{ record.visitExtendJson?.contact }}</span>
                <span
                  v-if="record.visitExtendJson?.contactPhone"
                  v-clipboard="record.visitExtendJson.contactPhone"
                  class="phone"
                  v-html="createPrivatePhone(record.visitExtendJson.contactPhone).outerHTML"
                />
              </div>
            </article>
          </template>
        </el-step>
      </el-steps>
      <el-empty v-else description="暂无数据" :image-size="80" />
    </div>
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="loadRecords"
      @current-change="loadRecords"
    />
  </section>
</template>

<style scoped lang="less">
  .visit-panel {
    padding: 0 16px 16px;
    border-radius: 8px;
    background: #fff;
  }

  .visit-panel > header {
    padding: 14px 0;
    border-bottom: 1px dashed #ebeef5;
    color: #606266;
  }

  .visit-content {
    min-height: 150px;
    padding: 16px;
  }

  .visit-item {
    width: min(1050px, calc(100vw - 210px));
    border-radius: 6px;
    background: #ecf9ff;
    color: #303133;
    padding: 12px 16px;
  }

  .visit-meta,
  .visit-target {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .visit-meta time {
    margin-left: auto;
    color: #909399;
  }

  .visit-body {
    display: flex;
    gap: 16px;
    margin: 12px 0;
    color: #606266;
  }

  .visit-body > p,
  .visit-images {
    flex: 1;
  }

  .visit-images :deep(.el-image) {
    width: 80px;
    height: 80px;
    margin-right: 8px;
  }

  .phone {
    cursor: pointer;
    color: var(--el-color-primary);
  }
</style>
