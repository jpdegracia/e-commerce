import express, { Router } from 'express';
import { createRole, deleteRole, getAllRoles, getRoleByID, updateRole } from '../controllers/roleController';
import { checkPermission, verifyToken } from '../middleware/authMiddleware';

const router = Router()

router.post("/", verifyToken, checkPermission("role_create"), createRole)
router.get("/", verifyToken, checkPermission("role_read_all"), getAllRoles)
router.get("/:id", verifyToken, checkPermission("role_read"), getRoleByID)
router.put("/:id", verifyToken, checkPermission("role_update"), updateRole)
router.delete("/:id", verifyToken, checkPermission("role_delete"), deleteRole);

export default router