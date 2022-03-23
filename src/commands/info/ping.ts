import { Command } from "../../structures/Command";

export default new Command({
    name: "ping",
    description: "pong",
    run: async ({ interaction }) => {
        await interaction.followUp("pong");
    }
});
