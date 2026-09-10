<template>
  <DcGap class="bar with-input">
    <span>
      专用线业务办理范围
      <span class="theme-color">(共{{ list.length || 0 }}条 )</span>
    </span>
    <div class="fr">
      <el-input
        v-model="query"
        class="mr-5px"
        style="width: 150px"
        placeholder="请输入关键字查询"
        @keyup="handleSearch"
      ></el-input>
      <span v-show="allowAdd" class="bar-btn" @click="handleAdd">
        <DAliIcon name="plus" class="" />
        新增
      </span>
      <span class="bar-btn ml-10px" title="切换显示方式" @click="handleChangeShowType">
        <DAliIcon name="menu" class="" />
      </span>
    </div>
  </DcGap>
  <div class="private-line-content">
    <template v-if="selfList?.length">
      <template v-if="showType === 'details'">
        <PrivateLineItem
          v-for="(item, index) in selfList"
          :key="index"
          :show="index === 0"
          :private-line="item"
          @edit="handleEdit"
        ></PrivateLineItem>
      </template>
      <PrivateLineTable v-else :list="selfList" @edit="handleEdit"></PrivateLineTable>
    </template>
    <el-empty v-else :image-size="36"></el-empty>
  </div>
  <EditForm v-model="showEdit" :private-line="currentRow" @success="handleSuccess"></EditForm>
</template>

<script lang="ts">
  import { reactive, toRefs, defineComponent, PropType, nextTick, ref, watch } from 'vue'
  import { RailWayPrivatelLine } from '../types'
  import DcGap from '@/components/Gap/index.vue'
  import PrivateLineItem from './privateLineItem.vue'
  import PrivateLineTable from './privateLineTable.vue'
  import EditForm from './privateLineForm.vue'
  import { useRailwayStationStore } from '../store/index'
  import { DcDeep } from '@dczy/tie-tools'

  type stateProp = {
    showType: 'details' | 'list'
    showEdit: boolean
    currentRow: RailWayPrivatelLine | undefined
    query: string
  }

  export default defineComponent({
    components: {
      DcGap,
      PrivateLineItem,
      PrivateLineTable,
      EditForm
    },
    props: {
      list: {
        type: Array as PropType<Array<RailWayPrivatelLine>>,
        default: () => []
      },
      stationId: {
        type: String,
        default: () => ''
      },
      allowAdd: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const railwayStationStore = useRailwayStationStore()
      const selfList = ref<RailWayPrivatelLine[]>([])
      const state = reactive<stateProp>({
        showType: 'list',
        showEdit: false,
        currentRow: undefined,
        query: ''
      })
      function handleChangeShowType() {
        state.showType = state.showType === 'details' ? 'list' : 'details'
      }
      function handleEdit(row: RailWayPrivatelLine) {
        state.currentRow = DcDeep.clone<RailWayPrivatelLine>(row)
        state.showEdit = true
      }

      function handleAdd() {
        state.currentRow = {
          stationId: props.stationId
        } as RailWayPrivatelLine
        nextTick(() => {
          state.showEdit = true
        })
      }

      function handleSuccess() {
        emit('reload')
      }
      function handleSearch() {
        const temp = DcDeep.clone<RailWayPrivatelLine[]>(props.list || [])
        selfList.value = temp
          .filter(
            (x) =>
              x.address?.includes(state.query) ||
              x.name?.includes(state.query) ||
              x.num?.includes(state.query) ||
              x.chargeRemark?.includes(state.query) ||
              x.containerArriveHS?.includes(state.query) ||
              x.containerSendHS?.includes(state.query) ||
              x.sendCategory?.includes(state.query) ||
              x.arriveCategory?.includes(state.query) ||
              x.contacts?.includes(state.query)
          )
          .sort((x, y) => {
            return x.lineType > y.lineType ? -1 : 1
          })
      }

      watch(
        () => props.list,
        (val) => {
          selfList.value = DcDeep.clone<RailWayPrivatelLine[]>(val || []).sort((x, y) => {
            return x.lineType > y.lineType ? -1 : 1
          })
          railwayStationStore.setPrivateLineList(val || [])
        },
        { immediate: true, deep: true }
      )
      return {
        ...toRefs(state),
        handleChangeShowType,
        handleEdit,
        handleSuccess,
        handleAdd,
        handleSearch,
        selfList
      }
    }
  })
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
