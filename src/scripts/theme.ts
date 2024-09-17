import {
    argbFromHex,
    themeFromSourceColor,
    applyTheme,
    sourceColorFromImage,
    themeFromImage,
    SchemeVibrant
} from "@material/material-color-utilities";

function getImageURL() {
    let input = document.getElementById("theme-image-url");
    if (input instanceof HTMLInputElement) {
        return `./img/${input.value}.jpg`;
    }
}

function getImageFromURL(url: string) {
    let image = document.createElement("img");
    image.src = url;
    return image;
}

async function themeFromURL(url: string) {
    let image = getImageFromURL(url);
    return themeFromImage(image);
}

export function applyThemeOf(element: EventTarget | null) {
    if (element instanceof HTMLImageElement) {
        let content = document.getElementById('content');
        if (content instanceof HTMLElement) {
            content.style.backgroundImage = `url(${element.src})`;
        }
        themeFromURL(element.src).then(
            theme => applyTheme(theme, {
                target: document.body,
                dark: window.matchMedia("(prefers-color-scheme: dark)").matches
            })
        )
    }
}

export function applyThemeColor(color: string) {
    let theme = themeFromSourceColor(argbFromHex(color));
    applyTheme(theme, {
        target: document.body,
        dark: window.matchMedia("(prefers-color-scheme: dark)").matches
    })
}