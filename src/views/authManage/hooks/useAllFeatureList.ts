import { onMounted, ref } from "vue";
import { GetFeatureList } from "../../featureManage/api";
import { IFeatureItem } from "../../featureManage/types";

const allFeatureList = ref<IFeatureItem[]>([]);
export default function useAllFeatureList() {
  const getFeatureList = async () => {
    if (allFeatureList.value.length) return;
    const payload = {
      skipCount: 0,
      maxResultCount: 999
    };
    const [err, data] = await GetFeatureList(payload);
    if (err || !data || !Array.isArray(data.result.items)) return;
    allFeatureList.value = data.result.items;
  };

  onMounted(getFeatureList);
  return {
    allFeatureList,
    getFeatureList
  };
}
