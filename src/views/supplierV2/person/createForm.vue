<template>
  <el-form
    ref="personRef"
    class="dialog-form"
    label-width="130px"
    :model="edit"
  >
    <el-row>
      <el-col :span="12">
        <el-form-item
          label="供应商名称"
          prop="supplierName"
          :rules="[
            { required: true, message: '请输入供应商名称', trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="edit.supplierName"
            placeholder="请输入供应商名称"
            @blur="getSupplierByName"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="type === 'railwayStation'">
        <el-form-item label="是否中铁供应商">
          <el-switch v-model="edit.isChinaRailway"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item
          prop="personBusinessTypeIds"
          :rules="[
            {
              validator: validateAry,
              message: '请选择供应商类型',
              trigger: 'change'
            }
          ]"
        >
          <template #label>
            <span class="theme-danger">*</span>
            供应商类型
          </template>
          <el-cascader
            v-model="personBusinessTypeIds"
            :options="supplierTypeTreeData"
            :props="{
              multiple: true,
              checkStrictly: true,
              value: 'code',
              label: 'name',
              children: 'children'
            }"
            filterable
            @change="handleChangeBusinessType"
          />
          <!-- <el-checkbox-group v-model="personBusinessTypeIds">
            <el-checkbox v-for="item in personBusinessType" :key="item.id" :label="item.id">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group> -->
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item
          prop="businessTypeIds"
          :rules="[
            {
              validator: validateAry,
              message: '请选择主营业务',
              trigger: 'change'
            }
          ]"
        >
          <template #label>
            <span class="theme-danger">*</span>
            主营业务
          </template>
          <el-checkbox-group v-model="businessTypeIds">
            <el-checkbox
              v-for="item in businessTypeData.filter((x) =>
                personMainBusinessTypeFilter.includes(x.value)
              )"
              :key="item.value"
              :disabled="!mainBusinessData.some((x) => x.value === item.value)"
              :label="item.value"
            >
              {{ item.text }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="联系人姓名"
          prop="personExtend.contact"
          disabled
          :rules="[
            { required: true, message: '请输入联系人姓名', trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="edit.personExtend.contact"
            clearable
            placeholder="请输入联系人姓名"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="联系人电话"
          prop="personExtend.contactPhone"
          :rules="[
            { required: true, message: '请输入联系人电话', trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="edit.personExtend.contactPhone"
            clearable
            placeholder="请输入联系人电话"
          />
        </el-form-item>
      </el-col>
      <el-row style="width: 100%">
        <el-col :span="12">
          <el-form-item
            label="归属机构"
            class="person-owner-org"
            prop="ownerOrgRelationShipId"
            :rules="[
              { required: true, message: '请选择所属机构', trigger: 'blur' }
            ]"
          >
            <OrgSelect
              v-model="edit.ownerOrgRelationShipId"
              clearable
              filterable
              placeholder="请选择归属机构"
              :automatic-dropdown="updateOwnerOg"
              :include-functional="true"
              @change="
                (v, data) => {
                  if (data?.length) edit.ownerOrgName = data[0].text;
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="贡献者"
            prop="contributorId"
            :rules="[
              { required: true, message: '请选择贡献者', trigger: 'blur' }
            ]"
          >
            <DcOrgUserSelect
              v-model="contributorIds"
              :show-tree="false"
              placeholder="请选择贡献者"
              @change="handleChangeContributorId"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-col :span="12">
        <el-form-item prop="personExtend.idCardBackFile">
          <template #label>
            身份证
            <div class="fs-12 theme-warning">(人像面)</div>
          </template>
          <DcUploadImage
            ref="idcarBackImg"
            folder="supplier"
            :file-list="oldbackFile"
            :limit="1"
            @success="(file) => handleUploadSuccess(file, 'front')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="personExtend.idCardFrontFile">
          <template #label>
            身份证
            <div class="fs-12 theme-warning">(国徽面)</div>
          </template>
          <DcUploadImage
            ref="idCardFrontImg"
            folder="supplier"
            :file-list="oldFrontFile"
            :limit="1"
            @success="(file) => handleUploadSuccess(file, 'back')"
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="身份证号" prop="personExtend.idCardNo">
          <el-input
            v-model="edit.personExtend.idCardNo"
            placeholder="上传身份证后自动设别"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="有效期" prop="personExtend.idCardExpiryDate">
          <!-- <el-input
            v-model="renderIdCardExpiryDate"
            placeholder="上传照片后自动设别"
          /> -->
          <el-date-picker
            v-model="edit.personExtend.idCardExpiryDate"
            type="date"
            placeholder="请选择有效期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :editable="false"
            :disabled-date="isDisableDate"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="住址" prop="personExtend.address">
          <el-input
            v-model="edit.personExtend.address"
            placeholder="请输入现居住地"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="概况介绍" prop="personExtend.description">
          <el-input
            v-model="edit.personExtend.description"
            type="textarea"
            :rows="3"
            :maxlength="250"
            show-word-limit
            placeholder="请输入概况介绍"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="自定义标签">
          <SupplierTag ref="tagRef" :supplier-id="supplierId"></SupplierTag>
        </el-form-item>
      </el-col>
      <template v-if="showBank">
        <el-col :span="24" style="margin-bottom: 10px">
          <DcGap>
            <span class="gap-title">收款账号</span>
            <span class="gap-notice">入库时非必须，完善后才能付款</span>
          </DcGap>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="账户"
            prop="bankAccount"
            :rules="[
              {
                validator: validateBank,
                message: '请输入账户名',
                trigger: 'blur'
              }
            ]"
          >
            <template #label>
              <span class="theme-danger">*</span>
              账户
            </template>
            <el-input
              v-model="editBank.bankAccount"
              placeholder="请输入账户名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="银行账号"
            prop="bankNo"
            :rules="[
              {
                validator: validateBank,
                message: '请输入银行账号',
                trigger: 'blur'
              }
            ]"
          >
            <template #label>
              <span class="theme-danger">*</span>
              银行账号
            </template>
            <el-input v-model="editBank.bankNo" placeholder="请输入银行账户" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="开户银行"
            prop="bankName"
            :rules="[
              {
                validator: validateBank,
                message: '请输入开户银行',
                trigger: 'blur'
              }
            ]"
          >
            <template #label>
              <span class="theme-danger">*</span>
              开户银行
            </template>
            <el-input
              v-model="editBank.bankName"
              placeholder="请输入开户银行"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账户类型" prop="bankAccountType">
            <el-radio-group v-model="editBank.bankAccountType">
              <el-radio-button
                v-for="item in accountType"
                :key="item.id"
                :label="item.id"
              >
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
  </el-form>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  defineComponent,
  watch,
  ref,
  computed,
  PropType,
  nextTick,
  Directive
} from "vue";
import {
  BusinessTypeEnum,
  PersonBusinessTypeEnum,
  SupplierNatureEnum,
  SupplierTypeEnum
} from "../Enum";
import {
  SupplierBankInfoCreateOrUpdateDto,
  SupplierHeadCreateDto
} from "../types";
import { useSupplier } from "../useSupplier";
import { isUrlPath } from "@/utils";
import { GetDefaultBankBySupplierId, supplierHeadApi } from "../api";
import { AccountTypeEnum, FileAttach } from "@/utils/base-entity";
import { OcrIdCardBack, OcrIdCardFont } from "@/api/ocrApi";
import OrgSelect from "@/components/OrganTreeSelect/index.vue";
import DcOrgUserSelect from "@/components/TableUserSelectV2/selectField.vue";
import SupplierTag from "../components/customTag.vue";
import { SupplierTypeHeadDto, SupplierTypeHeadTreeDto } from "../types";
import { BaseData } from "@/api/dictionaryApi";
import { GETFILE_URL } from "@/request";
import { Message } from "@/components/Message";
import DcUploadImage from "@/components/UploadImg/uploadImage.vue";
import DcGap from "@/components/Gap/index.vue";
import useSupplierIsExist from "../useSupplierIsExist";
import { DcDate, DcDeep } from "@dczy/tie-tools";

