import { GETFILE_URL } from '@/request'
import type {
  AddressInfo,
  CenterListItem,
  OrganizationListItem,
  OrganizationNode,
  VisitGraphItem
} from './types'
import { ORGANIZATION_TYPES } from './types'

export interface ChartTreeNode extends OrganizationNode {
  name: string
  children?: ChartTreeNode[]
  symbol?: string
  symbolSize: number
  itemStyle?: { color: string; borderColor: string; borderType?: 'dashed' }
  label?: { color: string; position: 'bottom' }
}

const normalizeAddress = (value: Partial<AddressInfo> | null | undefined): AddressInfo => ({
  address: String(value?.address || ''),
  lat: value?.lat ?? '',
  lng: value?.lng ?? '',
  regionName: String(value?.regionName || '')
})

export const parseAddress = (value?: string | AddressInfo | null): AddressInfo => {
  if (value && typeof value === 'object') return normalizeAddress(value)
  if (!value || typeof value !== 'string' || !value.trim().startsWith('{')) {
    return normalizeAddress(null)
  }
  try {
    const parsed = JSON.parse(value) as Partial<AddressInfo>
    return normalizeAddress(parsed)
  } catch {
    return normalizeAddress(null)
  }
}

export const resolveFileUrl = (value?: string | null): string => {
  if (!value) return ''
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  return `${GETFILE_URL.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

export const normalizeImageList = (images?: string[] | null): string[] => [
  ...new Set((images || []).map(resolveFileUrl).filter(Boolean))
]

export const completionRate = (degree?: number | null): number => {
  const value = Number(degree)
  return Number.isFinite(value) ? Math.min(5, Math.max(0, value / 20)) : 0
}

export const normalizeCenterItem = (item: CenterListItem): CenterListItem => ({
  ...item,
  businessDepartmentList: item.businessDepartmentList || [],
  stationList: item.stationList || [],
  firstPageImgUrl: resolveFileUrl(item.firstPageImgUrl),
  formatAddress: parseAddress(item.organizationAddressDetail)
})

export const normalizeOrganizationItem = (item: OrganizationListItem): OrganizationListItem => ({
  ...item,
  childInstitutionList: item.childInstitutionList || [],
  childStationList: item.childStationList || [],
  formatAddress: parseAddress(item.addressDetail)
})

const organizationColor = (type: number): string =>
  ORGANIZATION_TYPES.find((item) => item.id === type)?.color || '#909399'

const visitNode = (
  item: VisitGraphItem,
  contactIcon: string,
  staffIcon: string
): ChartTreeNode => ({
  id: `contact-${item.contactUserName}-${item.visitiDate || ''}`,
  organizationType: -1,
  organizationName: item.contactUserName || '联系人',
  name: item.contactUserName || '联系人',
  symbol: `image://${contactIcon}`,
  symbolSize: 30,
  label: { color: '#303133', position: 'bottom' },
  children: [
    {
      id: `staff-${item.visitUserName}-${item.visitiDate || ''}`,
      organizationType: -1,
      organizationName: item.visitUserName || '拜访人',
      name: item.visitUserName || '拜访人',
      symbol: `image://${staffIcon}`,
      symbolSize: 22,
      label: { color: '#303133', position: 'bottom' },
      children: undefined
    }
  ]
})

export const buildOrganizationTree = (
  nodes: OrganizationNode[],
  options: { showContacts?: boolean; contactIcon?: string; staffIcon?: string } = {},
  depth = 0
): ChartTreeNode[] =>
  (nodes || []).map((item) => {
    const children = buildOrganizationTree(item.childList || [], options, depth + 1)
    if (options.showContacts && options.contactIcon && options.staffIcon) {
      children.push(
        ...(item.visitRecordList || []).map((visit) =>
          visitNode(visit, options.contactIcon as string, options.staffIcon as string)
        )
      )
    }
    const color = organizationColor(item.organizationType)
    return {
      ...item,
      name: item.organizationName,
      children: children.length ? children : undefined,
      symbolSize: Math.max(34, 66 - depth * 10),
      itemStyle: { color, borderColor: color, borderType: 'dashed' }
    }
  })

const compoundSurnames = new Set([
  '欧阳',
  '太史',
  '端木',
  '上官',
  '司马',
  '东方',
  '独孤',
  '南宫',
  '万俟',
  '闻人',
  '夏侯',
  '诸葛',
  '尉迟',
  '公羊',
  '赫连',
  '澹台',
  '皇甫',
  '宗政',
  '濮阳',
  '公冶',
  '太叔',
  '申屠',
  '公孙',
  '慕容',
  '仲孙',
  '钟离',
  '长孙',
  '宇文',
  '司徒',
  '鲜于',
  '司空',
  '闾丘',
  '子车',
  '亓官',
  '司寇',
  '巫马',
  '公西',
  '颛孙',
  '壤驷',
  '公良',
  '漆雕',
  '乐正',
  '宰父',
  '谷梁',
  '拓跋',
  '夹谷',
  '轩辕',
  '令狐',
  '段干',
  '百里',
  '呼延',
  '东郭',
  '南门',
  '羊舌',
  '微生',
  '公户',
  '公玉',
  '公仪',
  '梁丘',
  '公仲',
  '公上',
  '公门',
  '公山',
  '公坚',
  '左丘',
  '公伯',
  '西门',
  '公祖',
  '第五',
  '公乘',
  '贯丘',
  '公皙',
  '南荣',
  '东里',
  '东宫',
  '仲长',
  '子书',
  '子桑',
  '即墨',
  '达奚',
  '褚师'
])

export const formatContactName = (
  name?: string,
  duty = '',
  gender: number | null = null
): string => {
  if (!name || name === '无权限') return ''
  const surname = compoundSurnames.has(name.slice(0, 2)) ? name.slice(0, 2) : name.slice(0, 1)
  const salutation = gender === 0 ? '先生' : gender === 1 ? '女士' : '**'
  return `${surname}${salutation}${duty ? ` (${duty})` : ''}`
}

export const organizationDisplayName = (relationName?: string): string => {
  if (!relationName) return '暂未录入'
  const parts = relationName.split('-').filter(Boolean)
  if (parts[0]?.includes('物流中心') && parts.length > 1) return parts.slice(1).join('-')
  return parts.join('-')
}
