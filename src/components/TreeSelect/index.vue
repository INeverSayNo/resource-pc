<template>
  <el-select
    v-bind="$attrs"
    ref="selectUpResId"
    v-model="selectId"
    :style="styles"
    :multiple="multiple"
    :props="dynaDefProps"
    filterable
    :filter-method="handleFilterMethod"
    :disabled="disabled"
    @clear="handleClear"
    @remove-tag="handleRemoveTag"
    @visible-change="selectVisibleChange"
  >
    <!-- 设置一个空option 不然selectData为空下拉不显示，这样处理无需用js去处理显示和隐藏了 -->
    <el-option key="x" hidden value="x" label="x" />
    <el-option
      v-for="(item, _index) in selectData"
      :key="_index"
      hidden
      :value="item[dynaDefProps['value']]"
      :label="getLable(item)"
    />
    <!-- 设置树形组件-->
    <el-tree
      v-bind="$attrs"
      ref="tree"
      check-strictly
      :show-checkbox="multiple"
      :node-key="dynaDefProps['value']"
      :props="dynaDefProps"
      :filter-node-method="handleFilterNode"
      @node-click="handleNodeClick"
      @check="handCheck"
    />
  </el-select>
</template>

<script>
export default {
  name: "ElSelectTree",
  inheritAttrs: false,
  componentName: "ElSelectTree",
  props: {
    // ********* 自定义的属性 如有需要自行添加 ****
    multiple: Boolean, // 是否多选 默认：false
    onlyLeaf: {
      // 是否只包含叶子节点
      type: Boolean,
      default: false
    },
    styles: {
      // 给一个样式属性
      type: String,
      default: "width:100%"
    },
    defaultProps: {
      type: Object,
      required: false,
      default: () => ({
        parent: "parentId", // 父级唯一标识
        value: "id", // 唯一标识
        label: "code", // 标签显示
        children: "children" // 子级
      })
    },
    value: { type: [String, Number, Object, Array], default: () => undefined },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:value", "change"],
  data() {
    return {
      selectId: "",
      selectData: [],
      isClick: false
    };
  },
  computed: {
    // 树节点配置选项
    dynaDefProps() {
      return Object.assign(
        {},
        {
          parentId: "parentId",
          value: "id",
          label: "name",
          children: "children",
          filter: "filter"
        },
        this.defaultProps,
        this.props
      );
    }
  },
  watch: {
    value: {
      handler(v) {
        this.$nextTick(() => {
          // 针对第一次请求，如果data延迟加载而出现赋值显示不是label的属性问题
          if (this.$refs.tree.data && this.$refs.tree.data.length) {
            this.setDefaultValue(v);
          } else {
            this.$refs.tree.$watch("data", () => {
              this.setDefaultValue(v);
            });
          }
        });
      },
      immediate: true, // watch立即执行
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 针对第一次请求，如果data延迟加载而出现赋值显示不是label的属性问题
      if (this.$refs.tree.data && this.$refs.tree.data.length) {
        this.setDefaultValue(this.value);
      } else {
        this.$refs.tree.$watch("data", () => {
          this.setDefaultValue(this.value);
        });
      }
    });
  },
  methods: {
    getLable(item) {
      return typeof this.dynaDefProps["label"] === "string"
        ? item[this.dynaDefProps["label"]]
        : this.dynaDefProps["label"](item);
    },
    // 回填值
    setDefaultValue(v) {
      if (this.multiple) {
        // 多选
        if (v) this.$refs.tree.setCheckedKeys(v, this.onlyLeaf);
        else this.$refs.tree.setCheckedKeys(null, this.onlyLeaf);
        this.handCheckSetValue(v, null);
      } else {
        // 其他
        if (v) {
          this.$refs.tree.setCurrentKey(v);
        } else this.$refs.tree.setCurrentKey(null);
        if (!this.isClick) {
          this.handleNodeSetValue();
        } else {
          this.isClick = false;
        }
      }
    },
    // 单选点击事件
    handleNodeClick() {
      if (this.multiple) return;
      // 隐藏下拉框的效果
      this.$refs.selectUpResId.blur();
      this.isClick = true;
      this.$emit("update:value", this.handleNodeSetValue());
    },
    handleNodeSetValue() {
      var cNode = this.$refs.tree.getCurrentNode();
      this.selectData = cNode ? [cNode] : [];
      // 设置值
      var _value = cNode ? cNode[this.dynaDefProps["value"]] : null;
      this.selectId = _value;
      this.$emit("change", _value, this.selectData);
      return this.selectId;
    },

    // 多选选择勾选
    handCheck() {
      if (!this.multiple) return;
      this.$emit("update:value", this.handCheckSetValue());
    },
    /**
     * 特殊处理下多选值处理，解决父子节点强关联的时候用
     * checkedKeys选中的keys
     * checkedNodes 选中的nodes
     *
     */
    handCheckSetValue(checkedKeys) {
      this.selectData = this.$refs.tree.getCheckedNodes(this.onlyLeaf, false);
      this.selectId =
        checkedKeys || this.$refs.tree.getCheckedKeys(this.onlyLeaf);
      this.$emit("change", this.selectId, this.selectData);
      return this.selectId;
    },

    // 清空触发
    handleClear() {
      this.$emit("update:value", this.multiple ? [] : null);
      this.$emit("change", this.multiple ? [] : null);
    },
    // 多选模式移除tag
    handleRemoveTag() {
      this.$emit("update:value", this.selectId);
      this.$emit("change", this.selectId);
    },
    // select搜索调用tree过滤
    handleFilterMethod(query) {
      this.$refs.tree.filter(query);
    },
    // tree 过滤
    handleFilterNode(value, data) {
      if (!value) return true;
      var _label = this.getLable(data);
      return _label.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    },
    // select 失去焦点并重置过滤器
    selectVisibleChange(v) {
      if (v || !this.filterable) return;
      this.handleFilterMethod(null);
    }
  }
};
</script>
