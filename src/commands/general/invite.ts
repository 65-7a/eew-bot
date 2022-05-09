import { Command } from "../../structures/Command";
import convert from "color-convert";

export default new Command({
    name: "invite",
    description: "Get the invite link of the bot",
    guildOnly: false,
    run: async ({ interaction }) => {
        await interaction.reply({
            embeds: [
                {
                    title: "Invite me!",
                    description:
                        "https://discord.com/api/oauth2/authorize?client_id=857937397281849365&permissions=574016768&scope=bot%20applications.commands",
                    url: "https://discord.com/api/oauth2/authorize?client_id=857937397281849365&permissions=574016768&scope=bot%20applications.commands",
                    color: convert.hsl.rgb([360 * Math.random(), 70, 80])
                }
            ],
            ephemeral: true
        });
    }
});
