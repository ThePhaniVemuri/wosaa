import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import {hashToken} from "../utils/token.js"


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log("Generating tokens for user ID:", userId)
        // console.log("Generating tokens for user:", user.email)

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens")
        }

        // console.log(user instanceof User);

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        const newHash = hashToken(refreshToken)
        user.refreshTokens = user.refreshTokens || []

        user.refreshTokens.push({ tokenHash: newHash, createdAt: new Date() })

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token", error)
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // Extract user details from request body
    const { name, email: rawEmail, password, role } = req.body
    const email = req.body.email.trim().toLowerCase();

    // console.log("Registering user mail:", { email })

    if (
        [name, email, password, role].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    if (!["client", "freelancer"].includes(role)) {
        throw new ApiError(400, "Role must be either client or freelancer")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    // Create the user
    const newUser = await User.create({ name, email, password, role })

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }    


    res.status(201)        
        .json({
            success: true,
            message: "User registered successfully",
            user: createdUser,            
        })

})

const loginUser = asyncHandler(async (req, res) => {
    // req -> get data
    // check if user exists
    // check if password is correct
    // generate access and refresh token
    // send cookie and response    
    const { email: rawEmail, password } = req.body
    const email = (rawEmail || "").trim().toLowerCase();
    // console.log("Logging in user mail:", { email })

    if (!email || !password) {
        throw new ApiError(400, "Both fields are important")
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        throw new ApiError(400, "User doesnot exist with this mail")
    }    

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    res.
        status(200).
        cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        })
        .json({
            success: true,
            message: "User logged in successfully",
            user: loggedInUser,
            accessToken,
            refreshToken
        })

})

const logoutUser = asyncHandler(async (req, res) => {
    // remove current refresh token only
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (incomingRefreshToken) {
        const tokenHash = hashToken(incomingRefreshToken);
        await User.findByIdAndUpdate(
            req.user._id, 
            {
                $pull: { refreshTokens: { tokenHash } },
            }
        );
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: true,
            message: "User logged out"
        })
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    res.status(200).json({
        success: true,
        user,
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw   new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const found = (user.refreshTokens || []).find((t) => t.tokenHash === incomingHash);

        if (!found) {
            // refresh token reuse detected — revoke all sessions
            user.refreshTokens = [];
            await user.save({ validateBeforeSave: false });
            throw new ApiError(401, "Refresh token reuse detected. All sessions revoked.");
        }

        // rotate: remove used token, issue a new one and store its hash
        user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        }

        // ->generating new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        const newHash = hashToken(newRefreshToken);
        user.refreshTokens.push({ tokenHash: newHash, createdAt: new Date() });

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                {
                    success: true,
                    message: "Access token refreshed",
                    accessToken                  
                }
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {
    registerUser,
    loginUser,
    generateAccessAndRefereshTokens,
    logoutUser,
    getCurrentUser,
    refreshAccessToken
};