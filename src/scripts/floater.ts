import { Icon } from "./icon";

export enum Position {
    TopLeft = 0x00,
    TopRight = 0x01,
    BottomLeft = 0b10,
    BottomRight = 0b11,
}

function chevron() {
    let icon = new Icon("arrow_drop_down");
    icon.node.classList.add("chevron");
    return icon.node;
}

export namespace Position {
    export function toClassList(position: Position): string[] {
        switch (position) {
            case Position.TopLeft:
                return ["top", "left"];
            case Position.TopRight:
                return ["top", "right"];
            case Position.BottomLeft:
                return ["bottom", "left"];
            case Position.BottomRight:
                return ["bottom", "right"];
        }
    }
}

export class Item {
    node: HTMLElement;
    constructor(public name: string, public scopes: Scope[], public icon: Icon | string | null = null) {
        let node = document.createElement("div");
        node.classList.add("item");
        if (typeof this.icon == 'string') {
            this.icon = new Icon(this.icon);
        }

        if (this.icon) { node.appendChild(this.icon.node) }
        if (this.name) { node.appendChild(document.createTextNode(this.name)) }
        if (this.scopes.length) {
            node.appendChild(chevron());
        }
        this.node = node;
    }

    attach(floater: Floater, items: Item[]) {
        let itemswith = [...items, this];
        items = items.length ? items : itemswith
        this.scopes.forEach(scope => {
            floater.node.appendChild(scope.node);
            scope.attach(floater, itemswith);
        });
        this.node.addEventListener(
            "click",
            (event) => floater.activate(this.node.classList.contains('active') ? items : itemswith, event),
        );
    }
}

export class Scope {
    node: HTMLElement;
    label_node: HTMLElement | null = null;
    constructor(
        public items: Item[],
        public name: string | null = null,
        public icon: Icon | string | null = null
    ) {
        let node = document.createElement("div");
        let menu = document.createElement("div");
        node.classList.add("menubar");
        menu.classList.add("menu");
        if (this.name || this.icon) {
            let label = document.createElement("div");
            label.classList.add("label", 'item');
            if (typeof this.icon == "string") {
                this.icon = new Icon(this.icon);
            }
            if (this.icon) {
                label.appendChild(this.icon.node);
            }
            if (this.name) {
                label.appendChild(document.createTextNode(this.name));
            }
            menu.appendChild(label);
            this.label_node = label;
        }
        this.items.forEach((item) => menu.appendChild(item.node));
        node.appendChild(menu);
        this.node = node;
    }

    attach(floater: Floater, items: Item[]) {
        this.items.forEach((item) => { item.attach(floater, items) });
        if (this.label_node) {
            this.label_node.addEventListener("click", (event) =>
                floater.activate(items, event)
            )
        }
    }

    allScopes(): Scope[] {
        return [
            this,
            ...this.items
                .flatMap((item) => item.scopes)
                .flatMap((scope) => scope.allScopes())
        ];
    }

    allItems() {
        return this.allScopes().flatMap((scope) => scope.items);
    }

}

export class Floater {
    node: HTMLElement;
    scope: Scope;
    isShifting: boolean = false;
    mover: HTMLElement;
    constructor(public items: Item[], public position: Position = Position.TopRight) {
        let node = document.createElement("div");
        Position.toClassList(position).forEach(cls => node.classList.add(cls));
        node.id = "floater";
        this.node = node;
        let mover = document.createElement("div");
        mover.classList.add("item", 'mover');
        mover.appendChild(new Icon("pan_tool").node);
        this.mover = mover;
        let scope = new Scope(this.items);
        let menu = scope.node.firstElementChild;
        if (menu) {
            menu.prepend(mover);
        }

        this.node.appendChild(scope.node);
        this.scope = scope;
    }

    public focus() {
        let content = document.getElementById("content");
        if (content) {
            content.classList.add("backoff");
        }
    }

    public backoff() {
        if (this.isShifting) {
            return;
        }
        this.deactivate();
        this.node.style.top = "";
        this.node.style.bottom = "";
        let content = document.getElementById("content");
        if (content) {
            content.classList.remove("backoff");
        }
    }

    public deactivate() {
        this.scope.allScopes().forEach((scope) => {
            scope.node.classList.remove("active", "current");
            scope.items.forEach((item) => item.node.classList.remove("active", "current"));
        });

    }


    preventEscape(mouseY: number) {
        this.isShifting = true;
        let startTime = performance.now();
        let node = this.node;
        let position = this.position;
        let floater = this;
        node.classList.add("shifting");

        function shift() {
            let rect = node.getBoundingClientRect();
            let newTop: number | null = null;

            switch (position) {
                case Position.TopLeft:
                case Position.TopRight:
                    if (mouseY > rect.bottom) {
                        newTop = mouseY - rect.height;
                    }
                    break;
                case Position.BottomLeft:
                case Position.BottomRight:
                    if (mouseY < rect.top) {
                        newTop = mouseY;
                    }
                    break;
            }

            if (newTop !== null) {
                node.style.top = `${newTop}px`;
                node.style.bottom = 'auto';
            }

            if (performance.now() - startTime < 360) {
                requestAnimationFrame(shift);
            } else {
                floater.isShifting = false;
                node.classList.remove("shifting");
            }
        }

        shift();
    }


    public activate(items: Item[], event: MouseEvent) {
        this.isShifting = true;
        let mouseY = event.pageY
        this.deactivate();
        let lenght = items.length;
        let current = lenght - 1;
        for (let i = 0; i < lenght; i++) {
            let item = items[i];
            item.node.classList.add("active");
            if (i == current) {
                item.node.classList.add("current");
                item.scopes.forEach(scope => {
                    scope.node.classList.add("current", "active");
                })
            } else {
                let next = items[i + 1];
                for (let scope of item.scopes) {
                    if (scope.items.includes(next)) {
                        scope.node.classList.add("active");
                        break;
                    }
                }
            }
        }
        this.preventEscape(mouseY);
    }

    public attach() {
        document.body.appendChild(this.node);
        this.node.addEventListener("click", (event) => {
            if (
                event.target instanceof HTMLElement 
                && event.target.id != "floater"
            ){
                this.focus()
            }
        }, {
            passive: true,
        });
        this.node.addEventListener("mouseleave", () => this.backoff(), {
            passive: true,
        });
        this.scope.attach(this, []);
    }
}
