<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  shallowRef,
  watch
} from "vue";
import { ISaveUserPayload, UserItem } from "../types";
import { ElForm, ElLoading, ElMessage } from "element-plus";
import usePositions from "../hooks/usePosition";
import { validatePhone } from "@/utils";
import { CreateUser, UpdateUser } from "../api";

export default defineComponent({
  name: "UserManageEditUserForm",
  props: {
    userInfo: {
      type: Object as PropType<UserItem | null>,
      default: () => null
    },
    show: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ["update:show", "success"],
  setup(props, { emit }) {
    const { positionList } = usePositions({ immediateQuery: false });

    const isEdit = computed(() => props.userInfo && props.userInfo.id);

    const showDialog = computed({
      get: () => props.show,
      set: (v) => emit("update:show", v)
    });

    const editFormRef = shallowRef<InstanceType<typeof ElForm>>();

    const userFormState = reactive({
      logonName: "",
      positionId: "",
      code: "",
      userName: "",
      password: "",
      gender: null as null | boolean,
      phone: "",
      address: "",
      isOutSide: false,
      isSuperMgr: false,
      isFreeze: false,
      freezeReason: "",
      remark: ""
    });
    const rules = {
      logonName: [{ required: true, message: "请输入登录名", trigger: "blur" }],
      positionId: [
        { required: true, message: "请选择角色", trigger: "change" }
      ],
      code: [{ required: true, message: "请输入员工编码", trigger: "blur" }],
      userName: [
        { required: true, message: "请输入真实姓名", trigger: "blur" }
      ],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
      address: [
        { required: true, message: "请输入机构名称/企业名称", trigger: "blur" }
      ],
      gender: [{ required: true, message: "请选择性别", trigger: "change" }]
    };
    const saveUser = async () => {
      if (!editFormRef.value) return;
      await editFormRef.value.validate();

      const loadingInstance = ElLoading.service({
        fullscreen: true,
        lock: true,
        text: "用户保存中..."
      });
      const payload: ISaveUserPayload = { ...userFormState, logonName: userFormState.phone };
      if (isEdit.value) {
        delete payload["password"];
      }
      const fn = isEdit.value ? UpdateUser : CreateUser;
      await fn(payload, isEdit.value ? props.userInfo!.id : "");
      loadingInstance.close();
      ElMessage.success("用户保存成功");
      emit("success");
      editFormRef.value.clearValidate();
      setUserFormState(null);
      showDialog.value = false;
    };

    const setUserFormState = (payload: UserItem | null) => {
      userFormState.logonName = payload?.logonName || "";
      userFormState.positionId = payload?.positionId || "";
      userFormState.code = payload?.code || "";
      userFormState.userName = payload?.userName || "";
      userFormState.password = "";
      userFormState.gender =
        typeof payload?.gender === "boolean" ? payload?.gender : null;
      userFormState.phone = payload?.phone || "";
      userFormState.address = payload?.address || "";
      userFormState.isOutSide = payload?.isOutSide || false;
      userFormState.isSuperMgr = payload?.isSuperMgr || false;
      userFormState.isFreeze = payload?.isFreeze || false;
      userFormState.freezeReason = payload?.freezeReason || "";
      userFormState.remark = payload?.remark || "";
    };

    watch(() => props.userInfo, setUserFormState, { immediate: true });

    return {
      showDialog,
      isEdit,
      editFormRef,
      userFormState,
      rules,
      positionList,
      saveUser
    };
  }
});
</script>
<template>
  <el-dialog
    v-model="showDialog"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    destroy-on-close
    style="height: 300px"
  >
    <el-form
      ref="editFormRef"
      label-width="100px"
      label-suffix="："
      :model="userFormState"
      :rules="rules"
      size="small"
      class="dialog-form"
    >
      <el-row :gutter="10">
        <!-- <el-col :span="12">
          <el-form-item label="登录名" prop="logonName">
            <el-input
              v-model="userFormState.logonName"
              placeholder="请输入登录名"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="用户角色" prop="positionId">
            <el-select
              v-model="userFormState.positionId"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in positionList"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="员工编码" prop="code">
            <el-input
              v-model="userFormState.code"
              placeholder="请输入员工编码"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="真实姓名" prop="userName">
            <el-input
              v-model="userFormState.userName"
              placeholder="请输入真实姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="userFormState.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="!isEdit">
          <el-form-item label="登录密码" prop="password">
            <el-input
              v-model="userFormState.password"
              type="password"
              show-password
              placeholder="请输入登录密码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="userFormState.gender">
              <el-radio :label="true">男</el-radio>
              <el-radio :label="false">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="所属单位" :prop="isEdit?'':'address'">
            <el-input
              v-model="userFormState.address"
              placeholder="请输入所属单位/企业名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否超管"
            prop="isSuperMgr"
          >
            <el-radio-group v-model="userFormState.isSuperMgr">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否冻结" prop="isFreeze">
            <el-radio-group v-model="userFormState.isFreeze">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item
            label="是否外部员工"
            prop="isOutSide"
            label-width="120px"
          >
            <el-radio-group v-model="userFormState.isOutSide">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col> -->

        
        <el-col :span="22" v-show="userFormState.isFreeze">
          <el-form-item label="冻结原因" prop="freezeReason">
            <el-input
              v-model="userFormState.freezeReason"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 12 }"
              maxlength="200"
              show-word-limit
              placeholder="请输入冻结原因"
            />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="userFormState.remark"
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
        <el-button type="primary" @click="saveUser">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
