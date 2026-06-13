import express, { Router } from "express";
import { authRegisterUser, forgotPassword, login, logout, resetPassword, verifyEmail } from "../controllers/authController";

const router = Router();

router.post("/register", authRegisterUser)
router.post("/login", login)
router.post("/logout", logout)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router