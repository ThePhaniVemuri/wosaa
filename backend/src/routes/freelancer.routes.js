import { Router } from "express";
import { registerFreelancer, applyToGig, gigsInWork } from "../controllers/freelancer.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { showGigs } from "../controllers/gig.controller.js";
import { get } from "mongoose";

const router = Router();

// Public
router.post("/register", registerFreelancer);

// Protected
router.get("/me", verifyJWT, async (req, res, next) => {
  // optional quick handler — prefer implementing in controller if needed
  try {
    const user = req.user;
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.post("/apply-gig", verifyJWT, applyToGig);

router.get("/gigs", showGigs);

router.get("/gigs-in-work", verifyJWT, gigsInWork);

export default router;