import { computed, onMounted, ref } from "vue";
import { CmsHeadDto } from "./types";
import resourceCmsApi from "./api";

export function useCmsDialog() {
  const list = ref<CmsHeadDto[]>([]);
  const keywords = ref("");
  const dialogVisible = ref(false);
  const showList = computed(() => {
    if (keywords.value) {
      return list.value.filter((x) => {
        return (
          x.businessName?.includes(keywords.value) ||
          x.businessTypeName?.includes(keywords.value) ||
          x.keywords?.includes(keywords.value) ||
          x.remark?.includes(keywords.value)
        );
      });
    }
    return list.value;
  });

  onMounted(() => {
    // 是弹窗，则直接查询自己必须读，且有未读的
    resourceCmsApi.GetMustReadList().then((res) => {
      list.value = res;
      if (res.length) {
        dialogVisible.value = true;
      }
    });
  });

  return {
    list,
    keywords,
    dialogVisible,
    showList
  };
}
