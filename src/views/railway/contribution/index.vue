<!--
 * @Author: cky 1690696987@qq.com
 * @Date: 2025-09-16 16:12:16
 * @LastEditors: cky 1690696987@qq.com
 * @LastEditTime: 2026-08-18 17:17:54
 * @FilePath: \DC.Resource.VueElementUI\src\pages\index\views\railway\contribution\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-form-item label="贡献人" prop="contributor">
        <el-tooltip class="item" effect="light" content="贡献人与贡献时间为数据提供者与提供时间" placement="bottom">
          <DcOrgUserSelect
            v-model="contributorRef"
            :show-tree="false"
            placeholder="请选择贡献人"
            @change="handleContributorChange"
          />
        </el-tooltip>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="贡献时间" prop="contributionaTime">
        <el-date-picker style="width: 100%;"  v-model="contributionaTimeRef" type="date" placeholder="请选择贡献时间" @change="handleContributionDateChange"></el-date-picker>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, onMounted } from 'vue';
import DcOrgUserSelect from "@/components/TableUserSelectV2/selectField.vue";
import { formatTime } from "@/utils";
export default defineComponent({
  components: {
    DcOrgUserSelect
  },
  props: {
    contributor: {
      type: String as PropType<string>,
      required: true,
      default: () =>''
    },
    contributionaTime: {
      type: String as PropType<string>,
      required: true,
      default: () =>''
    }
  },
  emits: ['update:contributor', 'update:contributionaTime'],
  setup(props, { emit }) {
    const contributorRef = ref(''); //ref(props.contributor);
    const contributionaTimeRef = ref(props.contributionaTime);

    watch(() => props.contributor, (newVal) => {
      //contributorRef.value = newVal;
    });
    watch(() => props.contributionaTime, (newVal) => {
      contributionaTimeRef.value = newVal;
    });

    const handleContributorChange = (_, data: any) => {
      contributorRef.value = data?.id || "";
      emit('update:contributor', data?.userName || "");
    };
    const handleContributionDateChange = (newVal: string) => {
      contributionaTimeRef.value = newVal;
      emit('update:contributionaTime', newVal);
    };
    onMounted(() => {
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      contributionaTimeRef.value = formatTime(new Date(), "yyyy-MM-dd")
      contributorRef.value = userInfo.erp_userid
    });
    return {
      contributorRef,
      contributionaTimeRef,
      handleContributorChange,
      handleContributionDateChange
    };
  }
});
</script>
