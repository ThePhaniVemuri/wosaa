import mongoose from "mongoose";

const GigSchema = new mongoose.Schema(
  {
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    applicants: {   
        type: [
            {
                freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Changed from "Freelancer" to "User"
                appliedAt: { type: Date, default: Date.now },
                status: { type: String, enum: ['applied', 'accepted', 'rejected'], default: 'applied' }   
            }
        ],       
        default: []
    },
    hiredFreelancer: {   
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", // Changed from "Freelancer" to "User"
        default: null,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    category: {
        type: String,
        required: true,
        enum: ["SaaS Developement", "Vibe Coding", "UI/UX Design", "Digital Marketing"],
        trim: true,
    },
    budget: {
        type: Number,
        required: true,
        min: 0,
    },
    deliveryTimeInDays: {
        type: Number,
        required: true,
        min: 1,
    },
    skillsRequired: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} exceeds the limit of 20'],
    },
    attachments: {
        type: [String],
        default: [],
    },
  },
  { timestamps: true }
);

export const Gig = mongoose.model("Gig", GigSchema);

function arrayLimit(val) {
    return val.length <= 20;
}