import { client } from "../..";
import { Event } from "../structures/Event";

export default new Event("open", () => {
    client.logger.info("Connected to P2PQuake websocket");
});
