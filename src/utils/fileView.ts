import { VIEW_URL, GETFILE_URL } from "@/request";
import {
  Download,
  SYSTEM_BASE_DATA_URL
} from "@/request";
import { createImgPreview } from "@/components/Preview";
import { isUrlPath } from ".";
import { createImagePreview } from "@/components/DcPreview";

export function fileView(fileUrl: string, fileName: string) {
  const imageTypes = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"];
  let suffix = fileUrl.substring(fileUrl.lastIndexOf(".")).toLowerCase();
  if (fileName) {
    suffix = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  }
  if (!isUrlPath(fileUrl)) {
    fileUrl = fileUrl.startsWith("/")
      ? `${SYSTEM_BASE_DATA_URL}/api/abp/minio${fileUrl}`
      : `${SYSTEM_BASE_DATA_URL}/api/abp/minio/${fileUrl}`;
  }

  const href = `${VIEW_URL}/?url=${encodeURIComponent(fileUrl)}`;
  if (imageTypes.some((e) => e === suffix)) {
    createImgPreview({
      imageList: [fileUrl],
      show: true,
      index: 0,
      zIndex: 9999,
      style: null
    });
    return;
  }
  if (
    [".doc", ".xls", ".docx", ".xlsx", ".pdf", ".ppt", ".pptx"].some(
      (e) => e === suffix
    )
  ) {
    window.open(href, "_blank");
  } else {
    Download(fileUrl, fileName);
  }
}

export function handleView(fileUrl: string, fileName: string) {
  const imageTypes = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp']
  const suffix = fileUrl.substring(fileUrl.lastIndexOf('.')).toLowerCase()

  if (!fileUrl.toLowerCase().startsWith('http')) {
    fileUrl = `${GETFILE_URL}${fileUrl}`
  }

  if (imageTypes.some((e) => e === suffix)) {
    createImagePreview({
      fileList: [fileUrl].map((url) => ({ url })),
      show: true,
      initIdx: 0
    })
    return
  }
  Download(fileUrl, fileName)
}
