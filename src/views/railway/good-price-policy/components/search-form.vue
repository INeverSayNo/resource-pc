<template>
  <el-form ref="formRef" :model="model" label-width="90px" label-suffix="：">
    <el-row :gutter="12">
      <el-col :span="6">
        <el-form-item label="发局">
          <el-select v-model="model.bureau" filterable clearable placeholder="请选择发局">
            <el-option
              v-for="item in bureauOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="发站">
          <DcRailwayStation
            v-model="model.station"
            :show-unknown="false"
            :bureau="model.bureau"
            placeholder="请输入发站信息"
            @change="handleStationChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="发货省">
          <el-select v-model="model.province" filterable clearable placeholder="请选择发货省">
            <el-option
              v-for="item in provinceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="项目类型">
          <el-select v-model="model.policyType" filterable clearable placeholder="请选择项目类型">
            <el-option
              v-for="item in policyTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="6">
        <el-form-item label="到局">
          <el-select v-model="model.arrivalBureau" filterable clearable placeholder="请选择到局">
            <el-option
              v-for="item in bureauOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="到站">
          <DcRailwayStation
            v-model="model.arrivalStation"
            :show-unknown="false"
            :bureau="model.arrivalBureau"
            placeholder="请输入到站信息"
            @change="(value, item) => handleStationChange(value, item, true)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="到货省">
          <el-select
            v-model="model.arrivalProvince"
            filterable
            clearable
            placeholder="请选择到货省"
          >
            <el-option
              v-for="item in provinceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="批准号">
          <el-input v-model="model.xfkey" clearable placeholder="请输入批准号" />
        </el-form-item>
      </el-col>

      <el-col :span="6">
        <el-form-item label="品类/品名">
          <GoodsAll v-model="model.goodsShowName" @change="handleGoodsChange" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="精确匹配">
          <el-switch v-model="model.isPrecise" active-text="品名/品类" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="箱型">
          <el-select v-model="model.containerType" filterable clearable placeholder="请选择箱型">
            <el-option
              v-for="item in containerTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="发货人">
          <el-input v-model="model.sender" clearable placeholder="请输入发货人" />
        </el-form-item>
      </el-col>

      <el-col :span="6">
        <el-form-item label="包含过期">
          <el-switch v-model="model.includeExpiration" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="票种">
          <el-select v-model="model.ticketType" clearable placeholder="请选择票种">
            <el-option label="整车" value="整车" />
            <el-option label="集装箱" value="集装箱" />
          </el-select>
        </el-form-item>
      </el-col>
      <template v-if="mapMode">
        <el-col :span="6">
          <el-form-item label="下浮比大于" prop="coefficient">
            <el-input v-model="model.coefficient" placeholder="请输入下浮比">
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="显示深度">
            <el-select v-model="model.level">
              <el-option
                v-for="item in pricePolicyLevels"
                :key="item.id"
                :label="item.label"
                :value="item.id"
                :disabled="
                  item.id === 2 && (!model.goodsCode || Number(model.coefficient || 0) < 60)
                "
              />
            </el-select>
          </el-form-item>
        </el-col>
      </template>

      <el-col :span="mapMode ? 24 : 12" class="action-column">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button type="warning" @click="emit('reset')">重置</el-button>
        <el-button type="primary" @click="emit('batch')">
          <DAliIcon name="upload" />
          Excel批量查询
        </el-button>
        <el-button v-if="canImport" type="danger" @click="emit('import')">
          <DAliIcon name="upload" />
          导入
        </el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import DcRailwayStation from '@/components/Railway/station.vue'
  import { getSystemDataShow } from '@/api/systemDataShowApi'
  import { GetDownMarkList } from '@/api/dictionary'
  import GoodsAll from './goods-all.vue'
  import { pricePolicyLevels } from '../types'
  import type { GoodsItems, PricePolicyQueryParam } from '../types'
  import { validatePolicyMapQuery } from '../logic'

  interface Option {
    label: string
    value: string
  }
  interface StationSelection {
    ProvinceName?: string
    RailwayBureauCode?: string
  }

  const props = withDefaults(
    defineProps<{
      modelValue: PricePolicyQueryParam
      mapMode?: boolean
      canImport?: boolean
    }>(),
    { mapMode: false, canImport: false }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: PricePolicyQueryParam]
    query: []
    reset: []
    batch: []
    import: []
  }>()
  const model = props.modelValue
  const formRef = ref<FormInstance>()
  const provinceOptions = ref<Option[]>([])
  const bureauOptions = ref<Option[]>([])
  const policyTypeOptions = ref<Option[]>([])
  const containerTypeOptions = ref<Option[]>([])

  const toOptions = (items: Array<Record<string, unknown>>, province = false): Option[] =>
    items
      .map((item) => ({
        label: String(item.label ?? item.text ?? ''),
        value: String(province ? (item.label ?? '') : (item.value ?? item.label ?? ''))
      }))
      .filter((item) => item.label && item.value)

  const loadOptions = async () => {
    const results = await Promise.allSettled([
      getSystemDataShow('RailWayProvinceDictionary', '', 0, 0, '', true),
      getSystemDataShow('RailwayBureauSelect', '', 0, 0, '', true),
      GetDownMarkList('GoodPricePolicyType'),
      GetDownMarkList('GoodPricePolicyContainerType')
    ])
    if (results[0].status === 'fulfilled') provinceOptions.value = toOptions(results[0].value, true)
    if (results[1].status === 'fulfilled') bureauOptions.value = toOptions(results[1].value)
    if (results[2].status === 'fulfilled')
      policyTypeOptions.value = toOptions(results[2].value).filter((item) => item.value !== 'X')
    if (results[3].status === 'fulfilled')
      containerTypeOptions.value = toOptions(results[3].value).filter((item) => item.value !== 'X')
  }

  const handleStationChange = (_value: string, item?: StationSelection, arrival = false) => {
    if (!item) return
    if (arrival) {
      if (item.ProvinceName) model.arrivalProvince = item.ProvinceName
      if (item.RailwayBureauCode) model.arrivalBureau = item.RailwayBureauCode
    } else {
      if (item.ProvinceName) model.province = item.ProvinceName
      if (item.RailwayBureauCode) model.bureau = item.RailwayBureauCode
    }
  }
  const handleGoodsChange = (_value: string, item?: GoodsItems) => {
    model.goodsCode = item?.goodsCode || ''
    model.goodsName = item?.goodsName || ''
  }
  const handleQuery = () => {
    const message = props.mapMode ? validatePolicyMapQuery(model) : ''
    if (message) {
      ElMessage.warning(message)
      return
    }
    emit('update:modelValue', { ...model })
    emit('query')
  }

  onMounted(() => void loadOptions())
</script>

<style scoped lang="less">
  :deep(.el-select),
  :deep(.el-autocomplete),
  :deep(.el-input) {
    width: 100%;
  }

  .action-column {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
</style>
