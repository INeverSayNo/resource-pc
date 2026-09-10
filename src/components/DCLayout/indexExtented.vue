<template>
  <el-container class="dt-container">
    <el-header v-if="showMoreQuery" :class="{ 'dt-query-container': true,  }">
      <div :style="showQuery ? 'margin-bottom:10px;' : ''">
        <span style="cursor: pointer" @click="handleOptionShowQuery">
          <DAliIcon name="search" class="" :title="showQuery ? '点击隐藏' : '点击显示'"  />
          查询条件
        </span>
        <span v-if="$slots.queryBarCenter">
          <slot name="queryBarCenter"></slot>
        </span>
        <DAliIcon
          :title="showQuery ? '隐藏' : '显示'"
          :name="showQuery ? 'arrow-up' : 'arrow-down'"
          class="fr query-show-action"
          @click="handleOptionShowQuery"
         />
      </div>
      <div v-show="showQuery">
        <el-form
          v-if="!$slots.defineQueryform"
          ref="queryFrom"
          :size="queryFormProps.size"
          inline
          :label-width="queryFormProps.labelWidth"
          :label-suffix="queryFormProps.labelSuffix"
        >
          <slot name="queryform" />
          <el-form-item>
            <div
              :style="
                $slots.querybutton
                  ? 'text-align:right;'
                  : `margin-left: ${queryFormProps.btnLabelWidth || '120px'}`
              "
            >
              <slot name="querybutton" />
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button type="warning" @click="handleQueryReset"> 重置 </el-button>
            </div>
          </el-form-item>
          <slot name="querybutton2" />
        </el-form>
        <div v-else>
          <slot name="defineQueryform" />
        </div>
      </div>
    </el-header>
    <el-header v-if="showBar" :class="{ 'dt-header': true, 'top-hidden': !showMoreQuery }">
      <!--操作按钮和快速查询区域-->
      <el-form inline @submit.prevent>
        <el-row>
          <el-col :span="showQuickQuery ? 12 : 24">
            <el-form-item>
              <el-button-group>
                <slot name="buttonGroup" />
                <el-button
                  v-if="showExportBtn"
                  type="success"
                  @click="handleExportExcelDialog"
                >
                  <DAliIcon name="circle-check" />
                  导出
                </el-button>
              </el-button-group>
            </el-form-item>
          </el-col>
          <el-col v-if="showQuickQuery" :span="12" style="text-align: right">
            <el-form-item class="quick-query">
              <el-input
                v-model="keyWords"
                placeholder="请输入关键字"
                clearable
                @keypress.enter="handleQuickQuery"
                @clear="quickClear"
              >
                <template #append>
                  <el-button @click="handleQuickQuery"><DAliIcon name="search" /></el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-header>
    <el-main class="dt-main-container">
      <el-container style="height: 100%">
        <el-main class="main-container" style="height: calc(100% - 5px)">
          <slot
            name="main"
            v-bind="{
              data: MytableData,
              loading: myLoading,
              total: Mytotal,
              height: tableHeight
            }"
          />
          <!--表格-->
          <el-table
            v-if="
              !$slots.main &&
              ((columns && columns.length > 0) || $slots.customColumn || $slots.customColumnBefore)
            "
            ref="tableRef"
            v-loading="myLoading"
            :border="border"
            stripe
            width="100%"
            highlight-current-row
            :data="MytableData"
            :height="tableHeight"
            tooltip-effect="dark"
            class="layout-table"
            row-key="__guid"
            :row-style="rowStyle"
            :show-summary="showSummary"
            :summary-method="summaryArray"
            v-bind="tableAttrs"
            @select="handleSelectRow"
            @row-click="handleCurrentRowClick"
            @current-change="handleCurrentRowChange"
            @selection-change="handleSelectionChange"
            @row-dblclick="handleRowDblClick"
            @expand-change="handleExpandChange"
            @cell-click="handeCellClick"
          >
            <el-table-column v-if="showExpand" align="center" type="expand">
              <template #default="props">
                <slot name="childTableExpand" :row="props.row" />
              </template>
            </el-table-column>
            <el-table-column v-if="selection" type="selection" width="50" align="center" />
            <slot name="customColumnBefore" />
            <el-table-column
              v-if="showIndex"
              label="序号"
              fixed
              type="index"
              width="70"
              align="center"
            />
            <template v-for="(item, index) in columns" :key="index">
              <el-table-column
                v-if="!item.hidden"
                :show-overflow-tooltip="
                  item.showOverflowTooltip || typeof item.showOverflowTooltip === 'undefined'
                "
                v-bind="item"
                :prop="item.name"
                :label="item.label"
                :fixed="item.fixed"
                :width="item.width"
                :sortable="item.sortable"
                :formatter="item.formatter"
                :align="item.align"
                :class-name="item.classname"
              >
                <template v-if="item.children && item.children.length > 0" #default>
                  <template v-for="(citem, cindex) in item.children" :key="cindex">
                    <el-table-column
                      v-if="!citem.hidden"
                      :key="cindex"
                      :show-overflow-tooltip="
                        citem.showOverflowTooltip ||
                        typeof citem.showOverflowTooltip === 'undefined'
                      "
                      v-bind="citem"
                      :prop="citem.name"
                      :label="citem.label"
                      :fixed="citem.fixed"
                      :width="citem.width"
                      :sortable="citem.sortable"
                      :formatter="citem.formatter"
                      :align="citem.align"
                      :class-name="citem.classname"
                    >
                      <template #default="scope">
                        <div v-if="item.type === 'img-upload'">
                          <file-down-view
                            v-for="(file, idx) in scope.row[item.name!]"
                            :key="idx"
                            :text="file.name"
                            :path="file.url"
                            :down="false"
                          />
                        </div>
                        <div
                          v-else-if="citem.type === 'html'"
                          @click="(e) => triggerClick(e, scope.row)"
                          v-html="
                            citem.formatter
                              ? citem.formatter(scope.row, scope.column, scope.row[citem.name!])
                              : scope.row[citem.name!]
                          "
                        />
                        <span v-else-if="citem.type === 'slot'">
                          <slot :name="citem.name" v-bind="{ ...scope }"></slot>
                        </span>
                        <span v-else-if="citem.isHighlight">
                          <dc-highlight
                            tag="span"
                            :keys="gethighlightText(citem, scope)"
                            :color="highlightcolor"
                          >
                            {{
                              citem.formatter
                                ? citem.formatter(scope.row, scope.column, scope.row[citem.name!])
                                : scope.row[citem.name!]
                            }}
                          </dc-highlight>
                        </span>
                        <span v-else>
                          {{
                            citem.formatter
                              ? citem.formatter(scope.row, scope.column, scope.row[citem.name!])
                              : scope.row[citem.name!]
                          }}
                        </span>
                      </template>
                    </el-table-column>
                  </template>
                </template>
                <template v-else #default="scope">
                  <div v-if="item.type === 'img-upload'">
                    <file-down-view
                      v-for="(file, idx) in scope.row[item.name!]"
                      :key="idx"
                      :text="file.name"
                      :path="file.url"
                      :down="false"
                    />
                  </div>
                  <div
                    v-else-if="item.type === 'html'"
                    @click="(e) => triggerClick(e, scope.row)"
                    v-html="
                      item.formatter
                        ? item.formatter(scope.row, scope.column, scope.row[item.name])
                        : scope.row[item.name]
                    "
                  />
                  <span v-else-if="item.type === 'slot'">
                    <slot :name="item.name" v-bind="{ ...scope }"></slot>
                  </span>
                  <span v-else-if="item.isHighlight">
                    <dc-highlight
                      tag="span"
                      :keys="gethighlightText(item, scope)"
                      :color="highlightcolor"
                    >
                      {{
                        item.formatter
                          ? item.formatter(scope.row, scope.column, scope.row[item.name])
                          : scope.row[item.name]
                      }}
                    </dc-highlight>
                  </span>
                  <span v-else>
                    {{
                      item.formatter
                        ? item.formatter(scope.row, scope.column, scope.row[item.name])
                        : scope.row[item.name]
                    }}
                  </span>
                </template>
              </el-table-column>
            </template>
            <slot name="customColumn" />
            <el-table-column
              v-if="operate.show"
              label="操作"
              :width="operate.width || '180'"
              align="center"
              fixed="right"
            >
              <template #default="scope">
                <slot :row="scope.row" :index="scope.$index" name="operate" />
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else-if="!$slots.main" description="暂无数据" />
          <!--分页 :layout="'total, sizes, prev, pager, next, jumper'" 有bug-->
          <el-pagination
            v-if="showPagination && columns && columns.length > 0"
            class="table-pagination"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="Mytotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <!--编辑弹窗-->
          <com-dialog
            v-bind="dialogAttr"
            :show-fullscreen="true"
            :model-value="showDialog"
            :width="dialogWidth"
            :title="title"
            :destroy-on-close="true"
            :close-on-click-modal="false"
            @close="handleClose"
          >
            <slot name="editform" />
            <template #footer>
              <span class="dialog-footer">
                <slot name="eidtfooter" />
                <template v-if="!$slots.eidtfooter">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    保存
                  </el-button>
                </template>
              </span>
            </template>
          </com-dialog>
          <!--详情弹窗-->
          <com-dialog
            :show-fullscreen="true"
            :model-value="showDetails"
            :width="dialogDtWidth"
            :title="dtTitle"
            :destroy-on-close="true"
            :close-on-click-modal="false"
            @open="handleDtOpen"
            @close="handleDtClose"
          >
            <el-descriptions
              v-if="dtCloumns && dtCloumns.length > 0"
              class="margin-top"
              :column="dtCloumnNum"
              :direction="direction"
              border
            >
              <template v-for="(item, index) in showDtData" :key="index">
                <el-descriptions-item :span="item.span">
                  <template #label>
                    <i v-if="item.icon" :class="item.icon" />
                    {{ item.label }}
                  </template>
                  <div :style="item.minWidth ? `min-width:${item.minWidth}px` : ''">
                    <span
                      v-if="item.type === 'html'"
                      class="html"
                      v-html="item.formatter ? item.formatter(item.value, item) : item.value"
                    />
                    <span v-else-if="item.type === 'slot'" class="html">
                      <slot :name="`${item.name}_Dt`"></slot>
                    </span>
                    <span v-else-if="item.type === 'img-upload'">
                      <file-down-view
                        v-for="(file, idx) in item.value"
                        :key="idx"
                        :text="file.name"
                        :path="file.url"
                        :down="true"
                      />
                    </span>
                    <span v-else-if="item.isHighlight">
                      <dc-highlight
                        tag="span"
                        :keys="gethighlightText_detail(item)"
                        :color="highlightcolor"
                      >
                        {{ item.formatter ? item.formatter(item.value, item) : item.value }}
                      </dc-highlight>
                    </span>
                    <span v-else>
                      {{ item.formatter ? item.formatter(item.value, item) : item.value }}
                    </span>
                  </div>
                </el-descriptions-item>
              </template>
            </el-descriptions>
            <slot name="detailsExtented" />
          </com-dialog>
          <!-- 导出弹窗 -->
          <com-dialog
            v-model="dialogExportVisible"
            :width="650"
            :title="'导出选项'"
            :close-on-click-modal="false"
          >
            <el-transfer
              v-model="selectExportFields"
              :data="exportFields"
              :titles="['待选字段', '已选字段']"
            />
            <template #footer>
              <el-button size="medium" @click="() => (dialogExportVisible = false)">
                取消
              </el-button>
              <el-button
                type="success"
                size="medium"
                :loading="exportCurrPageBtnLoading"
                @click="handleExportExcel(false)"
              >
                导出本页
              </el-button>
              <el-button
                type="primary"
                size="medium"
                :loading="exportAllBtnLoading"
                @click="handleExportExcel(true)"
              >
                导出全部
              </el-button>
            </template>
          </com-dialog>
          <slot name="default" />
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, ref, watchEffect, watch, reactive, toRefs, computed } from 'vue'
  import DcHighlight from '../Highlight/index.vue'
  import FileDownView from '../FileDownView/index.vue'
  import { defaultProps, type IEmits, type IProps } from './type'
  import { ElMessage } from 'element-plus'
  import { DcCommon, DcDate } from '@dczy/tie-tools'
  import { ExportExcel, QueryByPage } from './api'

  defineOptions({ name: 'DcLayout' })

  const props = withDefaults(defineProps<IProps>(), defaultProps)
  const emit = defineEmits<IEmits>()

  const state = reactive({
    dialogExportVisible: false,
    exportCurrPageBtnLoading: false,
    exportAllBtnLoading: false,
    exportFields: [] as any,
    selectExportFields: [] as any,
    selectionRows: [] as any
  })
  const {
    dialogExportVisible,
    exportCurrPageBtnLoading,
    exportAllBtnLoading,
    exportFields,
    selectExportFields
  } = toRefs(state)
  const keyWords = ref<string>('')
  const currentPage = ref(1)
  const currentPageSize = ref(props.pageSize || 20)

  const showQuery = ref<boolean>(false)
  const Mytotal = ref(0)
  const MytableData = ref<any>([])
  const tableHeight = ref(500)
  const vLoading = ref<any>(false)
  const myLoading = computed(() => {
    if (!props.apiController) return props.loading
    return vLoading.value
  })

  const localSumData = ref<any>()

  watchEffect(() => {
    if (!props.apiController) {
      Mytotal.value = props.total || 0
      MytableData.value = props.tableData || []
      MytableData.value?.forEach((item: any) => {
        item['__guid'] = DcCommon.guid()
        if (props.showExpand) {
          item['expanded'] = false
        }
      })
      //currentPageSize.value = props.pageSize || 20;
    }
  })
  watch(
    () => props.sumData,
    () => {
      localSumData.value = props.sumData
    },
    { immediate: true }
  )
  const handleQuickQuery = () => {
    loadData()
    emit('search', keyWords.value)
  }
  const handleClose = () => {
    emit('update:showDialog', false)
    nextTick(() => {
      emit('close')
    })
  }
  const handleSizeChange = (size: number) => {
    currentPageSize.value = size
    nextTick(() => {
      loadData()
      emit('pageChange', currentPage.value, size)
    })
  }
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    nextTick(() => {
      loadData()
      emit('pageChange', page, currentPageSize.value)
    })
  }
  const handleSubmit = () => {
    emit('submit')
  }
  const handleSelectionChange = (rows: any) => {
    emit('selectRows', rows)
  }

  const handleSelectRow = (_selection: any[], _row: any) => {
    // console.log(selection, row);
  }
  const clearSelectionRows = () => {
    tableRef.value.clearSelection()
  }

  const handleDtClose = () => {
    emit('update:showDetails', false)
    emit('dtclose')
  }

  const showDtData = computed(() => {
    const { dtCloumns, dtData } = props
    const showData: any = []
    if (dtCloumns && dtData) {
      for (const key in dtCloumns) {
        if (!dtCloumns[key].hidden) {
          const span = Number(dtCloumns[key].span || 1)
          let value = dtData[dtCloumns[key].name]
          if (dtCloumns[key].dtFormatter) {
            value = dtCloumns[key].dtFormatter(dtData[dtCloumns[key].name], dtData)
          } else {
            if (dtCloumns[key].formatter) {
              try {
                value = dtCloumns[key].formatter(dtData[dtCloumns[key].name], dtData)
              } catch (error) {
                value = dtCloumns[key].formatter(dtData, key, dtData[dtCloumns[key].name])
              }
            }
          }
          showData.push({
            name: dtCloumns[key].name,
            columnName: key,
            label: dtCloumns[key].label,
            value: value,
            icon: dtCloumns[key].icon || '',
            span: span,
            type: dtCloumns[key].type || 'html',
            minWidth: dtCloumns[key].dtItemMinWidth || ''
          })
        }
      }
      console.log(dtCloumns, dtData, showData)

      return showData
    } else {
      return [{ label: '数据错误', value: '', span: 1 }]
    }
  })

  const handleDtOpen = () => {
   
  }

  const handleOptionShowQuery = () => {
    showQuery.value = !showQuery.value
    emit('showQuery', showQuery.value)
  }
  const handleQuery = () => {
    loadData()
    emit('query')
  }
  const handleQueryReset = () => {
    emit('update:queryData', {})
    nextTick(() => {
      emit('queryReset')
    })
  }
  const handleCurrentRowClick = (row: any) => {
    if (props.selection) {
      const tRef = tableRef.value
      if (!props.tableMultiple) {
        if (tRef) {
          tRef.clearSelection()
          tRef.toggleRowSelection(row, true)
        }
      } else {
        const old = [...state.selectionRows]
        const hasAdd = old.findIndex((it: any) => it.__guid === row.__guid)
        tRef.toggleRowSelection(row, hasAdd === -1)
        if (hasAdd === -1) {
          old.push(row)
        } else {
          old.splice(hasAdd, 1)
        }
        state.selectionRows = old
      }
    }
  }
  const handleCurrentRowChange = (row: any) => {
    emit('current-change', row)
  }
  const tableRef = ref<any>(null)
  // 列表行双击事件
  const handleRowDblClick = (row: any) => {
    row.expanded = !row.expanded
    tableRef.value.toggleRowExpansion(row, row.expanded)
    emit('row-dblclick', row)
  }
  // 表格展开
  const handleExpandChange = (row: any, expand: boolean) => {
    emit('expand-change', row, expand)
  }
  const count = ref(0)
  // 组件内加载数据
  const loadData = async () => {
    MytableData.value = []
    if (!props.apiController) return
    count.value += 1
    let postQuery: Record<string, any> = {}
    // 解析日期范围类的参数
    if (props.queryDateColumn.length > 0) {
      for (const key in props.queryData) {
        const isDateCol = props.queryDateColumn.find((col: any) => col === key)

        if (isDateCol) {
          if (props.queryData[key] && props.queryData[key].length === 2) {
            let sformat = 'YYYY-MM-DD'
            if (props.queryData[key][0].length > 10) {
              sformat = 'YYYY-MM-DDTHH:mm:ss'
            }
            postQuery[`S${key}`] = DcDate.format(props.queryData[key][0], sformat)
            let eformat = 'YYYY-MM-DDT23:59:59'
            if (props.queryData[key][0].length > 10) {
              eformat = 'YYYY-MM-DDTHH:mm:ss'
            }
            postQuery[`E${key}`] = DcDate.format(props.queryData[key][1], eformat)
          }
        } else {
          if (typeof props.queryData[key] === 'string') {
            if (props.queryData[key]) postQuery[key] = props.queryData[key]
          } else {
            postQuery[key] = props.queryData[key]
          }
        }
      }
    } else {
      const param: any = {}
      for (const key in props.queryData) {
        if (typeof props.queryData[key] === 'string') {
          if (props.queryData[key]) param[key] = props.queryData[key]
        } else {
          param[key] = props.queryData[key]
        }
      }
      postQuery = { ...param }
    }

    const paramA = {
      page: currentPage.value || 1,
      pageSize: currentPageSize.value || 20,
      KeyWords: keyWords.value,
      ...postQuery
    }
    vLoading.value = true

    const [, res] = await QueryByPage(props.apiController, paramA)
    vLoading.value = false
    Mytotal.value = res.data.totalCount
    MytableData.value = res?.data?.items || []
    MytableData.value?.forEach((item: any) => {
      item['__guid'] = DcCommon.guid()
      if (props.showExpand) {
        item['expanded'] = false
      }
    })
    // 总计行
    if (res.sumdata) {
      localSumData.value = res.sumdata
    }
  }
  // 监听高级查询功能元素大小变化，重算table高度
  // @ts-ignore
  const observer = new ResizeObserver(() => {
    getTableHeight()
    /*
    entries.forEach((entry) => {
      getTableHeight()
    })
    */
  })
  // 计算高度
  const getTableHeight = () => {
    if (props.fixTableHeight.isFixed) {
      tableHeight.value = props.fixTableHeight.height
      return
    }
    const queryEl = document.getElementsByClassName('main-container')[0]
    if (queryEl) {
      const point = queryEl.getBoundingClientRect()
      const relHeight =
        document.body.getBoundingClientRect().height - point.y - (props.showPagination ? 65 : 20)
      const elAll = document.querySelectorAll('.layout-table .el-table__body-wrapper')!
      if (elAll && elAll.length > 0) {
        elAll.forEach((el) => {
          const bodyEl = el.querySelectorAll('.el-table__body')
          bodyEl.forEach((x) => {
            if (x.clientHeight > el.clientHeight) {
              let style = el.getAttribute('style') || ''
              if (style.indexOf('overflow:hidden') !== -1) {
                style = style.replace('overflow:hidden', 'overflow:auto')
              } else {
                style += 'overflow:auto;'
              }
              el.setAttribute('style', style)
            }
          })
        })
      }
      tableHeight.value = relHeight
      emit('mainResize', relHeight)
    }
  }
  // 导出
  const handleExportExcelDialog = () => {
    state.exportFields = props.columns.map((item: any) => {
      return {
        key: item.name,
        label: item.label,
        disabled: false
      }
    })
    const systemFields = [
      'id',
      'isScrap',
      'creatorId',
      'creatorName',
      'creationTime',
      'organizationId',
      'organizationRelationshipId',
      'organizationCode',
      'organizationRelationshipCode',
      'organizationName'
    ]

    state.selectExportFields = state.exportFields
      .filter((item: any) => {
        return systemFields.indexOf(item.key) === -1
      })
      .map((item: any) => {
        return item.key
      })
    state.dialogExportVisible = true
  }
  const handleExportExcel = (isExportAll: boolean) => {
    if (!props.apiController) return
    if (state.selectExportFields.length === 0) {
      ElMessage.warning('请选择导出字段')
      return false
    }
    let postQuery: Record<string, any> = { page: undefined }
    // 解析日期范围类的参数
    if (props.queryDateColumn.length > 0) {
      for (const key in props.queryData) {
        const isDateCol = props.queryDateColumn.find((col: any) => col === key)
        if (isDateCol) {
          if (props.queryData[key] && props.queryData[key].length === 2) {
            let sformat = 'YYYY-MM-DD'
            if (props.queryData[key][0].length > 10) {
              sformat = 'YYYY-MM-DDTHH:mm:ss'
            }
            postQuery[`S${key}`] = DcDate.format(props.queryData[key][0], sformat)
            let eformat = 'YYYY-MM-DDT23:59:59'
            if (props.queryData[key][0].length > 10) {
              eformat = 'YYYY-MM-DDTHH:mm:ss'
            }
            postQuery[`E${key}`] = DcDate.format(props.queryData[key][1], eformat)
          }
        } else {
          postQuery[key] = props.queryData[key]
        }
      }
    } else {
      postQuery = { ...props.queryData }
    }
    const ExportFields: any = {}
    state.exportFields
      .filter((el: any) => {
        return state.selectExportFields.indexOf(el.key) !== -1
      })
      .forEach((item: any) => {
        ExportFields[item.key] = item.label
      })
    const param = {
      ...postQuery,
      KeyWords: keyWords.value,
      ExportFields: ExportFields
    } as any
    if (isExportAll) {
      param.IsAllPage = true
    } else {
      param.IsAllPage = false
      param.page = postQuery.page ? postQuery.page : currentPage.value || 1
      param.pageSize = currentPageSize.value || 20
    }

    ExportExcel(
      props.exportExcelAction,
      param,
      'POST',
      true,
      (props.exportExcelFileName || '未知名称') + '.xlsx'
    )
  }

  const getSelectRows = () => {
    return state.selectionRows
  }

  const handeCellClick = (row: any, column: any, cell: any, event: any) => {
    emit('cellClick', row, column, cell, event)
  }

  const summaryArray = (param: any) => {
    const { columns } = param
    console.log('summaryArray', localSumData.value)

    const sums: any[] = []
    columns.forEach((column: any, index: number) => {
      // index:0为复选框,1为序号，以2为“总计”为文本
      if (index === props.summaryIndex) {
        sums[index] = '总计'
        return
      }
      if (column.property && localSumData.value) {
        if (localSumData.value[column.property]) {
          sums[index] = Number(localSumData.value[column.property])
          if (props.summaryType === 'float') {
            sums[index] = sums[index].toFixed(2)
          }
        } else {
          sums[index] = ''
        }
      } else {
        sums[index] = ''
      }
    })
    return sums
  }

  watch(
    () => props.queryDefaultShow,
    (val) => {
      showQuery.value = val
    },
    { immediate: true }
  )

  onMounted(() => {
    window.onresize = () => {
      getTableHeight()
    }
    if (props.autoLoad) {
      loadData()
    }
    const queryEls = document.getElementsByClassName('dt-query-container')
    if (queryEls?.length) {
      observer.observe(queryEls[0])
    }
    setTimeout(() => {
      getTableHeight()
    }, 100)
  })
  const tableDoLayout = () => {
    tableRef.value?.doLayout()
  }
  const triggerClick = (event: any, row: any) => {
    emit('triggerClick', event, row)
  }

  const gethighlightText = computed(() => {
    return (item: any, scope: any) => {
      if (item.isHighlight) {
        const text = item.formatter
          ? item.formatter(scope.row, scope.column, scope.row[item.name])
          : scope.row[item.name]
        if (text || text === 0) {
          const keys = [] as any
          keys.push(text)
          return keys
        } else return []
      } else {
        return []
      }
    }
  })
  const gethighlightText_detail = computed(() => {
    return (item: any) => {
      if (item.isHighlight) {
        const text = item.formatter ? item.formatter(item.value, item) : item.value
        if (text) {
          const keys = [] as any
          keys.push(text)
          return keys
        } else return []
      } else {
        return []
      }
    }
  })

  function setCurrentPage(page: number) {
    currentPage.value = page
  }
  function quickClear() {
    emit('quickClear')
  }

  defineExpose({
    loadData,
    getSelectRows,
    getTableHeight,
    tableDoLayout,
    clearSelectionRows,
    setCurrentPage
  })
</script>

<style lang="less">
  @import './style.less';
</style>
