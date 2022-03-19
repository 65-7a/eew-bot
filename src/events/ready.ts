import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});
