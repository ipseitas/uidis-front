
export enum Style {
    Outlined = "material-symbols-outlined",
    Rounded = "material-symbols-rounded",
    Sharp = "material-symbols-sharp",
}

export class Icon {
    node: HTMLElement;
    constructor(
        public name: string,
        public style: Style = Style.Rounded,
    ) {
        let node = document.createElement("span");
        node.classList.add(this.style, 'icon');
        node.appendChild(document.createTextNode(this.name));
        this.node = node;
    }
}