import mongoose, {Schema} from "mongoose";

const clientSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    name: String,
    company: String,
    country: String,
    jobsPosted: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: "Gig" }],
        default: []
    },
    hiredFreelancers: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" }],
        default: []
    }
});

export const Client = mongoose.model("Client", clientSchema);