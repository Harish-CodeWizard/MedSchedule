import { registerUser,verifyEmail,login, getUserProfile, logout, forgotPassword, verifyForgot, newPassword, updateUserProfile, getAllUsers, getUserById } from "../controllers/userController.js";
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);
router.get("/me",authenticateUser, getUserProfile);
router.get("/getAllUsers",authenticateUser, getAllUsers);
router.get("/logout",authenticateUser, logout);
router.post("/forgot", forgotPassword);
router.post("/verifyForgot", verifyForgot);
router.post("/newPassword", newPassword);
router.put("/update-profile", authenticateUser, updateUserProfile);
router.get("/:id",authenticateUser, getUserById);


export default router;