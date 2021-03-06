import { CommandInteractionOptionResolver } from "discord.js";
import { client, logger } from "..";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";

export default new Event("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return await interaction.reply("This command does not exist!");

        try {
            if (command.guildOnly && !interaction.inGuild()) {
                return await interaction.reply(
                    "This command can only be run in a guild!"
                );
            }

            command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
        } catch (err) {
            logger.error(
                `An error occurred while handling command ${interaction.commandName}: ${err}`
            );

            await interaction.reply(
                "An error occurred while handling the command!"
            );
        }
    }
});
