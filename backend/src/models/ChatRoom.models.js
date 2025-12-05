import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer",
        required: true
    },
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gig",
        required: true
    }
}, { timestamps: true });

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
