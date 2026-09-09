import { Props } from "./types";
import { isClient } from "@/utils/is";
import { createVNode, render } from "vue";
import FilePreview from "./index.vue"

let instance: any = null;

export function createFilePrivew(options:Props) {
  if (!isClient) return;
  const { show = true, fileUri } = options
  const propsData: Partial<Props> = {};
  const container = document.createElement("div");
  propsData.fileUri = fileUri;
  propsData.show = show;  
  instance = createVNode(FilePreview, propsData);
  render(instance, container);
  document.body.appendChild(container);
}
