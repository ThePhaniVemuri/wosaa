import { Router } from "express";
import { 
  registerClient, 
  postGig, 
  postedGigsByClient, 
  hireFreelancer, 
  createCheckoutSession, 
  createContract,
  setGigStatus
} from "../controllers/client.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/roleBasedAuth.middleware.js";

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

router.post("/post-gig", verifyJWT, verifyRole(["client"]), postGig);
router.get("/posted-gigs", verifyJWT, verifyRole(["client"]), postedGigsByClient);
router.post("/hire-freelancer", verifyJWT, verifyRole(["client"]), hireFreelancer);

router.post("/create-contract", verifyJWT, verifyRole(["client"]), createContract);
router.post("/payments/checkout", verifyJWT, verifyRole(["client"]), createCheckoutSession);

router.post("/set-gig-status", verifyJWT, verifyRole(["client"]), setGigStatus)


// you can add more client routes here (hire, view applicants, etc.)

export default router;