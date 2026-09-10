<template>
  <DcGap class="bar with-input">
    <span>
      接取送达供应商
      <span class="theme-color">(共{{ total }}个)</span>
    </span>
    <div class="fr">
      <el-input
        v-model="query"
        class="mr-5px"
        style="width: 300px"
        placeholder="输入名称/联系人/电话,按回车键查询"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><DAliIcon name="search" /></el-button>
        </template>
      </el-input>
      <el-popconfirm
        class="dc-popconfirm"
        title="请选择新增供应商类型?"
        cancel-button-type="success"
        confirm-button-type="primary"
        confirm-button-text="企业"
        cancel-button-text="个体"
        @confirm="handleAdd('enterprise')"
        @cancel="handleAdd('person')"
      >
        <template #reference>
          <span class="bar-btn">
            <DAliIcon name="plus" class="" />
            新增
          </span>
        </template>
      </el-popconfirm>
      <slot name="headerButton"></slot>
    </div>
  </DcGap>
  <ElTable
    v-if="list.length"
    v-loading="loading"
    ref="tableRef"
    :data="list"
    :max-height="tableHeight"
    border
    stripe
    highlight-current-row
    flexible
  >
    <el-table-column
      type="index"
      label="序号"
      align="center"
      fixed="left"
      width="80"
    ></el-table-column>
    <el-table-column label="供应商名称" align="center" width="250" prop="supplier.supplierName">
      <template #default="{ row }">
        <p>
          <span>{{ row.supplier?.supplierName || '' }}</span>
          <br v-if="row.supplier?.isContract || row.supplier?.isChinaRailway" />
          <el-tag v-if="row.supplier?.supplierNatureName" type="primary" plain class="ml-10px">
            {{ row.supplier?.supplierNatureName }}
          </el-tag>
          <el-tag v-if="row.supplier?.isContract" type="success" class="ml-10px" plain>
            合同
          </el-tag>
          <el-tag v-if="row.supplier?.isChinaRailway" type="danger" class="ml-10px" plain>
            中铁供应商
          </el-tag>
          <el-tag
            v-for="item in row.supplier?.customTags"
            :key="item.id"
            type="warning"
            class="ml-10px mt-05px"
            plain
          >
            {{ item.tagValue }}
          </el-tag>
        </p>
      </template>
    </el-table-column>
    <el-table-column label="联系人" width="150" align="center" prop="supplier.contact">
      <template #default="scoped">
        {{ scoped.row.supplier?.contact }}
        <span
          v-if="scoped.row.supplier?.contactPhone"
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.supplier?.contactPhone).outerHTML"
        ></span>
      </template>
    </el-table-column>
    <el-table-column
      label="承接业务"
      align="center"
      width="200"
      prop="underTakingBusName"
    ></el-table-column>
    <el-table-column
      label="价格说明"
      align="center"
      width="200"
      prop="costDescription"
    ></el-table-column>
    <el-table-column label="合作均单价" width="120" align="center" prop="supplier.costPrice">
      <template #default="scoped">
        <span v-show="scoped.row.supplier?.costPirce">
          {{ scoped.row.supplier?.costPirce }}/{{ scoped.row.supplier?.costPirceUnit }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      label="合作次数"
      width="80"
      align="center"
      show-overflow-tooltip
      prop="supplier.cooperationNum"
    ></el-table-column>
    <el-table-column label="贡献者" align="center" width="180" prop="validDate">
      <template #default="scoped">
        {{ scoped.row.supplier?.contributorName }}
        <span
          v-if="scoped.row.supplier?.contributorPhone"
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.supplier?.contributorPhone).outerHTML"
        ></span>
      </template>
    </el-table-column>
    <el-table-column label="维护人员" align="center" width="180" prop="validDate">
      <template #default="scoped">
        {{ scoped.row.lastModifierName || scoped.row.creatorName }}
        {{
          scoped.row.lastModifierName
            ? formatTime(scoped.row.lastModificationTime, 'yyyy-MM-dd HH:mm')
            : formatTime(scoped.row.creationTime, 'yyyy-MM-dd HH:mm')
        }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="130" align="center">
      <template #default="scoped">
        <el-button
          type="text"
          style="color: var(--theme-success)"
          @click="handleShowDt(scoped.row)"
        >
          详情
        </el-button>
        <el-button type="text" style="color: var(--theme-color)" @click="handleEdit(scoped.row)">
          编辑
        </el-button>
        <el-button type="text" style="color: var(--theme-danger)" @click="handleDelete(scoped.row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </ElTable>
  <el-pagination
    class="table-pagination"
    :current-page="page"
    :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  <!-- 暂时屏蔽供应商新增和详情-->
  <EditForm
    ref="editFormRef"
    v-model="showEdit"
    :data="currentRow"
    :station-id="stationId"
    :station-name="stationName"
    :supplier-id="dtSupplierId"
    :supplier-nature="supplierNature"
    :update-channel="updateChannel"
    :auto-launch-org-select="autoLaunchOrgSelect"
    :type="type"
    @success="handleSuccess"
    @close-form-dialog="closeFormDialog"
    @show-detail="shwoDetail"
    @reload-edit-form="reloadEditForm"
    @clearFormSupplierId="clearSupplierId"
  ></EditForm>
  <SupplierDtDailog
    v-model:visable="showDt"
    :supplier-id="dtSupplierId"
    :owner-org-list="ownerOrgList"
    @update-info="updateInfo"
  ></SupplierDtDailog>
</template>

<script lang="ts">
  import { reactive, toRefs, defineComponent, ref, nextTick, onMounted, PropType } from 'vue'
  import { RailWaySupplerExDto } from '../types'
  import { SupplierNatureEnum } from '@/views/supplierV2/Enum'
  import DcGap from '@/components/Gap/index.vue'
  import EditForm from './supplierExForm.vue'
  import SupplierDtDailog from '@/views/supplierV2/dtDialog.vue'
  import { SupplierHeadDto, SupplierOwnerOrgShip } from '../../../supplierV2/types'
  import { formatTime } from '@/utils'
  import { GetStationSupplier, RemoveStationSupplier } from '../api'
  import { ElMessageBox, TableInstance } from 'element-plus'
  import { Message } from '@/components/Message'

  export default defineComponent({
    components: {
      DcGap,
      EditForm,
      SupplierDtDailog
    },
    props: {
      stationName: {
        type: String,
        default: () => ''
      },
      stationId: {
        type: String,
        default: () => ''
      },
      type: {
        type: String as PropType<'waterPort' | 'railwayStation'>,
        default: 'railwayStation'
      },
      tableHeight: {
        type: Number as PropType<number>,
        default: 360
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const showDt = ref(false)
      const dtSupplierId = ref('')
      const currentRow = ref<RailWaySupplerExDto>()
      const supplierNature = ref<'enterprise' | 'person'>('enterprise')
      const state = reactive({
        page: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        list: [] as RailWaySupplerExDto[],
        query: ''
      })

      function handleAdd(type: 'enterprise' | 'person') {
        updateChannel.value = 'outer'
        dtSupplierId.value = ''
        supplierNature.value = type
        currentRow.value = undefined
        showEdit.value = true
        autoLaunchOrgSelect.value = false
        // Message.warning("此功能暂未开放");
      }
      function handleEdit(row: RailWaySupplerExDto) {
        updateChannel.value = 'outer'
        dtSupplierId.value = row.supplerId
        autoLaunchOrgSelect.value = false
        ownerOrgList.value = []
        // Message.warning("此功能暂未开放");
        currentRow.value = row
        supplierNature.value =
          row.supplier.supplierNature === SupplierNatureEnum.Enum.Enterprise.id
            ? 'enterprise'
            : 'person'
        showEdit.value = true
      }
      function handleDelete(row: RailWaySupplerExDto) {
        ElMessageBox.confirm('是否删除选中行的供应商信息？').then(() => {
          RemoveStationSupplier(row.id).then((res) => {
            if (res) {
              Message.success('删除成功')
              loadSupplier()
            }
          })
        })
      }
      function handleShowDt(row: RailWaySupplerExDto) {
        updateChannel.value = 'outer'
        autoLaunchOrgSelect.value = false
        ownerOrgList.value = []
        dtSupplierId.value = row.supplerId
        showDt.value = true
      }
      function handleSuccess() {
        loadSupplier()
      }
      // 已存在供应商 展示详情信息

      const ownerOrgList = ref<Array<SupplierOwnerOrgShip>>([])
      const autoLaunchOrgSelect = ref(false)
      const updateChannel = ref<'outer' | 'inner'>('outer') // 更新方式,外部列表 or 搜索跳转详情
      const editFormRef = ref<any>(null)
      function shwoDetail(
        supplierHeadDto: SupplierHeadDto,
        supplierOwnerOrgShipDtos: Array<SupplierOwnerOrgShip>
      ) {
        updateChannel.value = 'inner'
        ownerOrgList.value = supplierOwnerOrgShipDtos
        dtSupplierId.value = supplierHeadDto.id
        showDt.value = true
      }

      function reloadEditForm(
        supplierHeadDto: SupplierHeadDto,
        supplierOwnerOrgShipDtos: Array<SupplierOwnerOrgShip>
      ) {
        updateChannel.value = 'inner'
        ownerOrgList.value = supplierOwnerOrgShipDtos
        dtSupplierId.value = supplierHeadDto.id
        editFormRef.value?.setState(dtSupplierId.value)
      }

      /*
       * @param launchOrg 是否需要自动展开组织机构
       */
      function updateInfo(launchOrg: boolean) {
        closeFormDialog('showDt')
        showEdit.value = true
        autoLaunchOrgSelect.value = launchOrg
      }
      function closeFormDialog(type: 'showEdit' | 'showDt') {
        nextTick(() => {
          if (type === 'showDt') {
            showDt.value = false
          } else {
            showEdit.value = false
          }
        })
      }
      function clearSupplierId() {
        dtSupplierId.value = ''
        console.log('clear')
        editFormRef.value?.setState('')
      }

      const tableRef = ref<TableInstance>()
      function loadSupplier() {
        state.loading = true
        GetStationSupplier({
          page: state.page,
          pageSize: state.pageSize,
          stationId: props.stationId,
          keyword: state.query
        })
          .then((res) => {
            state.total = res.totalCount || 0
            state.list = res.items || []
          })
          .finally(async () => {
            state.loading = false
            await nextTick()

            tableRef.value?.doLayout()

            requestAnimationFrame(() => {
              tableRef.value?.setScrollLeft(0)
            })
          })
      }
      function handleSizeChange(size: number) {
        state.pageSize = size
        loadSupplier()
      }
      function handleCurrentChange(page: number) {
        state.page = page
        loadSupplier()
      }

      function handleSearch() {
        state.page = 1
        loadSupplier()
      }
      onMounted(() => {
        loadSupplier()
      })

      return {
        ...toRefs(state),
        supplierNature,
        showEdit,
        currentRow,
        handleAdd,
        handleEdit,
        handleSuccess,
        showDt,
        dtSupplierId,
        handleShowDt,
        shwoDetail,
        closeFormDialog,
        ownerOrgList,
        updateInfo,
        autoLaunchOrgSelect,
        updateChannel,
        reloadEditForm,
        editFormRef,
        clearSupplierId,
        formatTime,
        handleCurrentChange,
        handleSizeChange,
        handleSearch,
        handleDelete,
        tableRef
      }
    }
  })
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
