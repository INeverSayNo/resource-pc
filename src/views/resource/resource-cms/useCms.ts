import { GETFILE_URL, VIEW_URL } from "@/request";
import { isUrlPath } from "@/utils";
import { Ref } from "vue"; 
import resourceCmsApi from "./api";
import { CmsHeadDto } from "./types";
import { DcDeep } from "@dczy/tie-tools";

export function useCms(list?: Ref<CmsHeadDto[]>) {
  function renderKeywords(keywords?: string) {
    if (!keywords) return [];
    const colors = ["success", "primary", "warning", "danger", "info"];
    let index = -1;
    return keywords.split(",").map((x) => {
      if (index + 1 >= colors.length) {
        index = -1;
      }
      index++;
      return {
        label: x,
        class: colors[index]
      };
    });
  }

  function renderPreview(row: CmsHeadDto) {
    if (row.uri) {
      return [
        {
          uri: row.uri,
          label: "点击查看",
          type: "uri"
        }
      ];
    }
    if (row.files?.length) {
      return row.files.map((f) => {
        return {
          uri: f.filePath,
          type: "file",
          label: f.fileRealName
        };
      });
    }
    return [];
  }

  function handleRead(row: CmsHeadDto) {
    if (!row.selfIsRead) {
      read(row.id);
    }
    if (row.uri) {
      window.open(row.uri);
    } else if (row.files?.length) {
      const filePath = row.files[0].filePath;
      if (isUrlPath(filePath)) {
        window.open(`${VIEW_URL}?url=${filePath}`);
      } else {
        window.open(`${VIEW_URL}?url=${GETFILE_URL}${filePath}`);
      }
    }
  }

  function handleFilePreview(row: CmsHeadDto, filePath: string) {
    if (!row.selfIsRead) {
      read(row.id);
    }
    if (isUrlPath(filePath)) {
      window.open(`${VIEW_URL}?url=${filePath}`);
    } else {
      window.open(`${VIEW_URL}?url=${GETFILE_URL}${filePath}`);
    }
  }

  function read(id: string) {
    resourceCmsApi.Read(id).then((res) => {
      if (res && list?.value?.length) {
        const index = list.value.findIndex((x) => x.id === id);
        const temp = DcDeep.clone<CmsHeadDto[]>(list.value);
        temp.splice(index, 1);
        list.value = temp;
      }
    });
  }
  return {
    renderKeywords,
    renderPreview,
    handleRead,
    handleFilePreview
  };
}
