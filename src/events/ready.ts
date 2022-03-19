import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", () => {
    client.logger.log("success", `Logged in as ${client.user.tag}`);
});
