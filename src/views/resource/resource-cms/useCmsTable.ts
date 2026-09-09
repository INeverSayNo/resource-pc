import { nextTick, reactive, ref } from "vue";
import { CmsHeadDto, CmsQueryParam } from "./types";
import resourceCmsApi from "./api";

export function useCmsTable(emit, pageSize = 50) {
  const list = ref<CmsHeadDto[]>([]);
  const param = ref<CmsQueryParam>({});
  const pageState = reactive({
    page: 1,
    pageSize: pageSize,
    total: 0,
    loading: false
  });
  function loadData() {
    const postParam: CmsQueryParam = Object.assign({}, param.value, {
      page: pageState.page,
      pageSize: pageState.pageSize
    });
    pageState.loading = true;
    resourceCmsApi
      .Query(postParam)
      .then((res) => {
        if (res?.isSuccessful) {
          pageState.total = res.totalCount;
          const data = res.items || [];
          list.value = data;
          emit("loadComplate", res.totalCount);
        }
      })
      .finally(() => {
        pageState.loading = false;
      });
  }
  // #region  page/pageSize change
  function handlePageChange(page: number) {
    pageState.page = page;
    nextTick(() => {
      loadData();
    });
  }
  function handlePageSizeChange(size: number) {
    pageState.pageSize = size;
    nextTick(() => {
      loadData();
    });
  }
  function handlePageAndSizeChange(page: number, size: number) {
    pageState.page = page;
    pageState.pageSize = size;
    nextTick(() => {
      loadData();
    });
  }
  // #endregion

  function handleSearch() {
    handlePageChange(1);
  }

  return {
    pageState,
    list,
    param,
    handleSearch,
    handlePageChange,
    handlePageAndSizeChange,
    handlePageSizeChange
  };
}
