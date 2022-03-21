import { ClientRequest, IncomingMessage } from "http";
import { RawData, WebSocket } from "ws";

export interface BaseWSClientEvents {
    close: [code: number, reason: Buffer];
    error: [err: Error];
    upgrade: [request: IncomingMessage];
    message: [data: RawData, isBinary: boolean];
    open: [];
    ping: [data: Buffer];
    pong: [data: Buffer];
    "unexpected-response": [
        this: WebSocket,
        request: ClientRequest,
        response: IncomingMessage
    ];
    // [key: string]: [...args: any[]];
}

export class Event<Key extends keyof BaseWSClientEvents> {
    constructor(
        public event: Key,
        public run: (...args: BaseWSClientEvents[Key]) => unknown
    ) {}
}
