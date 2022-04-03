import { Event } from "../structures/Event";

export default new Event("error", async (err) => {
    console.error(err);
});
