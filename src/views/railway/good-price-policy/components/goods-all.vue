<template>
  <el-autocomplete
    v-model="text"
    clearable
    :fetch-suggestions="queryGoods"
    :placeholder="placeholder"
    @select="handleSelect"
    @clear="handleClear"
    @blur="handleBlur"
  >
    <template #default="{ item }">
      <span>{{ item.goodsName }}</span>
      <span class="goods-code">({{ item.goodsCode }})</span>
    </template>
  </el-autocomplete>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { getAllPolicyGoods } from '../api'
  import type { GoodsItems } from '../types'

  type GoodsSuggestion = GoodsItems & { value: string }

  const props = withDefaults(defineProps<{ modelValue?: string; placeholder?: string }>(), {
    modelValue: '',
    placeholder: '请输入品类/品名'
  })
  const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string, item?: GoodsItems]
  }>()

  const goods = ref<GoodsItems[]>([])
  let sequence = 0
  const text = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
  })

  const getGoodsName = (value: string) => value.replace(/\(\d+\)$/, '').trim()

  const queryGoods = async (value: string, callback: (items: GoodsSuggestion[]) => void) => {
    const keyword = getGoodsName(value)
    if (!keyword) {
      callback([])
      return
    }
    const current = ++sequence
    const [error, result] = await getAllPolicyGoods(keyword)
    if (current !== sequence || error) {
      callback([])
      return
    }
    goods.value = result
    callback(
      result
        .filter((item) => item.goodsName.includes(keyword))
        .sort((left, right) => {
          if (left.goodsName === keyword) return -1
          if (right.goodsName === keyword) return 1
          return left.goodsName.indexOf(keyword) - right.goodsName.indexOf(keyword)
        })
        .map((item) => ({ ...item, value: `${item.goodsName}(${item.goodsCode})` }))
    )
  }

  const handleSelect = (item: GoodsSuggestion) => {
    text.value = item.value
    emit('change', item.value, item)
  }

  const handleClear = () => emit('change', '')

  const handleBlur = () => {
    if (!text.value) return
    const matched = goods.value.find(
      (item) =>
        text.value === `${item.goodsName}(${item.goodsCode})` || text.value === item.goodsName
    )
    if (!matched) {
      text.value = ''
      emit('change', '')
    }
  }
</script>

<style scoped lang="less">
  .goods-code {
    margin-left: 4px;
    color: var(--el-text-color-secondary);
  }
</style>
