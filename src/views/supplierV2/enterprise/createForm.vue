<template>
  <el-form
    ref="enterpriseRef"
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
          <el-select
            v-model="edit.supplierName"
            filterable
            remote
            reserve-keyword
            placeholder="请输入至少4个关键词"
            :remote-method="GetCompanyAuto"
            style="width: 250px"
            allow-create
            @change="SetCompanyInfo"
          >
            <el-option
              v-for="item in companyAutoOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="cu-pointer theme-color">
            <i title="工商信息" @click="openCommerce()">
              <el-icon><ElIconInfoFilled /></el-icon>
              工商信息
            </i>
          </span>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="简称">
          <el-input v-model="edit.shortName" placeholder="请输入供应商简称" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item>
          <template #label>
            <span class="theme-danger">*</span>
            供应商类型
          </template>
          <el-cascader
            v-model="enterpriseBusinessTypeIds"
            style="width: 100%"
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
              v-for="item in businessTypeData"
              :key="item.value"
              :disabled="!mainBusinessData.some((x) => x.value === item.value)"
              :label="item.value"
            >
              {{ item.text }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="供应商类型">
          <el-radio-group v-model="edit.supplierTypeId">
            <el-radio
              v-for="item in supplierType"
              :key="item.id"
              :label="item.id"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="归属机构"
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
      <el-col :span="12" v-if="type === 'railwayStation'">
        <el-form-item label="是否中铁供应商">
          <el-switch v-model="edit.isChinaRailway"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="自定义标签">
          <SupplierTag ref="tagRef" :supplier-id="supplierId"></SupplierTag>
        </el-form-item>
      </el-col>
      <el-col v-if="false" :span="12">
        <el-form-item
          prop="enterpriseExtend.accountId"
          :rules="[
            { required: true, message: '请输入登录账号', trigger: 'blur' }
          ]"
        >
          <template #label>
            设置登录账号
            <el-tooltip content="账号设置后不能修改，请谨慎设置">
              <el-icon style="margin-top: 9px" color="#e6a23c">
                <ElIconQuestionFilled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input
            v-model="edit.enterpriseExtend.accountId"
            :disabled="renderDisableAccount()"
            :maxlength="40"
            placeholder="请输入登录账号"
          />
        </el-form-item>
      </el-col>
      <el-col v-if="false" :span="12">
        <el-form-item v-if="!supplierId" label="默认密码">
          <el-input
            v-model="edit.enterpriseExtend.password"
            disabled
            placeholder="请输入登录账号"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <DcGap>
          <span class="gap-title">绑定联系人</span>
          <span class="gap-notice">
            至少绑定一个联系人，可通过绑定的手机号直接登录小程序
          </span>
        </DcGap>
        <ContactForm
          ref="contactRef"
          :supplier-id="supplierId"
          :business-type-data="mainBusinessData"
        />
      </el-col>
      <el-col v-if="showBank" :span="24">
        <DcGap>
          <span class="gap-title">收款账号</span>
          <span class="gap-notice">入库时非必须，完善后才能付款</span>
        </DcGap>
        <BankList ref="bankListRef" :suppler-id="supplierId" />
      </el-col>

      <el-row class="cert-container">
        <el-col :span="24">
          <DcGap class="cert-gap">
            <p>
              <span class="gap-title">资质证照</span>
              <span class="gap-notice">入库时非必须，完善后才能建合同</span>
            </p>
            <el-switch
              v-model="isUploadFile"
              inactive-text="立即完善:"
            />
          </DcGap>
        </el-col>
        <template v-if="isUploadFile">
          <el-col :span="12">
            <el-form-item
              :rules="
                showBusinessLicene
                  ? [
                      {
                        required: showBusinessLicene,
                        message: '营业执照',
                        trigger: 'blur'
                      }
                    ]
                  : []
              "
              prop="licenseFile"
              label="上传营业执照"
            >
              <dc-upload-image
                ref="licenseFileImg"
                folder="supplier"
                :file-list="oldLicenseFile"
                :limit="1"
                @success="(file) => handleUploadSuccess(file, 'licenseFileImg')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-row>
              <el-col :span="24">
                <el-form-item label="证件编号" prop="licenceNo">
                  <el-input
                    v-model="edit.licenceNo"
                    placeholder="请输入证件编号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="有效期至" prop="licenceExpiryDate">
                  <el-date-picker
                    v-model="edit.licenceExpiryDate"
                    placeholder="请选择有效期"
                    type="date"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有无质量体系认证">
              <el-switch
                v-model="edit.enterpriseExtend.hasCMDC"
                inline-prompt
              />
            </el-form-item>
          </el-col>
          <el-col v-if="edit.enterpriseExtend.hasCMDC" :span="12">
            <el-form-item
              :rules="[
                {
                  required: edit.enterpriseExtend.hasCMDC,
                  message: '上传质量体系认证',
                  trigger: 'blur'
                }
              ]"
              prop="enterpriseExtend.cmdcFile"
              label="上传质量体系认证"
            >
              <dc-upload-image
                ref="transitLicenseImg"
                folder="supplier"
                :file-list="oldFile"
                :limit="1"
                @success="
                  (file) => handleUploadSuccess(file, 'transitLicenseImg')
                "
              />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-row>
  </el-form>
  <!-- 工商信息 -->
  <com-dialog
    :model-value="companyDialogVisible"
    width="1000px"
    :destroy-on-close="true"
    title="工商信息"
    @close="companyDialogVisible = false"
  >
    <CompanyBase
      :company-name="companyName"
      :data="edit?.enterpriseExtend?.businessInfoJson"
    />
  </com-dialog>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  defineComponent,
  ref,
  PropType,
  computed,
  nextTick,
  unref,
  watch
} from "vue";
import {
  BusinessTypeEnum,
  EnterpriseBusinessTypeEnum,
  SupplierNatureEnum,
  SupplierTypeEnum
} from "../Enum";
import {
  SupplierEnterpriseExtendCreateOrUpdateDto,
  SupplierEnterpriseLinkPersonCreateOrUpdateDto,
  SupplierHeadCreateDto,
  SupplierHeadDto
} from "../types";

