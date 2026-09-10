<template>
  <QueryForm v-if="showQuery" v-model:query="param" @search="handleSearch"></QueryForm>
  <el-table v-loading="loading" :data="list" stripe highlight-current-row :height="height" border>
    <el-table-column label="序号" type="index"></el-table-column>
    <el-table-column label="发布时间" prop="releaseDate" header-align="center" width="130px">
      <template #default="scoped">
        {{ formatTime(scoped.row.releaseDate, 'yyyy-MM-dd HH:mm') }}
      </template>
    </el-table-column>
    <el-table-column label="标题" prop="title" header-align="center">
      <template #default="scoped">
        <div class="theme-color cu-pointer" @click="handleRead(scoped.row)">
          {{ scoped.row.title }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="关键字" prop="keywords" align="center">
      <template #default="scoped">
        <el-tag
          v-for="item in renderKeywords(scoped.row.keywords)"
          :key="item.label"
          :type="item.class"
          class="mr-5px"
        >
          {{ item.label }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      label="站点名称"
      prop="businessName"
      width="80px"
      align="center"
    ></el-table-column>

    <el-table-column label="已读" width="60px" align="center">
      <template #default="scoped">
        {{ scoped.row.selfIsRead ? '是' : '否' }}
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    class="table-pagination"
    :current-page="page"
    :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    @size-change="handlePageSizeChange"
    @current-change="handlePageChange"
  />
</template>

<script lang="ts">
  import { formatTime } from '@/utils'
  import { PropType, toRefs, watch, defineComponent } from 'vue'
  import { CmsQueryParam } from './types'
  import { useCms } from './useCms'
  import { useCmsTable } from './useCmsTable'
  import QueryForm from './query-form.vue'
  import { DcDeep } from '@dczy/tie-tools'

  export default defineComponent({
    components: {
      QueryForm
    },
    props: {
      query: {
        type: Object as PropType<CmsQueryParam>,
        default: () => {}
      },
      showQuery: {
        type: Boolean,
        default: () => false
      },
      height: {
        type: [Number, String],
        default: () => 'auto'
      }
    },
    emits: ['loadComplate'],
    setup(props, { emit }) {
      const { list, pageState, param, handleSearch, handlePageChange, handlePageSizeChange } =
        useCmsTable(emit, props.query?.pageSize || 50)
      const { renderKeywords, renderPreview, handleFilePreview, handleRead } = useCms()

      watch(
        () => props.query,
        (val) => {
          if (val) {
            param.value = Object.assign({}, DcDeep.clone<CmsQueryParam>(val))
          }
        },
        { immediate: true, deep: true }
      )
      return {
        ...toRefs(pageState),
        param,
        list,
        formatTime,
        handleSearch,
        handlePageChange,
        handlePageSizeChange,
        renderKeywords,
        renderPreview,
        handleFilePreview,
        handleRead
      }
    }
  })
</script>

<style lang="less" scoped></style>
