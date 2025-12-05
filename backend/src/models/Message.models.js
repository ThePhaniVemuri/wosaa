import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",     // both client & freelancer use main User model
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
