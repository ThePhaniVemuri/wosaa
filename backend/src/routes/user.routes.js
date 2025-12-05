import { Router } from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { chatRoomLogic } from "../controllers/chat.controller.js";

const router = Router();

router.post("/register", registerUser)

router.post("/login", loginUser)

// secured routes - meaning we verify JWT before allowing access to the routes api calls

router.post("/logout", verifyJWT, logoutUser)
router.post("/refresh-token", refreshAccessToken)
router.get("/currentuser", verifyJWT, getCurrentUser)

router.post("/get-or-create-chat-room", verifyJWT, chatRoomLogic)

export default router;