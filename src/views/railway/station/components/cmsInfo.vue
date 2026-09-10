<template>
  <div v-show="first">
    <DcGap class="bar with-input">
      <span>
        重要通知
        <span class="theme-color">(共{{ first }}条 )</span>
      </span>
      <div class="fr">
        <el-radio-group v-model="readStatus" class="mr-10" @change="handleSearch">
          <el-radio label="全部">全部</el-radio>
          <el-radio label="未读">未读</el-radio>
          <el-radio label="已读">已读</el-radio>
        </el-radio-group>
        <el-input
          v-model="keywords"
          class="mr-5px"
          style="width: 300px"
          placeholder="请输入关键字查询,按回车键查询"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch"><DAliIcon name="search" /></el-button>
          </template>
        </el-input>
      </div>
    </DcGap>
    <CmsTable
      ref="cmsTableRef"
      :query="{ businessId: stationId, keywords, readStatus, pageSize: 10 }"
      :height="150"
      @loadComplate="handleLoadComplate"
    ></CmsTable>
  </div>
</template>

<script lang="ts">
  import { onMounted, ref, watch, nextTick } from 'vue'
  import CmsTable from '@/views/resource/resource-cms/cms-table.vue'
  import DcGap from '@/components/Gap/index.vue'
  export default {
    components: {
      CmsTable,
      DcGap
    },
    props: {
      stationId: {
        type: String,
        default: () => ''
      }
    },
    setup(props, { emit }) {
      const cmsTableRef = ref<InstanceType<typeof CmsTable>>()
      const total = ref(0)
      const isFirst = ref(false)
      const first = ref(0)
      const keywords = ref('')
      const readStatus = ref('全部')
      function handleLoadComplate(_total: number) {
        total.value = _total
        if (!isFirst.value) {
          isFirst.value = true
          first.value = _total
        }
      }
      function handleSearch() {
        cmsTableRef.value?.handleSearch()
      }
      watch(
        () => props.stationId,
        (val, ov) => {
          if (val) {
            if (val !== ov) {
              isFirst.value = false
              first.value = 0
            }
            nextTick(() => {
              handleSearch()
            })
          }
        },
        { immediate: true }
      )
      onMounted(() => {
        // handleSearch();
      })
      return {
        cmsTableRef,
        total,
        first,
        handleLoadComplate,
        handleSearch,
        keywords,
        readStatus
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
