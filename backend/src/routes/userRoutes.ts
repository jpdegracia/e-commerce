import express, { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/userController"
import { checkPermission, verifyToken } from "../middleware/authMiddleware";


const router = Router();

//admin power routes
router.post("/", verifyToken, checkPermission("user_create"), createUser)
router.get("/", verifyToken, checkPermission("user_read_all"), getAllUsers)
router.get("/:id", verifyToken, checkPermission("user_read"), getUserById)
router.put("/:id", verifyToken, checkPermission("user_update"), updateUser)
router.delete("/:id", verifyToken, checkPermission("user_delete"), deleteUser)




export default router;