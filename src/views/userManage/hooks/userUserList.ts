import { onMounted, reactive, ref } from "vue";
import { GetUserList } from "../api";
import { UserItem } from "../types";

const paginationState = reactive({
  maxResultCount: 20,
  totalCount: 0,
  curPage: 1
});

const userList = ref<UserItem[]>([]);

export default function useUserList(
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
    getUserList({});
  };
  const handleSizeChange = (payload: number) => {
    paginationState.maxResultCount = payload;
    getUserList({});
  };

  const otherParams = ref({})
  const getUserList = async (params: object, isReset = false) => {
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
    const [err, data] = await GetUserList(payload);
    if (err || !data || !Array.isArray(data.result.items)) return;
    userList.value = data.result.items;
    paginationState.totalCount = data.result.totalCount;
  };

  onMounted(() => {
    if (immediateQuery) getUserList({});
  });
  return {
    userList,
    getUserList,
    paginationState,
    handleSizeChange,
    handleCurrentChange
  };
}
