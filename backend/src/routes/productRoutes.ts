import express, {Router} from 'express'
import { checkPermission, verifyToken } from '../middleware/authMiddleware';
import { deleteProduct, getAllProducts, getProductByID, getProductsByCategory, registerProduct, updateProduct } from '../controllers/productController';


const router = Router();

//public routes for viewing
router.get("/", getAllProducts)
router.get("/category/:id", getProductsByCategory)
router.get("/:id", getProductByID)


//private for admin
router.post("/", verifyToken, checkPermission("product_create"), registerProduct)
router.put("/:id", verifyToken, checkPermission("product_update"), updateProduct)
router.delete("/:id", verifyToken, checkPermission("product_delete"), deleteProduct)

export default router