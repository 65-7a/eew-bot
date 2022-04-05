import axios from "axios";
import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client, logger } from "../..";
import { Event } from "../structures/Event";
import { JMAColors, JMAIntensity } from "../typings/scale";
import { SubscribedChannel } from "./../../models/subscribedChannel";
import { groupBy, parseDate, waitMS } from "./../../util/util";

/**
 * 551: JMAQuake (earthquake information)
 * 552: JMATsunami (tsunami forecast)
 * 554: EEWDetection (eew announcement detection)
 * 555: AreaPeers (number of peers (sensors) in each region)
 * 561: UserQuake (earthquake detection information)
 * 9611: UserQuakeEvaluation (earthquake detection information evaluation result)
 */
export default new Event("message", async (data) => {
    const json = JSON.parse(data.toString());
    if (json.code === 555 || json.code === 561 || json.code === 9611) return;
    logger.verbose(json);
    if (json.code !== 551) return;

    const id = json.id || json["_id"];
    const imageUrl = `https://www.p2pquake.net/app/images/${id}_trim_big.png`;

    const embed = new MessageEmbed({
        fields: [
            {
                name: "Time",
                value: parseDate(json.earthquake.time).toLocaleString(
                    DateTime.DATETIME_FULL_WITH_SECONDS
                )
            }
        ],
        description: `Issued by ${json.issue.source} at ${parseDate(
            json.issue.time
        ).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}`,
        footer: {
            text: "Source: Japan Meteorological Agency"
        },
        timestamp: Date.now()
    });

    switch (json.issue.type) {
        case "ScalePrompt": {
            embed
                .setTitle("Earthquake Seismic Intensity Information")
                .setDescription(
                    `${embed.description}\nEpicenter and tsunami information is under investigation.`
                )
                .addField(
                    "Maximum Intensity",
                    JMAIntensity[json.earthquake.maxScale.toString()],
                    true
                )
                .addFields(
                    Object.entries(
                        groupBy<{
                            addr: string;
                            isArea: boolean;
                            pref: string;
                            scale: number;
                        }>(json.points, (p) => p.scale.toString())
                    ).map(([scale, points]) => {
                        return {
                            name: `Intensity ${JMAIntensity[scale]}`,
                            value: points.map((point) => point.addr).join("\n"),
                            inline: true
                        };
                    })
                )
                .setColor("#90b0e6");

            break;
        }

        case "Destination": {
            embed
                .setTitle("Earthquake Epicenter Information")
                .addFields([
                    {
                        name: "Hypocenter",
                        value: `${json.earthquake.hypocenter.name} (${json.earthquake.hypocenter.latitude}, ${json.earthquake.hypocenter.longitude})`,
                        inline: true
                    },
                    {
                        name: "Magnitude",
                        value: json.earthquake.hypocenter.magnitude.toString(),
                        inline: true
                    },
                    {
                        name: "Depth",
                        value:
                            json.earthquake.hypocenter.depth.toString() + " km",
                        inline: true
                    }
                ])
                .setColor("#90b0e6");

            break;
        }

        default: {
            switch (json.issue.type) {
                case "ScaleAndDestination":
                case "DetailScale": {
                    embed.setTitle("Earthquake Information");
                    break;
                }

                case "Foreign": {
                    embed.setTitle("Foreign Earthquake Information");
                    break;
                }

                case "Other": {
                    embed.setTitle("Other Earthquake Information");
                }
            }

            embed
                .addFields([
                    {
                        name: "Hypocenter",
                        value: `${json.earthquake.hypocenter.name} (${json.earthquake.hypocenter.latitude}, ${json.earthquake.hypocenter.longitude})`,
                        inline: true
                    },
                    {
                        name: "Magnitude",
                        value: json.earthquake.hypocenter.magnitude.toString(),
                        inline: true
                    },
                    {
                        name: "Depth",
                        value:
                            json.earthquake.hypocenter.depth.toString() + " km",
                        inline: true
                    },
                    {
                        name: "Maximum Intensity",
                        value: JMAIntensity[
                            json.earthquake.maxScale.toString()
                        ],
                        inline: true
                    },
                    {
                        name: "Tsunami",
                        value: json.earthquake.domesticTsunami,
                        inline: true
                    },
                    {
                        name: "Foreign Tsunami",
                        value: json.earthquake.foreignTsunami,
                        inline: true
                    }
                ])
                .setColor(JMAColors[json.earthquake.maxScale.toString()]);
        }
    }

    const channels = await SubscribedChannel.find({}).exec();
    channels.forEach(async (ch) => {
        const channel = await client.channels.fetch(ch.id);
        if (channel.isText()) {
            try {
                const message = await channel.send({
                    embeds: [embed]
                });

                let tries = 0;
                while (tries < 12) {
                    try {
                        const response = await axios.get(imageUrl);
                        if (response.status === 200) {
                            await message.edit({
                                embeds: [embed.setImage(imageUrl)]
                            });

                            break;
                        }
                    } catch (err) {
                        if (!axios.isAxiosError(err)) return logger.error(err);

                        await waitMS(5000);
                        tries++;
                    }
                }
            } catch (e) {
                logger.error(e);
            }
        }
    });
});
