import glob from "glob-promise";
import { WebSocket } from "ws";
import { importFile } from "../util/util";
import { BaseWSClientEvents, Event } from "./structures/Event";

export class P2PQuakeClient {
    ws = new WebSocket("wss://api.p2pquake.net/v2/ws");

    async registerModules() {
        const eventFiles = await glob(`${__dirname}/events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof BaseWSClientEvents> = await importFile(
                filePath
            );

            this.ws.on(event.event, event.run);
        });
    }
}
