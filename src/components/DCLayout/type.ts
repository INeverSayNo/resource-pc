import type { DCTableColumn } from './store'

export interface IQueryFormProps {
  labelWidth?: string
  btnLabelWidth?: string
  inline?: boolean
  labelSuffix?: string
  size?: string
}

export interface IFixTableHeight {
  isFixed: boolean
  height: number
}

export interface IProps {
  loading?: boolean
  dialogAttr?: Record<string, any>
  showMoreQuery?: boolean
  queryDefaultShow?: boolean
  showBar?: boolean
  queryFormProps?: IQueryFormProps
  showExpand?: boolean
  selection?: boolean
  showIndex?: boolean
  showQuickQuery?: boolean
  operate?: { show?: boolean; width?: string | number }
  columns?: DCTableColumn[]
  rowStyle?: (data: { row: any; rowIndex: number }) => string | Record<string, any>
  tableData?: any[]
  showPagination?: boolean
  total?: number
  pageSize?: number
  showDialog?: boolean
  dialogWidth?: number | string
  title?: string
  showDetails?: boolean
  dialogDtWidth?: number | string
  direction?: string
  dtTitle?: string
  dtCloumnNum?: number
  dtCloumns?: Record<string, any>
  dtData?: Record<string, any>
  apiController?: string
  queryData?: Record<string, any>
  queryDateColumn?: string[]
  submitLoading?: boolean
  showExportBtn?: boolean
  tableMultiple?: boolean
  exportExcelAction?: string
  exportExcelFileName?: string
  border?: boolean
  fixTableHeight?: IFixTableHeight
  autoLoad?: boolean
  showSummary?: boolean
  summaryType?: string
  summaryIndex?: number
  sumData?: Record<string, any>
  highlightcolor?: string
  trace?: boolean
  tableAttrs?: Record<string, any>
}

export interface IEmits {
  (eventName: 'search', payload?: string): void
  (eventName: 'submit'): void
  (eventName: 'close'): void
  (eventName: 'pageChange', page: number, pageSize: number): void
  (eventName: 'selectRows', payload?: any[]): void
  (eventName: 'current-change', payload?: any): void
  (eventName: 'update:showDialog', payload: boolean): void
  (eventName: 'dtclose'): void
  (eventName: 'update:showDetails', payload: boolean): void
  (eventName: 'update:title', payload?: string): void
  (eventName: 'showQuery', payload: boolean): void
  (eventName: 'query', payload?: string): void
  (eventName: 'queryReset'): void
  (eventName: 'update:queryData', payload: Record<string, any>): void
  (eventName: 'expand-change', row: any, expanded: boolean): void
  (eventName: 'row-dblclick', payload?: any): void
  (eventName: 'triggerClick', event: any, row: any): void
  (eventName: 'cellClick', row: any, column: any, cell: any, event: any): void
  (eventName: 'mainResize', payload?: number): void
  (eventName: 'quickClear'): void
}

export const defaultProps = {
  loading: false,
  dialogAttr: () => ({}),
  showMoreQuery: true,
  queryDefaultShow: false,
  showBar: true,
  queryFormProps: () => ({
    labelWidth: '120px',
    btnLabelWidth: '120px',
    inline: true,
    labelSuffix: '：',
    size: 'small'
  }),
  showExpand: false,
  selection: false,
  showIndex: true,
  showQuickQuery: true,
  operate: () => ({ show: true, width: 180 }),
  columns: () => [],
  rowStyle: () => () => '',
  tableData: () => [],
  showPagination: true,
  total: 0,
  pageSize: 20,
  showDialog: false,
  dialogWidth: 600,
  title: '新增',
  showDetails: false,
  dialogDtWidth: 1000,
  direction: 'horizontal',
  dtTitle: '详情',
  dtCloumnNum: 3,
  dtCloumns: () => ({}),
  dtData: () => ({}),
  apiController: '',
  queryData: () => ({}),
  queryDateColumn: () => [],
  submitLoading: false,
  showExportBtn: false,
  tableMultiple: false,
  exportExcelAction: '',
  exportExcelFileName: '',
  border: true,
  fixTableHeight: () => ({ isFixed: false, height: 500 }),
  autoLoad: true,
  showSummary: false,
  summaryType: 'float',
  summaryIndex: 2,
  sumData: () => ({}),
  highlightcolor: 'red',
  trace: true,
  tableAttrs: () => ({})
}
