import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    }
});

export const SubscribedChannel = mongoose.model("Channel", schema);
