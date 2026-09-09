type optionType = {
  anchor: BMapGL.ControlAnchor;
  offset: BMapGL.Size;
  action: (div:HTMLElement) => void;
  text: string;
  content?: HTMLElement
  class?:string
};

export function CreateCustomControl() { 
  return class CustomControl extends BMapGL.Control { 
    action: Function;
    text: string;
    content?: HTMLElement;
    class?: string;
    constructor(options?: Partial<optionType>) {
      super() 
      const defOptions:optionType = Object.assign({
        anchor: BMAP_ANCHOR_TOP_LEFT,
        offset: new BMapGL.Size(20, 20),
        text: "自定义控件",
        action: (div: HTMLElement) => {
          console.log(div);
        }
      }, options || {})
      this.action = defOptions.action;
      this.text = defOptions.text; 
      this.defaultAnchor = defOptions.anchor;
      this.defaultOffset = defOptions.offset
      this.content = defOptions.content;
      this.class = defOptions.class;
    } 
    setClass(className: string, isAdd = true) { 
      // (this.content!.classList as any) = [className];
      if (className) { 
        isAdd && this.content?.classList.add(className);
        !isAdd && this.content?.classList.remove(className);
      }
    }
    initialize(map: BMapGL.Map): HTMLElement { 
      if (this.content) { 
        if (this.action) {
          this.content.onclick = () => {
            this.action(this.content)
          }
        }
        map.getContainer().appendChild(this.content);
        return this.content;
      }
      const div = document.createElement('div'); 
      div.appendChild(document.createTextNode(this.text)); 
      div.style.cursor = "pointer";
      div.style.padding = "7px 11px";
      div.style.boxShadow = "rgb(107 120 137 / 20%) 0px 2px 6px 0px, rgb(91 98 107 / 8%) 0px 4px 10px 0px";
      div.style.borderRadius = "5px";
      div.style.backgroundColor = "white";
      if (this.class) {
        div.classList.add(this.class)  
      }
      div.onclick = () => {
        if (this.action) {
          this.action(div)
        }
      }
      map.getContainer().appendChild(div);
      this.content = div;
      return div;
    }
  }
}
