import type { DCTableColumn } from '@/components/DCLayout/store'

export const privateLineTableColumns: DCTableColumn[] = [
  {
    label: '专用线名称',
    name: 'name',
    headerAlign: 'center',
    width: 500
  },
  {
    label: '所属站点',
    name: 'stationName',
    headerAlign: 'center',
    width: 220,
    type: 'slot'
  },
  {
    label: '标签',
    name: 'tags',
    headerAlign: 'center',
    width: 380,
    type: 'slot',
    showOverflowTooltip: false
  },
  {
    label: '联系人',
    name: 'contacts',
    headerAlign: 'center',
    align: 'center',
    width: 300,
    type: 'slot'
  }
]
