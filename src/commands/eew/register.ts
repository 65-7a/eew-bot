import { SubscribedChannel } from "../../models/subscribedChannel";
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
    run: async ({ interaction, args }) => {
        const channelMention = args.getChannel("channel", true);

        if (await SubscribedChannel.exists({ id: channelMention.id }).exec())
            return await interaction.followUp(
                "This channel is already subscribed!"
            );

        const channel = await interaction.guild.channels.fetch(
            channelMention.id
        );

        if (!channel)
            return await interaction.followUp("I cannot access that channel!");

        if (!channel.isText())
            return interaction.followUp("That channel isn't a text channel!");

        if (!interaction.member.permissionsIn(channel).has("MANAGE_CHANNELS"))
            return interaction.followUp(
                "You need the `MANAGE_CHANNELS` permission in that channel for this command!"
            );

        new SubscribedChannel({
            id: channel.id,
            guildId: interaction.guildId
        }).save();

        await interaction.followUp(
            `Successfully registered. ${channelMention} will now receive earthquake notifications.`
        );
    }
});
