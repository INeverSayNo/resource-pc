import { onMounted, reactive, ref } from "vue";
import { GetFeatureList } from "../api";
import { IFeatureItem } from "../types";

const paginationState = reactive({
  maxResultCount: 20,
  totalCount: 0,
  curPage: 1
});

const featureList = ref<IFeatureItem[]>([]);

export default function useFeatureList(
  options = {
    immediateQuery: true
  }
) {
  const { immediateQuery } = options;

  const resetPagination = () => {
    paginationState.curPage = 1;
    paginationState.maxResultCount = 20;
  };

  const handleCurrentChange = (payload: number) => {
    paginationState.curPage = payload;
    getFeatureList({});
  };
  const handleSizeChange = (payload: number) => {
    paginationState.maxResultCount = payload;
    getFeatureList({});
  };

  const otherParams = ref({})
  const getFeatureList = async (params: object, isReset = false) => {
    if (isReset) {
      resetPagination();
      otherParams.value = {};
    }
    if(Object.keys(params).length) {
      otherParams.value = params;
    }
    const payload = {
      ...paginationState,
      ...params,
      ...otherParams.value,
      skipCount: (paginationState.curPage - 1) * paginationState.maxResultCount
    };
    const [err, data] = await GetFeatureList(payload);
    if (err || !data || !Array.isArray(data.result.items)) return;
    featureList.value = data.result.items;
    paginationState.totalCount = data.result.totalCount;
  };

  onMounted(() => {
    if (immediateQuery) getFeatureList({});
  });
  return {
    featureList,
    getFeatureList,
    paginationState,
    handleSizeChange,
    handleCurrentChange
  };
}
