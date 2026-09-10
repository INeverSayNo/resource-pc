<template>
  <DcGap class="bar">
    拜访记录
    <span class="theme-color">(共{{ listOptions.total }}个)</span>
    <span class="bar-btn fr" @click="visitAdd">
      <DAliIcon name="plus" />
      新增
    </span>
  </DcGap>
  <el-table
    v-loading="listOptions.loading"
    :data="list"
    :max-height="300"
    size="small"
    border
    stripe
    highlight-current-row
  >
    <el-table-column type="index" label="序号" align="center"></el-table-column>
    <el-table-column
      label="拜访方式"
      align="center"
      width="70"
      prop="visitExtendJson.visitType"
    ></el-table-column>
    <el-table-column
      align="center"
      width="70"
      label="拜访业务"
      prop="visitExtendJson.visitBusinessType"
    >
      <template #default="scoped">
        {{ scoped.row.visitExtendJson.visitBusinessType }}
      </template>
    </el-table-column>
    <el-table-column label="港口联系人" align="center" width="180" show-overflow-tooltip>
      <template #default="scoped">
        {{ scoped.row.visitExtendJson.contact }}
        <span
          v-if="scoped.row.visitExtendJson.contactPhone"
          v-clipboard:value="scoped.row.visitExtendJson.contactPhone"
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.visitExtendJson.contactPhone).outerHTML"
        ></span>
      </template>
    </el-table-column>
    <el-table-column label="拜访内容" prop="visitContent"></el-table-column>
    <el-table-column
      align="center"
      width="80"
      label="拜访人员"
      prop="visitUserName"
    ></el-table-column>
    <el-table-column align="center" width="90" label="拜访日期" prop="visitDate">
      <template #default="scoped">
        {{ formatTime(scoped.row.visitDate, 'yyyy-MM-dd') }}
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    class="table-pagination"
    :current-page="listOptions.page"
    :page-size="listOptions.pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="listOptions.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  <VisitRecordForm
    v-model:show="showEdit"
    :station-id="stationId"
    :station-name="stationName"
    :wharf-data="wharfData"
    :work-zone-data="workZoneData"
    :contact-data="contactData"
    @success="loadData"
  ></VisitRecordForm>
</template>
<script lang="ts">
  import { ref, defineComponent, reactive, onBeforeUnmount, onMounted } from 'vue'
  import { formatTime } from '@/utils'
  import DcGap from '@/components/Gap/index.vue'
  import VisitRecordForm from './visitRecordForm.vue'
  import { queryVisits } from '@/api/waterway-port'

  export default defineComponent({
    components: {
      DcGap,
      VisitRecordForm
    },
    props: {
      stationId: {
        type: String,
        default: () => ''
      },
      stationName: {
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
      },
      contactData: {
        type: Array as any,
        default: () => [] as any
      }
    },
    setup(props) {
      let requestSequence = 0
      const listOptions = reactive({
        page: 1,
        pageSize: 10,
        total: 0,
        loading: false
      })
      const list = ref<any>([])
      async function loadData() {
        const sequence = ++requestSequence
        const param = {
          page: listOptions.page,
          pageSize: listOptions.pageSize,
          businessId: props.stationId
        }
        listOptions.loading = true
        const [error, result] = await queryVisits(param)
        if (sequence !== requestSequence) return
        listOptions.loading = false
        if (!error) {
          listOptions.total = result.totalCount || 0
          list.value = result.items || []
        }
      }

      function handleSizeChange(size: number) {
        listOptions.pageSize = size
        loadData()
      }
      function handleCurrentChange(page: number) {
        listOptions.page = page
        loadData()
      }
      const showEdit = ref(false)
      function visitAdd() {
        showEdit.value = true
      }
      onMounted(() => {
        loadData()
      })
      onBeforeUnmount(() => {
        requestSequence += 1
      })
      return {
        showEdit,
        loadData,
        listOptions,
        list,
        handleSizeChange,
        handleCurrentChange,
        visitAdd,
        formatTime
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');
</style>
