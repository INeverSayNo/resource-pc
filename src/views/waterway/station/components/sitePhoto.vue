<template>
  <DcGap class="bar">
    港口图片
    <span class="theme-color">(共{{ images.length }}张)</span>
    <span class="bar-btn fr" @click="showEdit = true">
      <DAliIcon name="plus" />
      新增
    </span>
  </DcGap>

  <div v-if="images.length" class="photo-grid">
    <div v-for="item in images" :key="item.id || item.filePath" class="photo-item">
      <el-image
        class="photo-image"
        :src="fileUrl(item.filePath)"
        :preview-src-list="previewUrls"
        fit="cover"
        preview-teleported
      />
      <div class="photo-caption">
        <span>{{ item.typeName || '其他' }}</span>
        <el-tooltip content="删除港口图片" placement="top">
          <el-button
            v-if="item.id"
            class="delete-button"
            size="small"
            circle
            type="danger"
            plain
            aria-label="删除港口图片"
            @click="deletePhoto(item.id)"
          >
            <DAliIcon name="delete" />
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
  <el-empty v-else :image-size="50" description="暂无数据" />

  <SitePhotoForm
    v-model="showEdit"
    :station-id="stationId"
    :wharf-data="wharfData"
    :work-zone-data="workZoneData"
    @success="handleSuccess"
  />
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { deleteImage, listImages } from '@/api/waterway-port'
  import { Message } from '@/components/Message'
  import DcGap from '@/components/Gap/index.vue'
  import { GETFILE_URL } from '@/request'
  import SitePhotoForm from './sitePhotoForm.vue'

  interface PortImage {
    id?: string
    filePath?: string
    typeName?: string
  }

  const props = withDefaults(
    defineProps<{
      stationId: string
      wharfData?: any[]
      workZoneData?: any[]
    }>(),
    {
      wharfData: () => [],
      workZoneData: () => []
    }
  )

  const emit = defineEmits<{ reload: [] }>()
  const images = ref<PortImage[]>([])
  const showEdit = ref(false)
  let requestSequence = 0

  const fileUrl = (path = '') => `${GETFILE_URL}${path}`
  const previewUrls = computed(() => images.value.map((item) => fileUrl(item.filePath)))

  const loadData = async () => {
    const sequence = ++requestSequence
    const [error, data] = await listImages(props.stationId)
    if (sequence === requestSequence && !error) images.value = data
  }

  const handleSuccess = () => {
    void loadData()
    emit('reload')
  }

  const deletePhoto = async (id: string) => {
    try {
      await ElMessageBox.confirm('删除后无法撤回，是否确定删除港口图片？', '提示信息', {
        type: 'warning'
      })
    } catch {
      return
    }
    const [error, success] = await deleteImage(id)
    if (error || !success) return
    Message.success('操作成功')
    await loadData()
    emit('reload')
  }

  watch(
    () => props.stationId,
    () => void loadData(),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestSequence += 1
  })
</script>

<style lang="less" scoped>
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 16px;
    margin: 15px;
  }

  .photo-item {
    min-width: 0;
    text-align: center;
  }

  .photo-image {
    width: 100px;
    height: 100px;
  }

  .photo-caption {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 12px;
  }

  .delete-button {
    margin-left: 4px;
  }
</style>
