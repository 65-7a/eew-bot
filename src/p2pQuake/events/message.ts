import axios from "axios";
import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client, logger } from "../..";
import { Event } from "../structures/Event";
import { areaNames } from "../typings/areas";
import { jmaColors, jmaIntensity } from "../typings/scale";
import { WebSocketData } from "../typings/schemas";
import { SubscribedChannel } from "./../../models/subscribedChannel";
import { groupBy, parseDate, waitMS } from "./../../util/util";

export default new Event("message", async (data) => {
    const json = JSON.parse(data.toString()) as WebSocketData;
    if (json.code === 555 || json.code === 561 || json.code === 9611) return;
    logger.verbose(data);

    handleData(json);
});

async function handleData(data: WebSocketData) {
    switch (data.code) {
        case 551: {
            const id = data.id || data._id;
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
                description: `Issued at ${parseDate(
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
                            jmaIntensity[data.earthquake.maxScale.toString()],
                            true
                        )
                        .addFields(
                            Object.entries(
                                groupBy(data.points, (p) => p.scale.toString())
                            ).map(([scale, points]) => {
                                return {
                                    name: `Intensity ${jmaIntensity[scale]}`,
                                    value: points
                                        .map((point) => areaNames[point.addr])
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
                                name: "Epicenter",
                                value: `${
                                    areaNames[data.earthquake.hypocenter.name]
                                } (${data.earthquake.hypocenter.latitude}, ${
                                    data.earthquake.hypocenter.longitude
                                })`,
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
                                value: jmaIntensity[
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
                            jmaColors[data.earthquake.maxScale.toString()]
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
                    while (tries < 6) {
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
