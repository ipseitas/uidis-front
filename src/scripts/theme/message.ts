import { themeFromImage, themeFromSourceColor, Theme as ColorTheme, applyTheme } from "@material/material-color-utilities";
import { Message } from "../remote/message";

export function binToURL(bin: Uint8Array) {
    return new Promise<URL>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new URL(reader.result as string));
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(new Error("Read aborted"));
        reader.readAsDataURL(new Blob([bin]));
    });
}

export async function imageURLtoBin(url: string | URL) {
    let response = await fetch(url);
    if (response.ok) {
        return new Uint8Array(await (await response.blob()).arrayBuffer());
    }
    return null;
}

export enum ThemeBrightness {
    light = 0,
    dark = 1,
    auto = 2,
}

export enum ThemeBackgroundPosition {
    top = 0,
    center = 1,
    bottom = 2,
    left = top,
    right = bottom,
}

type ThemePresetMessage = [
    image: Uint8Array | null,
    posX: number,
    posY: number,
    brigtness: number,
    color: number | null,
    name: string | null
];

export class ThemePreset {
    colorTheme: ColorTheme | null = null;

    constructor(
        public image: URL | null,
        public position: [ThemeBackgroundPosition, ThemeBackgroundPosition] 
                        = [ThemeBackgroundPosition.center, ThemeBackgroundPosition.center],
        public brightness: ThemeBrightness,
        public color: number | null,
        public name: string | null
    ){}

    async pack(): Promise<ThemePresetMessage> {
        return [
            this.image ? await imageURLtoBin(this.image) : null,
            ...this.position,
            this.brightness,
            this.color,
            this.name,
        ]
    }

    static async unpack(message: ThemePresetMessage) {
        let [image, posX, posY, brightness, color, name] = message;
        return new ThemePreset(
            image ? await binToURL(image) : null,
            [posX, posY],
            brightness,
            color,
            name
        );
    }

    applyBackground() {
        let style = (document.getElementById('content') as HTMLElement).style
        if (this.image) {
            style.backgroundImage = `url(${this.image.toString()})`;
            switch (this.position[0]) {
                case ThemeBackgroundPosition.left:
                    style.backgroundPositionX = "left";
                    break;
                case ThemeBackgroundPosition.center:
                    style.backgroundPositionX = "center";
                    break;
                case ThemeBackgroundPosition.right:
                    style.backgroundPositionX = "right";
                    break;
            }
            switch (this.position[1]) {
                case ThemeBackgroundPosition.top:
                    style.backgroundPositionY = "top";
                    break;
                case ThemeBackgroundPosition.center:
                    style.backgroundPositionY = "center";
                    break;
                case ThemeBackgroundPosition.bottom:
                    style.backgroundPositionY = "bottom";
                    break;
            }
        } else {
            style.backgroundColor = "var(--md-sys-color-surface-variant)"
        }
    }

    async getColorTheme() {
        if (this.colorTheme === null) {
            if (this.color == null) {
                if (this.image) {
                    let img = new Image();
                    img.src = this.image.toString();
                    this.colorTheme = await themeFromImage(img)
                } else {
                    this.colorTheme = themeFromSourceColor(0);
                }
            } else {
                this.colorTheme = themeFromSourceColor(this.color);
            }
        }
        return this.colorTheme;
    }

    getBrightness(): boolean {
        switch (this.brightness) {
            case ThemeBrightness.light:
                return true;
            case ThemeBrightness.dark:
                return false;
            case ThemeBrightness.auto:
                return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
    }

    async applyColorTheme() {
        applyTheme(await this.getColorTheme(),{
            target: document.body,
            dark: this.getBrightness()
        })
    }

    async apply() {
        this.applyBackground();
        await this.applyColorTheme();
        if (this.brightness == ThemeBrightness.auto) {
            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
                this.applyColorTheme();
            })
        }
    }

}

export namespace Themes {
    const KeyToPreset: Map<number, ThemePreset> = new Map();
    const PresetToKey: Map<ThemePreset, number> = new Map();
    function getKeyOf(preset: ThemePreset): string {
        return `theme:preset:${PresetToKey.get(preset)}`
    }
    const StorageKey = "theme-presets";
    export function add(preset: ThemePreset) {
        let key = KeyToPreset.size;

    }
}