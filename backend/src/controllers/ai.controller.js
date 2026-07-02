import { reviewGigSubmission } from "../../services/AIservice.js";
import asyncHandler from "../utils/asyncHandler.js";

export const reviewGigForApproval = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  const review = await reviewGigSubmission(payload);

  return res.status(200).json({
    success: true,
    review,
  });
});
