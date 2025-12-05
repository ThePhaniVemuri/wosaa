import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Freelancer } from "../models/Freelancer.models.js";
import { Gig } from "../models/Gig.models.js";
import { User } from "../models/User.models.js";
import { generateAccessAndRefereshTokens } from "./user.controller.js";

const registerFreelancer = asyncHandler(async (req, res, next) => {
  const { user, bio, skills, country, portfolio } = req.body
  console.log(req.body);

  if (!skills || !portfolio || !bio || !country) {
    throw new ApiError(400, "Missing required fields")
  }

  let parsedUser = user;

  // If frontend sent user as a string (localStorage), parse it
  if (typeof parsedUser === "string") {
    try {
      parsedUser = JSON.parse(parsedUser);
    } catch (err) {
      console.error("Error parsing user:", err);
      throw new ApiError(400, "Invalid user object received");
    }
  }

  if (!parsedUser || !parsedUser._id) {
    throw new ApiError(400, "User missing");
  }

  const userId = parsedUser._id

  // Check if freelancer profile already exists
  const existingFreelancer = await Freelancer.findOne({ userId });
  if (existingFreelancer) {
    throw new ApiError(409, "Freelancer profile already exists for this user");
  }

  const freelancer = await Freelancer.create({
    userId,
    bio,
    skills,
    country,
    portfolio
  })

  const userDoc = await User.findById(userId).select("-password -refreshToken");
  console.log("Freelancer created with ID:", freelancer._id);
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userId);

  if (!freelancer) {
    throw new ApiError(500, "Failed to register freelancer")
  }
  console.log("Freelancer registered:", freelancer._id);

  return res
    .status(201)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    .json({
      success: true,
      message: "Freelancer registered and logged in successfully",
      user: userDoc,
      freelancer,
      accessToken,
      refreshToken,
    });

});

const applyToGig = asyncHandler(async (req, res, next) => {
  const gigId = req.body.gigId;
  const freelancerId = req.user._id;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }
  console.log("Gig found:", gig);

  // Check if the freelancer has already applied
  const alreadyApplied = gig.applicants.some(applicant => applicant.freelancerId.equals(freelancerId));
  if (alreadyApplied) {
    throw new ApiError(400, "Freelancer has already applied to this gig");
  }
  console.log("Freelancer has not applied yet, proceeding with application.");

  // important to push application details
  gig.applicants.push({ freelancerId, appliedAt: new Date(), status: 'applied' });
  await gig.save();
  console.log("Gig after application:", gig);

  const freelancer = await Freelancer.findOne({ userId: freelancerId });
  if (!freelancer) {
    throw new ApiError(404, "Freelancer profile not found");
  }

  if (freelancer.gigsApplied === undefined) {
    freelancer.gigsApplied = [];
    console.log(freelancer);
    console.log(freelancer.gigsApplied);
  }

  if (freelancer.gigsApplied.includes(gigId)) {
    throw new ApiError(400, "Freelancer has already applied to this gig");
  }

  freelancer.gigsApplied.push(gigId);
  console.log("Freelancer after applying:", freelancer);

  await freelancer.save();

  res
    .status(200)
    .json({
      success: true,
      message: `User ${freelancerId} applied to gig ${gigId} successfully`,
    });
});

const gigsInWork = asyncHandler(async (req, res) => {
  const freelancerId = req.user._id;
  const freelancer = await Freelancer.findOne({ userId: freelancerId })
  .populate({
    path: "currentlyWorkingOn",
    model: "Gig",
    select: "title description budget deadline postedBy",
    populate: {
      path: "postedBy",
      model: "Client",
      select: "userId name company country"
    }
  })

  if (!freelancer) {
    throw new ApiError(404, "Freelancer profile not found");
  }

  console.log("Freelancer's gigs in work:", freelancer.currentlyWorkingOn); 

  res.status(200).json({
    success: true,
    gigsInWork: freelancer.currentlyWorkingOn || [],
  });
});

export {
  registerFreelancer,
  applyToGig,
  gigsInWork
};