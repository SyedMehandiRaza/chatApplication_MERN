import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUser = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUser);

    } catch (error) {
        console.log("Error in getUserForSidebar",error.message);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const getMessage = async (req,res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {myId:myId, recieverId:userToChatId},
                {myId:userToChatId, recieverId: myId}
            ]
        })

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessage controller",error.message);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            // image upload kar rhe cloudinary pe 
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;

        }
        const newMessage = new Message({ 
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        await newMessage.save();

        // todo: realtime functionality goes here => socket.io

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller",error.message);
        res.status(500).json({error: "Internal server error"})
        
    }
}
