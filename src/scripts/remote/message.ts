import { TupleType } from "typescript";
import {decodeAsync, decodeArrayStream} from '@msgpack/msgpack'
import { ReadableStreamLike } from "@msgpack/msgpack/dist/utils/stream";
import { deepStrictEqual } from "assert";

export class Message<Type, Packed extends TupleType, Unpacked extends TupleType> {
    constructor(
        public tag: number,
        public dump: (obj: Type)=> Promise<Packed>,
        public load: (obj: Packed)=> Promise<Type>
    ) {}
}

