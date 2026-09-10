<template>
  <DcGap class="bar">
    堆存费标准
    <span class="theme-color">(共{{ data?.length || 0 }}条)</span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" />
      新增
    </span>
    <span class="bar-btn fr mr-10" @click="importCollectTaskResource">
      <DAliIcon name="upload" />
      导入
    </span>
    <span class="bar-btn fr mr-20" @click="downloadTemp">
      <DAliIcon name="download" />
      下载模板
    </span>
  </DcGap>
  <el-table :data="datalis" v-loading="loading" size="small" border stripe highlight-current-row>
    <el-table-column type="index" label="序号" align="center" />

    <el-table-column label="堆存天数" align="center" width="200" prop="stockpilingMinDay">
      <template #default="scoped">
        {{ scoped.row.stockpilingMinDay + ' < 时间 ≤ ' + scoped.row.stockpilingMaxDay }}
      </template>
    </el-table-column>

    <el-table-column label="收费金额" align="center" width="150" prop="stowageFee">
      <template #default="scoped">
        {{ scoped.row.stowageFee + scoped.row.stowageUnit }}
      </template>
    </el-table-column>
    <el-table-column label="价格是否含税" align="center" prop="isContaintRax">
      <template #default="scoped">
        {{ scoped.row.isContaintRax ? '是' : '否' }}
      </template>
    </el-table-column>
    <el-table-column label="装货方式" align="center" width="80" prop="loadingType" />
    <el-table-column label="堆场类型" align="center" width="80" prop="yardType" />
    <el-table-column label="码头名称" align="center" prop="waterPortWharfName">
      <template #default="scoped">
        {{ scoped.row.waterPortWharfName ? scoped.row.waterPortWharfName : '-' }}
      </template>
    </el-table-column>
    <el-table-column label="货物名称" align="center" prop="goodsName" />
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
    <el-table-column fixed="right" label="操作" width="150" align="center">
      <template #default="scoped">
        <el-button type="text" size="small" @click="handleEdit(scoped.row)"> 编辑 </el-button>
        <el-button type="text" size="small" @click="handleDelete(scoped.row)"> 删除 </el-button>
      </template>
    </el-table-column>
  </el-table>
  <EditForm
    v-model="showEdit"
    :station="currentRow"
    :station-id="stationId"
    :wharf-data="wharfData"
    @success="handleSuccess"
  ></EditForm>
  <PortImportExcel
    v-model:visible="showImportDialog"
    title="堆存费导入"
    action-method="waterPort"
    @submit="handleImportData"
  />
</template>

<script lang="ts">
  import { defineComponent, nextTick, ref, reactive, toRefs, onMounted } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import EditForm from './outRatesForm.vue'
  import PortImportExcel from './PortImportExcel.vue'
  import {
    deleteStowage,
    downloadStowageTemplate,
    importStowage,
    listStowage
  } from '@/api/waterway-port'
  export default defineComponent({
    components: {
      DcGap,
      EditForm,
      PortImportExcel
    },
    props: {
      data: {
        type: Array as any,
        default: () => []
      },
      stationId: {
        type: String,
        default: () => ''
      },
      wharfData: {
        type: Array as any,
        default: () => [] as any
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const state = reactive({
        showImportDialog: false,
        importItem: {} as any,
        showResourceInputDialog: false
      })
      const showEdit = ref(false)
      const currentRow = ref<any>()

      function handleEdit(row: any) {
        currentRow.value = DcDeep.clone<any>(row)
        nextTick(() => {
          showEdit.value = true
        })
      }

      // 删除数据
      async function handleDelete(row: any) {
        try {
          await ElMessageBox.confirm('确认删除该条数据吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        } catch {
          return
        }
        const [error, success] = await deleteStowage(row.id)
        if (!error && success) {
          ElMessage({ message: '删除成功', type: 'success' })
          void dataLoad()
          emit('reload')
        }
      }
      const importCollectTaskResource = () => {
        // importItem.value = item;
        state.showImportDialog = true
      }
      function handleAdd() {
        currentRow.value = undefined
        nextTick(() => {
          showEdit.value = true
        })
      }
      const handleImportData = async (fileInfo: { FilePath?: string }) => {
        if (!fileInfo.FilePath) return false
        const [error, success] = await importStowage(props.stationId, fileInfo.FilePath)
        if (!error && success) {
          state.showImportDialog = false
          ElMessage.success('操作成功')
          void dataLoad()
          emit('reload')
        }
        return !error && success
      }
      function handleSuccess() {
        void dataLoad()
        emit('reload')
      }
      async function downloadTemp() {
        await downloadStowageTemplate()
      }
      const loading = ref(false)
      const datalis = ref<any>()
      async function dataLoad() {
        loading.value = true
        const [error, data] = await listStowage(props.stationId)
        if (!error) datalis.value = data
        loading.value = false
      }
      onMounted(() => {
        dataLoad()
      })
      return {
        ...toRefs(state),
        showEdit,
        currentRow,
        handleEdit,
        handleAdd,
        handleSuccess,
        formatTime,
        importCollectTaskResource,
        handleImportData,
        downloadTemp,
        loading,
        datalis,
        dataLoad,
        handleDelete
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');
</style>
