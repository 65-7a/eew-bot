import { RegisteredChannel } from "../../models/registeredChannel";
import { Command } from "../../structures/Command";

export default new Command({
    name: "register",
    description: "Registers a channel to receive EEW notifications",
    options: [
        {
            name: "channel",
            description: "Which channel to register",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
            required: true
        }
    ],
    guildOnly: true,
    run: async ({ interaction, args }) => {
        const channelMention = args.getChannel("channel", true);

        if (await RegisteredChannel.exists({ id: channelMention.id }).exec())
            return await interaction.reply(
                "This channel is already registered!"
            );

        const channel = interaction.guild.channels.cache.get(channelMention.id);

        if (!channel)
            return await interaction.reply("I cannot access that channel!");

        if (!channel.isText())
            return interaction.reply("That channel isn't a text channel!");

        if (!interaction.member.permissionsIn(channel).has("MANAGE_CHANNELS"))
            return interaction.reply({
                content:
                    "You need the `MANAGE_CHANNELS` permission in that channel for this command!",
                ephemeral: true
            });

        new RegisteredChannel({
            id: channel.id,
            guildId: interaction.guildId
        }).save();

        await interaction.reply(
            `Successfully registered. ${channelMention} will now receive earthquake notifications.`
        );
    }
});
