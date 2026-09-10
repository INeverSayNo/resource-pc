<template>
  <DcGap class="bar">
    车站联系方式
    <span class="theme-color">(共{{ contacts?.length || 0 }}条)</span>
    <span class="fs-12 theme-danger mr-5px"> (车站窗口、货运室等中铁路工联系方式) </span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" class="" />
      新增
    </span>
  </DcGap>
  <el-table :data="contacts" border stripe highlight-current-row :max-height="tableHeight">
    <el-table-column
      label="服务类别"
      align="center"
      width="110"
      prop="serviceType"
    ></el-table-column>
    <el-table-column label="联系人" align="center" width="300" prop="contacts">
      <template #default="scoped">
        {{ scoped.row.contacts }}
        <span
          v-if="scoped.row.phone"
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.phone).outerHTML"
        ></span>
        <span v-if="scoped.row.phone && scoped.row.telePhone" class="mr-5px ml-5px"> / </span>
        <span
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.telePhone).outerHTML"
        ></span>
      </template>
    </el-table-column>

    <el-table-column label="备注" align="center" prop="remark"></el-table-column>
    <el-table-column
      label="服务时间"
      align="center"
      width="100"
      prop="serviceTime"
    ></el-table-column>
    <el-table-column label="是否有效" align="center" prop="isValid" width="80">
      <template #default="scoped">
        {{
          scoped.row.isValid == undefined
            ? '未设置'
            : scoped.row.isValid && (scoped.row.phone || scoped.row.telePhone)
              ? '有效'
              : '-'
        }}
      </template>
    </el-table-column>
    <el-table-column label="验证时间" align="center" width="120" prop="validDate">
      <template #default="scoped">
        {{
          scoped.row.phone || scoped.row.telePhone
            ? formatTime(scoped.row.validDate, 'yyyy-MM-dd HH:mm')
            : '-'
        }}
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

    <el-table-column fixed="right" label="操作" width="150" align="center">
      <template #default="scoped">
        <el-button type="text" @click="handleEdit(scoped.row)"> 编辑 </el-button>
        <el-button type="text" style="color: var(--theme-danger)" @click="handleDel(scoped.row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <EditForm
    v-model="showEdit"
    :contact="currentRow"
    :station-id="stationId"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
  import { defineComponent, nextTick, PropType, ref } from 'vue'
  import { RailWayStationContacts } from '../types'
  import DcGap from '@/components/Gap/index.vue'
  import EditForm from './contactForm.vue'
  import { formatTime } from '@/utils'
  import { Message } from '@/components/Message'
  import { ElMessageBox } from 'element-plus'
  import { StationContactScrapAsync } from '../api'
  import { DcDeep } from '@dczy/tie-tools'

  export default defineComponent({
    components: {
      DcGap,
      EditForm
    },
    props: {
      contacts: {
        type: Array as PropType<Array<RailWayStationContacts>>,
        default: () => []
      },
      stationId: {
        type: String,
        default: () => ''
      },
      tableHeight: {
        type: Number,
        default: 360
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const currentRow = ref<RailWayStationContacts>()

      function handleEdit(row: RailWayStationContacts) {
        currentRow.value = DcDeep.clone<RailWayStationContacts>(row)
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleDel(row: any) {
        ElMessageBox.confirm('是否删除选中行的联系人信息？').then(() => {
          StationContactScrapAsync(row.id).then((res) => {
            if (res) {
              Message.success('删除成功')
              emit('reload')
            }
          })
        })
      }
      function handleAdd() {
        if (!props.stationId) {
          Message.warning('车站Id有误，请刷新页面重试')
          return
        }
        currentRow.value = undefined
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleSuccess() {
        emit('reload')
      }
      return {
        showEdit,
        currentRow,
        handleEdit,
        handleAdd,
        handleSuccess,
        formatTime,
        handleDel
      }
    }
  })
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
