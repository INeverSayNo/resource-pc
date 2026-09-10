<template>
  <DcGap class="bar">
    码头列表
    <span class="theme-color">(共{{ data?.length || 0 }}条)</span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" />
      新增
    </span>
  </DcGap>
  <el-table v-loading="loading" :data="datalis" size="small" border stripe highlight-current-row>
    <el-table-column label="码头名称" align="center" width="100" prop="wharfName" />
    <el-table-column label="码头类型" align="center" width="200" prop="wharfType" />
    <el-table-column label="地理位置" align="center" width="200" prop="address" />
    <el-table-column label="业务说明" align="center" prop="specification" />
    <el-table-column label="免堆天数" align="center" width="80" prop="freeDays" />
    <el-table-column label="泊位个数" align="center" width="80" prop="berths" />
    <el-table-column label="最大船舶停靠吨位" align="center" width="100" prop="maxBerthT" />
    <el-table-column label="维护人员" align="center" prop="updateUserName">
      <template #default="scoped">
        {{ scoped.row.updateUserName || scoped.row.creatorName }}
        {{
          scoped.row.updateUserName
            ? formatTime(scoped.row.updateTime, 'yyyy-MM-dd HH:mm')
            : formatTime(scoped.row.creationTime, 'yyyy-MM-dd HH:mm')
        }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="100" align="center">
      <template #default="scoped">
        <el-button type="text" size="small" @click="handleEdit(scoped.row)"> 编辑 </el-button>
      </template>
    </el-table-column>
  </el-table>
  <EditForm
    v-model="showEdit"
    :data="currentRow"
    :station-id="stationId"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
  import { defineComponent, nextTick, ref, onMounted } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import EditForm from './wharfForm.vue'
  import { listWharfs } from '@/api/waterway-port'

  export default defineComponent({
    components: {
      DcGap,
      EditForm
    },
    props: {
      data: {
        type: Array as any,
        default: () => []
      },
      stationId: {
        type: String,
        default: () => ''
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const currentRow = ref<any>()

      function handleEdit(row: any) {
        currentRow.value = DcDeep.clone<any>(row)
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleAdd() {
        currentRow.value = undefined
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleSuccess() {
        void dataLoad()
        emit('reload')
      }
      const loading = ref(false)
      const datalis = ref<any>()
      async function dataLoad() {
        loading.value = true
        const [error, data] = await listWharfs(props.stationId)
        if (!error) datalis.value = data
        loading.value = false
      }
      onMounted(() => {
        dataLoad()
      })
      return {
        showEdit,
        currentRow,
        handleEdit,
        handleAdd,
        handleSuccess,
        formatTime,
        loading,
        datalis,
        dataLoad
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');
</style>
