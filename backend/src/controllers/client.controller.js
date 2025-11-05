import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Client } from "../models/Client.models.js";
import { User } from "../models/User.models.js";
import { Gig } from "../models/Gig.models.js";
import { generateAccessAndRefereshTokens } from "./user.controller.js";

const registerClient = asyncHandler(async (req, res) => {
  const { user, name, company, country } = req.body;

  // if frontend sent a stringified user object, parse it
  if (typeof user === "string") {
    try {
      user = JSON.parse(user);
    } catch (err) {
      console.error("Error parsing user object in client registration:", err);
    }
  }

  if (!name || !company || !country) {
    throw new ApiError(400, "Missing required fields for client registration");
  }

  if (!user || !user._id) {
    throw new ApiError(400, "User information missing for client registration");
  }

  const client = await Client.create({
    userId: user._id,
    name,
    company,
    country,
  });

  if (!client) {
    throw new ApiError(500, "Failed to register client");
  }

  const userDoc = await User.findById(user._id).select("-password -refreshToken");
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

  return res
    .status(201)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    .json({
      success: true,
      message: "Client registered and logged in successfully",
      user: userDoc,
      client,
      accessToken,
      refreshToken,
    });
});


const postGig = asyncHandler(async (req, res, next) => {
    const { title, description, category, budget, deliveryTimeInDays, skillsRequired, attachments } = req.body;
    console.log(req.body)
    const userId = req.user._id; 
    console.log(userId) 

    // Find the client associated with the user
    const client = await Client.findOne({ userId: userId });

    if (!client) {
        throw new ApiError(404, "Client profile not found for the user");
    }

    // Create a new gig
    const gig = await Gig.create({
        postedBy: client._id,
        title,
        description,
        category,
        budget,
        deliveryTimeInDays,
        skillsRequired,
        attachments,
    });
    if (!gig) {
        throw new ApiError(500, "Failed to post gig");
    }
    res.status(201).json({
        success: true,
        message: "Gig posted successfully",
        gig,
    });
});


const postedGigsbyClient = asyncHandler(async (req, res) => {
  if(!req.user){
    throw new ApiError(400, "No user added in req")
  }
  const client = await Client.findOne({userId: req.user._id})

  if (!client) {
    throw new ApiError(404, "Client profile not found");
  }

  const postedGigs = await Gig.find({postedBy: client}).lean()

  res.status(200).json(
    {
      success: true,
      message: "Gigs retrived successfully",
      postedGigs
    }
  )

})
 

export { registerClient,
         postGig,
         postedGigsbyClient
        };