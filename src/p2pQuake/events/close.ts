import { logger, p2pQuake } from "../..";
import { waitMS } from "../../util/util";
import { Event } from "../structures/Event";

export default new Event("close", async (code, reason) => {
    logger.error(
        `P2PQuake websocket connection closed with code ${code}: ${reason}`
    );

    await waitMS(1000);
    p2pQuake.start();
});
