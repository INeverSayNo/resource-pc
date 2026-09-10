<template>
  <el-tag
    v-for="tag in list"
    :key="tag"
    class="ml-5"
    type="warning"
    closable
    :disable-transitions="false"
    @close="handleClose(tag)"
  >
    {{ tag.tagValue }}
  </el-tag>
  <el-input
    v-if="inputVisible"
    ref="InputRef"
    v-model="inputValue"
    class="ml-5px w-20"
    placeholder="请输入标签内容"
    @keyup.enter="handleInputConfirm"
    @blur="handleInputConfirm"
  />
  <el-button
    v-else
    class="button-new-tag ml-5px"
    @click="handleShowInput"
  >
    +新增
  </el-button>
</template>

<script lang="ts">
import { Message } from "@/components/Message";
import { ElInput, ElMessageBox } from "element-plus";
import { ref, onMounted, defineComponent, nextTick } from "vue";
import { GetTags, CreateTagBatch, DeteleTag } from "../api";
import { SupplierTagTypeEnum } from "../Enum";
import { SupplierTagDto, SupplierTagCrudDto } from "../types";
import { DcCommon, DcDeep } from "@dczy/tie-tools";

export default defineComponent({
  props: {
    supplierId: {
      type: String,
      default: () => ""
    }
  },
  setup(props, { emit }) {
    const InputRef = ref<InstanceType<typeof ElInput>>();
    const list = ref<SupplierTagDto[]>([]);
    const inputValue = ref("");
    const inputVisible = ref(false);
    function loadData() {
      if (props.supplierId) {
        GetTags([props.supplierId], SupplierTagTypeEnum.Custom as number).then(
          (res) => {
            list.value = res;
          }
        );
      }
    }
    function handleClose(tag: SupplierTagDto) {
      ElMessageBox.confirm("是否删除此标签，删除后无法恢复？", "提示信息").then(
        () => {
          const temp = DcDeep.clone<SupplierTagDto[]>(list.value);
          const index = temp.findIndex((x) => x.id === tag.id);
          if (!tag.isNew) {
            DeteleTag(tag.id).then((res) => {
              if (!res) {
                Message.error("删除失败");
              } else {
                Message.success("删除成功");
                temp.splice(index, 1);
                list.value = temp;
              }
            });
          } else {
            temp.splice(index, 1);
            list.value = temp;
          }
        }
      );
    }
    function handleInputConfirm() {
      if (!inputValue.value) {
        inputVisible.value = false;
        return;
      }
      if (list.value.some((x) => x.tagValue === inputValue.value)) {
        Message.warning("输入标签内容重复，请检查");
        return;
      }
      list.value.push({
        id: DcCommon.guid(),
        supplierId: props.supplierId,
        tagType: SupplierTagTypeEnum.Custom as number,
        tagValue: inputValue.value,
        isNew: true
      });
      inputValue.value = "";
      inputVisible.value = false;
    }
    function handleShowInput() {
      inputVisible.value = true;
      nextTick(() => {
        InputRef.value!.input!.focus();
      });
    }
    function Save(supplierId?: string) {
      return new Promise<boolean>((resolve) => {
        if (!props.supplierId && !supplierId) {
          resolve(false);
          return;
        }
        const newTags = DcDeep.clone<SupplierTagDto[]>(list.value)
          .filter((x) => x.isNew)
          .map((x) => {
            x.supplierId = supplierId || props.supplierId;
            const { id, isNew, ...other } = x;
            return other as SupplierTagCrudDto;
          });
        if (newTags?.length) {
          CreateTagBatch(newTags).then((res) => {
            resolve(res);
          });
        } else {
          resolve(true);
        }
      });
    }
    onMounted(() => {
      loadData();
    });
    return {
      list,
      handleClose,
      handleInputConfirm,
      handleShowInput,
      InputRef,
      inputVisible,
      inputValue,
      Save
    };
  }
});
</script>

<style lang="less" scoped></style>
