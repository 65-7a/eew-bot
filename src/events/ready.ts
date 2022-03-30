import { client, logger, p2pQuake } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", async () => {
    const revision = (await import("child_process"))
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim();

    client.user.setActivity({
        type: "WATCHING",
        name: `for earthquakes | ${revision}`
    });

    logger.log("success", `Logged in as ${client.user.tag}`);

    await p2pQuake.start();
});
