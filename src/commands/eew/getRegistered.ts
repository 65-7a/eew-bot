import { RegisteredChannel } from "../../models/registeredChannel";
import { Command } from "../../structures/Command";

export default new Command({
    name: "getregistered",
    description: "Get all registered channels in the current guild",
    run: async ({ interaction }) => {
        const registered = await RegisteredChannel.find({
            guildId: interaction.guildId
        }).exec();

        for await (const c of registered) {
            await interaction.guild.channels.fetch(c.id).catch(async () => {
                await RegisteredChannel.deleteOne({ id: c.id }).exec();
                registered.splice(registered.indexOf(c.id), 1);
            });
        }

        await interaction.followUp(
            `Registered channels in ${interaction.guild.name}:\n\n${registered
                .map((c) => `<#${c.id}>`)
                .join(", ")}`
        );
    }
});
