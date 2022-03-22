import { ExtendedClient } from "./structures/Client";
import winston from "winston";
import { consoleTransport, winstonConfig } from "./config/winston";

export const logger = winston.createLogger(winstonConfig);

if (process.env.NODE_ENV !== "production") {
    logger.add(consoleTransport);
}

export const client = new ExtendedClient();

client.start();
