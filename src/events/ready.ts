import { client, logger } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", () => {
    client.user.setActivity({
        type: "WATCHING",
        name: "for earthquakes"
    });

    logger.log("success", `Logged in as ${client.user.tag}`);
});
