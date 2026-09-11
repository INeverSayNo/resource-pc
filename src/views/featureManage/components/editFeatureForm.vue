<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  reactive,
  shallowRef,
  watch
} from "vue";
import {
  IApplicationItem,
  IApplicationModuleItem,
  IFeatureItem
} from "../types";
import { ElForm, ElLoading, ElMessage } from "element-plus";
import { CreateFeature, UpdateFeature } from "../api";
import useApplications from "../hooks/useApplicationList";
import DcTreeSelect from "@/components/TreeSelect/index.vue";
import { uploadSetting } from "../api";

export default defineComponent({
  name: "FeatureManageEditUserForm",
  components: {
    DcTreeSelect
  },
  props: {
    featureInfo: {
      type: Object as PropType<IFeatureItem | null>,
      default: () => null
    },
    show: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ["update:show", "success"],
  setup(props, { emit }) {
    const isEdit = computed(() => props.featureInfo && props.featureInfo.id);

    const showDialog = computed({
      get: () => props.show,
      set: (v) => emit("update:show", v)
    });

    const { applicationList } = useApplications();
    const defaultProps = {
      children: "modules",
      label: "name",
      value: "id"
    };

    const state = reactive({
      uploadFolder: uploadSetting.uploadFolder,
      imageUrl: "",
      acceptTypes: uploadSetting.acceptTypes,
      maxSize: uploadSetting.maxSize,
      uploadAction: uploadSetting.uploadAction,
      uploadHeaders: {
        Authorization: "bearer " + (localStorage.getItem("JsToken") || "")
      }
    });

    const dcTreeSelectRef = shallowRef<any>();
    const changeApplicationModuleId = (
      id: string,
      payload: Array<IApplicationItem | IApplicationModuleItem>
    ) => {
      const [item] = payload || [];
      if (Reflect.has(item || {}, "modules")) {
        featureFormState.applicationModuleId = "";
        ElMessage.warning("请选择末级节点");
        nextTick(() => {
          dcTreeSelectRef.value?.handleClear();
        });
      }
    };

    const editFormRef = shallowRef<InstanceType<typeof ElForm>>();

    const featureFormState = reactive({
      applicationModuleId: "",
      code: "",
      name: "",
      controllerName: "",
      actionName: "",
      url: "",
      level: 0,
      sort: 0,
      remark: "",
      isMenu: true,
      isShortCut: true,
      parameters: "",
      IconFile: {
        FilePath: "",
        FileName: "",
        FileSize: 0,
        FileType: "",
        FileRealName: ""
      },
      icon: ""
    });
    const rules = {
      code: [{ required: true, message: "请输入编码", trigger: "blur" }],
      name: [{ required: true, message: "请输入功能名称", trigger: "blur" }],
      controllerName: [
        { required: true, message: "请输入控制器名称", trigger: "blur" }
      ],
      actionName: [
        { required: true, message: "请输入方法名称", trigger: "blur" }
      ],
      address: [
        { required: true, message: "请输入机构名称/企业名称", trigger: "blur" }
      ],
      applicationModuleId: [
        { required: true, message: "请选择功能模块", trigger: "blur" }
      ]
    };
    const saveFeature = async () => {
      if (!editFormRef.value) return;
      await editFormRef.value.validate();

      const loadingInstance = ElLoading.service({
        fullscreen: true,
        lock: true,
        text: "功能保存中..."
      });
      featureFormState.icon = featureFormState.IconFile?.FilePath || "";
      const payload = { ...featureFormState };

      const fn = isEdit.value ? UpdateFeature : CreateFeature;
      await fn(payload, isEdit.value ? props.featureInfo!.id : "");
      loadingInstance.close();
      ElMessage.success("功能保存成功");
      emit("success");
      editFormRef.value.clearValidate();
      showDialog.value = false;
      setFeatureFormState(null);
    };

    const setFeatureFormState = (payload: IFeatureItem | null) => {
      featureFormState.applicationModuleId = payload?.applicationModuleId || "";
      featureFormState.code = payload?.code || "";
      featureFormState.name = payload?.name || "";
      featureFormState.controllerName = payload?.controllerName || "";
      featureFormState.actionName = payload?.actionName || "";
      featureFormState.url = payload?.url || "";
      featureFormState.remark = payload?.remark || "";
      featureFormState.level = payload?.level || 0;
      featureFormState.sort = payload?.sort || 0;
      featureFormState.isMenu = payload?.isMenu ?? true;
      featureFormState.isShortCut = payload?.isShortCut ?? true;
      featureFormState.parameters = payload?.parameters || "";
      featureFormState.remark = payload?.remark || "";
      featureFormState.IconFile.FilePath = payload?.icon || "";
      if (!payload?.icon) {
        state.imageUrl = "";
        return;
      }

      state.imageUrl = featureFormState.IconFile.FilePath;
    };

    watch(() => props.featureInfo, setFeatureFormState, {
      immediate: true,
      deep: true
    });

    const handleAvatarSuccess = (res: any, file: any) => {
      // state.imageUrl = URL.createObjectURL(file.raw);
      state.imageUrl = uploadSetting.UploadGetUrl + res.path;
      featureFormState.IconFile = {
        FileName: res.name,
        FilePath: uploadSetting.UploadGetUrl + res.path,
        FileSize: res.size,
        FileType: file.raw.type,
        FileRealName: file.name
      };
    };

    const beforeAvatarUpload = (file: any) => {
      const acceptTypesArr = state.acceptTypes.split(",");
      const isImage = acceptTypesArr.some((it) => it === file.type);
      const isLtMaxSize = file.size / 1024 / 1024 < state.maxSize;
      if (!isImage) {
        ElMessage.error("只能上传图片文件!");
        return false;
      }
      if (!isLtMaxSize) {
        ElMessage.error(`上传图片大小不能超过 ${state.maxSize}MB!`);
      }
      return isLtMaxSize && isLtMaxSize;
    };

    return {
      showDialog,
      isEdit,
      editFormRef,
      featureFormState,
      rules,
      saveFeature,
      applicationList,
      defaultProps,
      changeApplicationModuleId,
      dcTreeSelectRef,
      state,
      handleAvatarSuccess,
      beforeAvatarUpload
    };
  }
});
</script>
<template>
  <el-dialog
    v-model="showDialog"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="640px"
    destroy-on-close
    style="height: 300px"
  >
    <el-form
      ref="editFormRef"
      label-width="120px"
      label-suffix="："
      :model="featureFormState"
      :rules="rules"
      size="small"
      class="dialog-form"
    >
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="编码" prop="code">
            <el-input
              v-model="featureFormState.code"
              placeholder="请输入编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="功能模块" prop="applicationModuleId">
            <DcTreeSelect
              ref="dcTreeSelectRef"
              v-model:value="featureFormState.applicationModuleId"
              :data="applicationList"
              clearable
              only-leaf
              :default-props="defaultProps"
              placeholder="请选择功能模块"
              @change="changeApplicationModuleId"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="功能名称" prop="name">
            <el-input
              v-model="featureFormState.name"
              placeholder="请输入功能名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="控制器名称" prop="controllerName">
            <el-input
              v-model="featureFormState.controllerName"
              placeholder="请输入控制器名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="方法名称" prop="actionName">
            <el-input
              v-model="featureFormState.actionName"
              placeholder="请输入方法名称"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="url" prop="url">
            <el-input v-model="featureFormState.url" placeholder="请输入url" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="参数" prop="parameters">
            <el-input
              v-model="featureFormState.parameters"
              placeholder="请输入参数 eg:mask=true"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input
              v-model="featureFormState.sort"
              type="number"
              placeholder="请输入排序"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="是否菜单" prop="isMenu">
            <el-radio-group v-model="featureFormState.isMenu">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否快捷菜单" prop="isShortCut">
            <el-radio-group v-model="featureFormState.isShortCut">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="上传图片">
            <el-upload
              v-model="featureFormState.IconFile"
              class="avatar-uploader"
              :action="state.uploadAction"
              :show-file-list="false"
              list-type="picture-card"
              :auto-upload="true"
              :accept="state.acceptTypes"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="state.uploadHeaders"
            >
              <img
                v-if="state.imageUrl"
                :src="state.imageUrl"
                class="avatar"
                height="146"
                width="146"
                style="border-radius: 6px"
              />
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <div style="height: 146px">
            <p style="line-height: 25px">
              首先选用 SVG图标样式 作为应用图标，如未填写 SVG图标样式 ，则使用
              上传图片 作为应用图标。如果都为空，则使用系统默认应用图标。
            </p>
          </div>
        </el-col>

        <el-col :span="22">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="featureFormState.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 12 }"
              maxlength="200"
              show-word-limit
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveFeature">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
