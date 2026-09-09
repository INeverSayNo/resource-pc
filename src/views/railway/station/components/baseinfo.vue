<template>
  <DcGap class="bar">
    基础信息
    <span class="desc">阅读({{ station?.readNum || 0 }})</span>
    <span class="bar-btn fr" @click="showEdit = true">
      <DLegacyIcon name="edit" class="" />
      编辑
    </span>
  </DcGap>
  <div class="base-info">
    <el-row>
      
      <el-col
        v-for="(item, index) in showData"
        :key="index"
        :span="item.colspan || 8"
        :class="item.class"
      >
        <span class="label">{{ item.label }}</span>
        <span v-if="typeof item.value === 'string'" class="value">
          {{ item.value }}{{ item.suffix || "" }}
        </span>
        <span v-else class="value">
          <template v-for="cItem in item.value as any[]" :key="cItem.value">
            <span
              v-if="cItem.clipboard"
              v-clipboard:value="cItem.value"
              class="theme-color mr-5 cu-pointer"
              v-html="createPrivatePhone(cItem.value).outerHTML"
            ></span>
            <span v-else class="mr-5">
              {{ cItem.value }}{{ cItem.suffix || "" }}
            </span>
          </template>
        </span>
      </el-col>
      <el-col v-if="station?.isStationary" :span="24">
        <span class="label">驻站人员</span>
        <span class="value">
          <span v-for="(user, index) in stationaryUsers" :key="user.id">
            {{ user.userName }}
            <span
              v-clipboard:value="user.phone"
              class="theme-color cu-pointer"
              :class="{ 'mr-5': index !== stationaryUsers.length - 1 }"
              v-html="createPrivatePhone(user.phone).outerHTML"
            ></span>
            <span v-if="index !== stationaryUsers.length - 1" class="mr-5">
              /
            </span>
          </span>
        </span>
      </el-col>
      <el-col :span="8">
        <span class="label">站点类型</span>
        <span class="value">{{ getStationType("natureTypesFormat") }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">办理种类</span>
        <span class="value">{{ getStationType("transactFormat") }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">服务对象</span>
        <span class="value">{{ getStationType("serviceFormat") }}</span>
      </el-col>
      <el-col :span="24">
        <span class="label">车站简介</span>
        <span class="value">{{ station?.introduction || "" }}</span>
      </el-col>
      <el-col :span="24">
        <span class="label">最后更新人</span>
        <span class="value">
          {{ station?.lastModifierName || station?.creatorName }}
          <span class="mr-5">
            {{
              formatTime(
                station?.lastModificationTime || station?.creationTime,
                "yyyy-MM-dd"
              )
            }}
          </span>
        </span>
      </el-col>
      
    </el-row>
  </div>
  <EditForm
    v-model="showEdit"
    :station="station"
    :stationary-users="stationaryUsers"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { RailWayStation, RailwayStationaryUser } from "../types";
import { useDetails } from "../useDetails";
import DcGap from "@/components/Gap/index.vue";
import EditForm from "./baseInfoForm.vue";
import { formatTime } from "@/utils";

export default defineComponent({
  components: {
    DcGap,
    EditForm
  },
  props: {
    station: {
      type: Object as PropType<RailWayStation>,
      default: () => {}
    },
    stationaryUsers: {
      type: Array as PropType<RailwayStationaryUser[]>,
      default: () => []
    }
  },
  emits: ["reload"],
  setup(props, { emit }) {
    const showEdit = ref(false);
    const { GetBaseInfShowData, getStationTag } = useDetails(false);
    const showData = computed(() => GetBaseInfShowData(props.station || {}));
    function handleSuccess() {
      emit("reload");
    }

    const getStationType = computed(
      () => (type: "serviceFormat" | "transactFormat" | "natureTypesFormat") => {
        if (
          !Reflect.get(props.station || {}, type) ||
          !Array.isArray(props.station?.[type])
        ) {
          return "暂无数据";
        }

        const [{ name }] = props.station![type]!;
        return name;
      }
    );

    return {
      formatTime,
      showData,
      showEdit,
      handleSuccess,
      getStationType,
      getStationTag
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
