import { ExtendedClient } from "./structures/Client";
import winston from "winston";
import { consoleTransport, winstonConfig } from "./config/winston";
import { P2PQuakeClient } from "./p2pQuake/p2pQuake";
import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export const logger = winston.createLogger(winstonConfig);

if (
    env.get("NODE_ENV").default("dev").asEnum(["dev", "production"]) !==
    "production"
) {
    logger.add(consoleTransport);
}

export const p2pQuake = new P2PQuakeClient();
export const client = new ExtendedClient();

client.start();
