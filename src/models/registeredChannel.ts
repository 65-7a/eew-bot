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

export const RegisteredChannel = mongoose.model("Channel", schema);
