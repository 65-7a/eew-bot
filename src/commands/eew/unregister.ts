import { SubscribedChannel } from "../../models/subscribedChannel";
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

        if (!(await SubscribedChannel.exists({ id: channelMention.id }).exec()))
            return await interaction.followUp(
                "This channel is not subscribed!"
            );

        await SubscribedChannel.deleteOne({ id: channelMention.id }).exec();

        await interaction.followUp(
            `Successfully unregistered. ${channelMention} will no longer receive earthquake notifications.`
        );
    }
});