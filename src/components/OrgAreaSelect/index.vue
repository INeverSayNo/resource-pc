<template>
  <el-select
    v-model="companyId"
    v-bind="$attrs"
    clearable
    :filterable="filter"
    :disabled="disabled"
    style="width: 100%"
    :multiple="multiple"
    @change="companyChange"
  >
    <el-option
      v-for="item in companyItems"
      :key="item.name"
      :label="item.name"
      :value="item.organizationId"
    />
  </el-select>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted, PropType, ref } from 'vue'
  import { GetDcAreas } from '@/api/orgUser'

  export default defineComponent({
    name: 'OrgAreaSelect',
    props: {
      host: {
        type: String,
        default: () => ''
      },
      modelValue: {
        type: [String, Number, Object, Array] as PropType<any>,
        default: () => {
          return '' as any
        }
      },
      isAccessControl: {
        type: Boolean,
        default: () => true
      },
      isCommonlyUsed: {
        type: Boolean,
        default: () => false
      },
      isFilterUsing: {
        type: Boolean,
        default: () => true
      },
      filter: {
        type: Boolean,
        default: () => true
      },
      disabled: {
        type: Boolean,
        default: () => false
      },
      includeGroup: {
        type: Boolean,
        default: () => true
      },
      multiple: {
        type: Boolean,
        default: () => false
      },
      label: {
        type: String,
        default: () => ''
      }
    },
    emits: ['update:modelValue', 'change', 'update:label'],
    setup(props, ctx) {
      const companyItems = ref<any>([])
      const companyId = computed({
        get: () => {
          if (props.modelValue) {
            const name = getCompanyName(props.modelValue)
            ctx.emit('update:label', name)
          }
          return props.modelValue
        },
        set: (val) => {
          ctx.emit('update:modelValue', val)
          const name = getCompanyName(val)
          ctx.emit('update:label', name)
        }
      })
      const filter = ref<any>(props.filter)

      const queryCompanyList = async () => {
        const [err, res] = await GetDcAreas({
          isAccessControl: props.isAccessControl,
          includegroup: props.includeGroup,
          isFilterUsing: props.isFilterUsing,
          isCommonlyUsed: props.isCommonlyUsed
        })
        if (err || !Array.isArray(res)) return
        companyItems.value = res.filter(
          (e) => e.isCommonlyUsed && e.id === e.regionalCompanyRShipId
        )
      }

      onMounted(queryCompanyList)

      const companyChange = (value: any) => {
        companyId.value = value
        ctx.emit(
          'change',
          value,
          companyItems.value.find((it: any) => it.organizationId === value)
        )
      }
      const getCompanyName = (id: string | string[]) => {
        if (Array.isArray(id)) {
          return companyItems.value
            .filter((it: any) => id.includes(it.organizationId))
            .map((x: any) => x.name)
            .join(',')
        }
        return companyItems.value.find((it: any) => it.organizationId === id)?.name
      }
      // eslint-disable-next-line vue/no-dupe-keys
      return { companyItems, companyId, companyChange, filter, getCompanyName }
    }
  })
</script>
