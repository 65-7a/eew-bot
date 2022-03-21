import { MessageEmbed } from "discord.js";
import { client } from "../..";
import { Event } from "../structures/Event";

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

    client.logger.info(json);

    const embed = new MessageEmbed().addFields(
        Object.entries(json).map(([k, v]) => {
            return {
                name: k,
                value: v.toString()
            };
        })
    );

    const channel = client.channels.cache.get("955233543011844116");
    if (channel.isText()) {
        try {
            await channel.send({
                embeds: [embed]
            });
        } catch (e) {
            client.logger.error(e);
        }
    }
});
