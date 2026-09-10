<template>
  <DcGap class="bar">
    作业包干费标准
    <span class="theme-color">(共{{ datalis?.length || 0 }}条)</span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" />
      新增
    </span>
    &nbsp;
    <span class="bar-btn fr mr-10px" @click="importCollectTaskResource">
      <DAliIcon name="upload" />
      导入
    </span>
    <span class="bar-btn fr mr-20px" @click="downloadTemp">
      <DAliIcon name="download" />
      下载模板
    </span>
  </DcGap>
  <el-table v-loading="loading" :data="datalis" size="small" border stripe highlight-current-row>
    <el-table-column type="index" label="序号" align="center" width="55"></el-table-column>
    <el-table-column label="港口名称" align="center" prop="portName" />
    <el-table-column label="费用名称" align="center" width="110" prop="chargeName" />
    <el-table-column label="费用类型" align="center" prop="chargeType" />
    <el-table-column label="基础单价" align="center" prop="chargeInfo" />
    <el-table-column label="单位" align="center" width="80" prop="unit" />
    <!-- <el-table-column label="船公司代码" align="center" prop="carrierCode" /> -->
    <el-table-column label="外贸/内贸" align="center" prop="tradeType">
      <template #default="scoped">
        {{ tradeTypeText(scoped.row.tradeType) }}
      </template>
    </el-table-column>
    <el-table-column label="出口/进口" align="center" prop="direction">
      <template #default="scoped">
        {{ directionText(scoped.row.direction) }}
      </template>
    </el-table-column>
    <!-- <el-table-column label="集装箱尺寸" align="center" prop="containerSize" /> -->
    <el-table-column label="集装箱类型" align="center" prop="containerType">
      <template #default="scoped">
        {{ containerTypeText(scoped.row.containerType) }}
      </template>
    </el-table-column>
    <el-table-column label="是否空箱" align="center" prop="isEmpty">
      <template #default="scoped">
        {{
          scoped.row.isEmpty == null || scoped.row.isEmpty === ''
            ? ''
            : scoped.row.isEmpty
              ? '是'
              : '否'
        }}
      </template>
    </el-table-column>
    <el-table-column label="备注" align="center" prop="remark">
      <template #default="scoped">
        {{ scoped.row.remark ?? scoped.row.Remark }}
      </template>
    </el-table-column>
    <!-- <el-table-column label="计费重量" align="center" prop="chargeableWeight" />
    <el-table-column label="是否空箱" align="center" prop="isEmpty">
      <template #default="scoped">
        {{ scoped.row.isEmpty ? "是" : "否" }}
      </template>
    </el-table-column>
    <el-table-column label="危险品等级" align="center" prop="dgClass" />
    <el-table-column label="货物类型" align="center" prop="cargoType">
      <template #default="scoped">
        {{ cargoTypeText(scoped.row.cargoType) }}
      </template>
    </el-table-column>
    <el-table-column label="计费基础" align="center" prop="chargeBasis">
      <template #default="scoped">
        {{ chargeBasisText(scoped.row.chargeBasis) }}
      </template>
    </el-table-column>
    <el-table-column label="基础单价" align="center" width="80" prop="basePrice" />
    <el-table-column label="免费数量" align="center" prop="freeQuantity" />
    <el-table-column label="费率类型" align="center" prop="rateType">
      <template #default="scoped">
        {{ rateTypeText(scoped.row.rateType) }}
      </template>
    </el-table-column>
    <el-table-column label="最低收费金额" align="center" prop="minCharge" />
    <el-table-column label="增值税率(%)" align="center" prop="vatRate" />
    <el-table-column label="含在海运费中" align="center" prop="isIncludedInFreight">
      <template #default="scoped">
        {{ scoped.row.isIncludedInFreight ? "是" : "否" }}
      </template>
    </el-table-column> -->
    <!-- <el-table-column label="匹配优先级" align="center" prop="priority" />
    <el-table-column label="生效起始日期" align="center" prop="effectiveFrom" width="110">
      <template #default="scoped">
        {{ scoped.row.effectiveFrom ? formatTime(scoped.row.effectiveFrom, "yyyy-MM-dd") : "" }}
      </template>
    </el-table-column>
    <el-table-column label="生效截止日期" align="center" prop="effectiveTo" width="110">
      <template #default="scoped">
        {{ scoped.row.effectiveTo ? formatTime(scoped.row.effectiveTo, "yyyy-MM-dd") : "" }}
      </template>
    </el-table-column> -->
    <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
    <!-- <el-table-column label="内贸出口费率" align="center" width="80" prop="DomesticTradeExitRate" />
    <el-table-column label="价格是否含税" align="center" width="80" prop="IsContaintRax">
        <template #default="scoped">
          {{ scoped.row.IsContaintRax ? "是" : "否" }}
        </template>
      </el-table-column>
    <el-table-column label="单位" align="center" width="60" prop="Unit" />
    <el-table-column label="备注" align="center" prop="Remark" />
    <el-table-column
      label="维护人员"
      align="center"
      prop="UpdateUserName"
    >
      <template #default="scoped">
        {{ scoped.row.UpdateUserName || scoped.row.CreatorName }}
        {{
          scoped.row.UpdateUserName
            ? formatTime(scoped.row.UpdateTime, "yyyy-MM-dd HH:mm")
            : formatTime(scoped.row.CreationTime, "yyyy-MM-dd HH:mm")
        }}
      </template>
    </el-table-column> -->
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
    :work-zone-data="workZoneData"
    @success="handleSuccess"
  ></EditForm>
  <PortImportExcel
    v-model:visible="showImportDialog"
    title="作业包干费导入"
    action-method="waterPort"
    @submit="handleImportData"
  />
