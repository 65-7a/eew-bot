import { SubscribedChannel } from "../../models/subscribedChannel";
import { Command } from "../../structures/Command";

export default new Command({
    name: "getsubscribed",
    description: "Get all registered channels in the current guild",
    run: async ({ interaction }) => {
        const subscribed = await SubscribedChannel.find({
            guildId: interaction.guildId
        }).exec();
        await interaction.followUp(
            `Subscribed channels in ${interaction.guild.name}:\n\n${subscribed
                .map((o) => `<#${o.id}>`)
                .join(", ")}`
        );
    }
});