// 个体主营业务显示控制
const personMainBusinessTypeFilter = ["1", "3", "5", "6", "99"];

export default defineComponent({
  components: {
    DcUploadImage,
    DcGap,
    OrgSelect,
    DcOrgUserSelect,
    SupplierTag
  },
  props: {
    supplierId: {
      type: String,
      default: () => ""
    },
    showBank: {
      type: Boolean,
      default: () => true
    },
    supplierTypeTreeData: {
      type: Array as PropType<Array<SupplierTypeHeadTreeDto>>,
      default: () => []
    },
    supplierTypeData: {
      type: Array as PropType<Array<SupplierTypeHeadDto>>,
      default: () => []
    },
    businessTypeData: {
      type: Array as PropType<Array<BaseData>>,
      default: () => []
    },
    updateOwnerOg: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    updateChannel: {
      type: String as PropType<"inner" | "outer">,
      default: "outer"
    },
    type: { 
      type:String as PropType<"waterPort" | "railwayStation">,
      default: "railwayStation"
    }
  },
  emits: ["openDetailDialog", "closeDialog", "openEditDialog", "clearSupplierId"],
  setup(props, { emit }) {
    const { GetSupplierById, GetBusinessTypeNamesAndValues, GetMainBusiness } =
      useSupplier();
    const { supplierIsExist } = useSupplierIsExist(emit);
    const tagRef = ref<InstanceType<typeof SupplierTag>>();
    const personRef = ref();
    const state = reactive({
      edit: {
        supplierNature: SupplierNatureEnum.Enum.Personal.id,
        supplierTypeId: SupplierTypeEnum.Enum.Ordinary.id,
        personExtend: {},
        ownerOrgRelationShipId: "",
        ownerOrgName: "",
        isChinaRailway: false
      } as SupplierHeadCreateDto,
      editBank: {
        bankAccountType: AccountTypeEnum.Enum.Person.id,
        isDefault: true
      } as SupplierBankInfoCreateOrUpdateDto,
      personBusinessType: PersonBusinessTypeEnum.getArray(),
      businessType: BusinessTypeEnum.getArray({ isPerson: true }),
      accountType: AccountTypeEnum.getArray(),
      personBusinessTypeIds: [] as any[],
      businessTypeIds: [] as string[],
      oldFrontFile: [] as any,
      oldbackFile: [] as any,
      contributorIds: "" as any
    });
    const mainBusinessData = computed(() => {
      return GetMainBusiness(
        state.personBusinessTypeIds,
        props.supplierTypeData,
        props.businessTypeData
      );
    });
    function validateAry(rule: any, value: any, callback: any) {
      const col = rule.field;
      if (col === "personBusinessTypeIds") {
        if (state.personBusinessTypeIds?.length) {
          console.log(rule, state.personBusinessTypeIds);
          callback();
        } else {
          callback(new Error(rule.message));
        }
        return;
      }
      if (col === "businessTypeIds") {
        if (state.businessTypeIds?.length) {
          console.log(rule, state.businessTypeIds);
          callback();
        } else {
          callback(new Error(rule.message));
        }
        return;
      }
    }

    /** 验证银行信息 */
    function validateBank(rule: any, value: any, callback: any) {
      const col = rule.field;
      if (col === "bankAccount" && state.editBank.bankAccount) {
        callback();
        return;
      }
      if (col === "bankName" && state.editBank.bankName) {
        callback();
        return;
      }
      if (col === "bankNo" && state.editBank.bankNo) {
        callback();
        return;
      }
      callback(new Error(rule.message));
    }

    /**
     * 图片上传成功，设别
     */
    function handleUploadSuccess(file: any, type: "back" | "front") {
      const fileObj = {
        fileName: file.FileName,
        filePath: file.FilePath,
        fileRealName: file.FileRealName,
        fileSize: file.FileSize,
        fileType: file.FileType,
        creationDate: file.CreationDate
      } as FileAttach;

      const path =
        (isUrlPath(fileObj.filePath)
          ? fileObj.filePath
          : `${GETFILE_URL}${fileObj.filePath}`) || "";
      if (type === "front") {
        state.edit.personExtend.idCardBackFile = fileObj;
        OcrIdCardFont(path).then((res) => {
          if (res?.idNum) {
            state.edit.personExtend.idCardNo = res.idNum;
            state.edit.personExtend.idCardAddress = res.address;
            state.edit.personExtend.contact = res.name || "";
          }
        });
      } else {
        state.edit.personExtend.idCardFrontFile = fileObj;
        OcrIdCardBack(path).then((res) => {
          if (res?.expiryDateFormat) {
            if (res?.expiryDate === "长期") {
              state.edit.personExtend.idCardExpiryDate = new Date("9999-12-01");
            } else {
              state.edit.personExtend.idCardExpiryDate = res.expiryDateFormat;
            }
          }
        });
      }
    }

    const isInner = computed(() => props.updateChannel === "inner");

    /** 加载编辑数据 */
    function loadEditData(val?: string) {
      GetSupplierById(val || props.supplierId).then((res) => {
        state.edit = Object.assign(DcDeep.clone(res), {
          ownerOrgRelationShipId: isInner.value
            ? ""
            : res.lastOwnerOrgRelationShipId,
          ownerOrgName: isInner.value ? "" : res.lastOwnerOrgName
        });
        state.personBusinessTypeIds = (
          res.personExtend?.personBusinessTypeIds?.split("|") || []
        ).map((v) => {
          return v.split("/");
        });

        state.businessTypeIds =
          res.businessTypeIds?.split(",").map((x) => x) || [];
        state.contributorIds = isInner.value
          ? []
          : res.contributorId
          ? res.contributorId
          : "";

        if (res.personExtend?.idCardFrontFile) {
          state.oldFrontFile = [
            {
              ...res.personExtend?.idCardFrontFile,
              path: res.personExtend?.idCardFrontFile?.filePath,
              name: res.personExtend?.idCardFrontFile?.fileRealName
            }
          ];
        }
        if (res.personExtend?.idCardBackFile) {
          state.oldbackFile = [
            {
              ...res.personExtend?.idCardBackFile,
              path: res.personExtend?.idCardBackFile?.filePath,
              name: res.personExtend?.idCardBackFile?.fileRealName
            }
          ];
        }
      });
      if (props.showBank) {
        GetDefaultBankBySupplierId(val || props.supplierId).then((res) => {
          state.editBank = DcDeep.clone(res);
        });
      }
    }
    function handleChangeContributorId(val, data: any) {
      state.edit.contributorId = val || "";
      state.edit.contributorName = data?.userName || "";
    }
    function validate() {
      return new Promise((resolve) => {
        personRef.value?.validate((valid) => {
          if (valid) {
            resolve(true);
          } else {
            Message.warning("请完整的填写表单信息");
            resolve(false);
          }
        });
      });
    }
    /**
     * 保存数据
     */
    async function saveData(isAudit: boolean, callback?: any) {
      try {
        let result = false;
        await personRef.value?.validate((valid) => {
          if (valid) {
            result = true;
          } else {
            Message.warning("请完整的填写表单信息");
          }
        });
        if (result) {
          const old = DcDeep.clone<SupplierHeadCreateDto>(state.edit);
          if (
            !Reflect.has(old.personExtend.idCardFrontFile || {}, "fileName")
          ) {
            old.personExtend.idCardFrontFile = undefined;
          }
          if (!Reflect.has(old.personExtend.idCardBackFile || {}, "fileName")) {
            old.personExtend.idCardBackFile = undefined;
          }
          old.businessTypeIds = state.businessTypeIds.join(",");
          old.businessTypeNames = state.businessTypeIds
            .map((x) => {
              return props.businessTypeData.find((y) => y.value === x)?.text;
            })
            .join(",");
          if (props.showBank) {
            old.bankList = [
              {
                ...state.editBank
              }
            ];
          }

          if (props.supplierId) {
            // 保存标签信息
            tagRef.value?.Save();
            result = await supplierHeadApi
              .OpionDefine(
                `${props.supplierId}/update?isSubmit=${isAudit}`,
                old,
                "PUT",
                false
              )
              .then((res) => {
                if (callback) callback(res, old);
                return (res?.data || false) as boolean;
              })
              .catch(() => {
                if (callback) callback(false, null);
                return false;
              });
          } else {
            result = await supplierHeadApi
              .OpionDefine(`create?isSubmit=${isAudit}`, old, "POST", false)
              .then((res) => {
                // 保存标签信息
                const supplierId = res?.multipleData?.Id || props.supplierId;
                tagRef.value?.Save(supplierId);
                if (callback) callback(res, old);
                return (res?.data || false) as boolean;
              })
              .catch(() => {
                if (callback) callback(false, null);
                return false;
              });
          }
        } else {
          if (callback) callback(false, null);
          return result;
        }
      } catch (error) {
        if (callback) callback(false, null);
        return false;
      }
    }
    const renderIdCardExpiryDate = computed(() => {
      const date = DcDate.format(
        state.edit.personExtend.idCardExpiryDate || "",
        "YYYY-MM-DD"
      );

      if (date === "9999-12-01") {
        return "长期";
      }
      return date;
    });

    function handleChangeBusinessType(val: any[]) {
      const v = GetBusinessTypeNamesAndValues(val, props.supplierTypeData);
      state.edit.personExtend.personBusinessTypeIds = v.values;
      state.edit.personExtend.personBusinessTypeNames = v.names;
      nextTick(() => {
        state.businessTypeIds =
          mainBusinessData.value?.map((x) => x.value) || [];
      });
    }

    watch(
      () => props.supplierId,
      (val) => {
        if (val) {
          loadEditData(val);
        }
      },
      { immediate: true }
    );

    const currentDate = new Date();
    const futureDate = new Date(
      new Date().setFullYear(currentDate.getFullYear() + 30)
    );
    function isDisableDate(time: Date) {
      return !(
        time.getTime() > currentDate.getTime() &&
        time.getTime() < futureDate.getTime()
      );
    }

    function getSupplierByName() {
      supplierIsExist(
        state.edit.supplierName,
        SupplierNatureEnum.Enum.Personal.id,
        () => {
          state.businessTypeIds = [];
          state.personBusinessTypeIds = [];
          state.edit.personExtend.personBusinessTypeIds = "";
          state.edit.personExtend.personBusinessTypeNames = "";
          state.oldFrontFile = [];
          state.oldbackFile = [];
          state.edit.personExtend.contact = "";
          state.edit.personExtend.contactPhone = "";
          state.edit.personExtend.idCardNo = "";
          (state.edit.personExtend.idCardExpiryDate as any) = "";
          state.edit.personExtend.idCardAddress = "";
          state.edit.personExtend.idCardBackFile = {};
        }
      );
    }
    return {
      ...toRefs(state),
      personRef,
      validateAry,
      validateBank,
      saveData,
      handleUploadSuccess,
      renderIdCardExpiryDate,
      handleChangeBusinessType,
      mainBusinessData,
      personMainBusinessTypeFilter,
      validate,
      handleChangeContributorId,
      supplierIsExist,
      SupplierNatureEnum,
      isDisableDate,
      getSupplierByName
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
