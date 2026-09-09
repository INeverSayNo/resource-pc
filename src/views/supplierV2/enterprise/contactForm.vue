<template>
  <div>
    <div class="contact-item">
      <div class="left">
        <span v-if="listData.length">
          已绑定：
          <span
            v-for="(item, index) in listData"
            :key="item.id"
            :class="(index + 1) % 4 === 1 && index != 0 ? 'row-first' : ''"
            class="items"
          >
            {{ item.contact }}
            <span class="edit theme-color" @click="handleEdit(item)">
              <DLegacyIcon name="edit" class="" />
              编辑
            </span>
            <span class="edit theme-warning" @click="handleDelete(item)">
              <DLegacyIcon name="delete" class="" />
              删除
            </span>
            <br v-if="(index + 1) % 4 === 0" />
          </span>
        </span>
        <span v-else>暂无绑定的数据</span>
      </div>
      <div class="fr">
        <el-button
          v-show="!showContact"
          size="small"
          type="warning"
          @click="handleNew"
        >
          新增
        </el-button>
      </div>
    </div>
    <el-form
      v-show="showContact"
      ref="formRef"
      :model="edit"
      :rules="rules"
      size="small"
      class="dialog-form"
      label-width="130px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人姓名" prop="contact">
            <el-input
              v-model="edit.contact"
              placeholder="请输入联系人姓名"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系手机" prop="contactPhone">
            <el-input
              v-model="edit.contactPhone"
              placeholder="请输入联系手机"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <div class="show-more-contact">
            <el-switch
              v-model="showMore"
              size="small"
              inactive-text="填写更多"
            />
          </div>
        </el-col>
        <template v-if="showMore">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input
                v-model="edit.position"
                placeholder="请输入联系人职位"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="禁止登录">
              <el-switch v-model="edit.isDisabled"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="负责业务">
              <el-select
                v-model="edit.responsibleBusEdit"
                placeholder="请选择"
                no-data-text="请先选择供应商类型"
                style="width: 100%"
                clearable
                filterable
                :multiple="true"
              >
                <el-option
                  v-for="(item, index) in businessTypeData"
                  :key="index"
                  :label="item.text"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="负责事项">
              <el-input
                v-model="edit.responsibleDes"
                type="textarea"
                :rows="3"
                :maxlength="250"
                show-word-limit
                placeholder="请输入负责事项"
              ></el-input>
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="24" class="tc" style="margin-bottom: 10px">
          <el-button
            type="primary"
            size="small"
            :loading="saveNewLoading"
            @click="handleSave('new')"
          >
            保存并新增
          </el-button>
          <el-button
            type="success"
            size="small"
            :loading="saveLoading"
            @click="handleSave('save')"
          >
            保存联系人
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts">
import { deepClone, guid } from "@/utils";
import {
  reactive,
  toRefs,
  defineComponent,
  ref,
  onMounted,
  watch,
  PropType
} from "vue";
import {
  SupplierEnterpriseLinkPersonDto,
  SupplierEnterpriseLinkPersonCreateOrUpdateDto
} from "../types";
import { GetListBySupplierId, supplierContactApi } from "../api";
import { ElMessageBox } from "element-plus";
import { Message } from "@/components/Message";
import { BaseData } from "@/api/dictionaryApi";
export default defineComponent({
  props: {
    supplierId: {
      type: String,
      default: () => ""
    },
    businessTypeData: {
      type: Array as PropType<Array<BaseData>>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const formRef = ref();
    const state = reactive({
      editId: "",
      saveLoading: false,
      saveNewLoading: false,
      showContact: !props.supplierId,
      edit: {
        supplierHeadId: props.supplierId
      } as SupplierEnterpriseLinkPersonCreateOrUpdateDto,
      listData: [] as SupplierEnterpriseLinkPersonDto[],
      rules: {
        contact: [
          { required: true, message: "请输入联系人姓名", trigger: "blur" }
        ],
        contactPhone: [
          { required: true, message: "请输入联系人手机", trigger: "blue" }
        ]
      }
    });
    function handleNew() {
      state.edit = {} as SupplierEnterpriseLinkPersonCreateOrUpdateDto;
      state.showContact = true;
    }
    /**
     * 编辑
     */
    function handleEdit(item: SupplierEnterpriseLinkPersonDto) {
      state.editId = item.id;
      state.edit = {
        isScrap: item.isScrap,
        supplierHeadId: item.supplierHeadId,
        projectNames: item.projectNames,
        contact: item.contact,
        contactPhone: item.contactPhone,
        position: item.position,
        responsibleDes: item.responsibleDes,
        isDisabled: item.isDisabled,
        responsibleBus: item.responsibleBus,
        responsibleBusEdit: item.responsibleBus?.split(",") || [],
        responsibleBusNames: item.responsibleBusNames
      } as SupplierEnterpriseLinkPersonCreateOrUpdateDto;
      state.showContact = true;
    }

    function handleSave(type: "save" | "new") {
      formRef.value?.validate((valid) => {
        if (valid) {
          const item = deepClone<SupplierEnterpriseLinkPersonCreateOrUpdateDto>(
            state.edit
          );
          const old = deepClone<SupplierEnterpriseLinkPersonDto[]>(
            state.listData
          );
          const index = old.findIndex(
            (x) =>
              (!x.id && x.contactPhone === state.edit.contactPhone) ||
              (x.id && state.editId && x.id === state.editId)
          );
          if (item.responsibleBusEdit?.length) {
            item.responsibleBus = item.responsibleBusEdit.join(",");
            item.responsibleBusNames = props.businessTypeData
              .filter((x) => item.responsibleBusEdit!.includes(x.value))
              .map((x) => x.text)
              .join(",");
          } else {
            item.responsibleBus = "";
            item.responsibleBusNames = "";
          }

          if (!state.editId && index !== -1) {
            Message.warning("此电话号码以及存在，不能新增");
          } else {
            if (props.supplierId) {
              item.supplierHeadId = props.supplierId;
              state.saveLoading = type === "save";
              state.saveNewLoading = type === "new";
              // 提交数据库
              if (index !== -1) {
                supplierContactApi
                  .Update(state.editId, item)
                  .then((res) => {
                    if (res?.isSuccessful) {
                      state.editId = "";
                      loadData();
                      if (type === "new") {
                        handleNew();
                      } else {
                        state.showContact = false;
                      }
                      Message.success("保存成功");
                    }
                  })
                  .finally(() => {
                    state.saveLoading = false;
                    state.saveNewLoading = false;
                  });
              } else {
                supplierContactApi
                  .Create(item)
                  .then((res) => {
                    if (res?.isSuccessful) {
                      loadData();
                      if (type === "new") {
                        handleNew();
                      } else {
                        state.showContact = false;
                      }
                      Message.success("保存成功");
                    }
                  })
                  .finally(() => {
                    state.saveLoading = false;
                    state.saveNewLoading = false;
                  });
              }
            } else {
              // 保存在本地
              if (index !== -1) {
                state.listData[index].isScrap = item.isScrap;
                state.listData[index].projectNames = item.projectNames;
                state.listData[index].contact = item.contact;
                state.listData[index].contactPhone = item.contactPhone;
                state.listData[index].position = item.position;
                state.listData[index].responsibleDes = item.responsibleDes;
                state.listData[index].isDisabled = item.isDisabled;
                state.editId = "";
              } else {
                state.listData.push({
                  id: guid(),
                  isScrap: item.isScrap,
                  projectNames: item.projectNames,
                  contact: item.contact,
                  contactPhone: item.contactPhone,
                  position: item.position,
                  responsibleDes: item.responsibleDes,
                  isDisabled: item.isDisabled,
                  responsibleBus: item.responsibleBus,
                  responsibleBusNames: item.responsibleBusNames
                } as SupplierEnterpriseLinkPersonDto);
              }
              if (type === "new") {
                handleNew();
              } else {
                state.showContact = false;
              }
            }
          }
        } else {
          Message.warning("请完整的填写联系人信息");
        }
      });
    }

    function handleDelete(item: SupplierEnterpriseLinkPersonDto) {
      ElMessageBox.confirm(
        "是否删除选中的联系人信息,删除后不能恢复?",
        "提示信息"
      ).then(() => {
        if (!props.supplierId) {
          const index = state.listData.findIndex((x) => x.id === item.id);
          const old = deepClone<SupplierEnterpriseLinkPersonDto[]>(
            state.listData
          );
          old.splice(index, 1);
          state.listData = old;
          Message.success("删除成功");
        } else {
          supplierContactApi.Delete(item.id).then((res) => {
            if (res?.isSuccessful) {
              loadData();
              Message.success("删除成功");
            }
          });
        }
      });
    }

    function loadData(val?: string) {
      if (val || props.supplierId) {
        GetListBySupplierId(val || props.supplierId).then((res) => {
          state.listData = res;
        });
      }
    }

    function clearContact() {
      state.listData = [];
    }
    watch(
      () => props.supplierId,
      (val) => {
        if (val) {
          loadData(val);
        }
      },
      { immediate: true }
    );
    /**
     * 获取数据
     */
    function GetData() {
      return state.listData;
    }
    onMounted(() => {});
    const showMore = ref(false);
    return {
      ...toRefs(state),
      formRef,
      handleNew,
      handleSave,
      handleDelete,
      handleEdit,
      GetData,
      showMore,
      clearContact
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";

.show-more-contact {
  display: flex;
  justify-content: flex-end;
}
</style>
