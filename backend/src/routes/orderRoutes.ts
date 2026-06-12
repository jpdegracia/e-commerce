import { Router } from "express";
import { checkPermission, verifyToken } from "../middleware/authMiddleware";
import { getAllOrders, getOrderHistory, placeOrder } from "../controllers/orderController";



const router = Router()

router.post("/checkout", verifyToken, checkPermission("order_create"), placeOrder)
router.get("/history", verifyToken, checkPermission("order_all"), getOrderHistory)
router.get("/all", verifyToken, checkPermission("order_all"), getAllOrders)

export default router