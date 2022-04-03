import { Event } from "../structures/Event";

export default new Event("close", async (code, reason) => {
    console.error(
        `P2PQuake websocket connection closed with code ${code}: ${reason}`
    );
});
