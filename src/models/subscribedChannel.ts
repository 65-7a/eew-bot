import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: String
});

export const SubscribedChannel = mongoose.model("Channel", schema);
