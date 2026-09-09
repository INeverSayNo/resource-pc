<template>
  <div>
    <el-button
      v-if="showButton"
      :disabled="disabled"

      @click="handleOpenDialog"
    />
    <el-input
      v-else
      ref="inputRef"
      v-model="myAddress"
      :placeholder="title"
      readonly
      :disabled="disabled"
      class="dc-bmap-select"
      :class="{ 'no-btn': !showPicker }"
      @click="handlefocus"
      @blur="handlBlur"
    >
      <template v-if="showPicker" #append>
        <el-button
          :disabled="disabled"

          @click="handleOpenDialog"
        />
      </template>
    </el-input>

    <com-dialog
      :show-fullscreen="true"
      :model-value="visable"
      :width="width"
      :title="title"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @close="handleClose"
      @opened="handleOpen"
      @fullscreen="handleFullscreen"
    >
      <iframe
        v-if="src"
        id="mapIframe"
        ref="mapIframe"
        :src="src"
        width="100%"
        :height="`${height}px`"
        @load="loaded"
      ></iframe>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </com-dialog>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
export default {
  name: "BmapSelect",
  props: {
    showButton: { type: Boolean, default: () => false },
    disabled: { type: Boolean, default: () => false },
    width: { type: [Number || String], default: () => 1000 },
    title: { type: String, default: () => "坐标选择器" },
    value: { type: Object, default: () => {} },
    showPicker: {
      type: Boolean,
      default: () => true
    }
  },
  emits: [
    "close",
    "update:value",
    "change",
    "inputFocus",
    "inpuBlur",
    "akChange"
  ],
  setup(props, { emit }) {
    const mapIframe = ref(null);
    const visable = ref(false);
    const height = ref(400);
    const myAddress = ref("");
    const inputRef = ref();
    const src = ref("");
    const handleClose = () => {
      visable.value = false;
      emit("close", false);
    };

    const handleOpen = () => {};

    const getData = () => {
      const obj1 = window.frames["mapIframe"]; // 获得对应iframe的window对象
      const address =
        obj1.contentWindow.document.getElementById("cityName").value;
      const lat =
        obj1.contentWindow.document.getElementById("txtlatitude").value;
      const lng =
        obj1.contentWindow.document.getElementById("txtLongitude").value;
      const regionName =
        obj1.contentWindow.document.getElementById("txtRegionName").value;
      const address_detail =
        obj1.contentWindow.document.getElementById("address_detail").value;
      const adt = JSON.parse(address_detail || "{}");
      console.log({ address, lat, lng, regionName: regionName }, adt);
      emit("update:value", { address, lat, lng, regionName: regionName });
      emit("change", address, lat, lng, regionName, adt);
      emit("close", false);
      setTimeout(() => {
        myAddress.value = address;
        visable.value = false;
      }, 200);
    };
    const handleSubmit = () => {
      getData();
      setTimeout(() => {
        inputRef.value?.focus();
      }, 300);
    };
    const loaded = () => {
      const mapFrame = mapIframe.value;
      if (props.value?.address) {
        mapFrame.contentWindow.document.getElementById("cityName").value =
          props.value.address;
        if (!props.value.lat && !props.value.lng) {
          mapFrame.contentWindow.document
            .getElementById("bmapSelectBtn")
            .click();
        }
      }
      if (props.value.lat && props.value.lng) {
        mapFrame.contentWindow.document.getElementById("txtlatitude").value =
          props.value.lat;
        mapFrame.contentWindow.document.getElementById("txtLongitude").value =
          props.value.lng;
      }
      if (props.value?.regionName) {
        mapFrame.contentWindow.document.getElementById("txtRegionName").value =
          props.value.regionName;
      }
    };
    watch(
      () => props.value,
      (val) => {
        myAddress.value = val?.address || "";
        src.value = `./MapLocation.html?address=${val?.address || ""}&lat=${
          val?.lat || ""
        }&lng=${val?.lng || ""}`;
      },
      {
        deep: true,
        immediate: true
      }
    );
    onMounted(() => {
      getDynamicAK();
      if (props.value) {
        myAddress.value = props.value.address;
      }
    });
    const handleOpenDialog = () => {
      visable.value = true;
      emit("close", true);
    };
    const handlefocus = (e) => {
      emit("inputFocus", e);
    };
    const handlBlur = (e) => {
      emit("inpuBlur", e);
    };
    function handleFullscreen(val, dragDom) {
      if (val) {
        const body = dragDom.querySelector(".el-dialog__body");
        height.value = body?.getBoundingClientRect().height || 400;
      } else {
        height.value = 400;
      }
    }
    function getDynamicAK() {
      const host = JSON.parse(
        sessionStorage.getItem("dc_resource_api_config") || "{}"
      );
      return new Promise((resolve) => {
        const oldAk = sessionStorage.getItem("bmap_ak");
        if (oldAk) {
          emit("akChange", oldAk);
          resolve(oldAk);
          return;
        }
        fetch(
          `${
            host?.gateway_url ?? "https://gateway.daochen.com"
          }/api/BaseData/BaiduMapJsApi/get-dynamic-ak`
        )
          .then((response) => response.text())
          .then((data) => {
            emit("akChange", data);
            sessionStorage.setItem("bmap_ak", data);
            resolve(data);
          });
      });
    }
    return {
      visable,
      mapIframe,
      src,
      loaded,
      handleClose,
      handleOpen,
      getData,
      handleSubmit,
      myAddress,
      handleOpenDialog,
      handlefocus,
      handlBlur,
      inputRef,
      height,
      handleFullscreen
    };
  }
};
</script>

<style></style>
