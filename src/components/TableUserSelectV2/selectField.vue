<template>
  <div class="dc-user-table-select">
    <el-select
      v-model="selectValue"
      filterable
      remote
      reserve-keyword
      :remote-method="remoteMethod"
      :loading="loading"
      :multiple="multiple"
      v-bind="getBindValue"
      popper-class="dc-user-select-v3-popper"

    >
      <el-option
        v-for="(item, index) in cValue"
        :key="index"
        :label="item.label"
        :value="item.value"
      >
        <span style="float: left">{{ item.label }}({{ item.code }})</span>
        <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
          {{ item.areaName }}{{ item.organizationName ? `(${item.organizationName})` : '' }}
        </span>
      </el-option>
    </el-select>
    <span v-if="!disabled" class="search-icon" @click="showUser = true">
      <DAliIcon name="search" />
    </span>
    <table-user-select-v2
      v-model:visable="showUser"
      width="1000"
      :title="title"
      :multiple="multiple"
      :show-tree="showTree"
      :host="host"
      :is-reduce="isReduce"
      :is-main-account="isMainAccount"
      :include-out-side="includeOutSide"
      :remote-checked="selectOld"
      @select="handleLeaderChange"
      @close="showUser = false"
    />
  </div>
</template>

<script lang="ts">
  import { reactive, toRefs, defineComponent, computed, onMounted, nextTick, PropType } from 'vue'
  import tableUserSelectV2 from './index.vue'
  import { DcDeep } from '@dczy/tie-tools'
  import { GetOrgUsers } from '@/api/orgUser/index'
  type valueType = Record<
    'label' | 'value' | 'phone' | 'organizationName' | 'areaName' | 'code',
    string
  >

  export default defineComponent({
    name: 'UserSelectV2',
    components: {
      tableUserSelectV2,
    },
    props: {
      title: {
        type: String,
        default: () => '人员信息'
      },
      multiple: {
        type: Boolean,
        default: () => false
      },
      modelValue: {
        type: [Array, String] as PropType<Array<any> | string>,
        default: () => null
      },
      isMainAccount: {
        type: Boolean,
        default: () => false
      },
      showTree: {
        type: Boolean,
        default: () => true
      },
      host: {
        type: String,
        default: () => ''
      },
      disabled: {
        type: Boolean as PropType<boolean>,
        default: false
      },
      isReduce: {
        type: Boolean as PropType<boolean>,
        default: false
      },
      includeOutSide: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['update:modelValue', 'update:label', 'change'],
    setup(props, { emit, attrs }) {
      const { label, value, phone, organizationName, areaName, code } = {
        label: 'userName',
        value: 'id',
        phone: 'phone',
        organizationName: 'organizationName',
        areaName: 'currentAreaName',
        code: 'code'
      }
      const state = reactive({
        showUser: false,
        modelValueType: '',
        loading: false,
        selectOld: [] as any,
        all: [] as any,
        cValue: [] as Array<valueType>
      })
      // const selectValue = ref<any>();
      const selectValue = computed({
        get: () => {
          const val = props.modelValue
          if (val && val.length > 0) {
            if (!checkValueOptionsHasValue()) {
              remoteMethod('', val.toString().split(','), val)
            }
          }
          return val as any
        },
        set: (val) => {
          emit('update:modelValue', val)
          nextTick(() => {
            const { showLabel, data } = getLabels(val)
            emit('update:label', showLabel)
            emit('change', val, data)
          })
        }
      })
      onMounted(() => {
        state.modelValueType = typeof props.modelValue
      })
      /** 获取input 默认绑定属性 */
      const getBindValue = computed((): any => {
        const delArr: string[] = ['title', 'modelValue', 'multiple', 'filterable']
        const obj: Record<string, unknown> = { ...attrs, ...props }
        for (const key in obj) {
          if (delArr.indexOf(key) !== -1) {
            delete obj[key]
          }
        }
        return obj
      })

      /** 确认选中 */
      function handleLeaderChange(val: Array<any>) {
        setValue(val)
        state.showUser = false
      }

      async function remoteMethod(query: string, userIds: Array<string> = [], val: any) {
        const cacheData = getCahceData()
        if (cacheData?.length) {
          const self = cacheData.filter(
            (x: any) => userIds.includes(x.id) && (!query || x.userName.indexOf(query) !== -1)
          )
          if (self && self.length) {
            setTimeout(() => {
              setValue(self, true, val)
              if (userIds && userIds.length > 0) {
                nextTick(() => {
                  emit('update:label', getLabels(selectValue.value).showLabel)
                })
              }
            }, 10)
            return
          }
        }
        state.loading = true

        const [err, res] = await GetOrgUsers({
          distinct: true,
          keyWords: query,
          wechat: props.isMainAccount,
          includeOutSide: props.includeOutSide,
          ids: [],
          userIds
        }, "post")
        state.loading = false
        if (err || !Array.isArray(res?.rows)) return
         setValue(res.rows, true, val);
        if (userIds && userIds.length > 0) {
          nextTick(() => {
            emit('update:label', getLabels(selectValue.value).showLabel)
          })
        }
      }

      function getCahceData() {
        try {
          const cacheStr = sessionStorage.getItem('s_dc_orguser_all')
          if (cacheStr) {
            return JSON.parse(cacheStr)
          }
          return undefined
        } catch (error) {
          return undefined
        }
      }

      function setValue(data: any[], isQuery = false, val = undefined) {
        const temp = DcDeep.clone(
          state.cValue.filter((y) => {
            if (props.multiple) {
              return val
                ? (val as any).some((x: any) => x === y.value)
                : selectValue.value.some((x: any) => x === y.value)
            } else {
              return (val || selectValue.value) === y.value
            }
          })
        )
        if (data && data.length > 0) {
          data.forEach((x) => {
            if (!state.all.some((y: any) => y[value] === x[value])) {
              state.all.push(x)
            }
            if (!temp.some((y: any) => y.value === x[value])) {
              temp.push({
                value: x[value],
                label: x[label],
                phone: x[phone],
                organizationName: x[organizationName],
                areaName: x[areaName],
                code: x[code]
              })
            }
          })
          state.cValue = temp
          const first = data[0]
          if (props.multiple) {
            const valTemp = val ? DcDeep.clone(val) : DcDeep.clone(selectValue.value)
            if (isQuery) {
              if (data.length === 1 && !valTemp.some((x: any) => x === first[value])) {
                valTemp.push(first[value])
              }
            } else {
              data.forEach((x) => {
                if (!valTemp.some((y: any) => y === x[value])) {
                  valTemp.push(x[value])
                }
              })
            }
            if (!val) {
              nextTick(() => {
                selectValue.value = valTemp
              })
            }
          } else {
            if (!val) {
              nextTick(() => {
                if (data.length === 1) {
                  selectValue.value = first[value]
                }
              })
            }
          }
        } else {
          state.cValue = temp
        }
      }

      function getLabels(val: any) {
        let showLabel: any
        let data: any
        if (Array.isArray(val)) {
          val.forEach((v) => {
            const self = state.all.find((x: any) => x[value] === v)
            if (self) {
              if (!data) data = []
              data.push(DcDeep.clone(self))
              if (!showLabel) showLabel = []
              showLabel.push(self[label])
              if (!state.selectOld.some((y: any) => y[value] === v)) {
                state.selectOld.push(self)
              }
            }
          })
        } else {
          const self = state.all.find((x: any) => x[value] === val)
          if (self) {
            data = DcDeep.clone(self)
            showLabel = self[label]
            if (!state.selectOld.some((y: any) => y[value] === val)) {
              state.selectOld.push(self)
            }
          }
        }
        return { showLabel, data }
      }

      // 检查是否存在没有价值的值选项
      function checkValueOptionsHasValue() {
        let result = true
        const voption = state.cValue?.map((x: any) => x.value)
        if (props.multiple && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
          const temp = (props.modelValue || []).filter((x) => x)
          for (const key in temp) {
            const v = temp[key]
            if (!voption.some((vp) => vp === v)) {
              result = false
              break
            }
          }
        } else {
          result = Boolean(props.modelValue && voption.some((vp) => vp === props.modelValue))
        }
        return result
      }

      // watch(
      //   () => props.modelValue,
      //   (val) => {
      //     if (val && val.length > 0) {
      //       if (!checkValueOptionsHasValue()) {
      //         remoteMethod("", val.toString().split(","), val);
      //       } else {
      //         selectValue.value = val;
      //       }
      //     } else {
      //       selectValue.value = val;
      //     }
      //   },
      //   {
      //     immediate: true,
      //     deep: true
      //   }
      // );

      // watch(
      //   () => selectValue.value,
      //   (val) => {
      //     state.selectOld = [];
      //     nextTick(() => {
      //       const { showLabel, data } = getLabels(val);
      //       emit("update:modelValue", val);
      //       emit("update:label", showLabel);
      //       emit("change", val, data);
      //     });
      //   }
      // );

      return {
        ...toRefs(state),
        getBindValue,
        handleLeaderChange,
        selectValue,
        remoteMethod
      }
    }
  })
</script>

<style lang="less" scoped>
  .dc-user-table-select {
    width: 100%;
    position: relative;
    :deep(.el-select) {
      width: 100%;
      .el-input__inner {
        padding-right: 40px;
      }
      .el-input__suffix {
        right: 20px;
      }
    }

    .search-icon {
      cursor: pointer;
      color: #aeaeae;
      position: absolute;
      top: 0;
      right: 10px;
      z-index: 1;
      &:hover {
        color: #9e9e9e;
      }
    }
  }
</style>
<style>
  .dc-user-select-v3-popper {
    min-width: 400px;
  }
</style>
