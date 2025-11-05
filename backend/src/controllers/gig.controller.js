import asyncHandler from "../utils/asyncHandler.js";
import { Gig } from "../models/Gig.models.js";
import ApiError from "../utils/ApiError.js";

const showGigs = asyncHandler(async (req, res) => {
    const gigs = await Gig.find({}).lean()

    if(!gigs){
        throw new ApiError(500, "gigs retriving error")
    }

    if (gigs.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No gigs found",
            gigs: []
        });
    }


    res.
    status(200).
    json({
        success: true,
        message: "gigs sent",
        gigs
    })

})

export {showGigs}