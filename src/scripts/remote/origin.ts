import { Type } from "typescript";
import { Config } from "./message";

export class Origin {
    url: URL;
    constructor(url: URL | string) {
        this.url = url instanceof URL ? url : new URL(url);
    }

    loadConfig(config: Type) {}
}