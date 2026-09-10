<template>
  <el-autocomplete
    v-model="edit"
    :fetch-suggestions="queryStationSearch"
    v-bind="$attrs"
    @blur="handleStationBlur"
  >
    <template v-if="$slots.append || showUnknown" #append>
      <slot name="append"></slot>
      <el-button
        v-if="showUnknown && !$slots.append"
        class="theme-warning"
        @click="handleUnknow"
      >
        不清楚?
      </el-button>
    </template>
  </el-autocomplete>
  <station-query v-model="unknowStation" @change="handleSelect"></station-query>
</template>

<script lang="ts">
import { getSystemDataShow } from "@/api/systemDataShowApi";
import { reactive, toRefs, defineComponent, computed, nextTick } from "vue";
import StationQuery from "./stationQuery.vue";
import { DcDeep } from "@dczy/tie-tools";

export default defineComponent({
  name: "DcRailwayStation",
  components: {
    StationQuery
  },
  props: {
    modelValue: {
      type: String,
      default: () => ""
    },
    showUnknown: {
      type: Boolean,
      default: () => true
    },
    bureau: {
      type: String,
      default: () => ""
    }
  },
  emits: ["update:modelValue", "unknow", "update:address", "change"],
  setup(props, { emit }) {
    const state = reactive({
      unknowStation: false,
      station: [] as any
    });
    const edit = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);

        const station = state.station?.find(
          (x) => x.RailwayStationName === val
        );
        emit("change", val, station || {});
      }
    });

    // 查询发站信息
    function queryStationSearch(keyWords: string, cb: any) {
      if (!keyWords) {
        cb([]);
        return;
      }
      const param: any = {};
      if (props.bureau) {
        param.RailwayBureauCode = props.bureau;
      }
      getSystemDataShow(
        "RailWayStationTableData",
        keyWords,
        undefined,
        undefined,
        JSON.stringify(param)
      ).then((res) => {
        const data = (res || [])
          .map((g: any) => {
            return {
              label: g.RailwayStationName,
              value: g.RailwayStationName,
              others: g
            };
          })
          .filter((x: any) => x.value.includes(keyWords));
        state.station = DcDeep.clone(res);
        cb(data);
      });
    }
    function handleStationBlur() {
      if (!state.station?.some((x) => x.RailwayStationName === edit.value)) {
        edit.value = "";
      }
    }
    function handleUnknow() {
      state.unknowStation = true;
      nextTick(() => {
        emit("unknow", state.unknowStation);
      });
    }

    function handleSelect(stationName: string) {
      const station = state.station?.find(
        (x) => x.RailwayStationName === stationName
      );
      emit("change", stationName, station);
      edit.value = stationName;
      state.unknowStation = false;
    }
    return {
      ...toRefs(state),
      edit,
      queryStationSearch,
      handleStationBlur,
      handleUnknow,
      handleSelect
    };
  }
});
</script>

<style lang="less" scoped></style>
