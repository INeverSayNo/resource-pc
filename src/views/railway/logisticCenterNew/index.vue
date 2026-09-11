<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { queryCenters } from './api'
  import { completionRate, normalizeCenterItem } from './logic'
  import type { CenterListItem, CenterQuery } from './types'
  import FilterForm from './components/FilterForm.vue'

  const router = useRouter()
  const loading = ref(false)
  const centers = ref<CenterListItem[]>([])
  const pagination = reactive({ page: 1, limit: 10, total: 0 })
  const filters = reactive({
    searchName: '',
    railwayCompany: '',
    province: '',
    areaCompany: '',
    addressDetail: ''
  })
  let requestController: AbortController | null = null
  let requestVersion = 0

  const query = computed<CenterQuery>(() => ({ ...pagination, ...filters }))

  const loadCenters = async () => {
    const version = ++requestVersion
    requestController?.abort()
    requestController = new AbortController()
    loading.value = true
    const [error, result] = await queryCenters(query.value, { signal: requestController.signal })
    if (version !== requestVersion) return
    if (!error) {
      centers.value = (result.items || []).map(normalizeCenterItem)
      pagination.total = result.totalCount || 0
    }
    loading.value = false
  }

  const handleQuery = (value: {
    keywords: string
    railwayBureau: string
    province: string
    areaCompany: string
    detailAddress: string
  }) => {
    Object.assign(filters, {
      searchName: value.keywords,
      railwayCompany: value.railwayBureau,
      province: value.province,
      areaCompany: value.areaCompany,
      addressDetail: value.detailAddress
    })
    pagination.page = 1
    void loadCenters()
  }

  const openDetail = (item: CenterListItem) => {
    void router.push({
      path: '/resource-app/logistic-center-detail',
      query: { centerId: item.id, centerName: item.organizationName }
    })
  }

  const uniqueNames = (items: string[]) => [...new Set(items || [])].join(' / ')

  onMounted(loadCenters)
  onBeforeUnmount(() => {
    requestVersion += 1
    requestController?.abort()
  })
</script>

<template>
  <div class="center-page">
    <FilterForm @query="handleQuery" />

    <div v-loading="loading" class="center-content">
      <div v-if="centers.length" class="center-grid">
        <article v-for="item in centers" :key="item.id" class="center-card">
          <el-image
            class="center-cover"
            :src="item.firstPageImgUrl"
            fit="cover"
            @click="openDetail(item)"
          >
            <template #error>
              <button class="cover-empty" type="button" @click="openDetail(item)">
                {{ item.organizationName?.split('铁路物流中心')[0] || '暂无中心图片' }}
              </button>
            </template>
          </el-image>
          <div class="center-info">
            <div class="tag-row">
              <el-tag v-if="item.belongRailwayCompany" size="small">
                {{ item.belongRailwayCompany }}
              </el-tag>
              <el-tag v-if="item.ourResponsibleRegionalCompanyName" size="small" type="success">
                {{ item.ourResponsibleRegionalCompanyName }}
              </el-tag>
            </div>
            <div class="name-row">
              <button class="center-name" type="button" @click="openDetail(item)">
                {{ item.organizationName }}
              </button>
              <div class="rate">
                <el-rate :model-value="completionRate(item.dataCompletionDegree)" disabled />
                <span>{{ item.dataCompletionDegree || 0 }}%</span>
              </div>
            </div>
            <div class="summary-row">
              <span
                >下属机构：<b>{{ item.businessDepartmentCount || 0 }}个</b></span
              >
              <el-tooltip :content="uniqueNames(item.businessDepartmentList)" placement="top">
                <span class="summary-names">{{
                  uniqueNames(item.businessDepartmentList) || '暂无'
                }}</span>
              </el-tooltip>
            </div>
            <div class="summary-row">
              <span
                >下属站点：<b>{{ item.stationCount || 0 }}个</b></span
              >
              <el-tooltip :content="uniqueNames(item.stationList)" placement="top">
                <span class="summary-names">{{ uniqueNames(item.stationList) || '暂无' }}</span>
              </el-tooltip>
            </div>
            <div class="address-row">
              <span class="address-text">
                <DAliIcon name="location" />
                {{ item.formatAddress?.address || '暂无地址' }}
              </span>
              <el-button link type="primary" @click="openDetail(item)">详情</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else description="暂无数据" />
    </div>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      background
      class="center-pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @size-change="loadCenters"
      @current-change="loadCenters"
    />
  </div>
</template>

<style scoped lang="less">
  .center-page {
    display: flex;
    min-height: calc(100vh - 84px);
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    box-sizing: border-box;
  }

  .center-content {
    min-height: 360px;
    flex: 1;
  }

  .center-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .center-card {
    display: flex;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fff;
    transition: box-shadow 0.2s ease;
  }

  .center-card:hover {
    box-shadow: 0 8px 28px rgb(0 0 0 / 10%);
  }

  .center-cover {
    width: 210px;
    min-width: 210px;
    height: 210px;
    cursor: pointer;
  }

  .cover-empty {
    width: 100%;
    height: 100%;
    border: 0;
    background: #f5f7fa;
    color: #909399;
    cursor: pointer;
    font-size: 18px;
    font-weight: 600;
  }

  .center-info {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    padding: 14px 16px;
  }

  .tag-row,
  .name-row,
  .summary-row,
  .address-row {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .tag-row {
    justify-content: flex-start;
  }

  .center-name {
    overflow: hidden;
    border: 0;
    background: transparent;
    color: #303133;
    cursor: pointer;
    font-size: 18px;
    font-weight: 700;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rate {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    color: #f56c6c;
    font-size: 13px;
  }

  :deep(.el-rate__icon) {
    margin-right: 1px;
  }

  .summary-row {
    color: #606266;
    font-size: 14px;
  }

  .summary-row b {
    color: #f56c6c;
    font-weight: 500;
  }

  .summary-names,
  .address-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .summary-names {
    max-width: 55%;
    color: #909399;
    text-align: right;
  }

  .address-text {
    color: #606266;
  }

  .center-pagination {
    justify-content: center;
  }

  @media (width <= 1280px) {
    .center-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
