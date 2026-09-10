<template>
  <com-dialog
    v-model="show"
    :show-fullscreen="true"
    :draggable="true"
    :width="width"
    :title="title"
    :custom-class="'c-dialog'"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-container>
      <el-aside v-show="showTree" width="200px" class="org-tree">
        <el-scrollbar>
          <el-tree
            ref="orgTreeRef"
            :node-key="orgProps.value"
            :data="orgData"
            :props="orgProps"
            show-checkbox
            :height="208"
            :default-expanded-keys="defaultExpanded"
            @check="checkOrgan"
          />
        </el-scrollbar>
      </el-aside>
      <el-container>
        <el-main style="height: 500px; overflow: hidden; padding: 0">
          <div class="dc-table-v2">
            <el-row :gutter="20">
              <el-col :span="16" />
              <el-col :span="8">
                <el-input
                  v-model="keywords"
                  placeholder="请输入查询条件"
                  class="input-with-select"
                  @keyup.enter="getStaffList(checkedIds, keywords)"
                >
                  <template #append>
                    <div class="search-outer" @click="getStaffList(checkedIds, keywords)">
                      <DAliIcon name="search" class=""  />
                    </div>
                  </template>
                </el-input>
              </el-col>
            </el-row>
            <el-scrollbar>
              <el-table
                ref="staffTableRef"
                height="460"
                :data="staffData"
                style="width: 100%"
                stripe
                border
                highlight-current-row
                :row-key="getRowKey"
                @selection-change="select"
                @current-change="currentChange"
                @select-all="selectAll"
                @row-click="rowClick"
                @row-dblclick="rowDoubleClick"
              >
                <el-table-column
                  v-if="multiple"
                  type="selection"
                  align="center"
                  reserve-selection
                />
                <el-table-column property="userName" label="姓名" width="120" fixed="left" />
                <el-table-column property="code" label="工号" width="120" fixed="left">
                  <template #default="scope">
                    <div>
                      {{ scope.row.code || '暂无' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column v-if="!isReduce" property="logonName" label="登录名" width="150" />
                <el-table-column
                  property="phone"
                  label="联系电话"
                  width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  property="currentAreaName"
                  label="所属区域"
                  width="150"
                  show-overflow-tooltip
                />
                <el-table-column
                  v-if="showTree"
                  property="organizationName"
                  label="所属机构"
                  width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  v-if="!showTree && !isReduce"
                  property="organizationName"
                  label="所属机构"
                  show-overflow-tooltip
                />
              </el-table>
            </el-scrollbar>
          </div>
        </el-main>
        <el-footer style="height: auto">
          <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="pageSize"
            class="dc-pagination"
            small
            :page-sizes="[10, 20, 30, 40, 50, 100]"
            layout="prev, pager, next, jumper, total, sizes"
            :total="totalCount"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <div class="checked-staffs">
            <el-tag
              v-for="tag in checkedStaffs"
              :key="tag.userName"
              class="ml-2 mb-2"
              closable
              type="success"
              @close="removeStaffs(tag)"
            >
              {{ tag.userName }}
            </el-tag>
          </div>
        </el-footer>
      </el-container>
    </el-container>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </com-dialog>
</template>

<script lang="ts">
  import { ref, unref, watch, nextTick, computed, onMounted, defineComponent } from 'vue'
  import type { PropType } from 'vue'
  import { ElMessage, type ElTree } from 'element-plus'
  import { GetOrgList, GetOrgUsers } from '@/api/orgUser'

  type Tree = InstanceType<typeof ElTree>
  interface Table {
    data: TStaff[]
    clearSelection: () => void
    toggleRowSelection: (row: TStaff, selected?: boolean) => void
  }
  interface OrgNode {
    id: string
    OAId?: number
    children: OrgNode[]
  }
  export type TStaff = Record<'userName' | 'code' | 'logonName' | 'phone' | 'id', string> & {
    [prop: string]: string | number
  }
  interface Props {
    host: string
    width: string
    title: string
    visable: boolean
    multiple: boolean
    showTree: boolean
    remoteChecked: TStaff[]
    isReduce: boolean // 是否精简显示
    isMainAccount: boolean // 是否主账号
    includeOutSide: boolean // 是否包含外部用户
  }

  export default defineComponent({
    name: 'OrgUserSelectV2',
    components: {},
    props: {
      host: {
        type: String as PropType<string>,
        default: ''
      },
      visable: {
        type: Boolean as PropType<boolean>,
        default: false
      },
      width: {
        type: String as PropType<string>,
        default: '60%'
      },
      title: {
        type: String as PropType<string>,
        default: ''
      },
      remoteChecked: {
        type: Array as PropType<TStaff[] | Array<Partial<TStaff>>>,
        default: () => []
      },
      multiple: {
        type: Boolean,
        default: () => false
      },
      showTree: {
        type: Boolean,
        default: () => true
      },
      isReduce: {
        type: Boolean,
        default: () => false
      },
      isMainAccount: {
        type: Boolean,
        default: () => false
      },
      includeOutSide: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['update:visable', 'checkedStaff', 'select', 'close'],
    setup(props: Props, { emit }) {
      // #region 左侧机构树组件
      const orgTreeRef = ref<Tree | null>(null)
      const orgData = ref<OrgNode[]>([])
      const checkedIds = ref<string[]>([])
      const defaultExpanded = ref<any>([])
      const orgProps = {
        value: 'id',
        label: 'text',
        children: 'children'
      }
      const getOrgList = async () => {
        if (props.showTree) {
          const [err, res] = await GetOrgList()
          if (err || !res) return
          const { children } = JSON.parse(res) as { children: OrgNode[] }
          children[0].children.sort((x: OrgNode, y: OrgNode) => {
            return (x.OAId ?? 0) - (y.OAId ?? 0) > 0 ? -1 : 1
          })
          defaultExpanded.value = [children[0].id]
          orgData.value = children
        }
      }
      const checkOrgan = () => {
        if (orgTreeRef.value) {
          const checkNode = orgTreeRef.value.getCheckedNodes(false, false)
          const ids = checkNode.map((e: any) => e.id)
          checkedIds.value = ids
          getStaffList(ids, keywords.value)
        }
      }
      // #endregion

      // #region 右侧search & table
      const checkedStaffs = ref<TStaff[]>([])

      const keywords = ref('')
      const staffTableRef = ref<Table | null>(null)
      const staffData = ref<any>([])
      const getRowKey = (row: TStaff): string => row.id
      const getStaffList = async (ids: string[], keyword = '') => {
        const [err, res] = await GetOrgUsers(
          {
            distinct: true,
            page: currentPage.value,
            limit: pageSize.value,
            keywords: keyword,
            wechat: props.isMainAccount,
            includeOutSide: props.includeOutSide,
            ids
          },
          'post'
        )
        if (err || !res) return
        staffData.value = res.rows ?? []
        totalCount.value = res.total ?? 0
        nextTick(() => {
          const checked = JSON.parse(sessionStorage.getItem('_dc_yk_checkedStaffs') as string)
          if (checked) {
            staffTableRef.value?.clearSelection()
            checkedStaffs.value = checked
            checked.forEach((e: TStaff) => {
              const item = staffData.value.find((staff: TStaff) => staff.id === e.id)
              if (item) {
                staffTableRef.value?.toggleRowSelection(item, true)
              }
            })
          }
        })
      }
      const select = (staffs: any[]) => {
        const checked = staffs.filter(Boolean)
        checked.forEach((e: TStaff) => {
          if (checkedStaffs.value.every((item) => item.id !== e.id)) {
            checkedStaffs.value.push(e)
          }
        })
        const tableData = staffTableRef.value?.data as TStaff[]
        const unChecked = tableData.filter((e) => checked.every((item: any) => item.id !== e.id))
        checkedStaffs.value = checkedStaffs.value.filter((e) =>
          unChecked.every((item) => item.id !== e.id)
        )
        sessionStorage.setItem('_dc_yk_checkedStaffs', JSON.stringify(checkedStaffs.value))
      }
      const selectAll = (staffs: any[]) => {
        console.log(staffs)
      }
      const rowClick = (row: TStaff) => {
        if (props.multiple) {
          const isChecked = checkedStaffs.value.some((e) => e.id === row.id)
          if (isChecked) {
            checkedStaffs.value = checkedStaffs.value.filter((e) => e.id !== row.id)
          } else {
            checkedStaffs.value.push(row)
          }
          staffTableRef.value?.toggleRowSelection(row, !isChecked)
        }
      }
      // #endregion

      // #region 分页
      const currentPage = ref(1)
      const pageSize = ref(10)
      const totalCount = ref(0)
      const handleCurrentChange = (current: number) => {
        currentPage.value = current
        getStaffList(unref(checkedIds), keywords.value)
      }
      const handleSizeChange = (size: number) => {
        pageSize.value = size
        getStaffList(unref(checkedIds), keywords.value)
      }
      // #endregion

      // #region 已选中标签
      const removeStaffs = (tag: TStaff) => {
        checkedStaffs.value = checkedStaffs.value.filter((e) => e.id !== tag.id)
        sessionStorage.setItem('_dc_yk_checkedStaffs', JSON.stringify(checkedStaffs.value))
        staffTableRef.value?.toggleRowSelection(
          staffData.value.find((item: TStaff) => item.id === tag.id),
          false
        )
      }
      // #endregion

      // #region Dialog
      const show = computed({
        get: () => props.visable,
        set: (val) => {
          emit('update:visable', val)
        }
      })
      const handleDialog = () => {
        staffTableRef.value?.clearSelection()
        sessionStorage.removeItem('_dc_yk_checkedStaffs')
        // checkedStaffs.value = []
        staffData.value = []
        // checkedIds.value = []
        keywords.value = ''
        currentPage.value = 1
        pageSize.value = 10
      }
      const handleClose = () => {
        nextTick(() => {
          show.value = false
          emit('close')
          // handleDialog()
        })
      }
      const handleConfirm = () => {
        console.log(checkedStaffs.value)
        if (!checkedStaffs.value || !checkedStaffs.value.length) {
          ElMessage.warning('请至少选中一行数据')
          return
        }
        emit('select', checkedStaffs.value)
        // handleDialog()
      }
      function currentChange(row: TStaff) {
        if (!props.multiple) {
          checkedStaffs.value = [unref(row)]
          sessionStorage.setItem('_dc_yk_checkedStaffs', JSON.stringify(checkedStaffs.value))
          console.log(checkedStaffs.value)
        }
      }
      function rowDoubleClick(row: TStaff) {
        if (!props.multiple) {
          checkedStaffs.value = [row]
          nextTick(() => {
            handleConfirm()
          })
        }
      }
      // #endregion

      watch(
        () => props.visable,
        (val) => {
          if (val) {
            const remote = props.remoteChecked
            sessionStorage.setItem('_dc_yk_checkedStaffs', JSON.stringify(remote))
            getOrgList()
            getStaffList([])
          }
        }
      )

      // onMounted(() => {
      //   if (props.visable) {
      //     const remote = props.remoteChecked;
      //     sessionStorage.setItem("_dc_yk_checkedStaffs", JSON.stringify(remote));
      //     getOrgList();
      //     getStaffList([]);
      //   }
      // });

      onMounted(() => {
        window.onbeforeunload = () => {
          sessionStorage.removeItem('_dc_yk_checkedStaffs')
        }
      })
      // const select = (...arg: any[]) => {
      //   console.log(arg)
      // }
      return {
        orgTreeRef,
        orgData,
        orgProps,
        checkOrgan,
        staffTableRef,
        keywords,
        staffData,
        getStaffList,
        getRowKey,
        // handleSelectionChange,
        rowClick,
        currentPage,
        pageSize,
        totalCount,
        handleCurrentChange,
        handleSizeChange,
        checkedStaffs,
        checkedIds,
        removeStaffs,
        show,
        handleClose,
        handleConfirm,
        handleDialog,
        select,
        selectAll,
        currentChange,
        rowDoubleClick,
        defaultExpanded
      }
    }
  })
</script>
<style lang="less" scoped>
  .org-tree {
    max-height: 570px;
  }
  :deep(.el-tree > .el-tree-node > .el-tree-node__content > .is-leaf + .el-checkbox) {
    display: inline-block !important;
  }
  :deep(.el-tree > .el-tree-node > .el-tree-node__content .el-checkbox) {
    display: none;
  }
  :deep(.el-table__row) {
    cursor: pointer;
  }
  // :deep(.el-tree-node__content > .el-checkbox .el-checkbox__inner) {
  //   display: none;
  // }
  :deep(.el-input-group__append) {
    cursor: pointer;
  }
  :deep(.el-pagination__jump)::after {
    content: '/';
    display: inline-block;
    padding: 0 6px;
  }
  :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  }
  :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
  :deep(.el-table, .el-table__expanded-cell) {
    background-color: skyblue;
    background-color: transparent;
  }
  .dc-pagination {
    text-align: right;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .checked-staffs {
    margin-top: 0.5rem;
    min-height: 36px;
  }
  .search-outer {
    width: 3rem;
    margin: 0 -20px;
    text-align: center;
    line-height: 2rem;
  }
</style>
