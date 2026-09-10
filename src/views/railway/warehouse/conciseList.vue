<script lang="ts" setup>
  import { PropType, reactive, ref, watch } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import DcIcon from '@/components/icon/index.vue'
  import WarehouseEditForm from './editForm.vue'
  import { QueryWarehousePage } from './api'
  import type { WarehouseItem } from './type'
  import { useRouter } from 'vue-router'
  import { useRailwayStationStore } from '../station/store/index'
  import { DcDate } from '@dczy/tie-tools'

  const props = defineProps({
    stationId: {
      type: String as PropType<string>,
      default: ''
    },
    stationName: {
      type: String as PropType<string>,
      default: ''
    },
    tableHeight: {
      type: Number,
      default: 360
    }
  })
  const railwayStationStore = useRailwayStationStore()

  const router = useRouter()

  //#region 分页
  const paginationState = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  function handlePageChange(page: number) {
    paginationState.page = page
    getWarehouseList()
  }
  function handlePageSizeChange(size: number) {
    paginationState.limit = size
    getWarehouseList()
  }
  //#endregion

  const warehouseList = ref<Array<WarehouseItem>>([])

  function getWarehouseList() {
    const params = {
      ...paginationState,
      affiliationName: props.stationName
    }
    QueryWarehousePage(params)
      .then((res) => {
        if (res.isSuccessful) {
          paginationState.total = res.totalCount
          warehouseList.value = res.items || []
          railwayStationStore.setWarehouseList(res.items || [])
        }
      })
      .finally(() => {
        // loading.value = false;
      })
  }

  watch(
    () => props.stationName,
    (name) => {
      name && getWarehouseList()
    }
  )

  function getWarehouseNature(payload: string | null): Array<{ name: string; type: string }> {
    if (!payload) return []
    return payload.split(',').map((e) => {
      return {
        name: e,
        type: 'success'
      }
    })
  }

  //#region 编辑 & 新增
  const showEditForm = ref(false)
  const isEdit = ref(false)
  const warehouseId = ref('')
  function editWarehouse(row: WarehouseItem) {
    showEditForm.value = true
    warehouseId.value = row.id
    isEdit.value = true
  }

  function addWarehouse() {
    isEdit.value = false
    warehouseId.value = ''
    showEditForm.value = true
  }

  //#endregion

  function toStationDetail(row: WarehouseItem) {
    if (row.affiliation.afId) {
      router.push({
        path: '/resource-app/station-dt',
        query: { id: row.affiliation.afId, name: row.affiliation.afName }
      })
    }
  }
</script>
<template>
  <div>
    <DcGap class="bar">
      仓库/堆场资源
      <span class="bar-btn fr" @click="addWarehouse">
        <DAliIcon name="plus" class="" />
        新增
      </span>
    </DcGap>

    <el-table :data="warehouseList" highlight-current-row border :max-height="tableHeight">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-container">
            <el-row>
              <el-col span="24">
                <p>
                  <span class="label">仓库地址：</span>
                  <span>{{ row.address?.address }}</span>
                </p>
              </el-col>
            </el-row>
            <el-row>
              <el-col span="24">
                <p>
                  <span class="label">负责人：</span>
                  <span>
                    <i>{{ row.contacts }}</i>
                    <i
                      v-if="row.phone"
                      v-clipboard:value="row.phone"
                      class="theme-color cu-pointer"
                      v-html="createPrivatePhone(row.phone).outerHTML"
                    ></i>
                  </span>
                </p>
              </el-col>
            </el-row>
            <el-row>
              <el-col span="24">
                <p>
                  <span class="label">我方对接人：</span>
                  <span>
                    <i>{{ row.principalName }}</i>
                    <i
                      v-if="row.principalPhone"
                      v-clipboard:value="row.principalPhone"
                      class="theme-color cu-pointer"
                      v-html="createPrivatePhone(row.principalPhone).outerHTML"
                    ></i>
                  </span>
                </p>
              </el-col>
            </el-row>
            <el-row>
              <el-col span="24">
                <p>
                  <span class="label">备注：</span>
                  <span>{{ row.remark }}</span>
                </p>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="仓库名称" align="center" width="360" />

      <el-table-column prop="affiliation" label="归属站点/公司" align="center" width="150px">
        <template #default="{ row }">
          <p class="affiliation-name" @click="toStationDetail(row)">
            <DAliIcon v-if="row.affiliation.afId" name="railway"></DAliIcon>
            <span>{{ row.affiliation.afName }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="area" label="面积" align="center" width="140">
        <template #default="{ row }">
          <p>
            <span>{{ row.area }}</span>
            <span>㎡</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="volume" label="体积" align="center" width="140">
        <template #default="{ row }">
          <p>
            <span>{{ row.volume }}</span>
            <span>m³</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="freeDays" label="免堆期" align="center" width="140">
        <template #default="{ row }">
          <p>
            <span>{{ row.freeDays }}</span>
            <span>天</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价" align="center" width="160">
        <template #default="{ row }">
          <p>
            <span class="price">￥{{ row.price }}</span>
            <span>{{ row.unit }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="typeName" label="仓库类型" align="center" width="140" />
      <el-table-column prop="natureName" label="仓库性质" align="center" width="190">
        <template #default="{ row }">
          <p>
            <el-tag
              v-for="item in getWarehouseNature(row.natureName)"
              :key="item.name"
              type="success"
              href="javascript:void(0);"
              :underline="false"
              class="mr-02"
            >
              {{ item.name }}
            </el-tag>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="更新人/时间" align="center" width="200">
        <template #default="{ row }">
          <span class="mr-5px">
            {{ row.lastModifierName || row.creatorName }}
          </span>
          <span>
            {{ DcDate.format(row.lastModificationTime || row.creationTime, 'YYYY-MM-DD') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="oper" fixed="right" label="操作" align="center" width="100">
        <template #default="{ row }">
          <div>
            <el-button link type="warning" @click="editWarehouse(row)"> 编辑 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="table-pagination"
      :current-page="paginationState.page"
      :page-size="paginationState.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="paginationState.total"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    />
  </div>
  <WarehouseEditForm
    v-if="showEditForm"
    :warehouse-id="warehouseId"
    :station-id="stationId"
    :station-name="stationName"
    v-model:visible="showEditForm"
    :is-edit="isEdit"
    @reload="getWarehouseList"
  ></WarehouseEditForm>
</template>

<style lang="less" scoped>
  .expand-container {
    font-size: 14px;
    line-height: 1.8;
  }
  i {
    font-style: normal;
  }

  .label {
    color: #969799;
  }
  .mr-02 {
    margin-left: 0.2rem;
  }
  .affiliation-name {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
    & > :first-child {
      margin-right: 0.2rem;
    }
    & > :last-child {
      color: #55b0ee;
    }
  }
  .price {
    color: #ff976a;
    font-weight: 600;
    font-size: 14px;
  }
</style>
