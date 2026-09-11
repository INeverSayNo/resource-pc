<template>
  <com-dialog
    :model-value="visible"
    :width="800"
    title="优价货物品类/品名"
    :destroy-on-close="true"
    @close="visible = false"
  >
    <el-table :data="items" max-height="500" border stripe>
      <el-table-column align="center" label="序号" type="index" width="70" />
      <el-table-column align="center" label="编码" prop="goodsCode" />
      <el-table-column align="center" label="名称" prop="goodsName" />
      <el-table-column align="center" label="属性">
        <template #default="{ row }">
          <span :class="{ 'theme-danger': row.exclude }">{{
            row.exclude ? '不包含' : '包含'
          }}</span>
        </template>
      </el-table-column>
    </el-table>
  </com-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { GoodsItems, PolicyAllSimpleRecordDto } from '../types'

  const props = withDefaults(defineProps<{ show?: boolean; policy?: PolicyAllSimpleRecordDto }>(), {
    show: false,
    policy: () => ({})
  })
  const emit = defineEmits<{ 'update:show': [value: boolean] }>()
  const visible = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value)
  })
  const items = computed<GoodsItems[]>(() => [
    ...(props.policy.goods || []).map((item) => ({
      goodsCode: item.code,
      goodsName: item.name,
      exclude: false
    })),
    ...(props.policy.excludeGoods || []).map((item) => ({
      goodsCode: item.code,
      goodsName: item.name,
      exclude: true
    }))
  ])
</script>