import { GETFILE_URL } from "@/request";

import ContactForm from "./contactForm.vue";
import BankList from "../components/bankList.vue";
import CompanyBase from "../components/CompanyBase.vue";
import { supplierHeadApi } from "../api";
import { FileAttach } from "@/utils/base-entity";
import { isUrlPath } from "@/utils";
import { ElLoading } from "element-plus";
import {
  GetCompanyAutoAsync,
  GetCompanyBaseDetailAsync
} from "@/api/qccApi";
import { SupplierTypeHeadTreeDto, SupplierTypeHeadDto } from "../types";
import { useSupplier } from "../useSupplier";
import { BaseData } from "@/api/dictionaryApi";
import { Message } from "@/components/Message";
import DcUploadImage from "@/components/UploadImg/uploadImage.vue";
import DcGap from "@/components/Gap/index.vue";
import OrgSelect from "@/components/OrganTreeSelect/index.vue";
import DcOrgUserSelect from "@/components/TableUserSelectV2/selectField.vue";
import SupplierTag from "../components/customTag.vue";
import { getPinYinFirst } from "@/utils/pinYin";
import useSupplierIsExist from "../useSupplierIsExist";

import { OcrBuinessLicense } from "@/api/ocrApi";
import { DcDeep } from "@dczy/tie-tools";

