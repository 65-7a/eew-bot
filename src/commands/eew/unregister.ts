import { RegisteredChannel } from "../../models/registeredChannel";
import { Command } from "../../structures/Command";

export default new Command({
    name: "unregister",
    description: "Unregisters a channel to receive EEW notifications",
    options: [
        {
            name: "channel",
            description: "Which channel to unregister",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
            required: true
        }
    ],
    run: async ({ interaction, args }) => {
        const channelMention = args.getChannel("channel", true);

        const channel = interaction.guild.channels.cache.get(channelMention.id);

        if (!channel)
            return await interaction.followUp("I cannot access that channel!");

        if (!channel.isText())
            return interaction.followUp("That channel isn't a text channel!");

        if (!interaction.member.permissionsIn(channel).has("MANAGE_CHANNELS"))
            return interaction.followUp({
                content:
                    "You need the `MANAGE_CHANNELS` permission in that channel for this command!",
                ephemeral: true
            });

        if (!(await RegisteredChannel.exists({ id: channelMention.id }).exec()))
            return await interaction.followUp(
                "That channel is not registered!"
            );

        await RegisteredChannel.deleteOne({ id: channelMention.id }).exec();
        await interaction.followUp(
            `Successfully unregistered. ${channelMention} will no longer receive earthquake notifications.`
        );
    }
});
