import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Freelancer } from "../models/Freelancer.models.js";
import { loginUser } from "./user.controller.js";
import { User } from "../models/User.models.js";
import {generateAccessAndRefereshTokens} from "./user.controller.js";

const registerFreelancer = asyncHandler(async (req, res, next) => {
  const { user, bio, skills, country, portfolio} = req.body
  console.log(req.body);

  if ( !skills || !portfolio || !bio || !country) {
    throw new ApiError(400, "Missing required fields")
  }

  const freelancer = await Freelancer.create({ 
    userId: user._id,
    bio, 
    skills, 
    country, 
    portfolio
  })

  if (!freelancer) {
    throw new ApiError(500, "Failed to register freelancer")
  }
  console.log("Freelancer registered:", freelancer._id);

  res.status(201).json({
    success: true,
    message: "Freelancer registered successfully",
  });

  const userToLog = User.findById(user._id);
  
  // using separate login logic here

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userToLog._id);

  // Send one response containing both freelancer data and login tokens
  res
    .status(201)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .json({
      success: true,
      message: "Freelancer registered and logged in successfully",
      user: userToLog,
      freelancer,
      accessToken,
      refreshToken
    });
});

export { registerFreelancer };