export default defineComponent({
  components: {
    DcUploadImage,
    DcGap,
    ContactForm,
    BankList,
    CompanyBase,
    DcOrgUserSelect,
    OrgSelect,
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
    const { GetBusinessTypeNamesAndValues, GetMainBusiness } = useSupplier();
    const { supplierIsExist } = useSupplierIsExist(emit);

    const tagRef = ref<InstanceType<typeof SupplierTag>>();
    const enterpriseRef = ref();
    const bankListRef = ref<InstanceType<typeof BankList>>();
    const contactRef = ref<InstanceType<typeof ContactForm>>();
    const companyAutoOptions = ref<any>([]);
    const companyDialogVisible = ref<any>(false); // 工商信息弹窗
    const companyName = ref<string>("");
    const state = reactive({
      edit: {
        supplierNature: SupplierNatureEnum.Enum.Enterprise.id,
        supplierTypeId: SupplierTypeEnum.Enum.Ordinary.id,
        isOverseas: false,
        ownerOrgName: "",
        ownerOrgRelationShipId: "",
        enterpriseExtend: {
          password: "123456",
          hasCMDC: false
        },
        isChinaRailway: false
      } as SupplierHeadCreateDto,
      editData: {} as SupplierHeadDto,
      enterpriseBusinessType: EnterpriseBusinessTypeEnum.getArray(),
      enterpriseBusinessTypeIds: [] as any[],
      otherEnterpriseBusinessType: "",
      businessType: BusinessTypeEnum.getArray(),
      businessTypeIds: [] as string[],
      supplierType: SupplierTypeEnum.getArray(),
      oldFile: [] as any,
      showBusinessLicene: false,
      oldLicenseFile: [] as any,
      contributorIds: "" as any
    });

    watch(
      () => props.supplierId,
      (val) => {
        if (val) {
          loadData(val);
        }
      },
      { immediate: true }
    );

    const mainBusinessData = computed(() => {
      return GetMainBusiness(
        state.enterpriseBusinessTypeIds,
        props.supplierTypeData,
        props.businessTypeData
      );
    });

    function validateAry(rule: any, value: any, callback: any) {
      if (rule.field === "businessTypeIds") {
        if (state.businessTypeIds?.length) {
          callback();
        } else {
          callback(new Error(rule.message));
        }
        return;
      }
      if (rule.field === "enterpriseBusinessTypeIds") {
        if (state.enterpriseBusinessTypeIds?.length) {
          callback();
        } else {
          callback(new Error(rule.message));
        }
      }
    }

    function renderShowOtherEnterpriseBusinessType() {
      // return state.enterpriseBusinessTypeIds.includes(EnterpriseBusinessTypeEnum.Enum.Other.id)
    }

    function handleUploadSuccess(
      file: any,
      type: "transitLicenseImg" | "licenseFileImg"
    ) {
      if (type === "transitLicenseImg") {
        state.edit.enterpriseExtend.cmdcFile = DcDeep.clone(file) as FileAttach;
      } else {
        const loadingInstance = ElLoading.service({
          fullscreen: true,
          text: "图片识别中，请稍后..."
        });

        const path =
          (isUrlPath(file.path) ? file.path : `${GETFILE_URL}${file.path}`) ||
          "";

        OcrBuinessLicense(path)
          .then((res) => {
            if (res?.licenseNumber) {
              state.edit.licenceNo = res.licenseNumber;
              if (res.effectiveEndDate) {
                state.edit.licenceExpiryDate = res.effectiveEndDate
                  .replace("年", "-")
                  .replace("月", "-")
                  .replace("日", "");
              }
            }
          })
          .catch(() => {
            Message.warning("图片设别失败，请检查图片是否正确！");
          })
          .finally(() => {
            loadingInstance?.close();
          });
        state.edit.licenseFile = DcDeep.clone(file) as FileAttach;
      }
    }

    /**
     * 加数据,编辑时使用
     */
    function loadData(val?: string) {
      if (val || props.supplierId) {
        const loading = ElLoading.service({ text: "数据加载中..." });
        supplierHeadApi
          .GetById(val || props.supplierId)
          .then((res) => {
            if (res?.isSuccessful) {
              mergeState(res.data);
            }
          })
          .finally(() => {
            loading.close();
          });
      }
    }
    function validate() {
      return new Promise((resolve) => {
        const contactList = contactRef.value?.GetData();
        if (!props.supplierId && !contactList?.length) {
          Message.warning("请至少新增一个联系人信息");
          resolve(false);
          return;
        }
        enterpriseRef.value?.validate((valid) => {
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
        const contactList = contactRef.value?.GetData();
        const bankList = bankListRef.value?.GetData();
        if (!props.supplierId && !contactList?.length) {
          Message.warning("请至少新增一个联系人信息");
          return false;
        }
        let result = false;
        await enterpriseRef.value?.validate((valid) => {
          if (valid) {
            result = true;
          } else {
            Message.warning("请完整的填写表单信息");
          }
        });
        if (result) {
          const old = DcDeep.clone<SupplierHeadCreateDto>(state.edit);
          old.businessTypeIds = state.businessTypeIds.join(",");
          old.businessTypeNames = state.businessTypeIds
            .map((x) => {
              return props.businessTypeData.find((y) => y.value === x)?.text;
            })
            .join(",");
          if (!old.enterpriseExtend.password) {
            old.enterpriseExtend.password = "123456";
          }
          old.enterpriseExtend.linkPersonList =
            contactList as SupplierEnterpriseLinkPersonCreateOrUpdateDto[];
          old.bankList = bankList;

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
    // 获取企业名称列表
    async function GetCompanyAuto(name?: any) {
      if (name.length >= 4) {
        const res = await GetCompanyAutoAsync(name);
        if (res?.length) {
          companyAutoOptions.value = res.map((item?: any) => {
            return {
              value: `${item.name}`,
              label: `${item.name}`
            };
          });
        }
      }
    }
    function SetCompanyInfo() {
      GetCompanyBaseDetailAsync(state.edit.supplierName).then((res: any) => {
        if (res) {
          state.showBusinessLicene = false;
          state.edit.enterpriseExtend.businessInfoJson = JSON.stringify(
            res.result
          );
          state.edit.enterpriseExtend.supplierDutyCode = res.result.creditCode; // 信用代码、纳税人识别号
          state.edit.enterpriseExtend.enterpriseType =
            res.result.companyOrgType; // 企业类型
          state.edit.enterpriseExtend.industryMark = res.result.industryMark; // 客户行业
          state.edit.enterpriseExtend.industryName = res.result.industryName; // 客户行业
          state.edit.enterpriseExtend.legalName = res.result.legalPersonName;
          state.edit.enterpriseExtend.registDate = new Date(
            res.result.estiblishTime
          ); // 成立时间
          state.edit.enterpriseExtend.staffSize = res.result.staffNumRange; // 人员规模
          var numArr = res.result.regCapital.match(/\d+/g);
          if (numArr?.length) {
            state.edit.enterpriseExtend.registeredCapital = numArr[0]; // 注册资本
          }
          // enterpriseEdit.value.registeredAddress = res.result.regLocation; // 注册地址
          state.edit.enterpriseExtend.businessScope = res.result.businessScope; // 经营范围
          state.edit.enterpriseExtend.registAddress = res.result.regLocation; // 详细地址
          if (res.result.regLocationRegionCode) {
            // var regionarr = res.result.regLocationRegionCode.split(",");
            // edit.value.placeRegionCode = regionarr; // 所在地区
            // edit.value.placeRegionName = res.result.regLocationRegionName;
          }
          // if (!state.edit.enterpriseExtend.accountId) {
          //   state.edit.enterpriseExtend.accountId =
          //     res.result.pinYinFirstCode.length > 10
          //       ? res.result.pinYinFirstCode.substr(0, 10)
          //       : res.result.pinYinFirstCode;
          //   state.edit.enterpriseExtend.password = "123456";
          // }
        } else {
          state.showBusinessLicene = true;
        }
      });
      supplierIsExist(
        state.edit.supplierName,
        SupplierNatureEnum.Enum.Enterprise.id,
        () => {
          state.edit.shortName = "";
          state.businessTypeIds = [];
          state.enterpriseBusinessTypeIds = [];
          state.edit.enterpriseExtend.enterpriseBusinessTypeIds = "";
          state.edit.enterpriseExtend.enterpriseBusinessTypeNames = "";
          contactRef.value?.clearContact();
          bankListRef.value?.clearBankList();
        }
      );
    }
    // 打开工商信息
    function openCommerce() {
      if (state.showBusinessLicene) {
        Message.warning("请输入正确的企业名称");
        return;
      }
      if (state.edit.supplierName) {
        companyName.value = state.edit.supplierName;
        companyDialogVisible.value = true;
      } else {
        Message.warning("请输入企业名称");
      }
    }

    function handleChangeBusinessType(val: any[]) {
      const v = GetBusinessTypeNamesAndValues(val, props.supplierTypeData);
      state.edit.enterpriseExtend.enterpriseBusinessTypeIds = v.values;
      state.edit.enterpriseExtend.enterpriseBusinessTypeNames = v.names;
      nextTick(() => {
        state.businessTypeIds =
          mainBusinessData.value?.map((x) => x.value) || [];
      });
    }
    function handleChangeContributorId(val, data: any) {
      state.edit.contributorId = (val || "").toString();
      state.edit.contributorName = data?.userName || "";
    }
    function renderDisableAccount() {
      const temp = unref(state.editData);
      return (
        (!!props.supplierId && !!temp.enterpriseExtend?.accountId) || false
      );
    }

    const isUploadFile = ref(false);

    const isInner = computed(() => props.updateChannel === "inner");

    function mergeState(data) {
      state.editData = data;
      state.edit = {
        isScrap: data.isScrap,
        supplierName: data.supplierName,
        supplierNature: data.supplierNature,
        businessTypeIds: data.businessTypeIds,
        businessTypeNames: data.businessTypeNames,
        paymentTypeIds: data.paymentTypeIds,
        paymentTypeNames: data.paymentTypeNames,
        supplierTypeId: data.supplierTypeId,
        lastAssessLevelId: data.lastAssessLevelId,
        sourceSys: data.sourceSys,
        sourceId: data.sourceId,
        isAudit: data.isAudit,
        auditStatus: data.auditStatus,
        auditRemark: data.auditRemark,
        workflowId: data.workflowId,
        contributorId: data.contributorId,
        contributorName: data.contributorName,
        isOverseas: data.isOverseas || false,
        integralLevel: data.integralLevel,
        cooperationNum: data.cooperationNum,
        cooperationAvgPrice: data.cooperationAvgPrice,
        readNum: data.readNum,
        shortName: data.shortName,
        isChinaRailway: data.isChinaRailway,
        ownerOrgRelationShipId: isInner.value
          ? ""
          : data.lastOwnerOrgRelationShipId,
        ownerOrgName: isInner.value ? "" : data.lastOwnerOrgName,
        enterpriseExtend: DcDeep.clone(
          data.enterpriseExtend || {}
        ) as SupplierEnterpriseExtendCreateOrUpdateDto
      } as SupplierHeadCreateDto;

      state.businessTypeIds =
        state.editData.businessTypeIds?.split(",").map((x) => x) || [];
      state.enterpriseBusinessTypeIds = (
        state.editData.enterpriseExtend?.enterpriseBusinessTypeIds?.split(
          "|"
        ) || []
      ).map((v) => {
        return v.split(".");
      });
      state.contributorIds = isInner.value
        ? []
        : state.editData.contributorId
        ? DcDeep.clone(state.editData.contributorId)
        : "";

      if (state.editData.licenseFile?.id) {
        const file = state.editData.licenseFile;
        state.oldLicenseFile = [
          {
            ...file,
            path: file.filePath,
            name: file.fileRealName
          }
        ];
        state.showBusinessLicene = true;
        state.edit.licenseFile = DcDeep.clone(file);
      }

      if (state.editData.enterpriseExtend?.cmdcFile) {
        const file = state.editData.enterpriseExtend.cmdcFile;
        state.oldFile = [
          {
            ...file,
            path: file.filePath,
            name: file.fileRealName
          }
        ];
      }
    }

    return {
      ...toRefs(state),
      companyAutoOptions,
      enterpriseRef,
      bankListRef,
      contactRef,
      validateAry,
      loadData,
      saveData,
      handleUploadSuccess,
      renderShowOtherEnterpriseBusinessType,
      GetCompanyAuto,
      SetCompanyInfo,
      openCommerce,
      companyDialogVisible,
      companyName,
      handleChangeBusinessType,
      mainBusinessData,
      renderDisableAccount,
      handleChangeContributorId,
      validate,
      isUploadFile,
      tagRef
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";

.cert-container {
  width: 100%;
  & > :first-child {
    margin-bottom: 10px;
  }
}
.cert-gap {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
