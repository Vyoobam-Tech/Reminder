import express from "express";
import { signup, signin, googleLogin, getProfile, forgotPassword, resetPassword, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", googleLogin);
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", logout);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;
