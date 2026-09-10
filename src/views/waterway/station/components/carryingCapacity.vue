<template>
  <DcGap class="bar">
    港口通过能力信息
    <span class="bar-btn fr fs-14 mr-10 theme-color cu-pointer" @click="handleAddRow">
      <DAliIcon name="plus" class="" />
      新增
    </span>
  </DcGap>
  <el-table v-loading="loading" :data="datalis">
    <el-table-column label="数值" prop="numerical" align="center">
      <template #default="scoped">
        {{ scoped.row.Numerical }}
      </template>
    </el-table-column>
    <el-table-column label="类型" prop="type" align="center">
      <template #default="scoped">
        {{ scoped.row.Type }}
      </template>
    </el-table-column>
    <el-table-column label="维护人员" align="center" prop="updateUserName">
      <template #default="scoped">
        {{ scoped.row.UpdateUserName || scoped.row.CreatorName }}
        {{
          scoped.row.UpdateUserName
            ? formatTime(scoped.row.UpdateTime, 'yyyy-MM-dd HH:mm')
            : formatTime(scoped.row.CreationTime, 'yyyy-MM-dd HH:mm')
        }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="100" align="center">
      <template #default="scoped">
        <el-button type="text" @click="handleEdit(scoped.row)"> 编辑 </el-button>
      </template>
    </el-table-column>
    <!-- <el-table-column
        label="新增人员"
        align="center"
        width="180"
        prop="validDate"
      >
        <template #default="scoped">
          {{ scoped.row.creatorName }}
          {{ formatTime(scoped.row.creationTime, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column
        label="修改人员"
        align="center"
        width="180"
        prop="validDate"
      >
        <template #default="scoped">
          {{ scoped.row.lastModifierName }}
          {{ formatTime(scoped.row.lastModificationTime, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column> -->
  </el-table>
  <EditForm
    v-model="showEdit"
    :station="currentRow"
    :station-id="stationId"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
  import { ref, defineComponent, nextTick, onMounted } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import EditForm from './carryingCapactiyForm.vue'
  import { formatTime } from '@/utils'
  import { Message } from '@/components/Message'
  import { ElMessageBox } from 'element-plus'
  import BaseService from '@/api/baseService'
  import { DcDeep } from '@dczy/tie-tools'

  const api = new BaseService('water-port')
  export default defineComponent({
    components: {
      DcGap,
      EditForm
    },
    props: {
      isView: {
        type: Boolean,
        default: () => true
      },
      list: {
        type: Array,
        default: () => []
      },
      stationId: {
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
      }
    },
    setup(props, { emit }) {
      // const state = reactive({
      //   data: {} as any,
      //   showImportDialog: false,
      //   importItem: {} as any,
      //   showResourceInputDialog: false
      // });
      // const editIndex = ref(-1);
      // const currentIndex = ref(-1);
      // const data = ref<any>([]);

      function handleChange(u: any, row: any) {
        row.type = u?.Type
        row.numerical = u?.Numerical
      }
      function handleSuccess() {
        dataLoad()
      }
      // function handleClickRow(row: any) {
      //   if (props.isView) return;
      //   const index = data.value.findIndex((x) => x._id === row._id);
      //   if (editIndex.value === index) return;
      //   if (
      //     editIndex.value !== -1 &&
      //     !Reflect.get(data.value[editIndex.value], "type")
      //   ) {
      //     Message.warning("当前行数据不完整，请填写完整信息");
      //     return;
      //   }
      //   editIndex.value = index;
      // }
      const showEdit = ref(false)
      const currentRow = ref<any>()
      function handleEdit(row: any) {
        currentRow.value = DcDeep.clone<any>(row)
        nextTick(() => {
          showEdit.value = true
        })
      }
      function handleAddRow() {
        currentRow.value = DcDeep.clone<any>({})
        nextTick(() => {
          showEdit.value = true
        })
      }

      const loading = ref(false)
      const datalis = ref<any>()
      function dataLoad() {
        loading.value = true
        api
          .OpionDefine(`trafficability-queryById?id=` + props?.stationId, null, 'GET')
          .then((res) => {
            if (res && res.isSuccessful) {
              datalis.value = res.data
            } else {
              datalis.value = []
            }
          })
          .finally(() => {
            loading.value = false
          })
      }
      onMounted(() => {
        dataLoad()
      })
      return {
        handleAddRow,
        //  GetData,
        showEdit,
        currentRow,
        handleSuccess,
        handleEdit,
        datalis,
        loading,
        formatTime
      }
    }
  })
</script>

<style lang="less" scoped>
  :deep(.dc-user-table-select) {
    .svg-icon {
      margin-top: 10px;
    }
  }
</style>
