import { computed, onMounted, ref } from "vue";
import { IPositionItem } from "../types";
import { GetAllPositions } from "../api";

const positionList = ref<IPositionItem[]>([]);
export default function usePositions(
  options = {
    immediateQuery: true
  }
) {
  const { immediateQuery } = options;
  const getPositionList = async () => {
    const [err, data] = await GetAllPositions();
    if (err || !data || !Array.isArray(data.result.items)) return;
    positionList.value = data.result.items;
  };

  const getMatchPosition = computed(() => (id: string) => {
    return positionList.value.find((item) => item.id === id);
  });

  onMounted(() => {
    if (immediateQuery) getPositionList();
  });

  return {
    positionList,
    getMatchPosition
  };
}
