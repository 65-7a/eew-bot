import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client, logger } from "../..";
import { Event } from "../structures/Event";
import { SubscribedChannel } from "./../../models/subscribedChannel";

/**
 * 551: JMAQuake (earthquake information)
 * 552: JMATsunami (tsunami forecast)
 * 554: EEWDetection (eew announcement detection)
 * 555: Areapeers (number of peers (sensors) in each region)
 * 561: Userquake (earthquake detection information)
 * 9611: UserquakeEvaluation (earthquake detection information evaluation result)
 */
export default new Event("message", async (data) => {
    const json = JSON.parse(data.toString());

    if (json.code === 555 || json.code === 561 || json.code === 9611) return;

    logger.info(json);

    const embed = new MessageEmbed();

    if (json.code === 551) {
        embed
            .setTitle("Earthquake Information")
            .addField(
                "Hypocenter",
                `json.earthquake.hypocenter.name (${json.earthquake.hypocenter.latitude}, ${json.earthquake.hypocenter.longitude})`,
                true
            )
            .addField("Magnitude", json.earthquake.hypocenter.magnitude, true)
            .addField("Depth", json.earthquake.hypocenter.depth + " km", true)
            .addField("Maximum Intensity", json.earthquake.maxScale, true)
            .addField("Tsunami", json.earthquake.domesticTsunami, true)
            .addField("Foreign Tsunami", json.earthquake.foreignTsunami, true)
            .setFooter({
                text: `<t:${DateTime.fromFormat(
                    json.earthquake.time,
                    "yyyy-MM-dd HH:mm:ss"
                ).toUnixInteger()}:f>`
            })
            .setTimestamp();
    } else {
        embed.addFields(
            Object.entries(json).map(([k, v]) => {
                return {
                    name: k,
                    value: v?.toString() || "null"
                };
            })
        );
    }

    const channels = await SubscribedChannel.find({}).exec();
    channels.forEach(async (ch) => {
        const channel = client.channels.cache.get(ch.id);
        if (channel.isText()) {
            try {
                await channel.send({
                    embeds: [embed]
                });
            } catch (e) {
                logger.error(e);
            }
        }
    });
});
