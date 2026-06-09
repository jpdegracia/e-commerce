import { Express, Router } from "express";
import { checkPermission, verifyToken } from "../middleware/authMiddleware";
import { createCategory, deleteCategory, getAllCategory, getCategoryByID, updateCategory } from "../controllers/categoryController";


const router = Router();

router.post('/', verifyToken, checkPermission("category_create"), createCategory)
router.get('/', verifyToken, checkPermission("category_read"), getAllCategory)
router.get('/:id', verifyToken, checkPermission("category_read_all"), getCategoryByID)
router.put('/:id', verifyToken, checkPermission("category_update"), updateCategory)
router.delete('/:id', verifyToken, checkPermission("category_delete"), deleteCategory)

export default router;