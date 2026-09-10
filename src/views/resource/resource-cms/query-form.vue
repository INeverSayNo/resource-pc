<template>
  <div class="dt-query-container">
    <el-form
      :model="param"
      label-suffix=":"
      label-width="80px"
      inline
    >
      <el-form-item label="标题">
        <el-input v-model="param.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="站点名称">
        <el-input
          v-model="param.businessName"
          placeholder="请输入站点名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="param.keywords"
          placeholder="请输入关键词"
        ></el-input>
      </el-form-item>
      <el-form-item label="阅读状态">
        <el-select v-model="param.readStatus" clearable filterable>
          <el-option value="全部">全部</el-option>
          <el-option value="未读">未读</el-option>
          <el-option value="已读">已读</el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="发布日期" class="date-range">
        <el-date-picker
          v-model="param.releaseDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="请输入开始日期"
          end-placeholder="请输入结束日期"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="param.remark"
          placeholder="请输入备注信息"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="到期日期" class="date-range">
        <el-date-picker
          v-model="param.validDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="请输入开始日期"
          end-placeholder="请输入结束日期"
        />
      </el-form-item> -->
      <span style="margin-left: 80px">
        <el-button type="primary"  @click="handleSearch">
          查询
        </el-button>
        <el-button type="warning"  @click="handleReset">
          重置
        </el-button>
        <el-button v-if="showAdd"  type="success" @click="handleAdd">
          新增
        </el-button>
      </span>
    </el-form>
  </div>
</template>

<script lang="ts">
import { computed, PropType } from "vue";
import { CmsQueryParam } from "./types";
export default {
  props: {
    query: {
      type: Object as PropType<CmsQueryParam>,
      default: () => {}
    },
    showAdd: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:query", "search", "add"],
  setup(props, { emit }) {
    const param = computed({
      get: () => props.query,
      set: (val) => {
        emit("update:query", val);
      }
    });

    function handleSearch() {
      emit("search");
    }
    function handleReset() {
      const { businessId } = param.value;
      param.value = Object.assign({ businessId }, {});
    }
    function handleAdd() {
      emit("add");
    }
    return {
      param,
      handleSearch,
      handleReset,
      handleAdd
    };
  }
};
</script>

<style lang="less" scoped></style>
