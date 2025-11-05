import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js"
import { registerClient } from "../controllers/client.controller.js";
import { postGig } from "../controllers/client.controller.js";
import { postedGigsbyClient } from "../controllers/client.controller.js";

const router = Router();

router.post("/register/client", registerClient);
router.post("/client/post-gig", verifyJWT, postGig);
router.get("/client/postedgigs", verifyJWT, postedGigsbyClient);

export default router;