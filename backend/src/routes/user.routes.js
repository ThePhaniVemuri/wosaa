import { Router } from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser)

router.route("/login").post(loginUser);

// secured routes - meaning we verify JWT before allowing access to the routes api calls

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/currentuser").get(verifyJWT, getCurrentUser)

export default router;