</template>

<script lang="ts">
  import { defineComponent, nextTick, ref, reactive, toRefs, onMounted } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  // import EditForm from "./feeStandardsForm.vue";
  import EditForm from './feeStandardsFormNew.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import PortImportExcel from './PortImportExcel.vue'
  import {
    deleteWorkFee,
    downloadWorkFeeTemplate,
    importWorkFees,
    listWorkFees
  } from '@/api/waterway-port'
  export default defineComponent({
    components: {
      DcGap,
      EditForm,
      PortImportExcel
    },
    props: {
      feeStandards: {
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
      },
      workZoneData: {
        type: Array as any,
        default: () => [] as any
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const state = reactive({
        showImportDialog: false,
        importItem: {} as any,
        showResourceInputDialog: false,
        data: {} as any
      })
      const loading = ref(false)
      const datalis = ref<any>()
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
        const [error, success] = await deleteWorkFee(row.id)
        if (!error && success) {
          ElMessage({ message: '删除成功', type: 'success' })
          void dataLoad()
          emit('reload')
        }
      }

      const handleImportData = async (fileInfo: { FilePath?: string }) => {
        if (!fileInfo.FilePath) return false
        const [error, success] = await importWorkFees(props.stationId, fileInfo.FilePath)
        if (!error && success) {
          state.showImportDialog = false
          ElMessage.success('操作成功')
          void dataLoad()
          emit('reload')
        }
        return !error && success
      }
      // 导入数据
      /* const handleImportData = (fileInfo) => {
      const resourceObjectId = state.importItem.targetResourceObjectId;
      const param: ImportDataParam = {
        resourceObjectId: resourceObjectId,
        filePath: fileInfo.FilePath
      };
      importCollectTaskResource(injectDisposeId.value, param).then((res) => {
        if (res) {
          Message.success("导入成功");
          state.showImportDialog = false;
          initData();
        }
      });
    }; */
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
      async function downloadTemp() {
        await downloadWorkFeeTemplate()
      }
      const importCollectTaskResource = () => {
        // importItem.value = item;
        state.showImportDialog = true
      }

      onMounted(() => {
        dataLoad()
      })
      function chargeBasisText(value: any) {
        const map: any = {
          0: '按箱',
          1: '按重量吨',
          2: '按体积吨',
          3: '择大',
          PerContainer: '按箱',
          PerWeight: '按重量吨',
          PerVolume: '按体积吨',
          PerChargeableWeight: '择大'
        }
        return map[value] ?? value
      }
      function cargoTypeText(value: any) {
        const map: any = {
          0: '散货',
          1: '件杂货',
          2: '袋装',
          3: '托盘',
          4: '吨包',
          Bulk: '散货',
          GeneralCargo: '件杂货',
          Bagged: '袋装',
          Pallet: '托盘',
          TonBag: '吨包'
        }
        return map[value] ?? value
      }
      function containerTypeText(value: any) {
        const map: any = {
          0: '通用集装箱',
          1: '高柜集装箱',
          2: '冷藏集装箱',
          3: '开顶集装箱',
          4: '框架集装箱',
          5: '罐式集装箱',
          6: '挂衣集装箱',
          7: '通风集装箱',
          8: '保温/隔热集装箱',
          9: '散货集装箱',
          10: '平台集装箱',
          11: '侧开集装箱',
          12: '牲畜集装箱',
          999: '水运散货',
          GP: '通用集装箱',
          HC: '高柜集装箱',
          RF: '冷藏集装箱',
          OT: '开顶集装箱',
          FR: '框架集装箱',
          TK: '罐式集装箱',
          HT: '挂衣集装箱',
          VC: '通风集装箱',
          IN: '保温/隔热集装箱',
          BK: '散货集装箱',
          PL: '平台集装箱',
          OS: '侧开集装箱',
          PC: '牲畜集装箱',
          BulkCargo: '水运散货'
        }
        return map[value] ?? value
      }
      function tradeTypeText(value: any) {
        const map: any = {
          0: '内贸',
          1: '外贸',
          Domestic: '内贸',
          Foreign: '外贸'
        }
        return map[value] ?? value
      }
      function directionText(value: any) {
        const map: any = {
          0: '出口',
          1: '进口',
          Export: '出口',
          Import: '进口'
        }
        return map[value] ?? value
      }
      function rateTypeText(value: any) {
        const map: any = {
          0: '固定值',
          1: '时间阶梯收费',
          2: '重量阶梯收费',
          3: '数量阶梯收费',
          4: '距离阶梯收费',
          Fixed: '固定值',
          StepByTime: '时间阶梯收费',
          StepByWeight: '重量阶梯收费',
          StepByQty: '数量阶梯收费',
          StepByDistance: '距离阶梯收费'
        }
        return map[value] ?? value
      }
      async function dataLoad() {
        loading.value = true
        const [error, data] = await listWorkFees(props.stationId)
        if (!error) datalis.value = data
        loading.value = false
      }
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
        dataLoad,
        datalis,
        chargeBasisText,
        cargoTypeText,
        containerTypeText,
        tradeTypeText,
        directionText,
        rateTypeText,
        handleDelete
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');
</style>
