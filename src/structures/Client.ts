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
import { P2PQuakeClient } from "../p2pQuake/p2pQuake";
import { importFile } from "../util/util";
import { logger } from "..";

export class ExtendedClient extends Client {
    commands = new Collection<string, CommandType>();
    p2pQuake = new P2PQuakeClient();

    constructor() {
        super({
            intents: new Intents(32767).remove([
                "GUILD_PRESENCES",
                "GUILD_MEMBERS"
            ])
        });
    }

    start() {
        this.registerModules();
        this.login(process.env.BOT_TOKEN);
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
                guildId: process.env.GUILD_ID
            });
        });

        const eventFiles = await glob(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await importFile(filePath);

            this.on(event.event, event.run as never);
        });

        await this.p2pQuake.registerModules();
    }
}
