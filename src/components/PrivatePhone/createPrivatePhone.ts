import { ElMessage } from "element-plus";
import { nextTick } from "vue";

const ids: Map<string, string> = new Map();
export function createPrivatePhone(phone: string, extraStr?: string, noClick = false) {
  const div = document.createElement("div");
  div.style.display = "inline-block";
  if (phone) {
    div.innerHTML =
      (extraStr ? `<span>${extraStr}</span>` : "") +
      `<span class='phone' style='user-select:none'>${window.getPrivatePhone(
        phone
      )}</span>`;
    div.children[div.children.length - 1].insertAdjacentHTML(
      "afterend",
      ' <span class="copy-icon" aria-label="复制">⧉</span>'
    );
    const id = generateRandomString(32);
    ids.set(id, phone);
    div.id = id;
    nextTick(() => {
      if (noClick) return
      document.querySelector(`#${id}`)?.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        navigator.clipboard.writeText(phone).then(
          () => {
            ElMessage.success("复制成功");
          },
          () => {
            const value = phone;
            const input = document.createElement("textarea");
            input.value = value;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            ElMessage.success("复制成功");
          }
        );
      });
      const phoneEle = Array.from(
        document.querySelector(`#${id}`)?.children || []
      ).find((e) => e.className.indexOf("phone") > -1);
      phoneEle?.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        if ((<Element>event.target)!.innerHTML.indexOf("****") > -1) {
          (<Element>event.target)!.innerHTML = phone;
        } else {
          (<Element>event.target)!.innerHTML = window.getPrivatePhone(phone);
        }
        Array.from(ids.keys())
          .filter((e) => e !== id)
          .forEach((e) => {
            const target = document.querySelector(`#${e}`);
            if (target) {
              const id = target.id;
              const realPhone = ids.get(id);
              const childPhone = target.querySelector(".phone");
              if (childPhone && realPhone) {
                childPhone.innerHTML = window.getPrivatePhone(realPhone);
              }
            }
          });
      });
    });
  }
  return div;
}

function generateRandomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  while (ids.has(result)) {
    result = generateRandomString(32);
  }
  return result;
}
