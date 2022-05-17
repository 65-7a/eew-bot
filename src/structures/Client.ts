import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Intents
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob-promise";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import { importFile } from "../util/util";
import { logger } from "..";
import mongoose from "mongoose";
import env from "env-var";

export class ExtendedClient extends Client {
    commands = new Collection<string, CommandType>();

    constructor() {
        super({
            intents: new Intents(32767).remove([
                "GUILD_PRESENCES",
                "GUILD_MEMBERS"
            ])
        });
    }

    async start() {
        await mongoose.connect(
            env
                .get("DB_CONNECTION_URL")
                .default("mongodb://localhost:27017/eew-bot")
                .asUrlString()
        );
        await this.registerModules();
        await this.login(env.get("BOT_TOKEN").required(true).asString());
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            logger.info(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            logger.info("Registering global commands");
        }
    }

    async registerModules() {
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await glob(
            `${__dirname}/../commands/*/*{.ts,.js}`
        );
        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            slashCommands.push(command);
        });

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: env.get("GUILD_ID").required(false).asString()
            });
        });

        const eventFiles = await glob(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await importFile(filePath);

            this.on(event.event, (...args) => {
                try {
                    event.run(...args);
                } catch (err) {
                    logger.error(
                        `An error occurred while handling Discord event ${event.event}: ${err}`
                    );
                }
            });
        });
    }
}
