import { Event } from "../structures/Event";
import { logger } from "../..";

export default new Event("open", () => {
    logger.info("Connected to P2PQuake websocket");
});
