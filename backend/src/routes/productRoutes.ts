import express, {Router} from 'express'
import { checkPermission, verifyToken } from '../middleware/authMiddleware';
import { deleteProduct, getAllProducts, getProductByID, registerProduct, updateProduct } from '../controllers/productController';


const router = Router();

router.post("/", verifyToken, checkPermission("product_create"), registerProduct)
router.get("/", verifyToken, checkPermission("product_read_all"), getAllProducts)
router.get("/:id", verifyToken, checkPermission("product_read"), getProductByID)
router.put("/:id", verifyToken, checkPermission("product_update"), updateProduct)
router.delete("/:id", verifyToken, checkPermission("product_delete"), deleteProduct)

export default router