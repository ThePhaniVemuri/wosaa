import { Router } from "express";
import { registerClient, postGig, postedGigsByClient, hireFreelancer } from "../controllers/client.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public
router.post("/register", registerClient);

// Protected
router.get("/me", verifyJWT, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.post("/post-gig", verifyJWT, postGig);
router.get("/posted-gigs", verifyJWT, postedGigsByClient);
router.post("/hire-freelancer", verifyJWT, hireFreelancer);

// you can add more client routes here (hire, view applicants, etc.)

export default router;