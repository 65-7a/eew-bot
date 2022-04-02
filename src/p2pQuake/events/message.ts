import axios from "axios";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { DateTime } from "luxon";
import { client, logger } from "../..";
import { Event } from "../structures/Event";
import { JMAColors, JMAIntensity } from "../typings/scale";
import { SubscribedChannel } from "./../../models/subscribedChannel";
import { parseDate, waitMS } from "./../../util/util";

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

    const embed: MessageEmbedOptions = {
        title: "Earthquake Information",
        fields: [
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
                value: json.earthquake.hypocenter.depth.toString() + " km",
                inline: true
            },
            {
                name: "Maximum Intensity",
                value: JMAIntensity[json.earthquake.maxScale.toString()],
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
            },
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
        timestamp: Date.now(),
        color: JMAColors[json.earthquake.maxScale.toString()]
    };

    const channels = await SubscribedChannel.find({}).exec();
    channels.forEach(async (ch) => {
        const channel = client.channels.cache.get(ch.id);
        if (channel.isText()) {
            try {
                const message = await channel.send({
                    embeds: [embed]
                });

                const waitForImage = async () => {
                    await waitMS(5000);

                    try {
                        const response = await axios.get(imageUrl);

                        if (response.status === 200) {
                            await message.edit({
                                embeds: [
                                    new MessageEmbed(embed).setImage(imageUrl)
                                ]
                            });
                        }
                    } catch (e) {
                        if (!axios.isAxiosError(e)) return logger.error(e);

                        if (e.response.status === 404) {
                            return waitForImage();
                        }
                    }
                };

                waitForImage();

                logger.debug(message.embeds[0].image);
            } catch (e) {
                logger.error(e);
            }
        }
    });
});
