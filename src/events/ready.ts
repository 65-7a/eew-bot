import { client, logger, p2pQuake } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", async () => {
    client.user.setActivity({
        type: "WATCHING",
        name: "for earthquakes"
    });

    logger.log("success", `Logged in as ${client.user.tag}`);

    await p2pQuake.start();
});
