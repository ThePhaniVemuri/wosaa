import mongoose from "mongoose";

const FreelancerSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    bio: String,
    skills: [String],
    country: String,
    portfolio: [{ title: String, link: String }], //at least 2 portfolio projects
    gigsCompleted: {
        type: Number,
        default: 0
    },
    gigsApplied: { 
        type : [{type: mongoose.Schema.Types.ObjectId, ref: "Gig" }],
        default: [] 
    },
    earnings: Number,
    currentlyWorkingOn: { 
        type : [{type: mongoose.Schema.Types.ObjectId, ref: "Gig" }],
        default: [] 
    },
});

export const Freelancer = mongoose.model("Freelancer", FreelancerSchema);