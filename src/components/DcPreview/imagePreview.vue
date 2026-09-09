<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ElImageViewer } from "element-plus";
import { GETFILE_URL } from "@/request";

export default defineComponent({
  name: "ImagePreview",
  components: {
    ElImageViewer
  },
  props: {
    initIdx: {
      type: Number,
      default: 0
    },
    fileList: {
      type: Array as PropType<
        Partial<Record<"path" | "url", string> & { [key: string]: any }>[]
      >,
      default: () => []
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const showfilelist = computed({
      get: () => props.show,
      set: (val) => {
        emit("update:show", val);
      }
    });
    const fileUrls = computed(() => {
      if (!props.fileList.length) return [];
      return props.fileList
        .map((item) => {
          const url = item.url || item.path;
          if (url) {
            if (!url.toLowerCase().startsWith("http")) {
              return `${GETFILE_URL}${url}`;
            }
            return url;
          }
          return url;
        })
        .filter((e) => Boolean(e)) as string[];
    });

    return {
      showfilelist,
      fileUrls
    };
  }
});
</script>
<template>
  <ElImageViewer
    v-if="showfilelist"
    :url-list="fileUrls"
    :initial-index="initIdx"
    @close="showfilelist = false"
    :teleported="true"
  />
</template>
