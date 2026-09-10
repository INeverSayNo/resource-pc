<template>
  <DcGap class="bar">
    驻站人员信息
    <span v-if="isView" class="fs-12 theme-warning">
      (新增维护，请点击站点基础信息‘编辑’按钮)
    </span>
    <span
      v-if="!isView"
      class="bar-btn fr fs-14 cu-pointer theme-danger"
      @click="handleDelRow"
    >
      <DAliIcon name="delete" class="" />
      删除
    </span>
    <span
      v-if="!isView"
      class="bar-btn fr fs-14 mr-10 theme-color cu-pointer"
      @click="handleAddRow"
    >
      <DAliIcon name="plus" class="" />
      新增
    </span>
  </DcGap>
  <el-table
    :data="data"
    border
    stripe
    highlight-current-row
    @row-click="handleClickRow"
    @current-change="handleChangeRow"
  >
    <el-table-column label="姓名" prop="userName" align="center">
      <template #default="scoped">
        <DcOrgUserSelect
          v-if="scoped.$index === editIndex"
          v-model="scoped.row.userId"
          :show-tree="false"
          placeholder="请选择人员信息"
          
          @change="(_, item) => handleChange(item, scoped.row)"
        />
        <span v-else>
          {{ scoped.row.userName }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="电话" prop="phone" align="center">
      <template #default="scoped">
        <el-input
          v-if="scoped.$index === editIndex"
          v-model="scoped.row.phone"
          
          placeholder="请输入人员电话"
        ></el-input>
        <span v-else>
          {{ scoped.row.phone }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
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
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { PropType, ref, watch, defineComponent } from "vue";
import { RailwayStationaryUser } from "../types";
import DcOrgUserSelect from "@/components/TableUserSelectV2/selectField.vue";
import DcGap from "@/components/Gap/index.vue";
import { formatTime } from "@/utils";
import { Message } from "@/components/Message";
import { ElMessageBox } from "element-plus";
import { DcCommon, DcDeep } from "@dczy/tie-tools";
export default defineComponent({
  components: {
    DcOrgUserSelect,
    DcGap
  },
  props: {
    isView: {
      type: Boolean,
      default: () => true
    },
    list: {
      type: Array as PropType<RailwayStationaryUser[]>,
      default: () => []
    }
  },
  setup(props) {
    const editIndex = ref(-1);
    const currentIndex = ref(-1);
    const data = ref<RailwayStationaryUser[]>([]);

    function handleChange(u: any, row: RailwayStationaryUser) {
      row.userName = u?.userName;
      row.phone = u?.phone;
    }
    function handleClickRow(row: RailwayStationaryUser) {
      if (props.isView) return;
      const index = data.value.findIndex((x) => x._id === row._id);
      if (editIndex.value === index) return;
      if (
        editIndex.value !== -1 &&
        !Reflect.get(data.value[editIndex.value], "userId")
      ) {
        Message.warning("当前行数据不完整，请选择用户信息");
        return;
      }
      editIndex.value = index;
    }
    function handleAddRow() {
      if (
        editIndex.value !== -1 &&
        !Reflect.get(data.value[editIndex.value], "userId")
      ) {
        Message.warning("当前行数据不完整，请选择用户信息");
        return;
      }
      if (
        editIndex.value !== -1 &&
        data.value.filter((x) => data.value[editIndex.value].phone === x.phone)
          ?.length > 1
      ) {
        Message.warning("联系方式有重复，请检查");
        return;
      }
      data.value.push({
        _id: DcCommon.guid()
      } as RailwayStationaryUser);
      editIndex.value = data.value.length - 1;
    }
    function handleDelRow() {
      if (currentIndex.value === -1) {
        Message.warning("请选中需要删除的人员信息！");
        return;
      }
      ElMessageBox.confirm(
        "是否删除选中行的人员信息，删除后不能恢复？",
        "提示信息",
        { type: "warning" }
      ).then(() => {
        data.value.splice(currentIndex.value, 1);
        if (editIndex.value === currentIndex.value) {
          editIndex.value = -1;
        }
        currentIndex.value = -1;
      });
    }

    function handleChangeRow(row: RailwayStationaryUser) {
      if (row) {
        currentIndex.value = data.value.findIndex((x) => x._id === row._id);
      }
    }

    watch(
      () => props.list,
      (val) => {
        const temp = DcDeep.clone<RailwayStationaryUser[]>(val || []);
        data.value = temp.map((x) => {
          if (x.id) x._id = x.id;
          else x._id = DcCommon.guid();
          return x;
        });
      },
      { immediate: true, deep: true }
    );

    function GetData() {
      const temp = DcDeep.clone<RailwayStationaryUser[]>(data.value);
      return temp.filter((x) => x.userId);
    }
    return {
      data,
      editIndex,
      handleChange,
      handleClickRow,
      handleAddRow,
      handleDelRow,
      handleChangeRow,
      GetData,
      formatTime
    };
  }
});
</script>

<style lang="less" scoped>
:deep(.dc-user-table-select) {
  .svg-icon {
    margin-top: 10px;
  }
}
</style>
