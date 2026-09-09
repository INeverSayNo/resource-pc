<template>
  <el-space :size="10" spacer="|">
    <!-- <el-link type="primary" @click.prevent="showpop = true">
      {{ text }}</el-link> -->
    <el-link type="primary" @click.prevent="handleView">
      {{ text }}
    </el-link>
    &nbsp; &nbsp;
    <el-link
      v-if="down"
      type="primary"

      @click.prevent="Download(url, text)"
    >
      下载
    </el-link>
  </el-space>

  <el-dialog
    :model-value="showpop"
    draggable
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-html="html" />
  </el-dialog>
</template>

<script lang="ts">
  import { onMounted, reactive, toRefs, watch } from 'vue'
  import { createFilePrivew } from './FilePreview'
  import { createImagePreview } from './createImagePreview'
import { isImgFiles } from '@dczy/tie-tools'
import { GETFILE_URL, VIEW_URL } from '@/request/config';
import { Download } from '@/request';
  export default {
    name: 'FileDownView',
    components: {},
    props: {
      text: { type: String, default: () => '文件预览' },
      path: { type: String, default: () => null },
      down: { type: Boolean, default: () => true }
    },
    emits: [],
    setup(props: any) {
      const state = reactive({
        showpop: false,
        url: '',
        html: ''
      })

      // 取消
      const handleClose = () => {
        state.showpop = false
      }

      // 预览
      const handleView = () => {
        if (!state.url.toLowerCase().startsWith('http')) {
          state.url = `${GETFILE_URL}${state.url}`
        }

        if (isImgFiles(state.url)) {
          createImagePreview({
            urlList: [state.url],
            zIndex: 9999
          })
        } else {
          const href = `${VIEW_URL}?url=${state.url}`
          createFilePrivew({
            show: true,
            fileUri: href
          })
        }
      }

      // 监视url
      watch(
        () => props.path,
        (val) => {
          if (val) {
            if (val?.startsWith('http')) {
              state.url = val
            } else {
              state.url = `${GETFILE_URL}${val?.startsWith('/') ? val : '/' + val}`
            }
          }
        },
        {
          immediate: true
        }
      )

      onMounted(() => {})

      return {
        ...toRefs(state),
        handleClose,
        Download,
        handleView
      }
    }
  }
</script>

<style lang="less" scoped></style>
