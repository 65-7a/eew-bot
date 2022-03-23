import { client } from "../..";
import { SubscribedChannel } from "../../models/subscribedChannel";
import { Command } from "../../structures/Command";

export default new Command({
    name: "subscribe",
    description: "Registers a channel to receive EEW notifications",
    options: [
        {
            name: "channel",
            description: "Which channel to subscribe",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true
        }
    ],
    run: async ({ interaction, args }) => {
        const channelMention = args.getChannel("channel", true);

        if (await SubscribedChannel.exists({ id: channelMention.id }).exec()) {
            return await interaction.followUp(
                "This channel is already subscribed!"
            );
        }

        const channel = new SubscribedChannel({ id: channelMention.id });
        if (client.channels.cache.has(channel.id)) {
            channel.save();
        } else {
            return await interaction.followUp("I cannot access that channel!");
        }

        await interaction.followUp(
            `Successfully subscribed. ${channelMention} will now receive earthquake notifications.`
        );
    }
});
