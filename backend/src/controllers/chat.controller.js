import { ChatRoom } from "../models/ChatRoom.models.js";
import { Message } from "../models/Message.models.js";

const chatRoomLogic = async (req, res) => {
    try {
        const { clientId, freelancerId, gigId } = req.body;   
        console.log("Received chat room request with:", { clientId, freelancerId, gigId });     
        const chatRoom = await ChatRoom.findOne({ clientId, freelancerId, gigId });
        console.log("Found chat room:", chatRoom);

        if (!chatRoom) {    
            const chatRoom = new ChatRoom({ clientId, freelancerId, gigId });
            await chatRoom.save();
            console.log("Created new chat room:", chatRoom);

            const messages = [];

            return res
            .status(201)
            .json({ 
                success: true, 
                chatRoom,
                messages
            });        
        }

        const messages = await Message.find({ roomId: chatRoom._id }).sort({ createdAt: 1 });
        // console.log("Retrieved messages:", messages);        

        if (!messages) {            
            messages = [];
        }

        res
        .status(200)
        .json({ 
            success: true, 
            chatRoom,
            messages
        });        

    } catch (error) {
        console.error("Error in chatRoomLogic:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { chatRoomLogic };