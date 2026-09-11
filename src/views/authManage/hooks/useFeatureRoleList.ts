import { onMounted, reactive, ref } from "vue";
import { GetFeatureRoleList } from "../api";
import { IFeatureRoleItem } from "../types";

const paginationState = reactive({
  maxResultCount: 20,
  totalCount: 0,
  curPage: 1
});

const featureRoleList = ref<IFeatureRoleItem[]>([]);

export default function useFeatureRoleList(
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
    getFeatureRoleList({});
  };
  const handleSizeChange = (payload: number) => {
    paginationState.maxResultCount = payload;
    getFeatureRoleList({});
  };

  const otherParams = ref({});
  const getFeatureRoleList = async (params: object, isReset = false) => {
    if (isReset) {
      resetPagination();
      otherParams.value = {};
    }
    if (Object.keys(params).length) {
      otherParams.value = params;
    }
    const payload = {
      ...paginationState,
      ...params,
      ...otherParams.value,
      skipCount: (paginationState.curPage - 1) * paginationState.maxResultCount,
      code:"DCZY"
    };
    const [err, data] = await GetFeatureRoleList(payload);
    if (err || !data || !Array.isArray(data.result.items)) return;
    featureRoleList.value = data.result.items;
    paginationState.totalCount = data.result.totalCount;
  };

  onMounted(() => {
    if (immediateQuery) getFeatureRoleList({});
  });
  return {
    featureRoleList,
    getFeatureRoleList,
    paginationState,
    handleSizeChange,
    handleCurrentChange
  };
}
