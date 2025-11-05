import { Router } from "express";
import { registerFreelancer } from "../controllers/freelancer.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import {verifyJWT} from "../middleware/auth.middleware.js"
import { showGigs } from "../controllers/gig.controller.js";

const router = Router();

router.post("/register/freelancer", registerFreelancer);
router.get("/freelancer/gigs", showGigs);

export default router;