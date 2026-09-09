<template>
  <el-autocomplete
    v-model="edit"
    :fetch-suggestions="queryGoodsByKeywords"
    placeholder="请输入货物名称"
    @blur="handleGoodsBlur"
    @select="handleGoodsSelect"
  >
    <template #default="{ item }">
      <div class="value">
        {{ item.GoodsName }}
        <span class="link">({{ item.GoodsCode }})</span>
      </div>
    </template>
  </el-autocomplete>
</template>

<script lang="ts">
import { getSystemDataShow } from "@/api/systemDataShowApi";
import { deepClone } from "@/utils";
import {
  reactive,
  toRefs,
  defineComponent,
  computed,
  ref,
  onMounted
} from "vue";

type RailwayGoods = {
  GoodsName: string;
  PriceNumberZC: string;
  PriceNumberJZX: string;
  PriceNumberLD: string;
  GoodsCode: string;
};

export default defineComponent({
  name: "DcRailwayGoodsNew",
  props: {
    modelValue: {
      type: String,
      default: () => ""
    }
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const allGoods = ref<Array<RailwayGoods>>([]);
    const edit = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const goodsInfo = reactive({
      goodsName: "",
      priceNumberZC: "",
      priceNumberJZX: "",
      priceNumberLD: "",
      goodsCode: ""
    });

    function handleGoodsSelect(
      payload: RailwayGoods & Record<"label" | "value", string>
    ) {
      const {
        GoodsCode,
        GoodsName,
        PriceNumberJZX,
        PriceNumberLD,
        PriceNumberZC
      } = payload;
      goodsInfo.goodsCode = GoodsCode;
      goodsInfo.goodsName = GoodsName;
      goodsInfo.priceNumberZC = PriceNumberZC;
      goodsInfo.priceNumberJZX = PriceNumberJZX;
      goodsInfo.priceNumberLD = PriceNumberLD;
      emit("change", deepClone(goodsInfo));
    }

    function handleGoodsBlur() {
      if (!goodsInfo.goodsCode) {
        edit.value = "";
      }
    }

    function queryGoodsByKeywords(keywords: string, cb: Function) {
      if (!keywords) {
        cb([]);
        return;
      }
      const matchGoods = allGoods.value.filter((x) =>
        x.GoodsName.includes(keywords) || x.GoodsCode.includes(keywords)
      );
      const result = matchGoods.filter(e => e.GoodsCode !== "9990999").map((e) => {
        return {
          ...e,
          label: e.GoodsName,
          value: e.GoodsName
        };
      });
      result.sort((a, b) => {
        if (a.GoodsName === keywords) return -1;
        if (b.GoodsName === keywords) return 1;
        return a.GoodsName.indexOf(keywords) - b.GoodsName.indexOf(keywords);
      });
      cb(result);
    }

    // 查询所有商品信息
    function queryGoodsSearch() {
      getSystemDataShow("RailWayGoodsName", "").then((res) => {
        allGoods.value = res || [];
      });
    }

    onMounted(queryGoodsSearch);
    return {
      edit,
      queryGoodsSearch,
      handleGoodsSelect,
      handleGoodsBlur,
      queryGoodsByKeywords
    };
  }
});
</script>

<style lang="less" scoped></style>
