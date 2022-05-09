import { Command } from "../../structures/Command";
import convert from "color-convert";
import dedent from "dedent";
import { client } from "../..";
import { RegisteredChannel } from "../../models/registeredChannel";
import { Duration } from "luxon";
import { toHuman } from "../../util/util";

export default new Command({
    name: "about",
    description: "Information and acknowledgements",
    guildOnly: false,
    run: async ({ interaction }) => {
        await interaction.reply({
            embeds: [
                {
                    title: "About",
                    description: dedent(`
                        Earthquake information and images from [P2PQuake](https://p2pquake.net/)
                        Image source: [Geospatial Information Authority of Japan](https://www.gsi.go.jp/)
                        Data source: [Japan Meteorological Agency](https://www.jma.go.jp/)

                        [Invite link](https://discord.com/api/oauth2/authorize?client_id=857937397281849365&permissions=574016768&scope=bot%20applications.commands)

                        EEW Bot is a Japanese earthquake bot for Discord.
                    `),
                    fields: [
                        {
                            name: "Servers",
                            value: client.guilds.cache.size.toString(),
                            inline: true
                        },
                        {
                            name: "Registered Channels",
                            value: (
                                await RegisteredChannel.find().exec()
                            ).length.toString(),
                            inline: true
                        },
                        {
                            name: "Uptime",
                            value: toHuman(
                                Duration.fromMillis(process.uptime() * 1000),
                                {
                                    unitDisplay: "short"
                                }
                            ),
                            inline: true
                        }
                    ],
                    color: convert.hsl.rgb([360 * Math.random(), 70, 80]),
                    author: {
                        iconURL: (
                            await client.users.fetch("643362491317092372")
                        ).avatarURL(),
                        name: "65_7a",
                        url: "https://65-7a.tk/"
                    },
                    footer: {
                        iconURL:
                            "https://github.com/discordjs/website/blob/main/public/static/djs_logo.png?raw=true",
                        text: "Made with TypeScript + discord.js"
                    },
                    timestamp: Date.now()
                }
            ],
            ephemeral: false
        });
    }
});
