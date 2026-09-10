<template>
  <DcGap class="bar">
    港口联系方式
    <span class="theme-color">(共{{ datalis?.length || 0 }}条)</span>
    <span class="fs-12 theme-danger mr-5px"> (港口窗口、货运室等联系方式) </span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" />
      新增
    </span>
  </DcGap>
  <el-table v-loading="loading" :data="datalis" size="small">
    <el-table-column label="联系人" align="center" width="300" prop="contact">
      <template #default="scoped">
        {{ scoped.row.contact }}
        <span
          class="theme-color cu-pointer"
          v-html="createPrivatePhone(scoped.row.contactTel).outerHTML"
        ></span>
      </template>
    </el-table-column>
    <el-table-column label="所属码头" align="center" prop="wharfName"> </el-table-column>
    <el-table-column label="负责业务说明" align="center" prop="serviceBrochure"></el-table-column>
    <el-table-column label="维护人员" align="center" width="180" prop="updateUserName">
      <template #default="scoped">
        {{ scoped.row.updateUserName || scoped.row.creatorName }}
        {{
          scoped.row.updateUserName
            ? formatTime(scoped.row.updateTime, 'yyyy-MM-dd HH:mm')
            : formatTime(scoped.row.creationTime, 'yyyy-MM-dd HH:mm')
        }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="150" align="center">
      <template #default="scoped">
        <el-button type="text" size="small" @click="handleEdit(scoped.row)"> 编辑 </el-button>
        <el-button
          type="text"
          size="small"
          style="color: var(--theme-danger)"
          @click="handleDel(scoped.row)"
        >
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
  import { defineComponent, nextTick, ref, reactive, onMounted, toRefs } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import { Message } from '@/components/Message'
  import EditForm from './contactForm.vue'
  import { deleteContact, listContacts } from '@/api/waterway-port'
  import { ElMessageBox } from 'element-plus'

  export default defineComponent({
    components: {
      DcGap,
      EditForm
    },
    props: {
      contacts: {
        type: Array as any,
        default: () => []
      },
      stationId: {
        type: String,
        default: () => ''
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const currentRow = ref<any>()
      function handleEdit(row: any) {
        currentRow.value = DcDeep.clone<any>(row)
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleAdd() {
        currentRow.value = {}
        nextTick(() => {
          showEdit.value = true
        })
      }
      async function handleDel(row: any) {
        try {
          await ElMessageBox.confirm('是否删除选中行的联系人信息？')
        } catch {
          return
        }
        const [error, success] = await deleteContact(row.id)
        if (!error && success) {
          Message.success('删除成功')
          void dataLoad()
          emit('reload')
        }
      }
      function handleSuccess() {
        void dataLoad()
        emit('reload')
      }
      onMounted(() => {
        dataLoad()
      })
      const loading = ref(false)
      const datalis = ref<any>()
      async function dataLoad() {
        loading.value = true
        const [error, data] = await listContacts(props.stationId)
        if (!error) datalis.value = data
        loading.value = false
      }
      return {
        showEdit,
        currentRow,
        handleEdit,
        handleDel,
        handleAdd,
        handleSuccess,
        formatTime,
        dataLoad,
        loading,
        datalis
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');
</style>
