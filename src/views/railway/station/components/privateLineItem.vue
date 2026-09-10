<template>
  <div class="private-line">
    <div class="private-title fs-14">
      {{ privateLine?.name }}(<span class="theme-danger fw-b">{{ privateLine?.lineType }}</span
      >)
      <span v-if="privateLine.isAgreement" class="theme-danger"> (已签订共用协议) </span>
      <span class="fr theme-color cu-pointer fs-12 mr-10px" @click="handleEdit">
        <DAliIcon name="edit" class="" />
        编辑
      </span>
      <span class="fr theme-color cu-pointer fs-12 mr-10px" @click="showAll = !showAll">
        <DAliIcon :name="showAll ? 'arrow-up' : 'arrow-down'" />
        {{ showAll ? '收起' : '展开' }}
      </span>
    </div>
    <div v-if="showAll" class="base-info">
      <el-row>
        <template v-for="(item, index) in showData" :key="index">
          <el-col v-if="!item.isMore || showMore" :span="item.colspan || 6">
            <span class="label">{{ item.label }}</span>
            <span v-if="item.children?.length" class="value" :class="item.class">
              <template v-for="(cItem, cIndex) in item.children" :key="cIndex">
                <span
                  v-if="cItem.isClip"
                  v-clipboard:value="cItem.value"
                  class="dt-item theme-color"
                  :class="cItem.class"
                >
                  {{ cItem.value }}
                </span>
                <span v-else class="dt-item" :class="cItem.class">
                  {{ cItem.value }}
                </span>
              </template>
            </span>
            <span v-else class="value" :class="item.class">
              {{ item.value }}
            </span>
          </el-col>
        </template>
        <el-col v-if="privateLine.fileAttach?.length" :span="24">
          <span class="label">附件信息：</span>
          <span v-for="(item, index) in privateLine.fileAttach" :key="item.id">
            <el-link
              class="value mr-5px"
              type="primary"
              href="javascript:void(0);"
              :underline="false"
              @click="handleFilePreview(item)"
            >
              {{ index + 1 }}、{{ item.fileRealName }}
            </el-link>
          </span>
        </el-col>
        <el-col :span="24" class="tc theme-color cu-pointer">
          <span @click="showMore = !showMore">
            <DAliIcon :name="showMore ? 'arrow-up' : 'arrow-down'" />
            {{ showMore ? '收起' : '更多' }}
          </span>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
  import { FileAttach } from '@/utils/base-entity'
  import { fileView } from '@/utils/fileView'
  import { reactive, toRefs, defineComponent, PropType, computed } from 'vue'
  import { RailWayPrivatelLine } from '../types'
  import { useDetails } from '../useDetails'
  export default defineComponent({
    props: {
      privateLine: {
        type: Object as PropType<RailWayPrivatelLine>,
        default: () => {}
      },
      show: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['edit'],
    setup(props, { emit }) {
      const { GetPrivateLineShowData } = useDetails(false)
      const state = reactive({
        showMore: props.show,
        showAll: props.show
      })
      const showData = computed(() => GetPrivateLineShowData(props.privateLine || {}))
      function handleEdit() {
        emit('edit', props.privateLine)
      }
      const handleFilePreview = (file: FileAttach) => {
        const url = file?.filePath || ''
        const fileName = file?.fileRealName || ''
        const prevewUrl = url.endsWith('.')
          ? `${url.substring(0, url.length - 1)}${file.fileType}`
          : url
        fileView(prevewUrl, fileName)
      }
      return {
        ...toRefs(state),
        showData,
        handleEdit,
        handleFilePreview
      }
    }
  })
</script>

<style lang="less" scoped>
  @import '../style.less';
</style>
