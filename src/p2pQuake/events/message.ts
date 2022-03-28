import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client, logger } from "../..";
import { Event } from "../structures/Event";
import { SubscribedChannel } from "./../../models/subscribedChannel";
import { parseDate } from "./../../util/util";

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

    const embed = new MessageEmbed();

    if (json.code === 551) {
        embed
            .setTitle("Earthquake Information")
            .addField(
                "Hypocenter",
                `${json.earthquake.hypocenter.name} (${json.earthquake.hypocenter.latitude}, ${json.earthquake.hypocenter.longitude})`,
                true
            )
            .addField(
                "Magnitude",
                json.earthquake.hypocenter.magnitude.toString(),
                true
            )
            .addField(
                "Depth",
                json.earthquake.hypocenter.depth.toString() + " km",
                true
            )
            .addField(
                "Maximum Intensity",
                json.earthquake.maxScale.toString(),
                true
            )
            .addField("Tsunami", json.earthquake.domesticTsunami, true)
            .addField("Foreign Tsunami", json.earthquake.foreignTsunami, true)
            .addField(
                "Time",
                parseDate(json.earthquake.time).toLocaleString(
                    DateTime.DATETIME_FULL_WITH_SECONDS
                )
            )
            .setDescription(
                `Issued by ${json.issue.source} at ${parseDate(
                    json.issue.time
                ).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}`
            )
            .setTimestamp()
            .setImage(
                `https://www.p2pquake.net/app/images/${json["_id"]}_trim_big.png`
            );
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
