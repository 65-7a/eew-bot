import axios from "axios";
import { p2pQuake } from "../..";
import { Command } from "../../structures/Command";

export default new Command({
    name: "testmessage",
    description: "Emit a message event from the most recent earthquake",
    run: async ({ interaction }) => {
        const response = await axios.get(
            "https://api.p2pquake.net/v2/history?codes=551&limit=1"
        );

        const responseString = JSON.stringify(response.data[0]);

        p2pQuake.ws.emit("message", Buffer.from(responseString));

        await interaction.followUp({
            embeds: [
                {
                    title: "Emitted message event",
                    description: `\`\`\`json\n${responseString}\`\`\`\n`
                }
            ]
        });
    }
});
