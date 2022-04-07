import { logger } from "../..";
import { Event } from "../structures/Event";

export default new Event("error", async (err) => {
    logger.error(err);
});
