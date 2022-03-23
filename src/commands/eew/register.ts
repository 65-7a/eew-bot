import { Command } from "../../structures/Command";

export default new Command({
    name: "register",
    description: "Registers a channel to receive EEW notifications",
    run: async ({ interaction }) => {
        await interaction.reply("TODO");
    }
});
