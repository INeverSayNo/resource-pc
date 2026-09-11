<script setup lang="ts">
  import { computed, onMounted, reactive } from 'vue'
  import { getSystemDataShow } from '@/api/systemDataShowApi'
  import DcAreaCompanySelect from '@/components/OrgAreaSelect/index.vue'

  interface Option {
    label: string
    value: string
  }

  const emit = defineEmits<{
    query: [
      value: {
        keywords: string
        railwayBureau: string
        province: string
        areaCompany: string
        detailAddress: string
      }
    ]
  }>()

  const form = reactive({
    keywords: '',
    railwayBureauValue: '',
    railwayBureau: '',
    provinceValue: '',
    province: '',
    areaCompanyId: '',
    areaCompany: '',
    detailAddress: ''
  })

  const railwayOptions = reactive<Option[]>([])
  const provinceOptions = reactive<Option[]>([])
  const formModel = computed(() => form)

  const syncLabel = (key: 'railwayBureau' | 'province', value: string, options: Option[]) => {
    form[key] = options.find((item) => item.value === value)?.label || ''
  }

  const handleAreaChange = (_id: string, item?: { name?: string }) => {
    form.areaCompany = item?.name || ''
  }

  const submit = () => {
    emit('query', {
      keywords: form.keywords.trim(),
      railwayBureau: form.railwayBureau,
      province: form.province,
      areaCompany: form.areaCompany,
      detailAddress: form.detailAddress.trim()
    })
  }

  const reset = () => {
    Object.assign(form, {
      keywords: '',
      railwayBureauValue: '',
      railwayBureau: '',
      provinceValue: '',
      province: '',
      areaCompanyId: '',
      areaCompany: '',
      detailAddress: ''
    })
    submit()
  }

  onMounted(async () => {
    const [railways, provinces] = await Promise.allSettled([
      getSystemDataShow('RailwayBureauSelect', ''),
      getSystemDataShow('RailWayProvinceDictionary', '')
    ])
    if (railways.status === 'fulfilled') {
      railwayOptions.splice(0, railwayOptions.length, ...(railways.value || []))
    }
    if (provinces.status === 'fulfilled') {
      provinceOptions.splice(0, provinceOptions.length, ...(provinces.value || []))
    }
  })
</script>

<template>
  <el-form :model="formModel" inline class="filter-form" @submit.prevent="submit">
    <el-form-item>
      <el-input v-model="form.keywords" clearable placeholder="搜索关键字" @keyup.enter="submit" />
    </el-form-item>
    <el-form-item>
      <el-select
        v-model="form.railwayBureauValue"
        clearable
        filterable
        placeholder="铁路局"
        @change="syncLabel('railwayBureau', form.railwayBureauValue, railwayOptions)"
      >
        <el-option
          v-for="item in railwayOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select
        v-model="form.provinceValue"
        clearable
        filterable
        placeholder="省份"
        @change="syncLabel('province', form.provinceValue, provinceOptions)"
      >
        <el-option
          v-for="item in provinceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <DcAreaCompanySelect
        v-model="form.areaCompanyId"
        v-model:label="form.areaCompany"
        :is-access-control="false"
        :include-group="false"
        placeholder="请选择区域公司"
        @change="handleAreaChange"
      />
    </el-form-item>
    <el-form-item>
      <el-input
        v-model="form.detailAddress"
        clearable
        placeholder="详细地址"
        @keyup.enter="submit"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">
        <DAliIcon name="search" />
        查询
      </el-button>
      <el-button type="warning" @click="reset">
        <DAliIcon name="sync" />
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="less">
  .filter-form {
    padding: 16px 16px 0;
    border-radius: 8px;
    background: #fff;
  }

  :deep(.el-select),
  :deep(.el-input) {
    width: 210px;
  }
</style>
