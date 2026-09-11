<script lang="ts" setup>
  import { PropType, reactive, ref, watch, computed } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import EquipmentEditForm from './editForm.vue'
  import { QueryEquipmentPage } from './api'
  import type { EquipmentItem } from './type'
  import { GetFileListByIds } from '@/api/fileApi'
  import { FileAttach } from '@/utils/base-entity'
  import { GETFILE_URL } from '@/request'
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

  const equipmentList = ref<Array<EquipmentItem>>([])

  function getEquipmentList() {
    const params = [props.stationId]
    QueryEquipmentPage(params)
      .then((res) => {
        if (res.isSuccessful) {
          equipmentList.value = res.data || []
          railwayStationStore.setEquipmentList(res.data || [])
        }
      })
      .finally(() => {
        // loading.value = false;
      })
  }

  watch(
    () => props.stationId,
    (id) => {
      id && getEquipmentList()
    }
  )

  const loadingFile = ref(false)
  const equipmentFiles = ref<Array<{ files: FileAttach[]; equipmentId: string }>>([])
  const hasFile = computed(() => (id: string) => {
    return equipmentFiles.value.some((item) => item.equipmentId === id)
  })
  const getFile = computed(() => (id: string) => {
    return equipmentFiles.value.find((item) => item.equipmentId === id)?.files || []
  })
  const getFileUrl = (url: string) => {
    return `${GETFILE_URL}${url}`
  }
  function expandRow(row: EquipmentItem, expanded: Array<EquipmentItem>) {
    if (!expanded.length) {
      return
    }
    if (row.fileAttachIds && !hasFile.value(row.id)) {
      loadingFile.value = true
      GetFileListByIds(row.fileAttachIds.split(','))
        .then((res) => {
          if (Array.isArray(res)) {
            equipmentFiles.value.push({
              equipmentId: row.id,
              files: res
            })
          }
        })
        .finally(() => {
          loadingFile.value = false
        })
    }
  }

  //#region 编辑 & 新增
  const showEditForm = ref(false)
  const isEdit = ref(false)
  const equipmentItemId = ref('')
  function editEquipment(row: EquipmentItem) {
    showEditForm.value = true
    equipmentItemId.value = row.id
    isEdit.value = true
  }

  function addEquipment() {
    isEdit.value = false
    equipmentItemId.value = ''
    showEditForm.value = true
  }

  //#endregion
</script>
<template>
  <div>
    <DcGap class="bar">
      设备资源
      <span class="bar-btn fr" @click="addEquipment">
        <DAliIcon name="plus" class="" />
        新增
      </span>
    </DcGap>

    <el-table
      :data="equipmentList"
      highlight-current-row
      :max-height="tableHeight"
      border
      @expand-change="expandRow"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-container">
            <el-row>
              <el-col span="24">
                <div class="file-attach-wrap">
                  <p class="label">附件信息：</p>
                  <div v-if="loadingFile">
                    <span>附件加载中...</span>
                  </div>
                  <div v-else>
                    <div v-if="!hasFile(row.id)" class="no-data-wrap">
                      <DAliIcon name="no-data"></DAliIcon>
                      <span class="label">暂无附件</span>
                    </div>
                    <template v-else>
                      <div class="file-attach-list">
                        <el-image
                          v-for="(file, idx) in getFile(row.id)"
                          :key="idx"
                          :preview-src-list="[getFileUrl(file.filePath || '')]"
                          style="width: 100px; height: 100px"
                          :src="getFileUrl(file.filePath || '')"
                          fit="cover"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="equipmentTypeName" label="设备名称" align="center" width="360" />
      <el-table-column prop="liftingWeight" label="起重重量" align="center" width="140">
        <template #default="{ row }">
          <p>
            <span>{{ row.liftingWeight }}</span>
            <span>吨</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="num" label="数量" align="center" width="140"></el-table-column>
      <el-table-column prop="efficiency" label="设备装卸效率" align="center" width="140">
        <template #default="{ row }">
          <p>
            <span>{{ row.efficiency }}</span>
            <span>小时/车</span>
          </p>
        </template>
      </el-table-column>

      <el-table-column prop="applyScope" label="适用范围" align="center" width="300">
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.applyScope"
            placement="top-start"
          >
            <span>{{ row.applyScope }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="备注" align="center" width="300">
        <template #default="{ row }">
          <el-tooltip class="box-item" effect="dark" :content="row.remark" placement="top-start">
            <span>{{ row.remark }}</span>
          </el-tooltip>
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
            <el-button link type="warning" @click="editEquipment(row)"> 编辑 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <EquipmentEditForm
    v-if="showEditForm"
    :equipment-id="equipmentItemId"
    :station-id="stationId"
    :station-name="stationName"
    v-model:visible="showEditForm"
    :is-edit="isEdit"
    @reload="getEquipmentList"
  ></EquipmentEditForm>
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
    & > :first-child {
      margin-right: 0.2rem;
    }
  }
  .price {
    color: #ff976a;
    font-weight: 600;
    font-size: 14px;
  }
  .file-attach-wrap {
    display: flex;
    align-items: flex-start;
  }
  .file-attach-list {
    display: flex;
    flex-wrap: wrap;
    & > div {
      margin-right: 0.4rem;
      margin-bottom: 0.4rem;
    }
  }
  .no-data-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    & > span {
      font-size: 12px;
    }
  }
</style>
