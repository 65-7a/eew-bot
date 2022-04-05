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

    if (Array.isArray(json)) {
        json.forEach((data) => handleData(data));
    } else {
        handleData(json);
    }
});

async function handleData(data: Record<string, any>) {
    if (data.code === 555 || data.code === 561 || data.code === 9611) return;
    logger.verbose(data);

    switch (data.code) {
        case 551: {
            const id = data.id || data["_id"];
            const imageUrl = `https://www.p2pquake.net/app/images/${id}_trim_big.png`;

            const embed = new MessageEmbed({
                fields: [
                    {
                        name: "Time",
                        value: parseDate(data.earthquake.time).toLocaleString(
                            DateTime.DATETIME_FULL_WITH_SECONDS
                        )
                    }
                ],
                description: `Issued by ${data.issue.source} at ${parseDate(
                    data.issue.time
                ).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}`,
                footer: {
                    text: "Source: Japan Meteorological Agency"
                },
                timestamp: Date.now()
            });

            switch (data.issue.type) {
                case "ScalePrompt": {
                    embed
                        .setTitle("Earthquake Seismic Intensity Information")
                        .setDescription(
                            `${embed.description}\nEpicenter and tsunami information is under investigation.`
                        )
                        .addField(
                            "Maximum Intensity",
                            JMAIntensity[data.earthquake.maxScale.toString()],
                            true
                        )
                        .addFields(
                            Object.entries(
                                groupBy<{
                                    addr: string;
                                    isArea: boolean;
                                    pref: string;
                                    scale: number;
                                }>(data.points, (p) => p.scale.toString())
                            ).map(([scale, points]) => {
                                return {
                                    name: `Intensity ${JMAIntensity[scale]}`,
                                    value: points
                                        .map((point) => point.addr)
                                        .join("\n"),
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
                                value: `${data.earthquake.hypocenter.name} (${data.earthquake.hypocenter.latitude}, ${data.earthquake.hypocenter.longitude})`,
                                inline: true
                            },
                            {
                                name: "Magnitude",
                                value: data.earthquake.hypocenter.magnitude.toString(),
                                inline: true
                            },
                            {
                                name: "Depth",
                                value:
                                    data.earthquake.hypocenter.depth.toString() +
                                    " km",
                                inline: true
                            }
                        ])
                        .setColor("#90b0e6");

                    break;
                }

                default: {
                    switch (data.issue.type) {
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
                                value: `${data.earthquake.hypocenter.name} (${data.earthquake.hypocenter.latitude}, ${data.earthquake.hypocenter.longitude})`,
                                inline: true
                            },
                            {
                                name: "Magnitude",
                                value: data.earthquake.hypocenter.magnitude.toString(),
                                inline: true
                            },
                            {
                                name: "Depth",
                                value:
                                    data.earthquake.hypocenter.depth.toString() +
                                    " km",
                                inline: true
                            },
                            {
                                name: "Maximum Intensity",
                                value: JMAIntensity[
                                    data.earthquake.maxScale.toString()
                                ],
                                inline: true
                            },
                            {
                                name: "Tsunami",
                                value: data.earthquake.domesticTsunami,
                                inline: true
                            },
                            {
                                name: "Foreign Tsunami",
                                value: data.earthquake.foreignTsunami,
                                inline: true
                            }
                        ])
                        .setColor(
                            JMAColors[data.earthquake.maxScale.toString()]
                        );
                }
            }

            const channels = await SubscribedChannel.find({}).exec();
            channels.forEach(async (ch) => {
                const channel = await client.channels.fetch(ch.id);
                if (channel.isText()) {
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
                            logger.error(err);
                            if (!axios.isAxiosError(err)) return;

                            await waitMS(5000);
                            tries++;
                        }
                    }
                }
            });
        }
    }
}
