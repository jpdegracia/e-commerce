import express, { Router } from 'express';
import { checkPermission, verifyToken } from '../middleware/authMiddleware';
import { addItemToCartBasket, getCartInfo, removeCartItems, updateCartItems } from '../controllers/cartController';


const router = Router();

router.post("/", verifyToken, checkPermission("cart_add"), addItemToCartBasket)
router.get("/", verifyToken, checkPermission("cart_read"), getCartInfo)
router.delete("/:productId", verifyToken, checkPermission("cart_delete"), removeCartItems)
router.put("/", verifyToken, checkPermission("cart_update"), updateCartItems)

export default router