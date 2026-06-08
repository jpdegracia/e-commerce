import express, { Router } from 'express';
import { createPermissions, deletePermission, getAllPermissions, getPermissionByID, updatedPermission } from '../controllers/permissionController';
import { checkPermission, verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post("/", verifyToken, checkPermission("permission_create"), createPermissions)
router.get("/", verifyToken, checkPermission("permission_read_all"),  getAllPermissions)
router.get("/:id", verifyToken, checkPermission("permission_read"),  getPermissionByID)
router.put("/:id", verifyToken, checkPermission("permission_update"),  updatedPermission)
router.delete("/:id", verifyToken, checkPermission("permission_delete"),  deletePermission)

export default router